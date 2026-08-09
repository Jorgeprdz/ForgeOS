# Forge Product Assembly Instruction 001

```text
DOCUMENT=FORGE_PRODUCT_ASSEMBLY_INSTRUCTION_001
STATUS=LOCKED_PLANNING_AUTHORITY
BASELINE_EVIDENCE=docs/evidence/FORGE_PRODUCT_FREEZE_BASELINE_2026-08-08.md
FUNCTIONAL_FREEZE_SHA=4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8
NEXT_PHASE=FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001
VISUAL_AUTHORITY=FORGE_AURA_LIGHT_2026
PRIMARY_GOAL=ASSEMBLE_EXISTING_FORGE_CAPABILITIES_INTO_ONE_COHERENT_COMMERCIAL_OPERATING_SYSTEM
FOURTH_REBUILD_AUTHORIZED=NO
```

## 1. Purpose

Forge has accumulated substantial productive intelligence, authorities, engines, rules, calculations and product-specific semantics across multiple generations of implementation.

The current bottleneck is not simply the absence of functionality. It is the lack of one stable product-assembly instruction defining:

- what Forge already knows;
- which component is authoritative for each truth;
- how intelligence becomes a commercial decision;
- where that decision is presented;
- which user action follows;
- how modules cooperate without duplicating truth;
- when UI recomposition is justified;
- what acceptance proves that Forge is ready to relaunch Beta.

This document is that assembly instruction.

It intentionally prevents a fourth broad reconstruction by requiring discovery and composition before mutation.

## 2. Core assembly model

Forge must be assembled according to this direction:

```text
SOURCES OF TRUTH
      ↓
AUTHORITIES / ENGINES
      ↓
SIGNALS
      ↓
DECISIONS
      ↓
EXPLANATIONS
      ↓
EXPERIENCES
      ↓
ACTIONS
      ↓
COMMERCIAL OUTCOMES
```

It must not be assembled as:

```text
MODULE
  ↓
LOAD DATA
  ↓
FRONTEND REINTERPRETS BUSINESS MEANING
  ↓
LOCAL UI HEURISTIC
```

## 3. Constitutional assembly rules

### Rule A — One truth, one authority

A commercial truth must have one canonical authority. Multiple surfaces may consume it, but they may not independently redefine it.

### Rule B — Aura presents; productive authorities decide meaning

Forge Aura may compose, prioritize and present existing intelligence. It must not recreate business formulas, product semantics, identity truth, compensation truth or persistence ownership when an existing productive authority already owns them.

### Rule C — Engines are not integrated until they change a visible decision

An engine is not considered productively integrated merely because it executes or exposes data.

For inventory purposes, an engine becomes meaningfully integrated when its output can be traced to at least one of:

- a visible decision;
- an explanation;
- a prioritization;
- a recommended next action;
- a material commercial outcome shown to the advisor.

### Rule D — Intelligence may be reused across surfaces without duplicating authority

The same decision may be surfaced in Forge Hoy, Pipeline, Cartera or a person/client context, but all instances must trace back to the same authority and evidence.

### Rule E — No broad UI redesign before the intelligence map exists

Forge Aura Light 2026 remains the visual authority.

During inventory and authority mapping:

- no aesthetic redesign is authorized;
- no module-wide rewrite is authorized;
- no new dashboard architecture is authorized;
- no new engine is authorized merely to simplify presentation.

Critical bug fixes remain allowed when separately evidenced and bounded.

### Rule F — Home is assembled last

Forge Hoy / Home / Dashboard must summarize the system, not invent it.

Its final product intelligence composition is therefore designed only after the domain workspaces and decision contracts are understood.

## 4. The complete assembly sequence

```text
0. FREEZE
       ↓
1. INTELLIGENCE INVENTORY
       ↓
2. AUTHORITY MAP
       ↓
3. DECISION CATALOG
       ↓
4. DECISION CONTRACT
       ↓
5. EXPERIENCE MAP
       ↓
6. AURA AUDIT
       ↓
7. PRESENTATION SYSTEM
       ↓
8. MODULE RECOMPOSITION
       ↓
9. COMMERCIAL LOOP ACCEPTANCE
       ↓
10. BETA 2
```

The phases are sequential. A later phase may use evidence from an earlier phase, but it must not retroactively invent missing authority.

---

# PHASE 0 — Freeze

## Objective

Stop moving product pieces long enough to establish a reliable baseline.

## Current status

Complete.

Functional baseline:

`4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8`

Evidence:

`docs/evidence/FORGE_PRODUCT_FREEZE_BASELINE_2026-08-08.md`

## Allowed during freeze

- documentation;
- discovery;
- evidence capture;
- architecture inventory;
- critical production bug fixes with bounded scope.

## Prohibited by default

- new engines;
- speculative refactors;
- broad UI redesign;
- module rewrites by intuition;
- new product truth;
- duplicate persistence;
- duplicate authority.

## Gate

A verifiable functional SHA exists and the next phase can operate without changing product behavior.

---

# PHASE 1 — Forge Product Intelligence Inventory 001

## Objective

Discover all significant intelligence already present in the repository.

The inventory must search the complete relevant repository, not only Aura and not only currently visible modules.

## Scope to discover

At minimum:

- product intelligence;
- quote/product-specific logic;
- Accepted Quote semantics;
- benefit-summary logic;
- recommendation/ranking logic;
- forecasting;
- productivity/activity logic;
- Pipeline prioritization and commercial state;
- follow-up/commitment logic;
- Timeline-derived signals;
- Cartera/policy intelligence;
- renewal/conservation logic;
- cross-sell or coverage-gap logic where present;
- compensation;
- commissions;
- bonuses;
- income/revenue projections;
- advisor lifecycle/development intelligence;
- identity resolution/convergence;
- scoring;
- classifiers;
- rule packs;
- calculators;
- projections;
- read models;
- orchestration/composition layers;
- dead, legacy or duplicated intelligence.

## Required record for every discovered intelligence asset

```text
ID
NAME
DOMAIN
LOCATION
TYPE
WHAT_IT_KNOWS
INPUTS
OUTPUTS
AUTHORITY_OWNER
PERSISTENCE_OWNER_IF_ANY
CURRENT_CONSUMERS
CURRENT_SURFACES
VISIBLE_DECISION_TODAY
POTENTIAL_DECISION
POTENTIAL_ACTION
EVIDENCE
STATUS
```

## Status vocabulary

```text
GREEN   = productive and meaningfully consumed
YELLOW  = productive but underused
ORANGE  = exists but is not connected to a useful experience
RED     = duplicated, contradictory or authority-unsafe
BLACK   = legacy/dead/not part of the intended product
UNKNOWN = requires deeper inspection
```

## Primary deliverable

`FORGE_INTELLIGENCE_CATALOG`

## Gate

Do not proceed until the important productive engines and intelligence assets can be accounted for with location, authority and consumer evidence.

No production code mutation is part of this phase.

---

# PHASE 2 — Forge Authority Map

## Objective

Answer one question for every relevant commercial truth:

> Who is authoritative for this?

## Example authority categories

```text
commercial identity
activity occurred
commercial state
timeline event
quote accepted evidence
product meaning
policy/portfolio state
renewal state
commission truth
bonus truth
income estimate
forecast
market/economic reference
human confirmation
```

## Deliverable

`FORGE_AUTHORITY_MAP`

For each truth record:

```text
TRUTH
CANONICAL_AUTHORITY
READERS
WRITERS
PERSISTENCE
HUMAN_DECISION_BOUNDARY
ALLOWED_PRESENTATION_TRANSFORMS
FORBIDDEN_DUPLICATIONS
```

## Gate

No material commercial truth has two competing canonical owners without an explicit reconciliation decision.

---

# PHASE 3 — Forge Decision Catalog

## Objective

Translate raw intelligence into useful advisor decisions.

Every relevant item should be evaluated through:

```text
INTELLIGENCE
      ↓
SIGNAL
      ↓
DECISION
      ↓
EXPLANATION
      ↓
ACTION
      ↓
OUTCOME
```

## Example

```text
Timeline + Pipeline
↓
follow-up commitment overdue
↓
requires attention today
↓
"You committed to contact this person yesterday"
↓
contact person
↓
recover commercial opportunity
```

Another example:

```text
Cartera + Revenue
↓
policy approaching renewal
↓
conservation priority
↓
"Renewal is due in 11 days and no recent contact is recorded"
↓
contact client
↓
protect expected renewal income
```

## Deliverable

`FORGE_DECISION_CATALOG`

## Required decision fields

```text
DECISION_ID
SUBJECT_TYPE
SUBJECT_REF
DECISION_TYPE
SIGNAL
REASON
EVIDENCE
PRIORITY_RULE
RECOMMENDED_ACTION
ACTION_TARGET
EXPECTED_OUTCOME
COMMERCIAL_IMPACT
FINANCIAL_IMPACT_IF_AUTHORIZED
SOURCE_AUTHORITIES
HUMAN_CONFIRMATION_REQUIRED
SURFACE_CANDIDATES
```

## Gate

The highest-value existing intelligence has a clear user decision or is explicitly classified as background/internal intelligence.

---

# PHASE 4 — Forge Decision Contract

## Objective

Create a stable composition contract between productive authorities and user experiences.

This is **not** permission to build another business engine.

It is a neutral contract allowing different authorities to publish or expose decision-ready information in a common shape.

## Candidate conceptual contract

```text
ForgeDecision

id
subject
subject_type
decision_type
priority

title
reason
evidence

recommended_action
action_target

commercial_impact
financial_impact

source_authorities
source_refs
confidence
valid_until
human_confirmation_required
```

The exact implementation must be derived from the inventory and authority map rather than imposed prematurely.

## Deliverable

`FORGE_DECISION_CONTRACT`

plus the appropriate ADR/constitutional evidence.

## Gate

The contract can express the priority cross-domain decisions without moving product truth into Aura or creating a duplicate persistence model.

---

# PHASE 5 — Forge Experience Map

## Objective

Design the product architecture before redesigning screens.

At this stage the question is not visual styling. It is where decisions belong in the advisor workflow.

## Working product topology

```text
                    FORGE HOY
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     Pipeline       Actividad       Cartera
        │                             │
        └──────── Persona / Cliente ──┘
                       │
           ┌───────────┼───────────┐
           │           │           │
     Cotizaciones  Documentos   Ingresos
```

Cross-cutting authorities include, as discovered:

- Timeline;
- Product Intelligence;
- identity;
- decision composition;
- authentication;
- RLS/security;
- persistence boundaries.

## One primary question per workspace

### Forge Hoy

> What should I do now?

### Pipeline

> Which opportunities should I move?

### Activity

> Am I doing what is required to reach my objectives?

### Quotes

> What am I proposing, what does it mean, and what decision comes next?

### Cartera

> Which clients and policies require attention?

### Income

> What am I generating, what do I expect, and what could I generate?

### Person / Client context

> What does Forge know about this commercial relationship?

## Deliverable

`FORGE_EXPERIENCE_MAP`

## Gate

Every high-value decision has a justified primary surface, and duplicated presentation is intentional rather than accidental.

---

# PHASE 6 — Aura Audit Against the Experience Map

## Objective

Audit the current UI against the now-understood product architecture.

This is the first phase where broad UI recomposition decisions are allowed.

## Required classification for each surface

```text
KEEP
RECOMPOSE
REBUILD_SURFACE
REMOVE
```

### KEEP

The model is correct; connect or expose missing intelligence only.

### RECOMPOSE

The underlying capabilities are correct, but hierarchy, grouping or action placement is wrong.

### REBUILD_SURFACE

The screen model cannot honestly represent the required decisions and should be rebuilt as a bounded surface.

### REMOVE

The surface duplicates another experience or adds no material product value.

## Rule

There is no blanket status called `REBUILD_FORGE`.

Rebuild authorization applies only to individually evidenced surfaces.

## Deliverable

`FORGE_AURA_EXPERIENCE_AUDIT`

## Gate

Every planned UI mutation traces to a decision/experience deficiency found in previous phases.

---

# PHASE 7 — Intelligence Presentation System

## Objective

Define one consistent grammar for how Forge presents intelligence.

## Presentation grammar

### State

What is happening?

### Explanation

Why does Forge think this?

### Impact

Why does it matter to the advisor?

### Action

What can the advisor do now?

## Example

```text
Renewal at risk

Mariana's policy renews in 9 days and no recent contact is recorded.

Expected renewal income: $X

[Contact Mariana]
```

The economic value may appear only when produced by an authorized source.

## Principle

More intelligence should often produce **less UI**, because connected intelligence can be synthesized into fewer, higher-value decisions.

Forge must not become a cockpit of unrelated KPIs.

## Deliverable

`FORGE_INTELLIGENCE_PRESENTATION_SYSTEM`

## Gate

Priority decisions can be rendered consistently, accessibly and with provenance across multiple surfaces without local frontend reinterpretation.

---

# PHASE 8 — Bounded Module Recomposition

## Objective

Implement the experience map using existing authorities and the decision/presentation contracts.

## Default vertical order

### 1. Identity + Person/Client context

Reason: the commercial relationship is the cross-module anchor.

### 2. Pipeline

Reason: it begins the active commercial loop.

### 3. Quotes

Reason: it converts opportunity into a product-specific proposal and decision.

### 4. Cartera

Reason: it represents acquired business, conservation and policy/client continuity.

### 5. Income

Reason: it turns commercial outcomes into economic consequence and expectation.

### 6. Activity

Reason: it connects execution to objectives and outcomes.

### 7. Forge Hoy / Dashboard

Reason: it must summarize the fully connected system and therefore comes last.

The final order may be adjusted only when earlier evidence reveals a hard dependency.

## Implementation rule

For every vertical:

```text
AUTHORITY
→ DECISION
→ SURFACE
→ ACTION
→ ACCEPTANCE
```

must be explicit before implementation begins.

## Gate

Each vertical passes its own domain acceptance plus cross-domain continuity checks before moving to the next dependent vertical.

---

# PHASE 9 — Commercial Loop Acceptance

## Objective

Prove that one clean advisor can operate the commercial loop without hidden manual intervention by the Forge team.

## Required end-to-end path

```text
Login
↓
Create prospect
↓
Record/follow activity
↓
Advance commercial state
↓
Create/review quote
↓
Accept/close
↓
Converge identity with required human confirmation
↓
Create/attach policy
↓
See policy in Cartera
↓
Produce authorized commission/income view
↓
Reflect actionable intelligence in Forge Hoy
↓
Logout
↓
Login
↓
State remains correct
```

## Security and isolation

Acceptance must include at least two governed users and verify RLS/data isolation where applicable.

## Required environments

The final acceptance must exercise the actual release/Pages boundary, not only local fixtures or branch previews.

Desktop and mobile acceptance must cover the critical loop.

## Gate

A new advisor can execute the primary commercial loop without re-entering the same identity because modules cannot see each other, without unsupported economic claims, and without Forge operators explaining hidden architecture gaps.

---

# PHASE 10 — Beta 2 Relaunch

## Objective

Relaunch Forge for productive behavioral validation.

## Beta purpose

The beta is not primarily a visual-preference study.

Its core question is:

> Does Forge materially help an advisor operate the commercial business?

## Observe

- where the advisor becomes lost;
- which decision/explanation is unclear;
- which suggested action is ignored and why;
- where the advisor leaves Forge to think or work elsewhere;
- which cross-module continuity feels broken;
- which intelligence is trusted or distrusted;
- which repeated manual task Forge should absorb next.

## Suggested internal release identity

`FORGE BETA 2 — PRODUCTIVE COMMERCIAL LOOP`

## Gate

Commercial-loop acceptance is green and no unresolved critical authority or identity discontinuity makes the core flow dishonest.

---

## 5. Idea handling during assembly

Every newly discovered idea must enter exactly one of three buckets:

```text
BUG
NECESSARY_FOR_CURRENT_PHASE
BACKLOG_AFTER_ASSEMBLY
```

This prevents the inventory from turning into another implementation sprint.

If a discovery is valuable but not required for the current phase, it must be recorded and deferred.

## 6. UI redesign rule after the inventory

The inventory does not automatically imply another redesign.

After the Experience Map, each current Aura surface is compared against the product model.

Expected outcomes:

- some screens remain mostly unchanged;
- some screens require hierarchy and composition changes;
- some bounded surfaces may require rebuilding;
- some redundant surfaces may disappear.

Aura Light 2026 itself is not discarded by default.

The target is **experience composition**, not aesthetic reinvention.

## 7. Decision-layer caution

The phrase `Forge Decision Layer` may be used conceptually for the composition boundary between existing intelligence and experiences.

It must not be interpreted as permission to:

- create a new Product Intelligence engine;
- create a new scoring authority;
- duplicate existing recommendations;
- persist competing commercial truth;
- override existing human-decision boundaries;
- move domain calculation logic into frontend code.

Its role is composition, provenance and consistent decision delivery.

## 8. Product north star

Forge must converge toward one operational question:

> What should the advisor do now, why, and what commercial consequence does it have?

Individual workspaces provide domain depth, while Forge Hoy provides cross-domain attention.

The desired product is not a menu containing separate CRM, activity, quote, portfolio and commission tools.

It is one commercial operating system in which those authorities cooperate around the advisor's work.

## 9. Immediate next action

The next phase to execute is:

`FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001`

### Required mode

```text
DISCOVERY_ONLY=YES
PRODUCTION_MUTATION=NO
UI_REDESIGN=NO
NEW_ENGINE=NO
NEW_TRUTH=NO
```

### Required first deliverable

`FORGE_INTELLIGENCE_CATALOG`

Only after that catalog is evidenced may the Authority Map phase begin.

## 10. Resume instruction for any future session

When work resumes, do not begin from memory or from whichever module appears unfinished.

Read in this order:

1. `docs/evidence/FORGE_PRODUCT_FREEZE_BASELINE_2026-08-08.md`
2. `docs/evidence/FORGE_PRODUCT_ASSEMBLY_INSTRUCTION_001.md`
3. the evidence produced by the latest completed assembly phase;
4. the exact current `main` SHA and diff against the recorded functional freeze if `main` moved.

Then continue from the first incomplete gate in this instruction.

This document is intended to remain the stable assembly sequence unless a later explicitly versioned architecture decision supersedes it.
