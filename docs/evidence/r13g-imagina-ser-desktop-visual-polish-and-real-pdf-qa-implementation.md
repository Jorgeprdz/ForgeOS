# R13G Imagina Ser Desktop Visual Polish And Real PDF QA Implementation Evidence

## Decision

`PASS_R13G_IMAGINA_SER_DESKTOP_VISUAL_POLISH_AND_REAL_PDF_QA_IMPLEMENTATION`

R13G finishes the interrupted Imagina Ser desktop visual polish started by Codex. The module accepts the already-authored product-scoped layout and commercial-label changes, validates them in Termux, and records local real-PDF QA discovery in sanitized form without committing PDFs, screenshots, client data, or temporary tooling.

## Constitutional authority

- Constitution: `FORGE_CONSTITUTION_V3.md`.
- ADRs: ADR-003, ADR-004, ADR-005, ADR-007, ADR-008.
- Board: approved by project owner for R13G implementation.
- Miranda: approved with disciplined scope, no invented data, no parser changes, no mobile changes, and no Vida Mujer regression.
- Prior gate: `R13F_IMAGINA_SER_DESKTOP_VISUAL_POLISH_AND_REAL_PDF_QA`.

## Files changed

| File | Reason |
| --- | --- |
| `docs/static-preview/quote-preview-live/forge-benefit-summary-layout.js` | Adds desktop-only, product-scoped layout rules for `data-forge-product-type="imagina_ser"`, improving horizontal use, card proportions, construction prominence, value sizing, and overflow control. |
| `docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js` | Adds clearer commercial labels and the `imagina_ser_desktop_r13g` layout marker while preserving values and product semantics. |
| `tests/imagina-ser-product-dashboard-adapter-test.mjs` | Adds regression assertions for commercial labels, layout marker, construction prominence, desktop layout selectors, and compatibility selectors. |

## Temporary files

The interrupted Codex helper `.codex-r13g-qa.py` was moved outside the repo to:

`/storage/emulated/0/ForgeGemini/Reports/r13g_finish_existing_visual_polish_20260712_113746/codex_r13g_qa_tool_backup.py`

It was not staged or committed.

## Visual polish implemented

- `Lo que construyes` is promoted as the full-width protagonist section on desktop.
- Summary, contribution, protection, recommended, secondary details, and missing information use product-scoped grid spans.
- Construction mini-cards use a four-column desktop grid.
- The first construction metric receives stronger visual treatment for `Meta patrimonial`.
- Large value text uses clamped font sizing.
- Value parts remain single-line to avoid tall broken numeric columns.
- Imagina Ser receives explicit `data-forge-product-layout="imagina_ser_desktop_r13g"`.

## Commercial labels

The adapter now presents these clearer labels when supported by the same evidence IDs:

- `Plazo de aportación`
- `Total aportado`
- `Total aportado proyectado`
- `Meta patrimonial`
- `Valor futuro · edad X`

No values, premiums, coverages, forecasts, benefits, or recommendations were invented.

## Real PDF QA, sanitized

Local PDF inventory was scanned only for product classification and not committed.

- `IMAGINA_SER_LOCAL_PDF_CANDIDATES=34`
- `VIDA_MUJER_LOCAL_PDF_CANDIDATES=6`
- `R13G_LOCAL_SCREENSHOTS_FOUND=3`
- `REAL_PDF_QA=LOCAL_SANITIZED_PARTIAL_VISUAL_QA`

No local PDF names, client names, screenshots, extracted client data, or personal information were recorded in this evidence.

## Vida Mujer preservation

- Vida Mujer renderer and parser were not changed.
- Vida Mujer selectors remain tested through existing quote benefit-summary and parser smoke tests.
- R13G selectors are scoped to `data-forge-product-type="imagina_ser"`, so Vida Mujer layout remains outside this product-specific polish.

## Limits respected

- Desktop presentation only.
- No parser changes.
- No mobile changes.
- No schemas, routes, `app.js`, or rule packs changed.
- No Product Truth ownership moved.
- No DOM overlay hacks.
- No PDFs, screenshots, client fixtures, or sensitive data committed.
- No `git reset`.
- Exact-path staging only.

## Validations

- Required baseline HEAD `71a6570e7eef0afc25aa68b6ab29c25fcd45d3db`: PASS.
- Worktree matched the expected interrupted R13G allowlist: PASS.
- `node --check docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js`: PASS.
- `node --check docs/static-preview/quote-preview-live/forge-benefit-summary-layout.js`: PASS.
- `node --check tests/imagina-ser-product-dashboard-adapter-test.mjs`: PASS.
- `node tests/imagina-ser-product-dashboard-adapter-test.mjs`: PASS.
- `node tests/product-dashboard-template-test.mjs`: PASS.
- `node tests/quote-benefit-summary-engine-test.mjs`: PASS.
- `node tests/pdf-browser-parser-smoke-test.mjs`: PASS.
- Parser ownership test: PASS when present.
- `git diff --check`: PASS.
- Privacy check on added lines: PASS.
- Allowlist of changed files: PASS.
- Prohibited surfaces unchanged: PASS.

## Closure

R13G is complete as a Termux finish of the current Codex-authored visual polish. The module is intentionally limited to accepting and validating product-scoped desktop presentation changes for Imagina Ser. Any further visual design beyond this point should be a separate governed module.
