"""Schemas for the chat view: the ask request, citations, and session detail.

Validation lives at the route boundary (docs/errors-and-validation.md); the LLM
structured-output shape (``AnswerSchema``) is separate from the API/persisted
citation shape (``Citation``) so the model cites by a small source index rather
than echoing UUIDs back (see docs/llm.md).
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

# Longest question we accept before returning a 422.
_MAX_QUESTION_CHARS = 2000


class AskRequest(BaseModel):
    """Body for ``POST /api/sessions/{id}/messages``."""

    question: str = Field(min_length=1, max_length=_MAX_QUESTION_CHARS)

    @field_validator("question")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Question must not be blank.")
        return stripped


class LlmCitation(BaseModel):
    """One citation as returned by the model (structured output).

    ``source`` is the 1-based index of the retrieved excerpt the claim came from;
    the page number and chunk id are resolved server-side from that excerpt.
    """

    source: int = Field(description="1-based index of the source excerpt this claim came from.")
    quote: str = Field(
        description="A short verbatim sentence from that excerpt supporting the claim."
    )


class AnswerSchema(BaseModel):
    """The answer chain's structured output (``with_structured_output`` target)."""

    answer: str = Field(description="The plain, direct answer to the user's question.")
    citations: list[LlmCitation] = Field(
        default_factory=list,
        description="Citations backing the answer; empty if the excerpts don't answer it.",
    )


class Citation(BaseModel):
    """A citation as sent to the client and persisted on the message."""

    page: int
    chunk_id: uuid.UUID
    quote: str


class PdfRef(BaseModel):
    """The PDF a chat session is bound to."""

    id: uuid.UUID
    filename: str
    num_pages: int | None
    status: str


class MessageOut(BaseModel):
    """One message in a session's history."""

    id: uuid.UUID
    role: str
    content: str
    citations: list[Citation] | None
    created_at: datetime


class SessionDetailOut(BaseModel):
    """A session plus its PDF and full message history, for the chat view."""

    id: uuid.UUID
    title: str
    pdf: PdfRef | None
    messages: list[MessageOut]
