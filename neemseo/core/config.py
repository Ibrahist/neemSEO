"""
neemSEO Configuration module.
Loads settings with NEEMSEO_ prefix using pydantic-settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="NEEMSEO_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Core Application
    ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "default-dev-secret-key-change-in-production"
    BASE_URL: str = "http://localhost:8000"
    USER_AGENT: str = "neemSEO-Bot/1.0 (+http://localhost:8000/bot)"

    # Database
    DATABASE_URL: str = "sqlite:///./neemseo.db"

    # Fetcher settings
    REQUEST_TIMEOUT: float = 12.0
    MAX_REDIRECTS: int = 5
    VERIFY_SSL: bool = True
    FOLLOW_REDIRECTS: bool = True
    RESPECT_ROBOTS_TXT: bool = True

    # Google PageSpeed Insights
    PAGESPEED_API_KEY: Optional[str] = None

    # Third-party Data APIs
    DATAFORSEO_LOGIN: Optional[str] = None
    DATAFORSEO_PASSWORD: Optional[str] = None
    SERPAPI_API_KEY: Optional[str] = None


settings = Settings()

