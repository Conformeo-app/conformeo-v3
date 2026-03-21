import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import {
  CfmCardComponent,
  CfmStatusChipComponent,
} from "@conformeo/ui";

import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";

@Component({
  selector: "cfm-desktop-home-page",
  standalone: true,
  imports: [
    CommonModule,
    CfmCardComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <section class="workspace-body">
      <cfm-card
        class="desktop-card home-section-card home-section-card--kpis"
        eyebrow="Cockpit"
        title="Pilotage du jour"
        description="Les points à surveiller maintenant."
      >
        <div class="hero-line">
          <div class="hero-copy">
            <p class="small">
              Priorités, alertes et modules à suivre.
            </p>
          </div>

          <div class="hero-chips">
            <div class="hero-chip-primary">
              <cfm-status-chip
                [label]="ctx.isWorkspaceRefreshing ? 'Mise à jour en cours' : 'Workspace prêt'"
                [tone]="ctx.isWorkspaceRefreshing ? 'progress' : 'success'"
              />
            </div>
            <div class="hero-chip-secondary">
              <cfm-status-chip
                [label]="ctx.dashboardKpis.length + ' repère' + (ctx.dashboardKpis.length > 1 ? 's' : '')"
                [tone]="ctx.dashboardKpis.length > 0 ? 'calm' : 'neutral'"
              />
            </div>
          </div>
        </div>

        <div class="dashboard-grid dashboard-grid--kpis" *ngIf="ctx.dashboardKpis.length > 0; else emptyKpis">
          <article
            class="dashboard-kpi-card"
            *ngFor="let kpi of ctx.dashboardKpis"
            [class.dashboard-kpi-card--attention]="kpi.tone === 'warning' || kpi.tone === 'critical'"
          >
            <p class="small">{{ kpi.label }}</p>
            <strong>{{ kpi.value }}</strong>
            <p>{{ kpi.detail }}</p>
            <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
          </article>
        </div>

        <ng-template #emptyKpis>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun repère pour le moment" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les repères du cockpit arrivent."
                  : "Le cockpit affichera ici les points utiles à suivre."
              }}
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card home-section-card home-section-card--alerts"
        eyebrow="Priorités"
        title="Actions prioritaires"
        description="Ce qui demande une action maintenant."
      >
        <div class="hero-chips">
          <cfm-status-chip
            [label]="ctx.dashboardAlerts.length > 0
              ? ctx.dashboardAlerts.length + ' priorité' + (ctx.dashboardAlerts.length > 1 ? 's' : '')
              : 'Aucune alerte simple'"
            [tone]="ctx.dashboardAlerts.length > 0 ? 'progress' : 'success'"
          />
        </div>

        <ul class="alert-list" *ngIf="ctx.dashboardAlerts.length > 0; else emptyAlerts">
          <li class="alert-item" *ngFor="let alert of ctx.dashboardAlerts">
            <div class="alert-copy">
              <strong>{{ alert.title }}</strong>
              <p>{{ alert.description }}</p>
            </div>
            <div class="hero-chips">
              <cfm-status-chip [label]="alert.moduleLabel" [tone]="alert.tone" />
            </div>
          </li>
        </ul>

        <ng-template #emptyAlerts>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucune priorité critique" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les alertes utiles se préparent."
                  : "Rien d’urgent pour le moment."
              }}
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card home-section-card home-section-card--overview"
        eyebrow="Vue d’ensemble"
        title="Repères par module"
        description="Lecture rapide des modules."
      >
        <div class="dashboard-grid dashboard-grid--overview" *ngIf="ctx.dashboardEnterpriseOverviewCards.length > 0; else emptyOverview">
          <article class="dashboard-kpi-card dashboard-overview-card" *ngFor="let card of ctx.dashboardEnterpriseOverviewCards">
            <p class="small">{{ card.label }}</p>
            <strong class="overview-headline">{{ card.headline }}</strong>
            <p>{{ card.detail }}</p>

            <div class="overview-highlights" *ngIf="card.highlights.length > 0">
              <div class="overview-highlight" *ngFor="let highlight of card.highlights">
                <span class="small">{{ highlight.label }}</span>
                <strong class="overview-highlight-value">{{ highlight.value }}</strong>
              </div>
            </div>

            <cfm-status-chip [label]="card.statusLabel" [tone]="card.tone" />
          </article>
        </div>

        <ng-template #emptyOverview>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun repère par module" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les modules se mettent à jour."
                  : "La vue d’ensemble apparaitra ici dès qu’un repère remonte."
              }}
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card home-section-card home-section-card--worksites"
        eyebrow="Chantiers"
        title="Chantiers à suivre"
        description="Les points utiles pour décider vite."
      >
        <div class="hero-chips">
          <cfm-status-chip
            [label]="ctx.worksiteOverviewCountLabel"
            [tone]="ctx.filteredDashboardWorksiteOverviewItems.length > 0 ? 'calm' : 'neutral'"
          />
        </div>

        <ul class="alert-list" *ngIf="ctx.filteredDashboardWorksiteOverviewItems.length > 0; else emptyWorksites">
          <li class="alert-item" *ngFor="let item of ctx.filteredDashboardWorksiteOverviewItems">
            <div class="alert-copy worksite-copy">
              <strong>{{ item.name }}</strong>
              <p>{{ item.summary }}</p>
              <p>{{ item.operationalSummary }}</p>
              <p>{{ item.taskSummary }}</p>
              <p>{{ item.linkedWorksiteDocumentsSummary }}</p>
              <p *ngIf="item.financialSummary">{{ item.financialSummary }}</p>
              <p *ngIf="item.regulatorySummary">{{ item.regulatorySummary }}</p>
            </div>

            <div class="hero-chips">
              <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
              <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
            </div>
          </li>
        </ul>

        <ng-template #emptyWorksites>
          <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
            <p class="state-title">
              {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun chantier à suivre" }}
            </p>
            <p class="small">
              {{
                ctx.isWorkspaceRefreshing
                  ? "Les repères chantier se mettent à jour."
                  : "Aucun point terrain ne demande d’action."
              }}
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card home-section-card home-section-card--other"
        eyebrow="Suivi"
        title="Suivi quotidien"
        description="Clients et coordination sans surcharge."
      >
        <div class="other-grid">
          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>À traiter</h3>
                <p class="small">
                  Ce qui demande une action rapide.
                </p>
              </div>

              <div class="hero-chips">
                <cfm-status-chip
                  [label]="ctx.coordinationTodoCountLabel"
                  [tone]="ctx.coordinationTodoItems.length > 0 ? 'progress' : 'success'"
                />
              </div>
            </div>

            <ul class="alert-list" *ngIf="ctx.coordinationTodoItems.length > 0; else emptyCoordination">
              <li class="alert-item" *ngFor="let item of ctx.coordinationTodoItems">
                <div class="alert-copy">
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.description }}</p>
                  <p *ngIf="item.context">{{ item.context }}</p>
                </div>

                <div class="hero-chips">
                  <cfm-status-chip [label]="item.kindLabel" [tone]="item.kindTone" />
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                </div>
              </li>
            </ul>

            <ng-template #emptyCoordination>
              <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
                <p class="state-title">
                  {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun point à traiter" }}
                </p>
                <p class="small">
                  {{
                    ctx.isWorkspaceRefreshing
                      ? "Le suivi quotidien se prépare."
                      : "Rien d’urgent côté coordination."
                  }}
                </p>
              </div>
            </ng-template>
          </section>

          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>Vue par client</h3>
                <p class="small">
                  Les clients qui demandent un suivi.
                </p>
              </div>

              <div class="hero-chips">
                <cfm-status-chip
                  [label]="ctx.customerOverviewCountLabel"
                  [tone]="ctx.dashboardCustomerOverviewItems.length > 0 ? 'calm' : 'neutral'"
                />
              </div>
            </div>

            <ul class="alert-list" *ngIf="ctx.dashboardCustomerOverviewItems.length > 0; else emptyCustomers">
              <li class="alert-item" *ngFor="let item of ctx.dashboardCustomerOverviewItems">
                <div class="alert-copy">
                  <strong>{{ item.name }}</strong>
                  <p>{{ item.summary }}</p>
                  <p>{{ item.context }}</p>
                </div>

                <div class="hero-chips">
                  <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                  <cfm-status-chip [label]="item.signalLabel" [tone]="item.signalTone" />
                </div>
              </li>
            </ul>

            <ng-template #emptyCustomers>
              <div class="empty-copy" [class.empty-copy--loading]="ctx.isWorkspaceRefreshing">
                <p class="state-title">
                  {{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun client à suivre" }}
                </p>
                <p class="small">
                  {{
                    ctx.isWorkspaceRefreshing
                      ? "Les repères client se mettent à jour."
                      : "Aucun suivi client prioritaire pour le moment."
                  }}
                </p>
              </div>
            </ng-template>
          </section>
        </div>
      </cfm-card>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        color: #17312b;
      }

      cfm-card.desktop-card {
        display: block;
      }

      .workspace-body {
        display: grid;
        gap: 1.25rem;
        min-width: 0;
      }

      .hero-line,
      .other-section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.85rem;
        min-width: 0;
      }

      .hero-line {
        margin-bottom: 0.9rem;
        padding-bottom: 0.15rem;
        border-bottom: 1px solid rgba(33, 68, 49, 0.08);
      }

      .hero-copy {
        display: grid;
        gap: 0.25rem;
        min-width: 0;
      }

      .hero-copy h3 {
        margin: 0;
        font-size: 1.02rem;
        line-height: 1.2;
        font-weight: 650;
        color: #17312b;
      }

      .hero-copy p,
      .empty-copy p {
        margin: 0;
      }

      .hero-chips {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.45rem;
        justify-content: flex-end;
        min-width: 0;
      }

      .hero-chips cfm-status-chip {
        max-width: 100%;
      }

      .hero-chip-primary,
      .hero-chip-secondary {
        display: inline-flex;
      }

      .hero-chip-secondary {
        opacity: 0.78;
      }

      .dashboard-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        min-width: 0;
      }

      .dashboard-grid--overview {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .other-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        min-width: 0;
      }

      .alert-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.85rem;
      }

      .dashboard-kpi-card,
      .alert-item,
      .empty-copy {
        border-radius: 1rem;
        border: 1px solid rgba(33, 68, 49, 0.12);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          0 10px 22px rgba(18, 33, 42, 0.04);
        min-width: 0;
      }

      .dashboard-kpi-card {
        display: grid;
        gap: 0.65rem;
        padding: 1rem 1.05rem;
      }

      .alert-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.95rem 1rem;
      }

      .alert-copy {
        display: grid;
        gap: 0.3rem;
        min-width: 0;
      }

      .other-section {
        align-content: start;
      }

      .worksite-copy p {
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .dashboard-kpi-card p,
      .dashboard-kpi-card strong,
      .alert-copy p,
      .alert-copy strong {
        margin: 0;
      }

      .dashboard-kpi-card p,
      .alert-copy p {
        color: #415349;
        line-height: 1.4;
      }

      .dashboard-kpi-card > .small,
      .overview-highlight .small {
        font-weight: 600;
        letter-spacing: 0.01em;
        color: #52635a;
      }

      .alert-copy strong {
        font-size: 0.98rem;
        line-height: 1.25;
        color: #17312b;
      }

      .dashboard-kpi-card > strong:not(.overview-headline) {
        font-size: 1.65rem;
        line-height: 1.05;
        letter-spacing: -0.02em;
        color: #17312b;
      }

      .dashboard-kpi-card--attention {
        border-color: rgba(186, 131, 34, 0.28);
        background: linear-gradient(180deg, rgba(255, 252, 245, 0.97), rgba(247, 243, 232, 0.92));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.94),
          0 12px 24px rgba(120, 84, 24, 0.08);
      }

      .dashboard-kpi-card--attention > strong {
        color: #7a4a1f;
      }

      .overview-highlights {
        display: grid;
        gap: 0.65rem;
        grid-template-columns: minmax(0, 1fr);
        min-width: 0;
      }

      .overview-highlight {
        display: grid;
        gap: 0.25rem;
        padding: 0.7rem 0.75rem;
        border-radius: 0.85rem;
        background: rgba(33, 68, 49, 0.04);
        border: 1px solid rgba(33, 68, 49, 0.08);
        min-width: 0;
      }

      .overview-highlight strong,
      .overview-highlight span {
        margin: 0;
      }

      .dashboard-overview-card {
        gap: 0.55rem;
      }

      .dashboard-overview-card p {
        line-height: 1.4;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .dashboard-overview-card > .overview-headline {
        font-size: 1.08rem;
        line-height: 1.25;
        color: #17312b;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .overview-highlight .small {
        line-height: 1.2;
      }

      .overview-highlight-value {
        font-size: 0.9rem;
        line-height: 1.25;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .empty-copy {
        display: grid;
        gap: 0.28rem;
        padding: 0.94rem 1rem;
        border-style: dashed;
        align-content: start;
      }

      .empty-copy--loading {
        border-color: rgba(168, 131, 60, 0.2);
        background: linear-gradient(180deg, rgba(255, 249, 238, 0.96), rgba(255, 255, 255, 0.9));
      }

      .state-title {
        margin: 0;
        font-size: 0.92rem;
        line-height: 1.25;
        font-weight: 650;
        color: #17312b;
      }

      .empty-copy--loading .state-title {
        color: #6c5422;
      }

      .small {
        font-size: 0.84rem;
        line-height: 1.35;
        color: #617166;
      }

      .empty-copy .small {
        max-width: 44ch;
      }

      @media (max-width: 1280px) {
        .dashboard-grid--overview {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .dashboard-grid--overview > .dashboard-overview-card:last-child:nth-child(odd) {
          grid-column: 1 / -1;
        }
      }

      @media (max-width: 1180px) {
        .workspace-body {
          gap: 1.15rem;
        }

        .dashboard-grid--kpis {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .other-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 1024px) {
        .hero-line,
        .other-section-header {
          flex-direction: column;
        }

        .hero-chips {
          justify-content: flex-start;
        }

        .alert-item {
          flex-direction: column;
        }
      }

      @media (max-width: 820px) {
        .dashboard-grid--kpis,
        .dashboard-grid--overview {
          grid-template-columns: 1fr;
        }

        .dashboard-kpi-card,
        .alert-item,
        .empty-copy {
          padding: 0.95rem;
        }

        .home-section-card--worksites .alert-list,
        .home-section-card--other .alert-list {
          gap: 0.7rem;
        }

        .home-section-card--worksites .alert-item,
        .home-section-card--other .alert-item {
          gap: 0.72rem;
          padding: 0.82rem 0.88rem;
        }

        .home-section-card--other .dashboard-kpi-card {
          gap: 0.55rem;
          padding: 0.86rem 0.9rem;
        }

        .home-section-card--worksites .hero-chips,
        .home-section-card--other .hero-chips {
          gap: 0.32rem;
        }

        .home-section-card--worksites .alert-copy,
        .home-section-card--other .alert-copy,
        .home-section-card--other .hero-copy {
          gap: 0.22rem;
        }
      }
    `,
  ],
})
export class DesktopHomePageComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);
}
