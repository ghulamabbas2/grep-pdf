"""Read/write helpers for the chat view, scoped to the signed-in user.

Follows the ``(db, user_id, ...)`` style of ``services/sessions.py``: every read
and write filters on ``user_id`` (docs/database.md).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.models.message import Message
from app.models.pdf import Pdf
from app.models.session import Session
from app.schemas.chat import Citation, MessageOut, PdfRef, SessionDetailOut


def get_owned_session(
    db: DbSession, user_id: str, session_id: uuid.UUID
) -> Session | None:
    """Return the user's session, or ``None`` if it isn't theirs / doesn't exist."""
    stmt = select(Session).where(Session.id == session_id, Session.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def get_owned_pdf(db: DbSession, user_id: str, pdf_id: uuid.UUID) -> Pdf | None:
    """Return the user's PDF, or ``None`` if it isn't theirs / doesn't exist."""
    stmt = select(Pdf).where(Pdf.id == pdf_id, Pdf.user_id == user_id)
    return db.execute(stmt).scalar_one_or_none()


def _to_citations(raw: list[dict[str, object]] | None) -> list[Citation] | None:
    """Parse the persisted JSON citations back into typed ``Citation`` models."""
    if raw is None:
        return None
    return [Citation.model_validate(item) for item in raw]


def get_session_detail(
    db: DbSession, user_id: str, session_id: uuid.UUID
) -> SessionDetailOut | None:
    """Return a session with its PDF and full message history, or ``None``.

    Messages are ordered oldest-first so the chat renders in reading order.
    """
    session = get_owned_session(db, user_id, session_id)
    if session is None:
        return None

    pdf_ref: PdfRef | None = None
    if session.pdf_id is not None:
        pdf = get_owned_pdf(db, user_id, session.pdf_id)
        if pdf is not None:
            pdf_ref = PdfRef(
                id=pdf.id,
                filename=pdf.filename,
                num_pages=pdf.num_pages,
                status=pdf.status,
            )

    messages_stmt = (
        select(Message)
        .where(Message.user_id == user_id, Message.session_id == session_id)
        .order_by(Message.created_at.asc())
    )
    messages = [
        MessageOut(
            id=message.id,
            role=message.role,
            content=message.content,
            citations=_to_citations(message.citations),
            created_at=message.created_at,
        )
        for message in db.execute(messages_stmt).scalars().all()
    ]

    return SessionDetailOut(
        id=session.id,
        title=session.title or (pdf_ref.filename if pdf_ref else "Untitled session"),
        pdf=pdf_ref,
        messages=messages,
    )


def add_message(
    db: DbSession,
    user_id: str,
    session_id: uuid.UUID,
    role: str,
    content: str,
    citations: list[Citation] | None = None,
) -> Message:
    """Insert a chat message (user or assistant) and commit.

    Citations are stored as JSON (``page``/``chunk_id``/``quote``) so an
    assistant answer reloads with its sources (docs/llm.md).
    """
    message = Message(
        user_id=user_id,
        session_id=session_id,
        role=role,
        content=content,
        citations=(
            [citation.model_dump(mode="json") for citation in citations]
            if citations is not None
            else None
        ),
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
