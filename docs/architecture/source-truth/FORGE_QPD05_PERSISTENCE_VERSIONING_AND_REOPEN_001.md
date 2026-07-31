# Forge QPD-05 Persistence, Versioning and Reopen 001

Status: `CANONICAL / IMPLEMENTED / REMOTE_DEPLOYMENT_PENDING`

## Authority

The durable commercial Quote and Quote Version identity belongs to Cartera 001B.
QPD-05 owns only printable-document versioning derived from that identity.

```text
QUOTE_IDENTITY_OWNER=CARTERA_001B_QUOTE_LIFECYCLE
QUOTE_VERSION_IDENTITY_OWNER=CARTERA_001B_QUOTE_LIFECYCLE
PRINTABLE_DOCUMENT_VERSION_OWNER=ADVISOR_OS_QUOTE_PRINTABLE_DOCUMENT
FINAL_AUTHORITY=HUMAN
```

QPD-05 must not create a parallel Quote table, recalculate a quote, mutate Product Intelligence or replace the accepted Quote source.

## Canonical chain

```text
Accepted Quote Review Snapshot
→ QPD-01 Printable Read Model
→ QPD-04 Product Profile
→ QPD-02 Printable Document
→ QPD-03 Real PDF
→ QPD-05 Durable Printable Version Record
→ local or governed remote append
→ exact revision reopen
```

## Durable record

The printable version record preserves the minimum state required to reproduce and verify a document:

- canonical Quote and Quote Version references;
- canonical Quote snapshot digest;
- source revision;
- product profile;
- page format;
- immutable read-model snapshot;
- exact render timestamp;
- render manifest and PDF binary hash;
- append-only record identity and digest.

The record excludes generated HTML, PDF bytes and all binary-shaped payloads.

## Version semantics

A printable document is never updated in place.
A new render becomes a new `printableVersionReference`.
Idempotent replay of identical content returns the existing version.
The same version reference with different content is a conflict and fails closed.

## Reopen semantics

Reopening does not trust the current screen state.
It restores the stored read-model snapshot, recomposes the product-specific document and regenerates the PDF using the original render timestamp.
The regenerated output must match the stored filename, PDF contract, page count, byte length and binary revision hash.

## Local-first repository

The local repository supports browser Storage-compatible persistence and deterministic in-memory testing.
It is append-only and provides:

- append;
- get by printable version;
- list by Quote;
- latest by Quote;
- exact reopen.

Update and delete are forbidden.

## Remote repository

The remote repository is an authenticated Supabase gateway.
Direct client-side table inserts, updates and deletes are not authority-bearing.
The only write path is the governed append RPC.
The history view executes with caller RLS.

## Dependency and deployment order

```text
1. Deploy Cartera 001B Quote lifecycle identity.
2. Verify canonical Quote and Quote Version remote acceptance.
3. Apply QPD-05 migration.
4. Run owner isolation, append, replay and reopen remote acceptance.
5. Bind the productive quote route in QPD-06.
```

Applying QPD-05 before Cartera 001B fails with `QPD05_CARTERA001B_REQUIRED`.

## Forbidden effects

```text
RECALCULATION_ALLOWED=false
QUOTE_MUTATION_ALLOWED=false
PRODUCT_INTELLIGENCE_MUTATION_ALLOWED=false
RAW_PDF_PERSISTED=false
HTML_PERSISTED=false
BINARY_PERSISTED=false
AUTOMATIC_DOWNLOAD_ALLOWED=false
AUTOMATIC_SEND_ALLOWED=false
CRM_MUTATION_ALLOWED=false
TASK_CREATION_ALLOWED=false
CALENDAR_CREATION_ALLOWED=false
POLICY_MUTATION_ALLOWED=false
```

## Current closure

```text
IMPLEMENTATION=PASS
LOCAL_FIRST_CONTRACT=PASS
VERSIONING_CONTRACT=PASS
EXACT_REOPEN_CONTRACT=PASS
REMOTE_GATEWAY_CONTRACT=PASS
MIGRATION_SECURITY_CONTRACT=PASS
REMOTE_DEPLOYMENT=NOT_RUN
CROSS_DEVICE_REMOTE_ACCEPTANCE=NOT_RUN
PRODUCTIVE_ROUTE_BINDING=NEXT_QPD06
```
