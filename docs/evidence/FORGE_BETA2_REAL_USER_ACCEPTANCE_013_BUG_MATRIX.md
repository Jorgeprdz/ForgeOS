# FORGE BETA 2 REAL USER ACCEPTANCE 013 — BUG MATRIX

PHASE=FORGE_BETA_2_REAL_USER_ACCEPTANCE_AND_INTERPRETATION_RECOVERY_013
BASE_SHA=7f193b2a281e214037179fc14f24c724dc1df781

Status vocabulary: REPRODUCED / ROOT_CAUSE / HOLD / FIXED / TESTED / PRODUCTIVE_PASS.

| ID | Reproduction / actual | Expected | Source owner / boundary | Root cause | Current status |
|---|---|---|---|---|---|
| RU-01 | message type is a native `<select>` interaction rather than direct one-action intent selection | one action selects, renders visual state and is ready to Generate | Conversation Workspace | control contract does not provide direct one-click selection state | ROOT_CAUSE |
| RU-02 | selected goal reaches NASH, but provider failure falls back via `deterministicCandidate(prospect)`; historical renderer defaults to first_contact and lacks collection/application_signature/custom | selectedIntent == intentConsumedByNash; safe degradation preserves selected intent | NASH brief/orchestrator + Aura adapter | fallback boundary drops conversationBrief/goal and silently substitutes generic copy | ROOT_CAUSE |
| RU-03 | default UI prints canonical/governed/authority language | explain concrete missing/pending information and user action | presentation consumers | structured internal state is rendered directly instead of interpreted for advisor | ROOT_CAUSE |
| RU-04 | relationship review can surface an abstract classification/label | materially different relationship facts produce materially different explanation/action candidate/no-action | CRS-10 + existing Cartera relationship services; presentation consumer | facts/uncertainty/smallestUsefulAction already exist but are not consistently composed into human presentation | ROOT_CAUSE |
| RU-05 | concurrent route transitions can wait forever on old unmount/import/mount; revision checks only run after awaits settle | 50 transitions, back/forward/rapid changes, no reload or infinite loading | `app-v4-r1.js` lifecycle; router contract preserved | no cancellation + no route-root isolation/settlement for obsolete transition promises | ROOT_CAUSE |
| RU-06 | Home/Pipeline/Cartera/workspace expose truthClass/sourceAuthority/CommercialPerson/consumer IDs/enums | default UI has zero technical leakage; traceability under closed disclosure | presentation layers | diagnostics/architecture are mixed with primary user copy | ROOT_CAUSE |
| RU-07 | Pipeline bridge inserts `Ver contexto gobernado` before checking id/capability; click can return silently or disable only after click | every visible CTA has observable effect | Pipeline consumer bridge | CTA rendered without capability/action gating | ROOT_CAUSE |
| RU-08 | user write path produced no persisted journal rows; table/migration/RLS/policies exist; authenticated transaction-scoped rollback probe successfully exercised INSERT + Timeline trigger without persistent row | write/read/reopen/reload; read failure must not destroy write path | Journal UI/service + authenticated browser path | backend persistence owner is viable; exact browser/service error still not captured | HOLD |
| RU-09 | exact-inbox claim overload exists in production DB, but repository runtime contains no `p_inbox_reference` call; v4 state machine reclaims via generic claim after each stage | exact PDF stays bound to exact inbox item through settlement | Cartera 020B adapter/state machine | Phase 012 migration hotfix was not wired into productive runtime import graph | ROOT_CAUSE |
| RU-10 | document coverage candidates/evidence and Policy Truth are rendered as independent statements, allowing human contradiction | one coherent presentation state distinguishes policy truth, document evidence, extraction candidate, pending reconciliation, unknown | Policy/Cartera read model + presentation | semantic separation exists, but presentation does not reconcile the two evidence classes | ROOT_CAUSE |
| RU-11 | Home prints Agenda canónica, Decision Projection, truth/source/uncertainty jargon in primary experience | card answers what it means / why it matters / what advisor can do | Home presentation; existing Attention owner preserved | owner payload displayed too literally; no advisor-facing interpretation step | ROOT_CAUSE |
| RU-12 | same systemic path leaks architecture language into humans | architecture language -> structured truth -> bounded interpretation -> human language | existing NASH/AI interpretation + presentation validation | missing reusable presentation contract/use of existing interpretation path; must not become second NASH | ROOT_CAUSE |

## Required evidence per bug

Every functional RU requires:
1. contract/unit,
2. integration/source-owner,
3. browser/real workflow.

Semantic tests validate invariants, not exact sentences: facts/source refs preserved; no invented claims; unknown remains unknown; no internal enum leak; selected intent preserved; allowed action registry only; materially different contexts may differ; AI unavailable degrades honestly; malformed/unsupported AI output rejected or downgraded.

## Productive acceptance gates

- RU-01 ONE_CLICK_SELECTION
- RU-02 selectedIntent == intentConsumedByNash; HUMAN_APPROVAL_REQUIRED=true; AUTO_SEND=false
- RU-04 at least three materially different relationship contexts
- RU-05 >=50 transitions; zero reload/infinite loading/uncaught rejection/dead shell
- RU-06 TECHNICAL_TRACEABILITY=PRESERVED; TECHNICAL_JARGON_DEFAULT_UI=ZERO
- RU-07 VISIBLE_DEAD_CTA_COUNT=0
- RU-08 write -> read-after-write -> close/reopen -> reload; read-failure write independence; A/B RLS
- RU-09 3 approved real PDFs, retry/transient failure/no zombie/no duplicate/RLS; if corpus unavailable, BLOCKED_MISSING_APPROVED_CORPUS
- RU-10 coverage presentation semantic invariant
- RU-11 three real Home states with materially context-sensitive interpretation
- RU-12 no second engine / no AI truth

No RU may be marked PASS from source-text assertions alone.