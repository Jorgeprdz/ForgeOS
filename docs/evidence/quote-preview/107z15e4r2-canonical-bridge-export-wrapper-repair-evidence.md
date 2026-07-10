# 107Z15E4R2 — Canonical bridge export-wrapper repair evidence

Status: **PASS**

```json
{
  "status": "PASS",
  "implementation": {
    "IMPLEMENTATION_SCOPE_ID": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
    "IMPLEMENTATION_ID": "CANONICAL_BRIDGE_EXPORT_WRAPPER_REPAIR_V1",
    "IMPLEMENTATION_COMPLETE": true,
    "FAILED_ATTEMPT_RESIDUE_CLEANED": true,
    "VALIDATOR_RESOLVED": true,
    "VALIDATOR_SYMBOL": "assertSafePayload",
    "BRIDGE_CREATED": true,
    "BRIDGE_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js",
    "BRIDGE_EXPORT": "buildQuotePreviewPdfResultCanonicalPacket",
    "TEST_CREATED": true,
    "TEST_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js",
    "COORDINATOR_WRAPPER_INTEGRATED": true,
    "COORDINATOR_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js",
    "COORDINATOR_EXPORT": "buildQuotePreviewPdfCanonicalPersistenceInput",
    "EXISTING_EXPORTS_PRESERVED": true,
    "EXISTING_EXPORT_COUNT": 1,
    "FROZEN_STATE_PRESERVED": true,
    "COORDINATOR_FROZEN_BEFORE": true,
    "COORDINATOR_FROZEN_AFTER": true,
    "CANONICAL_FIELD_COUNT": 8,
    "EXACT_CANONICAL_FIELDS": [
      "name",
      "family",
      "product",
      "insured",
      "sumAssured",
      "annualPremium",
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "SYNTHETIC_DIFFERENTIAL_TEST_PASS": true,
    "CONTRACT_VALIDATION_PASS": true,
    "NULL_OPTIONAL_VALUE_PASS": true,
    "NO_SEMANTIC_FALLBACKS_PASS": true,
    "EXACT_SOURCE_BOUNDARY_PASS": true,
    "AUTHORIZED_SOURCE_PATHS": [
      "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js",
      "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js",
      "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js"
    ],
    "ENGINE_SOURCE_CHANGED": false,
    "CONTRACT_SOURCE_CHANGED": false,
    "STORE_SOURCE_CHANGED": false,
    "MODAL_SOURCE_CHANGED": false,
    "PRODUCT_INTELLIGENCE_SOURCE_CHANGED": false,
    "SCHEMA_CHANGED": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "NEXT_GATE": "107Z15E5_CONTROLLED_ENGINE_TO_CANONICAL_PERSISTENCE_PROOF_GATE"
  },
  "coordinatorApiBefore": {
    "type": "object",
    "frozen": true,
    "keys": [
      "createCoordinator"
    ]
  },
  "coordinatorApiAfter": {
    "type": "object",
    "frozen": true,
    "keys": [
      "buildQuotePreviewPdfCanonicalPersistenceInput",
      "createCoordinator"
    ]
  },
  "contractValidatorInspection": {
    "status": "PASS",
    "selectedValidator": "assertSafePayload",
    "validatorCandidates": [
      "assertSafePayload",
      "validateRecord"
    ],
    "validatorSymbolsUsedByCoordinator": [
      "assertSafePayload"
    ]
  },
  "sourceHashes": {
    "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js": "24463bd3369475cd8ba315e9fd8515905eb7818d49a40c637eb96056ffd0423b",
    "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js": "907fd7787fdc1fa69da5923cfdad74d5d6de10cb510e8564c6601187b76d12af",
    "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js": "576287ccc98ac8778e76fd9d7a335da07f9fcd1795d8cffe7964a508e11d48d3"
  },
  "testOutput": [
    "PASS_EXACT_EIGHT_CANONICAL_FIELDS",
    "PASS_CONTEXT_AND_ENGINE_OWNERSHIP",
    "PASS_NO_SEMANTIC_FALLBACKS",
    "PASS_NULL_OPTIONAL_VALUE",
    "PASS_SYNTHETIC_DIFFERENTIAL_OUTPUT",
    "PASS_COORDINATOR_WRAPPER_ENTRYPOINT",
    "PASS_EXISTING_EXPORTS_PRESERVED",
    "PASS_FROZEN_STATE_PRESERVED",
    "PASS_EXISTING_CONTRACT_VALIDATION"
  ],
  "constitutionalFlags": {
    "NEW_ENGINE_CREATED": false,
    "NEW_CACHE_CREATED": false,
    "DUPLICATE_BRIDGE_CREATED": false,
    "CANONICAL_BRIDGE_CREATED": true,
    "SCHEMA_CHANGED": false,
    "SOURCE_UI_CHANGED": false,
    "SOURCE_CODE_WRITTEN": true,
    "SYNTHETIC_DIFFERENTIAL_TEST_EXECUTED": true,
    "EXISTING_CONTRACT_VALIDATION_EXECUTED": true,
    "COORDINATOR_API_PRESERVATION_TEST_EXECUTED": true,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "TEST_EXECUTION": true
  }
}
```
