from __future__ import annotations

from app.integrations.geocoding import GeoplateformeGeocodingProvider
from app.schemas.external import GeocodeSearchResponse


class AddressNormalizationService:
    def __init__(self, provider: GeoplateformeGeocodingProvider) -> None:
        self.provider = provider

    def search(self, query: str, *, limit: int = 5) -> GeocodeSearchResponse:
        return self.provider.search(query, limit=limit)

    def reverse(self, *, latitude: float, longitude: float, limit: int = 3) -> GeocodeSearchResponse:
        return self.provider.reverse(latitude=latitude, longitude=longitude, limit=limit)
