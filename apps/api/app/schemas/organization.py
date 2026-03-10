from app.schemas.common import BaseReadModel
from app.db.models.organization import OrganizationStatus


class OrganizationRead(BaseReadModel):
    name: str
    slug: str
    legal_name: str | None
    status: OrganizationStatus
    default_locale: str
    default_timezone: str
    notes: str | None
