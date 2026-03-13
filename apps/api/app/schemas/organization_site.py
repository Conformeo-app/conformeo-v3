from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.organization_site import OrganizationSiteStatus, OrganizationSiteType
from app.schemas.common import BaseReadModel


class OrganizationSiteRead(BaseReadModel):
    organization_id: UUID
    name: str
    address: str
    site_type: OrganizationSiteType
    status: OrganizationSiteStatus


class OrganizationSiteCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    address: str = Field(min_length=5, max_length=500)
    site_type: OrganizationSiteType = OrganizationSiteType.SITE


class OrganizationSiteUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    address: str | None = Field(default=None, min_length=5, max_length=500)
    site_type: OrganizationSiteType | None = None
    status: OrganizationSiteStatus | None = None
