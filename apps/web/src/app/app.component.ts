import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { AuthSession, MembershipAccess, ModuleCode } from "@conformeo/contracts";
import {
  CfmButtonComponent,
  CfmCardComponent,
  CfmEmptyStateComponent,
  CfmInputComponent,
  CfmStatusChipComponent
} from "@conformeo/ui";

import {
  clearSession,
  fetchSession,
  getStoredAccessToken,
  getStoredOrganizationId,
  login,
  persistSession,
  updateOrganizationModule
} from "./auth-client";

@Component({
  selector: "cfm-root",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
    CfmInputComponent,
    CfmStatusChipComponent
  ],
  template: `
    <main class="shell">
      <cfm-card
        class="desktop-card"
        eyebrow="Conformeo Desktop"
        title="Authentification et administration Sprint 0"
        description="Cette surface Angular prépare l’accès bureau : connexion, contexte multi-organisation et gestion minimale des modules activés."
      >
        <form class="auth-form" (ngSubmit)="submitLogin()" *ngIf="!session; else sessionTemplate">
          <cfm-input
            [(ngModel)]="email"
            name="email"
            type="email"
            autocomplete="username"
            label="Email"
            placeholder="prenom.nom@entreprise.fr"
            required
          />

          <cfm-input
            [(ngModel)]="password"
            name="password"
            type="password"
            autocomplete="current-password"
            label="Mot de passe"
            placeholder="Mot de passe"
            required
          />

          <cfm-button type="submit" [disabled]="loading" [block]="true">
            {{ loading ? "Connexion..." : "Se connecter" }}
          </cfm-button>
        </form>

        <ng-template #sessionTemplate>
          <div class="session-header" *ngIf="currentMembership as membership">
            <div>
              <p class="meta">Connecté en tant que {{ session?.user?.display_name }}</p>
              <h2>{{ membership.organization.name }}</h2>
              <p class="small">
                Rôle actuel : <strong>{{ membership.membership.role_code }}</strong>
              </p>
            </div>

            <div class="session-actions">
              <label class="organization-switch" *ngIf="session && session.memberships.length > 1">
                <span>Organisation</span>
                <select [(ngModel)]="selectedOrganizationId" name="organizationId" (change)="changeOrganization()">
                  <option *ngFor="let item of session.memberships" [value]="item.organization.id">
                    {{ item.organization.name }}
                  </option>
                </select>
              </label>

              <cfm-button type="button" variant="secondary" (click)="logout()">
                Se déconnecter
              </cfm-button>
            </div>
          </div>

          <div class="grid" *ngIf="currentMembership as membership">
            <article>
              <h3>Permissions</h3>
              <div class="chips">
                <cfm-status-chip
                  *ngFor="let permission of membership.permissions"
                  [label]="permission"
                  tone="calm"
                />
              </div>
            </article>

            <article>
              <h3>Organisations liées</h3>
              <ul class="stack-list">
                <li *ngFor="let item of session?.memberships">
                  <div class="list-copy">
                    <strong>{{ item.organization.name }}</strong>
                    <span>{{ item.membership.role_code }}</span>
                  </div>
                  <cfm-status-chip
                    [label]="item.membership.is_default ? 'Courante' : 'Liée'"
                    [tone]="item.membership.is_default ? 'success' : 'neutral'"
                  />
                </li>
              </ul>
            </article>
          </div>

          <section class="modules" *ngIf="currentMembership as membership">
            <div class="modules-header">
              <div>
                <h3>Modules de l'organisation</h3>
                <p>
                  Les rôles <code>owner</code> et <code>admin</code> peuvent activer ou désactiver les
                  modules Sprint 0.
                </p>
              </div>
            </div>

            <ul class="module-list" *ngIf="membership.modules.length > 0; else emptyModules">
              <li *ngFor="let module of membership.modules">
                <div class="module-copy">
                  <strong>{{ module.module_code }}</strong>
                  <cfm-status-chip
                    [label]="module.is_enabled ? 'Activé' : 'Désactivé'"
                    [tone]="module.is_enabled ? 'success' : 'neutral'"
                  />
                </div>

                <label class="toggle">
                  <input
                    type="checkbox"
                    [checked]="module.is_enabled"
                    [disabled]="loading || !canManageModules"
                    (change)="toggleModule(module.module_code, $any($event.target).checked)"
                  />
                  <span>{{ module.is_enabled ? "On" : "Off" }}</span>
                </label>
              </li>
            </ul>

            <ng-template #emptyModules>
              <cfm-empty-state
                title="Aucun module configuré"
                description="Cette organisation n’a encore aucun module activable dans le socle Sprint 0."
              />
            </ng-template>
          </section>
        </ng-template>

        <p class="feedback error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <p class="feedback info" *ngIf="session && !errorMessage">
          API utilisée: <code>http://localhost:8000</code>
        </p>
      </cfm-card>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 2rem;
      }

      .desktop-card {
        width: min(880px, 100%);
      }

      .auth-form,
      .modules,
      .session-header,
      .session-actions,
      .organization-switch {
        display: grid;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        font-size: 1.7rem;
        color: var(--cfm-color-ink);
      }

      .auth-form {
        gap: 1rem;
      }

      .meta,
      .small,
      .modules p,
      .feedback,
      .organization-switch span {
        color: var(--cfm-color-copy-muted);
      }

      .organization-switch {
        gap: 0.35rem;
        width: min(280px, 100%);
      }

      .organization-switch span {
        display: block;
        font-size: 0.9rem;
      }

      select {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--cfm-color-border);
        border-radius: var(--cfm-radius-field);
        padding: 0.85rem 1rem;
        font: inherit;
        background: var(--cfm-color-surface);
      }

      .session-header {
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
        align-items: start;
      }

      .session-actions {
        gap: 1rem;
        justify-items: end;
      }

      .meta,
      .small {
        margin-top: 0.45rem;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      article {
        padding: 1.25rem;
        border-radius: 20px;
        background: #f4f1ea;
      }

      h3 {
        font-size: 1rem;
        margin-bottom: 0.75rem;
        color: var(--cfm-color-ink);
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .stack-list,
      .module-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .stack-list {
        display: grid;
        gap: 0.75rem;
      }

      .stack-list li,
      .module-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .list-copy,
      .module-copy {
        display: grid;
        gap: 0.2rem;
      }

      .list-copy span {
        color: var(--cfm-color-copy-muted);
      }

      .modules {
        gap: 1rem;
        padding: 1.5rem;
        border-radius: 24px;
        background: #eff4f5;
      }

      .modules-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
      }

      .module-list {
        display: grid;
        gap: 0.9rem;
      }

      .toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
      }

      .toggle input {
        width: auto;
      }

      .feedback.error {
        color: #8a2d2d;
      }

      code {
        font-family: "SFMono-Regular", "Menlo", monospace;
        font-size: 0.92em;
      }
    `
  ]
})
export class AppComponent {
  email = "";
  password = "";
  loading = false;
  errorMessage = "";
  session: AuthSession | null = null;
  accessToken = getStoredAccessToken();
  selectedOrganizationId = getStoredOrganizationId();

  constructor() {
    if (this.accessToken) {
      void this.refreshSession(this.selectedOrganizationId);
    }
  }

  get currentMembership(): MembershipAccess | null {
    return this.session?.current_membership ?? null;
  }

  get canManageModules(): boolean {
    return this.currentMembership?.permissions.includes("modules:manage") ?? false;
  }

  async submitLogin(): Promise<void> {
    this.loading = true;
    this.errorMessage = "";

    try {
      const response = await login({
        email: this.email,
        password: this.password
      });
      this.accessToken = response.access_token;
      this.session = response.session;
      this.selectedOrganizationId = response.session.current_membership.organization.id;
      persistSession(response.access_token, response.session);
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  async changeOrganization(): Promise<void> {
    await this.refreshSession(this.selectedOrganizationId);
  }

  async toggleModule(moduleCode: ModuleCode, nextValue: boolean): Promise<void> {
    if (!this.accessToken || !this.selectedOrganizationId || !this.canManageModules) {
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    try {
      await updateOrganizationModule(this.accessToken, this.selectedOrganizationId, moduleCode, nextValue);
      await this.refreshSession(this.selectedOrganizationId);
    } catch (error) {
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  logout(): void {
    clearSession();
    this.accessToken = null;
    this.selectedOrganizationId = null;
    this.session = null;
    this.errorMessage = "";
  }

  private async refreshSession(organizationId?: string | null): Promise<void> {
    if (!this.accessToken) {
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    try {
      const session = await fetchSession(this.accessToken, organizationId);
      this.session = session;
      this.selectedOrganizationId = session.current_membership.organization.id;
      persistSession(this.accessToken, session);
    } catch (error) {
      this.logout();
      this.errorMessage = this.toErrorMessage(error);
    } finally {
      this.loading = false;
    }
  }

  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
  }
}
