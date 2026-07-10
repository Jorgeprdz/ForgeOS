# 107Z15E8P Real PDF Result Producer Handoff

Status: PASS

## Decision

`USE_EXISTING_INVOCATION_AS_FINAL_PRODUCER_HANDOFF_NO_NEW_WRAPPER`

## Final handoff

The existing invocation is already the correct production handoff:

- File: `platform/ui/quote-preview/quote-preview-pdf-flow-popup-invocation.js`
- Export: `createQuotePreviewPdfFlowPopupInvocation`
- Required call: `invocation.present({ nativeResult, context, ambiguity, source })`

No additional wrapper, bridge, popup host, or discovery layer is authorized.

## Why

The invocation already:

- accepts completed `nativeResult` and `context`;
- opens the existing confirmation pop-up;
- performs zero persistence during presentation;
- allows persistence only through **Aceptar**;
- preserves zero persistence for **Editar**;
- reads no PDF and runs no extraction or OCR.

Adding another wrapper would only move the same call one file farther away.

## Remaining product integration

The exact product host call site must be named before any runtime source change.

That host must already own the completed extraction result and must call:

```js
invocation.present({
  nativeResult,
  context,
  ambiguity,
  source,
});
```

## Forbidden

- Another invocation wrapper.
- Another popup host.
- Another generic bridge.
- Automatic producer discovery.
- Runtime source changes without an explicitly named product host call site.

## Next

`EXPLICIT_PRODUCT_HOST_CALL_SITE_REQUIRED`
