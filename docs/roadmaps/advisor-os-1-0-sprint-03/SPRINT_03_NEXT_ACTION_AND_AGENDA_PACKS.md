# Advisor OS 1.0 — Sprint 03: Next Action and Agenda

```text
SPRINT=03_NEXT_ACTION_AND_AGENDA
STATUS=ACTIVE_CANDIDATE
DATE=2026-08-02
PARENT=ADVISOR_OS_1_0_FINAL_SPRINT
RUNTIME_AUTHORITY=NFAST_09_DUE_ACTION_RUNTIME
REBUILD_FROM_ZERO=FORBIDDEN
```

## Objective

Close the operating loop in which every active commercial case has an explicit resolution and the advisor can see, execute, postpone, reschedule or close the work from one coherent agenda.

```text
ACTIVE_CASE
→ NEXT_ACTION_SCHEDULED
  | WAITING_FOR_EXTERNAL_EVENT
  | CLOSED_WON
  | CLOSED_NOT_NOW
  | CLOSED_LOST
  | DISCARDED
```

The word `FOLLOW_UP` is not a valid terminal state by itself.

## Existing foundation

The repository already contains NFAST-09.3F as the productive due-action authority:

```text
advisor-os/sales-pipeline/pipeline-due-action-runtime.js
```

It already provides:

- advisor-bound local-first writes;
- IndexedDB persistence;
- mutation journal and outbox;
- secondary Supabase synchronization;
- idempotent mutation receipts;
- runtime close and session isolation;
- prohibition of direct remote table writes from the consumer.

Command OS already delegates a confirmed follow-up write to this runtime through:

```text
platform/commands/person-follow-up-authority.js
```

Sprint 03 must extend and project this authority. It must not create a parallel task database, agenda truth or generic todo engine.

## Pack sequence

```text
PACK_01=DISCOVERY_AND_AUTHORITY_RECONCILIATION
PACK_02=NEXT_ACTION_STATE_MODEL
PACK_03=DAILY_AND_WEEKLY_AGENDA_READ_MODEL
PACK_04=OVERDUE_AND_RESCHEDULING_LOOP
PACK_05=TIMELINE_AND_HOME_CONTINUITY
PACK_06=GOOGLE_CALENDAR_HANDOFF
PACK_07=COMMAND_OS_AND_CONTEXTUAL_ENTRYPOINTS
PACK_08=END_TO_END_ACCEPTANCE
```

## Pack 01 — Discovery and authority reconciliation

```text
STAGE_01A=EXISTING_ACTION_RUNTIME_INVENTORY
STAGE_01B=AGENDA_AND_TIMELINE_SURFACE_INVENTORY
STAGE_01C=CANONICAL_AUTHORITY_SELECTION
STAGE_01D=DUPLICATE_AND_LEGACY_QUARANTINE
STAGE_01E=GAP_AND_DEPENDENCY_MAP
```

Exit gate:

```text
DUE_ACTION_WRITE_AUTHORITY=NFAST_09
AGENDA_IS_PROJECTION=YES
TIMELINE_IS_PROJECTION=YES
HOME_IS_PROJECTION=YES
CALENDAR_IS_EXTERNAL_HANDOFF=YES
PARALLEL_TASK_ENGINE=FORBIDDEN
```

## Pack 02 — Next Action state model

Required resolution vocabulary:

```text
NEXT_ACTION_SCHEDULED
WAITING_FOR_EXTERNAL_EVENT
CLOSED_WON
CLOSED_NOT_NOW
CLOSED_LOST
DISCARDED
```

Required action operations:

```text
SCHEDULE
RESCHEDULE
COMPLETE
CANCEL
MARK_WAITING
CLOSE_CASE
```

Rules:

- An active case cannot remain without a resolution.
- Unknown timestamps remain unknown.
- Completion and cancellation require explicit intent.
- A completed action does not invent the commercial outcome.
- Closing the case and completing an action are distinct commands.

## Pack 03 — Daily and weekly agenda read model

Required sections:

```text
OVERDUE
TODAY
UPCOMING_7_DAYS
WAITING
UNSCHEDULED_ACTIVE_CASES
```

The agenda is a read model over canonical action and commercial state. It does not own persistence.

Required sorting:

```text
OVERDUE=OLDEST_DUE_FIRST
TODAY=TIME_ASCENDING
UPCOMING=DATE_TIME_ASCENDING
UNSCHEDULED=HIGHEST_COMMERCIAL_PRIORITY_FIRST
```

## Pack 04 — Overdue and rescheduling loop

Required advisor actions:

```text
DO_NOW
MARK_DONE
RESCHEDULE
WAITING_FOR_CLIENT
CANCEL_ACTION
CLOSE_CASE
```

No silent rollover is allowed. An overdue action stays overdue until the advisor or a canonical authority changes it.

## Pack 05 — Timeline and Home continuity

Each mutation must produce a receipt that can be projected into:

- Person Timeline;
- Pipeline card;
- Home priority surface;
- daily activity context;
- contextual notification input.

The projection must distinguish:

```text
ACTION_SCHEDULED
ACTION_RESCHEDULED
ACTION_COMPLETED
ACTION_CANCELLED
CASE_WAITING
CASE_CLOSED
```

## Pack 06 — Google Calendar handoff

The current closure target is a governed external handoff, not OAuth calendar synchronization.

```text
FORGE_DRAFT
→ USER_REVIEW
→ OPEN_GOOGLE_CALENDAR
→ USER_SAVES_EXTERNALLY
```

Rules:

```text
CALENDAR_OPENED≠EVENT_SAVED
HANDOFF_OPENED=RECEIPT_ALLOWED
EVENT_SAVED=UNKNOWN_UNLESS_CONFIRMED
TOKENS_STORED=0
OAUTH_REQUIRED=NO
```

## Pack 07 — Command OS and contextual entrypoints

Required commands include:

- “¿Qué tengo hoy?”
- “Muéstrame vencidos.”
- “Reagenda este seguimiento para mañana a las 6.”
- “Marca esta acción como realizada.”
- “Estoy esperando respuesta del cliente.”

Read commands may execute immediately. Write commands must use the established Pack 06 preview and confirmation flow from Command OS.

## Pack 08 — End-to-end acceptance

Required scenarios:

1. Schedule a next action from Persona.
2. See it in Agenda and Home.
3. Let it become overdue without silent mutation.
4. Reschedule it with explicit confirmation.
5. Complete it without inventing the sale outcome.
6. Mark a case waiting for an external event.
7. Close a case with an explicit terminal reason.
8. Open a Google Calendar draft without claiming it was saved.
9. Logout and verify advisor-bound state scrub.
10. Repeat on desktop, tablet and mobile.

## Sprint exit gate

```text
ACTIVE_CASE_WITHOUT_RESOLUTION=0
DAILY_AGENDA=PASS
WEEKLY_AGENDA=PASS
OVERDUE_LOOP=PASS
RESCHEDULING=PASS
TIMELINE_CONTINUITY=PASS
HOME_CONTINUITY=PASS
CALENDAR_HANDOFF=PASS
COMMAND_OS_READS=PASS
COMMAND_OS_WRITES=PASS
UNAPPROVED_MUTATIONS=0
UNKNOWN_AS_ZERO=0
```

## Immediate next

```text
NEXT=SPRINT_03_PACK_01_DISCOVERY_AND_AUTHORITY_RECONCILIATION
THEN=SPRINT_03_PACK_02_NEXT_ACTION_STATE_MODEL
```
