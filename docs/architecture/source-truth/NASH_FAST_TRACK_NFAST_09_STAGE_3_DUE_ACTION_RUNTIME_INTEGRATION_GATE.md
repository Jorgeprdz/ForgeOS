# NASH Fast Track — NFAST-09 Stage 3 Due Action Runtime Integration Gate

## Authorization record

- `STAGE_ID=NFAST-09_STAGE_3_DUE_ACTION_RUNTIME_INTEGRATION`
- `AUTHORIZATION_DATE=2026-07-24`
- `AUTHORIZATION_TIMESTAMP_UTC=2026-07-25T00:52:19Z`
- `AUTHORIZING_PRINCIPAL=JORGE_PALACIOS_PRODUCT_AND_REPOSITORY_OWNER`
- `DIRECT_AUTHORIZATION_PHRASE=ECHALE NFAST-09 STAGE-3`
- `PRODUCT_OWNER_AUTHORIZATION=YES`
- `SOURCE_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection`
- `SOURCE_COMMIT=d8b80a84beb65e8c140e9e62dd014de1bb7d6a3e`
- `NFAST_09_STAGE_3_IMPLEMENTATION_AUTHORIZED=YES`
- `SUPABASE_MUTATION_AUTHORIZED=NO`
- `SCHEMA_CHANGE_AUTHORIZED=NO`
- `RLS_CHANGE_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `AUTOMATIC_MESSAGE_SEND_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Product decision

Forge must not depend on NASH or an LLM remembering a future date.

The current operational due-action authority is:

```text
prospects.next_action_at
prospects.next_action_type
```

These fields represent the current mutable schedule. Reprogramming a
follow-up updates this authority.

The commercial Timeline event `FOLLOW_UP_PLANNED` remains immutable
evidence that a schedule was created or changed. It is not the active
scheduler because multiple historical Timeline events may exist after
rescheduling.

- `CURRENT_SCHEDULE_AUTHORITY=PROSPECT_NEXT_ACTION_FIELDS`
- `TIMELINE_ROLE=IMMUTABLE_EVIDENCE`
- `TIMELINE_IS_ACTIVE_SCHEDULER=NO`

## Authorized Stage 3 architecture

```text
prospects.next_action_at / next_action_type
→ governed due-action read service
→ deterministic due-action priority contract
→ Mi Día priority read model
→ Alfred primary card or Follow-up Smart Widget
```

Stage 3 may read only active advisor-owned prospects through existing RLS.
It may not bypass the productive prospect authority.

## Authorized runtime triggers

The due-action resolver may run on:

1. authenticated application bootstrap;
2. window focus or application resume;
3. `visibilitychange` when the application becomes visible;
4. browser `online` after connectivity returns;
5. successful creation, update, completion, cancellation, or rescheduling
   of a prospect next action;
6. a 60-second tick only while the Mi Día surface is visible.

- `BACKGROUND_POLLING_WHILE_APP_CLOSED=NO`
- `VISIBLE_RUNTIME_TICK_SECONDS=60`
- `SERVER_CRON_REQUIRED_FOR_IN_APP_WIDGET=NO`
- `LLM_TRIGGER_REQUIRED=NO`

## Authorized due-action buckets

Using an explicit deterministic `asOf` and advisor-local time zone:

- `OVERDUE`: `next_action_at < asOf`
- `DUE_NOW`: from `asOf` through the next 30 minutes
- `DUE_TODAY`: after 30 minutes through local end of day
- `UPCOMING_24H`: after local end of day through the next 24 hours
- `NOT_DUE`: outside the active horizon
- `INVALID_OR_UNKNOWN`: missing or invalid schedule data

Ranking must prefer:

1. overdue actions;
2. due-now actions;
3. due-today actions;
4. upcoming actions;
5. older missed commitments before newer equivalent commitments.

Any opportunity-value, probability, or revenue weighting requires
separately governed evidence. Stage 3 must not invent those values.

## Authorized read model

The Mi Día candidate may expose only a minimized presentation model:

```text
prospectReference
approvedDisplayName
nextActionType
nextActionAt
dueBucket
overdueMinutes
priorityRank
whyNow
sourceAuthority
evidenceReferences
actionRoute
messageGoalReference
```

The read model must not expose:

- raw notes;
- unrestricted initial context;
- phone, WhatsApp, or email values;
- health, income, family, or profile-sensitive fields;
- a generated message;
- a send command;
- provider output.

The action route may open the governed prospect detail or human-reviewed
message workflow. It must not send automatically.

## Mi Día and Smart Widget behavior

The highest-priority due action may become the Alfred primary card when it
is the most important current action.

Supporting candidates may appear in a Follow-up Smart Widget.

Every candidate must show:

- what is due;
- why it appears now;
- the governing date and source;
- overdue or upcoming status;
- a human-controlled next action.

The widget remains read-only until the user chooses an existing governed
action.

- `ALFRED_PRIMARY_CARD_CANDIDATE=AUTHORIZED`
- `FOLLOW_UP_SMART_WIDGET_CANDIDATE=AUTHORIZED`
- `STATIC_ALWAYS_VISIBLE_CARD=NO`
- `HUMAN_FINAL_AUTHORITY=YES`
- `AUTO_OPEN_WHATSAPP=NO`
- `AUTO_GENERATE_MESSAGE=NO`
- `AUTO_SEND_MESSAGE=NO`

## Current notification infrastructure classification

Existing notification modules are not accepted as background delivery
authority for Stage 3.

Current repository evidence indicates:

- browser notification permission and `new Notification(...)`;
- in-memory notification object creation;
- push candidate objects with `delivered=false`;
- an array-based queue helper.

Stage 3 must not claim that these provide durable scheduling, device-token
registration, backend delivery, retries, deduplication, or delivery audit.

- `REAL_BACKGROUND_PUSH_AVAILABLE=NO`
- `DURABLE_NOTIFICATION_QUEUE_AVAILABLE=NO`
- `DEVICE_TOKEN_REGISTRY_AVAILABLE=NO`
- `SERVER_SCHEDULER_AVAILABLE=NO`
- `DELIVERY_AUDIT_AVAILABLE=NO`

## Background push boundary

A notification while Forge is closed requires a separate later gate that
must define and implement:

1. device permission and token registration;
2. advisor-device ownership and revocation;
3. server-side scheduled evaluation;
4. time-zone-safe due calculation;
5. notification deduplication and idempotency;
6. retry and failure handling;
7. quiet hours and user preferences;
8. delivery audit without message-content leakage;
9. cancellation after completion or rescheduling.

Until that gate passes:

- `BACKGROUND_PUSH_STATUS=BLOCKED`
- `APP_CLOSED_NOTIFICATION_STATUS=NOT_IMPLEMENTED`

## Authorized implementation paths

```text
advisor-os/sales-pipeline/prospect-due-action-priority-contract.js
advisor-os/sales-pipeline/prospect-due-action-read-service.js
advisor-os/home/mi-dia-follow-up-read-model.js
advisor-os/home/mi-dia-due-action-runtime.js
tests/nfast-09-stage3-*
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3_*
```

Existing Mi Día or Forge Alive entrypoints may be changed only through a
narrow tested binding. Broad visual redesign is not authorized.

## Required tests

Stage 3 must prove:

- deterministic overdue and due-soon classification;
- local-time-zone day boundaries;
- stable priority ordering;
- no cross-advisor data;
- no archived prospect candidates;
- no raw or sensitive fields in the read model;
- refresh on authorized runtime events;
- no polling while hidden;
- no duplicate visible candidates;
- rescheduling removes stale priority;
- completion or cancellation removes due priority;
- no provider invocation;
- no message generation or send;
- no schema or RLS mutation;
- no background-push claim;
- regression safety for NFAST-08 and NFAST-09 Stages 1–2.

## Explicit non-authorizations

- `PUSH_PROVIDER_INTEGRATION_AUTHORIZED=NO`
- `EDGE_FUNCTION_AUTHORIZED=NO`
- `CRON_AUTHORIZED=NO`
- `DEVICE_TOKEN_PERSISTENCE_AUTHORIZED=NO`
- `NOTIFICATION_DELIVERY_AUDIT_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `VISUAL_REDESIGN_AUTHORIZED=NO`
- `DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Gate result

- `DUE_ACTION_PRIORITY_CONTRACT_AUTHORIZED=YES`
- `DUE_ACTION_READ_SERVICE_AUTHORIZED=YES`
- `MI_DIA_READ_MODEL_AUTHORIZED=YES`
- `VISIBLE_RUNTIME_BINDING_AUTHORIZED=YES`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `NEXT_STAGE=NFAST-09_STAGE_3_IMPLEMENTATION`
- `NEXT_STAGE_STATUS=AUTHORIZED`
