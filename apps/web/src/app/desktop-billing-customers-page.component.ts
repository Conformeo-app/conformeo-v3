import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import type { BillingCustomerRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith } from "rxjs";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type CustomerSignalFilter = "all" | "actionable" | "stable";
type CustomerContactFilter = "all" | "filled" | "missing";

const CUSTOMER_ADVANCED_FILTER_DEFAULTS = {
  signal: "all" as CustomerSignalFilter,
  emailStatus: "all" as CustomerContactFilter,
  phoneStatus: "all" as CustomerContactFilter,
  outstandingOnly: false,
  quotesOnly: false,
  invoicesOnly: false,
};

type CustomerWorkspaceItem = {
  id: string;
  raw: BillingCustomerRecord;
  name: string;
  typeLabel: string;
  addressLabel: string;
  contactPrimary: string;
  contactSecondary: string;
  activityLabel: string;
  outstandingLabel: string;
  signalLabel: string;
  signalTone: CfmTone;
  nextActionLabel: string;
  quoteCountLabel: string;
  invoiceCountLabel: string;
  notesLabel: string;
};

@Component({
  selector: "cfm-desktop-billing-customers-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CfmButtonComponent, CfmStatusChipComponent, DesktopBillingWorkspaceShellComponent],
  template: `
    <cfm-desktop-billing-workspace-shell
      class="cfm-billing-page"
      *ngIf="vm$ | async as vm"
      [formGroup]="filterForm"
      kpiAriaLabel="Repères clients"
      registerHeadClass="billing-home-register-head--overview"
      [showRegisterHead]="vm.customers.length > 0"
      [hasSecondary]="true"
      [secondaryOpen]="secondarySection.isOpenFor(secondarySectionKey)"
    >
      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--quotes">
          <span class="small">Portefeuille actif</span>
          <strong>{{ vm.customers.length }}</strong>
          <span>{{ vm.companyCount }} entreprise{{ vm.companyCount > 1 ? "s" : "" }} suivie{{ vm.companyCount > 1 ? "s" : "" }}</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--invoices">
          <span class="small">Encours ouverts</span>
          <strong>{{ vm.outstandingCount }}</strong>
          <span>Client{{ vm.outstandingCount > 1 ? "s" : "" }} avec facture ou solde à suivre</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--payments">
          <span class="small">Signaux à suivre</span>
          <strong>{{ vm.actionableCount }}</strong>
          <span>Dossier{{ vm.actionableCount > 1 ? "s" : "" }} qui demande{{ vm.actionableCount > 1 ? "nt" : "" }} une action</span>
      </article>

      <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
                <input type="text" formControlName="search" placeholder="Rechercher un client" />
      </label>

      <div billingWorkspaceFilter class="billing-home-filter-trailing">
        <label class="billing-home-filter-chip">
                  <select formControlName="type">
                    <option value="all">Tous les types</option>
                    <option value="company">Entreprise</option>
                    <option value="individual">Particulier</option>
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
                        <span class="small">Signal</span>
                        <select formControlName="signal">
                          <option value="all">Tous les signaux</option>
                          <option value="actionable">Signal prioritaire</option>
                          <option value="stable">Sous contrôle</option>
                        </select>
                      </label>

                      <label class="cfm-billing-filter-field">
                        <span class="small">Email</span>
                        <select formControlName="emailStatus">
                          <option value="all">Tous</option>
                          <option value="filled">Renseigné</option>
                          <option value="missing">Manquant</option>
                        </select>
                      </label>

                      <label class="cfm-billing-filter-field">
                        <span class="small">Téléphone</span>
                        <select formControlName="phoneStatus">
                          <option value="all">Tous</option>
                          <option value="filled">Renseigné</option>
                          <option value="missing">Manquant</option>
                        </select>
                      </label>
                    </div>

                    <div class="cfm-billing-filter-toggles">
                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="outstandingOnly" />
                        <span>Avec encours</span>
                      </label>

                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="quotesOnly" />
                        <span>Avec devis actifs</span>
                      </label>

                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="invoicesOnly" />
                        <span>Avec factures</span>
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

      <span billingWorkspaceRegisterHead>Client</span>
      <span billingWorkspaceRegisterHead>Contact</span>
      <span billingWorkspaceRegisterHead>Signal</span>
      <span billingWorkspaceRegisterHead>Activité</span>
      <span billingWorkspaceRegisterHead>Action utile</span>

      <div billingWorkspaceRegisterBody class="cfm-billing-register" *ngIf="vm.customers.length > 0; else emptyList">
        <button
          *ngFor="let customer of vm.customers; trackBy: trackByCustomer"
          type="button"
          class="billing-home-row billing-home-row--overview"
          [class.is-selected]="vm.selected?.id === customer.id"
          (click)="selectCustomer(customer.id)"
        >
          <div class="billing-home-row-cell billing-home-row-primary">
            <strong class="record-primary entity-name">{{ customer.name }}</strong>
            <span class="record-meta">{{ customer.addressLabel }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ customer.contactPrimary }}</strong>
            <span class="record-meta">{{ customer.contactSecondary }}</span>
          </div>

          <div class="billing-home-row-cell billing-home-row-status">
            <span
              class="billing-home-status-pill"
              [class.is-danger]="customer.signalTone === 'danger'"
              [class.is-warning]="customer.signalTone === 'warning'"
              [class.is-success]="customer.signalTone === 'success'"
              [class.is-accent]="customer.signalTone === 'accent' || customer.signalTone === 'calm' || customer.signalTone === 'progress'"
            >
              {{ customer.signalLabel }}
            </span>
            <span class="record-meta">{{ customer.typeLabel }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ customer.outstandingLabel }}</strong>
            <span class="record-meta">{{ customer.quoteCountLabel }} · {{ customer.invoiceCountLabel }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ customer.nextActionLabel }}</strong>
            <span class="record-meta">{{ customer.activityLabel }}</span>
          </div>
        </button>
      </div>

      <article billingWorkspaceRail class="billing-home-rail-card cfm-billing-sticky-card" *ngIf="vm.selected as customer; else emptyDetail">
              <section class="billing-home-rail-preview">
                <header class="billing-home-rail-preview-head">
                  <span class="panel-kicker">Aperçu client</span>
                </header>

                <div class="billing-home-rail-preview-copy">
                  <h4>{{ customer.name }}</h4>
                  <p>{{ customer.addressLabel }}</p>
                </div>

                <span
                  class="billing-home-preview-status"
                  [class.is-danger]="customer.signalTone === 'danger'"
                  [class.is-warning]="customer.signalTone === 'warning'"
                  [class.is-success]="customer.signalTone === 'success'"
                  [class.is-accent]="customer.signalTone === 'accent' || customer.signalTone === 'calm' || customer.signalTone === 'progress'"
                >
                  {{ customer.signalLabel }}
                </span>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Action utile</span>
                  <h4 class="cfm-billing-section-title">{{ customer.nextActionLabel }}</h4>
                </header>

                <div class="cfm-billing-highlight">
                  <strong>{{ customer.activityLabel }}</strong>
                  <span>{{ customer.outstandingLabel }}</span>
                </div>

                <div class="billing-home-rail-actions" *ngIf="ctx.canActOnBilling">
                  <cfm-button type="button" size="sm" class="billing-home-rail-primary-button" (click)="ctx.prepareInvoiceFromCustomer(customer.id)">
                    Préparer une facture
                  </cfm-button>

                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button type="button" variant="secondary" size="sm" (click)="ctx.prepareQuoteFromCustomer(customer.id)">
                      Préparer un devis
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
                  <li><span>Encours</span><strong>{{ customer.outstandingLabel }}</strong></li>
                  <li><span>Signal principal</span><strong>{{ customer.signalLabel }}</strong></li>
                  <li><span>Devis</span><strong>{{ customer.quoteCountLabel }}</strong></li>
                  <li><span>Factures</span><strong>{{ customer.invoiceCountLabel }}</strong></li>
                </ul>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Historique léger</span>
                  <h4 class="cfm-billing-section-title">Coordonnées & notes</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Email</span><strong>{{ customer.raw.email || "Non renseigné" }}</strong></li>
                  <li><span>Téléphone</span><strong>{{ customer.raw.phone || "Non renseigné" }}</strong></li>
                  <li><span>Adresse</span><strong>{{ customer.addressLabel }}</strong></li>
                  <li><span>Notes</span><strong>{{ customer.notesLabel }}</strong></li>
                </ul>
              </section>
      </article>

      <article billingWorkspaceSecondary class="cfm-tonal-panel cfm-tonal-panel--flat cfm-billing-section">
          <header class="cfm-billing-section-head">
            <div class="cfm-billing-section-copy">
              <span class="panel-kicker">Repères commerciaux</span>
              <h4 class="cfm-billing-section-title">Portefeuille & couverture</h4>
              <p>Les repères de portefeuille passent après la structure commune du workspace et ne concurrencent plus le registre.</p>
            </div>
          </header>

          <div class="cfm-billing-summary-row">
            <span class="cfm-billing-meta-pill">{{ vm.companyCount }} entreprise{{ vm.companyCount > 1 ? "s" : "" }}</span>
            <span class="cfm-billing-meta-pill">{{ vm.individualCount }} particulier{{ vm.individualCount > 1 ? "s" : "" }}</span>
            <span class="cfm-billing-meta-pill cfm-billing-meta-pill--warning">{{ vm.missingContactCount }} contact{{ vm.missingContactCount > 1 ? "s" : "" }} à compléter</span>
          </div>
      </article>
    </cfm-desktop-billing-workspace-shell>

    <ng-template #emptyList>
      <section billingWorkspaceRegisterBody class="compact-empty">
        <strong>Aucun client visible</strong>
        <p>Ajoutez un client ou ajustez les filtres pour retrouver la bonne fiche.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="compact-empty compact-empty--detail">
        <strong>Aucun client sélectionné</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir la fiche client.</p>
      </section>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .compact-empty {
        min-height: 16rem;
        align-content: center;
      }
    `,
  ],
})
export class DesktopBillingCustomersPageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly secondarySectionKey = "billing-customers";
  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    type: new FormControl<"all" | "company" | "individual">("all", { nonNullable: true }),
    signal: new FormControl<CustomerSignalFilter>(CUSTOMER_ADVANCED_FILTER_DEFAULTS.signal, { nonNullable: true }),
    emailStatus: new FormControl<CustomerContactFilter>(CUSTOMER_ADVANCED_FILTER_DEFAULTS.emailStatus, { nonNullable: true }),
    phoneStatus: new FormControl<CustomerContactFilter>(CUSTOMER_ADVANCED_FILTER_DEFAULTS.phoneStatus, { nonNullable: true }),
    outstandingOnly: new FormControl(CUSTOMER_ADVANCED_FILTER_DEFAULTS.outstandingOnly, { nonNullable: true }),
    quotesOnly: new FormControl(CUSTOMER_ADVANCED_FILTER_DEFAULTS.quotesOnly, { nonNullable: true }),
    invoicesOnly: new FormControl(CUSTOMER_ADVANCED_FILTER_DEFAULTS.invoicesOnly, { nonNullable: true }),
  });

  filtersOpen = false;
  private readonly selectedCustomerId$ = new BehaviorSubject<string | null>(null);

  constructor() {
    this.secondarySection.activate(this.secondarySectionKey);
    this.destroyRef.onDestroy(() => this.secondarySection.clear(this.secondarySectionKey));
  }

  readonly filteredCustomers$ = combineLatest([
    this.ctx.billingState$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([_state, filters]) => {
      const search = this.toSearchableText(filters.search);
      const signal = filters.signal ?? CUSTOMER_ADVANCED_FILTER_DEFAULTS.signal;
      const emailStatus = filters.emailStatus ?? CUSTOMER_ADVANCED_FILTER_DEFAULTS.emailStatus;
      const phoneStatus = filters.phoneStatus ?? CUSTOMER_ADVANCED_FILTER_DEFAULTS.phoneStatus;

      return this.ctx.billingCustomers
        .filter((customer) => {
          const matchesSearch =
            search.length === 0
            || this.toSearchableText(
              `${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""} ${customer.address ?? ""} ${customer.notes ?? ""}`,
            ).includes(search);
          const matchesType = filters.type === "all" || customer.customer_type === filters.type;
          const matchesSignal = this.matchesSignalFilter(customer, signal);
          const matchesEmail = this.matchesContactFilter(customer.email, emailStatus);
          const matchesPhone = this.matchesContactFilter(customer.phone, phoneStatus);
          const matchesOutstanding = !filters.outstandingOnly || this.hasOutstanding(customer.id);
          const matchesQuotes = !filters.quotesOnly || this.hasQuotes(customer.id);
          const matchesInvoices = !filters.invoicesOnly || this.hasInvoices(customer.id);
          return matchesSearch
            && matchesType
            && matchesSignal
            && matchesEmail
            && matchesPhone
            && matchesOutstanding
            && matchesQuotes
            && matchesInvoices;
        })
        .map((customer) => this.toCustomerVm(customer));
    }),
  );

  readonly vm$ = combineLatest([
    this.filteredCustomers$,
    this.selectedCustomerId$.pipe(distinctUntilChanged()),
  ]).pipe(
    map(([customers, selectedId]) => {
      const selected = customers.find((customer) => customer.id === selectedId) ?? customers[0] ?? null;
      const companyCount = customers.filter((customer) => customer.raw.customer_type === "company").length;
      const individualCount = customers.length - companyCount;
      const outstandingCount = customers.filter((customer) => customer.outstandingLabel !== "Aucun encours").length;
      const actionableCount = customers.filter((customer) => customer.signalTone === "warning" || customer.signalTone === "danger").length;
      const missingContactCount = customers.filter(
        (customer) => !customer.raw.email?.trim() || !customer.raw.phone?.trim(),
      ).length;
      return { customers, selected, companyCount, individualCount, outstandingCount, actionableCount, missingContactCount };
    }),
  );

  toggleFiltersPopover(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      signal: CUSTOMER_ADVANCED_FILTER_DEFAULTS.signal,
      emailStatus: CUSTOMER_ADVANCED_FILTER_DEFAULTS.emailStatus,
      phoneStatus: CUSTOMER_ADVANCED_FILTER_DEFAULTS.phoneStatus,
      outstandingOnly: CUSTOMER_ADVANCED_FILTER_DEFAULTS.outstandingOnly,
      quotesOnly: CUSTOMER_ADVANCED_FILTER_DEFAULTS.quotesOnly,
      invoicesOnly: CUSTOMER_ADVANCED_FILTER_DEFAULTS.invoicesOnly,
    });
  }

  selectCustomer(customerId: string): void {
    this.selectedCustomerId$.next(customerId);
  }

  trackByCustomer(_index: number, item: CustomerWorkspaceItem): string {
    return item.id;
  }

  private matchesSignalFilter(customer: BillingCustomerRecord, signal: CustomerSignalFilter): boolean {
    if (signal === "all") {
      return true;
    }
    const customerVm = this.toCustomerVm(customer);
    const isActionable = customerVm.signalTone === "warning" || customerVm.signalTone === "danger";
    return signal === "actionable" ? isActionable : !isActionable;
  }

  private matchesContactFilter(value: string | null | undefined, filter: CustomerContactFilter): boolean {
    if (filter === "all") {
      return true;
    }
    const hasValue = Boolean(value && value.trim().length > 0);
    return filter === "filled" ? hasValue : !hasValue;
  }

  private hasOutstanding(customerId: string): boolean {
    return this.ctx.invoices.some(
      (invoice) => invoice.customer_id === customerId && invoice.outstanding_amount_cents > 0,
    );
  }

  private hasQuotes(customerId: string): boolean {
    return this.ctx.quotes.some((quote) => quote.customer_id === customerId);
  }

  private hasInvoices(customerId: string): boolean {
    return this.ctx.invoices.some((invoice) => invoice.customer_id === customerId);
  }

  private toCustomerVm(customer: BillingCustomerRecord): CustomerWorkspaceItem {
    const quotes = this.ctx.quotes.filter((quote) => quote.customer_id === customer.id);
    const invoices = this.ctx.invoices.filter((invoice) => invoice.customer_id === customer.id);
    const quoteWorkflows = quotes.map((quote) => this.ctx.getQuoteWorkflowState(quote));
    const invoiceWorkflows = invoices.map((invoice) => this.ctx.getInvoiceWorkflowState(invoice));
    const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;
    const quotesToConvert = quoteWorkflows.filter((workflow) => workflow.stageLabel === "À convertir").length;
    const quotesReadyToSend = quoteWorkflows.filter((workflow) => workflow.stageLabel === "Prêt à envoyer").length;
    const quotesToFollowUp = quoteWorkflows.filter((workflow) => workflow.stageLabel === "À relancer").length;
    const partialInvoices = invoiceWorkflows.filter((workflow) => workflow.stageLabel === "Partiellement réglée").length;
    const paymentExpected = invoiceWorkflows.filter((workflow) => workflow.stageLabel === "Paiement attendu").length;
    const outstandingAmount = invoices.reduce((sum, invoice) => sum + invoice.outstanding_amount_cents, 0);

    let signalLabel = "Aucun signal";
    let signalTone: CfmTone = "neutral";
    let nextActionLabel = "Préparer un devis";
    let activityLabel = `${quotes.length} devis · ${invoices.length} facture${invoices.length > 1 ? "s" : ""}`;

    if (overdueCount > 0) {
      signalLabel = `${overdueCount} facture${overdueCount > 1 ? "s" : ""} en retard`;
      signalTone = "danger";
      nextActionLabel = "Relancer paiement";
      activityLabel = `${overdueCount} à relancer · reste dû ${this.ctx.formatAmountCents(outstandingAmount)}`;
    } else if (quotesToConvert > 0) {
      signalLabel = `${quotesToConvert} devis à convertir`;
      signalTone = "warning";
      nextActionLabel = "Créer une facture";
      activityLabel = `${quotesToConvert} accepté${quotesToConvert > 1 ? "s" : ""} · étape suivante facturation`;
    } else if (quotesReadyToSend > 0) {
      signalLabel = `${quotesReadyToSend} devis prêt${quotesReadyToSend > 1 ? "s" : ""} à envoyer`;
      signalTone = "warning";
      nextActionLabel = "Envoyer le devis";
      activityLabel = `${quotesReadyToSend} brouillon${quotesReadyToSend > 1 ? "s" : ""} prêt${quotesReadyToSend > 1 ? "s" : ""}`;
    } else if (partialInvoices > 0) {
      signalLabel = `${partialInvoices} facture${partialInvoices > 1 ? "s" : ""} partielle${partialInvoices > 1 ? "s" : ""}`;
      signalTone = "warning";
      nextActionLabel = "Enregistrer un paiement";
      activityLabel = `Solde restant ${this.ctx.formatAmountCents(outstandingAmount)}`;
    } else if (paymentExpected > 0) {
      signalLabel = `Encours ${this.ctx.formatAmountCents(outstandingAmount)}`;
      signalTone = "warning";
      nextActionLabel = "Suivre encaissement";
      activityLabel = `${paymentExpected} paiement${paymentExpected > 1 ? "s" : ""} attendu${paymentExpected > 1 ? "s" : ""}`;
    } else if (quotesToFollowUp > 0) {
      signalLabel = `${quotesToFollowUp} devis à relancer`;
      signalTone = "warning";
      nextActionLabel = "Relancer devis";
      activityLabel = `${quotesToFollowUp} relance${quotesToFollowUp > 1 ? "s" : ""} commerciale${quotesToFollowUp > 1 ? "s" : ""}`;
    } else if (invoices.length > 0) {
      signalLabel = `${invoices.length} facture${invoices.length > 1 ? "s" : ""} suivie${invoices.length > 1 ? "s" : ""}`;
      signalTone = "success";
      nextActionLabel = "Préparer facture";
      activityLabel = `${invoices.length} facture${invoices.length > 1 ? "s" : ""} sous contrôle`;
    } else if (quotes.length > 0) {
      signalLabel = `${quotes.length} devis actif${quotes.length > 1 ? "s" : ""}`;
      signalTone = "calm";
      nextActionLabel = "Suivre devis";
      activityLabel = `${quotes.length} devis en cours`;
    }

    return {
      id: customer.id,
      raw: customer,
      name: customer.name,
      typeLabel: this.ctx.getCustomerTypeLabel(customer.customer_type),
      addressLabel: customer.address || "Adresse non renseignée",
      contactPrimary: customer.email || customer.phone || "Aucun contact rapide",
      contactSecondary: customer.email && customer.phone
        ? customer.phone
        : customer.email || customer.phone || "Coordonnée à compléter",
      activityLabel,
      outstandingLabel: outstandingAmount > 0 ? this.ctx.formatAmountCents(outstandingAmount) : "Aucun encours",
      signalLabel,
      signalTone,
      nextActionLabel,
      quoteCountLabel: `${quotes.length} actif${quotes.length > 1 ? "s" : ""}`,
      invoiceCountLabel: `${invoices.length} suivie${invoices.length > 1 ? "s" : ""}`,
      notesLabel: customer.notes || "Aucune note saisie pour le moment.",
    };
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
