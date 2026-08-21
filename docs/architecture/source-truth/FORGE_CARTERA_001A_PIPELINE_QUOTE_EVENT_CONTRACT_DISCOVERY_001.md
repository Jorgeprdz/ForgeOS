# FORGE CARTERA — 001A PIPELINE, QUOTE AND TIMELINE CONTRACT DISCOVERY 001

Forge OS  
Architecture Source Truth  
Cartera / CARTERA_001 / Subphase A

## Status

`CARTERA_001A_COMPLETE / DISCOVERY_ONLY / CARTERA_001B_READY_FOR_SEPARATE_AUTHORIZATION / NO_RUNTIME_MUTATION`

## Date

2026-07-30

## Source gate

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY
SOURCE_COMMIT=736b845ac516d362262e2b9f5c940f3d38989979
CANONICAL_SOURCE_TRUTH=FORGE_CARTERA_FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK_006.md
RUNTIME_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
UI_MUTATION=NO
```

This phase inspected the current Quote, Pipeline, Prospect Detail, Prospect Timeline and Event & Evidence contracts. It does not authorize `CARTERA_001B` implementation.

---

# 1. Executive finding

The current Quote runtime is functionally useful for local PDF extraction, deterministic calculation, human review and sales-presentation handoff, but it does not yet create a durable Quote lifecycle connected to a known Prospect.

The current productive flow is:

```text
Material 3 Cotizaciones route
→ hidden existing Nueva Cotización functional runtime
→ local browser PDF parser
→ forge.accepted_quote_packet.v1 candidate
→ existing Quote/Product calculation
→ human confirmation
→ in-memory review-only snapshot
→ sales-presentation handoff
```

The current flow stops before:

```text
durable quote identity
→ quote version persistence
→ Prospect link
→ canonical Quote lifecycle event
→ FES append
→ Prospect Timeline projection
→ Prospect Detail quote history
→ application handoff
```

Therefore the precise break is not Quote calculation. It is Quote identity, lifecycle persistence and event projection.

---

# 2. Productive Quote call graph

## 2.1 Material 3 route

`docs/static-preview/forge-alive-material3/quotes-module.js`:

- owns the visible Material 3 presentation;
- fetches the existing `nueva-cotizacion` route;
- imports `[data-forge-module="dedicated-new-quote-static-route"]` as a hidden functional engine;
- observes intake state and accepted-quote events;
- delegates result reconciliation to the existing bridge;
- performs no Quote, Pipeline, Policy, Task, Calendar or backend write.

The UI-M05 authority explicitly protects existing Quote calculations, projections, persistence assumptions, Product Truth and accepted-quote behavior from visual migration changes.

## 2.2 PDF extraction

`docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js`:

- reads PDFs locally in the browser;
- routes ORVI, Segubeca, Imagina Ser and Vida Mujer parsers;
- builds `forge.accepted_quote_packet.v1` candidates;
- preserves product-specific evidence and missing-information states where implemented;
- dispatches `forge:accepted-quote-packet-ready`.

The dispatched packet and event do not establish:

- durable `quote_id`;
- quote version reference;
- Prospect reference;
- CommercialPerson reference;
- lifecycle status authority;
- canonical persistence receipt.

## 2.3 Calculation and human confirmation

`forge-accepted-quote-adapter.js` reuses the existing product/calculation engines.

`forge-accepted-quote-bridge.js`:

- stores the current candidate and calculation in module memory;
- calculates the result before confirmation;
- requires human confirmation;
- writes an immutable review snapshot;
- dispatches `forge:accepted-quote-confirmed`;
- reports the result as saved only for the current session.

The confirmation event contains UI/runtime flags, not durable domain identity or a canonical event receipt.

## 2.4 Review snapshot

`forge-accepted-quote-review-snapshot.js` is a strong reusable boundary for reviewed, immutable and binary-free Quote context.

It is intentionally:

```text
reviewOnly=true
crmMutationAllowed=false
quoteMutationAllowed=false
rawPdfAllowed=false
finalAuthority=HUMAN
```

It is an approved source artifact for a future event bridge. It is not Quote persistence.

---

# 3. Existing Quote contracts to reuse

## 3.1 Quote Read Model 069C

`platform/adapters/quote-read-model/quote-read-model-adapter-069c.js` provides:

- a tested read-only envelope;
- evidence and freshness fields;
- explicit non-binding preview values;
- blocked effects;
- safe empty/error states;
- a `quote_id` shape.

Current limitation:

```text
adapterType=local_static_existing_engine_wrapper
freshness=preview_static
canonicalQuoteTruthClaimed=false
backendConnection=false
browserPersistence=false
```

The current ID is a static preview fixture, not durable Quote identity.

Disposition: `REUSE_ENVELOPE_ONLY` until a productive Quote source exists.

## 3.2 Quote Action Contract 071B

`platform/action-contracts/quote-action-contract-071b.js` already models:

- deterministic payload hashes;
- evidence and freshness requirements;
- idempotency keys;
- rollback requirement;
- approval-required action families;
- payload-changed-after-approval rejection;
- safe errors;
- all real-effect flags defaulted to false.

It includes action-family vocabulary such as:

- `quote.save`;
- `quote.attach_to_opportunity`;
- `quote.convert_to_policy`;
- `quote.send`.

Current limitation:

```text
quote_execution_authorized=false
quoteWrite=false
pipelineWrite=false
backendConnection=false
```

Disposition: `REUSE_CANONICAL_SECURITY_PATTERN`, not lifecycle persistence.

## 3.3 Quote Approval Gate 072B

`platform/action-contracts/quote-approval-gate-integration-072b.js` preserves:

- explicit human approval;
- no inferred approval from preview;
- source evidence;
- freshness;
- payload integrity;
- no AI approval;
- no backend or execution authority.

Current mode is `local_static_no_effect`.

Disposition: `REUSE_WITH_ADAPTER` for future confirmed Quote commands.

## 3.4 Existing persistence discovery

The prior Quote Preview persistence reconciliation explicitly reported:

```text
EXISTING_STORE=null
EXISTING_PERSISTENCE_BRIDGE=null
BRIDGE_RESOLUTION_MODE=NO_PROVEN_PERSISTENCE_BRIDGE
```

Preview caches or session snapshots must not be promoted into Quote Truth.

---

# 4. Pipeline discovery

## 4.1 Live route

`advisor-os/sales-pipeline/pipeline-live-route.js` is the current connected Pipeline route.

It currently:

- mounts the governed Pipeline UI;
- initializes the productive Prospect-scoped Due Action runtime;
- renders an honest empty/partial Pipeline model;
- does not load productive Prospect or Opportunity records;
- does not consume Quote records or Quote events;
- states that full Prospect detail depends on canonical persistence.

Current Pipeline integration point for `CARTERA_001` is therefore a projection boundary, not an existing Quote consumer.

## 4.2 Identity rule

For `CARTERA_001`, the existing Prospect reference remains the stable Sales-domain continuity link.

This phase does not create `CommercialPerson`; that belongs to `CARTERA_010`.

The Quote lifecycle bridge must be forward-compatible with an optional future `CommercialPerson` link without blocking current Prospect continuity.

---

# 5. Prospect Timeline discovery

## 5.1 Durable NFAST-08 authority

The current durable Prospect commercial Timeline already provides:

- Supabase persistence;
- advisor ownership;
- forced RLS;
- RPC-only append;
- append-only protection;
- idempotency;
- evidence references;
- minimized payloads;
- no update or deletion.

Current view and RPC:

```text
VIEW=prospect_commercial_timeline
APPEND_RPC=forge_nfast08_append_prospect_timeline_event
```

## 5.2 Current Quote-adjacent support

NFAST-08 already permits:

```text
PROPOSAL_PRESENTED
payload:
- productReference
- quoteReference optional
```

and:

```text
DECISION_RECORDED
payload:
- decisionCode
- reasonCode optional
```

This is reusable for the commercial meaning of a Quote being presented or a decision being recorded.

## 5.3 Current limitation

NFAST-08 does not model the complete Quote lifecycle:

- Quote created;
- Quote updated;
- Quote recalculated;
- Quote accepted;
- Quote rejected;
- Quote converted to application.

Its advisor append contract also cannot be used as a hidden system writer for all Quote runtime transitions.

Decision:

> Do not overload `PROPOSAL_PRESENTED` or `DECISION_RECORDED` to impersonate every Quote lifecycle state.

NFAST-08 remains the durable Prospect commercial Timeline. The Quote lifecycle authority must publish governed events and then project only their commercial meaning into the Prospect Timeline.

---

# 6. FES discovery

## 6.1 Reusable authority

FES already provides:

- canonical event envelopes;
- evidence references;
- local-first atomic event plus outbox persistence;
- deterministic mutations;
- idempotent replay;
- conflict preservation;
- correction lineage;
- remote RPC-only append;
- forced tenant RLS;
- append-only remote tables.

This operating model must be reused.

## 6.2 Current contract limitation

The current canonical Activity Event contract and remote migration accept only:

```text
PROSPECT
APPOINTMENT
ACTIVITY
DUE_ACTION
```

Current event types do not include Quote lifecycle events.

Although `QUOTE` exists as a source channel in the Activity contract, a channel is not a Quote subject or Quote lifecycle authority.

Decision:

> `CARTERA_001B` must extend or specialize FES-compatible event contracts. It must not create another generic ledger.

---

# 7. Prospect Detail discovery

`platform/event-evidence/prospect-detail-projection.js` currently lists `quotes` as an unsupported section.

The current first vertical supports:

- profile/context;
- appointments;
- due actions;
- activity history;
- truth, conflict and correction states.

The existing projection framework is reusable, especially:

- immutable rebuilds;
- truth-state handling;
- source-event references;
- correction and conflict behavior;
- explicit unsupported states.

Quote history integration belongs to `CARTERA_001C`, after the event bridge exists.

---

# 8. Application handoff discovery

Targeted repository searches did not prove a productive Sales-domain Quote-to-Application handoff or a durable `application_id` linked to the current accepted Quote runtime.

This is a discovery result, not proof that no historical or external application workflow exists.

For the current source commit:

```text
QUOTE_CONVERTED_TO_APPLICATION_RUNTIME=NOT_PROVED
APPLICATION_REFERENCE_CONTRACT=NOT_PROVED
```

`CARTERA_001B` may define the event vocabulary and blocked state, but it must not invent Application Truth. Actual application creation requires its owning authority or a separately ratified contract.

---

# 9. Exact gap map

## Existing and reusable

1. Product-specific PDF parsers and extraction evidence.
2. Accepted Quote packet and deterministic calculation path.
3. Human confirmation UI and review snapshot.
4. Quote Read Model safety/evidence/freshness envelope.
5. Quote Action Contract hash, evidence, idempotency and approval patterns.
6. Quote Approval Gate human-review boundary.
7. FES append-only, local-first, sync, conflict, correction and RLS model.
8. NFAST-08 Prospect Timeline persistence and projection vocabulary.
9. Prospect Detail immutable projection framework.
10. Material 3 Quote route and visible-result adapter.

## Missing

1. Durable Quote identity.
2. Durable Quote version identity.
3. Quote-to-Prospect link.
4. Productive Quote repository or confirmed command.
5. Quote lifecycle event contract.
6. FES-compatible Quote subject/event support.
7. Quote runtime event publisher.
8. Quote-event-to-Prospect-Timeline projection adapter.
9. Prospect Detail Quote section.
10. Productive Pipeline consumption of Quote history.
11. Application handoff contract/runtime.
12. End-to-end continuity tests.

---

# 10. CARTERA_001B recommended scope

## Proposed identifier

`CARTERA_001B_QUOTE_LIFECYCLE_EVENT_BRIDGE`

## Required build

### 10.1 Quote identity contract

A confirmed Quote command/event source requires:

```text
quoteReference
quoteVersionReference
prospectReference
productReference
lifecycleState
effectiveAt
sourceEvidenceReferences
freshness
confirmationState
idempotencyKey
```

Optional future compatibility:

```text
commercialPersonReference
opportunityReference
applicationReference
```

Optional references must remain null/unknown when their authorities do not exist.

### 10.2 Lifecycle vocabulary

Candidate event types:

```text
QUOTE_CREATED
QUOTE_UPDATED
QUOTE_RECALCULATED
QUOTE_PRESENTED
QUOTE_ACCEPTED
QUOTE_REJECTED
QUOTE_CONVERTED_TO_APPLICATION
```

`QUOTE_CONVERTED_TO_APPLICATION` must remain blocked or reference-only until Application authority is proved.

### 10.3 Event separation

Full Quote facts remain under Quote Intelligence.

The event bridge may publish only minimized commercial meaning, references, evidence and state transitions. It must not copy premiums, coverages or calculations into Prospect Timeline as duplicate truth.

### 10.4 Projection path

```text
reviewed Quote source artifact
→ Quote Action/Confirmation boundary
→ durable Quote command or identity receipt
→ FES-compatible Quote lifecycle event
→ Prospect commercial Timeline adapter
→ Prospect Detail projection in 001C
```

---

# 11. Allowed paths for a separately authorized 001B

Recommended bounded paths:

```text
platform/event-evidence/quote-*
platform/action-contracts/quote-*
platform/adapters/quote-read-model/*
docs/static-preview/quote-preview-live/forge-accepted-quote-bridge.js
advisor-os/sales-pipeline/prospect-timeline/quote-*
tests/cartera-001b-*
docs/evidence/CARTERA_001B_*
docs/architecture/source-truth/FORGE_CARTERA_001B_*
```

Existing files may be touched only when required to attach a governed adapter hook.

Blocked paths unless separately authorized:

```text
product calculation engines
product-intelligence truth files
Policy schemas or persistence
CommercialPerson schemas
Pipeline visual redesign
Prospect Detail UI integration
Supabase remote deployment
Application runtime
message/send providers
```

Schema or migration work, if required for FES Quote subject support, must be explicitly declared in the separate `001B` authorization. It is not authorized by this discovery.

---

# 12. Required tests for 001B

1. Every lifecycle event validates the required references and states.
2. Preview calculation never emits `QUOTE_ACCEPTED`.
3. Human confirmation is required before accepted/rejected decision events.
4. A stable Quote and version reference are required before append.
5. Prospect ownership mismatch is blocked.
6. Duplicate event replay is idempotent.
7. Same event ID with different payload creates a conflict, not silent overwrite.
8. Corrections preserve append-only lineage.
9. Full Quote numeric truth is not copied into the Prospect Timeline.
10. Missing, stale or conflicted evidence remains visible.
11. Application conversion remains blocked without Application authority.
12. No Policy, task, calendar, message or send effect occurs.
13. Existing Quote calculation and Product Intelligence regression tests remain green.
14. Existing FES and NFAST-08 tests remain green.

---

# 13. 001A decision

```text
CARTERA_001A_STATUS=COMPLETE
QUOTE_CALCULATION_REBUILD_REQUIRED=NO
NEW_GENERIC_EVENT_LEDGER_REQUIRED=NO
QUOTE_READ_MODEL_ENVELOPE_REUSABLE=YES
QUOTE_ACTION_CONTRACT_PATTERN_REUSABLE=YES
QUOTE_APPROVAL_GATE_PATTERN_REUSABLE=YES
FES_OPERATING_MODEL_REUSABLE=YES
PROSPECT_TIMELINE_REUSABLE=YES
DURABLE_QUOTE_IDENTITY_EXISTS=NO_PROOF
DURABLE_QUOTE_PERSISTENCE_EXISTS=NO_PROOF
QUOTE_TO_PROSPECT_LINK_EXISTS=NO_PROOF
FULL_QUOTE_LIFECYCLE_EVENTS_EXIST=NO
PROSPECT_DETAIL_QUOTE_SECTION_EXISTS=NO
QUOTE_TO_APPLICATION_HANDOFF_EXISTS=NO_PROOF
CARTERA_001B_READY_FOR_SEPARATE_AUTHORIZATION=YES
CARTERA_001B_IMPLEMENTATION_AUTHORIZED=NO
```

Starting `CARTERA_001B` requires an explicit task pinned to an exact source commit, with declared schema/runtime mutation flags, allowed paths, tests, evidence path and closure document.