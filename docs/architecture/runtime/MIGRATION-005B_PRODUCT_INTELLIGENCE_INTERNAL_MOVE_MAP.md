# MIGRATION-005B Product Intelligence Internal Move Map

Status: PLANNING COMPLETE / AWAITING EXECUTION APPROVAL

## Scope

This move map covers only the 8 `INTERNAL_ONLY` Product Intelligence files identified in MIGRATION-005.

No files were moved.
No imports were rewritten.
No folders were created.

## Important Finding

`INTERNAL_ONLY` was true within the original 50-file MIGRATION-005 candidate set.

When narrowed to only these 8 files, the subset has:

- Internal consumer files: 2
- External root consumer files: 3
- App shell consumers: 0
- Route consumers: 0

Therefore MIGRATION-005B is not a no-rewrite execution. It requires a small, explicit consumer rewrite plan.

## Move Map

| Current Path | Destination Path | Owner | Imports Inside 8-File Group | Consumers Inside 8-File Group | External Root Consumers | Risk | Eligible |
|---|---|---|---|---|---|---|---|
| `event-benefit-engine.js` | `product-intelligence/coverage/event-benefit-engine.js` | Product Intelligence | None | `vida-mujer-event-benefits-report.js` | None | LOW | YES |
| `vida-mujer-event-benefits-report.js` | `product-intelligence/coverage/vida-mujer-event-benefits-report.js` | Product Intelligence | `event-benefit-engine.js` | None | None | LOW | YES |
| `imagina-ser-human-language-engine.js` | `product-intelligence/knowledge/imagina-ser-human-language-engine.js` | Product Intelligence | None | None | `imagina-ser-client-presentation-engine.js` | MEDIUM | YES_WITH_REWRITE |
| `projection-engine.js` | `product-intelligence/projections/projection-engine.js` | Product Intelligence | None | None | `dynamic-cash-value-projection-engine.js` | MEDIUM | YES_WITH_REWRITE |
| `projection-milestone-engine.js` | `product-intelligence/projections/projection-milestone-engine.js` | Product Intelligence | None | None | `dynamic-cash-value-projection-engine.js` | MEDIUM | YES_WITH_REWRITE |
| `shared-education-cost-engine.js` | `product-intelligence/knowledge/shared-education-cost-engine.js` | Product Intelligence | None | None | `segu-beca-education-comparison-engine.js` | MEDIUM | YES_WITH_REWRITE |
| `vida-mujer-coverage-status-engine.js` | `product-intelligence/coverage/vida-mujer-coverage-status-engine.js` | Product Intelligence | None | `vida-mujer-coverage-status-report.js` | None | LOW | YES |
| `vida-mujer-coverage-status-report.js` | `product-intelligence/coverage/vida-mujer-coverage-status-report.js` | Product Intelligence | `vida-mujer-coverage-status-engine.js` | None | None | LOW | YES |

## Destination Structure

```text
product-intelligence/
  coverage/
  knowledge/
  projections/
```

## Batch Size

Proposed batch size: 8 files

Expected root reduction if approved: 8 files

## Consumer Summary

External root consumer file count: 3

External consumer files:

- `imagina-ser-client-presentation-engine.js`
- `dynamic-cash-value-projection-engine.js`
- `segu-beca-education-comparison-engine.js`

App shell consumers: 0

Route consumers: 0
