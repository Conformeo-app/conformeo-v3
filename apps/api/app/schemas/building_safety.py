from datetime import date
from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.building_safety_item import BuildingSafetyItemStatus, BuildingSafetyItemType
from app.schemas.common import BaseReadModel


class BuildingSafetyItemRead(BaseReadModel):
    organization_id: UUID
    site_id: UUID
    site_name: str
    item_type: BuildingSafetyItemType
    name: str
    next_due_date: date
    last_checked_at: date | None
    status: BuildingSafetyItemStatus
    alert_status: str
    notes: str | None


class BuildingSafetyAlertRead(BaseModel):
    item_id: UUID
    site_id: UUID
    site_name: str
    item_name: str
    item_type: BuildingSafetyItemType
    alert_type: str
    due_date: date
    message: str


class BuildingSafetyItemCreateRequest(BaseModel):
    site_id: UUID
    item_type: BuildingSafetyItemType
    name: str = Field(min_length=2, max_length=160)
    next_due_date: date
    last_checked_at: date | None = None
    notes: str | None = Field(default=None, max_length=2000)


class BuildingSafetyItemUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    next_due_date: date | None = None
    last_checked_at: date | None = None
    status: BuildingSafetyItemStatus | None = None
    notes: str | None = Field(default=None, max_length=2000)
