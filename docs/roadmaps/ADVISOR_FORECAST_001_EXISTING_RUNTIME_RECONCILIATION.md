# ADVISOR_FORECAST_001 — IMPLEMENTATION ROADMAP

## Objective

Integrate the existing Advisor Forecast intelligence into the productive ForgeOS runtime without duplicating calculations or presenting projection context as revenue truth.

## Current closure

```text
STAGE_0_RUNTIME_RECONCILIATION=IMPLEMENTED
STAGE_1_INPUT_CONTRACT=IMPLEMENTED
STAGE_2_NORMALIZATION=IMPLEMENTED
STAGE_3_COMPOSER_V1=IMPLEMENTED
STAGE_4_EXPLANATION_ENGINE=IMPLEMENTED
STAGE_5_READ_MODEL=IMPLEMENTED
STAGE_6_HOME_SMARTWIDGET=IMPLEMENTED
STAGE_7_CONTEXTUAL_NAVIGATION=IMPLEMENTED
STAGE_8_DETAIL_SCREEN=IMPLEMENTED
STAGE_9_OPPORTUNITY_WEIGHTING=IMPLEMENTED
STAGE_10_GOAL_GAP_ENGINE=IMPLEMENTED
PRODUCTIVE_UI_AUTOMOUNT=NO
DATABASE_MUTATION=NO
NEXT=STAGE_11_ACTIVITY_REQUIREMENT_ENGINE
```

## Locked productive authorities

```text
ADVISOR_IDENTITY=AUTH_SESSION
TARGET=ADVISOR_MONTHLY_POLICY_GOAL
PRODUCTION=PRODUCTION_EVENTS:POLICY_SOLD_CONFIRMED
PIPELINE=PIPELINE+BITACORA
ACTIVITY=FES+REP
ADVISOR_SIGNALS=ADVISOR_MANAGER_SNAPSHOT+MANAGER_ADVISOR_METRICS
HISTORICAL_CONTEXT=MANAGER_ADVISOR_HISTORICAL_ANALYTICS
FORECAST_BOUNDARY=MANAGER_FORECAST_BOUNDARY
```

## Roadmap

```text
ADVISOR_FORECAST_STAGE_0_RUNTIME_RECONCILIATION=COMPLETE
ADVISOR_FORECAST_STAGE_1_INPUT_CONTRACT=COMPLETE
ADVISOR_FORECAST_STAGE_2_NORMALIZATION=COMPLETE
ADVISOR_FORECAST_STAGE_3_COMPOSER_V1=COMPLETE
ADVISOR_FORECAST_STAGE_4_EXPLANATION_ENGINE=COMPLETE
ADVISOR_FORECAST_STAGE_5_READ_MODEL=COMPLETE
ADVISOR_FORECAST_STAGE_6_HOME_SMARTWIDGET=COMPLETE
ADVISOR_FORECAST_STAGE_7_CONTEXTUAL_NAVIGATION=COMPLETE
ADVISOR_FORECAST_STAGE_8_DETAIL_SCREEN=COMPLETE
ADVISOR_FORECAST_STAGE_9_OPPORTUNITY_WEIGHTING=COMPLETE
ADVISOR_FORECAST_STAGE_10_GOAL_GAP_ENGINE=COMPLETE
ADVISOR_FORECAST_STAGE_11_ACTIVITY_REQUIREMENT_ENGINE=NEXT
ADVISOR_FORECAST_STAGE_12_ACTIVITY_HANDOFF=PENDING
ADVISOR_FORECAST_STAGE_13_REPORTS_RECONCILIATION=PENDING
ADVISOR_FORECAST_RUNTIME_ACCEPTANCE=PENDING
ADVISOR_FORECAST_COMPLETE=NO
```

## Stage 6 deliverables

- Read-only `ADVISOR_FORECAST_WIDGET` for Productive Smart Widgets Home.
- Reuses the current Home adapter through `additionalWidgets`.
- Shows confirmed production, monthly pace, target, confidence and current explanation.
- Uses the existing `MONTH_END_GOAL_RISK` hard priority without overriding higher Cartera or payment priorities.
- No productive automount, task, CRM, message or database mutation.

## Stage 7 deliverables

- Contextual navigation contract for Forecast detail, weighted Pipeline contributors, at-risk opportunities and source review.
- Human click required for navigation.
- Route resolution does not create persistent filters or mutate Pipeline or Activity.

## Stage 8 deliverables

- Responsive Material 3 Forecast detail renderer.
- Summary, confirmed pace, weighted Pipeline context, residual gap and top contributors.
- Mobile safe-area reservation for the floating nav pill.
- Escaped dynamic content and read-only action handoff.

## Stage 9 deliverables

- Evidence-backed opportunity probability context.
- `COMMITTED`, `PROBABLE`, `POTENTIAL`, `AT_RISK` and `UNKNOWN` classifications.
- One opportunity contributes at most one expected policy equivalent.
- Closed and archived cases excluded.
- Amount weighting remains disabled; no monetary forecast or revenue truth is created.

## Stage 10 deliverables

- Goal Gap states: `GOAL_COVERED`, `PACE_SUFFICIENT`, `PIPELINE_SUFFICIENT`, `PIPELINE_INSUFFICIENT`, `ACTIVITY_INSUFFICIENT`, `DATA_INSUFFICIENT`.
- Compares target, confirmed production, monthly pace and weighted expected policy contribution.
- Pace and weighted Pipeline remain separate decision contexts and are never summed into a guaranteed close.
- Residual gap is exposed for Stage 11 Activity Requirement.

## Out of scope until later stages

- Automatic mounting into productive Home boot.
- Monetary opportunity weighting.
- Required contacts, appointments, presentations or applications.
- Automatic task, calendar, message or Pipeline mutation.
- Forecast versus actual reconciliation.

## Gates

```text
SOURCE_TRUTH_RECONCILED=PASS
INPUT_CONTRACT=PASS
NORMALIZATION_LAYER=PASS
COMPOSER_V1=PASS
EXPLANATION_ENGINE=PASS
READ_MODEL_V1=PASS
READ_MODEL_V2=PASS
HOME_SMARTWIDGET_CONTRACT=PASS
CONTEXTUAL_NAVIGATION=PASS
DETAIL_SCREEN=PASS
OPPORTUNITY_WEIGHTING=POLICY_EQUIVALENT_ONLY
GOAL_GAP_ENGINE=PASS
PACE_AND_PIPELINE_DOUBLE_COUNT=BLOCKED
AMOUNT_WEIGHTING=BLOCKED
UNKNOWN_ZERO_SEMANTICS=PASS
DATE_TIMEZONE=AMERICA_MEXICO_CITY
CROSS_ADVISOR_SCOPE=PASS
REVENUE_TRUTH_CREATED=NO
DATABASE_MUTATION=NO
PRODUCTIVE_UI_AUTOMOUNT=NO
```
