from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from textwrap import wrap
from typing import Any

from app.db.models.organization import Organization


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
TOP_MARGIN = 800
BOTTOM_MARGIN = 52
LEFT_MARGIN = 48


@dataclass(frozen=True)
class PdfLine:
    text: str
    size: int = 11
    bold: bool = False
    indent: int = 0


def normalize_pdf_text(value: str) -> str:
    normalized = " ".join(value.replace("\r", " ").replace("\n", " ").split())
    replacements = {
        "’": "'",
        "‘": "'",
        "–": "-",
        "—": "-",
        "…": "...",
        "\xa0": " ",
        "\u202f": " ",
        "œ": "oe",
        "Œ": "OE",
    }
    for source, target in replacements.items():
        normalized = normalized.replace(source, target)
    return normalized


def escape_pdf_text(value: str) -> bytes:
    encoded = normalize_pdf_text(value).encode("latin-1", "replace")
    encoded = encoded.replace(b"\\", b"\\\\")
    encoded = encoded.replace(b"(", b"\\(")
    encoded = encoded.replace(b")", b"\\)")
    return encoded


def wrap_pdf_text(value: str, width: int) -> list[str]:
    normalized = normalize_pdf_text(value)
    if not normalized:
        return [""]
    return wrap(normalized, width=width, break_long_words=False, break_on_hyphens=False) or [normalized]


def append_blank(lines: list[PdfLine], count: int = 1) -> None:
    for _ in range(count):
        lines.append(PdfLine(""))


def append_section_title(lines: list[PdfLine], title: str) -> None:
    if lines and lines[-1].text:
        append_blank(lines)
    lines.append(PdfLine(title, size=15, bold=True))
    append_blank(lines)


def append_wrapped(lines: list[PdfLine], value: str, *, size: int = 11, bold: bool = False, indent: int = 0) -> None:
    width = max(34, 94 - max(indent // 2, 0))
    for chunk in wrap_pdf_text(value, width):
        lines.append(PdfLine(chunk, size=size, bold=bold, indent=indent))


def format_profile_status(value: str) -> str:
    return "Profil exploitable" if value == "ready" else "Profil à compléter"


def format_compliance_status(value: str) -> str:
    mapping = {
        "to_complete": "À compléter",
        "in_progress": "En cours",
        "compliant": "Conforme",
        "to_verify": "À vérifier",
        "overdue": "En retard",
    }
    return mapping.get(value, value)


def format_building_safety_type(value: str) -> str:
    mapping = {
        "fire_extinguisher": "Extincteur",
        "dae": "DAE",
        "periodic_check": "Contrôle périodique",
    }
    return mapping.get(value, value)


def format_building_safety_alert(value: str) -> str:
    mapping = {
        "ok": "À jour",
        "due_soon": "Échéance proche",
        "overdue": "En retard",
        "archived": "Archivé",
    }
    return mapping.get(value, value)


def format_duerp_severity(value: str) -> str:
    mapping = {
        "low": "Gravité faible",
        "medium": "Gravité moyenne",
        "high": "Gravité haute",
    }
    return mapping.get(value, value)


def format_evidence_status(value: str) -> str:
    mapping = {
        "pending": "À vérifier",
        "available": "Disponible",
        "failed": "À vérifier",
        "archived": "Archivé",
    }
    return mapping.get(value, value)


def render_simple_pdf(lines: list[PdfLine]) -> bytes:
    pages: list[list[tuple[PdfLine, int]]] = []
    current_page: list[tuple[PdfLine, int]] = []
    cursor_y = TOP_MARGIN

    for line in lines:
        line_height = 10 if not line.text else line.size + 6
        if cursor_y - line_height < BOTTOM_MARGIN:
            pages.append(current_page)
            current_page = []
            cursor_y = TOP_MARGIN
        current_page.append((line, cursor_y))
        cursor_y -= line_height

    if current_page or not pages:
        pages.append(current_page)

    objects: list[bytes] = []
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")

    kids_refs: list[str] = []
    next_object_number = 5
    page_objects: list[tuple[int, bytes]] = []
    content_objects: list[tuple[int, bytes]] = []

    for page_lines in pages:
        page_object_number = next_object_number
        content_object_number = next_object_number + 1
        next_object_number += 2
        kids_refs.append(f"{page_object_number} 0 R")

        content_chunks: list[bytes] = []
        for line, cursor in page_lines:
            if not line.text:
                continue
            font_key = "F2" if line.bold else "F1"
            content_chunks.extend(
                [
                    b"BT\n",
                    f"/{font_key} {line.size} Tf\n".encode("ascii"),
                    f"1 0 0 1 {LEFT_MARGIN + line.indent} {cursor} Tm\n".encode("ascii"),
                    b"(" + escape_pdf_text(line.text) + b") Tj\n",
                    b"ET\n",
                ]
            )
        content_stream = b"".join(content_chunks)
        content_objects.append(
            (
                content_object_number,
                b"<< /Length " + str(len(content_stream)).encode("ascii") + b" >>\nstream\n"
                + content_stream
                + b"endstream",
            )
        )
        page_objects.append(
            (
                page_object_number,
                (
                    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "
                    f"{PAGE_WIDTH} {PAGE_HEIGHT}"
                    "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> "
                    f"/Contents {content_object_number} 0 R >>"
                ).encode("ascii"),
            )
        )

    objects.append(
        ("<< /Type /Pages /Kids [" + " ".join(kids_refs) + f"] /Count {len(kids_refs)} >>").encode("ascii")
    )
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    all_objects: list[tuple[int, bytes]] = list(enumerate(objects, start=1)) + page_objects + content_objects
    all_objects.sort(key=lambda item: item[0])

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets: list[int] = [0]
    for object_number, payload in all_objects:
        offsets.append(len(pdf))
        pdf.extend(f"{object_number} 0 obj\n".encode("ascii"))
        pdf.extend(payload)
        pdf.extend(b"\nendobj\n")

    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(offsets)}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        (
            "trailer\n"
            f"<< /Size {len(offsets)} /Root 1 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF"
        ).encode("ascii")
    )
    return bytes(pdf)


def build_regulatory_export_pdf(
    organization: Organization,
    regulatory_profile: dict[str, Any],
    sites: list[Any],
    building_safety_items: list[dict[str, Any]],
    duerp_entries: list[dict[str, Any]],
    evidences: list[dict[str, Any]],
) -> bytes:
    active_sites = [site for site in sites if getattr(site, "status", None).value == "active"]
    active_building_safety_items = [item for item in building_safety_items if item.get("status") == "active"]
    active_duerp_entries = [entry for entry in duerp_entries if entry.get("status") == "active"]

    lines: list[PdfLine] = []
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M")

    append_wrapped(lines, "Export réglementaire Conforméo", size=18, bold=True)
    append_wrapped(lines, f"Généré le {generated_at}", size=10)
    append_wrapped(
        lines,
        "Synthèse simple et partageable à partir des informations déjà saisies dans le module Réglementation.",
        size=10,
    )

    append_section_title(lines, "Identification entreprise")
    append_wrapped(lines, f"Nom : {organization.name}")
    append_wrapped(lines, f"Raison sociale : {organization.legal_name or 'Non renseignée'}")
    append_wrapped(lines, f"Activité : {organization.activity_label or 'À préciser'}")
    append_wrapped(
        lines,
        f"Effectif : {organization.employee_count if organization.employee_count is not None else 'À préciser'}",
    )
    append_wrapped(
        lines,
        (
            "Présence de salariés : oui"
            if organization.has_employees is True
            else "Présence de salariés : non"
            if organization.has_employees is False
            else "Présence de salariés : à préciser"
        ),
    )
    append_wrapped(lines, f"Email de contact : {organization.contact_email or 'À préciser'}")
    append_wrapped(lines, f"Téléphone : {organization.contact_phone or 'À préciser'}")
    append_wrapped(lines, f"Adresse principale : {organization.headquarters_address or 'À préciser'}")
    append_wrapped(lines, f"Sites actifs déclarés : {len(active_sites)}")

    append_section_title(lines, "Résumé réglementaire")
    append_wrapped(lines, f"Statut du profil : {format_profile_status(regulatory_profile['profile_status'])}")
    append_wrapped(
        lines,
        "Informations encore à compléter : "
        + (", ".join(regulatory_profile["missing_profile_items"]) if regulatory_profile["missing_profile_items"] else "aucune"),
    )
    append_wrapped(
        lines,
        f"Obligations applicables détectées : {len(regulatory_profile['applicable_obligations'])}",
    )

    append_section_title(lines, "Obligations applicables")
    if regulatory_profile["applicable_obligations"]:
        for obligation in regulatory_profile["applicable_obligations"]:
            append_wrapped(
                lines,
                f"{obligation['title']} - {format_compliance_status(obligation['status'])}",
                size=12,
                bold=True,
            )
            append_wrapped(
                lines,
                f"Priorité : {obligation['priority']} | Catégorie : {obligation['category']}",
                size=10,
                indent=12,
            )
            append_wrapped(lines, obligation["description"], indent=12)
            append_wrapped(lines, f"Pourquoi : {obligation['reason_summary']}", size=10, indent=12)
            append_blank(lines)
    else:
        append_wrapped(lines, "Aucune obligation applicable détectée pour le moment.")

    append_section_title(lines, "Sécurité bâtiment")
    if active_building_safety_items:
        for item in active_building_safety_items:
            append_wrapped(
                lines,
                f"{item['site_name']} - {format_building_safety_type(item['item_type'])} - {item['name']}",
                size=12,
                bold=True,
            )
            append_wrapped(
                lines,
                f"Échéance : {item['next_due_date']} | Statut : {format_building_safety_alert(item['alert_status'])}",
                indent=12,
            )
            if item.get("last_checked_at"):
                append_wrapped(lines, f"Dernier contrôle : {item['last_checked_at']}", indent=12)
            if item.get("notes"):
                append_wrapped(lines, f"Note : {item['notes']}", size=10, indent=12)
            append_blank(lines)
    else:
        append_wrapped(lines, "Aucun élément sécurité actif déclaré.")

    append_section_title(lines, "DUERP simplifié")
    if active_duerp_entries:
        for entry in active_duerp_entries:
            append_wrapped(
                lines,
                f"{entry['risk_label']} - {format_compliance_status(entry['compliance_status'])}",
                size=12,
                bold=True,
            )
            append_wrapped(
                lines,
                f"Unité de travail : {entry['work_unit_name']} | {format_duerp_severity(entry['severity'])}",
                indent=12,
            )
            append_wrapped(lines, f"Site : {entry['site_name'] or 'Entreprise'}", indent=12)
            append_wrapped(
                lines,
                "Action de prévention : "
                + (entry["prevention_action"] or "À compléter"),
                indent=12,
            )
            append_wrapped(
                lines,
                f"Pièces justificatives rattachées : {entry['proof_count']}",
                size=10,
                indent=12,
            )
            append_blank(lines)
    else:
        append_wrapped(lines, "Aucune entrée DUERP active déclarée.")

    append_section_title(lines, "Pièces justificatives")
    if evidences:
        for evidence in evidences:
            append_wrapped(
                lines,
                f"{evidence['file_name']} - {format_evidence_status(evidence['status'])}",
                size=12,
                bold=True,
            )
            append_wrapped(lines, f"Rattachement : {evidence['link_label']}", indent=12)
            append_wrapped(lines, f"Type : {evidence['document_type']}", indent=12)
            if evidence.get("uploaded_at"):
                append_wrapped(lines, f"Ajouté le : {str(evidence['uploaded_at'])[:10]}", size=10, indent=12)
            if evidence.get("notes"):
                append_wrapped(lines, f"Note : {evidence['notes']}", size=10, indent=12)
            append_blank(lines)
    else:
        append_wrapped(lines, "Aucune pièce justificative réglementaire rattachée.")

    append_blank(lines)
    append_wrapped(
        lines,
        "Document généré automatiquement depuis Conforméo. Cette synthèse aide à préparer les échanges internes ou un contrôle simple, sans remplacer un conseil juridique spécialisé.",
        size=9,
    )

    return render_simple_pdf(lines)
