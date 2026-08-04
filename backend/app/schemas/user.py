"""User-facing schemas."""

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    """Public representation of a user account."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str | None
