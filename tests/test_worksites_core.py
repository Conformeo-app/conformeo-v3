from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.core.worksites import WORKSITE_TEMPLATES, list_worksite_summaries
from app.db.models import (
    Base,
    Organization,
    OrganizationSite,
    OrganizationSiteType,
    OrganizationStatus,
    Worksite,
    WorksiteStatus,
)


class WorksitesCoreTest(unittest.TestCase):
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

    def test_list_worksite_summaries_returns_templates_when_no_persisted_worksite_exists(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-00000000aa01"),
                name="Conformeo Dev",
                slug="conformeo-dev",
                legal_name="Conformeo Dev",
                status=OrganizationStatus.ACTIVE,
                headquarters_address="12 rue des Entrepreneurs, 75015 Paris",
            )
            session.add(organization)
            session.commit()

            summaries = list_worksite_summaries(session, organization)
        finally:
            session.close()

        self.assertEqual(len(summaries), len(WORKSITE_TEMPLATES))
        self.assertTrue(all(summary["is_persisted"] is False for summary in summaries))

    def test_list_worksite_summaries_hides_templates_when_persisted_worksites_exist(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-00000000aa02"),
                name="Conformeo Dev",
                slug="conformeo-dev",
                legal_name="Conformeo Dev",
                status=OrganizationStatus.ACTIVE,
                headquarters_address="12 rue des Entrepreneurs, 75015 Paris",
            )
            session.add(organization)
            session.flush()

            site = OrganizationSite(
                organization_id=organization.id,
                name="Agence Rivoli - accueil public",
                address="18 rue de Rivoli, 75004 Paris",
                site_type=OrganizationSiteType.OFFICE,
            )
            session.add(site)
            session.flush()

            session.add(
                Worksite(
                    organization_id=organization.id,
                    site_id=site.id,
                    name="Reamenagement accueil agence Rivoli",
                    status=WorksiteStatus.IN_PROGRESS,
                    planned_for=datetime(2026, 4, 2, 8, 0, tzinfo=timezone.utc),
                )
            )
            session.commit()

            summaries = list_worksite_summaries(session, organization)
        finally:
            session.close()

        self.assertEqual(len(summaries), 1)
        self.assertTrue(summaries[0]["is_persisted"])
        self.assertEqual(summaries[0]["name"], "Reamenagement accueil agence Rivoli")


if __name__ == "__main__":
    unittest.main()
