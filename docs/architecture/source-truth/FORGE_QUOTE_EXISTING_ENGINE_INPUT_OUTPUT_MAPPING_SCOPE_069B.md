# Forge Quote Existing Engine Input Output Mapping Scope 069B

Status: SCOPED

Phase:
`069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE`

Decision:
`PASS_069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE`

Locked decision:
`QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPED`

Alternative not selected:
`QUOTE_EXISTING_ENGINE_MAPPING_NEEDS_REPAIR_OR_WRAPPER_SCOPE`

Next:
`069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION`

Alternative next not selected:
`069C_QUOTE_ENGINE_NO_EFFECT_WRAPPER_SCOPE`

Safe error:
`QUOTE_READ_MODEL_NOT_MODELED`

Schema:
`forge.backend.read_model.v1`

Mode:
`read_only`

## Robocop Gate

- Applicable Constitution: Forge OS Article 0, Decision Clarity First, no invented financial values, no invented products, no projections without explicit data, unknown remains unknown.
- Applicable ADRs: ADR-005 Product Truth Boundary, ADR-006 Policy Truth Boundary, 068D Policy Read Model read-only lock, 069A Quote Read Model existing engine reconciliation scope.
- Build Tree area: Quote Read Model / Existing Engine Input-Output Mapping / Scope.
- Discovery status: 069A is closed; candidate quote engines, parsers, fixtures, docs, and tests were inspected statically.
- Implementation readiness: Mapping only. 069C may implement a local/static/read-only adapter using existing GMM quote summary fixture/parser output.
- Miranda approval: PASS for choosing reuse of existing quote engine surfaces instead of creating a new quote engine.
- Board approval status: Scope-only mapping accepted; no runtime execution authorization.
- Scope boundary: Map candidate modules, inputs, outputs, evidence/freshness gaps, side-effect risks, and reuse decisions.
- Prohibited surfaces: new quote engine, new product database, UI mutation, backend real, CRM write, policy write, quote write, pipeline write, task creation, calendar creation, message send, provider execution real, auth, secret access, browser persistence, real engine execution outside static inspection, approval bypass, invented quote truth.
- Validation expectation: JSON audit, required markers, diff checks, scoped safety scan, staged boundary.

## Mapping Decision

069B finds mapping sufficient for a narrow 069C adapter.

Selected:

`QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPED`

Not selected:

`QUOTE_EXISTING_ENGINE_MAPPING_NEEDS_REPAIR_OR_WRAPPER_SCOPE`

Next selected:

`069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION`

Not selected:

`069C_QUOTE_ENGINE_NO_EFFECT_WRAPPER_SCOPE`

Reason:
`gmm-quote-summary-engine.js` is a pure static text summary engine with a stable exported function and smoke-test coverage. It can be wrapped by a new local/static/read-only Quote Read Model adapter that supplies deterministic fixture text, evidence metadata, freshness metadata, blocked effects, safety flags, and safe empty/error behavior.

## Engine Mapping Table

| File | Module type | Domain | Status | Recommended role |
| --- | --- | --- | --- | --- |
| `gmm-quote-summary-engine.js` | Quote summary engine/parser | GMM / Product Intelligence | `usable_candidate` | `primary_candidate_for_069C` |
| `product-intelligence/evidence/gmm-quote-parser.js` | Quote evidence parser | GMM / Product Intelligence evidence | `usable_candidate` | `evidence_parser_candidate` |
| `product-intelligence/quotes/quotation-extraction-result.entity.js` | Extraction result entity | Quote extraction | `needs_wrapping` | `excluded_until_wrapped` |
| `product-intelligence/quotes/quotation-input.entity.js` | Empty quote input entity file | Quote extraction | `needs_inspection` | `excluded_until_source_owner_defined` |
| `quote-to-policy-comparison-engine.js` | Quote-policy comparison engine | Quote / Policy bridge | `usable_candidate` | `comparison_enrichment_candidate` |
| `proposal-family-engine.js` | Proposal scenario grouping engine | Proposal / Quote grouping | `usable_candidate` | `proposal_grouping_candidate` |
| `fixtures/vida-mujer-quote-fixture.json` | Static product/quote-like fixture | Vida Mujer / Product Intelligence | `needs_wrapping` | `fixture_only_candidate` |
| `docs/04-product-intelligence/FORGE_LARIZA_QUOTE_REVIEW.md` | Human evidence doc | GMM quote review | `usable_candidate` | `product_intelligence_source_candidate` |
| `docs/04-product-intelligence/FORGE_QUOTE_VS_POLICY_ANALYSIS.md` | Human boundary doc | Quote / Policy bridge | `usable_candidate` | `comparison_enrichment_candidate` |

## Detailed Input Output Mapping

### `gmm-quote-summary-engine.js`

Identity:

- module type: quote summary engine/parser;
- domain: GMM quote preview;
- status: `usable_candidate`;
- recommended role: `primary_candidate_for_069C`.

Inputs:

- shape: `{ text: string }`;
- required: quote text;
- optional: none in API;
- source assumptions: text is document-derived OCR or static fixture text;
- input origin: document-derived or fixture-derived.

Outputs:

- shape: plain object summary;
- fields: `product`, `plan`, `prospect`, `age`, `gender`, `territoriality`, `zone`, `sumInsured`, `deductible`, `coinsurance`, `coinsuranceCap`, `tabulator`, `currency`, `paymentMode`, `premium`, `optionalCoverages`, `advisor`, `quoteDate`, `startDate`, `salesSummary`, `decisionQuestions`, `warnings`;
- monetary fields: `premium`, `sumInsured`, `deductible`, `coinsuranceCap`, optional coverage `premium`;
- coverage fields: `optionalCoverages`, territoriality, tabulator, plan;
- carrier/product fields: `product` only; no explicit carrier owner;
- confidence/freshness/evidence fields: missing;
- warnings/errors/empty state: warning exists; no formal errors or empty state.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: input text not retained in output;
- deterministic fixture available: yes, root GMM smoke tests contain static quote text.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: parser execution only;
- approval required: not for read-only parsing; required for any quote action;
- safety flags missing: yes.

Reuse decision:
`primary_candidate_for_069C`

### `product-intelligence/evidence/gmm-quote-parser.js`

Identity:

- module type: quote evidence parser;
- domain: GMM quote evidence;
- status: `usable_candidate`;
- recommended role: `evidence_parser_candidate`.

Inputs:

- shape: `{ text: string }`;
- required: quote text;
- optional: none in API;
- source assumptions: OCR or static text;
- input origin: document-derived or fixture-derived.

Outputs:

- shape: plain object parser output;
- fields: `productType`, `productName`, `plan`, `deductible`, `coinsurance.percent`, `coinsurance.maxOutOfPocket`, `sumAssured`, `territoriality`, `tabulator`, `currency`, `annualPremium`;
- monetary fields: `annualPremium`, `deductible`, `sumAssured`, `coinsurance.maxOutOfPocket`;
- coverage fields: deductible, coinsurance, sum assured, territoriality, tabulator;
- carrier/product fields: product type/name only;
- confidence/freshness/evidence fields: missing;
- warnings/errors/empty state: unknown values and nulls, no formal safe error.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: no;
- deterministic fixture available: tests reference real local PDF/OCR, not deterministic for CI; static text can be supplied by 069C.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: parser execution only;
- approval required: not for read-only parsing;
- safety flags missing: yes.

Reuse decision:
`evidence_parser_candidate`

### `product-intelligence/quotes/quotation-extraction-result.entity.js`

Identity:

- module type: extraction result entity;
- domain: quote extraction;
- status: `needs_wrapping`;
- recommended role: `excluded_until_wrapped`.

Inputs:

- shape: `{ quotationInputId, rawText, extractedFields, confidence }`;
- required: none enforced by code;
- optional: raw text, extracted fields, confidence;
- source assumptions: extraction result after OCR/parser;
- input origin: engine-derived or document-derived.

Outputs:

- shape: object entity;
- fields: `id`, `quotationInputId`, `rawText`, `extractedFields`, `confidence`, `createdAt`;
- monetary fields: only inside extracted fields;
- coverage fields: only inside extracted fields;
- carrier/product fields: only inside extracted fields;
- confidence/freshness/evidence fields: confidence exists; freshness/evidence absent;
- warnings/errors/empty state: none.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: timestamp generated as `createdAt`, but not a freshness model;
- confidence: available;
- raw source retained: yes;
- deterministic fixture available: no.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: `crypto.randomUUID()` and `Date.now()`;
- real engine execution: entity creation only;
- approval required: no for read-only entity creation, but deterministic wrapper needed;
- safety flags missing: yes.

Reuse decision:
`excluded_until_wrapped`

### `product-intelligence/quotes/quotation-input.entity.js`

Identity:

- module type: empty quote input entity file;
- domain: quote extraction;
- status: `needs_inspection`;
- recommended role: `excluded_until_source_owner_defined`.

Inputs:

- shape: not modeled;
- required fields: not modeled;
- optional fields: not modeled;
- source assumptions: unclear;
- input origin: unclear.

Outputs:

- shape: none observed;
- fields produced: none observed;
- monetary fields: none;
- coverage fields: none;
- carrier/product fields: none;
- confidence/freshness/evidence fields: none;
- warnings/errors/empty state: none.

Evidence/freshness:

- source evidence: absent;
- freshness metadata: absent;
- confidence: absent;
- raw source retained: absent;
- deterministic fixture: absent.

Side-effect risk:

- side effects: none observed;
- generated ids/timestamps: none observed;
- safety flags missing: yes.

Reuse decision:
`excluded_until_source_owner_defined`

### `quote-to-policy-comparison-engine.js`

Identity:

- module type: quote-policy comparison engine;
- domain: quote/policy bridge;
- status: `usable_candidate`;
- recommended role: `comparison_enrichment_candidate`.

Inputs:

- shape: `{ quoteSummary, policySummary }`;
- required: quote summary and policy summary for meaningful output;
- optional: absent fields degrade to unknown/no comparison;
- source assumptions: quote summary and policy summary are already prepared;
- input origin: engine-derived.

Outputs:

- shape: comparison object;
- fields: `identityMatch`, `confidence`, `warnings`, `stayedSame`, `changed`, `contractualFacts`, `expectationGaps`, `advisorAlerts`, `clientExplanation`;
- monetary fields: changed/stayed premium, deductible, sum insured, coinsurance cap if present;
- coverage fields: changed/stayed product, plan, territoriality, optional coverages;
- carrier/product fields: product/plan comparison only;
- confidence/freshness/evidence fields: confidence exists; no freshness/evidence model;
- warnings/errors/empty state: warnings exist; no formal safe error.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: missing;
- confidence: available;
- raw source retained: no;
- deterministic fixture available: yes through GMM smoke tests.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: comparison only;
- approval required: no for read-only comparison; yes for any action;
- safety flags missing: yes.

Reuse decision:
`comparison_enrichment_candidate`

### `proposal-family-engine.js`

Identity:

- module type: proposal scenario grouping engine;
- domain: quote/proposal grouping;
- status: `usable_candidate`;
- recommended role: `proposal_grouping_candidate`.

Inputs:

- shape: `{ quoteSummaries: [] }`;
- required: array of quote summary objects for meaningful output;
- optional: quote fields degrade to empty/null;
- source assumptions: quote summaries are already parsed;
- input origin: engine-derived or fixture-derived.

Outputs:

- shape: proposal family object;
- fields: `proposalFamily`, `economicOption`, `balancedOption`, `premiumOption`, `comparisonTable`, `recommendationFactors`;
- monetary fields: premium in options/table;
- coverage fields: deductible, coinsurance, coinsurance cap, sum insured, optional coverages;
- carrier/product fields: product only;
- confidence/freshness/evidence fields: missing;
- warnings/errors/empty state: warnings and empty no-quote response exist.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: no;
- deterministic fixture available: yes through `proposal-family-smoke-test.js`.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: grouping only;
- approval required: not for read-only grouping; action/recommendation needs gate;
- safety flags missing: yes.

Reuse decision:
`proposal_grouping_candidate`

### `fixtures/vida-mujer-quote-fixture.json`

Identity:

- module type: quote-like fixture;
- domain: Vida Mujer / Product Intelligence;
- status: `needs_wrapping`;
- recommended role: `fixture_only_candidate`.

Inputs:

- shape: static JSON;
- required: none at runtime;
- optional: not applicable;
- source assumptions: fixture-derived; no source owner embedded;
- input origin: fixture-derived.

Outputs:

- shape: static product quote-like fields;
- fields: `product`, `currency`, `currentUDI`, `insuredAge`, `basicSumAssuredUDI`, `annualPremiumUDI`, `paymentYears`, `survivalDotales`, `guaranteedValues`, `hasGuaranteedValues`, `diseaseCoverages`;
- monetary fields: UDI premium and UDI sums;
- coverage fields: disease coverages;
- carrier/product fields: product only;
- confidence/freshness/evidence fields: missing;
- warnings/errors/empty state: none.

Evidence/freshness:

- `source_evidence_ids`: missing;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: fixture only;
- deterministic fixture available: yes.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: none;
- approval required: no for fixture read; needed before treating values as real quote truth;
- safety flags missing: yes.

Reuse decision:
`fixture_only_candidate`

### `docs/04-product-intelligence/FORGE_LARIZA_QUOTE_REVIEW.md`

Identity:

- module type: human quote review doc;
- domain: GMM quote review;
- status: `usable_candidate`;
- recommended role: `product_intelligence_source_candidate`.

Inputs:

- shape: markdown evidence;
- required: human source doc;
- optional: none;
- source assumptions: based on `cotizacion gmm.PDF`;
- input origin: document-derived.

Outputs:

- shape: narrative facts and decision questions;
- fields: prospect, product, plan, territory, zone, currency, sum insured, deductible, coinsurance, cap, tabulator, payment, premium, optional coverage, decision questions;
- monetary fields: premium, deductible, sum insured, optional coverage premium;
- coverage fields: included/presented/optional protections;
- carrier/product fields: Alfa Medical;
- confidence/freshness/evidence fields: source document named, no machine freshness model;
- warnings/errors/empty state: no formal safe error.

Evidence/freshness:

- `source_evidence_ids`: source named but not normalized;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: no, narrative only;
- deterministic fixture available: doc is stable.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: none;
- approval required: no for read-only source use;
- safety flags missing: yes.

Reuse decision:
`product_intelligence_source_candidate`

### `docs/04-product-intelligence/FORGE_QUOTE_VS_POLICY_ANALYSIS.md`

Identity:

- module type: quote-policy boundary doc;
- domain: Quote / Policy bridge;
- status: `usable_candidate`;
- recommended role: `comparison_enrichment_candidate`.

Inputs:

- shape: markdown evidence;
- required: human source doc;
- optional: none;
- source assumptions: quote and policy documents compared;
- input origin: document-derived.

Outputs:

- shape: narrative comparison;
- fields: identity comparison, product comparison, financial comparison, optional coverage comparison, what became contractual, what remained illustrative;
- monetary fields: quote premium and policy total shown;
- coverage fields: product, plan, territoriality, deductible, coinsurance, optional coverage;
- carrier/product fields: Alfa Medical;
- confidence/freshness/evidence fields: source documents named, no machine freshness model;
- warnings/errors/empty state: boundary warning that issued policy controls.

Evidence/freshness:

- `source_evidence_ids`: source docs named but not normalized;
- freshness metadata: missing;
- confidence: missing;
- raw source retained: no, narrative only;
- deterministic fixture available: doc is stable.

Side-effect risk:

- writes: no;
- provider calls: no;
- fetch/network: no;
- browser persistence: no;
- generated ids/timestamps: no;
- real engine execution: none;
- approval required: no for read-only source use;
- safety flags missing: yes.

Reuse decision:
`comparison_enrichment_candidate`

## Primary Candidate For 069C

Primary:
`gmm-quote-summary-engine.js`

Reason:

- pure read-only text input;
- stable export: `summarizeGmmQuote({ text })`;
- produces the closest shape to the target Quote Read Model fields;
- includes preview-safe warning that quote is illustrative;
- has static smoke test text and related GMM smoke tests;
- can be wrapped by 069C without modifying the engine.

069C should implement a local/static/read-only Quote Read Model adapter that:

- imports or wraps `summarizeGmmQuote`;
- supplies deterministic static GMM quote fixture text;
- maps parser output to `forge.backend.read_model.v1`;
- adds `quote_id`, references, `source_engine_ref`, `source_evidence_ids`, `freshness_metadata`, `audit_event`, `blocked_effects`, and all safety flags false;
- returns safe empty/error `QUOTE_READ_MODEL_NOT_MODELED`;
- does not call provider, storage, network, CRM, policy, quote, pipeline, task, calendar, or message surfaces.

## Parsers And Enrichment Only

- `product-intelligence/evidence/gmm-quote-parser.js`: evidence parser candidate; can enrich structured fields but lacks warning/summary shape.
- `quote-to-policy-comparison-engine.js`: comparison enrichment only; requires policy summary input and must not decide coverage or claims.
- `proposal-family-engine.js`: proposal grouping only; must not become recommendation/action engine.
- quote review docs: source/evidence context only.
- Vida Mujer fixture: fixture-only until source owner and product truth mapping are defined.

## Fields That Can Map In 069C

- `quote_id`: generated deterministically by adapter from fixture id.
- `client_ref`: preview/static client/prospect ref from fixture context.
- `policy_ref`: null or absent unless quote-policy comparison fixture is explicitly included.
- `opportunity_ref`: optional preview ref if supplied by adapter fixture.
- `product_ref`: from `product` and `plan`, labeled preview.
- `quote_type`: `gmm_quote_preview`.
- `quote_status`: `preview_static`.
- `carrier_ref`: unknown or `SMNYL` only if source evidence explicitly supports it; otherwise null.
- `premium_preview`: from `premium` with preview label and evidence.
- `coverage_summary`: from plan, territoriality, optional coverages and warning text.
- `deductible_preview`: from `deductible`.
- `coinsurance_preview`: from `coinsurance` and `coinsuranceCap`.
- `sum_assured_preview`: from `sumInsured`.
- `payment_frequency`: from `paymentMode`.
- `valid_until`: not modeled unless source provides it.
- `assumptions`: quote is illustrative; issued policy controls; no provider execution.
- `exclusions_or_waiting_periods`: not modeled by primary engine.
- `source_engine_ref`: `gmm-quote-summary-engine.js`.
- `source_evidence_ids`: adapter-supplied static evidence ids.
- `freshness_metadata`: adapter-supplied `preview_static`.
- `audit_event`: `read_model_used`.
- `blocked_effects`: adapter-supplied blocked real effects.
- `safety_flags`: all false.

## Fields Not Mappable Yet

- canonical carrier truth without source ownership;
- real premium as binding quote;
- real coverage as contractual fact;
- valid-until date unless present in source;
- exclusions/waiting periods unless parsed from evidence;
- provider quote id;
- quote PDF/proposal artifact;
- send/save/convert quote state;
- approval status for quote generation;
- policy-linked truth unless using Policy Read Model evidence.

## Required Guards For 069C

- local/static fixture only;
- read-only adapter mode;
- deterministic quote id;
- no generated ids or `Date.now()` in adapter output;
- no `crypto.randomUUID()` in adapter output;
- no provider/runtime/network/storage;
- no quote write;
- no policy write;
- no CRM or pipeline write;
- no task/calendar/message action;
- all safety flags false;
- blocked effects explicit;
- source evidence ids required for non-empty fields;
- freshness metadata required for non-empty fields;
- safe empty state and safe error `QUOTE_READ_MODEL_NOT_MODELED`.

## Test Assets For 069C

Reusable candidates:

- `forge-gmm-sprint-2-smoke-test.js`
- `forge-gmm-sprint-3-smoke-test.js`
- `forge-gmm-sprint-4-smoke-test.js`
- `forge-gmm-real-case-smoke-test.js`
- `proposal-family-smoke-test.js`
- `tests/real-gmm-quote-test.js` (requires local PDF/OCR; not deterministic for all environments)
- `tests/gmm-out-of-pocket-test.js` (requires local PDF/OCR; not deterministic for all environments)

069C should prefer deterministic inline/static GMM quote text over local PDF/OCR dependencies.

## Final

DECISION=PASS_069B_QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPE

LOCKED_DECISION=QUOTE_EXISTING_ENGINE_INPUT_OUTPUT_MAPPING_SCOPED

NEXT=069C_QUOTE_READ_MODEL_ADAPTER_IMPLEMENTATION
