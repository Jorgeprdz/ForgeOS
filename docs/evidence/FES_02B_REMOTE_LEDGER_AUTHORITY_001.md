# FES 02B Remote Ledger Authority Evidence 001

## Status

- `STATUS=REMOTE_DEPLOYED_ACCEPTED_ZERO_RESIDUE`
- `PHASE=FES_02_ACTIVITY_LEDGER_PERSISTENCE`
- `STAGE=FES_02B_REMOTE_LEDGER_AUTHORITY`
- `SOURCE_COMMIT=0e5063b27d555d14a51b56d5fe1aafac70afb73e`
- `SUPABASE_PROJECT_REF=rmlxigxysujsuwzgoimv`
- `MIGRATION_VERSION=20260726000100`
- `DEPLOYMENT_MODE=ALREADY_APPLIED_RECOVERY`
- `MAIN_MUTATION=NO`

## Accepted remote authority

The controlled deployment applied or confirmed:

```text
supabase/migrations/20260726000100_fes02_activity_event_ledger.sql
public.activity_event_ledger
public.activity_event_evidence_references
public.activity_event_mutations
public.activity_event_conflicts
public.forge_fes02_append_activity_event(jsonb)
public.forge_fes02_pull_activity_events(text, integer)
```

## Remote acceptance

A transaction created two temporary authenticated identities and proved:

- tenant identity derives from `auth.uid()`;
- authenticated append and incremental pull operate through RPC only;
- deterministic replay returns the original result;
- another tenant receives no ledger changes;
- tenant injection is rejected;
- event-id digest disagreement creates conflict review;
- corrections require an existing same-tenant original event;
- raw contact data in evidence metadata is rejected;
- ledger, evidence and mutation history reject update/delete;
- anonymous RPC execution is denied;
- direct table access is denied.

The transaction deliberately raised:

```text
FES02_REMOTE_ACCEPTANCE_PASS
```

That exception rolled back every temporary user and activity row.

## Independent residue verification

```text
TEMP_AUTH_USERS=0
TEMP_LEDGER_ROWS=0
TEMP_EVIDENCE_ROWS=0
TEMP_MUTATIONS=0
TEMP_CONFLICTS=0
```

The verification also confirmed forced RLS, RPC grants, migration history and
continued presence of the NFAST due-action authority.

## Boundary

This stage did not bind IndexedDB or the sync service to productive Forge Alive.
It did not mutate providers, Pipeline, Mi Día, Calendar, WhatsApp, Nash or
`main`.

## Next

- `NEXT=FES_02C_LEDGER_GATEWAY_SYNC_ACCEPTANCE`
