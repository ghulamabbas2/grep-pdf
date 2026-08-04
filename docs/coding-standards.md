# grep.pdf — Coding Standards

Language, formatting, and error-handling rules that apply across the repo. These are conventions the tooling enforces where it can; follow them even where it can't.

## Backend (Python)

- Target **Python 3.12+**.
- **Type hints on every function** — parameters and return type, no exceptions.
- Format with **Ruff**; type-check with **mypy strict**.
- No **`# type: ignore`** without an inline comment explaining why it's needed.

## Frontend (TypeScript)

- **TypeScript strict** mode.
- Format with **Prettier**; lint with **ESLint**.
- No **`any`** — type it properly or use `unknown` and narrow.

## Imports

Order imports in three groups, with a **blank line between groups**:

1. Standard library
2. Third-party
3. Local

## Async

- Use **`async`/`await`** for all async work — **never callbacks**.

## Errors

- Backend: **raise exception classes**, never strings.
- Frontend: **throw `Error` objects** (or subclasses), never strings.
