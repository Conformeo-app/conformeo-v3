import type { VersionedRecord } from "./common";

export type OrganizationStatus = "active" | "inactive";

export interface OrganizationRecord extends VersionedRecord {
  name: string;
  slug: string;
  legal_name: string | null;
  status: OrganizationStatus;
  activity_label: string | null;
  employee_count: number | null;
  has_employees: boolean | null;
  receives_public: boolean | null;
  stores_hazardous_products: boolean | null;
  performs_high_risk_work: boolean | null;
  contact_email: string | null;
  contact_phone: string | null;
  headquarters_address: string | null;
  onboarding_completed_at: string | null;
  default_locale: string;
  default_timezone: string;
  notes: string | null;
}

export interface OrganizationProfileUpdateRequest {
  name: string;
  legal_name?: string | null;
  activity_label?: string | null;
  employee_count?: number | null;
  has_employees?: boolean | null;
  receives_public?: boolean | null;
  stores_hazardous_products?: boolean | null;
  performs_high_risk_work?: boolean | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  headquarters_address?: string | null;
  notes?: string | null;
}
