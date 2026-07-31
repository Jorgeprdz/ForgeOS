# CARTERA 001B — REMOTE ACCEPTANCE PREPARATION EVIDENCE 001

## Status

`PREPARATION_COMPLETE / REMOTE_EXECUTION_NOT_PERFORMED`

## Source

```text
IMPLEMENTATION_PR=16
IMPLEMENTATION_HEAD=02ed3d50b54fe8c5758eb0ca30e620a7f78c6370
ACCEPTANCE_BRANCH=feature/cartera-001b-remote-acceptance
REMOTE_PROJECT_ACCESS_FROM_CURRENT_ENVIRONMENT=UNAVAILABLE
```

## Evidence prepared

- transactional remote SQL acceptance harness;
- owner and cross-tenant RLS checks;
- authenticated and anonymous RPC permission checks;
- durable Quote and Quote Version persistence checks;
- exact replay checks;
- changed-evidence and changed-decision conflict checks;
- correction lineage checks;
- append-only mutation denial checks;
- `QUOTE_AUTHORITY` Timeline attribution checks;
- minimized Prospect Timeline payload checks;
- Application conversion block;
- migration dry-run and push runner;
- remote migration-history verification;
- Termux evidence log and clipboard handoff.

## Hardening produced during acceptance review

```text
20260730000110_cartera001b_idempotency_conflict_hardening.sql
20260730000120_cartera001b_quote_authority_projection_hardening.sql
```

These migrations were added before remote deployment because acceptance review identified replay/conflict and Timeline authority defects in the initial repository implementation.

## Static safety boundary

The acceptance SQL begins a transaction and ends with `ROLLBACK`; it does not commit temporary users, prospects, Quotes, versions, events or Timeline fixtures.

The Termux runner:

- rejects a dirty worktree;
- verifies the hardened implementation ancestor;
- runs targeted tests before deployment;
- requires a migration dry-run before push;
- never runs `supabase db reset`;
- never runs migration repair;
- refuses to claim PASS without the remote SQL PASS marker;
- writes the full log to `/storage/emulated/0/ForgeGemini`;
- copies the complete log to the Termux clipboard when available.

## Not executed

```text
SUPABASE_REMOTE_MIGRATION=NOT_RUN
REMOTE_RLS_RPC_ACCEPTANCE=NOT_RUN
REMOTE_MIGRATION_HISTORY_VERIFICATION=NOT_RUN
BROWSER_E2E=NOT_RUN
FULL_REPOSITORY_SUITE=NOT_RUN
```

## Required next evidence

The next valid evidence artifact is the runner output containing:

```text
CARTERA_001B_REMOTE_ACCEPTANCE=PASS
```

Until that evidence exists:

```text
CARTERA_001C_IMPLEMENTATION=BLOCKED
```