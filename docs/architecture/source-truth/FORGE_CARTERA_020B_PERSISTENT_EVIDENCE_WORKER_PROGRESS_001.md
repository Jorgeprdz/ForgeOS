# FORGE CARTERA 020B — PERSISTENT EVIDENCE WORKER PROGRESS 001

Forge OS
Architecture Source Truth
Cartera / Document Intake and Identity Resolution

## Status

`CONTRACTS_ADAPTERS_AND_PERSISTENCE_SCHEMA_IMPLEMENTED / GOVERNED_SQL_COMMANDS_PENDING / REMOTE_DEPLOYMENT_NOT_AUTHORIZED`

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
- confidence-based classification with matched evidence, competitors and ambiguity;
- policy field candidates preserving raw value, normalized candidate value, confidence, source location, parser identity and unknown/conflict state;
- deterministic parser registry by carrier, document type and product;
- explicit `MATCHED`, `AMBIGUOUS`, `UNSUPPORTED`, `UNKNOWN_CARRIER` and `UNKNOWN_PRODUCT` outcomes;
- filename-based parser selection forbidden;
- deterministic worker model with optimistic versioning, leases, retries and changed-input replay rejection;
- sequential batch processing with per-file failure isolation.

## Existing foundation adapters

```text
policy-ocr-engine.js
→ cartera-020b-pdftotext-adapter.js
→ provider-neutral extraction envelope

EvidenceSource + EvidenceInboxItem
→ cartera-020b-evidence-admission-adapter.js
→ governed admission command candidate

Policy field candidates
→ cartera-020b-policy-packet-adapter.js
→ canonical PolicyEvidencePacket in pending_confirmation
```

The classifier corrects the legacy policy-first defect. A receipt or endorsement mentioning a policy is not automatically classified as a policy, and materially competing signals remain ambiguous.

## Repository persistence proposal

```text
20260731000220_cartera020b_evidence_tables.sql
20260731000221_cartera020b_worker_guards.sql
20260731000222_cartera020b_rls_and_grants.sql
```

Proposed owner-scoped authorities:

- `cartera020b_evidence_sources`;
- `cartera020b_evidence_inbox_items`;
- `cartera020b_evidence_transitions`;
- `cartera020b_extraction_attempts`;
- `cartera020b_extraction_candidates`;
- `cartera020b_policy_evidence_packets`;
- `cartera020b_command_receipts`;
- `cartera020b_command_conflicts`.

The schema stores SHA-256 document and extracted-text digests plus opaque storage references. It does not store raw document bytes or extracted text in relational tables.

## Implemented persistence boundaries

- advisor-bound and forced RLS on every intake authority;
- authenticated reads limited to `advisor_id = auth.uid()`;
- all direct authenticated writes revoked;
- source, transition, attempt, candidate, packet, receipt and conflict history append-only;
- inbox mutation requires the governed command context;
- durable lease, retry and optimistic state-version fields;
- one source per advisor, digest and purpose;
- command receipt and changed-input conflict authorities reserved;
- candidates and packets structurally enforce `creates_truth = false`;
- packets structurally remain `PENDING_CONFIRMATION`.

## Deliberately pending SQL command cut

The following `security definer` commands are not yet present and remain the next repository cut:

- `forge_cartera020b_admit_evidence(jsonb)`;
- `forge_cartera020b_claim_evidence(text, integer)`;
- `forge_cartera020b_record_processing_result(jsonb)`.

They must add authentication, exact idempotency receipts, persistent changed-input conflict responses, `FOR UPDATE SKIP LOCKED`, expired-lease recovery and bounded state transitions before any remote deployment is authorized.

## Explicit non-effects

This cut does not:

- deploy migrations to Supabase;
- upload a real document;
- expose a mutation RPC;
- create or merge a CommercialPerson;
- create or update a canonical Policy;
- write PolicyRole rows;
- invoke the confirmed Policy command;
- confirm identity or extracted fields;
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
CARTERA_020B_PERSISTENCE_SCHEMA=REPOSITORY_READY
CARTERA_020B_SQL_COMMANDS=NOT_IMPLEMENTED
CARTERA_020B_REMOTE_DEPLOYMENT=NOT_AUTHORIZED
CARTERA_020B_COMPLETE=NO
NEXT=CARTERA_020B_GOVERNED_PERSISTENCE_COMMANDS
```
