"""Schema for the dashboard stat cards."""

from pydantic import BaseModel


class StatsOut(BaseModel):
    """Aggregate counts for the signed-in user, all user-scoped."""

    sessions_total: int
    sessions_this_week: int
    questions_asked: int
    answers: int
    # Total citations across every assistant answer (the "citations found" card).
    citations_found: int
    pdfs_indexed: int
    pages_indexed: int
