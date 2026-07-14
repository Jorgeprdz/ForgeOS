(() => {
  "use strict";

  const VERSION = "R16J0";
  const BUTTON_SELECTOR =
    'button[data-forge-sales-presentation-entrypoint-r16j0="true"]';
  const STATUS_SELECTOR =
    '[data-forge-sales-presentation-entrypoint-status-r16j0="true"]';

  const LABELS = Object.freeze({
    BRIDGE_WAIT: "Preparando presentación…",
    NO_QUOTE: "Generar presentación de venta",
    READY: "Generar presentación de venta",
    GENERATING: "Generando presentación…",
    SESSION_READY: "Abrir presentación de venta",
    ERROR: "Reintentar presentación de venta",
  });

  const MESSAGES = Object.freeze({
    BRIDGE_WAIT: "Conectando el motor de revisión comercial.",
    NO_QUOTE:
      "Confirma primero una cotización. El botón se habilitará cuando exista contexto aceptado.",
    READY:
      "Cotización aceptada. Se creará una sesión editable y sin exportación automática.",
    GENERATING:
      "Construyendo contexto, prompt y plan de diapositivas con datos existentes.",
    SESSION_READY:
      "La sesión editable está disponible. Aprobar y exportar siguen siendo decisiones humanas.",
    ERROR:
      "No fue posible abrir la presentación. Revisa la cotización y vuelve a intentarlo.",
  });

  let state = "BRIDGE_WAIT";
  let busy = false;
  let lastError = null;
  let refreshTimer = 0;
  let observedButton = null;
  let buttonObserver = null;
  let reconcileQueued = false;

  function getButton() {
    return document.querySelector(BUTTON_SELECTOR);
  }

  function getStatus() {
    return document.querySelector(STATUS_SELECTOR);
  }

  function getBridge() {
    const bridge = globalThis.ForgeAcceptedQuoteBridge;
    if (!bridge || typeof bridge !== "object") return null;

    const required = [
      "startSalesPresentationReviewSession",
      "getCurrentSalesPresentationReviewState",
      "getAcceptedQuoteReviewSnapshot",
    ];

    return required.every((name) => typeof bridge[name] === "function")
      ? bridge
      : null;
  }

  function getPreviewApi() {
    const preview = globalThis.ForgeSalesPresentationEditablePreview;
    return preview &&
      typeof preview.openSalesPresentationReviewUi === "function"
      ? preview
      : null;
  }

  function getProspectContext() {
    const value = document
      .querySelector("#fq-objective-105dr")
      ?.value?.trim();

    return value
      ? Object.freeze({ documentedContext: value })
      : null;
  }

  function safeCurrentSession(bridge) {
    try {
      return bridge?.getCurrentSalesPresentationReviewState?.() || null;
    } catch {
      return null;
    }
  }

  function safeAcceptedSnapshot(bridge) {
    try {
      return bridge?.getAcceptedQuoteReviewSnapshot?.() || null;
    } catch {
      return null;
    }
  }

  function isInteractiveState(candidate = state) {
    return [
      "READY",
      "SESSION_READY",
      "ERROR",
    ].includes(candidate);
  }

  function isDisabledState(candidate = state) {
    return [
      "BRIDGE_WAIT",
      "NO_QUOTE",
      "GENERATING",
    ].includes(candidate);
  }

  function setAttributeIfDifferent(element, name, value) {
    if (!element) return;

    if (value === null) {
      if (element.hasAttribute(name)) {
        element.removeAttribute(name);
      }
      return;
    }

    const next = String(value);
    if (element.getAttribute(name) !== next) {
      element.setAttribute(name, next);
    }
  }

  function reconcileButtonOwnership(button = getButton()) {
    if (!button) return;

    const interactive = isInteractiveState();
    const disabled = isDisabledState();

    if (
      button.classList.contains("fq-disabled-105dr") ===
      interactive
    ) {
      button.classList.toggle(
        "fq-disabled-105dr",
        !interactive,
      );
    }

    if (button.hidden) button.hidden = false;
    if (button.hasAttribute("hidden")) {
      button.removeAttribute("hidden");
    }

    if (button.disabled !== disabled) {
      button.disabled = disabled;
    }

    if (disabled) {
      setAttributeIfDifferent(button, "disabled", "");
    } else {
      setAttributeIfDifferent(button, "disabled", null);
    }

    setAttributeIfDifferent(
      button,
      "aria-disabled",
      String(disabled),
    );
    setAttributeIfDifferent(
      button,
      "data-forge-presentation-generation-allowed",
      String(interactive),
    );
    setAttributeIfDifferent(
      button,
      "data-forge-prompt-generation-allowed",
      String(interactive),
    );
    setAttributeIfDifferent(
      button,
      "data-forge-sales-presentation-visible-r16j0",
      String(interactive),
    );
    setAttributeIfDifferent(
      button,
      "data-forge-sales-presentation-state-r16j0",
      state,
    );
  }

  function queueButtonReconciliation(button = getButton()) {
    if (!button || reconcileQueued) return;

    reconcileQueued = true;
    queueMicrotask(() => {
      reconcileQueued = false;
      reconcileButtonOwnership(button);
    });
  }

  function observeButtonOwnership(button) {
    if (!button) return;

    if (observedButton === button && buttonObserver) {
      queueButtonReconciliation(button);
      return;
    }

    buttonObserver?.disconnect();
    observedButton = button;

    buttonObserver = new MutationObserver(() => {
      queueButtonReconciliation(button);
    });

    buttonObserver.observe(button, {
      attributes: true,
      attributeFilter: [
        "disabled",
        "hidden",
        "class",
        "aria-disabled",
        "data-forge-presentation-generation-allowed",
        "data-forge-prompt-generation-allowed",
        "data-forge-sales-presentation-visible-r16j0",
        "data-forge-sales-presentation-state-r16j0",
      ],
    });

    queueButtonReconciliation(button);
  }

  function setState(nextState, options = {}) {
    state = nextState;
    lastError = options.error || null;

    const button = getButton();
    const status = getStatus();
    if (!button || !status) return;

    const disabled = ["BRIDGE_WAIT", "NO_QUOTE", "GENERATING"].includes(
      nextState,
    );

    const interactive = isInteractiveState(nextState);

    button.classList.toggle(
      "fq-disabled-105dr",
      !interactive,
    );
    button.hidden = false;
    button.removeAttribute("hidden");
    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    button.setAttribute(
      "data-forge-presentation-generation-allowed",
      String(interactive),
    );
    button.setAttribute(
      "data-forge-prompt-generation-allowed",
      String(interactive),
    );
    button.dataset.forgeSalesPresentationStateR16j0 = nextState;
    button.dataset.forgeSalesPresentationVisibleR16j0 =
      String(interactive);
    button.textContent = LABELS[nextState] || LABELS.NO_QUOTE;
    observeButtonOwnership(button);
    queueButtonReconciliation(button);

    status.dataset.forgeSalesPresentationStateR16j0 = nextState;
    status.dataset.tone =
      nextState === "ERROR"
        ? "error"
        : nextState === "READY" || nextState === "SESSION_READY"
          ? "success"
          : "neutral";
    status.textContent =
      nextState === "ERROR" && lastError?.message
        ? `${MESSAGES.ERROR} ${lastError.message}`
        : MESSAGES[nextState] || MESSAGES.NO_QUOTE;

    globalThis.dispatchEvent(
      new CustomEvent("forge:sales-presentation-entrypoint-state", {
        detail: Object.freeze({
          version: VERSION,
          state: nextState,
          disabled,
          hasError: Boolean(lastError),
          approvalAutomatic: false,
          exportAutomatic: false,
          sendAutomatic: false,
          quoteMutationAllowed: false,
        }),
      }),
    );
  }

  function openExistingSession() {
    const preview = getPreviewApi();
    if (!preview) {
      throw new Error("El preview editable no terminó de cargar.");
    }

    if (!preview.openSalesPresentationReviewUi()) {
      throw new Error("La sesión existe, pero el preview no pudo abrirse.");
    }
  }

  function refresh() {
    if (busy) return state;

    const button = getButton();
    const status = getStatus();
    if (!button || !status) return state;

    const bridge = getBridge();
    if (!bridge) {
      setState("BRIDGE_WAIT");
      return state;
    }

    const currentSession = safeCurrentSession(bridge);
    if (currentSession) {
      setState("SESSION_READY");
      return state;
    }

    const snapshot = safeAcceptedSnapshot(bridge);
    if (snapshot) {
      setState("READY");
      return state;
    }

    setState("NO_QUOTE");
    return state;
  }

  async function activate() {
    if (busy) return;

    const bridge = getBridge();
    if (!bridge) {
      setState("BRIDGE_WAIT");
      return;
    }

    try {
      const existing = safeCurrentSession(bridge);
      if (existing) {
        openExistingSession();
        setState("SESSION_READY");
        return;
      }

      if (!safeAcceptedSnapshot(bridge)) {
        setState("NO_QUOTE");
        return;
      }

      busy = true;
      setState("GENERATING");

      await Promise.resolve();

      const reviewState = bridge.startSalesPresentationReviewSession({
        prospectContext: getProspectContext(),
      });

      if (!reviewState) {
        throw new Error(
          "La cotización todavía no contiene todos los artefactos para revisión.",
        );
      }

      openExistingSession();
      setState("SESSION_READY");
    } catch (error) {
      setState("ERROR", {
        error: error instanceof Error
          ? error
          : new Error(String(error)),
      });
    } finally {
      busy = false;
    }
  }

  function bind() {
    const button = getButton();
    if (!button) return false;

    if (button.dataset.forgeSalesPresentationBoundR16j0 !== "true") {
      button.dataset.forgeSalesPresentationBoundR16j0 = "true";
      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          void activate();
        },
        { capture: true },
      );
    }

    observeButtonOwnership(button);

    window.clearInterval(refreshTimer);
    refreshTimer = window.setInterval(() => {
      refresh();
      queueButtonReconciliation(button);
    }, 250);
    refresh();
    queueButtonReconciliation(button);
    return true;
  }

  function boot() {
    if (bind()) return;

    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  globalThis.ForgeSalesPresentationEntrypointR16J0 = Object.freeze({
    version: VERSION,
    refresh,
    activate,
    getState: () => state,
    getLastError: () => lastError,
    safety: Object.freeze({
      approvalAutomatic: false,
      exportAutomatic: false,
      sendAutomatic: false,
      quoteMutationAllowed: false,
      humanReviewRequired: true,
    }),
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
