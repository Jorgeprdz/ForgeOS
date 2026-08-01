# ADVISOR_FORECAST_RUNTIME_ACCEPTANCE_001

## Objective

Mount the completed Advisor Forecast stages 0–13 in the authenticated ForgeOS Material 3 runtime without introducing parallel truth, automatic commercial decisions, or hidden mutations.

## Functional promotion

```text
FUNCTIONAL_PR=139
FUNCTIONAL_MERGE_METHOD=SQUASH
FUNCTIONAL_MERGE_SHA=722aa7538f71c99e1abb662348f4ae8533783a6d
STAGES_0_THROUGH_13=ON_MAIN
```

## Runtime implementation

```text
RUNTIME_VERSION=AF-RUNTIME-ACCEPTANCE-001
HOME_ADAPTER=PRODUCTIVE_SMART_WIDGET_HOME_V3
FORECAST_WIDGET_COUNT=ONE_PER_MONTH
PIPELINE_SOURCE=PRODUCTIVE_PIPELINE_AND_BITACORA
ACTIVITY_SOURCE=FES_AND_REP
TARGET_SOURCE=ADVISOR_MONTHLY_POLICY_GOAL
PRODUCTION_SOURCE=POLICY_SOLD_CONFIRMED
```

The browser runtime is an explicitly tested compatibility bridge for GitHub Pages. Manager OS remains the canonical implementation authority. CI compares browser opportunity weighting and Goal Gap output with the Manager OS engines to prevent silent formula drift.

## Home acceptance

- The existing authenticated Home orchestrator remains the owner of source loading and widget selection.
- Forecast enters through the productive Home adapter and the existing Smart Widget ranking policy.
- It does not bypass hard priorities from Cartera, payments, Activity or other productive signals.
- Only one monthly Forecast widget is added to inventory.
- Source failures degrade Forecast without breaking the existing Home stack.

## Pipeline and navigation acceptance

- Productive prospects and Bitácora timelines are mapped to the governed Forecast vocabulary.
- Opportunity probability remains evidence-backed policy-equivalent context.
- `weighted-contributors` and `at-risk` routes show a read-only Forecast context over the productive Pipeline.
- Navigation requires a human action and creates no persistent Pipeline mutation.

## Activity acceptance

- Forecast detail and plan surfaces are mounted inside the productive Activity route.
- The plan requires explicit selection, due dates and advisor confirmation.
- A confirmed draft is delivered only to the Activity runtime review inbox.
- No task, calendar event, CRM write, database write or FES event is created automatically.
- FES retains ownership of any later `DUE_ACTION_CREATED` event.

## Reports acceptance

- Each issued Forecast snapshot is protected by SHA-256.
- Reconciliation is blocked before period close.
- Actual production is counted only from unique `POLICY_SOLD_CONFIRMED` facts.
- Pace and weighted Pipeline are compared separately.
- Explicit zero requires evidence.
- Retroactive Forecast mutation and monetary accuracy claims remain blocked.

## Session safety

```text
AUTH_SESSION_SCOPE=REQUIRED
ADVISOR_SWITCH_SCRUB=ENFORCED
LOGOUT_SCRUB=ENFORCED
SESSION_STORAGE_SCOPE=TAB_ONLY
LATE_RESULT_REJECTION=GENERATION_PLUS_ABORT
CROSS_ADVISOR_RESULT=BLOCKED
```

## Responsive boundary

- Forecast detail and activity plan reserve bottom space above the floating mobile nav pill.
- Activity planning collapses to a two-column mobile layout.
- Pipeline context and source diagnostics remain scroll-safe.
- Existing responsive shell tests remain part of runtime acceptance CI.

## Non-authorizations

```text
MONEY_FORECAST=NOT_CREATED
OPPORTUNITY_AMOUNT_WEIGHTING=NOT_AUTHORIZED
AUTOMATIC_DECISION=BLOCKED
AUTOMATIC_NAVIGATION=BLOCKED
AUTOMATIC_TASK_CREATION=BLOCKED
AUTOMATIC_CALENDAR_CREATION=BLOCKED
AUTOMATIC_FES_EVENT=BLOCKED
DATABASE_MUTATION=NO
CRM_MUTATION=NO
RETROACTIVE_FORECAST_MUTATION=BLOCKED
```

## Acceptance gates

```text
FUNCTIONAL_PROMOTION=PASS
PRODUCTIVE_HOME_MOUNT=IMPLEMENTED
AUTHENTICATED_SOURCE_ORCHESTRATION=IMPLEMENTED
PIPELINE_BITACORA_BINDING=IMPLEMENTED
SINGLE_MONTHLY_SMARTWIDGET=LOCKED
DETAIL_ROUTE=IMPLEMENTED
ACTIVITY_PLAN_ROUTE=IMPLEMENTED
SOURCE_REVIEW_ROUTE=IMPLEMENTED
HUMAN_CONFIRMED_ACTIVITY_HANDOFF=IMPLEMENTED
ISSUED_SNAPSHOT_CAPTURE=IMPLEMENTED
REPORTS_RECONCILIATION_BRIDGE=IMPLEMENTED
LOGOUT_SCRUB=IMPLEMENTED
LATE_RESULT_REJECTION=IMPLEMENTED
MOBILE_SAFE_AREA=IMPLEMENTED
CI_AND_PAGES_ACCEPTANCE=PENDING
```
