# FES 03E Pipeline Card Projection Evidence 001

## Acceptance

```text
FES_03E_PIPELINE_CARD_PROJECTION=PASS
PROJECTION_CONTRACT_VERSION=FES-03E.1
PROJECTION_SCHEMA=forge.pipeline_card_projection.v1
FES_03E_TESTS=24
FES_03E_PASS=24
FES_03E_FAIL=0
REGRESSION_FILES=8
REGRESSION_TESTS=162
REGRESSION_PASS=162
REGRESSION_FAIL=0
```

## Accepted compact state

The Pipeline card projects only:

- current canonical milestone stage;
- latest Activity item;
- latest appointment state;
- explicit missing appointment outcome;
- earliest open due follow-up;
- reviewable conflicts;
- deterministic attention priority.

The projection does not infer overdue state from wall-clock time. It does not
invent name, phone, income, product interest, probability to close,
recommendation or legacy Pipeline status.

## Boundaries

No productive UI binding, Supabase mutation, migration, external action,
message execution or detached Pipeline truth is introduced.
