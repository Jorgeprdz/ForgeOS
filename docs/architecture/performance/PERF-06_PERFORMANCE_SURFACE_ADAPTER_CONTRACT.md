# PERF-06 — Performance Surface Adapter Contract

```text
PERF_06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT=IMPLEMENTED_ACCEPTED
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
SOURCE_COMMIT=e4add929295f4b9edd3fb9e3ba88c98ad63df817
ADAPTER_SCHEMA=performance-surface-adapter.v1
DAILY_SURFACE_SCHEMA=performance-daily-surface.v1
PERIOD_SURFACE_SCHEMA=performance-period-surface.v1
DASHBOARD_SURFACE_SCHEMA=performance-dashboard-surface.v1
UI_INTEGRATION_READY=YES
UI_MIGRATION_FREEZE_RESPECTED=YES
PRODUCTIVE_UI_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Decision

PERF-06 is the final backend boundary before UI integration. It converts the
accepted Performance read models into stable, framework-neutral surface
payloads.

The adapter exposes:

- `loadDay(query)`;
- `loadPeriod(query)`;
- `loadDashboard(query)`.

`loadDashboard` requires one explicit `asOf` and uses that snapshot for both
the daily and period read, preventing mixed-time surface state.

## Surface ownership

Performance owns:

- identities;
- policy identity and target;
- points and progress;
- activity rows;
- period series;
- exclusions;
- authority boundaries;
- deterministic request keys.

UI owns:

- labels and wording;
- colors;
- icons;
- components;
- layout;
- responsive behavior;
- routes and navigation;
- loading, empty and error presentation.

No presentation-owned property is accepted from source read models.

## Composition

`createSupabasePerformanceSurfaceAdapter(input)` composes the PERF-05 Supabase
read runtime and the PERF-06 surface adapter. A UI integration needs only the
existing Supabase client, organization identity and advisor identity.

## Non-goals

No React component, route, navigation pill, stylesheet, design token, remote
database mutation, migration, ranking, human assessment or enforcement is
introduced.

## Readiness

```text
UI_INTEGRATION_READY=YES
UI_MIGRATION_FREEZE_RESPECTED=YES
NEXT=UI-PERF-01_PERFORMANCE_SURFACE_INTEGRATION
```
