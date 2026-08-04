---
name: create-feature
description: Build a feature from an approved plan. Use once a plan has been approved and it's time to write the code — whenever the user starts building, implementing, or coding an approved feature, or says "build it", "implement the plan", "start coding". Reads the approved plan and the relevant /docs, pulls live library docs via Context7, then writes code only. Does not write tests, run QA, or commit.
---

# Create Feature

Run this **after a plan is approved** to build the feature. It writes code only — no tests, no QA, no commits. Those are separate, user-triggered steps (`write-tests`, `run-qa-suite`).

## Step 1 — Load the approved plan

1. Run `git branch --show-current` and read the approved plan at `./plans/<current-branch>.md`.
2. If no plan file exists for the current branch → **stop** and tell the user to run `plan-feature` and get a plan approved first. Do not start building from an unwritten plan.
3. Treat the plan's **Files to create or change** list as the scope of work. Build exactly that — no more, no less. If reality diverges from the plan mid-build, pause and surface it rather than silently expanding scope.

## Step 2 — Ground the build in project conventions

Before writing code, read the docs the plan references and any others relevant to the files you're touching. At minimum:

- [architecture.md](../../../docs/architecture.md) — where files go and naming conventions.
- [api.md](../../../docs/api.md) — `/api/*` routers, the `{ data }` / `{ error }` envelope, the typed frontend client, SSE.
- [database.md](../../../docs/database.md) — models, migrations, per-user scoping, indexing.
- [coding-standards.md](../../../docs/coding-standards.md) — Python type hints + Ruff/mypy, TypeScript strict + Prettier/ESLint, imports, async/await, raising exception classes / throwing Error objects.

Pull in the feature-area docs as applicable: [auth.md](../../../docs/auth.md), [routing.md](../../../docs/routing.md), [errors-and-validation.md](../../../docs/errors-and-validation.md), [design-system.md](../../../docs/design-system.md), [ui.md](../../../docs/ui.md), [llm.md](../../../docs/llm.md), [rag.md](../../../docs/rag.md), [security.md](../../../docs/security.md).

## Step 3 — Pull live library docs (Context7)

For any pinned library the feature touches — FastAPI, SQLAlchemy, Alembic, pgvector, LangChain, Pydantic, Clerk, React Router, Vite — fetch current documentation through Context7 before writing code against its API. Do not rely on training data for signatures, config, or version-specific behavior. If Context7 has no entry for a library, say so explicitly before proceeding.

## Step 4 — Build

Write the code for the files in the plan, following the conventions above:

- Keep backend routes under `/api`; use the `{ data }` / `{ error }` envelope; scope queries per user.
- Match the surrounding code's style, naming, and idioms.
- Full type hints (Python) and strict types (TypeScript); raise exception classes / throw Error objects, never strings.
- Add new allowed origins via `cors_origins`, config via the `settings` singleton — never hardcode.

**Do not**: write tests, run the QA scenarios, run linters/builds as a gate, or commit. Writing code is the entire job.

## Step 5 — Stop and hand back

When the code is written, **stop**. Report in 2–3 lines what was built (the files created/changed and the capability added). Then hand back — remind the user that `write-tests` and `run-qa-suite` are the next steps when they're ready. Do not proceed to them on your own.
