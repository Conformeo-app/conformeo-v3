import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { map } from "rxjs";

import { DesktopDetailDrawerComponent } from "./desktop-detail-drawer.component";
import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteDetailVm } from "./desktop-worksites.models";

type WorksiteDrawerState = "site" | null;

type WorksiteOverviewEntry = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  support: string | null;
  statusLabel: string | null;
  tone: CfmTone | null;
};

type WorksiteOverviewVm = {
  detail: DesktopWorksiteDetailVm;
  evidenceEntries: WorksiteOverviewEntry[];
  documentEntries: WorksiteOverviewEntry[];
  historyEntries: WorksiteOverviewEntry[];
  controlMissingItems: string[];
  controlReadyItems: string[];
};

@Component({
  selector: "cfm-desktop-worksite-overview-page",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
    DesktopDetailDrawerComponent,
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <ng-container *ngIf="vm.detail as worksite">
        <section class="overview-workspace">
          <section class="overview-stage">
            <section class="overview-main">
              <article class="story-panel story-panel--evidence">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Prouver</span>
                    <h4>Photos & preuves récentes</h4>
                    <p>Les dernières traces terrain visibles sans sortir du chantier.</p>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'preuves']">
                    Ouvrir les preuves
                  </cfm-button>
                </header>

                <div class="story-highlight" *ngIf="vm.evidenceEntries.length > 0; else noEvidence">
                  <strong>{{ vm.evidenceEntries[0].title }}</strong>
                  <span>{{ vm.evidenceEntries[0].detail }}</span>
                  <span *ngIf="vm.evidenceEntries[0].support">{{ vm.evidenceEntries[0].support }}</span>
                </div>

                <ul class="story-list" *ngIf="vm.evidenceEntries.length > 1">
                  <li *ngFor="let entry of vm.evidenceEntries | slice:1:5; trackBy: trackByEntry">
                    <div class="story-row-copy">
                      <span class="small">{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <span>{{ entry.detail }}</span>
                    </div>
                    <cfm-status-chip
                      *ngIf="entry.statusLabel && entry.tone"
                      class="status-chip"
                      [label]="entry.statusLabel"
                      [tone]="entry.tone"
                    />
                  </li>
                </ul>
              </article>

              <article class="story-panel story-panel--controls">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Centraliser</span>
                    <h4>Contrôles & conformité</h4>
                    <p>Ce qui empêche encore une remise propre et ce qui est déjà sécurisé.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.closure.statusLabel" [tone]="worksite.closure.statusTone" />
                </header>

                <div class="story-highlight">
                  <strong>{{ worksite.closure.summary }}</strong>
                  <span>{{ worksite.primarySignalDetail }}</span>
                </div>

                <div class="story-split">
                  <section class="story-block">
                    <h5>À lever avant remise</h5>
                    <ul class="compact-list" *ngIf="vm.controlMissingItems.length > 0; else noControlMissingItems">
                      <li *ngFor="let item of vm.controlMissingItems | slice:0:5; trackBy: trackByLabel">{{ item }}</li>
                    </ul>
                  </section>

                  <section class="story-block story-block--positive">
                    <h5>Déjà sécurisé</h5>
                    <ul class="compact-list" *ngIf="vm.controlReadyItems.length > 0; else noControlReadyItems">
                      <li *ngFor="let item of vm.controlReadyItems | slice:0:5; trackBy: trackByLabel">{{ item }}</li>
                    </ul>
                  </section>
                </div>

                <div class="story-actions">
                  <cfm-button
                    *ngIf="worksite.closure.canClose && facade.canActOnChantiers"
                    type="button"
                    size="sm"
                    [disabled]="facade.saving$ | async"
                    (click)="closeWorksite(worksite.id)"
                  >
                    {{ (facade.saving$ | async) ? "Clôture..." : "Clôturer le chantier" }}
                  </cfm-button>
                  <cfm-button
                    *ngIf="!worksite.closure.canClose"
                    type="button"
                    size="sm"
                    [routerLink]="worksite.closure.nextActionRoute"
                  >
                    {{ worksite.closure.nextActionLabel }}
                  </cfm-button>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'dossier']">
                    Voir le dossier
                  </cfm-button>
                </div>
              </article>

              <article class="story-panel">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Suivre</span>
                    <h4>Intervention & coordination</h4>
                    <p>Qui intervient, ce qui doit passer ensuite et la suite terrain utile.</p>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                    Ouvrir la coordination
                  </cfm-button>
                </header>

                <div class="story-highlight">
                  <strong>{{ worksite.planning.nextInterventionLabel }}</strong>
                  <span>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</span>
                  <span>{{ worksite.planning.nextInterventionAssigneeLabel }}</span>
                </div>

                <div class="story-split story-split--asym">
                  <section class="story-block">
                    <h5>Qui intervient</h5>
                    <ul class="compact-list">
                      <li>{{ worksite.coordination.teamName }}</li>
                      <li>{{ worksite.coordination.assigneeLabel }}</li>
                      <li>{{ worksite.coordination.coverageLabel }}</li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Suite terrain</h5>
                    <ul class="compact-list">
                      <li>{{ worksite.primaryActionLabel }}</li>
                      <li>{{ worksite.primaryActionDetail }}</li>
                      <li *ngIf="worksite.planning.lastInterventionFollowUp">{{ worksite.planning.lastInterventionFollowUp }}</li>
                      <li *ngIf="!worksite.planning.lastInterventionFollowUp">{{ worksite.issueSummaryLabel }}</li>
                    </ul>
                  </section>
                </div>
              </article>
            </section>

            <aside class="overview-rail">
              <article class="rail-panel rail-panel--summary">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Résumé opérationnel</span>
                    <h4>Résumé opérationnel</h4>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.globalStateLabel" [tone]="worksite.globalStateTone" />
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.primarySignalLabel }}</strong>
                  <span>{{ worksite.primarySignalDetail }}</span>
                </div>

                <ul class="rail-list">
                  <li>
                    <span class="small">Prochaine action</span>
                    <strong>{{ worksite.primaryActionLabel }}</strong>
                    <span>{{ worksite.primaryActionDetail }}</span>
                  </li>
                  <li>
                    <span class="small">Intervention</span>
                    <strong>{{ worksite.planning.nextInterventionLabel }}</strong>
                    <span>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Équipe</span>
                    <strong>{{ worksite.coordination.teamName }}</strong>
                    <span>{{ worksite.coordination.assigneeLabel }} · {{ worksite.coordination.coverageLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Dossier</span>
                    <strong>{{ worksite.closure.statusLabel }}</strong>
                    <span>{{ worksite.closure.summary }}</span>
                  </li>
                </ul>

                <div class="story-actions">
                  <cfm-button type="button" size="sm" [routerLink]="worksite.primaryActionRoute">
                    {{ worksite.primaryActionLabel }}
                  </cfm-button>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'dossier']">
                    Voir le dossier
                  </cfm-button>
                </div>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Documents clés</span>
                    <h4>Documents clés</h4>
                  </div>
                  <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'documents']">
                    Ouvrir
                  </cfm-button>
                </header>

                <ul class="story-list" *ngIf="vm.documentEntries.length > 0; else noDocuments">
                  <li *ngFor="let entry of vm.documentEntries; trackBy: trackByEntry">
                    <div class="story-row-copy">
                      <span class="small">{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <span>{{ entry.detail }}</span>
                      <span *ngIf="entry.support">{{ entry.support }}</span>
                    </div>
                    <cfm-status-chip
                      *ngIf="entry.statusLabel && entry.tone"
                      class="status-chip"
                      [label]="entry.statusLabel"
                      [tone]="entry.tone"
                    />
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Historique du site</span>
                    <h4>Historique du site</h4>
                  </div>
                  <cfm-button *ngIf="worksite.siteName" type="button" variant="ghost" size="sm" (click)="openDrawer('site')">
                    Voir le site
                  </cfm-button>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.siteName || "Site à relier" }}</strong>
                  <span>{{ worksite.siteAddress || "Adresse non précisée" }}</span>
                  <span *ngIf="worksite.siteEnrichmentState">{{ worksite.siteEnrichmentState.detail }}</span>
                </div>

                <ul class="story-list story-list--history" *ngIf="vm.historyEntries.length > 0; else noHistory">
                  <li *ngFor="let entry of vm.historyEntries; trackBy: trackByEntry">
                    <div class="story-row-copy">
                      <span class="small">{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <span>{{ entry.detail }}</span>
                      <span *ngIf="entry.support">{{ entry.support }}</span>
                    </div>
                    <cfm-status-chip
                      *ngIf="entry.statusLabel && entry.tone"
                      class="status-chip"
                      [label]="entry.statusLabel"
                      [tone]="entry.tone"
                    />
                  </li>
                </ul>
              </article>
            </aside>
          </section>

          <cfm-desktop-detail-drawer
            [open]="drawerState !== null"
            [title]="worksite.siteName || 'Site lié'"
            subtitle="Repère terrain"
            (closed)="closeDrawer()"
          >
            <ng-container *ngIf="drawerState === 'site'">
              <div class="drawer-content">
                <div class="chips">
                  <cfm-status-chip class="status-chip" *ngIf="worksite.siteTypeLabel" [label]="worksite.siteTypeLabel" tone="calm" />
                  <cfm-status-chip
                    class="status-chip"
                    *ngIf="worksite.siteEnrichmentState"
                    [label]="worksite.siteEnrichmentState.label"
                    [tone]="worksite.siteEnrichmentState.tone"
                  />
                </div>
                <p class="address">{{ worksite.siteAddress || "Adresse non précisée" }}</p>
                <p class="small context-text" *ngIf="worksite.siteEnrichmentState">{{ worksite.siteEnrichmentState.detail }}</p>
                <p class="small metadata" *ngIf="worksite.siteEnrichmentState?.reasonLabel">{{ worksite.siteEnrichmentState?.reasonLabel }}</p>
              </div>
            </ng-container>
          </cfm-desktop-detail-drawer>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #noEvidence>
      <div class="story-empty">
        <strong>Aucune preuve récente</strong>
        <p>Les photos, preuves et signatures terrain remonteront ici dès leur ajout.</p>
      </div>
    </ng-template>

    <ng-template #noDocuments>
      <div class="story-empty">
        <strong>Aucun document clé</strong>
        <p>Les documents chantier apparaîtront ici dès qu’ils seront disponibles.</p>
      </div>
    </ng-template>

    <ng-template #noHistory>
      <div class="story-empty">
        <strong>Aucun historique site exploitable</strong>
        <p>Le dernier passage terrain et les mouvements utiles remonteront ici.</p>
      </div>
    </ng-template>

    <ng-template #noControlMissingItems>
      <ul class="compact-list">
        <li>Aucun point de conformité ne bloque la remise.</li>
      </ul>
    </ng-template>

    <ng-template #noControlReadyItems>
      <ul class="compact-list">
        <li>Les éléments prêts remonteront ici quand la base chantier sera complète.</li>
      </ul>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucun aperçu disponible"
        description="Le chantier demandé n’est pas visible pour le moment."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .overview-workspace,
      .overview-main,
      .overview-rail,
      .story-panel,
      .rail-panel,
      .story-copy,
      .story-row-copy,
      .story-highlight,
      .story-block,
      .drawer-content,
      .story-empty,
      .rail-list li {
        display: grid;
        gap: 0.42rem;
      }

      .overview-workspace {
        gap: 1rem;
      }

      .overview-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.56fr) minmax(21rem, 0.78fr);
        gap: 1rem 1.15rem;
        align-items: start;
      }

      .overview-main {
        gap: 1rem;
      }

      .overview-rail {
        gap: 0.9rem;
      }

      .story-panel,
      .rail-panel {
        padding: 1.28rem 1.34rem 1.24rem;
        border-radius: 30px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(242, 244, 247, 0.88));
        box-shadow: 0 18px 36px rgba(10, 17, 40, 0.04);
      }

      .story-panel--evidence {
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.16), transparent 26%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(242, 244, 247, 0.9));
      }

      .story-panel--controls {
        background:
          linear-gradient(180deg, rgba(248, 249, 252, 0.98), rgba(237, 241, 248, 0.9));
      }

      .rail-panel {
        background:
          linear-gradient(180deg, rgba(242, 244, 247, 0.92), rgba(248, 249, 252, 0.88));
        box-shadow: none;
      }

      .story-head,
      .rail-head,
      .story-actions,
      .chips {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.9rem;
        flex-wrap: wrap;
      }

      .story-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .story-copy h4 {
        margin: 0;
        font-family: var(--cfm-font-display);
        font-size: clamp(1.55rem, 2vw, 2rem);
        line-height: 1;
        letter-spacing: -0.03em;
      }

      .story-copy p,
      .story-copy span,
      .story-row-copy span,
      .story-highlight span,
      .compact-list li,
      .rail-list li span,
      .story-empty p,
      .drawer-content p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.55;
      }

      .story-highlight {
        padding: 1rem 1.05rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.54);
      }

      .story-highlight--quiet {
        background: rgba(255, 255, 255, 0.44);
      }

      .story-highlight strong,
      .story-row-copy strong,
      .story-block h5,
      .rail-list strong,
      .story-empty strong {
        color: var(--cfm-color-ink);
      }

      .story-highlight strong {
        font-weight: var(--cfm-font-weight-semibold, 600);
        font-size: 1.04rem;
      }

      .story-list,
      .compact-list,
      .rail-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .story-list {
        display: grid;
        gap: 0.62rem;
      }

      .story-list li {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.88rem 0.94rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.46);
      }

      .story-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .story-split--asym {
        grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
      }

      .story-block {
        padding: 0.94rem 1rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.4);
      }

      .story-block--positive {
        background: rgba(237, 248, 241, 0.56);
      }

      .story-block h5 {
        margin: 0;
        font-size: 0.92rem;
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .compact-list {
        display: grid;
        gap: 0.38rem;
      }

      .rail-list {
        display: grid;
        gap: 0.78rem;
      }

      .story-empty {
        padding: 0.2rem 0;
      }

      .story-actions {
        align-items: center;
      }

      @media (max-width: 1180px) {
        .overview-stage,
        .story-split,
        .story-split--asym {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .story-head,
        .rail-head,
        .story-list li,
        .story-actions {
          display: grid;
        }
      }
    `,
  ],
})
export class DesktopWorksiteOverviewPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  readonly vm$ = this.facade
    .detail$(this.route.paramMap.pipe(map((params) => params.get("worksiteId"))))
    .pipe(map((worksite) => (worksite ? this.buildVm(worksite) : null)));

  drawerState: WorksiteDrawerState = null;

  openDrawer(kind: WorksiteDrawerState): void {
    this.drawerState = kind;
  }

  closeDrawer(): void {
    this.drawerState = null;
  }

  trackByEntry(_: number, entry: WorksiteOverviewEntry): string {
    return entry.id;
  }

  trackByLabel(_: number, label: string): string {
    return label;
  }

  async closeWorksite(worksiteId: string): Promise<void> {
    await this.facade.updateWorksiteStatus(worksiteId, "completed");
  }

  private buildVm(detail: DesktopWorksiteDetailVm): WorksiteOverviewVm {
    const evidenceEntries = [
      ...detail.proofs.slice(0, 4).map((proof) => ({
        id: `proof-${proof.id}`,
        eyebrow: "Preuve terrain",
        title: proof.label,
        detail: proof.uploadedAtLabel ? `${proof.statusLabel} · ${proof.uploadedAtLabel}` : proof.statusLabel,
        support: proof.notes ?? proof.fileName,
        statusLabel: proof.statusLabel,
        tone: proof.statusTone,
      })),
      ...detail.signatures.slice(0, 2).map((signature) => ({
        id: `signature-${signature.id}`,
        eyebrow: "Signature",
        title: signature.label,
        detail: signature.uploadedAtLabel ? `${signature.statusLabel} · ${signature.uploadedAtLabel}` : signature.statusLabel,
        support: signature.fileName,
        statusLabel: signature.statusLabel,
        tone: signature.statusTone,
      })),
    ];

    const documentEntries = detail.documents.slice(0, 4).map((document) => ({
      id: `document-${document.id}`,
      eyebrow: document.typeLabel,
      title: document.title,
      detail: `${document.lifecycleStatusLabel} · ${document.technicalStatusLabel}`,
      support: document.linkedProofsSummary || document.linkedSignatureLabel || document.notes || document.uploadedAtLabel,
      statusLabel: document.technicalStatusLabel,
      tone: document.technicalStatusTone,
    }));

    const historyEntries = [
      detail.planning.lastInterventionLabel
        ? {
            id: "last-intervention",
            eyebrow: "Dernier passage",
            title: detail.planning.lastInterventionLabel,
            detail:
              detail.planning.lastInterventionResultLabel && detail.planning.lastInterventionTimingLabel
                ? `${detail.planning.lastInterventionResultLabel} · ${detail.planning.lastInterventionTimingLabel}`
                : detail.planning.lastInterventionResultLabel || detail.planning.lastInterventionTimingLabel || "Compte-rendu non précisé",
            support: detail.planning.lastInterventionFollowUp || detail.planning.lastInterventionDetail,
            statusLabel: detail.planning.lastInterventionResultLabel,
            tone: detail.planning.lastInterventionResultTone,
          }
        : null,
      ...detail.recentEquipmentMovements.slice(0, 3).map((movement) => ({
        id: `movement-${movement.id}`,
        eyebrow: "Mouvement matériel",
        title: movement.equipmentName,
        detail: `${movement.movementLabel} · ${movement.capturedAtLabel || "Date non précisée"}`,
        support: movement.detail,
        statusLabel: movement.resultingStatusLabel,
        tone: movement.resultingStatusTone,
      })),
      detail.siteEnrichmentState
        ? {
            id: "site-enrichment",
            eyebrow: "Contexte site",
            title: detail.siteEnrichmentState.label,
            detail: detail.siteEnrichmentState.detail,
            support: detail.siteEnrichmentState.reasonLabel,
            statusLabel: detail.siteEnrichmentState.label,
            tone: detail.siteEnrichmentState.tone,
          }
        : null,
    ].filter((entry): entry is WorksiteOverviewEntry => entry !== null);

    return {
      detail,
      evidenceEntries,
      documentEntries,
      historyEntries,
      controlMissingItems:
        detail.closure.missingItems.length > 0 ? detail.closure.missingItems : detail.missingItems.slice(0, 5),
      controlReadyItems:
        detail.closure.readyItems.length > 0 ? detail.closure.readyItems : detail.availableItems.slice(0, 5),
    };
  }
}
