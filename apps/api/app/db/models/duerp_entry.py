from __future__ import annotations

import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.organization_site import OrganizationSite


class DuerpSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class DuerpEntryStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class DuerpEntry(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "duerp_entries"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    site_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organization_sites.id", ondelete="SET NULL"),
        nullable=True,
    )
    work_unit_name: Mapped[str] = mapped_column(String(160), nullable=False)
    risk_label: Mapped[str] = mapped_column(String(200), nullable=False)
    severity: Mapped[DuerpSeverity] = mapped_column(
        postgres_enum(DuerpSeverity, name="duerp_severity"),
        nullable=False,
    )
    prevention_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[DuerpEntryStatus] = mapped_column(
        postgres_enum(DuerpEntryStatus, name="duerp_entry_status"),
        nullable=False,
        default=DuerpEntryStatus.ACTIVE,
        server_default=DuerpEntryStatus.ACTIVE.value,
    )

    site: Mapped["OrganizationSite | None"] = relationship()
