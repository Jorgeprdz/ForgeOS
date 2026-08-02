import {
  createAdvisorCompensationProductSource,
  installAdvisorCompensationSupabaseProvider100,
  renderAdvisorCompensationProduct,
} from "./compensation-runtime-distribution-100.js?v=advisor-compensation-100";

const TIME_ZONE = "America/Mexico_City";
const MODULE_STATE = Symbol.for("forge.advisor-compensation.material3.100.distribution");

function monthKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value);
  return `${parts.find((part) => part.type === "year")?.value}-${parts.find((part) => part.type === "month")?.value}`;
}

function shiftPeriod(periodKey, offset) {
  const [year, month] = String(periodKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function periodKeys(periodKey) {
  return Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5));
}

function loading(periodKey, advisorReference = null) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: "LOADING",
    advisorReference,
    periodKey,
    periodKeys: periodKeys(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: { canonicalSnapshot: "LOADING", historicalSeries: "LOADING" },
    errorCode: null,
  });
}

function blocked(periodKey, errorCode) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: "BLOCKED",
    advisorReference: null,
    periodKey,
    periodKeys: periodKeys(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: { canonicalSnapshot: "BLOCKED", historicalSeries: "BLOCKED" },
    errorCode,
  });
}

export function createCompensationModule({
  root,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  clock = () => new Date(),
} = {}) {
  if (!(root instanceof Element)) throw new TypeError("Compensation root is required");
  if (root[MODULE_STATE]) return root[MODULE_STATE];

  let mounted = false;
  let generation = 0;
  let controller = null;
  let periodKey = monthKey(clock());
  let source = null;
  let last = null;
  const lifetime = new AbortController();

  const selectedBootstrap = () => globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap || null;
  const abort = (reason) => {
    generation += 1;
    if (controller && !controller.signal.aborted) controller.abort(reason);
    controller = null;
  };
  const render = (model) => {
    if (!mounted) return;
    last = model;
    root.innerHTML = renderAdvisorCompensationProduct(model);
    root.dataset.compensationState = model.state;
    root.dataset.compensationPeriod = model.periodKey;
  };

  async function refresh() {
    if (!mounted) return;
    abort("refresh");
    const request = generation;
    controller = new AbortController();
    const selectedPeriod = periodKey;
    const selected = selectedBootstrap();
    if (typeof selected?.getSession !== "function") {
      render(blocked(selectedPeriod, "ADVISOR_COMPENSATION_AUTH_RUNTIME_UNAVAILABLE"));
      return;
    }
    let sessionResult;
    try {
      sessionResult = await selected.getSession();
      if (sessionResult?.error) throw sessionResult.error;
    } catch (error) {
      render(blocked(selectedPeriod, error?.code || "SESSION_LOOKUP_FAILED"));
      return;
    }
    const advisorReference = sessionResult?.data?.session?.user?.id || null;
    if (!advisorReference) {
      render(blocked(selectedPeriod, "SESSION_REQUIRED"));
      return;
    }
    render(loading(selectedPeriod, advisorReference));
    const installation = await installAdvisorCompensationSupabaseProvider100({
      bootstrap: selected,
    });
    if (!mounted || request !== generation || controller.signal.aborted) return;
    if (!source) {
      source = createAdvisorCompensationProductSource({
        providerResolver: () => installation.provider
          || globalThis.ForgeAdvisorCompensationProductSource070
          || null,
      });
    }
    const model = await source.load({
      advisorReference,
      periodKey: selectedPeriod,
      periodKeys: periodKeys(selectedPeriod),
      signal: controller.signal,
    });
    if (!mounted || request !== generation || controller.signal.aborted || selectedPeriod !== periodKey) {
      dispatchEvent(new CustomEvent("advisor-compensation:late-result-rejected", {
        detail: { advisorReference, periodKey: selectedPeriod },
      }));
      return;
    }
    render(model);
  }

  root.addEventListener("click", (event) => {
    const periodButton = event.target.closest("[data-comp-period-offset]");
    if (periodButton) {
      const offset = Number(periodButton.dataset.compPeriodOffset);
      if (!Number.isInteger(offset) || Math.abs(offset) !== 1) return;
      const next = shiftPeriod(periodKey, offset);
      if (next > monthKey(clock())) return;
      periodKey = next;
      void refresh();
    } else if (event.target.closest("[data-comp-refresh]")) {
      void refresh();
    }
  }, { signal: lifetime.signal });

  const api = Object.freeze({
    id: "comisiones",
    root,
    mount() {
      if (mounted) return;
      mounted = true;
      root.hidden = false;
      root.dataset.moduleActive = "true";
      periodKey = monthKey(clock());
      void refresh();
    },
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      if (!last && mounted) void refresh();
    },
    unmount() {
      mounted = false;
      abort("route-unmounted");
      source = null;
      last = null;
      root.replaceChildren();
      root.hidden = true;
      root.dataset.moduleActive = "false";
      root.dataset.compensationState = "SCRUBBED";
    },
    refresh,
    scrub(reason = "session-scrub") {
      abort(reason);
      source = null;
      last = null;
      root.replaceChildren();
      root.dataset.compensationState = "SCRUBBED";
    },
    diagnostics() {
      return Object.freeze({
        mounted,
        generation,
        periodKey,
        state: last?.state || null,
        privateDataPresent: Boolean(last?.snapshot || last?.history),
      });
    },
    destroy() {
      mounted = false;
      abort("destroy");
      lifetime.abort();
      root.replaceChildren();
      delete root[MODULE_STATE];
    },
  });
  root[MODULE_STATE] = api;
  return api;
}
