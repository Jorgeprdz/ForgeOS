# FORGE CARTERA 020B — REMOTE ACCEPTANCE CLOSURE 001

```text
PHASE=CARTERA_020B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
STATUS=CLOSED_REMOTE_ACCEPTED
PROJECT_REF=rmlxigxysujsuwzgoimv
SOURCE_BRANCH=feature/cartera-020b-persistent-evidence-worker-parser-registry
SOURCE_COMMIT=95d03f220670239fc7c2af9ab5799bb21406cbd0
ACCEPTANCE_BRANCH=feature/cartera-020b-remote-acceptance
ACCEPTED_BRANCH_COMMIT=c6f3e87124102a68f03912a6c00b0dd679c51ede
ACCEPTED_PR_MERGE_SHA=0f54e3c33653b2c00f16fc648ab7f8de9f7c0f0f
CURRENT_HEAD=8b6705491dfde02394fcc42098bf0d2dc8054842
CARTERA_020B_COMPLETE=YES
MERGE_PERFORMED=NO
```

## Accepted GitHub Actions evidence

```text
WORKFLOW_RUN=30663283378
WORKFLOW_JOB=91264294890
WORKFLOW_CONCLUSION=SUCCESS
REPOSITORY_TESTS=62
REPOSITORY_PASS=62
REPOSITORY_FAIL=0
ARTIFACT_NAME=cartera-020b-remote-acceptance
ARTIFACT_ID=8805971667
ARTIFACT_SHA256=0f9ed05a298712d4dfb8ee3e57a9c5c0a93ed0d36338cb8e79a8c46e92e27df9
ARTIFACT_RETENTION_DAYS=30
```

## Deployed migration authority

The remote project contains the following exact CARTERA 020B migration chain:

```text
20260731000220_cartera020b_evidence_tables
20260731000221_cartera020b_worker_guards
20260731000222_cartera020b_rls_and_grants
20260731000223_cartera020b_command_helpers
20260731000224_cartera020b_admission_and_claim_rpcs
20260731000225_cartera020b_processing_result_rpc
20260731000226_cartera020b_claim_concurrency_hardening
20260731000227_cartera020b_packet_replay_hardening
20260731000228_cartera020b_conflict_insert_ambiguity_hardening
20260731000229_cartera020b_json_null_payload_hardening
```

Migration history was verified using canonical LF and trailing-newline normalization. Existing remote statements matched their local authorities; deployed history was never rewritten or repaired manually.

## Remote acceptance result

```text
CARTERA_020B_REMOTE_DEPLOYMENT=PASS
CARTERA_020B_TRANSACTIONAL_ACCEPTANCE=PASS
ADMISSION_IDEMPOTENCY=PASS
CHANGED_INPUT_CONFLICT=PASS
LEASE_RECOVERY=PASS
RETRY_RECOVERY=PASS
PACKET_TO_CONFIRMATION_HANDOFF=PASS
PARALLEL_WORKER_CLAIM_SERIALIZATION=PASS
RLS_CROSS_ADVISOR=PASS
DIRECT_WRITES=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
CONCURRENCY_FIXTURES_CLEANED=YES
RESIDUAL_FIXTURES=0
CARTERA_020B_REMOTE_ACCEPTANCE=PASS
```

The transactional harness proved:

- authenticated, owner-scoped Evidence admission;
- exact idempotent replay and durable changed-input conflicts;
- exclusive leases, same-worker replay and expired-lease recovery;
- retry scheduling, due-item reclaim and optimistic state versions;
- attempt, extraction-candidate and pending PolicyEvidencePacket persistence;
- safe `packet_created → confirmation_required` handoff;
- real parallel claim serialization using two concurrent remote requests;
- cross-advisor RLS isolation, anonymous denial and direct-write denial;
- no canonical Person, Policy or PolicyRole creation;
- rollback-clean transactional fixtures and explicit cleanup of committed concurrency fixtures.

## PostgreSQL defects discovered and closed

### 00227 — packet replay hardening

The confirmation transition originally attempted to insert an already persisted packet. An identical non-truth packet is now skipped; changed packet content fails with `CARTERA020B_PACKET_CHANGED_REPLAY`.

### 00228 — conflict insert ambiguity hardening

PL/pgSQL identifier ambiguity in `ON CONFLICT (advisor_id, conflict_reference)` was replaced with the explicit constraint `cartera020b_command_conflicts_advisor_id_conflict_reference_key`.

### 00229 — JSON-null payload hardening

Optional `attempt`, `candidate` and `packet` values are normalized from JSON `null` to SQL `NULL` before validation. No state, RLS or authority boundary was widened.

### Acceptance harness qualification

The final inbox row was remotely proven correct. The acceptance query now qualifies `lease_owner`, `lease_token` and `lease_expires_at` with table alias `i`, preventing collision with PL/pgSQL variables while preserving the rollback transaction.

## Authority boundary preserved

```text
EVIDENCE_BYTES_IN_RELATIONAL_TABLES=FORBIDDEN
RAW_EXTRACTED_TEXT_IN_RELATIONAL_TABLES=FORBIDDEN
PARSER_OUTPUT_BECOMES_POLICY_TRUTH=NO
POLICY_EVIDENCE_PACKET_STATE=PENDING_CONFIRMATION
AUTOMATIC_PERSON_CREATION=FORBIDDEN
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
DIRECT_POLICY_ROLE_WRITE=FORBIDDEN
PRODUCT_UI_MUTATION=NO
```

The deployed authorities persist only Evidence sources, inbox state, append-only transitions, extraction attempts, non-truth candidates, pending-confirmation packets, command receipts and conflicts.

## Trigger safety

The accepted remote workflow was returned to `workflow_dispatch` only immediately after the successful run. All diagnostic workflows are also manual-only. Pull-request or documentation commits cannot repeat remote mutations automatically.

```text
REMOTE_WORKFLOW=MANUAL_ONLY
REMOTE_EXECUTION_FROM_PR=IMPOSSIBLE
CARTERA_020B_COMPLETE=YES
NEXT=INTEGRATE_REMOTE_CLOSURE_INTO_020B_IMPLEMENTATION
```
