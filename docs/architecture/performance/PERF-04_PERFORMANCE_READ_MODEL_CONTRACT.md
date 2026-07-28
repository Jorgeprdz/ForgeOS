# PERF-04 — Performance Read Model Contract

```text
PERF_04_PERFORMANCE_READ_MODEL_CONTRACT=IMPLEMENTED_PENDING_ACCEPTANCE
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
SOURCE_COMMIT=4e1d7ef0ab09c4c7167afa3f06f6de099a6b6917
DAILY_READ_MODEL_SCHEMA=performance-daily-read-model.v1
PERIOD_READ_MODEL_SCHEMA=performance-period-read-model.v1
READ_RUNTIME_SCHEMA=performance-read-runtime.v1
ACTIVITY_ELIGIBILITY_AUTHORITY=YES
PERFORMANCE_POLICY_AUTHORITY=YES
RANKING_AUTHORITY=NO
HUMAN_WORTH_AUTHORITY=NO
ENFORCEMENT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Decision

PERF-04 creates the stable read-only contract that Dashboard, Activity and
future product surfaces may consume. Consumers must not recalculate points,
targets, progress, activity mix or period summaries.

## Runtime API

```text
readDay({ evaluationDate, asOf? })
readPeriod({ evaluationDateFrom, evaluationDateTo, asOf? })
```

Both operations delegate to `performance-period-runtime.v1` and project its
accepted results into immutable, view-neutral read models.

## Daily read model

The daily model exposes identity, policy, date, snapshot, points, target,
remaining and excess points, capped and uncapped progress, activity mix,
zero-point activity, exclusions and authority boundaries.

## Period read model

The period model exposes accumulated points and target, average points per day,
daily status counts, a compact daily series, accumulated activity mix and
accumulated exclusions.

## Boundary

This contract contains no localized copy, colors, icons, layout, component
selection, persistence, RPC or database mutation. It is consumable data, not a
UI implementation.

Performance read models never expose human levels, advisor rankings,
personality judgments, punishment, enforcement or manager override.

## Next

`PERF-05_PERFORMANCE_SUPABASE_READ_COMPOSITION`
