from __future__ import annotations

from datetime import date
from typing import Any

import httpx

from app.core.config import Settings
from app.integrations.base import (
    ExternalProviderConfigError,
    ExternalProviderDisabledError,
    ExternalProviderUnavailableError,
    ExternalProviderResponseError,
    ExternalResourceNotFoundError,
    ProviderHTTPClient,
    TTLCache,
    build_cache_key,
    build_source_meta,
    parse_optional_datetime,
)
from app.schemas.external import RegulatorySearchResult, RegulatoryTextDetail, RegulatoryTextSummary


PROVIDER_NAME = "legifrance"


class LegifranceProvider:
    def __init__(
        self,
        settings: Settings,
        *,
        cache: TTLCache | None = None,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.settings = settings
        self.cache = cache
        self.transport = transport
        self.http = ProviderHTTPClient(
            provider_name=PROVIDER_NAME,
            base_url=settings.external_legifrance_base_url,
            timeout_seconds=settings.external_legifrance_timeout_seconds,
            max_retries=settings.external_provider_max_retries,
            default_headers={"User-Agent": settings.external_provider_user_agent},
            cache=cache,
            default_ttl_seconds=settings.external_regulation_cache_ttl_seconds,
            transport=transport,
        )

    def search(self, query: str, *, limit: int = 10) -> RegulatorySearchResult:
        self._ensure_enabled()
        token = self._get_access_token()
        payload = {
            "fond": "ALL",
            "recherche": {
                "champs": [
                    {
                        "typeChamp": "ALL",
                        "operateur": "ET",
                        "criteres": [
                            {
                                "valeur": query,
                                "operateur": "ET",
                                "typeRecherche": "TOUS_LES_MOTS_DANS_UN_CHAMP",
                            }
                        ],
                    }
                ],
                "operateur": "ET",
                "pageNumber": 1,
                "pageSize": max(1, min(limit, 20)),
                "sort": self.settings.external_legifrance_default_sort,
                "typePagination": "DEFAUT",
            },
        }
        cache_key = build_cache_key(PROVIDER_NAME, "search", body=payload)
        raw, cache_hit = self.http.request_json(
            method="POST",
            path="/dila/legifrance/lf-engine-app/search",
            json_body=payload,
            headers={"Authorization": f"Bearer {token}"},
            cache_key=cache_key,
        )
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        results = [self._map_search_result(item, source_meta) for item in raw.get("results", [])]
        return RegulatorySearchResult(
            query=query,
            total_results=int(raw.get("totalResultNumber", len(results) or 0)),
            results=results,
            source_meta=source_meta,
        )

    def get_text(self, document_id: str) -> RegulatoryTextDetail:
        self._ensure_enabled()
        token = self._get_access_token()
        path, body = self._resolve_consult_request(document_id)
        cache_key = build_cache_key(PROVIDER_NAME, "detail", body={"path": path, "request": body})
        raw, cache_hit = self.http.request_json(
            method="POST",
            path=path,
            json_body=body,
            headers={"Authorization": f"Bearer {token}"},
            cache_key=cache_key,
        )
        source_meta = build_source_meta(PROVIDER_NAME, cache_hit=cache_hit)
        summary = self._map_detail_result(document_id, raw, source_meta)
        article_count = len(raw.get("articles", []) or [])
        if document_id.startswith("LEGIARTI"):
            article = raw.get("article") or {}
            article_count = 1 if article else 0
            content_preview = article.get("texte") or article.get("texteHtml")
        else:
            content_preview = raw.get("resume") or raw.get("notice")
        return RegulatoryTextDetail(
            summary=summary,
            content_preview=content_preview,
            article_count=article_count,
            source_meta=source_meta,
        )

    def _ensure_enabled(self) -> None:
        if not (self.settings.external_integrations_enabled and self.settings.external_legifrance_enabled):
            raise ExternalProviderDisabledError(
                PROVIDER_NAME,
                "Le fournisseur Légifrance n'est pas activé.",
            )
        if not self.settings.external_legifrance_client_id or not self.settings.external_legifrance_client_secret:
            raise ExternalProviderConfigError(
                PROVIDER_NAME,
                "Les identifiants Légifrance ne sont pas configurés.",
            )

    def _get_access_token(self) -> str:
        cache_key = build_cache_key(PROVIDER_NAME, "oauth_token")
        if self.cache is not None:
            cached = self.cache.get(cache_key)
            if cached:
                return str(cached)

        data = {"grant_type": self.settings.external_legifrance_oauth_grant_type}
        if self.settings.external_legifrance_scope:
            data["scope"] = self.settings.external_legifrance_scope

        try:
            with httpx.Client(
                timeout=self.settings.external_legifrance_timeout_seconds,
                headers={"User-Agent": self.settings.external_provider_user_agent},
                transport=self.transport,
            ) as client:
                response = client.post(
                    self.settings.external_legifrance_token_url,
                    data=data,
                    auth=(self.settings.external_legifrance_client_id, self.settings.external_legifrance_client_secret),
                )
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            raise ExternalProviderUnavailableError(
                PROVIDER_NAME,
                "Le service OAuth Légifrance est temporairement indisponible.",
            ) from exc
        if response.status_code not in {200, 201}:
            raise ExternalProviderResponseError(
                PROVIDER_NAME,
                f"L'authentification OAuth Légifrance a échoué ({response.status_code}).",
                status_code=response.status_code,
            )
        try:
            payload = response.json()
        except ValueError as exc:
            raise ExternalProviderResponseError(
                PROVIDER_NAME,
                "La réponse OAuth de Légifrance est invalide.",
                status_code=response.status_code,
            ) from exc
        token = payload.get("access_token")
        if not token:
            raise ExternalProviderResponseError(
                PROVIDER_NAME,
                "Le jeton OAuth Légifrance est absent de la réponse.",
                status_code=response.status_code,
            )
        expires_in = int(payload.get("expires_in", 300))
        if self.cache is not None:
            self.cache.set(cache_key, token, max(60, expires_in - 60))
        return str(token)

    def _resolve_consult_request(self, document_id: str) -> tuple[str, dict[str, Any]]:
        if document_id.startswith("JORFTEXT"):
            return (
                "/dila/legifrance/lf-engine-app/consult/jorfPart",
                {"textCid": document_id},
            )
        if document_id.startswith("LEGITEXT"):
            return (
                "/dila/legifrance/lf-engine-app/consult/legiPart",
                {"textId": document_id, "date": date.today().isoformat()},
            )
        if document_id.startswith("LEGIARTI"):
            return (
                "/dila/legifrance/lf-engine-app/consult/getArticle",
                {"id": document_id},
            )
        raise ExternalResourceNotFoundError(
            PROVIDER_NAME,
            f"Le type d'identifiant réglementaire {document_id} n'est pas encore pris en charge.",
        )

    def _map_search_result(self, payload: dict[str, Any], source_meta) -> RegulatoryTextSummary:
        titles = payload.get("titles") or []
        primary_title = titles[0] if titles else {}
        identifier = (
            primary_title.get("id")
            or primary_title.get("cid")
            or payload.get("reference")
            or payload.get("nor")
            or payload.get("title")
            or "unknown"
        )
        title = (
            primary_title.get("title")
            or payload.get("jorfText")
            or payload.get("text")
            or payload.get("reference")
            or identifier
        )
        resume_principal = payload.get("resumePrincipal") or []
        summary = " ".join(str(item).strip() for item in resume_principal[:2] if item).strip() or None
        publication_date = parse_optional_datetime(payload.get("datePublication"))
        effective_date = parse_optional_datetime(payload.get("date")) or parse_optional_datetime(primary_title.get("startDate"))
        return RegulatoryTextSummary(
            id=identifier,
            cid=primary_title.get("cid"),
            title=title,
            nature=primary_title.get("nature") or payload.get("nature"),
            status=primary_title.get("legalStatus") or payload.get("etat"),
            publication_date=publication_date,
            effective_date=effective_date,
            summary=summary,
            source_url=self._build_public_url(primary_title.get("cid") or identifier, payload.get("eli")),
            source_meta=source_meta,
        )

    def _map_detail_result(self, document_id: str, payload: dict[str, Any], source_meta) -> RegulatoryTextSummary:
        if document_id.startswith("LEGIARTI"):
            article = payload.get("article") or {}
            summary = article.get("texte") or article.get("texteHtml") or article.get("nota")
            return RegulatoryTextSummary(
                id=article.get("id") or document_id,
                cid=article.get("cid"),
                title=f"Article {article.get('num')}".strip() if article.get("num") else document_id,
                nature=article.get("nature"),
                status=article.get("etat"),
                publication_date=parse_optional_datetime(article.get("dateDebut")),
                effective_date=parse_optional_datetime(article.get("dateDebut")),
                summary=summary,
                source_url=self._build_public_url(article.get("cid") or article.get("id") or document_id),
                source_meta=source_meta,
            )

        title = payload.get("title") or payload.get("jorfText") or document_id
        summary = payload.get("resume") or payload.get("notice") or payload.get("nota")
        return RegulatoryTextSummary(
            id=payload.get("id") or document_id,
            cid=payload.get("cid"),
            title=title,
            nature=payload.get("nature"),
            status=payload.get("etat") or payload.get("jurisState"),
            publication_date=parse_optional_datetime(payload.get("dateParution")),
            effective_date=parse_optional_datetime(payload.get("dateTexte")) or parse_optional_datetime(payload.get("jurisDate")),
            summary=summary,
            source_url=self._build_public_url(payload.get("cid") or payload.get("id") or document_id, payload.get("eli")),
            source_meta=source_meta,
        )

    @staticmethod
    def _build_public_url(identifier: str | None, eli: str | None = None) -> str | None:
        if eli:
            if eli.startswith("http"):
                return eli
            return f"https://www.legifrance.gouv.fr{eli}"
        if not identifier:
            return None
        return f"https://www.legifrance.gouv.fr/search/all?query={identifier}"
