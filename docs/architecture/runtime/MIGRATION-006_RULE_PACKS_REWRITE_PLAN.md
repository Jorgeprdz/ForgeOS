# MIGRATION-006 Rule Packs Rewrite Plan

Status: PLANNING COMPLETE

## Scope

This document defines the import rewrite plan for the **Rule Packs / SMNYL OS** cluster.

## Internal Rewrites (Rule Packs)

All `smnyl-*` files are moving to `rule-packs/smnyl/`. 
Since they all live in the same destination folder, internal relative imports like `import { ... } from './smnyl-engine.js'` remain valid without modification.

## External Consumer Rewrites

The following external consumers require import rewrites to point to the new locations.

| Consumer File | Current Import | Required Import After Move |
|---|---|---|
| `advisor-os/concursos/concursos.js` | `./smnyl-concursos-engine.js` | `../../rule-packs/smnyl/smnyl-concursos-engine.js` |
| `advisor-os/dashboard/dashboard-executive.js` | `./smnyl-operating-system-engine.js` | `../../rule-packs/smnyl/smnyl-operating-system-engine.js` |

*Note: Relative paths assume the destination paths in the move map.*

## App Shell Coupling

None of these files are directly imported by:
- `app.js`
- `index.html`
- `dashboard.js`
- `comisiones.js`

## Validation Steps

1. Verify relative imports within `rule-packs/smnyl/` after movement.
2. Verify imports in `concursos.js` and `dashboard-executive.js`.
3. Run `node scripts/runtime-module-graph-audit.js`.
