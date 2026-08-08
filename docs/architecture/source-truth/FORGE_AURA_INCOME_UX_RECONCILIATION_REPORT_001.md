# Forge Aura Income UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
SOURCE_SHA=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
VALIDATED_IMPLEMENTATION_SHA=4e2e51b29f1e777bb3168a79f98c980f105c8553
VALIDATED_CI_RUN=31262989102
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PRODUCT_SURFACE=ADVISOR_OS_INCOME
CURRENT_ROUTE_ID=comisiones
VISIBLE_PRODUCT_NAME=Ingresos
STATUS=IMPLEMENTATION_AND_ACCEPTANCE_COMPLETE
```

## Constitutional gate

```text
ARTICLE_0_READ=YES
CONSTITUTION_MAP_READ=YES
ADR_001_READ=YES
ADR_002_READ=YES
ADR_003_READ=YES
ADR_004_READ=YES
ADR_005_READ=YES
ADR_006_READ=YES
ADR_007_READ=YES
ADR_008_READ=YES
ADR_009_READ=YES
ADR_012_READ=YES
ADR_014_READ=YES
ADR_016_READ=YES
ADR_017_READ=YES
ADR_018_READ=YES
ADR_023_READ=YES
ADR_024_READ=YES
TRUTH_BOUNDARIES_READ=YES
AURA_AUTHORITY_READ=YES
UX_BEHAVIOR_DIRECTIVE_READ=YES
CONSTITUTIONAL_CONFLICTS=NONE
```

The locked UX behavior directive is read-only authority from `governance/forge-aura-light-2026-authority`; it was not copied or merged by this phase.

## Aura gate

```text
AURA_LIGHT_AUTHORITY=docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md
AURA_LIGHT_SOURCE_PDF_SHA256=0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e
AURA_LIGHT_VERSION=1.0
AURA_LIGHT_COMPLIANCE=PASS
LEGACY_VISUAL_IMPORTS=NONE
LOCAL_UNGOVERNED_TOKENS=NONE
VISUAL_ACCEPTANCE_AGAINST_CANONICAL_AUTHORITY=PASS
```

## Discovery sources

Material / current compensation surface:

- `docs/static-preview/forge-alive-material3/compensation-module.js`
- `docs/static-preview/forge-alive-material3/compensation-runtime-renderer-120.js`
- `platform/compensation/advisor-compensation-070-view.js`
- `advisor-os/compensation/advisor-compensation-070-source.js`
- `comisiones.js`

Canonical compensation truth / read-model authorities:

- `compensation/advisor/events/advisor-compensation-event-contract.js`
- `compensation/advisor/income/advisor-compensation-event-income-projector.js`
- `compensation/advisor/income/advisor-compensation-period-snapshot-builder.js`
- `compensation/advisor/income/advisor-compensation-period-snapshot-contract.js`
- `compensation/advisor/income/advisor-compensation-forward-signal-contract.js`
- `compensation/advisor/materialization/advisor-compensation-product-read-model-materializer.js`
- `advisor-os/compensation/advisor-compensation-supabase-provider-100.js`

Bonus / career authorities inspected:

- `compensation/advisor/engine/advisor-direct-bonus-engine.js`
- `compensation/advisor-development/advisor-development-training-allowance-engine.js`
- `compensation/new-professional/rule-data/smnyl-new-professional-2026.rule-pack.json`

Aura runtime inspected:

- `docs/static-preview/forge-aura/index.html`
- `docs/static-preview/forge-aura/app-v4.js`
- `docs/static-preview/forge-aura/aura-router-v4.js`
- `docs/static-preview/forge-aura/aura-shell.js`
- `docs/static-preview/forge-aura/aura-tokens.css`

## Authority inventory and reuse matrix

| Capability | Current authority | Reuse class | Implemented behavior | Truth type | Boundary |
|---|---|---|---|---|---|
| monthly generated income | period snapshot earned net + aggregate evidence | REUSE_WITH_ADAPTER | protagonist `Ingreso generado aprox.` only with usable earned evidence | GENERATED / EARNED | never payout claim |
| initial commission | canonical compensation aggregate concepts / policy year evidence | EXTEND_READ_MODEL | read-only initial composition | GENERATED | no local commission rate |
| renewal commission | canonical compensation aggregate concepts / policy year evidence | EXTEND_READ_MODEL | read-only renewal composition | GENERATED | no Policy Truth rewrite |
| generated bonus | canonical bonus events / aggregate kind | EXTEND_READ_MODEL | generated-bonus composition | GENERATED | no rule recreation |
| training | existing training allowance engines/events | REUSE_AS_IS | generated events supported; coach gap requires governed metadata | GENERATED / UNKNOWN | no age/month-only inference |
| new professional | existing rule pack/engines/events | REUSE_AS_IS | generated events supported; eligibility requires governed metadata | GENERATED / UNKNOWN | no frontend rule table |
| expected renewals | forward signal contract | REUSE_WITH_ADAPTER | only explicitly typed evidence-complete `EXPECTED_RENEWAL`; otherwise no economic conclusion | EXPECTED / UNKNOWN | not generated |
| pipeline economic scenario | forward signal contract | REUSE_WITH_ADAPTER | only explicitly typed evidence-complete `PIPELINE_WHAT_IF` | SCENARIO / UNKNOWN | never probability × money |
| annual income | canonical six-month history | BLOCKED_BY_MISSING_AUTHORITY when full YTD unavailable | honest unavailable state unless Jan-current source history exists | GENERATED_YTD / UNKNOWN | no fabricated months |
| history | canonical history series | REUSE_AS_IS | source-supported history only | GENERATED / EARNED | disclose source limit |
| adjustments | earned adjustment deltas | REUSE_AS_IS | preserved in movements/evidence | ADJUSTED | not hidden |
| reversals | append-only reversal events | REUSE_AS_IS | preserved in movements/evidence | REVERSED | not hidden |
| movement detail | canonical aggregates/events | REUSE_WITH_ADAPTER | Aura ledger + progressive `Cómo se calculó` disclosure | mixed canonical states | source/evidence retained |

## Material to Aura gap matrix

| Requirement | Material current state | Aura result | Boundary | Acceptance |
|---|---|---|---|---|
| Product name | `Comisiones` | visible `Ingresos`, technical route remains `comisiones` | no technical mass rename | PASS |
| Hero | paid/earned equal-card emphasis | one protagonist `Ingreso generado aprox.` | no deposit claim | PASS |
| Composition | equal KPI cards | Iniciales + Renovaciones + Bonos | no rate calculations | PASS |
| Future money | generic potential | Expected orange / Scenario violet | no truth promotion | PASS |
| Bonus coach | not first-class | generated vs in-reach, governed metadata required | no eligibility inference | PASS |
| Annual | six-month history | honest YTD blocked state when source incomplete | UNKNOWN is not zero | PASS |
| Visual | Material renderer | Aura Light premium hierarchy | Material 3 has no visual authority | PASS |

## Read-model design

```text
forge_advisor_compensation_read_product (existing read-only RPC)
-> ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001
-> Aura owner-preserving adapter
-> Income presentation projection
   - generated owner value
   - initial/renewal/bonus breakdown from canonical evidence
   - expected/scenario only from explicitly typed forward signals
   - annual only when complete source history exists
-> Aura Income presentation
```

The projection never creates compensation truth and never writes back.

## Canonical Pages resolution

Canonical Pages does not publish `.mjs` files from `docs/`. The phase therefore retains the governed `.mjs` source modules and adds byte-identical `.js` mirrors within the scoped Income surface. The Aura import map/runtime consumes the published mirrors, and CI asserts byte identity to prevent drift.

```text
PAGES_WORKFLOW_MUTATION=ZERO
GOVERNED_MJS_SOURCES=PRESERVED
PUBLISHED_JS_MIRRORS=BYTE_IDENTICAL
CANONICAL_PAGES_BUILD=PASS
CANONICAL_IMPORT_GRAPH=PASS
```

The latest Cartera boot guard, cache-bust and import-map boundary from `main` were preserved while mounting Ingresos.

## Known blocked capabilities

```text
EXPECTED_RENEWAL_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
PIPELINE_WHAT_IF_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
BONUS_COACH_ELIGIBILITY_SNAPSHOT=NOT_GUARANTEED
FULL_YTD_HISTORY=NOT_AVAILABLE_FROM_CURRENT_SIX_MONTH_WINDOW
```

These remain honest `UNKNOWN` / `BLOCKED` states when required productive evidence is absent. They are not converted to zero and are not invented by the presentation layer.

## Files changed — scope classification

```text
INCOME_DIRECT=
docs/static-preview/forge-aura/income/**

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

## Test and browser results

Validated CI run: `31262989102` against implementation head `4e2e51b29f1e777bb3168a79f98c980f105c8553`.

```text
CONSTITUTIONAL_GATE=PASS
ARTICLE_0_BOUNDARY=PASS
ADR017_COMPENSATION_BOUNDARY=PASS
ADR018_CLIENT_FIRST_BOUNDARY=PASS
AURA_AUTHORITY=PASS
NO_MATERIAL3_VISUAL_AUTHORITY=PASS
INITIAL_COMMISSION_BREAKDOWN=PASS
RENEWAL_COMMISSION_BREAKDOWN=PASS
BONUS_BREAKDOWN=PASS
APPROXIMATE_INCOME_LABEL=PASS
NO_DEPOSIT_CLAIM=PASS
EXPECTED_RENEWALS_NOT_GENERATED=PASS
PIPELINE_SCENARIO_NOT_GENERATED=PASS
PIPELINE_SCENARIO_NOT_PERSISTED=PASS
NO_INVENTED_PROBABILITY_MONEY=PASS
BONUS_GENERATED_VS_REACHABLE=PASS
UNKNOWN_IS_NOT_ZERO=PASS
ADJUSTMENTS_PRESERVED=PASS
REVERSALS_PRESERVED=PASS
PROGRESSIVE_DISCLOSURE=PASS
MOBILE_390=PASS
TABLET_834=PASS
DESKTOP_1440=PASS
ZOOM_200=PASS
REDUCED_MOTION=PASS
KEYBOARD=PASS
VISIBLE_FOCUS=PASS
SESSION_SCRUB=PASS
ADVISOR_SWITCH_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
TENANT_ISOLATION=PASS
SCOPE_GUARD=PASS
NO_DATABASE_MUTATION=PASS
NO_RULE_PACK_MUTATION=PASS
NO_ENGINE_MUTATION=PASS
REQUIRED_SCREENSHOT_SET=PASS
```

Browser acceptance generated the required desktop, mobile 390, tablet 834, 200%-effective viewport, and reduced-motion screenshot evidence as CI artifacts.

## Mutation status

```text
MAIN_MUTATED=NO
COMPENSATION_ENGINE_MUTATION=ZERO
RULE_PACK_MUTATION=ZERO
DATABASE_MUTATION=ZERO
SCHEMA_MUTATION=ZERO
RLS_WEAKENING=ZERO
PIPELINE_MUTATION=ZERO
CARTERA_WRITER_MUTATION=ZERO
FORECAST_ENGINE_MUTATION=ZERO
AUTOMATIC_PAYOUT_CONFIRMATION=ZERO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Constitutional success test

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
```

## Final gates

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
MATERIAL_COMPENSATION_ANALYZED=PASS
CANONICAL_COMPENSATION_AUTHORITY_REUSED=PASS
INITIAL_RENEWAL_SEPARATION=PASS
BONUS_ENGINE_REUSED=PASS
INCOME_GENERATED_APPROX=PASS
DEPOSIT_CLAIM=NONE
EXPECTED_RENEWALS_SEPARATED=PASS
PIPELINE_SCENARIO_SEPARATED=PASS
PIPELINE_NOT_PROMOTED_TO_TRUTH=PASS
ANNUAL_INCOME_VIEW=PASS
MOVEMENT_LEDGER=PASS
ADJUSTMENTS_PRESERVED=PASS
REVERSALS_PRESERVED=PASS
UNKNOWN_IS_NOT_ZERO=PASS
NO_INVENTED_ECONOMIC_VALUE=PASS
NO_AUTOMATIC_PAYOUT_CONFIRMATION=PASS
NO_PRODUCT_RECOMMENDATION_BY_COMMISSION=PASS
CLIENT_FIRST=PASS
AURA_LIGHT_2026=PASS
MATERIAL3_VISUAL_AUTHORITY=REMOVED
MOBILE=PASS
TABLET=PASS
DESKTOP=PASS
ZOOM_200=PASS
REDUCED_MOTION=PASS
KEYBOARD=PASS
VISIBLE_FOCUS=PASS
SESSION_SCRUB=PASS
ADVISOR_SWITCH_SCRUB=PASS
LATE_RESULT_REJECTION=PASS
TENANT_ISOLATION=PASS
COMPENSATION_ENGINE_MUTATION=ZERO
RULE_PACK_MUTATION=ZERO
DATABASE_MUTATION=ZERO
RLS_WEAKENING=ZERO
PIPELINE_MUTATION=ZERO
CARTERA_WRITER_MUTATION=ZERO
UNAUTHORIZED_MUTATION=ZERO
SCOPE_GUARD=PASS
MAIN_MUTATED=NO
MERGE_EXECUTED=NO
PRODUCTION_DEPLOYMENT=NO
FINAL_STATUS=PASS
```
