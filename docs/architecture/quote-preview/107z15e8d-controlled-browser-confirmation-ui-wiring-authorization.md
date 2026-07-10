# 107Z15E8D Controlled Browser Confirmation UI Wiring Authorization

Status: PASS

## Decision

`AUTHORIZE_DEDICATED_CONFIRMATION_UI_ACTION_WIRING`

Further entrypoint discovery is closed for this scope. The implementation must create one dedicated, injected UI-action wiring module.

## Scope ID

`QUOTE_PREVIEW_CONTROLLED_BROWSER_CONFIRMATION_UI_WIRING_V1`

## Authorized source files

- `platform/adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-wiring.js`
- `platform/adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-wiring.test.js`

No other runtime source file may be changed.

## Authorized export

`bindQuotePreviewConfirmationPersistenceUi`

Signature:

`function bindQuotePreviewConfirmationPersistenceUi(options = {})`

## Surface contract

The UI surface is injected and must expose:

- `subscribeAccept(handler)`
- `subscribeEdit(handler)`
- `readPendingPreview()`

Optional notifications:

- `notifyPersisted(result)`
- `notifyEditRequested(payload)`
- `notifyError(error)`

The wiring must not query `window`, `document`, DOM selectors, or `localStorage`.

## Authorized flow

1. validate the injected surface contract
2. validate the injected official store interface
3. subscribe exactly one accept handler and one edit handler
4. accept handler reads the pending preview from surface.readPendingPreview()
5. accept handler creates previewResultId, createdAt, and expiresAt from injected factories
6. accept handler calls persistConfirmedQuotePreviewPdfResult with confirmed: true
7. accept handler notifies surface.notifyPersisted when provided
8. edit handler never calls the persistence adapter or store
9. edit handler notifies surface.notifyEditRequested when provided
10. dispose unsubscribes both handlers and is idempotent
11. duplicate accept while a persistence call is active is rejected

## Action invariants

- Accept persists only through the existing confirmed persistence adapter.
- Accept always passes `confirmed: true`.
- Edit performs zero persistence calls and zero store writes.
- Duplicate concurrent accept is blocked.
- Dispose is idempotent.

## Prohibited scope

- any runtime source file other than the two allowed files
- the confirmed persistence adapter
- the persistence coordinator
- the persistence contract
- the persistence store
- utils.js
- manager-os/provider-runtime/provider-runtime-boundary-contract.js
- DOM selectors or direct browser-global access
- direct localStorage access
- modal rendering
- new extraction engine
- generic cross-domain bridge
- hardcoded canonical quote fields
- persistence on edit
- persistence before explicit accept
- promotion of PDF extraction to official quote truth

## Next gate

`107Z15E8E_CONTROLLED_BROWSER_CONFIRMATION_UI_WIRING_SCOPED_IMPLEMENTATION_GATE`
