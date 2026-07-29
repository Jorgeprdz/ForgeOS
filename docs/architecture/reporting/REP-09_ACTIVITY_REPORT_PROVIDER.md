# REP-09 — Activity Report Provider

```text
REP_09_ACTIVITY_REPORT_PROVIDER=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=326896b7bb8997d93a8e477822bfde4746c1d83c
ACTIVITY_REPORT_PROVIDER_SCHEMA=activity-report-provider.v1
REPORT_DEFINITION_ID=activity-by-type
REPORT_DEFINITION_VERSION=activity-by-type.v1
ACTIVITY_READ_RUNTIME_SCHEMA=activity-read-runtime.v1
ACTIVITY_PERIOD_AGGREGATION_SCHEMA=activity-period-aggregation.v1
ACTIVITY_READ_AUTHORITY=YES
ACTIVITY_WRITE_AUTHORITY=NO
SCORING_AUTHORITY=NO
ELIGIBILITY_POLICY_AUTHORITY=NO
CORRECTION_AUTHORITY=NO
REVERSAL_AUTHORITY=NO
PIPELINE_WRITER_MUTATION_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-09 projects the frozen Activity period aggregation into the universal
reporting kernel. It consumes `activity-read-runtime.v1`; it does not read the
repository directly.

The provider uses one-day slices so `evaluationDate` remains a canonical
dimension while the universal aggregation runtime can safely build weeks,
months, quarters and years.

## Dimensions

- `evaluationDate`
- `activityType`

## Measures

- `observedActivityCount`
- `eligibleActivityCount`
- `suppressedActivityCount`

All measures are additive and use `SUM`.

REP-09 does not award points, redefine eligibility, append Activity records,
correct or reverse events, or mutate Pipeline. Performance remains the scoring
authority.

Next: `REP-10_PIPELINE_REPORT_PROVIDER`.
