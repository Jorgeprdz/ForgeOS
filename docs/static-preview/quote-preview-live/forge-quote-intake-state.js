"use strict";

(() => {
  const STATES = Object.freeze({
    EMPTY: "EMPTY",
    LOADING: "LOADING",
    ERROR: "ERROR",
    READY: "READY",
  });

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
    setState(STATES.EMPTY, { resetResults: true });
  }

  document.addEventListener("change", (event) => {
    if (event.target !== input) return;
    const file = input.files?.[0];
    if (!file) {
      setState(STATES.EMPTY, { resetResults: true });
      return;
    }
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

  const api = Object.freeze({ STATES, getState: () => currentState, setState, reset });
  globalThis.ForgeQuoteIntakeState = api;
  setState(STATES.EMPTY);
})();
