from __future__ import annotations

from app.integrations.legifrance import LegifranceProvider
from app.schemas.external import RegulatorySearchResult, RegulatoryTextDetail


class RegulatoryWatchService:
    def __init__(self, provider: LegifranceProvider) -> None:
        self.provider = provider

    def search(self, query: str, *, limit: int = 10) -> RegulatorySearchResult:
        return self.provider.search(query, limit=limit)

    def get_text(self, document_id: str) -> RegulatoryTextDetail:
        return self.provider.get_text(document_id)
