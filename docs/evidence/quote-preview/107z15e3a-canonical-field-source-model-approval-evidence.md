# 107Z15E3A — Canonical field source model approval evidence

Status: **PASS**

```json
{
  "status": "PASS",
  "approval": {
    "IMPLEMENTATION_SCOPE_ID": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
    "APPROVAL_ID": "CANONICAL_FIELD_SOURCE_MODEL_APPROVAL_V1",
    "APPROVAL_REVIEW_COMPLETE": true,
    "CANONICAL_FIELD_COUNT": 8,
    "MAPPING_APPROVED": true,
    "FIELD_SOURCE_MODEL_RESOLVED": true,
    "BRIDGE_IMPLEMENTATION_AUTHORIZED": true,
    "CONTEXT_OWNED_FIELD_COUNT": 2,
    "CONTEXT_OWNED_FIELDS": [
      "name",
      "family"
    ],
    "ENGINE_OWNED_FIELD_COUNT": 6,
    "ENGINE_OWNED_FIELDS": [
      "product",
      "insured",
      "sumAssured",
      "annualPremium",
      "plannedOrAvePremium",
      "coveragePeriod"
    ],
    "DUPLICATE_SEMANTIC_FIELDS_ALLOWED": false,
    "SEMANTIC_GUESS_FALLBACKS_ALLOWED": false,
    "MISSING_CONTEXT_MAY_BE_INVENTED": false,
    "NULL_OPTIONAL_VALUES_MAY_BE_PRESERVED": true,
    "PROPOSED_BRIDGE_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.js",
    "PROPOSED_TEST_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-canonical-bridge.test.js",
    "AUTHORIZED_EXISTING_INTEGRATION_PATH": "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js",
    "AUTHORIZED_CONTRACT_VALIDATOR": "platform/adapters/quote-preview/quote-preview-pdf-result-persistence-contract.js",
    "NEW_BRIDGE_SOURCE_WRITE_AUTHORIZED": true,
    "NEW_BRIDGE_TEST_WRITE_AUTHORIZED": true,
    "COORDINATOR_MINIMAL_INTEGRATION_EDIT_AUTHORIZED": true,
    "ENGINE_SOURCE_CHANGE_AUTHORIZED": false,
    "CONTRACT_SOURCE_CHANGE_AUTHORIZED": false,
    "STORE_SOURCE_CHANGE_AUTHORIZED": false,
    "MODAL_SOURCE_CHANGE_AUTHORIZED": false,
    "PRODUCT_INTELLIGENCE_SOURCE_CHANGE_AUTHORIZED": false,
    "SCHEMA_CHANGE_AUTHORIZED": false,
    "SOURCE_CODE_WRITTEN": false,
    "REAL_ENGINE_EXECUTION": false,
    "PARSER_EXECUTED": false,
    "CONTROLLED_BROWSER_EXECUTION": false,
    "PDF_READ_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "NEXT_GATE": "107Z15E4_MINIMAL_CANONICAL_BRIDGE_IMPLEMENTATION_GATE"
  },
  "approvedFieldOrder": [
    "name",
    "family",
    "product",
    "insured",
    "sumAssured",
    "annualPremium",
    "plannedOrAvePremium",
    "coveragePeriod"
  ],
  "approvedFieldModel": {
    "name": {
      "ownership": "RUNTIME_CONTEXT_USER_EDITABLE",
      "source": "context.name",
      "requiredInput": false,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": true,
      "fallbackPolicy": "NO_ENGINE_FALLBACK",
      "forbiddenFallbacks": [
        "nativeResult.prospect",
        "nativeResult.product",
        "generated display label"
      ],
      "rationale": "name is the editable display identity of the persisted quote, not the insured-person field"
    },
    "family": {
      "ownership": "RUNTIME_PRODUCT_ROUTING_CONTEXT",
      "source": "context.productFamily ?? context.product_family",
      "acceptedContextKeys": [
        "productFamily",
        "product_family"
      ],
      "requiredInput": true,
      "nullableBeforeConfirmation": false,
      "editableInConfirmation": false,
      "fallbackPolicy": "NO_ENGINE_OR_PRODUCT_NAME_FALLBACK",
      "forbiddenFallbacks": [
        "nativeResult.product",
        "hardcoded life",
        "hardcoded product family"
      ],
      "rationale": "family is routing/classification context and must not be inferred from a product display name"
    },
    "product": {
      "ownership": "ENGINE_DIRECT",
      "source": "nativeResult.product",
      "requiredInput": true,
      "nullableBeforeConfirmation": false,
      "editableInConfirmation": false,
      "fallbackPolicy": "NO_BRIDGE_FALLBACK",
      "rationale": "exact same-name top-level engine output"
    },
    "insured": {
      "ownership": "ENGINE_SEMANTIC_APPROVED",
      "source": "nativeResult.prospect",
      "requiredInput": true,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": false,
      "fallbackPolicy": "NO_SUM_INSURED_FALLBACK",
      "forbiddenFallbacks": [
        "nativeResult.sumInsured"
      ],
      "rationale": "engine prospect is parsed from the Asegurado line and therefore represents the insured person"
    },
    "sumAssured": {
      "ownership": "ENGINE_SEMANTIC_APPROVED",
      "source": "nativeResult.sumInsured",
      "requiredInput": true,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": false,
      "fallbackPolicy": "NO_OTHER_MONETARY_FALLBACK",
      "rationale": "sumInsured is the engine's normalized insured amount"
    },
    "annualPremium": {
      "ownership": "ENGINE_NORMALIZED_TABLE_VALUE",
      "source": "nativeResult.premiumTable.annual",
      "requiredInput": true,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": false,
      "fallbackPolicy": "ENGINE_INTERNAL_FALLBACK_ONLY",
      "forbiddenFallbacks": [
        "nativeResult.baseAnnualPremium",
        "nativeResult.totalAnnualPremium",
        "nativeResult.premium"
      ],
      "rationale": "premiumTable.annual is already the engine-owned normalized annual selection with its internal basic/total fallback order"
    },
    "plannedOrAvePremium": {
      "ownership": "ENGINE_PRODUCT_OPTIONAL_VALUE",
      "source": "nativeResult.premiumTable.plannedAnnual",
      "requiredInput": false,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": false,
      "fallbackPolicy": "NULL_WHEN_NOT_EXTRACTED",
      "forbiddenFallbacks": [
        "nativeResult.premiumTable.annual",
        "nativeResult.premium",
        "calculated average"
      ],
      "rationale": "the current engine explicitly exposes plannedAnnual; the bridge must not manufacture an average or substitute annualPremium"
    },
    "coveragePeriod": {
      "ownership": "ENGINE_POLICY_DURATION",
      "source": "nativeResult.policyTerm",
      "requiredInput": true,
      "nullableBeforeConfirmation": true,
      "editableInConfirmation": false,
      "fallbackPolicy": "NO_PAYMENT_OR_GUARANTEE_TERM_FALLBACK",
      "forbiddenFallbacks": [
        "nativeResult.paymentTerm",
        "nativeResult.guaranteePeriod"
      ],
      "rationale": "coverage period means policy duration; payment term and guarantee period are separate product concepts"
    }
  },
  "implementationRequirements": [
    "bridge accepts nativeResult and explicit runtime context",
    "bridge emits exactly the approved eight fields in approved order",
    "name has no fallback to insured or product",
    "family has no fallback to nativeResult.product or hardcoded family",
    "annualPremium reads only nativeResult.premiumTable.annual",
    "plannedOrAvePremium preserves null when plannedAnnual is absent",
    "coveragePeriod reads only nativeResult.policyTerm",
    "existing persistence contract validator must accept the packet",
    "two synthetic variants must produce differential canonical output",
    "no source delta outside bridge test and minimal coordinator integration"
  ],
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
    "ARCHITECTURE_APPROVAL_EXECUTED": true,
    "TEST_EXECUTION": true
  }
}
```
