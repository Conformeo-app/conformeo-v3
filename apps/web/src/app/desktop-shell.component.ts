import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmStatusChipComponent,
} from "@conformeo/ui";

import { DESKTOP_SHELL_CONTEXT } from "./desktop-shell-context";

@Component({
  selector: "cfm-desktop-shell",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CfmButtonComponent,
    CfmCardComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <main class="shell shell-workspace">
      <section class="workspace app-shell">
        <cfm-card
          class="desktop-card app-shell-header-card"
          eyebrow="Conformeo Desktop"
          [title]="ctx.currentMembership?.organization?.name ?? 'Conforméo'"
          description="Une navigation bureau plus claire pour passer du cockpit aux modules sans rester dans une page unique scrollée."
        >
          <div class="session-header" *ngIf="ctx.currentMembership as membership">
            <div class="workspace-shell-copy">
              <p class="meta">Connecté en tant que {{ ctx.session?.user?.display_name }}</p>
              <h2>{{ membership.organization.name }}</h2>
              <p class="small">
                Rôle actuel : <strong>{{ membership.membership.role_code }}</strong>
              </p>
              <div class="chips">
                <cfm-status-chip
                  *ngFor="let moduleCode of membership.enabled_modules"
                  [label]="ctx.getModuleNavigationLabel(moduleCode)"
                  tone="success"
                />
                <cfm-status-chip
                  *ngIf="membership.enabled_modules.length === 0"
                  label="Aucun module actif"
                  tone="neutral"
                />
              </div>
            </div>

            <div class="session-actions workspace-shell-actions">
              <ng-container *ngIf="ctx.session && ctx.session.memberships.length > 1">
                <label class="organization-switch">
                  <span>Organisation</span>
                  <select
                    [(ngModel)]="ctx.selectedOrganizationId"
                    name="organizationId"
                    (change)="ctx.changeOrganization()"
                  >
                    <option *ngFor="let item of ctx.session.memberships" [value]="item.organization.id">
                      {{ item.organization.name }}
                    </option>
                  </select>
                </label>
              </ng-container>
            </div>
          </div>
        </cfm-card>

        <div class="session-actions workspace-shell-actions">
          <cfm-button type="button" variant="secondary" (click)="ctx.logout()">
            Se déconnecter
          </cfm-button>
        </div>

        <nav class="app-nav">
          <a
            *ngFor="let item of navDebugItems"
            class="app-nav-link"
            [routerLink]="item.route"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span class="nav-icon-placeholder" aria-hidden="true">icon</span>
            <cfm-status-chip [label]="item.label" [tone]="item.tone" />
          </a>
        </nav>

        <section class="workspace-body">
          <router-outlet />
        </section>

        <p class="feedback error" *ngIf="ctx.errorMessage">{{ ctx.errorMessage }}</p>
        <p class="feedback progress" *ngIf="ctx.isWorkspaceRefreshing && !ctx.errorMessage">
          Actualisation en cours. Les données restent visibles.
        </p>
        <p class="feedback success" *ngIf="ctx.feedbackMessage && !ctx.errorMessage">{{ ctx.feedbackMessage }}</p>
      </section>
    </main>
  `,
})
export class DesktopShellComponent {
  readonly ctx = inject(DESKTOP_SHELL_CONTEXT);
  readonly navDebugItems = [
    { route: "/app/home", label: "Cockpit", tone: "calm" as const },
    { route: "/app/reglementation", label: "Réglementation", tone: "progress" as const },
  ];
}
