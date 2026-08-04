"""Schema for the dashboard stat cards."""

from pydantic import BaseModel


class StatsOut(BaseModel):
    """Aggregate counts for the signed-in user, all user-scoped.

    ``answers`` (assistant messages) stands in for the design's "citations"
    metric until citations are tracked in the data model.
    """

    sessions_total: int
    sessions_this_week: int
    questions_asked: int
    answers: int
    pdfs_indexed: int
    pages_indexed: int
