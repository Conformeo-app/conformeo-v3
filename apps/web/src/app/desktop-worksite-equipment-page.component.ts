import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import type { WorksiteEquipmentStatus } from "@conformeo/contracts";
import { combineLatest, map } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type {
  DesktopWorksiteDetailVm,
  DesktopWorksiteEquipmentItem,
  DesktopWorksiteEquipmentMovementItem,
} from "./desktop-worksites.models";

type EquipmentWorkspaceVm = {
  detail: DesktopWorksiteDetailVm;
  canManage: boolean;
  treatmentTitle: string;
  treatmentTone: CfmTone;
  treatmentDetail: string;
  currentNeeds: string[];
};

@Component({
  selector: "cfm-desktop-worksite-equipment-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CfmButtonComponent, CfmStatusChipComponent],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <ng-container *ngIf="vm.detail as worksite; else emptyState">
        <section class="equipment-workspace">
          <header class="equipment-command-bar">
            <div class="command-title">
              <span class="command-kicker">Chantiers</span>
              <h3 class="page-title">Équipements chantier</h3>
              <div class="command-meta">
                <span class="meta-pill">{{ worksite.equipmentSummary.statusLabel }}</span>
                <span class="meta-pill">{{ worksite.equipmentSummary.totalLabel }}</span>
                <span class="meta-pill meta-pill--warning">{{ worksite.equipmentSummary.attentionLabel }}</span>
              </div>
            </div>

            <div class="toolbar-actions">
              <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                Revenir au chantier
              </cfm-button>
              <cfm-button type="button" variant="ghost" size="sm" routerLink="/app/chantiers/parc">
                Parc connu
              </cfm-button>
              <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                Coordination
              </cfm-button>
              <cfm-button
                *ngIf="worksite.isPersisted && vm.canManage"
                type="button"
                size="sm"
                (click)="toggleCreateForm()"
              >
                {{ showCreateForm ? "Fermer" : "Nouvel équipement" }}
              </cfm-button>
            </div>
          </header>

          <section class="equipment-ribbon">
            <article class="ribbon-cell detail-copy">
              <span class="small">État global</span>
              <strong>{{ worksite.equipmentSummary.statusLabel }}</strong>
              <span>{{ worksite.equipmentSummary.nextActionLabel }}</span>
            </article>
            <article class="ribbon-cell detail-copy">
              <span class="small">Parc affecté</span>
              <strong>{{ worksite.equipmentSummary.totalLabel }}</strong>
              <span>{{ worksite.equipmentSummary.availableOptions.length }} disponible{{ worksite.equipmentSummary.availableOptions.length > 1 ? 's' : '' }}</span>
            </article>
            <article class="ribbon-cell detail-copy">
              <span class="small">Signal principal</span>
              <strong>{{ worksite.primarySignalLabel }}</strong>
              <span>{{ worksite.primarySignalDetail }}</span>
            </article>
            <article class="ribbon-cell detail-copy">
              <span class="small">Dernier mouvement</span>
              <strong>{{ worksite.equipmentSummary.recentMovementLabel }}</strong>
              <span>{{ worksite.equipmentSummary.attentionLabel }}</span>
            </article>
          </section>

          <section class="equipment-stage">
            <section class="register-pane">
              <div class="register-head" *ngIf="worksite.equipments.length > 0">
                <span>Équipement</span>
                <span>État</span>
                <span>Type</span>
                <span>Mouvement</span>
                <span>Actions</span>
              </div>

              <ng-container *ngIf="worksite.equipments.length > 0; else noEquipment">
                <article class="register-row" *ngFor="let equipment of worksite.equipments; trackBy: trackByEquipment">
                  <div class="register-cell register-cell--identity">
                    <strong class="record-primary equipment-name">{{ equipment.name }}</strong>
                    <span class="record-meta subline">{{ equipment.signalLabel }}</span>
                  </div>

                  <div class="register-cell register-cell--status">
                    <cfm-status-chip [label]="equipment.statusLabel" [tone]="equipment.statusTone" />
                  </div>

                  <div class="register-cell register-cell--type">
                    <cfm-status-chip [label]="equipment.typeLabel" tone="calm" />
                  </div>

                  <div class="register-cell register-cell--movement">
                    <strong class="detail-copy">{{ equipment.lastMovementLabel }}</strong>
                    <span class="record-meta">
                      <ng-container *ngIf="equipment.actorLabel">{{ equipment.actorLabel }}</ng-container>
                      <ng-container *ngIf="equipment.lastMovementAtLabel">
                        <ng-container *ngIf="equipment.actorLabel"> · </ng-container>{{ equipment.lastMovementAtLabel }}
                      </ng-container>
                    </span>
                  </div>

                  <div class="register-cell register-cell--actions" *ngIf="worksite.isPersisted && vm.canManage; else readOnlyActions">
                    <div class="row-actions">
                      <cfm-button
                        type="button"
                        variant="ghost"
                        size="sm"
                        [disabled]="(facade.equipmentBusyId$ | async) === equipment.id"
                        (click)="remove(worksite.id, equipment)"
                      >
                        Retirer
                      </cfm-button>
                      <cfm-button
                        type="button"
                        variant="secondary"
                        size="sm"
                        [disabled]="equipment.raw.status === 'attention' || (facade.equipmentBusyId$ | async) === equipment.id"
                        (click)="markAttention(worksite.id, equipment)"
                      >
                        Attention
                      </cfm-button>
                      <cfm-button
                        type="button"
                        size="sm"
                        [disabled]="equipment.raw.status === 'unavailable' || (facade.equipmentBusyId$ | async) === equipment.id"
                        (click)="markUnavailable(worksite.id, equipment)"
                      >
                        Indisponible
                      </cfm-button>
                    </div>
                  </div>

                  <ng-template #readOnlyActions>
                    <div class="register-cell register-cell--actions">
                      <span class="row-hint">Lecture seule</span>
                    </div>
                  </ng-template>
                </article>
              </ng-container>
            </section>

            <aside class="equipment-sheet">
              <section class="sheet-card">
                <div class="sheet-card-head">
                  <div class="panel-copy">
                    <h4 class="panel-title">À traiter maintenant</h4>
                    <span class="small">Le prochain geste utile pour débloquer ou fiabiliser le parc terrain.</span>
                  </div>
                  <div class="chips">
                    <cfm-status-chip [label]="vm.treatmentTitle" [tone]="vm.treatmentTone" />
                    <cfm-status-chip [label]="worksite.equipmentSummary.statusLabel" [tone]="worksite.equipmentSummary.statusTone" />
                  </div>
                </div>

                <div class="sheet-summary detail-copy">
                  <strong>{{ vm.treatmentTitle }}</strong>
                  <span>{{ vm.treatmentDetail }}</span>
                  <span>{{ worksite.issueSummaryLabel }}</span>
                </div>

                <ul class="compact-list detail-copy" *ngIf="vm.currentNeeds.length > 0; else equipmentUnderControl">
                  <li *ngFor="let item of vm.currentNeeds">{{ item }}</li>
                </ul>

                <form
                  *ngIf="worksite.isPersisted && vm.canManage && showCreateForm"
                  class="sheet-form"
                  [formGroup]="createForm"
                  (ngSubmit)="createEquipment(worksite.id)"
                >
                  <label class="compact-field compact-field--grow">
                    <span class="small">Nom</span>
                    <input type="text" formControlName="name" placeholder="Ex. Perceuse magnétique atelier" />
                  </label>

                  <label class="compact-field compact-field--grow">
                    <span class="small">Type</span>
                    <input type="text" formControlName="type" placeholder="Ex. Outillage électroportatif" />
                  </label>

                  <label class="compact-field">
                    <span class="small">État initial</span>
                    <select formControlName="status">
                      <option *ngFor="let option of equipmentStatusOptions" [value]="option.value">
                        {{ option.label }}
                      </option>
                    </select>
                  </label>

                  <label class="toggle-field">
                    <input type="checkbox" formControlName="assignToWorksite" />
                    <span>Affecter immédiatement</span>
                  </label>

                  <div class="toolbar-actions">
                    <cfm-button type="button" variant="ghost" size="sm" (click)="closeCreateForm()">
                      Annuler
                    </cfm-button>
                    <cfm-button type="submit" size="sm" [disabled]="createForm.invalid || (facade.saving$ | async)">
                      {{ (facade.saving$ | async) ? "Création..." : "Créer" }}
                    </cfm-button>
                  </div>
                </form>

                <form
                  *ngIf="worksite.isPersisted && vm.canManage"
                  class="sheet-form sheet-form--assign"
                  [formGroup]="assignForm"
                  (ngSubmit)="assign(worksite.id)"
                >
                  <label class="compact-field compact-field--grow">
                    <span class="small">Affecter un équipement</span>
                    <select formControlName="equipmentId">
                      <option value="" [disabled]="worksite.equipmentSummary.availableOptions.length > 0">
                        Sélectionner un équipement
                      </option>
                      <option *ngFor="let option of worksite.equipmentSummary.availableOptions; trackBy: trackByOption" [value]="option.id">
                        {{ option.label }} · {{ option.supportLabel }}
                      </option>
                    </select>
                  </label>

                  <div class="toolbar-actions">
                    <cfm-button
                      type="submit"
                      size="sm"
                      [disabled]="!assignForm.getRawValue().equipmentId || (facade.saving$ | async)"
                    >
                      {{ (facade.saving$ | async) ? "Affectation..." : "Affecter" }}
                    </cfm-button>
                  </div>
                </form>

                <div class="compact-note" *ngIf="!worksite.isPersisted">
                  <strong>Lecture seule</strong>
                  <span class="panel-note">Les mouvements sont réservés aux chantiers réellement créés dans l’organisation.</span>
                </div>

                <div class="compact-note" *ngIf="worksite.isPersisted && !vm.canManage">
                  <strong>Lecture seule</strong>
                  <span class="panel-note">Le parc est visible, mais les mouvements restent réservés aux profils avec droit d’action.</span>
                </div>

                <div class="compact-note" *ngIf="worksite.isPersisted && vm.canManage && worksite.equipmentSummary.availableOptions.length === 0">
                  <strong>Aucun équipement disponible</strong>
                  <span class="panel-note">Créez un équipement ou réutilisez un équipement déjà connu dans l’organisation.</span>
                </div>
              </section>

              <section class="sheet-card">
                <div class="sheet-card-head">
                  <div class="panel-copy">
                    <h4 class="panel-title">Où aller ensuite</h4>
                    <span class="small">Les bonnes sorties pour revenir au chantier ou poursuivre le suivi.</span>
                  </div>
                </div>

                <ul class="linked-list">
                  <li class="linked-row">
                    <div class="linked-row-copy">
                      <strong>Aperçu chantier</strong>
                      <span>{{ worksite.primaryActionLabel }} · {{ worksite.globalStateLabel }}</span>
                    </div>
                    <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                      Revenir
                    </cfm-button>
                  </li>
                  <li class="linked-row">
                    <div class="linked-row-copy">
                      <strong>Coordination</strong>
                      <span>{{ worksite.coordination.statusLabel }} · {{ worksite.coordination.assigneeLabel }}</span>
                    </div>
                    <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                      Ouvrir
                    </cfm-button>
                  </li>
                  <li class="linked-row">
                    <div class="linked-row-copy">
                      <strong>Parc connu</strong>
                      <span>{{ worksite.equipmentSummary.availableOptions.length }} disponible{{ worksite.equipmentSummary.availableOptions.length > 1 ? 's' : '' }} à affecter</span>
                    </div>
                    <cfm-button type="button" variant="secondary" size="sm" routerLink="/app/chantiers/parc">
                      Ouvrir
                    </cfm-button>
                  </li>
                </ul>
              </section>

              <section class="sheet-card">
                <div class="sheet-card-head">
                  <div class="panel-copy">
                    <h4 class="panel-title">Mouvements récents</h4>
                    <span class="small">Trace courte pour savoir ce qui a changé.</span>
                  </div>
                </div>

                <ul class="movement-list" *ngIf="worksite.recentEquipmentMovements.length > 0; else noMovement">
                  <li *ngFor="let movement of worksite.recentEquipmentMovements; trackBy: trackByMovement">
                    <article class="movement-row detail-copy">
                      <div class="movement-row-head">
                        <strong class="record-primary equipment-name">{{ movement.equipmentName }}</strong>
                        <cfm-status-chip class="status-chip" [label]="movement.resultingStatusLabel" [tone]="movement.resultingStatusTone" />
                      </div>
                      <span>{{ movement.movementLabel }}</span>
                      <span class="small metadata">{{ movement.detail }}</span>
                      <span class="small metadata">
                        {{ movement.actorLabel }}
                        <ng-container *ngIf="movement.capturedAtLabel"> · {{ movement.capturedAtLabel }}</ng-container>
                      </span>
                    </article>
                  </li>
                </ul>
              </section>
            </aside>
          </section>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #noEquipment>
      <section class="compact-empty">
        <strong>Aucun équipement affecté</strong>
        <p>La prochaine action utile est de créer ou d’affecter un équipement connu.</p>
      </section>
    </ng-template>

    <ng-template #noMovement>
      <section class="compact-empty compact-empty--detail">
        <strong>Aucun mouvement récent</strong>
        <p>Les affectations, retraits et signaux d’attention apparaîtront ici.</p>
      </section>
    </ng-template>

    <ng-template #equipmentUnderControl>
      <div class="compact-note">
        <strong>Parc sous contrôle</strong>
        <span class="panel-note">Le parc affecté est cohérent. Le bon réflexe est maintenant de revenir au chantier ou suivre les prochains mouvements.</span>
      </div>
    </ng-template>

    <ng-template #emptyState>
      <section class="compact-empty compact-empty--detail">
        <strong>Équipements indisponibles</strong>
        <p>Le chantier demandé n’est pas visible pour le moment.</p>
      </section>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .equipment-workspace,
      .command-title,
      .panel-copy,
      .compact-empty,
      .movement-row,
      .register-cell {
        display: grid;
        gap: 0.32rem;
      }

      .equipment-workspace {
        gap: 0.65rem;
      }

      .equipment-command-bar,
      .toolbar-actions,
      .sheet-card-head,
      .movement-row-head,
      .row-actions,
      .toggle-field,
      .chips {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
      }

      .equipment-command-bar {
        padding: 0.54rem 0.68rem;
        border-radius: 12px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface);
      }

      .command-kicker,
      .register-head {
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .command-title h3,
      .panel-copy h4 {
        margin: 0;
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .command-meta,
      .toolbar-actions,
      .chips,
      .row-actions {
        display: inline-flex;
        align-items: center;
        gap: 0.42rem;
        flex-wrap: wrap;
      }

      .meta-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.24rem 0.48rem;
        border-radius: 9px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-secondary);
        color: var(--cfm-color-primary-strong);
        font-size: 0.8rem;
        font-weight: var(--cfm-font-weight-regular, 400);
      }

      .meta-pill--warning {
        background: var(--cfm-color-warning-soft);
        color: var(--cfm-color-warning-strong);
      }

      .equipment-ribbon {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .ribbon-cell,
      .sheet-card,
      .register-pane,
      .compact-empty {
        padding: 0.56rem 0.64rem;
        border-radius: 11px;
        border: 1px solid var(--cfm-color-border);
      }

      .ribbon-cell {
        display: grid;
        gap: 0.2rem;
        background: var(--cfm-color-surface-secondary);
      }

      .equipment-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.26fr) minmax(21rem, 0.74fr);
        gap: 0.65rem;
        align-items: start;
      }

      .register-pane,
      .equipment-sheet,
      .sheet-card,
      .sheet-form,
      .sheet-ribbon,
      .movement-list,
      .sheet-summary {
        display: grid;
        gap: 0.58rem;
        align-content: start;
      }

      .register-pane,
      .sheet-card {
        background: var(--cfm-color-surface);
      }

      .sheet-ribbon {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .sheet-ribbon-cell,
      .compact-note {
        display: grid;
        gap: 0.22rem;
        padding: 0.5rem 0.56rem;
        border-radius: 10px;
        background: var(--cfm-color-surface-secondary);
      }

      .register-head,
      .register-row {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) auto auto minmax(11rem, 0.95fr) minmax(11rem, 0.92fr);
        gap: 0.7rem;
        align-items: center;
      }

      .register-head {
        padding: 0 0.16rem 0.4rem;
      }

      .register-row {
        padding: 0.58rem 0.18rem;
        border-top: 1px solid var(--cfm-color-border);
      }

      .register-row:first-of-type {
        border-top: 1px solid var(--cfm-color-border);
      }

      .register-cell--actions {
        justify-items: end;
      }

      .row-hint,
      .register-cell span,
      .compact-note span,
      .movement-row span,
      .linked-row-copy span,
      .compact-empty p,
      .ribbon-cell span:not(.small),
      .sheet-ribbon-cell span:not(.small),
      .panel-copy span {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .register-cell strong,
      .movement-row strong,
      .linked-row-copy strong,
      .ribbon-cell strong,
      .sheet-ribbon-cell strong,
      .compact-note strong,
      .compact-empty strong {
        color: var(--cfm-color-ink);
      }

      .register-cell strong,
      .linked-row-copy strong,
      .ribbon-cell strong,
      .sheet-ribbon-cell strong {
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .register-cell--identity strong,
      .movement-row strong,
      .compact-note strong,
      .compact-empty strong {
        font-weight: var(--cfm-font-weight-medium, 500);
      }

      .movement-row strong,
      .compact-note strong,
      .compact-empty strong,
      .panel-copy h4 {
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .compact-field {
        display: grid;
        gap: 0.22rem;
        min-width: 12rem;
      }

      .compact-field--grow {
        flex: 1 1 16rem;
      }

      .compact-field input,
      .compact-field select {
        width: 100%;
        padding: 0.46rem 0.58rem;
        border-radius: 9px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-secondary);
        color: var(--cfm-color-ink);
        font: inherit;
      }

      .sheet-form {
        padding-top: 0.2rem;
        border-top: 1px solid var(--cfm-color-border);
      }

      .sheet-form--assign {
        margin-top: 0.12rem;
      }

      .toggle-field {
        justify-content: flex-start;
        color: var(--cfm-color-copy-muted);
        min-height: 2.25rem;
      }

      .movement-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .compact-list,
      .linked-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .compact-list {
        display: grid;
        gap: 0.36rem;
      }

      .compact-list li,
      .linked-row {
        padding-bottom: 0.42rem;
        border-bottom: 1px solid var(--cfm-color-border);
      }

      .compact-list li:last-child,
      .linked-row:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .linked-row,
      .linked-row-copy {
        display: grid;
        gap: 0.24rem;
      }

      .linked-row {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        column-gap: 0.65rem;
      }

      .movement-list li {
        padding-bottom: 0.46rem;
        border-bottom: 1px solid var(--cfm-color-border);
      }

      .movement-list li:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .compact-empty--detail {
        min-height: 11rem;
        place-content: center;
      }

      @media (max-width: 1260px) {
        .equipment-ribbon,
        .equipment-stage,
        .sheet-ribbon {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 980px) {
        .equipment-command-bar,
        .register-head,
        .register-row,
        .sheet-card-head,
        .movement-row-head,
        .linked-row {
          display: grid;
        }

        .register-cell--actions {
          justify-items: start;
        }

        .compact-field {
          min-width: 0;
        }
      }
    `,
  ],
})
export class DesktopWorksiteEquipmentPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly worksiteId$ = this.route.paramMap.pipe(map((params) => params.get("worksiteId")));
  readonly detail$ = this.facade.detail$(this.worksiteId$);
  readonly vm$ = combineLatest([this.detail$, this.facade.canActOnChantiers$]).pipe(
    map(([detail, canManage]) => {
      if (!detail) {
        return null;
      }

      return {
        detail,
        canManage,
        ...this.buildTreatmentVm(detail),
      } satisfies EquipmentWorkspaceVm;
    }),
  );

  readonly assignForm = new FormGroup({
    equipmentId: new FormControl("", { nonNullable: true }),
  });
  readonly createForm = new FormGroup({
    name: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    type: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    status: new FormControl<WorksiteEquipmentStatus>("ready", { nonNullable: true }),
    assignToWorksite: new FormControl(true, { nonNullable: true }),
  });
  readonly equipmentStatusOptions: Array<{ value: WorksiteEquipmentStatus; label: string }> = [
    { value: "ready", label: "Prêt" },
    { value: "attention", label: "Attention" },
    { value: "unavailable", label: "Indisponible" },
  ];
  showCreateForm = false;

  constructor() {
    this.detail$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => {
        const nextEquipmentId = detail?.equipmentSummary.availableOptions[0]?.id ?? "";
        this.assignForm.patchValue({ equipmentId: nextEquipmentId }, { emitEvent: false });
      });
  }

  async assign(worksiteId: string): Promise<void> {
    const equipmentId = this.assignForm.getRawValue().equipmentId;
    if (!equipmentId) {
      return;
    }
    await this.facade.recordEquipmentMovement(worksiteId, {
      equipment_id: equipmentId,
      movement_type: "assigned_to_worksite",
      resulting_status: "ready",
    });
  }

  async createEquipment(worksiteId: string): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const payload = this.createForm.getRawValue();
    const createdId = await this.facade.createEquipment({
      name: payload.name,
      type: payload.type,
      status: payload.status,
      assignToWorksiteId: payload.assignToWorksite ? worksiteId : null,
    });

    if (!createdId) {
      return;
    }

    this.createForm.reset(
      {
        name: "",
        type: "",
        status: "ready",
        assignToWorksite: true,
      },
      { emitEvent: false },
    );
    this.showCreateForm = false;
  }

  async remove(worksiteId: string, equipment: DesktopWorksiteEquipmentItem): Promise<void> {
    await this.facade.recordEquipmentMovement(worksiteId, {
      equipment_id: equipment.id,
      movement_type: "removed_from_worksite",
      resulting_status: "ready",
    });
  }

  async markAttention(worksiteId: string, equipment: DesktopWorksiteEquipmentItem): Promise<void> {
    await this.facade.recordEquipmentMovement(worksiteId, {
      equipment_id: equipment.id,
      movement_type: "marked_damaged",
      resulting_status: "attention",
    });
  }

  async markUnavailable(worksiteId: string, equipment: DesktopWorksiteEquipmentItem): Promise<void> {
    await this.facade.recordEquipmentMovement(worksiteId, {
      equipment_id: equipment.id,
      movement_type: "marked_damaged",
      resulting_status: "unavailable",
    });
  }

  trackByEquipment(_index: number, item: DesktopWorksiteEquipmentItem): string {
    return item.id;
  }

  trackByMovement(_index: number, item: DesktopWorksiteEquipmentMovementItem): string {
    return item.id;
  }

  trackByOption(_index: number, item: { id: string }): string {
    return item.id;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.closeCreateForm();
    }
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.createForm.reset(
      {
        name: "",
        type: "",
        status: "ready",
        assignToWorksite: true,
      },
      { emitEvent: false },
    );
  }

  private buildTreatmentVm(
    detail: DesktopWorksiteDetailVm,
  ): Omit<EquipmentWorkspaceVm, "detail" | "canManage"> {
    const equipmentCount = detail.equipments.length;
    const unavailableCount = detail.equipments.filter((equipment) => equipment.raw.status === "unavailable").length;
    const attentionCount = detail.equipments.filter((equipment) => equipment.raw.status === "attention").length;
    const availableCount = detail.equipmentSummary.availableOptions.length;

      const currentNeeds = [
        unavailableCount > 0
          ? `${unavailableCount} équipement${unavailableCount > 1 ? "s" : ""} indisponible${unavailableCount > 1 ? "s" : ""}`
          : null,
        equipmentCount === 0 ? "Aucun équipement encore affecté au chantier" : null,
        attentionCount > 0
          ? `${attentionCount} équipement${attentionCount > 1 ? "s" : ""} à vérifier`
          : null,
        availableCount > 0 && (equipmentCount === 0 || unavailableCount > 0)
          ? `${availableCount} équipement${availableCount > 1 ? "s" : ""} disponible${availableCount > 1 ? "s" : ""} à affecter`
          : null,
      ].filter((item): item is string => item !== null);

    if (!detail.isPersisted) {
      return {
        treatmentTitle: "Créer un chantier réel",
        treatmentTone: "calm",
        treatmentDetail: "Le parc devient exécutable sur un chantier réellement créé. Revenez au chantier pour lancer la suite terrain.",
        currentNeeds: ["Le parc chantier s’active seulement sur un chantier réellement créé."],
      };
    }

    if (detail.blockingItems.length > 0 && unavailableCount === 0) {
      return {
        treatmentTitle: "Blocage à lever",
        treatmentTone: "danger",
        treatmentDetail: `${detail.primarySignalLabel}. ${detail.primaryActionDetail}`,
        currentNeeds,
      };
    }

    if (unavailableCount > 0) {
      return {
        treatmentTitle: unavailableCount > 1 ? "Équipements à remplacer" : "Équipement à remplacer",
        treatmentTone: "danger",
        treatmentDetail: "Retirez ou remplacez d’abord le matériel indisponible avant de poursuivre le chantier.",
        currentNeeds,
      };
    }

    if (equipmentCount === 0) {
      return {
        treatmentTitle: "Affecter un équipement",
        treatmentTone: "progress",
        treatmentDetail: "Le chantier peut avancer dès qu’un premier équipement terrain est affecté.",
        currentNeeds,
      };
    }

    if (attentionCount > 0) {
      return {
        treatmentTitle: attentionCount > 1 ? "Vérifier les équipements" : "Vérifier l’équipement",
        treatmentTone: "progress",
        treatmentDetail: "Le matériel est en place, mais les signaux d’attention doivent être relus avant poursuite.",
        currentNeeds,
      };
    }

    return {
      treatmentTitle: "Parc sous contrôle",
      treatmentTone: "success",
      treatmentDetail: "Le parc affecté est cohérent. Le bon réflexe est de revenir au chantier ou suivre les mouvements récents.",
      currentNeeds,
    };
  }
}
