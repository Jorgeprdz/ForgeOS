# Forge Quote Preview Auto PDF Extraction Confirmation Flow Correction Gate 107N

PHASE=107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE
STATUS=PASS
DECISION=PASS_107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE
LOCKED_DECISION=AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_LOCKED_MANUAL_TRANSCRIPTION_DEPRECATED
NEXT=107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE

## En humano

The user should not transcribe values already present in the PDF.

Forge must read the PDF, extract values automatically, and show a confirmation modal.

If the user confirms, Forge fills the Quote Preview UI.

If the user rejects, Forge opens the extracted fields in editable UI.

Manual capture is only a fallback for missing or ambiguous values.

## Required Confirmation Modal

Title:

`¿Son correctos los datos?`

Fields:

- Nombre
- Familia: Vida / GMM
- Producto
- Asegurado
- Suma Asegurada
- Prima Anual
- Prima AVE / Prima Planeada
- Periodo Cobertura

Actions:

- Sí: auto-fill UI with extracted values after confirmation.
- No: open editable UI with extracted values.

## Locked Correction

MANUAL_TRANSCRIPTION_BY_USER_DEPRECATED=true

PDF_AUTO_EXTRACTION_REQUIRED=true

CONFIRMATION_MODAL_REQUIRED=true

CONFIRMATION_FIELD_COUNT=8

QUOTE_TRUTH_ALLOWED=false

UI_CHANGED_IN_THIS_PHASE=false

PRESENTATION_GENERATED=false

## Next

NEXT=107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE
