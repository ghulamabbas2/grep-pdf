"""Unit tests for the user-facing schema."""

from types import SimpleNamespace

from app.schemas.user import UserOut


def test_user_out_from_attributes() -> None:
    row = SimpleNamespace(id="user_1", email="a@example.com", created_at="ignored")

    user = UserOut.model_validate(row)

    assert user.id == "user_1"
    assert user.email == "a@example.com"


def test_user_out_allows_null_email() -> None:
    row = SimpleNamespace(id="user_1", email=None)

    assert UserOut.model_validate(row).email is None


def test_user_out_serializes_only_public_fields() -> None:
    row = SimpleNamespace(id="user_1", email="a@example.com", created_at="secret")

    assert UserOut.model_validate(row).model_dump() == {
        "id": "user_1",
        "email": "a@example.com",
    }
