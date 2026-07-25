# NASH Fast Track — NFAST-09 Stage 3D Remote Deployment and RLS Acceptance Gate

## Authorization record

- `STAGE_ID=NFAST-09_STAGE_3D_REMOTE_DEPLOYMENT_RLS_ACCEPTANCE`
- `SOURCE_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection`
- `SOURCE_IMPLEMENTATION_COMMIT=8df2cfa889004af979f834b947c29c4eec9ba29e`
- `SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv`
- `MIGRATION_VERSION=20260725000100`
- `MIGRATION_FILE=supabase/migrations/20260725000100_nfast09_due_action_sync_authority.sql`
- `GATE_STATUS=AUTHORIZED`
- `REMOTE_MIGRATION_APPLY_AUTHORIZED=YES`
- `REMOTE_RLS_ACCEPTANCE_AUTHORIZED=YES`
- `REMOTE_TEMPORARY_TEST_DATA_AUTHORIZED=TRANSACTIONAL_ROLLBACK_ONLY`
- `OTHER_MIGRATIONS_AUTHORIZED=NO`
- `PRODUCTION_PROSPECT_MUTATION_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Authorized execution

This gate authorizes one controlled deployment:

```text
20260725000100_nfast09_due_action_sync_authority.sql
```

The executor must block if any other local migration is pending or if local and
remote migration histories diverge outside this exact version.

## Remote acceptance

The acceptance transaction may create randomized temporary auth users and
prospects solely inside one transaction.

It must prove:

- all three minimized NFAST-09 authorities exist;
- RLS and FORCE RLS are active;
- direct `anon` and `authenticated` table privileges are denied;
- authenticated RPC execution is granted;
- anonymous RPC execution is denied;
- advisor identity comes from `auth.uid()`;
- deterministic mutation replay is idempotent;
- acknowledgement is monotonic and does not complete the action;
- incompatible lifecycle changes create `CONFLICT_REVIEW_REQUIRED`;
- both local and remote conflict candidates are retained;
- pull is incremental and advisor-isolated;
- sensitive payloads and advisor injection are rejected.

The transaction must terminate with the deliberate marker:

```text
NFAST09_ACCEPTANCE_PASS
```

That exception must roll back every temporary record. An independent query must
then verify zero remaining users, prospects, Timeline events, audit events,
due actions, mutation receipts, and conflicts.

## Explicit boundaries

- `MI_DIA_RUNTIME_BINDING_AUTHORIZED=NO`
- `SMART_WIDGET_RUNTIME_BINDING_AUTHORIZED=NO`
- `BACKGROUND_PUSH_AUTHORIZED=NO`
- `EDGE_FUNCTION_AUTHORIZED=NO`
- `SERVER_CRON_AUTHORIZED=NO`
- `MESSAGE_GENERATION_AUTHORIZED=NO`
- `MESSAGE_SEND_AUTHORIZED=NO`
- `MAIN_MERGE_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next stage after successful acceptance

- `NEXT_STAGE=NFAST-09_STAGE_3E_MI_DIA_LOCAL_FIRST_RUNTIME_BINDING`
- `NEXT_STAGE_STATUS=BLOCKED_UNTIL_REMOTE_ACCEPTANCE_PASS`
