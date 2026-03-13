from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import JSON, DateTime, ForeignKey, Index, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.models.base import Base, IdentifiedModel, postgres_enum


class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    SOFT_DELETE = "soft_delete"
    STATUS_CHANGE = "status_change"
    MODULE_ACTIVATION_CHANGE = "module_activation_change"


class AuditLog(Base, IdentifiedModel):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_org_occurred_at", "organization_id", "occurred_at"),
        Index("ix_audit_logs_target", "target_type", "target_id"),
    )

    @staticmethod
    def _now_utc() -> datetime:
        return datetime.now(timezone.utc)

    organization_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_label: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="system",
        server_default="system",
    )
    action_type: Mapped[AuditAction] = mapped_column(
        postgres_enum(AuditAction, name="audit_action"),
        nullable=False,
    )
    target_type: Mapped[str] = mapped_column(String(64), nullable=False)
    target_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    target_display: Mapped[str | None] = mapped_column(String(160), nullable=True)
    changes: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_now_utc,
        server_default=func.now(),
    )
