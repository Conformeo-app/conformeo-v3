from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.api.external_dependencies import (
    get_address_normalization_service,
    get_company_enrichment_service,
    get_regulatory_watch_service,
    get_site_risk_service,
)
from app.api.dependencies import get_current_user
from app.integrations.base import (
    ExternalIntegrationError,
    ExternalProviderConfigError,
    ExternalProviderDisabledError,
    ExternalProviderResponseError,
    ExternalProviderUnavailableError,
    ExternalResourceNotFoundError,
)
from app.schemas.external import (
    CompanyIdentity,
    CompanySearchResponse,
    EstablishmentIdentity,
    GeocodeSearchResponse,
    RegulatorySearchResult,
    RegulatoryTextDetail,
    SiteRiskDetails,
)
from app.services import AddressNormalizationService, CompanyEnrichmentService, RegulatoryWatchService, SiteRiskService


router = APIRouter(
    prefix="/api/external",
    tags=["external"],
    dependencies=[Depends(get_current_user)],
)

def _raise_http_from_external_error(exc: ExternalIntegrationError) -> None:
    if isinstance(exc, ExternalResourceNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=exc.detail) from exc
    if isinstance(exc, (ExternalProviderDisabledError, ExternalProviderConfigError, ExternalProviderUnavailableError)):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=exc.detail) from exc
    if isinstance(exc, ExternalProviderResponseError):
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=exc.detail) from exc
    raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Erreur d'intégration externe.") from exc


@router.get("/company/search", response_model=CompanySearchResponse)
def search_companies(
    q: str = Query(min_length=2),
    limit: int = Query(default=10, ge=1, le=25),
    service: CompanyEnrichmentService = Depends(get_company_enrichment_service),
) -> CompanySearchResponse:
    try:
        return service.search_companies(q, limit=limit)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/company/{siren}", response_model=CompanyIdentity)
def get_company(
    siren: str = Path(pattern=r"^\d{9}$"),
    service: CompanyEnrichmentService = Depends(get_company_enrichment_service),
) -> CompanyIdentity:
    try:
        return service.get_company(siren)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/establishment/{siret}", response_model=EstablishmentIdentity)
def get_establishment(
    siret: str = Path(pattern=r"^\d{14}$"),
    service: CompanyEnrichmentService = Depends(get_company_enrichment_service),
) -> EstablishmentIdentity:
    try:
        return service.get_establishment(siret)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/geocode/search", response_model=GeocodeSearchResponse)
def geocode_search(
    q: str = Query(min_length=3),
    limit: int = Query(default=5, ge=1, le=20),
    service: AddressNormalizationService = Depends(get_address_normalization_service),
) -> GeocodeSearchResponse:
    try:
        return service.search(q, limit=limit)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/geocode/reverse", response_model=GeocodeSearchResponse)
def geocode_reverse(
    lat: float = Query(),
    lon: float = Query(),
    limit: int = Query(default=3, ge=1, le=20),
    service: AddressNormalizationService = Depends(get_address_normalization_service),
) -> GeocodeSearchResponse:
    try:
        return service.reverse(latitude=lat, longitude=lon, limit=limit)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/regulation/search", response_model=RegulatorySearchResult)
def search_regulation(
    q: str = Query(min_length=2),
    limit: int = Query(default=10, ge=1, le=20),
    service: RegulatoryWatchService = Depends(get_regulatory_watch_service),
) -> RegulatorySearchResult:
    try:
        return service.search(q, limit=limit)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/regulation/{document_id}", response_model=RegulatoryTextDetail)
def get_regulation(
    document_id: str,
    service: RegulatoryWatchService = Depends(get_regulatory_watch_service),
) -> RegulatoryTextDetail:
    try:
        return service.get_text(document_id)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/site-risks", response_model=SiteRiskDetails)
def get_site_risks(
    address: str = Query(min_length=5),
    service: SiteRiskService = Depends(get_site_risk_service),
) -> SiteRiskDetails:
    try:
        return service.get_by_address(address)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)


@router.get("/site-risks/geocode", response_model=SiteRiskDetails)
def get_site_risks_from_coordinates(
    lat: float = Query(),
    lon: float = Query(),
    service: SiteRiskService = Depends(get_site_risk_service),
) -> SiteRiskDetails:
    try:
        return service.get_by_coordinates(latitude=lat, longitude=lon)
    except ExternalIntegrationError as exc:
        _raise_http_from_external_error(exc)
