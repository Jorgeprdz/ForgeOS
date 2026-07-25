# NASH Fast Track — NFAST-09 Stage 3C Local Productive Sync Gateway Closure

## Status

- `STAGE_ID=NFAST-09_STAGE_3C_PRODUCTIVE_SYNC_GATEWAY`
- `STATUS=LOCAL_IMPLEMENTATION_COMPLETE_AND_PUSHED`
- `GATEWAY_VERSION=NFAST-09.3C`
- `MIGRATION_VERSION=20260725000100`
- `REMOTE_DEPLOYMENT_PERFORMED=NO`
- `REMOTE_RLS_ACCEPTANCE_PERFORMED=NO`
- `MI_DIA_BINDING_PERFORMED=NO`
- `SMART_WIDGET_BINDING_PERFORMED=NO`
- `BACKGROUND_PUSH_PERFORMED=NO`
- `MAIN_MUTATION_PERFORMED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Implemented files

```text
advisor-os/offline/due-action-supabase-gateway.js
supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql
tests/nfast-09-stage3c-productive-sync-gateway-test.js
tests/nfast-09-stage3c-migration-security-test.mjs
```

## Productive gateway

The browser gateway accepts an authenticated Supabase client and exposes only
`pushMutation` and `pullChanges`. It verifies the authenticated user before
every RPC and rejects advisor partition mismatch before remote access.

It contains no direct table query, unrestricted fetch, provider call, message
generation, message send, cache clear, or local record deletion authority.

## Server authority

The migration defines a minimized due-action authority, deterministic mutation
receipt authority, and conflict-candidate journal. Direct table privileges are
revoked from `anon` and `authenticated`. Browser access is limited to two
authenticated security-definer RPCs whose advisor partition is derived from
`auth.uid()`.

## Idempotency and conflicts

`mutation_id` is the primary key. Replays return the stored result and do not
apply the action twice. Lifecycle operations require the expected version and
base revision. Conflicts preserve the local operation, authorized patch, and
remote minimized candidate and set `CONFLICT_REVIEW_REQUIRED` instead of using
silent last-write-wins.

Acknowledgement-only operations use a monotonic rank and never complete the
commercial due action.

## Incremental pull

A global sequence produces advisor-filtered numeric cursors. Pull returns only
rows newer than the supplied cursor and never performs a full cache delete.

## Compatibility

The migration does not alter `prospects.next_action_type` or
`prospects.next_action_at`. Runtime binding remains separately gated.

## Validation

Local tests prove authenticated client enforcement, advisor injection denial,
RPC-only mutation and pull, conflict mapping, transport retry mapping, sensitive
data rejection, RLS and direct-grant denial, deterministic mutation replay,
conflict-candidate preservation, bounded incremental cursor, and regression
safety for Stage 3A, Stage 3B, NFAST-08, NFAST-09 Stages 1–2, and NFAST-04.

## Explicit non-authorizations

- `REMOTE_MIGRATION_APPLY_AUTHORIZED=NO`
- `REMOTE_DEPLOYMENT_AUTHORIZED=NO`
- `REMOTE_RLS_ACCEPTANCE_AUTHORIZED=NO`
- `MI_DIA_RUNTIME_BINDING_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage

- `NEXT_STAGE=NFAST-09_STAGE_3D_REMOTE_DEPLOYMENT_RLS_ACCEPTANCE`
- `NEXT_STAGE_STATUS=NOT_YET_EXECUTED`
