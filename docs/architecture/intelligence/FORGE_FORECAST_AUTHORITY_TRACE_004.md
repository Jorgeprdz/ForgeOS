# Forge Forecast Authority Trace 004

Phase: `FORGE_CROSS_DOMAIN_DECISION_PROJECTION_004`

## Question

Blueprint 002 deferred the exact Forecast winner because multiple generations coexisted. Phase 004 traced the later runtime reconciliation, V3 composer/read model, productive consumer and runtime acceptance rather than choosing a version by name.

## Canonical runtime authority

The repository already contains an explicit reconciliation in:

`manager-os/forecast/advisor-forecast-runtime-reconciliation.js`

It declares:

```text
runtimeOwner=MANAGER_OS_FORECAST
currentRuntimeIdentified=true
legacyRuntimeRejectedOrMapped=true
duplicateCalculations=NONE_AUTHORIZED
```

The ownership map is not one monolithic formula:

| Meaning | Current owner/role |
|---|---|
| Advisor Forecast runtime/composition | `MANAGER_OS_FORECAST` |
| scenario context | `manager-os/forecast/manager-advisor-forecast-engine.js` |
| monthly pace projection | `rule-packs/smnyl/smnyl-forecast-engine.js` through governed adapter |
| advisor signal aggregation | Manager Advisor Metrics |
| historical context | Manager Advisor Historical Analytics |
| target | Advisor Monthly Policy Goal |
| confirmed production | Production Events |
| Pipeline opportunity context | Pipeline |
| source evidence/freshness boundary | Manager Forecast Boundary |

The runtime reconciliation explicitly rejects `revenue-forecast-engine.js` for Advisor Forecast V1 and forbids UI duplicate calculation.

## Composition lineage

```text
source authorities
  ↓
advisor-forecast-runtime-reconciliation
  ↓
manager/advisor forecast engines + SMNYL pace owner
  ↓
advisor-forecast-composer
  ↓
advisor-forecast-composer-v2
  ↓
advisor-forecast-composer-v3
  ↓
advisor-forecast-read-model-v3
  ↓
productive Advisor Forecast SmartWidget/detail/handoff consumers
```

### V3 role

`advisor-forecast-composer-v3.js` wraps V2 and adds the governed activity-requirement planning context. It explicitly blocks:

- automatic decision;
- automatic task/calendar creation;
- activity/revenue/compensation truth creation;
- database/source/UI mutation.

`advisor-forecast-read-model-v3.js` is the current decision-ready read model. It exposes state/confidence, activity requirement, decision summary, human-confirmed activity handoff and navigation actions while declaring that the read model performs no calculation and creates no truth.

## Productive consumer evidence

`advisor-os/forge-alive/smart-widgets/advisor-forecast-smart-widget.mjs` consumes `ADVISOR_FORECAST_READ_MODEL_V2` or `ADVISOR_FORECAST_READ_MODEL_V3`, with V3 carrying the latest activity-requirement context.

The runtime acceptance document `ADVISOR_FORECAST_RUNTIME_ACCEPTANCE_001.md` closes Stages 0–13 and states:

```text
ADVISOR_FORECAST_COMPLETE=YES
HOME_ADAPTER=PRODUCTIVE_SMART_WIDGET_HOME_V3
FORECAST_WIDGET_COUNT=ONE_PER_ADVISOR_MONTH
MANAGER_OS=CANONICAL_IMPLEMENTATION_AUTHORITY
DATABASE_MUTATION=NO
AUTOMATIC_DECISION=BLOCKED
```

It also states that the browser runtime is a compatibility bridge while Manager OS remains the canonical implementation authority.

## Generations disposition

| Implementation | Phase 004 disposition |
|---|---|
| `advisor-forecast-composer.js` | inherited composition generation; upstream of V2 |
| `advisor-forecast-composer-v2.js` | inherited composition generation; upstream of V3 |
| `advisor-forecast-composer-v3.js` | CURRENT COMPOSITION PATH |
| `advisor-forecast-read-model.js` | inherited read-model generation |
| `advisor-forecast-read-model-v2.js` | accepted compatibility consumer input |
| `advisor-forecast-read-model-v3.js` | CURRENT DECISION-READY READ MODEL |
| `manager-advisor-forecast-engine.js` | CURRENT SCENARIO CONTEXT OWNER |
| `smnyl-forecast-engine.js` | CURRENT MONTHLY PACE OWNER THROUGH ADAPTER |
| `manager-forecast-intelligence-engine.js` | Manager-domain intelligence component; not promoted over Advisor Forecast runtime reconciliation |
| `revenue-forecast-engine.js` | REJECTED FOR ADVISOR FORECAST; separate legacy/economic projection lineage |
| Productive SmartWidget provider | PRESENTATION CONSUMER ONLY |

No files are deleted or deprecated by this phase.

## Phase 004 projection rule

The cross-domain projection may adapt **Advisor Forecast Read Model V3** as Forecast planning context, while preserving its source authorities and `PROJECTED/SCENARIO` meaning.

It must not:

- calculate pace;
- calculate weighted Pipeline;
- calculate activity requirements;
- create money forecast;
- convert Forecast to generated/earned/paid revenue;
- create an automatic action.

Revenue Value remains the economic truth-state authority for money-related status; Forecast remains planning/scenario authority.

## Result

```text
CURRENT_CANONICAL_FORECAST_AUTHORITY=MANAGER_OS_FORECAST
CURRENT_FORECAST_COMPOSITION_PATH=ADVISOR_FORECAST_COMPOSER_V3
CURRENT_FORECAST_DECISION_READ_MODEL=ADVISOR_FORECAST_READ_MODEL_V3
PACE_PROJECTION_OWNER=SMNYL_PACE_FORECAST_ENGINE
SCENARIO_CONTEXT_OWNER=MANAGER_ADVISOR_FORECAST_ENGINE
LEGACY_REVENUE_FORECAST_FOR_ADVISOR_FORECAST=REJECTED
FORECAST_PROJECTION_STATUS=READY_FOR_READ_ONLY_ADAPTER
FORECAST_AUTHORITY_STATUS=RESOLVED_BY_EXISTING_RUNTIME_RECONCILIATION
NEW_FORECAST_ENGINE=0
NEW_FORECAST_FORMULA=0
```
