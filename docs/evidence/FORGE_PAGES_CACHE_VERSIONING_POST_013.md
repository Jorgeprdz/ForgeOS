# Forge Pages cache versioning post-013 hotfix

- Failed production run: `31462387079`
- Failed deploy job: `93688397332`
- Failure: `FORGE_PAGES_AURA_CARTERA_VERSION_SOURCE_MISSING`
- Root cause: Pages transitive cache versioner was pinned to `cartera-module-v9.js` while Aura Phase 013 now maps the canonical Cartera presentation entrypoint to `cartera-module-v10-013.js`.
- Scope: build/package cache version discovery only.
- Product logic change: none.
- DB/RLS change: none.
- Policy Truth semantics change: none.
- Fix: discover the current canonical Cartera target from Aura's import map, version that target with the build SHA, and keep fail-closed source/build/stale-cache guards.
