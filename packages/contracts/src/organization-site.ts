import type { EntityId, VersionedRecord } from "./common";

export type OrganizationSiteType = "site" | "building" | "office" | "warehouse";
export type OrganizationSiteStatus = "active" | "archived";

export interface OrganizationSiteRecord extends VersionedRecord {
  organization_id: EntityId;
  name: string;
  address: string;
  site_type: OrganizationSiteType;
  status: OrganizationSiteStatus;
}

export interface OrganizationSiteCreateRequest {
  name: string;
  address: string;
  site_type: OrganizationSiteType;
}

export interface OrganizationSiteUpdateRequest {
  name?: string | null;
  address?: string | null;
  site_type?: OrganizationSiteType | null;
  status?: OrganizationSiteStatus | null;
}
