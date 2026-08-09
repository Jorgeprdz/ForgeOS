# Forge Aura Quotes Product-Specific Decision Experience Reconciliation 003

```text
PHASE=FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003
BRANCH=feature/aura-quotes-product-specific-decision-experience-003
BASE_BRANCH=main
BASE_SHA=dd814c3c9511ab7ab8751ecb25366d39635129eb
IMPLEMENTATION_MODE=PRODUCT_SPECIFIC_PRESENTATION_READ_MODEL_RECONCILIATION
PRODUCTS=IMAGINA_SER|ORVI|SEGUBECA|VIDA_MUJER
STATUS=IMPLEMENTED_PENDING_FINAL_HEAD_CI_AND_PR
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

Forge Aura Cotizaciones now consumes existing first-class product-specific dashboard/read-model authorities for Imagina Ser, ORVI, SeguBeca and Vida Mujer instead of forcing those products through one generic commercial hierarchy.

The implementation introduces one read-only composition boundary:

`docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`

This file is not a Product Intelligence engine, quote calculator, parser, forecast engine, market-data provider, or persistence owner. It selects and normalizes already-existing product-specific presentation models so Forge Aura can render them in the canonical Aura Light design language without importing the Material 3 renderer or its visual styles.

## Constitutional gate

Implementation was preceded by:

`docs/evidence/FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003_CONSTITUTIONAL_GATE.md`

The gate recorded `GO_WITH_EXISTING_AUTHORITIES_ONLY` before the first production mutation.

Applicable ownership remains:

- PDF/source document owns document evidence.
- Existing product PDF parsers own extraction.
- Accepted Quote owns quote-specific accepted evidence and review snapshot boundaries.
- Product Intelligence owns product semantics, coverage semantics, premium semantics, currency semantics, projection semantics, missing/blocked state and semantic references.
- Existing product-dashboard adapters own the supported product-specific presentation mapping.
- Banxico SIE API owns current institutional UDI/USD source truth through the governed provider/cache chain.
- Forecast/projection authorities own scenarios and assumptions.
- Human review owns confirmation and Presentation Maker approval/export authorization.
- Forge Aura owns only composition and presentation inside its declared design/interaction boundary.

## Root cause reconciled

Audit 008 established that the productive flow already had parsers, Accepted Quote, Product Intelligence and mature product-specific narratives, while Aura flattened the result into generic `contractualFacts`, `currentFacts`, `projectionFacts`, generic benefit blocks and a universal primary-fact rule.

Two especially important failure modes were reconciled without inventing values:

1. ORVI: a generic `calculation.annualPremium` alias could be zero and outrank the source-backed annual premium.
2. SeguBeca: a protection coverage amount could be promoted as the hero and obscure the product's canonical education objective.

## Canonical flow after phase 003

```text
PDF
→ existing productive PDF parser
→ Accepted Quote Packet
→ existing calculateAcceptedQuote()
→ existing Product Intelligence / benefit summary authorities
→ existing product-specific dashboard model
→ forge-product-specific-decision-read-model.js
→ Forge Aura quotes adapter
→ Forge Aura Light renderer
→ explicit human review / confirmation
→ existing printable + Presentation Maker boundaries
```

For unsupported products, the previous generic Aura fallback remains available. Product-specific routing is not generalized beyond the four declared products.

## New product-specific decision read model

`forge-product-specific-decision-read-model.js` imports the existing model builders/detectors for:

- Imagina Ser;
- ORVI;
- SeguBeca;
- Vida Mujer.

It performs only presentation composition:

- selects the existing product-specific dashboard model;
- preserves product-specific sections and labels;
- groups sections into Aura `summary`, `benefits` and time/projection presentation buckets;
- exposes missing information;
- exposes a product-specific hero from existing structured evidence;
- preserves human-decision and ORVI recommendation boundaries;
- exposes source-backed mandatory premium/protection facts when already available.

It does not parse PDF text, calculate premiums, calculate dotales, calculate recovery, project UDI, resolve current market rates, persist data, or create recommendations.

## Imagina Ser

Authority consumed:

- existing Imagina Ser product-dashboard adapter and its Product Intelligence blocks;
- R13B/R13C presentation contracts;
- R16B dashboard hierarchy where still applicable.

Aura now preserves the Imagina Ser commercial narrative rather than showing only a generic quote summary:

- product-specific hero already emitted by the adapter;
- plan/contribution/protection summary;
- construction/future value section when the existing model publishes it;
- recommended/secondary product detail;
- explicit missing information.

No retirement scenario, contribution, protection or recovery value is recalculated by Aura.

## ORVI

Authority consumed:

- existing ORVI Accepted Quote route;
- existing ORVI dashboard adapter/read model;
- R15L verified-rate/runtime authority;
- existing economic evidence metadata.

Aura now uses the product-specific ORVI protection hero from the existing dashboard's primary protection item. The annual premium presentation uses source-backed premium semantics before generic calculation aliases.

For contractual facts, the source priority is now:

```text
Product Intelligence premium_structure.total_annual_premium
→ nativeResult.totalAnnualPremium
→ nativeResult.annualPremium
→ packet.annualPremium
→ calculation.annualPremium fallback
```

This removes the generic alias precedence that allowed a synthetic/derived zero to obscure a real source-backed premium. No numeric replacement or PDF-specific hardcode was introduced.

ORVI time-value sections preserve the existing distinction between future scenario and guaranteed recovery. Current MXN reference is shown only from existing verified economic metadata. Future USD remains blocked where the ORVI authority blocks it. Recommendation remains owned by the existing ORVI model and human decision remains required.

## SeguBeca

Authority consumed:

- existing SeguBeca Product Intelligence/dashboard adapter;
- existing participant-role semantics;
- education-goal and delivery semantics;
- existing protection and recommended-coverages blocks.

Aura now treats the existing `education_goal` section as the product-specific hero when that section publishes an evidenced value. A coverage such as BAIT remains visible under protection but cannot displace the education objective merely because its numeric sum assured is larger.

This is a presentation-hierarchy correction only. The education value and protection values remain exactly those emitted by the existing product authority.

Aura preserves:

- plan summary;
- participant structure and roles;
- contribution;
- education goal;
- delivery form;
- protection;
- included benefits;
- additional/recommended coverages;
- secondary and missing information.

## Vida Mujer

Authority consumed:

- existing Vida Mujer Accepted Quote branch;
- existing Vida Mujer product-dashboard adapter;
- existing female-protection, endowment/survival, recovery and recommended-benefit semantics.

Aura now preserves separate product-specific areas for:

- contribution;
- protection;
- women-specific protection/benefits;
- scheduled endowments / dotales;
- recovery/time-value detail;
- recommended/additional coverages;
- missing information.

Phase 003 does not author, modify or duplicate the existing legacy formulas that may exist inside older product authorities. It only consumes their structured output.

## Forge Aura adapter reconciliation

`docs/static-preview/forge-aura/quotes/quotes-adapter.js` now:

- builds the existing benefit summary once;
- builds `productDecision` through the new read-only compositor;
- gives product-specific identity precedence when one of the four supported products is resolved;
- reads ORVI verified `rate_context` when present;
- prioritizes Product Intelligence/native source-backed annual premium over the generic calculation alias;
- preserves Accepted Quote, lifecycle, printable and Presentation Maker boundaries unchanged.

## Forge Aura renderer reconciliation

`docs/static-preview/forge-aura/quotes/quotes-module.js` remains an Aura-only renderer. It does not import productive quote-runtime modules directly and does not import the Material 3 presenter or Material visual styles.

For supported products it now renders:

- product-specific hero;
- product-specific summary sections;
- product-specific benefits;
- product-specific time/projection/recovery sections when published;
- product-specific missing information;
- provenance identifying the neutral decision read model.

For unsupported products, the generic phase-002 presentation remains the fallback.

Phase-002 behavior retained:

- `Nueva cotización` primary module action;
- honest EMPTY/LOADING/READY/PARTIAL/ACCEPTED/ERROR/UNAVAILABLE states;
- maximum three attention items;
- accessible keyboard tabs;
- explicit `Revisar y confirmar` human action;
- PDF preview/download after acceptance;
- Presentation Maker only after acceptance;
- existing lifecycle/persistence behavior;
- Aura Light design authority.

## Supersession rule

For Imagina Ser, ORVI, SeguBeca and Vida Mujer only, phase 003 supersedes these generic phase-002 presentation assumptions:

- annual premium as universal hero;
- sum assured as universal second-choice hero;
- one identical commercial hierarchy for every product;
- generic benefit ordering when a supported product dashboard exists;
- generic aliases outranking source-backed product premium semantics.

It does not supersede phase 002 as visual/interaction authority and does not supersede Product Intelligence, Accepted Quote, market-data, forecast, persistence or human-decision authorities.

## Files in production scope

Runtime:

- `docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`
- `docs/static-preview/forge-aura/quotes/quotes-adapter.js`
- `docs/static-preview/forge-aura/quotes/quotes-module.js`

Quality/evidence:

- `tests/aura-quotes-product-specific-decision-experience-003.test.mjs`
- `.github/workflows/aura-quotes-product-specific-decision-experience-003.yml`
- Constitutional Gate evidence;
- this source-truth document;
- phase acceptance evidence.

## Prohibited surfaces confirmed unchanged

Phase 003 does not modify:

- PDF parsers;
- Product Intelligence product calculations/ontology truth;
- Accepted Quote calculation engine;
- existing product financial formulas;
- Banxico providers, cache behavior, series or tokens;
- database schema;
- Supabase/RLS/auth;
- Pipeline, Cartera or compensation engines;
- durable lifecycle/persistence semantics;
- Presentation Maker sourced facts, approval or export authority;
- route ownership outside Quotes;
- Material 3 visual renderer/style authority.

## Validation contract

Dedicated CI executes:

- syntax checks for the new/modified JavaScript;
- phase-003 product-specific regression tests;
- Aura Quotes phase-002 non-regression;
- Imagina Ser dashboard regression;
- SeguBeca dashboard regression;
- ORVI Accepted Quote end-to-end dashboard regression;
- quote-benefit-summary regression;
- PDF browser parser smoke;
- parser ownership regression;
- `git diff --check` and changed-file evidence.

The phase-003 regression specifically locks:

- four authority imports;
- no direct productive-runtime import from the Aura renderer;
- no Material 3 visual import into the Aura renderer;
- source-backed premium precedence over the generic ORVI zero alias;
- no audit-PDF result hardcodes in production files;
- SeguBeca education goal hero over a larger BAIT protection amount;
- ORVI protection hero;
- Imagina Ser product-specific construction section;
- Vida Mujer endowment and women-benefit sections.

## Release decision

The implementation is eligible for PR after the dedicated workflow passes on the final branch head.

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
READY_FOR_FINAL_CI=YES
```