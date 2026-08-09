# Forge Intelligence Assembly Blueprint 002 — Constitutional Gate

```text
PHASE=FORGE_INTELLIGENCE_ASSEMBLY_BLUEPRINT_002
MODE=DISCOVERY_ARCHITECTURE_PRODUCT_COMPOSITION

BASE_BRANCH=main
BASE_SHA=9289197780efd23d70be7528a1191e0509cdae40
PREVIOUS_PHASE=FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001
PREVIOUS_PHASE_SHA=9289197780efd23d70be7528a1191e0509cdae40
BRANCH=feature/forge-intelligence-assembly-blueprint-002

PRODUCTION_CODE_MUTATION=PROHIBITED
RUNTIME_MUTATION=PROHIBITED
DATABASE_MUTATION=PROHIBITED
SCHEMA_MUTATION=PROHIBITED
RLS_MUTATION=PROHIBITED
SUPABASE_MUTATION=PROHIBITED
ENGINE_IMPLEMENTATION=PROHIBITED
MODULE_REWRITE=PROHIBITED
AURA_REIMPLEMENTATION=PROHIBITED
DEPLOY=NO
MERGE_TO_MAIN=NO

DOCUMENT_IT=YES
DESIGN_IT=YES
DISCOVERY=AUTHORIZED
ARCHITECTURE_MAPPING=AUTHORIZED
PRODUCT_COMPOSITION_MAPPING=AUTHORIZED
CONVERGENCE_DECISION_DOCUMENTATION=AUTHORIZED
FIX_IT=NO
```

## Preconditions

Phase 1 closed at `9289197780efd23d70be7528a1191e0509cdae40` after an exact GitHub compare proved that its branch delta contained only documentation under `docs/architecture/intelligence/` and `docs/evidence/`.

This phase must consume the Phase 1 artifacts rather than repeat the inventory.

## Product boundary

The phase may answer:

- which authority owns each intelligence meaning;
- how intelligence should compose without changing truth ownership;
- which decision each capability enables;
- where that decision should appear;
- what human action it should enable;
- what event/evidence closes the feedback loop;
- which historical/current implementation generation should conceptually win;
- in what sequence later implementation should occur.

It may not:

- create a new engine;
- connect engines productively;
- write database migrations;
- change RLS/auth/Supabase;
- rewrite Home, Pipeline, Activity, Cartera, Quotes or Income;
- delete legacy code;
- migrate consumers;
- deploy;
- merge this phase to `main`.

## Governing direction

```text
SOURCE OF TRUTH
  → DOMAIN AUTHORITY
  → INTELLIGENCE AUTHORITY
  → PROJECTION / COMPOSITION
  → DECISION MODEL
  → AURA SURFACE
  → HUMAN ACTION
  → TIMELINE / DOMAIN EVENT / EVIDENCE
  → UPDATED INTELLIGENCE
```

UI state, forecast, projection, AI interpretation, parser output and recommendation are never promoted into source truth merely because a surface displays them.

## Decision

```text
CONSTITUTIONAL_GATE=PASS
PHASE_STATUS=GO_DISCOVERY_ARCHITECTURE_PRODUCT_COMPOSITION
```

This commit must precede every other Blueprint 002 deliverable.
