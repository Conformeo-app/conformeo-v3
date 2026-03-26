from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

import httpx
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.api.dependencies import get_db_session
from app.api.routes.external import (
    get_address_normalization_service,
    get_company_enrichment_service,
    get_regulatory_watch_service,
    get_site_risk_service,
)
from app.core.config import Settings
from app.core.security import hash_password
from app.db.models import Base, Organization, OrganizationMembership, OrganizationStatus, User, UserStatus
from app.integrations.annuaire_entreprises import AnnuaireEntreprisesProvider
from app.integrations.base import ExternalProviderUnavailableError, ExternalResourceNotFoundError, TTLCache
from app.integrations.geocoding import GeoplateformeGeocodingProvider
from app.integrations.georisques import GeorisquesProvider
from app.integrations.legifrance import LegifranceProvider
from app.main import create_app
from app.schemas.external import (
    CompanyIdentity,
    CompanySearchResponse,
    EstablishmentIdentity,
    ExternalSourceMeta,
    GeocodeSearchResponse,
    GeocodedAddress,
    NormalizedAddress,
    RegulatorySearchResult,
    RegulatoryTextDetail,
    RegulatoryTextSummary,
    SiteRiskDetails,
    SiteRiskItem,
    SiteRiskSummary,
)
from app.services.address_normalization_service import AddressNormalizationService
from app.services.company_enrichment_service import CompanyEnrichmentService
from app.services.regulatory_watch_service import RegulatoryWatchService
from app.services.site_risk_service import SiteRiskService


def build_settings(**overrides: object) -> Settings:
    defaults: dict[str, object] = {
        "auth_token_secret": "test-only-secret-change-me-123456",
        "external_integrations_enabled": True,
        "external_provider_max_retries": 0,
        "external_cache_enabled": False,
        "external_annuaire_entreprises_enabled": True,
        "external_annuaire_entreprises_base_url": "https://annuaire.test",
        "external_annuaire_entreprises_timeout_seconds": 0.2,
        "external_geoplateforme_enabled": True,
        "external_geoplateforme_base_url": "https://geocode.test",
        "external_geoplateforme_timeout_seconds": 0.2,
        "external_legifrance_enabled": True,
        "external_legifrance_base_url": "https://legifrance.test",
        "external_legifrance_token_url": "https://oauth.legifrance.test/token",
        "external_legifrance_client_id": "client-id",
        "external_legifrance_client_secret": "client-secret",
        "external_legifrance_timeout_seconds": 0.2,
        "external_georisques_enabled": True,
        "external_georisques_base_url": "https://georisques.test",
        "external_georisques_api_token": "token-value",
        "external_georisques_timeout_seconds": 0.2,
    }
    defaults.update(overrides)
    return Settings(**defaults)


def build_source_meta(source: str = "tests") -> ExternalSourceMeta:
    return ExternalSourceMeta(
        source=source,
        retrieved_at=datetime.now(timezone.utc),
        freshness="live",
        status="ok",
    )


ANNNUAIRE_PAYLOAD = {
    "results": [
        {
            "siren": "123456789",
            "nom_complet": "ACME Travaux",
            "nom_raison_sociale": "ACME Travaux SAS",
            "activite_principale": "43.99C",
            "categorie_entreprise": "PME",
            "etat_administratif": "A",
            "date_creation": "2015-01-02",
            "tranche_effectif_salarie": "11",
            "nombre_etablissements": 2,
            "nombre_etablissements_ouverts": 2,
            "siege": {
                "siret": "12345678900010",
                "est_siege": True,
                "etat_administratif": "A",
                "adresse": "12 RUE DES LILAS 69003 LYON",
                "code_postal": "69003",
                "libelle_commune": "LYON 3E ARRONDISSEMENT",
                "commune": "69383",
                "latitude": "45.7600",
                "longitude": "4.8600",
                "liste_enseignes": ["ACME Travaux"],
                "nom_commercial": "ACME Travaux",
                "activite_principale": "43.99C",
                "date_creation": "2015-01-02",
            },
            "matching_etablissements": [
                {
                    "siret": "12345678900028",
                    "est_siege": False,
                    "etat_administratif": "A",
                    "adresse": "4 AVENUE DES ALPES 38000 GRENOBLE",
                    "code_postal": "38000",
                    "libelle_commune": "GRENOBLE",
                    "commune": "38185",
                    "latitude": "45.1885",
                    "longitude": "5.7245",
                    "nom_commercial": "ACME Grenoble",
                    "liste_enseignes": ["ACME Grenoble"],
                    "activite_principale": "43.99C",
                    "date_creation": "2018-04-02",
                }
            ],
        }
    ],
    "total_results": 1,
}

GEOCODING_PAYLOAD = {
    "features": [
        {
            "geometry": {"type": "Point", "coordinates": [4.8600, 45.7600]},
            "properties": {
                "label": "12 Rue des Lilas 69003 Lyon",
                "postcode": "69003",
                "city": "Lyon",
                "citycode": "69383",
                "street": "Rue des Lilas",
                "housenumber": "12",
                "score": 0.91,
                "type": "housenumber",
            },
        }
    ]
}

LEGIFRANCE_SEARCH_PAYLOAD = {
    "totalResultNumber": 1,
    "results": [
        {
            "nature": "CODE",
            "etat": "VIGUEUR",
            "datePublication": "2024-01-12T09:30:00.000+0000",
            "resumePrincipal": ["Obligations générales de prévention."],
            "titles": [
                {
                    "id": "LEGITEXT000006072050",
                    "cid": "LEGITEXT000006072050",
                    "title": "Code du travail",
                    "nature": "CODE",
                    "legalStatus": "VIGUEUR",
                    "startDate": "2024-01-12T09:30:00.000+0000",
                }
            ],
        }
    ],
}

GEORISQUES_RESPONSES = {
    "/api/v2/gaspar/risques": {"content": [{"libelle": "Inondation"}], "totalElements": 1},
    "/api/v2/zonage_sismique": {"content": [{"zoneSismicite": "2"}]},
    "/api/v2/radon": {"content": [{"classePotentiel": "2"}]},
    "/api/v2/rga": {"content": [{"exposition": "Moyenne"}]},
    "/api/v2/ssp": {
        "casias": {"totalElements": 1},
        "instructions": {"totalElements": 0},
        "conclusionsSis": {"totalElements": 1},
        "conclusionsSup": {"totalElements": 0},
    },
}


class ExternalProviderMappingsTest(unittest.TestCase):
    def test_annuaire_provider_maps_company_and_establishment(self) -> None:
        settings = build_settings()

        def handler(request: httpx.Request) -> httpx.Response:
            self.assertEqual(request.url.path, "/search")
            return httpx.Response(200, json=ANNNUAIRE_PAYLOAD)

        provider = AnnuaireEntreprisesProvider(
            settings,
            cache=TTLCache(enabled=False),
            transport=httpx.MockTransport(handler),
        )

        company = provider.get_company("123456789")
        establishment = provider.get_establishment("12345678900028")

        self.assertEqual(company.name, "ACME Travaux")
        self.assertEqual(company.headquarters_siret, "12345678900010")
        self.assertEqual(company.registered_address.postal_code, "69003")
        self.assertEqual(establishment.siret, "12345678900028")
        self.assertEqual(establishment.trade_name, "ACME Grenoble")
        self.assertAlmostEqual(establishment.latitude or 0.0, 45.1885)

    def test_geocoding_provider_handles_empty_results(self) -> None:
        settings = build_settings()
        provider = GeoplateformeGeocodingProvider(
            settings,
            cache=TTLCache(enabled=False),
            transport=httpx.MockTransport(lambda request: httpx.Response(200, json={"features": []})),
        )

        result = provider.search("Adresse introuvable", limit=5)

        self.assertEqual(result.total_results, 0)
        self.assertEqual(result.results, [])

    def test_legifrance_provider_maps_search_results(self) -> None:
        settings = build_settings()

        def handler(request: httpx.Request) -> httpx.Response:
            if request.url.host == "oauth.legifrance.test":
                return httpx.Response(200, json={"access_token": "oauth-token", "expires_in": 3600})
            self.assertEqual(request.url.path, "/dila/legifrance/lf-engine-app/search")
            return httpx.Response(200, json=LEGIFRANCE_SEARCH_PAYLOAD)

        provider = LegifranceProvider(
            settings,
            cache=TTLCache(enabled=False),
            transport=httpx.MockTransport(handler),
        )

        result = provider.search("prévention", limit=5)

        self.assertEqual(result.total_results, 1)
        self.assertEqual(result.results[0].id, "LEGITEXT000006072050")
        self.assertEqual(result.results[0].title, "Code du travail")
        self.assertEqual(result.results[0].status, "VIGUEUR")

    def test_legifrance_provider_converts_timeout_into_unavailable_error(self) -> None:
        settings = build_settings()

        def handler(request: httpx.Request) -> httpx.Response:
            raise httpx.ReadTimeout("timeout")

        provider = LegifranceProvider(
            settings,
            cache=TTLCache(enabled=False),
            transport=httpx.MockTransport(handler),
        )

        with self.assertRaises(ExternalProviderUnavailableError):
            provider.search("prévention", limit=5)

    def test_georisques_provider_builds_summary(self) -> None:
        settings = build_settings()

        def handler(request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, json=GEORISQUES_RESPONSES[request.url.path])

        provider = GeorisquesProvider(
            settings,
            cache=TTLCache(enabled=False),
            transport=httpx.MockTransport(handler),
        )

        result = provider.get_site_risks(latitude=45.76, longitude=4.86)

        self.assertEqual(result.summary.level, "warning")
        self.assertEqual(len(result.items), 5)
        gaspar_item = next(item for item in result.items if item.code == "gaspar")
        self.assertEqual(gaspar_item.count, 1)

    def test_external_models_validate_expected_payloads(self) -> None:
        meta = build_source_meta("annuaire_entreprises")
        company = CompanyIdentity(
            siren="123456789",
            name="ACME",
            registered_address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
            source_meta=meta,
        )
        geocoded = GeocodedAddress(
            label="12 rue des Lilas 69003 Lyon",
            latitude=45.76,
            longitude=4.86,
            address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
            source_meta=meta,
        )

        self.assertEqual(company.siren, "123456789")
        self.assertEqual(geocoded.address.label, "12 rue des Lilas 69003 Lyon")


class ExternalRoutesApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite+pysqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
        cls.SessionLocal = sessionmaker(
            bind=cls.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    def setUp(self) -> None:
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self._seed_data()
        self.app = create_app()

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        self.app.dependency_overrides[get_db_session] = override_db
        self.app.dependency_overrides[get_company_enrichment_service] = self._build_company_service
        self.app.dependency_overrides[get_address_normalization_service] = self._build_geocode_service
        self.app.dependency_overrides[get_regulatory_watch_service] = self._build_regulation_service
        self.app.dependency_overrides[get_site_risk_service] = self._build_site_risk_service
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()

    def _seed_data(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000000701"),
                name="Conformeo External",
                slug="conformeo-external",
                legal_name="Conformeo External SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            user = User(
                id=UUID("00000000-0000-0000-0000-000000000702"),
                email="external@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Luc",
                last_name="Ops",
                display_name="Luc Ops",
                status=UserStatus.ACTIVE,
            )
            session.add_all([organization, user])
            session.flush()
            session.add(
                OrganizationMembership(
                    user_id=user.id,
                    organization_id=organization.id,
                    role_code="owner",
                    is_default=True,
                )
            )
            session.commit()
        finally:
            session.close()

    def _login(self) -> str:
        response = self.client.post(
            "/auth/login",
            json={"email": "external@conformeo.local", "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def _build_company_service(self) -> CompanyEnrichmentService:
        meta = build_source_meta("annuaire_entreprises")

        class FakeCompanyService:
            def search_companies(self, query: str, *, limit: int = 10) -> CompanySearchResponse:
                return CompanySearchResponse(
                    query=query,
                    total_results=1,
                    results=[
                        CompanyIdentity(
                            siren="123456789",
                            name="ACME Travaux",
                            legal_name="ACME Travaux SAS",
                            registered_address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
                            source_meta=meta,
                        )
                    ],
                    source_meta=meta,
                )

            def get_company(self, siren: str) -> CompanyIdentity:
                return CompanyIdentity(
                    siren=siren,
                    name="ACME Travaux",
                    legal_name="ACME Travaux SAS",
                    registered_address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
                    source_meta=meta,
                )

            def get_establishment(self, siret: str) -> EstablishmentIdentity:
                return EstablishmentIdentity(
                    siret=siret,
                    siren="123456789",
                    name="ACME Travaux Grenoble",
                    address=NormalizedAddress(label="4 avenue des Alpes 38000 Grenoble"),
                    source_meta=meta,
                )

        return FakeCompanyService()  # type: ignore[return-value]

    def _build_geocode_service(self) -> AddressNormalizationService:
        meta = build_source_meta("geoplateforme_geocodage")
        geocoded = GeocodedAddress(
            label="12 rue des Lilas 69003 Lyon",
            latitude=45.76,
            longitude=4.86,
            address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon", postal_code="69003", city="Lyon"),
            source_meta=meta,
        )

        class FakeGeocodeService:
            def search(self, query: str, *, limit: int = 5) -> GeocodeSearchResponse:
                return GeocodeSearchResponse(query=query, total_results=1, results=[geocoded], source_meta=meta)

            def reverse(self, *, latitude: float, longitude: float, limit: int = 3) -> GeocodeSearchResponse:
                return GeocodeSearchResponse(query=None, total_results=1, results=[geocoded], source_meta=meta)

        return FakeGeocodeService()  # type: ignore[return-value]

    def _build_regulation_service(self) -> RegulatoryWatchService:
        meta = build_source_meta("legifrance")

        class FakeRegulationService:
            def search(self, query: str, *, limit: int = 10) -> RegulatorySearchResult:
                return RegulatorySearchResult(
                    query=query,
                    total_results=1,
                    results=[
                        RegulatoryTextSummary(
                            id="LEGITEXT000006072050",
                            title="Code du travail",
                            nature="CODE",
                            status="VIGUEUR",
                            source_meta=meta,
                        )
                    ],
                    source_meta=meta,
                )

            def get_text(self, document_id: str) -> RegulatoryTextDetail:
                if document_id == "missing":
                    raise ExternalResourceNotFoundError("legifrance", "Texte réglementaire introuvable.")
                summary = RegulatoryTextSummary(
                    id=document_id,
                    title="Code du travail",
                    nature="CODE",
                    status="VIGUEUR",
                    source_meta=meta,
                )
                return RegulatoryTextDetail(summary=summary, content_preview="Prévention générale.", article_count=4, source_meta=meta)

        return FakeRegulationService()  # type: ignore[return-value]

    def _build_site_risk_service(self) -> SiteRiskService:
        meta = build_source_meta("georisques")
        geocode_meta = build_source_meta("geoplateforme_geocodage")

        class FakeSiteRiskService:
            def get_by_address(self, address: str) -> SiteRiskDetails:
                return SiteRiskDetails(
                    address_query=address,
                    normalized_address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
                    geocoded_address=GeocodedAddress(
                        label="12 rue des Lilas 69003 Lyon",
                        latitude=45.76,
                        longitude=4.86,
                        address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
                        source_meta=geocode_meta,
                    ),
                    latitude=45.76,
                    longitude=4.86,
                    summary=SiteRiskSummary(headline="Le site demande une vérification réglementaire ciblée.", level="warning"),
                    items=[SiteRiskItem(code="radon", label="Radon", level="warning", summary="Potentiel radon classé 2.")],
                    sources=[geocode_meta, meta],
                )

            def get_by_coordinates(self, *, latitude: float, longitude: float) -> SiteRiskDetails:
                return SiteRiskDetails(
                    latitude=latitude,
                    longitude=longitude,
                    summary=SiteRiskSummary(headline="Aucun signal critique n'a été remonté pour ce site.", level="success"),
                    items=[],
                    sources=[meta],
                )

        return FakeSiteRiskService()  # type: ignore[return-value]

    def test_external_company_search_endpoint_returns_clean_payload(self) -> None:
        token = self._login()

        response = self.client.get(
            "/api/external/company/search?q=acme",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["query"], "acme")
        self.assertEqual(payload["results"][0]["siren"], "123456789")
        self.assertIn("source_meta", payload)

    def test_external_regulation_detail_endpoint_translates_not_found(self) -> None:
        token = self._login()

        response = self.client.get(
            "/api/external/regulation/missing",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 404, response.text)
        self.assertEqual(response.json()["detail"], "Texte réglementaire introuvable.")

    def test_external_site_risk_endpoint_is_rendered_near_clean_models(self) -> None:
        token = self._login()

        response = self.client.get(
            "/api/external/site-risks",
            params={"address": "12 rue des Lilas 69003 Lyon"},
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["summary"]["level"], "warning")
        self.assertEqual(payload["items"][0]["code"], "radon")
        self.assertEqual(payload["sources"][0]["source"], "geoplateforme_geocodage")

    def test_external_routes_require_authentication(self) -> None:
        response = self.client.get("/api/external/company/search?q=acme")
        self.assertEqual(response.status_code, 401, response.text)


if __name__ == "__main__":
    unittest.main()
