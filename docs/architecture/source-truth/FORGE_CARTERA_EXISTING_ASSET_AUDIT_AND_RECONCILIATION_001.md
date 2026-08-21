# FORGE CARTERA — EXISTING ASSET AUDIT AND RECONCILIATION 001

Forge OS  
Architecture Source Truth  
Cartera / Relationship Intelligence

## Status

`DISCOVERY_ACTIVE / LEGACY_RUNTIME_PASS_COMPLETE / POLICY_INTAKE_AUDIT_NEXT / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Program relationship

Canonical roadmap:

- `docs/architecture/source-truth/FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE_ROADMAP_001.md`

Detailed audit artifacts:

- `docs/architecture/source-truth/FORGE_CARTERA_POLICY_OPERATIONS_RUNTIME_TEST_MATRIX_001.md`
- `docs/architecture/source-truth/FORGE_CARTERA_LEGACY_RUNTIME_RECONCILIATION_002.md`

This document governs the work requested by the Cartera program:

1. Audit and classify existing assets.
2. Reconcile reusable assets under canonical authorities.
3. Build only the missing identity, persistence and orchestration boundaries.

This document is read-only discovery and classification. It does not authorize runtime, schema, UI, route, database or production mutation.

---

# 1. Constitutional and architectural gate

## Applicable principles

- Forge is not a generic CRM.
- Forge is a Decision Intelligence System and Sales Operating System.
- Capture once.
- One metric or fact has one conceptual owner.
- Orchestrators consume engines; they do not duplicate their logic.
- Forge Core must operate without an AI provider.
- Forge decides; generative AI explains.
- Forge is a copilot, never an autopilot.
- Cartera must help the advisor sell 30% more without working 30% more.

## Scope boundary

Authorized in this discovery:

- repository inventory;
- direct code inspection;
- capability classification;
- ownership reconciliation;
- dependency and integration-gap mapping;
- identification of assets that must not be duplicated;
- creation of a bounded implementation queue.

Not authorized in this discovery:

- runtime wiring;
- schema or RLS changes;
- route changes;
- UI changes;
- moving or deleting existing files;
- replacing canonical engines;
- automatic identity merge;
- automatic opportunity creation;
- automatic task, message, calendar, payment or commission confirmation.

---

# 2. Classification model

Every discovered asset is assigned one primary disposition.

## `REUSE_CANONICAL`

The asset or authority should be consumed as the canonical source or boundary. Cartera must not duplicate it.

## `REUSE_WITH_ADAPTER`

The capability is useful, but Cartera requires a governed adapter, projection or translation layer before consuming it.

## `REFACTOR_FOUNDATION`

The asset contains useful deterministic logic or workflow structure, but its current rules, evidence model, naming, state handling or authority assumptions are not production-safe.

## `REBUILD_CANONICAL_GAP`

The existing implementation is too weak to satisfy the canonical contract. A new bounded implementation is required, while preserving any useful entrypoint or test fixture.

## `ARCHITECTURE_ONLY`

The repository contains a decision, discovery or contract but no verified productive runtime.

## `LEGACY_SURFACE_MIGRATE`

A functional or partially functional legacy surface exists and should be reconciled or migrated rather than rebuilt blindly.

## `REUSE_UI_PATTERN_ONLY`

The asset contains useful UI or local-state behavior but must not own or persist canonical business truth.

## `DO_NOT_ACTIVATE`

The asset must not be wired in its current form because it could bypass evidence, ownership, consent or human confirmation boundaries.

## `DO_NOT_PROMOTE`

The asset may remain as compatibility or migration infrastructure, but it must not become a canonical authority.

## Evidence levels

- `CODE_INSPECTED`: implementation directly reviewed.
- `CALL_GRAPH_PROVED`: productive or isolated consumer chain directly proved.
- `INVENTORY_CONFIRMED`: file and classification confirmed; behavior still requires direct audit.
- `ARCHITECTURE_CONFIRMED`: authoritative or candidate documentation reviewed.
- `PRODUCTIVE_STATUS_UNPROVEN`: existence does not prove runtime integration or production use.

---

# 3. Executive finding

Cartera is not a greenfield module.

The repository already contains:

- Relationship Intelligence foundations and orchestrators;
- a connected legacy Cartera route;
- a second isolated modular Cartera stack;
- a large Policy Operations asset cluster;
- policy document ingestion primitives;
- policy timeline, renewal, risk, alert and task foundations;
- Event & Evidence and person-timeline authorities;
- Pipeline and Prospect Detail projections;
- Policy Read Model contracts and adapter foundations;
- Compensation and Conservation architecture;
- Alfred / NBA, NASH and Advisor Experience boundaries.

However, the repository does not yet prove a single productive, canonical Cartera runtime connecting those assets.

The main missing capabilities are not more isolated engines. They are:

1. canonical identity resolution;
2. confirmed policy and party persistence;
3. payment-obligation persistence;
4. canonical relationship-graph runtime;
5. governed signal adapters;
6. cross-domain orchestration;
7. productive Cartera UI integration;
8. tests and evidence proving the full vertical flow.

---

# 4. Relationship Intelligence asset audit

## 4.1 `relationship-timeline-engine.js`

Disposition: `REUSE_WITH_ADAPTER`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- projects birthdays, anniversaries, policy renewals, policy reviews, payment dates, overdue payments, life events and referral moments;
- orders projected events;
- identifies the next projected event;
- derives a simple attention state.

Required reconciliation:

- must not replace the canonical append-only Event & Evidence timeline;
- should be renamed conceptually as a future-event projection;
- facts, scheduled events, inferences and recommendations must remain separate;
- automatic referral-opportunity projection must be removed or downgraded to a candidate relationship-strengthening signal.

Canonical role:

`Relationship Future Event Projection`, consumed by Cartera Future Radar.

## 4.2 `relationship-next-action-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- selects one high-value event;
- maps event type to a next action;
- chooses channel and timing;
- avoids unnecessary contact when recent contact already occurred.

Required reconciliation:

- replace automatic `ASK_FOR_REFERRALS` with governed relationship-strengthening candidates;
- attach evidence, uncertainty, source freshness and human-confirmation requirements;
- final priority must remain owned by Alfred / NBA;
- action execution must remain owned by Advisor Experience and the advisor.

Canonical role:

Candidate action generator, not final NBA authority.

## 4.3 `relationship-opportunity-engine.js`

Disposition: `DO_NOT_ACTIVATE` until refactored  
Evidence: `CODE_INSPECTED`

Current useful capability:

- identifies possible review, protection, health, retirement, education, cross-sell, life-event and referral signals;
- ranks candidate opportunities;
- creates a deterministic relationship score.

Blocking issues:

- absence of imported policy data is treated as a protection gap;
- age and family status can become direct commercial triggers;
- product detection relies on broad text patterns;
- policy issuance can become a referral opportunity;
- missing data, external coverage and deliberate client decisions are not preserved as unknown.

Required reconciliation:

- output `CANDIDATE_REVIEW_SIGNAL`, not commercial truth;
- require completeness, provenance and freshness checks;
- preserve `UNKNOWN`, `NOT_AVAILABLE`, `EXTERNAL_COVERAGE_POSSIBLE` and `CLIENT_DECLINED` states;
- opportunity creation in Pipeline requires advisor confirmation.

## 4.4 `life-event-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- detects marriage, new child, job change, home purchase, retirement proximity, business ownership, divorce and education milestones;
- builds candidate review areas and confidence.

Blocking issues:

- persistent profile state may be interpreted as a new event;
- dates, freshness and evidence classes are insufficient;
- sensitive context can become a commercial trigger.

Required reconciliation:

- separate profile facts from newly observed events;
- require date, source, freshness, sensitivity and confirmation state;
- preserve life context as context, never automatic sales instruction.

## 4.5 `referral-opportunity-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- combines interaction, service, policy count, relationship score and tenure signals;
- proposes timing and approach.

Required reconciliation:

- reframe output as relationship-strengthening or introduction-conversation candidate;
- no inferred consent;
- do not exploit claims or life events;
- advisor owns final decision and execution.

## 4.6 `relationship-health-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- combines payment, renewal, review, gap and inactivity signals;
- returns attention color, risks, strengths and recommendation.

Required reconciliation:

- split operational attention from actual relationship health;
- respect event freshness and completion state;
- attach evidence to every factor.

## 4.7 `client-engagement-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- calculates recency and interaction-based engagement;
- identifies last interaction and inactivity risk.

Required reconciliation:

- relationship-specific contact cadence;
- no history must not equal critical deterioration;
- no mandatory contact instruction without NBA and advisor approval.

## 4.8 `relationship-review-engine.js`

Disposition: `REUSE_WITH_ADAPTER`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- decides whether a review is useful;
- proposes urgency and topics.

Required reconciliation:

- produce a governed Review Brief;
- separate required topics, suggested topics, hypotheses and sensitive topics;
- preserve all supporting reasons, not only the first.

## 4.9 `relationship-master-engine.js`

Disposition: `REUSE_WITH_ADAPTER`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- orchestrates relationship timeline, actions, opportunities, events, referral, health, engagement and review.

Required reconciliation:

- remove ambiguous aggregate confidence;
- consume only reconciled engines;
- return facts, schedules, evidence, interpretations, recommendations and human decisions separately.

---

# 5. Legacy Cartera runtime audit — pass complete

Detailed decision:

- `docs/architecture/source-truth/FORGE_CARTERA_LEGACY_RUNTIME_RECONCILIATION_002.md`

## 5.1 Productive route

The productive call graph is proved:

```text
app.js
→ platform/routing/route-registry.js
→ cartera route
→ renderCartera / bindCarteraEvents
→ cartera.js
→ legacy/quarantine/crmaddlife-indexeddb
```

Disposition:

`LEGACY_CONNECTED / LEGACY_SURFACE_MIGRATE`

## 5.2 Parallel orphan stack

The following assets form a separate mini-stack and are not the route imported by `app.js`:

- `cartera-view.js`;
- `cartera-service.js`;
- `cartera-state.js`;
- `cartera-events.js`;
- `cartera-normalizer.js`;
- `cartera-validator.js`;
- `cartera-import-engine.js`;
- `cartera-repository.js`.

Disposition:

`FOUNDATION_ORPHANED / DISASSEMBLE_AND_REUSE_BY_CAPABILITY`

## 5.3 Locked decision

- Preserve the route ID and current user-visible behavior during migration.
- Do not promote quarantined IndexedDB as canonical truth.
- Reuse form, import, normalization, validation, state and repository patterns selectively.
- Replace direct browser storage, hard delete and browser event truth with governed adapters.
- Do not wire `cartera-view.js` beside `cartera.js`; their DOM contracts overlap.
- Retire duplicate surfaces only after vertical parity, tests and evidence.

---

# 6. Policy Operations cluster audit

Prior migration discovery identified a 77-asset Policy Operations cluster grouped into:

- policy detail;
- policy timeline;
- renewals;
- tasks;
- evidence;
- client records.

The selected migration batch was reported as `NO_IMPORTS` with zero detected root consumers.

That proves isolation for the selected batch at that discovery point, not productive readiness.

Each asset requires direct Track A inspection before reuse.

## Current inspected examples

### `policy-ingestion-orchestrator.js`

Disposition: `REUSE_WITH_ADAPTER`

Useful flow:

```text
OCR
→ parser
→ validator
→ normalizer
```

Missing:

- evidence envelope;
- identity resolution;
- Policy Party extraction;
- durable staging;
- conflict state;
- confirmation and canonical persistence.

### `policy-import-queue.js`

Disposition: `REFACTOR_FOUNDATION`

The queue is an in-memory array. It is not persistent, resumable, advisor-scoped or auditable.

### `policy-human-review-engine.js`

Disposition: `REUSE_WITH_ADAPTER`

The core rule is useful: validation errors or doubtful fields require review.

It must also include identity conflicts, sensitive fields, provenance gaps and explicit review reasons.

### `policy-duplicate-engine.js`

Disposition: `REBUILD_CANONICAL_GAP`

Current duplicate key:

```text
client + product + premium
```

This cannot satisfy canonical policy or identity resolution.

### `renewal-intelligence-engine.js`

Disposition: `REFACTOR_FOUNDATION`

Current score weights are deterministic foundations, not validated conservation rules.

### `policy-risk-engine.js`

Disposition: `REFACTOR_FOUNDATION`

Must be reconciled under Conservation Intelligence to avoid duplicate risk authority.

### `policy-detail-alert-engine.js`

Disposition: `REUSE_WITH_ADAPTER`

Alert types are useful, but every alert requires canonical source and evidence state.

---

# 7. Policy Read Model audit

## Adapter

- `platform/adapters/policy-read-model/policy-read-model-adapter-068b.js`

Disposition:

`REUSE_WITH_ADAPTER`

Strengths:

- explicit read-only mode;
- blocked effects;
- safety flags;
- freshness metadata;
- audit envelope;
- no unsupported Policy Truth claim.

Blocking fact:

The current source is local static fixtures.

Decision:

Preserve the envelope and safety model. Replace the fixture source with a canonical Policy source adapter only after authority and persistence are implemented.

---

# 8. Identity and duplicate audit

## `entity-resolver-engine.js`

Disposition: `REBUILD_CANONICAL_GAP`

Current behavior:

- lowercase query;
- first entity whose name contains the query.

This cannot support identity continuity.

## Required canonical engine

`Canonical Person Resolution Engine`

Minimum comparison evidence:

- normalized name;
- phone;
- email;
- birth date;
- tax identifier when permitted;
- appointments;
- quotes;
- applications;
- products;
- referral source;
- household and company links;
- document evidence.

Required outputs:

- `MATCH_HIGH_CONFIDENCE`;
- `MATCH_REVIEW_REQUIRED`;
- `NO_MATCH`;
- `CONFLICT`.

No automatic merge.

---

# 9. Payment and Compensation audit

## Reusable foundations

- payment-frequency normalization;
- commissionable-amount concept;
- commission projection concept;
- Compensation architecture;
- Rule Snapshot governance.

## Canonical gap

No productive Payment Obligation Ledger was proved.

Required objects:

- expected obligation;
- expected date and amount;
- frequency;
- policy year;
- period covered;
- evidence state;
- actual payment;
- confirmation state;
- correction history.

Cartera confirms and projects. Compensation owns financial interpretation.

---

# 10. Conservation audit

Disposition:

`ARCHITECTURE_ONLY + REFACTOR_FOUNDATIONS`

The architecture correctly separates:

- production facts;
- conservation interpretation;
- compensation interpretation;
- forecast suggestion;
- business-planning action.

A productive local predictive Conservation runtime was not proved.

Reusable inputs:

- payment risk;
- cancellation or reinstatement signals;
- renewal proximity;
- service gaps;
- contact gaps;
- policy status;
- official snapshots when available.

No LIMRA, IGC, persistence or conservation formula may be invented.

---

# 11. Relationship Graph audit

Disposition:

`ARCHITECTURE_ONLY / RUNTIME GAP`

The ADR establishes the relationship graph as a primary commercial asset and assigns graph ownership outside Product Intelligence and NASH.

No productive graph persistence and read model were proved.

Required graph capabilities:

- canonical people;
- person-to-person edges;
- person-to-organization edges;
- household and family roles;
- referral and introduction links;
- evidence and consent state;
- relationship history;
- freshness;
- reversible corrections.

---

# 12. Alfred, NASH and Candy Crush reconciliation

## Alfred / NBA

Existing ranking, quick-action and suggestion foundations may be reused.

Cartera must provide governed signals, not final priority truth.

## NASH

NASH may consume an approved relationship and policy brief to prepare the conversation.

NASH does not own identity, graph, policy facts, opportunity lifecycle or permission.

## Candy Crush / Advisor Experience

Existing mission and quick-action patterns may be reused.

Cartera provides reviewed candidate actions. Advisor Experience presents them. The advisor confirms execution.

---

# 13. Canonical build-only gaps

The audit currently identifies these true construction gaps:

1. Canonical Person Resolution Engine.
2. Identity-resolution review UI.
3. Confirmed Policy persistence.
4. Policy Party model and persistence.
5. Persistent and resumable document-intake queue.
6. Policy Evidence Candidate schema and staging.
7. Payment Obligation Ledger.
8. Payment-confirmation workflow.
9. Local predictive Conservation runtime.
10. Relationship Graph runtime and read model.
11. Governed Cartera Signal Envelope.
12. Cartera-to-Pipeline opportunity-confirmation bridge.
13. Cartera-to-Alfred-to-Candy-Crush orchestration.
14. Email evidence adapter.
15. Compensation Rule Pack bridge.
16. Productive Cartera read-model adapter.
17. Productive Cartera UI migration and Future Radar.
18. Productivity proof metrics.

---

# 14. Reuse queue

## Reuse first

- Event & Evidence;
- person timeline and projections;
- Pipeline opportunity lifecycle;
- connected `cartera` route contract;
- legacy search/list/KPI/import UX behavior;
- Excel header normalization;
- Policy Read Model safety envelope;
- policy ingestion orchestrator pattern;
- human-review rule;
- relationship review and future-event foundations;
- Compensation and Conservation authority contracts;
- Alfred, NASH and Advisor Experience boundaries.

## Refactor before use

- relationship next action;
- relationship opportunity;
- life event;
- referral opportunity;
- relationship health;
- engagement;
- renewal risk;
- policy risk;
- import queue;
- legacy normalizer;
- duplicate engines;
- automatic task generation.

## Do not activate directly

- relationship opportunity as commercial truth;
- generative policy parsing without evidence guardrails;
- automatic task creation;
- automatic calendar writes;
- automatic identity merges;
- hard delete as policy lifecycle behavior;
- quarantined IndexedDB as canonical truth;
- isolated `cartera-view.js` beside the current route.

---

# 15. Track A execution sequence

## Pass 1 — Relationship and inventory classification

Status:

`COMPLETE`

## Pass 2 — Legacy Cartera runtime reconciliation

Status:

`COMPLETE`

Evidence:

- productive route call graph proved;
- duplicate implementation proved;
- storage and effect boundaries inspected;
- selective reuse and migration strategy locked.

## Pass 3 — Policy document intake foundations

Status:

`NEXT`

Directly inspect:

1. `policy-ocr-engine.js`;
2. `policy-ai-parser.js`;
3. `policy-document-classifier.js`;
4. `policy-schema-validator-engine.js`;
5. `policy-normalization-engine.js`;
6. `policy-staging-cache.js`;
7. `policy-batch-processing-engine.js`;
8. tests and consumers.

## Pass 4 — Policy detail, timeline, renewals and tasks

Status:

`PLANNED`

## Pass 5 — Schemas, persistence, RLS and events

Status:

`PLANNED`

## Pass 6 — Final reconciliation and build-only queue lock

Status:

`PLANNED`

---

# 16. Current implementation boundary

This audit does not authorize implementation.

The registered implementation target remains:

- `CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`

Track A may continue read-only inspection to close the asset matrix.

No later Cartera phase may be implemented solely because its assets are now documented.

---

# 17. Current conclusion

The correct Cartera strategy is now evidence-backed:

> Preserve the connected user behavior, disassemble and selectively reuse the orphan foundations, replace legacy authority, and build only the canonical identity, persistence and orchestration gaps.
