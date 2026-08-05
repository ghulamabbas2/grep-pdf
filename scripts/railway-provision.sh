#!/usr/bin/env bash
#
# One-time Railway provisioning for grep-pdf (see docs/deployment.md).
#
# Creates the project, a Postgres database, the app service, and a persistent
# volume, then sets the shared configuration on the base (production) environment
# so every PR environment inherits it. Railway itself builds and deploys from
# GitHub — this script only lays down infrastructure and config.
#
# Prerequisites: `railway login` (you must already be authenticated).
# Re-running is safe-ish but not fully idempotent; intended as a one-shot.
#
# After running, finish the browser-only steps documented in docs/deployment.md:
#   1. Connect the GitHub repo to the `backend` service (Settings → Source).
#   2. Enable PR Environments (Settings → Environments).
#   3. Replace the REPLACE_ME secret values below with real keys.
set -euo pipefail

PROJECT_NAME="grep-pdf"
SERVICE="backend"
VOLUME_MOUNT="/data"

echo "==> Creating project '$PROJECT_NAME' and linking this directory"
railway init --name "$PROJECT_NAME"

echo "==> Adding a Postgres database service"
railway add --database postgres

echo "==> Creating the app service '$SERVICE' (also links it as the active service)"
railway add --service "$SERVICE"

echo "==> Adding a persistent volume mounted at $VOLUME_MOUNT on the linked service"
# `volume add` attaches to the currently linked service (the one just created).
railway volume add --mount-path "$VOLUME_MOUNT"

echo "==> Setting shared configuration on the base (production) environment"
# Values set here are inherited by every PR environment Railway forks from this
# base. DATABASE_URL and CORS are Railway *references* — they resolve per
# environment, so each PR gets its own database and its own public URL.
railway variables --service "$SERVICE" --skip-deploys \
  --set 'DATABASE_URL=${{Postgres.DATABASE_URL}}' \
  --set 'CORS_ORIGINS=https://${{RAILWAY_PUBLIC_DOMAIN}}' \
  --set 'ENVIRONMENT=production' \
  --set 'STORAGE_BASE_PATH=/data/uploads' \
  --set 'RAILWAY_RUN_UID=0'

echo "==> Setting secret placeholders (REPLACE with real values before deploying)"
# Set once on the base env so PR environments inherit them. VITE_CLERK_PUBLISHABLE_KEY
# is consumed at *build* time via the Dockerfile ARG; the rest are runtime secrets.
railway variables --service "$SERVICE" --skip-deploys \
  --set 'CLERK_SECRET_KEY=REPLACE_ME' \
  --set 'VITE_CLERK_PUBLISHABLE_KEY=REPLACE_ME' \
  --set 'CLERK_FRONTEND_API=REPLACE_ME' \
  --set 'VOYAGE_API_KEY=REPLACE_ME' \
  --set 'ANTHROPIC_API_KEY=REPLACE_ME'

echo "==> Done. Next: connect the GitHub repo + enable PR Environments (docs/deployment.md)."
