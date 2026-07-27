# ACT-06 — Activity Period Aggregations

```text
ACT_06_ACTIVITY_PERIOD_AGGREGATIONS=IMPLEMENTED_ACCEPTED
SOURCE_COMMIT=f3d4ec4feb7231b2e7631decfbff13c4d7c71b79
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
AGGREGATION_SCHEMA=activity-period-aggregation.v1
AGGREGATION_AUTHORITY=ACTIVITY_COUNTS_ONLY
POINT_AUTHORITY=PERFORMANCE_ONLY
WORK_CALENDAR_AUTHORITY=NOT_ASSUMED
PIPELINE_WRITER_MUTATION=NO
PIPELINE_UI_MUTATION=NO
FES_MUTATION=NO
MUI_MUTATION=NO
MAIN_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Boundary

ACT-06 creates the first governed period summary over canonical
`ActivityRecord` history:

```text
ActivityRepository snapshot
  -> as-of relation reconciliation
  -> evaluation-date period filter
  -> immutable activity-period-aggregation.v1
```

The aggregation is not a score, ranking, coaching conclusion or work-calendar
decision. Performance remains the only future authority allowed to assign point
rules or versions.

## Query contract

A period query requires:

- `organizationId`;
- `advisorId`;
- `evaluationDateFrom`;
- `evaluationDateTo`;
- `asOf`.

`evaluationDate` is the governed local calendar date established by the
ActivityRecord contract. `asOf` defines which records, corrections and reversals
were known at the snapshot boundary.

## Full-snapshot requirement

The application service reads the complete advisor Activity snapshot through the
repository port instead of reading only the requested period.

This is required because a correction or reversal recorded after an activity's
evaluation date may suppress that earlier activity. Repository pagination is
bounded, cursor repetition is rejected and `maxRecords` prevents unbounded
memory growth.

## Aggregation semantics

The output exposes:

- observed records by Activity type;
- confirmed-and-verified eligible activities by type;
- lifecycle, evidence and source-system counts;
- observed and eligible evaluation dates;
- unique eligible prospect, opportunity, appointment and policy relations;
- first and last occurrence instants;
- correction and reversal controls;
- eligible activities suppressed by correction or reversal;
- records excluded because they were recorded after `asOf`.

Corrections suppress the referenced eligible activity. Reversals take precedence
when both controls target the same record. A relation whose target is absent from
the as-of snapshot is rejected as incomplete history.

## Prohibited authority

The aggregation contains no:

- points;
- score;
- weight;
- multiplier;
- manager ranking;
- coaching recommendation;
- evaluable-day declaration.

## Persistence

ACT-06 uses the existing repository port and deployed persistence adapter. It
does not create a new table, RPC, migration or remote database mutation.

## Next

`ACT-07_ACTIVITY_FEED_PROJECTION`
