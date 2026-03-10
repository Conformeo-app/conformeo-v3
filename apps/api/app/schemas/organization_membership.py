from uuid import UUID

from app.schemas.common import BaseReadModel


class OrganizationMembershipRead(BaseReadModel):
    user_id: UUID
    organization_id: UUID
    role_code: str
    is_default: bool
