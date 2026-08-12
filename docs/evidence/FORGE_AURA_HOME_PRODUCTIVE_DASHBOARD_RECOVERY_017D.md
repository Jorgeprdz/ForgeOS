# Forge Aura Home Productive Dashboard Recovery — 017D

## Constitutional result

- Constitution / Article 0 / ROBOCOP: PASS
- Home role: composition only
- New engine, source of truth, read model, schema, migration, RLS, auth or dependency: none
- ADR-027 boundary preserved: recommendation != decision != action != outcome

## Root cause

The productive Home adapter still supplied Agenda, Priority Stack, Cartera Future Radar and an honest Mick state. Their existing renderers remained in `home-module.js`, but `renderReady()` stopped composing them after the 017A attention-only simplification. Home therefore retained ALFRED and at most two supporting recommendations while materially useful daily-operating reads became orphaned.

## Authority map

| Surface | Owner | 017D action |
| --- | --- | --- |
| ALFRED / supporting recommendations | Home Attention Orchestration + Decision Projection | preserved |
| Agenda | canonical Agenda read model consuming Pipeline evidence | existing renderer reconnected |
| Rhythm / goals | Productive Smart Widget Orchestrator and goal/production owners | existing renderer reconnected |
| Cartera radar | `forge_cartera050_list_future_radar` | existing renderer reconnected |
| Mick observation | Mick/productivity authority | honest blocked state exposed; no score inferred |
| Human decision | FES `SALES_NBA_ADVISOR_RESPONSE` | unchanged |

## Product result

Home now composes, in order:

1. Mi Día header
2. ALFRED primary attention
3. operating dashboard: Agenda, Rhythm and goals, Cartera Radar, productivity observation
4. zero to two supporting recommendations
5. governed detail routes

Desktop and DeX use a balanced two-column operating grid. Tablet and mobile use one column. No business metric is calculated by Home.

## Validation before PR

- focused 017D contract: PASS
- 017A productive attention: 3/3 PASS
- Home command-center authority suite: PASS
- Home Attention orchestration: PASS
- 017C decision-control unit suite: 5/5 PASS
- Commercial Compass 015: 143 assertions PASS
- Aura reconciliation 016A: 13/13 PASS
- responsive authenticated fixture: 8/8 PASS
- 017C canonical-artifact browser non-regression: 2/2 PASS
- canonical Pages boundary and 59-file closure: PASS

Visual evidence was inspected at 1440x900, 1600x900, 834x1194, 430x932 and 390x844. Agenda/Rhythm owner-ready state was also inspected at 1440x900.

## Release boundaries

- database changes: none
- migration changes: none
- auth/RLS changes: none
- dependencies/lockfiles: none
- workflow changes: none
- FES and ADR-027 semantics: unchanged
- automatic action/outcome: false
