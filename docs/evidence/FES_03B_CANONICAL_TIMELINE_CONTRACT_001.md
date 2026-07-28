# FES 03B Canonical Timeline Contract Evidence 001

## Acceptance

```text
FES_03B_CANONICAL_TIMELINE_CONTRACT=PASS
CONTRACT_VERSION=FES-03B.1
TIMELINE_SCHEMA=forge.activity_timeline.v1
ENTRY_SCHEMA=forge.activity_timeline_entry.v1
FES_03B_TESTS=22
FES_03B_PASS=22
FES_03B_FAIL=0
REGRESSION_FILES=5
REGRESSION_TESTS=97
REGRESSION_PASS=97
REGRESSION_FAIL=0
```

## Accepted invariants

- source records must be canonical FES 02 ledger records;
- all records belong to one tenant and one correlation;
- one and only one root `TIMELINE_INITIALIZED` event exists;
- ordering is occurrence, recording, append and event identity;
- input order cannot change output;
- exact replay is deduplicated;
- incompatible duplicate records are rejected;
- corrections remain append-only entries;
- missing correction targets and correction cycles are rejected;
- correction lineage, depth and reverse references are deterministic;
- the timeline can be rebuilt exactly from its ledger records;
- unknown projection state is not accepted by the contract;
- output is deeply immutable.

## Boundaries

No read model, productive runtime, Forge Alive UI, database migration or remote
Supabase mutation is included in FES 03B.
