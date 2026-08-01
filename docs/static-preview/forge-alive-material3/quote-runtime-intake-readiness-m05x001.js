const VERSION = "M05X-001";
const INPUT_SELECTOR = "#fq-solution-online-pdf-105dr";

const state = {
  ready: false,
  attempts: 0,
  retryTimer: null,
};

function inputNode() {
  return document.querySelector(INPUT_SELECTOR);
}

function applyState() {
  const input = inputNode();
  if (!input) return false;
  const blocked = !state.ready;
  input.disabled = blocked;
  input.setAttribute("aria-busy", String(blocked));
  input.dataset.quoteIntakeReadiness = state.ready ? "ready" : "preparing";
  input.title = state.ready
    ? "Seleccionar cotización PDF"
    : "Preparando el motor de Cotizaciones…";
  document.documentElement.dataset.quoteIntakeReadiness =
    state.ready ? "ready" : "preparing";
  return true;
}

function boundedMount() {
  if (applyState() || state.attempts >= 40) return;
  state.attempts += 1;
  if (state.retryTimer !== null) return;
  state.retryTimer = globalThis.setTimeout(() => {
    state.retryTimer = null;
    boundedMount();
  }, 50);
}

function markReady() {
  state.ready = true;
  applyState();
  document.documentElement.dataset.quoteAuthoritiesReady = VERSION;
  globalThis.dispatchEvent?.(new CustomEvent("forge:quote-intake-ready", {
    detail: Object.freeze({ version: VERSION }),
  }));
  return true;
}

function markPreparing() {
  state.ready = false;
  boundedMount();
  return true;
}

markPreparing();

globalThis.ForgeQuoteIntakeReadinessM05X001 = Object.freeze({
  version: VERSION,
  markPreparing,
  markReady,
  getState() {
    return Object.freeze({
      ready: state.ready,
      mounted: Boolean(inputNode()),
    });
  },
});

export { VERSION, markPreparing, markReady };
