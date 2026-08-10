# FORGE BETA 2 — REAL PRODUCTION CONTRACT RECOVERY 010J

## Status

`PHASE=FORGE_BETA2_REAL_PRODUCTION_CONTRACT_RECOVERY_010J`

Parent deployed SHA: `9ecd5ae225482e4a40eebc4007d83668fd9c8c26`.

This hotfix exists because 010I passed a synthetic browser fixture but failed real production acceptance. 010J treats that as a gate-quality incident and tests the production row shapes instead of assuming simplified DTOs.

## Constitutional boundary

- no schema migration
- no RLS mutation
- no Supabase domain write
- no new Policy/Evidence/Identity truth owner
- no name-based identity matching
- no automatic identity merge
- no autonomous WhatsApp/call execution
- `EXTRACTION != EVIDENCE != TRUTH`
- `UNKNOWN != 0`

## Production authority correction

The approved productive Supabase authority is `rmlxigxysujsuwzgoimv`, as already ratified by `SUPABASE_PROJECT_AUTHORITY_INVENTORY.md`. The similarly named project `rgcolnioakzrdtsxwscp` is stale and must not be used for productive diagnosis.

## Real production-shape findings

The acceptance incident was reproduced against the approved production schema without changing data. Sensitive row identifiers and personal values are intentionally omitted from this evidence file.

### Pipeline contact

The productive Prospect row contains `phone_normalized`; `rowToProspect()` exposes it as `phoneNormalized`. The Pipeline card projection previously searched only `phone`/`whatsapp`, so a real phone could be present in Supabase while the UI rendered call and WhatsApp disabled. The linked `CommercialPerson.verified_phone` may legitimately be null and cannot be assumed as the only contact source.

010J preserves the Prospect's normalized contact through the card boundary. The user still initiates the call/message; no commercial execution is autonomous.

### Policy evidence recovery

The current Policy Version is linked to a `policy_evidence_versions` row whose `verification_state` is `CONFIRMED`. The productive `field_claims` contract stores fields with `confirmedValue` and, where applicable, `candidateValue`. 010I's UI reader searched for legacy `value`/`normalizedValue`, making a populated Evidence Version appear empty.

010J reads `confirmedValue` first and falls back to `candidateValue` only as visibly labeled evidence. Candidate evidence is never promoted to canonical Policy truth. Documentary coverage candidates are shown as evidence and remain distinct from canonical Policy Coverage rows.

### Identity continuity

The productive CommercialPerson and Pipeline Prospect already have an active `commercial_source_identity_links` record with `source_identity_type=PROSPECT` and `match_status=LINK_CONFIRMED`. The identity truth was correct; Cartera simply hid the continuity because an already-present Person entry suppressed the extra Pipeline directory candidate.

010J enriches that existing Person projection with `Pipeline vinculado` and exposes the linked Prospect context in Person Workspace. No matching by name occurs.

### Attention duplication

The productive Future Radar returns both an `INCOMPLETE_POLICY_DATA` signal and a person-level `RELATIONSHIP_REVIEW_DUE` signal. Cartera separately derives incompleteness directly from `canonical_policies`, so the same incomplete-Policy cause appeared twice before the person-level review signal was added.

010J suppresses only the Radar copy of `INCOMPLETE_POLICY_DATA` when the same canonical Policy already emits direct incompleteness attention. The separate relationship review remains visible because it is a different governed cause.

Home previously rendered both Radar signals as two rows with the same person name. 010J groups Home's Cartera focus projection by confirmed `personReference`, preserving the related signal types in one visible subject without changing the Radar authority or ranking engines.

### Mobile geometry

Long canonical references and evidence references were allowed to establish intrinsic width in Policy Workspace. 010J adds `min-width:0`, `overflow-wrap:anywhere`, mobile one-column facts/coverage layout, and a browser acceptance gate requiring document `scrollWidth == clientWidth` at 390 px.

## Required acceptance

- exact production-shape Node contracts pass
- existing Pipeline regression passes
- existing functional Cartera 012 and durable 020C regressions pass
- Chromium at 390 px proves:
  - Home groups same-person Cartera contexts
  - Cartera does not duplicate the Policy incompleteness cause
  - Prospect normalized phone enables user-triggered WhatsApp/call
  - Policy Workspace recovers confirmed/candidate evidence
  - five documentary coverage rows render as evidence
  - Person Workspace displays confirmed Pipeline identity continuity
  - no horizontal overflow
  - no runtime errors or critical local 4xx/5xx resources

`FINAL_ROBOCOP_010J=PASS` is required before merge. The user explicitly pre-authorized merge and production deployment for 010J in the incident conversation; workflow governance itself does not bypass the exact-SHA Pages deployment contract.
