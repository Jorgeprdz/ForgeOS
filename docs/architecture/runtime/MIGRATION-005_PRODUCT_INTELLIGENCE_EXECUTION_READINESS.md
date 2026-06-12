# MIGRATION-005 Product Intelligence Execution Readiness

Status: PASS_WITH_REWRITE_GUARD / AWAITING EXECUTION APPROVAL

## Verdict

Execution readiness: PASS_WITH_REWRITE_GUARD

MIGRATION-005 can execute after explicit approval if direct import rewrites are allowed for the selected `INTERNAL_ONLY` and `SIMPLE_REWRITE` files.

## Approved Scope For Future Execution

Move exactly the 50 files listed in `MIGRATION-005_PRODUCT_INTELLIGENCE_MOVE_MAP.md`.

Create only these missing subfolders if they do not already exist:

```text
product-intelligence/knowledge/
product-intelligence/quotes/
product-intelligence/coverage/
product-intelligence/rules/
product-intelligence/projections/
product-intelligence/evidence/
```

Use `git mv`.

## Import Rewrite Expectation

Expected import rewrites: required for non-`NO_IMPORTS` records.

Breakdown:

- `NO_IMPORTS`: 20
- `INTERNAL_ONLY`: 8
- `SIMPLE_REWRITE`: 22

Execution must either approve these rewrites explicitly or reduce the batch to the 20 `NO_IMPORTS` files.

## No-Touch List

- `app.js`
- `index.html`
- `dashboard.js`
- `cartera.js`
- `comisiones.js`
- `referidos.js`
- Active route files
- Complex rewrite candidates
- Blocked candidates

## Future Execution Commands

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
git status --short
```

## Success Criteria For Execution

- Exactly 50 files moved, if rewrite-guard execution is approved.
- Root runtime surface reduced by 50 files.
- All direct import rewrites are mechanical and limited to moved files and direct consumers.
- Boot blockers remain 0.
- Circular imports remain 0.
- Missing target count does not increase because of movement.
- No protected app shell or route files modified.

## Recommended MIGRATION-006 Scope

After execution, MIGRATION-006 should target either a no-rewrite Product Intelligence residue batch or a dedicated Product Intelligence complex-dependency map for coverage orchestrator and shared currency projections.
