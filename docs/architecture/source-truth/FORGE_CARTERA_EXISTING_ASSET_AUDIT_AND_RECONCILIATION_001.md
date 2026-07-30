# FORGE CARTERA — EXISTING ASSET AUDIT AND RECONCILIATION 001

Forge OS  
Architecture Source Truth  
Cartera / Relationship Intelligence

## Status

`DISCOVERY_ACTIVE / FIRST_PASS_CLASSIFICATION_COMPLETE / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Program relationship

Canonical roadmap:

- `docs/architecture/source-truth/FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE_ROADMAP_001.md`

This document begins the work requested by the Cartera program:

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

## `DO_NOT_ACTIVATE`

The asset must not be wired in its current form because it could bypass evidence, ownership, consent or human confirmation boundaries.

## Evidence levels

- `CODE_INSPECTED`: implementation directly reviewed.
- `INVENTORY_CONFIRMED`: file and classification confirmed; behavior still requires direct audit.
- `ARCHITECTURE_CONFIRMED`: authoritative or candidate documentation reviewed.
- `PRODUCTIVE_STATUS_UNPROVEN`: existence does not prove runtime integration or production use.

---

# 3. Executive finding

Cartera is not a greenfield module.

The repository already contains:

- Relationship Intelligence foundations and orchestrators;
- a legacy Cartera UI and import surface;
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

- recognizes marriage, child, employment, housing, retirement, business-owner, divorce and education language;
- gathers evidence from client data, timeline, relationship history and NASH memory;
- proposes review areas.

Blocking issues:

- permanent profile state may be misread as a new event;
- event date and freshness are not required;
- text pattern occurrence may be treated as sufficient event evidence;
- sensitive life events may become commercial triggers.

Required reconciliation:

- separate `PROFILE_STATE` from `NEW_LIFE_EVENT`;
- require source, event date, observed date and freshness;
- produce candidate interpretation only;
- sensitive events require explicit advisor judgment and non-manipulation guardrails.

## 4.5 `referral-opportunity-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- detects positive service, successful claim, completed review, long relationship, multiple policies and responsiveness signals;
- proposes timing and conversational approach.

Blocking issues:

- combines relationship strength with permission to request referrals;
- life events can become referral triggers;
- score weights are unvalidated;
- `NOW` can be produced without explicit consent or advisor judgment.

Required reconciliation:

- rename output to `RELATIONSHIP_STRENGTHENING_CANDIDATE` or `INTRODUCTION_CONVERSATION_CANDIDATE`;
- keep relationship context separate from consent;
- no opaque influence score may become relationship truth;
- Alfred may consume the candidate only after evidence and boundary validation.

## 4.6 `relationship-health-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- identifies payments, renewals, multiple urgent events, pending reviews, possible gaps and inactivity;
- preserves some strengths;
- returns a deterministic attention recommendation.

Required reconciliation:

- current output measures operational attention more than relationship health;
- rename or split into `RELATIONSHIP_ATTENTION_STATE` and actual relationship health;
- historical no-response events must not create permanent inactivity risk;
- evidence dates and resolution state are required.

## 4.7 `client-engagement-engine.js`

Disposition: `REFACTOR_FOUNDATION`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- calculates recency, interaction volume, inbound behavior and positive outcomes;
- identifies last interaction and inactivity risk.

Blocking issues:

- no history becomes `CRITICAL` by default;
- a fixed number of inactive days is applied to every relationship type;
- contact frequency preference and policy lifecycle context are absent.

Required reconciliation:

- use relationship-specific cadence expectations;
- distinguish missing history from deteriorating engagement;
- never convert low engagement directly into mandatory contact.

## 4.8 `relationship-review-engine.js`

Disposition: `REUSE_WITH_ADAPTER`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- determines whether a review may be useful;
- creates suggested review topics;
- prioritizes payment, renewal, policy review, candidate gaps and life events.

Required reconciliation:

- separate mandatory service topics, suggested topics, hypotheses to validate and sensitive topics;
- preserve all reasons instead of only the first reason;
- attach evidence and human-decision checkpoints.

Canonical role:

Foundation for a governed Relationship Review Brief.

## 4.9 `relationship-master-engine.js`

Disposition: `REUSE_WITH_ADAPTER`  
Evidence: `CODE_INSPECTED`

Current useful capability:

- orchestrates timeline, next action, opportunity, life event, referral, health, engagement and review engines.

Blocking issues:

- combines heterogeneous scores into one ambiguous confidence value;
- downstream outputs do not yet share a canonical evidence envelope;
- some consumed engines are not safe for direct activation.

Required reconciliation:

- retain orchestration pattern;
- remove synthetic aggregate confidence;
- return separate sections for facts, scheduled events, detected evidence, candidate interpretations, recommendations and human decisions required;
- consume only reconciled versions of each engine.

Canonical role:

Relationship Intelligence orchestrator, not a new truth authority.

---

# 5. Policy Operations asset audit

## 5.1 Cluster finding

A prior move-map classified 77 Policy Operations assets across:

- `policy-detail/`;
- `policy-timeline/`;
- `renewals/`;
- `tasks/`;
- `evidence/`;
- `client-records/`.

The same move-map recorded that the selected assets were `NO_IMPORTS` with zero detected root JS consumers at that time.

Disposition of the cluster:

`INVENTORY_CONFIRMED / PRODUCTIVE_STATUS_UNPROVEN`

Therefore, file existence is reusable discovery evidence, not implementation proof.

## 5.2 Policy document ingestion group

Assets include:

- `drag-drop-policy-zone.js`;
- `csv-parser-engine.js`;
- `policy-ocr-engine.js`;
- `policy-ai-parser.js`;
- `policy-document-classifier.js`;
- `policy-schema-validator-engine.js`;
- `policy-normalization-engine.js`;
- `policy-ingestion-orchestrator.js`;
- `policy-human-review-engine.js`;
- `policy-import-queue.js`;
- `policy-batch-processing-engine.js`;
- `policy-staging-cache.js`;
- `policy-import-dashboard-engine.js`;
- `mass-import-preview-engine.js`;
- `mass-import-validation-engine.js`.

Primary disposition: `REUSE_WITH_ADAPTER`

Verified useful flow:

```text
file
→ OCR
→ parse
→ validate
→ normalize
→ human review
```

Required construction:

- persistent and resumable queue;
- evidence packet per extracted field;
- identity-resolution step before persistence;
- policy-party resolution;
- governed error and conflict states;
- durable staging storage;
- Event & Evidence publication after confirmation.

## 5.3 Policy detail and read-model group

Assets include:

- `policy-core-engine.js`;
- `policy-detail-engine.js`;
- `policy-detail-view-model.js`;
- `policy-client-summary-engine.js`;
- `policy-financial-summary-engine.js`;
- `policy-context-engine.js`;
- `policy-status-engine.js`;
- `policy-live-state-engine.js`;
- `policy-metadata-engine.js`;
- `policy-summary-engine.js`;
- `policy-search-engine.js`;
- `policy-filter-engine.js`;
- `policy-smart-sort-engine.js`;
- `policy-quick-actions-engine.js`;
- `policy-operational-center-engine.js`;
- `policy-workspace-engine.js`;
- Policy Read Model adapter and source-truth contracts.

Primary disposition: `REUSE_WITH_ADAPTER`

Required reconciliation:

- Policy Intelligence remains owner of policy facts;
- Cartera consumes a productive read model;
- current local/static adapters must not be represented as Policy Truth;
- person, policyholder, insured, beneficiary, payer and owner must remain separate party roles.

## 5.4 Policy timeline group

Assets include:

- `policy-activity-engine.js`;
- `policy-timeline-engine.js`;
- `policy-timeline-event.factory.js`;
- `policy-timeline-group-engine.js`;
- `policy-timeline-query-engine.js`;
- `policy-timeline-view-model.js`;
- `policy-timeline.repository.js`;
- `policy-timeline.types.js`.

Primary disposition: `REUSE_WITH_ADAPTER`

Required reconciliation:

- no second append-only event authority;
- Policy Timeline must consume or project Event & Evidence facts;
- future dates and recommendations must remain projections, not historical facts;
- quote, application, issue, payment, cancellation and reinstatement continuity must attach to the canonical person.

## 5.5 Renewal, risk and alert group

Assets include:

- `policy-renewal-engine.js`;
- `policy-renewal-status-engine.js`;
- `renewal-intelligence-engine.js`;
- `policy-risk-engine.js`;
- `policy-detail-alert-engine.js`;
- `policy-review-priority-engine.js`;
- `policy-last-contact-engine.js`.

Primary disposition: `REFACTOR_FOUNDATION`

Verified useful capability:

- renewal proximity;
- contact recency;
- pending-payment signals;
- operational alert generation;
- deterministic risk prioritization.

Blocking issues:

- score weights are not validated rules;
- payment counts may not correspond to confirmed obligations;
- renewal proximity is not itself relationship weakness;
- local risk must not become official Conservation truth.

Canonical role:

Candidate inputs to local predictive Conservation and Future Radar.

## 5.6 Task and action group

Assets include:

- `policy-followup-engine.js`;
- `policy-task-engine.js`;
- `policy-task-priority-engine.js`;
- `task-engine.js`;
- `task-feed-engine.js`;
- `task-priority-engine.js`;
- `task-quick-action-engine.js`;
- `ai-task-suggestion-engine.js`;
- `auto-task-generator-engine.js`;
- `overdue-task-engine.js`;
- `realtime-task-engine.js`;
- `google-calendar-engine.js`.

Primary disposition:

- suggestion and priority foundations: `REUSE_WITH_ADAPTER`;
- automatic task and calendar execution: `DO_NOT_ACTIVATE` without human approval and execution gates.

Canonical role:

Cartera produces governed signals. Alfred / NBA prioritizes. Advisor Experience presents. The advisor approves execution.

## 5.7 Duplicate detection

Asset:

- `policy-duplicate-engine.js`.

Disposition: `REBUILD_CANONICAL_GAP`

Current behavior compares client, product and premium. This is not sufficient for policy identity or person identity.

Useful residue:

- preserve duplicate-detection test fixtures and entrypoint only if compatible.

Required canonical matching inputs:

- carrier;
- policy number;
- issue date;
- policyholder identity;
- insured-party identity;
- product/version;
- source-document fingerprint;
- existing policy references;
- conflict state.

---

# 6. Legacy Cartera surface audit

Asset:

- `cartera-view.js` and route-adjacent Cartera services/controllers.

Disposition: `LEGACY_SURFACE_MIGRATE`

Verified useful capability:

- portfolio KPIs;
- policy count;
- premium total;
- collection alerts;
- manual form;
- importer;
- policy listing.

Required reconciliation:

- preserve functional behavior and service knowledge;
- migrate into ForgeShell and Material 3 rather than rebuild blindly;
- replace static portfolio summary as the primary experience with Future Radar and attention surfaces;
- connect canonical person, policy, evidence and relationship projections;
- do not treat legacy route state as source truth.

---

# 7. Canonical authorities to reuse without duplication

## 7.1 Event & Evidence

Disposition: `REUSE_CANONICAL`

Owns append-only facts, provenance and evidence lineage.

Cartera must publish confirmed events and consume projections. It must not create a second timeline truth.

## 7.2 Canonical person continuity

Disposition: `REUSE_CANONICAL`

The existing `prospect_uuid` remains the continuity reference for a known person.

Cartera must not create separate prospect, client and policyholder identities for the same person.

## 7.3 Pipeline and Opportunity lifecycle

Disposition: `REUSE_CANONICAL`

Pipeline owns commercial opportunity lifecycle.

Cartera may propose a candidate opportunity. Only an advisor-confirmed bridge may create or reopen an opportunity.

## 7.4 Quote Intelligence

Disposition: `REUSE_CANONICAL`

Quote Intelligence owns quote facts, versions, calculations and acceptance state.

Cartera and Pipeline consume quote lifecycle events and relationship meaning.

## 7.5 Policy Intelligence and Policy Read Model

Disposition: `REUSE_CANONICAL / REUSE_WITH_PRODUCTIVE_ADAPTER`

Policy Intelligence owns policy facts, parties, coverage, status and source-backed dates.

Cartera owns the advisor-facing post-sale read model and workflow, not Policy Truth.

## 7.6 Conservation Intelligence

Disposition: `ARCHITECTURE_ONLY` for the productive runtime reviewed in this audit.

Existing architecture correctly separates:

- production facts;
- local predictive conservation;
- institutional conservation truth;
- compensation;
- forecast;
- business planning.

Required construction:

- productive local predictive Conservation runtime;
- official snapshot intake;
- evidence and confidence envelope;
- policy, advisor and portfolio projections;
- no invented LIMRA, IGC, persistency or conservation formula.

## 7.7 Compensation Intelligence

Disposition: `REUSE_CANONICAL / REFACTOR_FOUNDATION`

Existing useful assets include commissionable-amount and commission-projection foundations plus Rule Snapshot Governance.

Required construction:

- validated Rule Packs;
- policy-year and period resolver;
- confirmed payment input;
- expected, calculated, reported and paid commission separation;
- reconciliation against official evidence.

## 7.8 Alfred / NBA

Disposition: `REUSE_CANONICAL`

Owns final recommendation priority and Reason Why.

Cartera must provide governed signals, not bypass Alfred with its own final ranking authority.

## 7.9 NASH

Disposition: `REUSE_CANONICAL`

Owns conversation preparation and deterministic Conversation Brief boundaries.

NASH does not own relationship graph truth, policy truth, opportunity truth or execution.

## 7.10 Candy Crush / Advisor Experience

Disposition: `REUSE_WITH_ADAPTER`

Owns daily action presentation, progressive experience and small useful actions.

Required construction:

- Cartera relational mission provider;
- action card based on Alfred-approved recommendation;
- advisor confirmation and execution tracking;
- no generic activity inflation.

---

# 8. Identity audit

## Existing assets

- `entity-resolver-engine.js`;
- `policy-duplicate-engine.js`;
- identity-related architecture and `prospect_uuid` continuity contracts.

## Finding

The current entity resolver performs a simple case-insensitive name substring search.

Disposition: `REBUILD_CANONICAL_GAP`

## Required construction

`Canonical Person Resolution Engine`

Minimum inputs:

- normalized name;
- phone;
- email;
- birth date;
- legally permitted tax identifier;
- recent appointments;
- quote and application references;
- product context;
- referral source;
- household and company relationships;
- document evidence.

Required outputs:

- `MATCH_HIGH_CONFIDENCE`;
- `MATCH_REVIEW_REQUIRED`;
- `NO_MATCH`;
- `CONFLICT`;
- ranked candidate identities;
- matching and conflicting evidence;
- confidence and uncertainty;
- human decision required;
- auditable decision record.

No automatic person merge is authorized.

---

# 9. Payment and commission audit

## Existing useful assets

- `payment-frequency-engine.js`;
- policy payment-date projections;
- pending-payment alerts;
- commissionable-amount foundation;
- `commission-projection-engine.js`;
- Compensation architecture and Rule Snapshot Governance.

## Finding

The repository contains frequency and calculation primitives, but this audit did not verify a productive canonical Payment Obligation Ledger.

Disposition: `REBUILD_CANONICAL_GAP`

## Required construction

`Policy Payment Obligation Ledger`

Minimum state:

- obligation identifier;
- policy identifier;
- canonical person and payer references;
- policy year;
- expected date;
- expected amount;
- expected currency;
- covered period;
- frequency;
- detected evidence;
- confirmation state;
- actual date and amount;
- partial, corrected, overdue and cancelled states;
- evidence references;
- actor and confirmation timestamp.

Cartera must not convert email detection or scheduled payment into confirmed payment truth.

---

# 10. Relationship Graph audit

## Existing authority

`ADR-0026_RELATIONSHIP_GRAPH_PRIMARY_COMMERCIAL_ASSET.md`

The ADR defines the graph as a primary commercial asset and assigns Shared Intelligence ownership for:

- relationship identity;
- relationship context;
- referral links;
- engagement history;
- relationship health;
- opportunity evidence.

## Finding

The reviewed ADR explicitly does not implement the graph.

Disposition: `ARCHITECTURE_ONLY / REBUILD_CANONICAL_GAP`

## Required construction

- graph node and edge model;
- person, household, company and relationship links;
- provenance and freshness per edge;
- consent and sensitivity boundaries;
- referral lineage;
- relationship-role history;
- read model for Cartera;
- no opaque influence score as graph truth.

---

# 11. First-pass build versus reuse decision

## Do not build again

- a second relationship timeline authority;
- a second relationship master engine;
- another policy parser pipeline from scratch;
- another policy read model without reconciling the existing one;
- another task-priority domain inside Cartera;
- another final NBA ranking engine;
- another NASH message engine;
- another quote truth store;
- another person identity for clients;
- another compensation formula owner.

## Adapt and reconcile

- relationship engines;
- policy ingestion primitives;
- policy detail and timeline foundations;
- renewal, risk and alert signals;
- legacy Cartera UI and services;
- task and quick-action foundations;
- Policy Read Model;
- commission projection primitives;
- Advisor Experience presentation primitives.

## Build as canonical gaps

1. Canonical Person Resolution Engine.
2. Identity Resolution Review UI.
3. Confirmed Policy and Policy Party persistence.
4. Persistent and resumable document-import queue.
5. Policy Payment Obligation Ledger.
6. Payment confirmation workflow.
7. Productive local predictive Conservation runtime.
8. Relationship Graph runtime and read model.
9. Cartera Signal Envelope and adapters.
10. Advisor-confirmed Cartera-to-Pipeline opportunity bridge.
11. Cartera-to-Alfred-to-Candy-Crush orchestration.
12. Email payment evidence adapter.
13. Compensation Rule Pack bridge.
14. Productive Cartera UI migration and Future Radar.
15. Productivity proof metrics.

---

# 12. Reconciliation target architecture

```text
Canonical person / prospect_uuid
        │
        ├── Quote Intelligence
        ├── Pipeline opportunities
        ├── Policy Intelligence + Policy Parties
        ├── Payment Obligation Ledger
        ├── Event & Evidence
        └── Relationship Graph
                 │
                 ▼
       Relationship Intelligence
                 │
                 ▼
       Cartera Signal Envelope
        ├── confirmed facts
        ├── scheduled events
        ├── detected evidence
        ├── candidate interpretations
        ├── uncertainty / freshness
        └── human decision required
                 │
                 ▼
             Alfred / NBA
                 │
        ┌────────┴────────┐
        ▼                 ▼
      NASH        Candy Crush / Mi Día
 conversation       action surface
 preparation
```

Cartera is the advisor-facing post-sale orchestration and read-model surface over these authorities. It is not a new monolithic truth owner.

---

# 13. Execution sequence started by this document

## Audit Track A — Inventory and direct inspection

Status: `ACTIVE / FIRST PASS COMPLETE`

Completed in this pass:

- Relationship Intelligence engine code inspection;
- Policy Operations cluster identification;
- key policy ingestion foundation inspection;
- renewal, risk, alert, queue, duplicate, identity, engagement and commission primitive inspection;
- legacy Cartera UI confirmation;
- canonical authority mapping;
- initial gap list.

Still required:

- direct inspection of every Policy Operations asset proposed for reuse;
- test discovery and execution mapping;
- actual runtime consumer and import graph verification on the current branch;
- persistence and schema discovery;
- route and service call-graph discovery;
- current productive UI entrypoint discovery;
- duplicate and conflicting engine inventory;
- stale or archived implementation separation.

## Audit Track B — Canonical reconciliation

Status: `PLANNED / NOT STARTED`

Required outputs:

- one owner per fact, signal and metric;
- adapter map;
- deprecation and non-activation map;
- canonical evidence envelope;
- target import graph;
- migration order;
- bounded implementation packages.

## Audit Track C — Gap implementation

Status: `BLOCKED UNTIL TRACK B CLOSURE AND PHASE AUTHORIZATION`

Runtime implementation begins only after:

- repository discovery is complete for the bounded phase;
- source owners are resolved;
- reusable assets are selected;
- prohibited legacy behavior is identified;
- tests and evidence expectations are explicit;
- the specific phase is separately authorized.

---

# 14. Immediate next bounded task

`CARTERA_AUDIT_002_POLICY_OPERATIONS_RUNTIME_AND_TEST_MATRIX`

Purpose:

For each Policy Operations and legacy Cartera asset proposed for reuse, record:

- path;
- exported API;
- inputs and outputs;
- test coverage;
- current importers and consumers;
- persistence dependency;
- runtime status;
- source owner;
- reuse disposition;
- required adapter or refactor;
- blocking risk.

Exit gate:

No Policy Operations asset may be wired into the Cartera productive runtime merely because its filename exists. Reuse requires inspected behavior, ownership compatibility, tests or an explicit remediation plan.

---

# 15. Decision

Forge will not build Cartera by duplicating the repository's existing engines.

Forge will:

1. prove what already exists;
2. classify what is canonical, adaptable, unsafe or incomplete;
3. reconcile reusable capabilities under existing authorities;
4. build only the missing identity, persistence and orchestration boundaries;
5. prove every productive connection with tests, evidence and closure.
