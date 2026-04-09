import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import { DESKTOP_REGULATION_PAGE_CONTEXT } from "./desktop-regulation-page-context";

type RegulatoryPrimaryAction =
  | { kind: "route"; label: string; route: string }
  | { kind: "export"; label: string }
  | null;

type RegulatoryDossierItem = {
  id: string;
  title: string;
  detail: string;
  statusLabel: string;
  tone: CfmTone;
};

@Component({
  selector: "cfm-desktop-regulation-exports-page",
  standalone: true,
  imports: [CommonModule, RouterLink, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <section class="cfm-reg-page regulation-exports-page">
      <ng-container *ngIf="hasRegulatoryContent; else emptyState">
        <section class="cfm-reg-stage">
          <section class="cfm-reg-main">
            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Dossier réglementaire</span>
                  <h3 class="cfm-reg-section-title">Exports</h3>
                  <p>La remise réglementaire retrouve sa place dans le workspace : ce qui est prêt, ce qui manque et l’export utile se lisent ensemble.</p>
                </div>
                <cfm-status-chip [label]="regulatoryDossierStatusLabel" [tone]="regulatoryDossierStatusTone" />
              </header>

              <div class="cfm-reg-summary-row">
                <span class="cfm-reg-meta-pill">{{ ctx.regulatoryObligations.length }} obligation{{ ctx.regulatoryObligations.length > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--success">{{ ctx.regulatoryEvidenceAvailableCount }} pièce{{ ctx.regulatoryEvidenceAvailableCount > 1 ? "s" : "" }} prête{{ ctx.regulatoryEvidenceAvailableCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--warning">{{ ctx.regulatoryMissingProofCount }} à compléter</span>
                <span class="cfm-reg-meta-pill">{{ ctx.regulatoryIncompleteSitesCount }} site{{ ctx.regulatoryIncompleteSitesCount > 1 ? "s" : "" }} incomplet{{ ctx.regulatoryIncompleteSitesCount > 1 ? "s" : "" }}</span>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Avant remise</span>
                  <h4 class="cfm-reg-section-title">Ce qu’il faut traiter</h4>
                  <p>Un seul bloc pour comprendre ce qui bloque encore la remise et lancer immédiatement la bonne action.</p>
                </div>
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ regulatoryDossierStatusLabel }}</strong>
                <span>{{ regulatoryDossierSummary }}</span>
              </div>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="regulatoryMissingItems.length > 0; else readyDossier">
                <li *ngFor="let item of regulatoryMissingItems; trackBy: trackByLabel">
                  <div class="exports-rail-copy">
                    <strong>{{ item }}</strong>
                  </div>
                </li>
              </ul>

              <div class="cfm-reg-rail-actions" *ngIf="primaryAction as action">
                <cfm-button
                  *ngIf="action.kind === 'route'"
                  type="button"
                  [routerLink]="[action.route]"
                >
                  {{ action.label }}
                </cfm-button>

                <cfm-button
                  *ngIf="action.kind === 'export'"
                  type="button"
                  [disabled]="!ctx.canExportReglementation || ctx.regulatoryExporting"
                  (click)="ctx.exportRegulatoryPdf()"
                >
                  {{ ctx.regulatoryExporting ? "Génération en cours" : action.label }}
                </cfm-button>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Vue principale</span>
                  <h4 class="cfm-reg-section-title">Contenu du dossier</h4>
                  <p>Le registre du dossier regroupe obligations, pièces, sites et export PDF dans une seule lecture plus cohérente.</p>
                </div>
                <cfm-status-chip
                  [label]="regulatoryDossierContents.length + ' élément' + (regulatoryDossierContents.length > 1 ? 's' : '')"
                  [tone]="regulatoryDossierContents.length > 0 ? 'calm' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register-head exports-register-head" *ngIf="regulatoryDossierContents.length > 0">
                <span>Élément</span>
                <span>État</span>
                <span>Repère</span>
              </div>

              <div class="cfm-reg-register">
                <article
                  class="cfm-reg-register-row exports-register-row"
                  *ngFor="let item of regulatoryDossierContents; trackBy: trackByItem"
                >
                  <div class="cfm-reg-register-cell">
                    <strong class="record-primary">{{ item.title }}</strong>
                    <span class="record-meta">{{ item.detail }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <cfm-status-chip [label]="item.statusLabel" [tone]="item.tone" />
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ item.tone === 'success' ? "Prêt" : item.tone === 'warning' ? "À compléter" : "À surveiller" }}</strong>
                    <span class="record-meta">{{ item.detail }}</span>
                  </div>
                </article>
              </div>
            </article>
          </section>

          <aside class="cfm-reg-rail">
            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Résumé</span>
                <h4 class="cfm-reg-section-title">Lecture rapide</h4>
              </header>

              <ul class="cfm-reg-data-list detail-copy">
                <li><span>Statut</span><strong>{{ regulatoryDossierStatusLabel }}</strong></li>
                <li><span>Obligations à vérifier</span><strong>{{ ctx.regulatoryObligationsToVerifyCount }}</strong></li>
                <li><span>Preuves manquantes</span><strong>{{ ctx.regulatoryMissingProofCount }}</strong></li>
                <li><span>Sites à compléter</span><strong>{{ ctx.regulatoryIncompleteSitesCount }}</strong></li>
              </ul>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Exports disponibles</span>
                <h4 class="cfm-reg-section-title">Sorties utiles</h4>
              </header>

              <div class="cfm-reg-rail-actions">
                <cfm-button
                  type="button"
                  [disabled]="!ctx.canExportReglementation || ctx.regulatoryExporting"
                  (click)="ctx.exportRegulatoryPdf()"
                >
                  {{ ctx.regulatoryExporting ? "Génération en cours" : "Exporter le PDF réglementaire" }}
                </cfm-button>
                <cfm-button type="button" variant="secondary" [routerLink]="['/app/documents']">
                  Ouvrir Documents
                </cfm-button>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Repères utiles</span>
                <h4 class="cfm-reg-section-title">Ce qui manque ou ce qui est prêt</h4>
              </header>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="regulatoryGapHighlights.length > 0; else evidenceReady">
                <li *ngFor="let item of regulatoryGapHighlights; trackBy: trackByItem">
                  <div class="exports-rail-copy">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.tone" />
                </li>
              </ul>

              <ng-template #evidenceReady>
                <ul class="cfm-reg-rail-list detail-copy" *ngIf="regulatoryEvidenceItems.length > 0; else noEvidence">
                  <li *ngFor="let item of regulatoryEvidenceItems; trackBy: trackByItem">
                    <div class="exports-rail-copy">
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.detail }}</span>
                    </div>
                    <cfm-status-chip [label]="item.statusLabel" [tone]="item.tone" />
                  </li>
                </ul>
              </ng-template>
            </article>
          </aside>
        </section>
      </ng-container>
    </section>

    <ng-template #readyDossier>
      <section class="cfm-reg-empty">
        <strong>Dossier prêt à remettre</strong>
        <p>Aucun point bloquant ne remonte : le dossier réglementaire peut être exporté dans l’état actuel.</p>
      </section>
    </ng-template>

    <ng-template #noEvidence>
      <section class="cfm-reg-empty">
        <strong>Aucune pièce prête</strong>
        <p>Les pièces déjà exploitables apparaîtront ici dès qu’un premier justificatif sera disponible.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Dossier réglementaire à préparer"
        description="Complétez les premières pièces et obligations pour constituer un dossier présentable."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .exports-register-head,
      .exports-register-row {
        display: grid;
        gap: 1rem;
        align-items: center;
      }

      .exports-register-head,
      .exports-register-row {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.6fr) minmax(0, 0.95fr);
      }

      .exports-rail-copy {
        display: grid;
        gap: 0.22rem;
      }

      @media (max-width: 1180px) {
        .exports-register-head,
        .exports-register-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopRegulationExportsPageComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);

  get hasRegulatoryContent(): boolean {
    return this.ctx.regulatoryObligations.length > 0 || this.ctx.regulatoryEvidenceAvailableCount > 0;
  }

  get regulatoryDossierStatusLabel(): string {
    if (this.ctx.regulatoryEvidenceAvailableCount === 0) {
      return "À compléter";
    }
    if (
      this.ctx.regulatoryMissingProofCount > 0
      || this.ctx.regulatoryIncompleteSitesCount > 0
      || this.ctx.regulatoryObligationsToVerifyCount > 0
    ) {
      return "Incomplet";
    }
    return "Prêt à exporter";
  }

  get regulatoryDossierStatusTone(): CfmTone {
    if (this.ctx.regulatoryEvidenceAvailableCount === 0) {
      return "warning";
    }
    if (
      this.ctx.regulatoryMissingProofCount > 0
      || this.ctx.regulatoryIncompleteSitesCount > 0
      || this.ctx.regulatoryObligationsToVerifyCount > 0
    ) {
      return "warning";
    }
    return "success";
  }

  get regulatoryDossierSummary(): string {
    if (this.ctx.regulatoryEvidenceAvailableCount === 0) {
      return "Le dossier réglementaire n'a pas encore assez de pièces pour être remis sereinement. Commencez par compléter les justificatifs les plus attendus.";
    }
    if (this.ctx.regulatoryMissingProofCount > 0) {
      return "Le dossier peut déjà être exporté, mais il reste des pièces manquantes. Complétez-les d'abord si vous visez une remise propre.";
    }
    if (this.ctx.regulatoryIncompleteSitesCount > 0) {
      return "Le dossier couvre déjà une partie de la conformité, mais certains sites restent incomplets. Finalisez-les avant remise finale.";
    }
    if (this.ctx.regulatoryObligationsToVerifyCount > 0) {
      return "Les pièces sont présentes, mais quelques obligations demandent encore une vérification avant remise.";
    }
    return "Le dossier réglementaire est prêt : vous voyez ici ce qu'il contient déjà et pouvez lancer l'export final.";
  }

  get regulatoryMissingItems(): string[] {
    const items: string[] = [];
    if (this.ctx.regulatoryMissingProofCount > 0) {
      items.push(`${this.ctx.regulatoryMissingProofCount} pièce${this.ctx.regulatoryMissingProofCount > 1 ? "s" : ""} encore à compléter`);
    }
    if (this.ctx.regulatoryIncompleteSitesCount > 0) {
      items.push(`${this.ctx.regulatoryIncompleteSitesCount} site${this.ctx.regulatoryIncompleteSitesCount > 1 ? "s" : ""} encore incomplet${this.ctx.regulatoryIncompleteSitesCount > 1 ? "s" : ""}`);
    }
    if (this.ctx.regulatoryObligationsToVerifyCount > 0) {
      items.push(`${this.ctx.regulatoryObligationsToVerifyCount} obligation${this.ctx.regulatoryObligationsToVerifyCount > 1 ? "s" : ""} à vérifier`);
    }
    if (this.ctx.regulatoryEvidenceAvailableCount === 0) {
      items.push("Aucune pièce disponible pour le moment");
    }
    return items.slice(0, 4);
  }

  get primaryAction(): RegulatoryPrimaryAction {
    if (this.ctx.regulatoryMissingProofCount > 0) {
      return { kind: "route", label: "Ouvrir les pièces à compléter", route: "/app/reglementation/preuves" };
    }
    if (this.ctx.regulatoryIncompleteSitesCount > 0) {
      return { kind: "route", label: "Ouvrir les sites à compléter", route: "/app/reglementation/sites" };
    }
    if (this.ctx.regulatoryObligationsToVerifyCount > 0) {
      return { kind: "route", label: "Ouvrir les obligations à vérifier", route: "/app/reglementation/obligations" };
    }
    if (this.hasRegulatoryContent) {
      return { kind: "export", label: "Exporter le dossier réglementaire" };
    }
    return null;
  }

  get regulatoryDossierContents(): RegulatoryDossierItem[] {
    return [
      {
        id: "obligations",
        title: "Obligations incluses",
        detail: `${this.ctx.regulatoryObligations.length} obligation${this.ctx.regulatoryObligations.length > 1 ? "s" : ""} reprises dans le dossier`,
        statusLabel: this.ctx.regulatoryObligationsToVerifyCount > 0 ? "À vérifier" : "Sous contrôle",
        tone: this.ctx.regulatoryObligationsToVerifyCount > 0 ? "warning" : "success",
      },
      {
        id: "proofs",
        title: "Pièces et justificatifs",
        detail: `${this.ctx.regulatoryEvidenceAvailableCount} pièce${this.ctx.regulatoryEvidenceAvailableCount > 1 ? "s" : ""} disponible${this.ctx.regulatoryEvidenceAvailableCount > 1 ? "s" : ""} · ${this.ctx.regulatoryEvidenceCoverageCount} couverture${this.ctx.regulatoryEvidenceCoverageCount > 1 ? "s" : ""}`,
        statusLabel: this.ctx.regulatoryMissingProofCount > 0 ? "À compléter" : "Prêt",
        tone: this.ctx.regulatoryMissingProofCount > 0 ? "warning" : "success",
      },
      {
        id: "sites",
        title: "Sites couverts",
        detail: `${this.ctx.regulatoryAllSites.length} site${this.ctx.regulatoryAllSites.length > 1 ? "s" : ""} visible${this.ctx.regulatoryAllSites.length > 1 ? "s" : ""} dans le périmètre`,
        statusLabel: this.ctx.regulatoryIncompleteSitesCount > 0 ? "Incomplet" : "Sous contrôle",
        tone: this.ctx.regulatoryIncompleteSitesCount > 0 ? "progress" : "success",
      },
      {
        id: "pdf",
        title: "Remise PDF",
        detail: "Export PDF consolidé de la situation réglementaire actuelle",
        statusLabel: this.ctx.canExportReglementation ? "Exportable" : "Lecture seule",
        tone: this.ctx.canExportReglementation ? "progress" : "calm",
      },
    ];
  }

  get regulatoryGapHighlights(): RegulatoryDossierItem[] {
    const items: RegulatoryDossierItem[] = [];

    if (this.ctx.regulatoryProofGapItems[0]) {
      items.push({
        id: `proof-${this.ctx.regulatoryProofGapItems[0].id}`,
        title: "Pièces à compléter",
        detail: this.ctx.regulatoryProofGapItems[0].title,
        statusLabel: `${this.ctx.regulatoryMissingProofCount} manquante${this.ctx.regulatoryMissingProofCount > 1 ? "s" : ""}`,
        tone: "warning",
      });
    }

    if (this.ctx.regulatorySiteActionItems[0]) {
      items.push({
        id: `site-${this.ctx.regulatorySiteActionItems[0].id}`,
        title: "Sites à finaliser",
        detail: this.ctx.regulatorySiteActionItems[0].title,
        statusLabel: `${this.ctx.regulatoryIncompleteSitesCount} à compléter`,
        tone: "progress",
      });
    }

    if (this.ctx.regulatoryObligationActionItems[0]) {
      items.push({
        id: `obligation-${this.ctx.regulatoryObligationActionItems[0].id}`,
        title: "Obligations à vérifier",
        detail: this.ctx.regulatoryObligationActionItems[0].title,
        statusLabel: `${this.ctx.regulatoryObligationsToVerifyCount} en attente`,
        tone: "warning",
      });
    }

    return items.slice(0, 4);
  }

  get regulatoryEvidenceItems(): RegulatoryDossierItem[] {
    return this.ctx.regulatoryEvidenceShowcaseItems.slice(0, 4).map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      statusLabel: item.statusLabel,
      tone: item.tone,
    }));
  }

  trackByItem(_index: number, item: RegulatoryDossierItem): string {
    return item.id;
  }

  trackByLabel(_index: number, label: string): string {
    return label;
  }
}
