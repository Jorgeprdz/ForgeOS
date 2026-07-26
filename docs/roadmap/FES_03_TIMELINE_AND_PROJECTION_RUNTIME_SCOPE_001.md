# FES 03 Timeline and Projection Runtime Scope 001

## Status

```text
PHASE=FES_03_TIMELINE_AND_PROJECTION_RUNTIME
STATUS=OPEN
SOURCE_COMMIT=048aef10942c1439820dd61cdb4f00f90c6b63aa
PRODUCTIVE_UI_BINDING=DEFERRED_TO_FES_08
SUPABASE_REMOTE_MUTATION=NO
MAIN_MUTATION=NO
```

## Objective

One canonical append-only Activity timeline feeds deterministic read models.
Projections never own, rewrite or silently promote event truth.

## Locked subphases

```text
FES_03A_PLAYWRIGHT_E2E_BASELINE
→ FES_03B_CANONICAL_TIMELINE_CONTRACT
→ FES_03C_ACTIVITY_PROJECTION
→ FES_03D_PROSPECT_DETAIL_PROJECTION
→ FES_03E_PIPELINE_CARD_PROJECTION
→ FES_03F_MI_DIA_PROJECTION
→ FES_03G_PROJECTION_RUNTIME_ACCEPTANCE
```

## FES 03A

Deliver only:

- Playwright Test baseline;
- Vite repository-root server;
- native Linux CI authority;
- browser and module-route preflight;
- IndexedDB capability check;
- network interception;
- offline and online transition;
- isolated browser contexts;
- failure traces and artifacts.

FES 03A does not implement timeline or projection domain logic.

## FES 03 projection invariants

- canonical events remain append-only;
- corrections remain events;
- timeline order is deterministic;
- tenant partitions never mix;
- a projection can be rebuilt from canonical events;
- unknown remains unknown;
- pending state is explicit;
- conflicts remain reviewable;
- Activity, prospect detail, Pipeline and Mi Día share the same timeline;
- productive Forge Alive binding remains deferred to FES 08.

<!-- BEGIN FORGEOS:FES_03B_COMPLETION -->
## FES 03B completion

```text
FES_03A_PLAYWRIGHT_E2E_BASELINE=CLOSED
FES_03B_CANONICAL_TIMELINE_CONTRACT=CLOSED
FES_03C_ACTIVITY_PROJECTION=NEXT
FES_03D_PROSPECT_DETAIL_PROJECTION=PLANNED
FES_03E_PIPELINE_CARD_PROJECTION=PLANNED
FES_03F_MI_DIA_PROJECTION=PLANNED
FES_03G_PROJECTION_RUNTIME_ACCEPTANCE=PLANNED
FES_03_TIMELINE_AND_PROJECTION_RUNTIME=OPEN
```
<!-- END FORGEOS:FES_03B_COMPLETION -->

<!-- BEGIN FORGEOS:FES_03C_COMPLETION -->
## FES 03C completion

```text
FES_03A_PLAYWRIGHT_E2E_BASELINE=CLOSED
FES_03B_CANONICAL_TIMELINE_CONTRACT=CLOSED
FES_03C_ACTIVITY_PROJECTION=CLOSED
FES_03D_PROSPECT_DETAIL_PROJECTION=NEXT
FES_03E_PIPELINE_CARD_PROJECTION=PLANNED
FES_03F_MI_DIA_PROJECTION=PLANNED
FES_03G_PROJECTION_RUNTIME_ACCEPTANCE=PLANNED
FES_03_TIMELINE_AND_PROJECTION_RUNTIME=OPEN
```
<!-- END FORGEOS:FES_03C_COMPLETION -->
