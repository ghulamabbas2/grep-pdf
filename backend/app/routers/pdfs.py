"""PDF upload + ingestion routes. Scoped to the signed-in user.

Two-phase flow (see plans/feat/upload-pdf.md):

* ``POST /api/pdfs`` — validate + store the file, return the ``pdfs`` row.
* ``POST /api/pdfs/{pdf_id}/process`` — parse/chunk/embed, create a session,
  and return it. Retry re-calls only this endpoint; the stored file is reused
  and any partial chunks are cleared before re-ingest.
"""

import uuid

from fastapi import APIRouter, Depends, File, Request, UploadFile
from sqlalchemy.orm import Session as DbSession

from app.config import settings
from app.db import get_db
from app.dependencies import CurrentUser
from app.errors import AppError
from app.models.pdf import Pdf
from app.rate_limit import limiter
from app.schemas.common import DataEnvelope
from app.schemas.pdf import PdfOut
from app.schemas.session import SessionOut
from app.services import pdfs as pdfs_service
from app.services import storage
from app.services.rag.exceptions import EmbeddingError, EmptyPdfError, PdfParseError
from app.services.rag.ingest import ingest_pdf

router = APIRouter(prefix="/api", tags=["pdfs"])

_PDF_MAGIC = b"%PDF"
_READ_CHUNK = 1024 * 1024


def _upload_limit(*_args: object) -> str:
    """Read the per-user upload limit from settings at request time."""
    return settings.upload_rate_limit


def _process_limit(*_args: object) -> str:
    """Read the per-user process limit from settings at request time."""
    return settings.process_rate_limit


def _too_large() -> AppError:
    max_mb = settings.max_upload_bytes // (1024 * 1024)
    return AppError("file_too_large", f"The PDF exceeds the {max_mb} MB limit.", 422)


def _read_within_limit(file: UploadFile, request: Request) -> bytes:
    """Read the upload in bounded chunks, aborting past ``max_upload_bytes``.

    Enforces the size limit *before* the whole body is buffered so an oversized
    request cannot exhaust memory (docs/security.md). The ``Content-Length``
    header gives an early reject; the chunked read is the authoritative check.
    """
    declared = request.headers.get("content-length")
    if declared is not None and declared.isdigit() and int(declared) > settings.max_upload_bytes:
        raise _too_large()

    parts: list[bytes] = []
    total = 0
    while chunk := file.file.read(_READ_CHUNK):
        total += len(chunk)
        if total > settings.max_upload_bytes:
            raise _too_large()
        parts.append(chunk)
    return b"".join(parts)


def _validate_pdf(file: UploadFile, data: bytes) -> None:
    """Reject anything that isn't a non-empty PDF (docs/security.md)."""
    if len(data) == 0:
        raise AppError("invalid_file", "The uploaded file is empty.", 422)
    if file.content_type != "application/pdf" or not data.startswith(_PDF_MAGIC):
        raise AppError("invalid_file", "Only PDF files are accepted.", 422)


@router.post("/pdfs", response_model=DataEnvelope[PdfOut])
@limiter.limit(_upload_limit)
def upload_pdf(
    request: Request,
    user: CurrentUser,
    file: UploadFile = File(...),
    db: DbSession = Depends(get_db),
) -> DataEnvelope[PdfOut]:
    """Phase 1: validate and store the upload, returning its ``pdfs`` row."""
    data = _read_within_limit(file, request)
    _validate_pdf(file, data)

    storage_path = storage.save_upload(user.id, data)
    pdf = pdfs_service.create_pdf(
        db,
        user.id,
        filename=file.filename or "document.pdf",
        storage_path=storage_path,
        content_type=file.content_type or "application/pdf",
        size_bytes=len(data),
    )
    return DataEnvelope(data=PdfOut.model_validate(pdf))


@router.post("/pdfs/{pdf_id}/process", response_model=DataEnvelope[SessionOut])
@limiter.limit(_process_limit)
def process_pdf(
    request: Request,
    pdf_id: uuid.UUID,
    user: CurrentUser,
    db: DbSession = Depends(get_db),
) -> DataEnvelope[SessionOut]:
    """Phase 2: parse/chunk/embed the stored PDF, then create its session."""
    pdf = pdfs_service.get_owned_pdf(db, user.id, pdf_id)
    if pdf is None:
        raise AppError("not_found", "PDF not found.", 404)

    pdfs_service.set_status(db, pdf, "processing")
    try:
        ingest_pdf(db, user.id, pdf)
    except PdfParseError as exc:
        _fail(db, pdf)
        raise AppError("parse_failed", "We couldn't read that PDF.", 422) from exc
    except EmptyPdfError as exc:
        _fail(db, pdf)
        raise AppError(
            "empty_pdf", "That PDF has no selectable text to index.", 422
        ) from exc
    except EmbeddingError as exc:
        _fail(db, pdf)
        raise AppError(
            "embed_failed", "Indexing failed while embedding the document.", 502
        ) from exc

    pdf.status = "ready"
    session = pdfs_service.create_session_for_pdf(db, user.id, pdf)

    return DataEnvelope(
        data=SessionOut(
            id=session.id,
            title=session.title or pdf.filename,
            pdf_filename=pdf.filename,
            preview=None,
            preview_quote=None,
            created_at=session.created_at,
        )
    )


def _fail(db: DbSession, pdf: Pdf) -> None:
    """Roll back partial ingest work and mark the PDF failed so retry is clean."""
    db.rollback()
    pdfs_service.set_status(db, pdf, "failed")
