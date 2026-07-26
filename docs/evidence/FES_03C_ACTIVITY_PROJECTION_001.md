# FES 03C Activity Projection Evidence 001

## Acceptance

```text
FES_03C_ACTIVITY_PROJECTION=PASS
PROJECTION_CONTRACT_VERSION=FES-03C.1
PROJECTION_SCHEMA=forge.activity_projection.v1
ITEM_SCHEMA=forge.activity_projection_item.v1
FES_03C_TESTS=20
FES_03C_PASS=20
FES_03C_FAIL=0
REGRESSION_FILES=6
REGRESSION_TESTS=119
REGRESSION_PASS=119
REGRESSION_FAIL=0
```

Activity projects, without owning: what occurred; canonical and visible order;
actor and subject; source, evidence and confirmation; explicit pending state;
append-only corrections; deterministic counts; and exact rebuild against the
canonical source timeline.

A detached Activity JSON is not authoritative. FES 03C does not bind Forge
Alive, persist a parallel Activity database, mutate Supabase, execute actions or
reuse the legacy manual points dashboard as system truth.
