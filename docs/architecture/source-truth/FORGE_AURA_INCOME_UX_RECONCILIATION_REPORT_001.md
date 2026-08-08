# Forge Aura Income UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PR_NUMBER=299
PRODUCT_SURFACE=ADVISOR_OS_INCOME
CURRENT_ROUTE_ID=comisiones
VISIBLE_PRODUCT_NAME=Ingresos
STATUS=IMPLEMENTED_RECONCILED_AND_CI_VALIDATED
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
RECONCILED_IMPLEMENTATION_MERGE_HEAD=da303b7e0ae54e87b87ccd10b81cf253cb0f9c07
MERGE_BASE_AFTER_RECONCILIATION=6c97326c6558f64ffc8e58fd5e8997ae2e11cab3
BEHIND_BY_AFTER_RECONCILIATION=0
```

`main` advanced through PR #302 while this phase was open. The reconciliation therefore preserved the current Cartera recovery chain rather than restoring the older adapter state.

## Gate 1 — constitutional re-read

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
AURA_LIGHT_COMPLIANCE=PASS
```

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

```text
UNKNOWN_IS_NOT_ZERO=PASS
PROJECTED_MONEY_IS_NOT_REAL_MONEY=PASS
NO_DEPOSIT_CLAIM=PASS
NO_PROBABILITY_WEIGHTED_MONEY=PASS
NO_FRONTEND_COMMISSION_ENGINE=PASS
```

## Gate 2 — current-main reconciliation

The branch was reconciled non-destructively with current `main`. Current-main Cartera authority was preserved:

- published import-map target remains `cartera-adapter-pages-v3.js?v=aura-cartera-pdf-idempotency-004`;
- v3 preserves admission-attempt idempotency and wraps v2;
- v2 retains authenticated `client.functions.invoke(...)` transport;
- manual bearer construction was not reintroduced;
- the current Cartera PDF recovery/review Edge Function is inherited unchanged from `main`;
- current Cartera cache-bust lineage remains authoritative.

Income integration remains independent:

- technical route `comisiones`;
- visible label `Ingresos`;
- `createIncomeModule` mount;
- Income stylesheet and Pages mirrors;
- session scrub and advisor-switch scrub;
- late-result rejection;
- generated / expected / scenario truth separation.

```text
MAIN_RECONCILIATION=PASS
CARTERA_HOTFIX_PRESERVED=PASS
INCOME_IMPLEMENTATION=PASS
```

## Gate 3 — scope audit

After reconciliation, current `main` is the merge-base. Main-synchronized Cartera/Supabase files are inherited and no longer appear as branch-owned Income diff.

| Class | Paths |
|---|---|
| INCOME_DIRECT | `docs/static-preview/forge-aura/income/**` |
| AURA_SHARED_REQUIRED | `app-v4.js`, `aura-bootstrap-v4.js`, `aura-router-v4.js`, `aura-shell.js`, `aura-shell.css`, `index.html` |
| TEST_ONLY | `tests/income-*`, `tests/e2e/income-*`, `tests/fixtures/aura-income-*` |
| EVIDENCE_ONLY | this report and `docs/evidence/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001.md` |
| MAIN_SYNC_ONLY | inherited through the merge; absent from branch-owned diff |

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
SCOPE_GATE=PASS
```

## Gates 4–6 — validated acceptance

The reconciled branch plus refreshed evidence was validated on:

```text
VALIDATED_RECONCILED_HEAD=e3ff0fc0158ae319b73aa0904beb215ecce9e4e7
VALIDATED_RECONCILED_CI_RUN=31269711412
INCOME_CONSTITUTIONAL_CONTRACT_AND_SCOPE=PASS
CANONICAL_PAGES_ARTIFACT_AND_IMPORT_GRAPH=PASS
INCOME_RESPONSIVE_ACCESSIBILITY_AND_LIFECYCLE=PASS
```

Static/contract coverage passed for Income syntax, economic contract, owner isolation, scope guard, Advisor Compensation 070/080 regressions, Pages deployment governance and prohibited-mutation assertions.

Canonical Pages used the production builder extracted from `.github/workflows/pages.yml`; the deployment workflow itself was not replaced or dispatched.

```text
PAGES_ARTIFACT_BUILD=PASS
INCOME_IMPORT_GRAPH=PASS
CARTERA_IMPORT_GRAPH=PASS
NO_BLANK_SCREEN_IMPORT_FAILURE=PASS
```

The canonical artifact validates Income `.js` mirrors and the current Cartera v3 → v2 authenticated Functions invoke chain.

Playwright passed:

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

```text
BROWSER_GATE=PASS
ACCESSIBILITY_GATE=PASS
LIFECYCLE_GATE=PASS
CROSS_MODULE_CARTERA_GATE=PASS
```

Run `31269711412` produced both canonical-site diagnostics and Aura Income visual evidence artifacts for head `e3ff0fc0158ae319b73aa0904beb215ecce9e4e7`.

## Historical validation retained

The implementation did not pass every infrastructure/test attempt on the first try. Earlier work exposed and corrected:

1. `.mjs` was outside the canonical Pages public extension allowlist, so byte-identical `.js` mirrors were introduced;
2. an invented-money regex falsely matched the literal safeguard `frontendCommissionRateCalculation: false` and was narrowed to actual calculation patterns;
3. Playwright initially served from the wrong directory and returned fixture 404s;
4. `main` subsequently advanced with Cartera work, requiring the non-destructive final reconciliation.

A prior complete implementation acceptance also passed on:

```text
HISTORICAL_VALIDATED_IMPLEMENTATION_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
HISTORICAL_VALIDATED_CI_RUN=31262989102
```

That earlier run remains historical evidence only; the reconciled validation is run `31269711412`.

## Final evidence semantics

GitHub creates a workflow run ID only after a commit exists, and a Git commit cannot literally embed its own future SHA/run ID. Therefore repository evidence records the last exact code/evidence head already validated, while PR #299 is the mutable final gate that records the exact latest documentation head and its CI run after this document update is itself validated.

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

The PR may be marked Ready for Review only after CI passes on the documentation commit containing this record. No PR merge, auto-merge, production deployment or direct `main` mutation is authorized.
