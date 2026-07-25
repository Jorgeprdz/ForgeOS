# NASH Fast Track — NFAST-09 Stage 3A Offline Core Closure

## Status

- `STAGE_ID=NFAST-09_STAGE_3A_OFFLINE_CORE`
- `STATUS=COMPLETE_AND_PUSHED`
- `CONTRACT_VERSION=NFAST-09.3A`
- `IMPLEMENTATION_SCOPE=LOCAL_INDEXEDDB_REPLICA_AND_DURABLE_OUTBOX`
- `SUPABASE_INTEGRATION=NO`
- `SYNC_NETWORK_INTEGRATION=NO`
- `MI_DIA_BINDING=NO`
- `SMART_WIDGET_BINDING=NO`
- `SCHEMA_CHANGE=NO`
- `RLS_CHANGE=NO`
- `DEPLOYMENT=NO`
- `MAIN_MERGE=NO`
- `NFAST_10_AUTHORIZED=NO`

## Implemented components

```text
advisor-os/offline/due-action-offline-contract.js
advisor-os/offline/due-action-indexeddb-store.js
advisor-os/offline/due-action-outbox-service.js
tests/nfast-09-stage3a-offline-core-test.js
```

## Offline contract

The contract establishes:

- advisor-partitioned local record keys;
- minimized due-action records;
- separate commercial lifecycle and acknowledgement states;
- deterministic mutation identifiers;
- monotonic acknowledgement merging;
- a new acknowledgement lifecycle after rescheduling;
- prohibited sensitive-field detection;
- local mutation application without provider, network, or message authority.

## IndexedDB store

The production driver creates a dedicated database:

```text
FORGE_OS_DUE_ACTIONS
```

With stores:

```text
dueActions
outbox
syncMeta
```

The implementation does not reuse or mutate the legacy CRM IndexedDB
database.

Local due-action and outbox writes are committed atomically. Incremental
remote reconciliation and cursor advancement are also defined as one
local atomic operation.

## Outbox

The outbox service supports local-first:

- schedule;
- reschedule;
- complete;
- cancel;
- mark seen;
- acknowledge;
- snooze.

It performs no network call. A later synchronization stage owns remote
delivery.

An outbox entry cannot be removed without explicit remote
acknowledgement.

## Multidevice semantics preserved

- Seeing or acknowledging an alert does not complete the commercial action.
- Completing or cancelling preserves a local tombstone until
  synchronization.
- Rescheduling increments the due-action version and resets
  acknowledgement.
- Local replicas are not deleted on reconnect.
- Cross-advisor reads and acknowledgements are rejected.

## Validation

Stage 3A tests prove:

- atomic local record and outbox creation;
- outbox durability across service recreation;
- deterministic idempotent replay;
- prohibited local and outbox data rejection;
- advisor partition isolation;
- read acknowledgement separate from completion;
- monotonic acknowledgement;
- reschedule version reset;
- completed-action tombstone;
- outbox deletion denied without remote acknowledgement;
- atomic server acknowledgement application;
- atomic record and cursor reconciliation;
- cursor preservation after failed local transaction;
- advisor-specific local clearing;
- IndexedDB production code with no network, provider, or message authority.

Regression validation includes NFAST-09 Stages 1–2, NFAST-04, and NFAST-08.

## Explicit non-authorizations

- `SUPABASE_DIRECT_ACCESS_AUTHORIZED=NO`
- `REMOTE_SYNC_AUTHORIZED=NO`
- `MI_DIA_RUNTIME_BINDING_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `PROVIDER_INVOCATION_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage

- `NEXT_STAGE=NFAST-09_STAGE_3B_INCREMENTAL_SYNC_SERVICE`
- `NEXT_STAGE_STATUS=NOT_YET_IMPLEMENTED`
