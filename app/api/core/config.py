"""Application settings.

Only the values the app reads at runtime live here. S3 and database
credentials are loaded where they are used (``services/s3_service.py`` and
``db/session.py``) so importing this module never requires those secrets — the
app, and the test suite, can import ``main`` with nothing but defaults set.
"""

from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode


class Settings(BaseSettings):
    # development | staging | production
    environment: str = "development"

    # Exact CORS origins. Accepts a comma-separated string in the env
    # (``ALLOWED_ORIGINS=https://a.com,https://b.com``). NoDecode disables
    # pydantic-settings' default JSON parsing so the validator below runs.
    allowed_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    # Optional regex for dynamic origins (e.g. Vercel preview deployments).
    # Example: ``https://captura-frontend-.*-ekomjah\.vercel\.app``
    allowed_origin_regex: str | None = None

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [o.strip() for o in value.split(",") if o.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache
def get_settings() -> Settings:
    return Settings()
