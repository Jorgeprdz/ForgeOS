# FORGE POLICY COVERAGE READ-AFTER-WRITE VERSIONING HOTFIX 001

## Execution identity

```text
PHASE=FORGE_POLICY_COVERAGE_READ_AFTER_WRITE_VERSIONING_HOTFIX_001
CODENAME=COVERAGE_RAW_V2_FIX
BASE_MAIN_SHA=de07f6cd371046685791f4da45264dd34d088c51
HOTFIX_BRANCH=hotfix/policy-coverage-read-after-write-versioning-001
HOTFIX_HEAD_SHA=47d7823c381a62b0059e829dc882abf3b5e56f1d
HOTFIX_PR=294
MERGE_SHA=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
OWNER_AUTHORIZATION=OK_GO_POLICY_COVERAGE_RAW_VERSIONING_HOTFIX
PRODUCTIVE_SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv
REMOTE_DEPLOYMENT_STATUS=DEPLOYED_ACCEPTED
PRODUCTIVE_ACCEPTANCE_STATUS=PASS
AURA_MUTATION=NO
PAGES_DEPLOYED=NO
PRODUCT_UI_MUTATION=NO
```

## Incident

The originally deployed Policy Coverage writer correctly created v1 current and
append-only history rows, but a subsequent Coverage v2 command failed with
`POLICY_COVERAGE_READ_AFTER_WRITE_FAILED`.

The persisted state before rollback proved that both history and current
projection were correct. The defect was isolated to verification.

## Root cause

The old verifier counted every historical `policy_coverage_versions` row whose
Coverage reference appeared in the current command and whose Policy/PolicyVersion
matched. It did not constrain the counted row to the Coverage item's requested
version, exact EvidenceVersion or exact facts digest.

Therefore:

```text
Coverage X v1 -> historical count 1 -> PASS
Coverage X v2 -> historical count 2 -> compared with one command item -> FAIL
```

Historical multiplicity was incorrectly used as command-scoped persistence
proof.

## Why history was correct

`policy_coverages` remains the current projection.
`policy_coverage_versions` remains canonical append-only history.

```text
HISTORY_DELETED=NO
HISTORY_REWRITTEN=NO
CURRENT_PROJECTION_MODEL=UNCHANGED
HISTORY_MODEL=UNCHANGED
V1_PRESERVED_AFTER_V2=PASS
V2_PRESERVED_AFTER_V3=PASS
APPEND_ONLY_HISTORY=PASS
PREVIOUS_COVERAGE_VERSION_LINK=PASS
CORRECTION_LINEAGE=PASS
```

## Old read-after-write semantics

The old question was effectively:

> How many historical CoverageVersion rows exist for command Coverage references
> under this Policy and PolicyVersion?

That question becomes false as soon as valid history accumulates.

## New read-after-write semantics

The forward migration
`20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql` changes
only the verifier in
`public.forge_policy_intelligence_confirm_policy_coverages(jsonb)`.

For each command item it now requires exactly one persisted CoverageVersion
matching:

1. authenticated advisor;
2. canonical Policy;
3. exact `policyCoverageReference`;
4. exact requested `currentVersion`;
5. exact persisted PolicyVersion id;
6. exact persisted EvidenceVersion id;
7. `facts_digest = forge_cartera010b_command_digest(command_item)`.

`coverageCount` is therefore the number of command Coverage items whose exact
canonical version was verified, never the total historical row count.

The migration uses `pg_get_functiondef` and refuses to proceed unless the exact
known defective fragment occurs once. It then executes the resulting
`CREATE OR REPLACE FUNCTION`. This keeps the repair fail-closed against source
drift.

## Migration integrity

The productive migration
`20260808000100_policy_coverage_canonical_extension.sql` remains byte-for-byte
unchanged in the repository and was not reapplied.

```text
OLD_MIGRATION_MODIFIED=NO
OLD_MIGRATION_REAPPLIED=NO
NEW_FORWARD_MIGRATION=YES
HOTFIX_MIGRATION=20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql
UNRELATED_MIGRATION_APPLIED=NO
FUNCTION_SIGNATURE_CHANGED=NO
CLIENT_CONTRACT_CHANGED=NO
```

## Versioning and idempotency

Productive rollback-only acceptance proved:

```text
V1=PASS
V2=PASS
V3=PASS
V2_COVERAGE_COUNT=1
V3_COVERAGE_COUNT=1
MULTI_COVERAGE_VERSIONING=PASS
MIXED_VERSION_COMMAND=PASS
MIXED_VERSION_COVERAGE_COUNT=3
CURRENT_PROJECTION_ADVANCES=PASS
EXACT_REPLAY=PASS
DUPLICATE_HISTORY_ON_REPLAY=NO
CHANGED_INPUT_REPLAY=CONFLICT
IDEMPOTENCY=PASS
```

## Evidence binding

The verifier now proves the exact CoverageVersion points to the PolicyVersion and
Policy Evidence Version resolved for the command, and that the persisted facts
digest equals the canonical command-item digest.

```text
POLICY_VERSION_BINDING=PASS
EVIDENCE_VERSION_BINDING=PASS
FACTS_DIGEST_BINDING=PASS
EVIDENCE_OWNER=UNCHANGED
```

## Unknown semantics

The hotfix does not touch Coverage facts. Productive acceptance reconfirmed:

```text
UNKNOWN_SUM_INSURED_REMAINS_NULL=PASS
UNKNOWN_PREMIUM_REMAINS_NULL=PASS
UNKNOWN_CURRENCY_REMAINS_NULL=PASS
UNKNOWN_COVERAGE_STATE_REMAINS_NULL=PASS
UNKNOWN_NOT_ZERO=PASS
UNKNOWN_NOT_MXN=PASS
UNKNOWN_NOT_ACTIVE=PASS
```

## Atomic wrapper

`forge_cartera010b_confirm_identity_policy_and_coverages(...)` was tested
productively in a rollback-only synthetic transaction. The first call created a
fully synthetic Identity + Policy + Coverage v1. The second call replayed the
exact Identity/Policy commands and advanced Coverage to v2.

```text
ATOMIC_WRAPPER_VALID_V1=PASS
ATOMIC_WRAPPER_VERSIONED_COVERAGE=PASS
ATOMIC_V2_COVERAGE_COUNT=1
ATOMIC_HISTORY_COUNT=2
ATOMICITY=PASS
```

## Security and compatibility

```text
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
PRODUCT_TRUTH_BOUNDARY=UNCHANGED
EVIDENCE_BOUNDARY=UNCHANGED
BENEFICIARY_BOUNDARY=UNCHANGED
NO_PARALLEL_WRITER=PASS
NO_PARALLEL_VERSION_LEDGER=PASS
LEGACY_POLICY_LEVEL_FIELDS_UNCHANGED=PASS
LEGACY_COMPATIBILITY=PASS
TENANT_ISOLATION=PASS
RLS_POLICY_COVERAGES=PASS
RLS_POLICY_COVERAGE_VERSIONS=PASS
AUTHENTICATED_DIRECT_INSERT=DENIED
AUTHENTICATED_DIRECT_UPDATE=DENIED
AUTHENTICATED_DIRECT_DELETE=DENIED
SECURITY_DEFINER_SEARCH_PATH=public,extensions,pg_temp
```

## Repository and post-deploy tests

PR #294 exact-head CI:

```text
WORKFLOW_RUN=31241608614
PRE_MERGE_JOB=93063445256
TARGETED_COVERAGE_AND_HOTFIX_TESTS=43/43_PASS
INHERITED_CARTERA_010B_020C_TESTS=34/34_PASS
```

The same accepted job was explicitly re-run after productive deployment:

```text
POST_DEPLOY_JOB=93064212144
POST_DEPLOY_TARGETED=PASS
POST_DEPLOY_INHERITED=PASS
POST_DEPLOY_REGRESSIONS=PASS
```

## Pages governance

The merge commit produced zero GitHub Actions runs during repeated post-merge
checks. The Pages workflow was not dispatched manually.

```text
AUTO_PAGES_DEPLOY=NO
PAGES_DEPLOYED=NO
```

## Synthetic cleanup

All productive acceptance mutations used only the pre-existing synthetic A/B
identities or additional transaction-local synthetic entities and ended in
`ROLLBACK`.

```text
COVERAGE_RESIDUE=0
COVERAGE_VERSION_RESIDUE=0
RECEIPT_RESIDUE=0
CONFLICT_RESIDUE=0
ATOMIC_POLICY_RESIDUE=0
ATOMIC_PERSON_RESIDUE=0
SYNTHETIC_ACCOUNTS_RESEALED=YES
PERSISTENT_TEST_PII=NO
REAL_CUSTOMER_DATA_TOUCHED=NO
```

## Productive closure

Canonical evidence:
`docs/evidence/FORGE_POLICY_COVERAGE_READ_AFTER_WRITE_VERSIONING_HOTFIX_ACCEPTANCE_001.md`.

```text
ROOT_CAUSE_CONFIRMED=PASS
READ_AFTER_WRITE_EXACT_VERSION=PASS
HISTORY_PRESERVED=PASS
CURRENT_PROJECTION=PASS
IDEMPOTENCY=PASS
ATOMICITY=PASS
TENANT_ISOLATION=PASS
LEGACY_COMPATIBILITY=PASS
EVIDENCE_BINDING=PASS
UNKNOWN_NOT_ZERO=PASS
RLS=PASS
DIRECT_WRITE_DENIED=PASS
SYNTHETIC_CLEANUP=PASS
POST_DEPLOY_REGRESSIONS=PASS
COVERAGE_MODEL_READY_FOR_AURA=YES
COVERAGE_PRODUCTIVE_READY_FOR_AURA=YES
FINAL_STATUS=PASS
NEXT_AUTHORIZED_CANDIDATE=FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
```
