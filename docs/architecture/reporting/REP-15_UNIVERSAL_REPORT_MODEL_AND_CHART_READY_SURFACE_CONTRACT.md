# REP-15 — Universal Report Model and Chart-Ready Surface Contract

Status: IN VALIDATION
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

## Required closure gates

```text
SCHEMA_CONTRACT=PASS_REQUIRED
DETERMINISTIC_IDENTITY=PASS_REQUIRED
POINT_TO_REPORT_ROW_TRACEABILITY=PASS_REQUIRED
MISSING_DATA_NOT_ZERO=PASS_REQUIRED
PARTIAL_PERIOD_STATE=PASS_REQUIRED
NO_PRESENTATION_OWNERSHIP=PASS_REQUIRED
NO_AI_DECISION_AUTHORITY=PASS_REQUIRED
CI=PASS_REQUIRED
```

```text
NEXT_AFTER_PASS=REP_16_ACTIVITY_REPORT_PROVIDER_RECONSTRUCTION
```
