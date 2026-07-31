# Pipeline Stage Persistence In-Place Certificate 067G17B4

Phase: 067G17B4_PIPELINE_STAGE_PERSISTENCE_IN_PLACE

Mode: PRODUCTION CLOSURE + SOURCE-TRUTH SYNC + BUILD TREE LOCK

Status: COMPLETED / PRODUCTION_ACCEPTED / LOCKED

Date: 2026-07-31

## Certified Capability

The Productive Pipeline can change a prospect Stage through an authenticated, owner-only Supabase RPC and keep the confirmed result without rebuilding the Pipeline module.

## Certified Runtime Chain

```text
Stage select
-> pipeline-stage-rpc-authority.js
-> forge_pipeline_update_prospect_stage
-> prospects.status
-> prospect_timeline_events / STAGE_CHANGED
-> confirmed prospect row
-> same card DOM node updated in place
-> pipeline-stage-filter-authority.js
```

## Database Evidence

- `supabase/migrations/20260731000200_pipeline_prospect_stage_rpc.sql`
- `supabase/migrations/20260731000300_pipeline_stage_timeline_digest_search_path_repair.sql`
- `scripts/deploy-pipeline-stage-rpc-migration.mjs`
- authenticated role transition verified inside a transaction;
- owner validation verified through `auth.uid()`;
- confirmed row matched requested prospect and Stage;
- Timeline `STAGE_CHANGED` event verified;
- rollback preserved original prospect and Timeline state.

## Runtime Evidence

- `docs/static-preview/forge-alive-material3/pipeline-stage-rpc-authority.js`
- `docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js`
- `tests/pipeline-stage-rpc-authority-regression.mjs`
- `tools/manual-ui-stability-check.mjs`

Required behavior verified:

- same card instance before and after save;
- Stage select remains on the confirmed value;
- card Stage dataset and accent update;
- zero `forge:auth-state-changed` events during save;
- no `AUTH_LOADING` state during save;
- no module reconstruction;
- no card displacement;
- no scroll jump;
- Source remains unchanged;
- Source/Stage filters remain functional after mutation;
- combined and empty filters preserve correct counts.

## CI Evidence

Final PR #37 head: `790d68c41a48a04bcf2026fb4d5fa5981cc67c4c`

All final gates passed:

- `Manual Quotes and Pipeline Stability` — PASS;
- `Pipeline Mobile Interaction Regression` — PASS;
- `Pipeline Real Interaction Regression` — PASS;
- `Forge UI Visual Diagnostic` — PASS.

Product squash merge:

`6e55d8c4e8d8d7d171f370bfaeb29c35e9e58738`

Final public deployment and acceptance SHA:

`5fca4409457022c59c04937da52de83488a352e2`

Pages evidence confirmed:

- `buildInfoExactSha=true`;
- `pipelineRouteReachable=true`;
- `stageRpcAuthorityPublished=true`;
- `stageCommitInPlacePublished=true`;
- `stageFiltersInPlacePublished=true`;
- `canonicalMaterial3Entry=true`;
- `legacyUiAbsent=true`;
- `legacyServiceWorkerRetired=true`.

## Human Acceptance

The production user confirmed that Stage now saves successfully. The remaining visible module refresh was then removed and the no-refresh implementation was deployed and locked.

## Regression Locks

The following are forbidden regressions:

- returning to a generic prospect update path for Stage;
- adding a second Stage mutation listener;
- emitting an authentication refresh event during save;
- replacing the Pipeline module or prospect card after a successful save;
- restoring the Stage from stale renderer memory;
- rebuilding cards to apply Source or Stage filters;
- allowing the old UI or legacy service worker to become a public authority.

## Build Tree Result

- Advisor OS Productive Pipeline Stage writer moves from blocked/preview-only to production accepted.
- Timeline integration remains append-only and evidence-bearing.
- Pipeline UI persistence and filtering move to in-place production authority.
- Legacy UI remains retired.

## Final Decision

`SEMAFORO=🟢 PASS`

`DECISION=LOCK_067G17B4_PIPELINE_STAGE_PERSISTENCE_IN_PLACE`

`PRODUCTION_STATUS=ACCEPTED`

`NEXT=CONTINUE_WITH_OTHER_PIPELINE_CAPABILITIES_WITHOUT_REOPENING_STAGE_AUTHORITY`
