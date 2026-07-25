# Legacy CRMAddLife IndexedDB — Quarantine

## Status

- `STATUS=QUARANTINED_COMPATIBILITY_ONLY`
- `NEW_CODE_IMPORTS_ALLOWED=NO`
- `NFAST_09_IMPORTS_ALLOWED=NO`
- `PRODUCTIVE_EXPANSION_ALLOWED=NO`
- `LEGACY_BEHAVIOR_REMOVAL_PERFORMED=NO`

## Reason

This directory contains the original generic IndexedDB stack:

```text
db.js
storage-engine.js
storage-validator.js
storage-queue.js
```

It uses the legacy `ADDLIFE_CRM_ENTERPRISE` database and generic stores such
as `cartera`, `prospeccion`, and `sync_queue`.

It does not satisfy the NFAST-09 offline-first multi-device requirements:

- advisor partitioning;
- minimized due-action records;
- deterministic mutation identifiers;
- durable acknowledged outbox semantics;
- incremental synchronization cursors;
- multi-device acknowledgement;
- lifecycle conflict handling.

## Compatibility boundary

Existing legacy screens may continue importing this stack only through the
explicit quarantine path while they await migration.

No new module may import this directory.

NFAST-09 offline modules must use the dedicated governed implementation
under:

```text
advisor-os/offline/
```

## Removal boundary

Physical deletion of this compatibility stack requires a separate migration
that replaces every importer and validates the affected legacy routes.
