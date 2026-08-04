# Backend — grep-pdf API

FastAPI service managed with [uv](https://docs.astral.sh/uv/).

## Setup

```bash
cp .env.example .env
uv sync
```

## Run

```bash
uv run fastapi dev app/main.py
```

The API is served at http://localhost:8000. Health check: http://localhost:8000/api/health
