# FORGE CARTERA — POLICY OPERATIONS RUNTIME AND TEST MATRIX 001

Forge OS  
Cartera Existing Asset Audit  
Track A / Runtime and Test Matrix

## Status

`COMPLETE / PASSES_1_2_3_4_5_6_RECONCILED / BUILD_ONLY_QUEUE_LOCKED / CARTERA_001A_NEXT / NO_RUNTIME_MUTATION`

## Date

2026-07-30

## Canonical audit documents

- `FORGE_CARTERA_EXISTING_ASSET_AUDIT_AND_RECONCILIATION_001.md`
- `FORGE_CARTERA_LEGACY_RUNTIME_RECONCILIATION_002.md`
- `FORGE_CARTERA_POLICY_DOCUMENT_INTAKE_RECONCILIATION_003.md`
- `FORGE_CARTERA_POLICY_PERSISTENCE_IDENTITY_PARTY_RECONCILIATION_004.md`
- `FORGE_CARTERA_POLICY_DETAIL_TIMELINE_RENEWALS_TASKS_RECONCILIATION_005.md`
- `FORGE_CARTERA_FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK_006.md`

This matrix records verified runtime position, tests, authority and reuse disposition. File existence alone is not productive-runtime proof. The Pass 6 build-only queue is the final execution-order authority when older planning wording conflicts with this matrix.

---

# 1. Status vocabulary

## Runtime

- `PRODUCTIVE_CONNECTED`: current application consumer proved.
- `LEGACY_CONNECTED`: live through legacy route or persistence.
- `LOCAL_STATIC_READ_ONLY`: executable fixture/reference adapter with effects blocked.
- `FOUNDATION_ISOLATED`: executable foundation without productive integration.
- `FOUNDATION_ORPHANED`: internally coherent stack without productive entrypoint.
- `CONTRACT_TESTED`: canonical contract with source tests inspected.
- `ARCHITECTURE_LOCKED`: concept ratified as foundation; productive runtime not proved.
- `ARCHITECTURE_ONLY`: documented authority; no productive runtime proved.
- `UNVERIFIED`: direct behavior remains to inspect.

## Tests

- `TEST_VERIFIED`: source test and intended assertions inspected.
- `SUITE_REGISTERED`: included in a repository test suite.
- `DOCUMENTED_PASS`: implementation evidence records bounded PASS; not rerun in this audit.
- `CONDITIONAL_REAL_FIXTURE`: runs only when a local fixture exists.
- `STATIC_SECURITY_PASS_REPORTED`: static security result documented; live execution not proved.
- `NO_TEST_PROVED`: no test proved in this audit.

## Disposition

- `REUSE_CANONICAL`
- `REUSE_WITH_ADAPTER`
- `REUSE_WITH_CANONICAL_BRIDGE`
- `REUSE_SECURITY_PATTERN`
- `REUSE_ENVELOPE_ONLY`
- `REFACTOR_FOUNDATION`
- `REBUILD_CANONICAL_GAP`
- `LEGACY_SURFACE_MIGRATE`
- `REUSE_UI_PATTERN_ONLY`
- `REUSE_PRIMITIVE_ONLY`
- `DO_NOT_ACTIVATE`
- `DO_NOT_PROMOTE`

---

# 2. Relationship Intelligence

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `relationship-timeline-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REUSE_WITH_ADAPTER` | Future projection only; never replace Event & Evidence; separate facts, schedules and recommendations. |
| `relationship-next-action-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REFACTOR_FOUNDATION` | Candidate actions only; NBA owns final priority; replace automatic referral requests. |
| `relationship-opportunity-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `DO_NOT_ACTIVATE` | Output review candidates, preserve unknown/external coverage and require advisor-confirmed Pipeline write. |
| `life-event-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REFACTOR_FOUNDATION` | Distinguish profile state from a new event; add date, source, freshness and sensitivity. |
| `referral-opportunity-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REFACTOR_FOUNDATION` | Reframe as relationship-strengthening candidate; never infer consent. |
| `relationship-health-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REFACTOR_FOUNDATION` | Split operational attention from actual relationship health. |
| `client-engagement-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REFACTOR_FOUNDATION` | Relationship-specific cadence; no history is not critical deterioration. |
| `relationship-review-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REUSE_WITH_ADAPTER` | Produce governed Review Brief with evidence and sensitive-topic sections. |
| `relationship-master-engine.js` | `FOUNDATION_ISOLATED` | legacy test reported | `REUSE_WITH_ADAPTER` | Orchestrate reconciled engines; remove meaningless aggregate confidence. |

---

# 3. Legacy Cartera runtime

## Productive call graph

```text
app.js
→ platform/routing/route-registry.js
→ cartera route
→ cartera.js
→ legacy/quarantine/crmaddlife-indexeddb
```

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `app.js` | `PRODUCTIVE_CONNECTED` | no Cartera-specific test proved | `REUSE_CANONICAL` entrypoint evidence | Preserve route wiring during migration. |
| `route-registry.js` | `PRODUCTIVE_CONNECTED` | no Cartera-specific test proved | `REUSE_CANONICAL` route contract | Preserve route ID `cartera`. |
| `cartera.js` | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `LEGACY_SURFACE_MIGRATE` | Preserve list/search/KPI/import behavior; replace direct storage, delete and writes. |
| isolated modular Cartera stack | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | selective reuse | Reuse forms, header aliases, validation and state patterns; never activate wholesale. |
| quarantined IndexedDB | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Compatibility fallback only; never Person, Policy or Event truth. |

---

# 4. Canonical Evidence Inbox and confirmation backbone

| Asset | Runtime | Tests | Disposition | Required Cartera use |
|---|---|---|---|---|
| `evidence-source.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Every admitted file begins here. |
| `evidence-inbox-item.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Productive queue projects Inbox items. |
| `evidence-processing-status.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Only `confirmed` may create operational truth. |
| `evidence-extraction-candidate.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | OCR/parser output becomes candidate, never Policy row. |
| `evidence-inbox-router-contract.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Policy candidate routes to Policy Evidence Packet. |
| `policy-evidence-packet.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Extend with identity, parties, provenance and conflicts. |
| `evidence-confirmation-task.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Drive advisor/operator review. |
| `evidence-inbox-scope-gate.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Apply to view, confirm, route and archive. |
| `policy-advisor-confirmation-gate.js` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_WITH_ADAPTER` | Identity-aware confirmation before canonical Policy command. |

## Locked intake backbone

```text
EvidenceSource
→ EvidenceInboxItem
→ EvidenceExtractionCandidate
→ PolicyEvidencePacket
→ identity and PolicyRole review
→ EvidenceConfirmationTask
→ AdvisorConfirmationGate
→ confirmed Policy command
```

`NO_NEW_GENERIC_INTAKE_FRAMEWORK=YES`

---

# 5. Policy document extraction foundations

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `policy-ocr-engine.js` | `FOUNDATION_ISOLATED` | `CONDITIONAL_REAL_FIXTURE + SUITE_REGISTERED` | `REUSE_WITH_ADAPTER` | Local extraction adapter only; add neutral envelope, hash, provenance, scope and timeout. |
| `policy-ai-parser.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | Replace with evidence-aware carrier/document parser registry. |
| `policy-document-classifier.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Add confidence, matched evidence and ambiguity. |
| `policy-schema-validator-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Validate canonical dates, enums, parties, evidence, conflicts and completeness. |
| `policy-normalization-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Raw helpers only; never confirmed Policy shape. |
| staging cache and import queue | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REBUILD_CANONICAL_GAP` | Persistent Evidence Inbox projection, scoped and resumable. |
| `policy-batch-processing-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve sequential processing and per-file isolation. |
| `policy-ingestion-orchestrator.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Replace with governed orchestrator; current functions do not compose directly. |

Quote Preview PDF routing, parser ownership, provenance and regression patterns remain `REUSE_WITH_ADAPTER`. Accepted-quote packets and projected values must not be promoted as Policy Truth.

---

# 6. Identity authority and persistence

| Asset / authority | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| Shared Commercial Model: `CommercialPerson` | `ARCHITECTURE_LOCKED` | foundation review documented | `REUSE_CANONICAL` | Implement durable identity schema, contract, persistence and repository. |
| Shared Commercial Model: `CommercialAccount` | `ARCHITECTURE_LOCKED` | foundation review documented | `REUSE_CANONICAL` | Implement family/household/business accounts and memberships. |
| `advisor-prospect-identity-v1.schema.json` | `CONTRACT_TESTED` | `TEST_VERIFIED` | `REUSE_WITH_CANONICAL_BRIDGE` | Preserve Prospect identity/source lineage and map it to CommercialPerson. |
| `prospect-identity-contract.js` | `CONTRACT_TESTED` | `TEST_VERIFIED` | `REUSE_WITH_CANONICAL_BRIDGE` | Add identity-resolution result and durable-person link outside Sales ownership. |
| `schemas/prospect.schema.json` | compatibility | no governed identity proof | `DO_NOT_PROMOTE` | Legacy input compatibility only. |
| Prospect migration/RLS patterns | repository foundation | static security pass reported | `REUSE_SECURITY_PATTERN` | Reuse ownership, archive and RLS patterns; do not treat as CommercialPerson schema. |

## Final identity decision

```text
CommercialPerson = durable identity authority
Prospect reference = stable Sales-domain reference and continuity link
```

No automatic merge. No destructive rename. No new person before match review. Older roadmap wording that called `prospect_uuid` the universal canonical identity is superseded.

---

# 7. Policy and PolicyRole authority

| Asset / authority | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| ADR-006 Policy Truth Boundary | `ARCHITECTURE_LOCKED` | n/a | `REUSE_CANONICAL` | Govern all Policy claims, evidence, freshness, unknown and conflict behavior. |
| `schemas/policy.schema.json` | compatibility schema | no canonical persistence test proved | `DO_NOT_PROMOTE` | Replace single `clientId` with PolicyRole, evidence, period, version, freshness and conflicts. |
| Shared Commercial Model: `PolicyRole` | `ARCHITECTURE_LOCKED` | foundation review documented | `REBUILD_CANONICAL_GAP` runtime | Implement Policy Party schema, contract, persistence, privacy and tests. |
| Policy persistence tables/repository | not found | none | `REBUILD_CANONICAL_GAP` | Build governed Policy and PolicyRole persistence with RLS and commands. |
| Policy evidence/version/conflict persistence | not found | none | `REBUILD_CANONICAL_GAP` | Preserve field evidence, as-of time, versions, corrections and unresolved conflicts. |

Minimum roles include Policy Owner, Insured, Additional Insured, Payor, Beneficiary, Advisor of Record, Originating Advisor and Servicing Advisor. Compensation and manager attribution remain separate authorities.

---

# 8. Event & Evidence persistence

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| Prospect Timeline migration/service | governed Prospect ledger | tests and closure reported | `REUSE_WITH_ADAPTER` | Project Policy commercial meaning to person timeline; never store Policy Truth as Prospect-owned payload. |
| FES Activity Event Ledger | persistent append-only ledger and sync runtime | migration/gateway/browser/sync tests present | `REUSE_CANONICAL` pattern | Extend or specialize FES contracts for Policy subjects and events. |
| Policy event contract/ledger | not found | none | `REBUILD_CANONICAL_GAP` | Add FES-compatible Policy events, evidence, correction, idempotency, RLS and projections. |

Current FES database subject types do not already provide Policy support. No new generic event infrastructure may be created.

---

# 9. Policy Read Model

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `policy-read-model-adapter-068b.js` | `LOCAL_STATIC_READ_ONLY` | `TEST_VERIFIED` | `REUSE_ENVELOPE_ONLY` | Preserve safety, freshness, evidence and blocked-effect envelopes; replace fixture source after canonical persistence. |

The current adapter does not claim Policy Truth and must remain read-only until productive Policy persistence exists.

---

# 10. Policy Detail, Timeline, renewals, risk, alerts and actions

## 10.1 Policy Detail

| Asset group | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| detail/workspace/view/summary composition | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Consume canonical read models; support PolicyRole, evidence, freshness, conflicts and unknown. |
| search/filter/sort/indexing/side-by-side | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Immutable operations over productive projections. |
| detail/core/status/metadata/validation | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Remove `clientId`, default zero/MXN/ACTIVE/manual and weak readiness validation. |
| `policy-detail-alert-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Project sourced alerts with fact/prediction distinction, confidence and required action. |
| memory/local storage and auto approval | isolated unsafe persistence/decision | `NO_TEST_PROVED` | `DO_NOT_PROMOTE / DO_NOT_ACTIVATE` | Never Policy authority or human-confirmation replacement. |

## 10.2 Policy Timeline

| Asset group | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| group/query/view/activity helpers | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Read immutable FES-compatible Policy projections; fix mutation and dependency errors. |
| timeline engine/event factory/repository/types | mutable local arrays | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Replace with append-only Policy event contract, evidence, idempotency and corrections. |

The legacy repository permits deletion and mixes facts, communications, tasks, payments and commission. It is not historical authority.

## 10.3 Renewals and payments

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `initial-renewal-classifier.js` | executable canonical foundation | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Preserve blocked/unknown and Rule Pack-required classifications. |
| `policy-renewal-engine.js` | date-window filter | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Inject clock/timezone, validate dates and consume canonical schedules. |
| renewal status/intelligence foundations | fixed thresholds/scores | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Split dates, relationship cadence and Conservation interpretation. |
| Payment Evidence + Payment Event | evidence/economic foundation | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Feed confirmed payments and obligation reconciliation. |
| Payment Obligation Ledger | not found | none | `REBUILD_CANONICAL_GAP` | Build expected/actual period-aware obligations and confirmation states. |

## 10.4 Conservation risk and alerts

| Asset / authority | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| Conservation Intelligence Architecture Lock | `ARCHITECTURE_LOCKED` | n/a | `REUSE_CANONICAL` | Own local predictive Policy Quality and Conservation Risk. |
| `policy-risk-engine.js` | unvalidated fixed score | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Candidate features only under Conservation. |
| `policy-relationship-score-engine.js` | activity-count score | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | Contact volume is not relationship health or conservation truth. |
| `policy-last-contact-engine.js` | legacy event filter | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Consume canonical communication/outcome events and relationship cadence. |

## 10.5 Review

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `policy-review-priority-engine.js` | low-confidence field selector | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` under Evidence Inbox | Use packet field states, source location, identity/party conflicts and sensitivity. |
| `policy-review-ui-engine.js` | editable import preview | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Drive from Policy Evidence Packet. |
| Policy Review Brief | not found | none | `REBUILD_CANONICAL_GAP` | Combine Policy Truth, obligations, service, relationship context and sensitive-topic boundaries. |

## 10.6 Due Actions and task foundations

| Asset / group | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| NFAST-09 Due Action contract/store/sync/gateway | productive Prospect-scoped runtime | writer/runtime/offline/sync/RLS tests and closures | `REUSE_CANONICAL` operating model | Generalize subject authority without breaking Pipeline adapter. |
| Pipeline Due Action writer/runtime | `PRODUCTIVE_CONNECTED` | `TEST_VERIFIED + DOCUMENTED_PASS` | `REUSE_WITH_CANONICAL_BRIDGE` | Map `prospectReference` to generic `subjectType=PROSPECT`. |
| Policy/task factories and realtime object merge | isolated mutable records | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Use governed Due Action commands. |
| task feed/overdue/quick-action helpers | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Read Due Action projections; do not own writes. |
| task priority/follow-up foundations | fixed thresholds | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Candidate features only; NBA owns final explained priority. |
| auto-task and AI task suggestion engines | automatic/generic suggestions | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | No automatic task creation or line-of-business cross-sell. |
| Google Calendar helper | local payload/link builder | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Require separate Calendar Intent, approval and adapter. |

### Due Action decision

```text
CURRENT_RUNTIME=PROSPECT_SCOPED
TARGET_CORE=SUBJECT_TYPE_PLUS_SUBJECT_REFERENCE
PIPELINE_COMPATIBILITY=REQUIRED
FAKE_PROSPECT_FOR_IMPORTED_POLICY=FORBIDDEN
AUTOMATIC_TASK_CREATION=BLOCKED
```

---

# 11. Construction gaps and queue ownership

All 34 confirmed construction gaps are assigned in:

- `FORGE_CARTERA_FINAL_RECONCILIATION_AND_BUILD_ONLY_QUEUE_LOCK_006.md`, section 8.

Summary ownership:

- identity, account, Policy, PolicyRole, RLS, Policy events and productive read model: `CARTERA_010`;
- persistent intake, parser registry, identity/party review and confirmed Policy flow: `CARTERA_020`;
- Renewal Schedule and Payment Obligation Ledger: `CARTERA_030`;
- relationship memory and Policy Review Brief: `CARTERA_040`;
- Conservation runtime, Cartera Signal and Future Radar: `CARTERA_050`;
- relationship growth signals and Pipeline handoff: `CARTERA_060`;
- generic Due Actions, NBA integration and Candy Crush projection: `CARTERA_070`;
- email/payment/Compensation connection: `CARTERA_080`;
- Relationship Graph runtime and relationship capital: `CARTERA_090`;
- productivity proof and safe learning: `CARTERA_100`.

`UNMAPPED_CONSTRUCTION_GAPS=0`

---

# 12. Track A final status

- Pass 1 — Relationship and inventory classification: `COMPLETE`
- Pass 2 — Legacy Cartera runtime reconciliation: `COMPLETE`
- Pass 3 — Policy document intake reconciliation: `COMPLETE`
- Pass 4 — Policy persistence, identity and Policy Party authority: `COMPLETE`
- Pass 5 — Policy Detail, Timeline, renewals, risk, alerts and tasks: `COMPLETE`
- Pass 6 — Final reconciliation and build-only queue lock: `COMPLETE`

## Final locked decisions

```text
TRACK_A=COMPLETE
CARTERA_000=COMPLETE
FORMAL_PHASES=12
FORMAL_SUBPHASES=48
BUILD_ONLY_QUEUE=LOCKED
CANONICAL_IDENTITY=COMMERCIAL_PERSON
PROSPECT_IDENTITY=STABLE_SALES_REFERENCE_AND_CONTINUITY_LINK
POLICY_PARTICIPATION=POLICY_ROLE_NOT_CLIENT_ID
POLICY_TRUTH_OWNER=POLICY_INTELLIGENCE
POLICY_DETAIL_SOURCE=CANONICAL_POLICY_READ_MODEL
POLICY_TIMELINE_SOURCE=FES_COMPATIBLE_POLICY_EVENTS
RENEWAL_CLASSIFICATION=TESTED_INITIAL_RENEWAL_CLASSIFIER
CONSERVATION_RISK_OWNER=CONSERVATION_INTELLIGENCE
FINAL_PRIORITY_OWNER=NBA_REASON_WHY
INTERNAL_ACTION_RUNTIME=DUE_ACTION_GENERALIZATION
AUTOMATIC_TASK_CREATION=BLOCKED
NEXT=CARTERA_001A_PIPELINE_QUOTE_EVENT_CONTRACT_DISCOVERY
```

No runtime implementation is authorized by this matrix. Starting `CARTERA_001A` requires a separate explicit task.