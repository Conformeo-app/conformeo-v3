from __future__ import annotations

import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, UniqueConstraint, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.organization import Organization


class OrganizationModuleCode(str, enum.Enum):
    REGLEMENTATION = "reglementation"
    CHANTIER = "chantier"
    FACTURATION = "facturation"


class OrganizationModule(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organization_modules"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "module_code",
            name="uq_organization_modules_org_module",
        ),
    )

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    module_code: Mapped[OrganizationModuleCode] = mapped_column(
        postgres_enum(OrganizationModuleCode, name="organization_module_code"),
        nullable=False,
    )
    is_enabled: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    organization: Mapped["Organization"] = relationship(back_populates="modules")
