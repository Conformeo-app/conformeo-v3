import type { EntityId, VersionedRecord } from "./common";
import type { BillingFollowUpStatus, BillingFollowUpUpdateRequest } from "./billing-follow-up";
import type { BillingLineItemInput, BillingLineItemRecord } from "./billing-line";

export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue";

export interface InvoiceRecord extends VersionedRecord {
  organization_id: EntityId;
  customer_id: EntityId;
  customer_name: string;
  worksite_id: EntityId | null;
  worksite_name: string | null;
  sequence_number: number;
  number: string;
  title: string | null;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  follow_up_status: BillingFollowUpStatus;
  currency: string;
  line_items: BillingLineItemRecord[];
  subtotal_amount_cents: number;
  total_amount_cents: number;
  paid_amount_cents: number;
  paid_at: string | null;
  outstanding_amount_cents: number;
  notes: string | null;
}

export interface InvoiceCreateRequest {
  customer_id: EntityId;
  worksite_id?: EntityId | null;
  title?: string | null;
  issue_date: string;
  due_date?: string | null;
  status?: InvoiceStatus;
  currency?: string | null;
  line_items: BillingLineItemInput[];
  notes?: string | null;
}

export interface InvoiceUpdateRequest {
  customer_id: EntityId;
  worksite_id?: EntityId | null;
  title?: string | null;
  issue_date: string;
  due_date?: string | null;
  line_items: BillingLineItemInput[];
  notes?: string | null;
}

export interface InvoiceStatusUpdateRequest {
  status: Extract<InvoiceStatus, "draft" | "issued">;
}

export interface InvoicePaymentCreateRequest {
  paid_amount_cents: number;
  paid_at: string;
}

export interface InvoiceWorksiteLinkUpdateRequest {
  worksite_id?: EntityId | null;
}

export interface InvoiceFollowUpUpdateRequest extends BillingFollowUpUpdateRequest {}
