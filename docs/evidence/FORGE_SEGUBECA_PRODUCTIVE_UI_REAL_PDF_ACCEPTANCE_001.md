# Forge SeguBeca Productive UI and Real-PDF Acceptance 001

## Decision

`SEGUBECA_PRODUCTIVE_UI_REAL_PDF_ACCEPTANCE=PASS_ON_IMPLEMENTATION_HEAD`

## Productive binding

The Material 3 Cotizaciones surface loads the accepted SeguBeca calculation authority through a dedicated, versioned entrypoint.

```text
PUBLIC_ENTRYPOINT=forge-alive-material3/index.html
CANONICAL_APP_VERSION=ui-m05x-quote-intake-ready-001
SEGUBECA_CACHE_KEY=productive-ui-001
SEGUBECA_ENTRYPOINT=segubeca-productive-ui-entrypoint.js
SEGUBECA_BINDING=segubeca-productive-ui-binding.js
CALCULATION_AUTHORITY=SEGUBECA_ACCEPTED_PRODUCT_CALCULATION
AUTHORITY_VERSION=SEGUBECA-CALCULATION-AUTHORITY-001.1
CANONICAL_AUTHORITY_FILE_CHANGED=NO
```

For non-SeguBeca candidates, the existing accepted quote bridge remains unchanged. For a SeguBeca candidate, the productive bridge exposed to Material 3 resolves preview calculation, calculation state, confirmation, and the review snapshot through the promoted authority.

The public entrypoint remains lightweight on unrelated routes. It dynamically loads the SeguBeca/PDF dependency graph only for the Cotizaciones route or after `forge:quotes-module-ready`.

```text
ENTRYPOINT_STATIC_PRODUCT_BINDING_IMPORT=NO
PRODUCT_BINDING_LOAD_MODE=DYNAMIC
PRODUCT_BINDING_LOAD_TRIGGER=QUOTES_ROUTE_OR_MODULE_READY
ACTIVITY_ROUTE_PDF_RUNTIME_LOAD=NO
REP_16E_ACTIVITY_ROUTE_ISOLATION=PASS
```

## PDF acceptance fixture

The browser acceptance creates a valid `%PDF-1.4` binary file at runtime. The file contains a sanitized Solución Online-shaped SeguBeca proposal surface and is uploaded through the real productive file input.

```text
PDF_INPUT=#fq-solution-online-pdf-105dr
PDF_BYTES=VALID_BINARY_GENERATED_AT_TEST_RUNTIME
PDFJS_OPEN=REQUIRED
BROWSER_PARSER=REQUIRED
JSON_PACKET_UPLOAD=NOT_USED
TEXT_ONLY_PARSER_SHORTCUT=NOT_USED
PDF_COMMITTED=NO
CLIENT_DATA_COMMITTED=NO
INSURER_ISSUED_CLIENT_DOCUMENT_CLAIMED=NO
```

This validates the PDF transport and extraction stack without retaining or pretending to use an insurer-issued customer document.

## Sanitized accepted facts

```text
PRODUCT_FAMILY=segubeca
CLIENT=Contratante Prueba
EDUCATION_BENEFICIARY=Menor Prueba
ANNUAL_PREMIUM=2524.19_UDI
PAYMENT_YEARS=14
TOTAL_CONTRIBUTED=35339_UDI
TOTAL_RECOVERY=30000_UDI
UDI_PROJECTION_RATE=0.045
CONTRIBUTION_SCHEDULE_YEARS=14
PROJECTION_GUARANTEED=NO
FLAT_TOTAL_CONVERSION_AUTHORIZED=NO
```

These values are regression evidence from the sanitized fixture, not universal product rates.

The productive binding applies the already accepted SeguBeca precedence before handing an immutable packet to the unchanged PR #153 authority. No actuarial or product formula is introduced.

```text
CONTRACTUAL_PRECEDENCE_AUTHORITY=calculateSegubecaAcceptedR14E
CONTRACTUAL_ALIGNMENT_LOCATION=PRODUCTIVE_UI_BINDING
GUARANTEED_TABLE_VALUE_WINS=YES
PRODUCT_FORMULA_REIMPLEMENTATION=NO
```

## Human confirmation boundary

The browser acceptance observes no accepted review snapshot before the explicit click on `confirm_quote`. After that click, the snapshot preserves the same SeguBeca authority and calculation.

```text
AUTOMATIC_QUOTE_ACCEPTANCE=NO
HUMAN_CONFIRMATION_REQUIRED=YES
QUOTE_MUTATION_ALLOWED=NO
CRM_MUTATION_ALLOWED=NO
AUTOMATIC_RECONFIRMATION=NO
AUTOMATIC_DOWNLOAD=NO
AUTOMATIC_PIPELINE_STAGE_ADVANCE=NO
AUTOMATIC_APPLICATION_CREATION=NO
AUTOMATIC_POLICY_CREATION=NO
```

The historical browser regression also verifies the governed confirmation message:

```text
Cotización confirmada y guardada durante esta sesión.
```

## Files changed

```text
.github/workflows/segubeca-productive-ui-real-pdf.yml
docs/architecture/source-truth/FORGE_SEGUBECA_PRODUCTIVE_UI_BINDING_001.md
docs/evidence/FORGE_SEGUBECA_PRODUCTIVE_UI_REAL_PDF_ACCEPTANCE_001.md
docs/static-preview/forge-alive-material3/index.html
docs/static-preview/forge-alive-material3/quotes-module.js
docs/static-preview/forge-alive-material3/segubeca-productive-ui-binding.js
docs/static-preview/forge-alive-material3/segubeca-productive-ui-entrypoint.js
tests/segubeca-browser-render-integration-test.mjs
tests/segubeca-material3-real-pdf-acceptance-test.mjs
```

## Implementation-head acceptance

```text
IMPLEMENTATION_HEAD_SHA=048a522a6dbb286db06948510ec93c73096d1b7b

SEGUBECA_PRODUCTIVE_WORKFLOW_RUN=30724186690
SEGUBECA_PRODUCTIVE_WORKFLOW_CONCLUSION=SUCCESS
REAL_PDF_BROWSER_ACCEPTANCE=SUCCESS
HISTORICAL_SEGUBECA_BROWSER_REGRESSION=SUCCESS
ROUTE_ISOLATION_BOUNDARY=SUCCESS
TARGETED_REP_17=SUCCESS

REP_16E_ACTIVITY_BROWSER_RUN=30724186686
REP_16E_ACTIVITY_BROWSER_CONCLUSION=SUCCESS

REP_17_RUN=30724186714
REP_17_CONCLUSION=SUCCESS

M05X_QUOTE_INTAKE_RUN=30724186687
M05X_QUOTE_INTAKE_CONCLUSION=SUCCESS

M05P_REAL_PDF_RUN=30724186699
M05P_REAL_PDF_CONCLUSION=SUCCESS

M05U_REAL_PDF_SMOKE_RUN=30724186732
M05U_REAL_PDF_SMOKE_CONCLUSION=SUCCESS

M05W_PRINTABLE_MODAL_RUN=30724186697
M05W_PRINTABLE_MODAL_CONCLUSION=SUCCESS

REPORTING_CORE_RUN=30724186706
REPORTING_CORE_CONCLUSION=SUCCESS
PIPELINE_MOBILE_RUN=30724186703
PIPELINE_MOBILE_CONCLUSION=SUCCESS
PIPELINE_REAL_INTERACTION_RUN=30724186695
PIPELINE_REAL_INTERACTION_CONCLUSION=SUCCESS
MANUAL_QUOTES_PIPELINE_RUN=30724186742
MANUAL_QUOTES_PIPELINE_CONCLUSION=SUCCESS
```

## Pull-request closure boundary

```text
FINAL_PR_HEAD_SHA=VERIFY_AFTER_THIS_EVIDENCE_COMMIT
UNRESOLVED_REVIEW_THREADS=VERIFY_AFTER_THIS_EVIDENCE_COMMIT
PENDING_REVIEWS=VERIFY_AFTER_THIS_EVIDENCE_COMMIT
PR_MERGEABLE=VERIFY_AFTER_THIS_EVIDENCE_COMMIT
MERGED=NO
MERGE_AUTHORIZATION=PENDING
POST_MERGE_PAGES_ACCEPTANCE=REQUIRED
PUBLIC_URL_VERIFIED=NO
```