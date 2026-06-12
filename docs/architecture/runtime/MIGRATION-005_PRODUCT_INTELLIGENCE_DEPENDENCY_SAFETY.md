# MIGRATION-005 Product Intelligence Dependency Safety

Status: DISCOVERY COMPLETE

## Scope

This document records dependency safety for the MIGRATION-005 Product Intelligence planning batch.

No files were moved. No imports were rewritten. No folders were created.

## Candidate Extraction

Source inventory:

- Remaining root runtime assets after LEGACY-005: 518 top-level `.js` files
- Preferred Product Intelligence matches found: 95
- Eligible candidates found: 86
- Selected execution candidates: 50
- Complex or blocked candidates excluded from this batch: 9

Preferred match signals:

- `product` / `products`
- `quote` / `quotation`
- `coverage`
- `rule` / `rules`
- `gmm`
- `vida` / `mujer`
- `imagina`
- `orvi`
- `medical`
- `projection` / `udi`
- `evidence` / `source` / `knowledge`

## Dependency Safety Summary

| Metric | Count |
|---|---:|
| Selected files | 50 |
| `NO_IMPORTS` | 20 |
| `INTERNAL_ONLY` | 8 |
| `SIMPLE_REWRITE` | 22 |
| `COMPLEX_REWRITE` | 0 |
| `BLOCKED` | 0 |

## Selected Files By Destination

### `product-intelligence/coverage/`

- `gmm-out-of-pocket-engine.js`
- `vida-mujer-protected-diseases-report.js`
- `event-benefit-engine.js`
- `vida-mujer-event-benefits-report.js`
- `vida-mujer-coverage-status-engine.js`
- `vida-mujer-coverage-status-report.js`
- `gmm-client-review-engine.js`
- `health-runtime.js`
- `optional-coverage-intelligence-engine.js`
- `shared-benefit-hierarchy-engine.js`
- `smnyl-health-score-engine.js`
- `smnyl-productos-gmm.js`
- `gmm-advisor-review-engine.js`

### `product-intelligence/evidence/`

- `gmm-quote-parser.js`
- `solucionline-retirement-parser.js`
- `vida-mujer-knowledge-extractor-report.js`

### `product-intelligence/knowledge/`

- `discovery-product-alignment-engine.js`
- `imagina-ser-contribution-engine.js`
- `product-schema-engine.js`
- `vida-mujer-client-explanation-report.js`
- `vida-mujer-pdf-intake-report.js`
- `vida-mujer-survival-schedule-engine.js`
- `imagina-ser-human-language-engine.js`
- `imagina-ser-client-presentation-engine.js`
- `shared-education-cost-engine.js`
- `segu-beca-education-comparison-engine.js`
- `shared-education-paths-engine.js`
- `segu-beca-education-options-engine.js`
- `imagina-ser-advisor-analysis-engine.js`
- `imagina-ser-fiscal-slide-engine.js`
- `imagina-ser-presentation-prompt-engine.js`
- `orvi-decision-engine.js`
- `orvi-event-engine.js`
- `orvi-objection-engine.js`
- `product-detection-engine.js`
- `product-knowledge-link-engine.js`
- `smnyl-productos-vida.js`

### `product-intelligence/projections/`

- `financial-pyramid-engine.js`
- `financial-pyramid-priority-engine.js`
- `financial-pyramid-story-engine.js`
- `financial-risk-score-engine.js`
- `life-expectancy-projection-engine.js`
- `projection-engine.js`
- `projection-milestone-engine.js`
- `dynamic-cash-value-projection-engine.js`
- `financial-responsibility-engine.js`

### `product-intelligence/quotes/`

- `quotation-extraction-result.entity.js`
- `quotation-input.entity.js`

### `product-intelligence/rules/`

- `vida-mujer-rule-consistency-report.js`
- `vida-mujer-status.js`

## Excluded Complex Or Blocked Candidates

| File | Dependency Class | Reason |
|---|---|---|
| coverage-intelligence-orchestrator.js | COMPLEX_REWRITE | Imports 10 coverage modules and has test consumer. |
| exchange-rate-cache-engine.js | COMPLEX_REWRITE | Shared currency/cache module with broad product and market-data consumers. |
| imagina-ser-fiscal-router-engine.js | COMPLEX_REWRITE | Multi-module router consumed by tests and presentation flows. |
| imagina-ser-ocr-extractor.js | COMPLEX_REWRITE | Consumed by several Imagina Ser validation/test surfaces. |
| orvi-client-report-test.js | COMPLEX_REWRITE | Test/report with many product imports; not a runtime movement candidate. |
| shared-currency-projection-engine.js | COMPLEX_REWRITE | Broad shared projection consumer surface. |
| vida-mujer-client-presentation-test.js | BLOCKED | Imports fixture JSON and missing/shared price placement surface. |
| vida-mujer-financial-correction-report.js | COMPLEX_REWRITE | Multi-import report with shared financial dependencies. |
| vida-mujer-financial-fixture-report.js | BLOCKED | Imports fixture JSON and exchange-rate cache. |

## Safety Verdict

Dependency safety: PASS_WITH_REWRITE_GUARD

The batch is suitable for execution only if the implementation scope explicitly permits mechanical import rewrites for direct consumers and local imports. If execution must be no-rewrite only, the safe batch size is 20 files, below the requested 40-file minimum.
