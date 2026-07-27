# ACT-05 — Pipeline to Activity Projection

```text
ACT_05_PIPELINE_TO_ACTIVITY_PROJECTION=IMPLEMENTED_ACCEPTED
SOURCE_COMMIT=567ea775b4479f232945a4c5ae3655bea972a3d5
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
PIPELINE_WRITER_MUTATION=NO
PIPELINE_UI_MUTATION=NO
FES_MUTATION=NO
MUI_MUTATION=NO
MAIN_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Boundary

ACT-05 establishes a one-way application boundary:

```text
validated Pipeline transition
  -> deterministic ActivityRecord projection
  -> injected ActivityRepository port
```

Pipeline remains the authority for commercial opportunity stage. Activity owns
the observed advisor action record. The projector does not write Pipeline,
recalculate opportunity stage, mutate the user interface, or promote an
unsupported commercial outcome into Activity truth.

## Canonical source contract

The projector accepts `pipeline-transition.v1` with:

- source event identity;
- organization, advisor, actor, prospect and opportunity identity;
- canonical `fromStage` and `toStage`;
- explicit evidence tokens;
- occurrence and recording instants;
- advisor time zone;
- optional appointment, policy, manager and metadata identity.

The source object is normalized, deep-frozen and never mutated.

## Supported semantic intersection

| Pipeline transition target | Required evidence | Activity |
|---|---|---|
| `CONTACTED` | `CONTACT_EVENT` | `CONTACT_ATTEMPTED` |
| `APPOINTMENT_SCHEDULED` | `APPOINTMENT_CONFIRMED` | `INITIAL_APPOINTMENT_SCHEDULED` |
| `DISCOVERY_COMPLETED` | `APPOINTMENT_DOCUMENTED` | `INITIAL_APPOINTMENT_COMPLETED` |
| `CLOSING_APPOINTMENT` | `CLOSING_APPOINTMENT_CONFIRMED` | `CLOSING_APPOINTMENT_SCHEDULED` |
| `APPLICATION` | `APPLICATION_REFERENCE` | `APPLICATION_SUBMITTED` |

The projector validates the allowed source-stage intersection and required
evidence before producing Activity truth.

## Explicit non-equivalences

- `ISSUED` is not `POLICY_PAID`.
- `CLOSED_WON` is not `POLICY_PAID`.
- `FOLLOW_UP_REQUIRED` is not `FOLLOW_UP_COMPLETED`.
- `PRESENTATION_COMPLETED` has no current Activity type.
- unsupported transitions return an immutable `IGNORED` result and never call
  the repository.

## Determinism and idempotency

The Activity ID is derived from source schema, organization, advisor and source
event ID. Exact replay resolves idempotently through the repository. Divergent
content using the same source event identity becomes a repository conflict.

The Activity truth key continues to be produced exclusively by
`createActivityTruthKey`.

## Safety

Pipeline metadata cannot embed scoring authority. Activity remains score-free.
The projection uses `PIPELINE_STATE`, `VERIFIED` evidence and a local evaluation
date derived from the advisor IANA time zone.

## Next

`ACT-06_ACTIVITY_PERIOD_AGGREGATIONS`
