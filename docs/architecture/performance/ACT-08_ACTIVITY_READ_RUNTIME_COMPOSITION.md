# ACT-08 — Activity Read Runtime Composition

```text
ACT_08_ACTIVITY_READ_RUNTIME_COMPOSITION=IMPLEMENTED_PENDING_ACCEPTANCE
SOURCE_COMMIT=042306811be32368bba966d733bf9badeb366cac
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
RUNTIME_SCHEMA=activity-read-runtime.v1
CAPABILITIES=ACTIVITY_FEED,ACTIVITY_PERIOD_AGGREGATION
AUTHORITY_BINDING=ORGANIZATION_AND_ADVISOR_AT_COMPOSITION
WRITE_CAPABILITY=ABSENT
PRODUCTIVE_UI_MUTATION=NO
MUI_TOKEN_AUTHORITY=NO
POINT_AUTHORITY=PERFORMANCE_ONLY
PIPELINE_WRITER_MUTATION=NO
FES_MUTATION=NO
MUI_MUTATION=NO
MAIN_MUTATION=NO
REMOTE_DATABASE_MUTATION=NO
```

## Boundary

ACT-08 creates the read-only composition root for Activity:

```text
Supabase client or injected ActivityRepository
  -> authority-bound Activity read runtime
  -> feed()
  -> aggregatePeriod()
```

The runtime composes the deployed `SupabaseActivityRepository`, the governed
Activity feed projector and the period aggregation service behind one immutable
facade.

## Authority binding

`organizationId` and `advisorId` are required when the runtime is created.
Individual feed or period queries cannot override them.

This prevents a future caller from changing tenant or advisor scope through a
read request. Repository reads remain scoped by the existing port and RPC
contracts.

## Time boundary

Both read capabilities accept an optional explicit `asOf`. When omitted, the
runtime obtains a canonical instant from its injected clock.

The clock is injectable for deterministic tests and must return a valid ISO
instant.

## Read-only facade

The runtime exposes exactly:

- `schemaVersion`;
- bound `authority`;
- read `capabilities`;
- `feed(query)`;
- `aggregatePeriod(query)`.

It does not expose:

- `append`;
- the repository;
- the Supabase client;
- RPC or table access;
- mutation fallback.

The Supabase factory may construct the existing repository internally, but the
returned facade remains read-only.

## Productive UI freeze

ACT-08 does not import browser globals, render HTML, select CSS classes, consume
Material tokens or mount a productive route.

The UI migration remains frozen.

## Scoring boundary

The runtime carries no points, score, weight, multiplier or ranking. Performance
remains the only future scoring authority.

## Persistence

No migration, table, RPC or remote database mutation is introduced. The runtime
uses the existing deployed read RPC through `SupabaseActivityRepository`.

## Next

`ACT-09_ACTIVITY_REMOTE_READ_ACCEPTANCE`
