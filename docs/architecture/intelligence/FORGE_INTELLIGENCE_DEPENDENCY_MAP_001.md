# Forge Intelligence Dependency Map 001

Phase: `FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001`
Mode: read-only architecture evidence

## Canonical direction

```text
EVIDENCE / DOMAIN DATA
        ↓
DOMAIN AUTHORITY
        ↓
INTELLIGENCE / RULE AUTHORITY
        ↓
PROJECTION / COMPOSITION
        ↓
AURA DECISION SURFACE
        ↓
HUMAN ACTION
        ↓
TIMELINE / DOMAIN EVENT / EVIDENCE
        ↓
RECALCULATION
```

Consumer surfaces may not promote projections, forecasts, parser output, AI interpretation or UI state into source truth.

## Current high-level graph

```text
                    OFFICIAL / USER / SYSTEM EVIDENCE
                                │
             ┌──────────────────┼───────────────────┐
             │                  │                   │
      COMMERCIAL IDENTITY   POLICY TRUTH       ACTIVITY/FES
      Prospect + Person     Policy/Coverage      + Goals
             │                  │                   │
             │                  ├──── Portfolio ────┤
             │                  │      Intelligence │
             │                  │         │         │
             │                  │   Future Radar    │
             │                  │                   │
     Relationship Intelligence  │             Productivity
             │                  │                   │
             ├──── Timeline ─────┤                   ├── Mick
             │                  │                   │
             └── Opportunity Intelligence ──────────┤
                         │                          │
                  priorities / forecast             │
                         │                          │
                        Nash ───────────────┐        │
                         │                 │        │
                         └──────────── Alfred / Home│
                                           │        │
                                           └────────┘

Quote Evidence → Accepted Quote → Product Intelligence → Product-specific Decision Read Model → Aura Quotes

Confirmed Premium Payment
        + Policy Context
        + Compensation Rule Snapshot
        ↓
Advisor Compensation Engine
        ├── generated/estimated commission
        ├── bonus candidates
        └── explanation/digest
        ↓
Revenue Value / Income Projection
        ↓
Aura Income

Facts + owned assumptions → Forecast Intelligence → scenario/estimate → Reports/Home/Income
```

## Domain dependency records

| Upstream authority | Downstream consumer | Dependency type | Rule |
|---|---|---|---|
| Prospect authority | 020C convergence | human decision boundary | unresolved Prospect must not silently become CommercialPerson |
| CommercialPerson | Relationship/Person workspace | canonical entity dependency | composition may enrich, not replace identity |
| Timeline | Relationship/Pipeline/Policy projections | evidence/temporal dependency | stale/disconnected Timeline must suppress false recency claims |
| Relationship Intelligence | Opportunity/Nash | contextual intelligence | relationship signal is recommendation input, not autonomous action |
| Opportunity Intelligence | Pipeline/Home | candidate decision | priority/advice may rank but not execute |
| Nash | Home/Communication/Pipeline | recommendation/preparation | recommendation is not send/task/calendar/stage mutation |
| FES Activity | Productivity/Mick | domain evidence | points/coaching derive from governed activity, UI must not recreate rules |
| Policy Intelligence | Portfolio/Future Radar | truth→projection | projection cannot become Policy Truth |
| Policy Intelligence | Compensation | policy/economic context | commission engine may consume policy year/product context but not rewrite policy |
| Product Intelligence | Quote decision projection | product truth→presentation | generic aliases must not overwrite product-specific meaning |
| Confirmed Payment Event | Compensation Engine | economic evidence | issued premium is not paid premium |
| Compensation Rule Snapshot | Compensation Engine | governed rule dependency | candidate rules produce estimates, not payout truth |
| Compensation Engine | Income | calculation→presentation | generated/earned/paid/estimated states must remain distinct |
| Forecast Intelligence | Income/Home/Reports | scenario projection | forecast is not revenue/compensation truth |
| FIP Pack 01/02/03/04/05/06 | Alfred Pack 07 | composition | Alfred orchestrates; does not replace upstream authorities |
| Alfred | Aura Home | orchestration→surface | Home delegates actions to owning domain |

## Dependency inversions / risk points recorded

1. **Legacy frontend/product heuristics:** generic quote aliases can conflict with product-specific semantics; recent Quotes reconciliation already blocks this for four products.
2. **Productivity UI risk:** points/coaching must come from productivity/Mick owners; Activity acceptance explicitly avoids creating replacements.
3. **Forecast generations:** v1/v2/v3 composer lineage requires winning runtime path selection; consumers must not choose arbitrarily.
4. **Economic presentation risk:** root revenue/commission projections must never outrank confirmed payment/compensation truth.
5. **Material3→Aura generation split:** FIP orchestration intelligence should be reused while Material3 presentation remains non-authoritative for current Aura.
6. **Identity split:** Pipeline Prospect and canonical CommercialPerson require explicit human convergence rather than frontend assumptions.

## Product-specific chain proven in current Aura

```text
PDF / Quote evidence
  → Accepted Quote lifecycle
  → existing Product Intelligence
  → neutral product-specific decision read model
  → Aura Quotes
  → human acceptance / presentation approval
```

## Cartera chain proven in current Aura

```text
Evidence intake
  → review candidate
  → human identity/policy confirmation
  → canonical Policy / CommercialPerson
  → Policy/Portfolio read models
  → Future Radar / attention projection
  → Aura Cartera / Aura Home
```

## Economic chain

```text
Confirmed Payment Event
  → deterministic Commission Calculation
  → compensation truth-state gate
  → Revenue/Income presentation

Forecast / Pipeline opportunity
  → scenario / expected value
  → Income scenario layer

SCENARIO != GENERATED != EARNED != PAID
```

```text
DEPENDENCY_MAP_CREATED=YES
SOURCE_OF_TRUTH_MUTATION=0
AUTHORITY_REASSIGNMENT=0
```
