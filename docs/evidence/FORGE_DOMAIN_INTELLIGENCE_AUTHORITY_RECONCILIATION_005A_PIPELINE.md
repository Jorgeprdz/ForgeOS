# Phase005A — Pipeline authority reconciliation

## Productive chain
`Aura Pipeline → pipeline-adapter.js → productive-prospect-service.js → Supabase Prospect authority / stage RPC`

The Aura adapter already performs productive Prospect reads, create/update/archive and stage transitions with read-after-write confirmation. Stage mutation is delegated to `forge_pipeline_update_prospect_stage`; UI does not own that rule.

## Decision-support chain after 005A
`Aura Pipeline → pipeline-adapter.js → pipeline-domain-intelligence-consumer.js → CRS-03 Person convergence + already-authoritative FCDP projections → FCDP composition`

The new consumer is deliberately read-only. It does not generate recommendations, scores, probabilities, priority, identity matches or mutations. It only joins an existing canonical convergence snapshot with FCDP projections supplied by their owning adapters/authorities.

## Preview fixture prohibition
`platform/adapters/opportunity-pipeline/*066b*` and `*067d*` remain preview/static. They are not imported by the productive consumer and are not treated as canonical truth.

## Legacy UI heuristic debt
`docs/static-preview/forge-aura/pipeline/pipeline-priority.js` currently contains local stale/priority/NBA presentation heuristics. 005A does not expand or bless them. Phase005 must consume the new boundary and retire/avoid those heuristics when activating intelligence.

## Opportunity limitation
CRS-03 reports `opportunityAuthority=NOT_PRODUCTIVE`; therefore Opportunity-specific intelligence remains degraded/not available. No replacement Opportunity engine or persistence is created.

PIPELINE_AUTHORITY_RESOLUTION=RESOLVED
PIPELINE_CONSUMER_BOUNDARY=RESOLVED_BY_005A
