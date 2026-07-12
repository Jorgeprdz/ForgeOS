# R13B Imagina Ser Product Dashboard Adapter Discovery And Readiness

## Decision

`PASS_R13B_IMAGINA_SER_PRODUCT_DASHBOARD_ADAPTER_DISCOVERY_AND_READINESS`

R13B is a gate/registration module only. The requested adapter was not implemented because R13B did not exist in the canonical Build Tree and had no implementation-readiness evidence before this task.

Implementation is deferred to `R13C_IMAGINA_SER_PRODUCT_DASHBOARD_ADAPTER_IMPLEMENTATION`.

## Constitutional authorization

| Field | Result |
| --- | --- |
| Constitution | `FORGE_CONSTITUTION_V3.md` |
| ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Intelligence UI |
| Discovery status | Discovery locked by this module |
| Implementation readiness | Ready with conditions for R13C |
| Board approval | Approved by project owner for adapter implementation within declared boundaries |
| Miranda approval | Approved with disciplined scope and no invented data |
| R13B execution authority | Discovery/readiness/registration only because canonical registration was absent at intake |

## Read-only inventory

The existing Imagina Ser flow is:

```text
accepted quote fields
-> forge-benefit-summary-renderer.js buildDynamicBenefitSummaryRows()
-> quote-benefit-summary-engine.js buildQuoteBenefitSummary()
-> buildRetirementBenefitSummary()
-> contribution_summary
-> protection_summary
-> retirement_scenarios
-> missing_information when required evidence is absent
```

The renderer currently converts those blocks into generic runtime rows through `benefitSummaryToRuntimeRows()`. It does not yet have an Imagina Ser-specific presentation adapter, so scenario rows enter the existing visible grouping path.

## Existing Product Intelligence outputs

| Block | Existing evidence-backed content | Planned R13C presentation |
| --- | --- | --- |
| `contribution_summary` | Total contributed UDI/MXN and paying years when present | Lo que aportas; selected evidence may support Resumen del plan |
| `protection_summary` | Sum assured UDI/current MXN when present | Lo que proteges |
| `retirement_scenarios` | Available favorable/base/unfavorable scenario values and explicit missing scenarios | Escenario futuro, preserving scenario labels and uncertainty |
| `missing_information` | Missing contribution, protection, recovery, or scenario evidence | Clean missing-information section |

The current Product Intelligence engine may derive official summary values inside its own governed domain. The future UI adapter must consume those emitted values and must not reproduce the calculation.

## R13A template consumption plan

R13C may use these existing template primitives:

- `createProductDashboard()` for the dashboard container;
- `createProductDashboardSection()` for compact semantic sections;
- `createPrimaryMetric()` for primary evidence-backed plan metrics;
- `createMetricRow()` for contribution, protection, construction, scenarios, and secondary details;
- `createRecommendedBenefitCard()` only for structured recommended-benefit evidence;
- `createMissingInformationSection()` for explicit unknowns;
- `PRODUCT_DASHBOARD_SECTION_KINDS` for neutral section vocabulary.

The adapter must map official blocks to presentation. It must not become the owner of Product Truth, forecast logic, calculations, or evidence.

## Planned Imagina Ser representation

- Resumen del plan: only identified plan metadata already present in the accepted structured output.
- Lo que aportas: `contribution_summary`.
- Lo que construyes: only accumulated or retirement construction values already emitted with evidence.
- Lo que proteges: `protection_summary`.
- Escenario futuro: `retirement_scenarios`, clearly presented as non-factual future scenarios.
- Recuperación/valores: only if an official structured output provides them.
- Beneficios recomendados: only if an official structured block provides them.
- Otros detalles: only evidence-backed structured fields not owned by another displayed section.
- Missing information: official missing blocks plus required presentation sections that lack sufficient evidence, without treating unknown as zero.

## Vida Mujer preservation

- The current Vida Mujer renderer, grouping, section order, visual classes, labels, and formatting were not changed.
- R13C must route Imagina Ser explicitly and leave the Vida Mujer branch compatible.
- R13C must run the existing Vida Mujer benefit-summary assertions and legacy template-class checks.

## Files touched

| File | Reason |
| --- | --- |
| `FORGE_MASTER_BUILD_TREE.md` | Canonically registers R13B, locks readiness conditions, and names R13C as the implementation module. |
| `docs/evidence/r13b-imagina-ser-product-dashboard-adapter.md` | Records discovery, current data flow, boundaries, mapping plan, approval, and validation contract. |

No JavaScript, HTML, CSS, UI, runtime, parser, schema, route, `app.js`, rule pack, mobile surface, fixture, or product data was changed.

## Missing-information rules for R13C

- Do not create an empty card merely to satisfy the planned narrative.
- Prefer the official `missing_information` block when Product Intelligence already declares the gap.
- Add adapter-level missing information only when a required presentation contract cannot be satisfied from structured evidence.
- Preserve distinctions between missing contribution, protection, recovery, and individual scenarios.
- Never translate missing data into zero, a default forecast, or a product claim.

## R13C entry conditions

- Fresh Constitutional Gate citing this evidence and Build Tree registration.
- Exact source allowlist including the new adapter/config path.
- Product Intelligence blocks are the adapter's only semantic/value source.
- No parser or raw-PDF field access.
- No mobile, schema, route, `app.js`, or rule-pack changes.
- Vida Mujer compatibility remains mandatory.

## Validation contract

- `node --check` for every JavaScript file created or modified in R13C;
- reusable product-dashboard template test;
- quote benefit-summary test, including Imagina Ser and Vida Mujer assertions;
- PDF browser parser smoke test;
- parser ownership test;
- dedicated Imagina Ser adapter/config test;
- `git diff --check`;
- privacy check on added lines;
- exact changed-file allowlist;
- explicit confirmation that prohibited surfaces remain unchanged.

## Closure

R13B is registered and implementation-ready with conditions. This task performed gate/registration work only. The adapter implementation remains `R13C_IMAGINA_SER_PRODUCT_DASHBOARD_ADAPTER_IMPLEMENTATION`.
