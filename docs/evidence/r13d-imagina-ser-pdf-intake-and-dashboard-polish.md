# R13D Imagina Ser PDF Intake And Dashboard Polish Discovery And Readiness

## Decision

`PASS_R13D_IMAGINA_SER_PDF_INTAKE_AND_DASHBOARD_POLISH_DISCOVERY_AND_READINESS`

R13D is a discovery/readiness/registration module only. No parser, intake, dashboard, renderer, template, or runtime implementation was performed because R13D was absent from the canonical Build Tree at intake.

Implementation is deferred to `R13E_IMAGINA_SER_PDF_INTAKE_AND_DASHBOARD_POLISH_IMPLEMENTATION`.

## Constitutional authorization

| Field | Result |
| --- | --- |
| Constitution | `FORGE_CONSTITUTION_V3.md` |
| ADRs | ADR-003, ADR-004, ADR-005, ADR-007, ADR-008 |
| Build Tree area | Quote Preview / Product Intelligence UI + browser PDF intake |
| Discovery status | Locked by this module |
| Implementation readiness | Ready with conditions for R13E |
| Board approval | Approved by project owner for implementation within the Imagina Ser-only parser boundary |
| Miranda approval | Approved with no invented data, no mobile changes, and no Vida Mujer regression |
| R13D execution authority | Discovery/readiness/registration because canonical registration was absent at intake |

## Root cause: direct PDF intake

The current browser PDF flow is:

```text
parsePdfFileToAcceptedQuotePacket(file)
-> extractTextFromPdfFile107z15p2R11E(file)
-> parseVidaMujerPdfTextToAcceptedQuotePacket(text)
```

There is no product router between text extraction and parsing. Every direct PDF is treated as a Vida Mujer candidate. `buildVidaMujerAcceptedQuotePacketFromText107z15p2R11E()` consequently emits:

`No se detectó producto Vida Mujer en el PDF.`

This is the direct cause of the reported Imagina Ser error. The accepted JSON flow does not have this routing defect and must remain unchanged.

## Existing parser ownership

The repository already contains:

`product-intelligence/evidence/solucionline-retirement-parser.js`

Its `parseSolucionlineRetirementQuote({ text })` output includes:

- product name;
- current and retirement ages;
- coverage years;
- premium structure and payment term;
- currency;
- sum assured;
- base, favorable, and unfavorable scenario evidence;
- interest rate;
- per-area evidence states.

R13E must reuse this parser. It must not reproduce its regexes or retirement semantics inside the browser intake surface.

The browser intake may add only:

- evidence-based product routing;
- a narrow Imagina Ser parser call;
- a product-specific accepted-quote packet mapper;
- Imagina Ser-specific missing-information translation.

## Required product routing

| Detection result | Parser route | Missing behavior |
| --- | --- | --- |
| Sufficient Vida Mujer evidence | Existing Vida Mujer parser | Existing Vida Mujer missing messages unchanged |
| Sufficient Imagina Ser evidence | Existing Solucionline retirement parser | Imagina Ser-specific evidence gaps |
| No sufficient product evidence | Unknown-product result | Neutral unsupported/missing product message; never assume Vida Mujer |

Positive Imagina Ser evidence must be based on product-identifying source text such as the official Imagina Ser product-name pattern already owned by the Solucionline parser. Filename-only detection is insufficient.

## Accepted-quote mapping boundary

R13E may map only fields emitted by the existing retirement parser into the packet shape already consumed by the accepted-quote adapter. Expected mapping candidates include:

- `product` and `productFamily` from identified product output;
- `nativeResult` from the structured parser result;
- currency from parsed evidence;
- age and payment/coverage metadata when present;
- sum assured and premium fields when present;
- structured scenarios when present;
- `missing_information` derived from explicit `MISSING` evidence states.

Unknown fields must stay absent or null. They must not receive Vida Mujer defaults, remembered values, or inferred client data.

## Dashboard polish readiness

Current R13C behavior renders both a base construction goal and separate scenario content. When those sections expose the same underlying scenario values, the result is visually repetitive.

R13E must:

- keep `Lo que construyes` as the primary patrimonial section;
- incorporate distinct scenario evidence as compact items or chips inside that section;
- omit `Escenario futuro` when it repeats the same evidence objects/values;
- retain explicit scenario labels so forecast output is not presented as fact;
- render a separate section only when it contains materially distinct evidence.

This is presentation deduplication, not value reconciliation or recalculation.

## Numeric presentation readiness

R13E may format existing adapter values for display only:

- UDI: zero fractional digits with thousands separators;
- MXN: zero fractional digits with thousands separators and approximate marker where the source is projected;
- example presentation contract: `607685.9251110773 MXN` becomes `≈ $607,686 MXN`;
- UDI remains the primary visual value;
- MXN remains secondary;
- underlying Product Intelligence numbers remain unchanged.

Long decimals must not be passed directly to cards. Formatting belongs in the Imagina Ser adapter/presentation boundary, not the parser or Product Intelligence engine.

## Vida Mujer preservation

- Keep `parseVidaMujerPdfTextToAcceptedQuotePacket()` behavior and exports unchanged.
- Route Vida Mujer evidence to the existing parser without changing its extraction rules.
- Keep accepted Vida Mujer packet fields and missing messages unchanged.
- Keep Vida Mujer dashboard grouping, selectors, section order, color hierarchy, and values unchanged.
- Run existing Vida Mujer parser and benefit-summary assertions after R13E.

## Files touched in R13D

| File | Reason |
| --- | --- |
| `FORGE_MASTER_BUILD_TREE.md` | Registers R13D, locks the root cause and boundaries, and names R13E as the implementation module. |
| `docs/evidence/r13d-imagina-ser-pdf-intake-and-dashboard-polish.md` | Records parser ownership, routing design, accepted-packet boundary, visual formatting contract, deduplication rules, and validation requirements. |

No JavaScript, HTML, CSS, parser, intake, UI, runtime, mobile, schema, route, `app.js`, rule pack, fixture, or product data was changed.

## R13E entry conditions

- Fresh Constitutional Gate citing this evidence and the R13D Build Tree lock.
- Exact allowlist for the browser PDF parser, Imagina Ser adapter, narrowly required renderer/template files, tests, and evidence.
- Existing Solucionline retirement parser remains semantic/parser owner.
- Browser intake performs routing and accepted-packet mapping only.
- Dashboard formatting remains presentational and does not mutate source values.
- Vida Mujer and accepted JSON compatibility remain mandatory.

## Validation contract

- `node --check` for every changed JavaScript file;
- Imagina Ser PDF-text intake does not emit a Vida Mujer error;
- incomplete Imagina Ser intake produces Imagina Ser-specific missing information;
- accepted Imagina Ser JSON remains supported;
- UDI/MXN formatting rounds to zero decimals and uses thousands separators;
- duplicated future scenario evidence is folded into `Lo que construyes`;
- existing Vida Mujer parser and dashboard assertions pass;
- reusable product-dashboard template test passes;
- quote benefit-summary test passes;
- PDF browser parser smoke test passes;
- parser ownership test passes;
- `git diff --check`, privacy check, and exact changed-file allowlist pass.

## Closure

R13D is registered and implementation-ready with conditions. This task performed gate/registration work only. Functional implementation remains `R13E_IMAGINA_SER_PDF_INTAKE_AND_DASHBOARD_POLISH_IMPLEMENTATION`.
