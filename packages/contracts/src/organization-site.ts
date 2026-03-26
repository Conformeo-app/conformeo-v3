import type { EntityId, IsoDateTime, VersionedRecord } from "./common";

export type OrganizationSiteType = "site" | "building" | "office" | "warehouse";
export type OrganizationSiteStatus = "active" | "archived";
export type OrganizationSiteLocationEnrichmentStatus = "enriched" | "partial" | "no_match" | "failed";
export type OrganizationSiteLocationEnrichmentErrorReason =
  | "provider_unavailable"
  | "provider_response_invalid"
  | "no_geocode_match"
  | "ambiguous_address"
  | "risk_provider_unavailable";

export interface OrganizationSiteRecord extends VersionedRecord {
  organization_id: EntityId;
  name: string;
  address: string;
  site_type: OrganizationSiteType;
  status: OrganizationSiteStatus;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  geocoding_score?: number | null;
  location_last_synced_at?: IsoDateTime | null;
  location_enrichment_status?: OrganizationSiteLocationEnrichmentStatus | null;
  location_enrichment_attempted_at?: IsoDateTime | null;
  location_enrichment_last_error_reason?: OrganizationSiteLocationEnrichmentErrorReason | null;
  site_risk_summary?: string | null;
  site_risk_level?: string | null;
  site_risk_last_synced_at?: IsoDateTime | null;
}

export type OrganizationSiteManualEnrichmentStatus = "updated" | "partial" | "no_match";
export type OrganizationSiteGeocodingStatus = "matched" | "ambiguous" | "not_found";
export type OrganizationSiteRiskStatus = "updated" | "unavailable" | "not_requested";

export interface OrganizationSiteEnrichmentRecord {
  site: OrganizationSiteRecord;
  status: OrganizationSiteManualEnrichmentStatus;
  geocoding_status: OrganizationSiteGeocodingStatus;
  risk_status: OrganizationSiteRiskStatus;
  notes: string[];
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
