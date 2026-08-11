# FORGE BETA 2 REAL USER ACCEPTANCE 013 — DISCOVERY

PHASE=FORGE_BETA_2_REAL_USER_ACCEPTANCE_AND_INTERPRETATION_RECOVERY_013
BASE_SHA=7f193b2a281e214037179fc14f24c724dc1df781
PRODUCTION_SHA=7f193b2a281e214037179fc14f24c724dc1df781
BRANCH=fix/forge-beta2-real-user-acceptance-interpretation-recovery-013
DISCOVERY_STATUS=ROOT_CAUSE_IN_PROGRESS
IMPLEMENTATION_READINESS=HOLD_RU08

## A. Runtime / governance

- main and latest GitHub Pages deployment resolve to the same exact SHA above.
- Article 0 is RATIFIED / ACTIVE.
- Constitution Map is LOCKED and preserves Evidence -> Authority -> Decision/Interaction -> Human Intelligence ordering.
- ROBOCOP LOCK 001 applies because the phase touches protected runtime/UI behavior.
- Canonical ADR namespace currently ends at ADR-026. No canonical ADR-027 was found.
- Existing NASH path already contains deterministic Conversation Brief plus bounded provider rendering. No second AI engine or provider is required.

## B. Shared root-cause map

1. **Intent propagation / safe degradation** — Conversation Workspace preserves selected goal into NASH, but Aura provider-failure fallback calls the deterministic renderer with only the prospect. The renderer defaults to `first_contact`, and its historical GOAL_COPY does not cover all registered goals. RU-02 therefore collapses distinct intents under provider failure.
2. **Human interpretation boundary missing at presentation** — Home and Pipeline consumer surfaces print internal truth/source/authority vocabulary directly. Relationship services already expose facts, uncertainty, smallestUsefulAction and evidence, but UI does not consistently convert that structured context into advisor-facing meaning. RU-03/RU-04/RU-06/RU-11/RU-12 share this cause.
3. **SPA lifecycle lacks cancellation/isolation** — the router emits concurrent transitions; app mount uses revision checks after awaited lifecycle steps but cannot cancel an unresolved prior unmount/import/mount. This permits indefinite loading and stale work. RU-05.
4. **Visible CTA not capability-gated** — Pipeline consumer bridge inserts “Ver contexto gobernado” for every local recommendation, including records without usable id/intelligence capability; click then returns or only disables after the fact. RU-07.
5. **Cartera exact-claim hotfix not consumed by runtime** — Phase 012 deployed the three-argument `forge_cartera020b_claim_evidence(..., p_inbox_reference)` overload, but current JS runtime contains no `p_inbox_reference` call. The PDF state-machine reclaims using the generic queue claim after each stage, so interactive processing can lose exact-item affinity. RU-09.
6. **Policy/document evidence presentation not reconciled** — current semantic adapter correctly keeps extraction evidence separate from Policy Truth and requires human confirmation, but the policy-facing presentation can independently render “no confirmed coverage detail” and confirmed document evidence without a single presentation state explaining the distinction. RU-10.
7. **Bitácora human path still open** — production table/migration/RLS/policies exist. A transaction-scoped authenticated rollback probe using an owned active prospect successfully executed journal INSERT plus Timeline trigger and left zero persisted test rows after rollback. Therefore backend schema/RLS/trigger are not the demonstrated root cause. The remaining failure lies in the authenticated browser/service path and requires exact request/error reproduction before implementation. RU-08 remains HOLD.
8. **Selector interaction contract mismatch** — current message type control is a native select. It requires an open/select interaction rather than direct one-action selection and is not a durable one-click intent control. RU-01.

## C. Source owners / likely files

- RU-01/RU-02: `docs/static-preview/forge-aura/pipeline/pipeline-conversation-workspace.js`, `pipeline-adapter-pages-v4.js`, existing NASH orchestrator/provider contracts.
- RU-03/RU-06/RU-07: `docs/static-preview/forge-aura/recomposition/pipeline-consumer-bridge-008.js` plus presentation-only helpers if needed.
- RU-04: existing CRS-10 / Cartera relationship-intelligence compositions; presentation consumer only.
- RU-05: `docs/static-preview/forge-aura/app-v4-r1.js`, existing `aura-router-v4.js` contract preserved.
- RU-08: `pipeline-journal-aura-011e.js` / `prospect-journal-service.js`; DB change currently NO.
- RU-09: `cartera-adapter-pages-v4.js` import chain and exact-claim runtime consumption; existing DB overload reused.
- RU-10: Cartera semantic/policy presentation composition, preserving ADR-005/006/025/026.
- RU-11: `home/home-module.js` presentation only; owners/read models remain unchanged.
- RU-12: reusable PRESENTATION contract only if existing consumers cannot share the current NASH interpretation path without creating a second engine.

## D. Explicitly prohibited

No Constitution/ADR rewrite; no truth-owner changes; no second Policy/Relationship/NASH engine; no new AI provider; no router replacement; no automatic WhatsApp; no automatic identity merge; no OCR-as-truth; no localStorage fake persistence; no service-role domain writes; no `location.reload()` routing fix; no hard-coded contextual recommendation dictionary.

## E. Infrastructure impact

DB_CHANGE_REQUIRED=NO_CURRENTLY
NEW_AI_PROVIDER_REQUIRED=NO
NEW_ENGINE_REQUIRED=NO
RLS_CHANGE_REQUIRED=NO_CURRENTLY

## F. Readiness

READY: RU-01/02/03/04/05/06/07/09/10/11/12 root-cause groups.
HOLD: RU-08 exact authenticated browser/service failure still must be captured.

No runtime implementation may begin while the global HOLD remains.