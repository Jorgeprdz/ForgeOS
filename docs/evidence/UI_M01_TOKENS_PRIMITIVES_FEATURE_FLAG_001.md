# UI-M01 — Tokens, primitives and feature flag evidence

## Result

- Runtime foundation: **PASS**
- Approved token authority: **PASS**
- Default legacy mode: **PASS**
- Material 3 opt-in mode: **PASS**
- Productive Home replacement: **NO**
- Runtime data mutation: **NO**

## Artifacts

- `docs/static-preview/forge-alive/ui-material3-runtime/forge-material3-runtime-tokens.css`
- `docs/static-preview/forge-alive/ui-material3-runtime/forge-material3-primitives.css`
- `docs/static-preview/forge-alive/ui-material3-runtime/forge-material3-feature-flag.js`
- `docs/static-preview/forge-alive/ui-material3-runtime/forge-material3-runtime-manifest.json`
- `tests/ui-m01-material3-runtime-foundation-test.mjs`
- `docs/evidence/ui-m01-material3-runtime-foundation-test.tap`

## Acceptance contract

1. The real Forge Alive entrypoint loads the new assets exactly once.
2. No Material 3 selector is active without the explicit query flag.
3. The default route remains visually governed by the existing runtime.
4. The opt-in route exposes the approved tokens and primitives.
5. Tests, diff validation, commit and remote alignment must pass.
