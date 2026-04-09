import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import type {
  BuildingSafetyItemRecord,
  OrganizationSiteRecord,
  RegulatoryEvidenceRecord,
} from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import {
  DESKTOP_REGULATION_PAGE_CONTEXT,
  type DesktopRegulationAllSiteItem,
  type DesktopRegulationPriorityItem,
} from "./desktop-regulation-page-context";

type SiteViewFilter = "all" | "actionable" | "ready";
type SiteDisplayStatus = "Critique" | "Échec d’enrichissement" | "Incomplet" | "À vérifier" | "Exploitable";

type SiteShowcaseAction = Pick<
  DesktopRegulationPriorityItem,
  "actionLabel" | "actionKind" | "sectionId" | "obligationId" | "siteId"
>;

type SiteActionTarget =
  | {
      kind: "focus";
      label: string;
    }
  | {
      kind: "showcase";
      action: SiteShowcaseAction;
    };

type RegulationSiteRow = {
  key: string;
  siteId: string | null;
  title: string;
  address: string | null;
  siteTypeLabel: string | null;
  sourceLabel: string;
  statusLabel: SiteDisplayStatus;
  statusTone: CfmTone;
  signalLabel: string;
  signalDetail: string;
  nextActionSummary: string;
  availableEvidenceCount: number;
  pendingEvidenceCount: number;
  proofGapCount: number;
  obligationIssueCount: number;
  overdueSafetyCount: number;
  dueSoonSafetyCount: number;
  declaredSite: OrganizationSiteRecord | null;
  primaryAction: SiteActionTarget | null;
  secondaryAction: SiteActionTarget | null;
  sortRank: number;
};

type SiteMatcher = {
  key: string;
  siteId: string | null;
  title?: string;
  name?: string;
};

@Component({
  selector: "cfm-desktop-regulation-sites-page",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="siteRows.length > 0; else emptyState">
      <section class="cfm-reg-page sites-workspace">
        <section class="cfm-reg-stage">
          <section class="cfm-reg-main">
            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Sites</span>
                  <h3 class="cfm-reg-section-title">Sites à suivre</h3>
                  <p>Le suivi des sites devient plus net : signaux principaux, contexte utile et action métier immédiate, sans mosaïque de widgets.</p>
                </div>

                <div class="cfm-reg-toolbar">
                  <div class="cfm-reg-filter-row" aria-label="Filtre sites">
                    <cfm-button
                      type="button"
                      size="sm"
                      [variant]="selectedViewFilter === 'all' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('all')"
                    >
                      Tous
                    </cfm-button>
                    <cfm-button
                      type="button"
                      size="sm"
                      [variant]="selectedViewFilter === 'actionable' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('actionable')"
                    >
                      À traiter
                    </cfm-button>
                    <cfm-button
                      type="button"
                      size="sm"
                      [variant]="selectedViewFilter === 'ready' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('ready')"
                    >
                      Exploitables
                    </cfm-button>
                  </div>
                </div>
              </header>

              <div class="cfm-reg-summary-row">
                <span class="cfm-reg-meta-pill">{{ filteredSiteRows.length }} visible{{ filteredSiteRows.length > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--warning">{{ actionableCount }} à traiter</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--danger">{{ failureCount }} en échec</span>
                <span class="cfm-reg-meta-pill">{{ incompleteCount }} incomplet{{ incompleteCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--success">{{ exploitableCount }} prêt{{ exploitableCount > 1 ? "s" : "" }}</span>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">À surveiller</span>
                  <h4 class="cfm-reg-section-title">Sites prioritaires</h4>
                  <p>Les sites qui demandent une reprise remontent d’abord, avec le bon point d’entrée entre enrichissement, preuves et obligations.</p>
                </div>
                <cfm-status-chip
                  [label]="priorityRows.length + ' priorité' + (priorityRows.length > 1 ? 's' : '')"
                  [tone]="priorityRows.length > 0 ? 'warning' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register" *ngIf="priorityRows.length > 0; else emptyPriorityList">
                <article
                  class="cfm-reg-priority-row site-priority-row"
                  *ngFor="let row of priorityRows; trackBy: trackBySiteRow"
                  [class.is-selected]="activeRow?.key === row.key"
                  (click)="selectRow(row)"
                >
                  <div class="cfm-reg-priority-copy">
                    <strong class="record-primary">{{ row.title }}</strong>
                    <span class="record-meta">{{ row.signalDetail }}</span>
                  </div>

                  <div class="site-priority-status">
                    <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                    <cfm-status-chip [label]="row.signalLabel" tone="calm" />
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ buildRegisterSummary(row) }}</strong>
                    <span class="record-meta">{{ row.nextActionSummary }}</span>
                  </div>

                  <cfm-button
                    type="button"
                    size="sm"
                    [disabled]="!canRunAction(row.primaryAction) || isActionBusy(row.primaryAction)"
                    (click)="runAction(row.primaryAction, row, $event)"
                  >
                    {{ getActionLabel(row.primaryAction) }}
                  </cfm-button>
                </article>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Vue principale</span>
                  <h4 class="cfm-reg-section-title">Registre sites</h4>
                  <p>Le registre garde une lecture terrain lisible : statut, cause utile, repère documentaire et action naturelle.</p>
                </div>
                <cfm-status-chip
                  [label]="filteredSiteRows.length + ' site' + (filteredSiteRows.length > 1 ? 's' : '')"
                  [tone]="filteredSiteRows.length > 0 ? 'calm' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register-head site-register-head" *ngIf="filteredSiteRows.length > 0">
                <span>Site</span>
                <span>État</span>
                <span>Repère</span>
                <span>Action utile</span>
              </div>

              <div class="cfm-reg-register" *ngIf="filteredSiteRows.length > 0; else emptyFilteredRegister">
                <button
                  *ngFor="let row of filteredSiteRows; trackBy: trackBySiteRow"
                  type="button"
                  class="cfm-reg-register-row site-register-row"
                  [class.is-selected]="activeRow?.key === row.key"
                  (click)="selectRow(row)"
                >
                  <div class="cfm-reg-register-cell">
                    <strong class="record-primary">{{ row.title }}</strong>
                    <span class="record-meta">
                      {{ row.address || row.sourceLabel }}
                      <ng-container *ngIf="row.address"> · {{ row.sourceLabel }}</ng-container>
                    </span>
                  </div>

                  <div class="cfm-reg-register-cell site-register-status">
                    <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                    <span class="record-meta">{{ row.signalLabel }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ buildRegisterSummary(row) }}</strong>
                    <span class="record-meta">{{ row.signalDetail }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ getActionLabel(row.primaryAction) }}</strong>
                    <span class="record-meta">{{ row.nextActionSummary }}</span>
                  </div>
                </button>
              </div>
            </article>
          </section>

          <aside class="cfm-reg-rail">
            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row; else emptyActivePanel">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Site en vue</span>
                  <h4 class="cfm-reg-section-title">{{ row.title }}</h4>
                </div>
                <div class="cfm-reg-chip-row">
                  <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                  <cfm-status-chip *ngIf="row.siteTypeLabel" [label]="row.siteTypeLabel" tone="calm" />
                </div>
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ row.signalLabel }}</strong>
                <span>{{ row.nextActionSummary }}</span>
              </div>

              <ul class="cfm-reg-data-list detail-copy">
                <li><span>Adresse</span><strong>{{ row.address || "Adresse à confirmer" }}</strong></li>
                <li><span>Origine</span><strong>{{ row.sourceLabel }}</strong></li>
                <li><span>Repère d’enrichissement</span><strong>{{ getEnrichmentLabel(row) }}</strong></li>
              </ul>

              <div class="cfm-reg-rail-actions">
                <cfm-button
                  type="button"
                  *ngIf="row.primaryAction"
                  [disabled]="!canRunAction(row.primaryAction) || isActionBusy(row.primaryAction)"
                  (click)="runAction(row.primaryAction, row)"
                >
                  {{ getActionLabel(row.primaryAction) }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  *ngIf="row.secondaryAction"
                  [disabled]="!canRunAction(row.secondaryAction) || isActionBusy(row.secondaryAction)"
                  (click)="runAction(row.secondaryAction, row)"
                >
                  {{ getActionLabel(row.secondaryAction) }}
                </cfm-button>
              </div>
            </section>

            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Sécurité & conformité</span>
                <h4 class="cfm-reg-section-title">Repères terrain</h4>
              </header>

              <ul class="cfm-reg-rail-list detail-copy">
                <li>
                  <div class="site-rail-copy">
                    <strong>Obligations</strong>
                    <span>{{ buildObligationContext(row) }}</span>
                  </div>
                </li>
                <li>
                  <div class="site-rail-copy">
                    <strong>Preuves</strong>
                    <span>{{ buildProofContext(row) }}</span>
                  </div>
                </li>
                <li>
                  <div class="site-rail-copy">
                    <strong>Sécurité bâtiment</strong>
                    <span>{{ buildSafetyPanelLabel() }}</span>
                  </div>
                </li>
              </ul>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="activeSafetyItems.length > 0">
                <li *ngFor="let item of activeSafetyItems; trackBy: trackBySafety">
                  <div class="site-rail-copy">
                    <strong>{{ item.label }}</strong>
                    <span>{{ ctx.getBuildingSafetyTypeLabel(item.item_type) }}</span>
                  </div>
                  <cfm-status-chip [label]="ctx.getBuildingSafetyAlertStatusLabel(item.alert_status)" [tone]="ctx.getBuildingSafetyAlertStatusTone(item.alert_status)" />
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #emptyPriorityList>
      <section class="cfm-reg-empty">
        <strong>Aucun site prioritaire</strong>
        <p>Les sites visibles sont déjà consolidés ou ne remontent aucun signal immédiat.</p>
      </section>
    </ng-template>

    <ng-template #emptyFilteredRegister>
      <section class="cfm-reg-empty">
        <strong>{{ getEmptyFilterTitle() }}</strong>
        <p>{{ getEmptyFilterDescription() }}</p>
      </section>
    </ng-template>

    <ng-template #emptyActivePanel>
      <section class="cfm-reg-empty">
        <strong>{{ getEmptyFilterTitle() }}</strong>
        <p>{{ getEmptyFilterDescription() }}</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucun site réglementaire"
        description="Les sites apparaitront ici dès qu’un premier périmètre terrain ou documentaire sera visible."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .site-priority-row,
      .site-register-head,
      .site-register-row {
        display: grid;
        gap: 1rem;
        align-items: center;
      }

      .site-priority-row {
        grid-template-columns: minmax(0, 1.1fr) auto minmax(0, 1fr) auto;
      }

      .site-register-head,
      .site-register-row {
        grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.76fr) minmax(0, 1fr) minmax(0, 0.92fr);
      }

      .site-priority-status,
      .site-register-status,
      .site-rail-copy {
        display: grid;
        gap: 0.22rem;
      }

      @media (max-width: 1180px) {
        .site-priority-row,
        .site-register-head,
        .site-register-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopRegulationSitesPageComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);

  selectedViewFilter: SiteViewFilter = "actionable";
  private activeSiteKey: string | null = null;

  get siteRows(): RegulationSiteRow[] {
    return this.ctx.regulatoryAllSites
      .map((site) => this.buildSiteRow(site))
      .sort((left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title));
  }

  get filteredSiteRows(): RegulationSiteRow[] {
    return this.filterRows(this.selectedViewFilter);
  }

  get priorityRows(): RegulationSiteRow[] {
    return this.filteredSiteRows.filter((row) => row.statusLabel !== "Exploitable").slice(0, 3);
  }

  get activeRow(): RegulationSiteRow | null {
    if (this.activeSiteKey) {
      const explicit = this.filteredSiteRows.find((row) => row.key === this.activeSiteKey);
      if (explicit) {
        return explicit;
      }
    }
    return this.filteredSiteRows[0] ?? null;
  }

  get activeSafetyItems(): BuildingSafetyItemRecord[] {
    const row = this.activeRow;
    if (!row) {
      return [];
    }
    return this.findSafetyItems(row).slice(0, 3);
  }

  get actionableCount(): number {
    return this.siteRows.filter((row) => row.statusLabel !== "Exploitable").length;
  }

  get incompleteCount(): number {
    return this.siteRows.filter((row) => row.statusLabel === "Incomplet").length;
  }

  get verifyCount(): number {
    return this.siteRows.filter((row) => row.statusLabel === "À vérifier").length;
  }

  get failureCount(): number {
    return this.siteRows.filter((row) => row.statusLabel === "Échec d’enrichissement").length;
  }

  get exploitableCount(): number {
    return this.siteRows.filter((row) => row.statusLabel === "Exploitable").length;
  }

  setViewFilter(filter: SiteViewFilter): void {
    this.selectedViewFilter = filter;
    const filteredRows = this.filterRows(filter);
    if (filteredRows.length === 0) {
      this.activeSiteKey = null;
      return;
    }
    if (!this.activeSiteKey || !filteredRows.some((row) => row.key === this.activeSiteKey)) {
      this.selectRow(filteredRows[0]);
    }
  }

  selectRow(row: RegulationSiteRow): void {
    this.activeSiteKey = row.key;
  }

  trackBySiteRow(_index: number, item: RegulationSiteRow): string {
    return item.key;
  }

  trackBySafety(_index: number, item: { id: string }): string {
    return item.id;
  }

  getActionLabel(target: SiteActionTarget | null): string {
    if (!target) {
      return "Ouvrir le site";
    }
    if (target.kind === "focus") {
      return target.label;
    }
    return this.ctx.getRegulatoryShowcaseActionLabel(target.action);
  }

  isActionBusy(target: SiteActionTarget | null): boolean {
    if (!target || target.kind === "focus") {
      return false;
    }
    return this.ctx.isRegulatoryShowcaseActionBusy(target.action);
  }

  canRunAction(target: SiteActionTarget | null): boolean {
    if (!target || target.kind === "focus") {
      return true;
    }
    return target.action.actionKind !== "site_enrichment" || this.ctx.canActOnReglementation;
  }

  runAction(target: SiteActionTarget | null, row: RegulationSiteRow, event?: Event): void {
    event?.stopPropagation();
    if (!target || target.kind === "focus") {
      this.selectRow(row);
      return;
    }
    if (!this.canRunAction(target)) {
      return;
    }
    void this.ctx.runRegulatoryShowcaseAction(target.action);
  }

  hasObligationAction(row: RegulationSiteRow): boolean {
    return this.findObligationItems(row).length > 0;
  }

  hasProofAction(row: RegulationSiteRow): boolean {
    return this.findProofGapItems(row).length > 0 || this.findEvidences(row).length > 0;
  }

  createProofOrObligationAction(kind: "proofs" | "obligations", row: RegulationSiteRow): SiteActionTarget {
    return {
      kind: "showcase",
      action: {
        actionLabel: kind === "proofs" ? "Voir les preuves" : "Voir les obligations",
        actionKind: "scroll",
        sectionId: kind === "proofs" ? "reg-evidence-section" : "reg-obligations-section",
        obligationId: null,
        siteId: row.siteId,
      },
    };
  }

  buildRegisterSummary(row: RegulationSiteRow): string {
    const fragments = [
      row.proofGapCount > 0 ? `${row.proofGapCount} preuve${row.proofGapCount > 1 ? "s" : ""} manquante${row.proofGapCount > 1 ? "s" : ""}` : null,
      row.pendingEvidenceCount > 0 ? `${row.pendingEvidenceCount} à régulariser` : null,
      row.overdueSafetyCount > 0 ? `${row.overdueSafetyCount} contrôle${row.overdueSafetyCount > 1 ? "s" : ""} en retard` : null,
      row.dueSoonSafetyCount > 0 ? `${row.dueSoonSafetyCount} proche${row.dueSoonSafetyCount > 1 ? "s" : ""}` : null,
    ].filter((fragment): fragment is string => Boolean(fragment));

    return fragments[0] ?? "lecture stable";
  }

  buildObligationContext(row: RegulationSiteRow): string {
    const linked = this.findObligationItems(row);
    if (linked.length === 0) {
      return "Aucun point obligation directement remonté pour ce site.";
    }
    const head = linked[0];
    return `${linked.length} point${linked.length > 1 ? "s" : ""} · ${head.title}`;
  }

  buildProofContext(row: RegulationSiteRow): string {
    if (row.proofGapCount > 0) {
      return `${row.proofGapCount} preuve${row.proofGapCount > 1 ? "s" : ""} manquante${row.proofGapCount > 1 ? "s" : ""} à couvrir.`;
    }
    if (row.pendingEvidenceCount > 0) {
      return `${row.pendingEvidenceCount} document${row.pendingEvidenceCount > 1 ? "s" : ""} à régulariser.`;
    }
    if (row.availableEvidenceCount > 0) {
      return `${row.availableEvidenceCount} preuve${row.availableEvidenceCount > 1 ? "s" : ""} déjà disponible${row.availableEvidenceCount > 1 ? "s" : ""}.`;
    }
    return "Aucune preuve directement rattachée pour le moment.";
  }

  buildSafetyPanelLabel(): string {
    const row = this.activeRow;
    if (!row) {
      return "Aucun site actif";
    }
    if (row.overdueSafetyCount > 0) {
      return `${row.overdueSafetyCount} en retard`;
    }
    if (row.dueSoonSafetyCount > 0) {
      return `${row.dueSoonSafetyCount} à surveiller`;
    }
    return "Calme";
  }

  getEmptyFilterTitle(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Aucun site à traiter";
      case "ready":
        return "Aucun site exploitable";
      case "all":
      default:
        return "Aucun site visible";
    }
  }

  getEmptyFilterDescription(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Les sites visibles sont déjà consolidés ou ne remontent aucun signal immédiat.";
      case "ready":
        return "Aucun site actuellement visible n’est encore considéré comme exploitable.";
      case "all":
      default:
        return "Le registre sites se remplira dès que des sites, preuves ou repères sécurité seront présents.";
    }
  }

  getEnrichmentLabel(row: RegulationSiteRow): string {
    if (!row.declaredSite) {
      return "Aucun site déclaré encore relié.";
    }
    const enrichment = this.ctx.getSiteEnrichmentUiState(row.declaredSite);
    return enrichment.reasonLabel ?? enrichment.detail;
  }

  private buildSiteRow(site: DesktopRegulationAllSiteItem): RegulationSiteRow {
    const evidences = this.findEvidences(site);
    const availableEvidenceCount = evidences.filter((evidence) => evidence.status === "available").length;
    const pendingEvidenceCount = evidences.filter((evidence) =>
      evidence.status !== "available" && evidence.status !== "archived"
    ).length;
    const proofGapItems = this.findProofGapItems(site);
    const obligationItems = this.findObligationItems(site);
    const safetyItems = this.findSafetyItems(site);
    const overdueSafetyCount = safetyItems.filter((item) => item.alert_status === "overdue").length;
    const dueSoonSafetyCount = safetyItems.filter((item) => item.alert_status === "due_soon").length;
    const enrichmentState = site.declaredSite ? this.ctx.getSiteEnrichmentUiState(site.declaredSite) : null;
    const criticalObligationCount = obligationItems.filter((item) => item.levelLabel === "Critique" || item.tone === "danger").length;
    const criticalProofCount = proofGapItems.filter((item) => item.levelLabel === "Critique" || item.tone === "danger").length;
    const siteTypeLabel = site.declaredSite ? this.ctx.getSiteTypeLabel(site.declaredSite.site_type) : null;

    let statusLabel: SiteDisplayStatus = "Exploitable";
    let statusTone: CfmTone = "success";
    let signalLabel = "Site exploitable";
    let signalDetail =
      availableEvidenceCount > 0
        ? `${availableEvidenceCount} preuve${availableEvidenceCount > 1 ? "s" : ""} déjà disponible${availableEvidenceCount > 1 ? "s" : ""} pour ce site.`
        : "Le site est visible et ne remonte pas de signal réglementaire bloquant.";
    let sortRank = 50;

    if (overdueSafetyCount > 0 || criticalObligationCount > 0 || criticalProofCount > 0) {
      statusLabel = "Critique";
      statusTone = "danger";
      sortRank = 0;
      if (overdueSafetyCount > 0) {
        signalLabel = "Contrôle en retard";
        signalDetail = `${overdueSafetyCount} contrôle${overdueSafetyCount > 1 ? "s bâtiment sont" : " bâtiment est"} en retard pour ce site.`;
      } else if (criticalProofCount > 0) {
        signalLabel = "Preuve bloquante";
        signalDetail = proofGapItems[0]?.impact ?? "Une preuve critique manque pour ce site.";
      } else {
        signalLabel = "Obligation critique";
        signalDetail = obligationItems[0]?.impact ?? "Une obligation liée remonte en priorité haute pour ce site.";
      }
    } else if (site.declaredSite?.location_enrichment_status === "failed") {
      statusLabel = "Échec d’enrichissement";
      statusTone = "danger";
      signalLabel = "Enrichissement en échec";
      signalDetail = enrichmentState?.reasonLabel ?? enrichmentState?.detail ?? "Le site n’a pas pu être enrichi.";
      sortRank = 5;
    } else if (!site.declaredSite || site.declaredSite.location_enrichment_status == null || proofGapItems.length > 0) {
      statusLabel = "Incomplet";
      statusTone = "progress";
      sortRank = 12;
      if (!site.declaredSite) {
        signalLabel = "Site à confirmer";
        signalDetail = `Le site apparait déjà dans ${this.getSourceKindsLabel(site).toLowerCase()} mais n’est pas encore consolidé comme site déclaré.`;
      } else if (proofGapItems.length > 0) {
        signalLabel = "Preuve liée absente";
        signalDetail = proofGapItems[0]?.impact ?? "Des preuves liées restent à rattacher ou compléter pour ce site.";
      } else {
        signalLabel = "Enrichissement non lancé";
        signalDetail = enrichmentState?.detail ?? "Le site doit encore être enrichi pour fiabiliser la lecture réglementaire.";
      }
    } else if (
      site.declaredSite.location_enrichment_status === "no_match"
      || site.declaredSite.location_enrichment_status === "partial"
      || pendingEvidenceCount > 0
      || dueSoonSafetyCount > 0
      || obligationItems.length > 0
    ) {
      statusLabel = "À vérifier";
      statusTone = "warning";
      sortRank = 20;
      if (site.declaredSite.location_enrichment_status === "no_match") {
        signalLabel = "Adresse à vérifier";
        signalDetail = enrichmentState?.reasonLabel ?? enrichmentState?.detail ?? "L’adresse du site reste à confirmer.";
      } else if (site.declaredSite.location_enrichment_status === "partial") {
        signalLabel = "Site à compléter";
        signalDetail = enrichmentState?.reasonLabel ?? enrichmentState?.detail ?? "Le site a été enrichi partiellement.";
      } else if (pendingEvidenceCount > 0) {
        signalLabel = "Document à régulariser";
        signalDetail = `${pendingEvidenceCount} document${pendingEvidenceCount > 1 ? "s restent" : " reste"} présent${pendingEvidenceCount > 1 ? "s" : ""} mais non exploitable${pendingEvidenceCount > 1 ? "s" : ""}.`;
      } else if (dueSoonSafetyCount > 0) {
        signalLabel = "Échéance proche";
        signalDetail = `${dueSoonSafetyCount} contrôle${dueSoonSafetyCount > 1 ? "s arrivent" : " arrive"} bientôt à échéance.`;
      } else {
        signalLabel = "Statut à confirmer";
        signalDetail = obligationItems[0]?.impact ?? "Une obligation liée mérite une vérification rapide.";
      }
    }

    const primaryAction = this.buildPrimaryAction(site, {
      hasProofGap: proofGapItems.length > 0 || pendingEvidenceCount > 0,
      hasObligationIssue: obligationItems.length > 0,
      hasSafetySignal: overdueSafetyCount > 0 || dueSoonSafetyCount > 0,
    });
    const secondaryAction = this.buildSecondaryAction(site, primaryAction, {
      hasProofGap: proofGapItems.length > 0 || pendingEvidenceCount > 0,
      hasObligationIssue: obligationItems.length > 0 || overdueSafetyCount > 0 || dueSoonSafetyCount > 0,
    });

    return {
      key: site.key,
      siteId: site.siteId,
      title: site.name,
      address: site.address,
      siteTypeLabel,
      sourceLabel: this.getSourceKindsLabel(site),
      statusLabel,
      statusTone,
      signalLabel,
      signalDetail,
      nextActionSummary: this.getNextActionSummary(statusLabel, site, proofGapItems.length, pendingEvidenceCount, obligationItems.length),
      availableEvidenceCount,
      pendingEvidenceCount,
      proofGapCount: proofGapItems.length,
      obligationIssueCount: obligationItems.length,
      overdueSafetyCount,
      dueSoonSafetyCount,
      declaredSite: site.declaredSite,
      primaryAction,
      secondaryAction,
      sortRank,
    };
  }

  private buildPrimaryAction(
    site: DesktopRegulationAllSiteItem,
    flags: { hasProofGap: boolean; hasObligationIssue: boolean; hasSafetySignal: boolean }
  ): SiteActionTarget | null {
    if (site.declaredSite && site.declaredSite.location_enrichment_status !== "enriched") {
      const enrichment = this.ctx.getSiteEnrichmentUiState(site.declaredSite);
      return {
        kind: "showcase",
        action: {
          actionLabel: enrichment.retryLabel,
          actionKind: "site_enrichment",
          sectionId: "reg-sites-section",
          obligationId: null,
          siteId: site.declaredSite.id,
        },
      };
    }

    if (flags.hasProofGap) {
      return {
        kind: "showcase",
        action: {
          actionLabel: "Voir les preuves",
          actionKind: "scroll",
          sectionId: "reg-evidence-section",
          obligationId: null,
          siteId: site.siteId,
        },
      };
    }

    if (flags.hasObligationIssue || flags.hasSafetySignal) {
      return {
        kind: "showcase",
        action: {
          actionLabel: "Voir les obligations",
          actionKind: "scroll",
          sectionId: "reg-obligations-section",
          obligationId: null,
          siteId: site.siteId,
        },
      };
    }

    return {
      kind: "focus",
      label: "Ouvrir le site",
    };
  }

  private buildSecondaryAction(
    site: DesktopRegulationAllSiteItem,
    primaryAction: SiteActionTarget | null,
    flags: { hasProofGap: boolean; hasObligationIssue: boolean }
  ): SiteActionTarget | null {
    const primarySection =
      primaryAction?.kind === "showcase"
        ? primaryAction.action.sectionId
        : null;

    if (primaryAction?.kind === "showcase" && primaryAction.action.actionKind === "site_enrichment") {
      if (flags.hasProofGap) {
        return {
          kind: "showcase",
          action: {
            actionLabel: "Voir les preuves",
            actionKind: "scroll",
            sectionId: "reg-evidence-section",
            obligationId: null,
            siteId: site.siteId,
          },
        };
      }
      if (flags.hasObligationIssue) {
        return {
          kind: "showcase",
          action: {
            actionLabel: "Voir les obligations",
            actionKind: "scroll",
            sectionId: "reg-obligations-section",
            obligationId: null,
            siteId: site.siteId,
          },
        };
      }
    }

    if (flags.hasProofGap && primarySection !== "reg-evidence-section") {
      return {
        kind: "showcase",
        action: {
          actionLabel: "Voir les preuves",
          actionKind: "scroll",
          sectionId: "reg-evidence-section",
          obligationId: null,
          siteId: site.siteId,
        },
      };
    }

    if (flags.hasObligationIssue && primarySection !== "reg-obligations-section") {
      return {
        kind: "showcase",
        action: {
          actionLabel: "Voir les obligations",
          actionKind: "scroll",
          sectionId: "reg-obligations-section",
          obligationId: null,
          siteId: site.siteId,
        },
      };
    }

    return null;
  }

  private getNextActionSummary(
    statusLabel: SiteDisplayStatus,
    site: DesktopRegulationAllSiteItem,
    proofGapCount: number,
    pendingEvidenceCount: number,
    obligationIssueCount: number
  ): string {
    if (site.declaredSite && site.declaredSite.location_enrichment_status !== "enriched") {
      return "Relancez ou complétez l’enrichissement pour fiabiliser l’adresse et la lecture réglementaire du site.";
    }
    if (proofGapCount > 0) {
      return "Passez par les preuves pour rattacher les pièces manquantes et sécuriser la couverture documentaire du site.";
    }
    if (pendingEvidenceCount > 0) {
      return "Régularisez les documents déjà présents pour qu’ils deviennent réellement mobilisables.";
    }
    if (obligationIssueCount > 0) {
      return "Ouvrez les obligations liées pour traiter le point réglementaire qui fait remonter ce site.";
    }
    if (statusLabel === "Exploitable") {
      return "Aucune reprise urgente. Gardez ce site comme base stable de lecture réglementaire.";
    }
    return "Vérifiez le contexte du site et confirmez les informations encore incomplètes.";
  }

  private findEvidences(site: SiteMatcher): RegulatoryEvidenceRecord[] {
    return this.ctx.filteredRegulatoryEvidences.filter((evidence) =>
      this.matchesSite(site, evidence.site_id, evidence.link_kind === "site" ? evidence.link_label : null)
    );
  }

  private findProofGapItems(site: SiteMatcher): DesktopRegulationPriorityItem[] {
    return this.ctx.regulatoryProofGapItems.filter((item) => this.matchesSite(site, item.siteId, item.focusLabel));
  }

  private findObligationItems(site: SiteMatcher): DesktopRegulationPriorityItem[] {
    return this.ctx.regulatoryObligationActionItems.filter((item) => this.matchesSite(site, item.siteId, item.focusLabel));
  }

  private findSafetyItems(site: SiteMatcher): BuildingSafetyItemRecord[] {
    return this.ctx.filteredBuildingSafetyItems.filter((item) => this.matchesSite(site, item.site_id, item.site_name));
  }

  private matchesSite(site: SiteMatcher, siteId: string | null, siteName: string | null): boolean {
    if (site.siteId && siteId) {
      return site.siteId === siteId;
    }
    if (!siteName) {
      return false;
    }
    return this.normalizeText(site.name ?? site.title) === this.normalizeText(siteName);
  }

  private filterRows(filter: SiteViewFilter): RegulationSiteRow[] {
    switch (filter) {
      case "actionable":
        return this.siteRows.filter((row) => row.statusLabel !== "Exploitable");
      case "ready":
        return this.siteRows.filter((row) => row.statusLabel === "Exploitable");
      case "all":
      default:
        return this.siteRows;
    }
  }

  private getSourceKindsLabel(site: DesktopRegulationAllSiteItem): string {
    const labels = site.sourceKinds.map((kind) => {
      switch (kind) {
        case "declared":
          return "site déclaré";
        case "duerp":
          return "DUERP";
        case "building_safety":
          return "sécurité bâtiment";
        case "evidence":
          return "preuves";
      }
    });
    return labels.join(" · ");
  }

  private normalizeText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim()
      .toLocaleLowerCase("fr-FR");
  }
}
