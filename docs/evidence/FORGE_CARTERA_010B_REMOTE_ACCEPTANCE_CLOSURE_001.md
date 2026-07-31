# FORGE CARTERA 010B — Remote Acceptance Closure 001

Forge OS

## Closure

```text
PHASE=CARTERA_010B_REMOTE_DEPLOYMENT_AND_TRANSACTIONAL_ACCEPTANCE
STATUS=CLOSED_REMOTE_ACCEPTED
SOURCE_BRANCH=feature/cartera-010b-commercial-person-policy-role-foundation
SOURCE_COMMIT=4c274a377f1b91fb176304f84008c1b42c781951
ACCEPTANCE_BRANCH=feature/cartera-010b-remote-acceptance
ACCEPTED_REMOTE_COMMIT=c03df9d7b5ff020c17f94fedc5bc13723ad732ae
GITHUB_ACTIONS_RUN=30638027827
GITHUB_ACTIONS_JOB=91180521953
PROJECT_REF=rmlxigxysujsuwzgoimv
PRODUCT_UI_MUTATION=NO
REMOTE_ACCEPTANCE=PASS
CARTERA_010B_COMPLETE=YES
NEXT=CARTERA_010C
```

## Deployed migration authority

The following migrations are recorded in Supabase migration history and matched against repository content:

```text
20260731000200_cartera010b_identity_policy_foundation.sql
20260731000210_cartera010b_command_helpers.sql
20260731000211_cartera010b_identity_resolution_rpc.sql
20260731000212_cartera010b_confirmed_policy_rpc.sql
20260731000213_cartera010b_identity_resolution_precedence_hardening.sql
20260731000214_cartera010b_conflict_insert_ambiguity_hardening.sql
20260731000215_cartera010b_general_policy_role_read_authority.sql
```

Migrations `00213–00215` are additive remote hardenings discovered by executing the accepted contracts against PostgreSQL rather than by weakening acceptance:

1. `00213` parenthesizes JSON text extraction in the identity advisory-lock key.
2. `00214` uses the explicit `policy_conflicts` unique constraint to remove PL/pgSQL variable/column ambiguity.
3. `00215` replaces the unusable security-invoker role view as product read authority with `forge_cartera010b_list_general_policy_roles(text)`, a bounded security-definer function that preserves direct table revocation, filters by `auth.uid()` and structurally excludes beneficiaries and restricted rows.

## Repository acceptance

```text
TARGETED_TESTS=35
TARGETED_PASS=35
TARGETED_FAIL=0
SOURCE_ANCESTRY=PASS
BOUNDED_REMOTE_PATHS=PASS
PRODUCT_UI_DIFF=NONE
JAVASCRIPT_SYNTAX=PASS
IDENTITY_PRECEDENCE_HARDENING=PASS
CONFLICT_INSERT_AMBIGUITY_HARDENING=PASS
GENERAL_POLICY_ROLE_READ_AUTHORITY=PASS
```

## Transactional remote acceptance

The rollback-only Supabase transaction proved:

```text
CARTERA_010B_REMOTE_DEPLOYMENT=PASS
CARTERA_010B_REMOTE_ACCEPTANCE=PASS
IDENTITY_CREATE_LINK_CORRECT=PASS
POLICY_CREATE_VERSION=PASS
MULTI_PARTY_POLICY_ROLES=PASS
RLS_CROSS_ADVISOR=PASS
DIRECT_WRITES=BLOCKED
RESTRICTED_BENEFICIARY_READ=PASS
IDEMPOTENT_REPLAY=PASS
CHANGED_INPUT_CONFLICT=PASS
APPEND_ONLY=PASS
TEST_FIXTURES_ROLLED_BACK=YES
RESIDUAL_FIXTURES=0
```

The accepted vertical exercised:

- explicit CommercialPerson creation;
- Prospect/source identity linking and governed correction;
- identical command replay with server-owned digest;
- changed-input replay as a durable conflict;
- canonical Policy version 1 and version 2;
- exact previous-version lineage;
- distinct owner, insured, payor and beneficiary PolicyRole authority;
- temporal closure of superseded source links and PolicyRole versions;
- Policy-number collision without overwrite;
- owner-scoped reads and cross-advisor denial;
- anonymous RPC denial;
- direct authenticated table-write denial;
- append-only update/delete guards;
- restricted beneficiary exclusion from general role reads.

## Evidence artifact

```text
ARTIFACT_NAME=cartera-010b-remote-acceptance
ARTIFACT_ID=8796172953
ARTIFACT_SHA256=ea88a1279505198f024459999a9bd2f34944484e825a436bcb70922c4ca591bc
RETENTION_DAYS=30
```

The artifact contains the acceptance report, sanitized acceptance log, workflow output and each additive hardening verification log.

## Residue and safety

```text
TEMP_AUTH_USERS=0
TEMP_COMMERCIAL_PEOPLE=0
TEMP_COMMERCIAL_ACCOUNTS=0
TEMP_CANONICAL_POLICIES=0
TEMP_POLICY_CONFLICTS=0
AUTOMATIC_IDENTITY_MERGE=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
DIRECT_POLICY_ROLE_TABLE_READ=REVOKED
BENEFICIARY_GENERAL_READ=FORBIDDEN
HARD_DELETE=FORBIDDEN
REMOTE_WORKFLOW_AUTOMATIC_TRIGGER=RETIRED
```

The workflow is retained as an explicit `workflow_dispatch` diagnostic only. Later documentation or PR commits cannot silently rerun the remote mutation gate.

## Phase exit

```text
CARTERA_010B_CONTRACTS=COMPLETE
CARTERA_010B_PERSISTENCE=DEPLOYED
CARTERA_010B_GOVERNED_COMMANDS=DEPLOYED
CARTERA_010B_SECURITY=REMOTE_ACCEPTED
CARTERA_010B_TRANSACTIONAL_ACCEPTANCE=PASS
CARTERA_010B_FIXTURE_CLEANUP=PASS
CARTERA_010B_COMPLETE=YES
CARTERA_010C_AUTHORIZED=YES
MERGE_PERFORMED=NO
```
