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
  fieldLabel,
});
