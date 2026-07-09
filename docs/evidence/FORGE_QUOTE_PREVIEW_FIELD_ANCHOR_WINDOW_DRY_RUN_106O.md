# Forge Quote Preview Field Anchor Window Dry Run Evidence 106O

PHASE=106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN
STATUS=PASS
DECISION=PASS_106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN
LOCKED_DECISION=FIELD_ANCHOR_WINDOW_DRY_RUN_COMPLETE_WITH_REDACTED_CONTEXT_ONLY_NO_VALUES
NEXT=106P_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_GATE

## Window JSON

{
  "phase": "106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN",
  "status": "PASS",
  "decision": "PASS_106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN",
  "lockedDecision": "FIELD_ANCHOR_WINDOW_DRY_RUN_COMPLETE_WITH_REDACTED_CONTEXT_ONLY_NO_VALUES",
  "basePhase": "106N_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_GATE",
  "schemaVersion": "106C.1",
  "testUrl": "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/nueva-cotizacion/?v=105dr5",
  "operatorTokenAccepted": "SCOPE_FIELD_ANCHOR_WINDOWS_ONLY",
  "windowType": "redacted_anchor_context_windows_only",
  "sourceUiChanged": false,
  "sourcePolicy": {
    "usedCommittedRedactedSamplesOnly": true,
    "usedCommittedLabelMapOnly": true,
    "rawPdfAccessed": false,
    "rawTextAccessed": false,
    "actualPdfPathAccessed": false,
    "actualPdfPathCommitted": false
  },
  "inputSummary": {
    "sampleCount": 6,
    "redactedSampleCountUsed": 6,
    "targetRuleCount": 6,
    "criticalTargetCount": 6
  },
  "anchorWindowRecords": [
    {
      "targetField": "plan_sum_insured_and_premium",
      "targetDisplayLabel": "Plan, suma asegurada y prima",
      "anchorLabel": "ASEGURADA",
      "sourceRedactedSampleIndex": 4,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [TEXT_REDACTED] [TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [SAFE_LABEL:SUMA] [SAFE_LABEL:ASEGURADA] [SAFE_LABEL:PRIMA] [SA...",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "plan_sum_insured_and_premium",
      "targetDisplayLabel": "Plan, suma asegurada y prima",
      "anchorLabel": "PRIMA",
      "sourceRedactedSampleIndex": 4,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [TEXT_REDACTED] [TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [SAFE_LABEL:SUMA] [SAFE_LABEL:ASEGURADA] [SAFE_LABEL:PRIMA] [SA...",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "plan_sum_insured_and_premium",
      "targetDisplayLabel": "Plan, suma asegurada y prima",
      "anchorLabel": "SUMA",
      "sourceRedactedSampleIndex": 4,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [TEXT_REDACTED] [TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [SAFE_LABEL:SUMA] [SAFE_LABEL:ASEGURADA] [SAFE_LABEL:PRIMA] [SA...",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "plan_sum_insured_and_premium",
      "targetDisplayLabel": "Plan, suma asegurada y prima",
      "anchorLabel": "PRIMA",
      "sourceRedactedSampleIndex": 5,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[SAFE_LABEL:PRIMA] [SAFE_LABEL:TOTAL] [SAFE_LABEL:ANUAL] [AMOUNT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "payment_form_currency_and_validity",
      "targetDisplayLabel": "Forma de pago, moneda y vigencia",
      "anchorLabel": "MONEDA",
      "sourceRedactedSampleIndex": 3,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [TEXT_REDACTED] [TEXT_REDACTED] : [SAFE_LABEL:PAGO] [TEXT_REDACTED] [SAFE_LABEL:MONEDA] : [TEXT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "payment_form_currency_and_validity",
      "targetDisplayLabel": "Forma de pago, moneda y vigencia",
      "anchorLabel": "PAGO",
      "sourceRedactedSampleIndex": 3,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [TEXT_REDACTED] [TEXT_REDACTED] : [SAFE_LABEL:PAGO] [TEXT_REDACTED] [SAFE_LABEL:MONEDA] : [TEXT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "payment_form_currency_and_validity",
      "targetDisplayLabel": "Forma de pago, moneda y vigencia",
      "anchorLabel": "ANUAL",
      "sourceRedactedSampleIndex": 4,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [TEXT_REDACTED] [TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [SAFE_LABEL:SUMA] [SAFE_LABEL:ASEGURADA] [SAFE_LABEL:PRIMA] [SA...",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "payment_form_currency_and_validity",
      "targetDisplayLabel": "Forma de pago, moneda y vigencia",
      "anchorLabel": "ANUAL",
      "sourceRedactedSampleIndex": 5,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[SAFE_LABEL:PRIMA] [SAFE_LABEL:TOTAL] [SAFE_LABEL:ANUAL] [AMOUNT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "total_aportado",
      "targetDisplayLabel": "Total aportado",
      "anchorLabel": "TOTAL",
      "sourceRedactedSampleIndex": 5,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[SAFE_LABEL:PRIMA] [SAFE_LABEL:TOTAL] [SAFE_LABEL:ANUAL] [AMOUNT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "total_recuperacion",
      "targetDisplayLabel": "Total recuperación",
      "anchorLabel": "TOTAL",
      "sourceRedactedSampleIndex": 5,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[SAFE_LABEL:PRIMA] [SAFE_LABEL:TOTAL] [SAFE_LABEL:ANUAL] [AMOUNT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 3,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "values_benefits_or_scenarios_relevant_to_plan",
      "targetDisplayLabel": "Valores, beneficios o escenarios relevantes",
      "anchorLabel": "COBERTURA",
      "sourceRedactedSampleIndex": 4,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [TEXT_REDACTED] [TEXT_REDACTED] [SAFE_LABEL:COBERTURA] [SAFE_LABEL:SUMA] [SAFE_LABEL:ASEGURADA] [SAFE_LABEL:PRIMA] [SA...",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 4,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "missing_items_before_presentation",
      "targetDisplayLabel": "Faltantes antes de presentar",
      "anchorLabel": "EDAD",
      "sourceRedactedSampleIndex": 1,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] [TEXT_REDACTED] [TEXT_REDACTED] : [DATE_REDACTED] [SAFE_LABEL:EDAD] : [NUMBER_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 2,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    },
    {
      "targetField": "missing_items_before_presentation",
      "targetDisplayLabel": "Faltantes antes de presentar",
      "anchorLabel": "FUMADOR",
      "sourceRedactedSampleIndex": 2,
      "redactedContextWindow": [
        {
          "relativeLine": 0,
          "redactedLine": "[TEXT_REDACTED] : [TEXT_REDACTED] [SAFE_LABEL:FUMADOR] : [TEXT_REDACTED]",
          "lineSource": "committed_redacted_sample_only"
        }
      ],
      "windowBeforeLinesRequested": 1,
      "windowAfterLinesRequested": 2,
      "windowMaterializedFromCommittedSamplesOnly": true,
      "contextOnlyNotValue": true,
      "labelsAreHintsNotTruth": true,
      "valueExtractionExecuted": false,
      "fieldCandidateExtractionExecuted": false,
      "rawValueExtractionExecuted": false,
      "parserExecutionExecuted": false,
      "ocrExecutionExecuted": false,
      "calculatorExecutionExecuted": false,
      "quoteTruthCreated": false,
      "uiPopulationExecuted": false,
      "humanReviewRequired": true,
      "notes": "Anchor window uses only redacted sample context. No raw text, no raw PDF, no value extraction."
    }
  ],
  "targetAnchorCoverageReport": [
    {
      "targetField": "plan_sum_insured_and_premium",
      "targetDisplayLabel": "Plan, suma asegurada y prima",
      "anchorRecordCount": 4,
      "anchorLabelsMaterialized": [
        "ASEGURADA",
        "PRIMA",
        "SUMA"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    },
    {
      "targetField": "payment_form_currency_and_validity",
      "targetDisplayLabel": "Forma de pago, moneda y vigencia",
      "anchorRecordCount": 4,
      "anchorLabelsMaterialized": [
        "ANUAL",
        "MONEDA",
        "PAGO"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    },
    {
      "targetField": "total_aportado",
      "targetDisplayLabel": "Total aportado",
      "anchorRecordCount": 1,
      "anchorLabelsMaterialized": [
        "TOTAL"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    },
    {
      "targetField": "total_recuperacion",
      "targetDisplayLabel": "Total recuperación",
      "anchorRecordCount": 1,
      "anchorLabelsMaterialized": [
        "TOTAL"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    },
    {
      "targetField": "values_benefits_or_scenarios_relevant_to_plan",
      "targetDisplayLabel": "Valores, beneficios o escenarios relevantes",
      "anchorRecordCount": 1,
      "anchorLabelsMaterialized": [
        "COBERTURA"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    },
    {
      "targetField": "missing_items_before_presentation",
      "targetDisplayLabel": "Faltantes antes de presentar",
      "anchorRecordCount": 2,
      "anchorLabelsMaterialized": [
        "EDAD",
        "FUMADOR"
      ],
      "coverageStatus": "redacted_anchor_windows_created",
      "humanReviewRequired": true,
      "valueExtractionExecuted": false
    }
  ],
  "missingAnchorWindows": [],
  "rulesConfirmed": {
    "anchorWindowsAreContextNotValues": true,
    "labelsAreHintsNotTruth": true,
    "humanReviewRequired": true,
    "rawPdfAccessed": false,
    "rawTextAccessed": false,
    "rawTextCommitted": false,
    "actualPdfPathCommitted": false,
    "valueExtractionExecuted": false,
    "fieldCandidateExtractionExecuted": false,
    "rawValueExtractionExecuted": false,
    "parserExecutionExecuted": false,
    "ocrExecutionExecuted": false,
    "calculatorExecutionExecuted": false,
    "quoteTruthCreated": false,
    "uiPopulationExecuted": false,
    "autoSelectionAllowed": false
  },
  "nextGate": {
    "nextPhase": "106P_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_GATE",
    "purpose": "Define whether and how redacted anchor windows may be used for candidate extraction in a future phase.",
    "operatorTokenRequired": "SCOPE_FIELD_CANDIDATE_EXTRACTION_ONLY",
    "currentPhaseValueExtractionExecuted": false,
    "currentPhaseQuoteTruthCreated": false,
    "futureCandidateExtractionStillRequiresGate": true
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
  "next": "106P_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_GATE"
}

## Validation JSON

{
  "phase": "106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN",
  "status": "PASS",
  "decision": "PASS_106O_QUOTE_PREVIEW_FIELD_ANCHOR_WINDOW_DRY_RUN",
  "lockedDecision": "FIELD_ANCHOR_WINDOW_DRY_RUN_COMPLETE_WITH_REDACTED_CONTEXT_ONLY_NO_VALUES",
  "operatorTokenAccepted": true,
  "windowType": "redacted_anchor_context_windows_only",
  "anchorWindowRecordCount": 13,
  "criticalTargetCount": 6,
  "coveredCriticalTargetCount": 6,
  "missingAnchorWindows": [],
  "usedCommittedRedactedSamplesOnly": true,
  "rawPdfAccessed": false,
  "rawTextAccessed": false,
  "rawTextCommitted": false,
  "valueExtractionExecuted": false,
  "fieldCandidateExtractionExecuted": false,
  "parserExecutionExecuted": false,
  "ocrExecutionExecuted": false,
  "calculatorExecutionExecuted": false,
  "quoteTruthCreated": false,
  "uiPopulationExecuted": false,
  "sourceUiChanged": false,
  "allSafetyFlagsFalse": true,
  "next": "106P_QUOTE_PREVIEW_FIELD_CANDIDATE_EXTRACTION_GATE",
  "errors": []
}

## Confirmed

- Operator token accepted.
- Anchor window records were created.
- Only committed redacted samples were used.
- Only committed label map was used.
- Raw PDF was not accessed.
- Raw text was not accessed.
- Raw text was not committed.
- Anchor windows are context, not values.
- Value extraction was not executed.
- Field candidate extraction was not executed.
- Parser execution was not executed.
- OCR execution was not executed.
- Calculator execution was not executed.
- Quote truth was not created.
- Source UI was not changed.
