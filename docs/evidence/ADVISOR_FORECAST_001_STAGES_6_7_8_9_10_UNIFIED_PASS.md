# ADVISOR FORECAST 001 — STAGES 6, 7, 8, 9 AND 10 UNIFIED PASS

## Delivery boundary

```text
DELIVERY_MODE=ONE_STACKED_BRANCH_ONE_PR_ONE_UNIFIED_PASS
BASE=feature/advisor-forecast-001-stages-3-5
PRODUCTIVE_UI_AUTOMOUNT=NO
DATABASE_MUTATION=NO
PIPELINE_MUTATION=NO
ACTIVITY_MUTATION=NO
TASK_MUTATION=NO
CALENDAR_MUTATION=NO
MESSAGE_MUTATION=NO
```

## Stage 6 — Home SmartWidget

Implemented a read-only Advisor Forecast card compatible with the existing Productive Smart Widget Home adapter.

The widget is supplied through the existing `additionalWidgets` boundary and therefore does not rewrite the productive orchestrator.

It exposes:

- confirmed policy production;
- monthly pace projection;
- monthly target;
- current confidence and health;
- governed Goal Gap explanation;
- weighted Pipeline coverage as context only.

It reuses the existing `MONTH_END_GOAL_RISK` hard priority and does not override higher confirmed policy-service, payment or income-risk priorities.

## Stage 7 — Contextual navigation

Implemented read-only routes for:

```text
ADVISOR_FORECAST_DETAIL
PIPELINE_FORECAST_CONTEXT
PIPELINE_AT_RISK
FORECAST_SOURCE_REVIEW
```

Navigation requires an explicit callback from the human-triggered UI action. No automatic navigation, persistent filter, Pipeline mutation or Activity mutation is performed.

## Stage 8 — Forecast detail screen

Implemented a responsive Material 3 detail renderer with:

- summary metrics;
- confirmed pace;
- weighted Pipeline context;
- residual goal gap;
- evidence-backed top contributors;
- explicit truth boundary;
- bounded navigation actions;
- mobile safe-area padding above the floating nav pill.

Dynamic opportunity identifiers are HTML escaped.

## Stage 9 — Opportunity weighting

Implemented evidence-backed expected policy contribution.

```text
CLASSIFICATIONS=COMMITTED|PROBABLE|POTENTIAL|AT_RISK|UNKNOWN
EXPECTED_CONTRIBUTION_UNIT=POLICY_EQUIVALENT
MAX_CONTRIBUTION_PER_OPPORTUNITY=1
CLOSED_OR_ARCHIVED_CONTRIBUTION=0
SIGNAL_WITHOUT_EVIDENCE=IGNORED
UNKNOWN_WITHOUT_EVIDENCE=YES
AMOUNT_WEIGHTING=NO
REVENUE_TRUTH=NO
```

The engine consumes canonical Pipeline and Bitácora stages and signals. It rejects cross-advisor data and preserves input immutability.

## Stage 10 — Goal Gap

Implemented a governed comparison of:

- monthly target;
- confirmed `POLICY_SOLD_CONFIRMED` production;
- confirmed-production pace;
- weighted expected policy contribution.

States:

```text
GOAL_COVERED
PACE_SUFFICIENT
PIPELINE_SUFFICIENT
PIPELINE_INSUFFICIENT
ACTIVITY_INSUFFICIENT
DATA_INSUFFICIENT
```

Pace and weighted Pipeline are not added into a guaranteed result because they may overlap. The residual gap is handed forward to Stage 11.

## New implementation files

```text
manager-os/forecast/advisor-opportunity-weighting-engine.js
manager-os/forecast/advisor-goal-gap-engine.js
manager-os/forecast/advisor-forecast-composer-v2.js
manager-os/forecast/advisor-forecast-read-model-v2.js
advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.mjs
advisor-os/forge-alive/navigation/advisor-forecast-navigation.mjs
docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.js
docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.css
```

## Validation suites

```text
tests/advisor-forecast-stages-6-8-test.mjs
manager-os/tests/advisor-forecast-stages-9-10-test.js
.github/workflows/advisor-forecast-stages-6-10-validation.yml
```

The workflow also executes all Advisor Forecast prerequisite suites, the existing Manager Advisor Forecast master contract and the Productive Smart Widget orchestrator master suite.

## Locked safety boundary

```text
CONFIRMED_PRODUCTION=POLICY_SOLD_CONFIRMED_ONLY
OPPORTUNITY_PROBABILITY=DECISION_CONTEXT_ONLY
MONEY_FORECAST=NOT_CREATED
AMOUNT_WEIGHTING=NOT_AUTHORIZED
PACE_AS_GUARANTEE=BLOCKED
PACE_PLUS_PIPELINE_GUARANTEED_TOTAL=BLOCKED
AUTOMATIC_DECISION=BLOCKED
AUTOMATIC_NAVIGATION=BLOCKED
DATABASE_WRITE=BLOCKED
CRM_WRITE=BLOCKED
TASK_OR_CALENDAR_WRITE=BLOCKED
```

## Next

```text
NEXT=ADVISOR_FORECAST_STAGE_11_ACTIVITY_REQUIREMENT_ENGINE
MERGE_AUTHORIZATION=NOT_ASSUMED
```
