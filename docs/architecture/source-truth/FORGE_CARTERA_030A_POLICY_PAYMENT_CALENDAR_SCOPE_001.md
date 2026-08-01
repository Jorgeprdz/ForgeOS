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

Lock the exact authority model, reuse map, deterministic recurrence boundary, evidence semantics, correction rules, privacy constraints, allowed paths, negative gates and acceptance requirements for:

`CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR`

030A does not create tables, calculate productive obligations, mutate Supabase, alter Policy Truth, confirm payments, create Calendar events, redesign Cartera or touch compensation truth.

---

# 1. Dependency gate

030A starts only from the remotely accepted CARTERA 020C control boundary.

The source contains:

- canonical Policy and PolicyVersion persistence;
- confirmed identity and PolicyRole ordering;
- durable evidence packets and confirmation state;
- advisor-bound RLS;
- immutable evidence and transition history;
- accepted Policy read-after-write verification;
- productive Policy Timeline and directory read foundations;
- explicit Account mutation prohibition;
- successful remote acceptance with no residual fixtures.

```text
CARTERA_020C_REMOTE_ACCEPTANCE=PASS
CARTERA_020C_COMPLETE=YES
POLICY_TRUTH_SOURCE=AVAILABLE
PAYMENT_EVIDENCE_CONFIRMATION_BOUNDARY=AVAILABLE
CARTERA_030A_AUTHORIZED=YES
```

---

# 2. Canonical authority decision

> An expected payment obligation is not a payment event, and a calendar entry is not operational truth.

The productive chain must remain:

```text
confirmed Policy terms
→ deterministic expected obligation candidate
→ durable expected obligation ledger
→ calendar/read-model projection
→ detected payment evidence candidate
→ explicit payment evidence confirmation
→ confirmed PaymentEvent
→ obligation satisfaction or partial-satisfaction transition
```

The following authorities remain distinct:

## Policy Truth

Owned by the accepted canonical Policy and PolicyVersion persistence boundary.

Policy terms may supply:

- effective date;
- issue date;
- end date when known;
- premium amount when known;
- currency when known;
- payment frequency when known;
- carrier and product references;
- status and source provenance;
- version lineage.

Unknown Policy facts remain unknown.

## Expected obligation projection

Owned by CARTERA 030B only after repository construction and separate remote acceptance.

An expected obligation represents what should happen according to confirmed Policy terms and explicit rule inputs. It does not prove that money moved.

## Payment evidence

Owned by the existing PaymentEvidencePacket confirmation boundary.

Extracted receipts, bank proofs, carrier documents or manual captures are evidence candidates until explicit confirmation.

## Payment event

Owned by the existing PaymentEvent engine after confirmed payment evidence.

A PaymentEvent may satisfy, partially satisfy or conflict with an expected obligation. It must not be created solely because an expected date arrived.

## Revenue, commission and payout truth

Remain outside CARTERA 030.

No expected obligation, payment evidence candidate, calendar projection or overdue state may become:

- commission truth;
- payout truth;
- bank settlement truth;
- carrier statement truth;
- production-credit truth.

```text
PAYMENT_OBLIGATION_NOT_PAYMENT_EVENT=LOCKED
CALENDAR_IS_PROJECTION_NOT_TRUTH=LOCKED
PAYMENT_CONFIRMATION_REQUIRES_CONFIRMED_EVIDENCE=LOCKED
COMPENSATION_AND_PAYOUT_TRUTH=FORBIDDEN
```

---

# 3. Required reuse map

## Canonical Policy source — `REUSE_CANONICAL`

- `supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql`
- canonical Policy and PolicyVersion read authorities accepted by CARTERA 010B/010C/020C;
- Policy evidence and version lineage.

030B must bind every generated obligation set to one exact Policy version or equivalent immutable policy-term digest.

A changed Policy version must never silently rewrite historical obligations.

## Payment evidence confirmation — `REUSE_CANONICAL`

- `policy-operations/evidence/payment-evidence-packet.js`

Preserve:

- extracted versus pending-confirmation versus confirmed state;
- evidence source references;
- actor and confirmation time;
- payment amount/date/frequency/coverage-period fields;
- rejection and unknown state;
- no operational truth before confirmation.

## Confirmed PaymentEvent semantics — `REUSE_WITH_ADAPTER`

- `policy-operations/payment-event-engine.js`

Preserve:

- confirmed payment evidence requirement;
- payment event identity and provenance;
- payment confirmed is not payout confirmed;
- no payout truth without statement authority.

030B may add a bounded adapter that reconciles a confirmed PaymentEvent against one or more expected obligations. It must not weaken PaymentEvent creation rules.

## Frequency primitive — `REFACTOR_FOUNDATION`

- `payment-frequency-engine.js`

The current frequency factor helper is insufficient as a calendar authority. 030B may reuse its vocabulary only after locking:

- canonical frequency values;
- recurrence unit and interval;
- single-premium behavior;
- unknown-frequency behavior;
- month-end behavior;
- leap-year behavior;
- timezone and local-date semantics;
- policy-year boundaries;
- deterministic rounding rules when amount allocation is authorized.

A numeric factor alone cannot generate durable obligations.

## Renewal primitives — `REUSE_PRIMITIVE_ONLY`

- `policy-operations/renewals/policy-renewal-engine.js`

The existing date filter may inform discovery, but it is not renewal truth and must not become the new ledger.

Renewal, anniversary, grace-period and policy-year transition dates require confirmed Policy terms or explicit carrier/product rule authority.

## Timeline/read-model patterns — `REUSE_PATTERN`

- `platform/policy-intelligence/cartera-010c-policy-detail-timeline.js`

Reuse:

- owner-scoped read projection;
- stable event references;
- chronological ordering;
- sanitized public projection;
- no restricted-party leakage;
- reload-safe deterministic output.

030B must not create a second generic Timeline authority.

---

# 4. 030B bounded construction scope

`CARTERA_030B_EXPECTED_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR` may construct only the foundation below.

## 4.1 Durable expected payment obligation ledger

Each obligation must preserve:

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

Minimum obligation kind:

- `PREMIUM_PAYMENT`.

Future kinds such as anniversary review or renewal review may share the calendar projection, but must not be forced into payment semantics.

## 4.2 Stable obligation identity

The same advisor, Policy version, obligation kind, expected date, sequence and recurrence rule must produce the same logical obligation identity.

Required behavior:

- identical generation replay is idempotent;
- changed Policy terms do not overwrite an accepted obligation silently;
- changed terms produce correction, supersession or explicit conflict;
- historical obligations remain auditable;
- duplicate active obligations for the same logical occurrence are forbidden;
- direct caller-supplied truth identifiers are not trusted without recomputation.

## 4.3 Required obligation states

The ledger must support at least:

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

State meaning:

- `SCHEDULED`: future obligation generated from confirmed Policy terms;
- `UPCOMING`: falls inside a defined operational horizon;
- `DETECTED`: candidate payment evidence or PaymentEvent match exists;
- `CONFIRMATION_REQUIRED`: evidence exists but is not yet sufficient or confirmed;
- `CONFIRMED`: confirmed PaymentEvent fully satisfies the obligation;
- `PARTIAL`: confirmed PaymentEvent satisfies only part of the expected amount when amount is known;
- `OVERDUE`: expected date passed without sufficient confirmed satisfaction, subject to explicit rule semantics;
- `NOT_FOUND`: expected supporting evidence was explicitly searched for and not found;
- `CORRECTED`: superseded by a governed correction;
- `CANCELLED`: obligation was explicitly cancelled by authorized Policy/rule change.

No state may infer lapse, cancellation of coverage, payment rejection or carrier action without separate confirmed evidence.

## 4.4 Deterministic recurrence boundary

Schedule generation must be deterministic from explicit inputs.

Required inputs:

- exact Policy version or immutable term digest;
- effective/anchor date when known;
- payment frequency when known;
- premium amount when known;
- currency when known;
- coverage end or generation horizon;
- explicit timezone/local-date policy;
- optional approved carrier/product schedule rule.

Required fail-closed behavior:

- unknown frequency creates no guessed recurrence;
- unknown anchor date creates no guessed due date;
- unknown premium creates obligations with `expectedAmount=null`, never zero;
- unknown currency remains null;
- single premium creates at most one expected payment obligation;
- month-end anchors use one documented deterministic rule;
- leap-day anchors use one documented deterministic rule;
- annual transitions preserve policy-year lineage;
- floating timestamps are not used as obligation identity.

## 4.5 Calendar projection

Calendar is a read model over durable obligations and explicit Policy dates, not a second truth store.

Minimum projection kinds:

- expected premium payment;
- Policy anniversary when supported by confirmed terms;
- renewal or end-of-term review when supported;
- policy-year transition;
- evidence-confirmation follow-up window;
- recommended review window, clearly labeled as recommendation rather than contractual due date.

Every projection item must include:

- stable source reference;
- source type;
- date and date confidence;
- status;
- Policy reference;
- owner scope;
- whether the date is contractual, derived or recommended;
- sanitized explanation;
- no beneficiary details;
- no raw receipt or bank data.

## 4.6 Operational horizons

The productive read model must answer:

```text
TODAY
NEXT_7_DAYS
NEXT_30_DAYS
NEXT_90_DAYS
OVERDUE
CONFIRMATION_REQUIRED
```

Horizon membership must be deterministic for the advisor timezone and must not mutate ledger state merely because a list was opened.

## 4.7 Payment matching and satisfaction

Only a confirmed PaymentEvent may fully or partially satisfy an obligation.

Matching must consider explicit evidence such as:

- Policy reference;
- coverage period;
- payment date;
- amount and currency when known;
- receipt/evidence references;
- carrier reference when available.

Required outcomes:

- `MATCHED`;
- `PARTIAL_MATCH`;
- `AMBIGUOUS`;
- `NO_MATCH`;
- `CONFLICT`.

Ambiguous evidence must remain unresolved. One payment must not silently satisfy multiple obligations unless an explicit allocation command authorizes and records the allocation.

## 4.8 Correction and replay

030B must preserve append-only history or equivalent immutable transition evidence for:

- obligation creation;
- status transition;
- PaymentEvent match;
- partial allocation;
- correction;
- cancellation;
- conflict;
- retry or replay result.

Corrections require:

- actor;
- reason;
- previous obligation reference;
- new obligation reference when applicable;
- changed-input digest;
- timestamp;
- idempotency key;
- optimistic state version.

## 4.9 Grace periods and carrier rules

No grace period may be invented from generic insurance assumptions.

A grace-period projection is authorized only when supported by:

- confirmed Policy terms;
- a versioned official carrier/product rule;
- jurisdiction and effective-date applicability;
- explicit rule provenance;
- tests for boundary dates.

Without that authority:

```text
GRACE_PERIOD=UNKNOWN
```

The system may recommend review, but may not assert contractual coverage status.

---

# 5. Privacy, security and RLS lock

Required:

- every obligation, transition, conflict and read projection is advisor/tenant scoped;
- direct cross-advisor reads fail closed;
- direct authenticated table writes are forbidden unless a later phase explicitly authorizes a bounded command surface;
- beneficiary and restricted PolicyRole details are absent from general calendar projection;
- bank account, card, CLABE, payment token and full receipt content are never projected;
- evidence references remain opaque and scope checked;
- logs contain references and sanitized error codes, not raw financial evidence;
- optimistic concurrency prevents stale obligation transitions;
- product UI receives only minimized read models;
- Account creation or mutation remains unauthorized.

```text
BENEFICIARY_PRIVACY_BOUNDARY=LOCKED
PAYMENT_INSTRUMENT_DATA_PROJECTION=FORBIDDEN
CROSS_ADVISOR_ACCESS=FORBIDDEN
ACCOUNT_MUTATION=NOT_AUTHORIZED
```

---

# 6. 030B allowed mutation paths

The 030B implementation task must declare a tighter list derived from these roots:

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
- canonical Person, Account or Policy direct mutation;
- unrelated migrations;
- `main`;
- production deployment configuration.

---

# 7. Schema and remote mutation decision

030A authorizes no schema or remote mutation.

030B may propose repository migrations for an owner-scoped expected obligation ledger, transition history, conflict records and bounded read/command RPCs only when:

- the existing canonical Policy and Event authorities are reused;
- expected obligation is kept distinct from PaymentEvent;
- RLS and direct-write revocation are explicit;
- idempotency and optimistic concurrency are tested;
- correction history is preserved;
- migration files remain repository-only in the construction cut;
- remote deployment receives separate explicit acceptance authorization.

```text
CARTERA_030A_SCHEMA_MUTATION=NO
CARTERA_030A_SUPABASE_REMOTE_MUTATION=NO
CARTERA_030B_REPOSITORY_SCHEMA_PROPOSAL=CONDITIONALLY_AUTHORIZED
CARTERA_030B_SUPABASE_REMOTE_MUTATION=NO
```

---

# 8. Required 030B tests

030B must preserve existing Policy, payment-evidence, PaymentEvent and Timeline tests and add targeted tests proving:

1. identical Policy terms generate identical obligation references;
2. monthly, quarterly, semiannual and annual recurrence is deterministic;
3. single-premium Policy creates no recurring obligations;
4. unknown frequency creates no guessed schedule;
5. unknown premium remains null and never becomes zero;
6. unknown currency remains null;
7. month-end recurrence follows the locked rule;
8. leap-year recurrence follows the locked rule;
9. policy-year sequence is deterministic;
10. identical generation replay is idempotent;
11. changed Policy version creates correction/supersession rather than overwrite;
12. stale state version is rejected;
13. extracted payment evidence does not confirm an obligation;
14. confirmed PaymentEvent can fully satisfy one exact obligation;
15. partial confirmed amount produces `PARTIAL` when expected amount is known;
16. ambiguous payment matching remains unresolved;
17. duplicate confirmed evidence is idempotent;
18. changed evidence produces conflict rather than silent rematch;
19. overdue projection does not infer Policy lapse or carrier cancellation;
20. grace period remains unknown without versioned rule authority;
21. Today/7/30/90 horizons are deterministic in the advisor timezone;
22. reload preserves ledger and projection state;
23. cross-advisor reads fail closed;
24. direct writes are blocked;
25. beneficiary and payment-instrument data never enter general projection;
26. no obligation or calendar item creates compensation or payout truth;
27. no external Calendar event, task, message or opportunity is created;
28. repository construction performs no remote Supabase mutation.

---

# 9. Global negative gates

030B must not:

- treat an expected obligation as proof of payment;
- create a PaymentEvent from schedule passage alone;
- confirm payment from extracted evidence without confirmation;
- infer Policy lapse, cancellation, reinstatement or renewal;
- invent premium amount, currency, frequency, due date or grace period;
- silently overwrite historical obligations;
- allocate one payment across obligations without explicit recorded authority;
- expose beneficiary details or payment-instrument secrets;
- create compensation, commission, payout, revenue or bank truth;
- create Google Calendar events or mutate an external calendar;
- create tasks, messages, opportunities, Pipeline changes or recommendations outside the bounded calendar read model;
- mutate Person, Account, Policy or PolicyRole directly;
- redesign product UI;
- execute remote Supabase mutation;
- merge to `main` as part of repository construction.

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