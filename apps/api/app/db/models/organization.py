from __future__ import annotations

import enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel

if TYPE_CHECKING:
    from app.db.models.document import Document
    from app.db.models.organization_module import OrganizationModule
    from app.db.models.organization_membership import OrganizationMembership


class OrganizationStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Organization(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organizations"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    legal_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[OrganizationStatus] = mapped_column(
        Enum(OrganizationStatus, name="organization_status"),
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
