import type { EntityId, VersionedRecord } from "./common";

export type BillingCustomerType = "company" | "individual";

export interface BillingCustomerRecord extends VersionedRecord {
  organization_id: EntityId;
  name: string;
  customer_type: BillingCustomerType;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
}

export interface BillingCustomerCreateRequest {
  name: string;
  customer_type: BillingCustomerType;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export interface BillingCustomerUpdateRequest {
  name?: string | null;
  customer_type?: BillingCustomerType | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}
