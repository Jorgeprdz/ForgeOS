# R13C Imagina Ser Product Dashboard Adapter Implementation

## Decision

`PASS_R13C_IMAGINA_SER_PRODUCT_DASHBOARD_ADAPTER_IMPLEMENTATION`

R13C implements Imagina Ser as the first product-specific consumer of the reusable R13A dashboard template. The adapter maps structured Product Intelligence blocks to presentation and performs no product calculation.

## Constitutional authorization

| Field | Result |
| --- | --- |
| Constitution | `FORGE_CONSTITUTION_V3.md` |
| ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Intelligence UI |
| Discovery/readiness | Locked and ready with conditions by R13B |
| Board approval | Approved by project owner for R13C implementation |
| Miranda approval | Approved with disciplined scope and no invented data |

## Files changed

| File | Reason |
| --- | --- |
| `docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js` | Adds explicit Imagina Ser routing, maps Product Intelligence blocks to the commercial dashboard model, renders through R13A primitives, and presents evidence gaps. |
| `docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js` | Preserves the structured benefit summary long enough to route Imagina Ser to its adapter; all other products continue through the existing compatible renderer. |
| `tests/imagina-ser-product-dashboard-adapter-test.mjs` | Validates routing, block mapping, evidence identity, missing information, template selectors, sparse input, and direct Product Intelligence integration. |
| `docs/evidence/r13c-imagina-ser-product-dashboard-adapter-implementation.md` | Records authority, architecture, preservation decisions, validations, and prohibited-surface checks. |

Neither `index.html`, the R13A template, nor the layout module required a change. Existing ESM imports load the adapter through the renderer.

## R13A template consumption

The adapter uses only reusable presentation primitives:

- `createProductDashboard()`;
- `createProductDashboardSection()`;
- `createPrimaryMetric()`;
- `createMetricRow()`;
- `createRecommendedBenefitCard()`;
- `createMissingInformationSection()`;
- the existing class contract for primary, metric-row, and recommended grids.

The adapter does not query or patch existing DOM after rendering. It creates one dashboard tree and the renderer mounts it in the existing approved summary target.

## R13B gate compliance

The implemented flow is:

```text
accepted quote
-> buildQuoteBenefitSummary()
-> Product Intelligence blocks
-> buildImaginaSerDashboardModel()
-> renderImaginaSerDashboard()
-> R13A template primitives
```

The adapter receives `contribution_summary`, `protection_summary`, `retirement_scenarios`, `recommended_benefits`, `recovery_summary`, other evidence-backed blocks, and `missing_information`. It does not access parser output, PDF text, rule packs, or raw financial fields.

Formatting callbacks only translate existing emitted values to visible strings. They do not calculate or project values.

## Imagina Ser representation

| Section | Evidence source |
| --- | --- |
| Resumen del plan | `premium_paying_years` from `contribution_summary` when present |
| Lo que aportas | Remaining evidence-backed `contribution_summary` lines |
| Lo que construyes | Base scenario single payment and accumulated values already emitted by Product Intelligence |
| Lo que proteges | `protection_summary` lines |
| Escenario futuro | Existing labeled scenarios from `retirement_scenarios` |
| Beneficios recomendados | `recommended_benefits` only when that structured block exists |
| Otros detalles | `recovery_summary` and other evidence-backed structured blocks |
| Información pendiente | Official missing blocks plus presentation sections unsupported by current evidence |

Scenario content remains explicitly labeled as scenario output. It is not presented as a confirmed fact.

## Missing-information behavior

The adapter preserves official Product Intelligence missing messages and adds explicit evidence-gap messages when these presentation areas cannot be supported:

- plan summary;
- contribution;
- construction;
- protection;
- future scenarios;
- recommended benefits;
- secondary details.

Unknown values are not converted to zero. Empty cards are not rendered. Missing benefits, recovery values, or scenarios are never fabricated.

## Vida Mujer preservation

- Imagina Ser routing requires an explicit normalized `imagina_ser` product identity.
- Vida Mujer does not match the adapter route.
- The existing Vida Mujer grouping, labels, class names, block keys, section order, formatting, and layout code were not changed.
- The existing benefit-summary test continues to assert contribution, protection, dotales, recovery, PCF, recommended benefits, and absence of retirement scenarios for Vida Mujer.
- R13A legacy selector and color-token assertions remain green.

## Validation results

- Initial worktree clean and HEAD `6e3bfc8b6b08c8cbfae07fc1b708aee8d553f614`: PASS.
- `node --check docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js`: PASS.
- `node --check docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js`: PASS.
- `node --check tests/imagina-ser-product-dashboard-adapter-test.mjs`: PASS.
- `node tests/imagina-ser-product-dashboard-adapter-test.mjs`: PASS.
- `node tests/product-dashboard-template-test.mjs`: PASS.
- `node tests/quote-benefit-summary-engine-test.mjs`: PASS, including Imagina Ser and Vida Mujer logical regression assertions.
- `node tests/pdf-browser-parser-smoke-test.mjs`: PASS.
- `node tests/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b-test.js`: PASS.
- Vida Mujer selector/class compatibility: PASS; no legacy selector or layout change.
- `git diff --check`: PASS.
- Privacy check on added lines: PASS.
- Exact changed-file allowlist: PASS.

Node emitted the repository's existing module-type warning for ESM files; all validation commands exited successfully.

## Prohibited surfaces confirmed

No changes were made to:

- `app.js`;
- mobile UI;
- `forge-pdf-browser-parser.js` or any financial parser;
- schemas;
- routes;
- rule packs;
- client fixtures;
- sensitive data;
- `index.html`.

## Live validation target

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/nueva-cotizacion/?v=r13c`

## Closure

R13C is implemented within its constitutional boundary. Imagina Ser now has a product-specific commercial narrative over the reusable template while Product Intelligence remains the owner of semantics, evidence, scenarios, and values.
