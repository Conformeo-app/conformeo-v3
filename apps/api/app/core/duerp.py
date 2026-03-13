from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models import DuerpEntry, DuerpEntryStatus


def list_duerp_entries(
    db: Session,
    organization_id,
    site_id=None,
) -> list[DuerpEntry]:
    statement = (
        select(DuerpEntry)
        .options(selectinload(DuerpEntry.site))
        .where(
            DuerpEntry.organization_id == organization_id,
            DuerpEntry.deleted_at.is_(None),
        )
    )
    if site_id is not None:
        statement = statement.where(DuerpEntry.site_id == site_id)
    statement = statement.order_by(
        DuerpEntry.status.asc(),
        DuerpEntry.severity.asc(),
        DuerpEntry.work_unit_name.asc(),
        DuerpEntry.risk_label.asc(),
    )
    return db.execute(statement).scalars().all()


def resolve_duerp_compliance_status(entry: DuerpEntry, proof_count: int) -> str:
    if entry.status == DuerpEntryStatus.ARCHIVED:
        return "to_complete"
    if not entry.prevention_action:
        return "to_complete"
    if proof_count > 0:
        return "compliant"
    return "in_progress"


def serialize_duerp_entry(entry: DuerpEntry, proof_count: int) -> dict[str, object | None]:
    return {
        "id": entry.id,
        "version": entry.version,
        "created_at": entry.created_at,
        "updated_at": entry.updated_at,
        "deleted_at": entry.deleted_at,
        "organization_id": entry.organization_id,
        "site_id": entry.site_id,
        "site_name": entry.site.name if entry.site is not None else None,
        "work_unit_name": entry.work_unit_name,
        "risk_label": entry.risk_label,
        "severity": entry.severity,
        "prevention_action": entry.prevention_action,
        "status": entry.status,
        "compliance_status": resolve_duerp_compliance_status(entry, proof_count),
        "proof_count": proof_count,
    }
