from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.document import Document
    from app.db.models.organization_module import OrganizationModule
    from app.db.models.organization_membership import OrganizationMembership
    from app.db.models.organization_site import OrganizationSite


class OrganizationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Organization(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    legal_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    activity_label: Mapped[str | None] = mapped_column(String(160), nullable=True)
    employee_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    has_employees: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    receives_public: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    stores_hazardous_products: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    performs_high_risk_work: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    headquarters_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    onboarding_completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    status: Mapped[OrganizationStatus] = mapped_column(
        postgres_enum(OrganizationStatus, name="organization_status"),
        nullable=False,
        default=OrganizationStatus.ACTIVE,
        server_default=OrganizationStatus.ACTIVE.value,
    )
    default_locale: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="fr-FR",
        server_default="fr-FR",
    )
    default_timezone: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="Europe/Paris",
        server_default="Europe/Paris",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    memberships: Mapped[list["OrganizationMembership"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    modules: Mapped[list["OrganizationModule"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    documents: Mapped[list["Document"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
    sites: Mapped[list["OrganizationSite"]] = relationship(
        back_populates="organization",
        cascade="all, delete-orphan",
    )
