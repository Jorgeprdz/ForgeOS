# Home Live Dashboard — Acceptance

## Reported production defects

- The greeting was hard-coded as `Buenos días, Jorge`.
- The Google account identity did not own the Home greeting/profile.
- `Mi día · inteligencia comercial activa` claimed a connection without exposing its actual source state.
- `Lariza`, `Octavio`, `María` and `72% / 65% / 40%` were static mock content.
- The desktop grid separated the primary surfaces with a large unusable void.

## Accepted authority composition

| Surface | Authority |
| --- | --- |
| Greeting/name/avatar | Authenticated Google/Supabase session user metadata |
| Mi Día | Existing Productive Smart Widget Home: Activity, monthly policy goal, confirmed policy facts and Cartera 050 radar |
| Mis oportunidades | Productive Pipeline records plus persisted Prospect Timeline |
| Opportunity ordering | Deterministic operational priority: overdue/upcoming commitments, stage and last verified activity |

No probability or sales-likelihood score is produced. The Home does not invent a percentage when no accepted scoring authority exists.

## Layout contract

Desktop:

```text
Hero / authenticated identity                          12 columns
Mi Día / productive action stack                      8 columns
Mis oportunidades / Pipeline + Timeline               4 columns
```

Tablet and mobile:

```text
Hero
Mi Día
Mis oportunidades
```

Static `plan-card`, `next-card`, sample metrics and sample opportunities are retired. When productive sources fail, the Home renders `SOURCE_UNAVAILABLE`, `SESSION_REQUIRED`, `EMPTY` or a partial connection label.

## Safety boundaries

```text
DIRECT_DATABASE_WRITE=0
DIRECT_RPC=0
SECOND_PERSON_STORE=0
RANDOM_SCORE=0
MOCK_OPPORTUNITY_PERCENTAGE=0
AUTOMATIC_CONTACT=0
AUTOMATIC_STAGE_MUTATION=0
```

## Browser acceptance

Profiles:

- 390 × 844
- 1100 × 800
- 1600 × 1000

Required:

- dynamic Mexico City daypart;
- first name and avatar from authenticated Google metadata;
- no sample names or percentages;
- real Pipeline/Timeline rows ordered deterministically;
- static plan and next-action mock cards hidden;
- desktop surfaces aligned in one primary row;
- no horizontal overflow.
