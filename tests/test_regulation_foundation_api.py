from __future__ import annotations

import os
import sys
import unittest
from datetime import date, timedelta
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
from app.core.security import hash_password
from app.db.models import Base, Organization, OrganizationMembership, OrganizationStatus, User, UserStatus
from app.main import create_app


class RegulationFoundationApiTest(unittest.TestCase):
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
        self.seed_data()
        self.app = create_app()

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        self.app.dependency_overrides[get_db_session] = override_db
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()

    def seed_data(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000000401"),
                name="Conformeo Reglementation",
                slug="conformeo-reglementation",
                legal_name="Conformeo Reglementation SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000000402"),
                email="owner.reglementation@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Alice",
                last_name="Owner",
                display_name="Alice Owner",
                status=UserStatus.ACTIVE,
            )
            member = User(
                id=UUID("00000000-0000-0000-0000-000000000403"),
                email="member.reglementation@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Marc",
                last_name="Member",
                display_name="Marc Member",
                status=UserStatus.ACTIVE,
            )

            session.add_all([organization, owner, member])
            session.flush()
            session.add_all(
                [
                    OrganizationMembership(
                        user_id=owner.id,
                        organization_id=organization.id,
                        role_code="owner",
                        is_default=True,
                    ),
                    OrganizationMembership(
                        user_id=member.id,
                        organization_id=organization.id,
                        role_code="member",
                        is_default=True,
                    ),
                ]
            )
            session.commit()
        finally:
            session.close()

    def login(self, email: str) -> str:
        response = self.client.post(
            "/auth/login",
            json={"email": email, "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def test_owner_can_complete_profile_onboarding(self) -> None:
        token = self.login("owner.reglementation@conformeo.local")

        response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Conformeo Reglementation",
                "legal_name": "Conformeo Reglementation SAS",
                "activity_label": "maintenance multitechnique",
                "employee_count": 12,
                "has_employees": True,
                "contact_email": "contact@conformeo.fr",
                "contact_phone": "0478000000",
                "headquarters_address": "12 rue des Tuileries, 69002 Lyon",
                "notes": "Structure initiale pour Sprint 2",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["activity_label"], "maintenance multitechnique")
        self.assertEqual(payload["employee_count"], 12)
        self.assertTrue(payload["has_employees"])
        self.assertEqual(payload["contact_email"], "contact@conformeo.fr")
        self.assertIsNotNone(payload["onboarding_completed_at"])

    def test_questionnaire_answers_are_persisted_and_refine_regulatory_profile(self) -> None:
        token = self.login("owner.reglementation@conformeo.local")

        profile_response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Conformeo Reglementation",
                "legal_name": "Conformeo Reglementation SAS",
                "activity_label": "maintenance multitechnique",
                "employee_count": 14,
                "has_employees": True,
                "receives_public": True,
                "stores_hazardous_products": True,
                "performs_high_risk_work": True,
                "contact_email": "contact@conformeo.fr",
                "contact_phone": "0478000000",
                "headquarters_address": "12 rue des Tuileries, 69002 Lyon",
            },
        )
        self.assertEqual(profile_response.status_code, 200, profile_response.text)
        profile_payload = profile_response.json()
        self.assertTrue(profile_payload["receives_public"])
        self.assertTrue(profile_payload["stores_hazardous_products"])
        self.assertTrue(profile_payload["performs_high_risk_work"])

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Atelier central",
                "address": "3 rue du Progres, 69003 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)

        regulatory_profile_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(regulatory_profile_response.status_code, 200, regulatory_profile_response.text)
        regulatory_profile_payload = regulatory_profile_response.json()

        criteria = {
            criterion["code"]: criterion["value"] for criterion in regulatory_profile_payload["criteria"]
        }
        self.assertTrue(criteria["receives_public"])
        self.assertTrue(criteria["stores_hazardous_products"])
        self.assertTrue(criteria["performs_high_risk_work"])

        obligations = {
            obligation["id"]: obligation for obligation in regulatory_profile_payload["applicable_obligations"]
        }
        self.assertEqual(obligations["reg-sites-emergency-contacts"]["status"], "to_verify")
        self.assertEqual(obligations["reg-employees-safety-organization"]["status"], "to_verify")
        self.assertEqual(obligations["reg-warehouse-storage-rules"]["status"], "to_verify")

    def test_owner_can_create_and_archive_site(self) -> None:
        token = self.login("owner.reglementation@conformeo.local")

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Siège Lyon Carnot",
                "address": "12 rue Carnot, 69002 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(create_response.status_code, 200, create_response.text)
        site_payload = create_response.json()
        self.assertEqual(site_payload["status"], "active")
        self.assertEqual(site_payload["site_type"], "building")

        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000401/sites/{site_payload['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "archived"},
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        self.assertEqual(update_response.json()["status"], "archived")

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        self.assertEqual(len(list_response.json()), 1)

    def test_member_can_read_profile_but_cannot_mutate_it(self) -> None:
        token = self.login("member.reglementation@conformeo.local")

        read_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(read_response.status_code, 200, read_response.text)

        update_response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Conformeo Reglementation",
                "activity_label": "maintenance",
                "has_employees": False,
                "contact_email": "contact@conformeo.fr",
            },
        )
        self.assertEqual(update_response.status_code, 403, update_response.text)

    def test_regulatory_profile_reports_missing_items_when_profile_is_incomplete(self) -> None:
        token = self.login("owner.reglementation@conformeo.local")

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-profile",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["profile_status"], "to_complete")
        self.assertIn("activité principale", payload["missing_profile_items"])
        self.assertIn("présence de salariés", payload["missing_profile_items"])
        self.assertIn("email de contact", payload["missing_profile_items"])
        self.assertEqual(payload["applicable_obligations"], [])

    def test_regulatory_profile_lists_applicable_obligations(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")
        member_token = self.login("member.reglementation@conformeo.local")

        profile_response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Conformeo Reglementation",
                "legal_name": "Conformeo Reglementation SAS",
                "activity_label": "maintenance multitechnique",
                "employee_count": 18,
                "has_employees": True,
                "contact_email": "contact@conformeo.fr",
                "contact_phone": "0478000000",
                "headquarters_address": "12 rue des Tuileries, 69002 Lyon",
                "notes": "Bloc obligations V1",
            },
        )
        self.assertEqual(profile_response.status_code, 200, profile_response.text)

        building_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Siège Lyon Carnot",
                "address": "12 rue Carnot, 69002 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(building_response.status_code, 200, building_response.text)

        warehouse_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Entrepôt Est",
                "address": "18 boulevard des Alpes, 69800 Saint-Priest",
                "site_type": "warehouse",
            },
        )
        self.assertEqual(warehouse_response.status_code, 200, warehouse_response.text)

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-profile",
            headers={"Authorization": f"Bearer {member_token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["profile_status"], "ready")
        self.assertEqual(
            payload["missing_profile_items"],
            [
                "accueil du public",
                "stockage de produits ou materiels sensibles",
                "niveau de risque des interventions terrain",
            ],
        )
        self.assertEqual(
            [item["id"] for item in payload["applicable_obligations"]],
            [
                "reg-employees-register",
                "reg-employees-safety-organization",
                "reg-sites-emergency-contacts",
                "reg-buildings-periodic-checks",
                "reg-warehouse-storage-rules",
            ],
        )
        self.assertEqual(
            payload["applicable_obligations"][0]["reason_summary"],
            "Applicable car des salaries sont declares dans le profil entreprise.",
        )

    def test_owner_can_create_building_safety_items_and_member_can_read_alerts(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")
        member_token = self.login("member.reglementation@conformeo.local")

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Bâtiment principal",
                "address": "12 rue Carnot, 69002 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        today = date.today()
        overdue_date = (today - timedelta(days=5)).isoformat()
        due_soon_date = (today + timedelta(days=12)).isoformat()
        ok_date = (today + timedelta(days=90)).isoformat()

        for payload in (
            {
                "site_id": site_id,
                "item_type": "fire_extinguisher",
                "name": "Extincteur accueil",
                "next_due_date": due_soon_date,
                "last_checked_at": today.isoformat(),
            },
            {
                "site_id": site_id,
                "item_type": "dae",
                "name": "DAE étage 1",
                "next_due_date": overdue_date,
            },
            {
                "site_id": site_id,
                "item_type": "periodic_check",
                "name": "Contrôle éclairage secours",
                "next_due_date": ok_date,
            },
        ):
            response = self.client.post(
                "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
                headers={"Authorization": f"Bearer {owner_token}"},
                json=payload,
            )
            self.assertEqual(response.status_code, 200, response.text)

        items_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(items_response.status_code, 200, items_response.text)
        items_payload = items_response.json()
        self.assertEqual(len(items_payload), 3)
        self.assertEqual(items_payload[0]["site_name"], "Bâtiment principal")
        self.assertEqual(
            sorted(item["alert_status"] for item in items_payload),
            ["due_soon", "ok", "overdue"],
        )

        alerts_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000401/building-safety-alerts?site_id={site_id}",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(alerts_response.status_code, 200, alerts_response.text)
        alerts_payload = alerts_response.json()
        self.assertEqual(len(alerts_payload), 2)
        self.assertEqual(alerts_payload[0]["alert_type"], "overdue")
        self.assertEqual(alerts_payload[1]["alert_type"], "due_soon")

    def test_owner_can_archive_building_safety_item(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Entrepôt Nord",
                "address": "5 avenue industrielle, 69740 Genas",
                "site_type": "warehouse",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        item_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "item_type": "dae",
                "name": "DAE entrepôt",
                "next_due_date": (date.today() + timedelta(days=40)).isoformat(),
            },
        )
        self.assertEqual(item_response.status_code, 200, item_response.text)
        item_id = item_response.json()["id"]

        archive_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000401/building-safety-items/{item_id}",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"status": "archived"},
        )
        self.assertEqual(archive_response.status_code, 200, archive_response.text)
        self.assertEqual(archive_response.json()["status"], "archived")
        self.assertEqual(archive_response.json()["alert_status"], "archived")

    def test_owner_can_lightly_edit_building_safety_item_dates(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Bâtiment Sud",
                "address": "18 rue de Marseille, 69007 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        overdue_date = (date.today() - timedelta(days=3)).isoformat()
        item_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "item_type": "fire_extinguisher",
                "name": "Extincteur escalier Sud",
                "next_due_date": overdue_date,
            },
        )
        self.assertEqual(item_response.status_code, 200, item_response.text)
        item_payload = item_response.json()
        self.assertEqual(item_payload["alert_status"], "overdue")

        updated_due_date = (date.today() + timedelta(days=120)).isoformat()
        updated_last_checked_at = date.today().isoformat()
        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000401/building-safety-items/{item_payload['id']}",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "next_due_date": updated_due_date,
                "last_checked_at": updated_last_checked_at,
                "notes": "Contrôle annuel replanifié après passage du prestataire.",
            },
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        updated_payload = update_response.json()
        self.assertEqual(updated_payload["next_due_date"], updated_due_date)
        self.assertEqual(updated_payload["last_checked_at"], updated_last_checked_at)
        self.assertEqual(updated_payload["alert_status"], "ok")
        self.assertEqual(
            updated_payload["notes"],
            "Contrôle annuel replanifié après passage du prestataire.",
        )

    def test_owner_can_create_duerp_entry_and_attach_regulatory_evidence(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")
        member_token = self.login("member.reglementation@conformeo.local")

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Atelier principal",
                "address": "3 rue du Progres, 69003 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        duerp_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/duerp-entries",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "work_unit_name": "Maintenance toiture",
                "risk_label": "Chute de hauteur",
                "severity": "high",
                "prevention_action": "Utiliser une ligne de vie et vérifier l'accès avant l'intervention.",
            },
        )
        self.assertEqual(duerp_response.status_code, 200, duerp_response.text)
        duerp_payload = duerp_response.json()
        self.assertEqual(duerp_payload["compliance_status"], "in_progress")
        self.assertEqual(duerp_payload["proof_count"], 0)
        entry_id = duerp_payload["id"]

        list_before_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000401/duerp-entries?site_id={site_id}",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(list_before_response.status_code, 200, list_before_response.text)
        self.assertEqual(len(list_before_response.json()), 1)

        evidence_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-evidences",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "link_kind": "duerp_entry",
                "duerp_entry_id": entry_id,
                "file_name": "consigne-hauteur-2026.pdf",
                "document_type": "consigne",
                "notes": "Support utilise pendant l'accueil securite du chantier.",
            },
        )
        self.assertEqual(evidence_response.status_code, 200, evidence_response.text)
        evidence_payload = evidence_response.json()
        self.assertEqual(evidence_payload["link_kind"], "duerp_entry")
        self.assertEqual(evidence_payload["duerp_entry_id"], entry_id)
        self.assertEqual(evidence_payload["link_label"], "Chute de hauteur")

        list_after_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000401/duerp-entries?site_id={site_id}",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(list_after_response.status_code, 200, list_after_response.text)
        updated_entry = list_after_response.json()[0]
        self.assertEqual(updated_entry["proof_count"], 1)
        self.assertEqual(updated_entry["compliance_status"], "compliant")

        evidences_list_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000401/regulatory-evidences?site_id={site_id}",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(evidences_list_response.status_code, 200, evidences_list_response.text)
        self.assertEqual(len(evidences_list_response.json()), 1)

    def test_regulatory_profile_statuses_reflect_duerp_building_safety_and_evidence(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")

        profile_response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Conformeo Reglementation",
                "legal_name": "Conformeo Reglementation SAS",
                "activity_label": "maintenance multitechnique",
                "employee_count": 18,
                "has_employees": True,
                "contact_email": "contact@conformeo.fr",
                "contact_phone": "0478000000",
                "headquarters_address": "12 rue des Tuileries, 69002 Lyon",
            },
        )
        self.assertEqual(profile_response.status_code, 200, profile_response.text)

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Site central",
                "address": "12 rue Carnot, 69002 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        safety_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "item_type": "fire_extinguisher",
                "name": "Extincteur accueil",
                "next_due_date": (date.today() + timedelta(days=120)).isoformat(),
            },
        )
        self.assertEqual(safety_response.status_code, 200, safety_response.text)
        safety_item_id = safety_response.json()["id"]

        duerp_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/duerp-entries",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "work_unit_name": "Intervention atelier",
                "risk_label": "Heurt avec equipement en mouvement",
                "severity": "medium",
                "prevention_action": "Verifier le balisage et couper l'alimentation avant intervention.",
            },
        )
        self.assertEqual(duerp_response.status_code, 200, duerp_response.text)
        duerp_entry_id = duerp_response.json()["id"]

        profile_before_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-profile",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(profile_before_response.status_code, 200, profile_before_response.text)
        obligations_before = {
            item["id"]: item["status"] for item in profile_before_response.json()["applicable_obligations"]
        }
        self.assertEqual(obligations_before["reg-employees-register"], "in_progress")
        self.assertEqual(obligations_before["reg-employees-safety-organization"], "in_progress")
        self.assertEqual(obligations_before["reg-sites-emergency-contacts"], "to_complete")
        self.assertEqual(obligations_before["reg-buildings-periodic-checks"], "in_progress")

        for payload in (
            {
                "link_kind": "obligation",
                "obligation_id": "reg-employees-register",
                "file_name": "registre-personnel-modele.pdf",
                "document_type": "modele",
            },
            {
                "link_kind": "site",
                "site_id": site_id,
                "file_name": "contacts-urgence-site-central.pdf",
                "document_type": "consigne",
            },
            {
                "link_kind": "building_safety_item",
                "building_safety_item_id": safety_item_id,
                "file_name": "controle-extincteur-2026.pdf",
                "document_type": "attestation",
            },
            {
                "link_kind": "duerp_entry",
                "duerp_entry_id": duerp_entry_id,
                "file_name": "preuve-action-prevention.pdf",
                "document_type": "preuve",
            },
        ):
            response = self.client.post(
                "/organizations/00000000-0000-0000-0000-000000000401/regulatory-evidences",
                headers={"Authorization": f"Bearer {owner_token}"},
                json=payload,
            )
            self.assertEqual(response.status_code, 200, response.text)

        profile_after_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-profile",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(profile_after_response.status_code, 200, profile_after_response.text)
        obligations_after = {
            item["id"]: item["status"] for item in profile_after_response.json()["applicable_obligations"]
        }
        self.assertEqual(obligations_after["reg-employees-register"], "compliant")
        self.assertEqual(obligations_after["reg-employees-safety-organization"], "compliant")
        self.assertEqual(obligations_after["reg-sites-emergency-contacts"], "compliant")
        self.assertEqual(obligations_after["reg-buildings-periodic-checks"], "compliant")

    def test_owner_can_generate_regulatory_pdf_export(self) -> None:
        owner_token = self.login("owner.reglementation@conformeo.local")

        profile_response = self.client.patch(
            "/organizations/00000000-0000-0000-0000-000000000401/profile",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Conformeo Reglementation",
                "legal_name": "Conformeo Reglementation SAS",
                "activity_label": "maintenance multitechnique",
                "employee_count": 18,
                "has_employees": True,
                "contact_email": "contact@conformeo.fr",
                "contact_phone": "0478000000",
                "headquarters_address": "12 rue des Tuileries, 69002 Lyon",
            },
        )
        self.assertEqual(profile_response.status_code, 200, profile_response.text)

        site_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/sites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Site central",
                "address": "12 rue Carnot, 69002 Lyon",
                "site_type": "building",
            },
        )
        self.assertEqual(site_response.status_code, 200, site_response.text)
        site_id = site_response.json()["id"]

        safety_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/building-safety-items",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "item_type": "fire_extinguisher",
                "name": "Extincteur accueil",
                "next_due_date": (date.today() + timedelta(days=45)).isoformat(),
            },
        )
        self.assertEqual(safety_response.status_code, 200, safety_response.text)

        duerp_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/duerp-entries",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "site_id": site_id,
                "work_unit_name": "Intervention atelier",
                "risk_label": "Chute de hauteur",
                "severity": "high",
                "prevention_action": "Utiliser une ligne de vie et vérifier l'accès avant intervention.",
            },
        )
        self.assertEqual(duerp_response.status_code, 200, duerp_response.text)
        duerp_entry_id = duerp_response.json()["id"]

        evidence_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-evidences",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "link_kind": "duerp_entry",
                "duerp_entry_id": duerp_entry_id,
                "file_name": "preuve-hauteur-2026.pdf",
                "document_type": "preuve",
            },
        )
        self.assertEqual(evidence_response.status_code, 200, evidence_response.text)

        export_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000401/regulatory-export.pdf",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(export_response.status_code, 200, export_response.text)
        self.assertTrue(export_response.headers["content-type"].startswith("application/pdf"))
        self.assertIn("attachment;", export_response.headers["content-disposition"])
        self.assertTrue(export_response.content.startswith(b"%PDF-1.4"))

        payload = export_response.content.decode("latin-1", errors="ignore")
        self.assertIn("Export réglementaire Conforméo", payload)
        self.assertIn("Identification entreprise", payload)
        self.assertIn("Obligations applicables", payload)
        self.assertIn("Sécurité bâtiment", payload)
        self.assertIn("DUERP simplifié", payload)
        self.assertIn("Pièces justificatives", payload)
        self.assertIn("Conformeo Reglementation", payload)
        self.assertIn("Chute de hauteur", payload)
        self.assertIn("preuve-hauteur-2026.pdf", payload)


if __name__ == "__main__":
    unittest.main()
