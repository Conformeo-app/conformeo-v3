import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import type { InvoiceRecord, QuoteRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, type CfmTone } from "@conformeo/ui";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type CommercialExportItem = {
  id: string;
  title: string;
  customerName: string;
  stageLabel: string;
  stageTone: CfmTone;
  supportLabel: string;
  exportKind: "quote" | "invoice";
  quote: QuoteRecord | null;
  invoice: InvoiceRecord | null;
  sortRank: number;
};

type CommercialPrimaryAction =
  | { kind: "route"; label: string; route: string }
  | { kind: "quote"; label: string; quote: QuoteRecord }
  | { kind: "invoice"; label: string; invoice: InvoiceRecord }
  | null;

type ExportStageFilter = "all" | "ready" | "pending" | "to_convert" | "to_issue";

const EXPORT_ADVANCED_FILTER_DEFAULTS = {
  customerId: "all",
  worksiteId: "all",
  stage: "all" as ExportStageFilter,
  exportableOnly: false,
};

@Component({
  selector: "cfm-desktop-billing-exports-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CfmButtonComponent, CfmEmptyStateComponent, CfmStatusChipComponent, DesktopBillingWorkspaceShellComponent],
  template: `
    <ng-container *ngIf="allRegisterItems.length > 0; else emptyState">
        <cfm-desktop-billing-workspace-shell
          class="cfm-billing-page"
          [formGroup]="filterForm"
          kpiAriaLabel="Repères exports"
          registerHeadClass="billing-home-register-head--overview"
          [showRegisterHead]="filteredRegisterItems.length > 0"
          [hasSecondary]="true"
          [secondaryOpen]="secondarySection.isOpenFor(secondarySectionKey)"
        >
          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--quotes">
            <span class="small">Prêts à remettre</span>
            <strong>{{ filteredRegisterItems.length - filteredConvertCount - filteredIssueCount }}</strong>
            <span>Pièce{{ filteredRegisterItems.length - filteredConvertCount - filteredIssueCount > 1 ? "s" : "" }} directement exportable{{ filteredRegisterItems.length - filteredConvertCount - filteredIssueCount > 1 ? "s" : "" }}</span>
          </article>

          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--invoices">
            <span class="small">À convertir</span>
            <strong>{{ filteredConvertCount }}</strong>
            <span>Devis accepté{{ filteredConvertCount > 1 ? "s" : "" }} encore non facturé{{ filteredConvertCount > 1 ? "s" : "" }}</span>
          </article>

          <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--payments">
            <span class="small">À émettre</span>
            <strong>{{ filteredIssueCount }}</strong>
            <span>Facture{{ filteredIssueCount > 1 ? "s" : "" }} encore en brouillon</span>
          </article>

          <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
                  <input type="text" formControlName="search" placeholder="Client, référence, chantier" />
          </label>

          <div billingWorkspaceFilter class="billing-home-filter-trailing">
            <label class="billing-home-filter-chip">
                    <select formControlName="kind">
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

                        <label class="cfm-billing-filter-field">
                          <span class="small">État documentaire</span>
                          <select formControlName="stage">
                            <option value="all">Tous les états</option>
                            <option value="ready">Prêts à remettre</option>
                            <option value="pending">À traiter</option>
                            <option value="to_convert">À convertir</option>
                            <option value="to_issue">À émettre</option>
                          </select>
                        </label>
                      </div>

                      <div class="cfm-billing-filter-toggles">
                        <label class="cfm-billing-filter-checkbox">
                          <input type="checkbox" formControlName="exportableOnly" />
                          <span>Exportables</span>
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

          <span billingWorkspaceRegisterHead>Document</span>
          <span billingWorkspaceRegisterHead>Support</span>
          <span billingWorkspaceRegisterHead>Client</span>
          <span billingWorkspaceRegisterHead>Statut</span>
          <span billingWorkspaceRegisterHead>Action utile</span>

          <div billingWorkspaceRegisterBody class="cfm-billing-register" *ngIf="filteredRegisterItems.length > 0; else emptyList">
            <button
              *ngFor="let item of filteredRegisterItems; trackBy: trackByItem"
              type="button"
              class="billing-home-row billing-home-row--overview"
              [class.is-selected]="activeItem?.id === item.id"
              (click)="selectItem(item.id)"
            >
              <div class="billing-home-row-cell billing-home-row-primary">
                <strong class="record-primary">{{ getItemReference(item) }}</strong>
                <span class="record-meta">{{ item.title }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ item.supportLabel }}</strong>
                <span class="record-meta">{{ getItemKindLabel(item) }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ item.customerName }}</strong>
                <span class="record-meta">{{ getItemCoverageLabel(item) }}</span>
              </div>

              <div class="billing-home-row-cell billing-home-row-status">
                <span
                  class="billing-home-status-pill"
                  [class.is-danger]="item.stageTone === 'danger'"
                  [class.is-warning]="item.stageTone === 'warning'"
                  [class.is-success]="item.stageTone === 'success'"
                  [class.is-accent]="item.stageTone === 'accent' || item.stageTone === 'calm' || item.stageTone === 'progress'"
                >
                  {{ item.stageLabel }}
                </span>
                <span class="record-meta">{{ getItemRepereLabel(item) }}</span>
              </div>

              <div class="billing-home-row-cell">
                <strong class="detail-copy">{{ getItemActionLabel(item) }}</strong>
                <span class="record-meta">{{ getItemActionSummary(item) }}</span>
              </div>
            </button>
          </div>

          <article billingWorkspaceRail class="billing-home-rail-card cfm-billing-sticky-card" *ngIf="activeItem as item; else emptyDetail">
              <section class="billing-home-rail-preview">
                <header class="billing-home-rail-preview-head">
                  <span class="panel-kicker">Aperçu document</span>
                </header>

                <div class="billing-home-rail-preview-copy">
                  <h4>{{ getItemReference(item) }}</h4>
                  <p>{{ item.customerName }} · {{ item.supportLabel }}</p>
                </div>

                <span
                  class="billing-home-preview-status"
                  [class.is-danger]="item.stageTone === 'danger'"
                  [class.is-warning]="item.stageTone === 'warning'"
                  [class.is-success]="item.stageTone === 'success'"
                  [class.is-accent]="item.stageTone === 'accent' || item.stageTone === 'calm' || item.stageTone === 'progress'"
                >
                  {{ item.stageLabel }}
                </span>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Action utile</span>
                  <h4 class="cfm-billing-section-title">{{ getItemActionLabel(item) }}</h4>
                </header>

                <div class="cfm-billing-highlight">
                  <strong>{{ item.stageLabel }}</strong>
                  <span>{{ getItemActionSummary(item) }}</span>
                </div>

                <div class="billing-home-rail-actions">
                  <cfm-button
                    type="button"
                    class="billing-home-rail-primary-button"
                    [disabled]="isItemBusy(item)"
                    (click)="runItemAction(item)"
                  >
                    {{ isItemBusy(item) ? "Préparation..." : getItemActionLabel(item) }}
                  </cfm-button>
                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      (click)="openRoute(item.exportKind === 'quote' ? '/app/facturation/devis' : '/app/facturation/factures')"
                    >
                      Ouvrir la vue métier
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
                  <li><span>Client</span><strong>{{ item.customerName }}</strong></li>
                  <li><span>Support</span><strong>{{ item.supportLabel }}</strong></li>
                  <li><span>Référence</span><strong>{{ getItemReference(item) }}</strong></li>
                  <li><span>Repère</span><strong>{{ getItemRepereLabel(item) }}</strong></li>
                  <li><span>Type</span><strong>{{ getItemKindLabel(item) }}</strong></li>
                </ul>
              </section>

              <section class="billing-home-rail-section billing-home-rail-section--history">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Historique léger</span>
                  <h4 class="cfm-billing-section-title">Dernier état du dossier</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Statut</span><strong>{{ commercialStatusLabel }}</strong></li>
                  <li><span>Clients couverts</span><strong>{{ customersCoveredCount }}</strong></li>
                  <li><span>Chantiers liés</span><strong>{{ worksitesCoveredCount }}</strong></li>
                  <li><span>Pièces prêtes</span><strong>{{ exportableQuoteItems.length + exportableInvoiceItems.length }}</strong></li>
                  <li><span>Document ouvert</span><strong>{{ getItemKindLabel(item) }}</strong></li>
                </ul>
              </section>
          </article>

          <article billingWorkspaceSecondary class="cfm-tonal-panel cfm-tonal-panel--flat cfm-billing-section">
            <header class="cfm-billing-section-head">
              <div class="cfm-billing-section-copy">
                <span class="panel-kicker">Avant remise</span>
                <h4 class="cfm-billing-section-title">Ce qu’il faut traiter</h4>
                <p>Le dossier commercial reste secondaire : la structure commune garde d’abord KPI, filtres, registre et rail.</p>
              </div>
            </header>

            <div class="cfm-billing-highlight">
              <strong>{{ commercialStatusLabel }}</strong>
              <span>{{ commercialStatusSummary }}</span>
            </div>

            <ul class="cfm-billing-rail-list detail-copy" *ngIf="commercialMissingItems.length > 0; else readyCommercialDossier">
              <li *ngFor="let item of commercialMissingItems; trackBy: trackByLabel">
                <span>{{ item }}</span>
              </li>
            </ul>

            <div class="cfm-billing-rail-actions" *ngIf="primaryAction as action">
              <cfm-button
                *ngIf="action.kind === 'route'"
                type="button"
                (click)="openRoute(action.route)"
              >
                {{ action.label }}
              </cfm-button>

              <cfm-button
                *ngIf="action.kind === 'quote' && ctx.canExportBilling"
                type="button"
                [disabled]="ctx.quotePdfBusyId === action.quote.id"
                (click)="ctx.exportQuotePdf(action.quote)"
              >
                {{ ctx.quotePdfBusyId === action.quote.id ? "Préparation..." : action.label }}
              </cfm-button>

              <cfm-button
                *ngIf="action.kind === 'invoice' && ctx.canExportBilling"
                type="button"
                [disabled]="ctx.invoicePdfBusyId === action.invoice.id"
                (click)="ctx.exportInvoicePdf(action.invoice)"
              >
                {{ ctx.invoicePdfBusyId === action.invoice.id ? "Préparation..." : action.label }}
              </cfm-button>
            </div>
          </article>
        </cfm-desktop-billing-workspace-shell>
    </ng-container>

    <ng-template #readyCommercialDossier>
      <section billingWorkspaceSecondary class="cfm-billing-empty">
        <strong>Dossier commercial prêt</strong>
        <p>Les pièces utiles sont déjà préparées et les exports peuvent être lancés sans étape supplémentaire.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="cfm-billing-empty">
        <strong>Aucun document sélectionné</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir le résumé documentaire.</p>
      </section>
    </ng-template>

    <ng-template #emptyList>
      <section billingWorkspaceRegisterBody class="cfm-billing-empty">
        <strong>Aucun document visible</strong>
        <p>Ajustez les filtres pour retrouver la bonne pièce du dossier commercial.</p>
      </section>
    </ng-template>

    <ng-template #emptyState>
      <cfm-empty-state
        title="Aucun dossier commercial prêt"
        description="Préparez au moins un devis ou une facture pour constituer un dossier à remettre."
      />
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

    `,
  ],
})
export class DesktopBillingExportsPageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly secondarySectionKey = "billing-exports";

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    kind: new FormControl<"all" | "quote" | "invoice">("all", { nonNullable: true }),
    customerId: new FormControl(EXPORT_ADVANCED_FILTER_DEFAULTS.customerId, { nonNullable: true }),
    worksiteId: new FormControl(EXPORT_ADVANCED_FILTER_DEFAULTS.worksiteId, { nonNullable: true }),
    stage: new FormControl<ExportStageFilter>(EXPORT_ADVANCED_FILTER_DEFAULTS.stage, { nonNullable: true }),
    exportableOnly: new FormControl(EXPORT_ADVANCED_FILTER_DEFAULTS.exportableOnly, { nonNullable: true }),
  });

  filtersOpen = false;
  private activeItemId: string | null = null;

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

  get allRegisterItems(): CommercialExportItem[] {
    return [...this.exportableQuoteItems, ...this.exportableInvoiceItems].sort(
      (left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title),
    );
  }

  get filteredRegisterItems(): CommercialExportItem[] {
    const filters = this.filterForm.getRawValue();
    const search = this.toSearchableText(filters.search);
    const worksiteId = filters.worksiteId ?? EXPORT_ADVANCED_FILTER_DEFAULTS.worksiteId;
    const stage = filters.stage ?? EXPORT_ADVANCED_FILTER_DEFAULTS.stage;
    return this.allRegisterItems.filter((item) => {
      const matchesSearch =
        search.length === 0
        || this.toSearchableText(
          `${this.getItemReference(item)} ${item.title} ${item.customerName} ${item.supportLabel} ${item.stageLabel}`,
        ).includes(search);
      const matchesKind = filters.kind === "all" || item.exportKind === filters.kind;
      const matchesCustomer = filters.customerId === "all" || this.getItemCustomerId(item) === filters.customerId;
      const matchesWorksite = this.matchesWorksiteFilter(item, worksiteId);
      const matchesStage = this.matchesStageFilter(item, stage);
      const matchesExportable = !filters.exportableOnly || this.canExportItem(item);
      return matchesSearch && matchesKind && matchesCustomer && matchesWorksite && matchesStage && matchesExportable;
    });
  }

  get activeItem(): CommercialExportItem | null {
    if (this.activeItemId) {
      const explicit = this.filteredRegisterItems.find((item) => item.id === this.activeItemId);
      if (explicit) {
        return explicit;
      }
    }
    return this.filteredRegisterItems[0] ?? null;
  }

  get exportableQuoteItems(): CommercialExportItem[] {
    return [...this.ctx.quotes]
      .filter((quote) => quote.status !== "declined")
      .map((quote) => {
        const workflow = this.ctx.getQuoteWorkflowState(quote);
        return {
          id: quote.id,
          title: quote.title || quote.number,
          customerName: quote.customer_name,
          stageLabel: workflow.stageLabel,
          stageTone: workflow.stageTone,
          supportLabel: quote.worksite_name || "Sans chantier",
          exportKind: "quote" as const,
          quote,
          invoice: null,
          sortRank: workflow.sortRank,
        };
      })
      .sort((left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title));
  }

  get exportableInvoiceItems(): CommercialExportItem[] {
    return [...this.ctx.invoices]
      .map((invoice) => {
        const workflow = this.ctx.getInvoiceWorkflowState(invoice);
        return {
          id: invoice.id,
          title: invoice.title || invoice.number,
          customerName: invoice.customer_name,
          stageLabel: workflow.stageLabel,
          stageTone: workflow.stageTone,
          supportLabel: invoice.worksite_name || "Sans chantier",
          exportKind: "invoice" as const,
          quote: null,
          invoice,
          sortRank: workflow.sortRank,
        };
      })
      .sort((left, right) => left.sortRank - right.sortRank || left.title.localeCompare(right.title));
  }

  get filteredQuoteCount(): number {
    return this.filteredRegisterItems.filter((item) => item.exportKind === "quote").length;
  }

  get filteredInvoiceCount(): number {
    return this.filteredRegisterItems.filter((item) => item.exportKind === "invoice").length;
  }

  get filteredConvertCount(): number {
    return this.filteredRegisterItems.filter((item) => item.stageLabel === "À convertir").length;
  }

  get filteredIssueCount(): number {
    return this.filteredRegisterItems.filter((item) => item.stageLabel === "À émettre").length;
  }

  get acceptedQuotesCount(): number {
    return this.ctx.quotes.filter((quote) => this.ctx.getQuoteWorkflowState(quote).stageLabel === "À convertir").length;
  }

  get draftInvoicesCount(): number {
    return this.ctx.invoices.filter((invoice) => this.ctx.getInvoiceWorkflowState(invoice).stageLabel === "À émettre").length;
  }

  get customersCoveredCount(): number {
    return new Set(
      [...this.exportableQuoteItems.map((item) => item.customerName), ...this.exportableInvoiceItems.map((item) => item.customerName)],
    ).size;
  }

  get worksitesCoveredCount(): number {
    return new Set(
      [...this.exportableQuoteItems.map((item) => item.supportLabel), ...this.exportableInvoiceItems.map((item) => item.supportLabel)]
        .filter((label) => label !== "Sans chantier"),
    ).size;
  }

  get commercialStatusLabel(): string {
    if (this.exportableQuoteItems.length === 0 && this.exportableInvoiceItems.length === 0) {
      return "À compléter";
    }
    if (this.acceptedQuotesCount > 0 || this.draftInvoicesCount > 0) {
      return "Incomplet";
    }
    return "Prêt à remettre";
  }

  get commercialStatusTone(): CfmTone {
    if (this.exportableQuoteItems.length === 0 && this.exportableInvoiceItems.length === 0) {
      return "warning";
    }
    if (this.acceptedQuotesCount > 0 || this.draftInvoicesCount > 0) {
      return "warning";
    }
    return "success";
  }

  get commercialStatusSummary(): string {
    if (this.exportableQuoteItems.length === 0 && this.exportableInvoiceItems.length === 0) {
      return "Le dossier commercial n'a pas encore de pièce à remettre. Préparez un devis ou émettez une facture pour constituer une remise client.";
    }
    if (this.acceptedQuotesCount > 0) {
      return "Le dossier contient déjà des pièces commerciales, mais un ou plusieurs devis acceptés attendent encore leur conversion en facture.";
    }
    if (this.draftInvoicesCount > 0) {
      return "Le dossier est presque prêt, mais certaines factures restent en brouillon. Émettez-les avant remise finale.";
    }
    return "Le dossier commercial est prêt : vous voyez ici les pièces exportables à remettre au client ou au comptable.";
  }

  get commercialMissingItems(): string[] {
    const items: string[] = [];
    if (this.acceptedQuotesCount > 0) {
      items.push(`${this.acceptedQuotesCount} devis accepté${this.acceptedQuotesCount > 1 ? "s" : ""} à convertir en facture`);
    }
    if (this.draftInvoicesCount > 0) {
      items.push(`${this.draftInvoicesCount} facture${this.draftInvoicesCount > 1 ? "s" : ""} encore à émettre`);
    }
    if (this.exportableQuoteItems.length === 0) {
      items.push("Aucun devis prêt à remettre");
    }
    if (!this.exportableInvoiceItems.some((item) => item.stageLabel !== "À émettre")) {
      items.push("Aucune facture déjà émise dans le dossier");
    }
    return items.slice(0, 4);
  }

  get primaryAction(): CommercialPrimaryAction {
    if (this.acceptedQuotesCount > 0) {
      return { kind: "route", label: "Ouvrir les devis à convertir", route: "/app/facturation/devis" };
    }
    if (this.draftInvoicesCount > 0) {
      return { kind: "route", label: "Ouvrir les factures à émettre", route: "/app/facturation/factures" };
    }

    const firstIssuedInvoice = this.exportableInvoiceItems.find((item) => item.stageLabel !== "À émettre" && item.invoice);
    if (firstIssuedInvoice?.invoice) {
      return { kind: "invoice", label: "Exporter la facture prioritaire", invoice: firstIssuedInvoice.invoice };
    }

    const firstQuote = this.exportableQuoteItems.find((item) => item.quote);
    if (firstQuote?.quote) {
      return { kind: "quote", label: "Exporter le devis prioritaire", quote: firstQuote.quote };
    }

    return null;
  }

  toggleFiltersPopover(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      customerId: EXPORT_ADVANCED_FILTER_DEFAULTS.customerId,
      worksiteId: EXPORT_ADVANCED_FILTER_DEFAULTS.worksiteId,
      stage: EXPORT_ADVANCED_FILTER_DEFAULTS.stage,
      exportableOnly: EXPORT_ADVANCED_FILTER_DEFAULTS.exportableOnly,
    });
  }

  selectItem(itemId: string): void {
    this.activeItemId = itemId;
  }

  async openRoute(route: string): Promise<void> {
    await this.router.navigateByUrl(route);
  }

  getItemKindLabel(item: CommercialExportItem): string {
    return item.exportKind === "quote" ? "Devis" : "Facture";
  }

  getItemReference(item: CommercialExportItem): string {
    return item.quote?.number ?? item.invoice?.number ?? item.title;
  }

  getItemCoverageLabel(item: CommercialExportItem): string {
    return item.supportLabel === "Sans chantier" ? "Sans chantier lié" : item.supportLabel;
  }

  getItemRepereLabel(item: CommercialExportItem): string {
    if (item.quote?.valid_until) {
      return `Valable jusqu’au ${new Date(item.quote.valid_until).toLocaleDateString("fr-FR")}`;
    }
    if (item.invoice?.due_date) {
      return `Échéance ${new Date(item.invoice.due_date).toLocaleDateString("fr-FR")}`;
    }
    if (item.quote) {
      return `Émis le ${new Date(item.quote.issue_date).toLocaleDateString("fr-FR")}`;
    }
    if (item.invoice) {
      return `Émise le ${new Date(item.invoice.issue_date).toLocaleDateString("fr-FR")}`;
    }
    return "Repère non précisé";
  }

  getItemActionLabel(item: CommercialExportItem): string {
    if (item.exportKind === "quote" && item.stageLabel === "À convertir") {
      return "Ouvrir les devis";
    }
    if (item.exportKind === "invoice" && item.stageLabel === "À émettre") {
      return "Ouvrir les factures";
    }
    return item.exportKind === "quote" ? "Exporter le devis" : "Exporter la facture";
  }

  getItemActionSummary(item: CommercialExportItem): string {
    if (item.exportKind === "quote" && item.stageLabel === "À convertir") {
      return "Le devis est déjà dans le dossier, mais la bascule en facture reste à traiter.";
    }
    if (item.exportKind === "invoice" && item.stageLabel === "À émettre") {
      return "La facture existe dans le flux, mais elle doit encore être émise avant remise.";
    }
    return item.exportKind === "quote"
      ? "Le PDF peut être remis ou exporté directement depuis ce dossier commercial."
      : "La facture est prête à être exportée comme pièce de remise ou d’archivage.";
  }

  canExportItem(item: CommercialExportItem): boolean {
    if (!this.ctx.canExportBilling) {
      return false;
    }
    if (item.exportKind === "quote") {
      return item.quote !== null && item.stageLabel !== "À convertir";
    }
    return item.invoice !== null && item.stageLabel !== "À émettre";
  }

  isItemBusy(item: CommercialExportItem): boolean {
    if (item.exportKind === "quote") {
      return this.ctx.quotePdfBusyId === item.id;
    }
    return this.ctx.invoicePdfBusyId === item.id;
  }

  async runItemAction(item: CommercialExportItem): Promise<void> {
    if (item.exportKind === "quote" && item.stageLabel === "À convertir") {
      await this.openRoute("/app/facturation/devis");
      return;
    }

    if (item.exportKind === "invoice" && item.stageLabel === "À émettre") {
      await this.openRoute("/app/facturation/factures");
      return;
    }

    if (!this.canExportItem(item)) {
      return;
    }

    if (item.quote) {
      await this.ctx.exportQuotePdf(item.quote);
      return;
    }

    if (item.invoice) {
      await this.ctx.exportInvoicePdf(item.invoice);
    }
  }

  trackByItem(_index: number, item: CommercialExportItem): string {
    return item.id;
  }

  trackByLabel(_index: number, item: string): string {
    return item;
  }

  private matchesWorksiteFilter(item: CommercialExportItem, worksiteId: string): boolean {
    if (worksiteId === "all") {
      return true;
    }
    const itemWorksiteId = item.quote?.worksite_id ?? item.invoice?.worksite_id ?? null;
    if (worksiteId === "none") {
      return itemWorksiteId === null;
    }
    return itemWorksiteId === worksiteId;
  }

  private matchesStageFilter(item: CommercialExportItem, stage: ExportStageFilter): boolean {
    switch (stage) {
      case "ready":
        return item.stageLabel !== "À convertir" && item.stageLabel !== "À émettre";
      case "pending":
        return item.stageLabel === "À convertir" || item.stageLabel === "À émettre";
      case "to_convert":
        return item.stageLabel === "À convertir";
      case "to_issue":
        return item.stageLabel === "À émettre";
      case "all":
      default:
        return true;
    }
  }

  private getItemCustomerId(item: CommercialExportItem): string | null {
    return item.quote?.customer_id ?? item.invoice?.customer_id ?? null;
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }
}
