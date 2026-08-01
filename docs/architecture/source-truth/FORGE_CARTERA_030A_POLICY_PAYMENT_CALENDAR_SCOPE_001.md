# FORGE CARTERA 030A — POLICY & PAYMENT CALENDAR SCOPE 001

Forge OS
Architecture Source Truth
Cartera / Policy Obligations and Calendar Projection

## Status

`SCOPE_LOCKED / IMPLEMENTATION_NOT_STARTED`

## Date

2026-07-31

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_030A_POLICY_PAYMENT_CALENDAR_SCOPE
SOURCE_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
SOURCE_COMMIT=87c1fde90954b1ce7be37652bd103a4fe7544162
IMPLEMENTATION_BRANCH=docs/cartera-030a-policy-payment-calendar-scope
CANONICAL_ROADMAP_POINT=CARTERA_030_POLICY_AND_PAYMENT_CALENDAR
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

## Purpose

Lock the authority model, reuse map, recurrence rules, evidence semantics, correction rules, privacy boundary, allowed paths, negative gates and tests for:

`CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR`

030A creates no tables, productive runtime, remote mutation, UI mutation, payment confirmation or compensation truth.

---

# 1. Dependency gate

030A starts from the final green and remotely accepted CARTERA 020C boundary.

```text
CARTERA_020C_REMOTE_ACCEPTANCE=PASS
CARTERA_020C_COMPLETE=YES
POLICY_TRUTH_SOURCE=AVAILABLE
PAYMENT_EVIDENCE_CONFIRMATION_BOUNDARY=AVAILABLE
CARTERA_030A_AUTHORIZED=YES
```

The inherited source already provides canonical Policy and PolicyVersion persistence, advisor-scoped RLS, durable evidence packets, explicit payment-evidence confirmation, immutable history, Policy read-after-write verification and sanitized Timeline foundations.

---

# 2. Canonical authority decision

> An expected payment obligation is not a payment event, and a calendar entry is not operational truth.

The productive chain remains:

```text
confirmed Policy terms
→ deterministic expected obligation candidate
→ durable expected obligation ledger
→ calendar/read-model projection
→ detected payment evidence candidate
→ explicit evidence confirmation
→ confirmed PaymentEvent
→ obligation satisfaction or partial-satisfaction transition
```

Only a confirmed PaymentEvent may fully or partially satisfy an obligation.

A scheduled obligation proves only that confirmed Policy terms and explicit rules predict a future occurrence. It does not prove that money moved.

```text
PAYMENT_OBLIGATION_NOT_PAYMENT_EVENT=LOCKED
CALENDAR_IS_PROJECTION_NOT_TRUTH=LOCKED
PAYMENT_CONFIRMATION_REQUIRES_CONFIRMED_EVIDENCE=LOCKED
CONFIRMED_PAYMENT_EVIDENCE_BOUNDARY=LOCKED
COMPENSATION_AND_PAYOUT_TRUTH=FORBIDDEN
```

Revenue, commission, payout, bank settlement, carrier statement and production-credit truth remain outside CARTERA 030.

---

# 3. Required reuse map

## Canonical Policy source — `REUSE_CANONICAL`

- `supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql`
- accepted Policy and PolicyVersion read authorities;
- Policy evidence and version lineage.

Every obligation set must bind to one exact Policy version or immutable policy-term digest. A changed Policy version must not silently rewrite historical obligations.

## Payment evidence confirmation — `REUSE_CANONICAL`

- `policy-operations/evidence/payment-evidence-packet.js`

Preserve extracted, pending-confirmation, confirmed, rejected and unknown semantics. No extracted receipt, bank proof, carrier document or manual capture becomes operational truth before explicit confirmation.

## Confirmed PaymentEvent semantics — `REUSE_WITH_ADAPTER`

- `policy-operations/payment-event-engine.js`

Preserve the confirmed-evidence requirement and the rule that payment confirmed is not payout confirmed. A bounded adapter may reconcile a confirmed PaymentEvent against expected obligations without weakening PaymentEvent authority.

## Frequency primitive — `REFACTOR_FOUNDATION`

- `payment-frequency-engine.js`

Its current numeric factor is not a calendar authority. 030B must lock canonical frequency values, recurrence unit, interval, single-premium behavior, unknown-frequency behavior, month-end behavior, leap-year behavior, timezone, policy-year boundaries and allocation rounding before productive use.

## Renewal primitive — `REUSE_PRIMITIVE_ONLY`

- `policy-operations/renewals/policy-renewal-engine.js`

Its date filter may inform discovery but is not renewal truth. Renewal, anniversary and grace-period dates require confirmed Policy terms or versioned official rule authority.

## Timeline/read projection — `REUSE_PATTERN`

- `platform/policy-intelligence/cartera-010c-policy-detail-timeline.js`

Reuse owner-scoped projection, stable references, chronological ordering, sanitized output and reload-safe deterministic composition. 030B must not create a second generic Timeline authority.

---

# 4. 030B bounded construction

## 4.1 Durable expected payment obligation ledger

Each obligation preserves:

```text
obligationReference
advisorId
policyReference
policyVersionReference | policyTermsDigest
obligationKind
expectedDate | null
expectedAmount | null
currency | null
paymentFrequency | null
policyYear | null
sequenceNumber
status
scheduleRuleReference | null
sourceEvidenceReferences[]
matchedPaymentEventReferences[]
actualDate | null
actualAmount | null
confirmationState
supersedesObligationReference | null
createdAt
updatedAt
stateVersion
```

Initial obligation kind:

- `PREMIUM_PAYMENT`.

Anniversary, renewal and recommended-review items may share the calendar projection but must not be forced into payment semantics.

## 4.2 Stable identity, replay and correction

The same advisor, Policy version, obligation kind, expected date, sequence and recurrence rule must produce the same logical obligation identity.

Required behavior:

- identical generation replay is idempotent;
- changed Policy terms do not overwrite an accepted obligation silently;
- changed terms produce correction, supersession or explicit conflict;
- historical obligations remain auditable;
- duplicate active obligations for the same logical occurrence are forbidden;
- direct caller-supplied truth identifiers are recomputed or rejected;
- optimistic state version protects transitions.

```text
CORRECTION_AND_REPLAY_BOUNDARY=LOCKED
```

## 4.3 Minimum obligation states

```text
SCHEDULED
UPCOMING
DETECTED
CONFIRMATION_REQUIRED
CONFIRMED
PARTIAL
OVERDUE
NOT_FOUND
CORRECTED
CANCELLED
```

No state infers Policy lapse, coverage cancellation, reinstatement, payment rejection or carrier action without separate confirmed evidence.

## 4.4 Deterministic recurrence boundary

Schedule generation requires exact Policy version or term digest, known anchor date, known frequency, explicit generation horizon and advisor timezone.

Fail-closed rules:

- unknown frequency creates no guessed recurrence;
- unknown anchor date creates no guessed due date;
- unknown premium creates obligations with `expectedAmount=null`, never zero;
- unknown currency remains null;
- single premium creates at most one expected payment obligation;
- month-end anchors use one documented deterministic rule;
- leap-day anchors use one documented deterministic rule;
- annual transitions preserve policy-year lineage;
- floating timestamps are not obligation identity.

```text
DETERMINISTIC_RECURRENCE_BOUNDARY=LOCKED
```

## 4.5 Calendar projection

Calendar is a read model over durable obligations and explicit Policy dates, not a second truth store.

Projection kinds may include:

- expected premium payment;
- Policy anniversary supported by confirmed terms;
- renewal or end-of-term review supported by confirmed terms;
- policy-year transition;
- evidence-confirmation follow-up window;
- recommended review window clearly labeled as recommendation.

Every item includes stable source reference, date confidence, Policy reference, owner scope, sanitized explanation and whether the date is contractual, derived or recommended.

No item includes beneficiary details, raw receipts, bank data or payment-instrument secrets.

## 4.6 Operational horizons

```text
TODAY
NEXT_7_DAYS
NEXT_30_DAYS
NEXT_90_DAYS
OVERDUE
CONFIRMATION_REQUIRED
```

Horizon membership is deterministic in the advisor timezone and opening a list cannot mutate ledger state.

## 4.7 Payment matching and satisfaction

Matching may use Policy reference, coverage period, payment date, amount, currency, carrier reference and opaque evidence references.

Required outcomes:

```text
MATCHED
PARTIAL_MATCH
AMBIGUOUS
NO_MATCH
CONFLICT
```

Ambiguous evidence remains unresolved. One payment must not silently satisfy multiple obligations unless an explicit allocation command records the allocation.

## 4.8 Append-only operational evidence

030B must preserve immutable or append-only evidence for obligation creation, transition, PaymentEvent match, partial allocation, correction, cancellation, conflict and replay result.

A correction records actor, reason, previous reference, new reference, changed-input digest, timestamp, idempotency key and optimistic state version.

## 4.9 Grace periods and carrier rules

No grace period may be invented from generic insurance assumptions.

A grace-period projection requires confirmed Policy terms or a versioned official carrier/product rule with jurisdiction, effective-date applicability, provenance and boundary tests.

Without that authority:

```text
GRACE_PERIOD=UNKNOWN
GRACE_PERIOD_RULE_PROVENANCE=LOCKED
```

The system may recommend review but may not assert contractual coverage status.

---

# 5. Privacy, security and RLS

Required:

- obligations, transitions, conflicts and projections are advisor/tenant scoped;
- direct cross-advisor reads fail closed;
- direct authenticated table writes remain blocked unless later authorized through bounded commands;
- beneficiary and restricted PolicyRole data stay outside the general calendar;
- bank account, card, CLABE, token and full receipt content are never projected;
- evidence references are opaque and scope checked;
- logs use references and sanitized codes, not raw financial evidence;
- optimistic concurrency rejects stale transitions;
- Account creation or mutation remains unauthorized.

```text
BENEFICIARY_PRIVACY_BOUNDARY=LOCKED
PAYMENT_INSTRUMENT_DATA_PROJECTION=FORBIDDEN
CROSS_ADVISOR_ACCESS=FORBIDDEN
PRIVACY_AND_RLS_BOUNDARY=LOCKED
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

---

# 6. 030B allowed paths

```text
policy-operations/calendar/**
policy-operations/payments/**
platform/policy-intelligence/calendar/**
advisor-os/cartera/*payment*.js
advisor-os/cartera/*calendar*.js
supabase/migrations/*cartera030b*.sql
tests/cartera-030b-*.mjs
scripts/ci/cartera-030b-*.mjs
scripts/ci/cartera-030b-*.sql
docs/architecture/source-truth/FORGE_CARTERA_030B_*.md
docs/evidence/FORGE_CARTERA_030B_*.md
.github/workflows/cartera-030b-*.yml
```

Blocked without separate authorization:

- `cartera.js` and Material 3 runtime;
- generic Calendar application runtime;
- Google Calendar integration;
- Pipeline, Quotes, Activity, Reports, NASH, NBA, Candy Crush or Mi Día;
- compensation, commission, payout and banking truth;
- direct Person, Account, Policy or PolicyRole mutation;
- unrelated migrations;
- `main`;
- production deployment configuration.

```text
030B_ALLOWED_PATH_ROOTS=LOCKED
```

---

# 7. Schema and remote mutation decision

030A authorizes no schema or remote mutation.

030B may propose repository migrations for an owner-scoped obligation ledger, transition history, conflicts and bounded read/command RPCs only when Policy and Event authorities are reused, RLS and direct-write revocation are explicit, idempotency and optimistic concurrency are tested, correction history is preserved and remote deployment remains separately authorized.

```text
CARTERA_030A_SCHEMA_MUTATION=NO
CARTERA_030A_SUPABASE_REMOTE_MUTATION=NO
CARTERA_030B_REPOSITORY_SCHEMA_PROPOSAL=CONDITIONALLY_AUTHORIZED
CARTERA_030B_SUPABASE_REMOTE_MUTATION=NO
```

---

# 8. Required 030B tests

030B must prove:

1. identical Policy terms generate identical obligation references;
2. monthly, quarterly, semiannual and annual recurrence is deterministic;
3. single-premium Policy creates no recurring obligations;
4. unknown frequency creates no guessed schedule;
5. unknown premium stays null and never becomes zero;
6. unknown currency stays null;
7. month-end recurrence follows the locked rule;
8. leap-year recurrence follows the locked rule;
9. policy-year sequence is deterministic;
10. identical generation replay is idempotent;
11. changed Policy version creates correction or supersession;
12. stale state version is rejected;
13. extracted payment evidence does not confirm an obligation;
14. confirmed PaymentEvent can satisfy one exact obligation;
15. partial confirmed amount produces `PARTIAL` when amount is known;
16. ambiguous matching remains unresolved;
17. duplicate confirmed evidence is idempotent;
18. changed evidence creates conflict rather than silent rematch;
19. overdue does not infer Policy lapse or cancellation;
20. grace period stays unknown without versioned rule authority;
21. Today, 7, 30 and 90 day horizons are deterministic;
22. reload preserves ledger and projection state;
23. cross-advisor reads fail closed;
24. direct writes are blocked;
25. beneficiary and payment-instrument data never enter general projection;
26. no obligation creates compensation or payout truth;
27. no external Calendar event, task, message or opportunity is created;
28. repository construction performs no remote Supabase mutation.

```text
030B_REQUIRED_TESTS=LOCKED
```

---

# 9. Global negative gates

030B must not:

- treat an expected obligation as proof of payment;
- create a PaymentEvent because a date passed;
- confirm payment from extracted evidence without confirmation;
- infer Policy lapse, cancellation, reinstatement or renewal;
- invent amount, currency, frequency, due date or grace period;
- silently overwrite historical obligations;
- allocate one payment across obligations without explicit recorded authority;
- expose beneficiary details or payment-instrument secrets;
- create compensation, commission, payout, revenue or bank truth;
- create Google Calendar events or mutate an external calendar;
- create tasks, messages, opportunities or Pipeline changes;
- mutate Person, Account, Policy or PolicyRole directly;
- redesign product UI;
- execute remote Supabase mutation;
- merge to `main` during repository construction.

---

# 10. 030A exit gate

```text
SOURCE_COMMIT_VERIFIED=YES
CARTERA_020C_COMPLETE=YES
POLICY_TRUTH_SOURCE=LOCKED
PAYMENT_OBLIGATION_NOT_PAYMENT_EVENT=LOCKED
CONFIRMED_PAYMENT_EVIDENCE_BOUNDARY=LOCKED
DETERMINISTIC_RECURRENCE_BOUNDARY=LOCKED
CORRECTION_AND_REPLAY_BOUNDARY=LOCKED
CALENDAR_IS_PROJECTION_NOT_TRUTH=LOCKED
GRACE_PERIOD_RULE_PROVENANCE=LOCKED
COMPENSATION_AND_PAYOUT_TRUTH=FORBIDDEN
BENEFICIARY_PRIVACY_BOUNDARY=LOCKED
PAYMENT_INSTRUMENT_DATA_PROJECTION=FORBIDDEN
PRIVACY_AND_RLS_BOUNDARY=LOCKED
030B_ALLOWED_PATH_ROOTS=LOCKED
030B_REQUIRED_TESTS=LOCKED
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
UNAUTHORIZED_EFFECTS=NONE
CARTERA_030A_COMPLETE=YES
NEXT=CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR
```