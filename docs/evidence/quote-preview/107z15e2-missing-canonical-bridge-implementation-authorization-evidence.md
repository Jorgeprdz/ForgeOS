# 107Z15E2 — Missing canonical bridge authorization evidence

Status: **PASS**

```json
{
  "status": "PASS",
  "authorization": {
    "IMPLEMENTATION_SCOPE_ID": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
    "AUTHORIZATION_ID": "MISSING_CANONICAL_BRIDGE_IMPLEMENTATION_AUTHORIZATION_V1",
    "AUTHORIZATION_REVIEW_COMPLETE": true,
    "MISSING_BRIDGE_CONFIRMED": true,
    "FIELD_SOURCE_CONTRACT_REVIEW_COMPLETE": true,
    "CANONICAL_FIELD_COUNT": 8,
    "RESOLVED_FIELD_COUNT": 1,
    "RESOLVED_FIELDS": [
      "product"
    ],
    "AMBIGUOUS_FIELD_COUNT": 5,
    "AMBIGUOUS_FIELDS": [
      "name",
      "family",
      "insured",
      "sumAssured",
      "annualPremium"
    ],
    "UNRESOLVED_FIELD_COUNT": 2,
    "UNRESOLVED_FIELDS": [
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "BRIDGE_IMPLEMENTATION_AUTHORIZED": false,
    "VERDICT": "BRIDGE_IMPLEMENTATION_BLOCKED_BY_FIELD_SOURCE_MODEL",
    "PROPOSED_BRIDGE_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js",
    "PROPOSED_TEST_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js",
    "AUTHORIZED_EXISTING_INTEGRATION_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js",
    "NEW_BRIDGE_SOURCE_WRITE_AUTHORIZED": false,
    "NEW_BRIDGE_TEST_WRITE_AUTHORIZED": false,
    "COORDINATOR_MINIMAL_INTEGRATION_EDIT_AUTHORIZED": false,
    "ENGINE_SOURCE_CHANGE_AUTHORIZED": false,
    "CONTRACT_SOURCE_CHANGE_AUTHORIZED": false,
    "STORE_SOURCE_CHANGE_AUTHORIZED": false,
    "MODAL_SOURCE_CHANGE_AUTHORIZED": false,
    "PRODUCT_INTELLIGENCE_SOURCE_CHANGE_AUTHORIZED": false,
    "SCHEMA_CHANGE_AUTHORIZED": false,
    "MANUAL_GUESS_MAPPING_AUTHORIZED": false,
    "DUPLICATE_BRIDGE_AUTHORIZED": false,
    "SOURCE_CODE_WRITTEN": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "NEXT_GATE": "107Z15E3_CANONICAL_FIELD_SOURCE_MODEL_DECISION_GATE"
  },
  "engine": {
    "path": "product-intelligence/evidence/forge-quote-pdf-preview-engine.js",
    "function": "extractSolucionlineLifeQuoteFields",
    "sha256": "d164ce99e24adde28cad3c5e558617eecaa97645f69c888d0ff3ee217e318014",
    "topLevelOutputKeys": [
      "detectedQuoteDomain",
      "sourceLayout",
      "product",
      "plan",
      "prospect",
      "Asegurado",
      "age",
      "gender",
      "smoker",
      "birthDate",
      "liquidationOption",
      "currency",
      "policyTerm",
      "paymentTerm",
      "sumInsured",
      "baseAnnualPremium",
      "totalAnnualPremium",
      "premium",
      "paymentMode",
      "premiumTable",
      "retirementInterestRate",
      "retirementScenarioBase",
      "retirementScenarioFavorable",
      "retirementScenarioUnfavorable",
      "guaranteePeriod",
      "optionalCoverages",
      "advisor",
      "seguros",
      "quoteDate",
      "extractionSource"
    ]
  },
  "fieldReviews": {
    "name": {
      "status": "AMBIGUOUS_EXPLICIT_MAPPINGS",
      "sourceContract": null,
      "explicitEvidenceCount": 119,
      "explicitEvidence": [
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 12936,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY",
          "excerpt": "bidden;\n- presentation generation forbidden;\n- source UI was not changed;\n- all safety flags remain false.\n\nLOOKUP_LINE_ITEM_COUNT=27\n\nBLOCKED_AMBIGUOUS_ITEM_COUNT=1\n\nLOOKUP_ELIGIBLE_FIELD_COUNT=6\n\nFUTURE_OPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY\n\nDECISION=PASS_106Z_QUOTE_PREVIEW_ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_DRY_RUN\n\nLOCKED_DECISION=ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_COMPLETE_AS_NOT_AUTHORIZED_NO_PDF_ACCES"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 12984,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY",
          "excerpt": "on forbidden;\n- local-only scope required for 107B;\n- source UI was not changed;\n- all safety flags remain false.\n\nLOOKUP_LINE_ITEM_COUNT=27\n\nBLOCKED_AMBIGUOUS_ITEM_COUNT=1\n\nLOOKUP_ELIGIBLE_FIELD_COUNT=6\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY\n\nDECISION=PASS_107A_QUOTE_PREVIEW_LOCAL_ONLY_ACTUAL_PDF_LOOKUP_AUTHORIZATION_GATE\n\nLOCKED_DECISION=LOCAL_ONLY_ACTUAL_PDF_LOOKUP_AUTHORIZATION_GATE_LOCKED_WITH_OPERATOR_CONFIRMA"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 13277,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": " used;\n- provider runtime not used;\n- source UI was not changed;\n- all safety flags remain false.\n\nFIELD_CANDIDATE_RECORD_COUNT=6\n\nELIGIBLE_CAPTURE_SPEC_COUNT=6\n\nBLOCKED_CAPTURE_SPEC_COUNT=0\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nDECISION=PASS_107G_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_GATE\n\nLOCKED_DECISION=MANUAL_VALUE_CAPTURE_GATE_LOCKED_FOR_TEMPLATE_PREP_ONLY_NO_VALUES_NO_TRUTH_NO_UI\n\nNEXT=107H_QUOT"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 13325,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": " flags remain false.\n\nCAPTURE_TEMPLATE_ENTRY_COUNT=6\n\nELIGIBLE_TEMPLATE_ENTRY_COUNT=6\n\nBLOCKED_TEMPLATE_ENTRY_COUNT=0\n\nMONEY_SIGNAL_TEMPLATE_ENTRY_COUNT=4\n\nDATE_SIGNAL_TEMPLATE_ENTRY_COUNT=2\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nDECISION=PASS_107H_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_TEMPLATE_DRY_RUN\n\nLOCKED_DECISION=MANUAL_VALUE_CAPTURE_TEMPLATE_DRY_RUN_COMPLETE_WITH_NULL_VALUES_NO_TRUTH_NO_UI\n\nNEXT"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 13368,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "ider runtime not used;\n- source UI was not changed;\n- all safety flags remain false.\n\nCAPTURE_TEMPLATE_ENTRY_COUNT=6\n\nELIGIBLE_AUTHORIZATION_SCOPE_ENTRY_COUNT=6\n\nBLOCKED_AUTHORIZATION_SCOPE_ENTRY_COUNT=0\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nDECISION=PASS_107I_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE\n\nLOCKED_DECISION=MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE_LOCKED_WITH_OPERATOR_CONFIRMATION_NO_VALUE"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 13460,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "sed;\n- source UI was not changed;\n- all safety flags remain false.\n\nEXECUTION_SCOPE_ENTRY_COUNT=6\n\nINPUT_PACKET_ENTRY_COUNT=6\n\nMONEY_FORMAT_HINT_ENTRY_COUNT=6\n\nDATE_FORMAT_HINT_ENTRY_COUNT=0\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nDECISION=PASS_107K_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_INPUT_PACKET_DRY_RUN\n\nLOCKED_DECISION=MANUAL_VALUE_CAPTURE_INPUT_PACKET_DRY_RUN_COMPLETE_WITH_BLANK_INPUTS_NULL"
        },
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 13503,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "ot used;\n- source UI was not changed;\n- all safety flags remain false.\n\nINPUT_PACKET_ENTRY_COUNT=6\n\nELIGIBLE_ACTUAL_CAPTURE_AUTHORIZATION_ENTRY_COUNT=6\n\nBLOCKED_ACTUAL_CAPTURE_AUTHORIZATION_ENTRY_COUNT=0\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nDECISION=PASS_107L_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE\n\nLOCKED_DECISION=ACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE_LOCKED_WITH_OPERATOR_"
        },
        {
          "path": "advisor-os/conversation/ai-first-contact-message-engine.js",
          "line": 50,
          "canonicalField": "name",
          "sourceExpression": "advisor.name",
          "excerpt": "\n\n}) {\n\n    return {\n\n        task:\n            'GENERATE_FIRST_CONTACT_MESSAGE',\n\n        language:\n            'es-MX',\n\n        channel,\n\n        objective,\n\n        tone,\n\n        relationshipType,\n\n        advisor: {\n\n            name:\n                advisor.name || '',\n\n            style:\n                advisor.style || 'consultivo',\n\n            company:\n                advisor.company || ''\n        },\n\n        prospect: {\n\n   "
        },
        {
          "path": "advisor-os/conversation/ai-first-contact-message-engine.js",
          "line": 62,
          "canonicalField": "name",
          "sourceExpression": "prospect.name",
          "excerpt": "isor: {\n\n            name:\n                advisor.name || '',\n\n            style:\n                advisor.style || 'consultivo',\n\n            company:\n                advisor.company || ''\n        },\n\n        prospect: {\n\n            name:\n                prospect.name || '',\n\n            role:\n                prospect.role || '',\n\n            relationship:\n                relationshipType,\n\n            knownContext:\n                co"
        },
        {
          "path": "advisor-os/followup/followup-message-context-engine.js",
          "line": 42,
          "canonicalField": "name",
          "sourceExpression": "advisor.name",
          "excerpt": " 'AGENDAR_CITA',\n\n    tone = 'PROFESIONAL_CERCANO'\n\n}) {\n\n    return {\n\n        task:\n            'GENERATE_FOLLOWUP_MESSAGE',\n\n        language:\n            'es-MX',\n\n        objective,\n\n        tone,\n\n        advisor: {\n\n            name:\n                advisor.name || '',\n\n            style:\n                advisor.style || 'consultivo'\n        },\n\n        prospect: {\n\n            name:\n                prospect.name || '',\n\n        "
        },
        {
          "path": "advisor-os/followup/followup-message-context-engine.js",
          "line": 51,
          "canonicalField": "name",
          "sourceExpression": "prospect.name",
          "excerpt": "     'es-MX',\n\n        objective,\n\n        tone,\n\n        advisor: {\n\n            name:\n                advisor.name || '',\n\n            style:\n                advisor.style || 'consultivo'\n        },\n\n        prospect: {\n\n            name:\n                prospect.name || '',\n\n            relationship:\n                prospect.relationship || '',\n\n            role:\n                prospect.role || ''\n        },\n\n        lastInteraction"
        },
        {
          "path": "dashboard.js",
          "line": 377,
          "canonicalField": "name",
          "sourceExpression": "selected.nombre",
          "excerpt": "ll,\n                metadata: {\n                    impact: 'Medio',\n                    confidence: `${confidence}%`,\n                    estimatedTime: '5 min'\n                }\n            };\n        }\n\n        const name = selected.nombre || 'un referido';\n        const source = selected.origen || 'sin COI registrado';\n        const phone = selected.telefono ? 'con teléfono' : 'sin teléfono';\n\n        return {\n            decisionTy"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_ACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE_107L.md",
          "line": 35,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "ENTRY_COUNT=6\n\nELIGIBLE_ACTUAL_CAPTURE_AUTHORIZATION_ENTRY_COUNT=6\n\nBLOCKED_ACTUAL_CAPTURE_AUTHORIZATION_ENTRY_COUNT=0\n\nMANUAL_OPERATOR_TOKEN_REQUIRED_THIS_PHASE=true\n\nMANUAL_OPERATOR_TOKEN_ACCEPTED=true\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nAUTHORIZATION_COLLECTED_IN_107L=true\n\nACTUAL_MANUAL_VALUE_CAPTURE_AUTHORIZED_FOR_107M=true\n\nACTUAL_MANUAL_VALUE_CAPTURE_EXECUTED_IN_107L=false\n\nCAPTURED_VALUES_REMAI"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_DRY_RUN_106Z.md",
          "line": 49,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY",
          "excerpt": "UP_LINE_ITEM_COUNT=27\n\nBLOCKED_AMBIGUOUS_ITEM_COUNT=1\n\nLOOKUP_ELIGIBLE_FIELD_COUNT=6\n\nAUTHORIZATION_PACKET_CREATED=true\n\nAUTHORIZATION_GRANTED_NOW=false\n\nFUTURE_MANUAL_OPERATOR_TOKEN_REQUIRED=true\n\nFUTURE_OPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY\n\n## What This Means\n\nForge now has a clear boundary for the next stage.\n\n107A may define a local-only actual PDF lookup authorization gate.\n\n107A must require explicit manual o"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_LOCAL_ONLY_ACTUAL_PDF_LOOKUP_AUTHORIZATION_GATE_107A.md",
          "line": 45,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY",
          "excerpt": "e a presentation.\n\n## Result\n\nLOOKUP_LINE_ITEM_COUNT=27\n\nBLOCKED_AMBIGUOUS_ITEM_COUNT=1\n\nLOOKUP_ELIGIBLE_FIELD_COUNT=6\n\nMANUAL_OPERATOR_TOKEN_REQUIRED_THIS_PHASE=true\n\nMANUAL_OPERATOR_TOKEN_ACCEPTED=true\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY\n\nLOCAL_ONLY_ACTUAL_PDF_LOOKUP_AUTHORIZED_FOR_107B=true\n\nACTUAL_PDF_LOOKUP_EXECUTED_IN_107A=false\n\n## What This Means\n\nForge may next define the local-only execution boundary in"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_AUTHORIZATION_GATE_107I.md",
          "line": 35,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "\nCAPTURE_TEMPLATE_ENTRY_COUNT=6\n\nELIGIBLE_AUTHORIZATION_SCOPE_ENTRY_COUNT=6\n\nBLOCKED_AUTHORIZATION_SCOPE_ENTRY_COUNT=0\n\nMANUAL_OPERATOR_TOKEN_REQUIRED_THIS_PHASE=true\n\nMANUAL_OPERATOR_TOKEN_ACCEPTED=true\n\nOPERATOR_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\nAUTHORIZATION_COLLECTED_IN_107I=true\n\nMANUAL_VALUE_CAPTURE_AUTHORIZED_FOR_107J=true\n\nMANUAL_VALUE_CAPTURE_EXECUTED_IN_107I=false\n\nCAPTURED_VALUES_REMAIN_NULL_IN_107I=true\n\n"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_GATE_107G.md",
          "line": 41,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "KED_CAPTURE_SPEC_COUNT=0\n\nMANUAL_VALUE_CAPTURE_GATE_ONLY=true\n\nMANUAL_VALUE_CAPTURE_EXECUTED_IN_107G=false\n\nCAPTURED_VALUES_REMAIN_NULL=true\n\nACTUAL_CAPTURE_REQUIRES_FUTURE_MANUAL_TOKEN=true\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\n## What This Means\n\nForge may next create a blank manual value capture template.\n\nThat template will still contain null captured values.\n\nActual capture will require a futu"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_INPUT_PACKET_DRY_RUN_107K.md",
          "line": 49,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "ALUE_CAPTURE_ALLOWED_IN_107K=false\n\nCAPTURED_VALUES_REMAIN_NULL_IN_107K=true\n\nCAPTURED_VALUE_COUNT_IN_107K=0\n\nAPPROVED_VALUE_COUNT_IN_107K=0\n\nACTUAL_CAPTURE_REQUIRES_FUTURE_MANUAL_TOKEN=true\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_ACTUAL_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\n## What This Means\n\nForge now has a blank input packet for future manual capture.\n\nActual capture still requires a future explicit authorization gate.\n\nNo captured v"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_QUOTE_PREVIEW_MANUAL_VALUE_CAPTURE_TEMPLATE_DRY_RUN_107H.md",
          "line": 49,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY",
          "excerpt": "IS_BLANK=true\n\nMANUAL_VALUE_CAPTURE_EXECUTED_IN_107H=false\n\nCAPTURED_VALUES_REMAIN_NULL=true\n\nCAPTURED_VALUE_COUNT=0\n\nAPPROVED_VALUE_COUNT=0\n\nACTUAL_CAPTURE_REQUIRES_FUTURE_MANUAL_TOKEN=true\n\nFUTURE_MANUAL_CAPTURE_TOKEN_NAME=AUTHORIZE_MANUAL_VALUE_CAPTURE_LOCAL_ONLY\n\n## What This Means\n\nForge now has a blank capture template.\n\nActual capture still requires future manual authorization.\n\nNo captured value exists yet.\n\nNo approved value ex"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
          "line": 10567,
          "canonicalField": "name",
          "sourceExpression": "AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY",
          "excerpt": "bidden;\n- presentation generation forbidden;\n- source UI was not changed;\n- all safety flags remain false.\n\nLOOKUP_LINE_ITEM_COUNT=27\n\nBLOCKED_AMBIGUOUS_ITEM_COUNT=1\n\nLOOKUP_ELIGIBLE_FIELD_COUNT=6\n\nFUTURE_OPERATOR_TOKEN_NAME=AUTHORIZE_ACTUAL_PDF_LOOKUP_LOCAL_ONLY\n\nDECISION=PASS_106Z_QUOTE_PREVIEW_ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_DRY_RUN\n\nLOCKED_DECISION=ACTUAL_PDF_LOOKUP_AUTHORIZATION_PACKET_COMPLETE_AS_NOT_AUTHORIZED_NO_PDF_ACCES"
        }
      ],
      "engineExactSameNameTopLevel": false
    },
    "family": {
      "status": "AMBIGUOUS_EXPLICIT_MAPPINGS",
      "sourceContract": null,
      "explicitEvidenceCount": 35,
      "explicitEvidence": [
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair-evidence.md",
          "line": 328,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "\n      \"ownerFunctions\": [\n        \"if\"\n      ],\n      \"occurrences\": [\n        {\n          \"line\": 288,\n          \"ownerFunction\": \"if\",\n          \"excerpt\": \" did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n      bindingRequest,\\n     "
        },
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair-evidence.md",
          "line": 381,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "QuotePreviewPdfIntegrationError(\\n        SAFE_ERROR_CODES.BINDING_REQUIRED,\\n        bindingRequest,\\n        'Quote Preview Product Intelligence binding shape did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n   \"\n        },\n        {\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair-evidence.md",
          "line": 386,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "   SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n   \"\n        },\n        {\n          \"line\": 288,\n          \"ownerFunction\": \"if\",\n          \"excerpt\": \"ng shape did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n      bindingRequest,\\n     "
        },
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair.json",
          "line": 323,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "\n      \"ownerFunctions\": [\n        \"if\"\n      ],\n      \"occurrences\": [\n        {\n          \"line\": 288,\n          \"ownerFunction\": \"if\",\n          \"excerpt\": \" did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n      bindingRequest,\\n     "
        },
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair.json",
          "line": 376,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "QuotePreviewPdfIntegrationError(\\n        SAFE_ERROR_CODES.BINDING_REQUIRED,\\n        bindingRequest,\\n        'Quote Preview Product Intelligence binding shape did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n   \"\n        },\n        {\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z15dr-targeted-adapter-dataflow-discovery-repair.json",
          "line": 381,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "   SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n   \"\n        },\n        {\n          \"line\": 288,\n          \"ownerFunction\": \"if\",\n          \"excerpt\": \"ng shape did not validate.'\\n      );\\n    }\\n  }\\n\\n  const productFamily = getField(binding, ['product_family', 'productFamily']);\\n  if (!productFamily) {\\n    return buildQuotePreviewPdfIntegrationError(\\n      SAFE_ERROR_CODES.PRODUCT_FAMILY_NOT_MAPPED,\\n      bindingRequest,\\n     "
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 418,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": ": false,\\n      writes_quote: false,\\n      creates_quote_truth: false,\\n    },\\n  };\\n}\\n\\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  return {\\n    schemaVersion: SCHEMA_VERSION,\\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 418,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": "uote_preview_pdf_engine_repo_promotion_safe_error\"}, {\"source\": \"quote_pdf_string_literal\", \"name\": \"\", \"value\": \",\\n    },\\n  };\\n}\\n\\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  if (!productFamily) {\\n    return buildQuotePrev"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 888,
          "canonicalField": "family",
          "sourceExpression": "adapter.integrateQuotePreviewPdfEngineWithProductIntelligence",
          "excerpt": "f_string_literal\", \"name\": \"\", \"value\": \");\\nassert.equal(imagina.quote_preview_pdf_engine_role, \"}, {\"source\": \"quote_pdf_string_literal\", \"name\": \"\", \"value\": \");\\nassert.equal(shapeOk(imagina), true);\\n\\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\\n  quote_preview_request_id: \"}, {\"source\": \"quote_pdf_string_literal\", \"name\": \"\", \"value\": \");\\nassert(\\n  [\\n    adapter.SAFE_ERROR_CODES.NOT_IN"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 1460,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": ": false,\\n      writes_quote: false,\\n      creates_quote_truth: false,\\n    },\\n  };\\n}\\n\\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  return {\\n    schemaVersion: SCHEMA_VERSION,\\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 1485,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": "r\"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \",\\n    },\\n  };\\n}\\n\\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  if (!productFamily) {\\n    return buildQuotePrev"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection-evidence.md",
          "line": 2042,
          "canonicalField": "family",
          "sourceExpression": "adapter.integrateQuotePreviewPdfEngineWithProductIntelligence",
          "excerpt": "ert.equal(imagina.quote_preview_pdf_engine_role, \"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \");\\nassert.equal(shapeOk(imagina), true);\\n\\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\\n  quote_preview_request_id: \"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \");\\na"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 668,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": ": false,\\n      writes_quote: false,\\n      creates_quote_truth: false,\\n    },\\n  };\\n}\\n\\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  return {\\n    schemaVersion: SCHEMA_VERSION,\\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 693,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": "   },\n          {\n            \"source\": \"quote_pdf_string_literal\",\n            \"name\": \"\",\n            \"value\": \",\\n    },\\n  };\\n}\\n\\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  if (!productFamily) {\\n    return buildQuotePrev"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 1250,
          "canonicalField": "family",
          "sourceExpression": "adapter.integrateQuotePreviewPdfEngineWithProductIntelligence",
          "excerpt": "imagina.quote_preview_pdf_engine_role, \"\n          },\n          {\n            \"source\": \"quote_pdf_string_literal\",\n            \"name\": \"\",\n            \"value\": \");\\nassert.equal(shapeOk(imagina), true);\\n\\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\\n  quote_preview_request_id: \"\n          },\n          {\n            \"source\": \"quote_pdf_string_literal\",\n            \"name\": \"\",\n            \"valu"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 3529,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": ": false,\\n      writes_quote: false,\\n      creates_quote_truth: false,\\n    },\\n  };\\n}\\n\\nfunction buildQuotePreviewPdfEnginePromotionError(request = {}, code = SAFE_ERROR_CODES.PROMOTION_NOT_SCOPED) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  return {\\n    schemaVersion: SCHEMA_VERSION,\\n  "
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 3554,
          "canonicalField": "family",
          "sourceExpression": "normalizeProductFamily",
          "excerpt": "r\"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \",\\n    },\\n  };\\n}\\n\\nfunction prepareQuotePreviewPdfEnginePromotionScope(request = {}) {\\n  const productFamily = normalizeProductFamily(\\n    request.product_family_hint ||\\n    request.productFamilyHint ||\\n    request.product_family ||\\n    request.productFamily\\n  );\\n\\n  if (!productFamily) {\\n    return buildQuotePrev"
        },
        {
          "path": "docs/evidence/quote-preview/107z2-canonical-engine-cache-api-inspection.json",
          "line": 5768,
          "canonicalField": "family",
          "sourceExpression": "adapter.integrateQuotePreviewPdfEngineWithProductIntelligence",
          "excerpt": "ert.equal(imagina.quote_preview_pdf_engine_role, \"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \");\\nassert.equal(shapeOk(imagina), true);\\n\\nconst missingFamily = adapter.integrateQuotePreviewPdfEngineWithProductIntelligence({\\n  quote_preview_request_id: \"\n        },\n        {\n          \"source\": \"quote_pdf_string_literal\",\n          \"name\": \"\",\n          \"value\": \");\\na"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 1213,
          "canonicalField": "family",
          "sourceExpression": "record",
          "excerpt": " resolution, errorCode = null) {`\n- L182: `const requestId = request.quote_preview_request_id || 'quote_preview_request_static_074b';`\n- L183: `const safeError = buildSafeError(record, errorCode);`\n- L184: `const productFamily = record?.product_family || getHintText(request.product_family_hint) || null;`\n- L190: `domainId: 'quote_preview',`\n- L191: `mode: 'read_only',`\n- L193: `readModel: {`\n- L194: `status: record && !safeError ? 'ok' "
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 1887,
          "canonicalField": "family",
          "sourceExpression": "getField",
          "excerpt": "on = bindingAdapter.validateQuotePreviewBindingShape(binding);`\n- L275: `return buildQuotePreviewPdfIntegrationError(`\n- L278: `'Quote Preview Product Intelligence binding shape did not validate.'`\n- L283: `const productFamily = getField(binding, ['product_family', 'productFamily']);`\n- L285: `return buildQuotePreviewPdfIntegrationError(`\n- L292: `const parserRef = getField(binding, ['parser_ref', 'parserRef']);`\n- L293: `const calculat"
        }
      ],
      "engineExactSameNameTopLevel": false
    },
    "product": {
      "status": "RESOLVED_EXACT_SAME_NAME_ENGINE_TOP_LEVEL",
      "sourceContract": {
        "sourceOwner": "engine",
        "sourceExpression": "nativeResult.product",
        "evidence": {
          "engineFunction": "extractSolucionlineLifeQuoteFields",
          "engineTopLevelKey": "product"
        }
      },
      "explicitEvidenceCount": 34,
      "explicitEvidence": [
        {
          "path": "FORGE_MASTER_BUILD_TREE.md",
          "line": 7994,
          "canonicalField": "product",
          "sourceExpression": "Binding",
          "excerpt": "Quote Preview Product Intelligence binding layer.\n\nLocked decision:\n`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED`\n\nIntegration rule:\n\n`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only`\n\n075A confirms that Quote Preview PDF behavior must bind through Product Intelligence before using quote-specific preview, parser, calculator, curren"
        },
        {
          "path": "docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_REPORT.txt",
          "line": 21,
          "canonicalField": "product",
          "sourceExpression": "Rules",
          "excerpt": "ualitative labels, not numeric scores.\n\nC) OWNERSHIP CORRECTIONS MADE\n- UDI/FX rate -> Economic Evidence (Forecast owns projections, Product Truth consumes for semantics).\n- Raw quote/illustration -> Evidence Ownership (Rules -> Product Truth, Values -> Economic Evidence, Scenarios -> Forecast Truth).\n- NASH -> Owns conversation guidance/framing (not client intent truth).\n- Relationship Intelligence -> Owns context/timing signals (not p"
        },
        {
          "path": "docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001A_REPORT.txt",
          "line": 25,
          "canonicalField": "product",
          "sourceExpression": "Productivity",
          "excerpt": "t Truth).\n- NASH -> Owns conversation guidance/framing (not client intent truth).\n- Relationship Intelligence -> Owns context/timing signals (not permission to manipulate).\n- Raw system activity -> Evidence Ownership.\n- Productivity -> Productivity metrics (not human worth).\n- Mick -> Behavior patterns.\n- Policy cancellation -> Policy Truth (confirmed), Forecast Truth (scenario).\n- Premium paid -> Policy Truth (with payment evidence).\n\n"
        },
        {
          "path": "docs/03-discovery/FORGE_IMPLEMENTATION_READINESS_001E_CROSS_DOMAIN_QA_HARNESS.txt",
          "line": 158,
          "canonicalField": "product",
          "sourceExpression": "Ownership",
          "excerpt": "enforcement\n- money becomes pressure\n- unknown is hidden\n- stale evidence is used as current\n- conflicts are silently resolved\n\n7. DOMAIN PAIR TEST MATRIX\n\nThe harness must test at least these domain pairs:\n\nA. Evidence Ownership → Product Truth\nRisk:\nvalidated extract treated as product rule without product owner review.\n\nExpected:\nvalidated extract is not product truth until Product Truth confirms.\n\nB. Evidence Ownership → Policy Trut"
        },
        {
          "path": "docs/03-discovery/FORGE_SALES_DECISION_SEQUENCE_DISCOVERY.md",
          "line": 60,
          "canonicalField": "product",
          "sourceExpression": "logic",
          "excerpt": "tinction in future architecture discovery.\n\n## 3. Source Comparison\n\n### Pedro Camarena Intelligence\n\nSequence:\n\nCredibility -> recommendation-based trust -> risk theory -> catastrophic risk\nrecognition -> risk transfer logic -> product category mapping -> prospect\nchoice of risk to administer.\n\nSale location:\n\nThe sale begins when the prospect accepts that the risk exists and should be\nadministered.\n\n### Corporate Methodology\n\nSequence"
        },
        {
          "path": "docs/05-shared-commercial-model/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md",
          "line": 157,
          "canonicalField": "product",
          "sourceExpression": "Normalizer",
          "excerpt": "legó este dato aquí?\"\n\nDebe existir como primitiva conceptual.\n\nProvenance no es SourceSystem.\nProvenance no es Evidence.\nProvenance es la cadena de custodia y transformación.\n\nEjemplo:\n\nPDF original\n-> OCR\n-> Parser\n-> Normalizer\n-> Product Detection\n-> Rule Engine\n-> Forge Output\n\nQué debe explicar:\n\n- Fuente inicial.\n- Evidencia original.\n- Transformaciones aplicadas.\n- Engines o procesos involucrados.\n- Reglas usadas.\n- Persona o si"
        },
        {
          "path": "docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md",
          "line": 202,
          "canonicalField": "product",
          "sourceExpression": "PRODUCT_PDF_AMBIGUITY",
          "excerpt": "owner, period and governance. |\n| DISCOVERY_DOC -> IMPLEMENTATION_TRUTH | Discovery does not authorize implementation. |\n| MANAGER_SIGNAL -> ADVISOR_OS_JUDGMENT | Manager signals must not become Advisor OS judgment. |\n| PRODUCT_PDF_AMBIGUITY -> PRODUCT_TRUTH | Ambiguous product evidence must remain unknown or validation-needed. |\n| LOCAL_FIXTURE -> RELEASE_TRUTH | Local/manual fixtures do not create release truth. |\n| OCR_OUTPUT -> PROD"
        },
        {
          "path": "docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md",
          "line": 204,
          "canonicalField": "product",
          "sourceExpression": "OCR_OUTPUT",
          "excerpt": " OS judgment. |\n| PRODUCT_PDF_AMBIGUITY -> PRODUCT_TRUTH | Ambiguous product evidence must remain unknown or validation-needed. |\n| LOCAL_FIXTURE -> RELEASE_TRUTH | Local/manual fixtures do not create release truth. |\n| OCR_OUTPUT -> PRODUCT_TRUTH | OCR is not truth. |\n| PARSER_OUTPUT -> POLICY_TRUTH | Parser output is candidate evidence until validated. |\n| COMPENSATION_SCENARIO -> PAID_COMPENSATION | Scenario is not payment. |\n| RELAT"
        },
        {
          "path": "docs/05-truth/TRUTH_BOUNDARY_001_SOURCE_TRUTH_AND_EVIDENCE_STATE.md",
          "line": 208,
          "canonicalField": "product",
          "sourceExpression": "PRODUCT_TRUTH",
          "excerpt": " Parser output is candidate evidence until validated. |\n| COMPENSATION_SCENARIO -> PAID_COMPENSATION | Scenario is not payment. |\n| RELATIONSHIP_SIGNAL -> CLIENT_PERMISSION | Relationship opportunity is not consent. |\n| PRODUCT_TRUTH -> PRODUCT_RECOMMENDATION without suitability/context | Product facts are not recommendations. |\n| ECONOMIC_MOTIVATION -> CLIENT_PRESSURE | Client First overrides economic pressure. |\n\n## Allowed Transition"
        },
        {
          "path": "docs/05-truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md",
          "line": 348,
          "canonicalField": "product",
          "sourceExpression": "PRODUCT_PDF_EVIDENCE",
          "excerpt": "UAL_OVERRIDE -> FACT | MANUAL_OVERRIDE | MANUAL | permission, reason, prior state and governance/owner validation | FACT | manual_override_validated | missing audit trail, unauthorized actor, override hides conflict |\n| PRODUCT_PDF_EVIDENCE -> PRODUCT_TRUTH | EVIDENCE_PACKET | OFFICIAL or VALIDATED | carrier/product/version/period/provenance validation under ADR-005 | PRODUCT_TRUTH | product_truth_validated | ambiguity, missing version,"
        },
        {
          "path": "docs/05-truth/TRUTH_BOUNDARY_002_TRUTH_TYPE_CONTRACT.md",
          "line": 368,
          "canonicalField": "product",
          "sourceExpression": "PRODUCT_PDF_AMBIGUITY",
          "excerpt": " -> IMPLEMENTATION_TRUTH | Blocked. Discovery does not authorize implementation. |\n| MANAGER_SIGNAL -> ADVISOR_OS_JUDGMENT | Blocked. Manager signals may support governed Manager OS context, not Advisor OS judgment. |\n| PRODUCT_PDF_AMBIGUITY -> PRODUCT_TRUTH | Blocked. Ambiguous product evidence must remain UNKNOWN, UNVERIFIED, CONFLICTING or BLOCKED. |\n| LOCAL_FIXTURE -> RELEASE_TRUTH | Blocked. Local fixtures support local/manual vali"
        },
        {
          "path": "docs/99-archive/FORGE_PAQ_MARKDOWN_CONVERSION_BUNDLE.txt",
          "line": 17403,
          "canonicalField": "product",
          "sourceExpression": "Normalizer",
          "excerpt": "ó este dato aquí?\"\n\nDebe existir como primitiva conceptual.\n\nProvenance no es SourceSystem.\nProvenance no es Evidence.\nProvenance es la cadena de custodia y transformación.\n\n### Ejemplo\n\nPDF original\n-> OCR\n-> Parser\n-> Normalizer\n-> Product Detection\n-> Rule Engine\n-> Forge Output\n\n### Qué debe explicar\n\n- Fuente inicial.\n- Evidencia original.\n- Transformaciones aplicadas.\n- Engines o procesos involucrados.\n- Reglas usadas.\n- Persona o"
        },
        {
          "path": "docs/99-archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.md",
          "line": 167,
          "canonicalField": "product",
          "sourceExpression": "Normalizer",
          "excerpt": "ó este dato aquí?\"\n\nDebe existir como primitiva conceptual.\n\nProvenance no es SourceSystem.\nProvenance no es Evidence.\nProvenance es la cadena de custodia y transformación.\n\n### Ejemplo\n\nPDF original\n-> OCR\n-> Parser\n-> Normalizer\n-> Product Detection\n-> Rule Engine\n-> Forge Output\n\n### Qué debe explicar\n\n- Fuente inicial.\n- Evidencia original.\n- Transformaciones aplicadas.\n- Engines o procesos involucrados.\n- Reglas usadas.\n- Persona o"
        },
        {
          "path": "docs/99-archive/FORGE_SHARED_COMMERCIAL_MODEL_EVIDENCE_PROVENANCE_FOUNDATION.txt",
          "line": 157,
          "canonicalField": "product",
          "sourceExpression": "Normalizer",
          "excerpt": "legó este dato aquí?\"\n\nDebe existir como primitiva conceptual.\n\nProvenance no es SourceSystem.\nProvenance no es Evidence.\nProvenance es la cadena de custodia y transformación.\n\nEjemplo:\n\nPDF original\n-> OCR\n-> Parser\n-> Normalizer\n-> Product Detection\n-> Rule Engine\n-> Forge Output\n\nQué debe explicar:\n\n- Fuente inicial.\n- Evidencia original.\n- Transformaciones aplicadas.\n- Engines o procesos involucrados.\n- Reglas usadas.\n- Persona o si"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
          "line": 568,
          "canonicalField": "product",
          "sourceExpression": "files",
          "excerpt": " root files -> Nash Conversation Intelligence after runtime boundary review\n│   ├── 🔵 Relationship root files -> Relationship Intelligence after source/freshness closure\n│   ├── 🔵 Product/GMM/Imagina/ORVI/Vida/Segu root files -> Product Intelligence after evidence packet review\n│   ├── 🔵 Sales/outreach/conversion root files -> Sales Conversion after recommendation/execution boundary review\n│   ├── 🔵 Policy/activity/WhatsApp root files -"
        },
        {
          "path": "docs/architecture/source-truth/FORGE_UNIFIED_BUILD_TREE_001.md",
          "line": 5625,
          "canonicalField": "product",
          "sourceExpression": "Binding",
          "excerpt": "Quote Preview Product Intelligence binding layer.\n\nLocked decision:\n`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED`\n\nIntegration rule:\n\n`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only`\n\n075A confirms that Quote Preview PDF behavior must bind through Product Intelligence before using quote-specific preview, parser, calculator, curren"
        },
        {
          "path": "docs/evidence/FORGE_QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPE_075A.md",
          "line": 19,
          "canonicalField": "product",
          "sourceExpression": "Binding",
          "excerpt": "ION\n\n## Evidence Summary\n\n075A scopes the integration between Quote Preview PDF Engine and the Product Intelligence binding layer.\n\nThe binding chain is:\n\n`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only`\n\nThis prevents Quote Preview PDF behavior from selecting parsers, calculators, Banxico utilities, or quote engines outside the Product Intelligence c"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 1197,
          "canonicalField": "product",
          "sourceExpression": "findRecordByProductRef",
          "excerpt": "odelByFamily(request.product_family_hint);`\n- L137: `const record = envelope.readModel.records[0] || null;`\n- L139: `record,`\n- L141: `errorCode: record ? null : SAFE_ERROR_CODES.productFamilyNotMapped`\n- L145: `const byProduct = findRecordByProductRef(request.product_ref_hint);`\n- L147: `return { record: byProduct, resolution: 'product_ref_hint', errorCode: null };`\n- L150: `const byCarrier = findRecordByCarrierRef(request.carrier_ref_"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review.json",
          "line": 7568,
          "canonicalField": "product",
          "sourceExpression": "findRecordByProductRef",
          "excerpt": "\"text\": \"record,\"\n        },\n        {\n          \"line\": 141,\n          \"text\": \"errorCode: record ? null : SAFE_ERROR_CODES.productFamilyNotMapped\"\n        },\n        {\n          \"line\": 145,\n          \"text\": \"const byProduct = findRecordByProductRef(request.product_ref_hint);\"\n        },\n        {\n          \"line\": 147,\n          \"text\": \"return { record: byProduct, resolution: 'product_ref_hint', errorCode: null };\"\n        },\n     "
        },
        {
          "path": "docs/roadmap/FORGE_ROADMAP_LOCK_001.md",
          "line": 4620,
          "canonicalField": "product",
          "sourceExpression": "Binding",
          "excerpt": "Quote Preview Product Intelligence binding layer.\n\nLocked decision:\n`QUOTE_PREVIEW_PDF_ENGINE_PRODUCT_INTELLIGENCE_INTEGRATION_SCOPED`\n\nIntegration rule:\n\n`Quote Preview PDF request -> Quote Preview Product Intelligence Binding -> Product Intelligence Read Model -> allowed references only`\n\n075A confirms that Quote Preview PDF behavior must bind through Product Intelligence before using quote-specific preview, parser, calculator, curren"
        }
      ],
      "engineExactSameNameTopLevel": true
    },
    "insured": {
      "status": "AMBIGUOUS_EXPLICIT_MAPPINGS",
      "sourceContract": null,
      "explicitEvidenceCount": 5,
      "explicitEvidence": [
        {
          "path": "gmm-advisor-review-engine.js",
          "line": 56,
          "canonicalField": "insured",
          "sourceExpression": "firstInsured",
          "excerpt": "  }\n\n  if (identityMatch === 'POSSIBLE_MATCH') {\n    return 'CONFIRM IDENTITY';\n  }\n\n  return 'REVIEW REQUIRED';\n}\n\nfunction buildCaseSnapshot({ quoteSummary = {}, policySummary = {}, comparisonSummary = {} }) {\n  const insured = firstInsured(policySummary);\n\n  return {\n    product: formatProductPlan(quoteSummary, policySummary),\n    prospect: quoteSummary.prospect || null,\n    issuedPolicy: insured.name || null,\n    policyNumber: polic"
        },
        {
          "path": "gmm-client-review-engine.js",
          "line": 75,
          "canonicalField": "insured",
          "sourceExpression": "insured.name",
          "excerpt": "ured = firstInsured(policySummary);\n  const plan = policySummary.plan || quoteSummary.plan || null;\n\n  return {\n    product: policySummary.product || quoteSummary.product || null,\n    plan: plan ? formatPlan(plan) : null,\n    insured: insured.name || quoteSummary.prospect || null,\n    proposedFor: quoteSummary.prospect || null,\n    status: comparisonSummary.identityMatch === 'SAME_INSURED'\n      ? 'Ready to review together'\n      : 'Nee"
        },
        {
          "path": "gmm-client-review-engine.js",
          "line": 70,
          "canonicalField": "insured",
          "sourceExpression": "firstInsured",
          "excerpt": ";\n  }\n\n  return `${change.label || change.field} changed from ${change.quoteValue} to ${change.policyValue}.`;\n}\n\nfunction buildClientSnapshot({ quoteSummary = {}, policySummary = {}, comparisonSummary = {} }) {\n  const insured = firstInsured(policySummary);\n  const plan = policySummary.plan || quoteSummary.plan || null;\n\n  return {\n    product: policySummary.product || quoteSummary.product || null,\n    plan: plan ? formatPlan(plan) : n"
        },
        {
          "path": "proposal-family-engine.js",
          "line": 27,
          "canonicalField": "insured",
          "sourceExpression": "Number",
          "excerpt": "n String(value)\n    .toLowerCase()\n    .normalize('NFD')\n    .replace(/[\\u0300-\\u036f]/g, '')\n    .replace(/[^a-z0-9\\s]/g, ' ')\n    .replace(/\\s+/g, ' ')\n    .trim();\n}\n\nfunction protectionScore(quote = {}) {\n  const sumInsured = Number(quote.sumInsured || 0);\n  const deductible = Number(quote.deductible || 0);\n  const cap = Number(quote.coinsuranceCap || 0);\n  const optionals = Array.isArray(quote.optionalCoverages)\n    ? quote.optiona"
        },
        {
          "path": "quote-to-policy-comparison-engine.js",
          "line": 165,
          "canonicalField": "insured",
          "sourceExpression": "firstInsured",
          "excerpt": "Summary = {}) {\n  return (policySummary.optionalCoverages || [])\n    .filter((coverage) => coverage.status === 'ACTIVE' || coverage.status === 'SELECTED');\n}\n\nfunction buildContractualFacts(policySummary = {}) {\n  const insured = firstInsured(policySummary);\n\n  return [\n    { field: 'policyNumber', value: policySummary.policyNumber },\n    { field: 'policyPeriod', value: policySummary.policyPeriod },\n    { field: 'insured', value: insure"
        }
      ],
      "engineExactSameNameTopLevel": false
    },
    "sumAssured": {
      "status": "AMBIGUOUS_EXPLICIT_MAPPINGS",
      "sourceContract": null,
      "explicitEvidenceCount": 7,
      "explicitEvidence": [
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 631,
          "canonicalField": "sumAssured",
          "sourceExpression": "getNumber",
          "excerpt": "sicAnnualPremium = getNumber(basicPremiumMatch?.[4]);`\n- L25: `const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);`\n- L26: `const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);`\n- L27: `const sumAssured = getNumber(coverageMatch?.[2]);`\n- L31: `lumpSum: getNumber(scenarioMatch[2]),`\n- L32: `monthlyIncome: getNumber(scenarioMatch[3]),`\n- L35: `lumpSum: getNumber(scenarioMatch[4]),`\n- L36: `monthlyIncome: getNu"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review.json",
          "line": 10915,
          "canonicalField": "sumAssured",
          "sourceExpression": "getNumber",
          "excerpt": "lannedPremiumMatch?.[4]);\"\n        },\n        {\n          \"line\": 26,\n          \"text\": \"const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);\"\n        },\n        {\n          \"line\": 27,\n          \"text\": \"const sumAssured = getNumber(coverageMatch?.[2]);\"\n        },\n        {\n          \"line\": 31,\n          \"text\": \"lumpSum: getNumber(scenarioMatch[2]),\"\n        },\n        {\n          \"line\": 32,\n          \"text\": \"monthlyIncom"
        },
        {
          "path": "policy-operations/evidence/policy-evidence-packet.js",
          "line": 77,
          "canonicalField": "sumAssured",
          "sourceExpression": "null",
          "excerpt": "rationalData({\n  carrierId = null,\n  carrierName = null,\n  productName = null,\n  productVariant = null,\n  policyNumber = null,\n  policyYear = null,\n  annualPremium = null,\n  currency = null,\n  paymentFrequency = null,\n  sumAssured = null,\n  effectiveDate = null,\n  issueDate = null,\n  renewalDate = null,\n  advisorId = null,\n  evidenceRefs = [],\n  confirmationState = POLICY_EVIDENCE_STATES.CONFIRMED,\n} = {}) {\n  return {\n    carrierId,\n  "
        },
        {
          "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
          "line": 27,
          "canonicalField": "sumAssured",
          "sourceExpression": "getNumber",
          "excerpt": "ingYears;\n\n  const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);\n  const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);\n  const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);\n  const sumAssured = getNumber(coverageMatch?.[2]);\n  const scenarioEvidence = scenarioMatch\n    ? {\n        base: {\n          lumpSum: getNumber(scenarioMatch[2]),\n          monthlyIncome: getNumber(scenarioMatch[3]),\n        }"
        },
        {
          "path": "product-intelligence/knowledge/vida-mujer-pdf-intake-report.js",
          "line": 153,
          "canonicalField": "sumAssured",
          "sourceExpression": "detectBasicSumAssured",
          "excerpt": "),\n        basicSumAssured: Number(match[8].replace(/,/g, \"\"))\n      });\n    }\n  });\n\n  return rows;\n}\n\nconst product = detectProduct(text);\nconst currency = detectCurrency(text);\nconst age = detectAge(text);\nconst basicSumAssured = detectBasicSumAssured(text);\nconst annualPremium = detectAnnualPremium(text);\nconst totalPremiumWithRecommended = detectTotalPremiumWithRecommended(text);\nconst coverageStatus = detectCoverageStatus(text);\nc"
        },
        {
          "path": "product-intelligence/knowledge/vida-mujer-survival-schedule-engine.js",
          "line": 9,
          "canonicalField": "sumAssured",
          "sourceExpression": "Number",
          "excerpt": "export function buildVidaMujerSurvivalSchedule({\n  sumAssured = 0,\n  currency = 'UDI',\n  startAge = 0,\n  coverageYears = 20,\n  exchangeRateToMXN = null,\n  projectionRate = 0.045\n}) {\n  const baseSumAssured = Number(sumAssured || 0);\n  const normalizedCurrency = String(currency || 'UDI').toUpperCase();\n  const currentRate = Number(exchangeRateToMXN || 0);\n  const effectiveProjectionRate =\n    normalizedCurrency ="
        },
        {
          "path": "vida-mujer-knowledge-extractor.js",
          "line": 184,
          "canonicalField": "sumAssured",
          "sourceExpression": "knowledge.basicCoverage.sumAssured",
          "excerpt": "shValue:\n        number(match[6]),\n\n      totalRecovery:\n        number(match[7]),\n\n      basicSumAssured:\n        number(match[8])\n    });\n  });\n\n  if (\n    knowledge.basicCoverage\n  ) {\n    knowledge.survivalBenefit = {\n      sumAssured:\n        knowledge.basicCoverage.sumAssured,\n\n      intermediateEvents: [\n        5,7,9,11,13,15,17\n      ],\n\n      intermediatePercentage: 0.05,\n\n      finalYear: 20,\n\n      finalPercentage: 0.80,\n\n  "
        }
      ],
      "engineExactSameNameTopLevel": false
    },
    "annualPremium": {
      "status": "AMBIGUOUS_EXPLICIT_MAPPINGS",
      "sourceContract": null,
      "explicitEvidenceCount": 16,
      "explicitEvidence": [
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 398,
          "canonicalField": "annualPremium",
          "sourceExpression": "getAnnualPremium",
          "excerpt": "MA\");`\n- L120: `const pcf = getCoverageAmount(\"PCF\");`\n- L121: `const pep = getCoverageAmount(\"PEP\");`\n- L122: `const clp = getCoverageAmount(\"CLP\");`\n- L123: `const adapta = getCoverageAmount(\"ADAPTA\");`\n- L125: `const annualPremium = getAnnualPremium();`\n- L126: `const recommendedPremium = getRecommendedPremium();`\n- L127: `const survivalTotal = getSurvivalTotal();`\n- L129: `const guaranteedValues = getGuaranteedValues();`\n- L163: `co"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 628,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "umber = (value) =>`\n- L18: `const currentAge = getNumber(ageMatch?.[1]);`\n- L19: `const retirementAge = getNumber(productMatch?.[1]);`\n- L21: `const premiumPayingYears = getNumber(limitedMatch?.[1]);`\n- L24: `const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);`\n- L25: `const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);`\n- L26: `const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);`\n- L27: `const sum"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review-evidence.md",
          "line": 630,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "emiumPayingYears = getNumber(limitedMatch?.[1]);`\n- L24: `const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);`\n- L25: `const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);`\n- L26: `const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);`\n- L27: `const sumAssured = getNumber(coverageMatch?.[2]);`\n- L31: `lumpSum: getNumber(scenarioMatch[2]),`\n- L32: `monthlyIncome: getNumber(scenarioMatch[3]),`\n- L35: `l"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review.json",
          "line": 10903,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "umber(productMatch?.[1]);\"\n        },\n        {\n          \"line\": 21,\n          \"text\": \"const premiumPayingYears = getNumber(limitedMatch?.[1]);\"\n        },\n        {\n          \"line\": 24,\n          \"text\": \"const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);\"\n        },\n        {\n          \"line\": 25,\n          \"text\": \"const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);\"\n        },\n        {\n          \"li"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review.json",
          "line": 10911,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "atch?.[4]);\"\n        },\n        {\n          \"line\": 25,\n          \"text\": \"const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);\"\n        },\n        {\n          \"line\": 26,\n          \"text\": \"const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);\"\n        },\n        {\n          \"line\": 27,\n          \"text\": \"const sumAssured = getNumber(coverageMatch?.[2]);\"\n        },\n        {\n          \"line\": 31,\n          \"t"
        },
        {
          "path": "docs/evidence/quote-preview/107z3-targeted-canonical-pdf-cache-writer-reader-review.json",
          "line": 11143,
          "canonicalField": "annualPremium",
          "sourceExpression": "getAnnualPremium",
          "excerpt": "const clp = getCoverageAmount(\\\"CLP\\\");\"\n        },\n        {\n          \"line\": 123,\n          \"text\": \"const adapta = getCoverageAmount(\\\"ADAPTA\\\");\"\n        },\n        {\n          \"line\": 125,\n          \"text\": \"const annualPremium = getAnnualPremium();\"\n        },\n        {\n          \"line\": 126,\n          \"text\": \"const recommendedPremium = getRecommendedPremium();\"\n        },\n        {\n          \"line\": 127,\n          \"text\": \"cons"
        },
        {
          "path": "imagina-ser-ocr-extractor.js",
          "line": 26,
          "canonicalField": "annualPremium",
          "sourceExpression": "number",
          "excerpt": ";\n  const plannedPremiumMatch = text.match(/Prima planeada\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)/i);\n  const totalPremiumMatch = text.match(/Prima total\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)/i);\n  const totalAnnualPremium = number(firstMatch(text, /Prima Total Anual\\s+([\\d,]+)/i));\n  const scenarioRow = text.match(\n    /(?:^|\\n)\\s*(\\d+)\\s+(\\d+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)\\s+([\\d,]+)/m\n  );\n  const "
        },
        {
          "path": "policy-operations/evidence/policy-evidence-packet.js",
          "line": 74,
          "canonicalField": "annualPremium",
          "sourceExpression": "null",
          "excerpt": "EVIDENCE_STATES.CONFIRMED;\n}\n\nexport function createConfirmedPolicyOperationalData({\n  carrierId = null,\n  carrierName = null,\n  productName = null,\n  productVariant = null,\n  policyNumber = null,\n  policyYear = null,\n  annualPremium = null,\n  currency = null,\n  paymentFrequency = null,\n  sumAssured = null,\n  effectiveDate = null,\n  issueDate = null,\n  renewalDate = null,\n  advisorId = null,\n  evidenceRefs = [],\n  confirmationState = PO"
        },
        {
          "path": "product-intelligence/evidence/gmm-quote-parser.js",
          "line": 43,
          "canonicalField": "annualPremium",
          "sourceExpression": "findMoneyAfter",
          "excerpt": "rialityMatch = clean.match(/Territorialidad:\\s*([A-Za-zÁÉÍÓÚÑ]+)/i);\n  const tabulatorMatch = clean.match(/Tabulador:\\s*([A-ZÁÉÍÓÚÑ0-9]+)/i);\n  const currencyMatch = clean.match(/Moneda:\\s*([A-Za-zÁÉÍÓÚÑ]+)/i);\n\n  const annualPremium =\n    findMoneyAfter('PRIMA ANUAL', clean)\n    ?? findMoneyAfter('Prima anual', clean);\n\n  return {\n    productType: 'GMM',\n\n    productName: clean.includes('Alfa Medical')\n      ? 'Alfa Medical'\n      : 'U"
        },
        {
          "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
          "line": 24,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "entAge = getNumber(productMatch?.[1]);\n  const coverageYears = retirementAge - currentAge;\n  const premiumPayingYears = getNumber(limitedMatch?.[1]);\n  const paidUntilAge = currentAge + premiumPayingYears;\n\n  const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);\n  const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);\n  const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);\n  const sumAssured = getNumber(c"
        },
        {
          "path": "product-intelligence/evidence/solucionline-retirement-parser.js",
          "line": 26,
          "canonicalField": "annualPremium",
          "sourceExpression": "getNumber",
          "excerpt": "Match?.[1]);\n  const paidUntilAge = currentAge + premiumPayingYears;\n\n  const basicAnnualPremium = getNumber(basicPremiumMatch?.[4]);\n  const plannedAnnualContribution = getNumber(plannedPremiumMatch?.[4]);\n  const totalAnnualPremium = getNumber(totalPremiumMatch?.[4]);\n  const sumAssured = getNumber(coverageMatch?.[2]);\n  const scenarioEvidence = scenarioMatch\n    ? {\n        base: {\n          lumpSum: getNumber(scenarioMatch[2]),\n    "
        },
        {
          "path": "product-intelligence/knowledge/ave/shared-ave-portfolio-engine.js",
          "line": 27,
          "canonicalField": "annualPremium",
          "sourceExpression": "position.annualPremium",
          "excerpt": ": position.aveType,\n      inference: null\n    };\n  }\n\n  if (\n    position.observedValues &&\n    position.annualPremium &&\n    position.currency\n  ) {\n    const inference = inferAveType({\n      currency: position.currency,\n      annualPremium: position.annualPremium,\n      observedValues: position.observedValues\n    });\n\n    return {\n      aveType: inference.inferredAveType,\n      inference\n    };\n  }\n\n  return {\n    aveType: \"UNKNOWN\",\n"
        },
        {
          "path": "product-intelligence/knowledge/vida-mujer-client-explanation-report.js",
          "line": 125,
          "canonicalField": "annualPremium",
          "sourceExpression": "getAnnualPremium",
          "excerpt": "eAmount(\"BAIT\");\nconst bma = getCoverageAmount(\"BMA\");\nconst pcf = getCoverageAmount(\"PCF\");\nconst pep = getCoverageAmount(\"PEP\");\nconst clp = getCoverageAmount(\"CLP\");\nconst adapta = getCoverageAmount(\"ADAPTA\");\n\nconst annualPremium = getAnnualPremium();\nconst recommendedPremium = getRecommendedPremium();\nconst survivalTotal = getSurvivalTotal();\n\nconst guaranteedValues = getGuaranteedValues();\nconst lastGuaranteedValue = guaranteedVal"
        },
        {
          "path": "product-intelligence/knowledge/vida-mujer-pdf-intake-report.js",
          "line": 154,
          "canonicalField": "annualPremium",
          "sourceExpression": "detectAnnualPremium",
          "excerpt": "ace(/,/g, \"\"))\n      });\n    }\n  });\n\n  return rows;\n}\n\nconst product = detectProduct(text);\nconst currency = detectCurrency(text);\nconst age = detectAge(text);\nconst basicSumAssured = detectBasicSumAssured(text);\nconst annualPremium = detectAnnualPremium(text);\nconst totalPremiumWithRecommended = detectTotalPremiumWithRecommended(text);\nconst coverageStatus = detectCoverageStatus(text);\nconst coverageAmounts = detectCoverageAmounts(tex"
        },
        {
          "path": "vida-mujer-financial-correction-report.js",
          "line": 34,
          "canonicalField": "annualPremium",
          "sourceExpression": "knowledge.basicCoverage.annualPremium",
          "excerpt": "  console.log(\"Uso:\");\n  console.log(\"node vida-mujer-financial-correction-report.js archivo.pdf\");\n  process.exit(1);\n}\n\nconst knowledge = extractVidaMujerKnowledge(pdfPath);\n\nconst currency = knowledge.currency;\nconst annualPremium = knowledge.basicCoverage.annualPremium;\nconst years = 20;\n\nconst totalContributed = calculateAnnualContribution({\n  annualPremium,\n  years\n});\n\nconst survivalBenefit = knowledge.survivalBenefit.totalBenefi"
        },
        {
          "path": "vida-mujer-pdf-ave-integration-report.js",
          "line": 133,
          "canonicalField": "annualPremium",
          "sourceExpression": "firstPositive.aveRescueValue",
          "excerpt": " firstPositive =\n    aveRows[0];\n\n  return {\n    detected: true,\n    status: \"AVE_VALUE_PRESENT\",\n    positions: [\n      {\n        positionId: \"PDF-AVE-001\",\n        aveType: \"UNKNOWN\",\n        currency: detectCurrency(),\n        annualPremium: firstPositive.aveRescueValue,\n        purchaseYear: 1,\n        observedValues\n      }\n    ],\n    observedValues\n  };\n}\n\nconsole.log(\"\\nFORGE VIDA MUJER PDF + AVE INTEGRATION REPORT v0.1\\n\");\n\ncon"
        }
      ],
      "engineExactSameNameTopLevel": false
    },
    "plannedOrAvePremium": {
      "status": "UNRESOLVED_NO_EXPLICIT_SOURCE_CONTRACT",
      "sourceContract": null,
      "explicitEvidenceCount": 0,
      "explicitEvidence": [],
      "engineExactSameNameTopLevel": false
    },
    "coveragePeriod": {
      "status": "UNRESOLVED_NO_EXPLICIT_SOURCE_CONTRACT",
      "sourceContract": null,
      "explicitEvidenceCount": 0,
      "explicitEvidence": [],
      "engineExactSameNameTopLevel": false
    }
  },
  "constitutionalFlags": {
    "NEW_ENGINE_CREATED": false,
    "NEW_CACHE_CREATED": false,
    "DUPLICATE_BRIDGE_CREATED": false,
    "SCHEMA_CHANGED": false,
    "SOURCE_UI_CHANGED": false,
    "SOURCE_CODE_WRITTEN": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "STATIC_SOURCE_INSPECTION_EXECUTED": true,
    "GIT_TRACKED_EVIDENCE_INSPECTION_EXECUTED": true,
    "TEST_EXECUTION": true
  }
}
```
