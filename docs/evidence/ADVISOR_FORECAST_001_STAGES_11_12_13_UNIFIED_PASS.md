# ADVISOR FORECAST 001 — STAGES 11, 12 AND 13 UNIFIED PASS

## Delivery

```text
DELIVERY_MODE=ONE_STACKED_BRANCH_ONE_PR_ONE_UNIFIED_PASS
BASE=feature/advisor-forecast-001-stages-6-10
STAGE_11_ACTIVITY_REQUIREMENT_ENGINE=IMPLEMENTED
STAGE_12_ACTIVITY_HANDOFF=IMPLEMENTED
STAGE_13_REPORTS_RECONCILIATION=IMPLEMENTED
PRODUCTIVE_UI_AUTOMOUNT=NO
DATABASE_MUTATION=NO
AUTOMATIC_TASK_CREATION=NO
AUTOMATIC_CALENDAR_CREATION=NO
RETROACTIVE_FORECAST_MUTATION=NO
```

## Stage 11 — Activity Requirement Engine

Implemented in:

```text
manager-os/forecast/advisor-activity-requirement-engine.js
manager-os/forecast/advisor-forecast-composer-v3.js
manager-os/forecast/advisor-forecast-read-model-v3.js
```

The engine converts the Stage 10 residual expected-policy gap into minimum whole activity requirements:

```text
residual policy gap
→ policies
→ applications
→ presentations
→ appointments
→ prospecting contacts
```

Conversion source priority is locked:

```text
1. ADVISOR_HISTORICAL_CONVERSION
2. ADVISOR_RECENT_CONVERSION
3. GOVERNED_CONVERSION_BENCHMARK
```

A rate must be valid and evidence-backed. A missing rate returns `INSUFFICIENT_DATA`; it does not become zero and does not receive a fabricated default.

The output includes confidence, rate provenance, sample-size limitations, cadence context and a governed safety ceiling. Integer results are upward-rounded planning minima, not outcome guarantees.

## Stage 12 — Human-confirmed Activity handoff

Implemented in:

```text
advisor-os/forge-alive/activity/advisor-forecast-activity-handoff.mjs
advisor-os/forge-alive/navigation/advisor-forecast-navigation.mjs
advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.mjs
docs/static-preview/forge-alive-material3/advisor-forecast-detail-screen.js
```

Forecast creates one read-only plan draft. Submission requires:

- matching advisor identity;
- explicit `confirmedByAdvisor=true`;
- valid confirmation timestamp;
- at least one selected recommendation;
- a human-selected due date for each item;
- an injected Activity runtime callback.

The handoff does not directly persist or create canonical activity events. FES retains authority to accept the confirmed draft and create `DUE_ACTION_CREATED` truth.

```text
AUTOMATIC_SUBMISSION=BLOCKED
AUTOMATIC_TASK_CREATION=BLOCKED
AUTOMATIC_CALENDAR_CREATION=BLOCKED
DIRECT_DATABASE_WRITE=BLOCKED
DIRECT_CRM_WRITE=BLOCKED
FINAL_AUTHORITY=HUMAN
```

The existing single Forecast SmartWidget remains one widget per monthly period. Read Model V3 activity requirements are carried in its payload and displayed in the separate detail screen, not crowded into Home.

## Stage 13 — Forecast versus actual reconciliation

Implemented in:

```text
manager-os/forecast/advisor-forecast-reconciliation-engine.js
```

The engine creates an immutable issued snapshot:

```text
ADVISOR_FORECAST_ISSUED_SNAPSHOT_V1
SHA_256_DIGEST=REQUIRED
```

Reconciliation is final only after period close. Actual production is derived from unique `POLICY_SOLD_CONFIRMED` events for the same advisor and month.

The following views are measured separately:

```text
PACE_PROJECTION vs ACTUAL
WEIGHTED_PIPELINE_EXPECTED_CLOSE vs ACTUAL
CONFIRMED_AT_ISSUE vs ACTUAL
```

Pace and weighted Pipeline are not merged into one guaranteed result. The engine records absolute error and optimistic, conservative or exact bias. It does not calculate monetary accuracy.

An explicit actual result of zero requires direct evidence. Cross-advisor facts are blocked. A changed issued snapshot fails digest verification and cannot be reconciled.

## Validation scope

New suites:

```text
manager-os/tests/advisor-forecast-stages-11-13-test.js
tests/advisor-forecast-stages-11-13-handoff-test.mjs
```

New assertions cover:

- reverse-funnel calculation;
- historical/recent/benchmark source priority;
- missing-rate rejection;
- stale and low-confidence handling;
- extreme-output safety ceiling;
- Composer and Read Model V3;
- explicit human confirmation;
- identity mismatch rejection;
- due-date requirement;
- injected Activity runtime boundary;
- single SmartWidget compatibility;
- detail-screen activity section;
- immutable issued snapshot digest;
- period-close enforcement;
- unique confirmed actual production;
- evidence-required zero actual;
- cross-advisor rejection;
- pace and weighted-Pipeline error separation;
- Reports aggregation without truth ownership.

Workflow:

```text
.github/workflows/advisor-forecast-stages-11-13-validation.yml
```

The workflow also reruns all Advisor Forecast suites through Stage 10 and preserves:

```text
MANAGER_ADVISOR_FORECAST_BOUNDARY
PRODUCTIVE_SMART_WIDGET_ORCHESTRATOR
FES_CANONICAL_ACTIVITY_EVENT_CONTRACT
```

## Closure gates

```text
STAGE_11_ACTIVITY_REQUIREMENT_ENGINE=PASS_PENDING_CI
STAGE_12_ACTIVITY_HANDOFF=PASS_PENDING_CI
STAGE_13_REPORTS_RECONCILIATION=PASS_PENDING_CI
FALSE_PRECISION=REJECTED
AUTOMATIC_TASK_CREATION=BLOCKED
AUTOMATIC_CALENDAR_CREATION=BLOCKED
FORECAST_SNAPSHOT_IMMUTABLE=PASS_PENDING_CI
RETROACTIVE_FORECAST_MUTATION=BLOCKED
REVENUE_TRUTH_CREATED=NO
DATABASE_MUTATION=NO
NEXT=ADVISOR_FORECAST_RUNTIME_ACCEPTANCE
```
