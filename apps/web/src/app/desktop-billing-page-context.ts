import { InjectionToken } from "@angular/core";
import type {
  AuditLogRecord,
  BillingCustomerRecord,
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
import type { Observable } from "rxjs";

export interface DesktopBillingModuleState {
  readonly customers: BillingCustomerRecord[];
  readonly quotes: QuoteRecord[];
  readonly invoices: InvoiceRecord[];
  readonly worksites: WorksiteApiSummary[];
}

export type DesktopBillingQuoteWorkflowState = {
  readonly flowStepLabel: string;
  readonly flowStepTone: CfmTone;
  readonly stageLabel: string;
  readonly stageTone: CfmTone;
  readonly signalLabel: string;
  readonly signalTone: CfmTone;
  readonly nextActionLabel: string;
  readonly nextActionSummary: string;
  readonly priorityLabel: string;
  readonly priorityTone: CfmTone;
  readonly sortRank: number;
};

export type DesktopBillingInvoiceWorkflowState = {
  readonly flowStepLabel: string;
  readonly flowStepTone: CfmTone;
  readonly stageLabel: string;
  readonly stageTone: CfmTone;
  readonly signalLabel: string;
  readonly signalTone: CfmTone;
  readonly nextActionLabel: string;
  readonly nextActionSummary: string;
  readonly priorityLabel: string;
  readonly priorityTone: CfmTone;
  readonly paymentSummaryLabel: string;
  readonly lastPaymentLabel: string;
  readonly sortRank: number;
};

export interface DesktopBillingPageContext {
  readonly currentMembership: MembershipAccess | null;
  readonly shouldShowWorkspaceContent: boolean;
  readonly isFacturationEnabled: boolean;
  readonly billingAccessLevel: ModuleAccessLevel;
  readonly canReadOrganization: boolean;
  readonly canManageOrganization: boolean;
  readonly canActOnBilling: boolean;
  readonly canExportBilling: boolean;
  readonly billingState$: Observable<DesktopBillingModuleState>;
  readonly billingCustomers: BillingCustomerRecord[];
  readonly quotes: QuoteRecord[];
  readonly invoices: InvoiceRecord[];
  readonly billingWorksites: WorksiteApiSummary[];
  readonly activeQuotesCount: number;
  readonly pendingInvoicesCount: number;
  readonly overdueInvoicesCount: number;
  readonly quotesToFollowUpCount: number;
  readonly quoteStatusBusyId: string | null;
  readonly quoteFollowUpBusyId: string | null;
  readonly quoteDuplicateBusyId: string | null;
  readonly quotePdfBusyId: string | null;
  readonly quoteHistoryBusyId: string | null;
  readonly invoicePdfBusyId: string | null;
  readonly invoiceStatusBusyId: string | null;
  readonly invoiceFollowUpBusyId: string | null;
  readonly invoicePaymentBusyId: string | null;
  readonly invoicePaymentId: string | null;
  readonly invoiceHistoryBusyId: string | null;
  readonly invoicePaymentForm: {
    paidAmount: string;
    paidAt: string;
  };
  getCustomerTypeLabel(customerType: BillingCustomerType): string;
  getQuoteStatusLabel(status: QuoteStatus): string;
  getQuoteStatusTone(status: QuoteStatus): CfmTone;
  getQuoteWorkflowState(quote: QuoteRecord): DesktopBillingQuoteWorkflowState;
  getInvoiceStatusLabel(status: InvoiceStatus): string;
  getInvoiceStatusTone(status: InvoiceStatus): CfmTone;
  getInvoiceWorkflowState(invoice: InvoiceRecord): DesktopBillingInvoiceWorkflowState;
  getBillingFollowUpStatusLabel(status: BillingFollowUpStatus): string;
  getBillingFollowUpStatusTone(status: BillingFollowUpStatus): CfmTone;
  formatAmountCents(amountCents: number, currency?: string): string;
  prepareQuoteFromCustomer(customerId: string): void;
  prepareInvoiceFromCustomer(customerId: string): void;
  changeQuoteStatus(quote: QuoteRecord, status: QuoteStatus): Promise<void>;
  changeQuoteFollowUpStatus(quote: QuoteRecord, followUpStatus: BillingFollowUpStatus): Promise<void>;
  duplicateQuoteAsInvoice(quote: QuoteRecord): Promise<void>;
  exportQuotePdf(quote: QuoteRecord): Promise<void>;
  exportInvoicePdf(invoice: InvoiceRecord): Promise<void>;
  changeInvoiceStatus(invoice: InvoiceRecord, status: "draft" | "issued"): Promise<void>;
  changeInvoiceFollowUpStatus(invoice: InvoiceRecord, followUpStatus: BillingFollowUpStatus): Promise<void>;
  openInvoicePayment(invoice: InvoiceRecord): void;
  cancelInvoicePayment(): void;
  canSaveInvoicePayment(invoice: InvoiceRecord): boolean;
  saveInvoicePayment(invoice: InvoiceRecord): Promise<void>;
  getQuoteHistory(quoteId: string): AuditLogRecord[];
  getInvoiceHistory(invoiceId: string): AuditLogRecord[];
  toggleQuoteHistory(quote: QuoteRecord): Promise<void>;
  toggleInvoiceHistory(invoice: InvoiceRecord): Promise<void>;
  quoteHistoryOpenId: string | null;
  invoiceHistoryOpenId: string | null;
  getBillingHistoryLabel(log: AuditLogRecord): string;
  getBillingHistoryMeta(log: AuditLogRecord): string;
}

export const DESKTOP_BILLING_PAGE_CONTEXT =
  new InjectionToken<DesktopBillingPageContext>("DESKTOP_BILLING_PAGE_CONTEXT");
