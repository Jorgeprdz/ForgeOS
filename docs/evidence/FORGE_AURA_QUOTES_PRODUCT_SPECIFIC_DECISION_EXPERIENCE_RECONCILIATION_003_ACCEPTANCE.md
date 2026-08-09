# Forge Aura Quotes Product-Specific Decision Experience Reconciliation 003 — Acceptance

```text
PHASE=FORGE_AURA_QUOTES_PRODUCT_SPECIFIC_DECISION_EXPERIENCE_RECONCILIATION_003
BRANCH=feature/aura-quotes-product-specific-decision-experience-003
BASE_SHA=dd814c3c9511ab7ab8751ecb25366d39635129eb
CONSTITUTIONAL_GATE=PASS
IMPLEMENTATION=COMPLETE
FINAL_BRANCH_CI=PENDING_THIS_DOCS_COMMIT
PR=PENDING_FINAL_BRANCH_CI
MAIN_MUTATED=NO
PRODUCTION_DEPLOYMENT=NO
```

## Constitutional acceptance

The phase began with the Constitutional Gate commit:

`187dff411f2327fa8ce4806efd7f286544abe4e6`

The gate was committed before production code changes and authorized only reuse/composition of existing authorities. It prohibited new Product Intelligence, financial formulas, parsers, market-data truth, persistence and hardcoded real-PDF results.

The branch was created directly from the then-current and still-current `main` SHA:

`dd814c3c9511ab7ab8751ecb25366d39635129eb`

The audit branch was not used as a base.

## Implementation acceptance

### Product-specific decision boundary

Added:

`docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`

Accepted as a read-only presentation compositor because it:

- selects existing Imagina Ser, ORVI, SeguBeca and Vida Mujer dashboard models;
- preserves their existing sections and evidence;
- creates no product calculation;
- parses no PDF text;
- fetches no market data;
- persists nothing;
- makes no automatic decision or recommendation.

### Imagina Ser

Accepted:

- existing product-specific hero is consumed;
- plan/contribution/protection narrative is preserved;
- existing construction/future sections are exposed separately;
- missing information remains explicit;
- no retirement/protection calculation is duplicated.

### ORVI

Accepted:

- existing primary protection item is the product hero;
- Product Intelligence/native total annual premium outranks the generic `calculation.annualPremium` alias;
- a generic zero alias therefore cannot overwrite an available source-backed premium;
- verified ORVI `rate_context` can feed economic evidence;
- future scenario and guaranteed recovery remain distinct;
- recommendation ownership and human-decision boundary remain unchanged.

### SeguBeca

Accepted:

- existing `education_goal` is the product-specific hero when evidenced;
- BAIT/protection remains under protection and cannot become the product objective merely because its amount is larger;
- participant roles remain distinct;
- contribution, education goal, delivery, protection and additional benefits retain separate semantics;
- no education or protection values are recalculated.

### Vida Mujer

Accepted:

- existing product-specific contribution/protection semantics are consumed;
- scheduled endowments/dotales and recovery are kept as time-value/product-specific sections;
- women-specific protection/benefits remain separate;
- recommended/additional coverage semantics remain visible;
- phase 003 does not create or change any existing Vida Mujer formula.

## Aura acceptance

Accepted:

- Aura renderer remains visually independent from Material 3;
- Aura renderer does not import productive quote-runtime modules directly;
- phase-002 Aura states/actions remain intact;
- human confirmation remains explicit;
- Accepted Quote lifecycle remains unchanged;
- printable PDF actions remain gated by acceptance;
- Presentation Maker remains gated by acceptance and its own human approval/export rules;
- unsupported products retain the generic fallback.

## First implementation CI evidence

Dedicated workflow:

`Aura Quotes Product-Specific Decision Experience 003`

Run:

`31292052298`

Tested branch head:

`df37edeb6f6c1c4c313458d8347d53f15b50d873`

Result:

`SUCCESS`

Successful steps:

- Syntax gate;
- Phase 003 product-specific regressions;
- Aura Quotes phase 002 non-regression;
- Product dashboard authority regressions;
- PDF and parser ownership regressions;
- whitespace and changed-file scope evidence.

This first CI run validated the complete runtime/test implementation before the final architecture and acceptance documents were added. The dedicated workflow is configured to run again when these phase documents change; final PR readiness requires the workflow to pass on the final branch head.

## Tests locked by phase 003

`tests/aura-quotes-product-specific-decision-experience-003.test.mjs` verifies:

- four existing product-specific authority imports;
- neutral product-specific read-model use from Aura adapter;
- Aura renderer uses `productDecision` rather than universal annual-premium hero;
- no Material 3 visual renderer import into Aura module;
- no productive quote-runtime import into Aura module;
- source-backed premium priority over a generic zero alias;
- absence of audited real-PDF result hardcodes in production changes;
- SeguBeca education-goal hero over a larger BAIT value in a deterministic test fixture;
- ORVI primary protection hero;
- Imagina Ser construction/time-value section;
- Vida Mujer scheduled-endowment and women-benefit section preservation.

Existing product regression suites also remain in the workflow for Imagina Ser, SeguBeca, ORVI, benefit summary and PDF/parser ownership.

## Scope acceptance

Production runtime changes are limited to:

- `docs/static-preview/quote-runtime/forge-product-specific-decision-read-model.js`;
- `docs/static-preview/forge-aura/quotes/quotes-adapter.js`;
- `docs/static-preview/forge-aura/quotes/quotes-module.js`.

No production modifications were made to:

- PDF parsers;
- Accepted Quote calculation code;
- Product Intelligence calculation/ontology sources;
- ORVI calculators;
- SeguBeca calculators;
- Imagina Ser calculators;
- Vida Mujer formulas;
- Banxico/provider/cache code;
- database/Supabase/RLS/auth;
- lifecycle persistence code;
- Pipeline/Cartera/compensation;
- Presentation Maker sourced facts/approval/export authority;
- Material 3 visual renderer/styles.

## Acceptance matrix

```text
CONSTITUTIONAL_GATE=PASS
BRANCH_FROM_CURRENT_MAIN=PASS
AUDIT_BRANCH_AS_BASE=NO
PRODUCT_SPECIFIC_PRODUCTS=4
IMAGINA_SER_DECISION_EXPERIENCE=PASS
ORVI_DECISION_EXPERIENCE=PASS
SEGUBECA_DECISION_EXPERIENCE=PASS
VIDA_MUJER_DECISION_EXPERIENCE=PASS
ORVI_GENERIC_ZERO_ALIAS_WINS=NO
SEGUBECA_BAIT_REPLACES_EDUCATION_GOAL=NO
GENERIC_FALLBACK_FOR_UNSUPPORTED_PRODUCTS=YES
AURA_LIGHT_VISUAL_AUTHORITY=PRESERVED
MATERIAL3_VISUAL_RENDERER_IMPORTED_INTO_AURA=NO
NEW_PRODUCT_INTELLIGENCE=NO
NEW_QUOTE_ENGINE=NO
NEW_FINANCIAL_FORMULA=NO
NEW_MARKET_RATE=NO
NEW_PERSISTENCE=NO
REAL_PDF_VALUE_HARDCODE=NO
HUMAN_CONFIRMATION=PRESERVED
PRESENTATION_MAKER_HUMAN_BOUNDARY=PRESERVED
FIRST_IMPLEMENTATION_CI_RUN=31292052298
FIRST_IMPLEMENTATION_CI=SUCCESS
FINAL_HEAD_CI=REQUIRED_BEFORE_PR_ACCEPTANCE
```

## Final acceptance rule

This document records implementation acceptance, but it does not self-certify the final branch head. The final closure sequence is:

1. dedicated workflow passes on the final branch head containing this document;
2. exact diff against current `main` is inspected;
3. PR is opened against `main`;
4. pull-request checks pass;
5. merge/deploy remain separate actions and are not implied by this phase.
