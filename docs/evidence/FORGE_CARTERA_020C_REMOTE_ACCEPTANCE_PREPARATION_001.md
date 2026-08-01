# FORGE CARTERA 020C — Remote Acceptance Preparation 001

```text
PHASE=CARTERA_020C_PERSISTENT_CONFIRMATION_REMOTE_ACCEPTANCE
SOURCE_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
SOURCE_COMMIT=0daaccd556659b997f2086e12b09481281d1b019
ACCEPTANCE_BRANCH=feature/cartera-020c-remote-acceptance
PROJECT_REF=rmlxigxysujsuwzgoimv
REMOTE_WORKFLOW=MANUAL_ONLY
SUPABASE_REMOTE_MUTATION=PENDING_EXPLICIT_WORKFLOW_AUTHORIZATION
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_020C_COMPLETE=NO
NEXT=EXECUTE_CARTERA_020C_REMOTE_ACCEPTANCE
```

## Purpose

This gate applies and validates the repository-ready persistent confirmation orchestration against the governed Supabase project. It is separated from implementation PR #42 so pull-request activity cannot repeat remote mutations.

## Deployment sequence

```text
20260731000230_cartera020c_confirmation_orchestration_tables
20260731000231_cartera020c_confirmation_orchestration_guards_rls
20260731000232_cartera020c_confirmation_orchestration_helpers
20260731000233_cartera020c_prepare_identity_orchestration_rpc
20260731000234_cartera020c_attach_policy_confirmation_rpc
20260731000235_cartera020c_confirmation_failure_retry_helpers
20260731000236_cartera020c_execute_confirmation_step_rpc
20260731000237_cartera020c_confirmation_status_retry_grants
20260731000238_cartera020c_authorization_digest_hardening
```

Migration `00238` is an additive security hardening discovered while preparing real remote acceptance. The repository service previously generated an authorization digest, but the RPC only checked that it looked like a 64-character digest. The hardening now binds each explicit Identity or Policy authorization to the exact recursively key-sorted compact JSON payload using UTF-8 SHA-256.

The original orchestration authorities are renamed to private `*_unbound` functions. Public wrapper functions verify the exact digest before invoking them, and execution grants on the unbound functions are revoked.

## Remote acceptance scenarios

The rollback-only transactional acceptance validates:

- forged Identity authorization digest rejection;
- valid Identity preparation and identical replay;
- owner-private direct read and write denial;
- Account direct mutation denial;
- one-step ordered Identity execution;
- durable 010B receipt, Person, decision and active source-link verification;
- cross-advisor status isolation;
- forged Policy authorization digest rejection;
- separate Policy authorization;
- canonical Policy, PolicyVersion, EvidenceVersion and exact PolicyRole count verification;
- sanitized status without command payload or beneficiary projection;
- changed-input replay persistence and blocking;
- early retry rejection and due retry release;
- governed 020B Inbox transition to `confirmed`;
- full transaction rollback.

A separate committed concurrency fixture executes the same review and `stateVersion` twice in parallel. Exactly one execution must succeed and exactly one must fail with `CARTERA020C_STALE_STATE_VERSION`. The harness then verifies one attempt, one Person and complete fixture cleanup.

## Remote workflow authorization

The remote workflow accepts only:

```text
AUTHORIZATION=YES:CARTERA_020C_REMOTE_MUTATION
EXPECTED_SOURCE_HEAD=0daaccd556659b997f2086e12b09481281d1b019
EXPECTED_ACCEPTANCE_HEAD=<exact acceptance branch SHA>
PROJECT_REF=rmlxigxysujsuwzgoimv
```

It checks out the exact authorized SHA. It has no `push` or `pull_request` trigger and uses `cancel-in-progress: false` to prevent overlapping mutation runs.

## Expected closure markers

```text
CARTERA_020C_REMOTE_DEPLOYMENT=PASS
AUTHORIZATION_DIGEST_COMPATIBILITY=PASS
CARTERA_020C_TRANSACTIONAL_ACCEPTANCE=PASS
AUTHORIZATION_DIGEST_BINDING=PASS
IDENTITY_ORDERED_EXECUTION=PASS
IDENTITY_READ_AFTER_WRITE=PASS
POLICY_READ_AFTER_WRITE=PASS
CHANGED_INPUT_CONFLICT=PASS
RETRY_GOVERNANCE=PASS
PARALLEL_STATE_VERSION_SERIALIZATION=PASS
RLS_CROSS_ADVISOR=PASS
DIRECT_WRITES=BLOCKED
SANITIZED_STATUS=PASS
TEST_FIXTURES_ROLLED_BACK=YES
CONCURRENCY_FIXTURES_CLEANED=YES
RESIDUAL_FIXTURES=0
CARTERA_020C_REMOTE_ACCEPTANCE=PASS
```

Until those markers are produced by the governed project and preserved in a 30-day artifact:

```text
CARTERA_020C_PERSISTENT_CONFIRMATION_ORCHESTRATION=REPOSITORY_READY
CARTERA_020C_REMOTE_DEPLOYMENT=NOT_RUN
CARTERA_020C_REMOTE_ACCEPTANCE=NOT_RUN
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_020C_COMPLETE=NO
```
