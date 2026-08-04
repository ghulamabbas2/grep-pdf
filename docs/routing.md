# grep.pdf — Routing

How URLs map to views on the frontend and to handlers on the backend. See [auth.md](auth.md) for how Clerk guards protected routes and [api.md](api.md) for the `/api/*` envelope and client.

## Frontend routes

The frontend uses **React Router**. Four application routes plus Clerk's hosted auth pages:

| Path | View | Access |
| --- | --- | --- |
| `/` | Landing | Public |
| `/dashboard` | Sessions list | Protected |
| `/chat/:sessionId` | Chat view | Protected |
| `/sign-in` | Clerk-hosted sign-in | Public |
| `/sign-up` | Clerk-hosted sign-up | Public |

- **Protected routes** are wrapped in a **ClerkProvider guard** that redirects unauthenticated users to `/sign-in`.
- `/sign-in` and `/sign-up` are **Clerk-hosted** — the app links to them rather than rendering its own auth forms.

## Backend routes

- All backend routes live under **`/api/*`**.
- Handlers are **grouped by resource** in `backend/app/routers`.
- **`/api/health`** is the **only unauthenticated route** — every other `/api/*` route requires a verified Clerk token (see [auth.md](auth.md)).
