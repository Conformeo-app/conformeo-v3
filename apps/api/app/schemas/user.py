from datetime import datetime

from app.db.models.user import UserStatus
from app.schemas.common import BaseReadModel


class UserRead(BaseReadModel):
    email: str
    first_name: str
    last_name: str
    display_name: str
    phone: str | None
    status: UserStatus
    last_active_at: datetime | None
