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
            ROOT / "apps" / "api" / "app" / "db" / "models" / "user.py",
            ROOT / "apps" / "api" / "migrations" / "0001_sprint0_core.sql",
            ROOT / "packages" / "contracts" / "src" / "sync.ts",
            ROOT / "docs" / "architecture" / "monorepo.md",
            ROOT / "docs" / "architecture" / "sync-model-sprint0.md",
        ]

        for path in expected_paths:
            with self.subTest(path=path):
                self.assertTrue(path.exists())

    def test_root_package_declares_workspace(self) -> None:
        package_json = json.loads((ROOT / "package.json").read_text())
        self.assertIn("workspaces", package_json)
        self.assertIn("packages/*", package_json["workspaces"])

    def test_api_pyproject_declares_fastapi(self) -> None:
        pyproject = tomllib.loads((ROOT / "apps" / "api" / "pyproject.toml").read_text())
        dependencies = pyproject["project"]["dependencies"]
        self.assertTrue(any(dep.startswith("fastapi") for dep in dependencies))

    def test_migration_contains_core_tables(self) -> None:
        migration = (ROOT / "apps" / "api" / "migrations" / "0001_sprint0_core.sql").read_text()
        self.assertIn("create table if not exists organizations", migration)
        self.assertIn("create table if not exists users", migration)


if __name__ == "__main__":
    unittest.main()
