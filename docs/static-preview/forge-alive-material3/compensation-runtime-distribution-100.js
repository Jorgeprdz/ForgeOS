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

const PRODUCT_CONTRACT = "ADVISOR_COMPENSATION_PRODUCT_READ_MODEL_001";
const SNAPSHOT_CONTRACT = "ADVISOR_COMPENSATION_PERIOD_SNAPSHOT_001";
const HISTORY_CONTRACT = "ADVISOR_COMPENSATION_HISTORY_SERIES_001";
const PROVIDER_ID = "ADVISOR_COMPENSATION_SUPABASE_PROVIDER_100";
const INSTALLATION = Symbol.for("forge.advisor-compensation.provider.100");

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function validPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value, currency = "MXN") {
  if (!Number.isFinite(Number(value))) return "No disponible";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function monthLabel(periodKey) {
  if (!validPeriod(periodKey)) return "Periodo";
  const [year, month] = periodKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function disconnectedModel({ advisorReference, periodKey, periodKeys }) {
  return freeze({
    contractVersion: PRODUCT_CONTRACT,
    state: "DISCONNECTED",
    advisorReference,
    periodKey,
    periodKeys: [...periodKeys],
    snapshot: null,
    history: null,
    sourceHealth: {
      canonicalSnapshot: "DISCONNECTED",
      historicalSeries: "DISCONNECTED",
    },
    errorCode: null,
    stale: false,
    safeguards: {
      canonicalReadModelsOnly: true,
      indexedDbFallback: false,
      carteraFallback: false,
      uiCalculation: false,
      unknownIsNotZero: true,
    },
  });
}

function validateSnapshot(snapshot, advisorReference, periodKey) {
  if (snapshot?.contractVersion !== SNAPSHOT_CONTRACT) fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_CONTRACT_INVALID");
  if (snapshot.advisorReference !== advisorReference) fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_OWNER_MISMATCH");
  if (snapshot.periodKey !== periodKey) fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_PERIOD_MISMATCH");
  if (!/^[a-f0-9]{64}$/.test(snapshot.snapshotDigest || "")) fail("ADVISOR_COMPENSATION_UI_SNAPSHOT_DIGEST_INVALID");
}

function validateHistory(history, advisorReference, periodKeys) {
  if (history?.contractVersion !== HISTORY_CONTRACT) fail("ADVISOR_COMPENSATION_UI_HISTORY_CONTRACT_INVALID");
  if (history.advisorReference !== advisorReference) fail("ADVISOR_COMPENSATION_UI_HISTORY_OWNER_MISMATCH");
  if (!Array.isArray(history.points)) fail("ADVISOR_COMPENSATION_UI_HISTORY_POINTS_REQUIRED");
  const allowed = new Set(periodKeys);
  if (history.points.some((point) => !allowed.has(point.periodKey))) fail("ADVISOR_COMPENSATION_UI_HISTORY_PERIOD_MISMATCH");
  if (!/^[a-f0-9]{64}$/.test(history.seriesDigest || "")) fail("ADVISOR_COMPENSATION_UI_HISTORY_DIGEST_INVALID");
}

function mapState(result, snapshot) {
  if (Object.values(ADVISOR_COMPENSATION_UI_STATES).includes(result?.sourceState)) {
    return result.sourceState;
  }
  if (["READY", "PARTIAL", "EMPTY", "BLOCKED"].includes(snapshot?.status)) {
    return snapshot.status;
  }
  return "ERROR";
}

export function createAdvisorCompensationProductSource({
  providerResolver = () => globalThis.ForgeAdvisorCompensationProductSource070 || null,
} = {}) {
  return Object.freeze({
    async load({ advisorReference, periodKey, periodKeys, signal } = {}) {
      if (!advisorReference) fail("ADVISOR_COMPENSATION_UI_ADVISOR_REQUIRED");
      if (!validPeriod(periodKey)) fail("ADVISOR_COMPENSATION_UI_PERIOD_INVALID");
      if (!Array.isArray(periodKeys) || !periodKeys.length || periodKeys.some((item) => !validPeriod(item))) {
        fail("ADVISOR_COMPENSATION_UI_HISTORY_PERIODS_INVALID");
      }
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const provider = providerResolver();
      if (typeof provider?.loadCompensationProduct !== "function") {
        return disconnectedModel({ advisorReference, periodKey, periodKeys });
      }
      try {
        const result = await provider.loadCompensationProduct({
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          signal,
          readOnly: true,
        });
        if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
        validateSnapshot(result?.snapshot, advisorReference, periodKey);
        validateHistory(result?.history, advisorReference, periodKeys);
        const state = mapState(result, result.snapshot);
        return freeze({
          contractVersion: PRODUCT_CONTRACT,
          state,
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: clone(result.snapshot),
          history: clone(result.history),
          sourceHealth: clone(result.sourceHealth || result.snapshot.sourceHealth || {}),
          providerMetadata: clone(result.metadata || {}),
          errorCode: null,
          stale: state === "STALE",
          safeguards: {
            canonicalReadModelsOnly: true,
            indexedDbFallback: false,
            carteraFallback: false,
            uiCalculation: false,
            unknownIsNotZero: true,
          },
        });
      } catch (error) {
        if (error?.name === "AbortError" || signal?.aborted) throw error;
        return freeze({
          contractVersion: PRODUCT_CONTRACT,
          state: "ERROR",
          advisorReference,
          periodKey,
          periodKeys: [...periodKeys],
          snapshot: null,
          history: null,
          sourceHealth: { canonicalSnapshot: "ERROR", historicalSeries: "ERROR" },
          errorCode: error?.code || error?.message || "ADVISOR_COMPENSATION_UI_LOAD_FAILED",
          stale: false,
        });
      }
    },
  });
}

function missingAuthority(error) {
  const code = String(error?.code || "").toUpperCase();
  const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return ["42883", "PGRST202", "PGRST204"].includes(code)
    || text.includes("forge_advisor_compensation")
    || text.includes("schema cache")
    || text.includes("could not find the function");
}

function createSupabaseProvider(bootstrap) {
  let clientPromise = null;
  const selectedBootstrap = () => bootstrap || globalThis.ForgeProductiveProspectBootstrap067G17B || null;
  const client = async () => {
    const selected = selectedBootstrap();
    if (typeof selected?.getClient !== "function") fail("ADVISOR_COMPENSATION_PRODUCTIVE_BOOTSTRAP_UNAVAILABLE");
    if (!clientPromise) clientPromise = Promise.resolve(selected.getClient());
    return clientPromise;
  };
  const sessionAdvisor = async () => {
    const selected = selectedBootstrap();
    if (typeof selected?.getSession !== "function") return null;
    const result = await selected.getSession();
    if (result?.error) throw result.error;
    return result?.data?.session?.user?.id || null;
  };
  return Object.freeze({
    providerId: PROVIDER_ID,
    async probe() {
      try {
        const result = await (await client()).rpc("forge_advisor_compensation_authority_inventory");
        if (result?.error) {
          if (missingAuthority(result.error)) return { available: false, reason: "REMOTE_AUTHORITY_NOT_DEPLOYED" };
          throw result.error;
        }
        const inventory = Array.isArray(result?.data) ? result.data[0] : result?.data;
        return { available: inventory?.ready === true, reason: inventory?.ready === true ? null : "REMOTE_AUTHORITY_INCOMPLETE", inventory };
      } catch (error) {
        return { available: false, reason: missingAuthority(error) ? "REMOTE_AUTHORITY_NOT_DEPLOYED" : (error?.code || error?.message || "PROBE_FAILED") };
      }
    },
    async loadCompensationProduct({ advisorReference, periodKey, periodKeys, signal }) {
      const advisor = await sessionAdvisor();
      if (!advisor) fail("SESSION_REQUIRED");
      if (advisor !== advisorReference) fail("ADVISOR_COMPENSATION_PRODUCTIVE_OWNER_MISMATCH");
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const result = await (await client()).rpc("forge_advisor_compensation_read_product", {
        p_period_key: periodKey,
        p_period_keys: periodKeys,
      });
      if (result?.error) {
        const error = new Error("ADVISOR_COMPENSATION_PRODUCTIVE_READ_FAILED", { cause: result.error });
        error.code = result.error.code || "ADVISOR_COMPENSATION_PRODUCTIVE_READ_FAILED";
        throw error;
      }
      const payload = Array.isArray(result?.data) ? result.data[0] : result?.data;
      if (!payload?.snapshot || !payload?.history) fail(payload?.errorCode || "ADVISOR_COMPENSATION_PRODUCTIVE_READ_MODEL_UNAVAILABLE");
      return payload;
    },
  });
}

export async function installAdvisorCompensationSupabaseProvider100({
  bootstrap = null,
  globalObject = globalThis,
} = {}) {
  if (globalObject[INSTALLATION]?.provider) return globalObject[INSTALLATION];
  const provider = createSupabaseProvider(bootstrap);
  const probe = await provider.probe();
  if (!probe.available) {
    const result = freeze({ installed: false, provider: null, probe, providerId: PROVIDER_ID });
    globalObject[INSTALLATION] = result;
    return result;
  }
  globalObject.ForgeAdvisorCompensationProductSource070 = provider;
  const result = freeze({ installed: true, provider, probe, providerId: PROVIDER_ID });
  globalObject[INSTALLATION] = result;
  return result;
}

function statePanel(state, errorCode) {
  const copy = {
    LOADING: ["Cargando compensación", "Estamos leyendo el snapshot mensual y su historial canónico."],
    EMPTY: ["Sin movimientos en este periodo", "La fuente está disponible y no reportó compensación para este mes."],
    BLOCKED: ["Compensación bloqueada", "Falta evidencia o existe un conflicto que impide presentar una conclusión económica."],
    ERROR: ["No pudimos leer Comisiones", "La fuente respondió con un error. No mostramos cifras anteriores como actuales."],
    DISCONNECTED: ["Fuente de compensación desconectada", "No usamos Cartera, primas, cotizaciones ni IndexedDB como sustituto."],
  }[state] || ["Compensación no disponible", "No existe una conclusión económica disponible."];
  return `<section class="comp-state" data-compensation-state="${state}" role="status"><div><h2>${copy[0]}</h2><p>${copy[1]}</p>${errorCode ? `<code>${escapeHtml(errorCode)}</code>` : ""}</div></section>`;
}

function card(key, title, value, currency, truth, caption) {
  return `<article class="comp-card" data-compensation-card="${key}"><span>${title}</span><b>${truth}</b><strong>${escapeHtml(formatMoney(value, currency))}</strong><p>${caption}</p></article>`;
}

export function renderAdvisorCompensationProduct(readModel = { state: "LOADING" }) {
  const state = ADVISOR_COMPENSATION_UI_STATES[readModel.state] || "ERROR";
  const styles = `<style data-advisor-compensation-style="100">
    .comp-shell{box-sizing:border-box;display:grid;gap:16px;width:100%;min-width:0;max-width:1280px;margin:0 auto;padding:clamp(14px,3vw,28px);padding-bottom:calc(116px + env(safe-area-inset-bottom));overflow-x:hidden;color:var(--text,#eef4ff)}
    .comp-shell *{box-sizing:border-box}.comp-header{display:flex;justify-content:space-between;gap:12px;align-items:end}.comp-header h1{margin:0}.comp-header p{margin:4px 0 0;color:var(--muted,#9ba9bd)}
    .comp-period-nav{display:flex;gap:8px}.comp-period-nav button{min-height:44px;min-width:44px;border-radius:14px;border:1px solid var(--separator,#324057);background:var(--card-bg,#101a2a);color:inherit}
    .comp-hero,.comp-card,.comp-section,.comp-state,.comp-simulator{min-width:0;border:1px solid var(--separator,#324057);background:var(--card-bg,#101a2a);border-radius:20px;padding:18px}.comp-hero strong{display:block;font-size:clamp(2rem,7vw,4rem);overflow-wrap:anywhere}.comp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.comp-card{display:grid;gap:8px}.comp-card b{font-size:.68rem;text-transform:uppercase;color:var(--accent,#9be8ff)}.comp-card strong{font-size:clamp(1.2rem,3vw,1.8rem);overflow-wrap:anywhere}.comp-card p{margin:0;color:var(--muted,#9ba9bd)}
    .comp-history{display:grid;grid-template-columns:repeat(6,minmax(70px,1fr));gap:8px;overflow-x:auto;max-width:100%}.comp-history div{display:grid;gap:6px;text-align:center}.comp-details{display:grid;gap:8px}.comp-details details{border:1px solid var(--separator,#324057);border-radius:14px;padding:12px;overflow-wrap:anywhere}.comp-state{min-height:210px;display:grid;place-items:center;text-align:center}.comp-simulator{border-style:dashed}.comp-simulator strong{display:block}.comp-banner{padding:12px;border-radius:14px;background:#4b3514;color:#ffe1a3}
    @media(max-width:900px){.comp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.comp-header{align-items:start;flex-direction:column}.comp-period-nav{width:100%}.comp-period-nav button{flex:1}.comp-grid{grid-template-columns:1fr}}
  </style>`;
  if (!["READY", "PARTIAL", "STALE"].includes(state)) {
    return `${styles}<section class="comp-shell" data-advisor-compensation-ui="070" data-compensation-state="${state}">${statePanel(state, readModel.errorCode)}</section>`;
  }
  const snapshot = readModel.snapshot || {};
  const amounts = snapshot.amounts || {};
  const currency = snapshot.currency || "MXN";
  const realBasis = amounts.real?.basis || "UNAVAILABLE";
  const points = Array.isArray(readModel.history?.points) ? readModel.history.points : [];
  const aggregates = Array.isArray(snapshot.details?.aggregates) ? snapshot.details.aggregates : [];
  return `${styles}<section class="comp-shell" data-advisor-compensation-ui="070" data-compensation-state="${state}">
    <header class="comp-header"><div><h1>Comisiones</h1><p>${escapeHtml(monthLabel(readModel.periodKey))}</p></div><nav class="comp-period-nav"><button data-comp-period-offset="-1" aria-label="Mes anterior">←</button><button data-comp-refresh aria-label="Actualizar">↻</button><button data-comp-period-offset="1" aria-label="Mes siguiente">→</button></nav></header>
    ${state === "PARTIAL" ? '<div class="comp-banner">Esta vista es parcial; los valores desconocidos permanecen como no disponibles.</div>' : ""}
    ${state === "STALE" ? '<div class="comp-banner">La información está desactualizada y requiere actualización.</div>' : ""}
    <section class="comp-hero"><span>Ingreso real · ${escapeHtml(realBasis)}</span><strong>${escapeHtml(formatMoney(amounts.real?.value, currency))}</strong><p>La base siempre se declara: PAID, EARNED o UNAVAILABLE.</p></section>
    <section class="comp-grid">
      ${card("paid", "Pagado", amounts.paid?.value, currency, "PAID", "Solo evidencia de payout confirmada.")}
      ${card("earned", "Devengado neto", amounts.earned?.net, currency, "EARNED", "Ganado menos ajustes y reversiones.")}
      ${card("estimated", "Estimado", amounts.estimated, currency, "ESTIMATED", "No se cuenta como ingreso real.")}
      ${card("potential", "Potencial", amounts.potential, currency, "POTENTIAL", "Señal futura separada.")}
      ${card("at-risk", "En riesgo", amounts.atRisk, currency, "AT_RISK", "No se descuenta silenciosamente.")}
      ${card("adjustments", "Ajustes", amounts.earned?.adjustments, currency, "ADJUSTED", "Deltas append-only.")}
      ${card("reversals", "Reversiones", amounts.earned?.reversals, currency, "REVERSED", "Eventos negativos explícitos.")}
    </section>
    <section class="comp-section"><h2>Histórico</h2><div class="comp-history">${points.map((point) => `<div data-compensation-history-period="${escapeHtml(point.periodKey)}"><strong>${escapeHtml(formatMoney(point.real ?? point.paid ?? point.earnedNet, currency))}</strong><span>${escapeHtml(point.periodKey)}</span><small>${escapeHtml(point.realBasis || "UNAVAILABLE")}</small></div>`).join("")}</div></section>
    <section class="comp-section"><h2>Detalle explicable</h2><div class="comp-details">${aggregates.map((item) => `<details data-compensation-aggregate="${escapeHtml(item.aggregateKey)}"><summary>${escapeHtml(item.concept || item.aggregateKey)}</summary><p>Evento: ${escapeHtml(item.latestEventId || "No disponible")}</p><p>Calculation digest: ${escapeHtml(item.sourceCalculationDigest || "No disponible")}</p><p>Rule Pack digest: ${escapeHtml(item.rulePackDigest || "No disponible")}</p></details>`).join("") || "<p>Sin agregados disponibles.</p>"}</div></section>
    <section class="comp-simulator" data-compensation-simulator-boundary="separate"><strong>SIMULATION ≠ TRUTH</strong><p>Los escenarios nunca modifican PAID, EARNED ni REAL.</p></section>
  </section>`;
}

export const ADVISOR_COMPENSATION_DISTRIBUTION_CONTRACT = Object.freeze({
  contractVersion: "ADVISOR_COMPENSATION_PAGES_DISTRIBUTION_100",
  productContract: PRODUCT_CONTRACT,
  snapshotContract: SNAPSHOT_CONTRACT,
  historyContract: HISTORY_CONTRACT,
  readOnly: true,
  calculationEngineIncluded: false,
  payoutMutationIncluded: false,
});
