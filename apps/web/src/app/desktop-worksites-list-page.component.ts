import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CfmButtonComponent, CfmRegisterTemplateComponent, CfmStatusChipComponent } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith } from "rxjs";

import { DesktopWorksitesFacade } from "./desktop-worksites.facade";
import type { DesktopWorksiteListItem } from "./desktop-worksites.models";

@Component({
  selector: "cfm-desktop-worksites-list-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmRegisterTemplateComponent,
    CfmStatusChipComponent,
  ],
  template: `
    <section class="worksite-workspace" *ngIf="vm$ | async as vm">
      <cfm-register-template class="worksite-stage">
      <form cfmRegisterLead class="worksite-command-bar cfm-editorial-hero cfm-editorial-hero--calm" [formGroup]="filterForm">
        <div class="command-title">
          <span class="command-kicker">Chantiers</span>
          <h3 class="page-title">Registre chantiers</h3>
          <p class="command-lead">
            Un registre chantier plus éditorial, conçu pour lire vite le signal, l’action et la fiche métier.
          </p>
          <div class="command-meta cfm-pill-row" *ngIf="facade.moduleSummary$ | async as summary">
            <span class="meta-pill">{{ summary.totalLabel }}</span>
            <span class="meta-pill meta-pill--danger">{{ summary.blockedLabel }}</span>
            <span class="meta-pill meta-pill--warning">{{ summary.nowLabel }}</span>
            <span class="meta-pill meta-pill--progress">{{ summary.watchLabel }}</span>
          </div>
        </div>

        <div class="command-filters">
          <label class="compact-field compact-field--search">
            <span class="small">Recherche</span>
            <input type="text" formControlName="search" placeholder="Nom, site ou action utile" />
          </label>

          <label class="compact-field compact-field--status">
            <span class="small">Statut</span>
            <select formControlName="status">
              <option value="all">Tous</option>
              <option *ngFor="let option of facade.worksiteStatusOptions" [value]="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <label class="compact-field compact-field--site">
            <span class="small">Site</span>
            <select formControlName="siteId">
              <option value="all">Tous</option>
              <option *ngFor="let site of facade.sites$ | async" [value]="site.id">{{ site.name }}</option>
            </select>
          </label>

          <div class="toolbar-actions" *ngIf="facade.canActOnChantiers">
            <cfm-button type="button" size="sm" routerLink="/app/chantiers/nouveau">
              Nouveau chantier
            </cfm-button>
          </div>
        </div>
      </form>

        <section cfmRegisterMain class="register-pane cfm-tonal-panel cfm-tonal-panel--quiet cfm-tonal-panel--flat">
          <section class="register-intro">
            <div class="panel-copy">
              <span class="register-kicker">Registre premium</span>
              <h4 class="panel-title">Chantiers à suivre</h4>
              <span class="small">Signal, prochaine action et intervention à venir, sans grille froide.</span>
            </div>
            <cfm-status-chip [label]="vm.items.length + ' chantier' + (vm.items.length > 1 ? 's' : '')" tone="neutral" />
          </section>

          <div class="register-head" *ngIf="vm.items.length > 0">
            <span>Chantier</span>
            <span>Site</span>
            <span>Statut</span>
            <span>Signal</span>
            <span>Prochaine action</span>
          </div>

          <ng-container *ngIf="vm.items.length > 0; else emptyList">
            <button
              *ngFor="let item of vm.items; trackBy: trackByWorksite"
              type="button"
              class="register-row"
              [class.is-selected]="vm.selected?.id === item.id"
              (click)="selectWorksite(item.id)"
            >
              <div class="register-cell register-cell--worksite">
                <strong class="record-primary worksite-name">{{ item.name }}</strong>
                <span class="record-meta timestamp">{{ item.temporalLabel }}</span>
              </div>

              <div class="register-cell register-cell--site">
                <strong class="detail-copy">{{ item.siteName || "Site à relier" }}</strong>
                <span class="record-meta subline">{{ item.summary }}</span>
              </div>

              <div class="register-cell register-cell--status">
                <cfm-status-chip [label]="item.statusLabel" [tone]="item.statusTone" />
                <span class="record-meta subline">{{ item.planningLabel }} · {{ item.completionLabel }}</span>
              </div>

              <div
                class="register-cell register-cell--signal"
                [attr.title]="item.primarySignalLabel + '\n' + item.primarySignalDetail"
              >
                <strong class="detail-copy">{{ item.primarySignalLabel }}</strong>
                <span class="record-meta subline">{{ item.nextInterventionLabel }}</span>
              </div>

              <div
                class="register-cell register-cell--action"
                [attr.title]="item.nextActionLabel + '\n' + item.nextActionDetail"
              >
                <strong class="detail-copy">{{ item.nextActionLabel }}</strong>
                <span class="record-meta subline">{{ item.nextInterventionDetail }}</span>
              </div>
            </button>
          </ng-container>
        </section>

        <aside cfmRegisterDetail class="worksite-sheet cfm-tonal-panel cfm-tonal-panel--muted cfm-tonal-panel--flat">
          <ng-container *ngIf="vm.detail as worksite; else emptyDetail">
            <section class="sheet-hero cfm-editorial-hero cfm-editorial-hero--calm">
              <header class="sheet-header">
                <div class="sheet-title">
                  <span class="sheet-number">Chantier</span>
                  <h4 class="panel-title">{{ worksite.name }}</h4>
                  <p class="sheet-lead">{{ worksite.summary }}</p>
                  <div class="chips cfm-pill-row">
                  <cfm-status-chip class="status-chip" [label]="worksite.statusLabel" [tone]="worksite.statusTone" />
                  <cfm-status-chip class="status-chip" [label]="worksite.globalStateLabel" [tone]="worksite.globalStateTone" />
                  <cfm-status-chip class="status-chip" [label]="worksite.closure.statusLabel" [tone]="worksite.closure.statusTone" />
                  <cfm-status-chip class="status-chip" *ngIf="worksite.siteName" [label]="worksite.siteName" tone="calm" />
                </div>
                </div>

                <div class="toolbar-actions">
                  <cfm-button
                    *ngIf="worksite.closure.canClose && facade.canActOnChantiers"
                    type="button"
                    size="sm"
                    [disabled]="facade.saving$ | async"
                    (click)="closeWorksite(worksite.id)"
                  >
                    {{ (facade.saving$ | async) ? "Clôture..." : "Clôturer le chantier" }}
                  </cfm-button>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'apercu']">
                    Ouvrir la fiche
                  </cfm-button>
                  <cfm-button type="button" size="sm" [routerLink]="worksite.primaryActionRoute">
                    {{ worksite.primaryActionLabel }}
                  </cfm-button>
                </div>
              </header>

              <div class="sheet-summary sheet-summary--hero detail-copy">
                <strong>{{ worksite.primarySignalLabel }}</strong>
                <span>{{ worksite.primarySignalDetail }}</span>
                <span>{{ worksite.primaryActionLabel }} · {{ worksite.primaryActionDetail }}</span>
              </div>

            </section>

            <section class="sheet-card">
              <div class="sheet-card-head">
                <h5 class="section-title">Prochaine intervention</h5>
                <cfm-status-chip class="status-chip" [label]="worksite.planning.statusLabel" [tone]="worksite.planning.statusTone" />
              </div>

              <div class="sheet-summary detail-copy">
                <strong>{{ worksite.planning.nextInterventionLabel }}</strong>
                <span>{{ worksite.planning.nextInterventionStatusLabel }} · {{ worksite.planning.nextInterventionTimingLabel }}</span>
                <span>{{ worksite.planning.nextInterventionAssigneeLabel }}</span>
                <span>{{ worksite.planning.nextInterventionDetail }}</span>
              </div>

              <div class="sheet-summary detail-copy" *ngIf="worksite.planning.lastInterventionLabel">
                <strong>Dernière intervention : {{ worksite.planning.lastInterventionLabel }}</strong>
                <span *ngIf="worksite.planning.lastInterventionResultLabel">
                  {{ worksite.planning.lastInterventionResultLabel }} · {{ worksite.planning.lastInterventionTimingLabel || "Date réelle non précisée" }}
                </span>
                <span *ngIf="worksite.planning.lastInterventionDetail">{{ worksite.planning.lastInterventionDetail }}</span>
                <span *ngIf="worksite.planning.lastInterventionFollowUp">{{ worksite.planning.lastInterventionFollowUp }}</span>
              </div>

              <div class="toolbar-actions">
                <cfm-button type="button" size="sm" [routerLink]="worksite.planning.nextActionRoute">
                  {{ worksite.planning.nextActionLabel }}
                </cfm-button>
                <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                  Coordination
                </cfm-button>
              </div>
            </section>

            <section class="sheet-card">
              <div class="sheet-card-head">
                <h5 class="section-title">Ce qui manque</h5>
              </div>

              <div class="state-columns state-columns--quad">
                <section class="state-sheet state-sheet--danger">
                  <div class="state-head">
                    <strong>Bloque maintenant</strong>
                  </div>

                  <ul class="compact-list" *ngIf="worksite.blockingItems.length > 0; else noBlockingItems">
                    <li *ngFor="let item of worksite.blockingItems">{{ item }}</li>
                  </ul>
                </section>

                <section class="state-sheet state-sheet--warning">
                  <div class="state-head">
                    <strong>Priorité immédiate</strong>
                  </div>

                  <ul class="compact-list" *ngIf="worksite.actionItems.length > 0; else noActionItems">
                    <li *ngFor="let item of worksite.actionItems">{{ item }}</li>
                  </ul>
                </section>

                <section class="state-sheet state-sheet--progress">
                  <div class="state-head">
                    <strong>À vérifier</strong>
                  </div>

                  <ul class="compact-list" *ngIf="worksite.watchItems.length > 0; else noWatchItems">
                    <li *ngFor="let item of worksite.watchItems">{{ item }}</li>
                  </ul>
                </section>
              </div>
            </section>

            <section class="sheet-card sheet-card--closure">
              <div class="sheet-card-head">
                <h5 class="section-title">Avant remise</h5>
                <cfm-status-chip class="status-chip" [label]="worksite.closure.statusLabel" [tone]="worksite.closure.statusTone" />
              </div>

              <div class="sheet-summary detail-copy">
                <strong>{{ worksite.closure.summary }}</strong>
                <span>
                  {{ worksite.closure.missingItems.length > 0 ? worksite.closure.missingItems.length + ' point' + (worksite.closure.missingItems.length > 1 ? 's' : '') + ' à compléter' : 'Tout est prêt pour la remise.' }}
                </span>
              </div>

              <div class="state-columns">
                <section class="state-sheet state-sheet--warning">
                  <div class="state-head">
                    <strong>À compléter</strong>
                  </div>

                  <ul class="compact-list" *ngIf="worksite.closure.missingItems.length > 0; else noClosureMissingItems">
                    <li *ngFor="let item of worksite.closure.missingItems">{{ item }}</li>
                  </ul>
                </section>

                <section class="state-sheet state-sheet--success">
                  <div class="state-head">
                    <strong>Déjà prêt</strong>
                  </div>

                  <ul class="compact-list" *ngIf="worksite.closure.readyItems.length > 0; else noClosureReadyItems">
                    <li *ngFor="let item of worksite.closure.readyItems">{{ item }}</li>
                  </ul>
                </section>
              </div>

              <div class="toolbar-actions">
                <cfm-button
                  *ngIf="worksite.closure.canClose && facade.canActOnChantiers"
                  type="button"
                  size="sm"
                  [disabled]="facade.saving$ | async"
                  (click)="closeWorksite(worksite.id)"
                >
                  {{ (facade.saving$ | async) ? "Clôture..." : "Clôturer le chantier" }}
                </cfm-button>
                <cfm-button
                  *ngIf="!worksite.closure.canClose"
                  type="button"
                  size="sm"
                  [routerLink]="worksite.closure.nextActionRoute"
                >
                  {{ worksite.closure.nextActionLabel }}
                </cfm-button>
                <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'dossier']">
                  Ouvrir le dossier
                </cfm-button>
              </div>
            </section>

            <section class="sheet-card">
              <div class="sheet-card-head">
                <h5 class="section-title">Où aller ensuite</h5>
              </div>

              <ul class="sheet-list">
                <li>
                  <div class="sheet-list-copy linked-context">
                    <strong>Documents</strong>
                    <span>{{ worksite.documentsCountLabel }}</span>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'documents']">
                    Ouvrir
                  </cfm-button>
                </li>
                <li>
                  <div class="sheet-list-copy linked-context">
                    <strong>Preuves</strong>
                    <span>{{ worksite.proofsCountLabel }} · {{ worksite.signaturesCountLabel }}</span>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'preuves']">
                    Ouvrir
                  </cfm-button>
                </li>
                <li>
                  <div class="sheet-list-copy linked-context">
                    <strong>Coordination</strong>
                    <span>{{ worksite.coordination.coverageLabel }} · {{ worksite.coordination.assigneeLabel }}</span>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'coordination']">
                    Ouvrir
                  </cfm-button>
                </li>
                <li>
                  <div class="sheet-list-copy linked-context">
                    <strong>Équipements</strong>
                    <span>{{ worksite.equipmentSummary.totalLabel }} · {{ worksite.equipmentSummary.attentionLabel }}</span>
                  </div>
                  <cfm-button type="button" variant="secondary" size="sm" [routerLink]="['/app/chantiers', worksite.id, 'equipements']">
                    Ouvrir
                  </cfm-button>
                </li>
              </ul>
            </section>
          </ng-container>
        </aside>
      </cfm-register-template>
    </section>

    <ng-template #emptyList>
      <section class="compact-empty">
        <strong>Aucun chantier visible</strong>
        <p>Créez un chantier ou ajustez les filtres pour alimenter le registre.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section class="compact-empty compact-empty--detail">
        <strong>Aucun chantier sélectionné</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir la feuille chantier.</p>
      </section>
    </ng-template>

    <ng-template #noBlockingItems>
      <ul class="compact-list">
        <li>Aucun blocage terrain visible.</li>
      </ul>
    </ng-template>

    <ng-template #noWatchItems>
      <ul class="compact-list">
        <li>Aucun point sensible à vérifier.</li>
      </ul>
    </ng-template>

    <ng-template #noActionItems>
      <ul class="compact-list">
        <li>Aucune action rapide à lancer.</li>
      </ul>
    </ng-template>

    <ng-template #noAvailableItems>
      <ul class="compact-list">
        <li>Les repères prêts apparaîtront ici.</li>
      </ul>
    </ng-template>

    <ng-template #noClosureMissingItems>
      <ul class="compact-list">
        <li>Aucun point de clôture ne bloque encore la remise.</li>
      </ul>
    </ng-template>

    <ng-template #noClosureReadyItems>
      <ul class="compact-list">
        <li>Les éléments prêts apparaîtront ici.</li>
      </ul>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .worksite-workspace,
      .command-title,
      .panel-copy,
      .sheet-title,
      .sheet-ribbon-cell,
      .sheet-card,
      .sheet-summary,
      .state-head,
      .state-sheet,
      .info-line,
      .sheet-list-copy,
      .register-cell,
      .compact-empty {
        display: grid;
        gap: 0.32rem;
      }

      .worksite-workspace {
        gap: 0.78rem;
      }

      .command-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .command-title h3,
      .sheet-title h4,
      .sheet-card-head h5 {
        margin: 0;
        color: var(--cfm-color-ink);
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      .worksite-command-bar {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(20rem, 0.9fr);
        gap: 0.9rem 1rem;
        align-items: start;
      }

      .command-title {
        min-width: 15rem;
        gap: 0.32rem;
      }

      .command-lead,
      .sheet-lead,
      .panel-copy span,
      .compact-empty p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        line-height: 1.48;
      }

      .command-meta,
      .command-filters,
      .toolbar-actions,
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
      }

      .command-filters {
        justify-content: flex-end;
        align-content: start;
        gap: 0.65rem;
      }

      .compact-field {
        display: grid;
        gap: 0.25rem;
        min-width: 9rem;
        padding: 0.7rem 0.82rem 0.5rem;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.58);
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 62%, white);
        outline-offset: -1px;
      }

      .compact-field--search {
        min-width: min(22rem, 100%);
        flex: 1 1 18rem;
      }

      .compact-field input,
      .compact-field select {
        padding-top: 0.5rem;
      }

      .worksite-stage {
        gap: 0.82rem;
      }

      .register-pane,
      .worksite-sheet {
        min-height: 32rem;
        padding: 0.92rem 0.96rem 0.96rem 1.02rem;
      }

      .register-pane {
        display: grid;
        gap: 0.7rem;
        align-content: start;
      }

      .worksite-sheet {
        display: grid;
        gap: 0.72rem;
        align-content: start;
      }

      .register-intro {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.65rem;
      }

      .register-kicker {
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .register-head {
        display: grid;
        grid-template-columns: minmax(9rem, 1.08fr) minmax(8rem, 1fr) auto minmax(8rem, 0.86fr) minmax(9rem, 0.96fr);
        gap: 0.8rem;
        padding: 0.1rem 0.2rem 0;
        font-size: 0.68rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .register-row {
        position: relative;
        display: grid;
        grid-template-columns: minmax(9rem, 1.08fr) minmax(8rem, 1fr) auto minmax(8rem, 0.86fr) minmax(9rem, 0.96fr);
        gap: 0.8rem;
        align-items: center;
        width: 100%;
        margin-top: 0.38rem;
        padding: 0.94rem 0.92rem 0.92rem 0.98rem;
        border: none;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.52);
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 58%, white);
        outline-offset: -1px;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          transform 160ms ease,
          background-color 160ms ease;
      }

      .register-row::before {
        content: none;
      }

      .register-row:hover {
        background: rgba(255, 255, 255, 0.66);
      }

      .register-row.is-selected {
        background: linear-gradient(180deg, rgba(244, 247, 252, 0.98), rgba(255, 255, 255, 0.86));
        outline-color: color-mix(in srgb, var(--cfm-color-primary-soft) 36%, white);
      }

      .register-row.is-selected::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.9rem;
        bottom: 0.9rem;
        width: 2px;
        border-radius: 999px;
        background: var(--cfm-color-primary-strong);
      }

      .register-cell--status {
        justify-items: start;
      }

      .register-cell--action {
        justify-items: start;
        text-align: left;
      }

      .sheet-hero {
        display: grid;
        gap: 0.7rem;
      }

      .sheet-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .sheet-number {
        font-size: 0.74rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--cfm-color-primary-strong);
      }

      .sheet-title {
        gap: 0.4rem;
      }

      .sheet-card,
      .compact-empty {
        padding: 0.84rem 0.88rem 0.88rem 0.94rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.4);
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 54%, white);
        outline-offset: -1px;
      }

      .sheet-card {
        gap: 0.68rem;
      }

      .state-columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.58rem;
      }

      .state-columns--quad {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .state-sheet {
        padding: 0.74rem 0.78rem 0.78rem 0.84rem;
        border-radius: 16px;
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 54%, white);
        outline-offset: -1px;
        background: rgba(255, 255, 255, 0.42);
      }

      .state-sheet--danger {
        background: rgba(252, 238, 238, 0.6);
      }

      .state-sheet--warning {
        background: rgba(255, 246, 231, 0.58);
      }

      .state-sheet--progress {
        background: rgba(237, 244, 255, 0.62);
      }

      .sheet-card--closure {
        background: color-mix(in srgb, var(--cfm-color-primary-soft) 18%, white);
      }

      .state-head {
        padding-bottom: 0.15rem;
      }

      .sheet-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
      }

      .sheet-info-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.72rem 0.9rem;
      }

      .info-line {
        gap: 0.22rem;
      }

      .sheet-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.26rem;
      }

      .compact-list {
        list-style: none;
        margin: 0;
        padding: 0 0 0 1rem;
        display: grid;
        gap: 0.34rem;
      }

      .sheet-list li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 0.68rem 0.72rem 0.68rem 0.78rem;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.42);
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 48%, white);
        outline-offset: -1px;
      }

      .meta-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.24rem 0.56rem;
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.54);
        color: var(--cfm-color-primary-strong);
        white-space: nowrap;
        outline: 1px solid color-mix(in srgb, var(--cfm-color-outline-ghost) 58%, white);
        outline-offset: -1px;
        font-weight: var(--cfm-font-weight-regular, 400);
      }

      .meta-pill--warning {
        background: var(--cfm-color-warning-bg);
        color: var(--cfm-color-warning-ink);
      }

      .meta-pill--progress {
        background: var(--cfm-color-primary-soft);
        color: var(--cfm-color-primary-strong);
      }

      .meta-pill--danger {
        background: var(--cfm-color-danger-bg);
        color: var(--cfm-color-danger-ink);
      }

      .command-title p,
      .register-cell span,
      .sheet-summary span,
      .compact-list li,
      .info-line span,
      .sheet-list-copy span,
      .compact-empty p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        font-weight: var(--cfm-font-weight-regular, 400);
      }

      .register-cell strong,
      .sheet-summary strong,
      .info-line strong,
      .sheet-title h4,
      .sheet-list-copy strong,
      .compact-empty strong {
        color: var(--cfm-color-ink);
      }

      .register-cell strong,
      .info-line strong,
      .sheet-list-copy strong {
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .register-cell--worksite strong,
      .sheet-summary strong,
      .sheet-title h4,
      .compact-empty strong {
        font-weight: var(--cfm-font-weight-medium, 500);
      }

      .sheet-summary strong,
      .state-head strong,
      .sheet-title h4,
      .compact-empty strong,
      .sheet-card-head h5 {
        font-weight: var(--cfm-font-weight-semibold, 600);
      }

      @media (max-width: 1180px) {
        .worksite-command-bar,
        .sheet-ribbon,
        .state-columns,
        .sheet-info-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 860px) {
        .command-filters,
        .sheet-header,
        .register-row,
        .register-head {
          display: grid;
        }

        .register-intro,
        .sheet-list li {
          display: grid;
        }

        .register-row,
        .register-head {
          grid-template-columns: 1fr;
        }

        .compact-field {
          min-width: 0;
        }
      }
    `,
  ],
})
export class DesktopWorksitesListPageComponent {
  readonly facade = inject(DesktopWorksitesFacade);
  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    status: new FormControl<"all" | string>("all", { nonNullable: true }),
    siteId: new FormControl<"all" | string>("all", { nonNullable: true }),
  });

  private readonly selectedWorksiteId$ = new BehaviorSubject<string | null>(null);

  readonly filteredItems$ = combineLatest([
    this.facade.listItems$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([items, filters]) => {
      const search = this.toSearchableText(filters.search);
      return items.filter((item) => {
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(
            `${item.name} ${item.summary} ${item.primarySignalLabel} ${item.primarySignalDetail} ${item.issueSummaryLabel} ${item.nextActionLabel} ${item.nextActionDetail} ${item.completionLabel}`,
          ).includes(search);
        const matchesStatus =
          filters.status === "all"
          || item.statusLabel === this.facade.worksiteStatusOptions.find((option) => option.value === filters.status)?.label;
        const matchesSite = filters.siteId === "all" || item.siteId === filters.siteId;
        return matchesSearch && matchesStatus && matchesSite;
      });
    }),
  );

  readonly selectedWorksiteResolvedId$ = combineLatest([
    this.filteredItems$,
    this.selectedWorksiteId$.pipe(distinctUntilChanged()),
  ]).pipe(
    map(([items, selectedId]) => items.find((item) => item.id === selectedId)?.id ?? items[0]?.id ?? null),
    distinctUntilChanged(),
  );

  readonly vm$ = combineLatest([
    this.filteredItems$,
    this.facade.detail$(this.selectedWorksiteResolvedId$),
  ]).pipe(
    map(([items, detail]) => ({ items, selected: detail ? items.find((item) => item.id === detail.id) ?? null : null, detail })),
  );

  selectWorksite(worksiteId: string): void {
    this.selectedWorksiteId$.next(worksiteId);
  }

  async closeWorksite(worksiteId: string): Promise<void> {
    await this.facade.updateWorksiteStatus(worksiteId, "completed");
  }

  trackByWorksite(_index: number, item: DesktopWorksiteListItem): string {
    return item.id;
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
