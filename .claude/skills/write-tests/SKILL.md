---
name: write-tests
description: Write unit tests for a feature following the project's testing conventions. Use whenever the user asks to write or add tests for a feature, or says "write the tests", "add tests", "test this feature", "cover it with tests". Reads docs/testing.md first, then writes unit tests in the places and style that doc defines. Writes tests only — does not run them, does not run QA, does not commit.
---

# Write Tests

Run this to write **unit tests** for a feature. It writes tests only — it does not run them, does not run QA, and does not commit. Running tests and QA are separate, user-triggered steps.

## Step 1 — Load the testing conventions

Read [testing.md](../../../docs/testing.md) **first**, before writing anything. It is the source of truth for:

- **What gets a unit test** — backend logic (chunking, retrieval, Pydantic schemas) and frontend utilities. E2E/API behavior is covered by MCP-driven QA, not by tests written here.
- **Which runner** — pytest for the backend, Vitest for the frontend.
- **Where tests live** — next to the file they test, as `test_*.py` (backend) or `*.test.ts` (frontend). Not in a separate tree.
- **The rules** — every test independent, no shared state, no order dependencies.

Do not write tests from memory of these conventions — read the doc and follow what it currently says.

## Step 2 — Find what to test

Identify the feature's testable units — the backend logic and frontend utils it added or changed. Read those source files so the tests match the real signatures and behavior. Skip things testing.md assigns to QA rather than unit tests (live API routes, end-to-end flows); do not mock routes here.

## Step 3 — Write the tests

Write the unit tests in the locations and style testing.md defines:

- Place each test file next to the file it tests, using the correct naming pattern.
- Match the surrounding code's style and idioms.
- Keep each test independent — set up its own data, assume no order, share no state.
- Cover the meaningful cases: expected behavior, edge cases, and validation/error paths for schemas.

**Do not**: run pytest or Vitest, run the QA scenarios, run linters/builds, or commit. Writing the test files is the entire job.

## Step 4 — Stop and hand back

When the tests are written, **stop**. Report in 2–3 lines what was added — the test files created and what they cover. Then hand back. Do not run the tests, QA, or commit on your own.
