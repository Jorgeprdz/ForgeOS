# MIGRATION-005B Product Intelligence Internal Rewrite Plan

Status: PLANNING COMPLETE

## Scope

This document defines the exact import rewrite plan required if the 8-file MIGRATION-005B batch is approved for execution.

No imports were rewritten during planning.

## Rewrite Summary

Total import rewrites required: 4

Internal same-folder import rewrites required: 0

External consumer import rewrites required: 4

## Internal Imports

The following imports remain valid after movement because each importer and imported file would land in the same destination folder.

| File After Move | Current Import | Required Rewrite | Reason |
|---|---|---|---|
| `product-intelligence/coverage/vida-mujer-event-benefits-report.js` | `./event-benefit-engine` | None | Both files move to `product-intelligence/coverage/`. |
| `product-intelligence/coverage/vida-mujer-coverage-status-report.js` | `./vida-mujer-coverage-status-engine` | None | Both files move to `product-intelligence/coverage/`. |

## External Consumer Rewrites

| Consumer File | Current Import | Required Import After Move |
|---|---|---|
| `imagina-ser-client-presentation-engine.js` | `./imagina-ser-human-language-engine` | `./product-intelligence/knowledge/imagina-ser-human-language-engine.js` |
| `dynamic-cash-value-projection-engine.js` | `./projection-engine.js` | `./product-intelligence/projections/projection-engine.js` |
| `dynamic-cash-value-projection-engine.js` | `./projection-milestone-engine.js` | `./product-intelligence/projections/projection-milestone-engine.js` |
| `segu-beca-education-comparison-engine.js` | `./shared-education-cost-engine` | `./product-intelligence/knowledge/shared-education-cost-engine.js` |

## Non-Consumers Confirmed

No direct consumers detected in:

- `app.js`
- `index.html`
- `dashboard.js`
- `cartera.js`
- `comisiones.js`
- `referidos.js`
- active route files

## Execution Guard

MIGRATION-005B must not execute as a no-rewrite move.

If approved, execution scope must explicitly include:

- `git mv` for the 8 files
- 4 mechanical import rewrites in the 3 external consumer files listed above
- validation after movement and rewrite

Do not widen into the remaining `SIMPLE_REWRITE` Product Intelligence set.
