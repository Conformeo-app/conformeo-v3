from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class BaseReadModel(BaseModel):
    id: UUID
    version: int
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None

    model_config = ConfigDict(from_attributes=True)
