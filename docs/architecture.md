# grep.pdf — Architecture

`grep-pdf` is a monorepo pairing a **FastAPI** backend (`/backend`) with a **React + Vite** frontend (`/frontend`). Each side owns its own dependencies and dev server; see `CLAUDE.md` for commands and dev-time wiring.

## Backend (`/backend`)

FastAPI app organized into layers under `backend/app/`:

| Layer | Path | Responsibility |
|-------|------|----------------|
| Routers | `backend/app/routers` | HTTP endpoints — request/response handling, dependency wiring. Keep routes under the `/api` prefix. |
| Services | `backend/app/services` | Business logic. Routers call services; services hold the real work and stay framework-agnostic. |
| Models | `backend/app/models` | Persistence / domain models. |
| Schemas | `backend/app/schemas` | Pydantic schemas for request and response validation and serialization. |

Flow: **router → service → models**, with **schemas** validating what crosses the API boundary.

## Frontend (`/frontend`)

React + Vite app under `frontend/src/`:

| Area | Path | Responsibility |
|------|------|----------------|
| Features | `frontend/src/features` | Feature folders — each self-contained slice of the app (its components, hooks, state). |
| Shared UI | `frontend/src/components/ui` | Reusable, presentation-only UI components shared across features. |
| API client | `frontend/src/lib` | API client and other shared utilities; the single place that talks to the backend. |

## Naming Conventions

- **Python** — `snake_case` (files, functions, variables, modules).
- **React components** — `PascalCase` (component names and their files).
- **Everything else** — `kebab-case` (non-component files, directories, config).
