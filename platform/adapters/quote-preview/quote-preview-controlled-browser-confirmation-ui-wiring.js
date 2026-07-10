"use strict";

const {
  persistConfirmedQuotePreviewPdfResult,
} = require(
  "./quote-preview-controlled-browser-confirmation-persistence-adapter.js"
);

function fail(condition, code, message) {
  if (condition) {
    return;
  }

  const error = new Error(message);
  error.code = code;
  throw error;
}

function isObject(value) {
  return value !== null &&
    typeof value === "object" &&
    !Array.isArray(value);
}

function optionalFunction(value, code, name) {
  if (value === undefined) {
    return undefined;
  }

  fail(
    typeof value === "function",
    code,
    `${name} must be a function`
  );

  return value;
}

function assertSurface(surface) {
  fail(
    isObject(surface),
    "QUOTE_PREVIEW_UI_SURFACE_REQUIRED",
    "surface required"
  );
  fail(
    typeof surface.subscribeAccept === "function",
    "QUOTE_PREVIEW_UI_SUBSCRIBE_ACCEPT_REQUIRED",
    "surface.subscribeAccept required"
  );
  fail(
    typeof surface.subscribeEdit === "function",
    "QUOTE_PREVIEW_UI_SUBSCRIBE_EDIT_REQUIRED",
    "surface.subscribeEdit required"
  );
  fail(
    typeof surface.readPendingPreview === "function",
    "QUOTE_PREVIEW_UI_READ_PENDING_REQUIRED",
    "surface.readPendingPreview required"
  );
}

function assertStore(store) {
  fail(
    isObject(store),
    "QUOTE_PREVIEW_UI_STORE_REQUIRED",
    "store required"
  );
  fail(
    typeof store.writePreviewResult === "function",
    "QUOTE_PREVIEW_UI_STORE_WRITE_REQUIRED",
    "store.writePreviewResult required"
  );
  fail(
    typeof store.readPreviewResult === "function",
    "QUOTE_PREVIEW_UI_STORE_READ_REQUIRED",
    "store.readPreviewResult required"
  );
}

function cloneJson(value) {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value));
}

function bindQuotePreviewConfirmationPersistenceUi(options = {}) {
  const surface = options.surface;
  const store = options.store;

  assertSurface(surface);
  assertStore(store);

  fail(
    typeof options.createPreviewResultId === "function",
    "QUOTE_PREVIEW_UI_ID_FACTORY_REQUIRED",
    "createPreviewResultId required"
  );
  fail(
    typeof options.now === "function",
    "QUOTE_PREVIEW_UI_NOW_REQUIRED",
    "now required"
  );
  fail(
    Number.isFinite(options.ttlMs) && options.ttlMs > 0,
    "QUOTE_PREVIEW_UI_TTL_REQUIRED",
    "ttlMs must be a positive finite number"
  );

  const notifyPersisted = optionalFunction(
    surface.notifyPersisted,
    "QUOTE_PREVIEW_UI_NOTIFY_PERSISTED_INVALID",
    "surface.notifyPersisted"
  );
  const notifyEditRequested = optionalFunction(
    surface.notifyEditRequested,
    "QUOTE_PREVIEW_UI_NOTIFY_EDIT_INVALID",
    "surface.notifyEditRequested"
  );
  const notifyError = optionalFunction(
    surface.notifyError,
    "QUOTE_PREVIEW_UI_NOTIFY_ERROR_INVALID",
    "surface.notifyError"
  );

  let disposed = false;
  let acceptInFlight = false;
  let acceptCount = 0;
  let editCount = 0;
  let errorCount = 0;
  let lastIdentity = null;
  let lastErrorCode = null;
  let unsubscribeAccept = null;
  let unsubscribeEdit = null;

  function getState() {
    return Object.freeze({
      disposed,
      acceptInFlight,
      acceptCount,
      editCount,
      errorCount,
      lastIdentity: lastIdentity
        ? Object.freeze(cloneJson(lastIdentity))
        : null,
      lastErrorCode,
    });
  }

  function assertNotDisposed() {
    fail(
      disposed === false,
      "QUOTE_PREVIEW_UI_WIRING_DISPOSED",
      "wiring disposed"
    );
  }

  function handleAccept(payload) {
    assertNotDisposed();

    fail(
      acceptInFlight === false,
      "QUOTE_PREVIEW_ACCEPT_IN_FLIGHT",
      "accept persistence already in flight"
    );

    acceptInFlight = true;

    try {
      const pending = surface.readPendingPreview(payload);

      fail(
        isObject(pending),
        "QUOTE_PREVIEW_PENDING_REQUIRED",
        "pending preview required"
      );

      const previewResultId =
        options.createPreviewResultId(pending, payload);

      fail(
        typeof previewResultId === "string" &&
          previewResultId.trim().length > 0,
        "QUOTE_PREVIEW_UI_PREVIEW_RESULT_ID_REQUIRED",
        "previewResultId required"
      );

      const nowMs = options.now();

      fail(
        Number.isFinite(nowMs),
        "QUOTE_PREVIEW_UI_NOW_INVALID",
        "now must return a finite epoch value"
      );

      const createdAt = new Date(nowMs).toISOString();
      const expiresAt = new Date(
        nowMs + options.ttlMs
      ).toISOString();

      const result =
        persistConfirmedQuotePreviewPdfResult({
          confirmed: true,
          store,
          nativeResult: pending.nativeResult,
          context: pending.context,
          previewResultId,
          createdAt,
          expiresAt,
          ambiguity: isObject(pending.ambiguity)
            ? pending.ambiguity
            : {},
          source: isObject(pending.source)
            ? pending.source
            : {},
        });

      acceptCount += 1;
      lastIdentity = cloneJson(result.identity);
      lastErrorCode = null;

      if (notifyPersisted) {
        notifyPersisted(result, pending, payload);
      }

      return result;
    } catch (error) {
      errorCount += 1;
      lastErrorCode =
        error && typeof error.code === "string"
          ? error.code
          : "UNCLASSIFIED_ERROR";

      if (notifyError) {
        notifyError(error, {
          action: "accept",
          payload,
        });
      }

      throw error;
    } finally {
      acceptInFlight = false;
    }
  }

  function handleEdit(payload) {
    assertNotDisposed();

    editCount += 1;

    if (notifyEditRequested) {
      notifyEditRequested(payload);
    }

    return Object.freeze({
      action: "edit",
      persisted: false,
    });
  }

  unsubscribeAccept = surface.subscribeAccept(handleAccept);

  fail(
    typeof unsubscribeAccept === "function",
    "QUOTE_PREVIEW_UI_ACCEPT_UNSUBSCRIBE_REQUIRED",
    "subscribeAccept must return an unsubscribe function"
  );

  try {
    unsubscribeEdit = surface.subscribeEdit(handleEdit);

    fail(
      typeof unsubscribeEdit === "function",
      "QUOTE_PREVIEW_UI_EDIT_UNSUBSCRIBE_REQUIRED",
      "subscribeEdit must return an unsubscribe function"
    );
  } catch (error) {
    unsubscribeAccept();
    throw error;
  }

  function dispose() {
    if (disposed) {
      return false;
    }

    disposed = true;
    unsubscribeAccept();
    unsubscribeEdit();

    return true;
  }

  return Object.freeze({
    dispose,
    getState,
  });
}

module.exports = Object.freeze({
  bindQuotePreviewConfirmationPersistenceUi,
});
