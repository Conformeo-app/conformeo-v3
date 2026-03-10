import type { VersionedRecord } from "./common";

export type OrganizationStatus = "active" | "inactive";

export interface OrganizationRecord extends VersionedRecord {
  name: string;
  slug: string;
  legal_name: string | null;
  status: OrganizationStatus;
  default_locale: string;
  default_timezone: string;
  notes: string | null;
}
