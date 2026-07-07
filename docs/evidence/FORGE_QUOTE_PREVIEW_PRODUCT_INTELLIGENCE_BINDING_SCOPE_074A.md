# Forge Quote Preview Product Intelligence Binding Scope 074A

PHASE=074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

STATUS=PASS

DECISION=PASS_074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPED

NEXT=074B_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_IMPLEMENTATION

## Evidence Summary

074A scopes how Quote Preview must bind to Product Intelligence before any Quote PDF Preview promotion.

Scoped binding:

- Quote Preview consumes Product Intelligence read model.
- Quote Preview does not own product semantics.
- Quote Preview does not choose parsers/calculators outside Product Intelligence references.
- Quote Preview does not duplicate Product Intelligence logic.
- Quote Preview must inherit evidence, freshness, blocked effects, and safety flags.
- Quote Preview must stop with safe errors when Product Intelligence cannot bind a product family, parser, calculator, evidence, or freshness requirement.

## Safe Errors

- `QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_NOT_BOUND`
- `QUOTE_PREVIEW_PRODUCT_FAMILY_NOT_MAPPED`
- `QUOTE_PREVIEW_PARSER_NOT_MAPPED`
- `QUOTE_PREVIEW_CALCULATOR_NOT_MAPPED`
- `QUOTE_PREVIEW_SOURCE_EVIDENCE_REQUIRED`
- `QUOTE_PREVIEW_FRESHNESS_REQUIRED`

## Decision

DECISION=PASS_074A_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE

LOCKED_DECISION=QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPED

NEXT=074B_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_IMPLEMENTATION
