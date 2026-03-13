from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid5


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


def list_worksite_summaries(organization_id: UUID) -> list[dict[str, object]]:
    return [
        {
            "id": uuid5(organization_id, str(template["key"])),
            "organization_id": organization_id,
            "name": template["name"],
            "client_name": template["client_name"],
            "address": template["address"],
            "status": template["status"],
            "planned_for": template["planned_for"],
            "updated_at": template["updated_at"],
        }
        for template in WORKSITE_TEMPLATES
    ]


def list_worksite_lookup(organization_id: UUID) -> dict[UUID, dict[str, object]]:
    return {
        worksite["id"]: worksite
        for worksite in list_worksite_summaries(organization_id)
    }


def get_worksite_summary(organization_id: UUID, worksite_id: UUID) -> dict[str, object] | None:
    return list_worksite_lookup(organization_id).get(worksite_id)
