import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import type { AuditLogRecord, BillingFollowUpStatus, QuoteRecord, QuoteStatus } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith } from "rxjs";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type QuoteAction =
  | { kind: "status"; label: string; status: QuoteStatus }
  | { kind: "follow_up"; label: string; followUpStatus: BillingFollowUpStatus }
  | { kind: "convert"; label: string }
  | { kind: "pdf"; label: string }
  | { kind: "history"; label: string };

type QuoteWorkspaceItem = {
  id: string;
  raw: QuoteRecord;
  title: string;
  flowStepLabel: string;
  flowStepTone: CfmTone;
  priorityLabel: string;
  priorityTone: CfmTone;
  statusLabel: string;
  statusTone: CfmTone;
  signalLabel: string;
  signalTone: CfmTone;
  validityLabel: string;
  amountLabel: string;
  nextActionLabel: string;
  nextActionSummary: string;
  primaryAction: QuoteAction | null;
  secondaryAction: QuoteAction | null;
  sortRank: number;
};

type QuoteViewFilter = "all" | "actionable" | "draft" | "sent" | "accepted" | "declined";
type QuoteFollowUpFilter = "all" | "followed_up" | "waiting_customer";

const QUOTE_ADVANCED_FILTER_DEFAULTS = {
  customerId: "all",
  worksiteId: "all",
  readyOnly: false,
  convertOnly: false,
  toFollowUpOnly: false,
  followUpState: "all" as QuoteFollowUpFilter,
};

@Component({
  selector: "cfm-desktop-billing-quotes-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, DesktopBillingWorkspaceShellComponent],
  template: `
    <cfm-desktop-billing-workspace-shell
      class="cfm-billing-page"
      *ngIf="vm$ | async as vm"
      [formGroup]="filterForm"
      kpiAriaLabel="Repères devis"
      registerHeadClass="billing-home-register-head--overview"
      [showRegisterHead]="vm.rows.length > 0"
      [hasSecondary]="true"
      [secondaryOpen]="secondarySection.isOpenFor(secondarySectionKey)"
    >
      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--quotes">
          <span class="small">Prêts à envoyer</span>
          <strong>{{ draftCount }}</strong>
          <span>Devis brouillon{{ draftCount > 1 ? "s" : "" }} à finaliser</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--invoices">
          <span class="small">À convertir</span>
          <strong>{{ acceptedCount }}</strong>
          <span>Devis accepté{{ acceptedCount > 1 ? "s" : "" }} prêt{{ acceptedCount > 1 ? "s" : "" }} pour facture</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--payments">
          <span class="small">À relancer</span>
          <strong>{{ followUpCount }}</strong>
          <span>Devis qui demandent un geste commercial</span>
      </article>

      <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
                <input type="text" formControlName="search" placeholder="Rechercher un devis" />
      </label>

      <div billingWorkspaceFilter class="billing-home-filter-trailing">
        <label class="billing-home-filter-chip">
                  <select formControlName="view">
                    <option value="actionable">À traiter</option>
                    <option value="all">Tous</option>
                    <option value="draft">Brouillons</option>
                    <option value="sent">Envoyés</option>
                    <option value="accepted">À convertir</option>
                    <option value="declined">Refusés</option>
                  </select>
        </label>

        <div class="billing-home-more-filters-anchor">
                  <button
                    type="button"
                    class="billing-home-more-filters"
                    [class.is-open]="filtersOpen"
                    [attr.aria-expanded]="filtersOpen"
                    (click)="toggleFiltersPopover()"
                  >
                    Plus de filtres
                  </button>

                  <section class="cfm-billing-filter-panel cfm-billing-filter-panel--floating" *ngIf="filtersOpen">
                    <div class="cfm-billing-filter-grid cfm-billing-filter-grid--two" [formGroup]="filterForm">
                      <label class="cfm-billing-filter-field">
                        <span class="small">Client</span>
                        <select formControlName="customerId">
                          <option value="all">Tous les clients</option>
                          <option *ngFor="let customer of customerFilterOptions" [value]="customer.id">
                            {{ customer.name }}
                          </option>
                        </select>
                      </label>

                      <label class="cfm-billing-filter-field">
                        <span class="small">Chantier lié</span>
                        <select formControlName="worksiteId">
                          <option value="all">Tous les chantiers</option>
                          <option value="none">Sans chantier</option>
                          <option *ngFor="let worksite of worksiteFilterOptions" [value]="worksite.id">
                            {{ worksite.name }}
                          </option>
                        </select>
                      </label>

                      <label class="cfm-billing-filter-field">
                        <span class="small">Suivi relance</span>
                        <select formControlName="followUpState">
                          <option value="all">Tous les suivis</option>
                          <option value="followed_up">Relancé</option>
                          <option value="waiting_customer">En attente client</option>
                        </select>
                      </label>
                    </div>

                    <div class="cfm-billing-filter-toggles">
                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="readyOnly" />
                        <span>Prêt à envoyer</span>
                      </label>

                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="convertOnly" />
                        <span>À convertir</span>
                      </label>

                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="toFollowUpOnly" />
                        <span>À relancer</span>
                      </label>
                    </div>

                    <div class="cfm-billing-filter-actions">
                      <button type="button" class="cfm-billing-filter-reset" (click)="resetAdvancedFilters()">
                        Réinitialiser
                      </button>
                    </div>
                  </section>
        </div>
      </div>

      <span billingWorkspaceRegisterHead>Devis</span>
      <span billingWorkspaceRegisterHead>Workflow</span>
      <span billingWorkspaceRegisterHead>Client</span>
      <span billingWorkspaceRegisterHead>Montant & repère</span>
      <span billingWorkspaceRegisterHead>Action utile</span>

      <div billingWorkspaceRegisterBody class="cfm-billing-register" *ngIf="vm.rows.length > 0; else emptyList">
        <button
          *ngFor="let row of vm.rows; trackBy: trackByQuoteRow"
          type="button"
          class="billing-home-row billing-home-row--overview"
          [class.is-selected]="vm.selected?.id === row.id"
          (click)="selectQuote(row.id)"
        >
          <div class="billing-home-row-cell billing-home-row-primary">
            <strong class="record-primary invoice-number">{{ row.raw.number }}</strong>
            <span class="record-meta">{{ row.title }}</span>
          </div>

          <div class="billing-home-row-cell billing-home-row-status">
            <span
              class="billing-home-status-pill"
              [class.is-danger]="row.statusTone === 'danger'"
              [class.is-warning]="row.statusTone === 'warning'"
              [class.is-success]="row.statusTone === 'success'"
              [class.is-accent]="row.statusTone === 'accent' || row.statusTone === 'calm' || row.statusTone === 'progress'"
            >
              {{ row.statusLabel }}
            </span>
            <span class="record-meta">{{ row.priorityLabel }} · {{ row.flowStepLabel }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ row.raw.customer_name }}</strong>
            <span class="record-meta">{{ row.raw.worksite_name || "Sans chantier" }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ row.amountLabel }}</strong>
            <span class="record-meta">Validité {{ row.validityLabel }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ row.nextActionLabel }}</strong>
            <span class="record-meta">{{ row.signalLabel }}</span>
          </div>
        </button>
      </div>

      <article billingWorkspaceRail class="billing-home-rail-card cfm-billing-sticky-card" *ngIf="vm.selected as row; else emptyDetail">
              <section class="billing-home-rail-preview">
                <header class="billing-home-rail-preview-head">
                  <span class="panel-kicker">Aperçu devis</span>
                </header>

                <div class="billing-home-rail-preview-copy">
                  <h4>{{ row.raw.number }}</h4>
                  <p>{{ row.raw.customer_name }} · {{ row.validityLabel }}</p>
                </div>

                <span
                  class="billing-home-preview-status"
                  [class.is-danger]="row.statusTone === 'danger'"
                  [class.is-warning]="row.statusTone === 'warning'"
                  [class.is-success]="row.statusTone === 'success'"
                  [class.is-accent]="row.statusTone === 'accent' || row.statusTone === 'calm' || row.statusTone === 'progress'"
                >
                  {{ row.statusLabel }}
                </span>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Action utile</span>
                  <h4 class="cfm-billing-section-title">{{ row.nextActionLabel }}</h4>
                </header>

                <div class="cfm-billing-highlight">
                  <strong>{{ row.flowStepLabel }}</strong>
                  <span>{{ row.nextActionSummary }}</span>
                </div>

                <div class="billing-home-rail-actions">
                  <cfm-button
                    type="button"
                    class="billing-home-rail-primary-button"
                    *ngIf="row.primaryAction && canRunQuoteAction(row.primaryAction)"
                    [disabled]="isActionBusy(row, row.primaryAction)"
                    (click)="runQuoteAction(row, row.primaryAction)"
                  >
                    {{ row.nextActionLabel }}
                  </cfm-button>

                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      *ngIf="row.secondaryAction && canRunQuoteAction(row.secondaryAction)"
                      [disabled]="isActionBusy(row, row.secondaryAction)"
                      (click)="runQuoteAction(row, row.secondaryAction)"
                    >
                      {{ row.secondaryAction.label }}
                    </cfm-button>
                    <cfm-button
                      *ngIf="ctx.canExportBilling && row.secondaryAction?.kind !== 'pdf'"
                      type="button"
                      variant="secondary"
                      size="sm"
                      [disabled]="ctx.quotePdfBusyId === row.id"
                      (click)="runQuoteAction(row, { kind: 'pdf', label: 'Exporter le PDF' })"
                    >
                      {{ ctx.quotePdfBusyId === row.id ? "PDF..." : "Exporter PDF" }}
                    </cfm-button>
                  </div>
                </div>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Repères clés</span>
                  <h4 class="cfm-billing-section-title">Lecture commerciale</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Client</span><strong>{{ row.raw.customer_name }}</strong></li>
                  <li><span>Chantier</span><strong>{{ row.raw.worksite_name || "Aucun" }}</strong></li>
                  <li><span>Référence</span><strong>{{ row.raw.number }}</strong></li>
                  <li><span>Validité</span><strong>{{ row.validityLabel }}</strong></li>
                  <li><span>Total</span><strong>{{ row.amountLabel }}</strong></li>
                  <li><span>Étape</span><strong>{{ row.flowStepLabel }}</strong></li>
                  <li><span>Suivi</span><strong>{{ ctx.getBillingFollowUpStatusLabel(row.raw.follow_up_status) }}</strong></li>
                </ul>
              </section>

              <section class="billing-home-rail-section billing-home-rail-section--history">
                <header class="cfm-billing-section-head">
                  <div class="cfm-billing-section-copy">
                    <span class="panel-kicker">Historique léger</span>
                    <h4 class="cfm-billing-section-title">Derniers repères</h4>
                  </div>
                  <cfm-button
                    type="button"
                    variant="ghost"
                    size="sm"
                    [disabled]="ctx.quoteHistoryBusyId === row.id"
                    (click)="runQuoteAction(row, { kind: 'history', label: ctx.quoteHistoryOpenId === row.id ? 'Masquer' : 'Charger l’historique' })"
                  >
                    {{
                      ctx.quoteHistoryBusyId === row.id
                        ? "Chargement..."
                        : ctx.quoteHistoryOpenId === row.id
                          ? "Masquer"
                          : "Charger"
                    }}
                  </cfm-button>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Priorité</span><strong>{{ row.priorityLabel }}</strong></li>
                  <li><span>Signal</span><strong>{{ row.signalLabel }}</strong></li>
                  <li><span>Action attendue</span><strong>{{ row.nextActionLabel }}</strong></li>
                </ul>

                <ul class="cfm-billing-rail-list detail-copy" *ngIf="ctx.quoteHistoryOpenId === row.id && ctx.getQuoteHistory(row.id).length > 0; else noHistory">
                  <li *ngFor="let log of ctx.getQuoteHistory(row.id); trackBy: trackByHistory">
                    <span>{{ ctx.getBillingHistoryLabel(log) }}</span>
                    <strong class="timestamp">{{ log.occurred_at | date:'short' }}</strong>
                  </li>
                </ul>
              </section>
      </article>

      <article billingWorkspaceSecondary class="cfm-tonal-panel cfm-tonal-panel--flat cfm-billing-section">
          <header class="cfm-billing-section-head">
            <div class="cfm-billing-section-copy">
              <span class="panel-kicker">À traiter</span>
              <h4 class="cfm-billing-section-title">Devis prioritaires</h4>
              <p>Les devis qui appellent un geste immédiat passent après la structure commune du module, pour rester des repères secondaires.</p>
            </div>
            <cfm-status-chip
              [label]="vm.priorityRows.length + ' priorité' + (vm.priorityRows.length > 1 ? 's' : '')"
              [tone]="vm.priorityRows.length > 0 ? 'warning' : 'neutral'"
            />
          </header>

          <div class="cfm-billing-register" *ngIf="vm.priorityRows.length > 0; else emptyPriority">
            <article
              class="cfm-billing-priority-row quote-priority-row"
              *ngFor="let row of vm.priorityRows; trackBy: trackByQuoteRow"
              (click)="selectQuote(row.id)"
            >
              <div class="cfm-billing-priority-copy">
                <strong class="record-primary invoice-number">{{ row.raw.number }}</strong>
                <span class="record-meta">{{ row.title }}</span>
              </div>

              <div class="quote-priority-summary">
                <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                <cfm-status-chip emphasis="soft" [label]="row.priorityLabel" [tone]="row.priorityTone" />
              </div>

              <div class="quote-priority-meta">
                <strong class="detail-copy">{{ row.raw.customer_name }}</strong>
                <span class="record-meta">{{ row.amountLabel }} · validité {{ row.validityLabel }}</span>
              </div>

              <cfm-button
                type="button"
                size="sm"
                [disabled]="!canRunQuoteAction(row.primaryAction) || isActionBusy(row, row.primaryAction)"
                (click)="runQuoteAction(row, row.primaryAction, $event)"
              >
                {{ row.nextActionLabel }}
              </cfm-button>
            </article>
          </div>
      </article>
    </cfm-desktop-billing-workspace-shell>

    <ng-template #emptyPriority>
      <section class="cfm-billing-empty">
        <strong>Aucun devis prioritaire</strong>
        <p>Les devis visibles ne demandent pas d’action immédiate.</p>
      </section>
    </ng-template>

    <ng-template #emptyList>
      <section billingWorkspaceRegisterBody class="cfm-billing-empty">
        <strong>Aucun devis visible</strong>
        <p>Ajustez les filtres ou créez un devis pour alimenter le registre.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="cfm-billing-empty">
        <strong>Aucun devis sélectionné</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir l’aperçu devis.</p>
      </section>
    </ng-template>

    <ng-template #noHistory>
      <p class="small cfm-billing-empty-inline">
        {{ ctx.quoteHistoryOpenId === rowIdForHistory ? "Aucun événement disponible pour ce devis." : "Chargez l’historique pour voir les derniers événements." }}
      </p>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .quote-priority-meta {
        display: grid;
        gap: 0.96rem;
      }

      .quote-priority-row {
        grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.86fr) minmax(0, 1fr) auto;
      }

      .quote-priority-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.42rem;
      }

      .quote-priority-row cfm-button {
        justify-self: end;
      }

      @media (max-width: 1180px) {
        .quote-priority-row cfm-button {
          justify-self: start;
        }
      }
    `,
  ],
})
export class DesktopBillingQuotesPageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly secondarySectionKey = "billing-quotes";

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    view: new FormControl<QuoteViewFilter>("actionable", { nonNullable: true }),
    customerId: new FormControl(QUOTE_ADVANCED_FILTER_DEFAULTS.customerId, { nonNullable: true }),
    worksiteId: new FormControl(QUOTE_ADVANCED_FILTER_DEFAULTS.worksiteId, { nonNullable: true }),
    readyOnly: new FormControl(QUOTE_ADVANCED_FILTER_DEFAULTS.readyOnly, { nonNullable: true }),
    convertOnly: new FormControl(QUOTE_ADVANCED_FILTER_DEFAULTS.convertOnly, { nonNullable: true }),
    toFollowUpOnly: new FormControl(QUOTE_ADVANCED_FILTER_DEFAULTS.toFollowUpOnly, { nonNullable: true }),
    followUpState: new FormControl<QuoteFollowUpFilter>(QUOTE_ADVANCED_FILTER_DEFAULTS.followUpState, { nonNullable: true }),
  });

  filtersOpen = false;
  private readonly selectedQuoteId$ = new BehaviorSubject<string | null>(null);
  private historyMessageQuoteId: string | null = null;

  constructor() {
    this.secondarySection.activate(this.secondarySectionKey);
    this.destroyRef.onDestroy(() => this.secondarySection.clear(this.secondarySectionKey));
  }

  get customerFilterOptions() {
    return [...this.ctx.billingCustomers].sort((left, right) => left.name.localeCompare(right.name, "fr"));
  }

  get worksiteFilterOptions() {
    return [...this.ctx.billingWorksites].sort((left, right) => left.name.localeCompare(right.name, "fr"));
  }

  readonly filteredRows$ = combineLatest([
    this.ctx.billingState$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([_state, filters]) => {
      const search = this.toSearchableText(filters.search);
      const view = filters.view ?? "actionable";
      const worksiteId = filters.worksiteId ?? QUOTE_ADVANCED_FILTER_DEFAULTS.worksiteId;
      return this.quoteRows.filter((row) => {
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(
            `${row.raw.number} ${row.title} ${row.raw.customer_name} ${row.raw.worksite_name ?? ""}`
          ).includes(search);
        const matchesView = this.matchesView(row, view);
        const matchesCustomer = filters.customerId === "all" || row.raw.customer_id === filters.customerId;
        const matchesWorksite = this.matchesWorksiteFilter(row, worksiteId);
        const matchesReady = !filters.readyOnly || row.statusLabel === "Prêt à envoyer";
        const matchesConvert = !filters.convertOnly || row.statusLabel === "À convertir";
        const matchesToFollowUp = !filters.toFollowUpOnly || row.statusLabel === "À relancer";
        const matchesFollowUpState = filters.followUpState === "all" || row.raw.follow_up_status === filters.followUpState;
        return matchesSearch
          && matchesView
          && matchesCustomer
          && matchesWorksite
          && matchesReady
          && matchesConvert
          && matchesToFollowUp
          && matchesFollowUpState;
      });
    }),
  );

  readonly vm$ = combineLatest([this.filteredRows$, this.selectedQuoteId$.pipe(distinctUntilChanged())]).pipe(
    map(([rows, selectedId]) => {
      const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;
      this.rowIdForHistory = selected?.id ?? null;
      return {
        rows,
        selected,
        priorityRows: rows.filter((row) => row.priorityTone === "warning").slice(0, 3),
      };
    }),
  );

  rowIdForHistory: string | null = null;

  get quoteRows(): QuoteWorkspaceItem[] {
    return [...this.ctx.quotes]
      .map((quote) => this.buildQuoteRow(quote))
      .sort((left, right) => left.sortRank - right.sortRank || left.raw.issue_date.localeCompare(right.raw.issue_date));
  }

  get draftCount(): number {
    return this.quoteRows.filter((row) => row.statusLabel === "Prêt à envoyer").length;
  }

  get acceptedCount(): number {
    return this.quoteRows.filter((row) => row.statusLabel === "À convertir").length;
  }

  get followUpCount(): number {
    return this.quoteRows.filter((row) => row.statusLabel === "À relancer").length;
  }

  toggleFiltersPopover(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      customerId: QUOTE_ADVANCED_FILTER_DEFAULTS.customerId,
      worksiteId: QUOTE_ADVANCED_FILTER_DEFAULTS.worksiteId,
      readyOnly: QUOTE_ADVANCED_FILTER_DEFAULTS.readyOnly,
      convertOnly: QUOTE_ADVANCED_FILTER_DEFAULTS.convertOnly,
      toFollowUpOnly: QUOTE_ADVANCED_FILTER_DEFAULTS.toFollowUpOnly,
      followUpState: QUOTE_ADVANCED_FILTER_DEFAULTS.followUpState,
    });
  }

  selectQuote(quoteId: string): void {
    this.selectedQuoteId$.next(quoteId);
    this.rowIdForHistory = quoteId;
  }

  async runQuoteAction(row: QuoteWorkspaceItem, action: QuoteAction | null, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!action) {
      this.selectQuote(row.id);
      return;
    }
    if (!this.canRunQuoteAction(action)) {
      return;
    }

    switch (action.kind) {
      case "status":
        await this.ctx.changeQuoteStatus(row.raw, action.status);
        break;
      case "follow_up":
        await this.ctx.changeQuoteFollowUpStatus(row.raw, action.followUpStatus);
        break;
      case "convert":
        await this.ctx.duplicateQuoteAsInvoice(row.raw);
        break;
      case "pdf":
        await this.ctx.exportQuotePdf(row.raw);
        break;
      case "history":
        this.historyMessageQuoteId = row.id;
        await this.ctx.toggleQuoteHistory(row.raw);
        break;
    }
  }

  isActionBusy(row: QuoteWorkspaceItem, action: QuoteAction | null): boolean {
    if (!action) {
      return false;
    }
    switch (action.kind) {
      case "status":
        return this.ctx.quoteStatusBusyId === row.id;
      case "follow_up":
        return this.ctx.quoteFollowUpBusyId === row.id;
      case "convert":
        return this.ctx.quoteDuplicateBusyId === row.id;
      case "pdf":
        return this.ctx.quotePdfBusyId === row.id;
      case "history":
        return this.ctx.quoteHistoryBusyId === row.id;
    }
  }

  canRunQuoteAction(action: QuoteAction | null): boolean {
    if (!action) {
      return false;
    }

    switch (action.kind) {
      case "history":
        return this.ctx.canReadOrganization;
      case "pdf":
        return this.ctx.canExportBilling;
      case "status":
      case "follow_up":
      case "convert":
        return this.ctx.canActOnBilling;
    }
  }

  trackByQuoteRow(_index: number, item: QuoteWorkspaceItem): string {
    return item.id;
  }

  trackByHistory(_index: number, item: AuditLogRecord): string {
    return item.id;
  }

  trackByLine(index: number, item: { description: string }): string {
    return `${index}-${item.description}`;
  }

  private buildQuoteRow(quote: QuoteRecord): QuoteWorkspaceItem {
    const workflow = this.ctx.getQuoteWorkflowState(quote);
    let primaryAction: QuoteAction | null = null;
    let secondaryAction: QuoteAction | null = { kind: "pdf", label: "Exporter le PDF" };

    if (quote.status === "draft") {
      primaryAction = { kind: "status", label: "Envoyer le devis", status: "sent" };
    } else if (quote.status === "accepted") {
      primaryAction = { kind: "convert", label: "Créer une facture" };
    } else if (quote.status === "declined") {
      primaryAction = { kind: "history", label: "Voir l’historique" };
    } else if (workflow.stageLabel === "À relancer") {
      primaryAction = {
        kind: "follow_up",
        label: workflow.nextActionLabel,
        followUpStatus: quote.follow_up_status === "to_follow_up" ? "followed_up" : "to_follow_up",
      };
      secondaryAction = { kind: "status", label: "Marquer accepté", status: "accepted" };
    } else if (quote.follow_up_status === "followed_up") {
      primaryAction = { kind: "follow_up", label: "Attente client", followUpStatus: "waiting_customer" };
      secondaryAction = { kind: "status", label: "Marquer accepté", status: "accepted" };
    } else if (quote.follow_up_status === "waiting_customer") {
      primaryAction = { kind: "status", label: "Marquer accepté", status: "accepted" };
      secondaryAction = { kind: "follow_up", label: "Repasser en suivi normal", followUpStatus: "normal" };
    } else {
      primaryAction = { kind: "follow_up", label: "Marquer à relancer", followUpStatus: "to_follow_up" };
      secondaryAction = { kind: "status", label: "Marquer accepté", status: "accepted" };
    }

    return {
      id: quote.id,
      raw: quote,
      title: quote.title || `Devis du ${new Date(quote.issue_date).toLocaleDateString("fr-FR")}`,
      flowStepLabel: workflow.flowStepLabel,
      flowStepTone: workflow.flowStepTone,
      priorityLabel: workflow.priorityLabel,
      priorityTone: workflow.priorityTone,
      statusLabel: workflow.stageLabel,
      statusTone: workflow.stageTone,
      signalLabel: workflow.signalLabel,
      signalTone: workflow.signalTone,
      validityLabel: quote.valid_until ? new Date(quote.valid_until).toLocaleDateString("fr-FR") : "À préciser",
      amountLabel: this.ctx.formatAmountCents(quote.total_amount_cents, quote.currency),
      nextActionLabel: workflow.nextActionLabel,
      nextActionSummary: workflow.nextActionSummary,
      primaryAction,
      secondaryAction,
      sortRank: workflow.sortRank,
    };
  }

  private matchesView(row: QuoteWorkspaceItem, view: QuoteViewFilter): boolean {
    switch (view) {
      case "actionable":
        return row.raw.status !== "declined";
      case "draft":
        return row.raw.status === "draft";
      case "sent":
        return row.raw.status === "sent";
      case "accepted":
        return row.raw.status === "accepted";
      case "declined":
        return row.raw.status === "declined";
      case "all":
      default:
        return true;
    }
  }

  private matchesWorksiteFilter(row: QuoteWorkspaceItem, filter: string): boolean {
    if (filter === "all") {
      return true;
    }
    if (filter === "none") {
      return !row.raw.worksite_id;
    }
    return row.raw.worksite_id === filter;
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
