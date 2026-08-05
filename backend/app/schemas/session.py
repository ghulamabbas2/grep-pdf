"""Schemas for the sessions list shown on the dashboard."""

import uuid
from datetime import datetime

from pydantic import BaseModel


class SessionOut(BaseModel):
    """One row in the dashboard session list.

    ``pdf_filename``, ``preview`` and ``preview_quote`` are nullable: a session
    may exist before a PDF is attached or before it has any assistant answer to
    preview. ``preview_quote`` is the cited line from the latest answer, so the
    dashboard can highlight it within the preview.
    """

    id: uuid.UUID
    title: str
    pdf_filename: str | None
    preview: str | None
    preview_quote: str | None
    created_at: datetime
