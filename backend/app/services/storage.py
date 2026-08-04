"""Per-user PDF file storage.

Files are written under ``settings.storage_base_path`` in a subfolder named for
the owning user id, so a user's uploads are never resolved into another user's
directory (see docs/security.md). In dev this is a local path; in production it
is the Railway Volume mount.
"""

import re
import uuid
from pathlib import Path

from app.config import settings

# Clerk user ids are already filesystem-safe, but sanitize defensively so a
# crafted id can never escape the per-user directory.
_UNSAFE = re.compile(r"[^A-Za-z0-9_-]")


def _user_dir(user_id: str) -> Path:
    safe = _UNSAFE.sub("_", user_id)
    return Path(settings.storage_base_path) / safe


def save_upload(user_id: str, data: bytes) -> str:
    """Write ``data`` to the user's storage dir and return the file path."""
    directory = _user_dir(user_id)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{uuid.uuid4().hex}.pdf"
    path.write_bytes(data)
    return str(path)
