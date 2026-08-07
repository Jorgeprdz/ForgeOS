# Forge Aura Clean Runtime — Productive Pipeline Execution Authority

## Human authorization

- `OWNER_AUTHORIZATION=FORGE_AURA_CLEAN_RUNTIME_WITH_PRODUCTIVE_PIPELINE`
- `EXECUTION_AUTHORIZED=YES`
- `COMMIT_AUTHORIZED=YES`
- `PUSH_BRANCH_AUTHORIZED=YES`
- `OPEN_DRAFT_PR_AUTHORIZED=YES`
- `MERGE_AUTHORIZED=NO`
- `DEPLOY_AUTHORIZED=NO`
- `MAIN_MUTATION_AUTHORIZED=NO`

## Governed boundary

This authority permits an independent `FORGE_AURA_LIGHT_2026` runtime containing only Login, Pipeline, session control and global states. It does not authorize Home, Dashboard, Activity, Cartera, Quotes, Commissions, Forecast, Alfred, schema changes, RLS changes, production deployment or merge.

The implementation branch is `feature/aura-clean-runtime-productive-pipeline`, created from `c011f08622b957dbb9fb1225a7d99e550d36c761`.

PR #273 and its branch are not an implementation base. Pure productive logic may be consulted only when it has no legacy visual, DOM, CSS, navigation or shell dependency.

## Visual authority

`docs/05-foundation/design-system/FORGE_AURA_LIGHT_2026_CANONICAL_DESIGN_SYSTEM.md` is the sole visual authority. Material 3 and legacy visual imports are forbidden.

## Stop conditions

A draft pull request may be opened only after the hard acceptance gate passes. Merge, deployment, auto-merge, force push and mutation of `main` remain forbidden.
