from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import and_, inspect, or_, select
from sqlalchemy.orm import Session, selectinload, sessionmaker

from app.core.worksite_coordination import (
    WORKSITE_COORDINATION_TARGET_DOCUMENT,
    WORKSITE_COORDINATION_TARGET_WORKSITE,
    ensure_worksite_coordination_item,
)
from app.core.security import hash_password
from app.db.models import (
    BillingCustomer,
    BillingCustomerType,
    BuildingSafetyItem,
    BuildingSafetyItemStatus,
    BuildingSafetyItemType,
    Document,
    DocumentStatus,
    DuerpEntry,
    DuerpEntryStatus,
    DuerpSeverity,
    Invoice,
    InvoiceStatus,
    Organization,
    OrganizationMembership,
    OrganizationSite,
    OrganizationSiteStatus,
    OrganizationSiteType,
    OrganizationTeam,
    OrganizationTeamMember,
    Quote,
    QuoteStatus,
    User,
    UserStatus,
    Worksite,
    WorksiteCoordinationItem,
    WorksiteEquipment,
    WorksiteEquipmentMovement,
    WorksiteEquipmentMovementType,
    WorksiteEquipmentStatus,
    WorksiteIntervention,
    WorksiteInterventionResult,
    WorksiteInterventionStatus,
    WorksiteInterventionType,
    WorksiteStatus,
)
from app.db.session import get_session_factory


DEMO_ORGANIZATION_NAME = "Conformeo Dev"
DEMO_ORGANIZATION_LEGAL_NAME = "Conformeo Dev"
DEMO_ORGANIZATION_SLUG = "conformeo-dev"
DEMO_ORGANIZATION_ACTIVITY = "BTP - renovation interieure"
DEMO_ORGANIZATION_CONTACT_EMAIL = "contact@conformeo.local"
DEMO_ORGANIZATION_CONTACT_PHONE = "0140000000"
DEMO_ORGANIZATION_HEADQUARTERS = "12 rue des Entrepreneurs, 75015 Paris"
DEMO_ORGANIZATION_NOTES = (
    "Workspace de demonstration transverse pour tester la regulation, les chantiers, les "
    "equipements et la facturation de bout en bout."
)

RIVOLI_SITE_NAME = "Agence Rivoli - accueil public"
SAINT_OUEN_SITE_NAME = "Entrepot Saint-Ouen - zone logistique"
VICTOR_HUGO_SITE_NAME = "Clinique Victor Hugo - aile B"
RIVOLI_WORKSITE_NAME = "Reamenagement accueil agence Rivoli"
SAINT_OUEN_WORKSITE_NAME = "Preparation depot Saint-Ouen - ventilation et stockage"
VICTOR_HUGO_WORKSITE_NAME = "Mise en securite plateau Victor Hugo"
PARIS_EQUIPMENT_PRIMARY_NAME = "Extracteur poussières zone A"
PARIS_EQUIPMENT_SECONDARY_NAME = "Armoire de régulation mobile"
PARIS_EQUIPMENT_CONFINEMENT_NAME = "Kit confinement poussiere accueil"
SAINT_OUEN_EQUIPMENT_LADDER_NAME = "Escabeau aluminium 6 marches"
SAINT_OUEN_EQUIPMENT_BARRICADE_NAME = "Kit balisage zone public"
SAINT_OUEN_EQUIPMENT_FAN_NAME = "Ventilateur chantier mobile"
VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME = "Coffret electrique mobile"
UNASSIGNED_EQUIPMENT_LIGHT_NAME = "Projecteur LED chantier"
UNASSIGNED_EQUIPMENT_DRILL_NAME = "Perforateur SDS chantier"
UNASSIGNED_EQUIPMENT_SENSOR_NAME = "Capteur CO2 zone occupee"
SECONDARY_ACTOR_NAME = "Vanessa Germanotti"
RIVOLI_INTERVENTION_PREPARATION_NOTE = "Preparation terrain bouclee avant passage equipe."
RIVOLI_INTERVENTION_TEAM_NOTE = "Intervention equipe a suivre avec accueil public et confinement."
SAINT_OUEN_INTERVENTION_NOTE = "Preparation depot a caler avec balisage et ventilation."
VICTOR_HUGO_INTERVENTION_NOTE = "Verification securite a reprogrammer apres blocage site."

RIVOLI_PERIODIC_CHECK_NAME = "Verification electrique annuelle Rivoli"
SAINT_OUEN_EXTINGUISHER_NAME = "Extincteur base vie Saint-Ouen"
VICTOR_HUGO_ALARM_NAME = "Alarme SSI aile B"
RIVOLI_DUERP_WORK_UNIT_NAME = "Renovation interieure en site occupe"
RIVOLI_DUERP_RISK_LABEL = "Poussieres et coactivite"
SAINT_OUEN_DUERP_WORK_UNIT_NAME = "Preparation depot et circulation logistique"
SAINT_OUEN_DUERP_RISK_LABEL = "Manutention et circulation engins"

EMPLOYEE_REGISTER_PROOF_FILE = "registre-personnel-2026.xlsx"
EMERGENCY_CONTACTS_PROOF_FILE = "consignes-urgence-rivoli-2026.pdf"
BUILDING_CHECKS_PLAN_FILE = "plan-verifications-periodiques-2026.pdf"
EXTINGUISHER_PROOF_FILE = "controle-extincteur-saint-ouen-2026.pdf"
VICTOR_HUGO_ACCESS_PROOF_FILE = "autorisation-acces-victor-hugo.pdf"

RIVOLI_CUSTOMER_NAME = "Copropriete Rivoli Conseil"
SAINT_OUEN_CUSTOMER_NAME = "Ateliers Saint-Ouen Services"
VICTOR_HUGO_CUSTOMER_NAME = "Clinique Victor Hugo"

def _build_demo_source_meta(
    *,
    provider: str,
    retrieved_at: datetime,
    status: str = "ok",
    freshness: str = "stale",
    extra: dict[str, object] | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "source": provider,
        "retrieved_at": retrieved_at.isoformat(),
        "freshness": freshness,
        "status": status,
    }
    if extra:
        payload.update(extra)
    return payload

DEMO_SITE_NAMES = (
    RIVOLI_SITE_NAME,
    SAINT_OUEN_SITE_NAME,
    VICTOR_HUGO_SITE_NAME,
)
LEGACY_DEMO_SITE_NAMES = (
    "Chantier Paris Centre",
    "Chantier Lyon Nord",
    "Chantier Test Invalide",
    "Agence Lyon Presqu'ile",
)
LEGACY_DEMO_SITE_NAME_PREFIXES = (
    "AA UI ",
    "AB UI ",
    "AC UI ",
    "AD UI ",
    "Probe ",
)
DEMO_WORKSITE_NAMES = (
    RIVOLI_WORKSITE_NAME,
    SAINT_OUEN_WORKSITE_NAME,
    VICTOR_HUGO_WORKSITE_NAME,
)
LEGACY_DEMO_WORKSITE_NAMES = (
    "Reamenagement agence Rivoli",
    "Preparation base vie Lyon Nord",
    "Reamenagement agence Presqu'ile",
    "Réaménagement agence Presqu’île",
)
DEMO_EQUIPMENT_NAMES = (
    PARIS_EQUIPMENT_PRIMARY_NAME,
    PARIS_EQUIPMENT_SECONDARY_NAME,
    PARIS_EQUIPMENT_CONFINEMENT_NAME,
    SAINT_OUEN_EQUIPMENT_LADDER_NAME,
    SAINT_OUEN_EQUIPMENT_BARRICADE_NAME,
    SAINT_OUEN_EQUIPMENT_FAN_NAME,
    VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME,
    UNASSIGNED_EQUIPMENT_LIGHT_NAME,
    UNASSIGNED_EQUIPMENT_DRILL_NAME,
    UNASSIGNED_EQUIPMENT_SENSOR_NAME,
)
DEMO_BUILDING_ITEM_NAMES = (
    RIVOLI_PERIODIC_CHECK_NAME,
    SAINT_OUEN_EXTINGUISHER_NAME,
    VICTOR_HUGO_ALARM_NAME,
)
LEGACY_DEMO_BUILDING_ITEM_NAMES = (
    "Verification electrique annuelle",
    "Extincteur base vie",
)
DEMO_DUERP_KEYS = (
    (RIVOLI_DUERP_WORK_UNIT_NAME, RIVOLI_DUERP_RISK_LABEL),
    (SAINT_OUEN_DUERP_WORK_UNIT_NAME, SAINT_OUEN_DUERP_RISK_LABEL),
)
DEMO_DOCUMENT_FILES = (
    EMPLOYEE_REGISTER_PROOF_FILE,
    EMERGENCY_CONTACTS_PROOF_FILE,
    BUILDING_CHECKS_PLAN_FILE,
    EXTINGUISHER_PROOF_FILE,
    VICTOR_HUGO_ACCESS_PROOF_FILE,
)
LEGACY_DEMO_DOCUMENT_FILES = (
    "affichage-obligatoire-base-vie.pdf",
    "controle-extincteur-base-vie-2026.pdf",
    "trame-duerp-renovation-2026.pdf",
)
DEMO_CUSTOMER_NAMES = (
    RIVOLI_CUSTOMER_NAME,
    SAINT_OUEN_CUSTOMER_NAME,
    VICTOR_HUGO_CUSTOMER_NAME,
)
DEMO_MEMBER_EMAILS = (
    "pauline.admin@conformeo.local",
    "nora.manager@conformeo.local",
    "yanis.terrain@conformeo.local",
    "clara.viewer@conformeo.local",
)
DEMO_TEAM_NAMES = (
    "Equipe interventions ERP",
    "Equipe logistique Saint-Ouen",
)
DEMO_QUOTE_NUMBERS = (
    "DEV-2026-001",
    "DEV-2026-002",
    "DEV-2026-003",
    "DEV-2026-004",
)
DEMO_INVOICE_NUMBERS = (
    "FAC-2026-001",
    "FAC-2026-002",
    "FAC-2026-003",
    "FAC-2026-004",
    "FAC-2026-005",
)
CLEANABLE_SITE_NAMES = (*DEMO_SITE_NAMES, *LEGACY_DEMO_SITE_NAMES)
CLEANABLE_WORKSITE_NAMES = (*DEMO_WORKSITE_NAMES, *LEGACY_DEMO_WORKSITE_NAMES)
CLEANABLE_BUILDING_ITEM_NAMES = (*DEMO_BUILDING_ITEM_NAMES, *LEGACY_DEMO_BUILDING_ITEM_NAMES)
CLEANABLE_DOCUMENT_FILES = (*DEMO_DOCUMENT_FILES, *LEGACY_DEMO_DOCUMENT_FILES)


class DemoSeedError(ValueError):
    """Erreur fonctionnelle du seed de demonstration."""


@dataclass(frozen=True)
class SeedDemoWorkspaceInput:
    organization_slug: str = DEMO_ORGANIZATION_SLUG
    clean_only: bool = False


@dataclass(frozen=True)
class SeedDemoWorkspaceResult:
    organization_id: str
    organization_slug: str
    created_sites: int
    updated_sites: int
    building_safety_items: int
    duerp_entries: int
    regulatory_documents: int
    worksites: int
    worksite_equipments: int
    equipment_movements: int
    billing_customers: int
    quotes: int
    invoices: int
    cleaned_records: int


def _find_organization(db: Session, organization_slug: str) -> Organization:
    organization = db.execute(
        select(Organization).where(
            Organization.slug == organization_slug,
            Organization.deleted_at.is_(None),
        )
    ).scalar_one_or_none()
    if organization is None:
        raise DemoSeedError(
            f"Aucune organisation active avec le slug '{organization_slug}' n'a ete trouvee."
        )
    return organization


def _find_actor_user(db: Session, organization_id) -> User | None:
    owner_membership = db.execute(
        select(OrganizationMembership)
        .where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.deleted_at.is_(None),
        )
        .order_by(OrganizationMembership.is_default.desc(), OrganizationMembership.created_at.asc())
    ).scalars().first()
    if owner_membership is None:
        return None
    return db.get(User, owner_membership.user_id)


def _reset_organization_profile(organization: Organization) -> None:
    organization.activity_label = None
    organization.employee_count = None
    organization.has_employees = None
    organization.receives_public = None
    organization.stores_hazardous_products = None
    organization.performs_high_risk_work = None
    organization.contact_email = None
    organization.contact_phone = None
    organization.headquarters_address = None
    organization.onboarding_completed_at = None
    organization.notes = None


def _ensure_administration_seed_prerequisites(db: Session) -> None:
    inspector = inspect(db.get_bind())
    required_tables = (
        "organization_teams",
        "organization_team_members",
        "worksite_interventions",
    )
    missing_tables = [table_name for table_name in required_tables if not inspector.has_table(table_name)]
    if not missing_tables:
        return
    missing = ", ".join(missing_tables)
    raise DemoSeedError(
        "Les tables attendues pour le seed demo sont absentes "
        f"({missing}). Applique les migrations 0024, 0026 puis 0027 avant de relancer le seed: "
        "psql -d conformeo_v3 -f apps/api/migrations/0024_sprint14_administration_v1.sql && "
        "psql -d conformeo_v3 -f apps/api/migrations/0026_sprint16_worksite_interventions_v1.sql && "
        "psql -d conformeo_v3 -f apps/api/migrations/0027_sprint17_worksite_intervention_journal_v1.sql"
    )


def _clean_demo_records(db: Session, organization: Organization) -> int:
    cleaned_records = 0

    demo_memberships = db.execute(
        select(OrganizationMembership)
        .join(User, User.id == OrganizationMembership.user_id)
        .where(
            OrganizationMembership.organization_id == organization.id,
            OrganizationMembership.deleted_at.is_(None),
            User.email.in_(DEMO_MEMBER_EMAILS),
        )
    ).scalars().all()
    demo_member_user_ids = [membership.user_id for membership in demo_memberships]

    demo_teams = db.execute(
        select(OrganizationTeam).where(
            OrganizationTeam.organization_id == organization.id,
            OrganizationTeam.deleted_at.is_(None),
            OrganizationTeam.name.in_(DEMO_TEAM_NAMES),
        )
    ).scalars().all()
    demo_team_ids = [team.id for team in demo_teams]

    if demo_team_ids:
        demo_team_members = db.execute(
            select(OrganizationTeamMember).where(
                OrganizationTeamMember.team_id.in_(demo_team_ids),
                OrganizationTeamMember.deleted_at.is_(None),
            )
        ).scalars().all()
        for team_member in demo_team_members:
            db.delete(team_member)
            cleaned_records += 1

    for team in demo_teams:
        db.delete(team)
        cleaned_records += 1

    for membership in demo_memberships:
        db.delete(membership)
        cleaned_records += 1

    if demo_member_user_ids:
        demo_users = db.execute(
            select(User).where(
                User.id.in_(demo_member_user_ids),
                User.deleted_at.is_(None),
            )
        ).scalars().all()
        for user in demo_users:
            db.delete(user)
            cleaned_records += 1

    demo_equipments = db.execute(
        select(WorksiteEquipment).where(
            WorksiteEquipment.organization_id == organization.id,
            WorksiteEquipment.deleted_at.is_(None),
            WorksiteEquipment.name.in_(DEMO_EQUIPMENT_NAMES),
        )
    ).scalars().all()

    demo_worksites = db.execute(
        select(Worksite).where(
            Worksite.organization_id == organization.id,
            Worksite.deleted_at.is_(None),
            Worksite.name.in_(CLEANABLE_WORKSITE_NAMES),
        )
    ).scalars().all()

    demo_equipment_ids = [equipment.id for equipment in demo_equipments]
    demo_worksite_ids = [worksite.id for worksite in demo_worksites]
    if demo_worksite_ids:
        demo_interventions = db.execute(
            select(WorksiteIntervention).where(
                WorksiteIntervention.organization_id == organization.id,
                WorksiteIntervention.deleted_at.is_(None),
                WorksiteIntervention.worksite_id.in_(demo_worksite_ids),
            )
        ).scalars().all()
        for intervention in demo_interventions:
            db.delete(intervention)
            cleaned_records += 1

        demo_worksite_documents = db.execute(
            select(Document).where(
                Document.organization_id == organization.id,
                Document.deleted_at.is_(None),
                Document.attached_to_entity_type == "worksite",
                Document.attached_to_entity_id.in_(demo_worksite_ids),
            )
        ).scalars().all()
        demo_worksite_document_ids = [document.id for document in demo_worksite_documents]
        demo_coordination_items = db.execute(
            select(WorksiteCoordinationItem).where(
                WorksiteCoordinationItem.organization_id == organization.id,
                WorksiteCoordinationItem.deleted_at.is_(None),
                or_(
                    and_(
                        WorksiteCoordinationItem.target_type == WORKSITE_COORDINATION_TARGET_WORKSITE,
                        WorksiteCoordinationItem.target_id.in_(demo_worksite_ids),
                    ),
                    and_(
                        WorksiteCoordinationItem.target_type == WORKSITE_COORDINATION_TARGET_DOCUMENT,
                        WorksiteCoordinationItem.target_id.in_(demo_worksite_document_ids),
                    ),
                ),
            )
        ).scalars().all()
        for item in demo_coordination_items:
            db.delete(item)
            cleaned_records += 1
        for document in demo_worksite_documents:
            db.delete(document)
            cleaned_records += 1

    if demo_equipment_ids or demo_worksite_ids:
        clauses = []
        if demo_equipment_ids:
            clauses.append(WorksiteEquipmentMovement.equipment_id.in_(demo_equipment_ids))
        if demo_worksite_ids:
            clauses.append(WorksiteEquipmentMovement.worksite_id.in_(demo_worksite_ids))
        demo_equipment_movements = db.execute(
            select(WorksiteEquipmentMovement).where(
                WorksiteEquipmentMovement.organization_id == organization.id,
                WorksiteEquipmentMovement.deleted_at.is_(None),
                or_(*clauses),
            )
        ).scalars().all()
        for movement in demo_equipment_movements:
            db.delete(movement)
            cleaned_records += 1

    demo_invoices = db.execute(
        select(Invoice).where(
            Invoice.organization_id == organization.id,
            Invoice.deleted_at.is_(None),
            Invoice.number.in_(DEMO_INVOICE_NUMBERS),
        )
    ).scalars().all()
    for invoice in demo_invoices:
        db.delete(invoice)
        cleaned_records += 1

    demo_quotes = db.execute(
        select(Quote).where(
            Quote.organization_id == organization.id,
            Quote.deleted_at.is_(None),
            Quote.number.in_(DEMO_QUOTE_NUMBERS),
        )
    ).scalars().all()
    for quote in demo_quotes:
        db.delete(quote)
        cleaned_records += 1

    demo_customers = db.execute(
        select(BillingCustomer).where(
            BillingCustomer.organization_id == organization.id,
            BillingCustomer.deleted_at.is_(None),
            BillingCustomer.name.in_(DEMO_CUSTOMER_NAMES),
        )
    ).scalars().all()
    for customer in demo_customers:
        db.delete(customer)
        cleaned_records += 1

    demo_documents = db.execute(
        select(Document).where(
            Document.organization_id == organization.id,
            Document.deleted_at.is_(None),
            Document.source == "regulation",
            Document.file_name.in_(CLEANABLE_DOCUMENT_FILES),
        )
    ).scalars().all()
    for document in demo_documents:
        db.delete(document)
        cleaned_records += 1

    demo_duerp_entries = []
    for work_unit_name, risk_label in DEMO_DUERP_KEYS:
        demo_duerp_entries.extend(
            db.execute(
                select(DuerpEntry).where(
                    DuerpEntry.organization_id == organization.id,
                    DuerpEntry.deleted_at.is_(None),
                    DuerpEntry.work_unit_name == work_unit_name,
                    DuerpEntry.risk_label == risk_label,
                )
            ).scalars().all()
        )
    for entry in demo_duerp_entries:
        db.delete(entry)
        cleaned_records += 1

    demo_building_items = db.execute(
        select(BuildingSafetyItem).where(
            BuildingSafetyItem.organization_id == organization.id,
            BuildingSafetyItem.deleted_at.is_(None),
            BuildingSafetyItem.name.in_(CLEANABLE_BUILDING_ITEM_NAMES),
        )
    ).scalars().all()
    for item in demo_building_items:
        db.delete(item)
        cleaned_records += 1

    demo_sites = db.execute(
        select(OrganizationSite).where(
            OrganizationSite.organization_id == organization.id,
            OrganizationSite.deleted_at.is_(None),
            or_(
                OrganizationSite.name.in_(CLEANABLE_SITE_NAMES),
                *[
                    OrganizationSite.name.like(f"{prefix}%")
                    for prefix in LEGACY_DEMO_SITE_NAME_PREFIXES
                ],
            ),
        )
    ).scalars().all()
    for site in demo_sites:
        db.delete(site)
        cleaned_records += 1

    for worksite in demo_worksites:
        db.delete(worksite)
        cleaned_records += 1

    for equipment in demo_equipments:
        db.delete(equipment)
        cleaned_records += 1

    _reset_organization_profile(organization)
    return cleaned_records


def _upsert_site(
    db: Session,
    organization: Organization,
    *,
    name: str,
    address: str,
    site_type: OrganizationSiteType,
    normalized_address: str | None,
    latitude: float | None,
    longitude: float | None,
    geocoding_score: float | None,
    enrichment_status: str,
    enrichment_reason: str | None,
    risk_level: str | None,
    risk_summary: str | None,
    risk_items: list[dict[str, object]] | None,
) -> tuple[OrganizationSite, bool]:
    site = db.execute(
        select(OrganizationSite).where(
            OrganizationSite.organization_id == organization.id,
            OrganizationSite.deleted_at.is_(None),
            OrganizationSite.name == name,
        )
    ).scalar_one_or_none()

    created = False
    if site is None:
        site = OrganizationSite(
            organization_id=organization.id,
            name=name,
            address=address,
            site_type=site_type,
            status=OrganizationSiteStatus.ACTIVE,
        )
        db.add(site)
        created = True

    now = datetime.now(timezone.utc)
    enrichment_meta_status = (
        "ok"
        if enrichment_status == "enriched"
        else "partial"
        if enrichment_status == "partial"
        else "unavailable"
    )
    site.address = address
    site.site_type = site_type
    site.status = OrganizationSiteStatus.ACTIVE
    site.normalized_address = normalized_address
    site.latitude = latitude
    site.longitude = longitude
    site.geocoding_score = geocoding_score
    site.location_source_meta = _build_demo_source_meta(
        provider="geoplateforme",
        retrieved_at=now,
        status=enrichment_meta_status,
        extra={"enrichment_status": enrichment_status, "seed_origin": "demo_seed"},
    )
    site.location_last_synced_at = now
    site.location_enrichment_status = enrichment_status
    site.location_enrichment_attempted_at = now
    site.location_enrichment_last_error_reason = enrichment_reason
    site.site_risk_level = risk_level
    site.site_risk_summary = risk_summary
    site.site_risk_items = risk_items
    site.site_risk_source_meta = (
        [
            _build_demo_source_meta(
                provider="georisques",
                retrieved_at=now,
                status="ok",
                extra={"seed_origin": "demo_seed"},
            )
        ]
        if risk_summary
        else None
    )
    site.site_risk_last_synced_at = now if risk_summary else None
    db.flush()
    return site, created


def _upsert_demo_user(
    db: Session,
    *,
    email: str,
    first_name: str,
    last_name: str,
    phone: str | None,
    status: UserStatus,
    password_hash: str | None = None,
) -> User:
    user = db.execute(
        select(User).where(
            User.email == email,
            User.deleted_at.is_(None),
        )
    ).scalar_one_or_none()
    display_name = f"{first_name.strip()} {last_name.strip()}".strip()
    if user is None:
        user = User(
            email=email,
            password_hash=password_hash,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            display_name=display_name,
            phone=phone,
            status=status,
        )
        db.add(user)
    else:
        user.first_name = first_name.strip()
        user.last_name = last_name.strip()
        user.display_name = display_name
        user.phone = phone
        user.password_hash = password_hash
        user.status = status
    db.flush()
    return user


def _upsert_organization_membership(
    db: Session,
    organization: Organization,
    *,
    user: User,
    role_code: str,
) -> OrganizationMembership:
    membership = db.execute(
        select(OrganizationMembership).where(
            OrganizationMembership.organization_id == organization.id,
            OrganizationMembership.user_id == user.id,
            OrganizationMembership.deleted_at.is_(None),
        )
    ).scalar_one_or_none()
    if membership is None:
        membership = OrganizationMembership(
            organization_id=organization.id,
            user_id=user.id,
            role_code=role_code,
            is_default=False,
        )
        db.add(membership)
    else:
        membership.role_code = role_code
    db.flush()
    return membership


def _upsert_team(
    db: Session,
    organization: Organization,
    *,
    name: str,
    description: str | None,
    member_user_ids: Sequence,
) -> OrganizationTeam:
    team = db.execute(
        select(OrganizationTeam)
        .options(selectinload(OrganizationTeam.members))
        .where(
            OrganizationTeam.organization_id == organization.id,
            OrganizationTeam.deleted_at.is_(None),
            OrganizationTeam.name == name,
        )
    ).scalars().one_or_none()

    if team is None:
        team = OrganizationTeam(
            organization_id=organization.id,
            name=name,
            description=description,
        )
        db.add(team)
        db.flush()
    else:
        team.description = description

    expected_user_ids = set(member_user_ids)
    current_user_ids = {member.user_id for member in team.members if member.deleted_at is None}

    for member in list(team.members):
        if member.deleted_at is None and member.user_id not in expected_user_ids:
            db.delete(member)

    for user_id in expected_user_ids - current_user_ids:
        db.add(
            OrganizationTeamMember(
                team_id=team.id,
                user_id=user_id,
            )
        )

    db.flush()
    return team


def _upsert_building_safety_item(
    db: Session,
    organization: Organization,
    *,
    site: OrganizationSite,
    name: str,
    item_type: BuildingSafetyItemType,
    next_due_date: date,
    last_checked_at: date | None,
    notes: str,
) -> BuildingSafetyItem:
    item = db.execute(
        select(BuildingSafetyItem).where(
            BuildingSafetyItem.organization_id == organization.id,
            BuildingSafetyItem.deleted_at.is_(None),
            BuildingSafetyItem.name == name,
        )
    ).scalar_one_or_none()
    if item is None:
        item = BuildingSafetyItem(
            organization_id=organization.id,
            site_id=site.id,
            item_type=item_type,
            name=name,
            next_due_date=next_due_date,
            last_checked_at=last_checked_at,
            status=BuildingSafetyItemStatus.ACTIVE,
            notes=notes,
        )
        db.add(item)
    else:
        item.site_id = site.id
        item.item_type = item_type
        item.next_due_date = next_due_date
        item.last_checked_at = last_checked_at
        item.status = BuildingSafetyItemStatus.ACTIVE
        item.notes = notes
    db.flush()
    return item


def _upsert_duerp_entry(
    db: Session,
    organization: Organization,
    *,
    site: OrganizationSite,
    work_unit_name: str,
    risk_label: str,
    severity: DuerpSeverity,
    prevention_action: str,
) -> DuerpEntry:
    entry = db.execute(
        select(DuerpEntry).where(
            DuerpEntry.organization_id == organization.id,
            DuerpEntry.deleted_at.is_(None),
            DuerpEntry.work_unit_name == work_unit_name,
            DuerpEntry.risk_label == risk_label,
        )
    ).scalar_one_or_none()
    if entry is None:
        entry = DuerpEntry(
            organization_id=organization.id,
            site_id=site.id,
            work_unit_name=work_unit_name,
            risk_label=risk_label,
            severity=severity,
            prevention_action=prevention_action,
            status=DuerpEntryStatus.ACTIVE,
        )
        db.add(entry)
    else:
        entry.site_id = site.id
        entry.severity = severity
        entry.prevention_action = prevention_action
        entry.status = DuerpEntryStatus.ACTIVE
    db.flush()
    return entry


def _upsert_regulatory_document(
    db: Session,
    organization: Organization,
    *,
    uploaded_by_user_id,
    attached_to_entity_type: str,
    attached_to_entity_id,
    attached_to_field: str | None,
    file_name: str,
    document_type: str,
    status: DocumentStatus,
    uploaded_at: datetime,
    notes: str,
) -> Document:
    document = db.execute(
        select(Document).where(
            Document.organization_id == organization.id,
            Document.deleted_at.is_(None),
            Document.source == "regulation",
            Document.file_name == file_name,
        )
    ).scalar_one_or_none()

    if document is None:
        document = Document(
            organization_id=organization.id,
            attached_to_entity_type=attached_to_entity_type,
            attached_to_entity_id=attached_to_entity_id,
            attached_to_field=attached_to_field,
            uploaded_by_user_id=uploaded_by_user_id,
            linked_proof_document_ids=[],
            document_type=document_type,
            source="regulation",
            lifecycle_status=None,
            status=status,
            file_name=file_name,
            uploaded_at=uploaded_at,
            notes=notes,
        )
        db.add(document)
    else:
        document.attached_to_entity_type = attached_to_entity_type
        document.attached_to_entity_id = attached_to_entity_id
        document.attached_to_field = attached_to_field
        document.uploaded_by_user_id = uploaded_by_user_id
        document.document_type = document_type
        document.status = status
        document.uploaded_at = uploaded_at
        document.notes = notes
    db.flush()
    return document


def _build_billing_line_items(
    *items: tuple[str, int, int],
) -> tuple[list[dict[str, int | str]], int]:
    line_items: list[dict[str, int | str]] = []
    subtotal_amount_cents = 0
    for description, quantity, unit_price_cents in items:
        line_total_cents = quantity * unit_price_cents
        line_items.append(
            {
                "description": description,
                "quantity": quantity,
                "unit_price_cents": unit_price_cents,
                "line_total_cents": line_total_cents,
            }
        )
        subtotal_amount_cents += line_total_cents
    return line_items, subtotal_amount_cents


def _upsert_billing_customer(
    db: Session,
    organization: Organization,
    *,
    name: str,
    customer_type: BillingCustomerType,
    email: str,
    phone: str,
    address: str,
    notes: str,
) -> BillingCustomer:
    customer = db.execute(
        select(BillingCustomer).where(
            BillingCustomer.organization_id == organization.id,
            BillingCustomer.deleted_at.is_(None),
            BillingCustomer.name == name,
        )
    ).scalar_one_or_none()
    if customer is None:
        customer = BillingCustomer(
            organization_id=organization.id,
            name=name,
            customer_type=customer_type,
            email=email,
            phone=phone,
            address=address,
            notes=notes,
        )
        db.add(customer)
    else:
        customer.customer_type = customer_type
        customer.email = email
        customer.phone = phone
        customer.address = address
        customer.notes = notes
    db.flush()
    return customer


def _upsert_quote(
    db: Session,
    organization: Organization,
    *,
    customer: BillingCustomer,
    worksite: Worksite | None,
    sequence_number: int,
    number: str,
    title: str,
    issue_date: date,
    valid_until: date | None,
    status: QuoteStatus,
    follow_up_status: str,
    line_items: list[dict[str, int | str]],
    subtotal_amount_cents: int,
    notes: str,
) -> Quote:
    quote = db.execute(
        select(Quote).where(
            Quote.organization_id == organization.id,
            Quote.deleted_at.is_(None),
            Quote.number == number,
        )
    ).scalar_one_or_none()
    if quote is None:
        quote = Quote(
            organization_id=organization.id,
            customer_id=customer.id,
            worksite_id=worksite.id if worksite is not None else None,
            sequence_number=sequence_number,
            number=number,
            title=title,
            issue_date=issue_date,
            valid_until=valid_until,
            status=status,
            currency="EUR",
            follow_up_status=follow_up_status,
            line_items=line_items,
            subtotal_amount_cents=subtotal_amount_cents,
            total_amount_cents=subtotal_amount_cents,
            notes=notes,
        )
        db.add(quote)
    else:
        quote.customer_id = customer.id
        quote.worksite_id = worksite.id if worksite is not None else None
        quote.sequence_number = sequence_number
        quote.title = title
        quote.issue_date = issue_date
        quote.valid_until = valid_until
        quote.status = status
        quote.currency = "EUR"
        quote.follow_up_status = follow_up_status
        quote.line_items = line_items
        quote.subtotal_amount_cents = subtotal_amount_cents
        quote.total_amount_cents = subtotal_amount_cents
        quote.notes = notes
    db.flush()
    return quote


def _upsert_invoice(
    db: Session,
    organization: Organization,
    *,
    customer: BillingCustomer,
    worksite: Worksite | None,
    sequence_number: int,
    number: str,
    title: str,
    issue_date: date,
    due_date: date | None,
    status: InvoiceStatus,
    follow_up_status: str,
    line_items: list[dict[str, int | str]],
    subtotal_amount_cents: int,
    paid_amount_cents: int,
    paid_at: date | None,
    notes: str,
) -> Invoice:
    invoice = db.execute(
        select(Invoice).where(
            Invoice.organization_id == organization.id,
            Invoice.deleted_at.is_(None),
            Invoice.number == number,
        )
    ).scalar_one_or_none()
    if invoice is None:
        invoice = Invoice(
            organization_id=organization.id,
            customer_id=customer.id,
            worksite_id=worksite.id if worksite is not None else None,
            sequence_number=sequence_number,
            number=number,
            title=title,
            issue_date=issue_date,
            due_date=due_date,
            status=status,
            currency="EUR",
            follow_up_status=follow_up_status,
            line_items=line_items,
            subtotal_amount_cents=subtotal_amount_cents,
            total_amount_cents=subtotal_amount_cents,
            paid_amount_cents=paid_amount_cents,
            paid_at=paid_at,
            notes=notes,
        )
        db.add(invoice)
    else:
        invoice.customer_id = customer.id
        invoice.worksite_id = worksite.id if worksite is not None else None
        invoice.sequence_number = sequence_number
        invoice.title = title
        invoice.issue_date = issue_date
        invoice.due_date = due_date
        invoice.status = status
        invoice.currency = "EUR"
        invoice.follow_up_status = follow_up_status
        invoice.line_items = line_items
        invoice.subtotal_amount_cents = subtotal_amount_cents
        invoice.total_amount_cents = subtotal_amount_cents
        invoice.paid_amount_cents = paid_amount_cents
        invoice.paid_at = paid_at
        invoice.notes = notes
    db.flush()
    return invoice


def _upsert_worksite(
    db: Session,
    organization: Organization,
    *,
    site: OrganizationSite | None,
    name: str,
    status: WorksiteStatus,
    description: str | None,
    planned_for: datetime | None,
) -> Worksite:
    worksite = db.execute(
        select(Worksite).where(
            Worksite.organization_id == organization.id,
            Worksite.deleted_at.is_(None),
            Worksite.name == name,
        )
    ).scalar_one_or_none()

    if worksite is None:
        worksite = Worksite(
            organization_id=organization.id,
            site_id=site.id if site is not None else None,
            name=name,
            description=description,
            status=status,
            planned_for=planned_for,
        )
        db.add(worksite)
    else:
        worksite.site_id = site.id if site is not None else None
        worksite.description = description
        worksite.status = status
        worksite.planned_for = planned_for

    db.flush()
    return worksite


def _upsert_worksite_intervention(
    db: Session,
    organization: Organization,
    *,
    worksite: Worksite,
    intervention_type: WorksiteInterventionType,
    status: WorksiteInterventionStatus,
    scheduled_for: datetime | None,
    completed_at: datetime | None,
    result: WorksiteInterventionResult | None,
    team: OrganizationTeam | None,
    assignee_user: User | None,
    notes: str | None,
    report_comment: str | None = None,
    follow_up_note: str | None = None,
) -> WorksiteIntervention:
    intervention = db.execute(
        select(WorksiteIntervention).where(
            WorksiteIntervention.organization_id == organization.id,
            WorksiteIntervention.deleted_at.is_(None),
            WorksiteIntervention.worksite_id == worksite.id,
            WorksiteIntervention.intervention_type == intervention_type,
            WorksiteIntervention.notes == notes,
        )
    ).scalar_one_or_none()

    if intervention is None:
        intervention = WorksiteIntervention(
            organization_id=organization.id,
            worksite_id=worksite.id,
            intervention_type=intervention_type,
            status=status,
            scheduled_for=scheduled_for,
            completed_at=completed_at,
            result=result,
            team_id=team.id if team is not None else None,
            assignee_user_id=assignee_user.id if assignee_user is not None else None,
            notes=notes,
            report_comment=report_comment,
            follow_up_note=follow_up_note,
        )
        db.add(intervention)
    else:
        intervention.status = status
        intervention.scheduled_for = scheduled_for
        intervention.completed_at = completed_at
        intervention.result = result
        intervention.team_id = team.id if team is not None else None
        intervention.assignee_user_id = assignee_user.id if assignee_user is not None else None
        intervention.notes = notes
        intervention.report_comment = report_comment
        intervention.follow_up_note = follow_up_note

    db.flush()
    return intervention


def _upsert_worksite_equipment(
    db: Session,
    organization: Organization,
    *,
    worksite: Worksite | None,
    name: str,
    equipment_type: str,
    status: WorksiteEquipmentStatus,
) -> WorksiteEquipment:
    equipment = db.execute(
        select(WorksiteEquipment).where(
            WorksiteEquipment.organization_id == organization.id,
            WorksiteEquipment.deleted_at.is_(None),
            WorksiteEquipment.name == name,
        )
    ).scalar_one_or_none()

    if equipment is None:
        equipment = WorksiteEquipment(
            organization_id=organization.id,
            worksite_id=worksite.id if worksite is not None else None,
            name=name,
            equipment_type=equipment_type,
            status=status,
        )
        db.add(equipment)
    else:
        equipment.worksite_id = worksite.id if worksite is not None else None
        equipment.equipment_type = equipment_type
        equipment.status = status

    db.flush()
    return equipment


def _upsert_worksite_equipment_movement(
    db: Session,
    organization: Organization,
    *,
    worksite: Worksite,
    equipment: WorksiteEquipment,
    movement_type: WorksiteEquipmentMovementType,
    resulting_status: WorksiteEquipmentStatus,
    actor_user: User | None,
    actor_display_name: str | None = None,
    captured_at: datetime,
) -> WorksiteEquipmentMovement:
    movement = db.execute(
        select(WorksiteEquipmentMovement).where(
            WorksiteEquipmentMovement.organization_id == organization.id,
            WorksiteEquipmentMovement.deleted_at.is_(None),
            WorksiteEquipmentMovement.worksite_id == worksite.id,
            WorksiteEquipmentMovement.equipment_id == equipment.id,
            WorksiteEquipmentMovement.movement_type == movement_type,
            WorksiteEquipmentMovement.captured_at == captured_at,
        )
    ).scalar_one_or_none()

    if movement is None:
        movement = WorksiteEquipmentMovement(
            organization_id=organization.id,
            worksite_id=worksite.id,
            equipment_id=equipment.id,
            movement_type=movement_type,
            resulting_status=resulting_status,
            actor_user_id=actor_user.id if actor_user is not None else None,
            actor_display_name=actor_display_name or (actor_user.display_name if actor_user is not None else None),
            sync_status="synced",
            captured_at=captured_at,
        )
        db.add(movement)
    else:
        movement.resulting_status = resulting_status
        movement.actor_user_id = actor_user.id if actor_user is not None else None
        movement.actor_display_name = actor_display_name or (
            actor_user.display_name if actor_user is not None else None
        )
        movement.sync_status = "synced"
        movement.captured_at = captured_at

    db.flush()
    return movement


def seed_demo_workspace(db: Session, payload: SeedDemoWorkspaceInput) -> SeedDemoWorkspaceResult:
    try:
        organization = _find_organization(db, payload.organization_slug)
        _ensure_administration_seed_prerequisites(db)
        cleaned_records = _clean_demo_records(db, organization)
        db.flush()

        if payload.clean_only:
            db.commit()
            return SeedDemoWorkspaceResult(
                organization_id=str(organization.id),
                organization_slug=organization.slug,
                created_sites=0,
                updated_sites=0,
                building_safety_items=0,
                duerp_entries=0,
                regulatory_documents=0,
                worksites=0,
                worksite_equipments=0,
                equipment_movements=0,
                billing_customers=0,
                quotes=0,
                invoices=0,
                cleaned_records=cleaned_records,
            )

        actor_user = _find_actor_user(db, organization.id)
        uploaded_by_user_id = actor_user.id if actor_user is not None else None

        organization.name = DEMO_ORGANIZATION_NAME
        organization.legal_name = DEMO_ORGANIZATION_LEGAL_NAME
        organization.activity_label = DEMO_ORGANIZATION_ACTIVITY
        organization.employee_count = 9
        organization.has_employees = True
        organization.receives_public = True
        organization.stores_hazardous_products = True
        organization.performs_high_risk_work = True
        organization.contact_email = DEMO_ORGANIZATION_CONTACT_EMAIL
        organization.contact_phone = DEMO_ORGANIZATION_CONTACT_PHONE
        organization.headquarters_address = DEMO_ORGANIZATION_HEADQUARTERS
        organization.onboarding_completed_at = datetime.now(timezone.utc)
        organization.notes = DEMO_ORGANIZATION_NOTES

        admin_user = _upsert_demo_user(
            db,
            email="pauline.admin@conformeo.local",
            first_name="Pauline",
            last_name="Admin",
            phone="0670001000",
            status=UserStatus.ACTIVE,
            password_hash=hash_password("Secret123!"),
        )
        manager_user = _upsert_demo_user(
            db,
            email="nora.manager@conformeo.local",
            first_name="Nora",
            last_name="Manager",
            phone="0670002000",
            status=UserStatus.ACTIVE,
            password_hash=hash_password("Secret123!"),
        )
        contributor_user = _upsert_demo_user(
            db,
            email="yanis.terrain@conformeo.local",
            first_name="Yanis",
            last_name="Terrain",
            phone="0670003000",
            status=UserStatus.ACTIVE,
            password_hash=hash_password("Secret123!"),
        )
        viewer_user = _upsert_demo_user(
            db,
            email="clara.viewer@conformeo.local",
            first_name="Clara",
            last_name="Viewer",
            phone="0670004000",
            status=UserStatus.ACTIVE,
            password_hash=hash_password("Secret123!"),
        )

        _upsert_organization_membership(
            db,
            organization,
            user=admin_user,
            role_code="admin",
        )
        _upsert_organization_membership(
            db,
            organization,
            user=manager_user,
            role_code="manager",
        )
        _upsert_organization_membership(
            db,
            organization,
            user=contributor_user,
            role_code="contributor",
        )
        _upsert_organization_membership(
            db,
            organization,
            user=viewer_user,
            role_code="viewer",
        )

        erp_team = _upsert_team(
            db,
            organization,
            name="Equipe interventions ERP",
            description="Equipe mobile pour les interventions en site occupe et les verifications de reprise.",
            member_user_ids=[manager_user.id, contributor_user.id],
        )
        saint_ouen_team = _upsert_team(
            db,
            organization,
            name="Equipe logistique Saint-Ouen",
            description="Equipe chargee de la preparation depot, du balisage et du stockage sensible.",
            member_user_ids=[admin_user.id, contributor_user.id],
        )

        created_sites = 0
        updated_sites = 0

        now = datetime.now(timezone.utc)
        today = date.today()

        rivoli_site, rivoli_created = _upsert_site(
            db,
            organization,
            name=RIVOLI_SITE_NAME,
            address="10 rue de Rivoli, 75001 Paris",
            site_type=OrganizationSiteType.BUILDING,
            normalized_address="10 Rue de Rivoli, 75001 Paris",
            latitude=48.8556,
            longitude=2.3609,
            geocoding_score=0.97,
            enrichment_status="enriched",
            enrichment_reason=None,
            risk_level="medium",
            risk_summary="Site exploitable avec accueil public, circulation limitee et suivi des verifications periodiques a maintenir.",
            risk_items=[
                {"label": "Accueil public", "level": "modere"},
                {"label": "Travaux en site occupe", "level": "moyen"},
            ],
        )
        created_sites += 1 if rivoli_created else 0
        updated_sites += 0 if rivoli_created else 1

        saint_ouen_site, saint_ouen_created = _upsert_site(
            db,
            organization,
            name=SAINT_OUEN_SITE_NAME,
            address="18 rue des Rosiers, 93400 Saint-Ouen-sur-Seine",
            site_type=OrganizationSiteType.WAREHOUSE,
            normalized_address="18 Rue des Rosiers, 93400 Saint-Ouen-sur-Seine",
            latitude=48.9127,
            longitude=2.3334,
            geocoding_score=0.92,
            enrichment_status="partial",
            enrichment_reason="risk_provider_unavailable",
            risk_level="medium",
            risk_summary="Adresse reconnue mais enrichissement incomplet. Les zones de stockage sensible et le plan de circulation restent a consolider.",
            risk_items=[
                {"label": "Stockage sensible", "level": "moyen"},
                {"label": "Circulation engins", "level": "modere"},
            ],
        )
        created_sites += 1 if saint_ouen_created else 0
        updated_sites += 0 if saint_ouen_created else 1

        victor_hugo_site, victor_hugo_created = _upsert_site(
            db,
            organization,
            name=VICTOR_HUGO_SITE_NAME,
            address="22 avenue Victor-Hugo, 75116 Paris",
            site_type=OrganizationSiteType.BUILDING,
            normalized_address="22 Avenue Victor-Hugo, 75116 Paris",
            latitude=48.8701,
            longitude=2.2834,
            geocoding_score=0.91,
            enrichment_status="failed",
            enrichment_reason="provider_unavailable",
            risk_level=None,
            risk_summary=None,
            risk_items=None,
        )
        created_sites += 1 if victor_hugo_created else 0
        updated_sites += 0 if victor_hugo_created else 1

        _upsert_building_safety_item(
            db,
            organization,
            site=rivoli_site,
            name=RIVOLI_PERIODIC_CHECK_NAME,
            item_type=BuildingSafetyItemType.PERIODIC_CHECK,
            next_due_date=today - timedelta(days=18),
            last_checked_at=today - timedelta(days=380),
            notes="Controle volontairement en retard pour faire ressortir une priorite critique dans la synthese.",
        )
        saint_ouen_extinguisher = _upsert_building_safety_item(
            db,
            organization,
            site=saint_ouen_site,
            name=SAINT_OUEN_EXTINGUISHER_NAME,
            item_type=BuildingSafetyItemType.FIRE_EXTINGUISHER,
            next_due_date=today + timedelta(days=18),
            last_checked_at=today - timedelta(days=347),
            notes="Echeance proche pour illustrer un suivi a verifier sans etre encore bloque.",
        )
        _upsert_building_safety_item(
            db,
            organization,
            site=victor_hugo_site,
            name=VICTOR_HUGO_ALARM_NAME,
            item_type=BuildingSafetyItemType.DAE,
            next_due_date=today + timedelta(days=180),
            last_checked_at=today - timedelta(days=40),
            notes="Point securite en place sur un site dont l'enrichissement reste en echec.",
        )

        _upsert_duerp_entry(
            db,
            organization,
            site=rivoli_site,
            work_unit_name=RIVOLI_DUERP_WORK_UNIT_NAME,
            risk_label=RIVOLI_DUERP_RISK_LABEL,
            severity=DuerpSeverity.HIGH,
            prevention_action="Balisage, aspiration a la source, FFP2 et gestion simple de la coactivite.",
        )
        _upsert_duerp_entry(
            db,
            organization,
            site=saint_ouen_site,
            work_unit_name=SAINT_OUEN_DUERP_WORK_UNIT_NAME,
            risk_label=SAINT_OUEN_DUERP_RISK_LABEL,
            severity=DuerpSeverity.MEDIUM,
            prevention_action="Plan de circulation, zone de stockage claire et manutention a deux pour les charges longues.",
        )

        rivoli_worksite = _upsert_worksite(
            db,
            organization,
            site=rivoli_site,
            name=RIVOLI_WORKSITE_NAME,
            status=WorksiteStatus.IN_PROGRESS,
            description="Intervention en site occupe deja lancee, avec priorite sur confinement et accueil public.",
            planned_for=now - timedelta(days=2),
        )
        saint_ouen_worksite = _upsert_worksite(
            db,
            organization,
            site=saint_ouen_site,
            name=SAINT_OUEN_WORKSITE_NAME,
            status=WorksiteStatus.PLANNED,
            description="Chantier a preparer avec ventilation, balisage et organisation du stockage sensible.",
            planned_for=now + timedelta(days=4),
        )
        victor_hugo_worksite = _upsert_worksite(
            db,
            organization,
            site=victor_hugo_site,
            name=VICTOR_HUGO_WORKSITE_NAME,
            status=WorksiteStatus.BLOCKED,
            description="Demarrage bloque tant que l'adresse n'est pas consolidee et que le point electrique n'est pas regularise.",
            planned_for=now + timedelta(days=2),
        )

        rivoli_coordination = ensure_worksite_coordination_item(
            db,
            organization.id,
            target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
            target_id=rivoli_worksite.id,
        )
        rivoli_coordination.team_id = erp_team.id
        rivoli_coordination.assignee_user_id = manager_user.id
        rivoli_coordination.status = "in_progress"
        rivoli_coordination.comment_text = "Equipe ERP mobilisee, accueil public a baliser avant la reprise complete."

        saint_ouen_coordination = ensure_worksite_coordination_item(
            db,
            organization.id,
            target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
            target_id=saint_ouen_worksite.id,
        )
        saint_ouen_coordination.team_id = saint_ouen_team.id
        saint_ouen_coordination.assignee_user_id = None
        saint_ouen_coordination.status = "todo"
        saint_ouen_coordination.comment_text = "Equipe logistique pre-affectee, referent chantier a definir avant preparation."

        victor_hugo_coordination = ensure_worksite_coordination_item(
            db,
            organization.id,
            target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
            target_id=victor_hugo_worksite.id,
        )
        victor_hugo_coordination.team_id = None
        victor_hugo_coordination.assignee_user_id = None
        victor_hugo_coordination.status = "todo"
        victor_hugo_coordination.comment_text = "Aucune equipe affectee tant que le blocage terrain n'est pas leve."

        _upsert_worksite_intervention(
            db,
            organization,
            worksite=rivoli_worksite,
            intervention_type=WorksiteInterventionType.PREPARATION,
            status=WorksiteInterventionStatus.DONE,
            scheduled_for=now - timedelta(days=4),
            completed_at=now - timedelta(days=3, hours=2),
            result=WorksiteInterventionResult.COMPLETED,
            team=erp_team,
            assignee_user=manager_user,
            notes=RIVOLI_INTERVENTION_PREPARATION_NOTE,
            report_comment="Préparation réalisée avec balisage, confinement et accueil posés.",
            follow_up_note="Intervention équipe maintenue selon le créneau prévu.",
        )
        _upsert_worksite_intervention(
            db,
            organization,
            worksite=rivoli_worksite,
            intervention_type=WorksiteInterventionType.TEAM_INTERVENTION,
            status=WorksiteInterventionStatus.PLANNED,
            scheduled_for=now + timedelta(days=1, hours=2),
            completed_at=None,
            result=None,
            team=erp_team,
            assignee_user=manager_user,
            notes=RIVOLI_INTERVENTION_TEAM_NOTE,
        )
        _upsert_worksite_intervention(
            db,
            organization,
            worksite=saint_ouen_worksite,
            intervention_type=WorksiteInterventionType.PREPARATION,
            status=WorksiteInterventionStatus.TO_SCHEDULE,
            scheduled_for=None,
            completed_at=None,
            result=None,
            team=saint_ouen_team,
            assignee_user=None,
            notes=SAINT_OUEN_INTERVENTION_NOTE,
        )
        _upsert_worksite_intervention(
            db,
            organization,
            worksite=victor_hugo_worksite,
            intervention_type=WorksiteInterventionType.VERIFICATION,
            status=WorksiteInterventionStatus.PLANNED,
            scheduled_for=now - timedelta(days=1, hours=3),
            completed_at=None,
            result=None,
            team=None,
            assignee_user=None,
            notes=VICTOR_HUGO_INTERVENTION_NOTE,
        )

        rivoli_extracteur = _upsert_worksite_equipment(
            db,
            organization,
            worksite=rivoli_worksite,
            name=PARIS_EQUIPMENT_PRIMARY_NAME,
            equipment_type="Extraction",
            status=WorksiteEquipmentStatus.ATTENTION,
        )
        rivoli_armoire = _upsert_worksite_equipment(
            db,
            organization,
            worksite=rivoli_worksite,
            name=PARIS_EQUIPMENT_SECONDARY_NAME,
            equipment_type="Pilotage",
            status=WorksiteEquipmentStatus.READY,
        )
        rivoli_confinement = _upsert_worksite_equipment(
            db,
            organization,
            worksite=rivoli_worksite,
            name=PARIS_EQUIPMENT_CONFINEMENT_NAME,
            equipment_type="Protection chantier",
            status=WorksiteEquipmentStatus.READY,
        )
        saint_ouen_ladder = _upsert_worksite_equipment(
            db,
            organization,
            worksite=saint_ouen_worksite,
            name=SAINT_OUEN_EQUIPMENT_LADDER_NAME,
            equipment_type="Acces hauteur",
            status=WorksiteEquipmentStatus.READY,
        )
        saint_ouen_barricade = _upsert_worksite_equipment(
            db,
            organization,
            worksite=saint_ouen_worksite,
            name=SAINT_OUEN_EQUIPMENT_BARRICADE_NAME,
            equipment_type="Balisage / securite",
            status=WorksiteEquipmentStatus.READY,
        )
        saint_ouen_fan = _upsert_worksite_equipment(
            db,
            organization,
            worksite=saint_ouen_worksite,
            name=SAINT_OUEN_EQUIPMENT_FAN_NAME,
            equipment_type="Ventilation",
            status=WorksiteEquipmentStatus.ATTENTION,
        )
        victor_hugo_electric_box = _upsert_worksite_equipment(
            db,
            organization,
            worksite=victor_hugo_worksite,
            name=VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME,
            equipment_type="Alimentation / securite electrique",
            status=WorksiteEquipmentStatus.UNAVAILABLE,
        )
        unassigned_light = _upsert_worksite_equipment(
            db,
            organization,
            worksite=None,
            name=UNASSIGNED_EQUIPMENT_LIGHT_NAME,
            equipment_type="Eclairage",
            status=WorksiteEquipmentStatus.READY,
        )
        unassigned_drill = _upsert_worksite_equipment(
            db,
            organization,
            worksite=None,
            name=UNASSIGNED_EQUIPMENT_DRILL_NAME,
            equipment_type="Outillage electroportatif",
            status=WorksiteEquipmentStatus.READY,
        )
        unassigned_sensor = _upsert_worksite_equipment(
            db,
            organization,
            worksite=None,
            name=UNASSIGNED_EQUIPMENT_SENSOR_NAME,
            equipment_type="Mesure environnementale",
            status=WorksiteEquipmentStatus.ATTENTION,
        )

        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=rivoli_worksite,
            equipment=rivoli_extracteur,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=6),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=rivoli_worksite,
            equipment=rivoli_extracteur,
            movement_type=WorksiteEquipmentMovementType.MARKED_DAMAGED,
            resulting_status=WorksiteEquipmentStatus.ATTENTION,
            actor_user=actor_user,
            captured_at=now - timedelta(days=1, hours=3),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=rivoli_worksite,
            equipment=rivoli_armoire,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=5, hours=3),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=rivoli_worksite,
            equipment=rivoli_confinement,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=4, hours=2),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=saint_ouen_worksite,
            equipment=saint_ouen_ladder,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=3),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=saint_ouen_worksite,
            equipment=saint_ouen_barricade,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=2, hours=6),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=saint_ouen_worksite,
            equipment=saint_ouen_fan,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.ATTENTION,
            actor_user=actor_user,
            captured_at=now - timedelta(days=2),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=saint_ouen_worksite,
            equipment=unassigned_light,
            movement_type=WorksiteEquipmentMovementType.REMOVED_FROM_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=None,
            actor_display_name=SECONDARY_ACTOR_NAME,
            captured_at=now - timedelta(hours=9),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=rivoli_worksite,
            equipment=unassigned_drill,
            movement_type=WorksiteEquipmentMovementType.REMOVED_FROM_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(hours=7),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=saint_ouen_worksite,
            equipment=unassigned_sensor,
            movement_type=WorksiteEquipmentMovementType.MARKED_DAMAGED,
            resulting_status=WorksiteEquipmentStatus.ATTENTION,
            actor_user=actor_user,
            captured_at=now - timedelta(hours=5),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=victor_hugo_worksite,
            equipment=victor_hugo_electric_box,
            movement_type=WorksiteEquipmentMovementType.ASSIGNED_TO_WORKSITE,
            resulting_status=WorksiteEquipmentStatus.READY,
            actor_user=actor_user,
            captured_at=now - timedelta(days=1, hours=5),
        )
        _upsert_worksite_equipment_movement(
            db,
            organization,
            worksite=victor_hugo_worksite,
            equipment=victor_hugo_electric_box,
            movement_type=WorksiteEquipmentMovementType.MARKED_DAMAGED,
            resulting_status=WorksiteEquipmentStatus.UNAVAILABLE,
            actor_user=actor_user,
            captured_at=now - timedelta(hours=2),
        )

        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization",
            attached_to_entity_id=organization.id,
            attached_to_field="regulatory_obligation:reg-employees-register",
            file_name=EMPLOYEE_REGISTER_PROOF_FILE,
            document_type="Registre du personnel",
            status=DocumentStatus.AVAILABLE,
            uploaded_at=now - timedelta(days=14),
            notes="Registre du personnel a jour pour illustrer une obligation conforme.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization_site",
            attached_to_entity_id=rivoli_site.id,
            attached_to_field=None,
            file_name=EMERGENCY_CONTACTS_PROOF_FILE,
            document_type="Consignes et contacts d'urgence",
            status=DocumentStatus.AVAILABLE,
            uploaded_at=now - timedelta(days=8),
            notes="Consignes d'urgence en place sur le site recevant du public.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization",
            attached_to_entity_id=organization.id,
            attached_to_field="regulatory_obligation:reg-buildings-periodic-checks",
            file_name=BUILDING_CHECKS_PLAN_FILE,
            document_type="Plan de verifications periodiques",
            status=DocumentStatus.PENDING,
            uploaded_at=now - timedelta(days=4),
            notes="Plan depose mais encore a regulariser alors qu'un controle Rivoli est deja en retard.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="building_safety_item",
            attached_to_entity_id=saint_ouen_extinguisher.id,
            attached_to_field=None,
            file_name=EXTINGUISHER_PROOF_FILE,
            document_type="Controle extincteur",
            status=DocumentStatus.AVAILABLE,
            uploaded_at=now - timedelta(days=20),
            notes="Dernier controle disponible sur un equipement encore a surveiller a courte echeance.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization_site",
            attached_to_entity_id=victor_hugo_site.id,
            attached_to_field=None,
            file_name=VICTOR_HUGO_ACCESS_PROOF_FILE,
            document_type="Autorisation d'acces",
            status=DocumentStatus.FAILED,
            uploaded_at=now - timedelta(days=2),
            notes="Piece rattachee mais inexploitable pour illustrer une regularisation documentaire.",
        )

        rivoli_customer = _upsert_billing_customer(
            db,
            organization,
            name=RIVOLI_CUSTOMER_NAME,
            customer_type=BillingCustomerType.COMPANY,
            email="gestion@rivoli-conseil.fr",
            phone="0142221000",
            address="10 rue de Rivoli, 75001 Paris",
            notes="Client recurrent avec plusieurs flux devis / facture / paiement.",
        )
        saint_ouen_customer = _upsert_billing_customer(
            db,
            organization,
            name=SAINT_OUEN_CUSTOMER_NAME,
            customer_type=BillingCustomerType.COMPANY,
            email="admin@ateliers-saint-ouen.fr",
            phone="0189004200",
            address="18 rue des Rosiers, 93400 Saint-Ouen-sur-Seine",
            notes="Client logistique avec chantier a preparer et encours partiel.",
        )
        victor_hugo_customer = _upsert_billing_customer(
            db,
            organization,
            name=VICTOR_HUGO_CUSTOMER_NAME,
            customer_type=BillingCustomerType.COMPANY,
            email="travaux@clinique-victor-hugo.fr",
            phone="0145007700",
            address="22 avenue Victor-Hugo, 75116 Paris",
            notes="Client sensible avec devis a relancer et facture en retard.",
        )

        draft_quote_lines, draft_quote_total = _build_billing_line_items(
            ("Diagnostic accueil et protections provisoires", 1, 180000),
            ("Reprise eclairage et petite signaletique", 1, 156000),
        )
        sent_quote_lines, sent_quote_total = _build_billing_line_items(
            ("Preparation ventilation temporaire depot", 1, 265000),
            ("Balisage circulation et stockage", 1, 148000),
        )
        followup_quote_lines, followup_quote_total = _build_billing_line_items(
            ("Mise en securite electrique zone B", 1, 310000),
            ("Confinement et protections usagers", 1, 228000),
        )
        accepted_quote_lines, accepted_quote_total = _build_billing_line_items(
            ("Complement balisage accueil public", 1, 132000),
            ("Protections poussieres espace recevant du public", 1, 88000),
        )

        _upsert_quote(
            db,
            organization,
            customer=rivoli_customer,
            worksite=rivoli_worksite,
            sequence_number=1,
            number="DEV-2026-001",
            title="Devis remise a niveau accueil Rivoli",
            issue_date=today - timedelta(days=2),
            valid_until=today + timedelta(days=28),
            status=QuoteStatus.DRAFT,
            follow_up_status="normal",
            line_items=draft_quote_lines,
            subtotal_amount_cents=draft_quote_total,
            notes="Brouillon conserve pour tester la lecture 'pret a envoyer'.",
        )
        _upsert_quote(
            db,
            organization,
            customer=saint_ouen_customer,
            worksite=saint_ouen_worksite,
            sequence_number=2,
            number="DEV-2026-002",
            title="Devis ventilation et balisage depot Saint-Ouen",
            issue_date=today - timedelta(days=9),
            valid_until=today + timedelta(days=6),
            status=QuoteStatus.SENT,
            follow_up_status="normal",
            line_items=sent_quote_lines,
            subtotal_amount_cents=sent_quote_total,
            notes="Devis envoye, encore dans sa fenetre de validite.",
        )
        _upsert_quote(
            db,
            organization,
            customer=victor_hugo_customer,
            worksite=victor_hugo_worksite,
            sequence_number=3,
            number="DEV-2026-003",
            title="Devis mise en securite plateau Victor Hugo",
            issue_date=today - timedelta(days=18),
            valid_until=today - timedelta(days=3),
            status=QuoteStatus.SENT,
            follow_up_status="to_follow_up",
            line_items=followup_quote_lines,
            subtotal_amount_cents=followup_quote_total,
            notes="Devis envoye puis relance a faire tant que le client n'a pas valide.",
        )
        _upsert_quote(
            db,
            organization,
            customer=rivoli_customer,
            worksite=rivoli_worksite,
            sequence_number=4,
            number="DEV-2026-004",
            title="Devis complement balisage accueil Rivoli",
            issue_date=today - timedelta(days=15),
            valid_until=today + timedelta(days=10),
            status=QuoteStatus.ACCEPTED,
            follow_up_status="waiting_customer",
            line_items=accepted_quote_lines,
            subtotal_amount_cents=accepted_quote_total,
            notes="Devis accepte et pret a etre transforme en facture.",
        )

        draft_invoice_lines, draft_invoice_total = _build_billing_line_items(
            ("Acompte reamenagement accueil Rivoli", 1, 220000),
        )
        pending_invoice_lines, pending_invoice_total = _build_billing_line_items(
            ("Phase 1 ventilation depot Saint-Ouen", 1, 342000),
            ("Mise en place balisage et marquage", 1, 168000),
        )
        overdue_invoice_lines, overdue_invoice_total = _build_billing_line_items(
            ("Mise en securite electrique plateau B", 1, 298000),
            ("Protections temporaires usagers", 1, 214000),
        )
        paid_invoice_lines, paid_invoice_total = _build_billing_line_items(
            ("Solde signaletique accueil Rivoli", 1, 188000),
            ("Ajustements finition et reception", 1, 104000),
        )
        partial_invoice_lines, partial_invoice_total = _build_billing_line_items(
            ("Approvisionnement stockage et base vie", 1, 420000),
            ("Ventilation provisoire et suivi depot", 1, 168000),
        )

        _upsert_invoice(
            db,
            organization,
            customer=rivoli_customer,
            worksite=rivoli_worksite,
            sequence_number=1,
            number="FAC-2026-001",
            title="Acompte reamenagement accueil Rivoli",
            issue_date=today - timedelta(days=1),
            due_date=today + timedelta(days=14),
            status=InvoiceStatus.DRAFT,
            follow_up_status="normal",
            line_items=draft_invoice_lines,
            subtotal_amount_cents=draft_invoice_total,
            paid_amount_cents=0,
            paid_at=None,
            notes="Facture en brouillon pour tester la lecture 'a emettre'.",
        )
        _upsert_invoice(
            db,
            organization,
            customer=saint_ouen_customer,
            worksite=saint_ouen_worksite,
            sequence_number=2,
            number="FAC-2026-002",
            title="Phase 1 ventilation depot Saint-Ouen",
            issue_date=today - timedelta(days=6),
            due_date=today + timedelta(days=11),
            status=InvoiceStatus.ISSUED,
            follow_up_status="normal",
            line_items=pending_invoice_lines,
            subtotal_amount_cents=pending_invoice_total,
            paid_amount_cents=0,
            paid_at=None,
            notes="Facture emise avec paiement attendu, sans relance encore ouverte.",
        )
        _upsert_invoice(
            db,
            organization,
            customer=victor_hugo_customer,
            worksite=victor_hugo_worksite,
            sequence_number=3,
            number="FAC-2026-003",
            title="Mise en securite plateau Victor Hugo",
            issue_date=today - timedelta(days=28),
            due_date=today - timedelta(days=12),
            status=InvoiceStatus.OVERDUE,
            follow_up_status="to_follow_up",
            line_items=overdue_invoice_lines,
            subtotal_amount_cents=overdue_invoice_total,
            paid_amount_cents=0,
            paid_at=None,
            notes="Facture en retard pour tester relance et encaissement prioritaire.",
        )
        _upsert_invoice(
            db,
            organization,
            customer=rivoli_customer,
            worksite=rivoli_worksite,
            sequence_number=4,
            number="FAC-2026-004",
            title="Solde signaletique accueil Rivoli",
            issue_date=today - timedelta(days=20),
            due_date=today - timedelta(days=2),
            status=InvoiceStatus.PAID,
            follow_up_status="normal",
            line_items=paid_invoice_lines,
            subtotal_amount_cents=paid_invoice_total,
            paid_amount_cents=paid_invoice_total,
            paid_at=today - timedelta(days=4),
            notes="Facture soldée pour avoir un cas de paiement complet dans la demo.",
        )
        _upsert_invoice(
            db,
            organization,
            customer=saint_ouen_customer,
            worksite=saint_ouen_worksite,
            sequence_number=5,
            number="FAC-2026-005",
            title="Approvisionnement et balisage depot Saint-Ouen",
            issue_date=today - timedelta(days=16),
            due_date=today + timedelta(days=2),
            status=InvoiceStatus.ISSUED,
            follow_up_status="waiting_customer",
            line_items=partial_invoice_lines,
            subtotal_amount_cents=partial_invoice_total,
            paid_amount_cents=180000,
            paid_at=today - timedelta(days=7),
            notes="Facture partiellement reglee pour tester reste du et attente client.",
        )

        db.commit()
    except Exception:
        db.rollback()
        raise

    return SeedDemoWorkspaceResult(
        organization_id=str(organization.id),
        organization_slug=organization.slug,
        created_sites=created_sites,
        updated_sites=updated_sites,
        building_safety_items=len(DEMO_BUILDING_ITEM_NAMES),
        duerp_entries=len(DEMO_DUERP_KEYS),
        regulatory_documents=len(DEMO_DOCUMENT_FILES),
        worksites=len(DEMO_WORKSITE_NAMES),
        worksite_equipments=len(DEMO_EQUIPMENT_NAMES),
        equipment_movements=12,
        billing_customers=len(DEMO_CUSTOMER_NAMES),
        quotes=len(DEMO_QUOTE_NUMBERS),
        invoices=len(DEMO_INVOICE_NUMBERS),
        cleaned_records=cleaned_records,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Injecte un workspace de demonstration transverse pour les modules chantiers, "
            "reglementation et facturation."
        )
    )
    parser.add_argument(
        "--organization-slug",
        default=DEMO_ORGANIZATION_SLUG,
        help="Slug de l'organisation a enrichir. Defaut: conformeo-dev.",
    )
    parser.add_argument(
        "--clean-only",
        action="store_true",
        help="Supprime uniquement les donnees de demonstration connues sans les recreer.",
    )
    return parser


def run_seed_demo_workspace(
    argv: Sequence[str] | None = None,
    *,
    session_factory: sessionmaker[Session] | None = None,
    stdout=None,
    stderr=None,
) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    stdout = stdout or sys.stdout
    stderr = stderr or sys.stderr
    session_factory = session_factory or get_session_factory()

    session = session_factory()
    try:
        result = seed_demo_workspace(
            session,
            SeedDemoWorkspaceInput(
                organization_slug=args.organization_slug,
                clean_only=args.clean_only,
            ),
        )
    except DemoSeedError as exc:
        print(f"Erreur seed demo: {exc}", file=stderr)
        return 1
    except Exception as exc:  # pragma: no cover - defensive CLI path
        print(f"Erreur technique seed demo: {exc}", file=stderr)
        return 1
    finally:
        session.close()

    if args.clean_only:
        print(
            "Nettoyage demo termine. "
            f"organization_slug={result.organization_slug} cleaned_records={result.cleaned_records}",
            file=stdout,
        )
    else:
        print(
            "Seed demo termine. "
            f"organization_slug={result.organization_slug} "
            f"sites={result.created_sites + result.updated_sites} "
            f"worksites={result.worksites} "
            f"equipments={result.worksite_equipments} "
            f"equipment_movements={result.equipment_movements} "
            f"building_safety_items={result.building_safety_items} "
            f"duerp_entries={result.duerp_entries} "
            f"regulatory_documents={result.regulatory_documents} "
            f"billing_customers={result.billing_customers} "
            f"quotes={result.quotes} "
            f"invoices={result.invoices} "
            f"cleaned_records={result.cleaned_records}",
            file=stdout,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(run_seed_demo_workspace())
