# R16J2A GitHub Pages Presentation Bridge Hotfix

Date: 2026-07-16

## Root cause

```text
ROOT_CAUSE=PATH_OUTSIDE_PAGES_ARTIFACT+TRANSITIVE_IMPORT_404+DEPLOYMENT_ARTIFACT_INCOMPLETE
PAGES_PUBLISHING_SOURCE=.github/workflows/pages.yml generated _site from docs/
FAILED_MODULE=/static-preview/quote-preview-live/forge-accepted-quote-bridge.js
FAILED_MODULE_HTTP_STATUS=200
FAILED_MODULE_CONTENT_TYPE=application/javascript
FAILED_TRANSITIVE_DEPENDENCY=/advisor-os/presentation/browser/forge-sales-presentation-browser-context-adapter.js
FAILED_TRANSITIVE_HTTP_STATUS=404
FAILED_TRANSITIVE_CONTENT_TYPE=text/html
```

The public bridge was present and served as JavaScript, but its eight Advisor OS
imports addressed repository paths excluded by the Pages artifact builder.
Browser module evaluation therefore failed before the PDF extractor flow could
be prepared.

## Distribution correction

Canonical writable source remains:

`advisor-os/presentation/browser/`

The generator:

`scripts/build-advisor-presentation-pages-runtime.mjs`

creates the read-only Pages distribution:

`docs/static-preview/advisor-presentation-runtime/`

The Pages workflow executes the generator before assembling `_site`. The public
Accepted Quote bridge and its compatibility re-exports import only the generated
published boundary. No presentation business logic was moved back to Manager
OS and no second writable authority was introduced.

## Cache and diagnostics

Public presentation, quote loader and PDF extractor assets use:

`r16j2a-pages-runtime-hotfix-20260716-1`

Module scripts are loaded through dynamic `import()` so evaluation errors retain
the requested URL, error name, evaluation message, current page URL and runtime
version in `globalThis.__FORGE_QUOTE_RUNTIME_LOAD_ERROR__` and the console.

## Pre-correction production evidence

Evidence root:

`/storage/emulated/0/Download/R16J2A_PAGES_HOTFIX_EVIDENCE/`

- `R16J2A_PAGES_BRIDGE_TRANSITIVE_IMPORT_FAIL_BEFORE_1440x900.png`
- `R16J2A_BEFORE_NETWORK.json`

## Local Pages-boundary verification

A server rooted at `docs/` passed the complete synthetic real-PDF flow:

- Forge Alive Nueva Cotización route loaded.
- Accepted Quote bridge evaluated.
- All generated Advisor OS presentation modules loaded.
- A real PDF generated from the test-safe ORVI fixture was extracted by PDF.js.
- Quote review rendered and was accepted.
- Presentation CTA was visible.
- Advisor OS editor opened with the review context.
- 43 relevant module requests returned JavaScript successfully.
- Page errors, network failures and console errors were zero.

## Production acceptance

GitHub Pages workflow:

`https://github.com/Jorgeprdz/ForgeOS/actions/runs/29535015369`

Hotfix commit:

`789d647b627464a76f4babbc9a7e028b34b92298`

The real public Forge Alive URL passed with a hard R16J2A cache identifier.
A real PDF generated from the test-safe ORVI fixture was processed by the
deployed PDF.js runtime. Quote review, human acceptance, the presentation CTA
and the Advisor OS editor all passed.

The production request log captured 43 relevant JavaScript module responses.
All returned HTTP 200 with a JavaScript MIME type. Console errors, page errors
and network failures were zero.

Production evidence:

- `R16J2A_PAGES_ACCEPTED_QUOTE_CTA_PASS_AFTER_1440x900.png`
- `R16J2A_PAGES_PRESENTATION_EDITOR_PASS_AFTER_1440x900.png`
- `R16J2A_PAGES_NETWORK_AND_CONSOLE_ZERO_ERRORS_PASS_AFTER_1440x900.png`
- `R16J2A_AFTER_NETWORK.json`
- `R16J2A_PRE_CORRECTION_HTTP_DIAGNOSIS.md`

```text
REAL_PAGES_URL_TESTED=YES
ACCEPTED_QUOTE_BRIDGE_HTTP_200=YES
ACCEPTED_QUOTE_BRIDGE_MIME_VALID=YES
ALL_TRANSITIVE_IMPORTS_HTTP_200=YES
ALL_TRANSITIVE_IMPORTS_MIME_VALID=YES
MODULE_EVALUATION_PASS=YES
PDF_EXTRACTOR_PREPARED=YES
PDF_EXTRACTION_PASS=YES
QUOTE_REVIEW_PASS=YES
ACCEPTED_QUOTE_PASS=YES
PRESENTATION_CTA_VISIBLE=YES
PRESENTATION_EDITOR_PASS=YES
CONSOLE_ERRORS=0
NETWORK_FAILURES=0
PAGES_DEPLOYMENT_VERIFIED=YES
REAL_PDF_FLOW_VERIFIED=YES
```

Regression:

```text
QUOTE_REGRESSION=NO
ACCEPTED_QUOTE_REGRESSION=NO
PIPELINE_REGRESSION=NO
PRODUCT_INTELLIGENCE_REGRESSION=NO
PRESENTATION_REGRESSION=NO
PDF_EXPORT_REGRESSION=NO
NAVIGATION_REGRESSION=NO
ORB_REGRESSION=NO
```

## Authority gates

```text
PRESENTATION_EXECUTION_DOMAIN=ADVISOR_OS
PRESENTATION_CONTEXT_AUTHORITY=ADVISOR_OS
PRESENTATION_PROMPT_AUTHORITY=ADVISOR_OS
PRESENTATION_EDITOR_AUTHORITY=ADVISOR_OS
MANAGER_OS_PRESENTATION_WRITE_AUTHORITY=NO
DUPLICATE_WRITABLE_AUTHORITY=NO
```
