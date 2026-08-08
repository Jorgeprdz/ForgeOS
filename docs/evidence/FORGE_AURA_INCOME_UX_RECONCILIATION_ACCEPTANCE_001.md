# Forge Aura Income UX Reconciliation Acceptance 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
SOURCE_SHA=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
VALIDATED_HEAD_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
BRANCH=codex/forge-aura-income-ux-reconciliation-001
CI_RUN_ID=31262989102
EVIDENCE_STATE=CI_VALIDATED_REVIEW_CANDIDATE
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
PIPELINE_PROBABILITY_WEIGHTING=NO
```

## Blocked capabilities preserved honestly

```text
EXPECTED_RENEWAL_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
PIPELINE_WHAT_IF_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
BONUS_COACH_ELIGIBILITY_SNAPSHOT=NOT_GUARANTEED
FULL_YTD_HISTORY=NOT_AVAILABLE_FROM_CURRENT_SIX_MONTH_WINDOW
```

The UI supports these contracts but shows `UNKNOWN`, `DISCONNECTED`, or `BLOCKED` when the productive read model does not provide sufficient evidence. It never substitutes zero.

## Canonical Pages publication boundary

The governed Income sources remain `.mjs`. Canonical Pages does not currently publish `.mjs` from `docs/`, so this phase adds byte-identical `.js` mirrors inside the Income surface and maps the runtime to those published assets. A CI test fails if a mirror diverges from its governed source. `pages.yml` remains unmodified.

```text
PAGES_WORKFLOW_MUTATION=ZERO
INCOME_CORE_JS_MIRROR=BYTE_IDENTICAL
INCOME_ADAPTER_JS_MIRROR=BYTE_IDENTICAL
INCOME_MODULE_JS_MIRROR=BYTE_IDENTICAL
CANONICAL_IMPORT_GRAPH=PASS
```

## Synthetic browser fixture boundary

```text
FIXTURE_PURPOSE=ISOLATED_UX_RESPONSIVE_ACCESSIBILITY_LIFECYCLE_TESTING
FIXTURE_PRESENTED_AS_PRODUCTION=NO
FAKE_PRODUCTION_DATA=FORBIDDEN_AND_NOT_USED
PRODUCTIVE_ACCEPTANCE_SOURCE=CANONICAL_READ_MODEL_ONLY
```

## Scope classification

```text
INCOME_DIRECT=
docs/static-preview/forge-aura/income/income-core.mjs
docs/static-preview/forge-aura/income/income-adapter-pages-v1.mjs
docs/static-preview/forge-aura/income/income-module.mjs
docs/static-preview/forge-aura/income/income-core.js
docs/static-preview/forge-aura/income/income-adapter-pages-v1.js
docs/static-preview/forge-aura/income/income-module.js
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

## Mutation proof

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

## CI acceptance

Workflow: `.github/workflows/income-aura-ux-reconciliation-001.yml`

Validated run: `31262989102` against head `4e2e51b29f1e777bb3168a79f98c980f105c8553`.

```text
INCOME_CONSTITUTIONAL_CONTRACT_AND_SCOPE=PASS
CANONICAL_PAGES_ARTIFACT_AND_IMPORT_GRAPH=PASS
INCOME_RESPONSIVE_ACCESSIBILITY_AND_LIFECYCLE_ACCEPTANCE=PASS
PAGES_ARTIFACT_BUILD=PASS
INCOME_IMPORT_GRAPH=PASS
DESKTOP_1440=PASS
TABLET_834=PASS
MOBILE_390=PASS
ZOOM_200_EFFECTIVE=PASS
KEYBOARD=PASS
VISIBLE_FOCUS=PASS
REDUCED_MOTION=PASS
UNKNOWN_IS_NOT_ZERO=PASS
SESSION_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
REQUIRED_SCREENSHOT_EVIDENCE=PASS
```

The validation run created the required desktop, mobile, tablet, 200%-effective viewport and reduced-motion screenshot set as CI artifacts.

## Final phase gate

```text
DOES_IT_STRENGTHEN_HUMAN_JUDGMENT=YES
DOES_IT_CREATE_DEPENDENCY=NO
ECONOMIC_VALUES_EVIDENCE_BOUND=YES
FORECAST_REMAINS_SCENARIO=YES
COMPENSATION_REMAINS_RULE_BOUND=YES
UNKNOWN_REMAINS_UNKNOWN=YES
CLIENT_FIRST_PRESERVED=YES
MONEY_USED_AS_PRESSURE=NO
PAYOUT_FIRST_BEHAVIOR=NO
HUMAN_AUTHORITY_PRESERVED=YES

CI_STATUS=PASS
FINAL_STATUS=PASS
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```
