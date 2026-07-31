# FORGE CARTERA 020B — PERSISTENT EVIDENCE WORKER PROGRESS 001

Forge OS
Architecture Source Truth
Cartera / Document Intake and Identity Resolution

## Status

`REPOSITORY_FOUNDATION_IMPLEMENTED / REMOTE_DEPLOYMENT_NOT_AUTHORIZED / PHASE_NOT_COMPLETE`

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=bb7105e622075a36feae65d8296f93b9e2f7c93d
IMPLEMENTATION_BRANCH=feature/cartera-020b-persistent-evidence-worker-parser-registry
SCHEMA_MUTATION=REPOSITORY_PROPOSAL_ONLY
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Implemented deterministic contracts

- strict provider-neutral extraction envelope;
- extraction statuses `COMPLETE`, `EMPTY`, `FAILED`, `UNSUPPORTED` and `REVIEW_REQUIRED`;
- classification candidates with confidence, matched evidence, competitors and ambiguity;
- policy field candidates preserving raw value, normalized candidate value, confidence, source location, parser identity and unknown/conflict state;
- parser descriptors and deterministic registry resolution by carrier, document type and product;
- explicit `MATCHED`, `AMBIGUOUS`, `UNSUPPORTED`, `UNKNOWN_CARRIER` and `UNKNOWN_PRODUCT` outcomes;
- filename-based parser selection forbidden;
- deterministic worker state with optimistic versioning, leases, retries and changed-input replay rejection;
- sequential batch processing with per-file failure isolation.

## Existing foundation adapters

The implementation reuses rather than replaces existing assets:

```text
policy-ocr-engine.js
→ cartera-020b-pdftotext-adapter.js
→ provider-neutral extraction envelope

EvidenceSource + EvidenceInboxItem
→ cartera-020b-evidence-admission-adapter.js
→ governed admission command

Policy field candidates
→ cartera-020b-policy-packet-adapter.js
→ canonical PolicyEvidencePacket in pending_confirmation
```

The new classifier corrects the legacy policy-first classification defect. A receipt or endorsement mentioning a policy is not automatically classified as a policy, and materially competing signals remain ambiguous.

## Repository persistence proposal

Migration:

`supabase/migrations/20260731000220_cartera020b_persistent_evidence_worker.sql`

Proposed authorities:

- `cartera020b_evidence_sources`;
- `cartera020b_evidence_inbox_items`;
- `cartera020b_evidence_transitions`;
- `cartera020b_extraction_attempts`;
- `cartera020b_extraction_candidates`;
- `cartera020b_policy_evidence_packets`;
- `cartera020b_command_receipts`;
- `cartera020b_command_conflicts`.

Proposed governed commands:

- `forge_cartera020b_admit_evidence(jsonb)`;
- `forge_cartera020b_claim_evidence(text, integer)`;
- `forge_cartera020b_record_processing_result(jsonb)`.

The migration stores SHA-256 document and extracted-text digests plus opaque storage references. It does not store raw document bytes or extracted text in relational tables.

## Persistence behavior

- advisor-bound RLS on every intake authority;
- direct authenticated writes revoked;
- source, transition, attempt, candidate, packet, receipt and conflict history append-only;
- inbox mutation allowed only through the governed command context;
- one source per advisor, digest and purpose;
- admission and processing-result commands have exact idempotency receipts;
- changed-input replay creates a persistent conflict response rather than overwriting state;
- worker claim uses `FOR UPDATE SKIP LOCKED`;
- expired claims are reclaimable;
- retry state preserves count, next retry and error reason;
- every candidate and packet is structurally `creates_truth = false`;
- every packet remains `PENDING_CONFIRMATION`.

## Explicit non-effects

This cut does not:

- deploy the migration to Supabase;
- upload a real document;
- create or merge a CommercialPerson;
- create or update a canonical Policy;
- write PolicyRole rows;
- invoke the confirmed Policy command;
- confirm identity;
- confirm extracted fields;
- modify Cartera UI;
- create payment, compensation, opportunity, task, calendar or message effects.

## Repository acceptance target

```text
NEW_TARGETED_TESTS=31
INHERITED_EVIDENCE_TESTS=9
TOTAL_TARGETED_TESTS=40
EXPECTED_PASS=40
EXPECTED_FAIL=0
```

## Current decision

```text
CARTERA_020B_CONTRACTS=REPOSITORY_READY
CARTERA_020B_ADMISSION_ADAPTER=REPOSITORY_READY
CARTERA_020B_PROVIDER_ADAPTER=REPOSITORY_READY
CARTERA_020B_CLASSIFIER=REPOSITORY_READY
CARTERA_020B_PARSER_REGISTRY=REPOSITORY_READY
CARTERA_020B_DURABLE_WORKER_PROPOSAL=REPOSITORY_READY
CARTERA_020B_REMOTE_DEPLOYMENT=NOT_AUTHORIZED
CARTERA_020B_COMPLETE=NO
NEXT=CARTERA_020B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
```
