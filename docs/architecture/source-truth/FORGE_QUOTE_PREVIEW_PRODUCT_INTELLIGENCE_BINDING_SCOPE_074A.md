# Forge Quote Preview Product Intelligence Binding Scope 074A

PHASE=074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

STATUS=PASS

DECISION=PASS_074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPED

NEXT=074B_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_IMPLEMENTATION

## Purpose

074A scopes the binding between Quote Preview and the Product Intelligence Unified Read Model locked in 073F.

Quote Preview must consume Product Intelligence before using quote-specific preview engines. Quote Preview is a consumer. It does not own product semantics, parser selection, calculator selection, coverage semantics, premium semantics, currency semantics, projection semantics, evidence rules, freshness rules, or product truth.

## Base Confirmation

073F is closed and Product Intelligence Unified Read Model is locked as:

`PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_LOCKED_AS_LOCAL_STATIC_READ_ONLY_REFERENCE_CATALOG`

The locked catalog covers:

- GMM
- Vida Mujer
- AVE
- Imagina Ser
- ORVI
- SeguBeca

073F also locked:

- Imagina Ser is a proven case, not universal architecture.
- Quote PDF Preview is consumer/reference only.
- Quote promotion must bind to Product Intelligence before using quote-specific preview engines.

## Binding Rule

Quote Preview must:

- consume Product Intelligence read model records;
- resolve product-family references through Product Intelligence;
- select parser references only from Product Intelligence references;
- select calculator references only from Product Intelligence references;
- inherit evidence requirements from Product Intelligence;
- inherit freshness requirements from Product Intelligence;
- inherit blocked effects and safety flags from Product Intelligence;
- preserve unknown, blocked, and not-modeled states.

Quote Preview must not:

- own product semantics;
- choose parsers or calculators outside Product Intelligence references;
- duplicate Product Intelligence logic;
- treat Product Intelligence references as canonical product, premium, coverage, projection, or quote truth;
- promote product-specific bridges as universal architecture.

## Binding Inputs

Future 074B binding adapter must accept a preview-safe input envelope with:

- `quote_preview_request_id`
- `product_family_hint`
- `product_ref_hint`
- `carrier_ref_hint`
- `source_document_ref`
- `source_evidence_refs`
- `requested_preview_mode`

All input hints are candidate signals. They are not product truth, carrier truth, quote truth, or approval to execute engines.

## Binding Outputs

Future 074B binding adapter must return a preview-safe output envelope with:

- `quote_preview_binding_id`
- `product_intelligence_ref`
- `product_family`
- `parser_ref`
- `calculator_refs`
- `coverage_semantics_ref`
- `premium_semantics_ref`
- `currency_semantics_ref`
- `projection_semantics_ref`
- `evidence_requirements`
- `freshness_requirements`
- `blocked_effects`
- `safety_flags`
- `safe_error`

The output is a binding decision only. It must not execute the selected parser, calculator, Banxico utility, PDF reader, provider, quote engine, or backend.

## Safe Errors

- `QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND`
- `QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED`
- `QUOTE_PREVIEW_PARSER_NOT_MAPPED`
- `QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED`
- `QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_PREVIEW_FRESHNESS_REQUIRED`

## Source Priority

Quote Preview binding must resolve product context in this order:

1. Explicit `product_family_hint`.
2. Product Intelligence `product_ref` match.
3. Carrier/product evidence match.
4. Parser-supported product family from Product Intelligence references.
5. Unknown or not-modeled state.

When evidence is insufficient, binding must stop in a safe not-bound state. It must not guess a product family, parser, calculator, carrier, coverage, premium, projection, or quote.

## Non-Authorization

074A does not authorize:

- PDF read;
- parser execution;
- calculator execution;
- Banxico call;
- quote generation;
- provider call;
- quote write;
- quote send;
- CRM write;
- policy write;
- pipeline write;
- task creation;
- calendar creation;
- message send;
- backend connection;
- browser persistence;
- secret access;
- real engine execution.

## Future 074B Handoff

074B may implement a local/static/no-effect binding adapter only.

074B must:

- consume the 073D Product Intelligence read model adapter;
- return references only;
- preserve all safety flags as false;
- preserve blocked effects;
- avoid parser, calculator, Banxico, PDF, quote, provider, backend, CRM, policy, pipeline, task, calendar, and message execution;
- keep Quote PDF Preview as consumer/reference only.

## Final Decision

DECISION=PASS_074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPED

NEXT=074B_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_IMPLEMENTATION
