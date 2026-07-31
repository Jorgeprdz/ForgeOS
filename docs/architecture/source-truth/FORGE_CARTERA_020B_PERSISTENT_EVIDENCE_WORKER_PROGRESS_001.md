# FORGE CARTERA 020B — PERSISTENT EVIDENCE WORKER PROGRESS 001

Forge OS
Architecture Source Truth
Cartera / Document Intake and Identity Resolution

## Status

`GOVERNED_REPOSITORY_FOUNDATION_ACCEPTED / REMOTE_DEPLOYMENT_NOT_AUTHORIZED / PHASE_NOT_COMPLETE`

## Execution identity

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
AUTHORIZED_PHASE=CARTERA_020B_PERSISTENT_EVIDENCE_WORKER_AND_PARSER_REGISTRY
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=bb7105e622075a36feae65d8296f93b9e2f7c93d
IMPLEMENTATION_BRANCH=feature/cartera-020b-persistent-evidence-worker-parser-registry
GOVERNED_COMMAND_IMPLEMENTATION_HEAD=c68f2d2d07bfdd924e08f68fc884aa59de94956a
FINAL_DOCUMENTED_VALIDATION_HEAD=dc0188e3c94e17336c80d77c7fddc3541076dea0
FINAL_PR_TRIGGER_HEAD=d6fba78dc2065a3779d763135784bccee7459c9d
SCHEMA_MUTATION=REPOSITORY_PROPOSAL_ONLY
SUPABASE_REMOTE_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Implemented deterministic contracts

- strict provider-neutral extraction envelope;
- extraction statuses `COMPLETE`, `EMPTY`, `FAILED`, `UNSUPPORTED` and `REVIEW_REQUIRED`;
- classification candidates with confidence, matched evidence, competitors and ambiguity;
- policy field candidates preserving raw value, normalized candidate value, confidence, source location, parser identity and unknown/conflict state;
- deterministic parser registry by carrier, document type and product;
- filename-based parser selection forbidden;
- worker state with optimistic versions, leases, retries and per-file batch isolation;
- canonical EvidenceSource, EvidenceInboxItem and pending PolicyEvidencePacket adapters.

## Durable repository proposal

Migrations:

```text
20260731000220_cartera020b_evidence_tables.sql
20260731000221_cartera020b_worker_guards.sql
20260731000222_cartera020b_rls_and_grants.sql
20260731000223_cartera020b_command_helpers.sql
20260731000224_cartera020b_admission_and_claim_rpcs.sql
20260731000225_cartera020b_processing_result_rpc.sql
20260731000226_cartera020b_claim_concurrency_hardening.sql
```

Durable authorities:

- Evidence sources and Inbox items;
- append-only transitions and extraction attempts;
- non-truth extraction candidates;
- pending-confirmation Policy evidence packets;
- exact idempotency receipts;
- persistent changed-input replay conflicts.

The Inbox `metadata` column defect found during command construction was corrected before remote deployment.

## Governed commands

### `forge_cartera020b_admit_evidence(jsonb)`

- requires an authenticated owner-matched actor;
- validates a strict versioned contract;
- computes the command digest server-side;
- locks idempotency and advisor/digest/purpose keys;
- persists source, Inbox item, initial transition and receipt atomically;
- identical replay returns the original response;
- changed-input replay writes a durable conflict;
- duplicate document digest and purpose returns `ALREADY_ADMITTED` without duplicating rows;
- stores hashes and opaque references, never raw bytes.

### `forge_cartera020b_claim_evidence(text, integer)`

- validates worker identity and a 30–3600 second lease;
- serializes claim calls for each advisor/worker pair with an advisory transaction lock;
- returns an active claim for the same worker as replay;
- uses `LIMIT 1 FOR UPDATE SKIP LOCKED` for concurrent workers;
- claims available, due-retry or expired-lease items;
- increments optimistic state version;
- appends a claim transition;
- creates no business truth.

### `forge_cartera020b_record_processing_result(jsonb)`

- checks replay before requiring the prior lease;
- requires owner, worker, lease token and exact state version;
- rejects expired or mismatched claims;
- enforces the existing Evidence status transition authority;
- persists attempts, candidates and packets transactionally;
- validates source digest and blocks raw-document payload keys;
- keeps candidate and packet rows structurally `creates_truth = false`;
- keeps packets `PENDING_CONFIRMATION`;
- schedules retries with bounded exponential delay;
- always clears the lease after a recorded result;
- persists transition and receipt atomically.

## Privacy and authority boundary

- forced advisor RLS remains enabled on every table;
- direct authenticated writes remain revoked;
- public callers receive only the three bounded security-definer RPCs;
- raw PDF bytes and extracted text are not persisted in relational tables;
- no RPC writes `CommercialPerson`, canonical Policy or PolicyRole;
- no RPC invokes the confirmed Policy command;
- no payment, compensation, task, calendar, message or opportunity effect exists.

## Repository acceptance

```text
IMPLEMENTATION_WORKFLOW_RUN=30658372819
IMPLEMENTATION_WORKFLOW_JOB=91248342949
DOCUMENTED_VALIDATION_RUN=30658439643
DOCUMENTED_VALIDATION_JOB=91248561094
FINAL_PR_TRIGGER_RUN=30658587135
FINAL_PR_TRIGGER_JOB=91249056171
NEW_TARGETED_TESTS=43
NEW_TARGETED_PASS=43
INHERITED_EVIDENCE_TESTS=9
INHERITED_EVIDENCE_PASS=9
TOTAL_TARGETED_TESTS=52
TOTAL_TARGETED_PASS=52
TOTAL_TARGETED_FAIL=0
SOURCE_COMMIT_VERIFIED=YES
BOUNDED_PATHS=PASS
PRODUCT_UI_DIFF=NONE
SUPABASE_REMOTE_MUTATION=NONE
WORKFLOW_TRIGGER=PULL_REQUEST_AND_MANUAL_ONLY
```

This acceptance is repository and static-contract evidence. It does not prove PostgreSQL compilation, transactional behavior, RLS execution or production readiness.

## Current decision

```text
CARTERA_020B_CONTRACTS=REPOSITORY_READY
CARTERA_020B_ADMISSION_ADAPTER=REPOSITORY_READY
CARTERA_020B_PROVIDER_ADAPTER=REPOSITORY_READY
CARTERA_020B_CLASSIFIER=REPOSITORY_READY
CARTERA_020B_PARSER_REGISTRY=REPOSITORY_READY
CARTERA_020B_PERSISTENCE_SCHEMA=REPOSITORY_READY
CARTERA_020B_SQL_COMMANDS=REPOSITORY_READY
CARTERA_020B_REMOTE_DEPLOYMENT=NOT_AUTHORIZED
CARTERA_020B_COMPLETE=NO
NEXT=CARTERA_020B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
```