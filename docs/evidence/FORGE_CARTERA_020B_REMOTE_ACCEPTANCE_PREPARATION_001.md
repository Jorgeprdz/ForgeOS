# FORGE CARTERA 020B — Remote Acceptance Preparation 001

## Status

```text
PHASE=CARTERA_020B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
SOURCE_BRANCH=feature/cartera-020b-persistent-evidence-worker-parser-registry
SOURCE_COMMIT=95d03f220670239fc7c2af9ab5799bb21406cbd0
ACCEPTANCE_BRANCH=feature/cartera-020b-remote-acceptance
REMOTE_GATE=REPOSITORY_PREPARATION
SUPABASE_REMOTE_MUTATION=NOT_RUN
CARTERA_020B_COMPLETE=NO
```

This cut prepares the remote gate. It does not deploy a migration, call the Supabase Management API, create a remote fixture or authorize mutation by implication.

## Pre-deployment defect closed

Static traversal of the real state machine exposed a blocked handoff:

```text
extraction_candidate_created
→ packet_created
→ confirmation_required
```

`forge_cartera020b_record_processing_result(jsonb)` requires the packet payload for both of the final transitions. The original insert path would therefore try to insert the same `PolicyEvidencePacket` twice and the unique candidate constraint would stop the transition to `confirmation_required`.

Migration `20260731000227_cartera020b_packet_replay_hardening.sql` adds one narrowly bounded rule:

- a second packet insert is skipped only when the existing and incoming pending-confirmation packets are completely identical;
- any changed field raises `CARTERA020B_PACKET_CHANGED_REPLAY`;
- no packet update, truth creation or authenticated direct-write authority is introduced.

## Prepared deployment set

```text
20260731000220_cartera020b_evidence_tables.sql
20260731000221_cartera020b_worker_guards.sql
20260731000222_cartera020b_rls_and_grants.sql
20260731000223_cartera020b_command_helpers.sql
20260731000224_cartera020b_admission_and_claim_rpcs.sql
20260731000225_cartera020b_processing_result_rpc.sql
20260731000226_cartera020b_claim_concurrency_hardening.sql
20260731000227_cartera020b_packet_replay_hardening.sql
```

The harness verifies stored migration content by SHA-256 when a version already exists. Missing migrations are applied in one transaction each and written to `supabase_migrations.schema_migrations` without migration repair, database reset or history rewriting.

## Authorization boundary

The remote workflow is `workflow_dispatch` only and requires all four values:

```text
AUTHORIZATION=YES:CARTERA_020B_REMOTE_MUTATION
EXPECTED_SOURCE_HEAD=95d03f220670239fc7c2af9ab5799bb21406cbd0
EXPECTED_ACCEPTANCE_HEAD=<exact branch head at execution>
PROJECT_REF=rmlxigxysujsuwzgoimv
```

Opening or updating the pull request cannot execute the remote harness. The PR workflow contains no Supabase token and does not invoke the Management API script.

## Transactional acceptance contract

The rollback-clean SQL harness proves:

- authenticated admission under the owning advisor;
- identical admission replay without duplicate rows;
- changed-input replay persisted as `CHANGED_INPUT_REPLAY`;
- direct authenticated inserts blocked;
- active lease replay for the same worker;
- competing worker excluded from an active lease;
- classification result and exact result replay;
- attempt and extraction candidate persistence;
- packet creation followed by identical handoff to `confirmation_required`;
- changed packet replay blocked;
- terminal item not reclaimable;
- expired lease recovery with transition evidence;
- retry scheduling, lease clearing and due-item reclaim;
- cross-advisor source and packet reads blocked by RLS;
- cross-advisor claim returns no item;
- owner mismatch and anonymous reads blocked;
- no `CommercialPerson`, canonical Policy or `PolicyRole` truth created.

All transactional fixtures end in `ROLLBACK`.

## Parallel claim contract

A separate minimal fixture is committed only to execute two Management API claim requests concurrently for the same advisor and worker. Acceptance requires:

```text
BOTH_RESPONSES=CLAIMED
SAME_INBOX_ITEM=YES
SAME_LEASE_TOKEN=YES
NEW_CLAIM_COUNT=1
REPLAY_COUNT=1
```

The fixture is removed in a mandatory `finally` cleanup. Cleanup runs even after a failed assertion, and the final residual query must return zero users, sources, Inbox items, attempts, candidates and packets bearing the acceptance namespace.

## Evidence boundary

The future authorized run will write only redacted evidence under:

```text
artifacts/cartera-020b-remote-acceptance/report.json
artifacts/cartera-020b-remote-acceptance/acceptance.log
artifacts/cartera-020b-remote-acceptance/workflow-output.log
```

Tokens are not written to logs or artifacts.

## Current closure

```text
PACKET_HANDOFF_HARDENING=REPOSITORY_READY
TRANSACTIONAL_ACCEPTANCE_HARNESS=REPOSITORY_READY
PARALLEL_CLAIM_HARNESS=REPOSITORY_READY
REMOTE_WORKFLOW=MANUAL_ONLY
CARTERA_020B_REMOTE_DEPLOYMENT=NOT_RUN
CARTERA_020B_REMOTE_ACCEPTANCE=NOT_RUN
CARTERA_020B_COMPLETE=NO
NEXT=EXPLICIT_REMOTE_AUTHORIZATION_AND_MANUAL_EXECUTION
```
