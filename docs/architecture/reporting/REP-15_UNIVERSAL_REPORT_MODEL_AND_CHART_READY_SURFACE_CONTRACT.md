# REP-15 — Universal Report Model and Chart-Ready Surface Contract

Status: ACCEPTED
Date: 2026-07-31
Branch: `integration/reporting-source-truth-reconciliation`

```text
FORGE_THINKS=YES
AI_INTERPRETS_ONLY=YES
REPORT_CALCULATION_AUTHORITY=UNIVERSAL_REPORT_MODEL
VISUALIZATION_COMPATIBILITY_AUTHORITY=CHART_READY_SURFACE
UI_RENDERING_AUTHORITY=NO
PRESENTATION_STYLING_AUTHORITY=NO
```

## Delivered

- chart-ready reporting semantic contract;
- temporal grain vocabulary;
- supported visualization vocabulary;
- missing-data and partial-period states;
- series and point identity;
- point provenance;
- governed drill-down descriptors;
- deterministic surface identity;
- explicit Forge, UI and AI boundaries;
- isolated contract tests and CI registration.

## Constitutional boundary

The chart-ready surface does not recalculate report values. It accepts an already governed universal report and projects chart-compatible semantic structures. It may declare compatible and recommended visualization types because that policy belongs to Forge. It does not own labels, colors, layout, components, routes, CSS, SQL, persistence or AI decisions.

## Validation evidence

```text
WORKFLOW=Reporting Core Validation
RUN_ID=30672386013
RUN_NUMBER=7
JOB_ID=91292630169
STATUS=COMPLETED
CONCLUSION=SUCCESS
NODE_VERSION=22.23.1
TESTS=198
PASS=198
FAIL=0
CANCELLED=0
SKIPPED=0
```

The validation executed import checks for the universal core plus both chart-ready contracts and ran the six isolated suites, including `tests/chart-ready-surface-contract-test.mjs`.

## Closure gates

```text
SCHEMA_CONTRACT=PASS
DETERMINISTIC_IDENTITY=PASS
POINT_TO_REPORT_ROW_TRACEABILITY=PASS
MISSING_DATA_NOT_ZERO=PASS
PARTIAL_PERIOD_STATE=PASS
NO_PRESENTATION_OWNERSHIP=PASS
NO_AI_DECISION_AUTHORITY=PASS
CORE_REGRESSION=NONE
CI=PASS
REP_15_COMPLETE=YES
```

```text
NEXT=REP_16_ACTIVITY_REPORT_PROVIDER_RECONSTRUCTION
```
