const TIME_ZONE = "America/Mexico_City";
const MODULE_STATE = Symbol.for("forge.advisor-compensation.material3.100");

function runtimeLayout() {
  const sourceTree = import.meta.url.includes("/docs/static-preview/");
  return Object.freeze({
    compensationBase: new URL(
      sourceTree ? "../../../advisor-os/compensation/" : "../../advisor-os/compensation/",
      import.meta.url,
    ),
    platformBase: new URL(
      sourceTree ? "../../../platform/compensation/" : "../../platform/compensation/",
      import.meta.url,
    ),
  });
}

let modulesPromise = null;
async function loadModules() {
  if (modulesPromise) return modulesPromise;
  const layout = runtimeLayout();
  modulesPromise = Promise.all([
    import(new URL("advisor-compensation-070-source.js", layout.compensationBase)),
    import(new URL("advisor-compensation-supabase-provider-100.js", layout.compensationBase)),
    import(new URL("advisor-compensation-070-view.js", layout.platformBase)),
  ]).then(([source, provider, view]) => Object.freeze({ source, provider, view }));
  return modulesPromise;
}

function monthKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function shiftPeriod(periodKey, offset) {
  const [year, month] = String(periodKey).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function periodKeys(periodKey) {
  return Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5));
}

function blockedReadModel(periodKey, code) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: "BLOCKED",
    advisorReference: null,
    periodKey,
    periodKeys: periodKeys(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "BLOCKED",
      historicalSeries: "BLOCKED",
    }),
    errorCode: code,
    stale: false,
  });
}

function loadingReadModel(periodKey, advisorReference = null) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: "LOADING",
    advisorReference,
    periodKey,
    periodKeys: periodKeys(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "LOADING",
      historicalSeries: "LOADING",
    }),
    errorCode: null,
    stale: false,
  });
}

function sessionFrom(result) {
  if (result?.error) throw result.error;
  return result?.data?.session || null;
}

export function createCompensationModule({
  root,
  shell,
  bootstrap = globalThis.ForgeProductiveProspectBootstrap067G17B,
  clock = () => new Date(),
} = {}) {
  if (!(root instanceof Element)) {
    throw new TypeError("Advisor compensation Material 3 root is required");
  }
  if (root[MODULE_STATE]) return root[MODULE_STATE];

  let mounted = false;
  let generation = 0;
  let requestController = null;
  let source = null;
  let periodKey = monthKey(clock());
  let lastReadModel = null;
  const lifetimeController = new AbortController();

  function selectedBootstrap() {
    return globalThis.ForgeProductiveProspectBootstrap067G17B || bootstrap || null;
  }

  function render(view, readModel) {
    if (!mounted) return;
    lastReadModel = readModel;
    root.innerHTML = view.renderAdvisorCompensationProduct(readModel);
    root.dataset.compensationState = readModel.state;
    root.dataset.compensationPeriod = readModel.periodKey;
  }

  function abortCurrent(reason = "compensation-request-replaced") {
    generation += 1;
    if (requestController && !requestController.signal.aborted) {
      requestController.abort(reason);
    }
    requestController = null;
  }

  async function refresh() {
    if (!mounted) return;
    const requestGeneration = generation + 1;
    abortCurrent("compensation-refresh");
    generation = requestGeneration;
    const controller = new AbortController();
    requestController = controller;
    const selectedPeriod = periodKey;
    const { source: sourceModule, provider, view } = await loadModules();
    if (!mounted || requestGeneration !== generation) return;

    const selected = selectedBootstrap();
    if (typeof selected?.getSession !== "function") {
      render(view, blockedReadModel(selectedPeriod, "ADVISOR_COMPENSATION_AUTH_RUNTIME_UNAVAILABLE"));
      return;
    }

    let session;
    try {
      session = sessionFrom(await selected.getSession());
    } catch (error) {
      render(view, blockedReadModel(
        selectedPeriod,
        error?.code || "ADVISOR_COMPENSATION_SESSION_LOOKUP_FAILED",
      ));
      return;
    }
    const advisorReference = session?.user?.id || null;
    if (!advisorReference) {
      render(view, blockedReadModel(selectedPeriod, "SESSION_REQUIRED"));
      return;
    }

    render(view, loadingReadModel(selectedPeriod, advisorReference));

    const installation = await provider.installAdvisorCompensationSupabaseProvider100({
      bootstrap: selected,
      signal: controller.signal,
    });
    if (!mounted || requestGeneration !== generation || controller.signal.aborted) return;

    if (!source) {
      source = sourceModule.createAdvisorCompensationProductSource({
        providerResolver: () => installation.provider
          || globalThis.ForgeAdvisorCompensationProductSource070
          || null,
      });
    }

    const readModel = await source.load({
      advisorReference,
      periodKey: selectedPeriod,
      periodKeys: periodKeys(selectedPeriod),
      signal: controller.signal,
      requestId: `compensation-100:${requestGeneration}`,
    });
    const late = !mounted
      || requestGeneration !== generation
      || controller.signal.aborted
      || selectedPeriod !== periodKey;
    if (late) {
      globalThis.dispatchEvent(new CustomEvent(
        "advisor-compensation:late-result-rejected",
        { detail: { requestGeneration, periodKey: selectedPeriod, advisorReference } },
      ));
      return;
    }
    render(view, readModel);
    globalThis.dispatchEvent(new CustomEvent(
      "advisor-compensation:material3-mounted",
      { detail: {
        state: readModel.state,
        periodKey: selectedPeriod,
        advisorReference,
        providerInstalled: installation.installed,
        remoteAuthorityReason: installation.probe?.reason || null,
      } },
    ));
  }

  function handleClick(event) {
    const policyButton = event.target.closest("[data-comp-open-policy]");
    if (policyButton?.dataset.compOpenPolicy) {
      const url = new URL(globalThis.location.href);
      url.searchParams.set("nav", "cartera");
      url.searchParams.set("policy", policyButton.dataset.compOpenPolicy);
      url.searchParams.set("from", "comisiones");
      globalThis.location.assign(url.href);
      return;
    }
    const periodButton = event.target.closest("[data-comp-period-offset]");
    if (periodButton) {
      const offset = Number(periodButton.dataset.compPeriodOffset);
      if (!Number.isInteger(offset) || Math.abs(offset) !== 1) return;
      const next = shiftPeriod(periodKey, offset);
      if (next > monthKey(clock())) return;
      periodKey = next;
      void refresh();
      return;
    }
    if (event.target.closest("[data-comp-refresh]")) void refresh();
  }

  root.addEventListener("click", handleClick, {
    signal: lifetimeController.signal,
  });
  root.addEventListener("input", (event) => {
    if (!event.target.matches("[data-comp-search-input]")) return;
    const query = String(event.target.value || "").trim().toLowerCase();
    root.querySelectorAll("[data-comp-search]").forEach(detail => {
      detail.hidden = Boolean(query) && !detail.dataset.compSearch.includes(query);
    });
  }, { signal: lifetimeController.signal });

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
      if (!lastReadModel && mounted) void refresh();
    },
    unmount() {
      mounted = false;
      abortCurrent("compensation-route-unmounted");
      source = null;
      lastReadModel = null;
      root.replaceChildren();
      root.hidden = true;
      root.dataset.moduleActive = "false";
      root.dataset.compensationState = "SCRUBBED";
    },
    refresh,
    scrub(reason = "compensation-session-scrub") {
      abortCurrent(reason);
      source = null;
      lastReadModel = null;
      root.replaceChildren();
      root.dataset.compensationState = "SCRUBBED";
    },
    diagnostics() {
      return Object.freeze({
        mounted,
        generation,
        periodKey,
        state: lastReadModel?.state || null,
        advisorReference: lastReadModel?.advisorReference || null,
        privateDataPresent: Boolean(lastReadModel?.snapshot || lastReadModel?.history),
      });
    },
    destroy() {
      mounted = false;
      abortCurrent("compensation-module-destroyed");
      lifetimeController.abort();
      root.replaceChildren();
      delete root[MODULE_STATE];
    },
  });

  root[MODULE_STATE] = api;
  return api;
}

export {
  monthKey,
  shiftPeriod,
  periodKeys,
  blockedReadModel,
  loadingReadModel,
};
