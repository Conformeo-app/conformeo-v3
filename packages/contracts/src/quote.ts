import type { EntityId, VersionedRecord } from "./common";
import type { BillingFollowUpStatus, BillingFollowUpUpdateRequest } from "./billing-follow-up";
import type { BillingLineItemInput, BillingLineItemRecord } from "./billing-line";

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export interface QuoteRecord extends VersionedRecord {
  organization_id: EntityId;
  customer_id: EntityId;
  customer_name: string;
  worksite_id: EntityId | null;
  worksite_name: string | null;
  sequence_number: number;
  number: string;
  title: string | null;
  issue_date: string;
  valid_until: string | null;
  status: QuoteStatus;
  follow_up_status: BillingFollowUpStatus;
  currency: string;
  line_items: BillingLineItemRecord[];
  subtotal_amount_cents: number;
  total_amount_cents: number;
  notes: string | null;
}

export interface QuoteCreateRequest {
  customer_id: EntityId;
  worksite_id?: EntityId | null;
  title?: string | null;
  issue_date: string;
  valid_until?: string | null;
  status?: QuoteStatus;
  currency?: string | null;
  line_items: BillingLineItemInput[];
  notes?: string | null;
}

export interface QuoteUpdateRequest {
  customer_id: EntityId;
  worksite_id?: EntityId | null;
  title?: string | null;
  issue_date: string;
  valid_until?: string | null;
  line_items: BillingLineItemInput[];
  notes?: string | null;
}

export interface QuoteStatusUpdateRequest {
  status: QuoteStatus;
}

export interface QuoteWorksiteLinkUpdateRequest {
  worksite_id?: EntityId | null;
}

export interface QuoteFollowUpUpdateRequest extends BillingFollowUpUpdateRequest {}
