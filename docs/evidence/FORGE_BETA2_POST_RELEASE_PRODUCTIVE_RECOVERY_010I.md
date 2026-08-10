# FORGE BETA 2 — POST-RELEASE PRODUCTIVE RECOVERY 010I

## Identity

- Phase: `FORGE_BETA2_POST_RELEASE_PRODUCTIVE_RECOVERY_010I`
- Parent release: `FORGE_BETA_2_PRODUCTIVE_COMMERCIAL_LOOP`
- Base production SHA: `0174c11c407ae2b39256868fc8b05a5aefead3a0`
- Trigger: human production acceptance after 010H canonical Aura cutover.

## Observed production defects

1. Cartera displayed three attention signals for one canonical Policy: one incomplete-policy signal plus two pending Evidence Packet signals.
2. `Revisar documento` rendered an Evidence Packet reference through the generic `data-open-policy` path, causing `loadPolicyWorkspace(packetReference)` and a governed Policy read failure.
3. Reopening a confirmed Policy projected canonical Policy, roles, coverages and payment calendar, but did not project the already-persisted `policy_evidence_versions.field_claims` / provenance used to confirm the Policy.
4. Policy roles could render raw `INSURED` / `POLICY_OWNER` labels because participant person IDs were not projected back to confirmed CommercialPerson display labels.
5. Pipeline quick contact only read `prospects.phone_normalized/whatsapp_normalized`; a Prospect already converged to a confirmed CommercialPerson could therefore show disabled WhatsApp/call even when `commercial_people.verified_phone` existed.
6. Cartera's mixed directory reported `2 resultados`, which could be misread as two Policies even when Panorama correctly reported one canonical Policy.

## Root-cause classification

### Not a duplicate Policy truth

`Panorama` derives its Policy count from `canonical_policies.length`. The observed production UI reported `1 Pólizas`. The separate `2 resultados` belongs to the mixed Person/Account/Policy directory and is a presentation ambiguity, not evidence of duplicate canonical Policy persistence.

### Broken Evidence action routing

`deriveAttention()` correctly distinguishes `action.type = 'review'` for pending Evidence Packets. The base Aura Cartera renderer collapsed every non-`none` action into `data-open-policy`, losing that type boundary. 010I intercepts `POLICY_PACKET:AURA:*` before the base Policy opener and opens a read-only Evidence Packet review instead.

### Evidence exists but was not projected

CARTERA-010B persists confirmed `fieldClaims` and `provenance` in `policy_evidence_versions`, and `policy_versions.evidence_version_id` links the current Policy version to that evidence. 010I follows that existing lineage at read time. It does not create a second evidence or Policy truth owner.

### Contact exists behind confirmed identity convergence

010I only uses `commercial_people.verified_phone` when an active `commercial_source_identity_links` record explicitly connects `source_identity_type = PROSPECT` to a `CONFIRMED` CommercialPerson. No name matching and no automatic identity merge are introduced.

## Implementation

### Cartera adapter v11

`docs/static-preview/forge-aura/cartera/cartera-adapter-pages-v11.js`

- wraps v10;
- rebuilds `loadHome()` so duplicate/stale pending review signals are deduped and a review is suppressed only when durable 020C reports `CONFIRMED`;
- fails open if durable review status cannot be verified;
- enriches Policy Workspace roles from confirmed CommercialPerson IDs;
- follows `canonical_policies -> policy_versions -> policy_evidence_versions` and returns read-only Evidence Version metadata + `fieldClaims` + provenance;
- exposes read-only Evidence Packet retrieval for still-pending review actions.

### Cartera module v6

`docs/static-preview/forge-aura/cartera/cartera-module-v6.js`

- wraps v5 rather than replacing the productive module;
- capture-intercepts `POLICY_PACKET:AURA:*` actions so Evidence references never enter the Policy opener;
- renders read-only evidence review;
- appends a clearly separated `Documento y evidencia recuperada` section to Policy Workspace;
- changes mixed directory count copy to typed counts such as `1 persona · 1 póliza`.

### Pipeline adapter v2

`docs/static-preview/forge-aura/pipeline/pipeline-adapter-pages-v2.js`

- wraps the existing productive Pipeline adapter;
- preserves Prospect contact as first authority;
- if Prospect contact is absent, follows an already-confirmed active PROSPECT identity link and uses `commercial_people.verified_phone` as a read-only contact fallback;
- existing human-initiated `wa.me` and `tel:` behavior remains unchanged;
- no message or call is executed autonomously.

## Constitutional and authority boundaries

- `UNKNOWN != 0`: preserved.
- `EXTRACTION != EVIDENCE != TRUTH`: strengthened by separating Evidence Packet review and confirmed Policy facts.
- `NO_AUTO_IDENTITY_MERGE`: preserved; contact fallback requires an existing confirmed identity link.
- `NO_AUTONOMOUS_COMMERCIAL_EXECUTION`: preserved; WhatsApp/call remain user-initiated navigation.
- Policy authority remains `canonical_policies` / governed CARTERA writers.
- Evidence authority remains Evidence Packet / Policy Evidence Version.
- No fourth rebuild: wrappers reuse v5/v10/v1 and existing authorities.

## Mutation seal

```text
NEW_ENGINE_CREATED=0
NEW_GLOBAL_SCORE_CREATED=0
DUPLICATE_TRUTH_OWNER_CREATED=0
DUPLICATE_IDENTITY_OWNER_CREATED=0
DATABASE_MUTATION=0
SCHEMA_MUTATION=0
RLS_MUTATION=0
SUPABASE_DOMAIN_MUTATION=0
AUTO_IDENTITY_MERGE=0
AUTONOMOUS_COMMERCIAL_EXECUTION=0
PRODUCTIVE_DOMAIN_MUTATION=0
PRESENTATION_READ_RECOVERY_MUTATION=1
```

## Release governance

```text
AUTO_MERGE=NO
AUTO_DEPLOY=NO
HUMAN_REVIEW_REQUIRED=YES
```

010I may reach `MERGE_READY=YES` only after its dedicated governing CI succeeds on the exact PR head. Production deployment remains a separate explicit exact-SHA action.
