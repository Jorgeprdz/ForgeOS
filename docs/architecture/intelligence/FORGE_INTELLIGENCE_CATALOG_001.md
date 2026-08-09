# Forge Intelligence Catalog 001

Phase: `FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001`
Mode: repository-wide discovery; documentation only
Baseline main: `26a084c8cbf1c3a5c5147274a98f613cc127c206`
Functional freeze: `4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8`

## Classification

- `GREEN`: productive and meaningfully consumed by a user-facing decision/action.
- `YELLOW`: productive/valid but materially under-surfaced or only partially connected.
- `ORANGE`: overlapping lineage, composition/ownership ambiguity, or valuable implementation without a current coherent product surface.
- `RED`: unsafe/contradictory authority violation.
- `BLACK`: superseded/legacy presentation or implementation not intended as current authority.
- `UNKNOWN`: insufficient evidence.

This is a capability-level catalog. It does not promote every file with `engine` in its name to source truth. The prior root scan found 219 root engine/module candidates, including 54 historical `UNKNOWN / NEEDS REVIEW`; those are evidence inputs, not 219 canonical authorities.

## Significant intelligence assets

| ID | Domain | Capability | Authority / evidence path | What it knows or produces | Current consumer / surface | Decision / action visible today | Status |
|---|---|---|---|---|---|---|---|
| I01 | Identity | Commercial Person authority | Cartera 010B / shared commercial model | canonical commercial person identity | Cartera Person/Policy workspaces | choose/open governed person | GREEN |
| I02 | Identity | Advisor commercial relationship | CRS relationship authorities | advisor↔person relationship context | Person workspace / relationship composition | inspect relationship context | GREEN |
| I03 | Identity | Unified person Timeline | CRS-08 / policy timeline projections | ordered evidence-backed person history | Cartera / Person workspace | understand history before acting | GREEN |
| I04 | Identity | Prospect→CommercialPerson human convergence | CRS / Cartera 020C durable confirmation | unresolved candidate, explicit identity decision, durable link | Pipeline↔Cartera boundary | explicit human link/confirmation | YELLOW |
| P01 | Pipeline | Relationship foundation envelope | `platform/relationship-intelligence/fip-pack-01-foundation-contract.js` | commitments, relationship context | Person/Pipeline compositions | partial contextual use | YELLOW |
| P02 | Pipeline | Relationship health/cooling/loss risk | FIP Pack 01 + relationship lineage | overdue, cooling, objections, loss risk | Pipeline attention / person context | attention reason; limited full exposure | YELLOW |
| P03 | Pipeline | Hidden opportunity signals | FIP Pack 04 | observed/probable need and commercial hypotheses | Opportunity service / Pipeline | candidate priority context | YELLOW |
| P04 | Pipeline | Explainable daily priority + attention budget | `platform/opportunity-intelligence/fip-pack-04-opportunity-operation-contract.js` + Priority Orchestrator | urgency, impact, risk, commitment, fit, evidence confidence, effort | Aura Pipeline + Aura Home | ranked attention; human-initiated next action | GREEN |
| P05 | Pipeline | Opportunity forecast + scenario comparison | FIP Pack 04 | OBSERVED/ESTIMATED/POTENTIAL/AT_RISK/UNKNOWN; scenarios | opportunity composition | scenario/forecast context, not execution | YELLOW |
| P06 | Pipeline | Nash Next Best Action | FIP Pack 03 | why person/action/now, alternatives, confidence | Home/Pipeline/Nash context | recommendation; user initiates | YELLOW |
| P07 | Pipeline | Next Best Conversation / message preparation | FIP Pack 03 | conversation class, prep packet, contextual instruction | Nash / draft experiences | preparation only; no automatic send | YELLOW |
| A01 | Activity | FES productive capture authority | existing FES writer/RLS | countable advisor activity | Aura Activity | record activity | GREEN |
| A02 | Activity | Activity points authority adapter | `platform/productivity/activity-points-authority-adapter.mjs` | governed activity point projection | productivity runtime | not fully surfaced in Aura Activity | YELLOW |
| A03 | Activity | Goals/productivity runtime | existing productivity owner | goals and progress context | Aura Activity / Aura Home rhythm | inspect progress / record activity | GREEN |
| A04 | Activity | Mick execution/friction intelligence | FIP Pack 02 | follow-up delay, early quoting, referral gap, experiments | Activity/Home context | partial pattern context; coaching not fully surfaced | YELLOW |
| A05 | Activity | Cartera productivity proof | `platform/productivity/cartera-100a-productivity-proof-contract.js` | evidence connecting activity/portfolio outcomes | specialist proof layer | no coherent first-class Aura decision surface found | ORANGE |
| A06 | Activity | Outcome learning boundary | `platform/productivity/cartera-100b-outcome-learning-boundary.js` | observed result vs learning boundary | specialist learning composition | no first-class Aura action found | ORANGE |
| C01 | Cartera | Portfolio read model | `platform/policy-intelligence/cartera-010c-portfolio-read-model.js` | policy portfolio projection | Aura Cartera | inspect portfolio/policy | GREEN |
| C02 | Cartera | Unified directory read model | `platform/policy-intelligence/cartera-010d-unified-directory-read-model.js` | person/policy directory projection | Aura Cartera directory | find/open person or policy | GREEN |
| C03 | Cartera | Policy detail Timeline | `platform/policy-intelligence/cartera-010c-policy-detail-timeline.js` | policy event history | Aura Policy workspace | review history | GREEN |
| C04 | Cartera | Policy Coverage authority contract | `platform/policy-intelligence/policy-coverage-contract.js` + governed read/write functions | specific policy coverage truth with evidence/versioning | Aura Policy workspace | review/confirm coverage through governed boundary | GREEN |
| C05 | Cartera | Future Radar projection | `platform/portfolio-intelligence/cartera-050a-future-radar-projection.js` | upcoming portfolio attention/risk/opportunity context | Aura Home and Cartera intelligence | act before upcoming event | GREEN |
| C06 | Cartera | Future Radar authority adapters/view | `cartera-050c-authority-adapters.js`, `cartera-050d-future-radar-view.js` | presentation projection over governed inputs | Cartera / Home | useful but not uniformly composed across current Aura | YELLOW |
| Q01 | Product/Quotes | Product-specific decision read model | `docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js` | normalized presentation over existing product authorities | Aura Quotes | understand accepted quote product-specifically | GREEN |
| Q02 | Product/Quotes | Imagina Ser intelligence family | Imagina Ser decision/presentation/scenario engines | contribution, protection, construction/future semantics | Aura Quotes | explain/present product | GREEN |
| Q03 | Product/Quotes | ORVI intelligence family | ORVI decision/presentation/recovery/rate-context engines | primary protection, recovery, guaranteed/future separation | Aura Quotes | explain/present product | GREEN |
| Q04 | Product/Quotes | SeguBeca intelligence family | SeguBeca decision/education/presentation engines | education goal, roles, contribution, delivery, protection | Aura Quotes | explain/present product | GREEN |
| Q05 | Product/Quotes | Vida Mujer intelligence family | Vida Mujer presentation/protection engines | contribution, dotales/recovery, women-specific benefits | Aura Quotes | explain/present product | GREEN |
| Q06 | Product/Quotes | GMM intelligence family | GMM advisor/client/quote/policy engines | GMM quote/policy interpretation | root/product lineage | rich intelligence exists; no equivalent current Aura product-specific closure proven here | YELLOW |
| Q07 | Product/Quotes | Generic product detection/knowledge/shared helpers | root product detection, knowledge link, shared benefit/premium helpers | product classification and generic semantic helpers | mixed legacy/current consumers | ownership must stay beneath product-specific authorities | ORANGE |
| R01 | Compensation | Confirmed payment event authority | policy operations + Stage 030 compensation chain | confirmed paid premium economic evidence | compensation calculation | supports generated-income truth; not payout truth | YELLOW |
| R02 | Compensation | Deterministic advisor commission engine | `compensation/advisor/engine/advisor-commission-engine.js` | initial/renewal commission calculation from confirmed payment + rule snapshot | Income runtime / compensation stack | generated commission explanation | YELLOW |
| R03 | Compensation | Commission basis resolver + calculation contract | advisor compensation engine contracts | payment basis, effective rate, policy year, accumulated commission | compensation stack | explanation/provenance, partially surfaced | YELLOW |
| R04 | Compensation | Training Allowance reconciliation | Advisor Development Rule Pack selected authority | qualification and estimated allowance candidate | compensation stack | candidate estimate; not payout | YELLOW |
| R05 | Compensation | Nuevo Profesional / GMM direct bonus logic | Advisor Compensation Rule Pack/engine | weighted premium, LIMRA, IGC, GMM quarterly candidates | compensation stack | estimated bonus candidates | YELLOW |
| R06 | Compensation | Revenue value + carrier adapter boundary | `revenue/revenue-value.js`, carrier adapter contracts | generated/expected/scenario economic values with truth separation | Aura Income | generated vs expected vs scenario | GREEN |
| R07 | Compensation | Legacy/root commission and revenue projection/optimization lineage | `commission-projection-engine.js`, `revenue-forecast-engine.js`, `revenue-optimization-engine.js` | projected/optimized economic scenarios | mixed legacy consumers | must remain forecast/projection, never compensation/payment truth | ORANGE |
| F01 | Forecast | SMNYL forecast engine | `rule-packs/smnyl/smnyl-forecast-engine.js` | governed scenario/forecast calculations | forecast stack | estimate context | YELLOW |
| F02 | Forecast | Advisor forecast intelligence/runtime reconciliation | `manager-os/forecast/manager-forecast-intelligence-engine.js` + runtime reconciliation | advisor forecast composition | reports/forecast contexts | forecast with confidence/limitations | YELLOW |
| F03 | Forecast | Advisor forecast composer lineage v1/v2/v3 | `advisor-forecast-composer.js`, `-v2.js`, `-v3.js` | successive composition variants | forecast stack | version/ownership convergence needed | ORANGE |
| F04 | Forecast | Revenue forecast | `revenue-forecast-engine.js` | expected revenue scenarios | Income/forecast contexts | scenario only; not generated or paid truth | YELLOW |
| L01 | Advisor Lifecycle | Advisor lifecycle evidence | `advisor-lifecycle/advisor-lifecycle-evidence.js` | career/lifecycle evidence | compensation/development contexts | contextual eligibility inputs | YELLOW |
| L02 | Advisor Lifecycle | Advisor Development Rule Pack | governed development rules referenced by compensation | training/development targets and career-stage rules | compensation stack | qualification context | YELLOW |
| L03 | Advisor Lifecycle | Career-month coupling across compensation/lifecycle | advisor month/development factor + lifecycle rules | month-based development context | multiple compensation/lifecycle consumers | boundary needs one owner to avoid copied career logic | ORANGE |
| O01 | Coach | Personal Coach packet | FIP Pack 05 | weekly intention/plan/journal/experiments/playbook/radar/review | advisor personal-coach service | implementation exists; productive Aura UI/persistence not claimed | ORANGE |
| O02 | Business Intelligence | Learning + Business Intelligence Pack 06 | FIP Pack 06 | recommendation outcomes, scenarios, funnel/channel/product/forecast utility | reports/business composition | useful intelligence; productive UI/persistence not claimed by pack | YELLOW |
| O03 | Orchestration | Alfred productive orchestration | FIP Pack 07 + current Aura Home Alfred reuse | fact/estimate/hypothesis/recommendation/approval separation; cross-system composition | Aura Home | briefing/command orchestration without owning truth | GREEN |
| O04 | Legacy presentation | Material3 FIP Home bridge/final mount | `docs/static-preview/forge-alive-material3/fip-*` | previous productive presentation of FIP stack | legacy Material3 surface | superseded as visual surface by Aura; intelligence underneath remains reusable | BLACK |

## Counts

```text
TOTAL_INTELLIGENCE_ASSETS=48
GREEN=18
YELLOW=22
ORANGE=7
RED=0
BLACK=1
UNKNOWN=0

PRODUCT_INTELLIGENCE_ASSETS=7
PIPELINE_ASSETS=7
ACTIVITY_ASSETS=6
CARTERA_ASSETS=6
COMPENSATION_ASSETS=7
FORECAST_ASSETS=4
IDENTITY_ASSETS=4
LIFECYCLE_ASSETS=3
OTHER_ASSETS=4
```

## Interpretation

The dominant problem is not missing intelligence. It is uneven product activation and multiple implementation generations. Current Aura has strong direct consumption in Quotes, Cartera, Pipeline and Home; Income preserves economic truth boundaries but still depends on incomplete/candidate rule evidence; Activity explicitly leaves points/coaching under-surfaced. FIP packs provide relationship, advisor, Nash, opportunity, coach, learning and Alfred contracts, but several were originally mounted in Material3 or remained read-only contracts rather than fully converged Aura experiences.

No runtime change, authority reassignment, new engine, new formula, new persistence or UI redesign is authorized by this catalog.
