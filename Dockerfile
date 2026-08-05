# syntax=docker/dockerfile:1

##########  Stage 1 — build the React frontend  ##########
FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend

# Install deps against the lockfile first for stable layer caching.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the production bundle. VITE_* vars are compiled into the bundle, so the
# Clerk publishable key must be present at build time — Railway passes it as a
# build arg (see docs/deployment.md). It is a publishable key, safe to bake in.
COPY frontend/ ./
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
RUN npm run build

##########  Stage 2 — FastAPI runtime  ##########
# uv image bundles Python 3.13; matches backend/.python-version.
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS backend

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/backend/.venv \
    PYTHONUNBUFFERED=1

WORKDIR /app/backend

# Install Python deps from the lockfile first (cached until deps change).
COPY backend/pyproject.toml backend/uv.lock ./
RUN --mount=type=cache,id=uv,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# App source, Alembic config/migrations, and the entrypoint.
COPY backend/ ./

# Drop the built frontend into the image; STATIC_DIR points FastAPI at it so a
# single uvicorn process serves the SPA and the /api routes.
COPY --from=frontend /app/frontend/dist /app/frontend/dist

ENV PATH="/app/backend/.venv/bin:$PATH" \
    STATIC_DIR=/app/frontend/dist \
    ENVIRONMENT=production

# Run as an unprivileged user.
RUN chmod +x docker-entrypoint.sh \
    && useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

# Railway overrides the port via $PORT; 8000 is the local-run default.
EXPOSE 8000
CMD ["./docker-entrypoint.sh"]
