# NASH Fast Track — NFAST-09 Stage 3D Remote Deployment and RLS Acceptance Closure

## Closure status

- `STAGE_ID=NFAST-09_STAGE_3D_REMOTE_DEPLOYMENT_RLS_ACCEPTANCE`
- `STATUS=COMPLETE_DEPLOYED_AND_REMOTE_ACCEPTED`
- `CLOSURE_TIMESTAMP_UTC=2026-07-25T03:53:03Z`
- `SOURCE_IMPLEMENTATION_COMMIT=8df2cfa889004af979f834b947c29c4eec9ba29e`
- `AUTHORIZATION_GATE_COMMIT=5d1ecc203b1a0bd7ef943e7baab9876b75b7d0be`
- `MIGRATION_VERSION=20260725000100`
- `SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv`
- `REMOTE_DEPLOYMENT_EXECUTED=YES`
- `REMOTE_RLS_ACCEPTANCE=PASS`
- `TEMPORARY_REMOTE_DATA_ROLLED_BACK=PASS`
- `MAIN_MUTATION_PERFORMED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Applied migration

The controlled deployment applied or confirmed exactly:

```text
supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql
```

The post-deployment local and remote migration histories both contained:

```text
20260725000100
```

No other pending migration was authorized or applied by this stage.

## Remote authority accepted

The remote project now contains:

- `public.prospect_due_actions`;
- `public.prospect_due_action_mutations`;
- `public.prospect_due_action_conflicts`;
- `public.forge_nfast09_push_due_action_mutation(jsonb)`;
- `public.forge_nfast09_pull_due_action_changes(text, integer)`.

## Acceptance method

The acceptance used two randomized temporary advisor identities and three
temporary prospects inside one PostgreSQL transaction.

It proved:

- advisor partition isolation;
- deterministic mutation replay;
- acknowledgement monotonicity;
- acknowledgement does not complete or tombstone the due action;
- stale lifecycle reschedule becomes `CONFLICT_REVIEW_REQUIRED`;
- local and remote conflict candidates remain available;
- direct table access is denied;
- authenticated RPC execution is allowed;
- anonymous RPC execution is denied;
- advisor injection is rejected;
- sensitive outbox payloads are rejected;
- incremental pull returns only the authenticated advisor partition.

The transaction deliberately raised:

```text
NFAST09_ACCEPTANCE_PASS
```

The expected exception forced a complete rollback.

## Independent residue verification

A separate read-only Management API query verified:

- `AUTH_USERS_AFTER_ROLLBACK=0`
- `PROSPECTS_AFTER_ROLLBACK=0`
- `DUE_ACTIONS_AFTER_ROLLBACK=0`
- `MUTATIONS_AFTER_ROLLBACK=0`
- `CONFLICTS_AFTER_ROLLBACK=0`
- `TIMELINE_EVENTS_AFTER_ROLLBACK=0`
- `AUDIT_EVENTS_AFTER_ROLLBACK=0`

The same verification confirmed migration history, object presence, FORCE RLS,
direct-grant denial, authenticated RPC grants, and anonymous RPC denial.

## Evidence

- `docs/evidence/nfast-09-stage3d-remote-acceptance.json`

## Explicit non-mutations

This stage did not:

- bind Mi Día or the Smart Widget;
- add background push;
- generate or send messages;
- mutate production prospect records;
- retain temporary users or records;
- modify `main`;
- authorize NFAST-10.

## Final gate

- `NFAST_09_STAGE_3D_REMOTE_DEPLOYMENT=PASS`
- `NFAST_09_STAGE_3D_REMOTE_RLS_ACCEPTANCE=PASS`
- `NFAST_09_STAGE_3D_REMOTE_ACCEPTANCE_CLOSED=YES`
- `NEXT_STAGE=NFAST-09_STAGE_3E_MI_DIA_LOCAL_FIRST_RUNTIME_BINDING`
- `NEXT_STAGE_STATUS=AUTHORIZED_PENDING_IMPLEMENTATION`
