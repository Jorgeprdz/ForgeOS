# REP-13 — Reporting Source Truth Reconciliation

Status: ACCEPTED
Date: 2026-07-31
Source branch: `feature/universal-reporting-kernel-foundation`
Target branch: `integration/reporting-source-truth-reconciliation`
Target base: current `main`

```text
REPORTING_SOURCE_TRUTH_RECONCILIATION=COMPLETE
DIRECT_MERGE=NOT_AUTHORIZED
TARGET_BASE=CURRENT_MAIN
PARKED_BRANCH_ROLE=SOURCE_REFERENCE
REPORTING_AUTHORITY=UNIVERSAL_REPORTING_KERNEL
FORGE_THINKS=YES
AI_INTERPRETS_ONLY=YES
```

## 1. Purpose

Reconcile the parked Universal Reporting foundation with the current productive ForgeOS tree before any code is ported or any UI is integrated.

This checkpoint does not authorize a merge from the parked branch. It classifies source material as `REUSE`, `ADAPT`, `SUPERSEDE`, or `REJECT`, establishes extraction order, and locks the production authority boundary.

## 2. Repository finding

The parked branch diverges from current `main` and cannot be promoted as a branch unit.

```text
PARKED_BRANCH_AHEAD_BY=64
PARKED_BRANCH_BEHIND_BY=361
BRANCH_RELATION=DIVERGED
```

The canonical path `advisor-os/reporting/` is absent from current `main`. Therefore there is no active competing universal kernel in production. The reconciliation problem is not kernel conflict; it is provider compatibility with domain authorities that evolved after the parked checkpoint.

## 3. Constitutional lock

```text
FORGE_OWNS_REPORT_DEFINITIONS=YES
FORGE_OWNS_METRICS=YES
FORGE_OWNS_PERIOD_RESOLUTION=YES
FORGE_OWNS_QUERY_VALIDATION=YES
FORGE_OWNS_AGGREGATION=YES
FORGE_OWNS_COMPARISON=YES
FORGE_OWNS_VISUALIZATION_POLICY=YES
FORGE_OWNS_INSIGHTS=YES

AI_OWNS_LANGUAGE_INTERPRETATION=YES
AI_OWNS_METRIC_DEFINITION=NO
AI_OWNS_QUERY_PLANNING=NO
AI_OWNS_CALCULATION=NO
AI_OWNS_CHART_SELECTION=NO
AI_OWNS_ANALYTICAL_CONCLUSIONS=NO
```

Any future language interpreter must emit an untrusted intent. Only Forge may resolve that intent into an authorized report request.

## 4. Classification rules

### REUSE

Contract or runtime is domain-neutral, deterministic, framework-independent, and does not conflict with current authorities.

### ADAPT

The design is valid, but imports, identifiers, provider capabilities, read models, source contracts, or runtime composition must be reconciled with current production.

### SUPERSEDE

A newer production authority now exists and must replace the parked implementation while preserving only the reporting-facing contract.

### REJECT

The source violates current constitutional, authority, lifecycle, persistence, or UI boundaries, or recreates legacy behavior.

## 5. Universal kernel classification

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/reporting/domain/reporting-kernel-contract.mjs` | REUSE | Strict domain-neutral request, provider, authority, `asOf`, time-zone, identity and deterministic-key contracts. |
| `advisor-os/reporting/domain/reporting-calendar-policy.mjs` | REUSE | Universal period policy belongs to reporting authority and is independent of product domains. |
| `advisor-os/reporting/domain/report-definition.mjs` | REUSE | Canonical report definition remains required. |
| `advisor-os/reporting/domain/report-comparison-definition.mjs` | REUSE | Comparison semantics remain universal. |
| `advisor-os/reporting/domain/universal-report-model.mjs` | ADAPT | Preserve universal identity, measures, series, totals, exclusions and provenance; extend for chart-ready series metadata and drill-down references without presentation styling. |
| `advisor-os/reporting/application/report-provider-port.mjs` | REUSE | Provider boundary remains the correct domain interface. |
| `advisor-os/reporting/runtime/universal-reporting-kernel.mjs` | REUSE | Kernel orchestration remains authoritative. |
| `advisor-os/reporting/runtime/universal-period-resolver.mjs` | REUSE | Required for arbitrary requested periods and canonical exact ranges. |
| `advisor-os/reporting/runtime/universal-report-aggregation-runtime.mjs` | REUSE | Shared aggregation prevents domain and UI duplication. |
| `advisor-os/reporting/runtime/report-provider-runtime.mjs` | ADAPT | Registry composition must use current providers and current boot/runtime conventions. |
| `advisor-os/reporting/runtime/report-comparison-engine.mjs` | REUSE | Shared baseline and comparison calculations remain valid. |

## 6. Surface and visualization classification

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/reporting/application/reporting-surface-contract.mjs` | ADAPT | Current contract supports table, totals, exclusions, provenance, comparison and download, but lacks explicit dynamic chart models, compatibility policy and point-level drill-down. |
| `advisor-os/reporting/application/reporting-surface-adapter.mjs` | ADAPT | Preserve framework-neutral projection; extend to chart-ready payloads. |
| Any legacy report/dashboard HTML or inline chart calculation | REJECT | UI cannot calculate measures, resolve periods, or own reporting truth. |
| Material 3 reporting route | NEW | No accepted current implementation exists. |
| Forge visualization policy | NEW | Must deterministically select and validate line, bar, stacked bar, donut, funnel, heatmap and table compatibility. |
| Chart runtime adapter | NEW | Must consume chart-ready Forge output and remain calculation-free. |

## 7. Export and delivery classification

| Source | Decision | Reason |
| --- | --- | --- |
| `report-export-contract.mjs` | REUSE | Export must consume accepted universal reports. |
| `json-report-export-adapter.mjs` | REUSE | Machine-readable export remains valid. |
| `csv-report-export-adapter.mjs` | REUSE | Flat-data export remains valid. |
| `download-descriptor-delivery-adapter.mjs` | ADAPT | Browser and Material 3 delivery lifecycle must be reconciled. |
| PDF adapter | NEW | Planned but not implemented in parked source. |
| Spreadsheet/XLSX adapter | NEW | Planned but not implemented in parked source. |
| Chart image export | NEW | Required for rendered analysis sharing. |

## 8. Provider classification

### Activity

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/activity/reporting/activity-report-provider.mjs` | ADAPT | Provider semantics are valid, but it must bind to the current Event & Evidence / Activity authority and current projections. |
| Parked Activity domain, persistence and pipeline projection | SUPERSEDE | Current productive Activity/Event & Evidence authorities are newer. Do not port the old domain stack as an authority unit. |

### Pipeline

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/pipeline/reporting/pipeline-report-provider.mjs` | ADAPT | Preserve measures and provider shape; bind to current productive Pipeline state, transition, timeline and stage-persistence authorities. |
| `pipeline-transition-read-model.mjs` | ADAPT | Reconcile transition vocabulary and lifecycle with current canonical pipeline events. |

### Portfolio / Cartera

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/portfolio/reporting/portfolio-report-provider.mjs` | ADAPT | Provider contract is reusable; source facts must come from current Cartera governed read models and policies. |
| `portfolio-policy-read-model.mjs` | SUPERSEDE | Current Cartera policy reconciliation and repository-ready work is newer. |

### Performance

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/performance/reporting/performance-report-provider.mjs` | ADAPT | Preserve provider boundary; reconcile scoring and activity inputs with current accepted Activity truth. |
| Performance surface adapter from parked branch | REJECT_AS_UI | It may inform mapping but cannot become the Material 3 reporting surface or own totals. |

### Commissions

| Source | Decision | Reason |
| --- | --- | --- |
| `advisor-os/commissions/reporting/commissions-report-provider.mjs` | ADAPT_WITH_GUARD | May only expose measures backed by accepted commission and payment authority. |
| `commission-report-read-model.mjs` | ADAPT_WITH_GUARD | Unverified payout, statement or payment facts must remain unavailable rather than estimated. |

## 9. Explicit rejections

```text
DIRECT_BRANCH_MERGE=REJECTED
PARKED_DOMAIN_STACK_PROMOTION=REJECTED
LEGACY_REPORT_UI_PROMOTION=REJECTED
UI_TOTAL_RECALCULATION=REJECTED
UI_PERIOD_RESOLUTION=REJECTED
AI_QUERY_EXECUTION=REJECTED
AI_CHART_SELECTION=REJECTED
SQL_GENERATED_BY_INTERPRETER=REJECTED
MISSING_DATA_AS_ZERO=REJECTED
UNVERIFIED_COMMISSION_AS_OFFICIAL=REJECTED
```

## 10. Safe extraction manifest

### Wave A — domain-neutral reporting core

Port with minimal semantic change:

```text
advisor-os/reporting/domain/reporting-kernel-contract.mjs
advisor-os/reporting/domain/reporting-calendar-policy.mjs
advisor-os/reporting/domain/report-definition.mjs
advisor-os/reporting/domain/report-comparison-definition.mjs
advisor-os/reporting/application/report-provider-port.mjs
advisor-os/reporting/runtime/universal-reporting-kernel.mjs
advisor-os/reporting/runtime/universal-period-resolver.mjs
advisor-os/reporting/runtime/universal-report-aggregation-runtime.mjs
advisor-os/reporting/runtime/report-comparison-engine.mjs
```

Wave A must restore and execute the corresponding isolated tests before any provider is added.

### Wave B — universal model and surface evolution

Port and extend:

```text
advisor-os/reporting/domain/universal-report-model.mjs
advisor-os/reporting/application/reporting-surface-contract.mjs
advisor-os/reporting/application/reporting-surface-adapter.mjs
```

Required additions:

```text
seriesIdentity
seriesKind
temporalGrain
dimensionIdentity
measureIdentity
unit
pointProvenance
drilldownDescriptor
compatibleVisualizations
recommendedVisualization
partialPeriodState
missingDataState
```

No color, CSS, component, route, or design-token fields belong in the universal model.

### Wave C — current-authority provider reconstruction

Rebuild providers one at a time against current production:

```text
1. Activity
2. Pipeline
3. Portfolio/Cartera
4. Performance
5. Commissions with authority guard
```

Each provider requires parity fixtures and provenance verification before registration.

### Wave D — export restoration

Restore JSON and CSV first. Add PDF, XLSX and chart-image output only after the universal model and chart surface are accepted.

### Wave E — Material 3 integration

Begins only after core, providers, comparison, chart-ready surface and exports pass contract tests.

## 11. Required invariants

```text
ONE_REPORTING_AUTHORITY=PASS_REQUIRED
ONE_CANONICAL_AS_OF=PASS_REQUIRED
ONE_PERIOD_RESOLVER=PASS_REQUIRED
PROVIDER_DOMAIN_AUTHORITY_PRESERVED=PASS_REQUIRED
NO_UI_CALCULATION=PASS_REQUIRED
NO_AI_CALCULATION=PASS_REQUIRED
NO_INVENTED_ZEROES=PASS_REQUIRED
POINT_TO_EVIDENCE_TRACEABILITY=PASS_REQUIRED
ACTIVITY_REPORT_PARITY=PASS_REQUIRED
PIPELINE_REPORT_PARITY=PASS_REQUIRED
PORTFOLIO_REPORT_PARITY=PASS_REQUIRED
```

## 12. Closure verdict

```text
REP_13_SOURCE_TRUTH_RECONCILIATION=PASS
SAFE_EXTRACTION_MANIFEST=LOCKED
PARKED_BRANCH_DIRECT_PROMOTION=NO
CURRENT_MAIN_IS_TARGET_BASE=YES
NEXT=REP_14_UNIVERSAL_REPORTING_CORE_EXTRACTION
```
