# FORGE CARTERA 010B — Remote Acceptance Preparation 001

Forge OS

## Status

```text
PHASE=CARTERA_010B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
STATUS=PREPARED_NOT_YET_EXECUTED
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=4c274a377f1b91fb176304f84008c1b42c781951
ACCEPTANCE_BRANCH=feature/cartera-010b-remote-acceptance
PRODUCT_UI_MUTATION=NO
REMOTE_DEPLOYMENT=AUTHORIZED_BY_PHASE_CONTINUATION
REMOTE_ACCEPTANCE=NOT_YET_RUN
```

## Execution channel

The remote gate reuses the accepted CARTERA 001B deployment architecture:

```text
GitHub Actions
→ existing SUPABASE_ACCESS_TOKEN secret
→ Supabase Management API
→ exact project ref rmlxigxysujsuwzgoimv
→ additive migration transactions
→ rollback-only acceptance transaction
→ zero-residue verification
```

No database password, pooler URL, local `psql`, service-role browser key or direct Product UI mutation is introduced.

## Migrations in scope

```text
20260731000200_cartera010b_identity_policy_foundation.sql
20260731000210_cartera010b_command_helpers.sql
20260731000211_cartera010b_identity_resolution_rpc.sql
20260731000212_cartera010b_confirmed_policy_rpc.sql
```

The runner refuses to deploy a previously recorded migration when the remotely stored statements do not match the local SHA-256 content.

## Transactional acceptance matrix

The rollback-only harness must prove:

1. explicit `CREATE_CONFIRMED` CommercialPerson creation;
2. deterministic identical replay despite an untrusted client digest;
3. durable `CHANGED_INPUT_REPLAY` conflict for changed input;
4. governed correction that closes one prior source-identity effective period;
5. direct authenticated canonical writes remain blocked;
6. confirmed Policy persistence with immutable evidence and version 1;
7. distinct owner, insured, payor and beneficiary roles;
8. restricted beneficiary rows are absent from general role reads;
9. Policy version 2 requires exact previous-version lineage;
10. superseded PolicyRole periods close without rewriting history;
11. Policy-number collision becomes a durable conflict rather than overwrite;
12. cross-advisor reads and commands fail closed;
13. anonymous RPC execution is denied;
14. append-only update and delete attempts fail;
15. all temporary auth and domain fixtures roll back;
16. post-transaction residual fixture count is zero.

## Safety boundary

```text
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
DIRECT_AUTHENTICATED_TABLE_WRITES=REVOKED
CROSS_ADVISOR_ACCESS=FORBIDDEN
BENEFICIARY_GENERAL_READ=FORBIDDEN
HARD_DELETE=FORBIDDEN
PRODUCT_UI_MUTATION=NONE
OCR_OR_BULK_INTAKE=OUT_OF_SCOPE
RENEWAL_PAYMENT_COMMUNICATION=OUT_OF_SCOPE
```

## Exit requirement

This document is preparation evidence only. CARTERA 010B cannot close until the remote workflow proves deployment, transactional behavior, rollback cleanup and zero residue against Supabase.
