from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.access import get_module_by_code, list_organization_modules, resolve_permissions
from app.core.config import get_settings
from app.core.security import SecurityError, decode_access_token
from app.db.models import (
    Organization,
    OrganizationMembership,
    OrganizationModuleCode,
    OrganizationStatus,
    User,
    UserStatus,
)
from app.db.session import get_db_session


bearer_scheme = HTTPBearer(auto_error=False)

MODULE_LABELS: dict[OrganizationModuleCode, str] = {
    OrganizationModuleCode.REGLEMENTATION: "Réglementation",
    OrganizationModuleCode.CHANTIER: "Chantier",
    OrganizationModuleCode.FACTURATION: "Facturation",
}


@dataclass(frozen=True)
class OrganizationAccessContext:
    user: User
    membership: OrganizationMembership
    organization: Organization
    permissions: tuple[str, ...]


def _unauthorized(detail: str = "Authentification requise.") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def _forbidden(detail: str = "Acces refuse.") -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def list_active_memberships_for_user(db: Session, user_id: UUID) -> list[OrganizationMembership]:
    memberships = (
        db.execute(
            select(OrganizationMembership)
            .options(selectinload(OrganizationMembership.organization))
            .where(
                OrganizationMembership.user_id == user_id,
                OrganizationMembership.deleted_at.is_(None),
            )
            .order_by(OrganizationMembership.is_default.desc(), OrganizationMembership.created_at.asc())
        )
        .scalars()
        .all()
    )
    return [
        membership
        for membership in memberships
        if membership.organization
        and membership.organization.deleted_at is None
        and membership.organization.status == OrganizationStatus.ACTIVE
    ]


def resolve_membership(
    db: Session,
    user_id: UUID,
    organization_id: UUID | None,
) -> OrganizationMembership:
    memberships = list_active_memberships_for_user(db, user_id)
    if not memberships:
        raise _forbidden("Aucune organisation active n'est rattachee a cet utilisateur.")

    if organization_id is not None:
        membership = next(
            (item for item in memberships if item.organization_id == organization_id),
            None,
        )
        if membership is None:
            raise _forbidden("Cette organisation n'est pas accessible pour cet utilisateur.")
        return membership

    return memberships[0]


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db_session),
) -> User:
    if credentials is None:
        raise _unauthorized()

    try:
        payload = decode_access_token(
            credentials.credentials,
            get_settings().auth_token_secret,
        )
    except SecurityError as exc:
        raise _unauthorized("Session invalide.") from exc

    user = db.get(User, payload.subject)
    if user is None or user.deleted_at is not None or user.status != UserStatus.ACTIVE:
        raise _unauthorized("Session invalide.")

    return user


def get_current_access_context(
    organization_id: UUID | None = Header(default=None, alias="X-Conformeo-Organization-Id"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> OrganizationAccessContext:
    membership = resolve_membership(db, current_user.id, organization_id)
    list_organization_modules(db, membership.organization_id)
    return OrganizationAccessContext(
        user=current_user,
        membership=membership,
        organization=membership.organization,
        permissions=resolve_permissions(membership.role_code),
    )


def get_organization_access_context(
    organization_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
) -> OrganizationAccessContext:
    membership = resolve_membership(db, current_user.id, organization_id)
    list_organization_modules(db, membership.organization_id)
    return OrganizationAccessContext(
        user=current_user,
        membership=membership,
        organization=membership.organization,
        permissions=resolve_permissions(membership.role_code),
    )


def require_permissions(*required_permissions: str):
    def dependency(
        context: OrganizationAccessContext = Depends(get_organization_access_context),
    ) -> OrganizationAccessContext:
        missing = [permission for permission in required_permissions if permission not in context.permissions]
        if missing:
            raise _forbidden("Permissions insuffisantes pour cette operation.")
        return context

    return dependency


def require_module_enabled(
    module_code: OrganizationModuleCode,
    *required_permissions: str,
):
    def dependency(
        context: OrganizationAccessContext = Depends(require_permissions(*required_permissions)),
        db: Session = Depends(get_db_session),
    ) -> OrganizationAccessContext:
        modules = list_organization_modules(db, context.organization.id)
        module = get_module_by_code(modules, module_code)
        if module is None or not module.is_enabled:
            module_label = MODULE_LABELS.get(module_code, module_code.value)
            raise _forbidden(f"Le module {module_label} n'est pas activé pour cette organisation.")
        return context

    return dependency
