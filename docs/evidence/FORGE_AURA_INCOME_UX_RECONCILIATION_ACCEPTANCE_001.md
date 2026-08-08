# Forge Aura Income UX Reconciliation Acceptance 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
SOURCE_SHA=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
BRANCH=codex/forge-aura-income-ux-reconciliation-001
EVIDENCE_STATE=PRE_CI_REVIEW_CANDIDATE
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Constitutional result before implementation

```text
ARTICLE_0=PASS
CONSTITUTIONAL_GATE=PASS
ADR_001=PASS
ADR_002=PASS
ADR_003=PASS
ADR_004=PASS
ADR_005=PASS
ADR_006=PASS
ADR_007=PASS
ADR_008=PASS
ADR_009=PASS
ADR_012=PASS
ADR_014=PASS
ADR_016=PASS
ADR_017=PASS
ADR_018=PASS
ADR_023=PASS
ADR_024=PASS
CONSTITUTIONAL_CONFLICTS=NONE
```

## Implemented product surface

The visible Aura product is `Ingresos`; the technical route remains `comisiones`.

Implemented read-only capabilities:

- protagonist `Ingreso generado este mes` using earned canonical compensation evidence;
- initial / renewal / generated-bonus composition from canonical compensation event concept/kind;
- adjustment and reversal preservation;
- expected-renewal presentation only from explicitly typed, evidence-complete forward signals;
- Pipeline what-if presentation only from explicitly typed, evidence-complete forward signals and never `probability × money`;
- explicit separation of `GENERATED`, `EXPECTED`, `SCENARIO`, and `UNKNOWN`;
- generated bonus versus Bonus Coach eligibility separation;
- Bonus Coach refuses to infer Training / New Professional eligibility without governed metadata;
- annual view refuses to manufacture missing months beyond canonical history;
- movement ledger with progressive `Cómo se calculó` evidence;
- payout evidence remains advanced disclosure and never becomes the hero claim;
- session scrub, late-result rejection and active-advisor switch scrub;
- exact-owner adapter validation;
- canonical Aura Light token-only module styling;
- mobile 390, tablet 834, desktop 1440 and 200%-effective viewport acceptance coverage;
- keyboard, visible focus, minimum target and reduced-motion acceptance coverage.

## Canonical reuse

```text
COMPENSATION_READ_RPC=forge_advisor_compensation_read_product
PRODUCT_READ_MODEL=ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001
PERIOD_SNAPSHOT=ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001
HISTORY_SERIES=ADVISOR_COMPENSATION_HISTORY_SERIES_001
COMPENSATION_EVENT_CONCEPTS=REUSED
BONUS_ENGINES=READ_ONLY_AUTHORITY_REUSED
RULE_PACKS=READ_ONLY_AUTHORITY_REUSED
FRONTEND_COMMISSION_RATE_CALCULATION=NO
```

## Blocked capabilities preserved honestly

```text
EXPECTED_RENEWAL_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
PIPELINE_WHAT_IF_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
BONUS_COACH_ELIGIBILITY_SNAPSHOT=NOT_GUARANTEED
FULL_YTD_HISTORY=NOT_AVAILABLE_FROM_CURRENT_SIX_MONTH_WINDOW
```

The UI supports these contracts but shows `UNKNOWN`, `DISCONNECTED`, or `BLOCKED` when the productive read model does not provide sufficient evidence. It never substitutes zero.

## Synthetic browser fixture boundary

```text
FIXTURE_PURPOSE=ISOLATED_UX_RESPONSIVE_ACCESSIBILITY_LIFECYCLE_TESTING
FIXTURE_PRESENTED_AS_PRODUCTION=NO
FAKE_PRODUCTION_DATA=FORBIDDEN_AND_NOT_USED
PRODUCTIVE_ACCEPTANCE_SOURCE=CANONICAL_READ_MODEL_ONLY
```

## Scope classification before CI

```text
INCOME_DIRECT=
docs/static-preview/forge-aura/income/income-core.mjs
docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs
docs/static-preview/forge-aura/income/income-module.mjs
docs/static-preview/forge-aura/income/income.css

AURA_SHARED_REQUIRED=
docs/static-preview/forge-aura/app-v4.js
docs/static-preview/forge-aura/aura-bootstrap-v4.js
docs/static-preview/forge-aura/aura-router-v4.js
docs/static-preview/forge-aura/aura-shell.js
docs/static-preview/forge-aura/aura-shell.css
docs/static-preview/forge-aura/index.html

TEST_ONLY=
tests/income-aura-ux-reconciliation.test.mjs
tests/income-owner-isolation.test.mjs
tests/income-pages-import-graph.test.mjs
tests/income-scope-guard.test.mjs
tests/income-playwright.config.mjs
tests/e2e/income-aura-ux-reconciliation.spec.mjs
tests/fixtures/aura-income-visual.html
tests/fixtures/aura-income-late-result.html
.github/workflows/income-aura-ux-reconciliation-001.yml

EVIDENCE_ONLY=
docs/architecture/source-truth/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001.md
docs/evidence/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001.md

OUT_OF_SCOPE_VIOLATION=0
```

## Mutation proof before CI

```text
COMPENSATION_ENGINE_MUTATION=ZERO
RULE_PACK_MUTATION=ZERO
DATABASE_MUTATION=ZERO
SCHEMA_MUTATION=ZERO
RLS_MUTATION=ZERO
PIPELINE_MUTATION=ZERO
CARTERA_WRITER_MUTATION=ZERO
FORECAST_ENGINE_MUTATION=ZERO
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## CI gates

Workflow: `.github/workflows/income-aura-ux-reconciliation-001.yml`

Required jobs:

1. `Income constitutional contract and scope`
2. `Canonical Pages artifact and import graph`
3. `Income responsive accessibility and lifecycle acceptance`

```text
CI_STATUS=PENDING_PR
FINAL_STATUS=PENDING_CI
```

No PASS is declared before those jobs execute against the pull request head.
