from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel

if TYPE_CHECKING:
    from app.db.models.organization import Organization
    from app.db.models.user import User


class OrganizationTeam(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organization_teams"
    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "name",
            name="uq_organization_teams_org_name",
        ),
    )

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    organization: Mapped["Organization"] = relationship(back_populates="teams")
    members: Mapped[list["OrganizationTeamMember"]] = relationship(
        back_populates="team",
        cascade="all, delete-orphan",
    )


class OrganizationTeamMember(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "organization_team_members"
    __table_args__ = (
        UniqueConstraint(
            "team_id",
            "user_id",
            name="uq_organization_team_members_team_user",
        ),
    )

    team_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organization_teams.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    team: Mapped["OrganizationTeam"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="team_memberships")
