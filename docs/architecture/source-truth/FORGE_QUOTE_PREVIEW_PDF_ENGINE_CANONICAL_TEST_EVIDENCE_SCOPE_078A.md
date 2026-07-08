# Forge Quote Preview PDF Engine Canonical Test Evidence Scope 078A

PHASE=078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE

STATUS=PASS

DECISION=PASS_078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPED

NEXT=078B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_IMPLEMENTATION

## Purpose

078A scopes canonical test evidence for the Quote Preview PDF Engine path.

This phase exists after 077D locked the existing surfaces mapping as a local/static/read-only reference catalog.

078A does not execute real quote/PDF tests. It only scopes how existing tests should be classified before any future QA or promotion step treats them as canonical evidence.

## Base Confirmed

077D is closed as:

- `PASS_077D_QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_DECISION_LOCK`
- `QUOTE_PREVIEW_PDF_ENGINE_EXISTING_SURFACES_CANONICAL_MAPPING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG`
- `NEXT=078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE`

## Scope Boundary

078A authorizes no:

- PDF read;
- OCR execution;
- parser execution;
- calculator execution;
- Banxico call;
- provider call;
- backend connection;
- quote generation;
- quote write or send;
- CRM, policy, pipeline, task, calendar, or message writes;
- invented product, premium, coverage, projection, or quote truth.

## Canonical Test Evidence Candidates

078A scopes these existing test candidates for 078B classification:

| Candidate | Evidence role | Canonical status |
|---|---|---|
| `tests/real-pdf-ocr-test.js` | real PDF/OCR candidate | candidate if present |
| `tests/real-gmm-quote-test.js` | real GMM quote candidate | candidate if present |
| `tests/gmm-out-of-pocket-test.js` | GMM cost summary candidate | candidate if present |
| `tests/real-retirement-scenario-test.js` | real retirement/Solucionline parser candidate | candidate if present |
| `tests/real-retirement-mxn-scenario-test.js` | retirement projection candidate | candidate if present |
| `imagina-ser-master-test.js` | Imagina Ser flow candidate | candidate if present |
| `imagina-ser-banxico-integration-test.js` | Banxico/cache metadata candidate | secondary or candidate if no network |
| `retirement-future-udi-projection-smoke-test.js` | UDI projection smoke candidate | supporting candidate if deterministic |
| `tests/product-intelligence/forge-quote-pdf-preview-engine-test.js` | preview fixture candidate | fixture evidence only |
| `tests/quote-preview-pdf-engine-repo-promotion-adapter-076b-test.js` | governance guardrail candidate | governance evidence |
| `tests/quote-preview-pdf-engine-existing-surfaces-canonical-mapping-adapter-077b-test.js` | mapping guardrail candidate | governance evidence |

## Required 078B Shape

078B must implement a local/static/read-only canonical test evidence registry.

078B must not execute tests. It must classify them.

Required fields:

- `test_id`
- `file_path`
- `evidence_type`
- `product_family`
- `source_surface_refs`
- `engine_refs`
- `fixture_refs`
- `canonical_candidate`
- `canonical_status`
- `evidence_role`
- `execution_policy`
- `blocked_growth`
- `safe_errors`
- `safety_flags`

## Required Classifications

078B must distinguish:

- real PDF/OCR evidence;
- real quote parser evidence;
- deterministic calculator evidence;
- rate/cache metadata evidence;
- fixture-only preview evidence;
- smoke tests;
- governance guardrail tests;
- tests that must remain secondary;
- tests requiring canonical decision.

## Blocked Misclassification

078B must prevent:

- treating fixture tests as real PDF evidence;
- treating governance tests as extraction proof;
- treating provider integration tests as safe runtime calls;
- treating preview summaries as quote truth;
- accepting invented expected financial values;
- creating new tests instead of cataloging existing tests.

## Final Decision

DECISION=PASS_078A_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_SCOPED

NEXT=078B_QUOTE_PREVIEW_PDF_ENGINE_CANONICAL_TEST_EVIDENCE_IMPLEMENTATION
