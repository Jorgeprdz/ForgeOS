# FORGE CARTERA 030C + 030D — COMBINED POLICY PAYMENT PRODUCT 001

## Status

`COMBINED_IMPLEMENTATION_AUTHORIZED`

## Execution identity

```text
AUTHORIZED_PHASE=CARTERA_030C_AND_030D_COMBINED_PASS
SOURCE_BRANCH=feature/cartera-030b-expected-payment-obligation-ledger-calendar
SOURCE_COMMIT=f8900c7b2e2ff1d73fd5f6c2b54e145af010282b
IMPLEMENTATION_BRANCH=feature/cartera-030cd-payment-reconciliation-calendar-product
PROJECT_REF=rmlxigxysujsuwzgoimv
```

## Combined delivery decision

030C and 030D are executed in one branch, one PR and one remote acceptance, with two internal gates:

```text
030C_GATE=CONFIRMED_PAYMENT_EVENT_AUTHORITY_AND_RECONCILIATION
030D_GATE=SANITIZED_POLICY_PAYMENT_CALENDAR_PRODUCT_SURFACE
```

Failure of the product surface must not weaken or bypass the payment authority gate.

## 030C contract

```text
confirmed payment evidence
→ explicit authorization digest
→ durable owner-scoped PaymentEvent
→ deterministic obligation match
→ append-only reconciliation and transition
→ confirmed or partial obligation state
```

- Extracted or pending evidence cannot create PaymentEvent truth.
- PaymentEvent truth does not create payout, commission or banking truth.
- Ambiguous, missing, currency-mismatched and excessive-amount matches remain reviewable conflicts.
- Replays are idempotent; changed input becomes a durable conflict.
- Direct authenticated writes remain blocked.

## 030D contract

The product surface reads a sanitized projection for:

- today;
- next 7 days;
- next 30 days;
- next 90 days;
- overdue;
- confirmation required;
- confirmed;
- partial.

The route displays both a portfolio summary and a policy-detail calendar. It never displays raw evidence, beneficiaries, payment instruments, compensation or payout data. An overdue item never asserts lapse, cancellation or loss of coverage.

## Product behavior

030D is mounted as an enhancement over the accepted Cartera route. It preserves the existing canonical directory and policy detail and adds:

- portfolio payment calendar panel;
- policy-level payment calendar section;
- read-only navigation from a calendar item to its policy;
- fail-closed loading and error states;
- mobile bottom safe area inherited from the existing Cartera route.

The product UI does not expose a button that fabricates a PaymentEvent. The 030C command service is reserved for a confirmed-evidence workflow.

## Negative gates

```text
PAYMENT_FROM_UNCONFIRMED_EVIDENCE=FORBIDDEN
AUTOMATIC_MULTI_OBLIGATION_ALLOCATION=FORBIDDEN
POLICY_LAPSE_INFERENCE=FORBIDDEN
PAYMENT_INSTRUMENT_PROJECTION=FORBIDDEN
BENEFICIARY_PROJECTION=FORBIDDEN
COMMISSION_AND_PAYOUT_TRUTH=FORBIDDEN
GOOGLE_CALENDAR_MUTATION=FORBIDDEN
PIPELINE_MUTATION=FORBIDDEN
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

## Exit gate

```text
CARTERA_030C_REPOSITORY_GATE=PASS
CARTERA_030D_REPOSITORY_GATE=PASS
CARTERA_030CD_REMOTE_ACCEPTANCE=PASS
CARTERA_030C_COMPLETE=YES
CARTERA_030D_COMPLETE=YES
CARTERA_030_POLICY_AND_PAYMENT_CALENDAR=COMPLETE
NEXT=CARTERA_040_RELATIONSHIP_MEMORY_AND_NETWORK_CONTEXT
```
