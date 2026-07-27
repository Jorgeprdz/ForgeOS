# UI-M02 — Responsive app shell acceptance state

## Current result

- Implementation candidate: **PASS**
- Unit preflight in ArchForge: **PASS**
- Real UI acceptance: **HARNESS RESET PENDING**
- First Actions run: **30217658448 — WRAPPER FAILURE**
- Second Actions run: **30223453235 — FULL-RUNTIME BROWSER FAILURE**
- Third Actions run: **30224177480 — BUILDER OWNERSHIP FAILURE**
- Fourth Actions run: **30224703966 — FULL-RUNTIME DEPENDENCY FAILURE**
- Acceptance model: **ISOLATED REAL-ASSET SHELL HARNESS**
- Acceptance authority: **GITHUB ACTIONS**
- UI-M02 complete: **NO**

## Workflow

`.github/workflows/ui-m02-responsive-app-shell.yml`

## Authoritative test assets

- `tests/e2e/ui-m02-responsive-app-shell.spec.mjs`
- `playwright.ui-m02.config.mjs`

## Required evidence

The successful workflow must produce:

- `unit-test.tap`;
- `browser-test.tap`;
- `playwright-report.json`;
- `acceptance-summary.json`;
- HTML report;
- ten viewport screenshots;
- traces and videos on failure.

## Boundary

A local Chromium, Xvfb or PRoot result is not an acceptance gate for
UI-M02. ArchForge is limited to implementation, syntax, unit tests,
scope validation, commit and push.
