# Forge Quote Preview Extraction Schema Lock 106C

PHASE=106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK
STATUS=PASS
DECISION=PASS_106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK
LOCKED_DECISION=PDF_EXTRACTION_SCHEMA_LOCKED_FOR_REDACTED_DRY_RUN_CANDIDATES_ONLY
NEXT=106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT

## Purpose

106C locks the extraction schema for future redacted dry-run candidates from Solución Online PDF quotes.

This phase does not read PDFs, execute parsers, run OCR, calculate values, submit PDFs, populate the UI, create quote truth, or generate sales presentations.

## Schema Version

SCHEMA_VERSION=106C.1

## Candidate Record Contract

Each future extraction candidate must use this structure:

- fieldKey
- displayLabel
- targetUiSection
- candidateValueRedacted
- candidateValueRawLocalOnly
- sourceLocationHintRedacted
- status
- confidence
- needsHumanReview
- mayPopulateUi
- mayCreateQuoteTruth
- notes

Raw candidate values are local-only and must never be committed to the repo.

## Locked Status Values

- not_attempted
- found_redacted_candidate
- not_found_in_pdf
- ambiguous_needs_review
- manual_input_required
- blocked_until_parser_gate
- blocked_until_human_review

## Locked Confidence Values

- none
- low
- medium
- high
- human_verified

## Locked Quote Summary Fields

- Plan, suma asegurada y prima
- Forma de pago, moneda y vigencia
- Total aportado
- Total recuperación
- Valores, beneficios o escenarios relevantes
- Faltantes antes de presentar

## Redaction Classes

- client_identity
- quote_identifier
- financial_value
- date_or_validity
- product_label
- source_location_hint
- free_text

## Population Rules

- Candidates may populate only redacted dry-run reports.
- Candidates may not automatically populate the static preview.
- Candidates may not create quote truth.
- Candidates may not create official quote truth.
- Human review is required before any future UI use.
- Missing values remain pending.
- Ambiguous values must not be chosen automatically.
- Financial values require redacted source-location hints.

## Gates That Remain Closed

- PDF submit
- PDF read
- OCR execution
- Parser execution
- Calculator execution
- Quote truth
- Official quote
- Backend connection
- CRM write
- Prompt generation
- Presentation generation
- Real effects

## Next

NEXT=106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT
