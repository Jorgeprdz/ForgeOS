# Forge Quote Preview Real PDF Text Layer Probe Dry Run Evidence 106H

PHASE=106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN
STATUS=PASS
DECISION=PASS_106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN
LOCKED_DECISION=TEXT_LAYER_PROBE_DRY_RUN_EXECUTED_WITH_NO_RAW_TEXT_COMMIT_NO_OCR_NO_PARSER
NEXT=106I_QUOTE_PREVIEW_TEXT_LAYER_RESULT_ROUTER

## Probe JSON

{
  "phase": "106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN",
  "status": "PASS",
  "decision": "PASS_106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN",
  "lockedDecision": "TEXT_LAYER_PROBE_DRY_RUN_EXECUTED_WITH_NO_RAW_TEXT_COMMIT_NO_OCR_NO_PARSER",
  "basePhase": "106G_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_GATE",
  "schemaVersion": "106C.1",
  "testUrl": "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/nueva-cotizacion/?v=105dr5",
  "localRunDirectoryOutsideRepo": "/storage/emulated/0/Forge Gemini/pdf-dry-run-local",
  "localManifestOutsideRepoRedacted": "[LOCAL_MANIFEST_PATH_OUTSIDE_REPO_REDACTED]",
  "localProbeOutsideRepoRedacted": "[LOCAL_PROBE_PATH_OUTSIDE_REPO_REDACTED]",
  "rawPdfReference": "[LOCAL_PDF_PATH_REDACTED_OUTSIDE_REPO]",
  "operatorTokenAccepted": "PROBE_TEXT_LAYER_ONLY",
  "probeMethodRedacted": "python_stdlib_pdf_stream_operator_probe",
  "localBinaryProbeExecuted": true,
  "textLayerProbeExecuted": true,
  "pdfHeaderCandidate": true,
  "encryptedCandidate": false,
  "pageCountCandidate": 2,
  "streamCountScanned": 3,
  "decompressedStreamCount": 3,
  "fontMarkerCount": 4,
  "textSignalScore": 235,
  "textLayerPresenceCandidate": "present_candidate",
  "ocrNeededCandidate": "no_candidate",
  "rawPdfCopiedToRepo": false,
  "rawPdfCommittedToRepo": false,
  "actualPdfPathCommittedToRepo": false,
  "rawPdfTextCommittedToRepo": false,
  "rawPageTextCommittedToRepo": false,
  "rawTextExtractedToFile": false,
  "fieldExtractionExecuted": false,
  "ocrExecuted": false,
  "parserExecuted": false,
  "calculatorExecuted": false,
  "quoteTruthCreated": false,
  "officialQuoteCreated": false,
  "uiPopulated": false,
  "presentationGenerated": false,
  "backendConnectionUsed": false,
  "crmWriteUsed": false,
  "humanReviewRequired": true,
  "resultInterpretation": {
    "present_candidate": "PDF appears to have selectable text markers. Next gate may scope redacted text sampling.",
    "absent_candidate": "PDF may not have selectable text markers. Next gate may scope OCR fallback separately.",
    "ambiguous_font_markers_only": "PDF has font/page markers but insufficient text operator evidence. Human review and next gate required.",
    "ambiguous_encrypted_candidate": "PDF may be encrypted. Human review and alternate path required."
  },
  "nextPhaseRouter": {
    "nextPhase": "106I_QUOTE_PREVIEW_TEXT_LAYER_RESULT_ROUTER",
    "ifPresentCandidate": "scope redacted text sampling gate",
    "ifAbsentCandidate": "scope OCR fallback gate separately",
    "ifAmbiguousCandidate": "scope manual review or alternate probe"
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
  "sourceUiChanged": false,
  "next": "106I_QUOTE_PREVIEW_TEXT_LAYER_RESULT_ROUTER"
}

## Validation JSON

{
  "phase": "106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN",
  "status": "PASS",
  "decision": "PASS_106H_QUOTE_PREVIEW_REAL_PDF_TEXT_LAYER_PROBE_DRY_RUN",
  "lockedDecision": "TEXT_LAYER_PROBE_DRY_RUN_EXECUTED_WITH_NO_RAW_TEXT_COMMIT_NO_OCR_NO_PARSER",
  "operatorTokenAccepted": true,
  "localBinaryProbeExecuted": true,
  "textLayerProbeExecuted": true,
  "textLayerPresenceCandidate": "present_candidate",
  "ocrNeededCandidate": "no_candidate",
  "pageCountCandidate": 2,
  "rawPdfCopiedToRepo": false,
  "rawPdfCommittedToRepo": false,
  "actualPdfPathCommittedToRepo": false,
  "rawPdfTextCommittedToRepo": false,
  "rawTextExtractedToFile": false,
  "fieldExtractionExecuted": false,
  "ocrExecuted": false,
  "parserExecuted": false,
  "calculatorExecuted": false,
  "quoteTruthCreated": false,
  "sourceUiChanged": false,
  "allSafetyFlagsFalse": true,
  "next": "106I_QUOTE_PREVIEW_TEXT_LAYER_RESULT_ROUTER",
  "errors": []
}

## Confirmed

- Operator token accepted.
- Local binary probe executed.
- Text layer probe executed.
- Text layer presence candidate recorded.
- Raw PDF was not committed.
- Actual PDF path was not committed.
- Raw PDF text was not committed.
- OCR was not executed.
- Parser was not executed.
- Field extraction was not executed.
- Quote truth was not created.
- Source UI was not changed.
