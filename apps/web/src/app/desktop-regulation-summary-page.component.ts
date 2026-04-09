import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import {
  DESKTOP_REGULATION_PAGE_CONTEXT,
  type DesktopRegulationActionItem,
  type DesktopRegulationFamilyCard,
  type DesktopRegulationPriorityItem,
} from "./desktop-regulation-page-context";

type SummaryContextReason = {
  id: string;
  label: string;
  detail: string;
  valueLabel: string;
  tone: CfmTone;
};

@Component({
  selector: "cfm-desktop-regulation-summary-page",
  standalone: true,
  imports: [CommonModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="ctx.regulatoryShowcaseSummary as summary; else emptyState">
      <section class="cfm-reg-page regulation-summary-page">
        <section class="cfm-reg-stage">
          <section class="cfm-reg-main">
            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Synthèse</span>
                  <h3 class="cfm-reg-section-title">Veille réglementaire</h3>
                  <p>{{ summary.summary }}</p>
                </div>
                <cfm-status-chip [label]="summary.statusLabel" [tone]="summary.tone" />
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ summary.headline }}</strong>
                <span>{{ summary.context || summary.scoreSummary }}</span>
              </div>

              <div class="cfm-reg-summary-row">
                <span class="cfm-reg-meta-pill">{{ visiblePriorities.length }} priorité{{ visiblePriorities.length > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--warning">{{ ctx.regulatoryCriticalCount }} critique{{ ctx.regulatoryCriticalCount > 1 ? "s" : "" }}</span>
                <span class="cfm-reg-meta-pill cfm-reg-meta-pill--progress">{{ ctx.regulatoryMissingProofCount }} pièce{{ ctx.regulatoryMissingProofCount > 1 ? "s" : "" }} à compléter</span>
                <span class="cfm-reg-meta-pill">{{ ctx.regulatoryIncompleteSitesCount }} site{{ ctx.regulatoryIncompleteSitesCount > 1 ? "s" : "" }} à revoir</span>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">À traiter</span>
                  <h4 class="cfm-reg-section-title">Sujets prioritaires</h4>
                  <p>Le flux principal remonte les points qui demandent vraiment une action maintenant, avec le bon geste déjà explicite.</p>
                </div>
                <cfm-status-chip
                  [label]="focusCountLabel"
                  [tone]="visiblePriorities.length > 0 ? 'warning' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register" *ngIf="visiblePriorities.length > 0; else emptyPriorities">
                <article
                  class="cfm-reg-priority-row summary-priority-row"
                  *ngFor="let item of visiblePriorities; trackBy: trackByPriority"
                  [class.is-selected]="selectedPriority?.id === item.id"
                  (click)="selectPriority(item.id)"
                >
                  <div class="cfm-reg-priority-copy">
                    <strong class="record-primary">{{ item.title }}</strong>
                    <span class="record-meta">{{ item.impact }}</span>
                  </div>

                  <div class="summary-priority-status">
                    <cfm-status-chip [label]="item.familyLabel" tone="calm" />
                    <cfm-status-chip [label]="item.levelLabel" [tone]="item.tone" />
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ item.focusLabel || ctx.getRegulatoryShowcaseActionLabel(item) }}</strong>
                    <span class="record-meta">{{ item.context || "Action directe depuis la bonne vue réglementaire." }}</span>
                  </div>

                  <cfm-button
                    type="button"
                    size="sm"
                    [disabled]="!canRunPriorityAction(item) || ctx.isRegulatoryShowcaseActionBusy(item)"
                    (click)="runPriorityAction(item, $event)"
                  >
                    {{ ctx.getRegulatoryShowcaseActionLabel(item) }}
                  </cfm-button>
                </article>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--flat cfm-reg-section">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Veille</span>
                  <h4 class="cfm-reg-section-title">Familles à suivre</h4>
                  <p>Les grandes familles réglementaires restent lisibles d’un coup d’œil, sans retomber dans une lecture froide ou trop technique.</p>
                </div>
                <cfm-status-chip
                  [label]="ctx.regulatoryFamilyCards.length + ' famille' + (ctx.regulatoryFamilyCards.length > 1 ? 's' : '')"
                  [tone]="ctx.regulatoryFamilyCards.length > 0 ? 'calm' : 'neutral'"
                />
              </header>

              <div class="cfm-reg-register-head summary-family-head" *ngIf="ctx.regulatoryFamilyCards.length > 0">
                <span>Famille</span>
                <span>Situation</span>
                <span>Repères</span>
                <span>Action utile</span>
              </div>

              <div class="cfm-reg-register" *ngIf="ctx.regulatoryFamilyCards.length > 0; else emptyFamilies">
                <article
                  *ngFor="let family of ctx.regulatoryFamilyCards; trackBy: trackByFamily"
                  class="cfm-reg-register-row summary-family-row"
                  (click)="runFamilyAction(family, $event)"
                >
                  <div class="cfm-reg-register-cell">
                    <strong class="record-primary">{{ family.label }}</strong>
                    <span class="record-meta">{{ family.detail }}</span>
                  </div>

                  <div class="cfm-reg-register-cell summary-family-status">
                    <cfm-status-chip [label]="family.statusLabel" [tone]="family.tone" />
                    <span class="record-meta">{{ family.countLabel }}</span>
                  </div>

                  <div class="cfm-reg-register-cell">
                    <strong class="detail-copy">{{ family.highlights[0]?.value || "Aucun repère" }}</strong>
                    <span class="record-meta">{{ family.highlights[0]?.label || "Rien à signaler pour le moment" }}</span>
                  </div>

                  <cfm-button
                    type="button"
                    variant="ghost"
                    size="sm"
                    [disabled]="ctx.isRegulatoryShowcaseActionBusy(family)"
                    (click)="runFamilyAction(family, $event)"
                  >
                    {{ ctx.getRegulatoryShowcaseActionLabel(family) }}
                  </cfm-button>
                </article>
              </div>
            </article>
          </section>

          <aside class="cfm-reg-rail">
            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card" *ngIf="selectedPriority as item; else emptyPriorityDetail">
              <header class="cfm-reg-section-head">
                <div class="cfm-reg-section-copy">
                  <span class="panel-kicker">Sujet en vue</span>
                  <h4 class="cfm-reg-section-title">{{ item.title }}</h4>
                </div>
                <div class="cfm-reg-chip-row">
                  <cfm-status-chip [label]="item.familyLabel" tone="calm" />
                  <cfm-status-chip [label]="item.levelLabel" [tone]="item.tone" />
                </div>
              </header>

              <div class="cfm-reg-highlight">
                <strong>{{ ctx.getRegulatoryShowcaseActionLabel(item) }}</strong>
                <span>{{ item.impact }}</span>
              </div>

              <ul class="cfm-reg-data-list detail-copy">
                <li><span>Contexte</span><strong>{{ item.context || "Point de vigilance déjà identifié dans la vue concernée." }}</strong></li>
                <li><span>Focus</span><strong>{{ item.focusLabel || "À traiter maintenant" }}</strong></li>
              </ul>

              <div class="cfm-reg-rail-actions">
                <cfm-button
                  type="button"
                  [disabled]="!canRunPriorityAction(item) || ctx.isRegulatoryShowcaseActionBusy(item)"
                  (click)="runPriorityAction(item)"
                >
                  {{ ctx.getRegulatoryShowcaseActionLabel(item) }}
                </cfm-button>
              </div>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Watchlist</span>
                <h4 class="cfm-reg-section-title">Actions recommandées</h4>
              </header>

              <ul class="cfm-reg-rail-list detail-copy" *ngIf="ctx.regulatoryRecommendedActions.length > 0; else emptyRecommendations">
                <li *ngFor="let item of ctx.regulatoryRecommendedActions.slice(0, 4); trackBy: trackByAction">
                  <div class="summary-rail-copy">
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                  <cfm-button type="button" variant="ghost" size="sm" (click)="runActionItem(item, $event)">
                    {{ item.actionLabel }}
                  </cfm-button>
                </li>
              </ul>
            </article>

            <article class="cfm-tonal-panel cfm-tonal-panel--quiet cfm-reg-rail-card">
              <header class="cfm-reg-section-copy">
                <span class="panel-kicker">Repères</span>
                <h4 class="cfm-reg-section-title">Veille & lecture rapide</h4>
              </header>

              <ul class="cfm-reg-rail-list detail-copy">
                <li *ngFor="let item of contextReasonItems; trackBy: trackByReason">
                  <div class="summary-rail-copy">
                    <strong>{{ item.label }}</strong>
                    <span>{{ item.detail }}</span>
                  </div>
                  <cfm-status-chip [label]="item.valueLabel" [tone]="item.tone" />
                </li>
              </ul>
            </article>
          </aside>
        </section>
      </section>
    </ng-container>

    <ng-template #emptyPriorities>
      <section class="cfm-reg-empty">
        <strong>Rien d’urgent pour le moment</strong>
        <p>La synthèse reste calme et les prochaines actions sont déjà couvertes.</p>
      </section>
    </ng-template>

    <ng-template #emptyFamilies>
      <section class="cfm-reg-empty">
        <strong>Aucune famille visible</strong>
        <p>Les familles de veille apparaîtront ici dès qu’un premier périmètre réglementaire sera chargé.</p>
      </section>
    </ng-template>

    <ng-template #emptyPriorityDetail>
      <section class="cfm-reg-empty">
        <strong>Aucun sujet sélectionné</strong>
        <p>Choisissez un sujet prioritaire pour afficher son détail de veille et l’action utile.</p>
      </section>
    </ng-template>

    <ng-template #emptyRecommendations>
      <section class="cfm-reg-empty">
        <strong>Aucune recommandation supplémentaire</strong>
        <p>Les principales actions remontent déjà dans le flux central.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucune synthèse disponible"
        description="La lecture réglementaire se prépare pour cette organisation."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .summary-priority-row,
      .summary-family-head,
      .summary-family-row {
        display: grid;
        gap: 1rem;
        align-items: center;
      }

      .summary-priority-row {
        grid-template-columns: minmax(0, 1.18fr) auto minmax(0, 1fr) auto;
      }

      .summary-priority-row.is-selected {
        background: rgba(255, 255, 255, 0.9);
        box-shadow: var(--cfm-shadow-soft);
      }

      .summary-priority-status {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.45rem;
      }

      .summary-family-head,
      .summary-family-row {
        grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.82fr) minmax(0, 0.95fr) auto;
      }

      .summary-family-status,
      .summary-rail-copy {
        display: grid;
        gap: 0.22rem;
      }

      @media (max-width: 1180px) {
        .summary-priority-row,
        .summary-family-head,
        .summary-family-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopRegulationSummaryPageComponent {
  readonly ctx = inject(DESKTOP_REGULATION_PAGE_CONTEXT);

  private activePriorityId: string | null = null;

  get nextAction(): DesktopRegulationPriorityItem | null {
    return this.ctx.topRegulatoryPriority;
  }

  get visiblePriorities(): DesktopRegulationPriorityItem[] {
    return this.ctx.regulatoryPriorityItems.slice(0, 4);
  }

  get selectedPriority(): DesktopRegulationPriorityItem | null {
    if (this.activePriorityId) {
      const explicit = this.visiblePriorities.find((item) => item.id === this.activePriorityId);
      if (explicit) {
        return explicit;
      }
    }
    return this.nextAction ?? this.visiblePriorities[0] ?? null;
  }

  get contextReasonItems(): SummaryContextReason[] {
    return [
      {
        id: "score",
        label: "Score",
        detail: summaryLine(this.ctx.regulatoryComplianceScore, this.ctx.regulatoryShowcaseSummary?.scoreSummary ?? "Lecture globale en cours."),
        valueLabel: `${this.ctx.regulatoryComplianceScore}/100`,
        tone: "calm",
      },
      {
        id: "critical",
        label: "Points urgents",
        detail:
          this.ctx.regulatoryCriticalCount > 0
            ? `${this.ctx.regulatoryCriticalCount} point${this.ctx.regulatoryCriticalCount > 1 ? "s bloquent" : " bloque"} vraiment la lecture actuelle.`
            : "Aucun point urgent ne bloque la lecture pour le moment.",
        valueLabel: `${this.ctx.regulatoryCriticalCount}`,
        tone: this.ctx.regulatoryCriticalCount > 0 ? "warning" : "success",
      },
      {
        id: "proofs",
        label: "Pièces à compléter",
        detail:
          this.ctx.regulatoryMissingProofCount > 0
            ? `${this.ctx.regulatoryMissingProofCount} pièce${this.ctx.regulatoryMissingProofCount > 1 ? "s manquantes" : " manquante"} ou non exploitable${this.ctx.regulatoryMissingProofCount > 1 ? "s" : ""}.`
            : "Les pièces utiles sont déjà en place pour le moment.",
        valueLabel: `${this.ctx.regulatoryMissingProofCount}`,
        tone: this.ctx.regulatoryMissingProofCount > 0 ? "progress" : "success",
      },
      {
        id: "sites",
        label: "Sites à revoir",
        detail:
          this.ctx.regulatoryIncompleteSitesCount > 0
            ? `${this.ctx.regulatoryIncompleteSitesCount} site${this.ctx.regulatoryIncompleteSitesCount > 1 ? "s demandent" : " demande"} encore une vérification.`
            : "Les sites visibles ne demandent rien de plus pour le moment.",
        valueLabel: `${this.ctx.regulatoryIncompleteSitesCount}`,
        tone: this.ctx.regulatoryIncompleteSitesCount > 0 ? "warning" : "success",
      },
    ];
  }

  get focusCountLabel(): string {
    const total = this.visiblePriorities.length;
    return total > 0 ? `${total} priorité${total > 1 ? "s" : ""}` : "Rien d’urgent";
  }

  selectPriority(priorityId: string): void {
    this.activePriorityId = priorityId;
  }

  runPriorityAction(item: DesktopRegulationPriorityItem, event?: Event): void {
    event?.stopPropagation();
    if (!this.canRunPriorityAction(item)) {
      return;
    }
    this.activePriorityId = item.id;
    void this.ctx.runRegulatoryShowcaseAction(item);
  }

  runFamilyAction(item: DesktopRegulationFamilyCard, event?: Event): void {
    event?.stopPropagation();
    void this.ctx.runRegulatoryShowcaseAction(item);
  }

  runActionItem(item: DesktopRegulationActionItem, event?: Event): void {
    event?.stopPropagation();
    void this.ctx.runRegulatoryShowcaseAction(item);
  }

  canRunPriorityAction(item: DesktopRegulationPriorityItem): boolean {
    return item.actionKind !== "site_enrichment" || this.ctx.canActOnReglementation;
  }

  trackByPriority(_index: number, item: DesktopRegulationPriorityItem): string {
    return item.id;
  }

  trackByFamily(_index: number, item: DesktopRegulationFamilyCard): string {
    return item.id;
  }

  trackByAction(_index: number, item: DesktopRegulationActionItem): string {
    return item.id;
  }

  trackByReason(_index: number, item: SummaryContextReason): string {
    return item.id;
  }
}

function summaryLine(score: number, fallback: string): string {
  if (score >= 80) {
    return "Lecture plutôt saine, avec quelques points de preuve ou de site à garder en vue.";
  }
  if (score >= 60) {
    return fallback;
  }
  return "Plusieurs points remontent en même temps : il faut lancer la première action puis suivre les deux relais.";
}
