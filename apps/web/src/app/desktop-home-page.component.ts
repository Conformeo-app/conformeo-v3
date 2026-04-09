import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import type { ModuleCode } from "@conformeo/contracts";
import { RouterLink } from "@angular/router";
import {
  CfmButtonComponent,
  CfmDashboardTemplateComponent,
  CfmStatusChipComponent,
  type CfmTone,
} from "@conformeo/ui";

import { canReadModule } from "./desktop-access.utils";
import {
  DESKTOP_SHELL_CONTEXT,
  type DesktopHomeAlertItem,
  type DesktopHomeOverviewCard,
  type DesktopNavigationItem,
} from "./desktop-shell-context";

type HomeModuleShortcut = {
  route: string;
  label: string;
  tone: CfmTone;
  detail: string;
};

type HomeHeaderAction = {
  route: string;
  label: string;
  variant: "primary" | "secondary";
};

@Component({
  selector: "cfm-desktop-home-page",
  standalone: true,
  imports: [CommonModule, RouterLink, CfmButtonComponent, CfmDashboardTemplateComponent, CfmStatusChipComponent],
  template: `
    <cfm-dashboard-template class="cockpit-page">
      <header cfmDashboardIntro class="cockpit-header">
        <div class="cockpit-heading">
          <div class="cockpit-title-block">
            <span class="cockpit-kicker">Cockpit</span>
            <h3>Pilotage du jour</h3>
            <p>Repères immédiats, puis ouverture directe du bon module.</p>
          </div>

          <div class="chips">
            <cfm-status-chip
              [label]="ctx.isWorkspaceRefreshing ? 'Mise à jour en cours' : 'Cockpit prêt'"
              [tone]="ctx.isWorkspaceRefreshing ? 'progress' : 'success'"
            />
            <cfm-status-chip
              [label]="visiblePriorities.length + ' priorité' + (visiblePriorities.length > 1 ? 's' : '')"
              [tone]="visiblePriorities.length > 0 ? 'warning' : 'neutral'"
            />
          </div>
        </div>

        <div class="cockpit-header-actions" *ngIf="headerActions.length > 0">
          <cfm-button
            *ngFor="let action of headerActions; trackBy: trackByHeaderAction"
            type="button"
            [variant]="action.variant"
            size="sm"
            [routerLink]="[action.route]"
          >
            {{ action.label }}
          </cfm-button>
        </div>
      </header>

      <section cfmDashboardMetrics class="cockpit-kpi-band" *ngIf="visibleKpis.length > 0; else emptyKpis">
        <article class="kpi-cell" *ngFor="let kpi of visibleKpis; trackBy: trackByKpi">
          <span class="small">{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <span>{{ kpi.detail }}</span>
          <cfm-status-chip [label]="kpi.statusLabel" [tone]="kpi.tone" />
        </article>
      </section>

      <ng-template #emptyKpis>
        <section cfmDashboardMetrics class="workspace-panel cockpit-empty-state">
          <strong>{{ ctx.isWorkspaceRefreshing ? "Mise à jour en cours" : "Aucun repère immédiat" }}</strong>
          <p>
            {{
              ctx.isWorkspaceRefreshing
                ? "Le cockpit recharge les repères utiles."
                : "Les indicateurs du jour apparaîtront ici dès qu’un signal remontera."
            }}
          </p>
        </section>
      </ng-template>

      <section cfmDashboardMain class="workspace-panel workspace-panel--main">
        <div class="workspace-panel-head">
          <div class="panel-copy">
            <h4>Priorités</h4>
            <span class="small">Trois sujets maximum, orientés action.</span>
          </div>
          <cfm-status-chip
            [label]="visiblePriorities.length + ' sujet' + (visiblePriorities.length > 1 ? 's' : '')"
            [tone]="visiblePriorities.length > 0 ? 'warning' : 'neutral'"
          />
        </div>

        <div class="dense-table-head" *ngIf="visiblePriorities.length > 0">
          <span>Sujet</span>
          <span>Module</span>
          <span>Ouverture</span>
        </div>

        <ul class="dense-list" *ngIf="visiblePriorities.length > 0; else emptyPriorities">
          <li class="priority-line" *ngFor="let alert of visiblePriorities; trackBy: trackByPriority">
            <div class="priority-line-copy">
              <strong>{{ alert.title }}</strong>
              <span>{{ alert.description }}</span>
            </div>
            <cfm-status-chip [label]="alert.moduleLabel" [tone]="alert.tone" />
            <cfm-button type="button" variant="ghost" size="sm" [routerLink]="[getPriorityRoute(alert)]">
              Ouvrir
            </cfm-button>
          </li>
        </ul>
      </section>

      <aside cfmDashboardRail class="workspace-rail">
        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <div class="panel-copy">
              <h4>État du bureau</h4>
              <span class="small">Repères compacts par zone métier.</span>
            </div>
          </div>

          <ul class="dense-list" *ngIf="visibleOverviewCards.length > 0; else emptyOverview">
            <li class="status-line" *ngFor="let card of visibleOverviewCards; trackBy: trackByOverview">
              <div class="status-line-copy">
                <strong>{{ card.label }}</strong>
                <span>{{ card.headline }}</span>
                <span class="small">{{ card.detail }}</span>
              </div>
              <cfm-status-chip [label]="card.statusLabel" [tone]="card.tone" />
            </li>
          </ul>
        </section>

        <section class="workspace-panel">
          <div class="workspace-panel-head">
            <div class="panel-copy">
              <h4>Raccourcis modules</h4>
              <span class="small">Les détails vivent dans les modules.</span>
            </div>
          </div>

          <ul class="dense-list">
            <li class="shortcut-line" *ngFor="let item of moduleShortcuts; trackBy: trackByShortcut">
              <a class="shortcut-line-link" [routerLink]="[item.route]">
                <div class="shortcut-line-copy">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.detail }}</span>
                </div>
                <cfm-status-chip [label]="item.label" [tone]="item.tone" />
              </a>
            </li>
          </ul>
        </section>
      </aside>

      <ng-template #emptyPriorities>
        <div class="empty-inline">
          <strong>Aucune priorité immédiate</strong>
          <p>Le cockpit reste calme pour le moment.</p>
        </div>
      </ng-template>

      <ng-template #emptyOverview>
        <div class="empty-inline">
          <strong>Aucun repère complémentaire</strong>
          <p>Les modules détailleront les sujets au clic.</p>
        </div>
      </ng-template>
    </cfm-dashboard-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .cockpit-page,
      .cockpit-heading,
      .cockpit-title-block,
      .panel-copy,
      .priority-line-copy,
      .status-line-copy,
      .shortcut-line-copy,
      .cockpit-empty-state,
      .empty-inline {
        display: grid;
        gap: 0.32rem;
      }

      .cockpit-page,
      .workspace-rail,
      .dense-list {
        display: grid;
        gap: 1rem;
      }

      .cockpit-header,
      .workspace-panel-head,
      .status-line,
      .shortcut-line-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
      }

      .cockpit-header {
        align-items: start;
        padding: 1.45rem 1.25rem 1.35rem 1.6rem;
        border-radius: 24px;
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.16), transparent 28%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(242, 244, 247, 0.8));
        box-shadow: var(--cfm-shadow-overlay);
      }

      .cockpit-header-actions,
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
      }

      .cockpit-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .cockpit-title-block h3,
      .panel-copy h4 {
        margin: 0;
        color: var(--cfm-color-ink);
      }

      .cockpit-title-block h3 {
        font-size: 2.55rem;
        line-height: 0.96;
        letter-spacing: -0.05em;
      }

      .cockpit-title-block p,
      .panel-copy span,
      .priority-line-copy span,
      .status-line-copy span,
      .shortcut-line-copy span,
      .cockpit-empty-state p,
      .empty-inline p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.35;
      }

      .cockpit-kpi-band {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 1rem;
      }

      .kpi-cell {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.22rem 0.55rem;
        align-items: center;
        padding: 1rem 1rem 0.95rem 1.15rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.84);
        box-shadow: var(--cfm-shadow-soft);
      }

      .kpi-cell strong {
        font-family: var(--cfm-font-display);
        font-size: 2.05rem;
        line-height: 0.92;
        color: var(--cfm-color-ink);
      }

      .kpi-cell span:last-of-type {
        grid-column: 1 / 2;
      }

      .workspace-panel,
      .cockpit-empty-state {
        padding: 1rem 1rem 1.05rem 1.15rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.82);
        box-shadow: var(--cfm-shadow-soft);
      }

      .workspace-panel--main {
        align-content: start;
      }

      .dense-table-head {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 0.7rem;
        padding: 0 0.18rem;
        font-size: 0.74rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .dense-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .priority-line {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        gap: 0.7rem;
        align-items: center;
        padding: 1rem 0.4rem 1rem 1rem;
        border-radius: 16px;
        background: var(--cfm-color-surface-muted);
      }

      .status-line,
      .shortcut-line-link {
        padding: 1rem 0.4rem 1rem 1rem;
        border-radius: 16px;
        background: var(--cfm-color-surface-muted);
      }

      .shortcut-line {
        list-style: none;
      }

      .shortcut-line-link {
        color: inherit;
        text-decoration: none;
      }

      .shortcut-line-link:hover {
        background: var(--cfm-color-surface-high);
      }

      .priority-line-copy strong,
      .status-line-copy strong,
      .shortcut-line-copy strong,
      .cockpit-empty-state strong,
      .empty-inline strong {
        color: var(--cfm-color-ink);
      }

      .empty-inline {
        padding: 0.45rem 0;
      }

      @media (max-width: 1280px) {
        .cockpit-kpi-band {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 960px) {
        .cockpit-header,
        .workspace-panel-head,
        .kpi-cell,
        .status-line,
        .shortcut-line-link {
          display: grid;
        }

        .dense-table-head,
        .priority-line {
          grid-template-columns: 1fr;
        }

        .cockpit-kpi-band {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopHomePageComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);

  get visibleKpis() {
    return this.ctx.dashboardKpis.slice(0, 4);
  }

  get visiblePriorities() {
    return this.ctx.dashboardAlerts
      .filter((item) => this.canOpenModuleLabel(item.moduleLabel))
      .slice(0, 3);
  }

  get visibleOverviewCards(): DesktopHomeOverviewCard[] {
    return this.ctx.dashboardEnterpriseOverviewCards
      .filter((item) => this.canOpenModuleLabel(item.label))
      .slice(0, 3);
  }

  get headerActions(): HomeHeaderAction[] {
    const actions: HomeHeaderAction[] = [
      { route: "/app/reglementation", label: "Réglementation", variant: "secondary" },
      { route: "/app/chantiers", label: "Chantiers", variant: "primary" },
    ];

    return actions.filter((item) => this.canOpenModuleRoute(item.route));
  }

  get moduleShortcuts(): HomeModuleShortcut[] {
    return this.ctx.desktopNavigationItems
      .filter((item) => item.route !== "/app/home")
      .filter((item) => this.canOpenModuleRoute(item.route))
      .slice(0, 3)
      .map((item) => ({
        route: item.route,
        label: item.label,
        tone: item.tone,
        detail: this.getShortcutDetail(item),
      }));
  }

  getPriorityRoute(item: DesktopHomeAlertItem): string {
    const moduleCode = this.getModuleCodeFromLabel(item.moduleLabel);

    switch (moduleCode) {
      case "reglementation":
        return "/app/reglementation";
      case "chantier":
        return "/app/chantiers";
      case "facturation":
        return "/app/facturation";
      default:
        return "/app/home";
    }
  }

  private getShortcutDetail(item: DesktopNavigationItem): string {
    switch (item.route) {
      case "/app/reglementation":
        return "Pilotage, obligations et preuves.";
      case "/app/chantiers":
        return "Terrain, documents et coordination.";
      case "/app/facturation":
        return "Clients, factures et relances.";
      default:
        return "Ouvrir le module.";
    }
  }

  trackByKpi(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByPriority(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByOverview(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByShortcut(_index: number, item: { route: string }): string {
    return item.route;
  }

  trackByHeaderAction(_index: number, item: { route: string }): string {
    return item.route;
  }

  private canOpenModuleRoute(route: string): boolean {
    const moduleCode = this.getModuleCodeFromRoute(route);
    return moduleCode === null || canReadModule(this.ctx.currentMembership, moduleCode);
  }

  private canOpenModuleLabel(label: string): boolean {
    const moduleCode = this.getModuleCodeFromLabel(label);
    return moduleCode === null || canReadModule(this.ctx.currentMembership, moduleCode);
  }

  private getModuleCodeFromRoute(route: string): ModuleCode | null {
    if (route.startsWith("/app/reglementation")) {
      return "reglementation";
    }

    if (route.startsWith("/app/chantiers")) {
      return "chantier";
    }

    if (route.startsWith("/app/facturation")) {
      return "facturation";
    }

    return null;
  }

  private getModuleCodeFromLabel(label: string): ModuleCode | null {
    const normalizedLabel = label.trim().toLowerCase();

    if (normalizedLabel.includes("réglementation") || normalizedLabel.includes("reglementation")) {
      return "reglementation";
    }

    if (normalizedLabel.includes("chantier")) {
      return "chantier";
    }

    if (normalizedLabel.includes("facturation")) {
      return "facturation";
    }

    return null;
  }
}
