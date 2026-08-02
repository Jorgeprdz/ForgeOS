# Forge SeguBeca Productive UI Binding 001

## Decision

`SEGUBECA_PRODUCTIVE_UI_BINDING=CANONICAL`

The productive Material 3 Quotes surface obtains every SeguBeca preview and every human-confirmed review snapshot from the accepted SeguBeca calculation authority promoted in PR #153.

```text
PRODUCTIVE_ROUTE=forge-alive-material3/?nav=cotizaciones
SOURCE_INTAKE=REAL_PDF_FILE_INPUT
SOURCE_EXTRACTION=FORGE_PDF_BROWSER_PARSER
CALCULATION_AUTHORITY=SEGUBECA_ACCEPTED_PRODUCT_CALCULATION
CALCULATION_AUTHORITY_VERSION=SEGUBECA-CALCULATION-AUTHORITY-001.1
PRODUCT_DASHBOARD=segubeca
FINAL_AUTHORITY=HUMAN
CANONICAL_AUTHORITY_FILE_CHANGED=NO
```

## Productive path

```text
PDF binario de Solución Online
→ extracción local con PDF.js
→ accepted quote packet SeguBeca
→ alineación productiva con la precedencia aceptada
→ autoridad canónica PR #153 sin modificar
→ proyección UDI/MXN
→ Material 3 product dashboard
→ revisión humana
→ accepted review snapshot
```

The generic accepted-quote bridge remains the compatibility transport for the existing Quotes runtime. For a SeguBeca candidate, the bridge exposed to Material 3 is wrapped so that its preview getters, calculation request, confirmation request, and review snapshot resolve through the SeguBeca authority.

```text
GENERIC_BRIDGE_REMOVED=NO
GENERIC_PRODUCTS_CHANGED=NO
SEGUBECA_DISPLAYED_CALCULATION_SOURCE=SEGUBECA_AUTHORITY
SEGUBECA_CONFIRMED_SNAPSHOT_SOURCE=SEGUBECA_AUTHORITY
```

## Contractual alignment order

The accepted SeguBeca adapter already defines the canonical precedence for `totalContributed`, `totalRecovery`, payment term, and coverage period. The productive binding applies that precedence to a new immutable packet before handing it to the unchanged PR #153 authority.

```text
CONTRACTUAL_PRECEDENCE_AUTHORITY=calculateSegubecaAcceptedR14E
CONTRACTUAL_ALIGNMENT_LOCATION=PRODUCTIVE_UI_BINDING
CONTRACTUAL_ALIGNMENT_BEFORE_AUTHORITY_PROJECTION=REQUIRED
CANONICAL_AUTHORITY_FILE_CHANGED=NO
NEW_PRODUCT_FORMULA=NO
GUARANTEED_TABLE_VALUE_WINS=YES
LATE_PROJECTION_FALLBACK=FORBIDDEN
```

This is sequencing, not a new formula. For the sanitized accepted proposal, the source guaranteed row supplies `35,339 UDI`; the unchanged authority and UDI runtime then distribute that accepted total across the fourteen source payment years for the commercial MXN reading.

## Public entrypoint and cache boundary

The Material 3 HTML entrypoint loads a versioned, lightweight SeguBeca entrypoint independently of the historical Quotes bundle. The lightweight entrypoint imports no PDF, parser, accepted-adapter, calculation-authority, or UDI runtime dependency at module evaluation time.

The productive binding is loaded dynamically only when either:

- the requested public route is `cotizaciones` / `quotes`; or
- the shell emits `forge:quotes-module-ready`.

```text
PUBLIC_APP_CANONICAL_VERSION=ui-m05x-quote-intake-ready-001
PUBLIC_APP_SEGUBECA_CACHE_KEY=productive-ui-001
PUBLIC_SEGUBECA_ENTRYPOINT=segubeca-productive-ui-entrypoint.js?v=segubeca-productive-ui-001
ENTRYPOINT_STATIC_PRODUCT_BINDING_IMPORT=NO
PRODUCT_BINDING_LOAD_MODE=DYNAMIC
PRODUCT_BINDING_LOAD_TRIGGER=QUOTES_ROUTE_OR_MODULE_READY
NON_QUOTES_ROUTE_BINDING_LOAD=NO
ACTIVITY_ROUTE_PDF_RUNTIME_LOAD=NO
CACHED_QUOTES_MODULE_COMPATIBILITY=REQUIRED
STANDARD_PREVIEW_EVENT_REEMITTED=YES
GUESSED_PUBLIC_URL_ACCEPTANCE=FORBIDDEN
```

The route-scoped load boundary is mandatory. Loading the SeguBeca dependency graph globally can initialize PDF or browser-runtime code inside unrelated sandboxed Activity surfaces and is therefore forbidden.

The SeguBeca cache key extends the M05X app version; it never replaces that canonical readiness contract. The entrypoint also re-emits the standard preview event after the authority finishes so a previously cached `quotes-module.js` can reconcile the new result. Productive Pages acceptance remains a separate post-merge deployment check; repository browser acceptance does not pretend that deployment already occurred.

## Contractual and projected truth

```text
CONTRACTUAL_VALUES=SOLUCIONLINE_SOURCE_DOCUMENT
ANNUAL_PREMIUM=SOURCE_DOCUMENT
SUM_ASSURED=SOURCE_DOCUMENT
GUARANTEED_TABLE=SOURCE_DOCUMENT
ADMINISTRATION_TABLE=SOURCE_DOCUMENT
MONTHLY_EDUCATION_PAYOUT=SOURCE_DOCUMENT

VERIFIED_UDI_RATE_REQUIRED_FOR_MXN=YES
ANNUAL_UDI_GROWTH_RATE=0.045
PROJECTION_GUARANTEED=NO
TOTAL_CONTRIBUTED_MXN=YEAR_BY_YEAR
FLAT_TOTAL_CONTRIBUTION_CONVERSION=FORBIDDEN
```

Material 3 identifies projected MXN values as a non-guaranteed scenario. If no verified UDI is available, the MXN projection remains blocked rather than invented.

## Real-PDF acceptance meaning

The acceptance test sends a valid `%PDF-1.4` binary file through the same productive file input used by the user. PDF.js opens the document, extracts its rows, and the regular browser parser creates the accepted packet.

The PDF bytes are generated only inside the test runner from a sanitized Solución Online-shaped proposal surface. They are deleted after the run.

```text
JSON_UPLOAD_USED_FOR_ACCEPTANCE=NO
TEXT_ONLY_SHORTCUT_USED_FOR_ACCEPTANCE=NO
PDFJS_DOCUMENT_OPEN_REQUIRED=YES
PDF_BINARY_COMMITTED=NO
REAL_CLIENT_DOCUMENT_COMMITTED=NO
CLIENT_IDENTITIES=SANITIZED
```

This proves the real browser/PDF transport without retaining client data or claiming that the generated fixture is an insurer-issued customer document.

## Required acceptance

Before merge, the browser and cross-module tests must prove:

- the Material 3 Cotizaciones route mounts the real PDF selector;
- a PDF file reaches `browser_pdf_parser`;
- the detected product family is `segubeca`;
- the displayed dashboard declares `SEGUBECA_ACCEPTED_PRODUCT_CALCULATION`;
- the accepted values preserve `35,339 UDI` total contributed and `30,000 UDI` recovery from the sanitized source table;
- the contribution projection contains fourteen annual entries;
- the projection rate is `0.045` and is explicitly non-guaranteed;
- no flat total-contribution conversion is authorized;
- the quote is not accepted before a human click;
- after the human click, the review snapshot preserves the same authority and values;
- quote and CRM mutation remain disabled;
- the historical browser regression uses the governed “Cotización confirmada” status;
- Activity can render inside its sandbox without importing the SeguBeca/PDF dependency graph;
- no placeholder, `[object Object]`, page exception, or horizontal overflow survives.

## Prohibited effects

```text
PRODUCT_FORMULA_REIMPLEMENTATION=FORBIDDEN
PARSER_REIMPLEMENTATION=FORBIDDEN
HARDCODED_UDI_RATE=FORBIDDEN
GLOBAL_SEGUBECA_BINDING_IMPORT=FORBIDDEN
NON_QUOTES_PDF_RUNTIME_INITIALIZATION=FORBIDDEN
AUTOMATIC_QUOTE_ACCEPTANCE=FORBIDDEN
AUTOMATIC_RECONFIRMATION=FORBIDDEN
AUTOMATIC_DOWNLOAD=FORBIDDEN
AUTOMATIC_PIPELINE_STAGE_ADVANCE=FORBIDDEN
AUTOMATIC_APPLICATION_CREATION=FORBIDDEN
AUTOMATIC_POLICY_CREATION=FORBIDDEN
QUOTE_MUTATION=NOT_AUTHORIZED
CRM_MUTATION=NOT_AUTHORIZED
CARTERA_MUTATION=NOT_AUTHORIZED
SUPABASE_MUTATION=NOT_AUTHORIZED
DATABASE_MIGRATION=NOT_AUTHORIZED
```

## Files in this pass

```text
CANONICAL_AUTHORITY_FILE_CHANGED=NO
PUBLIC_ENTRYPOINT=docs/static-preview/forge-alive-material3/index.html
PRODUCTIVE_ENTRYPOINT=docs/static-preview/forge-alive-material3/segubeca-productive-ui-entrypoint.js
PRODUCTIVE_BINDING=docs/static-preview/forge-alive-material3/segubeca-productive-ui-binding.js
PRODUCTIVE_MOUNT=docs/static-preview/forge-alive-material3/quotes-module.js
REAL_PDF_TEST=tests/segubeca-material3-real-pdf-acceptance-test.mjs
HISTORICAL_BROWSER_TEST=tests/segubeca-browser-render-integration-test.mjs
SOURCE_TRUTH=docs/architecture/source-truth/FORGE_SEGUBECA_PRODUCTIVE_UI_BINDING_001.md
EVIDENCE=docs/evidence/FORGE_SEGUBECA_PRODUCTIVE_UI_REAL_PDF_ACCEPTANCE_001.md
WORKFLOW=.github/workflows/segubeca-productive-ui-real-pdf.yml
```