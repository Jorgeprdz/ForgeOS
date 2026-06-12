# MIGRATION-005B Product Intelligence Execution Readiness

Status: PASS_WITH_EXTERNAL_REWRITE_GUARD

## Verdict

Execution readiness: PASS_WITH_EXTERNAL_REWRITE_GUARD

The 8-file batch is physically safe to move, but only if the execution approval explicitly authorizes the 4 mechanical external consumer import rewrites documented in `MIGRATION-005B_PRODUCT_INTELLIGENCE_INTERNAL_REWRITE_PLAN.md`.

## Counts

| Metric | Count |
|---|---:|
| Internal-only files from MIGRATION-005 | 8 |
| Files eligible for movement | 8 |
| Internal same-folder import rewrites | 0 |
| External import rewrites required | 4 |
| External root consumer files | 3 |
| App shell consumers | 0 |
| Route consumers | 0 |
| Blocked files | 0 |

## No-Touch List

Do not modify:

- `app.js`
- `index.html`
- `dashboard.js`
- `cartera.js`
- `comisiones.js`
- `referidos.js`
- active route files
- Product Intelligence `SIMPLE_REWRITE` candidates outside this 8-file batch
- Product Intelligence complex or blocked candidates

## Future Execution Scope

If approved, MIGRATION-005B execution should:

1. Move exactly the 8 files listed in the move map.
2. Rewrite exactly the 4 imports listed in the rewrite plan.
3. Run validation.
4. Stop if a new missing-target warning appears.

## Required Validation

```sh
node scripts/runtime-module-graph-audit.js
node scripts/repo-doc-migration-harness.js check --output-dir docs/architecture/repository/reports
git diff --check
git status --short
```

## Readiness Notes

This is the first Product Intelligence migration step that requires active consumer rewrites. The rewrite surface is small and explicit, but it is not a no-import migration.

Recommended approval wording should name the 8 files and the 4 import rewrites explicitly.
