# Forge Quote Read Model Existing Engine Reconciliation Scope 069A

Status: SCOPED

Phase:
`069A_QUOTE_READ_MODEL_AND_EXISTING_ENGINE_RECONCILIATION_SCOPE`

Decision:
`PASS_069A_QUOTE_READ_MODEL_AND_EXISTING_ENGINE_RECONCILIATION_SCOPE`

Locked decision:
`QUOTE_READ_MODEL_EXISTING_ENGINE_RECONCILIATION_SCOPED`

Not selected:
`QUOTE_READ_MODEL_SOURCE_GAP_SCOPED`

Next:
`069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE`

Safe error:
`QUOTE_READ_MODEL_NOT_MODELED`

## Robocop Gate

- Applicable Constitution: Forge OS Article 0, Decision Clarity First, no invented financial values, no invented products, no projections without explicit data, unknown remains unknown.
- Applicable ADRs: ADR-005 Product Truth Boundary, ADR-006 Policy Truth Boundary, 068D Policy Read Model read-only lock.
- Build Tree area: Quote Read Model / Existing Engine Reconciliation / Scope.
- Discovery status: 068D is closed; quote, cotizacion, product, proposal, parser, fixture, and comparison surfaces were inventoried read-only.
- Implementation readiness: Scope and reconciliation only. No implementation in 069A.
- Miranda approval: PASS for preventing duplicate quote-engine creation before mapping existing engines.
- Board approval status: Scope-only reconciliation accepted; no runtime execution authorization.
- Scope boundary: Document existing candidate quote/product engines, separate Existing Quote Engine from Quote Read Model and Quote Action Contract, and define 069B mapping work.
- Prohibited surfaces: UI mutation, backend real, CRM write, policy write, quote write, pipeline write, task creation, calendar creation, message send, provider execution real, auth, secret access, browser persistence, real engine execution outside static discovery, approval bypass, invented quote truth.
- Validation expectation: JSON audit, required markers, diff checks, scoped safety scan, staged boundary.

## Discovery Result

Existing quote and product-related modules are sufficient to require reconciliation before any new Quote Read Model implementation.

Therefore 069A selects:

`QUOTE_READ_MODEL_EXISTING_ENGINE_RECONCILIATION_SCOPED`

and does not select:

`QUOTE_READ_MODEL_SOURCE_GAP_SCOPED`

## Existing Modules Found

| File | Inferred purpose | Classification | Read-only candidate | Real-effect risk |
| --- | --- | --- | --- | --- |
| `gmm-quote-summary-engine.js` | Parses and summarizes GMM quote text into prospect, plan, deductible, coinsurance, premium, optional coverage, and advisor summary fields. | Existing quote summary engine / parser | Yes, if run on provided text only and output is labeled preview/illustrative. | Monetary and coverage fields could be mistaken as real quote truth without evidence and freshness. |
| `product-intelligence/evidence/gmm-quote-parser.js` | Extracts structured GMM quote fields from text, including product, plan, deductible, coinsurance, sum assured, territoriality, currency, annual premium. | Quote parser / evidence extraction helper | Yes, as evidence candidate parser only. | OCR/parser output can be wrong; must not become final truth. |
| `product-intelligence/quotes/quotation-extraction-result.entity.js` | Creates a quotation extraction result envelope with raw text, extracted fields, confidence, and timestamp. | Quote extraction entity | Candidate, but uses generated ids/timestamps when executed. | Must be wrapped or controlled for deterministic preview QA. |
| `product-intelligence/quotes/quotation-input.entity.js` | File present but no legible content was observed in current static inspection. | Gap / unclear entity | Not yet. | Needs 069B inspection before use. |
| `quote-to-policy-comparison-engine.js` | Compares quote summary against issued policy summary and marks changed fields, expectation gaps, alerts, and warnings. | Policy/quote bridge / comparison engine | Yes, as comparison-only, no-effect interpretation. | Could be overread as coverage or claim eligibility decision if not bounded. |
| `proposal-family-engine.js` | Groups multiple quote summaries into proposal scenarios and labels economic/balanced/premium options without recommending a product. | Proposal family / scenario grouping engine | Yes, if outputs remain categorization only. | Scenario labels may be misread as recommendation without action contract boundary. |
| `fixtures/vida-mujer-quote-fixture.json` | Static Vida Mujer quote-like fixture with UDI premium and coverage fields. | Fixture | Yes, as fixture only. | Contains monetary/coverage values that require source metadata before display as read model fields. |
| `docs/04-product-intelligence/FORGE_LARIZA_QUOTE_REVIEW.md` | Human-readable GMM quote review from `cotizacion gmm.PDF`. | Evidence/documentation module | Yes, as discovery evidence. | Contains quote values; must remain source-linked and illustrative. |
| `docs/04-product-intelligence/FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | Compares quote document to policy document and states issued policy controls. | Evidence/documentation bridge | Yes, as boundary evidence. | Must not infer issued policy terms from quote values. |
| `imagina-ser-*`, `orvi-*`, `vida-mujer-*` engines | Product-specific projection, presentation, OCR, scenario, and decision helpers. | Product/projection/presentation engines | Candidate only after source mapping. | High risk of mixing product truth, projections, and quote read model fields. |

## What Must Not Be Invented

- a new quote engine;
- a new product database;
- carrier truth;
- real premium without source evidence;
- real coverage without source evidence;
- recommendation as fact;
- real PDF or proposal;
- quote send flow;
- provider call;
- quote write;
- policy write;
- CRM write;
- task, calendar, or message action.

## Required Separation

### Existing Quote Engine

Existing quote-related engines must be treated as candidate engines until 069B maps:

- inputs;
- outputs;
- source evidence;
- freshness;
- confidence;
- side effects;
- test coverage;
- preview vs real boundaries.

### Quote Read Model

Quote Read Model is a read-only envelope for exposing existing quote summaries, extracted quote candidates, or quote-policy comparison outputs safely.

It is not a quote-generation engine.

It is not carrier truth.

It is not quote write truth.

### Quote Action Contract

Preparing, generating, approving, sending, saving, or converting a quote is outside 069A.

Those actions require a future action contract and approval gate.

### Approval Gate

No real quote execution, provider call, PDF generation, quote send, CRM write, policy write, pipeline write, task, calendar, or message action may occur without human approval and a locked action contract.

## Candidate Quote Read Model Fields

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
- `valid_until`
- `assumptions`
- `exclusions_or_waiting_periods`
- `source_engine_ref`
- `source_evidence_ids`
- `freshness_metadata`
- `audit_event`
- `blocked_effects`
- `safety_flags`

## Questions Left Open For 069B

- What motor is the primary source for each quote family?
- What minimum inputs does each motor require?
- Does the motor calculate premium or only parse/assemble proposal context?
- Do outputs have traceable evidence?
- Which fixtures are reliable enough for deterministic QA?
- Which tests already exist and are reusable?
- Can each motor run in no-effect mode?
- Does each motor distinguish preview from real quote?
- What requires an approval gate?
- Which fields belong to Product Intelligence and must not be duplicated?

## Recommended 069B

`069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE`

069B should map existing engines before building any Quote Read Model adapter.

## Safety

Initial safe error:
`QUOTE_READ_MODEL_NOT_MODELED`

Initial schema:
`forge.backend.read_model.v1`

Initial mode:
`read_only`

All real-effect flags must remain false:

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

## Final

DECISION=PASS_069A_QUOTE_READ_MODEL_AND_EXISTING_ENGINE_RECONCILIATION_SCOPE

LOCKED_DECISION=QUOTE_READ_MODEL_EXISTING_ENGINE_RECONCILIATION_SCOPED

NEXT=069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE
