"""Schemas for the PDF upload resource."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PdfOut(BaseModel):
    """A stored upload, returned from ``POST /api/pdfs`` before processing."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    filename: str
    status: str
    size_bytes: int
    num_pages: int | None
    created_at: datetime
