import { DestroyRef, Injectable, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type {
  KnownRoleCode,
  ModuleAccessLevel,
  ModuleCode,
  OrganizationMemberCreateRequest,
  OrganizationMemberRecord,
  OrganizationMemberUpdateRequest,
  OrganizationModuleRecord,
  OrganizationProfileUpdateRequest,
  OrganizationRecord,
  OrganizationTeamRecord,
  OrganizationTeamUpsertRequest,
} from "@conformeo/contracts";
import { ASSIGNABLE_ROLE_CODES, ROLE_LABELS as ROLE_LABELS_MAP, ROLE_SUMMARIES } from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";

import { ApiClientError } from "./api-error";
import {
  canAccessAdministration as canAccessAdministrationUi,
  canManageAdministration,
  isAdministrationReadOnly as isAdministrationReadOnlyUi,
} from "./desktop-access.utils";
import { fetchSession, persistSession, updateOrganizationModule } from "./auth-client";
import { type DesktopAdministrationPageContext, type DesktopAdministrationState } from "./desktop-admin-page-context";
import type { DesktopNavigationItem, DesktopShellContext } from "./desktop-shell-context";
import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import {
  createOrganizationMember,
  createOrganizationTeam,
  fetchOrganizationProfile,
  listOrganizationMembers,
  listOrganizationTeams,
  updateOrganizationMember,
  updateOrganizationProfile,
  updateOrganizationTeam,
} from "./organization-client";

type UserErrorContext = "auth" | "load" | "save" | "update";

const FALLBACK_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  contributor: "Terrain",
  viewer: "Lecteur",
  member: "Membre",
};

const FALLBACK_ROLE_SUMMARIES: Record<string, string> = {
  owner: "Administration complète de l'organisation et des accès.",
  admin: "Administration courante de l'organisation, des accès et des modules.",
  manager: "Pilotage opérationnel avec action sur les modules actifs.",
  contributor: "Action sur les modules actifs sans administration des accès.",
  viewer: "Lecture seule sur les modules actifs.",
  member: "Lecture simple sur les modules actifs.",
};

const SAFE_ASSIGNABLE_ROLE_CODES: KnownRoleCode[] = Array.isArray(ASSIGNABLE_ROLE_CODES) && ASSIGNABLE_ROLE_CODES.length > 0
  ? ASSIGNABLE_ROLE_CODES
  : ["owner", "admin", "manager", "contributor", "viewer"];

const SAFE_ROLE_LABELS: Record<string, string> = {
  ...FALLBACK_ROLE_LABELS,
  ...((ROLE_LABELS_MAP as Record<string, string> | undefined) ?? {}),
};

const SAFE_ROLE_SUMMARIES: Record<string, string> = {
  ...FALLBACK_ROLE_SUMMARIES,
  ...((ROLE_SUMMARIES as Record<string, string> | undefined) ?? {}),
};

@Injectable()
export class DesktopAdminFacade implements DesktopAdministrationPageContext {
  private readonly shell = inject(DESKTOP_SHELL_CONTEXT);
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly stateSubject = new BehaviorSubject<DesktopAdministrationState>({
    organization: null,
    members: [],
    teams: [],
  });

  readonly state$ = this.stateSubject.asObservable();
  loading = false;
  savingProfile = false;
  savingModuleCode: ModuleCode | null = null;
  savingMemberId: string | null = null;
  savingTeamId: string | null = null;

  readonly roleOptions = SAFE_ASSIGNABLE_ROLE_CODES.map((roleCode) => ({
    value: roleCode,
    label: SAFE_ROLE_LABELS[roleCode] ?? roleCode,
    summary: SAFE_ROLE_SUMMARIES[roleCode] ?? "Rôle organisation à préciser.",
  }));

  readonly adminNavigationItems: DesktopNavigationItem[] = [
    { route: "/app/administration/organisation", label: "Organisation", tone: "calm" },
    { route: "/app/administration/utilisateurs", label: "Utilisateurs", tone: "progress" },
    { route: "/app/administration/equipes", label: "Équipes", tone: "calm" },
  ];

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
            && left.membership === right.membership,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (!this.canAccessAdministration || !this.accessToken || !this.organizationId) {
          this.stateSubject.next({ organization: null, members: [], teams: [] });
          this.loading = false;
          return;
        }

        void this.refresh().catch((error) => {
          this.setShellError(this.toErrorMessage(error, "load"));
        });
      });
  }

  get currentMembershipRoleCode(): string | null {
    return this.shell.currentMembership?.membership.role_code ?? null;
  }

  get canAccessAdministration(): boolean {
    return canAccessAdministrationUi(this.shell.currentMembership);
  }

  get isAdministrationReadOnly(): boolean {
    return isAdministrationReadOnlyUi(this.shell.currentMembership);
  }

  get canReadOrganization(): boolean {
    return this.canAccessAdministration;
  }

  get canManageOrganization(): boolean {
    return canManageAdministration(this.shell.currentMembership);
  }

  get canEditOrganizationSettings(): boolean {
    return this.canManageOrganization;
  }

  get canReadUsers(): boolean {
    return this.canAccessAdministration;
  }

  get canManageUsers(): boolean {
    return canManageAdministration(this.shell.currentMembership);
  }

  get canManageModules(): boolean {
    return canManageAdministration(this.shell.currentMembership);
  }

  get organization(): OrganizationRecord | null {
    return this.stateSubject.value.organization;
  }

  get members(): OrganizationMemberRecord[] {
    return this.stateSubject.value.members;
  }

  get teams(): OrganizationTeamRecord[] {
    return this.stateSubject.value.teams;
  }

  get organizationModules(): OrganizationModuleRecord[] {
    return this.shell.currentMembership?.modules ?? [];
  }

  get memberCount(): number {
    return this.members.length;
  }

  get teamCount(): number {
    return this.teams.length;
  }

  get invitedMemberCount(): number {
    return this.members.filter((member) => member.user.status === "invited").length;
  }

  get disabledMemberCount(): number {
    return this.members.filter((member) => member.user.status === "disabled").length;
  }

  get enabledModuleCount(): number {
    return this.organizationModules.filter((module) => module.is_enabled).length;
  }

  async refresh(): Promise<void> {
    if (!this.accessToken || !this.organizationId || !this.canAccessAdministration) {
      this.stateSubject.next({ organization: null, members: [], teams: [] });
      return;
    }

    this.loading = true;
    this.clearShellMessages();

    try {
      const [organization, members, teams] = await Promise.all([
        fetchOrganizationProfile(this.accessToken, this.organizationId),
        this.canReadUsers ? listOrganizationMembers(this.accessToken, this.organizationId) : Promise.resolve([]),
        this.canReadUsers ? listOrganizationTeams(this.accessToken, this.organizationId) : Promise.resolve([]),
      ]);
      this.stateSubject.next({ organization, members, teams });
    } finally {
      this.loading = false;
    }
  }

  async saveOrganizationProfile(payload: OrganizationProfileUpdateRequest): Promise<void> {
    if (!this.accessToken || !this.organizationId || !this.canEditOrganizationSettings) {
      this.setShellError("Votre accès actuel ne permet pas de modifier l'organisation.");
      return;
    }

    this.savingProfile = true;
    this.clearShellMessages();
    try {
      const organization = await updateOrganizationProfile(this.accessToken!, this.organizationId!, payload);
      this.stateSubject.next({
        ...this.stateSubject.value,
        organization,
      });
      this.setShellFeedback("Paramétrage organisation mis à jour.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "save"));
    } finally {
      this.savingProfile = false;
    }
  }

  async setModuleState(moduleCode: ModuleCode, isEnabled: boolean): Promise<void> {
    if (!this.accessToken || !this.organizationId || !this.canManageModules) {
      this.setShellError("Votre accès actuel ne permet pas de gérer les modules.");
      return;
    }

    this.savingModuleCode = moduleCode;
    this.clearShellMessages();
    try {
      await updateOrganizationModule(this.accessToken, this.organizationId, moduleCode, isEnabled);
      await this.refreshSessionSnapshot();
      await this.refresh();
      this.setShellFeedback(`Module ${this.getModuleLabel(moduleCode)} ${isEnabled ? "activé" : "désactivé"}.`);
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
    } finally {
      this.savingModuleCode = null;
    }
  }

  async createMember(payload: OrganizationMemberCreateRequest): Promise<OrganizationMemberRecord | null> {
    if (!this.accessToken || !this.organizationId || !this.canManageUsers) {
      this.setShellError("Votre accès actuel ne permet pas d'ajouter un utilisateur.");
      return null;
    }

    this.savingMemberId = "create";
    this.clearShellMessages();
    try {
      const member = await createOrganizationMember(this.accessToken, this.organizationId, payload);
      await this.refreshSessionSnapshot();
      await this.refresh();
      this.setShellFeedback("Utilisateur rattaché à l'organisation.");
      return member;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "save"));
      return null;
    } finally {
      this.savingMemberId = null;
    }
  }

  async updateMember(
    membershipId: string,
    payload: OrganizationMemberUpdateRequest,
  ): Promise<OrganizationMemberRecord | null> {
    if (!this.accessToken || !this.organizationId || !this.canManageUsers) {
      this.setShellError("Votre accès actuel ne permet pas de modifier cet utilisateur.");
      return null;
    }

    this.savingMemberId = membershipId;
    this.clearShellMessages();
    try {
      const member = await updateOrganizationMember(this.accessToken, this.organizationId, membershipId, payload);
      await this.refreshSessionSnapshot();
      await this.refresh();
      this.setShellFeedback("Accès utilisateur mis à jour.");
      return member;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
      return null;
    } finally {
      this.savingMemberId = null;
    }
  }

  async createTeam(payload: OrganizationTeamUpsertRequest): Promise<OrganizationTeamRecord | null> {
    if (!this.accessToken || !this.organizationId || !this.canManageUsers) {
      this.setShellError("Votre accès actuel ne permet pas de créer une équipe.");
      return null;
    }

    this.savingTeamId = "create";
    this.clearShellMessages();
    try {
      const team = await createOrganizationTeam(this.accessToken, this.organizationId, payload);
      await this.refresh();
      this.setShellFeedback("Équipe créée.");
      return team;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "save"));
      return null;
    } finally {
      this.savingTeamId = null;
    }
  }

  async updateTeam(teamId: string, payload: OrganizationTeamUpsertRequest): Promise<OrganizationTeamRecord | null> {
    if (!this.accessToken || !this.organizationId || !this.canManageUsers) {
      this.setShellError("Votre accès actuel ne permet pas de modifier une équipe.");
      return null;
    }

    this.savingTeamId = teamId;
    this.clearShellMessages();
    try {
      const team = await updateOrganizationTeam(this.accessToken, this.organizationId, teamId, payload);
      await this.refresh();
      this.setShellFeedback("Équipe mise à jour.");
      return team;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
      return null;
    } finally {
      this.savingTeamId = null;
    }
  }

  getRoleLabel(roleCode: string): string {
    return SAFE_ROLE_LABELS[roleCode] ?? roleCode;
  }

  getUserStatusLabel(status: string): string {
    switch (status) {
      case "invited":
        return "Invité";
      case "active":
        return "Actif";
      case "disabled":
        return "Désactivé";
      default:
        return status;
    }
  }

  getUserStatusTone(status: string): CfmTone {
    switch (status) {
      case "active":
        return "success";
      case "invited":
        return "progress";
      case "disabled":
        return "warning";
      default:
        return "neutral";
    }
  }

  getModuleAccessTone(accessLevel: ModuleAccessLevel): CfmTone {
    switch (accessLevel) {
      case "admin":
        return "progress";
      case "action":
        return "success";
      case "read":
        return "neutral";
      case "disabled":
      default:
        return "warning";
    }
  }

  private get accessToken(): string | null {
    return this.sessionState.accessToken;
  }

  private get organizationId(): string | null {
    return this.sessionState.organizationId;
  }

  private get mutableShell(): DesktopShellContext & { errorMessage: string; feedbackMessage: string } {
    return this.shell as DesktopShellContext & { errorMessage: string; feedbackMessage: string };
  }

  private clearShellMessages(): void {
    this.mutableShell.errorMessage = "";
    this.mutableShell.feedbackMessage = "";
  }

  private setShellError(message: string): void {
    this.mutableShell.errorMessage = message;
    this.mutableShell.feedbackMessage = "";
  }

  private setShellFeedback(message: string): void {
    this.mutableShell.feedbackMessage = message;
    this.mutableShell.errorMessage = "";
  }

  private async refreshSessionSnapshot(): Promise<void> {
    if (!this.accessToken || !this.organizationId) {
      return;
    }

    const session = await fetchSession(this.accessToken, this.organizationId);
    persistSession(this.accessToken, session);
    this.sessionState.sync({
      accessToken: this.accessToken,
      organizationId: this.organizationId,
      session,
    });
  }

  private getModuleLabel(moduleCode: ModuleCode): string {
    switch (moduleCode) {
      case "reglementation":
        return "Réglementation";
      case "chantier":
        return "Chantiers";
      case "facturation":
        return "Facturation";
    }
  }

  private toErrorMessage(error: unknown, context: UserErrorContext): string {
    if (error instanceof ApiClientError) {
      if (context === "auth" && (error.status === 401 || error.status === 403)) {
        return "Session invalide, reconnectez-vous.";
      }
      return error.detail;
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    switch (context) {
      case "save":
        return "Enregistrement indisponible.";
      case "update":
        return "Mise à jour indisponible.";
      case "load":
        return "Chargement administration indisponible.";
      case "auth":
      default:
        return "Action indisponible.";
    }
  }
}
