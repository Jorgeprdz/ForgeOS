# 107Z15E8F Controlled Browser Confirmation UI Surface Binding Authorization

Status: PASS

## Decision

`AUTHORIZE_EXPLICIT_TARGET_CONFIRMATION_UI_SURFACE_BINDING`

The existing UI-action wiring is implemented and tested. This gate authorizes a concrete surface binding that receives accept/edit targets explicitly, rather than discovering an entrypoint or querying the document.

## Scope ID

`QUOTE_PREVIEW_CONTROLLED_BROWSER_CONFIRMATION_UI_SURFACE_BINDING_V1`

## Authorized source files

- `platform/adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-surface-binding.js`
- `platform/adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-surface-binding.test.js`

No other runtime source file may be changed.

## Authorized export

`bindQuotePreviewConfirmationUiSurface`

Signature:

`function bindQuotePreviewConfirmationUiSurface(options = {})`

## Target contract

Both targets are injected EventTarget-like objects exposing:

- `addEventListener(eventName, handler)`
- `removeEventListener(eventName, handler)`

The module must not use `window`, `document`, `querySelector`, or `getElementById`.

## Authorized flow

1. validate acceptTarget and editTarget as EventTarget-like injected objects
2. validate readPendingPreview and optional notification callbacks
3. create an injected surface implementing subscribeAccept, subscribeEdit, and readPendingPreview
4. subscribeAccept must add exactly one listener to acceptTarget
5. subscribeEdit must add exactly one listener to editTarget
6. each unsubscribe must remove the exact listener it added
7. delegate action semantics to bindQuotePreviewConfirmationPersistenceUi
8. accept event must flow to confirmed persistence through existing wiring
9. edit event must produce zero persistence calls and zero store writes
10. dispose must remove both listeners exactly once
11. no document lookup, selector lookup, window access, or backend creation is permitted

## Event invariants

- Default accept event: `click`
- Default edit event: `click`
- Accept persists through the existing wiring.
- Edit performs zero persistence and zero store writes.
- Dispose removes the exact listeners that were registered.

## Prohibited scope

- any runtime source file other than the two allowed files
- the existing UI wiring module
- the confirmed persistence adapter
- the persistence coordinator
- the persistence contract
- the persistence store
- utils.js
- manager-os/provider-runtime/provider-runtime-boundary-contract.js
- document.querySelector or document.getElementById
- window or document globals
- direct localStorage access
- store or backend creation
- new extraction engine
- generic cross-domain bridge
- hardcoded canonical quote fields
- persistence on edit
- promotion of PDF extraction to official quote truth

## Next gate

`107Z15E8G_CONTROLLED_BROWSER_CONFIRMATION_UI_SURFACE_BINDING_SCOPED_IMPLEMENTATION_GATE`
