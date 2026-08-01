# ADVISOR_FORECAST_001 — IMPLEMENTATION ROADMAP

## Objective

Integrate the existing Advisor Forecast intelligence into the productive ForgeOS runtime without duplicating productive authority or presenting projection context as revenue truth.

## Current closure

```text
STAGE_0_RUNTIME_RECONCILIATION=IMPLEMENTED
STAGE_1_INPUT_CONTRACT=IMPLEMENTED
STAGE_2_NORMALIZATION=IMPLEMENTED
STAGE_3_COMPOSER_V1=IMPLEMENTED
STAGE_4_EXPLANATION_ENGINE=IMPLEMENTED
STAGE_5_READ_MODEL=IMPLEMENTED
LOCAL_STAGE_0_1_2_TESTS=22_OF_22_PASS
LOCAL_STAGE_3_4_5_TESTS=24_OF_24_PASS
SMART_WIDGET_MOUNTED=NO
DATABASE_MUTATION=NO
NEXT=STAGE_6_HOME_SMARTWIDGET
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
PACE=ADVISOR_FORECAST_COMPOSER_V1_SMNYL_COMPATIBLE_POLICY_PACE
```

## Roadmap

```text
ADVISOR_FORECAST_STAGE_0_RUNTIME_RECONCILIATION=COMPLETE
ADVISOR_FORECAST_STAGE_1_INPUT_CONTRACT=COMPLETE
ADVISOR_FORECAST_STAGE_2_NORMALIZATION=COMPLETE
ADVISOR_FORECAST_STAGE_3_COMPOSER_V1=COMPLETE
ADVISOR_FORECAST_STAGE_4_EXPLANATION_ENGINE=COMPLETE
ADVISOR_FORECAST_STAGE_5_READ_MODEL=COMPLETE
ADVISOR_FORECAST_STAGE_6_HOME_SMARTWIDGET=NEXT
ADVISOR_FORECAST_STAGE_7_CONTEXTUAL_NAVIGATION=PENDING
ADVISOR_FORECAST_STAGE_8_DETAIL_SCREEN=PENDING
ADVISOR_FORECAST_STAGE_9_OPPORTUNITY_WEIGHTING=PENDING
ADVISOR_FORECAST_STAGE_10_GOAL_GAP_ENGINE=PENDING
ADVISOR_FORECAST_STAGE_11_ACTIVITY_REQUIREMENT_ENGINE=PENDING
ADVISOR_FORECAST_STAGE_12_ACTIVITY_HANDOFF=PENDING
ADVISOR_FORECAST_STAGE_13_REPORTS_RECONCILIATION=PENDING
ADVISOR_FORECAST_RUNTIME_ACCEPTANCE=PENDING
ADVISOR_FORECAST_COMPLETE=NO
```

## Stage 0 deliverables

- Productive source map.
- Runtime reuse and rejection matrix.
- Duplicate-calculation ownership policy.
- Direct UI, Supabase and mutation dependencies blocked from Forecast core.

## Stage 1 deliverables

- `ADVISOR_FORECAST_INPUT_V1`.
- Explicit `KNOWN`, `ZERO`, `UNKNOWN`, `MISSING` and `STALE` semantics.
- Evidence required for explicit zero.
- Immutable input and false truth/write flags.

## Stage 2 deliverables

- America/Mexico_City period normalization.
- Monthly policy target normalization.
- Unique `POLICY_SOLD_CONFIRMED` production normalization.
- Pipeline opportunity count without amount or probability weighting.
- REP activity and protected Manager metrics normalization.
- Historical context handoff.
- Cross-advisor source rejection.

## Stage 3 deliverables

- `ADVISOR_FORECAST_COMPOSER_V1`.
- Linear confirmed-policy pace for the normalized month.
- Conservative, baseline and stretch pace scenarios.
- Existing Manager Advisor Forecast engine composition.
- Existing Forecast Boundary preservation.
- Confidence states: `HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT_DATA`.
- Health states: `ON_TRACK`, `AT_RISK`, `BEHIND`, `NEEDS_UPDATE`, `INSUFFICIENT_DATA`.
- Current and projected policy-goal coverage.
- No opportunity amount or probability weighting.

## Stage 4 deliverables

- `ADVISOR_FORECAST_EXPLANATION_V1`.
- One primary explanation.
- Evidence-linked supporting and risk facts.
- Explicit missing and stale source lists.
- No hidden causation claims.
- No more than three human-review action intents.
- No automatic activity, Pipeline, task, calendar or message execution.

## Stage 5 deliverables

- `ADVISOR_FORECAST_READ_MODEL_V1`.
- Calculation-free UI projection.
- Period, target, confirmed production, pace, scenarios and coverage.
- Confidence, health, explanation, risk and evidence.
- Active opportunity count and source-quality counts.
- Render hints and bounded action intents.
- No SmartWidget mount and no contextual route implementation.

## Pace compatibility boundary

The legacy SMNYL rule-pack remains an isolated ESM-style runtime. Manager OS is CommonJS. Stage 3 therefore introduces one bounded Advisor Forecast V1 compatibility calculation using the same monthly linear pace semantics and the existing `0.8 / 1.0 / 1.2` scenario policy without importing the disconnected executive-dashboard runtime.

```text
DIRECT_LEGACY_EXECUTIVE_DASHBOARD_IMPORT=NO
PRODUCTIVE_ADVISOR_FORECAST_PACE_OWNER=ADVISOR_FORECAST_COMPOSER_V1
LEGACY_SMNYL_RUNTIME_MOUNTED=NO
```

## Out of scope until later stages

- Home SmartWidget renderer and productive mount.
- Contextual navigation and Pipeline filters.
- Full Forecast detail screen.
- Opportunity probability or amount weighting.
- Goal-gap recommendations.
- Required-activity calculation.
- Forecast versus actual reconciliation.

## Gates

```text
SOURCE_TRUTH_RECONCILED=PASS
CURRENT_RUNTIME_IDENTIFIED=PASS
LEGACY_RUNTIME_REJECTED_OR_MAPPED=PASS
DUPLICATE_PRODUCTIVE_AUTHORITY=NONE
INPUT_CONTRACT=PASS
UNKNOWN_ZERO_SEMANTICS=PASS
SOURCE_OWNER_PER_FIELD=PASS
NORMALIZATION_LAYER=PASS
DATE_TIMEZONE=AMERICA_MEXICO_CITY
CROSS_ADVISOR_SCOPE=PASS
COMPOSER_V1=PASS
EXPLANATION_ENGINE=PASS
READ_MODEL_V1=PASS
HIDDEN_CAUSATION=BLOCKED
AUTOMATIC_ACTION=BLOCKED
REVENUE_TRUTH_CREATED=NO
PIPELINE_OR_ACTIVITY_MUTATION=NO
```