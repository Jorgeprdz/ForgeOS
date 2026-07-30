# Forge Quote Printable Document Roadmap — QPD-001

Status: ACTIVE / SOURCE-TRUTH LOCKED
Date: 2026-07-30

```text
PROGRAM=QUOTE_PRINTABLE_DOCUMENT
ACTIVE_BRANCH=feature/quote-printable-document
BASE_COMMIT=a060fde0b5b2f38e0912f54f47dc4f141c21e45c
CURRENT_PHASE=QPD_01_CANONICAL_PRINTABLE_QUOTE_READ_MODEL
PRESENTATIONS_BRANCH=feature/presentations-product-closure
PRESENTATIONS_STATUS=PAUSED_UNTIL_QPD_EXPORT_FOUNDATION_IS_STABLE
```

## Product decision

Forge requires two different client artifacts:

```text
QUOTE PRINTABLE DOCUMENT
= complete technical-commercial quote record

SALES PRESENTATION
= client-facing explanatory narrative
```

They may share rendering, branding, metadata, file naming, download and export-audit infrastructure.
They must not share document composition or silently transform one artifact into the other.

## Canonical authority

```text
QUOTE_TRUTH_OWNER=ACCEPTED_QUOTE_AND_EXISTING_QUOTE_CALCULATION_AUTHORITIES
PRODUCT_TRUTH_OWNER=PRODUCT_INTELLIGENCE
PRINTABLE_DOCUMENT_OWNER=ADVISOR_OS_QUOTE_DOCUMENT
PRESENTATION_OWNER=ADVISOR_OS_PRESENTATION
PIPELINE_ROLE=ENTRYPOINT_AND_REFERENCE_ONLY
```

The printable document may project confirmed data. It may not calculate premiums, projections, benefits, coverages, exchange rates, UDI values or product facts.

## Current baseline

The productive quote route already contains a browser print action and `@media print` rules.
That baseline is classified as:

```text
CURRENT_PRINT_MODE=LOCAL_BROWSER_PRINT_DIALOG_ONLY
INDEPENDENT_DOCUMENT_COMPOSER=NO
REAL_CONTROLLED_PDF=NO
DURABLE_DOCUMENT_SNAPSHOT=NO
VERSIONED_EXPORT=NO
PRODUCT_SPECIFIC_DOCUMENT_SECTIONS=NO
```

The existing browser print behavior remains available during construction but is not accepted as product closure.

## Program phases

### QPD-01 — Canonical Printable Quote Read Model

Status: ACTIVE

Build one deterministic, JSON-safe read model from an accepted quote and its authorized source models.

Required top-level sections:

```text
identity
client
advisor
quote
product
payment
protection
benefits
projections
sources
warnings
approval
export
```

Required behavior:

- preserve source paths for every projected fact;
- distinguish confirmed, projected, guaranteed, unavailable and warning values;
- preserve original currency and converted display values separately;
- preserve calculation date, quote date, product/version identity and evidence freshness;
- retain unknown as unknown;
- forbid silent zeroes, empty fallbacks and invented labels;
- produce a deterministic document identity and content revision;
- remain independent from HTML, CSS, PDF and PPTX rendering.

Required output contract:

```text
packetType=FORGE_PRINTABLE_QUOTE_READ_MODEL
contractVersion=QPD_01_V1
documentKind=QUOTE
renderReady=true|false
humanReviewRequired=true
quoteMutationAllowed=false
productMutationAllowed=false
calculationAllowed=false
sendAllowed=false
```

First acceptance gate:

```text
REAL_ACCEPTED_QUOTE_FIXTURE=PASS
COMPLETE_COMMERCIAL_FIELD_MATRIX=PASS
SOURCE_PATH_FOR_EVERY_FACT=PASS
UNKNOWN_NOT_ZERO=PASS
NO_RECALCULATION=PASS
NO_PRODUCT_INVENTION=PASS
DETERMINISTIC_IDENTITY=PASS
JSON_SAFE=PASS
```

### QPD-02 — A4 / Carta Commercial Document Composer

Status: PLANNED

Compose a dedicated printable document independent from the productive page DOM.

Required pages:

1. Cover and quote identity.
2. Commercial summary.
3. Protection, coverages and benefits.
4. Payment, contributions or premium detail.
5. Projections, recovery or scenarios when product-applicable.
6. Sources, warnings and legal/documentary notes.

Required formats:

```text
PAGE_SIZE=A4_AND_LETTER
ORIENTATION=PORTRAIT_DEFAULT
SCREEN_LAYOUT_AUTHORITY=NO
PRINT_LAYOUT_AUTHORITY=YES
```

### QPD-03 — Controlled PDF Generation and Download

Status: PLANNED

- generate a real PDF artifact rather than relying only on `window.print()`;
- bind the export to the exact read-model revision;
- include deterministic file naming;
- include document metadata and export receipt;
- revoke export authorization after material content change;
- keep automatic send disabled.

### QPD-04 — Product-Specific Quote Sections

Status: PLANNED

Create governed composers for currently supported product families without adding calculators:

```text
ORVI
IMAGINA_SER
VIDA_MUJER
SEGUBECA
GMM_ALFA_MEDICAL
```

Each composer owns section selection and presentation only. Product Intelligence remains the source authority.

### QPD-05 — Persistence, Versioning and Reopen

Status: PLANNED

- durable local-first document snapshots;
- governed remote persistence;
- immutable accepted revisions;
- append-only corrections;
- reopen from quote, Pipeline or document library;
- no raw uploaded PDF bytes inside the document read model.

### QPD-06 — Product Closure

Status: PLANNED

Required closure matrix:

```text
A4_ACCEPTANCE=PASS
LETTER_ACCEPTANCE=PASS
REAL_PDF_DOWNLOAD=PASS
PRINT_PREVIEW=PASS
PRODUCT_SPECIFIC_CONTENT=PASS
SOURCE_AND_WARNING_VISIBILITY=PASS
VERSION_REOPEN=PASS
EXPORT_REVOCATION_AFTER_CHANGE=PASS
MOBILE_TABLET_DESKTOP_ENTRYPOINT=PASS
NO_RECALCULATION=PASS
NO_INVENTED_FACTS=PASS
NO_AUTOMATIC_SEND=PASS
QUOTE_REGRESSION=NO
PIPELINE_REGRESSION=NO
PRESENTATION_REGRESSION=NO
```

## QPD-01 implementation boundary

Allowed:

- new Advisor OS quote-document contracts;
- deterministic read-model projection;
- focused fixtures and tests;
- documentation and evidence;
- read-only consumption of accepted quote, calculation and Product Intelligence models.

Forbidden in QPD-01:

- UI redesign;
- `@media print` modification;
- PDF generation;
- PPTX generation;
- Supabase migrations;
- browser persistence;
- Pipeline mutation;
- Accepted Quote mutation;
- Product Intelligence mutation;
- new financial calculations;
- provider calls;
- message sending;
- automatic approval.

## Initial target paths

```text
advisor-os/quote-document/printable-quote-read-model.js
advisor-os/quote-document/printable-quote-source-registry.js
advisor-os/quote-document/tests/printable-quote-read-model-master-test.js
docs/evidence/QPD_01_CANONICAL_PRINTABLE_QUOTE_READ_MODEL_ACCEPTANCE.md
```

## Next

```text
NEXT=QPD_01_CANONICAL_PRINTABLE_QUOTE_READ_MODEL_IMPLEMENTATION
```
