from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.schemas.common import BaseReadModel
from app.db.models.organization import OrganizationStatus
from app.schemas.external import CompanyIdentity, EstablishmentIdentity, ExternalSourceMeta


class OrganizationRead(BaseReadModel):
    name: str
    slug: str
    legal_name: str | None
    activity_label: str | None
    employee_count: int | None
    has_employees: bool | None
    receives_public: bool | None
    stores_hazardous_products: bool | None
    performs_high_risk_work: bool | None
    contact_email: str | None
    contact_phone: str | None
    headquarters_address: str | None
    registry_siren: str | None
    registry_headquarters_siret: str | None
    registry_company_name: str | None
    registry_activity_code: str | None
    registry_status: str | None
    registry_address: str | None
    registry_source_meta: ExternalSourceMeta | None
    registry_last_synced_at: datetime | None
    onboarding_completed_at: datetime | None
    status: OrganizationStatus
    default_locale: str
    default_timezone: str
    notes: str | None


class OrganizationProfileUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    legal_name: str | None = Field(default=None, max_length=160)
    activity_label: str | None = Field(default=None, max_length=160)
    employee_count: int | None = Field(default=None, ge=0, le=100000)
    has_employees: bool | None = None
    receives_public: bool | None = None
    stores_hazardous_products: bool | None = None
    performs_high_risk_work: bool | None = None
    contact_email: str | None = Field(default=None, max_length=160)
    contact_phone: str | None = Field(default=None, max_length=32)
    headquarters_address: str | None = Field(default=None, max_length=500)
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_employee_consistency(self) -> "OrganizationProfileUpdateRequest":
        if self.has_employees is False and self.employee_count not in (None, 0):
            raise ValueError("L'effectif doit etre vide ou egal a 0 si l'entreprise n'a pas de salaries.")
        if self.has_employees is True and self.employee_count == 0:
            raise ValueError("L'effectif doit etre superieur a 0 si l'entreprise a des salaries.")
        return self


class OrganizationCompanyRegistryEnrichmentRequest(BaseModel):
    siren: str | None = Field(default=None, pattern=r"^\d{9}$")
    siret: str | None = Field(default=None, pattern=r"^\d{14}$")

    @model_validator(mode="after")
    def validate_identifier(self) -> "OrganizationCompanyRegistryEnrichmentRequest":
        if bool(self.siren) == bool(self.siret):
            raise ValueError("Renseignez exactement un SIREN ou un SIRET.")
        return self


class OrganizationEnrichmentFieldRead(BaseModel):
    field: str
    action: str
    current_value: str | int | float | bool | dict | list | None = None
    external_value: str | int | float | bool | dict | list | None = None
    applied_value: str | int | float | bool | dict | list | None = None
    reason: str | None = None


class OrganizationCompanyRegistryEnrichmentRead(BaseModel):
    organization: OrganizationRead
    company: CompanyIdentity
    establishment: EstablishmentIdentity | None = None
    field_results: list[OrganizationEnrichmentFieldRead]
    source_meta: ExternalSourceMeta
    synced_at: datetime
