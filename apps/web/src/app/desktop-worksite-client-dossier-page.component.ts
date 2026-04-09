import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { map } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteDetailVm } from "./desktop-worksites.models";

type WorksiteDossierItem = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  support: string | null;
  statusLabel: string;
  tone: CfmTone;
};

type WorksiteDossierExportItem = {
  id: string;
  title: string;
  detail: string;
  buttonLabel: string;
  variant: "primary" | "secondary" | "ghost";
};

type WorksiteDossierRepereItem = {
  id: string;
  label: string;
  title: string;
  detail: string;
};

type WorksiteDossierVm = {
  detail: DesktopWorksiteDetailVm;
  dossierStatusLabel: string;
  dossierStatusTone: CfmTone;
  dossierSummary: string;
  missingItems: string[];
  contentItems: WorksiteDossierItem[];
  exportItems: WorksiteDossierExportItem[];
  repereItems: WorksiteDossierRepereItem[];
};

@Component({
  selector: "cfm-desktop-worksite-client-dossier-page",
  standalone: true,
  imports: [CommonModule, RouterLink, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <ng-container *ngIf="vm.detail as worksite">
        <section class="dossier-workspace">
          <section class="dossier-stage">
            <section class="dossier-main">
              <article class="story-panel story-panel--priority">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Préparer</span>
                    <h4>Avant remise</h4>
                    <p>Le point d’entrée principal pour savoir si le chantier peut être remis proprement et ce qu’il faut encore boucler.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="vm.dossierStatusLabel" [tone]="vm.dossierStatusTone" />
                </header>

                <div class="story-highlight">
                  <strong>{{ vm.dossierSummary }}</strong>
                  <span>{{ worksite.closure.statusLabel }} · {{ worksite.primarySignalDetail }}</span>
                </div>

                <div class="story-split">
                  <section class="story-block">
                    <h5>Ce qui manque encore</h5>
                    <ul class="compact-list" *ngIf="vm.missingItems.length > 0; else noMissingItems">
                      <li *ngFor="let item of vm.missingItems; trackBy: trackByLabel">{{ item }}</li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Action utile maintenant</h5>
                    <div class="action-callout">
                      <div class="section-copy">
                        <strong>{{ worksite.closure.nextActionLabel }}</strong>
                        <span>{{ worksite.primaryActionDetail }}</span>
                      </div>
                      <cfm-button
                        *ngIf="!worksite.closure.canClose"
                        type="button"
                        size="sm"
                        [routerLink]="worksite.closure.nextActionRoute"
                      >
                        Ouvrir
                      </cfm-button>
                    </div>
                    <p class="panel-note" *ngIf="worksite.closure.canClose">
                      Tous les repères utiles sont en place. La page sert maintenant surtout à vérifier puis clôturer proprement.
                    </p>
                  </section>
                </div>
              </article>

              <article class="story-panel story-panel--content">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Composer</span>
                    <h4>Contenu du dossier</h4>
                    <p>Ce qui est déjà réellement prêt à remettre ou déjà disponible côté chantier, sans doublon avec les manques.</p>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'documents']">
                    Ouvrir les documents
                  </cfm-button>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.documentsCountLabel }}</strong>
                  <span>{{ worksite.proofsCountLabel }} · {{ worksite.signaturesCountLabel }}</span>
                </div>

                <ul class="story-list">
                  <li *ngFor="let item of vm.contentItems; trackBy: trackByItem">
                    <div class="story-row-copy">
                      <span class="small">{{ item.eyebrow }}</span>
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.detail }}</span>
                      <span *ngIf="item.support">{{ item.support }}</span>
                    </div>
                    <cfm-status-chip class="status-chip" [label]="item.statusLabel" [tone]="item.tone" />
                  </li>
                </ul>
              </article>

              <article class="story-panel story-panel--final">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Finaliser</span>
                    <h4>Préparation finale / clôture</h4>
                    <p>La zone de décision finale pour vérifier le chantier, revenir au terrain si besoin et clôturer quand tout est prêt.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.closure.statusLabel" [tone]="worksite.closure.statusTone" />
                </header>

                <div class="story-split story-split--final">
                  <section class="story-block">
                    <h5>État de préparation</h5>
                    <ul class="compact-list">
                      <li>{{ worksite.closure.summary }}</li>
                      <li>{{ worksite.coordination.coverageLabel }} · {{ worksite.coordination.assigneeLabel }}</li>
                      <li>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Actions finales</h5>
                    <div class="action-stack">
                      <cfm-button
                        *ngIf="!worksite.closure.isClosed"
                        type="button"
                        [routerLink]="worksite.closure.nextActionRoute"
                      >
                        {{ worksite.closure.nextActionLabel }}
                      </cfm-button>
                      <cfm-button type="button" variant="secondary" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                        Vérifier le chantier
                      </cfm-button>
                      <cfm-button type="button" variant="ghost" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                        Revenir à la coordination
                      </cfm-button>
                      <cfm-button
                        *ngIf="worksite.closure.canClose && facade.canActOnChantiers"
                        type="button"
                        variant="secondary"
                        [disabled]="facade.saving$ | async"
                        (click)="closeWorksite(worksite.id)"
                      >
                        {{ (facade.saving$ | async) ? "Clôture..." : "Clôturer le chantier" }}
                      </cfm-button>
                    </div>
                  </section>
                </div>
              </article>
            </section>

            <aside class="dossier-rail">
              <article class="rail-panel rail-panel--summary">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Résumé du dossier</span>
                    <h4>Résumé du dossier</h4>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="vm.dossierStatusLabel" [tone]="vm.dossierStatusTone" />
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ vm.dossierSummary }}</strong>
                  <span>{{ worksite.siteName || "Site à relier" }}</span>
                </div>

                <ul class="rail-list">
                  <li>
                    <span class="small">Prêt à remettre</span>
                    <strong>{{ worksite.closure.readyItems.length }} repère{{ worksite.closure.readyItems.length > 1 ? "s" : "" }}</strong>
                    <span>Éléments déjà sécurisés pour la remise ou la clôture.</span>
                  </li>
                  <li>
                    <span class="small">À compléter</span>
                    <strong>{{ vm.missingItems.length }} point{{ vm.missingItems.length > 1 ? "s" : "" }}</strong>
                    <span>Repères encore attendus avant une remise propre.</span>
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Exports disponibles</span>
                    <h4>Exports disponibles</h4>
                  </div>
                </header>

                <ul class="story-list story-list--exports">
                  <li *ngFor="let item of vm.exportItems; trackBy: trackByExportItem">
                    <div class="story-row-copy">
                      <span class="small">Export réel</span>
                      <strong>{{ item.title }}</strong>
                      <span>{{ item.detail }}</span>
                    </div>

                    <cfm-button
                      *ngIf="item.id === 'summary'"
                      type="button"
                      [variant]="item.variant"
                      size="sm"
                      [disabled]="(facade.summaryPdfBusyId$ | async) === worksite.id"
                      (click)="facade.downloadSummaryPdf(worksite.id)"
                    >
                      {{ (facade.summaryPdfBusyId$ | async) === worksite.id ? "Préparation..." : item.buttonLabel }}
                    </cfm-button>

                    <cfm-button
                      *ngIf="item.id === 'prevention'"
                      type="button"
                      [variant]="item.variant"
                      size="sm"
                      [disabled]="(facade.preventionPdfBusyId$ | async) === worksite.id"
                      (click)="facade.downloadPreventionPlanPdf(worksite.id)"
                    >
                      {{ (facade.preventionPdfBusyId$ | async) === worksite.id ? "Préparation..." : item.buttonLabel }}
                    </cfm-button>
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Repères utiles</span>
                    <h4>Repères utiles</h4>
                  </div>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.primarySignalLabel }}</strong>
                  <span>{{ worksite.primarySignalDetail }}</span>
                </div>

                <ul class="rail-list">
                  <li *ngFor="let item of vm.repereItems; trackBy: trackByRepereItem">
                    <span class="small">{{ item.label }}</span>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.detail }}</span>
                  </li>
                </ul>
              </article>
            </aside>
          </section>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #noMissingItems>
      <ul class="compact-list">
        <li>Aucun manque critique ne remonte : le dossier est prêt à être remis ou exporté.</li>
      </ul>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Dossier chantier indisponible"
        description="Le chantier demandé n’est pas disponible pour la préparation du dossier."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .dossier-workspace,
      .dossier-main,
      .dossier-rail,
      .story-panel,
      .rail-panel,
      .story-copy,
      .story-row-copy,
      .story-highlight,
      .story-block,
      .section-copy,
      .rail-list li {
        display: grid;
        gap: 0.42rem;
      }

      .dossier-workspace {
        gap: 1rem;
      }

      .dossier-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.56fr) minmax(21rem, 0.78fr);
        gap: 1rem 1.15rem;
        align-items: start;
      }

      .dossier-main {
        gap: 1rem;
      }

      .dossier-rail {
        gap: 0.9rem;
      }

      .story-panel,
      .rail-panel {
        padding: 1.28rem 1.34rem 1.24rem;
        border-radius: 30px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(242, 244, 247, 0.88));
        box-shadow: 0 18px 36px rgba(10, 17, 40, 0.04);
      }

      .story-panel--priority {
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.14), transparent 26%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(242, 244, 247, 0.9));
      }

      .story-panel--content {
        background: linear-gradient(180deg, rgba(248, 249, 252, 0.98), rgba(240, 243, 248, 0.9));
      }

      .story-panel--final,
      .rail-panel {
        background: linear-gradient(180deg, rgba(243, 245, 248, 0.92), rgba(248, 249, 252, 0.88));
        box-shadow: none;
      }

      .story-head,
      .rail-head,
      .story-actions,
      .action-callout {
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
      .section-copy span,
      .compact-list li,
      .rail-list li span,
      .panel-note {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.55;
      }

      .story-highlight {
        padding: 1rem 1.05rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.56);
      }

      .story-highlight--quiet {
        background: rgba(255, 255, 255, 0.44);
      }

      .story-highlight strong,
      .story-row-copy strong,
      .story-block h5,
      .section-copy strong,
      .rail-list strong {
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

      .story-list--exports li {
        align-items: center;
      }

      .story-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .story-split--final {
        align-items: start;
      }

      .story-block {
        padding: 0.12rem 0;
      }

      .story-block h5 {
        margin: 0 0 0.18rem;
        font-size: 0.92rem;
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .compact-list,
      .rail-list {
        display: grid;
        gap: 0.62rem;
      }

      .compact-list li,
      .rail-list li {
        padding: 0.82rem 0.88rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.4);
      }

      .action-callout {
        padding: 0.95rem 1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.5);
      }

      .action-stack {
        display: grid;
        gap: 0.62rem;
        align-content: start;
      }

      @media (max-width: 1180px) {
        .dossier-stage,
        .story-split {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .story-head,
        .rail-head,
        .story-list li,
        .action-callout {
          display: grid;
        }

        .story-panel,
        .rail-panel {
          padding: 1.1rem 1.05rem 1.04rem;
          border-radius: 24px;
        }
      }
    `,
  ],
})
export class DesktopWorksiteClientDossierPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly worksiteId$ = (this.route.parent ? this.route.parent.paramMap : this.route.paramMap).pipe(
    map((params) => params.get("worksiteId")),
  );

  readonly vm$ = this.facade.detail$(this.worksiteId$).pipe(map((detail) => (detail ? this.buildVm(detail) : null)));

  private buildVm(detail: DesktopWorksiteDetailVm): WorksiteDossierVm {
    const contentItems: WorksiteDossierItem[] = [
      {
        id: "summary",
        eyebrow: "Synthèse",
        title: "Fiche chantier PDF",
        detail: "Synthèse du chantier à remettre ou à archiver côté client.",
        support: detail.isPersisted ? "Export déjà disponible depuis le chantier." : "Le chantier doit être enregistré pour produire la fiche.",
        statusLabel: detail.isPersisted ? "Prête" : "À préparer",
        tone: detail.isPersisted ? "success" : "warning",
      },
      {
        id: "prevention",
        eyebrow: "Prévention",
        title: "Plan de prévention",
        detail: "Document PDF exportable depuis le chantier.",
        support: detail.coordination.assigneeLabel,
        statusLabel: detail.isPersisted ? "Prêt" : "À préparer",
        tone: detail.isPersisted ? "success" : "warning",
      },
      {
        id: "documents",
        eyebrow: "Documents",
        title: "Documents chantier",
        detail: detail.documentsCountLabel,
        support: "Pièces de chantier déjà visibles et mobilisables pour la remise.",
        statusLabel: detail.documents.length > 0 ? "Inclus" : "À compléter",
        tone: detail.documents.length > 0 ? "success" : "warning",
      },
      {
        id: "proofs",
        eyebrow: "Preuves",
        title: "Preuves et signatures",
        detail: `${detail.proofsCountLabel} · ${detail.signaturesCountLabel}`,
        support: "Justificatifs terrain déjà collectés ou encore partiels.",
        statusLabel:
          detail.proofs.length > 0 && detail.signatures.length > 0
            ? "Prêtes"
            : detail.proofs.length > 0 || detail.signatures.length > 0
              ? "Partielles"
              : "À compléter",
        tone:
          detail.proofs.length > 0 && detail.signatures.length > 0
            ? "success"
            : detail.proofs.length > 0 || detail.signatures.length > 0
              ? "progress"
              : "warning",
      },
      {
        id: "coordination",
        eyebrow: "Coordination",
        title: "Coordination chantier",
        detail: detail.coordination.assigneeLabel,
        support: detail.coordination.coverageDetail,
        statusLabel: detail.coordination.status === "done" ? "Prête" : detail.coordination.statusLabel,
        tone: detail.coordination.status === "done" ? "success" : detail.coordination.statusTone,
      },
    ];

    const exportItems: WorksiteDossierExportItem[] = [
      {
        id: "summary",
        title: "Fiche chantier PDF",
        detail: "Export synthétique du chantier prêt à être remis ou archivé.",
        buttonLabel: "Exporter la fiche PDF",
        variant: "secondary",
      },
      {
        id: "prevention",
        title: "Plan de prévention",
        detail: "Export PDF du plan de prévention disponible depuis le chantier.",
        buttonLabel: "Exporter le plan de prévention",
        variant: "ghost",
      },
    ];

    const repereItems: WorksiteDossierRepereItem[] = [
      {
        id: "coordination",
        label: "Coordination",
        title: detail.coordination.coverageLabel,
        detail: `${detail.coordination.teamName} · ${detail.coordination.assigneeLabel}`,
      },
      {
        id: "intervention",
        label: "Intervention",
        title: detail.planning.nextInterventionLabel,
        detail: `${detail.planning.nextInterventionStatusLabel} · ${detail.planning.nextInterventionTimingLabel}`,
      },
      {
        id: "remise",
        label: "Remise client",
        title: detail.closure.nextActionLabel,
        detail: detail.primaryActionDetail,
      },
    ];

    return {
      detail,
      dossierStatusLabel: detail.closure.statusLabel,
      dossierStatusTone: detail.closure.statusTone,
      dossierSummary: detail.closure.summary,
      missingItems: detail.closure.missingItems,
      contentItems,
      exportItems,
      repereItems,
    };
  }

  async closeWorksite(worksiteId: string): Promise<void> {
    await this.facade.updateWorksiteStatus(worksiteId, "completed");
  }

  trackByItem(_index: number, item: WorksiteDossierItem): string {
    return item.id;
  }

  trackByExportItem(_index: number, item: WorksiteDossierExportItem): string {
    return item.id;
  }

  trackByRepereItem(_index: number, item: WorksiteDossierRepereItem): string {
    return item.id;
  }

  trackByLabel(_index: number, label: string): string {
    return label;
  }
}
