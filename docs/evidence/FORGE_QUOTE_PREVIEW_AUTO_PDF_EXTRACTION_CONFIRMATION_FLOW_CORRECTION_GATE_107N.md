# Forge Quote Preview Auto PDF Extraction Confirmation Flow Correction Evidence 107N

PHASE=107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE
STATUS=PASS
DECISION=PASS_107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE
LOCKED_DECISION=AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_LOCKED_MANUAL_TRANSCRIPTION_DEPRECATED
NEXT=107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE

## Gate JSON

{
  "phase": "107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE",
  "status": "PASS",
  "decision": "PASS_107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE",
  "lockedDecision": "AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_LOCKED_MANUAL_TRANSCRIPTION_DEPRECATED",
  "correctionType": "route_correction",
  "supersedesPreviousNext": "107N_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_INPUT_RUN",
  "manualTranscriptionByUserDeprecated": true,
  "manualCaptureAllowedOnlyAsFallback": true,
  "primaryFlow": {
    "step1": "user_uploads_or_selects_quote_pdf",
    "step2": "forge_reads_pdf",
    "step3": "forge_extracts_confirmation_fields",
    "step4": "forge_shows_confirmation_modal",
    "step5_yes": "auto_fill_ui_with_extracted_fields",
    "step5_no": "open_editable_ui_with_extracted_fields_for_correction"
  },
  "confirmationModalContract": {
    "title": "¿Son correctos los datos?",
    "fields": [
      {
        "fieldKey": "client_name",
        "label": "Nombre",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "product_family",
        "label": "Familia",
        "allowedValues": [
          "Vida",
          "GMM"
        ],
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "product_name",
        "label": "Producto",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "insured_name",
        "label": "Asegurado",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "sum_insured",
        "label": "Suma Asegurada",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "annual_premium",
        "label": "Prima Anual",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "planned_or_ave_premium",
        "label": "Prima AVE / Prima Planeada",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      },
      {
        "fieldKey": "coverage_period",
        "label": "Periodo Cobertura",
        "source": "pdf_auto_extraction",
        "requiredForPopup": true
      }
    ],
    "yesButtonLabel": "Sí",
    "noButtonLabel": "No",
    "yesAction": "auto_populate_quote_preview_ui_after_user_confirmation",
    "noAction": "open_edit_mode_in_quote_preview_ui",
    "userShouldNotTranscribePdf": true,
    "userOnlyConfirmsOrEdits": true
  },
  "extractionContractForNextPhase": {
    "nextPhase": "107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE",
    "mustReadPdfAutomatically": true,
    "mustExtractFieldsAutomatically": true,
    "mustNotAskUserToTranscribePdf": true,
    "rawExtractedValuesCommitAllowed": false,
    "redactedExtractionReceiptCommitAllowed": true,
    "confidenceRequiredPerField": true,
    "missingOrAmbiguousFieldsGoToEditUi": true,
    "quoteTruthAllowed": false,
    "uiPopulationInThisPhase": false,
    "presentationGenerationAllowed": false
  },
  "rulesConfirmed": {
    "manualTranscriptionByUserDeprecated": true,
    "pdfAutoExtractionRequired": true,
    "confirmationModalRequired": true,
    "yesAutoFillsUiAfterConfirmation": true,
    "noOpensEditableUi": true,
    "manualCaptureFallbackOnly": true,
    "quoteTruthCreated": false,
    "uiChangedInThisPhase": false,
    "presentationGenerated": false,
    "backendConnectionUsed": false,
    "providerRuntimeUsed": false
  },
  "safetyFlags": {
    "crmWrite": false,
    "pipelineWrite": false,
    "policyWrite": false,
    "quoteWrite": false,
    "taskCreate": false,
    "calendarCreate": false,
    "messageSend": false,
    "authReal": false,
    "providerRuntime": false,
    "secretAccess": false,
    "browserPersistence": false,
    "realEngineExecution": false,
    "realEffectsAllowed": false,
    "realEffectsEnabled": false,
    "backendConnection": false,
    "pdfRead": false,
    "ocrExecution": false,
    "parserExecution": false,
    "calculatorExecution": false,
    "banxicoCall": false,
    "testExecution": false,
    "officialQuoteAllowed": false,
    "providerRuntimeAllowed": false,
    "calculatorExecutionAllowed": false,
    "parserExecutionAllowed": false,
    "backendConnectionAllowed": false,
    "quoteTruthAllowed": false,
    "presentationGenerationAllowed": false,
    "promptGenerationAllowed": false,
    "pdfSubmitAllowed": false,
    "printAutomation": false
  },
  "next": "107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE"
}

## Validation JSON

{
  "phase": "107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE",
  "status": "PASS",
  "decision": "PASS_107N_QUOTE_PREVIEW_AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_CORRECTION_GATE",
  "lockedDecision": "AUTO_PDF_EXTRACTION_CONFIRMATION_FLOW_LOCKED_MANUAL_TRANSCRIPTION_DEPRECATED",
  "manualTranscriptionByUserDeprecated": true,
  "manualCaptureAllowedOnlyAsFallback": true,
  "pdfAutoExtractionRequired": true,
  "confirmationModalRequired": true,
  "confirmationFieldCount": 8,
  "yesAutoFillsUiAfterConfirmation": true,
  "noOpensEditableUi": true,
  "rawExtractedValuesCommitAllowed": false,
  "redactedExtractionReceiptCommitAllowed": true,
  "quoteTruthAllowed": false,
  "uiChangedInThisPhase": false,
  "presentationGenerated": false,
  "backendConnectionUsed": false,
  "providerRuntimeUsed": false,
  "allSafetyFlagsFalse": true,
  "next": "107O_QUOTE_PREVIEW_AUTO_PDF_VALUE_EXTRACTION_LOCAL_RUN_GATE",
  "errors": []
}

## Confirmed

- Old manual transcription route is superseded.
- User should not transcribe PDF values.
- Forge must read the PDF.
- Forge must extract the required fields.
- User only confirms or edits.
- Quote truth is not created in this phase.
- UI is not changed in this phase.
