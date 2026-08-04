# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`grep-pdf` is a monorepo starter for searching inside PDFs. It pairs a **FastAPI** backend (`backend/`, managed with [uv](https://docs.astral.sh/uv/), Python 3.13) with a **React 19 + Vite + TypeScript + Tailwind v4** frontend (`frontend/`). The root `package.json` is a thin runner that orchestrates both via `concurrently` — it is not a shared workspace.

Most of the current code is scaffolding: the backend exposes only `/api/health`, and the frontend landing page renders that health status. New feature work generally means adding backend routes under `backend/app/` and UI in `frontend/src/`.

## Commands

Run these from the repo root unless noted.

```bash
npm install && npm run setup   # install root runner, then backend (uv sync) + frontend (npm install) deps
npm run dev                    # run backend (:8000) + frontend (:5173) concurrently
```

Backend only (from `backend/`):
```bash
uv run fastapi dev app/main.py   # dev server with reload at http://localhost:8000
uv add <package>                 # add a dependency (updates pyproject.toml + uv.lock)
```

Frontend only (from `frontend/`):
```bash
npm run dev       # Vite dev server
npm run build     # tsc -b type-check, then vite build
npm run lint      # oxlint
npm run preview   # serve the production build
```

There is **no test suite** in this repo yet — no test runner is configured for either package.

## Architecture

**Dev-time wiring.** The frontend never calls the backend by absolute URL. Vite proxies `/api/*` → `http://localhost:8000` (`frontend/vite.config.ts`), so frontend code fetches relative paths like `/api/health`. Because of the proxy, the browser origin stays `:5173`; the backend also allows that origin explicitly via CORS. When adding backend routes, keep them under the `/api` prefix so the proxy and CORS assumptions hold.

**Backend config** (`backend/app/config.py`) uses `pydantic-settings`. A single `settings` singleton is imported wherever config is needed; values load from environment / `backend/.env`. `cors_origins` is stored as a comma-separated string and exposed as a list via the `cors_origins_list` property — add new allowed frontend origins there, not by hardcoding in `main.py`.

**Env files.** Each package has its own `.env.example`; copy to `.env` before running (`cp backend/.env.example backend/.env`, same for `frontend/`). `.env` files are gitignored.

**Frontend linting** uses oxlint (not ESLint) configured in `frontend/.oxlintrc.json` with the react/typescript/oxc plugins; `react/rules-of-hooks` is enforced as an error.

## Doc Convention

Whenever a new file is created in `/docs`, add it to the **Project Docs** section below with one line on what it covers and when to read it.

### Project Docs

- [architecture.md](docs/architecture.md) — Monorepo layout: backend layers (routers/services/models/schemas), frontend structure (features/shared UI/API client), and naming conventions. Read before adding files or deciding where code goes.
- [api.md](docs/api.md) — API conventions: `/api/*` routers grouped by resource, the `{ data }` / `{ error }` envelope, per-user request scoping, the typed frontend client in `lib/api.ts`, and SSE streaming with structured citation events. Read before adding routes or frontend API calls.
- [auth.md](docs/auth.md) — Clerk auth: hosted UI + @clerk/react on the frontend, JWT/JWKS verification middleware on the backend, protected `/api/*` routes, and user id sourced only from the verified token. Read before touching auth, middleware, or protected routes.
- [database.md](docs/database.md) — Postgres + SQLAlchemy + Alembic + pgvector: core tables, per-user query scoping, and indexing (user_id + IVFFlat on chunk vectors). Read before touching models, migrations, or queries.
- [design-system.md](docs/design-system.md) — Design tokens (colors, type, spacing) mapped from the CSS custom properties source of truth to React + Vite + Tailwind. Read before styling UI or picking colors/values.
- [ui.md](docs/ui.md) — Component contracts (props, variants, states) for the UI library, keyed to the design-system tokens. Read before building or modifying components.
