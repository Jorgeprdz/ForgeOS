"use strict";

(() => {
  const STATES = Object.freeze({
    EMPTY: "EMPTY",
    LOADING: "LOADING",
    ERROR: "ERROR",
    READY: "READY",
  });
  const PACKET_EVENT_014 = "forge:accepted-quote-packet-ready";

  const root = document.querySelector(
    '[data-forge-module="dedicated-new-quote-static-route"]',
  );
  const input = document.getElementById("fq-solution-online-pdf-105dr");
  const upload = document.querySelector(".fq-upload-105dr");
  const label = document.querySelector(
    'label[for="fq-solution-online-pdf-105dr"]',
  );
  const submit = document.querySelector(".fq-send-pdf-105dr");
  const status = document.querySelector(".fq-file-status-105dr");
  const results = document.querySelector("[data-forge-intake-results]");

  if (!root || !input || !upload || !label || !submit || !status || !results) {
    console.error("[R16A_QUOTE_INTAKE_STATE] Required intake surfaces were not found.");
    return;
  }

  const initialResultsMarkup = results.innerHTML;
  let currentState = null;
  let lastReviewPacket014 = null;

  function restoreInitialResults() {
    results.innerHTML = initialResultsMarkup;
    document.body.removeAttribute("data-forge-benefit-layout-expanded");
  }

  function normalizeState(nextState) {
    const state = String(nextState || "").trim().toUpperCase();
    if (!Object.hasOwn(STATES, state)) {
      throw new TypeError(`Unsupported quote intake state: ${nextState}`);
    }
    return STATES[state];
  }

  function setState(nextState, options = {}) {
    const state = normalizeState(nextState);
    const ready = state === STATES.READY;
    const loading = state === STATES.LOADING;

    if (!ready && (currentState === STATES.READY || options.resetResults === true)) {
      restoreInitialResults();
    }

    currentState = state;
    const stateToken = state.toLowerCase();
    root.dataset.forgeIntakeState = stateToken;
    upload.dataset.forgeIntakeState = stateToken;
    upload.setAttribute("aria-busy", loading ? "true" : "false");

    results.hidden = !ready;
    results.setAttribute("aria-hidden", ready ? "false" : "true");

    submit.hidden = !ready;
    submit.setAttribute("aria-hidden", ready ? "false" : "true");
    const calculatorReady = Boolean(globalThis.ForgeQuoteCalculators);
    submit.disabled = !(ready && calculatorReady);
    submit.setAttribute("aria-disabled", String(submit.disabled));

    label.setAttribute("aria-disabled", loading ? "true" : "false");
    input.setAttribute("aria-busy", loading ? "true" : "false");

    status.setAttribute("role", state === STATES.ERROR ? "alert" : "status");
    status.setAttribute("aria-live", state === STATES.ERROR ? "assertive" : "polite");
    status.setAttribute("data-forge-state", stateToken);

    const defaultMessages = {
      [STATES.EMPTY]: "Selecciona un archivo para comenzar.",
      [STATES.LOADING]: "Procesando archivo localmente…",
      [STATES.ERROR]: "No se pudo procesar el archivo. Selecciona otro.",
    };
    const message = options.message || defaultMessages[state];
    if (message) status.textContent = message;

    root.dispatchEvent(new CustomEvent("forge:quote-intake-state-change", {
      detail: { state },
    }));
    return state;
  }

  function reset() {
    input.value = "";
    lastReviewPacket014 = null;
    setState(STATES.EMPTY, { resetResults: true });
  }

  function popupOpen014() {
    return Boolean(document.querySelector('[data-quote-preview-confirmation-popup="true"]'));
  }

  function openExistingReview014(packet) {
    if (!packet || packet === lastReviewPacket014 || popupOpen014()) return false;
    const runtime = globalThis.ForgeNuevaCotizacionAcceptedQuoteRuntime;
    const bridge = globalThis.ForgeAcceptedQuoteBridge;
    const reviewButton = runtime?.submit;
    const calculationState = bridge?.getCurrentQuotePreviewCalculationState?.();
    if (!reviewButton || calculationState?.candidateReady !== true) return false;

    lastReviewPacket014 = packet;
    const calculationPending = calculationState.state === "CALCULATING_PREVIEW";
    reviewButton.disabled = false;
    reviewButton.setAttribute("aria-disabled", "false");
    reviewButton.click();

    if (calculationPending) {
      reviewButton.disabled = true;
      reviewButton.setAttribute("aria-disabled", "true");
    }

    if (popupOpen014()) {
      status.textContent = "Datos encontrados. Revisa la información antes de confirmarla.";
      status.setAttribute("data-forge-state", "pending-review");
      setState(STATES.READY, { message: status.textContent });
    }
    return popupOpen014();
  }

  function scheduleHumanReview014(event) {
    const packet = event?.detail?.packet || null;
    globalThis.setTimeout(() => {
      if (openExistingReview014(packet)) return;
      globalThis.setTimeout(() => openExistingReview014(packet), 50);
    }, 0);
  }

  document.addEventListener("change", (event) => {
    if (event.target !== input) return;
    const file = input.files?.[0];
    if (!file) {
      setState(STATES.EMPTY, { resetResults: true });
      return;
    }
    lastReviewPacket014 = null;
    setState(STATES.LOADING, { resetResults: true });
  }, true);

  label.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    if (currentState === STATES.LOADING) return;
    event.preventDefault();
    input.click();
  });

  const parserStatusObserver = new MutationObserver(() => {
    const parserStatus = upload.querySelector("[data-forge-pdf-status='true']");
    if (parserStatus?.dataset?.tone !== "error") return;
    setState(STATES.ERROR, {
      message: "No se pudo procesar el PDF. Selecciona otro archivo.",
      resetResults: true,
    });
  });
  parserStatusObserver.observe(upload, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-tone"],
  });

  globalThis.addEventListener(PACKET_EVENT_014, scheduleHumanReview014);

  const api = Object.freeze({
    STATES,
    getState: () => currentState,
    setState,
    reset,
    repair014: Object.freeze({
      packetEvent: PACKET_EVENT_014,
      opensReviewBeforeCalculationCompletes: true,
      usesExistingAcceptanceBridge: true,
      createsQuoteAuthority: false,
      calculatesQuote: false,
      confirmsAutomatically: false,
      persistsAutomatically: false,
    }),
  });
  globalThis.ForgeQuoteIntakeState = api;
  setState(STATES.EMPTY);
})();