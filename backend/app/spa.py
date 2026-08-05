"""Serve the built React frontend (Vite `dist`) from FastAPI.

In production the Docker image copies the frontend bundle into the API image and
points ``STATIC_DIR`` at it, so a single uvicorn process serves both the SPA and
the ``/api`` routes (see docs/deployment.md). In local dev ``static_dir`` is
empty and this is a no-op — the Vite dev server owns the frontend instead.
"""

import logging
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, Response

from app.config import settings

logger = logging.getLogger(__name__)


def mount_spa(app: FastAPI) -> None:
    """Mount an SPA catch-all that serves static files with an index.html fallback.

    Must be called after all ``/api`` routers are registered so real API routes
    (and their 404s) take precedence. Client-side routes like ``/chat/:id`` have
    no file on disk, so unmatched non-API paths fall back to ``index.html`` and
    let React Router resolve them.
    """
    if not settings.static_dir:
        return

    root = Path(settings.static_dir).resolve()
    index = root / "index.html"
    if not index.is_file():
        logger.warning("STATIC_DIR set to %s but no index.html found; SPA not served", root)
        return

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str) -> Response:
        # The API is mounted under /api; never answer those paths with the SPA —
        # an unmatched /api/* path should 404 as JSON, not return index.html.
        if full_path == "api" or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        # Serve a real static asset when one exists, guarding against path
        # traversal by confirming the resolved file stays inside the bundle.
        candidate = (root / full_path).resolve()
        if candidate.is_file() and candidate.is_relative_to(root):
            return FileResponse(candidate)
        # Unknown path → hand off to the client-side router.
        return FileResponse(index)

    logger.info("Serving SPA from %s", root)
