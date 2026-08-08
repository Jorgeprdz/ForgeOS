# Forge Aura Income UX Reconciliation Report 001

```text
EXECUTION_ID=FORGE_AURA_INCOME_UX_RECONCILIATION_001
PHASE=FORGE_AURA_INCOME_UX_RECONCILIATION_001
SOURCE_SHA=6b8e01fb4434cfc22c7356e82cdd35348dc6a2da
BRANCH=codex/forge-aura-income-ux-reconciliation-001
PRODUCT_SURFACE=ADVISOR_OS_INCOME
CURRENT_ROUTE_ID=comisiones
VISIBLE_PRODUCT_NAME=Ingresos
STATUS=DISCOVERY_COMPLETE_IMPLEMENTATION_IN_PROGRESS
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

The locked UX behavior directive is read-only authority from `governance/forge-aura-light-2026-authority`; it is not copied or merged by this phase.

## Aura gate

```text
AURA_LIGHT_AUTHORITY=docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md
AURA_LIGHT_SOURCE_PDF_SHA256=0dbda2ae17d80602c7943bf139015177dbeb340a5edd5d9a5983bd24d5b6672e
AURA_LIGHT_VERSION=1.0
AURA_LIGHT_COMPLIANCE=REQUIRED
LEGACY_VISUAL_IMPORTS=FORBIDDEN
LOCAL_UNGOVERNED_TOKENS=FORBIDDEN
VISUAL_ACCEPTANCE_AGAINST_CANONICAL_AUTHORITY=REQUIRED
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

| Capability | Current authority | Current implementation | Reuse class | Gap | Proposed change | Truth type | ADR | Test |
|---|---|---|---|---|---|---|---|---|
| monthly generated income | period snapshot `amounts.earned.net` + earned aggregate evidence | Comisiones shows real/paid/earned cards | REUSE_WITH_ADAPTER | product language and hierarchy are wrong for Aura Income | present owner value as `Ingreso generado aprox.` only when earned evidence is usable | GENERATED / EARNED | 001,002,008,017 | APPROXIMATE_INCOME_LABEL, NO_DEPOSIT_CLAIM |
| initial commission | compensation aggregate concept `LIFE_INITIAL` / `GMM_INITIAL` | not separated in current hero | EXTEND_READ_MODEL | missing presentation projection | read-only aggregate classification by canonical concept | GENERATED | 002,006,017 | INITIAL_COMMISSION_BREAKDOWN |
| renewal commission | compensation aggregate concept `LIFE_RENEWAL` / `GMM_RENEWAL` | not separated | EXTEND_READ_MODEL | missing presentation projection | read-only aggregate classification by canonical concept | GENERATED | 002,006,017 | RENEWAL_COMMISSION_BREAKDOWN |
| generated bonus | aggregate `kind=BONUS` and canonical bonus concepts | included only in aggregate detail | EXTEND_READ_MODEL | no first-class composition | read-only bonus projection; no rule recreation | GENERATED | 017,018 | BONUS_BREAKDOWN |
| training | existing training allowance engines / events | no Aura coach | REUSE_AS_IS / presentation only | rule output is not guaranteed in current product read model | show generated Training events; coach gap only when governed metadata exists, otherwise BLOCKED | GENERATED / UNKNOWN | 017,018 | TRAINING_RESOLUTION |
| new professional | existing rule pack/engines/events | no Aura coach | REUSE_AS_IS / presentation only | eligibility inputs are not guaranteed in product read model | show generated NP events; coach gap only from governed metadata, otherwise BLOCKED | GENERATED / UNKNOWN | 014,017,018 | NEW_PROFESSIONAL_ELIGIBILITY |
| expected renewals | Compensation Forward Signal contract can carry explicit forward scenarios | generic POTENTIAL only | REUSE_WITH_ADAPTER | no guaranteed productive renewal-specific signal authority discovered | accept only explicitly typed `EXPECTED_RENEWAL` signals with source/ref/digest; otherwise `NO_ECONOMIC_CONCLUSION` | EXPECTED / UNKNOWN | 006,007,008,017 | EXPECTED_RENEWALS_NOT_GENERATED, EXPECTED_RENEWALS_AUTHORITY |
| pipeline economic scenario | forward signal can carry scenario without truth promotion | generic POTENTIAL only | REUSE_WITH_ADAPTER | no guaranteed productive Pipeline-specific compensation signal authority discovered | accept only explicitly typed `PIPELINE_WHAT_IF` signals; never probability x money; otherwise UNKNOWN | SCENARIO / UNKNOWN | 007,008,017,018 | PIPELINE_SCENARIO_NOT_GENERATED, NO_INVENTED_PROBABILITY_MONEY |
| annual income | six-month materialized history | current history six months | BLOCKED_BY_MISSING_AUTHORITY for full YTD when >6 months required | current materialization window is current + previous five months | render annual block honestly as unavailable unless complete Jan-current history is supplied | GENERATED_YTD / UNKNOWN | 002,007,008 | ANNUAL_TRUTH_SEPARATION |
| history | canonical six-month history series | six months | REUSE_AS_IS | no 12-month authority | show only source-supported points and disclose source limit | GENERATED / EARNED | 002,008,017 | HISTORY_LIMIT |
| adjustments | `amounts.earned.adjustments` + aggregate deltas | current surface shows them | REUSE_AS_IS | hierarchy | retain in movement/evidence layer and net context | ADJUSTED | 017 | ADJUSTMENTS_PRESERVED |
| reversals | `amounts.earned.reversals` + append-only events | current surface shows them | REUSE_AS_IS | hierarchy | retain visibly and never hide in hero copy | REVERSED | 017 | REVERSALS_PRESERVED |
| movement detail | canonical aggregates/events | current detail exists | REUSE_WITH_ADAPTER | product hierarchy/search/filter | Aura movement ledger with progressive evidence disclosure | mixed canonical states | 001,008,017 | PROGRESSIVE_DISCLOSURE |

## Material to Aura gap matrix

| Requirement | Material current state | Canonical authority | Aura requirement | Gap | Solution | Boundary | Test |
|---|---|---|---|---|---|---|---|
| Product name | `Comisiones` | route may remain `comisiones` | `Ingresos` | visible name mismatch | change presentation only | no technical mass rename | PRODUCT_NAME |
| Hero | `Ingreso real` / paid/earned emphasis | compensation snapshot | one protagonist `Ingreso generado aprox.` | payout semantic dominates | use earned evidence as generated context; payout only in evidence | no payout claim | APPROXIMATE_INCOME_LABEL |
| Composition | equal KPI cards | canonical concepts/kinds | Iniciales + Renovaciones + Bonos | missing | owner-preserving projection and segmented bar | no rate calculations | BREAKDOWN tests |
| Future money | generic potential | forward-signal contract | Expected orange / Scenario violet | insufficient type semantics | strict explicit signal typing; unknown otherwise | no probability weighting | EXPECTED/SCENARIO tests |
| Bonus coach | not first-class | bonus engines/rule packs | generated vs in-reach | current read model lacks guaranteed eligibility snapshot | generated event support now; coach requires governed metadata | no frontend rule tables | BONUS_GENERATED_VS_REACHABLE |
| Annual | six-month history | materializer window | annual truth separation | full YTD not guaranteed | honest blocked state when incomplete | unknown is not zero | ANNUAL_TRUTH_SEPARATION |
| Visual | Material/dark renderer | ADR-024 Aura | light premium hierarchy | full mismatch | clean Aura module using canonical tokens | no legacy CSS import | AURA_AUTHORITY |

## Scope lock

Authorized implementation files are limited to:

```text
docs/static-preview/forge-aura/income/**
docs/static-preview/forge-aura/app-v4.js
docs/static-preview/forge-aura/aura-router-v4.js
docs/static-preview/forge-aura/aura-shell.js
docs/static-preview/forge-aura/index.html
tests/income-*
tests/e2e/income-*
tests/fixtures/aura-income-visual.html
.github/workflows/income-aura-ux-reconciliation-001.yml
docs/architecture/source-truth/FORGE_AURA_INCOME_UX_RECONCILIATION_REPORT_001.md
docs/evidence/FORGE_AURA_INCOME_UX_RECONCILIATION_ACCEPTANCE_001.md
```

No compensation engine, Rule Pack, database, schema, RLS, Pipeline writer, Cartera writer, Forecast engine or productive data mutation is authorized.

## Read-model design

```text
forge_advisor_compensation_read_product (existing read-only RPC)
-> ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001
-> Aura Pages owner-preserving adapter
-> Income presentation projection
   - generated owner value
   - initial/renewal/bonus breakdown from canonical aggregate concept/kind
   - expected/scenario only from explicitly typed forward signals
   - annual only when complete source history exists
-> Aura Income presentation
```

The projection never creates compensation truth and never writes back.

## Known blocked capabilities at discovery

```text
EXPECTED_RENEWAL_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
PIPELINE_WHAT_IF_PRODUCTIVE_SIGNAL_AUTHORITY=NOT_GUARANTEED
BONUS_COACH_ELIGIBILITY_SNAPSHOT=NOT_GUARANTEED
FULL_YTD_HISTORY=NOT_AVAILABLE_FROM_CURRENT_SIX_MONTH_WINDOW
```

These are implemented as honest `UNKNOWN` / `BLOCKED` presentation states. They are not converted to zero and do not block implementation of the supported read-only surface.

## Mutation status

```text
MAIN_MUTATED=NO
COMPENSATION_ENGINE_MUTATION=ZERO
RULE_PACK_MUTATION=ZERO
DATABASE_MUTATION=ZERO
RLS_MUTATION=ZERO
PIPELINE_MUTATION=ZERO
CARTERA_WRITER_MUTATION=ZERO
PRODUCTION_DEPLOYMENT=NO
```
