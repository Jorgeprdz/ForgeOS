"use strict";
(function(global) {
  const modules = {
0: [
function(require, module, exports) {
"use strict";

const {
  createQuotePreviewConfirmationPopup,
} = require(
  "./quote-preview-confirmation-popup-host.js"
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

function createQuotePreviewPdfFlowPopupInvocation(
  options = {}
) {
  const popup =
    createQuotePreviewConfirmationPopup(options);

  let disposed = false;
  let presentCount = 0;

  function present(input = {}) {
    fail(
      disposed === false,
      "QUOTE_PREVIEW_PDF_FLOW_INVOCATION_DISPOSED",
      "invocation disposed"
    );
    fail(
      isObject(input),
      "QUOTE_PREVIEW_PDF_FLOW_INPUT_REQUIRED",
      "present input required"
    );
    fail(
      isObject(input.nativeResult),
      "QUOTE_PREVIEW_PDF_FLOW_NATIVE_RESULT_REQUIRED",
      "nativeResult required"
    );
    fail(
      isObject(input.context),
      "QUOTE_PREVIEW_PDF_FLOW_CONTEXT_REQUIRED",
      "context required"
    );
    fail(
      input.ambiguity === undefined ||
        isObject(input.ambiguity),
      "QUOTE_PREVIEW_PDF_FLOW_AMBIGUITY_INVALID",
      "ambiguity must be an object when provided"
    );
    fail(
      input.source === undefined ||
        isObject(input.source),
      "QUOTE_PREVIEW_PDF_FLOW_SOURCE_INVALID",
      "source must be an object when provided"
    );

    const preview = Object.freeze({
      nativeResult: input.nativeResult,
      context: input.context,
      ambiguity:
        input.ambiguity === undefined
          ? Object.freeze({})
          : input.ambiguity,
      source:
        input.source === undefined
          ? Object.freeze({})
          : input.source,
    });

    const root = popup.open(preview);
    presentCount += 1;

    return Object.freeze({
      preview,
      root,
    });
  }

  function close(reason = "closed") {
    return popup.close(reason);
  }

  function dispose() {
    if (disposed) {
      return false;
    }

    const popupDisposed = popup.dispose();
    disposed = true;
    return popupDisposed;
  }

  function getState() {
    return Object.freeze({
      disposed,
      presentCount,
      popup: popup.getState(),
    });
  }

  return Object.freeze({
    present,
    close,
    dispose,
    getState,
  });
}

module.exports = Object.freeze({
  createQuotePreviewPdfFlowPopupInvocation,
});

},
{"./quote-preview-confirmation-popup-host.js":1}
],
1: [
function(require, module, exports) {
"use strict";

const {
  bindQuotePreviewConfirmationUiSurface,
} = require(
  "../../adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-surface-binding.js"
);

const {
  buildQuotePreviewPdfCanonicalPersistenceInput,
} = require(
  "../../adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js"
);

const FIELD_DEFINITIONS = Object.freeze([
  Object.freeze({ key: "name", label: "Nombre" }),
  Object.freeze({ key: "family", label: "Familia" }),
  Object.freeze({ key: "product", label: "Producto" }),
  Object.freeze({ key: "insured", label: "Asegurado" }),
  Object.freeze({
    key: "sumAssured",
    label: "Suma asegurada",
  }),
  Object.freeze({
    key: "annualPremium",
    label: "Prima anual",
  }),
  Object.freeze({
    key: "plannedOrAvePremium",
    label: "Prima planeada / AVE",
  }),
  Object.freeze({
    key: "coveragePeriod",
    label: "Periodo de cobertura",
  }),
]);

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

function applyStyles(node, styles) {
  if (!node || !isObject(node.style)) {
    return;
  }

  Object.assign(node.style, styles);
}

function setAttribute(node, name, value) {
  fail(
    node && typeof node.setAttribute === "function",
    "QUOTE_PREVIEW_POPUP_ATTRIBUTE_TARGET_INVALID",
    `${name} attribute target invalid`
  );

  node.setAttribute(name, value);
}

function append(parent, child) {
  fail(
    parent && typeof parent.appendChild === "function",
    "QUOTE_PREVIEW_POPUP_APPEND_TARGET_INVALID",
    "popup append target invalid"
  );

  parent.appendChild(child);
}

function formatDefault(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function fieldLabel(definition, fields) {
  const orvi = String(fields?.family || "").trim().toUpperCase() === "ORVI";
  if (orvi && definition.key === "plannedOrAvePremium") {
    return "Prima anual total con AVE";
  }
  if (orvi && definition.key === "coveragePeriod") {
    return "Plazo de aportación";
  }
  return definition.label;
}

function createQuotePreviewConfirmationPopup(options = {}) {
  const documentLike = options.documentLike;
  const mountTarget = options.mountTarget;
  const store = options.store;

  fail(
    isObject(documentLike) &&
      typeof documentLike.createElement === "function",
    "QUOTE_PREVIEW_POPUP_DOCUMENT_LIKE_REQUIRED",
    "documentLike.createElement required"
  );
  fail(
    isObject(mountTarget) &&
      typeof mountTarget.appendChild === "function" &&
      typeof mountTarget.removeChild === "function",
    "QUOTE_PREVIEW_POPUP_MOUNT_TARGET_REQUIRED",
    "mountTarget appendChild/removeChild required"
  );
  fail(
    isObject(store) &&
      typeof store.writePreviewResult === "function" &&
      typeof store.readPreviewResult === "function",
    "QUOTE_PREVIEW_POPUP_STORE_REQUIRED",
    "official store interface required"
  );
  fail(
    typeof options.createPreviewResultId === "function",
    "QUOTE_PREVIEW_POPUP_ID_FACTORY_REQUIRED",
    "createPreviewResultId required"
  );
  fail(
    typeof options.now === "function",
    "QUOTE_PREVIEW_POPUP_NOW_REQUIRED",
    "now required"
  );
  fail(
    Number.isFinite(options.ttlMs) && options.ttlMs > 0,
    "QUOTE_PREVIEW_POPUP_TTL_REQUIRED",
    "ttlMs must be a positive finite number"
  );

  const onPersisted = optionalFunction(
    options.onPersisted,
    "QUOTE_PREVIEW_POPUP_ON_PERSISTED_INVALID",
    "onPersisted"
  );
  const onEditRequested = optionalFunction(
    options.onEditRequested,
    "QUOTE_PREVIEW_POPUP_ON_EDIT_INVALID",
    "onEditRequested"
  );
  const onClosed = optionalFunction(
    options.onClosed,
    "QUOTE_PREVIEW_POPUP_ON_CLOSED_INVALID",
    "onClosed"
  );
  const onError = optionalFunction(
    options.onError,
    "QUOTE_PREVIEW_POPUP_ON_ERROR_INVALID",
    "onError"
  );
  const formatFieldValue =
    optionalFunction(
      options.formatFieldValue,
      "QUOTE_PREVIEW_POPUP_FORMATTER_INVALID",
      "formatFieldValue"
    ) || formatDefault;

  const title =
    typeof options.title === "string" &&
    options.title.trim().length > 0
      ? options.title.trim()
      : "Confirmar cotización";

  let disposed = false;
  let open = false;
  let pendingPreview = null;
  let root = null;
  let fieldsContainer = null;
  let acceptButton = null;
  let editButton = null;
  let surfaceBinding = null;
  let openCount = 0;
  let closeCount = 0;
  let lastCloseReason = null;

  function createElement(tagName) {
    const element = documentLike.createElement(tagName);

    fail(
      isObject(element),
      "QUOTE_PREVIEW_POPUP_ELEMENT_CREATION_FAILED",
      `failed to create ${tagName}`
    );

    return element;
  }

  function canonicalFields(preview) {
    fail(
      isObject(preview),
      "QUOTE_PREVIEW_POPUP_PREVIEW_REQUIRED",
      "preview required"
    );

    const fields =
      buildQuotePreviewPdfCanonicalPersistenceInput({
        nativeResult: preview.nativeResult,
        context: preview.context,
      });

    fail(
      isObject(fields) &&
        Object.keys(fields).length === FIELD_DEFINITIONS.length,
      "QUOTE_PREVIEW_POPUP_CANONICAL_FIELDS_INVALID",
      "exact canonical fields required"
    );

    return fields;
  }

  function renderFields(fields) {
    fail(
      fieldsContainer &&
        typeof fieldsContainer.removeChild === "function",
      "QUOTE_PREVIEW_POPUP_FIELDS_CONTAINER_INVALID",
      "fields container unavailable"
    );

    while (
      Array.isArray(fieldsContainer.children)
        ? fieldsContainer.children.length > 0
        : fieldsContainer.firstChild
    ) {
      const child = Array.isArray(fieldsContainer.children)
        ? fieldsContainer.children[0]
        : fieldsContainer.firstChild;
      fieldsContainer.removeChild(child);
    }

    for (const definition of FIELD_DEFINITIONS) {
      const row = createElement("div");
      const label = createElement("span");
      const value = createElement("span");

      setAttribute(
        row,
        "data-quote-preview-field",
        definition.key
      );
      setAttribute(
        label,
        "data-quote-preview-label",
        definition.key
      );
      setAttribute(
        value,
        "data-quote-preview-value",
        definition.key
      );

      row.className = "forge-quote-preview-popup__field";
      label.className =
        "forge-quote-preview-popup__field-label";
      value.className =
        "forge-quote-preview-popup__field-value";

      label.textContent = fieldLabel(definition, fields);
      value.textContent = String(
        formatFieldValue(
          fields[definition.key],
          definition.key,
          fields
        )
      );

      applyStyles(row, {
        display: "grid",
        gridTemplateColumns: "minmax(140px, 0.9fr) 1.4fr",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid rgba(148, 163, 184, 0.22)",
      });
      applyStyles(label, {
        fontWeight: "600",
        color: "#475569",
      });
      applyStyles(value, {
        textAlign: "right",
        color: "#0f172a",
        overflowWrap: "anywhere",
      });

      append(row, label);
      append(row, value);
      append(fieldsContainer, row);
    }
  }

  function closePopup(reason = "closed") {
    if (!open) {
      return false;
    }

    const previewAtClose = pendingPreview;

    if (surfaceBinding) {
      surfaceBinding.dispose();
    }

    mountTarget.removeChild(root);

    open = false;
    pendingPreview = null;
    surfaceBinding = null;
    root = null;
    fieldsContainer = null;
    acceptButton = null;
    editButton = null;
    closeCount += 1;
    lastCloseReason = reason;

    if (onClosed) {
      onClosed(reason, previewAtClose);
    }

    return true;
  }

  function buildPopup() {
    root = createElement("div");
    const panel = createElement("section");
    const heading = createElement("h2");
    fieldsContainer = createElement("div");
    const actions = createElement("div");
    editButton = createElement("button");
    acceptButton = createElement("button");

    setAttribute(root, "role", "dialog");
    setAttribute(root, "aria-modal", "true");
    setAttribute(
      root,
      "data-quote-preview-confirmation-popup",
      "true"
    );
    setAttribute(
      panel,
      "data-quote-preview-popup-panel",
      "true"
    );
    setAttribute(
      fieldsContainer,
      "data-quote-preview-fields",
      "true"
    );
    setAttribute(
      editButton,
      "data-quote-preview-action",
      "edit"
    );
    setAttribute(
      acceptButton,
      "data-quote-preview-action",
      "accept"
    );

    root.className = "forge-quote-preview-popup";
    panel.className = "forge-quote-preview-popup__panel";
    heading.className = "forge-quote-preview-popup__title";
    fieldsContainer.className =
      "forge-quote-preview-popup__fields";
    actions.className = "forge-quote-preview-popup__actions";
    editButton.className =
      "forge-quote-preview-popup__button forge-quote-preview-popup__button--edit";
    acceptButton.className =
      "forge-quote-preview-popup__button forge-quote-preview-popup__button--accept";

    heading.textContent = title;
    editButton.textContent = "Editar";
    acceptButton.textContent = "Aceptar";
    editButton.type = "button";
    acceptButton.type = "button";

    applyStyles(root, {
      position: "fixed",
      inset: "0",
      zIndex: "2147483000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "rgba(15, 23, 42, 0.62)",
      boxSizing: "border-box",
    });
    applyStyles(panel, {
      width: "min(680px, 100%)",
      maxHeight: "min(760px, calc(100vh - 40px))",
      overflow: "auto",
      padding: "24px",
      borderRadius: "18px",
      background: "#ffffff",
      boxShadow: "0 24px 80px rgba(15, 23, 42, 0.32)",
      boxSizing: "border-box",
    });
    applyStyles(heading, {
      margin: "0 0 18px",
      fontSize: "24px",
      lineHeight: "1.2",
      color: "#0f172a",
    });
    applyStyles(fieldsContainer, {
      display: "grid",
    });
    applyStyles(actions, {
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "22px",
    });
    applyStyles(editButton, {
      minWidth: "110px",
      padding: "11px 18px",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      background: "#ffffff",
      color: "#0f172a",
      fontWeight: "700",
      cursor: "pointer",
    });
    applyStyles(acceptButton, {
      minWidth: "110px",
      padding: "11px 18px",
      border: "1px solid #0f172a",
      borderRadius: "10px",
      background: "#0f172a",
      color: "#ffffff",
      fontWeight: "700",
      cursor: "pointer",
    });

    append(actions, editButton);
    append(actions, acceptButton);
    append(panel, heading);
    append(panel, fieldsContainer);
    append(panel, actions);
    append(root, panel);
  }

  function bindActions() {
    surfaceBinding =
      bindQuotePreviewConfirmationUiSurface({
        acceptTarget: acceptButton,
        editTarget: editButton,
        readPendingPreview() {
          fail(
            open && isObject(pendingPreview),
            "QUOTE_PREVIEW_POPUP_PENDING_REQUIRED",
            "pending preview unavailable"
          );

          return pendingPreview;
        },
        store,
        createPreviewResultId:
          options.createPreviewResultId,
        now: options.now,
        ttlMs: options.ttlMs,
        notifyPersisted(result, preview, payload) {
          if (onPersisted) {
            onPersisted(result, preview, payload);
          }

          closePopup("accepted");
        },
        notifyEditRequested(payload) {
          const preview = pendingPreview;

          if (onEditRequested) {
            onEditRequested(preview, payload);
          }

          closePopup("edit");
        },
        notifyError(error, context) {
          if (onError) {
            onError(error, context);
          }
        },
      });
  }

  function openPopup(preview) {
    fail(
      disposed === false,
      "QUOTE_PREVIEW_POPUP_DISPOSED",
      "popup disposed"
    );

    const fields = canonicalFields(preview);

    if (open) {
      pendingPreview = preview;
      renderFields(fields);
      openCount += 1;
      return root;
    }

    pendingPreview = preview;
    buildPopup();
    renderFields(fields);
    mountTarget.appendChild(root);
    open = true;

    try {
      bindActions();
    } catch (error) {
      mountTarget.removeChild(root);
      open = false;
      pendingPreview = null;
      root = null;
      fieldsContainer = null;
      acceptButton = null;
      editButton = null;
      surfaceBinding = null;
      throw error;
    }

    openCount += 1;
    return root;
  }

  function dispose() {
    if (disposed) {
      return false;
    }

    if (open) {
      closePopup("dispose");
    }

    disposed = true;
    return true;
  }

  function getState() {
    return Object.freeze({
      open,
      disposed,
      pendingPreviewPresent: isObject(pendingPreview),
      openCount,
      closeCount,
      lastCloseReason,
    });
  }

  return Object.freeze({
    open: openPopup,
    close: closePopup,
    dispose,
    getState,
  });
}

module.exports = Object.freeze({
  FIELD_DEFINITIONS,
  createQuotePreviewConfirmationPopup,
});

},
{"../../adapters/quote-preview/quote-preview-controlled-browser-confirmation-ui-surface-binding.js":2,"../../adapters/quote-preview/quote-preview-pdf-result-persistence-coordinator.js":5}
],
2: [
function(require, module, exports) {
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

},
{"./quote-preview-controlled-browser-confirmation-ui-wiring.js":3}
],
3: [
function(require, module, exports) {
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

},
{"./quote-preview-controlled-browser-confirmation-persistence-adapter.js":4}
],
4: [
function(require, module, exports) {
"use strict";

const coordinator = require(
  "./quote-preview-pdf-result-persistence-coordinator.js"
);
const contract = require(
  "./quote-preview-pdf-result-persistence-contract.js"
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

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertStore(store) {
  fail(
    isObject(store),
    "CONFIRMATION_PERSISTENCE_STORE_REQUIRED",
    "store required"
  );
  fail(
    typeof store.writePreviewResult === "function",
    "CONFIRMATION_PERSISTENCE_STORE_WRITE_REQUIRED",
    "store.writePreviewResult required"
  );
  fail(
    typeof store.readPreviewResult === "function",
    "CONFIRMATION_PERSISTENCE_STORE_READ_REQUIRED",
    "store.readPreviewResult required"
  );
}

function persistConfirmedQuotePreviewPdfResult(request = {}) {
  fail(
    request.confirmed === true,
    "QUOTE_PREVIEW_CONFIRMATION_REQUIRED",
    "explicit confirmation required"
  );

  const store = request.store;
  assertStore(store);

  const fields =
    coordinator.buildQuotePreviewPdfCanonicalPersistenceInput({
      nativeResult: request.nativeResult,
      context: request.context,
    });

  const recordInput = {
    previewResultId: request.previewResultId,
    schemaVersion: contract.SCHEMA_VERSION,
    createdAt: request.createdAt,
    expiresAt: request.expiresAt,
    fields,
    ambiguity: isObject(request.ambiguity)
      ? cloneJson(request.ambiguity)
      : {},
    source: isObject(request.source)
      ? cloneJson(request.source)
      : {},
  };

  const expectedRecord = contract.createRecord(recordInput);
  contract.validateRecord(expectedRecord);

  const identity = store.writePreviewResult(recordInput);

  fail(
    isObject(identity),
    "QUOTE_PREVIEW_PERSISTENCE_IDENTITY_REQUIRED",
    "store write identity required"
  );

  const readRecord = store.readPreviewResult(identity);
  const validatedRecord = contract.validateRecord(readRecord);

  fail(
    JSON.stringify(validatedRecord) === JSON.stringify(expectedRecord),
    "QUOTE_PREVIEW_PERSISTENCE_ROUND_TRIP_MISMATCH",
    "persisted record mismatch"
  );

  return Object.freeze({
    identity: Object.freeze(cloneJson(identity)),
    record: validatedRecord,
  });
}

module.exports = Object.freeze({
  persistConfirmedQuotePreviewPdfResult,
});

},
{"./quote-preview-pdf-result-persistence-coordinator.js":5,"./quote-preview-pdf-result-persistence-contract.js":6}
],
5: [
function(require, module, exports) {
(function(root,factory){var c=root.ForgeQuotePreviewPdfResultPersistenceContract,s=root.ForgeQuotePreviewPdfResultStore;if(typeof module==="object"&&module.exports){c=require("./quote-preview-pdf-result-persistence-contract.js");s=require("../../runtime/quote-preview/quote-preview-pdf-result-store.js");module.exports=factory(c,s);}else root.ForgeQuotePreviewPdfResultPersistenceCoordinator=factory(c,s);})(typeof globalThis!=="undefined"?globalThis:this,function(c,s){"use strict";
function bad(ok,code,msg){if(!ok){var e=new Error(msg);e.code=code;throw e;}}
function uuid(){return globalThis.crypto&&globalThis.crypto.randomUUID?globalThis.crypto.randomUUID():"preview-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);}
function create(o){o=o||{};var store=o.store||s.createStore(o.storeOptions),now=o.now||function(){return Date.now();},idFactory=o.idFactory||uuid,retention=Number(o.retentionMs);function persist(p,x){p=p||{};x=x||{};c.assertSafePayload(p);var created=x.createdAt?Date.parse(x.createdAt):now();bad(Number.isFinite(created),"CREATED_AT_INVALID","invalid createdAt");var ms=Number(x.retentionMs||retention),expires=x.expiresAt||p.expiresAt;bad(expires||(Number.isFinite(ms)&&ms>0),"RETENTION_POLICY_REQUIRED","retention required");expires=expires?new Date(expires).toISOString():new Date(created+ms).toISOString();return store.writePreviewResult({previewResultId:String(x.previewResultId||p.previewResultId||idFactory()),schemaVersion:c.SCHEMA_VERSION,createdAt:new Date(created).toISOString(),expiresAt:expires,fields:c.extractAuthorizedFields(p),ambiguity:p.ambiguity||(p.metadata&&p.metadata.ambiguity)||{},source:{extractorOwner:p.extractorOwner||null,adapterOwner:p.adapterOwner||null},quoteTruth:false,officialQuote:false});}function read(id){return store.readPreviewResult(c.normalizeIdentity(id));}function open(id,modal){bad(modal&&typeof modal.open==="function","CONFIRMATION_MODAL_API_REQUIRED","modal.open required");var r=read(id),payload=Object.assign({},r.fields,{ambiguity:r.ambiguity,previewResultIdentity:c.normalizeIdentity(id),persistenceMetadata:{createdAt:r.createdAt,expiresAt:r.expiresAt,schemaVersion:r.schemaVersion,quoteTruth:false}});modal.open(payload);return payload;}return Object.freeze({persistExtractionResult:persist,readForConfirmation:read,openConfirmationByIdentity:open,createExtractionReadyDetail:c.createExtractionReadyDetail});}
return Object.freeze({createCoordinator:create});
});

/* FORGE:107Z15E4R2_CANONICAL_BRIDGE_EXPORT_WRAPPER:START */
const {
  buildQuotePreviewPdfResultCanonicalPacket: __forge107z15e4r2BuildCanonicalPacket,
} = require("./quote-preview-pdf-result-canonical-bridge");

function buildQuotePreviewPdfCanonicalPersistenceInput(request = {}) {
  if (
    request === null
    || typeof request !== "object"
    || Array.isArray(request)
  ) {
    throw new TypeError("request must be a plain object");
  }

  return __forge107z15e4r2BuildCanonicalPacket(
    request.nativeResult ?? {},
    request.context ?? {},
  );
}

const __forge107z15e4r2PreviousExports = module.exports;
const __forge107z15e4r2NextExports = {
  ...__forge107z15e4r2PreviousExports,
  buildQuotePreviewPdfCanonicalPersistenceInput,
};

module.exports = Object.isFrozen(
  __forge107z15e4r2PreviousExports,
)
  ? Object.freeze(__forge107z15e4r2NextExports)
  : __forge107z15e4r2NextExports;
/* FORGE:107Z15E4R2_CANONICAL_BRIDGE_EXPORT_WRAPPER:END */

},
{"./quote-preview-pdf-result-persistence-contract.js":6,"../../runtime/quote-preview/quote-preview-pdf-result-store.js":7,"./quote-preview-pdf-result-canonical-bridge":8}
],
6: [
function(require, module, exports) {
(function(root,factory){var api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.ForgeQuotePreviewPdfResultPersistenceContract=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
var CONTRACT_ID="QUOTE_PREVIEW_PDF_RESULT_PERSISTENCE_V1",SCHEMA_VERSION="1",EVENT_NAME="forge:quote-preview:extraction-ready";
var REQUIRED_FIELDS=Object.freeze(["name", "family", "product", "insured", "sumAssured", "annualPremium", "plannedOrAvePremium", "coveragePeriod"]);
function err(ok,code,msg){if(!ok){var e=new Error(msg);e.code=code;throw e;}}
function obj(v){return !!v&&typeof v==="object"&&!Array.isArray(v);}
function clone(v){return JSON.parse(JSON.stringify(v));}
function scan(v,path){if(Array.isArray(v))return v.forEach(function(x,i){scan(x,path+"["+i+"]");});if(!obj(v))return;Object.keys(v).forEach(function(k){err(!["rawPdfBytes","providerSecrets","backendCredentials"].includes(k),"FORBIDDEN_PERSISTED_KEY","Forbidden key "+path+"."+k);if(k==="quoteTruth")err(v[k]===false,"QUOTE_TRUTH_PROHIBITED","quoteTruth must remain false");scan(v[k],path+"."+k);});}
function identity(x){x=x&&x.previewResultIdentity?x.previewResultIdentity:x;err(obj(x),"IDENTITY_REQUIRED","Explicit identity required");err(typeof x.previewResultId==="string"&&x.previewResultId.trim(),"PREVIEW_RESULT_ID_REQUIRED","previewResultId required");err(String(x.schemaVersion)===SCHEMA_VERSION,"SCHEMA_VERSION_MISMATCH","schemaVersion mismatch");return Object.freeze({previewResultId:x.previewResultId.trim(),schemaVersion:SCHEMA_VERSION});}
function fieldsFrom(p){err(obj(p),"EXTRACTION_PAYLOAD_REQUIRED","payload required");var c=[p.fields,p.extractedFields,p.result&&p.result.fields,p].find(function(x){return obj(x)&&REQUIRED_FIELDS.every(function(f){return Object.prototype.hasOwnProperty.call(x,f);});});err(c,"EIGHT_FIELDS_REQUIRED","all eight fields required");var out={};REQUIRED_FIELDS.forEach(function(f){out[f]=c[f];});return out;}
function validFields(f){err(obj(f)&&Object.keys(f).length===8,"EXACT_EIGHT_FIELDS_REQUIRED","exactly eight fields required");REQUIRED_FIELDS.forEach(function(k){err(Object.prototype.hasOwnProperty.call(f,k),"MISSING_AUTHORIZED_FIELD","missing "+k);});Object.keys(f).forEach(function(k){err(REQUIRED_FIELDS.includes(k),"UNAUTHORIZED_FIELD","unauthorized "+k);});scan(f,"$.fields");return clone(f);}
function iso(v,code){err(typeof v==="string"&&!Number.isNaN(Date.parse(v)),code,code);return new Date(v).toISOString();}
function record(i){err(obj(i),"RECORD_INPUT_REQUIRED","record required");scan(i,"$");var id=identity(i),created=iso(i.createdAt,"CREATED_AT_REQUIRED"),expires=iso(i.expiresAt,"EXPIRES_AT_REQUIRED");err(Date.parse(expires)>Date.parse(created),"RETENTION_WINDOW_INVALID","invalid retention");return Object.freeze({previewResultId:id.previewResultId,schemaVersion:id.schemaVersion,createdAt:created,expiresAt:expires,fields:validFields(i.fields),ambiguity:obj(i.ambiguity)?clone(i.ambiguity):{},source:obj(i.source)?clone(i.source):{},metadata:{quoteTruth:false,officialQuote:false,rawPdfStored:false,contractId:CONTRACT_ID}});}
function detail(id){return Object.freeze({previewResultIdentity:identity(id),persistenceContractId:CONTRACT_ID,__forgePersistenceIdentityEvent:true});}
return Object.freeze({CONTRACT_ID:CONTRACT_ID,SCHEMA_VERSION:SCHEMA_VERSION,EVENT_NAME:EVENT_NAME,REQUIRED_FIELDS:REQUIRED_FIELDS,normalizeIdentity:identity,assertSafePayload:function(v){scan(v,"$");return true;},extractAuthorizedFields:fieldsFrom,createRecord:record,validateRecord:record,createExtractionReadyDetail:detail,isIdentityEventDetail:function(d){return !!(d&&d.__forgePersistenceIdentityEvent===true&&d.persistenceContractId===CONTRACT_ID&&d.previewResultIdentity);}});});

},
{}
],
7: [
function(require, module, exports) {
(function(root,factory){var c=root.ForgeQuotePreviewPdfResultPersistenceContract;if(typeof module==="object"&&module.exports){c=require("../../adapters/quote-preview/quote-preview-pdf-result-persistence-contract.js");module.exports=factory(c);}else root.ForgeQuotePreviewPdfResultStore=factory(c);})(typeof globalThis!=="undefined"?globalThis:this,function(c){"use strict";
function bad(ok,code,msg){if(!ok){var e=new Error(msg);e.code=code;throw e;}}
function memory(){var m=new Map();return{getItem:function(k){return m.has(k)?m.get(k):null;},setItem:function(k,v){m.set(k,String(v));},removeItem:function(k){m.delete(k);},keys:function(){return Array.from(m.keys());}};}
function local(s){s=s||(typeof globalThis!=="undefined"?globalThis.localStorage:null);bad(s&&s.getItem&&s.setItem&&s.removeItem,"LOCAL_STORAGE_UNAVAILABLE","localStorage required");return{getItem:function(k){return s.getItem(k);},setItem:function(k,v){s.setItem(k,v);},removeItem:function(k){s.removeItem(k);},keys:function(){var a=[];for(var i=0;i<s.length;i++){var k=s.key(i);if(typeof k==="string")a.push(k);}return a;}};}
function create(o){o=o||{};var b=o.backend||local(),ns=o.namespace||"forge.quotePreview.pdfResult.v1",now=o.now||function(){return Date.now();};function key(id){id=c.normalizeIdentity(id);return ns+":"+encodeURIComponent(id.schemaVersion)+":"+encodeURIComponent(id.previewResultId);}function purge(){(b.keys?b.keys():[]).forEach(function(k){if(k.indexOf(ns+":")!==0)return;var raw=b.getItem(k);try{var r=JSON.parse(raw);if(Date.parse(r.expiresAt)<=now())b.removeItem(k);}catch(e){b.removeItem(k);}});}function write(i){var r=c.createRecord(i);purge();b.setItem(key(r),JSON.stringify(r));return c.normalizeIdentity(r);}function read(id){id=c.normalizeIdentity(id);var k=key(id),raw=b.getItem(k);bad(raw!==null,"PREVIEW_RESULT_NOT_FOUND","result not found");var r;try{r=JSON.parse(raw);}catch(e){bad(false,"PREVIEW_RESULT_INVALID_JSON","invalid json");}r=c.validateRecord(r);if(Date.parse(r.expiresAt)<=now()){b.removeItem(k);bad(false,"PREVIEW_RESULT_EXPIRED","result expired");}return JSON.parse(JSON.stringify(r));}return Object.freeze({writePreviewResult:write,readPreviewResult:read});}
return Object.freeze({createMemoryBackend:memory,createLocalStorageBackend:local,createStore:create});
});

},
{"../../adapters/quote-preview/quote-preview-pdf-result-persistence-contract.js":6}
],
8: [
function(require, module, exports) {
"use strict";

const {
  assertSafePayload,
} = require("./quote-preview-pdf-result-persistence-contract");

const QUOTE_PREVIEW_PDF_CANONICAL_FIELDS = Object.freeze([
  "name",
  "family",
  "product",
  "insured",
  "sumAssured",
  "annualPremium",
  "plannedOrAvePremium",
  "coveragePeriod",
]);

function assertPlainRecord(value, label) {
  if (
    value === null
    || typeof value !== "object"
    || Array.isArray(value)
  ) {
    throw new TypeError(`${label} must be a plain object`);
  }
}

function preserveNull(value) {
  return value === undefined ? null : value;
}

function isOrviFamily(value) {
  return String(value || "").trim().toUpperCase() === "ORVI";
}

function assertContractAcceptance(packet) {
  const result = assertSafePayload(packet);

  if (
    result === false
    || (
      result
      && typeof result === "object"
      && (
        result.valid === false
        || result.ok === false
      )
    )
  ) {
    throw new TypeError(
      "Quote Preview persistence contract rejected canonical packet",
    );
  }

  return packet;
}

function buildQuotePreviewPdfResultCanonicalPacket(nativeResult = {}, context = {}) {
  assertPlainRecord(nativeResult, "nativeResult");
  assertPlainRecord(context, "context");

  const premiumTable = (
    nativeResult.premiumTable
    && typeof nativeResult.premiumTable === "object"
    && !Array.isArray(nativeResult.premiumTable)
  )
    ? nativeResult.premiumTable
    : {};

  const sourceFamily = context.productFamily ?? context.product_family;
  const orvi = isOrviFamily(sourceFamily);
  const packet = {
    name: preserveNull(context.name),
    family: preserveNull(orvi ? "ORVI" : sourceFamily),
    product: preserveNull(nativeResult.product),
    insured: preserveNull(nativeResult.prospect),
    sumAssured: preserveNull(nativeResult.sumInsured),
    annualPremium: preserveNull(premiumTable.annual),
    plannedOrAvePremium: preserveNull(
      premiumTable.plannedAnnual,
    ),
    coveragePeriod: preserveNull(
      orvi ? nativeResult.paymentTerm : nativeResult.policyTerm,
    ),
  };

  return assertContractAcceptance(packet);
}

module.exports = {
  QUOTE_PREVIEW_PDF_CANONICAL_FIELDS,
  buildQuotePreviewPdfResultCanonicalPacket,
};

},
{"./quote-preview-pdf-result-persistence-contract":6}
]
  };
  const cache = Object.create(null);

  function load(id) {
    if (cache[id]) return cache[id].exports;

    const tuple = modules[id];
    if (!tuple) {
      throw new Error("Unknown bundled module: " + id);
    }

    const module = { exports: {} };
    cache[id] = module;

    const factory = tuple[0];
    const dependencyMap = tuple[1];

    function localRequire(request) {
      if (!Object.prototype.hasOwnProperty.call(
        dependencyMap,
        request
      )) {
        throw new Error(
          "Unknown dependency: " + request +
          " in module " + id
        );
      }
      return load(dependencyMap[request]);
    }

    factory(localRequire, module, module.exports);
    return module.exports;
  }

  const invocation = load(0);
  const store = load(7);

  global.ForgeQuotePreviewLive = Object.freeze({
    createQuotePreviewPdfFlowPopupInvocation:
      invocation.createQuotePreviewPdfFlowPopupInvocation,
    createMemoryBackend:
      store.createMemoryBackend,
    createStore:
      store.createStore
  });
})(typeof window !== "undefined" ? window : globalThis);
