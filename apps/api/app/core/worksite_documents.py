from __future__ import annotations

from datetime import datetime, timezone
import hashlib
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Document, DocumentStatus


WORKSITE_DOCUMENT_SOURCE = "worksite_generated"
WORKSITE_SUMMARY_DOCUMENT_TYPE = "worksite_summary_pdf"
WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE = "worksite_prevention_plan_pdf"
WORKSITE_SIGNATURE_DOCUMENT_TYPE = "signature"
WORKSITE_SIGNATURE_FIELD = "signature"
WORKSITE_PROOF_DOCUMENT_TYPE = "photo_proof"
WORKSITE_PROOF_FIELD = "proof_photo"
WORKSITE_DOCUMENT_LIFECYCLE_DRAFT = "draft"
WORKSITE_DOCUMENT_LIFECYCLE_FINALIZED = "finalized"
WORKSITE_DOCUMENT_LIFECYCLE_STATUSES = {
    WORKSITE_DOCUMENT_LIFECYCLE_DRAFT,
    WORKSITE_DOCUMENT_LIFECYCLE_FINALIZED,
}

WORKSITE_DOCUMENT_TYPE_LABELS: dict[str, str] = {
    WORKSITE_SUMMARY_DOCUMENT_TYPE: "Fiche chantier PDF",
    WORKSITE_PREVENTION_PLAN_DOCUMENT_TYPE: "Plan de prevention simplifie PDF",
}


def is_worksite_signature_document(document: Document) -> bool:
    return (
        document.attached_to_entity_type == "worksite"
        and (
            document.document_type == WORKSITE_SIGNATURE_DOCUMENT_TYPE
            or document.attached_to_field == WORKSITE_SIGNATURE_FIELD
        )
    )


def is_worksite_proof_document(document: Document) -> bool:
    return (
        document.attached_to_entity_type == "worksite"
        and (
            document.document_type == WORKSITE_PROOF_DOCUMENT_TYPE
            or document.attached_to_field == WORKSITE_PROOF_FIELD
        )
    )


def list_worksite_documents(db: Session, organization_id: UUID) -> list[Document]:
    statement = (
        select(Document)
        .where(
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.source == WORKSITE_DOCUMENT_SOURCE,
            Document.attached_to_entity_type == "worksite",
        )
        .order_by(Document.uploaded_at.desc().nullslast(), Document.created_at.desc())
    )
    return db.execute(statement).scalars().all()


def list_worksite_signatures(db: Session, organization_id: UUID) -> list[Document]:
    statement = (
        select(Document)
        .where(
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.attached_to_entity_type == "worksite",
            (
                (Document.document_type == WORKSITE_SIGNATURE_DOCUMENT_TYPE)
                | (Document.attached_to_field == WORKSITE_SIGNATURE_FIELD)
            ),
        )
        .order_by(Document.uploaded_at.desc().nullslast(), Document.created_at.desc())
    )
    return db.execute(statement).scalars().all()


def list_worksite_proofs(db: Session, organization_id: UUID) -> list[Document]:
    statement = (
        select(Document)
        .where(
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.attached_to_entity_type == "worksite",
            (
                (Document.document_type == WORKSITE_PROOF_DOCUMENT_TYPE)
                | (Document.attached_to_field == WORKSITE_PROOF_FIELD)
            ),
        )
        .order_by(Document.uploaded_at.desc().nullslast(), Document.created_at.desc())
    )
    return db.execute(statement).scalars().all()


def register_generated_worksite_document(
    db: Session,
    *,
    organization_id: UUID,
    worksite_id: UUID,
    document_type: str,
    file_name: str,
    pdf_bytes: bytes,
    uploaded_by_user_id: UUID | None,
    notes: str | None = None,
) -> Document:
    statement = (
        select(Document)
        .where(
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.source == WORKSITE_DOCUMENT_SOURCE,
            Document.attached_to_entity_type == "worksite",
            Document.attached_to_entity_id == worksite_id,
            Document.document_type == document_type,
        )
        .order_by(Document.created_at.desc())
    )
    document = db.execute(statement).scalars().first()
    uploaded_at = datetime.now(timezone.utc)

    if document is None:
        document = Document(
            organization_id=organization_id,
            attached_to_entity_type="worksite",
            attached_to_entity_id=worksite_id,
            attached_to_field="generated_pdf",
            uploaded_by_user_id=uploaded_by_user_id,
            document_type=document_type,
            source=WORKSITE_DOCUMENT_SOURCE,
            lifecycle_status=WORKSITE_DOCUMENT_LIFECYCLE_DRAFT,
            status=DocumentStatus.AVAILABLE,
            file_name=file_name,
            mime_type="application/pdf",
            uploaded_at=uploaded_at,
            notes=notes,
        )
        store_generated_worksite_document_content(document, pdf_bytes)
        db.add(document)
        return document

    document.version += 1
    document.uploaded_by_user_id = uploaded_by_user_id
    document.lifecycle_status = document.lifecycle_status or WORKSITE_DOCUMENT_LIFECYCLE_DRAFT
    document.status = DocumentStatus.AVAILABLE
    document.file_name = file_name
    document.mime_type = "application/pdf"
    document.uploaded_at = uploaded_at
    document.notes = notes
    store_generated_worksite_document_content(document, pdf_bytes)
    return document


def build_worksite_document_storage_key(worksite_id: UUID, document_type: str) -> str:
    return f"worksite-generated/{worksite_id}/{document_type}.pdf"


def store_generated_worksite_document_content(document: Document, pdf_bytes: bytes) -> None:
    checksum = hashlib.sha256(pdf_bytes).hexdigest()
    document.content_bytes = pdf_bytes
    document.size_bytes = len(pdf_bytes)
    document.checksum = f"sha256:{checksum}"
    document.storage_key = build_worksite_document_storage_key(
        document.attached_to_entity_id,
        document.document_type,
    )
    document.mime_type = document.mime_type or "application/pdf"
    document.status = DocumentStatus.AVAILABLE


def get_worksite_document_or_404(db: Session, organization_id: UUID, document_id: UUID) -> Document | None:
    statement = (
        select(Document)
        .where(
            Document.id == document_id,
            Document.organization_id == organization_id,
            Document.deleted_at.is_(None),
            Document.source == WORKSITE_DOCUMENT_SOURCE,
            Document.attached_to_entity_type == "worksite",
        )
        .order_by(Document.created_at.desc())
    )
    return db.execute(statement).scalars().first()


def get_worksite_signature_document(
    db: Session,
    organization_id: UUID,
    signature_document_id: UUID,
) -> Document | None:
    document = db.get(Document, signature_document_id)
    if document is None or document.deleted_at is not None or document.organization_id != organization_id:
        return None
    if not is_worksite_signature_document(document):
        return None
    return document


def get_worksite_proof_document(
    db: Session,
    organization_id: UUID,
    proof_document_id: UUID,
) -> Document | None:
    document = db.get(Document, proof_document_id)
    if document is None or document.deleted_at is not None or document.organization_id != organization_id:
        return None
    if not is_worksite_proof_document(document):
        return None
    return document


def get_worksite_signature_label(document: Document) -> str:
    file_name = document.file_name.strip() if document.file_name else ""
    return file_name or "Signature simple"


def get_worksite_proof_label(document: Document) -> str:
    file_name = document.file_name.strip() if document.file_name else ""
    return file_name or "Photo preuve"


def serialize_worksite_signature(
    document: Document,
    *,
    worksite_name: str,
) -> dict[str, object | None]:
    return {
        "id": document.id,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "deleted_at": document.deleted_at,
        "worksite_id": document.attached_to_entity_id,
        "worksite_name": worksite_name,
        "label": get_worksite_signature_label(document),
        "file_name": document.file_name,
        "status": document.status,
        "uploaded_at": document.uploaded_at,
    }


def serialize_worksite_proof(
    document: Document,
    *,
    worksite_name: str,
) -> dict[str, object | None]:
    return {
        "id": document.id,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "deleted_at": document.deleted_at,
        "worksite_id": document.attached_to_entity_id,
        "worksite_name": worksite_name,
        "label": get_worksite_proof_label(document),
        "file_name": document.file_name,
        "status": document.status,
        "uploaded_at": document.uploaded_at,
        "notes": document.notes,
    }


def serialize_worksite_document(
    document: Document,
    *,
    worksite_name: str,
    linked_signature: Document | None = None,
    linked_proofs: list[Document] | None = None,
) -> dict[str, object | None]:
    resolved_linked_proofs = linked_proofs or []
    return {
        "id": document.id,
        "version": document.version,
        "created_at": document.created_at,
        "updated_at": document.updated_at,
        "deleted_at": document.deleted_at,
        "worksite_id": document.attached_to_entity_id,
        "worksite_name": worksite_name,
        "document_type": document.document_type,
        "document_type_label": WORKSITE_DOCUMENT_TYPE_LABELS.get(document.document_type, document.document_type),
        "source": document.source,
        "lifecycle_status": document.lifecycle_status or WORKSITE_DOCUMENT_LIFECYCLE_DRAFT,
        "linked_signature_id": linked_signature.id if linked_signature is not None else None,
        "linked_signature_label": get_worksite_signature_label(linked_signature) if linked_signature is not None else None,
        "linked_signature_file_name": linked_signature.file_name if linked_signature is not None else None,
        "linked_signature_uploaded_at": linked_signature.uploaded_at if linked_signature is not None else None,
        "linked_proofs": [
            serialize_worksite_proof(linked_proof, worksite_name=worksite_name)
            for linked_proof in resolved_linked_proofs
        ],
        "status": document.status,
        "file_name": document.file_name,
        "mime_type": document.mime_type,
        "size_bytes": document.size_bytes,
        "has_stored_file": bool(document.content_bytes or document.storage_key),
        "uploaded_at": document.uploaded_at,
        "notes": document.notes,
    }
