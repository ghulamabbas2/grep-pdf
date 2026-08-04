# grep.pdf — API

All backend routes live under `/api/*`, grouped by resource in `backend/app/routers`. Requests and responses use Pydantic models. See [auth.md](auth.md) for token verification and [database.md](database.md) for per-user data scoping.

## Response envelope

Every response uses a consistent envelope:

- **Success** — `{ "data": ... }`
- **Failure** — `{ "error": { "code": ..., "message": ... } }`

`code` is a stable machine-readable identifier; `message` is human-readable.

## Request scoping

Every request is scoped to the signed-in user's id, taken from the **verified Clerk token** — never from the request body or params. Routers pass that id down so every database query is user-scoped.

## Frontend client

- All frontend calls go through a **typed client** in `frontend/src/lib/api.ts`.
- The client attaches the Clerk token, unwraps the `data` envelope on success, and throws/normalizes the `error` envelope on failure.
- **Components never call `fetch` directly** — they use the typed client so auth, typing, and error handling stay in one place.

## Streaming (chat)

Chat responses stream via **Server-Sent Events (SSE)**. Citations arrive as **structured events**, not parsed out of the text — the client consumes citation events directly rather than scraping the message body.
