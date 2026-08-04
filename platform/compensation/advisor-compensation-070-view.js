const UI_STATES = new Set([
  "LOADING", "READY", "PARTIAL", "EMPTY", "BLOCKED",
  "STALE", "ERROR", "DISCONNECTED",
]);

const STATE_COPY = Object.freeze({
  LOADING: {
    title: "Cargando compensación",
    body: "Estamos consultando la información disponible para este mes.",
  },
  EMPTY: {
    title: "Sin movimientos en este periodo",
    body: "La fuente está disponible y no reportó compensación para este mes.",
  },
  BLOCKED: {
    title: "Compensación bloqueada",
    body: "Falta evidencia o existe un conflicto que impide presentar una conclusión económica.",
  },
  ERROR: {
    title: "No pudimos leer Comisiones",
    body: "La fuente respondió con un error. No mostramos cifras anteriores como si fueran actuales.",
  },
  DISCONNECTED: {
    title: "Fuente de compensación desconectada",
    body: "No pudimos consultar la información de Comisiones en este momento.",
  },
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value, currency = "MXN") {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "No disponible";
  }
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function monthLabel(periodKey) {
  if (!/^\d{4}-\d{2}$/.test(periodKey || "")) return "Periodo";
  const [year, month] = periodKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function truthLabel(realBasis) {
  if (realBasis === "PAID") return "Pagado confirmado";
  if (realBasis === "EARNED") return "Devengado";
  return "No disponible";
}

function sourceTone(state) {
  if (state === "READY") return "positive";
  if (state === "PARTIAL" || state === "STALE") return "warning";
  if (state === "EMPTY") return "neutral";
  return "danger";
}

function humanState(value) {
  const states = {
    PAID: "Pagado",
    CONFIRMED_PAID: "Pago confirmado",
    CONFIRMED: "Confirmado",
    EARNED: "Devengado",
    ESTIMATED: "Estimado",
    PROJECTED: "Proyectado",
    POTENTIAL: "Potencial",
    ADJUSTED: "Con ajustes",
    REVERSED: "Con reversión",
    PENDING: "Pendiente",
    STALE: "Desactualizado",
    CONFLICTING: "En conflicto",
    UNKNOWN: "Sin confirmar",
  };
  return states[String(value || "UNKNOWN").toUpperCase()] || "Requiere revisión";
}

function renderStatePanel(state, errorCode = null) {
  const copy = STATE_COPY[state] || STATE_COPY.ERROR;
  return `
    <section class="comp-state comp-state--${state.toLowerCase()}"
      data-compensation-state="${escapeHtml(state)}" role="status">
      <span class="comp-state__icon" aria-hidden="true">${
        state === "LOADING" ? "◌" :
        state === "EMPTY" ? "○" :
        state === "DISCONNECTED" ? "↯" : "!"
      }</span>
      <div>
        <h2>${escapeHtml(copy.title)}</h2>
        <p>${escapeHtml(copy.body)}</p>
        ${errorCode ? `<code>${escapeHtml(errorCode)}</code>` : ""}
      </div>
    </section>`;
}

function card({ key, title, value, currency, caption, truth }) {
  return `
    <article class="comp-card" data-compensation-card="${escapeHtml(key)}">
      <div class="comp-card__heading">
        <span>${escapeHtml(title)}</span>
        ${truth ? `<span class="comp-truth comp-truth--${escapeHtml(truth.toLowerCase())}">${escapeHtml(humanState(truth))}</span>` : ""}
      </div>
      <strong>${escapeHtml(formatCurrency(value, currency))}</strong>
      <p>${escapeHtml(caption)}</p>
    </article>`;
}

function pointValue(point) {
  if (!point || !["PAID", "EARNED"].includes(point.realBasis)) return null;
  const candidates = [point.real, point.paid, point.earnedNet, point.estimated];
  return candidates.find((value) => Number.isFinite(value)) ?? null;
}

function renderHistory(history, currency) {
  const points = Array.isArray(history?.points) ? history.points : [];
  if (!points.length) {
    return `<div class="comp-history__empty">No hay meses disponibles para graficar.</div>`;
  }
  const max = Math.max(1, ...points.map((point) => Math.abs(pointValue(point) ?? 0)));
  return `
    <div class="comp-history__chart" role="img"
      aria-label="Histórico de compensación de seis meses">
      ${points.map((point) => {
        const amount = pointValue(point);
        const available = amount !== null;
        const height = available ? Math.max(4, Math.round(Math.abs(amount) / max * 100)) : 0;
        return `
          <div class="comp-history__column" data-compensation-history-period="${escapeHtml(point.periodKey)}" data-comp-history-state="${available ? "AVAILABLE" : "UNAVAILABLE"}">
            <span class="comp-history__value">${escapeHtml(formatCurrency(amount, currency))}</span>
            <span class="comp-history__bar" style="--comp-bar:${height}%" ${available ? "" : "hidden"}></span>
            <span class="comp-history__label">${escapeHtml(point.periodKey.slice(5))}</span>
            <span class="comp-truth comp-truth--${escapeHtml(String(point.realBasis || "unavailable").toLowerCase())}">
              ${escapeHtml(truthLabel(point.realBasis))}
            </span>
          </div>`;
      }).join("")}
    </div>`;
}

function renderEvidence(snapshot, currency) {
  const aggregates = Array.isArray(snapshot?.details?.aggregates)
    ? snapshot.details.aggregates
    : [];
  if (!aggregates.length) {
    return `<p class="comp-detail__empty">No hay movimientos detallables en el periodo.</p>`;
  }
  return aggregates.map((aggregate) => `
    <details class="comp-detail" data-compensation-aggregate="${escapeHtml(aggregate.aggregateKey)}" data-comp-search="${escapeHtml(`${aggregate.concept || ""} ${aggregate.policyReference || ""} ${aggregate.latestState || ""}`.toLowerCase())}">
      <summary>
        <span>
          <strong>${escapeHtml(aggregate.concept || "Compensación")}</strong>
          <small>${escapeHtml(aggregate.policyReference || "Sin referencia de póliza")}</small>
        </span>
        <span>${escapeHtml(formatCurrency(
          aggregate.earnedEventId ? aggregate.earnedNetAmount : aggregate.estimatedAmount,
          currency,
        ))}</span>
      </summary>
      <dl>
        <div><dt>Estado</dt><dd>${escapeHtml(humanState(aggregate.latestState))}</dd></div>
        <div><dt>Estimado</dt><dd>${escapeHtml(formatCurrency(aggregate.estimatedAmount, currency))}</dd></div>
        <div><dt>Devengado bruto</dt><dd>${escapeHtml(formatCurrency(aggregate.earnedGrossAmount, currency))}</dd></div>
        <div><dt>Ajustes</dt><dd>${escapeHtml(formatCurrency(aggregate.adjustmentAmount, currency))}</dd></div>
        <div><dt>Reversiones</dt><dd>${escapeHtml(formatCurrency(aggregate.reversalAmount, currency))}</dd></div>
        <div><dt>Devengado neto</dt><dd>${escapeHtml(formatCurrency(aggregate.earnedNetAmount, currency))}</dd></div>
        <div><dt>Cálculo verificable</dt><dd>${aggregate.sourceCalculationDigest ? "Disponible" : "No disponible"}</dd></div>
        <div><dt>Reglas verificables</dt><dd>${aggregate.rulePackDigest ? "Disponibles" : "No disponibles"}</dd></div>
      </dl>
      <p class="comp-detail__explanation">
        El importe conserva su historial. Los ajustes y las reversiones se muestran por separado para que puedas revisar cómo cambió.
      </p>
    </details>`).join("");
}

function renderAttentionQueue(snapshot, currency) {
  const aggregates = Array.isArray(snapshot?.details?.aggregates) ? snapshot.details.aggregates : [];
  const attention = aggregates.filter(aggregate => (
    !["PAID", "CONFIRMED_PAID"].includes(String(aggregate.latestState || "").toUpperCase())
    || !aggregate.policyReference
    || !aggregate.rulePackDigest
  )).slice(0, 8);
  if (!attention.length) {
    const noEvidence = aggregates.length === 0;
    return `<div class="comp-attention__empty" data-comp-attention-state="${noEvidence ? "UNAVAILABLE" : "EMPTY"}">
      <p>${noEvidence ? "Todavía no hay movimientos disponibles para este periodo." : "No hay movimientos pendientes de revisión para este periodo."}</p>
      ${noEvidence ? '<button type="button" data-comp-refresh>Reintentar lectura productiva</button>' : ""}
    </div>`;
  }
  return `<div class="comp-attention" data-comp-attention-state="READY">${attention.map(aggregate => `
    <button type="button" class="comp-attention__item" data-comp-open-policy="${escapeHtml(aggregate.policyReference || "")}" ${aggregate.policyReference ? "" : "disabled"}>
      <span><strong>${escapeHtml(aggregate.concept || "Movimiento de comisión")}</strong><small>${escapeHtml(aggregate.policyReference || "Sin póliza relacionada")}</small></span>
      <span><b>${escapeHtml(formatCurrency(aggregate.earnedEventId ? aggregate.earnedNetAmount : aggregate.estimatedAmount, currency))}</b><small>${escapeHtml(humanState(aggregate.latestState))}</small></span>
    </button>`).join("")}</div>`;
}

function renderSourceHealth(sourceHealth = {}) {
  const entries = Object.entries(sourceHealth);
  if (!entries.length) return "";
  return `
    <div class="comp-source-health" aria-label="Estado de fuentes">
      ${entries.map(([name, state]) => `
        <span data-compensation-source="${escapeHtml(name)}"
          data-source-state="${escapeHtml(state)}">
          ${escapeHtml(name)} · ${escapeHtml(state)}
        </span>`).join("")}
    </div>`;
}

function renderProduct(readModel) {
  const { snapshot, history } = readModel;
  const amounts = snapshot.amounts;
  const currency = snapshot.currency || "MXN";
  const real = amounts.real;
  const paid = amounts.paid;
  const aggregates = Array.isArray(snapshot?.details?.aggregates) ? snapshot.details.aggregates : [];
  const explicitEvidence = snapshot?.amountEvidence || snapshot?.evidenceStates || {};
  const evidenceAvailable = (key, predicate) => {
    const state = String(explicitEvidence[key] || "").toUpperCase();
    if (["AVAILABLE", "CONFIRMED", "KNOWN_ZERO"].includes(state)) return true;
    return aggregates.some(predicate);
  };
  const evidenced = (key, value, predicate) => evidenceAvailable(key, predicate) ? value : null;
  const hasEarnedEvent = aggregate => Boolean(aggregate?.earnedEventId);
  const hasEstimatedEvent = aggregate => Boolean(aggregate)
    && !aggregate.earnedEventId
    && Number.isFinite(Number(aggregate.estimatedAmount));
  const tone = sourceTone(readModel.state);
  const partialBanner = readModel.state === "PARTIAL"
    ? `<div class="comp-banner comp-banner--warning">La vista es parcial: las cifras desconocidas permanecen como “No disponible”.</div>`
    : "";
  const staleBanner = readModel.state === "STALE"
    ? `<div class="comp-banner comp-banner--warning">La información disponible puede no estar actualizada.</div>`
    : "";

  return `
    ${partialBanner}${staleBanner}
    <section class="comp-hero comp-hero--${tone}">
      <div>
        <span class="comp-eyebrow">Ingreso real del periodo</span>
        <strong>${escapeHtml(formatCurrency(real.value, currency))}</strong>
        <span class="comp-truth comp-truth--${escapeHtml(real.basis.toLowerCase())}">
          ${escapeHtml(truthLabel(real.basis))}
        </span>
      </div>
      <p>Esta cifra se muestra únicamente cuando existe información suficiente para respaldarla.</p>
    </section>

    <section class="comp-grid" aria-label="Resumen mensual de compensación">
      ${card({
        key: "paid", title: "Pagado", value: paid.value, currency,
        caption: paid.value === null
          ? "La fuente de payout no está disponible."
          : "Con evidencia de payout y confirmación humana.",
        truth: "PAID",
      })}
      ${card({
        key: "earned", title: "Devengado neto", value: evidenced("earned", amounts.earned.net, hasEarnedEvent), currency,
        caption: "Cifra respaldada por las reglas y movimientos del periodo.",
        truth: "EARNED",
      })}
      ${card({
        key: "estimated", title: "Estimado", value: evidenced("estimated", amounts.estimated, hasEstimatedEvent), currency,
        caption: "Cálculo todavía no promovido a devengado.",
        truth: "ESTIMATED",
      })}
    </section>

    <details class="comp-secondary-summary" data-compensation-secondary-summary>
      <summary>Ver potencial, riesgo, ajustes y reversiones</summary>
      <div class="comp-grid comp-grid--secondary">
        ${card({ key: "potential", title: "Proyectado / potencial", value: evidenced("potential", amounts.potential, aggregate => Number.isFinite(Number(aggregate?.potentialAmount))), currency, caption: "Escenario futuro; no forma parte del ingreso real y no es ingreso garantizado.", truth: "PROJECTED" })}
        ${card({ key: "at-risk", title: "En riesgo", value: evidenced("atRisk", amounts.atRisk, aggregate => Number.isFinite(Number(aggregate?.atRiskAmount))), currency, caption: "Señal explícita; no se descuenta silenciosamente.", truth: "AT_RISK" })}
        ${card({ key: "adjustments", title: "Ajustes", value: evidenced("adjustments", amounts.earned.adjustments, aggregate => hasEarnedEvent(aggregate) && Number.isFinite(Number(aggregate.adjustmentAmount))), currency, caption: "Deltas documentados sobre compensación devengada.", truth: "ADJUSTED" })}
        ${card({ key: "reversals", title: "Reversiones", value: evidenced("reversals", amounts.earned.reversals, aggregate => hasEarnedEvent(aggregate) && Number.isFinite(Number(aggregate.reversalAmount))), currency, caption: "Eventos negativos que preservan la historia original.", truth: "REVERSED" })}
      </div>
    </details>

    <section class="comp-section comp-section--attention">
      <header><div><span class="comp-eyebrow">COLA OPERATIVA</span><h2>Movimientos que requieren atención</h2><p>Abre la póliza de origen sin perder el periodo actual.</p></div></header>
      ${renderAttentionQueue(snapshot, currency)}
    </section>

    <section class="comp-section">
      <header><div><span class="comp-eyebrow">Últimos seis meses</span><h2>Histórico canónico</h2></div></header>
      ${renderHistory(history, currency)}
    </section>

    <section class="comp-section">
      <header class="comp-evidence-header"><div><span class="comp-eyebrow">Explicabilidad</span><h2>Movimientos y evidencia</h2></div><label class="comp-search"><span>Buscar</span><input type="search" data-comp-search-input placeholder="Póliza, concepto o estado"></label></header>
      <div class="comp-details">${renderEvidence(snapshot, currency)}</div>
    </section>

    <aside class="comp-simulator" data-compensation-simulator-boundary="separate">
      <div>
        <span class="comp-eyebrow">Escenario separado</span>
        <h2>Simulador de comisiones</h2>
        <p>Una simulación nunca modifica ni se suma a Pagado, Devengado o Ingreso real.</p>
      </div>
      <span class="comp-truth comp-truth--simulation">Escenario, no ingreso confirmado</span>
    </aside>`;
}

export function renderAdvisorCompensationProduct(readModel = { state: "LOADING" }) {
  const state = UI_STATES.has(readModel.state) ? readModel.state : "ERROR";
  const periodKey = readModel.periodKey || new Date().toISOString().slice(0, 7);
  const content = ["READY", "PARTIAL", "STALE"].includes(state)
    ? renderProduct(readModel)
    : renderStatePanel(state, readModel.errorCode);

  return `
    <div class="comp-shell" data-advisor-compensation-ui="070"
      data-compensation-state="${escapeHtml(state)}">
      <header class="comp-header">
        <div>
          <span class="comp-eyebrow">Resumen del periodo</span>
          <h1>Comisiones</h1>
          <p>${escapeHtml(monthLabel(periodKey))}</p>
        </div>
        <div class="comp-period-nav" aria-label="Cambiar periodo">
          <button type="button" data-comp-period-offset="-1" aria-label="Mes anterior">←</button>
          <button type="button" data-comp-refresh>Actualizar</button>
          <button type="button" data-comp-period-offset="1" aria-label="Mes siguiente">→</button>
        </div>
      </header>
      ${renderSourceHealth(readModel.sourceHealth)}
      <main>${content}</main>
    </div>
    ${ADVISOR_COMPENSATION_070_STYLES}`;
}

export const ADVISOR_COMPENSATION_070_STYLES = `<style data-advisor-compensation-style="070">
  .comp-shell{--comp-surface:color-mix(in srgb,var(--card-bg,#fff) 94%,transparent);display:grid;gap:18px;padding:clamp(16px,3vw,28px);padding-bottom:calc(104px + env(safe-area-inset-bottom));width:100%;max-width:1320px;min-width:0;margin:0 auto;color:var(--text,#17202a);overflow-x:hidden}
  .comp-shell main,.comp-header,.comp-grid,.comp-section,.comp-details,.comp-detail,.comp-simulator{min-width:0;max-width:100%}
  .comp-header{display:flex;justify-content:space-between;gap:16px;align-items:flex-end}.comp-header h1,.comp-section h2,.comp-simulator h2{margin:3px 0}.comp-header p{margin:0;text-transform:capitalize;color:var(--muted,#657085)}
  .comp-eyebrow{font-size:.74rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--accent,#5b5bd6)}
  .comp-period-nav{display:flex;gap:8px}.comp-period-nav button{min-height:44px;border:1px solid var(--separator,#d7dce5);border-radius:14px;background:var(--comp-surface);color:inherit;padding:0 14px;font-weight:750;cursor:pointer}
  .comp-source-health{display:flex;gap:8px;flex-wrap:wrap;min-width:0}.comp-source-health span{font-size:.74rem;padding:6px 9px;border-radius:999px;background:var(--comp-surface);border:1px solid var(--separator,#d7dce5);overflow-wrap:anywhere}
  .comp-banner{padding:12px 14px;border-radius:14px;font-weight:650}.comp-banner--warning{background:#fff4d5;color:#6d4a00}
  .comp-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,.55fr);gap:18px;padding:22px;border-radius:24px;background:linear-gradient(135deg,color-mix(in srgb,var(--accent,#5b5bd6) 16%,var(--comp-surface)),var(--comp-surface));border:1px solid color-mix(in srgb,var(--accent,#5b5bd6) 26%,transparent);min-width:0}.comp-hero>div{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;min-width:0}.comp-hero strong{font-size:clamp(2rem,6vw,4rem);line-height:1;overflow-wrap:anywhere}.comp-hero p{margin:auto 0;color:var(--muted,#657085);overflow-wrap:anywhere}
  .comp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.comp-card,.comp-section,.comp-simulator,.comp-state{background:var(--comp-surface);border:1px solid var(--separator,#d7dce5);border-radius:20px;box-shadow:0 10px 28px rgba(17,24,39,.06)}
  .comp-secondary-summary{margin-top:14px;border:1px solid var(--separator,#d7dce5);border-radius:16px;background:var(--comp-surface)}.comp-secondary-summary>summary{padding:15px 18px;cursor:pointer;font-weight:800}.comp-secondary-summary>.comp-grid{padding:0 14px 14px}.comp-grid--secondary{grid-template-columns:repeat(2,minmax(0,1fr))}
  .comp-card{padding:17px;min-height:148px;min-width:0}.comp-card__heading{display:flex;justify-content:space-between;gap:8px;align-items:center;font-weight:760;min-width:0}.comp-card strong{display:block;font-size:clamp(1.35rem,3vw,2rem);margin:17px 0 7px;overflow-wrap:anywhere}.comp-card p{margin:0;color:var(--muted,#657085);font-size:.84rem;line-height:1.4}
  .comp-truth{display:inline-flex;align-items:center;max-width:max-content;border-radius:999px;padding:4px 8px;font-size:.66rem;font-weight:850;letter-spacing:.04em;background:#edf0f6;color:#43506a}.comp-truth--paid{background:#dff7e8;color:#126437}.comp-truth--earned{background:#e4efff;color:#154f96}.comp-truth--estimated{background:#f0e8ff;color:#6736a5}.comp-truth--potential{background:#e4f7f7;color:#176268}.comp-truth--at_risk,.comp-truth--at-risk{background:#fff0dd;color:#8a4b00}.comp-truth--adjusted{background:#eaf1ff;color:#345a9b}.comp-truth--reversed{background:#ffe6e8;color:#9c2c38}.comp-truth--unavailable{background:#edf0f6;color:#657085}.comp-truth--simulation{background:#161b2a;color:white}
  .comp-section{padding:20px;overflow:hidden}.comp-section header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;min-width:0}
  .comp-section header p{margin:5px 0 0;color:var(--muted,#657085)}.comp-attention{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.comp-attention__item{display:flex;justify-content:space-between;gap:12px;min-height:72px;padding:13px 14px;border:1px solid var(--separator,#d7dce5);border-radius:14px;background:color-mix(in srgb,var(--accent,#5b5bd6) 5%,var(--comp-surface));color:inherit;text-align:left;cursor:pointer}.comp-attention__item span{display:grid;gap:3px;min-width:0}.comp-attention__item span:last-child{text-align:right}.comp-attention__item small{color:var(--muted,#657085);overflow-wrap:anywhere}.comp-attention__item:disabled{cursor:not-allowed;opacity:.68}.comp-attention__empty{padding:18px;border-radius:14px;background:color-mix(in srgb,var(--comp-surface) 85%,var(--separator,#d7dce5));color:var(--muted,#657085)}.comp-attention__empty p{margin:0 0 10px}.comp-attention__empty button{min-height:42px;border:1px solid var(--separator,#d7dce5);border-radius:12px;background:var(--comp-surface);color:inherit;padding:0 14px;font-weight:750;cursor:pointer}
  .comp-search{display:grid;gap:4px;min-width:min(280px,100%);color:var(--muted,#657085);font-size:.7rem;font-weight:800;text-transform:uppercase}.comp-search input{min-height:42px;border:1px solid var(--separator,#d7dce5);border-radius:12px;padding:8px 11px;background:var(--comp-surface);color:inherit;font:inherit;text-transform:none}
  .comp-history__chart{display:grid;grid-template-columns:repeat(6,minmax(78px,1fr));gap:10px;min-height:250px;align-items:end;width:100%;max-width:100%;min-width:0;overflow-x:auto;overscroll-behavior-inline:contain;padding:14px 2px 4px}.comp-history__column{display:grid;grid-template-rows:auto 150px auto auto;gap:7px;justify-items:center;min-width:78px}.comp-history__value{font-size:.69rem;font-weight:750;white-space:nowrap}.comp-history__bar{width:min(48px,70%);height:var(--comp-bar);align-self:end;border-radius:12px 12px 4px 4px;background:linear-gradient(180deg,var(--accent,#5b5bd6),color-mix(in srgb,var(--accent,#5b5bd6) 45%,#70d6ff));min-height:4px}.comp-history__label{font-size:.75rem;font-weight:850}
  .comp-details{display:grid;gap:10px}.comp-detail{border:1px solid var(--separator,#d7dce5);border-radius:16px;padding:0 14px;overflow:hidden}.comp-detail summary{display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;padding:14px 0;min-width:0}.comp-detail summary span{min-width:0;overflow-wrap:anywhere}.comp-detail summary span:first-child{display:grid;gap:3px}.comp-detail small{color:var(--muted,#657085)}.comp-detail dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px;min-width:0}.comp-detail dl div{padding:9px;border-radius:10px;background:color-mix(in srgb,var(--comp-surface) 80%,var(--separator,#d7dce5));min-width:0}.comp-detail dt{font-size:.68rem;text-transform:uppercase;color:var(--muted,#657085)}.comp-detail dd{margin:4px 0 0;overflow-wrap:anywhere;min-width:0}.comp-detail code{word-break:break-all}.comp-detail__explanation{font-size:.82rem;color:var(--muted,#657085)}
  .comp-simulator{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px;border-style:dashed}.comp-simulator p{margin:4px 0 0;color:var(--muted,#657085)}
  .comp-state{display:flex;gap:16px;align-items:center;padding:28px;min-height:220px;min-width:0}.comp-state>div{min-width:0}.comp-state__icon{font-size:2.3rem}.comp-state h2{margin:0 0 6px}.comp-state p{margin:0;color:var(--muted,#657085);overflow-wrap:anywhere}.comp-state code{display:block;margin-top:10px;overflow-wrap:anywhere}
  @media(max-width:980px){.comp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.comp-hero{grid-template-columns:1fr}.comp-detail dl{grid-template-columns:1fr}.comp-attention{grid-template-columns:1fr}}
  @media(max-width:620px){.comp-shell{padding:14px;padding-bottom:calc(112px + env(safe-area-inset-bottom))}.comp-header{align-items:flex-start;flex-direction:column}.comp-period-nav{width:100%}.comp-period-nav button{flex:1;min-width:0}.comp-grid{grid-template-columns:1fr}.comp-card{min-height:auto}.comp-simulator{align-items:flex-start;flex-direction:column}.comp-hero strong{width:100%}.comp-evidence-header{align-items:stretch!important;display:grid!important}.comp-search{width:100%}.comp-attention__item{align-items:flex-start}.comp-attention__item span:last-child{max-width:42%}}
</style>`;

export {
  escapeHtml,
  formatCurrency,
  monthLabel,
  truthLabel,
  renderHistory,
  renderEvidence,
  renderAttentionQueue,
};
