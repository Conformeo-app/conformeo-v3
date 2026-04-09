import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, firstValueFrom, map, startWith } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteDetailVm } from "./desktop-worksites.models";

type CoordinationHistoryEntry = {
  id: string;
  eyebrow: string;
  title: string;
  detail: string;
  support: string | null;
  statusLabel: string | null;
  tone: CfmTone | null;
};

type CoordinationWorkspaceVm = {
  detail: DesktopWorksiteDetailVm;
  canManage: boolean;
  nextStepLabel: string;
  nextStepRoute: string;
  nextStepIsCurrent: boolean;
  attentionLabel: string;
  attentionTone: CfmTone;
  currentNeeds: string[];
  canCompleteTeam: boolean;
  historyEntries: CoordinationHistoryEntry[];
};

type RecentlyAddedMember = {
  userId: string;
  displayName: string;
  teamId: string;
};

@Component({
  selector: "cfm-desktop-worksite-coordination-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmEmptyStateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm; else emptyState">
      <ng-container *ngIf="vm.detail as worksite">
        <section class="coordination-workspace">
          <section class="coordination-stage">
            <section class="coordination-main">
              <article class="story-panel story-panel--intervention">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Intervenir</span>
                    <h4>Intervention à venir</h4>
                    <p>Le prochain passage terrain, avec son cadre d’exécution et le geste utile à préparer maintenant.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.planning.statusLabel" [tone]="worksite.planning.statusTone" />
                </header>

                <div class="story-highlight">
                  <strong>{{ worksite.planning.nextInterventionLabel }}</strong>
                  <span>{{ worksite.planning.nextInterventionDetail || worksite.planning.summary }}</span>
                  <span>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</span>
                </div>

                <div class="story-split story-split--facts">
                  <section class="story-block">
                    <h5>Qui intervient</h5>
                    <ul class="compact-list">
                      <li>{{ worksite.coordination.teamName }}</li>
                      <li>{{ worksite.coordination.assigneeLabel }}</li>
                      <li>{{ worksite.planning.nextInterventionAssigneeLabel }}</li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Action principale</h5>
                    <ul class="compact-list">
                      <li>{{ vm.nextStepLabel }}</li>
                      <li>{{ worksite.primaryActionDetail }}</li>
                      <li *ngIf="worksite.planning.lastInterventionFollowUp">{{ worksite.planning.lastInterventionFollowUp }}</li>
                      <li *ngIf="!worksite.planning.lastInterventionFollowUp">{{ worksite.issueSummaryLabel }}</li>
                    </ul>
                  </section>
                </div>
              </article>

              <article class="story-panel story-panel--actions">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Coordonner</span>
                    <h4>Action de coordination</h4>
                    <p>Compléter l’équipe, cadrer le référent, préparer l’intervention et enregistrer le retour terrain dans un seul flux.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.coordination.statusLabel" [tone]="worksite.coordination.statusTone" />
                </header>

                <form class="coordination-form" [formGroup]="form" (ngSubmit)="save(worksite.id)">
                  <section class="form-section">
                    <div class="section-head">
                      <div class="section-copy">
                        <span class="small">Cadre chantier</span>
                        <strong>Équipe, référent et état de coordination</strong>
                      </div>
                      <cfm-status-chip class="status-chip" [label]="worksite.coordination.coverageLabel" [tone]="worksite.coordination.coverageTone" />
                    </div>

                    <div class="form-grid">
                      <label class="compact-field">
                        <span class="small">Statut</span>
                        <select formControlName="status" [disabled]="!vm.canManage">
                          <option value="todo">À faire</option>
                          <option value="in_progress">En cours</option>
                          <option value="done">Fait</option>
                        </select>
                      </label>

                      <label class="compact-field">
                        <span class="small">Équipe chantier</span>
                        <select formControlName="teamId" [disabled]="!vm.canManage">
                          <option value="">Aucune équipe affectée</option>
                          <option *ngFor="let team of facade.teams$ | async" [value]="team.id">
                            {{ team.name }} · {{ team.member_count }} membre{{ team.member_count > 1 ? "s" : "" }}
                          </option>
                        </select>
                      </label>
                    </div>

                    <div class="form-grid">
                      <label class="compact-field">
                        <span class="small">Référent chantier</span>
                        <select formControlName="assigneeUserId" [disabled]="!vm.canManage || !form.controls.teamId.value">
                          <option value="">
                            {{ form.controls.teamId.value ? "Référent à définir" : "Choisir d’abord une équipe" }}
                          </option>
                          <option *ngFor="let assignee of availableAssignees$ | async" [value]="assignee.user_id">
                            {{ assignee.display_name }}
                          </option>
                        </select>
                      </label>

                      <label class="compact-field compact-field--comment">
                        <span class="small">Commentaire utile</span>
                        <textarea
                          formControlName="commentText"
                          rows="4"
                          [disabled]="!vm.canManage"
                          placeholder="Repère court pour le suivi terrain, la prochaine vérification ou le point bloquant."
                        ></textarea>
                      </label>
                    </div>

                    <div class="compact-note compact-note--highlight referent-suggestion" *ngIf="referentSuggestion$ | async as suggestion">
                      <div class="section-copy">
                        <strong>{{ suggestion.displayName }} ajouté à l'équipe</strong>
                        <span>Référent encore manquant. Ce membre est déjà présélectionné pour accélérer le cadrage.</span>
                      </div>
                      <cfm-button
                        type="button"
                        size="sm"
                        variant="secondary"
                        [disabled]="facade.saving$ | async"
                        (click)="confirmSuggestedReferent(worksite.id)"
                      >
                        {{ (facade.saving$ | async) ? "Enregistrement..." : "Définir comme référent" }}
                      </cfm-button>
                    </div>

                    <div class="team-panel" *ngIf="vm.canManage && worksite.coordination.teamId && vm.canCompleteTeam">
                      <div class="section-head section-head--compact">
                        <div class="section-copy">
                          <span class="small">Compléter l’équipe</span>
                          <strong>Ajouter un membre existant à l’équipe affectée</strong>
                        </div>
                      </div>

                      <ng-container *ngIf="availableMembersToAdd$ | async as candidates">
                        <div class="form-grid">
                          <label class="compact-field">
                            <span class="small">Ajouter un membre existant</span>
                            <select [formControl]="form.controls.memberUserIdToAdd" [disabled]="candidates.length === 0">
                              <option value="">
                                {{ candidates.length > 0 ? "Choisir un membre" : "Aucun autre membre disponible" }}
                              </option>
                              <option *ngFor="let candidate of candidates" [value]="candidate.user_id">
                                {{ candidate.display_name }}
                              </option>
                            </select>
                          </label>
                        </div>

                        <div class="inline-actions">
                          <cfm-button
                            type="button"
                            size="sm"
                            variant="secondary"
                            [disabled]="!form.controls.memberUserIdToAdd.value || (facade.saving$ | async)"
                            (click)="addMemberToTeam()"
                          >
                            {{ (facade.saving$ | async) ? "Ajout..." : "Ajouter à l'équipe" }}
                          </cfm-button>
                          <span class="panel-note" *ngIf="candidates.length === 0">
                            Tous les membres actifs disponibles sont déjà rattachés à cette équipe.
                          </span>
                        </div>
                      </ng-container>
                    </div>

                    <div class="inline-actions" *ngIf="vm.canManage; else readOnlyNote">
                      <cfm-button type="submit" size="sm" [disabled]="facade.saving$ | async">
                        {{ (facade.saving$ | async) ? "Enregistrement..." : "Enregistrer la coordination" }}
                      </cfm-button>
                    </div>
                  </section>

                  <section class="form-section">
                    <div class="section-head">
                      <div class="section-copy">
                        <span class="small">Préparer l’intervention</span>
                        <strong>Type, date prévue et consigne utile</strong>
                      </div>
                      <cfm-status-chip
                        *ngIf="worksite.interventions.length > 0"
                        class="status-chip"
                        [label]="worksite.planning.nextInterventionStatusLabel"
                        [tone]="worksite.planning.nextInterventionStatusTone"
                      />
                    </div>

                    <div class="form-grid">
                      <label class="compact-field">
                        <span class="small">Type</span>
                        <select [formControl]="form.controls.interventionType" [disabled]="!vm.canManage">
                          <option *ngFor="let option of interventionTypeOptions" [value]="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </label>

                      <label class="compact-field">
                        <span class="small">Date prévue</span>
                        <input type="datetime-local" [formControl]="form.controls.interventionScheduledFor" [disabled]="!vm.canManage" />
                      </label>
                    </div>

                    <label class="compact-field compact-field--comment">
                      <span class="small">Commentaire intervention</span>
                      <textarea
                        rows="4"
                        [formControl]="form.controls.interventionNotes"
                        [disabled]="!vm.canManage"
                        placeholder="Préparation attendue, point de contrôle, repère de livraison ou élément à reprogrammer."
                      ></textarea>
                    </label>

                    <div class="inline-actions" *ngIf="vm.canManage">
                      <cfm-button type="button" size="sm" [disabled]="facade.saving$ | async" (click)="saveIntervention(worksite.id)">
                        {{
                          (facade.saving$ | async)
                            ? "Enregistrement..."
                            : (form.controls.interventionId.value ? "Mettre à jour l’intervention" : "Créer l’intervention")
                        }}
                      </cfm-button>
                    </div>
                  </section>

                  <section class="form-section" *ngIf="form.controls.interventionId.value">
                    <div class="section-head">
                      <div class="section-copy">
                        <span class="small">Résultat terrain</span>
                        <strong>Fermer la boucle entre prévision et réalité</strong>
                      </div>
                    </div>

                    <div class="form-grid">
                      <label class="compact-field">
                        <span class="small">Résultat</span>
                        <select [formControl]="form.controls.interventionResult" [disabled]="!vm.canManage">
                          <option *ngFor="let option of interventionResultOptions" [value]="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </label>

                      <label class="compact-field">
                        <span class="small">Date réelle</span>
                        <input type="datetime-local" [formControl]="form.controls.interventionCompletedAt" [disabled]="!vm.canManage" />
                      </label>
                    </div>

                    <div class="form-grid">
                      <label class="compact-field compact-field--comment">
                        <span class="small">Compte-rendu court</span>
                        <textarea
                          rows="3"
                          [formControl]="form.controls.interventionReportComment"
                          [disabled]="!vm.canManage"
                          placeholder="Ce qui s’est réellement passé pendant l’intervention."
                        ></textarea>
                      </label>

                      <label class="compact-field compact-field--comment">
                        <span class="small">Suite utile / point bloquant</span>
                        <textarea
                          rows="3"
                          [formControl]="form.controls.interventionFollowUpNote"
                          [disabled]="!vm.canManage"
                          placeholder="Ce qu’il faut faire ensuite ou ce qui bloque encore le chantier."
                        ></textarea>
                      </label>
                    </div>

                    <div class="inline-actions" *ngIf="vm.canManage">
                      <cfm-button
                        type="button"
                        variant="secondary"
                        size="sm"
                        [disabled]="facade.saving$ | async"
                        (click)="saveInterventionResult(form.controls.interventionId.value)"
                      >
                        {{ (facade.saving$ | async) ? "Enregistrement..." : "Enregistrer le résultat" }}
                      </cfm-button>
                    </div>
                  </section>

                  <ng-template #readOnlyNote>
                    <div class="compact-note">
                      <strong>Lecture seule</strong>
                      <span class="panel-note">La coordination reste visible, mais ce profil ne peut pas modifier l’équipe ni l’intervention.</span>
                    </div>
                  </ng-template>
                </form>
              </article>

              <article class="story-panel story-panel--suite">
                <header class="story-head">
                  <div class="story-copy">
                    <span class="story-kicker">Orienter</span>
                    <h4>Suite / points à traiter</h4>
                    <p>Ce qui bloque encore, ce qu’il faut reprogrammer et la prochaine action métier à lancer.</p>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="vm.attentionLabel" [tone]="vm.attentionTone" />
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ vm.attentionLabel }}</strong>
                  <span>{{ worksite.summary }}</span>
                </div>

                <div class="story-split">
                  <section class="story-block">
                    <h5>Ce qui manque encore</h5>
                    <ul class="compact-list" *ngIf="vm.currentNeeds.length > 0; else noCoordinationGap">
                      <li *ngFor="let item of vm.currentNeeds">{{ item }}</li>
                    </ul>
                  </section>

                  <section class="story-block">
                    <h5>Prochaine action métier</h5>
                    <div class="action-callout">
                      <div class="section-copy">
                        <strong>{{ vm.nextStepLabel }}</strong>
                        <span>{{ worksite.primarySignalDetail }}</span>
                      </div>
                      <cfm-button *ngIf="!vm.nextStepIsCurrent" type="button" size="sm" [routerLink]="vm.nextStepRoute">
                        Ouvrir
                      </cfm-button>
                    </div>
                    <p class="panel-note" *ngIf="vm.nextStepIsCurrent">
                      Le geste utile se traite dans cette page, sans repasser par une autre sous-vue.
                    </p>
                  </section>
                </div>
              </article>
            </section>

            <aside class="coordination-rail">
              <article class="rail-panel rail-panel--team">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Équipe chantier</span>
                    <h4>Équipe chantier</h4>
                  </div>
                  <cfm-status-chip class="status-chip" [label]="worksite.coordination.coverageLabel" [tone]="worksite.coordination.coverageTone" />
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.coordination.teamName }}</strong>
                  <span>{{ worksite.coordination.teamDescription || worksite.coordination.coverageDetail }}</span>
                </div>

                <ul class="rail-list">
                  <li>
                    <span class="small">Référent</span>
                    <strong>{{ worksite.coordination.assigneeLabel }}</strong>
                    <span>{{ worksite.coordination.updatedAtLabel || "À préciser" }}</span>
                  </li>
                  <li>
                    <span class="small">Couverture</span>
                    <strong>{{ worksite.coordination.coverageLabel }}</strong>
                    <span>{{ worksite.coordination.coverageDetail }}</span>
                  </li>
                  <li>
                    <span class="small">Membres visibles</span>
                    <strong>{{ worksite.coordination.teamMemberCountLabel }}</strong>
                    <span *ngIf="worksite.coordination.teamMembers.length > 0">
                      {{ worksite.coordination.teamMembers[0].displayName }}<ng-container *ngIf="worksite.coordination.teamMembers.length > 1">
                        · +{{ worksite.coordination.teamMembers.length - 1 }}
                      </ng-container>
                    </span>
                    <span *ngIf="worksite.coordination.teamMembers.length === 0">Aucun membre encore rattaché</span>
                  </li>
                </ul>

                <ul class="compact-list compact-list--members" *ngIf="worksite.coordination.teamMembers.length > 0; else noTeamMembers">
                  <li *ngFor="let member of worksite.coordination.teamMembers | slice:0:5">
                    {{ member.displayName }} · {{ member.roleLabel }}
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Historique court</span>
                    <h4>Historique court de coordination</h4>
                  </div>
                </header>

                <ul class="story-list story-list--history" *ngIf="vm.historyEntries.length > 0; else noHistory">
                  <li *ngFor="let entry of vm.historyEntries; trackBy: trackByHistoryEntry">
                    <div class="story-row-copy">
                      <span class="small">{{ entry.eyebrow }}</span>
                      <strong>{{ entry.title }}</strong>
                      <span>{{ entry.detail }}</span>
                      <span *ngIf="entry.support">{{ entry.support }}</span>
                    </div>
                    <cfm-status-chip
                      *ngIf="entry.statusLabel && entry.tone"
                      class="status-chip"
                      [label]="entry.statusLabel"
                      [tone]="entry.tone"
                    />
                  </li>
                </ul>
              </article>

              <article class="rail-panel">
                <header class="rail-head">
                  <div class="story-copy">
                    <span class="story-kicker">Repères utiles</span>
                    <h4>Repères utiles</h4>
                  </div>
                </header>

                <div class="story-highlight story-highlight--quiet">
                  <strong>{{ worksite.primarySignalLabel }}</strong>
                  <span>{{ worksite.primarySignalDetail }}</span>
                </div>

                <ul class="rail-list">
                  <li>
                    <span class="small">Chantier</span>
                    <strong>{{ worksite.globalStateLabel }}</strong>
                    <span>{{ worksite.issueSummaryLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Preuves</span>
                    <strong>{{ worksite.proofsCountLabel }}</strong>
                    <span>{{ worksite.signaturesCountLabel }}</span>
                  </li>
                  <li>
                    <span class="small">Équipements</span>
                    <strong>{{ worksite.equipmentSummary.totalLabel }}</strong>
                    <span>{{ worksite.equipmentSummary.attentionLabel }}</span>
                  </li>
                </ul>

                <div class="story-actions story-actions--rail">
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                    Revenir au chantier
                  </cfm-button>
                  <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'preuves']">
                    Preuves
                  </cfm-button>
                  <cfm-button type="button" variant="ghost" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'equipements']">
                    Équipements
                  </cfm-button>
                </div>
              </article>
            </aside>
          </section>
        </section>
      </ng-container>
    </ng-container>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Coordination indisponible"
        description="Le chantier demandé n’est pas visible pour le moment."
      />
    </ng-template>

    <ng-template #noCoordinationGap>
      <ul class="compact-list">
        <li>La coordination est sous contrôle. Le bon réflexe est maintenant de revenir à l’aperçu ou de suivre les preuves.</li>
      </ul>
    </ng-template>

    <ng-template #noHistory>
      <div class="story-empty">
        <strong>Aucun historique utile</strong>
        <p>Les derniers cadrages et résultats terrain remonteront ici dès qu’ils seront saisis.</p>
      </div>
    </ng-template>

    <ng-template #noTeamMembers>
      <div class="story-empty story-empty--compact">
        <strong>Aucun membre visible</strong>
        <p>Complétez l’équipe depuis cette page pour rendre la couverture exploitable.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .coordination-workspace,
      .coordination-main,
      .coordination-rail,
      .story-panel,
      .rail-panel,
      .story-copy,
      .story-row-copy,
      .story-highlight,
      .story-block,
      .section-copy,
      .story-empty,
      .rail-list li,
      .form-section,
      .coordination-form {
        display: grid;
        gap: 0.42rem;
      }

      .coordination-workspace {
        gap: 1rem;
      }

      .coordination-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.56fr) minmax(21rem, 0.78fr);
        gap: 1rem 1.15rem;
        align-items: start;
      }

      .coordination-main {
        gap: 1rem;
      }

      .coordination-rail {
        gap: 0.9rem;
      }

      .story-panel,
      .rail-panel {
        padding: 1.28rem 1.34rem 1.24rem;
        border-radius: 30px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(242, 244, 247, 0.88));
        box-shadow: 0 18px 36px rgba(10, 17, 40, 0.04);
      }

      .story-panel--intervention {
        background:
          radial-gradient(circle at top right, rgba(255, 222, 165, 0.14), transparent 26%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(242, 244, 247, 0.9));
      }

      .story-panel--actions {
        background: linear-gradient(180deg, rgba(248, 249, 252, 0.98), rgba(240, 243, 248, 0.9));
      }

      .story-panel--suite,
      .rail-panel {
        background: linear-gradient(180deg, rgba(243, 245, 248, 0.92), rgba(248, 249, 252, 0.88));
        box-shadow: none;
      }

      .story-head,
      .rail-head,
      .story-actions,
      .section-head,
      .inline-actions,
      .referent-suggestion {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.9rem;
        flex-wrap: wrap;
      }

      .section-head--compact {
        gap: 0.5rem;
      }

      .story-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .story-copy h4 {
        margin: 0;
        font-family: var(--cfm-font-display);
        font-size: clamp(1.55rem, 2vw, 2rem);
        line-height: 1;
        letter-spacing: -0.03em;
      }

      .story-copy p,
      .story-copy span,
      .story-row-copy span,
      .story-highlight span,
      .section-copy span,
      .compact-list li,
      .rail-list li span,
      .story-empty p,
      .panel-note {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.55;
      }

      .story-highlight {
        padding: 1rem 1.05rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.56);
      }

      .story-highlight--quiet {
        background: rgba(255, 255, 255, 0.44);
      }

      .story-highlight strong,
      .story-row-copy strong,
      .story-block h5,
      .section-copy strong,
      .rail-list strong,
      .story-empty strong {
        color: var(--cfm-color-ink);
      }

      .story-highlight strong {
        font-weight: var(--cfm-font-weight-semibold, 600);
        font-size: 1.04rem;
      }

      .story-list,
      .compact-list,
      .rail-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .story-list {
        display: grid;
        gap: 0.62rem;
      }

      .story-list li {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.85rem;
        padding: 0.88rem 0.94rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.46);
      }

      .story-split {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .story-block {
        padding: 0.12rem 0;
      }

      .story-block h5 {
        margin: 0 0 0.18rem;
        font-size: 0.92rem;
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .rail-list {
        display: grid;
        gap: 0.62rem;
      }

      .rail-list li,
      .compact-list li {
        padding: 0.82rem 0.88rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.4);
      }

      .compact-list--members {
        gap: 0.45rem;
      }

      .coordination-form {
        gap: 1rem;
      }

      .form-section {
        gap: 0.75rem;
        padding-top: 0.15rem;
      }

      .form-section + .form-section {
        padding-top: 1rem;
        border-top: 1px solid rgba(15, 22, 48, 0.06);
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.72rem;
      }

      .compact-field {
        display: grid;
        gap: 0.24rem;
        padding: 0.78rem 0.86rem 0.58rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.58);
      }

      .compact-field--comment {
        align-content: start;
      }

      .compact-field select,
      .compact-field input,
      .compact-field textarea {
        width: 100%;
        padding-top: 0.52rem;
      }

      .compact-field textarea {
        resize: vertical;
        min-height: 6.4rem;
      }

      .compact-note,
      .action-callout {
        padding: 0.95rem 1rem;
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.5);
      }

      .compact-note {
        display: grid;
        gap: 0.34rem;
      }

      .compact-note--highlight {
        background: color-mix(in srgb, var(--cfm-color-primary-soft) 72%, white);
      }

      .inline-actions {
        align-items: center;
      }

      .action-callout {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.9rem;
        flex-wrap: wrap;
      }

      .story-actions--rail {
        justify-content: flex-start;
      }

      .story-empty {
        padding: 0.9rem 0;
      }

      .story-empty--compact {
        padding: 0.15rem 0 0;
      }

      @media (max-width: 1180px) {
        .coordination-stage,
        .story-split,
        .form-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .story-head,
        .rail-head,
        .story-list li,
        .action-callout {
          display: grid;
        }

        .story-panel,
        .rail-panel {
          padding: 1.1rem 1.05rem 1.04rem;
          border-radius: 24px;
        }
      }
    `,
  ],
})
export class DesktopWorksiteCoordinationPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recentlyAddedMemberSubject = new BehaviorSubject<RecentlyAddedMember | null>(null);
  private readonly worksiteId$ = this.route.paramMap.pipe(map((params) => params.get("worksiteId")));
  readonly detail$ = this.facade.detail$(this.worksiteId$);

  readonly form = new FormGroup({
    status: new FormControl<"todo" | "in_progress" | "done">("todo", { nonNullable: true }),
    teamId: new FormControl("", { nonNullable: true }),
    assigneeUserId: new FormControl("", { nonNullable: true }),
    memberUserIdToAdd: new FormControl("", { nonNullable: true }),
    commentText: new FormControl("", { nonNullable: true }),
    interventionId: new FormControl("", { nonNullable: true }),
    interventionType: new FormControl<"preparation" | "visit" | "team_intervention" | "delivery" | "verification" | "handover">(
      "team_intervention",
      { nonNullable: true },
    ),
    interventionScheduledFor: new FormControl("", { nonNullable: true }),
    interventionNotes: new FormControl("", { nonNullable: true }),
    interventionCompletedAt: new FormControl("", { nonNullable: true }),
    interventionResult: new FormControl<"completed" | "partial" | "blocked" | "postponed">("completed", { nonNullable: true }),
    interventionReportComment: new FormControl("", { nonNullable: true }),
    interventionFollowUpNote: new FormControl("", { nonNullable: true }),
  });

  readonly interventionTypeOptions = [
    { value: "preparation", label: "Préparation" },
    { value: "visit", label: "Visite / contrôle" },
    { value: "team_intervention", label: "Intervention équipe" },
    { value: "delivery", label: "Livraison" },
    { value: "verification", label: "Vérification" },
    { value: "handover", label: "Remise / clôture" },
  ] as const;

  readonly interventionResultOptions = [
    { value: "completed", label: "Réalisée" },
    { value: "partial", label: "Partielle" },
    { value: "blocked", label: "Bloquée" },
    { value: "postponed", label: "Reportée" },
  ] as const;

  readonly availableAssignees$ = combineLatest([
    this.facade.assignees$,
    this.facade.teams$,
    this.form.controls.teamId.valueChanges.pipe(
      startWith(this.form.controls.teamId.value),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([assignees, teams, teamId]) => {
      if (!teamId) {
        return [];
      }
      const selectedTeam = teams.find((team) => team.id === teamId);
      if (!selectedTeam) {
        return [];
      }
      const memberIds = new Set(selectedTeam.members.map((member) => member.user_id));
      return assignees.filter((assignee) => memberIds.has(assignee.user_id));
    }),
  );

  readonly availableMembersToAdd$ = combineLatest([
    this.facade.assignees$,
    this.facade.teams$,
    this.form.controls.teamId.valueChanges.pipe(
      startWith(this.form.controls.teamId.value),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([assignees, teams, teamId]) => {
      if (!teamId) {
        return [];
      }
      const selectedTeam = teams.find((team) => team.id === teamId);
      if (!selectedTeam) {
        return [];
      }
      const memberIds = new Set(selectedTeam.members.map((member) => member.user_id));
      return assignees.filter((assignee) => !memberIds.has(assignee.user_id));
    }),
  );

  readonly referentSuggestion$ = combineLatest([
    this.detail$,
    this.recentlyAddedMemberSubject,
    this.form.controls.teamId.valueChanges.pipe(
      startWith(this.form.controls.teamId.value),
      distinctUntilChanged(),
    ),
    this.form.controls.assigneeUserId.valueChanges.pipe(
      startWith(this.form.controls.assigneeUserId.value),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([detail, recentlyAddedMember, selectedTeamId, assigneeUserId]) => {
      if (!detail || !recentlyAddedMember || detail.coordination.assigneeUserId) {
        return null;
      }
      const effectiveTeamId = selectedTeamId || detail.coordination.teamId || "";
      if (!effectiveTeamId || recentlyAddedMember.teamId !== effectiveTeamId) {
        return null;
      }
      if (assigneeUserId !== recentlyAddedMember.userId) {
        return null;
      }
      return recentlyAddedMember;
    }),
  );

  readonly vm$ = combineLatest([this.detail$, this.facade.canActOnChantiers$]).pipe(
    map(([detail, canManage]) => {
      if (!detail) {
        return null;
      }

      const hasAssignee = detail.coordination.assigneeUserId.length > 0;
      const hasTeam = detail.coordination.teamId !== null;
      const hasComment = detail.coordination.commentText.trim().length > 0;
      const teamPartial = detail.coordination.coverageLabel === "Équipe partielle";
      const planningOverdue = detail.planning.statusLabel === "En retard";
      const planningToSchedule = detail.planning.statusLabel === "À planifier";
      const planningApproaching = detail.planning.statusLabel === "Intervention proche";
      const planningBlocked = detail.planning.statusLabel === "Bloquée";
      const planningNeedsReplan = detail.planning.statusLabel === "À reprogrammer";
      const planningFollowUp = detail.planning.statusLabel === "Suite requise";

      let nextStepLabel = "Ouvrir l’aperçu chantier";
      let nextStepRoute = `/app/chantiers/${detail.id}/apercu`;
      let attentionLabel = "Coordination cadrée";
      let attentionTone: CfmTone = "success";

      if (detail.blockingItems.length > 0) {
        nextStepLabel = detail.primaryActionLabel;
        nextStepRoute = detail.primaryActionRoute;
        attentionLabel = "Blocage à lever";
        attentionTone = "danger";
      } else if (!hasTeam) {
        nextStepLabel = "Affecter une équipe";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Équipe manquante";
        attentionTone = "warning";
      } else if (!hasAssignee) {
        nextStepLabel = "Définir le référent";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Référent manquant";
        attentionTone = "warning";
      } else if (teamPartial) {
        nextStepLabel = "Compléter l'équipe";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Équipe à compléter";
        attentionTone = "warning";
      } else if (planningBlocked) {
        nextStepLabel = "Lever le blocage";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Intervention bloquée";
        attentionTone = "danger";
      } else if (planningNeedsReplan) {
        nextStepLabel = "Reprogrammer l’intervention";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Intervention reportée";
        attentionTone = "warning";
      } else if (planningFollowUp) {
        nextStepLabel = "Prévoir la suite";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Suite d’intervention";
        attentionTone = "warning";
      } else if (planningOverdue) {
        nextStepLabel = "Reprogrammer l’intervention";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Intervention en retard";
        attentionTone = "danger";
      } else if (planningToSchedule) {
        nextStepLabel = "Planifier l’intervention";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Intervention à planifier";
        attentionTone = "warning";
      } else if (planningApproaching) {
        nextStepLabel = "Préparer l’intervention";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Intervention proche";
        attentionTone = "progress";
      } else if (detail.coordination.status === "todo") {
        nextStepLabel = "Lancer la coordination";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Point à démarrer";
        attentionTone = "warning";
      } else if (detail.coordination.status === "in_progress" && !hasComment) {
        nextStepLabel = "Poser un commentaire utile";
        nextStepRoute = `/app/chantiers/${detail.id}/coordination`;
        attentionLabel = "Commentaire attendu";
        attentionTone = "progress";
      } else if (detail.coordination.status === "in_progress") {
        nextStepLabel = "Vérifier preuves et suite";
        nextStepRoute = `/app/chantiers/${detail.id}/preuves`;
        attentionLabel = "Suivi en cours";
        attentionTone = "progress";
      } else if (detail.coordination.status === "done") {
        nextStepLabel = "Vérifier la clôture";
        nextStepRoute = `/app/chantiers/${detail.id}/apercu`;
        attentionLabel = "Coordination clôturée";
        attentionTone = "success";
      }

      return {
        detail,
        canManage: canManage && detail.isPersisted,
        nextStepLabel,
        nextStepRoute,
        nextStepIsCurrent: nextStepRoute.endsWith("/coordination"),
        attentionLabel,
        attentionTone,
        currentNeeds: [
          ...detail.coordination.missingItems,
          ...detail.planning.missingItems,
          detail.coordination.status === "todo" ? "Coordination à lancer" : null,
          detail.coordination.status === "in_progress" && !hasComment ? "Commentaire utile à poser" : null,
        ].filter((item, index, items): item is string => item !== null && items.indexOf(item) === index),
        canCompleteTeam: hasTeam && detail.coordination.coverageLabel !== "Équipe prête",
        historyEntries: this.buildHistoryEntries(detail),
      } satisfies CoordinationWorkspaceVm;
    }),
  );

  constructor() {
    this.availableAssignees$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((assignees) => {
        const assigneeUserId = this.form.controls.assigneeUserId.value;
        if (!assigneeUserId) {
          return;
        }
        if (!assignees.some((assignee) => assignee.user_id === assigneeUserId)) {
          this.form.controls.assigneeUserId.setValue("");
        }
      });

    this.availableMembersToAdd$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((members) => {
        const memberUserIdToAdd = this.form.controls.memberUserIdToAdd.value;
        if (!memberUserIdToAdd) {
          return;
        }
        if (!members.some((member) => member.user_id === memberUserIdToAdd)) {
          this.form.controls.memberUserIdToAdd.setValue("");
        }
      });

    this.form.controls.teamId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((teamId) => {
        const recentlyAddedMember = this.recentlyAddedMemberSubject.value;
        if (recentlyAddedMember && teamId !== recentlyAddedMember.teamId) {
          this.recentlyAddedMemberSubject.next(null);
        }
      });

    this.detail$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((detail) => {
        if (!detail) {
          return;
        }
        this.form.patchValue({
          status: detail.coordination.status,
          teamId: detail.coordination.teamId ?? "",
          assigneeUserId: detail.coordination.assigneeUserId,
          memberUserIdToAdd: "",
          commentText: detail.coordination.commentText,
          interventionId: this.getActiveIntervention(detail)?.id ?? "",
          interventionType: this.getActiveIntervention(detail)?.raw.intervention_type ?? "team_intervention",
          interventionScheduledFor: this.toDateTimeLocalValue(this.getActiveIntervention(detail)?.raw.scheduled_for ?? null),
          interventionNotes: this.getActiveIntervention(detail)?.raw.notes ?? "",
          interventionCompletedAt: this.toDateTimeLocalValue(this.getActiveIntervention(detail)?.raw.completed_at ?? null),
          interventionResult: this.getActiveIntervention(detail)?.raw.result ?? "completed",
          interventionReportComment: this.getActiveIntervention(detail)?.raw.report_comment ?? "",
          interventionFollowUpNote: this.getActiveIntervention(detail)?.raw.follow_up_note ?? "",
        });
        if (detail.coordination.assigneeUserId) {
          this.recentlyAddedMemberSubject.next(null);
        }
      });
  }

  async save(worksiteId: string): Promise<void> {
    const value = this.form.getRawValue();
    await this.facade.updateCoordination(worksiteId, {
      status: value.status,
      team_id: value.teamId || null,
      assignee_user_id: value.assigneeUserId || null,
      comment_text: value.commentText.trim() || null,
    });
  }

  async addMemberToTeam(): Promise<void> {
    const teamId = this.form.controls.teamId.value;
    const userId = this.form.controls.memberUserIdToAdd.value;
    if (!teamId || !userId) {
      return;
    }
    const candidates = await firstValueFrom(this.availableMembersToAdd$);
    const selectedCandidate = candidates.find((candidate) => candidate.user_id === userId) ?? null;
    const referentWasMissing = !this.form.controls.assigneeUserId.value;
    await this.facade.addMemberToTeam(teamId, { user_id: userId });
    this.form.controls.memberUserIdToAdd.setValue("");
    if (selectedCandidate && referentWasMissing) {
      this.recentlyAddedMemberSubject.next({
        userId: selectedCandidate.user_id,
        displayName: selectedCandidate.display_name,
        teamId,
      });
      this.form.controls.assigneeUserId.setValue(selectedCandidate.user_id);
      return;
    }
    this.recentlyAddedMemberSubject.next(null);
  }

  async confirmSuggestedReferent(worksiteId: string): Promise<void> {
    const recentlyAddedMember = this.recentlyAddedMemberSubject.value;
    if (!recentlyAddedMember || this.form.controls.assigneeUserId.value !== recentlyAddedMember.userId) {
      return;
    }
    await this.save(worksiteId);
  }

  async saveIntervention(worksiteId: string): Promise<void> {
    const value = this.form.getRawValue();
    const payload = {
      intervention_type: value.interventionType,
      status: value.interventionScheduledFor ? "planned" : "to_schedule",
      scheduled_for: this.fromDateTimeLocalValue(value.interventionScheduledFor),
      team_id: value.teamId || null,
      assignee_user_id: value.assigneeUserId || null,
      notes: value.interventionNotes.trim() || null,
      completed_at: null,
      result: null,
      report_comment: null,
      follow_up_note: null,
    } as const;

    if (value.interventionId) {
      await this.facade.updateIntervention(value.interventionId, payload);
      return;
    }

    await this.facade.createIntervention(worksiteId, payload);
  }

  async saveInterventionResult(interventionId: string): Promise<void> {
    const value = this.form.getRawValue();
    await this.facade.updateIntervention(interventionId, {
      status: "done",
      completed_at: this.fromDateTimeLocalValue(value.interventionCompletedAt),
      result: value.interventionResult,
      report_comment: value.interventionReportComment.trim() || null,
      follow_up_note: value.interventionFollowUpNote.trim() || null,
    });
  }

  trackByHistoryEntry(_index: number, item: CoordinationHistoryEntry): string {
    return item.id;
  }

  private buildHistoryEntries(detail: DesktopWorksiteDetailVm): CoordinationHistoryEntry[] {
    const entries: CoordinationHistoryEntry[] = [];

    if (detail.coordination.updatedAtLabel) {
      entries.push({
        id: `${detail.id}-coordination`,
        eyebrow: "Dernier cadrage",
        title: detail.coordination.statusLabel,
        detail: detail.coordination.updatedAtLabel,
        support: detail.coordination.commentText.trim() || detail.coordination.coverageDetail,
        statusLabel: detail.coordination.coverageLabel,
        tone: detail.coordination.coverageTone,
      });
    }

    if (detail.planning.lastInterventionLabel) {
      entries.push({
        id: `${detail.id}-last-intervention`,
        eyebrow: "Dernière intervention",
        title: detail.planning.lastInterventionLabel,
        detail: `${detail.planning.lastInterventionTimingLabel ?? "Date à préciser"} · ${detail.planning.lastInterventionResultLabel ?? "Sans résultat saisi"}`,
        support: detail.planning.lastInterventionFollowUp || detail.planning.lastInterventionDetail,
        statusLabel: detail.planning.lastInterventionResultLabel,
        tone: detail.planning.lastInterventionResultTone,
      });
    }

    if (entries.length === 0) {
      entries.push({
        id: `${detail.id}-next-intervention`,
        eyebrow: "À venir",
        title: detail.planning.nextInterventionLabel,
        detail: `${detail.planning.nextInterventionStatusLabel} · ${detail.planning.nextInterventionTimingLabel}`,
        support: detail.planning.nextInterventionDetail,
        statusLabel: detail.planning.nextInterventionStatusLabel,
        tone: detail.planning.nextInterventionStatusTone,
      });
    }

    return entries;
  }

  private getActiveIntervention(detail: DesktopWorksiteDetailVm): DesktopWorksiteDetailVm["interventions"][number] | null {
    return detail.interventions.find((item) => !item.isDone && !item.isCanceled) ?? null;
  }

  private toDateTimeLocalValue(value: string | null): string {
    if (!value) {
      return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private fromDateTimeLocalValue(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const date = new Date(trimmed);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  }
}
