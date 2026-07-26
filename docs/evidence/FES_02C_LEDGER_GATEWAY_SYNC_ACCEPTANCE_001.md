# FES 02C Ledger Gateway Sync Acceptance Evidence 001

## Status

- `STATUS=CONTROLLED_GATEWAY_AND_BROWSER_ACCEPTANCE_PASS`
- `PHASE=FES_02_ACTIVITY_LEDGER_PERSISTENCE`
- `STAGE=FES_02C_LEDGER_GATEWAY_SYNC_ACCEPTANCE`
- `SOURCE_COMMIT=a116f7a7891a743e2b627ce3f0d1155ae5073e9a`
- `REMOTE_MIGRATION_VERSION=20260726000100`
- `GATEWAY_VERSION=FES-02C.1`
- `BROWSER_RUNTIME_VERSION=FES-02C.1`
- `PRODUCTIVE_UI_MUTATION=NO`
- `SUPABASE_REMOTE_MUTATION=NO`
- `MAIN_MUTATION=NO`

## Accepted integration

The authenticated gateway exposes only:

```text
pushMutation → public.forge_fes02_append_activity_event(jsonb)
pullChanges → public.forge_fes02_pull_activity_events(text, integer)
```

It derives tenant authority from the authenticated user, validates every local
mutation and remote receipt against the FES 02A contract, denies cross-tenant
responses and converts transport failures into explicit retry-safe errors.

## Controlled Forge Alive browser harness

The browser acceptance served the real tracked Forge Alive entry at:

```text
docs/static-preview/forge-alive/?nav=pipeline
```

The harness used the real Forge Alive public configuration and authenticated
bootstrap boundary, while replacing remote network effects with a controlled
RPC authority. This is a technical integration gate, not final productive
end-to-end acceptance.

Chromium proved:

- the real Pipeline route and selector boundary loaded;
- canonical event and outbox committed atomically to IndexedDB;
- push was acknowledged and stored as an immutable receipt;
- a second local replica pulled the event incrementally;
- an offline push remained in `RETRY`;
- reconnect acknowledged the same mutation without loss;
- IndexedDB survived browser reload;
- temporary browser databases were removed;
- no Forge Alive UI element was added or changed by the runtime.

## Remote authority continuity

FES 02B remains the independent acceptance authority for real Supabase RLS,
RPC, tenant isolation, append-only enforcement, correction integrity and zero
remote residue. FES 02C performed read-only verification and no remote schema or
data mutation.

## Evidence files

- `docs/evidence/fes-02c-activity-ledger-supabase-gateway-test.tap`
- `docs/evidence/fes-02c-activity-ledger-browser-runtime-test.tap`
- `docs/evidence/fes-02c-forge-alive-ledger-sync-browser-test.tap`
- `docs/evidence/fes-02c-forge-alive-ledger-sync-browser-report.json`

## Next

- `NEXT=FES_03_TIMELINE_AND_PROJECTION_RUNTIME`
