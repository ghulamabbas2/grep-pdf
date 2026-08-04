from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env file."""

    app_name: str = "grep-pdf API"
    environment: str = "development"
    # Comma-separated list of origins allowed for CORS.
    cors_origins: str = "http://localhost:5173"
    # SQLAlchemy database URL (Postgres + pgvector). Uses the psycopg (v3) driver.
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5433/grep_pdf"
    # Clerk backend secret key (server-side), used to verify session tokens.
    clerk_secret_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def clerk_authorized_parties(self) -> list[str]:
        """Origins allowed to present Clerk tokens — the frontend origins (reuses CORS)."""
        return self.cors_origins_list


settings = Settings()
