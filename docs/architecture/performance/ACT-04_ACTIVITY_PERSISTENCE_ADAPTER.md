# ACT-04 — Activity Persistence Adapter

```text
ACT_04_ACTIVITY_PERSISTENCE_ADAPTER=IMPLEMENTED
ADAPTER=SupabaseActivityRepository
CODEC=ActivityPersistenceCodec
TABLE=public.activity_records
MIGRATION=20260726000200_act04_activity_records.sql
REMOTE_DATABASE_MUTATION=NO
MIGRATION_APPLICATION=NOT_IN_THIS_PHASE
APPEND_ONLY=YES
RLS=ADVISOR_OWNED
RPC_BOUNDARY=YES
TENANT_SCOPE=ORGANIZATION_ID
SOURCE_IDEMPOTENCY=TRUTH_KEY
PAYLOAD_AUTHORITY=CANONICAL_ACTIVITY_RECORD
NEXT=ACT-04B_ACTIVITY_PERSISTENCE_DEPLOYMENT
```

ACT-04 creates a Supabase adapter that implements the ACT-03 repository port through versioned RPCs. The client is injected and domain code does not read environment variables.

The codec stores indexed columns alongside the complete canonical ActivityRecord payload and verifies those indexes on every read.

The migration creates append-only storage, advisor-owned RLS, deterministic indexes and governed functions for append, identity reads, filtered listing and counts.

This phase versions but does not apply the migration. It does not run `supabase db push`, mutate the remote database, connect Pipeline, modify productive UI, or change FES, MUI or `main`.
