# QPD-05 Persistence, Versioning and Reopen

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

Accepted implementation commit before certification: `77dd027d18869524587edc9ad966c55df17f98c3`

GitHub Actions run: `30596326209`

## Runtime

- `advisor-os/quotes/printable/quote-printable-version-repository.js`
- `advisor-os/quotes/printable/quote-printable-supabase-repository.js`

## Persistence schema

- `supabase/migrations/20260730000200_qpd05_printable_quote_versions.sql`

The migration is repository-only and has not been deployed remotely.
It requires the canonical Cartera 001B Quote and Quote Version identity before it can run.
It does not create a second Quote identity or duplicate the Cartera lifecycle tables.

## Durable version contract

Each version stores:

- canonical Quote reference;
- canonical Quote Version reference;
- prospect and product references;
- source revision and Quote snapshot digest;
- product profile and page format;
- immutable printable read-model snapshot;
- render timestamp used by the original PDF;
- filename, page count, byte length and binary revision hash;
- append-only persistence identity and record digest.

It does not store:

- HTML output;
- PDF bytes;
- Blob, ArrayBuffer, Base64 or binary payloads;
- raw source PDF;
- automatic send or download instructions.

## Local-first behavior

- memory repository for deterministic contract testing;
- browser Storage-compatible repository;
- reopening after a new repository instance;
- append-only version history;
- idempotent replay;
- latest-version lookup without overwriting prior versions;
- update and delete denied.

## Exact reopen

Reopen performs:

1. persisted-record digest validation;
2. immutable read-model restoration;
3. product-specific HTML recomposition;
4. real PDF regeneration;
5. filename, PDF contract, page count, byte length and binary hash comparison.

A mismatch fails closed with `REOPEN_RENDER_MISMATCH`.
The exact original render timestamp is preserved separately from the canonical UTC persistence timestamp so the regenerated PDF remains byte-identical.

## Remote gateway

The Supabase adapter:

- authenticates the advisor;
- writes only through `forge_qpd05_append_printable_quote_version`;
- reads through `quote_printable_document_history`;
- supports append, get, list and latest operations;
- maps remote contract errors to safe user-facing errors;
- denies direct insert, update and delete paths.

## Database boundary

The migration:

- requires `quote_lifecycle_quotes` and `quote_lifecycle_versions`;
- uses owner-scoped foreign keys;
- forces RLS;
- permits owner-only reads;
- exposes one authenticated append RPC;
- rejects payload identity that does not match the canonical Quote Version;
- rejects raw PDF, HTML and binary-shaped fields;
- uses an append-only update/delete trigger;
- provides a security-invoker history view.

## Acceptance

```text
NODE_SYNTAX=PASS
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
QPD03_CONTRACT=PASS_14_OF_14
QPD04_CONTRACT=PASS_15_OF_15
QPD05_REPOSITORY_CONTRACT=PASS_15_OF_15
QPD05_MIGRATION_SECURITY=PASS_10_OF_10
DIFF_INTEGRITY=PASS
WORKFLOW_RUN=30596326209
WORKFLOW_CONCLUSION=SUCCESS
```

## Honest completion boundary

```text
LOCAL_FIRST_PERSISTENCE=PASS
APPEND_ONLY_VERSIONING=PASS
EXACT_PDF_REGENERATION=PASS
SUPABASE_GATEWAY_CONTRACT=PASS
MIGRATION_STATIC_SECURITY=PASS
REMOTE_MIGRATION_DEPLOYED=false
REMOTE_DATABASE_MUTATED=false
CROSS_DEVICE_REMOTE_ACCEPTANCE=NOT_RUN
CROSS_DEVICE_REMOTE_BLOCKER=CARTERA_001B_REMOTE_IDENTITY_REQUIRED
PRODUCTIVE_QUOTE_ROUTE_BOUND=false
MAIN_MUTATED=false
```

## Next

`QPD06_PRODUCTIVE_ROUTE_AND_BROWSER_ACCEPTANCE`
