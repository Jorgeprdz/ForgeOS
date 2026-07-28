# NASH Fast Track — NFAST-09 Legacy IndexedDB Quarantine Closure

## Status

- `STATUS=COMPLETE_AND_PUSHED`
- `QUARANTINE_ID=NFAST-09-LEGACY-INDEXEDDB-QUARANTINE`
- `LEGACY_STACK_STATUS=QUARANTINED_COMPATIBILITY_ONLY`
- `LEGACY_BEHAVIOR_REMOVAL=NO`
- `NEW_CODE_IMPORTS_ALLOWED=NO`
- `NFAST_09_IMPORTS_ALLOWED=NO`
- `SUPABASE_MUTATION=NO`
- `MAIN_MERGE=NO`
- `NFAST_10_AUTHORIZED=NO`

## Quarantined files

```text
legacy/quarantine/crmaddlife-indexeddb/db.js
legacy/quarantine/crmaddlife-indexeddb/storage-engine.js
legacy/quarantine/crmaddlife-indexeddb/storage-validator.js
legacy/quarantine/crmaddlife-indexeddb/storage-queue.js
```

## Decision

The generic CRMAddLife IndexedDB stack remains available only as a
compatibility dependency for existing legacy screens.

It is physically separated from the repository root and must not be used
by NFAST-09, Advisor OS offline-first modules, NASH, platform code, or new
features.

Existing importers were rewritten to use the explicit quarantine path so
the current legacy routes are not broken by this isolation step.

## Replacement authority

The governed NFAST-09 offline-first implementation belongs under:

```text
advisor-os/offline/
```

It must use its own advisor-partitioned storage, durable outbox,
idempotency, synchronization cursor, and conflict rules.

## Future removal

Deleting the quarantined compatibility stack requires migration of every
allowed legacy importer and dedicated route validation.

- `NEXT_STEP=NFAST-09_STAGE_3A_OFFLINE_CORE_IMPLEMENTATION`
