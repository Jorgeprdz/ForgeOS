# FES 08A — Canonical FES Event to Activity Lineage Bridge

```text
PHASE=FES_08A_CANONICAL_FES_EVENT_TO_ACTIVITY_RECORD_BRIDGE
STATUS=CLOSED
IMPLEMENTATION_COMMIT=99b945bc104949e8babff65cce49926464fd900a
LINEAGE_SCHEMA=forge.fes_activity_lineage.v1
PROJECTION_SCHEMA=fes-event-activity-projection.v1
ACTIVITY_SCHEMA=activity-record.v1
REMOTE_CI_RUN_ID=30399170717
REMOTE_CI_CONCLUSION=success
```

## Canonical decision

A confirmed FES event remains the source event truth. ActivityRecord v1 is a
deterministic, append-only projection of that source; it is not a second
independent event. Generic productive interactions do not become
`pipeline-transition.v1`.

`payload.prospect_reference` is the governed secondary lineage. The primary
subject remains the call or appointment. The reference is copied only from the
validated observation prospect identity, stays tenant-bound and contains no
contact data or private message/objection content.

Historical events without that lineage remain readable. They do not project to
a prospect Activity timeline without a separately verified reconciliation
source.

## Initial semantic intersection

| Canonical FES event | ActivityRecord type |
| --- | --- |
| `CALL_NOT_ANSWERED_CONFIRMED` | `CONTACT_ATTEMPTED` |
| `CALL_CONNECTED_CONFIRMED` | `CONVERSATION_COMPLETED` |
| `APPOINTMENT_SCHEDULED` | `INITIAL_APPOINTMENT_SCHEDULED` |
| `APPOINTMENT_HELD` | `INITIAL_APPOINTMENT_COMPLETED` |

All other canonical FES events return
`IGNORED / NO_ACTIVITY_SEMANTIC_EQUIVALENCE`. They remain available to the FES
ledger and its governed projections.

## Boundaries

- Activity persistence uses only `activity_records_append_v1` and
  `activity_records_list_v1`.
- Browser composition is parity-tested against the accepted Node
  ActivityRecord authority.
- Exact replay is idempotent and divergent replay fails closed.
- No score, weight, points or multiplier is emitted.
- Performance remains a read-only Activity consumer.
- No database migration or direct table access was introduced.

## Next

`FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION` resumes on the same branch, with
human confirmation required before productive Activity projection.
