# FORGE POLICY COVERAGE READ-AFTER-WRITE VERSIONING HOTFIX 001

## Execution identity

```text
PHASE=FORGE_POLICY_COVERAGE_READ_AFTER_WRITE_VERSIONING_HOTFIX_001
CODENAME=COVERAGE_RAW_V2_FIX
BASE_MAIN_SHA=de07f6cd371046685791f4da45264dd34d088c51
BRANCH=hotfix/policy-coverage-read-after-write-versioning-001
OWNER_AUTHORIZATION=OK_GO_POLICY_COVERAGE_RAW_VERSIONING_HOTFIX
PRODUCTIVE_SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv
REMOTE_DEPLOYMENT_STATUS=PENDING_REPOSITORY_GATES
AURA_MUTATION=NO
PAGES_WORKFLOW_MUTATION=NO
PRODUCT_UI_MUTATION=NO
```

## Incident

Production deployment of `20260808000100_policy_coverage_canonical_extension.sql`
proved the Coverage writer valid for new v1 Coverage rows, including one Policy
with multiple Coverage items and Coverage facts whose unknown values remain null.
The versioning acceptance then reproduced `POLICY_COVERAGE_READ_AFTER_WRITE_FAILED`
when a Coverage advanced from v1 to v2.

## Reproduction

For Coverage reference X:

```text
X v1 -> writer persists current projection v1 + history v1 -> PASS
X v2 -> writer advances current projection to v2 + appends history v2
     -> old read-after-write counts historical v1 and v2
     -> persisted_count=2 for one command item
     -> POLICY_COVERAGE_READ_AFTER_WRITE_FAILED
```

The failure is in verification. It does not show corrupted history, and the
productive reproduction was performed transactionally with rollback and zero
synthetic residue.

## Root cause

The original verifier counts every `policy_coverage_versions` row whose
Coverage reference belongs to the command and whose Policy/PolicyVersion match.
It does not correlate the row to the Coverage item's requested
`currentVersion`, exact EvidenceVersion, or exact facts digest. Once a Coverage
has historical versions under the same PolicyVersion, historical rows inflate
`persisted_count`.

## Why version history was correct

`policy_coverage_versions` is canonical append-only history. v1 and v2 are both
supposed to exist after the second command. The unique
`(advisor_id, policy_coverage_id, version_number)` invariant remains unchanged,
as do `previous_coverage_version_id` and correction lineage.

```text
HISTORY_DELETED=NO
HISTORY_REWRITTEN=NO
CURRENT_PROJECTION_MODEL=UNCHANGED
HISTORY_MODEL=UNCHANGED
```

## Old query semantics

The old question was effectively:

> How many historical CoverageVersion rows exist for Coverage references named
> by this command under this Policy and PolicyVersion?

That is not a command-scoped read-after-write proof.

## New query semantics

The forward migration
`20260808000110_policy_coverage_read_after_write_versioning_hotfix.sql` changes
only the verifier inside the existing writer. For every Coverage command item,
it requires exactly one persisted CoverageVersion matching all of:

- authenticated advisor;
- canonical Policy;
- `policyCoverageReference`;
- requested Coverage `currentVersion`;
- exact persisted PolicyVersion;
- exact persisted EvidenceVersion;
- `facts_digest = forge_cartera010b_command_digest(command_item)`.

Only command items satisfying that exact persisted tuple contribute to
`coverageCount`. Therefore one Coverage v2 returns `coverageCount=1` even though
v1 remains in history, and X v2 + Y v2 returns `coverageCount=2` even though four
historical rows exist.

The migration is fail-closed: it obtains the current canonical function using
`pg_get_functiondef`, requires the exact known defective verifier fragment to
occur exactly once, replaces only that fragment, then executes the resulting
`CREATE OR REPLACE FUNCTION`. A different base function causes migration failure
rather than a best-effort rewrite.

## Versioning invariants

```text
V1_PRESERVED_AFTER_V2=LOCKED
V2_PRESERVED_AFTER_V3=LOCKED
CURRENT_PROJECTION_ADVANCES=LOCKED
APPEND_ONLY_HISTORY=LOCKED
PREVIOUS_COVERAGE_VERSION_LINK=UNCHANGED
CORRECTION_LINEAGE=UNCHANGED
NO_HISTORY_UPDATE=LOCKED
NO_HISTORY_DELETE=LOCKED
```

## Idempotency

The receipt lookup, command digest, advisory locks, changed-input conflict
handling and receipt persistence are outside the replaced fragment and remain
unchanged. Exact replay must continue returning the existing receipt without
creating duplicate CoverageVersion rows.

## Evidence binding

Evidence ownership is unchanged. The new verification is stronger because the
CoverageVersion must point to the exact `policy_evidence_versions.id` resolved
for the command, in addition to matching the exact item digest.

## Authority boundaries

```text
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
EVIDENCE_OWNER=UNCHANGED
POLICY_TRUTH_OWNER_CHANGED=NO
CLIENT_CONTRACT_CHANGED=NO
FUNCTION_SIGNATURE_CHANGED=NO
UNKNOWN_NOT_ZERO=LOCKED
BENEFICIARY_BOUNDARY=LOCKED
NO_PARALLEL_WRITER=PASS
NO_PARALLEL_VERSION_LEDGER=PASS
AURA_MUTATION=NO
```

The deployed `20260808000100_policy_coverage_canonical_extension.sql` is not
modified. The hotfix is forward-only.

## Tests

Targeted hotfix tests cover:

- new v1 commands with 1, 2 and 3 Coverage items;
- v1 -> v2 and v1 -> v2 -> v3;
- two existing Coverage references advancing together;
- mandatory mixed-version command;
- exact-version negative cases for missing/wrong Coverage reference, version,
  PolicyVersion, EvidenceVersion, facts digest and missing command item;
- irrelevant historical duplicates not satisfying a missing requested version;
- inherited unknown/null semantics;
- inherited idempotency, atomic wrapper, RLS and direct-write denial contracts.

Inherited Cartera 010B/020C regressions remain part of the Coverage CI workflow.

## Remote deployment status

```text
REMOTE_DEPLOYMENT_STATUS=PENDING_REPOSITORY_GATES
PRODUCTIVE_ACCEPTANCE_STATUS=PENDING
```

Remote deployment is authorized only after exact-head repository CI passes,
this hotfix PR is merged with expected-head protection, post-merge Pages
governance confirms no automatic Pages deployment, and current main is
revalidated.
