from __future__ import annotations

import copy
from dataclasses import dataclass
from datetime import date, datetime, timezone
from functools import lru_cache
import json
import logging
import threading
import time
from typing import Any, Mapping

import httpx

from app.schemas.external import ExternalSourceMeta


logger = logging.getLogger(__name__)


class ExternalIntegrationError(Exception):
    def __init__(self, provider: str, detail: str, *, status_code: int | None = None) -> None:
        super().__init__(detail)
        self.provider = provider
        self.detail = detail
        self.status_code = status_code


class ExternalProviderDisabledError(ExternalIntegrationError):
    pass


class ExternalProviderConfigError(ExternalIntegrationError):
    pass


class ExternalProviderUnavailableError(ExternalIntegrationError):
    pass


class ExternalProviderResponseError(ExternalIntegrationError):
    pass


class ExternalResourceNotFoundError(ExternalIntegrationError):
    pass


@dataclass
class _CacheEntry:
    value: Any
    expires_at: float


class TTLCache:
    def __init__(self, enabled: bool = True) -> None:
        self._enabled = enabled
        self._store: dict[str, _CacheEntry] = {}
        self._lock = threading.RLock()

    def get(self, key: str) -> Any | None:
        if not self._enabled:
            return None
        now = time.monotonic()
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            if entry.expires_at <= now:
                self._store.pop(key, None)
                return None
            return copy.deepcopy(entry.value)

    def set(self, key: str, value: Any, ttl_seconds: int | None) -> None:
        if not self._enabled or ttl_seconds is None or ttl_seconds <= 0:
            return
        with self._lock:
            self._store[key] = _CacheEntry(
                value=copy.deepcopy(value),
                expires_at=time.monotonic() + ttl_seconds,
            )


@lru_cache(maxsize=1)
def get_external_cache() -> TTLCache:
    return TTLCache(enabled=True)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def build_source_meta(
    source: str,
    *,
    cache_hit: bool = False,
    status: str = "ok",
) -> ExternalSourceMeta:
    freshness = "cached" if cache_hit else "live"
    return ExternalSourceMeta(
        source=source,
        retrieved_at=utc_now(),
        freshness=freshness,
        status=status,
    )


def build_cache_key(
    provider: str,
    operation: str,
    *,
    params: Mapping[str, Any] | None = None,
    body: Any | None = None,
) -> str:
    serialized = json.dumps(
        {
            "provider": provider,
            "operation": operation,
            "params": params or {},
            "body": body,
        },
        sort_keys=True,
        ensure_ascii=False,
        default=str,
    )
    return serialized


def parse_optional_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value[:10])
    except ValueError:
        return None


def parse_optional_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    candidates = [
        ("%Y-%m-%dT%H:%M:%S.%f%z", value),
        ("%Y-%m-%dT%H:%M:%S%z", value),
        ("%Y-%m-%dT%H:%M:%S.%f", value),
        ("%Y-%m-%dT%H:%M:%S", value),
    ]
    normalized = value.replace("Z", "+00:00")
    if normalized != value:
        candidates.insert(0, ("%Y-%m-%dT%H:%M:%S.%f%z", normalized))
        candidates.insert(1, ("%Y-%m-%dT%H:%M:%S%z", normalized))

    for fmt, candidate in candidates:
        try:
            parsed = datetime.strptime(candidate, fmt)
            if parsed.tzinfo is None:
                return parsed.replace(tzinfo=timezone.utc)
            return parsed.astimezone(timezone.utc)
        except ValueError:
            continue

    try:
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            return parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError:
        return None


class ProviderHTTPClient:
    RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}

    def __init__(
        self,
        *,
        provider_name: str,
        base_url: str,
        timeout_seconds: float,
        max_retries: int,
        default_headers: Mapping[str, str] | None = None,
        cache: TTLCache | None = None,
        default_ttl_seconds: int | None = None,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.provider_name = provider_name
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.max_retries = max(0, max_retries)
        self.default_headers = {key: value for key, value in dict(default_headers or {}).items() if value}
        self.cache = cache
        self.default_ttl_seconds = default_ttl_seconds
        self.transport = transport

    def request_json(
        self,
        *,
        method: str,
        path: str,
        params: Mapping[str, Any] | None = None,
        json_body: Any | None = None,
        data: Mapping[str, Any] | None = None,
        headers: Mapping[str, str] | None = None,
        auth: httpx.Auth | tuple[str, str] | None = None,
        cache_key: str | None = None,
        ttl_seconds: int | None = None,
        expected_statuses: tuple[int, ...] = (200,),
    ) -> tuple[Any, bool]:
        effective_ttl = self.default_ttl_seconds if ttl_seconds is None else ttl_seconds
        if cache_key and self.cache is not None:
            cached = self.cache.get(cache_key)
            if cached is not None:
                return cached, True

        merged_headers = dict(self.default_headers)
        if headers:
            merged_headers.update(headers)

        last_error: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                with httpx.Client(
                    base_url=self.base_url,
                    timeout=self.timeout_seconds,
                    headers=merged_headers,
                    transport=self.transport,
                ) as client:
                    response = client.request(
                        method=method,
                        url=path,
                        params=params,
                        json=json_body,
                        data=data,
                        auth=auth,
                    )
            except (httpx.TimeoutException, httpx.NetworkError) as exc:
                last_error = exc
                if attempt < self.max_retries:
                    logger.warning(
                        "Retry provider request after transport error",
                        extra={"provider": self.provider_name, "attempt": attempt + 1},
                    )
                    time.sleep(0.1 * (attempt + 1))
                    continue
                raise ExternalProviderUnavailableError(
                    self.provider_name,
                    f"Le fournisseur {self.provider_name} est temporairement indisponible.",
                ) from exc

            if response.status_code in expected_statuses:
                try:
                    payload = response.json()
                except ValueError as exc:
                    raise ExternalProviderResponseError(
                        self.provider_name,
                        f"Le fournisseur {self.provider_name} a renvoyé une réponse invalide.",
                        status_code=response.status_code,
                    ) from exc
                if cache_key and self.cache is not None:
                    self.cache.set(cache_key, payload, effective_ttl)
                return payload, False

            if response.status_code == 404:
                raise ExternalResourceNotFoundError(
                    self.provider_name,
                    f"La ressource demandée est introuvable chez {self.provider_name}.",
                    status_code=response.status_code,
                )

            if response.status_code in {401, 403}:
                raise ExternalProviderUnavailableError(
                    self.provider_name,
                    f"L'authentification du fournisseur {self.provider_name} a échoué.",
                    status_code=response.status_code,
                )

            if response.status_code in self.RETRYABLE_STATUS_CODES and attempt < self.max_retries:
                logger.warning(
                    "Retry provider request after HTTP status",
                    extra={
                        "provider": self.provider_name,
                        "attempt": attempt + 1,
                        "status_code": response.status_code,
                    },
                )
                time.sleep(0.1 * (attempt + 1))
                continue

            raise ExternalProviderResponseError(
                self.provider_name,
                f"Le fournisseur {self.provider_name} a répondu en erreur ({response.status_code}).",
                status_code=response.status_code,
            )

        raise ExternalProviderUnavailableError(
            self.provider_name,
            f"Le fournisseur {self.provider_name} est temporairement indisponible.",
        ) from last_error
