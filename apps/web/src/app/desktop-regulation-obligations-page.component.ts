import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import type {
  ApplicableRegulatoryObligationRecord,
  RegulatoryCriterionRecord,
  RegulatoryEvidenceRecord,
} from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import {
  DESKTOP_REGULATION_PAGE_CONTEXT,
  type DesktopRegulationPriorityItem,
} from "./desktop-regulation-page-context";

type ObligationRowItem = {
  obligation: ApplicableRegulatoryObligationRecord;
  actionItem: DesktopRegulationPriorityItem | null;
  proofItem: DesktopRegulationPriorityItem | null;
  availableEvidenceCount: number;
  pendingEvidenceCount: number;
  evidenceCount: number;
  displayStatusLabel: "Critique" | "Incomplet" | "À vérifier" | "Conforme";
  displayStatusTone: CfmTone;
  causeLabel: string;
  causeDetail: string;
  nextActionSummary: string;
  primaryAction: DesktopRegulationPriorityItem | null;
  secondaryAction: DesktopRegulationPriorityItem | null;
  sortRank: number;
};

type ObligationViewFilter = "all" | "actionable" | "compliant";

@Component({
  selector: "cfm-desktop-regulation-obligations-page",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="obligationRows.length > 0; else emptyState">
      <section class="cfm-reg-page obligations-workspace">
        <section class="cfm-reg-stage">
          <section class="cfm-reg-main">
            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Registre</span>
                  <h3 class="cfm-reg-section-title">Obligations</h3>
                  <p>Les obligations prioritaires, leur cause et la bonne action remontent maintenant dans une lecture plus directe et plus métier.</p>
                </div>

                <div class="cfm-reg-toolbar">
                  <div class="cfm-reg-filter-row" aria-label="Filtre obligations">
                    <cfm-button
                      type="button"
                      size="sm"
                      [variant]="selectedViewFilter === 'all' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('all')"
                    >
                      Toutes
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
                      [variant]="selectedViewFilter === 'compliant' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('compliant')"
                    >
                      Conformes
                    </cfm-button>
                  </div>
                </div>
              </header>

              <div class="cfm-reg-summary-row">
                <span class="cfm-reg-meta-pill">{{ filteredObligationRows.length }} visible{{ filteredObligationRows.length > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--danger">{{ criticalCount }} critique{{ criticalCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--warning">{{ incompleteCount }} incomplète{{ incompleteCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--progress">{{ missingProofCount }} sans pièce</span>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">À surveiller</span>
                  <h4 class="cfm-reg-section-title">Obligations prioritaires</h4>
                  <p>Le premier geste utile ressort immédiatement, sans disperser l’utilisateur entre plusieurs panneaux ou outils annexes.</p>
                </div>
                <cfm-status-chip
                  [label]="priorityRows.length + ' priorité' + (priorityRows.length > 1 ? 's' : '')"
                  [tone]="priorityRows.length > 0 ? 'warning' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register" *ngIf="priorityRows.length > 0; else emptyPriorityList">
                <article
                  class="cfm-reg-priority-row obligation-priority-row"
                  *ngFor="let row of priorityRows; trackBy: trackByObligationRow"
                  [class.is-selected]="activeRow?.obligation.id === row.obligation.id"
                  (click)="selectObligation(row)"
                >
                  <div class="cfm-reg-priority-copy">
                    <strong class="record-primary">{{ row.obligation.title }}</strong>
                    <span class="record-meta">{{ row.causeDetail }}</span>
                  </div>

                  <div class="obligation-priority-status">
                    <cfm-status-chip [label]="row.displayStatusLabel" [tone]="row.displayStatusTone" />
                    <cfm-status-chip [label]="row.causeLabel" tone="calm" />
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ buildEvidenceSummary(row) }}</strong>
                    <span class="record-meta">{{ row.nextActionSummary }}</span>
                  </div>

                  <cfm-button
                    type="button"
                    size="sm"
                    [disabled]="!row.primaryAction || ctx.isRegulatoryShowcaseActionBusy(row.primaryAction)"
                    (click)="runPriorityAction(row.primaryAction, $event)"
                  >
                    {{ getPrimaryActionLabel(row) }}
                  </cfm-button>
                </article>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Vue principale</span>
                  <h4 class="cfm-reg-section-title">Registre obligations</h4>
                  <p>Le registre central garde la hiérarchie des statuts, des preuves et de l’action utile. Le rail droit reste un appui.</p>
                </div>
                <cfm-status-chip
                  [label]="filteredObligationRows.length + ' obligation' + (filteredObligationRows.length > 1 ? 's' : '')"
                  [tone]="filteredObligationRows.length > 0 ? 'calm' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register-head obligation-register-head" *ngIf="filteredObligationRows.length > 0">
                <span>Obligation</span>
                <span>État</span>
                <span>Repère</span>
                <span>Action utile</span>
              </div>

              <div class="cfm-reg-register" *ngIf="filteredObligationRows.length > 0; else emptyFilteredRegister">
                <button
                  *ngFor="let row of filteredObligationRows; trackBy: trackByObligationRow"
                  type="button"
                  class="cfm-reg-register-row obligation-register-row"
                  [class.is-selected]="activeRow?.obligation.id === row.obligation.id"
                  (click)="selectObligation(row)"
                >
                  <div class="cfm-reg-register-cell">
                    <strong class="record-primary">{{ row.obligation.title }}</strong>
                    <span class="record-meta">{{ row.obligation.description }}</span>
                  </div>

                  <div class="cfm-reg-register-cell obligation-register-status">
                    <cfm-status-chip [label]="row.displayStatusLabel" [tone]="row.displayStatusTone" />
                    <span class="record-meta">{{ row.causeLabel }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ buildEvidenceSummary(row) }}</strong>
                    <span class="record-meta">{{ row.causeDetail }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ getPrimaryActionLabel(row) }}</strong>
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
                  <span class="panel-kicker">Obligation en vue</span>
                  <h4 class="cfm-reg-section-title">{{ row.obligation.title }}</h4>
                </div>
                <div class="cfm-reg-chip-row">
                  <cfm-status-chip [label]="row.displayStatusLabel" [tone]="row.displayStatusTone" />
                  <cfm-status-chip [label]="ctx.getObligationCategoryLabel(row.obligation.category)" tone="calm" />
                </div>
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ row.causeLabel }}</strong>
                <span>{{ row.nextActionSummary }}</span>
              </div>

              <ul class="cfm-reg-data-list detail-copy">
                <li><span>Priorité</span><strong>{{ ctx.getObligationPriorityLabel(row.obligation.priority) }}</strong></li>
                <li><span>Preuves</span><strong>{{ buildEvidenceSummary(row) }}</strong></li>
                <li><span>Cause</span><strong>{{ row.causeDetail }}</strong></li>
              </ul>

              <div class="cfm-reg-rail-actions">
                <cfm-button
                  type="button"
                  *ngIf="row.primaryAction"
                  [disabled]="ctx.isRegulatoryShowcaseActionBusy(row.primaryAction)"
                  (click)="runPriorityAction(row.primaryAction)"
                >
                  {{ ctx.getRegulatoryShowcaseActionLabel(row.primaryAction) }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  *ngIf="row.secondaryAction"
                  [disabled]="ctx.isRegulatoryShowcaseActionBusy(row.secondaryAction)"
                  (click)="runPriorityAction(row.secondaryAction)"
                >
                  {{ ctx.getRegulatoryShowcaseActionLabel(row.secondaryAction) }}
                </cfm-button>
              </div>
            </section>

            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Pourquoi ça remonte</span>
                <h4 class="cfm-reg-section-title">Critères & contexte</h4>
              </header>

              <p class="detail-copy">{{ row.causeDetail }}</p>
              <ul class="cfm-reg-rail-list detail-copy" *ngIf="activeCriteria.length > 0">
                <li *ngFor="let criterion of activeCriteria; trackBy: trackByCriterion">
                  <div class="obligation-rail-copy">
                    <strong>{{ criterion.summary }}</strong>
                  </div>
                </li>
              </ul>
            </section>

            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Appuis métier</span>
                <h4 class="cfm-reg-section-title">Pièces & prévention</h4>
              </header>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="activeEvidences.length > 0; else emptyEvidences">
                <li *ngFor="let evidence of activeEvidences; trackBy: trackByEvidence">
                  <div class="obligation-rail-copy">
                    <strong>{{ evidence.file_name }}</strong>
                    <span>{{ evidence.document_type }} · {{ ctx.getDocumentStatusLabel(evidence.status) }}</span>
                    <span *ngIf="evidence.uploaded_at">Ajouté le {{ evidence.uploaded_at | date:'shortDate' }}</span>
                    <span *ngIf="evidence.notes">{{ evidence.notes }}</span>
                  </div>
                  <cfm-status-chip
                    [label]="ctx.getDocumentStatusLabel(evidence.status)"
                    [tone]="ctx.getDocumentStatusTone(evidence.status)"
                  />
                </li>
              </ul>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="visibleDuerpEntries.length > 0; else emptyDuerp">
                <li *ngFor="let entry of visibleDuerpEntries; trackBy: trackByDuerp">
                  <div class="obligation-rail-copy">
                    <strong>{{ entry.risk_label }}</strong>
                    <span>{{ entry.work_unit_name }}<ng-container *ngIf="entry.site_name"> · {{ entry.site_name }}</ng-container></span>
                    <span *ngIf="entry.prevention_action">{{ entry.prevention_action }}</span>
                  </div>
                  <div class="cfm-reg-chip-row">
                    <cfm-status-chip [label]="ctx.getDuerpSeverityLabel(entry.severity)" [tone]="ctx.getDuerpSeverityTone(entry.severity)" />
                    <cfm-status-chip [label]="ctx.getComplianceStatusLabel(entry.compliance_status)" [tone]="ctx.getComplianceStatusTone(entry.compliance_status)" />
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #emptyPriorityList>
      <section class="cfm-reg-empty">
        <strong>Aucune obligation prioritaire</strong>
        <p>Les obligations visibles sont déjà calmes ou couvertes.</p>
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

    <ng-template #emptyEvidences>
      <section class="cfm-reg-empty">
        <strong>Aucune pièce liée</strong>
        <p>Aucune pièce disponible n’est encore rattachée à cette obligation.</p>
      </section>
    </ng-template>

    <ng-template #emptyDuerp>
      <section class="cfm-reg-empty">
        <strong>Aucun repère prévention</strong>
        <p>Aucun risque DUERP saisi pour le moment.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucune obligation réglementaire"
        description="Les obligations apparaitront ici dès que le profil réglementaire sera disponible."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .obligation-priority-row,
      .obligation-register-head,
      .obligation-register-row {
        display: grid;
        gap: 1rem;
        align-items: center;
      }

      .obligation-priority-row {
        grid-template-columns: minmax(0, 1.18fr) auto minmax(0, 1fr) auto;
      }

      .obligation-register-head,
      .obligation-register-row {
        grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.74fr) minmax(0, 1fr) minmax(0, 0.94fr);
      }

      .obligation-priority-status,
      .obligation-register-status,
      .obligation-rail-copy {
        display: grid;
        gap: 0.22rem;
      }

      @media (max-width: 1180px) {
        .obligation-priority-row,
        .obligation-register-head,
        .obligation-register-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopRegulationObligationsPageComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);
  selectedViewFilter: ObligationViewFilter = "actionable";

  get obligationRows(): ObligationRowItem[] {
    const obligations = this.ctx.regulatoryProfile?.applicable_obligations ?? [];
    return [...obligations]
      .map((obligation) => this.buildObligationRow(obligation))
      .sort((left, right) =>
        left.sortRank - right.sortRank
        || this.getPriorityRank(left.obligation.priority) - this.getPriorityRank(right.obligation.priority)
        || left.obligation.title.localeCompare(right.obligation.title)
      );
  }

  get filteredObligationRows(): ObligationRowItem[] {
    return this.filterRows(this.selectedViewFilter);
  }

  get priorityRows(): ObligationRowItem[] {
    return this.filteredObligationRows.filter((row) => row.displayStatusLabel !== "Conforme").slice(0, 3);
  }

  get activeRow(): ObligationRowItem | null {
    const selectedId = this.ctx.selectedRegulatoryObligation?.id ?? null;
    return this.filteredObligationRows.find((row) => row.obligation.id === selectedId) ?? this.filteredObligationRows[0] ?? null;
  }

  get activeCriteria(): RegulatoryCriterionRecord[] {
    const active = this.activeRow?.obligation;
    if (!active || !this.ctx.regulatoryProfile) {
      return [];
    }
    return this.ctx.regulatoryProfile.criteria.filter((criterion) => active.matched_criteria.includes(criterion.code));
  }

  get activeEvidences(): RegulatoryEvidenceRecord[] {
    const obligationId = this.activeRow?.obligation.id ?? null;
    if (!obligationId) {
      return [];
    }
    return this.ctx.filteredRegulatoryEvidences.filter((evidence) => evidence.obligation_id === obligationId);
  }

  get visibleDuerpEntries() {
    return this.ctx.filteredDuerpEntries.slice(0, 3);
  }

  get criticalCount(): number {
    return this.obligationRows.filter((row) => row.displayStatusLabel === "Critique").length;
  }

  get incompleteCount(): number {
    return this.obligationRows.filter((row) => row.displayStatusLabel === "Incomplet").length;
  }

  get missingProofCount(): number {
    return this.obligationRows.filter((row) => row.availableEvidenceCount === 0).length;
  }

  setViewFilter(filter: ObligationViewFilter): void {
    this.selectedViewFilter = filter;
    const filteredRows = this.filterRows(filter);
    const selectedId = this.ctx.selectedRegulatoryObligation?.id ?? null;
    if (filteredRows.length === 0) {
      return;
    }
    if (!selectedId || !filteredRows.some((row) => row.obligation.id === selectedId)) {
      this.ctx.openObligationDetail(filteredRows[0].obligation.id);
    }
  }

  selectObligation(row: ObligationRowItem): void {
    this.ctx.openObligationDetail(row.obligation.id);
  }

  buildEvidenceSummary(row: ObligationRowItem): string {
    if (row.availableEvidenceCount === 0 && row.pendingEvidenceCount === 0) {
      return "Aucune preuve disponible";
    }
    if (row.availableEvidenceCount === 0 && row.pendingEvidenceCount > 0) {
      return `${row.pendingEvidenceCount} document${row.pendingEvidenceCount > 1 ? "s à régulariser" : " à régulariser"}`;
    }
    if (row.pendingEvidenceCount > 0) {
      return `${row.availableEvidenceCount} disponible${row.availableEvidenceCount > 1 ? "s" : ""} · ${row.pendingEvidenceCount} à régulariser`;
    }
    return `${row.availableEvidenceCount} preuve${row.availableEvidenceCount > 1 ? "s" : ""} disponible${row.availableEvidenceCount > 1 ? "s" : ""}`;
  }

  getPrimaryActionLabel(row: ObligationRowItem): string {
    if (!row.primaryAction) {
      return "Ouvrir";
    }
    return this.ctx.getRegulatoryShowcaseActionLabel(row.primaryAction);
  }

  runPriorityAction(item: DesktopRegulationPriorityItem | null, event?: Event): void {
    event?.stopPropagation();
    if (!item) {
      return;
    }
    void this.ctx.runRegulatoryShowcaseAction(item);
  }

  trackByCriterion(_index: number, item: { code?: string; summary: string }): string {
    return item.code ?? item.summary;
  }

  trackByObligationRow(_index: number, item: ObligationRowItem): string {
    return item.obligation.id;
  }

  trackByEvidence(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByDuerp(_index: number, item: { id: string }): string {
    return item.id;
  }

  getEmptyFilterTitle(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Aucune obligation à traiter";
      case "compliant":
        return "Aucune obligation conforme";
      case "all":
      default:
        return "Aucune obligation visible";
    }
  }

  getEmptyFilterDescription(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Les obligations à traiter sont déjà couvertes pour le moment.";
      case "compliant":
        return "Aucune obligation actuellement visible n’est encore considérée comme conforme.";
      case "all":
      default:
        return "La liste se remplira dès que le périmètre réglementaire sera détecté.";
    }
  }

  private buildObligationRow(obligation: ApplicableRegulatoryObligationRecord): ObligationRowItem {
    const evidences = this.ctx.filteredRegulatoryEvidences.filter((evidence) => evidence.obligation_id === obligation.id);
    const availableEvidenceCount = evidences.filter((evidence) => evidence.status === "available").length;
    const pendingEvidenceCount = evidences.filter((evidence) =>
      evidence.status !== "available" && evidence.status !== "archived"
    ).length;
    const actionItem = this.ctx.regulatoryObligationActionItems.find((item) => item.obligationId === obligation.id) ?? null;
    const proofItem = this.ctx.regulatoryProofGapItems.find((item) => item.obligationId === obligation.id) ?? null;
    const primaryAction = proofItem ?? actionItem;
    const secondaryAction =
      proofItem && actionItem && !this.isSameActionTarget(proofItem, actionItem)
        ? actionItem
        : null;

    let displayStatusLabel: ObligationRowItem["displayStatusLabel"] = "Conforme";
    let displayStatusTone: CfmTone = "success";
    let sortRank = 30;
    let causeLabel = "Couverture en place";
    let causeDetail =
      availableEvidenceCount > 0
        ? `${availableEvidenceCount} preuve${availableEvidenceCount > 1 ? "s disponibles" : " disponible"} pour soutenir cette obligation.`
        : obligation.reason_summary;

    if (obligation.status === "overdue") {
      displayStatusLabel = "Critique";
      displayStatusTone = "danger";
      sortRank = 0;
      causeLabel = obligation.id === "reg-buildings-periodic-checks" ? "Contrôle en retard" : "Action urgente";
      causeDetail = proofItem?.impact ?? obligation.reason_summary;
    } else if (availableEvidenceCount === 0 || obligation.status === "to_complete" || obligation.status === "in_progress") {
      displayStatusLabel = "Incomplet";
      displayStatusTone = "progress";
      sortRank = 10;
      causeLabel = proofItem && availableEvidenceCount === 0 ? "Preuve manquante" : "Obligation incomplète";
      causeDetail = proofItem?.impact ?? actionItem?.impact ?? this.ctx.getObligationFirstAction(obligation, availableEvidenceCount);
    } else if (
      pendingEvidenceCount > 0
      || obligation.status === "to_verify"
      || actionItem?.actionKind === "site_enrichment"
      || actionItem?.sectionId === "reg-sites-section"
    ) {
      displayStatusLabel = "À vérifier";
      displayStatusTone = "warning";
      sortRank = 20;
      causeLabel =
        pendingEvidenceCount > 0
          ? "Document à régulariser"
          : actionItem?.actionKind === "site_enrichment" || actionItem?.sectionId === "reg-sites-section"
            ? "Site à vérifier"
            : "Statut à vérifier";
      causeDetail = proofItem?.impact ?? actionItem?.impact ?? obligation.reason_summary;
    }

    return {
      obligation,
      actionItem,
      proofItem,
      availableEvidenceCount,
      pendingEvidenceCount,
      evidenceCount: evidences.length,
      displayStatusLabel,
      displayStatusTone,
      causeLabel,
      causeDetail,
      nextActionSummary: primaryAction?.context ?? this.ctx.getObligationFirstAction(obligation, availableEvidenceCount),
      primaryAction,
      secondaryAction,
      sortRank,
    };
  }

  private getPriorityRank(priority: ApplicableRegulatoryObligationRecord["priority"]): number {
    switch (priority) {
      case "high":
        return 0;
      case "medium":
        return 1;
      case "low":
        return 2;
    }
  }

  private isSameActionTarget(left: DesktopRegulationPriorityItem, right: DesktopRegulationPriorityItem): boolean {
    return left.actionKind === right.actionKind
      && left.sectionId === right.sectionId
      && left.obligationId === right.obligationId
      && left.siteId === right.siteId;
  }

  private filterRows(filter: ObligationViewFilter): ObligationRowItem[] {
    switch (filter) {
      case "actionable":
        return this.obligationRows.filter((row) => row.displayStatusLabel !== "Conforme");
      case "compliant":
        return this.obligationRows.filter((row) => row.displayStatusLabel === "Conforme");
      case "all":
      default:
        return this.obligationRows;
    }
  }
}
