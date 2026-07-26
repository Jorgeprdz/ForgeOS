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
