# ForgeOS — CRS 09 A+B+C+D Visual Acceptance

The exact-head CRS 09 workflow renders the canonical Material 3 workspace module and uploads full-page evidence for:

- mobile `390 × 844`;
- tablet `834 × 1112`;
- desktop `1440 × 1000`.

Each viewport must prove eight canonical sections, visible CRS 08 Timeline, explicit degraded-source state, no local forms or submit controls, no horizontal document overflow, and safe bottom clearance above the intentionally floating mobile navigation pill.

Evidence files:

- `playwright.crs09.config.mjs`
- `tests/e2e/crs-09-person-workspace-visual.spec.mjs`
- `tests/e2e/fixtures/crs09-person-workspace/index.html`
- artifact `crs09-person-workspace-visual-<HEAD_SHA>`

Final accepted head and workflow identifiers are recorded on pull request closure before controlled squash merge.
