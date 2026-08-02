# Advisor Compensation Event Authority 001

Status: STAGE 050 CONTROLLED IMPLEMENTATION

## Purpose

Create the append-only authority that records advisor compensation interpretations without confusing a calculated estimate, earned compensation, or carrier-paid compensation.

## Constitutional chain

```text
Confirmed Payment Event
-> Official Compensation Rule Snapshot
-> Reproducible Calculation
-> Estimated Compensation Event
-> Earned Promotion Gate
-> Earned Compensation Event
-> Adjustment / Reversal Events
-> Period Snapshot
```

`PAID` is not authorized in Stage 050. Paid truth requires payout evidence, statement matching and human confirmation in Stage 090.

## Event contract

Contract:

```text
ADVISOR_COMPENSATION_EVENT_001
```

Supported states:

```text
ESTIMATED
EARNED
ADJUSTED
REVERSED
```

Unsupported in this stage:

```text
PAID
```

Event kinds:

```text
COMMISSION
BONUS
ADJUSTMENT
REVERSAL
```

Every event includes:

- immutable event ID and SHA-256 digest;
- advisor ownership scope;
- aggregate key and sequence;
- previous event reference;
- concept and state;
- amount and currency;
- exact calculation record;
- rule snapshot identity and digest;
- payment and human-decision evidence;
- idempotency and correlation keys;
- creation instant and actor;
- append-only safeguards.

## Calculation record

A commission event records:

- calculation ID, type and digest;
- advisor, policy and payment event references;
- product, variant and policy year;
- payment basis and production context;
- current amount and accumulated amount;
- rule ID, Rule Pack ID, version and digest;
- governance and source states;
- base rate, development factor and effective rate;
- payment period and explanation.

A bonus event records:

- bonus concept;
- qualifying inputs;
- candidate amount;
- selected authority;
- calculation digest;
- eligibility for earned promotion;
- warnings and assumptions.

## Estimated event creation

Every successful Stage 040 calculation can be recorded as `ESTIMATED`.

A calculation must be:

```text
status=CALCULATED
calculationDigest=SHA-256
amount>=0
advisorReference=KNOWN
periodKey=KNOWN
```

Recording an estimate does not assert that compensation is earned or paid.

## Earned promotion gate

Promotion from `ESTIMATED` to `EARNED` requires all of the following:

1. Existing estimated event.
2. Reproducible calculated result.
3. Matching calculation digest.
4. Matching advisor, policy and payment references.
5. Confirmed Payment Event from Stage 030.
6. Payment event ready for calculation.
7. Payment evidence reference.
8. Human decision reference.
9. Official Rule Pack calculation.
10. Official rule snapshot with source truth.
11. Matching Rule Pack digest.

The candidate Rule Pack from Stage 020 cannot pass the gate.

Promotion is explicit and creates a second event. It never mutates the estimated event.

## Append-only repository

Stage 050 provides an in-memory reference repository for domain acceptance.

Capabilities:

```text
APPEND=YES
READ=YES
UPDATE=NO
OVERWRITE=NO
DELETE=NO
REMOTE_PERSISTENCE=NO
```

Repository rules:

- exact replay returns the existing event;
- same idempotency key with changed content is rejected;
- duplicate event ID with changed digest is rejected;
- aggregate sequence must be contiguous;
- every event after the first must reference the immediately previous event;
- advisor ownership cannot change inside an aggregate;
- currency cannot change inside an aggregate;
- reads require the matching advisor scope.

The productive owner-scoped persistent implementation is deferred until remote schema authorization.

## Adjustments

Adjustments are delta events, not replacements.

Examples:

```text
RETROACTIVE_DIFFERENCE
RATE_CORRECTION
REFUND
```

An adjustment requires:

- an `EARNED` or prior `ADJUSTED` base event;
- non-zero signed delta;
- reason;
- actor;
- evidence references;
- idempotency and correlation keys.

The event stores the prior amount, delta and resulting net amount.

## Reversals

A full reversal creates a negative event referencing the event being reversed.

Typical causes:

```text
CANCELLATION
FULL_REVERSAL
```

A reversal requires an earned or adjusted positive base event, reason, actor and evidence. It never deletes the original event.

## Truth boundaries

```text
CONFIRMED_PAYMENT_IS_PAID_COMMISSION=NO
CALCULATION_IS_EARNED_EVENT=NO
ESTIMATED_EVENT_IS_EARNED=NO
EARNED_EVENT_IS_PAID=NO
ADJUSTMENT_OVERWRITES_HISTORY=NO
REVERSAL_DELETES_HISTORY=NO
```

## Security and ownership

The reference repository enforces advisor-scoped reads and lineage consistency. It performs no Supabase, IndexedDB, Cartera, Policy Truth or UI mutation.

## Exit gate

```text
COMPENSATION_EVENT_CONTRACT=PASS
APPEND_ONLY_PERSISTENCE=PASS
CALCULATION_RECORD=PASS
EARNED_PROMOTION_GATE=PASS
ADJUSTMENT_REVERSAL=PASS
STAGE_050_COMPLETE=YES
```
