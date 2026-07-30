# FORGE CARTERA — POLICY OPERATIONS RUNTIME AND TEST MATRIX 001

Forge OS  
Cartera Existing Asset Audit  
Track A / Runtime and Test Matrix

## Status

`ACTIVE / PASSES_1_2_3_RECONCILED / PERSISTENCE_IDENTITY_PARTY_AUDIT_NEXT / NO_RUNTIME_MUTATION`

## Date

2026-07-30

## Canonical audit documents

- `FORGE_CARTERA_EXISTING_ASSET_AUDIT_AND_RECONCILIATION_001.md`
- `FORGE_CARTERA_LEGACY_RUNTIME_RECONCILIATION_002.md`
- `FORGE_CARTERA_POLICY_DOCUMENT_INTAKE_RECONCILIATION_003.md`

This matrix records verified runtime position, tests, authority and reuse disposition. File existence alone is not productive-runtime proof.

---

# 1. Status vocabulary

## Runtime

- `PRODUCTIVE_CONNECTED`: current application consumer proved.
- `LEGACY_CONNECTED`: live through legacy route or persistence.
- `LOCAL_STATIC_READ_ONLY`: executable fixture/reference adapter with effects blocked.
- `FOUNDATION_ISOLATED`: executable foundation without productive integration.
- `FOUNDATION_ORPHANED`: internally coherent stack without productive entrypoint.
- `CONTRACT_TESTED`: canonical contract with source tests inspected.
- `ARCHITECTURE_ONLY`: authority documented; productive runtime not proved.
- `UNVERIFIED`: direct behavior remains to inspect.

## Tests

- `TEST_VERIFIED`: source test and intended assertions inspected.
- `SUITE_REGISTERED`: included in `tests/run-all-tests.js`.
- `DOCUMENTED_PASS`: implementation evidence records bounded PASS; not rerun in this audit.
- `CONDITIONAL_REAL_FIXTURE`: runs only when a local fixture exists.
- `NO_TEST_PROVED`: no test proved in this audit.

## Disposition

- `REUSE_CANONICAL`
- `REUSE_WITH_ADAPTER`
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
| `relationship-timeline-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REUSE_WITH_ADAPTER` | Treat as future projection; never replace Event & Evidence; separate facts, schedules and recommendations. |
| `relationship-next-action-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REFACTOR_FOUNDATION` | Candidate actions only; Alfred owns final priority; replace automatic referral requests. |
| `relationship-opportunity-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `DO_NOT_ACTIVATE` | Output review candidates, preserve unknown/external coverage, require advisor-confirmed Pipeline write. |
| `life-event-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REFACTOR_FOUNDATION` | Distinguish profile state from a new event; add date, source, freshness and sensitivity. |
| `referral-opportunity-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REFACTOR_FOUNDATION` | Reframe as relationship-strengthening candidate; never infer consent. |
| `relationship-health-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REFACTOR_FOUNDATION` | Split operational attention from actual relationship health. |
| `client-engagement-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REFACTOR_FOUNDATION` | Relationship-specific cadence; no history is not critical deterioration. |
| `relationship-review-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REUSE_WITH_ADAPTER` | Produce governed Review Brief with evidence and sensitive-topic sections. |
| `relationship-master-engine.js` | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | `REUSE_WITH_ADAPTER` | Orchestrate reconciled engines; remove meaningless aggregate confidence. |

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
| `cartera-view.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Reuse form/empty/loading patterns; do not activate beside live route. |
| `cartera-service.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve workflow semantics, replace persistence and effects. |
| `cartera-import-engine.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve Excel header aliases; output staged evidence candidates. |
| `cartera-normalizer.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Keep sanitation only; remove default truth and free-text ownership. |
| `cartera-validator.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | UI validation only, never Policy Truth validation. |
| `cartera-events.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Map legacy names to canonical append-only events after successful commands. |
| `cartera-state.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Local UI state only. |
| `cartera-repository.js` | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Reuse repository/cache ideas only after canonical persistence is selected. |
| quarantined IndexedDB | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Compatibility fallback only; never Person, Policy or Event truth. |

---

# 4. Canonical Evidence Inbox and confirmation backbone

| Asset | Key contract | Runtime | Tests | Disposition | Required Cartera use |
|---|---|---|---|---|---|
| `evidence-source.js` | upload/email/manual/integration source, advisor/org ownership, `createsTruth=false` | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Every admitted file begins here. |
| `evidence-inbox-item.js` | scope, status, warnings, blocked reason; forbids truth fields | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Productive queue projects Inbox items. |
| `evidence-processing-status.js` | received → classified → candidate → packet → confirmation → terminal state | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Only `confirmed` may create operational truth. |
| `evidence-extraction-candidate.js` | typed candidate, confidence, warnings, missing fields; never truth | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | OCR/parser output becomes candidate, never Policy row. |
| `evidence-inbox-router-contract.js` | policy/payment/statement route separation; unknown blocked | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Policy candidate routes to Policy Evidence Packet. |
| `policy-evidence-packet.js` | field state, confidence, source location, extraction method, confirmation | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Extend with identity, parties, document provenance and conflicts. |
| `evidence-confirmation-task.js` | actor, task type, status, no payout truth | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Drive advisor/operator review. |
| `evidence-inbox-scope-gate.js` | advisor/operator/scoped-manager access | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_CANONICAL` | Apply to every view/confirm/route/archive action. |
| `policy-advisor-confirmation-gate.js` | low-confidence checks, edits, reject/confirm, evidence refs | `CONTRACT_TESTED` | `TEST_VERIFIED + SUITE_REGISTERED` | `REUSE_WITH_ADAPTER` | Identity-aware confirmation before canonical Policy command. |

## Locked intake backbone

```text
EvidenceSource
→ EvidenceInboxItem
→ EvidenceExtractionCandidate
→ EvidenceInboxRouterContract
→ PolicyEvidencePacket
→ identity and Policy Party review
→ EvidenceConfirmationTask
→ AdvisorConfirmationGate
→ confirmed Policy command
```

---

# 5. Legacy Policy Operations extraction foundations

| Asset | Current behavior | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|---|
| `policy-ocr-engine.js` | synchronous local `pdftotext`; complete/empty/failed | `FOUNDATION_ISOLATED` | `CONDITIONAL_REAL_FIXTURE + SUITE_REGISTERED` | `REUSE_WITH_ADAPTER` | Provider-neutral extraction envelope, hash, provenance, scope, timeout; local adapter only. |
| `policy-ai-parser.js` | regex extracts insured, broad product, first money value and policy number | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | Parser registry and evidence-aware carrier/document parsers; retain regexes only as candidate fixtures. |
| `policy-document-classifier.js` | policy/receipt/endorsement/unknown keyword checks | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Confidence, matched evidence and ambiguity; current policy-first ordering may misclassify receipts/endorsements. |
| `policy-schema-validator-engine.js` | required key is not `undefined` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Canonical types, empties, dates, enums, parties, evidence, conflict and completeness validation. |
| `policy-normalization-engine.js` | creates UUID, free-text client, missing premium zero, status active | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Raw normalization helpers only; never confirmed Policy shape. |
| `policy-staging-cache.js` | module-memory upload/parsed/OCR/error array | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REBUILD_CANONICAL_GAP` | Persistent projection behind Evidence Inbox, scoped and resumable. |
| `policy-import-queue.js` | module-memory queue and arbitrary status | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REBUILD_CANONICAL_GAP` | Durable worker state, retry, lease, idempotency, ownership and evidence refs. |
| `policy-batch-processing-engine.js` | sequential files, per-file success/error | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve sequential behavior; persist each file as an Inbox item. |
| `policy-ingestion-orchestrator.js` | OCR → parser → validator → normalizer | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Replace with governed orchestrator; existing validator invocation does not match inspected validator API. |
| `policy-human-review-engine.js` | validation errors or review fields trigger review | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_PRIMITIVE_ONLY` | Add identity, parties, confidence, provenance, sensitivity and duplicate conflict reasons. |

---

# 6. Quote Preview PDF and parser boundary

## Documented and tested capabilities

- product-aware browser PDF text routing;
- canonical Solucionline retirement parser reuse;
- Vida Mujer regression preservation;
- neutral unknown-product behavior;
- parser ownership and source-trace locks;
- real/smoke test patterns;
- file-hash/provenance governance;
- preview-versus-truth boundary.

Relevant evidence records R13E bounded validation as PASS. This Track A audit did not rerun those tests.

Disposition: `REUSE_WITH_ADAPTER`

## Allowed reuse

- extraction ownership decisions;
- parser registry patterns;
- product-specific parsers;
- source trace, file hash and provenance patterns;
- missing-information and unknown-product handling;
- regression-test patterns.

## Prohibited promotion

- accepted-quote packet as a Policy;
- preview registry as productive Policy source;
- projected values as issued-policy facts;
- parser fallback zeros;
- filename-only product identity.

Required bridge:

```text
Quote/PDF parser output
→ EvidenceExtractionCandidate
→ PolicyEvidencePacket
→ identity and party review
→ advisor confirmation
→ confirmed Policy command
```

---

# 7. Policy Read Model

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `policy-read-model-adapter-068b.js` | `LOCAL_STATIC_READ_ONLY` | `TEST_VERIFIED` by implementation record | `REUSE_WITH_ADAPTER` | Preserve safety envelope; replace fixture source after canonical persistence exists. |
| `FORGE_POLICY_READ_MODEL_IMPLEMENTATION_068B.md` | `ARCHITECTURE_ONLY` evidence | `TEST_REPORTED` | `REUSE_CANONICAL` document | Boundary evidence, not productive-source proof. |

---

# 8. Renewal, risk, alerts and tasks

| Asset | Runtime | Tests | Disposition | Required work |
|---|---|---|---|---|
| `renewal-intelligence-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Unvalidated weights; consume confirmed obligations and relationship cadence. |
| `policy-risk-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Reconcile under Conservation authority. |
| `policy-detail-alert-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Evidence and canonical source per alert. |
| `policy-task-priority-engine.js` | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Candidate priority only; Alfred owns final priority. |
| automatic task/calendar engines | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | Explicit approval and effect boundary required. |

---

# 9. Confirmed construction gaps

1. Productive file-admission adapter.
2. Persistent Evidence Inbox storage and resumable worker.
3. File hash and policy-document provenance bridge.
4. Confidence-based policy-document classifier.
5. Carrier/document/product parser registry.
6. Policy Evidence Packet extensions for identity and parties.
7. Canonical Person Resolution Engine and review UI.
8. Policy Party candidates, review and persistence.
9. Existing-policy conflict/deduplication stage.
10. Confirmed Policy command and persistence.
11. Append-only policy intake events.
12. Productive Policy/Cartera read-model adapter.
13. Cartera intake review UI.
14. Vertical file-to-confirmed-read-model tests.
15. Payment Obligation Ledger and payment confirmation.
16. Local predictive Conservation runtime.
17. Relationship Graph runtime.
18. Cartera signals and Alfred/Candy Crush orchestration.

---

# 10. Track A status

- Pass 1 — Relationship and inventory classification: `COMPLETE`
- Pass 2 — Legacy Cartera runtime reconciliation: `COMPLETE`
- Pass 3 — Policy document intake reconciliation: `FIRST_PASS_COMPLETE`
- Next — Policy persistence, identity and Policy Party authority: `NEXT`

## Next inspection targets

- Person and Policy schemas;
- Policy Party contracts;
- migrations and RLS;
- repositories and adapters;
- Event & Evidence write contracts;
- persistence and identity tests.

## Final Pass 3 decision

`NO_NEW_GENERIC_INTAKE_FRAMEWORK=YES`

`CANONICAL_BACKBONE=EVIDENCE_INBOX_PLUS_POLICY_EVIDENCE_PACKET_PLUS_ADVISOR_CONFIRMATION_GATE`

`NEXT_AUDIT=POLICY_PERSISTENCE_IDENTITY_AND_PARTY_AUTHORITY`

No runtime implementation is authorized by this matrix. The registered implementation target remains `CARTERA_001_PIPELINE_QUOTE_PERSON_TIMELINE_CONTINUITY`.