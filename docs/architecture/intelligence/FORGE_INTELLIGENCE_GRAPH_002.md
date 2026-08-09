# Forge Intelligence Graph 002

Phase: `FORGE_INTELLIGENCE_ASSEMBLY_BLUEPRINT_002`

## Nodes

| ID | Node | Authority type | Inputs | Outputs | Primary consumers | Canonical / derived | Assembly status |
|---|---|---|---|---|---|---|---|
| G01 | CommercialPerson | domain authority | governed identity confirmation | canonical person id/context | Person, Cartera, Relationship | CANONICAL | PRESERVE |
| G02 | Pipeline Prospect | domain authority | advisor prospect capture | commercial prospect state | Pipeline, identity convergence | CANONICAL_IN_PIPELINE | PRESERVE |
| G03 | CRS identity convergence | human-decision boundary | Prospect candidate + person evidence | durable identity link | Pipeline, Cartera, Person | DERIVED_BY_HUMAN_DECISION | CONNECT |
| G04 | Unified Timeline | event/evidence authority | governed events | chronological evidence | Relationship, Pipeline, Cartera | CANONICAL_EVENT_PROJECTION | PRESERVE |
| G05 | Relationship Intelligence Pack01 | intelligence composition | Person + Timeline + relationship evidence | commitments/cooling/risk/context | Pipeline, Person, Nash | DERIVED | CONNECT |
| G06 | Advisor/Mick Pack02 | intelligence composition | advisor activity/outcomes | execution patterns/friction hypotheses | Activity, Coach, Home | DERIVED | CONNECT |
| G07 | Nash Pack03 | recommendation authority | Relationship + Advisor context | NBA/NBC/preparation | Pipeline, Communication, Alfred | DERIVED_RECOMMENDATION | CONNECT |
| G08 | Opportunity Pack04 | intelligence/decision composition | Relationship + Advisor + Nash + evidence | priorities, attention budget, forecast, scenarios | Pipeline, Home/Alfred | DERIVED_RECOMMENDATION | PRESERVE_AND_GENERALIZE_SEMANTICS |
| G09 | Personal Coach Pack05 | coaching composition | Packs01-04 + activity/journal | weekly plan/experiment/review | Coach | DERIVED | ACTIVATE_LATER |
| G10 | Business Intelligence Pack06 | learning/BI composition | observed outcomes + domain metrics | funnel/channel/product/forecast utility | Reports, Coach, Alfred | DERIVED | ACTIVATE_LATER |
| G11 | Alfred Pack07 | orchestrator | owned upstream decisions | cross-system briefing/delegation | Home | DERIVED_ORCHESTRATION | PRESERVE |
| G12 | FES Activity | domain evidence authority | advisor capture | activity facts | Productivity, Mick | CANONICAL_ACTIVITY | PRESERVE |
| G13 | Productivity authority | metric/rule authority | FES + goals | points/progress/rhythm | Activity, Home, Mick | DERIVED_OWNED_METRIC | CONNECT |
| G14 | Policy Intelligence | domain authority | policy evidence/human review | Policy/Coverage truth/read models | Cartera, Compensation | CANONICAL_POLICY | PRESERVE |
| G15 | Portfolio Intelligence | projection | Policy + person portfolio | Future Radar | Cartera, Home | DERIVED_PROJECTION | PRESERVE |
| G16 | Accepted Quote | quote lifecycle authority | quote evidence/human lifecycle | accepted quote-specific facts | Product decision projection | CANONICAL_QUOTE_CONTEXT | PRESERVE |
| G17 | Product Intelligence | product truth authority | official/carrier product sources + quote context | product-specific semantics | Quotes, Communication | CANONICAL_PRODUCT_MEANING | PRESERVE |
| G18 | Product-specific decision read model | adapter/projection | Accepted Quote + Product Intelligence | presentation decision model | Aura Quotes | DERIVED | PRESERVE |
| G19 | Confirmed Payment Event | economic evidence authority | governed payment evidence | confirmed paid premium | Compensation | CANONICAL_ECONOMIC_EVIDENCE | PRESERVE |
| G20 | Compensation Engine | governed calculator | payment + policy + rule snapshot | commission/bonus candidate + explanation | Income | DERIVED_CALCULATION | PRESERVE |
| G21 | Compensation Event Authority | truth-state authority | reproducible calculation + gates | earned truth when authorized | Income | CANONICAL_COMP_EVENT | PRESERVE |
| G22 | Revenue Value/Adapters | economic projection/presentation | compensation + forecast inputs | generated/expected/scenario values | Aura Income | DERIVED | PRESERVE |
| G23 | Forecast Intelligence | scenario authority | owned facts + assumptions | forecast/scenario/confidence | Reports, Income, Home | DERIVED_FORECAST | CONVERGE_GENERATIONS |
| G24 | Advisor Lifecycle/Development | rule/evidence authority | career evidence + governed rules | development regime/eligibility context | Compensation, Coach | CANONICAL_CONTEXT | CONVERGE_BOUNDARY |
| G25 | Aura Home | product surface | Alfred + Agenda + Priority + Radar + Productivity | bounded attention presentation | advisor | SURFACE_ONLY | PRESERVE_NO_LOCAL_ENGINE |
| G26 | Aura Pipeline | product surface | Pipeline + Opportunity + Timeline + Nash context | explainable commercial attention | advisor | SURFACE_ONLY | DEEPEN_COMPOSITION |
| G27 | Aura Activity | product surface | FES + goals | capture/progress | advisor | SURFACE_ONLY | ACTIVATE_POINTS_MICK |
| G28 | Aura Cartera | product surface | Policy + Portfolio + Identity | policy/person attention | advisor | SURFACE_ONLY | DEEPEN_ACTION_COMPOSITION |
| G29 | Aura Quotes | product surface | quote decision projection | product-specific decision experience | advisor | SURFACE_ONLY | EXTEND_PRODUCT_COVERAGE |
| G30 | Aura Income | product surface | Compensation + Revenue + Forecast | economic decision experience | advisor | SURFACE_ONLY | DEEPEN_EXPLANATION |

## Core dependency graph

```text
Prospect ──human convergence──> CommercialPerson
                                   │
                          Relationship + Timeline
                                   │
                         Opportunity ← Nash
                                   │
                           Alfred Orchestration
                                   │
                                 Home

FES Activity → Productivity → Mick → Coach
       │             │          │
       └─────────────┴──────────> Alfred/Home

Policy Evidence → Policy Intelligence → Portfolio/Future Radar → Cartera/Home
                         │
                         └→ Compensation ← Confirmed Payment Event
                                            │
Rule Snapshot ───────────────────────────────┘
                                            ↓
                                         Income
                                            ↑
Facts+Assumptions → Forecast ───────────────┘

Quote Evidence → Accepted Quote → Product Intelligence → Decision Read Model → Quotes
```

## Forbidden edges

```text
Aura UI → domain truth
Forecast → payment/compensation truth
Nash → automatic send/task/calendar/pipeline mutation
Future Radar → Policy Truth
Parser/OCR → Product/Policy Truth without review
Income scenario → generated/earned/paid truth
Material3 presentation → current visual authority
```

```text
INTELLIGENCE_AUTHORITIES_MAPPED=24
PRODUCT_SURFACES_MAPPED=6
TOTAL_GRAPH_NODES=30
```
