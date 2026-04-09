from __future__ import annotations

import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import AuditModel, Base, IdentifiedModel, VersionedModel, postgres_enum

if TYPE_CHECKING:
    from app.db.models.organization import Organization
    from app.db.models.organization_team import OrganizationTeam
    from app.db.models.organization_site import OrganizationSite
    from app.db.models.user import User


class WorksiteStatus(str, enum.Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"


class WorksiteEquipmentStatus(str, enum.Enum):
    READY = "ready"
    ATTENTION = "attention"
    UNAVAILABLE = "unavailable"


class WorksiteEquipmentMovementType(str, enum.Enum):
    ASSIGNED_TO_WORKSITE = "assigned_to_worksite"
    REMOVED_FROM_WORKSITE = "removed_from_worksite"
    MARKED_DAMAGED = "marked_damaged"


class WorksiteInterventionType(str, enum.Enum):
    PREPARATION = "preparation"
    VISIT = "visit"
    TEAM_INTERVENTION = "team_intervention"
    DELIVERY = "delivery"
    VERIFICATION = "verification"
    HANDOVER = "handover"


class WorksiteInterventionStatus(str, enum.Enum):
    TO_SCHEDULE = "to_schedule"
    PLANNED = "planned"
    DONE = "done"
    CANCELED = "canceled"


class WorksiteInterventionResult(str, enum.Enum):
    COMPLETED = "completed"
    PARTIAL = "partial"
    BLOCKED = "blocked"
    POSTPONED = "postponed"


class Worksite(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "worksites"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    site_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organization_sites.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[WorksiteStatus] = mapped_column(
        postgres_enum(WorksiteStatus, name="worksite_status"),
        nullable=False,
        default=WorksiteStatus.PLANNED,
        server_default=WorksiteStatus.PLANNED.value,
    )
    planned_for: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    organization: Mapped["Organization"] = relationship(back_populates="worksites")
    site: Mapped["OrganizationSite | None"] = relationship(back_populates="worksites")
    equipments: Mapped[list["WorksiteEquipment"]] = relationship(back_populates="worksite")
    equipment_movements: Mapped[list["WorksiteEquipmentMovement"]] = relationship(back_populates="worksite")
    interventions: Mapped[list["WorksiteIntervention"]] = relationship(back_populates="worksite")


class WorksiteIntervention(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "worksite_interventions"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    worksite_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("worksites.id", ondelete="CASCADE"),
        nullable=False,
    )
    intervention_type: Mapped[WorksiteInterventionType] = mapped_column(
        postgres_enum(WorksiteInterventionType, name="worksite_intervention_type"),
        nullable=False,
        default=WorksiteInterventionType.TEAM_INTERVENTION,
        server_default=WorksiteInterventionType.TEAM_INTERVENTION.value,
    )
    status: Mapped[WorksiteInterventionStatus] = mapped_column(
        postgres_enum(WorksiteInterventionStatus, name="worksite_intervention_status"),
        nullable=False,
        default=WorksiteInterventionStatus.TO_SCHEDULE,
        server_default=WorksiteInterventionStatus.TO_SCHEDULE.value,
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    result: Mapped[WorksiteInterventionResult | None] = mapped_column(
        postgres_enum(WorksiteInterventionResult, name="worksite_intervention_result"),
        nullable=True,
    )
    team_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organization_teams.id", ondelete="SET NULL"),
        nullable=True,
    )
    assignee_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    follow_up_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    worksite: Mapped["Worksite"] = relationship(back_populates="interventions")
    team: Mapped["OrganizationTeam | None"] = relationship()
    assignee_user: Mapped["User | None"] = relationship()


class WorksiteEquipment(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "worksite_equipments"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    worksite_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("worksites.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    equipment_type: Mapped[str] = mapped_column("type", String(120), nullable=False)
    status: Mapped[WorksiteEquipmentStatus] = mapped_column(
        postgres_enum(WorksiteEquipmentStatus, name="worksite_equipment_status"),
        nullable=False,
        default=WorksiteEquipmentStatus.READY,
        server_default=WorksiteEquipmentStatus.READY.value,
    )

    worksite: Mapped["Worksite | None"] = relationship(back_populates="equipments")
    movements: Mapped[list["WorksiteEquipmentMovement"]] = relationship(back_populates="equipment")


class WorksiteEquipmentMovement(Base, IdentifiedModel, AuditModel, VersionedModel):
    __tablename__ = "worksite_equipment_movements"

    organization_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    worksite_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("worksites.id", ondelete="CASCADE"),
        nullable=False,
    )
    equipment_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("worksite_equipments.id", ondelete="CASCADE"),
        nullable=False,
    )
    movement_type: Mapped[WorksiteEquipmentMovementType] = mapped_column(
        postgres_enum(WorksiteEquipmentMovementType, name="worksite_equipment_movement_type"),
        nullable=False,
    )
    resulting_status: Mapped[WorksiteEquipmentStatus] = mapped_column(
        postgres_enum(WorksiteEquipmentStatus, name="worksite_equipment_status"),
        nullable=False,
    )
    captured_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
    )
    actor_user_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_display_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    sync_status: Mapped[str] = mapped_column(
        String(16),
        nullable=False,
        default="synced",
        server_default="synced",
    )

    worksite: Mapped["Worksite"] = relationship(back_populates="equipment_movements")
    equipment: Mapped["WorksiteEquipment"] = relationship(back_populates="movements")
