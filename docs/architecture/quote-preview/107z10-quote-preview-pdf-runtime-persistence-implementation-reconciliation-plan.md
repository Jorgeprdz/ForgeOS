# 107Z10 — Quote Preview PDF persistence implementation reconciliation plan

Status: **PASS**

## Outcome

`OUTCOME=IMPLEMENTATION_RECONCILIATION_PLAN_READY`

`IMPLEMENTATION_PLAN_READY=true`

## Existing owners to preserve

- Extractor: `product-intelligence/evidence/forge-quote-pdf-preview-engine.js` (UNIQUE_BY_SCORE_MARGIN)
- Integration adapter: `platform/adapters/quote-preview/quote-preview-pdf-product-intelligence-integration-adapter-075b.js` (UNIQUE_BY_SCORE_MARGIN)
- Confirmation modal: `docs/static-preview/forge-alive/assets/forge-quote-preview-confirmation-modal-107q.js` (UNIQUE_BY_SCORE_MARGIN)

## Persistence reconciliation

- Existing dedicated store proven: `false`
- New dedicated store required: `true`
- Existing persistence bridge proven: `false`
- New narrow coordinator required: `true`
- Proposed store path: `platform/runtime/quote-preview/quote-preview-pdf-result-store.js`
- Proposed contract path: `platform/adapters/quote-preview/quote-preview-pdf-result-persistence-contract.js`
- Proposed coordinator path: `platform/adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js`

## Constitutional boundaries

- Reuse the existing extractor. No new PDF engine.
- Reuse the existing Product Intelligence integration adapter.
- Reuse the existing confirmation modal and event name.
- Exactly one writer and one reader.
- No hidden latest/default record selection.
- No raw PDF bytes, secrets, backend credentials or quote truth.
- Repeat duplicate-infrastructure discovery before implementation.

## Ordered implementation plan

### 1. FINAL_DUPLICATE_INFRASTRUCTURE_CHECK

Repeat a focused source-only duplicate check immediately before runtime implementation.

### 2. DEFINE_PERSISTENCE_CONTRACT

Define schema version, exact previewResultId identity, writer receipt, reader input and retention metadata.

### 3. IMPLEMENT_OR_REUSE_LOCAL_STORE

Reuse the proven store if one exists; otherwise implement the approved dedicated local preview-result store.

### 4. ADD_SINGLE_PERSISTENCE_COORDINATOR

Reuse a proven persistence bridge if one exists; otherwise add one narrow coordinator between the existing adapter and store.

### 5. CHANGE_EVENT_TO_IDENTITY_REFERENCE_ONLY

Ensure forge:quote-preview:extraction-ready carries the exact preview-result identity and no longer acts as the data store.

### 6. CONNECT_MODAL_READER

Open the existing confirmation modal by explicit identity and read through the single reader contract.

### 7. ADD_SYNTHETIC_CONTRACT_TESTS

Test exact identity selection, no hidden latest fallback, eight-field mapping, ambiguous fields, retention and no quote truth.

### 8. ROLLBACK_AND_DISABLE_PATH

Keep the current preview path recoverable by removing the coordinator wiring without deleting the existing extractor or modal.

## Authorization

- `IMPLEMENTATION_AUTHORIZATION_GATE_AUTHORIZED=true`
- `ADR_APPROVED=true`
- `IMPLEMENTATION_PLANNING_AUTHORIZED=true`
- `IMPLEMENTATION_AUTHORIZED=false`
- `CACHE_CREATION_AUTHORIZED=false`
- `BRIDGE_CREATION_AUTHORIZED=false`
- `UI_INTEGRATION_AUTHORIZED=false`
- `RUNTIME_WRITE_AUTHORIZED=false`

## Next gate

`107Z11_QUOTE_PREVIEW_PDF_RUNTIME_PERSISTENCE_IMPLEMENTATION_AUTHORIZATION_GATE`
