from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Literal

from app.db.models.organization import Organization
from app.db.models.organization_site import OrganizationSite
from app.integrations.base import (
    ExternalIntegrationError,
    ExternalProviderConfigError,
    ExternalProviderDisabledError,
    ExternalProviderResponseError,
    ExternalProviderUnavailableError,
    ExternalResourceNotFoundError,
)
from app.schemas.external import CompanyIdentity, EstablishmentIdentity, GeocodedAddress, SiteRiskDetails


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _serialize_value(value: Any) -> Any:
    if value is None:
        return None
    if hasattr(value, "model_dump"):
        return value.model_dump(mode="json")
    if isinstance(value, list):
        return [_serialize_value(item) for item in value]
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


@dataclass
class FieldDecision:
    field: str
    action: Literal["updated", "kept_existing", "unchanged", "missing_external_value"]
    current_value: Any
    external_value: Any
    applied_value: Any
    reason: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "field": self.field,
            "action": self.action,
            "current_value": _serialize_value(self.current_value),
            "external_value": _serialize_value(self.external_value),
            "applied_value": _serialize_value(self.applied_value),
            "reason": self.reason,
        }


@dataclass
class OrganizationCompanyEnrichmentResult:
    synced_at: datetime
    company: CompanyIdentity
    establishment: EstablishmentIdentity | None
    field_decisions: list[FieldDecision]
    changes: dict[str, dict[str, Any]]


@dataclass
class SiteLocationEnrichmentResult:
    synced_at: datetime
    status: Literal["updated", "partial", "no_match"]
    geocoding_status: Literal["matched", "ambiguous", "not_found"]
    risk_status: Literal["updated", "unavailable", "not_requested"]
    notes: list[str]
    changes: dict[str, dict[str, Any]]
    sources: list[dict[str, Any]]


def apply_company_registry_enrichment(
    organization: Organization,
    company: CompanyIdentity,
    *,
    establishment: EstablishmentIdentity | None = None,
) -> OrganizationCompanyEnrichmentResult:
    synced_at = _now_utc()
    field_decisions: list[FieldDecision] = []
    changes: dict[str, dict[str, Any]] = {}
    previous_registry_values = {
        "name": organization.registry_company_name,
        "legal_name": organization.registry_company_name,
        "headquarters_address": organization.registry_address,
    }

    registry_field_updates = {
        "registry_siren": company.siren,
        "registry_headquarters_siret": (
            company.headquarters_siret
            or (establishment.siret if establishment is not None and establishment.is_headquarters else None)
        ),
        "registry_company_name": company.legal_name or company.name,
        "registry_activity_code": company.activity_code,
        "registry_status": company.status,
        "registry_address": company.registered_address.label if company.registered_address is not None else None,
        "registry_source_meta": company.source_meta.model_dump(mode="json"),
        "registry_last_synced_at": synced_at,
    }

    for field_name, next_value in registry_field_updates.items():
        current_value = getattr(organization, field_name)
        if current_value != next_value:
            setattr(organization, field_name, next_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="updated",
                    current_value=current_value,
                    external_value=next_value,
                    applied_value=next_value,
                )
            )
        else:
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="unchanged",
                    current_value=current_value,
                    external_value=next_value,
                    applied_value=current_value,
                )
            )

    profile_candidates = {
        "legal_name": company.legal_name or company.name,
        "headquarters_address": company.registered_address.label if company.registered_address is not None else None,
        "name": company.name,
    }

    for field_name, external_value in profile_candidates.items():
        current_value = getattr(organization, field_name)
        previous_registry_value = previous_registry_values.get(field_name)

        if not external_value:
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="missing_external_value",
                    current_value=current_value,
                    external_value=None,
                    applied_value=current_value,
                    reason="external_value_missing",
                )
            )
            continue

        if current_value in (None, ""):
            setattr(organization, field_name, external_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(external_value)}
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="updated",
                    current_value=current_value,
                    external_value=external_value,
                    applied_value=external_value,
                    reason="empty_local_value",
                )
            )
            continue

        if previous_registry_value is not None and current_value == previous_registry_value and current_value != external_value:
            setattr(organization, field_name, external_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(external_value)}
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="updated",
                    current_value=current_value,
                    external_value=external_value,
                    applied_value=external_value,
                    reason="refresh_previous_registry_value",
                )
            )
            continue

        if current_value == external_value:
            field_decisions.append(
                FieldDecision(
                    field=field_name,
                    action="unchanged",
                    current_value=current_value,
                    external_value=external_value,
                    applied_value=current_value,
                )
            )
            continue

        field_decisions.append(
            FieldDecision(
                field=field_name,
                action="kept_existing",
                current_value=current_value,
                external_value=external_value,
                applied_value=current_value,
                reason="protected_existing_value",
            )
        )

    if changes:
        organization.version += 1

    return OrganizationCompanyEnrichmentResult(
        synced_at=synced_at,
        company=company,
        establishment=establishment,
        field_decisions=field_decisions,
        changes=changes,
    )


def clear_site_location_enrichment(site: OrganizationSite) -> dict[str, dict[str, Any]]:
    changes: dict[str, dict[str, Any]] = {}
    clear_updates = {
        "normalized_address": None,
        "latitude": None,
        "longitude": None,
        "geocoding_score": None,
        "location_source_meta": None,
        "location_last_synced_at": None,
        "location_enrichment_status": None,
        "location_enrichment_attempted_at": None,
        "location_enrichment_last_error_reason": None,
        "site_risk_level": None,
        "site_risk_summary": None,
        "site_risk_items": None,
        "site_risk_source_meta": None,
        "site_risk_last_synced_at": None,
    }
    for field_name, next_value in clear_updates.items():
        current_value = getattr(site, field_name)
        if current_value != next_value:
            setattr(site, field_name, next_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": None}
    return changes


def mark_site_location_enrichment_failed(
    site: OrganizationSite,
    *,
    reason: str,
) -> dict[str, dict[str, Any]]:
    changes: dict[str, dict[str, Any]] = {}
    synced_at = _now_utc()
    failed_updates = {
        "location_enrichment_status": "failed",
        "location_enrichment_attempted_at": synced_at,
        "location_enrichment_last_error_reason": reason,
    }
    for field_name, next_value in failed_updates.items():
        current_value = getattr(site, field_name)
        if current_value != next_value:
            setattr(site, field_name, next_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}
    if changes:
        site.version += 1
    return changes


def resolve_site_location_failure_reason(exc: ExternalIntegrationError) -> str:
    if isinstance(exc, ExternalProviderResponseError):
        return "provider_response_invalid"
    if isinstance(exc, ExternalResourceNotFoundError):
        return "no_geocode_match"
    if isinstance(exc, (ExternalProviderUnavailableError, ExternalProviderDisabledError, ExternalProviderConfigError)):
        return "provider_unavailable"
    return "provider_unavailable"


def apply_site_location_enrichment(
    site: OrganizationSite,
    geocoded: GeocodedAddress | None,
    site_risks: SiteRiskDetails | None,
    *,
    ambiguous: bool = False,
) -> SiteLocationEnrichmentResult:
    synced_at = _now_utc()
    changes: dict[str, dict[str, Any]] = {}
    notes: list[str] = []
    sources: list[dict[str, Any]] = []

    if geocoded is None:
        changes.update(clear_site_location_enrichment(site))
        state_updates = {
            "location_enrichment_status": "no_match",
            "location_enrichment_attempted_at": synced_at,
            "location_enrichment_last_error_reason": "no_geocode_match",
        }
        for field_name, next_value in state_updates.items():
            current_value = getattr(site, field_name)
            if current_value != next_value:
                setattr(site, field_name, next_value)
                changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}
        if changes:
            site.version += 1
        return SiteLocationEnrichmentResult(
            synced_at=synced_at,
            status="no_match",
            geocoding_status="not_found",
            risk_status="not_requested",
            notes=["Aucune adresse normalisée n'a pu être trouvée pour ce site."],
            changes=changes,
            sources=[],
        )

    location_updates = {
        "normalized_address": geocoded.address.label,
        "latitude": geocoded.latitude,
        "longitude": geocoded.longitude,
        "geocoding_score": geocoded.score,
        "location_source_meta": geocoded.source_meta.model_dump(mode="json"),
        "location_last_synced_at": synced_at,
    }
    for field_name, next_value in location_updates.items():
        current_value = getattr(site, field_name)
        if current_value != next_value:
            setattr(site, field_name, next_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}

    sources.append(geocoded.source_meta.model_dump(mode="json"))

    if ambiguous:
        notes.append("Plusieurs adresses ont été trouvées ; la meilleure correspondance a été retenue.")

    if site_risks is None:
        clear_risk_updates = {
            "site_risk_level": None,
            "site_risk_summary": None,
            "site_risk_items": None,
            "site_risk_source_meta": None,
            "site_risk_last_synced_at": None,
        }
        for field_name, next_value in clear_risk_updates.items():
            current_value = getattr(site, field_name)
            if current_value != next_value:
                setattr(site, field_name, next_value)
                changes[field_name] = {"from": _serialize_value(current_value), "to": None}
        notes.append("Le géocodage a abouti, mais la synthèse de risques n'était pas disponible.")
        status = "partial"
        risk_status = "unavailable"
        last_error_reason = "ambiguous_address" if ambiguous else "risk_provider_unavailable"
    else:
        risk_updates = {
            "site_risk_level": site_risks.summary.level,
            "site_risk_summary": site_risks.summary.headline,
            "site_risk_items": [item.model_dump(mode="json") for item in site_risks.items],
            "site_risk_source_meta": [source.model_dump(mode="json") for source in site_risks.sources],
            "site_risk_last_synced_at": synced_at,
        }
        for field_name, next_value in risk_updates.items():
            current_value = getattr(site, field_name)
            if current_value != next_value:
                setattr(site, field_name, next_value)
                changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}
        sources.extend(source.model_dump(mode="json") for source in site_risks.sources)
        status = "partial" if ambiguous else "updated"
        risk_status = "updated"
        last_error_reason = "ambiguous_address" if ambiguous else None

    enrichment_status = {
        "updated": "enriched",
        "partial": "partial",
        "no_match": "no_match",
    }[status]
    enrichment_updates = {
        "location_enrichment_status": enrichment_status,
        "location_enrichment_attempted_at": synced_at,
        "location_enrichment_last_error_reason": last_error_reason,
    }
    for field_name, next_value in enrichment_updates.items():
        current_value = getattr(site, field_name)
        if current_value != next_value:
            setattr(site, field_name, next_value)
            changes[field_name] = {"from": _serialize_value(current_value), "to": _serialize_value(next_value)}

    if changes:
        site.version += 1

    return SiteLocationEnrichmentResult(
        synced_at=synced_at,
        status=status,
        geocoding_status="ambiguous" if ambiguous else "matched",
        risk_status=risk_status,
        notes=notes,
        changes=changes,
        sources=sources,
    )
