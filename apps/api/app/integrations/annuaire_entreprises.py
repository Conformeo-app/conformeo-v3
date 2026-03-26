from __future__ import annotations

from typing import Any

import httpx

from app.core.config import Settings
from app.integrations.base import (
    ExternalProviderDisabledError,
    ExternalResourceNotFoundError,
    ProviderHTTPClient,
    TTLCache,
    build_cache_key,
    build_source_meta,
    parse_optional_date,
)
from app.schemas.external import (
    CompanyIdentity,
    CompanySearchResponse,
    EstablishmentIdentity,
    NormalizedAddress,
)


PROVIDER_NAME = "annuaire_entreprises"


class AnnuaireEntreprisesProvider:
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
            base_url=settings.external_annuaire_entreprises_base_url,
            timeout_seconds=settings.external_annuaire_entreprises_timeout_seconds,
            max_retries=settings.external_provider_max_retries,
            default_headers={"User-Agent": settings.external_provider_user_agent},
            cache=cache,
            default_ttl_seconds=settings.external_company_cache_ttl_seconds,
            transport=transport,
        )

    def search_companies(self, query: str, *, limit: int = 10) -> CompanySearchResponse:
        self._ensure_enabled()
        payload, cache_hit = self._search_raw(query=query, limit=limit)
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        results = [self._map_company(item, source_meta) for item in payload.get("results", [])]
        return CompanySearchResponse(
            query=query,
            total_results=int(payload.get("total_results", len(results) or 0)),
            results=results,
            source_meta=source_meta,
        )

    def get_company(self, siren: str) -> CompanyIdentity:
        response = self.search_companies(siren, limit=10)
        for company in response.results:
            if company.siren == siren:
                return company
        raise ExternalResourceNotFoundError(
            PROVIDER_NAME,
            f"Aucune entreprise trouvée pour le SIREN {siren}.",
        )

    def get_establishment(self, siret: str) -> EstablishmentIdentity:
        self._ensure_enabled()
        payload, cache_hit = self._search_raw(query=siret, limit=10)
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        for company_payload in payload.get("results", []):
            candidates = []
            siege = company_payload.get("siege")
            if isinstance(siege, dict):
                candidates.append(siege)
            candidates.extend(company_payload.get("matching_etablissements", []))
            for establishment_payload in candidates:
                if establishment_payload.get("siret") == siret:
                    return self._map_establishment(
                        company_payload,
                        establishment_payload,
                        source_meta,
                    )
        raise ExternalResourceNotFoundError(
            PROVIDER_NAME,
            f"Aucun établissement trouvé pour le SIRET {siret}.",
        )

    def _ensure_enabled(self) -> None:
        if not (self.settings.external_integrations_enabled and self.settings.external_annuaire_entreprises_enabled):
            raise ExternalProviderDisabledError(
                PROVIDER_NAME,
                "Le fournisseur Annuaire des Entreprises n'est pas activé.",
            )

    def _search_raw(self, *, query: str, limit: int) -> tuple[dict[str, Any], bool]:
        params = {"q": query, "page": 1, "per_page": max(1, min(limit, 25))}
        cache_key = build_cache_key(PROVIDER_NAME, "search", params=params)
        payload, cache_hit = self.http.request_json(
            method="GET",
            path="/search",
            params=params,
            cache_key=cache_key,
        )
        return payload, cache_hit

    def _map_company(
        self,
        payload: dict[str, Any],
        source_meta,
    ) -> CompanyIdentity:
        headquarters = payload.get("siege") if isinstance(payload.get("siege"), dict) else None
        registered_address = self._build_address(headquarters) if headquarters else None
        status = "active" if payload.get("etat_administratif") == "A" else "closed" if payload.get("etat_administratif") == "F" else "unknown"
        brand_name = None
        if headquarters:
            enseignes = headquarters.get("liste_enseignes") or []
            brand_name = next((item for item in enseignes if item), None)
            if brand_name is None:
                brand_name = headquarters.get("nom_commercial")

        return CompanyIdentity(
            siren=payload.get("siren", ""),
            name=payload.get("nom_complet") or payload.get("nom_raison_sociale") or payload.get("siren", ""),
            legal_name=payload.get("nom_raison_sociale"),
            brand_name=brand_name,
            activity_code=payload.get("activite_principale"),
            category=payload.get("categorie_entreprise"),
            status=status,
            creation_date=parse_optional_date(payload.get("date_creation")),
            employee_range=payload.get("tranche_effectif_salarie"),
            establishment_count=payload.get("nombre_etablissements"),
            open_establishment_count=payload.get("nombre_etablissements_ouverts"),
            headquarters_siret=headquarters.get("siret") if headquarters else None,
            registered_address=registered_address,
            source_meta=source_meta,
        )

    def _map_establishment(
        self,
        company_payload: dict[str, Any],
        payload: dict[str, Any],
        source_meta,
    ) -> EstablishmentIdentity:
        enseignes = payload.get("liste_enseignes") or []
        name = (
            payload.get("nom_commercial")
            or next((item for item in enseignes if item), None)
            or company_payload.get("nom_complet")
            or payload.get("siret", "")
        )
        status = "active" if payload.get("etat_administratif") == "A" else "closed" if payload.get("etat_administratif") == "F" else "unknown"
        latitude = self._parse_float(payload.get("latitude"))
        longitude = self._parse_float(payload.get("longitude"))
        return EstablishmentIdentity(
            siret=payload.get("siret", ""),
            siren=company_payload.get("siren", ""),
            name=name,
            trade_name=payload.get("nom_commercial"),
            activity_code=payload.get("activite_principale"),
            status=status,
            is_headquarters=bool(payload.get("est_siege")),
            creation_date=parse_optional_date(payload.get("date_creation") or payload.get("date_debut_activite")),
            latitude=latitude,
            longitude=longitude,
            address=self._build_address(payload),
            source_meta=source_meta,
        )

    def _build_address(self, payload: dict[str, Any] | None) -> NormalizedAddress | None:
        if not payload:
            return None
        label = payload.get("adresse")
        street_parts = [
            payload.get("numero_voie"),
            payload.get("indice_repetition"),
            payload.get("type_voie"),
            payload.get("libelle_voie"),
        ]
        street = " ".join(str(part).strip() for part in street_parts if part).strip() or None
        if label is None:
            label_parts = [street, payload.get("code_postal"), payload.get("libelle_commune")]
            label = " ".join(str(part).strip() for part in label_parts if part).strip()
        if not label:
            return None
        return NormalizedAddress(
            label=label,
            street=street,
            postal_code=payload.get("code_postal"),
            city=payload.get("libelle_commune"),
            city_code=payload.get("commune"),
            country_code="FR",
        )

    @staticmethod
    def _parse_float(value: Any) -> float | None:
        if value in (None, ""):
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None
