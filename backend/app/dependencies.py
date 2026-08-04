"""Reusable FastAPI dependencies for authenticated routes.

Attach `Depends(get_current_user)` (or `get_current_user_id`) to any `/api/*`
route to require a verified Clerk token and scope the handler to that user.
"""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session as DbSession

from app.db import get_db
from app.models.user import User
from app.services.auth import (
    AuthError,
    fetch_primary_email,
    upsert_user,
    verify_bearer_token,
)


def _subject_claim(claims: dict[str, object]) -> str:
    """Return the token's `sub` claim, raising `AuthError` if it is absent."""
    user_id = claims.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise AuthError("Token is missing a subject claim")
    return user_id


def get_current_user_id(authorization: Annotated[str | None, Header()] = None) -> str:
    """Verify the request's Clerk token and return the authenticated user id.

    Raises `AuthError` (mapped to a 401 error envelope) when the token is
    missing or invalid.
    """
    return _subject_claim(verify_bearer_token(authorization))


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: DbSession = Depends(get_db),
) -> User:
    """Verify the token, ensure the `users` row exists, and return it."""
    claims = verify_bearer_token(authorization)
    user_id = _subject_claim(claims)
    claim_email = claims.get("email")

    def resolve_email() -> str | None:
        """Prefer an email claim if the token carries one; else ask Clerk."""
        if isinstance(claim_email, str) and claim_email:
            return claim_email
        return fetch_primary_email(user_id)

    return upsert_user(db, user_id, resolve_email)


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentUserId = Annotated[str, Depends(get_current_user_id)]
