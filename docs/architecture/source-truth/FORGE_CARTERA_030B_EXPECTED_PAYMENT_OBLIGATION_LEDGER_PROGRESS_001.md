# FORGE CARTERA 030B — EXPECTED PAYMENT OBLIGATION LEDGER AND POLICY CALENDAR 001

Forge OS
Architecture Source Truth
Cartera / Policy Obligations and Calendar Projection

## Status

`REPOSITORY_FOUNDATION_READY / REMOTE_ACCEPTANCE_NOT_RUN`

## Date

2026-07-31

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR
SOURCE_BRANCH=docs/cartera-030a-policy-payment-calendar-scope
SOURCE_COMMIT=b699d071be415c431355cb797a5b23a4c323df15
IMPLEMENTATION_BRANCH=feature/cartera-030b-expected-payment-obligation-ledger-calendar
CANONICAL_SCOPE=FORGE_CARTERA_030A_POLICY_PAYMENT_CALENDAR_SCOPE_001.md
SCHEMA_MUTATION=REPOSITORY_PROPOSAL_ONLY
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

## Delivered repository foundation

### Deterministic recurrence engine

`policy-operations/calendar/cartera-030b-recurrence-engine.js`

Delivers:

- canonical `MONTHLY`, `QUARTERLY`, `SEMIANNUAL`, `ANNUAL` and `SINGLE` recurrence;
- local-date semantics without floating timestamp identity;
- deterministic month-end clamping;
- deterministic leap-day behavior;
- generation horizon and coverage-end bounds;
- stable SHA-256 obligation references;
- Policy-version and Policy-term digest binding;
- sequence and policy-year lineage;
- maximum occurrence guard;
- explicit unknown-frequency and unknown-anchor blocking;
- unknown amount and currency preservation.

A canonical Policy `premium_amount` is not divided or promoted automatically. It becomes an expected amount only when the caller supplies explicit `PER_OCCURRENCE` semantics and an approved schedule-rule reference. Otherwise `expectedAmount=null`.

### PaymentEvent reconciliation contract

`policy-operations/payments/cartera-030b-payment-obligation-reconciliation.js`

Delivers pure deterministic outcomes:

```text
MATCHED
PARTIAL_MATCH
AMBIGUOUS
NO_MATCH
CONFLICT
IDEMPOTENT_REPLAY
```

Only a PaymentEvent whose underlying payment evidence is already `confirmed` may create a satisfaction transition. Exact Policy ownership and exact date or covered-period evidence are required. Currency mismatch, over-allocation and multi-obligation ambiguity remain conflicts.

This contract does not create PaymentEvent truth and does not create payout, commission, carrier-statement or banking truth.

### Sanitized Policy calendar read model

`platform/policy-intelligence/calendar/cartera-030b-policy-calendar-read-model.js`

Delivers deterministic horizons:

```text
TODAY
NEXT_7_DAYS
NEXT_30_DAYS
NEXT_90_DAYS
OVERDUE
CONFIRMATION_REQUIRED
```

The projection:

- never mutates ledger state when opened;
- derives `UPCOMING` and `OVERDUE` as read state only;
- never infers lapse, cancellation, rejection or carrier action;
- excludes evidence contents, beneficiary data, PaymentEvent payloads and payment instruments;
- fails closed on cross-advisor rows.

### Bounded service orchestration

`advisor-os/cartera/cartera-030b-payment-obligation-service.js`

The service requires an injected repository contract and may only:

- load exact current Policy terms;
- generate deterministic obligation candidates;
- persist an obligation batch through a bounded repository method;
- list obligations;
- reconcile a confirmed PaymentEvent through the pure contract;
- persist a reconciliation through a bounded repository method;
- build the minimized calendar projection.

It contains no Supabase client, no direct canonical Policy writes and no Account mutation path.

### Durable ledger schema proposal

`supabase/migrations/20260731000250_cartera030b_expected_payment_obligation_ledger.sql`

Proposes owner-scoped durable authorities for:

- expected payment obligations;
- append-only obligation transitions;
- append-only PaymentEvent reconciliations;
- append-only conflicts;
- append-only command receipts.

The schema locks:

- exact Policy and PolicyVersion foreign keys;
- immutable obligation identity;
- optimistic `state_version` increments;
- active-occurrence uniqueness;
- append-only history;
- forced RLS;
- revoked direct `anon` and `authenticated` table access;
- no hard deletes;
- no compensation, payout or payment-instrument fields.

### Generation and calendar RPC proposal

`supabase/migrations/20260731000251_cartera030b_generation_and_calendar_rpc.sql`

Proposes two authenticated bounded RPCs:

```text
forge_cartera030b_generate_expected_obligations(jsonb)
forge_cartera030b_list_expected_obligations(jsonb)
```

Generation is:

- explicitly authorized;
- bound to the exact payload with canonical UTF-8 SHA-256;
- bound to the owning advisor;
- bound to the exact current PolicyVersion and `facts_digest`;
- computed server-side using deterministic recurrence;
- idempotent by command receipt;
- conflict-producing on changed-input replay or identity collision;
- unable to infer unknown anchor, frequency or amount semantics.

The list RPC exposes only sanitized calendar fields. Raw evidence references, matched PaymentEvent arrays, beneficiaries and payment instruments are not returned.

## Deliberate boundary

The repository contains a durable reconciliation table and a pure reconciliation contract, but the public SQL reconciliation command is not exposed in this cut.

Reason:

> the current repository has a confirmed PaymentEvent engine but no accepted durable canonical PaymentEvent reference authority that the database can independently verify.

Exposing a public reconciliation RPC before that authority exists would let a caller present an unverified PaymentEvent envelope. The correct next acceptance task must either bind reconciliation to an accepted durable PaymentEvent authority or keep reconciliation persistence behind a trusted server adapter.

```text
PAYMENT_EVENT_CREATION_AUTHORITY=REUSED_NOT_REPLACED
PUBLIC_PAYMENT_RECONCILIATION_RPC=WITHHELD_PENDING_DURABLE_EVENT_AUTHORITY
```

## Tests

Repository tests cover:

- deterministic month-end and leap-year behavior;
- all supported recurrence frequencies;
- single premium;
- unknown anchor/frequency/amount/currency;
- stable obligation identity;
- coverage-end and policy-year lineage;
- confirmed, partial, ambiguous, conflicting and replayed payment matching;
- cross-advisor mismatch;
- Today/7/30/90 and overdue projections;
- no lapse inference;
- privacy minimization;
- read-only calendar behavior;
- bounded service orchestration;
- ledger schema, RLS, append-only and state-version contracts;
- digest-bound authorization;
- changed-input conflict persistence;
- absence of remote execution.

## Negative gates

030B does not:

- mutate Supabase remotely;
- change Material 3 or `cartera.js`;
- create Google Calendar events;
- create tasks, messages, opportunities or Pipeline transitions;
- create or modify Person, Account, Policy or PolicyRole Truth;
- create PaymentEvent truth from expected dates;
- infer payment from time passage;
- infer lapse or cancellation from an overdue projection;
- calculate commission or payout;
- expose beneficiaries, receipts, bank data, cards, CLABE or tokens;
- write `main`.

## Repository exit state

```text
DETERMINISTIC_RECURRENCE_ENGINE=READY
MONTH_END_RULE=LOCKED
LEAP_YEAR_RULE=LOCKED
SINGLE_PREMIUM_RULE=LOCKED
UNKNOWN_VALUE_PRESERVATION=LOCKED
STABLE_OBLIGATION_IDENTITY=LOCKED
EXPECTED_OBLIGATION_LEDGER_SCHEMA=READY
APPEND_ONLY_TRANSITION_HISTORY=LOCKED
OPTIMISTIC_STATE_VERSION=LOCKED
CHANGED_INPUT_CONFLICT=LOCKED
CONFIRMED_PAYMENT_MATCH_CONTRACT=READY
POLICY_CALENDAR_READ_MODEL=READY
CALENDAR_HORIZONS=LOCKED
OVERDUE_NOT_LAPSE=LOCKED
BENEFICIARY_PRIVACY_BOUNDARY=LOCKED
PAYMENT_INSTRUMENT_DATA_PROJECTION=FORBIDDEN
COMPENSATION_AND_PAYOUT_TRUTH=FORBIDDEN
DIRECT_TABLE_ACCESS=BLOCKED
ACCOUNT_MUTATION=NOT_AUTHORIZED
PRODUCT_UI_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
CARTERA_030B_REPOSITORY_FOUNDATION=READY
CARTERA_030B_COMPLETE=NO
NEXT=CARTERA_030B_REMOTE_ACCEPTANCE
```
