from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models.worksite import WorksiteEquipment, WorksiteEquipmentMovement


def list_worksite_equipments(
    db: Session,
    organization_id: UUID,
) -> list[WorksiteEquipment]:
    return (
        db.execute(
            select(WorksiteEquipment)
            .options(selectinload(WorksiteEquipment.worksite))
            .where(
                WorksiteEquipment.organization_id == organization_id,
                WorksiteEquipment.deleted_at.is_(None),
            )
            .order_by(WorksiteEquipment.name.asc(), WorksiteEquipment.created_at.asc())
        )
        .scalars()
        .all()
    )


def list_worksite_equipment_movements(
    db: Session,
    organization_id: UUID,
) -> list[WorksiteEquipmentMovement]:
    return (
        db.execute(
            select(WorksiteEquipmentMovement)
            .options(
                selectinload(WorksiteEquipmentMovement.equipment),
                selectinload(WorksiteEquipmentMovement.worksite),
            )
            .where(
                WorksiteEquipmentMovement.organization_id == organization_id,
                WorksiteEquipmentMovement.deleted_at.is_(None),
            )
            .order_by(
                WorksiteEquipmentMovement.captured_at.desc(),
                WorksiteEquipmentMovement.created_at.desc(),
            )
        )
        .scalars()
        .all()
    )


def get_worksite_equipment(
    db: Session,
    organization_id: UUID,
    equipment_id: UUID,
) -> WorksiteEquipment | None:
    equipment = db.get(WorksiteEquipment, equipment_id)
    if equipment is None or equipment.deleted_at is not None or equipment.organization_id != organization_id:
        return None
    return equipment


def create_worksite_equipment(
    db: Session,
    organization_id: UUID,
    *,
    name: str,
    equipment_type: str,
    status: str,
) -> WorksiteEquipment:
    equipment = WorksiteEquipment(
        organization_id=organization_id,
        worksite_id=None,
        name=name,
        equipment_type=equipment_type,
        status=status,
    )
    db.add(equipment)
    db.flush()
    db.refresh(equipment)
    return equipment


def serialize_worksite_equipment(equipment: WorksiteEquipment) -> dict[str, object]:
    return {
        "id": equipment.id,
        "version": equipment.version,
        "created_at": equipment.created_at,
        "updated_at": equipment.updated_at,
        "deleted_at": equipment.deleted_at,
        "organization_id": equipment.organization_id,
        "worksite_id": equipment.worksite_id,
        "worksite_name": equipment.worksite.name if equipment.worksite is not None else None,
        "name": equipment.name,
        "type": equipment.equipment_type,
        "status": equipment.status.value,
    }


def serialize_worksite_equipment_movement(
    movement: WorksiteEquipmentMovement,
) -> dict[str, object]:
    return {
        "id": movement.id,
        "version": movement.version,
        "created_at": movement.created_at,
        "updated_at": movement.updated_at,
        "deleted_at": movement.deleted_at,
        "organization_id": movement.organization_id,
        "worksite_id": movement.worksite_id,
        "equipment_id": movement.equipment_id,
        "equipment_name": movement.equipment.name if movement.equipment is not None else "Équipement",
        "movement_type": movement.movement_type.value,
        "resulting_status": movement.resulting_status.value,
        "captured_at": movement.captured_at,
        "actor_user_id": movement.actor_user_id,
        "actor_display_name": movement.actor_display_name,
        "sync_status": movement.sync_status,
    }
