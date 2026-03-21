from __future__ import annotations

from datetime import date, datetime, timezone
import logging
import re
from time import perf_counter
import unicodedata
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
from app.core.worksite_documents import (
    WORKSITE_DOCUMENT_LIFECYCLE_STATUSES,
    WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE,
    WORKSITE_SUMMARY_DOCUMENT_TYPE,
    build_worksite_document_storage_key,
    get_worksite_document_or_404,
    get_worksite_proof_document,
    get_worksite_signature_document,
    list_worksite_documents,
    list_worksite_proofs,
    list_worksite_signatures,
    register_generated_worksite_document,
    serialize_worksite_document,
    serialize_worksite_proof,
    serialize_worksite_signature,
    store_generated_worksite_document_content,
)
from app.core.worksite_coordination import (
    WORKSITE_COORDINATION_STATUSES,
    WORKSITE_COORDINATION_TARGET_DOCUMENT,
    WORKSITE_COORDINATION_TARGET_WORKSITE,
    build_worksite_coordination_index,
    ensure_worksite_coordination_item,
    list_worksite_coordination_items,
    serialize_worksite_coordination,
)
from app.core.worksites import get_worksite_summary, list_worksite_lookup, list_worksite_summaries
from app.core.worksite_export_pdf import build_worksite_prevention_plan_pdf, build_worksite_summary_pdf
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
    OrganizationMembership,
    OrganizationModuleCode,
    OrganizationSite,
    OrganizationSiteStatus,
    Quote,
    QuoteStatus,
    User,
    UserStatus,
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
from app.schemas.cockpit import CockpitSummaryRead
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
from app.schemas.worksite import (
    WorksiteAssigneeRead,
    WorksiteCoordinationUpdateRequest,
    WorksiteDocumentRead,
    WorksiteDocumentProofUpdateRequest,
    WorksiteDocumentSignatureUpdateRequest,
    WorksiteDocumentStatusUpdateRequest,
    WorksitePreventionPlanExportRequest,
    WorksiteProofRead,
    WorksiteSignatureRead,
    WorksiteSummaryRead,
)


router = APIRouter(prefix="/organizations", tags=["organizations"])
logger = logging.getLogger(__name__)

require_billing_read = require_module_enabled(OrganizationModuleCode.FACTURATION, "organization:read")
require_billing_write = require_module_enabled(OrganizationModuleCode.FACTURATION, "organization:update")
require_chantier_read = require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
require_chantier_write = require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:update")


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def normalize_search_text(value: str | None) -> str:
    if value is None:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"\s+", " ", ascii_value).strip().lower()


def slugify_filename(value: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", ascii_value).strip("-").lower()
    return slug or fallback


def find_worksite_billing_customer(
    db: Session,
    organization_id: UUID,
    client_name: str,
) -> dict[str, object | None] | None:
    target_name = normalize_search_text(client_name)
    if not target_name:
        return None

    customer = next(
        (
            item
            for item in list_billing_customers(db, organization_id)
            if normalize_search_text(item.name) == target_name
        ),
        None,
    )
    return serialize_billing_customer(customer) if customer is not None else None


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


def list_active_worksite_assignees(db: Session, organization_id: UUID) -> list[OrganizationMembership]:
    memberships = (
        db.execute(
            select(OrganizationMembership)
            .options(selectinload(OrganizationMembership.user))
            .where(
                OrganizationMembership.organization_id == organization_id,
                OrganizationMembership.deleted_at.is_(None),
            )
        )
        .scalars()
        .all()
    )
    return sorted(
        (
            membership
            for membership in memberships
            if membership.user is not None
            and membership.user.deleted_at is None
            and membership.user.status == UserStatus.ACTIVE
        ),
        key=lambda membership: (
            membership.user.display_name.lower(),
            membership.role_code,
        ),
    )


def build_worksite_summary_document_bundle(
    db: Session,
    organization_id: UUID,
    organization: object,
    worksite_id: UUID,
) -> tuple[dict[str, object], bytes, str, str]:
    worksite = get_worksite_summary(organization_id, worksite_id)
    if worksite is None:
        raise HTTPException(status_code=404, detail="Chantier introuvable pour cette organisation.")

    modules = list_organization_modules(db, organization_id)
    billing_module = next(
        (module for module in modules if module.module_code == OrganizationModuleCode.FACTURATION),
        None,
    )
    include_billing_documents = bool(billing_module and billing_module.is_enabled)
    quote_documents: list[dict[str, object]] = []
    invoice_documents: list[dict[str, object]] = []
    worksite_name = str(worksite["name"])

    if include_billing_documents:
        quote_documents = [
            serialize_quote(quote, worksite_name=worksite_name)
            for quote in list_quotes_for_organization(db, organization_id)
            if quote.worksite_id == worksite_id
        ]
        invoice_documents = [
            serialize_invoice(invoice, worksite_name=worksite_name)
            for invoice in list_invoices_for_organization(db, organization_id)
            if invoice.worksite_id == worksite_id
        ]

    pdf_bytes = build_worksite_summary_pdf(
        organization,
        worksite,
        quote_documents,
        invoice_documents,
        include_billing_documents=include_billing_documents,
    )
    filename = f"fiche-chantier-{slugify_filename(str(worksite['name']), 'chantier')}.pdf"
    notes = "Fiche chantier generee depuis la vue chantier."
    return worksite, pdf_bytes, filename, notes


def build_worksite_prevention_plan_document_bundle(
    db: Session,
    organization_id: UUID,
    organization: object,
    worksite_id: UUID,
    *,
    payload: WorksitePreventionPlanExportRequest | None = None,
) -> tuple[dict[str, object], bytes, str, str]:
    worksite = get_worksite_summary(organization_id, worksite_id)
    if worksite is None:
        raise HTTPException(status_code=404, detail="Chantier introuvable pour cette organisation.")

    modules = list_organization_modules(db, organization_id)
    billing_module = next(
        (module for module in modules if module.module_code == OrganizationModuleCode.FACTURATION),
        None,
    )
    matched_customer = (
        find_worksite_billing_customer(db, organization_id, str(worksite["client_name"]))
        if billing_module and billing_module.is_enabled
        else None
    )
    pdf_bytes = build_worksite_prevention_plan_pdf(
        organization,
        worksite,
        matched_customer,
        useful_date=payload.useful_date if payload is not None else None,
        intervention_context=payload.intervention_context if payload is not None else None,
        vigilance_points=payload.vigilance_points if payload is not None else None,
        measure_points=payload.measure_points if payload is not None else None,
        additional_contact=payload.additional_contact if payload is not None else None,
    )
    filename = f"plan-prevention-{slugify_filename(str(worksite['name']), 'chantier')}.pdf"
    notes = "Plan de prevention simplifie genere depuis le chantier."
    return worksite, pdf_bytes, filename, notes


def resolve_worksite_assignee_or_404(
    db: Session,
    organization_id: UUID,
    user_id: UUID | None,
) -> OrganizationMembership | None:
    if user_id is None:
        return None

    membership = next(
        (
            item
            for item in list_active_worksite_assignees(db, organization_id)
            if item.user_id == user_id
        ),
        None,
    )
    if membership is None:
        raise HTTPException(status_code=404, detail="Membre introuvable pour cette organisation.")
    return membership


def serialize_worksite_document_read(
    db: Session,
    organization_id: UUID,
    document: Document,
    *,
    coordination_index: dict[tuple[str, UUID], object] | None = None,
) -> WorksiteDocumentRead:
    linked_signature = None
    if document.linked_signature_document_id is not None:
        linked_signature = get_worksite_signature_document(
            db,
            organization_id,
            document.linked_signature_document_id,
        )
    linked_proofs: list[Document] = []
    for proof_document_id in document.linked_proof_document_ids or []:
        try:
            resolved_proof_document_id = UUID(str(proof_document_id))
        except (TypeError, ValueError):
            continue
        linked_proof = get_worksite_proof_document(
            db,
            organization_id,
            resolved_proof_document_id,
        )
        if linked_proof is not None:
            linked_proofs.append(linked_proof)

    resolved_coordination_index = coordination_index or build_worksite_coordination_index(
        list_worksite_coordination_items(db, organization_id)
    )
    coordination_item = resolved_coordination_index.get(
        (WORKSITE_COORDINATION_TARGET_DOCUMENT, document.id)
    )
    assignee_display_name = None
    if coordination_item is not None:
        if getattr(coordination_item, "assignee_user", None) is not None:
            assignee_display_name = coordination_item.assignee_user.display_name
        elif coordination_item.assignee_user_id is not None:
            assignee_user = db.get(User, coordination_item.assignee_user_id)
            if assignee_user is not None and assignee_user.deleted_at is None and assignee_user.status == UserStatus.ACTIVE:
                assignee_display_name = assignee_user.display_name

    return WorksiteDocumentRead.model_validate(
        serialize_worksite_document(
            document,
            worksite_name=get_worksite_name_or_404(organization_id, document.attached_to_entity_id) or "Chantier",
            linked_signature=linked_signature,
            linked_proofs=linked_proofs,
        )
        | {
            "coordination": serialize_worksite_coordination(
                coordination_item,
                target_type=WORKSITE_COORDINATION_TARGET_DOCUMENT,
                target_id=document.id,
                assignee_display_name_override=assignee_display_name,
            )
        }
    )


def serialize_worksite_summary_read(
    db: Session,
    organization_id: UUID,
    worksite: dict[str, object],
    *,
    coordination_index: dict[tuple[str, UUID], object] | None = None,
) -> WorksiteSummaryRead:
    worksite_id = UUID(str(worksite["id"]))
    resolved_coordination_index = coordination_index or build_worksite_coordination_index(
        list_worksite_coordination_items(db, organization_id)
    )
    coordination_item = resolved_coordination_index.get(
        (WORKSITE_COORDINATION_TARGET_WORKSITE, worksite_id)
    )
    assignee_display_name = None
    if coordination_item is not None:
        if getattr(coordination_item, "assignee_user", None) is not None:
            assignee_display_name = coordination_item.assignee_user.display_name
        elif coordination_item.assignee_user_id is not None:
            assignee_user = db.get(User, coordination_item.assignee_user_id)
            if assignee_user is not None and assignee_user.deleted_at is None and assignee_user.status == UserStatus.ACTIVE:
                assignee_display_name = assignee_user.display_name
    return WorksiteSummaryRead.model_validate(
        worksite
        | {
            "coordination": serialize_worksite_coordination(
                coordination_item,
                target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
                target_id=worksite_id,
                assignee_display_name_override=assignee_display_name,
            )
        }
    )


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


def is_module_enabled(modules: list[object], module_code: OrganizationModuleCode) -> bool:
    return any(
        getattr(module, "module_code", None) == module_code and bool(getattr(module, "is_enabled", False))
        for module in modules
    )


def format_cockpit_amount_cents(amount_cents: int, currency: str = "EUR") -> str:
    amount = amount_cents / 100
    formatted_amount = f"{amount:,.2f}".replace(",", " ").replace(".", ",")
    if currency == "EUR":
        return f"{formatted_amount} €"
    return f"{formatted_amount} {currency}"


def build_cockpit_summary(
    db: Session,
    organization_id: UUID,
    organization: object,
) -> CockpitSummaryRead:
    modules = list_organization_modules(db, organization_id)
    regulation_enabled = is_module_enabled(modules, OrganizationModuleCode.REGLEMENTATION)
    chantier_enabled = is_module_enabled(modules, OrganizationModuleCode.CHANTIER)
    billing_enabled = is_module_enabled(modules, OrganizationModuleCode.FACTURATION)

    kpis: list[dict[str, object]] = []
    alerts: list[dict[str, object]] = []
    module_cards: list[dict[str, object]] = []

    if billing_enabled:
        customers = list_billing_customers(db, organization_id)
        quotes = list_quotes_for_organization(db, organization_id)
        invoices = list_invoices_for_organization(db, organization_id)
        active_quotes_count = sum(1 for quote in quotes if quote.status in {QuoteStatus.DRAFT, QuoteStatus.SENT})
        quotes_to_follow_up_count = sum(1 for quote in quotes if quote.follow_up_status == "to_follow_up")

        pending_invoices_count = 0
        overdue_invoices_count = 0
        outstanding_amount_cents = 0
        invoice_currency = "EUR"
        for invoice in invoices:
            outstanding_amount = compute_outstanding_amount_cents(
                invoice.total_amount_cents,
                invoice.paid_amount_cents,
            )
            outstanding_amount_cents += outstanding_amount
            if outstanding_amount > 0:
                pending_invoices_count += 1
            resolved_status = resolve_invoice_status(
                invoice.status,
                due_date=invoice.due_date,
                total_amount_cents=invoice.total_amount_cents,
                paid_amount_cents=invoice.paid_amount_cents,
            )
            if resolved_status == InvoiceStatus.OVERDUE:
                overdue_invoices_count += 1
            if invoice.currency:
                invoice_currency = invoice.currency

        kpis.extend(
            [
                {
                    "id": "quotes-in-progress",
                    "label": "Devis en cours",
                    "value": str(active_quotes_count),
                    "detail": (
                        "Brouillons et devis envoyés à suivre."
                        if active_quotes_count > 0
                        else "Aucun devis en cours."
                    ),
                    "status_label": "À suivre" if active_quotes_count > 0 else "À jour",
                    "tone": "progress" if active_quotes_count > 0 else "success",
                },
                {
                    "id": "invoices-pending",
                    "label": "Factures en attente",
                    "value": str(pending_invoices_count),
                    "detail": (
                        f"{overdue_invoices_count} en retard."
                        if overdue_invoices_count > 0
                        else "Reste à encaisser ou à suivre."
                        if pending_invoices_count > 0
                        else "Aucune facture en attente."
                    ),
                    "status_label": (
                        "En retard"
                        if overdue_invoices_count > 0
                        else "En attente"
                        if pending_invoices_count > 0
                        else "À jour"
                    ),
                    "tone": (
                        "warning"
                        if overdue_invoices_count > 0
                        else "progress"
                        if pending_invoices_count > 0
                        else "success"
                    ),
                },
            ]
        )

        if overdue_invoices_count > 0:
            alerts.append(
                {
                    "id": "billing-overdue-invoices",
                    "title": "Factures en retard",
                    "description": (
                        f"{overdue_invoices_count} facture{'s dépassent' if overdue_invoices_count > 1 else ' dépasse'} "
                        f"l'échéance et demande{'nt' if overdue_invoices_count > 1 else ''} un suivi."
                    ),
                    "module_label": "Facturation",
                    "tone": "warning",
                    "priority": 1,
                }
            )

        if quotes_to_follow_up_count > 0:
            alerts.append(
                {
                    "id": "billing-quotes-follow-up",
                    "title": "Devis à relancer",
                    "description": (
                        f"{quotes_to_follow_up_count} devis "
                        f"{'sont marqués' if quotes_to_follow_up_count > 1 else 'est marqué'} à relancer."
                    ),
                    "module_label": "Facturation",
                    "tone": "progress",
                    "priority": 2,
                }
            )

        module_cards.append(
            {
                "id": "enterprise-facturation",
                "label": "Facturation",
                "headline": (
                    f"{pending_invoices_count} facture{'s' if pending_invoices_count > 1 else ''} à suivre"
                    if pending_invoices_count > 0
                    else f"{len(customers)} client{'s' if len(customers) > 1 else ''} actif{'s' if len(customers) > 1 else ''}"
                ),
                "detail": (
                    "Devis, factures et suivis utiles sont regroupés dans une lecture rapide."
                    if pending_invoices_count > 0 or active_quotes_count > 0 or quotes_to_follow_up_count > 0
                    else "Le module reste calme avec une lecture courte des clients et documents suivis."
                ),
                "highlights": [
                    {
                        "id": "facturation-invoices",
                        "label": "Factures",
                        "value": (
                            f"{pending_invoices_count} en attente"
                            f"{f' · {overdue_invoices_count} en retard' if overdue_invoices_count > 0 else ''}"
                            if pending_invoices_count > 0 or overdue_invoices_count > 0
                            else "Aucune facture à suivre"
                        ),
                    },
                    {
                        "id": "facturation-quotes",
                        "label": "Devis",
                        "value": (
                            f"{active_quotes_count} en cours"
                            f"{f' · {quotes_to_follow_up_count} à relancer' if quotes_to_follow_up_count > 0 else ''}"
                            if active_quotes_count > 0 or quotes_to_follow_up_count > 0
                            else "Aucun devis en cours"
                        ),
                    },
                    {
                        "id": "facturation-cash",
                        "label": "Encaissement",
                        "value": (
                            f"{format_cockpit_amount_cents(outstanding_amount_cents, invoice_currency)} en attente"
                            if outstanding_amount_cents > 0
                            else f"{len(customers)} client{'s' if len(customers) > 1 else ''} suivi{'s' if len(customers) > 1 else ''}"
                        ),
                    },
                ],
                "status_label": (
                    "À traiter"
                    if overdue_invoices_count > 0
                    else "À suivre"
                    if pending_invoices_count > 0 or quotes_to_follow_up_count > 0
                    else "À jour"
                ),
                "tone": (
                    "warning"
                    if overdue_invoices_count > 0
                    else "progress"
                    if pending_invoices_count > 0 or quotes_to_follow_up_count > 0
                    else "success"
                ),
            }
        )

    if regulation_enabled:
        sites = list_active_sites(db, organization_id)
        building_safety_items = list_building_safety_items(db, organization_id)
        building_safety_alerts = build_building_safety_alerts(building_safety_items)
        duerp_entries = list_duerp_entries(db, organization_id)
        regulatory_documents = list_regulatory_evidence_documents(db, organization_id)
        regulatory_profile = build_regulatory_profile_snapshot(
            organization,
            sites,
            building_safety_items=building_safety_items,
            duerp_entries=duerp_entries,
            documents=regulatory_documents,
        )
        regulatory_obligations = regulatory_profile.get("applicable_obligations", [])
        regulatory_obligations_to_verify_count = sum(
            1 for obligation in regulatory_obligations if obligation.get("status") == "to_verify"
        )
        overdue_regulatory_obligation_count = sum(
            1 for obligation in regulatory_obligations if obligation.get("status") == "overdue"
        )
        active_duerp_entries_count = sum(
            1 for entry in duerp_entries if entry.deleted_at is None and entry.status == DuerpEntryStatus.ACTIVE
        )
        building_safety_overdue_count = sum(
            1 for alert in building_safety_alerts if alert["alert_type"] == "overdue"
        )
        regulatory_action_count = (
            regulatory_obligations_to_verify_count
            + overdue_regulatory_obligation_count
            + len(building_safety_alerts)
        )

        kpis.append(
            {
                "id": "regulation-to-review",
                "label": "Réglementaire à vérifier",
                "value": str(regulatory_action_count),
                "detail": (
                    "Obligations ou contrôles à revoir."
                    if regulatory_action_count > 0
                    else "Aucun point réglementaire prioritaire."
                ),
                "status_label": (
                    "À traiter"
                    if building_safety_overdue_count > 0 or overdue_regulatory_obligation_count > 0
                    else "À vérifier"
                    if regulatory_action_count > 0
                    else "À jour"
                ),
                "tone": (
                    "warning"
                    if building_safety_overdue_count > 0 or overdue_regulatory_obligation_count > 0
                    else "progress"
                    if regulatory_action_count > 0
                    else "success"
                ),
            }
        )

        if building_safety_overdue_count > 0:
            alerts.append(
                {
                    "id": "regulation-building-safety-overdue",
                    "title": "Sécurité bâtiment à traiter",
                    "description": (
                        f"{building_safety_overdue_count} élément{'s' if building_safety_overdue_count > 1 else ''} "
                        f"sécurité {'sont en retard' if building_safety_overdue_count > 1 else 'est en retard'} de contrôle."
                    ),
                    "module_label": "Réglementation",
                    "tone": "warning",
                    "priority": 1,
                }
            )

        if regulatory_obligations_to_verify_count > 0:
            alerts.append(
                {
                    "id": "regulation-obligations-to-verify",
                    "title": "Obligations à vérifier",
                    "description": (
                        f"{regulatory_obligations_to_verify_count} obligation"
                        f"{'s demandent' if regulatory_obligations_to_verify_count > 1 else ' demande'} une vérification simple."
                    ),
                    "module_label": "Réglementation",
                    "tone": "progress",
                    "priority": 2,
                }
            )

        module_cards.append(
            {
                "id": "enterprise-reglementation",
                "label": "Réglementation",
                "headline": (
                    f"{regulatory_action_count} point{'s' if regulatory_action_count > 1 else ''} à revoir"
                    if regulatory_action_count > 0
                    else "Lecture apaisée"
                ),
                "detail": (
                    "Obligations, sécurité bâtiment et risques suivis ressortent dans une même lecture simple."
                    if regulatory_action_count > 0
                    else "Le module reste lisible avec des repères courts sur les obligations et la prévention."
                ),
                "highlights": [
                    {
                        "id": "reglementation-obligations",
                        "label": "Obligations",
                        "value": (
                            f"{regulatory_obligations_to_verify_count} à vérifier"
                            f"{f' · {overdue_regulatory_obligation_count} en retard' if overdue_regulatory_obligation_count > 0 else ''}"
                            if regulatory_obligations_to_verify_count > 0 or overdue_regulatory_obligation_count > 0
                            else "Aucune obligation à reprendre"
                        ),
                    },
                    {
                        "id": "reglementation-building-safety",
                        "label": "Sécurité bâtiment",
                        "value": (
                            f"{len(building_safety_alerts)} alerte{'s' if len(building_safety_alerts) > 1 else ''}"
                            f"{f' · {building_safety_overdue_count} contrôle{'s' if building_safety_overdue_count > 1 else ''} en retard' if building_safety_overdue_count > 0 else ''}"
                            if len(building_safety_alerts) > 0 or building_safety_overdue_count > 0
                            else "Aucun contrôle simple à revoir"
                        ),
                    },
                    {
                        "id": "reglementation-duerp",
                        "label": "DUERP",
                        "value": (
                            f"{active_duerp_entries_count} risque{'s' if active_duerp_entries_count > 1 else ''} "
                            f"suivi{'s' if active_duerp_entries_count > 1 else ''}"
                            if active_duerp_entries_count > 0
                            else "Aucun risque suivi pour le moment"
                        ),
                    },
                ],
                "status_label": (
                    "À traiter"
                    if building_safety_overdue_count > 0 or overdue_regulatory_obligation_count > 0
                    else "À vérifier"
                    if regulatory_action_count > 0
                    else "À jour"
                ),
                "tone": (
                    "warning"
                    if building_safety_overdue_count > 0 or overdue_regulatory_obligation_count > 0
                    else "progress"
                    if regulatory_action_count > 0
                    else "success"
                ),
            }
        )

    if chantier_enabled:
        worksites = list_worksite_summaries(organization_id)
        worksite_documents = list_worksite_documents(db, organization_id)
        blocked_worksites_count = sum(1 for worksite in worksites if worksite["status"] == "blocked")
        planned_worksites_count = sum(1 for worksite in worksites if worksite["status"] == "planned")
        worksites_needing_action_count = blocked_worksites_count + planned_worksites_count
        finalized_worksite_documents_count = sum(
            1 for document in worksite_documents if document.lifecycle_status == "finalized"
        )
        linked_worksite_signatures_count = sum(
            1 for document in worksite_documents if document.linked_signature_document_id is not None
        )
        linked_worksite_proofs_count = sum(
            len(document.linked_proof_document_ids or [])
            for document in worksite_documents
        )

        kpis.append(
            {
                "id": "worksites-needing-action",
                "label": "Chantiers nécessitant une action",
                "value": str(worksites_needing_action_count),
                "detail": (
                    "Bloqués ou à préparer."
                    if worksites_needing_action_count > 0
                    else "Aucun chantier prioritaire."
                ),
                "status_label": (
                    "Bloqués"
                    if blocked_worksites_count > 0
                    else "À préparer"
                    if worksites_needing_action_count > 0
                    else "À jour"
                ),
                "tone": (
                    "warning"
                    if blocked_worksites_count > 0
                    else "progress"
                    if worksites_needing_action_count > 0
                    else "success"
                ),
            }
        )

        if blocked_worksites_count > 0:
            alerts.append(
                {
                    "id": "worksites-blocked",
                    "title": "Chantiers bloqués",
                    "description": (
                        f"{blocked_worksites_count} chantier"
                        f"{'s sont' if blocked_worksites_count > 1 else ' est'} bloqué"
                        f"{'s' if blocked_worksites_count > 1 else ''} et nécessite"
                        f"{'nt' if blocked_worksites_count > 1 else ''} une action."
                    ),
                    "module_label": "Chantier",
                    "tone": "warning",
                    "priority": 1,
                }
            )
        elif planned_worksites_count > 0:
            alerts.append(
                {
                    "id": "worksites-planned",
                    "title": "Chantiers à préparer",
                    "description": (
                        f"{planned_worksites_count} chantier"
                        f"{'s sont' if planned_worksites_count > 1 else ' est'} planifié"
                        f"{'s' if planned_worksites_count > 1 else ''} et mérite"
                        f"{'nt' if planned_worksites_count > 1 else ''} une préparation simple."
                    ),
                    "module_label": "Chantier",
                    "tone": "calm",
                    "priority": 3,
                }
            )

        module_cards.append(
            {
                "id": "enterprise-chantier",
                "label": "Chantier",
                "headline": (
                    f"{len(worksites)} chantier{'s' if len(worksites) > 1 else ''} suivi{'s' if len(worksites) > 1 else ''}"
                    if len(worksites) > 0
                    else "Aucun chantier"
                ),
                "detail": (
                    "Statut terrain, documents chantier et repères liés restent regroupés ici."
                    if len(worksites) > 0
                    else "Le module chantier pourra remonter ici ses signaux utiles."
                ),
                "highlights": [
                    {
                        "id": "chantier-worksites",
                        "label": "Actions terrain",
                        "value": (
                            f"{blocked_worksites_count} bloqué{'s' if blocked_worksites_count > 1 else ''}"
                            f" · {planned_worksites_count} à préparer"
                            if worksites_needing_action_count > 0
                            else "Aucun signal terrain prioritaire"
                        ),
                    },
                    {
                        "id": "chantier-documents",
                        "label": "Documents chantier",
                        "value": (
                            f"{len(worksite_documents)} généré{'s' if len(worksite_documents) > 1 else ''}"
                            f" · {finalized_worksite_documents_count} finalisé{'s' if finalized_worksite_documents_count > 1 else ''}"
                            if len(worksite_documents) > 0
                            else "Aucun document chantier généré"
                        ),
                    },
                    {
                        "id": "chantier-links",
                        "label": "Éléments liés",
                        "value": (
                            f"{linked_worksite_signatures_count} signature{'s' if linked_worksite_signatures_count > 1 else ''}"
                            f" · {linked_worksite_proofs_count} preuve{'s' if linked_worksite_proofs_count > 1 else ''}"
                            if linked_worksite_signatures_count > 0 or linked_worksite_proofs_count > 0
                            else "Aucune signature ou preuve liée"
                        ),
                    },
                ],
                "status_label": (
                    "À traiter"
                    if blocked_worksites_count > 0
                    else "À préparer"
                    if planned_worksites_count > 0
                    else "À jour"
                ),
                "tone": (
                    "warning"
                    if blocked_worksites_count > 0
                    else "progress"
                    if len(worksites) > 0 and planned_worksites_count > 0
                    else "success"
                ),
            }
        )

    return CockpitSummaryRead.model_validate(
        {
            "kpis": kpis,
            "alerts": sorted(
                alerts,
                key=lambda item: (int(item["priority"]), str(item["title"])),
            )[:6],
            "module_cards": module_cards,
        }
    )


@router.get(
    "/{organization_id}/profile",
    response_model=OrganizationRead,
)
def read_profile(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
) -> OrganizationRead:
    return OrganizationRead.model_validate(context.organization)


@router.get(
    "/{organization_id}/cockpit-summary",
    response_model=CockpitSummaryRead,
)
def read_cockpit_summary(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_permissions("organization:read")),
    db: Session = Depends(get_db_session),
) -> CockpitSummaryRead:
    return build_cockpit_summary(db, context.organization.id, context.organization)


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
    started_at = perf_counter()
    logger.info(
        "building-safety-alerts start organization_id=%s site_id=%s user_id=%s",
        context.organization.id,
        site_id,
        context.user.id,
    )
    try:
        if site_id is not None:
            get_site_or_404(db, context.organization.id, site_id)
        items = list_building_safety_items(db, context.organization.id, site_id)
        alerts = build_building_safety_alerts(items)
        logger.info(
            "building-safety-alerts done organization_id=%s site_id=%s items=%s alerts=%s duration_ms=%s",
            context.organization.id,
            site_id,
            len(items),
            len(alerts),
            round((perf_counter() - started_at) * 1000),
        )
        return [BuildingSafetyAlertRead.model_validate(alert) for alert in alerts]
    except Exception:
        logger.exception(
            "building-safety-alerts failed organization_id=%s site_id=%s duration_ms=%s",
            context.organization.id,
            site_id,
            round((perf_counter() - started_at) * 1000),
        )
        raise


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
    started_at = perf_counter()
    logger.info(
        "duerp-entries start organization_id=%s site_id=%s user_id=%s",
        context.organization.id,
        site_id,
        context.user.id,
    )
    try:
        if site_id is not None:
            get_site_or_404(db, context.organization.id, site_id)
        entries = list_duerp_entries(db, context.organization.id, site_id)
        documents = list_regulatory_evidence_documents(db, context.organization.id)
        indexes = build_regulatory_evidence_indexes(documents)
        logger.info(
            "duerp-entries done organization_id=%s site_id=%s entries=%s evidences=%s duration_ms=%s",
            context.organization.id,
            site_id,
            len(entries),
            len(documents),
            round((perf_counter() - started_at) * 1000),
        )
        return [
            DuerpEntryRead.model_validate(
                serialize_duerp_entry(entry, indexes["duerp_entry_counts"].get(str(entry.id), 0))
            )
            for entry in entries
        ]
    except Exception:
        logger.exception(
            "duerp-entries failed organization_id=%s site_id=%s duration_ms=%s",
            context.organization.id,
            site_id,
            round((perf_counter() - started_at) * 1000),
        )
        raise


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
    started_at = perf_counter()
    logger.info(
        "regulatory-evidences start organization_id=%s site_id=%s user_id=%s",
        context.organization.id,
        site_id,
        context.user.id,
    )
    try:
        if site_id is not None:
            get_site_or_404(db, context.organization.id, site_id)

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

        payload = [
            serialize_regulatory_evidence(document, obligation_titles, site_lookup, building_safety_lookup, duerp_lookup)
            for document in documents
        ]
        if site_id is not None:
            payload = [item for item in payload if str(item["site_id"]) == str(site_id)]
        logger.info(
            "regulatory-evidences done organization_id=%s site_id=%s sites=%s building_items=%s duerp_entries=%s evidences=%s duration_ms=%s",
            context.organization.id,
            site_id,
            len(sites),
            len(building_safety_items),
            len(duerp_entries),
            len(payload),
            round((perf_counter() - started_at) * 1000),
        )
        return [RegulatoryEvidenceRead.model_validate(item) for item in payload]
    except Exception:
        logger.exception(
            "regulatory-evidences failed organization_id=%s site_id=%s duration_ms=%s",
            context.organization.id,
            site_id,
            round((perf_counter() - started_at) * 1000),
        )
        raise


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
    db: Session = Depends(get_db_session),
) -> list[WorksiteSummaryRead]:
    coordination_index = build_worksite_coordination_index(
        list_worksite_coordination_items(db, context.organization.id)
    )
    worksites = list_worksite_summaries(context.organization.id)
    return [
        serialize_worksite_summary_read(
            db,
            context.organization.id,
            worksite,
            coordination_index=coordination_index,
        )
        for worksite in worksites
    ]


@router.get(
    "/{organization_id}/worksite-assignees",
    response_model=list[WorksiteAssigneeRead],
)
def list_worksite_assignees(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "users:read")
    ),
    db: Session = Depends(get_db_session),
) -> list[WorksiteAssigneeRead]:
    return [
        WorksiteAssigneeRead(
            user_id=membership.user_id,
            display_name=membership.user.display_name,
            role_code=membership.role_code,
        )
        for membership in list_active_worksite_assignees(db, context.organization.id)
    ]


@router.get(
    "/{organization_id}/worksite-documents",
    response_model=list[WorksiteDocumentRead],
)
def list_linked_worksite_documents(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(require_chantier_read),
    db: Session = Depends(get_db_session),
) -> list[WorksiteDocumentRead]:
    coordination_index = build_worksite_coordination_index(
        list_worksite_coordination_items(db, context.organization.id)
    )
    documents = list_worksite_documents(db, context.organization.id)
    return [
        serialize_worksite_document_read(
            db,
            context.organization.id,
            document,
            coordination_index=coordination_index,
        )
        for document in documents
    ]


@router.get(
    "/{organization_id}/worksite-signatures",
    response_model=list[WorksiteSignatureRead],
)
def list_linked_worksite_signatures(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
    ),
    db: Session = Depends(get_db_session),
) -> list[WorksiteSignatureRead]:
    signatures = list_worksite_signatures(db, context.organization.id)
    return [
        WorksiteSignatureRead.model_validate(
            serialize_worksite_signature(
                signature,
                worksite_name=get_worksite_name_or_404(context.organization.id, signature.attached_to_entity_id)
                or "Chantier",
            )
        )
        for signature in signatures
    ]


@router.get(
    "/{organization_id}/worksite-proofs",
    response_model=list[WorksiteProofRead],
)
def list_linked_worksite_proofs(
    organization_id: UUID,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
    ),
    db: Session = Depends(get_db_session),
) -> list[WorksiteProofRead]:
    proofs = list_worksite_proofs(db, context.organization.id)
    return [
        WorksiteProofRead.model_validate(
            serialize_worksite_proof(
                proof,
                worksite_name=get_worksite_name_or_404(context.organization.id, proof.attached_to_entity_id)
                or "Chantier",
            )
        )
        for proof in proofs
    ]


@router.patch(
    "/{organization_id}/worksite-documents/{document_id}/status",
    response_model=WorksiteDocumentRead,
)
def update_worksite_document_status(
    organization_id: UUID,
    document_id: UUID,
    payload: WorksiteDocumentStatusUpdateRequest,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:update")
    ),
    db: Session = Depends(get_db_session),
) -> WorksiteDocumentRead:
    document = get_worksite_document_or_404(db, context.organization.id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document chantier introuvable pour cette organisation.")

    if payload.lifecycle_status not in WORKSITE_DOCUMENT_LIFECYCLE_STATUSES:
        raise HTTPException(status_code=400, detail="Statut de document chantier invalide.")

    previous_lifecycle_status = document.lifecycle_status or "draft"
    if previous_lifecycle_status == payload.lifecycle_status:
        return serialize_worksite_document_read(db, context.organization.id, document)

    document.lifecycle_status = payload.lifecycle_status
    document.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="worksite_document",
        target_id=document.id,
        target_display=document.file_name,
        changes={
            "lifecycle_status": {
                "from": previous_lifecycle_status,
                "to": payload.lifecycle_status,
            },
            "worksite_id": str(document.attached_to_entity_id),
        },
    )
    db.commit()
    db.refresh(document)
    return serialize_worksite_document_read(db, context.organization.id, document)


@router.patch(
    "/{organization_id}/worksite-documents/{document_id}/signature",
    response_model=WorksiteDocumentRead,
)
def update_worksite_document_signature(
    organization_id: UUID,
    document_id: UUID,
    payload: WorksiteDocumentSignatureUpdateRequest,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:update")
    ),
    db: Session = Depends(get_db_session),
) -> WorksiteDocumentRead:
    document = get_worksite_document_or_404(db, context.organization.id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document chantier introuvable pour cette organisation.")

    previous_signature_document_id = document.linked_signature_document_id
    next_signature_document_id = payload.signature_document_id
    if previous_signature_document_id == next_signature_document_id:
        return serialize_worksite_document_read(db, context.organization.id, document)

    linked_signature = None
    if next_signature_document_id is not None:
        linked_signature = get_worksite_signature_document(
            db,
            context.organization.id,
            next_signature_document_id,
        )
        if linked_signature is None:
            raise HTTPException(status_code=404, detail="Signature chantier introuvable pour cette organisation.")
        if linked_signature.attached_to_entity_id != document.attached_to_entity_id:
            raise HTTPException(
                status_code=400,
                detail="La signature choisie doit appartenir au meme chantier que le document.",
            )

    document.linked_signature_document_id = next_signature_document_id
    document.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="worksite_document",
        target_id=document.id,
        target_display=document.file_name,
        changes={
            "linked_signature_document_id": {
                "from": str(previous_signature_document_id) if previous_signature_document_id is not None else None,
                "to": str(next_signature_document_id) if next_signature_document_id is not None else None,
            },
            "worksite_id": str(document.attached_to_entity_id),
        },
    )
    db.commit()
    db.refresh(document)
    return serialize_worksite_document_read(db, context.organization.id, document)


@router.patch(
    "/{organization_id}/worksite-documents/{document_id}/proofs",
    response_model=WorksiteDocumentRead,
)
def update_worksite_document_proofs(
    organization_id: UUID,
    document_id: UUID,
    payload: WorksiteDocumentProofUpdateRequest,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:update")
    ),
    db: Session = Depends(get_db_session),
) -> WorksiteDocumentRead:
    document = get_worksite_document_or_404(db, context.organization.id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document chantier introuvable pour cette organisation.")

    normalized_next_proof_ids: list[str] = []
    for proof_document_id in payload.proof_document_ids:
        proof = get_worksite_proof_document(db, context.organization.id, proof_document_id)
        if proof is None:
            raise HTTPException(status_code=404, detail="Preuve chantier introuvable pour cette organisation.")
        if proof.attached_to_entity_id != document.attached_to_entity_id:
            raise HTTPException(
                status_code=400,
                detail="Les preuves choisies doivent appartenir au meme chantier que le document.",
            )
        normalized_proof_id = str(proof_document_id)
        if normalized_proof_id not in normalized_next_proof_ids:
            normalized_next_proof_ids.append(normalized_proof_id)

    previous_proof_ids = [str(value) for value in (document.linked_proof_document_ids or [])]
    if previous_proof_ids == normalized_next_proof_ids:
        return serialize_worksite_document_read(db, context.organization.id, document)

    document.linked_proof_document_ids = normalized_next_proof_ids
    document.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="worksite_document",
        target_id=document.id,
        target_display=document.file_name,
        changes={
            "linked_proof_document_ids": {
                "from": previous_proof_ids,
                "to": normalized_next_proof_ids,
            },
            "worksite_id": str(document.attached_to_entity_id),
        },
    )
    db.commit()
    db.refresh(document)
    return serialize_worksite_document_read(db, context.organization.id, document)


@router.patch(
    "/{organization_id}/worksites/{worksite_id}/coordination",
    response_model=WorksiteSummaryRead,
)
def update_worksite_coordination(
    organization_id: UUID,
    worksite_id: UUID,
    payload: WorksiteCoordinationUpdateRequest,
    context: OrganizationAccessContext = Depends(require_chantier_write),
    db: Session = Depends(get_db_session),
) -> WorksiteSummaryRead:
    worksite = get_worksite_summary(context.organization.id, worksite_id)
    if worksite is None:
        raise HTTPException(status_code=404, detail="Chantier introuvable pour cette organisation.")

    if payload.status not in WORKSITE_COORDINATION_STATUSES:
        raise HTTPException(status_code=400, detail="Statut de suivi chantier invalide.")

    assignee_membership = resolve_worksite_assignee_or_404(
        db,
        context.organization.id,
        payload.assignee_user_id,
    )
    item = ensure_worksite_coordination_item(
        db,
        context.organization.id,
        target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
        target_id=worksite_id,
    )
    next_comment_text = normalize_optional_text(payload.comment_text)
    previous_state = serialize_worksite_coordination(
        item,
        target_type=WORKSITE_COORDINATION_TARGET_WORKSITE,
        target_id=worksite_id,
    )

    item.status = payload.status
    item.assignee_user_id = assignee_membership.user_id if assignee_membership is not None else None
    item.comment_text = next_comment_text
    item.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="worksite_coordination",
        target_id=worksite_id,
        target_display=str(worksite["name"]),
        changes={
            "status": {"from": previous_state["status"], "to": payload.status},
            "assignee_user_id": {
                "from": previous_state["assignee_user_id"],
                "to": str(assignee_membership.user_id) if assignee_membership is not None else None,
            },
            "comment_text": {
                "from": previous_state["comment_text"],
                "to": next_comment_text,
            },
        },
    )
    db.commit()
    db.refresh(item)
    refreshed_worksite = get_worksite_summary(context.organization.id, worksite_id)
    if refreshed_worksite is None:
        raise HTTPException(status_code=404, detail="Chantier introuvable pour cette organisation.")
    return serialize_worksite_summary_read(db, context.organization.id, refreshed_worksite)


@router.patch(
    "/{organization_id}/worksite-documents/{document_id}/coordination",
    response_model=WorksiteDocumentRead,
)
def update_worksite_document_coordination(
    organization_id: UUID,
    document_id: UUID,
    payload: WorksiteCoordinationUpdateRequest,
    context: OrganizationAccessContext = Depends(require_chantier_write),
    db: Session = Depends(get_db_session),
) -> WorksiteDocumentRead:
    document = get_worksite_document_or_404(db, context.organization.id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document chantier introuvable pour cette organisation.")

    if payload.status not in WORKSITE_COORDINATION_STATUSES:
        raise HTTPException(status_code=400, detail="Statut de suivi de document invalide.")

    assignee_membership = resolve_worksite_assignee_or_404(
        db,
        context.organization.id,
        payload.assignee_user_id,
    )
    item = ensure_worksite_coordination_item(
        db,
        context.organization.id,
        target_type=WORKSITE_COORDINATION_TARGET_DOCUMENT,
        target_id=document.id,
    )
    next_comment_text = normalize_optional_text(payload.comment_text)
    previous_state = serialize_worksite_coordination(
        item,
        target_type=WORKSITE_COORDINATION_TARGET_DOCUMENT,
        target_id=document.id,
    )

    item.status = payload.status
    item.assignee_user_id = assignee_membership.user_id if assignee_membership is not None else None
    item.comment_text = next_comment_text
    item.version += 1
    record_audit_log(
        db,
        organization_id=context.organization.id,
        actor_user=context.user,
        action_type=AuditAction.UPDATE,
        target_type="worksite_document_coordination",
        target_id=document.id,
        target_display=document.file_name,
        changes={
            "status": {"from": previous_state["status"], "to": payload.status},
            "assignee_user_id": {
                "from": previous_state["assignee_user_id"],
                "to": str(assignee_membership.user_id) if assignee_membership is not None else None,
            },
            "comment_text": {
                "from": previous_state["comment_text"],
                "to": next_comment_text,
            },
            "worksite_id": str(document.attached_to_entity_id),
        },
    )
    db.commit()
    db.refresh(document)
    return serialize_worksite_document_read(db, context.organization.id, document)


@router.get(
    "/{organization_id}/worksites/{worksite_id}/summary.pdf",
)
def download_worksite_summary_pdf(
    organization_id: UUID,
    worksite_id: UUID,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
    ),
    db: Session = Depends(get_db_session),
) -> Response:
    _, pdf_bytes, filename, notes = build_worksite_summary_document_bundle(
        db,
        context.organization.id,
        context.organization,
        worksite_id,
    )
    register_generated_worksite_document(
        db,
        organization_id=context.organization.id,
        worksite_id=worksite_id,
        document_type=WORKSITE_SUMMARY_DOCUMENT_TYPE,
        file_name=filename,
        pdf_bytes=pdf_bytes,
        uploaded_by_user_id=context.user.id,
        notes=notes,
    )
    db.commit()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf",
)
def download_worksite_prevention_plan_pdf(
    organization_id: UUID,
    worksite_id: UUID,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
    ),
    db: Session = Depends(get_db_session),
) -> Response:
    _, pdf_bytes, filename, notes = build_worksite_prevention_plan_document_bundle(
        db,
        context.organization.id,
        context.organization,
        worksite_id,
    )
    register_generated_worksite_document(
        db,
        organization_id=context.organization.id,
        worksite_id=worksite_id,
        document_type=WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE,
        file_name=filename,
        pdf_bytes=pdf_bytes,
        uploaded_by_user_id=context.user.id,
        notes=notes,
    )
    db.commit()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/{organization_id}/worksites/{worksite_id}/prevention-plan.pdf",
)
def export_adjusted_worksite_prevention_plan_pdf(
    organization_id: UUID,
    worksite_id: UUID,
    payload: WorksitePreventionPlanExportRequest,
    context: OrganizationAccessContext = Depends(
        require_module_enabled(OrganizationModuleCode.CHANTIER, "organization:read")
    ),
    db: Session = Depends(get_db_session),
) -> Response:
    _, pdf_bytes, filename, notes = build_worksite_prevention_plan_document_bundle(
        db,
        context.organization.id,
        context.organization,
        worksite_id,
        payload=payload,
    )
    register_generated_worksite_document(
        db,
        organization_id=context.organization.id,
        worksite_id=worksite_id,
        document_type=WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE,
        file_name=filename,
        pdf_bytes=pdf_bytes,
        uploaded_by_user_id=context.user.id,
        notes=notes,
    )
    db.commit()
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get(
    "/{organization_id}/worksite-documents/{document_id}/download",
)
def download_generated_worksite_document(
    organization_id: UUID,
    document_id: UUID,
    context: OrganizationAccessContext = Depends(require_chantier_read),
    db: Session = Depends(get_db_session),
) -> Response:
    document = get_worksite_document_or_404(db, context.organization.id, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document chantier introuvable pour cette organisation.")

    pdf_bytes = document.content_bytes
    if pdf_bytes is None:
        if document.document_type == WORKSITE_SUMMARY_DOCUMENT_TYPE:
            _, pdf_bytes, _, _ = build_worksite_summary_document_bundle(
                db,
                context.organization.id,
                context.organization,
                document.attached_to_entity_id,
            )
        elif document.document_type == WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE:
            _, pdf_bytes, _, _ = build_worksite_prevention_plan_document_bundle(
                db,
                context.organization.id,
                context.organization,
                document.attached_to_entity_id,
            )
        else:
            raise HTTPException(
                status_code=409,
                detail="Ce document chantier ne dispose pas encore d'un fichier récupérable.",
            )

        document.version += 1
        document.storage_key = build_worksite_document_storage_key(
            document.attached_to_entity_id,
            document.document_type,
        )
        store_generated_worksite_document_content(document, pdf_bytes)
        db.commit()
        db.refresh(document)

    filename = document.file_name.strip() if document.file_name else "document-chantier.pdf"
    media_type = document.mime_type or "application/pdf"
    return Response(
        content=document.content_bytes or pdf_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


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
