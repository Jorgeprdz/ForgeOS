# Forge Quote Read Model Adapter Implementation 069C

Status: IMPLEMENTED

Phase:
`069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION`

Decision:
`PASS_069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION`

Locked decision:
`QUOTE_READ_MODEL_LOCAL_STATIC_EXISTING_ENGINE_WRAPPER_IMPLEMENTED`

Next:
`069D_QUOTE_READ_MODEL_ADAPTER_QA_LOCK`

Safe error:
`QUOTE_READ_MODEL_NOT_MODELED`

## Robocop Gate

- Applicable Constitution: Forge OS Article 0, Decision Clarity First, no invented financial values, no invented products, no projections without explicit data, unknown remains unknown.
- Applicable ADRs: ADR-005 Product Truth Boundary, ADR-006 Policy Truth Boundary, 068D Policy Read Model read-only lock, 069A Quote Read Model existing engine reconciliation, 069B Quote existing engine input-output mapping.
- Build Tree area: Quote Read Model / Adapter Implementation / Local static existing-engine wrapper.
- Discovery status: 069B closed with `QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPED`.
- Implementation readiness: Ready for local/static/read-only adapter using `gmm-quote-summary-engine.js`.
- Miranda approval: PASS for reusing the existing quote summary engine without creating a new quote engine.
- Board approval status: Bounded implementation only; no real quote execution authorized.
- Scope boundary: Implement adapter, focused test, implementation evidence, and synchronized tree surfaces.
- Prohibited surfaces: new quote engine, product database, UI mutation, backend real, CRM write, policy write, quote write, pipeline write, task creation, calendar creation, message send, provider execution real, auth, secret access, browser persistence, real engine execution with effects, approval bypass, invented quote truth.
- Validation expectation: node syntax checks, focused test, JSON audit, required markers, diff checks, scoped safety scan, staged boundary.

## Implemented Files

- `platform/adapters/quote-read-model/quote-read-model-adapter-069c.js`
- `tests/quote-read-model-adapter-069c-test.js`

## Adapter API

- `getQuoteReadModelManifest()`
- `listQuotes(input)`
- `getQuoteDetail(quoteId)`

## Source Engine

Primary source engine:
`gmm-quote-summary-engine.js`

The adapter wraps the existing `summarizeGmmQuote({ text })` function using deterministic local/static quote text.

No new quote engine was created.

No new product database was created.

## Manifest

- `adapterId`: `forge.quote.read_model.adapter.v1`
- `adapterType`: `local_static_existing_engine_wrapper`
- `adapterMode`: `read_only`
- `routeClass`: `read_only`
- `domainId`: `quote`
- `schemaVersion`: `forge.backend.read_model.v1`
- `freshness.status`: `preview_static`
- `sourceEngineRef`: `gmm-quote-summary-engine.js`
- `safeErrorCode`: `QUOTE_READ_MODEL_NOT_MODELED`
- `canonicalQuoteTruthClaimed`: false
- `newQuoteEngineCreated`: false
- `newProductDatabaseCreated`: false

## Output Envelope

The adapter returns:

- `schemaVersion`: `forge.backend.read_model.v1`
- `domainId`: `quote`
- `routeClass`: `read_only`
- `readModel.status`: `ok`, `empty`, or `error`
- `records`: quote preview records
- `audit.event`: `read_model_used`
- `freshness.status`: `preview_static`
- `blockedEffects`
- `safetyFlags`
- `canonicalQuoteTruthClaimed`: false

## Record Mapping

Implemented preview fields:

- `quote_id`
- `client_ref`
- `policy_ref`
- `opportunity_ref`
- `product_ref`
- `quote_type`
- `quote_status`
- `carrier_ref`
- `premium_preview`
- `coverage_summary`
- `deductible_preview`
- `coinsurance_preview`
- `sum_assured_preview`
- `payment_frequency`
- `assumptions`
- `source_engine_ref`
- `source_evidence_ids`
- `freshness_metadata`
- `audit_event`
- `blocked_effects`
- `safety_flags`

The adapter intentionally does not map:

- canonical carrier truth;
- binding real premium;
- contractual coverage truth;
- provider quote id;
- quote PDF/proposal artifact;
- send/save/convert quote state;
- approval status for quote generation;
- policy-linked truth without Policy Read Model evidence.

## Safety

All safety flags remain false:

- `crmWrite`
- `pipelineWrite`
- `policyWrite`
- `quoteWrite`
- `taskCreate`
- `calendarCreate`
- `messageSend`
- `authReal`
- `providerRuntime`
- `secretAccess`
- `browserPersistence`
- `realEngineExecution`
- `realEffectsAllowed`
- `realEffectsEnabled`
- `backendConnection`

Blocked effects include quote creation, quote update, quote send, provider call, policy write, CRM write, task creation, calendar creation, message send, and real engine execution.

## Validation Notes

The focused test passed.

Node emitted the existing module-type warning for ESM syntax because the repo package does not declare `"type": "module"`. No package metadata was changed because that would be outside the 069C scope.

## Final

DECISION=PASS_069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION

LOCKED_DECISION=QUOTE_READ_MODEL_LOCAL_STATIC_EXISTING_ENGINE_WRAPPER_IMPLEMENTED

NEXT=069D_QUOTE_READ_MODEL_ADAPTER_QA_LOCK
