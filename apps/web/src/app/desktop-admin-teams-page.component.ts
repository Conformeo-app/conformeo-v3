import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import type { OrganizationTeamRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent } from "@conformeo/ui";

import { DESKTOP_ADMIN_PAGE_CONTEXT } from "./desktop-admin-page-context";

@Component({
  selector: "cfm-desktop-admin-teams-page",
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
        <cfm-status-chip [label]="ctx.teamCount + ' équipes'" tone="progress" />
        <cfm-status-chip [label]="ctx.memberCount + ' membres disponibles'" tone="neutral" />
      </section>

      <section class="admin-stage">
        <section class="admin-panel admin-panel--main">
          <div class="panel-head">
            <div>
              <h3>Créer une équipe</h3>
              <p>Une base simple pour structurer les membres avant Coordination.</p>
            </div>
          </div>

          <div class="compact-note" *ngIf="ctx.isAdministrationReadOnly">
            <strong>Lecture seule</strong>
            <span>Les équipes sont visibles, mais leur création et la gestion des membres restent réservées aux rôles admin.</span>
          </div>

          <form class="create-form" [formGroup]="createForm" (ngSubmit)="createTeam()" *ngIf="ctx.canManageUsers">
            <label class="field">
              <span class="small">Nom</span>
              <input type="text" formControlName="name" />
            </label>

            <label class="field field--full">
              <span class="small">Description</span>
              <textarea formControlName="description" rows="3"></textarea>
            </label>

            <div class="member-picker member-picker--create">
              <strong>Membres</strong>
              <label class="member-check" *ngFor="let member of ctx.members">
                <input
                  type="checkbox"
                  [checked]="isCreateMemberSelected(member.user.id)"
                  (change)="toggleCreateMember(member.user.id, $any($event.target).checked)"
                />
                <span>{{ member.user.display_name }} · {{ member.role_label }}</span>
              </label>
            </div>

            <div class="form-actions">
              <cfm-button type="submit" [disabled]="createForm.invalid || ctx.savingTeamId === 'create'">
                {{ ctx.savingTeamId === 'create' ? "Création..." : "Créer l'équipe" }}
              </cfm-button>
            </div>
          </form>

          <div class="panel-head panel-head--spaced">
            <div>
              <h3>Équipes</h3>
              <p>Lecture claire des membres déjà regroupés.</p>
            </div>
          </div>

          <ul class="register-list" *ngIf="ctx.teams.length > 0; else emptyTeams">
            <li *ngFor="let team of ctx.teams" class="register-line">
              <button
                type="button"
                class="register-button"
                [class.is-active]="team.id === selectedTeamId"
                (click)="selectTeam(team.id)"
              >
                <div class="register-copy">
                  <strong>{{ team.name }}</strong>
                  <span>{{ team.description || 'Aucune description' }}</span>
                </div>

                <cfm-status-chip [label]="team.member_count + ' membre' + (team.member_count > 1 ? 's' : '')" tone="progress" />
              </button>
            </li>
          </ul>
        </section>

        <aside class="admin-panel admin-rail">
          <ng-container *ngIf="selectedTeam as team; else emptyDetail">
            <div class="panel-head">
              <div>
                <h3>Détail équipe</h3>
                <p>Nom, description et membres rattachés.</p>
              </div>
            </div>

            <form class="detail-form" [formGroup]="detailForm" (ngSubmit)="saveTeam()">
              <label class="field">
                <span class="small">Nom</span>
                <input type="text" formControlName="name" [disabled]="!ctx.canManageUsers" />
              </label>

              <label class="field">
                <span class="small">Description</span>
                <textarea formControlName="description" rows="3" [disabled]="!ctx.canManageUsers"></textarea>
              </label>

              <div class="member-picker">
                <strong>Membres rattachés</strong>
                <label class="member-check" *ngFor="let member of ctx.members">
                  <input
                    type="checkbox"
                    [checked]="isDetailMemberSelected(member.user.id)"
                    [disabled]="!ctx.canManageUsers"
                    (change)="toggleDetailMember(member.user.id, $any($event.target).checked)"
                  />
                  <span>{{ member.user.display_name }} · {{ member.role_label }}</span>
                </label>
              </div>

              <div class="detail-members" *ngIf="team.members.length > 0">
                <strong>Lecture actuelle</strong>
                <ul>
                  <li *ngFor="let member of team.members">
                    {{ member.display_name }} · {{ member.role_label }}
                  </li>
                </ul>
              </div>

              <div class="form-actions">
                <cfm-button type="submit" [disabled]="!ctx.canManageUsers || ctx.savingTeamId === team.id">
                  {{ ctx.savingTeamId === team.id ? "Enregistrement..." : "Enregistrer" }}
                </cfm-button>
              </div>

              <div class="compact-note" *ngIf="ctx.isAdministrationReadOnly">
                <strong>Lecture seule</strong>
                <span>La composition de l’équipe reste consultable sans modification possible.</span>
              </div>
            </form>
          </ng-container>
        </aside>
      </section>
    </section>

    <ng-template #emptyTeams>
      <div class="empty-inline">
        <strong>Aucune équipe</strong>
        <p>Créez une première équipe pour structurer les membres de l'organisation.</p>
      </div>
    </ng-template>

    <ng-template #emptyDetail>
      <cfm-empty-state
        title="Aucune équipe sélectionnée"
        description="Choisissez une équipe dans la liste pour voir sa composition."
      />
    </ng-template>

    <ng-template #lockedState>
      <cfm-empty-state
        title="Équipes indisponibles"
        description="Votre accès actuel ne permet pas de consulter les équipes de l'organisation."
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
      .create-form,
      .detail-form,
      .register-list,
      .panel-head,
      .field,
      .member-picker,
      .register-copy,
      .detail-members,
      .empty-inline {
        display: grid;
        gap: 0.5rem;
      }

      .summary-chips {
        display: flex;
        flex-wrap: wrap;
      }

      .admin-stage {
        grid-template-columns: minmax(0, 1.05fr) minmax(18rem, 0.95fr);
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
      .register-copy strong {
        margin: 0;
        color: var(--cfm-color-ink, #1e2b3a);
      }

      .panel-head p,
      .register-copy span,
      .empty-inline p {
        margin: 0;
        color: var(--cfm-color-copy-muted, #60758c);
        line-height: 1.4;
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
        gap: 0.65rem;
        align-items: start;
        padding: 0.78rem 0.82rem;
        border-radius: 14px;
        border: 1px solid var(--cfm-color-border, #d4e0ee);
        background: var(--cfm-color-surface-muted, #eef4fb);
        text-align: left;
        cursor: pointer;
      }

      .register-button.is-active {
        background: var(--cfm-color-primary-soft, #dceaff);
        border-color: rgba(47, 111, 222, 0.24);
      }

      .member-picker {
        padding: 0.72rem 0.76rem;
        border-radius: 14px;
        background: var(--cfm-color-surface-muted, #eef4fb);
        border: 1px solid var(--cfm-color-border, #d4e0ee);
      }

      .member-check {
        display: flex;
        gap: 0.55rem;
        align-items: start;
      }

      .detail-members ul {
        margin: 0;
        padding-left: 1rem;
        color: var(--cfm-color-copy-muted, #60758c);
      }

      @media (max-width: 1320px) {
        .admin-stage {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopAdminTeamsPageComponent {
  readonly ctx = inject(DESKTOP_ADMIN_PAGE_CONTEXT);
  private readonly destroyRef = inject(DestroyRef);

  selectedTeamId: string | null = null;
  private readonly createMemberIds = new Set<string>();
  private readonly detailMemberIds = new Set<string>();

  readonly createForm = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl("", { nonNullable: true }),
  });

  readonly detailForm = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl("", { nonNullable: true }),
  });

  constructor() {
    this.ctx.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.ctx.teams.length === 0) {
          this.selectedTeamId = null;
          this.detailMemberIds.clear();
          return;
        }

        if (!this.selectedTeamId || !this.ctx.teams.some((team) => team.id === this.selectedTeamId)) {
          this.selectedTeamId = this.ctx.teams[0]!.id;
        }

        if (this.selectedTeam) {
          this.detailForm.patchValue({
            name: this.selectedTeam.name,
            description: this.selectedTeam.description ?? "",
          }, { emitEvent: false });
          this.detailMemberIds.clear();
          for (const member of this.selectedTeam.members) {
            this.detailMemberIds.add(member.user_id);
          }
        }
      });
  }

  get selectedTeam(): OrganizationTeamRecord | null {
    return this.ctx.teams.find((team) => team.id === this.selectedTeamId) ?? null;
  }

  selectTeam(teamId: string): void {
    this.selectedTeamId = teamId;
    if (this.selectedTeam) {
      this.detailForm.patchValue({
        name: this.selectedTeam.name,
        description: this.selectedTeam.description ?? "",
      }, { emitEvent: false });
      this.detailMemberIds.clear();
      for (const member of this.selectedTeam.members) {
        this.detailMemberIds.add(member.user_id);
      }
    }
  }

  isCreateMemberSelected(userId: string): boolean {
    return this.createMemberIds.has(userId);
  }

  toggleCreateMember(userId: string, checked: boolean): void {
    if (checked) {
      this.createMemberIds.add(userId);
      return;
    }
    this.createMemberIds.delete(userId);
  }

  isDetailMemberSelected(userId: string): boolean {
    return this.detailMemberIds.has(userId);
  }

  toggleDetailMember(userId: string, checked: boolean): void {
    if (checked) {
      this.detailMemberIds.add(userId);
      return;
    }
    this.detailMemberIds.delete(userId);
  }

  async createTeam(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const raw = this.createForm.getRawValue();
    const team = await this.ctx.createTeam({
      name: raw.name.trim(),
      description: raw.description.trim() || null,
      member_user_ids: Array.from(this.createMemberIds),
    });
    if (team) {
      this.selectedTeamId = team.id;
      this.createForm.reset({ name: "", description: "" });
      this.createMemberIds.clear();
    }
  }

  async saveTeam(): Promise<void> {
    if (!this.selectedTeam || this.detailForm.invalid) {
      this.detailForm.markAllAsTouched();
      return;
    }

    const raw = this.detailForm.getRawValue();
    await this.ctx.updateTeam(this.selectedTeam.id, {
      name: raw.name.trim(),
      description: raw.description.trim() || null,
      member_user_ids: Array.from(this.detailMemberIds),
    });
  }
}
