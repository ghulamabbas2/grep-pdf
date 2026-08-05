"""Chat view routes: session history, the streaming ask endpoint, and PDF file
serving. All scoped to the signed-in user.

The ask endpoint streams via Server-Sent Events (docs/api.md): ``token`` frames
carry answer deltas, a ``citations`` frame carries the resolved sources, and a
final ``done`` frame closes the turn; a failure mid-stream emits an ``error``
frame instead. Citations are structured, not scraped from the text (docs/llm.md).
"""

import json
import logging
import uuid
from collections.abc import Iterator
from pathlib import Path

from fastapi import APIRouter, Depends, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session as DbSession

from app.config import settings
from app.db import SessionLocal, get_db
from app.dependencies import CurrentUser
from app.errors import AppError
from app.rate_limit import limiter
from app.schemas.chat import AskRequest, Citation, SessionDetailOut
from app.schemas.common import DataEnvelope
from app.services import chat as chat_service
from app.services.llm import CitationsEvent, TokenEvent, stream_answer
from app.services.rag.exceptions import EmbeddingError
from app.services.rag.retriever import retrieve

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["chat"])

# Shown when retrieval returns nothing to ground an answer on.
_NO_CONTEXT_ANSWER = "I couldn't find anything in this document to answer that."


def _chat_limit(*_args: object) -> str:
    """Read the per-user chat limit from settings at request time."""
    return settings.chat_rate_limit


def _sse(event: str, data: object) -> str:
    """Format a single Server-Sent Events frame."""
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@router.get("/sessions/{session_id}", response_model=DataEnvelope[SessionDetailOut])
def get_session(
    session_id: uuid.UUID,
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> DataEnvelope[SessionDetailOut]:
    """Return a session with its PDF and full message history for the chat view."""
    detail = chat_service.get_session_detail(db, user.id, session_id)
    if detail is None:
        raise AppError("not_found", "Session not found.", 404)
    return DataEnvelope(data=detail)


@router.post("/sessions/{session_id}/messages")
@limiter.limit(_chat_limit)
def ask(
    request: Request,
    session_id: uuid.UUID,
    body: AskRequest,
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> StreamingResponse:
    """Answer a question about the session's PDF, streaming the cited answer (SSE)."""
    session = chat_service.get_owned_session(db, user.id, session_id)
    if session is None:
        raise AppError("not_found", "Session not found.", 404)
    if session.pdf_id is None:
        raise AppError("no_pdf", "This session has no document to search yet.", 409)

    pdf = chat_service.get_owned_pdf(db, user.id, session.pdf_id)
    if pdf is None or pdf.status != "ready":
        raise AppError("pdf_not_ready", "This document isn't ready to answer questions yet.", 409)

    # Retrieve first, while the request-scoped session is on this thread; the
    # plain dataclasses returned are safe to use inside the worker-thread
    # generator. Retrieving before persisting means a search failure leaves
    # nothing saved, so the client can cleanly drop the optimistic question.
    try:
        chunks = retrieve(db, user.id, pdf.id, body.question)
    except EmbeddingError as exc:
        raise AppError("embed_failed", "Search is temporarily unavailable.", 502) from exc

    # Persist the question now that we know we can answer it. From here on a
    # mid-stream failure keeps the question and surfaces an inline error.
    chat_service.add_message(db, user.id, session_id, "user", body.question)

    user_id = user.id
    question = body.question

    def event_stream() -> Iterator[str]:
        answer_parts: list[str] = []
        citations: list[Citation] = []
        try:
            if not chunks:
                answer_parts.append(_NO_CONTEXT_ANSWER)
                yield _sse("token", {"text": _NO_CONTEXT_ANSWER})
            else:
                for event in stream_answer(question, chunks):
                    if isinstance(event, TokenEvent):
                        answer_parts.append(event.text)
                        yield _sse("token", {"text": event.text})
                    elif isinstance(event, CitationsEvent):
                        citations = event.citations
                        yield _sse(
                            "citations",
                            [c.model_dump(mode="json") for c in citations],
                        )
        except Exception:
            logger.exception("Answer stream failed for session %s", session_id)
            yield _sse(
                "error",
                {"code": "answer_failed", "message": "Something went wrong generating the answer."},
            )
            return

        # Persist the assistant answer with a fresh session — the generator runs
        # in a worker thread and must not reuse the request-scoped session.
        with SessionLocal() as write_db:
            chat_service.add_message(
                write_db,
                user_id,
                session_id,
                "assistant",
                "".join(answer_parts),
                citations or None,
            )
        yield _sse("done", {})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        # Keep tokens flowing promptly: disable client and proxy buffering.
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/pdfs/{pdf_id}/file")
def get_pdf_file(
    pdf_id: uuid.UUID,
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> FileResponse:
    """Serve a user's own PDF for the viewer — never another user's (docs/security.md)."""
    pdf = chat_service.get_owned_pdf(db, user.id, pdf_id)
    if pdf is None:
        raise AppError("not_found", "PDF not found.", 404)
    path = Path(pdf.storage_path)
    if not path.is_file():
        raise AppError("not_found", "PDF file is missing.", 404)
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=pdf.filename,
        content_disposition_type="inline",
    )
