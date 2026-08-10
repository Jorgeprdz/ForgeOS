# FORGE GLOBAL AURA RECOMPOSITION 008 — DISCOVERY

## Baseline

```text
PHASE=FORGE_GLOBAL_AURA_RECOMPOSITION
PHASE_NUMBER=008
BASE_BRANCH=main
BASE_SHA=27e50a647bbe2dc2058d42620033134102fcbaf2
DISCOVERY_MAIN_SHA=27e50a647bbe2dc2058d42620033134102fcbaf2
MAIN_DRIFT=NO_DRIFT
PHASE_007_POST_MERGE_SEAL=PASS
CONSTITUTIONAL_GATE_008=PASS
ADR_GATE_008=PASS
```

## Runtime entry and canonical shell

Productive Aura V4 R1 boots through `aura-bootstrap-v4-r1.js`, which retires legacy cache/service-worker state and imports `app-v4-r1.js`. `app-v4-r1.js` creates one authenticated Aura shell, one router and one active route module at a time. It mounts Home, Pipeline, Activity, Cartera, Income and Quotes and loads Alfred as a shared runtime.

The canonical route model is `aura-router-v4.js`. The canonical visual shell is `aura-shell.js`. Existing `app.js`, `app-v4.js`, older bootstrap/auth/router variants are compatibility/history surfaces and are not treated as permission to create another shell.

```text
CANONICAL_AUTHENTICATED_SHELL=docs/static-preview/forge-aura/aura-shell.js
CANONICAL_RUNTIME_APP=docs/static-preview/forge-aura/app-v4-r1.js
CANONICAL_ROUTER=docs/static-preview/forge-aura/aura-router-v4.js
CANONICAL_BOOT=docs/static-preview/forge-aura/aura-bootstrap-v4-r1.js
NEW_SHELL_REQUIRED=NO
NEW_ROUTER_REQUIRED=NO
```

## GLOBAL_AURA_SURFACE_AUTHORITY_MATRIX

| Surface | Entry point | Current authority/intelligence | Writes / owner | Current finding | Target role |
|---|---|---|---|---|---|
| Authenticated Shell | `app-v4-r1.js` → `aura-shell.js` | Supabase Auth/session; ADR-020; ADR-024 | logout/session only through auth owner | NO_GAP | shared application chrome and lifecycle |
| Navigation | `aura-router-v4.js` + shell links | canonical route registry | no business writes | ROUTING_GAP | preserve owner route + originating decision/source context |
| Home / Mi Día | `home/home-module.js` | FCDP-004-001 → FHAO-007-001; Productive Smart Widget authorities; Agenda/Future Radar/Mick | HOME_DOMAIN_WRITES=0 | COMPOSITION_GAP | attention/orchestration only; hand off context to owner surface |
| Pipeline | `pipeline/pipeline-module.js` + adapter | Pipeline Prospect/Timeline; CRS-03; `FORGE_PIPELINE_DOMAIN_INTELLIGENCE_CONSUMER_005A`; FCDP-004-001 boundary | existing Prospect/Stage RPC/service owners | CONSUMER_GAP + LOCAL_HEURISTIC_DEFECT | commercial context; governed intelligence when present; facts remain facts |
| Person / commercial context | no independent Aura route; represented through Pipeline CRS and Cartera Person Workspace | CRS-03 / Cartera 010B CommercialPerson | identity convergence only through owner + human gate | NO_SEPARATE_SURFACE | do not invent a new module |
| Cartera | `cartera/cartera-module-v4.js` | Cartera 010B/010C/010D; Canonical Evidence 020; Policy Intelligence; Payment authority; relationship/productivity consumers | governed RPC/command owners; no direct canonical table mutation in Aura | NO_GAP | Policy/person servicing context |
| Quotes | `quotes/quotes-module.js` | Accepted Quote + Product Intelligence + product-specific decision read model | lifecycle/acceptance through existing owners | NO_GAP | product meaning and proposal decision support |
| Activity | `activity/activity-module.js` | FES + Productive Activity Reporting + Productivity runtime | existing FES manual writer | NO_GAP | activity evidence and authority-owned productivity metrics |
| Income | `income/income-module.js` | compensation snapshot/evidence + forward signal/forecast contracts | read-only presentation; compensation/forecast owners | NO_GAP | explain economic truth by state |
| Alfred | shared `alfred-command-runtime.js` | command/action registries, entity context, review packets | prepares/navigation; sensitive action remains review/human-owned | NO_GAP | explain/contextualize/prepare human action |

## Authority → decision/projection → consumer → human action

```text
PIPELINE PROSPECT/TIMELINE + CRS-03 + FCDP
→ Pipeline Domain Intelligence Consumer 005A
→ Aura Pipeline
→ human review/action through Pipeline owner

PRODUCT/PDF/ACCEPTED QUOTE + PRODUCT INTELLIGENCE
→ product-specific decision read model
→ Aura Quotes
→ human confirmation / existing lifecycle owner

POLICY / EVIDENCE / PAYMENT / RELATIONSHIP AUTHORITIES
→ Cartera accepted projections
→ Aura Cartera
→ human review / governed Policy-Cartera commands

FES / PRODUCTIVITY / FORECAST SIGNALS
→ existing productive Activity runtime
→ Aura Activity
→ human capture/review through FES owner

COMPENSATION + FORECAST / FORWARD SIGNAL CONTRACTS
→ existing Income adapter/read model
→ Aura Income
→ human understanding; no payout inference

FCDP-004-001
→ FHAO-007-001
→ Aura Home
→ owner-routed human action
```

## Gap classification

### Navigation / Home: ROUTING_GAP + COMPOSITION_GAP

Home knows `decisionReference` / source references but its buttons currently pass only a module route string. This loses the provenance that caused the navigation. Phase008 may add a generic, non-business route-context envelope and preserve that envelope through the router. The envelope must not infer identity, select a winner, mutate data or become a truth owner.

### Pipeline: CONSUMER_GAP + LOCAL_HEURISTIC_DEFECT

005A made canonical intelligence available through `pipeline-adapter.js::intelligence(id)`, but `pipeline-module.js` still renders attention/recommendation/sort semantics from `pipeline-priority.js`. That module calculates local precedence (`order:10..60`) and generates `nextBestAction()` from record facts. This was acceptable historical UX scaffolding but conflicts with Phase008's stronger global rule that Aura must not present local scoring/priority/NBA as governed business truth.

Phase008 must NOT manufacture FCDP projections. It may:

1. request the existing intelligence consumer;
2. render its `READY/PARTIAL/UNAVAILABLE` state, identity state, provenance, projections and degraded reasons;
3. present raw operational facts such as due date, Timeline availability and missing fields without labelling them as a governed recommendation;
4. preserve Prospect != CommercialPerson;
5. preserve `opportunityAuthorityState=NOT_PRODUCTIVE` when that is the authority state;
6. avoid automatic stage/identity/action writes.

## REUSE BEFORE CREATE GATE

```text
REUSE_BEFORE_CREATE_GATE_008=PASS
CONNECT=FIRST
RECOMPOSE=SECOND
ADAPT=THIRD
REBUILD=LAST

NEW_ENGINE_CREATED=0
NEW_GLOBAL_SCORE_CREATED=0
NEW_GLOBAL_PRIORITY_FORMULA_CREATED=0
DUPLICATE_TRUTH_OWNER_CREATED=0

NEW_SHELL=NO
NEW_DOMAIN_ENGINE=NO
NEW_PRODUCT_ENGINE=NO
NEW_POLICY_ENGINE=NO
NEW_COMPENSATION_ENGINE=NO
NEW_FORECAST_ENGINE=NO
NEW_IDENTITY_ENGINE=NO
NEW_NBA_ENGINE=NO
```

## Allowed implementation from discovery

Bounded Phase008 mutation may include only:

- routing/context composition in the existing Aura router/app;
- Home presentation metadata needed to preserve origin/context without changing FHAO intelligence;
- Pipeline consumer/presentation reconciliation using the existing 005A consumer;
- tests/evidence/workflow/Pages packaging strictly needed to validate those changes.

Cartera, Quotes, Activity, Income, Alfred, Product Intelligence, Policy Intelligence, compensation, forecast, CRS, Mick, Nash, Supabase schema and RLS are preserve-only unless a regression proves a concrete defect.

```text
DISCOVERY_COMPLETE=YES
PRODUCTIVE_MUTATION_AUTHORIZED=BOUNDED_TO_ROUTING_COMPOSITION_AND_PIPELINE_CONSUMER_PRESENTATION
```
