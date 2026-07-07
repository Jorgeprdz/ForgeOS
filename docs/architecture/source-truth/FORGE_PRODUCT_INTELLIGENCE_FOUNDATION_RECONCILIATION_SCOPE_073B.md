# Forge Product Intelligence Foundation Reconciliation Scope 073B

PHASE=073B_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE

STATUS=PASS

DECISION=PASS_073B_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE

LOCKED_DECISION=PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPED

NEXT=073C_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPE

## Purpose

073B reconciles the existing Product Intelligence foundation before any further Quote PDF / Quote Preview promotion.

Forge already has Product Intelligence modules, tests, parsers, calculators, projection engines, product-specific bridges, and evidence documents. The next quote phase must not treat Imagina Ser as the universal architecture, must not create a new quote engine, and must not duplicate existing Product Intelligence calculators or parsers.

## Base Confirmed

073A is present in the active trees as:

- `073A_PRODUCT_INTELLIGENCE_BEFORE_QUOTE_PROMOTION_CHECKPOINT`
- `PRODUCT_INTELLIGENCE_EXISTS_BUT_REQUIRES_UNIFIED_READ_MODEL_BEFORE_QUOTE_PROMOTION`
- `073B_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE`

## Existing Product Intelligence Inventory

| Area | Classification | Evidence |
|---|---|---|
| `product-intelligence/coverage/` | coverage intelligence | coverage orchestrator, event-benefit engine, GMM out-of-pocket engine, medical-event engines, smoke tests |
| `product-intelligence/evidence/` | parser / evidence extractor / quote preview surface | GMM quote parser, Solucionline retirement parser, quote PDF preview engine |
| `product-intelligence/quotes/` | quote input/extraction entities | quotation input and quotation extraction result entities |
| `product-intelligence/projections/` | projection engines | value projection, UDI/USD projection, projection milestones, pyramid/risk/story engines |
| GMM surfaces | parser / calculator / coverage intelligence / docs evidence | `gmm-quote-parser.js`, `gmm-out-of-pocket-engine.js`, GMM tests, `docs/04-product-intelligence/FORGE_GMM_*` |
| Vida Mujer / AVE | calculator / product-specific bridge / product knowledge | survival schedule, AVE growth, death benefit, rescue, portfolio, eligibility, confidence engines and tests |
| Imagina Ser / Solucionline / retirement | parser / projection bridge / quote preview surface | Solucionline parser, quote PDF preview engine, retirement UDI projection, future MXN bridge, retirement scenario tests |
| ORVI / SeguBeca | product-specific bridge / docs-evidence only / candidate engines | ORVI decision/presentation/MXN conversion engines, SeguBeca presentation/education engines and reports |
| Banxico / UDI / MXN / currency | shared Product Intelligence utility / projection dependency | Banxico rate engine, Edge provider, cache engine, currency timeline, current and future value engines |
| Docs and evidence | docs/evidence only | `docs/04-product-intelligence/`, archived projection evidence, Banxico source audit |

## Product Intelligence Foundation Ownership

Before Quote promotion, Product Intelligence Foundation must own:

- product identity;
- product family;
- coverage semantics;
- premium semantics;
- currency semantics;
- projection semantics;
- evidence references;
- freshness metadata;
- source ownership;
- confidence, unknown, missing, blocked, and not-modeled states;
- product-specific adapter references;
- product-specific parser references;
- product-specific calculator references;
- shared utility references for Banxico, currency conversion, and projection.

## Non-Ownership Boundary

Product Intelligence Foundation must not own:

- quote writes;
- provider execution;
- policy truth;
- recommendation as fact;
- CRM writes;
- pipeline writes;
- task creation;
- calendar creation;
- message actions;
- official quote issuance;
- carrier/product truth without source ownership;
- premium, coverage, projection, or recommendation invented as fact.

## Required Unified Read Model Fields

Future `073C_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_SCOPE` must define a read model with fields equivalent to:

- `schemaVersion`
- `domainId`
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

## Source Priority

Product Intelligence source priority is scoped as:

1. Product schema / ontology.
2. Product-specific parser.
3. Evidence extraction.
4. Projection calculator.
5. Banxico/cache/currency engines.
6. Quote PDF preview surface.

Quote PDF preview is a consumer and presentation/preview surface. It is not the root Product Intelligence source.

## Explicit Reconciliation Decisions

- Imagina Ser is a proven case, not the universal architecture.
- GMM, Vida Mujer, AVE, ORVI, SeguBeca, and future product families must fit the same Product Intelligence foundation.
- Quote promotion must reuse existing calculators, parsers, bridges, and evidence rules.
- Quote promotion must not duplicate Product Intelligence engines.
- The next phase is a unified read model scope, not runtime implementation.

## Boundary

073B is docs/reconciliation scope only. No UI, backend, provider, CRM, policy, quote, pipeline, task, calendar, message, auth, secret, browser persistence, or real engine effect is authorized.
