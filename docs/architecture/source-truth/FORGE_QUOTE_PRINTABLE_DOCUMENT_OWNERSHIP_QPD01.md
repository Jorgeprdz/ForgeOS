# Forge Quote Printable Document Ownership — QPD-01 / QPD-02

Status: `QPD01_AND_QPD02_IMPLEMENTED_AND_GITHUB_ACCEPTED`

Date: `2026-07-30`

## Product boundary

A printable quote and a sales presentation are different products that consume the same accepted quote authority.

```text
Accepted Quote Review Snapshot
├── Quote Printable Document
│   ├── technical-commercial record
│   ├── A4 / Letter
│   ├── full confirmed figures
│   ├── source, date and warnings
│   └── archive / print / PDF use
└── Sales Presentation
    ├── client-facing narrative
    ├── 16:9
    ├── selected facts
    ├── editable narrative
    └── presentation PDF / PPTX use
```

The printable quote must not become a slide deck. The presentation must not replace the detailed quote record.

## Authority

```text
QUOTE_TRUTH_OWNER=ACCEPTED_QUOTE_SOURCE
CALCULATION_TRUTH_OWNER=EXISTING_QUOTE_CALCULATION
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
PRINTABLE_DOCUMENT_COMPOSITION_OWNER=ADVISOR_OS_QUOTE_PRINTABLE_DOCUMENT
FINAL_AUTHORITY=HUMAN
```

Canonical input:

`ACCEPTED_QUOTE_AND_CALCULATION_REVIEW_SNAPSHOT`

Canonical QPD-01 runtime:

`advisor-os/quotes/printable/quote-printable-read-model.js`

Canonical QPD-02 runtime:

`advisor-os/quotes/printable/quote-printable-document-composer.js`

## QPD-01 contract

The canonical printable read model:

- consumes the immutable Accepted Quote Review Snapshot;
- projects accepted quote, existing calculation and Product Intelligence facts;
- records a source path and authority for every confirmed field;
- preserves missing facts as `UNAVAILABLE`;
- never converts unknown facts into zero;
- classifies calculated recovery, income and scenarios as `PROJECTION`;
- rejects raw PDF, binary and non-JSON values;
- is deeply immutable;
- creates a deterministic source revision identity;
- supports A4 and Letter composition;
- performs no rendering, printing, PDF generation, persistence or external action.

## QPD-02 contract

The commercial document composer:

- consumes only a `READY_FOR_DOCUMENT_COMPOSITION` QPD-01 read model;
- creates self-contained script-free HTML;
- supports independent A4 and Letter page contracts;
- renders a technical-commercial cover and quote sections;
- keeps projections visibly distinct from confirmed facts;
- renders source authority and source paths;
- escapes user-controlled content;
- creates a deterministic PDF filename candidate;
- makes no network request;
- does not call browser print;
- does not generate a PDF binary;
- performs no persistence, send, CRM or external action.

## Explicit prohibitions

```text
NEW_CALCULATION_ENGINE=FORBIDDEN
PRODUCT_RECALCULATION=FORBIDDEN
PRODUCT_TRUTH_MUTATION=FORBIDDEN
QUOTE_TRUTH_MUTATION=FORBIDDEN
RAW_PDF_STORAGE=FORBIDDEN
AUTOMATIC_SEND=FORBIDDEN
CRM_MUTATION=FORBIDDEN
POLICY_MUTATION=FORBIDDEN
TASK_CREATION=FORBIDDEN
CALENDAR_CREATION=FORBIDDEN
MISSING_VALUE_AS_ZERO=FORBIDDEN
PROJECTION_AS_GUARANTEE=FORBIDDEN
SCRIPT_IN_PRINTABLE_DOCUMENT=FORBIDDEN
NETWORK_DEPENDENCY_IN_PRINTABLE_DOCUMENT=FORBIDDEN
```

## Accepted gates

```text
QPD01_CONTRACT=PASS_12_OF_12
QPD02_CONTRACT=PASS_12_OF_12
NODE_SYNTAX=PASS
DIFF_INTEGRITY=PASS
GITHUB_ACTIONS_RUN=30593195810
```

## QPD program

```text
QPD-01 Canonical Quote Printable Read Model — PASS
QPD-02 A4 / Letter Commercial Document Composer — PASS
QPD-03 Real PDF Generation and Download — NEXT
QPD-04 Product-Specific Quote Sections
QPD-05 Persistence, Versioning and Reopen
QPD-06 Print/PDF Browser Acceptance and Product Closure
```

## Relationship with Presentations

`feature/presentations-product-closure` remains paused while QPD establishes the shared document-export foundation.

Only generic export infrastructure may later be shared:

- branding primitives;
- file naming;
- metadata;
- controlled download;
- export audit;
- page-size configuration.

The quote document composer and the presentation slide composer remain separate authorities.

## Next

`QPD03_REAL_PDF_GENERATION_AND_DOWNLOAD`
