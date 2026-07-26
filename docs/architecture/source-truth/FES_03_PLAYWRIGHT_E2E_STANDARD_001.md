# FES 03 Playwright E2E Standard 001

## Status

```text
STATUS=BASELINE_IMPLEMENTED_PENDING_NATIVE_ACCEPTANCE
PHASE=FES_03_TIMELINE_AND_PROJECTION_RUNTIME
STAGE=FES_03A_PLAYWRIGHT_E2E_BASELINE
PLAYWRIGHT_VERSION=1.61.1
VITE_VERSION=8.1.5
E2E_EXECUTION_AUTHORITY=GITHUB_ACTIONS_LINUX_NATIVE
LOCAL_PROOT_BROWSER_GATE=FORBIDDEN
PRODUCTIVE_RUNTIME_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
```

## Standard

Forge browser acceptance uses Playwright Test. Forge does not own or maintain a
custom CDP, BiDi or browser lifecycle harness.

Playwright owns:

- browser launch and shutdown;
- isolated browser contexts;
- network interception;
- offline and online transitions;
- trace, screenshot, video and HTML report evidence;
- managed Vite web-server lifecycle.

Vite serves from the repository root so absolute module authorities including
`/advisor-os/`, `/platform/` and `/nash/` resolve through one module graph.

## Execution split

```text
TERMUX_OR_ARCHFORGE
→ syntax
→ manifest
→ package lock
→ Playwright test discovery
→ commit and push

GITHUB_ACTIONS_NATIVE_LINUX
→ Playwright browser launch
→ Vite server
→ module authority routes
→ Forge Alive static authority
→ IndexedDB
→ network interception
→ offline reconnect
→ context isolation
→ evidence artifacts
```

PRoot browser execution is diagnostic only and cannot close an E2E gate.

## Failure rule

Infrastructure preflight must pass before FES 03 timeline or projection
acceptance runs. A preflight failure cannot be reclassified as a product failure.

## Version alignment

The project package and Microsoft Playwright container use the same pinned
version. Floating browser images are forbidden for acceptance evidence.
