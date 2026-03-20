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
        class="desktop-card"
        eyebrow="Cockpit"
        title="Repères essentiels"
        description="Une reprise légère de la home pour valider le rendu du cockpit sans réactiver encore les vues d’ensemble et les listes détaillées."
      >
        <div class="hero-line">
          <div class="hero-copy">
            <h3>{{ ctx.currentMembership?.organization.name ?? 'Organisation' }}</h3>
            <p class="small">
              Les KPI et alertes simples du cockpit sont réactivés. Les vues d’ensemble et listes détaillées restent encore coupées.
            </p>
          </div>

          <div class="hero-chips">
            <cfm-status-chip
              [label]="ctx.dashboardKpis.length + ' repère' + (ctx.dashboardKpis.length > 1 ? 's' : '')"
              [tone]="ctx.dashboardKpis.length > 0 ? 'calm' : 'neutral'"
            />
            <cfm-status-chip
              [label]="ctx.isWorkspaceRefreshing ? 'Mise à jour en cours' : 'Workspace prêt'"
              [tone]="ctx.isWorkspaceRefreshing ? 'progress' : 'success'"
            />
          </div>
        </div>

        <div class="dashboard-grid" *ngIf="ctx.dashboardKpis.length > 0; else emptyKpis">
          <article class="dashboard-kpi-card" *ngFor="let kpi of ctx.dashboardKpis">
            <p class="small">{{ kpi.label }}</p>
            <strong>{{ kpi.value }}</strong>
            <p>{{ kpi.detail }}</p>
            <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
          </article>
        </div>

        <ng-template #emptyKpis>
          <div class="empty-copy">
            <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
              Les repères du cockpit sont en train d’être préparés.
            </p>
            <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
              Aucun repère cockpit n’est encore disponible.
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card"
        eyebrow="Priorités"
        title="Alertes simples"
        description="Un deuxième palier de la home pour valider le rendu des priorités sans encore réactiver les autres blocs."
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
          <div class="empty-copy">
            <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
              Les alertes du cockpit sont en train d’être préparées.
            </p>
            <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
              Aucune alerte simple n’est remontée pour le moment.
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card"
        eyebrow="Vue d’ensemble"
        title="Repères par module"
        description="Le troisième palier de la home remet les cartes d’ensemble, sans encore réactiver les listes détaillées chantier et clients."
      >
        <div class="dashboard-grid" *ngIf="ctx.dashboardEnterpriseOverviewCards.length > 0; else emptyOverview">
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
          <div class="empty-copy">
            <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
              Les cartes d’ensemble sont en train d’être préparées.
            </p>
            <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
              Aucune carte d’ensemble n’est encore disponible.
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card"
        eyebrow="Chantiers"
        title="Vue par chantier"
        description="Le quatrième palier de la home remet la lecture chantier, sans encore réactiver les autres blocs secondaires."
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
          <div class="empty-copy">
            <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
              Les repères chantier sont en train d’être préparés.
            </p>
            <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
              Aucun chantier n’est encore disponible pour cette vue.
            </p>
          </div>
        </ng-template>
      </cfm-card>

      <cfm-card
        class="desktop-card"
        eyebrow="Suivi"
        title="Clients et coordination"
        description="Le dernier palier de la home légère remet les repères restants, sans rouvrir les écrans détaillés."
      >
        <div class="other-grid">
          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>À traiter</h3>
                <p class="small">
                  Les éléments chantier et document qui demandent encore un suivi simple.
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
              <div class="empty-copy">
                <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
                  Les éléments à traiter sont en train d’être préparés.
                </p>
                <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
                  Aucun élément de coordination n’est en attente.
                </p>
              </div>
            </ng-template>
          </section>

          <section class="dashboard-kpi-card other-section">
            <div class="other-section-header">
              <div class="hero-copy">
                <h3>Vue par client</h3>
                <p class="small">
                  Une lecture commerciale courte pour repérer les clients qui demandent un suivi.
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
              <div class="empty-copy">
                <p class="small" *ngIf="ctx.isWorkspaceRefreshing">
                  Les repères client sont en train d’être préparés.
                </p>
                <p class="small" *ngIf="!ctx.isWorkspaceRefreshing">
                  Aucun client ne demande de suivi dans cette vue.
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
      }

      .workspace-body {
        display: grid;
        gap: 1.5rem;
        min-width: 0;
      }

      .hero-line {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .hero-copy {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
      }

      .hero-copy h3 {
        margin: 0;
      }

      .hero-copy p,
      .empty-copy p {
        margin: 0;
      }

      .hero-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        justify-content: flex-end;
      }

      .dashboard-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        min-width: 0;
      }

      .other-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        min-width: 0;
      }

      .alert-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.9rem;
      }

      .alert-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        border-radius: 1rem;
        background: linear-gradient(180deg, rgba(255, 252, 245, 0.96), rgba(247, 244, 236, 0.9));
        border: 1px solid rgba(145, 109, 26, 0.14);
        min-width: 0;
      }

      .alert-copy {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
      }

      .other-section {
        align-content: start;
      }

      .other-section-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem;
      }

      .worksite-copy p {
        line-height: 1.35;
        overflow-wrap: anywhere;
      }

      .dashboard-kpi-card {
        display: grid;
        gap: 0.6rem;
        padding: 1rem;
        border-radius: 1rem;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(244, 248, 246, 0.9));
        border: 1px solid rgba(33, 68, 49, 0.12);
        min-width: 0;
      }

      .dashboard-kpi-card p,
      .dashboard-kpi-card strong,
      .alert-copy p,
      .alert-copy strong {
        margin: 0;
      }

      .dashboard-kpi-card > strong:not(.overview-headline) {
        font-size: 1.8rem;
        line-height: 1;
      }

      .overview-highlights {
        display: grid;
        gap: 0.8rem;
        grid-template-columns: minmax(0, 1fr);
        min-width: 0;
      }

      .overview-highlight {
        display: grid;
        gap: 0.25rem;
        padding: 0.75rem;
        border-radius: 0.85rem;
        background: rgba(33, 68, 49, 0.04);
        min-width: 0;
      }

      .overview-highlight strong,
      .overview-highlight span {
        margin: 0;
      }

      .dashboard-overview-card {
        gap: 0.5rem;
      }

      .dashboard-overview-card p {
        line-height: 1.4;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .dashboard-overview-card > .overview-headline {
        font-size: 1.2rem;
        line-height: 1.2;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .overview-highlight .small {
        line-height: 1.2;
      }

      .overview-highlight-value {
        font-size: 0.92rem;
        line-height: 1.25;
        word-break: normal;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      .empty-copy {
        padding: 0.25rem 0 0;
      }

      .small {
        color: #52635a;
      }

      @media (max-width: 720px) {
        .hero-line {
          flex-direction: column;
        }

        .hero-chips {
          justify-content: flex-start;
        }

        .alert-item {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class DesktopHomePageComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);
}
