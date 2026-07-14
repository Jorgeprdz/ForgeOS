(() => {
  "use strict";

  const VERSION = "R16J0A";

  const WRAPPER_SELECTOR =
    '[data-forge-quote-acceptance-r16j0a="true"]';
  const BUTTON_SELECTOR =
    'button[data-forge-confirm-quote-r16j0a="true"]';
  const STATUS_SELECTOR =
    '[data-forge-confirm-quote-status-r16j0a="true"]';

  const LABELS = Object.freeze({
    BRIDGE_WAIT: "Preparando confirmación…",
    WAITING: "Confirmar cotización",
    READY: "Confirmar cotización",
    CONFIRMING: "Confirmando cotización…",
    ACCEPTED: "Cotización confirmada",
    ERROR: "Reintentar confirmación",
  });

  const MESSAGES = Object.freeze({
    BRIDGE_WAIT:
      "Conectando el motor de confirmación de cotización.",
    WAITING:
      "Carga y revisa una cotización para poder confirmarla.",
    READY:
      "Revisa los valores extraídos. Al confirmar se calculará y guardará sólo durante esta sesión.",
    CONFIRMING:
      "Validando los datos extraídos con el motor existente.",
    ACCEPTED:
      "Cotización confirmada. Ya puedes generar la presentación de venta.",
    ERROR:
      "No fue posible confirmar la cotización. Revisa los datos e inténtalo nuevamente.",
  });

  let state = "BRIDGE_WAIT";
  let busy = false;
  let lastError = null;
  let refreshTimer = 0;

  function getWrapper() {
    return document.querySelector(WRAPPER_SELECTOR);
  }

  function getButton() {
    return document.querySelector(BUTTON_SELECTOR);
  }

  function getStatus() {
    return document.querySelector(STATUS_SELECTOR);
  }

  function getBridge() {
    const bridge = globalThis.ForgeAcceptedQuoteBridge;

    if (!bridge || typeof bridge !== "object") {
      return null;
    }

    const required = [
      "getCurrentQuoteCandidate",
      "confirmCurrentQuoteCandidate",
      "getAcceptedQuoteReviewSnapshot",
    ];

    return required.every(
      (name) => typeof bridge[name] === "function",
    )
      ? bridge
      : null;
  }

  function safeCandidate(bridge) {
    try {
      return bridge?.getCurrentQuoteCandidate?.() || null;
    } catch {
      return null;
    }
  }

  function safeSnapshot(bridge) {
    try {
      return bridge?.getAcceptedQuoteReviewSnapshot?.() || null;
    } catch {
      return null;
    }
  }

  function setState(nextState, options = {}) {
    state = nextState;
    lastError = options.error || null;

    const wrapper = getWrapper();
    const button = getButton();
    const status = getStatus();

    if (!wrapper || !button || !status) {
      return;
    }

    const disabled = [
      "BRIDGE_WAIT",
      "WAITING",
      "CONFIRMING",
      "ACCEPTED",
    ].includes(nextState);

    button.disabled = disabled;
    button.setAttribute("aria-disabled", String(disabled));
    button.dataset.forgeQuoteAcceptanceStateR16j0a =
      nextState;
    button.textContent =
      LABELS[nextState] || LABELS.WAITING;

    wrapper.dataset.forgeQuoteAcceptanceStateR16j0a =
      nextState;

    status.dataset.forgeQuoteAcceptanceStateR16j0a =
      nextState;
    status.dataset.tone =
      nextState === "ERROR"
        ? "error"
        : nextState === "READY" ||
            nextState === "ACCEPTED"
          ? "success"
          : "neutral";

    status.textContent =
      nextState === "ERROR" && lastError?.message
        ? `${MESSAGES.ERROR} ${lastError.message}`
        : MESSAGES[nextState] || MESSAGES.WAITING;

    globalThis.dispatchEvent(
      new CustomEvent("forge:quote-acceptance-state", {
        detail: Object.freeze({
          version: VERSION,
          state: nextState,
          disabled,
          humanClickRequired: true,
          automaticAcceptance: false,
          automaticPresentation: false,
        }),
      }),
    );
  }

  function refreshPresentationHandoff() {
    const run = () => {
      globalThis.ForgeSalesPresentationEntrypointR16J0
        ?.refresh?.();
    };

    run();
    queueMicrotask(run);

    requestAnimationFrame(() => {
      run();
      window.setTimeout(run, 0);
      window.setTimeout(run, 120);
    });
  }

  function refresh() {
    if (busy) {
      return state;
    }

    const bridge = getBridge();

    if (!bridge) {
      setState("BRIDGE_WAIT");
      return state;
    }

    if (safeSnapshot(bridge)) {
      setState("ACCEPTED");
      refreshPresentationHandoff();
      return state;
    }

    if (safeCandidate(bridge)) {
      setState("READY");
      return state;
    }

    setState("WAITING");
    return state;
  }

  async function confirm() {
    if (busy) {
      return null;
    }

    const bridge = getBridge();

    if (!bridge) {
      setState("BRIDGE_WAIT");
      return null;
    }

    if (safeSnapshot(bridge)) {
      setState("ACCEPTED");
      return safeSnapshot(bridge);
    }

    if (!safeCandidate(bridge)) {
      setState("WAITING");
      return null;
    }

    busy = true;
    setState("CONFIRMING");

    try {
      const snapshot =
        await bridge.confirmCurrentQuoteCandidate();

      if (!snapshot) {
        throw new Error(
          "El motor no devolvió una cotización confirmada.",
        );
      }

      setState("ACCEPTED");
      refreshPresentationHandoff();

      return snapshot;
    } catch (error) {
      setState("ERROR", {
        error:
          error instanceof Error
            ? error
            : new Error(String(error)),
      });
      return null;
    } finally {
      busy = false;
    }
  }

  function bind() {
    const button = getButton();

    if (!button) {
      return false;
    }

    if (
      button.dataset.forgeQuoteAcceptanceBoundR16j0a !==
      "true"
    ) {
      button.dataset.forgeQuoteAcceptanceBoundR16j0a =
        "true";

      button.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
          void confirm();
        },
        { capture: true },
      );
    }

    window.clearInterval(refreshTimer);
    refreshTimer = window.setInterval(refresh, 250);
    refresh();

    return true;
  }

  function boot() {
    if (bind()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (bind()) {
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  globalThis.ForgeQuoteAcceptanceEntrypointR16J0A =
    Object.freeze({
      version: VERSION,
      refresh,
      confirm,
      refreshPresentationHandoff,
      getState: () => state,
      getLastError: () => lastError,
      safety: Object.freeze({
        humanClickRequired: true,
        automaticAcceptance: false,
        automaticPresentation: false,
        automaticApproval: false,
        automaticExport: false,
        automaticSend: false,
        inventedQuoteFacts: false,
      }),
    });

  globalThis.addEventListener(
    "forge:quote-candidate-ready",
    refresh,
  );
  globalThis.addEventListener(
    "forge:quote-candidate-cleared",
    refresh,
  );
  globalThis.addEventListener(
    "forge:accepted-quote-confirmed",
    () => {
      refresh();
      refreshPresentationHandoff();
    },
  );

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot,
      { once: true },
    );
  } else {
    boot();
  }
})();
