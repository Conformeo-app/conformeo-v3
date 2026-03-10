from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.models.audit_log import AuditAction


class AuditLogRead(BaseModel):
    id: UUID
    organization_id: UUID | None
    actor_user_id: UUID | None
    actor_label: str
    action_type: AuditAction
    target_type: str
    target_id: UUID
    target_display: str | None
    changes: dict[str, Any] | None
    occurred_at: datetime

    model_config = ConfigDict(from_attributes=True)
