# Forge CRS 04 — Activity/FES Person Convergence 001

## Status

```text
PHASE=CRS_04_ACTIVITY_FES_PERSON_CONVERGENCE
DELIVERY_MODE=CRS_04A_PLUS_04B_PLUS_04C_PLUS_04D_SINGLE_PASS
RECORDED=2026-08-01
SOURCE_MAIN_HEAD=5299e5a0d51a13e684a62ba03bbc020e019c4cb0
RUNTIME_MUTATION=READ_COMPOSITION_ONLY
PRODUCT_UI_MUTATION=NO
SCHEMA_MUTATION=NO
SUPABASE_MUTATION=NO
DATABASE_MIGRATION=NO
```

## CRS 04A — Existing authority discovery

The productive Activity foundation already exists and remains authoritative:

```text
CANONICAL_ACTIVITY_EVENT_AUTHORITY=FES_01
ACTIVITY_LEDGER_AUTHORITY=FES_02
ACTIVITY_PROJECTION_FOUNDATION=FES_03
COMMERCIAL_PERSON_AUTHORITY=CARTERA_010B
SOURCE_IDENTITY_LINK_AUTHORITY=CARTERA_010B
COMMON_DOMAIN_LINK_AUTHORITY=CRS_02
```

FES 01 owns immutable canonical event truth, explicit source and evidence,
confirmation state, privacy, correlation and append-only correction semantics.

FES 02 owns immutable ledger records, local-first append, outbox, authenticated
remote receipts, replay, conflict preservation and incremental synchronization.

FES 03 owns read projections for Activity, Prospect detail, Pipeline cards and
Mi Día. CRS 04 does not replace any of those projections and does not create a
second Timeline.

CRS 02 already exposes `fromCanonicalActivityEvent`. The remaining gap was a
governed read snapshot that verifies the FES ledger record, Cartera identity
lineage and CRS 02 person-domain link together.

## CRS 04B — Convergence contract

```text
CONTRACT=platform/shared-commercial-model/crs-04-activity-person-convergence-contract.js
CONTRACT_TYPE=FORGE_ACTIVITY_PERSON_CONVERGENCE
CONTRACT_VERSION=CRS-04-ACTIVITY-PERSON-001.1
SCHEMA_VERSION=forge.activity_person_convergence.v1
```

The contract composes, without copying authority:

```text
FES_02_LEDGER_RECORD
+ FES_01_CANONICAL_EVENT
+ CARTERA_010B_IDENTITY_DECISION_LINEAGE
+ CRS_02_ACTIVITY_DOMAIN_LINK_OR_MISSING_LINK
+ OPTIONAL_FES_REMOTE_RECEIPT
```

The output locks:

```text
LEDGER_AUTHORITY=FES_ACTIVITY_EVENT_LEDGER
TIMELINE_AUTHORITY=FES_CANONICAL_ACTIVITY_TIMELINE
```

Ledger state is explicit:

```text
LOCAL_APPENDED
REMOTE_ACKNOWLEDGED
REMOTE_IDEMPOTENT_REPLAY
```

## Source identity policy

For a canonical event whose subject is `PROSPECT`, the source identity is the
event subject itself and must match exactly.

For `APPOINTMENT`, `ACTIVITY` and `DUE_ACTION`, the canonical event does not
invent a Prospect relationship. The caller may provide an explicit
`sourceIdentityReference`. Without it, the snapshot remains:

```text
IDENTITY_STATE=UNRESOLVED
IDENTITY_REASON=SOURCE_IDENTITY_UNAVAILABLE
```

With a source identity but without a governed Cartera link:

```text
IDENTITY_STATE=UNRESOLVED
IDENTITY_REASON=PERSON_UNRESOLVED
DOMAIN_LINK=EXPLICIT_CRS_02_MISSING_LINK
```

Multiple active identity links, cross-advisor people, inactive people and
decision-lineage mismatches fail closed.

## Correlation policy

The legacy `canonical_event.correlation_id` remains source-domain correlation.
It is preserved byte-for-byte in the convergence snapshot and is never
reinterpreted automatically as a commercial movement.

```text
LEGACY_FES_CORRELATION_REINTERPRETED_AS_COMMERCIAL_MOVEMENT=NO
```

A commercial movement exists only when:

1. CommercialPerson is confirmed;
2. the caller explicitly supplies a movement reference;
3. CRS 02 derives `movement:<digest>` from person and movement references.

The canonical event remains unchanged.

## Correction policy

FES corrections remain new canonical events with `correction_of`. CRS 04 can
compose a correction against an accepted original snapshot and set the CRS 02
domain-link `correctionOf` to the original link reference.

```text
EVENT_CORRECTION=APPEND_ONLY
DOMAIN_LINK_CORRECTION=APPEND_ONLY
ORIGINAL_EVENT_REWRITE=FORBIDDEN
ORIGINAL_DOMAIN_LINK_REWRITE=FORBIDDEN
```

## CRS 04C — Productive read service

```text
SERVICE=platform/event-evidence/crs-04-activity-person-convergence-service.js
```

The service reads under the authenticated advisor and RLS:

```text
commercial_source_identity_links
commercial_people
identity_resolution_decisions
```

It consumes the existing FES ledger runtime through `listEntries` and
`getReceipt`; it never appends, updates, deletes or synchronizes the ledger.

Operations:

```text
convergeLedgerRecord
getConvergedActivityEvent
listConvergedActivityEvents
createCommercialMovementView
convergeCorrection
```

## CRS 04D — Acceptance

Acceptance requires:

```text
TARGETED_CONTRACT_AND_SERVICE_TESTS=26_PASS_REQUIRED
FES_01_CANONICAL_EVENT_REGRESSION=PASS_REQUIRED
FES_02_LEDGER_REGRESSION=PASS_REQUIRED
FES_03_ACTIVITY_PROJECTION_REGRESSION=PASS_REQUIRED
CRS_02_DOMAIN_LINK_REGRESSION=PASS_REQUIRED
CRS_03_PIPELINE_PERSON_REGRESSION=PASS_REQUIRED
CARTERA_010B_IDENTITY_REGRESSION=PASS_REQUIRED
REP_17_REGRESSION=PASS_REQUIRED
BOUNDED_PATHS=PASS_REQUIRED
```

## Boundaries

```text
NEW_ACTIVITY_EVENT_CONTRACT=NO
NEW_ACTIVITY_LEDGER=NO
NEW_PERSON_TIMELINE_LEDGER=NO
NEW_COMMERCIAL_PERSON_TABLE=NO
NEW_IDENTITY_ENGINE=NO
NEW_SOURCE_IDENTITY_LINK_TABLE=NO

LEDGER_MUTATION=NO
IDENTITY_MUTATION=NO
TIMELINE_MUTATION=NO
TASK_MUTATION=NO
PROVIDER_MUTATION=NO

AUTOMATIC_IDENTITY_RESOLUTION=NO
AUTOMATIC_TIMELINE_MUTATION=NO
AUTOMATIC_TASK_CREATION=NO
AUTOMATIC_CONTACT=NO
AUTOMATIC_CALENDAR_MUTATION=NO
AUTOMATIC_MESSAGE_SEND=NO
AUTOMATIC_BUSINESS_ACTION=NO
```

```text
NEXT_AFTER_CLOSURE=CRS_05ABCD_QUOTE_PERSON_CONVERGENCE
```
