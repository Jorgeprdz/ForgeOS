# FORGE CARTERA — POLICY OPERATIONS RUNTIME AND TEST MATRIX 001

Forge OS  
Cartera Existing Asset Audit  
Track A / Runtime and Test Matrix

## Status

`ACTIVE / INITIAL_MATRIX_CREATED / NOT_EXHAUSTIVE / NO_RUNTIME_MUTATION`

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

---

# 1. Status vocabulary

## Runtime status

- `PRODUCTIVE_CONNECTED`: verified current production/runtime consumer.
- `LEGACY_CONNECTED`: connected through a legacy route or service.
- `LOCAL_STATIC_READ_ONLY`: executable but fixture/static and effect-blocked.
- `FOUNDATION_ISOLATED`: executable foundation with no productive integration proved.
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
- `DO_NOT_ACTIVATE`

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

# 3. Legacy Cartera runtime matrix

| Asset | Export / API | Current consumers / dependencies | Persistence | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|---|---|
| `cartera-view.js` | `CarteraView.render`, KPI and form/import/list render methods | route/controller integration requires call-graph confirmation | DOM UI | `LEGACY_CONNECTED` candidate | `NO_TEST_PROVED` | `LEGACY_SURFACE_MIGRATE` | Preserve working behaviors; migrate to ForgeShell/M3; replace database-first landing with Future Radar. |
| `cartera-import-engine.js` | `importExcelRows(rows)` | calls `carteraService.importarMasivo` | delegated to Cartera service | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Keep header normalization and row mapping; add staging, provenance, identity review and sequential confirmation. |
| `cartera-service.js` | `obtenerTodas`, `obtenerPorId`, `existePoliza`, `crear`, `actualizar`, `eliminar`, `importarMasivo` | `cartera-normalizer`, `cartera-validator`, `cartera-events`, `cartera-state`, quarantined IndexedDB DB | legacy IndexedDB store `cartera` | `LEGACY_CONNECTED` | `NO_TEST_PROVED` | `LEGACY_SURFACE_MIGRATE` | Do not promote legacy IndexedDB to canonical truth; preserve service behavior knowledge; replace writes with canonical policy/person/event boundaries. |
| `cartera-normalizer.js` | pending direct inspection | consumed by `cartera-service.js` | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `UNVERIFIED` | Inspect normalization fields and collision with Policy schema. |
| `cartera-validator.js` | pending direct inspection | consumed by `cartera-service.js` | none expected | `UNVERIFIED` | `NO_TEST_PROVED` | `UNVERIFIED` | Inspect validation authority; distinguish form validation from Policy Truth validation. |
| `cartera-events.js` | event constants and emitter pending inspection | consumed by `cartera-service.js` | in-process event bus likely | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Map legacy events to Event & Evidence; do not create parallel event truth. |
| `cartera-state.js` | Cartera store pending inspection | consumed by `cartera-service.js` and UI | browser/in-memory state likely | `UNVERIFIED` | `NO_TEST_PROVED` | `LEGACY_SURFACE_MIGRATE` candidate | Preserve UI state patterns only; canonical data belongs to governed persistence. |

Critical legacy finding:

`cartera-service.js` currently writes to `legacy/quarantine/crmaddlife-indexeddb/db.js`. That is useful proof of working legacy CRUD, but it is not an acceptable canonical Policy or Person source for the new Cartera architecture.

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
| `policy-operations/tasks/task-feed-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Candidate feed for Mi Día/Candy Crush, not separate work authority. |
| `policy-operations/tasks/task-quick-action-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Use smallest useful action contract. |
| `policy-operations/tasks/ai-task-suggestion-engine.js` | AI suggestion foundation reported | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` pending audit | AI may phrase or explain; it may not invent the recommendation. |
| `policy-operations/tasks/auto-task-generator-engine.js` | automatic task generation foundation reported | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | No task creation without explicit human approval and execution gate. |
| `policy-operations/tasks/google-calendar-engine.js` | calendar integration foundation reported | `UNVERIFIED` | `NO_TEST_PROVED` | `DO_NOT_ACTIVATE` | Calendar writes remain blocked until separately authorized and confirmed. |

---

# 8. Identity, payment and compensation matrix

| Asset | Current behavior | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|
| `entity-resolver-engine.js` | returns first entity whose lowercased name includes query | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REBUILD_CANONICAL_GAP` | Canonical multi-attribute person resolution, ranked candidates, conflicts, evidence and auditable human decision. |
| `payment-frequency-engine.js` | maps monthly/quarterly/semiannual/annual to 12/4/2/1 | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` | Normalize official frequency terms and produce schedules only with effective dates and policy rules. |
| `commission-projection-engine.js` | multiplies commissionable amount by rate | `FOUNDATION_ISOLATED` | `NO_TEST_PROVED` | `REFACTOR_FOUNDATION` | Rate must come from validated Rule Pack/RuleSnapshot; separate expected, calculated, reported and paid. |
| `commissionable-amount-engine.js` | pending direct inspection | `UNVERIFIED` | `NO_TEST_PROVED` | `REUSE_WITH_ADAPTER` candidate | Confirm amount authority and period/policy-year context. |
| Payment Obligation Ledger | not verified as productive asset | `ARCHITECTURE_ONLY` / missing | `TEST_REQUIRED` | `REBUILD_CANONICAL_GAP` | Build durable obligation and payment state model with evidence and confirmation. |

---

# 9. Conservation and Relationship Graph matrix

| Authority / asset | Current state | Runtime status | Test status | Disposition | Required work |
|---|---|---|---|---|---|
| `PAQ-10-CONSERVATION-INTELLIGENCE-DISCOVERY.md` | defines policy durability, local predictive versus institutional truth, and no invented formulas | `ARCHITECTURE_ONLY` | n/a | `REUSE_CANONICAL` architecture | Build bounded productive runtime from official evidence and Rule Packs. |
| `ADR-0026_RELATIONSHIP_GRAPH_PRIMARY_COMMERCIAL_ASSET.md` | defines graph ownership and boundaries; explicitly does not implement graph | `ARCHITECTURE_ONLY` | n/a | `REUSE_CANONICAL` architecture | Build graph node/edge persistence, evidence, freshness, consent and Cartera read model. |

---

# 10. Initial blocking findings

## Blocker A — legacy persistence is not canonical persistence

The legacy Cartera service persists to quarantined CRMAddLife IndexedDB. Reuse of CRUD behavior does not authorize promotion of that store to canonical Policy or Person truth.

## Blocker B — Policy Read Model source is static

The existing read model has strong safety boundaries but uses local fixtures and explicitly claims no canonical Policy Truth.

## Blocker C — identity resolution is insufficient

Name substring matching and policy duplicate heuristics cannot protect canonical person continuity.

## Blocker D — many Policy Operations assets are isolated

The prior move map reported zero consumers and `NO_IMPORTS` for the 77-file cluster. Each proposed reuse requires direct runtime and test verification.

## Blocker E — recommendations are mixed with facts

Several relationship and policy foundations generate referral, gap, risk or task outputs without a shared evidence/freshness/uncertainty envelope.

## Blocker F — automation foundations exceed current authorization

Auto-task, calendar, auto-approval and AI interpretation surfaces must remain disconnected until explicit gates exist.

---

# 11. Next matrix expansion

The next audit pass must inspect, in this order:

1. `cartera-normalizer.js`, `cartera-validator.js`, `cartera-events.js`, `cartera-state.js` and route/controller consumers.
2. Policy OCR, parser, classifier, validator, normalizer, staging cache and batch processor.
3. Policy detail, timeline, renewal and task test assets.
4. Productive database schemas and RLS for prospect, quote, policy, events and any legacy Cartera tables.
5. Import graphs and current UI entrypoints.
6. Existing Event & Evidence adapters required by Cartera.
7. Existing Alfred/NBA and Candy Crush consumers suitable for governed Cartera signals.

Exit gate:

No runtime implementation package is authorized until its matrix rows have a resolved owner, inspected API, test expectation, persistence boundary and explicit reuse disposition.
