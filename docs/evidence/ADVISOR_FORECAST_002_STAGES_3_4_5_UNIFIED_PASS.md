# ADVISOR FORECAST 002 — STAGES 3, 4 AND 5 UNIFIED PASS

## Delivery boundary

```text
DELIVERY_MODE=ONE_BRANCH_ONE_PR_ONE_UNIFIED_PASS
BASE_BRANCH=feature/advisor-forecast-001-stages-0-2
PR=133
STAGE_3_COMPOSER_V1=IMPLEMENTED
STAGE_4_EXPLANATION_ENGINE=IMPLEMENTED
STAGE_5_READ_MODEL=IMPLEMENTED
PRODUCTIVE_UI_MOUNT=NO
DATABASE_MUTATION=NO
PIPELINE_MUTATION=NO
ACTIVITY_MUTATION=NO
AUTOMATIC_ACTION=NO
```

This pass consumes the normalized and evidence-aware `ADVISOR_FORECAST_INPUT_V1` produced by Stages 0–2. It does not read Supabase, the DOM, browser storage, Pipeline repositories or activity repositories directly.

## Stage 3 — Advisor Forecast Composer V1

The Composer:

- validates the Stage 1 input contract;
- preserves immutable `KNOWN`, `ZERO`, `UNKNOWN`, `MISSING` and `STALE` semantics;
- calculates confirmed-policy pace over the normalized monthly period;
- emits conservative, baseline and stretch pace scenarios using `0.8`, `1.0` and `1.2` multipliers;
- composes the real `manager-advisor-forecast-engine.js`;
- retains the existing Manager Forecast boundary and blocked-use policy;
- calculates current and projected policy-goal coverage;
- emits deterministic confidence and health states;
- performs no writes and creates no revenue, compensation, Pipeline or activity truth.

### Pace compatibility boundary

```text
PACE_INPUT=UNIQUE_POLICY_SOLD_CONFIRMED_COUNT
PACE_PERIOD=AMERICA_MEXICO_CITY_NORMALIZED_MONTH
PACE_METHOD=LINEAR_CONFIRMED_POLICY_RATE
SCENARIOS=0.8_1.0_1.2
PACE_AUTHORITY_LABEL=SMNYL_PACE_FORECAST_COMPATIBLE_V1
DIRECT_LEGACY_ESM_IMPORT=NO
PRODUCTIVE_ADVISOR_FORECAST_PACE_OWNER=ADVISOR_FORECAST_COMPOSER_V1
```

The existing SMNYL rule-pack is an isolated ESM-style module while Manager OS is CommonJS. The Composer exposes a bounded compatibility projection with the same monthly pace semantics without importing the disconnected executive-dashboard runtime.

### Health states

```text
ON_TRACK=BASELINE_PROJECTION_AT_OR_ABOVE_TARGET
AT_RISK=BASELINE_PROJECTION_BETWEEN_80_AND_100_PERCENT
BEHIND=BASELINE_PROJECTION_BELOW_80_PERCENT
NEEDS_UPDATE=CRITICAL_TARGET_OR_PRODUCTION_SIGNAL_STALE
INSUFFICIENT_DATA=TARGET_OR_PRODUCTION_NOT_USABLE
```

These states are review context only. They do not create performance, ranking, promotion, punishment or lifecycle truth.

## Stage 4 — Explanation Engine

The explanation layer produces:

- one primary explanation;
- up to five supporting facts;
- up to five risk facts;
- missing and stale source lists;
- no more than three human-review action intents;
- evidence references and source authorities;
- explicit uncertainty and non-causation language.

```text
HIDDEN_CAUSATION=BLOCKED
AUTOMATIC_ACTION=BLOCKED
OPPORTUNITY_CLOSE_CLAIM=BLOCKED
UNSUPPORTED_REVENUE_CLAIM=BLOCKED
```

## Stage 5 — Advisor Forecast Read Model V1

The calculation-free UI contract exposes:

- period and localized label;
- monthly policy target;
- confirmed production;
- current progress;
- pace projection and three scenarios;
- projected coverage;
- confidence and health status;
- primary explanation, supporting facts and risks;
- active opportunity count;
- stale and missing counts;
- bounded action intents;
- evidence, freshness and render hints.

```text
READ_MODEL_CALCULATION_PERFORMED=NO
READ_MODEL_MUTATION_PERFORMED=NO
SMARTWIDGET_RENDERER=NOT_INCLUDED
CONTEXTUAL_NAVIGATION=NOT_INCLUDED
```

## Validation

First remote validation:

```text
WORKFLOW=Advisor Forecast Stages 3-5 Validation
RUN_ID=30710394545
CONCLUSION=SUCCESS
LOCAL_STAGE_3_4_5_TESTS=24_OF_24_PASS
REAL_MANAGER_ENGINE_INTEGRATION=PASS
INHERITED_STAGE_0_1_TESTS=PASS
INHERITED_STAGE_2_TESTS=PASS
MANAGER_ADVISOR_FORECAST_MASTER=PASS
FORBIDDEN_RUNTIME_DEPENDENCY_SCAN=PASS
```

The evidence-persistence commit triggers the same workflow again. Final delivery requires that latest run to remain green.

## Files

- `manager-os/forecast/advisor-forecast-composer.js`
- `manager-os/forecast/advisor-forecast-explanation-engine.js`
- `manager-os/forecast/advisor-forecast-read-model.js`
- `manager-os/tests/advisor-forecast-stages-3-5-test.js`
- `manager-os/tests/advisor-forecast-stage-3-real-engine-integration-test.js`
- `.github/workflows/advisor-forecast-stages-3-5-validation.yml`
- this evidence document;
- updated implementation roadmap.

## Deliberately deferred

- Home SmartWidget rendering and mounting;
- contextual routes and Pipeline filters;
- full Forecast detail screen;
- opportunity amount or probability weighting;
- goal-gap recommendations;
- required-activity calculations;
- automatic activity, task, message, calendar or Pipeline mutation;
- Forecast versus actual reconciliation.

## Final state

```text
ADVISOR_FORECAST_STAGE_3=COMPLETE
ADVISOR_FORECAST_STAGE_4=COMPLETE
ADVISOR_FORECAST_STAGE_5=COMPLETE
LOCAL_VALIDATION=24_OF_24_PASS
REMOTE_VALIDATION=PASS_RUN_30710394545
PR_STATE=OPEN
PR_MERGEABLE=YES
PR_MERGED=NO
MERGE_AUTHORIZATION=NOT_ASSUMED
NEXT=ADVISOR_FORECAST_STAGE_6_HOME_SMARTWIDGET
```