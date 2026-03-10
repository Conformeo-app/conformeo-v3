from datetime import datetime
from uuid import UUID

from app.db.models.document import DocumentStatus
from app.schemas.common import BaseReadModel


class DocumentRead(BaseReadModel):
    organization_id: UUID
    attached_to_entity_type: str
    attached_to_entity_id: UUID
    attached_to_field: str | None
    uploaded_by_user_id: UUID | None
    document_type: str
    source: str
    status: DocumentStatus
    file_name: str
    mime_type: str | None
    size_bytes: int | None
    storage_key: str | None
    checksum: str | None
    uploaded_at: datetime | None
    notes: str | None
