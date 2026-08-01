# ADVISOR FORECAST 001 — STAGES 0, 1 AND 2 UNIFIED PASS

## Scope

This pass closes the implementation foundation required before the Advisor Forecast Composer:

- Stage 0: productive runtime and source-truth reconciliation;
- Stage 1: canonical Advisor Forecast input contract;
- Stage 2: source normalization into the canonical contract.

No Smart Widget was mounted and no forecast projection was calculated in this pass.

## Stage 0 — Runtime reconciliation

The productive source map is now explicit:

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

The following ownership decisions are locked:

- SMNYL owns pace projection.
- Manager Advisor Forecast owns scenario context.
- Manager Advisor Metrics owns protected signal aggregation.
- Manager Advisor Historical Analytics owns historical context.
- UI providers render only and cannot calculate forecast truth.
- `revenue-forecast-engine.js` is rejected for Advisor Forecast V1.

## Stage 1 — Input contract

`ADVISOR_FORECAST_INPUT_V1` requires an advisor identity, period and explicit signal envelopes for:

- target;
- production;
- pipeline;
- activity;
- appointments;
- followups;
- prospecting;
- referrals;
- historical context.

Every signal is one of:

```text
KNOWN
ZERO
UNKNOWN
MISSING
STALE
```

An explicit zero requires direct evidence. Missing and unknown cannot carry a value. Stale retains the last known value and is not silently treated as fresh.

## Stage 2 — Normalization

The normalizer currently supports the authorities already present on productive main:

- monthly policy goal snapshot;
- confirmed sold-policy facts;
- Pipeline and Bitácora opportunities;
- REP activity report;
- Manager Advisor Metrics context;
- Manager Advisor Historical Analytics context.

Current production semantics are deliberately narrow:

```text
ONE_CONFIRMED_SOLD_POLICY=ONE_FAMILY_PROTECTED
QUOTE_PRESENTED=NOT_PRODUCTION
PREMIUM_OR_CONTRIBUTION=NOT_REVENUE_TRUTH
OPPORTUNITY_AMOUNT=NOT_PRODUCTION
```

Pipeline is normalized as active opportunity count only. No probability or amount weighting is applied in Stages 0-2.

## Safety and truth boundaries

```text
UNKNOWN_TO_ZERO=BLOCKED
CROSS_ADVISOR_DATA=BLOCKED
UI_CALCULATION=BLOCKED
DIRECT_SUPABASE_READ_FROM_FORECAST_CORE=BLOCKED
DATABASE_WRITE=NO
PIPELINE_MUTATION=NO
ACTIVITY_MUTATION=NO
REVENUE_TRUTH=NO
COMPENSATION_TRUTH=NO
AUTOMATIC_DECISION=NO
```

## Validation

The unified validation covers 22 assertions across two suites:

- source authority ownership;
- legacy engine rejection;
- forbidden direct dependencies;
- canonical input validation;
- missing/unknown/zero/stale semantics;
- evidence-backed zero;
- confirmed-production deduplication;
- quote exclusion;
- active Pipeline normalization without weighting;
- REP and protected metrics normalization;
- stale propagation;
- cross-advisor rejection;
- input immutability;
- America/Mexico_City period normalization;
- false truth/write flags.

## Closure

```text
ADVISOR_FORECAST_STAGE_0_RUNTIME_RECONCILIATION=IMPLEMENTED
ADVISOR_FORECAST_STAGE_1_INPUT_CONTRACT=IMPLEMENTED
ADVISOR_FORECAST_STAGE_2_NORMALIZATION=IMPLEMENTED
SOURCE_TRUTH_RECONCILED=YES
UNKNOWN_ZERO_SEMANTICS=LOCKED
CROSS_ADVISOR_SCOPE=LOCKED
DUPLICATE_CALCULATIONS=NONE_AUTHORIZED
LOCAL_VALIDATION=22_OF_22_PASS
SMART_WIDGET_MOUNTED=NO
COMPOSER_IMPLEMENTED=NO
NEXT=ADVISOR_FORECAST_STAGE_3_COMPOSER_V1
```
