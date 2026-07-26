# UI-M02A — Responsive app shell candidate

## Status

- Implementation candidate: **READY**
- Local browser acceptance: **FORBIDDEN**
- Authoritative browser acceptance: **GITHUB ACTIONS**
- UI-M02 closure: **BLOCKED UNTIL GREEN**

## Candidate scope

- Responsive header.
- Floating navigation pill.
- Tablet-landscape and desktop rail.
- Global Alfred launcher.
- Alfred touch sheet and desktop side panel.
- Existing product surface preserved.
- Legacy mode remains the default.

## Acceptance runtime

The authoritative browser gate runs in:

`mcr.microsoft.com/playwright:v1.61.1-noble`

The workflow executes:

- locked dependency installation;
- local-contract unit preflight;
- five Playwright viewport projects;
- real launcher click and Alfred open/close behavior;
- responsive geometry and overflow checks;
- ten PNG screenshots;
- JSON, TAP, HTML, trace and video evidence when applicable.

## Closure rule

UI-M02 may be marked complete only after the exact candidate commit
has a successful `UI-M02 · Playwright` GitHub Actions check and its
artifact has been inspected and recorded.

## First Actions attempt

Run `30217658448` reached the authoritative container but failed in the
unit-preflight shell wrapper after all eight Node assertions passed.
The browser stage did not run. The workflow now declares Bash
explicitly and uses `set -Eeuo pipefail`.

## Second Actions attempt

Run `30223453235` passed installation and all unit contracts, then reached
the real browser gate. The artifact showed a source-tree Vite path
mismatch, visible legacy navigation on touch layouts and rail-width
overflow on landscape/desktop. Acceptance now uses a Pages-shaped
static tree and explicit shell geometry containment.

## Third Actions attempt

Run `30224177480` passed installation and unit contracts but the browser
process did not start. The Pages-shaped builder was blocked by Git's
dubious-ownership protection inside the job container. Git operations
are now executed with a process-scoped `safe.directory` configuration.
