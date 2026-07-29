# REP-12 — Reporting Surface Adapter Contract

```text
REP_12_REPORTING_SURFACE_ADAPTER_CONTRACT=IMPLEMENTED_PENDING_ACCEPTANCE
REPORTING_BRANCH=feature/universal-reporting-kernel-foundation
SOURCE_COMMIT=644e2b917046beb3840c0790b824f439795547d7
REPORTING_SURFACE_MODEL_SCHEMA=reporting-surface-model.v1
REPORTING_SURFACE_COLUMN_SCHEMA=reporting-surface-column.v1
REPORTING_SURFACE_ROW_SCHEMA=reporting-surface-row.v1
REPORTING_SURFACE_TOTAL_SCHEMA=reporting-surface-total.v1
REPORTING_SURFACE_EXPORT_REQUEST_SCHEMA=reporting-surface-export-request.v1
REPORTING_SURFACE_ADAPTER_SCHEMA=reporting-surface-adapter.v1
REPORTING_SURFACE_DOWNLOAD_SCHEMA=reporting-surface-download.v1
SUPPORTED_EXPORT_FORMATS=JSON,CSV
SOURCE_REPORT_MUTATION=NO
REPORT_EXECUTION_AUTHORITY=NO
AGGREGATION_AUTHORITY=NO
COMPARISON_AUTHORITY=NO
EXPORT_FORMATTING_AUTHORITY=NO
DELIVERY_DELEGATION_AUTHORITY=YES
UI_RENDERING_AUTHORITY=NO
PERSISTENCE_MUTATION_AUTHORITY=NO
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

REP-12 projects an accepted `universal-report-model.v1` into a UI-neutral
semantic surface.

The surface preserves report identity, provider, authority, period, state,
column capabilities, rows, totals, exclusions, provenance, execution metadata
and comparison results. Dimensions appear before measures and every row emits
cells in that canonical order.

REP-12 does not execute providers, aggregate measures, calculate comparisons,
format exports or render UI. Export requests are delegated to the accepted
REP-11 JSON/CSV adapters and download descriptor delivery adapter.

The surface contains no presentation labels, text, colors, icons, components,
routes, navigation or layout. Those decisions are owned by UI-REP-01.

Next: `UI-REP-01_REPORTING_SURFACE_IMPLEMENTATION`.
