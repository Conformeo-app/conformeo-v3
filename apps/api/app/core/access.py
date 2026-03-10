from __future__ import annotations

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.organization_module import OrganizationModule, OrganizationModuleCode


PermissionCode = str

ROLE_PERMISSIONS: dict[str, tuple[PermissionCode, ...]] = {
    "owner": (
        "organization:read",
        "organization:update",
        "users:read",
        "users:manage",
        "modules:read",
        "modules:manage",
    ),
    "admin": (
        "organization:read",
        "users:read",
        "users:manage",
        "modules:read",
        "modules:manage",
    ),
    "member": (
        "organization:read",
        "modules:read",
    ),
}


def resolve_permissions(role_code: str) -> tuple[PermissionCode, ...]:
    return ROLE_PERMISSIONS.get(role_code, ())


def list_organization_modules(db: Session, organization_id: UUID) -> list[OrganizationModule]:
    modules = (
        db.execute(
            select(OrganizationModule)
            .where(
                OrganizationModule.organization_id == organization_id,
                OrganizationModule.deleted_at.is_(None),
            )
            .order_by(OrganizationModule.module_code.asc())
        )
        .scalars()
        .all()
    )
    if modules:
        return modules

    for module_code in OrganizationModuleCode:
        db.add(
            OrganizationModule(
                organization_id=organization_id,
                module_code=module_code,
                is_enabled=False,
            )
        )
    db.flush()
    return (
        db.execute(
            select(OrganizationModule)
            .where(
                OrganizationModule.organization_id == organization_id,
                OrganizationModule.deleted_at.is_(None),
            )
            .order_by(OrganizationModule.module_code.asc())
        )
        .scalars()
        .all()
    )


def get_module_by_code(
    modules: Sequence[OrganizationModule],
    module_code: OrganizationModuleCode,
) -> OrganizationModule | None:
    return next((module for module in modules if module.module_code == module_code), None)
