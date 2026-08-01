# REP-16C — Activity Provider Universal Runtime and Chart-Ready Projection

Status: IN VALIDATION
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

## Validation gates

```text
END_TO_END_EVENT_TO_UNIVERSAL_REPORT=PASS_REQUIRED
UNIVERSAL_BATCHING_32_DAY_RANGE=PASS_REQUIRED
DETERMINISTIC_REPORT_ID=PASS_REQUIRED
DETERMINISTIC_SURFACE_ID=PASS_REQUIRED
POINT_TO_ROW_TRACEABILITY=PASS_REQUIRED
CANONICAL_PROVENANCE=PASS_REQUIRED
NO_CHART_RECALCULATION=PASS_REQUIRED
NO_ZERO_POINT_FABRICATION=PASS_REQUIRED
PARTIAL_PERIOD_STATE=PASS_REQUIRED
NO_UI_RENDERING_AUTHORITY=PASS_REQUIRED
NO_AI_DECISION_AUTHORITY=PASS_REQUIRED
CORE_REGRESSION=NONE_REQUIRED
CI=PASS_REQUIRED
```

```text
NEXT_AFTER_PASS=REP_16D_PRODUCTIVE_FES_LEDGER_BINDING_AND_ACTIVITY_SURFACE_DELIVERY
```
