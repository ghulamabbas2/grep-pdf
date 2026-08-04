import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import me
from app.schemas.common import ErrorBody, ErrorEnvelope
from app.services.auth import AuthError

logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AuthError)
def handle_auth_error(_request: Request, exc: AuthError) -> JSONResponse:
    """Return a 401 in the standard error envelope for auth failures."""
    envelope = ErrorEnvelope(error=ErrorBody(code="unauthorized", message=str(exc)))
    return JSONResponse(status_code=401, content=envelope.model_dump())


@app.exception_handler(HTTPException)
def handle_http_exception(_request: Request, exc: HTTPException) -> JSONResponse:
    """Map FastAPI's ``HTTPException`` onto the standard error envelope."""
    envelope = ErrorEnvelope(error=ErrorBody(code="http_error", message=str(exc.detail)))
    return JSONResponse(status_code=exc.status_code, content=envelope.model_dump())


@app.exception_handler(Exception)
def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    """Log full context server-side and return a generic 500 envelope.

    Internal details never leak to the client (see docs/errors-and-validation.md).
    """
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    envelope = ErrorEnvelope(
        error=ErrorBody(code="internal_error", message="An unexpected error occurred"),
    )
    return JSONResponse(status_code=500, content=envelope.model_dump())


app.include_router(me.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Simple liveness check used by the frontend and tooling."""
    return {"status": "ok", "environment": settings.environment}
