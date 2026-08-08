# Forge Aura Income UX Reconciliation Acceptance 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PR_NUMBER=299
BASE_MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
RECONCILED_IMPLEMENTATION_MERGE_HEAD=da303b7e0ae54e87b87ccd10b81cf253cb0f9c07
VALIDATED_RECONCILED_HEAD=e3ff0fc0158ae319b73aa0904beb215ecce9e4e7
VALIDATED_RECONCILED_CI_RUN=31269711412
EVIDENCE_STATE=CI_VALIDATED_REVIEW_READY_CANDIDATE
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Constitutional acceptance

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

Economic assertions remain locked and passed:

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

The branch was reconciled non-destructively by merging current `main` into the controlled Income branch. The implementation merge commit is `da303b7e0ae54e87b87ccd10b81cf253cb0f9c07`.

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
- current Cartera PDF recovery/review Edge Function is inherited from `main` unchanged.

Income behavior preserved:

- route `comisiones` mounts Income;
- visible product label is `Ingresos`;
- generated / expected / scenario layers remain distinct;
- complete YTD remains unavailable when authority is incomplete;
- session scrub and advisor-switch scrub remain active;
- late async results are rejected after unmount;
- Pages `.js` mirrors remain byte-identical to governed `.mjs` source modules.

## Scope acceptance

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
SCOPE_GATE=PASS
```

## Final reconciled CI acceptance

Run `31269711412` validated head `e3ff0fc0158ae319b73aa0904beb215ecce9e4e7` with all three required jobs successful:

```text
INCOME_CONSTITUTIONAL_CONTRACT_AND_SCOPE=PASS
CANONICAL_PAGES_ARTIFACT_AND_IMPORT_GRAPH=PASS
INCOME_RESPONSIVE_ACCESSIBILITY_AND_LIFECYCLE=PASS
```

Canonical Pages acceptance:

```text
PAGES_ARTIFACT_BUILD=PASS
INCOME_IMPORT_GRAPH=PASS
CARTERA_IMPORT_GRAPH=PASS
NO_BLANK_SCREEN_IMPORT_FAILURE=PASS
```

The artifact contract verifies that current Cartera v2/v3 assets survive canonical publication and that published v3 still resolves to the authenticated v2 Functions invoke transport while Income mirrors resolve correctly.

Browser acceptance passed for:

- 1440 desktop;
- 834 tablet;
- 390 mobile;
- 200% effective viewport;
- visible keyboard focus;
- minimum actionable target sizing;
- one H1 and semantic sections;
- reduced motion;
- generated / expected / scenario separation;
- UNKNOWN as unavailable rather than zero;
- absence of bank/deposit payout claims;
- session scrub;
- unmount and late-result rejection;
- browser import smoke for current Cartera and Income modules under the reconciled runtime.

```text
BROWSER_GATE=PASS
ACCESSIBILITY_GATE=PASS
LIFECYCLE_GATE=PASS
CROSS_MODULE_CARTERA_GATE=PASS
```

Run `31269711412` produced:

- `aura-income-canonical-site-e3ff0fc0158ae319b73aa0904beb215ecce9e4e7`;
- `aura-income-visual-e3ff0fc0158ae319b73aa0904beb215ecce9e4e7`.

Required screenshot set passed:

- `01-income-desktop.png`
- `02-income-mobile-390.png`
- `03-income-tablet-834.png`
- `04-income-zoom-200-effective.png`
- `05-income-reduced-motion.png`

## Historical evidence retained

A prior full acceptance run succeeded before `main` advanced again:

```text
HISTORICAL_VALIDATED_HEAD_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
HISTORICAL_CI_RUN_ID=31262989102
HISTORICAL_CONSTITUTIONAL_SCOPE_JOB=PASS
HISTORICAL_CANONICAL_PAGES_JOB=PASS
HISTORICAL_BROWSER_ACCEPTANCE_JOB=PASS
```

Earlier attempts exposed and corrected three test/infrastructure issues: `.mjs` files were not published by the canonical Pages extension allowlist, an economic safeguard literal triggered an overly broad regex, and Playwright initially served fixtures from the wrong directory. `main` later advanced with Cartera work and required the final non-destructive reconciliation. That history is intentionally retained.

## Final evidence semantics

A workflow run ID exists only after a commit has been created, and a Git commit cannot contain its own future SHA. The immutable repository evidence therefore records the last exact reconciled head/run pair already validated. PR #299 records the exact latest documentation head/run pair after this evidence-only commit is itself validated.

```text
BASE_MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
VALIDATED_RECONCILED_HEAD=e3ff0fc0158ae319b73aa0904beb215ecce9e4e7
VALIDATED_RECONCILED_CI_RUN=31269711412
CONSTITUTIONAL_GATE=PASS
STATIC_CONTRACT_GATE=PASS
PAGES_GATE=PASS
BROWSER_GATE=PASS
CROSS_MODULE_CARTERA_GATE=PASS
OUT_OF_SCOPE_VIOLATION=0
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
FINAL_STATUS=REVIEW_READY_CANDIDATE
```

The PR may be marked Ready for Review only after CI passes on the documentation commit containing this evidence. No merge to `main`, auto-merge or production deployment occurred.
