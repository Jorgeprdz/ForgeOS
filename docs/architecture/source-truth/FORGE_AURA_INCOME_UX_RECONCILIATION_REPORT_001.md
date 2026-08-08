# Forge Aura Income UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PR_NUMBER=299
PRODUCT_SURFACE=ADVISOR_OS_INCOME
CURRENT_ROUTE_ID=comisiones
VISIBLE_PRODUCT_NAME=Ingresos
STATUS=FINAL_RECONCILIATION_CI_PENDING
```

## Gate 0 — recovered state

State was re-read from GitHub before the final reconciliation; historical values were not assumed.

```text
MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
INCOME_BRANCH_HEAD_BEFORE_RECONCILIATION=ec7dd073db925b39ce13862f143714814435a9ac
MERGE_BASE_BEFORE_RECONCILIATION=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
BEHIND_BY_BEFORE_RECONCILIATION=17
AHEAD_BY_BEFORE_RECONCILIATION=38
PR_MERGEABLE_BEFORE=false
PR_DRAFT_BEFORE=true
RECONCILED_IMPLEMENTATION_HEAD=da303b7e0ae54e87b87ccd10b81cf253cb0f9c07
MERGE_BASE_AFTER_RECONCILIATION=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
BEHIND_BY_AFTER_RECONCILIATION=0
```

`main` advanced through PR #302 while this phase was open. The reconciliation therefore preserved the current Cartera recovery chain rather than restoring the older adapter state.

## Gate 1 — constitutional re-read

The active authorities were re-read before the final reconciliation.

```text
ARTICLE_0_READ=YES
CONSTITUTION_MAP_READ=YES
ADR_001_TO_009_PREVIOUSLY_READ=YES
ADR_007_RE_READ=YES
ADR_008_RE_READ=YES
TRUTH_BOUNDARIES_READ=YES
EVIDENCE_STATE_BOUNDARY=ACTIVE
RULE_SNAPSHOT_BOUNDARY=ACTIVE
AURA_LIGHT_AUTHORITY_READ=YES
UX_BEHAVIOR_DIRECTIVE_READ=YES
COMPENSATION_ECONOMIC_OWNERSHIP_RECONFIRMED=YES
PAGES_DEPLOYMENT_GOVERNANCE_RE_READ=YES
CONSTITUTIONAL_CONFLICTS=NONE
CONSTITUTIONAL_GATE=PASS
```

Article 0 remains above the Constitution and requires evidence, uncertainty visibility and human responsibility. ADR-007 keeps forecast as scenario rather than fact. ADR-008 requires economic values to remain source-, period-, rule- and evidence-bound; unknown economic value remains unknown and projected money is not real money.

The locked UX behavior directive remains read-only authority from `governance/forge-aura-light-2026-authority`; it was not copied into `main` or rewritten by this phase.

## Aura authority

```text
AURA_LIGHT_AUTHORITY=docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md
AURA_LIGHT_VERSION=1.0
AURA_LIGHT_STATUS=RATIFIED_CANONICAL_ACTIVE_LOCKED
LEGACY_VISUAL_AUTHORITY=NONE
LOCAL_UNGOVERNED_TOKENS=NONE
```

The Income surface keeps the Aura hierarchy: generated income as protagonist, composition second, future money separated by truth type, progressive disclosure for evidence and movements, and no Material 3 visual dependency.

## Economic authority and reuse matrix

| Capability | Authority | Result | Truth boundary |
|---|---|---|---|
| Generated monthly income | canonical compensation period snapshot / earned evidence | reused through read-only adapter | GENERATED / EARNED |
| Initial / renewal / bonus composition | canonical compensation aggregate evidence | reused | GENERATED |
| Expected renewals | forward signal contract | shown only when explicitly typed and evidenced | EXPECTED / UNKNOWN |
| Pipeline scenario | forward signal contract | shown only as explicit what-if | SCENARIO / UNKNOWN |
| Annual/YTD | canonical source history | blocked when complete Jan-current authority is unavailable | GENERATED_YTD / UNKNOWN |
| Bonus coach | governed metadata / existing engines | no local eligibility inference | GENERATED / UNKNOWN |
| Payout | payout evidence only | no bank/deposit claim without authority | UNKNOWN unless evidenced |

Locked rules:

```text
UNKNOWN_IS_NOT_ZERO=true
PROJECTED_MONEY_IS_NOT_REAL_MONEY=true
PROBABILITY_WEIGHTED_MONEY=FORBIDDEN
FRONTEND_COMMISSION_RATE_CALCULATION=FORBIDDEN
PAYOUT_CLAIM_WITHOUT_PAYOUT_TRUTH=FORBIDDEN
COMPENSATION_ENGINE_DUPLICATION=FORBIDDEN
```

## Gate 2 — current-main reconciliation

The branch was reconciled non-destructively with current `main` using a merge commit whose second parent is:

`6c97326c6558f64ffc8e58fd5e8997ae2e11cab3`

Current-main Cartera authority preserved:

- `cartera-adapter-pages-v3.js` remains the published import-map target;
- v3 wraps v2 for admission-attempt idempotency;
- v2 retains `client.functions.invoke(...)` transport;
- no manual bearer construction was reintroduced;
- the current Cartera PDF recovery/review Edge Function from `main` is inherited unchanged;
- current Cartera cache-bust lineage `aura-cartera-pdf-idempotency-004` remains authoritative;
- current Cartera contract tests from `main` remain inherited.

Income integration preserved independently:

- technical route remains `comisiones`;
- visible product name remains `Ingresos`;
- `createIncomeModule` mount remains in Aura runtime;
- Income stylesheet and Pages mirrors remain present;
- session scrub, advisor-switch scrub and late-result rejection remain present;
- generated / expected / scenario economic layers remain separated.

## Gate 3 — scope audit after reconciliation

After the merge-base became current `main`, the remaining PR diff contains only Income-authorized changes.

| Class | Paths |
|---|---|
| INCOME_DIRECT | `docs/static-preview/forge-aura/income/**` |
| AURA_SHARED_REQUIRED | `app-v4.js`, `aura-bootstrap-v4.js`, `aura-router-v4.js`, `aura-shell.js`, `aura-shell.css`, `index.html` |
| TEST_ONLY | `tests/income-*`, `tests/e2e/income-*`, `tests/fixtures/aura-income-*` |
| EVIDENCE_ONLY | this report and `docs/evidence/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001.md` |
| MAIN_SYNC_ONLY | Cartera v2/v3, Cartera Edge Function and Cartera current-main tests are inherited through the merge and no longer appear as branch-owned diff |

```text
OUT_OF_SCOPE_VIOLATION=0
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
```

## Gates 4–6 — final acceptance plan

The branch workflow must validate the reconciled head with the canonical Pages builder and Playwright.

Static / contract coverage includes:

- Income syntax and economic contracts;
- owner isolation;
- scope guard;
- inherited Advisor Compensation stage 070/080 regressions;
- Pages deployment governance;
- prohibited mutation assertions;
- current Cartera v3 → v2 authenticated Functions invoke chain;
- Income mirror byte identity;
- Income + Cartera cross-module coexistence.

Canonical Pages acceptance requires:

```text
PAGES_ARTIFACT_BUILD=PASS
INCOME_IMPORT_GRAPH=PASS
CARTERA_IMPORT_GRAPH=PASS
NO_BLANK_SCREEN_IMPORT_FAILURE=PASS
```

Browser acceptance covers:

- desktop 1440;
- tablet 834;
- mobile 390;
- 200% effective viewport;
- keyboard/focus/44px controls;
- semantic heading structure;
- reduced motion;
- UNKNOWN rendered unavailable rather than zero;
- no payout/deposit claim;
- session scrub;
- late-result rejection;
- browser import smoke for current Cartera + Income modules.

## Historical validation retained

The implementation did not pass every infrastructure/test attempt on the first try. Earlier work exposed and corrected:

1. canonical Pages does not publish `.mjs` as a public extension, so byte-identical `.js` mirrors were introduced;
2. an initial invented-money regex produced a false positive on the literal safeguard `frontendCommissionRateCalculation: false` and was narrowed to actual calculation patterns;
3. Playwright initially served from the wrong directory and returned fixture 404s; the server root was corrected;
4. while the phase remained open, Cartera changed again on `main`, requiring this final non-destructive reconciliation.

A previous complete implementation acceptance passed on:

```text
VALIDATED_IMPLEMENTATION_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
VALIDATED_CI_RUN=31262989102
PREVIOUS_CONSTITUTIONAL_SCOPE_JOB=PASS
PREVIOUS_CANONICAL_PAGES_JOB=PASS
PREVIOUS_BROWSER_ACCEPTANCE_JOB=PASS
```

That historical green run is retained as evidence but is not accepted as the final gate for the reconciled head.

## Final gate record

The exact final GitHub Actions run is recorded in PR #299 after the validating run exists. A Git commit cannot literally contain its own future GitHub Actions run ID (or its own commit SHA) before GitHub creates them; therefore the immutable repository evidence records the reconciled implementation SHA and the PR gate records the exact final head/run pair without falsifying self-referential metadata.

```text
BASE_MAIN_HEAD=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
RECONCILED_IMPLEMENTATION_HEAD=da303b7e0ae54e87b87ccd10b81cf253cb0f9c07
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

No PR merge, auto-merge, production deployment or direct `main` mutation is authorized by this report.
