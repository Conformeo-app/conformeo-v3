from __future__ import annotations

from typing import Any

import httpx

from app.core.config import Settings
from app.integrations.base import (
    ExternalProviderDisabledError,
    ProviderHTTPClient,
    TTLCache,
    build_cache_key,
    build_source_meta,
)
from app.schemas.external import GeocodeSearchResponse, GeocodedAddress, NormalizedAddress


PROVIDER_NAME = "geoplateforme_geocodage"


class GeoplateformeGeocodingProvider:
    def __init__(
        self,
        settings: Settings,
        *,
        cache: TTLCache | None = None,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.settings = settings
        self.http = ProviderHTTPClient(
            provider_name=PROVIDER_NAME,
            base_url=settings.external_geoplateforme_base_url,
            timeout_seconds=settings.external_geoplateforme_timeout_seconds,
            max_retries=settings.external_provider_max_retries,
            default_headers={"User-Agent": settings.external_provider_user_agent},
            cache=cache,
            default_ttl_seconds=settings.external_geocode_cache_ttl_seconds,
            transport=transport,
        )

    def search(self, query: str, *, limit: int = 5) -> GeocodeSearchResponse:
        self._ensure_enabled()
        params = {"q": query, "index": "address", "limit": max(1, min(limit, 20)), "autocomplete": "0"}
        cache_key = build_cache_key(PROVIDER_NAME, "search", params=params)
        payload, cache_hit = self.http.request_json(
            method="GET",
            path="/search",
            params=params,
            cache_key=cache_key,
        )
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        results = [self._map_feature(feature, source_meta) for feature in payload.get("features", [])]
        return GeocodeSearchResponse(
            query=query,
            total_results=len(results),
            results=results,
            source_meta=source_meta,
        )

    def reverse(self, *, latitude: float, longitude: float, limit: int = 3) -> GeocodeSearchResponse:
        self._ensure_enabled()
        params = {
            "lat": latitude,
            "lon": longitude,
            "index": "address",
            "limit": max(1, min(limit, 20)),
        }
        cache_key = build_cache_key(PROVIDER_NAME, "reverse", params=params)
        payload, cache_hit = self.http.request_json(
            method="GET",
            path="/reverse",
            params=params,
            cache_key=cache_key,
        )
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        results = [self._map_feature(feature, source_meta) for feature in payload.get("features", [])]
        return GeocodeSearchResponse(
            query=None,
            total_results=len(results),
            results=results,
            source_meta=source_meta,
        )

    def _ensure_enabled(self) -> None:
        if not (self.settings.external_integrations_enabled and self.settings.external_geoplateforme_enabled):
            raise ExternalProviderDisabledError(
                PROVIDER_NAME,
                "Le fournisseur de géocodage Géoplateforme n'est pas activé.",
            )

    def _map_feature(self, feature: dict[str, Any], source_meta) -> GeocodedAddress:
        geometry = feature.get("geometry") or {}
        properties = feature.get("properties") or {}
        coordinates = geometry.get("coordinates") or [None, None]
        longitude = float(coordinates[0])
        latitude = float(coordinates[1])
        street_parts = [properties.get("housenumber"), properties.get("street")]
        street = " ".join(str(part).strip() for part in street_parts if part).strip() or None
        address = NormalizedAddress(
            label=properties.get("label") or properties.get("name") or f"{latitude},{longitude}",
            street=street,
            postal_code=properties.get("postcode"),
            city=properties.get("city"),
            city_code=properties.get("citycode"),
            country_code="FR",
        )
        return GeocodedAddress(
            label=properties.get("label") or properties.get("name") or address.label,
            latitude=latitude,
            longitude=longitude,
            score=self._parse_float(properties.get("score")),
            kind=properties.get("type"),
            address=address,
            source_meta=source_meta,
        )

    @staticmethod
    def _parse_float(value: Any) -> float | None:
        if value in (None, ""):
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
