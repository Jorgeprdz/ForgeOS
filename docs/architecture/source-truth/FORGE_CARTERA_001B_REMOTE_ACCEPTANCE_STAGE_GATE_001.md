# FORGE CARTERA — 001B REMOTE ACCEPTANCE STAGE GATE 001

Forge OS  
Architecture Source Truth  
Cartera / CARTERA_001B Remote Acceptance

## Status

`REMOTE_ACCEPTANCE_PACKAGE_COMPLETE / REMOTE_EXECUTION_PENDING_LINKED_SUPABASE / CARTERA_001C_BLOCKED`

## Date

2026-07-30

## Source gate

```text
PROGRAM=FORGE_CARTERA_RELATIONSHIP_INTELLIGENCE
PHASE=CARTERA_001B_REMOTE_ACCEPTANCE
IMPLEMENTATION_BRANCH=feature/cartera-001b-quote-lifecycle-event-bridge
IMPLEMENTATION_HEAD=02ed3d50b54fe8c5758eb0ca30e620a7f78c6370
ACCEPTANCE_BRANCH=feature/cartera-001b-remote-acceptance
SUPABASE_REMOTE_MUTATION=NOT_EXECUTED_FROM_CURRENT_ENVIRONMENT
REMOTE_RLS_RPC_ACCEPTANCE=READY_TO_EXECUTE
CARTERA_001C_IMPLEMENTATION_AUTHORIZED=NO
```

## Purpose

This gate validates the productive database authority introduced by `CARTERA_001B` before Prospect Detail or Timeline UI projection work begins.

The acceptance must prove:

- migrations apply to the linked Supabase project in dependency order;
- authenticated advisors can write only through the governed RPCs;
- owner and cross-tenant RLS boundaries hold;
- Quote, Quote Version and Quote Lifecycle Event records remain advisor-owned;
- review confirmation is idempotent;
- changed evidence, freshness, source or decision semantics produce conflict rather than silent replay;
- lifecycle replay is evaluated before state-transition rejection;
- corrections preserve append-only lineage;
- Quote commercial projections enter the existing NFAST-08 Timeline as `QUOTE_AUTHORITY`;
- Timeline payloads remain minimized and do not duplicate Quote numeric truth;
- Application, Policy, Task, Calendar, Message, Provider and Compensation effects remain blocked;
- all temporary acceptance fixtures are rolled back.

## Pre-deployment findings hardened

Remote-acceptance review found two material gaps before deployment.

### 1. Replay and conflict semantics

The first implementation did not compare all stable request semantics during replay and evaluated some state transitions before replay lookup.

Hardened by:

- `supabase/migrations/20260730000110_cartera001b_idempotency_conflict_hardening.sql`;
- `tests/cartera-001b-idempotency-conflict-hardening-test.mjs`.

The hardened RPCs now compare relevant source, evidence, freshness and decision fields and allow exact replay after the lifecycle state has advanced.

### 2. Timeline authority attribution

The first implementation reused the generic NFAST-08 advisor append RPC, which would label a Quote projection as `ADVISOR_DECLARATION`.

Hardened by:

- `supabase/migrations/20260730000120_cartera001b_quote_authority_projection_hardening.sql`;
- `tests/cartera-001b-quote-authority-projection-hardening-test.mjs`.

The new internal projector reuses the NFAST-08 table and validators while writing `event_source=QUOTE_AUTHORITY`. The helper is not executable by `anon` or `authenticated` roles.

## Remote acceptance package

```text
scripts/ci/cartera-001b-remote-acceptance.sql
tests/cartera-001b-remote-acceptance-harness-test.mjs
tools/termux/forge_cartera_001b_remote_acceptance.sh
tests/cartera-001b-remote-acceptance-runner-test.mjs
```

The SQL harness is transactional and ends with `ROLLBACK`. It creates two temporary advisors and prospects, runs the acceptance matrix and leaves no fixture data when successful.

## Required execution environment

Run directly in Termux because this phase performs a remote migration push and database acceptance workflow.

Required:

- clean worktree;
- linked Supabase project;
- authenticated Supabase CLI;
- `git`, `node`, `supabase` and `psql` available;
- database connection URL available as `SUPABASE_DB_URL`, `DATABASE_URL` or `supabase/.temp/pooler-url`.

## Canonical runner

```bash
cd '/storage/emulated/0/Forge OS' && bash tools/termux/forge_cartera_001b_remote_acceptance.sh
```

The runner:

1. pins the acceptance branch and hardened implementation ancestor;
2. runs all `CARTERA_001B` Node tests;
3. inspects remote migration history;
4. runs `supabase db push --linked --dry-run`;
5. applies the three governed migrations with `supabase db push --linked`;
6. executes the transactional SQL acceptance with `psql`;
7. requires the explicit `PASS CARTERA001B_REMOTE_ACCEPTANCE` marker;
8. verifies the three remote migration versions;
9. writes and autocopies the complete evidence log.

## Closure criteria

The phase may close only with all values below proven from the execution log:

```text
SOURCE_GATE=PASS
TARGETED_TESTS=PASS
REMOTE_DRY_RUN=PASS
SUPABASE_REMOTE_MIGRATION=PASS
REMOTE_RLS_RPC_ACCEPTANCE=PASS
CARTERA_001B_REMOTE_ACCEPTANCE=PASS
RLS=PASS
RPC=PASS
IDEMPOTENCY=PASS
CONFLICTS=PASS
CORRECTIONS=PASS
QUOTE_AUTHORITY_PROJECTION=PASS
APPEND_ONLY=PASS
APPLICATION_EFFECTS=BLOCKED
TEST_FIXTURES_ROLLED_BACK=YES
```

## Current decision

```text
CARTERA_001B_REPOSITORY_IMPLEMENTATION=HARDENED
REMOTE_ACCEPTANCE_PACKAGE=COMPLETE
REMOTE_ACCEPTANCE_EXECUTED=NO
REMOTE_ACCEPTANCE_RESULT=PENDING
CARTERA_001C=BLOCKED
```

No remote PASS is claimed by this document.