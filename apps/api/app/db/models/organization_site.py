from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.building_safety_item import BuildingSafetyItem
    from app.db.models.organization import Organization
    from app.db.models.worksite import Worksite


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
    normalized_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    geocoding_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    location_source_meta: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    location_last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    location_enrichment_status: Mapped[str | None] = mapped_column(String(16), nullable=True)
    location_enrichment_attempted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    location_enrichment_last_error_reason: Mapped[str | None] = mapped_column(String(32), nullable=True)
    site_risk_level: Mapped[str | None] = mapped_column(String(16), nullable=True)
    site_risk_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    site_risk_items: Mapped[list[dict[str, object]] | None] = mapped_column(JSON, nullable=True)
    site_risk_source_meta: Mapped[list[dict[str, object]] | None] = mapped_column(JSON, nullable=True)
    site_risk_last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="sites")
    building_safety_items: Mapped[list["BuildingSafetyItem"]] = relationship(
        back_populates="site",
        cascade="all, delete-orphan",
    )
    worksites: Mapped[list["Worksite"]] = relationship(
        back_populates="site",
    )
