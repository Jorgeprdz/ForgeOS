# Advisor OS 1.0 — Sprint 10 Activity, Forecast, Reports and Compensation

```text
SPRINT=10_ACTIVITY_FORECAST_REPORTS_COMPENSATION
EXECUTION_MODE=ONE_PASS
STATUS=IMPLEMENTED_PENDING_EXACT_HEAD_ACCEPTANCE
```

## Objective

Make every management surface tell the same business story without creating a new fact authority or silently converting estimates into facts.

```text
ACTIVITY
→ FUNNEL
→ PRODUCTION
→ FORECAST
→ GOAL
→ COMPENSATION
→ REPORTS
```

## Authority map

```text
ACTIVITY=FES_REP_ACTIVITY
PRODUCTION=CANONICAL_POLICY_CONFIRMED_VERSION
GOAL=ADVISOR_MONTHLY_POLICY_GOAL
FORECAST=ADVISOR_FORECAST_ISSUED_SNAPSHOT
COMPENSATION=ADVISOR_COMPENSATION_AUTHORITY
REPORTS=SPRINT_10_MANAGEMENT_PROJECTION
```

Sprint 10 is a read-only reconciliation projection. It does not replace any upstream authority and does not query or mutate the database directly.

## Truth vocabulary

```text
ACTIVITY_COUNT=FACT
POLICIES_SOLD=FACT
POLICY_TARGET=TARGET
GOAL_GAP=DERIVED
EXPECTED_POLICIES=FORECAST
COMPENSATION_EARNED=EARNED
COMPENSATION_PAID=PAID
```

`EARNED` and `PAID` remain distinct. The management projection deliberately exposes no combined compensation total.

## Reconciliation rules

- every source must belong to the same advisor;
- every period-bearing source must match the management period;
- incompatible source periods degrade to `PARTIAL` and are excluded;
- forecast classifications and probabilities are consumed, never recalculated;
- compensation may only come from confirmed compensation events;
- Quote values, issued premium and Policy premium cannot masquerade as income;
- unknown values remain `null` and never become zero;
- unavailable optional sources produce explicit source states;
- unavailable Activity produces `SOURCE_UNAVAILABLE`, not an empty business.

## Report contract

The unified report preserves:

- current Activity and prior-period comparison;
- Forecast funnel classification counts;
- confirmed production;
- monthly target and derived gap;
- expected policies explicitly labeled Forecast;
- earned and paid compensation as separate cards;
- source trace with readiness or error state;
- evidence references for Forecast values.

## Hard boundaries

```text
SECOND_ACTIVITY_AUTHORITY=0
SECOND_FORECAST_ENGINE=0
SECOND_COMPENSATION_ENGINE=0
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
FORECAST_RECALCULATION=0
COMPENSATION_RECALCULATION=0
QUOTE_AS_INCOME=0
PREMIUM_AS_PAID_INCOME=0
UNKNOWN_AS_ZERO=0
AUTOMATIC_DECISION=0
```

## Acceptance matrix

```text
ACTIVITY_SOURCE_OF_TRUTH=PENDING_CI
FUNNEL=PENDING_CI
FORECAST_TRUTH_LABELS=PENDING_CI
GOAL_GAP=PENDING_CI
COMPENSATION_TRUTH=PENDING_CI
REPORTS_RECONCILIATION=PENDING_CI
PERIOD_MISMATCH_REJECTION=PENDING_CI
CROSS_ADVISOR_REJECTION=PENDING_CI
UNKNOWN_AS_ZERO_REJECTION=PENDING_CI
```

Exact-head CI is authoritative for final closure and controlled merge.
