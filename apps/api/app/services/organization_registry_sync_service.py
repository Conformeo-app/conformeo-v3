from __future__ import annotations

from app.core.external_enrichment import (
    OrganizationCompanyEnrichmentResult,
    apply_company_registry_enrichment,
)
from app.db.models.organization import Organization
from app.integrations.base import ExternalIntegrationError, ExternalResourceNotFoundError
from app.services.company_enrichment_service import CompanyEnrichmentService


class OrganizationRegistrySyncService:
    def __init__(self, company_service: CompanyEnrichmentService) -> None:
        self.company_service = company_service

    def enrich_organization(
        self,
        organization: Organization,
        *,
        siren: str | None = None,
        siret: str | None = None,
    ) -> OrganizationCompanyEnrichmentResult:
        if bool(siren) == bool(siret):
            raise ValueError("Renseignez exactement un SIREN ou un SIRET.")

        establishment = None
        if siret is not None:
            establishment = self.company_service.get_establishment(siret)
            company = self.company_service.get_company(establishment.siren)
        else:
            assert siren is not None
            company = self.company_service.get_company(siren)
            if company.headquarters_siret:
                try:
                    establishment = self.company_service.get_establishment(company.headquarters_siret)
                except ExternalResourceNotFoundError:
                    establishment = None
                except ExternalIntegrationError:
                    raise

        return apply_company_registry_enrichment(
            organization,
            company,
            establishment=establishment,
        )
