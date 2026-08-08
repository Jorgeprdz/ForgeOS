# Forge Aura Income UX Reconciliation Acceptance 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PR_NUMBER=299
BASE_MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
RECONCILED_IMPLEMENTATION_HEAD=da303b7e0ae54e87b87ccd10b81cf253cb0f9c07
EVIDENCE_STATE=FINAL_RECONCILIATION_CI_PENDING
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Constitutional acceptance

The final reconciliation re-read Article 0, the Constitution Map, economic/forecast truth boundaries, Aura Light 2026, the locked UX behavior directive, compensation ownership and Pages deployment governance.

```text
ARTICLE_0=PASS
CONSTITUTIONAL_GATE=PASS
CONSTITUTIONAL_CONFLICTS=NONE
ADR_007_FORECAST_BOUNDARY=PASS
ADR_008_ECONOMIC_EVIDENCE_BOUNDARY=PASS
AURA_LIGHT_2026=PASS
UX_BEHAVIOR_DIRECTIVE=PASS
PAGES_DEPLOYMENT_GOVERNANCE=PASS
```

Economic assertions remain locked:

```text
UNKNOWN_IS_NOT_ZERO=PASS
PROJECTED_IS_NOT_GENERATED=PASS
NO_DEPOSIT_CLAIM=PASS
NO_PROBABILITY_WEIGHTED_MONEY=PASS
NO_FRONTEND_COMMISSION_ENGINE=PASS
```

## Current-main reconciliation evidence

Before reconciliation:

```text
MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
INCOME_BRANCH_HEAD=ec7dd073db925b39ce13862f143714814435a9ac
MERGE_BASE=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
BEHIND_BY=17
AHEAD_BY=38
PR_MERGEABLE_BEFORE=false
PR_DRAFT_BEFORE=true
```

The branch was then reconciled non-destructively by merging current `main` into the controlled Income branch. The resulting implementation merge commit is:

`da303b7e0ae54e87b87ccd10b81cf253cb0f9c07`

After reconciliation:

```text
MERGE_BASE=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
BEHIND_BY=0
MAIN_SYNC_ONLY_NOT_BRANCH_DIFF=PASS
OUT_OF_SCOPE_VIOLATION=0
```

Current-main Cartera behavior preserved:

- import map publishes `cartera-adapter-pages-v3.js?v=aura-cartera-pdf-idempotency-004`;
- v3 preserves retry-safe admission idempotency;
- v3 wraps v2 rather than replacing the authenticated transport;
- v2 preserves `client.functions.invoke(...)`;
- manual bearer construction remains absent;
- current Cartera PDF recovery/review Edge Function is inherited from `main` unchanged;
- current-main Cartera tests are inherited through the merge rather than recreated by Income.

Income behavior preserved:

- route `comisiones` mounts Income;
- visible product label is `Ingresos`;
- generated / expected / scenario layers remain distinct;
- complete YTD remains unavailable when authority is incomplete;
- session scrub and advisor-switch scrub remain active;
- late async results are rejected after unmount;
- Pages `.js` mirrors remain byte-identical to governed `.mjs` source modules.

## Scope evidence

The post-reconciliation diff against current `main` contains only authorized Income phase files and required shared Aura integration files.

```text
COMPENSATION_ENGINE_MUTATION=ZERO
RULE_PACK_MUTATION=ZERO
DATABASE_MUTATION=ZERO
SCHEMA_MUTATION=ZERO
RLS_MUTATION=ZERO
PIPELINE_WRITER_MUTATION=ZERO
CARTERA_WRITER_MUTATION=ZERO
FORECAST_ENGINE_MUTATION=ZERO
FRONTEND_COMMISSION_RATE_CALCULATION=ZERO
PROBABILITY_WEIGHTED_MONEY=ZERO
OUT_OF_SCOPE_VIOLATION=0
```

## Canonical Pages acceptance target

The final workflow uses the canonical Pages workflow's build/validation programs; it does not replace `.github/workflows/pages.yml` and does not deploy.

Required artifact evidence:

```text
PAGES_ARTIFACT_BUILD=PENDING_FINAL_CI
INCOME_IMPORT_GRAPH=PENDING_FINAL_CI
CARTERA_IMPORT_GRAPH=PENDING_FINAL_CI
NO_BLANK_SCREEN_IMPORT_FAILURE=PENDING_FINAL_CI
```

The artifact contract now checks that current Cartera v2 and v3 assets survive canonical publication and that the published import graph still resolves v3 → v2 `functions.invoke` while Income mirrors resolve correctly.

## Browser acceptance target

Playwright acceptance covers:

- 1440 desktop;
- 834 tablet;
- 390 mobile;
- 200% effective viewport;
- visible keyboard focus;
- minimum actionable target sizing;
- one H1 and semantic sections;
- reduced motion;
- generated/expected/scenario truth separation;
- UNKNOWN as unavailable, not zero;
- no bank/deposit payout claim;
- session scrub;
- unmount and late-result rejection;
- browser import smoke proving current Cartera and Income modules can be imported together under the reconciled runtime/import map.

Required browser evidence:

```text
BROWSER_GATE=PENDING_FINAL_CI
ACCESSIBILITY_GATE=PENDING_FINAL_CI
LIFECYCLE_GATE=PENDING_FINAL_CI
CROSS_MODULE_CARTERA_GATE=PENDING_FINAL_CI
```

Expected screenshot evidence remains:

- `01-income-desktop.png`
- `02-income-mobile-390.png`
- `03-income-tablet-834.png`
- `04-income-zoom-200-effective.png`
- `05-income-reduced-motion.png`

## Historical evidence retained

A prior full acceptance run succeeded before `main` advanced again:

```text
VALIDATED_HEAD_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
CI_RUN_ID=31262989102
INCOME_CONSTITUTIONAL_SCOPE_JOB=PASS
CANONICAL_PAGES_JOB=PASS
BROWSER_ACCEPTANCE_JOB=PASS
```

Earlier attempts also exposed and corrected three test/infrastructure issues: `.mjs` files were not published by the canonical Pages extension allowlist, an economic safeguard literal triggered an overly broad regex, and Playwright initially served fixtures from the wrong directory. That history is intentionally retained; this evidence does not claim first-attempt success.

The historical green run is not used as the final acceptance for the reconciled branch.

## Final immutable-evidence rule

GitHub assigns a workflow run ID only after a commit exists, and a Git commit cannot contain its own SHA before that commit is created. To avoid falsifying self-referential evidence, this file records the reconciled implementation SHA and the PR gate records the exact final head/run pair after GitHub creates the validating run.

```text
FINAL_BRANCH_HEAD=RESOLVED_IN_PR_GATE_AFTER_VALIDATION
FINAL_CI_RUN=RESOLVED_IN_PR_GATE_AFTER_VALIDATION
CONSTITUTIONAL_GATE=PASS
STATIC_CONTRACT_GATE=PENDING_FINAL_CI
PAGES_GATE=PENDING_FINAL_CI
BROWSER_GATE=PENDING_FINAL_CI
CROSS_MODULE_CARTERA_GATE=PENDING_FINAL_CI
OUT_OF_SCOPE_VIOLATION=0
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
FINAL_STATUS=CI_PENDING
```

No merge to `main`, auto-merge or production deployment is part of this acceptance phase.
