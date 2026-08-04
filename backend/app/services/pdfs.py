"""Write-path service for uploaded PDFs and their sessions.

Follows the user-scoped ``(db, user_id, ...)`` style of ``services/sessions.py``:
every read and write filters on ``user_id`` (see docs/database.md).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.models.pdf import Pdf
from app.models.session import Session


def create_pdf(
    db: DbSession,
    user_id: str,
    *,
    filename: str,
    storage_path: str,
    content_type: str,
    size_bytes: int,
) -> Pdf:
    """Insert a ``pdfs`` row for a freshly stored upload (status ``pending``)."""
    pdf = Pdf(
        user_id=user_id,
        filename=filename,
        storage_path=storage_path,
        content_type=content_type,
        size_bytes=size_bytes,
    )
    db.add(pdf)
    db.commit()
    db.refresh(pdf)
    return pdf


def get_owned_pdf(db: DbSession, user_id: str, pdf_id: uuid.UUID) -> Pdf | None:
    """Return the user's PDF, or ``None`` if it does not exist or isn't theirs."""
    stmt = select(Pdf).where(Pdf.id == pdf_id, Pdf.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def set_status(db: DbSession, pdf: Pdf, status: str) -> None:
    """Update a PDF's ingestion status and commit."""
    pdf.status = status
    db.commit()


def create_session_for_pdf(db: DbSession, user_id: str, pdf: Pdf) -> Session:
    """Create a chat session linking the user to a ready PDF and commit."""
    session = Session(user_id=user_id, pdf_id=pdf.id, title=pdf.filename)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
