# FORGE CARTERA — POLICY DETAIL, TIMELINE, RENEWALS AND DUE ACTION RECONCILIATION 005

Forge OS  
Architecture Source Truth  
Cartera / Existing Asset Audit / Track A / Pass 5

## Status

`PASS_5_POLICY_DETAIL_TIMELINE_RENEWALS_TASKS_AUDIT_COMPLETE / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Purpose

This pass reconciles Policy Detail, Policy Timeline, renewal, risk, alert, review and task foundations against the authorities locked in Passes 1–4.

It answers:

1. Which Policy Detail assets can become Cartera projections?
2. Which timeline assets may be reused without creating a second history authority?
3. Which renewal logic is already governed and tested?
4. Which risk and alert outputs belong to Conservation Intelligence?
5. Which task foundations must be replaced by the existing Due Action runtime?
6. What must be built before these assets can enter productive Cartera?

This pass is repository discovery and architecture classification only. It does not authorize runtime, schema, migration, RLS, route, UI, provider or production mutation.

---

# 1. Executive decision

The 77 Policy Operations files are physically organized but remain isolated foundations. Their migration report proves that they had no imports and zero detected root JavaScript consumers when moved. Physical organization is not productive-runtime proof.

The canonical operating chain is:

```text
Policy Truth
→ Policy Read Model
→ Policy Detail and Policy Timeline projections
→ scheduled renewal/payment facts
→ Conservation interpretation
→ Cartera Signal
→ NBA Reason Why candidate
→ human confirmation
→ Due Action
→ Mi Día / Candy Crush projection
→ optional approved external action
```

## Locked ownership

```text
POLICY_FACTS_OWNER=POLICY_INTELLIGENCE
PAYMENT_FACTS_OWNER=CONFIRMED_PAYMENT_EVENT_AUTHORITY
RENEWAL_TERM_CLASSIFICATION=INITIAL_RENEWAL_CLASSIFIER_PLUS_RULE_PACK_WHEN_REQUIRED
CONSERVATION_RISK_OWNER=CONSERVATION_INTELLIGENCE
FINAL_ACTION_PRIORITY=NBA_REASON_WHY_AUTHORITY
INTERNAL_COMMITMENT_RUNTIME=DUE_ACTION
EXTERNAL_CALENDAR_EFFECT=SEPARATE_APPROVAL_AND_ADAPTER
```

Cartera displays, explains and routes these outputs. It does not become the owner of Policy Truth, Conservation scores, priority or task persistence.

---

# 2. Policy Detail reconciliation

## 2.1 Canonical target

The tested Policy Read Model envelope remains the target boundary for Policy Detail. It already preserves:

- read-only mode;
- safety flags;
- blocked effects;
- source-evidence references;
- freshness;
- explicit non-claim of canonical Policy Truth.

Its fixture source must be replaced only after canonical Policy and PolicyRole persistence exists.

## 2.2 Reusable presentation foundations

Disposition: `REUSE_UI_PATTERN_ONLY` or `REUSE_WITH_ADAPTER`

- `policy-detail-view-model.js`
- `policy-workspace-engine.js`
- `policy-operational-center-engine.js`
- `policy-summary-engine.js`
- `policy-client-summary-engine.js`
- `policy-financial-summary-engine.js`
- `policy-context-engine.js`
- `policy-live-state-engine.js`
- `policy-search-engine.js`
- `policy-filter-engine.js`
- `policy-smart-sort-engine.js`
- `policy-indexing-engine.js`
- `policy-side-by-side-engine.js`

Useful concepts:

- section composition;
- header and summary projection;
- search/filter/sort behavior;
- recent-activity display;
- pending-action display;
- quick-action placement;
- side-by-side review patterns.

Required corrections:

- consume canonical read models rather than free-form policy objects;
- use CommercialPerson, CommercialAccount and PolicyRole instead of one client;
- preserve unknown rather than defaulting to zero, MXN, active, stable or manual;
- separate confirmed facts, stale facts, conflicts, forecasts and recommendations;
- avoid calculating commission or conservation inside the Policy Detail projection;
- avoid mutating input arrays during search, sort or timeline projection;
- preserve evidence and as-of time per displayed fact.

## 2.3 Foundations requiring refactor

Disposition: `REFACTOR_FOUNDATION`

- `policy-detail-engine.js`
- `policy-core-engine.js`
- `policy-status-engine.js`
- `policy-metadata-engine.js`
- `policy-validation-engine.js`
- `policy-detail-alert-engine.js`

Reasons:

- Policy Detail currently models one `clientId` or one client object.
- Missing financial values are converted to zero.
- Missing currency becomes MXN.
- Missing source becomes manual.
- Missing status may become ACTIVE.
- `ready` may become true from a local ID without sufficient Policy Truth.
- validation checks free-text client/product/premium, not identity, PolicyRole, evidence, periods or conflicts.
- alert messages do not preserve evidence, confidence, freshness or predictive-versus-confirmed state.

## 2.4 Assets that must not become authority

Disposition: `DO_NOT_PROMOTE`

- `policy-storage-engine.js`: module-memory array, no ownership, RLS, evidence, idempotency or durability.
- `policy-auto-save-engine.js`: arbitrary localStorage persistence with no scope or sensitive-data boundary.

Disposition: `DO_NOT_ACTIVATE`

- `policy-auto-approval-engine.js`: average confidence greater than or equal to 95 is not human confirmation and fails on empty input.
- `policy-ai-insights-engine.js`: deterministic labels are presented as AI and may state cancellation risk without governed Conservation evidence.

---

# 3. Policy Timeline reconciliation

## 3.1 Current legacy behavior

The existing Policy Timeline foundations:

- generate local UUIDs;
- use `Date.now()` as event time;
- accept arbitrary event types and details;
- hold events in arrays;
- prepend events without evidence or idempotency;
- permit event deletion;
- mix notes, calls, WhatsApp, tasks, appointments, renewal, payment, policy changes and commission in one type list;
- do not distinguish fact, interpretation, recommendation or external handoff;
- do not preserve correction lineage;
- are not connected to FES or canonical Policy persistence.

`policy-timeline-view-model.js` also calls `agruparTimelinePorDia` without importing or receiving it, so the isolated file is not independently executable as written.

## 3.2 Canonical decision

```text
NO_SECOND_POLICY_TIMELINE_LEDGER=YES
POLICY_TIMELINE_SOURCE=FES_COMPATIBLE_POLICY_EVENTS
PERSON_TIMELINE=PROJECTION_OF_POLICY_COMMERCIAL_MEANING
```

A Policy event must preserve:

- Policy subject reference;
- CommercialPerson and CommercialAccount projection references when applicable;
- event type and owner;
- occurred-at, effective-at and recorded-at clocks;
- confirmation state;
- evidence references;
- source system;
- idempotency key;
- correction lineage;
- privacy classification;
- actor and tenant ownership.

Policy facts must never be written as arbitrary Prospect Timeline payloads. Person Timeline may project the commercial meaning of governed Policy events without becoming Policy Truth authority.

## 3.3 Reusable timeline pieces

Disposition: `REUSE_UI_PATTERN_ONLY`

- `policy-timeline-group-engine.js`
- `policy-timeline-query-engine.js`
- `policy-timeline-view-model.js`
- `policy-activity-engine.js`

Allowed reuse:

- filtering projected events by type;
- grouping immutable projections by occurred date;
- limiting recent events;
- composing a read-only timeline view.

Required corrections:

- do not sort caller arrays in place;
- group by governed occurred/effective time rather than local creation time;
- import dependencies explicitly;
- preserve event class and evidence status;
- never merge tasks, notes and facts into an undifferentiated list.

Disposition: `DO_NOT_PROMOTE`

- `policy-timeline-engine.js`
- `policy-timeline-event.factory.js`
- `policy-timeline.repository.js`
- `policy-timeline.types.js`

The mutable repository and delete operation directly conflict with append-only Event & Evidence governance.

---

# 4. Renewal reconciliation

## 4.1 Renewal is not one calculation

Forge must separate:

1. documented Policy dates and status;
2. expected payment obligations;
3. payment-period classification as initial or renewal;
4. future renewal window projection;
5. local predictive conservation interpretation;
6. official carrier or institutional confirmation;
7. advisor action recommendation.

## 4.2 Canonical tested asset

Disposition: `REUSE_CANONICAL`

`policy-operations/initial-renewal-classifier.js`

The classifier is suite-registered and preserves:

- initial;
- renewal;
- unknown;
- blocked by missing Policy dates;
- blocked by missing payment period;
- carrier-specific resolution required.

It correctly refuses to count blocked or unknown records as initial or renewal and exposes a Rule Pack path for carrier-specific exceptions.

This classifier answers payment-term classification. It does not determine whether a Policy is currently renewed, active or conserved.

## 4.3 Legacy renewal foundations

### `policy-renewal-engine.js`

Disposition: `REUSE_PRIMITIVE_ONLY`

Useful primitive: find valid future dates inside a configurable window.

Required corrections:

- inject evaluation time and timezone;
- validate invalid dates;
- consume canonical renewal projections;
- distinguish anniversary, renewal notice, expected renewal and confirmed renewal;
- preserve unknown and stale evidence.

### `policy-renewal-status-engine.js`

Disposition: `REFACTOR_FOUNDATION`

Current issue: every negative day count also satisfies `days <= 15`, so a long-expired date becomes `CRITICAL`. Required states include at least:

- unknown;
- future stable;
- review window;
- approaching;
- due today;
- overdue/unconfirmed;
- renewed confirmed;
- cancelled/lapsed confirmed;
- stale evidence;
- carrier-specific review required.

### `renewal-intelligence-engine.js`

Disposition: `REFACTOR_FOUNDATION`

The current score adds fixed weights for 30-day proximity, 20-day contact inactivity and pending-payment count. These weights are not validated. The engine mixes Policy timing, relationship cadence and conservation risk.

Future use:

- preserve raw input features;
- let Policy Intelligence own dates;
- let Relationship Intelligence own cadence context;
- let Conservation Intelligence own risk interpretation;
- let NBA consume the explained signal;
- never present the score as official conservation or renewal truth.

---

# 5. Risk and alert reconciliation

## 5.1 Conservation authority

Conservation Intelligence owns:

- Policy Quality;
- Conservation Risk;
- local predictive conservation;
- conservation snapshots;
- policy/advisor/portfolio durability interpretation.

It does not own Policy fact creation or payment fact creation.

## 5.2 `policy-risk-engine.js`

Disposition: `REFACTOR_FOUNDATION`

Current behavior assigns fixed points for:

- more than 30 days without contact;
- each pending payment;
- renewal proximity.

The result is not a validated risk model. It may be reused only as an inventory of candidate features.

Required output contract:

```text
signal type
policy/person/account references
local predictive or official
supporting facts
source owners
evidence references
freshness
confidence and limitations
missing inputs
reason why
allowed uses
blocked uses
```

## 5.3 `policy-detail-alert-engine.js`

Disposition: `REUSE_WITH_ADAPTER`

Allowed use: project governed alerts inside Policy Detail.

Every alert must state:

- what happened;
- why it matters;
- whether it is a confirmed fact, scheduled event, detected evidence or local prediction;
- evidence status;
- confidence;
- freshness;
- smallest useful action;
- required human confirmation.

A cancelled status must come from Policy Truth. A payment alert must come from the Payment Obligation Ledger or confirmed payment evidence. Missing commission documents belong to the evidence/Compensation boundary, not Policy status.

---

# 6. Review reconciliation

`policy-review-priority-engine.js` and `policy-review-ui-engine.js` are import-review foundations, not annual Policy Review intelligence.

Disposition: `REUSE_WITH_ADAPTER` under Evidence Inbox.

Allowed reuse:

- low-confidence field listing;
- editable field preview;
- confidence display.

Required corrections:

- use Policy Evidence Packet field states;
- include source location and extraction method;
- include identity and PolicyRole candidates;
- include conflicts and missing required evidence;
- avoid a universal numeric threshold as the only review rule;
- route sensitive beneficiary and health-related data through narrower scope.

A future Policy Review Brief must be a separate projection combining:

- Policy Truth and freshness;
- renewal/payment obligations;
- service commitments;
- relationship context;
- confirmed changes;
- candidate questions;
- sensitive-topic boundaries.

---

# 7. Task and Due Action reconciliation

## 7.1 Existing productive authority

Forge already has a governed Due Action stack:

```text
due-action-offline-contract
→ IndexedDB store
→ durable mutation/outbox
→ sync journal
→ Supabase RPC gateway
→ conflict preservation
→ Pipeline writer/runtime
→ Mi Día projection
```

Its implemented properties include:

- local-first writes;
- atomic record and outbox commit;
- deterministic mutation IDs;
- advisor-bound ownership;
- schedule, reschedule, complete, cancel, acknowledge and snooze operations;
- durable offline retry;
- secondary remote synchronization;
- no direct remote table write;
- no silent conflict resolution;
- no message generation or send;
- restricted input fields;
- RLS-backed prospect ownership.

Disposition: `REUSE_CANONICAL` for the Due Action operating model and persistence/sync patterns.

## 7.2 Current limitation

The productive Due Action runtime is prospect-specific:

- record identity is advisor plus `prospectReference`;
- the database table is `prospect_due_actions`;
- rows require a Prospect FK;
- one active action is modeled per Prospect;
- current commands cannot accept Policy or CommercialPerson context.

Cartera must not create a fake Prospect for every imported Policy merely to schedule work.

## 7.3 Required generalization

The core Due Action authority must evolve to a governed subject model while preserving the existing Pipeline adapter:

```text
subjectType
subjectReference
approvedDisplayName
nextActionType
nextActionAt
optional contextReference
originRecommendationReference
version / acknowledgement / snooze / tombstone / sync state
```

Minimum subject candidates:

- `PROSPECT`
- `COMMERCIAL_PERSON`
- `COMMERCIAL_ACCOUNT`
- `POLICY`

The exact subject taxonomy requires implementation scope and migration compatibility review.

Backward compatibility:

```text
Pipeline writer
→ maps prospectReference to subjectType=PROSPECT

Cartera writer
→ maps confirmed person/account/policy context to governed subject references
```

A due action stores the confirmed internal commitment. Full reasoning and evidence remain in the originating signal/recommendation/event records and are linked through opaque references rather than copied into the local action record.

## 7.4 Legacy task foundations

Disposition: `DO_NOT_PROMOTE`

- `policy-task-engine.js`
- `task-engine.js`
- `realtime-task-engine.js`
- local task arrays and arbitrary object merges.

Disposition: `REUSE_UI_PATTERN_ONLY`

- `task-feed-engine.js`
- `overdue-task-engine.js`
- `task-quick-action-engine.js`

They may help shape read-only projections after consuming Due Actions, but must not become persistence or authority.

Disposition: `REFACTOR_FOUNDATION`

- `policy-task-priority-engine.js`
- `task-priority-engine.js`
- `policy-followup-engine.js`

These may contribute candidate features only. NBA Reason Why owns the final explained priority. Contact cadence must be relationship-specific; 15 or 30 days without contact is not universal task truth.

Disposition: `DO_NOT_ACTIVATE`

- `auto-task-generator-engine.js`
- `ai-task-suggestion-engine.js`

Reasons:

- automatic task creation bypasses human choice;
- generic inactivity rules create artificial activity;
- the AI suggestion engine automatically proposes cross-sell based only on line of business;
- neither preserves evidence, consent, Policy Truth, uncertainty or action authority.

## 7.5 Quick actions and Calendar

`policy-quick-actions-engine.js` and `task-quick-action-engine.js` are UI catalogs only.

Required checks before enabling any action:

- resolved person/account;
- contact method and consent;
- advisor ownership;
- current scope;
- action capability;
- effect boundary;
- approval state.

`google-calendar-engine.js` may be reused only as a payload/link-construction primitive. Building a link or payload does not create an event. External calendar creation remains behind an explicit Calendar Intent, human approval and provider adapter.

---

# 8. Existing tests and evidence

## Inspected and reusable

- Policy Read Model safety-boundary test;
- Initial Renewal Classifier test;
- Payment Evidence Packet tests;
- Payment Event Engine test;
- NFAST-09 Due Action offline, writer, runtime, sync, RLS and Pipeline binding tests/closures;
- FES Event & Evidence tests;
- Evidence Inbox and confirmation tests.

## Test gap

The repository suite does not register direct tests for the isolated Policy Detail, legacy Policy Timeline, renewal score, risk score, alert or legacy task engines inspected in this pass.

This pass inspected source and documented evidence. It did not rerun the full suite.

---

# 9. Canonical target flows

## 9.1 Policy Detail

```text
canonical Policy + PolicyRole persistence
→ productive Policy Read Model adapter
→ sourced sections and alert projections
→ Cartera Policy Detail
```

## 9.2 Policy Timeline

```text
confirmed Policy command or external evidence
→ FES-compatible Policy event
→ append-only Policy projection
→ person/account Timeline projection
→ Policy Detail timeline UI
```

## 9.3 Renewal and conservation

```text
Policy dates + Payment Obligation Ledger + confirmed payment events
→ initial/renewal classification
→ scheduled renewal projection
→ local predictive Conservation interpretation
→ governed Cartera Signal
→ NBA Reason Why
```

## 9.4 Action activation

```text
NBA candidate
→ advisor reviews why person / why now / evidence / uncertainty
→ advisor confirms internal action
→ generic Due Action writer
→ Mi Día / Candy Crush
→ optional separately approved Calendar or Communication intent
```

---

# 10. Confirmed construction gaps from Pass 5

1. productive Policy Read Model source adapter;
2. evidence-aware Policy Detail section contracts;
3. Policy status/freshness/conflict projection;
4. FES-compatible Policy event contract and persistence;
5. immutable Policy Timeline projection;
6. person/account Timeline projection from Policy events;
7. Renewal Schedule projection with injected clock and timezone;
8. Payment Obligation Ledger;
9. local predictive Conservation signal contract/runtime;
10. evidence-aware Policy alert contract;
11. Policy Review Brief projection;
12. Cartera Signal envelope;
13. generic Due Action subject contract and migration path;
14. backward-compatible Pipeline Due Action adapter;
15. Cartera Due Action writer/adapter;
16. Mi Día and Candy Crush projections for Cartera actions;
17. Calendar Intent and provider approval bridge;
18. vertical tests from Policy signal to confirmed Due Action;
19. tests proving no automatic task, calendar event, message or cross-sell activation;
20. tests proving unknown/stale/conflicted Policy data cannot create a strong action.

---

# 11. Pass 5 result

## Reuse canonically

- Policy Read Model safety envelope;
- ADR-006 Policy Truth Boundary;
- Initial Renewal Classifier;
- Payment Evidence and Payment Event foundations;
- Conservation Intelligence ownership architecture;
- NBA Reason Why non-executing recommendation boundary;
- NFAST-09 Due Action local-first, sync, conflict and RLS operating model;
- FES append-only Event & Evidence patterns.

## Reuse with adapters

- Policy Detail composition and UI helpers;
- search, filter, sort and recent-event helpers;
- date-window renewal primitive;
- alert presentation;
- import review field UI;
- timeline grouping/query/view helpers;
- Google Calendar payload/link construction.

## Do not activate or promote

- module-memory Policy storage;
- arbitrary localStorage auto-save as Policy persistence;
- auto approval by average confidence;
- mutable/deletable Policy Timeline arrays;
- fixed unvalidated renewal and risk scores as truth;
- automatic task generation;
- automatic cross-sell suggestions;
- direct calendar or communication effects;
- task records tied to free-text `clientId`;
- fake Prospect creation solely to obtain a Due Action.

## Final decision

`PASS_5_POLICY_DETAIL_TIMELINE_RENEWALS_TASKS_RECONCILED`

`POLICY_DETAIL_SOURCE=CANONICAL_POLICY_READ_MODEL`

`POLICY_TIMELINE_SOURCE=FES_COMPATIBLE_POLICY_EVENTS`

`RENEWAL_CLASSIFICATION=TESTED_INITIAL_RENEWAL_CLASSIFIER`

`CONSERVATION_RISK_OWNER=CONSERVATION_INTELLIGENCE`

`FINAL_PRIORITY_OWNER=NBA_REASON_WHY`

`INTERNAL_ACTION_RUNTIME=DUE_ACTION_GENERALIZATION`

`AUTOMATIC_TASK_CREATION=BLOCKED`

`NEXT_AUDIT=FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK`

Pass 6 must now combine Passes 1–5 into one implementation queue ordered by dependency, reuse value and risk. No implementation phase may begin outside that queue.