from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


ExternalFreshness = Literal["live", "cached", "stale", "unknown"]
ExternalStatus = Literal["ok", "partial", "unavailable"]
SiteRiskLevel = Literal["neutral", "success", "warning", "critical", "unknown"]


class ExternalSourceMeta(BaseModel):
    source: str
    retrieved_at: datetime
    freshness: ExternalFreshness = "live"
    status: ExternalStatus = "ok"


class NormalizedAddress(BaseModel):
    label: str
    street: str | None = None
    postal_code: str | None = None
    city: str | None = None
    city_code: str | None = None
    country_code: str = "FR"


class CompanyIdentity(BaseModel):
    siren: str
    name: str
    legal_name: str | None = None
    brand_name: str | None = None
    activity_code: str | None = None
    category: str | None = None
    status: Literal["active", "closed", "unknown"] = "unknown"
    creation_date: date | None = None
    employee_range: str | None = None
    establishment_count: int | None = None
    open_establishment_count: int | None = None
    headquarters_siret: str | None = None
    registered_address: NormalizedAddress | None = None
    source_meta: ExternalSourceMeta


class EstablishmentIdentity(BaseModel):
    siret: str
    siren: str
    name: str
    trade_name: str | None = None
    activity_code: str | None = None
    status: Literal["active", "closed", "unknown"] = "unknown"
    is_headquarters: bool = False
    creation_date: date | None = None
    latitude: float | None = None
    longitude: float | None = None
    address: NormalizedAddress | None = None
    source_meta: ExternalSourceMeta


class GeocodedAddress(BaseModel):
    label: str
    latitude: float
    longitude: float
    score: float | None = None
    kind: str | None = None
    address: NormalizedAddress
    source_meta: ExternalSourceMeta


class CompanySearchResponse(BaseModel):
    query: str
    total_results: int
    results: list[CompanyIdentity] = Field(default_factory=list)
    source_meta: ExternalSourceMeta


class GeocodeSearchResponse(BaseModel):
    query: str | None = None
    total_results: int
    results: list[GeocodedAddress] = Field(default_factory=list)
    source_meta: ExternalSourceMeta


class RegulatoryTextSummary(BaseModel):
    id: str
    cid: str | None = None
    title: str
    nature: str | None = None
    status: str | None = None
    publication_date: datetime | None = None
    effective_date: datetime | None = None
    summary: str | None = None
    source_url: str | None = None
    source_meta: ExternalSourceMeta


class RegulatorySearchResult(BaseModel):
    query: str
    total_results: int
    results: list[RegulatoryTextSummary] = Field(default_factory=list)
    source_meta: ExternalSourceMeta


class RegulatoryTextDetail(BaseModel):
    summary: RegulatoryTextSummary
    content_preview: str | None = None
    article_count: int | None = None
    source_meta: ExternalSourceMeta


class SiteRiskItem(BaseModel):
    code: str
    label: str
    level: SiteRiskLevel
    summary: str
    count: int | None = None


class SiteRiskSummary(BaseModel):
    headline: str
    level: SiteRiskLevel
    key_findings: list[str] = Field(default_factory=list)


class SiteRiskDetails(BaseModel):
    address_query: str | None = None
    normalized_address: NormalizedAddress | None = None
    geocoded_address: GeocodedAddress | None = None
    latitude: float | None = None
    longitude: float | None = None
    summary: SiteRiskSummary
    items: list[SiteRiskItem] = Field(default_factory=list)
    sources: list[ExternalSourceMeta] = Field(default_factory=list)
