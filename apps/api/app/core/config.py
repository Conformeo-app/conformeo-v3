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
