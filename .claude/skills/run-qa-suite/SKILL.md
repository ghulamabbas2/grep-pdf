---
name: run-qa-suite
description: Run the QA Scenarios from the current branch's plan against the local dev server using Playwright MCP. Use whenever the user asks to run QA, run the QA suite, verify a feature, or check that a feature works end-to-end in the browser. Reads ./plans/<current-branch>.md, drives each scenario through the browser, and reports pass/fail per scenario with the failure reason for any that failed. QA only — does not write tests, fix code, or commit.
---

# Run QA Suite

Run this to execute the **QA Scenarios** from the current branch's plan end-to-end through the browser using Playwright MCP, then report results. This is **QA only**: it does not write tests, does not fix code, and does not commit. If scenarios fail, stop and hand back — the user decides what to fix next.

## Step 1 — Locate and read the plan

Get the current branch and read its plan file:

```bash
git rev-parse --abbrev-ref HEAD
```

Read `./plans/<current-branch>.md` (e.g. branch `feat/auth` → `./plans/feat/auth.md`). Find the **QA Scenarios** section. If the plan file or that section is missing, stop and say so — there is nothing to run. Also read the plan's **Verification** section for setup context (deps, env vars, how to reach protected routes, how to check the DB).

Parse each numbered scenario into: what to set up, the steps to perform, and the expected result (the pass condition).

## Step 2 — Confirm the dev server is up

QA runs against the **local dev server**, not a build. Check that it's reachable (frontend :5173, backend :8000):

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health
```

If either is down, tell the user to start it with `npm run dev` (from the repo root) and stop. Do not start it yourself in the background and assume it's ready — confirm both respond first.

## Step 3 — Execute each scenario through the browser

Drive every scenario end-to-end with Playwright MCP (`mcp__playwright__browser_*`) against the real running app, following exactly what the scenario describes:

- Navigate, click, type, and fill forms as the scenario's steps require. Use `browser_snapshot` to read page state before acting on it.
- For steps that hit the API directly (e.g. calling a protected route with a token, or a forged-id request), use the app's real network path — the Vite `/api` proxy — via the browser, per the plan's Verification notes. Do not mock routes or stub responses; QA exercises the unmocked stack.
- For steps that assert backend/DB state (e.g. a row was upserted), verify it the way Verification describes (e.g. `docker compose exec db psql`).
- Check the actual expected result for each scenario — the specific status code, envelope shape, visible UI, redirect, or DB row the scenario names. A scenario passes only if its stated expectation is met.
- Capture the concrete evidence you observed (status code, response body, snapshot text, screenshot, query result) so the failure reason is specific if it fails.

Run scenarios independently — reset relevant state (sign out, fresh navigation) between them so one scenario's leftovers don't taint the next. Work through all of them even if an early one fails; don't stop at the first failure.

## Step 4 — Report results and hand back

When every scenario has run, **stop** and report:

- A **pass/fail line per scenario** (number + short name), most useful first.
- For each **failure**, the specific reason: what was expected vs. what actually happened, with the evidence you captured (status/body/snapshot/query).
- A one-line summary (e.g. `4/6 passed`).

Then hand back. **Do not** fix code, write or adjust tests, re-run selectively to "make it pass," or commit. If scenarios failed, the user decides what to fix next.
