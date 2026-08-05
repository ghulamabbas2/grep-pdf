# grep.pdf — Deployment

Deployment runs on **Railway** via its native **GitHub integration**. Railway watches the repo, builds the Docker image, and deploys — **GitHub Actions only runs CI** (lint, type-check, tests); it never builds or ships the app. See [git-conventions.md](git-conventions.md) for the branch → PR flow and [security.md](security.md) for how secrets are handled.

## Files

| File | Role |
|------|------|
| `Dockerfile` | Multi-stage build: React bundle → FastAPI image. |
| `.dockerignore` | Keeps `.env`, `node_modules`, `.venv`, caches, and `var/` out of the build context. |
| `backend/docker-entrypoint.sh` | Container start: run migrations, then uvicorn. |
| `railway.json` | Tells Railway to build with the Dockerfile and health-check `/api/health`. |
| `.github/workflows/ci.yml` | PR gate — backend (ruff + pytest) and frontend (oxlint + build + vitest). |
| `scripts/railway-provision.sh` | One-time CLI provisioning (project, Postgres, service, volume, base-env vars). |

## Build

A single **Dockerfile** produces the deployed image:

1. **Stage 1** builds the React frontend (`npm ci && npm run build`). `VITE_*` vars are compiled into the bundle, so **`VITE_CLERK_PUBLISHABLE_KEY` is passed as a Docker build arg** — Railway injects it because the Dockerfile declares `ARG VITE_CLERK_PUBLISHABLE_KEY` (Dockerfile builds expose variables *only* through an explicit `ARG`).
2. **Stage 2** is the FastAPI runtime (uv, Python 3.13). It installs deps from `uv.lock`, copies the app source, and **copies the built bundle to `/app/frontend/dist`**, with `STATIC_DIR` pointing at it so one uvicorn process serves the SPA **and** `/api`.

The container runs as a **non-root user**. Because Railway mounts volumes as root, the service also sets `RAILWAY_RUN_UID=0` so the app can write uploads to the volume (Railway's documented fix for non-root + volumes).

### Serving the SPA

FastAPI serves `index.html`, static assets, and an SPA fallback for client-side routes (`/dashboard`, `/chat/:id`) — unknown non-`/api` paths return `index.html`; unknown `/api/*` paths still 404 as JSON. CSP is chosen per response: strict `default-src 'none'` for `/api`, and an app-shell policy for the SPA that allows same-origin assets, the pdf.js blob worker, and Clerk. A production Clerk instance's host is added to that policy via `CLERK_FRONTEND_API`.

## Migrations

`docker-entrypoint.sh` runs **`alembic upgrade head` on container start, before uvicorn boots** (`set -e`, so a failed migration aborts the boot). uvicorn then binds `0.0.0.0:$PORT` (Railway assigns `PORT`) with `--proxy-headers`. Each environment (preview or prod) migrates its own database.

`DATABASE_URL` from Railway arrives as `postgresql://…`; the app normalizes the scheme to the `postgresql+psycopg://` (psycopg v3) driver in `config.py`, so the Railway reference works unchanged.

## CI

`.github/workflows/ci.yml` runs on every PR to `main` (and on push to `main`):

- **Backend** — `uv sync --frozen`, then `ruff check`, `ruff format --check`, `pytest`.
- **Frontend** — `npm ci`, then `oxlint`, `npm run build` (includes `tsc`), `vitest`.

CI must be green to merge; Railway deploys independently of it.

## PR previews

With **PR Environments** enabled, opening a PR forks the base (production) environment into an **ephemeral preview** with its own **URL, Postgres database, and volume**. Because `DATABASE_URL` and `CORS_ORIGINS` are Railway **references** (not literals), each preview resolves them to *its own* database and *its own* public domain — previews never touch production data. Each preview is **auto-torn-down when the PR closes**. The **preview URL is posted on the PR** for human review; merging to `main` deploys production.

## Environment variables

Set **once on the base (production) environment** and inherited by every PR environment. References resolve per-environment.

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Reference — per-env Postgres. Scheme normalized in app. |
| `CORS_ORIGINS` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Reference — per-env public URL. Also Clerk authorized party. |
| `ENVIRONMENT` | `production` | |
| `STORAGE_BASE_PATH` | `/data/uploads` | Under the `/data` volume mount. |
| `RAILWAY_RUN_UID` | `0` | Lets the non-root image write to the root-owned volume. |
| `CLERK_SECRET_KEY` | *(secret)* | Replace the `REPLACE_ME` placeholder. |
| `VITE_CLERK_PUBLISHABLE_KEY` | *(secret)* | **Build-time** ARG. Replace placeholder. |
| `CLERK_FRONTEND_API` | `https://clerk.<domain>` | Prod Clerk host; widens the SPA CSP. |
| `VOYAGE_API_KEY` | *(secret)* | Embeddings. Replace placeholder. |
| `ANTHROPIC_API_KEY` | *(secret)* | Answer chain. Replace placeholder. |

Secrets live in Railway env vars, **never in the repo** (see [security.md](security.md)).

## One-time setup

Provisioning (already run via `scripts/railway-provision.sh`) created the `grep-pdf` project, a **Postgres** service, the **`backend`** service, a **volume at `/data`**, and the base-env variables above. The remaining steps require the Railway dashboard (they need the GitHub App / a browser):

1. **Connect the repo.** `backend` service → **Settings → Source → Connect Repo**, pick this repository, branch **`main`**. Railway detects `railway.json` and builds with the Dockerfile.
2. **Enable PR Environments.** Project **Settings → Environments → Enable PR environments** (base = `production`).
3. **Replace secret placeholders.** Set the real values for `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_FRONTEND_API`, `VOYAGE_API_KEY`, and `ANTHROPIC_API_KEY` on the production environment (dashboard, or `railway variables --set …`).
4. **Generate a domain.** `backend` → **Settings → Networking → Generate Domain** so `RAILWAY_PUBLIC_DOMAIN` (and thus `CORS_ORIGINS`) resolves.

After that, pushing to a PR builds a preview; merging to `main` deploys production.
