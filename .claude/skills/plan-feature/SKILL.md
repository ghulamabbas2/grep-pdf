---
name: plan-feature
description: Plan and scope a new feature before any code is written. Use at the very start of any new feature or change — whenever the user starts planning, scoping, or describing a feature to build, or asks "how should we build X". Enters Plan Mode, produces a short technical plan referencing the /docs conventions, waits for explicit approval, then writes the approved plan to ./plans/<branch>.md.
---

# Plan Feature

Run this at the start of **every** new feature, before writing any code. It produces a short, conventions-aligned technical plan, waits for explicit approval, and only then persists the plan and allows implementation.

## Step 1 — Enter Plan Mode

Call `EnterPlanMode` immediately. Do **not** write, edit, or create any code files until the plan is approved. Research (reading files, searching) is allowed; changes are not.

## Step 2 — Ground the plan in project conventions

Before drafting, read the docs relevant to this feature so the plan stays consistent with established conventions. Always consult:

- [architecture.md](../../../docs/architecture.md) — where files go (backend routers/services/models/schemas, frontend features/shared/api).
- [api.md](../../../docs/api.md) — route grouping under `/api/*`, the `{ data }` / `{ error }` envelope, the typed frontend client, SSE conventions.
- [database.md](../../../docs/database.md) — models, migrations, per-user query scoping, indexing.

Then pull in the docs matching the feature area, e.g.:

- Auth / protected routes → [auth.md](../../../docs/auth.md), [routing.md](../../../docs/routing.md)
- Validation / error surfaces → [errors-and-validation.md](../../../docs/errors-and-validation.md)
- UI / styling → [design-system.md](../../../docs/design-system.md), [ui.md](../../../docs/ui.md)
- LLM / RAG → [llm.md](../../../docs/llm.md), [rag.md](../../../docs/rag.md)
- Secrets / headers / file handling / rate limits → [security.md](../../../docs/security.md)
- Commits / branches / PRs → [git-conventions.md](../../../docs/git-conventions.md)
- Language / formatting rules → [coding-standards.md](../../../docs/coding-standards.md)

If the feature touches a library the project pins (FastAPI, SQLAlchemy, Alembic, pgvector, LangChain, Pydantic, Clerk, React Router, Vite), pull current docs via Context7 before relying on API details.

## Step 3 — Draft the plan

Keep it short and concrete. Structure:

1. **Summary** — one or two sentences on what the feature does.
2. **Files to create or change** — a bulleted list of paths, each with a one-line note on what it does and which doc convention it follows (cite the doc, e.g. "new router under `/api`, `{ data }` envelope per api.md").
3. **Approach** — brief notes on data flow, new models/migrations, routes, and UI, only as needed to make the file list make sense.
4. **QA Scenarios** — see Step 4.

## Step 4 — QA Scenarios (required, ends the plan)

End the plan with a **QA Scenarios** section: 3–6 concrete scenarios. Cover at minimum:

- **Happy path** — the feature working as intended.
- **Auth boundary** — an unauthenticated or wrong-user request is rejected.
- **Validation** — bad/malformed input returns the typed 422 error.
- **Edge cases** — empty results, oversized input, duplicates, concurrent actions, etc.

One line each: what the user does → what should happen.

## Step 5 — Present and wait for approval

Present the plan via `ExitPlanMode` and **stop**. Write no code until the user explicitly approves. If they request changes, revise and re-present.

## Step 6 — On approval, persist the plan

Once the user approves:

1. Run `git branch --show-current`.
2. If the branch is `main`, `master`, or empty → **stop** and tell the user to check out a feature branch first (see git-conventions.md for the `feat/<name>` convention). Do not write the plan or any code.
3. Otherwise, ensure `./plans/` exists (create it if not) and write the full approved plan to `./plans/<current-branch>.md`.
4. Confirm the path written, then proceed with implementation.
