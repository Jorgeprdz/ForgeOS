# PERF-05 — Performance Supabase Read Composition

```text
PERF_05_PERFORMANCE_SUPABASE_READ_COMPOSITION=IMPLEMENTED_PENDING_ACCEPTANCE
PERFORMANCE_BRANCH=feature/performance-scoring-contract-foundation
SOURCE_COMMIT=aa07f77b38b6499f880fb8c730a299b97804d73f
COMPOSITION_SCHEMA=performance-supabase-read-composition.v1
READ_RUNTIME_SCHEMA=performance-read-runtime.v1
ACTIVITY_RUNTIME_SCHEMA=activity-read-runtime.v1
ACTIVITY_PERSISTENCE_ADAPTER=SupabaseActivityRepository
ACTIVITY_LIST_RPC=activity_records_list_v1
PERSISTENCE_MODE=READ_ONLY
DIRECT_TABLE_ACCESS=NO
REMOTE_DATABASE_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
```

## Decision

PERF-05 composes the accepted Performance read runtime with the frozen
Supabase-backed Activity read runtime. Performance does not introduce a second
repository, table, RPC family, scoring store or persistence model.

The composition chain is:

```text
Supabase client
  → SupabaseActivityRepository
  → ActivityReadRuntime
  → PerformancePeriodRuntime
  → PerformanceReadRuntime
  → daily / period read models
```

## Authority

- Activity remains the authority for persistence, lifecycle, evidence,
  correction, reversal and scoring eligibility.
- Performance remains the authority for the versioned 25-point policy and read
  projections.
- Supabase access is read-only through `activity_records_list_v1`.
- No direct table query is authorized.
- No append, update, delete, migration or remote schema mutation is authorized.

## Runtime contract

`createSupabasePerformanceReadRuntime(...)` accepts:

- `client`;
- `organizationId`;
- `advisorId`;
- optional `clock`;
- optional versioned `policy`;
- optional `maxDays`;
- optional Activity aggregation paging limits.

It exposes only:

- `readDay(query)`;
- `readPeriod(query)`.

## Non-goals

No UI binding, component state, route registration, navigation pill, remote
migration, cached scoring table, background synchronization, ranking,
leaderboard, enforcement or human assessment is introduced.

## Next

`PERF-06_PERFORMANCE_SURFACE_ADAPTER_CONTRACT`
