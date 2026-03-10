from __future__ import annotations

import argparse
import re
import sys
import unicodedata
from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.core.audit import BOOTSTRAP_ACTOR_LABEL, record_audit_log
from app.core.security import SecurityError, hash_password, normalize_email
from app.db.models import (
    AuditAction,
    Organization,
    OrganizationMembership,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationStatus,
    User,
    UserStatus,
)
from app.db.session import get_session_factory


class BootstrapAdminError(ValueError):
    """Erreur fonctionnelle du bootstrap administrateur."""


@dataclass(frozen=True)
class BootstrapAdminInput:
    email: str
    password: str
    first_name: str
    last_name: str
    organization_name: str
    organization_slug: str | None = None
    display_name: str | None = None
    legal_name: str | None = None
    enabled_modules: tuple[OrganizationModuleCode, ...] = ()


@dataclass(frozen=True)
class BootstrapAdminResult:
    user_id: UUID
    organization_id: UUID
    organization_slug: str
    enabled_modules: tuple[OrganizationModuleCode, ...]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    if not slug:
        raise BootstrapAdminError("Le slug d'organisation est invalide.")
    return slug[:80]


def _normalize_required(value: str, field_name: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise BootstrapAdminError(f"Le champ {field_name} est obligatoire.")
    return normalized


def _normalize_optional(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def _normalize_enabled_modules(
    values: Iterable[OrganizationModuleCode],
) -> tuple[OrganizationModuleCode, ...]:
    unique_values: list[OrganizationModuleCode] = []
    seen: set[OrganizationModuleCode] = set()
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        unique_values.append(value)
    return tuple(unique_values)


def bootstrap_admin(
    db: Session,
    payload: BootstrapAdminInput,
) -> BootstrapAdminResult:
    try:
        if db.execute(select(User.id).limit(1)).scalar_one_or_none() is not None:
            raise BootstrapAdminError("Le bootstrap administrateur exige une base vide.")

        if db.execute(select(Organization.id).limit(1)).scalar_one_or_none() is not None:
            raise BootstrapAdminError("Le bootstrap administrateur exige une base vide.")

        email = normalize_email(_normalize_required(payload.email, "email"))
        first_name = _normalize_required(payload.first_name, "first_name")
        last_name = _normalize_required(payload.last_name, "last_name")
        organization_name = _normalize_required(payload.organization_name, "organization_name")
        display_name = _normalize_optional(payload.display_name) or f"{first_name} {last_name}"
        organization_slug = slugify(payload.organization_slug or organization_name)
        enabled_modules = _normalize_enabled_modules(payload.enabled_modules)
        password_hash = hash_password(payload.password)
        organization = Organization(
            name=organization_name,
            slug=organization_slug,
            legal_name=_normalize_optional(payload.legal_name),
            status=OrganizationStatus.ACTIVE,
        )
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name,
            last_name=last_name,
            display_name=display_name,
            status=UserStatus.ACTIVE,
        )

        db.add_all([organization, user])
        db.flush()

        membership = OrganizationMembership(
            user_id=user.id,
            organization_id=organization.id,
            role_code="owner",
            is_default=True,
        )
        db.add(membership)

        modules: list[OrganizationModule] = []
        enabled_module_set = set(enabled_modules)
        for module_code in OrganizationModuleCode:
            modules.append(
                OrganizationModule(
                    organization_id=organization.id,
                    module_code=module_code,
                    is_enabled=module_code in enabled_module_set,
                )
            )
        db.add_all(modules)
        db.flush()

        record_audit_log(
            db,
            organization_id=organization.id,
            actor_label=BOOTSTRAP_ACTOR_LABEL,
            action_type=AuditAction.CREATE,
            target_type="organization",
            target_id=organization.id,
            target_display=organization.name,
            changes={"status": organization.status.value},
        )
        record_audit_log(
            db,
            organization_id=organization.id,
            actor_label=BOOTSTRAP_ACTOR_LABEL,
            action_type=AuditAction.CREATE,
            target_type="user",
            target_id=user.id,
            target_display=user.display_name,
            changes={"status": user.status.value},
        )
        record_audit_log(
            db,
            organization_id=organization.id,
            actor_label=BOOTSTRAP_ACTOR_LABEL,
            action_type=AuditAction.CREATE,
            target_type="organization_membership",
            target_id=membership.id,
            target_display=membership.role_code,
            changes={
                "user_id": str(user.id),
                "organization_id": str(organization.id),
                "is_default": membership.is_default,
            },
        )
        for module in modules:
            record_audit_log(
                db,
                organization_id=organization.id,
                actor_label=BOOTSTRAP_ACTOR_LABEL,
                action_type=AuditAction.CREATE,
                target_type="organization_module",
                target_id=module.id,
                target_display=module.module_code.value,
                changes={
                    "module_code": module.module_code.value,
                    "is_enabled": module.is_enabled,
                },
            )

        db.commit()
    except (BootstrapAdminError, SecurityError) as exc:
        db.rollback()
        raise BootstrapAdminError(str(exc)) from exc
    except Exception:
        db.rollback()
        raise

    return BootstrapAdminResult(
        user_id=user.id,
        organization_id=organization.id,
        organization_slug=organization_slug,
        enabled_modules=enabled_modules,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Initialise le premier administrateur Conformeo sur une base vide.",
    )
    parser.add_argument("--email", required=True, help="Email du premier utilisateur.")
    parser.add_argument("--password", required=True, help="Mot de passe du premier utilisateur.")
    parser.add_argument("--first-name", required=True, help="Prenom du premier utilisateur.")
    parser.add_argument("--last-name", required=True, help="Nom du premier utilisateur.")
    parser.add_argument(
        "--organization-name",
        required=True,
        help="Nom de la premiere organisation.",
    )
    parser.add_argument(
        "--organization-slug",
        help="Slug de la premiere organisation. Genere depuis le nom si absent.",
    )
    parser.add_argument(
        "--display-name",
        help="Nom affiche de l'utilisateur. Defaut: prenom + nom.",
    )
    parser.add_argument(
        "--legal-name",
        help="Raison sociale de l'organisation.",
    )
    parser.add_argument(
        "--enable-module",
        dest="enabled_modules",
        action="append",
        default=[],
        choices=[module_code.value for module_code in OrganizationModuleCode],
        help="Module a activer des le bootstrap. Option repetable.",
    )
    return parser


def run_bootstrap_admin(
    argv: Sequence[str] | None = None,
    *,
    session_factory: sessionmaker[Session] | None = None,
    stdout=None,
    stderr=None,
) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    session_factory = session_factory or get_session_factory()
    stdout = stdout or sys.stdout
    stderr = stderr or sys.stderr

    payload = BootstrapAdminInput(
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name,
        organization_name=args.organization_name,
        organization_slug=args.organization_slug,
        display_name=args.display_name,
        legal_name=args.legal_name,
        enabled_modules=tuple(OrganizationModuleCode(value) for value in args.enabled_modules),
    )

    db = session_factory()
    try:
        result = bootstrap_admin(db, payload)
    except BootstrapAdminError as exc:
        print(str(exc), file=stderr)
        return 1
    finally:
        db.close()

    enabled_modules = ", ".join(module.value for module in result.enabled_modules) or "aucun"
    print(
        (
            "Bootstrap admin termine. "
            f"user_id={result.user_id} organization_id={result.organization_id} "
            f"organization_slug={result.organization_slug} enabled_modules={enabled_modules}"
        ),
        file=stdout,
    )
    return 0


def main() -> None:
    raise SystemExit(run_bootstrap_admin())


if __name__ == "__main__":
    main()
