from __future__ import annotations

import json
import tomllib
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


class Sprint0ScaffoldTest(unittest.TestCase):
    def test_expected_paths_exist(self) -> None:
        expected_paths = [
            ROOT / "apps" / "api" / "app" / "main.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "organization.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "organization_membership.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "user.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "audit_log.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "building_safety_item.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "billing_customer.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "duerp_entry.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "invoice.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "organization_site.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "quote.py",
            ROOT / "apps" / "api" / "app" / "bootstrap_admin.py",
            ROOT / "apps" / "api" / "migrations" / "0001_sprint0_core.sql",
            ROOT / "apps" / "api" / "migrations" / "0002_sprint0_multi_org.sql",
            ROOT / "apps" / "api" / "migrations" / "0003_sprint0_auth_rbac_modules.sql",
            ROOT / "apps" / "api" / "migrations" / "0004_sprint0_audit_log.sql",
            ROOT / "apps" / "api" / "migrations" / "0005_sprint0_documents.sql",
            ROOT / "apps" / "api" / "migrations" / "0006_sprint2_regulation_foundation.sql",
            ROOT / "apps" / "api" / "migrations" / "0007_sprint2_building_safety_v1.sql",
            ROOT / "apps" / "api" / "migrations" / "0008_sprint2_duerp_simplified.sql",
            ROOT / "apps" / "api" / "migrations" / "0009_sprint2_regulatory_questionnaire.sql",
            ROOT / "apps" / "api" / "migrations" / "0010_sprint3_billing_foundation.sql",
            ROOT / "apps" / "api" / "migrations" / "0011_sprint3_billing_status_payment_numbering.sql",
            ROOT / "apps" / "api" / "migrations" / "0012_sprint3_billing_pdf_worksite_link.sql",
            ROOT / "apps" / "api" / "migrations" / "0013_sprint3_billing_follow_up_status.sql",
            ROOT / "apps" / "api" / "app" / "api" / "routes" / "auth.py",
            ROOT / "apps" / "api" / "app" / "api" / "routes" / "organizations.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "document.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "organization_module.py",
            ROOT / "apps" / "api" / "app" / "core" / "audit.py",
            ROOT / "apps" / "api" / "app" / "core" / "building_safety.py",
            ROOT / "apps" / "api" / "app" / "core" / "billing_export_pdf.py",
            ROOT / "apps" / "api" / "app" / "core" / "duerp.py",
            ROOT / "apps" / "api" / "app" / "core" / "regulation.py",
            ROOT / "apps" / "api" / "app" / "core" / "regulatory_export_pdf.py",
            ROOT / "apps" / "api" / "app" / "core" / "regulatory_evidence.py",
            ROOT / "apps" / "api" / "app" / "core" / "worksites.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "audit_log.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "billing_customer.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "building_safety.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "document.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "duerp.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "invoice.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "organization_site.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "quote.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "regulation.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "regulatory_evidence.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "worksite.py",
            ROOT / "apps" / "api" / ".env.example",
            ROOT / "apps" / "web" / "angular.json",
            ROOT / "apps" / "web" / ".env.example",
            ROOT / "apps" / "web" / "src" / "main.ts",
            ROOT / "apps" / "web" / "src" / "app" / "organization-client.ts",
            ROOT / "apps" / "web" / "src" / "environments" / "generated-env.ts",
            ROOT / "apps" / "mobile" / "angular.json",
            ROOT / "apps" / "mobile" / ".env.example",
            ROOT / "apps" / "mobile" / "capacitor.config.ts",
            ROOT / "apps" / "mobile" / "src" / "main.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "local-database.migrations.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "quick-capture-pattern.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "sync-status.ts",
            ROOT / "apps" / "mobile" / "src" / "app" / "worksite-client.ts",
            ROOT / "apps" / "mobile" / "src" / "environments" / "generated-env.ts",
            ROOT / "packages" / "contracts" / "src" / "auth.ts",
            ROOT / "packages" / "contracts" / "src" / "audit-log.ts",
            ROOT / "packages" / "contracts" / "src" / "billing-customer.ts",
            ROOT / "packages" / "contracts" / "src" / "billing-follow-up.ts",
            ROOT / "packages" / "contracts" / "src" / "billing-line.ts",
            ROOT / "packages" / "contracts" / "src" / "building-safety.ts",
            ROOT / "packages" / "contracts" / "src" / "compliance.ts",
            ROOT / "packages" / "contracts" / "src" / "document.ts",
            ROOT / "packages" / "contracts" / "src" / "duerp.ts",
            ROOT / "packages" / "contracts" / "src" / "invoice.ts",
            ROOT / "packages" / "contracts" / "src" / "organization-membership.ts",
            ROOT / "packages" / "contracts" / "src" / "organization-module.ts",
            ROOT / "packages" / "contracts" / "src" / "organization-site.ts",
            ROOT / "packages" / "contracts" / "src" / "quote.ts",
            ROOT / "packages" / "contracts" / "src" / "regulation-obligation.ts",
            ROOT / "packages" / "contracts" / "src" / "regulatory-evidence.ts",
            ROOT / "packages" / "contracts" / "src" / "rbac.ts",
            ROOT / "packages" / "contracts" / "src" / "sync.ts",
            ROOT / "packages" / "contracts" / "src" / "worksite.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "button.component.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "input.component.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "card.component.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "status-chip.component.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "empty-state.component.ts",
            ROOT / "packages" / "ui" / "src" / "components" / "sync-state.component.ts",
            ROOT / "packages" / "ui" / "src" / "styles" / "tokens.css",
            ROOT / ".github" / "workflows" / "ci.yml",
            ROOT / "scripts" / "generate-frontend-env.mjs",
            ROOT / "docs" / "architecture" / "audit-log-sprint0.md",
            ROOT / "docs" / "architecture" / "auth-rbac-modules-sprint0.md",
            ROOT / "docs" / "architecture" / "ci-sprint0.md",
            ROOT / "docs" / "architecture" / "design-system-sprint0.md",
            ROOT / "docs" / "architecture" / "document-model-sprint0.md",
            ROOT / "docs" / "architecture" / "environment-strategy-sprint0.md",
            ROOT / "docs" / "architecture" / "mobile-local-database-sprint0.md",
            ROOT / "docs" / "architecture" / "mobile-photo-pipeline-sprint0.md",
            ROOT / "docs" / "architecture" / "quick-capture-pattern-sprint0.md",
            ROOT / "docs" / "architecture" / "mobile-sync-queue-sprint0.md",
            ROOT / "docs" / "architecture" / "worksite-photo-proof-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-risk-report-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-safety-checklist-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-signature-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-equipment-movement-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-sync-readability-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-sync-preparation-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-voice-note-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-read-import-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-mobile-first-sprint1.md",
            ROOT / "docs" / "architecture" / "worksite-equipment-list-sprint1.md",
            ROOT / "docs" / "architecture" / "regulation-foundation-sprint2.md",
            ROOT / "docs" / "architecture" / "regulation-obligations-v1-sprint2.md",
            ROOT / "docs" / "architecture" / "regulation-building-safety-v1-sprint2.md",
            ROOT / "docs" / "architecture" / "regulation-duerp-compliance-sprint2.md",
            ROOT / "docs" / "architecture" / "regulation-pdf-export-sprint2.md",
            ROOT / "docs" / "architecture" / "regulation-questionnaire-sprint2.md",
            ROOT / "docs" / "architecture" / "billing-foundation-sprint3.md",
            ROOT / "docs" / "architecture" / "billing-status-payment-numbering-sprint3.md",
            ROOT / "docs" / "architecture" / "billing-pdf-worksite-link-sprint3.md",
            ROOT / "docs" / "architecture" / "billing-status-payment-numbering-sprint3.md",
            ROOT / "docs" / "architecture" / "monorepo.md",
            ROOT / "docs" / "architecture" / "multi-organization-sprint0.md",
            ROOT / "docs" / "architecture" / "sync-model-sprint0.md",
        ]

        for path in expected_paths:
            with self.subTest(path=path):
                self.assertTrue(path.exists())

    def test_root_package_declares_workspace(self) -> None:
        package_json = json.loads((ROOT / "package.json").read_text())
        self.assertIn("workspaces", package_json)
        self.assertIn("packages/*", package_json["workspaces"])
        self.assertIn("dev:web", package_json["scripts"])
        self.assertIn("dev:mobile", package_json["scripts"])
        self.assertIn("dev:api", package_json["scripts"])
        self.assertIn("bootstrap:admin", package_json["scripts"])
        self.assertIn("ci", package_json["scripts"])
        self.assertIn("test:python", package_json["scripts"])
        self.assertIn("check:mobile:cap", package_json["scripts"])
        self.assertIn("tests.test_document_model", package_json["scripts"]["test:python"])
        self.assertIn("tests.test_worksite_import_api", package_json["scripts"]["test:python"])
        self.assertIn("tests.test_regulation_foundation_api", package_json["scripts"]["test:python"])
        self.assertIn("tests.test_billing_api", package_json["scripts"]["test:python"])

    def test_api_pyproject_declares_fastapi(self) -> None:
        pyproject = tomllib.loads((ROOT / "apps" / "api" / "pyproject.toml").read_text())
        dependencies = pyproject["project"]["dependencies"]
        self.assertTrue(any(dep.startswith("fastapi") for dep in dependencies))

    def test_migration_contains_core_tables(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0001_sprint0_core.sql").read_text()
        self.assertIn("create table if not exists organizations", migration)
        self.assertIn("create table if not exists users", migration)

    def test_multi_org_migration_contains_memberships(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0002_sprint0_multi_org.sql").read_text()
        self.assertIn("create table if not exists organization_memberships", migration)
        self.assertIn("role_code", migration)

    def test_auth_rbac_modules_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0003_sprint0_auth_rbac_modules.sql").read_text()
        self.assertIn("add column if not exists password_hash", migration)
        self.assertIn("create table if not exists organization_modules", migration)
        self.assertIn("organization_module_code", migration)

    def test_audit_log_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0004_sprint0_audit_log.sql").read_text()
        self.assertIn("create table if not exists audit_logs", migration)
        self.assertIn("actor_label", migration)
        self.assertIn("audit_action", migration)

    def test_document_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0005_sprint0_documents.sql").read_text()
        self.assertIn("create table if not exists documents", migration)
        self.assertIn("attached_to_entity_type", migration)
        self.assertIn("document_type", migration)
        self.assertIn("size_bytes", migration)
        self.assertIn("status document_status", migration)

    def test_regulation_foundation_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0006_sprint2_regulation_foundation.sql").read_text()
        self.assertIn("add column if not exists activity_label", migration)
        self.assertIn("add column if not exists onboarding_completed_at", migration)
        self.assertIn("create table if not exists organization_sites", migration)
        self.assertIn("organization_site_type", migration)
        self.assertIn("organization_site_status", migration)

    def test_building_safety_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0007_sprint2_building_safety_v1.sql").read_text()
        self.assertIn("create table if not exists building_safety_items", migration)
        self.assertIn("building_safety_item_type", migration)
        self.assertIn("building_safety_item_status", migration)
        self.assertIn("next_due_date date not null", migration)
        self.assertIn("site_id uuid not null", migration)

    def test_duerp_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0008_sprint2_duerp_simplified.sql").read_text()
        self.assertIn("create table if not exists duerp_entries", migration)
        self.assertIn("duerp_severity", migration)
        self.assertIn("duerp_entry_status", migration)
        self.assertIn("work_unit_name", migration)
        self.assertIn("prevention_action", migration)

    def test_regulatory_questionnaire_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0009_sprint2_regulatory_questionnaire.sql").read_text()
        self.assertIn("add column if not exists receives_public", migration)
        self.assertIn("add column if not exists stores_hazardous_products", migration)
        self.assertIn("add column if not exists performs_high_risk_work", migration)

    def test_billing_foundation_migration_contains_expected_changes(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0010_sprint3_billing_foundation.sql").read_text()
        self.assertIn("create table if not exists billing_customers", migration)
        self.assertIn("create table if not exists quotes", migration)
        self.assertIn("create table if not exists invoices", migration)
        self.assertIn("billing_customer_type", migration)
        self.assertIn("quote_status", migration)
        self.assertIn("invoice_status", migration)

    def test_billing_status_payment_numbering_migration_contains_expected_changes(self) -> None:
        migration = (
            ROOT / "apps" / "api" / "migrations" / "0011_sprint3_billing_status_payment_numbering.sql"
        ).read_text()
        self.assertIn("alter type quote_status add value if not exists 'accepted'", migration)
        self.assertIn("alter type invoice_status add value if not exists 'paid'", migration)
        self.assertIn("add column if not exists sequence_number integer", migration)
        self.assertIn("add column if not exists number varchar(32)", migration)
        self.assertIn("add column if not exists paid_amount_cents integer not null default 0", migration)

    def test_billing_pdf_worksite_link_migration_contains_expected_changes(self) -> None:
        migration = (
            ROOT / "apps" / "api" / "migrations" / "0012_sprint3_billing_pdf_worksite_link.sql"
        ).read_text()
        self.assertIn("alter table quotes add column if not exists worksite_id uuid", migration)
        self.assertIn("alter table invoices add column if not exists worksite_id uuid", migration)
        self.assertIn("ix_quotes_org_worksite_id", migration)
        self.assertIn("ix_invoices_org_worksite_id", migration)

    def test_billing_follow_up_migration_contains_expected_changes(self) -> None:
        migration = (
            ROOT / "apps" / "api" / "migrations" / "0013_sprint3_billing_follow_up_status.sql"
        ).read_text()
        self.assertIn("alter table quotes", migration)
        self.assertIn("add column if not exists follow_up_status varchar(32) not null default 'normal'", migration)
        self.assertIn("alter table invoices", migration)

    def test_front_packages_expose_real_scripts(self) -> None:
        web_package = json.loads((ROOT / "apps" / "web" / "package.json").read_text())
        mobile_package = json.loads((ROOT / "apps" / "mobile" / "package.json").read_text())
        self.assertIn("dev", web_package["scripts"])
        self.assertIn("build", web_package["scripts"])
        self.assertIn("predev", web_package["scripts"])
        self.assertIn("prebuild", web_package["scripts"])
        self.assertIn("@conformeo/ui", web_package["dependencies"])
        self.assertIn("dev", mobile_package["scripts"])
        self.assertIn("predev", mobile_package["scripts"])
        self.assertIn("precap:sync", mobile_package["scripts"])
        self.assertIn("cap:sync", mobile_package["scripts"])
        self.assertIn("@conformeo/ui", mobile_package["dependencies"])
        self.assertIn("@capacitor-community/sqlite", mobile_package["dependencies"])
        self.assertIn("sql.js", mobile_package["dependencies"])
        self.assertIn("jeep-sqlite", mobile_package["dependencies"])

    def test_ui_package_exports_expected_primitives(self) -> None:
        ui_package = json.loads((ROOT / "packages" / "ui" / "package.json").read_text())
        ui_index = (ROOT / "packages" / "ui" / "src" / "index.ts").read_text()

        self.assertEqual(ui_package["name"], "@conformeo/ui")
        self.assertIn("typecheck", ui_package["scripts"])
        self.assertIn("button.component", ui_index)
        self.assertIn("input.component", ui_index)
        self.assertIn("card.component", ui_index)
        self.assertIn("status-chip.component", ui_index)
        self.assertIn("empty-state.component", ui_index)
        self.assertIn("sync-state.component", ui_index)

    def test_mobile_angular_assets_include_sql_wasm(self) -> None:
        angular_json = json.loads((ROOT / "apps" / "mobile" / "angular.json").read_text())
        assets = angular_json["projects"]["mobile"]["architect"]["build"]["options"]["assets"]
        self.assertTrue(
            any(
                isinstance(asset, dict)
                and asset.get("glob") == "sql-wasm.wasm"
                and asset.get("input") == "node_modules/sql.js/dist"
                for asset in assets
            )
        )

    def test_mobile_local_database_declares_sync_queue(self) -> None:
        migrations = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.migrations.ts").read_text()
        self.assertIn("LOCAL_DATABASE_SCHEMA_VERSION = 3", migrations)
        self.assertIn("CREATE TABLE IF NOT EXISTS local_sync_queue", migrations)
        self.assertIn("'upload_media'", migrations)
        self.assertIn("'status_change'", migrations)

    def test_mobile_local_database_declares_photo_metadata(self) -> None:
        migrations = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.migrations.ts").read_text()
        self.assertIn("ADD COLUMN file_name", migrations)
        self.assertIn("ADD COLUMN document_type", migrations)
        self.assertIn("ADD COLUMN source", migrations)
        self.assertIn("ADD COLUMN captured_at", migrations)

    def test_mobile_sync_status_uses_simple_wording(self) -> None:
        sync_status = (ROOT / "apps" / "mobile" / "src" / "app" / "sync-status.ts").read_text()
        self.assertIn("enregistré sur l’appareil", sync_status)
        self.assertIn("en attente de synchronisation", sync_status)
        self.assertIn("synchronisé", sync_status)
        self.assertIn("à vérifier", sync_status)

    def test_quick_capture_pattern_covers_expected_actions(self) -> None:
        pattern_doc = (ROOT / "docs" / "architecture" / "quick-capture-pattern-sprint0.md").read_text()
        pattern_source = (ROOT / "apps" / "mobile" / "src" / "app" / "quick-capture-pattern.ts").read_text()

        self.assertIn("2` ou `3` étapes maximum", pattern_doc)
        self.assertIn("photo", pattern_doc)
        self.assertIn("note", pattern_doc)
        self.assertIn("checklist", pattern_doc)
        self.assertIn("signature", pattern_doc)
        self.assertIn("signalement", pattern_doc)
        self.assertIn('"photo"', pattern_source)
        self.assertIn('"note"', pattern_source)
        self.assertIn('"checklist"', pattern_source)
        self.assertIn('"signature"', pattern_source)
        self.assertIn('"signalement"', pattern_source)

    def test_environment_examples_and_ignore_rules_exist(self) -> None:
        api_env = (ROOT / "apps" / "api" / ".env.example").read_text()
        web_env = (ROOT / "apps" / "web" / ".env.example").read_text()
        mobile_env = (ROOT / "apps" / "mobile" / ".env.example").read_text()
        gitignore = (ROOT / ".gitignore").read_text()

        self.assertIn("CONFORMEO_APP_ENV", api_env)
        self.assertIn("CONFORMEO_AUTH_TOKEN_SECRET", api_env)
        self.assertIn("CONFORMEO_API_BASE_URL", web_env)
        self.assertIn("CONFORMEO_API_BASE_URL", mobile_env)
        self.assertIn("**/.env", gitignore)
        self.assertIn("!**/.env.example", gitignore)

    def test_ci_workflow_runs_core_checks(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "ci.yml").read_text()
        self.assertIn("pnpm install --frozen-lockfile", workflow)
        self.assertIn("python -m pip install -e 'apps/api[dev]'", workflow)
        self.assertIn("run: pnpm run ci", workflow)

    def test_worksite_mobile_block_is_present(self) -> None:
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()
        worksite_doc = (ROOT / "docs" / "architecture" / "worksite-mobile-first-sprint1.md").read_text()
        worksite_import_doc = (ROOT / "docs" / "architecture" / "worksite-read-import-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        worksite_client = (ROOT / "apps" / "mobile" / "src" / "app" / "worksite-client.ts").read_text()

        self.assertIn("WorksiteApiSummary", worksite_contract)
        self.assertIn("WorksiteSummary", worksite_contract)
        self.assertIn("WorksiteEssentialDetail", worksite_contract)
        self.assertIn("Préparer hors ligne", worksite_doc)
        self.assertIn("lecture API légère", worksite_import_doc)
        self.assertIn("worksite_summary", local_db)
        self.assertIn("prepareWorksiteForOffline", local_db)
        self.assertIn("importWorksiteSummaries", local_db)
        self.assertIn("/worksites", worksite_client)
        self.assertIn("Mes chantiers", mobile_app)
        self.assertIn("Préparer hors ligne", mobile_app)
        self.assertIn("Actualiser depuis l’API", mobile_app)
        self.assertFalse((ROOT / "apps" / "mobile" / "src" / "app" / "worksite-local-catalog.ts").exists())

    def test_worksite_equipment_list_block_is_present(self) -> None:
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()
        equipment_doc = (ROOT / "docs" / "architecture" / "worksite-equipment-list-sprint1.md").read_text()
        equipment_catalog = (ROOT / "apps" / "mobile" / "src" / "app" / "worksite-equipment-catalog.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()

        self.assertIn("WorksiteEquipment", worksite_contract)
        self.assertIn("WorksiteEquipmentStatus", worksite_contract)
        self.assertIn("equipments", worksite_contract)
        self.assertIn("nom", equipment_doc)
        self.assertIn("type", equipment_doc)
        self.assertIn("statut simple", equipment_doc)
        self.assertIn("getDefaultWorksiteEquipments", equipment_catalog)
        self.assertIn("worksite_detail", local_db)
        self.assertIn("equipments", local_db)
        self.assertIn("Équipements utiles", mobile_app)
        self.assertIn("getWorksiteEquipmentStatusLabel", mobile_app)

    def test_worksite_equipment_movement_block_is_present(self) -> None:
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()
        movement_doc = (ROOT / "docs" / "architecture" / "worksite-equipment-movement-sprint1.md").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        sync_doc = (ROOT / "docs" / "architecture" / "worksite-sync-preparation-sprint1.md").read_text()

        self.assertIn("WorksiteEquipmentMovement", worksite_contract)
        self.assertIn("WorksiteEquipmentMovementType", worksite_contract)
        self.assertIn("recent_equipment_movements", worksite_contract)
        self.assertIn("affecte au chantier", movement_doc)
        self.assertIn("retire du chantier", movement_doc)
        self.assertIn("signale comme endommage", movement_doc)
        self.assertIn("CreateWorksiteEquipmentMovementInput", local_types)
        self.assertIn("worksite_equipment_movement", local_types)
        self.assertIn("createWorksiteEquipmentMovement", local_db)
        self.assertIn("listWorksiteEquipmentMovements", local_db)
        self.assertIn("applyEquipmentMovementsToEquipments", local_db)
        self.assertIn("Derniers mouvements d’équipement", mobile_app)
        self.assertIn("recordWorksiteEquipmentMovement", mobile_app)
        self.assertIn("worksite_equipment_movement", sync_doc)

    def test_worksite_photo_proof_block_is_present(self) -> None:
        photo_doc = (ROOT / "docs" / "architecture" / "worksite-photo-proof-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()

        self.assertIn("upload_media", photo_doc)
        self.assertIn("comment_text", photo_doc)
        self.assertIn("update", photo_doc)
        self.assertIn("Prendre une photo preuve", mobile_app)
        self.assertIn("handleWorksiteProofCapture", mobile_app)
        self.assertIn("saveWorksiteProofComment", mobile_app)
        self.assertIn("Ajouter un commentaire court", mobile_app)
        self.assertIn("captureWorksiteProof", local_db)
        self.assertIn("updateWorksiteProofComment", local_db)
        self.assertIn("worksite_proof", local_db)
        self.assertIn("CaptureWorksiteProofInput", local_types)
        self.assertIn("UpdateWorksiteProofCommentInput", local_types)
        self.assertIn("thumbnail_local_uri", worksite_contract)
        self.assertIn("comment_text", worksite_contract)

    def test_worksite_voice_note_block_is_present(self) -> None:
        voice_doc = (ROOT / "docs" / "architecture" / "worksite-voice-note-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()

        self.assertIn("upload_media", voice_doc)
        self.assertIn("voice_note", voice_doc)
        self.assertIn("Enregistrer une note vocale", mobile_app)
        self.assertIn("handleWorksiteVoiceNoteCapture", mobile_app)
        self.assertIn("getVoiceNoteSyncStatus", mobile_app)
        self.assertIn("captureWorksiteVoiceNote", local_db)
        self.assertIn("worksite_voice_note", local_db)
        self.assertIn("CaptureWorksiteVoiceNoteInput", local_types)
        self.assertIn("WorksiteVoiceNoteSummary", worksite_contract)
        self.assertIn("recent_voice_notes", worksite_contract)

    def test_worksite_safety_checklist_block_is_present(self) -> None:
        checklist_doc = (ROOT / "docs" / "architecture" / "worksite-safety-checklist-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()

        self.assertIn("brouillon", checklist_doc)
        self.assertIn("validé", checklist_doc)
        self.assertIn("oui", checklist_doc)
        self.assertIn("non", checklist_doc)
        self.assertIn("N/A", checklist_doc)
        self.assertIn("Checklist sécurité", mobile_app)
        self.assertIn("Enregistrer le brouillon", mobile_app)
        self.assertIn("Valider la checklist", mobile_app)
        self.assertIn("saveSafetyChecklist", mobile_app)
        self.assertIn("setSafetyChecklistAnswer", mobile_app)
        self.assertIn("worksite_safety_checklist", local_db)
        self.assertIn("saveWorksiteSafetyChecklist", local_db)
        self.assertIn("SaveWorksiteSafetyChecklistInput", local_types)
        self.assertIn("WorksiteSafetyChecklist", worksite_contract)
        self.assertIn("safety_checklist", worksite_contract)

    def test_worksite_risk_report_block_is_present(self) -> None:
        risk_doc = (ROOT / "docs" / "architecture" / "worksite-risk-report-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()

        self.assertIn("Signalement de risque", risk_doc)
        self.assertIn("photo optionnelle", risk_doc)
        self.assertIn("worksite_risk_report", risk_doc)
        self.assertIn("Signalement de risque", mobile_app)
        self.assertIn("Enregistrer le signalement", mobile_app)
        self.assertIn("handleWorksiteRiskPhotoSelection", mobile_app)
        self.assertIn("saveWorksiteRiskReport", mobile_app)
        self.assertIn("createWorksiteRiskReport", local_db)
        self.assertIn("worksite_risk_report", local_db)
        self.assertIn("CreateWorksiteRiskReportInput", local_types)
        self.assertIn("WorksiteRiskReport", worksite_contract)
        self.assertIn("risk_reports", worksite_contract)

    def test_worksite_signature_block_is_present(self) -> None:
        signature_doc = (ROOT / "docs" / "architecture" / "worksite-signature-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()
        worksite_contract = (ROOT / "packages" / "contracts" / "src" / "worksite.ts").read_text()

        self.assertIn("Signature simple", signature_doc)
        self.assertIn("canvas local", signature_doc)
        self.assertIn("worksite_signature", signature_doc)
        self.assertIn("Signature simple", mobile_app)
        self.assertIn("Enregistrer la signature", mobile_app)
        self.assertIn("startWorksiteSignatureStroke", mobile_app)
        self.assertIn("saveWorksiteSignature", mobile_app)
        self.assertIn("captureWorksiteSignature", local_db)
        self.assertIn("worksite_signature", local_db)
        self.assertIn("CaptureWorksiteSignatureInput", local_types)
        self.assertIn("WorksiteSignatureSummary", worksite_contract)
        self.assertIn("recent_signatures", worksite_contract)

    def test_worksite_sync_preparation_block_is_present(self) -> None:
        sync_doc = (ROOT / "docs" / "architecture" / "worksite-sync-preparation-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        local_db = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.ts").read_text()
        local_types = (ROOT / "apps" / "mobile" / "src" / "app" / "local-database.types.ts").read_text()

        self.assertIn("lots terrain dedoublonnes", sync_doc)
        self.assertIn("upload_media", sync_doc)
        self.assertIn("Synchronisation terrain préparée", mobile_app)
        self.assertIn("buildPreparedWorksiteSyncBatch", local_db)
        self.assertIn("findReusableWorksiteSyncOperation", local_db)
        self.assertIn("PreparedWorksiteSyncBatch", local_types)
        self.assertIn("WorksiteSyncableEntityName", local_types)

    def test_worksite_sync_readability_block_is_present(self) -> None:
        sync_doc = (ROOT / "docs" / "architecture" / "worksite-sync-readability-sprint1.md").read_text()
        mobile_app = (ROOT / "apps" / "mobile" / "src" / "app" / "app.component.ts").read_text()
        sync_status = (ROOT / "apps" / "mobile" / "src" / "app" / "sync-status.ts").read_text()
        mobile_readme = (ROOT / "apps" / "mobile" / "README.md").read_text()

        self.assertIn("chantier", sync_doc)
        self.assertIn("objet terrain", sync_doc)
        self.assertIn("lot terrain", sync_doc)
        self.assertIn("Synchronisation de ce chantier", mobile_app)
        self.assertIn("getWorksiteSyncStatus", mobile_app)
        self.assertIn("getPreparedWorksiteSyncBatchStatus", mobile_app)
        self.assertIn("getTerrainObjectSyncStatusCopy", sync_status)
        self.assertIn("getWorksiteSyncStatusCopy", sync_status)
        self.assertIn("getPreparedWorksiteSyncBatchStatusCopy", sync_status)
        self.assertIn("état de synchronisation lisible et harmonisé", mobile_readme)

    def test_regulation_foundation_block_is_present(self) -> None:
        regulation_doc = (ROOT / "docs" / "architecture" / "regulation-foundation-sprint2.md").read_text()
        organization_contract = (ROOT / "packages" / "contracts" / "src" / "organization.ts").read_text()
        organization_site_contract = (ROOT / "packages" / "contracts" / "src" / "organization-site.ts").read_text()
        api_routes = (ROOT / "apps" / "api" / "app" / "api" / "routes" / "organizations.py").read_text()
        web_app = (ROOT / "apps" / "web" / "src" / "app" / "app.component.ts").read_text()

        self.assertIn("Onboarding entreprise", regulation_doc)
        self.assertIn("Sites / bâtiments", regulation_doc)
        self.assertIn("activity_label", organization_contract)
        self.assertIn("onboarding_completed_at", organization_contract)
        self.assertIn("OrganizationSiteRecord", organization_site_contract)
        self.assertIn("/{organization_id}/profile", api_routes)
        self.assertIn("/{organization_id}/sites", api_routes)
        self.assertIn("Onboarding entreprise", web_app)
        self.assertIn("Profil entreprise", web_app)
        self.assertIn("Sites et bâtiments", web_app)

    def test_regulation_obligations_v1_block_is_present(self) -> None:
        obligations_doc = (ROOT / "docs" / "architecture" / "regulation-obligations-v1-sprint2.md").read_text()
        regulation_core = (ROOT / "apps" / "api" / "app" / "core" / "regulation.py").read_text()
        regulation_schema = (ROOT / "apps" / "api" / "app" / "schemas" / "regulation.py").read_text()
        regulation_contract = (ROOT / "packages" / "contracts" / "src" / "regulation-obligation.ts").read_text()
        web_app = (ROOT / "apps" / "web" / "src" / "app" / "app.component.ts").read_text()
        organization_client = (ROOT / "apps" / "web" / "src" / "app" / "organization-client.ts").read_text()

        self.assertIn("Catalogue obligations V1", obligations_doc)
        self.assertIn("moteur simple", obligations_doc)
        self.assertIn("liste des obligations", obligations_doc)
        self.assertIn("OBLIGATION_CATALOG", regulation_core)
        self.assertIn("build_regulatory_profile_snapshot", regulation_core)
        self.assertIn("OrganizationRegulatoryProfileRead", regulation_schema)
        self.assertIn("OrganizationRegulatoryProfileRecord", regulation_contract)
        self.assertIn("ApplicableRegulatoryObligationRecord", regulation_contract)
        self.assertIn("/regulatory-profile", organization_client)
        self.assertIn("Obligations à préparer", web_app)
        self.assertIn("première lecture utile du périmètre réglementaire", web_app)

    def test_regulation_obligation_detail_block_is_present(self) -> None:
        obligation_detail_doc = (
            ROOT / "docs" / "architecture" / "regulation-obligation-detail-sprint2.md"
        ).read_text()
        web_app = (ROOT / "apps" / "web" / "src" / "app" / "app.component.ts").read_text()

        self.assertIn("Fiche obligation simple Sprint 2", obligation_detail_doc)
        self.assertIn("pourquoi l'obligation s'applique", obligation_detail_doc)
        self.assertIn("premiere action concrete", obligation_detail_doc)
        self.assertIn("Ouvrir la fiche", web_app)
        self.assertIn("Pourquoi elle s'applique", web_app)
        self.assertIn("Première action conseillée", web_app)
        self.assertIn("Pièces déjà rattachées", web_app)

    def test_regulation_building_safety_block_is_present(self) -> None:
        safety_doc = (ROOT / "docs" / "architecture" / "regulation-building-safety-v1-sprint2.md").read_text()
        safety_core = (ROOT / "apps" / "api" / "app" / "core" / "building_safety.py").read_text()
        safety_schema = (ROOT / "apps" / "api" / "app" / "schemas" / "building_safety.py").read_text()
        safety_contract = (ROOT / "packages" / "contracts" / "src" / "building-safety.ts").read_text()
        organization_client = (ROOT / "apps" / "web" / "src" / "app" / "organization-client.ts").read_text()
        web_app = (ROOT / "apps" / "web" / "src" / "app" / "app.component.ts").read_text()

        self.assertIn("Sécurité bâtiment V1", safety_doc)
        self.assertIn("échéance proche", safety_doc)
        self.assertIn("vue par site", safety_doc)
        self.assertIn("resolve_building_safety_alert_status", safety_core)
        self.assertIn("build_building_safety_alerts", safety_core)
        self.assertIn("BuildingSafetyItemRead", safety_schema)
        self.assertIn("BuildingSafetyAlertRead", safety_schema)
        self.assertIn("BuildingSafetyItemRecord", safety_contract)
        self.assertIn("BuildingSafetyAlertRecord", safety_contract)
        self.assertIn("/building-safety-items", organization_client)
        self.assertIn("/building-safety-alerts", organization_client)
        self.assertIn("Sécurité bâtiment", web_app)
        self.assertIn("Vue par site", web_app)
        self.assertIn("Échéance proche", web_app)
        self.assertIn("Enregistrer les changements", web_app)
        self.assertIn("Modifier", web_app)


if __name__ == "__main__":
    unittest.main()
