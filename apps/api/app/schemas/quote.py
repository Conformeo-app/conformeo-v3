from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.db.models.quote import QuoteStatus
from app.schemas.common import BaseReadModel


BillingFollowUpStatus = Literal["normal", "to_follow_up", "followed_up", "waiting_customer"]


class BillingLineItemInput(BaseModel):
    description: str = Field(min_length=2, max_length=240)
    quantity: float = Field(gt=0)
    unit_price_cents: int = Field(ge=0)


class BillingLineItemRead(BillingLineItemInput):
    line_total_cents: int


class QuoteRead(BaseReadModel):
    organization_id: UUID
    customer_id: UUID
    customer_name: str
    worksite_id: UUID | None
    worksite_name: str | None
    sequence_number: int
    number: str
    title: str | None
    issue_date: date
    valid_until: date | None
    status: QuoteStatus
    follow_up_status: BillingFollowUpStatus
    currency: str
    line_items: list[BillingLineItemRead]
    subtotal_amount_cents: int
    total_amount_cents: int
    notes: str | None


class QuoteCreateRequest(BaseModel):
    customer_id: UUID
    worksite_id: UUID | None = None
    title: str | None = Field(default=None, max_length=160)
    issue_date: date
    valid_until: date | None = None
    status: QuoteStatus = QuoteStatus.DRAFT
    currency: str | None = Field(default="EUR", min_length=3, max_length=3)
    line_items: list[BillingLineItemInput] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self) -> "QuoteCreateRequest":
        if self.valid_until is not None and self.valid_until < self.issue_date:
            raise ValueError("La date de validite doit etre posterieure ou egale a la date d'emission.")
        return self


class QuoteUpdateRequest(BaseModel):
    customer_id: UUID
    worksite_id: UUID | None = None
    title: str | None = Field(default=None, max_length=160)
    issue_date: date
    valid_until: date | None = None
    line_items: list[BillingLineItemInput] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self) -> "QuoteUpdateRequest":
        if self.valid_until is not None and self.valid_until < self.issue_date:
            raise ValueError("La date de validite doit etre posterieure ou egale a la date d'emission.")
        return self


class QuoteStatusUpdateRequest(BaseModel):
    status: QuoteStatus


class QuoteWorksiteLinkUpdateRequest(BaseModel):
    worksite_id: UUID | None = None


class QuoteFollowUpUpdateRequest(BaseModel):
    follow_up_status: BillingFollowUpStatus
