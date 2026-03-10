from uuid import UUID

from app.db.models.organization_module import OrganizationModuleCode
from app.schemas.common import BaseReadModel


class OrganizationModuleRead(BaseReadModel):
    organization_id: UUID
    module_code: OrganizationModuleCode
    is_enabled: bool
