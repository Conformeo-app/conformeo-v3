from __future__ import annotations

import io
import os
import sys
import unittest
from datetime import date
from pathlib import Path
from uuid import UUID

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.db.models import (
    Base,
    BillingCustomer,
    BuildingSafetyItem,
    BuildingSafetyItemStatus,
    BuildingSafetyItemType,
    Document,
    DocumentStatus,
    DuerpEntry,
    Invoice,
    Organization,
    OrganizationMembership,
    OrganizationStatus,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationSite,
    OrganizationSiteType,
    OrganizationTeam,
    Quote,
    Worksite,
    WorksiteCoordinationItem,
    WorksiteEquipment,
    WorksiteEquipmentMovement,
    WorksiteIntervention,
    WorksiteStatus,
    User,
    UserStatus,
)
from app.seed_demo_workspace import (
    DEMO_ORGANIZATION_ACTIVITY,
    DEMO_ORGANIZATION_SLUG,
    DemoSeedError,
    PARIS_EQUIPMENT_CONFINEMENT_NAME,
    PARIS_EQUIPMENT_PRIMARY_NAME,
    PARIS_EQUIPMENT_SECONDARY_NAME,
    RIVOLI_CUSTOMER_NAME,
    RIVOLI_SITE_NAME,
    RIVOLI_WORKSITE_NAME,
    SAINT_OUEN_CUSTOMER_NAME,
    SAINT_OUEN_EQUIPMENT_BARRICADE_NAME,
    SAINT_OUEN_EQUIPMENT_FAN_NAME,
    SAINT_OUEN_EQUIPMENT_LADDER_NAME,
    SAINT_OUEN_SITE_NAME,
    SAINT_OUEN_WORKSITE_NAME,
    SECONDARY_ACTOR_NAME,
    SeedDemoWorkspaceInput,
    UNASSIGNED_EQUIPMENT_DRILL_NAME,
    UNASSIGNED_EQUIPMENT_LIGHT_NAME,
    UNASSIGNED_EQUIPMENT_SENSOR_NAME,
    VICTOR_HUGO_CUSTOMER_NAME,
    VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME,
    VICTOR_HUGO_SITE_NAME,
    VICTOR_HUGO_WORKSITE_NAME,
    run_seed_demo_workspace,
    seed_demo_workspace,
)
from app.schemas.organization_site import OrganizationSiteRead


class SeedDemoWorkspaceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.engine = create_engine(
            "sqlite+pysqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
        cls.SessionLocal = sessionmaker(
            bind=cls.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    def setUp(self) -> None:
        Base.metadata.drop_all(self.engine)
        Base.metadata.create_all(self.engine)
        self.seed_base_organization()

    def seed_base_organization(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000001111"),
                name="Conformeo Dev",
                slug=DEMO_ORGANIZATION_SLUG,
                legal_name="Conformeo Dev",
                status=OrganizationStatus.ACTIVE,
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000001112"),
                email="admin@conformeo.local",
                password_hash="hash",
                first_name="Michel",
                last_name="Germanotti",
                display_name="Michel Germanotti",
                status=UserStatus.ACTIVE,
            )
            session.add_all([organization, owner])
            session.flush()
            session.add(
                OrganizationMembership(
                    user_id=owner.id,
                    organization_id=organization.id,
                    role_code="owner",
                    is_default=True,
                )
            )
            session.add_all(
                [
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.REGLEMENTATION,
                        is_enabled=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.CHANTIER,
                        is_enabled=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.FACTURATION,
                        is_enabled=True,
                    ),
                ]
            )
            session.commit()
        finally:
            session.close()

    def test_seed_demo_workspace_is_idempotent_and_coherent(self) -> None:
        session = self.SessionLocal()
        try:
            first = seed_demo_workspace(session, SeedDemoWorkspaceInput())
            second = seed_demo_workspace(session, SeedDemoWorkspaceInput())

            organization = session.execute(
                select(Organization).where(Organization.slug == DEMO_ORGANIZATION_SLUG)
            ).scalar_one()
            sites = session.execute(select(OrganizationSite)).scalars().all()
            worksites = session.execute(select(Worksite)).scalars().all()
            equipments = session.execute(select(WorksiteEquipment)).scalars().all()
            equipment_movements = session.execute(select(WorksiteEquipmentMovement)).scalars().all()
            interventions = session.execute(select(WorksiteIntervention)).scalars().all()
            coordination_items = session.execute(
                select(WorksiteCoordinationItem).where(WorksiteCoordinationItem.target_type == "worksite")
            ).scalars().all()
            memberships = session.execute(select(OrganizationMembership)).scalars().all()
            teams = session.execute(select(OrganizationTeam)).scalars().all()
            users = session.execute(select(User)).scalars().all()
            safety_items = session.execute(select(BuildingSafetyItem)).scalars().all()
            duerp_entries = session.execute(select(DuerpEntry)).scalars().all()
            documents = session.execute(select(Document)).scalars().all()
            customers = session.execute(select(BillingCustomer)).scalars().all()
            quotes = session.execute(select(Quote)).scalars().all()
            invoices = session.execute(select(Invoice)).scalars().all()
        finally:
            session.close()

        self.assertEqual(first.organization_slug, DEMO_ORGANIZATION_SLUG)
        self.assertEqual(second.organization_slug, DEMO_ORGANIZATION_SLUG)
        self.assertEqual(organization.activity_label, DEMO_ORGANIZATION_ACTIVITY)
        self.assertEqual(organization.employee_count, 9)
        self.assertTrue(organization.has_employees)
        self.assertEqual(len(sites), 3)
        self.assertEqual(len(worksites), 3)
        self.assertEqual(len(equipments), 10)
        self.assertEqual(len(equipment_movements), 12)
        self.assertEqual(len(interventions), 4)
        self.assertEqual(len(coordination_items), 3)
        self.assertEqual(len(memberships), 5)
        self.assertEqual(len(teams), 2)
        self.assertEqual(len(users), 5)
        self.assertEqual(len(safety_items), 3)
        self.assertEqual(len(duerp_entries), 2)
        self.assertEqual(len(documents), 5)
        self.assertEqual(len(customers), 3)
        self.assertEqual(len(quotes), 4)
        self.assertEqual(len(invoices), 5)
        self.assertEqual(first.worksites, 3)
        self.assertEqual(first.worksite_equipments, 10)
        self.assertEqual(first.equipment_movements, 12)
        self.assertEqual(first.billing_customers, 3)
        self.assertEqual(first.quotes, 4)
        self.assertEqual(first.invoices, 5)
        self.assertEqual({team.name for team in teams}, {"Equipe interventions ERP", "Equipe logistique Saint-Ouen"})
        self.assertEqual(
            {membership.role_code for membership in memberships},
            {"owner", "admin", "manager", "contributor", "viewer"},
        )
        user_statuses = {user.email: user.status.value for user in users}
        self.assertEqual(user_statuses["pauline.admin@conformeo.local"], "active")
        self.assertEqual(user_statuses["nora.manager@conformeo.local"], "active")
        self.assertEqual(user_statuses["yanis.terrain@conformeo.local"], "active")
        self.assertEqual(user_statuses["clara.viewer@conformeo.local"], "active")

        names = {row.name for row in sites}
        self.assertEqual(names, {RIVOLI_SITE_NAME, SAINT_OUEN_SITE_NAME, VICTOR_HUGO_SITE_NAME})

        site_statuses = {row.name: row.location_enrichment_status for row in sites}
        self.assertEqual(site_statuses[RIVOLI_SITE_NAME], "enriched")
        self.assertEqual(site_statuses[SAINT_OUEN_SITE_NAME], "partial")
        self.assertEqual(site_statuses[VICTOR_HUGO_SITE_NAME], "failed")

        site_reasons = {row.name: row.location_enrichment_last_error_reason for row in sites}
        self.assertEqual(site_reasons[RIVOLI_SITE_NAME], None)
        self.assertEqual(site_reasons[SAINT_OUEN_SITE_NAME], "risk_provider_unavailable")
        self.assertEqual(site_reasons[VICTOR_HUGO_SITE_NAME], "provider_unavailable")
        for site in sites:
            serialized_site = OrganizationSiteRead.model_validate(site)
            self.assertIsNotNone(serialized_site.location_source_meta)
            self.assertIsNotNone(serialized_site.location_source_meta.retrieved_at)

        worksite_names = {row.name for row in worksites}
        self.assertEqual(
            worksite_names,
            {RIVOLI_WORKSITE_NAME, SAINT_OUEN_WORKSITE_NAME, VICTOR_HUGO_WORKSITE_NAME},
        )

        rivoli_worksite = next(row for row in worksites if row.name == RIVOLI_WORKSITE_NAME)
        saint_ouen_worksite = next(row for row in worksites if row.name == SAINT_OUEN_WORKSITE_NAME)
        victor_hugo_worksite = next(row for row in worksites if row.name == VICTOR_HUGO_WORKSITE_NAME)
        team_by_name = {team.name: team for team in teams}
        coordination_by_worksite_id = {row.target_id: row for row in coordination_items}
        interventions_by_worksite_name = {
            worksite.name: [row for row in interventions if row.worksite_id == worksite.id]
            for worksite in worksites
        }
        self.assertEqual(rivoli_worksite.status.value, "in_progress")
        self.assertEqual(saint_ouen_worksite.status.value, "planned")
        self.assertEqual(victor_hugo_worksite.status.value, "blocked")
        self.assertEqual(
            saint_ouen_worksite.description,
            "Chantier a preparer avec ventilation, balisage et organisation du stockage sensible.",
        )
        self.assertEqual(coordination_by_worksite_id[rivoli_worksite.id].team_id, team_by_name["Equipe interventions ERP"].id)
        self.assertEqual(coordination_by_worksite_id[rivoli_worksite.id].status, "in_progress")
        self.assertEqual(coordination_by_worksite_id[saint_ouen_worksite.id].team_id, team_by_name["Equipe logistique Saint-Ouen"].id)
        self.assertEqual(coordination_by_worksite_id[saint_ouen_worksite.id].assignee_user_id, None)
        self.assertEqual(coordination_by_worksite_id[victor_hugo_worksite.id].team_id, None)
        self.assertEqual(
            sorted(row.status.value for row in interventions_by_worksite_name[RIVOLI_WORKSITE_NAME]),
            ["done", "planned"],
        )
        rivoli_completed_intervention = next(
            row for row in interventions_by_worksite_name[RIVOLI_WORKSITE_NAME] if row.status.value == "done"
        )
        self.assertEqual(rivoli_completed_intervention.result.value, "completed")
        self.assertEqual(
            rivoli_completed_intervention.report_comment,
            "Préparation réalisée avec balisage, confinement et accueil posés.",
        )
        self.assertEqual(
            rivoli_completed_intervention.follow_up_note,
            "Intervention équipe maintenue selon le créneau prévu.",
        )
        self.assertEqual(
            [row.status.value for row in interventions_by_worksite_name[SAINT_OUEN_WORKSITE_NAME]],
            ["to_schedule"],
        )
        self.assertEqual(
            [row.status.value for row in interventions_by_worksite_name[VICTOR_HUGO_WORKSITE_NAME]],
            ["planned"],
        )
        self.assertTrue(
            all(row.scheduled_for is not None for row in interventions_by_worksite_name[RIVOLI_WORKSITE_NAME] if row.status.value == "planned")
        )
        self.assertTrue(
            all(row.scheduled_for is not None for row in interventions_by_worksite_name[VICTOR_HUGO_WORKSITE_NAME])
        )

        equipment_by_name = {row.name: row for row in equipments}
        equipment_name_by_id = {row.id: row.name for row in equipments}
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_PRIMARY_NAME].status.value, "attention")
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_PRIMARY_NAME].worksite_id, rivoli_worksite.id)
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_SECONDARY_NAME].status.value, "ready")
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_SECONDARY_NAME].worksite_id, rivoli_worksite.id)
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_CONFINEMENT_NAME].status.value, "ready")
        self.assertEqual(equipment_by_name[PARIS_EQUIPMENT_CONFINEMENT_NAME].worksite_id, rivoli_worksite.id)
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_LADDER_NAME].status.value, "ready")
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_LADDER_NAME].worksite_id, saint_ouen_worksite.id)
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_BARRICADE_NAME].status.value, "ready")
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_BARRICADE_NAME].worksite_id, saint_ouen_worksite.id)
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_FAN_NAME].status.value, "attention")
        self.assertEqual(equipment_by_name[SAINT_OUEN_EQUIPMENT_FAN_NAME].worksite_id, saint_ouen_worksite.id)
        self.assertEqual(equipment_by_name[VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME].status.value, "unavailable")
        self.assertEqual(equipment_by_name[VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME].worksite_id, victor_hugo_worksite.id)
        self.assertEqual(equipment_by_name[UNASSIGNED_EQUIPMENT_LIGHT_NAME].status.value, "ready")
        self.assertIsNone(equipment_by_name[UNASSIGNED_EQUIPMENT_LIGHT_NAME].worksite_id)
        self.assertEqual(equipment_by_name[UNASSIGNED_EQUIPMENT_DRILL_NAME].status.value, "ready")
        self.assertIsNone(equipment_by_name[UNASSIGNED_EQUIPMENT_DRILL_NAME].worksite_id)
        self.assertEqual(equipment_by_name[UNASSIGNED_EQUIPMENT_SENSOR_NAME].status.value, "attention")
        self.assertIsNone(equipment_by_name[UNASSIGNED_EQUIPMENT_SENSOR_NAME].worksite_id)

        saint_ouen_movements = [row for row in equipment_movements if row.worksite_id == saint_ouen_worksite.id]
        self.assertEqual(len(saint_ouen_movements), 5)
        self.assertEqual(
            {(equipment_name_by_id[row.equipment_id], row.movement_type.value) for row in saint_ouen_movements},
            {
                (SAINT_OUEN_EQUIPMENT_LADDER_NAME, "assigned_to_worksite"),
                (SAINT_OUEN_EQUIPMENT_BARRICADE_NAME, "assigned_to_worksite"),
                (SAINT_OUEN_EQUIPMENT_FAN_NAME, "assigned_to_worksite"),
                (UNASSIGNED_EQUIPMENT_LIGHT_NAME, "removed_from_worksite"),
                (UNASSIGNED_EQUIPMENT_SENSOR_NAME, "marked_damaged"),
            },
        )
        light_movement = next(
            row
            for row in saint_ouen_movements
            if (
                equipment_name_by_id[row.equipment_id] == UNASSIGNED_EQUIPMENT_LIGHT_NAME
                and row.movement_type.value == "removed_from_worksite"
            )
        )
        self.assertEqual(light_movement.actor_display_name, SECONDARY_ACTOR_NAME)
        damaged_movement = next(
            row
            for row in equipment_movements
            if (
                equipment_name_by_id[row.equipment_id] == VICTOR_HUGO_EQUIPMENT_ELECTRIC_BOX_NAME
                and row.movement_type.value == "marked_damaged"
            )
        )
        self.assertEqual(damaged_movement.resulting_status.value, "unavailable")

        customer_names = {row.name for row in customers}
        self.assertEqual(
            customer_names,
            {RIVOLI_CUSTOMER_NAME, SAINT_OUEN_CUSTOMER_NAME, VICTOR_HUGO_CUSTOMER_NAME},
        )

        quote_by_number = {row.number: row for row in quotes}
        self.assertEqual(quote_by_number["DEV-2026-001"].status.value, "draft")
        self.assertEqual(quote_by_number["DEV-2026-002"].status.value, "sent")
        self.assertEqual(quote_by_number["DEV-2026-003"].follow_up_status, "to_follow_up")
        self.assertEqual(quote_by_number["DEV-2026-004"].status.value, "accepted")
        self.assertEqual(quote_by_number["DEV-2026-004"].worksite_id, rivoli_worksite.id)

        invoice_by_number = {row.number: row for row in invoices}
        self.assertEqual(invoice_by_number["FAC-2026-001"].status.value, "draft")
        self.assertEqual(invoice_by_number["FAC-2026-002"].status.value, "issued")
        self.assertEqual(invoice_by_number["FAC-2026-003"].status.value, "overdue")
        self.assertEqual(invoice_by_number["FAC-2026-003"].follow_up_status, "to_follow_up")
        self.assertEqual(invoice_by_number["FAC-2026-004"].status.value, "paid")
        self.assertEqual(invoice_by_number["FAC-2026-004"].paid_amount_cents, invoice_by_number["FAC-2026-004"].total_amount_cents)
        self.assertEqual(invoice_by_number["FAC-2026-005"].status.value, "issued")
        self.assertGreater(invoice_by_number["FAC-2026-005"].paid_amount_cents, 0)
        self.assertLess(invoice_by_number["FAC-2026-005"].paid_amount_cents, invoice_by_number["FAC-2026-005"].total_amount_cents)

    def test_clean_only_removes_demo_records(self) -> None:
        session = self.SessionLocal()
        try:
            seed_demo_workspace(session, SeedDemoWorkspaceInput())
            result = seed_demo_workspace(session, SeedDemoWorkspaceInput(clean_only=True))

            remaining_sites = session.execute(select(OrganizationSite)).scalars().all()
            remaining_worksites = session.execute(select(Worksite)).scalars().all()
            remaining_equipments = session.execute(select(WorksiteEquipment)).scalars().all()
            remaining_equipment_movements = session.execute(select(WorksiteEquipmentMovement)).scalars().all()
            remaining_safety_items = session.execute(select(BuildingSafetyItem)).scalars().all()
            remaining_duerp_entries = session.execute(select(DuerpEntry)).scalars().all()
            remaining_documents = session.execute(select(Document)).scalars().all()
            remaining_customers = session.execute(select(BillingCustomer)).scalars().all()
            remaining_quotes = session.execute(select(Quote)).scalars().all()
            remaining_invoices = session.execute(select(Invoice)).scalars().all()
            organization = session.execute(
                select(Organization).where(Organization.slug == DEMO_ORGANIZATION_SLUG)
            ).scalar_one()
        finally:
            session.close()

        self.assertGreaterEqual(result.cleaned_records, 45)
        self.assertEqual(len(remaining_sites), 0)
        self.assertEqual(len(remaining_worksites), 0)
        self.assertEqual(len(remaining_equipments), 0)
        self.assertEqual(len(remaining_equipment_movements), 0)
        self.assertEqual(len(remaining_safety_items), 0)
        self.assertEqual(len(remaining_duerp_entries), 0)
        self.assertEqual(len(remaining_documents), 0)
        self.assertEqual(len(remaining_customers), 0)
        self.assertEqual(len(remaining_quotes), 0)
        self.assertEqual(len(remaining_invoices), 0)
        self.assertIsNone(organization.activity_label)
        self.assertIsNone(organization.has_employees)

    def test_seed_demo_workspace_cleans_legacy_demo_records(self) -> None:
        session = self.SessionLocal()
        try:
            organization = session.execute(
                select(Organization).where(Organization.slug == DEMO_ORGANIZATION_SLUG)
            ).scalar_one()

            legacy_site = OrganizationSite(
                organization_id=organization.id,
                name="Chantier Paris Centre",
                address="12 rue de la Demo, 75012 Paris",
                site_type=OrganizationSiteType.SITE,
            )
            probe_site = OrganizationSite(
                organization_id=organization.id,
                name="Probe Paris API",
                address="1 rue du Probe, 75013 Paris",
                site_type=OrganizationSiteType.SITE,
            )
            session.add_all([legacy_site, probe_site])
            session.flush()

            session.add(
                Worksite(
                    organization_id=organization.id,
                    site_id=legacy_site.id,
                    name="Preparation base vie Lyon Nord",
                    status=WorksiteStatus.PLANNED,
                )
            )
            session.flush()
            legacy_worksite = session.execute(
                select(Worksite).where(Worksite.name == "Preparation base vie Lyon Nord")
            ).scalar_one()
            session.add(
                BuildingSafetyItem(
                    organization_id=organization.id,
                    site_id=legacy_site.id,
                    item_type=BuildingSafetyItemType.PERIODIC_CHECK,
                    name="Verification electrique annuelle",
                    next_due_date=date(2026, 3, 12),
                    status=BuildingSafetyItemStatus.ACTIVE,
                )
            )
            session.add(
                Document(
                    organization_id=organization.id,
                    attached_to_entity_type="organization_site",
                    attached_to_entity_id=legacy_site.id,
                    document_type="DUERP",
                    source="regulation",
                    status=DocumentStatus.AVAILABLE,
                    file_name="trame-duerp-renovation-2026.pdf",
                )
            )
            session.add(
                Document(
                    organization_id=organization.id,
                    attached_to_entity_type="worksite",
                    attached_to_entity_id=legacy_worksite.id,
                    document_type="worksite_summary_pdf",
                    source="worksite_generated",
                    status=DocumentStatus.AVAILABLE,
                    file_name="legacy-worksite-summary.pdf",
                )
            )
            session.commit()

            seed_demo_workspace(session, SeedDemoWorkspaceInput())

            site_names = set(session.execute(select(OrganizationSite.name)).scalars().all())
            worksite_names = set(session.execute(select(Worksite.name)).scalars().all())
            building_item_names = set(session.execute(select(BuildingSafetyItem.name)).scalars().all())
            document_files = set(session.execute(select(Document.file_name)).scalars().all())
        finally:
            session.close()

        self.assertEqual(site_names, {RIVOLI_SITE_NAME, SAINT_OUEN_SITE_NAME, VICTOR_HUGO_SITE_NAME})
        self.assertEqual(
            worksite_names,
            {RIVOLI_WORKSITE_NAME, SAINT_OUEN_WORKSITE_NAME, VICTOR_HUGO_WORKSITE_NAME},
        )
        self.assertNotIn("Verification electrique annuelle", building_item_names)
        self.assertNotIn("trame-duerp-renovation-2026.pdf", document_files)
        self.assertNotIn("legacy-worksite-summary.pdf", document_files)

    def test_cli_runner_reports_seed(self) -> None:
        stdout = io.StringIO()
        stderr = io.StringIO()

        exit_code = run_seed_demo_workspace(
            ["--organization-slug", DEMO_ORGANIZATION_SLUG],
            session_factory=self.SessionLocal,
            stdout=stdout,
            stderr=stderr,
        )

        self.assertEqual(exit_code, 0)
        self.assertEqual(stderr.getvalue(), "")
        self.assertIn("Seed demo termine.", stdout.getvalue())
        self.assertIn("organization_slug=conformeo-dev", stdout.getvalue())
        self.assertIn("worksites=3", stdout.getvalue())
        self.assertIn("quotes=4", stdout.getvalue())
        self.assertIn("invoices=5", stdout.getvalue())

    def test_seed_demo_workspace_requires_administration_tables(self) -> None:
        with self.engine.begin() as connection:
            connection.exec_driver_sql("drop table organization_team_members")
            connection.exec_driver_sql("drop table organization_teams")

        session = self.SessionLocal()
        try:
            with self.assertRaises(DemoSeedError) as exc:
                seed_demo_workspace(session, SeedDemoWorkspaceInput())
        finally:
            session.close()

        message = str(exc.exception)
        self.assertIn("0024", message)
        self.assertIn("0026", message)
        self.assertIn("0027", message)
        self.assertIn("organization_teams", message)
        self.assertIn("organization_team_members", message)


if __name__ == "__main__":
    unittest.main()
