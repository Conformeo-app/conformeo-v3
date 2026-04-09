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
    is_persisted: bool
    name: str
    client_name: str
    address: str
    status: str
    planned_for: datetime | None
    updated_at: datetime
    description: str | None = None
    site_id: UUID | None = None
    site_name: str | None = None
    coordination: "WorksiteCoordinationRead"
    interventions: list["WorksiteInterventionRead"]


class WorksiteCreateRequest(BaseModel):
    name: str
    site_id: UUID | None = None
    status: Literal["planned", "in_progress", "blocked", "completed"] = "planned"
    description: str | None = None


class WorksiteStatusUpdateRequest(BaseModel):
    status: Literal["planned", "in_progress", "blocked", "completed"]


class WorksiteAssigneeRead(BaseModel):
    user_id: UUID
    display_name: str
    role_code: str


class WorksiteTeamMemberRead(BaseModel):
    user_id: UUID
    display_name: str
    role_code: str
    role_label: str


class WorksiteTeamRead(BaseModel):
    id: UUID
    name: str
    description: str | None
    member_count: int
    members: list[WorksiteTeamMemberRead]


class WorksiteTeamMemberAddRequest(BaseModel):
    user_id: UUID


class WorksiteInterventionRead(BaseReadModel):
    organization_id: UUID
    worksite_id: UUID
    intervention_type: Literal[
        "preparation",
        "visit",
        "team_intervention",
        "delivery",
        "verification",
        "handover",
    ]
    status: Literal["to_schedule", "planned", "done", "canceled"]
    scheduled_for: datetime | None
    completed_at: datetime | None
    result: Literal["completed", "partial", "blocked", "postponed"] | None = None
    team_id: UUID | None = None
    team_name: str | None = None
    assignee_user_id: UUID | None = None
    assignee_display_name: str | None = None
    notes: str | None = None
    report_comment: str | None = None
    follow_up_note: str | None = None


class WorksiteInterventionCreateRequest(BaseModel):
    intervention_type: Literal[
        "preparation",
        "visit",
        "team_intervention",
        "delivery",
        "verification",
        "handover",
    ]
    status: Literal["to_schedule", "planned", "done", "canceled"] = "to_schedule"
    scheduled_for: datetime | None = None
    completed_at: datetime | None = None
    result: Literal["completed", "partial", "blocked", "postponed"] | None = None
    team_id: UUID | None = None
    assignee_user_id: UUID | None = None
    notes: str | None = None
    report_comment: str | None = None
    follow_up_note: str | None = None


class WorksiteInterventionUpdateRequest(BaseModel):
    intervention_type: Literal[
        "preparation",
        "visit",
        "team_intervention",
        "delivery",
        "verification",
        "handover",
    ] | None = None
    status: Literal["to_schedule", "planned", "done", "canceled"] | None = None
    scheduled_for: datetime | None = None
    completed_at: datetime | None = None
    result: Literal["completed", "partial", "blocked", "postponed"] | None = None
    team_id: UUID | None = None
    assignee_user_id: UUID | None = None
    notes: str | None = None
    report_comment: str | None = None
    follow_up_note: str | None = None


class WorksiteEquipmentRead(BaseReadModel):
    organization_id: UUID
    worksite_id: UUID | None
    worksite_name: str | None
    name: str
    type: str
    status: Literal["ready", "attention", "unavailable"]


class WorksiteEquipmentCreateRequest(BaseModel):
    name: str
    type: str
    status: Literal["ready", "attention", "unavailable"] = "ready"


class WorksiteEquipmentMovementRead(BaseReadModel):
    organization_id: UUID
    worksite_id: UUID
    equipment_id: UUID
    equipment_name: str
    movement_type: Literal["assigned_to_worksite", "removed_from_worksite", "marked_damaged"]
    resulting_status: Literal["ready", "attention", "unavailable"]
    captured_at: datetime | None
    actor_user_id: UUID | None
    actor_display_name: str | None
    sync_status: Literal["local_only", "pending_sync", "synced"]


class WorksiteEquipmentMovementCreateRequest(BaseModel):
    equipment_id: UUID
    movement_type: Literal["assigned_to_worksite", "removed_from_worksite", "marked_damaged"]
    resulting_status: Literal["ready", "attention", "unavailable"] = "ready"


class WorksiteCoordinationRead(BaseModel):
    target_type: Literal["worksite", "worksite_document"]
    target_id: UUID
    status: Literal["todo", "in_progress", "done"]
    team_id: UUID | None = None
    team_name: str | None = None
    assignee_user_id: UUID | None
    assignee_display_name: str | None
    comment_text: str | None
    updated_at: datetime | None


class WorksiteCoordinationUpdateRequest(BaseModel):
    status: Literal["todo", "in_progress", "done"]
    team_id: UUID | None = None
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
