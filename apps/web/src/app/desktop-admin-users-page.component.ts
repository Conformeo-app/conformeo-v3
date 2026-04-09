import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import type { OrganizationMemberRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";

import { DESKTOP_ADMIN_PAGE_CONTEXT } from "./desktop-admin-page-context";

@Component({
  selector: "cfm-desktop-admin-users-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <section class="admin-page" *ngIf="ctx.canReadUsers; else lockedState">
      <section class="summary-chips">
        <cfm-status-chip [label]="ctx.memberCount + ' utilisateurs'" tone="progress" />
        <cfm-status-chip [label]="ctx.invitedMemberCount + ' invités'" [tone]="ctx.invitedMemberCount > 0 ? 'warning' : 'neutral'" />
        <cfm-status-chip [label]="ctx.disabledMemberCount + ' désactivés'" [tone]="ctx.disabledMemberCount > 0 ? 'warning' : 'neutral'" />
      </section>

      <section class="admin-stage">
        <section class="admin-panel admin-panel--main">
          <div class="panel-head">
            <div>
              <h3>Créer ou rattacher</h3>
              <p>Ajout simple par email avec rôle lisible dès l'entrée.</p>
            </div>
          </div>

          <div class="compact-note" *ngIf="ctx.isAdministrationReadOnly">
            <strong>Lecture seule</strong>
            <span>Les utilisateurs et leurs accès sont visibles, mais seuls owner et admin peuvent les gérer.</span>
          </div>

          <form class="create-form" [formGroup]="createForm" (ngSubmit)="createMember()" *ngIf="ctx.canManageUsers">
            <label class="field">
              <span class="small">Email</span>
              <input type="email" formControlName="email" />
            </label>

            <label class="field">
              <span class="small">Prénom</span>
              <input type="text" formControlName="firstName" />
            </label>

            <label class="field">
              <span class="small">Nom</span>
              <input type="text" formControlName="lastName" />
            </label>

            <label class="field">
              <span class="small">Téléphone</span>
              <input type="text" formControlName="phone" />
            </label>

            <label class="field field--full">
              <span class="small">Rôle</span>
              <select formControlName="roleCode">
                <option *ngFor="let role of ctx.roleOptions" [value]="role.value">
                  {{ role.label }} · {{ role.summary }}
                </option>
              </select>
            </label>

            <div class="form-actions">
              <cfm-button type="submit" [disabled]="createForm.invalid || ctx.savingMemberId === 'create'">
                {{ ctx.savingMemberId === 'create' ? "Ajout..." : "Ajouter l'utilisateur" }}
              </cfm-button>
            </div>
          </form>

          <div class="panel-head panel-head--spaced">
            <div>
              <h3>Utilisateurs</h3>
              <p>Lecture rapide des rôles, statuts et accès utiles.</p>
            </div>
          </div>

          <ul class="register-list" *ngIf="ctx.members.length > 0; else emptyMembers">
            <li *ngFor="let member of ctx.members" class="register-line">
              <button
                type="button"
                class="register-button"
                [class.is-active]="member.membership.id === selectedMembershipId"
                (click)="selectMember(member.membership.id)"
              >
                <div class="register-copy">
                  <strong>{{ member.user.display_name }}</strong>
                  <span>{{ member.user.email }}</span>
                  <span class="small">{{ member.access_overview }}</span>
                </div>

                <div class="register-meta">
                  <cfm-status-chip [label]="member.role_label" tone="progress" />
                  <cfm-status-chip [label]="ctx.getUserStatusLabel(member.user.status)" [tone]="ctx.getUserStatusTone(member.user.status)" />
                </div>
              </button>
            </li>
          </ul>
        </section>

        <aside class="admin-panel admin-rail">
          <ng-container *ngIf="selectedMember as member; else emptyDetail">
            <div class="panel-head">
              <div>
                <h3>Détail utilisateur</h3>
                <p>Rôle, statut et accès effectifs par module.</p>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-head">
                <div>
                  <strong>{{ member.user.display_name }}</strong>
                  <span>{{ member.user.email }}</span>
                </div>
                <cfm-status-chip [label]="member.role_label" tone="progress" />
              </div>

              <form class="detail-form" [formGroup]="detailForm" (ngSubmit)="saveMember()">
                <label class="field">
                  <span class="small">Rôle</span>
                  <select formControlName="roleCode" [disabled]="!ctx.canManageUsers">
                    <option *ngFor="let role of ctx.roleOptions" [value]="role.value">
                      {{ role.label }}
                    </option>
                  </select>
                </label>

                <label class="field">
                  <span class="small">Statut</span>
                  <select formControlName="userStatus" [disabled]="!ctx.canManageUsers">
                    <option value="invited">Invité</option>
                    <option value="active">Actif</option>
                    <option value="disabled">Désactivé</option>
                  </select>
                </label>

                <div class="detail-inline">
                  <strong>Équipes</strong>
                  <span>{{ member.team_names.length > 0 ? member.team_names.join(" · ") : "Aucune équipe" }}</span>
                </div>

                <div class="detail-inline">
                  <strong>Accès v1</strong>
                  <span>{{ member.role_summary }}</span>
                </div>

                <div class="access-grid">
                  <article class="access-card" *ngFor="let access of member.module_access">
                    <strong>{{ access.module_label }}</strong>
                    <span>{{ access.access_label }}</span>
                    <cfm-status-chip [label]="access.access_label" [tone]="ctx.getModuleAccessTone(access.access_level)" />
                  </article>
                </div>

                <div class="form-actions">
                  <cfm-button
                    type="submit"
                    [disabled]="!ctx.canManageUsers || ctx.savingMemberId === member.membership.id"
                  >
                    {{ ctx.savingMemberId === member.membership.id ? "Enregistrement..." : "Enregistrer" }}
                  </cfm-button>
                </div>

                <div class="compact-note" *ngIf="ctx.isAdministrationReadOnly">
                  <strong>Lecture seule</strong>
                  <span>Le rôle, le statut et les accès par module restent consultables sans action possible.</span>
                </div>
              </form>
            </div>
          </ng-container>
        </aside>
      </section>
    </section>

    <ng-template #emptyMembers>
      <div class="empty-inline">
        <strong>Aucun utilisateur rattaché</strong>
        <p>Ajoutez un premier utilisateur pour structurer les accès.</p>
      </div>
    </ng-template>

    <ng-template #emptyDetail>
      <cfm-empty-state
        title="Aucun utilisateur sélectionné"
        description="Choisissez un utilisateur dans la liste pour voir son rôle et ses accès."
      />
    </ng-template>

    <ng-template #lockedState>
      <cfm-empty-state
        title="Utilisateurs indisponibles"
        description="Votre accès actuel ne permet pas de consulter les utilisateurs de l'organisation."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .admin-page,
      .summary-chips,
      .admin-stage,
      .register-list,
      .detail-card,
      .create-form,
      .detail-form,
      .access-grid,
      .register-copy,
      .detail-head,
      .detail-inline,
      .field,
      .panel-head,
      .empty-inline {
        display: grid;
        gap: 0.5rem;
      }

      .summary-chips {
        display: flex;
        flex-wrap: wrap;
      }

      .admin-stage {
        grid-template-columns: minmax(0, 1.08fr) minmax(18rem, 0.92fr);
        align-items: start;
      }

      .admin-panel {
        min-width: 0;
        padding: 0.9rem;
        border-radius: 16px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: var(--cfm-color-surface, #ffffff);
      }

      .panel-head--spaced {
        margin-top: 0.35rem;
      }

      .panel-head h3,
      .detail-head strong,
      .register-copy strong {
        margin: 0;
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .panel-head p,
      .register-copy span,
      .detail-head span,
      .detail-inline span,
      .empty-inline p {
        margin: 0;
        color: var(--cfm-color-copy-muted, #60758c);
        line-height: 1.4;
      }

      .create-form {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .field--full,
      .form-actions {
        grid-column: 1 / -1;
      }

      .field input,
      .field select {
        width: 100%;
        min-width: 0;
        padding: 0.72rem 0.82rem;
        border-radius: 14px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: #fff;
        color: var(--cfm-color-ink, #1e2b3a);
        font: inherit;
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
        margin: 0;
        color: var(--cfm-color-copy-muted, #60758c);
        line-height: 1.4;
      }

      .register-list {
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .register-button {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.7rem;
        align-items: start;
        text-align: left;
        padding: 0.78rem 0.82rem;
        border-radius: 14px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: var(--cfm-color-surface-muted, #eef4fb);
        cursor: pointer;
      }

      .register-button.is-active {
        background: var(--cfm-color-primary-soft, #dceaff);
        border-color: rgba(47, 111, 222, 0.24);
      }

      .register-meta {
        display: grid;
        gap: 0.35rem;
        justify-items: end;
      }

      .detail-head {
        grid-template-columns: 1fr auto;
        align-items: start;
      }

      .access-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .access-card {
        display: grid;
        gap: 0.22rem;
        padding: 0.72rem 0.76rem;
        border-radius: 14px;
        background: var(--cfm-color-surface-muted, #eef4fb);
        border: 1px solid var(--cfm-color-border, #d4e0ee);
      }

      @media (max-width: 1320px) {
        .admin-stage {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 820px) {
        .create-form,
        .access-grid {
          grid-template-columns: 1fr;
        }

        .register-button,
        .detail-head {
          grid-template-columns: 1fr;
        }

        .register-meta {
          justify-items: start;
        }
      }
    `,
  ],
})
export class DesktopAdminUsersPageComponent {
  readonly ctx = inject(DESKTOP_ADMIN_PAGE_CONTEXT);
  private readonly destroyRef = inject(DestroyRef);
  selectedMembershipId: string | null = null;

  readonly createForm = new FormGroup({
    email: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    firstName: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl("", { nonNullable: true }),
    roleCode: new FormControl<"owner" | "admin" | "manager" | "contributor" | "viewer">("manager", { nonNullable: true }),
  });

  readonly detailForm = new FormGroup({
    roleCode: new FormControl<"owner" | "admin" | "manager" | "contributor" | "viewer">("manager", { nonNullable: true }),
    userStatus: new FormControl<"invited" | "active" | "disabled">("active", { nonNullable: true }),
  });

  constructor() {
    this.ctx.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.ctx.members.length === 0) {
          this.selectedMembershipId = null;
          return;
        }

        if (!this.selectedMembershipId || !this.ctx.members.some((member) => member.membership.id === this.selectedMembershipId)) {
          this.selectedMembershipId = this.ctx.members[0]!.membership.id;
        }

        if (this.selectedMember) {
          this.detailForm.patchValue({
            roleCode: this.normalizeRoleForForm(this.selectedMember.membership.role_code),
            userStatus: this.selectedMember.user.status,
          }, { emitEvent: false });
        }
      });
  }

  get selectedMember(): OrganizationMemberRecord | null {
    return this.ctx.members.find((member) => member.membership.id === this.selectedMembershipId) ?? null;
  }

  selectMember(membershipId: string): void {
    this.selectedMembershipId = membershipId;
    if (this.selectedMember) {
      this.detailForm.patchValue({
        roleCode: this.normalizeRoleForForm(this.selectedMember.membership.role_code),
        userStatus: this.selectedMember.user.status,
      }, { emitEvent: false });
    }
  }

  async createMember(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    const member = await this.ctx.createMember({
      email: raw.email.trim(),
      first_name: raw.firstName.trim(),
      last_name: raw.lastName.trim(),
      phone: raw.phone.trim() || null,
      role_code: raw.roleCode,
    });
    if (member) {
      this.selectedMembershipId = member.membership.id;
      this.createForm.reset({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        roleCode: "manager",
      });
    }
  }

  async saveMember(): Promise<void> {
    if (!this.selectedMember) {
      return;
    }

    const raw = this.detailForm.getRawValue();
    await this.ctx.updateMember(this.selectedMember.membership.id, {
      role_code: raw.roleCode,
      user_status: raw.userStatus,
    });
  }

  private normalizeRoleForForm(roleCode: string): "owner" | "admin" | "manager" | "contributor" | "viewer" {
    switch (roleCode) {
      case "owner":
      case "admin":
      case "manager":
      case "contributor":
      case "viewer":
        return roleCode;
      case "member":
      default:
        return "viewer";
    }
  }
}
