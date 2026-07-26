# Forge System Realignment Roadmap 001

## Status

- `STATUS=ACTIVE_OWNER_ALIGNED_ROADMAP`
- `RECORDED=2026-07-25`
- `CURRENT=FES_02_ACTIVITY_LEDGER_PERSISTENCE_CLOSED`
- `NEXT=FES_03_TIMELINE_AND_PROJECTION_RUNTIME`
- `MAIN_MUTATION=NO`

## Governing first vertical

```text
light prospect intake
→ initial context
→ calendar appointment
→ Activity evidence
→ post-event probe
→ outcome
→ optional context
→ timeline
→ observable pattern
→ explained recommendation
→ human decision
→ next movement
```

This vertical closes before broad expansion resumes.

## Phase −1 — Source truth

### `FES_PHASE_MINUS_1_SYSTEM_SOURCE_TRUTH`

Deliver:

- Event & Evidence Operating System source truth;
- system roadmap;
- invalidation of the premature legacy Stage 3G harness;
- Build Tree and Roadmap Lock sync.

No runtime, Supabase or main mutation.

## Phase 0 — Realignment and cleanup

### `FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`

- retire the incorrect Stage 3G workflow, finalizer and browser test;
- preserve the failed run as historical evidence;
- map productive Forge Alive files and selectors;
- map reusable NFAST assets;
- prohibit legacy-shell acceptance;
- prepare implementation scope.

## Phase 1 — Canonical event contract

### `FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT`

Define event identity, subject, source, evidence strength, time, causation,
privacy, learning eligibility and safe payload for all domains.

## Phase 2 — Ledger and synchronization

### `FES_02_ACTIVITY_LEDGER_PERSISTENCE`

Deliver append-only ledger, evidence references, RLS, RPC, idempotency,
corrections, local replica, outbox, sync and conflict review.

## Phase 3 — Timeline and projections

### `FES_03_TIMELINE_AND_PROJECTION_RUNTIME`

Deliver canonical timeline plus Activity, prospect detail, Pipeline and Mi Día
read models. Projections never own event truth.

## Phase 4 — Light prospect intake

### `FES_04_LIGHT_PROSPECT_INTAKE`

Deliver short intake, voice context, conditional referral fields, optional
details, event zero and candidate extraction with human confirmation.

## Phase 5 — Passive capture bridges

### `FES_05_PASSIVE_ACTIVITY_CAPTURE_BRIDGES`

Connect Calendar, WhatsApp/Nash, Nash Combat, calls, quotes, presentations and
stage changes. Separate intent, generation, handoff, confirmation and result.

## Phase 6 — Outcome probes

### `FES_06_POST_EVENT_OUTCOME_PROBES`

Deliver appointment-result questions, held/cancelled/no-show/rescheduled
branches, optional context and unresolved-probe queue.

## Phase 7 — Push and deep links

### `FES_07_PUSH_AND_DEEP_LINK_RUNTIME`

Deliver permission UX, subscriptions, scheduler, push, deep links, retry,
deduplication and internal fallback.

## Phase 8 — Forge Alive integration

### `FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION`

Integrate Pipeline cards, prospect detail, Activity, Mi Día and Seguimiento on:

```text
docs/static-preview/forge-alive/
```

Calendar remains Calendar-only.

## Phase 9 — Council intelligence

### `FES_09_COUNCIL_INTELLIGENCE_LOOP`

Materialize:

```text
timeline
→ Mick
→ NBA + Reason Why
→ Alfred
→ Nash
→ human decision
```

## Phase 10 — Domain convergence

### `FES_10_DOMAIN_CONVERGENCE`

Connect Product, Quote/Presenter, Policy, Relationship, Recruitment, Career,
Manager/Team, Conservation, Forecast and compensation candidates without
parallel truth silos.

## Phase 11 — Private learning

### `FES_11_PRIVATE_USER_LEARNING`

Tenant-local advisor and prospect learning with no cross-tenant exposure.

## Phase 12 — Protected global learning

### `FES_12_PROTECTED_GLOBAL_LEARNING`

Progress from analytics to classical models, protected aggregation or federated
learning, and deep learning only when justified. No raw private data.

## Phase 13 — End-to-end acceptance

### `FES_13_END_TO_END_SYSTEM_ACCEPTANCE`

Accept the real loop:

```text
create prospect
→ initial context
→ communication
→ appointment
→ Activity
→ notification
→ outcome
→ context
→ timeline
→ pattern
→ recommendation
→ human-approved movement
```

Validate Forge Alive mobile/desktop, auth, RLS, offline/outbox, push, deep links,
Activity, Pipeline, Mi Día, Council intelligence, privacy, performance,
deployment and rollback.

## Locked sequence

```text
FES_PHASE_MINUS_1_SYSTEM_SOURCE_TRUTH
→ FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP
→ FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT
→ FES_02_ACTIVITY_LEDGER_PERSISTENCE
→ FES_03_TIMELINE_AND_PROJECTION_RUNTIME
→ FES_04_LIGHT_PROSPECT_INTAKE
→ FES_05_PASSIVE_ACTIVITY_CAPTURE_BRIDGES
→ FES_06_POST_EVENT_OUTCOME_PROBES
→ FES_07_PUSH_AND_DEEP_LINK_RUNTIME
→ FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION
→ FES_09_COUNCIL_INTELLIGENCE_LOOP
→ FES_10_DOMAIN_CONVERGENCE
→ FES_11_PRIVATE_USER_LEARNING
→ FES_12_PROTECTED_GLOBAL_LEARNING
→ FES_13_END_TO_END_SYSTEM_ACCEPTANCE
```

## Hold

```text
NFAST_09_STAGE_3G_ACCEPTED=NO
NFAST_10_AUTHORIZED=NO
LEGACY_BROWSER_HARNESS_AS_ACCEPTANCE=FORBIDDEN
MAIN_MERGE_AUTHORIZED=NO
```

<!-- BEGIN FORGEOS:FES_00_COMPLETION -->
## FES 00 completion

```text
FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP=CLOSED
LEGACY_STAGE_3G_WORKFLOW=RETIRED
LEGACY_STAGE_3G_FINALIZER=RETIRED
LEGACY_STAGE_3G_BROWSER_TEST=RETIRED
FAILED_WORKFLOW_RUN_30180606799=HISTORICAL_EVIDENCE
FORGE_ALIVE_PRODUCTIVE_SURFACE=MAPPED
NFAST_REUSABLE_ASSETS=MAPPED_NOT_AUTHORIZED
LEGACY_SHELL_ACCEPTANCE=FORBIDDEN
FES_01_SCOPE=PREPARED
NEXT=FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT
```
<!-- END FORGEOS:FES_00_COMPLETION -->

<!-- BEGIN FORGEOS:FES_01_COMPLETION -->
## FES 01 completion

```text
FES_01_CANONICAL_ACTIVITY_EVENT_CONTRACT=CLOSED
CONTRACT_SCHEMA=forge.activity_event.v1
FIRST_VERTICAL_EVENT_TYPES=13
DETERMINISTIC_CONTRACT_TESTS=PASS
NFAST_STAGE_3F_REGRESSION=PASS
DATABASE_MIGRATION=NO
RUNTIME_PERSISTENCE=NO
PRODUCTIVE_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
NEXT=FES_02_ACTIVITY_LEDGER_PERSISTENCE
```
<!-- END FORGEOS:FES_01_COMPLETION -->

<!-- BEGIN FORGEOS:FES_02A_COMPLETION -->
## FES 02A completion

```text
FES_02A_ACTIVITY_LEDGER_LOCAL_FOUNDATION=CLOSED
APPEND_ONLY_LEDGER_RECORD=PASS
EVIDENCE_REFERENCE_ALLOWLIST=PASS
ATOMIC_LOCAL_EVENT_AND_OUTBOX=PASS
IDEMPOTENT_LOCAL_REPLAY=PASS
TENANT_LOCAL_ISOLATION=PASS
INDEXEDDB_DRIVER=IMPLEMENTED_NOT_PRODUCTIVELY_BOUND
REMOTE_RECEIPT_AND_CURSOR_CONTRACT=PASS
RETRY_AND_CONFLICT_REVIEW=PASS
PUSH_BEFORE_PULL_SYNC=PASS
MIGRATION_CANDIDATE=20260726000100_fes02_activity_event_ledger.sql
REMOTE_MIGRATION_APPLICATION=NO
NEXT=FES_02B_REMOTE_LEDGER_AUTHORITY
```
<!-- END FORGEOS:FES_02A_COMPLETION -->

<!-- BEGIN FORGEOS:FES_02B_COMPLETION -->
## FES 02B completion

```text
FES_02B_REMOTE_LEDGER_AUTHORITY=CLOSED
REMOTE_MIGRATION_APPLICATION=PASS
REMOTE_RLS_RPC_ACCEPTANCE=PASS
REMOTE_TRANSACTION_ROLLBACK=PASS
TEMPORARY_REMOTE_DATA_RESIDUE=ZERO
NFAST_REMOTE_AUTHORITY=PRESERVED
PRODUCTIVE_UI_MUTATION=NO
MAIN_MUTATION=NO
NEXT=FES_02C_LEDGER_GATEWAY_SYNC_ACCEPTANCE
```
<!-- END FORGEOS:FES_02B_COMPLETION -->

<!-- BEGIN FORGEOS:FES_02_COMPLETION -->
## FES 02 completion

```text
FES_02A_ACTIVITY_LEDGER_LOCAL_FOUNDATION=CLOSED
FES_02B_REMOTE_LEDGER_AUTHORITY=CLOSED
FES_02C_LEDGER_GATEWAY_SYNC_ACCEPTANCE=CLOSED
FES_02_ACTIVITY_LEDGER_PERSISTENCE=CLOSED
PRODUCTIVE_UI_MUTATION=NO
MAIN_MUTATION=NO
NEXT=FES_03_TIMELINE_AND_PROJECTION_RUNTIME
```
<!-- END FORGEOS:FES_02_COMPLETION -->

<!-- BEGIN FORGEOS:FES_03A_COMPLETION -->
## FES 03A completion

```text
FES_03A_PLAYWRIGHT_E2E_BASELINE=CLOSED
FES_03_TIMELINE_AND_PROJECTION_RUNTIME=OPEN
E2E_FRAMEWORK=PLAYWRIGHT
E2E_SERVER=VITE_REPOSITORY_ROOT
E2E_RUNTIME=GITHUB_ACTIONS_LINUX_NATIVE
NEXT=FES_03B_CANONICAL_TIMELINE_CONTRACT
```
<!-- END FORGEOS:FES_03A_COMPLETION -->

<!-- BEGIN FORGEOS:FES_03B_COMPLETION -->
## FES 03B completion

```text
FES_03B_CANONICAL_TIMELINE_CONTRACT=CLOSED
CANONICAL_TIMELINE_ORDERING=DETERMINISTIC
CORRECTIONS=APPEND_ONLY_VISIBLE
TIMELINE_REBUILD=PASS
FES_03_TIMELINE_AND_PROJECTION_RUNTIME=OPEN
NEXT=FES_03C_ACTIVITY_PROJECTION
```
<!-- END FORGEOS:FES_03B_COMPLETION -->
