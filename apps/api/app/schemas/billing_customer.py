from uuid import UUID

from pydantic import BaseModel, Field

from app.db.models.billing_customer import BillingCustomerType
from app.schemas.common import BaseReadModel


class BillingCustomerRead(BaseReadModel):
    organization_id: UUID
    name: str
    customer_type: BillingCustomerType
    email: str | None
    phone: str | None
    address: str | None
    notes: str | None


class BillingCustomerCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    customer_type: BillingCustomerType = BillingCustomerType.COMPANY
    email: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=2000)


class BillingCustomerUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    customer_type: BillingCustomerType | None = None
    email: str | None = Field(default=None, max_length=160)
    phone: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=2000)
    notes: str | None = Field(default=None, max_length=2000)
