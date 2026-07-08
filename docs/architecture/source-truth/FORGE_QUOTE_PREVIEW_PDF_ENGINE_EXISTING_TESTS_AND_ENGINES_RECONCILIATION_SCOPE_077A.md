# Forge Quote Preview PDF Engine Existing Tests and Engines Reconciliation Scope 077A

PHASE=077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE

STATUS=PASS

DECISION=PASS_077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPED

NEXT=077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION

## Purpose

077A scopes reconciliation of existing quote/PDF tests, fixtures, engines, parsers, preview surfaces, calculators, rate providers, and Product Intelligence adapters.

077A is not an implementation phase. It does not create a new extractor, parser, calculator, Banxico connector, quote engine, or provider bridge.

## Why This Phase Exists

A read-only Codex audit and Forge discovery found partial duplication risk.

The current architecture is on track only if Forge reconciles existing repo surfaces before adding any new PDF extraction or quote parsing work.

The audit verdict is:

`VERDICT=PARTIAL_DUPLICATION_RISK`

The duplication risk is:

`DUPLICATION_RISK=MEDIUM`

The mandatory rule is:

`NO_NEW_EXTRACTOR_BEFORE_RECONCILIATION=YES`

## Base Confirmed

076D is closed as:

- `PASS_076D_QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_DECISION_LOCK`
- `QUOTE_PREVIEW_PDF_ENGINE_REPO_PROMOTION_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_ADAPTER`
- `NEXT=077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE`

## Discovery Evidence

Discovery JSON:

`/data/data/com.termux/files/home/forge-discovery-20260707_212348/DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_20260707_212348.json`

Discovery report:

`/data/data/com.termux/files/home/forge-discovery-20260707_212348/DISCOVERY_077A_PRECHECK_EXISTING_QUOTE_PDF_TESTS_AND_ENGINES_REPORT_20260707_212348.md`

Discovery confirmed that existing tests and quote/PDF engine candidates exist and must be reconciled before implementation.

## Candidate Canonical Boundaries

077A scopes these candidate decisions for 077B:

| Area | Candidate canonical source | Status |
|---|---|---|
| PDF extraction | `policy-operations/evidence/policy-ocr-engine.js` | candidate canonical |
| PDF preview/orchestration | `product-intelligence/evidence/forge-quote-pdf-preview-engine.js` | candidate orchestrator/consumer |
| Solucionline parser | `product-intelligence/evidence/solucionline-retirement-parser.js` vs parsing inside preview engine | CANONICAL_DECISION_REQUIRED |
| Imagina Ser calculations | `retirement-future-udi-projection-engine.js` + `imagina-ser-future-mxn-bridge.js` | candidate canonical |
| UDI future projection | `retirement-future-udi-projection-engine.js` | candidate canonical |
| Banxico current rates | `exchange-rate-cache-engine.js` over `shared-banxico-rate-engine.js` / `shared-banxico-edge-provider.js` | candidate canonical chain |
| GMM quote parsing | `product-intelligence/evidence/gmm-quote-parser.js` | candidate canonical |
| GMM quote summary | `gmm-quote-summary-engine.js` | candidate summary/read model source |
| Product family semantics | `platform/adapters/product-intelligence/product-intelligence-read-model-adapter-073d.js` | current upstream semantic authority |
| Quote Preview binding | `platform/adapters/quote-preview/quote-preview-product-intelligence-binding-adapter-074b.js` | current binding |
| PDF-to-Product Intelligence integration | `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js` | current integration |
| PDF engine repo promotion guardrail | `platform/adapters/quote-preview/quote-preview-pdf-engine-repo-promotion-adapter-076b.js` | current reference/promotion adapter |

## Candidate Canonical Tests

077B must inspect and classify at least these tests if present:

- `tests/real-pdf-ocr-test.js`
- `tests/real-gmm-quote-test.js`
- `tests/gmm-out-of-pocket-test.js`
- `tests/real-retirement-scenario-test.js`
- `tests/real-retirement-mxn-scenario-test.js`
- `imagina-ser-master-test.js`
- `imagina-ser-banxico-integration-test.js`
- `retirement-future-udi-projection-smoke-test.js`
- `tests/product-intelligence/forge-quote-pdf-preview-engine-test.js`
- `tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js`

## 077B Required Work

077B must implement a local/static/read-only canonical mapping of existing surfaces.

077B must not execute PDF reads, parsers, calculators, Banxico, providers, backend calls, quote writes, or real effects.

077B must map:

- `surface_id`
- `file_path`
- `surface_type`
- `domain`
- `product_family`
- `canonical_candidate`
- `canonical_status`
- `allowed_role`
- `blocked_growth`
- `test_refs`
- `engine_refs`
- `product_intelligence_binding_required`
- `quote_preview_downstream_only`
- `safe_errors`
- `safety_flags`

## Blocked Growth

The following boundaries are scoped:

- `quote-preview-pdf-engine-repo-promotion-adapter-076b.js` must not grow into extraction, parsing, calculation, provider, or quote write behavior.
- `forge-quote-pdf-preview-engine.js` must not become a universal parser or universal calculator.
- `solucionline-retirement-parser.js` must not grow in parallel until the Solucionline parser boundary is decided.
- `gmm-quote-parser.js` and `gmm-quote-summary-engine.js` must be separated by parser vs summary/read-model responsibilities.
- No new extractor, parser, calculator, rate engine, quote engine, or provider bridge may be created before 077B/077C/077D reconciliation locks.

## Not Authorized

077A does not authorize:

- PDF read;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- backend connection;
- real engine execution;
- invented product, premium, coverage, projection, or quote truth.

## Final Decision

DECISION=PASS_077A_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_EXISTING_TESTS_AND_ENGINES_RECONCILIATION_SCOPED

NEXT=077B_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_IMPLEMENTATION
