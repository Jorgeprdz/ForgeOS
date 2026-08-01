# FORGE CARTERA 020C — Remote Acceptance Closure 001

## Closure

```text
PHASE=CARTERA_020C_PERSISTENT_CONFIRMATION_REMOTE_ACCEPTANCE
STATUS=CLOSED_REMOTE_ACCEPTED
SOURCE_BRANCH=feature/cartera-020c-identity-policy-confirmation-review
SOURCE_COMMIT=0daaccd556659b997f2086e12b09481281d1b019
ACCEPTANCE_BRANCH=feature/cartera-020c-remote-acceptance
REMOTE_ACCEPTED_HEAD=71ba67b0b02e65f83e93182697aac65f44b5c5f6
PROJECT_REF=rmlxigxysujsuwzgoimv
PRODUCT_UI_MUTATION=NO
ACCOUNT_MUTATION=NOT_AUTHORIZED
CARTERA_020C_COMPLETE=YES
```

## Accepted remote execution

```text
WORKFLOW=CARTERA 020C One-Shot Retry Version Qualification V2
WORKFLOW_RUN=30675286681
WORKFLOW_JOB=91301111909
WORKFLOW_CONCLUSION=SUCCESS
REPOSITORY_TESTS=91
REPOSITORY_PASS=91
REPOSITORY_FAIL=0
ARTIFACT_ID=8810199540
ARTIFACT_SHA256=b396f1b95338a4f280c63eb4cd10ff799481b57aceb3194d2947e979c4d8e1f4
RETENTION_DAYS=30
```

## Deployed migrations

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
20260731000239_cartera020c_conflict_insert_ambiguity_hardening
20260731000240_cartera020c_conflict_constraint_name_hardening
20260731000241_cartera020c_conflict_persistence_receipt_hardening
```

All deployed history remains immutable. Additive migrations 00239–00241 preserve the original authority boundary and were discovered through actual PostgreSQL compilation and transactional execution.

## Remote-discovered hardenings

1. `authorization` was rejected as a PL/pgSQL identifier in 00233, 00234 and 00238. The identifier was replaced by `authorization_payload`, with an anti-regression test.
2. Conflict insertion used a PL/pgSQL variable/column-ambiguous `ON CONFLICT` target. Migration 00239 introduced an explicit helper replacement.
3. PostgreSQL-generated constraint names exceeded identifier limits and were not safely inferable from source text. Migration 00240 discovers the unique constraint from catalog table/column metadata, renames it to `cartera020c_conflict_reference_uq`, and recompiles the helper against that stable name.
4. Conflict responses could not prove an exact persisted row. Migration 00241 serializes by conflict reference, verifies an identical prior row or inserts with `RETURNING`, validates every semantic field, and only then returns the reference.
5. Supabase management API transient 429/5xx/network failures are retried with bounded exponential backoff; SQL 4xx contract failures remain fail-fast.
6. Rollback acceptance queries were hardened against `#variable_conflict use_variable` collisions by qualifying conflict and Retry Review columns.
7. Retry acceptance now reads the durable sanitized `stateVersion` immediately before both early and due retry calls rather than supplying a magic constant.

## Accepted markers

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

## Authority and privacy boundary

- Identity and Policy remain separate explicit authorizations.
- Authorization digests bind to the exact canonical UTF-8 payload.
- Execution invokes only accepted CARTERA 010B governed mutation authorities.
- No direct writes to CommercialPerson, Account, Policy, PolicyVersion, EvidenceVersion or PolicyRole are exposed to product callers.
- Account creation and direct Account mutation remain unauthorized.
- Beneficiary details remain restricted and are not projected through orchestration status.
- The CARTERA 020B packet remains immutable; only its governed Inbox lifecycle advances after verified Policy persistence.
- Product UI, payment, compensation, task, calendar, message and opportunity effects remain outside this phase.

## Fixture safety

The primary acceptance runs inside a PostgreSQL transaction ending in `ROLLBACK`. The separate optimistic concurrency fixture is explicitly cleaned. Final residual checks returned zero for CARTERA 020C authorization users, reviews, commands, Evidence records, CommercialPeople and Policies.

```text
REMOTE_WORKFLOW=MANUAL_ONLY
REMOTE_EXECUTION_FROM_PULL_REQUEST=RETIRED_AFTER_CLOSURE
ACCOUNT_MUTATION=NOT_AUTHORIZED
PRODUCT_UI_MUTATION=NO
CARTERA_020C_COMPLETE=YES
NEXT=INTEGRATE_REMOTE_CLOSURE_AND_ADVANCE_CARTERA_ROADMAP
```
