# Forge Quote Preview Extraction Schema Lock Evidence 106C

PHASE=106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK
STATUS=PASS
DECISION=PASS_106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK
LOCKED_DECISION=PDF_EXTRACTION_SCHEMA_LOCKED_FOR_REDACTED_DRY_RUN_CANDIDATES_ONLY
NEXT=106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT

## Schema JSON

{
  "phase": "106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK",
  "status": "PASS",
  "decision": "PASS_106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK",
  "lockedDecision": "PDF_EXTRACTION_SCHEMA_LOCKED_FOR_REDACTED_DRY_RUN_CANDIDATES_ONLY",
  "basePhase": "106B_QUOTE_PREVIEW_REAL_PDF_DRY_RUN_SCOPE",
  "testUrl": "https://jorgeprdz.github.io/ForgeOS/static-preview/forge-alive/nueva-cotizacion/?v=105dr5",
  "localRunDirectoryOutsideRepo": "/storage/emulated/0/Forge Gemini/pdf-dry-run-local",
  "schemaVersion": "106C.1",
  "schemaType": "redacted_dry_run_candidate_schema_only",
  "sourceUiChanged": false,
  "pdfReadAllowedInThisPhase": false,
  "parserExecutionAllowedInThisPhase": false,
  "ocrExecutionAllowedInThisPhase": false,
  "calculatorExecutionAllowedInThisPhase": false,
  "quoteTruthAllowed": false,
  "officialQuoteAllowed": false,
  "rawPdfCommitAllowed": false,
  "unredactedEvidenceCommitAllowed": false,
  "statusEnum": [
    "not_attempted",
    "found_redacted_candidate",
    "not_found_in_pdf",
    "ambiguous_needs_review",
    "manual_input_required",
    "blocked_until_parser_gate",
    "blocked_until_human_review"
  ],
  "confidenceEnum": [
    "none",
    "low",
    "medium",
    "high",
    "human_verified"
  ],
  "redactionClasses": {
    "client_identity": {
      "commitValuePolicy": "replace_with_[CLIENT_REDACTED]",
      "examples": [
        "[CLIENT_REDACTED]"
      ]
    },
    "quote_identifier": {
      "commitValuePolicy": "replace_with_[QUOTE_ID_REDACTED]",
      "examples": [
        "[QUOTE_ID_REDACTED]"
      ]
    },
    "financial_value": {
      "commitValuePolicy": "replace_with_[AMOUNT_REDACTED]_unless_synthetic_or_user_approved_redacted_sample",
      "examples": [
        "[AMOUNT_REDACTED]",
        "[CURRENCY_REDACTED]"
      ]
    },
    "date_or_validity": {
      "commitValuePolicy": "replace_with_[DATE_REDACTED]_or_generalized_period",
      "examples": [
        "[DATE_REDACTED]",
        "monthly_or_annual_if_not_personal"
      ]
    },
    "product_label": {
      "commitValuePolicy": "may_keep_generic_product_family_only_when_not_personalized",
      "examples": [
        "GMM",
        "Vida",
        "PPR",
        "[PRODUCT_DETAIL_REDACTED]"
      ]
    },
    "source_location_hint": {
      "commitValuePolicy": "page_or_section_hint_only_no_raw_text",
      "examples": [
        "page_1_header",
        "page_2_table",
        "summary_section"
      ]
    },
    "free_text": {
      "commitValuePolicy": "redact_or_summarize_without_personal_identifiers",
      "examples": [
        "[FREE_TEXT_REDACTED]",
        "advisor_note_summary_redacted"
      ]
    }
  },
  "fields": [
    {
      "fieldKey": "document_id_or_quote_reference",
      "displayLabel": "Referencia de documento o cotización",
      "targetUiSection": "document_metadata",
      "redactionClass": "quote_identifier",
      "allowedSource": "pdf_only",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "quote_date",
      "displayLabel": "Fecha de cotización",
      "targetUiSection": "document_metadata",
      "redactionClass": "date_or_validity",
      "allowedSource": "pdf_only",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "validity_date_or_period",
      "displayLabel": "Vigencia",
      "targetUiSection": "quote_summary",
      "redactionClass": "date_or_validity",
      "allowedSource": "pdf_only",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "client_name",
      "displayLabel": "Cliente",
      "targetUiSection": "autofill_context",
      "redactionClass": "client_identity",
      "allowedSource": "pdf_or_manual_context",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "product_family",
      "displayLabel": "Familia de producto",
      "targetUiSection": "autofill_context",
      "redactionClass": "product_label",
      "allowedSource": "pdf_or_manual_context",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "product_name_or_plan",
      "displayLabel": "Plan o producto",
      "targetUiSection": "quote_summary",
      "redactionClass": "product_label",
      "allowedSource": "pdf_only",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "plan_sum_insured_and_premium",
      "displayLabel": "Plan, suma asegurada y prima",
      "targetUiSection": "quote_summary",
      "redactionClass": "financial_value",
      "allowedSource": "pdf_only_or_authorized_engine_later",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "payment_form_currency_and_validity",
      "displayLabel": "Forma de pago, moneda y vigencia",
      "targetUiSection": "quote_summary",
      "redactionClass": "financial_value",
      "allowedSource": "pdf_only",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "total_aportado",
      "displayLabel": "Total aportado",
      "targetUiSection": "quote_summary",
      "redactionClass": "financial_value",
      "allowedSource": "pdf_only_or_authorized_engine_later",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "total_recuperacion",
      "displayLabel": "Total recuperación",
      "targetUiSection": "quote_summary",
      "redactionClass": "financial_value",
      "allowedSource": "pdf_only_or_authorized_engine_later",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "values_benefits_or_scenarios_relevant_to_plan",
      "displayLabel": "Valores, beneficios o escenarios relevantes",
      "targetUiSection": "quote_summary",
      "redactionClass": "financial_value",
      "allowedSource": "pdf_only_or_authorized_engine_later",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "missing_items_before_presentation",
      "displayLabel": "Faltantes antes de presentar",
      "targetUiSection": "quote_summary",
      "redactionClass": "free_text",
      "allowedSource": "derived_from_missing_field_status_only",
      "requiredForPresentation": true
    },
    {
      "fieldKey": "commercial_angle_from_user_notes",
      "displayLabel": "Ángulo comercial",
      "targetUiSection": "presentation_context",
      "redactionClass": "free_text",
      "allowedSource": "manual_context_only",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "client_objective_from_user_notes",
      "displayLabel": "Objetivo del cliente",
      "targetUiSection": "presentation_context",
      "redactionClass": "free_text",
      "allowedSource": "manual_context_only",
      "requiredForPresentation": false
    },
    {
      "fieldKey": "quote_highlights",
      "displayLabel": "Puntos fuertes de la cotización",
      "targetUiSection": "presentation_context",
      "redactionClass": "free_text",
      "allowedSource": "pdf_candidates_plus_human_review_later",
      "requiredForPresentation": false
    }
  ],
  "candidateRecordSchema": {
    "fieldKey": "string_from_locked_field_list",
    "displayLabel": "string",
    "targetUiSection": "document_metadata|autofill_context|quote_summary|presentation_context",
    "candidateValueRedacted": "string_or_null",
    "candidateValueRawLocalOnly": "never_commit_to_repo",
    "sourceLocationHintRedacted": "string_or_null",
    "status": [
      "not_attempted",
      "found_redacted_candidate",
      "not_found_in_pdf",
      "ambiguous_needs_review",
      "manual_input_required",
      "blocked_until_parser_gate",
      "blocked_until_human_review"
    ],
    "confidence": [
      "none",
      "low",
      "medium",
      "high",
      "human_verified"
    ],
    "needsHumanReview": "boolean",
    "mayPopulateUi": "false_until_human_review_and_future_gate",
    "mayCreateQuoteTruth": "false",
    "notes": "string_redacted_or_null"
  },
  "requiredDryRunReportSections": [
    "run_metadata_redacted",
    "input_file_policy_statement",
    "field_presence_matrix",
    "redacted_extraction_candidates",
    "confidence_report",
    "missing_fields_report",
    "parser_gap_report",
    "human_review_required",
    "forbidden_actions_confirmed_false"
  ],
  "uiMapping": {
    "autofill_context": [
      "client_name",
      "product_family",
      "commercial_angle_from_user_notes",
      "client_objective_from_user_notes"
    ],
    "quote_summary": [
      "plan_sum_insured_and_premium",
      "payment_form_currency_and_validity",
      "total_aportado",
      "total_recuperacion",
      "values_benefits_or_scenarios_relevant_to_plan",
      "missing_items_before_presentation"
    ],
    "presentation_context": [
      "quote_highlights",
      "commercial_angle_from_user_notes",
      "client_objective_from_user_notes"
    ]
  },
  "populationRules": {
    "mayPopulateStaticPreviewAutomatically": false,
    "mayPopulateDryRunReport": "redacted_candidates_only",
    "mayPopulateQuoteTruth": false,
    "mayPopulateOfficialQuote": false,
    "requiresHumanReviewBeforeUiUse": true,
    "missingValuesRemainPending": true,
    "ambiguousValuesMustNotBeChosenAutomatically": true,
    "financialValuesRequireSourceLocationHint": true
  },
  "forbiddenBehaviors": [
    "store_raw_pdf_in_repo",
    "store_raw_pdf_text_in_repo",
    "commit_unredacted_client_identity",
    "commit_unredacted_quote_identifier",
    "commit_unredacted_financial_value_tied_to_person",
    "calculate_missing_values",
    "invent_total_aportado",
    "invent_total_recuperacion",
    "infer_product_rules_not_in_pdf",
    "mark_candidate_as_official_quote",
    "write_candidates_to_crm",
    "send_message",
    "generate_sales_presentation",
    "execute_backend_call"
  ],
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
  "next": "106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT"
}

## Validation JSON

{
  "phase": "106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK",
  "status": "PASS",
  "decision": "PASS_106C_QUOTE_PREVIEW_EXTRACTION_SCHEMA_LOCK",
  "lockedDecision": "PDF_EXTRACTION_SCHEMA_LOCKED_FOR_REDACTED_DRY_RUN_CANDIDATES_ONLY",
  "schemaVersion": "106C.1",
  "fieldCount": 15,
  "statusEnumLocked": [
    "not_attempted",
    "found_redacted_candidate",
    "not_found_in_pdf",
    "ambiguous_needs_review",
    "manual_input_required",
    "blocked_until_parser_gate",
    "blocked_until_human_review"
  ],
  "confidenceEnumLocked": [
    "none",
    "low",
    "medium",
    "high",
    "human_verified"
  ],
  "redactionClassesLocked": [
    "client_identity",
    "date_or_validity",
    "financial_value",
    "free_text",
    "product_label",
    "quote_identifier",
    "source_location_hint"
  ],
  "requiredQuoteSummaryFieldsPresent": true,
  "pdfReadAllowedInThisPhase": false,
  "parserExecutionAllowedInThisPhase": false,
  "ocrExecutionAllowedInThisPhase": false,
  "calculatorExecutionAllowedInThisPhase": false,
  "quoteTruthAllowed": false,
  "rawPdfCommitAllowed": false,
  "unredactedEvidenceCommitAllowed": false,
  "sourceUiChanged": false,
  "allSafetyFlagsFalse": true,
  "next": "106D_QUOTE_PREVIEW_SAMPLE_EXTRACTION_DRY_RUN_REPORT",
  "errors": []
}

## Confirmed

- Extraction schema is locked.
- Candidate record contract is locked.
- Field list is locked.
- Status enum is locked.
- Confidence enum is locked.
- Redaction classes are locked.
- UI mapping is locked.
- Dry-run report sections are locked.
- PDF read remains disabled.
- Parser execution remains disabled.
- Quote truth remains disabled.
- Source UI was not changed.
