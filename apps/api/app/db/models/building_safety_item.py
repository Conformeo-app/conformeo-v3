from __future__ import annotations

import enum
from datetime import date
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Date, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.organization_site import OrganizationSite


class BuildingSafetyItemType(str, enum.Enum):
    FIRE_EXTINGUISHER = "fire_extinguisher"
    DAE = "dae"
    PERIODIC_CHECK = "periodic_check"


class BuildingSafetyItemStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class BuildingSafetyItem(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "building_safety_items"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    site_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organization_sites.id", ondelete="CASCADE"),
        nullable=False,
    )
    item_type: Mapped[BuildingSafetyItemType] = mapped_column(
        postgres_enum(BuildingSafetyItemType, name="building_safety_item_type"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    next_due_date: Mapped[date] = mapped_column(Date, nullable=False)
    last_checked_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[BuildingSafetyItemStatus] = mapped_column(
        postgres_enum(BuildingSafetyItemStatus, name="building_safety_item_status"),
        nullable=False,
        default=BuildingSafetyItemStatus.ACTIVE,
        server_default=BuildingSafetyItemStatus.ACTIVE.value,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    site: Mapped["OrganizationSite"] = relationship(back_populates="building_safety_items")
