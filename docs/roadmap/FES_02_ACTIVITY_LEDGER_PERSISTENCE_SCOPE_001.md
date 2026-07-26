# FES 02 Activity Ledger Persistence Scope 001

## Status

- `STATUS=ACTIVE_STAGED_IMPLEMENTATION`
- `PHASE=FES_02_ACTIVITY_LEDGER_PERSISTENCE`
- `SOURCE_COMMIT=7463fcd2909189bf89ae9d1b3593adc48e917b08`
- `CURRENT_STAGE=FES_02A_ACTIVITY_LEDGER_LOCAL_FOUNDATION`
- `NEXT_STAGE=FES_02B_REMOTE_LEDGER_AUTHORITY`
- `PRODUCTIVE_UI_MUTATION=NO`
- `MAIN_MUTATION=NO`

## Objective

Persist the canonical `forge.activity_event.v1` envelope as the single append-only
event authority, with evidence references, deterministic idempotency, tenant
partitioning, local-first durability, explicit outbox synchronization and
human-review conflict routing.

## Locked stage sequence

```text
FES_02A_ACTIVITY_LEDGER_LOCAL_FOUNDATION
→ FES_02B_REMOTE_LEDGER_AUTHORITY
→ FES_02C_LEDGER_SYNC_AND_BROWSER_ACCEPTANCE
→ FES_02_ACTIVITY_LEDGER_PERSISTENCE_CLOSED
```

## FES 02A authorized scope

- ledger record and evidence-reference contract;
- append-only local store with memory and IndexedDB drivers;
- atomic event + outbox commit;
- remote receipts and incremental cursor metadata;
- deterministic retry and conflict-review records;
- one-shot push-before-pull synchronization service;
- PostgreSQL migration candidate for ledger, evidence, mutation and conflict
  authority;
- static RLS/RPC/append-only migration validation;
- dedicated tests and regression tests;
- source-truth, Build Tree and Roadmap synchronization.

## FES 02A explicit boundary

```text
SUPABASE_REMOTE_DEPLOYMENT=NO
REMOTE_MIGRATION_APPLICATION=NO
PRODUCTIVE_BROWSER_BINDING=NO
BACKGROUND_SYNC=NO
PRODUCTIVE_UI_MUTATION=NO
CALENDAR_PROVIDER_MUTATION=NO
WHATSAPP_SEND=NO
NASH_EXECUTION=NO
PUSH_NOTIFICATION_RUNTIME=NO
MAIN_MUTATION=NO
```

## FES 02B completion target

FES 02B will apply exactly the reviewed migration candidate to the configured
Supabase project and prove:

- authenticated RPC-only append and incremental pull;
- direct table denial;
- FORCE RLS and tenant isolation;
- deterministic mutation replay;
- append-only update/delete denial;
- correction same-tenant foreign-key enforcement;
- conflict preservation;
- temporary acceptance data rollback;
- no mutation to legacy due-action authority;
- no mutation to `main`.

## FES 02C completion target

FES 02C will bind the local store and synchronization gateway in a controlled
browser harness against the real Forge Alive deployment boundary. It will not
change productive UI until the acceptance harness passes.
