from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid5

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.models.organization import Organization
from app.db.models.organization_site import OrganizationSite
from app.db.models.user import UserStatus
from app.db.models.worksite import Worksite, WorksiteIntervention


WORKSITE_TEMPLATES: tuple[dict[str, object], ...] = (
    {
        "key": "carnot-heating",
        "name": "Entretien chauffage Carnot",
        "client_name": "Syndic Carnot",
        "address": "12 rue Carnot, 69002 Lyon",
        "status": "planned",
        "planned_for": datetime(2026, 3, 12, 7, 30, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 3, 11, 8, 0, tzinfo=timezone.utc),
    },
    {
        "key": "mazure-ventilation",
        "name": "Remise en service ventilation Mazure",
        "client_name": "SCI Mazure",
        "address": "18 avenue Roger Salengro, 69100 Villeurbanne",
        "status": "in_progress",
        "planned_for": datetime(2026, 3, 11, 8, 15, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 3, 11, 8, 20, tzinfo=timezone.utc),
    },
    {
        "key": "pasteur-security",
        "name": "Contrôle sécurité bâtiment Pasteur",
        "client_name": "Clinique Pasteur",
        "address": "44 avenue Franklin Roosevelt, 69500 Bron",
        "status": "blocked",
        "planned_for": datetime(2026, 3, 13, 9, 0, tzinfo=timezone.utc),
        "updated_at": datetime(2026, 3, 10, 17, 0, tzinfo=timezone.utc),
    },
)


def list_template_worksite_summaries(organization_id: UUID) -> list[dict[str, object]]:
    return [
        {
            "id": uuid5(organization_id, str(template["key"])),
            "organization_id": organization_id,
            "is_persisted": False,
            "name": template["name"],
            "client_name": template["client_name"],
            "address": template["address"],
            "status": template["status"],
            "planned_for": template["planned_for"],
            "updated_at": template["updated_at"],
            "description": None,
            "site_id": None,
            "site_name": None,
            "interventions": [],
        }
        for template in WORKSITE_TEMPLATES
    ]


def serialize_worksite_summary(
    organization: Organization,
    worksite: Worksite,
) -> dict[str, object]:
    site = worksite.site
    resolved_address = (site.address.strip() if site is not None and site.address else "") or (
        organization.headquarters_address.strip() if organization.headquarters_address else ""
    )
    resolved_site_name = site.name.strip() if site is not None and site.name else None
    resolved_client_name = resolved_site_name or organization.name

    return {
        "id": worksite.id,
        "organization_id": organization.id,
        "is_persisted": True,
        "name": worksite.name,
        "client_name": resolved_client_name,
        "address": resolved_address,
        "status": worksite.status.value,
        "planned_for": worksite.planned_for,
        "updated_at": worksite.updated_at,
        "description": worksite.description,
        "site_id": site.id if site is not None else None,
        "site_name": resolved_site_name,
        "interventions": [
            serialize_worksite_intervention(intervention)
            for intervention in sorted(
                [
                    item
                    for item in worksite.interventions
                    if item.deleted_at is None
                ],
                key=lambda item: (
                    item.completed_at or item.scheduled_for or item.created_at,
                    item.created_at,
                ),
            )
        ],
    }


def serialize_worksite_intervention(intervention: WorksiteIntervention) -> dict[str, object]:
    assignee_display_name = None
    if intervention.assignee_user is not None and intervention.assignee_user.deleted_at is None:
        if intervention.assignee_user.status == UserStatus.ACTIVE:
            assignee_display_name = intervention.assignee_user.display_name

    return {
        "id": intervention.id,
        "version": intervention.version,
        "organization_id": intervention.organization_id,
        "worksite_id": intervention.worksite_id,
        "intervention_type": intervention.intervention_type.value,
        "status": intervention.status.value,
        "scheduled_for": intervention.scheduled_for,
        "completed_at": intervention.completed_at,
        "result": intervention.result.value if intervention.result is not None else None,
        "team_id": intervention.team_id,
        "team_name": intervention.team.name if intervention.team is not None else None,
        "assignee_user_id": intervention.assignee_user_id,
        "assignee_display_name": assignee_display_name,
        "notes": intervention.notes,
        "report_comment": intervention.report_comment,
        "follow_up_note": intervention.follow_up_note,
        "created_at": intervention.created_at,
        "updated_at": intervention.updated_at,
        "deleted_at": intervention.deleted_at,
    }


def list_persisted_worksites(
    db: Session,
    organization: Organization,
) -> list[dict[str, object]]:
    worksites = (
        db.execute(
            select(Worksite)
            .options(
                selectinload(Worksite.site),
                selectinload(Worksite.interventions).selectinload(WorksiteIntervention.team),
                selectinload(Worksite.interventions).selectinload(WorksiteIntervention.assignee_user),
            )
            .where(
                Worksite.organization_id == organization.id,
                Worksite.deleted_at.is_(None),
            )
            .order_by(Worksite.updated_at.desc(), Worksite.created_at.desc(), Worksite.name.asc())
        )
        .scalars()
        .all()
    )
    return [serialize_worksite_summary(organization, worksite) for worksite in worksites]


def list_worksite_summaries(
    db: Session,
    organization: Organization,
) -> list[dict[str, object]]:
    persisted_worksites = list_persisted_worksites(db, organization)
    if persisted_worksites:
        return persisted_worksites
    return list_template_worksite_summaries(organization.id)


def list_worksite_lookup(
    db: Session,
    organization: Organization,
) -> dict[UUID, dict[str, object]]:
    return {
        UUID(str(worksite["id"])): worksite
        for worksite in list_worksite_summaries(db, organization)
    }


def get_worksite_summary(
    db: Session,
    organization: Organization,
    worksite_id: UUID,
) -> dict[str, object] | None:
    return list_worksite_lookup(db, organization).get(worksite_id)


def get_worksite_site(
    db: Session,
    organization_id: UUID,
    site_id: UUID | None,
) -> OrganizationSite | None:
    if site_id is None:
        return None
    site = db.get(OrganizationSite, site_id)
    if site is None or site.deleted_at is not None or site.organization_id != organization_id:
        return None
    return site
