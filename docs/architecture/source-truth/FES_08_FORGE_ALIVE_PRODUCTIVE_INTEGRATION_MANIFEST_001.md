# FES 08 — Forge Alive Productive Integration Manifest

```text
PHASE=FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION
PHASE_STATUS=IMPLEMENTATION_AUTHORIZED
SOURCE_COMMIT=89530d5e22e188d97ae04c48e8a3bed664339297
RUNTIME_BRANCH=feature/nfast-09-timeline-to-conversation-brief-projection
MIRANDA_APPROVAL=APPROVED_BY_PRODUCT_OWNER
BOARD_APPROVAL=APPROVED_BY_PRODUCT_OWNER
HUMAN_VISUAL_ACCEPTANCE=REQUIRED_AFTER_REMOTE_PREVIEW
PRODUCTIVE_ROUTE=/ForgeOS/static-preview/forge-alive/?nav=pipeline
MAIN_MUTATION=FORBIDDEN
DATABASE_MIGRATION=FORBIDDEN
DIRECT_PERFORMANCE_WRITE=FORBIDDEN
```

## Exact mutation manifest

The following files are the complete authorized mutation set for FES 08:

### Governance and evidence

- `docs/evidence/FES_08_ROBOCOP_CONSTITUTIONAL_GATE_001.md`
- `docs/evidence/FES_08A_FES_ACTIVITY_LINEAGE_ROBOCOP_GATE_001.md`
- `docs/evidence/FES_08B_NASH_COMBAT_BROWSER_ADAPTER_ROBOCOP_GATE_001.md`
- `docs/architecture/source-truth/FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION_DISCOVERY_001.md`
- `docs/architecture/source-truth/FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION_MANIFEST_001.md`
- `docs/architecture/source-truth/FORGE_EVENT_EVIDENCE_OPERATING_SYSTEM_001.md`
- `docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md`
- `docs/roadmap/FORGE_ROADMAP_LOCK_001.md`
- `docs/roadmap/FORGE_SYSTEM_REALIGNMENT_ROADMAP_001.md`
- `docs/evidence/FES_08_FORGE_ALIVE_PRODUCTIVE_INTEGRATION_ACCEPTANCE_001.md`
- `docs/architecture/source-truth/FES_08A_CANONICAL_FES_ACTIVITY_LINEAGE_BRIDGE_001.md`
- `docs/evidence/FES_08A_CANONICAL_FES_ACTIVITY_LINEAGE_ACCEPTANCE_001.md`

### Productive integration

- `docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.js`
- `docs/static-preview/forge-alive/forge-alive-pipeline-view-067g16a.css`
- `advisor-os/sales-pipeline/productive-prospect-ui.js`
- `advisor-os/sales-pipeline/pipeline-ui.css`
- `advisor-os/sales-pipeline/productive-pipeline-action-runtime.js`
- `advisor-os/sales-pipeline/pipeline-nash-combat-adapter.js`
- `advisor-os/sales-pipeline/pipeline-csv-export.js`
- `advisor-os/event-evidence/productive-ui-projection-binding.js`
- `platform/event-evidence/bridge-to-canonical-event-adapter.js`
- `platform/event-evidence/passive-capture-bridge-contract.js`
- `platform/event-evidence/canonical-activity-event-contract.js`
- `advisor-os/activity/domain/activity-record.mjs`
- `advisor-os/activity/application/activity-repository-port.mjs`
- `advisor-os/activity/application/activity-feed-projector.mjs`
- `advisor-os/activity/application/activity-period-aggregator.mjs`
- `advisor-os/activity/application/fes-event-to-activity-projector.mjs`
- `advisor-os/activity/infrastructure/activity-persistence-codec.mjs`
- `advisor-os/activity/infrastructure/supabase-activity-repository.mjs`
- `advisor-os/activity/runtime/activity-read-runtime.mjs`
- `advisor-os/activity/runtime/browser-activity-composition.js`
- `advisor-os/performance/application/performance-score-projector.mjs`
- `advisor-os/performance/application/performance-read-model-projector.mjs`
- `advisor-os/performance/domain/performance-scoring-policy.mjs`
- `advisor-os/performance/runtime/performance-period-runtime.mjs`
- `advisor-os/performance/runtime/performance-read-runtime.mjs`
- `advisor-os/performance/runtime/supabase-performance-read-runtime.mjs`

### Validation and CI

- `tests/fes-05c-bridge-to-canonical-event-adapter-test.mjs`
- `tests/fes-08-productive-pipeline-integration-test.mjs`
- `tests/fes-08a-fes-activity-lineage-bridge-test.mjs`
- `tests/fes-08a-browser-activity-parity-test.mjs`
- `tests/pipeline-csv-export-test.mjs`
- `tests/fixtures/fes-08-productive-pipeline-browser.html`
- `tests/fes-08-productive-pipeline-browser-test.mjs`
- `.github/workflows/fes-event-evidence-ci.yml`

Mutation of any other path requires a new Constitutional Gate declaration and
must stop before that mutation.

## Protected surfaces

- `main`
- Nash protected checkout and legacy engines
- Activity and Performance worktrees
- UI Material 3 worktree
- Cotizaciones
- database schemas and migrations
- Supabase tables
- Performance policy and direct Performance state
- global Forge Alive redesign
- Nav Pill markup or item count
