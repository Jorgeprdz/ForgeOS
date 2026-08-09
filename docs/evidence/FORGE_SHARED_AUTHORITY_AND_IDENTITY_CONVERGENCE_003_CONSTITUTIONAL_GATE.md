# Forge Shared Authority and Identity Convergence 003 — Constitutional Gate

```text
PHASE=FORGE_SHARED_AUTHORITY_AND_IDENTITY_CONVERGENCE_003
MODE=GOVERNED_IMPLEMENTATION

MAIN_HEAD=9289197780efd23d70be7528a1191e0509cdae40
BLUEPRINT_HEAD=a49c4abe3872853c47aa8a70e820c2bc4cb1af93
PHASE_BASE_SHA=a49c4abe3872853c47aa8a70e820c2bc4cb1af93
MERGE_BASE=9289197780efd23d70be7528a1191e0509cdae40
MAIN_DRIFT=BLUEPRINT_AHEAD_BY_10_DOCS_ONLY

PREVIOUS_PHASE_001=PASS
ASSEMBLY_BLUEPRINT_002=PASS
BLUEPRINT_HEAD_VERIFIED=YES

FORGE_CONSTITUTION=READ
SOURCE_OWNERSHIP_REGISTRY=READ
CRS_AUTHORITIES=READ
PIPELINE_AUTHORITY=READ
CARTERA_AUTHORITY=READ
TIMELINE_AUTHORITY=READ
RLS_BOUNDARIES=READ

NEW_PERSON_AUTHORITY=PROHIBITED
NEW_PROSPECT_AUTHORITY=PROHIBITED
NEW_TIMELINE=PROHIBITED
NEW_IDENTITY_LEDGER=PROHIBITED
NEW_PARALLEL_RELATIONSHIP_MODEL=PROHIBITED
AUTO_IDENTITY_MERGE=PROHIBITED

HUMAN_IDENTITY_DECISION_REQUIRED=YES

UNKNOWN_IS_NOT_ZERO=YES
UNKNOWN_IS_NOT_PERSON=YES
PROSPECT_IS_NOT_AUTOMATICALLY_COMMERCIAL_PERSON=YES

RLS_BYPASS=PROHIBITED
SERVICE_ROLE_IN_BROWSER=PROHIBITED
FRONTEND_DIRECT_CANONICAL_TABLE_MUTATION=PROHIBITED

NEW_PRODUCT_INTELLIGENCE=PROHIBITED
NEW_FINANCIAL_FORMULA=PROHIBITED
NEW_SCORING_MODEL=PROHIBITED

AURA_REDESIGN=NOT_IN_SCOPE
HOME_REDESIGN=NOT_IN_SCOPE
PIPELINE_REWRITE=NOT_IN_SCOPE
CARTERA_REWRITE=NOT_IN_SCOPE

MERGE_TO_MAIN=NO
AUTO_MERGE=NO
PRODUCTION_DEPLOYMENT=NO
```

## Verified authorities

### CommercialPerson / identity resolution

- `platform/shared-commercial-model/crs-01-existing-cartera-authority-registry.js` declares `CARTERA_010B_COMMERCIAL_PERSON` as canonical person identity and `CARTERA_010B_IDENTITY_RESOLUTION` as the human-governed identity command boundary.
- `supabase/migrations/20260731000200_cartera010b_identity_policy_foundation.sql` owns `commercial_people`, append-only `identity_resolution_decisions`, `commercial_source_identity_links`, command receipts and owner-scoped RLS.
- `supabase/migrations/20260731000211_cartera010b_identity_resolution_rpc.sql` implements `forge_cartera010b_confirm_identity_resolution` with `auth.uid()` ownership checks, explicit outcomes, evidence, idempotency and advisory locking.

### Pipeline

- `platform/shared-commercial-model/crs-03-pipeline-person-convergence-contract.js` preserves `PIPELINE_PROSPECT_AUTHORITY`, allows `UNRESOLVED`, requires person/link/decision references for `LINKED`, preserves `PIPELINE_STAGE_RPC`, and forbids automatic identity resolution, opportunity creation and stage advance.
- Current Aura Pipeline remains a consumer/orchestrator over productive Pipeline authority and RLS; this phase will not rewrite Pipeline.

### Timeline

- `platform/shared-commercial-model/crs-08-unified-person-timeline-adapters.js` composes Pipeline snapshots and other governed domain events into the single CommercialPerson/Relationship timeline projection; it does not create a second event ledger.

### Cartera

- Current Cartera architecture declares `IDENTITY_OWNER=CARTERA_010B_IDENTITY_RESOLUTION` and permits frontend reads while canonical mutations remain behind governed RPC/command boundaries.

### RLS / tenant isolation

- Cartera 010B enables RLS on canonical identity/policy tables, grants authenticated `SELECT` only, and scopes read policies to `advisor_id = auth.uid()`.
- The identity-resolution RPC verifies the acting user with `auth.uid()` and rejects advisor/source Prospect mismatches.

## Existing implementation candidate discovered before productive mutation

The repository already contains `docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v10.js`, which:

- composes current Cartera adapter behavior;
- loads owner-scoped Pipeline prospects and existing identity links;
- presents unresolved Pipeline Prospect candidates distinctly;
- invokes the existing `forge_cartera010b_confirm_identity_resolution` RPC only after the advisor selects/continues the human review;
- uses existing identity resolution for `LINK_CONFIRMED` / `CREATE_CONFIRMED`;
- preserves idempotency and durable Cartera 020C attach behavior;
- creates no new table, RPC, Edge Function or person authority.

However, the productive semantic Cartera module currently imports `cartera-adapter-pages-v8.js`, so the v10 convergence behavior is not mounted in the active Cartera path.

This phase is therefore authorized to inspect and, if tests confirm the chain, promote the existing v10 composition into the productive Cartera module with the smallest possible UI/runtime delta.

## Decision

```text
CONSTITUTIONAL_GATE=PASS
IMPLEMENTATION_AUTHORIZED=YES_MINIMAL_EXISTING_AUTHORITY_PROMOTION_ONLY
NEW_ARCHITECTURE_AUTHORIZED=NO
```

If promotion of the existing v10 chain would require new persistence, new schema, new RPC, new Edge Function, automatic matching, RLS bypass or a second identity authority, implementation must stop and the phase becomes `BLOCKED` rather than inventing a shortcut.
