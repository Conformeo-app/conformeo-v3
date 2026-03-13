from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.dependencies import OrganizationAccessContext, require_module_enabled, require_permissions
from app.core.access import list_organization_modules
from app.core.audit import list_audit_logs, record_audit_log
from app.core.billing import (
    compute_billing_line_items,
    compute_outstanding_amount_cents,
    format_invoice_number,
    format_quote_number,
    next_invoice_sequence_number,
    next_quote_sequence_number,
    resolve_invoice_status,
    serialize_billing_customer,
    serialize_invoice,
    serialize_quote,
)
from app.core.billing_export_pdf import build_invoice_pdf, build_quote_pdf
from app.core.building_safety import (
    build_building_safety_alerts,
    list_building_safety_items,
    serialize_building_safety_item,
)
from app.core.duerp import list_duerp_entries, serialize_duerp_entry
from app.core.regulatory_export_pdf import build_regulatory_export_pdf
from app.core.regulation import build_regulatory_profile_snapshot
from app.core.regulatory_evidence import (
    REGULATORY_EVIDENCE_SOURCE,
    REGULATORY_OBLIGATION_FIELD_PREFIX,
    build_regulatory_evidence_indexes,
    list_regulatory_evidence_documents,
    serialize_regulatory_evidence,
)
from app.core.worksites import get_worksite_summary, list_worksite_lookup, list_worksite_summaries
from app.db.models import (
    AuditAction,
    BillingCustomer,
    BuildingSafetyItem,
    BuildingSafetyItemStatus,
    Document,
    DocumentStatus,
    DuerpEntry,
    DuerpEntryStatus,
    Invoice,
    InvoiceStatus,
    OrganizationModuleCode,
    OrganizationSite,
    OrganizationSiteStatus,
    Quote,
    QuoteStatus,
)
from app.db.session import get_db_session
from app.schemas.audit_log import AuditLogRead
from app.schemas.auth import ModuleToggleRequest
from app.schemas.billing_customer import (
    BillingCustomerCreateRequest,
    BillingCustomerRead,
    BillingCustomerUpdateRequest,
)
from app.schemas.building_safety import (
    BuildingSafetyAlertRead,
    BuildingSafetyItemCreateRequest,
    BuildingSafetyItemRead,
    BuildingSafetyItemUpdateRequest,
)
from app.schemas.organization import OrganizationProfileUpdateRequest, OrganizationRead
from app.schemas.organization_module import OrganizationModuleRead
from app.schemas.organization_site import (
    OrganizationSiteCreateRequest,
    OrganizationSiteRead,
    OrganizationSiteUpdateRequest,
)
from app.schemas.regulation import OrganizationRegulatoryProfileRead
from app.schemas.duerp import DuerpEntryCreateRequest, DuerpEntryRead, DuerpEntryUpdateRequest
from app.schemas.invoice import (
    InvoiceCreateRequest,
    InvoiceFollowUpUpdateRequest,
    InvoicePaymentCreateRequest,
    InvoiceRead,
    InvoiceStatusUpdateRequest,
    InvoiceUpdateRequest,
    InvoiceWorksiteLinkUpdateRequest,
)
from app.schemas.quote import (
    QuoteCreateRequest,
    QuoteFollowUpUpdateRequest,
    QuoteRead,
    QuoteStatusUpdateRequest,
    QuoteUpdateRequest,
    QuoteWorksiteLinkUpdateRequest,
)
from app.schemas.regulatory_evidence import RegulatoryEvidenceCreateRequest, RegulatoryEvidenceRead
from app.schemas.worksite import WorksiteSummaryRead


router = APIRouter(prefix="/organizations", tags=["organizations"])

require_billing_read = require_module_enabled(OrganizationModuleCode.FACTURATION, "organization:read")
require_billing_write = require_module_enabled(OrganizationModuleCode.FACTURATION, "organization:update")


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def serialize_change_value(value: object | None) -> object | None:
    if value is None:
        return None
    if isinstance(value, UUID):
        return str(value)
    if hasattr(value, "value"):
        return getattr(value, "value")
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def is_profile_ready(payload: OrganizationProfileUpdateRequest) -> bool:
    return (
        bool(payload.name.strip())
        and normalize_optional_text(payload.activity_label) is not None
        and payload.has_employees is not None
        and normalize_optional_text(payload.contact_email) is not None
    )


def list_active_sites(db: Session, organization_id: UUID) -> list[OrganizationSite]:
    return (
        db.execute(
            select(OrganizationSite)
            .where(
                OrganizationSite.organization_id == organization_id,
                OrganizationSite.deleted_at.is_(None),
            )
            .order_by(OrganizationSite.status.asc(), OrganizationSite.name.asc())
        )
        .scalars()
        .all()
    )


def get_site_or_404(db: Session, organization_id: UUID, site_id: UUID) -> OrganizationSite:
    site = db.get(OrganizationSite, site_id)
    if site is None or site.deleted_at is not None or site.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Site introuvable pour cette organisation.")
    return site


def get_building_safety_item_or_404(
    db: Session,
    organization_id: UUID,
    item_id: UUID,
) -> BuildingSafetyItem:
    item = db.get(BuildingSafetyItem, item_id)
    if item is None or item.deleted_at is not None or item.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Élément sécurité introuvable pour cette organisation.")
    return item


def get_duerp_entry_or_404(db: Session, organization_id: UUID, entry_id: UUID) -> DuerpEntry:
    entry = db.get(DuerpEntry, entry_id)
    if entry is None or entry.deleted_at is not None or entry.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Entrée DUERP introuvable pour cette organisation.")
    return entry


def list_billing_customers(db: Session, organization_id: UUID) -> list[BillingCustomer]:
    return (
        db.execute(
            select(BillingCustomer)
            .where(
                BillingCustomer.organization_id == organization_id,
                BillingCustomer.deleted_at.is_(None),
            )
            .order_by(BillingCustomer.name.asc())
        )
        .scalars()
        .all()
    )


def get_billing_customer_or_404(db: Session, organization_id: UUID, customer_id: UUID) -> BillingCustomer:
    customer = db.get(BillingCustomer, customer_id)
    if customer is None or customer.deleted_at is not None or customer.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Client introuvable pour cette organisation.")
    return customer


def get_quote_or_404(db: Session, organization_id: UUID, quote_id: UUID) -> Quote:
    quote = db.get(Quote, quote_id)
    if quote is None or quote.deleted_at is not None or quote.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Devis introuvable pour cette organisation.")
    return quote


def get_invoice_or_404(db: Session, organization_id: UUID, invoice_id: UUID) -> Invoice:
    invoice = db.get(Invoice, invoice_id)
    if invoice is None or invoice.deleted_at is not None or invoice.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Facture introuvable pour cette organisation.")
    return invoice


def get_worksite_name_or_404(organization_id: UUID, worksite_id: UUID | None) -> str | None:
    if worksite_id is None:
        return None
    worksite = get_worksite_summary(organization_id, worksite_id)
    if worksite is None:
        raise HTTPException(status_code=404, detail="Chantier introuvable pour cette organisation.")
    return str(worksite["name"])


def list_quotes_for_organization(db: Session, organization_id: UUID) -> list[Quote]:
    return (
        db.execute(
            select(Quote)
            .options(selectinload(Quote.customer))
            .where(
                Quote.organization_id == organization_id,
                Quote.deleted_at.is_(None),
            )
            .order_by(Quote.issue_date.desc(), Quote.created_at.desc())
        )
        .scalars()
        .all()
    )


def list_invoices_for_organization(db: Session, organization_id: UUID) -> list[Invoice]:
    return (
        db.execute(
            select(Invoice)
            .options(selectinload(Invoice.customer))
            .where(
                Invoice.organization_id == organization_id,
                Invoice.deleted_at.is_(None),
            )
            .order_by(Invoice.issue_date.desc(), Invoice.created_at.desc())
        )
        .scalars()
        .all()
    )


def build_evidence_support_maps(
    sites: list[OrganizationSite],
    building_safety_items: list[BuildingSafetyItem],
    duerp_entries: list[DuerpEntry],
    regulatory_profile: OrganizationRegulatoryProfileRead | dict,
) -> tuple[dict[str, str], dict[str, tuple[str, UUID | None]], dict[str, tuple[str, UUID | None]], dict[str, str]]:
    site_lookup = {str(site.id): site.name for site in sites}
    building_safety_lookup = {
        str(item.id): (item.name, item.site_id)
        for item in building_safety_items
    }
    duerp_lookup = {
        str(entry.id): (entry.risk_label, entry.site_id)
        for entry in duerp_entries
    }
    profile_payload = (
        regulatory_profile.model_dump()
        if hasattr(regulatory_profile, "model_dump")
        else regulatory_profile
    )
    obligation_titles = {
        item["id"]: item["title"]
        for item in profile_payload.get("applicable_obligations", [])
    }
    return site_lookup, building_safety_lookup, duerp_lookup, obligation_titles


@router.get(
    "/{organization_id}/profile",
    response_model=OrganizationRead,
)
def read_profile(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
) -> OrganizationRead:
    return OrganizationRead.model_validate(context.organization)


@router.patch(
    "/{organization_id}/profile",
    response_model=OrganizationRead,
)
def update_profile(
    organization_id: UUID,
    payload: OrganizationProfileUpdateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> OrganizationRead:
    organization = context.organization
    previous_onboarding_completed_at = organization.onboarding_completed_at
    changes: dict[str, dict[str, object | None]] = {}

    field_updates = {
        "name": payload.name.strip(),
        "legal_name": normalize_optional_text(payload.legal_name),
        "activity_label": normalize_optional_text(payload.activity_label),
        "employee_count": payload.employee_count,
        "has_employees": payload.has_employees,
        "receives_public": payload.receives_public,
        "stores_hazardous_products": payload.stores_hazardous_products,
        "performs_high_risk_work": payload.performs_high_risk_work,
        "contact_email": normalize_optional_text(payload.contact_email),
        "contact_phone": normalize_optional_text(payload.contact_phone),
        "headquarters_address": normalize_optional_text(payload.headquarters_address),
        "notes": normalize_optional_text(payload.notes),
    }

    for field_name, next_value in field_updates.items():
        current_value = getattr(organization, field_name)
        if current_value != next_value:
            changes[field_name] = {"from": current_value, "to": next_value}
            setattr(organization, field_name, next_value)

    if organization.onboarding_completed_at is None and is_profile_ready(payload):
        organization.onboarding_completed_at = datetime.now(timezone.utc)
        changes["onboarding_completed_at"] = {
            "from": previous_onboarding_completed_at.isoformat()
            if previous_onboarding_completed_at
            else None,
            "to": organization.onboarding_completed_at.isoformat(),
        }

    if not changes:
        return OrganizationRead.model_validate(organization)

    organization.version += 1
    record_audit_log(
        db,
        organization_id=organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="organization",
        target_id=organization.id,
        target_display=organization.name,
        changes=changes,
    )
    db.commit()
    db.refresh(organization)
    return OrganizationRead.model_validate(organization)


@router.get(
    "/{organization_id}/sites",
    response_model=list[OrganizationSiteRead],
)
def read_sites(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[OrganizationSiteRead]:
    sites = list_active_sites(db, context.organization.id)
    return [OrganizationSiteRead.model_validate(site) for site in sites]


@router.get(
    "/{organization_id}/regulatory-profile",
    response_model=OrganizationRegulatoryProfileRead,
)
def read_regulatory_profile(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> OrganizationRegulatoryProfileRead:
    sites = list_active_sites(db, context.organization.id)
    building_safety_items = list_building_safety_items(db, context.organization.id)
    duerp_entries = list_duerp_entries(db, context.organization.id)
    documents = list_regulatory_evidence_documents(db, context.organization.id)
    snapshot = build_regulatory_profile_snapshot(
        context.organization,
        sites,
        building_safety_items=building_safety_items,
        duerp_entries=duerp_entries,
        documents=documents,
    )
    return OrganizationRegulatoryProfileRead.model_validate(snapshot)


@router.get(
    "/{organization_id}/regulatory-export.pdf",
)
def export_regulatory_pdf(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> Response:
    sites = list_active_sites(db, context.organization.id)
    building_safety_items = list_building_safety_items(db, context.organization.id)
    duerp_entries = list_duerp_entries(db, context.organization.id)
    documents = list_regulatory_evidence_documents(db, context.organization.id)
    regulatory_profile = build_regulatory_profile_snapshot(
        context.organization,
        sites,
        building_safety_items=building_safety_items,
        duerp_entries=duerp_entries,
        documents=documents,
    )
    site_lookup, building_safety_lookup, duerp_lookup, obligation_titles = build_evidence_support_maps(
        sites,
        building_safety_items,
        duerp_entries,
        regulatory_profile,
    )
    evidence_indexes = build_regulatory_evidence_indexes(documents)
    evidence_payload = [
        serialize_regulatory_evidence(document, obligation_titles, site_lookup, building_safety_lookup, duerp_lookup)
        for document in documents
    ]
    pdf_content = build_regulatory_export_pdf(
        context.organization,
        regulatory_profile,
        sites,
        [serialize_building_safety_item(item) for item in building_safety_items],
        [
            serialize_duerp_entry(entry, evidence_indexes["duerp_entry_counts"].get(str(entry.id), 0))
            for entry in duerp_entries
        ],
        evidence_payload,
    )
    filename = f"conformeo-reglementaire-{context.organization.slug}-{date.today().isoformat()}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/{organization_id}/sites",
    response_model=OrganizationSiteRead,
)
def create_site(
    organization_id: UUID,
    payload: OrganizationSiteCreateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> OrganizationSiteRead:
    site = OrganizationSite(
        organization_id=context.organization.id,
        name=payload.name.strip(),
        address=payload.address.strip(),
        site_type=payload.site_type,
        status=OrganizationSiteStatus.ACTIVE,
    )
    db.add(site)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="organization_site",
        target_id=site.id,
        target_display=site.name,
        changes={
            "name": site.name,
            "address": site.address,
            "site_type": site.site_type.value,
            "status": site.status.value,
        },
    )
    db.commit()
    db.refresh(site)
    return OrganizationSiteRead.model_validate(site)


@router.patch(
    "/{organization_id}/sites/{site_id}",
    response_model=OrganizationSiteRead,
)
def update_site(
    organization_id: UUID,
    site_id: UUID,
    payload: OrganizationSiteUpdateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> OrganizationSiteRead:
    site = get_site_or_404(db, context.organization.id, site_id)
    changes: dict[str, dict[str, object | None]] = {}

    field_updates = {
        "name": payload.name.strip() if payload.name is not None else None,
        "address": payload.address.strip() if payload.address is not None else None,
        "site_type": payload.site_type,
        "status": payload.status,
    }

    for field_name, next_value in field_updates.items():
        if next_value is None:
            continue
        current_value = getattr(site, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(site, field_name, next_value)

    if not changes:
        return OrganizationSiteRead.model_validate(site)

    site.version += 1
    action_type = (
        AuditAction.STATUS_CHANGE
        if list(changes.keys()) == ["status"]
        else AuditAction.UPDATE
    )
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=action_type,
        target_type="organization_site",
        target_id=site.id,
        target_display=site.name,
        changes=changes,
    )
    db.commit()
    db.refresh(site)
    return OrganizationSiteRead.model_validate(site)


@router.get(
    "/{organization_id}/building-safety-items",
    response_model=list[BuildingSafetyItemRead],
)
def read_building_safety_items(
    organization_id: UUID,
    site_id: UUID | None = Query(default=None),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[BuildingSafetyItemRead]:
    if site_id is not None:
        get_site_or_404(db, context.organization.id, site_id)
    items = list_building_safety_items(db, context.organization.id, site_id)
    return [BuildingSafetyItemRead.model_validate(serialize_building_safety_item(item)) for item in items]


@router.get(
    "/{organization_id}/building-safety-alerts",
    response_model=list[BuildingSafetyAlertRead],
)
def read_building_safety_alerts(
    organization_id: UUID,
    site_id: UUID | None = Query(default=None),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[BuildingSafetyAlertRead]:
    if site_id is not None:
        get_site_or_404(db, context.organization.id, site_id)
    items = list_building_safety_items(db, context.organization.id, site_id)
    alerts = build_building_safety_alerts(items)
    return [BuildingSafetyAlertRead.model_validate(alert) for alert in alerts]


@router.post(
    "/{organization_id}/building-safety-items",
    response_model=BuildingSafetyItemRead,
)
def create_building_safety_item(
    organization_id: UUID,
    payload: BuildingSafetyItemCreateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> BuildingSafetyItemRead:
    site = get_site_or_404(db, context.organization.id, payload.site_id)
    if site.status != OrganizationSiteStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Le site doit être actif pour ajouter un élément sécurité.")

    item = BuildingSafetyItem(
        organization_id=context.organization.id,
        site_id=site.id,
        item_type=payload.item_type,
        name=payload.name.strip(),
        next_due_date=payload.next_due_date,
        last_checked_at=payload.last_checked_at,
        status=BuildingSafetyItemStatus.ACTIVE,
        notes=normalize_optional_text(payload.notes),
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="building_safety_item",
        target_id=item.id,
        target_display=item.name,
        changes={
            "site_id": str(item.site_id),
            "item_type": item.item_type.value,
            "name": item.name,
            "next_due_date": item.next_due_date.isoformat(),
            "status": item.status.value,
        },
    )
    db.commit()
    db.refresh(item)
    return BuildingSafetyItemRead.model_validate(serialize_building_safety_item(item))


@router.patch(
    "/{organization_id}/building-safety-items/{item_id}",
    response_model=BuildingSafetyItemRead,
)
def update_building_safety_item(
    organization_id: UUID,
    item_id: UUID,
    payload: BuildingSafetyItemUpdateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> BuildingSafetyItemRead:
    item = get_building_safety_item_or_404(db, context.organization.id, item_id)
    changes: dict[str, dict[str, object | None]] = {}

    field_updates = {
        "name": payload.name.strip() if payload.name is not None else None,
        "next_due_date": payload.next_due_date,
        "last_checked_at": payload.last_checked_at,
        "status": payload.status,
        "notes": normalize_optional_text(payload.notes) if payload.notes is not None else None,
    }

    for field_name, next_value in field_updates.items():
        if next_value is None:
            continue
        current_value = getattr(item, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(item, field_name, next_value)

    if not changes:
        return BuildingSafetyItemRead.model_validate(serialize_building_safety_item(item))

    item.version += 1
    action_type = (
        AuditAction.STATUS_CHANGE
        if list(changes.keys()) == ["status"]
        else AuditAction.UPDATE
    )
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=action_type,
        target_type="building_safety_item",
        target_id=item.id,
        target_display=item.name,
        changes=changes,
    )
    db.commit()
    db.refresh(item)
    return BuildingSafetyItemRead.model_validate(serialize_building_safety_item(item))


@router.get(
    "/{organization_id}/duerp-entries",
    response_model=list[DuerpEntryRead],
)
def read_duerp_entries(
    organization_id: UUID,
    site_id: UUID | None = Query(default=None),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[DuerpEntryRead]:
    if site_id is not None:
        get_site_or_404(db, context.organization.id, site_id)
    entries = list_duerp_entries(db, context.organization.id, site_id)
    documents = list_regulatory_evidence_documents(db, context.organization.id)
    indexes = build_regulatory_evidence_indexes(documents)
    return [
        DuerpEntryRead.model_validate(
            serialize_duerp_entry(entry, indexes["duerp_entry_counts"].get(str(entry.id), 0))
        )
        for entry in entries
    ]


@router.post(
    "/{organization_id}/duerp-entries",
    response_model=DuerpEntryRead,
)
def create_duerp_entry(
    organization_id: UUID,
    payload: DuerpEntryCreateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> DuerpEntryRead:
    site = get_site_or_404(db, context.organization.id, payload.site_id) if payload.site_id else None

    entry = DuerpEntry(
        organization_id=context.organization.id,
        site_id=site.id if site else None,
        work_unit_name=payload.work_unit_name.strip(),
        risk_label=payload.risk_label.strip(),
        severity=payload.severity,
        prevention_action=normalize_optional_text(payload.prevention_action),
        status=DuerpEntryStatus.ACTIVE,
    )
    db.add(entry)
    db.flush()
    db.refresh(entry)
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="duerp_entry",
        target_id=entry.id,
        target_display=entry.risk_label,
        changes={
            "site_id": str(entry.site_id) if entry.site_id else None,
            "work_unit_name": entry.work_unit_name,
            "risk_label": entry.risk_label,
            "severity": entry.severity.value,
            "status": entry.status.value,
        },
    )
    db.commit()
    db.refresh(entry)
    return DuerpEntryRead.model_validate(serialize_duerp_entry(entry, 0))


@router.patch(
    "/{organization_id}/duerp-entries/{entry_id}",
    response_model=DuerpEntryRead,
)
def update_duerp_entry(
    organization_id: UUID,
    entry_id: UUID,
    payload: DuerpEntryUpdateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> DuerpEntryRead:
    entry = get_duerp_entry_or_404(db, context.organization.id, entry_id)
    changes: dict[str, dict[str, object | None]] = {}

    if payload.site_id is not None:
        site = get_site_or_404(db, context.organization.id, payload.site_id)
        if entry.site_id != site.id:
            changes["site_id"] = {"from": str(entry.site_id) if entry.site_id else None, "to": str(site.id)}
            entry.site_id = site.id

    field_updates = {
        "work_unit_name": payload.work_unit_name.strip() if payload.work_unit_name is not None else None,
        "risk_label": payload.risk_label.strip() if payload.risk_label is not None else None,
        "severity": payload.severity,
        "prevention_action": normalize_optional_text(payload.prevention_action) if payload.prevention_action is not None else None,
        "status": payload.status,
    }

    for field_name, next_value in field_updates.items():
        if next_value is None:
            continue
        current_value = getattr(entry, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(entry, field_name, next_value)

    if not changes:
        documents = list_regulatory_evidence_documents(db, context.organization.id)
        indexes = build_regulatory_evidence_indexes(documents)
        return DuerpEntryRead.model_validate(
            serialize_duerp_entry(entry, indexes["duerp_entry_counts"].get(str(entry.id), 0))
        )

    entry.version += 1
    action_type = AuditAction.STATUS_CHANGE if list(changes.keys()) == ["status"] else AuditAction.UPDATE
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=action_type,
        target_type="duerp_entry",
        target_id=entry.id,
        target_display=entry.risk_label,
        changes=changes,
    )
    db.commit()
    db.refresh(entry)
    documents = list_regulatory_evidence_documents(db, context.organization.id)
    indexes = build_regulatory_evidence_indexes(documents)
    return DuerpEntryRead.model_validate(
        serialize_duerp_entry(entry, indexes["duerp_entry_counts"].get(str(entry.id), 0))
    )


@router.get(
    "/{organization_id}/regulatory-evidences",
    response_model=list[RegulatoryEvidenceRead],
)
def read_regulatory_evidences(
    organization_id: UUID,
    site_id: UUID | None = Query(default=None),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[RegulatoryEvidenceRead]:
    if site_id is not None:
        get_site_or_404(db, context.organization.id, site_id)

    sites = list_active_sites(db, context.organization.id)
    building_safety_items = list_building_safety_items(db, context.organization.id)
    duerp_entries = list_duerp_entries(db, context.organization.id)
    regulatory_profile = build_regulatory_profile_snapshot(
        context.organization,
        sites,
        building_safety_items=building_safety_items,
        duerp_entries=duerp_entries,
        documents=list_regulatory_evidence_documents(db, context.organization.id),
    )
    site_lookup, building_safety_lookup, duerp_lookup, obligation_titles = build_evidence_support_maps(
        sites,
        building_safety_items,
        duerp_entries,
        regulatory_profile,
    )

    documents = list_regulatory_evidence_documents(db, context.organization.id)
    payload = [
        serialize_regulatory_evidence(document, obligation_titles, site_lookup, building_safety_lookup, duerp_lookup)
        for document in documents
    ]
    if site_id is not None:
        payload = [item for item in payload if str(item["site_id"]) == str(site_id)]
    return [RegulatoryEvidenceRead.model_validate(item) for item in payload]


@router.post(
    "/{organization_id}/regulatory-evidences",
    response_model=RegulatoryEvidenceRead,
)
def create_regulatory_evidence(
    organization_id: UUID,
    payload: RegulatoryEvidenceCreateRequest,
    context: OrganizationAccessContext = Depends(require_permissions("organization:update")),
    db: Session = Depends(get_db_session),
) -> RegulatoryEvidenceRead:
    attached_to_entity_type = "organization"
    attached_to_entity_id = context.organization.id
    attached_to_field = None
    link_label = "Preuve réglementaire"
    site_id: UUID | None = None
    building_safety_item_id: UUID | None = None
    duerp_entry_id: UUID | None = None
    obligation_id: str | None = None

    if payload.link_kind == "obligation":
        obligation_id = payload.obligation_id
        attached_to_field = f"{REGULATORY_OBLIGATION_FIELD_PREFIX}{payload.obligation_id}"
        snapshot = build_regulatory_profile_snapshot(
            context.organization,
            list_active_sites(db, context.organization.id),
            building_safety_items=list_building_safety_items(db, context.organization.id),
            duerp_entries=list_duerp_entries(db, context.organization.id),
            documents=list_regulatory_evidence_documents(db, context.organization.id),
        )
        obligation_titles = {
            item["id"]: item["title"]
            for item in snapshot["applicable_obligations"]
        }
        if payload.obligation_id not in obligation_titles:
            raise HTTPException(status_code=400, detail="Cette obligation n'est pas disponible pour cette organisation.")
        link_label = obligation_titles[payload.obligation_id]
    elif payload.link_kind == "site":
        site = get_site_or_404(db, context.organization.id, payload.site_id)
        attached_to_entity_type = "organization_site"
        attached_to_entity_id = site.id
        link_label = site.name
        site_id = site.id
    elif payload.link_kind == "building_safety_item":
        item = get_building_safety_item_or_404(db, context.organization.id, payload.building_safety_item_id)
        attached_to_entity_type = "building_safety_item"
        attached_to_entity_id = item.id
        link_label = item.name
        site_id = item.site_id
        building_safety_item_id = item.id
    elif payload.link_kind == "duerp_entry":
        entry = get_duerp_entry_or_404(db, context.organization.id, payload.duerp_entry_id)
        attached_to_entity_type = "duerp_entry"
        attached_to_entity_id = entry.id
        link_label = entry.risk_label
        site_id = entry.site_id
        duerp_entry_id = entry.id
    else:
        raise HTTPException(status_code=400, detail="Type de rattachement réglementaire non pris en charge.")

    document = Document(
        organization_id=context.organization.id,
        attached_to_entity_type=attached_to_entity_type,
        attached_to_entity_id=attached_to_entity_id,
        attached_to_field=attached_to_field,
        uploaded_by_user_id=context.user.id,
        document_type=payload.document_type.strip(),
        source=REGULATORY_EVIDENCE_SOURCE,
        status=DocumentStatus.AVAILABLE,
        file_name=payload.file_name.strip(),
        uploaded_at=datetime.now(timezone.utc),
        notes=normalize_optional_text(payload.notes),
    )
    db.add(document)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="regulatory_evidence",
        target_id=document.id,
        target_display=document.file_name,
        changes={
            "link_kind": payload.link_kind,
            "link_label": link_label,
            "document_type": document.document_type,
        },
    )
    db.commit()
    db.refresh(document)
    return RegulatoryEvidenceRead.model_validate(
        {
            "id": document.id,
            "version": document.version,
            "created_at": document.created_at,
            "updated_at": document.updated_at,
            "deleted_at": document.deleted_at,
            "organization_id": document.organization_id,
            "link_kind": payload.link_kind,
            "link_label": link_label,
            "obligation_id": obligation_id,
            "site_id": site_id,
            "building_safety_item_id": building_safety_item_id,
            "duerp_entry_id": duerp_entry_id,
            "document_type": document.document_type,
            "source": document.source,
            "status": document.status,
            "file_name": document.file_name,
            "uploaded_at": document.uploaded_at,
            "notes": document.notes,
        }
    )


@router.get(
    "/{organization_id}/customers",
    response_model=list[BillingCustomerRead],
)
def read_billing_customers(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_read),
    db: Session = Depends(get_db_session),
) -> list[BillingCustomerRead]:
    customers = list_billing_customers(db, context.organization.id)
    return [BillingCustomerRead.model_validate(serialize_billing_customer(customer)) for customer in customers]


@router.post(
    "/{organization_id}/customers",
    response_model=BillingCustomerRead,
)
def create_billing_customer(
    organization_id: UUID,
    payload: BillingCustomerCreateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> BillingCustomerRead:
    customer = BillingCustomer(
        organization_id=context.organization.id,
        name=payload.name.strip(),
        customer_type=payload.customer_type,
        email=normalize_optional_text(payload.email),
        phone=normalize_optional_text(payload.phone),
        address=normalize_optional_text(payload.address),
        notes=normalize_optional_text(payload.notes),
    )
    db.add(customer)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="billing_customer",
        target_id=customer.id,
        target_display=customer.name,
        changes={
            "name": customer.name,
            "customer_type": customer.customer_type.value,
        },
    )
    db.commit()
    db.refresh(customer)
    return BillingCustomerRead.model_validate(serialize_billing_customer(customer))


@router.patch(
    "/{organization_id}/customers/{customer_id}",
    response_model=BillingCustomerRead,
)
def update_billing_customer(
    organization_id: UUID,
    customer_id: UUID,
    payload: BillingCustomerUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> BillingCustomerRead:
    customer = get_billing_customer_or_404(db, context.organization.id, customer_id)
    changes: dict[str, dict[str, object | None]] = {}
    field_updates = {
        "name": payload.name.strip() if payload.name is not None else None,
        "customer_type": payload.customer_type,
        "email": normalize_optional_text(payload.email),
        "phone": normalize_optional_text(payload.phone),
        "address": normalize_optional_text(payload.address),
        "notes": normalize_optional_text(payload.notes),
    }

    for field_name, next_value in field_updates.items():
        if next_value is None and field_name in {"name", "customer_type"}:
            continue
        current_value = getattr(customer, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(customer, field_name, next_value)

    if not changes:
        return BillingCustomerRead.model_validate(serialize_billing_customer(customer))

    customer.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="billing_customer",
        target_id=customer.id,
        target_display=customer.name,
        changes=changes,
    )
    db.commit()
    db.refresh(customer)
    return BillingCustomerRead.model_validate(serialize_billing_customer(customer))


@router.get(
    "/{organization_id}/quotes",
    response_model=list[QuoteRead],
)
def read_quotes(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_read),
    db: Session = Depends(get_db_session),
) -> list[QuoteRead]:
    worksite_lookup = list_worksite_lookup(context.organization.id)
    quotes = list_quotes_for_organization(db, context.organization.id)
    return [
        QuoteRead.model_validate(
            serialize_quote(
                quote,
                worksite_name=str(worksite_lookup[quote.worksite_id]["name"]) if quote.worksite_id in worksite_lookup else None,
            )
        )
        for quote in quotes
    ]


@router.post(
    "/{organization_id}/quotes",
    response_model=QuoteRead,
)
def create_quote(
    organization_id: UUID,
    payload: QuoteCreateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> QuoteRead:
    customer = get_billing_customer_or_404(db, context.organization.id, payload.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    sequence_number = next_quote_sequence_number(db, context.organization.id)
    line_items, subtotal_amount_cents = compute_billing_line_items(
        [item.model_dump() for item in payload.line_items]
    )
    quote = Quote(
        organization_id=context.organization.id,
        customer_id=customer.id,
        worksite_id=payload.worksite_id,
        sequence_number=sequence_number,
        number=format_quote_number(sequence_number),
        title=normalize_optional_text(payload.title),
        issue_date=payload.issue_date,
        valid_until=payload.valid_until,
        status=payload.status,
        currency=(payload.currency or "EUR").upper(),
        line_items=line_items,
        subtotal_amount_cents=subtotal_amount_cents,
        total_amount_cents=subtotal_amount_cents,
        notes=normalize_optional_text(payload.notes),
    )
    db.add(quote)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="quote",
        target_id=quote.id,
        target_display=quote.number,
        changes={
            "number": quote.number,
            "customer_id": str(customer.id),
            "worksite_id": str(quote.worksite_id) if quote.worksite_id else None,
            "status": quote.status.value,
            "follow_up_status": quote.follow_up_status,
            "total_amount_cents": quote.total_amount_cents,
        },
    )
    db.commit()
    db.refresh(quote)
    db.refresh(customer)
    quote.customer = customer
    return QuoteRead.model_validate(serialize_quote(quote, worksite_name=worksite_name))


@router.patch(
    "/{organization_id}/quotes/{quote_id}/follow-up",
    response_model=QuoteRead,
)
def update_quote_follow_up_status(
    organization_id: UUID,
    quote_id: UUID,
    payload: QuoteFollowUpUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> QuoteRead:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    if quote.follow_up_status == payload.follow_up_status:
        return QuoteRead.model_validate(
            serialize_quote(
                quote,
                worksite_name=get_worksite_name_or_404(context.organization.id, quote.worksite_id),
            )
        )

    previous_follow_up_status = quote.follow_up_status
    quote.follow_up_status = payload.follow_up_status
    quote.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="quote",
        target_id=quote.id,
        target_display=quote.number,
        changes={
            "follow_up_status": {
                "from": previous_follow_up_status,
                "to": quote.follow_up_status,
            }
        },
    )
    db.commit()
    db.refresh(quote)
    if quote.customer is None:
        db.refresh(quote, attribute_names=["customer"])
    return QuoteRead.model_validate(
        serialize_quote(
            quote,
            worksite_name=get_worksite_name_or_404(context.organization.id, quote.worksite_id),
        )
    )


@router.patch(
    "/{organization_id}/quotes/{quote_id}",
    response_model=QuoteRead,
)
def update_quote(
    organization_id: UUID,
    quote_id: UUID,
    payload: QuoteUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> QuoteRead:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    customer = get_billing_customer_or_404(db, context.organization.id, payload.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    previous_worksite_name = get_worksite_name_or_404(context.organization.id, quote.worksite_id)
    line_items, subtotal_amount_cents = compute_billing_line_items(
        [item.model_dump() for item in payload.line_items]
    )

    changes: dict[str, dict[str, object | None]] = {}
    field_updates = {
        "customer_id": customer.id,
        "worksite_id": payload.worksite_id,
        "title": normalize_optional_text(payload.title),
        "issue_date": payload.issue_date,
        "valid_until": payload.valid_until,
        "line_items": line_items,
        "subtotal_amount_cents": subtotal_amount_cents,
        "total_amount_cents": subtotal_amount_cents,
        "notes": normalize_optional_text(payload.notes),
    }

    for field_name, next_value in field_updates.items():
        current_value = getattr(quote, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(quote, field_name, next_value)

    if previous_worksite_name != worksite_name:
        changes["worksite_name"] = {
            "from": previous_worksite_name,
            "to": worksite_name,
        }

    if not changes:
        if quote.customer is None:
            db.refresh(quote, attribute_names=["customer"])
        return QuoteRead.model_validate(serialize_quote(quote, worksite_name=worksite_name))

    quote.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="quote",
        target_id=quote.id,
        target_display=quote.number,
        changes=changes,
    )
    db.commit()
    db.refresh(quote)
    quote.customer = customer
    return QuoteRead.model_validate(serialize_quote(quote, worksite_name=worksite_name))


@router.patch(
    "/{organization_id}/quotes/{quote_id}/status",
    response_model=QuoteRead,
)
def update_quote_status(
    organization_id: UUID,
    quote_id: UUID,
    payload: QuoteStatusUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> QuoteRead:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    if quote.status == payload.status:
        return QuoteRead.model_validate(serialize_quote(quote))

    previous_status = quote.status
    quote.status = payload.status
    quote.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.STATUS_CHANGE,
        target_type="quote",
        target_id=quote.id,
        target_display=quote.number,
        changes={
            "status": {
                "from": previous_status.value,
                "to": quote.status.value,
            }
        },
    )
    db.commit()
    db.refresh(quote)
    if quote.customer is None:
        db.refresh(quote, attribute_names=["customer"])
    return QuoteRead.model_validate(
        serialize_quote(
            quote,
            worksite_name=get_worksite_name_or_404(context.organization.id, quote.worksite_id),
        )
    )


@router.patch(
    "/{organization_id}/quotes/{quote_id}/worksite",
    response_model=QuoteRead,
)
def update_quote_worksite(
    organization_id: UUID,
    quote_id: UUID,
    payload: QuoteWorksiteLinkUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> QuoteRead:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    if quote.worksite_id == payload.worksite_id:
        return QuoteRead.model_validate(serialize_quote(quote, worksite_name=worksite_name))

    previous_worksite_id = quote.worksite_id
    quote.worksite_id = payload.worksite_id
    quote.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="quote_worksite_link",
        target_id=quote.id,
        target_display=quote.number,
        changes={
            "worksite_id": {
                "from": str(previous_worksite_id) if previous_worksite_id else None,
                "to": str(payload.worksite_id) if payload.worksite_id else None,
            },
            "worksite_name": {
                "from": get_worksite_name_or_404(context.organization.id, previous_worksite_id),
                "to": worksite_name,
            },
        },
    )
    db.commit()
    db.refresh(quote)
    if quote.customer is None:
        db.refresh(quote, attribute_names=["customer"])
    return QuoteRead.model_validate(serialize_quote(quote, worksite_name=worksite_name))


@router.get(
    "/{organization_id}/quotes/{quote_id}/pdf",
)
def download_quote_pdf(
    organization_id: UUID,
    quote_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_read),
    db: Session = Depends(get_db_session),
) -> Response:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    customer = get_billing_customer_or_404(db, context.organization.id, quote.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, quote.worksite_id)
    pdf_bytes = build_quote_pdf(
        context.organization,
        serialize_quote(quote, worksite_name=worksite_name),
        serialize_billing_customer(customer),
    )
    filename = f"devis-{quote.number.lower()}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/{organization_id}/quotes/{quote_id}/duplicate-to-invoice",
    response_model=InvoiceRead,
)
def duplicate_quote_to_invoice(
    organization_id: UUID,
    quote_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    quote = get_quote_or_404(db, context.organization.id, quote_id)
    customer = get_billing_customer_or_404(db, context.organization.id, quote.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, quote.worksite_id)
    sequence_number = next_invoice_sequence_number(db, context.organization.id)
    line_items, subtotal_amount_cents = compute_billing_line_items(quote.line_items)
    issue_date = date.today()

    invoice = Invoice(
        organization_id=context.organization.id,
        customer_id=customer.id,
        worksite_id=quote.worksite_id,
        sequence_number=sequence_number,
        number=format_invoice_number(sequence_number),
        title=normalize_optional_text(quote.title),
        issue_date=issue_date,
        due_date=None,
        status=InvoiceStatus.DRAFT,
        currency=quote.currency,
        line_items=line_items,
        subtotal_amount_cents=subtotal_amount_cents,
        total_amount_cents=subtotal_amount_cents,
        paid_amount_cents=0,
        paid_at=None,
        notes=normalize_optional_text(quote.notes),
    )
    db.add(invoice)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="invoice",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "number": invoice.number,
            "customer_id": str(customer.id),
            "worksite_id": str(invoice.worksite_id) if invoice.worksite_id else None,
            "status": invoice.status.value,
            "follow_up_status": invoice.follow_up_status,
            "total_amount_cents": invoice.total_amount_cents,
            "source_quote_id": str(quote.id),
            "source_quote_number": quote.number,
        },
    )
    db.commit()
    db.refresh(invoice)
    db.refresh(customer)
    invoice.customer = customer
    return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))


@router.get(
    "/{organization_id}/invoices",
    response_model=list[InvoiceRead],
)
def read_invoices(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_read),
    db: Session = Depends(get_db_session),
) -> list[InvoiceRead]:
    worksite_lookup = list_worksite_lookup(context.organization.id)
    invoices = list_invoices_for_organization(db, context.organization.id)
    return [
        InvoiceRead.model_validate(
            serialize_invoice(
                invoice,
                worksite_name=str(worksite_lookup[invoice.worksite_id]["name"]) if invoice.worksite_id in worksite_lookup else None,
            )
        )
        for invoice in invoices
    ]


@router.post(
    "/{organization_id}/invoices",
    response_model=InvoiceRead,
)
def create_invoice(
    organization_id: UUID,
    payload: InvoiceCreateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    customer = get_billing_customer_or_404(db, context.organization.id, payload.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    sequence_number = next_invoice_sequence_number(db, context.organization.id)
    line_items, subtotal_amount_cents = compute_billing_line_items(
        [item.model_dump() for item in payload.line_items]
    )
    base_status = payload.status if payload.status != InvoiceStatus.PAID else InvoiceStatus.ISSUED
    invoice = Invoice(
        organization_id=context.organization.id,
        customer_id=customer.id,
        worksite_id=payload.worksite_id,
        sequence_number=sequence_number,
        number=format_invoice_number(sequence_number),
        title=normalize_optional_text(payload.title),
        issue_date=payload.issue_date,
        due_date=payload.due_date,
        status=resolve_invoice_status(
            base_status,
            due_date=payload.due_date,
            total_amount_cents=subtotal_amount_cents,
            paid_amount_cents=0,
            today=payload.issue_date,
        ),
        currency=(payload.currency or "EUR").upper(),
        line_items=line_items,
        subtotal_amount_cents=subtotal_amount_cents,
        total_amount_cents=subtotal_amount_cents,
        paid_amount_cents=0,
        paid_at=None,
        notes=normalize_optional_text(payload.notes),
    )
    db.add(invoice)
    db.flush()
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.CREATE,
        target_type="invoice",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "number": invoice.number,
            "customer_id": str(customer.id),
            "worksite_id": str(invoice.worksite_id) if invoice.worksite_id else None,
            "status": invoice.status.value,
            "follow_up_status": invoice.follow_up_status,
            "total_amount_cents": invoice.total_amount_cents,
        },
    )
    db.commit()
    db.refresh(invoice)
    db.refresh(customer)
    invoice.customer = customer
    return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))


@router.patch(
    "/{organization_id}/invoices/{invoice_id}/follow-up",
    response_model=InvoiceRead,
)
def update_invoice_follow_up_status(
    organization_id: UUID,
    invoice_id: UUID,
    payload: InvoiceFollowUpUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    if invoice.follow_up_status == payload.follow_up_status:
        return InvoiceRead.model_validate(
            serialize_invoice(
                invoice,
                worksite_name=get_worksite_name_or_404(context.organization.id, invoice.worksite_id),
            )
        )

    previous_follow_up_status = invoice.follow_up_status
    invoice.follow_up_status = payload.follow_up_status
    invoice.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="invoice",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "follow_up_status": {
                "from": previous_follow_up_status,
                "to": invoice.follow_up_status,
            }
        },
    )
    db.commit()
    db.refresh(invoice)
    if invoice.customer is None:
        db.refresh(invoice, attribute_names=["customer"])
    return InvoiceRead.model_validate(
        serialize_invoice(
            invoice,
            worksite_name=get_worksite_name_or_404(context.organization.id, invoice.worksite_id),
        )
    )


@router.patch(
    "/{organization_id}/invoices/{invoice_id}",
    response_model=InvoiceRead,
)
def update_invoice(
    organization_id: UUID,
    invoice_id: UUID,
    payload: InvoiceUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    customer = get_billing_customer_or_404(db, context.organization.id, payload.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    previous_worksite_name = get_worksite_name_or_404(context.organization.id, invoice.worksite_id)
    line_items, subtotal_amount_cents = compute_billing_line_items(
        [item.model_dump() for item in payload.line_items]
    )
    if invoice.paid_amount_cents > subtotal_amount_cents:
        raise HTTPException(
            status_code=400,
            detail="Le total mis a jour ne peut pas etre inferieur au montant deja paye.",
        )

    resolved_status = resolve_invoice_status(
        InvoiceStatus.DRAFT if invoice.status == InvoiceStatus.DRAFT else InvoiceStatus.ISSUED,
        due_date=payload.due_date,
        total_amount_cents=subtotal_amount_cents,
        paid_amount_cents=invoice.paid_amount_cents,
    )

    changes: dict[str, dict[str, object | None]] = {}
    field_updates = {
        "customer_id": customer.id,
        "worksite_id": payload.worksite_id,
        "title": normalize_optional_text(payload.title),
        "issue_date": payload.issue_date,
        "due_date": payload.due_date,
        "line_items": line_items,
        "subtotal_amount_cents": subtotal_amount_cents,
        "total_amount_cents": subtotal_amount_cents,
        "notes": normalize_optional_text(payload.notes),
        "status": resolved_status,
    }

    for field_name, next_value in field_updates.items():
        current_value = getattr(invoice, field_name)
        if current_value != next_value:
            changes[field_name] = {
                "from": serialize_change_value(current_value),
                "to": serialize_change_value(next_value),
            }
            setattr(invoice, field_name, next_value)

    if previous_worksite_name != worksite_name:
        changes["worksite_name"] = {
            "from": previous_worksite_name,
            "to": worksite_name,
        }

    if not changes:
        if invoice.customer is None:
            db.refresh(invoice, attribute_names=["customer"])
        return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))

    invoice.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="invoice",
        target_id=invoice.id,
        target_display=invoice.number,
        changes=changes,
    )
    db.commit()
    db.refresh(invoice)
    invoice.customer = customer
    return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))


@router.patch(
    "/{organization_id}/invoices/{invoice_id}/status",
    response_model=InvoiceRead,
)
def update_invoice_status(
    organization_id: UUID,
    invoice_id: UUID,
    payload: InvoiceStatusUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    if payload.status in {InvoiceStatus.PAID, InvoiceStatus.OVERDUE}:
        raise HTTPException(
            status_code=400,
            detail="Le statut demandé se déduit du paiement ou de l'échéance.",
        )

    resolved_status = resolve_invoice_status(
        payload.status,
        due_date=invoice.due_date,
        total_amount_cents=invoice.total_amount_cents,
        paid_amount_cents=invoice.paid_amount_cents,
    )
    if invoice.status == resolved_status:
        return InvoiceRead.model_validate(serialize_invoice(invoice))

    previous_status = invoice.status
    invoice.status = resolved_status
    invoice.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.STATUS_CHANGE,
        target_type="invoice",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "status": {
                "from": previous_status.value,
                "to": invoice.status.value,
            }
        },
    )
    db.commit()
    db.refresh(invoice)
    if invoice.customer is None:
        db.refresh(invoice, attribute_names=["customer"])
    return InvoiceRead.model_validate(
        serialize_invoice(
            invoice,
            worksite_name=get_worksite_name_or_404(context.organization.id, invoice.worksite_id),
        )
    )


@router.post(
    "/{organization_id}/invoices/{invoice_id}/payment",
    response_model=InvoiceRead,
)
def record_invoice_payment(
    organization_id: UUID,
    invoice_id: UUID,
    payload: InvoicePaymentCreateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    if payload.paid_amount_cents > invoice.total_amount_cents:
        raise HTTPException(
            status_code=400,
            detail="Le montant payé ne peut pas dépasser le total de la facture.",
        )

    previous_status = invoice.status
    previous_paid_amount_cents = invoice.paid_amount_cents
    previous_paid_at = invoice.paid_at
    invoice.paid_amount_cents = payload.paid_amount_cents
    invoice.paid_at = payload.paid_at
    invoice.status = resolve_invoice_status(
        InvoiceStatus.ISSUED,
        due_date=invoice.due_date,
        total_amount_cents=invoice.total_amount_cents,
        paid_amount_cents=invoice.paid_amount_cents,
        today=payload.paid_at,
    )
    invoice.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="invoice_payment",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "paid_amount_cents": {
                "from": previous_paid_amount_cents,
                "to": invoice.paid_amount_cents,
            },
            "paid_at": {
                "from": previous_paid_at.isoformat() if previous_paid_at else None,
                "to": invoice.paid_at.isoformat(),
            },
            "status": {
                "from": previous_status.value,
                "to": invoice.status.value,
            },
            "outstanding_amount_cents": compute_outstanding_amount_cents(
                invoice.total_amount_cents,
                invoice.paid_amount_cents,
            ),
        },
    )
    db.commit()
    db.refresh(invoice)
    if invoice.customer is None:
        db.refresh(invoice, attribute_names=["customer"])
    return InvoiceRead.model_validate(
        serialize_invoice(
            invoice,
            worksite_name=get_worksite_name_or_404(context.organization.id, invoice.worksite_id),
        )
    )


@router.patch(
    "/{organization_id}/invoices/{invoice_id}/worksite",
    response_model=InvoiceRead,
)
def update_invoice_worksite(
    organization_id: UUID,
    invoice_id: UUID,
    payload: InvoiceWorksiteLinkUpdateRequest,
    context: OrganizationAccessContext = Depends(require_billing_write),
    db: Session = Depends(get_db_session),
) -> InvoiceRead:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, payload.worksite_id)
    if invoice.worksite_id == payload.worksite_id:
        return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))

    previous_worksite_id = invoice.worksite_id
    invoice.worksite_id = payload.worksite_id
    invoice.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="invoice_worksite_link",
        target_id=invoice.id,
        target_display=invoice.number,
        changes={
            "worksite_id": {
                "from": str(previous_worksite_id) if previous_worksite_id else None,
                "to": str(payload.worksite_id) if payload.worksite_id else None,
            },
            "worksite_name": {
                "from": get_worksite_name_or_404(context.organization.id, previous_worksite_id),
                "to": worksite_name,
            },
        },
    )
    db.commit()
    db.refresh(invoice)
    if invoice.customer is None:
        db.refresh(invoice, attribute_names=["customer"])
    return InvoiceRead.model_validate(serialize_invoice(invoice, worksite_name=worksite_name))


@router.get(
    "/{organization_id}/invoices/{invoice_id}/pdf",
)
def download_invoice_pdf(
    organization_id: UUID,
    invoice_id: UUID,
    context: OrganizationAccessContext = Depends(require_billing_read),
    db: Session = Depends(get_db_session),
) -> Response:
    invoice = get_invoice_or_404(db, context.organization.id, invoice_id)
    customer = get_billing_customer_or_404(db, context.organization.id, invoice.customer_id)
    worksite_name = get_worksite_name_or_404(context.organization.id, invoice.worksite_id)
    pdf_bytes = build_invoice_pdf(
        context.organization,
        serialize_invoice(invoice, worksite_name=worksite_name),
        serialize_billing_customer(customer),
    )
    filename = f"facture-{invoice.number.lower()}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
    target_id: UUID | None = Query(default=None),
    target_type: list[str] | None = Query(default=None),
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> list[AuditLogRead]:
    logs = list_audit_logs(
        db,
        organization_id,
        limit=limit,
        target_id=target_id,
        target_types=target_type,
    )
    return [AuditLogRead.model_validate(log) for log in logs]


@router.get(
    "/{organization_id}/worksites",
    response_model=list[WorksiteSummaryRead],
)
def list_worksites(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
) -> list[WorksiteSummaryRead]:
    worksites = list_worksite_summaries(context.organization.id)
    return [WorksiteSummaryRead.model_validate(worksite) for worksite in worksites]


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
