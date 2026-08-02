const UI_STATES = new Set([
  "LOADING", "READY", "PARTIAL", "EMPTY", "BLOCKED",
  "STALE", "ERROR", "DISCONNECTED",
]);

const STATE_COPY = Object.freeze({
  LOADING: {
    title: "Cargando compensación",
    body: "Estamos leyendo el snapshot mensual y su historial canónico.",
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
    body: "Comisiones ya no calcula desde Cartera ni IndexedDB. Hace falta conectar el snapshot canónico.",
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
        ${truth ? `<span class="comp-truth comp-truth--${escapeHtml(truth.toLowerCase())}">${escapeHtml(truth)}</span>` : ""}
      </div>
      <strong>${escapeHtml(formatCurrency(value, currency))}</strong>
      <p>${escapeHtml(caption)}</p>
    </article>`;
}

function pointValue(point) {
  const candidates = [point.real, point.paid, point.earnedNet, point.estimated];
  return candidates.find((value) => Number.isFinite(value)) ?? 0;
}

function renderHistory(history, currency) {
  const points = Array.isArray(history?.points) ? history.points : [];
  if (!points.length) {
    return `<div class="comp-history__empty">No hay meses disponibles para graficar.</div>`;
  }
  const max = Math.max(1, ...points.map((point) => Math.abs(pointValue(point))));
  return `
    <div class="comp-history__chart" role="img"
      aria-label="Histórico de compensación de seis meses">
      ${points.map((point) => {
        const amount = pointValue(point);
        const height = Math.max(4, Math.round(Math.abs(amount) / max * 100));
        return `
          <div class="comp-history__column" data-compensation-history-period="${escapeHtml(point.periodKey)}">
            <span class="comp-history__value">${escapeHtml(formatCurrency(amount, currency))}</span>
            <span class="comp-history__bar" style="--comp-bar:${height}%"></span>
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
    <details class="comp-detail" data-compensation-aggregate="${escapeHtml(aggregate.aggregateKey)}">
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
        <div><dt>Estado</dt><dd>${escapeHtml(aggregate.latestState)}</dd></div>
        <div><dt>Estimado</dt><dd>${escapeHtml(formatCurrency(aggregate.estimatedAmount, currency))}</dd></div>
        <div><dt>Devengado bruto</dt><dd>${escapeHtml(formatCurrency(aggregate.earnedGrossAmount, currency))}</dd></div>
        <div><dt>Ajustes</dt><dd>${escapeHtml(formatCurrency(aggregate.adjustmentAmount, currency))}</dd></div>
        <div><dt>Reversiones</dt><dd>${escapeHtml(formatCurrency(aggregate.reversalAmount, currency))}</dd></div>
        <div><dt>Devengado neto</dt><dd>${escapeHtml(formatCurrency(aggregate.earnedNetAmount, currency))}</dd></div>
        <div><dt>Calculation digest</dt><dd><code>${escapeHtml(aggregate.sourceCalculationDigest || "No disponible")}</code></dd></div>
        <div><dt>Rule Pack digest</dt><dd><code>${escapeHtml(aggregate.rulePackDigest || "No disponible")}</code></dd></div>
      </dl>
      <p class="comp-detail__explanation">
        El importe proviene del timeline append-only. Los ajustes suman como delta y las reversiones restan; nunca reemplazan el evento original.
      </p>
    </details>`).join("");
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
  const tone = sourceTone(readModel.state);
  const partialBanner = readModel.state === "PARTIAL"
    ? `<div class="comp-banner comp-banner--warning">La vista es parcial: las cifras desconocidas permanecen como “No disponible”.</div>`
    : "";
  const staleBanner = readModel.state === "STALE"
    ? `<div class="comp-banner comp-banner--warning">El último snapshot es antiguo. Se muestra con etiqueta de información desactualizada.</div>`
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
      <p>${escapeHtml(snapshot.explanation?.realReason || "Base económica explícita del snapshot.")}</p>
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
        key: "earned", title: "Devengado neto", value: amounts.earned.net, currency,
        caption: "Regla oficial más ajustes y reversiones append-only.",
        truth: "EARNED",
      })}
      ${card({
        key: "estimated", title: "Estimado", value: amounts.estimated, currency,
        caption: "Cálculo todavía no promovido a devengado.",
        truth: "ESTIMATED",
      })}
      ${card({
        key: "potential", title: "Potencial", value: amounts.potential, currency,
        caption: "Señal futura; no forma parte del ingreso real.",
        truth: "POTENTIAL",
      })}
      ${card({
        key: "at-risk", title: "En riesgo", value: amounts.atRisk, currency,
        caption: "Señal explícita; no se descuenta silenciosamente.",
        truth: "AT_RISK",
      })}
      ${card({
        key: "adjustments", title: "Ajustes", value: amounts.earned.adjustments, currency,
        caption: "Deltas documentados sobre compensación devengada.",
        truth: "ADJUSTED",
      })}
      ${card({
        key: "reversals", title: "Reversiones", value: amounts.earned.reversals, currency,
        caption: "Eventos negativos que preservan la historia original.",
        truth: "REVERSED",
      })}
    </section>

    <section class="comp-section">
      <header><div><span class="comp-eyebrow">Últimos seis meses</span><h2>Histórico canónico</h2></div></header>
      ${renderHistory(history, currency)}
    </section>

    <section class="comp-section">
      <header><div><span class="comp-eyebrow">Explicabilidad</span><h2>Movimientos y evidencia</h2></div></header>
      <div class="comp-details">${renderEvidence(snapshot, currency)}</div>
    </section>

    <aside class="comp-simulator" data-compensation-simulator-boundary="separate">
      <div>
        <span class="comp-eyebrow">Escenario separado</span>
        <h2>Simulador de comisiones</h2>
        <p>Una simulación nunca modifica ni se suma a Pagado, Devengado o Ingreso real.</p>
      </div>
      <span class="comp-truth comp-truth--simulation">SIMULATION ≠ TRUTH</span>
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
          <span class="comp-eyebrow">Compensation Intelligence</span>
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
  .comp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.comp-card,.comp-section,.comp-simulator,.comp-state{background:var(--comp-surface);border:1px solid var(--separator,#d7dce5);border-radius:20px;box-shadow:0 10px 28px rgba(17,24,39,.06)}
  .comp-card{padding:17px;min-height:148px;min-width:0}.comp-card__heading{display:flex;justify-content:space-between;gap:8px;align-items:center;font-weight:760;min-width:0}.comp-card strong{display:block;font-size:clamp(1.35rem,3vw,2rem);margin:17px 0 7px;overflow-wrap:anywhere}.comp-card p{margin:0;color:var(--muted,#657085);font-size:.84rem;line-height:1.4}
  .comp-truth{display:inline-flex;align-items:center;max-width:max-content;border-radius:999px;padding:4px 8px;font-size:.66rem;font-weight:850;letter-spacing:.04em;background:#edf0f6;color:#43506a}.comp-truth--paid{background:#dff7e8;color:#126437}.comp-truth--earned{background:#e4efff;color:#154f96}.comp-truth--estimated{background:#f0e8ff;color:#6736a5}.comp-truth--potential{background:#e4f7f7;color:#176268}.comp-truth--at_risk,.comp-truth--at-risk{background:#fff0dd;color:#8a4b00}.comp-truth--adjusted{background:#eaf1ff;color:#345a9b}.comp-truth--reversed{background:#ffe6e8;color:#9c2c38}.comp-truth--unavailable{background:#edf0f6;color:#657085}.comp-truth--simulation{background:#161b2a;color:white}
  .comp-section{padding:20px;overflow:hidden}.comp-section header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;min-width:0}
  .comp-history__chart{display:grid;grid-template-columns:repeat(6,minmax(78px,1fr));gap:10px;min-height:250px;align-items:end;width:100%;max-width:100%;min-width:0;overflow-x:auto;overscroll-behavior-inline:contain;padding:14px 2px 4px}.comp-history__column{display:grid;grid-template-rows:auto 150px auto auto;gap:7px;justify-items:center;min-width:78px}.comp-history__value{font-size:.69rem;font-weight:750;white-space:nowrap}.comp-history__bar{width:min(48px,70%);height:var(--comp-bar);align-self:end;border-radius:12px 12px 4px 4px;background:linear-gradient(180deg,var(--accent,#5b5bd6),color-mix(in srgb,var(--accent,#5b5bd6) 45%,#70d6ff));min-height:4px}.comp-history__label{font-size:.75rem;font-weight:850}
  .comp-details{display:grid;gap:10px}.comp-detail{border:1px solid var(--separator,#d7dce5);border-radius:16px;padding:0 14px;overflow:hidden}.comp-detail summary{display:flex;justify-content:space-between;gap:12px;align-items:center;cursor:pointer;padding:14px 0;min-width:0}.comp-detail summary span{min-width:0;overflow-wrap:anywhere}.comp-detail summary span:first-child{display:grid;gap:3px}.comp-detail small{color:var(--muted,#657085)}.comp-detail dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 12px;min-width:0}.comp-detail dl div{padding:9px;border-radius:10px;background:color-mix(in srgb,var(--comp-surface) 80%,var(--separator,#d7dce5));min-width:0}.comp-detail dt{font-size:.68rem;text-transform:uppercase;color:var(--muted,#657085)}.comp-detail dd{margin:4px 0 0;overflow-wrap:anywhere;min-width:0}.comp-detail code{word-break:break-all}.comp-detail__explanation{font-size:.82rem;color:var(--muted,#657085)}
  .comp-simulator{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:20px;border-style:dashed}.comp-simulator p{margin:4px 0 0;color:var(--muted,#657085)}
  .comp-state{display:flex;gap:16px;align-items:center;padding:28px;min-height:220px;min-width:0}.comp-state>div{min-width:0}.comp-state__icon{font-size:2.3rem}.comp-state h2{margin:0 0 6px}.comp-state p{margin:0;color:var(--muted,#657085);overflow-wrap:anywhere}.comp-state code{display:block;margin-top:10px;overflow-wrap:anywhere}
  @media(max-width:980px){.comp-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.comp-hero{grid-template-columns:1fr}.comp-detail dl{grid-template-columns:1fr}}
  @media(max-width:620px){.comp-shell{padding:14px;padding-bottom:calc(112px + env(safe-area-inset-bottom))}.comp-header{align-items:flex-start;flex-direction:column}.comp-period-nav{width:100%}.comp-period-nav button{flex:1;min-width:0}.comp-grid{grid-template-columns:1fr}.comp-card{min-height:auto}.comp-simulator{align-items:flex-start;flex-direction:column}.comp-hero strong{width:100%}}
</style>`;

export {
  escapeHtml,
  formatCurrency,
  monthLabel,
  truthLabel,
  renderHistory,
  renderEvidence,
};
