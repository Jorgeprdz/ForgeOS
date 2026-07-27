# ACT-09 — Activity Remote Read Acceptance

```text
ACT_09_ACTIVITY_REMOTE_READ_ACCEPTANCE=REMOTE_ACCEPTED
SOURCE_COMMIT=7703d88dd7dc0933b04f53df4b9b429cf70c9821
ACTIVITY_BRANCH=feature/activity-domain-runtime-foundation
RUNTIME_SCHEMA=activity-read-runtime.v1
REMOTE_AUTH_MODE=PASSWORD_JWT
REMOTE_READ_PATH=RUNTIME_TO_REPOSITORY_TO_RPC
TEMP_ACTIVITY_ROWS=ZERO
TEMP_AUTH_IDENTITY=ZERO_RESIDUE
REMOTE_SCHEMA_MUTATION=NO
PRODUCTIVE_UI_MUTATION=NO
MUI_TOKEN_AUTHORITY=NO
```

## Objective

Exercise the deployed Activity read path with a real authenticated Supabase JWT:

```text
temporary confirmed auth user
  -> password session
  -> activity-read-runtime.v1
  -> SupabaseActivityRepository
  -> activity_records_list_v1
  -> empty governed feed and period aggregation
```

The acceptance intentionally creates no Activity rows. The Activity table is
append-only, so remote read acceptance must not manufacture permanent test
history.

## Assertions

- linked project and deployed Activity migration are verified;
- a temporary confirmed user obtains a real password JWT;
- the runtime binds organization and advisor authority;
- feed and period aggregation use the deployed list RPC;
- both reads return valid empty governed projections;
- anonymous RPC access is denied;
- organization and advisor overrides are rejected before RPC;
- no append RPC is called;
- no Activity row is created;
- temporary auth user and identity are removed;
- schema, FES, MUI, main and productive UI remain unchanged.

## Secrets

API keys are resolved into a private temporary directory and are never written
to repository evidence, logs or Android shared storage.

## Next

`ACT-10_ACTIVITY_FOUNDATION_FREEZE`
