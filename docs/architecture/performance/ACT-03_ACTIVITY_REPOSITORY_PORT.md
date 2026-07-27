# ACT-03 — Activity Repository Port

```text
ACT_03_ACTIVITY_REPOSITORY_PORT=IMPLEMENTED
PORT=ActivityRepository
REFERENCE_ADAPTER=InMemoryActivityRepository
PERSISTENCE_BACKEND=NONE
SUPABASE_REMOTE_MUTATION=NO
PIPELINE_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
FES_MUTATION=NO
MUI_MUTATION=NO
MAIN_MUTATION=NO
APPEND_ONLY=YES
TENANT_ISOLATION=ORGANIZATION_ID
SOURCE_IDEMPOTENCY=TRUTH_KEY
CORRECTION_REFERENCE_VALIDATION=YES
REVERSAL_REFERENCE_VALIDATION=YES
CURSOR_PAGINATION=YES
NEXT=ACT-04_ACTIVITY_PERSISTENCE_ADAPTER
```

## Purpose

ACT-03 establishes the application-facing repository contract for canonical
ActivityRecord envelopes and a deterministic in-memory reference adapter.

## Append-only authority

The repository exposes append, identity reads, truth-key reads, filtered lists
and tenant-scoped counts. It exposes no update or delete operation.

Exact replay is idempotent. Divergent reuse of an activity id or truth key is a
conflict.

## Tenant isolation

Every read and query requires `organizationId`. Cross-organization records are
not visible even when an activity id or truth key is known.

Correction and reversal records may only reference an existing activity owned by
the same organization and advisor.

## Query contract

The first query vocabulary supports:

- organization and advisor;
- activity types and lifecycles;
- source systems and evidence states;
- prospect, opportunity, appointment and policy references;
- evaluation-date range;
- occurrence-instant range;
- ascending or descending order;
- deterministic cursor pagination;
- bounded limits from 1 to 500.

## Boundary

This phase does not connect Activity to Supabase, IndexedDB, Pipeline, the
productive UI, FES or Performance scoring.

The in-memory adapter is a contract proof and test double, not production
persistence.
