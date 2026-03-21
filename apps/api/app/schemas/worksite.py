from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel
from app.db.models.document import DocumentStatus
from app.schemas.common import BaseReadModel


class WorksiteSummaryRead(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    client_name: str
    address: str
    status: str
    planned_for: datetime | None
    updated_at: datetime
    coordination: "WorksiteCoordinationRead"


class WorksiteAssigneeRead(BaseModel):
    user_id: UUID
    display_name: str
    role_code: str


class WorksiteCoordinationRead(BaseModel):
    target_type: Literal["worksite", "worksite_document"]
    target_id: UUID
    status: Literal["todo", "in_progress", "done"]
    assignee_user_id: UUID | None
    assignee_display_name: str | None
    comment_text: str | None
    updated_at: datetime | None


class WorksiteCoordinationUpdateRequest(BaseModel):
    status: Literal["todo", "in_progress", "done"]
    assignee_user_id: UUID | None = None
    comment_text: str | None = None


class WorksitePreventionPlanExportRequest(BaseModel):
    useful_date: str | None = None
    intervention_context: str | None = None
    vigilance_points: list[str] | None = None
    measure_points: list[str] | None = None
    additional_contact: str | None = None


class WorksiteProofRead(BaseReadModel):
    worksite_id: UUID
    worksite_name: str
    label: str
    file_name: str
    status: DocumentStatus
    uploaded_at: datetime | None
    notes: str | None


class WorksiteDocumentRead(BaseReadModel):
    worksite_id: UUID
    worksite_name: str
    document_type: str
    document_type_label: str
    source: str
    lifecycle_status: Literal["draft", "finalized"]
    linked_signature_id: UUID | None
    linked_signature_label: str | None
    linked_signature_file_name: str | None
    linked_signature_uploaded_at: datetime | None
    linked_proofs: list[WorksiteProofRead]
    status: DocumentStatus
    file_name: str
    mime_type: str | None
    size_bytes: int | None
    has_stored_file: bool
    uploaded_at: datetime | None
    notes: str | None
    coordination: WorksiteCoordinationRead


class WorksiteDocumentStatusUpdateRequest(BaseModel):
    lifecycle_status: Literal["draft", "finalized"]


class WorksiteSignatureRead(BaseReadModel):
    worksite_id: UUID
    worksite_name: str
    label: str
    file_name: str
    status: DocumentStatus
    uploaded_at: datetime | None


class WorksiteDocumentSignatureUpdateRequest(BaseModel):
    signature_document_id: UUID | None = None


class WorksiteDocumentProofUpdateRequest(BaseModel):
    proof_document_ids: list[UUID] = []
