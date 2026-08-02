const PROVIDER_ID = "ADVISOR_COMPENSATION_SUPABASE_PROVIDER_100";
const INVENTORY_RPC = "forge_advisor_compensation_authority_inventory";
const READ_RPC = "forge_advisor_compensation_read_product";
const INSTALLATION = Symbol.for("forge.advisor-compensation.provider.100");

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details !== null) error.details = details;
  throw error;
}

function abortError() {
  return new DOMException("Advisor compensation request aborted", "AbortError");
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw abortError();
}

function validPeriodKey(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function missingAuthority(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42883", "PGRST202", "PGRST204"].includes(code)
    || text.includes(INVENTORY_RPC)
    || text.includes(READ_RPC)
    || text.includes("could not find the function")
    || text.includes("schema cache");
}

function unwrapSession(result) {
  if (result?.error) throw result.error;
  return result?.data?.session || null;
}

function normalizeRpcPayload(data) {
  if (Array.isArray(data)) return data[0] || null;
  return data && typeof data === "object" ? data : null;
}

async function resolveBootstrap(bootstrap) {
  const selected = bootstrap || globalThis.ForgeProductiveProspectBootstrap067G17B;
  if (typeof selected?.getClient !== "function" || typeof selected?.getSession !== "function") {
    return null;
  }
  return selected;
}

export function createAdvisorCompensationSupabaseProvider100({
  bootstrap = null,
} = {}) {
  let clientPromise = null;

  async function selectedBootstrap() {
    return resolveBootstrap(bootstrap);
  }

  async function client() {
    const selected = await selectedBootstrap();
    if (!selected) fail("ADVISOR_COMPENSATION_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE");
    if (!clientPromise) clientPromise = Promise.resolve(selected.getClient());
    return clientPromise;
  }

  async function authenticatedAdvisor() {
    const selected = await selectedBootstrap();
    if (!selected) return null;
    const session = unwrapSession(await selected.getSession());
    return session?.user?.id || null;
  }

  const api = Object.freeze({
    providerId: PROVIDER_ID,
    authority: "SUPABASE_ADVISOR_COMPENSATION_READ_MODEL",

    async probe({ signal } = {}) {
      throwIfAborted(signal);
      const selected = await selectedBootstrap();
      if (!selected) {
        return Object.freeze({ available: false, reason: "AUTH_BOOTSTRAP_UNAVAILABLE" });
      }
      try {
        const selectedClient = await client();
        const result = await selectedClient.rpc(INVENTORY_RPC);
        throwIfAborted(signal);
        if (result?.error) {
          if (missingAuthority(result.error)) {
            return Object.freeze({ available: false, reason: "REMOTE_AUTHORITY_NOT_DEPLOYED" });
          }
          throw result.error;
        }
        const inventory = normalizeRpcPayload(result?.data) || {};
        return Object.freeze({
          available: inventory.ready === true,
          reason: inventory.ready === true ? null : "REMOTE_AUTHORITY_INCOMPLETE",
          inventory,
        });
      } catch (error) {
        if (error?.name === "AbortError" || signal?.aborted) throw abortError();
        if (missingAuthority(error)) {
          return Object.freeze({ available: false, reason: "REMOTE_AUTHORITY_NOT_DEPLOYED" });
        }
        return Object.freeze({
          available: false,
          reason: error?.code || error?.message || "REMOTE_AUTHORITY_PROBE_FAILED",
        });
      }
    },

    async loadCompensationProduct(context = {}) {
      const advisorReference = String(context.advisorReference || "").trim();
      const periodKey = String(context.periodKey || "").trim();
      const periodKeys = Array.isArray(context.periodKeys)
        ? context.periodKeys.map(String)
        : [];
      if (!advisorReference) fail("ADVISOR_COMPENSATION_PRODUCTIVE_ADVISOR_REQUIRED");
      if (!validPeriodKey(periodKey)) fail("ADVISOR_COMPENSATION_PRODUCTIVE_PERIOD_INVALID");
      if (!periodKeys.length || periodKeys.some((item) => !validPeriodKey(item))) {
        fail("ADVISOR_COMPENSATION_PRODUCTIVE_HISTORY_PERIODS_INVALID");
      }
      throwIfAborted(context.signal);

      const sessionAdvisor = await authenticatedAdvisor();
      if (!sessionAdvisor) fail("SESSION_REQUIRED");
      if (sessionAdvisor !== advisorReference) {
        fail("ADVISOR_COMPENSATION_PRODUCTIVE_OWNER_MISMATCH");
      }

      const selectedClient = await client();
      const result = await selectedClient.rpc(READ_RPC, {
        p_period_key: periodKey,
        p_period_keys: periodKeys,
      });
      throwIfAborted(context.signal);
      if (result?.error) {
        if (missingAuthority(result.error)) {
          fail("ADVISOR_COMPENSATION_REMOTE_AUTHORITY_NOT_DEPLOYED");
        }
        const error = new Error("ADVISOR_COMPENSATION_PRODUCTIVE_READ_FAILED", {
          cause: result.error,
        });
        error.code = result.error.code || "ADVISOR_COMPENSATION_PRODUCTIVE_READ_FAILED";
        throw error;
      }

      const payload = normalizeRpcPayload(result?.data);
      if (!payload || typeof payload !== "object") {
        fail("ADVISOR_COMPENSATION_PRODUCTIVE_RESPONSE_INVALID");
      }
      if (!payload.snapshot || !payload.history) {
        fail(payload.errorCode || "ADVISOR_COMPENSATION_PRODUCTIVE_READ_MODEL_UNAVAILABLE");
      }
      return Object.freeze({
        snapshot: payload.snapshot,
        history: payload.history,
        sourceState: payload.sourceState || null,
        sourceHealth: payload.sourceHealth || null,
        metadata: Object.freeze({
          providerId: PROVIDER_ID,
          remoteAuthority: true,
          readOnly: true,
          ...(payload.metadata || {}),
        }),
      });
    },
  });

  return api;
}

export async function installAdvisorCompensationSupabaseProvider100({
  bootstrap = null,
  globalObject = globalThis,
  signal = null,
} = {}) {
  const existing = globalObject[INSTALLATION];
  if (existing?.provider) return existing;

  const provider = createAdvisorCompensationSupabaseProvider100({ bootstrap });
  const probe = await provider.probe({ signal });
  if (!probe.available) {
    const result = Object.freeze({
      installed: false,
      provider: null,
      probe,
      providerId: PROVIDER_ID,
    });
    globalObject[INSTALLATION] = result;
    return result;
  }

  globalObject.ForgeAdvisorCompensationProductSource070 = provider;
  const result = Object.freeze({
    installed: true,
    provider,
    probe,
    providerId: PROVIDER_ID,
  });
  globalObject[INSTALLATION] = result;
  return result;
}

export function clearAdvisorCompensationSupabaseProvider100(globalObject = globalThis) {
  const installed = globalObject[INSTALLATION];
  if (installed?.provider && globalObject.ForgeAdvisorCompensationProductSource070 === installed.provider) {
    delete globalObject.ForgeAdvisorCompensationProductSource070;
  }
  delete globalObject[INSTALLATION];
}

export {
  PROVIDER_ID as ADVISOR_COMPENSATION_SUPABASE_PROVIDER_ID,
  INVENTORY_RPC as ADVISOR_COMPENSATION_INVENTORY_RPC,
  READ_RPC as ADVISOR_COMPENSATION_READ_RPC,
  missingAuthority,
  validPeriodKey,
};
