from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies import OrganizationAccessContext, require_permissions
from app.core.audit import list_audit_logs, record_audit_log
from app.core.access import list_organization_modules
from app.db.models import AuditAction, OrganizationModuleCode
from app.db.session import get_db_session
from app.schemas.auth import ModuleToggleRequest
from app.schemas.audit_log import AuditLogRead
from app.schemas.organization_module import OrganizationModuleRead


router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get(
    "/{organization_id}/modules",
    response_model=list[OrganizationModuleRead],
)
def list_modules(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("modules:read")),
    db: Session = Depends(get_db_session),
) -> list[OrganizationModuleRead]:
    modules = list_organization_modules(db, organization_id)
    return [OrganizationModuleRead.model_validate(module) for module in modules]


@router.get(
    "/{organization_id}/audit-logs",
    response_model=list[AuditLogRead],
)
def read_audit_logs(
    organization_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[AuditLogRead]:
    logs = list_audit_logs(db, organization_id, limit=limit)
    return [AuditLogRead.model_validate(log) for log in logs]


@router.put(
    "/{organization_id}/modules/{module_code}",
    response_model=OrganizationModuleRead,
)
def set_module_state(
    organization_id: UUID,
    module_code: OrganizationModuleCode,
    payload: ModuleToggleRequest,
    context: OrganizationAccessContext = Depends(require_permissions("modules:manage")),
    db: Session = Depends(get_db_session),
) -> OrganizationModuleRead:
    modules = list_organization_modules(db, organization_id)
    module = next(item for item in modules if item.module_code == module_code)
    if module.is_enabled != payload.is_enabled:
        previous_value = module.is_enabled
        module.is_enabled = payload.is_enabled
        module.version += 1
        record_audit_log(
            db,
            organization_id=context.organization.id,
            actor_user=context.user,
            action_type=AuditAction.MODULE_ACTIVATION_CHANGE,
            target_type="organization_module",
            target_id=module.id,
            target_display=module.module_code.value,
            changes={
                "is_enabled": {
                    "from": previous_value,
                    "to": payload.is_enabled,
                }
            },
        )
        db.commit()
        db.refresh(module)
    return OrganizationModuleRead.model_validate(module)
