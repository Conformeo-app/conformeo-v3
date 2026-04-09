from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.models.user import UserStatus
from app.schemas.common import BaseReadModel


class OrganizationTeamMemberRead(BaseModel):
    user_id: UUID
    display_name: str
    email: str
    status: UserStatus
    role_code: str
    role_label: str


class OrganizationTeamRead(BaseReadModel):
    organization_id: UUID
    name: str
    description: str | None
    member_count: int
    members: list[OrganizationTeamMemberRead]

    model_config = ConfigDict(from_attributes=True)


class OrganizationTeamUpsertRequest(BaseModel):
    name: str
    description: str | None = None
    member_user_ids: list[UUID]
