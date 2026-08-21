# FORGE CARTERA — FINAL RECONCILIATION AND BUILD-ONLY QUEUE LOCK 006

Forge OS  
Architecture Source Truth  
Cartera / Relationship Intelligence / Track A / Pass 6

## Status

`PASS_6_COMPLETE / TRACK_A_COMPLETE / CARTERA_000_COMPLETE / CARTERA_001A_NEXT / RUNTIME_MUTATION_NOT_AUTHORIZED_BY_THIS_DOCUMENT`

## Date

2026-07-30

## Purpose

This document closes the read-only Cartera Existing Asset Audit and converts the findings from Passes 1–5 into one dependency-ordered build-only queue.

It exists to prevent three failure modes:

1. rebuilding engines that already exist;
2. activating isolated foundations as if they were productive authorities;
3. allowing Codex or any implementation agent to skip identity, evidence, persistence or human-confirmation dependencies.

This document authorizes planning visibility and locks execution order. It does not itself authorize runtime, schema, migration, RLS, route, UI, provider or production mutation.

---

# 1. Track A closure

## Completed passes

- Pass 1 — Relationship Intelligence and existing-asset classification: `COMPLETE`.
- Pass 2 — Legacy Cartera runtime reconciliation: `COMPLETE`.
- Pass 3 — Policy document intake reconciliation: `COMPLETE`.
- Pass 4 — Policy persistence, identity and Policy Party authority: `COMPLETE`.
- Pass 5 — Policy Detail, Timeline, renewals, risk, alerts and Due Actions: `COMPLETE`.
- Pass 6 — Final reconciliation and build-only queue lock: `COMPLETE`.

## Track result

```text
TRACK_A_STATUS=COMPLETE
AUDIT_PASSES_COMPLETE=6_OF_6
DOCUMENTATION_PHASE=CARTERA_000_COMPLETE
PRODUCTIVE_RUNTIME_IMPLEMENTATION=NOT_STARTED
NEXT_AUTHORIZED_TARGET=CARTERA_001A
```

The audit proved that Cartera is not greenfield. The repository already contains useful authorities, contracts, tests, productive runtimes, isolated foundations and legacy surfaces. The remaining work is primarily canonical identity, persistence, evidence-aware projections and cross-domain orchestration.

---

# 2. Final identity reconciliation

The initial roadmap wording that treated `prospect_uuid` as the canonical person identity is superseded by the Pass 4 decision.

## Locked identity rule

```text
CANONICAL_DURABLE_IDENTITY=COMMERCIAL_PERSON
PROSPECT_REFERENCE=STABLE_SALES_DOMAIN_REFERENCE
DESTRUCTIVE_PROSPECT_RENAME=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
NEW_PERSON_BEFORE_MATCH_REVIEW=FORBIDDEN
```

The existing Prospect identifier remains stable and continues to preserve Sales history, Pipeline continuity and existing references. It must be linked to `CommercialPerson`; it must not be promoted into the universal identity authority and must not be destroyed or silently replaced.

Conceptual continuity is:

```text
CommercialPerson
├── Prospect reference and Sales history
├── Quote participation
├── Application participation
├── PolicyRole participation
├── Payment and service projections
└── Relationship Graph participation
```

Each business object retains its own identifier. Continuity is achieved through governed links and projections, not by forcing every object to reuse `prospect_uuid`.

---

# 3. Final authority map

## Canonical authorities to reuse

| Concern | Final authority | Cartera role |
|---|---|---|
| Durable person identity | Shared Commercial Model / `CommercialPerson` | Review matches and display projections |
| Sales identity and continuity | Prospect Identity / Pipeline | Preserve and link the existing Prospect reference |
| Household, family and organization grouping | `CommercialAccount` | Display and navigate reviewed memberships |
| Policy facts and parties | Policy Intelligence / Policy Truth | Display read models and review evidence |
| Policy participation | `PolicyRole` | Review and display owner, insured, payor, beneficiary and advisor roles |
| Document admission and confirmation | Evidence Inbox + Evidence Packets + Confirmation Gate | Provide intake and review workflow |
| Append-only events and evidence | FES-compatible Event & Evidence | Display immutable projections |
| Payment facts | Confirmed Payment Evidence and Payment Event authority | Reconcile obligations and project status |
| Initial-versus-renewal payment classification | `initial-renewal-classifier.js` | Consume classification |
| Policy quality and conservation risk | Conservation Intelligence | Display explained local or official signals |
| Final priority recommendation | NBA Reason Why | Display non-executing recommendation |
| Conversation preparation | NASH protected context path | Prepare optional advisor-reviewed communication context |
| Internal next-action persistence | Due Action operating model | Write only after advisor confirmation |
| Daily execution surface | Mi Día / Candy Crush / Advisor Experience | Project confirmed Due Actions |
| Commission interpretation | Compensation Intelligence | Display sourced estimates and confirmed payout states |
| Relationship graph truth | Shared Intelligence / Relationship Graph | Display reviewed relationships and hypotheses |

## Cartera authority

Cartera owns:

- advisor-facing portfolio and relationship experience;
- review workflows;
- post-sale orchestration;
- read-model composition;
- future-radar presentation;
- confirmation surfaces;
- adapters that route confirmed decisions to their owning domains.

Cartera does not own:

- person identity truth;
- Policy Truth;
- payment truth;
- compensation formulas or payout truth;
- conservation formulas;
- final NBA authority;
- message approval or send;
- relationship consent;
- autonomous external effects.

---

# 4. Reuse lock

## Reuse canonically

The following must be consumed rather than rebuilt:

- Evidence Source, Evidence Inbox Item and Evidence Processing Status;
- Evidence Extraction Candidate and Evidence Inbox Router Contract;
- Policy Evidence Packet and Evidence Confirmation Task;
- Evidence Inbox Scope Gate and Advisor Confirmation Gate;
- Prospect Identity contracts and source lineage;
- FES append-only, idempotency, correction, sync and conflict patterns;
- Policy Read Model safety/evidence/freshness envelope;
- Initial Renewal Classifier;
- Payment Evidence Packet and Payment Event Engine;
- Conservation Intelligence ownership architecture;
- NBA Reason Why non-executing recommendation boundary;
- NFAST-09 Due Action local-first, outbox, synchronization, conflict and RLS operating model;
- the productive `cartera` route identifier and migration surface;
- Quote Preview PDF routing, parser ownership, provenance and regression patterns where applicable.

## Reuse with adapters or refactor

- Relationship Timeline as future-event projection only;
- Relationship Review as an evidence-aware Review Brief;
- Life Event, Referral, Engagement and Relationship Health engines as candidate-signal foundations;
- Policy Detail composition, search, filters, sorting and side-by-side UI patterns;
- Policy Timeline grouping/query/view helpers over immutable projections;
- OCR and sequential batch-processing primitives;
- renewal date-window primitive with injected clock and timezone;
- Policy alert presentation;
- Google Calendar payload/link construction behind a separate approved intent.

## Never activate or promote in current form

- isolated `policy-storage-engine.js` memory storage;
- arbitrary Policy `localStorage` auto-save as truth;
- legacy IndexedDB as Person, Policy or Event authority;
- `policy-auto-approval-engine.js`;
- `policy-ai-parser.js` as a canonical parser;
- legacy mutable/deletable Policy Timeline repository;
- fixed unvalidated risk or renewal scores as truth;
- `policy-relationship-score-engine.js` as relationship health;
- automatic task generation;
- automatic cross-sell suggestions;
- automatic Calendar creation;
- automatic message generation or send;
- fake Prospect creation for imported clients or policies;
- a Policy model based on one free-text `clientId`;
- missing values converted to zero, MXN, ACTIVE, STABLE or manual without evidence.

---

# 5. Formal program structure

The Cartera program is locked as:

```text
12 canonical phases
× 4 execution subphases per phase
= 48 formal subphases
```

Every phase uses the same execution lifecycle:

- `A` — bounded scope, discovery and authority verification;
- `B` — contracts, persistence or deterministic foundation construction;
- `C` — productive integration and adapter wiring;
- `D` — tests, evidence, decision lock and closure.

No `B`, `C` or `D` subphase may start before its `A` scope is closed. No next canonical phase may begin before the prior phase reaches its required dependency gate, except for explicitly authorized read-only discovery.

---

# 6. Dependency-ordered build-only queue

## 🟢 CARTERA_000 — Documentation and Governance

### `CARTERA_000A_OPERATING_MODEL_AND_ROADMAP`

Status: `COMPLETE`

- Relationship operating principle registered.
- Copilot and non-manipulation boundaries registered.
- Canonical program phases registered.

### `CARTERA_000B_EXISTING_ASSET_AUDIT`

Status: `COMPLETE`

- Existing relationship, policy, intake, persistence, timeline, renewal and action assets classified.

### `CARTERA_000C_FINAL_RECONCILIATION`

Status: `COMPLETE`

- Authority conflicts resolved.
- Canonical reuse and blocked assets locked.
- Identity contradiction resolved in favor of `CommercialPerson`.

### `CARTERA_000D_BUILD_ONLY_QUEUE_LOCK`

Status: `COMPLETE`

- This dependency-ordered queue is the only approved Cartera construction sequence.

Exit gate:

```text
TRACK_A_COMPLETE=YES
CARTERA_000_COMPLETE=YES
NEXT=CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY
```

---

## 🔵 CARTERA_001 — Pipeline, Quote, Person and Timeline Continuity

### `CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY` — NEXT

Required work:

- inspect the current productive Quote, Pipeline, Prospect Detail, Prospect Timeline and FES contracts;
- prove the current quote write/read path and event gaps;
- map accepted-quote, quote-version and application handoff behavior;
- identify reusable tests and fixtures;
- produce an allowed-path and dependency lock before mutation.

Blocked shortcuts:

- no UI-first patch;
- no second Timeline;
- no Policy schema work;
- no new person identity;
- no Quote Truth duplication.

### `CARTERA_001B_QUOTE_LIFECYCLE_EVENT_BRIDGE`

Build:

- governed Quote lifecycle event contract or adapter;
- idempotent event publication for created, updated, recalculated, presented, accepted, rejected and converted-to-application states;
- evidence and source references;
- stable Prospect reference plus future `CommercialPerson` link compatibility.

### `CARTERA_001C_PROSPECT_DETAIL_TIMELINE_PROJECTION`

Integrate:

- Quote commercial meaning into the existing person/prospect timeline projection;
- Quote history into Prospect Detail;
- read-only links to Quote Truth;
- no duplicated quote calculations or policy claims.

### `CARTERA_001D_CONTINUITY_VERTICAL_CLOSURE`

Prove:

- first contact through Quote decision can be reconstructed;
- duplicate publication is idempotent;
- corrections preserve history;
- unknown/stale Quote context remains visible;
- tests, browser evidence and closure document exist.

Dependency exit:

`CARTERA_010A` may begin after `CARTERA_001D` closes.

---

## 🔵 CARTERA_010 — Control Base and Canonical Persistence

### `CARTERA_010A_IDENTITY_POLICY_PERSISTENCE_SCOPE`

Scope:

- `CommercialPerson`;
- Prospect-to-Person link;
- identity match/decision/conflict records;
- `CommercialAccount` and memberships;
- Policy schema v2;
- `PolicyRole`;
- Policy evidence, versions and conflicts;
- RLS and privacy;
- FES-compatible Policy event subjects.

### `CARTERA_010B_COMMERCIAL_PERSON_POLICY_ROLE_FOUNDATION`

Build:

- durable `CommercialPerson` contract and persistence;
- stable Prospect source-identity link;
- identity-resolution decision persistence;
- `CommercialAccount` and membership persistence;
- canonical Policy and PolicyRole contracts;
- Policy, Party, evidence, version and conflict persistence;
- identity-aware confirmed Policy command;
- advisor/tenant-bound RLS.

### `CARTERA_010C_POLICY_EVENT_AND_READ_MODEL_INTEGRATION`

Integrate:

- FES-compatible append-only Policy events;
- immutable Policy Timeline projection;
- person/account commercial-meaning projections;
- productive Policy repository;
- productive Policy Read Model adapter;
- legacy `cartera` route bridge preserving search/list/KPI continuity while removing direct truth writes.

### `CARTERA_010D_CONTROL_BASE_VERTICAL_CLOSURE`

Prove:

- a known person can be linked without duplicate identity;
- a Policy can contain multiple parties and roles;
- Policy facts preserve evidence, freshness and conflicts;
- RLS prevents cross-advisor access;
- legacy route behavior remains available during migration;
- no Policy uses a free-text single-client authority.

Dependency exit:

`CARTERA_020A` may begin after the identity and Policy command contracts from `010B` are closed. Productive `020C` integration requires `010D`.

---

## 🔵 CARTERA_020 — Document Intake and Identity Resolution

### `CARTERA_020A_POLICY_INTAKE_ADAPTER_SCOPE`

Scope:

- persistent Evidence Inbox admission;
- hash and document provenance;
- extraction provider envelope;
- classifier confidence and ambiguity;
- carrier/product/document parser registry;
- identity and PolicyRole candidates;
- one-by-one human review;
- resumable batch behavior.

### `CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY`

Build by reusing the canonical Evidence backbone:

```text
EvidenceSource
→ EvidenceInboxItem
→ extraction candidate
→ router
→ PolicyEvidencePacket
```

Add:

- durable queue and worker state;
- resumable sequential processing;
- per-file isolation;
- hash/provenance bridge;
- provider-neutral OCR adapter;
- parser registry;
- source location and confidence per field;
- ambiguous and unsupported document states.

### `CARTERA_020C_IDENTITY_PARTY_REVIEW_AND_CONFIRMED_POLICY_COMMAND`

Integrate:

- candidate-person search before creation;
- explained identity matches;
- account and PolicyRole review;
- field conflicts and missing-evidence review;
- Advisor Confirmation Gate;
- confirmed Policy command;
- existing-policy deduplication/conflict stage;
- Cartera review UI.

### `CARTERA_020D_FILE_TO_CONFIRMED_POLICY_CLOSURE`

Prove:

- PDF and batch files enter through Evidence Inbox;
- parser output never writes Policy Truth directly;
- unresolved identity cannot create a new person automatically;
- low-confidence/sensitive fields require review;
- duplicate Policy candidates are not silently overwritten;
- advisor correction preserves evidence lineage;
- full file-to-confirmed-Policy vertical tests pass.

Dependency exit:

`CARTERA_030A` and `CARTERA_040A` require confirmed Policy, PolicyRole and Policy events from `020D`.

---

## 🔵 CARTERA_030 — Policy and Payment Calendar

### `CARTERA_030A_RENEWAL_AND_PAYMENT_OBLIGATION_SCOPE`

Scope:

- Renewal Schedule projection;
- timezone and evaluation-clock policy;
- Payment Obligation Ledger;
- policy-year and covered-period rules;
- expected versus detected versus confirmed payment states;
- carrier Rule Pack exceptions;
- correction and cancellation behavior.

### `CARTERA_030B_RENEWAL_SCHEDULE_AND_PAYMENT_LEDGER_FOUNDATION`

Build:

- evidence-aware Renewal Schedule;
- anniversary, notice, due, overdue/unconfirmed and confirmed-renewal states;
- Payment Obligation records with expected date, amount, frequency, policy year and covered period;
- reconciliation links to confirmed Payment Events;
- append-only correction behavior.

Reuse:

- Initial Renewal Classifier;
- Payment Evidence Packet;
- Payment Event Engine;
- date-window primitive only after clock/timezone correction.

### `CARTERA_030C_PAYMENT_CONFIRMATION_AND_TIME_HORIZON_INTEGRATION`

Integrate:

- detected evidence to obligation matching;
- advisor confirmation/correction;
- partial, missing, overdue and cancelled states;
- 7-, 30- and 90-day projections;
- Policy Detail and Cartera calendar read models.

### `CARTERA_030D_CALENDAR_LEDGER_VERTICAL_CLOSURE`

Prove:

- missing dates remain blocked/unknown;
- negative day counts are not generic renewal-critical truth;
- scheduled payment is not confirmed payment;
- carrier-specific cases route to Rule Pack review;
- corrections do not erase history;
- timezone tests and obligation-reconciliation tests pass.

---

## 🔵 CARTERA_040 — Relationship Memory and Network Context

### `CARTERA_040A_RELATIONSHIP_MEMORY_SCOPE`

Scope:

- person/account unified Timeline projections;
- relationship preferences and consent;
- service commitments;
- review history;
- confirmed life context;
- household/company/referral relationships;
- privacy and sensitivity.

### `CARTERA_040B_PERSON_ACCOUNT_MEMORY_PROJECTIONS`

Build:

- immutable projections for origin, appointments, needs, objections, Quotes, applications, Policies, payments and service;
- evidence-backed communication preferences;
- decision participants and unresolved commitments;
- source, freshness and uncertainty per memory item.

### `CARTERA_040C_POLICY_REVIEW_BRIEF_AND_NETWORK_BASE`

Integrate:

- evidence-aware Policy Review Brief;
- mandatory, suggested, hypothesis and sensitive-topic sections;
- basic reviewed family, household, company, referrer and prior-introduction relationships;
- Relationship Review and Timeline foundations only through governed adapters.

### `CARTERA_040D_RELATIONSHIP_MEMORY_CLOSURE`

Prove:

- no profile condition is misrepresented as a new life event;
- missing interaction history is not deterioration truth;
- sensitive context does not become a sales instruction;
- every preference and relationship has source and freshness;
- one person history remains reconstructable across domains.

---

## 🔵 CARTERA_050 — Future Radar and Conservation

### `CARTERA_050A_CONSERVATION_SIGNAL_SCOPE`

Scope:

- local predictive versus institutional confirmed states;
- Policy Quality and Conservation Risk signal contract;
- evidence, confidence, freshness and missing-input requirements;
- alert and Cartera Signal envelopes;
- Future Radar horizons and filtering.

### `CARTERA_050B_LOCAL_PREDICTIVE_CONSERVATION_RUNTIME`

Build under Conservation Intelligence:

- candidate features from payment behavior, renewal timing, service gaps and relationship context;
- evidence-aware local predictive signals;
- no unvalidated official LIMRA/IGC or conservation claim;
- correction and snapshot behavior.

Legacy fixed scores may inform feature inventory only.

### `CARTERA_050C_CARTERA_SIGNAL_AND_FUTURE_RADAR_INTEGRATION`

Integrate:

- Cartera Signal envelope;
- Policy alerts with fact/prediction distinction;
- today, 7-, 30- and 90-day radar;
- why person, why now, evidence, uncertainty and smallest useful action;
- Policy Detail and portfolio projections.

### `CARTERA_050D_FUTURE_RADAR_CLOSURE`

Prove:

- stale, unknown or conflicted Policy facts cannot create strong recommendations;
- local predictions are not official outcomes;
- every alert identifies owner and evidence;
- no action executes automatically;
- radar acceptance tests pass.

---

## 🔵 CARTERA_060 — Relationship Growth Intelligence

### `CARTERA_060A_GROWTH_SIGNAL_SCOPE`

Scope:

- second-policy review;
- protection review;
- warm opportunity;
- relationship strengthening;
- referral/introduction conversation candidate;
- center-of-influence hypothesis;
- Pipeline handoff confirmation.

### `CARTERA_060B_RELATIONSHIP_ENGINE_RECONCILIATION`

Refactor and adapt:

- Life Event Engine;
- Relationship Health and Engagement;
- Referral Opportunity Engine;
- Relationship Opportunity Engine;
- Relationship Review and Master orchestration.

Required behavior:

- output candidate signals, never sales truth;
- preserve unknown, external coverage possible and client-declined states;
- attach evidence, freshness, sensitivity and limitations;
- distinguish relationship-strengthening from referral requests.

### `CARTERA_060C_ADVISOR_CONFIRMED_PIPELINE_BRIDGE`

Integrate:

- explainable candidate opportunity;
- advisor review and confirmation;
- governed opportunity creation in Pipeline;
- source link back to Cartera signal and relationship evidence;
- no duplicate person or opportunity.

### `CARTERA_060D_GROWTH_INTELLIGENCE_CLOSURE`

Prove:

- absence of imported coverage is not a protection gap;
- age, marriage, children, claims or life events do not become automatic sales triggers;
- consent is never inferred;
- opportunity writes require advisor confirmation;
- ethical and negative tests pass.

---

## 🔵 CARTERA_070 — Candy Crush Relational Activation

### `CARTERA_070A_GENERIC_DUE_ACTION_SUBJECT_SCOPE`

Scope:

- generic `subjectType + subjectReference` contract;
- compatibility with current Prospect Due Actions;
- migration and RLS strategy;
- opaque origin recommendation references;
- one-active-action rules by subject/context;
- Mi Día and Candy Crush projections.

### `CARTERA_070B_DUE_ACTION_GENERALIZATION_FOUNDATION`

Build by preserving NFAST-09 behavior:

- local-first atomic record/outbox commit;
- deterministic mutation ID;
- offline retry;
- conflict preservation;
- advisor-bound ownership;
- schedule, reschedule, complete, cancel, acknowledge and snooze.

Add subject support for reviewed:

- Prospect;
- CommercialPerson;
- CommercialAccount;
- Policy.

### `CARTERA_070C_NBA_CARTERA_ACTION_INTEGRATION`

Integrate:

```text
Cartera Signal
→ NBA Reason Why candidate
→ advisor confirmation
→ generic Due Action writer
→ Mi Día / Candy Crush
```

Maintain:

- Pipeline writer as backward-compatible `PROSPECT` adapter;
- separate Cartera writer for person/account/policy subjects;
- no sensitive reasoning copied into local Due Action records;
- full reasoning linked through opaque origin references.

### `CARTERA_070D_RELATIONAL_ACTIVATION_CLOSURE`

Prove:

- imported Policies do not require fake Prospects;
- existing Pipeline Due Actions remain compatible;
- offline/sync/conflict behavior remains intact;
- NBA does not execute;
- no automatic task, calendar, message or cross-sell effect occurs;
- Mi Día and Candy Crush show only governed actions.

---

## 🔵 CARTERA_080 — Email, Payment and Compensation Connection

### `CARTERA_080A_EMAIL_EVIDENCE_SCOPE`

Scope:

- connected-email evidence admission;
- privacy and minimum-content rules;
- document/message classification;
- person/Policy/obligation match candidates;
- payment, issue, renewal, refund, cancellation and reinstatement signals;
- advisor confirmation.

### `CARTERA_080B_EMAIL_EVIDENCE_ADAPTER`

Build:

- email-to-EvidenceSource adapter;
- Evidence Inbox routing;
- provenance and message reference;
- candidate extraction without autonomous truth creation;
- scoped review.

### `CARTERA_080C_PAYMENT_AND_COMPENSATION_PROJECTION_INTEGRATION`

Integrate:

- confirmed evidence to Payment Event;
- Payment Obligation reconciliation;
- Policy/Timeline projections;
- Compensation candidate and confirmed-state inputs;
- discrepancies without inventing commission percentages.

### `CARTERA_080D_EMAIL_ECONOMIC_LOOP_CLOSURE`

Prove:

- email detection is not payment confirmation;
- payment confirmation is not payout truth;
- carrier statement remains payout authority;
- mismatches preserve both estimate and confirmed statement history;
- privacy, matching and correction tests pass.

---

## 🔵 CARTERA_090 — Relationship Capital

### `CARTERA_090A_RELATIONSHIP_GRAPH_RUNTIME_SCOPE`

Scope:

- graph entities and edge taxonomy;
- evidence and consent;
- family, household, company, partner, referrer, referred person, prior introduction and professional community links;
- center-of-influence hypothesis state;
- RLS and sensitive-edge rules.

### `CARTERA_090B_RELATIONSHIP_GRAPH_PERSISTENCE`

Build:

- canonical graph persistence and repositories;
- edge evidence, provenance, freshness and correction;
- reviewed graph commands;
- person/account integration.

### `CARTERA_090C_RELATIONSHIP_CAPITAL_PROJECTIONS`

Integrate:

- referral paths;
- prior introductions;
- reviewed professional-network context;
- explainable center-of-influence hypotheses;
- relationship-strengthening recommendations even before transactional urgency.

### `CARTERA_090D_RELATIONSHIP_CAPITAL_CLOSURE`

Prove:

- no opaque influence score becomes truth;
- graph proximity is not consent;
- no third-party outreach is authorized automatically;
- sensitive relationships remain scoped;
- non-manipulation tests pass.

---

## 🔵 CARTERA_100 — Productivity Proof and Learning

### `CARTERA_100A_PRODUCTIVITY_MEASUREMENT_SCOPE`

Scope:

- administrative work avoided;
- policy/payment/commission value protected;
- relationship-growth outcomes;
- advisor time and action-efficiency metrics;
- recommendation feedback and learning boundaries.

### `CARTERA_100B_TELEMETRY_AND_OUTCOME_FOUNDATION`

Build:

- evidence-backed telemetry events;
- capture-time avoided estimates with declared assumptions;
- duplicate prevention and confirmation metrics;
- accepted/rejected recommendation outcomes;
- action completion and time-to-action metrics.

### `CARTERA_100C_PRODUCTIVITY_PROOF_AND_SAFE_LEARNING`

Integrate:

- Cartera productivity read model;
- monthly proof statement;
- learning from advisor acceptance and useful outcomes;
- no optimization for contact volume, pressure, manipulation or inferred consent.

### `CARTERA_100D_PROGRAM_ACCEPTANCE_CLOSURE`

Prove:

- Forge can report administrative time avoided, expected value protected and reviewed growth opportunities;
- calculations expose sources and assumptions;
- learning does not weaken advisor judgment;
- Article 0 review passes;
- full Cartera program closure is evidence-backed.

---

# 7. Dependency graph

The default implementation order is linear and mandatory:

```text
CARTERA_000D
→ CARTERA_001A-D
→ CARTERA_010A-D
→ CARTERA_020A-D
→ CARTERA_030A-D
→ CARTERA_040A-D
→ CARTERA_050A-D
→ CARTERA_060A-D
→ CARTERA_070A-D
→ CARTERA_080A-D
→ CARTERA_090A-D
→ CARTERA_100A-D
```

## Explicitly permitted parallel discovery

Read-only discovery may overlap only when it does not authorize implementation or mutate overlapping authorities:

- `020A` may begin after `010B` contracts are stable, but `020C` waits for `010D`.
- `040A` may begin after Policy event and person-link contracts are stable, but productive memory integration waits for `020D`.
- `080A` may begin after Evidence and Payment contracts are stable, but productive economic-loop integration waits for `030D`.
- `090A` may begin after person/account and relationship-memory contracts are stable, but relationship-capital recommendations wait for `060D`.

No other cross-phase implementation parallelism is authorized by this lock.

---

# 8. Confirmed construction-gap mapping

The 34 confirmed gaps are mapped as follows:

| Gap | Owning subphase |
|---|---|
| CommercialPerson schema, contract and persistence | `010B` |
| Prospect-to-CommercialPerson link | `010B` |
| Identity match/conflict/decision persistence | `010B` |
| CommercialAccount and memberships | `010B` |
| Policy schema v2 | `010B` |
| PolicyRole contract | `010B` |
| Policy and Policy Party persistence | `010B` |
| Policy evidence and field provenance | `010B` |
| Policy status/version/conflict model | `010B–010C` |
| Identity-aware confirmed Policy command | `010B` |
| Policy-specific RLS/privacy | `010B` |
| FES-compatible Policy events | `010C` |
| Immutable Policy Timeline/person/account projections | `010C` |
| Productive Policy repository/read model | `010C` |
| Productive file admission and Evidence worker | `020B` |
| Existing-policy conflict/deduplication | `020C` |
| Intake and Policy review UI | `020C` |
| Renewal Schedule | `030B` |
| Payment Obligation Ledger | `030B` |
| Local predictive Conservation runtime | `050B` |
| Evidence-aware Policy alerts | `050C` |
| Policy Review Brief | `040C` |
| Relationship Graph runtime | `090B` |
| Cartera Signal envelope | `050C` |
| NBA consumption of Cartera signals | `070C` |
| Generic Due Action subject contract/migration | `070B` |
| Backward-compatible Pipeline adapter | `070C` |
| Cartera Due Action writer | `070C` |
| Mi Día and Candy Crush projections | `070C` |
| Calendar Intent and approved provider bridge | separate authorized adapter after `070D`; payload primitive may be reused |
| File-to-confirmed-Policy vertical tests | `020D` |
| Policy-signal-to-confirmed-Due-Action tests | `070D` |
| Negative automatic-effect tests | each phase `D`, consolidated in `070D` |
| Unknown/stale/conflicted-data priority tests | `050D` and `070D` |

No confirmed gap remains without an owning queue position.

---

# 9. Codex execution contract

A Codex task for Cartera is valid only when its prompt includes:

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=<exact A/B/C/D identifier>
SOURCE_COMMIT=<exact immutable commit>
CANONICAL_SOURCE_TRUTH=FORGE_CARTERA_FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK_006.md
ALLOWED_PATHS=<bounded paths>
REQUIRED_REUSE=<named existing contracts/runtimes>
BLOCKED_AUTHORITIES=<truths/effects the task cannot create>
SCHEMA_MUTATION=<YES or NO>
SUPABASE_REMOTE_MUTATION=<YES or NO>
RUNTIME_MUTATION=<YES or NO>
REQUIRED_TESTS=<exact tests or test classes>
EVIDENCE_PATH=<required output path>
CLOSURE_DOCUMENT=<required closure path>
```

## Mandatory Codex behavior

Codex must:

1. verify the source commit and branch before mutation;
2. read this queue lock and the owning phase source truth;
3. perform targeted repository discovery inside the authorized phase;
4. prove reuse decisions before creating a new engine, schema, repository or adapter;
5. preserve unknown, stale, conflicted and unconfirmed states;
6. add or update tests for the authorized behavior;
7. produce evidence and a closure/decision lock;
8. report every file changed and every authority intentionally not changed.

Codex must stop with `BLOCKED_BY_QUEUE_OR_AUTHORITY` when:

- the requested phase is not `NEXT` or separately authorized;
- a required dependency is not closed;
- the prompt attempts to create a duplicate authority;
- identity, Policy, payment or external effects would bypass confirmation;
- scope requires mutation outside allowed paths;
- source truth is contradictory and not resolved by this Pass 6 lock.

## Current Codex authorization

```text
CURRENT_NEXT=CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY
CARTERA_001B_IMPLEMENTATION_AUTHORIZED=NO
CARTERA_010_AND_LATER_IMPLEMENTATION_AUTHORIZED=NO
```

Starting `001A` requires a separate explicit task. Completing Pass 6 does not silently start implementation.

---

# 10. Global negative gates

No Cartera phase may ship behavior that:

- creates or merges a person automatically;
- replaces Prospect identity destructively;
- writes Policy Truth from parser output;
- stores one free-text client as the complete Policy participation model;
- confirms payment from detection alone;
- presents a forecast as payment, Policy, conservation, commission or payout truth;
- deletes historical events instead of correcting append-only history;
- creates tasks automatically from generic inactivity;
- creates Calendar events without explicit intent and approval;
- generates or sends a message without the corresponding governed gates;
- creates cross-sell or referral requests automatically;
- treats life events, claims, family status or trust as commercial permission;
- creates fake Prospects for imported clients or policies;
- optimizes for contact volume, pressure or manipulation;
- hides evidence, uncertainty, staleness or conflict.

---

# 11. Common phase exit gate

Every phase must close with:

```text
SOURCE_COMMIT_VERIFIED=YES
REUSE_MAP_COMPLETE=YES
DOMAIN_AUTHORITY_PRESERVED=YES
TESTS=PASS
NEGATIVE_TESTS=PASS
EVIDENCE_CREATED=YES
CLOSURE_CREATED=YES
BUILD_TREE_SYNC=PASS
UNIFIED_BUILD_TREE_SYNC=PASS
ROADMAP_LOCK_SYNC=PASS
UNAUTHORIZED_EFFECTS=NONE
NEXT_PHASE_EXPLICITLY_DECLARED=<identifier or NONE>
```

A file, branch, commit or PR is not completion proof by itself.

---

# 12. Final Pass 6 decision

```text
PASS_6_FINAL_RECONCILIATION=COMPLETE
TRACK_A_EXISTING_ASSET_AUDIT=COMPLETE
CARTERA_000_DOCUMENTATION_AND_GOVERNANCE=COMPLETE
FORMAL_PHASES=12
FORMAL_SUBPHASES=48
BUILD_ONLY_QUEUE=LOCKED
UNMAPPED_CONSTRUCTION_GAPS=0
CANONICAL_DURABLE_IDENTITY=COMMERCIAL_PERSON
PROSPECT_REFERENCE=STABLE_SALES_CONTINUITY_LINK
POLICY_PARTICIPATION=POLICY_ROLE
POLICY_TIMELINE=FES_COMPATIBLE_APPEND_ONLY_PROJECTION
CONSERVATION_RISK_OWNER=CONSERVATION_INTELLIGENCE
FINAL_PRIORITY_OWNER=NBA_REASON_WHY
INTERNAL_ACTION_RUNTIME=GENERALIZED_DUE_ACTION
AUTOMATIC_EXTERNAL_EFFECTS=BLOCKED
NEXT=CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY
```
