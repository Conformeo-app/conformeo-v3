from __future__ import annotations

from app.integrations.geocoding import GeoplateformeGeocodingProvider
from app.integrations.georisques import GeorisquesProvider
from app.integrations.base import ExternalResourceNotFoundError
from app.schemas.external import SiteRiskDetails


class SiteRiskService:
    def __init__(
        self,
        georisques_provider: GeorisquesProvider,
        geocoding_provider: GeoplateformeGeocodingProvider,
    ) -> None:
        self.georisques_provider = georisques_provider
        self.geocoding_provider = geocoding_provider

    def get_by_coordinates(self, *, latitude: float, longitude: float) -> SiteRiskDetails:
        return self.georisques_provider.get_site_risks(latitude=latitude, longitude=longitude)

    def get_by_address(self, address: str) -> SiteRiskDetails:
        geocoding = self.geocoding_provider.search(address, limit=1)
        if not geocoding.results:
            raise ExternalResourceNotFoundError(
                "geoplateforme_geocodage",
                f"Aucune adresse n'a été trouvée pour {address}.",
            )
        geocoded = geocoding.results[0]
        details = self.georisques_provider.get_site_risks(
            latitude=geocoded.latitude,
            longitude=geocoded.longitude,
        )
        details.address_query = address
        details.normalized_address = geocoded.address
        details.geocoded_address = geocoded
        details.sources.insert(0, geocoding.source_meta)
        return details
