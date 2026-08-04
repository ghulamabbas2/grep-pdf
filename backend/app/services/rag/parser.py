"""PDF parsing with PyMuPDF (see docs/rag.md).

Extracts plain text per page, preserving 1-based page numbers for citations.
"""

from dataclasses import dataclass

import pymupdf

from app.services.rag.exceptions import PdfParseError


@dataclass(frozen=True)
class ParsedPage:
    """One page's extracted text. ``page_number`` is 1-based for citations."""

    page_number: int
    text: str


@dataclass(frozen=True)
class ParsedPdf:
    """Result of parsing a PDF: every page's text plus the total page count."""

    num_pages: int
    pages: list[ParsedPage]


def parse_pdf(path: str) -> ParsedPdf:
    """Open ``path`` and extract text for every page.

    Raises ``PdfParseError`` if the file is missing, not a readable PDF, or
    otherwise cannot be parsed.
    """
    try:
        with pymupdf.open(path) as doc:
            pages = [
                ParsedPage(page_number=index + 1, text=page.get_text())
                for index, page in enumerate(doc)
            ]
            return ParsedPdf(num_pages=doc.page_count, pages=pages)
    except (pymupdf.FileDataError, FileNotFoundError, RuntimeError, ValueError) as exc:
        raise PdfParseError(str(exc)) from exc
