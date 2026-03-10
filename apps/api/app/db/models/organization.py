from __future__ import annotations

import enum

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel


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
