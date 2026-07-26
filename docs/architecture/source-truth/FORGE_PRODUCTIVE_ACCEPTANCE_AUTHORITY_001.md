# Forge Productive Acceptance Authority 001

## Status

- `STATUS=ACTIVE_ACCEPTANCE_AUTHORITY`
- `PHASE=FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `PRODUCTIVE_UI_AUTHORITY=docs/static-preview/forge-alive/`
- `LEGACY_SHELL_ACCEPTANCE=FORBIDDEN`
- `RUNTIME_IMPLEMENTATION_AUTHORIZED=NO`

## Product acceptance authority

An end-to-end browser test is valid only when it proves the real productive path:

```text
deployed Forge Alive entry
→ authenticated or explicitly approved identity state
→ productive navigation
→ productive source surface
→ natural user action
→ canonical event
→ evidence and provenance
→ persistence and synchronization
→ productive projection
→ human-authorized next action
→ confirmed result
```

## Forbidden substitutes

```text
legacy root index.html
#dashboard-container
#dash-sales-nba
.nav-btn[data-target="advisor-sales-pipeline"]
synthetic shell-only DOM
test fixture presented as productive UI
local success without productive-route proof
workflow finalization without real browser evidence
```

## Evidence requirements

Acceptance evidence must record:

- exact source commit;
- deployed entry;
- browser and viewport;
- authenticated identity state;
- productive route and selectors;
- created event identity;
- evidence source and strength;
- persistence result;
- reload/offline/reconnect behavior where applicable;
- projection result;
- human checkpoint;
- confirmed result;
- cleanup or rollback;
- zero unauthorized residue.

## Gate

```text
LEGACY_BROWSER_HARNESS_AS_ACCEPTANCE=FORBIDDEN
REAL_PRODUCT_BINDING_REQUIRED=YES
HUMAN_AUTHORITY_REQUIRED=YES
MAIN_MERGE_AUTHORIZED=NO
```
