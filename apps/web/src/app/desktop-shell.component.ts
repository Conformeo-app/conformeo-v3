import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import type { CfmTone } from "@conformeo/ui";
import { CfmButtonComponent, CfmStatusChipComponent } from "@conformeo/ui";

import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";

@Component({
  selector: "cfm-desktop-shell",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CfmButtonComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <main class="shell shell-workspace">
      <section class="workspace app-shell">
        <header class="app-shell-minimal-header">
          <div class="app-shell-minimal-copy">
            <p class="app-shell-minimal-eyebrow">Conformeo Desktop</p>
            <h1>Espace bureau</h1>
          </div>
        </header>

        <section class="app-shell-session-context" *ngIf="sessionContext as context">
          <div class="app-shell-session-copy">
            <p class="app-shell-session-organization">{{ context.organizationName }}</p>
            <p class="app-shell-session-meta">{{ context.userLabel }} · {{ context.roleLabel }}</p>
          </div>

          <div class="app-shell-session-side">
            <label class="app-shell-organization-switch" *ngIf="organizationSwitcher as switcher">
              <span>Organisation</span>
              <select
                [value]="switcher.selectedOrganizationId"
                (change)="onOrganizationChange(($any($event.target).value ?? '').toString())"
              >
                <option *ngFor="let item of switcher.items" [value]="item.id">
                  {{ item.name }}
                </option>
              </select>
            </label>

            <div class="app-shell-session-modules">
              <cfm-status-chip
                *ngFor="let module of context.modules"
                [label]="module.label"
                [tone]="module.tone"
              />
            </div>

            <cfm-button
              type="button"
              variant="secondary"
              size="sm"
              (click)="ctx.logout()"
            >
              Se déconnecter
            </cfm-button>
          </div>
        </section>

        <nav class="app-shell-minimal-nav">
          <a
            *ngFor="let item of navigationItems"
            class="app-shell-minimal-nav-link"
            [routerLink]="item.route"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <cfm-status-chip [label]="item.label" [tone]="item.tone" />
          </a>
        </nav>

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

        <section class="workspace-body app-shell-minimal-body">
          <router-outlet />
        </section>
      </section>
    </main>
  `,
  styles: [
    `
      .app-shell-minimal-header {
        display: flex;
        align-items: center;
        min-height: 4.5rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(23, 49, 43, 0.08);
      }

      .app-shell-minimal-copy {
        display: grid;
        gap: 0.15rem;
      }

      .app-shell-minimal-eyebrow {
        margin: 0;
        font-size: 0.78rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #5b6f69;
      }

      .app-shell-minimal-copy h1 {
        margin: 0;
        font-size: 1.1rem;
        line-height: 1.2;
        color: #17312b;
      }

      .app-shell-session-context {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.9rem;
        padding: 0.95rem 1.25rem 0;
      }

      .app-shell-session-copy {
        display: grid;
        gap: 0.2rem;
        min-width: 0;
      }

      .app-shell-session-organization,
      .app-shell-session-meta {
        margin: 0;
      }

      .app-shell-session-organization {
        font-weight: 650;
        color: #17312b;
      }

      .app-shell-session-meta {
        color: #5b6f69;
      }

      .app-shell-session-modules {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.45rem;
      }

      .app-shell-session-side {
        display: grid;
        justify-items: end;
        gap: 0.55rem;
      }

      .app-shell-organization-switch {
        display: grid;
        gap: 0.3rem;
        justify-items: start;
      }

      .app-shell-organization-switch span {
        font-size: 0.78rem;
        color: #5b6f69;
      }

      .app-shell-organization-switch select {
        min-width: 13rem;
        padding: 0.5rem 0.7rem;
        border: 1px solid rgba(23, 49, 43, 0.14);
        border-radius: 10px;
        background: #fff;
        color: #17312b;
      }

      .app-shell-minimal-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        padding: 0.9rem 1.25rem 0;
      }

      .app-shell-minimal-nav-link {
        text-decoration: none;
      }

      .app-shell-minimal-nav-link.is-active {
        opacity: 1;
      }

      .workspace-feedback-stack {
        display: grid;
        gap: 0.65rem;
        padding: 0.9rem 1.25rem 0;
      }

      .feedback {
        display: grid;
        gap: 0.2rem;
        padding: 0.85rem 1rem;
        border-radius: 14px;
      }

      .feedback-title,
      .feedback-body {
        margin: 0;
      }

      .feedback-title {
        font-weight: 650;
      }

      .feedback.error {
        background: rgba(177, 55, 55, 0.08);
        color: #7f1d1d;
      }

      .feedback.progress {
        background: rgba(35, 83, 142, 0.08);
        color: #1d4f7a;
      }

      .feedback.success {
        background: rgba(39, 103, 73, 0.08);
        color: #1f5a3d;
      }

      .app-shell-minimal-body {
        padding-top: 1rem;
      }
    `,
  ],
})
export class DesktopShellComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);
  private readonly router = inject(Router);
  navigationItems: Array<{ route: string; label: string; tone: CfmTone }> = [];
  sessionContext: {
    organizationName: string;
    userLabel: string;
    roleLabel: string;
    modules: Array<{ label: string; tone: CfmTone }>;
  } | null = null;
  organizationSwitcher: {
    selectedOrganizationId: string;
    items: Array<{ id: string; name: string }>;
  } | null = null;

  constructor() {
    this.syncNavigationItems();
    this.syncSessionContext();
    this.syncOrganizationSwitcher();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncNavigationItems();
        this.syncSessionContext();
        this.syncOrganizationSwitcher();
      }
    });
  }

  private syncNavigationItems(): void {
    const nextItems = this.ctx.desktopNavigationItems.map((item) => ({ ...item }));

    if (this.navigationItems.length === nextItems.length
      && this.navigationItems.every(
        (item, index) =>
          item.route === nextItems[index]?.route
          && item.label === nextItems[index]?.label
          && item.tone === nextItems[index]?.tone
      )) {
      return;
    }

    this.navigationItems = nextItems;
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
      roleLabel: membership.membership.role_code,
      modules: membership.enabled_modules.length > 0
        ? membership.enabled_modules.map((moduleCode) => ({
            label: this.ctx.getModuleNavigationLabel(moduleCode),
            tone: "success" as CfmTone,
          }))
        : [{ label: "Aucun module actif", tone: "neutral" as CfmTone }],
    };

    if (
      this.sessionContext
      && this.sessionContext.organizationName === nextContext.organizationName
      && this.sessionContext.userLabel === nextContext.userLabel
      && this.sessionContext.roleLabel === nextContext.roleLabel
      && this.sessionContext.modules.length === nextContext.modules.length
      && this.sessionContext.modules.every(
        (module, index) =>
          module.label === nextContext.modules[index]?.label
          && module.tone === nextContext.modules[index]?.tone
      )
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
          && item.name === nextSwitcher.items[index]?.name
      )
    ) {
      return;
    }

    this.organizationSwitcher = nextSwitcher;
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
      this.syncNavigationItems();
      this.syncSessionContext();
      this.syncOrganizationSwitcher();
    });
  }
}
