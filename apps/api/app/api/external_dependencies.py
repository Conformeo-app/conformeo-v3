from __future__ import annotations

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.integrations import (
    AnnuaireEntreprisesProvider,
    GeoplateformeGeocodingProvider,
    GeorisquesProvider,
    LegifranceProvider,
)
from app.integrations.base import TTLCache, get_external_cache
from app.services import (
    AddressNormalizationService,
    CompanyEnrichmentService,
    OrganizationRegistrySyncService,
    RegulatoryWatchService,
    SiteLocationEnrichmentService,
    SiteRiskService,
)


def resolve_external_cache(settings: Settings) -> TTLCache:
    if settings.external_cache_enabled:
        return get_external_cache()
    return TTLCache(enabled=False)


def get_company_enrichment_service(
    settings: Settings = Depends(get_settings),
) -> CompanyEnrichmentService:
    provider = AnnuaireEntreprisesProvider(settings, cache=resolve_external_cache(settings))
    return CompanyEnrichmentService(provider)


def get_address_normalization_service(
    settings: Settings = Depends(get_settings),
) -> AddressNormalizationService:
    provider = GeoplateformeGeocodingProvider(settings, cache=resolve_external_cache(settings))
    return AddressNormalizationService(provider)


def get_regulatory_watch_service(
    settings: Settings = Depends(get_settings),
) -> RegulatoryWatchService:
    provider = LegifranceProvider(settings, cache=resolve_external_cache(settings))
    return RegulatoryWatchService(provider)


def get_site_risk_service(
    settings: Settings = Depends(get_settings),
) -> SiteRiskService:
    cache = resolve_external_cache(settings)
    geocoding_provider = GeoplateformeGeocodingProvider(settings, cache=cache)
    georisques_provider = GeorisquesProvider(settings, cache=cache)
    return SiteRiskService(georisques_provider, geocoding_provider)


def get_organization_registry_sync_service(
    company_service: CompanyEnrichmentService = Depends(get_company_enrichment_service),
) -> OrganizationRegistrySyncService:
    return OrganizationRegistrySyncService(company_service)


def get_site_location_enrichment_service(
    address_service: AddressNormalizationService = Depends(get_address_normalization_service),
    site_risk_service: SiteRiskService = Depends(get_site_risk_service),
) -> SiteLocationEnrichmentService:
    return SiteLocationEnrichmentService(address_service, site_risk_service)
