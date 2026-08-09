# Forge Intelligence Convergence Matrix 002

Phase: `FORGE_INTELLIGENCE_ASSEMBLY_BLUEPRINT_002`
Mode: conceptual convergence only; no migration

| Capability | Current implementations/generations | Winning authority / role | Why | Dependents | Migration later? | Risk | Future phase |
|---|---|---|---|---|---|---|---|
| Current visual system | Material3 FIP bridges; Aura | **Aura / ADR-024** for presentation | Aura is current canonical visual authority | all user surfaces | yes, retire equivalent legacy presentation only after parity | HIGH | 008 |
| Cross-system orchestration | legacy Home logic; FIP Pack07 Alfred; Aura Home | **Alfred=orchestrator; Aura Home=surface** | Pack07 explicitly prohibits Alfred replacing upstream intelligence; Aura Home already reuses authorities | Home and command experiences | connect current domain decisions; no new Home engine | HIGH | 007 |
| Person identity | Pipeline Prospect; CommercialPerson; CRS convergence | **Prospect in Pipeline until human decision; CommercialPerson after confirmation** | preserves existing human identity boundary | Pipeline, Person, Cartera, Quotes | unify navigation/refs, not sources | CRITICAL | 003 |
| Relationship truth/composition | root `relationship-*`; CRS; FIP Pack01 | **CRS/Person/Timeline truth + Pack01 composition** | avoids second person/relationship/timeline authority | Pipeline, Person, Nash | trace legacy root consumers | HIGH | 003 |
| Opportunity priority | root smart-priority/ranking/pipeline engines; Pack04/Priority Orchestrator | **Pack04/Priority Orchestrator candidate-decision semantics** while Pipeline owns state | explainable evidence/attention budget/human boundary | Pipeline, Home | converge consumers | HIGH | 003/004 |
| Nash NBA/NBC | root Nash engine family; Pack03 governed contract/service | **Pack03 contract/service as composition boundary** | explicit evidence, limitations and no-auto-action guarantees | Pipeline, Communication, Alfred | component lineage review | HIGH | 003 |
| Activity facts | UI counters; FES writer | **FES** | productive activity evidence authority | Productivity, Mick, Activity | no truth migration needed | MEDIUM | 005 |
| Productivity points/goals | local KPI potential; points adapter/productivity owner | **Productivity owner/adapter** | prevents frontend business-rule duplication | Activity, Home, Mick | connect outputs | HIGH | 005 |
| Product meaning | generic calculation/benefit helpers; product-specific engines | **Product-specific Product Intelligence** | current Quotes acceptance proves specific semantics outrank generic aliases | Quotes, Communication | extend supported products | HIGH | 006 |
| Quote presentation | Material3/legacy quote views; Aura product decision read model | **Aura + neutral product-specific read model** | read model composes without recalculation | Quotes | preserve generic fallback only | MEDIUM | 006/008 |
| Policy truth | parser/extraction candidates; Policy Intelligence | **Policy Intelligence after governed review/confirmation** | OCR/parser is candidate, not Policy Truth | Cartera, Compensation | none to truth; adapter cleanup only | CRITICAL | 003 |
| Portfolio attention | policy state; Future Radar projection | **Policy truth upstream; Future Radar projection downstream** | maintains projection boundary | Cartera, Home | enrich action projection | HIGH | 005 |
| Payment evidence | issued/annual premium context; Payment Event | **Confirmed Payment Event** | confirmed payment is economic basis | Compensation | block caller shortcuts | CRITICAL | 004 |
| Commission calculation | root commission projection; Advisor Commission Engine | **Advisor Commission Engine for deterministic generated calculation** | governed payment + rule snapshot + digest | Income | projections remain forecasts | CRITICAL | 004 |
| Compensation truth | calculated candidate; compensation event; payout evidence | **Compensation Event Authority + official payout evidence by state** | calculation/earned/paid are different truths | Income | normalize UI states | CRITICAL | 004/006 |
| Training allowance | copied legacy comp targets; Advisor Development Rule Pack | **Advisor Development Rule Pack** | compensation docs already select it and retire duplicate interpretation | Compensation/Coach | remove copied consumer later | HIGH | 003 |
| Forecast | SMNYL forecast engine; manager forecast engine; composer v1/v2/v3; revenue forecast | **Forecast domain; exact productive composition path to be selected by dependency trace** | evidence is insufficient to arbitrarily crown a version in this phase | Reports, Income, Home | yes | HIGH | 003/004 |
| Advisor lifecycle | advisor lifecycle evidence; advisor-month logic; development rules | **Lifecycle evidence + governed Development rules**; comp consumes context | prevents compensation copy becoming lifecycle owner | Compensation, Coach | clarify adapter boundary | HIGH | 003 |
| Personal Coach | legacy coaching engines; Pack05 | **Pack05 governed coach composition** for Advisor OS | bounded, self-history-first, non-HR contract | Coach, Home partial | activate only after evidence/persistence decisions | MEDIUM | 005 |
| Business Intelligence | legacy conversion/dashboard engines; Pack06 snapshot | **owned domain metrics → Pack06 BI composition** | BI can summarize but not become official metric owner | Reports, Coach, Alfred | one-metric-one-owner crosswalk | HIGH | 003/005 |

## Classification

- `AUTHORITATIVE`: domain/source/rule owner.
- `ADAPTER`: translates without owning meaning.
- `PROJECTION`: derived read model/forecast/attention view.
- `LEGACY`: earlier presentation or implementation generation.
- `DEPRECATION_CANDIDATE`: may be retired only after consumer/parity proof.

## No blanket deletion decision

Root engines are not globally classified as dead. Many are valuable product-specific or component implementations. Before any deprecation, Phase 003 must trace actual imports/consumers and prove the replacement authority path.

```text
DUPLICATE_GROUPS=20
CONCEPTUAL_WINNING_ROLES_ASSIGNED=19
FORECAST_EXACT_WINNER=DEFERRED_TO_DEPENDENCY_TRACE
CODE_MIGRATIONS=0
DELETIONS=0
```
