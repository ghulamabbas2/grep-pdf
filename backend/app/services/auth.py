"""Clerk token verification and user provisioning.

Session tokens are verified against Clerk's JWKS via the official
`clerk-backend-api` SDK. The authenticated user id comes only from the verified
token's `sub` claim — never from client-supplied data (see docs/auth.md).
"""

from collections.abc import Callable

import httpx
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions
from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.config import settings
from app.models.user import User


class AuthError(Exception):
    """Raised when a request carries no valid Clerk session token."""


# Module-level Clerk client; the SDK caches JWKS for networkless verification.
_clerk = Clerk(bearer_auth=settings.clerk_secret_key)

# The SDK only inspects the request's Authorization header, not its URL, so any
# well-formed placeholder URL works when wrapping the raw header for verification.
_VERIFY_PLACEHOLDER_URL = "http://localhost/"


def verify_bearer_token(authorization: str | None) -> dict[str, object]:
    """Verify a `Bearer` session token and return its JWT claims.

    Raises `AuthError` if the header is missing or the token is invalid/expired.
    """
    if not authorization:
        raise AuthError("Missing Authorization header")

    # The SDK reads the token from the request's Authorization header itself.
    request = httpx.Request(
        "GET", _VERIFY_PLACEHOLDER_URL, headers={"Authorization": authorization}
    )
    request_state = _clerk.authenticate_request(
        request,
        AuthenticateRequestOptions(authorized_parties=settings.clerk_authorized_parties),
    )

    if not request_state.is_signed_in or request_state.payload is None:
        raise AuthError(request_state.message or "Invalid session token")

    return request_state.payload


def fetch_primary_email(user_id: str) -> str | None:
    """Return the user's primary email address from Clerk's Backend API.

    Clerk session tokens carry no email claim by default, so the email is
    resolved from Clerk when provisioning the `users` row. Email lookup is
    best-effort — it never blocks authentication, so any failure yields None.
    """
    try:
        user = _clerk.users.get(user_id=user_id)
    except Exception:  # noqa: BLE001 - email is best-effort; never block auth
        return None
    if user is None:
        return None
    emails = user.email_addresses or []
    for address in emails:
        if address.id == user.primary_email_address_id:
            return address.email_address
    # No primary flagged (edge case): fall back to the first email on file.
    return emails[0].email_address if emails else None


def upsert_user(db: DbSession, user_id: str, resolve_email: Callable[[], str | None]) -> User:
    """Return the `users` row for `user_id`, creating it on first sight.

    `resolve_email` is invoked only when an email is actually needed — when the
    row is new or still has none on file — so a stored email spares every later
    request the extra Clerk lookup.
    """
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        user = User(id=user_id, email=resolve_email())
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.email is None:
        email = resolve_email()
        if email is not None:
            user.email = email
            db.commit()
            db.refresh(user)
    return user
