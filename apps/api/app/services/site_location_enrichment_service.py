from __future__ import annotations

from app.core.external_enrichment import SiteLocationEnrichmentResult, apply_site_location_enrichment
from app.db.models.organization_site import OrganizationSite
from app.integrations.base import ExternalIntegrationError
from app.services.address_normalization_service import AddressNormalizationService
from app.services.site_risk_service import SiteRiskService


class SiteLocationEnrichmentService:
    def __init__(
        self,
        address_service: AddressNormalizationService,
        site_risk_service: SiteRiskService,
    ) -> None:
        self.address_service = address_service
        self.site_risk_service = site_risk_service

    def enrich_site(self, site: OrganizationSite) -> SiteLocationEnrichmentResult:
        geocoding = self.address_service.search(site.address, limit=2)
        if not geocoding.results:
            return apply_site_location_enrichment(site, None, None)

        geocoded = geocoding.results[0]
        ambiguous = geocoding.total_results > 1 or len(geocoding.results) > 1
        site_risks = None
        try:
            site_risks = self.site_risk_service.get_by_coordinates(
                latitude=geocoded.latitude,
                longitude=geocoded.longitude,
            )
        except ExternalIntegrationError:
            site_risks = None

        return apply_site_location_enrichment(
            site,
            geocoded,
            site_risks,
            ambiguous=ambiguous,
        )
