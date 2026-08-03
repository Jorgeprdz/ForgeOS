# Sprint 03 — Pack 01: Discovery and Authority Reconciliation

```text
PACK=01_DISCOVERY_AND_AUTHORITY_RECONCILIATION
STATUS=CANDIDATE_COMPLETE
RUNTIME_MUTATION=0
DATABASE_MUTATION=0
```

## Ratified authority

```text
CANONICAL_DUE_ACTION_WRITE_AUTHORITY=NFAST_09.3F
PATH=advisor-os/sales-pipeline/pipeline-due-action-runtime.js
```

NFAST-09 owns the local-first mutation transaction for due actions. Its writer, IndexedDB store, sync journal, Supabase gateway and synchronization service remain the productive path.

Command OS is an input and preview surface only. Its existing `person-follow-up-authority.js` adapter may resolve a confirmed person to one active prospect and delegate the confirmed mutation to NFAST-09.

## Responsibility map

| Concern | Authority |
|---|---|
| Schedule/reschedule/complete/cancel due action | NFAST-09 runtime and writer |
| Person identity | Commercial Person authority |
| Active prospect resolution | Commercial source identity links |
| Agenda sections and sorting | Agenda read model |
| Pipeline card projection | Pipeline read model |
| Person history | Timeline projection |
| Home priorities | Home orchestrator projection |
| Natural-language entry | Command OS |
| Write preview and confirmation | Command OS governed write engine |
| External calendar draft | Calendar handoff adapter |
| Saved Google Calendar event | External Google authority / unknown until confirmed |

## Locks

```text
AGENDA_WRITES_DIRECTLY=NO
TIMELINE_WRITES_DIRECTLY=NO
HOME_WRITES_DIRECTLY=NO
COMMAND_OS_WRITES_TABLES_DIRECTLY=NO
CALENDAR_HANDOFF_MEANS_EVENT_SAVED=NO
SILENT_OVERDUE_ROLLOVER=NO
GENERIC_TODO_ENGINE=FORBIDDEN
```

## Existing productive capability

The current runtime already supports:

```text
LOCAL_WRITE_STARTED
→ LOCAL_COMMITTED
→ OUTBOX/JOURNAL
→ SECONDARY_SYNC
→ MUTATION_RECEIPT
```

The current Command OS adapter already proves one path:

```text
CONFIRMED_PERSON
→ UNIQUE_ACTIVE_PROSPECT
→ FOLLOW_UP_DRAFT
→ PREVIEW
→ CONFIRMATION
→ NFAST_09_EXECUTE
→ RECEIPT
```

## Gaps assigned to later packs

```text
GAP_01=COMPLETE_CANONICAL_OPERATION_VOCABULARY
OWNER=PACK_02

GAP_02=ACTIVE_CASE_RESOLUTION_MODEL
OWNER=PACK_02

GAP_03=DAILY_WEEKLY_AGENDA_READ_MODEL
OWNER=PACK_03

GAP_04=OVERDUE_AND_RESCHEDULE_UI_LOOP
OWNER=PACK_04

GAP_05=TIMELINE_AND_HOME_PROJECTIONS
OWNER=PACK_05

GAP_06=GOOGLE_CALENDAR_GOVERNED_HANDOFF
OWNER=PACK_06

GAP_07=COMMAND_OS_READ_AND_WRITE_COMMAND_SET
OWNER=PACK_07

GAP_08=CROSS_DEVICE_AND_SESSION_ACCEPTANCE
OWNER=PACK_08
```

## Pack 01 gate

```text
STAGE_01A_EXISTING_ACTION_RUNTIME_INVENTORY=PASS
STAGE_01B_AGENDA_AND_TIMELINE_SURFACE_INVENTORY=PASS_WITH_GAPS_ASSIGNED
STAGE_01C_CANONICAL_AUTHORITY_SELECTION=PASS
STAGE_01D_DUPLICATE_AND_LEGACY_QUARANTINE=PASS
STAGE_01E_GAP_AND_DEPENDENCY_MAP=PASS

PACK_01=PASS_CANDIDATE
MERGE_AUTHORIZATION=NOT_GRANTED
NEXT_AFTER_MERGE=SPRINT_03_PACK_02_NEXT_ACTION_STATE_MODEL
```
