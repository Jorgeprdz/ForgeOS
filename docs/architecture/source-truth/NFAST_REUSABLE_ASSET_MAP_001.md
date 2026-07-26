# NFAST Reusable Asset Map 001

## Status

- `STATUS=REUSABLE_ASSETS_INVENTORIED_NOT_AUTHORIZED`
- `PHASE=FES_00_SYSTEM_REALIGNMENT_AND_CLEANUP`
- `SOURCE_COMMIT=5e7974152aee9bbe7256a6396ece42cabe934df9`
- `NFAST_09_STAGE_3G_ACCEPTED=NO`
- `NFAST_10_AUTHORIZED=NO`
- `DIRECT_RUNTIME_REUSE_AUTHORIZED=NO`

## Reuse disposition

The Event & Evidence Operating System does not discard NFAST-09 work. It changes its
authority and placement:

- Stage 3A local-first core: candidate local replica/outbox foundation;
- Stage 3B durable outbox and incremental sync: candidate synchronization foundation;
- Stage 3C governed Supabase gateway: candidate persistence gateway;
- Stage 3D remote RLS/RPC evidence: historical remote acceptance evidence;
- Stage 3E due-action priority/read-model concepts: candidate projection logic;
- Stage 3F typed writer and commands: candidate command-family logic;
- Stage 3G legacy-shell harness: retired and not reusable as acceptance authority.

Due actions become one command and projection family on the canonical Event & Evidence
system. They are not the system backbone and do not own timeline truth.

## Tracked reusable candidates

```text
advisor-os/home/mi-dia-due-action-runtime.js
advisor-os/home/mi-dia-due-action-surface-adapter.js
advisor-os/offline/due-action-indexeddb-store.js
advisor-os/offline/due-action-offline-contract.js
advisor-os/offline/due-action-outbox-service.js
advisor-os/offline/due-action-supabase-gateway.js
advisor-os/offline/due-action-sync-journal.js
advisor-os/offline/due-action-sync-service.js
advisor-os/sales-pipeline/pipeline-due-action-runtime.js
advisor-os/sales-pipeline/pipeline-due-action-writer.js
advisor-os/sales-pipeline/prospect-due-action-priority-contract.js
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_04_DETERMINISTIC_CONVERSATION_BRIEF_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_IMPLEMENTATION_STAGE_1_CONTRACT_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_IMPLEMENTATION_STAGE_2_SERVICE_BOUNDARY_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_LEGACY_INDEXEDDB_QUARANTINE_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3A_OFFLINE_CORE_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3B_INCREMENTAL_SYNC_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3C_PRODUCTIVE_SYNC_GATEWAY_GATE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3C_PRODUCTIVE_SYNC_GATEWAY_IMPLEMENTATION_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3D_REMOTE_DEPLOYMENT_RLS_ACCEPTANCE_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3D_REMOTE_DEPLOYMENT_RLS_ACCEPTANCE_GATE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3E_EXISTING_MI_DIA_SURFACE_BINDING_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3F_PIPELINE_DUE_ACTION_WRITE_BINDING_CLOSURE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3_DUE_ACTION_RUNTIME_INTEGRATION_GATE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3_OFFLINE_FIRST_CONSTITUTIONAL_CORRECTION_GATE.md
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_TIMELINE_TO_CONVERSATION_BRIEF_STAGE_GATE.md
docs/evidence/nfast-09-stage3d-remote-acceptance.json
nash/conversation-brief/nash-deterministic-conversation-brief-boundary-contract.js
nash/conversation-brief/nash-provider-request-contract.js
nash/conversation-brief/nash-timeline-to-conversation-brief-projection-contract.js
nash/conversation-brief/nash-timeline-to-conversation-brief-projection-service.js
nash/tests/nash-deterministic-conversation-brief-boundary-contract-master-test.js
nash/tests/nfast-09-timeline-to-conversation-brief-projection-contract-test.js
nash/tests/nfast-09-timeline-to-conversation-brief-projection-service-test.js
supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql
tests/nfast-09-legacy-indexeddb-quarantine-test.mjs
tests/nfast-09-stage3a-offline-core-test.js
tests/nfast-09-stage3b-incremental-sync-service-test.js
tests/nfast-09-stage3c-migration-security-test.mjs
tests/nfast-09-stage3c-productive-sync-gateway-test.js
tests/nfast-09-stage3e-dashboard-binding-test.mjs
tests/nfast-09-stage3e-existing-surface-adapter-test.mjs
tests/nfast-09-stage3e-local-first-runtime-test.mjs
tests/nfast-09-stage3e-priority-read-model-test.mjs
tests/nfast-09-stage3f-pipeline-binding-test.mjs
tests/nfast-09-stage3f-pipeline-due-action-runtime-test.mjs
tests/nfast-09-stage3f-pipeline-due-action-writer-test.mjs
```

## Required review before reuse

Each candidate must be reviewed for:

```text
canonical event compatibility
evidence and provenance compatibility
append-only ledger compatibility
tenant and RLS boundary
idempotency
offline replica and outbox behavior
conflict review
projection-only ownership
productive Forge Alive binding
human-authority checkpoint
rollback and browser acceptance
```

## Forbidden shortcuts

```text
file existence ≠ accepted capability
legacy test pass ≠ productive browser acceptance
due-action persistence ≠ canonical event ledger
projection state ≠ event truth
external handoff ≠ confirmed result
NFAST asset reuse ≠ NFAST-10 authorization
```
