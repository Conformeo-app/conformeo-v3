from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import Optional, TypeVar
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Enum as SqlEnum, Integer, Uuid, func, text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


EnumT = TypeVar("EnumT", bound=enum.Enum)


class Base(DeclarativeBase):
    """Base déclarative commune."""


def postgres_enum(enum_cls: type[EnumT], *, name: str) -> SqlEnum:
    """Mappe un enum Python sur les labels existants PostgreSQL via item.value."""

    return SqlEnum(
        enum_cls,
        name=name,
        values_callable=lambda values_enum_cls: [item.value for item in values_enum_cls],
        validate_strings=True,
    )


class IdentifiedModel:
    """Identifiant UUID généré côté base."""

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )


class AuditModel:
    """Métadonnées d'audit et suppression logique."""

    @staticmethod
    def _now_utc() -> datetime:
        return datetime.now(timezone.utc)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_now_utc,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=_now_utc,
        server_default=func.now(),
        onupdate=_now_utc,
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class VersionedModel:
    """Version de ligne utilisée par le protocole de synchronisation."""

    version: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default=text("1"),
    )
