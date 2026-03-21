from __future__ import annotations

import enum
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import JSON, BigInteger, DateTime, ForeignKey, Index, LargeBinary, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.organization import Organization
    from app.db.models.user import User


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    AVAILABLE = "available"
    FAILED = "failed"
    ARCHIVED = "archived"


class Document(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "documents"
    __table_args__ = (
        Index(
            "ix_documents_org_entity",
            "organization_id",
            "attached_to_entity_type",
            "attached_to_entity_id",
        ),
        Index("ix_documents_org_status", "organization_id", "status"),
    )

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    attached_to_entity_type: Mapped[str] = mapped_column(String(64), nullable=False)
    attached_to_entity_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False)
    attached_to_field: Mapped[str | None] = mapped_column(String(64), nullable=True)
    uploaded_by_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    linked_signature_document_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("documents.id", ondelete="SET NULL"),
        nullable=True,
    )
    linked_proof_document_ids: Mapped[list[str]] = mapped_column(
        JSON,
        nullable=False,
        default=list,
    )
    document_type: Mapped[str] = mapped_column(String(64), nullable=False)
    source: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="upload",
        server_default="upload",
    )
    lifecycle_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(
        postgres_enum(DocumentStatus, name="document_status"),
        nullable=False,
        default=DocumentStatus.AVAILABLE,
        server_default=DocumentStatus.AVAILABLE.value,
    )
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str | None] = mapped_column(String(160), nullable=True)
    size_bytes: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    storage_key: Mapped[str | None] = mapped_column(String(255), nullable=True)
    checksum: Mapped[str | None] = mapped_column(String(128), nullable=True)
    content_bytes: Mapped[bytes | None] = mapped_column(
        LargeBinary,
        nullable=True,
        deferred=True,
    )
    uploaded_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="documents")
    uploaded_by_user: Mapped["User | None"] = relationship(back_populates="uploaded_documents")
