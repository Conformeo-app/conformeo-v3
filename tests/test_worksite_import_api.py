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
from app.core.security import hash_password
from app.db.models import (
    Base,
    Organization,
    OrganizationMembership,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationSite,
    OrganizationSiteStatus,
    OrganizationSiteType,
    OrganizationStatus,
    User,
    UserStatus,
    WorksiteEquipment,
    WorksiteEquipmentStatus,
)
from app.main import create_app


class WorksiteImportApiTest(unittest.TestCase):
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
                id=UUID("00000000-0000-0000-0000-000000000301"),
                name="Conformeo Chantier",
                slug="conformeo-chantier",
                legal_name="Conformeo Chantier SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            user = User(
                id=UUID("00000000-0000-0000-0000-000000000302"),
                email="chantier@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Claire",
                last_name="Terrain",
                display_name="Claire Terrain",
                status=UserStatus.ACTIVE,
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000000303"),
                email="owner.chantier@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Paul",
                last_name="Pilotage",
                display_name="Paul Pilotage",
                status=UserStatus.ACTIVE,
            )
            site = OrganizationSite(
                id=UUID("00000000-0000-0000-0000-000000000304"),
                organization_id=organization.id,
                name="Site pilote",
                address="10 rue de Rivoli, 75001 Paris",
                site_type=OrganizationSiteType.BUILDING,
                status=OrganizationSiteStatus.ACTIVE,
            )
            equipment = WorksiteEquipment(
                id=UUID("00000000-0000-0000-0000-000000000305"),
                organization_id=organization.id,
                worksite_id=None,
                name="Extracteur mobile atelier",
                equipment_type="Extraction",
                status=WorksiteEquipmentStatus.READY,
            )

            session.add_all([organization, user, owner, site, equipment])
            session.flush()
            session.add_all(
                [
                    OrganizationMembership(
                        user_id=user.id,
                        organization_id=organization.id,
                        role_code="member",
                        is_default=True,
                    ),
                    OrganizationMembership(
                        user_id=owner.id,
                        organization_id=organization.id,
                        role_code="owner",
                        is_default=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.CHANTIER,
                        is_enabled=True,
                    ),
                ]
            )
            session.commit()
        finally:
            session.close()

    def login(self) -> str:
        response = self.client.post(
            "/auth/login",
            json={"email": "chantier@conformeo.local", "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def login_owner(self) -> str:
        response = self.client.post(
            "/auth/login",
            json={"email": "owner.chantier@conformeo.local", "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def test_member_can_read_worksite_summaries(self) -> None:
        token = self.login()

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(len(payload), 3)
        self.assertEqual(payload[0]["organization_id"], "00000000-0000-0000-0000-000000000301")
        self.assertIn("name", payload[0])
        self.assertIn("client_name", payload[0])
        self.assertIn("address", payload[0])
        self.assertIn("planned_for", payload[0])
        self.assertIn("interventions", payload[0])
        self.assertIsInstance(payload[0]["interventions"], list)
        self.assertNotIn("is_offline_ready", payload[0])

    def test_user_cannot_read_other_organization_worksites(self) -> None:
        token = self.login()

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000399/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 403, response.text)

    def test_owner_can_create_worksite_with_linked_site(self) -> None:
        token = self.login_owner()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Installation base vie",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "planned",
                "description": "Preparation courte avant intervention.",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["name"], "Installation base vie")
        self.assertEqual(payload["status"], "planned")
        self.assertEqual(payload["site_id"], "00000000-0000-0000-0000-000000000304")
        self.assertEqual(payload["site_name"], "Site pilote")
        self.assertEqual(payload["description"], "Preparation courte avant intervention.")

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        self.assertEqual(list_response.json()[0]["name"], "Installation base vie")

    def test_member_cannot_create_worksite(self) -> None:
        token = self.login()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Tentative membre",
                "site_id": None,
                "status": "planned",
            },
        )

        self.assertEqual(response.status_code, 403, response.text)

    def test_owner_can_mark_worksite_as_completed(self) -> None:
        token = self.login_owner()

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Remise fin de chantier",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "in_progress",
            },
        )
        self.assertEqual(create_response.status_code, 200, create_response.text)
        worksite_id = create_response.json()["id"]

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "completed"},
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "completed")
        self.assertEqual(payload["name"], "Remise fin de chantier")

    def test_member_cannot_mark_worksite_as_completed(self) -> None:
        owner_token = self.login_owner()
        member_token = self.login()

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Tentative cloture membre",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "in_progress",
            },
        )
        self.assertEqual(create_response.status_code, 200, create_response.text)
        worksite_id = create_response.json()["id"]

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/status",
            headers={"Authorization": f"Bearer {member_token}"},
            json={"status": "completed"},
        )

        self.assertEqual(response.status_code, 403, response.text)

    def test_owner_can_create_worksite_intervention(self) -> None:
        token = self.login_owner()

        create_worksite_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Intervention pilotée",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "in_progress",
            },
        )
        self.assertEqual(create_worksite_response.status_code, 200, create_worksite_response.text)
        worksite_id = create_worksite_response.json()["id"]

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/interventions",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "intervention_type": "team_intervention",
                "status": "planned",
                "scheduled_for": "2026-04-06T09:00:00Z",
                "notes": "Intervention équipe à préparer.",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["worksite_id"], worksite_id)
        self.assertEqual(payload["intervention_type"], "team_intervention")
        self.assertEqual(payload["status"], "planned")
        self.assertEqual(payload["notes"], "Intervention équipe à préparer.")
        self.assertTrue(payload["scheduled_for"].startswith("2026-04-06T09:00:00"))

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        created_worksite = next(item for item in list_response.json() if item["id"] == worksite_id)
        self.assertEqual(len(created_worksite["interventions"]), 1)
        self.assertEqual(created_worksite["interventions"][0]["status"], "planned")

    def test_owner_can_mark_worksite_intervention_as_done(self) -> None:
        token = self.login_owner()

        create_worksite_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Contrôle final chantier",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "in_progress",
            },
        )
        self.assertEqual(create_worksite_response.status_code, 200, create_worksite_response.text)
        worksite_id = create_worksite_response.json()["id"]

        create_intervention_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/interventions",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "intervention_type": "verification",
                "status": "to_schedule",
                "notes": "Contrôle final à préparer.",
            },
        )
        self.assertEqual(create_intervention_response.status_code, 200, create_intervention_response.text)
        intervention_id = create_intervention_response.json()["id"]

        response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksite-interventions/{intervention_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "done",
                "result": "partial",
                "completed_at": "2026-04-07T16:30:00Z",
                "report_comment": "Contrôle partiellement réalisé, un accès reste fermé.",
                "follow_up_note": "Prévoir une seconde visite avec accès local confirmé.",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["status"], "done")
        self.assertEqual(payload["result"], "partial")
        self.assertTrue(payload["completed_at"].startswith("2026-04-07T16:30:00"))
        self.assertEqual(payload["report_comment"], "Contrôle partiellement réalisé, un accès reste fermé.")
        self.assertEqual(payload["follow_up_note"], "Prévoir une seconde visite avec accès local confirmé.")

    def test_member_cannot_create_worksite_intervention(self) -> None:
        owner_token = self.login_owner()
        member_token = self.login()

        create_worksite_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Intervention membre refusée",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "planned",
            },
        )
        self.assertEqual(create_worksite_response.status_code, 200, create_worksite_response.text)
        worksite_id = create_worksite_response.json()["id"]

        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/interventions",
            headers={"Authorization": f"Bearer {member_token}"},
            json={
                "intervention_type": "preparation",
                "status": "to_schedule",
            },
        )

        self.assertEqual(response.status_code, 403, response.text)

    def test_member_can_read_worksite_equipment_lists(self) -> None:
        token = self.login()

        equipments_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipments",
            headers={"Authorization": f"Bearer {token}"},
        )
        movements_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipment-movements",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(equipments_response.status_code, 200, equipments_response.text)
        self.assertEqual(movements_response.status_code, 200, movements_response.text)
        equipments_payload = equipments_response.json()
        self.assertEqual(len(equipments_payload), 1)
        self.assertEqual(equipments_payload[0]["name"], "Extracteur mobile atelier")
        self.assertEqual(equipments_payload[0]["status"], "ready")
        self.assertIsNone(equipments_payload[0]["worksite_id"])
        self.assertEqual(movements_response.json(), [])

    def test_owner_can_create_worksite_equipment(self) -> None:
        token = self.login_owner()

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipments",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Coffret balisage mobile",
                "type": "Balisage / sécurité",
                "status": "attention",
            },
        )

        self.assertEqual(create_response.status_code, 200, create_response.text)
        payload = create_response.json()
        self.assertEqual(payload["name"], "Coffret balisage mobile")
        self.assertEqual(payload["type"], "Balisage / sécurité")
        self.assertEqual(payload["status"], "attention")
        self.assertIsNone(payload["worksite_id"])

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipments",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        self.assertEqual(len(list_response.json()), 2)
        self.assertEqual(list_response.json()[0]["name"], "Coffret balisage mobile")

    def test_member_cannot_create_worksite_equipment(self) -> None:
        token = self.login()

        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipments",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Membre",
                "type": "Test",
                "status": "ready",
            },
        )

        self.assertEqual(response.status_code, 403, response.text)

    def test_owner_can_assign_and_mark_worksite_equipment(self) -> None:
        token = self.login_owner()

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Base vie terrain",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "in_progress",
                "description": "Préparation terrain suivie depuis le bureau.",
            },
        )
        self.assertEqual(create_response.status_code, 200, create_response.text)
        worksite_id = create_response.json()["id"]

        assign_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/equipment-movements",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "equipment_id": "00000000-0000-0000-0000-000000000305",
                "movement_type": "assigned_to_worksite",
                "resulting_status": "ready",
            },
        )
        self.assertEqual(assign_response.status_code, 200, assign_response.text)
        self.assertEqual(assign_response.json()["movement_type"], "assigned_to_worksite")

        damaged_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/equipment-movements",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "equipment_id": "00000000-0000-0000-0000-000000000305",
                "movement_type": "marked_damaged",
                "resulting_status": "attention",
            },
        )
        self.assertEqual(damaged_response.status_code, 200, damaged_response.text)
        self.assertEqual(damaged_response.json()["movement_type"], "marked_damaged")
        self.assertEqual(damaged_response.json()["resulting_status"], "attention")

        equipments_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipments",
            headers={"Authorization": f"Bearer {token}"},
        )
        movements_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000301/worksite-equipment-movements",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(equipments_response.status_code, 200, equipments_response.text)
        self.assertEqual(movements_response.status_code, 200, movements_response.text)
        equipments_payload = equipments_response.json()
        self.assertEqual(equipments_payload[0]["worksite_id"], worksite_id)
        self.assertEqual(equipments_payload[0]["status"], "attention")
        self.assertEqual(len(movements_response.json()), 2)

    def test_member_cannot_record_worksite_equipment_movement(self) -> None:
        owner_token = self.login_owner()
        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000301/worksites",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={
                "name": "Base logistique",
                "site_id": "00000000-0000-0000-0000-000000000304",
                "status": "planned",
            },
        )
        self.assertEqual(create_response.status_code, 200, create_response.text)
        worksite_id = create_response.json()["id"]

        token = self.login()
        response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000301/worksites/{worksite_id}/equipment-movements",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "equipment_id": "00000000-0000-0000-0000-000000000305",
                "movement_type": "assigned_to_worksite",
                "resulting_status": "ready",
            },
        )

        self.assertEqual(response.status_code, 403, response.text)


if __name__ == "__main__":
    unittest.main()
