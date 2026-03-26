from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.organization_site import OrganizationSiteStatus, OrganizationSiteType
from app.schemas.common import BaseReadModel
from app.schemas.external import ExternalSourceMeta

SiteLocationEnrichmentStatus = Literal["enriched", "partial", "no_match", "failed"]
SiteLocationEnrichmentErrorReason = Literal[
    "provider_unavailable",
    "provider_response_invalid",
    "no_geocode_match",
    "ambiguous_address",
    "risk_provider_unavailable",
]


class OrganizationSiteRead(BaseReadModel):
    organization_id: UUID
    name: str
    address: str
    site_type: OrganizationSiteType
    status: OrganizationSiteStatus
    normalized_address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    geocoding_score: float | None = None
    location_source_meta: ExternalSourceMeta | None = None
    location_last_synced_at: datetime | None = None
    location_enrichment_status: SiteLocationEnrichmentStatus | None = None
    location_enrichment_attempted_at: datetime | None = None
    location_enrichment_last_error_reason: SiteLocationEnrichmentErrorReason | None = None
    site_risk_level: str | None = None
    site_risk_summary: str | None = None
    site_risk_last_synced_at: datetime | None = None


class OrganizationSiteCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    address: str = Field(min_length=5, max_length=500)
    site_type: OrganizationSiteType = OrganizationSiteType.SITE


class OrganizationSiteUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    address: str | None = Field(default=None, min_length=5, max_length=500)
    site_type: OrganizationSiteType | None = None
    status: OrganizationSiteStatus | None = None


class SiteLocationEnrichmentRead(BaseModel):
    site: OrganizationSiteRead
    status: str
    geocoding_status: str
    risk_status: str
    notes: list[str]
    sources: list[ExternalSourceMeta]
