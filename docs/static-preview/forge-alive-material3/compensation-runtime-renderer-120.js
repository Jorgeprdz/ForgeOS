export {
  ADVISOR_COMPENSATION_UI_STATES,
  createAdvisorCompensationProductSource,
  installAdvisorCompensationSupabaseProvider100,
  ADVISOR_COMPENSATION_DISTRIBUTION_CONTRACT,
} from "./compensation-runtime-distribution-100.js?v=advisor-compensation-provider-100";

const RENDERABLE_STATES = new Set(["READY", "PARTIAL", "STALE"]);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function validPeriod(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(value || ""));
}

function knownNumber(value) {
  return value !== null
    && value !== undefined
    && value !== ""
    && Number.isFinite(Number(value));
}

function formatMoney(value, currency = "MXN") {
  if (!knownNumber(value)) return "No disponible";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function valueState(value) {
  return knownNumber(value) ? "available" : "unavailable";
}

function truthForValue(value, truth) {
  return knownNumber(value) ? truth : "UNAVAILABLE";
}

function firstKnown(values) {
  return values.find(knownNumber) ?? null;
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

function statePanel(state, errorCode) {
  const copy = {
    LOADING: ["Cargando compensación", "Estamos leyendo el snapshot mensual y su historial canónico."],
    EMPTY: ["Sin movimientos en este periodo", "La fuente está disponible y confirmó que no hubo compensación para este mes."],
    BLOCKED: ["Compensación bloqueada", "Falta evidencia o existe un conflicto que impide presentar una conclusión económica."],
    ERROR: ["No pudimos leer Comisiones", "La fuente respondió con un error. No mostramos cifras anteriores como actuales."],
    DISCONNECTED: ["Fuente de compensación desconectada", "No usamos Cartera, primas, cotizaciones ni IndexedDB como sustituto."],
  }[state] || ["Compensación no disponible", "No existe una conclusión económica disponible."];
  return `<section class="comp-state" data-compensation-state="${escapeHtml(state)}" role="status"><div><h2>${escapeHtml(copy[0])}</h2><p>${escapeHtml(copy[1])}</p>${errorCode ? `<code>${escapeHtml(errorCode)}</code>` : ""}</div></section>`;
}

function card(key, title, value, currency, truth, availableCaption, unavailableCaption) {
  const state = valueState(value);
  const renderedTruth = truthForValue(value, truth);
  return `<article class="comp-card" data-compensation-card="${escapeHtml(key)}" data-compensation-value-state="${state}">
    <span>${escapeHtml(title)}</span>
    <b>${escapeHtml(renderedTruth)}</b>
    <strong class="comp-value comp-value--${state}" data-compensation-value>${escapeHtml(formatMoney(value, currency))}</strong>
    <p>${escapeHtml(state === "available" ? availableCaption : unavailableCaption)}</p>
  </article>`;
}

export function renderAdvisorCompensationProduct(readModel = { state: "LOADING" }) {
  const state = String(readModel?.state || "ERROR").toUpperCase();
  const styles = `<style data-advisor-compensation-style="120">
    .comp-shell{box-sizing:border-box;display:grid;gap:16px;width:100%;min-width:0;max-width:1280px;margin:0 auto;padding:clamp(14px,3vw,28px);padding-bottom:calc(116px + env(safe-area-inset-bottom));scroll-padding-bottom:calc(116px + env(safe-area-inset-bottom));overflow-x:hidden;color:var(--text,#eef4ff)}
    .comp-shell *{box-sizing:border-box}.comp-header{display:flex;justify-content:space-between;gap:12px;align-items:end}.comp-header h1{margin:0}.comp-header p{margin:4px 0 0;color:var(--muted,#9ba9bd)}
    .comp-period-nav{display:flex;gap:8px}.comp-period-nav button{min-height:44px;min-width:44px;border-radius:14px;border:1px solid var(--separator,#324057);background:var(--card-bg,#101a2a);color:inherit}
    .comp-hero,.comp-card,.comp-section,.comp-state,.comp-simulator{min-width:0;border:1px solid var(--separator,#324057);background:var(--card-bg,#101a2a);border-radius:20px;padding:18px}.comp-hero strong{display:block;font-size:clamp(2rem,7vw,4rem);overflow-wrap:anywhere}.comp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.comp-card{display:grid;gap:8px}.comp-card b{font-size:.68rem;text-transform:uppercase;color:var(--accent,#9be8ff)}.comp-card strong{font-size:clamp(1.2rem,3vw,1.8rem);overflow-wrap:anywhere}.comp-card p{margin:0;color:var(--muted,#9ba9bd)}
    .comp-value--unavailable{font-size:clamp(1.05rem,4vw,1.45rem)!important;line-height:1.2;color:var(--muted,#9ba9bd)}
    .comp-history{display:grid;grid-template-columns:repeat(6,minmax(92px,1fr));gap:8px;overflow-x:auto;max-width:100%}.comp-history div{display:grid;gap:6px;text-align:center}.comp-history strong{overflow-wrap:anywhere}.comp-details{display:grid;gap:8px}.comp-details details{border:1px solid var(--separator,#324057);border-radius:14px;padding:12px;overflow-wrap:anywhere}.comp-state{min-height:210px;display:grid;place-items:center;text-align:center}.comp-state code{white-space:normal;overflow-wrap:anywhere}.comp-simulator{border-style:dashed;scroll-margin-bottom:232px}.comp-simulator strong{display:block}.comp-banner{padding:12px;border-radius:14px;background:#4b3514;color:#ffe1a3}
    @media(max-width:900px){.comp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:620px){.comp-shell{padding-bottom:calc(232px + env(safe-area-inset-bottom));scroll-padding-bottom:calc(232px + env(safe-area-inset-bottom))}.comp-header{align-items:start;flex-direction:column}.comp-period-nav{width:100%}.comp-period-nav button{flex:1}.comp-grid{grid-template-columns:1fr}}
  </style>`;

  if (!RENDERABLE_STATES.has(state)) {
    return `${styles}<section class="comp-shell" data-advisor-compensation-ui="070" data-compensation-renderer="120" data-compensation-state="${escapeHtml(state)}">${statePanel(state, readModel.errorCode)}</section>`;
  }

  const snapshot = readModel.snapshot || {};
  const amounts = snapshot.amounts || {};
  const currency = snapshot.currency || "MXN";
  const realValue = amounts.real?.value;
  const realBasis = truthForValue(realValue, amounts.real?.basis || "UNAVAILABLE");
  const points = Array.isArray(readModel.history?.points) ? readModel.history.points : [];
  const aggregates = Array.isArray(snapshot.details?.aggregates) ? snapshot.details.aggregates : [];

  return `${styles}<section class="comp-shell" data-advisor-compensation-ui="070" data-compensation-renderer="120" data-compensation-state="${escapeHtml(state)}">
    <header class="comp-header"><div><h1>Comisiones</h1><p>${escapeHtml(monthLabel(readModel.periodKey))}</p></div><nav class="comp-period-nav"><button data-comp-period-offset="-1" aria-label="Mes anterior">←</button><button data-comp-refresh aria-label="Actualizar">↻</button><button data-comp-period-offset="1" aria-label="Mes siguiente">→</button></nav></header>
    ${state === "PARTIAL" ? '<div class="comp-banner">Esta vista es parcial: los valores desconocidos permanecen como “No disponible”.</div>' : ""}
    ${state === "STALE" ? '<div class="comp-banner">La información está desactualizada y requiere actualización.</div>' : ""}
    <section class="comp-hero" data-compensation-value-state="${valueState(realValue)}"><span>Ingreso real · ${escapeHtml(realBasis)}</span><strong class="comp-value comp-value--${valueState(realValue)}" data-compensation-value>${escapeHtml(formatMoney(realValue, currency))}</strong><p>La base siempre se declara: PAID, EARNED o UNAVAILABLE.</p></section>
    <section class="comp-grid">
      ${card("paid", "Pagado", amounts.paid?.value, currency, "PAID", "Solo evidencia de payout confirmada.", "La fuente de payout no confirmó un importe.")}
      ${card("earned", "Devengado neto", amounts.earned?.net, currency, "EARNED", "Ganado menos ajustes y reversiones.", "No existen eventos devengados disponibles para este periodo.")}
      ${card("estimated", "Estimado", amounts.estimated, currency, "ESTIMATED", "No se cuenta como ingreso real.", "No existe una estimación canónica disponible.")}
      ${card("potential", "Potencial", amounts.potential, currency, "POTENTIAL", "Señal futura separada.", "La fuente de señales futuras está desconectada.")}
      ${card("at-risk", "En riesgo", amounts.atRisk, currency, "AT_RISK", "No se descuenta silenciosamente.", "No existe una señal de riesgo disponible.")}
      ${card("adjustments", "Ajustes", amounts.earned?.adjustments, currency, "ADJUSTED", "Deltas append-only.", "No existen ajustes disponibles para este periodo.")}
      ${card("reversals", "Reversiones", amounts.earned?.reversals, currency, "REVERSED", "Eventos negativos explícitos.", "No existen reversiones disponibles para este periodo.")}
    </section>
    <section class="comp-section"><h2>Histórico</h2><div class="comp-history">${points.map((point) => {
      const value = firstKnown([point.real, point.paid, point.earnedNet, point.estimated]);
      return `<div data-compensation-history-period="${escapeHtml(point.periodKey)}" data-compensation-value-state="${valueState(value)}"><strong class="comp-value comp-value--${valueState(value)}" data-compensation-value>${escapeHtml(formatMoney(value, currency))}</strong><span>${escapeHtml(point.periodKey)}</span><small>${escapeHtml(truthForValue(value, point.realBasis || "UNAVAILABLE"))}</small></div>`;
    }).join("")}</div></section>
    <section class="comp-section"><h2>Detalle explicable</h2><div class="comp-details">${aggregates.map((item) => `<details data-compensation-aggregate="${escapeHtml(item.aggregateKey)}"><summary>${escapeHtml(item.concept || item.aggregateKey)}</summary><p>Evento: ${escapeHtml(item.latestEventId || "No disponible")}</p><p>Calculation digest: ${escapeHtml(item.sourceCalculationDigest || "No disponible")}</p><p>Rule Pack digest: ${escapeHtml(item.rulePackDigest || "No disponible")}</p></details>`).join("") || "<p>Sin agregados disponibles.</p>"}</div></section>
    <section class="comp-simulator" data-compensation-simulator-boundary="separate"><strong>SIMULATION ≠ TRUTH</strong><p>Los escenarios nunca modifican PAID, EARNED ni REAL.</p></section>
  </section>`;
}

export const ADVISOR_COMPENSATION_RENDERER_120_CONTRACT = Object.freeze({
  contractVersion: "ADVISOR_COMPENSATION_RENDERER_120",
  unknownIsNotZero: true,
  nullRendersAs: "No disponible",
  explicitKnownZeroRendersAsCurrency: true,
  mobileBottomClearancePx: 232,
  floatingNavigationPreserved: true,
});
