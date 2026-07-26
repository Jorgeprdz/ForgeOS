# FES 03F Mi Día Projection Evidence 001

## Acceptance

```text
FES_03F_MI_DIA_PROJECTION=PASS
PROJECTION_CONTRACT_VERSION=FES-03F.1
PROJECTION_SCHEMA=forge.mi_dia_projection.v1
WORK_ITEM_SCHEMA=forge.mi_dia_work_item.v1
FES_03F_TESTS=28
FES_03F_PASS=28
FES_03F_FAIL=0
REGRESSION_FILES=9
REGRESSION_TESTS=186
REGRESSION_PASS=186
REGRESSION_FAIL=0
```

## Accepted operating list

Mi Día projects deterministic work from canonical Pipeline cards:

- resolve reviewable conflict;
- confirm a scheduled or rescheduled appointment outcome;
- perform an open due follow-up;
- review pending or reported evidence;
- add optional context after a held appointment when no later context exists.

Conflict blocks all lower-priority work for the same prospect. Required and
optional work remain distinguishable.

## Unsupported first-vertical intelligence

Goal probability, expected production, monthly gap, rescue probability, close
probability, recommended product, Alfred-generated recommendation and
wall-clock neglect age remain explicit unsupported signals.

## Boundaries

Mi Día does not execute work, generate Alfred copy, infer overdue state from
the current clock, mutate productive UI, write Supabase or own source truth.
