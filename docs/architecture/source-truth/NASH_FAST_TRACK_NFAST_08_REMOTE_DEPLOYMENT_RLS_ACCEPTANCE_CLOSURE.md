# NASH Fast Track — NFAST-08 Remote Deployment and RLS Acceptance Closure

## Closure status

- `STAGE_ID=NFAST-08_DEPLOYMENT_AND_REMOTE_RLS_ACCEPTANCE`
- `STATUS=COMPLETE_DEPLOYED_AND_REMOTE_ACCEPTED`
- `CLOSURE_DATE=2026-07-24`
- `CONTRACT_VERSION=NFAST-08.1`
- `SOURCE_IMPLEMENTATION_COMMIT=ea2bbe3a37ee03347f7d63e9c18a0c3048df1dfa`
- `MIGRATION_VERSION=20260724000100`
- `SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv`
- `REMOTE_DEPLOYMENT_EXECUTED=YES`
- `REMOTE_RLS_ACCEPTANCE=PASS`
- `MAIN_MUTATION_PERFORMED=NO`
- `NFAST_09_AUTHORIZED=NO`

## Supersession scope

This document records the separately executed deployment and remote
acceptance gate that followed the repository-only NFAST-08 implementation
closure.

It does not rewrite or erase the earlier implementation authorization
record. The earlier documents remain historical evidence of the state
before deployment.

## Remote migration evidence

The controlled Supabase deployment applied exactly:

```text
20260724000100_nfast08_prospect_timeline_governance.sql
```

The linked local and remote migration histories both reported:

```text
Local:  20260724000100
Remote: 20260724000100
```

No later migration was authorized or applied by this gate.

## Deployed database authority

The deployment established the following remote objects and behavior:

- `public.prospect_timeline_events`;
- append-only commercial Timeline persistence;
- advisor and prospect ownership constraints;
- deterministic idempotency;
- minimized event-specific payload validation;
- evidence-reference validation;
- governed advisor append RPC;
- Pipeline lifecycle capture trigger;
- advisor-private RLS select policy;
- security-invoker commercial Timeline view;
- direct authenticated insert, update, and delete denial;
- anonymous table and RPC denial.

The existing `public.prospect_audit_events` authority remains technical
audit evidence and was not backfilled, copied, or promoted into the
commercial Timeline.

## Remote RLS acceptance method

The remote acceptance used randomized temporary identities and records
inside one database statement.

The statement deliberately terminated with the marker:

```text
NFAST08_ACCEPTANCE_PASS
```

That expected exception forced PostgreSQL to roll back the complete
acceptance transaction.

The Management API therefore returned HTTP 400 for the expected
exception-bearing transaction. The PASS marker was present in that
response and was required before the acceptance runner continued.

A separate read-only verification request completed successfully and
confirmed zero remaining test records.

## Acceptance results

- `ADVISOR_ISOLATION=PASS`
- `PIPELINE_TIMELINE_TRIGGER=PASS`
- `GOVERNED_RPC=PASS`
- `IDEMPOTENCY=PASS`
- `CROSS_OWNER_ACCESS_DENIED=PASS`
- `PROHIBITED_PAYLOAD_DENIED=PASS`
- `DIRECT_TABLE_INSERT_DENIED=PASS`
- `ANONYMOUS_ACCESS_DENIED=PASS`
- `APPEND_ONLY_UPDATE_DENIED=PASS`
- `APPEND_ONLY_DELETE_DENIED=PASS`
- `COMMERCIAL_VIEW_RLS=PASS`
- `EXPECTED_ROLLBACK_EXCEPTION=OBSERVED`

## Rollback residue verification

The independent post-transaction verification reported:

```text
AUTH_USERS_AFTER_ROLLBACK=0
PROSPECTS_AFTER_ROLLBACK=0
TIMELINE_EVENTS_AFTER_ROLLBACK=0
```

Therefore:

- `TEMPORARY_REMOTE_DATA_ROLLED_BACK=PASS`
- `PERSISTENT_TEST_USERS=0`
- `PERSISTENT_TEST_PROSPECTS=0`
- `PERSISTENT_TEST_TIMELINE_EVENTS=0`
- `PERSISTENT_TEST_DATA=NONE`

## Mutation record

The remote acceptance test did not:

- apply another migration;
- alter the deployed schema;
- modify production prospect records;
- retain temporary users or prospect records;
- modify the repository during database testing;
- mutate `main`;
- authorize NFAST-09.

## NFAST-08 final gate

- `NFAST_08_IMPLEMENTATION=PASS`
- `NFAST_08_MIGRATION_DEPLOYMENT=PASS`
- `NFAST_08_REMOTE_MIGRATION_HISTORY=PASS`
- `NFAST_08_REMOTE_RLS_ACCEPTANCE=PASS`
- `NFAST_08_REMOTE_ACCEPTANCE_CLOSED=YES`

## Next gate

- `NEXT_STAGE=NFAST-09_SEPARATE_PRODUCT_AUTHORIZATION_GATE`
- `NEXT_STAGE_STATUS=NOT_AUTHORIZED`
- `NFAST_09_TIMELINE_TO_BRIEF_STATUS=BLOCKED_PENDING_SEPARATE_AUTHORIZATION`

No implementation, deployment, projection, or Timeline-to-Brief work for
NFAST-09 is authorized by this closure.
