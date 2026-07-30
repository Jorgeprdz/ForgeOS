# FORGE CARTERA — POLICY OPERATIONS RUNTIME AND TEST MATRIX 001

Forge OS  
Cartera Existing Asset Audit  
Track A / Runtime and Test Matrix

## Status

`ACTIVE / LEGACY_RUNTIME_RECONCILED / POLICY_INTAKE_AUDIT_NEXT / NO_RUNTIME_MUTATION`

## Date

2026-07-30

## Purpose

This matrix converts filename inventory into actionable reuse evidence.

An asset is not approved for productive Cartera use merely because it exists. Each asset must be inspected for:

- exported API;
- inputs and outputs;
- current consumers;
- persistence dependency;
- test evidence;
- source ownership compatibility;
- human-confirmation and effect boundaries;
- required adapter, refactor or replacement.

Canonical audit:

- `docs/architecture/source-truth/FORGE_CARTERA_EXISTING_ASSET_AUDIT_AND_RECONCILIATION_001.md`
- `docs/architecture/source-truth/FORGE_CARTERA_LEGACY_RUNTIME_RECONCILIATION_002.md`

---

# 1. Status vocabulary

## Runtime status

- `PRODUCTIVE_CONNECTED`: verified current production/runtime consumer.
- `LEGACY_CONNECTED`: connected through a legacy route or service.
- `LOCAL_STATIC_READ_ONLY`: executable but fixture/static and effect-blocked.
- `FOUNDATION_ISOLATED`: executable foundation with no productive integration proved.
- `FOUNDATION_ORPHANED`: internally coherent stack with no productive application entrypoint proved.
- `ARCHITECTURE_ONLY`: no productive runtime verified.
- `UNVERIFIED`: direct behavior or consumers not yet inspected.

## Test status

- `TEST_VERIFIED`: test file and intended boundary confirmed.
- `TEST_REPORTED`: repository inventory or implementation evidence reports a test; execution not yet rerun in this audit.
- `NO_TEST_PROVED`: no test verified during this audit.
- `TEST_REQUIRED`: must receive bounded tests before reuse.

## Disposition

- `REUSE_CANONICAL`
- `REUSE_WITH_ADAPTER`
- `REFACTOR_FOUNDATION`
- `REBUILD_CANONICAL_GAP`
- `LEGACY_SURFACE_MIGRATE`
- `REUSE_UI_PATTERN_ONLY`
- `DO_NOT_ACTIVATE`
- `DO_NOT_PROMOTE`

---

# 2. Relationship Intelligence matrix

| Asset | Export / API | Current output | Runtime status | Test status | Canonical owner | Disposition | Required work |
|---|---|---|---|---|---|---|---|
| `relationship-timeline-engine.js` | `buildRelationshipTimeline`, `calculateRelationshipHealth`, `sortTimeline`, `daysUntil` | projected relationship events, next event, simple health, opportunities | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence + Event & Evidence boundary | `REUSE_WITH_ADAPTER` | Treat as future-event projection; separate fact, schedule, inference and recommendation; remove automatic referral truth. |
| `relationship-next-action-engine.js` | `buildRelationshipNextAction`, `selectRelationshipEvent`, `mapEventToAction` | one next action, reason, priority, timing and channel | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Alfred / NBA owns final priority | `REFACTOR_FOUNDATION` | Convert to candidate-action provider; replace automatic referral request; add evidence envelope and human gate. |
| `relationship-opportunity-engine.js` | `detectRelationshipOpportunities`, `calculateRelationshipScore`, `rankOpportunities` | gap, review, cross-sell, life-event and referral candidates | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence; Pipeline owns opportunity lifecycle | `DO_NOT_ACTIVATE` | Preserve unknown and external coverage states; output review candidates only; advisor confirmation before Pipeline write. |
| `life-event-engine.js` | `detectLifeEvents`, `detectEventsFromData`, `buildReviewAreas` | detected event candidates, confidence, review areas and impact | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence | `REFACTOR_FOUNDATION` | Separate profile state from new event; require date, freshness, source and sensitivity boundary. |
| `referral-opportunity-engine.js` | `detectReferralOpportunity`, `detectarMomentoReferido`, score helpers | referral score, likelihood, timing and approach | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence + Advisor execution boundary | `REFACTOR_FOUNDATION` | Reframe as relationship-strengthening or introduction-conversation candidate; consent remains unknown until confirmed. |
| `relationship-health-engine.js` | `buildRelationshipHealth`, `determineRelationshipHealth` | color, risks, strengths, recommendation | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence | `REFACTOR_FOUNDATION` | Split operational attention from actual relationship health; resolve stale events and evidence dates. |
| `client-engagement-engine.js` | `buildClientEngagement`, score and inactivity helpers | engagement score, last interaction, inactivity risk, action | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence | `REFACTOR_FOUNDATION` | Relationship-specific cadence; missing history is not critical deterioration; no direct mandatory contact. |
| `relationship-review-engine.js` | `buildRelationshipReview` | review need, reason, urgency, suggested topics | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence | `REUSE_WITH_ADAPTER` | Produce governed Review Brief with required, suggested, hypothesis and sensitive-topic sections. |
| `relationship-master-engine.js` | `buildRelationshipMaster`, `average` | orchestration bundle over all relationship engines | `FOUNDATION_ISOLATED` | `TEST_REPORTED` | Relationship Intelligence | `REUSE_WITH_ADAPTER` | Remove ambiguous aggregate confidence; consume only reconciled engines; return explicit evidence classes. |

Relationship test note:

The repository inventory previously reported corresponding master-test assets for the relationship foundation. Their exact paths, current assertions and executable status still require direct Track A verification.

---

# 3. Legacy Cartera runtime matrix — reconciled

## 3.1 Productive entrypoint proof

```text
app.js
→ createRouteRegistry
→ cartera route
→ renderCartera / bindCarteraEvents
→ cartera.js
→ quarantined IndexedDB store `cartera`
```

The productive route is `cartera.js`. `cartera-view.js` is not the application route.

| Asset | Export / API | Consumers / dependencies | Persistence | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|---|---|
| `app.js` | application bootstrap | imports `renderCartera` and `bindCarteraEvents` from `cartera.js`; passes both into route registry | global bootstrap initializes browser runtime | `PRODUCTIVE_CONNECTED` | navigation tests are pipeline-focused; no Cartera test proved | `REUSE_CANONICAL` entrypoint evidence | Preserve route wiring while migrating implementation behind it. |
| `platform/routing/route-registry.js` | `createRouteRegistry` | registers `cartera: { render, bind }` | none | `PRODUCTIVE_CONNECTED` | no Cartera-specific test proved | `REUSE_CANONICAL` route contract | Keep route ID `cartera`; later move to governed loader only with explicit route authorization. |
| `cartera.js` | `renderCartera`, `bindCarteraEvents` | imported by `app.js`; uses DB, AppState, EventBus, RenderEngine, Analytics, Logger, Memory | quarantined IndexedDB `cartera` store | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `LEGACY_SURFACE_MIGRATE` | Preserve route/search/KPI/list/import behavior until parity; replace direct persistence, direct delete, direct import and parallel business logic. |
| `cartera-view.js` | `CarteraView.render`, KPI/form/import/list methods | search proves no productive consumer outside file | DOM only | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Reuse form, loading, empty and rendering patterns; do not activate beside `cartera.js` because DOM IDs collide. |
| `cartera-service.js` | CRUD and `importarMasivo` | consumed by `cartera-import-engine.js`; no productive application entrypoint proved | quarantined IndexedDB via DB facade | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve workflow semantics; replace persistence and effects with canonical commands/adapters. |
| `cartera-import-engine.js` | `importExcelRows(rows)` | calls isolated `carteraService.importarMasivo` | delegated to legacy service | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve robust header aliases; output staged evidence candidates with row provenance and identity review. |
| `cartera-normalizer.js` | `sanitizeText`, `normalizePoliza` | consumed by isolated service | none directly; result later stored | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Keep sanitation primitives; replace default `vigente`, empty-string unknowns, single client field and premature ID creation. |
| `cartera-validator.js` | `validatePoliza` | consumed by isolated service | none | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Use as UI/form validation only; never Policy Truth validation. |
| `cartera-events.js` | `CARTERA_EVENTS`, browser event bus | consumed by isolated service | ephemeral window events | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Map useful event names to governed commands and append-only Event & Evidence; browser event only after canonical result. |
| `cartera-state.js` | `CarteraStore` setters | consumed by isolated service | in-memory | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `REUSE_UI_PATTERN_ONLY` | Preserve local loading/editing state pattern only; no canonical data ownership. |
| `cartera-repository.js` | `getAll`, `save`, `update` | repository search proves no consumer outside definition | quarantined IndexedDB plus local cache | `FOUNDATION_ORPHANED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Reuse repository/cache pattern only after canonical persistence owner exists. |
| `legacy/quarantine/crmaddlife-indexeddb/db.js` | generic DB facade | used directly by productive route and isolated service/repository | IndexedDB | `LEGACY_CONNECTED` | `NO_TEST_PROVED` in this audit | `DO_NOT_PROMOTE` | Compatibility fallback only; never canonical Person, Policy or Event truth. |
| `legacy/quarantine/crmaddlife-indexeddb/storage-engine.js` | generic store transaction/save/get/delete/clear | DB facade | `ADDLIFE_CRM_ENTERPRISE`, generic stores keyed by `id` | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `DO_NOT_PROMOTE` | Preserve migration access only; lacks advisor scope, RLS, parties, evidence and canonical ownership. |

## 3.2 Connected route behavior findings

- Search only covers `cliente` and `poliza`.
- KPI premium is a direct sum over local records.
- Alert KPI counts any `fechaPago` with day difference `<= 30`, including arbitrarily old overdue dates.
- `Nueva` is not implemented.
- `Editar` only records an ID and shows a toast.
- `Eliminar` performs a hard delete after confirmation.
- Excel import loads XLSX from a public CDN, reads the first sheet, skips bad rows silently and writes directly to IndexedDB.
- Duplicate prevention is exact policy-number equality against the currently loaded array.
- No identity resolution, evidence packet, party model, staging review or canonical event is present.

## 3.3 Legacy migration decision

```text
preserve user behavior
→ replace data authority
→ introduce governed adapters
→ prove parity
→ retire duplicate/orphan surfaces
```

---

# 4. Policy document intake matrix

| Asset | Export / API | Current behavior | Persistence | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|---|---|
| `policy-operations/evidence/policy-ingestion-orchestrator.js` | `procesarDocumento({ file, ocrEngine, parser, validator, normalizer })` | OCR → parse → validate → normalize; returns all intermediate outputs | none | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Add governed evidence packet, identity stage, policy-party stage, conflict state and durable staging. |
| `policy-operations/evidence/policy-import-queue.js` | add, update status, list queue | in-memory queue with UUID and status | module array only | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Persistent, resumable, advisor-scoped queue; retries; failures; review and confirmation states. |
| `policy-operations/evidence/policy-human-review-engine.js` | `requiereRevisionHumana({ validation, reviewFields })` | returns true on validation errors or doubtful fields | none | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Preserve rule; add identity conflicts, sensitive fields, provenance gaps and explicit review reasons. |
| `policy-operations/policy-detail/policy-duplicate-engine.js` | `detectarDuplicados({ polizas })` | duplicate key from client + product + premium | none | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REBUILD_CANONICAL_GAP` | Match carrier + policy number + parties + issue/effective dates + document fingerprint; preserve conflicts. |
| `policy-operations/evidence/policy-ocr-engine.js` | pending direct inspection | OCR foundation reported | pending | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Inspect provider/runtime dependency and output evidence coordinates. |
| `policy-operations/evidence/policy-ai-parser.js` | pending direct inspection | parser foundation reported | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` pending audit | Generative parser cannot invent fields; must preserve raw evidence and unknown values. |
| `policy-operations/evidence/policy-document-classifier.js` | pending direct inspection | document classification reported | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Confirm supported document classes and confidence behavior. |
| `policy-operations/evidence/policy-schema-validator-engine.js` | pending direct inspection | schema validation reported | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Reconcile with canonical Policy schema and party roles. |
| `policy-operations/evidence/policy-normalization-engine.js` | pending direct inspection | normalization reported | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Preserve original and normalized values plus provenance. |
| `policy-operations/evidence/policy-staging-cache.js` | pending direct inspection | staging cache reported | unknown | `UNVERIFIED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` candidate | Confirm durability, isolation, expiration and evidence references. |
| `policy-operations/evidence/policy-batch-processing-engine.js` | pending direct inspection | batch processing reported | unknown | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Batch admission allowed; human review remains item-by-item. |

---

# 5. Policy Read Model matrix

| Asset | Export / API | Current behavior | Persistence/effects | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|---|---|
| `platform/adapters/policy-read-model/policy-read-model-adapter-068b.js` | `getPolicyReadModelManifest`, `listPolicies`, `getPolicyDetail` | local fixture policies in read-only envelopes; freshness, blocked effects and safety flags | no backend; no browser persistence; all real effects blocked | `LOCAL_STATIC_READ_ONLY` | `TEST_VERIFIED` by implementation record: `tests/policy-read-model-adapter-068b-test.js` | `REUSE_WITH_ADAPTER` | Preserve envelope and safety contract; replace fixture source with canonical Policy source adapter; retain `canonicalPolicyTruthClaimed=false` until proven. |
| `docs/architecture/source-truth/FORGE_POLICY_READ_MODEL_IMPLEMENTATION_068B.md` | implementation decision record | explicitly states local/static/read-only implementation and no canonical Policy Truth claim | n/a | `ARCHITECTURE_ONLY` evidence | `TEST_REPORTED` | `REUSE_CANONICAL` documentation | Use as boundary evidence, not productive-source proof. |

Critical read-model finding:

The Policy Read Model has one of the strongest safety envelopes found in this audit. Its structure is reusable. Its current data source is not.

---

# 6. Renewal, policy risk and alert matrix

| Asset | Export / API | Current behavior | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|---|
| `policy-operations/renewals/renewal-intelligence-engine.js` | `analizarRenovacion` | risk from renewal proximity, last-contact days and pending-payment count | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Treat weights as unvalidated; consume confirmed obligations and relationship cadence; output local predictive signal only. |
| `policy-operations/policy-detail/policy-risk-engine.js` | `calcularRiesgoPoliza` | score/level from inactivity, pending payments and renewal proximity | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Merge with Conservation local predictive model; avoid duplicate risk authority. |
| `policy-operations/policy-detail/policy-detail-alert-engine.js` | `generarAlertasDetallePoliza` | alerts for pending payment, near renewal, commission docs and cancellation | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Require canonical source and evidence per alert; distinguish confirmed cancellation from candidate source. |
| `policy-operations/policy-detail/policy-review-priority-engine.js` | pending direct inspection | priority foundation reported | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Final priority remains Alfred/NBA. |
| `policy-operations/policy-detail/policy-last-contact-engine.js` | pending direct inspection | contact-recency foundation reported | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Consume Event & Evidence interaction projection; relationship-specific cadence required. |

---

# 7. Task and action matrix

| Asset | Current role | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|
| `policy-operations/tasks/policy-task-priority-engine.js` | maps high risk/pending payment to HIGH and renewal to MEDIUM | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Candidate priority only; final priority by Alfred/NBA. |
| `policy-operations/tasks/policy-task-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Map tasks to Event & Evidence and human approval. |
| `policy-operations/tasks/task-feed-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Candidate feed only; Advisor Experience owns presentation. |
| `policy-operations/tasks/auto-task-generator-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` pending audit | Must not create tasks without advisor approval and final NBA ownership. |
| `policy-operations/tasks/google-calendar-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` pending audit | Calendar write requires explicit user action and connector boundary. |

---

# 8. Canonical gaps requiring construction

| Gap | Why existing assets do not satisfy it | Required owner / boundary |
|---|---|---|
| Canonical Person Resolution Engine | current entity resolver is name-substring search; legacy Cartera uses free-text client | Shared Identity / Relationship Graph with Cartera review surface |
| Confirmed Policy persistence | current productive writes go to quarantined IndexedDB; read model uses static fixtures | Policy Truth authority |
| Policy Party model | legacy shape has one client string | Policy Truth + canonical Person references |
| Persistent intake queue | current queue is an in-memory array | Cartera intake workflow with advisor scope |
| Payment Obligation Ledger | dates/frequency/alerts exist, but no obligation-level persistent state | Policy/Payment boundary; Cartera confirmation surface |
| Local predictive Conservation runtime | architecture and primitive scores exist, but no canonical productive runtime proved | Conservation Intelligence |
| Relationship Graph runtime | ADR exists; runtime not proved | Shared Relationship Graph authority |
| Cartera Signal Envelope | engines emit incompatible scores/actions without common evidence classes | Cartera adapter boundary; Alfred final priority |
| Cartera → Pipeline bridge | opportunity engine can suggest, but no advisor-confirmed lifecycle write is proved | Pipeline owns opportunity lifecycle |
| Cartera → Alfred → Candy Crush orchestration | primitives exist; productive governed vertical is not proved | NBA + Advisor Experience |

---

# 9. Next Track A inspection batch

Directly inspect and classify:

1. `policy-ocr-engine.js`;
2. `policy-ai-parser.js`;
3. `policy-document-classifier.js`;
4. `policy-schema-validator-engine.js`;
5. `policy-normalization-engine.js`;
6. `policy-staging-cache.js`;
7. `policy-batch-processing-engine.js`;
8. tests and current consumers for each.

Exit condition:

- productive entrypoint or isolation proved;
- API and output contract documented;
- persistence and effects identified;
- test status proved;
- reuse disposition locked;
- exact canonical adapter or rebuild gap identified.
