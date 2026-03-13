from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WorksiteSummaryRead(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    client_name: str
    address: str
    status: str
    planned_for: datetime | None
    updated_at: datetime
