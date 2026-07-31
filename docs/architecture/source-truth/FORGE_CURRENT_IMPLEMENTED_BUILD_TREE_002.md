# Forge Current Implemented Build Tree 002

Status: CURRENT_IMPLEMENTED_TREE / ADVISOR_OS_PIPELINE_LOCK

Date: 2026-07-31

Supersedes: `FORGE_CURRENT_IMPLEMENTED_BUILD_TREE_001.md` for the Advisor OS Productive Pipeline branch.

Inheritance rule: all branches not explicitly changed below retain their status from `FORGE_CURRENT_IMPLEMENTED_BUILD_TREE_001.md` and later evidence-backed closures.

## Status Vocabulary

- IMPLEMENTED_AND_CLOSED: implementation and closure evidence exist.
- PRODUCTION_ACCEPTED: authenticated production path and public deployment evidence exist.
- LOCKED: behavior is a protected regression contract.
- PARTIAL: some implementation exists, branch-level closure incomplete.
- PENDING: planned or future work.
- BLOCKED: cannot advance without authority, evidence or implementation.

## Current Advisor OS Tree

```text
02 Advisor OS
│
├── Prospect Identity and Source Lineage 067G4
│   └── CONTRACT_IMPLEMENTED / production writer boundary preserved
│
├── Project 200 Identity, Parser, Handoff and Duplicate Review 067G5-067G8
│   └── IMPLEMENTED_WITH_REVIEW_BOUNDARIES
│
├── Advisor Prospect Ingestion 067G9
│   └── INTERFACE_AND_TEST_ADAPTER_IMPLEMENTED / production writer boundary preserved
│
├── Advisor Sales Pipeline UI Foundation 067G10
│   └── UI_IMPLEMENTED
│
├── Advisor Sales Stage Registry 067G11
│   └── REGISTRY_IMPLEMENTED
│
├── Pipeline UI Stage Integration 067G12
│   ├── READ_MODEL_IMPLEMENTED
│   └── historical preview-only writer status superseded by 067G17B4
│
├── Prospect Detail and Commitments 067G13
│   └── CONTRACT_AND_UI_IMPLEMENTED
│
├── Explained Sales NBA 067G14
│   └── RULE_BASED_ENGINE_IMPLEMENTED / Advisor-controlled
│
├── Advisor Dashboard NBA Consumer 067G15
│   └── UI_CONSUMER_IMPLEMENTED / no automatic client effect
│
├── Advisor OS Pipeline Live Mount and Navigation 067G16
│   └── CANONICAL_ROUTE_AND_LIVE_MOUNT_IMPLEMENTED
│
├── Forge Alive Static Entrypoint Pipeline Mount 067G16A
│   └── IMPLEMENTED
│
├── Pipeline Renderer and Responsive Acceptance 067G16B-067G16C
│   └── IMPLEMENTED_AND_ACCEPTED
│
├── Forge Authentication Entry 067G17B1
│   └── PRODUCTION_ACCEPTED
│
├── Productive Prospect Create Entry 067G17B2
│   └── PRODUCTION_ACCEPTED
│
├── Prospect Create Canonical Modal 067G17B3
│   └── PRODUCTION_ACCEPTED
│
└── Productive Pipeline Stage Persistence In-Place 067G17B4
    ├── PRODUCTION_ACCEPTED / LOCKED
    ├── Authenticated owner-only RPC
    │   └── forge_pipeline_update_prospect_stage
    ├── Allowed Stage validation
    │   └── fail-closed
    ├── Timeline evidence
    │   └── STAGE_CHANGED append-only event
    ├── Timeline digest search-path repair
    │   └── pgcrypto schema resolution verified
    ├── UI commit mode
    │   └── same card DOM node updated in place
    ├── Authentication behavior
    │   ├── no auth refresh event during save
    │   └── no AUTH_LOADING during save
    ├── Filter behavior
    │   ├── Source and Stage filters apply in place
    │   ├── same card nodes retained
    │   └── combined/empty/count states verified
    ├── Reconciliation
    │   └── deferred until route exit or tab backgrounding
    ├── Public runtime
    │   ├── canonical Material 3 route only
    │   ├── legacy UI absent
    │   └── legacy service worker retired
    └── Public acceptance SHA
        └── 5fca4409457022c59c04937da52de83488a352e2
```

## 067G17B4 Evidence Anchors

- `docs/architecture/source-truth/PIPELINE_STAGE_PERSISTENCE_IN_PLACE_CLOSURE_067G17B4.md`
- `docs/evidence/PIPELINE_STAGE_PERSISTENCE_IN_PLACE_CERTIFICATE_067G17B4.md`
- `supabase/migrations/20260731000200_pipeline_prospect_stage_rpc.sql`
- `supabase/migrations/20260731000300_pipeline_stage_timeline_digest_search_path_repair.sql`
- `docs/static-preview/forge-alive-material3/pipeline-stage-rpc-authority.js`
- `docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js`
- `tests/pipeline-stage-rpc-authority-regression.mjs`
- `tools/manual-ui-stability-check.mjs`

## Locked Boundaries

- Stage persistence may not return to preview-only behavior.
- A successful Stage save may not reconstruct the Pipeline module.
- The prospect Source may not be mutated by a Stage transition.
- UI success requires the RPC-confirmed row.
- Filters may not restore stale Stage memory.
- Automatic messaging, appointment creation and action execution remain separate authorities.
- The mobile navigation pill remains intentionally floating; mobile content must preserve bottom safe space.
