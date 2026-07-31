# Forge Quote Printable Document Ownership — QPD-01

Status: `QPD01_CANONICAL_READ_MODEL_IMPLEMENTED_PENDING_ACCEPTANCE`

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
- supports later A4 and Letter composition;
- performs no rendering, printing, PDF generation, persistence or external action.

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
```

## QPD program

```text
QPD-01 Canonical Quote Printable Read Model
QPD-02 A4 / Letter Commercial Document Composer
QPD-03 Real PDF Generation and Download
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

`QPD02_A4_LETTER_COMMERCIAL_DOCUMENT_COMPOSER`
