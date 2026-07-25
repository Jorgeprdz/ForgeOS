# Forge Experience Engine Codename Governance 001

## Status

- `DOCUMENT_ID=FORGE_EXPERIENCE_ENGINE_CODENAME_GOVERNANCE_001`
- `STATUS=LOCKED_SOURCE_TRUTH`
- `DECISION_TYPE=CODENAME_GOVERNANCE`
- `ADR_CREATED=NO`
- `SOURCE_NUCLEAR_REVIEW=ROCKY_GREEN_OWL_CANDY_CRUSH_NUCLEAR_REVIEW`
- `SOURCE_NUCLEAR_REVIEW_RESULT=PASS`
- `FINAL_AUTHORITY=HUMAN`
- `ARTICLE_0=ACTIVE`

## Purpose

Forge may preserve memorable internal codenames for engines, implementation
policies and experience layers without turning those names into independent
sources of truth or constitutional authorities.

The codename tells the implementation story.

The neutral contract, existing ADR or source domain owns the architectural
decision.

Canonical rule:

> Los nombres cuentan la historia del producto. Los contratos neutrales
> protegen la arquitectura.

## Nuclear review disposition

The nuclear review produced the following results:

```text
ROCKY_SCORE=3/16
ROCKY_VERDICT=DOES_NOT_SURVIVE_YET_USE_UX_VOICE_SPEC

GREEN_OWL_SCORE=9/16
GREEN_OWL_VERDICT=CONDITIONAL_SURVIVOR_REQUIRES_SCOPE_REPAIR

CANDY_CRUSH_SCORE=6/16
CANDY_CRUSH_VERDICT=MERGE_INTO_ADR_016_NO_STANDALONE_ADR
```

These results do not delete the codenames.

They define the authority each codename is allowed to have.

## Core decision

A codename may identify:

- an internal engine;
- a deterministic policy;
- a read model;
- an experience adapter;
- a voice specification;
- a presentation layer;
- an implementation package;
- a test fixture or implementation namespace.

A codename does not automatically become:

- an ADR;
- a domain;
- a source of truth;
- a metric owner;
- a recommendation authority;
- an execution authority;
- a manager authority;
- a human evaluation system.

A codename may only receive ADR authority after a future nuclear review proves
that it owns a distinct architectural decision not already governed elsewhere.

## Neutral architecture and codename mapping

| Codename | Neutral architectural identity | Current authority |
|---|---|---|
| `GREEN_OWL` | Daily Commercial Momentum Loop | Conditional source-truth candidate; scope repair required before ADR review |
| `CANDY_CRUSH` | Adaptive Challenge and Experience Complexity Policy | Subordinate implementation policy under ADR-016 |
| `ROCKY` | Motivational Recovery Intervention / UX Voice Safety Layer | Codename and UX specification only; no ADR authority |

## Green Owl

### Preserved product meaning

Green Owl protects visible daily commercial momentum.

It may consume official, source-bound inputs such as:

- confirmed activity;
- official activity-point snapshots;
- official daily target;
- current period and time remaining;
- streak state;
- task completion evidence;
- advisor-confirmed corrections;
- Mick behavior signals with source, freshness and limits.

It may produce:

- current momentum state;
- streak status;
- streak-risk indication;
- activity gap explanation;
- one control-oriented challenge candidate;
- reason and expected impact;
- daily confirmation prompt;
- challenge completion state;
- challenge suppression state.

### Scope repair required

Green Owl does not own:

- official point values;
- productivity truth;
- business-planning truth;
- NBA priority;
- Alfred priority;
- compensation truth;
- manager conclusions;
- calendar truth;
- meeting-memory truth;
- raw audio;
- psychological interpretation;
- human ranking;
- punishment or enforcement.

Productivity or the official activity metric owner calculates points.

Mick may describe cadence, consistency, friction and follow-through.

Green Owl consumes those bounded outputs to create an advisor-facing momentum
loop.

### Valid challenge rule

A Green Owl challenge must be:

- based on current evidence;
- mathematically possible;
- time-aware;
- expressed through actions the advisor controls;
- accompanied by the reason and expected impact;
- optional and suppressible;
- free from shame, coercion and hidden steering.

Valid:

> Te faltan ocho puntos. Un bloque de cuatro llamadas puede generar cuatro
> puntos directos y, si dos se convierten en citas, cerrar la brecha del día.

The conversion result remains a scenario, not a guarantee.

Invalid:

> Consigue dos citas o perderás el día.

### Future ADR gate

Green Owl may return to ADR review only after:

1. official point ownership is reconciled;
2. overlap with Habit Intelligence is removed;
3. inputs and outputs are typed;
4. consent, suppression and notification limits are defined;
5. manager visibility is constrained;
6. anti-dependence and anti-surveillance tests exist;
7. no component recalculates official metrics;
8. the scope excludes calendar, bitácora, voice and unrelated domains.

## Candy Crush

### Preserved product meaning

Candy Crush is the internal codename for adaptive challenge and experience
complexity.

It answers:

> ¿Qué tamaño y complejidad de reto puede ayudar al asesor a empezar y progresar
> en este momento sin reducir el estándar comercial?

It may consume:

- feature-learning state;
- progress signals;
- frustration or friction signals;
- task-completion history;
- Mick behavior signals with limits;
- time and available-capacity context;
- the already-authorized action candidate;
- the official goal or gap snapshot.

It may produce:

- `RECOVERY_CHALLENGE`;
- `STANDARD_CHALLENGE`;
- `STRETCH_CHALLENGE`;
- `DIFFICULTY_REDUCED`;
- `DIFFICULTY_MAINTAINED`;
- `DIFFICULTY_INCREASED`;
- adjusted explanation complexity;
- adjusted discovery pace;
- adjusted coaching intensity.

### Authority boundary

Candy Crush remains subordinate to:

```text
ADR-016 — Advisor Experience + Benvenù Anti-Dependence Boundary
```

It does not receive a standalone ADR while ADR-016 already owns responsible
complexity adaptation.

Candy Crush does not:

- lower commercial standards;
- create a separate goal;
- recalculate points;
- choose the NBA;
- choose the highest-priority widget;
- manipulate through variable rewards;
- optimize engagement over commercial outcomes;
- create artificial loss;
- use childish badges disconnected from value;
- hide evidence or uncertainty.

Canonical example:

```text
Authorized objective: recover daily activity.
Current state: low momentum.
Adaptive result: request two calls first, not ten.
Commercial standard: unchanged.
```

## Rocky

### Preserved product meaning

Rocky is the internal codename for the motivational recovery intervention that
helps an advisor restart action after Alfred, NBA and the applicable source
domains have already determined what matters.

Rocky does not decide the action.

Rocky changes only the presentation tone of an already-authorized,
evidence-backed and controllable action.

Example:

```text
Alfred / NBA:
The next action is a two-call recovery block.

Candy Crush:
Recovery challenge selected.

Green Owl:
Completing the block preserves daily momentum.

Rocky:
Arriba, Jorge. Son dos llamadas, no todo el día. Empieza con la primera.
```

### Current authority

Rocky does not survive as an ADR at this stage.

It remains:

```text
UX_VOICE_SPEC
MOTIVATIONAL_RECOVERY_ADAPTER
IMPLEMENTATION_CODENAME
```

A Rocky implementation must define:

- approved tones;
- intensity ceiling;
- quiet mode;
- user suppression;
- frequency cap;
- cooldown;
- evidence reference;
- action reference;
- why-now explanation;
- no-shame validator;
- no-coercion validator;
- no-economic-threat validator.

Rocky must not:

- insult or humiliate;
- infer laziness, weakness or commitment;
- create guilt;
- threaten streak loss artificially;
- exploit financial anxiety;
- pressure a client-facing sale;
- override Alfred or NBA;
- invent urgency;
- repeatedly interrupt after dismissal;
- behave as manager enforcement.

The desired energy may feel like a trusted corner coach.

The actual language must remain dignified, optional and evidence-aware.

## Relationship map

```text
Official source domains
    activity / productivity / goals / calendar / policy / payment /
    compensation / timeline / forecast / relationship evidence
                         ↓
Mick
    limited observable behavior signals
                         ↓
Alfred / NBA
    interpretation and operational priority
                         ↓
Candy Crush
    challenge and complexity adaptation
                         ↓
Green Owl
    momentum, streak and challenge loop
                         ↓
Rocky
    optional motivational recovery voice
                         ↓
Smart Widgets / Mi Día
    contextual presentation
                         ↓
Human advisor
    final authority and execution
```

This diagram describes responsibility flow, not an automatic execution chain.

## Smart Widget boundary

Smart Widgets remain contextual read models and presentation surfaces.

They may render Green Owl, Candy Crush or Rocky outputs only when:

- the upstream action is authorized;
- evidence and uncertainty remain visible;
- the widget explains why it appears now;
- human authority remains explicit;
- no send, approval, truth mutation or hidden execution occurs.

The normal Mi Día hierarchy remains:

```text
one primary Alfred card
one or two supporting Smart Widgets
one command bar
```

The codenames must not create permanent competing home sections.

## Economic and Client First boundary

Any challenge or motivational intervention involving:

- income goals;
- commission;
- bonuses;
- budget gaps;
- premium scenarios;
- production goals;
- policy value;

must preserve ADR-018.

Canonical rules:

```text
Money is context, not pressure.
Income goal is direction, not mandate.
Compensation scenario is not promise.
Economic gap is not client pressure.
Client First remains above economic motivation.
```

A codename cannot turn a financial scenario into pressure to recommend,
accelerate or close an unsuitable client action.

## Codename implementation rules

Internal modules may use codename-oriented filenames such as:

```text
green-owl-momentum-engine.js
candy-crush-adaptive-challenge-policy.js
rocky-recovery-voice-adapter.js
```

Their exported contracts and documentation must expose the neutral function and
the governing authority.

Example:

```text
codename: GREEN_OWL
neutralContract: DAILY_COMMERCIAL_MOMENTUM_LOOP
metricOwner: PRODUCTIVITY_OR_OFFICIAL_ACTIVITY_OWNER
priorityOwner: ALFRED_NBA
finalAuthority: HUMAN
```

The implementation must remain replaceable without rewriting the constitutional
architecture.

## Forbidden drift

No codename may become:

- an anthropomorphic source of truth;
- a hidden persuasion system;
- a dependency loop;
- a shame loop;
- a surveillance loop;
- a human score;
- a manager punishment mechanism;
- a variable-reward addiction mechanic;
- an autonomous action executor;
- a separate recommendation engine;
- a substitute for evidence;
- a substitute for human judgment.

## Promotion rule

A codename may be promoted to a standalone ADR only when a new nuclear review
proves all of the following:

1. distinct architectural question;
2. unique owner;
3. no duplication with existing ADRs;
4. typed inputs and outputs;
5. explicit source-of-truth boundary;
6. uncertainty and freshness handling;
7. consent and suppression;
8. anti-manipulation safety;
9. anti-dependence safety;
10. Client First compliance;
11. implementation need;
12. contract and boundary tests;
13. human final authority;
14. a reason constitutional authority is necessary.

Brand recognition alone is not sufficient.

## NFAST-09 resume point

The codename review does not change NFAST-09 runtime authority.

The previous Stage 3E draft that proposed a new permanent
`Seguimientos de hoy` section was not executed and is not the approved visual
direction.

The approved resume point is:

```text
NFAST-09_STAGE_3E_EXISTING_MI_DIA_SURFACE_BINDING_REDESIGN
```

Stage 3E must preserve:

- local-first IndexedDB rendering;
- incremental Stage 3B/3C synchronization;
- deterministic due-action priority;
- conflict visibility;
- rerender only after effective change.

Stage 3E must change its presentation plan:

- do not add a new permanent dashboard strip;
- feed the existing primary next-action / follow-up-risk surface;
- feed the existing Motor de seguimiento;
- provide ordering context to Oportunidades prioritarias without making that
  table the source of truth;
- preserve the responsive mobile and desktop compositions;
- let Alfred remain the operational star;
- let Smart Widgets provide contextual support;
- treat NFAST-09 due actions as one signal family among activity, payments,
  policies, commissions, goals, calendar and evidence.

## Non-authorizations

- `NEW_ADR_CREATED=NO`
- `GREEN_OWL_STANDALONE_ADR_AUTHORIZED=NO`
- `CANDY_CRUSH_STANDALONE_ADR_AUTHORIZED=NO`
- `ROCKY_STANDALONE_ADR_AUTHORIZED=NO`
- `PRODUCTIVITY_TRUTH_CHANGED=NO`
- `MICK_AUTHORITY_CHANGED=NO`
- `ALFRED_AUTHORITY_CHANGED=NO`
- `SMART_WIDGET_EXECUTION_AUTHORIZED=NO`
- `DASHBOARD_MUTATION_AUTHORIZED=NO`
- `SUPABASE_MUTATION_AUTHORIZED=NO`
- `MAIN_MUTATION_AUTHORIZED=NO`
- `NFAST_10_AUTHORIZED=NO`

## Next step

- `NEXT_STEP=NFAST-09_STAGE_3E_EXISTING_MI_DIA_SURFACE_BINDING_REDESIGN`
- `NEXT_STEP_STATUS=AUTHORIZED_PENDING_IMPLEMENTATION`
