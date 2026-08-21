# FORGE CARTERA — LEGACY RUNTIME RECONCILIATION 002

Forge OS  
Architecture Source Truth  
Cartera / Existing Asset Audit / Track A

## Status

`DISCOVERY_ACTIVE / LEGACY_RUNTIME_PASS_COMPLETE / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Purpose

This document closes the first direct call-graph and code inspection pass over the existing Cartera runtime.

It determines:

1. which Cartera implementation is currently connected to the application;
2. which parallel assets are isolated or orphaned;
3. which behavior should be preserved;
4. which truth, persistence and effect assumptions must not be promoted;
5. the bounded reconciliation work required before productive Cartera implementation.

This document does not authorize runtime, route, UI, schema, RLS, database or production mutation.

---

# 1. Executive decision

The repository contains two parallel Cartera implementations.

## Runtime A — connected legacy route

```text
app.js
→ createRouteRegistry(...)
→ cartera route
→ renderCartera / bindCarteraEvents
→ cartera.js
→ legacy quarantined IndexedDB
```

This is the Cartera implementation currently connected to the application route.

Disposition:

`LEGACY_CONNECTED / LEGACY_SURFACE_MIGRATE`

## Runtime B — isolated modular stack

```text
cartera-view.js
cartera-service.js
cartera-state.js
cartera-events.js
cartera-normalizer.js
cartera-validator.js
cartera-import-engine.js
cartera-repository.js
```

This stack contains useful modular behavior, but repository search does not prove a productive application consumer for the view, repository or service stack outside its own internal references.

Disposition:

`FOUNDATION_ORPHANED / DISASSEMBLE_AND_REUSE_BY_CAPABILITY`

## Locked reconciliation decision

Do not choose either implementation as the new canonical Cartera runtime wholesale.

Instead:

1. preserve the connected route and user-visible behavior until replacement parity exists;
2. extract useful normalization, validation, import and UI patterns from the isolated stack;
3. reject quarantined IndexedDB as canonical Person or Policy Truth;
4. replace direct browser event and storage effects with governed domain adapters;
5. migrate vertically behind the existing `cartera` route;
6. remove duplicate surfaces only after parity, tests and evidence.

---

# 2. Productive call graph

## 2.1 Application entrypoint

`app.js` imports:

- `renderCartera` from `./cartera.js`;
- `bindCarteraEvents` from `./cartera.js`.

Those functions are passed into the route registry.

## 2.2 Route registry

`platform/routing/route-registry.js` registers:

```text
cartera: { render: renderCartera, bind: bindCarteraEvents }
```

Therefore the productive route authority is currently `cartera.js`, not `cartera-view.js`.

## 2.3 Current storage path

`cartera.js` reads and writes:

```text
legacy/quarantine/crmaddlife-indexeddb/db.js
→ storage-engine.js
→ IndexedDB database ADDLIFE_CRM_ENTERPRISE
→ object store cartera
```

The store has a generic `id` key and no canonical identity, policy-party, evidence or advisor ownership boundary.

## 2.4 Current cross-module projection

The connected route writes the loaded array into:

```text
AppState.set('cartera', CarteraState.data)
```

The inspected AI context foundation currently reduces a supplied Cartera array to `totalPolizas`. This does not prove canonical cross-domain Cartera consumption.

---

# 3. Connected runtime audit — `cartera.js`

## Disposition

`LEGACY_SURFACE_MIGRATE`

## Useful behavior to preserve

- existing `cartera` navigation route;
- initial load lifecycle;
- search by client or policy number;
- total-policy KPI;
- total-premium display;
- simple payment-date alert count;
- list rendering with bounded initial rows;
- Excel file admission;
- user feedback through toast and confirmation surfaces;
- analytics hooks;
- route mount event;
- destructive delete confirmation.

## Runtime weaknesses

### 3.1 Direct legacy persistence

The route directly calls the quarantined IndexedDB facade for read, save and delete operations.

It bypasses:

- canonical person continuity;
- Policy Truth authority;
- Policy Party roles;
- Event & Evidence;
- provenance;
- advisor scope and RLS;
- review staging;
- human confirmation envelopes;
- conflict and uncertainty states.

### 3.2 Duplicate business logic

The route contains its own:

- text normalization;
- HTML escaping;
- currency formatting;
- date normalization;
- identifier generation;
- Excel row interpretation;
- duplicate check;
- KPI calculation.

This duplicates parallel helpers and engines elsewhere in the repository.

### 3.3 Unsafe Excel import path

The connected Excel importer:

- loads XLSX from a public CDN at runtime;
- reads only the first worksheet;
- accepts a narrow set of exact headers;
- skips rows without client or policy silently;
- treats exact policy-number equality as sufficient duplicate detection;
- creates policy records without identity resolution;
- writes directly to IndexedDB;
- processes batches concurrently;
- does not stage records for item-by-item review;
- does not preserve source coordinates or field provenance;
- does not emit canonical evidence events;
- does not produce a durable error report.

### 3.4 Incorrect alert semantics

The KPI counts any policy whose `fechaPago` is 30 days or less from the current date.

Because negative day differences also satisfy `days <= 30`, old overdue dates remain counted without a separate overdue state or time boundary.

The result is a generic attention count, not a Payment Obligation Ledger projection.

### 3.5 Partial interaction implementation

- `Nueva` only shows a “coming soon” toast.
- `Editar` records the selected ID and shows a toast but does not open a productive edit workflow.
- `Eliminar` performs a hard delete from the browser store.

The current route is therefore a working control/list/import surface, not a complete policy-management runtime.

### 3.6 Destructive delete boundary

A policy record can be deleted directly after a UI confirmation.

The canonical replacement must distinguish:

- evidence deletion restrictions;
- policy archive or supersession;
- erroneous local draft removal;
- cancelled policy truth;
- reversible correction;
- audit events.

`POLICY_DELETE` must not remain a generic browser-store operation.

---

# 4. Isolated modular stack audit

# 4.1 `cartera-view.js`

Disposition:

`LEGACY_UI_FOUNDATION / REUSE_VISUAL_AND_FORM_PATTERNS`

Useful behavior:

- KPI skeleton and update pattern;
- full manual policy form;
- product, frequency and currency controls;
- Excel import surface;
- empty state;
- document-fragment list rendering;
- status presentation.

Blocking facts:

- it is not the view imported by the application route;
- repository search proves no productive consumer beyond its own file;
- it duplicates DOM identifiers used by `cartera.js`;
- product values are hardcoded in the view;
- it cannot be wired beside the current route without collision.

Decision:

Do not activate directly. Use it as a UX and field-discovery source during the productive Cartera UI migration.

# 4.2 `cartera-service.js`

Disposition:

`REUSE_WITH_ADAPTER / DO_NOT_PROMOTE_AS_CANONICAL_SERVICE`

Useful behavior:

- load, get by ID, create, update, delete and bulk-import workflow;
- normalization before validation;
- policy-number duplicate check;
- error collection during bulk import;
- UI loading-state coordination;
- local event emission.

Blocking facts:

- writes to quarantined IndexedDB;
- models the policyholder as a free-text `cliente` field;
- has no canonical person reference;
- has no Policy Party model;
- has no provenance or source evidence;
- hard delete remains available;
- bulk import calls create concurrently in batches and does not provide sequential human review;
- no productive consumer was proven outside the isolated mini-stack.

Decision:

Preserve service method semantics as migration knowledge. Replace persistence and effects with canonical adapters.

# 4.3 `cartera-normalizer.js`

Disposition:

`REFACTOR_FOUNDATION`

Useful behavior:

- sanitizes text;
- normalizes money;
- assigns an identifier;
- normalizes a small legacy policy shape;
- preserves created and updated timestamps.

Blocking facts:

- creates an independent policy ID before identity and source review;
- contains one `cliente` string instead of person and party references;
- omits carrier, policy parties, coverage evidence, effective period, source document, provenance and freshness;
- defaults status to `vigente` without Policy Truth evidence;
- defaults currency to MXN;
- collapses unknown values into empty strings;
- the downstream storage engine overwrites `updatedAt` with a numeric timestamp, producing timestamp-type drift.

Decision:

Reuse sanitization primitives only. Replace the normalized record contract with a staged Policy Evidence Candidate and later confirmed Policy command.

# 4.4 `cartera-validator.js`

Disposition:

`REUSE_AS_FORM_VALIDATION_ONLY`

Current validation:

- requires client, policy number and issue date;
- rejects negative premium and sum assured;
- rejects policy numbers shorter than three characters.

Decision:

This is useful as elementary UI validation. It must never be treated as Policy Truth validation.

Canonical validation still requires:

- source evidence;
- carrier and product resolution;
- policy-number semantics by source;
- effective period;
- party roles;
- conflict detection;
- provenance and confidence;
- completeness states;
- advisor ownership and authorization.

# 4.5 `cartera-events.js`

Disposition:

`REUSE_EVENT_NAMES_WITH_ADAPTER`

Current events:

- `poliza-created`;
- `poliza-updated`;
- `poliza-deleted`;
- `poliza-imported`.

Current transport:

- browser `CustomEvent` dispatched through `window`.

Decision:

The event names are useful migration clues, but the browser event bus is not Event & Evidence.

Required mapping:

```text
legacy local event
→ governed command result
→ append-only canonical event
→ read-model projection
→ optional UI event
```

No local event may claim policy creation, update, deletion or import completion before canonical persistence and evidence confirmation.

# 4.6 `cartera-state.js`

Disposition:

`REUSE_UI_STATE_PATTERN_ONLY`

Current state:

- policies;
- editing ID;
- loading flag.

Decision:

This can inform local view-state design. It must not hold or claim canonical policy truth.

# 4.7 `cartera-import-engine.js`

Disposition:

`REUSE_WITH_ADAPTER`

Useful behavior:

- accent-insensitive and whitespace-insensitive Excel-header normalization;
- alias mapping for client, policy, product, premium, sum assured, issue date, frequency, currency and related legacy fields;
- delegates bulk persistence to a service.

Required reconciliation:

- output a staged intake candidate, not a policy record;
- preserve original row and normalized row;
- preserve worksheet, row and source-file coordinates;
- add identity resolution;
- add Policy Party extraction;
- validate against canonical schema;
- review each record individually before confirmation;
- replace legacy service persistence.

# 4.8 `cartera-repository.js`

Disposition:

`ORPHAN_FOUNDATION / DO_NOT_PROMOTE`

Useful behavior:

- repository abstraction;
- cache and invalidation pattern;
- generic execution wrapper inherited from `BaseRepository`.

Blocking facts:

- repository search found no runtime consumer outside the repository definition;
- it delegates to the same quarantined IndexedDB store;
- it provides no canonical authority, identity or evidence boundary.

Decision:

Reuse repository-pattern knowledge only after canonical persistence ownership is selected.

---

# 5. Source-of-truth reconciliation

## Preserve

- existing route ID `cartera` during migration;
- visible list/search/KPI/import behavior until parity exists;
- Excel header normalization aliases;
- simple form validation as UI validation;
- service workflow concepts;
- repository/cache patterns where appropriate;
- UI loading, empty, error and feedback states;
- analytics intent;
- explicit user confirmation before destructive local draft removal.

## Replace

- quarantined IndexedDB as policy truth;
- free-text client ownership;
- direct hard delete;
- direct bulk persistence;
- browser event bus as domain history;
- exact policy-number-only deduplication;
- implicit `vigente` status;
- generic date alert count;
- public-CDN runtime dependency for canonical ingestion;
- duplicate route and view implementations.

## Build

- canonical Person Resolution command and review surface;
- Policy Evidence Candidate schema;
- confirmed Policy and Policy Party persistence;
- append-only policy events;
- persistent intake queue;
- staged Excel and PDF review;
- Payment Obligation Ledger;
- canonical Cartera read model;
- route adapter behind the existing `cartera` route;
- Future Radar presentation;
- vertical parity tests and migration evidence.

---

# 6. Migration strategy

The productive route must be migrated by vertical capability, not replaced in one cut.

## Slice 1 — Read-only adapter

```text
existing cartera route
→ canonical Cartera read-model adapter
→ legacy IndexedDB compatibility fallback, clearly labeled
```

No new writes.

## Slice 2 — Governed intake

```text
Excel/PDF admission
→ staged candidate
→ identity review
→ policy-party review
→ advisor confirmation
→ canonical persistence
```

Legacy direct import remains disabled once parity is proven.

## Slice 3 — Policy detail and future events

```text
canonical policy facts
→ payment obligations
→ renewals and reviews
→ Future Radar
```

## Slice 4 — Relationship and opportunity signals

```text
canonical evidence
→ reviewed relationship signals
→ Alfred/NBA
→ advisor approval
→ Candy Crush / Pipeline action
```

## Slice 5 — Legacy retirement

Only after tests and evidence prove parity:

- remove direct route dependency on quarantined IndexedDB;
- archive or delete orphaned duplicate implementations under repository governance;
- preserve migration fixtures where useful.

---

# 7. Immediate next audit target

Track A now moves to Policy Document Intake and Policy Operations foundations:

1. `policy-ocr-engine.js`;
2. `policy-ai-parser.js`;
3. `policy-document-classifier.js`;
4. `policy-schema-validator-engine.js`;
5. `policy-normalization-engine.js`;
6. `policy-staging-cache.js`;
7. `policy-batch-processing-engine.js`;
8. their consumers and tests.

The objective is to prove which pieces can form the governed intake pipeline and which are isolated placeholders.

---

# 8. Closure statement

The legacy Cartera runtime pass is complete.

The connected `cartera.js` route is real and must be preserved during migration, but it is not a canonical architecture foundation.

The modular Cartera stack contains useful parts, but it is not the productive route and must not be activated wholesale.

The correct strategy is:

> preserve behavior, replace authority, connect evidence, and retire duplication only after proven parity.
