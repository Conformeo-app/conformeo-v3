from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import MODULE_LABELS, OrganizationAccessContext, require_permissions
from app.core.access import (
    get_module_access_label,
    get_role_label,
    get_role_summary,
    is_assignable_role,
    list_organization_modules,
    resolve_module_access_level,
)
from app.core.audit import record_audit_log
from app.db.models import (
    AuditAction,
    OrganizationMembership,
    OrganizationTeam,
    OrganizationTeamMember,
    User,
    UserStatus,
)
from app.db.session import get_db_session
from app.schemas.organization_member import (
    OrganizationMemberCreateRequest,
    OrganizationMemberModuleAccessRead,
    OrganizationMemberRead,
    OrganizationMemberUpdateRequest,
)
from app.schemas.organization_membership import OrganizationMembershipRead
from app.schemas.organization_team import (
    OrganizationTeamMemberRead,
    OrganizationTeamRead,
    OrganizationTeamUpsertRequest,
)
from app.schemas.user import UserRead


router = APIRouter(prefix="/organizations", tags=["administration"])


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def normalize_email(email: str) -> str:
    return email.strip().lower()


def build_display_name(first_name: str, last_name: str) -> str:
    return " ".join(part for part in [first_name.strip(), last_name.strip()] if part).strip()


def build_module_access_reads(
    role_code: str,
    organization_modules,
) -> list[OrganizationMemberModuleAccessRead]:
    access_reads: list[OrganizationMemberModuleAccessRead] = []
    for module in organization_modules:
        access_level = resolve_module_access_level(role_code, module_enabled=module.is_enabled)
        access_reads.append(
            OrganizationMemberModuleAccessRead(
                module_code=module.module_code,
                module_label=MODULE_LABELS.get(module.module_code, module.module_code.value),
                access_level=access_level,
                access_label=get_module_access_label(access_level),
                is_enabled=module.is_enabled,
            )
        )
    return access_reads


def build_access_overview(role_code: str, organization_modules) -> str:
    enabled_modules = [module for module in organization_modules if module.is_enabled]
    if not enabled_modules:
        return "Aucun module actif"

    access_level = resolve_module_access_level(role_code, module_enabled=True)
    access_label = get_module_access_label(access_level)
    return f"{access_label} sur {len(enabled_modules)} module{'s' if len(enabled_modules) > 1 else ''} actif{'s' if len(enabled_modules) > 1 else ''}"


def list_memberships_with_users(db: Session, organization_id: UUID) -> list[OrganizationMembership]:
    return (
        db.execute(
            select(OrganizationMembership)
            .options(selectinload(OrganizationMembership.user))
            .where(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.deleted_at.is_(None),
            )
            .order_by(OrganizationMembership.created_at.asc())
        )
        .scalars()
        .all()
    )


def build_team_map(db: Session, organization_id: UUID) -> dict[UUID, list[OrganizationTeam]]:
    links = (
        db.execute(
            select(OrganizationTeamMember)
            .join(OrganizationTeam, OrganizationTeam.id == OrganizationTeamMember.team_id)
            .options(selectinload(OrganizationTeamMember.team))
            .where(
                OrganizationTeam.deleted_at.is_(None),
                OrganizationTeam.organization_id == organization_id,
                OrganizationTeamMember.deleted_at.is_(None),
            )
        )
        .scalars()
        .all()
    )
    team_map: dict[UUID, list[OrganizationTeam]] = {}
    for link in links:
        if link.team is None:
            continue
        team_map.setdefault(link.user_id, []).append(link.team)
    return team_map


def serialize_member_read(
    membership: OrganizationMembership,
    organization_modules,
    team_map: dict[UUID, list[OrganizationTeam]],
) -> OrganizationMemberRead:
    if membership.user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable pour ce rattachement.")

    teams = sorted(team_map.get(membership.user_id, []), key=lambda item: item.name.lower())
    return OrganizationMemberRead(
        membership=OrganizationMembershipRead.model_validate(membership),
        user=UserRead.model_validate(membership.user),
        role_label=get_role_label(membership.role_code),
        role_summary=get_role_summary(membership.role_code),
        access_overview=build_access_overview(membership.role_code, organization_modules),
        module_access=build_module_access_reads(membership.role_code, organization_modules),
        team_ids=[team.id for team in teams],
        team_names=[team.name for team in teams],
    )


def list_organization_teams(db: Session, organization_id: UUID) -> list[OrganizationTeam]:
    return (
        db.execute(
            select(OrganizationTeam)
            .options(
                selectinload(OrganizationTeam.members).selectinload(OrganizationTeamMember.user),
            )
            .where(
                OrganizationTeam.organization_id == organization_id,
                OrganizationTeam.deleted_at.is_(None),
            )
            .order_by(OrganizationTeam.name.asc())
        )
        .scalars()
        .all()
    )


def serialize_team_read(team: OrganizationTeam, memberships_by_user_id: dict[UUID, OrganizationMembership]) -> OrganizationTeamRead:
    members = sorted(
        [member for member in team.members if member.deleted_at is None and member.user is not None],
        key=lambda item: item.user.display_name.lower(),
    )
    return OrganizationTeamRead(
        id=team.id,
        version=team.version,
        created_at=team.created_at,
        updated_at=team.updated_at,
        deleted_at=team.deleted_at,
        organization_id=team.organization_id,
        name=team.name,
        description=team.description,
        member_count=len(members),
        members=[
            OrganizationTeamMemberRead(
                user_id=member.user.id,
                display_name=member.user.display_name,
                email=member.user.email,
                status=member.user.status,
                role_code=memberships_by_user_id.get(member.user_id).role_code
                if memberships_by_user_id.get(member.user_id) is not None
                else "member",
                role_label=get_role_label(
                    memberships_by_user_id.get(member.user_id).role_code
                    if memberships_by_user_id.get(member.user_id) is not None
                    else "member"
                ),
            )
            for member in members
        ],
    )


def get_membership_or_404(db: Session, organization_id: UUID, membership_id: UUID) -> OrganizationMembership:
    membership = (
        db.execute(
            select(OrganizationMembership)
            .options(selectinload(OrganizationMembership.user))
            .where(
                OrganizationMembership.id == membership_id,
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.deleted_at.is_(None),
            )
        )
        .scalars()
        .one_or_none()
    )
    if membership is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable pour cette organisation.")
    if membership.user is None:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable pour cette organisation.")
    return membership


def get_team_or_404(db: Session, organization_id: UUID, team_id: UUID) -> OrganizationTeam:
    team = (
        db.execute(
            select(OrganizationTeam)
            .options(selectinload(OrganizationTeam.members))
            .where(
                OrganizationTeam.id == team_id,
                OrganizationTeam.organization_id == organization_id,
                OrganizationTeam.deleted_at.is_(None),
            )
        )
        .scalars()
        .one_or_none()
    )
    if team is None:
        raise HTTPException(status_code=404, detail="Equipe introuvable pour cette organisation.")
    return team


def ensure_not_last_active_owner(
    db: Session,
    organization_id: UUID,
    membership: OrganizationMembership,
    *,
    next_role_code: str | None = None,
    next_user_status: UserStatus | None = None,
) -> None:
    next_role = next_role_code or membership.role_code
    next_status = next_user_status or membership.user.status
    if membership.role_code != "owner":
        return
    if next_role == "owner" and next_status == UserStatus.ACTIVE:
        return

    active_owner_count = (
        db.execute(
            select(OrganizationMembership)
            .join(User, User.id == OrganizationMembership.user_id)
            .where(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.deleted_at.is_(None),
                OrganizationMembership.role_code == "owner",
                User.deleted_at.is_(None),
                User.status == UserStatus.ACTIVE,
            )
        )
        .scalars()
        .all()
    )
    if len(active_owner_count) <= 1:
        raise HTTPException(
            status_code=409,
            detail="Cette organisation doit conserver au moins un owner actif.",
        )


def resolve_team_member_user_ids(
    db: Session,
    organization_id: UUID,
    member_user_ids: list[UUID],
) -> set[UUID]:
    unique_ids = {user_id for user_id in member_user_ids}
    if not unique_ids:
        return set()

    memberships = (
        db.execute(
            select(OrganizationMembership.user_id)
            .where(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.deleted_at.is_(None),
                OrganizationMembership.user_id.in_(unique_ids),
            )
        )
        .scalars()
        .all()
    )
    resolved_ids = set(memberships)
    if resolved_ids != unique_ids:
        raise HTTPException(
            status_code=400,
            detail="Un ou plusieurs membres choisis ne sont pas rattachés à cette organisation.",
        )
    return resolved_ids


@router.get(
    "/{organization_id}/members",
    response_model=list[OrganizationMemberRead],
)
def list_organization_members(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("users:read")),
    db: Session = Depends(get_db_session),
) -> list[OrganizationMemberRead]:
    memberships = list_memberships_with_users(db, context.organization.id)
    organization_modules = list_organization_modules(db, context.organization.id)
    team_map = build_team_map(db, context.organization.id)
    return [
        serialize_member_read(membership, organization_modules, team_map)
        for membership in memberships
    ]


@router.post(
    "/{organization_id}/members",
    response_model=OrganizationMemberRead,
)
def create_organization_member(
    organization_id: UUID,
    payload: OrganizationMemberCreateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("users:manage")),
    db: Session = Depends(get_db_session),
) -> OrganizationMemberRead:
    role_code = payload.role_code.strip()
    if not is_assignable_role(role_code):
        raise HTTPException(status_code=400, detail="Le rôle demandé n'est pas disponible dans cette v1.")

    email = normalize_email(payload.email)
    first_name = payload.first_name.strip()
    last_name = payload.last_name.strip()
    if len(email) < 5 or "@" not in email:
        raise HTTPException(status_code=400, detail="L'adresse email est invalide.")
    if len(first_name) < 2 or len(last_name) < 2:
        raise HTTPException(status_code=400, detail="Le prénom et le nom sont requis.")

    user = db.execute(
        select(User).where(
            User.email == email,
            User.deleted_at.is_(None),
        )
    ).scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            password_hash=None,
            first_name=first_name,
            last_name=last_name,
            display_name=build_display_name(first_name, last_name),
            phone=normalize_optional_text(payload.phone),
            status=UserStatus.INVITED,
        )
        db.add(user)
        db.flush()

    existing_membership = db.execute(
        select(OrganizationMembership).where(
            OrganizationMembership.organization_id == context.organization.id,
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.deleted_at.is_(None),
        )
    ).scalar_one_or_none()
    if existing_membership is not None:
        raise HTTPException(status_code=409, detail="Cet utilisateur est déjà rattaché à l'organisation.")

    membership = OrganizationMembership(
        user_id=user.id,
        organization_id=context.organization.id,
        role_code=role_code,
        is_default=False,
    )
    db.add(membership)
    db.flush()

    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="organization_membership",
        target_id=membership.id,
        target_display=user.display_name,
        changes={
            "email": email,
            "role_code": role_code,
            "user_status": user.status.value,
        },
    )
    db.commit()
    db.expire_all()

    membership = get_membership_or_404(db, context.organization.id, membership.id)
    organization_modules = list_organization_modules(db, context.organization.id)
    team_map = build_team_map(db, context.organization.id)
    return serialize_member_read(membership, organization_modules, team_map)


@router.patch(
    "/{organization_id}/members/{membership_id}",
    response_model=OrganizationMemberRead,
)
def update_organization_member(
    organization_id: UUID,
    membership_id: UUID,
    payload: OrganizationMemberUpdateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("users:manage")),
    db: Session = Depends(get_db_session),
) -> OrganizationMemberRead:
    membership = get_membership_or_404(db, context.organization.id, membership_id)
    changes: dict[str, object] = {}

    next_role_code = membership.role_code
    if payload.role_code is not None:
        next_role_code = payload.role_code.strip()
        if not is_assignable_role(next_role_code):
            raise HTTPException(status_code=400, detail="Le rôle demandé n'est pas disponible dans cette v1.")

    next_user_status = payload.user_status or membership.user.status
    ensure_not_last_active_owner(
        db,
        context.organization.id,
        membership,
        next_role_code=next_role_code,
        next_user_status=next_user_status,
    )

    if next_role_code != membership.role_code:
        changes["role_code"] = {"from": membership.role_code, "to": next_role_code}
        membership.role_code = next_role_code
        membership.version += 1

    if payload.user_status is not None and payload.user_status != membership.user.status:
        changes["user_status"] = {
            "from": membership.user.status.value,
            "to": payload.user_status.value,
        }
        membership.user.status = payload.user_status
        membership.user.version += 1

    if changes:
        record_audit_log(
            db,
            organization_id=context.organization.id,
            actor_user=context.user,
            action_type=AuditAction.UPDATE,
            target_type="organization_membership",
            target_id=membership.id,
            target_display=membership.user.display_name,
            changes=changes,
        )
        db.commit()
        db.expire_all()

    membership = get_membership_or_404(db, context.organization.id, membership.id)
    organization_modules = list_organization_modules(db, context.organization.id)
    team_map = build_team_map(db, context.organization.id)
    return serialize_member_read(membership, organization_modules, team_map)


@router.get(
    "/{organization_id}/teams",
    response_model=list[OrganizationTeamRead],
)
def list_teams(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("users:read")),
    db: Session = Depends(get_db_session),
) -> list[OrganizationTeamRead]:
    memberships = list_memberships_with_users(db, context.organization.id)
    memberships_by_user_id = {membership.user_id: membership for membership in memberships}
    return [
        serialize_team_read(team, memberships_by_user_id)
        for team in list_organization_teams(db, context.organization.id)
    ]


@router.post(
    "/{organization_id}/teams",
    response_model=OrganizationTeamRead,
)
def create_team(
    organization_id: UUID,
    payload: OrganizationTeamUpsertRequest,
    context: OrganizationAccessContext = Depends(require_permissions("users:manage")),
    db: Session = Depends(get_db_session),
) -> OrganizationTeamRead:
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Le nom d'équipe est trop court.")

    existing_team = db.execute(
        select(OrganizationTeam).where(
            OrganizationTeam.organization_id == context.organization.id,
            OrganizationTeam.deleted_at.is_(None),
            OrganizationTeam.name == name,
        )
    ).scalar_one_or_none()
    if existing_team is not None:
        raise HTTPException(status_code=409, detail="Une équipe avec ce nom existe déjà.")

    team = OrganizationTeam(
        organization_id=context.organization.id,
        name=name,
        description=normalize_optional_text(payload.description),
    )
    db.add(team)
    db.flush()

    member_user_ids = resolve_team_member_user_ids(db, context.organization.id, payload.member_user_ids)
    for user_id in member_user_ids:
        db.add(
            OrganizationTeamMember(
                team_id=team.id,
                user_id=user_id,
            )
        )

    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="organization_team",
        target_id=team.id,
        target_display=team.name,
        changes={
            "name": team.name,
            "member_user_ids": sorted(str(user_id) for user_id in member_user_ids),
        },
    )
    db.commit()
    db.expire_all()

    memberships = list_memberships_with_users(db, context.organization.id)
    memberships_by_user_id = {membership.user_id: membership for membership in memberships}
    refreshed_team = list_organization_teams(db, context.organization.id)
    created_team = next(item for item in refreshed_team if item.id == team.id)
    return serialize_team_read(created_team, memberships_by_user_id)


@router.patch(
    "/{organization_id}/teams/{team_id}",
    response_model=OrganizationTeamRead,
)
def update_team(
    organization_id: UUID,
    team_id: UUID,
    payload: OrganizationTeamUpsertRequest,
    context: OrganizationAccessContext = Depends(require_permissions("users:manage")),
    db: Session = Depends(get_db_session),
) -> OrganizationTeamRead:
    team = get_team_or_404(db, context.organization.id, team_id)
    name = payload.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Le nom d'équipe est trop court.")

    duplicate_team = db.execute(
        select(OrganizationTeam).where(
            OrganizationTeam.organization_id == context.organization.id,
            OrganizationTeam.deleted_at.is_(None),
            OrganizationTeam.name == name,
            OrganizationTeam.id != team.id,
        )
    ).scalar_one_or_none()
    if duplicate_team is not None:
        raise HTTPException(status_code=409, detail="Une équipe avec ce nom existe déjà.")

    next_member_ids = resolve_team_member_user_ids(db, context.organization.id, payload.member_user_ids)
    current_member_ids = {member.user_id for member in team.members if member.deleted_at is None}
    changes: dict[str, object] = {}

    if team.name != name:
        changes["name"] = {"from": team.name, "to": name}
        team.name = name
    next_description = normalize_optional_text(payload.description)
    if team.description != next_description:
        changes["description"] = {"from": team.description, "to": next_description}
        team.description = next_description

    to_add = next_member_ids - current_member_ids
    to_remove = current_member_ids - next_member_ids

    if to_add or to_remove:
        changes["member_user_ids"] = {
            "from": sorted(str(user_id) for user_id in current_member_ids),
            "to": sorted(str(user_id) for user_id in next_member_ids),
        }

    for member in list(team.members):
        if member.deleted_at is None and member.user_id in to_remove:
            db.delete(member)

    for user_id in to_add:
        db.add(
            OrganizationTeamMember(
                team_id=team.id,
                user_id=user_id,
            )
        )

    if changes:
        team.version += 1
        record_audit_log(
            db,
            organization_id=context.organization.id,
            actor_user=context.user,
            action_type=AuditAction.UPDATE,
            target_type="organization_team",
            target_id=team.id,
            target_display=team.name,
            changes=changes,
        )
        db.commit()
        db.expire_all()

    memberships = list_memberships_with_users(db, context.organization.id)
    memberships_by_user_id = {membership.user_id: membership for membership in memberships}
    refreshed_team = list_organization_teams(db, context.organization.id)
    updated_team = next(item for item in refreshed_team if item.id == team.id)
    return serialize_team_read(updated_team, memberships_by_user_id)
