# Forge Intelligence Assembly Blueprint 002

Phase: `FORGE_INTELLIGENCE_ASSEMBLY_BLUEPRINT_002`
Base: `9289197780efd23d70be7528a1191e0509cdae40`
Mode: discovery + architecture + product composition; no implementation

## Executive decision

Forge does **not** need another general intelligence engine before Beta 2.

The repository already contains the pieces required for a coherent decision system:

- canonical domain authorities for person/relationship/timeline, policy/coverage, activity, quote/product and economic evidence;
- FIP governed composition for Relationship, Advisor/Mick, Nash, Opportunity, Personal Coach, Learning/Business Intelligence and Alfred;
- current Aura surfaces already consuming real authorities in Home, Pipeline, Cartera, Quotes and Income;
- explicit recommendation-vs-human-action and forecast-vs-truth boundaries.

The assembly problem is therefore:

```text
PRESERVE TRUTH OWNERS
+ CONVERGE GENERATIONS
+ NORMALIZE DECISION PROJECTIONS
+ CONNECT CONSUMERS
+ PRESENT IN AURA
```

not:

```text
CREATE ANOTHER FORGE BRAIN
```

## Assembly law

```text
EVIDENCE / DOMAIN DATA
      ↓
DOMAIN AUTHORITY
      ↓
INTELLIGENCE AUTHORITY
      ↓
PROJECTION / COMPOSITION
      ↓
DECISION PROJECTION
      ↓
AURA SURFACE
      ↓
HUMAN ACTION
      ↓
TIMELINE / DOMAIN EVENT / EVIDENCE
      ↓
RECALCULATION
```

A surface can consume, explain and act. It cannot become a new truth owner.

## The existing orchestration spine

The strongest existing candidate for cross-system orchestration is **Alfred / FIP Pack 07**, whose own contract says Alfred is the orchestrator and does not replace Relationship Intelligence, Advisor Intelligence, Mick, Nash, Opportunity Intelligence or Business Intelligence.

The strongest existing candidate for a decision-shaped operational envelope is **FIP Pack 04 Opportunity and Operation**, which already represents:

- opportunities;
- annual review proposals;
- referral moments;
- attention budget;
- explainable ranked priorities;
- forecast states;
- scenarios;
- evidence/confidence/limitations;
- explicit human approval boundaries.

Pack 04 is opportunity-centric, so it must not be promoted wholesale into Policy, Product or Compensation authority. Phase 3 should determine whether a **neutral read-only decision projection contract** can normalize outputs from multiple authorities while reusing Pack 04/Pack 07 semantics. That would be an adapter/composition contract, not a new business engine.

## Forge Attention Model — conceptual only

Home should not calculate “what matters” independently. It should receive candidate decisions from owning domains and compose a bounded attention queue.

Candidate inputs:

```text
Pipeline / Opportunity
  commitments, overdue, cooling, priority, Nash context

Cartera / Portfolio
  Future Radar, renewal/risk/review signals

Activity / Productivity
  goal progress, activity gaps, Mick execution patterns

Income / Compensation / Forecast
  generated evidence, expected renewals, scenario impact

Agenda / Tasks
  governed commitments and due actions

Coach / BI
  evidence-backed experiment/review candidates
```

Home output grammar:

```text
WHAT IS HAPPENING
WHY IT MATTERS
EVIDENCE / CONFIDENCE / TRUTH STATE
WHAT THE ADVISOR CAN DO
WHERE THE ACTION BELONGS
```

Home delegates action to the owning workspace. It does not write Pipeline stages, policies, payments, messages or tasks without the existing explicit human/action authority.

## Forge Next Best Action — architectural decision

Do **not** create a new autonomous `NextBestActionEngine`.

Forge already has:

- Nash NBA;
- Opportunity priorities and scenarios;
- Relationship next-action lineage;
- Future Radar;
- Productivity/Mick intervention context;
- Personal Coach priorities;
- Alfred orchestration.

The assembly target is a **composition of owned candidate decisions**. Each domain retains the right to say what its signal means. Cross-domain orchestration may rank/present candidates only after preserving:

- source authority;
- evidence refs;
- confidence;
- truth state;
- limitations;
- human approval requirement;
- action target/owner.

## Identity is the entity spine

Commercial continuity must be anchored on the existing human-governed identity flow:

```text
Prospect
  ↓ remains Pipeline authority while unresolved
human identity decision
  ↓
CommercialPerson
  ↓
relationship + Timeline + quotes + policies + actions
```

No module may infer that a Pipeline Prospect is already a canonical CommercialPerson merely because the same human appears to exist in Forge.

This boundary is P0 because every cross-module decision depends on the subject being the right person.

## Economic truth spine

```text
Confirmed Premium Payment
+ Policy Context
+ Compensation Rule Snapshot
      ↓
Advisor Commission Calculation
      ↓
truth-state gate
      ↓
Income
```

Separate branch:

```text
Pipeline / Forecast / Renewal opportunity
      ↓
expected / scenario value
      ↓
Income scenario layer
```

Required invariant:

```text
SCENARIO != EXPECTED != GENERATED != EARNED != PAID
```

No probability-weighted money may silently become generated income. No UI or forecast may claim bank deposit/payout truth.

## Product truth spine

```text
Quote/PDF evidence
  → Accepted Quote
  → Product Intelligence
  → product-specific decision projection
  → Aura Quotes
  → human accept/present/export gate
```

The current Imagina Ser, ORVI, SeguBeca and Vida Mujer reconciliation is the pattern to preserve. GMM should later receive equivalent product-specific composition rather than a new generic product engine.

## Policy / portfolio spine

```text
Evidence intake
  → candidate extraction/review
  → explicit human confirmation
  → CommercialPerson / Policy / Coverage truth
  → Policy/Portfolio read models
  → Future Radar projection
  → Cartera / Home attention
```

Future Radar is a projection, never Policy Truth.

## Activity / advisor intelligence spine

```text
FES Activity + Goals
  → Productivity owner
  → points / rhythm
  → Mick execution pattern
  → optional Coach experiment/review
  → Activity/Home/Coach surface
  → advisor action
  → new FES evidence
```

The current Activity surface should eventually consume points/coaching authority rather than calculating or inventing replacements.

## Module mission summary

| Module | Mission | Primary user question |
|---|---|---|
| Home | bounded cross-system attention and delegation | What needs my attention now? |
| Pipeline | move commercial opportunities and commitments | Who should I move today and what should I do? |
| Activity | execute and understand productive rhythm | Am I doing what is needed for my objective? |
| Cartera | protect and develop the acquired book | What in my current business requires attention? |
| Quotes | understand and present a proposal correctly | What am I proposing and how should I explain it? |
| Income | explain generated/expected/scenario economics | What am I generating, what is expected, and what could I influence? |
| Communication | prepare a governed client interaction | How should I prepare this contact? |
| Person | assemble relationship context around one human | What does Forge know about this commercial relationship? |
| Documentation | govern evidence and review | What evidence exists and what still needs validation? |
| Calendar/Tasks | expose commitments requiring action | What commitment is due and when? |
| Coach | improve the advisor against their own evidence | What pattern should I test or adjust? |

## ADR / governance map

Only ADRs evidenced in the repository are listed.

| Authority | Applies to | Assembly implication |
|---|---|---|
| ADR-001 Evidence Ownership / Source Validity | all domains | evidence must precede claims |
| ADR-002 One Metric One Owner | metrics | workspaces consume; they do not redefine metrics |
| ADR-003 Recommendation vs Decision Authority Boundary | recommendations | recommendation is never automatic human/domain decision |
| ADR-004 No Invented Recommendations | NBA/coach/home | candidate decisions require evidence |
| ADR-005 Product Truth Boundary | Quotes/Product | product-specific meaning remains Product Intelligence-owned |
| ADR-006 Policy Truth Boundary | Cartera | projections cannot become issued-policy truth |
| ADR-007 Forecast Truth Boundary | Forecast/Income/Home | scenario/estimate must remain labeled and assumption-bound |
| ADR-008 Economic Evidence Boundary | Income/Compensation | generated/paid claims require appropriate economic evidence |
| ADR-010 NASH Conversation Intelligence Boundary | Nash/Communication | guidance is not intent truth or automatic send |
| ADR-011 Relationship Intelligence Non-Manipulation Boundary | Relationship | no manipulation/human-worth inference |
| ADR-015 Manager Intelligence Authority Boundary | Manager/Advisor separation | manager context cannot silently become advisor truth |
| ADR-017 Compensation Intelligence Evidence Boundary | Compensation | calculation is not payout truth |
| ADR-018 Economic Motivation Client First | commercial recommendations | economic advisor value must not distort client-first reasoning |
| ADR-0019 Process Advancement Intelligence | Pipeline/process | advancement intelligence remains governed, not automatic progression |
| ADR-023 Advisor OS Productive Home and Core Modules Recovery Execution Authority | Home/core modules | recover/reuse productive authorities before rewriting |
| ADR-024 Forge Aura Light 2026 Canonical Redesign Design Authority | current UI | Aura remains current visual authority; Material3 presentation does not regain authority |
| ADR-025 Cartera PDF Semantic Review Boundary | Cartera intake | extraction candidate requires review |
| ADR-026 Cartera PDF Semantic Completion and Honest Review Confidence | Cartera intake | missing/unknown semantics stay honest |

## Convergence decisions at blueprint level

1. **Aura wins current presentation authority; Material3 FIP bridges do not.** FIP intelligence services remain reusable.
2. **Alfred remains orchestrator, not truth owner.**
3. **CRS/CommercialPerson/Timeline remain identity/relationship spine.** FIP Relationship composes them.
4. **Product-specific Product Intelligence owns product meaning.** Generic quote helpers are fallback/components only.
5. **Policy Intelligence owns policy truth; Future Radar owns projection.**
6. **FES/Productivity owns activity/points; Mick/Coach interpret evidence without HR/human-worth claims.**
7. **Confirmed Payment + governed compensation stack owns generated commission calculation.** Forecast/revenue optimization stays scenario-only.
8. **Forecast must converge to one current composition path before broader activation.** v1/v2/v3 coexistence cannot be exposed ad hoc.
9. **Opportunity/Nash/Relationship recommendations compose; they do not auto-execute.**
10. **Home consumes candidate decisions; it never becomes another intelligence domain.**

## Top 10 assembly opportunities

| Rank | Capability | Existing authority | Target experience | Value | Cost | Risk | Recommended phase |
|---:|---|---|---|---|---|---|---|
| 1 | Commercial identity spine | Prospect + CRS/020C + CommercialPerson | seamless Pipeline→Person→Cartera continuity | VERY_HIGH | MEDIUM | HIGH | 003 |
| 2 | Authority/generation convergence locks | Source Ownership + FIP/platform/current Aura | one clear owner per meaning | VERY_HIGH | MEDIUM | HIGH | 003 |
| 3 | Neutral cross-domain decision projection | Pack04 semantics + Pack07/Alfred | common explainable decision grammar | VERY_HIGH | MEDIUM | HIGH | 004 |
| 4 | Economic truth-state normalization | Payment/Compensation/Forecast | generated/expected/scenario without ambiguity | VERY_HIGH | MEDIUM | HIGH | 004 |
| 5 | Pipeline Relationship+Opportunity+Nash activation | Packs01/03/04 | richer explainable next action in Aura | VERY_HIGH | MEDIUM | MEDIUM | 005 |
| 6 | Cartera Future Radar person/policy actions | Policy/Portfolio/Future Radar | proactive renewal/conservation/action | VERY_HIGH | LOW_MEDIUM | MEDIUM | 005 |
| 7 | Activity points + Mick activation | Productivity + Pack02 | rhythm plus evidence-backed execution adjustment | HIGH | MEDIUM | MEDIUM | 005 |
| 8 | Person intelligence composition | CRS + Timeline + Relationship + Quote/Policy refs | one commercial relationship workspace | VERY_HIGH | MEDIUM | HIGH | 005 |
| 9 | GMM product-specific decision experience | GMM Product Intelligence | Quotes without generic reduction | HIGH | MEDIUM | MEDIUM | 006 |
| 10 | Home/Alfred bounded attention orchestration | Alfred + domain decision projections | one coherent “what now” queue | VERY_HIGH | MEDIUM | HIGH | 007 |

## Recommended implementation sequence

The blueprint recommends later phases, not implementations in this branch:

```text
003 — FORGE_SHARED_AUTHORITY_AND_IDENTITY_CONVERGENCE
004 — FORGE_CROSS_DOMAIN_DECISION_PROJECTION_CONTRACT
005 — FORGE_DOMAIN_INTELLIGENCE_ACTIVATION
006 — FORGE_PRODUCT_AND_ECONOMIC_DECISION_COMPLETION
007 — FORGE_HOME_ATTENTION_ORCHESTRATION
008 — FORGE_AURA_EXPERIENCE_COMPOSITION
009 — FORGE_COMMERCIAL_LOOP_INTELLIGENCE_ACCEPTANCE
```

These names are derived from the actual gaps found here, not copied from the conceptual examples in the prompt.

## Millennium Falcon map

```text
                              FORGE HOME / AURA
                         bounded attention + delegation
                                      │
                                ALFRED ORCHESTRATOR
                         (composition, never truth owner)
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          │                           │                           │
      PIPELINE                    CARTERA                    ACTIVITY
 Who/what to move?        What book needs attention?    Am I doing enough?
          │                           │                           │
 Relationship + Nash       Policy + Portfolio             FES + Productivity
 Opportunity + Timeline       Future Radar                   Mick / Coach
          │                           │                           │
          └───────────────┬───────────┴───────────────┬───────────┘
                          │                           │
                      PERSON /                    INCOME
                  COMMERCIAL IDENTITY       economic consequence
                          │                           │
             CommercialPerson + CRS      Payment + Compensation
                    + Timeline            + Revenue/Forecast
                          │                           │
                          ├──────── QUOTES ──────────┤
                          │    Accepted Quote        │
                          │   Product Intelligence   │
                          │                         │
                          └──── EVIDENCE / EVENTS ──┘
                                      │
                          Supabase / governed sources
```

The ship is assembled around **identity, evidence and domain authority**, not around screens.

## Blueprint conclusion

Forge already has enough intelligence to justify Beta 2. The next engineering work should primarily connect and normalize existing authorities. A fourth general rebuild, another Home engine, another universal NBA engine or another Product Intelligence layer would increase architecture debt rather than solve the current bottleneck.

```text
NEW_ENGINE_CREATED=0
UI_REDESIGN_EXECUTED=0
RUNTIME_MUTATION=0
DATABASE_MUTATION=0
DEPLOYMENT=0
```
