# grep-pdf

A local starter with a **FastAPI** backend and a **React + Vite + TypeScript + Tailwind** frontend.

```
grep-pdf/
├── backend/    # FastAPI app (managed with uv)
├── frontend/   # React + Vite + TS + Tailwind
└── package.json  # one-command dev runner
```

## Prerequisites

- [uv](https://docs.astral.sh/uv/) (Python 3.13)
- Node.js 20+ and npm

## Setup

```bash
# 1. Copy env templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Install everything (backend + frontend deps and the root runner)
npm install
npm run setup
```

## Run everything with one command

```bash
npm run dev
```

This starts both servers concurrently:

- Backend → http://localhost:8000 (health: http://localhost:8000/api/health)
- Frontend → http://localhost:5173

The frontend proxies `/api/*` to the backend, and the landing page shows the
live API health status.
