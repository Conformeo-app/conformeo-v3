from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.duerp_entry import DuerpEntryStatus, DuerpSeverity
from app.schemas.common import BaseReadModel


class DuerpEntryRead(BaseReadModel):
    organization_id: UUID
    site_id: UUID | None
    site_name: str | None
    work_unit_name: str
    risk_label: str
    severity: DuerpSeverity
    prevention_action: str | None
    status: DuerpEntryStatus
    compliance_status: str
    proof_count: int


class DuerpEntryCreateRequest(BaseModel):
    site_id: UUID | None = None
    work_unit_name: str = Field(min_length=2, max_length=160)
    risk_label: str = Field(min_length=2, max_length=200)
    severity: DuerpSeverity
    prevention_action: str | None = Field(default=None, max_length=2000)


class DuerpEntryUpdateRequest(BaseModel):
    site_id: UUID | None = None
    work_unit_name: str | None = Field(default=None, min_length=2, max_length=160)
    risk_label: str | None = Field(default=None, min_length=2, max_length=200)
    severity: DuerpSeverity | None = None
    prevention_action: str | None = Field(default=None, max_length=2000)
    status: DuerpEntryStatus | None = None
