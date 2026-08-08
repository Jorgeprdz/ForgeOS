import { createIncomeAdapter } from "./income-adapter-pages-v1.mjs";
import {
  escapeHtml as e,
  formatMoney,
  monthLabel,
  projectIncomeReadModel,
  shiftPeriod,
  sixMonthPeriods,
} from "./income-core.mjs";

const MODULE_STATE = Symbol.for("forge.aura.income.reconciliation.001");
const RENDERABLE = new Set(["READY", "PARTIAL", "STALE", "EMPTY"]);

const path = Object.freeze({
  refresh: "M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h8V3l-3.35 3.35Z",
  left: "m15.4 5.4-1.4-1.4L6 12l8 8 1.4-1.4L8.8 12l6.6-6.6Z",
  right: "m8.6 18.6 1.4 1.4 8-8-8-8-1.4 1.4 6.6 6.6-6.6 6.6Z",
  external: "M14 3h7v7h-2V6.4l-8.8 8.8-1.4-1.4L17.6 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z",
  info: "M11 10h2v7h-2v-7Zm0-3h2v2h-2V7Zm1-5a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
  shield: "M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Zm0 2.2 6 2.2V11c0 3.8-2.4 7.4-6 8.8-3.6-1.4-6-5-6-8.8V6.4l6-2.2Z",
});

const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path[name] || ""}"/></svg>`;

function currentMonth(clock = () => new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    timeZone: "America/Mexico_City",
  }).formatToParts(clock());
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
  return `${year}-${month}`;
}

function humanState(state) {
  return ({
    GENERATED: "Generado",
    EXPECTED: "Esperado",
    SCENARIO: "Escenario",
    EMPTY: "Sin movimientos",
    UNKNOWN: "Sin conclusión",
    DISCONNECTED: "Fuente desconectada",
    PARTIAL: "Parcial",
    BLOCKED: "Bloqueado por evidencia",
    READY: "Disponible",
    EARNED: "Devengado",
    ESTIMATED: "Estimado",
    ADJUSTED: "Ajustado",
    REVERSED: "Reversado",
  })[String(state || "UNKNOWN").toUpperCase()] || "Requiere revisión";
}

function percent(value, total) {
  if (!Number.isFinite(Number(value)) || !Number.isFinite(Number(total)) || Number(total) <= 0) return 0;
  return Math.max(0, Math.min(100, Number(value) / Number(total) * 100));
}

function statePanel(state, errorCode = null) {
  const copy = {
    LOADING: ["Preparando tus ingresos", "Estamos leyendo el snapshot económico canónico de este periodo."],
    BLOCKED: ["Ingresos bloqueados por evidencia", "Falta evidencia suficiente o existe un conflicto. Forge no completa cifras por su cuenta."],
    ERROR: ["No pudimos leer Ingresos", "La fuente respondió con un error. No mostramos datos anteriores como si fueran actuales."],
    DISCONNECTED: ["Fuente de Ingresos desconectada", "La autoridad productiva de compensación no está disponible. Cartera y Pipeline no se usan como sustitutos."],
  }[state] || ["Ingresos no disponibles", "No existe una conclusión económica respaldada para este momento."];
  return `
    <section class="income-state" data-income-state-panel="${e(state)}" role="status">
      <span class="income-state__icon" aria-hidden="true">${icon(state === "LOADING" ? "refresh" : "shield")}</span>
      <div>
        <p class="income-eyebrow">EVIDENCIA ECONÓMICA</p>
        <h1>${e(copy[0])}</h1>
        <p>${e(copy[1])}</p>
        ${errorCode ? `<code>${e(errorCode)}</code>` : ""}
      </div>
    </section>`;
}

function banner(readModel) {
  if (readModel.state === "STALE") {
    return `<div class="income-banner income-banner--warning" role="status"><strong>Información desactualizada.</strong><span>Revísala antes de tomar una decisión económica.</span></div>`;
  }
  if (readModel.state === "PARTIAL") {
    return `<div class="income-banner income-banner--warning" role="status"><strong>Vista parcial.</strong><span>Las cifras sin autoridad suficiente permanecen como “No disponible”.</span></div>`;
  }
  return "";
}

function compositionHtml(model) {
  const generated = model.generated;
  if (generated.state === "UNKNOWN") {
    return `
      <section class="income-section" aria-labelledby="income-composition-title">
        <header class="income-section__head"><div><p class="income-eyebrow">COMPOSICIÓN</p><h2 id="income-composition-title">¿De dónde viene?</h2></div></header>
        <div class="income-honest-empty"><strong>No disponible con evidencia actual</strong><p>Forge necesita movimientos devengados canónicos para separar nuevas ventas, renovaciones y bonos. Unknown no se convierte en cero.</p></div>
      </section>`;
  }
  const knownBase = generated.initial + generated.renewal + generated.bonus;
  const totalForShares = generated.compositionComplete ? generated.value : knownBase;
  const parts = [
    ["initial", "Nuevas ventas", generated.initial, "generated"],
    ["renewal", "Renovaciones", generated.renewal, "renewal"],
    ["bonus", "Bonos", generated.bonus, "bonus"],
  ];
  return `
    <section class="income-section" aria-labelledby="income-composition-title">
      <header class="income-section__head">
        <div><p class="income-eyebrow">COMPOSICIÓN</p><h2 id="income-composition-title">¿De dónde viene?</h2></div>
        ${generated.compositionComplete ? '<span class="income-badge income-badge--success">Desglose completo</span>' : '<span class="income-badge income-badge--warning">Desglose parcial</span>'}
      </header>
      <div class="income-composition__bar" aria-label="Composición del ingreso generado">
        ${parts.map(([key, label, value]) => `<span class="income-composition__segment income-composition__segment--${key}" style="--income-share:${percent(value, totalForShares).toFixed(2)}%" title="${e(label)} ${e(formatMoney(value, model.currency))}"></span>`).join("")}
      </div>
      <div class="income-composition__rows">
        ${parts.map(([key, label, value]) => `
          <div class="income-composition__row" data-income-composition="${key}">
            <span class="income-dot income-dot--${key}" aria-hidden="true"></span>
            <div><strong>${e(label)}</strong><small>${percent(value, totalForShares).toFixed(0)}% del desglose conocido</small></div>
            <b>${e(formatMoney(value, model.currency))}</b>
          </div>`).join("")}
        ${generated.unclassified ? `
          <div class="income-honest-empty income-honest-empty--compact">
            <strong>${e(formatMoney(generated.unclassified, model.currency))} requieren clasificación canónica</strong>
            <p>No se reasignan a Iniciales, Renovaciones o Bonos sin autoridad.</p>
          </div>` : ""}
      </div>
    </section>`;
}

function expectedRenewalsHtml(model) {
  const item = model.expectedRenewals;
  const available = ["EXPECTED", "PARTIAL", "EMPTY"].includes(item.state);
  const amount = available ? formatMoney(item.value, model.currency) : "No disponible";
  const count = available && item.count !== null ? `${item.count} póliza${item.count === 1 ? "" : "s"}` : "Sin conclusión de cantidad";
  return `
    <article class="income-smart income-smart--expected" data-income-expected-state="${e(item.state)}">
      <header><div><p class="income-eyebrow">EXPECTED · NO GENERADO</p><h3>Renovaciones de ${e(monthLabel(model.periodKey).replace(/ \d{4}$/, ""))}</h3></div><span class="income-badge income-badge--warning">${e(humanState(item.state))}</span></header>
      <strong class="income-smart__metric">${e(amount)}${available && item.state !== "EMPTY" ? " aprox." : ""}</strong>
      <p>${e(count)}. Solo se muestran como esperadas cuando existe póliza, año de póliza, periodo de pago y regla aplicable respaldados.</p>
      ${item.items?.some(row => row.state === "EXPECTED") ? `
        <div class="income-smart__list">${item.items.filter(row => row.state === "EXPECTED").slice(0, 3).map(row => `
          <div><span><strong>${e(row.policyReference)}</strong><small>Año ${e(row.policyYear)} · ${e(row.expectedPaymentPeriod)}</small></span><b>${e(formatMoney(row.amount, model.currency))}</b></div>`).join("")}</div>` : `
        <div class="income-honest-empty income-honest-empty--compact"><strong>${item.state === "EMPTY" ? "Sin renovaciones esperadas respaldadas" : "No hay señal económica suficiente"}</strong><p>${item.state === "DISCONNECTED" ? "La fuente de señales futuras está desconectada." : "No se inventa una proyección a partir de fechas o primas aisladas."}</p></div>`}
      <a class="income-link" href="?route=cartera&from=comisiones">Revisar Cartera ${icon("external")}</a>
    </article>`;
}

function pipelineScenarioHtml(model) {
  const item = model.pipelineScenario;
  const available = ["SCENARIO", "PARTIAL", "EMPTY"].includes(item.state);
  return `
    <article class="income-smart income-smart--scenario" data-income-pipeline-state="${e(item.state)}">
      <header><div><p class="income-eyebrow">SCENARIO · NO GENERADO · NO GARANTIZADO</p><h3>Si se cierran oportunidades identificadas</h3></div><span class="income-badge income-badge--brand">${e(humanState(item.state))}</span></header>
      <strong class="income-smart__metric">${available ? `${e(item.state === "EMPTY" ? formatMoney(0, model.currency) : `+${formatMoney(item.value, model.currency)}`)}${item.state === "EMPTY" ? "" : " aprox."}` : "No disponible"}</strong>
      <p>Este what-if usa únicamente señales económicas explícitas y reproducibles. Nunca calcula probabilidad × dinero ni convierte Pipeline en ingreso.</p>
      ${available && item.items?.length ? `<div class="income-smart__list">${item.items.filter(row => row.state === "SCENARIO").slice(0, 3).map(row => `<div><span><strong>${e(row.label || row.opportunityReference)}</strong><small>${e(row.opportunityReference)}</small></span><b>+${e(formatMoney(row.amount, model.currency))}</b></div>`).join("")}</div>` : `
        <div class="income-honest-empty income-honest-empty--compact"><strong>${item.state === "EMPTY" ? "Sin escenarios Pipeline respaldados" : "Escenario no calculable con la evidencia disponible"}</strong><p>Las oportunidades sin base económica suficiente permanecen desconocidas.</p></div>`}
      ${model.combinedScenario !== null ? `<div class="income-scenario-total"><span>Ingreso generado</span><b>${e(formatMoney(model.generated.value, model.currency))}</b><span>+ escenario Pipeline</span><b>+${e(formatMoney(item.value, model.currency))}</b><strong>Escenario total</strong><strong>${e(formatMoney(model.combinedScenario, model.currency))} aprox.</strong></div>` : ""}
      <a class="income-link" href="?route=pipeline&from=comisiones">Revisar Pipeline ${icon("external")}</a>
    </article>`;
}

function bonusCoachHtml(model) {
  const coach = model.bonusCoach;
  return `
    <section class="income-section income-bonus" aria-labelledby="income-bonus-title">
      <header class="income-section__head"><div><p class="income-eyebrow">BONUS COACH</p><h2 id="income-bonus-title">Bonos</h2></div><span class="income-badge income-badge--success">Generado ≠ alcanzable</span></header>
      <div class="income-bonus__grid">
        <article><span>Bono generado</span><strong>${model.generated.bonus === null ? "No disponible" : e(formatMoney(model.generated.bonus, model.currency))}</strong><p>Solo los bonos ya devengados forman parte del ingreso generado.</p></article>
        <article data-income-bonus-coach-state="${e(coach.state)}">
          <span>Condiciones del siguiente nivel</span>
          ${coach.state === "READY" ? `
            <strong>${e(coach.careerStage)}</strong>
            <p>${e(coach.explanation || "Elegibilidad leída desde autoridad de carrera y Rule Snapshot.")}</p>
            ${coach.gap ? `<dl class="income-mini-dl"><div><dt>Brecha</dt><dd>${e(typeof coach.gap === "string" ? coach.gap : JSON.stringify(coach.gap))}</dd></div><div><dt>Rule Pack</dt><dd>${e(coach.rulePackId)}</dd></div></dl>` : ""}
          ` : `
            <strong>No disponible con evidencia actual</strong>
            <p>Forge no infiere Training o Nuevos Profesionales solo por antigüedad, ni copia metas al frontend. Se necesita el snapshot gobernado de elegibilidad.</p>`}
        </article>
      </div>
    </section>`;
}

function annualHtml(model) {
  const annual = model.annual;
  return `
    <section class="income-section" aria-labelledby="income-annual-title">
      <header class="income-section__head"><div><p class="income-eyebrow">AÑO</p><h2 id="income-annual-title">${e(String(model.periodKey || "").slice(0, 4) || "Vista anual")}</h2></div><span class="income-badge ${annual.state === "UNKNOWN" ? "income-badge--warning" : "income-badge--success"}">${e(humanState(annual.state))}</span></header>
      ${annual.generatedYtd !== null ? `
        <div class="income-annual__grid">
          <article><span>Generado acumulado</span><strong>${e(formatMoney(annual.generatedYtd, model.currency))}</strong><small>GENERATED_YTD</small></article>
          <article><span>Renovaciones esperadas restantes</span><strong>No disponible</strong><small>EXPECTED · separado</small></article>
          <article><span>Base anual esperada</span><strong>No disponible</strong><small>No se fabrica sin autoridad futura</small></article>
          <article><span>Escenario con Pipeline</span><strong>No disponible</strong><small>SCENARIO · separado</small></article>
        </div>` : `
        <div class="income-honest-empty"><strong>Vista anual incompleta por límite de la fuente canónica</strong><p>El histórico disponible contiene ${e(annual.historyLimit || 0)} mes${annual.historyLimit === 1 ? "" : "es"}. Forge no crea meses faltantes para completar el año.</p><code>HISTORY_LIMIT=${e(annual.historyLimit || 0)} · REASON=${e(annual.reason || "CANONICAL_SOURCE_LIMIT")}</code></div>`}
    </section>`;
}

function historyHtml(model) {
  const points = Array.isArray(model.history?.points) ? model.history.points : [];
  return `
    <section class="income-section" aria-labelledby="income-history-title">
      <header class="income-section__head"><div><p class="income-eyebrow">HISTÓRICO DISPONIBLE</p><h2 id="income-history-title">Últimos periodos canónicos</h2></div><span>${points.length} meses</span></header>
      ${points.length ? `<div class="income-history" role="list" aria-label="Histórico de ingreso devengado">${points.map(point => {
        const known = point.earnedNet !== null && point.earnedNet !== undefined && Number.isFinite(Number(point.earnedNet));
        return `<article role="listitem" data-income-history-period="${e(point.periodKey)}" data-income-history-state="${known ? "AVAILABLE" : "UNKNOWN"}"><span>${e(monthLabel(point.periodKey).replace(/ \d{4}$/, ""))}</span><strong>${known ? e(formatMoney(point.earnedNet, model.currency)) : "No disponible"}</strong><small>${known ? "EARNED" : "UNKNOWN"}</small></article>`;
      }).join("")}</div>` : `<div class="income-honest-empty"><strong>Sin histórico disponible</strong><p>No se generan periodos artificiales.</p></div>`}
    </section>`;
}

function movementTypeLabel(item) {
  if (item.classification === "INITIAL") return "Inicial";
  if (item.classification === "RENEWAL") return "Renovación";
  if (item.classification === "BONUS") return "Bono";
  return "Otro movimiento";
}

function movementMatches(item, filter) {
  if (filter === "ALL") return true;
  if (filter === "INITIAL" || filter === "RENEWAL" || filter === "BONUS") return item.classification === filter;
  if (filter === "ADJUSTMENT") return Number(item.adjustmentAmount) !== 0;
  if (filter === "REVERSAL") return Number(item.reversalAmount) !== 0;
  return true;
}

function movementsHtml(model, filter) {
  const rows = model.movements.filter(item => movementMatches(item, filter));
  const tabs = [
    ["ALL", "Todos"], ["INITIAL", "Iniciales"], ["RENEWAL", "Renovaciones"],
    ["BONUS", "Bonos"], ["ADJUSTMENT", "Ajustes"], ["REVERSAL", "Reversiones"],
  ];
  return `
    <section class="income-section income-movements" aria-labelledby="income-movements-title">
      <header class="income-section__head"><div><p class="income-eyebrow">LEDGER</p><h2 id="income-movements-title">Movimientos</h2></div><span>${rows.length} visibles</span></header>
      <div class="income-filter" role="group" aria-label="Filtrar movimientos">${tabs.map(([key, label]) => `<button type="button" data-income-filter="${key}" aria-pressed="${filter === key}">${e(label)}</button>`).join("")}</div>
      ${rows.length ? `<div class="income-ledger">${rows.map(item => `
        <article class="income-movement" data-income-movement="${e(item.id)}" data-income-kind="${e(item.classification)}">
          <div class="income-movement__primary">
            <span class="income-dot income-dot--${item.classification === "INITIAL" ? "initial" : item.classification === "RENEWAL" ? "renewal" : item.classification === "BONUS" ? "bonus" : "other"}" aria-hidden="true"></span>
            <div><strong>${e(item.concept)}</strong><small>${e(item.product || item.policyReference || "Sin detalle de producto disponible")}</small></div>
          </div>
          <span class="income-movement__type">${e(movementTypeLabel(item))}${item.policyYear ? ` · Año ${e(item.policyYear)}` : ""}</span>
          <span class="income-movement__state">${e(humanState(item.truth))}</span>
          <strong class="income-movement__amount">${item.amount === null ? "No disponible" : e(formatMoney(item.amount, model.currency))}</strong>
          <details class="income-evidence">
            <summary>Cómo se calculó</summary>
            <dl>
              <div><dt>Póliza</dt><dd>${e(item.policyReference || "No disponible")}</dd></div>
              <div><dt>Payment event</dt><dd>${e(item.paymentEventId || "No disponible")}</dd></div>
              <div><dt>Policy year</dt><dd>${e(item.policyYear ?? "No disponible")}</dd></div>
              <div><dt>Rule Pack digest</dt><dd>${e(item.rulePackDigest || "No disponible")}</dd></div>
              <div><dt>Calculation digest</dt><dd>${e(item.sourceCalculationDigest || "No disponible")}</dd></div>
              <div><dt>Ajustes</dt><dd>${item.adjustmentAmount === null ? "No disponible" : e(formatMoney(item.adjustmentAmount, model.currency))}</dd></div>
              <div><dt>Reversiones</dt><dd>${item.reversalAmount === null ? "No disponible" : e(formatMoney(item.reversalAmount, model.currency))}</dd></div>
            </dl>
          </details>
        </article>`).join("")}</div>` : `<div class="income-honest-empty"><strong>Sin movimientos para este filtro</strong><p>La ausencia filtrada no altera la fuente económica.</p></div>`}
    </section>`;
}

function payoutDisclosure(model) {
  const paid = model.paidEvidence;
  return `
    <details class="income-advanced">
      <summary>${icon("info")} Evidencia avanzada y diferencia frente al depósito</summary>
      <div>
        <p>El hero usa compensación devengada respaldada para explicar ingreso generado aproximado. No afirma que el depósito bancario haya ocurrido.</p>
        <dl>
          <div><dt>Fuente de payout</dt><dd>${e(paid?.sourceState || "No disponible")}</dd></div>
          <div><dt>Pago confirmado</dt><dd>${paid?.value === null || paid?.value === undefined ? "No disponible" : e(formatMoney(paid.value, model.currency))}</dd></div>
          <div><dt>Capturado</dt><dd>${e(model.capturedAt || "No disponible")}</dd></div>
        </dl>
        <p>El depósito final puede diferir por ajustes, descuentos u otros movimientos que no estén presentes en la evidencia disponible.</p>
      </div>
    </details>`;
}

function productHtml(model, filter) {
  const generated = model.generated;
  const available = generated.value !== null;
  return `
    ${banner(model)}
    <header class="income-page-head">
      <div><p class="income-eyebrow">INTELIGENCIA ECONÓMICA</p><h1>Ingresos</h1><p>${e(monthLabel(model.periodKey))}</p></div>
      <nav class="income-period" aria-label="Cambiar periodo">
        <button type="button" data-income-period="-1" aria-label="Mes anterior">${icon("left")}</button>
        <button type="button" data-income-refresh aria-label="Actualizar Ingresos">${icon("refresh")}</button>
        <button type="button" data-income-period="1" aria-label="Mes siguiente">${icon("right")}</button>
      </nav>
    </header>
    <section class="income-hero" data-income-generated-state="${e(generated.state)}">
      <div class="income-hero__main">
        <div><p class="income-eyebrow">GENERATED · EARNED</p><h2>Ingreso generado este mes</h2></div>
        <span class="income-badge income-badge--success">${e(humanState(generated.state))}</span>
      </div>
      <strong class="income-hero__metric">${available ? `${e(formatMoney(generated.value, model.currency))} <small>aprox.</small>` : "No disponible"}</strong>
      <p>Basado en eventos de compensación respaldados por evidencia y reglas disponibles. Puede diferir del depósito final por ajustes, descuentos u otros movimientos.</p>
      ${generated.gross !== null && (generated.adjustments !== 0 || generated.reversals !== 0) ? `<div class="income-hero__reconciliation"><span>Generado bruto aprox. <b>${e(formatMoney(generated.gross, model.currency))}</b></span><span>Ajustes conocidos <b>${e(formatMoney(generated.adjustments, model.currency))}</b></span><span>Reversiones <b>${e(formatMoney(generated.reversals, model.currency))}</b></span><span>Después de movimientos conocidos <b>${e(formatMoney(generated.value, model.currency))}</b></span></div>` : ""}
    </section>
    ${compositionHtml(model)}
    <section class="income-section income-next" aria-labelledby="income-next-title">
      <header class="income-section__head"><div><p class="income-eyebrow">LO QUE PODRÍA VENIR</p><h2 id="income-next-title">Siguiente contexto económico</h2></div><p>Expected y Scenario nunca se suman silenciosamente a Generated.</p></header>
      <div class="income-next__grid">${expectedRenewalsHtml(model)}${pipelineScenarioHtml(model)}</div>
    </section>
    ${bonusCoachHtml(model)}
    ${annualHtml(model)}
    ${historyHtml(model)}
    ${movementsHtml(model, filter)}
    ${payoutDisclosure(model)}
  `;
}

export function createIncomeModule({
  root,
  client,
  user,
  globalState,
  adapterFactory = createIncomeAdapter,
  clock = () => new Date(),
} = {}) {
  if (!root || !client || !user?.id) throw new Error("AURA_INCOME_ROOT_CLIENT_USER_REQUIRED");
  if (root[MODULE_STATE]) return root[MODULE_STATE];

  const state = {
    mounted: false,
    revision: 0,
    periodKey: currentMonth(clock),
    controller: null,
    adapter: null,
    readModel: null,
    projection: null,
    movementFilter: "ALL",
  };

  function abort(reason = "income-request-replaced") {
    state.revision += 1;
    if (state.controller && !state.controller.signal.aborted) state.controller.abort(reason);
    state.controller = null;
  }

  function render() {
    if (!state.mounted) return;
    const model = state.readModel;
    root.dataset.incomeState = model?.state || "LOADING";
    root.setAttribute("aria-busy", String(!model || model.state === "LOADING"));
    if (!model || !RENDERABLE.has(model.state)) {
      root.innerHTML = `<div class="income-page">${statePanel(model?.state || "LOADING", model?.errorCode)}</div>`;
      return;
    }
    state.projection = projectIncomeReadModel(model);
    root.innerHTML = `<div class="income-page" data-income-contract="${e(state.projection.contractVersion)}">${productHtml(state.projection, state.movementFilter)}</div>`;
  }

  async function refresh() {
    if (!state.mounted) return;
    const revision = state.revision + 1;
    abort("income-refresh");
    state.revision = revision;
    const controller = new AbortController();
    state.controller = controller;
    const selectedPeriod = state.periodKey;
    state.readModel = Object.freeze({ state: "LOADING", periodKey: selectedPeriod, errorCode: null });
    render();
    globalState?.("Actualizando Ingresos…", "status");

    if (!state.adapter) state.adapter = adapterFactory({ client, user });
    try {
      const readModel = await state.adapter.load({
        periodKey: selectedPeriod,
        periodKeys: sixMonthPeriods(selectedPeriod),
        signal: controller.signal,
      });
      const late = !state.mounted
        || state.revision !== revision
        || controller.signal.aborted
        || selectedPeriod !== state.periodKey;
      if (late) {
        globalThis.dispatchEvent(new CustomEvent("aura-income:late-result-rejected", {
          detail: { revision, periodKey: selectedPeriod, advisorReference: user.id },
        }));
        return;
      }
      state.readModel = readModel;
      render();
      globalState?.("", "status");
      globalThis.dispatchEvent(new CustomEvent("aura-income:mounted", {
        detail: { state: readModel.state, periodKey: selectedPeriod, advisorReference: user.id },
      }));
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) return;
      if (!state.mounted || state.revision !== revision) return;
      state.readModel = Object.freeze({
        state: "ERROR",
        periodKey: selectedPeriod,
        errorCode: error?.code || error?.message || "AURA_INCOME_LOAD_FAILED",
      });
      render();
      globalState?.("No pudimos actualizar Ingresos.", "error");
    }
  }

  function handleClick(event) {
    const periodButton = event.target.closest("[data-income-period]");
    if (periodButton) {
      const offset = Number(periodButton.dataset.incomePeriod);
      if (!Number.isInteger(offset) || Math.abs(offset) !== 1) return;
      const next = shiftPeriod(state.periodKey, offset);
      if (!next || next > currentMonth(clock)) return;
      state.periodKey = next;
      state.movementFilter = "ALL";
      void refresh();
      return;
    }
    if (event.target.closest("[data-income-refresh]")) {
      void refresh();
      return;
    }
    const filter = event.target.closest("[data-income-filter]");
    if (filter && state.projection) {
      state.movementFilter = filter.dataset.incomeFilter || "ALL";
      render();
    }
  }

  root.addEventListener("click", handleClick);

  const api = Object.freeze({
    id: "comisiones",
    root,
    async mount() {
      if (state.mounted) return;
      state.mounted = true;
      state.periodKey = currentMonth(clock);
      root.hidden = false;
      root.dataset.moduleActive = "true";
      await refresh();
    },
    async unmount() {
      state.mounted = false;
      abort("income-route-unmounted");
      state.adapter = null;
      state.readModel = null;
      state.projection = null;
      root.replaceChildren();
      root.dataset.moduleActive = "false";
      root.dataset.incomeState = "SCRUBBED";
    },
    async scrub(reason = "income-session-scrub") {
      abort(reason);
      state.adapter = null;
      state.readModel = null;
      state.projection = null;
      root.replaceChildren();
      root.dataset.incomeState = "SCRUBBED";
    },
    async destroy() {
      state.mounted = false;
      abort("income-module-destroyed");
      root.removeEventListener("click", handleClick);
      root.replaceChildren();
      delete root[MODULE_STATE];
    },
    refresh,
    diagnostics() {
      return Object.freeze({
        mounted: state.mounted,
        revision: state.revision,
        periodKey: state.periodKey,
        state: state.readModel?.state || null,
        advisorReference: state.readModel?.advisorReference || null,
        privateDataPresent: Boolean(state.readModel?.snapshot || state.readModel?.history),
        movementFilter: state.movementFilter,
      });
    },
  });

  root[MODULE_STATE] = api;
  return api;
}

export { currentMonth, movementMatches };
