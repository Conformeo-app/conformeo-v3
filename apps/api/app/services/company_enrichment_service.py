from __future__ import annotations

from app.integrations.annuaire_entreprises import AnnuaireEntreprisesProvider
from app.schemas.external import CompanyIdentity, CompanySearchResponse, EstablishmentIdentity


class CompanyEnrichmentService:
    def __init__(self, provider: AnnuaireEntreprisesProvider) -> None:
        self.provider = provider

    def search_companies(self, query: str, *, limit: int = 10) -> CompanySearchResponse:
        return self.provider.search_companies(query, limit=limit)

    def get_company(self, siren: str) -> CompanyIdentity:
        return self.provider.get_company(siren)

    def get_establishment(self, siret: str) -> EstablishmentIdentity:
        return self.provider.get_establishment(siret)
