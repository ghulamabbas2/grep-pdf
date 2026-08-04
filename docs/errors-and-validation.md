# grep.pdf — Errors & Validation

How input is validated and how failures surface to the client. See [api.md](api.md) for the `{ data }` / `{ error }` envelope and the typed frontend client, and [coding-standards.md](coding-standards.md) for the rule that errors are raised as exception classes, never strings.

## Input validation

- All input is validated with **Pydantic at the route boundary** — handlers receive already-validated models, not raw request data.
- Schemas live in **`backend/app/schemas`**.
- Validation failures return **HTTP 422** with the **typed error envelope**.

## Unexpected errors

- Unexpected failures **raise real exception classes** — never strings, never swallowed.
- A **global FastAPI exception handler** catches them, **logs full context server-side** (stack, request context), and returns a **generic message** to the client — internal details never leak in the response.

## Frontend

- The frontend **catches typed errors** from the API client and **renders them inline**, next to the relevant UI rather than as opaque failures.
