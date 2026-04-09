import { DestroyRef, Injectable, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import type {
  AuditLogRecord,
  BillingCustomerType,
  BillingFollowUpStatus,
  InvoiceRecord,
  InvoiceStatus,
  MembershipAccess,
  ModuleAccessLevel,
  QuoteRecord,
  QuoteStatus,
  WorksiteApiSummary,
} from "@conformeo/contracts";
import type { CfmTone } from "@conformeo/ui";
import { distinctUntilChanged, map } from "rxjs";

import { ApiClientError } from "./api-error";
import { canActOnModule, canReadModule, getModuleAccessLevel } from "./desktop-access.utils";
import type {
  DesktopBillingInvoiceWorkflowState,
  DesktopBillingModuleState,
  DesktopBillingPageContext,
  DesktopBillingQuoteWorkflowState,
} from "./desktop-billing-page-context";
import { DesktopBillingStateService } from "./desktop-billing-state.service";
import { DESKTOP_SHELL_CONTEXT, type DesktopShellContext } from "./desktop-shell-context";
import { DesktopSessionStateService } from "./desktop-session-state.service";
import {
  downloadInvoicePdf,
  downloadQuotePdf,
  duplicateQuoteToInvoice,
  listAuditLogs,
  recordInvoicePayment,
  updateInvoiceFollowUpStatus,
  updateInvoiceStatus,
  updateQuoteFollowUpStatus,
  updateQuoteStatus,
} from "./organization-client";

type UserErrorContext = "auth" | "load" | "save" | "update" | "export" | "generic";

@Injectable()
export class DesktopBillingFacade implements DesktopBillingPageContext {
  private readonly shell = inject(DESKTOP_SHELL_CONTEXT);
  private readonly billingState = inject(DesktopBillingStateService);
  private readonly sessionState = inject(DesktopSessionStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly billingState$ = this.billingState.state$;

  quoteStatusBusyId: string | null = null;
  quoteFollowUpBusyId: string | null = null;
  quoteDuplicateBusyId: string | null = null;
  quotePdfBusyId: string | null = null;
  quoteHistoryBusyId: string | null = null;
  invoicePdfBusyId: string | null = null;
  invoiceStatusBusyId: string | null = null;
  invoiceFollowUpBusyId: string | null = null;
  invoicePaymentBusyId: string | null = null;
  invoicePaymentId: string | null = null;
  invoiceHistoryBusyId: string | null = null;
  invoicePaymentForm = {
    paidAmount: "",
    paidAt: this.getTodayDateValue(),
  };
  quoteHistoryOpenId: string | null = null;
  invoiceHistoryOpenId: string | null = null;

  private quoteHistoryById: Record<string, AuditLogRecord[]> = {};
  private invoiceHistoryById: Record<string, AuditLogRecord[]> = {};

  constructor() {
    this.sessionState.snapshot$
      .pipe(
        map((snapshot) => ({
          accessToken: snapshot.accessToken,
          organizationId: snapshot.organizationId,
          membership: snapshot.session?.current_membership ?? null,
        })),
        distinctUntilChanged(
          (left, right) =>
            left.accessToken === right.accessToken
            && left.organizationId === right.organizationId
            && left.membership === right.membership,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ accessToken, organizationId }) => {
        if (!accessToken || !organizationId || !this.isFacturationEnabled || !this.canReadOrganization) {
          this.resetTransientState();
          this.billingState.clear();
          return;
        }

        if (this.billingState.isHydratedForCurrentSession()) {
          this.syncTransientState(this.billingState.value);
          return;
        }

        void this.refresh().catch((error) => {
          this.setShellError(this.toErrorMessage(error, "load"));
        });
      });
  }

  get currentMembership(): MembershipAccess | null {
    return this.shell.currentMembership;
  }

  get shouldShowWorkspaceContent(): boolean {
    return Boolean(this.sessionState.accessToken && this.sessionState.organizationId && this.currentMembership);
  }

  get isFacturationEnabled(): boolean {
    return canReadModule(this.currentMembership, "facturation");
  }

  get billingAccessLevel(): ModuleAccessLevel {
    return getModuleAccessLevel(this.currentMembership, "facturation");
  }

  get canReadOrganization(): boolean {
    return this.currentMembership?.permissions.includes("organization:read") ?? false;
  }

  get canManageOrganization(): boolean {
    return this.currentMembership?.permissions.includes("organization:update") ?? false;
  }

  get canActOnBilling(): boolean {
    return canActOnModule(this.currentMembership, "facturation");
  }

  get canExportBilling(): boolean {
    return this.canActOnBilling;
  }

  get billingCustomers() {
    return this.billingState.customers;
  }

  get quotes(): QuoteRecord[] {
    return this.billingState.quotes;
  }

  get invoices(): InvoiceRecord[] {
    return this.billingState.invoices;
  }

  get billingWorksites() {
    return this.billingState.worksites;
  }

  get activeQuotesCount(): number {
    return this.quotes.filter((quote) => quote.status === "draft" || quote.status === "sent").length;
  }

  get pendingInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.outstanding_amount_cents > 0).length;
  }

  get overdueInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === "overdue").length;
  }

  get quotesToFollowUpCount(): number {
    return this.quotes.filter((quote) => quote.follow_up_status === "to_follow_up").length;
  }

  getCustomerTypeLabel(customerType: BillingCustomerType): string {
    switch (customerType) {
      case "company":
        return "Entreprise";
      case "individual":
        return "Particulier";
    }
  }

  getQuoteStatusLabel(status: QuoteStatus): string {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "sent":
        return "Envoyé";
      case "accepted":
        return "Accepté";
      case "declined":
        return "Refusé";
    }
  }

  getQuoteStatusTone(status: QuoteStatus): CfmTone {
    switch (status) {
      case "draft":
        return "neutral";
      case "sent":
        return "progress";
      case "accepted":
        return "success";
      case "declined":
        return "warning";
    }
  }

  getQuoteWorkflowState(quote: QuoteRecord): DesktopBillingQuoteWorkflowState {
    const isExpired = this.isQuoteExpired(quote);

    if (quote.status === "draft") {
      return {
        flowStepLabel: "Brouillon",
        flowStepTone: "neutral",
        stageLabel: "Prêt à envoyer",
        stageTone: "warning",
        signalLabel: "Brouillon prêt",
        signalTone: "warning",
        nextActionLabel: "Envoyer le devis",
        nextActionSummary: "Le devis est prêt. Envoyez-le pour lancer le cycle client.",
        priorityLabel: "Priorité immédiate",
        priorityTone: "warning",
        sortRank: 10,
      };
    }

    if (quote.status === "accepted") {
      return {
        flowStepLabel: "Accepté",
        flowStepTone: "accent",
        stageLabel: "À convertir",
        stageTone: "accent",
        signalLabel: "Devis accepté",
        signalTone: "success",
        nextActionLabel: "Créer une facture",
        nextActionSummary: "Le devis est accepté. Convertissez-le en facture pour passer au cycle d'encaissement.",
        priorityLabel: "Priorité immédiate",
        priorityTone: "warning",
        sortRank: 0,
      };
    }

    if (quote.status === "declined") {
      return {
        flowStepLabel: "Refusé",
        flowStepTone: "neutral",
        stageLabel: "Suivi terminé",
        stageTone: "neutral",
        signalLabel: "Refus client",
        signalTone: "neutral",
        nextActionLabel: "Voir l'historique",
        nextActionSummary: "Le devis est refusé. Vérifiez le contexte avant une éventuelle reprise commerciale.",
        priorityLabel: "Sous contrôle",
        priorityTone: "neutral",
        sortRank: 80,
      };
    }

    if (quote.follow_up_status === "to_follow_up" || isExpired) {
      return {
        flowStepLabel: "Envoyé",
        flowStepTone: "progress",
        stageLabel: "À relancer",
        stageTone: "warning",
        signalLabel: isExpired ? "Validité expirée" : "Relance ouverte",
        signalTone: "warning",
        nextActionLabel: quote.follow_up_status === "to_follow_up" ? "Marquer relancé" : "Relancer",
        nextActionSummary:
          quote.follow_up_status === "to_follow_up"
            ? "Le devis est déjà signalé en relance. Confirmez la relance pour faire avancer le suivi."
            : "Le devis est envoyé mais sa validité ou son suivi impose maintenant une relance explicite.",
        priorityLabel: "Priorité immédiate",
        priorityTone: "warning",
        sortRank: 20,
      };
    }

    if (quote.follow_up_status === "followed_up") {
      return {
        flowStepLabel: "Envoyé",
        flowStepTone: "progress",
        stageLabel: "Relancé",
        stageTone: "progress",
        signalLabel: "Suivi actif",
        signalTone: "calm",
        nextActionLabel: "Attente client",
        nextActionSummary: "La relance a été faite. Passez le devis en attente client ou acceptez-le si le retour est confirmé.",
        priorityLabel: "À suivre",
        priorityTone: "calm",
        sortRank: 30,
      };
    }

    if (quote.follow_up_status === "waiting_customer") {
      return {
        flowStepLabel: "Envoyé",
        flowStepTone: "progress",
        stageLabel: "En attente client",
        stageTone: "calm",
        signalLabel: "Retour attendu",
        signalTone: "calm",
        nextActionLabel: "Marquer accepté",
        nextActionSummary: "Le client doit revenir. Si l'accord est confirmé, passez le devis accepté puis créez la facture.",
        priorityLabel: "À suivre",
        priorityTone: "calm",
        sortRank: 35,
      };
    }

    return {
      flowStepLabel: "Envoyé",
      flowStepTone: "progress",
      stageLabel: "Envoyé",
      stageTone: "progress",
      signalLabel: "En attente retour",
      signalTone: "calm",
      nextActionLabel: "Préparer la relance",
      nextActionSummary: "Le devis est envoyé. Préparez la relance si le client ne revient pas rapidement.",
      priorityLabel: "À suivre",
      priorityTone: "calm",
      sortRank: 25,
    };
  }

  getInvoiceStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case "draft":
        return "Brouillon";
      case "issued":
        return "Émise";
      case "paid":
        return "Payée";
      case "overdue":
        return "En retard";
    }
  }

  getInvoiceStatusTone(status: InvoiceStatus): CfmTone {
    switch (status) {
      case "draft":
        return "neutral";
      case "issued":
        return "progress";
      case "paid":
        return "success";
      case "overdue":
        return "warning";
    }
  }

  getInvoiceWorkflowState(invoice: InvoiceRecord): DesktopBillingInvoiceWorkflowState {
    const lastPaymentLabel = invoice.paid_at ? this.formatDate(invoice.paid_at) : "Aucun règlement";

    if (invoice.status === "draft") {
      return {
        flowStepLabel: "Brouillon",
        flowStepTone: "neutral",
        stageLabel: "À émettre",
        stageTone: "warning",
        signalLabel: "Brouillon prêt",
        signalTone: "warning",
        nextActionLabel: "Émettre",
        nextActionSummary: "La facture est prête mais encore en brouillon. Émettez-la pour lancer l'encaissement.",
        priorityLabel: "Priorité immédiate",
        priorityTone: "warning",
        paymentSummaryLabel: `Montant dû ${this.formatAmountCents(invoice.total_amount_cents, invoice.currency)}`,
        lastPaymentLabel,
        sortRank: 0,
      };
    }

    if (invoice.status === "paid" || invoice.outstanding_amount_cents === 0) {
      return {
        flowStepLabel: "Payée",
        flowStepTone: "success",
        stageLabel: "Soldée",
        stageTone: "success",
        signalLabel: "Sous contrôle",
        signalTone: "success",
        nextActionLabel: "Suivi terminé",
        nextActionSummary: "La facture est soldée et ne demande plus d'action immédiate.",
        priorityLabel: "Sous contrôle",
        priorityTone: "success",
        paymentSummaryLabel: "Réglée en totalité",
        lastPaymentLabel,
        sortRank: 60,
      };
    }

    const hasPartialPayment = invoice.paid_amount_cents > 0 && invoice.outstanding_amount_cents > 0;
    const paymentSummaryLabel = hasPartialPayment
      ? `Payé ${this.formatAmountCents(invoice.paid_amount_cents, invoice.currency)} · reste dû ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}`
      : `Reste dû ${this.formatAmountCents(invoice.outstanding_amount_cents, invoice.currency)}`;

    if (invoice.status === "overdue") {
      return {
        flowStepLabel: "Émise",
        flowStepTone: "progress",
        stageLabel: hasPartialPayment ? "Partiellement réglée" : "En retard",
        stageTone: "danger",
        signalLabel: hasPartialPayment ? "Solde en retard" : "Échéance dépassée",
        signalTone: "danger",
        nextActionLabel: this.getInvoiceFollowUpActionLabel(invoice, "Relancer"),
        nextActionSummary: this.getInvoiceOverdueSummary(invoice, hasPartialPayment),
        priorityLabel: "Urgent",
        priorityTone: "danger",
        paymentSummaryLabel,
        lastPaymentLabel,
        sortRank: 5,
      };
    }

    if (hasPartialPayment) {
      return {
        flowStepLabel: "Émise",
        flowStepTone: "progress",
        stageLabel: "Partiellement réglée",
        stageTone: "warning",
        signalLabel: "Solde à encaisser",
        signalTone: "warning",
        nextActionLabel: this.getInvoiceFollowUpActionLabel(invoice, "Enregistrer un paiement"),
        nextActionSummary:
          invoice.follow_up_status === "normal"
            ? "Une partie du règlement est reçue, mais un solde reste à encaisser. Enregistrez le paiement suivant ou lancez la relance."
            : "Le paiement est partiel et le suivi est déjà engagé. Avancez la relance ou enregistrez le prochain règlement.",
        priorityLabel: invoice.follow_up_status === "normal" ? "Priorité immédiate" : "À suivre",
        priorityTone: invoice.follow_up_status === "normal" ? "warning" : "calm",
        paymentSummaryLabel,
        lastPaymentLabel,
        sortRank: invoice.follow_up_status === "normal" ? 15 : 22,
      };
    }

    if (invoice.follow_up_status === "to_follow_up") {
      return {
        flowStepLabel: "Émise",
        flowStepTone: "progress",
        stageLabel: "Paiement attendu",
        stageTone: "progress",
        signalLabel: "Relance ouverte",
        signalTone: "warning",
        nextActionLabel: "Marquer relancé",
        nextActionSummary: "La facture est ouverte et déjà signalée à relancer. Confirmez la relance pour faire avancer le suivi.",
        priorityLabel: "Priorité immédiate",
        priorityTone: "warning",
        paymentSummaryLabel,
        lastPaymentLabel,
        sortRank: 12,
      };
    }

    if (invoice.follow_up_status === "followed_up") {
      return {
        flowStepLabel: "Émise",
        flowStepTone: "progress",
        stageLabel: "Paiement attendu",
        stageTone: "progress",
        signalLabel: "Relance faite",
        signalTone: "calm",
        nextActionLabel: "Attente client",
        nextActionSummary: "La relance a été faite. Passez la facture en attente client ou enregistrez le règlement dès réception.",
        priorityLabel: "À suivre",
        priorityTone: "calm",
        paymentSummaryLabel,
        lastPaymentLabel,
        sortRank: 24,
      };
    }

    if (invoice.follow_up_status === "waiting_customer") {
      return {
        flowStepLabel: "Émise",
        flowStepTone: "progress",
        stageLabel: "Paiement attendu",
        stageTone: "progress",
        signalLabel: "Attente client",
        signalTone: "calm",
        nextActionLabel: "Enregistrer un paiement",
        nextActionSummary: "Le client doit revenir. Enregistrez le paiement dès qu'il tombe ou relancez si l'attente se prolonge.",
        priorityLabel: "À suivre",
        priorityTone: "calm",
        paymentSummaryLabel,
        lastPaymentLabel,
        sortRank: 28,
      };
    }

    return {
      flowStepLabel: "Émise",
      flowStepTone: "progress",
      stageLabel: "Paiement attendu",
      stageTone: "progress",
      signalLabel: "Encaissement ouvert",
      signalTone: "progress",
      nextActionLabel: "Enregistrer un paiement",
      nextActionSummary: "La facture est émise avec un reste dû. Le prochain geste utile est l'enregistrement du paiement ou le lancement d'une relance.",
      priorityLabel: "À suivre",
      priorityTone: "calm",
      paymentSummaryLabel,
      lastPaymentLabel,
      sortRank: 30,
    };
  }

  getBillingFollowUpStatusLabel(status: BillingFollowUpStatus): string {
    switch (status) {
      case "normal":
        return "Suivi normal";
      case "to_follow_up":
        return "À relancer";
      case "followed_up":
        return "Relancé";
      case "waiting_customer":
        return "En attente client";
    }
  }

  getBillingFollowUpStatusTone(status: BillingFollowUpStatus): CfmTone {
    switch (status) {
      case "normal":
        return "neutral";
      case "to_follow_up":
        return "warning";
      case "followed_up":
        return "progress";
      case "waiting_customer":
        return "calm";
    }
  }

  formatAmountCents(amountCents: number, currency = "EUR"): string {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
    }).format(amountCents / 100);
  }

  prepareQuoteFromCustomer(customerId: string): void {
    if (!this.canActOnBilling) {
      return;
    }
    const customer = this.billingCustomers.find((entry) => entry.id === customerId);
    if (!customer) {
      return;
    }

    const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
    this.clearShellMessages();
    this.setShellFeedback(
      matchedWorksite
        ? `Devis préparé pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
        : `Devis préparé pour ${customer.name}. Aucun chantier repris automatiquement.`,
    );
    void this.router.navigateByUrl("/app/facturation/devis");
  }

  prepareInvoiceFromCustomer(customerId: string): void {
    if (!this.canActOnBilling) {
      return;
    }
    const customer = this.billingCustomers.find((entry) => entry.id === customerId);
    if (!customer) {
      return;
    }

    const matchedWorksite = this.findSingleWorksiteForCustomer(customer.name);
    this.clearShellMessages();
    this.setShellFeedback(
      matchedWorksite
        ? `Facture préparée pour ${customer.name}, avec le chantier ${matchedWorksite.name}.`
        : `Facture préparée pour ${customer.name}. Aucun chantier repris automatiquement.`,
    );
    void this.router.navigateByUrl("/app/facturation/factures");
  }

  async changeQuoteStatus(quote: QuoteRecord, status: QuoteStatus): Promise<void> {
    if (!this.canRunManagedAction() || quote.status === status) {
      return;
    }

    this.quoteStatusBusyId = quote.id;
    this.clearShellMessages();
    try {
      await updateQuoteStatus(this.accessToken!, this.organizationId!, quote.id, { status });
      await this.refresh();
      this.setShellFeedback("Statut du devis mis à jour.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
    } finally {
      this.quoteStatusBusyId = null;
    }
  }

  async changeQuoteFollowUpStatus(quote: QuoteRecord, followUpStatus: BillingFollowUpStatus): Promise<void> {
    if (!this.canRunManagedAction() || quote.follow_up_status === followUpStatus) {
      return;
    }

    this.quoteFollowUpBusyId = quote.id;
    this.clearShellMessages();
    try {
      await updateQuoteFollowUpStatus(this.accessToken!, this.organizationId!, quote.id, {
        follow_up_status: followUpStatus,
      });
      await this.refresh();
      this.setShellFeedback("Suivi du devis mis à jour.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
    } finally {
      this.quoteFollowUpBusyId = null;
    }
  }

  async duplicateQuoteAsInvoice(quote: QuoteRecord): Promise<void> {
    if (!this.canRunManagedAction()) {
      return;
    }

    this.quoteDuplicateBusyId = quote.id;
    this.clearShellMessages();
    try {
      const invoice = await duplicateQuoteToInvoice(this.accessToken!, this.organizationId!, quote.id);
      await this.refresh();
      this.setShellFeedback(`Facture ${invoice.number} créée depuis le devis ${quote.number}.`);
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "save"));
    } finally {
      this.quoteDuplicateBusyId = null;
    }
  }

  async exportQuotePdf(quote: QuoteRecord): Promise<void> {
    if (!this.canRunExportAction()) {
      return;
    }

    this.quotePdfBusyId = quote.id;
    this.clearShellMessages();
    this.setShellFeedback("PDF devis en préparation.");
    try {
      const { blob, fileName } = await downloadQuotePdf(this.accessToken!, this.organizationId!, quote.id);
      this.downloadBlob(blob, fileName);
      this.setShellFeedback("PDF devis généré.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "export"));
    } finally {
      this.quotePdfBusyId = null;
    }
  }

  async exportInvoicePdf(invoice: InvoiceRecord): Promise<void> {
    if (!this.canRunExportAction()) {
      return;
    }

    this.invoicePdfBusyId = invoice.id;
    this.clearShellMessages();
    this.setShellFeedback("PDF facture en préparation.");
    try {
      const { blob, fileName } = await downloadInvoicePdf(this.accessToken!, this.organizationId!, invoice.id);
      this.downloadBlob(blob, fileName);
      this.setShellFeedback("PDF facture généré.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "export"));
    } finally {
      this.invoicePdfBusyId = null;
    }
  }

  async changeInvoiceStatus(invoice: InvoiceRecord, status: "draft" | "issued"): Promise<void> {
    if (!this.canRunManagedAction() || invoice.status === status) {
      return;
    }

    this.invoiceStatusBusyId = invoice.id;
    this.clearShellMessages();
    try {
      await updateInvoiceStatus(this.accessToken!, this.organizationId!, invoice.id, { status });
      await this.refresh();
      this.setShellFeedback("Statut de la facture mis à jour.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
    } finally {
      this.invoiceStatusBusyId = null;
    }
  }

  async changeInvoiceFollowUpStatus(invoice: InvoiceRecord, followUpStatus: BillingFollowUpStatus): Promise<void> {
    if (!this.canRunManagedAction() || invoice.follow_up_status === followUpStatus) {
      return;
    }

    this.invoiceFollowUpBusyId = invoice.id;
    this.clearShellMessages();
    try {
      await updateInvoiceFollowUpStatus(this.accessToken!, this.organizationId!, invoice.id, {
        follow_up_status: followUpStatus,
      });
      await this.refresh();
      this.setShellFeedback("Suivi de la facture mis à jour.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "update"));
    } finally {
      this.invoiceFollowUpBusyId = null;
    }
  }

  openInvoicePayment(invoice: InvoiceRecord): void {
    this.invoicePaymentId = invoice.id;
    this.invoicePaymentForm = {
      paidAmount: (invoice.outstanding_amount_cents / 100).toFixed(2).replace(".", ","),
      paidAt: this.getTodayDateValue(),
    };
  }

  cancelInvoicePayment(): void {
    this.invoicePaymentId = null;
    this.resetInvoicePaymentForm();
  }

  canSaveInvoicePayment(invoice: InvoiceRecord): boolean {
    const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
    return Boolean(
      paidAmountCents !== null
      && paidAmountCents > 0
      && paidAmountCents <= invoice.total_amount_cents
      && this.invoicePaymentForm.paidAt,
    );
  }

  async saveInvoicePayment(invoice: InvoiceRecord): Promise<void> {
    if (!this.canRunManagedAction()) {
      return;
    }

    const paidAmountCents = this.parseUnitPriceToCents(this.invoicePaymentForm.paidAmount);
    if (paidAmountCents === null || !this.invoicePaymentForm.paidAt) {
      this.setShellError("Renseignez un montant payé et une date valides.");
      return;
    }

    this.invoicePaymentBusyId = invoice.id;
    this.clearShellMessages();
    try {
      await recordInvoicePayment(this.accessToken!, this.organizationId!, invoice.id, {
        paid_amount_cents: paidAmountCents,
        paid_at: this.invoicePaymentForm.paidAt,
      });
      await this.refresh();
      this.cancelInvoicePayment();
      this.setShellFeedback("Paiement enregistré.");
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "save"));
    } finally {
      this.invoicePaymentBusyId = null;
    }
  }

  getQuoteHistory(quoteId: string): AuditLogRecord[] {
    return this.quoteHistoryById[quoteId] ?? [];
  }

  getInvoiceHistory(invoiceId: string): AuditLogRecord[] {
    return this.invoiceHistoryById[invoiceId] ?? [];
  }

  async toggleQuoteHistory(quote: QuoteRecord): Promise<void> {
    if (!this.canRunReadAction()) {
      return;
    }

    if (this.quoteHistoryOpenId === quote.id) {
      this.quoteHistoryOpenId = null;
      return;
    }

    this.quoteHistoryBusyId = quote.id;
    this.clearShellMessages();
    try {
      const logs = await listAuditLogs(this.accessToken!, this.organizationId!, {
        limit: 10,
        targetId: quote.id,
        targetTypes: ["quote", "quote_worksite_link"],
      });
      this.quoteHistoryById = { ...this.quoteHistoryById, [quote.id]: logs };
      this.quoteHistoryOpenId = quote.id;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "load"));
    } finally {
      this.quoteHistoryBusyId = null;
    }
  }

  async toggleInvoiceHistory(invoice: InvoiceRecord): Promise<void> {
    if (!this.canRunReadAction()) {
      return;
    }

    if (this.invoiceHistoryOpenId === invoice.id) {
      this.invoiceHistoryOpenId = null;
      return;
    }

    this.invoiceHistoryBusyId = invoice.id;
    this.clearShellMessages();
    try {
      const logs = await listAuditLogs(this.accessToken!, this.organizationId!, {
        limit: 10,
        targetId: invoice.id,
        targetTypes: ["invoice", "invoice_payment", "invoice_worksite_link"],
      });
      this.invoiceHistoryById = { ...this.invoiceHistoryById, [invoice.id]: logs };
      this.invoiceHistoryOpenId = invoice.id;
    } catch (error) {
      this.setShellError(this.toErrorMessage(error, "load"));
    } finally {
      this.invoiceHistoryBusyId = null;
    }
  }

  getBillingHistoryLabel(log: AuditLogRecord): string {
    if (log.target_type === "quote") {
      if (log.action_type === "create") {
        return "Devis créé";
      }
      if (log.action_type === "update") {
        const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
        if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
          return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
        }
      }
      if (log.action_type === "status_change") {
        const nextStatus = this.getAuditChangeValue(log, "status", "to");
        if (this.isQuoteStatus(nextStatus)) {
          return `Statut passé à ${this.getQuoteStatusLabel(nextStatus)}`;
        }
        return "Statut du devis mis à jour";
      }
      return "Devis mis à jour";
    }

    if (log.target_type === "quote_worksite_link") {
      const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
      const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
      if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
        return `Chantier lié mis à jour : ${nextName}`;
      }
      if (typeof nextName === "string") {
        return `Chantier lié : ${nextName}`;
      }
      return "Chantier retiré";
    }

    if (log.target_type === "invoice") {
      if (log.action_type === "create") {
        const sourceQuoteNumber = this.getAuditScalarValue(log, "source_quote_number");
        if (typeof sourceQuoteNumber === "string") {
          return `Facture créée depuis ${sourceQuoteNumber}`;
        }
        return "Facture créée";
      }
      if (log.action_type === "update") {
        const nextFollowUpStatus = this.getAuditChangeValue(log, "follow_up_status", "to");
        if (this.isBillingFollowUpStatus(nextFollowUpStatus)) {
          return `Suivi passé à ${this.getBillingFollowUpStatusLabel(nextFollowUpStatus)}`;
        }
      }
      if (log.action_type === "status_change") {
        const nextStatus = this.getAuditChangeValue(log, "status", "to");
        if (this.isInvoiceStatus(nextStatus)) {
          return `Statut passé à ${this.getInvoiceStatusLabel(nextStatus)}`;
        }
        return "Statut de la facture mis à jour";
      }
      return "Facture mise à jour";
    }

    if (log.target_type === "invoice_payment") {
      const paidAmountCents = this.getAuditChangeValue(log, "paid_amount_cents", "to");
      if (typeof paidAmountCents === "number") {
        return `Paiement enregistré : ${this.formatAmountCents(paidAmountCents)}`;
      }
      return "Paiement enregistré";
    }

    if (log.target_type === "invoice_worksite_link") {
      const previousName = this.getAuditChangeValue(log, "worksite_name", "from");
      const nextName = this.getAuditChangeValue(log, "worksite_name", "to");
      if (typeof nextName === "string" && typeof previousName === "string" && previousName !== nextName) {
        return `Chantier lié mis à jour : ${nextName}`;
      }
      if (typeof nextName === "string") {
        return `Chantier lié : ${nextName}`;
      }
      return "Chantier retiré";
    }

    return "Événement enregistré";
  }

  getBillingHistoryMeta(log: AuditLogRecord): string {
    if (log.target_display) {
      return `Par ${log.actor_label} • ${log.target_display}`;
    }
    return `Par ${log.actor_label}`;
  }

  async refresh(): Promise<void> {
    if (!this.accessToken || !this.organizationId || !this.isFacturationEnabled || !this.canReadOrganization) {
      this.resetTransientState();
      this.billingState.clear();
      return;
    }

    const state = await this.billingState.refresh();
    this.syncTransientState(state);
  }

  private get accessToken(): string | null {
    return this.sessionState.accessToken;
  }

  private get organizationId(): string | null {
    return this.sessionState.organizationId;
  }

  private get mutableShell(): DesktopShellContext & { errorMessage: string; feedbackMessage: string } {
    return this.shell as DesktopShellContext & { errorMessage: string; feedbackMessage: string };
  }

  private canRunReadAction(): boolean {
    return Boolean(this.accessToken && this.organizationId && this.isFacturationEnabled && this.canReadOrganization);
  }

  private canRunManagedAction(): boolean {
    return Boolean(this.accessToken && this.organizationId && this.isFacturationEnabled && this.canActOnBilling);
  }

  private canRunExportAction(): boolean {
    return Boolean(this.accessToken && this.organizationId && this.isFacturationEnabled && this.canExportBilling);
  }

  private clearShellMessages(): void {
    this.mutableShell.errorMessage = "";
    this.mutableShell.feedbackMessage = "";
  }

  private setShellError(message: string): void {
    this.mutableShell.errorMessage = message;
    this.mutableShell.feedbackMessage = "";
  }

  private setShellFeedback(message: string): void {
    this.mutableShell.feedbackMessage = message;
    this.mutableShell.errorMessage = "";
  }

  private syncTransientState(state: DesktopBillingModuleState): void {
    if (this.quoteHistoryOpenId && !state.quotes.some((quote) => quote.id === this.quoteHistoryOpenId)) {
      this.quoteHistoryOpenId = null;
    }
    this.quoteHistoryById = Object.fromEntries(
      Object.entries(this.quoteHistoryById).filter(([quoteId]) => state.quotes.some((quote) => quote.id === quoteId)),
    );

    if (this.invoiceHistoryOpenId && !state.invoices.some((invoice) => invoice.id === this.invoiceHistoryOpenId)) {
      this.invoiceHistoryOpenId = null;
    }
    this.invoiceHistoryById = Object.fromEntries(
      Object.entries(this.invoiceHistoryById).filter(([invoiceId]) => state.invoices.some((invoice) => invoice.id === invoiceId)),
    );

    if (this.invoicePaymentId && !state.invoices.some((invoice) => invoice.id === this.invoicePaymentId)) {
      this.cancelInvoicePayment();
    }
  }

  private resetTransientState(): void {
    this.quoteStatusBusyId = null;
    this.quoteFollowUpBusyId = null;
    this.quoteDuplicateBusyId = null;
    this.quotePdfBusyId = null;
    this.quoteHistoryBusyId = null;
    this.invoicePdfBusyId = null;
    this.invoiceStatusBusyId = null;
    this.invoiceFollowUpBusyId = null;
    this.invoicePaymentBusyId = null;
    this.invoiceHistoryBusyId = null;
    this.quoteHistoryOpenId = null;
    this.invoiceHistoryOpenId = null;
    this.quoteHistoryById = {};
    this.invoiceHistoryById = {};
    this.cancelInvoicePayment();
  }

  private resetInvoicePaymentForm(): void {
    this.invoicePaymentForm = {
      paidAmount: "",
      paidAt: this.getTodayDateValue(),
    };
  }

  private findSingleWorksiteForCustomer(customerName: string | null | undefined): WorksiteApiSummary | null {
    const query = this.toSearchableText(customerName);
    if (!query) {
      return null;
    }

    const matchingWorksites = this.billingWorksites.filter(
      (worksite) => this.toSearchableText(worksite.client_name) === query,
    );
    return matchingWorksites.length === 1 ? matchingWorksites[0] : null;
  }

  private toSearchableText(value: string | null | undefined): string {
    return (value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private isQuoteExpired(quote: QuoteRecord): boolean {
    return Boolean(quote.valid_until && new Date(quote.valid_until).getTime() < Date.now());
  }

  private getInvoiceFollowUpActionLabel(invoice: InvoiceRecord, fallback: string): string {
    switch (invoice.follow_up_status) {
      case "to_follow_up":
        return "Marquer relancé";
      case "followed_up":
        return "Attente client";
      case "waiting_customer":
        return "Enregistrer un paiement";
      case "normal":
      default:
        return fallback;
    }
  }

  private getInvoiceOverdueSummary(invoice: InvoiceRecord, hasPartialPayment: boolean): string {
    if (invoice.follow_up_status === "to_follow_up") {
      return hasPartialPayment
        ? "Le solde restant est en retard et déjà signalé à relancer. Confirmez la relance pour reprendre l'encaissement."
        : "La facture dépasse l'échéance et la relance est déjà ouverte. Confirmez la relance pour faire avancer le suivi.";
    }
    if (invoice.follow_up_status === "followed_up") {
      return hasPartialPayment
        ? "Le solde restant est en retard malgré une relance déjà faite. Passez en attente client ou enregistrez le complément dès réception."
        : "La facture est en retard et la relance a déjà été faite. Passez en attente client ou enregistrez le règlement dès réception.";
    }
    if (invoice.follow_up_status === "waiting_customer") {
      return hasPartialPayment
        ? "Le client doit revenir pour solder le montant restant. Surveillez le paiement puis enregistrez-le dès qu'il tombe."
        : "Le client est censé revenir malgré le retard. Surveillez le paiement puis relancez de nouveau si nécessaire.";
    }
    return hasPartialPayment
      ? "Une partie a été réglée, mais le solde restant dépasse l'échéance. La prochaine étape utile est la relance."
      : "La facture dépasse l'échéance. La prochaine étape utile est la relance avant l'enregistrement du paiement.";
  }

  private formatDate(value: string): string {
    return new Date(value).toLocaleDateString("fr-FR");
  }

  private getAuditChangeValue(
    log: AuditLogRecord,
    field: string,
    side: "from" | "to",
  ): unknown {
    const entry = log.changes?.[field];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return null;
    }
    return (entry as Record<string, unknown>)[side] ?? null;
  }

  private getAuditScalarValue(log: AuditLogRecord, field: string): unknown {
    return log.changes?.[field] ?? null;
  }

  private isQuoteStatus(value: unknown): value is QuoteStatus {
    return value === "draft" || value === "sent" || value === "accepted" || value === "declined";
  }

  private isInvoiceStatus(value: unknown): value is InvoiceStatus {
    return value === "draft" || value === "issued" || value === "paid" || value === "overdue";
  }

  private isBillingFollowUpStatus(value: unknown): value is BillingFollowUpStatus {
    return (
      value === "normal"
      || value === "to_follow_up"
      || value === "followed_up"
      || value === "waiting_customer"
    );
  }

  private toErrorMessage(error: unknown, context: UserErrorContext = "generic"): string {
    if (error instanceof ApiClientError) {
      return this.toApiClientErrorMessage(error, context);
    }

    if (error instanceof Error) {
      if (this.isLikelyNetworkErrorMessage(error.message)) {
        return this.getNetworkErrorMessage(context);
      }
      if (this.isUserFacingErrorMessage(error.message)) {
        return error.message;
      }
    }

    return this.getDefaultErrorMessage(context);
  }

  private toApiClientErrorMessage(error: ApiClientError, context: UserErrorContext): string {
    const detail = error.detail.trim();
    const normalizedDetail = detail.toLowerCase();

    if (normalizedDetail.includes("not authenticated") || normalizedDetail.includes("invalid token")) {
      return "Votre session a expiré. Reconnectez-vous pour continuer.";
    }

    if (
      normalizedDetail.includes("invalid credentials")
      || normalizedDetail.includes("incorrect email")
      || normalizedDetail.includes("incorrect password")
    ) {
      return "Connexion refusée. Vérifiez votre email et votre mot de passe.";
    }

    if (
      normalizedDetail.includes("module")
      && (normalizedDetail.includes("disabled") || normalizedDetail.includes("not enabled"))
    ) {
      return "Ce module n'est pas activé pour cette organisation.";
    }

    switch (error.status) {
      case 400:
      case 409:
      case 422:
        return this.isUserFacingErrorMessage(detail)
          ? detail
          : this.getValidationErrorMessage(context);
      case 401:
        return context === "auth"
          ? "Connexion refusée. Vérifiez votre email et votre mot de passe."
          : "Votre session a expiré. Reconnectez-vous pour continuer.";
      case 403:
        return "Vous n'avez pas accès à cette action pour le moment.";
      case 404:
        return context === "load"
          ? "Les données demandées ne sont plus disponibles. Rechargez l'espace puis réessayez."
          : "L'élément demandé est introuvable ou n'est plus disponible.";
      default:
        if (typeof error.status === "number" && error.status >= 500) {
          return this.getTemporaryUnavailableMessage(context);
        }
        return this.isUserFacingErrorMessage(detail)
          ? detail
          : this.getDefaultErrorMessage(context);
    }
  }

  private isLikelyNetworkErrorMessage(message: string): boolean {
    const normalized = message.toLowerCase();
    return (
      normalized.includes("failed to fetch")
      || normalized.includes("networkerror")
      || normalized.includes("load failed")
      || normalized.includes("network request failed")
      || normalized.includes("fetch failed")
    );
  }

  private isUserFacingErrorMessage(message: string): boolean {
    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 220) {
      return false;
    }

    return ![
      "traceback",
      "sqlalchemy",
      "asyncpg",
      "internal server error",
      "exception",
      "stack",
      "syntaxerror",
      "typeerror",
      "referenceerror",
      "constraint",
      "violates",
      "enum",
      "uuid",
      "failed to fetch",
      "networkerror",
      "fetch failed",
    ].some((token) => trimmed.toLowerCase().includes(token));
  }

  private getDefaultErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "auth":
        return "Connexion impossible pour le moment. Réessayez dans un instant.";
      case "load":
        return "Les données n'ont pas pu être chargées pour le moment. Réessayez dans un instant.";
      case "save":
        return "L'enregistrement n'a pas pu être confirmé. Réessayez dans un instant.";
      case "update":
        return "La mise à jour n'a pas pu être enregistrée. Réessayez dans un instant.";
      case "export":
        return "Le document n'a pas pu être préparé pour le moment. Réessayez dans un instant.";
      default:
        return "Une erreur est survenue. Réessayez dans un instant.";
    }
  }

  private getValidationErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "save":
      case "update":
        return "Vérifiez les informations saisies puis réessayez.";
      case "export":
        return "Le document n'a pas pu être préparé avec ces informations. Vérifiez les champs puis réessayez.";
      case "auth":
        return "Connexion refusée. Vérifiez vos identifiants puis réessayez.";
      default:
        return "Vérifiez les informations puis réessayez.";
    }
  }

  private getNetworkErrorMessage(context: UserErrorContext): string {
    switch (context) {
      case "load":
        return "Impossible de charger les données pour le moment. Vérifiez la connexion puis réessayez.";
      case "save":
      case "update":
        return "La connexion a été interrompue. Vérifiez le réseau puis réessayez.";
      case "export":
        return "Le téléchargement n'a pas abouti. Vérifiez la connexion puis réessayez.";
      case "auth":
        return "Connexion impossible pour le moment. Vérifiez la connexion puis réessayez.";
      default:
        return "Connexion impossible pour le moment. Vérifiez le réseau puis réessayez.";
    }
  }

  private getTemporaryUnavailableMessage(context: UserErrorContext): string {
    switch (context) {
      case "load":
        return "Les données ne sont pas disponibles pour le moment. Réessayez dans un instant.";
      case "save":
      case "update":
        return "L'action n'a pas pu être enregistrée pour le moment. Réessayez dans un instant.";
      case "export":
        return "Le document n'a pas pu être généré pour le moment. Réessayez dans un instant.";
      case "auth":
        return "Le service de connexion est temporairement indisponible. Réessayez dans un instant.";
      default:
        return "Le service est temporairement indisponible. Réessayez dans un instant.";
    }
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const objectUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(objectUrl);
  }

  private getTodayDateValue(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private parseUnitPriceToCents(value: string): number | null {
    const normalized = value.replace(/\s+/g, "").replace(",", ".").trim();
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return null;
    }
    return Math.round(parsed * 100);
  }
}
