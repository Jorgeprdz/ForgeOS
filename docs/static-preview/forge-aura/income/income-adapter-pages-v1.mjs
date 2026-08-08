import {
  HISTORY_CONTRACT,
  INCOME_STATES,
  PERIOD_SNAPSHOT_CONTRACT,
  PRODUCT_READ_MODEL_CONTRACT,
  validPeriodKey,
} from "./income-core.mjs";

const READ_RPC = "forge_advisor_compensation_read_product";

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}

function abortError() {
  return new DOMException("Aura Income request aborted", "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function normalizePayload(data) {
  if (Array.isArray(data)) return data[0] || null;
  return data && typeof data === "object" ? data : null;
}

function missingAuthority(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42883", "PGRST202", "PGRST204"].includes(code)
    || text.includes(READ_RPC)
    || text.includes("could not find the function")
    || text.includes("schema cache");
}

function assertDigest(value, code) {
  if (!/^[a-f0-9]{64}$/.test(String(value || ""))) fail(code);
}

function validateSnapshot(snapshot, { advisorReference, periodKey }) {
  if (!snapshot || snapshot.contractVersion !== PERIOD_SNAPSHOT_CONTRACT) {
    fail("AURA_INCOME_SNAPSHOT_CONTRACT_INVALID");
  }
  if (snapshot.advisorReference !== advisorReference) fail("AURA_INCOME_SNAPSHOT_OWNER_MISMATCH");
  if (snapshot.periodKey !== periodKey) fail("AURA_INCOME_SNAPSHOT_PERIOD_MISMATCH");
  assertDigest(snapshot.snapshotDigest, "AURA_INCOME_SNAPSHOT_DIGEST_INVALID");
  if (!snapshot.amounts || typeof snapshot.amounts !== "object") fail("AURA_INCOME_SNAPSHOT_AMOUNTS_REQUIRED");
}

function validateHistory(history, { advisorReference, periodKeys }) {
  if (!history || history.contractVersion !== HISTORY_CONTRACT) {
    fail("AURA_INCOME_HISTORY_CONTRACT_INVALID");
  }
  if (history.advisorReference !== advisorReference) fail("AURA_INCOME_HISTORY_OWNER_MISMATCH");
  if (!Array.isArray(history.points)) fail("AURA_INCOME_HISTORY_POINTS_REQUIRED");
  const allowed = new Set(periodKeys);
  if (history.points.some(point => !allowed.has(point.periodKey))) {
    fail("AURA_INCOME_HISTORY_PERIOD_MISMATCH");
  }
  assertDigest(history.seriesDigest, "AURA_INCOME_HISTORY_DIGEST_INVALID");
}

function stateFrom(payload) {
  const state = String(payload?.sourceState || payload?.snapshot?.status || "ERROR").toUpperCase();
  return Object.prototype.hasOwnProperty.call(INCOME_STATES, state) ? state : "ERROR";
}

function disconnected({ advisorReference, periodKey, periodKeys, errorCode }) {
  return Object.freeze({
    contractVersion: PRODUCT_READ_MODEL_CONTRACT,
    state: INCOME_STATES.DISCONNECTED,
    advisorReference,
    periodKey,
    periodKeys: [...periodKeys],
    snapshot: null,
    history: null,
    sourceHealth: Object.freeze({
      canonicalSnapshot: "DISCONNECTED",
      historicalSeries: "DISCONNECTED",
    }),
    errorCode,
    stale: false,
    safeguards: Object.freeze({
      readOnly: true,
      ownerScopeEnforced: true,
      uiCalculation: false,
      compensationEngineMutation: false,
      rulePackMutation: false,
      databaseMutation: false,
    }),
  });
}

export function createIncomeAdapter({ client, user } = {}) {
  if (!client || typeof client.rpc !== "function") throw new Error("AURA_INCOME_SUPABASE_CLIENT_REQUIRED");
  const advisorReference = String(user?.id || "").trim();
  if (!advisorReference) throw new Error("AURA_INCOME_ADVISOR_REQUIRED");

  return Object.freeze({
    adapterId: "AURA_INCOME_PAGES_ADAPTER_V1",
    authority: "SUPABASE_ADVISOR_COMPENSATION_READ_MODEL",
    readOnly: true,

    async load({ periodKey, periodKeys, signal } = {}) {
      if (!validPeriodKey(periodKey)) fail("AURA_INCOME_PERIOD_INVALID");
      if (!Array.isArray(periodKeys) || !periodKeys.length || periodKeys.some(key => !validPeriodKey(key))) {
        fail("AURA_INCOME_HISTORY_PERIODS_INVALID");
      }
      throwIfAborted(signal);

      try {
        const result = await client.rpc(READ_RPC, {
          p_period_key: periodKey,
          p_period_keys: [...periodKeys],
        });
        throwIfAborted(signal);
        if (result?.error) {
          if (missingAuthority(result.error)) {
            return disconnected({
              advisorReference,
              periodKey,
              periodKeys,
              errorCode: "ADVISOR_COMPENSATION_REMOTE_AUTHORITY_NOT_DEPLOYED",
            });
          }
          const error = new Error("AURA_INCOME_PRODUCTIVE_READ_FAILED", { cause: result.error });
          error.code = result.error.code || "AURA_INCOME_PRODUCTIVE_READ_FAILED";
          throw error;
        }

        const payload = normalizePayload(result?.data);
        if (!payload?.snapshot || !payload?.history) {
          fail(payload?.errorCode || "AURA_INCOME_PRODUCT_READ_MODEL_UNAVAILABLE");
        }
        validateSnapshot(payload.snapshot, { advisorReference, periodKey });
        validateHistory(payload.history, { advisorReference, periodKeys });
        throwIfAborted(signal);

        return Object.freeze({
          contractVersion: PRODUCT_READ_MODEL_CONTRACT,
          state: stateFrom(payload),
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: payload.snapshot,
          history: payload.history,
          sourceHealth: payload.sourceHealth || payload.snapshot.sourceHealth || {},
          providerMetadata: Object.freeze({
            providerId: "ADVISOR_COMPENSATION_SUPABASE_PROVIDER_100",
            remoteAuthority: true,
            readOnly: true,
            ...(payload.metadata || {}),
          }),
          errorCode: null,
          stale: stateFrom(payload) === "STALE",
          safeguards: Object.freeze({
            canonicalReadModelsOnly: true,
            ownerScopeEnforced: true,
            uiCalculation: false,
            indexedDbFallback: false,
            carteraFallback: false,
            pipelineFallback: false,
            unknownIsNotZero: true,
            externalMutationAuthorized: false,
          }),
        });
      } catch (error) {
        if (error?.name === "AbortError" || signal?.aborted) throw abortError();
        return Object.freeze({
          contractVersion: PRODUCT_READ_MODEL_CONTRACT,
          state: INCOME_STATES.ERROR,
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: null,
          history: null,
          sourceHealth: Object.freeze({ canonicalSnapshot: "ERROR", historicalSeries: "ERROR" }),
          errorCode: error?.code || error?.message || "AURA_INCOME_LOAD_FAILED",
          stale: false,
          safeguards: Object.freeze({
            canonicalReadModelsOnly: true,
            ownerScopeEnforced: true,
            uiCalculation: false,
            unknownIsNotZero: true,
            externalMutationAuthorized: false,
          }),
        });
      }
    },
  });
}

export const AURA_INCOME_ADAPTER_CONTRACT = Object.freeze({
  adapterId: "AURA_INCOME_PAGES_ADAPTER_V1",
  readRpc: READ_RPC,
  readOnly: true,
  directBrowserMutation: false,
  ownerScopeRequired: true,
  unknownIsNotZero: true,
});
