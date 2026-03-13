from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Iterable, Mapping

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import BillingCustomer, Invoice, InvoiceStatus, Quote


def compute_billing_line_items(line_items: Iterable[Mapping[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    normalized_items: list[dict[str, Any]] = []
    subtotal_amount_cents = 0

    for line_item in line_items:
        description = str(line_item["description"]).strip()
        quantity = float(line_item["quantity"])
        unit_price_cents = int(line_item["unit_price_cents"])
        quantity_decimal = Decimal(str(quantity))
        line_total_cents = int(
            (quantity_decimal * Decimal(unit_price_cents)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        )
        normalized_items.append(
            {
                "description": description,
                "quantity": quantity,
                "unit_price_cents": unit_price_cents,
                "line_total_cents": line_total_cents,
            }
        )
        subtotal_amount_cents += line_total_cents

    return normalized_items, subtotal_amount_cents


def next_quote_sequence_number(db: Session, organization_id: object) -> int:
    current_max = db.execute(
        select(func.max(Quote.sequence_number)).where(Quote.organization_id == organization_id)
    ).scalar_one()
    return int(current_max or 0) + 1


def next_invoice_sequence_number(db: Session, organization_id: object) -> int:
    current_max = db.execute(
        select(func.max(Invoice.sequence_number)).where(Invoice.organization_id == organization_id)
    ).scalar_one()
    return int(current_max or 0) + 1


def format_quote_number(sequence_number: int) -> str:
    return f"DEV-{sequence_number:04d}"


def format_invoice_number(sequence_number: int) -> str:
    return f"FAC-{sequence_number:04d}"


def compute_outstanding_amount_cents(total_amount_cents: int, paid_amount_cents: int) -> int:
    return max(total_amount_cents - max(paid_amount_cents, 0), 0)


def resolve_invoice_status(
    status: InvoiceStatus,
    *,
    due_date: date | None,
    total_amount_cents: int,
    paid_amount_cents: int,
    today: date | None = None,
) -> InvoiceStatus:
    effective_today = today or date.today()
    if paid_amount_cents >= total_amount_cents and total_amount_cents > 0:
        return InvoiceStatus.PAID
    if status == InvoiceStatus.DRAFT:
        return InvoiceStatus.DRAFT
    if due_date is not None and due_date < effective_today:
        return InvoiceStatus.OVERDUE
    return InvoiceStatus.ISSUED


def serialize_billing_customer(customer: BillingCustomer) -> dict[str, object | None]:
    return {
        "id": customer.id,
        "version": customer.version,
        "created_at": customer.created_at,
        "updated_at": customer.updated_at,
        "deleted_at": customer.deleted_at,
        "organization_id": customer.organization_id,
        "name": customer.name,
        "customer_type": customer.customer_type,
        "email": customer.email,
        "phone": customer.phone,
        "address": customer.address,
        "notes": customer.notes,
    }


def serialize_quote(quote: Quote, *, worksite_name: str | None = None) -> dict[str, object | None]:
    return {
        "id": quote.id,
        "version": quote.version,
        "created_at": quote.created_at,
        "updated_at": quote.updated_at,
        "deleted_at": quote.deleted_at,
        "organization_id": quote.organization_id,
        "customer_id": quote.customer_id,
        "customer_name": quote.customer.name if quote.customer is not None else "",
        "worksite_id": quote.worksite_id,
        "worksite_name": worksite_name,
        "sequence_number": quote.sequence_number,
        "number": quote.number,
        "title": quote.title,
        "issue_date": quote.issue_date,
        "valid_until": quote.valid_until,
        "status": quote.status,
        "follow_up_status": quote.follow_up_status,
        "currency": quote.currency,
        "line_items": quote.line_items,
        "subtotal_amount_cents": quote.subtotal_amount_cents,
        "total_amount_cents": quote.total_amount_cents,
        "notes": quote.notes,
    }


def serialize_invoice(invoice: Invoice, *, worksite_name: str | None = None) -> dict[str, object | None]:
    status = resolve_invoice_status(
        invoice.status,
        due_date=invoice.due_date,
        total_amount_cents=invoice.total_amount_cents,
        paid_amount_cents=invoice.paid_amount_cents,
    )
    return {
        "id": invoice.id,
        "version": invoice.version,
        "created_at": invoice.created_at,
        "updated_at": invoice.updated_at,
        "deleted_at": invoice.deleted_at,
        "organization_id": invoice.organization_id,
        "customer_id": invoice.customer_id,
        "customer_name": invoice.customer.name if invoice.customer is not None else "",
        "worksite_id": invoice.worksite_id,
        "worksite_name": worksite_name,
        "sequence_number": invoice.sequence_number,
        "number": invoice.number,
        "title": invoice.title,
        "issue_date": invoice.issue_date,
        "due_date": invoice.due_date,
        "status": status,
        "follow_up_status": invoice.follow_up_status,
        "currency": invoice.currency,
        "line_items": invoice.line_items,
        "subtotal_amount_cents": invoice.subtotal_amount_cents,
        "total_amount_cents": invoice.total_amount_cents,
        "paid_amount_cents": invoice.paid_amount_cents,
        "paid_at": invoice.paid_at,
        "outstanding_amount_cents": compute_outstanding_amount_cents(
            invoice.total_amount_cents,
            invoice.paid_amount_cents,
        ),
        "notes": invoice.notes,
    }
