"""Shared response envelope models (see docs/api.md).

Success responses are wrapped as ``{ "data": ... }`` and failures as
``{ "error": { "code": ..., "message": ... } }``.
"""

from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class DataEnvelope(BaseModel, Generic[T]):
    """Success envelope: ``{ "data": <payload> }``."""

    data: T


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorEnvelope(BaseModel):
    """Failure envelope: ``{ "error": { "code": ..., "message": ... } }``."""

    error: ErrorBody
