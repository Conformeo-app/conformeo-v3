from __future__ import annotations

import io
import os
import sys
import unittest
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.api.dependencies import get_db_session
from app.bootstrap_admin import BootstrapAdminInput, BootstrapAdminError, bootstrap_admin, run_bootstrap_admin
from app.db.models import (
    AuditAction,
    AuditLog,
    Base,
    Organization,
    OrganizationMembership,
    OrganizationModule,
    OrganizationModuleCode,
    User,
)
from app.main import create_app


class BootstrapAdminTest(unittest.TestCase):
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

    def test_bootstrap_creates_first_admin_and_auth_can_login(self) -> None:
        session = self.SessionLocal()
        try:
            result = bootstrap_admin(
                session,
                BootstrapAdminInput(
                    email="admin@conformeo.local",
                    password="Secret123!",
                    first_name="Alice",
                    last_name="Admin",
                    organization_name="Conformeo Demo",
                    enabled_modules=(OrganizationModuleCode.REGLEMENTATION,),
                ),
            )
        finally:
            session.close()

        self.assertEqual(result.organization_slug, "conformeo-demo")

        verification_session = self.SessionLocal()
        try:
            user = verification_session.execute(select(User)).scalars().one()
            organization = verification_session.execute(select(Organization)).scalars().one()
            membership = verification_session.execute(select(OrganizationMembership)).scalars().one()
            modules = (
                verification_session.execute(
                    select(OrganizationModule).order_by(OrganizationModule.module_code.asc())
                )
                .scalars()
                .all()
            )
            audit_logs = (
                verification_session.execute(
                    select(AuditLog).order_by(AuditLog.occurred_at.asc(), AuditLog.id.asc())
                )
                .scalars()
                .all()
            )
        finally:
            verification_session.close()

        self.assertEqual(user.email, "admin@conformeo.local")
        self.assertEqual(user.status.value, "active")
        self.assertEqual(organization.slug, "conformeo-demo")
        self.assertEqual(membership.user_id, user.id)
        self.assertEqual(membership.organization_id, organization.id)
        self.assertEqual(membership.role_code, "owner")
        self.assertTrue(membership.is_default)
        self.assertEqual(len(modules), 3)
        self.assertEqual(
            [module.module_code.value for module in modules if module.is_enabled],
            ["reglementation"],
        )
        self.assertEqual(len(audit_logs), 6)
        self.assertTrue(all(log.actor_label == "bootstrap_admin" for log in audit_logs))
        self.assertTrue(all(log.action_type == AuditAction.CREATE for log in audit_logs))
        self.assertEqual(sorted(log.target_type for log in audit_logs), [
            "organization",
            "organization_membership",
            "organization_module",
            "organization_module",
            "organization_module",
            "user",
        ])

        app = create_app()

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db_session] = override_db
        client = TestClient(app)
        try:
            response = client.post(
                "/auth/login",
                json={"email": "admin@conformeo.local", "password": "Secret123!"},
            )
        finally:
            client.close()
            app.dependency_overrides.clear()

        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertEqual(payload["session"]["user"]["email"], "admin@conformeo.local")
        self.assertEqual(payload["session"]["current_membership"]["membership"]["role_code"], "owner")
        self.assertEqual(
            payload["session"]["current_membership"]["enabled_modules"],
            ["reglementation"],
        )

    def test_bootstrap_refuses_non_empty_database(self) -> None:
        session = self.SessionLocal()
        try:
            bootstrap_admin(
                session,
                BootstrapAdminInput(
                    email="admin@conformeo.local",
                    password="Secret123!",
                    first_name="Alice",
                    last_name="Admin",
                    organization_name="Conformeo Demo",
                ),
            )
        finally:
            session.close()

        second_session = self.SessionLocal()
        try:
            with self.assertRaises(BootstrapAdminError):
                bootstrap_admin(
                    second_session,
                    BootstrapAdminInput(
                        email="another@conformeo.local",
                        password="Secret123!",
                        first_name="Bob",
                        last_name="Owner",
                        organization_name="Conformeo Bis",
                    ),
                )
        finally:
            second_session.close()

    def test_cli_runner_returns_zero_and_reports_creation(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()

        exit_code = run_bootstrap_admin(
            [
                "--email",
                "admin@conformeo.local",
                "--password",
                "Secret123!",
                "--first-name",
                "Alice",
                "--last-name",
                "Admin",
                "--organization-name",
                "Conformeo Demo",
                "--enable-module",
                "chantier",
            ],
            session_factory=self.SessionLocal,
            stdout=stdout,
            stderr=stderr,
        )

        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        self.assertIn("Bootstrap admin termine.", stdout.getvalue())
        self.assertIn("enabled_modules=chantier", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()
