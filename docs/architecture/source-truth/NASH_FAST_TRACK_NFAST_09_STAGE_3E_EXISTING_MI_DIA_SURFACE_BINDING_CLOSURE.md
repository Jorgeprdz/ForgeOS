# NASH Fast Track — NFAST-09 Stage 3E Existing Mi Día Surface Binding Closure

## Status

- `STAGE_ID=NFAST-09_STAGE_3E_EXISTING_MI_DIA_SURFACE_BINDING`
- `STATUS=COMPLETE_AND_PUSHED`
- `RUNTIME_VERSION=NFAST-09.3E`
- `SOURCE_GOVERNANCE_COMMIT=7dfa8e264bfc39e8ca6b514c23e3949b9203aec4`
- `SOURCE_REMOTE_ACCEPTANCE_COMMIT=1cabe5602adabbea441b9f8ae9b6f88d5e9ffcc5`
- `MI_DIA_LOCAL_FIRST_BINDING=YES`
- `EXISTING_PRIMARY_SURFACE_BINDING=YES`
- `NEW_PERMANENT_DASHBOARD_SECTION=NO`
- `SMART_WIDGET_BINDING=NO`
- `STATIC_PREVIEW_MUTATION=NO`
- `BACKGROUND_PUSH=NO`
- `SUPABASE_SCHEMA_MUTATION=NO`
- `SUPABASE_REMOTE_MUTATION=NO`
- `MAIN_MUTATION=NO`
- `NFAST_10_AUTHORIZED=NO`

## Product correction

Stage 3E does not add a new `Seguimientos de hoy` strip.

The local-first due-action read model hydrates the already-existing
`#dash-sales-nba` primary intervention surface.

NFAST-09 remains one signal family. It does not become a parallel dashboard or
a permanent competing home section.

## Local-first behavior

The runtime reads the NFAST-09 IndexedDB replica before waiting for network
synchronization and classifies actions in this order:

```text
SYNC_CONFLICT
OVERDUE
DUE_NOW
DUE_TODAY
UPCOMING_24H
```

A seen overdue action remains visible. Completed, cancelled, tombstoned,
future-snoozed and not-due actions are excluded from current work.

The first item becomes the existing primary recommendation. Remaining items are
preserved in `AppState.miDiaDueActions.supportingQueue` for future binding into
existing queue surfaces without creating a second authority.

## Runtime order

```text
authenticated advisor from AppState
→ local IndexedDB read
→ deterministic due-action read model
→ existing-surface adapter
→ immediate hydration of #dash-sales-nba
→ legacy dashboard loading continues
→ Stage 3B/3C incremental synchronization
→ local replica read again
→ rerender only when the effective fingerprint changes
```

The runtime responds to bootstrap, focus, online, visible
`visibilitychange`, `nfast09:due-action-mutated`, and a 60-second visible tick.

## Existing-surface consumer behavior

The Advisor Sales NBA consumer now supports:

- separate `subjectId` and `subjectLabel`;
- contextual kicker;
- explicit recommendation source;
- optional suppression of response buttons;
- configurable human-authority boundary text.

For NFAST-09 due actions, response buttons are suppressed because Stage 3E does
not yet implement due-action write commands. The available action is to open the
prospect or pipeline for human review.

## Static preview boundary

The Forge Alive static preview visually contains the richer desktop and mobile
surfaces discussed during product review.

Stage 3E does not mutate that static preview because it is not the production
runtime authority.

The supporting queue is preserved in the live read model so a later governed
Forge Alive runtime binding can reuse existing visual surfaces without
inventing a new section.

## Privacy and authority

The presentation model contains only opaque prospect reference, approved
display name, next-action type/time, lifecycle/version, acknowledgement and
synchronization state, freshness and conflict indication.

It contains no raw notes, phone, WhatsApp, email, health, income, family,
provider payload, draft or message text.

Forge does not contact the prospect automatically.

## Explicit non-authorizations

- `NEW_DASHBOARD_SECTION_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `STATIC_PREVIEW_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `APP_CLOSED_NOTIFICATION_AUTHORIZED=NO`
- `DUE_ACTION_WRITE_COMMANDS_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `SUPABASE_SCHEMA_CHANGE_AUTHORIZED=NO`
- `SUPABASE_REMOTE_MUTATION_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage

- `NEXT_STAGE=NFAST-09_STAGE_3F_PIPELINE_DUE_ACTION_WRITE_BINDING`
- `NEXT_STAGE_STATUS=NOT_YET_IMPLEMENTED`
