# Advisor Compensation Product Read Model Materialization 001

Status: Stage 110 repository implementation

## Problem

The productive Commissions reader is connected and owner-scoped, but it can only read append-only rows from `public.advisor_compensation_product_read_models`. When no row exists, the public UI correctly returns:

```text
ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_NOT_MATERIALIZED
```

The Stage 060 period snapshot and six-month history engines already exist. The missing component is a governed server-side projection that reads the canonical compensation ledgers and appends a product read-model revision.

## Authority Boundary

```text
BROWSER_ROLE=READ_ONLY
DIRECT_BROWSER_INSERT=FORBIDDEN
MATERIALIZER_RUNTIME=CONTROLLED_NODE_COMMAND
REMOTE_WRITE=EXPLICIT_TOKEN_ONLY
WRITE_MODEL=APPEND_ONLY_REVISION
OWNER_SCOPE=EXACT_ADVISOR_UUID
IDEMPOTENCY=SNAPSHOT_DIGEST_PLUS_HISTORY_DIGEST
```

No UI module calculates, inserts or updates compensation truth.

## Inputs

The materializer accepts only canonical records:

- `advisor_compensation_event_ledger.payload`
- `advisor_compensation_payout_record_ledger.payload`
- governed forward signals when a future canonical source is connected

Every event, payout record and forward signal is revalidated with its existing contract before projection. A payload whose `advisorReference` differs from the requested owner blocks the materialization.

## Projection

For the selected month and its five preceding months, the materializer:

1. Loads owner-scoped append-only event and payout payloads.
2. Reuses the Stage 060 period snapshot engine.
3. Preserves estimated, earned, adjustment, reversal, paid, real, potential and at-risk separation.
4. Builds a six-month historical series.
5. Produces deterministic snapshot and history digests.
6. Appends the next revision only when those digests do not already exist.

## Source Completeness

The existence of a remote table does not prove that a carrier statement or forward-signal feed is complete.

Default behavior:

```text
PAYOUT_ROWS_PRESENT -> PAYOUT_SOURCE=PARTIAL
PAYOUT_ROWS_ABSENT -> PAYOUT_SOURCE=DISCONNECTED
FORWARD_SIGNAL_SOURCE -> DISCONNECTED
UNKNOWN_PAID -> NULL
UNKNOWN_REAL -> NULL
UNKNOWN_AS_ZERO -> NO
```

A zero paid amount is allowed only when an explicitly governed caller declares the payout source `AVAILABLE` for that period and the source contains no confirmed payout records.

## Remote Command

```bash
node scripts/materialize-advisor-compensation-product-read-model.mjs --validate-only
```

Remote application additionally requires:

```text
ADVISOR_COMPENSATION_READ_MODEL_MATERIALIZATION=MATERIALIZE_ADVISOR_COMPENSATION_PRODUCT_READ_MODEL
SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv
SUPABASE_ACCESS_TOKEN=<management token>
ADVISOR_COMPENSATION_ADVISOR_ID=<exact auth.users UUID>
# or ADVISOR_COMPENSATION_ADVISOR_EMAIL=<exact unique email>
ADVISOR_COMPENSATION_PERIOD_KEY=YYYY-MM
```

Without the exact authorization token, `--apply` fails before any network request.

## Concurrency and Idempotency

The remote insert uses a transaction-scoped advisory lock for `advisor + period`, calculates the next revision under that lock and performs one of two outcomes:

```text
INSERTED
ALREADY_MATERIALIZED
```

Updates and deletes remain forbidden by the existing append-only trigger.

## Out of Scope

- Creating compensation events from policies or premium receipts.
- Guessing official rates.
- Promoting estimated events to earned without the Stage 050 gate.
- Confirming payouts automatically.
- Treating an empty ledger as a complete carrier statement.
- Connecting forecast/forward-signal authority.
- Executing remote materialization without a separate explicit authorization.
