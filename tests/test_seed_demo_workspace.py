from __future__ import annotations

import io
import os
import sys
import unittest
from pathlib import Path
from uuid import UUID

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.db.models import (
    Base,
    BuildingSafetyItem,
    Document,
    DuerpEntry,
    Organization,
    OrganizationMembership,
    OrganizationStatus,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationSite,
    User,
    UserStatus,
)
from app.seed_demo_workspace import (
    DEMO_ORGANIZATION_ACTIVITY,
    DEMO_ORGANIZATION_SLUG,
    INVALID_SITE_NAME,
    LYON_SITE_NAME,
    PARIS_SITE_NAME,
    SeedDemoWorkspaceInput,
    run_seed_demo_workspace,
    seed_demo_workspace,
)


class SeedDemoWorkspaceTest(unittest.TestCase):
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
        self.seed_base_organization()

    def seed_base_organization(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000001111"),
                name="Conformeo Dev",
                slug=DEMO_ORGANIZATION_SLUG,
                legal_name="Conformeo Dev",
                status=OrganizationStatus.ACTIVE,
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000001112"),
                email="admin@conformeo.local",
                password_hash="hash",
                first_name="Michel",
                last_name="Germanotti",
                display_name="Michel Germanotti",
                status=UserStatus.ACTIVE,
            )
            session.add_all([organization, owner])
            session.flush()
            session.add(
                OrganizationMembership(
                    user_id=owner.id,
                    organization_id=organization.id,
                    role_code="owner",
                    is_default=True,
                )
            )
            session.add_all(
                [
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.REGLEMENTATION,
                        is_enabled=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.CHANTIER,
                        is_enabled=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.FACTURATION,
                        is_enabled=True,
                    ),
                ]
            )
            session.commit()
        finally:
            session.close()

    def test_seed_demo_workspace_is_idempotent_and_coherent(self) -> None:
        session = self.SessionLocal()
        try:
            first = seed_demo_workspace(session, SeedDemoWorkspaceInput())
            second = seed_demo_workspace(session, SeedDemoWorkspaceInput())

            organization = session.execute(
                select(Organization).where(Organization.slug == DEMO_ORGANIZATION_SLUG)
            ).scalar_one()
            sites = session.execute(select(OrganizationSite)).scalars().all()
            safety_items = session.execute(select(BuildingSafetyItem)).scalars().all()
            duerp_entries = session.execute(select(DuerpEntry)).scalars().all()
            documents = session.execute(select(Document)).scalars().all()
        finally:
            session.close()

        self.assertEqual(first.organization_slug, DEMO_ORGANIZATION_SLUG)
        self.assertEqual(second.organization_slug, DEMO_ORGANIZATION_SLUG)
        self.assertEqual(organization.activity_label, DEMO_ORGANIZATION_ACTIVITY)
        self.assertEqual(organization.employee_count, 6)
        self.assertTrue(organization.has_employees)
        self.assertEqual(len(sites), 3)
        self.assertEqual(len(safety_items), 2)
        self.assertEqual(len(duerp_entries), 1)
        self.assertEqual(len(documents), 3)

        names = {row.name for row in sites}
        self.assertEqual(names, {PARIS_SITE_NAME, LYON_SITE_NAME, INVALID_SITE_NAME})

        site_statuses = {row.name: row.location_enrichment_status for row in sites}
        self.assertEqual(site_statuses[PARIS_SITE_NAME], "enriched")
        self.assertEqual(site_statuses[LYON_SITE_NAME], "partial")
        self.assertEqual(site_statuses[INVALID_SITE_NAME], "no_match")

        site_reasons = {row.name: row.location_enrichment_last_error_reason for row in sites}
        self.assertEqual(site_reasons[PARIS_SITE_NAME], None)
        self.assertEqual(site_reasons[LYON_SITE_NAME], "ambiguous_address")
        self.assertEqual(site_reasons[INVALID_SITE_NAME], "no_geocode_match")

    def test_clean_only_removes_demo_records(self) -> None:
        session = self.SessionLocal()
        try:
            seed_demo_workspace(session, SeedDemoWorkspaceInput())
            result = seed_demo_workspace(session, SeedDemoWorkspaceInput(clean_only=True))

            remaining_sites = session.execute(select(OrganizationSite)).scalars().all()
            remaining_safety_items = session.execute(select(BuildingSafetyItem)).scalars().all()
            remaining_duerp_entries = session.execute(select(DuerpEntry)).scalars().all()
            remaining_documents = session.execute(select(Document)).scalars().all()
            organization = session.execute(
                select(Organization).where(Organization.slug == DEMO_ORGANIZATION_SLUG)
            ).scalar_one()
        finally:
            session.close()

        self.assertGreaterEqual(result.cleaned_records, 9)
        self.assertEqual(len(remaining_sites), 0)
        self.assertEqual(len(remaining_safety_items), 0)
        self.assertEqual(len(remaining_duerp_entries), 0)
        self.assertEqual(len(remaining_documents), 0)
        self.assertIsNone(organization.activity_label)
        self.assertIsNone(organization.has_employees)

    def test_cli_runner_reports_seed(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()

        exit_code = run_seed_demo_workspace(
            ["--organization-slug", DEMO_ORGANIZATION_SLUG],
            session_factory=self.SessionLocal,
            stdout=stdout,
            stderr=stderr,
        )

        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        self.assertIn("Seed demo termine.", stdout.getvalue())
        self.assertIn("organization_slug=conformeo-dev", stdout.getvalue())


if __name__ == "__main__":
    unittest.main()
