# REP-16C — Activity Provider Universal Runtime and Chart-Ready Projection

Status: CLOSED
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
SOURCE_EVENT_AUTHORITY=FES_CANONICAL_ACTIVITY_EVENT
ACTIVITY_PROVIDER=activity-report-provider.v2
UNIVERSAL_RUNTIME=CONNECTED
CHART_READY_PROJECTION=IMPLEMENTED
UI_RENDERING=NOT_CONNECTED
PARALLEL_LEDGER=NO
SCORING_AUTHORITY=NO
AI_DECISION_AUTHORITY=NO
```

## Delivered

```text
advisor-os/reporting/runtime/activity-reporting-runtime.mjs
advisor-os/reporting/application/activity-chart-ready-projection.mjs
tests/activity-reporting-runtime-chart-ready-test.mjs
```

The Activity runtime composes the existing governed layers without bypassing them:

```text
FES source port
  -> Activity provider
  -> provider runtime
  -> universal reporting kernel
  -> universal period resolver
  -> universal aggregation runtime
  -> universal report model
  -> Activity chart-ready projection
```

The runtime binds organization and advisor authority from the source port. Callers cannot replace provider identity or report definition. Report requests may select governed dimensions and measures; chart-ready execution fixes the complete Activity shape:

```text
DIMENSIONS=evaluationDate+activityType
MEASURE=activityCount
TEMPORAL_GRAIN=DAY
```

## Deterministic visualization policy

For the complete daily Activity shape, Forge declares:

```text
COMPATIBLE=BAR+LINE+STACKED_BAR+TABLE
RECOMMENDED=STACKED_BAR
```

This is deterministic reporting policy, not UI or AI selection. The surface contains no styling, colors, components, routes or navigation.

Each point owns one universal report row and carries:

```text
pointId
x=evaluationDate
value=activityCount
rowKeys
report provenance
drilldown reportId+rowKeys+measureId+dimensionId+period
```

The projection does not recalculate Activity counts. It only projects values already calculated by the universal report.

## Missing and partial periods

```text
UNIVERSAL_REPORT_EMPTY -> NO_MATCHING_FACTS
PERIOD_IS_PARTIAL -> PARTIAL_CURRENT_PERIOD
NO_ZERO_POINT_FABRICATION=YES
```

Dates without reportable facts remain absent. The projection does not create zero-valued points.

## Defect reconciliation

The first validation run found no production runtime or contract defect. Two test fixtures were stale relative to the canonical authorities:

- canonical FES events now require `actor` identity;
- `MONTH_TO_DATE` derives its reference date from canonical `asOf` and does not accept a `referenceDate` parameter.

The fixtures were aligned with those existing contracts. No reporting production module required a semantic correction.

```text
PRODUCTION_DEFECTS_FOUND=0
RUNTIME_DEFECTS_FOUND=0
CHART_CONTRACT_DEFECTS_FOUND=0
STALE_TEST_FIXTURES_FOUND=2
FIXTURE_RECONCILIATION=PASS
```

## CI evidence

```text
WORKFLOW=Reporting Core Validation
RUN_ID=30677746821
RUN_NUMBER=34
JOB_ID=91308331856
STATUS=COMPLETED
CONCLUSION=SUCCESS
NODE_VERSION=22.23.1

TESTS=239
PASS=239
FAIL=0
CANCELLED=0
SKIPPED=0
TODO=0
```

The nine dedicated REP-16C cases passed:

```text
GOVERNED_ACTIVITY_RUNTIME_COMPOSITION=PASS
EVENT_TO_UNIVERSAL_REPORT_END_TO_END=PASS
CHART_READY_POINT_TO_ROW_TRACEABILITY=PASS
PARTIAL_CURRENT_PERIOD_STATE=PASS
EMPTY_REPORT_NO_ZERO_POINTS=PASS
UNIVERSAL_32_DAY_BATCHING=PASS
DETERMINISTIC_REPORT_AND_SURFACE_IDENTITIES=PASS
INCOMPLETE_CHART_SHAPE_REJECTION=PASS
RUNTIME_AND_PROJECTION_BOUNDARIES=PASS
```

## Closure result

```text
END_TO_END_EVENT_TO_UNIVERSAL_REPORT=PASS
UNIVERSAL_BATCHING_32_DAY_RANGE=PASS
DETERMINISTIC_REPORT_ID=PASS
DETERMINISTIC_SURFACE_ID=PASS
POINT_TO_ROW_TRACEABILITY=PASS
CANONICAL_PROVENANCE=PASS
NO_CHART_RECALCULATION=PASS
NO_ZERO_POINT_FABRICATION=PASS
PARTIAL_PERIOD_STATE=PASS
NO_UI_RENDERING_AUTHORITY=PASS
NO_AI_DECISION_AUTHORITY=PASS
CORE_REGRESSION=NONE
CI=PASS
REP_16C_COMPLETE=YES
```

```text
NEXT=REP_16D_PRODUCTIVE_FES_LEDGER_BINDING_AND_ACTIVITY_SURFACE_DELIVERY
```
