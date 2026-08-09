# Phase005A — Person authority reconciliation

PERSON_SURFACE=EXISTING_SURFACE
PERSON_SURFACE_OWNER=AURA_PIPELINE_PROSPECT_CONTEXT

Person is a canonical commercial identity, not a new workspace requirement.

## Canonical authority
CARTERA 010B provides:
- `commercial_people` canonical advisor-owned Person records.
- `commercial_source_identity_links` governed source-to-Person links.
- `identity_resolution_decisions` explicit resolution lineage.
- `policy_roles` governed Person↔Policy roles.

## Current read consumer
`advisor-os/sales-pipeline/crs-03-pipeline-person-convergence-service.js` is the productive Pipeline↔Person convergence boundary. It authenticates the Supabase user, reads the productive Prospect, loads at most one active identity link, verifies a CONFIRMED Person owned by the same advisor, verifies the identity decision lineage, and emits `LINKED` or `UNRESOLVED`.

It explicitly disables automatic identity resolution, automatic opportunity creation, automatic stage advance, identity mutation and domain-link persistence.

## Historical names
The Phase005 conceptual names `commercial_person_profile_read`, `commercial_relationship_edge_read`, `commercial_person_coverage_read`, and `commercial_segment_membership` are not recreated. Their intended read concerns must be fulfilled only by current canonical CARTERA/Relationship authorities where available. Missing concerns degrade instead of being inferred.

PERSON_AUTHORITY=RESOLVED
PERSON_CONSUMER=RESOLVED_EXISTING_CRS03
