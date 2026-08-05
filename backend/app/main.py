import logging
from collections.abc import Awaitable, Callable

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.errors import AppError
from app.rate_limit import limiter
from app.routers import chat, me, pdfs, sessions, stats
from app.schemas.common import ErrorBody, ErrorEnvelope
from app.services.auth import AuthError
from app.spa import mount_spa

logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name)
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# CSP is chosen per response class:
#  - JSON API responses need nothing, so they get the strictest lock-down.
#  - Swagger UI / ReDoc load assets from a CDN, so those routes get a relaxed CSP.
#  - The served SPA (every other path) gets an app-shell CSP (see settings.app_csp).
_DOC_PATHS = frozenset({"/docs", "/redoc", "/openapi.json", "/docs/oauth2-redirect"})
_STRICT_CSP = "default-src 'none'; frame-ancestors 'none'"
_DOCS_CSP = (
    "default-src 'self'; "
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "img-src 'self' data: https://fastapi.tiangolo.com; "
    "worker-src 'self' blob:"
)


def _csp_for(path: str) -> str:
    """Pick the Content-Security-Policy for a request path."""
    if path in _DOC_PATHS:
        return _DOCS_CSP
    if path == "/api" or path.startswith("/api/"):
        return _STRICT_CSP
    return settings.app_csp


@app.middleware("http")
async def security_headers(
    request: Request, call_next: Callable[[Request], Awaitable[Response]]
) -> Response:
    """Set baseline security headers on every response (docs/security.md)."""
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = _csp_for(request.url.path)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


@app.exception_handler(AuthError)
def handle_auth_error(_request: Request, exc: AuthError) -> JSONResponse:
    """Return a 401 in the standard error envelope for auth failures."""
    envelope = ErrorEnvelope(error=ErrorBody(code="unauthorized", message=str(exc)))
    return JSONResponse(status_code=401, content=envelope.model_dump())


@app.exception_handler(AppError)
def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
    """Return a typed error envelope with the error's stable code + status."""
    envelope = ErrorEnvelope(error=ErrorBody(code=exc.code, message=exc.message))
    return JSONResponse(status_code=exc.status_code, content=envelope.model_dump())


@app.exception_handler(RateLimitExceeded)
def handle_rate_limit(_request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Map slowapi's rate-limit error onto the standard error envelope (429)."""
    envelope = ErrorEnvelope(
        error=ErrorBody(code="rate_limited", message="Too many requests. Please slow down."),
    )
    return JSONResponse(status_code=429, content=envelope.model_dump())


@app.exception_handler(RequestValidationError)
def handle_validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Return request-body validation failures as the typed 422 envelope.

    The first error's human message is surfaced; full details stay server-side
    (see docs/errors-and-validation.md).
    """
    errors = exc.errors()
    message = errors[0]["msg"] if errors else "Invalid request."
    envelope = ErrorEnvelope(error=ErrorBody(code="validation_error", message=message))
    return JSONResponse(status_code=422, content=envelope.model_dump())


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
app.include_router(pdfs.router)
app.include_router(sessions.router)
app.include_router(stats.router)
app.include_router(chat.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    """Simple liveness check used by the frontend and tooling."""
    return {"status": "ok", "environment": settings.environment}


# Serve the built frontend last, so its catch-all never shadows the API routes
# above. No-op in local dev, where the Vite dev server owns the frontend.
mount_spa(app)
