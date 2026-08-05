#!/usr/bin/env sh
# Container start: apply pending DB migrations, then boot the API.
# Migrations run before the app so a deploy never serves against an out-of-date
# schema. `set -e` aborts the boot if a migration fails (see docs/deployment.md).
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting uvicorn on port ${PORT:-8000}..."
# Railway injects PORT; bind all interfaces. --proxy-headers so the app trusts
# Railway's edge for the real client scheme/host behind its proxy.
exec uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --proxy-headers \
  --forwarded-allow-ips '*'
