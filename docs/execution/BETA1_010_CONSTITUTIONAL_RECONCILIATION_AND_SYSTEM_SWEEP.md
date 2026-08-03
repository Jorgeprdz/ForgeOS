# BETA1 010 Constitutional Reconciliation and System Sweep

```text
PHASE=BETA1_010_CONSTITUTIONAL_RECONCILIATION_AND_SYSTEM_SWEEP
BETA_RELEASE=1
MODE=AUDIT_AND_CONTROLLED_REPAIR
CONSTITUTION_AUTHORITY=ENFORCED
BUILD_TREE_COMPARISON=REQUIRED
MIRANDA_APPROVAL=GRANTED
BOARD_APPROVAL=GRANTED
S1_CONTROLLED_REPAIR=AUTHORIZED
BRANCH=audit/beta1-010-constitutional-system-sweep
MERGE_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
```

## Scope

This phase reconciles the deployed Beta 1 runtime with the Constitution,
current repository authorities and the Build Tree. Repairs remain confined to
the dedicated phase branch until controlled review.

## Initial S1 repair target

Restore one canonical productive GitHub Pages runtime. The stable
`/static-preview/forge-alive/` route must not be overwritten after deployment
with a historical entrypoint, and acceptance must exercise that exact stable
route.

## Prohibited operations

- Merge to `main`.
- Production or Supabase mutation.
- Destructive schema or data changes.
- Authentication or RLS relaxation.
- Automatic acceptance of skipped browser coverage.
- Substitution of productive data with mocks.

## Controlled S1 repair implemented locally

- Retired the post-deployment workflow that automatically republished the
  historical Forge Alive surface over the canonical Pages route.
- Kept the primary Pages workflow as the only canonical publisher.
- Pointed Beta 1 live acceptance at the stable
  `/static-preview/forge-alive/` URL instead of the noncanonical material path.
- Required live acceptance to prove both anonymous route rejection and a real
  authenticated session; absent credentials are blocked, never converted into
  a skipped pass.
- Added the productive Cartera, Pipeline bulk import and WhatsApp composer
  assets to the Pages artifact closure contract.
- Updated runtime-authority tests to reject resurrection of the historical
  republisher.

No remote workflow, deployment, Supabase mutation, commit, push or merge was
performed.

## Local regression evidence

```text
TEST=Focused canonical Pages and release contracts
ENVIRONMENT=LOCAL_ANDROID_NODE
RESULT=PASS
EVIDENCE=release workflow, canonical runtime authority, restore retirement, YAML parse, node syntax and git diff checks passed

TEST=Beta 1 local regression selection
ENVIRONMENT=LOCAL_ANDROID_NODE
RESULT=PARTIAL
EVIDENCE=24 PASS, 2 FAIL_PREEXISTING_CONTRACT_DEBT, 1 BLOCKED_PLATFORM

TEST=Public authenticated browser walkthrough
ENVIRONMENT=GITHUB_PAGES
RESULT=BLOCKED
EVIDENCE=requires an authorized push/deployment plus productive test credentials; neither production mutation nor push is authorized
```

Open local validation findings:

| ID | Severity | Module | Finding | Cause | State |
| --- | --- | --- | --- | --- | --- |
| BETA1-010-V01 | S3 | Pages publication test | `forge-067g16b-pages-publication-test.mjs` expects Pipeline assets in the retired bridge HTML | Test still treats the legacy entry bridge as productive runtime | OPEN; do not restore legacy assets |
| BETA1-010-V02 | S4 | Pipeline responsive CSS | Responsive contract rejects the hardcoded fallback `#f2cf75` | Productive CSS contains a non-token fallback | OPEN; UI repair not authorized by S1 approval |
| BETA1-010-V03 | BLOCKED | Referral CTA browser test | Playwright exits with `Unsupported platform: android` | Current execution platform cannot launch Playwright | BLOCKED; rerun in supported CI/browser environment |

## Current acceptance boundary

```text
PRODUCTIVE_RUNTIME=LOCALLY_REPAIRED_NOT_PUBLICLY_CONFIRMED
LEGACY_RUNTIME_FALLBACK=REMOVED_FROM_LOCAL_DEPLOYMENT_WORKFLOW
GITHUB_PAGES_ACCEPTANCE=BLOCKED
MERGE_AUTHORIZED=NO
PRODUCTION_MUTATION_AUTHORIZED=NO
PHASE_COMPLETE=NO
```
