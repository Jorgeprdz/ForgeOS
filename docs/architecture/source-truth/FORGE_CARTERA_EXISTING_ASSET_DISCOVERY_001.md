# FORGE CARTERA — EXISTING ASSET DISCOVERY 001

Forge OS  
Architecture Source Truth  
Cartera / Relationship Intelligence Existing Runtime Discovery

## Status

`DISCOVERY_COMPLETE / DOCUMENTATION_ONLY / NO_RUNTIME_MUTATION`

## Date

2026-07-30

## Purpose

This document identifies what already exists in ForgeOS for Cartera, what may be reused after reconciliation, what is only a preview or architectural placeholder, what must not be promoted, and what still has to be built.

The purpose is to prevent a new implementation agent from rebuilding existing engines or treating legacy, preview, local-only or heuristic code as production truth.

## Architectural Objective

> Help the advisor sell 30% more without working 30% more.

## Official Relationship Principle

> Forge does not administer clients or policies as isolated records. Forge administers relationships, understands their context and anticipates their evolution so the advisor can invest time where it creates the greatest value.

## Executive Decision

Forge is not starting Cartera from zero.

The repository already contains:

- a productive Supabase-backed prospect identity and Pipeline service;
- duplicate prevention by normalized phone, WhatsApp and email;
- a governed prospect commercial Timeline with authenticated read and append paths;
- Event & Evidence ledger and deterministic Pipeline, Prospect Detail and Mi Día projections;
- an advanced quote PDF extraction, calculation, human-confirmation and accepted-review flow;
- seventy-seven Policy Operations engines covering import, queue, batch processing, staging, OCR, parsing, validation, review, policy detail, policy timeline, renewals and tasks;
- legacy relationship, health, opportunity, referral, engagement and review engines;
- Compensation candidate-calculation and Rule Pack infrastructure;
- Alfred review-action packets and a safe UI view-model pattern.

However, those assets do not have one uniform maturity level.

The correct strategy is:

```text
reuse productive authority
+ reconcile useful legacy engines
+ replace unsafe implementations
+ build missing canonical repositories and ledgers
+ compose them as Cartera
```

The incorrect strategy is:

```text
build another CRM
or
connect every existing engine directly because a file already exists
```

---

# 1. Asset Classification

## Class A — Productive or production-shaped authority

These assets are the strongest existing foundations and should be reused rather than replaced.

### Productive Prospect Service

Files:

- `advisor-os/sales-pipeline/productive-prospect-service.js`
- `supabase/migrations/20260718000100_067g17b_productive_prospect_crud.sql`

Existing capabilities:

- authenticated Supabase persistence;
- immutable prospect identity;
- advisor ownership and RLS boundaries;
- normalized phone, WhatsApp and email;
- unique active-contact indexes;
- duplicate lookup before creation;
- create, list, detail, update and archive;
- audit events for prospect create, update and archive;
- lifecycle status includes `client` without creating another person.

Decision:

`REUSE_AS_CANONICAL_PERSON_CONTINUITY`

Do not create a second client identity table as the default Cartera identity source.

### Prospect Identity Contract

File:

- `advisor-os/sales-pipeline/prospect-identity-contract.js`

Existing capabilities:

- canonical prospect identity reference;
- foreign identities represented as references rather than replacements;
- source lineage;
- evidence references;
- verified fact, user note, source claim and model interpretation boundaries.

Decision:

`REUSE_AND_EXTEND_WITH_IDENTITY_RESOLUTION_REVIEW`

### Prospect Commercial Timeline

Files:

- `advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-contract.js`
- `advisor-os/sales-pipeline/prospect-timeline/prospect-timeline-service.js`
- Supabase view `prospect_commercial_timeline`
- RPC `forge_nfast08_append_prospect_timeline_event`

Existing capabilities:

- authenticated Timeline reads;
- governed append through RPC;
- idempotency handling;
- evidence references;
- no direct insert, update or delete;
- proposal presentation and decision events;
- appointment, objection, conversation and follow-up events.

Decision:

`REUSE_AS_IMMEDIATE_QUOTE_TO_PERSON_HISTORY_PATH`

### Event & Evidence Foundation

Files:

- `platform/event-evidence/canonical-activity-event-contract.js`
- `platform/event-evidence/activity-ledger-contract.js`
- `platform/event-evidence/canonical-activity-timeline-contract.js`
- `platform/event-evidence/activity-projection.js`
- `platform/event-evidence/prospect-detail-projection.js`
- `platform/event-evidence/pipeline-card-projection.js`
- `platform/event-evidence/mi-dia-projection.js`

Existing capabilities:

- append-only event semantics;
- evidence, provenance, confirmation and privacy states;
- correction chains;
- deterministic projections;
- conflict visibility;
- one-prospect scope enforcement.

Current limitation:

The first Event & Evidence vertical does not yet model Quote, Policy or Payment as canonical subject families, and Prospect Detail explicitly marks `quotes` as unavailable.

Decision:

`REUSE_FOUNDATION / EXTEND_ONLY_THROUGH_SEPARATE_GOVERNED_CONTRACT`

Do not casually add policy or payment facts to the first-vertical Activity contract.

### Quote PDF and Human Confirmation Flow

Primary files:

- `docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js`
- `docs/static-preview/quote-preview-live/forge-accepted-quote-review-snapshot.js`
- `docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js`
- `platform/adapters/quote-preview/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b.js`
- Product-specific Quote parsers and Product Intelligence adapters.

Existing capabilities:

- real PDF selection;
- browser text extraction;
- file hash and provenance work;
- product-specific parsing;
- deterministic calculation;
- automatic preview calculation without automatic acceptance;
- explicit human confirmation;
- accepted quote review snapshot;
- browser events such as `forge:accepted-quote-confirmed`;
- presentation handoff.

Current limitation:

The accepted quote is session-local, review-only and not durably related to `prospect_id` in the inspected bridge.

Decision:

`REUSE_PARSER_CALCULATION_REVIEW_AND_CONFIRMATION / BUILD_DURABLE_PERSON_BRIDGE`

---

## Class B — Real reusable legacy engines requiring reconciliation

These files contain useful business logic and workflow structure, but they are not production authority by file existence alone.

### Policy Operations Inventory

Migration evidence:

- `docs/07-runtime/MIGRATION-004_POLICY_OPERATIONS_DEPENDENCY_SAFETY.md`
- `docs/07-runtime/MIGRATION-004_POLICY_OPERATIONS_EXECUTION_REPORT.md`

The migration moved seventy-seven Policy Operations files into:

- `policy-operations/client-records/`
- `policy-operations/evidence/`
- `policy-operations/policy-detail/`
- `policy-operations/policy-timeline/`
- `policy-operations/renewals/`
- `policy-operations/tasks/`

### Reusable intake workflow assets

Files include:

- `policy-operations/policy-detail/drag-drop-policy-zone.js`
- `policy-operations/evidence/policy-import-queue.js`
- `policy-operations/evidence/policy-batch-processing-engine.js`
- `policy-operations/evidence/policy-staging-cache.js`
- `policy-operations/evidence/policy-staging-status-engine.js`
- `policy-operations/evidence/policy-ingestion-orchestrator.js`
- `policy-operations/evidence/policy-human-review-engine.js`
- `policy-operations/evidence/policy-import-dashboard-engine.js`
- `policy-operations/evidence/policy-import-progress-engine.js`
- `policy-operations/evidence/policy-import-errors-engine.js`
- `policy-operations/evidence/policy-import-summary.js`
- `policy-operations/evidence/policy-import-metrics-engine.js`
- `policy-operations/policy-detail/policy-review-ui-engine.js`

Existing useful behavior:

- accepts multiple dropped files;
- converts the dropped `FileList` into an array;
- maintains an import queue;
- processes files sequentially with `for...of` and `await`;
- stages parsed data, OCR text and errors;
- composes OCR, parser, validator and normalizer dependencies;
- decides when human review is required;
- produces import counters and editable-preview field models.

Decision:

`REUSE_WORKFLOW_SHAPE_AND_HARDEN`

### Policy extraction assets

Files include:

- `policy-operations/evidence/policy-ocr-engine.js`
- `policy-operations/evidence/policy-ai-parser.js`
- `policy-operations/evidence/policy-document-classifier.js`
- `policy-operations/evidence/policy-document-engine.js`
- `policy-operations/evidence/policy-schema-validator-engine.js`
- `policy-operations/policy-detail/policy-normalization-engine.js`
- `policy-field-confidence-map.js`

Existing useful behavior:

- PDF text extraction foundation;
- policy, receipt and endorsement classification;
- basic insured, product, premium and policy-number parsing;
- dynamic required-field validation;
- per-field confidence concept.

Current limitations:

- OCR uses local Node `pdftotext` and is not a browser or production backend contract;
- parser coverage is minimal regex logic;
- supported products and carriers are incomplete;
- field provenance and page/source coordinates are not complete;
- beneficiaries, policy parties, payment terms, coverage and effective periods are not comprehensively modeled;
- field confidence is not sufficient identity or policy truth.

Decision:

`REUSE_INTERFACES / REPLACE_PARSER_IMPLEMENTATION_WITH_REGISTRY_AND_PROVENANCE`

### Policy detail and operations assets

Files include:

- `policy-operations/policy-detail/policy-detail-engine.js`
- `policy-operations/policy-detail/policy-status-engine.js`
- `policy-operations/policy-detail/policy-detail-alert-engine.js`
- `policy-operations/policy-detail/policy-operational-center-engine.js`
- `policy-operations/policy-detail/policy-search-engine.js`
- `policy-operations/policy-detail/policy-filter-engine.js`
- `policy-operations/policy-detail/policy-smart-sort-engine.js`
- `policy-operations/policy-detail/policy-financial-summary-engine.js`
- `policy-operations/policy-detail/policy-validation-engine.js`
- `policy-operations/policy-detail/policy-workspace-engine.js`

Existing useful behavior:

- policy detail composition;
- status normalization;
- payment, renewal, commission-document and cancellation alerts;
- policy operational-center projection;
- search, filter, sort and summary helpers.

Decision:

`REUSE_AS_CANDIDATE_DOMAIN_LOGIC_BEHIND_GOVERNED_ADAPTERS`

### Policy renewal assets

Files:

- `policy-operations/renewals/policy-renewal-engine.js`
- `policy-operations/renewals/policy-renewal-status-engine.js`
- `policy-operations/renewals/renewal-intelligence-engine.js`

Existing useful behavior:

- detects policies within a future renewal window;
- derives days remaining;
- combines renewal proximity, contact inactivity and pending-payment counts.

Current limitations:

- uses wall-clock `new Date()` directly;
- uses ungoverned numeric risk scoring;
- does not preserve source, evaluation clock, confidence or official/local boundary;
- does not generate a payment-obligation ledger.

Decision:

`REUSE_DATE_AND_REASON_LOGIC / REBUILD_AS_DETERMINISTIC_EXPLAINABLE_PROJECTION`

### Policy timeline assets

Files:

- `policy-operations/policy-timeline/policy-timeline-engine.js`
- `policy-operations/policy-timeline/policy-timeline-event.factory.js`
- `policy-operations/policy-timeline/policy-timeline-query-engine.js`
- `policy-operations/policy-timeline/policy-timeline-view-model.js`
- `policy-operations/policy-timeline/policy-timeline.repository.js`

Existing useful behavior:

- policy event and view-model concepts.

Current limitation:

The inspected repository helper mutates plain arrays and permits event deletion. It is not the append-only Event & Evidence authority.

Decision:

`REUSE_EVENT_TAXONOMY_IDEAS_ONLY / DO_NOT_REUSE_MUTABLE_REPOSITORY`

### Relationship Intelligence assets

Primary files:

- `relationship-master-engine.js`
- `relationship-timeline-engine.js`
- `relationship-next-action-engine.js`
- `relationship-opportunity-engine.js`
- `relationship-health-engine.js`
- `referral-opportunity-engine.js`
- `life-event-engine.js`
- `client-engagement-engine.js`
- `relationship-review-engine.js`

Existing useful behavior:

- composes relationship history, policies and events;
- identifies review, protection, cross-sell and referral candidates;
- identifies payment, renewal and inactivity risk factors;
- suggests timing and review actions;
- provides a useful orchestration shape.

Current limitations:

- several engines use opaque or semi-opaque scores;
- some rules infer protection gaps from absence of a detected policy;
- some rules convert a life event into a commercial opportunity;
- some outputs recommend asking for referrals based on inferred satisfaction or trust;
- source, freshness, consent, uncertainty and evidence state are not consistently required.

Authority:

- `adr/ADR-011 — Relationship Intelligence Non-Manipulation Boundary.txt`

Decision:

`REUSE_AS_CANDIDATE_SIGNAL_LIBRARY_ONLY`

Every promoted signal must be rewritten to preserve:

- source;
- owner;
- period;
- freshness;
- uncertainty;
- consent state;
- evidence state;
- human review;
- no manipulation.

### Compensation assets

Primary areas:

- `compensation/partner-manager/`
- `compensation/advisor-development/`
- `compensation/new-professional/`
- `docs/evidence/COMPENSATION_COMMERCIAL_SCOPE_2026_CLOSURE.md`

Existing useful behavior:

- Rule Pack loaders and validators;
- explicit required-input validation;
- candidate-calculation status families;
- explainability structures;
- missing-input blocking;
- `payoutTruth=false` boundary;
- commission-statement evidence requirement;
- initial and renewal commercial bonus candidates.

Current limitation:

The implemented scopes calculate Partner, Advisor Development and New Professional commercial compensation candidates. They are not a general policy-by-policy advisor commission ledger driven by every client payment, product, policy year and payment frequency.

Decision:

`REUSE_RULE_PACK_INFRASTRUCTURE_AND_EXPLAINABILITY / BUILD_POLICY_COMMISSION_RULE_FAMILY`

### Alfred assets

Primary files:

- Alfred review-action packet contracts and read models;
- `manager-os/alfred-review-action-packet-ui-view-model.js`;
- corresponding source-truth closures and tests.

Existing useful behavior:

- safe display-only action cards;
- review CTA;
- no automatic provider action;
- explicit no CRM write, no message send and no calendar creation flags;
- packet families for memory, referral, calendar drafts, product, message and follow-up.

Decision:

`REUSE_ACTION_PACKET_AND_REVIEW_UI_PATTERN`

---

## Class C — Preview-only shims

These assets must not be mistaken for real Cartera, Pipeline or Policy persistence.

### Client CRM Read-Only Adapter 065B

File:

- `platform/adapters/client-crm/client-crm-read-only-adapter-065b.js`

Decision lock:

- `docs/architecture/source-truth/FORGE_CLIENT_CRM_READ_ONLY_ADAPTER_DECISION_LOCK_065D.md`

Facts:

- local static fixture only;
- contains Lariza and Octavio preview records;
- no backend connection;
- no CRM write;
- not source-of-truth CRM data.

Decision:

`REUSE_ENVELOPE_SAFETY_AUDIT_PATTERN_ONLY`

### Opportunity Pipeline Read-Only Adapter 066B

Files:

- `platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js`
- `docs/architecture/source-truth/FORGE_OPPORTUNITY_PIPELINE_EXISTING_MODULE_RECONCILIATION_066B1.md`

Facts:

- temporary local/static shim;
- real opportunity engines exist separately;
- no canonical source mapping has been completed.

Decision:

`REUSE_ENVELOPE_PATTERN_ONLY`

### Policy Read Model Adapter 068B

File:

- `platform/adapters/policy-read-model/policy-read-model-adapter-068b.js`

Facts:

- local static fixture only;
- dates, premium and payment state remain unknown or not modeled;
- `canonicalPolicyTruthClaimed=false`;
- no backend connection.

Decision:

`REUSE_ENVELOPE_PATTERN_ONLY`

---

## Class D — Assets that must not be promoted

### Automatic policy approval

File:

- `policy-operations/policy-detail/policy-auto-approval-engine.js`

Current behavior:

- returns automatic approval when average field confidence reaches 95.

Decision:

`DO_NOT_PROMOTE`

Cartera requires human confirmation before identity linking and policy truth persistence.

### Browser localStorage policy auto-save

File:

- `policy-operations/policy-detail/policy-auto-save-engine.js`

Current behavior:

- writes imported policy data directly to `localStorage`.

Decision:

`DO_NOT_PROMOTE_FOR_POLICY_PII`

A production staging store must respect authentication, tenant ownership, retention and privacy controls.

### In-memory policy storage

File:

- `policy-operations/policy-detail/policy-storage-engine.js`

Current behavior:

- stores policy records in a module-level array.

Decision:

`TEST_OR_PROTOTYPE_ONLY`

### Legacy IndexedDB Cartera service

Files:

- `cartera-service.js`
- `cartera-import-engine.js`
- related root Cartera state, validator and event modules;
- quarantined CRMADDLIFE IndexedDB dependency.

Existing useful behavior:

- policy-number duplicate check;
- normalize, validate, create, update, delete and mass import concepts;
- Excel header mapping.

Current limitations:

- depends on quarantined IndexedDB;
- represents policy records as a disconnected Cartera database;
- creates, updates and deletes mutable records outside canonical Event & Evidence;
- does not preserve the existing prospect identity as the person authority;
- mass import processes batches concurrently rather than the desired one-by-one human review;
- no Policy Truth, evidence or RLS boundary.

Decision:

`DO_NOT_RECONNECT_AS_PRODUCTION_SERVICE`

Reuse only normalization, validation, header-mapping and duplicate-policy-number ideas after contract review.

### Opaque relationship and policy scores

Files include:

- `relationship-opportunity-engine.js`
- `referral-opportunity-engine.js`
- `policy-operations/policy-detail/policy-risk-engine.js`
- `policy-operations/renewals/renewal-intelligence-engine.js`

Decision:

`DO_NOT_PROMOTE_SCORE_AS_TRUTH`

Replace opaque score authority with evidence-backed reason codes, explicit uncertainty and governed priority consumption.

---

# 2. Capability-by-Capability Decision

## 2.1 One person from Pipeline through Cartera

### Already exists

- stable prospect UUID in Supabase;
- immutable prospect identity;
- `client` lifecycle status;
- normalized contact fields;
- duplicate prevention indexes;
- duplicate lookup before prospect creation;
- prospect identity source and evidence contract.

### Reuse

- Productive Prospect Service;
- Prospect Identity Contract;
- existing prospect UUID as continuity reference.

### Build

- identity-resolution candidate service for document intake;
- candidate ranking using normalized name, phone, WhatsApp, email, date of birth, recent appointment, quote/product context and referral context;
- explanation of each match reason;
- advisor decision: link, inspect, create another person or leave unresolved;
- auditable and reversible identity-resolution decision record;
- multi-party policy relationship model for policyholder, insured, beneficiary and payer.

### Do not build

- a second default `clients` identity table disconnected from prospects.

---

## 2.2 Quote history inside Pipeline

### Already exists

- accepted Quote candidate and calculation;
- explicit human confirmation;
- accepted review snapshot;
- product and source evidence;
- browser acceptance event;
- Timeline supports proposal presentation and decision records;
- Prospect Detail is a deterministic Timeline projection.

### Reuse

- accepted quote snapshot boundary;
- Quote extraction and calculation;
- `PROPOSAL_PRESENTED` with `quoteReference`;
- `DECISION_RECORDED` for accepted or rejected outcomes;
- Prospect Timeline service and RPC;
- Prospect Detail projection architecture.

### Build

- durable `quote_id` or canonical quote reference;
- explicit `prospect_id` binding before confirmation;
- idempotent Quote-to-Timeline bridge;
- persisted quote version/status metadata;
- quote summary projection in Prospect Detail;
- latest quote summary projection in Pipeline card only when useful;
- historical retrieval after the browser session ends.

### Separate later contract

A full Quote event family such as created, recalculated, revised and converted should be added only if the existing proposal/decision contract cannot preserve required history without duplicating Quote Intelligence truth.

---

## 2.3 Policy PDF intake and mass review

### Already exists

- drag and drop multiple files;
- queue;
- staging cache;
- sequential batch processor;
- import dashboard and progress concepts;
- OCR/parser/validator/normalizer orchestration;
- document classification;
- human review decision;
- editable preview field model;
- Quote PDF browser extraction and source provenance foundation.

### Reuse

- drop-zone event handling;
- sequential queue semantics;
- staging lifecycle;
- dependency-injected ingestion orchestrator;
- review-required logic;
- PDF.js/browser extraction infrastructure from Quote Preview;
- file hash, source trace and parser ownership patterns;
- import metrics and error summaries.

### Build or replace

- production policy-document extraction boundary;
- carrier/product parser registry;
- canonical Policy Intake Candidate schema;
- field-level provenance and confidence;
- extraction for policy number, company, product, policyholder, insured parties, beneficiaries, effective period, issue date, premium, currency, frequency, payment method, coverage and sum assured;
- real authenticated staging repository;
- one-by-one review workspace;
- corrected-field evidence and reviewer attribution;
- final confirmed persistence to Policy authority;
- unsupported-document and unresolved-document states.

### Explicitly forbidden

- automatic final approval;
- unreviewed bulk persistence;
- PII in localStorage;
- treating parser confidence as Policy Truth.

---

## 2.4 Cartera control base

### Already exists

- productive person source;
- static client/policy read-envelope patterns;
- policy detail, status, search, filter, sort and workspace helpers;
- policy-number duplicate concept;
- policy/client summary helpers.

### Reuse

- productive prospect repository;
- read-model envelope and safety pattern from 065B and 068B;
- policy detail and operational-center composition;
- search/filter/sort helpers after normalization.

### Build

- canonical Policy repository and schema;
- policy-party relationship table;
- source-document/evidence table;
- real Cartera read model combining person, policies, roles, next dates and relationship context;
- RLS and tenant ownership;
- manual policy entry fallback;
- append-only corrections or governed updates;
- real list/detail adapter replacing fixtures.

---

## 2.5 Payment schedule and payment truth

### Already exists

- policy frequency fields in legacy policy models;
- renewal-date calculations;
- payment-pending alert inputs;
- policy status and risk helpers;
- Conservation architecture defines `PAYMENT_POSTED`, `POLICY_PAID`, cancellation and reinstatement facts.

### Not found as production runtime

- no canonical payment-obligation ledger;
- no authenticated payment repository;
- no schedule generator producing monthly, quarterly, semiannual or annual obligations;
- no confirmed-payment append path;
- no payment correction/reversal ledger.

### Build

- Payment Obligation contract;
- deterministic schedule generator;
- policy-year calculator;
- expected, detected, confirmation-required, confirmed, partial, overdue, corrected, reversed and cancelled states;
- payment evidence references;
- advisor confirmation workflow;
- correction and reversal events;
- 7-, 30- and 90-day projections;
- linkage to Activity, Conservation and Compensation.

---

## 2.6 Renewal and future radar

### Already exists

- renewal detection window;
- days-remaining calculation;
- renewal/payment/contact alert concepts;
- policy risk and operational-center concepts;
- Relationship Health recognizes payment, renewal, review and inactivity signals;
- Conservation architecture defines local predictive vs institutional confirmed states.

### Reuse

- date-window logic;
- alert reason categories;
- operational-center projection shape;
- Conservation ownership and snapshot boundaries.

### Build

- deterministic evaluation clock;
- evidence-backed reason codes;
- confirmed fact vs scheduled event vs inference vs recommendation labeling;
- policy and portfolio future read model;
- risk signal freshness and expiration;
- advisor-facing explanation: what may happen, why, uncertainty and minimum useful action.

---

## 2.7 Relationship memory and relationship graph

### Already exists

- complete prospect Timeline foundation;
- relationship engine family;
- ADR-011 non-manipulation authority;
- ADR-0026 candidate declaring the Relationship Graph a primary commercial asset.

### Not implemented as canonical graph

ADR-0026 explicitly states that it does not implement the graph.

### Reuse

- Timeline events and context references;
- relationship engine orchestration concepts;
- ADR-011 source, freshness, uncertainty, consent and non-manipulation rules;
- referral and engagement signal categories after review.

### Build

- canonical relationship-edge contract and repository;
- household, family, company, partner, referrer, referred-person and center-of-influence hypothesis relationships;
- evidence and consent on each edge;
- effective period, freshness and correction history;
- relationship memory projection;
- governed signal adapter replacing direct legacy-engine execution.

---

## 2.8 Growth, second sale and centers of influence

### Already exists

- relationship opportunity detector;
- referral opportunity detector;
- policy review signals;
- protection-gap candidate rules;
- opportunity Pipeline signal engines;
- NBA Reason Why boundary;
- Alfred review-action packet and UI view model.

### Reuse

- signal categories;
- explanation/action-packet structures;
- NBA prioritization and Reason Why boundary;
- Alfred review packet UI;
- Pipeline as owner of advisor-confirmed commercial opportunity.

### Build

- governed Relationship Signal Candidate contract;
- evidence, freshness, consent and uncertainty requirements;
- non-manipulative center-of-influence signal;
- second-policy review signal;
- advisor confirmation before opening a new Pipeline opportunity;
- Pipeline opportunity-creation bridge with source relationship evidence;
- feedback event indicating accepted, dismissed, deferred or incorrect recommendation.

### Replace

- automatic life-event sales trigger;
- automatic referral request instruction;
- opaque relationship score authority;
- absence-of-policy treated as confirmed protection diagnosis.

---

## 2.9 Candy Crush relational activation

### Already exists

- Candy Crush is defined in Advisor Experience architecture;
- Advisor Experience may consume Revenue, Productivity, Conservation and Command signals;
- Alfred review action cards and safe view-model patterns exist;
- Mi Día deterministic action projection exists.

### Current maturity

- Candy Crush remains architecture candidate, not an implemented relational activation runtime;
- Alfred packets are review-only and no-effect;
- Mi Día currently consumes governed Activity work and explicitly does not own Alfred recommendations.

### Build

- relational action-card producer;
- low-activity eligibility input from Productivity/Mick authority;
- bounded action classes such as confirm payment, prepare renewal, schedule review, thank referrer and strengthen a center of influence;
- NBA priority reference;
- minimum useful action;
- advisor accept, dismiss, defer and complete events;
- no generic volume inflation;
- no direct message, call or calendar execution without the appropriate approval path.

---

## 2.10 Email payment detection

### Repository discovery result

No domain-specific Gmail or inbox payment-confirmation runtime was found in the searched ForgeOS source paths.

Existing connector, delivery and action-gate architecture may be reused, but it does not currently provide Cartera payment-email interpretation.

### Build

- connected-email read boundary;
- least-privilege search scope;
- payment-email candidate classifier;
- policy/person matching;
- amount, date, currency, period and reference extraction;
- evidence reference without uncontrolled raw-message promotion;
- advisor confirmation;
- duplicate email/payment detection;
- correction and rejection states;
- no autonomous payment truth.

---

## 2.11 Commission connection

### Already exists

- Compensation Rule Pack infrastructure;
- candidate-calculation engines;
- initial and renewal bonus concepts;
- missing-input blocking;
- explainability;
- `payoutTruth=false`;
- official statement evidence requirement.

### Build

- payment-confirmed-to-compensation event adapter;
- policy-level commission input contract;
- product, policy year, paid premium, frequency, payment date and rule snapshot references;
- policy commission Rule Pack family;
- initial vs renewal commission interpretation;
- monthly, quarterly, semiannual and annual payment handling;
- reversal, adjustment and correction handling;
- candidate vs official statement comparison;
- commission discrepancy alert.

### Boundary

Cartera confirms the reviewed payment fact.

Compensation calculates and explains the candidate commission.

An official statement remains payment truth.

---

## 2.12 Conservation

### Already exists

- `PAQ-10.5-CONSERVATION-INTELLIGENCE-ARCHITECTURE-LOCK.md`;
- ownership, event, snapshot, local predictive and institutional historical boundaries.

### Current maturity

The architecture lock explicitly states conceptual architecture only: no code, engines, schemas or implementation.

### Build later

- Policy Conservation Snapshot runtime;
- Portfolio Conservation Snapshot runtime;
- local predictive risk adapter;
- official report ingestion;
- correction and late-report handling;
- rule-backed LIMRA, IGC and persistency formulas only when official evidence exists.

Cartera may surface Conservation outputs but must not calculate Conservation formulas itself.

---

## 2.13 Productivity proof

### Already exists

- import metrics concepts;
- productivity and advisor experience architectures;
- compensation and conservation boundaries;
- event evidence foundation.

### Build

- capture time avoided;
- policies imported and reviewed;
- duplicate identities prevented;
- payments detected and confirmed;
- renewals attended;
- commissions surfaced;
- warm opportunities reviewed;
- advisor actions accepted, deferred and completed;
- production per advisor hour;
- attribution rules that avoid claiming causality without evidence.

---

# 3. Revised Implementation Sequence

## `CARTERA_000A_EXISTING_ASSET_DISCOVERY`

Status:

`CLOSED_BY_THIS_DOCUMENT`

Outcome:

- existing productive authorities identified;
- seventy-seven Policy Operations assets identified;
- preview-only shims separated from production assets;
- unsafe assets explicitly blocked;
- missing canonical ledgers and repositories identified.

## `CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`

Reuse:

- Productive Prospect Service;
- Prospect Timeline Service;
- accepted quote confirmation event;
- accepted quote review snapshot;
- `PROPOSAL_PRESENTED` and `DECISION_RECORDED`;
- Prospect Detail projection.

Build:

- durable quote reference;
- prospect binding;
- idempotent Timeline bridge;
- Quote history projection.

## `CARTERA_010_CANONICAL_PORTFOLIO_READ_MODEL_AND_POLICY_REPOSITORY`

Reuse:

- person authority;
- read-model envelopes;
- policy detail/search/filter/summary helpers.

Build:

- Policy schema and repository;
- policy-party and document evidence relations;
- Cartera list/detail read model;
- RLS and real adapters.

## `CARTERA_020_POLICY_INTAKE_RECONCILIATION_AND_IDENTITY_RESOLUTION`

Reuse:

- drag/drop;
- queue;
- sequential batch;
- staging;
- ingestion orchestrator;
- review UI model;
- Quote PDF browser parser and provenance patterns.

Build or replace:

- Policy parser registry;
- production OCR/text extraction boundary;
- Policy Intake Candidate;
- field provenance;
- identity-resolution candidate and human review;
- authenticated staging and confirmed persistence.

## `CARTERA_030_PAYMENT_OBLIGATION_LEDGER_AND_POLICY_CALENDAR`

Reuse:

- frequency and renewal concepts;
- date-window and alert reason logic.

Build:

- payment schedule generator;
- obligation ledger;
- payment fact and correction events;
- policy-year calculation;
- future calendar projections.

## `CARTERA_040_RELATIONSHIP_GRAPH_AND_MEMORY_RECONCILIATION`

Reuse:

- prospect Timeline;
- relationship engine signal categories;
- ADR-011.

Build:

- graph repository;
- evidence-backed edges;
- relationship memory read model;
- governed signal adapter.

## `CARTERA_050_FUTURE_RADAR_AND_CONSERVATION_ADAPTER`

Reuse:

- policy alerts and renewal reasons;
- relationship health categories;
- Conservation architecture.

Build:

- future radar projection;
- local predictive risk adapter;
- fact/schedule/inference/recommendation labels;
- eventual Conservation runtime in its own authority.

## `CARTERA_060_GOVERNED_RELATIONSHIP_GROWTH_SIGNALS`

Reuse:

- opportunity categories;
- NBA Reason Why;
- Alfred review packets.

Build:

- governed signal candidate contract;
- center-of-influence and second-review signals;
- advisor-confirmed Pipeline opportunity bridge.

## `CARTERA_070_CANDY_CRUSH_RELATIONAL_ACTIVATION`

Reuse:

- Alfred action-card view model;
- Mi Día work projection;
- Advisor Experience architecture.

Build:

- low-activity relational action producer;
- acceptance and completion feedback;
- bounded minimum useful actions.

## `CARTERA_080_EMAIL_PAYMENT_AND_COMPENSATION_CONNECTION`

Reuse:

- connector and approval boundaries;
- Compensation Rule Pack infrastructure.

Build:

- email evidence adapter;
- payment candidate matcher;
- human confirmation;
- policy commission Rule Pack family;
- discrepancy comparison.

## `CARTERA_090_RELATIONSHIP_CAPITAL`

Reuse:

- relationship graph and referral signal categories after reconciliation.

Build:

- relationship-capital projections without opaque authority scores;
- prior introduction and center-of-influence evidence;
- relationship-strengthening recommendations.

## `CARTERA_100_PRODUCTIVITY_PROOF_AND_LEARNING`

Reuse:

- Event & Evidence;
- import metrics concepts;
- Productivity and Advisor Experience ownership boundaries.

Build:

- measurable work avoided, income protected and growth opportunity outcomes;
- evidence-backed attribution;
- recommendation usefulness feedback.

---

# 4. Immediate Engineering Decision

The next implementation remains:

`CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`

It is the correct first vertical because it uses the strongest productive assets already present:

```text
productive prospect identity
+ accepted quote confirmation
+ governed Timeline append
+ Prospect Detail projection
```

It does not require building Cartera UI, Policy schema, OCR, Payment Ledger, email or Compensation first.

Its success proves the central architectural promise:

> The person does not restart when a quote is created or accepted. Forge keeps feeding the same relationship history.

---

# 5. Final Reuse Rule

For every Cartera phase, Codex or any implementation agent must classify each candidate asset before using it:

- `PRODUCTIVE_AUTHORITY`
- `REUSABLE_GOVERNED_COMPONENT`
- `LEGACY_RECONCILIATION_REQUIRED`
- `PREVIEW_FIXTURE_ONLY`
- `ARCHITECTURE_ONLY`
- `FORBIDDEN_TO_PROMOTE`
- `MISSING_AND_MUST_BUILD`

A file name containing `engine`, `service`, `adapter`, `AI`, `policy`, `CRM`, `relationship`, `payment` or `commission` is not proof that the capability is production-ready.

The implementation agent must preserve:

- authority;
- evidence;
- provenance;
- freshness;
- uncertainty;
- consent;
- idempotency;
- human confirmation;
- no duplicate identity;
- no automatic sales or payment truth;
- no reconstruction of an existing engine without discovery.

The Cartera program is therefore a governed reconciliation and composition program, not a greenfield CRM build.
