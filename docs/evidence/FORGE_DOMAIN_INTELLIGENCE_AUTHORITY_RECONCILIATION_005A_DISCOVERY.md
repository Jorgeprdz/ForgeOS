# FORGE DOMAIN INTELLIGENCE AUTHORITY RECONCILIATION 005A — DISCOVERY

PHASE=FORGE_DOMAIN_INTELLIGENCE_AUTHORITY_RECONCILIATION_005A
BASE_PHASE005_HEAD=67d8a2b7169b0b738e73a16bc27ce6021352e53f
GATE_COMMIT=48553134d45bfa51ce9591d46529c5b402e529bd

## Method
Discovery followed the required chain `surface → current consumer → adapter → authority → projection → missing boundary`. Literal symbol names from the Phase005 contract were treated as hypotheses, not as permission to recreate historical APIs.

## Pipeline
- Product surface: `docs/static-preview/forge-aura/pipeline/`.
- Productive surface adapter: `docs/static-preview/forge-aura/pipeline/pipeline-adapter.js`.
- Productive Prospect authority: `advisor-os/sales-pipeline/productive-prospect-service.js` over Supabase `prospects`/`active_prospects` under advisor RLS.
- Productive stage mutation: `forge_pipeline_update_prospect_stage` RPC.
- Timeline authority: `advisor-os/sales-pipeline/prospect-timeline/`.
- Existing decision capabilities: `pipeline-stage-read-model.js`, `explained-sales-nba.js`, `prospect-due-action-priority-contract.js`.
- Existing Phase005-invalid preview adapters: `platform/adapters/opportunity-pipeline/opportunity-pipeline-read-only-adapter-066b.js` and `opportunity-pipeline-read-model-normalizer-067d.js`; both remain preview/static/candidate-only and are not promoted.
- Gap: current Aura adapter exposes productive Prospect reads/writes but no canonical read-only intelligence consumer; UI still contains legacy local priority/NBA heuristics in `pipeline-priority.js`.

Historical contract names reconcile to current authorities as follows:
- `buildPipelineAdvisor` → current governed read-model responsibility represented by `buildPipelineStageReadModel`.
- `advancePipelineAdvisor` → `forge_pipeline_update_prospect_stage` RPC.
- `getMovementRecommendations` → current explained recommendation responsibility represented by `generateExplainedSalesNba` where its evidence contract is satisfied.
- `runProspectBalance` / `productSuggestionsBySaleStage` were not ratified as new callable product authorities during 005A and MUST NOT be recreated merely to satisfy historical naming.

## Person / identity
The literal `commercial_person_profile_read`, `commercial_relationship_edge_read`, `commercial_person_coverage_read`, and `commercial_segment_membership` names are not the current repository API. Canonical Person authority exists under CARTERA 010B:
- `commercial_people`
- `identity_resolution_decisions`
- `commercial_source_identity_links`
- `policy_roles`
- governed identity-resolution RPCs and owner-scoped role reads in `supabase/migrations/202607310002*.sql`.

The existing productive consumer boundary is `advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js`. It reads the authenticated Prospect, active confirmed identity link, canonical Person and decision lineage. It does not resolve identity by name, phone or email.

PERSON_SURFACE=EXISTING_SURFACE
PERSON_SURFACE_OWNER=AURA_PIPELINE_PROSPECT_CONTEXT

## Cross-domain projection
Canonical projection layer:
- `platform/decision-projection/forge-cross-domain-decision-projection.js`
- `platform/decision-projection/forge-cross-domain-decision-adapters.js`

FCDP is read-only and explicitly cannot create truth, score, priority, confidence, impact, persistence or automatic execution. Source-specific adapters preserve source ownership for Relationship, NASH, Opportunity, MICK, Forecast and Revenue.

## Authority ownership
`source-ownership-registry.js` ratifies Relationship Intelligence (ADR-011), NASH (ADR-010) and NBA (ADR-009) ownership. Relationship context is not permission/intention, NASH is not client truth, and NBA is not a mandate. Aura remains the presentation authority under ADR-024 without becoming domain authority.

APPLICABLE_ADRS=ADR-009,ADR-010,ADR-011,ADR-024

## Reference-only verticals
- Cartera: `platform/portfolio-intelligence/cartera-050c-authority-adapters.js → cartera-050a-future-radar-projection.js → cartera-050d-future-radar-view.js`.
- Activity: `platform/productivity/activity-points-authority-adapter.mjs` and existing productivity contracts.
- Forecast: `manager-os/forecast/*v3*`; authority unchanged.
- Revenue: `platform/compensation/advisor-compensation-070-view.js`; authority/formulas unchanged.

## Remaining limitation
`crs-03-pipeline-person-convergence-service.js` explicitly reports `opportunityAuthority: NOT_PRODUCTIVE`. 005A will not create an Opportunity authority. Opportunity-specific intelligence must remain unavailable/degraded until a separately governed productive authority exists. This does not prevent safe Pipeline↔Person convergence or consumption of already-authoritative FCDP projections from other domains.

DISCOVERY_VERDICT=IMPLEMENT_THIN_CONSUMER_BOUNDARY
