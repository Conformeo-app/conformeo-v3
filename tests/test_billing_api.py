from __future__ import annotations

import os
import sys
import unittest
from datetime import date
from pathlib import Path
from uuid import UUID

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
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
