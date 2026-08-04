# grep.pdf — Security

Baseline security practices across the stack. See [auth.md](auth.md) for token verification and per-user scoping, [errors-and-validation.md](errors-and-validation.md) for how failures avoid leaking internals, and [database.md](database.md) for per-user query scoping.

## Secrets

- Secrets live in **environment variables** — never in code or committed to the repo.
- **`.env` is gitignored**; **`.env.example`** is checked in as a template (see [CLAUDE.md](../CLAUDE.md) for per-package env setup).

## Security headers

Set via **FastAPI middleware** on every response:

- **Content-Security-Policy (CSP)**
- **X-Frame-Options**
- **Referrer-Policy**

## Rate limiting

- **PDF uploads** and **chat messages** are rate limited **per user** to stop abuse.

## Uploaded PDFs

- **Validated before processing** — checked by **content type** and **size**.
- **Stored on Railway Volumes, scoped by user id**.
- **Never served directly to other users** — a user can only access their own files.
