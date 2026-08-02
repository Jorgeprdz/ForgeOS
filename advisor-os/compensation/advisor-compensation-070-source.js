const CONTRACT_VERSION = "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001";

export const ADVISOR_COMPENSATION_UI_STATES = Object.freeze({
  LOADING: "LOADING",
  READY: "READY",
  PARTIAL: "PARTIAL",
  EMPTY: "EMPTY",
  BLOCKED: "BLOCKED",
  STALE: "STALE",
  ERROR: "ERROR",
  DISCONNECTED: "DISCONNECTED",
});

const SNAPSHOT_CONTRACT = "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001";
const HISTORY_CONTRACT = "ADVISOR_COMPENSATION_HISTORY_SERIES_001";
const VALID_STATES = new Set(Object.values(ADVISOR_COMPENSATION_UI_STATES));
let registeredProvider = null;

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  return error;
}

function validPeriodKey(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function assertSnapshot(snapshot, { advisorReference, periodKey }) {
  if (!snapshot || typeof snapshot !== "object") {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_REQUIRED");
  }
  if (snapshot.contractVersion !== SNAPSHOT_CONTRACT) {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_CONTRACT_INVALID");
  }
  if (snapshot.advisorReference !== advisorReference) {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_OWNER_MISMATCH");
  }
  if (snapshot.periodKey !== periodKey) {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_PERIOD_MISMATCH");
  }
  if (!snapshot.amounts || typeof snapshot.amounts !== "object") {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_AMOUNTS_REQUIRED");
  }
  if (!["READY", "PARTIAL", "EMPTY", "BLOCKED"].includes(snapshot.status)) {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_STATUS_INVALID");
  }
  if (!/^[a-f0-9]{64}$/.test(snapshot.snapshotDigest || "")) {
    throw fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_DIGEST_INVALID");
  }
}

function assertHistory(history, { advisorReference, periodKeys }) {
  if (!history || typeof history !== "object") {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_REQUIRED");
  }
  if (history.contractVersion !== HISTORY_CONTRACT) {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_CONTRACT_INVALID");
  }
  if (history.advisorReference !== advisorReference) {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_OWNER_MISMATCH");
  }
  if (!Array.isArray(history.points)) {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_POINTS_REQUIRED");
  }
  const allowed = new Set(periodKeys);
  if (history.points.some((point) => !allowed.has(point.periodKey))) {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_PERIOD_MISMATCH");
  }
  if (!/^[a-f0-9]{64}$/.test(history.seriesDigest || "")) {
    throw fail("ADVISOR_COMPENSATION_UI_HISTORY_DIGEST_INVALID");
  }
}

function mapSnapshotStatus(status) {
  if (status === "READY") return ADVISOR_COMPENSATION_UI_STATES.READY;
  if (status === "PARTIAL") return ADVISOR_COMPENSATION_UI_STATES.PARTIAL;
  if (status === "EMPTY") return ADVISOR_COMPENSATION_UI_STATES.EMPTY;
  if (status === "BLOCKED") return ADVISOR_COMPENSATION_UI_STATES.BLOCKED;
  return ADVISOR_COMPENSATION_UI_STATES.ERROR;
}

function newestTimestamp(snapshot, history) {
  const values = [
    snapshot?.capturedAt,
    history?.capturedAt,
    snapshot?.amounts?.paid?.asOf,
  ].map((value) => Date.parse(value || "")).filter(Number.isFinite);
  return values.length ? Math.max(...values) : null;
}

function staleByAge(snapshot, history, now, maxAgeMs) {
  const newest = newestTimestamp(snapshot, history);
  return newest !== null && Number.isFinite(maxAgeMs) && maxAgeMs >= 0
    ? now() - newest > maxAgeMs
    : false;
}

function providerCapabilities(provider) {
  if (!provider || typeof provider !== "object") return null;
  const unified = typeof provider.loadCompensationProduct === "function";
  const split = typeof provider.loadPeriodSnapshot === "function"
    && typeof provider.loadHistorySeries === "function";
  if (!unified && !split) return null;
  return Object.freeze({ unified, split });
}

async function callProvider(provider, context) {
  const capabilities = providerCapabilities(provider);
  if (!capabilities) {
    throw fail("ADVISOR_COMPENSATION_UI_PROVIDER_INVALID");
  }
  if (capabilities.unified) {
    const result = await provider.loadCompensationProduct(context);
    if (!result || typeof result !== "object") {
      throw fail("ADVISOR_COMPENSATION_UI_PROVIDER_RESPONSE_INVALID");
    }
    return {
      snapshot: result.snapshot || null,
      history: result.history || null,
      sourceState: result.sourceState || null,
      sourceHealth: result.sourceHealth || null,
      providerMetadata: result.metadata || null,
    };
  }
  const [snapshot, history] = await Promise.all([
    provider.loadPeriodSnapshot(context),
    provider.loadHistorySeries(context),
  ]);
  return {
    snapshot,
    history,
    sourceState: null,
    sourceHealth: null,
    providerMetadata: null,
  };
}

function disconnectedReadModel({ advisorReference, periodKey, periodKeys }) {
  return freeze({
    contractVersion: CONTRACT_VERSION,
    state: ADVISOR_COMPENSATION_UI_STATES.DISCONNECTED,
    advisorReference,
    periodKey,
    periodKeys: [...periodKeys],
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "DISCONNECTED",
      historicalSeries: "DISCONNECTED",
    }),
    errorCode: null,
    stale: false,
    safeguards: Object.freeze({
      canonicalReadModelsOnly: true,
      indexedDbFallback: false,
      carteraFallback: false,
      uiCalculation: false,
      simulationIncludedInTruth: false,
      ownerScopeEnforced: true,
      lateResultAccepted: false,
    }),
  });
}

export function registerAdvisorCompensationProductProvider(provider) {
  if (!providerCapabilities(provider)) {
    throw fail("ADVISOR_COMPENSATION_UI_PROVIDER_INVALID");
  }
  registeredProvider = provider;
  return provider;
}

export function clearAdvisorCompensationProductProvider() {
  registeredProvider = null;
}

export function resolveAdvisorCompensationProductProvider(globalObject = globalThis) {
  return registeredProvider
    || globalObject?.ForgeAdvisorCompensationProductSource070
    || null;
}

export function createAdvisorCompensationProductSource({
  provider = null,
  providerResolver = resolveAdvisorCompensationProductProvider,
  now = () => Date.now(),
  maxAgeMs = 36 * 60 * 60 * 1000,
} = {}) {
  return Object.freeze({
    async load({
      advisorReference,
      periodKey,
      periodKeys,
      signal,
      requestId = null,
    } = {}) {
      if (!advisorReference || typeof advisorReference !== "string") {
        throw fail("ADVISOR_COMPENSATION_UI_ADVISOR_REQUIRED");
      }
      if (!validPeriodKey(periodKey)) {
        throw fail("ADVISOR_COMPENSATION_UI_PERIOD_INVALID");
      }
      if (!Array.isArray(periodKeys) || periodKeys.length === 0
          || periodKeys.some((item) => !validPeriodKey(item))) {
        throw fail("ADVISOR_COMPENSATION_UI_HISTORY_PERIODS_INVALID");
      }
      if (signal?.aborted) throw fail("ABORT_ERR");

      const resolvedProvider = provider || providerResolver();
      if (!resolvedProvider) {
        return disconnectedReadModel({ advisorReference, periodKey, periodKeys });
      }

      try {
        const result = await callProvider(resolvedProvider, {
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          signal,
          requestId,
          readOnly: true,
          contractVersion: CONTRACT_VERSION,
        });
        if (signal?.aborted) throw fail("ABORT_ERR");

        assertSnapshot(result.snapshot, { advisorReference, periodKey });
        assertHistory(result.history, { advisorReference, periodKeys });

        const explicitState = result.sourceState;
        if (explicitState && !VALID_STATES.has(explicitState)) {
          throw fail("ADVISOR_COMPENSATION_UI_SOURCE_STATE_INVALID");
        }
        const stale = explicitState === ADVISOR_COMPENSATION_UI_STATES.STALE
          || staleByAge(result.snapshot, result.history, now, maxAgeMs);
        const state = stale
          ? ADVISOR_COMPENSATION_UI_STATES.STALE
          : explicitState || mapSnapshotStatus(result.snapshot.status);

        return freeze({
          contractVersion: CONTRACT_VERSION,
          state,
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: clone(result.snapshot),
          history: clone(result.history),
          sourceHealth: clone(result.sourceHealth || {
            canonicalSnapshot: result.snapshot.status,
            historicalSeries: "AVAILABLE",
          }),
          providerMetadata: clone(result.providerMetadata),
          errorCode: null,
          stale,
          safeguards: Object.freeze({
            canonicalReadModelsOnly: true,
            indexedDbFallback: false,
            carteraFallback: false,
            uiCalculation: false,
            simulationIncludedInTruth: false,
            ownerScopeEnforced: true,
            lateResultAccepted: false,
          }),
        });
      } catch (error) {
        if (error?.name === "AbortError" || error?.code === "ABORT_ERR" || signal?.aborted) {
          throw fail("ABORT_ERR");
        }
        return freeze({
          contractVersion: CONTRACT_VERSION,
          state: ADVISOR_COMPENSATION_UI_STATES.ERROR,
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: null,
          history: null,
          sourceHealth: Object.freeze({
            canonicalSnapshot: "ERROR",
            historicalSeries: "ERROR",
          }),
          errorCode: error?.code || error?.message || "ADVISOR_COMPENSATION_UI_LOAD_FAILED",
          stale: false,
          safeguards: Object.freeze({
            canonicalReadModelsOnly: true,
            indexedDbFallback: false,
            carteraFallback: false,
            uiCalculation: false,
            simulationIncludedInTruth: false,
            ownerScopeEnforced: true,
            lateResultAccepted: false,
          }),
        });
      }
    },
  });
}

export {
  CONTRACT_VERSION as ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_CONTRACT_VERSION,
  assertSnapshot,
  assertHistory,
  mapSnapshotStatus,
  staleByAge,
  validPeriodKey,
};
