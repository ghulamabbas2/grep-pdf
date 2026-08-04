# grep.pdf — Authentication

**Clerk** handles sign-in, sign-up, and session management through its hosted UI. The frontend integrates with `@clerk/react`; the backend verifies Clerk-issued JWTs on every protected route.

## Frontend

- Uses `@clerk/react` for the sign-in / sign-up / session UI and to obtain the current session token.
- Attaches the token as `Authorization: Bearer <token>` on requests to the backend (via the API client in `frontend/src/lib`).

## Backend

FastAPI middleware guards protected routes:

1. Reads the `Authorization: Bearer` header.
2. Verifies the token against **Clerk's JWKS**.
3. On success, attaches the **user id** to the request; on failure, rejects with 401.

## Rules

- **All `/api/*` routes require a valid token**, except `/api/health`, which is public.
- **User id always comes from the verified token — never from the request body**, query params, or any client-supplied value.
- **Every database query is scoped to that user id** (see [database.md](database.md)).
