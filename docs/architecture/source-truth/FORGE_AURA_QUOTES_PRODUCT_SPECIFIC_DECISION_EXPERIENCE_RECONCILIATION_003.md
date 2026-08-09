# Forge Aura Quotes Product-Specific Decision Experience Reconciliation 003

```text
PHASE=FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003
BRANCH=feature/aura-quotes-product-specific-decision-experience-003
BASE_BRANCH=main
BASE_SHA=dd814c3c9511ab7ab8751ecb25366d39635129eb
IMPLEMENTATION_MODE=PRODUCT_SPECIFIC_PRESENTATION_READ_MODEL_RECONCILIATION
PRODUCTS=IMAGINA_SER|ORVI|SEGUBECA|VIDA_MUJER
STATUS=IMPLEMENTED_CI_VALIDATED
NEW_PRODUCT_INTELLIGENCE=NO
NEW_QUOTE_ENGINE=NO
NEW_FINANCIAL_FORMULA=NO
NEW_MARKET_DATA_SOURCE=NO
NEW_PERSISTENCE=NO
MATERIAL3_VISUAL_AUTHORITY=NO
AURA_LIGHT_VISUAL_AUTHORITY=YES
HUMAN_DECISION_REQUIRED=YES
```

## Decision

Forge Aura Cotizaciones consumes the existing first-class product-specific dashboard/read-model authorities for Imagina Ser, ORVI, SeguBeca and Vida Mujer instead of forcing those products through one generic commercial hierarchy.

The implementation adds one read-only composition boundary:

`docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`

This file is not Product Intelligence, a quote calculator, parser, forecast engine, market-data provider or persistence owner. It selects and normalizes already-existing product-specific presentation models so Aura can render them with Forge Aura Light 2026 without importing the Material 3 renderer or its visual styles.

## Constitutional gate

The implementation was preceded by:

`docs/evidence/FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003_CONSTITUTIONAL_GATE.md`

The gate recorded `GO_WITH_EXISTING_AUTHORITIES_ONLY` before the first production mutation.

Ownership remains:

- source PDF/document → document evidence;
- existing PDF parser → extraction;
- Accepted Quote → quote-specific accepted evidence and review snapshot;
- Product Intelligence → product, coverage, premium, currency and projection semantics plus missing/blocked state;
- existing product-dashboard adapters → product-specific presentation mapping;
- Banxico/provider/cache governance → current economic reference evidence;
- forecast authorities → scenarios/assumptions;
- human review → confirmation and Presentation Maker approval/export authorization;
- Aura → composition/presentation only.

## Root cause reconciled

Audit 008 established that productive parsers, Accepted Quote, Product Intelligence and mature product-specific narratives already existed while Aura flattened the result into generic contractual/current/projected facts, generic benefit blocks and a universal primary-fact rule.

Two high-value defects are now structurally prevented:

1. ORVI: a generic `calculation.annualPremium` alias can no longer outrank an available source-backed annual premium.
2. SeguBeca: a protection amount can no longer displace the canonical education objective as the product hero merely because the protection number is larger.

## Canonical flow

```text
PDF
→ existing productive parser
→ Accepted Quote Packet
→ existing calculateAcceptedQuote()
→ existing Product Intelligence / benefit-summary authorities
→ existing product-specific dashboard model
→ forge-product-specific-decision-read-model.js
→ Forge Aura quotes adapter
→ Forge Aura Light renderer
→ explicit human confirmation
→ existing printable / Presentation Maker boundaries
```

Unsupported products retain the phase-002 generic fallback.

## Product-specific read model

The neutral compositor imports the existing model builders/detectors for the four declared products and only:

- selects the existing product-specific model;
- preserves sections, labels and evidence;
- groups existing sections into Aura summary, benefits and time/projection buckets;
- exposes missing information;
- exposes a hero from already-structured product evidence;
- preserves human-decision and ORVI recommendation boundaries;
- exposes source-backed mandatory premium/protection facts when already published.

It does not parse PDF text, calculate premiums, calculate dotales, calculate recovery, project UDI, resolve a live market rate, persist data or create recommendations.

## Imagina Ser

Aura consumes the existing Imagina Ser dashboard/Product Intelligence presentation model and preserves:

- existing product-specific hero;
- plan/contribution/protection summary;
- construction/future-value section when published;
- recommended/secondary product detail;
- explicit missing information.

No contribution, protection, retirement or recovery number is recalculated by Aura.

## ORVI

Aura consumes the existing ORVI Accepted Quote route, dashboard/read model and verified-rate metadata.

The hero is the existing primary protection item. Annual premium source priority is:

```text
Product Intelligence premium_structure.total_annual_premium
→ nativeResult.totalAnnualPremium
→ nativeResult.annualPremium
→ packet.annualPremium
→ calculation.annualPremium fallback
```

This removes the generic alias precedence that allowed a zero alias to obscure a real source-backed premium. No PDF-specific replacement value is introduced.

ORVI preserves the existing distinction between future scenario and guaranteed recovery, current verified economic reference evidence, blocked future USD behavior where applicable, recommendation ownership and human decision.

## SeguBeca

Aura consumes existing participant-role, education-goal, delivery, contribution, protection and benefit semantics.

When the existing dashboard publishes an evidenced `education_goal` section, that existing value becomes the product hero. BAIT/protection remains visible under protection but cannot become the product objective because its sum assured is numerically larger.

This is a presentation-hierarchy correction only; no education or protection value is recalculated.

## Vida Mujer

Aura consumes existing Vida Mujer product-dashboard semantics and preserves separate areas for:

- contribution;
- protection;
- women-specific protection/benefits;
- scheduled endowments/dotales;
- recovery/time-value detail;
- recommended/additional coverages;
- missing information.

Phase 003 does not author, modify or duplicate any existing legacy Vida Mujer formula. It consumes structured output only.

## Aura adapter and renderer

`docs/static-preview/forge-aura/quotes/quotes-adapter.js` now builds `productDecision`, reads existing ORVI rate context where available and prioritizes Product Intelligence/native premium evidence before the generic calculation alias. Accepted Quote, lifecycle, printable and Presentation Maker boundaries remain unchanged.

`docs/static-preview/forge-aura/quotes/quotes-module.js` remains Aura-only. It imports no productive quote-runtime module directly and no Material 3 presenter/styles. For supported products it renders product-specific hero, summary, benefits, time/projection sections, missing information and provenance. Unsupported products use the generic fallback.

Phase-002 interaction contracts remain: honest system states, accessible tabs, bounded attention, explicit human confirmation, printable actions after acceptance and Presentation Maker after acceptance.

## Supersession rule

For the four declared products only, phase 003 supersedes:

- annual premium as universal hero;
- sum assured as universal second-choice hero;
- a single product-agnostic commercial hierarchy;
- generic benefit ordering when a supported product dashboard exists;
- generic aliases outranking source-backed premium semantics.

It does not supersede Aura Light visual authority, Product Intelligence, Accepted Quote, market-data, forecast, persistence or human-decision authorities.

## Runtime scope

Production runtime changes are limited to:

- `docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`;
- `docs/static-preview/forge-aura/quotes/quotes-adapter.js`;
- `docs/static-preview/forge-aura/quotes/quotes-module.js`.

No production changes were made to PDF parsers, Accepted Quote calculation code, Product Intelligence calculation/ontology truth, product financial formulas, Banxico/provider/cache code, Supabase/RLS/auth, lifecycle persistence, Pipeline/Cartera/compensation or Presentation Maker approval/export authority.

## Validation

The dedicated workflow runs syntax checks, phase-003 regressions, Aura phase-002 non-regression, Imagina Ser/SeguBeca/ORVI dashboard regressions, benefit-summary regression, PDF parser smoke, parser-ownership regression and `git diff --check`.

The phase regression locks:

- all four existing product authorities;
- no productive-runtime import from Aura renderer;
- no Material 3 visual import into Aura renderer;
- source-backed premium precedence over generic ORVI zero alias;
- no audit-PDF result hardcodes in production files;
- SeguBeca education hero over a larger BAIT test fixture;
- ORVI primary protection hero;
- Imagina Ser construction section;
- Vida Mujer scheduled-endowment and women-benefit sections.

Implementation CI runs `31292052298` and `31292136502` completed successfully during phase closure. The repository workflow remains the release gate for any later branch-head mutation.

## Release decision

```text
PDF_TO_ACCEPTED_QUOTE_BOUNDARY=PRESERVED
PRODUCT_INTELLIGENCE_OWNERSHIP=PRESERVED
PRODUCT_SPECIFIC_PRESENTATION=RESTORED_FOR_4_PRODUCTS
GENERIC_FALLBACK=PRESERVED_FOR_UNSUPPORTED_PRODUCTS
ORVI_ZERO_ALIAS_PRECEDENCE=REMOVED
SEGUBECA_EDUCATION_HERO=RESTORED_FROM_EXISTING_AUTHORITY
VIDA_MUJER_PRODUCT_SEMANTICS=PRESERVED
IMAGINA_SER_PRODUCT_SEMANTICS=PRESERVED
NEW_TRUTH=NO
NEW_ENGINE=NO
NEW_FORMULA=NO
HARD_CODED_REAL_PDF_RESULTS=NO
PR_ELIGIBILITY=DEDICATED_WORKFLOW_MUST_PASS_ON_PR_HEAD
```