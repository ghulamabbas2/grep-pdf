"""Schemas for the sessions list shown on the dashboard."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class SessionOut(BaseModel):
    """One row in the dashboard session list.

    ``pdf_filename`` and ``preview`` are nullable: a session may exist before a
    PDF is attached or before it has any assistant answer to preview.
    """

    id: uuid.UUID
    title: str
    pdf_filename: str | None
    preview: str | None
    created_at: datetime
