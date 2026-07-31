# Pipeline Stage Persistence In-Place Closure 067G17B4

Status: IMPLEMENTED / PRODUCTION_ACCEPTED / LOCKED

Date: 2026-07-31

## Purpose

Close the Productive Pipeline stage transition path as a real authenticated production capability without reloading the page or reconstructing the Pipeline module.

## Closed Production Contract

A Pipeline stage change now follows one governed path:

```text
User changes Stage select
-> pipeline-stage-rpc-authority.js captures the mutation
-> Supabase RPC forge_pipeline_update_prospect_stage
-> auth.uid() ownership validation
-> prospects.status update
-> NFAST Timeline STAGE_CHANGED event
-> confirmed row returned
-> same prospect card updated in place
-> filters reconciled against the same DOM truth
-> full reconciliation deferred until route exit or tab backgrounding
```

## Persistence Authority

- Canonical RPC: `forge_pipeline_update_prospect_stage`.
- Migration: `supabase/migrations/20260731000200_pipeline_prospect_stage_rpc.sql`.
- Only authenticated owners may mutate their prospect.
- Allowed stages are fail-closed and versioned in the runtime.
- The RPC returns the confirmed prospect row; UI success is not inferred from request completion alone.
- Timeline remains append-only and records `STAGE_CHANGED`.
- Timeline digest resolution was repaired by `supabase/migrations/20260731000300_pipeline_stage_timeline_digest_search_path_repair.sql`.

## In-Place UI Authority

- Runtime: `docs/static-preview/forge-alive-material3/pipeline-stage-rpc-authority.js`.
- Commit mode: `in-place`.
- The same card DOM node is retained after a successful mutation.
- Only the affected card dataset, select, label and visual accent are updated.
- No `AUTH_LOADING` state is entered during save.
- No `forge:auth-state-changed` event is emitted during save.
- The status notice is fixed/floating and does not alter layout geometry or scroll position.
- Failure restores the previously confirmed stage and exposes an explicit error state.

## Filter Coordination

- Runtime: `docs/static-preview/forge-alive-material3/pipeline-stage-filter-authority.js`.
- Source and Stage filtering operate on the already-confirmed card DOM truth.
- Filtering moves the same card nodes in and out of the visible grid; it does not rebuild the Pipeline module.
- The authority intentionally has no `MutationObserver` loop.
- Combined filters, empty state, clear action and counts remain consistent after a stage change.

## Reconciliation Boundary

A full authenticated reconciliation is allowed only after the immediate interaction has completed and the user:

- leaves the Pipeline route; or
- sends the tab to the background.

This preserves eventual remote synchronization without introducing a visible module refresh during the stage mutation.

## Deployment and Acceptance

Implementation chain:

- PR #33: authenticated owner-only stage RPC.
- PR #35: Timeline `digest()` search-path repair.
- PR #37: in-place stage commit and in-place filter authority.

Important commits:

- RPC and Timeline production closure: `f7410a1ecca4cace98817097bd93bdff35e0094a`.
- In-place product merge: `6e55d8c4e8d8d7d171f370bfaeb29c35e9e58738`.
- Final Pages acceptance contract and public deployment: `5fca4409457022c59c04937da52de83488a352e2`.

Public acceptance confirmed:

- exact deployed SHA;
- Stage RPC authority published;
- in-place commit authority published;
- in-place filter authority published;
- canonical Material 3 route active;
- legacy UI absent;
- retired legacy service worker.

Canonical route:

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/?nav=pipeline`

## Acceptance Gates

The final head passed:

- Pipeline Real Interaction Regression;
- Pipeline Mobile Interaction Regression;
- Manual Quotes and Pipeline Stability;
- Forge UI Visual Diagnostic across mobile, tablet and desktop;
- authenticated Supabase transition with Timeline creation inside a rollback transaction;
- public Pages exact-SHA acceptance.

The browser regression requires:

- same card node before and after save;
- zero authentication refresh events during save;
- no `AUTH_LOADING` state;
- no card or scroll movement;
- confirmed stage retained;
- filters operating against the updated stage.

## Boundaries Preserved

- Stage mutation does not imply automatic next-best-action execution.
- Stage mutation does not send WhatsApp messages.
- Stage mutation does not create appointments or tasks.
- Stage mutation does not alter prospect source.
- Stage mutation does not bypass ownership or RLS.
- Deferred reconciliation is not permission to refresh during the active save interaction.
- The floating mobile navigation remains intentional; layouts must continue reserving bottom safe space.

## Locked Decision

`067G17B4_PIPELINE_STAGE_PERSISTENCE_IN_PLACE=LOCKED`

`PRODUCTION_PERSISTENCE=PASS`

`MODULE_REFRESH_DURING_STAGE_SAVE=FORBIDDEN`

`SAME_CARD_DOM_IDENTITY=REQUIRED`

`FILTERS_AFTER_STAGE_SAVE=IN_PLACE_REQUIRED`
