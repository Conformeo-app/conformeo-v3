from __future__ import annotations

import sys
import unittest
from pathlib import Path

from sqlalchemy.dialects import postgresql


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.db.models import (
    AuditAction,
    AuditLog,
    BuildingSafetyItem,
    BuildingSafetyItemStatus,
    BuildingSafetyItemType,
    Document,
    DocumentStatus,
    DuerpEntry,
    DuerpEntryStatus,
    DuerpSeverity,
    Organization,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationSite,
    OrganizationSiteStatus,
    OrganizationSiteType,
    OrganizationStatus,
    User,
    UserStatus,
)


class PostgresEnumMappingTest(unittest.TestCase):
    def assert_enum_column_uses_values(self, column, enum_cls, sample_member) -> None:
        enum_type = column.type
        processor = enum_type.bind_processor(postgresql.dialect())

        self.assertEqual(enum_type.enums, [item.value for item in enum_cls])
        self.assertTrue(enum_type.validate_strings)
        self.assertEqual(processor(sample_member) if processor else sample_member, sample_member.value)

        with self.assertRaises(LookupError):
            invalid_label = getattr(sample_member, "name", str(sample_member))
            if processor is None:
                raise AssertionError("Le bind processor PostgreSQL ne devrait pas être nul pour un Enum SQLAlchemy.")
            processor(invalid_label)

    def test_all_postgresql_enum_columns_bind_lowercase_values(self) -> None:
        cases = [
            (Organization.__table__.c.status, OrganizationStatus, OrganizationStatus.ACTIVE),
            (User.__table__.c.status, UserStatus, UserStatus.ACTIVE),
            (
                OrganizationModule.__table__.c.module_code,
                OrganizationModuleCode,
                OrganizationModuleCode.REGLEMENTATION,
            ),
            (AuditLog.__table__.c.action_type, AuditAction, AuditAction.CREATE),
            (Document.__table__.c.status, DocumentStatus, DocumentStatus.AVAILABLE),
            (
                OrganizationSite.__table__.c.site_type,
                OrganizationSiteType,
                OrganizationSiteType.BUILDING,
            ),
            (
                OrganizationSite.__table__.c.status,
                OrganizationSiteStatus,
                OrganizationSiteStatus.ACTIVE,
            ),
            (
                BuildingSafetyItem.__table__.c.item_type,
                BuildingSafetyItemType,
                BuildingSafetyItemType.FIRE_EXTINGUISHER,
            ),
            (
                BuildingSafetyItem.__table__.c.status,
                BuildingSafetyItemStatus,
                BuildingSafetyItemStatus.ACTIVE,
            ),
            (DuerpEntry.__table__.c.severity, DuerpSeverity, DuerpSeverity.MEDIUM),
            (DuerpEntry.__table__.c.status, DuerpEntryStatus, DuerpEntryStatus.ACTIVE),
        ]

        for column, enum_cls, sample_member in cases:
            with self.subTest(column=column.name):
                self.assert_enum_column_uses_values(column, enum_cls, sample_member)


if __name__ == "__main__":
    unittest.main()
