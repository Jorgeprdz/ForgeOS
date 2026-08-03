# Advisor OS 1.0 — Sprint 06: Bulk Intake and Books

```text
SPRINT=06_BULK_INTAKE_AND_BOOKS
EXECUTION_MODE=ONE_PASS
STATUS=CANDIDATE
```

## Delivered

- governed book and membership runtime;
- idempotent `Proyecto 200` resolution;
- many-to-many memberships without person duplication;
- atomic move contract;
- CSV parser with quoted-field handling;
- safe workbook adapter for XLSX decoders;
- structural Plan 200 detection;
- minimal basic-field mapping;
- extra-column context projection;
- phone, email and external-ID strong duplicate reconciliation;
- no silent overwrite;
- import batches and result receipt;
- Plan 200 destination auto-resolution and auto-open receipt;
- Pipeline activation handoff that fails closed without its canonical authority;
- two-action Books UI model;
- newest-first default and compact sorting vocabulary;
- multi-select contextual actions;
- mobile safe-area requirement.

## Authority model

```text
FILE_DECODER
→ BULK_IMPORT_ENGINE
→ PERSON_AUTHORITY
→ BOOK_REPOSITORY
→ MEMBERSHIP
→ CONTEXT_EVENT
→ IMPORT_BATCH_RECEIPT
```

The sprint does not create a second CommercialPerson store. Persistence is delegated to injected repositories and existing person/Pipeline authorities.

## XLSX boundary

The domain does not execute binary workbooks, macros or formulas. It accepts a safe workbook decoder exposing only:

```text
sheetNames
readSheet(name) → primitive cell rows
```

This keeps SheetJS, ExcelJS or another future decoder outside the business authority while preserving the XLSX import contract.

## Locks

```text
SECOND_PERSON_STORE=0
PERSON_DUPLICATION=0
DIRECT_DATABASE_WRITE=0
MACRO_EXECUTION=0
FORMULA_EXECUTION=0
SILENT_FIELD_OVERWRITE=0
BOOK_MEMBERSHIP_MANY_TO_MANY=YES
DEFAULT_SORT=CREATED_AT_DESC
PERMANENT_ACTIONS=2
P200_DESTINATION=PROYECTO_200
P200_AUTO_CREATE=YES
P200_AUTO_OPEN=YES
EXTRA_COLUMNS=CONTEXT_EVENT
```

## Honest boundary

The core import and book contracts are productive and repository-agnostic. A concrete browser file decoder and database repository adapter remain deployment dependencies; operations fail closed when those authorities are absent. The sprint does not claim that arbitrary XLSX binary bytes are decoded by the domain itself.

## Candidate gate

```text
CSV_PARSER=PASS_CANDIDATE
SAFE_XLSX_WORKBOOK_CONTRACT=PASS_CANDIDATE
P200_DETECTION=PASS_CANDIDATE
BOOKS_RUNTIME=PASS_CANDIDATE
MEMBERSHIP_IDEMPOTENCY=PASS_CANDIDATE
DUPLICATE_RECONCILIATION=PASS_CANDIDATE
CONTEXT_PROJECTION=PASS_CANDIDATE
UI_MODEL=PASS_CANDIDATE
PIPELINE_HANDOFF_FAIL_CLOSED=PASS_CANDIDATE
MERGE_AUTHORIZATION=NOT_GRANTED
```
