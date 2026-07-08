# Forge Quote Preview PDF Engine Product Intelligence Integration Scope 075A

PHASE=075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE

STATUS=PASS

DECISION=PASS_075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED

NEXT=075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION

## Purpose

075A scopes how the Quote Preview PDF Engine must integrate with the Product Intelligence binding layer before any PDF parsing, quote preview extraction, calculation, Banxico lookup, or quote-specific preview promotion.

This phase does not implement PDF reading, parser execution, calculator execution, Banxico calls, provider calls, quote creation, quote writes, or real effects.

## Base Confirmed

074D is closed as:

- `PASS_074D_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_DECISION_LOCK`
- `QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_BINDING`
- `NEXT=075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE`

## Integration Rule

The Quote Preview PDF Engine must bind through Product Intelligence before using any quote-specific PDF preview or parsing surface.

Required sequence:

1. Receive a quote preview PDF request.
2. Identify or infer product family only as a hint.
3. Bind Quote Preview request to Product Intelligence through the 074B binding adapter.
4. Resolve allowed parser/calculator references from Product Intelligence.
5. Check evidence requirements, freshness requirements, blocked effects, and safety flags.
6. Only future scoped phases may execute preview parsing, and only if execution remains no-effect and source-evidence-bound.

## Integration Inputs

- `quote_preview_pdf_request_id`
- `source_document_ref`
- `source_document_kind`
- `product_family_hint`
- `product_ref_hint`
- `carrier_ref_hint`
- `source_evidence_refs`
- `requested_preview_mode`
- `binding_ref`

## Integration Outputs

- `quote_preview_pdf_integration_id`
- `quote_preview_binding_ref`
- `product_intelligence_ref`
- `product_family`
- `allowed_parser_refs`
- `allowed_calculator_refs`
- `pdf_preview_engine_ref`
- `evidence_requirements`
- `freshness_requirements`
- `blocked_effects`
- `safety_flags`
- `safe_error`

## Safe Errors

- `QUOTE_PREVIEW_PDF_PRODUCT_INTELLIGENCE_BINDING_REQUIRED`
- `QUOTE_PREVIEW_PDF_PRODUCT_FAMILY_NOT_MAPPED`
- `QUOTE_PREVIEW_PDF_PARSER_NOT_ALLOWED`
- `QUOTE_PREVIEW_PDF_CALCULATOR_NOT_ALLOWED`
- `QUOTE_PREVIEW_PDF_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_PREVIEW_PDF_FRESHNESS_REQUIRED`
- `QUOTE_PREVIEW_PDF_EXECUTION_NOT_AUTHORIZED`

## Non-Authorization Boundary

075A does not authorize:

- PDF read;
- OCR;
- parser execution;
- calculator execution;
- Banxico call;
- UDI/MXN calculation;
- premium calculation;
- projection calculation;
- quote generation;
- quote save/send;
- provider call;
- backend connection;
- CRM, policy, pipeline, task, calendar, or message writes;
- invented product, premium, coverage, projection, or quote truth.

## Handoff To 075B

075B may implement only a local/static/read-only integration adapter that validates the required binding and exposes references. It must not read PDFs, execute parsers, execute calculators, call Banxico, or create quote truth.

## Final Decision

DECISION=PASS_075A_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED

NEXT=075B_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_IMPLEMENTATION
