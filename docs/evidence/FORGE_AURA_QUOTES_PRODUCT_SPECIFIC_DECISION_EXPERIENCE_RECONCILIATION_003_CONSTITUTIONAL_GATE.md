# Forge Aura Quotes Product-Specific Decision Experience Reconciliation 003 — Constitutional Gate

```text
PHASE=FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003
BRANCH=feature/aura-quotes-product-specific-decision-experience-003
BASE_BRANCH=main
BASE_SHA=dd814c3c9511ab7ab8751ecb25366d39635129eb
GATE_ORDER=BEFORE_PRODUCTION_MUTATION
LOGICAL_WORKTREE=REMOTE_BRANCH_CREATED_FROM_IMMUTABLE_MAIN_SHA_NO_LOCAL_MUTABLE_WORKTREE_USED
PRIOR_AUDIT_BRANCH_USED_AS_BASE=NO
PRIOR_HOTFIX_BRANCH_USED_AS_BASE=NO
MATERIAL3_BRANCH_USED_AS_BASE=NO
DECISION=GO_WITH_EXISTING_AUTHORITIES_ONLY
```

## Purpose

This gate authorizes a presentation/integration reconciliation for the four first-class Quotes products: Imagina Ser, ORVI, SeguBeca and Vida Mujer. The phase may reconnect Forge Aura to existing Product Intelligence and product-dashboard authorities. It may not create a new quote engine, Product Intelligence engine, financial formula, parser, market-data source, persistence source, or parallel truth.

The historical audit `docs/evidence/FORGE_AURA_QUOTES_REAL_PDF_PRODUCT_INTELLIGENCE_AUDIT_008.md` is diagnostic evidence only. Its branch `audit/quotes-real-pdf-product-intelligence-008` is not a production base.

## Constitution and constitutional authorities found

Primary constitution:

- `FORGE_CONSTITUTION_V3.md`

Applicable constitutional principles:

- Evidence precedes judgment.
- Product semantics are more important than number extraction.
- No invented data.
- No projection without explicit rates/assumptions.
- Decision clarity first.
- Human judgment remains accountable.
- Product Intelligence must remain deterministic, evidence-backed and source-aware.

Current truth/governance authorities inspected:

- `docs/05-truth/SOURCE_OWNERSHIP_REGISTRY_001.md`
- `docs/05-truth/MARKET_DATA_SOURCE_REGISTRY_001.md`
- `docs/architecture/source-truth/FORGE_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE_073B.md`
- `docs/architecture/source-truth/FORGE_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_IMPLEMENTATION_073D.md`
- `docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE_074A.md`
- `docs/architecture/source-truth/FORGE_AURA_QUOTES_PREMIUM_DECISION_EXPERIENCE_RECONCILIATION_002.md`
- `docs/roadmap/FORGE_QUOTE_TO_SALES_PRESENTATION_ROADMAP_R16J.md`

## ADR applicability

The historical Imagina Ser set remains applicable to this presentation/integration boundary:

- ADR-003 — Recommendation vs Decision / Authority Boundary.
- ADR-004 — No Invented Recommendations.
- ADR-005 — Product Truth Boundary (`Final`).
- ADR-007 — Forecast Truth Boundary (`Final`).
- ADR-008 — Economic Evidence Boundary (`Final`).

No later authority inspected supersedes the relevant obligations of ADR-005, ADR-007 or ADR-008. ADR-003 and ADR-004 remain referenced by the current source-ownership and market-data governance even though their own document status is Proposed/Draft; this phase preserves rather than expands their human-authority boundary.

## Product Intelligence ownership

`FORGE_PRODUCT_INTELLIGENCE_FOUNDATION_RECONCILIATION_SCOPE_073B` establishes that Product Intelligence owns product identity/family semantics, coverage semantics, premium semantics, currency semantics, projection semantics, evidence/freshness/source ownership, missing/blocked/not-modeled state and references to product-specific adapters/parsers/calculators.

`FORGE_PRODUCT_INTELLIGENCE_UNIFIED_READ_MODEL_IMPLEMENTATION_073D` is a read-only reference catalog and does not execute or duplicate calculators, parsers, Banxico utilities or quote engines.

`FORGE_QUOTE_PREVIEW_PRODUCT_INTELLIGENCE_BINDING_SCOPE_074A` establishes that Quote Preview is a consumer and must not own or redefine product semantics, parser selection, calculator selection, premium/coverage/currency/projection semantics or Product Truth.

Therefore Aura Quotes is authorized to consume existing semantic/read-model/dashboard output and prohibited from rebuilding those semantics locally.

## Truth ownership map for this phase

| Claim / behavior | Canonical owner | Aura role |
| --- | --- | --- |
| Raw PDF evidence | Source quote/document | Pass to existing parser; never reinterpret raw PDF text |
| Parser extraction | Existing product/parser authority | Consume through Accepted Quote path |
| Quote-specific facts | Accepted Quote / quote document evidence boundary | Display with provenance |
| Product meaning, benefits, coverage/premium semantics | Product Intelligence | Consume only |
| Product-specific commercial hierarchy | Existing product-dashboard adapter/read model | Render in Aura design language |
| Current UDI / USD market source truth | Banxico SIE API through governed provider/cache boundary | Display only when verified metadata exists |
| Cache | Forge cache owner; evidence/copy only | Never promote to institutional source truth |
| Future projections/scenarios | Existing projection/forecast authority | Label as scenario/estimate, never contractual fact |
| Human confirmation | Advisor/client human decision boundary | Require explicit review/confirmation |
| Durable lifecycle/persistence | Existing Accepted Quote lifecycle/persistence boundary | Reuse; no new storage |
| Presentation Maker sourced facts / approval | Existing R16J Presentation Maker chain | Reuse; no automatic send/export approval |

## Product-specific authorities

### Imagina Ser

Inspected/recognized authority chain:

- `docs/evidence/r13b-imagina-ser-product-dashboard-adapter.md`
- `docs/evidence/r13c-imagina-ser-product-dashboard-adapter-implementation.md`
- `docs/evidence/r13d-imagina-ser-pdf-intake-and-dashboard-polish.md`
- `docs/evidence/r13e-imagina-ser-pdf-intake-and-dashboard-polish-implementation.md`
- `docs/architecture/source-truth/UNIFIED_PRODUCT_DASHBOARD_HERO_METRIC_AND_ALIGNED_RESPONSIVE_GRID_R16B.md`
- `docs/static-preview/quote-runtime/forge-imagina-ser-product-dashboard-adapter.js`
- `tests/imagina-ser-product-dashboard-adapter-test.mjs`

The adapter maps already-structured Product Intelligence blocks to `Resumen del plan`, `Lo que aportas`, `Lo que construyes`, `Lo que proteges`, scenarios, recommended benefits, secondary details and missing information. It performs no product calculation.

### ORVI

Inspected/recognized authority chain:

- `docs/architecture/source-truth/ORVI_STATIC_PREVIEW_RUNTIME_RATE_BRIDGE_AND_END_TO_END_DASHBOARD_WIRING_R15L.md`
- `docs/static-preview/quote-runtime/forge-orvi-static-preview-runtime.js`
- `docs/static-preview/quote-runtime/forge-orvi-product-dashboard-adapter.js`
- Accepted Quote ORVI routing in `docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js`
- current UDI/USD ownership in `docs/05-truth/MARKET_DATA_SOURCE_REGISTRY_001.md`

ORVI remains life-insurance protection. Current MXN is a verified-rate equivalence. Future values remain scenario output; future USD conversion remains blocked where the authority blocks it. Recovery percentage remains a comparison, not investment return. Recommendation remains `null`; human decision remains required.

### SeguBeca

Inspected/recognized authority chain:

- `docs/evidence/r14c-segubeca-solucionline-pdf-intake-implementation.md`
- `docs/static-preview/quote-runtime/forge-segubeca-product-dashboard-adapter.js`
- Accepted Quote SeguBeca routing in `docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js`
- product-specific participant, education-goal, delivery, protection and benefit semantics in the SeguBeca dashboard adapter
- audit 008 real-PDF evidence

The commercial objective is education. Participant-role semantics, education target, delivery form, protection and recommended coverages must remain distinct.

A presentation-priority conflict was identified: R16B documented preference for explicit canonical sum assured before education target, while the real-PDF audit demonstrates that a coverage-level BAIT sum-assured line can become the hero and obscure the canonical education objective. Phase 003 may correct the existing SeguBeca presentation adapter so a validated education goal wins the hero when present. This is a hierarchy/presentation correction over already-published evidence; it does not change Product Truth or financial values.

### Vida Mujer

Inspected/recognized authority chain:

- product-specific Accepted Quote routing in `docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js`
- `docs/static-preview/forge-alive-material3/quote-runtime-vida-mujer-handoff-m05e009.js`
- `docs/static-preview/forge-alive-material3/forge-vida-mujer-product-dashboard-adapter.js`
- `tests/ui-m05i-vida-mujer-commercial-document-test.mjs`
- audit 008 real-PDF evidence

The existing product dashboard preserves life protection, scheduled endowments/dotales, recovery/AVE and women-specific protection/recommended-coverages semantics. Aura may consume these outputs; it may not recreate survival/dotal schedules or monetary calculations.

## Accepted Quote, Quote Preview and Presentation Maker boundaries

The current `forge-accepted-quote-adapter.js` already has product-specific routes for ORVI, Vida Mujer and SeguBeca before the generic retirement path. Phase 003 therefore must not add an Aura-owned calculator.

The R16J roadmap preserves explicit human quote acceptance, Accepted Quote review snapshots, presentation creation only after acceptance, revision-aware human approval and separate export authorization. Phase 003 must not bypass these boundaries.

## Aura Light 2026 boundary

Phase 002 remains the visual/interaction baseline for Quotes:

- Forge Aura Light 2026 is the exclusive visual authority.
- No Material 3 visual CSS/classes/components may become the Aura visual source.
- `Nueva cotización`, honest loading, attention limits, accessible tabs, human confirmation and Presentation Maker CTA remain.
- Product-specific semantic models may be consumed without importing Material visual treatment.

## Superseded presentation behavior

For the four first-class products only, phase 003 supersedes these phase-002 generic presentation behaviors:

- `annual_premium` as universal hero priority;
- one generic contractual/current/projected hierarchy for every product;
- generic benefit-block ordering when a product-specific dashboard model exists;
- frontend aliases/heuristics that outrank product-specific source fields.

The generic presentation remains a fallback for products without a supported product-specific decision model.

The following are NOT superseded:

- Accepted Quote ownership;
- parser ownership;
- Product Intelligence ownership;
- economic evidence / Banxico ownership;
- forecast labels and assumptions;
- human confirmation;
- lifecycle/persistence;
- Presentation Maker approval/export boundaries;
- Aura Light visual authority.

## Allowed surfaces

Production changes are limited to the minimum presentation/integration surfaces necessary to consume existing product-specific models, plus a narrowly scoped correction to an existing product-dashboard presentation hierarchy where required by real-PDF evidence.

Expected allowed surfaces:

- `docs/static-preview/forge-aura/quotes/**`
- existing product-dashboard presentation selector/model code only when necessary to expose already-authoritative semantics to Aura
- dedicated tests, fixtures, workflow and phase evidence/source-truth documents

## Prohibited surfaces

Without a new constitutional gate, phase 003 may not modify:

- product parsers or raw PDF extraction rules;
- financial/calculation engines;
- Product Intelligence source calculations or ontology truth;
- Banxico/provider/cache behavior or tokens;
- database schema, Supabase, RLS or auth;
- CRM, Pipeline, Cartera or compensation engines;
- Accepted Quote durable persistence semantics;
- automatic client communication;
- Presentation Maker sourced-fact mutation, approval or export authority;
- hardcoded values copied from the audit PDFs;
- browser persistence as a new truth source.

## GO / NO-GO decision

`GO`.

The gate found no architectural conflict that requires a new truth engine. The defect is primarily a consumer/presentation degradation: product-specific authorities already exist, while Aura currently flattens them. The narrow SeguBeca hero conflict is resolvable inside the existing product-dashboard presentation authority without inventing a value or formula.

Implementation condition:

> PDF → Accepted Quote → Product Intelligence / existing product-specific dashboard authority → Aura Light renderer.

If implementation requires deriving a new financial number, interpreting raw PDF text in Aura, guessing a product family, changing a market-data rate, or creating new persistence, the gate automatically returns to `NO-GO` for that change.
