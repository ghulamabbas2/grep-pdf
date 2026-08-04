"""Application error carrying a stable code + HTTP status.

Raising ``AppError`` lets a route return the typed ``{ error: { code, message } }``
envelope with a specific, machine-readable code (e.g. ``parse_failed``) rather
than the generic ``http_error``. The handler is registered in ``app.main``.
"""


class AppError(Exception):
    """A client-facing error with a stable code and HTTP status."""

    def __init__(self, code: str, message: str, status_code: int) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
