# Forge Product Intelligence Unified Read Model Scope 073C

PHASE=073C_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPE

STATUS=PASS

DECISION=PASS_073C_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPE

LOCKED_DECISION=PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPED

NEXT=073D_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_IMPLEMENTATION

## Purpose

073C defines the unified Product Intelligence Read Model contract before any Quote PDF / Quote Preview promotion.

The read model is read-only, preview-safe, evidence-backed, freshness-aware, and designed to reconcile existing Product Intelligence parsers, calculators, coverage engines, product-specific bridges, and shared currency/projection utilities.

## Base Confirmed

073B is closed as:

- `PASS_073B_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE`
- `PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPED`
- `NEXT=073C_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPE`

## Scope Definition

Product Intelligence Read Model is:

- a read-only Product Intelligence projection;
- preview-safe;
- evidence-backed;
- freshness-aware;
- source-ownership-aware;
- designed to expose product semantics before quote promotion.

Product Intelligence Read Model is not:

- quote issuance;
- policy truth;
- carrier truth without source ownership;
- recommendation as fact;
- provider execution;
- a replacement for existing parsers or calculators;
- a duplicate quote engine.

## Schema

- `schemaVersion`: `forge.product_intelligence.read_model.v1`
- `domainId`: `product_intelligence`
- `mode`: `read_only`
- `routeClass`: `preview_safe`

## Required Fields

- `product_intelligence_id`
- `product_ref`
- `product_identity`
- `product_family`
- `carrier_ref`
- `market_ref`
- `source_module_refs`
- `parser_refs`
- `calculator_refs`
- `coverage_semantics`
- `premium_semantics`
- `currency_semantics`
- `projection_semantics`
- `quote_semantics`
- `policy_semantics`
- `evidence_refs`
- `freshness_metadata`
- `source_ownership`
- `confidence_state`
- `unknown_state`
- `blocked_state`
- `not_modeled_state`
- `adapter_refs`
- `audit_event`
- `blocked_effects`
- `safety_flags`

## Product Family Support

The read model must support:

- GMM;
- Vida Mujer;
- AVE;
- Imagina Ser;
- ORVI;
- SeguBeca;
- future product families.

Imagina Ser is a proven case. It is not the universal architecture.

## Source Priority

Product Intelligence source priority is:

1. Product schema / ontology.
2. Source ownership map.
3. Product-specific parser.
4. Evidence extraction.
5. Coverage intelligence.
6. Projection calculator.
7. Banxico/cache/currency engines.
8. Quote PDF preview consumer.

Quote PDF preview is a downstream consumer. It must not become the root Product Intelligence authority.

## Safe Empty And Error Behavior

The read model must support safe empty states and these safe errors:

- `PRODUCT_INTELLIGENCE_READ_MODEL_NOT_MODELED`
- `PRODUCT_INTELLIGENCE_SOURCE_EVIDENCE_REQUIRED`
- `PRODUCT_INTELLIGENCE_FRESHNESS_REQUIRED`
- `PRODUCT_INTELLIGENCE_PRODUCT_FAMILY_NOT_MAPPED`
- `PRODUCT_INTELLIGENCE_CALCULATOR_NOT_MAPPED`

## Safety Flags

All safety flags default to false:

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

## Reuse Rule

The unified read model must reference existing parser and calculator surfaces through refs. It must not copy or duplicate:

- quote parsers;
- GMM calculators;
- AVE calculators;
- Vida Mujer survival calculators;
- Imagina Ser / retirement UDI projection calculators;
- Banxico/cache/currency utilities;
- Quote Action Contract or Approval Gate behavior.

## Next Phase

073D may implement a local/static/read-only read model adapter only within this scoped contract.
