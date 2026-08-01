# ADVISOR FORECAST 001 — STAGES 3, 4 AND 5 UNIFIED PASS

## Delivery

```text
DELIVERY_MODE=ONE_BRANCH_ONE_STACKED_PR_ONE_UNIFIED_PASS
BASE=feature/advisor-forecast-001-stages-0-2
PRODUCTIVE_UI_MOUNT=NO
DATABASE_MUTATION=NO
PIPELINE_MUTATION=NO
ACTIVITY_MUTATION=NO
```

## Stage 3 — Composer V1

`advisor-forecast-composer.js` composes:

- the Stage 2 normalized input;
- confirmed-production monthly pace semantics;
- the existing Manager Advisor Forecast scenario engine;
- the existing Forecast Boundary;
- confidence and health states;
- the Stage 4 explanation result.

The two forecast views remain separate:

```text
PACE_PROJECTION=CONFIRMED_POLICY_PRODUCTION_EXTRAPOLATION
SCENARIO_CONTEXT=PROTECTED_SIGNAL_CONTEXT
MONEY_FORECAST=NOT_CREATED
OPPORTUNITY_WEIGHTING=NOT_APPLIED
```

## Stage 4 — Explanation Engine

`advisor-forecast-explanation-engine.js` produces:

- one primary explanation;
- supporting signals;
- risk signals;
- missing information;
- stale information;
- up to three attention items;
- evidence references.

No unsupported claim or automatic action is created.

## Stage 5 — Read Model

`advisor-forecast-read-model.js` exposes a calculation-free UI contract containing:

- period and state;
- current confirmed production;
- target and current coverage;
- pace projection;
- conservative, baseline and stretch signal contexts;
- confidence and health;
- explanation and evidence;
- active opportunity count;
- stale and missing counts;
- bounded navigation actions.

The read model does not calculate source truth, mutate state, or mount UI.

## Locked semantics

```text
CONFIRMED_PRODUCTION=UNIQUE_POLICY_SOLD_CONFIRMED
PACE_IS_NOT_GUARANTEE=YES
PIPELINE_IS_UNWEIGHTED_COUNT=YES
SCENARIOS_ARE_CONTEXT_ONLY=YES
QUOTE_AS_PRODUCTION=BLOCKED
PREMIUM_AS_REVENUE_TRUTH=BLOCKED
READ_MODEL_CALCULATION=BLOCKED
AUTOMATIC_DECISION=BLOCKED
DATABASE_WRITE=BLOCKED
UI_MUTATION=BLOCKED
```

## Validation

The dedicated suite covers:

- pace based only on confirmed production;
- three protected scenarios;
- unweighted Pipeline;
- confidence degradation;
- evidence-linked explanations;
- missing and stale signal disclosure;
- calculation-free read model;
- bounded navigation;
- immutable sources;
- truth and write flags.

```text
STAGE_3_4_5_ASSERTIONS=15
PREREQUISITE_STAGE_0_1_ASSERTIONS=9
PREREQUISITE_STAGE_2_ASSERTIONS=13
EXISTING_MANAGER_FORECAST_ASSERTIONS=17
```

## Result

```text
ADVISOR_FORECAST_STAGE_3=IMPLEMENTED
ADVISOR_FORECAST_STAGE_4=IMPLEMENTED
ADVISOR_FORECAST_STAGE_5=IMPLEMENTED
NEXT=ADVISOR_FORECAST_STAGE_6_HOME_SMARTWIDGET
MERGE_AUTHORIZATION=NOT_ASSUMED
```
