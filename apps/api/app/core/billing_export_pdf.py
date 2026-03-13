from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.regulatory_export_pdf import (
    PdfLine,
    append_blank,
    append_section_title,
    append_wrapped,
    render_simple_pdf,
)
from app.db.models.organization import Organization


def format_amount_cents(amount_cents: int, currency: str = "EUR") -> str:
    amount = amount_cents / 100
    if currency == "EUR":
        return f"{amount:,.2f} EUR".replace(",", " ").replace(".", ",")
    return f"{amount:,.2f} {currency}".replace(",", " ").replace(".", ",")


def format_quote_status(value: str) -> str:
    mapping = {
        "draft": "Brouillon",
        "sent": "Envoyé",
        "accepted": "Accepté",
        "declined": "Refusé",
    }
    return mapping.get(value, value)


def format_invoice_status(value: str) -> str:
    mapping = {
        "draft": "Brouillon",
        "issued": "Émise",
        "paid": "Payée",
        "overdue": "En retard",
    }
    return mapping.get(value, value)


def build_quote_pdf(
    organization: Organization,
    quote: dict[str, Any],
    customer: dict[str, Any],
) -> bytes:
    lines: list[PdfLine] = []
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")

    append_wrapped(lines, "Devis Conformeo", size=18, bold=True)
    append_wrapped(lines, f"Généré le {generated_at}", size=10)
    append_blank(lines)

    append_section_title(lines, "Entreprise")
    append_wrapped(lines, organization.name)
    append_wrapped(lines, organization.contact_email or "Email non renseigné")
    if organization.contact_phone:
        append_wrapped(lines, organization.contact_phone)
    if organization.headquarters_address:
        append_wrapped(lines, organization.headquarters_address)

    append_section_title(lines, "Client")
    append_wrapped(lines, customer["name"])
    if customer.get("email"):
        append_wrapped(lines, f"Email : {customer['email']}")
    if customer.get("phone"):
        append_wrapped(lines, f"Téléphone : {customer['phone']}")
    if customer.get("address"):
        append_wrapped(lines, f"Adresse : {customer['address']}")

    append_section_title(lines, "Devis")
    append_wrapped(lines, f"Numéro : {quote['number']}")
    append_wrapped(lines, f"Statut : {format_quote_status(quote['status'])}")
    append_wrapped(lines, f"Date : {quote['issue_date'].strftime('%d/%m/%Y')}")
    if quote.get("valid_until"):
        append_wrapped(lines, f"Valable jusqu'au : {quote['valid_until'].strftime('%d/%m/%Y')}")
    if quote.get("worksite_name"):
        append_wrapped(lines, f"Chantier lié : {quote['worksite_name']}")
    if quote.get("title"):
        append_wrapped(lines, f"Objet : {quote['title']}")

    append_section_title(lines, "Lignes")
    for item in quote["line_items"]:
        append_wrapped(
            lines,
            f"- {item['description']} | Qté {item['quantity']} | PU {format_amount_cents(item['unit_price_cents'], quote['currency'])} | Total {format_amount_cents(item['line_total_cents'], quote['currency'])}",
        )

    append_section_title(lines, "Total")
    append_wrapped(lines, format_amount_cents(quote["total_amount_cents"], quote["currency"]), size=14, bold=True)
    if quote.get("notes"):
        append_section_title(lines, "Notes")
        append_wrapped(lines, quote["notes"])

    return render_simple_pdf(lines)


def build_invoice_pdf(
    organization: Organization,
    invoice: dict[str, Any],
    customer: dict[str, Any],
) -> bytes:
    lines: list[PdfLine] = []
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")

    append_wrapped(lines, "Facture Conformeo", size=18, bold=True)
    append_wrapped(lines, f"Généré le {generated_at}", size=10)
    append_blank(lines)

    append_section_title(lines, "Entreprise")
    append_wrapped(lines, organization.name)
    append_wrapped(lines, organization.contact_email or "Email non renseigné")
    if organization.contact_phone:
        append_wrapped(lines, organization.contact_phone)
    if organization.headquarters_address:
        append_wrapped(lines, organization.headquarters_address)

    append_section_title(lines, "Client")
    append_wrapped(lines, customer["name"])
    if customer.get("email"):
        append_wrapped(lines, f"Email : {customer['email']}")
    if customer.get("phone"):
        append_wrapped(lines, f"Téléphone : {customer['phone']}")
    if customer.get("address"):
        append_wrapped(lines, f"Adresse : {customer['address']}")

    append_section_title(lines, "Facture")
    append_wrapped(lines, f"Numéro : {invoice['number']}")
    append_wrapped(lines, f"Statut : {format_invoice_status(invoice['status'])}")
    append_wrapped(lines, f"Date : {invoice['issue_date'].strftime('%d/%m/%Y')}")
    if invoice.get("due_date"):
        append_wrapped(lines, f"Échéance : {invoice['due_date'].strftime('%d/%m/%Y')}")
    if invoice.get("worksite_name"):
        append_wrapped(lines, f"Chantier lié : {invoice['worksite_name']}")
    if invoice.get("title"):
        append_wrapped(lines, f"Objet : {invoice['title']}")

    append_section_title(lines, "Lignes")
    for item in invoice["line_items"]:
        append_wrapped(
            lines,
            f"- {item['description']} | Qté {item['quantity']} | PU {format_amount_cents(item['unit_price_cents'], invoice['currency'])} | Total {format_amount_cents(item['line_total_cents'], invoice['currency'])}",
        )

    append_section_title(lines, "Total")
    append_wrapped(lines, f"Total : {format_amount_cents(invoice['total_amount_cents'], invoice['currency'])}", size=14, bold=True)
    append_wrapped(lines, f"Réglé : {format_amount_cents(invoice['paid_amount_cents'], invoice['currency'])}")
    append_wrapped(lines, f"Reste dû : {format_amount_cents(invoice['outstanding_amount_cents'], invoice['currency'])}")
    if invoice.get("paid_at"):
        append_wrapped(lines, f"Payée le : {invoice['paid_at'].strftime('%d/%m/%Y')}")
    if invoice.get("notes"):
        append_section_title(lines, "Notes")
        append_wrapped(lines, invoice["notes"])

    return render_simple_pdf(lines)
