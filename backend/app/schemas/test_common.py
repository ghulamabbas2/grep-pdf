"""Unit tests for the shared response-envelope schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.common import DataEnvelope, ErrorBody, ErrorEnvelope


def test_data_envelope_wraps_payload() -> None:
    env = DataEnvelope[int](data=5)

    assert env.data == 5
    assert env.model_dump() == {"data": 5}


def test_data_envelope_validates_generic_type() -> None:
    with pytest.raises(ValidationError):
        DataEnvelope[int](data="not-an-int")


def test_error_envelope_shape() -> None:
    env = ErrorEnvelope(error=ErrorBody(code="unauthorized", message="Nope"))

    assert env.model_dump() == {"error": {"code": "unauthorized", "message": "Nope"}}


def test_error_body_requires_code_and_message() -> None:
    with pytest.raises(ValidationError):
        ErrorBody(code="unauthorized")  # type: ignore[call-arg]
