# NASH Fast Track — NFAST-09 Stage 3B Incremental Sync Closure

## Status

- `STAGE_ID=NFAST-09_STAGE_3B_INCREMENTAL_SYNC`
- `STATUS=COMPLETE_AND_PUSHED`
- `SYNC_VERSION=NFAST-09.3B`
- `GATEWAY_MODE=INJECTED`
- `DIRECT_SUPABASE_ACCESS=NO`
- `MI_DIA_BINDING=NO`
- `SMART_WIDGET_BINDING=NO`
- `BACKGROUND_PUSH=NO`
- `SCHEMA_CHANGE=NO`
- `RLS_CHANGE=NO`
- `DEPLOYMENT=NO`
- `MAIN_MERGE=NO`
- `NFAST_10_AUTHORIZED=NO`

## Implemented components

```text
advisor-os/offline/due-action-sync-journal.js
advisor-os/offline/due-action-sync-service.js
tests/nfast-09-stage3b-incremental-sync-service-test.js
```

## Synchronization order

```text
authenticated online trigger
→ read durable outbox
→ mark mutation SYNCING and increment attempt count
→ push using deterministic mutationId
→ acknowledge and remove only after remote confirmation
→ retain retryable failures
→ record incompatible lifecycle conflicts
→ pull changes from the current cursor only when outbox is empty
→ atomically persist records and the advanced cursor
```

## Failure behavior

A transport failure does not delete the local operation. The mutation is
retained with `SYNC_FAILED` and its durable attempt count is incremented.

A later trigger retries the same mutation identifier.

## Conflict behavior

A remote lifecycle conflict is not resolved with last-write-wins.

The journal atomically preserves:

- the local due-action record;
- the remote minimized due-action record;
- the local authorized patch;
- the local operation;
- the base and remote server revisions;
- the deterministic conflict identifier;
- the conflict reason and detection time.

The local action and outbox mutation become
`CONFLICT_REVIEW_REQUIRED`.

## Incremental cursor behavior

Remote pull is skipped while unresolved outbox entries remain. This
prevents advancing beyond a remote change that still conflicts with local
work.

When the outbox is empty, changes are pulled from the stored cursor.
Each page is applied through the Stage 3A atomic reconciliation operation,
which persists records and cursor together.

Full local cache deletion is prohibited.

## Multi-device acknowledgement

A remote record may advance acknowledgement from another device while the
commercial due action remains `SCHEDULED`.

Seeing or acknowledging an alert still does not complete, cancel, delete,
or tombstone the due action.

## Concurrency

Concurrent synchronization requests for the same advisor share one
in-flight operation. This prevents duplicate mutation delivery from
focus, visibility, reconnect, and timer triggers arriving together.

## Gateway boundary

Stage 3B requires an injected gateway with:

```text
pushMutation({ advisorPartitionKey, mutation })
pullChanges({ advisorPartitionKey, cursor })
```

The service contains no direct `fetch`, Supabase `.from`, RPC, provider,
message generation, or message-send authority.

A productive Supabase gateway remains a separately tested binding.

## Validation

Stage 3B tests prove:

- no gateway access while offline;
- authentication required;
- acknowledged outbox removal;
- incremental pull after flush;
- durable retry state;
- deterministic retry of the same mutation;
- preservation of both conflict candidates;
- no pull while outbox remains;
- cross-device acknowledgement without completion;
- cross-advisor pull rejection;
- multi-page cursor advancement;
- concurrent sync coalescing;
- invalid remote response rejection;
- non-advancing cursor rejection;
- no direct provider, messaging, or full-cache clearing authority.

Regression validation includes Stage 3A, the legacy IndexedDB quarantine,
NFAST-09 Stages 1–2, NFAST-04, and NFAST-08.

## Explicit non-authorizations

- `PRODUCTIVE_SUPABASE_GATEWAY_AUTHORIZED=NO`
- `MI_DIA_RUNTIME_BINDING_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage

- `NEXT_STAGE=NFAST-09_STAGE_3C_PRODUCTIVE_SYNC_GATEWAY`
- `NEXT_STAGE_STATUS=NOT_YET_IMPLEMENTED`
