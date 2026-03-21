from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Index, String, Text, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel

if TYPE_CHECKING:
    from app.db.models.organization import Organization
    from app.db.models.user import User


class WorksiteCoordinationItem(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "worksite_coordination_items"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "target_type",
            "target_id",
            name="uq_worksite_coordination_target",
        ),
        Index("ix_worksite_coordination_org_target_type", "organization_id", "target_type"),
        Index("ix_worksite_coordination_org_status", "organization_id", "status"),
    )

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    target_type: Mapped[str] = mapped_column(String(32), nullable=False)
    target_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    assignee_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="todo",
        server_default="todo",
    )
    comment_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped["Organization"] = relationship()
    assignee_user: Mapped["User | None"] = relationship()
