"""Ingestion orchestrator: parse -> chunk -> embed -> persist chunks.

Framework-agnostic business logic (see docs/architecture.md). The caller owns
the transaction — this function flushes new rows but does not commit.
"""

from sqlalchemy import delete
from sqlalchemy.orm import Session as DbSession

from app.models.chunk import Chunk
from app.models.pdf import Pdf
from app.services.rag.chunker import chunk_pages
from app.services.rag.embedder import embed_texts
from app.services.rag.exceptions import EmptyPdfError
from app.services.rag.parser import parse_pdf


def ingest_pdf(db: DbSession, user_id: str, pdf: Pdf) -> None:
    """Parse, chunk, embed and persist chunks for ``pdf``, scoped to ``user_id``.

    Idempotent: any chunks from a previous attempt are removed first, so a retry
    never leaves duplicates. Raises a ``RagError`` subclass on step failure.
    """
    # Clear partial results from an earlier failed attempt (retry path).
    db.execute(delete(Chunk).where(Chunk.pdf_id == pdf.id, Chunk.user_id == user_id))

    parsed = parse_pdf(pdf.storage_path)
    pdf.num_pages = parsed.num_pages

    chunks = chunk_pages(parsed.pages)
    if not chunks:
        raise EmptyPdfError("The PDF has no extractable text to index.")

    embeddings = embed_texts([chunk.content for chunk in chunks])

    db.add_all(
        [
            Chunk(
                user_id=user_id,
                pdf_id=pdf.id,
                content=chunk.content,
                page_number=chunk.page_number,
                char_start=chunk.char_start,
                char_end=chunk.char_end,
                embedding=embedding,
            )
            for chunk, embedding in zip(chunks, embeddings, strict=True)
        ]
    )
    db.flush()
