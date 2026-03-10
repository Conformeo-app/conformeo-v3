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
    AuditAction,
    AuditLog,
    Base,
    Organization,
    OrganizationMembership,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationStatus,
    User,
    UserStatus,
)
from app.main import create_app


class AuthRbacModulesApiTest(unittest.TestCase):
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
            org_primary_id = UUID("00000000-0000-0000-0000-000000000101")
            org_secondary_id = UUID("00000000-0000-0000-0000-000000000102")
            owner_id = UUID("00000000-0000-0000-0000-000000000201")
            member_id = UUID("00000000-0000-0000-0000-000000000202")

            org_primary = Organization(
                id=org_primary_id,
                name="Conformeo Demo",
                slug="conformeo-demo",
                legal_name="Conformeo Demo SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            org_secondary = Organization(
                id=org_secondary_id,
                name="Conformeo Filiale",
                slug="conformeo-filiale",
                legal_name="Conformeo Filiale SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )

            owner = User(
                id=owner_id,
                email="owner@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Olivia",
                last_name="Owner",
                display_name="Olivia Owner",
                status=UserStatus.ACTIVE,
            )
            member = User(
                id=member_id,
                email="member@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Marc",
                last_name="Member",
                display_name="Marc Member",
                status=UserStatus.ACTIVE,
            )

            session.add_all([org_primary, org_secondary, owner, member])
            session.flush()

            session.add_all(
                [
                    OrganizationMembership(
                        user_id=owner.id,
                        organization_id=org_primary.id,
                        role_code="owner",
                        is_default=True,
                    ),
                    OrganizationMembership(
                        user_id=owner.id,
                        organization_id=org_secondary.id,
                        role_code="member",
                        is_default=False,
                    ),
                    OrganizationMembership(
                        user_id=member.id,
                        organization_id=org_primary.id,
                        role_code="member",
                        is_default=True,
                    ),
                ]
            )

            for organization in (org_primary, org_secondary):
                for module_code in OrganizationModuleCode:
                    session.add(
                        OrganizationModule(
                            organization_id=organization.id,
                            module_code=module_code,
                            is_enabled=organization.id == org_primary.id
                            and module_code == OrganizationModuleCode.REGLEMENTATION,
                        )
                    )

            session.commit()
        finally:
            session.close()

    def login(self, email: str, password: str = "Secret123!") -> dict:
        response = self.client.post(
            "/auth/login",
            json={"email": email, "password": password},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_valid_user_can_login(self) -> None:
        payload = self.login("owner@conformeo.local")

        self.assertIn("access_token", payload)
        self.assertEqual(payload["token_type"], "bearer")
        self.assertEqual(payload["session"]["user"]["email"], "owner@conformeo.local")
        self.assertEqual(
            payload["session"]["current_membership"]["organization"]["slug"],
            "conformeo-demo",
        )
        self.assertIn(
            "modules:manage",
            payload["session"]["current_membership"]["permissions"],
        )

    def test_auth_me_can_switch_current_organization(self) -> None:
        login_payload = self.login("owner@conformeo.local")
        token = login_payload["access_token"]

        response = self.client.get(
            "/auth/me",
            headers={
                "Authorization": f"Bearer {token}",
                "X-Conformeo-Organization-Id": "00000000-0000-0000-0000-000000000102",
            },
        )

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(
            payload["current_membership"]["organization"]["slug"],
            "conformeo-filiale",
        )
        self.assertNotIn(
            "modules:manage",
            payload["current_membership"]["permissions"],
        )

    def test_owner_can_toggle_module_but_member_cannot(self) -> None:
        owner_token = self.login("owner@conformeo.local")["access_token"]
        member_token = self.login("member@conformeo.local")["access_token"]

        owner_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000101/modules/facturation",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(owner_response.status_code, 200, owner_response.text)
        self.assertTrue(owner_response.json()["is_enabled"])

        member_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000101/modules/chantier",
            headers={"Authorization": f"Bearer {member_token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(member_response.status_code, 403, member_response.text)

        audit_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000101/audit-logs",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(audit_response.status_code, 200, audit_response.text)
        payload = audit_response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["action_type"], "module_activation_change")
        self.assertEqual(payload[0]["target_type"], "organization_module")
        self.assertEqual(payload[0]["target_display"], "facturation")
        self.assertEqual(
            payload[0]["changes"],
            {"is_enabled": {"from": False, "to": True}},
        )

        session = self.SessionLocal()
        try:
            audit_logs = session.query(AuditLog).all()
        finally:
            session.close()

        self.assertEqual(len(audit_logs), 1)
        self.assertEqual(audit_logs[0].action_type, AuditAction.MODULE_ACTIVATION_CHANGE)


if __name__ == "__main__":
    unittest.main()
