from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.db.models.invoice import InvoiceStatus
from app.schemas.common import BaseReadModel
from app.schemas.quote import BillingLineItemInput, BillingLineItemRead


BillingFollowUpStatus = Literal["normal", "to_follow_up", "followed_up", "waiting_customer"]


class InvoiceRead(BaseReadModel):
    organization_id: UUID
    customer_id: UUID
    customer_name: str
    worksite_id: UUID | None
    worksite_name: str | None
    sequence_number: int
    number: str
    title: str | None
    issue_date: date
    due_date: date | None
    status: InvoiceStatus
    follow_up_status: BillingFollowUpStatus
    currency: str
    line_items: list[BillingLineItemRead]
    subtotal_amount_cents: int
    total_amount_cents: int
    paid_amount_cents: int
    paid_at: date | None
    outstanding_amount_cents: int
    notes: str | None


class InvoiceCreateRequest(BaseModel):
    customer_id: UUID
    worksite_id: UUID | None = None
    title: str | None = Field(default=None, max_length=160)
    issue_date: date
    due_date: date | None = None
    status: InvoiceStatus = InvoiceStatus.DRAFT
    currency: str | None = Field(default="EUR", min_length=3, max_length=3)
    line_items: list[BillingLineItemInput] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self) -> "InvoiceCreateRequest":
        if self.due_date is not None and self.due_date < self.issue_date:
            raise ValueError("La date d'echeance doit etre posterieure ou egale a la date d'emission.")
        return self


class InvoiceUpdateRequest(BaseModel):
    customer_id: UUID
    worksite_id: UUID | None = None
    title: str | None = Field(default=None, max_length=160)
    issue_date: date
    due_date: date | None = None
    line_items: list[BillingLineItemInput] = Field(min_length=1)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self) -> "InvoiceUpdateRequest":
        if self.due_date is not None and self.due_date < self.issue_date:
            raise ValueError("La date d'echeance doit etre posterieure ou egale a la date d'emission.")
        return self


class InvoiceStatusUpdateRequest(BaseModel):
    status: InvoiceStatus


class InvoicePaymentCreateRequest(BaseModel):
    paid_amount_cents: int = Field(gt=0)
    paid_at: date


class InvoiceWorksiteLinkUpdateRequest(BaseModel):
    worksite_id: UUID | None = None


class InvoiceFollowUpUpdateRequest(BaseModel):
    follow_up_status: BillingFollowUpStatus
