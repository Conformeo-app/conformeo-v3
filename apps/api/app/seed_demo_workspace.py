from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.db.models import (
    BuildingSafetyItem,
    BuildingSafetyItemStatus,
    BuildingSafetyItemType,
    Document,
    DocumentStatus,
    DuerpEntry,
    DuerpEntryStatus,
    DuerpSeverity,
    Organization,
    OrganizationMembership,
    OrganizationSite,
    OrganizationSiteStatus,
    OrganizationSiteType,
    User,
)
from app.db.session import get_session_factory


DEMO_ORGANIZATION_NAME = "Conformeo Dev"
DEMO_ORGANIZATION_LEGAL_NAME = "Conformeo Dev"
DEMO_ORGANIZATION_SLUG = "conformeo-dev"
DEMO_ORGANIZATION_ACTIVITY = "BTP - renovation interieure"
DEMO_ORGANIZATION_CONTACT_EMAIL = "contact@conformeo.local"
DEMO_ORGANIZATION_CONTACT_PHONE = "0140000000"
DEMO_ORGANIZATION_HEADQUARTERS = "12 rue des Entrepreneurs, 75015 Paris"
DEMO_ORGANIZATION_NOTES = "Jeu de donnees de demonstration local pour la home et la regulation."

PARIS_SITE_NAME = "Chantier Paris Centre"
LYON_SITE_NAME = "Chantier Lyon Nord"
INVALID_SITE_NAME = "Chantier Test Invalide"

PARIS_PERIODIC_CHECK_NAME = "Verification electrique annuelle"
LYON_EXTINGUISHER_NAME = "Extincteur base vie"
DUERP_WORK_UNIT_NAME = "Renovation interieure en site occupe"
DUERP_RISK_LABEL = "Poussieres et coactivite"

DISPLAY_PROOF_FILE = "affichage-obligatoire-base-vie.pdf"
DUERP_PROOF_FILE = "trame-duerp-renovation-2026.pdf"
SAFETY_PROOF_FILE = "controle-extincteur-base-vie-2026.pdf"

DEMO_SOURCE_META = {"source": "demo_seed", "status": "manual_demo"}


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


def _clean_demo_records(db: Session, organization: Organization) -> int:
    cleaned_records = 0

    demo_documents = db.execute(
        select(Document).where(
            Document.organization_id == organization.id,
            Document.deleted_at.is_(None),
            Document.source == "regulation",
            Document.file_name.in_([DISPLAY_PROOF_FILE, DUERP_PROOF_FILE, SAFETY_PROOF_FILE]),
        )
    ).scalars().all()
    for document in demo_documents:
        db.delete(document)
        cleaned_records += 1

    demo_duerp_entries = db.execute(
        select(DuerpEntry).where(
            DuerpEntry.organization_id == organization.id,
            DuerpEntry.deleted_at.is_(None),
            DuerpEntry.work_unit_name == DUERP_WORK_UNIT_NAME,
            DuerpEntry.risk_label == DUERP_RISK_LABEL,
        )
    ).scalars().all()
    for entry in demo_duerp_entries:
        db.delete(entry)
        cleaned_records += 1

    demo_building_items = db.execute(
        select(BuildingSafetyItem).where(
            BuildingSafetyItem.organization_id == organization.id,
            BuildingSafetyItem.deleted_at.is_(None),
            BuildingSafetyItem.name.in_([PARIS_PERIODIC_CHECK_NAME, LYON_EXTINGUISHER_NAME]),
        )
    ).scalars().all()
    for item in demo_building_items:
        db.delete(item)
        cleaned_records += 1

    demo_sites = db.execute(
        select(OrganizationSite).where(
            OrganizationSite.organization_id == organization.id,
            OrganizationSite.deleted_at.is_(None),
            OrganizationSite.name.in_([PARIS_SITE_NAME, LYON_SITE_NAME, INVALID_SITE_NAME]),
        )
    ).scalars().all()
    for site in demo_sites:
        db.delete(site)
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
    site.address = address
    site.site_type = site_type
    site.status = OrganizationSiteStatus.ACTIVE
    site.normalized_address = normalized_address
    site.latitude = latitude
    site.longitude = longitude
    site.geocoding_score = geocoding_score
    site.location_source_meta = {
        **DEMO_SOURCE_META,
        "provider": "geoplateforme",
        "enrichment_status": enrichment_status,
    }
    site.location_last_synced_at = now
    site.location_enrichment_status = enrichment_status
    site.location_enrichment_attempted_at = now
    site.location_enrichment_last_error_reason = enrichment_reason
    site.site_risk_level = risk_level
    site.site_risk_summary = risk_summary
    site.site_risk_items = risk_items
    site.site_risk_source_meta = (
        [{"source": "demo_seed", "provider": "georisques", "status": "manual_demo"}]
        if risk_summary
        else None
    )
    site.site_risk_last_synced_at = now if risk_summary else None
    db.flush()
    return site, created


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
            status=DocumentStatus.AVAILABLE,
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
        document.status = DocumentStatus.AVAILABLE
        document.uploaded_at = uploaded_at
        document.notes = notes
    db.flush()
    return document


def seed_demo_workspace(db: Session, payload: SeedDemoWorkspaceInput) -> SeedDemoWorkspaceResult:
    try:
        organization = _find_organization(db, payload.organization_slug)
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
                cleaned_records=cleaned_records,
            )

        actor_user = _find_actor_user(db, organization.id)
        uploaded_by_user_id = actor_user.id if actor_user is not None else None

        organization.name = DEMO_ORGANIZATION_NAME
        organization.legal_name = DEMO_ORGANIZATION_LEGAL_NAME
        organization.activity_label = DEMO_ORGANIZATION_ACTIVITY
        organization.employee_count = 6
        organization.has_employees = True
        organization.receives_public = True
        organization.stores_hazardous_products = True
        organization.performs_high_risk_work = True
        organization.contact_email = DEMO_ORGANIZATION_CONTACT_EMAIL
        organization.contact_phone = DEMO_ORGANIZATION_CONTACT_PHONE
        organization.headquarters_address = DEMO_ORGANIZATION_HEADQUARTERS
        organization.onboarding_completed_at = datetime.now(timezone.utc)
        organization.notes = DEMO_ORGANIZATION_NOTES

        created_sites = 0
        updated_sites = 0

        paris_site, paris_created = _upsert_site(
            db,
            organization,
            name=PARIS_SITE_NAME,
            address="10 rue de Rivoli, 75001 Paris",
            site_type=OrganizationSiteType.BUILDING,
            normalized_address="10 Rue de Rivoli, 75001 Paris",
            latitude=48.8556,
            longitude=2.3609,
            geocoding_score=0.97,
            enrichment_status="enriched",
            enrichment_reason=None,
            risk_level="medium",
            risk_summary="Adresse reconnue et risques urbains courants identifies. Verifier les verifications periodiques du site.",
            risk_items=[
                {"label": "Sismicite", "level": "faible"},
                {"label": "Retrait-gonflement des argiles", "level": "moyen"},
            ],
        )
        created_sites += 1 if paris_created else 0
        updated_sites += 0 if paris_created else 1

        lyon_site, lyon_created = _upsert_site(
            db,
            organization,
            name=LYON_SITE_NAME,
            address="Place de la mairie",
            site_type=OrganizationSiteType.BUILDING,
            normalized_address="Place de la Mairie, 69001 Lyon",
            latitude=45.7672,
            longitude=4.8343,
            geocoding_score=0.54,
            enrichment_status="partial",
            enrichment_reason="ambiguous_address",
            risk_level="low",
            risk_summary="Adresse probable trouvee, mais le point exact reste a confirmer avant usage en production.",
            risk_items=[
                {"label": "Adresse", "level": "a confirmer"},
            ],
        )
        created_sites += 1 if lyon_created else 0
        updated_sites += 0 if lyon_created else 1

        invalid_site, invalid_created = _upsert_site(
            db,
            organization,
            name=INVALID_SITE_NAME,
            address="zone chantier temporaire",
            site_type=OrganizationSiteType.SITE,
            normalized_address=None,
            latitude=None,
            longitude=None,
            geocoding_score=None,
            enrichment_status="no_match",
            enrichment_reason="no_geocode_match",
            risk_level=None,
            risk_summary=None,
            risk_items=None,
        )
        created_sites += 1 if invalid_created else 0
        updated_sites += 0 if invalid_created else 1

        today = date.today()
        _upsert_building_safety_item(
            db,
            organization,
            site=paris_site,
            name=PARIS_PERIODIC_CHECK_NAME,
            item_type=BuildingSafetyItemType.PERIODIC_CHECK,
            next_due_date=today - timedelta(days=18),
            last_checked_at=today - timedelta(days=380),
            notes="Controle volontairement en retard pour la demonstration locale.",
        )
        extinguisher = _upsert_building_safety_item(
            db,
            organization,
            site=lyon_site,
            name=LYON_EXTINGUISHER_NAME,
            item_type=BuildingSafetyItemType.FIRE_EXTINGUISHER,
            next_due_date=today + timedelta(days=18),
            last_checked_at=today - timedelta(days=347),
            notes="Element a echeance proche pour illustrer un suivi partiel mais vivant.",
        )

        _upsert_duerp_entry(
            db,
            organization,
            site=paris_site,
            work_unit_name=DUERP_WORK_UNIT_NAME,
            risk_label=DUERP_RISK_LABEL,
            severity=DuerpSeverity.HIGH,
            prevention_action="Balisage, aspiration a la source, FFP2 et gestion simple de la coactivite.",
        )

        now = datetime.now(timezone.utc)
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization",
            attached_to_entity_id=organization.id,
            attached_to_field="regulatory_obligation:reg-sites-emergency-contacts",
            file_name=DISPLAY_PROOF_FILE,
            document_type="Affichage obligatoire",
            uploaded_at=now - timedelta(days=6),
            notes="Support de demonstration local pour les consignes et contacts d'urgence.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="organization_site",
            attached_to_entity_id=paris_site.id,
            attached_to_field=None,
            file_name=DUERP_PROOF_FILE,
            document_type="DUERP",
            uploaded_at=now - timedelta(days=10),
            notes="Trame DUERP disponible mais encore a finaliser pour garder une demo credible.",
        )
        _upsert_regulatory_document(
            db,
            organization,
            uploaded_by_user_id=uploaded_by_user_id,
            attached_to_entity_type="building_safety_item",
            attached_to_entity_id=extinguisher.id,
            attached_to_field=None,
            file_name=SAFETY_PROOF_FILE,
            document_type="Controle periodique",
            uploaded_at=now - timedelta(days=20),
            notes="Dernier controle disponible sur un element a echeance proche.",
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
        building_safety_items=2,
        duerp_entries=1,
        regulatory_documents=3,
        cleaned_records=cleaned_records,
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Injecte un petit jeu de donnees de demonstration local pour la home, les sites et la regulation."
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
            f"building_safety_items={result.building_safety_items} "
            f"duerp_entries={result.duerp_entries} "
            f"regulatory_documents={result.regulatory_documents} "
            f"cleaned_records={result.cleaned_records}",
            file=stdout,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(run_seed_demo_workspace())
