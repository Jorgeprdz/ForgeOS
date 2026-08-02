# ADVISOR COMPENSATION COMMISSION ENGINE 001

Status: STAGE 040 COMPLETE ON CONTROLLED STACKED BRANCH

## Purpose

Stage 040 converts one canonical confirmed premium-payment event plus an applicable versioned compensation rule into a deterministic Advisor Commission calculation.

It also calculates direct-advisor bonus candidates from confirmed period production while keeping calculation, earned truth, paid truth and persistence separate.

## Constitutional Chain

```text
Confirmed Payment Event
+ Policy Calculation Context
+ Compensation Rule Snapshot
-> Deterministic Commission Calculation
-> Explanation
-> Calculation Digest
```

Stage 040 stops at calculation.

```text
COMPENSATION_EVENT_WRITE=NO
EARNED_PROMOTION=NO
PAYOUT_PROMOTION=NO
```

Stage 050 owns compensation events and the gate that may promote a reproducible calculation to `EARNED`.

## 040A — Initial Commission Engine

The engine requires:

- valid Stage 030 confirmed payment event;
- advisor attribution;
- stable product identity;
- policy year;
- annual premium context;
- payment frequency;
- advisor month;
- applicable rule resolution;
- confirmed paid premium from the payment event.

For policy year `1`, the calculation type is:

```text
VIDA_INDIVIDUAL -> LIFE_INITIAL
GMM -> GMM_INITIAL
```

The commission formula is:

```text
currentCommission = confirmedPaidPremium × baseRate × developmentFactor
```

The confirmed payment is the economic basis. Annual premium and payment frequency are context used to determine the scheduled receipt and classify the payment as matched, partial or excess.

```text
ISSUED_PREMIUM_AS_PAID=FORBIDDEN
ANNUAL_PREMIUM_AS_CASH_TRUTH=FORBIDDEN
```

## 040B — Renewal Commission Engine

For policy year greater than `1`, the calculation type is:

```text
VIDA_INDIVIDUAL -> LIFE_RENEWAL
GMM -> GMM_RENEWAL
```

Policy year is authoritative for initial-versus-renewal classification. A caller-supplied renewal flag that conflicts with policy year is blocked.

The engine supports:

- current confirmed payment;
- partial payment;
- excess payment;
- accumulated confirmed paid premium;
- accumulated commission at the same applicable rate;
- covered-period references;
- exact rule band and policy year.

```text
currentCommission = currentConfirmedPaidPremium × effectiveRate
accumulatedCommission = accumulatedConfirmedPaidPremium × effectiveRate
```

The accumulated amount must be greater than or equal to the current payment. Stage 030 idempotency and conflict handling remain the source that protects the aggregate from duplicate payment intake.

## Payment Basis States

```text
MATCHED_SCHEDULED_RECEIPT
PARTIAL_PAYMENT
EXCESS_PAYMENT
```

Supported frequency factors are loaded from the Rule Pack:

```text
MENSUAL
TRIMESTRAL
SEMESTRAL
ANUAL
```

Unsupported frequencies fail closed.

The basis record exposes:

- annual premium;
- payment frequency;
- frequency factor;
- expected scheduled receipt;
- current confirmed paid premium;
- accumulated confirmed paid premium;
- payment coverage ratio;
- basis state;
- basis authority.

## 040C — GMM Engine

The GMM engine resolves:

- stable product identity;
- initial or renewal state;
- contract age;
- age band;
- policy year;
- confirmed payment;
- payment frequency;
- applicable rate;
- covered period.

Missing contract age remains blocked by the Stage 020 rule resolver. It is never defaulted to age `30`.

```text
MISSING_GMM_AGE_DEFAULT_30=RETIRED
UNKNOWN_GMM_RATE_DEFAULT=RETIRED
```

## Development Factor

The candidate Rule Pack contains the legacy development factor:

```text
ADVISOR_MONTH=1..12
FACTOR=0.90
```

The engine requires an explicit advisor month. It does not infer career stage from the current date.

```text
effectiveRate = baseRate × developmentFactor
```

After month `12`, the factor is `1.00`.

This factor remains candidate rule evidence until an official source validates it.

## Production Outputs

Each commission result also exposes direct-production candidates needed by bonus calculations:

- policy points;
- weighted annual premium;
- personal-policy exclusion;
- product point exclusion.

Personal policies produce commission but contribute:

```text
POLICY_POINTS=0
WEIGHTED_PREMIUM=0
```

The weighted premium and point rules remain candidate Rule Pack logic.

## 040D — Training Allowance Reconciliation

One authority is selected:

```text
SELECTED_AUTHORITY=ADVISOR_DEVELOPMENT_RULE_PACK
```

The Advisor Compensation Rule Pack does not calculate Training Allowance from its copied legacy target rows.

```text
DUPLICATE_LEGACY_INTERPRETATION_RETIRED=YES
ADVISOR_COMPENSATION_LEGACY_TARGETS_USED_FOR_CALCULATION=NO
```

The governed Training Allowance concept is loaded from the existing Advisor Development Rule Pack reference.

Calculation inputs:

- advisor month;
- accumulated confirmed commission calculation;
- accumulated policy count;
- accumulated Life policy count;
- prior paid advances.

Qualification requires all row goals. The candidate gross calculation follows the governed strategy:

```text
base = bounded calculated award
excess = amount above maximum award × excess multiplier
net candidate = gross candidate - prior paid advances
```

A draft rule pack can create only an `ESTIMATED` bonus candidate. An official pack may become eligible for Stage 050 earned promotion, but Stage 040 does not perform that promotion.

## 040E — Direct Advisor Bonuses

### Nuevo Profesional

Required inputs:

```text
WEIGHTED_PREMIUM_SEMESTER
LIMRA
IGC
```

Missing input blocks the result. No default LIMRA or IGC values are authorized.

The candidate group and LIMRA percentage are applied exactly from the Stage 020 Rule Pack.

IGC is preserved as required evidence. The current legacy candidate rule does not define how IGC changes the percentage, so the result exposes that limitation rather than inventing behavior.

### GMM Quarterly

Required inputs:

```text
CONFIRMED_INITIAL_GMM_PREMIUM_QUARTER
CONFIRMED_INITIAL_GMM_POLICY_UNITS
```

The first qualifying group in descending rule order is selected. The candidate amount is:

```text
confirmedInitialGmmPremiumQuarter × groupPercentage
```

No qualifying group produces a valid zero candidate, not a missing-data zero.

### Truth State

All direct bonus calculations remain:

```text
TRUTH_STATE=ESTIMATED
PAYOUT_TRUTH=NO
COMPENSATION_EVENT_WRITTEN=NO
```

## 040F — Explanation and Digest

Every successful commission calculation exposes:

- advisor reference;
- policy reference;
- payment event ID;
- product and variant;
- initial or renewal state;
- contract age when relevant;
- policy year;
- rule ID;
- Rule Pack ID, version and digest;
- rule band;
- base rate;
- development factor;
- effective rate;
- current and accumulated confirmed premium;
- current and accumulated commission;
- covered period;
- evidence reference;
- human decision reference;
- formula explanation;
- candidate-rule warning;
- stable calculation digest.

The digest payload excludes volatile presentation state and includes all material economic inputs.

```text
DIGEST_ALGORITHM=SHA-256
KEY_ORDER=STABLE_RECURSIVE
INPUT_CHANGE_CHANGES_DIGEST=YES
SAME_INPUT_SAME_DIGEST=YES
```

## Calculation Truth

The current compensation pack is candidate-only. Therefore calculations remain:

```text
TRUTH_STATE=ESTIMATED
ELIGIBLE_FOR_EARNED_PROMOTION=NO
```

A future official rule resolution may set:

```text
ELIGIBLE_FOR_EARNED_PROMOTION=YES
```

Even then, the output truth state remains `ESTIMATED` until Stage 050 creates an append-only `EARNED` compensation event.

## Failure Modes

The engine blocks:

- invalid payment event;
- payment event not ready for calculation;
- missing advisor attribution;
- missing Rule Pack;
- missing policy year;
- conflicting renewal status;
- blocked or conflicting rule resolution;
- missing annual premium;
- unsupported payment frequency;
- invalid accumulated paid premium;
- missing advisor month;
- missing GMM contract age through the Rule Resolver;
- missing bonus eligibility inputs;
- missing Training Allowance authority.

Missing input is never converted to zero.

## Mutation Boundaries

```text
PAYMENT_EVENT_MUTATION=NO
RULE_PACK_MUTATION=NO
POLICY_TRUTH_MUTATION=NO
CARTERA_MUTATION=NO
SUPABASE_MUTATION=NO
INDEXEDDB_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
UI_MUTATION=NO
COMPENSATION_EVENT_WRITE=NO
AUTOMATIC_EARNED_PROMOTION=NO
AUTOMATIC_PAYOUT_CONFIRMATION=NO
PRODUCT_RECOMMENDATION_BY_COMMISSION=NO
```

## Exit Gate

```text
INITIAL_COMMISSION_ENGINE=PASS
RENEWAL_COMMISSION_ENGINE=PASS
GMM_ENGINE=PASS
TRAINING_ALLOWANCE_RECONCILIATION=PASS
DIRECT_ADVISOR_BONUSES=PASS
EXPLANATION_ENGINE=PASS
CALCULATION_DIGEST=PASS
STAGE_040_COMPLETE=YES
NEXT=ADVISOR_COMPENSATION_050_COMPENSATION_EVENT_AUTHORITY
```
