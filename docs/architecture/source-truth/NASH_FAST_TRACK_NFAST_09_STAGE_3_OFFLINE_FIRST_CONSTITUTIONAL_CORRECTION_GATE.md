# NASH Fast Track — NFAST-09 Stage 3 Offline-First Multi-Device Correction Gate

## Correction record

- `STAGE_ID=NFAST-09_STAGE_3_OFFLINE_FIRST_MULTIDEVICE_DUE_ACTION_RUNTIME`
- `CORRECTION_DATE=2026-07-24`
- `CORRECTION_TIMESTAMP_UTC=2026-07-25T01:07:41Z`
- `CORRECTION_TRIGGER=PRODUCT_OWNER_OFFLINE_FIRST_MULTIDEVICE_ARCHITECTURE`
- `SOURCE_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection`
- `SOURCE_COMMIT=787250e73db62b22d1b141547a4f38bdfaa76872`
- `SUPERSEDES_GATE=docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3_DUE_ACTION_RUNTIME_INTEGRATION_GATE.md`
- `OLD_GATE_STATUS=SUPERSEDED_FOR_IMPLEMENTATION_AUTHORITY`
- `OLD_GATE_DELETED=NO`
- `HISTORY_REWRITTEN=NO`
- `NFAST_09_STAGE_3_IMPLEMENTATION_AUTHORIZED=YES_UNDER_THIS_CORRECTED_GATE_ONLY`
- `SUPABASE_MUTATION_AUTHORIZED=NO`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Constitutional authority

The root Constitution ratifies Forge Constitution Amendment v1.1 as
constitutional doctrine.

The ratified amendment describes Forge as:

```text
Offline-first.
Deterministic at the Core.
AI-assisted only for explanation, language and support.
```

Therefore, a due-action implementation that cannot remember synchronized
work without a network connection is constitutionally insufficient.

- `OFFLINE_FIRST_CONSTITUTIONAL_REQUIREMENT=BINDING`
- `NETWORK_REQUIRED_FOR_KNOWN_DUE_ACTION=PROHIBITED`
- `LOCAL_OPERATIONAL_CONTINUITY_REQUIRED=YES`

## Core multi-device decision

Forge will use a durable local replica on every authenticated device.

```text
IndexedDB device replica
        ↕
durable idempotent outbox
        ↕
Supabase synchronized authority
        ↕
incremental change cursor
```

The local replica must not be deleted after every successful
reconnection. Doing so would destroy offline-first continuity.

Only successfully acknowledged outbox operations may be removed after
their remote result and resulting server version have been persisted
locally.

- `LOCAL_REPLICA_DELETE_ON_RECONNECT=PROHIBITED`
- `LOCAL_REPLICA_PERSISTENCE=REQUIRED`
- `ACKNOWLEDGED_OUTBOX_ITEM_REMOVAL=AUTHORIZED`
- `UNACKNOWLEDGED_OUTBOX_ITEM_REMOVAL=PROHIBITED`

## Three separate state machines

Forge must never collapse these three concerns into one boolean.

### 1. Due-action lifecycle

```text
SCHEDULED
COMPLETED
CANCELLED
RESCHEDULED
CONFLICT_REVIEW_REQUIRED
```

This state determines whether the commercial action remains pending.

### 2. Advisor acknowledgement

```text
UNSEEN
SEEN
ACKNOWLEDGED
SNOOZED
```

This state represents the advisor's interaction with the reminder. Seeing
or acknowledging an alert does not complete the commercial action.

### 3. Device delivery state

```text
NOT_PRESENTED
PRESENTED
DISMISSED_LOCALLY
```

This state is device-local presentation behavior and is not commercial
truth.

- `READ_ALERT_COMPLETES_DUE_ACTION=NO`
- `ACKNOWLEDGED_ALERT_COMPLETES_DUE_ACTION=NO`
- `ONLY_COMPLETION_CANCELLATION_OR_RESCHEDULE_CHANGES_DUE_LIFECYCLE=YES`

## Local record model

Each device may persist a minimized advisor-partitioned due-action replica:

```text
advisorPartitionKey
prospectReference
approvedDisplayName
nextActionType
nextActionAt
dueActionState
serverRevision
remoteUpdatedAt
localUpdatedAt
lastSyncedAt
syncState
acknowledgementState
acknowledgedAt
acknowledgedOnDeviceId
tombstone
```

Local records must not contain raw notes, unrestricted context, phone,
WhatsApp, email, health, income, family data, generated drafts, provider
payloads, or authentication tokens.

- `LOCAL_DUE_ACTION_STORE=INDEXEDDB_REQUIRED`
- `LOCAL_ADVISOR_PARTITION_REQUIRED=YES`
- `LOCAL_SENSITIVE_CONTEXT_ALLOWED=NO`
- `LOCAL_AUTH_TOKEN_STORAGE_AUTHORIZED=NO`
- `CROSS_ADVISOR_LOCAL_READ_ALLOWED=NO`

## Multi-device acknowledgement rule

When an advisor sees or acknowledges an alert on one device, that state
may synchronize globally so the same reminder is not repeatedly presented
as unseen on every device.

The global acknowledgement record must include:

```text
prospectReference
dueActionVersion
acknowledgementState
acknowledgedAt
acknowledgedOnDeviceId
mutationId
```

Acknowledgement is monotonic for the same due-action version:

```text
UNSEEN < SEEN < ACKNOWLEDGED
```

A later synchronization may advance the acknowledgement state but must not
silently move it backward.

A reschedule creates a new due-action version and therefore a new
acknowledgement lifecycle.

- `GLOBAL_ACKNOWLEDGEMENT_SYNC_REQUIRED=YES`
- `ACKNOWLEDGEMENT_MONOTONIC_MERGE_REQUIRED=YES`
- `ACKNOWLEDGEMENT_STATE_REGRESSION=PROHIBITED`
- `RESCHEDULE_RESETS_ACKNOWLEDGEMENT_FOR_NEW_VERSION=YES`

## Why the action is not deleted when read elsewhere

A reminder is only a presentation of a pending commercial action.

If Device A marks the reminder as seen:

```text
acknowledgementState = SEEN
```

Device B may stop showing it as new after synchronization, but the action
must remain in Mi Día until one of these occurs:

```text
COMPLETED
CANCELLED
RESCHEDULED
```

Therefore:

- `REMOTE_READ_CAUSES_LOCAL_DUE_ACTION_DELETE=NO`
- `REMOTE_COMPLETION_CAUSES_LOCAL_PRIORITY_REMOVAL=YES`
- `REMOTE_CANCELLATION_CAUSES_LOCAL_PRIORITY_REMOVAL=YES`
- `REMOTE_RESCHEDULE_REPLACES_LOCAL_DUE_VERSION=YES`

## Offline mutation outbox

Offline creation, acknowledgement, completion, cancellation, snooze, or
reschedule must use a durable IndexedDB outbox.

Each item must contain:

```text
mutationId
deviceId
advisorPartitionKey
prospectReference
dueActionVersion
operation
authorizedPatch
baseServerRevision
createdAt
attemptCount
syncState
```

The outbox must:

- persist across reloads;
- apply the authorized local change optimistically;
- retry only when online and authenticated;
- use deterministic idempotency;
- retain failed items;
- remove an item only after remote acknowledgement;
- never contain message text or sensitive context.

- `OFFLINE_WRITE_OUTBOX_REQUIRED=YES`
- `IN_MEMORY_ONLY_QUEUE_PROHIBITED=YES`
- `DURABLE_RETRY_REQUIRED=YES`
- `IDEMPOTENT_MUTATION_REQUIRED=YES`
- `OUTBOX_DELETE_BEFORE_REMOTE_ACK=PROHIBITED`

## Incremental synchronization

Each device must maintain a synchronization cursor.

A sync cycle must:

1. flush authorized local outbox items;
2. receive server acknowledgements and revisions;
3. pull remote changes newer than the local cursor;
4. reconcile records deterministically;
5. update the IndexedDB replica atomically;
6. advance the cursor only after the local transaction succeeds;
7. rerender Mi Día only if the effective read model changed.

- `FULL_CACHE_DELETE_AND_REDOWNLOAD=PROHIBITED`
- `INCREMENTAL_PULL_REQUIRED=YES`
- `ATOMIC_LOCAL_RECONCILIATION_REQUIRED=YES`
- `CURSOR_ADVANCE_BEFORE_LOCAL_COMMIT=PROHIBITED`

## Conflict handling

Forge must not use silent last-write-wins for due-action lifecycle fields.

If two devices change the same due-action version incompatibly, such as:

```text
Device A: COMPLETED
Device B: RESCHEDULED
```

the synchronized record becomes:

```text
CONFLICT_REVIEW_REQUIRED
```

Both candidates must remain available for human review.

Acknowledgement-only conflicts may use the monotonic merge rule because
they do not change the commercial action.

- `SILENT_LAST_WRITE_WINS=PROHIBITED`
- `DUE_ACTION_CONFLICT_REVIEW_REQUIRED=YES`
- `ACKNOWLEDGEMENT_MONOTONIC_AUTO_MERGE=AUTHORIZED`
- `HUMAN_LIFECYCLE_CONFLICT_RESOLUTION_REQUIRED=YES`

## Local-first runtime

```text
App bootstrap
→ read IndexedDB
→ resolve due actions immediately
→ render Mi Día / Alfred / Smart Widget
→ synchronize when online
→ reconcile
→ rerender if effective state changed
```

Authorized triggers:

1. local application bootstrap;
2. focus or app resume;
3. `visibilitychange` to visible;
4. successful local due-action mutation;
5. successful synchronization or conflict detection;
6. a 60-second tick while Mi Día is visible.

- `LOCAL_FIRST_RENDER_REQUIRED=YES`
- `REMOTE_REFRESH_BLOCKS_RENDER=NO`
- `OFFLINE_DUE_ACTION_VISIBILITY=REQUIRED`
- `VISIBLE_RUNTIME_TICK_SECONDS=60`
- `ONLINE_EVENT_ROLE=SYNC_TRIGGER_ONLY`

## Due-action priority

Using an explicit deterministic `asOf` and advisor-local time zone:

- `OVERDUE`
- `DUE_NOW`
- `DUE_TODAY`
- `UPCOMING_24H`
- `NOT_DUE`
- `INVALID_OR_UNKNOWN`
- `SYNC_CONFLICT`

The resolver must operate entirely from the local replica while offline.

A seen alert may be visually deprioritized, but an overdue action cannot
be hidden merely because it was seen.

- `OFFLINE_CLASSIFICATION_REQUIRED=YES`
- `SEEN_OVERDUE_ACTION_MAY_BE_HIDDEN=NO`
- `SEEN_OVERDUE_ACTION_MAY_BE_DEPRIORITIZED=YES`
- `DETERMINISTIC_PRIORITY_REQUIRED=YES`

## Service Worker boundary

The current Service Worker protects app-shell and cacheable GET resources.
It does not replace IndexedDB business-state storage, outbox semantics, or
multi-device synchronization.

- `SERVICE_WORKER_APP_SHELL_ROLE=PRESERVED`
- `CACHE_STORAGE_AS_DUE_ACTION_DATABASE=PROHIBITED`
- `INDEXEDDB_AS_DUE_ACTION_DATABASE=REQUIRED`

## Background alert boundary

Offline-first guarantees local operational continuity while the installed
application can execute.

It does not automatically guarantee an exact alert while the application
is fully closed.

True app-closed delivery remains separately gated and requires Push API,
device registration, server scheduling or native alarm integration,
deduplication, cancellation, quiet hours, retry, and delivery audit.

- `APP_CLOSED_NOTIFICATION_STATUS=NOT_IMPLEMENTED`
- `BACKGROUND_PUSH_STATUS=BLOCKED`
- `LOCAL_IN_APP_REMINDER_STATUS=AUTHORIZED`

## Authorized implementation paths

```text
advisor-os/offline/due-action-indexeddb-store.js
advisor-os/offline/due-action-outbox-service.js
advisor-os/offline/due-action-sync-service.js
advisor-os/offline/due-action-acknowledgement-contract.js
advisor-os/sales-pipeline/prospect-due-action-priority-contract.js
advisor-os/home/mi-dia-follow-up-read-model.js
advisor-os/home/mi-dia-due-action-runtime.js
tests/nfast-09-stage3-offline-first-*
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3_*
```

## Required tests

Stage 3 must prove:

- local-first render before remote response;
- due actions remain available without network;
- advisor partition isolation;
- durable outbox across reload;
- deterministic mutation IDs;
- outbox deletion only after remote acknowledgement;
- incremental synchronization without full cache deletion;
- synchronization cursor atomicity;
- global seen state synchronization;
- seen state does not complete or delete the due action;
- acknowledgement monotonic merge;
- rescheduling creates a new acknowledgement version;
- completion and cancellation remove local priority;
- incompatible multi-device lifecycle conflict detection;
- stale local data labeling;
- deterministic time-zone-safe due buckets;
- no sensitive fields in IndexedDB;
- no provider invocation;
- no message generation or send;
- no background-push claim;
- regression safety for NFAST-08 and NFAST-09 Stages 1–2.

## Explicit non-authorizations

- `SUPABASE_SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `EDGE_FUNCTION_AUTHORIZED=NO`
- `SERVER_CRON_AUTHORIZED=NO`
- `PUSH_PROVIDER_AUTHORIZED=NO`
- `DEVICE_TOKEN_PERSISTENCE_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Corrected gate result

- `OLD_STAGE_3_GATE_IMPLEMENTATION_AUTHORITY=REVOKED`
- `OFFLINE_FIRST_MULTIDEVICE_STAGE_3_IMPLEMENTATION_AUTHORIZED=YES`
- `INDEXEDDB_DUE_ACTION_STORE_AUTHORIZED=YES`
- `DURABLE_OUTBOX_AUTHORIZED=YES`
- `INCREMENTAL_SYNC_AUTHORIZED=YES`
- `GLOBAL_ACKNOWLEDGEMENT_SYNC_AUTHORIZED=YES`
- `DUE_ACTION_DELETE_ON_READ=PROHIBITED`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `NEXT_STAGE=NFAST-09_STAGE_3_OFFLINE_FIRST_MULTIDEVICE_IMPLEMENTATION`
- `NEXT_STAGE_STATUS=AUTHORIZED`
