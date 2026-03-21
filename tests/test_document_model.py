from __future__ import annotations

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

from app.db.models import Base, Document, DocumentStatus, Organization, OrganizationStatus, User, UserStatus


class DocumentModelTest(unittest.TestCase):
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

    def test_document_can_attach_to_business_entity_with_core_metadata(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000001001"),
                name="Conformeo Demo",
                slug="conformeo-demo",
                legal_name="Conformeo Demo SAS",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            user = User(
                id=UUID("00000000-0000-0000-0000-000000001002"),
                email="docs@conformeo.local",
                first_name="Dora",
                last_name="Docs",
                display_name="Dora Docs",
                status=UserStatus.ACTIVE,
            )
            session.add_all([organization, user])
            session.flush()

            document = Document(
                organization_id=organization.id,
                attached_to_entity_type="chantier",
                attached_to_entity_id=UUID("00000000-0000-0000-0000-000000009999"),
                attached_to_field="evidence",
                uploaded_by_user_id=user.id,
                document_type="photo",
                source="mobile_capture",
                status=DocumentStatus.AVAILABLE,
                file_name="facade-avant.jpg",
                mime_type="image/jpeg",
                size_bytes=245760,
                storage_key="documents/demo/facade-avant.jpg",
                checksum="sha256:demo",
                content_bytes=b"demo-bytes",
            )
            session.add(document)
            session.commit()

            stored_document = session.execute(select(Document)).scalars().one()
        finally:
            session.close()

        self.assertEqual(stored_document.organization_id, organization.id)
        self.assertEqual(stored_document.attached_to_entity_type, "chantier")
        self.assertEqual(stored_document.attached_to_field, "evidence")
        self.assertEqual(stored_document.document_type, "photo")
        self.assertEqual(stored_document.source, "mobile_capture")
        self.assertEqual(stored_document.status, DocumentStatus.AVAILABLE)
        self.assertEqual(stored_document.file_name, "facade-avant.jpg")
        self.assertEqual(stored_document.size_bytes, 245760)
        self.assertEqual(stored_document.storage_key, "documents/demo/facade-avant.jpg")
        self.assertEqual(stored_document.content_bytes, b"demo-bytes")
        self.assertIsNotNone(stored_document.created_at)
        self.assertIsNotNone(stored_document.updated_at)


if __name__ == "__main__":
    unittest.main()
