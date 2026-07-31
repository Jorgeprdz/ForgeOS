# QPD-03 Real PDF Generation and Download

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Branch: `feature/quote-printable-document-closure`

GitHub Actions run: `30593830272`

## Runtime

- `advisor-os/quotes/printable/quote-printable-pdf-generator.js`
- `advisor-os/quotes/tests/quote-printable-pdf-generator-master-test.js`

## Accepted behavior

- Generates real PDF 1.4 bytes.
- Supports A4 and Letter page geometry.
- Produces a technical-commercial cover and multipage body.
- Preserves quote, calculation and Product Intelligence source ownership.
- Marks projections distinctly.
- Includes source authority and source-path references.
- Includes title, advisor, product and revision metadata.
- Returns defensive byte copies.
- Creates an `application/pdf` Blob.
- Requires explicit human action before download.
- Uses a local Blob URL and revokes it after dispatch.
- Does not call `window.print()`.
- Does not use a network or remote PDF provider.
- Does not embed JavaScript, OpenAction, Launch or URI actions.

## Contract acceptance

```text
QPD03_CONTRACT=PASS_14_OF_14
PDF_HEADER=PASS
PDF_EOF=PASS
A4_MEDIABOX=PASS
LETTER_MEDIABOX=PASS
MULTIPAGE=PASS
DETERMINISTIC_BYTES=PASS
SOURCE_REVISION_BINDING=PASS
DEFENSIVE_BYTE_COPIES=PASS
APPLICATION_PDF_BLOB=PASS
HUMAN_DOWNLOAD_GATE=PASS
LOCAL_BLOB_URL_DOWNLOAD=PASS
URL_REVOCATION=PASS
FORBIDDEN_PDF_ACTIONS=ABSENT
DEFAULT_FALSE_EFFECTS=PASS
```

## Full workflow acceptance

```text
NODE_SYNTAX=PASS
QPD01=PASS_12_OF_12
QPD02=PASS_12_OF_12
QPD03=PASS_14_OF_14
DIFF_INTEGRITY=PASS
WORKFLOW_CONCLUSION=SUCCESS
```

## Local renderer verification

A synthetic test-safe quote produced a five-page A4 PDF. It was inspected structurally and rendered at 120 DPI.

```text
PDF_VERSION=1.4
PAGES=5
PAGE_SIZE_POINTS=595_X_842
ENCRYPTED=false
ANNOTATIONS=0
ATTACHMENTS=0
FORM_FIELDS=0
FONTS=HELVETICA_AND_HELVETICA_BOLD_WINANSI
RENDERED_PAGES=5
CLIPPING=NO
OVERLAP=NO
BROKEN_GLYPHS=NO
```

The first local render exposed spacing debt between the warning block and the first section heading. The warning height contract was corrected and the PDF was regenerated and re-rendered. The accepted render has no overlap.

## Safety

```text
SCRIPTS_ALLOWED=false
NETWORK_ALLOWED=false
RECALCULATION_ALLOWED=false
AUTOMATIC_DOWNLOAD_ALLOWED=false
PRINT_EXECUTED=false
PERSISTENCE_WRITTEN=false
AUTOMATIC_SEND_ALLOWED=false
HUMAN_REVIEW_REQUIRED=true
```

## Not yet connected

- Productive quote route.
- Download CTA in the quote UI.
- Saved PDF/version history.
- Product-specific section overrides.

## Next

`QPD04_PRODUCT_SPECIFIC_QUOTE_SECTIONS`
