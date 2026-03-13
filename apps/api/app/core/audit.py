from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import AuditAction, AuditLog, User


BOOTSTRAP_ACTOR_LABEL = "bootstrap_admin"


def record_audit_log(
    db: Session,
    *,
    action_type: AuditAction,
    target_type: str,
    target_id: UUID,
    organization_id: UUID | None = None,
    actor_user: User | None = None,
    actor_label: str | None = None,
    target_display: str | None = None,
    changes: dict[str, Any] | None = None,
) -> AuditLog:
    resolved_actor_label = actor_label or (actor_user.email if actor_user is not None else "system")
    audit_log = AuditLog(
        organization_id=organization_id,
        actor_user_id=actor_user.id if actor_user is not None else None,
        actor_label=resolved_actor_label,
        action_type=action_type,
        target_type=target_type,
        target_id=target_id,
        target_display=target_display,
        changes=changes or None,
    )
    db.add(audit_log)
    return audit_log


def list_audit_logs(
    db: Session,
    organization_id: UUID,
    *,
    limit: int = 50,
    target_id: UUID | None = None,
    target_types: list[str] | None = None,
) -> list[AuditLog]:
    safe_limit = min(max(limit, 1), 100)
    query = select(AuditLog).where(AuditLog.organization_id == organization_id)
    if target_id is not None:
        query = query.where(AuditLog.target_id == target_id)
    if target_types:
        query = query.where(AuditLog.target_type.in_(target_types))
    return (
        db.execute(
            query
            .order_by(AuditLog.occurred_at.desc(), AuditLog.id.desc())
            .limit(safe_limit)
        )
        .scalars()
        .all()
    )
