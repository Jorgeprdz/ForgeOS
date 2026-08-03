# Advisor OS 1.0 — Sprint 03 One-Pass Closure

```text
SPRINT=03_NEXT_ACTION_AND_AGENDA
EXECUTION_MODE=ONE_PASS
PACKS=01_02_03_04_05_06_07_08
CANONICAL_DUE_ACTION_AUTHORITY=NFAST_09
```

## Delivered

- canonical next-action operation and resolution vocabulary;
- active-case resolution guard;
- daily and weekly Agenda read model;
- overdue persistence without silent rollover;
- explicit reschedule, complete and cancel transitions;
- waiting and terminal-case boundaries;
- Timeline, Pipeline, Home, Activity and notification-input projections;
- governed Google Calendar draft and handoff;
- Command OS read/write contracts;
- unified CI and safety gate.

## Product boundaries

```text
AGENDA_IS_PROJECTION=YES
TIMELINE_IS_PROJECTION=YES
HOME_IS_PROJECTION=YES
DIRECT_DATABASE_WRITES=0
SILENT_OVERDUE_ROLLOVER=0
COMPLETED_ACTION_IMPLIES_SALE=NO
CALENDAR_OPENED_IMPLIES_SAVED=NO
UNCONFIRMED_WRITES=0
UNKNOWN_AS_ZERO=0
```

## Pack result

```text
PACK_01_DISCOVERY_AND_AUTHORITY_RECONCILIATION=PASS
PACK_02_NEXT_ACTION_STATE_MODEL=PASS
PACK_03_DAILY_AND_WEEKLY_AGENDA_READ_MODEL=PASS
PACK_04_OVERDUE_AND_RESCHEDULING_LOOP=PASS
PACK_05_TIMELINE_AND_HOME_CONTINUITY=PASS
PACK_06_GOOGLE_CALENDAR_HANDOFF=PASS
PACK_07_COMMAND_OS_AND_CONTEXTUAL_ENTRYPOINTS=PASS
PACK_08_END_TO_END_ACCEPTANCE=CI_BOUND
```

## Acceptance scenarios

1. Schedule or reschedule through NFAST-09.
2. Project open actions into Overdue, Today and Upcoming.
3. Keep overdue actions overdue until an explicit mutation.
4. Complete an action without inventing a commercial outcome.
5. Mark a case waiting only through a registered case authority.
6. Close a case only with an explicit terminal resolution and reason.
7. Project receipts into Timeline, Pipeline, Home and Activity.
8. Open a Google Calendar draft while saved state remains unknown.
9. Reject direct persistence from Agenda and projection modules.
10. Preserve Command OS preview and confirmation governance.

```text
SPRINT_03_STATUS=PASS_CANDIDATE
MERGE_AUTHORIZATION=REQUIRES_GREEN_FINAL_SHA
NEXT_AFTER_MERGE=SPRINT_04_CONTEXTUAL_NOTIFICATIONS_AND_CLIPPY
```
