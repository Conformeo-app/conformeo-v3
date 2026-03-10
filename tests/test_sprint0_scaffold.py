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
            ROOT / "apps" / "api" / "app" / "bootstrap_admin.py",
            ROOT / "apps" / "api" / "migrations" / "0001_sprint0_core.sql",
            ROOT / "apps" / "api" / "migrations" / "0002_sprint0_multi_org.sql",
            ROOT / "apps" / "api" / "migrations" / "0003_sprint0_auth_rbac_modules.sql",
            ROOT / "apps" / "api" / "migrations" / "0004_sprint0_audit_log.sql",
            ROOT / "apps" / "api" / "migrations" / "0005_sprint0_documents.sql",
            ROOT / "apps" / "api" / "app" / "api" / "routes" / "auth.py",
            ROOT / "apps" / "api" / "app" / "api" / "routes" / "organizations.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "document.py",
            ROOT / "apps" / "api" / "app" / "db" / "models" / "organization_module.py",
            ROOT / "apps" / "api" / "app" / "core" / "audit.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "audit_log.py",
            ROOT / "apps" / "api" / "app" / "schemas" / "document.py",
            ROOT / "apps" / "api" / ".env.example",
            ROOT / "apps" / "web" / "angular.json",
            ROOT / "apps" / "web" / ".env.example",
            ROOT / "apps" / "web" / "src" / "main.ts",
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
            ROOT / "apps" / "mobile" / "src" / "environments" / "generated-env.ts",
            ROOT / "packages" / "contracts" / "src" / "auth.ts",
            ROOT / "packages" / "contracts" / "src" / "audit-log.ts",
            ROOT / "packages" / "contracts" / "src" / "document.ts",
            ROOT / "packages" / "contracts" / "src" / "organization-membership.ts",
            ROOT / "packages" / "contracts" / "src" / "organization-module.ts",
            ROOT / "packages" / "contracts" / "src" / "rbac.ts",
            ROOT / "packages" / "contracts" / "src" / "sync.ts",
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


if __name__ == "__main__":
    unittest.main()
