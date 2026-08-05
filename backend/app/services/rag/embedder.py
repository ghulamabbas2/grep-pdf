"""Chunk embeddings via Voyage ``voyage-3-lite`` at 512 dimensions (docs/rag.md)."""

import voyageai

from app.config import settings
from app.models.chunk import EMBEDDING_DIM
from app.services.rag.exceptions import EmbeddingError

_MODEL = "voyage-3-lite"
# Voyage accepts up to 128 inputs per embed call.
_BATCH_SIZE = 128

_client: voyageai.Client | None = None


def _get_client() -> voyageai.Client:
    """Lazily build the Voyage client so importing this module needs no key."""
    global _client
    if _client is None:
        _client = voyageai.Client(api_key=settings.voyage_api_key)
    return _client


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed chunk texts as document vectors, batching within Voyage's limit.

    Raises ``EmbeddingError`` if the provider call fails.
    """
    client = _get_client()
    embeddings: list[list[float]] = []
    try:
        for start in range(0, len(texts), _BATCH_SIZE):
            batch = texts[start : start + _BATCH_SIZE]
            result = client.embed(
                batch,
                model=_MODEL,
                input_type="document",
                output_dimension=EMBEDDING_DIM,
            )
            embeddings.extend(result.embeddings)
    except Exception as exc:
        raise EmbeddingError(str(exc)) from exc
    return embeddings


def embed_query(text: str) -> list[float]:
    """Embed a search query for retrieval (``input_type="query"``, 512-dim).

    Symmetric with ``embed_texts`` but uses the query embedding type so the
    vector is comparable to the stored document chunks. Raises ``EmbeddingError``
    if the provider call fails.
    """
    client = _get_client()
    try:
        result = client.embed(
            [text],
            model=_MODEL,
            input_type="query",
            output_dimension=EMBEDDING_DIM,
        )
    except Exception as exc:
        raise EmbeddingError(str(exc)) from exc
    return result.embeddings[0]
