# Advisor Compensation Income Truth Minimum 001

Status: STAGE 060 CONTROLLED IMPLEMENTATION

## Purpose

Build advisor-scoped monthly compensation snapshots without confusing:

```text
ESTIMATED
EARNED
PAID
POTENTIAL
AT_RISK
ADJUSTED
REVERSED
UNKNOWN
```

The snapshot is a read model. It does not create compensation events, payout truth, policy facts, payment facts or production facts.

## Constitutional chain

```text
Compensation Events
+ Confirmed Payout Records
+ Explicit Forward Signals
-> Monthly Income Projection
-> Advisor Compensation Period Snapshot
-> Historical Series
```

Production events remain facts. Compensation and income snapshots are period-bound interpretations of those facts.

## Period contract

Monthly snapshots require:

```text
PERIOD_KEY=YYYY-MM
ADVISOR_REFERENCE=KNOWN
CURRENCY=KNOWN
CAPTURED_AT=KNOWN
```

Quarter, semester, contest and campaign events are not silently assigned to a month.

They require:

```text
metadata.incomePeriodKey=YYYY-MM
```

Conflicting or missing monthly attribution is blocked.

## Compensation event projection

Events are grouped by `aggregateKey` and projected in sequence.

A valid timeline begins with `ESTIMATED`.

```text
ESTIMATED
-> EARNED
-> ADJUSTED*
-> REVERSED?
```

Rules:

- `ESTIMATED` and `EARNED` are alternative truth positions and are never added together.
- `ADJUSTED` contributes a signed delta.
- `REVERSED` contributes a negative delta.
- sequence and `previousEventId` must be contiguous;
- duplicate event IDs with changed digests are rejected;
- owner, period and currency boundaries are enforced;
- events after a full reversal are blocked.

Projection totals:

```text
estimated
earnedGross
adjustments
reversals
earnedNet = earnedGross + adjustments + reversals
```

## Stage 050 lineage correction

Stage 060 reconciliation exposed a dependency defect in chained adjustments.

Previously, a second adjustment or a reversal based on an `ADJUSTED` event could use only the latest delta as its base instead of the aggregate net amount.

The adjustment service now resolves:

```text
EARNED base -> event amount
ADJUSTED base -> metadata.resultingNetAmount
```

Therefore:

```text
EARNED 100
ADJUSTED +20 -> 120
ADJUSTED +10 -> 130
REVERSED -130 -> 0
```

History remains append-only.

## Paid truth

Paid compensation remains separate from earned compensation.

Stage 060 accepts only confirmed payout read records with:

- payout evidence;
- evidence hash;
- human decision;
- source authority;
- advisor and month;
- positive amount and currency;
- at least one matched compensation event;
- deterministic record digest.

No payout record provider means:

```text
PAID_SOURCE=DISCONNECTED
PAID_AMOUNT=null
```

An available provider with zero matching records means:

```text
PAID_SOURCE=AVAILABLE
PAID_AMOUNT=0
KNOWN_ZERO=YES
```

Unknown is never converted to zero.

Stage 060 reads payout truth but does not create it and does not promote events to `PAID`.

## Real income view

The snapshot exposes `real` as a derived best-known amount while preserving all source values.

```text
PAID available -> REAL_BASIS=PAID
PAID unavailable + EARNED exists -> REAL_BASIS=EARNED
No PAID or EARNED -> REAL_BASIS=UNAVAILABLE
```

`real` never includes estimated, potential or at-risk amounts.

This derived field does not redefine earned as paid.

## Potential and at-risk

Forward signals use:

```text
ADVISOR_COMPENSATION_FORWARD_SIGNAL_001
```

Kinds:

```text
POTENTIAL
AT_RISK
```

Signals require explicit source authority, source reference, advisor, period, amount and currency.

They are always marked:

```text
incomeTruth=false
earnedTruth=false
paidTruth=false
includedInRealIncome=false
probabilityWeightingApplied=false
```

Potential is not a quote, issued premium or guaranteed income.

At-risk is an explicit signal and is not silently subtracted from earned or paid income.

## Period snapshot

Contract:

```text
ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001
```

Amounts:

```text
estimated
earned.gross
earned.adjustments
earned.reversals
earned.net
paid.sourceState
paid.value
real.basis
real.value
potential
atRisk
```

Statuses:

```text
READY
PARTIAL
EMPTY
BLOCKED
```

A disconnected payout provider produces `PARTIAL`, not a false zero.

## Historical series

Contract:

```text
ADVISOR_COMPENSATION_HISTORY_SERIES_001
```

The series:

- sorts unique monthly periods;
- creates one immutable snapshot per period;
- preserves `paid=null` when payout truth is unavailable;
- prevents cross-period leakage;
- exposes estimated, earned, paid, real, potential, at-risk, adjustments and reversals;
- computes a stable SHA-256 series digest.

## Truth boundaries

```text
QUOTE_AS_INCOME=NO
ISSUED_PREMIUM_AS_INCOME=NO
ESTIMATED_AS_EARNED=NO
EARNED_AS_PAID=NO
POTENTIAL_AS_REAL=NO
AT_RISK_SILENTLY_SUBTRACTED=NO
UNKNOWN_AS_ZERO=NO
CROSS_PERIOD_MIXING=NO
```

## Persistence and UI

Stage 060 performs no:

```text
SUPABASE_WRITE
INDEXEDDB_WRITE
REMOTE_DATABASE_WRITE
COMPENSATION_EVENT_WRITE
PAYOUT_PROMOTION
UI_CONNECTION
SMART_WIDGET_CONNECTION
```

Product UI connection begins in Stage 070.

## Exit gate

```text
COMPENSATION_INCOME_TRUTH_MINIMUM=PASS
PERIOD_SNAPSHOT=PASS
REAL_EARNED_PAID_SEPARATION=PASS
POTENTIAL_AT_RISK_SEPARATION=PASS
HISTORICAL_SERIES=PASS
MONTHLY_PERIOD_ATTRIBUTION=PASS
UNKNOWN_IS_NOT_ZERO=PASS
STAGE_050_CHAINED_ADJUSTMENT_REGRESSION=PASS
STAGE_060_COMPLETE=YES
```
