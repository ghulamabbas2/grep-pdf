"""Token-based chunking (see docs/rag.md).

Each page's text is split into ~800-token windows with a 100-token overlap.
Chunks never span pages, so ``page_number`` plus the ``char_start``/``char_end``
span (character offsets within that page) point back to an exact location.
"""

from dataclasses import dataclass

import tiktoken

from app.services.rag.parser import ParsedPage

CHUNK_TOKENS = 800
OVERLAP_TOKENS = 100
_STEP = CHUNK_TOKENS - OVERLAP_TOKENS

# cl100k_base is a stable, local BPE tokenizer — a good proxy for chunk sizing
# without a network round-trip to the embedding provider.
_encoding = tiktoken.get_encoding("cl100k_base")


@dataclass(frozen=True)
class TextChunk:
    """A chunk of page text with its citation anchors."""

    content: str
    page_number: int
    char_start: int
    char_end: int


def _chunk_page(page: ParsedPage) -> list[TextChunk]:
    tokens = _encoding.encode(page.text)
    if not tokens:
        return []

    chunks: list[TextChunk] = []
    start = 0
    while start < len(tokens):
        window = tokens[start : start + CHUNK_TOKENS]
        content = _encoding.decode(window)
        # Character offsets are derived from decoding the tokens that precede
        # this window, so they line up with the original page text exactly.
        char_start = len(_encoding.decode(tokens[:start]))
        chunk = TextChunk(
            content=content,
            page_number=page.page_number,
            char_start=char_start,
            char_end=char_start + len(content),
        )
        if content.strip():
            chunks.append(chunk)
        if start + CHUNK_TOKENS >= len(tokens):
            break
        start += _STEP
    return chunks


def chunk_pages(pages: list[ParsedPage]) -> list[TextChunk]:
    """Split every page into overlapping token chunks, skipping empty pages."""
    chunks: list[TextChunk] = []
    for page in pages:
        chunks.extend(_chunk_page(page))
    return chunks
