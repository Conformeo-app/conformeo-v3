from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import BaseReadModel
from app.db.models.document import DocumentStatus


class RegulatoryEvidenceRead(BaseReadModel):
    organization_id: UUID
    link_kind: str
    link_label: str
    obligation_id: str | None
    site_id: UUID | None
    building_safety_item_id: UUID | None
    duerp_entry_id: UUID | None
    document_type: str
    source: str
    status: DocumentStatus
    file_name: str
    uploaded_at: datetime | None
    notes: str | None


class RegulatoryEvidenceCreateRequest(BaseModel):
    link_kind: str
    obligation_id: str | None = None
    site_id: UUID | None = None
    building_safety_item_id: UUID | None = None
    duerp_entry_id: UUID | None = None
    file_name: str = Field(min_length=2, max_length=255)
    document_type: str = Field(min_length=2, max_length=64)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_target(self) -> "RegulatoryEvidenceCreateRequest":
        if self.link_kind == "obligation" and not self.obligation_id:
            raise ValueError("obligation_id est requis pour une preuve rattachée à une obligation.")
        if self.link_kind == "site" and not self.site_id:
            raise ValueError("site_id est requis pour une preuve rattachée à un site.")
        if self.link_kind == "building_safety_item" and not self.building_safety_item_id:
            raise ValueError("building_safety_item_id est requis pour une preuve rattachée à un élément sécurité.")
        if self.link_kind == "duerp_entry" and not self.duerp_entry_id:
            raise ValueError("duerp_entry_id est requis pour une preuve rattachée à une entrée DUERP.")
        return self
