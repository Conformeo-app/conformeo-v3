from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import (
    get_current_access_context,
    get_current_user,
    list_active_memberships_for_user,
    resolve_membership,
)
from app.core.access import list_organization_modules, resolve_permissions
from app.core.config import get_settings
from app.core.security import create_access_token, normalize_email, verify_password
from app.db.models import User, UserStatus
from app.db.session import get_db_session
from app.schemas.auth import AuthSessionRead, LoginRequest, LoginResponse, MembershipAccessRead
from app.schemas.organization import OrganizationRead
from app.schemas.organization_membership import OrganizationMembershipRead
from app.schemas.organization_module import OrganizationModuleRead
from app.schemas.user import UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


def _build_session_payload(
    db: Session,
    user: User,
    current_organization_id=None,
) -> AuthSessionRead:
    memberships = list_active_memberships_for_user(db, user.id)
    if not memberships:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Aucune organisation active n'est disponible pour cet utilisateur.",
        )

    current_membership = resolve_membership(db, user.id, current_organization_id)
    membership_payloads: list[MembershipAccessRead] = []

    for membership in memberships:
        modules = list_organization_modules(db, membership.organization_id)
        membership_payloads.append(
            MembershipAccessRead(
                membership=OrganizationMembershipRead.model_validate(membership),
                organization=OrganizationRead.model_validate(membership.organization),
                permissions=list(resolve_permissions(membership.role_code)),
                modules=[OrganizationModuleRead.model_validate(module) for module in modules],
                enabled_modules=[module.module_code for module in modules if module.is_enabled],
            )
        )

    current_payload = next(
        item for item in membership_payloads if item.membership.id == current_membership.id
    )
    return AuthSessionRead(
        user=UserRead.model_validate(user),
        memberships=membership_payloads,
        current_membership=current_payload,
    )


@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db_session),
) -> LoginResponse:
    user = (
        db.execute(
            select(User).where(
                User.email == normalize_email(payload.email),
                User.deleted_at.is_(None),
            )
        )
        .scalars()
        .first()
    )
    if (
        user is None
        or user.status != UserStatus.ACTIVE
        or not verify_password(payload.password, user.password_hash)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants invalides.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user.last_active_at = datetime.now(timezone.utc)
    session = _build_session_payload(db, user, payload.organization_id)
    token, expires_at = create_access_token(
        subject=user.id,
        secret=get_settings().auth_token_secret,
        ttl_minutes=get_settings().auth_access_token_ttl_minutes,
    )
    db.commit()
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        expires_at=expires_at,
        session=session,
    )


@router.get("/me", response_model=AuthSessionRead)
def read_current_session(
    context=Depends(get_current_access_context),
    db: Session = Depends(get_db_session),
) -> AuthSessionRead:
    return _build_session_payload(db, context.user, context.organization.id)
