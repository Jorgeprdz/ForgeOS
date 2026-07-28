# PERF-03 — Performance Period Runtime

```text
PERF_03_PERFORMANCE_PERIOD_RUNTIME=IMPLEMENTED_PENDING_ACCEPTANCE
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
SOURCE_COMMIT=9fc4375226bc4b4e67a008320a611990cbfb44ef
RUNTIME_SCHEMA=performance-period-runtime.v1
PERIOD_RESULT_SCHEMA=performance-period-result.v1
POLICY_ID=smnyl-advisor-daily-25.v1
DAILY_TARGET_POINTS=25
MAX_PERIOD_DAYS=31
ACTIVITY_ELIGIBILITY_AUTHORITY=YES
PERFORMANCE_POLICY_AUTHORITY=YES
RANKING_AUTHORITY=NO
HUMAN_WORTH_AUTHORITY=NO
ENFORCEMENT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Purpose

PERF-03 composes the frozen `activity-read-runtime.v1` with the accepted
`performance-scoring-policy.v1`. It turns Activity period aggregation into a
read-only daily score and an inclusive daily period series.

## Runtime capabilities

- `scoreDay({ evaluationDate, asOf? })` performs one Activity aggregation and
  returns `performance-score-projection.v1`;
- `scorePeriod({ evaluationDateFrom, evaluationDateTo, asOf? })` performs one
  daily aggregation per calendar date using the same as-of snapshot;
- period ranges are inclusive and limited to 31 days;
- empty days remain present with zero points;
- corrections, reversals, evidence and confirmation remain Activity authority;
- Performance owns only policy application and period summarization.

## Period result

`performance-period-result.v1` includes:

- authority-bound organization and advisor;
- policy identity and daily target;
- ordered daily projections;
- total and target points;
- remaining points and period target status;
- average points per day;
- counts of met, exceeded and below-target days;
- eligible, future-excluded and suppressed Activity counts.

## Boundaries

The runtime does not accept organization or advisor overrides. It does not
write Activity, persist projections, call Supabase directly, create rankings,
judge advisor worth, enforce behavior or mutate UI.

## Next

`PERF-04_PERFORMANCE_READ_MODEL_CONTRACT`
