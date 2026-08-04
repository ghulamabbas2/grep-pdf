"""Per-user rate limiting via slowapi (see docs/security.md).

The limit bucket is keyed by the Clerk user id read from the bearer token. The
``sub`` claim is decoded *without* verifying the signature — this is only used
to group requests for throttling; the route's ``CurrentUser`` dependency still
fully verifies the token. Malformed/absent tokens fall back to the client IP.
"""

import base64
import binascii
import json

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request


def _user_key(request: Request) -> str:
    header = request.headers.get("authorization", "")
    if header.lower().startswith("bearer "):
        parts = header[7:].split(".")
        if len(parts) == 3:  # noqa: PLR2004 — JWT is header.payload.signature
            try:
                padded = parts[1] + "=" * (-len(parts[1]) % 4)
                claims = json.loads(base64.urlsafe_b64decode(padded))
                sub = claims.get("sub")
                if isinstance(sub, str) and sub:
                    return f"user:{sub}"
            except (ValueError, binascii.Error, json.JSONDecodeError):
                pass
    return get_remote_address(request)


limiter = Limiter(key_func=_user_key)
