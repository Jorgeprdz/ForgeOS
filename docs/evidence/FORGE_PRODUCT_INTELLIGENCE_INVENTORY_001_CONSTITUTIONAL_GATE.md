# Forge Product Intelligence Inventory 001 — Constitutional Gate

```text
PHASE=FORGE_PRODUCT_INTELLIGENCE_INVENTORY_001
MODE=DISCOVERY_ONLY

CURRENT_MAIN_SHA=26a084c8cbf1c3a5c5147274a98f613cc127c206
BRANCH=feature/forge-product-intelligence-inventory-001
BRANCH_BASE_SHA=26a084c8cbf1c3a5c5147274a98f613cc127c206
FREEZE_BASELINE_SHA=4d824d67f6b4c30aba0f5b887e77b5f1d6289ac8

PRODUCTION_CODE_MUTATION=PROHIBITED
NEW_ENGINE=PROHIBITED
NEW_PRODUCT_TRUTH=PROHIBITED
NEW_FINANCIAL_FORMULA=PROHIBITED
NEW_SCORING_MODEL=PROHIBITED
NEW_PERSISTENCE=PROHIBITED
NEW_DATABASE_TABLE=PROHIBITED
NEW_RPC=PROHIBITED
NEW_EDGE_FUNCTION=PROHIBITED

UI_REDESIGN=PROHIBITED
MODULE_REWRITE=PROHIBITED
AURA_RECOMPOSITION=PROHIBITED

SOURCE_OF_TRUTH_MUTATION=PROHIBITED
AUTHORITY_REASSIGNMENT=PROHIBITED

DISCOVERY=AUTHORIZED
READ_ONLY_ARCHITECTURAL_ANALYSIS=AUTHORIZED
DOCUMENTATION=AUTHORIZED
EVIDENCE_CAPTURE=AUTHORIZED

CRITICAL_BUG_FIX=NOT_IN_SCOPE
DOCUMENT_FINDINGS=YES
FIX_FINDINGS=NO
DEPLOY=NO
```

## Decision

`GO_DISCOVERY_ONLY`

This phase may inspect the repository, map existing intelligence, document authorities/consumers/surfaces, record duplication or dormant intelligence, and produce architecture evidence. It may not mutate productive runtime behavior.

## Planning authorities

- `docs/evidence/FORGE_PRODUCT_ASSEMBLY_INSTRUCTION_001.md`
- `docs/evidence/FORGE_PRODUCT_FREEZE_BASELINE_2026-08-08.md`

## Scope guard

Allowed mutations are documentation and architecture evidence only. Static inspection tests may be added only if strictly necessary; none are authorized by default.

If discovery reveals a bug, semantic conflict, duplicate engine, unsafe authority split, dormant capability or frontend heuristic, the required action in this phase is:

```text
DOCUMENT_IT=YES
FIX_IT=NO
```

## Exit precondition

The phase may only close after a repository-wide intelligence inventory has produced, at minimum:

- intelligence catalog;
- duplication register;
- dormant intelligence register;
- consumption matrix;
- dependency map;
- executive acceptance with counts and next-phase readiness.

No PASS may be claimed if material areas remain uninspected or if productive code changed.