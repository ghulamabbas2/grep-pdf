"""Retrieval: embed a question and fetch the most similar chunks.

Cosine similarity over pgvector, scoped to one user's copy of one PDF so
retrieval never crosses documents or users (docs/rag.md, docs/database.md).
Returns plain dataclasses detached from the ORM/session so callers (and the
streaming generator) don't touch a live SQLAlchemy session.
"""

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session as DbSession

from app.models.chunk import Chunk
from app.services.rag.embedder import embed_query

# Top-k chunks returned per query (docs/rag.md).
TOP_K = 6


@dataclass(frozen=True)
class RetrievedChunk:
    """One retrieved excerpt, with its citation anchor (page)."""

    id: uuid.UUID
    page_number: int
    content: str


def retrieve(
    db: DbSession,
    user_id: str,
    pdf_id: uuid.UUID,
    query: str,
    k: int = TOP_K,
) -> list[RetrievedChunk]:
    """Return the ``k`` chunks most similar to ``query`` for this user's PDF."""
    query_vec = embed_query(query)
    stmt = (
        select(Chunk)
        .where(Chunk.user_id == user_id, Chunk.pdf_id == pdf_id)
        .order_by(Chunk.embedding.cosine_distance(query_vec))
        .limit(k)
    )
    chunks = db.execute(stmt).scalars().all()
    return [
        RetrievedChunk(id=chunk.id, page_number=chunk.page_number, content=chunk.content)
        for chunk in chunks
    ]
