"""The answer chain: question + retrieved chunks -> streamed cited answer.

All model calls go through LangChain's ``ChatAnthropic`` (never the raw Anthropic
SDK). Citations are typed structured output parsed by the model — not scraped
from prose (docs/llm.md). The chain streams the answer text as it is produced and
resolves the model's source indices back to real chunk pages/ids for citations
(docs/api.md).
"""

from collections.abc import Iterator
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import settings
from app.schemas.chat import AnswerSchema, Citation
from app.services.rag.retriever import RetrievedChunk

# Loaded once at import — edit the text file to change wording (docs/llm.md).
_SYSTEM_PROMPT = (Path(__file__).parent / "prompts" / "answer.txt").read_text()

# Cap answer length; retrieval-grounded answers are short by design.
_MAX_TOKENS = 1024

_model: ChatAnthropic | None = None


def _get_model() -> ChatAnthropic:
    """Lazily build the model so importing this module needs no API key."""
    global _model
    if _model is None:
        _model = ChatAnthropic(
            model=settings.anthropic_model,
            api_key=settings.anthropic_api_key,
            temperature=0,
            max_tokens=_MAX_TOKENS,
        )
    return _model


@dataclass(frozen=True)
class TokenEvent:
    """A delta of the answer text as it streams in."""

    text: str


@dataclass(frozen=True)
class CitationsEvent:
    """The resolved citations, emitted once the answer is complete."""

    citations: list[Citation]


AnswerEvent = TokenEvent | CitationsEvent


def _format_context(question: str, chunks: list[RetrievedChunk]) -> str:
    """Render the retrieved excerpts as numbered sources plus the question."""
    sources = "\n\n".join(
        f"[{index}] (page {chunk.page_number}) {chunk.content}"
        for index, chunk in enumerate(chunks, start=1)
    )
    return f"Question: {question}\n\nSources from the document:\n\n{sources}"


def _resolve_citations(
    data: dict[str, Any], chunks: list[RetrievedChunk]
) -> list[Citation]:
    """Map the model's 1-based source indices back to real chunk pages/ids.

    Citations whose source index is out of range are dropped defensively so a
    hallucinated index can never point at a chunk that wasn't retrieved.
    """
    resolved: list[Citation] = []
    for raw in data.get("citations") or []:
        source = raw.get("source") if isinstance(raw, dict) else None
        quote = raw.get("quote") if isinstance(raw, dict) else None
        if not isinstance(source, int) or not (1 <= source <= len(chunks)):
            continue
        chunk = chunks[source - 1]
        resolved.append(
            Citation(page=chunk.page_number, chunk_id=chunk.id, quote=str(quote or ""))
        )
    return resolved


def stream_answer(
    question: str, chunks: list[RetrievedChunk]
) -> Iterator[AnswerEvent]:
    """Stream the answer to ``question`` grounded in ``chunks``.

    Yields ``TokenEvent`` deltas as the answer text is produced, then a single
    ``CitationsEvent`` once the structured output is complete.
    """
    structured = _get_model().with_structured_output(AnswerSchema)
    messages = [
        SystemMessage(content=_SYSTEM_PROMPT),
        HumanMessage(content=_format_context(question, chunks)),
    ]

    emitted = 0
    final: dict[str, Any] = {}
    for partial in structured.stream(messages):
        data = partial if isinstance(partial, dict) else partial.model_dump()
        answer = data.get("answer") or ""
        if len(answer) > emitted:
            yield TokenEvent(text=answer[emitted:])
            emitted = len(answer)
        final = data

    yield CitationsEvent(citations=_resolve_citations(final, chunks))
