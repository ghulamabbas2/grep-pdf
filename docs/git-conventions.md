# grep.pdf — Git Conventions

How commits, branches, and pull requests are structured. See [coding-standards.md](coding-standards.md) for the code rules that changes must satisfy before review.

## Commits

- Follow **Conventional Commits**: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.
- Use a **short, imperative subject** (e.g. `feat: add pdf upload endpoint`, not `added` / `adds`).

## Branches

- Name branches by **type and feature**: `feat/upload-pdf`, `fix/citation-parsing`.
- Each feature is built on **its own branch**.

## Pull requests

- **Never commit straight to `main`** — every change lands through a **pull request**.
- Keep a **clean history**.
- A PR requires the **human review step on the Railway preview URL** before it can be merged.
