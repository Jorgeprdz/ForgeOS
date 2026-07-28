# NASH Fast Track — NFAST-09 Stage 3C Productive Sync Gateway Gate

## Decision record

- `STAGE_ID=NFAST-09_STAGE_3C_PRODUCTIVE_SYNC_GATEWAY`
- `SOURCE_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection`
- `SOURCE_COMMIT=e1c4dbbba15034b61ccaf9064e457088cf93dfcc`
- `PRODUCT_OWNER_EXECUTION_REQUIRED=YES`
- `GATE_STATUS=AUTHORIZED`
- `IMPLEMENTATION_SCOPE=LOCAL_REPOSITORY_ONLY`
- `REMOTE_DEPLOYMENT_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Why this gate is required

The corrected Stage 3 gate authorized the offline replica, durable outbox,
incremental synchronization, and global acknowledgement synchronization. It
explicitly did not authorize a Supabase schema mutation, RLS mutation, or
deployment.

Stage 3A and Stage 3B are complete and pushed. A productive synchronization
gateway requires a narrowly scoped server authority before Mi Día can bind to
multi-device due actions.

## Authorized local implementation

- `PRODUCTIVE_SUPABASE_GATEWAY_IMPLEMENTATION_AUTHORIZED=YES`
- `SUPABASE_SCHEMA_FILE_IMPLEMENTATION_AUTHORIZED=YES`
- `RLS_POLICY_FILE_IMPLEMENTATION_AUTHORIZED=YES`
- `SECURITY_DEFINER_RPC_FILE_IMPLEMENTATION_AUTHORIZED=YES`
- `STATIC_MIGRATION_SECURITY_TEST_AUTHORIZED=YES`
- `LOCAL_GATEWAY_UNIT_TEST_AUTHORIZED=YES`
- `REMOTE_SUPABASE_DEPLOYMENT_AUTHORIZED=NO`

Authorized paths:

```text
advisor-os/offline/due-action-supabase-gateway.js
supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql
tests/nfast-09-stage3c-productive-sync-gateway-test.js
tests/nfast-09-stage3c-migration-security-test.mjs
docs/architecture/source-truth/NASH_FAST_TRACK_NFAST_09_STAGE_3C_*
```

## Server authority

The implementation may create only these minimized authorities:

```text
public.prospect_due_actions
public.prospect_due_action_mutations
public.prospect_due_action_conflicts
```

The due-action authority stores only prospect/advisor references, next action,
lifecycle version, acknowledgement state, snooze state, tombstone, server
revision, change cursor, and timestamps. The display name is read from the
owned `public.prospects` row.

## RPC boundary

Only these productive RPC contracts are authorized:

```text
public.forge_nfast09_push_due_action_mutation(jsonb)
public.forge_nfast09_pull_due_action_changes(text, integer)
```

The RPCs must derive the advisor from `auth.uid()`, reject advisor injection,
validate ownership, persist deterministic mutation idempotency, preserve both
conflict candidates, apply monotonic acknowledgement, and return only minimized
Stage 3A records.

## Direct table access

- `ANON_TABLE_ACCESS=DENIED`
- `AUTHENTICATED_DIRECT_TABLE_MUTATION=DENIED`
- `RPC_EXECUTE_AUTHENTICATED_ONLY=REQUIRED`
- `ROW_LEVEL_SECURITY=REQUIRED`
- `FORCE_ROW_LEVEL_SECURITY=REQUIRED`
- `ADVISOR_PARTITION_SOURCE=AUTH_UID_ONLY`

## Compatibility boundary

The existing Pipeline fields `prospects.next_action_type` and
`prospects.next_action_at` remain untouched. A later explicit runtime binding
must route due-action changes through the Stage 3A outbox and Stage 3C gateway.

## Explicit non-authorizations

- `REMOTE_MIGRATION_APPLY_AUTHORIZED=NO`
- `REMOTE_RLS_ACCEPTANCE_AUTHORIZED=NO`
- `MI_DIA_RUNTIME_BINDING_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `EDGE_FUNCTION_AUTHORIZED=NO`
- `SERVER_CRON_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage

- `NEXT_STAGE=NFAST-09_STAGE_3C_LOCAL_IMPLEMENTATION`
- `NEXT_STAGE_STATUS=AUTHORIZED`
