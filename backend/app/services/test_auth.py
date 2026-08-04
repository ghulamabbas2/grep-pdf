"""Unit tests for Clerk token verification and user provisioning."""

from unittest.mock import Mock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session as DbSession
from sqlalchemy.orm import sessionmaker

import app.services.auth as auth
from app.models.user import User
from app.services.auth import AuthError, upsert_user, verify_bearer_token


@pytest.fixture
def db() -> DbSession:
    """An isolated in-memory SQLite session with only the `users` table."""
    engine = create_engine("sqlite://")
    User.__table__.create(engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()


def _signed_in(payload: dict[str, object]) -> Mock:
    return Mock(is_signed_in=True, payload=payload, message=None)


def _signed_out(message: str | None = None) -> Mock:
    return Mock(is_signed_in=False, payload=None, message=message)


# --- verify_bearer_token -------------------------------------------------


def test_verify_bearer_token_missing_header_raises() -> None:
    with pytest.raises(AuthError):
        verify_bearer_token(None)


def test_verify_bearer_token_empty_header_raises() -> None:
    with pytest.raises(AuthError):
        verify_bearer_token("")


def test_verify_bearer_token_valid_returns_claims(monkeypatch: pytest.MonkeyPatch) -> None:
    claims = {"sub": "user_abc", "email": "a@example.com"}
    monkeypatch.setattr(
        auth._clerk, "authenticate_request", lambda *a, **k: _signed_in(claims)
    )

    assert verify_bearer_token("Bearer token") == claims


def test_verify_bearer_token_not_signed_in_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        auth._clerk, "authenticate_request", lambda *a, **k: _signed_out("expired")
    )

    with pytest.raises(AuthError, match="expired"):
        verify_bearer_token("Bearer stale")


def test_verify_bearer_token_no_payload_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    state = Mock(is_signed_in=True, payload=None, message=None)
    monkeypatch.setattr(auth._clerk, "authenticate_request", lambda *a, **k: state)

    with pytest.raises(AuthError):
        verify_bearer_token("Bearer weird")


# --- upsert_user ---------------------------------------------------------


def test_upsert_user_creates_new_row(db: DbSession) -> None:
    user = upsert_user(db, "user_1", "new@example.com")

    assert user.id == "user_1"
    assert user.email == "new@example.com"
    assert db.query(User).count() == 1


def test_upsert_user_creates_with_null_email(db: DbSession) -> None:
    user = upsert_user(db, "user_1", None)

    assert user.email is None


def test_upsert_user_returns_existing_without_duplicate(db: DbSession) -> None:
    first = upsert_user(db, "user_1", "same@example.com")
    second = upsert_user(db, "user_1", "same@example.com")

    assert second.id == first.id
    assert db.query(User).count() == 1


def test_upsert_user_updates_changed_email(db: DbSession) -> None:
    upsert_user(db, "user_1", "old@example.com")
    updated = upsert_user(db, "user_1", "fresh@example.com")

    assert updated.email == "fresh@example.com"
    assert db.query(User).count() == 1


def test_upsert_user_keeps_email_when_new_is_none(db: DbSession) -> None:
    upsert_user(db, "user_1", "keep@example.com")
    updated = upsert_user(db, "user_1", None)

    assert updated.email == "keep@example.com"
