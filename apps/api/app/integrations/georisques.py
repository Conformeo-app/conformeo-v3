from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import Settings
from app.integrations.base import (
    ExternalProviderConfigError,
    ExternalProviderDisabledError,
    ExternalProviderUnavailableError,
    ProviderHTTPClient,
    TTLCache,
    build_cache_key,
    build_source_meta,
)
from app.schemas.external import SiteRiskDetails, SiteRiskItem, SiteRiskSummary


logger = logging.getLogger(__name__)
PROVIDER_NAME = "georisques"


class GeorisquesProvider:
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
            base_url=settings.external_georisques_base_url,
            timeout_seconds=settings.external_georisques_timeout_seconds,
            max_retries=settings.external_provider_max_retries,
            default_headers={
                "User-Agent": settings.external_provider_user_agent,
                "Authorization": f"Bearer {settings.external_georisques_api_token}" if settings.external_georisques_api_token else "",
            },
            cache=cache,
            default_ttl_seconds=settings.external_site_risks_cache_ttl_seconds,
            transport=transport,
        )

    def get_site_risks(self, *, latitude: float, longitude: float) -> SiteRiskDetails:
        self._ensure_enabled()
        base_params = {"latitude": latitude, "longitude": longitude, "pageSize": 20, "pageNumber": 0, "rayon": 0}

        errors = 0
        cache_hits: list[bool] = []
        status = "ok"

        gaspar = self._safe_query("gaspar_risques", "/api/v2/gaspar/risques", base_params)
        cache_hits.append(gaspar[1])
        if gaspar[0] is None:
            errors += 1

        seismic = self._safe_query("zonage_sismique", "/api/v2/zonage_sismique", base_params)
        cache_hits.append(seismic[1])
        if seismic[0] is None:
            errors += 1

        radon = self._safe_query("radon", "/api/v2/radon", base_params)
        cache_hits.append(radon[1])
        if radon[0] is None:
            errors += 1

        rga = self._safe_query("rga", "/api/v2/rga", base_params)
        cache_hits.append(rga[1])
        if rga[0] is None:
            errors += 1

        ssp = self._safe_query("ssp", "/api/v2/ssp", base_params)
        cache_hits.append(ssp[1])
        if ssp[0] is None:
            errors += 1

        if errors == 5:
            raise ExternalProviderUnavailableError(
                PROVIDER_NAME,
                "Les données Géorisques sont temporairement indisponibles.",
            )
        if errors > 0:
            status = "partial"

        items = [
            self._build_gaspar_item(gaspar[0]),
            self._build_seismic_item(seismic[0]),
            self._build_radon_item(radon[0]),
            self._build_rga_item(rga[0]),
            self._build_ssp_item(ssp[0]),
        ]

        critical = [item for item in items if item.level == "critical"]
        warning = [item for item in items if item.level == "warning"]
        if critical:
            headline = "Le site présente des signaux de risque à vérifier."
            level = "critical"
        elif warning:
            headline = "Le site demande une vérification réglementaire ciblée."
            level = "warning"
        else:
            headline = "Aucun signal critique n'a été remonté pour ce site."
            level = "success"

        key_findings = [item.summary for item in critical[:2] + warning[:2]]
        if not key_findings:
            key_findings = ["Le socle Géorisques ne remonte pas d'alerte critique immédiate."]

        return SiteRiskDetails(
            latitude=latitude,
            longitude=longitude,
            summary=SiteRiskSummary(
                headline=headline,
                level=level,
                key_findings=key_findings[:3],
            ),
            items=items,
            sources=[
                build_source_meta(
                    PROVIDER_NAME,
                    cache_hit=all(cache_hits) if cache_hits else False,
                    status=status,
                )
            ],
        )

    def _ensure_enabled(self) -> None:
        if not (self.settings.external_integrations_enabled and self.settings.external_georisques_enabled):
            raise ExternalProviderDisabledError(
                PROVIDER_NAME,
                "Le fournisseur Géorisques n'est pas activé.",
            )
        if not self.settings.external_georisques_api_token:
            raise ExternalProviderConfigError(
                PROVIDER_NAME,
                "Le jeton Géorisques n'est pas configuré.",
            )

    def _safe_query(
        self,
        operation: str,
        path: str,
        params: dict[str, Any],
    ) -> tuple[dict[str, Any] | None, bool]:
        try:
            cache_key = build_cache_key(PROVIDER_NAME, operation, params=params)
            return self.http.request_json(
                method="GET",
                path=path,
                params=params,
                cache_key=cache_key,
            )
        except ExternalProviderUnavailableError:
            raise
        except Exception as exc:  # pragma: no cover - defensive logging
            logger.warning(
                "Partial Georisques failure",
                extra={"operation": operation, "provider": PROVIDER_NAME},
            )
            return None, False

    def _build_gaspar_item(self, payload: dict[str, Any] | None) -> SiteRiskItem:
        content = (payload or {}).get("content") or []
        labels = sorted({item.get("libelle") for item in content if item.get("libelle")})
        count = len(labels)
        if count == 0:
            return SiteRiskItem(
                code="gaspar",
                label="Risques recensés",
                level="success",
                summary="Aucun type de risque GASPAR remonté pour ce point.",
                count=0,
            )
        level = "critical" if count >= 3 else "warning"
        return SiteRiskItem(
            code="gaspar",
            label="Risques recensés",
            level=level,
            summary=f"{count} type(s) de risques recensés : {', '.join(labels[:3])}.",
            count=count,
        )

    def _build_seismic_item(self, payload: dict[str, Any] | None) -> SiteRiskItem:
        content = (payload or {}).get("content") or []
        zone = next((item.get("zoneSismicite") for item in content if item.get("zoneSismicite")), None)
        if zone is None:
            return SiteRiskItem(
                code="seismic",
                label="Séisme",
                level="unknown",
                summary="Niveau de sismicité indisponible.",
            )
        level = "critical" if zone in {"4", "5"} else "warning" if zone in {"2", "3"} else "success"
        return SiteRiskItem(
            code="seismic",
            label="Séisme",
            level=level,
            summary=f"Zone de sismicité {zone}.",
        )

    def _build_radon_item(self, payload: dict[str, Any] | None) -> SiteRiskItem:
        content = (payload or {}).get("content") or []
        classe = next((item.get("classePotentiel") for item in content if item.get("classePotentiel")), None)
        if classe is None:
            return SiteRiskItem(
                code="radon",
                label="Radon",
                level="unknown",
                summary="Potentiel radon indisponible.",
            )
        level = "critical" if classe == "3" else "warning" if classe == "2" else "success"
        return SiteRiskItem(
            code="radon",
            label="Radon",
            level=level,
            summary=f"Potentiel radon classé {classe}.",
        )

    def _build_rga_item(self, payload: dict[str, Any] | None) -> SiteRiskItem:
        content = (payload or {}).get("content") or []
        exposition = next((item.get("exposition") for item in content if item.get("exposition")), None)
        if exposition is None:
            return SiteRiskItem(
                code="rga",
                label="Argiles",
                level="unknown",
                summary="Exposition retrait-gonflement indisponible.",
            )
        normalized = exposition.lower()
        if "fort" in normalized:
            level = "critical"
        elif "moy" in normalized or "mod" in normalized:
            level = "warning"
        else:
            level = "success"
        return SiteRiskItem(
            code="rga",
            label="Argiles",
            level=level,
            summary=f"Exposition retrait-gonflement : {exposition}.",
        )

    def _build_ssp_item(self, payload: dict[str, Any] | None) -> SiteRiskItem:
        model = payload or {}
        casias_total = ((model.get("casias") or {}).get("totalElements") or 0)
        instructions_total = ((model.get("instructions") or {}).get("totalElements") or 0)
        sis_total = ((model.get("conclusionsSis") or {}).get("totalElements") or 0)
        sup_total = ((model.get("conclusionsSup") or {}).get("totalElements") or 0)
        total = int(casias_total) + int(instructions_total) + int(sis_total) + int(sup_total)
        if total == 0:
            return SiteRiskItem(
                code="ssp",
                label="Sites et sols pollués",
                level="success",
                summary="Aucun signal SSP remonté sur ce point.",
                count=0,
            )
        return SiteRiskItem(
            code="ssp",
            label="Sites et sols pollués",
            level="warning",
            summary=(
                f"{total} signalement(s) SSP : "
                f"CASIAS {casias_total}, instructions {instructions_total}, SIS {sis_total}, SUP {sup_total}."
            ),
            count=total,
        )
