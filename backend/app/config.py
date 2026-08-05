from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env file."""

    app_name: str = "grep-pdf API"
    environment: str = "development"
    # Comma-separated list of origins allowed for CORS.
    cors_origins: str = "http://localhost:5173"
    # SQLAlchemy database URL (Postgres + pgvector). Uses the psycopg (v3) driver.
    # Defaults to a local Postgres on the standard port 5432 (e.g. Postgres.app).
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/grep_pdf"
    # Clerk backend secret key (server-side), used to verify session tokens.
    clerk_secret_key: str = ""
    # Voyage AI key for chunk embeddings (voyage-3-lite, 512-dim; see docs/rag.md).
    voyage_api_key: str = ""
    # Anthropic key + model for the answer chain (LangChain ChatAnthropic; see docs/llm.md).
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-haiku-4-5-20251001"
    # Base directory uploaded PDFs are written under, one subfolder per user id.
    # Local path in dev; the Railway Volume mount in production (see docs/security.md).
    storage_base_path: str = "./var/uploads"
    # Reject uploads larger than this (bytes). Default 50 MB.
    max_upload_bytes: int = 50 * 1024 * 1024
    # Per-user rate limit for the upload endpoint (slowapi syntax).
    upload_rate_limit: str = "10/minute"
    # Per-user rate limit for the process endpoint; looser so legitimate retries
    # after a failed ingest don't trip the limit.
    process_rate_limit: str = "30/minute"
    # Per-user rate limit for the chat/ask endpoint (see docs/security.md).
    chat_rate_limit: str = "30/minute"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def clerk_authorized_parties(self) -> list[str]:
        """Origins allowed to present Clerk tokens — the frontend origins (reuses CORS)."""
        return self.cors_origins_list


settings = Settings()
