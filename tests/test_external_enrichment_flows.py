from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path
from uuid import UUID

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
from app.api.external_dependencies import (
    get_organization_registry_sync_service,
    get_site_location_enrichment_service,
)
from app.core.external_enrichment import apply_company_registry_enrichment, apply_site_location_enrichment
from app.core.security import hash_password
from app.db.models import (
    Base,
    Organization,
    OrganizationMembership,
    OrganizationSite,
    OrganizationSiteStatus,
    OrganizationSiteType,
    OrganizationStatus,
    User,
    UserStatus,
)
from app.integrations.base import (
    ExternalProviderResponseError,
    ExternalProviderUnavailableError,
    ExternalResourceNotFoundError,
)
from app.main import create_app
from app.schemas.external import (
    CompanyIdentity,
    EstablishmentIdentity,
    ExternalSourceMeta,
    GeocodedAddress,
    NormalizedAddress,
    SiteRiskDetails,
    SiteRiskItem,
    SiteRiskSummary,
)


def build_source_meta(source: str) -> ExternalSourceMeta:
    from datetime import datetime, timezone

    return ExternalSourceMeta(
        source=source,
        retrieved_at=datetime.now(timezone.utc),
        freshness="live",
        status="ok",
    )


class ExternalEnrichmentFlowsTest(unittest.TestCase):
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
        self.site_enrichment_calls: list[str] = []
        self.app = create_app()

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        self.app.dependency_overrides[get_db_session] = override_db
        self.app.dependency_overrides[get_organization_registry_sync_service] = self._build_org_registry_service
        self.app.dependency_overrides[get_site_location_enrichment_service] = self._build_site_location_service
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()

    def _seed_data(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000000901"),
                name="Conformeo Locale",
                slug="conformeo-locale",
                legal_name=None,
                headquarters_address=None,
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            user = User(
                id=UUID("00000000-0000-0000-0000-000000000902"),
                email="owner.enrichment@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Nina",
                last_name="Owner",
                display_name="Nina Owner",
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
            json={"email": "owner.enrichment@conformeo.local", "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def _build_org_registry_service(self):
        annuaire_meta = build_source_meta("annuaire_entreprises")
        geocode_meta = build_source_meta("geoplateforme_geocodage")

        class FakeOrganizationRegistryService:
            def enrich_organization(self, organization: Organization, *, siren: str | None = None, siret: str | None = None):
                if siren == "000000000" or siret == "00000000000000":
                    raise ExternalResourceNotFoundError("annuaire_entreprises", "Entreprise introuvable dans l'annuaire.")

                company = CompanyIdentity(
                    siren=siren or "123456789",
                    name="ACME Travaux",
                    legal_name="ACME Travaux SAS",
                    activity_code="43.99C",
                    status="active",
                    headquarters_siret="12345678900010",
                    registered_address=NormalizedAddress(
                        label="12 rue des Lilas 69003 Lyon",
                        postal_code="69003",
                        city="Lyon",
                    ),
                    source_meta=annuaire_meta,
                )
                establishment = EstablishmentIdentity(
                    siret=siret or "12345678900010",
                    siren=company.siren,
                    name="ACME Travaux",
                    is_headquarters=True,
                    address=NormalizedAddress(label="12 rue des Lilas 69003 Lyon"),
                    source_meta=geocode_meta,
                )
                return apply_company_registry_enrichment(
                    organization,
                    company,
                    establishment=establishment,
                )

        return FakeOrganizationRegistryService()

    def _build_site_location_service(self):
        geocode_meta = build_source_meta("geoplateforme_geocodage")
        georisques_meta = build_source_meta("georisques")
        test_case = self

        class FakeSiteLocationService:
            def enrich_site(self, site: OrganizationSite):
                lowered = site.address.lower()
                test_case.site_enrichment_calls.append(lowered)

                if "provider down" in lowered:
                    raise ExternalProviderUnavailableError(
                        "geoplateforme_geocodage",
                        "Le service de géocodage est temporairement indisponible.",
                    )
                if "payload invalide" in lowered:
                    raise ExternalProviderResponseError(
                        "geoplateforme_geocodage",
                        "Le fournisseur a renvoyé une charge invalide.",
                    )
                if "introuvable" in lowered:
                    return apply_site_location_enrichment(site, None, None)

                geocoded = GeocodedAddress(
                    label="12 rue des Lilas 69003 Lyon",
                    latitude=45.76,
                    longitude=4.86,
                    score=0.92,
                    address=NormalizedAddress(
                        label="12 rue des Lilas 69003 Lyon",
                        postal_code="69003",
                        city="Lyon",
                    ),
                    source_meta=geocode_meta,
                )

                if "sans risques" in lowered:
                    return apply_site_location_enrichment(site, geocoded, None)

                details = SiteRiskDetails(
                    normalized_address=geocoded.address,
                    geocoded_address=geocoded,
                    latitude=geocoded.latitude,
                    longitude=geocoded.longitude,
                    summary=SiteRiskSummary(
                        headline="Le site demande une vérification réglementaire ciblée.",
                        level="warning",
                    ),
                    items=[
                        SiteRiskItem(
                            code="radon",
                            label="Radon",
                            level="warning",
                            summary="Potentiel radon classé 2.",
                        )
                    ],
                    sources=[georisques_meta],
                )
                ambiguous = "ambigu" in lowered
                return apply_site_location_enrichment(site, geocoded, details, ambiguous=ambiguous)

        return FakeSiteLocationService()

    def _create_site(self, token: str, *, address: str = "12 rue des Lilas 69003 Lyon") -> dict[str, object]:
        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000901/sites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Atelier",
                "address": address,
                "site_type": "site",
            },
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def _read_site_from_db(self, site_id: str) -> OrganizationSite:
        session = self.SessionLocal()
        try:
            site = session.get(OrganizationSite, UUID(site_id))
            assert site is not None
            session.expunge(site)
            return site
        finally:
            session.close()

    def test_organization_enrichment_from_siren_updates_registry_and_preserves_manual_name(self) -> None:
        token = self._login()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000901/enrich-from-company-registry",
            headers={"Authorization": f"Bearer {token}"},
            json={"siren": "123456789"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["organization"]["registry_siren"], "123456789")
        self.assertEqual(payload["organization"]["registry_company_name"], "ACME Travaux SAS")
        self.assertEqual(payload["organization"]["legal_name"], "ACME Travaux SAS")
        self.assertEqual(payload["organization"]["headquarters_address"], "12 rue des Lilas 69003 Lyon")
        self.assertEqual(payload["organization"]["name"], "Conformeo Locale")

        name_result = next(item for item in payload["field_results"] if item["field"] == "name")
        self.assertEqual(name_result["action"], "kept_existing")
        self.assertEqual(name_result["reason"], "protected_existing_value")

    def test_organization_enrichment_from_siret_resolves_company(self) -> None:
        token = self._login()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000901/enrich-from-company-registry",
            headers={"Authorization": f"Bearer {token}"},
            json={"siret": "12345678900028"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["organization"]["registry_headquarters_siret"], "12345678900010")
        self.assertEqual(payload["establishment"]["siret"], "12345678900028")

    def test_organization_enrichment_returns_404_when_company_is_missing(self) -> None:
        token = self._login()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000901/enrich-from-company-registry",
            headers={"Authorization": f"Bearer {token}"},
            json={"siren": "000000000"},
        )

        self.assertEqual(response.status_code, 404, response.text)
        self.assertEqual(response.json()["detail"], "Entreprise introuvable dans l'annuaire.")

    def test_create_site_auto_enriches_location_when_matching_address_is_found(self) -> None:
        token = self._login()

        payload = self._create_site(token)

        self.assertEqual(payload["location_enrichment_status"], "enriched")
        self.assertIsNotNone(payload["location_enrichment_attempted_at"])
        self.assertIsNone(payload["location_enrichment_last_error_reason"])
        self.assertEqual(payload["normalized_address"], "12 rue des Lilas 69003 Lyon")
        self.assertEqual(payload["site_risk_summary"], "Le site demande une vérification réglementaire ciblée.")
        self.assertEqual(len(self.site_enrichment_calls), 1)

    def test_create_site_keeps_main_flow_on_no_match(self) -> None:
        token = self._login()

        payload = self._create_site(token, address="Adresse introuvable")

        self.assertEqual(payload["location_enrichment_status"], "no_match")
        self.assertIsNotNone(payload["location_enrichment_attempted_at"])
        self.assertEqual(payload["location_enrichment_last_error_reason"], "no_geocode_match")
        self.assertIsNone(payload["normalized_address"])
        self.assertIsNone(payload["site_risk_summary"])
        self.assertEqual(len(self.site_enrichment_calls), 1)

    def test_create_site_keeps_main_flow_on_partial_risk_enrichment(self) -> None:
        token = self._login()

        payload = self._create_site(token, address="12 rue des Lilas 69003 Lyon sans risques")

        self.assertEqual(payload["location_enrichment_status"], "partial")
        self.assertIsNotNone(payload["location_enrichment_attempted_at"])
        self.assertEqual(payload["location_enrichment_last_error_reason"], "risk_provider_unavailable")
        self.assertEqual(payload["normalized_address"], "12 rue des Lilas 69003 Lyon")
        self.assertIsNone(payload["site_risk_summary"])
        self.assertEqual(len(self.site_enrichment_calls), 1)

    def test_create_site_keeps_main_flow_when_provider_is_unavailable(self) -> None:
        token = self._login()

        payload = self._create_site(token, address="12 rue des Lilas 69003 Lyon provider down")

        self.assertEqual(payload["location_enrichment_status"], "failed")
        self.assertIsNotNone(payload["location_enrichment_attempted_at"])
        self.assertEqual(payload["location_enrichment_last_error_reason"], "provider_unavailable")
        self.assertIsNone(payload["normalized_address"])
        self.assertIsNone(payload["site_risk_summary"])
        self.assertEqual(len(self.site_enrichment_calls), 1)

    def test_create_site_sets_failed_reason_when_provider_payload_is_invalid(self) -> None:
        token = self._login()

        payload = self._create_site(token, address="12 rue des Lilas 69003 Lyon payload invalide")

        self.assertEqual(payload["location_enrichment_status"], "failed")
        self.assertIsNotNone(payload["location_enrichment_attempted_at"])
        self.assertEqual(payload["location_enrichment_last_error_reason"], "provider_response_invalid")

    def test_site_location_enrichment_manual_endpoint_persists_normalized_address_and_risk_summary(self) -> None:
        token = self._login()
        site = self._create_site(token)

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}/enrich-location",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "updated")
        self.assertEqual(payload["geocoding_status"], "matched")
        self.assertEqual(payload["risk_status"], "updated")
        self.assertEqual(payload["site"]["normalized_address"], "12 rue des Lilas 69003 Lyon")
        self.assertIsNone(payload["site"]["location_enrichment_last_error_reason"])
        self.assertEqual(payload["site"]["site_risk_summary"], "Le site demande une vérification réglementaire ciblée.")
        self.assertEqual(payload["sources"][0]["source"], "geoplateforme_geocodage")

    def test_site_location_enrichment_returns_partial_when_risks_are_unavailable(self) -> None:
        token = self._login()
        site = self._create_site(token, address="12 rue des Lilas 69003 Lyon sans risques")

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}/enrich-location",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "partial")
        self.assertEqual(payload["risk_status"], "unavailable")
        self.assertIn("synthèse de risques", payload["notes"][0].lower())
        self.assertEqual(payload["site"]["normalized_address"], "12 rue des Lilas 69003 Lyon")
        self.assertEqual(payload["site"]["location_enrichment_last_error_reason"], "risk_provider_unavailable")
        self.assertIsNone(payload["site"]["site_risk_summary"])

    def test_site_location_enrichment_marks_ambiguous_geocoding_as_partial(self) -> None:
        token = self._login()
        site = self._create_site(token, address="12 rue des Lilas 69003 Lyon ambigu")

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}/enrich-location",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "partial")
        self.assertEqual(payload["geocoding_status"], "ambiguous")
        self.assertEqual(payload["risk_status"], "updated")
        self.assertEqual(payload["site"]["location_enrichment_last_error_reason"], "ambiguous_address")
        self.assertIn("meilleure correspondance", payload["notes"][0].lower())

    def test_update_site_without_address_change_does_not_retry_enrichment(self) -> None:
        token = self._login()
        site = self._create_site(token)

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "Atelier renommé"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["name"], "Atelier renommé")
        self.assertEqual(len(self.site_enrichment_calls), 1)

    def test_update_site_with_address_change_retries_auto_enrichment(self) -> None:
        token = self._login()
        site = self._create_site(token)

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"address": "Adresse introuvable"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["address"], "Adresse introuvable")
        self.assertEqual(payload["location_enrichment_status"], "no_match")
        self.assertEqual(payload["location_enrichment_last_error_reason"], "no_geocode_match")
        self.assertIsNone(payload["normalized_address"])
        self.assertIsNone(payload["site_risk_summary"])
        self.assertEqual(len(self.site_enrichment_calls), 2)

    def test_manual_site_enrichment_still_handles_no_match_after_auto_flow(self) -> None:
        token = self._login()
        site = self._create_site(token)

        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"address": "Adresse introuvable"},
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        self.assertIsNone(update_response.json()["normalized_address"])

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}/enrich-location",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "no_match")
        self.assertEqual(payload["geocoding_status"], "not_found")
        self.assertEqual(payload["site"]["location_enrichment_last_error_reason"], "no_geocode_match")
        self.assertIsNone(payload["site"]["normalized_address"])
        self.assertIsNone(payload["site"]["latitude"])

    def test_success_after_previous_failure_clears_last_error_reason(self) -> None:
        token = self._login()
        site = self._create_site(token, address="12 rue des Lilas 69003 Lyon provider down")

        self.assertEqual(site["location_enrichment_last_error_reason"], "provider_unavailable")

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"address": "12 rue des Lilas 69003 Lyon"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["location_enrichment_status"], "enriched")
        self.assertIsNone(payload["location_enrichment_last_error_reason"])

    def test_manual_endpoint_failure_updates_last_error_reason_on_site(self) -> None:
        token = self._login()
        site = self._create_site(token)

        patch_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"address": "12 rue des Lilas 69003 Lyon payload invalide"},
        )
        self.assertEqual(patch_response.status_code, 200, patch_response.text)

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000901/sites/{site['id']}/enrich-location",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 502, response.text)
        site_record = self._read_site_from_db(site["id"])
        self.assertEqual(site_record.location_enrichment_status, "failed")
        self.assertEqual(site_record.location_enrichment_last_error_reason, "provider_response_invalid")
        self.assertIsNotNone(site_record.location_enrichment_attempted_at)


if __name__ == "__main__":
    unittest.main()
