from __future__ import annotations

from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Document


REGULATORY_EVIDENCE_SOURCE = "regulation"
REGULATORY_OBLIGATION_FIELD_PREFIX = "regulatory_obligation:"


def list_regulatory_evidence_documents(db: Session, organization_id) -> list[Document]:
    statement = (
        select(Document)
        .where(
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.source == REGULATORY_EVIDENCE_SOURCE,
        )
        .order_by(Document.uploaded_at.desc().nullslast(), Document.created_at.desc())
    )
    return db.execute(statement).scalars().all()


def build_regulatory_evidence_indexes(documents: list[Document]) -> dict[str, dict]:
    obligation_counts: dict[str, int] = defaultdict(int)
    site_counts: dict[str, int] = defaultdict(int)
    building_safety_item_counts: dict[str, int] = defaultdict(int)
    duerp_entry_counts: dict[str, int] = defaultdict(int)

    for document in documents:
        if document.attached_to_entity_type == "organization" and document.attached_to_field:
            if document.attached_to_field.startswith(REGULATORY_OBLIGATION_FIELD_PREFIX):
                obligation_counts[document.attached_to_field.removeprefix(REGULATORY_OBLIGATION_FIELD_PREFIX)] += 1
        elif document.attached_to_entity_type == "organization_site":
            site_counts[str(document.attached_to_entity_id)] += 1
        elif document.attached_to_entity_type == "building_safety_item":
            building_safety_item_counts[str(document.attached_to_entity_id)] += 1
        elif document.attached_to_entity_type == "duerp_entry":
            duerp_entry_counts[str(document.attached_to_entity_id)] += 1

    return {
        "obligation_counts": dict(obligation_counts),
        "site_counts": dict(site_counts),
        "building_safety_item_counts": dict(building_safety_item_counts),
        "duerp_entry_counts": dict(duerp_entry_counts),
    }


def serialize_regulatory_evidence(
    document: Document,
    obligation_titles: dict[str, str],
    site_lookup: dict[str, str],
    building_safety_lookup: dict[str, tuple[str, object | None]],
    duerp_lookup: dict[str, tuple[str, object | None]],
) -> dict[str, object | None]:
    link_kind = "site"
    link_label = "Pièce justificative"
    obligation_id = None
    site_id = None
    building_safety_item_id = None
    duerp_entry_id = None

    if document.attached_to_entity_type == "organization" and document.attached_to_field:
        obligation_id = document.attached_to_field.removeprefix(REGULATORY_OBLIGATION_FIELD_PREFIX)
        link_kind = "obligation"
        link_label = obligation_titles.get(obligation_id, obligation_id)
    elif document.attached_to_entity_type == "organization_site":
        site_id = document.attached_to_entity_id
        link_kind = "site"
        link_label = site_lookup.get(str(site_id), "Site")
    elif document.attached_to_entity_type == "building_safety_item":
        building_safety_item_id = document.attached_to_entity_id
        link_kind = "building_safety_item"
        item_name, inferred_site_id = building_safety_lookup.get(str(building_safety_item_id), ("Élément sécurité", None))
        link_label = item_name
        site_id = inferred_site_id
    elif document.attached_to_entity_type == "duerp_entry":
        duerp_entry_id = document.attached_to_entity_id
        link_kind = "duerp_entry"
        risk_label, inferred_site_id = duerp_lookup.get(str(duerp_entry_id), ("Entrée DUERP", None))
        link_label = risk_label
        site_id = inferred_site_id

    return {
        "id": document.id,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "deleted_at": document.deleted_at,
        "organization_id": document.organization_id,
        "link_kind": link_kind,
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
