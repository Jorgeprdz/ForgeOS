# R13F Imagina Ser Desktop Visual Polish And Real PDF QA Discovery And Readiness

## Decision

`PASS_R13F_IMAGINA_SER_DESKTOP_VISUAL_POLISH_AND_REAL_PDF_QA_DISCOVERY_AND_READINESS`

R13F is a registration/readiness module only. The requested visual implementation is constitutionally deferred to `R13G_IMAGINA_SER_DESKTOP_VISUAL_POLISH_AND_REAL_PDF_QA_IMPLEMENTATION` because R13F was not registered in the canonical Build Tree at intake.

## Constitutional authorization

| Field | Result |
| --- | --- |
| Constitution | `FORGE_CONSTITUTION_V3.md` |
| ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Dashboard Template / Imagina Ser |
| Initial discovery state | R13E implemented; R13F absent from Build Tree |
| R13F result | Discovery locked; R13G ready with conditions |
| Board approval | Approved by project owner for visual polish and QA |
| Miranda approval | Approved with disciplined visual-only scope |

ROBOCOP LOCK 001 does not allow implementation readiness to be inferred from intent or approval alone. The missing R13F registration therefore blocked source implementation in this turn.

## Baseline

- Required and confirmed HEAD: `883c412917736821217f03cfeb250a38cf6a7667`.
- Initial worktree: clean.
- R13E direct PDF intake and dashboard formatting remain the operational baseline.

## Files changed

| File | Reason |
| --- | --- |
| `FORGE_MASTER_BUILD_TREE.md` | Registers R13F discovery/readiness, exact R13G allowlist, prohibited surfaces, QA contract, and separate implementation gate. |
| `docs/evidence/r13f-imagina-ser-desktop-visual-polish-and-real-pdf-qa.md` | Records constitutional authority, discovery findings, planned visual decisions, local PDF availability boundary, validation, and deferral. |

No runtime source, parser, template, renderer, layout, test, fixture, schema, route, rule pack, or mobile file changed.

## Planned horizontal-space improvement

R13G may rebalance the existing semantic section grid without moving or reconstructing DOM after render. The product-specific adapter remains the preferred owner of Imagina Ser presentation metadata. Neutral template or layout changes are allowed only when reusable and proven compatible with Vida Mujer.

The intended hierarchy is:

- `Lo que construyes` as the dominant desktop section;
- `Lo que aportas` compact and free of unused interior space;
- `Lo que proteges`, `Beneficios recomendados`, `Otros detalles`, and `Información pendiente` proportioned by actual content;
- no narrow columns that create vertical, clipped, or excessively fragmented text.

## Planned card proportions

R13G must choose proportions from rendered evidence at multiple desktop widths. It must not hardcode a single screenshot geometry. Empty sections remain omitted through the existing adapter model, and missing information remains explicit rather than silently removed.

## Planned commercial-label polish

Allowed presentation-only label refinements include:

- `Meta patrimonial` as the principal result label;
- `Total aportado` when supported by the existing contribution evidence;
- an explicitly projected label for future totals when projection evidence is present;
- `Proyección patrimonial` or `Valores futuros` for evidence-backed values grouped by target ages.

Labels must not change evidence state, product semantics, scenario meaning, or forecast boundaries.

## Planned large-value handling

R13E already owns zero-decimal and thousands-separator presentation. R13G may adjust typography and responsive desktop sizing only. It must preserve:

- full visible values;
- UDI as primary;
- projected MXN as secondary;
- 0 display decimals;
- source-bound forecast/scenario semantics.

No numerical calculation or parser output may change.

## PDF availability discovery

Local Downloads contains multiple `Solucionline_*.PDF` files and several Imagina Ser reference documents. Filename inventory alone cannot establish product identity, client safety, or relevance as a quote fixture.

R13G must inspect PDFs locally and transiently, confirm product identity from document evidence, and avoid copying or committing any PDF or client data. If two or three additional relevant quote PDFs cannot be confirmed, the execution evidence must record:

`REAL_PDF_QA=LIMITED_NO_LOCAL_FIXTURES`

No PDF content or client identity was added to this evidence.

## Vida Mujer preservation contract

R13G must prove:

- existing Vida Mujer selectors remain present;
- Vida Mujer renderer output and section grouping remain compatible;
- no Vida Mujer value, dotales, AVE, PCF, recommended benefit, or layout semantics regress;
- reusable CSS, if changed, is product-scoped or carries explicit Vida Mujer visual evidence.

## Required R13G validation

- `node --check` for all changed JavaScript/test files;
- `node tests/imagina-ser-product-dashboard-adapter-test.mjs`;
- `node tests/product-dashboard-template-test.mjs`;
- `node tests/quote-benefit-summary-engine-test.mjs`;
- `node tests/pdf-browser-parser-smoke-test.mjs`;
- parser ownership test;
- assertions for large-value rounding, scenario deduplication, principal construction section, and Vida Mujer preservation;
- desktop visual QA using accepted JSON, direct Imagina Ser PDF, and Vida Mujer PDF;
- additional real-PDF QA only when locally confirmed;
- `git diff --check`, privacy check, exact allowlist, and prohibited-surface audit.

## Validation in this registration turn

- clean worktree preflight: PASS;
- exact HEAD `883c412917736821217f03cfeb250a38cf6a7667`: PASS;
- R13F absence from Build Tree confirmed: PASS;
- R13E evidence and current adapter/template inventory reviewed: PASS;
- local PDF filename inventory performed without copying content: PASS;
- implementation source untouched: PASS.

## Prohibited surfaces confirmed

No changes were made to:

- parser code;
- mobile UI;
- schemas;
- routes;
- `app.js`;
- rule packs;
- Product Truth or financial calculations;
- fixtures or real PDFs;
- client data or sensitive information.

## Closure

R13F is now registered and implementation-ready with conditions. Implementation did not occur in this turn. A fresh Constitutional Gate must cite this readiness lock before R13G changes any source or test file.

LOCKED_DECISION=`R13F_REGISTERED_R13G_IMPLEMENTATION_REQUIRES_SEPARATE_GATE`
