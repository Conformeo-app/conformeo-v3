from __future__ import annotations

import enum
from datetime import date
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.billing_customer import BillingCustomer


class QuoteStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    DECLINED = "declined"


class Quote(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "quotes"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    customer_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("billing_customers.id", ondelete="CASCADE"),
        nullable=False,
    )
    worksite_id: Mapped[UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True)
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False)
    number: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    issue_date: Mapped[date] = mapped_column(Date, nullable=False)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[QuoteStatus] = mapped_column(
        postgres_enum(QuoteStatus, name="quote_status"),
        nullable=False,
        default=QuoteStatus.DRAFT,
        server_default=QuoteStatus.DRAFT.value,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="EUR", server_default="EUR")
    follow_up_status: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="normal",
        server_default="normal",
    )
    line_items: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False)
    subtotal_amount_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    total_amount_cents: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    customer: Mapped["BillingCustomer"] = relationship(back_populates="quotes")
