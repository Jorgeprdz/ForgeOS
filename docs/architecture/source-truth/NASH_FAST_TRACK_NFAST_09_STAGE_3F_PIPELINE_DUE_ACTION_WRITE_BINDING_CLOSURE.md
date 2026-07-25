# NASH Fast Track — NFAST-09 Stage 3F Pipeline Due-Action Write Binding Closure

## Status

- `STAGE_ID=NFAST-09_STAGE_3F_PIPELINE_DUE_ACTION_WRITE_BINDING`
- `STATUS=COMPLETE_AND_PUSHED`
- `WRITER_VERSION=NFAST-09.3F`
- `SOURCE_STAGE_3E_COMMIT=f27ef93aa6df353b154acecbeb5c8bc6172202fa`
- `PIPELINE_LOCAL_FIRST_WRITE=YES`
- `ATOMIC_RECORD_AND_OUTBOX=YES`
- `DETERMINISTIC_MUTATION_ID=YES`
- `MI_DIA_LOCAL_MUTATION_EVENT=YES`
- `REMOTE_SYNC_SECONDARY=YES`
- `PROSPECT_PERSISTENCE_AUTHORITY=NO`
- `PIPELINE_STAGE_WRITER_AUTHORITY=NO`
- `MESSAGE_GENERATION=NO`
- `MESSAGE_SEND=NO`
- `SUPABASE_SCHEMA_MUTATION=NO`
- `SUPABASE_REMOTE_MUTATION_DURING_STAGE=NO`
- `MAIN_MUTATION=NO`
- `NFAST_10_AUTHORIZED=NO`

## Decision

Stage 3F binds governed due-action writes into the live Pipeline route without
pretending that general prospect or opportunity persistence already exists.

The Pipeline continues to represent missing canonical prospect persistence
honestly.

When a prospect reference and approved display name are available, the Pipeline
may manage only that prospect's NFAST-09 next-action record.

## Local-first write order

```text
authenticated advisor from AppState
→ prospect reference and approved display name
→ typed due-action command
→ deterministic mutation
→ local record + durable outbox in one atomic transaction
→ immediate Pipeline state update
→ nfast09:due-action-mutated event
→ Mi Día local replica refresh when mounted
→ governed incremental synchronization in secondary promise
```

The interface does not await Supabase before confirming the local save.

Remote synchronization starts on the next event-loop task, after the caller
receives the committed local result and can update the visible interface.

## Commands

Stage 3F exposes the existing contract operations:

```text
SCHEDULE
RESCHEDULE
MARK_SEEN
ACKNOWLEDGE
SNOOZE
COMPLETE
CANCEL
```

Lifecycle rules:

- `SCHEDULE` creates version 1 or reopens a tombstoned history with a new
  version.
- `RESCHEDULE`, `COMPLETE` and `CANCEL` increment lifecycle version.
- `MARK_SEEN`, `ACKNOWLEDGE` and `SNOOZE` preserve lifecycle version.
- commands requiring an active action fail when no active action exists.
- an active action cannot be silently replaced by `SCHEDULE`; it must use
  `RESCHEDULE`.

## Advisor authority

The writer is bound to the authenticated advisor partition at construction.

Advisor partition is not accepted from:

- DOM attributes;
- form fields;
- route parameters;
- command payloads.

The Pipeline route derives it from `AppState.user.id`.

## Identity and source boundary

A new next action requires an approved display name.

Stage 3F may resolve it from:

- an existing NFAST-09 local record;
- the Stage 3E Mi Día primary recommendation;
- the Stage 3E supporting queue;
- a future canonical Pipeline card.

When identity is unavailable, the editor stays read-only and explains why.

Forge does not invent a prospect name.

## UI boundary

Stage 3F adds one contextual next-action editor to the existing Pipeline route.

It does not:

- create fake prospect cards;
- unlock general prospect persistence;
- unlock opportunity-stage writes;
- modify the Forge Alive static preview;
- create a second Mi Día section;
- contact a prospect;
- generate a WhatsApp message.

Existing and future canonical cards retain an `Agendar` quick action that opens
the same editor.

## Privacy

The writer accepts only:

```text
operation
prospectReference
approvedDisplayName
nextActionType
nextActionAt
snoozedUntil
createdAt
```

It rejects unsupported and sensitive fields before local storage.

Outbox content remains governed by the Stage 3A contract.

## Synchronization and conflicts

The local write commits before synchronization begins.

Synchronization uses the Stage 3B service and Stage 3C RPC-only gateway.

- offline writes remain durable;
- retry state remains durable;
- server acknowledgements remove only acknowledged outbox entries;
- conflicts preserve both candidates;
- Stage 3F never performs silent last-write-wins;
- Stage 3F never resolves a conflict automatically.

## Implemented files

```text
advisor-os/sales-pipeline/pipeline-due-action-writer.js
advisor-os/sales-pipeline/pipeline-due-action-runtime.js
advisor-os/sales-pipeline/pipeline-ui.js
advisor-os/sales-pipeline/pipeline-live-route.js
tests/nfast-09-stage3f-pipeline-due-action-writer-test.mjs
tests/nfast-09-stage3f-pipeline-due-action-runtime-test.mjs
tests/nfast-09-stage3f-pipeline-binding-test.mjs
```

## Explicit non-authorizations

- `GENERAL_PROSPECT_WRITER_AUTHORIZED=NO`
- `OPPORTUNITY_STAGE_WRITER_AUTHORIZED=NO`
- `DRAG_AND_DROP_PERSISTENCE_AUTHORIZED=NO`
- `SMART_WIDGET_WRITE_BINDING_AUTHORIZED=NO`
- `ROCKY_RUNTIME_BINDING_AUTHORIZED=NO`
- `GREEN_OWL_RUNTIME_BINDING_AUTHORIZED=NO`
- `CANDY_CRUSH_RUNTIME_BINDING_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `SUPABASE_SCHEMA_CHANGE_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next step

- `NEXT_STAGE=NFAST-09_STAGE_3G_END_TO_END_BROWSER_ACCEPTANCE`
- `NEXT_STAGE_STATUS=NOT_YET_IMPLEMENTED`
