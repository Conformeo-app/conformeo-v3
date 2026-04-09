import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import type { BillingFollowUpStatus, InvoiceRecord } from "@conformeo/contracts";
import { CfmButtonComponent, CfmStatusChipComponent } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith, tap } from "rxjs";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopBillingSecondarySectionService } from "./desktop-billing-secondary-section.service";
import { DesktopModalShellComponent } from "./desktop-modal-shell.component";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type FollowUpModalState = {
  invoice: InvoiceRecord;
  targetStatus: BillingFollowUpStatus;
} | null;

type InvoiceDueWindowFilter = "all" | "soon" | "overdue";
type InvoiceSettlementFilter = "all" | "settled" | "unsettled";

const INVOICE_ADVANCED_FILTER_DEFAULTS = {
  customerId: "all",
  worksiteId: "all",
  dueWindow: "all" as InvoiceDueWindowFilter,
  settlement: "all" as InvoiceSettlementFilter,
  outstandingOnly: false,
  partialOnly: false,
};

@Component({
  selector: "cfm-desktop-billing-invoices-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CfmButtonComponent,
    CfmStatusChipComponent,
    DesktopModalShellComponent,
    DesktopBillingWorkspaceShellComponent,
  ],
  template: `
    <cfm-desktop-billing-workspace-shell
      class="cfm-billing-page"
      *ngIf="vm$ | async as vm"
      [formGroup]="filterForm"
      kpiAriaLabel="Repères factures"
      registerHeadClass="billing-home-register-head--overview"
      [showRegisterHead]="vm.invoices.length > 0"
      [hasSecondary]="true"
      [secondaryOpen]="secondarySection.isOpenFor(secondarySectionKey)"
    >
      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--quotes">
          <span class="small">À émettre</span>
          <strong>{{ draftInvoicesCount }}</strong>
          <span>Facture{{ draftInvoicesCount > 1 ? "s" : "" }} encore en brouillon</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--invoices">
          <span class="small">Paiements attendus</span>
          <strong>{{ paymentExpectedCount }}</strong>
          <span>Facture{{ paymentExpectedCount > 1 ? "s" : "" }} en attente d’encaissement</span>
      </article>

      <article billingWorkspaceKpi class="cfm-billing-kpi cfm-billing-kpi--payments">
          <span class="small">En retard</span>
          <strong>{{ ctx.overdueInvoicesCount }}</strong>
          <span>Dossier{{ ctx.overdueInvoicesCount > 1 ? "s" : "" }} à relancer en priorité</span>
      </article>

      <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
                <input type="text" formControlName="search" placeholder="Rechercher une facture" />
      </label>

      <div billingWorkspaceFilter class="billing-home-filter-trailing">
        <label class="billing-home-filter-chip">
                  <select formControlName="status">
                    <option value="all">Tous les statuts</option>
                    <option value="draft">À émettre</option>
                    <option value="issued">Émises</option>
                    <option value="paid">Soldées</option>
                    <option value="overdue">En retard</option>
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
                        <span class="small">Échéance</span>
                        <select formControlName="dueWindow">
                          <option value="all">Toutes les échéances</option>
                          <option value="soon">Proche (14 jours)</option>
                          <option value="overdue">En retard</option>
                        </select>
                      </label>

                      <label class="cfm-billing-filter-field">
                        <span class="small">Soldée / non soldée</span>
                        <select formControlName="settlement">
                          <option value="all">Toutes</option>
                          <option value="settled">Soldées</option>
                          <option value="unsettled">Non soldées</option>
                        </select>
                      </label>
                    </div>

                    <div class="cfm-billing-filter-toggles">
                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="outstandingOnly" />
                        <span>Montant ouvert</span>
                      </label>

                      <label class="cfm-billing-filter-checkbox">
                        <input type="checkbox" formControlName="partialOnly" />
                        <span>Partiellement réglée</span>
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

      <span billingWorkspaceRegisterHead>Facture</span>
      <span billingWorkspaceRegisterHead>Client</span>
      <span billingWorkspaceRegisterHead>Statut & échéance</span>
      <span billingWorkspaceRegisterHead>Paiement</span>
      <span billingWorkspaceRegisterHead>Action utile</span>

      <div billingWorkspaceRegisterBody class="cfm-billing-register" *ngIf="vm.invoices.length > 0; else emptyList">
        <button
          *ngFor="let invoice of vm.invoices; trackBy: trackByInvoice"
          type="button"
          class="billing-home-row billing-home-row--overview"
          [class.is-selected]="vm.selected?.id === invoice.id"
          [class.is-overdue]="invoice.status === 'overdue'"
          [class.is-draft]="getInvoiceWorkflow(invoice).stageLabel === 'À émettre' || getInvoiceWorkflow(invoice).stageLabel === 'Partiellement réglée'"
          (click)="selectInvoice(invoice.id)"
        >
          <div class="billing-home-row-cell billing-home-row-primary">
            <strong class="record-primary invoice-number">{{ invoice.number }}</strong>
            <span class="record-meta">{{ invoice.title || "Facture sans libellé" }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ invoice.customer_name }}</strong>
            <span class="record-meta">{{ invoice.worksite_name || "Sans chantier" }}</span>
          </div>

          <div class="billing-home-row-cell billing-home-row-status">
            <span
              class="billing-home-status-pill"
              [class.is-danger]="getInvoiceWorkflow(invoice).stageTone === 'danger'"
              [class.is-warning]="getInvoiceWorkflow(invoice).stageTone === 'warning'"
              [class.is-success]="getInvoiceWorkflow(invoice).stageTone === 'success'"
              [class.is-accent]="getInvoiceWorkflow(invoice).stageTone === 'accent' || getInvoiceWorkflow(invoice).stageTone === 'calm' || getInvoiceWorkflow(invoice).stageTone === 'progress'"
            >
              {{ getInvoiceWorkflow(invoice).stageLabel }}
            </span>
            <span class="record-meta">
              {{ getInvoiceWorkflow(invoice).priorityLabel }} · {{ invoice.due_date ? ('Échéance ' + (invoice.due_date | date:'shortDate')) : "Échéance à préciser" }}
            </span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ ctx.formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</strong>
            <span class="record-meta">
              Payé {{ ctx.formatAmountCents(invoice.paid_amount_cents, invoice.currency) }}
              · reste {{ ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}
            </span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ getInvoiceNextActionLabel(invoice) }}</strong>
            <span class="record-meta">{{ getInvoiceSignalLabel(invoice) }}</span>
          </div>
        </button>
      </div>

      <article billingWorkspaceRail class="billing-home-rail-card cfm-billing-sticky-card" *ngIf="vm.selected as invoice; else emptyDetail">
              <section class="billing-home-rail-preview">
                <header class="billing-home-rail-preview-head">
                  <span class="panel-kicker">Aperçu facture</span>
                </header>

                <div class="billing-home-rail-preview-copy">
                  <h4>{{ invoice.number }}</h4>
                  <p>Émise le {{ invoice.issue_date | date:'longDate' }}</p>
                </div>

                <span
                  class="billing-home-preview-status"
                  [class.is-danger]="getInvoiceWorkflow(invoice).stageTone === 'danger'"
                  [class.is-warning]="getInvoiceWorkflow(invoice).stageTone === 'warning'"
                  [class.is-success]="getInvoiceWorkflow(invoice).stageTone === 'success'"
                  [class.is-accent]="getInvoiceWorkflow(invoice).stageTone === 'accent' || getInvoiceWorkflow(invoice).stageTone === 'calm' || getInvoiceWorkflow(invoice).stageTone === 'progress'"
                >
                  {{ getInvoiceWorkflow(invoice).stageLabel }}
                </span>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Action utile</span>
                  <h4 class="cfm-billing-section-title">{{ getInvoiceRailPrimaryActionLabel(invoice) || getInvoiceNextActionLabel(invoice) }}</h4>
                </header>

                <div class="cfm-billing-highlight">
                  <strong>{{ getInvoiceWorkflow(invoice).paymentSummaryLabel }}</strong>
                  <span>{{ getInvoiceNextActionSummary(invoice) }}</span>
                </div>

                <div class="billing-home-rail-actions">
                  <cfm-button
                    type="button"
                    class="billing-home-rail-primary-button"
                    *ngIf="getInvoiceRailPrimaryActionLabel(invoice) as primaryLabel"
                    [disabled]="isInvoiceRailPrimaryActionBusy(invoice)"
                    (click)="runInvoiceRailPrimaryAction(invoice)"
                  >
                    {{ isInvoiceRailPrimaryActionBusy(invoice) ? getInvoiceRailPrimaryActionBusyLabel(invoice) : primaryLabel }}
                  </cfm-button>

                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button
                      type="button"
                      variant="secondary"
                      *ngIf="showInvoiceRailFollowUpSecondary(invoice)"
                      [disabled]="ctx.invoiceFollowUpBusyId === invoice.id"
                      (click)="openFollowUpModal(invoice)"
                    >
                      {{ getFollowUpActionLabel(invoice) }}
                    </cfm-button>

                    <cfm-button
                      variant="secondary"
                      type="button"
                      size="sm"
                      *ngIf="showInvoiceRailPdfSecondary(invoice)"
                      [disabled]="ctx.invoicePdfBusyId === invoice.id"
                      (click)="ctx.exportInvoicePdf(invoice)"
                    >
                      {{ ctx.invoicePdfBusyId === invoice.id ? "PDF..." : "Exporter PDF" }}
                    </cfm-button>
                  </div>
                </div>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Repères clés</span>
                  <h4 class="cfm-billing-section-title">Lecture facture</h4>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Client</span><strong>{{ invoice.customer_name }}</strong></li>
                  <li><span>Chantier</span><strong>{{ invoice.worksite_name || "Aucun" }}</strong></li>
                  <li><span>Référence</span><strong>{{ invoice.number }}</strong></li>
                  <li><span>Échéance</span><strong>{{ invoice.due_date ? (invoice.due_date | date:'shortDate') : "Non précisée" }}</strong></li>
                  <li><span>Montant dû</span><strong>{{ ctx.formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</strong></li>
                  <li><span>Déjà réglé</span><strong>{{ ctx.formatAmountCents(invoice.paid_amount_cents, invoice.currency) }}</strong></li>
                  <li><span>Reste dû</span><strong>{{ ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}</strong></li>
                  <li><span>Contenu</span><strong>{{ invoice.line_items.length }} ligne{{ invoice.line_items.length > 1 ? 's' : '' }}</strong></li>
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
                    [disabled]="ctx.invoiceHistoryBusyId === invoice.id"
                    (click)="loadInvoiceHistory(invoice)"
                  >
                    {{
                      ctx.invoiceHistoryBusyId === invoice.id
                        ? "Chargement..."
                        : ctx.invoiceHistoryOpenId === invoice.id
                          ? "Masquer"
                          : "Charger"
                    }}
                  </cfm-button>
                </header>

                <ul class="cfm-billing-data-list detail-copy">
                  <li><span>Signal</span><strong>{{ getInvoiceSignalLabel(invoice) }}</strong></li>
                  <li><span>Relance</span><strong>{{ ctx.getBillingFollowUpStatusLabel(invoice.follow_up_status) }}</strong></li>
                  <li><span>Encaissement</span><strong>{{ getInvoiceWorkflow(invoice).paymentSummaryLabel }}</strong></li>
                  <li><span>Notes</span><strong>{{ invoice.notes || "Aucune note" }}</strong></li>
                </ul>

                <ul class="cfm-billing-rail-list detail-copy" *ngIf="ctx.invoiceHistoryOpenId === invoice.id && ctx.getInvoiceHistory(invoice.id).length > 0; else noHistory">
                  <li *ngFor="let log of ctx.getInvoiceHistory(invoice.id); trackBy: trackByHistory">
                    <span>{{ ctx.getBillingHistoryLabel(log) }}</span>
                    <strong class="timestamp">{{ log.occurred_at | date:'short' }}</strong>
                  </li>
                </ul>
              </section>
      </article>

      <article billingWorkspaceSecondary class="cfm-tonal-panel cfm-tonal-panel--flat cfm-billing-section">
          <header class="cfm-billing-section-head">
            <div class="cfm-billing-section-copy">
              <span class="panel-kicker">À suivre</span>
              <h4 class="cfm-billing-section-title">Factures à surveiller maintenant</h4>
              <p>Les dossiers prioritaires passent après la structure commune du module pour rester un repère secondaire, pas l’entrée de page.</p>
            </div>
            <cfm-status-chip
              [label]="(vm.invoices.length > 3 ? 3 : vm.invoices.length) + ' en tête'"
              [tone]="vm.invoices.length > 0 ? 'calm' : 'neutral'"
            />
          </header>

          <div class="cfm-billing-register" *ngIf="vm.invoices.length > 0; else emptyPriority">
            <article
              class="cfm-billing-priority-row invoice-priority-row"
              *ngFor="let invoice of vm.invoices | slice:0:3; trackBy: trackByInvoice"
              [class.invoice-priority-row--overdue]="invoice.status === 'overdue'"
              [class.invoice-priority-row--draft]="getInvoiceWorkflow(invoice).stageLabel === 'À émettre'"
              [class.invoice-priority-row--partial]="getInvoiceWorkflow(invoice).stageLabel === 'Partiellement réglée'"
              (click)="selectInvoice(invoice.id)"
            >
              <div class="cfm-billing-priority-copy">
                <strong class="record-primary invoice-number">{{ invoice.number }}</strong>
                <span class="record-meta">{{ invoice.title || "Facture sans libellé" }}</span>
              </div>

              <div class="invoice-priority-summary">
                <cfm-status-chip [label]="getInvoiceWorkflow(invoice).stageLabel" [tone]="getInvoiceWorkflow(invoice).stageTone" />
                <cfm-status-chip emphasis="soft" [label]="getInvoiceWorkflow(invoice).priorityLabel" [tone]="getInvoiceWorkflow(invoice).priorityTone" />
              </div>

              <div class="invoice-priority-meta">
                <strong class="detail-copy">{{ invoice.customer_name }}</strong>
                <span class="record-meta">
                  {{ ctx.formatAmountCents(invoice.total_amount_cents, invoice.currency) }}
                  · reste dû {{ ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}
                </span>
              </div>

              <div class="invoice-priority-action">
                <cfm-button
                  *ngIf="canIssueInvoice(invoice)"
                  type="button"
                  size="sm"
                  [disabled]="ctx.invoiceStatusBusyId === invoice.id"
                  (click)="$event.stopPropagation(); issueInvoice(invoice)"
                >
                  {{ ctx.invoiceStatusBusyId === invoice.id ? "Émission..." : "Émettre" }}
                </cfm-button>

                <cfm-button
                  *ngIf="!canIssueInvoice(invoice) && canRegisterPayment(invoice)"
                  type="button"
                  size="sm"
                  [disabled]="ctx.invoicePaymentBusyId === invoice.id"
                  (click)="$event.stopPropagation(); openPaymentModal(invoice)"
                >
                  Enregistrer un paiement
                </cfm-button>

                <cfm-button
                  *ngIf="!canIssueInvoice(invoice) && !canRegisterPayment(invoice) && canAdvanceFollowUp(invoice)"
                  type="button"
                  variant="secondary"
                  size="sm"
                  [disabled]="ctx.invoiceFollowUpBusyId === invoice.id"
                  (click)="$event.stopPropagation(); openFollowUpModal(invoice)"
                >
                  {{ getFollowUpActionLabel(invoice) }}
                </cfm-button>

                <span class="record-meta" *ngIf="!canIssueInvoice(invoice) && !canRegisterPayment(invoice) && !canAdvanceFollowUp(invoice)">
                  Sous contrôle
                </span>
              </div>
            </article>
          </div>
      </article>
    </cfm-desktop-billing-workspace-shell>

    <ng-template #emptyPriority>
      <section class="cfm-billing-empty">
        <strong>Aucune facture à suivre</strong>
        <p>Les filtres actuels ne font remonter aucune facture dans le registre.</p>
      </section>
    </ng-template>

    <ng-template #emptyList>
      <section billingWorkspaceRegisterBody class="cfm-billing-empty">
        <strong>Aucune facture visible</strong>
        <p>Ajustez les filtres ou émettez une facture pour alimenter le registre.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="cfm-billing-empty">
        <strong>Aucune facture sélectionnée</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir l’aperçu facture.</p>
      </section>
    </ng-template>

    <ng-template #noHistory>
      <p class="small cfm-billing-empty-inline">
        {{ ctx.invoiceHistoryOpenId ? "Aucun événement disponible pour cette facture." : "Chargez l’historique pour voir les derniers événements." }}
      </p>
    </ng-template>

    <cfm-desktop-modal-shell
      [open]="paymentInvoice !== null"
      [title]="paymentInvoice ? 'Enregistrer un paiement' : ''"
      [description]="paymentInvoice ? (paymentInvoice.title || paymentInvoice.number) : null"
      (closed)="closePaymentModal()"
    >
      <ng-container *ngIf="paymentInvoice as invoice">
        <form class="payment-form" [formGroup]="paymentForm" (ngSubmit)="submitPayment(invoice)">
          <label class="compact-field">
            <span class="small">Montant payé (€)</span>
            <input type="text" formControlName="paidAmount" placeholder="Ex. 1200,00" />
          </label>

          <label class="compact-field">
            <span class="small">Date de paiement</span>
            <input type="date" formControlName="paidAt" />
          </label>

          <div class="toolbar-actions">
            <cfm-button type="button" variant="ghost" (click)="closePaymentModal()">
              Annuler
            </cfm-button>
            <cfm-button type="submit" [disabled]="!ctx.canActOnBilling || ctx.invoicePaymentBusyId === invoice.id || !canSubmitPayment(invoice)">
              {{ ctx.invoicePaymentBusyId === invoice.id ? "Enregistrement..." : "Valider le paiement" }}
            </cfm-button>
          </div>
        </form>
      </ng-container>
    </cfm-desktop-modal-shell>

    <cfm-desktop-modal-shell
      [open]="followUpModal !== null"
      [title]="followUpModal ? getFollowUpModalTitle(followUpModal) : ''"
      [description]="followUpModal ? getFollowUpModalDescription(followUpModal) : null"
      (closed)="closeFollowUpModal()"
    >
      <ng-container *ngIf="followUpModal as state">
        <section class="detail-sheet">
          <p>{{ getFollowUpModalMessage(state) }}</p>

          <div class="toolbar-actions">
            <cfm-button type="button" variant="ghost" (click)="closeFollowUpModal()">
              Annuler
            </cfm-button>
            <cfm-button
              type="button"
              [disabled]="ctx.invoiceFollowUpBusyId === state.invoice.id"
              (click)="confirmFollowUpModal()"
            >
              {{ ctx.invoiceFollowUpBusyId === state.invoice.id ? "Mise à jour..." : "Confirmer" }}
            </cfm-button>
          </div>
        </section>
      </ng-container>
    </cfm-desktop-modal-shell>
  `,
  styles: [
    `
      :host {
        display: block;
        color: var(--cfm-color-ink);
      }

      .payment-form,
      .invoice-priority-meta {
        display: grid;
        gap: 0.96rem;
      }

      .compact-field {
        display: grid;
        gap: 0.25rem;
      }

      .compact-field input,
      .compact-field select {
        width: 100%;
        padding: 0.48rem 0.6rem;
        border-radius: 9px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-muted);
        color: var(--cfm-color-ink);
        font: inherit;
      }

      .toolbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
        align-items: center;
      }

      .detail-sheet {
        display: grid;
        gap: 0.32rem;
        min-width: 0;
        padding: 0.56rem 0.64rem;
        border-radius: 10px;
        border: 1px solid var(--cfm-color-border);
        background: var(--cfm-color-surface-muted);
      }

      .detail-sheet p {
        margin: 0;
        color: var(--cfm-color-copy-muted);
        font-weight: var(--cfm-font-weight-light, 300);
      }

      .invoice-priority-row {
        grid-template-columns: minmax(0, 1.02fr) minmax(0, 0.9fr) minmax(0, 1fr) auto;
      }

      .invoice-priority-summary {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.42rem;
      }

      .invoice-priority-action {
        display: flex;
        justify-content: flex-end;
      }

      .invoice-priority-row--overdue {
        box-shadow: inset 2px 0 0 color-mix(in srgb, var(--cfm-color-danger-ink) 78%, transparent);
      }

      .invoice-priority-row--draft {
        box-shadow: inset 2px 0 0 color-mix(in srgb, var(--cfm-color-warning-ink) 68%, transparent);
      }

      .invoice-priority-row--partial {
        box-shadow: inset 2px 0 0 color-mix(in srgb, var(--cfm-color-warning-ink) 76%, transparent);
      }

      @media (max-width: 1180px) {
        .invoice-priority-row {
          grid-template-columns: 1fr;
        }

        .invoice-priority-action {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class DesktopBillingInvoicesPageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);
  readonly secondarySection = inject(DesktopBillingSecondarySectionService);
  private readonly destroyRef = inject(DestroyRef);
  readonly secondarySectionKey = "billing-invoices";

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    status: new FormControl<"all" | InvoiceRecord["status"]>("all", { nonNullable: true }),
    customerId: new FormControl(INVOICE_ADVANCED_FILTER_DEFAULTS.customerId, { nonNullable: true }),
    worksiteId: new FormControl(INVOICE_ADVANCED_FILTER_DEFAULTS.worksiteId, { nonNullable: true }),
    dueWindow: new FormControl<InvoiceDueWindowFilter>(INVOICE_ADVANCED_FILTER_DEFAULTS.dueWindow, { nonNullable: true }),
    settlement: new FormControl<InvoiceSettlementFilter>(INVOICE_ADVANCED_FILTER_DEFAULTS.settlement, { nonNullable: true }),
    outstandingOnly: new FormControl(INVOICE_ADVANCED_FILTER_DEFAULTS.outstandingOnly, { nonNullable: true }),
    partialOnly: new FormControl(INVOICE_ADVANCED_FILTER_DEFAULTS.partialOnly, { nonNullable: true }),
  });

  readonly paymentForm = new FormGroup({
    paidAmount: new FormControl("", { nonNullable: true }),
    paidAt: new FormControl("", { nonNullable: true }),
  });

  filtersOpen = false;
  paymentInvoice: InvoiceRecord | null = null;
  followUpModal: FollowUpModalState = null;
  private readonly selectedInvoiceId$ = new BehaviorSubject<string | null>(null);

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

  readonly filteredInvoices$ = combineLatest([
    this.ctx.billingState$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.getRawValue())),
  ]).pipe(
    map(([_state, filters]) => {
      const search = this.toSearchableText(filters.search);
      const worksiteId = filters.worksiteId ?? INVOICE_ADVANCED_FILTER_DEFAULTS.worksiteId;
      const dueWindow = filters.dueWindow ?? INVOICE_ADVANCED_FILTER_DEFAULTS.dueWindow;
      const settlement = filters.settlement ?? INVOICE_ADVANCED_FILTER_DEFAULTS.settlement;
      return [...this.ctx.invoices.filter((invoice) => {
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(
            `${invoice.number} ${invoice.title ?? ""} ${invoice.customer_name} ${invoice.worksite_name ?? ""}`
          ).includes(search);
        const matchesStatus = filters.status === "all" || invoice.status === filters.status;
        const matchesCustomer = filters.customerId === "all" || invoice.customer_id === filters.customerId;
        const matchesWorksite = this.matchesWorksiteFilter(invoice, worksiteId);
        const matchesDueWindow = this.matchesDueWindowFilter(invoice, dueWindow);
        const matchesSettlement = this.matchesSettlementFilter(invoice, settlement);
        const matchesOutstanding = !filters.outstandingOnly || invoice.outstanding_amount_cents > 0;
        const matchesPartial = !filters.partialOnly || this.isPartialInvoice(invoice);
        return matchesSearch
          && matchesStatus
          && matchesCustomer
          && matchesWorksite
          && matchesDueWindow
          && matchesSettlement
          && matchesOutstanding
          && matchesPartial;
      })].sort((left, right) => {
        const rankDiff = this.getInvoiceSortRank(left) - this.getInvoiceSortRank(right);
        if (rankDiff !== 0) {
          return rankDiff;
        }
        return (right.due_date ?? right.issue_date).localeCompare(left.due_date ?? left.issue_date);
      });
    }),
  );

  readonly vm$ = combineLatest([
    this.filteredInvoices$,
    this.selectedInvoiceId$.pipe(distinctUntilChanged()),
  ]).pipe(
    map(([invoices, selectedId]) => {
      const selected = invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0] ?? null;
      return { invoices, selected };
    }),
    tap(({ invoices, selected }) => {
      if (!this.ctx.invoicePaymentId) {
        this.paymentInvoice = null;
        return;
      }
      if (selected?.id !== this.ctx.invoicePaymentId) {
        this.selectedInvoiceId$.next(this.ctx.invoicePaymentId);
        return;
      }
      const paymentInvoice = invoices.find((invoice) => invoice.id === this.ctx.invoicePaymentId);
      if (!paymentInvoice) {
        return;
      }
      this.paymentForm.setValue(
        {
          paidAmount: this.ctx.invoicePaymentForm.paidAmount,
          paidAt: this.ctx.invoicePaymentForm.paidAt,
        },
        { emitEvent: false },
      );
      this.paymentInvoice = paymentInvoice;
    }),
  );

  get draftInvoicesCount(): number {
    return this.ctx.invoices.filter((invoice) => this.ctx.getInvoiceWorkflowState(invoice).stageLabel === "À émettre").length;
  }

  get paymentExpectedCount(): number {
    return this.ctx.invoices.filter((invoice) => this.ctx.getInvoiceWorkflowState(invoice).stageLabel === "Paiement attendu").length;
  }

  get partialInvoicesCount(): number {
    return this.ctx.invoices.filter((invoice) => this.ctx.getInvoiceWorkflowState(invoice).stageLabel === "Partiellement réglée").length;
  }

  toggleFiltersPopover(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      customerId: INVOICE_ADVANCED_FILTER_DEFAULTS.customerId,
      worksiteId: INVOICE_ADVANCED_FILTER_DEFAULTS.worksiteId,
      dueWindow: INVOICE_ADVANCED_FILTER_DEFAULTS.dueWindow,
      settlement: INVOICE_ADVANCED_FILTER_DEFAULTS.settlement,
      outstandingOnly: INVOICE_ADVANCED_FILTER_DEFAULTS.outstandingOnly,
      partialOnly: INVOICE_ADVANCED_FILTER_DEFAULTS.partialOnly,
    });
  }

  selectInvoice(invoiceId: string): void {
    this.selectedInvoiceId$.next(invoiceId);
  }

  openPaymentModal(invoice: InvoiceRecord): void {
    if (!this.ctx.canActOnBilling) {
      return;
    }
    this.ctx.openInvoicePayment(invoice);
    this.paymentForm.setValue({
      paidAmount: this.ctx.invoicePaymentForm.paidAmount,
      paidAt: this.ctx.invoicePaymentForm.paidAt,
    });
    this.paymentInvoice = invoice;
  }

  closePaymentModal(): void {
    this.ctx.cancelInvoicePayment();
    this.paymentInvoice = null;
  }

  async submitPayment(invoice: InvoiceRecord): Promise<void> {
    if (!this.ctx.canActOnBilling) {
      return;
    }
    this.syncPaymentContextForm();
    if (!this.canSubmitPayment(invoice)) {
      return;
    }
    await this.ctx.saveInvoicePayment(invoice);
    if (this.ctx.invoicePaymentId !== invoice.id) {
      this.paymentInvoice = null;
    }
  }

  openFollowUpModal(invoice: InvoiceRecord): void {
    if (!this.ctx.canActOnBilling) {
      return;
    }
    const targetStatus = this.getNextInvoiceFollowUpStatus(invoice);
    if (!targetStatus) {
      return;
    }
    this.followUpModal = {
      invoice,
      targetStatus,
    };
  }

  closeFollowUpModal(): void {
    this.followUpModal = null;
  }

  async confirmFollowUpModal(): Promise<void> {
    if (!this.followUpModal || !this.ctx.canActOnBilling) {
      return;
    }
    await this.ctx.changeInvoiceFollowUpStatus(this.followUpModal.invoice, this.followUpModal.targetStatus);
    this.followUpModal = null;
  }

  getFollowUpModalTitle(state: Exclude<FollowUpModalState, null>): string {
    switch (state.targetStatus) {
      case "to_follow_up":
        return "Marquer à relancer";
      case "followed_up":
        return "Marquer relancé";
      case "waiting_customer":
        return "Passer en attente client";
      case "normal":
      default:
        return "Repasser en suivi normal";
    }
  }

  getFollowUpModalDescription(state: Exclude<FollowUpModalState, null>): string {
    return state.invoice.title || state.invoice.number;
  }

  getFollowUpModalMessage(state: Exclude<FollowUpModalState, null>): string {
    switch (state.targetStatus) {
      case "to_follow_up":
        return "La facture apparaitra comme prioritaire dans les relances.";
      case "followed_up":
        return "La relance sera marquée comme faite dans le flux de suivi.";
      case "waiting_customer":
        return "La facture passera en attente client jusqu’au prochain retour ou paiement.";
      case "normal":
      default:
        return "La facture repassera en suivi normal dans la vue de facturation.";
    }
  }

  canIssueInvoice(invoice: InvoiceRecord): boolean {
    return this.ctx.canActOnBilling && invoice.status === "draft";
  }

  canRegisterPayment(invoice: InvoiceRecord): boolean {
    return this.ctx.canActOnBilling && invoice.outstanding_amount_cents > 0 && invoice.status !== "draft";
  }

  canAdvanceFollowUp(invoice: InvoiceRecord): boolean {
    return this.ctx.canActOnBilling && this.getNextInvoiceFollowUpStatus(invoice) !== null;
  }

  getFollowUpActionLabel(invoice: InvoiceRecord): string {
    switch (this.getNextInvoiceFollowUpStatus(invoice)) {
      case "to_follow_up":
        return "Relancer";
      case "followed_up":
        return "Marquer relancé";
      case "waiting_customer":
        return "Attente client";
      case "normal":
        return "Suivi normal";
      default:
        return "Relance";
    }
  }

  getInvoiceSignalLabel(invoice: InvoiceRecord): string {
    return this.ctx.getInvoiceWorkflowState(invoice).signalLabel;
  }

  getInvoiceNextActionLabel(invoice: InvoiceRecord): string {
    return this.ctx.getInvoiceWorkflowState(invoice).nextActionLabel;
  }

  getInvoiceNextActionSummary(invoice: InvoiceRecord): string {
    return this.ctx.getInvoiceWorkflowState(invoice).nextActionSummary;
  }

  getInvoiceWorkflow(invoice: InvoiceRecord) {
    return this.ctx.getInvoiceWorkflowState(invoice);
  }

  getInvoiceRailPrimaryActionLabel(invoice: InvoiceRecord): string | null {
    switch (this.getInvoiceRailPrimaryActionKind(invoice)) {
      case "issue":
        return "Émettre la facture";
      case "payment":
        return "Enregistrer un paiement";
      case "followup":
        return this.getFollowUpActionLabel(invoice);
      case "pdf":
        return "Exporter la facture";
      default:
        return null;
    }
  }

  isInvoiceRailPrimaryActionBusy(invoice: InvoiceRecord): boolean {
    switch (this.getInvoiceRailPrimaryActionKind(invoice)) {
      case "issue":
        return this.ctx.invoiceStatusBusyId === invoice.id;
      case "payment":
        return this.ctx.invoicePaymentBusyId === invoice.id;
      case "followup":
        return this.ctx.invoiceFollowUpBusyId === invoice.id;
      case "pdf":
        return this.ctx.invoicePdfBusyId === invoice.id;
      default:
        return false;
    }
  }

  getInvoiceRailPrimaryActionBusyLabel(invoice: InvoiceRecord): string {
    switch (this.getInvoiceRailPrimaryActionKind(invoice)) {
      case "issue":
        return "Émission...";
      case "payment":
        return "Paiement...";
      case "followup":
        return "Mise à jour...";
      case "pdf":
        return "PDF...";
      default:
        return "Traitement...";
    }
  }

  showInvoiceRailFollowUpSecondary(invoice: InvoiceRecord): boolean {
    return this.canAdvanceFollowUp(invoice) && this.getInvoiceRailPrimaryActionKind(invoice) !== "followup";
  }

  showInvoiceRailPdfSecondary(invoice: InvoiceRecord): boolean {
    return this.ctx.canExportBilling && this.getInvoiceRailPrimaryActionKind(invoice) !== "pdf";
  }

  async runInvoiceRailPrimaryAction(invoice: InvoiceRecord): Promise<void> {
    switch (this.getInvoiceRailPrimaryActionKind(invoice)) {
      case "issue":
        await this.issueInvoice(invoice);
        return;
      case "payment":
        this.openPaymentModal(invoice);
        return;
      case "followup":
        this.openFollowUpModal(invoice);
        return;
      case "pdf":
        await this.ctx.exportInvoicePdf(invoice);
        return;
      default:
        return;
    }
  }

  async issueInvoice(invoice: InvoiceRecord): Promise<void> {
    if (!this.canIssueInvoice(invoice)) {
      return;
    }
    await this.ctx.changeInvoiceStatus(invoice, "issued");
  }

  async loadInvoiceHistory(invoice: InvoiceRecord): Promise<void> {
    await this.ctx.toggleInvoiceHistory(invoice);
  }

  canSubmitPayment(invoice: InvoiceRecord): boolean {
    const raw = this.paymentForm.getRawValue();
    const paidAmountCents = this.parseAmountToCents(raw.paidAmount);
    return Boolean(
      paidAmountCents !== null
      && paidAmountCents > 0
      && paidAmountCents <= invoice.total_amount_cents
      && raw.paidAt
    );
  }

  trackByInvoice(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByHistory(_index: number, item: { id: string }): string {
    return item.id;
  }

  trackByLine(index: number, item: { description: string }): string {
    return `${index}-${item.description}`;
  }

  private syncPaymentContextForm(): void {
    const raw = this.paymentForm.getRawValue();
    this.ctx.invoicePaymentForm.paidAmount = raw.paidAmount;
    this.ctx.invoicePaymentForm.paidAt = raw.paidAt;
  }

  private getInvoiceRailPrimaryActionKind(invoice: InvoiceRecord): "issue" | "payment" | "followup" | "pdf" | null {
    if (this.canIssueInvoice(invoice)) {
      return "issue";
    }
    if (this.canRegisterPayment(invoice)) {
      return "payment";
    }
    if (this.canAdvanceFollowUp(invoice)) {
      return "followup";
    }
    if (this.ctx.canExportBilling) {
      return "pdf";
    }
    return null;
  }

  private matchesWorksiteFilter(invoice: InvoiceRecord, filter: string): boolean {
    if (filter === "all") {
      return true;
    }
    if (filter === "none") {
      return !invoice.worksite_id;
    }
    return invoice.worksite_id === filter;
  }

  private matchesDueWindowFilter(invoice: InvoiceRecord, filter: InvoiceDueWindowFilter): boolean {
    if (filter === "all") {
      return true;
    }
    if (filter === "overdue") {
      return invoice.status === "overdue";
    }
    if (!invoice.due_date || invoice.outstanding_amount_cents <= 0 || invoice.status === "overdue" || invoice.status === "paid") {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(`${invoice.due_date}T00:00:00`);
    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }
    const daysUntilDue = Math.round((dueDate.getTime() - today.getTime()) / 86400000);
    return daysUntilDue >= 0 && daysUntilDue <= 14;
  }

  private matchesSettlementFilter(invoice: InvoiceRecord, filter: InvoiceSettlementFilter): boolean {
    if (filter === "all") {
      return true;
    }
    const isSettled = invoice.status === "paid" || invoice.outstanding_amount_cents === 0;
    return filter === "settled" ? isSettled : !isSettled;
  }

  private isPartialInvoice(invoice: InvoiceRecord): boolean {
    return invoice.paid_amount_cents > 0 && invoice.outstanding_amount_cents > 0;
  }

  private getNextInvoiceFollowUpStatus(invoice: InvoiceRecord): BillingFollowUpStatus | null {
    if (invoice.status === "draft" || invoice.outstanding_amount_cents === 0) {
      return null;
    }
    switch (invoice.follow_up_status) {
      case "normal":
        return "to_follow_up";
      case "to_follow_up":
        return "followed_up";
      case "followed_up":
        return "waiting_customer";
      case "waiting_customer":
        return "normal";
    }
  }

  private parseAmountToCents(value: string): number | null {
    const normalized = value.trim().replace(/\s+/g, "").replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      return null;
    }
    const numericValue = Number.parseFloat(normalized);
    if (!Number.isFinite(numericValue)) {
      return null;
    }
    return Math.round(numericValue * 100);
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private getInvoiceSortRank(invoice: InvoiceRecord): number {
    return this.ctx.getInvoiceWorkflowState(invoice).sortRank;
  }
}
