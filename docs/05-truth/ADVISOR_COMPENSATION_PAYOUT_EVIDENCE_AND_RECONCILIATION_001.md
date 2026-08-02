# Advisor Compensation — Payout Evidence and Reconciliation 001

## Status

```text
STAGE=ADVISOR_COMPENSATION_090
AUTHORITY=COMPENSATION_PAYOUT_EVIDENCE
AUTOMATIC_CONFIRMATION=FORBIDDEN
AUTOMATIC_PAID_PROMOTION=FORBIDDEN
REMOTE_PERSISTENCE=NOT_AUTHORIZED
```

## Purpose

Stage 090 establishes the minimum governed path from `EARNED` compensation to confirmed `PAID` truth.

`PAID` is not inferred from issued premium, collected policy premium, quotes, Pipeline activity, Cartera obligations, estimates or simulations. It exists only as a `CONFIRMED_COMPENSATION_PAYOUT` record backed by payout evidence and a human decision.

## Evidence intake

Accepted source classes:

- `OFFICIAL_STATEMENT`
- `CARRIER_REPORT`
- `RECEIPT`
- `CONTROLLED_MANUAL`

Controlled manual evidence requires both an actor and an explicit reason. Every evidence object requires a SHA-256 evidence hash and immutable normalized lines.

Each normalized line carries:

```text
advisorReference
paymentDate
periodKey
amount
currency
concept
policyReference
carrierReference
evidenceHash
```

A line can represent:

```text
PAYMENT
ADJUSTMENT
REVERSAL
RETROACTIVE_DIFFERENCE
```

## Matching

Stage 090 proposes matches against active earned aggregates. It never confirms a proposal automatically.

Match states:

```text
EXACT
GROUPED
DIFFERENCE
AMBIGUOUS
UNMATCHED
```

A proposal is owner-scoped, period-scoped and currency-scoped. Policy and concept references strengthen identity. Grouped payments may reconcile one statement line against multiple earned events when their net earned amounts add exactly to the line amount.

Ambiguous proposals expose candidate event IDs. A human may select the correct earned event, but the system does not choose autonomously.

## Human confirmation

Every paid promotion requires a human decision record containing:

```text
humanDecisionId
proposalId
proposalDigest
actorId
reason
decidedAt
selectedCompensationEventIds
```

A rejected decision cannot create payout truth.

## Paid promotion

Paid promotion creates a `ADVISOR_COMPENSATION_CONFIRMED_PAYOUT_RECORD_001` record with:

- evidence reference and evidence hash;
- human decision ID;
- selected earned event IDs;
- actual paid amount and currency;
- statement payment date, concept, policy and carrier references;
- proposal and confirmation digests.

The compensation event ledger remains append-only and is not overwritten. Stage 090 does not rewrite `EARNED`, `ADJUSTED` or `REVERSED` events.

## Difference reconciliation

The reconciliation report represents differences explicitly:

```text
MATCHED
UNDERPAYMENT
OVERPAYMENT
GROUPED_PAYMENT
MISSING_COMMISSION
RETROACTIVE_DIFFERENCE
ADJUSTMENT
REVERSAL
AMBIGUOUS
UNMATCHED_PAYMENT
```

Totals are reported as:

```text
expectedEarned
confirmedPaid
difference = confirmedPaid - expectedEarned
```

When payout authority is disconnected, all three totals remain `null`. Unknown is never converted to zero.

## Authority

The Stage 090 reference authority is append-only and in-memory. It supports:

```text
intakeEvidence
proposeMatches
confirmMatch
promotePaid
reconcile
listPayoutRecords
```

It does not authorize Supabase, IndexedDB, remote database, Cartera, Pipeline, Policy Truth, payment-event or Rule Pack mutation.

## Exit gate

```text
PAYOUT_EVIDENCE_INTAKE=PASS
STATEMENT_NORMALIZATION=PASS
STATEMENT_MATCH=PASS
HUMAN_CONFIRMATION=PASS
PAID_PROMOTION=PASS
DIFFERENCE_RECONCILIATION=PASS
STAGE_090_COMPLETE=YES
```
