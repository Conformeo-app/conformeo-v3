from uuid import UUID

from pydantic import BaseModel


class RegulatoryCriterionRead(BaseModel):
    code: str
    label: str
    value: bool | int | None
    summary: str


class RegulatoryObligationRead(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: str
    rule_key: str


class ApplicableRegulatoryObligationRead(RegulatoryObligationRead):
    status: str
    reason_summary: str
    matched_criteria: list[str]


class OrganizationRegulatoryProfileRead(BaseModel):
    organization_id: UUID
    profile_status: str
    missing_profile_items: list[str]
    criteria: list[RegulatoryCriterionRead]
    applicable_obligations: list[ApplicableRegulatoryObligationRead]
