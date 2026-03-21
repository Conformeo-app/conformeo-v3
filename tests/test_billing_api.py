from __future__ import annotations

import os
import sys
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool


ROOT = Path(__file__).resolve().parent.parent
API_ROOT = ROOT / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))
os.environ.setdefault("CONFORMEO_AUTH_TOKEN_SECRET", "test-only-secret-change-me-123456")

from app.api.dependencies import get_db_session
from app.core.security import hash_password
from app.db.models import (
    Base,
    Document,
    DocumentStatus,
    Organization,
    OrganizationMembership,
    OrganizationModule,
    OrganizationModuleCode,
    OrganizationStatus,
    User,
    UserStatus,
)
from app.main import create_app


class BillingApiTest(unittest.TestCase):
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
        self.seed_data()
        self.app = create_app()

        def override_db():
            db = self.SessionLocal()
            try:
                yield db
            finally:
                db.close()

        self.app.dependency_overrides[get_db_session] = override_db
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.client.close()
        self.app.dependency_overrides.clear()

    def seed_data(self) -> None:
        session = self.SessionLocal()
        try:
            organization = Organization(
                id=UUID("00000000-0000-0000-0000-000000000501"),
                name="Conformeo Facturation",
                slug="conformeo-facturation",
                status=OrganizationStatus.ACTIVE,
                default_locale="fr-FR",
                default_timezone="Europe/Paris",
            )
            owner = User(
                id=UUID("00000000-0000-0000-0000-000000000502"),
                email="owner.facturation@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Alice",
                last_name="Owner",
                display_name="Alice Owner",
                status=UserStatus.ACTIVE,
            )
            member = User(
                id=UUID("00000000-0000-0000-0000-000000000503"),
                email="member.facturation@conformeo.local",
                password_hash=hash_password("Secret123!"),
                first_name="Marc",
                last_name="Member",
                display_name="Marc Member",
                status=UserStatus.ACTIVE,
            )

            session.add_all([organization, owner, member])
            session.flush()
            session.add_all(
                [
                    OrganizationMembership(
                        user_id=owner.id,
                        organization_id=organization.id,
                        role_code="owner",
                        is_default=True,
                    ),
                    OrganizationMembership(
                        user_id=member.id,
                        organization_id=organization.id,
                        role_code="member",
                        is_default=True,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.REGLEMENTATION,
                        is_enabled=False,
                    ),
                    OrganizationModule(
                        organization_id=organization.id,
                        module_code=OrganizationModuleCode.CHANTIER,
                        is_enabled=False,
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

    def login(self, email: str) -> str:
        response = self.client.post(
            "/auth/login",
            json={"email": email, "password": "Secret123!"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()["access_token"]

    def create_customer(self, token: str) -> dict[str, object]:
        response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Atelier Durand",
                "customer_type": "company",
                "email": "contact@atelier-durand.fr",
                "phone": "0600000000",
                "address": "12 rue du Port, 69002 Lyon",
                "notes": "Client prioritaire",
            },
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def get_first_worksite_id(self, token: str) -> str:
        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()
        self.assertGreater(len(payload), 0)
        return payload[0]["id"]

    def enable_chantier_module(self, token: str) -> None:
        response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertTrue(response.json()["is_enabled"])

    def list_audit_logs(
        self,
        token: str,
        limit: int = 50,
        *,
        target_id: str | None = None,
        target_types: list[str] | None = None,
    ) -> list[dict[str, object]]:
        query_parts = [f"limit={limit}"]
        if target_id:
            query_parts.append(f"target_id={target_id}")
        for target_type in target_types or []:
            query_parts.append(f"target_type={target_type}")
        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/audit-logs?" + "&".join(query_parts),
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_owner_can_create_and_update_customer(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)

        self.assertEqual(customer["name"], "Atelier Durand")
        self.assertEqual(customer["customer_type"], "company")

        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/customers/{customer['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "phone": "0611223344",
                "notes": "Client prioritaire Lyon Presqu'ile",
            },
        )

        self.assertEqual(update_response.status_code, 200, update_response.text)
        updated_customer = update_response.json()
        self.assertEqual(updated_customer["phone"], "0611223344")
        self.assertEqual(updated_customer["notes"], "Client prioritaire Lyon Presqu'ile")

        list_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_response.status_code, 200, list_response.text)
        self.assertEqual(len(list_response.json()), 1)

    def test_owner_can_create_quote_and_invoice_with_computed_totals(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Remise en état armoire électrique",
                "issue_date": date(2026, 3, 13).isoformat(),
                "valid_until": date(2026, 3, 28).isoformat(),
                "status": "sent",
                "line_items": [
                    {
                        "description": "Main d'oeuvre",
                        "quantity": 2,
                        "unit_price_cents": 15000,
                    },
                    {
                        "description": "Fournitures",
                        "quantity": 1,
                        "unit_price_cents": 4500,
                    },
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_payload = quote_response.json()
        self.assertEqual(quote_payload["status"], "sent")
        self.assertEqual(quote_payload["number"], "DEV-0001")
        self.assertEqual(quote_payload["sequence_number"], 1)
        self.assertEqual(quote_payload["subtotal_amount_cents"], 34500)
        self.assertEqual(quote_payload["total_amount_cents"], 34500)
        self.assertEqual(quote_payload["line_items"][0]["line_total_cents"], 30000)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Intervention de maintenance",
                "issue_date": date(2026, 3, 13).isoformat(),
                "due_date": date(2026, 4, 12).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Dépannage sur site",
                        "quantity": 1.5,
                        "unit_price_cents": 12000,
                    }
                ],
                "notes": "Facture simple Sprint 3",
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_payload = invoice_response.json()
        self.assertEqual(invoice_payload["status"], "issued")
        self.assertEqual(invoice_payload["number"], "FAC-0001")
        self.assertEqual(invoice_payload["sequence_number"], 1)
        self.assertEqual(invoice_payload["subtotal_amount_cents"], 18000)
        self.assertEqual(invoice_payload["total_amount_cents"], 18000)
        self.assertEqual(invoice_payload["paid_amount_cents"], 0)
        self.assertEqual(invoice_payload["outstanding_amount_cents"], 18000)
        self.assertEqual(invoice_payload["line_items"][0]["line_total_cents"], 18000)

        list_quotes_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_quotes_response.status_code, 200, list_quotes_response.text)
        self.assertEqual(len(list_quotes_response.json()), 1)

        list_invoices_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(list_invoices_response.status_code, 200, list_invoices_response.text)
        self.assertEqual(len(list_invoices_response.json()), 1)

    def test_owner_can_read_cockpit_summary(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Devis cockpit",
                "issue_date": date(2020, 1, 10).isoformat(),
                "valid_until": date(2020, 1, 31).isoformat(),
                "status": "sent",
                "line_items": [
                    {
                        "description": "Main d'oeuvre",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Facture cockpit",
                "issue_date": date(2020, 1, 10).isoformat(),
                "due_date": date(2020, 1, 20).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Intervention",
                        "quantity": 1,
                        "unit_price_cents": 18000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)

        response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/cockpit-summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(response.status_code, 200, response.text)
        payload = response.json()

        self.assertEqual([card["label"] for card in payload["module_cards"]], ["Facturation"])
        self.assertTrue(any(kpi["id"] == "quotes-in-progress" and kpi["value"] == "1" for kpi in payload["kpis"]))
        self.assertTrue(any(kpi["id"] == "invoices-pending" and kpi["status_label"] == "En retard" for kpi in payload["kpis"]))
        self.assertTrue(any(alert["id"] == "billing-overdue-invoices" for alert in payload["alerts"]))

    def test_owner_can_update_quote_status_and_record_invoice_payment(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "worksite_id": worksite_id,
                "title": "Pose d'un contrôle d'accès",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "sent",
                "line_items": [
                    {
                        "description": "Fourniture et pose",
                        "quantity": 1,
                        "unit_price_cents": 85000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_payload = quote_response.json()

        quote_status_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_payload['id']}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "accepted"},
        )
        self.assertEqual(quote_status_response.status_code, 200, quote_status_response.text)
        self.assertEqual(quote_status_response.json()["status"], "accepted")
        self.assertEqual(quote_status_response.json()["worksite_id"], worksite_id)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "worksite_id": worksite_id,
                "title": "Intervention courant fort",
                "issue_date": date(2026, 3, 13).isoformat(),
                "due_date": date(2026, 3, 20).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Intervention",
                        "quantity": 1,
                        "unit_price_cents": 45000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_payload = invoice_response.json()

        payment_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_payload['id']}/payment",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "paid_amount_cents": 45000,
                "paid_at": date(2026, 3, 18).isoformat(),
            },
        )
        self.assertEqual(payment_response.status_code, 200, payment_response.text)
        payment_payload = payment_response.json()
        self.assertEqual(payment_payload["status"], "paid")
        self.assertEqual(payment_payload["paid_amount_cents"], 45000)
        self.assertEqual(payment_payload["outstanding_amount_cents"], 0)
        self.assertEqual(payment_payload["paid_at"], date(2026, 3, 18).isoformat())
        self.assertEqual(payment_payload["worksite_id"], worksite_id)

    def test_owner_can_duplicate_quote_to_invoice(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "worksite_id": worksite_id,
                "title": "Remise en état éclairage de sécurité",
                "issue_date": date(2026, 3, 13).isoformat(),
                "valid_until": date(2026, 3, 28).isoformat(),
                "status": "accepted",
                "line_items": [
                    {
                        "description": "Fourniture",
                        "quantity": 1,
                        "unit_price_cents": 18000,
                    },
                    {
                        "description": "Pose sur site",
                        "quantity": 2,
                        "unit_price_cents": 9500,
                    },
                ],
                "notes": "À facturer après validation du client",
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_payload = quote_response.json()

        duplicate_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_payload['id']}/duplicate-to-invoice",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(duplicate_response.status_code, 200, duplicate_response.text)
        invoice_payload = duplicate_response.json()

        self.assertEqual(invoice_payload["customer_id"], customer["id"])
        self.assertEqual(invoice_payload["worksite_id"], worksite_id)
        self.assertEqual(invoice_payload["title"], quote_payload["title"])
        self.assertEqual(invoice_payload["notes"], quote_payload["notes"])
        self.assertEqual(invoice_payload["status"], "draft")
        self.assertIsNone(invoice_payload["due_date"])
        self.assertEqual(invoice_payload["line_items"], quote_payload["line_items"])
        self.assertEqual(invoice_payload["total_amount_cents"], quote_payload["total_amount_cents"])
        self.assertEqual(invoice_payload["number"], "FAC-0001")
        self.assertEqual(invoice_payload["sequence_number"], 1)
        self.assertEqual(invoice_payload["paid_amount_cents"], 0)
        self.assertEqual(invoice_payload["outstanding_amount_cents"], quote_payload["total_amount_cents"])

        audit_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=invoice_payload["id"],
            target_types=["invoice"],
        )
        create_log = next(log for log in audit_logs if log["action_type"] == "create")
        self.assertEqual(create_log["changes"]["source_quote_id"], quote_payload["id"])
        self.assertEqual(create_log["changes"]["source_quote_number"], quote_payload["number"])

    def test_owner_can_update_quote_and_invoice_follow_up_status(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Maintenance simple",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Intervention",
                        "quantity": 1,
                        "unit_price_cents": 22000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_payload = quote_response.json()
        self.assertEqual(quote_payload["follow_up_status"], "normal")

        quote_follow_up_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_payload['id']}/follow-up",
            headers={"Authorization": f"Bearer {token}"},
            json={"follow_up_status": "to_follow_up"},
        )
        self.assertEqual(quote_follow_up_response.status_code, 200, quote_follow_up_response.text)
        self.assertEqual(quote_follow_up_response.json()["follow_up_status"], "to_follow_up")

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Facture maintenance simple",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Intervention",
                        "quantity": 1,
                        "unit_price_cents": 22000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_payload = invoice_response.json()
        self.assertEqual(invoice_payload["follow_up_status"], "normal")

        invoice_follow_up_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_payload['id']}/follow-up",
            headers={"Authorization": f"Bearer {token}"},
            json={"follow_up_status": "waiting_customer"},
        )
        self.assertEqual(invoice_follow_up_response.status_code, 200, invoice_follow_up_response.text)
        self.assertEqual(invoice_follow_up_response.json()["follow_up_status"], "waiting_customer")

        quote_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=quote_payload["id"],
            target_types=["quote"],
        )
        quote_update_log = next(
            log
            for log in quote_logs
            if log["action_type"] == "update" and "follow_up_status" in log["changes"]
        )
        self.assertEqual(quote_update_log["changes"]["follow_up_status"]["to"], "to_follow_up")

        invoice_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=invoice_payload["id"],
            target_types=["invoice"],
        )
        invoice_update_log = next(
            log
            for log in invoice_logs
            if log["action_type"] == "update" and "follow_up_status" in log["changes"]
        )
        self.assertEqual(invoice_update_log["changes"]["follow_up_status"]["to"], "waiting_customer")

    def test_owner_can_lightly_update_quote_and_invoice(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        second_customer_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Atelier Martin",
                "customer_type": "company",
                "email": "contact@atelier-martin.fr",
            },
        )
        self.assertEqual(second_customer_response.status_code, 200, second_customer_response.text)
        second_customer = second_customer_response.json()
        worksite_id = self.get_first_worksite_id(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Remplacement de tableau",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Dépose",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_id = quote_response.json()["id"]

        quote_update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": second_customer["id"],
                "worksite_id": worksite_id,
                "title": "Remplacement complet de tableau",
                "issue_date": date(2026, 3, 14).isoformat(),
                "valid_until": date(2026, 3, 29).isoformat(),
                "line_items": [
                    {
                        "description": "Dépose",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    },
                    {
                        "description": "Pose et raccordement",
                        "quantity": 2,
                        "unit_price_cents": 18500,
                    },
                ],
                "notes": "Prévoir coupure courte avec le client",
            },
        )
        self.assertEqual(quote_update_response.status_code, 200, quote_update_response.text)
        quote_payload = quote_update_response.json()
        self.assertEqual(quote_payload["customer_id"], second_customer["id"])
        self.assertEqual(quote_payload["worksite_id"], worksite_id)
        self.assertEqual(quote_payload["title"], "Remplacement complet de tableau")
        self.assertEqual(quote_payload["issue_date"], date(2026, 3, 14).isoformat())
        self.assertEqual(quote_payload["valid_until"], date(2026, 3, 29).isoformat())
        self.assertEqual(quote_payload["total_amount_cents"], 49000)
        self.assertEqual(len(quote_payload["line_items"]), 2)
        self.assertEqual(quote_payload["notes"], "Prévoir coupure courte avec le client")

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Facture tableau",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Dépose",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_id = invoice_response.json()["id"]

        invoice_update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": second_customer["id"],
                "worksite_id": worksite_id,
                "title": "Facture complète tableau",
                "issue_date": date(2026, 3, 14).isoformat(),
                "due_date": date(2026, 3, 30).isoformat(),
                "line_items": [
                    {
                        "description": "Dépose",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    },
                    {
                        "description": "Pose et raccordement",
                        "quantity": 2,
                        "unit_price_cents": 18500,
                    },
                ],
                "notes": "Paiement attendu à réception",
            },
        )
        self.assertEqual(invoice_update_response.status_code, 200, invoice_update_response.text)
        invoice_payload = invoice_update_response.json()
        self.assertEqual(invoice_payload["customer_id"], second_customer["id"])
        self.assertEqual(invoice_payload["worksite_id"], worksite_id)
        self.assertEqual(invoice_payload["title"], "Facture complète tableau")
        self.assertEqual(invoice_payload["issue_date"], date(2026, 3, 14).isoformat())
        self.assertEqual(invoice_payload["due_date"], date(2026, 3, 30).isoformat())
        self.assertEqual(invoice_payload["total_amount_cents"], 49000)
        self.assertEqual(invoice_payload["status"], "draft")
        self.assertEqual(invoice_payload["paid_amount_cents"], 0)
        self.assertEqual(invoice_payload["outstanding_amount_cents"], 49000)
        self.assertEqual(invoice_payload["notes"], "Paiement attendu à réception")

        quote_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=quote_id,
            target_types=["quote"],
        )
        quote_update_log = next(log for log in quote_logs if log["action_type"] == "update")
        self.assertEqual(quote_update_log["changes"]["customer_id"]["to"], second_customer["id"])
        self.assertEqual(quote_update_log["changes"]["worksite_id"]["to"], worksite_id)

        invoice_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=invoice_id,
            target_types=["invoice"],
        )
        invoice_update_log = next(log for log in invoice_logs if log["action_type"] == "update")
        self.assertEqual(invoice_update_log["changes"]["customer_id"]["to"], second_customer["id"])
        self.assertEqual(invoice_update_log["changes"]["worksite_id"]["to"], worksite_id)

    def test_invoice_status_becomes_overdue_when_due_date_is_past(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Maintenance trimestrielle",
                "issue_date": date(2026, 2, 13).isoformat(),
                "due_date": date(2026, 3, 1).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Contrôle simple",
                        "quantity": 1,
                        "unit_price_cents": 12000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        self.assertEqual(invoice_response.json()["status"], "overdue")

    def test_owner_can_link_quote_and_invoice_to_worksite_and_download_pdfs(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Contrat de maintenance",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Contrat annuel",
                        "quantity": 1,
                        "unit_price_cents": 99000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_id = quote_response.json()["id"]

        quote_link_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/worksite",
            headers={"Authorization": f"Bearer {token}"},
            json={"worksite_id": worksite_id},
        )
        self.assertEqual(quote_link_response.status_code, 200, quote_link_response.text)
        self.assertEqual(quote_link_response.json()["worksite_id"], worksite_id)
        self.assertIsNotNone(quote_link_response.json()["worksite_name"])

        quote_pdf_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(quote_pdf_response.status_code, 200, quote_pdf_response.text)
        self.assertEqual(quote_pdf_response.headers["content-type"], "application/pdf")
        self.assertTrue(quote_pdf_response.content.startswith(b"%PDF"))

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Facture de maintenance",
                "issue_date": date(2026, 3, 13).isoformat(),
                "due_date": date(2026, 3, 28).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Maintenance trimestrielle",
                        "quantity": 1,
                        "unit_price_cents": 33000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_id = invoice_response.json()["id"]

        invoice_link_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/worksite",
            headers={"Authorization": f"Bearer {token}"},
            json={"worksite_id": worksite_id},
        )
        self.assertEqual(invoice_link_response.status_code, 200, invoice_link_response.text)
        self.assertEqual(invoice_link_response.json()["worksite_id"], worksite_id)
        self.assertIsNotNone(invoice_link_response.json()["worksite_name"])

        invoice_pdf_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(invoice_pdf_response.status_code, 200, invoice_pdf_response.text)
        self.assertEqual(invoice_pdf_response.headers["content-type"], "application/pdf")
        self.assertTrue(invoice_pdf_response.content.startswith(b"%PDF"))

    def test_owner_can_download_worksite_summary_pdf(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)
        self.assertTrue(chantier_module_response.json()["is_enabled"])

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "worksite_id": worksite_id,
                "title": "Maintenance ventilation",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "sent",
                "line_items": [
                    {
                        "description": "Visite de contrôle",
                        "quantity": 1,
                        "unit_price_cents": 18000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "worksite_id": worksite_id,
                "title": "Facture maintenance ventilation",
                "issue_date": date(2026, 3, 13).isoformat(),
                "due_date": date(2026, 3, 28).isoformat(),
                "status": "issued",
                "line_items": [
                    {
                        "description": "Intervention sur site",
                        "quantity": 1,
                        "unit_price_cents": 24000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)

        worksite_pdf_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(worksite_pdf_response.status_code, 200, worksite_pdf_response.text)
        self.assertEqual(worksite_pdf_response.headers["content-type"], "application/pdf")
        self.assertTrue(worksite_pdf_response.content.startswith(b"%PDF"))

    def test_owner_can_download_simplified_prevention_plan_pdf_with_adjustments(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)
        self.assertTrue(chantier_module_response.json()["is_enabled"])

        customer_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": "Syndic Carnot",
                "customer_type": "company",
                "email": "contact@syndic-carnot.fr",
                "phone": "0472001122",
                "address": "12 rue Carnot, 69002 Lyon",
            },
        )
        self.assertEqual(customer_response.status_code, 200, customer_response.text)

        prevention_plan_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/prevention-plan.pdf",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "useful_date": "2026-03-17T08:30",
                "intervention_context": "Intervention planifiée avec consignation simple avant accès à la zone technique.",
                "vigilance_points": [
                    "Vérifier l'accès à la zone technique avec le responsable du site.",
                    "Confirmer l'absence de circulation tiers pendant l'intervention.",
                ],
                "measure_points": [
                    "Présenter le périmètre d'intervention avant de démarrer.",
                    "Mettre en place un balisage simple autour de la zone de travail.",
                ],
                "additional_contact": "Accueil sécurité : 04 72 00 11 99",
            },
        )
        self.assertEqual(prevention_plan_response.status_code, 200, prevention_plan_response.text)
        self.assertEqual(prevention_plan_response.headers["content-type"], "application/pdf")
        self.assertTrue(prevention_plan_response.content.startswith(b"%PDF"))
        self.assertIn(b"Plan de prevention simplifie", prevention_plan_response.content)
        self.assertIn(b"Syndic Carnot", prevention_plan_response.content)
        self.assertIn(b"contact@syndic-carnot.fr", prevention_plan_response.content)
        self.assertIn(b"consignation simple avant", prevention_plan_response.content)
        self.assertIn(b"responsable du site", prevention_plan_response.content)
        self.assertIn(b"Mettre en place un balisage simple autour de la zone de travail.", prevention_plan_response.content)
        self.assertIn(b"04 72 00 11 99", prevention_plan_response.content)

    def test_generated_worksite_documents_are_explicitly_linked_to_worksite(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)
        self.assertTrue(chantier_module_response.json()["is_enabled"])

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        prevention_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/prevention-plan.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(prevention_response.status_code, 200, prevention_response.text)

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        documents = documents_response.json()
        self.assertEqual(len(documents), 2)
        self.assertTrue(all(item["worksite_id"] == worksite_id for item in documents))
        self.assertEqual(
            {item["document_type"] for item in documents},
            {"worksite_summary_pdf", "worksite_prevention_plan_pdf"},
        )
        self.assertEqual(
            {item["document_type_label"] for item in documents},
            {"Fiche chantier PDF", "Plan de prevention simplifie PDF"},
        )
        self.assertTrue(all(item["status"] == "available" for item in documents))
        self.assertTrue(all(item["lifecycle_status"] == "draft" for item in documents))
        self.assertTrue(all(item["has_stored_file"] is True for item in documents))
        self.assertTrue(all((item["size_bytes"] or 0) > 0 for item in documents))

    def test_generated_worksite_document_can_be_downloaded_by_document_id(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        document = documents_response.json()[0]

        download_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/download",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(download_response.status_code, 200, download_response.text)
        self.assertEqual(download_response.headers["content-type"], "application/pdf")
        self.assertTrue(download_response.content.startswith(b"%PDF"))
        self.assertEqual(download_response.content, summary_response.content)

    def test_download_worksite_document_restores_stable_file_when_binary_content_is_missing(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        session = self.SessionLocal()
        try:
            document = (
                session.execute(
                    select(Document).where(
                        Document.organization_id == UUID("00000000-0000-0000-0000-000000000501"),
                        Document.document_type == "worksite_summary_pdf",
                    )
                )
                .scalars()
                .first()
            )
            self.assertIsNotNone(document)
            assert document is not None
            document.content_bytes = None
            document.size_bytes = None
            document.checksum = None
            document.storage_key = None
            session.commit()
            document_id = str(document.id)
        finally:
            session.close()

        download_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document_id}/download",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(download_response.status_code, 200, download_response.text)
        self.assertEqual(download_response.headers["content-type"], "application/pdf")
        self.assertTrue(download_response.content.startswith(b"%PDF"))
        self.assertEqual(download_response.content, summary_response.content)

        session = self.SessionLocal()
        try:
            restored_document = session.get(Document, UUID(document_id))
            self.assertIsNotNone(restored_document)
            assert restored_document is not None
            self.assertIsNotNone(restored_document.content_bytes)
            self.assertEqual(restored_document.size_bytes, len(summary_response.content))
            self.assertTrue((restored_document.checksum or "").startswith("sha256:"))
            self.assertIsNotNone(restored_document.storage_key)
        finally:
            session.close()

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        restored_payload = next(
            item for item in documents_response.json() if item["id"] == document_id
        )
        self.assertTrue(restored_payload["has_stored_file"])
        self.assertEqual(restored_payload["size_bytes"], len(summary_response.content))

    def test_owner_can_mark_worksite_document_as_draft_or_finalized(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        document = documents_response.json()[0]
        self.assertEqual(document["lifecycle_status"], "draft")

        finalized_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"lifecycle_status": "finalized"},
        )
        self.assertEqual(finalized_response.status_code, 200, finalized_response.text)
        self.assertEqual(finalized_response.json()["lifecycle_status"], "finalized")

        restored_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"lifecycle_status": "draft"},
        )
        self.assertEqual(restored_response.status_code, 200, restored_response.text)
        self.assertEqual(restored_response.json()["lifecycle_status"], "draft")

    def test_owner_can_link_worksite_document_to_existing_signature(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)
        worksite_uuid = UUID(worksite_id)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        session = self.SessionLocal()
        try:
            signature_document = Document(
                organization_id=UUID("00000000-0000-0000-0000-000000000501"),
                attached_to_entity_type="worksite",
                attached_to_entity_id=worksite_uuid,
                attached_to_field="signature",
                uploaded_by_user_id=UUID("00000000-0000-0000-0000-000000000502"),
                document_type="signature",
                source="mobile_sync",
                status=DocumentStatus.AVAILABLE,
                file_name="signature-reception.png",
                mime_type="image/png",
                uploaded_at=datetime(2026, 3, 16, 8, 30, tzinfo=timezone.utc),
            )
            session.add(signature_document)
            session.commit()
            session.refresh(signature_document)
            signature_id = str(signature_document.id)
        finally:
            session.close()

        signatures_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-signatures",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(signatures_response.status_code, 200, signatures_response.text)
        signatures = signatures_response.json()
        self.assertEqual(len(signatures), 1)
        self.assertEqual(signatures[0]["id"], signature_id)
        self.assertEqual(signatures[0]["worksite_id"], worksite_id)
        self.assertEqual(signatures[0]["file_name"], "signature-reception.png")

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        document = documents_response.json()[0]
        self.assertIsNone(document["linked_signature_id"])

        linked_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/signature",
            headers={"Authorization": f"Bearer {token}"},
            json={"signature_document_id": signature_id},
        )
        self.assertEqual(linked_response.status_code, 200, linked_response.text)
        linked_document = linked_response.json()
        self.assertEqual(linked_document["linked_signature_id"], signature_id)
        self.assertEqual(linked_document["linked_signature_label"], "signature-reception.png")
        self.assertEqual(linked_document["linked_signature_file_name"], "signature-reception.png")

        reread_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(reread_response.status_code, 200, reread_response.text)
        self.assertEqual(reread_response.json()[0]["linked_signature_id"], signature_id)

    def test_owner_can_link_worksite_document_to_existing_proofs(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)
        worksite_uuid = UUID(worksite_id)

        chantier_module_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/chantier",
            headers={"Authorization": f"Bearer {token}"},
            json={"is_enabled": True},
        )
        self.assertEqual(chantier_module_response.status_code, 200, chantier_module_response.text)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        session = self.SessionLocal()
        try:
            proof_documents = [
                Document(
                    organization_id=UUID("00000000-0000-0000-0000-000000000501"),
                    attached_to_entity_type="worksite",
                    attached_to_entity_id=worksite_uuid,
                    attached_to_field="proof_photo",
                    uploaded_by_user_id=UUID("00000000-0000-0000-0000-000000000502"),
                    document_type="photo_proof",
                    source="mobile_sync",
                    status=DocumentStatus.AVAILABLE,
                    file_name="preuve-zone-technique.jpg",
                    mime_type="image/jpeg",
                    uploaded_at=datetime(2026, 3, 16, 8, 40, tzinfo=timezone.utc),
                    notes="Vue de la zone balisée",
                ),
                Document(
                    organization_id=UUID("00000000-0000-0000-0000-000000000501"),
                    attached_to_entity_type="worksite",
                    attached_to_entity_id=worksite_uuid,
                    attached_to_field="proof_photo",
                    uploaded_by_user_id=UUID("00000000-0000-0000-0000-000000000502"),
                    document_type="photo_proof",
                    source="mobile_sync",
                    status=DocumentStatus.AVAILABLE,
                    file_name="preuve-acces.jpg",
                    mime_type="image/jpeg",
                    uploaded_at=datetime(2026, 3, 16, 8, 45, tzinfo=timezone.utc),
                ),
            ]
            session.add_all(proof_documents)
            session.commit()
            for proof_document in proof_documents:
                session.refresh(proof_document)
            proof_ids = [str(proof_document.id) for proof_document in proof_documents]
        finally:
            session.close()

        proofs_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-proofs",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(proofs_response.status_code, 200, proofs_response.text)
        proofs = proofs_response.json()
        self.assertEqual(len(proofs), 2)
        self.assertEqual({proof["id"] for proof in proofs}, set(proof_ids))
        self.assertTrue(all(proof["worksite_id"] == worksite_id for proof in proofs))

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        document = documents_response.json()[0]
        self.assertEqual(document["linked_proofs"], [])

        linked_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/proofs",
            headers={"Authorization": f"Bearer {token}"},
            json={"proof_document_ids": proof_ids},
        )
        self.assertEqual(linked_response.status_code, 200, linked_response.text)
        linked_document = linked_response.json()
        self.assertEqual(len(linked_document["linked_proofs"]), 2)
        self.assertEqual(
            {proof["file_name"] for proof in linked_document["linked_proofs"]},
            {"preuve-zone-technique.jpg", "preuve-acces.jpg"},
        )

        reread_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(reread_response.status_code, 200, reread_response.text)
        self.assertEqual(len(reread_response.json()[0]["linked_proofs"]), 2)

    def test_owner_can_assign_and_track_worksite_coordination(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        self.enable_chantier_module(token)

        assignees_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-assignees",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(assignees_response.status_code, 200, assignees_response.text)
        assignees = assignees_response.json()
        self.assertEqual(len(assignees), 2)
        member_assignee = next((item for item in assignees if item["display_name"] == "Marc Member"), None)
        self.assertIsNotNone(member_assignee)

        worksites_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(worksites_response.status_code, 200, worksites_response.text)
        worksite = worksites_response.json()[0]
        self.assertEqual(worksite["coordination"]["status"], "todo")
        self.assertIsNone(worksite["coordination"]["assignee_user_id"])
        self.assertIsNone(worksite["coordination"]["comment_text"])

        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite['id']}/coordination",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "in_progress",
                "assignee_user_id": member_assignee["user_id"],
                "comment_text": "Appeler le client avant l'intervention.",
            },
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        updated_worksite = update_response.json()
        self.assertEqual(updated_worksite["coordination"]["status"], "in_progress")
        self.assertEqual(updated_worksite["coordination"]["assignee_user_id"], member_assignee["user_id"])
        self.assertEqual(updated_worksite["coordination"]["assignee_display_name"], "Marc Member")
        self.assertEqual(updated_worksite["coordination"]["comment_text"], "Appeler le client avant l'intervention.")

        reread_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksites",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(reread_response.status_code, 200, reread_response.text)
        reread_worksite = next(
            item for item in reread_response.json() if item["id"] == worksite["id"]
        )
        self.assertEqual(reread_worksite["coordination"]["status"], "in_progress")
        self.assertEqual(reread_worksite["coordination"]["assignee_display_name"], "Marc Member")
        self.assertEqual(reread_worksite["coordination"]["comment_text"], "Appeler le client avant l'intervention.")

        logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=worksite["id"],
            target_types=["worksite_coordination"],
        )
        self.assertTrue(any(log["target_type"] == "worksite_coordination" for log in logs))

    def test_owner_can_assign_and_track_worksite_document_coordination(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        worksite_id = self.get_first_worksite_id(token)
        self.enable_chantier_module(token)

        summary_response = self.client.get(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksites/{worksite_id}/summary.pdf",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(summary_response.status_code, 200, summary_response.text)

        assignees_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-assignees",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(assignees_response.status_code, 200, assignees_response.text)
        owner_assignee = next(
            (item for item in assignees_response.json() if item["display_name"] == "Alice Owner"),
            None,
        )
        self.assertIsNotNone(owner_assignee)

        documents_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(documents_response.status_code, 200, documents_response.text)
        document = documents_response.json()[0]
        self.assertEqual(document["coordination"]["status"], "todo")
        self.assertIsNone(document["coordination"]["assignee_user_id"])
        self.assertIsNone(document["coordination"]["comment_text"])

        update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/worksite-documents/{document['id']}/coordination",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "status": "done",
                "assignee_user_id": owner_assignee["user_id"],
                "comment_text": "Document relu et pret au partage.",
            },
        )
        self.assertEqual(update_response.status_code, 200, update_response.text)
        updated_document = update_response.json()
        self.assertEqual(updated_document["coordination"]["status"], "done")
        self.assertEqual(updated_document["coordination"]["assignee_user_id"], owner_assignee["user_id"])
        self.assertEqual(updated_document["coordination"]["assignee_display_name"], "Alice Owner")
        self.assertEqual(updated_document["coordination"]["comment_text"], "Document relu et pret au partage.")

        reread_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/worksite-documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(reread_response.status_code, 200, reread_response.text)
        reread_document = next(
            item for item in reread_response.json() if item["id"] == document["id"]
        )
        self.assertEqual(reread_document["coordination"]["status"], "done")
        self.assertEqual(reread_document["coordination"]["assignee_display_name"], "Alice Owner")
        self.assertEqual(reread_document["coordination"]["comment_text"], "Document relu et pret au partage.")

        logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=document["id"],
            target_types=["worksite_document_coordination"],
        )
        self.assertTrue(any(log["target_type"] == "worksite_document_coordination" for log in logs))

    def test_member_can_read_but_cannot_mutate_billing_foundation(self) -> None:
        owner_token = self.login("owner.facturation@conformeo.local")
        member_token = self.login("member.facturation@conformeo.local")
        customer = self.create_customer(owner_token)

        read_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {member_token}"},
        )
        self.assertEqual(read_response.status_code, 200, read_response.text)
        self.assertEqual(read_response.json()[0]["id"], customer["id"])

        create_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {member_token}"},
            json={
                "name": "Client interdit",
                "customer_type": "company",
            },
        )
        self.assertEqual(create_response.status_code, 403, create_response.text)

    def test_billing_actions_are_written_to_audit_log(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        customer_update_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/customers/{customer['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"phone": "0610101010"},
        )
        self.assertEqual(customer_update_response.status_code, 200, customer_update_response.text)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Mise en conformité local technique",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Visite sur site",
                        "quantity": 1,
                        "unit_price_cents": 19000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_id = quote_response.json()["id"]

        quote_status_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "sent"},
        )
        self.assertEqual(quote_status_response.status_code, 200, quote_status_response.text)

        quote_worksite_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/worksite",
            headers={"Authorization": f"Bearer {token}"},
            json={"worksite_id": worksite_id},
        )
        self.assertEqual(quote_worksite_response.status_code, 200, quote_worksite_response.text)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Intervention courant faible",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Intervention",
                        "quantity": 1,
                        "unit_price_cents": 27000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_id = invoice_response.json()["id"]

        invoice_status_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "issued"},
        )
        self.assertEqual(invoice_status_response.status_code, 200, invoice_status_response.text)

        invoice_worksite_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/worksite",
            headers={"Authorization": f"Bearer {token}"},
            json={"worksite_id": worksite_id},
        )
        self.assertEqual(invoice_worksite_response.status_code, 200, invoice_worksite_response.text)

        invoice_payment_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/payment",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "paid_amount_cents": 27000,
                "paid_at": date(2026, 3, 14).isoformat(),
            },
        )
        self.assertEqual(invoice_payment_response.status_code, 200, invoice_payment_response.text)

        audit_logs = self.list_audit_logs(token, limit=20)
        actions = {(log["target_type"], log["action_type"]) for log in audit_logs}

        expected_actions = {
            ("billing_customer", "create"),
            ("billing_customer", "update"),
            ("quote", "create"),
            ("quote", "status_change"),
            ("quote_worksite_link", "update"),
            ("invoice", "create"),
            ("invoice", "status_change"),
            ("invoice_worksite_link", "update"),
            ("invoice_payment", "update"),
        }
        self.assertTrue(expected_actions.issubset(actions))

        invoice_payment_log = next(
            log for log in audit_logs if log["target_type"] == "invoice_payment" and log["target_id"] == invoice_id
        )
        self.assertEqual(invoice_payment_log["changes"]["paid_amount_cents"]["to"], 27000)
        self.assertEqual(invoice_payment_log["changes"]["status"]["to"], "paid")

        quote_worksite_log = next(
            log for log in audit_logs if log["target_type"] == "quote_worksite_link" and log["target_id"] == quote_id
        )
        self.assertEqual(quote_worksite_log["changes"]["worksite_id"]["to"], worksite_id)

    def test_audit_logs_can_be_filtered_for_billing_history(self) -> None:
        token = self.login("owner.facturation@conformeo.local")
        customer = self.create_customer(token)
        worksite_id = self.get_first_worksite_id(token)

        quote_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Remplacement éclairage de sécurité",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Intervention simple",
                        "quantity": 1,
                        "unit_price_cents": 21000,
                    }
                ],
            },
        )
        self.assertEqual(quote_response.status_code, 200, quote_response.text)
        quote_id = quote_response.json()["id"]

        quote_status_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "sent"},
        )
        self.assertEqual(quote_status_response.status_code, 200, quote_status_response.text)

        quote_worksite_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/quotes/{quote_id}/worksite",
            headers={"Authorization": f"Bearer {token}"},
            json={"worksite_id": worksite_id},
        )
        self.assertEqual(quote_worksite_response.status_code, 200, quote_worksite_response.text)

        invoice_response = self.client.post(
            "/organizations/00000000-0000-0000-0000-000000000501/invoices",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "customer_id": customer["id"],
                "title": "Facture éclairage de sécurité",
                "issue_date": date(2026, 3, 13).isoformat(),
                "status": "draft",
                "line_items": [
                    {
                        "description": "Intervention simple",
                        "quantity": 1,
                        "unit_price_cents": 21000,
                    }
                ],
            },
        )
        self.assertEqual(invoice_response.status_code, 200, invoice_response.text)
        invoice_id = invoice_response.json()["id"]

        invoice_status_response = self.client.patch(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/status",
            headers={"Authorization": f"Bearer {token}"},
            json={"status": "issued"},
        )
        self.assertEqual(invoice_status_response.status_code, 200, invoice_status_response.text)

        invoice_payment_response = self.client.post(
            f"/organizations/00000000-0000-0000-0000-000000000501/invoices/{invoice_id}/payment",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "paid_amount_cents": 21000,
                "paid_at": date(2026, 3, 14).isoformat(),
            },
        )
        self.assertEqual(invoice_payment_response.status_code, 200, invoice_payment_response.text)

        quote_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=quote_id,
            target_types=["quote", "quote_worksite_link"],
        )
        self.assertGreaterEqual(len(quote_logs), 3)
        self.assertTrue(all(log["target_id"] == quote_id for log in quote_logs))
        self.assertTrue(all(log["target_type"] in {"quote", "quote_worksite_link"} for log in quote_logs))
        self.assertEqual({log["action_type"] for log in quote_logs}, {"create", "status_change", "update"})

        invoice_logs = self.list_audit_logs(
            token,
            limit=10,
            target_id=invoice_id,
            target_types=["invoice", "invoice_payment", "invoice_worksite_link"],
        )
        self.assertGreaterEqual(len(invoice_logs), 3)
        self.assertTrue(all(log["target_id"] == invoice_id for log in invoice_logs))
        self.assertTrue(
            all(log["target_type"] in {"invoice", "invoice_payment", "invoice_worksite_link"} for log in invoice_logs)
        )
        self.assertIn(("invoice_payment", "update"), {(log["target_type"], log["action_type"]) for log in invoice_logs})

    def test_billing_endpoints_are_blocked_when_facturation_module_is_disabled(self) -> None:
        owner_token = self.login("owner.facturation@conformeo.local")

        toggle_response = self.client.put(
            "/organizations/00000000-0000-0000-0000-000000000501/modules/facturation",
            headers={"Authorization": f"Bearer {owner_token}"},
            json={"is_enabled": False},
        )
        self.assertEqual(toggle_response.status_code, 200, toggle_response.text)
        self.assertFalse(toggle_response.json()["is_enabled"])

        customers_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/customers",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(customers_response.status_code, 403, customers_response.text)
        self.assertIn("Facturation", customers_response.json()["detail"])

        quotes_response = self.client.get(
            "/organizations/00000000-0000-0000-0000-000000000501/quotes",
            headers={"Authorization": f"Bearer {owner_token}"},
        )
        self.assertEqual(quotes_response.status_code, 403, quotes_response.text)
