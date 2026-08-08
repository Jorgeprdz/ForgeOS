# FORGE PAGES EXPLICIT DEPLOYMENT GOVERNANCE 001

## Execution identity

```text
PHASE=FORGE_GITHUB_PAGES_EXPLICIT_DEPLOYMENT_GOVERNANCE_HOTFIX_001
CODENAME=PAGES_EXPLICIT_DEPLOY_GUARD
OWNER_AUTHORIZATION=OK_GO_PAGES_EXPLICIT_DEPLOY_GUARD
BASE_MAIN_SHA=8fd651f63854a1807afb2bfebd5f6920f57c062a
TARGET=GITHUB_PAGES_PRODUCTION_DEPLOYMENT_BOUNDARY
DIRECT_MAIN_EDIT=NO
AUTO_MERGE=NO
SUPABASE_MUTATION=NO
AURA_PRODUCT_MUTATION=NO
APPLICATION_RUNTIME_MUTATION=NO
PAGES_CONTENT_DEPLOYMENT_DURING_HOTFIX=NO
CURRENT_PUBLIC_SITE_ROLLBACK=NO
```

## Constitutional gate

```text
CONSTITUTION=FORGE_CONSTITUTION_V3
ARTICLE_0=RATIFIED_ACTIVE
REPOSITORY_GOVERNANCE=ROBOCOP_LOCK_001
APPLICABLE_ADRS=ADR_023,ADR_024
BUILD_TREE_AREA=STATIC_PREVIEW_DEPLOYMENT_BOUNDARY/GITHUB_PAGES_CI_CD
DISCOVERY_STATUS=LOCKED
IMPLEMENTATION_READINESS=READY
MIRANDA_APPROVAL=APPROVED_INHERITED_RATIFIED_BOUNDARY
BOARD_APPROVAL=NOT_REQUIRED_NO_PRODUCT_RUNTIME_OR_DOMAIN_AUTHORITY_CHANGE
OWNER_AUTHORIZATION=OK_GO_PAGES_EXPLICIT_DEPLOY_GUARD
```

Article 0 preserves human responsibility. Existing static-preview/deployment source truth and the Unified Build Tree already state that GitHub Pages availability is not deployment authorization. This hotfix does not create a new product authority; it makes the executable CI/CD boundary comply with that already-ratified separation.

## Incident

The Coverage productive deployment acceptance exposed a release-governance defect after PR #292 was merged.

```text
INCIDENT_RUN=31237895317
INCIDENT_EVENT=push
INCIDENT_REF=main
INCIDENT_SOURCE_SHA=8fd651f63854a1807afb2bfebd5f6920f57c062a
INCIDENT_WORKFLOW=.github/workflows/pages.yml
INCIDENT_DEPLOY_STEP=Deploy to GitHub Pages
INCIDENT_DEPLOY_RESULT=success
AUTO_DEPLOY_INCIDENT_CONFIRMED=YES
```

The merge operation itself was not the architectural defect. The defect was that the production Pages workflow treated a generic `push` to `main` as sufficient deployment authority.

## Root cause

```text
ROOT_CAUSE=PRODUCTION_PAGES_DEPLOYMENT_COUPLED_TO_GENERIC_MAIN_PUSH
OLD_INVARIANT=MERGE_TO_MAIN_IMPLICITLY_AUTHORIZES_PAGES_DEPLOYMENT
NEW_INVARIANT=MERGE_DOES_NOT_IMPLY_DEPLOY
```

The previous production workflow contained `on.push.branches: main` while also holding `pages: write`, `id-token: write`, the `github-pages` environment and `actions/deploy-pages`.

A second indirect path also existed: `.github/workflows/aura-pages-dispatch.yml` automatically reacted to a feature-branch push and called `createWorkflowDispatch` for `pages.yml`. That path could bypass the intended human production-deployment decision even after removing the direct `main` push trigger.

## Deployment-path discovery

Repository-wide workflow discovery searched for `pages: write`, `id-token: write`, `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, `github-pages`, automatic push triggers and workflow dispatch calls.

Classification at the base SHA:

| Workflow | Classification | Finding |
| --- | --- | --- |
| `.github/workflows/pages.yml` | `PRODUCTION_PAGES_DEPLOYER` | Only workflow containing `actions/deploy-pages`, Pages configuration/artifact upload, `github-pages` environment and production Pages write permissions. Previously auto-triggered by `push: main`. |
| `.github/workflows/aura-pages-dispatch.yml` | `LEGACY_INDIRECT_AUTO_DISPATCHER` | Previously held `actions: write` and automatically dispatched `pages.yml` from an Aura feature-branch push. |
| `.github/workflows/pages-public-acceptance.yml` | `VALIDATION_ONLY` | Verifies an already deployed exact SHA and records evidence; previously assumed every `main` push would be deployed. |
| `.github/workflows/pages-deploy-observer.yml` | `VALIDATION_ONLY` | Observes an already authorized deployment; previously searched specifically for a `pages.yml` push run. |
| `.github/workflows/canonical-pages-artifact-validation.yml` | `PAGES_ARTIFACT_BUILDER_ONLY/VALIDATION_ONLY` | PR-only, read-only canonical artifact validation. |
| `.github/workflows/segubeca-pages-authority-asset.yml` | `INHERITED_PAGES_VALIDATION` | Product-preservation check that is triggered by `pages.yml` changes and contains a bounded-path guard from its own prior hotfix. |

```text
ALL_PAGES_DEPLOY_PATHS_DISCOVERED=PASS
DIRECT_PRODUCTION_DEPLOYERS=1
INDIRECT_AUTOMATIC_PRODUCTION_DISPATCHERS_BEFORE_FIX=1
```

## New production deployment contract

```text
PAGES_PRODUCTION_DEPLOYMENT=
EXPLICIT_HUMAN_AUTHORIZED_WORKFLOW_DISPATCH
+
EXACT_SHA_BINDING

PAGES_DEPLOYMENT_TRIGGER=EXPLICIT_WORKFLOW_DISPATCH
MAIN_PUSH_AUTO_DEPLOY=DISABLED
EXACT_SHA_REQUIRED=YES
EXPLICIT_AUTHORIZATION_REQUIRED=YES
AUTHORIZATION_VALUE=DEPLOY_FORGE_PAGES
MAIN_ONLY=YES
REMOTE_MAIN_SHA_RECHECK=YES
MERGE != DEPLOY
```

Before Pages configuration, artifact upload or production mutation can execute, an authorization job with no Pages write or OIDC deployment permission verifies:

1. `github.ref == refs/heads/main`;
2. `authorization == DEPLOY_FORGE_PAGES`;
3. `github.sha == expected_sha`;
4. remote `refs/heads/main == expected_sha`.

Any mismatch exits non-zero and `needs: authorize` prevents the deploy job from running.

## Least privilege

Top-level workflow permissions are `contents: read` only. Only the gated deployment job receives:

```text
contents: read
pages: write
id-token: write
```

The `github-pages` environment exists only on that gated deployment job.

## Indirect dispatch closure

The historical Aura dispatcher no longer owns `actions: write`, no longer calls `createWorkflowDispatch`, and cannot invoke `pages.yml` automatically. It remains only as a read-only guard.

```text
AURA_PAGES_PRODUCTION_AUTO_DISPATCH=DISABLED
SECOND_AUTOMATIC_DEPLOY_BACKDOOR=REMOVED
```

No Aura product file or runtime behavior is changed.

## Validation workflow reconciliation

`pages-public-acceptance.yml` and `pages-deploy-observer.yml` no longer run on generic `main` pushes. Both require explicit dispatch with an exact SHA; the observer searches for an explicit `workflow_dispatch` production Pages run.

The canonical Pages artifact PR validation runs the static governance contract before executing its inherited artifact build and validation.

The inherited SeguBeca Pages authority check initially failed at its own bounded-path precondition because the old guard allowed `pages.yml` but rejected every other Pages-governance file in the same PR. No SeguBeca test had executed at that failure point. The guard is widened only to the explicit Pages-governance files in this hotfix so the inherited SeguBeca preservation tests can actually run. No SeguBeca product, formula, binding source or database surface is changed.

## Artifact semantics

The productive Pages artifact builder, public Supabase configuration validation, canonical runtime generation, canonical-only artifact validation, artifact upload and `actions/deploy-pages` implementation remain structurally unchanged inside the gated deployment job.

```text
PAGES_ARTIFACT_SEMANTICS_CHANGED=NO
PRODUCT_RUNTIME_MUTATION=NO
AURA_MUTATION=NO
SUPABASE_MUTATION=NO
```

The hotfix changes when deployment is authorized, not what the productive site contains.

## Static governance acceptance

`tests/pages-explicit-deployment-governance.test.mjs` proves without deploying:

- production `pages.yml` has no `push` trigger;
- `workflow_dispatch` is required;
- `expected_sha` and explicit authorization are required;
- main-only, exact-SHA and remote-main guards exist;
- Pages write permissions occur only behind authorization;
- only one workflow contains `actions/deploy-pages`;
- no workflow with `pages: write` exposes an automatic push trigger;
- the Aura workflow cannot auto-dispatch `pages.yml`;
- Pages acceptance/observer no longer assume automatic deployment;
- main push, feature dispatch, wrong authorization and SHA mismatch are denied;
- only an exact explicitly authorized main SHA is eligible.

## Current public site

The prior deployment associated with `8fd651f63854a1807afb2bfebd5f6920f57c062a` completed and the existing Pages Public Acceptance run verified that same deployed SHA and canonical surface.

```text
CURRENT_PAGES_BUILD_SHA=8fd651f63854a1807afb2bfebd5f6920f57c062a
CURRENT_PAGES_ACCEPTANCE=PASS
CURRENT_SITE_ACTION=LEAVE_AS_IS
ROLLBACK=NO
```

The governance violation is not a rollback instruction.

## Files in bounded hotfix

1. `.github/workflows/pages.yml`
2. `.github/workflows/aura-pages-dispatch.yml`
3. `.github/workflows/pages-public-acceptance.yml`
4. `.github/workflows/pages-deploy-observer.yml`
5. `.github/workflows/canonical-pages-artifact-validation.yml`
6. `.github/workflows/segubeca-pages-authority-asset.yml` — CI path-guard compatibility only
7. `tests/pages-explicit-deployment-governance.test.mjs`
8. `docs/12-deployment/GITHUB_PAGES_DEPLOYMENT.md`
9. this source-truth record

No product source, static-preview product surface, Supabase migration, database schema, Aura implementation, Pipeline, Activity, Cartera product code, Quotes product code, NASH, Commissions or Dashboard file is mutated.

## Explicit non-authorizations

```text
DIRECT_MAIN_EDIT=FORBIDDEN
AUTO_MERGE=FORBIDDEN
PAGES_DEPLOYMENT_DURING_HOTFIX=FORBIDDEN
CURRENT_PUBLIC_SITE_ROLLBACK=FORBIDDEN
SUPABASE_MUTATION=FORBIDDEN
DATABASE_MIGRATION=FORBIDDEN
AURA_PRODUCT_MUTATION=FORBIDDEN
APPLICATION_RUNTIME_MUTATION=FORBIDDEN
UNRELATED_PR_MERGE=FORBIDDEN
```

## Acceptance state

```text
ROBOCOP_PRECHECK=PASS
SCOPE_GUARD=PASS_9_BOUNDED_FILES
PAGES_AUTO_MAIN_TRIGGER_REMOVED=IMPLEMENTED
EXPLICIT_DISPATCH=IMPLEMENTED
MAIN_ONLY_GUARD=IMPLEMENTED
EXPECTED_SHA_GUARD=IMPLEMENTED
AUTHORIZATION_GUARD=IMPLEMENTED
NO_SECOND_AUTO_DEPLOY_PATH=IMPLEMENTED
PAGES_DEPLOY_EXECUTED=NO
```

Final acceptance still requires green CI on the exact final hotfix head and, after an owner-authorized expected-head merge of this hotfix only, proof that the resulting `main` push creates no production Pages deployment. Production Pages must not be manually dispatched during that post-merge test.
