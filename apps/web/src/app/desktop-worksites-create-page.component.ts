import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmCardComponent, CfmEmptyStateComponent } from "@conformeo/ui";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";

@Component({
  selector: "cfm-desktop-worksites-create-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmCardComponent,
    CfmEmptyStateComponent,
  ],
  template: `
    <cfm-card
      *ngIf="facade.canActOnChantiers; else lockedState"
      class="desktop-card"
      eyebrow="Création"
      title="Nouveau chantier"
      description="Un formulaire court pour créer un chantier proprement, puis ouvrir sa fiche."
    >
      <form class="create-form" [formGroup]="form" (ngSubmit)="submit()">
        <label class="compact-field">
          <span class="small">Nom du chantier</span>
          <input type="text" formControlName="name" placeholder="Ex. Réaménagement agence Presqu’île" />
        </label>

        <label class="compact-field">
          <span class="small">Site lié</span>
          <select formControlName="siteId">
            <option value="">Aucun site lié</option>
            <option *ngFor="let site of facade.sites$ | async" [value]="site.id">{{ site.name }}</option>
          </select>
        </label>

        <label class="compact-field">
          <span class="small">Statut initial</span>
          <select formControlName="status">
            <option *ngFor="let option of facade.worksiteStatusOptions" [value]="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="compact-field">
          <span class="small">Description courte</span>
          <textarea formControlName="description" rows="4" placeholder="Repère simple sur l’intervention ou le point de vigilance."></textarea>
        </label>

        <div class="create-actions">
          <cfm-button type="submit" [disabled]="form.invalid || (facade.saving$ | async)">
            {{ (facade.saving$ | async) ? "Création en cours" : "Créer le chantier" }}
          </cfm-button>
          <cfm-button type="button" variant="ghost" routerLink="/app/chantiers/liste">
            Retour liste
          </cfm-button>
        </div>
      </form>
    </cfm-card>

    <ng-template #lockedState>
      <cfm-empty-state
        title="Création indisponible"
        description="Votre accès actuel ne permet pas encore de créer un chantier."
      />
    </ng-template>
  `,
  styles: [
    `
      .create-form {
        display: grid;
        gap: 0.9rem;
      }

      .compact-field {
        display: grid;
        gap: 0.3rem;
      }

      .compact-field input,
      .compact-field select,
      .compact-field textarea {
        width: 100%;
        padding: 0.75rem 0.85rem;
        border-radius: 14px;
        border: 1px solid rgba(23, 49, 43, 0.12);
        background: #fff;
        color: #17312b;
        font: inherit;
      }

      .compact-field textarea {
        resize: vertical;
      }

      .create-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }
    `,
  ],
})
export class DesktopWorksitesCreatePageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
    siteId: new FormControl("", { nonNullable: true }),
    status: new FormControl<"planned" | "in_progress" | "blocked" | "completed">("planned", { nonNullable: true }),
    description: new FormControl("", { nonNullable: true }),
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const worksiteId = await this.facade.createWorksite(this.form.getRawValue());
    if (worksiteId) {
      await this.router.navigate(["/app/chantiers", worksiteId, "apercu"]);
    }
  }
}
