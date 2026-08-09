# Phase005A — Identity integrity

## Canonical identities
- `prospect_id`: owned by Pipeline `prospects`.
- `person_id`: internal UUID owned by CARTERA `commercial_people`.
- `person_reference`: stable commercial Person reference exposed by the Person authority.
- `policyholder_id`: not assumed equivalent to Person; policy ownership is expressed through governed `policy_roles`/policy authority.
- `relationship_id`: not synthesized by Pipeline; Relationship Intelligence owns relationship context.

## Only approved bridge
`Prospect → commercial_source_identity_links → identity_resolution_decisions → commercial_people`

The active link must be explicit and lineage-valid. No 005A code may match by display name, normalized name, phone, email or fuzzy similarity.

## States
- Confirmed active link → `LINKED`.
- No active link → `UNRESOLVED` and partial signal state.
- Multiple active links / owner mismatch / lineage mismatch → hard error from CRS-03; consumer must not choose a winner.

## Security
CRS-03 authenticates through `client.auth.getUser()` and reads owner-RLS-protected tables. CARTERA persistence uses advisor ownership and composite owner foreign keys. No service-role key, hardcoded user or RLS bypass is introduced.

IDENTITY_INTEGRITY=PASS
AUTO_MERGE=NO
HEURISTIC_MATCH=NO
