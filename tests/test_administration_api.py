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
    OrganizationStatus,
    User,
    UserStatus,
)
from app.main import create_app


class AdministrationApiTest(unittest.TestCase):
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
                id=UUID("00000000-0000-0000-0000-000000000701"),
                name="Conformeo Administration",
                slug="conformeo-administration",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000000702"),
                email="owner.admin@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Olivia",
                last_name="Owner",
                display_name="Olivia Owner",
                status=UserStatus.ACTIVE,
            )
            manager = User(
                id=UUID("00000000-0000-0000-0000-000000000703"),
                email="manager.admin@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Maya",
                last_name="Manager",
                display_name="Maya Manager",
                status=UserStatus.ACTIVE,
            )
            member = User(
                id=UUID("00000000-0000-0000-0000-000000000704"),
                email="member.admin@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Leo",
                last_name="Member",
                display_name="Leo Member",
                status=UserStatus.ACTIVE,
            )

            session.add_all([organization, owner, manager, member])
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
                        user_id=manager.id,
                        organization_id=organization.id,
                        role_code="manager",
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
            for module_code in OrganizationModuleCode:
                session.add(
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=module_code,
                        is_enabled=True,
                    )
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

    def test_owner_can_manage_members_and_teams(self) -> None:
        token = self.login("owner.admin@conformeo.local")

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000701/members",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        self.assertEqual(len(list_response.json()), 3)

        create_member_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000701/members",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "email": "terrain.admin@conformeo.local",
                "first_name": "Nina",
                "last_name": "Terrain",
                "phone": "0600000000",
                "role_code": "contributor",
            },
        )
        self.assertEqual(create_member_response.status_code, 200, create_member_response.text)
        created_member = create_member_response.json()
        self.assertEqual(created_member["role_label"], "Terrain")
        self.assertEqual(created_member["user"]["status"], "invited")

        update_member_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000701/members/{created_member['membership']['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "role_code": "viewer",
                "user_status": "disabled",
            },
        )
        self.assertEqual(update_member_response.status_code, 200, update_member_response.text)
        updated_member = update_member_response.json()
        self.assertEqual(updated_member["role_label"], "Lecteur")
        self.assertEqual(updated_member["user"]["status"], "disabled")

        create_team_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000701/teams",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Equipe interventions ERP",
                "description": "Equipe transverse site occupe",
                "member_user_ids": [
                    "00000000-0000-0000-0000-000000000703",
                    created_member["user"]["id"],
                ],
            },
        )
        self.assertEqual(create_team_response.status_code, 200, create_team_response.text)
        created_team = create_team_response.json()
        self.assertEqual(created_team["member_count"], 2)

        update_team_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000701/teams/{created_team['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Equipe interventions ERP",
                "description": "Equipe transverse site occupe et astreinte",
                "member_user_ids": [
                    "00000000-0000-0000-0000-000000000702",
                    "00000000-0000-0000-0000-000000000703",
                ],
            },
        )
        self.assertEqual(update_team_response.status_code, 200, update_team_response.text)
        updated_team = update_team_response.json()
        self.assertEqual(updated_team["member_count"], 2)
        self.assertEqual({member["display_name"] for member in updated_team["members"]}, {"Olivia Owner", "Maya Manager"})

    def test_manager_can_read_but_not_manage_accesses(self) -> None:
        token = self.login("manager.admin@conformeo.local")

        members_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000701/members",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(members_response.status_code, 200, members_response.text)

        create_member_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000701/members",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "email": "blocked.admin@conformeo.local",
                "first_name": "Bloc",
                "last_name": "Manager",
                "role_code": "viewer",
            },
        )
        self.assertEqual(create_member_response.status_code, 403, create_member_response.text)

        create_team_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000701/teams",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Equipe bloquee",
                "description": None,
                "member_user_ids": [],
            },
        )
        self.assertEqual(create_team_response.status_code, 403, create_team_response.text)

    def test_member_cannot_read_users(self) -> None:
        token = self.login("member.admin@conformeo.local")

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000701/members",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 403, response.text)


if __name__ == "__main__":
    unittest.main()
