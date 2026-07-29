# REP-06 — Performance Report Provider

```text
REP_06_PERFORMANCE_REPORT_PROVIDER=IMPLEMENTED_ACCEPTED
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=8d72ae385a7cb953c6259c0fee827e678b545269
PERFORMANCE_REPORT_PROVIDER_SCHEMA=performance-report-provider.v1
REPORT_DEFINITION_ID=performance-summary
REPORT_DEFINITION_VERSION=performance-summary.v1
PERFORMANCE_READ_AUTHORITY=YES
PERFORMANCE_SCORING_AUTHORITY=NO
UNIVERSAL_AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-06 is the first productive domain provider for the universal reporting
kernel. It adapts accepted `performance-period-read-model.v1` results into
governed report slices.

It does not recalculate points, targets, eligibility, exclusions or statuses.
Those facts remain owned by the existing Performance runtime and scoring policy.

The provider supports contiguous inclusive date slices and exposes:

Dimensions:

- `evaluationDate`
- `targetStatus`

Measures:

- `totalPoints`
- `targetPoints`
- `remainingPoints`
- `eligibleActivityCount`

All measures are additive and declare `SUM` semantics.

Next: `REP-07_COMMISSIONS_REPORT_PROVIDER`.
