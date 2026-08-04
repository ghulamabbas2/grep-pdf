"""Dashboard read models: the session list and the aggregate stats.

Every query filters on ``user_id`` — there are no unscoped reads against user
data (see docs/database.md).
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session as DbSession

from app.models.message import Message
from app.models.pdf import Pdf
from app.models.session import Session
from app.schemas.session import SessionOut
from app.schemas.stats import StatsOut

# Longest preview we render in a session row before truncating.
_PREVIEW_MAX_CHARS = 140


def _preview(content: str | None) -> str | None:
    """Trim an assistant answer down to a single-line row preview."""
    if not content:
        return None
    text = " ".join(content.split())
    if len(text) <= _PREVIEW_MAX_CHARS:
        return text
    return text[: _PREVIEW_MAX_CHARS - 1].rstrip() + "…"


def list_sessions(db: DbSession, user_id: str) -> list[SessionOut]:
    """Return the user's sessions, newest first.

    Each row is joined to its PDF (for the filename) and to that session's most
    recent assistant message (for the answer preview). Both joins are outer:
    a session may have no PDF and no answers yet.
    """
    # DISTINCT ON (session_id), ordered by newest, yields the latest assistant
    # message per session in a single pass.
    latest_answer = (
        select(Message.session_id, Message.content)
        .where(Message.user_id == user_id, Message.role == "assistant")
        .order_by(Message.session_id, Message.created_at.desc())
        .distinct(Message.session_id)
        .subquery()
    )

    stmt = (
        select(Session, Pdf.filename, latest_answer.c.content)
        .outerjoin(Pdf, Session.pdf_id == Pdf.id)
        .outerjoin(latest_answer, latest_answer.c.session_id == Session.id)
        .where(Session.user_id == user_id)
        .order_by(Session.created_at.desc())
    )

    rows = db.execute(stmt).all()
    return [
        SessionOut(
            id=session.id,
            title=session.title or filename or "Untitled session",
            pdf_filename=filename,
            preview=_preview(content),
            created_at=session.created_at,
        )
        for session, filename, content in rows
    ]


def compute_stats(db: DbSession, user_id: str) -> StatsOut:
    """Aggregate the signed-in user's counts for the dashboard stat cards."""
    week_ago = datetime.now(UTC) - timedelta(days=7)

    def _count(stmt: Select[tuple[int]]) -> int:
        return db.execute(stmt).scalar_one()

    sessions_total = _count(
        select(func.count()).select_from(Session).where(Session.user_id == user_id)
    )
    sessions_this_week = _count(
        select(func.count())
        .select_from(Session)
        .where(Session.user_id == user_id, Session.created_at >= week_ago)
    )
    questions_asked = _count(
        select(func.count())
        .select_from(Message)
        .where(Message.user_id == user_id, Message.role == "user")
    )
    answers = _count(
        select(func.count())
        .select_from(Message)
        .where(Message.user_id == user_id, Message.role == "assistant")
    )

    ready_pdfs = (Pdf.user_id == user_id, Pdf.status == "ready")
    pdfs_indexed = _count(select(func.count()).select_from(Pdf).where(*ready_pdfs))
    pages_indexed = _count(
        select(func.coalesce(func.sum(Pdf.num_pages), 0)).where(*ready_pdfs)
    )

    return StatsOut(
        sessions_total=sessions_total,
        sessions_this_week=sessions_this_week,
        questions_asked=questions_asked,
        answers=answers,
        pdfs_indexed=pdfs_indexed,
        pages_indexed=pages_indexed,
    )
