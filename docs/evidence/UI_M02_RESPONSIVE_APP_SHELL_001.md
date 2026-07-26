# UI-M02 — Responsive app shell acceptance state

## Current result

- Implementation candidate: **PASS**
- Unit preflight in ArchForge: **PASS**
- Real UI acceptance: **PENDING**
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
