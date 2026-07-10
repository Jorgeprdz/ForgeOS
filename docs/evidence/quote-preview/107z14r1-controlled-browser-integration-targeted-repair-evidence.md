# 107Z14R1 — Controlled browser targeted repair evidence

Status: **PASS**

```json
{
  "chain": "107Z14R1_CONTROLLED_BROWSER_INTEGRATION_TARGETED_REPAIR_GATE",
  "status": "PASS",
  "generated_at_local_stamp": "20260710_120024",
  "repair": {
    "IMPLEMENTATION_SCOPE_ID": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
    "REPAIR_ID": "DIRECT_COMMITTED_SOURCE_INJECTION",
    "TARGETED_REPAIR_APPLIED": true,
    "RESOURCE_PATH_DEPENDENCY_REMOVED_FROM_HARNESS": true,
    "DIRECT_COMMITTED_SOURCE_INJECTION_USED": true,
    "CONTROLLED_BROWSER_INTEGRATION_COMPLETE": true,
    "ACTUAL_BROWSER_ENGINE_USED": true,
    "LOCALHOST_SERVER_USED": true,
    "SYNTHETIC_DATA_USED": true,
    "EPHEMERAL_BROWSER_PROFILE_USED": true,
    "EPHEMERAL_LOCAL_STORAGE_EFFECT_EXECUTED": true,
    "EPHEMERAL_STORAGE_CLEARED_AFTER_TEST": true,
    "TEMP_BROWSER_PROFILE_REMOVED": true,
    "LEGACY_EVENT_INTERCEPTED": true,
    "PERSISTED_BEFORE_MODAL_OPEN": true,
    "IDENTITY_EVENT_REEMITTED": true,
    "MODAL_OPENED_BY_EXACT_IDENTITY": true,
    "EIGHT_FIELDS_ROUND_TRIP": true,
    "AMBIGUITY_ROUND_TRIP": true,
    "LOCALHOST_ONLY_NETWORK_BOUNDARY": true,
    "SOURCE_CODE_WRITTEN": false,
    "SOURCE_UI_CHANGED": false,
    "LIVE_APPLICATION_RUNTIME_EXECUTED": false,
    "NEXT_GATE": "107Z15_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_EXISTING_EXTRACTOR_CONTROLLED_INTEGRATION_GATE"
  },
  "previous_107z14r_diagnostic": {
    "status": "HOLD",
    "reason": "BROWSER_LAUNCH_OR_EXECUTION_FAILED",
    "driver": "puppeteer-core",
    "executablePath": "/data/data/com.termux/files/usr/bin/chromium-browser",
    "message": "Waiting failed: 15000ms exceeded",
    "stack": "TimeoutError: Waiting failed: 15000ms exceeded\n    at new WaitTask (file:///data/data/com.termux/files/home/.forge-tools/quote-preview-browser-harness-v1/npm/node_modules/puppeteer-core/lib/puppeteer/common/WaitTask.js:46:34)\n    at IsolatedWorld.waitForFunction (file:///data/data/com.termux/files/home/.forge-tools/quote-preview-browser-harness-v1/npm/node_modules/puppeteer-core/lib/puppeteer/api/Realm.js:49:26)\n    at CdpFrame.waitForFunction (file:///data/data/com.termux/files/home/.forge-tools/quote-preview-browser-harness-v1/npm/node_modules/puppeteer-core/lib/puppeteer/api/Frame.js:580:43)\n    at CdpFrame.<anonymous> (file:///data/data/com.termux/files/home/.forge-tools/quote-preview-browser-harness-v1/npm/node_modules/puppeteer-core/lib/puppeteer/util/decorators.js:101:27)\n    at CdpPage.waitForFunction (file:///data/data/com.termux/files/home/.forge-tools/quote-preview-browser-harness-v1/npm/node_modules/puppeteer-core/lib/puppeteer/api/Page.js:1447:37)\n    at main (/data/data/com.termux/files/home/107Z14R_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_CONTROLLED_BROWSER_INTEGRATION_RETRY_GATE_20260710_115654/controlled-browser-runner.js:80:16)"
  },
  "browser_result": {
    "status": "PASS",
    "reason": null,
    "repairId": "DIRECT_COMMITTED_SOURCE_INJECTION",
    "driver": "puppeteer-core",
    "puppeteerVersion": "25.3.0",
    "executablePath": "/data/data/com.termux/files/usr/bin/chromium-browser",
    "browserVersion": "Chrome/149.0.7827.155",
    "url": "http://127.0.0.1:35487/index.html",
    "test": {
      "checks": {
        "contract_field_count": true,
        "modal_opened": true,
        "no_persistence_errors": true,
        "exactly_one_storage_record": true,
        "identity_event_emitted": true,
        "identity_exact": true,
        "identity_event_reference_only": true,
        "modal_received_identity": true,
        "modal_quote_truth_false": true,
        "eight_fields_round_trip": true,
        "ambiguity_round_trip": true,
        "persisted_record_identity_exact": true,
        "persisted_record_quote_truth_false": true,
        "no_forbidden_persisted_keys": true,
        "storage_cleared_after_test": true
      },
      "errors": [],
      "storageKeys": [
        "forge.quotePreview.pdfResult.v1:1:controlled-browser-result-r1-001"
      ],
      "identityEvents": [
        {
          "type": "forge:quote-preview:extraction-ready",
          "detail": {
            "previewResultIdentity": {
              "previewResultId": "controlled-browser-result-r1-001",
              "schemaVersion": "1"
            },
            "persistenceContractId": "QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",
            "__forgePersistenceIdentityEvent": true
          }
        }
      ],
      "modalPayload": {
        "name": "browser-value-1",
        "family": "browser-value-2",
        "product": "browser-value-3",
        "insured": "browser-value-4",
        "sumAssured": "browser-value-5",
        "annualPremium": "browser-value-6",
        "plannedOrAvePremium": "browser-value-7",
        "coveragePeriod": "browser-value-8",
        "ambiguity": {
          "name": {
            "status": "ambiguous",
            "candidates": [
              "browser-a",
              "browser-b"
            ]
          }
        },
        "previewResultIdentity": {
          "previewResultId": "controlled-browser-result-r1-001",
          "schemaVersion": "1"
        },
        "persistenceMetadata": {
          "createdAt": "2026-07-10T18:00:39.251Z",
          "expiresAt": "2026-07-10T18:02:39.251Z",
          "schemaVersion": "1",
          "quoteTruth": false
        }
      },
      "storageCleared": true,
      "failedChecks": [],
      "pageErrors": [],
      "consoleErrors": [],
      "blockedExternalRequests": [],
      "failedResponses": []
    }
  },
  "source_receipts": {
    "CONTRACT_SHA256": "e7f5d74b32115c98bbec5f9f8ad7b1e4503fa87a6c668fdf4919c7a0fa29f322",
    "STORE_SHA256": "3f5271c8b66485603051411b84a1260cf2d2590385ff4e34243eb31322b871d5",
    "COORDINATOR_SHA256": "07d06906c235a144215dc21e1c1bde611fe87896cdb1daf3d71b574caf75fd25",
    "MODAL_SHA256": "bf299e2f968d01f5569980e30bb823572eecf44ad90a1f8d5c5f6959e6edc85d"
  },
  "authorization": {
    "EXISTING_EXTRACTOR_CONTROLLED_INTEGRATION_GATE_AUTHORIZED": true,
    "SOURCE_CODE_WRITE_AUTHORIZED": false,
    "LIVE_APPLICATION_RUNTIME_AUTHORIZED": false,
    "PDF_READ_AUTHORIZED": false,
    "OCR_EXECUTION_AUTHORIZED": false,
    "PARSER_EXECUTION_AUTHORIZED": false,
    "BACKEND_CONNECTION_AUTHORIZED": false,
    "OFFICIAL_QUOTE_WRITE_AUTHORIZED": false,
    "QUOTE_TRUTH_AUTHORIZED": false,
    "REAL_CUSTOMER_DATA_AUTHORIZED": false,
    "REAL_EFFECTS_AUTHORIZED": false
  },
  "constitutional_flags": {
    "NEW_ENGINE_CREATED": false,
    "NEW_CACHE_CREATED": false,
    "DUPLICATE_BRIDGE_CREATED": false,
    "SOURCE_UI_CHANGED": false,
    "PDF_READ_EXECUTED": false,
    "OCR_EXECUTED": false,
    "PARSER_EXECUTED": false,
    "BACKEND_CONNECTION": false,
    "QUOTE_TRUTH_ALLOWED": false,
    "CONTROLLED_BROWSER_EXECUTION": true,
    "EPHEMERAL_STORAGE_EFFECT_EXECUTED": true,
    "TEST_EXECUTION": true
  },
  "inputs": {
    "VALIDATION_CHAIN": "107Z13_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_SOURCE_VALIDATION_AND_DRY_RUN_GATE",
    "PROVISIONING_CHAIN": "107Z14P_CONTROLLED_BROWSER_HARNESS_PROVISIONING_GATE"
  }
}
```
