from __future__ import annotations

from collections.abc import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.organization_module import OrganizationModule, OrganizationModuleCode


PermissionCode = str
ModuleAccessLevel = str

ROLE_LABELS: dict[str, str] = {
    "owner": "Owner",
    "admin": "Admin",
    "manager": "Manager",
    "contributor": "Terrain",
    "viewer": "Lecteur",
    "member": "Membre",
}

ROLE_SUMMARIES: dict[str, str] = {
    "owner": "Administration complete de l'organisation, des acces et des modules.",
    "admin": "Administration courante de l'organisation, des acces et des modules.",
    "manager": "Pilotage operationnel avec action sur les modules actifs.",
    "contributor": "Action sur les modules actifs sans administration des acces.",
    "viewer": "Lecture seule sur les modules actifs.",
    "member": "Lecture simple sur les modules actifs.",
}

ASSIGNABLE_ROLE_CODES: tuple[str, ...] = (
    "owner",
    "admin",
    "manager",
    "contributor",
    "viewer",
)

MODULE_ACCESS_LABELS: dict[ModuleAccessLevel, str] = {
    "disabled": "Desactive",
    "read": "Lecture",
    "action": "Action",
    "admin": "Admin",
}

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
        "organization:update",
        "users:read",
        "users:manage",
        "modules:read",
        "modules:manage",
    ),
    "manager": (
        "organization:read",
        "organization:update",
        "users:read",
        "modules:read",
    ),
    "contributor": (
        "organization:read",
        "organization:update",
        "modules:read",
    ),
    "viewer": (
        "organization:read",
        "modules:read",
    ),
    "member": (
        "organization:read",
        "modules:read",
    ),
}


def resolve_permissions(role_code: str) -> tuple[PermissionCode, ...]:
    return ROLE_PERMISSIONS.get(role_code, ())


def get_role_label(role_code: str) -> str:
    return ROLE_LABELS.get(role_code, role_code)


def get_role_summary(role_code: str) -> str:
    return ROLE_SUMMARIES.get(role_code, "Acces simple au workspace.")


def is_assignable_role(role_code: str) -> bool:
    return role_code in ASSIGNABLE_ROLE_CODES


def resolve_module_access_level(
    role_code: str,
    *,
    module_enabled: bool,
) -> ModuleAccessLevel:
    if not module_enabled:
        return "disabled"
    if role_code in {"owner", "admin"}:
        return "admin"
    if role_code in {"manager", "contributor"}:
        return "action"
    return "read"


def get_module_access_label(access_level: ModuleAccessLevel) -> str:
    return MODULE_ACCESS_LABELS.get(access_level, access_level)


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
