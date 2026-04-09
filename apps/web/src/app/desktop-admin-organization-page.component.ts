import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";

import { DESKTOP_ADMIN_PAGE_CONTEXT } from "./desktop-admin-page-context";

@Component({
  selector: "cfm-desktop-admin-organization-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <section class="admin-page" *ngIf="ctx.canReadOrganization; else lockedState">
      <section class="admin-stage">
        <article class="admin-panel">
          <div class="panel-head">
            <div>
              <h3>Paramétrage de base</h3>
              <p>Nom, coordonnées utiles et repères simples de l'organisation.</p>
            </div>
            <div class="panel-head-chips">
              <cfm-status-chip
                [label]="ctx.organization ? 'Organisation visible' : 'Chargement'"
                [tone]="ctx.organization ? 'success' : 'progress'"
              />
              <cfm-status-chip
                *ngIf="ctx.isAdministrationReadOnly"
                label="Lecture seule"
                tone="neutral"
              />
            </div>
          </div>

          <div class="compact-note" *ngIf="ctx.isAdministrationReadOnly">
            <strong>Lecture seule</strong>
            <span>Le paramétrage est visible, mais seuls owner et admin peuvent le modifier.</span>
          </div>

          <form class="form-grid" [formGroup]="form" (ngSubmit)="save()">
            <label class="field">
              <span class="small">Nom de l'entreprise</span>
              <input type="text" formControlName="name" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field">
              <span class="small">Raison sociale</span>
              <input type="text" formControlName="legalName" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field">
              <span class="small">Activité</span>
              <input type="text" formControlName="activityLabel" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field">
              <span class="small">Email principal</span>
              <input type="email" formControlName="contactEmail" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field">
              <span class="small">Téléphone principal</span>
              <input type="text" formControlName="contactPhone" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field">
              <span class="small">Effectif</span>
              <input type="number" min="0" formControlName="employeeCount" [readonly]="!ctx.canEditOrganizationSettings" />
            </label>

            <label class="field field--full">
              <span class="small">Adresse siège</span>
              <textarea formControlName="headquartersAddress" rows="3" [readonly]="!ctx.canEditOrganizationSettings"></textarea>
            </label>

            <label class="field field--full">
              <span class="small">Notes utiles</span>
              <textarea formControlName="notes" rows="4" [readonly]="!ctx.canEditOrganizationSettings"></textarea>
            </label>

            <div class="form-actions">
              <cfm-button type="submit" [disabled]="form.invalid || ctx.savingProfile || !ctx.canEditOrganizationSettings">
                {{ ctx.savingProfile ? "Enregistrement..." : "Enregistrer" }}
              </cfm-button>
            </div>
          </form>
        </article>

        <aside class="admin-rail">
          <article class="admin-panel">
            <div class="panel-head">
              <div>
                <h3>Modules activés</h3>
                <p>Activer ou désactiver chaque module sans ouvrir une autre zone.</p>
              </div>
              <cfm-status-chip
                [label]="ctx.enabledModuleCount + ' actifs'"
                [tone]="ctx.enabledModuleCount > 0 ? 'progress' : 'warning'"
              />
            </div>

            <ul class="stack-list">
              <li class="module-line" *ngFor="let module of ctx.organizationModules">
                <div class="module-copy">
                  <strong>{{ getModuleLabel(module.module_code) }}</strong>
                  <span>{{ module.is_enabled ? "Visible dans l'interface" : "Masqué pour l'organisation" }}</span>
                </div>

                <div class="module-actions">
                  <cfm-status-chip
                    [label]="module.is_enabled ? 'Activé' : 'Désactivé'"
                    [tone]="module.is_enabled ? 'success' : 'warning'"
                  />
                  <cfm-button
                    *ngIf="ctx.canManageModules"
                    type="button"
                    size="sm"
                    variant="secondary"
                    [disabled]="ctx.savingModuleCode === module.module_code"
                    (click)="toggleModule(module.module_code, !module.is_enabled)"
                  >
                    {{
                      ctx.savingModuleCode === module.module_code
                        ? "Mise à jour..."
                        : module.is_enabled
                          ? "Désactiver"
                          : "Activer"
                    }}
                  </cfm-button>
                </div>
              </li>
            </ul>
          </article>

          <article class="admin-panel">
            <div class="panel-head">
              <div>
                <h3>Rôles v1</h3>
                <p>Un modèle simple, lisible et extensible.</p>
              </div>
            </div>

            <ul class="role-grid">
              <li class="role-card" *ngFor="let role of ctx.roleOptions">
                <div class="role-card-copy">
                  <strong>{{ role.label }}</strong>
                  <span>{{ role.summary }}</span>
                </div>
              </li>
            </ul>
          </article>
        </aside>
      </section>
    </section>

    <ng-template #lockedState>
      <cfm-empty-state
        title="Administration indisponible"
        description="Votre accès actuel ne permet pas de consulter le paramétrage de l'organisation."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .admin-page,
      .admin-stage,
      .admin-rail,
      .admin-panel,
      .panel-head,
      .field,
      .module-copy,
      .role-card-copy {
        display: grid;
        gap: 0.45rem;
      }

      .admin-page {
        gap: 0.7rem;
      }

      .admin-stage {
        grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.95fr);
        gap: 0.7rem;
        align-items: start;
      }

      .admin-panel {
        padding: 0.9rem;
        border-radius: 16px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: var(--cfm-color-surface, #ffffff);
      }

      .panel-head {
        grid-template-columns: 1fr auto;
        align-items: start;
        margin-bottom: 0.35rem;
      }

      .panel-head h3,
      .role-card-copy strong {
        margin: 0;
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .panel-head-chips {
        display: flex;
        flex-wrap: wrap;
        justify-content: end;
        gap: 0.35rem;
      }

      .panel-head p,
      .module-copy span,
      .role-card-copy span {
        margin: 0;
        color: var(--cfm-color-copy-muted, #60758c);
        line-height: 1.4;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
      }

      .field--full,
      .form-actions {
        grid-column: 1 / -1;
      }

      .field input,
      .field textarea {
        width: 100%;
        min-width: 0;
        padding: 0.72rem 0.82rem;
        border-radius: 14px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: #fff;
        color: var(--cfm-color-ink, #1e2b3a);
        font: inherit;
      }

      .field textarea {
        resize: vertical;
      }

      .compact-note {
        display: grid;
        gap: 0.18rem;
        padding: 0.72rem 0.76rem;
        border-radius: 12px;
        background: var(--cfm-color-surface-muted, #eef4fb);
        border: 1px solid var(--cfm-color-border, #d4e0ee);
      }

      .compact-note strong {
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .compact-note span {
        color: var(--cfm-color-copy-muted, #60758c);
        line-height: 1.4;
      }

      .stack-list,
      .role-grid {
        display: grid;
        gap: 0.55rem;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .module-line {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.65rem;
        align-items: start;
        padding: 0.72rem 0.76rem;
        border-radius: 14px;
        background: var(--cfm-color-surface-muted, #eef4fb);
        border: 1px solid var(--cfm-color-border, #d4e0ee);
      }

      .module-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        justify-content: flex-end;
      }

      .role-card {
        padding: 0.72rem 0.76rem;
        border-radius: 14px;
        background: var(--cfm-color-surface-muted, #eef4fb);
        border: 1px solid var(--cfm-color-border, #d4e0ee);
      }

      @media (max-width: 1280px) {
        .admin-stage {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 820px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopAdminOrganizationPageComponent {
  readonly ctx = inject(DESKTOP_ADMIN_PAGE_CONTEXT);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    legalName: new FormControl("", { nonNullable: true }),
    activityLabel: new FormControl("", { nonNullable: true }),
    contactEmail: new FormControl("", { nonNullable: true }),
    contactPhone: new FormControl("", { nonNullable: true }),
    employeeCount: new FormControl<string>("", { nonNullable: true }),
    headquartersAddress: new FormControl("", { nonNullable: true }),
    notes: new FormControl("", { nonNullable: true }),
  });

  constructor() {
    this.ctx.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (!state.organization) {
          return;
        }

        this.form.patchValue({
          name: state.organization.name,
          legalName: state.organization.legal_name ?? "",
          activityLabel: state.organization.activity_label ?? "",
          contactEmail: state.organization.contact_email ?? "",
          contactPhone: state.organization.contact_phone ?? "",
          employeeCount: state.organization.employee_count !== null ? String(state.organization.employee_count) : "",
          headquartersAddress: state.organization.headquarters_address ?? "",
          notes: state.organization.notes ?? "",
        }, { emitEvent: false });
      });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    await this.ctx.saveOrganizationProfile({
      name: raw.name.trim(),
      legal_name: raw.legalName.trim() || null,
      activity_label: raw.activityLabel.trim() || null,
      contact_email: raw.contactEmail.trim() || null,
      contact_phone: raw.contactPhone.trim() || null,
      employee_count: raw.employeeCount.trim() ? Number(raw.employeeCount) : null,
      headquarters_address: raw.headquartersAddress.trim() || null,
      notes: raw.notes.trim() || null,
    });
  }

  async toggleModule(moduleCode: "reglementation" | "chantier" | "facturation", isEnabled: boolean): Promise<void> {
    await this.ctx.setModuleState(moduleCode, isEnabled);
  }

  getModuleLabel(moduleCode: "reglementation" | "chantier" | "facturation"): string {
    switch (moduleCode) {
      case "reglementation":
        return "Réglementation";
      case "chantier":
        return "Chantiers";
      case "facturation":
        return "Facturation";
    }
  }
}
