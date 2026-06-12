# MIGRATION-005 Product Intelligence Move Map

Status: PLANNING COMPLETE / AWAITING EXECUTION APPROVAL

## Scope

This move map identifies a controlled Product Intelligence sub-batch for physical migration.

No files were moved. No imports were rewritten. No folders were created.

## Batch Decision

Recommended batch size: 50 files

Rationale:

- The root scan found only 20 pure `NO_IMPORTS` Product Intelligence candidates.
- A 40-60 file batch therefore requires simple rewrites.
- This batch includes no complex rewrites and no blocked files.
- Active shell and route files are excluded.

## Destination Structure

```text
product-intelligence/
  knowledge/
  quotes/
  coverage/
  rules/
  projections/
  evidence/
```

## Move Map

| Current Path | Destination Path | Owner | Dependency Class | Consumers Affected | Risk | Eligible |
|---|---|---|---|---:|---|---|
| `discovery-product-alignment-engine.js` | `product-intelligence/knowledge/discovery-product-alignment-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `financial-pyramid-engine.js` | `product-intelligence/projections/financial-pyramid-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `financial-pyramid-priority-engine.js` | `product-intelligence/projections/financial-pyramid-priority-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `financial-pyramid-story-engine.js` | `product-intelligence/projections/financial-pyramid-story-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `financial-risk-score-engine.js` | `product-intelligence/projections/financial-risk-score-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `gmm-out-of-pocket-engine.js` | `product-intelligence/coverage/gmm-out-of-pocket-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `gmm-quote-parser.js` | `product-intelligence/evidence/gmm-quote-parser.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `imagina-ser-contribution-engine.js` | `product-intelligence/knowledge/imagina-ser-contribution-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `life-expectancy-projection-engine.js` | `product-intelligence/projections/life-expectancy-projection-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `product-schema-engine.js` | `product-intelligence/knowledge/product-schema-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `quotation-extraction-result.entity.js` | `product-intelligence/quotes/quotation-extraction-result.entity.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `quotation-input.entity.js` | `product-intelligence/quotes/quotation-input.entity.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `solucionline-retirement-parser.js` | `product-intelligence/evidence/solucionline-retirement-parser.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-client-explanation-report.js` | `product-intelligence/knowledge/vida-mujer-client-explanation-report.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-knowledge-extractor-report.js` | `product-intelligence/evidence/vida-mujer-knowledge-extractor-report.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-pdf-intake-report.js` | `product-intelligence/knowledge/vida-mujer-pdf-intake-report.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-protected-diseases-report.js` | `product-intelligence/coverage/vida-mujer-protected-diseases-report.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-rule-consistency-report.js` | `product-intelligence/rules/vida-mujer-rule-consistency-report.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-status.js` | `product-intelligence/rules/vida-mujer-status.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `vida-mujer-survival-schedule-engine.js` | `product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js` | Product Intelligence | NO_IMPORTS | 0 | LOW | YES |
| `event-benefit-engine.js` | `product-intelligence/coverage/event-benefit-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `vida-mujer-event-benefits-report.js` | `product-intelligence/coverage/vida-mujer-event-benefits-report.js` | Product Intelligence | INTERNAL_ONLY | 0 | LOW | YES |
| `imagina-ser-human-language-engine.js` | `product-intelligence/knowledge/imagina-ser-human-language-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `imagina-ser-client-presentation-engine.js` | `product-intelligence/knowledge/imagina-ser-client-presentation-engine.js` | Product Intelligence | SIMPLE_REWRITE | 2 | LOW | YES |
| `projection-engine.js` | `product-intelligence/projections/projection-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `projection-milestone-engine.js` | `product-intelligence/projections/projection-milestone-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `dynamic-cash-value-projection-engine.js` | `product-intelligence/projections/dynamic-cash-value-projection-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `shared-education-cost-engine.js` | `product-intelligence/knowledge/shared-education-cost-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `segu-beca-education-comparison-engine.js` | `product-intelligence/knowledge/segu-beca-education-comparison-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `shared-education-paths-engine.js` | `product-intelligence/knowledge/shared-education-paths-engine.js` | Product Intelligence | SIMPLE_REWRITE | 2 | LOW | YES |
| `segu-beca-education-options-engine.js` | `product-intelligence/knowledge/segu-beca-education-options-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `vida-mujer-coverage-status-engine.js` | `product-intelligence/coverage/vida-mujer-coverage-status-engine.js` | Product Intelligence | INTERNAL_ONLY | 1 | LOW | YES |
| `vida-mujer-coverage-status-report.js` | `product-intelligence/coverage/vida-mujer-coverage-status-report.js` | Product Intelligence | INTERNAL_ONLY | 0 | LOW | YES |
| `financial-responsibility-engine.js` | `product-intelligence/projections/financial-responsibility-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `gmm-client-review-engine.js` | `product-intelligence/coverage/gmm-client-review-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `health-runtime.js` | `product-intelligence/coverage/health-runtime.js` | Product Intelligence | SIMPLE_REWRITE | 0 | LOW | YES |
| `imagina-ser-advisor-analysis-engine.js` | `product-intelligence/knowledge/imagina-ser-advisor-analysis-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `imagina-ser-fiscal-slide-engine.js` | `product-intelligence/knowledge/imagina-ser-fiscal-slide-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `imagina-ser-presentation-prompt-engine.js` | `product-intelligence/knowledge/imagina-ser-presentation-prompt-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `optional-coverage-intelligence-engine.js` | `product-intelligence/coverage/optional-coverage-intelligence-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `orvi-decision-engine.js` | `product-intelligence/knowledge/orvi-decision-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `orvi-event-engine.js` | `product-intelligence/knowledge/orvi-event-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `orvi-objection-engine.js` | `product-intelligence/knowledge/orvi-objection-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `product-detection-engine.js` | `product-intelligence/knowledge/product-detection-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `product-knowledge-link-engine.js` | `product-intelligence/knowledge/product-knowledge-link-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `shared-benefit-hierarchy-engine.js` | `product-intelligence/coverage/shared-benefit-hierarchy-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `smnyl-health-score-engine.js` | `product-intelligence/coverage/smnyl-health-score-engine.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `smnyl-productos-gmm.js` | `product-intelligence/coverage/smnyl-productos-gmm.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `smnyl-productos-vida.js` | `product-intelligence/knowledge/smnyl-productos-vida.js` | Product Intelligence | SIMPLE_REWRITE | 1 | LOW | YES |
| `gmm-advisor-review-engine.js` | `product-intelligence/coverage/gmm-advisor-review-engine.js` | Product Intelligence | SIMPLE_REWRITE | 2 | LOW | YES |

## Estimated Root Reduction

Expected root reduction if approved: 50 files.
