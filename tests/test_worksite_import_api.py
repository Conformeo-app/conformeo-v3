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
from app.db.models import Base, Organization, OrganizationMembership, OrganizationStatus, User, UserStatus
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

            session.add_all([organization, user])
            session.flush()
            session.add(
                OrganizationMembership(
                    user_id=user.id,
                    organization_id=organization.id,
                    role_code="member",
                    is_default=True,
                )
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
        self.assertNotIn("is_offline_ready", payload[0])

    def test_user_cannot_read_other_organization_worksites(self) -> None:
        token = self.login()

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000399/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(response.status_code, 403, response.text)


if __name__ == "__main__":
    unittest.main()
