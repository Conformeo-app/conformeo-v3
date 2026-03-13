from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import BuildingSafetyItem, BuildingSafetyItemStatus


DUE_SOON_WINDOW_DAYS = 30


def list_building_safety_items(
    db: Session,
    organization_id,
    site_id=None,
) -> list[BuildingSafetyItem]:
    statement = (
        select(BuildingSafetyItem)
        .options(selectinload(BuildingSafetyItem.site))
        .where(
            BuildingSafetyItem.organization_id == organization_id,
            BuildingSafetyItem.deleted_at.is_(None),
        )
    )
    if site_id is not None:
        statement = statement.where(BuildingSafetyItem.site_id == site_id)
    statement = statement.order_by(
        BuildingSafetyItem.status.asc(),
        BuildingSafetyItem.next_due_date.asc(),
        BuildingSafetyItem.name.asc(),
    )
    return db.execute(statement).scalars().all()


def resolve_building_safety_alert_status(
    item: BuildingSafetyItem,
    reference_date: date | None = None,
) -> str:
    today = reference_date or date.today()
    if item.status == BuildingSafetyItemStatus.ARCHIVED:
        return "archived"
    if item.next_due_date < today:
        return "overdue"
    if item.next_due_date <= today + timedelta(days=DUE_SOON_WINDOW_DAYS):
        return "due_soon"
    return "ok"


def serialize_building_safety_item(
    item: BuildingSafetyItem,
    reference_date: date | None = None,
) -> dict[str, object | None]:
    return {
        "id": item.id,
        "version": item.version,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
        "deleted_at": item.deleted_at,
        "organization_id": item.organization_id,
        "site_id": item.site_id,
        "site_name": item.site.name if item.site is not None else "",
        "item_type": item.item_type,
        "name": item.name,
        "next_due_date": item.next_due_date,
        "last_checked_at": item.last_checked_at,
        "status": item.status,
        "alert_status": resolve_building_safety_alert_status(item, reference_date),
        "notes": item.notes,
    }


def build_building_safety_alerts(
    items: list[BuildingSafetyItem],
    reference_date: date | None = None,
) -> list[dict[str, object]]:
    alerts: list[dict[str, object]] = []
    for item in items:
        alert_type = resolve_building_safety_alert_status(item, reference_date)
        if alert_type not in {"due_soon", "overdue"}:
            continue
        alerts.append(
            {
                "item_id": item.id,
                "site_id": item.site_id,
                "site_name": item.site.name if item.site is not None else "",
                "item_name": item.name,
                "item_type": item.item_type,
                "alert_type": alert_type,
                "due_date": item.next_due_date,
                "message": (
                    f"Échéance proche le {item.next_due_date.isoformat()}"
                    if alert_type == "due_soon"
                    else f"Élément en retard depuis le {item.next_due_date.isoformat()}"
                ),
            }
        )

    return sorted(
        alerts,
        key=lambda item: (item["alert_type"] != "overdue", item["due_date"], item["item_name"]),
    )
