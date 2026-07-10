"use strict";

const {
  bindQuotePreviewConfirmationPersistenceUi,
} = require(
  "./quote-preview-controlled-browser-confirmation-ui-wiring.js"
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

function assertTarget(target, prefix) {
  fail(
    isObject(target),
    `QUOTE_PREVIEW_${prefix}_TARGET_REQUIRED`,
    `${prefix.toLowerCase()} target required`
  );
  fail(
    typeof target.addEventListener === "function",
    `QUOTE_PREVIEW_${prefix}_TARGET_ADD_REQUIRED`,
    `${prefix.toLowerCase()} target addEventListener required`
  );
  fail(
    typeof target.removeEventListener === "function",
    `QUOTE_PREVIEW_${prefix}_TARGET_REMOVE_REQUIRED`,
    `${prefix.toLowerCase()} target removeEventListener required`
  );
}

function assertEventName(value, code, name) {
  fail(
    typeof value === "string" &&
      value.trim().length > 0,
    code,
    `${name} must be a non-empty string`
  );

  return value.trim();
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

function bindQuotePreviewConfirmationUiSurface(options = {}) {
  const acceptTarget = options.acceptTarget;
  const editTarget = options.editTarget;

  assertTarget(acceptTarget, "ACCEPT");
  assertTarget(editTarget, "EDIT");

  fail(
    typeof options.readPendingPreview === "function",
    "QUOTE_PREVIEW_SURFACE_READ_PENDING_REQUIRED",
    "readPendingPreview required"
  );

  const acceptEventName = assertEventName(
    options.acceptEventName === undefined
      ? "click"
      : options.acceptEventName,
    "QUOTE_PREVIEW_ACCEPT_EVENT_NAME_INVALID",
    "acceptEventName"
  );

  const editEventName = assertEventName(
    options.editEventName === undefined
      ? "click"
      : options.editEventName,
    "QUOTE_PREVIEW_EDIT_EVENT_NAME_INVALID",
    "editEventName"
  );

  const notifyPersisted = optionalFunction(
    options.notifyPersisted,
    "QUOTE_PREVIEW_SURFACE_NOTIFY_PERSISTED_INVALID",
    "notifyPersisted"
  );
  const notifyEditRequested = optionalFunction(
    options.notifyEditRequested,
    "QUOTE_PREVIEW_SURFACE_NOTIFY_EDIT_INVALID",
    "notifyEditRequested"
  );
  const notifyError = optionalFunction(
    options.notifyError,
    "QUOTE_PREVIEW_SURFACE_NOTIFY_ERROR_INVALID",
    "notifyError"
  );

  const surface = {
    subscribeAccept(handler) {
      acceptTarget.addEventListener(
        acceptEventName,
        handler
      );

      let active = true;

      return function unsubscribeAccept() {
        if (!active) {
          return false;
        }

        active = false;
        acceptTarget.removeEventListener(
          acceptEventName,
          handler
        );

        return true;
      };
    },

    subscribeEdit(handler) {
      editTarget.addEventListener(
        editEventName,
        handler
      );

      let active = true;

      return function unsubscribeEdit() {
        if (!active) {
          return false;
        }

        active = false;
        editTarget.removeEventListener(
          editEventName,
          handler
        );

        return true;
      };
    },

    readPendingPreview: options.readPendingPreview,
  };

  if (notifyPersisted) {
    surface.notifyPersisted = notifyPersisted;
  }

  if (notifyEditRequested) {
    surface.notifyEditRequested = notifyEditRequested;
  }

  if (notifyError) {
    surface.notifyError = notifyError;
  }

  const binding =
    bindQuotePreviewConfirmationPersistenceUi({
      surface,
      store: options.store,
      createPreviewResultId:
        options.createPreviewResultId,
      now: options.now,
      ttlMs: options.ttlMs,
    });

  return Object.freeze({
    dispose: binding.dispose,
    getState: binding.getState,
  });
}

module.exports = Object.freeze({
  bindQuotePreviewConfirmationUiSurface,
});
