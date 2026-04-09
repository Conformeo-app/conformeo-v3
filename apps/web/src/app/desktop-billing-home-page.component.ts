import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import type { AuditLogRecord, BillingFollowUpStatus, InvoiceRecord } from "@conformeo/contracts";
import { CfmButtonComponent } from "@conformeo/ui";
import { BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith, tap } from "rxjs";

import { DESKTOP_BILLING_PAGE_CONTEXT } from "./desktop-billing-page-context";
import { DesktopModalShellComponent } from "./desktop-modal-shell.component";
import { DesktopBillingWorkspaceShellComponent } from "./desktop-billing-workspace-shell.component";

type BillingHomeInvoiceFilter = "all" | "draft" | "expected" | "partial" | "overdue" | "paid";
type BillingHomeDocumentTypeFilter = "all" | "draft" | "invoice";
type BillingHomeDueWindowFilter = "all" | "soon" | "overdue";
type FollowUpModalState = {
  invoice: InvoiceRecord;
  targetStatus: BillingFollowUpStatus;
} | null;

const BILLING_HOME_ADVANCED_FILTER_DEFAULTS = {
  customerId: "all",
  worksiteId: "all",
  documentType: "all" as BillingHomeDocumentTypeFilter,
  dueWindow: "all" as BillingHomeDueWindowFilter,
  outstandingOnly: false,
  followUpOnly: false,
};

@Component({
  selector: "cfm-desktop-billing-home-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CfmButtonComponent,
    DesktopModalShellComponent,
    DesktopBillingWorkspaceShellComponent,
  ],
  template: `
    <cfm-desktop-billing-workspace-shell
      *ngIf="vm$ | async as vm"
      [formGroup]="filterForm"
      kpiAriaLabel="Repères financiers"
      registerHeadClass="billing-home-register-head--overview"
      [showRegisterHead]="vm.invoices.length > 0"
    >
      <article billingWorkspaceKpi class="billing-home-kpi billing-home-kpi--quotes">
          <span class="billing-home-kpi-label">Devis en cours</span>
          <strong>{{ activeQuotesAmountLabel }}</strong>
          <span>{{ activeQuotesCount }} devis à suivre</span>
      </article>

      <article billingWorkspaceKpi class="billing-home-kpi billing-home-kpi--invoices">
          <span class="billing-home-kpi-label">Factures émises</span>
          <strong>{{ issuedInvoicesAmountLabel }}</strong>
          <span>{{ issuedInvoicesCount }} facture{{ issuedInvoicesCount > 1 ? "s" : "" }} en circulation</span>
      </article>

      <article billingWorkspaceKpi class="billing-home-kpi billing-home-kpi--payments">
          <span class="billing-home-kpi-label">Paiements encaissés</span>
          <strong>{{ collectedPaymentsAmountLabel }}</strong>
          <span>{{ recoveryRateLabel }} de recouvrement</span>
      </article>

      <label billingWorkspaceFilter class="billing-home-filter-chip billing-home-filter-chip--search">
        <input type="text" formControlName="search" placeholder="Rechercher une facture" />
      </label>

      <div billingWorkspaceFilter class="billing-home-filter-trailing">
        <label class="billing-home-filter-chip billing-home-filter">
          <select formControlName="status">
            <option value="all">Tous les statuts</option>
            <option value="draft">À émettre</option>
            <option value="expected">Paiement attendu</option>
            <option value="partial">Partiellement réglées</option>
            <option value="overdue">En retard</option>
            <option value="paid">Soldées</option>
          </select>
        </label>

        <div class="billing-home-more-filters-anchor">
          <button
            type="button"
            class="billing-home-more-filters"
            [class.is-open]="advancedFiltersOpen"
            [attr.aria-expanded]="advancedFiltersOpen"
            (click)="toggleAdvancedFilters()"
          >
            Plus de filtres
          </button>

          <section class="billing-home-advanced-filters cfm-billing-filter-panel" *ngIf="advancedFiltersOpen">
            <div class="billing-home-advanced-grid cfm-billing-filter-grid">
              <label class="billing-home-advanced-field cfm-billing-filter-field">
                <span class="small">Client</span>
                <select formControlName="customerId">
                  <option value="all">Tous les clients</option>
                  <option *ngFor="let customer of customerFilterOptions" [value]="customer.id">
                    {{ customer.name }}
                  </option>
                </select>
              </label>

              <label class="billing-home-advanced-field cfm-billing-filter-field">
                <span class="small">Chantier lié</span>
                <select formControlName="worksiteId">
                  <option value="all">Tous les chantiers</option>
                  <option value="none">Sans chantier</option>
                  <option *ngFor="let worksite of worksiteFilterOptions" [value]="worksite.id">
                    {{ worksite.name }}
                  </option>
                </select>
              </label>

              <label class="billing-home-advanced-field cfm-billing-filter-field">
                <span class="small">Type document commercial</span>
                <select formControlName="documentType">
                  <option value="all">Tous les documents</option>
                  <option value="invoice">Factures émises</option>
                  <option value="draft">Brouillons</option>
                </select>
              </label>

              <label class="billing-home-advanced-field cfm-billing-filter-field">
                <span class="small">Échéance</span>
                <select formControlName="dueWindow">
                  <option value="all">Toutes les échéances</option>
                  <option value="soon">Proche (14 jours)</option>
                  <option value="overdue">En retard</option>
                </select>
              </label>
            </div>

            <div class="billing-home-advanced-toggles">
              <label class="billing-home-advanced-option">
                <input type="checkbox" formControlName="outstandingOnly" />
                <span>Montant ouvert</span>
              </label>

              <label class="billing-home-advanced-option">
                <input type="checkbox" formControlName="followUpOnly" />
                <span>Relances ouvertes</span>
              </label>
            </div>

            <div class="billing-home-advanced-actions cfm-billing-filter-actions">
              <button type="button" class="billing-home-advanced-reset" (click)="resetAdvancedFilters()">
                Réinitialiser
              </button>
            </div>
          </section>
        </div>
      </div>

      <span billingWorkspaceRegisterHead>Document</span>
      <span billingWorkspaceRegisterHead>Client / projet</span>
      <span billingWorkspaceRegisterHead>Montant TTC</span>
      <span billingWorkspaceRegisterHead>Échéance</span>
      <span billingWorkspaceRegisterHead>Statut</span>

      <div billingWorkspaceRegisterBody class="billing-home-register-body" *ngIf="vm.invoices.length > 0; else emptyRegister">
        <button
          *ngFor="let invoice of vm.invoices; trackBy: trackByInvoice"
          type="button"
          class="billing-home-row"
          [class.is-selected]="vm.selected?.id === invoice.id"
          [class.is-overdue]="invoice.status === 'overdue'"
          [class.is-draft]="getInvoiceWorkflow(invoice).stageLabel === 'À émettre'"
          (click)="selectInvoice(invoice.id)"
        >
          <div class="billing-home-row-cell billing-home-row-primary">
            <strong class="record-primary invoice-number">{{ invoice.number }}</strong>
            <span class="record-meta">{{ invoice.status === "draft" ? "Brouillon" : "Facture" }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ invoice.customer_name }}</strong>
            <span class="record-meta">{{ invoice.worksite_name || "Sans chantier" }}</span>
          </div>

          <div class="billing-home-row-cell">
            <strong class="detail-copy">{{ ctx.formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</strong>
            <span class="record-meta">{{ invoice.line_items.length }} ligne{{ invoice.line_items.length > 1 ? "s" : "" }}</span>
          </div>

          <div class="billing-home-row-cell billing-home-row-deadline" [class.is-critical]="invoice.status === 'overdue'">
            <strong class="detail-copy">
              {{ invoice.due_date ? (invoice.due_date | date:"shortDate") : "À préciser" }}
            </strong>
            <span class="record-meta">{{ invoice.issue_date | date:"shortDate" }}</span>
          </div>

          <div class="billing-home-row-cell billing-home-row-status">
            <span
              class="billing-home-status-pill"
              [class.is-danger]="getInvoiceWorkflow(invoice).stageTone === 'danger'"
              [class.is-warning]="getInvoiceWorkflow(invoice).stageTone === 'warning'"
              [class.is-accent]="getInvoiceWorkflow(invoice).stageTone === 'accent'"
              [class.is-success]="getInvoiceWorkflow(invoice).stageTone === 'success'"
            >
              {{ getInvoiceWorkflow(invoice).stageLabel }}
            </span>
            <span class="record-meta">{{ getInvoiceWorkflow(invoice).nextActionLabel }}</span>
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
                  <p>Émise le {{ invoice.issue_date | date:"longDate" }}</p>
                </div>

                <span
                  class="billing-home-preview-status"
                  [class.is-danger]="getInvoiceWorkflow(invoice).stageTone === 'danger'"
                  [class.is-warning]="getInvoiceWorkflow(invoice).stageTone === 'warning'"
                  [class.is-success]="getInvoiceWorkflow(invoice).stageTone === 'success'"
                  [class.is-accent]="getInvoiceWorkflow(invoice).stageTone === 'accent'"
                >
                  {{ getInvoiceWorkflow(invoice).stageLabel }}
                </span>
              </section>

              <section class="billing-home-rail-section">
                <header class="cfm-billing-section-copy">
                  <span class="panel-kicker">Action utile</span>
                  <h4 class="cfm-billing-section-title">{{ getPrimaryRailActionLabel(invoice) || getInvoiceWorkflow(invoice).nextActionLabel }}</h4>
                </header>

                <div class="cfm-billing-highlight">
                  <strong>{{ getInvoiceWorkflow(invoice).signalLabel }}</strong>
                  <span>{{ getInvoiceWorkflow(invoice).nextActionLabel }}</span>
                </div>

                <div class="billing-home-rail-actions">
                  <cfm-button
                    *ngIf="getPrimaryRailActionLabel(invoice) as primaryLabel"
                    type="button"
                    size="sm"
                    class="billing-home-rail-primary-button"
                    [disabled]="isPrimaryRailActionBusy(invoice)"
                    (click)="runPrimaryRailAction(invoice)"
                  >
                    {{ isPrimaryRailActionBusy(invoice) ? getPrimaryRailBusyLabel(invoice) : primaryLabel }}
                  </cfm-button>

                  <div class="billing-home-rail-secondary-actions">
                    <cfm-button
                      *ngIf="hasSecondaryRailPdfAction(invoice)"
                      type="button"
                      variant="secondary"
                      size="sm"
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

                <ul class="billing-home-rail-list billing-home-rail-list--identity">
                  <li><span>Client</span><strong>{{ invoice.customer_name }}</strong></li>
                  <li><span>Projet</span><strong>{{ invoice.worksite_name || "Sans chantier" }}</strong></li>
                  <li><span>Relance</span><strong>{{ ctx.getBillingFollowUpStatusLabel(invoice.follow_up_status) }}</strong></li>
                  <li><span>Total TTC</span><strong>{{ ctx.formatAmountCents(invoice.total_amount_cents, invoice.currency) }}</strong></li>
                  <li><span>Reste dû</span><strong>{{ ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}</strong></li>
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
                    (click)="toggleInvoiceHistory(invoice)"
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

                <ul class="billing-home-rail-list">
                  <li><span>Signal</span><strong>{{ getInvoiceWorkflow(invoice).signalLabel }}</strong></li>
                  <li><span>Action utile</span><strong>{{ getInvoiceWorkflow(invoice).nextActionLabel }}</strong></li>
                  <li><span>Reste dû</span><strong>{{ ctx.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency) }}</strong></li>
                </ul>

                <ul class="cfm-billing-rail-list detail-copy" *ngIf="ctx.invoiceHistoryOpenId === invoice.id && ctx.getInvoiceHistory(invoice.id).length > 0; else noHistory">
                  <li *ngFor="let log of ctx.getInvoiceHistory(invoice.id); trackBy: trackByHistory">
                    <span>{{ ctx.getBillingHistoryLabel(log) }}</span>
                    <strong class="timestamp">{{ log.occurred_at | date:"short" }}</strong>
                  </li>
                </ul>
              </section>
      </article>
    </cfm-desktop-billing-workspace-shell>

    <ng-template #emptyRegister>
      <section billingWorkspaceRegisterBody class="cfm-billing-empty">
        <strong>Aucune facture visible</strong>
        <p>Ajustez les filtres ou émettez une facture pour alimenter le registre principal.</p>
      </section>
    </ng-template>

    <ng-template #emptyDetail>
      <section billingWorkspaceRail class="cfm-billing-empty">
        <strong>Aucune facture sélectionnée</strong>
        <p>Sélectionnez une ligne du registre pour ouvrir l’aperçu facture.</p>
      </section>
    </ng-template>

    <ng-template #noHistory>
      <p class="small billing-home-empty-inline">
        {{ ctx.invoiceHistoryOpenId ? "Aucun événement disponible pour cette facture." : "Chargez l’historique pour afficher les derniers événements." }}
      </p>
    </ng-template>

    <cfm-desktop-modal-shell
      [open]="paymentInvoice !== null"
      [title]="paymentInvoice ? 'Enregistrer un paiement' : ''"
      [description]="paymentInvoice ? (paymentInvoice.title || paymentInvoice.number) : null"
      (closed)="closePaymentModal()"
    >
      <ng-container *ngIf="paymentInvoice as invoice">
        <form class="billing-home-payment-form" [formGroup]="paymentForm" (ngSubmit)="submitPayment(invoice)">
          <label class="compact-field">
            <span class="small">Montant payé (€)</span>
            <input type="text" formControlName="paidAmount" placeholder="Ex. 1200,00" />
          </label>

          <label class="compact-field">
            <span class="small">Date de paiement</span>
            <input type="date" formControlName="paidAt" />
          </label>

          <div class="billing-home-modal-actions">
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
        <section class="billing-home-followup-sheet">
          <p>{{ getFollowUpModalMessage(state) }}</p>

          <div class="billing-home-modal-actions">
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

      .billing-home,
      .billing-home-stage,
      .billing-home-main,
      .billing-home-rail,
      .billing-home-ledger,
      .billing-home-register,
      .billing-home-row-cell,
      .billing-home-rail-card,
      .billing-home-rail-preview,
      .billing-home-rail-preview-copy,
      .billing-home-kpis,
      .billing-home-kpi,
      .billing-home-payment-form,
      .billing-home-followup-sheet,
      .billing-home-rail-section {
        display: grid;
      }

      .billing-home,
      .billing-home-main,
      .billing-home-rail {
        gap: 1.02rem;
      }

      .billing-home {
        gap: 1.18rem;
      }

      .billing-home-kpis {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.72rem;
        margin-top: 0.16rem;
        margin-bottom: 0;
      }

      .billing-home-kpi {
        position: relative;
        gap: 0.18rem;
        padding: 0.9rem 0.96rem 0.88rem 1.02rem;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 18px 34px rgba(10, 17, 40, 0.04);
        overflow: hidden;
      }

      .billing-home-kpi::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.72rem;
        bottom: 0.72rem;
        width: 3px;
        border-radius: 999px;
        background: #c59b34;
      }

      .billing-home-kpi--invoices::before {
        background: #171d30;
      }

      .billing-home-kpi--payments::before {
        background: #2f8f6d;
      }

      .billing-home-kpi-label {
        font-size: 0.72rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
      }

      .billing-home-kpi strong {
        font-size: clamp(1.55rem, 2vw, 1.95rem);
        color: var(--cfm-color-ink);
        line-height: 1;
      }

      .billing-home-kpi span:not(.billing-home-kpi-label) {
        color: var(--cfm-color-copy-muted);
        line-height: 1.22;
        font-size: 0.8rem;
      }

      .billing-home-stage {
        display: grid;
        grid-template-columns: minmax(0, 1.82fr) minmax(16.8rem, 0.7fr);
        gap: 1.32rem;
        align-items: start;
      }

      .billing-home-ledger {
        gap: 0;
        padding: 0.9rem 1rem 0.34rem;
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 24px 40px rgba(10, 17, 40, 0.04);
      }

      .billing-home-advanced-filters {
        position: absolute;
        right: 0;
        top: calc(100% + 0.8rem);
        z-index: 4;
        width: min(33rem, calc(100vw - 8rem));
      }

      .billing-home-advanced-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .billing-home-advanced-field {
        display: grid;
        gap: 0.34rem;
      }

      .billing-home-advanced-field select {
        width: 100%;
        border: 0;
        background: transparent;
        color: var(--cfm-color-ink);
        font-size: 0.83rem;
        outline: none;
      }

      .billing-home-advanced-toggles {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .billing-home-advanced-option {
        display: inline-flex;
        align-items: center;
        gap: 0.38rem;
        min-height: 2rem;
        padding: 0 0.72rem;
        border-radius: 999px;
        background: rgba(244, 242, 238, 0.95);
        color: var(--cfm-color-copy);
        font-size: 0.78rem;
      }

      .billing-home-advanced-option input {
        margin: 0;
      }

      .billing-home-advanced-reset {
        border: 0;
        background: transparent;
        color: var(--cfm-color-copy-muted);
        font-size: 0.78rem;
        cursor: pointer;
      }

      .billing-home-register-head,
      .billing-home-row {
        display: grid;
        grid-template-columns: minmax(0, 0.82fr) minmax(0, 0.98fr) minmax(0, 0.72fr) minmax(0, 0.62fr) minmax(0, 0.72fr);
        gap: 0.96rem;
        align-items: center;
      }

      .billing-home-register-head {
        padding: 0.38rem 0.78rem 0.82rem;
        font-size: 0.72rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--cfm-color-copy-muted);
        border-bottom: 1px solid rgba(22, 24, 34, 0.08);
      }

      .billing-home-register {
        gap: 0;
      }

      .billing-home-row {
        width: 100%;
        border: 0;
        padding: 1.18rem 0.82rem 1.14rem;
        border-radius: 0;
        border-bottom: 1px solid rgba(22, 24, 34, 0.08);
        background: transparent;
        color: inherit;
        text-align: left;
        cursor: pointer;
        transition: background-color 140ms ease, box-shadow 140ms ease;
      }

      .billing-home-row:hover {
        background: rgba(196, 155, 52, 0.06);
      }

      .billing-home-row.is-selected {
        background: rgba(196, 155, 52, 0.08);
        box-shadow: inset 2px 0 0 #c59b34;
      }

      .billing-home-row.is-overdue {
        box-shadow: inset 2px 0 0 color-mix(in srgb, var(--cfm-color-danger-ink) 78%, transparent);
      }

      .billing-home-row.is-draft {
        box-shadow: inset 2px 0 0 color-mix(in srgb, var(--cfm-color-warning-ink) 76%, transparent);
      }

      .billing-home-row-cell {
        gap: 0.22rem;
        min-width: 0;
      }

      .billing-home-row-primary .invoice-number,
      .billing-home-row .detail-copy {
        line-height: 1.28;
      }

      .billing-home-row-primary .invoice-number {
        max-width: 6.1rem;
      }

      .billing-home-row-deadline.is-critical strong,
      .billing-home-row-deadline.is-critical .record-meta {
        color: var(--cfm-color-danger-ink);
      }

      .billing-home-row-status {
        align-content: start;
      }

      .billing-home-status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        min-height: 1.5rem;
        padding: 0.14rem 0.46rem;
        border-radius: 999px;
        background: rgba(22, 24, 34, 0.08);
        color: var(--cfm-color-ink);
        font-size: 0.68rem;
        font-weight: 650;
        text-transform: uppercase;
      }

      .billing-home-status-pill.is-danger {
        background: rgba(198, 84, 84, 0.12);
        color: #b24a4a;
      }

      .billing-home-status-pill.is-warning {
        background: rgba(196, 155, 52, 0.12);
        color: #936a12;
      }

      .billing-home-status-pill.is-success {
        background: rgba(47, 143, 109, 0.14);
        color: #2d835f;
      }

      .billing-home-status-pill.is-accent {
        background: rgba(66, 86, 171, 0.12);
        color: #4256ab;
      }

      .billing-home-rail {
        min-width: 0;
        align-self: start;
      }

      .billing-home-rail-card {
        gap: 0.78rem;
        padding: 0.96rem;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.94);
        box-shadow: 0 24px 38px rgba(10, 17, 40, 0.07);
      }

      .billing-home-rail-preview {
        gap: 0.72rem;
        padding: 0.92rem 0.96rem 0.9rem;
        border-radius: 18px;
        background: linear-gradient(180deg, #151b2f 0%, #0f1526 100%);
        color: var(--cfm-color-copy-on-dark, #f4f6fb);
      }

      .billing-home-rail-preview-head,
      .billing-home-modal-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 0.45rem;
      }

      .billing-home-rail-preview-copy {
        gap: 0.24rem;
      }

      .billing-home-rail-preview-copy h4 {
        margin: 0;
        font-size: 1.74rem;
        line-height: 0.94;
        letter-spacing: -0.05em;
        color: var(--cfm-color-copy-on-dark, #f4f6fb);
      }

      .billing-home-rail-preview-copy p,
      .billing-home-empty-inline,
      .billing-home-followup-sheet p {
        margin: 0;
      }

      .billing-home-rail-preview-copy p {
        color: rgba(244, 246, 251, 0.72);
      }

      .billing-home-preview-status {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        min-height: 1.7rem;
        padding: 0.18rem 0.62rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        color: #f4f6fb;
        font-size: 0.72rem;
        font-weight: 650;
        text-transform: uppercase;
      }

      .billing-home-preview-status.is-danger {
        background: #b94a4a;
      }

      .billing-home-preview-status.is-warning {
        background: #b8831d;
      }

      .billing-home-preview-status.is-success {
        background: #2f8f6d;
      }

      .billing-home-preview-status.is-accent {
        background: #4256ab;
      }

      .billing-home-rail-section {
        gap: 0.52rem;
        padding: 0.14rem 0.22rem 0;
      }

      .billing-home-rail-section + .billing-home-rail-section {
        padding-top: 1.02rem;
        border-top: 1px solid rgba(22, 24, 34, 0.08);
      }

      .billing-home-rail-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 0.68rem;
      }

      .billing-home-rail-list li {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.6rem;
      }

      .billing-home-rail-list strong {
        color: var(--cfm-color-ink, #161822);
        text-align: right;
      }

      .billing-home-rail-list span {
        color: var(--cfm-color-copy-muted);
      }

      .billing-home-rail-list--identity strong {
        max-width: 9.2rem;
      }

      .billing-home-rail-list--finance .is-total {
        padding-top: 0.42rem;
        border-top: 1px solid rgba(22, 24, 34, 0.08);
      }

      .billing-home-rail-actions {
        display: grid;
        gap: 0.5rem;
        padding: 0;
      }

      .billing-home-rail-primary-button {
        width: 100%;
      }

      .billing-home-rail-secondary-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.52rem;
      }

      .billing-home-rail-secondary-actions cfm-button {
        width: auto;
      }

      .billing-home-payment-form,
      .billing-home-followup-sheet {
        gap: 0.9rem;
      }

      @media (max-width: 1220px) {
        .billing-home-kpis,
        .billing-home-stage {
          grid-template-columns: 1fr;
        }

        .billing-home-more-filters-anchor {
          margin-left: 0;
        }

        .billing-home-advanced-filters {
          position: static;
          width: 100%;
          margin-top: 0.8rem;
        }
      }

      @media (max-width: 960px) {
        .billing-home-advanced-grid {
          grid-template-columns: 1fr;
        }

        .billing-home-register-head,
        .billing-home-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DesktopBillingHomePageComponent {
  readonly ctx = inject(DESKTOP_BILLING_PAGE_CONTEXT);

  readonly filterForm = new FormGroup({
    search: new FormControl("", { nonNullable: true }),
    status: new FormControl<BillingHomeInvoiceFilter>("all", { nonNullable: true }),
    customerId: new FormControl(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.customerId, { nonNullable: true }),
    worksiteId: new FormControl(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.worksiteId, { nonNullable: true }),
    documentType: new FormControl<BillingHomeDocumentTypeFilter>(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.documentType, { nonNullable: true }),
    dueWindow: new FormControl<BillingHomeDueWindowFilter>(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.dueWindow, { nonNullable: true }),
    outstandingOnly: new FormControl(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.outstandingOnly, { nonNullable: true }),
    followUpOnly: new FormControl(BILLING_HOME_ADVANCED_FILTER_DEFAULTS.followUpOnly, { nonNullable: true }),
  });

  readonly paymentForm = new FormGroup({
    paidAmount: new FormControl("", { nonNullable: true }),
    paidAt: new FormControl("", { nonNullable: true }),
  });

  paymentInvoice: InvoiceRecord | null = null;
  followUpModal: FollowUpModalState = null;
  advancedFiltersOpen = false;

  private readonly selectedInvoiceId$ = new BehaviorSubject<string | null>(null);

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
      const statusFilter = filters.status ?? "all";
      const customerId = filters.customerId ?? BILLING_HOME_ADVANCED_FILTER_DEFAULTS.customerId;
      const worksiteId = filters.worksiteId ?? BILLING_HOME_ADVANCED_FILTER_DEFAULTS.worksiteId;
      const documentType = filters.documentType ?? BILLING_HOME_ADVANCED_FILTER_DEFAULTS.documentType;
      const dueWindow = filters.dueWindow ?? BILLING_HOME_ADVANCED_FILTER_DEFAULTS.dueWindow;
      const outstandingOnly = filters.outstandingOnly ?? false;
      const followUpOnly = filters.followUpOnly ?? false;
      return [...this.ctx.invoices.filter((invoice) => {
        const matchesSearch =
          search.length === 0
          || this.toSearchableText(
            `${invoice.number} ${invoice.title ?? ""} ${invoice.customer_name} ${invoice.worksite_name ?? ""}`
          ).includes(search);
        const matchesCustomer = customerId === "all" || invoice.customer_id === customerId;
        const matchesWorksite = this.matchesWorksiteFilter(invoice, worksiteId);
        const matchesDocumentType = this.matchesDocumentTypeFilter(invoice, documentType);
        const matchesDueWindow = this.matchesDueWindowFilter(invoice, dueWindow);
        const matchesOutstanding = !outstandingOnly || invoice.outstanding_amount_cents > 0;
        const matchesFollowUp = !followUpOnly || invoice.follow_up_status !== "normal";
        return matchesSearch
          && this.matchesStatusFilter(invoice, statusFilter)
          && matchesCustomer
          && matchesWorksite
          && matchesDocumentType
          && matchesDueWindow
          && matchesOutstanding
          && matchesFollowUp;
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

  get activeQuotesCount(): number {
    return this.ctx.quotes.filter((quote) => this.ctx.getQuoteWorkflowState(quote).stageLabel !== "Suivi terminé").length;
  }

  get activeQuotesAmountLabel(): string {
    const total = this.ctx.quotes
      .filter((quote) => this.ctx.getQuoteWorkflowState(quote).stageLabel !== "Suivi terminé")
      .reduce((sum, quote) => sum + quote.total_amount_cents, 0);
    return this.ctx.formatAmountCents(total);
  }

  get issuedInvoicesCount(): number {
    return this.ctx.invoices.filter((invoice) => invoice.status !== "draft").length;
  }

  get issuedInvoicesAmountLabel(): string {
    const total = this.ctx.invoices
      .filter((invoice) => invoice.status !== "draft")
      .reduce((sum, invoice) => sum + invoice.total_amount_cents, 0);
    return this.ctx.formatAmountCents(total);
  }

  get collectedPaymentsAmountLabel(): string {
    const total = this.ctx.invoices.reduce((sum, invoice) => sum + invoice.paid_amount_cents, 0);
    return this.ctx.formatAmountCents(total);
  }

  get recoveryRateLabel(): string {
    const issuedTotal = this.ctx.invoices
      .filter((invoice) => invoice.status !== "draft")
      .reduce((sum, invoice) => sum + invoice.total_amount_cents, 0);
    const collectedTotal = this.ctx.invoices.reduce((sum, invoice) => sum + invoice.paid_amount_cents, 0);
    if (issuedTotal <= 0) {
      return "0%";
    }
    return `${Math.round((collectedTotal / issuedTotal) * 100)}%`;
  }

  selectInvoice(invoiceId: string): void {
    this.selectedInvoiceId$.next(invoiceId);
  }

  toggleAdvancedFilters(): void {
    this.advancedFiltersOpen = !this.advancedFiltersOpen;
  }

  resetAdvancedFilters(): void {
    this.filterForm.patchValue({
      customerId: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.customerId,
      worksiteId: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.worksiteId,
      documentType: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.documentType,
      dueWindow: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.dueWindow,
      outstandingOnly: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.outstandingOnly,
      followUpOnly: BILLING_HOME_ADVANCED_FILTER_DEFAULTS.followUpOnly,
    });
  }

  trackByInvoice(_index: number, item: InvoiceRecord): string {
    return item.id;
  }

  trackByHistory(_index: number, item: AuditLogRecord): string {
    return item.id;
  }

  getInvoiceWorkflow(invoice: InvoiceRecord) {
    return this.ctx.getInvoiceWorkflowState(invoice);
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

  getPrimaryRailActionLabel(invoice: InvoiceRecord): string | null {
    if (this.canIssueInvoice(invoice)) {
      return "Émettre";
    }
    if (this.canRegisterPayment(invoice)) {
      return "Enregistrer un paiement";
    }
    if (this.canAdvanceFollowUp(invoice)) {
      return this.getFollowUpActionLabel(invoice);
    }
    if (this.ctx.canExportBilling) {
      return "Exporter la facture";
    }
    return null;
  }

  isPrimaryRailActionBusy(invoice: InvoiceRecord): boolean {
    return this.ctx.invoiceStatusBusyId === invoice.id
      || this.ctx.invoicePaymentBusyId === invoice.id
      || this.ctx.invoiceFollowUpBusyId === invoice.id
      || this.ctx.invoicePdfBusyId === invoice.id;
  }

  getPrimaryRailBusyLabel(invoice: InvoiceRecord): string {
    if (this.ctx.invoiceStatusBusyId === invoice.id) {
      return "Émission...";
    }
    if (this.ctx.invoicePaymentBusyId === invoice.id) {
      return "Paiement...";
    }
    if (this.ctx.invoiceFollowUpBusyId === invoice.id) {
      return "Mise à jour...";
    }
    if (this.ctx.invoicePdfBusyId === invoice.id) {
      return "PDF...";
    }
    return "Traitement...";
  }

  hasSecondaryRailPdfAction(invoice: InvoiceRecord): boolean {
    return this.ctx.canExportBilling && (this.canIssueInvoice(invoice) || this.canRegisterPayment(invoice) || this.canAdvanceFollowUp(invoice));
  }

  async runPrimaryRailAction(invoice: InvoiceRecord): Promise<void> {
    if (this.canIssueInvoice(invoice)) {
      await this.issueInvoice(invoice);
      return;
    }
    if (this.canRegisterPayment(invoice)) {
      this.openPaymentModal(invoice);
      return;
    }
    if (this.canAdvanceFollowUp(invoice)) {
      this.openFollowUpModal(invoice);
      return;
    }
    if (this.ctx.canExportBilling) {
      await this.ctx.exportInvoicePdf(invoice);
    }
  }

  async issueInvoice(invoice: InvoiceRecord): Promise<void> {
    if (!this.canIssueInvoice(invoice)) {
      return;
    }
    await this.ctx.changeInvoiceStatus(invoice, "issued");
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

  canSubmitPayment(invoice: InvoiceRecord): boolean {
    const raw = this.paymentForm.getRawValue();
    const paidAmountCents = this.parseAmountToCents(raw.paidAmount);
    return Boolean(
      paidAmountCents !== null
      && paidAmountCents > 0
      && paidAmountCents <= invoice.total_amount_cents
      && raw.paidAt,
    );
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
    this.followUpModal = { invoice, targetStatus };
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

  async toggleInvoiceHistory(invoice: InvoiceRecord): Promise<void> {
    await this.ctx.toggleInvoiceHistory(invoice);
  }

  private matchesStatusFilter(invoice: InvoiceRecord, filter: BillingHomeInvoiceFilter): boolean {
    if (filter === "all") {
      return true;
    }
    const stage = this.ctx.getInvoiceWorkflowState(invoice).stageLabel;
    switch (filter) {
      case "draft":
        return stage === "À émettre";
      case "expected":
        return stage === "Paiement attendu";
      case "partial":
        return stage === "Partiellement réglée";
      case "overdue":
        return invoice.status === "overdue" && stage !== "Partiellement réglée";
      case "paid":
        return stage === "Soldée";
      default:
        return true;
    }
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

  private matchesDocumentTypeFilter(invoice: InvoiceRecord, filter: BillingHomeDocumentTypeFilter): boolean {
    if (filter === "all") {
      return true;
    }
    if (filter === "draft") {
      return invoice.status === "draft";
    }
    return invoice.status !== "draft";
  }

  private matchesDueWindowFilter(invoice: InvoiceRecord, filter: BillingHomeDueWindowFilter): boolean {
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

  private syncPaymentContextForm(): void {
    const raw = this.paymentForm.getRawValue();
    this.ctx.invoicePaymentForm.paidAmount = raw.paidAmount;
    this.ctx.invoicePaymentForm.paidAt = raw.paidAt;
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
