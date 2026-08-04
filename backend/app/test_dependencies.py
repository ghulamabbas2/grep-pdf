"""Unit tests for the authenticated-route FastAPI dependencies."""

from collections.abc import Callable

import pytest

import app.dependencies as deps
from app.dependencies import _subject_claim, get_current_user, get_current_user_id
from app.services.auth import AuthError

# --- _subject_claim ------------------------------------------------------


def test_subject_claim_returns_sub() -> None:
    assert _subject_claim({"sub": "user_1"}) == "user_1"


def test_subject_claim_missing_raises() -> None:
    with pytest.raises(AuthError):
        _subject_claim({})


def test_subject_claim_empty_raises() -> None:
    with pytest.raises(AuthError):
        _subject_claim({"sub": ""})


def test_subject_claim_non_string_raises() -> None:
    with pytest.raises(AuthError):
        _subject_claim({"sub": 123})


# --- get_current_user_id -------------------------------------------------


def test_get_current_user_id_returns_token_subject(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(deps, "verify_bearer_token", lambda auth: {"sub": "user_42"})

    assert get_current_user_id("Bearer good") == "user_42"


def test_get_current_user_id_propagates_auth_error(monkeypatch: pytest.MonkeyPatch) -> None:
    def _raise(_auth: str | None) -> dict[str, object]:
        raise AuthError("bad token")

    monkeypatch.setattr(deps, "verify_bearer_token", _raise)

    with pytest.raises(AuthError):
        get_current_user_id(None)


# --- get_current_user ----------------------------------------------------


def _capture_resolved_email(
    monkeypatch: pytest.MonkeyPatch, captured: dict[str, object]
) -> None:
    """Stub `upsert_user` to run the resolver and record what it produced."""

    def _fake_upsert(
        db: object, user_id: str, resolve_email: Callable[[], str | None]
    ) -> str:
        captured["db"] = db
        captured["user_id"] = user_id
        captured["email"] = resolve_email()
        return "user-row"

    monkeypatch.setattr(deps, "upsert_user", _fake_upsert)


def test_get_current_user_prefers_email_claim(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        deps,
        "verify_bearer_token",
        lambda auth: {"sub": "user_7", "email": "a@example.com"},
    )

    def _fail_fetch(_user_id: str) -> str | None:
        raise AssertionError("Clerk should not be queried when the token has an email")

    monkeypatch.setattr(deps, "fetch_primary_email", _fail_fetch)
    captured: dict[str, object] = {}
    _capture_resolved_email(monkeypatch, captured)

    result = get_current_user("Bearer good", db="session")

    assert result == "user-row"
    assert captured == {"db": "session", "user_id": "user_7", "email": "a@example.com"}


def test_get_current_user_falls_back_to_clerk_when_claim_absent(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(deps, "verify_bearer_token", lambda auth: {"sub": "user_7"})
    fetched_for: dict[str, object] = {}

    def _fake_fetch(user_id: str) -> str | None:
        fetched_for["user_id"] = user_id
        return "clerk@example.com"

    monkeypatch.setattr(deps, "fetch_primary_email", _fake_fetch)
    captured: dict[str, object] = {}
    _capture_resolved_email(monkeypatch, captured)

    get_current_user("Bearer good", db="session")

    assert fetched_for["user_id"] == "user_7"
    assert captured["email"] == "clerk@example.com"


def test_get_current_user_email_none_when_clerk_has_none(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(deps, "verify_bearer_token", lambda auth: {"sub": "user_7"})
    monkeypatch.setattr(deps, "fetch_primary_email", lambda user_id: None)
    captured: dict[str, object] = {}
    _capture_resolved_email(monkeypatch, captured)

    get_current_user("Bearer good", db="session")

    assert captured["email"] is None


def test_get_current_user_ignores_non_string_email(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        deps, "verify_bearer_token", lambda auth: {"sub": "user_7", "email": 999}
    )
    monkeypatch.setattr(deps, "fetch_primary_email", lambda user_id: "clerk@example.com")
    captured: dict[str, object] = {}
    _capture_resolved_email(monkeypatch, captured)

    get_current_user("Bearer good", db="session")

    # A non-string claim is ignored, so resolution falls back to Clerk.
    assert captured["email"] == "clerk@example.com"
