# FORGE CARTERA 001B Remote Acceptance Closure 001

## Status

```text
PHASE=CARTERA_001B_QUOTE_LIFECYCLE_EVENT_BRIDGE
STAGE=CARTERA_001B_REMOTE_ACCEPTANCE
STATUS=CLOSED_REMOTE_DEPLOYED_AND_ACCEPTED
RECORDED_LOCAL=2026-07-30
SOURCE_BRANCH=feature/cartera-001b-remote-acceptance
SOURCE_COMMIT=d73a115d69e63dedaf70cf30ee3ca92e202a18de
PULL_REQUEST=17
GITHUB_ACTIONS_RUN=30600737465
GITHUB_ACTIONS_JOB=91062613717
EVIDENCE_ARTIFACT_ID=8781777452
NEXT=CARTERA_001C_PROSPECT_DETAIL_TIMELINE_PROJECTION
```

## Migration-history reconciliation

The remote-only migration was recovered from the exact SQL statements stored in
`supabase_migrations.schema_migrations` and versioned as:

```text
VERSION=20260726000200
PATH=supabase/migrations/20260726000200_act04_activity_records.sql
SHA256=7554af643b74497001b9df11778e2c05e876a13b21d1787b66927654eca64b29
RECOVERY=EXACT_REMOTE_STATEMENTS
```

No migration-history repair, schema pull or database reset was used.

## Applied Cartera authority

```text
20260730000100=CARTERA_001B_QUOTE_LIFECYCLE_EVENT_BRIDGE
20260730000110=IDEMPOTENCY_AND_CONFLICT_HARDENING
20260730000120=QUOTE_AUTHORITY_TIMELINE_PROJECTION_HARDENING
20260730000130=PGCRYPTO_SEARCH_PATH_HARDENING
```

The acceptance run confirmed that `00100`, `00110` and `00120` were already
recorded remotely. It applied `00130` atomically with its migration-history row.

## Runtime defect found and closed

Initial remote acceptance exposed that Supabase provides `pgcrypto.digest` in
the trusted `extensions` schema while both Quote RPCs had a bounded search path
that omitted that schema.

`00130` preserves the existing RPC bodies and grants. It sets the bounded
runtime search path to:

```text
public, extensions, pg_temp
```

for:

- `public.forge_cartera001b_confirm_reviewed_quote(...)`;
- `public.forge_cartera001b_append_quote_lifecycle_event(...)`.

No application-role execution or direct-table authority was broadened.

## Acceptance result

```text
TARGETED_TESTS=70
TARGETED_PASS=70
TARGETED_FAIL=0
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

The transactional harness created two temporary authenticated identities and
proved owner isolation, cross-tenant denial, RPC-only mutation, deterministic
replay, changed-input conflict detection, append-only correction lineage,
minimized Prospect Timeline projection with `QUOTE_AUTHORITY`, and continued
blocking of Application conversion.

The harness ended with `ROLLBACK`; temporary acceptance identities and domain
rows were not retained.

## Execution authority

Remote execution used the existing repository secret `SUPABASE_ACCESS_TOKEN`
and the Supabase Management API from GitHub Actions. No database password,
pooler URL, local ArchForge network path or `psql` dependency was required.

After closure, the workflow was returned to `workflow_dispatch` only. It does
not mutate the remote project automatically on later pushes or PR updates.

## Closure

```text
CARTERA_001B_REPOSITORY_IMPLEMENTATION=COMPLETE
CARTERA_001B_REMOTE_DEPLOYMENT=PASS
CARTERA_001B_REMOTE_ACCEPTANCE=PASS
CARTERA_001C_BLOCKED=NO
CARTERA_001C_NEXT=YES
```
