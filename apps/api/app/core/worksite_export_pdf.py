from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.billing_export_pdf import (
    format_amount_cents,
    format_invoice_status,
    format_quote_status,
)
from app.core.regulatory_export_pdf import (
    PdfLine,
    append_blank,
    append_section_title,
    append_wrapped,
    render_simple_pdf,
)
from app.db.models.organization import Organization


def format_worksite_status(value: str) -> str:
    mapping = {
        "planned": "Planifié",
        "in_progress": "En cours",
        "blocked": "Bloqué",
        "completed": "Terminé",
    }
    return mapping.get(value, value)


def format_datetime_value(value: Any) -> str | None:
    if not isinstance(value, datetime):
        return None
    return value.strftime("%d/%m/%Y %H:%M")


def build_worksite_summary_pdf(
    organization: Organization,
    worksite: dict[str, Any],
    quotes: list[dict[str, Any]],
    invoices: list[dict[str, Any]],
    *,
    include_billing_documents: bool,
) -> bytes:
    lines: list[PdfLine] = []
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")
    outstanding_amount_cents = sum(int(invoice.get("outstanding_amount_cents", 0) or 0) for invoice in invoices)
    overdue_invoices = sum(1 for invoice in invoices if invoice.get("status") == "overdue")

    append_wrapped(lines, "Fiche chantier Conformeo", size=18, bold=True)
    append_wrapped(lines, f"Généré le {generated_at}", size=10)
    append_blank(lines)

    append_section_title(lines, "Entreprise")
    append_wrapped(lines, organization.name)
    append_wrapped(lines, organization.contact_email or "Email non renseigné")
    if organization.contact_phone:
        append_wrapped(lines, organization.contact_phone)

    append_section_title(lines, "Chantier")
    append_wrapped(lines, str(worksite["name"]))
    append_wrapped(lines, f"Client : {worksite['client_name']}")
    append_wrapped(lines, f"Adresse : {worksite['address']}")
    append_wrapped(lines, f"Statut : {format_worksite_status(str(worksite['status']))}")
    planned_for = format_datetime_value(worksite.get("planned_for"))
    updated_at = format_datetime_value(worksite.get("updated_at"))
    if planned_for:
        append_wrapped(lines, f"Prévu le : {planned_for}")
    if updated_at:
        append_wrapped(lines, f"Dernière mise à jour : {updated_at}")

    append_section_title(lines, "Repères utiles")
    append_wrapped(lines, f"Devis liés : {len(quotes)}")
    append_wrapped(lines, f"Factures liées : {len(invoices)}")
    if include_billing_documents:
        append_wrapped(lines, f"Montant en attente : {format_amount_cents(outstanding_amount_cents)}")
        append_wrapped(lines, f"Factures en retard : {overdue_invoices}")
    else:
        append_wrapped(lines, "Module Facturation non activé : documents liés non affichés.")

    if include_billing_documents and quotes:
        append_section_title(lines, "Devis liés")
        for quote in quotes:
            append_wrapped(
                lines,
                f"- {quote['number']} | {format_quote_status(quote['status'])} | {format_amount_cents(int(quote['total_amount_cents']), quote['currency'])}",
            )

    if include_billing_documents and invoices:
        append_section_title(lines, "Factures liées")
        for invoice in invoices:
            append_wrapped(
                lines,
                f"- {invoice['number']} | {format_invoice_status(invoice['status'])} | Total {format_amount_cents(int(invoice['total_amount_cents']), invoice['currency'])} | Reste dû {format_amount_cents(int(invoice['outstanding_amount_cents']), invoice['currency'])}",
            )

    return render_simple_pdf(lines)


def build_worksite_prevention_plan_pdf(
    organization: Organization,
    worksite: dict[str, Any],
    customer: dict[str, Any] | None,
    *,
    useful_date: str | None = None,
    intervention_context: str | None = None,
    vigilance_points: list[str] | None = None,
    measure_points: list[str] | None = None,
    additional_contact: str | None = None,
) -> bytes:
    lines: list[PdfLine] = []
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")
    planned_for = format_useful_date_value(useful_date) or format_datetime_value(worksite.get("planned_for"))
    updated_at = format_datetime_value(worksite.get("updated_at"))
    client_name = str(worksite["client_name"])
    customer_name = str(customer["name"]) if customer and customer.get("name") else client_name
    customer_email = str(customer["email"]) if customer and customer.get("email") else None
    customer_phone = str(customer["phone"]) if customer and customer.get("phone") else None
    customer_address = str(customer["address"]) if customer and customer.get("address") else None
    normalized_context = normalize_optional_text(intervention_context)
    normalized_vigilance_points = normalize_prevention_points(
        vigilance_points,
        build_prevention_vigilance_points(worksite, customer),
    )
    normalized_measure_points = normalize_prevention_points(
        measure_points,
        build_prevention_measure_points(worksite, customer, planned_for),
    )
    normalized_additional_contact = normalize_optional_text(additional_contact)

    append_wrapped(lines, "Plan de prevention simplifie", size=18, bold=True)
    append_wrapped(lines, f"Genere le {generated_at}", size=10)
    append_wrapped(
        lines,
        "Modele simple et relisible rapidement. A completer si l'intervention presente un risque particulier ou une coactivite sensible.",
        size=10,
    )

    append_section_title(lines, "Entreprise intervenante")
    append_wrapped(lines, f"Entreprise : {organization.name}")
    append_wrapped(lines, f"Activite : {organization.activity_label or 'A preciser'}")
    append_wrapped(lines, f"Contact : {organization.contact_email or 'A completer'}")
    append_wrapped(lines, f"Telephone : {organization.contact_phone or 'A completer'}")
    if organization.headquarters_address:
        append_wrapped(lines, f"Adresse : {organization.headquarters_address}")

    append_section_title(lines, "Chantier et donneur d'ordre")
    append_wrapped(lines, f"Chantier : {worksite['name']}")
    append_wrapped(lines, f"Donneur d'ordre : {customer_name}")
    append_wrapped(lines, f"Adresse du chantier : {worksite['address']}")
    append_wrapped(lines, f"Statut chantier : {format_worksite_status(str(worksite['status']))}")
    if planned_for:
        append_wrapped(lines, f"Date utile : {planned_for}")
    if updated_at:
        append_wrapped(lines, f"Dernier repere : {updated_at}")

    append_section_title(lines, "Contacts utiles")
    append_wrapped(lines, f"Contact entreprise : {organization.contact_email or 'A completer'}")
    append_wrapped(lines, f"Telephone entreprise : {organization.contact_phone or 'A completer'}")
    append_wrapped(lines, f"Contact donneur d'ordre : {customer_email or 'A completer'}")
    append_wrapped(lines, f"Telephone donneur d'ordre : {customer_phone or 'A completer'}")
    if customer_address:
        append_wrapped(lines, f"Adresse donneur d'ordre : {customer_address}")

    append_section_title(lines, "Contexte d'intervention")
    context_parts = [
        f"Intervention preparee sur le chantier {worksite['name']}",
        f"pour {customer_name}",
        f"a l'adresse {worksite['address']}",
    ]
    if planned_for:
        context_parts.append(f"avec un repere de date au {planned_for}")
    append_wrapped(lines, normalized_context or (" ".join(context_parts) + "."))
    append_wrapped(
        lines,
        "Le document donne une base simple de coordination avant intervention. Il ne remplace pas une analyse specifique si le chantier presente des risques particuliers.",
    )

    append_section_title(lines, "Points de vigilance / risques simples")
    for point in normalized_vigilance_points:
        append_wrapped(lines, f"- {point}")

    append_section_title(lines, "Mesures / consignes simples")
    for point in normalized_measure_points:
        append_wrapped(lines, f"- {point}")

    if normalized_additional_contact:
        append_section_title(lines, "Contact utile complementaire")
        append_wrapped(lines, normalized_additional_contact)

    return render_simple_pdf(lines)


def build_prevention_vigilance_points(
    worksite: dict[str, Any],
    customer: dict[str, Any] | None,
) -> list[str]:
    points = [
        "Acces au site, accueil et zones d'intervention a confirmer avant le demarrage.",
        "Coactivite possible avec occupants, clients ou autres prestataires presents sur place.",
        "Circulation, manutention et balisage autour de la zone de travail a preparer simplement.",
    ]
    status = str(worksite.get("status") or "")
    if status == "blocked":
        points.append("Un point bloquant est deja remonte sur ce chantier et doit etre leve avant intervention.")
    elif status == "in_progress":
        points.append("Le chantier est deja en cours et demande une coordination simple avec les intervenants presents.")
    elif status == "planned":
        points.append("Les acces, badges ou autorisations utiles peuvent etre verifies avant l'arrivee sur site.")

    if customer and (customer.get("email") or customer.get("phone")):
        points.append("Un contact donneur d'ordre est disponible et peut etre confirme avant intervention.")

    return points


def build_prevention_measure_points(
    worksite: dict[str, Any],
    customer: dict[str, Any] | None,
    planned_for: str | None,
) -> list[str]:
    points = [
        "Presenter l'intervention et le perimetre concerne au contact du site avant de commencer.",
        "Verifier les acces, les autorisations et les equipements de protection utiles a l'intervention.",
        "Baliser la zone de travail et maintenir un cheminement sur pour les tiers.",
        "Arreter l'intervention et faire remonter tout risque non prevu ou toute consigne contradictoire.",
    ]
    if planned_for:
        points.append(f"Confirmer simplement l'accueil et l'acces au chantier pour la date utile du {planned_for}.")
    if customer and (customer.get("email") or customer.get("phone")):
        points.append("Utiliser les coordonnees disponibles pour confirmer l'accueil avant l'arrivee sur site.")
    return points


def format_useful_date_value(value: Any) -> str | None:
    if isinstance(value, datetime):
        return format_datetime_value(value)
    if not isinstance(value, str):
        return None

    normalized = value.strip()
    if not normalized:
        return None

    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError:
        return normalized

    return parsed.strftime("%d/%m/%Y %H:%M")


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def normalize_prevention_points(points: list[str] | None, fallback: list[str]) -> list[str]:
    if points is None:
        return fallback

    normalized = [point.strip() for point in points if point and point.strip()]
    return normalized or fallback
