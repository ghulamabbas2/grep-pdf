"""Domain exceptions for the ingestion pipeline.

Each step raises a distinct class so the router can map failures onto a stable
error code (``parse_failed`` / ``embed_failed`` / ``empty_pdf``) and tell the
user which step to retry (see docs/errors-and-validation.md).
"""


class RagError(Exception):
    """Base class for ingestion failures."""


class PdfParseError(RagError):
    """The PDF could not be opened or its text could not be extracted."""


class EmptyPdfError(RagError):
    """The PDF parsed but yielded no extractable text to index."""


class EmbeddingError(RagError):
    """The embedding provider call failed."""
