# FORGE CARTERA — POLICY DOCUMENT INTAKE RECONCILIATION 003

Forge OS  
Architecture Source Truth  
Cartera / Existing Asset Audit / Track A / Pass 3

## Status

`PASS_3_FIRST_PASS_COMPLETE / TEST_AND_EVIDENCE_SURFACES_CONFIRMED / RUNTIME_MUTATION_NOT_AUTHORIZED`

## Date

2026-07-30

## Purpose

This document reconciles the existing policy-document intake, OCR, evidence, confirmation and Quote Preview PDF surfaces before Cartera builds any new intake runtime.

The pass answers:

1. Which intake components already exist?
2. Which components have tests or documented validation?
3. Which components form the canonical evidence and confirmation backbone?
4. Which older foundations are only extraction helpers or placeholders?
5. What exact bridge remains to be built for Cartera?

This pass is read-only discovery and documentation. It does not authorize source, schema, RLS, database, route, UI or production mutation.

---

# 1. Executive decision

The repository already contains a substantially stronger intake architecture than the first Policy Operations filename inventory suggested.

There are three different layers:

## Layer A — legacy Policy Operations extraction foundations

```text
policy-ocr-engine.js
policy-ai-parser.js
policy-document-classifier.js
policy-schema-validator-engine.js
policy-normalization-engine.js
policy-staging-cache.js
policy-import-queue.js
policy-batch-processing-engine.js
policy-ingestion-orchestrator.js
policy-human-review-engine.js
```

These files contain useful extraction and workflow primitives, but most were moved as a `NO_IMPORTS` cluster and were not proven as a connected productive runtime.

## Layer B — canonical evidence and confirmation foundations

```text
EvidenceSource
→ EvidenceInboxItem
→ EvidenceExtractionCandidate
→ EvidenceInboxRouterContract
→ PolicyEvidencePacket
→ EvidenceConfirmationTask
→ AdvisorConfirmationGate
→ confirmed operational candidate data
```

This layer explicitly preserves:

- source ownership;
- advisor and organization scope;
- received and processing states;
- extracted fields with confidence and source location;
- candidate-not-truth semantics;
- packet-not-truth semantics;
- human confirmation requirements;
- rejection and blocking;
- separation from payment, revenue and payout truth.

This is the canonical backbone Cartera must reuse.

## Layer C — Quote Preview PDF runtime and product parsers

Quote Preview contains a separate, more mature PDF path with:

- product-aware browser PDF routing;
- canonical parser ownership;
- real and smoke tests;
- source-trace and provenance governance;
- preview-versus-truth boundaries;
- documented implementation and QA locks.

This layer is valuable, but its accepted-quote packet and product-specific parsers are not a Policy Evidence Packet and must not become Policy Truth directly.

## Locked decision

> Cartera must not build a new generic intake framework. It must connect existing extraction adapters and product parsers to the existing Evidence Inbox, Policy Evidence Packet and Advisor Confirmation Gate, then insert canonical identity resolution before confirmed Policy persistence.

---

# 2. Test and evidence proof

## 2.1 Tests registered in the repository suite

`tests/run-all-tests.js` includes the following relevant tests:

- `tests/policy-evidence-packet-test.js`;
- `tests/policy-advisor-confirmation-gate-test.js`;
- `tests/evidence-source-test.js`;
- `tests/evidence-processing-status-test.js`;
- `tests/evidence-inbox-item-test.js`;
- `tests/evidence-extraction-candidate-test.js`;
- `tests/evidence-confirmation-task-test.js`;
- `tests/evidence-inbox-scope-gate-test.js`;
- `tests/evidence-inbox-router-contract-test.js`;
- `tests/real-pdf-ocr-test.js`.

Registration in the suite proves intended continuous-test ownership. This pass inspected the relevant source tests but did not rerun the repository test suite.

## 2.2 Verified policy evidence tests

`tests/policy-evidence-packet-test.js` proves:

- extracted fields remain in `EXTRACTED` state;
- Policy Evidence Packets default to `PENDING_CONFIRMATION`;
- an unconfirmed packet is not confirmed truth;
- a confirmed packet is recognized only through explicit confirmation state.

`tests/policy-advisor-confirmation-gate-test.js` proves:

- missing or low-confidence required fields require advisor confirmation;
- advisor edits replace extracted values in confirmed operational data;
- evidence references are preserved;
- rejected evidence cannot be confirmed;
- payment and commission-statement confirmations remain distinct paths.

## 2.3 Verified Evidence Inbox contract tests

The inspected tests prove:

- evidence source, inbox item and extraction candidate do not create truth;
- forbidden truth fields cannot be stored on an inbox item;
- extracted candidates cannot route directly to Revenue;
- unknown document types are blocked for review;
- policy, payment and commission-statement candidates route to different packet contracts;
- only `CONFIRMED` processing state may create operational truth;
- payment candidates require human confirmation before a payment event;
- scope gating separates advisor, authorized operator and manager access;
- the Evidence Inbox contract files do not import UI, dashboard, revenue, commission, database, storage or migration surfaces.

## 2.4 Real OCR test

`tests/real-pdf-ocr-test.js` exercises `policy-ocr-engine.js` against a local real PDF fixture and asserts extraction of product, currency, age and scenario text.

Boundary:

- the test is conditional;
- it skips when the local PDF fixture is unavailable;
- it proves local `pdftotext` extraction behavior, not browser or production OCR availability;
- it does not prove policy classification, policy parsing, identity resolution or persistence.

## 2.5 Documented Quote Preview PDF validation

The Quote Preview program contains documented reconciliation, implementation, QA and decision locks.

R13E documents passing validation for:

- product-aware direct PDF routing;
- Imagina Ser complete and incomplete PDF-text flows;
- Vida Mujer regression preservation;
- parser ownership;
- browser PDF parser smoke tests;
- accepted-quote packet mapping;
- no promotion of missing parser evidence into facts.

The 077A–085D source-truth chain also locks:

- no new extractor before reconciliation;
- `policy-ocr-engine.js` as an extraction candidate;
- parser and preview ownership mapping;
- source-trace and provenance requirements;
- preview output not being Quote Truth;
- real effects and quote writes remaining blocked in the reference registry.

## 2.6 Evidence conclusion

The user hypothesis is confirmed:

> Intake already has tests and documented evidence.

However, those tests cover different layers. They do not yet prove one productive vertical policy-intake flow from uploaded policy PDF through canonical identity and confirmed Policy persistence.

---

# 3. Canonical backbone classification

## 3.1 `evidence-source.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- source types for upload, email, attachment, manual capture, integration and scan;
- received time;
- owner advisor;
- organization;
- filename, MIME type and external reference;
- explicit `createsTruth: false`.

Required Cartera use:

Every admitted Excel or PDF file must first create a valid evidence source. A file without advisor ownership must not enter the productive intake path.

## 3.2 `evidence-inbox-item.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- advisor and organization scope;
- visibility scope;
- processing status;
- document-type candidate;
- warnings and blocked reason;
- explicit prohibition of policy, revenue and payout truth fields.

Required Cartera use:

The persistent intake queue must project Evidence Inbox items rather than invent a separate Cartera-only queue truth.

## 3.3 `evidence-processing-status.js`

Disposition: `REUSE_CANONICAL`

Canonical states:

```text
received
→ classified
→ extraction_candidate_created
→ packet_created
→ confirmation_required
→ confirmed | rejected | blocked | archived
```

Only `confirmed` may create operational truth.

## 3.4 `evidence-extraction-candidate.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- policy, payment, commission and other evidence candidate types;
- OCR, parser, manual prefill, integration and AI-assist sources;
- extracted fields, confidence, warnings and missing fields;
- candidate never creates truth;
- candidate always requires a confirmation path.

Required Cartera use:

OCR and parser output must become an `EvidenceExtractionCandidate`; it must never become a Policy row directly.

## 3.5 `evidence-inbox-router-contract.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- routes a policy candidate to `PolicyEvidencePacket`;
- routes payment and commission evidence to their own packets;
- blocks unknown document types;
- prevents direct Revenue, payment or payout truth.

## 3.6 `policy-evidence-packet.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- evidence and extracted-field states;
- field value;
- confidence;
- source location;
- extraction method;
- packet confirmation state;
- warnings;
- evidence references;
- confirmed operational candidate shape.

Required extension before Cartera implementation:

The policy operational shape must be reconciled with:

- canonical person reference;
- policyholder and insured party candidates;
- beneficiary and payer candidates where available;
- source document hash/reference;
- effective period;
- field-level provenance;
- identity-resolution decision reference;
- conflict and completeness states.

## 3.7 `evidence-confirmation-task.js`

Disposition: `REUSE_CANONICAL`

Useful authority:

- advisor, authorized operator and scoped-manager actors;
- policy, payment and commission confirmation task classes;
- pending, confirmed, rejected and blocked states;
- explicit no-payout-truth boundary.

## 3.8 `policy-advisor-confirmation-gate.js`

Disposition: `REUSE_WITH_ADAPTER`

Useful capability:

- required-field and low-confidence checks;
- advisor edits;
- field confirmation states;
- evidence-reference preservation;
- rejection handling;
- separate policy, payment and commission confirmation paths.

Required reconciliation:

- identity must be resolved before `confirmPolicyExtraction` may lead to Policy persistence;
- required policy fields must be reconciled with the canonical Policy and Policy Party contracts;
- `confirmedBy` and `confirmedAt` must be preserved in the resulting event/audit envelope;
- confirmation creates confirmed operational candidate data, not automatic Policy Truth without the canonical persistence command succeeding.

---

# 4. Legacy extraction-foundation audit

## 4.1 `policy-ocr-engine.js`

Disposition: `REUSE_WITH_ADAPTER`

Current behavior:

- runs `pdftotext` through synchronous Node child process;
- returns `ocr_complete`, `ocr_empty` or `ocr_failed`;
- returns extracted text and source `pdftotext`.

Useful role:

- local/Termux deterministic PDF-text adapter;
- test fixture and fallback extraction path.

Boundaries:

- not browser-compatible;
- not provider-neutral;
- not actual image OCR;
- no file hash;
- no page or source coordinates;
- no MIME or owner scope;
- no timeout or resource envelope;
- synchronous process execution;
- no direct EvidenceSource or EvidenceInbox output.

Canonical role:

`LocalPdftotextExtractionAdapter`, not intake owner.

## 4.2 `policy-ai-parser.js`

Disposition: `DO_NOT_ACTIVATE_AS_CANONICAL_PARSER`

Despite its name, the file is a deterministic regex parser.

Current fields:

- insured/client text;
- broad product text;
- first currency-looking amount;
- policy number.

Blocking issues:

- no carrier ownership;
- no document-type-specific parser selection;
- no confidence;
- no source coordinates;
- no distinction between policyholder and insured;
- first money value may not be premium;
- broad product patterns;
- empty string collapses unknown;
- no warning or missing-field contract.

Reuse:

Individual regex examples may be retained only as fixtures or fallback candidates after product/carrier parser ownership is defined.

## 4.3 `policy-document-classifier.js`

Disposition: `REFACTOR_FOUNDATION`

Current classes:

- policy;
- receipt;
- endorsement;
- unknown.

Blocking classification issue:

The classifier checks `POLIZA` before `RECIBO` and `ENDOSO`. A receipt or endorsement that also mentions a policy may be classified as `policy`.

Required replacement behavior:

- evidence-based multi-signal classification;
- confidence and matched evidence;
- explicit ambiguity;
- no classification solely from filename;
- unknown remains reviewable;
- classification produces a candidate, not truth.

## 4.4 `policy-schema-validator-engine.js`

Disposition: `REUSE_PRIMITIVE_ONLY`

Current behavior:

- checks only whether required keys are `undefined`.

Gaps:

- null and empty values may pass;
- no type, date, enum or numeric validation;
- no source evidence;
- no party roles;
- no carrier/product schema resolution;
- no conflict or completeness state.

## 4.5 `policy-normalization-engine.js`

Disposition: `DO_NOT_PROMOTE`

Blocking behavior:

- creates a new policy UUID before review;
- stores client as free text;
- converts missing premium to zero;
- defaults status to `activa`;
- creates timestamps without source context;
- has no policy parties, evidence, confidence or identity reference.

Only raw-value normalization helpers may be reused.

## 4.6 `policy-staging-cache.js`

Disposition: `REBUILD_BEHIND_EVIDENCE_INBOX`

Useful fields:

- file name and type;
- upload timestamps;
- OCR text;
- parsed data;
- errors.

Blocking facts:

- module-memory array;
- lost on reload;
- no advisor scope;
- no source evidence reference;
- no identity state;
- no retries or lease;
- no durable audit.

The replacement should be a persistent projection of Evidence Inbox state, not a second independent truth store.

## 4.7 `policy-import-queue.js`

Disposition: `REBUILD_BEHIND_EVIDENCE_INBOX`

Useful behavior:

- queue item identity;
- file metadata;
- mutable status.

Blocking facts:

- module-memory array;
- arbitrary status strings;
- no updated time;
- no owner or organization;
- no retry/failure metadata;
- no evidence or candidate reference;
- no scope gate.

## 4.8 `policy-batch-processing-engine.js`

Disposition: `REUSE_WITH_ADAPTER`

Useful behavior:

- intentionally processes files sequentially;
- isolates per-file errors;
- returns a result per input file.

This aligns with the Cartera rule that batch admission may occur while review remains item-by-item.

Required adapter:

- durable Evidence Inbox item per file;
- canonical processing statuses;
- retry and resume;
- advisor scope;
- idempotency;
- no direct persistence of Policy truth.

## 4.9 `policy-ingestion-orchestrator.js`

Disposition: `REFACTOR_FOUNDATION`

Useful flow:

```text
OCR
→ parser
→ validator
→ normalizer
```

Blocking issues:

- no source creation;
- no classification stage;
- no Evidence Inbox item;
- no extraction candidate;
- no packet routing;
- no identity resolution;
- no confirmation task;
- normalizes even when validation fails;
- does not halt or branch on OCR failure/empty result;
- no persistent state or audit;
- no product/carrier parser routing;
- no field-level evidence envelope.

Composition defect:

The orchestrator invokes the validator as `validator({ poliza: parsed })`, while `policy-schema-validator-engine.js` expects `{ schema, metadata }`. The inspected default foundations therefore do not compose directly without an adapter or rewrite.

Canonical role:

Replace with a governed orchestrator that consumes canonical contracts and adapters; do not merely wire the current functions together.

## 4.10 `policy-human-review-engine.js`

Disposition: `REUSE_PRIMITIVE_ONLY`

Useful rule:

- validation errors or review fields require human review.

The canonical decision must additionally consider:

- identity ambiguity;
- party ambiguity;
- low confidence;
- source/provenance gaps;
- sensitive fields;
- document conflicts;
- unknown carrier/product;
- existing-policy conflicts.

---

# 5. Quote Preview reuse boundary

## Reuse

Cartera may reuse or consume:

- PDF extraction ownership decisions;
- file hash and provenance patterns;
- deterministic source-trace contracts;
- product-aware parser routing;
- canonical product parsers;
- real-PDF and smoke-test patterns;
- missing-information handling;
- unknown-product neutrality;
- preview-versus-truth labeling rules.

## Do not reuse as Policy Truth

Cartera must not directly persist:

- accepted-quote packets as policies;
- Quote Preview local/static reference registries as productive sources;
- projected values as confirmed policy fields;
- filename-based product identity;
- parser fallback zeros;
- preview output as issued-policy evidence.

## Required translation

```text
Quote/PDF extraction or product parser output
→ EvidenceExtractionCandidate
→ PolicyEvidencePacket
→ identity and party resolution
→ advisor confirmation
→ confirmed Policy command
```

---

# 6. Productive intake target architecture

```text
file admitted
→ EvidenceSource
→ EvidenceInboxItem: received
→ file hash / provenance
→ document classification candidate
→ EvidenceInboxItem: classified | blocked
→ extraction adapter
→ carrier/product parser router
→ EvidenceExtractionCandidate
→ PolicyEvidencePacket
→ identity-resolution candidates
→ Policy Party candidates
→ EvidenceConfirmationTask
→ advisor confirms, edits, rejects or requests more evidence
→ confirmed Policy command
→ canonical Policy and Policy Party persistence
→ append-only events
→ Cartera read model and Future Radar projection
```

## Non-negotiable ordering

Identity resolution occurs before new person creation and before confirmed Policy persistence.

No parser, OCR result, normalized object, accepted-quote packet or inbox item may bypass:

- evidence packet;
- scope gate;
- identity review;
- human confirmation;
- canonical persistence command.

---

# 7. What is already built versus what remains

## Already built and reusable

- local `pdftotext` extraction adapter;
- real local OCR test;
- sequential batch primitive;
- document-classification foundation;
- Evidence Source contract;
- Evidence Inbox item and scope contract;
- processing-state contract;
- extraction-candidate contract;
- packet routing contract;
- Policy Evidence Packet;
- confirmation task;
- advisor confirmation gate;
- tests for evidence, scope, routing and confirmation;
- Quote Preview product-aware PDF routing;
- product parser ownership and source-trace governance;
- browser PDF smoke and product regression tests.

## Must be adapted

- OCR into provider-neutral extraction envelope;
- product/carrier parser outputs into extracted policy fields;
- document classifier into confidence-based candidate output;
- batch processor into persistent Evidence Inbox orchestration;
- confirmation gate into identity-aware Policy command flow;
- Quote Preview source-trace patterns into policy intake provenance.

## Must be built

- productive file-admission adapter for Cartera;
- durable Evidence Inbox persistence and resumable worker;
- file hash and policy-document provenance bridge;
- policy-document classifier with ambiguity;
- policy parser registry by carrier/document/product;
- canonical Policy Evidence Candidate schema extensions;
- Canonical Person Resolution stage;
- Policy Party candidate and review stage;
- existing-policy conflict/deduplication stage;
- confirmed Policy persistence command;
- append-only policy intake events;
- Cartera review UI;
- vertical integration tests from file admission to confirmed read model.

---

# 8. Test strategy for implementation

The future implementation must not replace existing tests. It must add a vertical suite.

## Preserve

- policy evidence packet tests;
- advisor confirmation gate tests;
- Evidence Inbox contract and scope tests;
- real local OCR test;
- Quote Preview parser ownership and browser PDF tests;
- product parser regression tests.

## Add

1. policy PDF creates EvidenceSource and EvidenceInboxItem;
2. OCR failure produces blocked/review state, not normalized policy;
3. ambiguous receipt/endorsement is not coerced to policy;
4. parser output creates extraction candidate, not truth;
5. packet preserves field source location and confidence;
6. possible existing person creates identity review;
7. no new person is created before resolution;
8. confirmed extraction without identity decision cannot persist Policy;
9. advisor edit is preserved with actor and evidence reference;
10. rejected packet cannot persist;
11. batch continues after one failed file and remains resumable;
12. reload preserves queue and review state;
13. confirmed Policy emits append-only event and appears in Cartera read model;
14. accepted Quote Preview packet cannot bypass policy evidence confirmation.

---

# 9. Pass 3 result

## Confirmed

- The repository has tested and documented intake foundations.
- The canonical backbone is Evidence Inbox + Policy Evidence Packet + Advisor Confirmation Gate.
- The old Policy Operations intake files are mostly adapters or refactor foundations, not the canonical workflow.
- Quote Preview has reusable PDF extraction, routing, provenance and testing work, but remains a separate quote/preview domain.

## Not yet proven

- productive persistent Evidence Inbox runtime;
- productive browser/server policy PDF extraction;
- policy parser registry;
- canonical identity resolution in intake;
- Policy Party extraction and review;
- confirmed Policy persistence;
- full vertical Cartera intake flow.

## Final decision

`PASS_3_POLICY_INTAKE_RECONCILIATION_COMPLETE`

`NO_NEW_GENERIC_INTAKE_FRAMEWORK=YES`

`CANONICAL_BACKBONE=EVIDENCE_INBOX_PLUS_POLICY_EVIDENCE_PACKET_PLUS_ADVISOR_CONFIRMATION_GATE`

`NEXT_AUDIT=POLICY_PERSISTENCE_IDENTITY_AND_PARTY_AUTHORITY`

The next Track A pass must inspect schemas, migrations, RLS, repositories, adapters and tests for Person, Policy and Policy Party persistence before implementation begins.
