from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / .env file."""

    app_name: str = "grep-pdf API"
    environment: str = "development"
    # Comma-separated list of origins allowed for CORS (and, reused below, the
    # Clerk authorized parties). Local dev default; deployments extend it with
    # the platform's own public origin via `railway_public_domain`.
    cors_origins: str = "http://localhost:5173"
    # Railway injects RAILWAY_PUBLIC_DOMAIN (host only, e.g.
    # "backend-production-7bfd.up.railway.app") into every deploy from first
    # boot. Deriving the deploy's own origin from it means the served SPA is
    # always an allowed origin / Clerk authorized party — no per-environment
    # CORS_ORIGINS needed, no dependency on variable set-ordering, and no
    # CORS_ORIGINS -> RAILWAY_PUBLIC_DOMAIN reference (which Railway flags for
    # egress). Empty off-platform (local dev), so it changes nothing there.
    railway_public_domain: str = ""
    # Directory holding the built frontend (Vite `dist`). Empty in local dev —
    # the frontend runs on the Vite dev server there. Set in the Docker image to
    # the copied bundle so FastAPI serves the SPA (see docs/deployment.md).
    static_dir: str = ""
    # Clerk Frontend API origin for the deployed instance, e.g.
    # "https://clerk.your-domain.com" (prod) — used to widen the app-shell CSP so
    # Clerk's JS/XHR/frames load. Dev instances (*.clerk.accounts.dev) are always
    # allowed, so this can stay empty in development.
    clerk_frontend_api: str = ""
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

    @field_validator("database_url")
    @classmethod
    def _use_psycopg_driver(cls, value: str) -> str:
        """Normalize managed-Postgres URLs onto the psycopg (v3) driver.

        Railway (and most managed Postgres) hand out ``postgres://`` /
        ``postgresql://`` URLs, which SQLAlchemy would route to psycopg2 — not
        installed here. Rewrite the scheme so ``DATABASE_URL=${{Postgres.DATABASE_URL}}``
        works unchanged, while an explicit ``+driver`` (e.g. local dev) is left as-is.
        """
        for prefix in ("postgresql://", "postgres://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix) :]
        return value

    @property
    def cors_origins_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        # On Railway, always trust this deploy's own public origin so the SPA it
        # serves can call the API and present Clerk tokens (see railway_public_domain).
        if self.railway_public_domain:
            derived = f"https://{self.railway_public_domain}"
            if derived not in origins:
                origins.append(derived)
        return origins

    @property
    def clerk_authorized_parties(self) -> list[str]:
        """Origins allowed to present Clerk tokens — the frontend origins (reuses CORS)."""
        return self.cors_origins_list

    @property
    def app_csp(self) -> str:
        """CSP for the served SPA (docs/security.md).

        Stricter than a wildcard but permissive enough for the app shell: assets
        are same-origin, the pdf.js worker runs from a blob, and Clerk needs its
        Frontend API host for scripts/XHR/frames. Dev Clerk instances live on
        ``*.clerk.accounts.dev``; a production instance's host is added via
        ``clerk_frontend_api``. Clerk avatars come from ``img.clerk.com``. The
        PDF viewer hands react-pdf a ``blob:`` object URL that pdf.js fetches via
        XHR, so ``connect-src`` allows ``blob:``. Fonts come from Google Fonts
        (``index.css`` @imports the stylesheet from ``fonts.googleapis.com``,
        which serves the font files from ``fonts.gstatic.com``).
        """
        clerk_hosts = ["https://*.clerk.accounts.dev"]
        if self.clerk_frontend_api:
            clerk_hosts.append(self.clerk_frontend_api)
        clerk = " ".join(clerk_hosts)
        return "; ".join(
            [
                "default-src 'self'",
                f"script-src 'self' {clerk}",
                f"connect-src 'self' blob: {clerk}",
                f"frame-src 'self' {clerk}",
                "img-src 'self' data: https://img.clerk.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' data: https://fonts.gstatic.com",
                "worker-src 'self' blob:",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
            ]
        )


settings = Settings()
