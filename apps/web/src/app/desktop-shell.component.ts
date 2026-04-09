import { CommonModule } from "@angular/common";
import { Component, DestroyRef, HostListener, inject } from "@angular/core";
import { ROLE_LABELS } from "@conformeo/contracts";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { CfmButtonComponent } from "@conformeo/ui";

import { canAccessAdministration, canReadModule } from "./desktop-access.utils";
import { DesktopGlobalSearchComponent } from "./desktop-global-search.component";
import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";
import { DesktopSessionStateService } from "./desktop-session-state.service";

const FALLBACK_ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  contributor: "Terrain",
  viewer: "Lecteur",
  member: "Membre",
};

const SAFE_ROLE_LABELS: Record<string, string> = {
  ...FALLBACK_ROLE_LABELS,
  ...((ROLE_LABELS as Record<string, string> | undefined) ?? {}),
};

type DesktopShellNavItem = {
  id: string;
  label: string;
  route: string;
  supportLabel: string;
};

@Component({
  selector: "cfm-desktop-shell",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    CfmButtonComponent,
    DesktopGlobalSearchComponent,
  ],
  template: `
    <main class="desktop-shell">
      <aside class="desktop-shell-sidebar">
        <a class="desktop-shell-brand" [routerLink]="['/app/home']">
          <span class="desktop-shell-brand-mark" aria-hidden="true">✦</span>
          <span class="desktop-shell-brand-copy">
            <strong>Conforméo</strong>
            <small>Digital Foreman</small>
          </span>
        </a>

        <nav class="desktop-shell-nav" aria-label="Navigation principale" *ngIf="primaryNavItems.length > 0">
          <a
            *ngFor="let item of primaryNavItems; trackBy: trackByNavItem"
            class="desktop-shell-nav-link"
            [routerLink]="item.route"
            [class.is-active]="isNavItemActive(item)"
          >
            <span class="desktop-shell-nav-link-copy">
              <span class="desktop-shell-nav-label">{{ item.label }}</span>
            </span>
          </a>
        </nav>

        <div class="desktop-shell-secondary-group">
          <nav class="desktop-shell-utility-nav" aria-label="Navigation utile" *ngIf="utilityNavItems.length > 0">
            <a
              *ngFor="let item of utilityNavItems; trackBy: trackByNavItem"
              class="desktop-shell-utility-link"
              [routerLink]="item.route"
              [class.is-active]="isNavItemActive(item)"
            >
              <span>{{ item.label }}</span>
              <small>{{ item.supportLabel }}</small>
            </a>
          </nav>

          <div class="desktop-shell-sidebar-cta" *ngIf="showCreateWorksiteCta">
            <cfm-button type="button" size="sm" class="desktop-shell-sidebar-button" [routerLink]="['/app/chantiers/creer']">
              Nouveau chantier
            </cfm-button>
          </div>

          <div class="desktop-shell-support-actions">
            <a class="desktop-shell-support-link" [routerLink]="['/app/home']">Aide</a>

            <cfm-button
              type="button"
              variant="ghost"
              size="sm"
              class="desktop-shell-signout"
              (click)="ctx.logout()"
            >
              Déconnexion
            </cfm-button>
          </div>
        </div>
      </aside>

      <section class="desktop-shell-workspace">
        <header class="desktop-shell-topbar">
          <cfm-desktop-global-search
            class="desktop-shell-search"
            [membership]="ctx.currentMembership"
          />

          <div class="desktop-shell-topbar-main">
            <span class="desktop-shell-topbar-tag" *ngIf="localNavItems.length === 0">{{ activeViewLabel }}</span>

            <nav class="desktop-shell-local-nav cfm-soft-nav cfm-soft-nav--quiet" *ngIf="localNavItems.length > 0">
              <a
                *ngFor="let item of localNavItems; trackBy: trackByNavItem"
                class="cfm-soft-nav__link"
                [routerLink]="item.route"
                [class.is-active]="isLocalNavItemActive(item)"
              >
                {{ item.label }}
              </a>
            </nav>
          </div>

          <div class="desktop-shell-topbar-controls">
            <a class="desktop-shell-alert-pill" [routerLink]="['/app/home']">
              <span class="desktop-shell-alert-label">Alertes</span>
              <strong class="desktop-shell-alert-count" [class.has-alerts]="alertCount > 0">{{ alertCount }}</strong>
            </a>

            <div class="desktop-shell-sync-pill" [class.is-busy]="ctx.isWorkspaceRefreshing">
              <span>Sync Terrain</span>
              <strong>{{ ctx.isWorkspaceRefreshing ? "En cours" : "Stable" }}</strong>
            </div>

            <div class="desktop-shell-user-menu" *ngIf="sessionContext">
              <button
                type="button"
                class="desktop-shell-user-chip"
                aria-haspopup="menu"
                [attr.aria-expanded]="profileMenuOpen"
                (click)="toggleProfileMenu($event)"
              >
                <span class="desktop-shell-user-avatar">{{ userInitial }}</span>
                <span class="desktop-shell-user-name">{{ sessionContext.userLabel }}</span>
              </button>

              <div class="desktop-shell-user-dropdown" *ngIf="profileMenuOpen" role="menu">
                <div class="desktop-shell-user-dropdown-head">
                  <strong>{{ sessionContext.userLabel }}</strong>
                  <span>{{ sessionContext.roleLabel }}</span>
                </div>

                <a class="desktop-shell-user-action" [routerLink]="[profileRoute]" (click)="closeProfileMenu()">
                  Profil
                </a>
                <a class="desktop-shell-user-action" [routerLink]="[settingsRoute]" (click)="closeProfileMenu()">
                  Paramètres
                </a>
                <button type="button" class="desktop-shell-user-action desktop-shell-user-action--danger" (click)="logoutFromMenu()">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </header>

        <div class="workspace-feedback-stack" *ngIf="ctx.errorMessage || ctx.isWorkspaceRefreshing || ctx.feedbackMessage">
          <div class="feedback error" *ngIf="ctx.errorMessage">
            <span class="feedback-title">Action indisponible</span>
            <span class="feedback-body">{{ ctx.errorMessage }}</span>
          </div>
          <div class="feedback progress" *ngIf="ctx.isWorkspaceRefreshing && !ctx.errorMessage">
            <span class="feedback-title">Mise à jour en cours</span>
            <span class="feedback-body">Les données restent visibles pendant l’actualisation.</span>
          </div>
          <div class="feedback success" *ngIf="ctx.feedbackMessage && !ctx.errorMessage">
            <span class="feedback-title">Action terminée</span>
            <span class="feedback-body">{{ ctx.feedbackMessage }}</span>
          </div>
        </div>

        <section class="desktop-shell-content">
          <router-outlet />
        </section>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
        color: var(--cfm-color-ink, #161822);
      }

      .desktop-shell {
        display: grid;
        grid-template-columns: 14rem minmax(0, 1fr);
        height: 100vh;
        overflow: hidden;
        background: #f2f0ec;
      }

      .desktop-shell-sidebar {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0.62rem;
        position: sticky;
        top: 0;
        height: 100vh;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 1rem 0.82rem 0.94rem 0.84rem;
        background: linear-gradient(180deg, #f6f3ee 0%, #f3f1ec 100%);
        color: var(--cfm-color-ink, #161822);
        border-right: 1px solid rgba(22, 24, 34, 0.08);
      }

      .desktop-shell-brand,
      .desktop-shell-utility-link {
        display: grid;
      }

      .desktop-shell-brand {
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 0.62rem;
        padding: 0.12rem 0.18rem 0.28rem 0.08rem;
        text-decoration: none;
        color: inherit;
      }

      .desktop-shell-brand-mark {
        display: inline-grid;
        place-items: center;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 10px;
        background: #121827;
        color: #f7f3ea;
        font-size: 0.82rem;
      }

      .desktop-shell-brand-copy {
        display: grid;
        gap: 0.04rem;
      }

      .desktop-shell-brand-copy strong,
      .desktop-shell-brand-copy small {
        display: block;
      }

      .desktop-shell-brand-copy strong {
        font-family: var(--cfm-font-display, Georgia, serif);
        font-size: 1.28rem;
        font-weight: 520;
        line-height: 0.98;
        letter-spacing: -0.04em;
      }

      .desktop-shell-brand-copy small {
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted, #60758c);
      }

      .desktop-shell-nav,
      .desktop-shell-secondary-group,
      .desktop-shell-utility-nav,
      .workspace-feedback-stack {
        display: grid;
        gap: 0.34rem;
      }

      .desktop-shell-nav {
        min-height: auto;
        overflow: visible;
        align-content: start;
      }

      .desktop-shell-nav-link,
      .desktop-shell-utility-link {
        text-decoration: none;
        color: var(--cfm-color-copy, #2f3b4d);
        border-radius: 8px;
        transition:
          background-color 140ms ease,
          color 140ms ease,
          box-shadow 140ms ease;
      }

      .desktop-shell-nav-link {
        display: block;
        padding: 0.38rem 0.32rem 0.38rem 0.72rem;
        background: transparent;
      }

      .desktop-shell-nav-link:hover,
      .desktop-shell-nav-link.is-active {
        background: rgba(255, 255, 255, 0.26);
        transform: none;
      }

      .desktop-shell-nav-link.is-active {
        color: var(--cfm-color-ink, #161822);
        box-shadow: inset 2px 0 0 rgba(196, 146, 44, 0.9);
      }

      .desktop-shell-nav-label {
        font-weight: 560;
        font-size: 0.88rem;
        line-height: 1.18;
      }

      .desktop-shell-sidebar-cta {
        margin-top: 0.2rem;
      }

      .desktop-shell-sidebar-button,
      .desktop-shell-signout {
        width: 100%;
      }

      .desktop-shell-secondary-group {
        gap: 0.48rem;
        margin-top: 22.6rem;
        padding: 0.85rem 0.52rem 0.58rem;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.34);
        box-shadow: inset 0 0 0 1px rgba(22, 24, 34, 0.06);
      }

      .desktop-shell-utility-link {
        gap: 0.12rem;
        padding: 0.34rem 0.38rem;
        background: transparent;
      }

      .desktop-shell-utility-link:hover,
      .desktop-shell-utility-link.is-active {
        background: rgba(255, 255, 255, 0.28);
      }

      .desktop-shell-utility-link small {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.74rem;
      }

      .desktop-shell-support-actions {
        display: grid;
        gap: 0.32rem;
        padding-top: 0.45rem;
        margin-top: 0.2rem;
        border-top: 1px solid rgba(22, 24, 34, 0.08);
      }

      .desktop-shell-support-link {
        padding: 0.38rem 0.18rem;
        color: var(--cfm-color-copy-muted, #60758c);
        text-decoration: none;
        font-size: 0.82rem;
      }

      .desktop-shell-workspace {
        min-width: 0;
        height: 100vh;
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        gap: 1rem;
        padding: 0.78rem 1rem 1rem 1rem;
        overflow: hidden;
      }

      .desktop-shell-topbar {
        display: grid;
        grid-template-columns: minmax(16rem, 21rem) minmax(0, 1fr) auto;
        align-items: center;
        gap: 1.12rem;
        min-height: 3.35rem;
        padding: 0.4rem 1rem 0.42rem;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 18px;
        box-shadow: 0 12px 28px rgba(10, 17, 40, 0.04);
      }

      .desktop-shell-topbar-main {
        display: flex;
        align-items: center;
        gap: 0.96rem;
        min-width: 0;
      }

      .desktop-shell-topbar-tag {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.78rem;
        white-space: nowrap;
      }

      .desktop-shell-local-nav {
        min-width: 0;
      }

      .desktop-shell-search {
        min-width: 0;
      }

      .desktop-shell-topbar-controls {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-end;
        gap: 0.78rem;
      }

      .desktop-shell-alert-pill,
      .desktop-shell-sync-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.34rem 0.6rem;
        border-radius: 999px;
        background: #f5f4f1;
        color: var(--cfm-color-ink, #161822);
        text-decoration: none;
      }

      .desktop-shell-alert-pill {
        position: relative;
        background: rgba(216, 76, 76, 0.08);
        box-shadow: inset 0 0 0 1px rgba(216, 76, 76, 0.14);
      }

      .desktop-shell-alert-pill::before {
        content: "";
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 999px;
        background: #d84c4c;
        box-shadow: 0 0 0 3px rgba(216, 76, 76, 0.14);
      }

      .desktop-shell-alert-label {
        color: #a14a4a;
        font-size: 0.74rem;
        font-weight: 600;
      }

      .desktop-shell-alert-count {
        display: inline-grid;
        place-items: center;
        min-width: 1.35rem;
        height: 1.35rem;
        padding: 0 0.28rem;
        border-radius: 999px;
        background: rgba(216, 76, 76, 0.14);
        color: #b53f3f;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .desktop-shell-alert-pill span:not(.desktop-shell-alert-label),
      .desktop-shell-sync-pill span {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.71rem;
      }

      .desktop-shell-sync-pill strong {
        color: var(--cfm-color-ink, #161822);
        font-size: 0.77rem;
      }

      .desktop-shell-sync-pill.is-busy strong {
        color: var(--cfm-color-info-ink, #2c5fb8);
      }

      .desktop-shell-organization-switch select {
        min-width: 8.2rem;
        padding: 0.18rem 0 0.18rem;
        font-size: 0.78rem;
        background: transparent;
        border: 0;
      }

      .desktop-shell-user-menu {
        position: relative;
      }

      .desktop-shell-user-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.42rem;
        padding: 0 0 0 0.08rem;
        border: 0;
        background: transparent;
        cursor: pointer;
      }

      .desktop-shell-user-avatar {
        display: inline-grid;
        place-items: center;
        width: 1.92rem;
        height: 1.92rem;
        border-radius: 999px;
        background: #121827;
        color: #f4f6fb;
        font-size: 0.78rem;
        font-weight: 650;
      }

      .desktop-shell-user-name {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.76rem;
        max-width: 6rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .desktop-shell-user-dropdown {
        position: absolute;
        top: calc(100% + 0.55rem);
        right: 0;
        z-index: 30;
        display: grid;
        gap: 0.28rem;
        min-width: 11.5rem;
        padding: 0.55rem;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 18px 36px rgba(10, 17, 40, 0.12);
      }

      .desktop-shell-user-dropdown-head {
        display: grid;
        gap: 0.08rem;
        padding: 0.28rem 0.34rem 0.5rem;
        border-bottom: 1px solid rgba(22, 24, 34, 0.08);
      }

      .desktop-shell-user-dropdown-head strong {
        font-size: 0.84rem;
      }

      .desktop-shell-user-dropdown-head span {
        color: var(--cfm-color-copy-muted, #60758c);
        font-size: 0.76rem;
      }

      .desktop-shell-user-action {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 2rem;
        padding: 0.38rem 0.42rem;
        border: 0;
        border-radius: 10px;
        background: transparent;
        color: var(--cfm-color-ink, #161822);
        text-decoration: none;
        text-align: left;
        cursor: pointer;
      }

      .desktop-shell-user-action:hover {
        background: rgba(22, 24, 34, 0.05);
      }

      .desktop-shell-user-action--danger {
        color: #b24a4a;
      }

      .desktop-shell-signout {
        justify-self: start;
        padding-inline: 0;
        color: var(--cfm-color-copy-muted, #60758c);
      }

      .feedback {
        display: grid;
        gap: 0.2rem;
        padding: 0.75rem 0.9rem 0.8rem 1.05rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        box-shadow: var(--cfm-shadow-soft, 0 10px 20px rgba(10, 17, 40, 0.03));
      }

      .feedback-title,
      .feedback-body {
        margin: 0;
      }

      .feedback-title {
        font-weight: 650;
      }

      .feedback.error {
        background: var(--cfm-color-danger-bg, #fceeee);
        color: var(--cfm-color-danger-ink, #a65252);
      }

      .feedback.progress {
        background: var(--cfm-color-info-bg, #eaf2ff);
        color: var(--cfm-color-info-ink, #2c5fb8);
      }

      .feedback.success {
        background: var(--cfm-color-success-bg, #edf8f1);
        color: var(--cfm-color-success-ink, #2f7a4f);
      }

      .desktop-shell-content {
        min-width: 0;
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
        padding-top: 0.15rem;
        padding-right: 0.1rem;
      }

      @media (max-width: 1280px) {
        .desktop-shell-topbar {
          grid-template-columns: minmax(0, 1fr);
        }

        .desktop-shell-topbar-controls {
          justify-content: flex-start;
        }
      }

      @media (max-width: 1024px) {
        :host {
          height: auto;
          overflow: visible;
        }

        .desktop-shell {
          grid-template-columns: 1fr;
          height: auto;
          overflow: visible;
        }

        .desktop-shell-sidebar {
          position: static;
          height: auto;
          overflow: visible;
          padding-bottom: 0.95rem;
        }

        .desktop-shell-secondary-group {
          margin-top: 1.4rem;
        }

        .desktop-shell-nav,
        .desktop-shell-utility-nav {
          grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
        }

        .desktop-shell-workspace {
          height: auto;
          overflow: visible;
          padding-top: 1rem;
        }
      }

      @media (max-width: 720px) {
        .desktop-shell-workspace {
          padding-inline: 0.85rem;
        }

        .desktop-shell-topbar {
          padding: 0.95rem;
        }

        .desktop-shell-nav,
        .desktop-shell-utility-nav {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopShellComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sessionState = inject(DesktopSessionStateService);

  primaryNavItems: DesktopShellNavItem[] = [];
  utilityNavItems: DesktopShellNavItem[] = [];
  localNavItems: DesktopShellNavItem[] = [];

  activeViewEyebrow = "Navigation";
  activeViewLabel = "Tableau de bord";
  activeViewSupportLabel = "Pilotage du jour et ouverture rapide.";

  private currentPath = "/app/home";

  sessionContext: {
    organizationName: string;
    userLabel: string;
    roleLabel: string;
  } | null = null;

  organizationSwitcher: {
    selectedOrganizationId: string;
    items: Array<{ id: string; name: string }>;
  } | null = null;
  profileMenuOpen = false;

  constructor() {
    this.refreshShellState();

    this.sessionState.snapshot$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshShellState();
      });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.refreshShellState();
      });
  }

  trackByNavItem(_index: number, item: DesktopShellNavItem): string {
    return item.id;
  }

  isNavItemActive(item: DesktopShellNavItem): boolean {
    switch (item.id) {
      case "dashboard":
        return this.currentPath === "/app/home";
      case "worksites":
        return this.currentPath.startsWith("/app/chantiers")
          && !this.currentPath.startsWith("/app/chantiers/parc")
          && !/\/documents(?:\/|$)/.test(this.currentPath);
      case "billing":
        return this.currentPath.startsWith("/app/facturation");
      case "regulation":
        return this.currentPath.startsWith("/app/reglementation");
      case "documents":
        return this.currentPath.startsWith("/app/documents");
      case "teams":
        return this.currentPath.startsWith("/app/administration/equipes");
      case "equipment-park":
        return this.currentPath.startsWith("/app/chantiers/parc");
      case "administration":
        return this.currentPath.startsWith("/app/administration")
          && !this.currentPath.startsWith("/app/administration/equipes");
      default:
        return this.currentPath === item.route || this.currentPath.startsWith(`${item.route}/`);
    }
  }

  isLocalNavItemActive(item: DesktopShellNavItem): boolean {
    if (item.route === "/app/facturation") {
      return this.currentPath === "/app/facturation";
    }
    return this.currentPath === item.route || this.currentPath.startsWith(`${item.route}/`);
  }

  get alertCount(): number {
    return this.ctx.dashboardAlerts.length;
  }

  get profileRoute(): string {
    return this.canAccessAdministration() ? "/app/administration/utilisateurs" : "/app/home";
  }

  get settingsRoute(): string {
    return this.canAccessAdministration() ? "/app/administration/organisation" : "/app/home";
  }

  get showCreateWorksiteCta(): boolean {
    return this.canReadModule("chantier");
  }

  get userInitial(): string {
    const label = this.sessionContext?.userLabel?.trim();
    if (!label) {
      return "U";
    }
    return label.charAt(0).toUpperCase();
  }

  onOrganizationChange(nextOrganizationId: string): void {
    if (!this.organizationSwitcher || !nextOrganizationId || nextOrganizationId === this.ctx.selectedOrganizationId) {
      return;
    }

    this.organizationSwitcher = {
      ...this.organizationSwitcher,
      selectedOrganizationId: nextOrganizationId,
    };
    this.ctx.selectedOrganizationId = nextOrganizationId;

    void this.ctx.changeOrganization().finally(() => {
      this.refreshShellState();
    });
  }

  toggleProfileMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  logoutFromMenu(): void {
    this.profileMenuOpen = false;
    this.ctx.logout();
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest(".desktop-shell-user-menu")) {
      this.profileMenuOpen = false;
    }
  }

  @HostListener("document:keydown.escape")
  onEscapeKey(): void {
    this.profileMenuOpen = false;
  }

  private refreshShellState(): void {
    this.profileMenuOpen = false;
    this.syncRouteState();
    this.syncSessionContext();
    this.syncOrganizationSwitcher();
    this.syncActiveViewCopy();
    this.syncNavigationItems();
    this.syncLocalNavigationItems();
  }

  private syncNavigationItems(): void {
    const nextPrimaryItems: DesktopShellNavItem[] = [
      {
        id: "dashboard",
        label: "Tableau de bord",
        route: "/app/home",
        supportLabel: "Vue globale",
      },
    ];

    if (this.canReadModule("chantier")) {
      nextPrimaryItems.push({
        id: "worksites",
        label: "Chantiers",
        route: "/app/chantiers/liste",
        supportLabel: "Pilotage terrain",
      });
    }

    if (this.canReadModule("facturation")) {
      nextPrimaryItems.push({
        id: "billing",
        label: "Facturation",
        route: "/app/facturation",
        supportLabel: "Devis, factures, relances",
      });
    }

    if (this.canReadModule("reglementation")) {
      nextPrimaryItems.push({
        id: "regulation",
        label: "Réglementation",
        route: "/app/reglementation/synthese",
        supportLabel: "Obligations, preuves, sites",
      });
    }

    if (this.canReadModule("chantier") || this.canReadModule("reglementation") || this.canReadModule("facturation")) {
      nextPrimaryItems.push({
        id: "documents",
        label: "Documents",
        route: "/app/documents",
        supportLabel: "Pièces & dossiers",
      });
    }

    if (this.canAccessAdministration()) {
      nextPrimaryItems.push({
        id: "teams",
        label: "Équipe",
        route: "/app/administration/equipes",
        supportLabel: "Utilisateurs & équipes",
      });
    }

    if (this.canReadModule("chantier")) {
      nextPrimaryItems.push({
        id: "equipment-park",
        label: "Parc équipement",
        route: "/app/chantiers/parc",
        supportLabel: "Matériel & affectations",
      });
    }

    const nextUtilityItems = this.canAccessAdministration()
      ? [
          {
            id: "administration",
            label: "Administration",
            route: "/app/administration/organisation",
            supportLabel: "Organisation & accès",
          },
        ]
      : [];

    if (!this.areNavListsEqual(this.primaryNavItems, nextPrimaryItems)) {
      this.primaryNavItems = nextPrimaryItems;
    }

    if (!this.areNavListsEqual(this.utilityNavItems, nextUtilityItems)) {
      this.utilityNavItems = nextUtilityItems;
    }
  }

  private syncSessionContext(): void {
    const membership = this.ctx.currentMembership;
    const session = this.ctx.session;

    if (!membership) {
      this.sessionContext = null;
      return;
    }

    const nextContext = {
      organizationName: membership.organization.name,
      userLabel: session?.user?.display_name || session?.user?.email || "Utilisateur",
      roleLabel: SAFE_ROLE_LABELS[membership.membership.role_code] ?? membership.membership.role_code,
    };

    if (
      this.sessionContext
      && this.sessionContext.organizationName === nextContext.organizationName
      && this.sessionContext.userLabel === nextContext.userLabel
      && this.sessionContext.roleLabel === nextContext.roleLabel
    ) {
      return;
    }

    this.sessionContext = nextContext;
  }

  private syncOrganizationSwitcher(): void {
    const memberships = this.ctx.session?.memberships ?? [];

    if (memberships.length <= 1) {
      this.organizationSwitcher = null;
      return;
    }

    const nextSwitcher = {
      selectedOrganizationId: this.ctx.selectedOrganizationId ?? memberships[0]?.organization.id ?? "",
      items: memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
      })),
    };

    if (
      this.organizationSwitcher
      && this.organizationSwitcher.selectedOrganizationId === nextSwitcher.selectedOrganizationId
      && this.organizationSwitcher.items.length === nextSwitcher.items.length
      && this.organizationSwitcher.items.every(
        (item, index) =>
          item.id === nextSwitcher.items[index]?.id
          && item.name === nextSwitcher.items[index]?.name,
      )
    ) {
      return;
    }

    this.organizationSwitcher = nextSwitcher;
  }

  private syncRouteState(): void {
    const currentUrl = this.router.url || "/app/home";
    this.currentPath = currentUrl.split("#")[0]?.split("?")[0] || "/app/home";
  }

  private syncLocalNavigationItems(): void {
    const nextItems: DesktopShellNavItem[] = [];

    if (this.currentPath.startsWith("/app/facturation")) {
      nextItems.push(
        { id: "billing-home", label: "Aperçu", route: "/app/facturation", supportLabel: "Aperçu" },
        { id: "billing-customers", label: "Clients", route: "/app/facturation/clients", supportLabel: "Clients" },
        { id: "billing-quotes", label: "Devis", route: "/app/facturation/devis", supportLabel: "Devis" },
        { id: "billing-invoices", label: "Factures", route: "/app/facturation/factures", supportLabel: "Factures" },
        { id: "billing-followups", label: "Relances", route: "/app/facturation/relances", supportLabel: "Relances" },
        { id: "billing-exports", label: "Exports", route: "/app/facturation/exports", supportLabel: "Exports" },
      );
    }

    if (!this.areNavListsEqual(this.localNavItems, nextItems)) {
      this.localNavItems = nextItems;
    }
  }

  private syncActiveViewCopy(): void {
    if (this.currentPath === "/app/home") {
      this.activeViewEyebrow = "Tableau de bord";
      this.activeViewLabel = "Pilotage global";
      this.activeViewSupportLabel = "Repères du jour, recherche transversale et ouverture directe du bon module.";
      return;
    }

    if (this.currentPath === "/app/chantiers/liste") {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Registre chantier";
      this.activeViewSupportLabel = "Lecture d’ensemble, prochaine action et ouverture du bon chantier.";
      return;
    }

    if (this.currentPath === "/app/chantiers/parc") {
      this.activeViewEyebrow = "Parc équipement";
      this.activeViewLabel = "Parc connu";
      this.activeViewSupportLabel = "Matériel affecté, disponible ou à surveiller.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/apercu$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Aperçu chantier";
      this.activeViewSupportLabel = "Vue d’ensemble chantier, repères métier et prochaines étapes.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/coordination$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Coordination";
      this.activeViewSupportLabel = "Équipe, intervention à venir et action de coordination.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/dossier$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Dossier chantier";
      this.activeViewSupportLabel = "Préparation de remise, contenu disponible et clôture.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/documents$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Documents";
      this.activeViewLabel = "Documents chantier";
      this.activeViewSupportLabel = "Pièces à traiter, registre documentaire et suivi utile.";
      return;
    }

    if (this.currentPath.startsWith("/app/documents")) {
      this.activeViewEyebrow = "Documents";
      this.activeViewLabel = "Workspace documentaire";
      this.activeViewSupportLabel = "Pièces à traiter, dossiers utiles et registre transverse entre chantier, conformité et commercial.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/preuves$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Preuves chantier";
      this.activeViewSupportLabel = "Justificatifs, synchronisation et repères de terrain.";
      return;
    }

    if (/\/app\/chantiers\/[^/]+\/equipements$/.test(this.currentPath)) {
      this.activeViewEyebrow = "Chantiers";
      this.activeViewLabel = "Équipements chantier";
      this.activeViewSupportLabel = "Affectation matériel, état et suivi opérationnel.";
      return;
    }

    if (this.currentPath.startsWith("/app/facturation/devis")) {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Devis";
      this.activeViewSupportLabel = "Préparer, envoyer, relancer et convertir.";
      return;
    }

    if (this.currentPath.startsWith("/app/facturation/factures")) {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Factures";
      this.activeViewSupportLabel = "Émettre, encaisser et suivre le reste dû.";
      return;
    }

    if (this.currentPath.startsWith("/app/facturation/relances")) {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Relances";
      this.activeViewSupportLabel = "Actions de suivi et retour vers le bon élément métier.";
      return;
    }

    if (this.currentPath.startsWith("/app/facturation/exports")) {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Exports commerciaux";
      this.activeViewSupportLabel = "Dossier commercial, pièces exportables et remise.";
      return;
    }

    if (this.currentPath === "/app/facturation") {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Gestion de facturation";
      this.activeViewSupportLabel = "Registre central, signaux financiers et aperçu facture dans un seul workspace.";
      return;
    }

    if (this.currentPath.startsWith("/app/facturation")) {
      this.activeViewEyebrow = "Facturation";
      this.activeViewLabel = "Clients";
      this.activeViewSupportLabel = "Base clients et continuité commerciale.";
      return;
    }

    if (this.currentPath.startsWith("/app/reglementation/obligations")) {
      this.activeViewEyebrow = "Réglementation";
      this.activeViewLabel = "Obligations";
      this.activeViewSupportLabel = "Lecture des exigences, priorités et conformité associée.";
      return;
    }

    if (this.currentPath.startsWith("/app/reglementation/preuves")) {
      this.activeViewEyebrow = "Réglementation";
      this.activeViewLabel = "Preuves réglementaires";
      this.activeViewSupportLabel = "Pièces liées aux obligations et repères de conformité.";
      return;
    }

    if (this.currentPath.startsWith("/app/reglementation/sites")) {
      this.activeViewEyebrow = "Réglementation";
      this.activeViewLabel = "Sites";
      this.activeViewSupportLabel = "Repères de site, enrichissement et statut utile.";
      return;
    }

    if (this.currentPath.startsWith("/app/reglementation/exports")) {
      this.activeViewEyebrow = "Réglementation";
      this.activeViewLabel = "Exports réglementaires";
      this.activeViewSupportLabel = "Dossier réglementaire, pièces remises et manques éventuels.";
      return;
    }

    if (this.currentPath.startsWith("/app/reglementation")) {
      this.activeViewEyebrow = "Réglementation";
      this.activeViewLabel = "Synthèse réglementaire";
      this.activeViewSupportLabel = "Niveau de conformité, priorités et ouverture rapide des bonnes zones.";
      return;
    }

    if (this.currentPath.startsWith("/app/administration/equipes")) {
      this.activeViewEyebrow = "Équipe";
      this.activeViewLabel = "Utilisateurs & équipes";
      this.activeViewSupportLabel = "Affectations, rôles et lecture organisationnelle.";
      return;
    }

    if (this.currentPath.startsWith("/app/administration")) {
      this.activeViewEyebrow = "Administration";
      this.activeViewLabel = "Organisation & accès";
      this.activeViewSupportLabel = "Paramètres d’organisation, rôles et modules actifs.";
      return;
    }

    this.activeViewEyebrow = "Conforméo";
    this.activeViewLabel = "Navigation";
    this.activeViewSupportLabel = "Repérage global, recherche et ouverture directe.";
  }

  private areNavListsEqual(left: DesktopShellNavItem[], right: DesktopShellNavItem[]): boolean {
    return left.length === right.length
      && left.every(
        (item, index) =>
          item.id === right[index]?.id
          && item.label === right[index]?.label
          && item.route === right[index]?.route
          && item.supportLabel === right[index]?.supportLabel,
      );
  }

  private canAccessAdministration(): boolean {
    return canAccessAdministration(this.ctx.currentMembership);
  }

  private canReadModule(moduleCode: "chantier" | "facturation" | "reglementation"): boolean {
    return canReadModule(this.ctx.currentMembership, moduleCode);
  }
}
