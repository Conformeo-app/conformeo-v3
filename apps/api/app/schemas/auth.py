from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.db.models.organization_module import OrganizationModuleCode
from app.schemas.organization import OrganizationRead
from app.schemas.organization_membership import OrganizationMembershipRead
from app.schemas.organization_module import OrganizationModuleRead
from app.schemas.user import UserRead


class LoginRequest(BaseModel):
    email: str
    password: str
    organization_id: UUID | None = None


class ModuleToggleRequest(BaseModel):
    is_enabled: bool


class MembershipAccessRead(BaseModel):
    membership: OrganizationMembershipRead
    organization: OrganizationRead
    permissions: list[str]
    modules: list[OrganizationModuleRead]
    enabled_modules: list[OrganizationModuleCode]

    model_config = ConfigDict(from_attributes=True)


class AuthSessionRead(BaseModel):
    user: UserRead
    memberships: list[MembershipAccessRead]
    current_membership: MembershipAccessRead


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    expires_at: datetime
    session: AuthSessionRead
