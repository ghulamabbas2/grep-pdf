# grep.pdf — Testing

Two layers of testing: **unit tests** for isolated logic, and **end-to-end QA** driven through Playwright MCP. There is no committed integration or e2e test suite — routes are exercised live via MCP-driven QA, not mocked.

## Unit Tests

Fast, isolated tests for pure logic. They live **next to the file they test**, not in a separate tree.

| Package | Runner | Covers | File pattern |
|---------|--------|--------|--------------|
| Backend | [pytest](https://docs.pytest.org/) | Backend logic — chunking, retrieval, Pydantic schemas | `test_*.py` |
| Frontend | [Vitest](https://vitest.dev/) | Frontend utilities | `*.test.ts` |

- **Backend** — a chunking helper in `backend/app/services/rag/chunking.py` is tested by `backend/app/services/rag/test_chunking.py`.
- **Frontend** — a util in `frontend/src/lib/format.ts` is tested by `frontend/src/lib/format.test.ts`.

## End-to-End QA

E2E and API-level QA runs through **Playwright MCP** — the browser is driven live during a QA session.

- **No `/e2e` folder and no committed `.spec.ts` files.** QA is performed interactively via MCP, not stored as checked-in specs.
- **API routes are tested through MCP-driven QA, not mocked.** Requests hit the real running backend rather than stubbed responses.

## Test Database

QA and any test that touches the database run against a **separate test database**, configured in `backend/.env.test` — **never** the dev or prod database. Point the test run at `.env.test` so QA can read and write freely without affecting real data.

## Rules

- **Every test is independent** — no shared state, no order dependencies. A test must pass on its own and in any order.
- Never rely on data left behind by another test; set up (and, where needed, tear down) what each test requires.
