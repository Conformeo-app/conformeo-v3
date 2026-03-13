from __future__ import annotations

import enum
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.invoice import Invoice
    from app.db.models.organization import Organization
    from app.db.models.quote import Quote


class BillingCustomerType(str, enum.Enum):
    COMPANY = "company"
    INDIVIDUAL = "individual"


class BillingCustomer(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "billing_customers"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    customer_type: Mapped[BillingCustomerType] = mapped_column(
        postgres_enum(BillingCustomerType, name="billing_customer_type"),
        nullable=False,
        default=BillingCustomerType.COMPANY,
        server_default=BillingCustomerType.COMPANY.value,
    )
    email: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped["Organization"] = relationship()
    quotes: Mapped[list["Quote"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
