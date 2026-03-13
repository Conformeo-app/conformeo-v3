from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.core.building_safety import resolve_building_safety_alert_status
from app.core.regulatory_evidence import build_regulatory_evidence_indexes
from app.db.models import BuildingSafetyItem, Document, DuerpEntry
from app.db.models.organization import Organization
from app.db.models.organization_site import OrganizationSite, OrganizationSiteStatus, OrganizationSiteType


RegulatoryCriterionValue = bool | int | None


@dataclass(frozen=True)
class RegulatoryCriterionSnapshot:
    code: str
    label: str
    value: RegulatoryCriterionValue
    summary: str


@dataclass(frozen=True)
class RegulatoryObligationDefinition:
    id: str
    title: str
    description: str
    category: str
    priority: str
    rule_key: str


OBLIGATION_CATALOG: tuple[RegulatoryObligationDefinition, ...] = (
    RegulatoryObligationDefinition(
        id="reg-employees-register",
        title="Registre du personnel",
        description="Tenez a jour les entrees, sorties et informations essentielles des salaries.",
        category="employees",
        priority="high",
        rule_key="employees_present",
    ),
    RegulatoryObligationDefinition(
        id="reg-employees-safety-organization",
        title="Organisation du suivi sante et securite des salaries",
        description="Preparez les informations de base utiles a l'accueil securite et au suivi des salaries.",
        category="employees",
        priority="medium",
        rule_key="employees_present",
    ),
    RegulatoryObligationDefinition(
        id="reg-sites-emergency-contacts",
        title="Consignes et contacts d'urgence sur site",
        description="Formalisez les contacts utiles et l'organisation d'urgence sur chaque site actif.",
        category="safety",
        priority="high",
        rule_key="active_sites_present",
    ),
    RegulatoryObligationDefinition(
        id="reg-buildings-periodic-checks",
        title="Suivi des verifications periodiques des locaux",
        description="Preparez un suivi simple des controles et verifications des batiments utilises.",
        category="buildings",
        priority="high",
        rule_key="premises_present",
    ),
    RegulatoryObligationDefinition(
        id="reg-warehouse-storage-rules",
        title="Consignes de stockage en entrepot",
        description="Identifiez les zones sensibles et les regles locales de stockage quand un entrepot est declare.",
        category="safety",
        priority="medium",
        rule_key="warehouse_present",
    ),
)


def get_obligation_definition(obligation_id: str) -> RegulatoryObligationDefinition | None:
    return next((item for item in OBLIGATION_CATALOG if item.id == obligation_id), None)


def build_regulatory_profile_snapshot(
    organization: Organization,
    sites: list[OrganizationSite],
    building_safety_items: list[BuildingSafetyItem] | None = None,
    duerp_entries: list[DuerpEntry] | None = None,
    documents: list[Document] | None = None,
) -> dict[str, Any]:
    active_sites = [site for site in sites if site.status == OrganizationSiteStatus.ACTIVE]
    active_premises = [
        site
        for site in active_sites
        if site.site_type in {OrganizationSiteType.BUILDING, OrganizationSiteType.OFFICE, OrganizationSiteType.WAREHOUSE}
    ]
    active_warehouse_sites = [site for site in active_sites if site.site_type == OrganizationSiteType.WAREHOUSE]
    active_building_safety_items = [
        item
        for item in (building_safety_items or [])
        if item.status.value == "active" and item.deleted_at is None
    ]
    active_duerp_entries = [
        entry
        for entry in (duerp_entries or [])
        if entry.status.value == "active" and entry.deleted_at is None
    ]
    evidence_indexes = build_regulatory_evidence_indexes(documents or [])

    criteria = [
        RegulatoryCriterionSnapshot(
            code="has_employees",
            label="Salaries declares",
            value=organization.has_employees,
            summary=(
                "Salaries declares"
                if organization.has_employees is True
                else "Aucun salarie declare"
                if organization.has_employees is False
                else "Presence de salaries a preciser"
            ),
        ),
        RegulatoryCriterionSnapshot(
            code="employee_count_known",
            label="Effectif connu",
            value=organization.employee_count,
            summary=(
                f"Effectif declare : {organization.employee_count}"
                if organization.employee_count is not None
                else "Effectif a preciser"
            ),
        ),
        RegulatoryCriterionSnapshot(
            code="has_active_site",
            label="Sites actifs",
            value=len(active_sites),
            summary=(
                f"{len(active_sites)} site{'s' if len(active_sites) > 1 else ''} actif{'s' if len(active_sites) > 1 else ''}"
                if active_sites
                else "Aucun site actif declare"
            ),
        ),
        RegulatoryCriterionSnapshot(
            code="has_premises",
            label="Locaux utilises",
            value=bool(active_premises),
            summary="Locaux ou batiments declares" if active_premises else "Aucun local declare",
        ),
        RegulatoryCriterionSnapshot(
            code="has_warehouse",
            label="Entrepot declare",
            value=bool(active_warehouse_sites),
            summary="Entrepot actif declare" if active_warehouse_sites else "Pas d'entrepot declare",
        ),
        RegulatoryCriterionSnapshot(
            code="receives_public",
            label="Accueil du public",
            value=organization.receives_public,
            summary=(
                "Accueil du public sur au moins un site"
                if organization.receives_public is True
                else "Pas d'accueil du public declare"
                if organization.receives_public is False
                else "Accueil du public a preciser"
            ),
        ),
        RegulatoryCriterionSnapshot(
            code="stores_hazardous_products",
            label="Stockage sensible",
            value=organization.stores_hazardous_products,
            summary=(
                "Produits ou materiels sensibles stockes sur site"
                if organization.stores_hazardous_products is True
                else "Pas de stockage sensible declare"
                if organization.stores_hazardous_products is False
                else "Stockage sensible a preciser"
            ),
        ),
        RegulatoryCriterionSnapshot(
            code="performs_high_risk_work",
            label="Interventions a risque",
            value=organization.performs_high_risk_work,
            summary=(
                "Interventions a risque declarees"
                if organization.performs_high_risk_work is True
                else "Pas d'interventions a risque declarees"
                if organization.performs_high_risk_work is False
                else "Interventions a risque a preciser"
            ),
        ),
    ]

    core_missing_items: list[str] = []
    if organization.activity_label is None or not organization.activity_label.strip():
        core_missing_items.append("activité principale")
    if organization.has_employees is None:
        core_missing_items.append("présence de salariés")
    if organization.contact_email is None or not organization.contact_email.strip():
        core_missing_items.append("email de contact")
    qualification_missing_items: list[str] = []
    if active_sites and organization.receives_public is None:
        qualification_missing_items.append("accueil du public")
    if active_sites and organization.stores_hazardous_products is None:
        qualification_missing_items.append("stockage de produits ou materiels sensibles")
    if organization.has_employees is True and organization.performs_high_risk_work is None:
        qualification_missing_items.append("niveau de risque des interventions terrain")
    missing_profile_items = core_missing_items + qualification_missing_items

    applicable_obligations: list[dict[str, Any]] = []
    for obligation in OBLIGATION_CATALOG:
        evaluation = evaluate_obligation(
            obligation,
            organization,
            active_sites,
            active_premises,
            active_warehouse_sites,
        )
        if evaluation is None:
            continue
        applicable_obligations.append(
            {
                "id": obligation.id,
                "title": obligation.title,
                "description": obligation.description,
                "category": obligation.category,
                "priority": obligation.priority,
                "rule_key": obligation.rule_key,
                "status": resolve_obligation_status(
                    obligation.id,
                    organization,
                    active_sites,
                    active_premises,
                    active_warehouse_sites,
                    active_building_safety_items,
                    active_duerp_entries,
                    evidence_indexes,
                ),
                "reason_summary": evaluation["reason_summary"],
                "matched_criteria": evaluation["matched_criteria"],
            }
        )

    return {
        "organization_id": organization.id,
        "profile_status": "to_complete" if core_missing_items else "ready",
        "missing_profile_items": missing_profile_items,
        "criteria": [criterion.__dict__ for criterion in criteria],
        "applicable_obligations": applicable_obligations,
    }


def evaluate_obligation(
    obligation: RegulatoryObligationDefinition,
    organization: Organization,
    active_sites: list[OrganizationSite],
    active_premises: list[OrganizationSite],
    active_warehouse_sites: list[OrganizationSite],
) -> dict[str, Any] | None:
    if obligation.id == "reg-employees-register" and organization.has_employees is True:
        return {
            "reason_summary": "Applicable car des salaries sont declares dans le profil entreprise.",
            "matched_criteria": ["has_employees", "employee_count_known"],
        }

    if obligation.id == "reg-employees-safety-organization" and organization.has_employees is True:
        return {
            "reason_summary": (
                "Applicable car l'entreprise declare des salaries et des interventions a risque a encadrer."
                if organization.performs_high_risk_work is True
                else "Applicable car l'entreprise declare des salaries a accompagner sur les volets sante et securite."
            ),
            "matched_criteria": ["has_employees"]
            + (["performs_high_risk_work"] if organization.performs_high_risk_work is True else []),
        }

    if obligation.id == "reg-sites-emergency-contacts" and active_sites:
        return {
            "reason_summary": (
                "Applicable car au moins un site actif accueille du public ou des intervenants."
                if organization.receives_public is True
                else "Applicable car au moins un site actif est declare."
            ),
            "matched_criteria": ["has_active_site"]
            + (["receives_public"] if organization.receives_public is True else []),
        }

    if obligation.id == "reg-buildings-periodic-checks" and active_premises:
        return {
            "reason_summary": "Applicable car au moins un batiment, bureau ou entrepot est utilise.",
            "matched_criteria": ["has_active_site", "has_premises"],
        }

    if obligation.id == "reg-warehouse-storage-rules" and (
        active_warehouse_sites or (organization.stores_hazardous_products is True and active_sites)
    ):
        return {
            "reason_summary": (
                "Applicable car des produits ou materiels sensibles sont stockes sur site."
                if organization.stores_hazardous_products is True and not active_warehouse_sites
                else "Applicable car un entrepot actif est declare dans la structure de sites."
            ),
            "matched_criteria": ["has_active_site"]
            + (["has_warehouse"] if active_warehouse_sites else [])
            + (["stores_hazardous_products"] if organization.stores_hazardous_products is True else []),
        }

    return None


def resolve_obligation_status(
    obligation_id: str,
    organization: Organization,
    active_sites: list[OrganizationSite],
    active_premises: list[OrganizationSite],
    active_warehouse_sites: list[OrganizationSite],
    active_building_safety_items: list[BuildingSafetyItem],
    active_duerp_entries: list[DuerpEntry],
    evidence_indexes: dict[str, dict],
) -> str:
    obligation_count = evidence_indexes["obligation_counts"].get(obligation_id, 0)
    site_counts = evidence_indexes["site_counts"]
    building_safety_item_counts = evidence_indexes["building_safety_item_counts"]
    duerp_entry_counts = evidence_indexes["duerp_entry_counts"]

    if obligation_id == "reg-employees-register":
        if obligation_count > 0:
            return "compliant"
        if organization.employee_count is not None:
            return "in_progress"
        return "to_complete"

    if obligation_id == "reg-employees-safety-organization":
        if not active_duerp_entries:
            return "to_verify" if organization.performs_high_risk_work is True else "to_complete"
        if obligation_count > 0 or any(duerp_entry_counts.get(str(entry.id), 0) > 0 for entry in active_duerp_entries):
            return "compliant"
        return "in_progress"

    if obligation_id == "reg-sites-emergency-contacts":
        if obligation_count > 0 or any(site_counts.get(str(site.id), 0) > 0 for site in active_sites):
            return "compliant"
        return "to_verify" if organization.receives_public is True else "to_complete"

    if obligation_id == "reg-buildings-periodic-checks":
        if not active_building_safety_items:
            return "to_complete"
        alert_statuses = {resolve_building_safety_alert_status(item) for item in active_building_safety_items}
        if "overdue" in alert_statuses:
            return "overdue"
        if "due_soon" in alert_statuses:
            return "to_verify"
        if obligation_count > 0 or any(
            building_safety_item_counts.get(str(item.id), 0) > 0 for item in active_building_safety_items
        ):
            return "compliant"
        return "in_progress"

    if obligation_id == "reg-warehouse-storage-rules":
        relevant_sites = active_warehouse_sites or (
            active_sites if organization.stores_hazardous_products is True else []
        )
        if obligation_count > 0 or any(site_counts.get(str(site.id), 0) > 0 for site in relevant_sites):
            return "compliant"
        return "to_verify" if organization.stores_hazardous_products is True else "in_progress"

    return "to_complete"
