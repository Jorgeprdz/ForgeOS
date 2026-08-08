# FORGE POLICY COVERAGE READ-AFTER-WRITE VERSIONING HOTFIX ACCEPTANCE 001

## Execution identity

```text
PHASE=FORGE_POLICY_COVERAGE_READ_AFTER_WRITE_VERSIONING_HOTFIX_001
CODENAME=COVERAGE_RAW_V2_FIX
OWNER_AUTHORIZATION=OK_GO_POLICY_COVERAGE_RAW_VERSIONING_HOTFIX
START_MAIN_SHA=de07f6cd371046685791f4da45264dd34d088c51
HOTFIX_BRANCH=hotfix/policy-coverage-read-after-write-versioning-001
HOTFIX_HEAD_SHA=47d7823c381a62b0059e829dc882abf3b5e56f1d
HOTFIX_PR=294
MERGE_SHA=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
MAIN_SHA_AFTER_MERGE=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
PRODUCTIVE_SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv
HOTFIX_MIGRATION=20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql
AURA_MUTATION=NO
PAGES_DEPLOYED=NO
PRODUCT_UI_MUTATION=NO
REAL_CUSTOMER_DATA_TOUCHED=NO
```

## Incident and root cause

The productive Coverage writer correctly persisted v1, current projection and
append-only history. The prior read-after-write verifier was not command scoped:
it counted all historical `policy_coverage_versions` rows for Coverage
references named by the command under the same PolicyVersion. Therefore a valid
v2 update had historical v1 + v2 and produced `persisted_count=2` for one command
item, raising `POLICY_COVERAGE_READ_AFTER_WRITE_FAILED`.

The history was correct. Verification was wrong.

## Forward-only correction

The already deployed migration
`20260808000100_policy_coverage_canonical_extension.sql` was not modified.

The forward migration
`20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql` replaces
only the known read-after-write fragment inside
`public.forge_policy_intelligence_confirm_policy_coverages(jsonb)`.

Each command item now contributes to `coverageCount` only when exactly one
persisted CoverageVersion matches all of:

- authenticated advisor;
- canonical Policy;
- command `policyCoverageReference`;
- command `currentVersion`;
- exact PolicyVersion id;
- exact EvidenceVersion id;
- `facts_digest = forge_cartera010b_command_digest(command_item)`.

The migration is fail-closed against source drift: the exact defective fragment
must exist exactly once before replacement.

```text
OLD_MIGRATION_UNCHANGED=PASS
FORWARD_HOTFIX_MIGRATION=PASS
FUNCTION_SIGNATURE_CHANGED=NO
CLIENT_CONTRACT_CHANGED=NO
CURRENT_PROJECTION_MODEL=UNCHANGED
HISTORY_MODEL=UNCHANGED
HISTORY_DELETED=NO
HISTORY_REWRITTEN=NO
```

## Repository acceptance

PR #294 exact head:

```text
HEAD_SHA=47d7823c381a62b0059e829dc882abf3b5e56f1d
WORKFLOW=Policy Coverage Model Authority 001
WORKFLOW_RUN=31241608614
PRE_MERGE_JOB=93063445256
TARGETED_COVERAGE_AND_HOTFIX_TESTS=43/43_PASS
INHERITED_CARTERA_010B_020C_TESTS=34/34_PASS
```

The targeted matrix includes v1, v2, v3, multi-version/multi-Coverage, mandatory
mixed-version commands, and fail-closed negative checks for wrong or missing
Coverage reference, Coverage version, PolicyVersion, EvidenceVersion and facts
digest.

The same workflow job was explicitly re-run after productive deployment:

```text
POST_DEPLOY_JOB=93064212144
TARGETED_POST_DEPLOY_REGRESSION=PASS
INHERITED_POST_DEPLOY_REGRESSION=PASS
POST_DEPLOY_REGRESSIONS=PASS
```

## Merge and Pages governance

PR #294 was merged only after the exact-head CI gate passed and using expected
head protection.

```text
AUTO_MERGE=NO
MERGE=YES
MERGE_SHA=bca6c68ab0f9106f88861ad05524c3813b6dcbbc
AUTO_PAGES_DEPLOY=NO
PAGES_DEPLOYED=NO
```

GitHub reported zero Actions workflow runs for the merge SHA during both
post-merge Pages checks. No Pages workflow was manually dispatched.

## Productive deployment

The productive project was resolved as:

```text
SUPABASE_TARGET=rmlxigxysujsuwzgoimv
```

Before deployment:

- `20260808000100_policy_coverage_canonical_extension` was present;
- `20260808000110` was absent;
- the productive function contained the exact old verifier fragment;
- the new verifier fragment was absent.

Only the forward hotfix SQL was applied. The Supabase connector initially used
its generated migration timestamp for the ledger entry; that single metadata row
was fail-closed aligned to the repository version. Final ledger state:

```text
20260808000110=policy_coverage_read_after_write_versioning_hotfix
STRAY_HOTFIX_MIGRATION_RECORDS=0
OLD_MIGRATION_REAPPLIED=NO
UNRELATED_MIGRATION_APPLIED=NO
```

Post-deployment function inspection proves the old fragment is absent and exact
Coverage reference, version, EvidenceVersion and facts-digest checks are present.
Authenticated execute authority remains intact and anon execute remains denied.

## Productive synthetic acceptance

All mutations used the existing `SYNTHETIC` Advisor A/B identities. Their demo
read-only seal was opened only inside the acceptance transaction and all test
mutations ended in `ROLLBACK`.

### Versioning and exact read-after-write

```text
V1=PASS
V1_MULTI_COVERAGE_COUNT_3=PASS
V2=PASS
V2_COVERAGE_COUNT_SECOND_COMMAND_1=PASS
V1_HISTORY_PRESERVED_AFTER_V2=PASS
V3=PASS
V3_COVERAGE_COUNT_THIRD_COMMAND_1=PASS
V2_HISTORY_PRESERVED_AFTER_V3=PASS
CURRENT_PROJECTION_ADVANCES=PASS
PREVIOUS_COVERAGE_VERSION_LINK=PASS
CORRECTION_LINEAGE=PASS
READ_AFTER_WRITE_EXACT_VERSION=PASS
```

### Multi-version and mixed commands

```text
TWO_COVERAGES_V1=PASS
TWO_COVERAGES_V2=PASS
MULTI_COVERAGE_VERSIONING=PASS
MULTI_COVERAGE_V2_COVERAGE_COUNT=2
MIXED_VERSION_COMMAND=PASS
MIXED_VERSION_COVERAGE_COUNT=3
```

The productive transactional scenario created seven current Coverage projections
and thirteen historical rows while active, proving that historical multiplicity
no longer changes command-scoped `coverageCount`.

### Idempotency

```text
V1_EXACT_REPLAY=PASS
V1_DUPLICATE_HISTORY_ON_REPLAY=NO
V2_EXACT_REPLAY=PASS
V2_DUPLICATE_HISTORY_ON_REPLAY=NO
CHANGED_INPUT_SAME_IDEMPOTENCY_KEY=CONFLICT
IDEMPOTENCY=PASS
```

### Evidence and unknown semantics

```text
POLICY_VERSION_BINDING=PASS
EVIDENCE_VERSION_BINDING=PASS
FACTS_DIGEST_BINDING=PASS
UNKNOWN_SUM_INSURED_REMAINS_NULL=PASS
UNKNOWN_PREMIUM_REMAINS_NULL=PASS
UNKNOWN_CURRENCY_REMAINS_NULL=PASS
UNKNOWN_COVERAGE_STATE_REMAINS_NULL=PASS
UNKNOWN_NOT_ZERO=PASS
UNKNOWN_NOT_MXN=PASS
UNKNOWN_NOT_ACTIVE=PASS
```

### Atomic wrapper

A separate rollback-only productive acceptance created a fully synthetic Person,
Policy, PolicyRole, Policy Evidence and Coverage through
`forge_cartera010b_confirm_identity_policy_and_coverages(...)`.

The first operation persisted Coverage v1. The second operation replayed the
exact Identity + Policy commands and advanced the same Coverage to v2 using a
new Coverage idempotency key.

```text
ATOMIC_WRAPPER_VALID_V1=PASS
ATOMIC_WRAPPER_VERSIONED_COVERAGE=PASS
ATOMIC_V2_COVERAGE_COUNT=1
ATOMIC_HISTORY_COUNT=2
ATOMIC_CURRENT_PROJECTION_VERSION=2
ATOMICITY=PASS
```

### Isolation, compatibility and security

```text
TENANT_A_CANNOT_READ_B_POLICY_COVERAGE=PASS
TENANT_B_CANNOT_READ_A_POLICY_COVERAGE=PASS
TENANT_ISOLATION=PASS
LEGACY_POLICY_SUM_INSURED_UNCHANGED=PASS
LEGACY_POLICY_PREMIUM_UNCHANGED=PASS
LEGACY_COMPATIBILITY=PASS
SAFE_READ_PROJECTION=PASS
RLS_POLICY_COVERAGES=PASS
RLS_POLICY_COVERAGE_VERSIONS=PASS
AUTHENTICATED_DIRECT_INSERT=DENIED
AUTHENTICATED_DIRECT_UPDATE=DENIED
AUTHENTICATED_DIRECT_DELETE=DENIED
SECURITY_DEFINER_SEARCH_PATH=public,extensions,pg_temp
DIRECT_WRITE_DENIED=PASS
```

## Synthetic cleanup

After both rollback-only acceptance transactions:

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
SYNTHETIC_CLEANUP=PASS
```

## Authority boundaries

```text
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
PRODUCT_TRUTH_BOUNDARY=UNCHANGED
EVIDENCE_BOUNDARY=UNCHANGED
BENEFICIARY_BOUNDARY=UNCHANGED
NO_PARALLEL_WRITER=PASS
NO_PARALLEL_VERSION_LEDGER=PASS
AURA_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Final acceptance

```text
ROOT_CAUSE_CONFIRMED=PASS
OLD_MIGRATION_UNCHANGED=PASS
FORWARD_HOTFIX_MIGRATION=PASS
V1=PASS
V2=PASS
V3=PASS
MULTI_COVERAGE_VERSIONING=PASS
MIXED_VERSION_COMMAND=PASS
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
PAGES_DEPLOYED=NO
AURA_MUTATION=NO
COVERAGE_MODEL_READY_FOR_AURA=YES
COVERAGE_PRODUCTIVE_READY_FOR_AURA=YES
FINAL_STATUS=PASS
NEXT_AUTHORIZED_CANDIDATE=FORGE_AURA_CARTERA_PRODUCTIVE_UX_RECONCILIATION_001
```
