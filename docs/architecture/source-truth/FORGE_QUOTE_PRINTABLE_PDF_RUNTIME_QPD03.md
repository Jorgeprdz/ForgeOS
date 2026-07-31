# Forge Quote Printable PDF Runtime — QPD-03

Status: `PASS / IMPLEMENTED / GITHUB_ACCEPTED`

Date: `2026-07-30`

## Purpose

QPD-03 converts the accepted quote printable document into real PDF bytes and exposes a separately gated, human-initiated browser download.

It does not use `window.print()`, a print dialog, a network service, a remote renderer or a second calculation engine.

## Canonical chain

```text
ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT
→ FORGE_QUOTE_PRINTABLE_READ_MODEL
→ FORGE_QUOTE_PRINTABLE_DOCUMENT_HTML
→ FORGE_QUOTE_PRINTABLE_PDF
→ explicit human download action
```

## Runtime authority

```text
PDF_BINARY_GENERATION_OWNER=ADVISOR_OS_QUOTE_PRINTABLE_DOCUMENT
QUOTE_TRUTH_OWNER=ACCEPTED_QUOTE_SOURCE
CALCULATION_TRUTH_OWNER=EXISTING_QUOTE_CALCULATION
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
DOWNLOAD_AUTHORITY=IDENTIFIED_HUMAN_ACTION
AUTOMATIC_DOWNLOAD=FORBIDDEN
```

Canonical runtime:

`advisor-os/quotes/printable/quote-printable-pdf-generator.js`

Canonical contract test:

`advisor-os/quotes/tests/quote-printable-pdf-generator-master-test.js`

## Output contract

```text
PACKET_TYPE=FORGE_QUOTE_PRINTABLE_PDF
CONTRACT_VERSION=QPD03_REAL_PDF_V1
STATUS=PDF_BINARY_READY
MEDIA_TYPE=application/pdf
PAGE_FORMAT=A4_OR_LETTER
SOURCE_REVISION_REQUIRED=YES
```

The packet exposes PDF bytes only through defensive copies and can produce an `application/pdf` Blob. The original internal byte buffer is not mutable by consumers.

## PDF structure

- PDF 1.4 header and valid EOF marker;
- deterministic cross-reference table;
- A4 and Letter MediaBox support;
- technical-commercial cover;
- multipage quote sections;
- explicit projection styling and warnings;
- source authority and source-path appendix;
- disclaimers and page numbering;
- document metadata for title, advisor, product and source revision;
- WinAnsi-safe Spanish text normalization;
- no JavaScript, OpenAction, Launch or URI actions.

## Download boundary

`downloadQuotePrintablePdf` requires:

```text
USER_INITIATED=true
PDF_STATUS=PDF_BINARY_READY
BROWSER_BLOB_RUNTIME=AVAILABLE
```

The adapter creates a local Blob URL, dispatches one download click and revokes the URL immediately afterward.

It performs no upload, network request, send, CRM mutation, Pipeline mutation, policy mutation, task creation, calendar creation or print invocation.

## Explicit locks

```text
WINDOW_PRINT_USED=false
PRINT_DIALOG_USED=false
REMOTE_PDF_SERVICE_USED=false
NETWORK_ALLOWED=false
PDF_JAVASCRIPT_ALLOWED=false
OPEN_ACTION_ALLOWED=false
URI_ACTION_ALLOWED=false
RECALCULATION_ALLOWED=false
PRODUCT_MUTATION_ALLOWED=false
QUOTE_MUTATION_ALLOWED=false
AUTOMATIC_DOWNLOAD_ALLOWED=false
AUTOMATIC_SEND_ALLOWED=false
PERSISTENCE_WRITTEN=false
HUMAN_REVIEW_REQUIRED=true
```

## Acceptance

```text
NODE_SYNTAX=PASS
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
QPD03_CONTRACT=PASS_14_OF_14
DIFF_INTEGRITY=PASS
GITHUB_ACTIONS_RUN=30593830272
WORKFLOW_CONCLUSION=SUCCESS
```

A representative synthetic A4 PDF was also inspected locally:

```text
PDF_VERSION=1.4
PAGE_COUNT=5
PAGE_SIZE=595_X_842_POINTS
ENCRYPTED=false
ANNOTATIONS=0
ATTACHMENTS=0
FORM_FIELDS=0
RENDER_ACCEPTANCE=PASS_5_OF_5_PAGES
CLIPPED_TEXT=NO
OVERLAP=NO
BROKEN_GLYPHS=NO
```

The local sample is validation evidence only and is not a production client artifact.

## Not included

- productive route binding;
- quote screen CTA;
- persistence or version history;
- product-specific section composition;
- automatic sharing or sending;
- Presentation runtime changes.

## Next

`QPD04_PRODUCT_SPECIFIC_QUOTE_SECTIONS`
