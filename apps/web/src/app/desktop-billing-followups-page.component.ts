import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type { BillingFollowUpStatus, InvoiceRecord, QuoteRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type FollowUpAction =
  | { kind: "quote_follow_up"; label: string; followUpStatus: BillingFollowUpStatus }
  | { kind: "invoice_follow_up"; label: string; followUpStatus: BillingFollowUpStatus }
  | { kind: "convert_quote"; label: string }
  | { kind: "open_factures"; label: string }
  | { kind: "open_factures_payment"; label: string }
  | { kind: "open_devis"; label: string }
  | { kind: "quote_status"; label: string; status: QuoteRecord["status"] };

type BillingFollowUpRow = {
  id: string;
  kind: "quote" | "invoice";
  title: string;
  customerName: string;
  worksiteName: string | null;
  amountLabel: string;
  dueLabel: string;
  statusLabel: "À relancer" | "Relancé" | "À surveiller" | "À convertir" | "À encaisser";
  statusTone: CfmTone;
  signalLabel: string;
  signalTone: CfmTone;
  nextActionLabel: string;
  nextActionSummary: string;
  primaryAction: FollowUpAction | null;
  secondaryAction: FollowUpAction | null;
  rawQuote: QuoteRecord | null;
  rawInvoice: InvoiceRecord | null;
  sortRank: number;
};

type FollowUpViewFilter = "actionable" | "all" | "quote" | "invoice";

const FOLLOWUP_ADVANCED_FILTER_DEFAULTS = {
  customerId: "all",
  worksiteId: "all",
  convertOnly: false,
  followUpOnly: false,
  cashOnly: false,
  watchOnly: false,
};

@Component({
  selector: "cfm-desktop-billing-followups-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, DesktopBillingWorkspaceShellComponent],
  template: `
    <ng-container *ngIf="allFollowUpRows.length > 0; else emptyState">
      <cfm-desktop-billing-workspace-shell
        class="cfm-billing-page"
        [formGroup]="filterForm"
        kpiAriaLabel="Repères relances"
        registerHeadClass="billing-home-register-head--overview"
        [showRegisterHead]="filteredRows.length > 0"
        [hasSecondary]="true"
        [secondaryOpen]="secondarySection.isOpenFor(secondarySectionKey)"
      >
          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--quotes">
            <span class="small">À convertir</span>
            <strong>{{ filteredRowsByStatus('À convertir') }}</strong>
            <span>Devis accepté{{ filteredRowsByStatus('À convertir') > 1 ? "s" : "" }} en attente de facture</span>
          </article>

          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--invoices">
            <span class="small">À relancer</span>
            <strong>{{ filteredRowsByStatus('À relancer') }}</strong>
            <span>Dossier{{ filteredRowsByStatus('À relancer') > 1 ? "s" : "" }} à reprendre maintenant</span>
          </article>

          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--payments">
            <span class="small">À encaisser</span>
            <strong>{{ filteredRowsByStatus('À encaisser') }}</strong>
            <span>Facture{{ filteredRowsByStatus('À encaisser') > 1 ? "s" : "" }} avec paiement encore attendu</span>
          </article>

          <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
                  <input type="text" formControlName="search" placeholder="Client, document, chantier" />
          </label>

          <div billingWorkspaceFilter class="billing-home-filter-trailing">
            <label class="billing-home-filter-chip">
                    <select formControlName="view">
                      <option value="actionable">À traiter</option>
                      <option value="all">Toutes</option>
                      <option value="quote">Devis</option>
                      <option value="invoice">Factures</option>
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
                      </div>

                      <div class="cfm-billing-filter-toggles">
                        <label class="cfm-billing-filter-checkbox">
                          <input type="checkbox" formControlName="convertOnly" />
                          <span>À convertir</span>
                        </label>

                        <label class="cfm-billing-filter-checkbox">
                          <input type="checkbox" formControlName="followUpOnly" />
                          <span>À relancer</span>
                        </label>

                        <label class="cfm-billing-filter-checkbox">
                          <input type="checkbox" formControlName="cashOnly" />
                          <span>À encaisser</span>
                        </label>

                        <label class="cfm-billing-filter-checkbox">
                          <input type="checkbox" formControlName="watchOnly" />
                          <span>À surveiller / relancé</span>
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

          <span billingWorkspaceRegisterHead>Élément</span>
          <span billingWorkspaceRegisterHead>Statut</span>
          <span billingWorkspaceRegisterHead>Client & dossier</span>
          <span billingWorkspaceRegisterHead>Repère</span>
          <span billingWorkspaceRegisterHead>Action utile</span>

          <div billingWorkspaceRegisterBody class="cfm-billing-register" *ngIf="filteredRows.length > 0; else emptyList">
            <button
              *ngFor="let row of filteredRows; trackBy: trackByRow"
              type="button"
              class="billing-home-row billing-home-row--overview"
              [class.is-selected]="activeRow?.id === row.id"
              (click)="selectRow(row.id)"
            >
              <div class="billing-home-row-cell billing-home-row-primary">
                <strong class="record-primary">{{ row.title }}</strong>
                <span class="record-meta">{{ getRowKindLabel(row) }}</span>
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
                <span class="record-meta">{{ row.signalLabel }} · {{ getRowFamilyLabel(row) }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ row.customerName }}</strong>
                <span class="record-meta">{{ row.worksiteName || "Sans chantier" }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ row.amountLabel }}</strong>
                <span class="record-meta">{{ row.dueLabel }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ row.nextActionLabel }}</strong>
                <span class="record-meta">{{ row.signalLabel }}</span>
              </div>
            </button>
          </div>

          <article billingWorkspaceRail class="billing-home-rail-card cfm-billing-sticky-card" *ngIf="activeRow as row; else emptyDetail">
              <section class="billing-home-rail-preview">
                <header class="billing-home-rail-preview-head">
                  <span class="panel-kicker">Aperçu relance</span>
                </header>

                <div class="billing-home-rail-preview-copy">
                  <h4>{{ row.title }}</h4>
                  <p>{{ row.customerName }} · {{ row.dueLabel }}</p>
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
                  <strong>{{ row.statusLabel }}</strong>
                  <span>{{ row.nextActionSummary }}</span>
                </div>

                <div class="billing-home-rail-actions">
                  <cfm-button
                    type="button"
                    class="billing-home-rail-primary-button"
                    *ngIf="row.primaryAction && canRunAction(row.primaryAction)"
                    [disabled]="isActionBusy(row, row.primaryAction)"
                    (click)="runAction(row, row.primaryAction)"
                  >
                    {{ row.nextActionLabel }}
                  </cfm-button>
                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      *ngIf="row.secondaryAction && canRunAction(row.secondaryAction)"
                      [disabled]="isActionBusy(row, row.secondaryAction)"
                      (click)="runAction(row, row.secondaryAction)"
                    >
                      {{ row.secondaryAction.label }}
                    </cfm-button>
                  </div>
                </div>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Repères clés</span>
                  <h4 class="cfm-billing-section-title">Lecture de suivi</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Client</span><strong>{{ row.customerName }}</strong></li>
                  <li><span>Chantier</span><strong>{{ row.worksiteName || "Aucun" }}</strong></li>
                  <li><span>Montant</span><strong>{{ row.amountLabel }}</strong></li>
                  <li><span>Repère</span><strong>{{ row.dueLabel }}</strong></li>
                  <li><span>Suivi</span><strong>{{ getRowFollowUpLabel(row) }}</strong></li>
                  <li><span>Famille</span><strong>{{ getRowFamilyLabel(row) }}</strong></li>
                </ul>
              </section>

              <section class="billing-home-rail-section billing-home-rail-section--history">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Historique léger</span>
                  <h4 class="cfm-billing-section-title">Dernier état</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>État</span><strong>{{ row.statusLabel }}</strong></li>
                  <li><span>Signal</span><strong>{{ row.signalLabel }}</strong></li>
                  <li><span>Prochain geste</span><strong>{{ row.nextActionLabel }}</strong></li>
                  <li><span>Ce qui bloque</span><strong>{{ getRowBlockingLabel(row) }}</strong></li>
                </ul>
              </section>
          </article>

          <article billingWorkspaceSecondary class="cfm-tonal-panel cfm-tonal-panel--flat cfm-billing-section">
            <header class="cfm-billing-section-head">
              <div class="cfm-billing-section-copy">
                <span class="panel-kicker">À surveiller</span>
                <h4 class="cfm-billing-section-title">Relances prioritaires</h4>
                <p>Les relances prioritaires passent après la charpente commune pour rester un repère secondaire et non la structure d’entrée.</p>
              </div>
              <cfm-status-chip
                [label]="priorityRows.length + ' priorité' + (priorityRows.length > 1 ? 's' : '')"
                [tone]="priorityRows.length > 0 ? 'warning' : 'neutral'"
              />
            </header>

            <div class="cfm-billing-register" *ngIf="priorityRows.length > 0; else emptyPriority">
              <article
                class="cfm-billing-priority-row followup-priority-row"
                *ngFor="let row of priorityRows; trackBy: trackByRow"
                (click)="selectRow(row.id)"
              >
                <div class="cfm-billing-priority-copy">
                  <strong class="record-primary">{{ row.title }}</strong>
                  <span class="record-meta">{{ getRowKindLabel(row) }} · {{ row.customerName }}</span>
                </div>

                <div class="followup-priority-status">
                  <cfm-status-chip [label]="row.statusLabel" [tone]="row.statusTone" />
                  <cfm-status-chip emphasis="soft" [label]="row.signalLabel" [tone]="row.signalTone" />
                </div>

                <div class="followup-priority-meta">
                  <strong class="detail-copy">{{ row.amountLabel }}</strong>
                  <span class="record-meta">{{ row.dueLabel }}</span>
                </div>

                <cfm-button
                  type="button"
                  size="sm"
                  [disabled]="!canRunAction(row.primaryAction) || isActionBusy(row, row.primaryAction)"
                  (click)="runAction(row, row.primaryAction, $event)"
                >
                  {{ row.nextActionLabel }}
                </cfm-button>
              </article>
            </div>
          </article>
      </cfm-desktop-billing-workspace-shell>
    </ng-container>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="cfm-billing-empty">
        <strong>Aucune relance sélectionnée</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir l’aperçu de suivi.</p>
      </section>
    </ng-template>

    <ng-template #emptyPriority>
      <section class="cfm-billing-empty">
        <strong>Aucune priorité immédiate</strong>
        <p>Les relances visibles sont déjà sous contrôle pour le moment.</p>
      </section>
    </ng-template>

    <ng-template #emptyList>
      <section billingWorkspaceRegisterBody class="cfm-billing-empty">
        <strong>Aucune relance visible</strong>
        <p>Ajustez les filtres pour retrouver le bon suivi commercial.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucune relance en attente"
        description="Le suivi commercial et les encaissements semblent calmes pour le moment."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .followup-priority-meta {
        display: grid;
        gap: 0.96rem;
      }

      .followup-priority-row {
        grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr) minmax(0, 0.88fr) auto;
      }

      .followup-priority-status {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.42rem;
      }

      .followup-priority-row cfm-button {
        justify-self: end;
      }

      @media (max-width: 1180px) {
        .followup-priority-row {
          grid-template-columns: 1fr;
        }

        .followup-priority-row cfm-button {
          justify-self: start;
        }
      }
    `,
  ],
})
export class DesktopBillingFollowupsPageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly secondarySectionKey = "billing-followups";

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    view: new FormControl<FollowUpViewFilter>("actionable", { nonNullable: true }),
    customerId: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.customerId, { nonNullable: true }),
    worksiteId: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.worksiteId, { nonNullable: true }),
    convertOnly: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.convertOnly, { nonNullable: true }),
    followUpOnly: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.followUpOnly, { nonNullable: true }),
    cashOnly: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.cashOnly, { nonNullable: true }),
    watchOnly: new FormControl(FOLLOWUP_ADVANCED_FILTER_DEFAULTS.watchOnly, { nonNullable: true }),
  });

  filtersOpen = false;
  private activeRowId: string | null = null;

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

  get quoteRows(): BillingFollowUpRow[] {
    return this.ctx.quotes
      .filter((quote) => quote.status === "accepted" || (quote.status === "sent" && (quote.follow_up_status !== "normal" || this.isQuoteExpired(quote))))
      .map((quote) => this.buildQuoteRow(quote));
  }

  get invoiceRows(): BillingFollowUpRow[] {
    return this.ctx.invoices
      .filter((invoice) => invoice.outstanding_amount_cents > 0)
      .map((invoice) => this.buildInvoiceRow(invoice));
  }

  get allFollowUpRows(): BillingFollowUpRow[] {
    return [...this.quoteRows, ...this.invoiceRows].sort(
      (left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title),
    );
  }

  get filteredRows(): BillingFollowUpRow[] {
    const filters = this.filterForm.getRawValue();
    const search = this.toSearchableText(filters.search);
    const worksiteId = filters.worksiteId ?? FOLLOWUP_ADVANCED_FILTER_DEFAULTS.worksiteId;
    return this.allFollowUpRows.filter((row) => {
      const matchesSearch =
        search.length === 0
        || this.toSearchableText(`${row.title} ${row.customerName} ${row.worksiteName ?? ""} ${row.statusLabel}`).includes(search);
      const matchesView = this.matchesView(row, filters.view ?? "actionable");
      const matchesCustomer = filters.customerId === "all" || this.getRowCustomerId(row) === filters.customerId;
      const matchesWorksite = this.matchesWorksiteFilter(row, worksiteId);
      const matchesStatusToggles = this.matchesStatusToggles(row, filters);
      return matchesSearch && matchesView && matchesCustomer && matchesWorksite && matchesStatusToggles;
    });
  }

  get priorityRows(): BillingFollowUpRow[] {
    return this.filteredRows.slice(0, 3);
  }

  get activeRow(): BillingFollowUpRow | null {
    if (this.activeRowId) {
      const explicit = this.filteredRows.find((row) => row.id === this.activeRowId);
      if (explicit) {
        return explicit;
      }
    }
    return this.filteredRows[0] ?? null;
  }

  get filteredQuoteCount(): number {
    return this.filteredRows.filter((row) => row.kind === "quote").length;
  }

  get filteredInvoiceCount(): number {
    return this.filteredRows.filter((row) => row.kind === "invoice").length;
  }

  get filteredOverdueCount(): number {
    return this.filteredRows.filter((row) => row.rawInvoice?.status === "overdue").length;
  }

  get filteredActionableCount(): number {
    return this.filteredRows.filter((row) => row.statusLabel === "À convertir" || row.statusLabel === "À encaisser").length;
  }

  filteredRowsByStatus(status: BillingFollowUpRow["statusLabel"]): number {
    return this.filteredRows.filter((row) => row.statusLabel === status).length;
  }

  toggleFiltersPopover(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      customerId: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.customerId,
      worksiteId: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.worksiteId,
      convertOnly: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.convertOnly,
      followUpOnly: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.followUpOnly,
      cashOnly: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.cashOnly,
      watchOnly: FOLLOWUP_ADVANCED_FILTER_DEFAULTS.watchOnly,
    });
  }

  selectRow(rowId: string): void {
    this.activeRowId = rowId;
  }

  async runAction(row: BillingFollowUpRow, action: FollowUpAction | null, event?: Event): Promise<void> {
    event?.stopPropagation();
    if (!action) {
      this.selectRow(row.id);
      return;
    }
    if (!this.canRunAction(action)) {
      return;
    }

    switch (action.kind) {
      case "quote_follow_up":
        if (row.rawQuote) {
          await this.ctx.changeQuoteFollowUpStatus(row.rawQuote, action.followUpStatus);
        }
        break;
      case "invoice_follow_up":
        if (row.rawInvoice) {
          await this.ctx.changeInvoiceFollowUpStatus(row.rawInvoice, action.followUpStatus);
        }
        break;
      case "convert_quote":
        if (row.rawQuote) {
          await this.ctx.duplicateQuoteAsInvoice(row.rawQuote);
        }
        break;
      case "quote_status":
        if (row.rawQuote) {
          await this.ctx.changeQuoteStatus(row.rawQuote, action.status);
        }
        break;
      case "open_devis":
        await this.router.navigateByUrl("/app/facturation/devis");
        break;
      case "open_factures":
        await this.router.navigateByUrl("/app/facturation/factures");
        break;
      case "open_factures_payment":
        if (row.rawInvoice) {
          this.ctx.openInvoicePayment(row.rawInvoice);
        }
        await this.router.navigateByUrl("/app/facturation/factures");
        break;
    }
  }

  isActionBusy(row: BillingFollowUpRow, action: FollowUpAction | null): boolean {
    if (!action) {
      return false;
    }
    switch (action.kind) {
      case "quote_follow_up":
        return this.ctx.quoteFollowUpBusyId === row.id;
      case "invoice_follow_up":
        return this.ctx.invoiceFollowUpBusyId === row.id;
      case "convert_quote":
        return this.ctx.quoteDuplicateBusyId === row.id;
      case "quote_status":
        return this.ctx.quoteStatusBusyId === row.id;
      case "open_devis":
      case "open_factures":
      case "open_factures_payment":
        return false;
    }
  }

  canRunAction(action: FollowUpAction | null): boolean {
    if (!action) {
      return false;
    }

    switch (action.kind) {
      case "open_devis":
      case "open_factures":
        return this.ctx.canReadOrganization;
      case "open_factures_payment":
        return this.ctx.canActOnBilling;
      case "quote_follow_up":
      case "invoice_follow_up":
      case "convert_quote":
      case "quote_status":
        return this.ctx.canActOnBilling;
    }
  }

  trackByRow(_index: number, item: BillingFollowUpRow): string {
    return item.id;
  }

  getRowKindLabel(row: BillingFollowUpRow): string {
    return row.kind === "quote" ? "Devis" : "Facture";
  }

  getRowFamilyLabel(row: BillingFollowUpRow): string {
    return row.kind === "quote" ? "Cycle devis" : "Encaissement facture";
  }

  getRowFollowUpLabel(row: BillingFollowUpRow): string {
    if (row.rawQuote) {
      return this.ctx.getBillingFollowUpStatusLabel(row.rawQuote.follow_up_status);
    }
    if (row.rawInvoice) {
      return this.ctx.getBillingFollowUpStatusLabel(row.rawInvoice.follow_up_status);
    }
    return "Suivi normal";
  }

  getRowBlockingLabel(row: BillingFollowUpRow): string {
    switch (row.statusLabel) {
      case "À convertir":
        return "Le devis est accepté, mais la facture n’est pas encore créée.";
      case "À relancer":
        return "Le dossier attend un geste de relance ou un retour client.";
      case "À encaisser":
        return "Le paiement reste à enregistrer pour solder la facture.";
      case "Relancé":
        return "La relance est faite, le dossier attend maintenant un retour.";
      case "À surveiller":
      default:
        return "Le dossier reste en observation jusqu’au prochain signal utile.";
    }
  }

  private matchesView(row: BillingFollowUpRow, view: FollowUpViewFilter): boolean {
    switch (view) {
      case "quote":
        return row.kind === "quote";
      case "invoice":
        return row.kind === "invoice";
      case "actionable":
        return row.statusLabel === "À convertir" || row.statusLabel === "À relancer" || row.statusLabel === "À encaisser";
      case "all":
      default:
        return true;
    }
  }

  private matchesWorksiteFilter(row: BillingFollowUpRow, worksiteId: string): boolean {
    if (worksiteId === "all") {
      return true;
    }
    const rowWorksiteId = row.rawQuote?.worksite_id ?? row.rawInvoice?.worksite_id ?? null;
    if (worksiteId === "none") {
      return rowWorksiteId === null;
    }
    return rowWorksiteId === worksiteId;
  }

  private matchesStatusToggles(
    row: BillingFollowUpRow,
    filters: ReturnType<typeof this.filterForm.getRawValue>,
  ): boolean {
    const activeStatuses: BillingFollowUpRow["statusLabel"][] = [];
    if (filters.convertOnly) {
      activeStatuses.push("À convertir");
    }
    if (filters.followUpOnly) {
      activeStatuses.push("À relancer");
    }
    if (filters.cashOnly) {
      activeStatuses.push("À encaisser");
    }
    if (filters.watchOnly) {
      activeStatuses.push("À surveiller", "Relancé");
    }
    return activeStatuses.length === 0 || activeStatuses.includes(row.statusLabel);
  }

  private getRowCustomerId(row: BillingFollowUpRow): string | null {
    return row.rawQuote?.customer_id ?? row.rawInvoice?.customer_id ?? null;
  }

  private buildQuoteRow(quote: QuoteRecord): BillingFollowUpRow {
    const workflow = this.ctx.getQuoteWorkflowState(quote);

    if (quote.status === "accepted") {
      return {
        id: quote.id,
        kind: "quote",
        title: quote.title || quote.number,
        customerName: quote.customer_name,
        worksiteName: quote.worksite_name,
        amountLabel: this.ctx.formatAmountCents(quote.total_amount_cents, quote.currency),
        dueLabel: quote.valid_until ? `Valable jusqu’au ${new Date(quote.valid_until).toLocaleDateString("fr-FR")}` : "Sans date limite",
        statusLabel: "À convertir",
        statusTone: "accent",
        signalLabel: workflow.signalLabel,
        signalTone: "accent",
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: { kind: "convert_quote", label: "Créer une facture" },
        secondaryAction: { kind: "open_devis", label: "Voir les devis" },
        rawQuote: quote,
        rawInvoice: null,
        sortRank: workflow.sortRank,
      };
    }

    if (workflow.stageLabel === "À relancer") {
      return {
        id: quote.id,
        kind: "quote",
        title: quote.title || quote.number,
        customerName: quote.customer_name,
        worksiteName: quote.worksite_name,
        amountLabel: this.ctx.formatAmountCents(quote.total_amount_cents, quote.currency),
        dueLabel: quote.valid_until ? `Valable jusqu’au ${new Date(quote.valid_until).toLocaleDateString("fr-FR")}` : "Sans date limite",
        statusLabel: "À relancer",
        statusTone: "warning",
        signalLabel: workflow.signalLabel,
        signalTone: workflow.signalTone,
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: {
          kind: "quote_follow_up",
          label: workflow.nextActionLabel,
          followUpStatus: quote.follow_up_status === "to_follow_up" ? "followed_up" : "to_follow_up",
        },
        secondaryAction: { kind: "quote_status", label: "Marquer accepté", status: "accepted" },
        rawQuote: quote,
        rawInvoice: null,
        sortRank: workflow.sortRank,
      };
    }

    if (quote.follow_up_status === "followed_up") {
      return {
        id: quote.id,
        kind: "quote",
        title: quote.title || quote.number,
        customerName: quote.customer_name,
        worksiteName: quote.worksite_name,
        amountLabel: this.ctx.formatAmountCents(quote.total_amount_cents, quote.currency),
        dueLabel: quote.valid_until ? `Valable jusqu’au ${new Date(quote.valid_until).toLocaleDateString("fr-FR")}` : "Sans date limite",
        statusLabel: "Relancé",
        statusTone: "calm",
        signalLabel: workflow.signalLabel,
        signalTone: workflow.signalTone,
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: { kind: "quote_follow_up", label: "Attente client", followUpStatus: "waiting_customer" },
        secondaryAction: { kind: "quote_status", label: "Marquer accepté", status: "accepted" },
        rawQuote: quote,
        rawInvoice: null,
        sortRank: workflow.sortRank,
      };
    }

    return {
      id: quote.id,
      kind: "quote",
      title: quote.title || quote.number,
      customerName: quote.customer_name,
      worksiteName: quote.worksite_name,
      amountLabel: this.ctx.formatAmountCents(quote.total_amount_cents, quote.currency),
      dueLabel: quote.valid_until ? `Valable jusqu’au ${new Date(quote.valid_until).toLocaleDateString("fr-FR")}` : "Sans date limite",
      statusLabel: "À surveiller",
      statusTone: "neutral",
      signalLabel: workflow.signalLabel,
      signalTone: "neutral",
      nextActionLabel: workflow.nextActionLabel,
      nextActionSummary: workflow.nextActionSummary,
      primaryAction: { kind: "quote_status", label: "Marquer accepté", status: "accepted" },
      secondaryAction: { kind: "quote_follow_up", label: "Suivi normal", followUpStatus: "normal" },
      rawQuote: quote,
      rawInvoice: null,
      sortRank: workflow.sortRank,
    };
  }

  private buildInvoiceRow(invoice: InvoiceRecord): BillingFollowUpRow {
    const workflow = this.ctx.getInvoiceWorkflowState(invoice);

    if (invoice.status === "overdue" || invoice.follow_up_status === "to_follow_up") {
      return {
        id: invoice.id,
        kind: "invoice",
        title: invoice.title || invoice.number,
        customerName: invoice.customer_name,
        worksiteName: invoice.worksite_name,
        amountLabel: `${this.ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)} restant`,
        dueLabel: invoice.due_date ? `Échéance ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}` : "Échéance à préciser",
        statusLabel: "À relancer",
        statusTone: invoice.status === "overdue" ? "danger" : "warning",
        signalLabel: workflow.signalLabel,
        signalTone: invoice.status === "overdue" ? "danger" : "warning",
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: {
          kind: "invoice_follow_up",
          label: workflow.nextActionLabel,
          followUpStatus: invoice.follow_up_status === "to_follow_up" ? "followed_up" : "to_follow_up",
        },
        secondaryAction: { kind: "open_factures", label: "Voir les factures" },
        rawQuote: null,
        rawInvoice: invoice,
        sortRank: workflow.sortRank,
      };
    }

    if (invoice.follow_up_status === "followed_up") {
      return {
        id: invoice.id,
        kind: "invoice",
        title: invoice.title || invoice.number,
        customerName: invoice.customer_name,
        worksiteName: invoice.worksite_name,
        amountLabel: `${this.ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)} restant`,
        dueLabel: invoice.due_date ? `Échéance ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}` : "Échéance à préciser",
        statusLabel: "Relancé",
        statusTone: "calm",
        signalLabel: workflow.signalLabel,
        signalTone: workflow.signalTone,
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: { kind: "invoice_follow_up", label: "Attente client", followUpStatus: "waiting_customer" },
        secondaryAction: { kind: "open_factures", label: "Voir les factures" },
        rawQuote: null,
        rawInvoice: invoice,
        sortRank: workflow.sortRank,
      };
    }

    if (invoice.follow_up_status === "waiting_customer") {
      return {
        id: invoice.id,
        kind: "invoice",
        title: invoice.title || invoice.number,
        customerName: invoice.customer_name,
        worksiteName: invoice.worksite_name,
        amountLabel: `${this.ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)} restant`,
        dueLabel: invoice.due_date ? `Échéance ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}` : "Échéance à préciser",
        statusLabel: "À surveiller",
        statusTone: "neutral",
        signalLabel: workflow.signalLabel,
        signalTone: "neutral",
        nextActionLabel: workflow.nextActionLabel,
        nextActionSummary: workflow.nextActionSummary,
        primaryAction: { kind: "open_factures_payment", label: "Enregistrer un paiement" },
        secondaryAction: { kind: "invoice_follow_up", label: "Suivi normal", followUpStatus: "normal" },
        rawQuote: null,
        rawInvoice: invoice,
        sortRank: workflow.sortRank,
      };
    }

    return {
      id: invoice.id,
      kind: "invoice",
      title: invoice.title || invoice.number,
      customerName: invoice.customer_name,
      worksiteName: invoice.worksite_name,
      amountLabel: `${this.ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)} restant`,
      dueLabel: invoice.due_date ? `Échéance ${new Date(invoice.due_date).toLocaleDateString("fr-FR")}` : "Échéance à préciser",
      statusLabel: "À encaisser",
      statusTone: "progress",
      signalLabel: workflow.signalLabel,
      signalTone: "progress",
      nextActionLabel: workflow.nextActionLabel,
      nextActionSummary: workflow.nextActionSummary,
      primaryAction: { kind: "open_factures_payment", label: "Enregistrer un paiement" },
      secondaryAction: { kind: "invoice_follow_up", label: "Marquer à relancer", followUpStatus: "to_follow_up" },
      rawQuote: null,
      rawInvoice: invoice,
      sortRank: workflow.sortRank,
    };
  }

  private isQuoteExpired(quote: QuoteRecord): boolean {
    return Boolean(quote.valid_until && new Date(quote.valid_until).getTime() < Date.now());
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
