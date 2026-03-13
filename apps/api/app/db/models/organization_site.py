from __future__ import annotations

import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.building_safety_item import BuildingSafetyItem
    from app.db.models.organization import Organization


class OrganizationSiteType(str, enum.Enum):
    SITE = "site"
    BUILDING = "building"
    OFFICE = "office"
    WAREHOUSE = "warehouse"


class OrganizationSiteStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class OrganizationSite(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organization_sites"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    site_type: Mapped[OrganizationSiteType] = mapped_column(
        postgres_enum(OrganizationSiteType, name="organization_site_type"),
        nullable=False,
        default=OrganizationSiteType.SITE,
        server_default=OrganizationSiteType.SITE.value,
    )
    status: Mapped[OrganizationSiteStatus] = mapped_column(
        postgres_enum(OrganizationSiteStatus, name="organization_site_status"),
        nullable=False,
        default=OrganizationSiteStatus.ACTIVE,
        server_default=OrganizationSiteStatus.ACTIVE.value,
    )

    organization: Mapped["Organization"] = relationship(back_populates="sites")
    building_safety_items: Mapped[list["BuildingSafetyItem"]] = relationship(
        back_populates="site",
        cascade="all, delete-orphan",
    )
