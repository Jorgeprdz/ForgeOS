# FORGE CARTERA 020A — POLICY INTAKE ADAPTER SCOPE 001

Forge OS
Architecture Source Truth
Cartera / Document Intake and Identity Resolution

## Status

`SCOPE_LOCKED / IMPLEMENTATION_NOT_STARTED`

## Date

2026-07-31

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_020A_POLICY_INTAKE_ADAPTER_SCOPE
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=e8eebac5c8215a25fc918e8d46c1a30034b0e3da
IMPLEMENTATION_BRANCH=docs/cartera-020a-policy-intake-adapter-scope
CANONICAL_SOURCE_TRUTH=FORGE_CARTERA_FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK_006.md
INHERITED_010D_GATE_RETIREMENT=BOUNDED
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
RUNTIME_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Purpose

Lock the exact reusable contracts, adapter boundaries, state model, persistence responsibilities, privacy rules, negative gates and acceptance requirements for `CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY`.

This phase does not implement file upload, OCR, parsing, queue persistence, workers, identity review, Policy creation or Cartera UI.

---

# 1. Dependency gate

`CARTERA_020A` starts only after the accepted Cartera Point 1 control base.

Verified source contains:

- durable `CommercialPerson` and source-identity links;
- durable `CommercialAccount` and memberships;
- canonical Policy, PolicyRole, evidence, version and conflict persistence;
- identity-resolution decision persistence;
- governed confirmed Policy command;
- advisor-bound RLS;
- Policy events, Timeline and productive read model;
- unified Person, Account and Policy directory;
- accepted remote and browser evidence.

```text
CARTERA_010D_COMPLETE=YES
CARTERA_POINT_1_CONTROL_BASE=COMPLETE
CARTERA_020A_AUTHORIZED=YES
```

---

# 2. Canonical decision

> Cartera must not build a new generic intake framework.

The productive intake path must connect extraction adapters and parser registries to the existing Evidence backbone, then place canonical identity and PolicyRole review before the existing confirmed Policy command.

```text
file admission
→ EvidenceSource
→ EvidenceInboxItem
→ EvidenceExtractionCandidate
→ EvidenceInboxRouterContract
→ PolicyEvidencePacket
→ identity and PolicyRole candidates
→ EvidenceConfirmationTask
→ Advisor Confirmation Gate
→ governed confirmed Policy command
```

No step before the governed confirmed Policy command creates Policy Truth.

---

# 3. Required reuse map

## Canonical Evidence Inbox backbone — `REUSE_CANONICAL`

- `policy-operations/evidence-inbox/evidence-source.js`
- `policy-operations/evidence-inbox/evidence-inbox-item.js`
- `policy-operations/evidence-inbox/evidence-processing-status.js`
- `policy-operations/evidence-inbox/evidence-extraction-candidate.js`
- `policy-operations/evidence-inbox/evidence-inbox-router-contract.js`
- `policy-operations/evidence-inbox/evidence-confirmation-task.js`

Required preserved semantics:

- advisor and organization ownership;
- visibility scope;
- source metadata and receipt time;
- candidate-not-truth;
- explicit blocked and review states;
- no direct Revenue, payment, commission or payout truth;
- only confirmed processing may proceed toward operational truth.

## Canonical policy evidence and confirmation — `REUSE_WITH_ADAPTER`

- `policy-operations/evidence/policy-evidence-packet.js`
- `policy-operations/policy-advisor-confirmation-gate.js`

Required preserved semantics:

- extracted field state;
- confidence;
- source location;
- extraction method;
- packet confirmation state;
- warnings and missing fields;
- advisor edits;
- rejection;
- evidence references;
- actor and confirmation time.

Required adapter additions:

- source document digest and immutable evidence reference;
- canonical identity-resolution decision reference;
- candidate person/account references;
- PolicyRole candidates;
- existing-policy conflict candidate;
- completeness and conflict state;
- explicit command boundary before Policy persistence.

## Existing extraction foundations

### `REUSE_WITH_ADAPTER`

- `policy-operations/evidence/policy-ocr-engine.js` as local `pdftotext` extraction adapter only;
- `policy-operations/evidence/policy-batch-processing-engine.js` for sequential per-file isolation only.

### `REFACTOR_FOUNDATION`

- `policy-operations/evidence/policy-document-classifier.js`;
- `policy-operations/evidence/policy-ingestion-orchestrator.js`.

### `REUSE_PRIMITIVE_ONLY`

- `policy-operations/evidence/policy-schema-validator-engine.js`;
- `policy-operations/evidence/policy-human-review-engine.js`.

### `DO_NOT_PROMOTE`

- `policy-operations/evidence/policy-ai-parser.js` as canonical parser;
- `policy-operations/evidence/policy-normalization-engine.js`;
- module-memory staging cache or import queue as durable truth.

The current normalizer must never create a Policy UUID, default unknown premium to zero, default status to active or collapse all parties into free text.

---

# 4. 020B bounded construction scope

`CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY` may build only the deterministic foundation below.

## 4.1 Persistent admission

Each admitted file must produce:

- stable admission reference;
- advisor owner;
- organization when applicable;
- original filename;
- MIME type;
- byte size;
- received timestamp;
- SHA-256 document digest;
- immutable EvidenceSource reference;
- idempotency key;
- EvidenceInboxItem reference.

The same advisor, digest and admission purpose must not silently create duplicate active inbox items.

## 4.2 Provider-neutral extraction envelope

Every extraction adapter must return an envelope containing:

```text
provider
providerVersion
method
status
sourceDigest
pageCount | null
text | null
warnings[]
errors[]
startedAt
completedAt
```

Minimum statuses:

- `COMPLETE`;
- `EMPTY`;
- `FAILED`;
- `UNSUPPORTED`;
- `REVIEW_REQUIRED`.

Extraction output is evidence candidate material, never Policy Truth.

## 4.3 Classification candidate

Classification must produce:

- candidate document type;
- confidence;
- matched evidence;
- competing candidates;
- ambiguity state;
- warnings;
- reviewer requirement.

Minimum document types:

- `POLICY`;
- `RECEIPT`;
- `ENDORSEMENT`;
- `UNKNOWN`.

A document containing both policy and receipt/endorsement signals must not be coerced to `POLICY` without explicit evidence and review.

## 4.4 Parser registry

Parser resolution must use declared dimensions:

```text
carrier
documentType
product
parserId
parserVersion
```

Resolution outcomes:

- `MATCHED`;
- `AMBIGUOUS`;
- `UNSUPPORTED`;
- `UNKNOWN_CARRIER`;
- `UNKNOWN_PRODUCT`.

Filename alone cannot select carrier, product or parser.

Parser output must become an `EvidenceExtractionCandidate`, preserving per-field:

- raw value;
- normalized candidate value;
- confidence;
- page/source location when available;
- extraction method;
- parser identity and version;
- warnings;
- missing state;
- conflict state.

Unknown values remain unknown. They must not become empty strings, zero, active status or guessed currency.

## 4.5 Durable worker and resumable batch

The worker must process one EvidenceInboxItem at a time and preserve per-item isolation.

Required worker properties:

- durable state;
- lease/claim ownership;
- retry count;
- next retry time;
- failure reason;
- last transition time;
- idempotent transition command;
- safe resume after process restart;
- batch continues after one item fails;
- no batch-level automatic confirmation.

Batch admission may accept several files, but review remains one item at a time.

## 4.6 Canonical processing states

020B must preserve the existing Evidence processing authority:

```text
received
→ classified
→ extraction_candidate_created
→ packet_created
→ confirmation_required
→ confirmed | rejected | blocked | archived
```

020B may add worker-operational metadata, but must not create a competing business state machine.

---

# 5. Candidate boundary for 020C

020B may prepare, but must not resolve or persist, the following review candidates:

- possible existing `CommercialPerson` matches;
- new-person proposal;
- `CommercialAccount` match proposal;
- Policyholder candidate;
- insured-party candidates;
- beneficiary candidates when available;
- payer/owner candidates when available;
- PolicyRole candidate set;
- existing-policy duplicate/conflict candidate;
- missing evidence;
- low-confidence fields;
- sensitive fields.

`CARTERA_020C` owns the productive identity/party review, Advisor Confirmation Gate integration, deduplication decision, confirmed Policy command invocation and Cartera review UI.

020B must not invoke the confirmed Policy command.

---

# 6. Privacy and security lock

Required:

- every source, inbox item, candidate, packet and worker claim is advisor/tenant scoped;
- raw document content is never placed in general Cartera directory entries;
- beneficiary and other restricted-party data remains restricted;
- logs redact document content, email, phone, tax identifiers and tokens;
- artifacts use synthetic fixtures only unless an explicit secure acceptance task authorizes otherwise;
- direct cross-advisor reads are denied;
- storage references are opaque and scope checked;
- file type, size and processing resource limits fail closed.

No intake scope implies consent to contact, commercial opportunity creation or external action.

---

# 7. 020B allowed mutation paths

The 020B implementation task must declare a tighter list derived from these roots:

```text
policy-operations/evidence-inbox/**
policy-operations/evidence/**
policy-operations/intake/**
platform/policy-intelligence/intake/**
schemas/cartera-020b-*.schema.json
supabase/migrations/*cartera020b*.sql
tests/cartera-020b-*.mjs
tests/*evidence*-test.js
scripts/ci/cartera-020b-*.mjs
docs/architecture/source-truth/FORGE_CARTERA_020B_*.md
docs/evidence/FORGE_CARTERA_020B_*.md
.github/workflows/cartera-020b-*.yml
```

Blocked without separate authorization:

- `cartera.js`;
- Pipeline and Quote runtime;
- payment and compensation runtime;
- Calendar, Candy Crush, Mi Día, NASH or NBA runtime;
- unrelated migrations;
- `main`;
- production deployment configuration.

---

# 8. Schema and remote mutation decision

020A authorizes no schema or remote mutation.

020B may propose repository migrations for durable Evidence Inbox and worker persistence only when:

- existing persistence is first proven insufficient;
- advisor-bound RLS is explicit;
- append-only evidence/history boundaries are preserved;
- migration tests exist;
- no remote mutation occurs in the same repository-construction cut;
- remote deployment receives a separate acceptance authorization.

```text
CARTERA_020A_SCHEMA_MUTATION=NO
CARTERA_020A_SUPABASE_REMOTE_MUTATION=NO
CARTERA_020B_REPOSITORY_SCHEMA_PROPOSAL=CONDITIONALLY_AUTHORIZED
CARTERA_020B_SUPABASE_REMOTE_MUTATION=NO
```

---

# 9. Required 020B tests

Preserve and rerun the existing Evidence tests, including:

- `tests/evidence-source-test.js`;
- `tests/evidence-processing-status-test.js`;
- `tests/evidence-inbox-item-test.js`;
- `tests/evidence-extraction-candidate-test.js`;
- `tests/evidence-confirmation-task-test.js`;
- `tests/evidence-inbox-scope-gate-test.js`;
- `tests/evidence-inbox-router-contract-test.js`;
- `tests/policy-evidence-packet-test.js`;
- `tests/policy-advisor-confirmation-gate-test.js`;
- `tests/real-pdf-ocr-test.js` when its fixture is available.

Add targeted 020B tests proving:

1. file admission creates scoped EvidenceSource and EvidenceInboxItem candidates;
2. identical admission is idempotent;
3. digest/provenance is preserved;
4. OCR empty/failure blocks or requests review and creates no Policy;
5. ambiguous classification remains ambiguous;
6. unsupported carrier/product remains unsupported/unknown;
7. parser fields preserve confidence and source location;
8. unknown premium, currency and status remain unknown;
9. worker transitions are idempotent;
10. expired claims may be safely resumed;
11. one failed batch item does not stop later items;
12. reload preserves queue state;
13. no source, candidate or packet invokes Policy persistence;
14. cross-advisor access fails closed.

---

# 10. Global negative gates

020B must not:

- create or merge a person automatically;
- create a Policy automatically;
- invoke the confirmed Policy command;
- write PolicyRole rows;
- overwrite an existing Policy candidate silently;
- promote parser output into Policy Truth;
- infer payment, commission, payout or revenue truth;
- default unknown facts;
- classify solely from filename;
- process an unscoped source;
- expose restricted parties in general projections;
- create tasks, calendar events, messages, opportunities or recommendations;
- redesign Cartera UI;
- execute remote Supabase mutation.

---

# 11. 020A exit gate

```text
SOURCE_COMMIT_VERIFIED=YES
REUSE_MAP_COMPLETE=YES
CANONICAL_EVIDENCE_BACKBONE=LOCKED
PROVIDER_ENVELOPE=LOCKED
CLASSIFICATION_AMBIGUITY=LOCKED
PARSER_REGISTRY_BOUNDARY=LOCKED
RESUMABLE_BATCH_BOUNDARY=LOCKED
IDENTITY_BEFORE_CREATION=LOCKED
CONFIRMED_POLICY_COMMAND_BYPASS=FORBIDDEN
PRIVACY_AND_RLS_BOUNDARY=LOCKED
020B_ALLOWED_PATH_ROOTS=LOCKED
020B_REQUIRED_TESTS=LOCKED
INHERITED_010D_GATE_RETIREMENT=BOUNDED
SCHEMA_MUTATION=NO
SUPABASE_REMOTE_MUTATION=NO
RUNTIME_MUTATION=NO
UNAUTHORIZED_EFFECTS=NONE
CARTERA_020A_COMPLETE=YES
NEXT=CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY
```
