import { AppState } from "./state-manager.js";
import { EventBus } from "./event-system.js";
import { Logger } from "./logger.js";
import { Memory } from "./memory-manager.js";
import {
  ADVISOR_COMPENSATION_UI_STATES,
  createAdvisorCompensationProductSource,
  resolveAdvisorCompensationProductProvider,
} from "./advisor-os/compensation/advisor-compensation-070-source.js";
import {
  renderAdvisorCompensationProduct,
} from "./platform/compensation/advisor-compensation-070-view.js";

const routeState = {
  mounted: false,
  requestSequence: 0,
  controller: null,
  periodKey: null,
  source: null,
  listener: null,
};

function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/Mexico_City",
  }).format(new Date());
}

function shiftPeriod(periodKey, offset) {
  const [year, month] = periodKey.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1 + Number(offset), 1));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function sixMonthPeriods(periodKey) {
  return Array.from({ length: 6 }, (_, index) => shiftPeriod(periodKey, index - 5));
}

function root() {
  return document.getElementById("fin-root");
}

function userReference() {
  const user = AppState.get("user");
  return typeof user?.id === "string" && user.id.trim() ? user.id.trim() : null;
}

function renderReadModel(readModel) {
  const host = root();
  if (!host || !routeState.mounted) return;
  host.innerHTML = renderAdvisorCompensationProduct(readModel);
}

function loadingModel(periodKey, advisorReference = null) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: ADVISOR_COMPENSATION_UI_STATES.LOADING,
    advisorReference,
    periodKey,
    periodKeys: sixMonthPeriods(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "LOADING",
      historicalSeries: "LOADING",
    }),
    errorCode: null,
  });
}

function blockedModel(periodKey, errorCode) {
  return Object.freeze({
    contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
    state: ADVISOR_COMPENSATION_UI_STATES.BLOCKED,
    advisorReference: null,
    periodKey,
    periodKeys: sixMonthPeriods(periodKey),
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "BLOCKED",
      historicalSeries: "BLOCKED",
    }),
    errorCode,
  });
}

async function loadPeriod() {
  const host = root();
  if (!host || !routeState.mounted) return;

  const advisorReference = userReference();
  const periodKey = routeState.periodKey || currentMonth();
  routeState.periodKey = periodKey;

  if (!advisorReference) {
    renderReadModel(blockedModel(periodKey, "ADVISOR_COMPENSATION_AUTH_REQUIRED"));
    return;
  }

  routeState.controller?.abort();
  const controller = new AbortController();
  routeState.controller = controller;
  const requestId = ++routeState.requestSequence;
  const sessionReference = advisorReference;
  renderReadModel(loadingModel(periodKey, advisorReference));

  try {
    const source = routeState.source || createAdvisorCompensationProductSource({
      providerResolver: () =>
        AppState.get("advisor-compensation:source")
        || resolveAdvisorCompensationProductProvider(),
    });
    routeState.source = source;

    const readModel = await source.load({
      advisorReference,
      periodKey,
      periodKeys: sixMonthPeriods(periodKey),
      signal: controller.signal,
      requestId,
    });

    const late = !routeState.mounted
      || requestId !== routeState.requestSequence
      || controller.signal.aborted
      || userReference() !== sessionReference
      || root() !== host;

    if (late) {
      EventBus.emit("advisor-compensation:late-result-rejected", {
        requestId,
        periodKey,
        advisorReference: sessionReference,
      });
      return;
    }

    AppState.set("advisor-compensation:product", readModel);
    renderReadModel(readModel);
    EventBus.emit("advisor-compensation:product-mounted", {
      contractVersion: readModel.contractVersion,
      state: readModel.state,
      periodKey,
      advisorReference: sessionReference,
      readOnly: true,
      canonicalReadModelsOnly: true,
      indexedDbFallback: false,
      carteraFallback: false,
      uiCalculation: false,
    });
  } catch (error) {
    if (error?.code === "ABORT_ERR" || controller.signal.aborted) return;
    if (!routeState.mounted || requestId !== routeState.requestSequence) return;
    Logger.error("[ADVISOR COMPENSATION 070 LOAD ERROR]", error);
    const readModel = Object.freeze({
      contractVersion: "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001",
      state: ADVISOR_COMPENSATION_UI_STATES.ERROR,
      advisorReference: sessionReference,
      periodKey,
      periodKeys: sixMonthPeriods(periodKey),
      snapshot: null,
      history: null,
      sourceHealth: Object.freeze({
        canonicalSnapshot: "ERROR",
        historicalSeries: "ERROR",
      }),
      errorCode: error?.code || error?.message || "ADVISOR_COMPENSATION_UI_LOAD_FAILED",
    });
    AppState.set("advisor-compensation:product", readModel);
    renderReadModel(readModel);
    EventBus.emit("advisor-compensation:product-error", {
      code: readModel.errorCode,
      periodKey,
    });
  }
}

function onClick(event) {
  const periodButton = event.target.closest("[data-comp-period-offset]");
  if (periodButton) {
    const offset = Number(periodButton.dataset.compPeriodOffset);
    if (!Number.isInteger(offset) || Math.abs(offset) !== 1) return;
    const next = shiftPeriod(routeState.periodKey || currentMonth(), offset);
    if (next > currentMonth()) return;
    routeState.periodKey = next;
    void loadPeriod();
    return;
  }
  if (event.target.closest("[data-comp-refresh]")) {
    void loadPeriod();
  }
}

export function renderComisiones() {
  const periodKey = currentMonth();
  return `<div id="fin-root" data-advisor-compensation-route="070" aria-live="polite">${
    renderAdvisorCompensationProduct(loadingModel(periodKey, null))
  }</div>`;
}

export async function bindComisionesEvents({ source = null } = {}) {
  const host = root();
  if (!host) return;

  routeState.mounted = true;
  routeState.periodKey = currentMonth();
  routeState.source = source;
  routeState.listener = onClick;
  host.addEventListener("click", onClick);

  Memory.add(() => {
    routeState.mounted = false;
    routeState.requestSequence += 1;
    routeState.controller?.abort();
    routeState.controller = null;
    if (routeState.listener) host.removeEventListener("click", routeState.listener);
    routeState.listener = null;
    routeState.source = null;
    routeState.periodKey = null;
    AppState.set("advisor-compensation:product", null);
    host.replaceChildren();
  });

  await loadPeriod();
}

export {
  currentMonth,
  shiftPeriod,
  sixMonthPeriods,
  loadingModel,
  blockedModel,
};
