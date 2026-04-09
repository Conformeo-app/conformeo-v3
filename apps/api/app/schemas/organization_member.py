from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.models.organization_module import OrganizationModuleCode
from app.db.models.user import UserStatus
from app.schemas.organization_membership import OrganizationMembershipRead
from app.schemas.user import UserRead


class OrganizationMemberModuleAccessRead(BaseModel):
    module_code: OrganizationModuleCode
    module_label: str
    access_level: str
    access_label: str
    is_enabled: bool


class OrganizationMemberRead(BaseModel):
    membership: OrganizationMembershipRead
    user: UserRead
    role_label: str
    role_summary: str
    access_overview: str
    module_access: list[OrganizationMemberModuleAccessRead]
    team_ids: list[UUID]
    team_names: list[str]

    model_config = ConfigDict(from_attributes=True)


class OrganizationMemberCreateRequest(BaseModel):
    email: str
    first_name: str
    last_name: str
    phone: str | None = None
    role_code: str


class OrganizationMemberUpdateRequest(BaseModel):
    role_code: str | None = None
    user_status: UserStatus | None = None
