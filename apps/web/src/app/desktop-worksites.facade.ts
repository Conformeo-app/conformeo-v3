import { DestroyRef, Injectable, inject } from "@angular/core";
import type {
  MembershipAccess,
  ModuleAccessLevel,
  OrganizationSiteRecord,
  OrganizationSiteLocationEnrichmentErrorReason,
  OrganizationSiteType,
  WorksiteCoordinationStatus,
    WorksiteCoordinationUpdateRequest,
    WorksiteDocumentRecord,
    WorksiteEquipmentCreateRequest,
    WorksiteEquipmentMovementCreateRequest,
    WorksiteEquipmentMovementType,
    WorksiteEquipmentStatus,
    WorksiteInterventionCreateRequest,
    WorksiteInterventionResult,
    WorksiteInterventionStatus,
    WorksiteTeamMemberAddRequest,
    WorksiteTeamRecord,
    WorksiteStatus,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, shareReplay } from "rxjs";

import { ApiClientError } from "./api-error";
import { canActOnModule, canReadModule, getModuleAccessLevel } from "./desktop-access.utils";
import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import type {
    DesktopWorksiteCoordinationVm,
    DesktopWorksiteClosureVm,
    DesktopWorksiteDetailVm,
    DesktopWorksiteDocumentItem,
    DesktopWorksiteEquipmentItem,
    DesktopWorksiteEquipmentParkItem,
    DesktopWorksiteEquipmentParkSummary,
    DesktopWorksiteEquipmentMovementItem,
    DesktopWorksiteEquipmentSummary,
    DesktopWorksiteInterventionItem,
    DesktopWorksiteListItem,
    DesktopWorksitePlanningVm,
    DesktopWorksiteProofItem,
    DesktopWorksiteSignatureItem,
    DesktopWorksiteSiteEnrichmentState,
    DesktopWorksiteStatusOption,
  DesktopWorksitesModuleState,
  DesktopWorksitesModuleSummary,
} from "./desktop-worksites.models";
import {
    addWorksiteTeamMember,
    createWorksiteEquipment,
    createWorksiteIntervention,
    createWorksite,
    downloadGeneratedWorksiteDocument,
    downloadWorksitePreventionPlanPdf,
    downloadWorksiteSummaryPdf,
  listOrganizationSites,
  listWorksiteAssignees,
  listWorksiteDocuments,
  listWorksiteEquipments,
  listWorksiteEquipmentMovements,
  listWorksiteProofs,
  listWorksiteSignatures,
  listWorksiteTeams,
  listWorksites,
    recordWorksiteEquipmentMovement,
    updateWorksiteCoordination,
    updateWorksiteIntervention,
    updateWorksiteStatus as persistWorksiteStatus,
} from "./organization-client";

const INITIAL_STATE: DesktopWorksitesModuleState = {
  worksites: [],
  sites: [],
  teams: [],
  documents: [],
  proofs: [],
  signatures: [],
  equipments: [],
  equipmentMovements: [],
  assignees: [],
};

@Injectable()
export class DesktopWorksitesFacade {
  private readonly shell = inject(DESKTOP_SHELL_CONTEXT);
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stateSubject = new BehaviorSubject<DesktopWorksitesModuleState>(INITIAL_STATE);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly savingSubject = new BehaviorSubject<boolean>(false);
  private readonly noticeSubject = new BehaviorSubject<string>("");
  private readonly errorSubject = new BehaviorSubject<string>("");
  private readonly summaryPdfBusyIdSubject = new BehaviorSubject<string | null>(null);
  private readonly preventionPdfBusyIdSubject = new BehaviorSubject<string | null>(null);
  private readonly documentBusyIdSubject = new BehaviorSubject<string | null>(null);
  private readonly equipmentBusyIdSubject = new BehaviorSubject<string | null>(null);

  readonly state$ = this.stateSubject.asObservable();
  readonly loading$ = this.loadingSubject.asObservable();
  readonly saving$ = this.savingSubject.asObservable();
  readonly notice$ = this.noticeSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();
  readonly summaryPdfBusyId$ = this.summaryPdfBusyIdSubject.asObservable();
  readonly preventionPdfBusyId$ = this.preventionPdfBusyIdSubject.asObservable();
  readonly documentBusyId$ = this.documentBusyIdSubject.asObservable();
  readonly equipmentBusyId$ = this.equipmentBusyIdSubject.asObservable();

  readonly worksiteStatusOptions: DesktopWorksiteStatusOption[] = [
    { value: "planned", label: "Planifié", tone: "calm" },
    { value: "in_progress", label: "En cours", tone: "progress" },
    { value: "blocked", label: "Bloqué", tone: "danger" },
    { value: "completed", label: "Terminé", tone: "success" },
  ];

  readonly listItems$ = this.state$.pipe(
    map((state) =>
      state.worksites
        .map((worksite) => this.buildListItem(state, worksite))
        .sort((left, right) => {
          if (left.actionRank !== right.actionRank) {
            return left.actionRank - right.actionRank;
          }
          return left.item.name.localeCompare(right.item.name);
        })
        .map((entry) => entry.item),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly moduleSummary$ = this.state$.pipe(
    map((state): DesktopWorksitesModuleSummary => {
      const total = state.worksites.length;
      const blocked = state.worksites.filter((worksite) => worksite.status === "blocked").length;
      const planned = state.worksites.filter((worksite) => worksite.status === "planned").length;
      const active = state.worksites.filter((worksite) => worksite.status === "in_progress").length;
      const actionableStates = state.worksites.map((worksite) => {
        const linkedSite = this.findSite(state, worksite.site_id ?? null);
        const linkedDocuments = this.getWorksiteDocuments(state, worksite.id);
        const linkedProofs = this.getWorksiteProofs(state, worksite.id);
        const linkedSignatures = this.getWorksiteSignatures(state, worksite.id);
        const coordinationTeam = this.findTeam(state, worksite.coordination.team_id ?? null);
        const interventions = this.mapInterventionItems(state, worksite, coordinationTeam);
        const planning = this.buildPlanningState(worksite, interventions);
        const linkedEquipments = this.getWorksiteEquipments(state, worksite.id).map((equipment) =>
          this.mapEquipmentItem(state, equipment),
        );
        const recentEquipmentMovements = this.getWorksiteEquipmentMovements(state, worksite.id)
          .slice(0, 2)
          .map((movement) => this.mapEquipmentMovementItem(movement));

        return this.buildActionableState(
          worksite,
          linkedSite,
          linkedDocuments.length,
          linkedProofs.length,
          linkedSignatures.length,
          coordinationTeam,
          linkedEquipments,
          recentEquipmentMovements,
          planning,
        );
      });
      const nowCount = actionableStates.filter((entry) => entry.actionItems.length > 0).length;
      const watchCount = actionableStates.filter((entry) =>
        entry.blockingItems.length === 0 && entry.actionItems.length === 0 && entry.watchItems.length > 0
      ).length;
      const controlCount = actionableStates.filter((entry) =>
        entry.blockingItems.length === 0 && entry.actionItems.length === 0 && entry.watchItems.length === 0
      ).length;

      return {
        total,
        totalLabel: total > 0 ? `${total} chantier${total > 1 ? "s" : ""}` : "Aucun chantier",
        activeLabel: active > 0 ? `${active} en cours` : "Aucun en cours",
        blockedLabel: blocked > 0 ? `${blocked} bloqué${blocked > 1 ? "s" : ""}` : "Aucun bloqué",
        plannedLabel: planned > 0 ? `${planned} à préparer` : "Aucun à préparer",
        nowLabel:
          nowCount > 0
            ? `${nowCount} priorité${nowCount > 1 ? "s" : ""} immédiate${nowCount > 1 ? "s" : ""}`
            : "Aucune priorité immédiate",
        watchLabel: watchCount > 0 ? `${watchCount} à vérifier` : "Rien à vérifier",
        controlLabel: controlCount > 0 ? `${controlCount} sous contrôle` : "Aucun sous contrôle",
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly sites$ = this.state$.pipe(
    map((state) => [...state.sites].sort((left, right) => left.name.localeCompare(right.name))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly teams$ = this.state$.pipe(
    map((state) => [...state.teams].sort((left, right) => left.name.localeCompare(right.name))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly equipmentParkItems$ = this.state$.pipe(
    map((state) =>
      state.equipments
        .map((equipment) => this.mapEquipmentParkItem(state, equipment))
        .sort((left, right) => {
          const leftRank = left.needsAttention ? 0 : left.isAssigned ? 2 : 1;
          const rightRank = right.needsAttention ? 0 : right.isAssigned ? 2 : 1;
          if (leftRank !== rightRank) {
            return leftRank - rightRank;
          }
          return left.name.localeCompare(right.name);
        }),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly equipmentParkSummary$ = this.equipmentParkItems$.pipe(
    map((items): DesktopWorksiteEquipmentParkSummary => {
      const total = items.length;
      const assigned = items.filter((item) => item.isAssigned).length;
      const available = items.filter((item) => !item.isAssigned && !item.needsAttention).length;
      const attention = items.filter((item) => item.needsAttention).length;

      return {
        totalLabel: total > 0 ? `${total} équipement${total > 1 ? "s" : ""}` : "Aucun équipement",
        availableLabel: available > 0 ? `${available} disponible${available > 1 ? "s" : ""}` : "Aucun disponible",
        assignedLabel: assigned > 0 ? `${assigned} affecté${assigned > 1 ? "s" : ""}` : "Aucun affecté",
        attentionLabel: attention > 0 ? `${attention} à vérifier` : "Aucun signal matériel",
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly assignees$ = this.state$.pipe(
    map((state) => [...state.assignees].sort((left, right) => left.display_name.localeCompare(right.display_name))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly canActOnChantiers$ = this.sessionState.snapshot$.pipe(
    map(() => this.canActOnChantiers),
    distinctUntilChanged(),
  );

  readonly canReadUsers$ = this.sessionState.snapshot$.pipe(
    map(() => this.canReadUsers),
    distinctUntilChanged(),
  );

  constructor() {
    this.sessionState.snapshot$
      .pipe(
        map((snapshot) => ({
          accessToken: snapshot.accessToken,
          organizationId: snapshot.organizationId,
          membership: snapshot.session?.current_membership ?? null,
        })),
        distinctUntilChanged(
          (left, right) =>
            left.accessToken === right.accessToken
            && left.organizationId === right.organizationId
            && left.membership === right.membership
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ accessToken, organizationId }) => {
        if (!accessToken || !organizationId || !this.isChantierEnabled) {
          this.stateSubject.next(INITIAL_STATE);
          return;
        }
        void this.loadWorkspace(accessToken, organizationId);
      });
  }

  get currentOrganizationName(): string {
    return this.shell.currentMembership?.organization.name ?? "Organisation";
  }

  get currentUserLabel(): string {
    return this.shell.session?.user.display_name || this.shell.session?.user.email || "Utilisateur";
  }

  get currentMembership(): MembershipAccess | null {
    return this.shell.currentMembership;
  }

  get isChantierEnabled(): boolean {
    return canReadModule(this.currentMembership, "chantier");
  }

  get chantierAccessLevel(): ModuleAccessLevel {
    return getModuleAccessLevel(this.currentMembership, "chantier");
  }

  get canActOnChantiers(): boolean {
    return canActOnModule(this.currentMembership, "chantier");
  }

  get canManageOrganization(): boolean {
    return this.canActOnChantiers;
  }

  get canReadUsers(): boolean {
    return this.isChantierEnabled;
  }

  get isWorkspaceReady(): boolean {
    return Boolean(this.sessionState.accessToken && this.sessionState.organizationId);
  }

  detail$(worksiteId$: import("rxjs").Observable<string | null>) {
    return combineLatest([this.state$, worksiteId$]).pipe(
      map(([state, worksiteId]) => this.buildDetailVm(state, worksiteId)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  async refresh(): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.isChantierEnabled) {
      return;
    }
    await this.loadWorkspace(accessToken, organizationId);
  }

  async createWorksite(payload: {
    name: string;
    siteId: string;
    status: WorksiteStatus;
    description: string;
  }): Promise<string | null> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return null;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");

    try {
      const created = await createWorksite(accessToken, organizationId, {
        name: payload.name.trim(),
        site_id: payload.siteId || null,
        status: payload.status,
        description: this.normalizeOptionalText(payload.description),
      });
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next(`Chantier ${created.name} créé.`);
      return created.id;
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "save"));
      return null;
    } finally {
      this.savingSubject.next(false);
    }
  }

  async createEquipment(payload: WorksiteEquipmentCreateRequest & {
    assignToWorksiteId?: string | null;
  }): Promise<string | null> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return null;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");

    try {
      const created = await createWorksiteEquipment(accessToken, organizationId, {
        name: payload.name.trim(),
        type: payload.type.trim(),
        status: payload.status,
      });

      if (payload.assignToWorksiteId) {
        await recordWorksiteEquipmentMovement(accessToken, organizationId, payload.assignToWorksiteId, {
          equipment_id: created.id,
          movement_type: "assigned_to_worksite",
          resulting_status: payload.status,
        });
      }

      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next(
        payload.assignToWorksiteId
          ? `Équipement ${created.name} créé et affecté au chantier.`
          : `Équipement ${created.name} créé.`,
      );
      return created.id;
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "save"));
      return null;
    } finally {
      this.savingSubject.next(false);
    }
  }

  async downloadSummaryPdf(worksiteId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.summaryPdfBusyIdSubject.next(worksiteId);
    this.errorSubject.next("");
    this.noticeSubject.next("Fiche chantier PDF en préparation.");
    try {
      const { blob, fileName } = await downloadWorksiteSummaryPdf(accessToken, organizationId, worksiteId);
      this.downloadBlob(blob, fileName);
      this.noticeSubject.next("Fiche chantier PDF générée.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "export"));
    } finally {
      this.summaryPdfBusyIdSubject.next(null);
    }
  }

  async downloadPreventionPlanPdf(worksiteId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.preventionPdfBusyIdSubject.next(worksiteId);
    this.errorSubject.next("");
    this.noticeSubject.next("Plan de prévention en préparation.");
    try {
      const { blob, fileName } = await downloadWorksitePreventionPlanPdf(accessToken, organizationId, worksiteId);
      this.downloadBlob(blob, fileName);
      this.noticeSubject.next("Plan de prévention PDF généré.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "export"));
    } finally {
      this.preventionPdfBusyIdSubject.next(null);
    }
  }

  async downloadDocument(documentId: string): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId) {
      return;
    }

    this.documentBusyIdSubject.next(documentId);
    this.errorSubject.next("");
    this.noticeSubject.next("Document chantier en préparation.");
    try {
      const { blob, fileName } = await downloadGeneratedWorksiteDocument(accessToken, organizationId, documentId);
      this.downloadBlob(blob, fileName);
      this.noticeSubject.next("Document chantier téléchargé.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "export"));
    } finally {
      this.documentBusyIdSubject.next(null);
    }
  }

  async updateCoordination(
    worksiteId: string,
    payload: WorksiteCoordinationUpdateRequest,
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      await updateWorksiteCoordination(accessToken, organizationId, worksiteId, payload);
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next("Coordination chantier mise à jour.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "update"));
    } finally {
      this.savingSubject.next(false);
    }
  }

  async updateWorksiteStatus(
    worksiteId: string,
    status: WorksiteStatus,
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      await persistWorksiteStatus(accessToken, organizationId, worksiteId, { status });
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next(status === "completed" ? "Chantier clôturé." : "Statut chantier mis à jour.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "update"));
    } finally {
      this.savingSubject.next(false);
    }
  }

  async addMemberToTeam(
    teamId: string,
    payload: WorksiteTeamMemberAddRequest,
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      const updatedTeam = await addWorksiteTeamMember(accessToken, organizationId, teamId, payload);
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next(`Membre ajouté à ${updatedTeam.name}.`);
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "update"));
    } finally {
      this.savingSubject.next(false);
    }
  }

  async createIntervention(
    worksiteId: string,
    payload: WorksiteInterventionCreateRequest,
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      await createWorksiteIntervention(accessToken, organizationId, worksiteId, payload);
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next("Intervention chantier enregistrée.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "save"));
    } finally {
      this.savingSubject.next(false);
    }
  }

  async updateIntervention(
    interventionId: string,
    payload: {
      status?: WorksiteInterventionStatus;
      scheduled_for?: string | null;
      completed_at?: string | null;
      result?: WorksiteInterventionResult | null;
      assignee_user_id?: string | null;
      team_id?: string | null;
      notes?: string | null;
      report_comment?: string | null;
      follow_up_note?: string | null;
    },
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      await updateWorksiteIntervention(accessToken, organizationId, interventionId, payload);
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next("Intervention chantier mise à jour.");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "update"));
    } finally {
      this.savingSubject.next(false);
    }
  }

  async recordEquipmentMovement(
    worksiteId: string,
    payload: WorksiteEquipmentMovementCreateRequest,
  ): Promise<void> {
    const accessToken = this.sessionState.accessToken;
    const organizationId = this.sessionState.organizationId;
    if (!accessToken || !organizationId || !this.canActOnChantiers) {
      return;
    }

    this.savingSubject.next(true);
    this.equipmentBusyIdSubject.next(payload.equipment_id);
    this.errorSubject.next("");
    this.noticeSubject.next("");
    try {
      await recordWorksiteEquipmentMovement(accessToken, organizationId, worksiteId, payload);
      await this.loadWorkspace(accessToken, organizationId);
      this.noticeSubject.next(this.buildEquipmentMovementNotice(payload.movement_type, payload.resulting_status));
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "update"));
    } finally {
      this.savingSubject.next(false);
      this.equipmentBusyIdSubject.next(null);
    }
  }

  clearFeedback(): void {
    this.noticeSubject.next("");
    this.errorSubject.next("");
  }

  private async loadWorkspace(accessToken: string, organizationId: string): Promise<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next("");
    try {
      const [sites, worksites, teams, documents, proofs, signatures, equipments, equipmentMovements, assignees] = await Promise.all([
        listOrganizationSites(accessToken, organizationId),
        listWorksites(accessToken, organizationId),
        listWorksiteTeams(accessToken, organizationId),
        listWorksiteDocuments(accessToken, organizationId),
        listWorksiteProofs(accessToken, organizationId),
        listWorksiteSignatures(accessToken, organizationId),
        listWorksiteEquipments(accessToken, organizationId),
        listWorksiteEquipmentMovements(accessToken, organizationId),
        listWorksiteAssignees(accessToken, organizationId),
      ]);

      this.stateSubject.next({
        worksites,
        sites,
        teams,
        documents,
        proofs,
        signatures,
        equipments,
        equipmentMovements,
        assignees,
      });
      this.noticeSubject.next("");
    } catch (error) {
      this.errorSubject.next(this.toErrorMessage(error, "load"));
    } finally {
      this.loadingSubject.next(false);
    }
  }

  private buildListItem(
    state: DesktopWorksitesModuleState,
    worksite: DesktopWorksiteDetailVm["raw"],
  ): { item: DesktopWorksiteListItem; actionRank: number } {
    const linkedSite = this.findSite(state, worksite.site_id ?? null);
    const linkedDocuments = this.getWorksiteDocuments(state, worksite.id);
    const linkedProofs = this.getWorksiteProofs(state, worksite.id);
    const linkedSignatures = this.getWorksiteSignatures(state, worksite.id);
    const coordinationTeam = this.findTeam(state, worksite.coordination.team_id ?? null);
    const interventions = this.mapInterventionItems(state, worksite, coordinationTeam);
    const planning = this.buildPlanningState(worksite, interventions);
    const linkedEquipments = this.getWorksiteEquipments(state, worksite.id).map((equipment) =>
      this.mapEquipmentItem(state, equipment),
    );
    const recentEquipmentMovements = this.getWorksiteEquipmentMovements(state, worksite.id)
      .slice(0, 2)
      .map((movement) => this.mapEquipmentMovementItem(movement));
    const actionableState = this.buildActionableState(
      worksite,
      linkedSite,
      linkedDocuments.length,
      linkedProofs.length,
      linkedSignatures.length,
      coordinationTeam,
      linkedEquipments,
      recentEquipmentMovements,
      planning,
    );
    const completionState = this.buildCompletionState(
      worksite,
      linkedSite,
      linkedDocuments.length,
      linkedProofs.length,
      linkedSignatures.length,
      coordinationTeam,
      linkedEquipments,
      actionableState.blockingItems.length,
    );

    return {
      actionRank: actionableState.actionRank,
      item: {
        id: worksite.id,
        actionRank: actionableState.actionRank,
        name: worksite.name,
        siteId: linkedSite?.id ?? worksite.site_id ?? null,
        statusLabel: this.getWorksiteStatusLabel(worksite.status),
        statusTone: this.getWorksiteStatusTone(worksite.status),
        globalStateLabel: actionableState.globalStateLabel,
        globalStateTone: actionableState.globalStateTone,
        summary: linkedSite
          ? `${linkedSite.name}${linkedSite.address ? ` · ${linkedSite.address}` : ""}`
          : worksite.address || "Aucun site relié pour le moment.",
        temporalLabel: this.buildTemporalLabel(worksite),
        siteName: linkedSite?.name ?? worksite.site_name ?? null,
        primarySignalLabel: actionableState.primarySignalLabel,
        primarySignalTone: actionableState.primarySignalTone,
        primarySignalDetail: actionableState.primarySignalDetail,
        issueSummaryLabel: actionableState.issueSummaryLabel,
        nextActionLabel: actionableState.nextActionLabel,
        nextActionDetail: actionableState.primaryActionDetail,
        planningLabel: planning.statusLabel,
        planningTone: planning.statusTone,
        nextInterventionLabel: planning.nextInterventionLabel,
        nextInterventionDetail:
          planning.lastInterventionLabel && planning.nextInterventionLabel === planning.lastInterventionLabel && planning.lastInterventionResultLabel
            ? `${planning.lastInterventionResultLabel} · ${planning.lastInterventionTimingLabel || planning.nextInterventionTimingLabel}`
            : `${planning.nextInterventionStatusLabel} · ${planning.nextInterventionTimingLabel}`,
        completionLabel: completionState.statusLabel,
        completionTone: completionState.statusTone,
      },
    };
  }

  private buildDetailVm(
    state: DesktopWorksitesModuleState,
    worksiteId: string | null,
  ): DesktopWorksiteDetailVm | null {
    const selectedWorksite =
      (worksiteId ? state.worksites.find((entry) => entry.id === worksiteId) : state.worksites[0]) ?? null;

    if (!selectedWorksite) {
      return null;
    }

    const linkedSite = this.findSite(state, selectedWorksite.site_id ?? null);
    const documents = this.getWorksiteDocuments(state, selectedWorksite.id).map((document) => this.mapDocumentItem(document));
    const proofs = this.getWorksiteProofs(state, selectedWorksite.id).map((proof) => this.mapProofItem(proof));
    const signatures = this.getWorksiteSignatures(state, selectedWorksite.id).map((signature) => this.mapSignatureItem(signature));
    const coordinationTeam = this.findTeam(state, selectedWorksite.coordination.team_id ?? null);
    const interventions = this.mapInterventionItems(state, selectedWorksite, coordinationTeam);
    const planning = this.buildPlanningState(selectedWorksite, interventions);
    const equipments = this.getWorksiteEquipments(state, selectedWorksite.id).map((equipment) =>
      this.mapEquipmentItem(state, equipment),
    );
    const recentEquipmentMovements = this.getWorksiteEquipmentMovements(state, selectedWorksite.id)
      .slice(0, 4)
      .map((movement) => this.mapEquipmentMovementItem(movement));
    const actionableState = this.buildActionableState(
      selectedWorksite,
      linkedSite,
      documents.length,
      proofs.length,
      signatures.length,
      coordinationTeam,
      equipments,
      recentEquipmentMovements,
      planning,
    );
    const completionState = this.buildCompletionState(
      selectedWorksite,
      linkedSite,
      documents.length,
      proofs.length,
      signatures.length,
      coordinationTeam,
      equipments,
      actionableState.blockingItems.length,
    );
    const equipmentSummary = this.buildEquipmentSummary(
      state,
      selectedWorksite,
      equipments,
      recentEquipmentMovements,
    );

    return {
      id: selectedWorksite.id,
      isPersisted: this.isPersistedWorksite(selectedWorksite),
      name: selectedWorksite.name,
      description: selectedWorksite.description ?? null,
      statusLabel: this.getWorksiteStatusLabel(selectedWorksite.status),
      statusTone: this.getWorksiteStatusTone(selectedWorksite.status),
      globalStateLabel: actionableState.globalStateLabel,
      globalStateTone: actionableState.globalStateTone,
      summary: actionableState.operationalSummary,
      temporalLabel: this.buildTemporalLabel(selectedWorksite),
      siteName: linkedSite?.name ?? selectedWorksite.site_name ?? null,
      siteAddress: linkedSite?.address ?? (selectedWorksite.address || null),
      siteTypeLabel: linkedSite ? this.getSiteTypeLabel(linkedSite.site_type) : null,
      siteEnrichmentState: linkedSite ? this.getSiteEnrichmentState(linkedSite) : null,
      preparationLabel: actionableState.preparationLabel,
      preparationTone: actionableState.preparationTone,
      vigilanceLabel: actionableState.vigilanceLabel,
      vigilanceTone: actionableState.vigilanceTone,
      primarySignalLabel: actionableState.primarySignalLabel,
      primarySignalTone: actionableState.primarySignalTone,
      primarySignalDetail: actionableState.primarySignalDetail,
      issueSummaryLabel: actionableState.issueSummaryLabel,
      primaryActionDetail: actionableState.primaryActionDetail,
      documentsCountLabel: documents.length > 0 ? `${documents.length} document${documents.length > 1 ? "s" : ""}` : "Aucun document",
      proofsCountLabel: proofs.length > 0 ? `${proofs.length} preuve${proofs.length > 1 ? "s" : ""}` : "Aucune preuve",
      signaturesCountLabel: signatures.length > 0 ? `${signatures.length} signature${signatures.length > 1 ? "s" : ""}` : "Aucune signature",
      blockingItems: actionableState.blockingItems,
      actionItems: actionableState.actionItems,
      watchItems: actionableState.watchItems,
      availableItems: actionableState.availableItems,
      missingItems: actionableState.missingItems,
      nextActionLabel: actionableState.nextActionLabel,
      primaryActionLabel: actionableState.primaryActionLabel,
      primaryActionRoute: actionableState.primaryActionRoute,
      planning,
      closure: completionState,
      coordination: this.mapCoordinationVm(state, selectedWorksite.coordination, coordinationTeam),
      interventions,
      documents,
      proofs,
      signatures,
      equipments,
      recentEquipmentMovements,
      equipmentSummary,
      raw: selectedWorksite,
      linkedSite,
    };
  }

  private isPersistedWorksite(worksite: { is_persisted?: boolean }): boolean {
    return Boolean(worksite.is_persisted);
  }

  private findTeam(state: DesktopWorksitesModuleState, teamId: string | null): WorksiteTeamRecord | null {
    if (!teamId) {
      return null;
    }
    return state.teams.find((team) => team.id === teamId) ?? null;
  }

  private mapCoordinationVm(
    state: DesktopWorksitesModuleState,
    coordination: DesktopWorksiteDetailVm["raw"]["coordination"],
    linkedTeam: WorksiteTeamRecord | null,
  ): DesktopWorksiteCoordinationVm {
    const linkedAssignee = coordination.assignee_user_id
      ? state.assignees.find((assignee) => assignee.user_id === coordination.assignee_user_id)
      : null;
    const coverage = this.buildCoordinationCoverage(linkedTeam, coordination.assignee_user_id ?? null);
    const teamMembers =
      linkedTeam?.members
        .map((member) => ({
          userId: member.user_id,
          displayName: member.display_name,
          roleLabel: member.role_label,
        }))
        .sort((left, right) => left.displayName.localeCompare(right.displayName)) ?? [];

    return {
      status: coordination.status,
      statusLabel: this.getCoordinationStatusLabel(coordination.status),
      statusTone: this.getCoordinationStatusTone(coordination.status),
      teamId: linkedTeam?.id ?? coordination.team_id ?? null,
      teamName: linkedTeam?.name ?? coordination.team_name ?? "Aucune équipe affectée",
      teamDescription: linkedTeam?.description ?? null,
      teamMemberCountLabel: linkedTeam
        ? `${linkedTeam.member_count} membre${linkedTeam.member_count > 1 ? "s" : ""}`
        : "Aucune équipe",
      teamMembers,
      coverageLabel: coverage.label,
      coverageTone: coverage.tone,
      coverageDetail: coverage.detail,
      missingItems: coverage.missingItems,
      assigneeUserId: coordination.assignee_user_id ?? "",
      assigneeLabel: linkedAssignee?.display_name || coordination.assignee_display_name || "Référent à définir",
      commentText: coordination.comment_text ?? "",
      updatedAtLabel: this.formatDateTime(coordination.updated_at),
    };
  }

  private buildCoordinationCoverage(
    team: WorksiteTeamRecord | null,
    assigneeUserId: string | null,
  ): { label: string; tone: CfmTone; detail: string; missingItems: string[] } {
    if (team === null) {
      return {
        label: "Équipe non affectée",
        tone: "warning",
        detail: "Aucune équipe n’est encore rattachée à ce chantier.",
        missingItems: ["Équipe chantier à affecter"],
      };
    }

    if (!assigneeUserId) {
      return {
        label: "Référent manquant",
        tone: "warning",
        detail: `${team.name} est affectée, mais le pilote chantier reste à définir.`,
        missingItems: ["Référent chantier à définir"],
      };
    }

    if (team.member_count < 2) {
      return {
        label: "Équipe partielle",
        tone: "progress",
        detail: `${team.name} est affectée, mais la couverture reste légère pour ce chantier.`,
        missingItems: ["Équipe chantier à compléter"],
      };
    }

    return {
      label: "Équipe prête",
      tone: "success",
      detail: `${team.name} est affectée avec un référent défini et une couverture lisible.`,
      missingItems: [],
    };
  }

  private mapDocumentItem(document: WorksiteDocumentRecord): DesktopWorksiteDocumentItem {
    return {
      id: document.id,
      worksiteId: document.worksite_id,
      title: document.document_type_label,
      fileName: document.file_name,
      typeLabel: document.document_type_label,
      lifecycleStatusLabel: document.lifecycle_status === "finalized" ? "Finalisé" : "Brouillon",
      lifecycleStatusTone: document.lifecycle_status === "finalized" ? "success" : "progress",
      technicalStatusLabel: this.getDocumentTechnicalStatusLabel(document.status),
      technicalStatusTone: this.getDocumentTechnicalStatusTone(document.status),
      uploadedAtLabel: this.formatDateTime(document.uploaded_at),
      notes: document.notes ?? null,
      linkedProofsSummary: document.linked_proofs.length > 0
        ? `${document.linked_proofs.length} preuve${document.linked_proofs.length > 1 ? "s" : ""}`
        : null,
      linkedSignatureLabel: document.linked_signature_label ?? null,
    };
  }

  private mapProofItem(proof: DesktopWorksitesModuleState["proofs"][number]): DesktopWorksiteProofItem {
    return {
      id: proof.id,
      worksiteId: proof.worksite_id,
      label: proof.label,
      fileName: proof.file_name,
      statusLabel: this.getDocumentTechnicalStatusLabel(proof.status),
      statusTone: this.getDocumentTechnicalStatusTone(proof.status),
      uploadedAtLabel: this.formatDateTime(proof.uploaded_at),
      notes: proof.notes ?? null,
    };
  }

  private mapSignatureItem(signature: DesktopWorksitesModuleState["signatures"][number]): DesktopWorksiteSignatureItem {
    return {
      id: signature.id,
      worksiteId: signature.worksite_id,
      label: signature.label,
      fileName: signature.file_name,
      statusLabel: this.getDocumentTechnicalStatusLabel(signature.status),
      statusTone: this.getDocumentTechnicalStatusTone(signature.status),
      uploadedAtLabel: this.formatDateTime(signature.uploaded_at),
    };
  }

  private mapEquipmentItem(
    state: DesktopWorksitesModuleState,
    equipment: DesktopWorksitesModuleState["equipments"][number],
  ): DesktopWorksiteEquipmentItem {
    const latestMovement = this.getLatestEquipmentMovement(state, equipment.id);
    return {
      id: equipment.id,
      worksiteId: equipment.worksite_id ?? null,
      worksiteName: equipment.worksite_name ?? null,
      name: equipment.name,
      typeLabel: equipment.type,
      statusLabel: this.getEquipmentStatusLabel(equipment.status),
      statusTone: this.getEquipmentStatusTone(equipment.status),
      signalLabel: this.getEquipmentSignalLabel(equipment),
      lastMovementLabel: latestMovement
        ? this.getEquipmentMovementLabel(latestMovement.movement_type, latestMovement.resulting_status)
        : (equipment.worksite_id ? "Affecté" : "Disponible"),
      lastMovementAtLabel: this.formatDateTime(latestMovement?.captured_at ?? null),
      actorLabel: latestMovement?.actor_display_name ?? null,
      raw: equipment,
    };
  }

  private mapEquipmentParkItem(
    state: DesktopWorksitesModuleState,
    equipment: DesktopWorksitesModuleState["equipments"][number],
  ): DesktopWorksiteEquipmentParkItem {
    const latestMovement = this.getLatestEquipmentMovement(state, equipment.id);
    const linkedWorksite = equipment.worksite_id
      ? state.worksites.find((worksite) => worksite.id === equipment.worksite_id) ?? null
      : null;
    const isAssigned = Boolean(equipment.worksite_id);
    const needsAttention = equipment.status === "attention" || equipment.status === "unavailable";

    return {
      id: equipment.id,
      name: equipment.name,
      typeLabel: equipment.type,
      statusLabel: this.getEquipmentStatusLabel(equipment.status),
      statusTone: this.getEquipmentStatusTone(equipment.status),
      assignmentLabel: isAssigned ? "Affecté" : "Disponible",
      assignmentTone: isAssigned ? "progress" : "calm",
      currentWorksiteId: equipment.worksite_id ?? null,
      currentWorksiteName: equipment.worksite_name ?? null,
      currentWorksiteStatusLabel: linkedWorksite ? this.getWorksiteStatusLabel(linkedWorksite.status) : null,
      currentWorksiteStatusTone: linkedWorksite ? this.getWorksiteStatusTone(linkedWorksite.status) : null,
      lastMovementLabel: latestMovement
        ? this.getEquipmentMovementLabel(latestMovement.movement_type, latestMovement.resulting_status)
        : (isAssigned ? "Affecté" : "Sans mouvement"),
      lastMovementAtLabel: this.formatDateTime(latestMovement?.captured_at ?? null),
      actorLabel: latestMovement?.actor_display_name ?? null,
      isAssigned,
      needsAttention,
      raw: equipment,
    };
  }

  private mapEquipmentMovementItem(
    movement: DesktopWorksitesModuleState["equipmentMovements"][number],
  ): DesktopWorksiteEquipmentMovementItem {
    return {
      id: movement.id,
      equipmentId: movement.equipment_id,
      equipmentName: movement.equipment_name,
      movementLabel: this.getEquipmentMovementLabel(movement.movement_type, movement.resulting_status),
      resultingStatusLabel: this.getEquipmentStatusLabel(movement.resulting_status),
      resultingStatusTone: this.getEquipmentStatusTone(movement.resulting_status),
      capturedAtLabel: this.formatDateTime(movement.captured_at),
      actorLabel: movement.actor_display_name || "Bureau",
      detail: this.getEquipmentMovementDetail(movement.movement_type, movement.resulting_status),
      raw: movement,
    };
  }

  private buildEquipmentSummary(
    state: DesktopWorksitesModuleState,
    worksite: DesktopWorksiteDetailVm["raw"],
    equipments: DesktopWorksiteEquipmentItem[],
    recentMovements: DesktopWorksiteEquipmentMovementItem[],
  ): DesktopWorksiteEquipmentSummary {
    const unavailableCount = equipments.filter((equipment) => equipment.raw.status === "unavailable").length;
    const attentionCount = equipments.filter((equipment) => equipment.raw.status === "attention").length;
    const availableOptions = state.equipments
      .filter((equipment) => equipment.worksite_id !== worksite.id && equipment.status !== "unavailable")
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((equipment) => ({
        id: equipment.id,
        label: equipment.name,
        supportLabel: equipment.worksite_name
          ? `${equipment.type} · actuellement ${equipment.worksite_name}`
          : `${equipment.type} · disponible`,
      }));

    if (!this.isPersistedWorksite(worksite)) {
      return {
        totalCount: equipments.length,
        totalLabel: equipments.length > 0 ? `${equipments.length} équipement${equipments.length > 1 ? "s" : ""}` : "Aucun équipement",
        statusLabel: "Lecture seule",
        statusTone: "calm",
        attentionLabel: "Disponible sur chantier créé",
        nextActionLabel: "Créer un chantier réel",
        recentMovementLabel: recentMovements[0]
          ? `${recentMovements[0].movementLabel} · ${recentMovements[0].equipmentName}`
          : "Aucun mouvement",
        availableOptions: [],
      };
    }

    let statusLabel = "Parc prêt";
    let statusTone: CfmTone = "success";
    if (equipments.length === 0) {
      statusLabel = "À affecter";
      statusTone = "warning";
    } else if (unavailableCount > 0) {
      statusLabel = `${unavailableCount} indisponible${unavailableCount > 1 ? "s" : ""}`;
      statusTone = "danger";
    } else if (attentionCount > 0) {
      statusLabel = `${attentionCount} en attention`;
      statusTone = "progress";
    }

    return {
      totalCount: equipments.length,
      totalLabel: equipments.length > 0 ? `${equipments.length} équipement${equipments.length > 1 ? "s" : ""}` : "Aucun équipement",
      statusLabel,
      statusTone,
      attentionLabel:
        unavailableCount > 0
          ? `${unavailableCount} indisponible${unavailableCount > 1 ? "s" : ""}`
          : attentionCount > 0
            ? `${attentionCount} à vérifier`
            : "Aucun signal matériel",
      nextActionLabel:
        equipments.length === 0
          ? "Affecter un équipement"
          : unavailableCount > 0
            ? "Retirer l’indisponible"
            : attentionCount > 0
              ? "Vérifier les équipements"
              : "Consulter les mouvements",
      recentMovementLabel: recentMovements[0]
        ? `${recentMovements[0].movementLabel} · ${recentMovements[0].equipmentName}`
        : "Aucun mouvement récent",
      availableOptions,
    };
  }

  private mapInterventionItems(
    state: DesktopWorksitesModuleState,
    worksite: DesktopWorksiteDetailVm["raw"],
    linkedTeam: WorksiteTeamRecord | null,
  ): DesktopWorksiteInterventionItem[] {
    const coordinationAssignee = worksite.coordination.assignee_user_id
      ? state.assignees.find((assignee) => assignee.user_id === worksite.coordination.assignee_user_id)
      : null;
    const sorted = [...worksite.interventions].sort((left, right) => {
      const leftRank = this.getInterventionSortRank(left);
      const rightRank = this.getInterventionSortRank(right);
      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }
      return (left.scheduled_for ?? left.created_at).localeCompare(right.scheduled_for ?? right.created_at);
    });

    return sorted.map((intervention) => {
      const isOverdue = this.isInterventionOverdue(intervention);
      const teamLabel = intervention.team_name || linkedTeam?.name || worksite.coordination.team_name || "Équipe à préciser";
      const assigneeLabel =
        intervention.assignee_display_name
        || coordinationAssignee?.display_name
        || worksite.coordination.assignee_display_name
        || "Référent à définir";
      const resultCode = intervention.result ?? null;
      const resultLabel = resultCode ? this.getInterventionResultLabel(resultCode) : null;
      const resultTone = resultCode ? this.getInterventionResultTone(resultCode) : null;
      const resultDetail = this.getInterventionResultDetail(intervention);

      return {
        id: intervention.id,
        typeLabel: this.getInterventionTypeLabel(intervention.intervention_type),
        statusLabel: this.getInterventionStatusLabel(intervention),
        statusTone: this.getInterventionStatusTone(intervention),
        resultCode,
        resultLabel,
        resultTone,
        resultDetail,
        scheduledForLabel: this.getInterventionTimingLabel(intervention),
        assigneeLabel,
        teamLabel,
        completedAtLabel: intervention.completed_at ? this.formatDateTime(intervention.completed_at) : null,
        detail: resultDetail || intervention.notes?.trim() || `${teamLabel} · ${assigneeLabel}`,
        isOverdue,
        isDone: intervention.status === "done",
        isCanceled: intervention.status === "canceled",
        raw: intervention,
      };
    });
  }

  private buildPlanningState(
    worksite: DesktopWorksiteDetailVm["raw"],
    interventions: DesktopWorksiteInterventionItem[],
  ): DesktopWorksitePlanningVm {
    const isPersisted = this.isPersistedWorksite(worksite);
    const openItems = interventions.filter((item) => !item.isDone && !item.isCanceled);
    const overdueItems = openItems.filter((item) => item.isOverdue);
    const toScheduleItems = openItems.filter((item) => item.raw.status === "to_schedule");
    const plannedItems = openItems.filter((item) => item.raw.status === "planned" && !item.isOverdue);
    const completedItems = interventions.filter((item) => item.isDone);
    const latestCompleted = [...completedItems].sort((left, right) => {
      const leftDate = left.raw.completed_at ?? left.raw.updated_at;
      const rightDate = right.raw.completed_at ?? right.raw.updated_at;
      return rightDate.localeCompare(leftDate);
    })[0] ?? null;
    const nextItem = overdueItems[0] ?? plannedItems[0] ?? toScheduleItems[0] ?? latestCompleted ?? null;
    const nextInterventionLabel = nextItem?.typeLabel ?? "Aucune intervention prévue";
    const nextInterventionDetail = nextItem?.detail ?? "Le chantier n’a pas encore d’intervention simple prévue.";
    const nextInterventionStatusLabel = nextItem?.statusLabel ?? "À planifier";
    const nextInterventionStatusTone = nextItem?.statusTone ?? "warning";
    const nextInterventionAssigneeLabel = nextItem?.assigneeLabel ?? "Référent à définir";
    const nextInterventionTimingLabel = nextItem?.scheduledForLabel ?? "Date à fixer";
    const lastInterventionLabel = latestCompleted?.typeLabel ?? null;
    const lastInterventionTimingLabel = latestCompleted?.scheduledForLabel ?? null;
    const lastInterventionResultCode = latestCompleted?.resultCode ?? null;
    const lastInterventionResultLabel = latestCompleted?.resultLabel ?? null;
    const lastInterventionResultTone = latestCompleted?.resultTone ?? null;
    const lastInterventionDetail = latestCompleted?.resultDetail ?? null;
    const lastInterventionFollowUp = latestCompleted?.raw.follow_up_note?.trim() || null;

    const missingItems = [
      !isPersisted ? "Créer un chantier réel avant de planifier une intervention" : null,
      isPersisted && interventions.length === 0 ? "Première intervention à planifier" : null,
      ...toScheduleItems.map((item) => `${item.typeLabel} à planifier`),
      ...overdueItems.map((item) => `${item.typeLabel} à reprogrammer`),
      latestCompleted?.resultCode === "blocked" ? "Suite à définir après intervention bloquée" : null,
      latestCompleted?.resultCode === "partial" ? "Suite d’intervention à prévoir" : null,
      latestCompleted?.resultCode === "postponed" ? "Intervention à reprogrammer" : null,
    ].filter((item): item is string => item !== null);

    const readyItems = [
      ...plannedItems.slice(0, 2).map((item) => `${item.typeLabel} prévue`),
      ...completedItems.slice(0, 2).map((item) =>
        item.resultLabel ? `${item.typeLabel} · ${item.resultLabel.toLowerCase()}` : `${item.typeLabel} réalisée`
      ),
    ];

    let statusLabel = "Sous contrôle";
    let statusTone: CfmTone = "success";
    let summary = "Le chantier est planifié sans signal immédiat sur les interventions.";
    let nextActionLabel = "Ouvrir coordination";
    let nextActionRoute = `/app/chantiers/${worksite.id}/coordination`;

    if (!isPersisted) {
      statusLabel = "Lecture guide";
      statusTone = "calm";
      summary = "Passez d’abord par un chantier réel avant d’ajouter une intervention.";
      nextActionLabel = "Créer un chantier réel";
      nextActionRoute = "/app/chantiers/nouveau";
    } else if (overdueItems.length > 0) {
      statusLabel = "En retard";
      statusTone = "danger";
      summary = `${overdueItems.length} intervention${overdueItems.length > 1 ? "s sont" : " est"} à reprogrammer rapidement.`;
      nextActionLabel = "Reprogrammer l’intervention";
    } else if (latestCompleted?.resultCode === "blocked") {
      statusLabel = "Bloquée";
      statusTone = "danger";
      summary = latestCompleted.resultDetail || "La dernière intervention s’est terminée sur un blocage terrain.";
      nextActionLabel = "Lever le blocage";
    } else if (latestCompleted?.resultCode === "postponed") {
      statusLabel = "À reprogrammer";
      statusTone = "warning";
      summary = latestCompleted.resultDetail || "La dernière intervention a été reportée. Une nouvelle date reste à poser.";
      nextActionLabel = "Reprogrammer l’intervention";
    } else if (latestCompleted?.resultCode === "partial") {
      statusLabel = "Suite requise";
      statusTone = "warning";
      summary = latestCompleted.resultDetail || "La dernière intervention est partielle. Une suite reste à caler.";
      nextActionLabel = "Prévoir la suite";
    } else if (interventions.length === 0 || toScheduleItems.length > 0) {
      statusLabel = "À planifier";
      statusTone = "warning";
      summary = interventions.length === 0
        ? "Aucune intervention n’est encore posée sur ce chantier."
        : "Une intervention existe déjà, mais sa date reste à fixer.";
      nextActionLabel = "Planifier l’intervention";
    } else if (plannedItems.length > 0) {
      const nearest = plannedItems[0];
      const scheduledAt = nearest.raw.scheduled_for ? Date.parse(nearest.raw.scheduled_for) : Number.NaN;
      const hoursUntil = Number.isFinite(scheduledAt)
        ? Math.round((scheduledAt - Date.now()) / (1000 * 60 * 60))
        : null;
      if (hoursUntil !== null && hoursUntil <= 48) {
        statusLabel = "Intervention proche";
        statusTone = "progress";
        summary = `${nearest.typeLabel} prévue bientôt. L’équipe et le chantier doivent être prêts.`;
      } else {
        statusLabel = "Planifiée";
        statusTone = "calm";
        summary = `${nearest.typeLabel} déjà planifiée. Le chantier reste lisible côté temps.`;
      }
      nextActionLabel = nearest.raw.status === "planned" && nearest.raw.scheduled_for
        ? "Ouvrir coordination"
        : "Planifier l’intervention";
    } else if (completedItems.length > 0) {
      statusLabel = "Sous contrôle";
      statusTone = "success";
      summary = "Les dernières interventions sont réalisées. Le chantier reste à suivre ou à remettre.";
      nextActionLabel = "Vérifier le chantier";
      nextActionRoute = `/app/chantiers/${worksite.id}/apercu`;
    }

    return {
      statusLabel,
      statusTone,
      summary,
      missingItems,
      readyItems,
      lastInterventionLabel,
      lastInterventionTimingLabel,
      lastInterventionResultCode,
      lastInterventionResultLabel,
      lastInterventionResultTone,
      lastInterventionDetail,
      lastInterventionFollowUp,
      nextInterventionLabel,
      nextInterventionDetail,
      nextInterventionStatusLabel,
      nextInterventionStatusTone,
      nextInterventionAssigneeLabel,
      nextInterventionTimingLabel,
      nextActionLabel,
      nextActionRoute,
    };
  }

  private getInterventionSortRank(intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number]): number {
    if (this.isInterventionOverdue(intervention)) {
      return 0;
    }
    if (intervention.status === "to_schedule") {
      return 1;
    }
    if (intervention.status === "planned") {
      return 2;
    }
    if (intervention.status === "done") {
      return 3;
    }
    return 4;
  }

  private isInterventionOverdue(intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number]): boolean {
    if (intervention.status !== "planned" || !intervention.scheduled_for) {
      return false;
    }
    return Date.parse(intervention.scheduled_for) < Date.now();
  }

  private getInterventionTypeLabel(type: DesktopWorksiteDetailVm["raw"]["interventions"][number]["intervention_type"]): string {
    switch (type) {
      case "preparation":
        return "Préparation";
      case "visit":
        return "Visite / contrôle";
      case "team_intervention":
        return "Intervention équipe";
      case "delivery":
        return "Livraison";
      case "verification":
        return "Vérification";
      case "handover":
        return "Remise / clôture";
      default:
        return "Intervention";
    }
  }

  private getInterventionStatusLabel(
    intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number],
  ): string {
    if (intervention.status === "done") {
      if (intervention.result) {
        return this.getInterventionResultLabel(intervention.result);
      }
      return "Réalisée";
    }
    if (intervention.status === "canceled") {
      return "Annulée";
    }
    if (this.isInterventionOverdue(intervention)) {
      return "En retard";
    }
    if (intervention.status === "planned") {
      return "Planifiée";
    }
    return "À planifier";
  }

  private getInterventionStatusTone(
    intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number],
  ): CfmTone {
    if (intervention.status === "done") {
      if (intervention.result) {
        return this.getInterventionResultTone(intervention.result);
      }
      return "success";
    }
    if (intervention.status === "canceled") {
      return "calm";
    }
    if (this.isInterventionOverdue(intervention)) {
      return "danger";
    }
    if (intervention.status === "planned") {
      return "progress";
    }
    return "warning";
  }

  private getInterventionResultLabel(result: WorksiteInterventionResult): string {
    switch (result) {
      case "completed":
        return "Réalisée";
      case "partial":
        return "Partielle";
      case "blocked":
        return "Bloquée";
      case "postponed":
        return "Reportée";
      default:
        return "Traitée";
    }
  }

  private getInterventionResultTone(result: WorksiteInterventionResult): CfmTone {
    switch (result) {
      case "completed":
        return "success";
      case "partial":
        return "warning";
      case "blocked":
        return "danger";
      case "postponed":
        return "progress";
      default:
        return "calm";
    }
  }

  private getInterventionResultDetail(
    intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number],
  ): string | null {
    const reportComment = intervention.report_comment?.trim() || null;
    const followUpNote = intervention.follow_up_note?.trim() || null;
    if (reportComment && followUpNote) {
      return `${reportComment} · Suite : ${followUpNote}`;
    }
    return reportComment || followUpNote;
  }

  private getInterventionTimingLabel(
    intervention: DesktopWorksiteDetailVm["raw"]["interventions"][number],
  ): string {
    if (intervention.status === "done") {
      if (!intervention.completed_at) {
        return intervention.result ? this.getInterventionResultLabel(intervention.result) : "Réalisée";
      }
      switch (intervention.result) {
        case "partial":
          return `Traitée le ${this.formatDateTime(intervention.completed_at)}`;
        case "blocked":
          return `Bloquée le ${this.formatDateTime(intervention.completed_at)}`;
        case "postponed":
          return `Reportée le ${this.formatDateTime(intervention.completed_at)}`;
        default:
          return `Réalisée le ${this.formatDateTime(intervention.completed_at)}`;
      }
    }
    if (intervention.status === "canceled") {
      return "Annulée";
    }
    if (intervention.scheduled_for) {
      return `${this.isInterventionOverdue(intervention) ? "Prévue" : "À venir"} le ${this.formatDateTime(intervention.scheduled_for)}`;
    }
    return "Date à fixer";
  }

  private buildActionableState(
    worksite: DesktopWorksiteDetailVm["raw"],
    linkedSite: OrganizationSiteRecord | null,
    documentsCount: number,
    proofsCount: number,
    signaturesCount: number,
    coordinationTeam: WorksiteTeamRecord | null,
    equipments: DesktopWorksiteEquipmentItem[],
    recentEquipmentMovements: DesktopWorksiteEquipmentMovementItem[],
    planning: DesktopWorksitePlanningVm,
  ): {
    globalStateLabel: string;
    globalStateTone: CfmTone;
    preparationLabel: string;
    preparationTone: CfmTone;
    vigilanceLabel: string;
    vigilanceTone: CfmTone;
    primarySignalLabel: string;
    primarySignalTone: CfmTone;
    primarySignalDetail: string;
    issueSummaryLabel: string;
    primaryActionDetail: string;
    blockingItems: string[];
    actionItems: string[];
    watchItems: string[];
    availableItems: string[];
    missingItems: string[];
    nextActionLabel: string;
    primaryActionLabel: string;
    primaryActionRoute: string;
    operationalSummary: string;
    actionRank: number;
  } {
    const isPersisted = this.isPersistedWorksite(worksite);
    const siteMissing = linkedSite === null;
    const siteNeedsReview = linkedSite !== null && linkedSite.location_enrichment_status !== "enriched";
    const documentsMissing = documentsCount === 0;
    const proofsMissing = proofsCount === 0;
    const signaturesMissing = signaturesCount === 0;
    const equipmentMissing = isPersisted && equipments.length === 0;
    const teamMissing = isPersisted && coordinationTeam === null;
    const referentMissing = coordinationTeam !== null && !worksite.coordination.assignee_user_id;
    const teamPartial = coordinationTeam !== null && coordinationTeam.member_count < 2;
    const unavailableCount = equipments.filter((equipment) => equipment.raw.status === "unavailable").length;
    const attentionCount = equipments.filter((equipment) => equipment.raw.status === "attention").length;
    const coordinationTodo = worksite.coordination.status === "todo";
    const coordinationInProgress = worksite.coordination.status === "in_progress";
    const isBlocked = worksite.status === "blocked";
    const planningOverdue = planning.statusLabel === "En retard";
    const planningToSchedule = planning.statusLabel === "À planifier";
    const planningApproaching = planning.statusLabel === "Intervention proche";
    const planningScheduled = planning.statusLabel === "Planifiée";
    const lastResultBlocked = planning.lastInterventionResultCode === "blocked";
    const lastResultPostponed = planning.lastInterventionResultCode === "postponed";
    const lastResultPartial = planning.lastInterventionResultCode === "partial";
    const lastResultCompleted = planning.lastInterventionResultCode === "completed";

    const availableItems = [
      linkedSite ? (siteNeedsReview ? "Site relié" : "Site prêt") : null,
      coordinationTeam ? `${coordinationTeam.name} affectée` : null,
      coordinationTeam && worksite.coordination.assignee_user_id ? "Référent chantier défini" : null,
      worksite.interventions.length > 0 ? `${worksite.interventions.length} intervention${worksite.interventions.length > 1 ? "s" : ""} visible${worksite.interventions.length > 1 ? "s" : ""}` : null,
      documentsCount > 0 ? `${documentsCount} document${documentsCount > 1 ? "s" : ""} prêt${documentsCount > 1 ? "s" : ""}` : null,
      proofsCount > 0 ? `${proofsCount} preuve${proofsCount > 1 ? "s" : ""} en place` : null,
      signaturesCount > 0 ? `${signaturesCount} signature${signaturesCount > 1 ? "s" : ""} en place` : null,
      equipments.length > 0 ? `${equipments.length} équipement${equipments.length > 1 ? "s" : ""} affecté${equipments.length > 1 ? "s" : ""}` : null,
      worksite.coordination.status === "done" ? "Coordination finalisée" : null,
      lastResultCompleted ? "Dernière intervention réalisée proprement" : null,
    ].filter((item): item is string => item !== null);

    const blockingItems = [
      isBlocked ? "Blocage terrain signalé" : null,
      siteMissing ? "Site du chantier à relier" : null,
      lastResultBlocked ? "Dernière intervention bloquée" : null,
      unavailableCount > 0
        ? `${unavailableCount} équipement${unavailableCount > 1 ? "s" : ""} indisponible${unavailableCount > 1 ? "s" : ""}`
        : null,
    ].filter((item): item is string => item !== null);

    const actionItems = [
      planningOverdue ? "Intervention à reprogrammer" : null,
      lastResultPostponed ? "Intervention reportée à reprogrammer" : null,
      lastResultPartial ? "Suite d’intervention à prévoir" : null,
      teamMissing ? "Équipe chantier à affecter" : null,
      referentMissing ? "Référent chantier à définir" : null,
      planningToSchedule ? "Intervention à planifier" : null,
      equipmentMissing ? "Équipement terrain à affecter" : null,
      coordinationTodo ? "Coordination à lancer" : null,
      documentsMissing ? "Documents chantier à compléter" : null,
      proofsMissing ? "Preuves terrain à ajouter" : null,
      signaturesMissing ? "Signature chantier à ajouter" : null,
    ].filter((item): item is string => item !== null);

    const watchItems = [
      teamPartial ? "Équipe chantier à compléter" : null,
      planningApproaching ? "Intervention proche à préparer" : null,
      planningScheduled ? "Intervention planifiée à suivre" : null,
      siteNeedsReview ? "Site à vérifier" : null,
      attentionCount > 0
        ? `${attentionCount} équipement${attentionCount > 1 ? "s" : ""} à vérifier`
        : null,
      coordinationInProgress ? "Coordination en cours" : null,
    ].filter((item): item is string => item !== null);

    const missingItems = [...blockingItems, ...actionItems, ...watchItems].slice(0, 6);

    const issueSummaryLabel = !isPersisted
      ? "Créer un chantier réel pour lancer le terrain"
      : blockingItems.length === 0 && actionItems.length === 0 && watchItems.length === 0
        ? "Sous contrôle"
        : blockingItems.length > 0
          ? `${blockingItems.length} blocage${blockingItems.length > 1 ? "s" : ""} à lever`
          : actionItems.length > 0
            ? `${actionItems.length} action${actionItems.length > 1 ? "s" : ""} à traiter en priorité`
            : `${watchItems.length} point${watchItems.length > 1 ? "s" : ""} à vérifier`;

    let globalStateLabel = "Sous contrôle";
    let globalStateTone: CfmTone = "success";
    if (!isPersisted) {
      globalStateLabel = "Modèle";
      globalStateTone = "calm";
    } else if (isBlocked || unavailableCount > 0) {
      globalStateLabel = "Bloquant";
      globalStateTone = "danger";
    } else if (blockingItems.length > 0) {
      globalStateLabel = "Bloquant";
      globalStateTone = "danger";
    } else if (actionItems.length > 0) {
      globalStateLabel = "Priorité immédiate";
      globalStateTone = "warning";
    } else if (watchItems.length > 0 || worksite.status === "planned") {
      globalStateLabel = "À vérifier";
      globalStateTone = "progress";
    }

    let preparationLabel = "Base prête";
    let preparationTone: CfmTone = "success";
    if (!isPersisted) {
      preparationLabel = "Modèle à concrétiser";
      preparationTone = "calm";
    } else if (siteMissing || teamMissing || equipmentMissing || documentsMissing) {
      preparationLabel = "Base à monter";
      preparationTone = "warning";
    } else if (
      referentMissing
      || teamPartial
      || proofsMissing
      || signaturesMissing
      || siteNeedsReview
      || attentionCount > 0
      || coordinationTodo
    ) {
      preparationLabel = "Base presque prête";
      preparationTone = "progress";
    }

    let vigilanceLabel = "Sous contrôle";
    let vigilanceTone: CfmTone = "success";
    if (!isPersisted) {
      vigilanceLabel = "Lecture guide";
      vigilanceTone = "calm";
    } else if (isBlocked || unavailableCount > 0) {
      vigilanceLabel = "Blocage terrain";
      vigilanceTone = "danger";
    } else if (teamPartial || attentionCount > 0 || siteNeedsReview) {
      vigilanceLabel = "Vérification utile";
      vigilanceTone = "progress";
    } else if (planningOverdue || planningToSchedule || planningApproaching || planningScheduled) {
      vigilanceLabel = planning.statusLabel;
      vigilanceTone = planning.statusTone;
    } else if (referentMissing || coordinationTodo || coordinationInProgress || proofsMissing || signaturesMissing) {
      vigilanceLabel = "Coordination à suivre";
      vigilanceTone = "progress";
    }

    let primarySignalLabel = "Chantier sous contrôle";
    let primarySignalTone: CfmTone = "success";
    let primarySignalDetail = recentEquipmentMovements[0]
      ? `Dernier mouvement : ${recentEquipmentMovements[0].movementLabel.toLowerCase()} sur ${recentEquipmentMovements[0].equipmentName}.`
      : "Les repères essentiels du chantier sont disponibles sans liste longue.";
    if (!isPersisted) {
      primarySignalLabel = "Chantier modèle";
      primarySignalTone = "calm";
      primarySignalDetail = "Cette fiche sert de repère. Les équipements et actions terrain sont disponibles sur les chantiers créés.";
    } else if (isBlocked) {
      primarySignalLabel = "Blocage terrain";
      primarySignalTone = "danger";
      primarySignalDetail = "Le statut du chantier appelle une vérification immédiate des points bloquants.";
    } else if (unavailableCount > 0) {
      primarySignalLabel = unavailableCount > 1 ? "Équipements indisponibles" : "Équipement indisponible";
      primarySignalTone = "danger";
      primarySignalDetail = `${unavailableCount} équipement${unavailableCount > 1 ? "s restent" : " reste"} indisponible${unavailableCount > 1 ? "s" : ""} sur ce chantier.`;
    } else if (siteMissing) {
      primarySignalLabel = "Site à relier";
      primarySignalTone = "danger";
      primarySignalDetail = "Le chantier est visible, mais il faut confirmer son site pour fiabiliser le suivi.";
    } else if (lastResultBlocked) {
      primarySignalLabel = "Intervention bloquée";
      primarySignalTone = "danger";
      primarySignalDetail = planning.lastInterventionFollowUp || planning.lastInterventionDetail || "La dernière intervention n’a pas pu aboutir. Une action de reprise reste à cadrer.";
    } else if (lastResultPostponed) {
      primarySignalLabel = "Intervention reportée";
      primarySignalTone = "warning";
      primarySignalDetail = planning.lastInterventionFollowUp || planning.lastInterventionDetail || "La dernière intervention a été reportée. Une nouvelle date reste à poser.";
    } else if (lastResultPartial) {
      primarySignalLabel = "Intervention partielle";
      primarySignalTone = "warning";
      primarySignalDetail = planning.lastInterventionFollowUp || planning.lastInterventionDetail || "La dernière intervention a avancé, mais une suite reste nécessaire.";
    } else if (teamMissing) {
      primarySignalLabel = "Équipe à affecter";
      primarySignalTone = "warning";
      primarySignalDetail = "Le chantier peut être préparé, mais aucune équipe n’est encore affectée.";
    } else if (referentMissing) {
      primarySignalLabel = "Référent à définir";
      primarySignalTone = "warning";
      primarySignalDetail = `${coordinationTeam?.name || "L’équipe affectée"} attend encore un pilote chantier clairement désigné.`;
    } else if (teamPartial) {
      primarySignalLabel = "Équipe à compléter";
      primarySignalTone = "progress";
      primarySignalDetail = `${coordinationTeam?.name || "L’équipe"} reste légère pour couvrir le chantier sereinement.`;
    } else if (planningOverdue) {
      primarySignalLabel = "Intervention en retard";
      primarySignalTone = "danger";
      primarySignalDetail = `${planning.nextInterventionLabel} devait passer ${planning.nextInterventionTimingLabel.toLowerCase()}.`;
    } else if (planningToSchedule) {
      primarySignalLabel = "Intervention à planifier";
      primarySignalTone = "warning";
      primarySignalDetail = `${planning.nextInterventionLabel} attend encore une date claire pour le terrain.`;
    } else if (planningApproaching) {
      primarySignalLabel = "Intervention à venir";
      primarySignalTone = "progress";
      primarySignalDetail = `${planning.nextInterventionLabel} approche. ${planning.nextInterventionAssigneeLabel} reste le bon point d’entrée.`;
    } else if (equipmentMissing) {
      primarySignalLabel = "Équipement à affecter";
      primarySignalTone = "warning";
      primarySignalDetail = "Le chantier peut avancer dès qu’un premier équipement est affecté.";
    } else if (documentsMissing) {
      primarySignalLabel = "Documents à compléter";
      primarySignalTone = "warning";
      primarySignalDetail = "La base documentaire manque encore pour rendre le chantier exécutable.";
    } else if (proofsMissing && signaturesMissing) {
      primarySignalLabel = "Preuves à ajouter";
      primarySignalTone = "warning";
      primarySignalDetail = "Il manque encore les justificatifs terrain et la signature pour suivre correctement le chantier.";
    } else if (proofsMissing) {
      primarySignalLabel = "Preuve à ajouter";
      primarySignalTone = "warning";
      primarySignalDetail = "Une preuve terrain manque encore pour garder une trace exploitable.";
    } else if (signaturesMissing) {
      primarySignalLabel = "Signature à ajouter";
      primarySignalTone = "warning";
      primarySignalDetail = "La signature chantier reste à récupérer pour boucler le suivi.";
    } else if (attentionCount > 0) {
      primarySignalLabel = attentionCount > 1 ? "Équipements à vérifier" : "Équipement à vérifier";
      primarySignalTone = "progress";
      primarySignalDetail = `${attentionCount} équipement${attentionCount > 1 ? "s demandent" : " demande"} une relecture rapide avant poursuite.`;
    } else if (siteNeedsReview) {
      primarySignalLabel = "Vérification site à faire";
      primarySignalTone = "progress";
      primarySignalDetail = "Le site lié est exploitable, mais mérite encore une vérification d’adresse ou d’enrichissement.";
    } else if (coordinationTodo) {
      primarySignalLabel = "Coordination à finaliser";
      primarySignalTone = "warning";
      primarySignalDetail = "Le chantier est prêt à avancer, mais l’équipe, le référent ou les consignes restent à fixer.";
    } else if (coordinationInProgress) {
      primarySignalLabel = "Coordination en cours";
      primarySignalTone = "progress";
      primarySignalDetail = "Le sujet est pris en charge, mais la coordination doit être bouclée pour sécuriser le terrain.";
    } else {
      primarySignalLabel = "Chantier prêt";
      primarySignalTone = "success";
      primarySignalDetail = recentEquipmentMovements[0]
        ? `Dernier mouvement : ${recentEquipmentMovements[0].movementLabel.toLowerCase()} sur ${recentEquipmentMovements[0].equipmentName}.`
        : "Les repères utiles sont en place pour suivre le chantier sans détour.";
    }

    let primaryActionLabel = "Ouvrir l’aperçu";
    let primaryActionRoute = `/app/chantiers/${worksite.id}/apercu`;
    let primaryActionDetail = "Ouvrez la fiche pour vérifier les repères utiles avant d’ouvrir une sous-vue.";
    if (!isPersisted) {
      primaryActionLabel = "Créer un chantier réel";
      primaryActionRoute = "/app/chantiers/nouveau";
      primaryActionDetail = "Passez du modèle au chantier réel pour affecter matériel, documents et preuves.";
    } else if (worksite.status === "completed") {
      primaryActionLabel = "Voir le dossier";
      primaryActionRoute = `/app/chantiers/${worksite.id}/dossier`;
      primaryActionDetail = "Le chantier est clôturé. Vérifiez le dossier remis ou exportez les pièces utiles.";
    } else if (isBlocked) {
      primaryActionLabel = "Finaliser la coordination";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Clarifiez équipe, responsable, commentaire et prochain passage pour lever le point terrain.";
    } else if (lastResultBlocked) {
      primaryActionLabel = "Lever le blocage";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = planning.lastInterventionFollowUp || "Enregistrez la suite utile puis reprogrammez l’intervention quand le blocage est levé.";
    } else if (lastResultPostponed) {
      primaryActionLabel = "Reprogrammer l’intervention";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = planning.lastInterventionFollowUp || "Posez une nouvelle date pour reprendre l’intervention reportée.";
    } else if (lastResultPartial) {
      primaryActionLabel = "Prévoir la suite";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = planning.lastInterventionFollowUp || "Transformez l’intervention partielle en prochaine action claire pour le chantier.";
    } else if (teamMissing) {
      primaryActionLabel = "Affecter une équipe";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Choisissez l’équipe qui couvrira le chantier avant de poursuivre.";
    } else if (referentMissing) {
      primaryActionLabel = "Définir le référent";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Choisissez le pilote chantier dans l’équipe affectée.";
    } else if (teamPartial) {
      primaryActionLabel = "Vérifier l'équipe";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Confirmez la couverture de l’équipe et le référent avant intervention.";
    } else if (coordinationTodo || coordinationInProgress) {
      primaryActionLabel = "Finaliser la coordination";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Clarifiez équipe, responsable, commentaire et prochain passage pour sécuriser le chantier.";
    } else if (planningOverdue) {
      primaryActionLabel = "Reprogrammer l’intervention";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Ajustez la date prévue et le pilote avant de laisser l’intervention dériver davantage.";
    } else if (planningToSchedule) {
      primaryActionLabel = "Planifier l’intervention";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Posez une première intervention simple pour savoir qui intervient et quand.";
    } else if (planningApproaching || planningScheduled) {
      primaryActionLabel = "Ouvrir coordination";
      primaryActionRoute = `/app/chantiers/${worksite.id}/coordination`;
      primaryActionDetail = "Vérifiez l’équipe, le référent et le prochain passage avant intervention.";
    } else if (equipmentMissing) {
      primaryActionLabel = "Affecter un équipement";
      primaryActionRoute = `/app/chantiers/${worksite.id}/equipements`;
      primaryActionDetail = "Affectez le matériel nécessaire avant intervention.";
    } else if (unavailableCount > 0) {
      primaryActionLabel = "Vérifier les équipements";
      primaryActionRoute = `/app/chantiers/${worksite.id}/equipements`;
      primaryActionDetail = "Retirez ou remplacez le matériel indisponible avant de poursuivre.";
    } else if (attentionCount > 0) {
      primaryActionLabel = "Vérifier les équipements";
      primaryActionRoute = `/app/chantiers/${worksite.id}/equipements`;
      primaryActionDetail = "Contrôlez les équipements signalés avant de poursuivre.";
    } else if (siteMissing || siteNeedsReview) {
      primaryActionLabel = "Vérifier le chantier";
      primaryActionRoute = `/app/chantiers/${worksite.id}/apercu`;
      primaryActionDetail = "Confirmez le site et les repères terrain avant d’ouvrir les autres sujets.";
    } else if (documentsMissing) {
      primaryActionLabel = "Compléter les documents";
      primaryActionRoute = `/app/chantiers/${worksite.id}/documents`;
      primaryActionDetail = "Ajoutez la base documentaire nécessaire au terrain.";
    } else if (proofsMissing && signaturesMissing) {
      primaryActionLabel = "Ajouter une preuve";
      primaryActionRoute = `/app/chantiers/${worksite.id}/preuves`;
      primaryActionDetail = "Ajoutez les justificatifs et la signature attendus pour garder une trace exploitable.";
    } else if (proofsMissing) {
      primaryActionLabel = "Ajouter une preuve";
      primaryActionRoute = `/app/chantiers/${worksite.id}/preuves`;
      primaryActionDetail = "Ajoutez la preuve terrain manquante.";
    } else if (signaturesMissing) {
      primaryActionLabel = "Ajouter une signature";
      primaryActionRoute = `/app/chantiers/${worksite.id}/preuves`;
      primaryActionDetail = "Complétez la signature attendue pour boucler le suivi.";
    } else {
      primaryActionLabel = "Préparer la remise";
      primaryActionRoute = `/app/chantiers/${worksite.id}/dossier`;
      primaryActionDetail = "Le chantier est sous contrôle. Vérifiez le dossier client avant clôture ou remise.";
    }

    const operationalSummary = !isPersisted
      ? "Fiche modèle : créez un chantier réel pour lancer les actions terrain."
      : blockingItems.length === 0 && actionItems.length === 0 && watchItems.length === 0
        ? "Le chantier est sous contrôle. Les repères utiles sont déjà en place."
        : `${issueSummaryLabel}. ${primaryActionDetail}`;

    const actionRank = !isPersisted
      ? 4
      : isBlocked
        ? 0
        : unavailableCount > 0
          ? 1
          : blockingItems.length > 0
            ? 2
            : teamMissing || referentMissing
              ? 3
              : planningOverdue || lastResultPostponed || lastResultPartial
                ? 4
                : teamPartial
                  ? 5
                  : actionItems.length > 0
                    ? 6
                    : watchItems.length > 0
                      ? 7
                      : 8;

    return {
      globalStateLabel,
      globalStateTone,
      preparationLabel,
      preparationTone,
      vigilanceLabel,
      vigilanceTone,
      primarySignalLabel,
      primarySignalTone,
      primarySignalDetail,
      issueSummaryLabel,
      primaryActionDetail,
      blockingItems,
      actionItems,
      watchItems,
      availableItems,
      missingItems,
      nextActionLabel: primaryActionLabel,
      primaryActionLabel,
      primaryActionRoute,
      operationalSummary,
      actionRank,
    };
  }

  private buildCompletionState(
    worksite: DesktopWorksiteDetailVm["raw"],
    linkedSite: OrganizationSiteRecord | null,
    documentsCount: number,
    proofsCount: number,
    signaturesCount: number,
    coordinationTeam: WorksiteTeamRecord | null,
    equipments: DesktopWorksiteEquipmentItem[],
    blockingCount: number,
  ): DesktopWorksiteClosureVm {
    const isPersisted = this.isPersistedWorksite(worksite);
    const isClosed = worksite.status === "completed";
    const siteVerified = linkedSite !== null && linkedSite.location_enrichment_status === "enriched";
    const teamReady = coordinationTeam !== null
      && Boolean(worksite.coordination.assignee_user_id)
      && coordinationTeam.member_count >= 2;
    const coordinationReady = worksite.coordination.status === "done";
    const documentsReady = documentsCount > 0;
    const evidenceReady = proofsCount > 0 && signaturesCount > 0;
    const equipmentReady = equipments.length > 0 && equipments.every((equipment) => equipment.raw.status === "ready");

    const readyItems = [
      siteVerified ? "Site confirmé" : null,
      teamReady ? "Équipe et référent en place" : null,
      coordinationReady ? "Coordination finalisée" : null,
      documentsReady ? "Documents chantier prêts" : null,
      evidenceReady ? "Preuves et signature prêtes" : null,
      equipmentReady ? "Équipements sous contrôle" : null,
    ].filter((item): item is string => item !== null);

    const missingItems = [
      !siteVerified ? (linkedSite === null ? "Site à relier" : "Site à confirmer avant remise") : null,
      !teamReady
        ? coordinationTeam === null
          ? "Équipe chantier à affecter"
          : !worksite.coordination.assignee_user_id
            ? "Référent chantier à définir"
            : "Équipe chantier à compléter"
        : null,
      !coordinationReady ? "Coordination à finaliser" : null,
      !documentsReady ? "Documents chantier à compléter" : null,
      !evidenceReady
        ? proofsCount === 0 && signaturesCount === 0
          ? "Preuves et signature à compléter"
          : proofsCount === 0
            ? "Preuves à ajouter"
            : "Signature à ajouter"
        : null,
      !equipmentReady
        ? equipments.length === 0
          ? "Équipement terrain à affecter"
          : "Équipements à remettre sous contrôle"
        : null,
    ].filter((item): item is string => item !== null);

    const canClose = isPersisted && !isClosed && missingItems.length === 0;
    const almostReady = isPersisted && !isClosed && blockingCount === 0 && missingItems.length > 0 && missingItems.length <= 2;

    let statusLabel = "Non prêt";
    let statusTone: CfmTone = blockingCount > 0 ? "danger" : "warning";
    if (!isPersisted) {
      statusLabel = "Non prêt";
      statusTone = "calm";
    } else if (isClosed) {
      statusLabel = "Clôturé";
      statusTone = "success";
    } else if (canClose) {
      statusLabel = "Prêt à clôturer";
      statusTone = "success";
    } else if (almostReady) {
      statusLabel = "Presque prêt";
      statusTone = "progress";
    }

    let summary = "La remise client n’est pas encore prête. Il reste plusieurs points de fin de chantier à boucler.";
    if (!isPersisted) {
      summary = "Ce modèle doit devenir un chantier réel avant de préparer une remise ou une clôture.";
    } else if (isClosed) {
      summary = "Le chantier est clôturé. Le dossier peut être remis, exporté ou archivé comme base finale.";
    } else if (canClose) {
      summary = "Tous les repères de fin de chantier sont en place. Vous pouvez clôturer le chantier ou remettre le dossier.";
    } else if (almostReady) {
      summary = "La fin de chantier est proche. Il reste peu de points à compléter avant la remise finale.";
    }

    let nextActionLabel = "Ouvrir le chantier";
    let nextActionRoute = `/app/chantiers/${worksite.id}/apercu`;
    if (!isPersisted) {
      nextActionLabel = "Créer un chantier réel";
      nextActionRoute = "/app/chantiers/nouveau";
    } else if (isClosed || canClose) {
      nextActionLabel = "Ouvrir le dossier";
      nextActionRoute = `/app/chantiers/${worksite.id}/dossier`;
    } else if (!siteVerified) {
      nextActionLabel = "Vérifier le chantier";
      nextActionRoute = `/app/chantiers/${worksite.id}/apercu`;
    } else if (!teamReady || !coordinationReady) {
      nextActionLabel = "Finaliser la coordination";
      nextActionRoute = `/app/chantiers/${worksite.id}/coordination`;
    } else if (!documentsReady) {
      nextActionLabel = "Compléter les documents";
      nextActionRoute = `/app/chantiers/${worksite.id}/documents`;
    } else if (!evidenceReady) {
      nextActionLabel = "Compléter les preuves";
      nextActionRoute = `/app/chantiers/${worksite.id}/preuves`;
    } else if (!equipmentReady) {
      nextActionLabel = "Vérifier les équipements";
      nextActionRoute = `/app/chantiers/${worksite.id}/equipements`;
    }

    return {
      statusLabel,
      statusTone,
      summary,
      readyItems,
      missingItems,
      nextActionLabel,
      nextActionRoute,
      canClose,
      isClosed,
    };
  }

  private findSite(state: DesktopWorksitesModuleState, siteId: string | null): OrganizationSiteRecord | null {
    if (!siteId) {
      return null;
    }
    return state.sites.find((site) => site.id === siteId) ?? null;
  }

  private getWorksiteDocuments(state: DesktopWorksitesModuleState, worksiteId: string) {
    return state.documents
      .filter((document) => document.worksite_id === worksiteId)
      .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
  }

  private getWorksiteProofs(state: DesktopWorksitesModuleState, worksiteId: string) {
    return state.proofs
      .filter((proof) => proof.worksite_id === worksiteId)
      .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
  }

  private getWorksiteSignatures(state: DesktopWorksitesModuleState, worksiteId: string) {
    return state.signatures
      .filter((signature) => signature.worksite_id === worksiteId)
      .sort((left, right) => (right.uploaded_at ?? "").localeCompare(left.uploaded_at ?? ""));
  }

  private getWorksiteEquipments(state: DesktopWorksitesModuleState, worksiteId: string) {
    return state.equipments
      .filter((equipment) => equipment.worksite_id === worksiteId)
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  private getWorksiteEquipmentMovements(state: DesktopWorksitesModuleState, worksiteId: string) {
    return state.equipmentMovements
      .filter((movement) => movement.worksite_id === worksiteId)
      .sort((left, right) => (right.captured_at ?? "").localeCompare(left.captured_at ?? ""));
  }

  private getLatestEquipmentMovement(
    state: DesktopWorksitesModuleState,
    equipmentId: string,
  ): DesktopWorksitesModuleState["equipmentMovements"][number] | null {
    return state.equipmentMovements
      .filter((movement) => movement.equipment_id === equipmentId)
      .sort((left, right) => (right.captured_at ?? "").localeCompare(left.captured_at ?? ""))[0] ?? null;
  }

  private buildTemporalLabel(worksite: DesktopWorksiteDetailVm["raw"]): string {
    const plannedLabel = this.formatDateTime(worksite.planned_for);
    const updatedLabel = this.formatDateTime(worksite.updated_at);
    if (plannedLabel && updatedLabel) {
      return `Prévu le ${plannedLabel} · mis à jour le ${updatedLabel}`;
    }
    if (plannedLabel) {
      return `Prévu le ${plannedLabel}`;
    }
    if (updatedLabel) {
      return `Mis à jour le ${updatedLabel}`;
    }
    return "Repère temporel indisponible.";
  }

  private buildCompletionLabel(
    worksite: DesktopWorksiteDetailVm["raw"],
    linkedSite: OrganizationSiteRecord | null,
    documentsCount: number,
    proofsCount: number,
    signaturesCount: number,
    equipmentsCount: number,
  ): { label: string; tone: CfmTone } {
    if (!this.isPersistedWorksite(worksite)) {
      return { label: "Modèle", tone: "calm" };
    }
    if (!linkedSite) {
      return { label: "Site à relier", tone: "warning" };
    }
    if (documentsCount === 0) {
      return { label: "Base à préparer", tone: "progress" };
    }
    if (equipmentsCount === 0) {
      return { label: "Équipements à affecter", tone: "warning" };
    }
    if (proofsCount === 0 && signaturesCount === 0) {
      return { label: "À vérifier", tone: "warning" };
    }
    return { label: "Documenté", tone: "success" };
  }

  private buildNextActionLabel(
    worksite: DesktopWorksiteDetailVm["raw"],
    linkedSite: OrganizationSiteRecord | null,
    documentsCount: number,
    proofsCount: number,
    signaturesCount: number,
    equipments: DesktopWorksitesModuleState["equipments"],
  ): string {
    const unavailableCount = equipments.filter((equipment) => equipment.status === "unavailable").length;
    const attentionCount = equipments.filter((equipment) => equipment.status === "attention").length;

    if (!this.isPersistedWorksite(worksite)) {
      return "Créer un chantier réel";
    }
    if (!linkedSite) {
      return "Lier un site au chantier";
    }
    if (linkedSite.location_enrichment_status !== "enriched") {
      return "Vérifier le site lié";
    }
    if (equipments.length === 0) {
      return "Affecter un équipement";
    }
    if (unavailableCount > 0 || attentionCount > 0) {
      return "Vérifier les équipements";
    }
    if (documentsCount === 0) {
      return "Voir les documents chantier";
    }
    if (proofsCount === 0 && signaturesCount === 0) {
      return "Compléter les preuves";
    }
    return "Vérifier les équipements";
  }

  private getWorksiteStatusLabel(status: WorksiteStatus): string {
    switch (status) {
      case "planned":
        return "Planifié";
      case "in_progress":
        return "En cours";
      case "blocked":
        return "Bloqué";
      case "completed":
        return "Terminé";
    }
  }

  private getWorksiteStatusTone(status: WorksiteStatus): CfmTone {
    switch (status) {
      case "planned":
        return "calm";
      case "in_progress":
        return "progress";
      case "blocked":
        return "danger";
      case "completed":
        return "success";
    }
  }

  private getCoordinationStatusLabel(status: WorksiteCoordinationStatus): string {
    switch (status) {
      case "todo":
        return "À faire";
      case "in_progress":
        return "En cours";
      case "done":
        return "Fait";
    }
  }

  private getCoordinationStatusTone(status: WorksiteCoordinationStatus): CfmTone {
    switch (status) {
      case "todo":
        return "warning";
      case "in_progress":
        return "progress";
      case "done":
        return "success";
    }
  }

  private getDocumentTechnicalStatusLabel(status: string): string {
    switch (status) {
      case "available":
        return "Disponible";
      case "pending":
        return "À compléter";
      case "failed":
        return "À vérifier";
      case "archived":
        return "Archivé";
      default:
        return "Disponible";
    }
  }

  private getDocumentTechnicalStatusTone(status: string): CfmTone {
    switch (status) {
      case "available":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "progress";
      case "archived":
        return "neutral";
      default:
        return "neutral";
    }
  }

  private getEquipmentStatusLabel(status: WorksiteEquipmentStatus): string {
    switch (status) {
      case "ready":
        return "Prêt";
      case "attention":
        return "Attention";
      case "unavailable":
        return "Indisponible";
    }
  }

  private getEquipmentStatusTone(status: WorksiteEquipmentStatus): CfmTone {
    switch (status) {
      case "ready":
        return "success";
      case "attention":
        return "progress";
      case "unavailable":
        return "danger";
    }
  }

  private getEquipmentSignalLabel(
    equipment: DesktopWorksitesModuleState["equipments"][number],
  ): string {
    if (equipment.status === "unavailable") {
      return "Retrait conseillé";
    }
    if (equipment.status === "attention") {
      return "Vérification utile";
    }
    if (equipment.worksite_id) {
      return "Affecté";
    }
    return "Disponible";
  }

  private getEquipmentMovementLabel(
    movementType: WorksiteEquipmentMovementType,
    resultingStatus: WorksiteEquipmentStatus,
  ): string {
    switch (movementType) {
      case "assigned_to_worksite":
        return "Affecté";
      case "removed_from_worksite":
        return "Retiré";
      case "marked_damaged":
        return resultingStatus === "unavailable" ? "Indisponible" : "Signalé";
    }
  }

  private getEquipmentMovementDetail(
    movementType: WorksiteEquipmentMovementType,
    resultingStatus: WorksiteEquipmentStatus,
  ): string {
    switch (movementType) {
      case "assigned_to_worksite":
        return "Équipement affecté au chantier.";
      case "removed_from_worksite":
        return "Équipement retiré du chantier.";
      case "marked_damaged":
        return resultingStatus === "unavailable"
          ? "Équipement déclaré indisponible."
          : "Équipement passé en attention.";
    }
  }

  private buildEquipmentMovementNotice(
    movementType: WorksiteEquipmentMovementType,
    resultingStatus: WorksiteEquipmentStatus,
  ): string {
    switch (movementType) {
      case "assigned_to_worksite":
        return "Équipement affecté au chantier.";
      case "removed_from_worksite":
        return "Équipement retiré du chantier.";
      case "marked_damaged":
        return resultingStatus === "unavailable"
          ? "Équipement marqué indisponible."
          : "Équipement passé en attention.";
    }
  }

  private getSiteTypeLabel(siteType: OrganizationSiteType): string {
    switch (siteType) {
      case "site":
        return "Site";
      case "building":
        return "Bâtiment";
      case "office":
        return "Bureau";
      case "warehouse":
        return "Entrepôt";
      default:
        return "Site";
    }
  }

  private getSiteEnrichmentState(site: OrganizationSiteRecord): DesktopWorksiteSiteEnrichmentState {
    switch (site.location_enrichment_status) {
      case "enriched":
        return {
          label: "Enrichissement terminé",
          tone: "success",
          detail: "Adresse reconnue et informations site prêtes à être relues.",
          reasonLabel: null,
        };
      case "partial":
        return {
          label: "Enrichissement partiel",
          tone: "warning",
          detail: "Le site est exploitable, mais une vérification reste utile.",
          reasonLabel: this.mapSiteReasonLabel(site.location_enrichment_last_error_reason ?? null),
        };
      case "no_match":
        return {
          label: "Adresse non reconnue",
          tone: "warning",
          detail: "Le site existe, mais l’adresse reste à confirmer.",
          reasonLabel: this.mapSiteReasonLabel(site.location_enrichment_last_error_reason ?? null),
        };
      case "failed":
        return {
          label: "Enrichissement indisponible",
          tone: "warning",
          detail: "Le site est enregistré, mais l’enrichissement n’a pas abouti.",
          reasonLabel: this.mapSiteReasonLabel(site.location_enrichment_last_error_reason ?? null),
        };
      default:
        return {
          label: "Enrichissement non lancé",
          tone: "neutral",
          detail: "Aucune tentative d’enrichissement n’est encore visible.",
          reasonLabel: null,
        };
    }
  }

  private mapSiteReasonLabel(reason: OrganizationSiteLocationEnrichmentErrorReason | null): string | null {
    switch (reason) {
      case "no_geocode_match":
        return "Adresse introuvable";
      case "ambiguous_address":
        return "Adresse ambiguë";
      case "risk_provider_unavailable":
        return "Risques temporairement indisponibles";
      case "provider_unavailable":
        return "Service temporairement indisponible";
      case "provider_response_invalid":
        return "Réponse externe invalide";
      default:
        return null;
    }
  }

  private formatDateTime(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  }

  private normalizeOptionalText(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }

  private toErrorMessage(error: unknown, context: "load" | "save" | "update" | "export"): string {
    if (error instanceof ApiClientError) {
      if (error.status === 403) {
        return "Vous n’avez pas accès à cette action pour le moment.";
      }
      if (error.status !== null && error.status >= 500) {
        return context === "load"
          ? "Le module Chantiers est temporairement indisponible."
          : "L’action chantier n’a pas pu aboutir pour le moment.";
      }
      return error.detail || "L’action chantier n’a pas pu aboutir.";
    }

    return context === "load"
      ? "Les données chantier n’ont pas pu être chargées."
      : "L’action chantier n’a pas pu aboutir.";
  }
}
