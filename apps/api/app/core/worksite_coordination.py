from __future__ import annotations

from collections.abc import Iterable
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import WorksiteCoordinationItem


WORKSITE_COORDINATION_TARGET_WORKSITE = "worksite"
WORKSITE_COORDINATION_TARGET_DOCUMENT = "worksite_document"
WORKSITE_COORDINATION_TARGET_TYPES = {
    WORKSITE_COORDINATION_TARGET_WORKSITE,
    WORKSITE_COORDINATION_TARGET_DOCUMENT,
}

WORKSITE_COORDINATION_STATUS_TODO = "todo"
WORKSITE_COORDINATION_STATUS_IN_PROGRESS = "in_progress"
WORKSITE_COORDINATION_STATUS_DONE = "done"
WORKSITE_COORDINATION_STATUSES = {
    WORKSITE_COORDINATION_STATUS_TODO,
    WORKSITE_COORDINATION_STATUS_IN_PROGRESS,
    WORKSITE_COORDINATION_STATUS_DONE,
}


def list_worksite_coordination_items(
    db: Session,
    organization_id: UUID,
) -> list[WorksiteCoordinationItem]:
    statement = (
        select(WorksiteCoordinationItem)
        .options(selectinload(WorksiteCoordinationItem.assignee_user))
        .where(
            WorksiteCoordinationItem.organization_id == organization_id,
            WorksiteCoordinationItem.deleted_at.is_(None),
        )
        .order_by(WorksiteCoordinationItem.updated_at.desc(), WorksiteCoordinationItem.created_at.desc())
    )
    return db.execute(statement).scalars().all()


def get_worksite_coordination_item(
    db: Session,
    organization_id: UUID,
    *,
    target_type: str,
    target_id: UUID,
) -> WorksiteCoordinationItem | None:
    statement = (
        select(WorksiteCoordinationItem)
        .options(selectinload(WorksiteCoordinationItem.assignee_user))
        .where(
            WorksiteCoordinationItem.organization_id == organization_id,
            WorksiteCoordinationItem.target_type == target_type,
            WorksiteCoordinationItem.target_id == target_id,
            WorksiteCoordinationItem.deleted_at.is_(None),
        )
        .order_by(WorksiteCoordinationItem.updated_at.desc(), WorksiteCoordinationItem.created_at.desc())
    )
    return db.execute(statement).scalars().first()


def build_worksite_coordination_index(
    items: Iterable[WorksiteCoordinationItem],
) -> dict[tuple[str, UUID], WorksiteCoordinationItem]:
    return {
        (item.target_type, item.target_id): item
        for item in items
    }


def ensure_worksite_coordination_item(
    db: Session,
    organization_id: UUID,
    *,
    target_type: str,
    target_id: UUID,
) -> WorksiteCoordinationItem:
    existing_item = get_worksite_coordination_item(
        db,
        organization_id,
        target_type=target_type,
        target_id=target_id,
    )
    if existing_item is not None:
        return existing_item

    item = WorksiteCoordinationItem(
        organization_id=organization_id,
        target_type=target_type,
        target_id=target_id,
        status=WORKSITE_COORDINATION_STATUS_TODO,
    )
    db.add(item)
    db.flush()
    return item


def serialize_worksite_coordination(
    item: WorksiteCoordinationItem | None,
    *,
    target_type: str,
    target_id: UUID,
    assignee_display_name_override: str | None = None,
) -> dict[str, object | None]:
    return {
        "target_type": target_type,
        "target_id": target_id,
        "status": item.status if item is not None else WORKSITE_COORDINATION_STATUS_TODO,
        "assignee_user_id": item.assignee_user_id if item is not None else None,
        "assignee_display_name": (
            assignee_display_name_override
            if assignee_display_name_override is not None
            else (
                item.assignee_user.display_name
                if item is not None and item.assignee_user is not None
                else None
            )
        ),
        "comment_text": item.comment_text if item is not None else None,
        "updated_at": item.updated_at if item is not None else None,
    }
