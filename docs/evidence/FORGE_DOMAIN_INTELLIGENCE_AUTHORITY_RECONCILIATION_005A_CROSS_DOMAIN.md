# Phase005A — Cross-domain provenance

Canonical contract: `FORGE_CROSS_DOMAIN_DECISION_PROJECTION` / `FCDP-004-001`.

005A reuses `platform/decision-projection/forge-cross-domain-decision-projection.js` and its source adapters. It creates no second projection model.

The consumer accepts only already-valid FCDP projections and delegates set validation/composition to `composeDecisionProjectionSet`. It does not invoke source engines with guessed inputs and does not calculate a winner.

Preserved properties include `truthState`, `priority`, `urgency`, `confidence`, `impact`, evidence, `provenance.sourceAuthorities`, source references, adapters, lifecycle and human-decision requirement.

FCDP boundaries remain:
- readOnly=true
- createsTruth=false
- createsScore=false
- calculatesPriority=false
- calculatesConfidence=false
- calculatesImpact=false
- automaticExecutionAllowed=false
- persistenceAllowed=false

Source ownership remains with Relationship/NASH/NBA/Opportunity/MICK/Forecast/Revenue authorities. The consumer only reads, validates, groups and exposes degraded state.

FCDP_REUSED=YES
PARALLEL_FCDP=NO
