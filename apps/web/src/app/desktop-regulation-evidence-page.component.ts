import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import type { ApplicableRegulatoryObligationRecord, OrganizationSiteRecord, RegulatoryEvidenceRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import {
  DESKTOP_REGULATION_PAGE_CONTEXT,
  type DesktopRegulationPriorityItem,
} from "./desktop-regulation-page-context";

type EvidenceActionTarget = Pick<
  DesktopRegulationPriorityItem,
  "actionLabel" | "actionKind" | "sectionId" | "obligationId" | "siteId"
>;

type RegulationEvidenceRow = {
  key: string;
  title: string;
  statusLabel: "Critique" | "Manquante" | "À régulariser" | "Disponible";
  statusTone: CfmTone;
  signalLabel: string;
  signalDetail: string;
  linkLabel: string;
  linkContext: string | null;
  siteLabel: string | null;
  siteStateLabel: string | null;
  siteStateTone: CfmTone | null;
  documentType: string | null;
  uploadedLabel: string | null;
  note: string | null;
  obligationTitle: string | null;
  obligationId: string | null;
  siteId: string | null;
  primaryAction: EvidenceActionTarget | null;
  secondaryAction: EvidenceActionTarget | null;
  sortRank: number;
};

type EvidenceViewFilter = "all" | "actionable" | "available";

@Component({
  selector: "cfm-desktop-regulation-evidence-page",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="evidenceRows.length > 0; else emptyState">
      <section class="cfm-reg-page evidence-workspace">
        <section class="cfm-reg-stage">
          <section class="cfm-reg-main">
            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Preuves</span>
                  <h3 class="cfm-reg-section-title">Pièces à traiter</h3>
                  <p>Les preuves utiles, les manques et la bonne action ressortent maintenant dans une lecture documentaire plus calme et plus exploitable.</p>
                </div>

                <div class="cfm-reg-toolbar">
                  <div class="cfm-reg-filter-row" aria-label="Filtre preuves">
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
                      [variant]="selectedViewFilter === 'available' ? 'primary' : 'secondary'"
                      (click)="setViewFilter('available')"
                    >
                      Disponibles
                    </cfm-button>
                  </div>
                </div>
              </header>

              <div class="cfm-reg-summary-row">
                <span class="cfm-reg-meta-pill">{{ filteredEvidenceRows.length }} visible{{ filteredEvidenceRows.length > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--danger">{{ criticalCount }} critique{{ criticalCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--progress">{{ missingCount }} manquante{{ missingCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--warning">{{ regularizeCount }} à régulariser</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--success">{{ availableCount }} disponible{{ availableCount > 1 ? "s" : "" }}</span>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">À traiter</span>
                  <h4 class="cfm-reg-section-title">Preuves prioritaires</h4>
                  <p>Les pièces manquantes ou à régulariser remontent d’abord, avec le bon point d’entrée métier.</p>
                </div>
                <cfm-status-chip
                  [label]="actionableRows.length + ' priorité' + (actionableRows.length > 1 ? 's' : '')"
                  [tone]="actionableRows.length > 0 ? 'warning' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register" *ngIf="actionableRows.length > 0; else emptyActionable">
                <article
                  class="cfm-reg-priority-row evidence-priority-row"
                  *ngFor="let row of actionableRows; trackBy: trackByEvidenceRow"
                  [class.is-selected]="activeRow?.key === row.key"
                  (click)="selectRow(row)"
                >
                  <div class="cfm-reg-priority-copy">
                    <strong class="record-primary">{{ row.title }}</strong>
                    <span class="record-meta">{{ row.signalDetail }}</span>
                  </div>

                  <div class="evidence-priority-status">
                    <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                    <cfm-status-chip [label]="row.signalLabel" tone="calm" />
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ row.linkLabel }}</strong>
                    <span class="record-meta">{{ getNextActionSummary(row) }}</span>
                  </div>

                  <cfm-button
                    type="button"
                    size="sm"
                    [disabled]="!row.primaryAction || ctx.isRegulatoryShowcaseActionBusy(row.primaryAction)"
                    (click)="runAction(row.primaryAction, $event)"
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
                  <h4 class="cfm-reg-section-title">Registre des preuves</h4>
                  <p>Le registre reste lisible et documentaire, sans revenir à une simple liste de fichiers techniques.</p>
                </div>
                <cfm-status-chip
                  [label]="filteredEvidenceRows.length + ' preuve' + (filteredEvidenceRows.length > 1 ? 's' : '')"
                  [tone]="filteredEvidenceRows.length > 0 ? 'calm' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register-head evidence-register-head" *ngIf="filteredEvidenceRows.length > 0">
                <span>Pièce</span>
                <span>État</span>
                <span>Repère</span>
                <span>Action utile</span>
              </div>

              <div class="cfm-reg-register" *ngIf="filteredEvidenceRows.length > 0; else emptyFilteredRegister">
                <button
                  *ngFor="let row of filteredEvidenceRows; trackBy: trackByEvidenceRow"
                  type="button"
                  class="cfm-reg-register-row evidence-register-row"
                  [class.is-selected]="activeRow?.key === row.key"
                  (click)="selectRow(row)"
                >
                  <div class="cfm-reg-register-cell">
                    <strong class="record-primary">{{ row.title }}</strong>
                    <span class="record-meta">{{ row.documentType || row.linkLabel }}</span>
                  </div>

                  <div class="cfm-reg-register-cell evidence-register-status">
                    <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                    <span class="record-meta">{{ row.signalLabel }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ row.linkLabel }}</strong>
                    <span class="record-meta">{{ row.siteLabel || row.linkContext || "Aucun contexte complémentaire" }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ getActionLabel(row.primaryAction) }}</strong>
                    <span class="record-meta">{{ getNextActionSummary(row) }}</span>
                  </div>
                </button>
              </div>
            </article>
          </section>

          <aside class="cfm-reg-rail">
            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row; else emptyActivePanel">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Preuve en vue</span>
                  <h4 class="cfm-reg-section-title">{{ row.title }}</h4>
                </div>
                <div class="cfm-reg-chip-row">
                  <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                  <cfm-status-chip *ngIf="row.siteStateLabel" [label]="row.siteStateLabel" [tone]="row.siteStateTone ?? 'neutral'" />
                </div>
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ row.signalLabel }}</strong>
                <span>{{ getNextActionSummary(row) }}</span>
              </div>

              <ul class="cfm-reg-data-list detail-copy">
                <li><span>Obligation</span><strong>{{ row.obligationTitle || "Non liée" }}</strong></li>
                <li><span>Site</span><strong>{{ row.siteLabel || "Non précisé" }}</strong></li>
                <li><span>Repère</span><strong>{{ row.uploadedLabel || row.linkContext || "Document à relire" }}</strong></li>
              </ul>

              <div class="cfm-reg-rail-actions">
                <cfm-button
                  type="button"
                  *ngIf="row.primaryAction"
                  [disabled]="ctx.isRegulatoryShowcaseActionBusy(row.primaryAction)"
                  (click)="runAction(row.primaryAction)"
                >
                  {{ getActionLabel(row.primaryAction) }}
                </cfm-button>

                <cfm-button
                  type="button"
                  variant="secondary"
                  *ngIf="row.secondaryAction"
                  [disabled]="ctx.isRegulatoryShowcaseActionBusy(row.secondaryAction)"
                  (click)="runAction(row.secondaryAction)"
                >
                  {{ getActionLabel(row.secondaryAction) }}
                </cfm-button>
              </div>
            </section>

            <section class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="activeRow as row">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Contexte documentaire</span>
                <h4 class="cfm-reg-section-title">Pourquoi ça remonte</h4>
              </header>

              <p class="detail-copy">{{ row.signalDetail }}</p>
              <ul class="cfm-reg-rail-list detail-copy">
                <li>
                  <div class="evidence-rail-copy">
                    <strong>Lien métier</strong>
                    <span>{{ row.linkLabel }}</span>
                  </div>
                </li>
                <li *ngIf="row.documentType">
                  <div class="evidence-rail-copy">
                    <strong>Type</strong>
                    <span>{{ row.documentType }}</span>
                  </div>
                </li>
                <li *ngIf="row.note">
                  <div class="evidence-rail-copy">
                    <strong>Note</strong>
                    <span>{{ row.note }}</span>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #emptyActionable>
      <section class="cfm-reg-empty">
        <strong>Aucune pièce à traiter</strong>
        <p>Les pièces visibles sont déjà disponibles ou couvertes.</p>
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
        title="Aucune pièce justificative"
        description="Ajoutez une première preuve réglementaire simple pour compléter progressivement les obligations."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .evidence-priority-row,
      .evidence-register-head,
      .evidence-register-row {
        display: grid;
        gap: 1rem;
        align-items: center;
      }

      .evidence-priority-row {
        grid-template-columns: minmax(0, 1.16fr) auto minmax(0, 1fr) auto;
      }

      .evidence-register-head,
      .evidence-register-row {
        grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.78fr) minmax(0, 0.92fr) minmax(0, 0.94fr);
      }

      .evidence-priority-status,
      .evidence-register-status,
      .evidence-rail-copy {
        display: grid;
        gap: 0.22rem;
      }

      @media (max-width: 1180px) {
        .evidence-priority-row,
        .evidence-register-head,
        .evidence-register-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopRegulationEvidencePageComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);

  private activeEvidenceKey: string | null = null;
  selectedViewFilter: EvidenceViewFilter = "actionable";

  get evidenceRows(): RegulationEvidenceRow[] {
    const rows: RegulationEvidenceRow[] = [];

    for (const proofItem of this.ctx.regulatoryProofGapItems) {
      if (!proofItem.obligationId) {
        continue;
      }
      const linkedEvidences = this.ctx.filteredRegulatoryEvidences.filter(
        (evidence) => evidence.obligation_id === proofItem.obligationId
      );
      if (linkedEvidences.length > 0) {
        continue;
      }

      const obligation = this.findObligation(proofItem.obligationId);
      const obligationAction = this.findObligationAction(proofItem.obligationId);
      const siteAction = obligationAction?.sectionId === "reg-sites-section" || obligationAction?.actionKind === "site_enrichment"
        ? obligationAction
        : null;
      const primaryAction = this.createOpenObligationAction(proofItem.obligationId);
      const secondaryAction = siteAction?.siteId
        ? this.createOpenSiteAction(siteAction.siteId)
        : null;

      rows.push({
        key: `missing:${proofItem.obligationId}`,
        title: obligation?.title ?? proofItem.title,
        statusLabel: proofItem.levelLabel === "Critique" ? "Critique" : "Manquante",
        statusTone: proofItem.levelLabel === "Critique" ? "danger" : "progress",
        signalLabel: "Pièce absente",
        signalDetail: proofItem.impact,
        linkLabel: obligation?.title ?? "Obligation à couvrir",
        linkContext: obligation?.reason_summary ?? proofItem.context,
        siteLabel: siteAction?.siteId ? this.ctx.getSiteNameById(siteAction.siteId) : null,
        siteStateLabel: siteAction?.siteId ? "Site lié à vérifier" : null,
        siteStateTone: siteAction?.siteId ? "warning" : null,
        documentType: null,
        uploadedLabel: null,
        note: null,
        obligationTitle: obligation?.title ?? null,
        obligationId: proofItem.obligationId,
        siteId: siteAction?.siteId ?? null,
        primaryAction,
        secondaryAction,
        sortRank: proofItem.levelLabel === "Critique" ? 0 : 10,
      });
    }

    for (const evidence of this.ctx.filteredRegulatoryEvidences) {
      rows.push(this.buildEvidenceDocumentRow(evidence));
    }

    return rows.sort((left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title));
  }

  get actionableRows(): RegulationEvidenceRow[] {
    return this.evidenceRows.filter((row) => row.statusLabel !== "Disponible").slice(0, 3);
  }

  get filteredEvidenceRows(): RegulationEvidenceRow[] {
    return this.filterRows(this.selectedViewFilter);
  }

  get activeRow(): RegulationEvidenceRow | null {
    if (this.activeEvidenceKey) {
      const explicit = this.filteredEvidenceRows.find((row) => row.key === this.activeEvidenceKey);
      if (explicit) {
        return explicit;
      }
    }

    const selectedObligationId = this.ctx.selectedRegulatoryObligation?.id ?? null;
    if (selectedObligationId) {
      const linked = this.filteredEvidenceRows.find((row) => row.obligationId === selectedObligationId);
      if (linked) {
        return linked;
      }
    }

    return this.filteredEvidenceRows[0] ?? null;
  }

  get criticalCount(): number {
    return this.evidenceRows.filter((row) => row.statusLabel === "Critique").length;
  }

  get missingCount(): number {
    return this.evidenceRows.filter((row) => row.statusLabel === "Manquante").length;
  }

  get regularizeCount(): number {
    return this.evidenceRows.filter((row) => row.statusLabel === "À régulariser").length;
  }

  get availableCount(): number {
    return this.evidenceRows.filter((row) => row.statusLabel === "Disponible").length;
  }

  setViewFilter(filter: EvidenceViewFilter): void {
    this.selectedViewFilter = filter;
    const filteredRows = this.filterRows(filter);
    const currentActiveKey = this.activeEvidenceKey;

    if (filteredRows.length === 0) {
      this.activeEvidenceKey = null;
      return;
    }

    if (!currentActiveKey || !filteredRows.some((row) => row.key === currentActiveKey)) {
      this.selectRow(filteredRows[0]);
    }
  }

  selectRow(row: RegulationEvidenceRow): void {
    this.activeEvidenceKey = row.key;
    if (row.obligationId) {
      this.ctx.openObligationDetail(row.obligationId);
    }
  }

  getActionLabel(action: EvidenceActionTarget | null): string {
    if (!action) {
      return "Ouvrir";
    }
    return this.ctx.getRegulatoryShowcaseActionLabel(action);
  }

  getNextActionSummary(row: RegulationEvidenceRow): string {
    if (row.primaryAction?.actionLabel === "Ouvrir l’obligation") {
      return "Ouvrez l’obligation liée pour traiter le point bloquant et raccrocher une preuve exploitable.";
    }
    if (row.primaryAction?.actionLabel === "Voir le site") {
      return "Passez par le site lié pour vérifier le contexte terrain avant de régulariser cette pièce.";
    }
    return row.signalDetail;
  }

  runAction(action: EvidenceActionTarget | null, event?: Event): void {
    event?.stopPropagation();
    if (!action) {
      return;
    }
    void this.ctx.runRegulatoryShowcaseAction(action);
  }

  trackByEvidenceRow(_index: number, item: RegulationEvidenceRow): string {
    return item.key;
  }

  getEmptyFilterTitle(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Aucune pièce à traiter";
      case "available":
        return "Aucune pièce disponible";
      case "all":
      default:
        return "Aucune pièce visible";
    }
  }

  getEmptyFilterDescription(): string {
    switch (this.selectedViewFilter) {
      case "actionable":
        return "Les pièces à traiter sont déjà en place ou déjà reprises.";
      case "available":
        return "Aucune pièce actuellement visible n’est encore considérée comme disponible.";
      case "all":
      default:
        return "La liste se remplira dès que des pièces ou des manques seront détectés.";
    }
  }

  private buildEvidenceDocumentRow(evidence: RegulatoryEvidenceRecord): RegulationEvidenceRow {
    const obligation = evidence.obligation_id ? this.findObligation(evidence.obligation_id) : null;
    const proofItem = evidence.obligation_id ? this.findProofGapItem(evidence.obligation_id) : null;
    const obligationAction = evidence.obligation_id ? this.findObligationAction(evidence.obligation_id) : null;
    const site = evidence.site_id ? this.findSite(evidence.site_id) : null;
    const siteSignal = site ? this.getSiteSignal(site) : null;

    let statusLabel: RegulationEvidenceRow["statusLabel"] = "Disponible";
    let statusTone: CfmTone = "success";
    let signalLabel = siteSignal ? "Site à vérifier" : "Couverture disponible";
    let signalDetail =
      proofItem?.impact
      ?? (evidence.status === "available"
        ? "La pièce est disponible et mobilisable dans le module."
        : "Le document existe mais doit encore être repris pour devenir exploitable.");
    let sortRank = evidence.status === "available" ? (siteSignal ? 25 : 30) : 15;

    if (evidence.status !== "available") {
      const isCritical = proofItem?.levelLabel === "Critique" || obligation?.status === "overdue";
      statusLabel = isCritical ? "Critique" : "À régulariser";
      statusTone = isCritical ? "danger" : "warning";
      signalLabel = isCritical ? "Bloque une obligation critique" : "Document à régulariser";
      signalDetail = proofItem?.impact ?? "Le document est présent mais non disponible pour démontrer l’obligation.";
      sortRank = isCritical ? 5 : 15;
    }

    const primaryAction =
      siteSignal
        ? this.createOpenSiteAction(evidence.site_id!)
        : evidence.obligation_id
          ? this.createOpenObligationAction(evidence.obligation_id)
          : null;

    const secondaryAction =
      siteSignal && evidence.obligation_id
        ? this.createOpenObligationAction(evidence.obligation_id)
        : !siteSignal && evidence.site_id
          ? this.createOpenSiteAction(evidence.site_id)
          : null;

    return {
      key: `evidence:${evidence.id}`,
      title: evidence.file_name,
      statusLabel,
      statusTone,
      signalLabel,
      signalDetail,
      linkLabel: evidence.link_label,
      linkContext: evidence.obligation_id
        ? obligation?.reason_summary ?? null
        : this.ctx.getRegulatoryEvidenceLinkKindLabel(evidence.link_kind),
      siteLabel: evidence.site_id ? this.ctx.getSiteNameById(evidence.site_id) : null,
      siteStateLabel: siteSignal?.label ?? null,
      siteStateTone: siteSignal?.tone ?? null,
      documentType: evidence.document_type,
      uploadedLabel: evidence.uploaded_at ? `Ajouté le ${new Date(evidence.uploaded_at).toLocaleDateString("fr-FR")}` : null,
      note: evidence.notes || null,
      obligationTitle: obligation?.title ?? null,
      obligationId: evidence.obligation_id ?? null,
      siteId: evidence.site_id ?? null,
      primaryAction,
      secondaryAction,
      sortRank,
    };
  }

  private findObligation(obligationId: string): ApplicableRegulatoryObligationRecord | null {
    return this.ctx.regulatoryProfile?.applicable_obligations.find((obligation) => obligation.id === obligationId) ?? null;
  }

  private findProofGapItem(obligationId: string): DesktopRegulationPriorityItem | null {
    return this.ctx.regulatoryProofGapItems.find((item) => item.obligationId === obligationId) ?? null;
  }

  private findObligationAction(obligationId: string): DesktopRegulationPriorityItem | null {
    return this.ctx.regulatoryObligationActionItems.find((item) => item.obligationId === obligationId) ?? null;
  }

  private findSite(siteId: string): OrganizationSiteRecord | null {
    return this.ctx.organizationSites.find((site) => site.id === siteId) ?? null;
  }

  private getSiteSignal(site: OrganizationSiteRecord): { label: string; tone: CfmTone } | null {
    const state = this.ctx.getSiteEnrichmentUiState(site);
    if (site.location_enrichment_status === "enriched") {
      return null;
    }
    if (site.location_enrichment_status === "failed" || site.location_enrichment_status === "no_match") {
      return { label: "Site à risque", tone: "warning" };
    }
    if (site.location_enrichment_status === "partial" || site.location_enrichment_status == null) {
      return { label: "Site incomplet", tone: "progress" };
    }
    return { label: state.label, tone: state.tone };
  }

  private createOpenObligationAction(obligationId: string): EvidenceActionTarget {
    return {
      actionLabel: "Ouvrir l’obligation",
      actionKind: "scroll",
      sectionId: "reg-obligations-section",
      obligationId,
      siteId: null,
    };
  }

  private createOpenSiteAction(siteId: string): EvidenceActionTarget {
    return {
      actionLabel: "Voir le site",
      actionKind: "scroll",
      sectionId: "reg-sites-section",
      obligationId: null,
      siteId,
    };
  }

  private filterRows(filter: EvidenceViewFilter): RegulationEvidenceRow[] {
    switch (filter) {
      case "actionable":
        return this.evidenceRows.filter((row) => row.statusLabel !== "Disponible");
      case "available":
        return this.evidenceRows.filter((row) => row.statusLabel === "Disponible");
      case "all":
      default:
        return this.evidenceRows;
    }
  }
}
