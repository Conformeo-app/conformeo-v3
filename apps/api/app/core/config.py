from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEVELOPMENT_AUTH_TOKEN_SECRET = "development-only-change-me"


class Settings(BaseSettings):
    app_env: Literal["development", "staging", "production"] = "development"
    app_name: str = "Conformeo API"
    app_version: str = "0.1.0"
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/conformeo"
    auth_token_secret: str = DEVELOPMENT_AUTH_TOKEN_SECRET
    auth_access_token_ttl_minutes: int = 480
    cors_allow_origins: list[str] = [
        "http://localhost:4200",
        "http://localhost:8100",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:8100",
    ]
    external_integrations_enabled: bool = True
    external_provider_max_retries: int = 1
    external_provider_user_agent: str = "Conformeo-API/0.1.0"
    external_cache_enabled: bool = True
    external_company_cache_ttl_seconds: int = 3600
    external_geocode_cache_ttl_seconds: int = 86400
    external_regulation_cache_ttl_seconds: int = 1800
    external_site_risks_cache_ttl_seconds: int = 1800

    external_annuaire_entreprises_enabled: bool = True
    external_annuaire_entreprises_base_url: str = "https://recherche-entreprises.api.gouv.fr"
    external_annuaire_entreprises_timeout_seconds: float = 6.0

    external_geoplateforme_enabled: bool = True
    external_geoplateforme_base_url: str = "https://data.geopf.fr/geocodage"
    external_geoplateforme_timeout_seconds: float = 6.0

    external_legifrance_enabled: bool = False
    external_legifrance_environment: Literal["sandbox", "production"] = "production"
    external_legifrance_base_url: str = "https://api.piste.gouv.fr"
    external_legifrance_token_url: str = "https://oauth.piste.gouv.fr/api/oauth/token"
    external_legifrance_client_id: str | None = None
    external_legifrance_client_secret: str | None = None
    external_legifrance_scope: str = "openid"
    external_legifrance_oauth_grant_type: str = "client_credentials"
    external_legifrance_timeout_seconds: float = 8.0
    external_legifrance_default_sort: str = "DATE_DESC"

    external_georisques_enabled: bool = False
    external_georisques_base_url: str = "https://www.georisques.gouv.fr"
    external_georisques_api_token: str | None = None
    external_georisques_timeout_seconds: float = 8.0

    model_config = SettingsConfigDict(
        env_file=(".env", "apps/api/.env"),
        env_prefix="CONFORMEO_",
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_sensitive_settings(self) -> "Settings":
        if (
            self.app_env in {"staging", "production"}
            and self.auth_token_secret == DEVELOPMENT_AUTH_TOKEN_SECRET
        ):
            raise ValueError(
                "CONFORMEO_AUTH_TOKEN_SECRET doit etre defini hors environnement development."
            )
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
