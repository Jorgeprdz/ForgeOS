# Forge Domain Intelligence 005A — Consumer Boundary Map

| DOMAIN | SURFACE | CONSUMER | ADAPTER | AUTHORITY | PROJECTION | IDENTITY_KEY | SOURCE_KIND | RLS_BOUNDARY | DEGRADED_BEHAVIOR | MUTATION_ALLOWED | OWNER |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PIPELINE | Aura Pipeline | pipeline-domain-intelligence-consumer | pipeline-adapter + productive-prospect-service | Prospect authority + `forge_pipeline_update_prospect_stage` | FCDP supplied by owning adapters | prospect_id | actual + projection | advisor/auth.uid | unavailable/partial; no fixture fallback | consumer:NO; existing explicit stage command:YES | Pipeline |
| PERSON | Aura Pipeline Prospect context | CRS-03 convergence via consumer | CRS-02 authoritative domain-link adapters | CARTERA 010B `commercial_people` + source identity links + decisions | convergence/domain-link + FCDP | person_reference linked from prospect_id | actual identity link | advisor/auth.uid | UNRESOLVED; never heuristic match | NO | Cartera Person |
| CARTERA | Aura Cartera | existing Cartera consumers | `cartera-050c-authority-adapters.js` | existing Cartera policy/payment authorities | `cartera-050a-future-radar-projection.js` | canonical cartera references | actual/expected/projection | existing Cartera RLS | existing partial/unknown semantics | existing governed commands only | Cartera |
| ACTIVITY | Aura Activity | existing Activity consumers | `activity-points-authority-adapter.mjs` | canonical Activity/FES points authority | existing productivity/future-opportunity projections | advisor/activity refs | actual/projection | existing Activity RLS | existing degraded state | existing governed commands only | Activity |
| FCDP | owning product surfaces | `composeDecisionProjectionSet` / 005A consumer | `forge-cross-domain-decision-adapters.js` | source authorities only | `FCDP-004-001` | subject.reference | derived projection | inherited from source read | reject invalid projection; no invented fallback | NO | Decision Projection |
| FORECAST | existing Forecast consumers | existing V3 read model consumers | existing V3 composer/read model | Manager OS Forecast V3 | FCDP Forecast adapter when consumed | advisor_id + period | projection | existing Manager/Advisor boundary | stale/blocked remains explicit | NO in 005A | Manager OS Forecast |
| REVENUE | compensation surface | existing compensation view | existing compensation boundary | Revenue/Compensation canonical authority | FCDP economic adapter only when source is canonical | advisor + compensation refs | actual/expected/projected as source labels | existing compensation boundary | unknown/partial preserved | NO in 005A | Compensation |

## Hard boundaries
1. 005A does not promote `opportunity-pipeline-read-only-adapter-066b.js` or `067d` to production.
2. `opportunityAuthority=NOT_PRODUCTIVE` remains an explicit limitation.
3. No Person match by name/phone/email.
4. No consumer-owned score, formula, ranking, confidence, forecast or revenue calculation.
5. FCDP projections retain source provenance and human approval requirements.
