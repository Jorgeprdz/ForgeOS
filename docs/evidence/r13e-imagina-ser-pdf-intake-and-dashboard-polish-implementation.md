# R13E Imagina Ser PDF Intake And Dashboard Polish Implementation

## Decision

`PASS_R13E_IMAGINA_SER_PDF_INTAKE_AND_DASHBOARD_POLISH_IMPLEMENTATION`

R13E adds product-aware direct PDF routing, reuses the canonical Solucionline retirement parser for Imagina Ser accepted-quote intake, and compacts the Imagina Ser dashboard without modifying Product Intelligence values.

## Constitutional authorization

| Field | Result |
| --- | --- |
| Constitution | `FORGE_CONSTITUTION_V3.md` |
| ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Intelligence UI + browser PDF intake |
| Discovery/readiness | Locked and ready with conditions by R13D |
| Board approval | Approved by project owner for R13E implementation |
| Miranda approval | Approved with Imagina Ser-only parser scope and Vida Mujer preservation |

## Files changed

| File | Reason |
| --- | --- |
| `docs/static-preview/quote-preview-live/forge-pdf-browser-parser.js` | Adds evidence-based product routing, calls the canonical retirement parser, maps supported Imagina Ser fields to the accepted-quote contract, and returns neutral unknown-product output. |
| `docs/static-preview/quote-preview-live/forge-solucionline-retirement-parser.js` | Hosts the single browser-published Solucionline parser implementation so GitHub Pages can resolve the dependency. |
| `product-intelligence/evidence/solucionline-retirement-parser.js` | Preserves the canonical repository API as a re-export of the single browser-safe implementation. |
| `docs/static-preview/quote-preview-live/forge-imagina-ser-product-dashboard-adapter.js` | Adds zero-decimal Imagina Ser presentation formatting, thousands separators, projected-MXN styling, compact construction metrics, and scenario deduplication. |
| `docs/static-preview/quote-preview-live/forge-benefit-summary-renderer.js` | Stops supplying the generic two-decimal formatter to Imagina Ser so its product adapter controls presentation only. |
| `tests/pdf-browser-parser-smoke-test.mjs` | Adds Imagina Ser complete/incomplete PDF-text routing and routed Vida Mujer regressions. |
| `tests/imagina-ser-product-dashboard-adapter-test.mjs` | Adds JSON routing, zero-decimal formatting, compact construction, no separate future-scenario section, and template-layout compatibility assertions. |
| `docs/evidence/r13e-imagina-ser-pdf-intake-and-dashboard-polish-implementation.md` | Records authority, mapping, formatting, deduplication, validation, and prohibited-surface evidence. |

`index.html` and the reusable template did not require modification. The canonical parser path remains compatible through a re-export.

## PDF intake correction

The direct PDF path now performs:

```text
browser PDF text extraction
-> parsePdfTextToAcceptedQuotePacket()
-> Vida Mujer evidence: existing Vida Mujer parser
-> Imagina Ser evidence: canonical Solucionline retirement parser
-> unknown evidence: neutral unsupported packet
```

Vida Mujer detection remains first and delegates to the unchanged `parseVidaMujerPdfTextToAcceptedQuotePacket()` function.

Imagina Ser detection is confirmed through the canonical parser's `evidence.productName === "SOURCE_TEXT"`. Filename-only detection is not used.

Consequently, a positively identified Imagina Ser PDF never enters the Vida Mujer packet builder and cannot receive `No se detectó producto Vida Mujer en el PDF.`

## Canonical parser reuse

`forge-pdf-browser-parser.js` imports:

`parseSolucionlineRetirementQuote()` from the browser-published shared implementation. `product-intelligence/evidence/solucionline-retirement-parser.js` re-exports the same function for existing repository consumers.

There is one Solucionline parser implementation. No product regex, premium parsing rule, scenario parsing rule, or financial formula is duplicated inside browser intake.

The accepted-packet mapper consumes only parser output and evidence states. It maps:

- identified product and `imagina_ser` family;
- evidence-backed currency, age, coverage term, sum assured, and premiums;
- evidence-backed base/favorable/unfavorable scenarios;
- payment term when the parser found a positive limited-payment value;
- parser evidence states and Imagina Ser-specific missing information.

Fields whose evidence state is `MISSING` remain null/absent. Parser fallback zeros are not promoted to accepted quote facts.

## Missing information

Incomplete Imagina Ser text produces an accepted-quote packet with specific gaps for:

- age;
- currency;
- sum assured;
- contribution structure;
- scenarios.

It does not emit a Vida Mujer error. Unknown product text produces a neutral unsupported-product message and is not coerced into either product.

## Visual formatting

Imagina Ser presentation now uses product-specific formatters:

- UDI: zero decimals and thousands separators;
- MXN: zero decimals, thousands separators, and `≈ $` projected-value prefix;
- target age remains explicit when supplied by evidence;
- underlying numeric values and Product Intelligence blocks are not mutated.

Verified examples:

- `607685.9251110773 UDI` -> `607,686 UDI`;
- `607685.9251110773 MXN` -> `≈ $607,686 MXN`.

UDI remains the primary value segment and MXN remains the secondary segment consumed by the existing color hierarchy.

## Scenario deduplication and space use

`Lo que construyes` now contains:

- the base patrimonial goal;
- accumulated values already emitted by Product Intelligence;
- compact labeled base, favorable, and unfavorable scenario metrics.

The base scenario omits the patrimonial goal already shown by the main construction metric. A separate `Escenario futuro` section is no longer rendered.

The construction section uses the approved wide primary-metric layout key while retaining semantic `construction` ownership through `data-forge-product-section`. This uses existing desktop space without changing mobile CSS or adding DOM overlays.

## Vida Mujer preservation

- The Vida Mujer parser implementation and exported API remain unchanged.
- Vida Mujer source text routes to the same packet builder as before.
- Existing Vida Mujer packet fields, missing messages, benefit summaries, selectors, layout, and values remain unchanged.
- The JSON accepted-quote flow is unchanged.
- The renderer's legacy Vida Mujer path remains the default for all non-Imagina products.

## Validation results

- Initial worktree clean and HEAD `db3acb0fb0e60bb6c1d6eecd3171ce8d72b38f92`: PASS.
- `node --check` for every changed JavaScript/test file: PASS.
- `node tests/imagina-ser-product-dashboard-adapter-test.mjs`: PASS.
- `node tests/product-dashboard-template-test.mjs`: PASS.
- `node tests/quote-benefit-summary-engine-test.mjs`: PASS.
- `node tests/pdf-browser-parser-smoke-test.mjs`: PASS.
- `node tests/quote-preview-pdf-engine-parser-ownership-registry-adapter-083b-test.js`: PASS.
- Complete Imagina Ser PDF-text intake avoids Vida Mujer error: PASS.
- Incomplete Imagina Ser PDF-text intake emits product-specific missing information: PASS.
- Routed Vida Mujer PDF-text behavior: PASS.
- Accepted Imagina Ser JSON/product identity: PASS.
- Zero-decimal UDI/MXN presentation: PASS.
- No separate duplicated future-scenario section: PASS.
- Vida Mujer logic and selector compatibility: PASS.
- `git diff --check`: PASS.
- Privacy check on added lines: PASS.
- Exact changed-file allowlist: PASS.

Node emitted the repository's existing module-type warnings for ESM files; validation commands exited successfully.

## Prohibited surfaces confirmed

No changes were made to:

- mobile UI;
- schemas;
- routes;
- `app.js`;
- rule packs;
- real-client fixtures;
- sensitive data;
- unrelated parsers;
- `index.html`.

## Live validation target

`https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/nueva-cotizacion/?v=r13e`

## Closure

R13E is implemented within its constitutional boundary. Direct Imagina Ser PDFs now use product-aware intake, and the dashboard presents rounded, compact, non-duplicated evidence while Vida Mujer remains compatible.
