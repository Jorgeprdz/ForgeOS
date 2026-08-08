import {
  createAdvisorCompensationProductSource,
} from "../../../../advisor-os/compensation/advisor-compensation-070-source.js";
import {
  createAdvisorCompensationSupabaseProvider100,
} from "../../../../advisor-os/compensation/advisor-compensation-supabase-provider-100.js";

const TIME_ZONE = "America/Mexico_City";
const GENERATED_STATES = new Set(["PAID", "CONFIRMED_PAID", "EARNED", "CONFIRMED"]);
const FILTERS = ["ALL", "INITIAL", "RENEWAL", "BONUS", "ADJUSTMENT", "REVERSAL"];

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function finite(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function money(value, currency = "MXN") {
  if (!finite(value)) return "No disponible";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function monthKey(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(value);
  const year = parts.find(part => part.type === "year")?.value;
  const month = parts.find(part => part.type === "month")?.value;
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

function monthLabel(periodKey) {
  if (!/^\d{4}-\d{2}$/.test(periodKey || "")) return "Periodo";
  const [year, month] = periodKey.split("-").map(Number);
  return new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
}

function normalizedType(aggregate = {}) {
  const text = [
    aggregate.compensationType,
    aggregate.type,
    aggregate.category,
    aggregate.eventType,
    aggregate.concept,
  ].filter(Boolean).join(" ").toUpperCase();
  if (text.includes("BONUS") || text.includes("BONO") || text.includes("TRAINING") || text.includes("ALLOWANCE")) return "BONUS";
  if (text.includes("REVERS")) return "REVERSAL";
  if (text.includes("ADJUST")) return "ADJUSTMENT";
  if (Number(aggregate.policyYear) === 1) return "INITIAL";
  if (Number(aggregate.policyYear) > 1) return "RENEWAL";
  return "UNKNOWN";
}

function generatedAmount(aggregate = {}) {
  const state = String(aggregate.latestState || "").toUpperCase();
  if (!GENERATED_STATES.has(state) && !aggregate.earnedEventId) return null;
  if (finite(aggregate.earnedNetAmount)) return Number(aggregate.earnedNetAmount);
  if (finite(aggregate.paidAmount)) return Number(aggregate.paidAmount);
  return null;
}

function breakdown(aggregates) {
  const buckets = { INITIAL: 0, RENEWAL: 0, BONUS: 0 };
  const seen = { INITIAL: false, RENEWAL: false, BONUS: false };
  for (const aggregate of aggregates) {
    const type = normalizedType(aggregate);
    const amount = generatedAmount(aggregate);
    if (!(type in buckets) || amount === null) continue;
    buckets[type] += amount;
    seen[type] = true;
  }
  return Object.freeze({ buckets, seen });
}

function canonicalGenerated(snapshot) {
  const real = snapshot?.amounts?.real;
  if (!real || !finite(real.value)) return null;
  if (!["PAID", "EARNED"].includes(String(real.basis || "").toUpperCase())) return null;
  return Number(real.value);
}

function historyValue(point) {
  if (!point || !["PAID", "EARNED"].includes(String(point.realBasis || "").toUpperCase())) return null;
  for (const candidate of [point.real, point.paid, point.earnedNet]) {
    if (finite(candidate)) return Number(candidate);
  }
  return null;
}

function annualProjection(history, selectedPeriod) {
  const year = String(selectedPeriod).slice(0, 4);
  const points = Array.isArray(history?.points) ? history.points : [];
  const ytd = points
    .filter(point => String(point.periodKey || "").startsWith(`${year}-`))
    .map(historyValue)
    .filter(value => value !== null);
  return {
    generatedYtd: ytd.length ? ytd.reduce((sum, value) => sum + value, 0) : null,
    sourceMonths: ytd.length,
    historyLimit: points.length,
  };
}

function renderState(state, code = null) {
  const copy = {
    LOADING: ["Leyendo tus ingresos", "Consultando la autoridad económica disponible para este periodo."],
    EMPTY: ["Sin movimientos", "La fuente está disponible y no reporta movimientos para este periodo."],
    BLOCKED: ["Ingresos no disponibles", "Falta autoridad o evidencia suficiente para presentar una conclusión económica."],
    ERROR: ["No pudimos leer Ingresos", "No mostramos cifras anteriores como si fueran actuales."],
    DISCONNECTED: ["Fuente desconectada", "La autoridad productiva de compensación no está disponible en este momento."],
  }[state] || ["Ingresos no disponibles", "Revisa la fuente económica antes de usar estas cifras."];
  return `<section class="income-state" role="status" data-income-state="${esc(state)}"><span aria-hidden="true">${state === "LOADING" ? "◌" : "!"}</span><div><h1>${esc(copy[0])}</h1><p>${esc(copy[1])}</p>${code ? `<code>${esc(code)}</code>` : ""}</div></section>`;
}

function breakdownCard(label, value, currency, tone, available) {
  return `<article class="income-composition__item" data-tone="${tone}"><span>${esc(label)}</span><strong>${available ? esc(money(value, currency)) : "No disponible"}</strong></article>`;
}

function renderComposition(model) {
  const { initial, renewal, bonus, currency, generated } = model;
  const known = [initial, renewal, bonus].filter(item => item.available);
  const totalKnown = known.reduce((sum, item) => sum + item.value, 0);
  const segment = item => {
    const pct = totalKnown > 0 && item.available ? Math.max(2, (item.value / totalKnown) * 100) : 0;
    return item.available ? `<span data-segment="${item.key}" style="flex-basis:${pct}%" aria-label="${esc(item.label)} ${esc(money(item.value, currency))}"></span>` : "";
  };
  return `<section class="income-section" aria-labelledby="income-composition-title">
    <header><div><span class="income-kicker">Composición</span><h2 id="income-composition-title">De dónde viene</h2></div><p>Solo se clasifica cuando la autoridad expone tipo y policy year suficientes.</p></header>
    <div class="income-composition__bar" role="img" aria-label="Composición del ingreso generado">${segment(initial)}${segment(renewal)}${segment(bonus)}</div>
    <div class="income-composition__grid">
      ${breakdownCard("Nuevas ventas", initial.value, currency, "green", initial.available)}
      ${breakdownCard("Renovaciones", renewal.value, currency, "orange", renewal.available)}
      ${breakdownCard("Bonos generados", bonus.value, currency, "violet", bonus.available)}
    </div>
    ${generated !== null && totalKnown > 0 && Math.abs(totalKnown - generated) > 0.01 ? `<p class="income-note">El desglose trazable no cubre todavía todo el total canónico. La diferencia permanece sin clasificar; no se fuerza a cero.</p>` : ""}
  </section>`;
}

function blockedWidget({ kicker, title, body, tone, deepLink = null }) {
  return `<article class="income-smart" data-tone="${tone}"><div><span class="income-kicker">${esc(kicker)}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></div>${deepLink ? `<a href="${esc(deepLink.href)}">${esc(deepLink.label)}</a>` : ""}<span class="income-truth">SIN CONCLUSIÓN ECONÓMICA</span></article>`;
}

function renderNext() {
  return `<section class="income-section" aria-labelledby="income-next-title"><header><div><span class="income-kicker">Lo que sigue</span><h2 id="income-next-title">Escenarios separados de lo generado</h2></div><p>Lo futuro nunca se suma silenciosamente al ingreso generado.</p></header><div class="income-smart-grid">
    ${blockedWidget({ kicker: "EXPECTED · ORANGE", title: "Renovaciones del mes", body: "El read model actual no expone todavía policy + periodo esperado + regla aplicable como una proyección económica canónica. Se mantiene UNKNOWN.", tone: "orange", deepLink: { href: "?route=cartera", label: "Abrir Cartera" } })}
    ${blockedWidget({ kicker: "SCENARIO · VIOLET", title: "Escenario Pipeline", body: "Pipeline no es Income Truth. Hasta que exista una proyección reproducible por oportunidad, Forge no convierte oportunidades en dinero probable.", tone: "violet", deepLink: { href: "?route=pipeline", label: "Abrir Pipeline" } })}
  </div></section>`;
}

function renderBonusCoach(model) {
  const bonus = model.bonus;
  return `<section class="income-section" aria-labelledby="income-bonus-title"><header><div><span class="income-kicker">Bonus Coach</span><h2 id="income-bonus-title">Bonos y condiciones</h2></div><p>Money is context, never pressure.</p></header><article class="income-bonus"><div><span class="income-truth income-truth--generated">GENERATED</span><h3>${bonus.available ? esc(money(bonus.value, model.currency)) : "No disponible"}</h3><p>${bonus.available ? "Bonos con eventos económicos suficientemente evidenciados en el periodo." : "El read model no expone un bono generado clasificable para este periodo."}</p></div><div><span class="income-truth">IN REACH</span><h3>Sin conclusión</h3><p>Training / Nuevos Profesionales requiere career stage, eligibility, métricas y rule snapshot. No se infiere por antigüedad visual.</p></div></article></section>`;
}

function renderAnnual(model) {
  const annual = annualProjection(model.history, model.periodKey);
  return `<section class="income-section" aria-labelledby="income-annual-title"><header><div><span class="income-kicker">Año</span><h2 id="income-annual-title">${esc(model.periodKey.slice(0, 4))}</h2></div><p>Histórico canónico disponible: ${annual.historyLimit} meses; no se fabrican meses faltantes.</p></header><div class="income-annual"><article><span>Generado acumulado visible</span><strong>${esc(money(annual.generatedYtd, model.currency))}</strong><small>${annual.sourceMonths ? `${annual.sourceMonths} meses con verdad económica utilizable` : "Sin serie anual suficiente"}</small></article><article data-tone="orange"><span>Renovaciones esperadas restantes</span><strong>No disponible</strong><small>EXPECTED no está expuesto por la autoridad actual.</small></article><article data-tone="violet"><span>Escenario con Pipeline</span><strong>No disponible</strong><small>SCENARIO permanece separado de Generated.</small></article></div></section>`;
}

function movementRows(aggregates, currency, filter) {
  const rows = [];
  for (const aggregate of aggregates) {
    const type = normalizedType(aggregate);
    if (filter !== "ALL" && filter !== type) continue;
    const amount = generatedAmount(aggregate) ?? (finite(aggregate.estimatedAmount) ? Number(aggregate.estimatedAmount) : null);
    rows.push(`<details class="income-movement" data-income-movement-type="${esc(type)}"><summary><span><strong>${esc(aggregate.concept || "Movimiento")}</strong><small>${esc(aggregate.productName || aggregate.product || aggregate.policyReference || "Sin referencia")}</small></span><span><b>${esc(money(amount, currency))}</b><small>${esc(type === "UNKNOWN" ? "Sin clasificar" : type)}</small></span></summary><dl>
      <div><dt>Policy year</dt><dd>${finite(aggregate.policyYear) ? esc(aggregate.policyYear) : "No disponible"}</dd></div>
      <div><dt>Estado</dt><dd>${esc(aggregate.latestState || "UNKNOWN")}</dd></div>
      <div><dt>Devengado bruto</dt><dd>${esc(money(aggregate.earnedGrossAmount, currency))}</dd></div>
      <div><dt>Ajustes</dt><dd>${esc(money(aggregate.adjustmentAmount, currency))}</dd></div>
      <div><dt>Reversiones</dt><dd>${esc(money(aggregate.reversalAmount, currency))}</dd></div>
      <div><dt>Devengado neto</dt><dd>${esc(money(aggregate.earnedNetAmount, currency))}</dd></div>
      <div><dt>Regla</dt><dd>${aggregate.rulePackDigest ? "Evidencia disponible" : "No disponible"}</dd></div>
      <div><dt>Cálculo</dt><dd>${aggregate.sourceCalculationDigest ? "Digest disponible" : "No disponible"}</dd></div>
    </dl><p>Este detalle conserva ajustes, reversiones y evidencia; no representa confirmación de depósito bancario.</p></details>`);
  }
  return rows.length ? rows.join("") : `<div class="income-empty">No hay movimientos para este filtro.</div>`;
}

function renderMovements(model, filter) {
  return `<section class="income-section" aria-labelledby="income-movements-title"><header><div><span class="income-kicker">Ledger</span><h2 id="income-movements-title">Movimientos</h2></div><p>Abre un movimiento para ver cómo se calculó y qué evidencia conserva.</p></header><div class="income-filters" role="group" aria-label="Filtrar movimientos">${FILTERS.map(value => `<button type="button" data-income-filter="${value}" aria-pressed="${value === filter}">${({ALL:"Todos",INITIAL:"Iniciales",RENEWAL:"Renovaciones",BONUS:"Bonos",ADJUSTMENT:"Ajustes",REVERSAL:"Reversiones"})[value]}</button>`).join("")}</div><div data-income-movement-list>${movementRows(model.aggregates, model.currency, filter)}</div></section>`;
}

function renderReady(readModel, filter) {
  const snapshot = readModel.snapshot;
  const aggregates = Array.isArray(snapshot?.details?.aggregates) ? snapshot.details.aggregates : [];
  const currency = snapshot?.currency || "MXN";
  const generated = canonicalGenerated(snapshot);
  const split = breakdown(aggregates);
  const model = {
    periodKey: readModel.periodKey,
    history: readModel.history,
    currency,
    generated,
    aggregates,
    initial: { key: "INITIAL", label: "Nuevas ventas", value: split.buckets.INITIAL, available: split.seen.INITIAL },
    renewal: { key: "RENEWAL", label: "Renovaciones", value: split.buckets.RENEWAL, available: split.seen.RENEWAL },
    bonus: { key: "BONUS", label: "Bonos", value: split.buckets.BONUS, available: split.seen.BONUS },
  };
  const partial = ["PARTIAL", "STALE"].includes(readModel.state)
    ? `<div class="income-banner" role="status">La lectura es ${readModel.state === "STALE" ? "posiblemente desactualizada" : "parcial"}. UNKNOWN permanece UNKNOWN.</div>` : "";
  return `${partial}<div class="income-page">
    <header class="income-page__header"><div><span class="income-kicker">Inteligencia económica</span><h1>Ingresos</h1><p>${esc(monthLabel(readModel.periodKey))}</p></div><div class="income-period"><button type="button" data-income-period="-1" aria-label="Mes anterior">←</button><span>${esc(readModel.periodKey)}</span><button type="button" data-income-period="1" aria-label="Mes siguiente">→</button></div></header>
    <section class="income-hero"><div><span>Ingreso generado este mes</span><strong>${esc(money(generated, currency))}${generated !== null ? " <small>aprox.</small>" : ""}</strong><p>Basado en la autoridad de compensación y evidencia disponible. Puede diferir del depósito final por ajustes, descuentos u otros movimientos.</p></div><span class="income-truth income-truth--generated">GENERATED</span></section>
    ${renderComposition(model)}
    ${renderNext()}
    ${renderBonusCoach(model)}
    ${renderAnnual(model)}
    ${renderMovements(model, filter)}
  </div>`;
}

export function createIncomeModule({ root, client, user, globalState = () => {}, clock = () => new Date() } = {}) {
  if (!(root instanceof Element)) throw new TypeError("AURA_INCOME_ROOT_REQUIRED");
  if (!client) throw new Error("AURA_INCOME_CLIENT_REQUIRED");
  if (!user?.id) throw new Error("AURA_INCOME_USER_REQUIRED");

  let mounted = false;
  let generation = 0;
  let controller = null;
  let periodKey = monthKey(clock());
  let readModel = null;
  let filter = "ALL";
  const lifetime = new AbortController();
  const bootstrap = Object.freeze({
    getClient: async () => client,
    getSession: async () => ({ data: { session: { user } }, error: null }),
  });
  const provider = createAdvisorCompensationSupabaseProvider100({ bootstrap });
  const source = createAdvisorCompensationProductSource({ provider });

  const draw = () => {
    if (!mounted) return;
    if (!readModel) root.innerHTML = renderState("LOADING");
    else if (["READY", "PARTIAL", "STALE"].includes(readModel.state) && readModel.snapshot) root.innerHTML = renderReady(readModel, filter);
    else root.innerHTML = renderState(readModel.state, readModel.errorCode);
    root.dataset.incomeState = readModel?.state || "LOADING";
  };

  async function refresh() {
    if (!mounted) return;
    generation += 1;
    const request = generation;
    controller?.abort("income-refresh");
    controller = new AbortController();
    readModel = null;
    draw();
    globalState("Leyendo Ingresos…");
    const selectedPeriod = periodKey;
    const result = await source.load({
      advisorReference: user.id,
      periodKey: selectedPeriod,
      periodKeys: periodKeys(selectedPeriod),
      signal: controller.signal,
      requestId: `aura-income:${request}`,
    }).catch(error => ({ state: "ERROR", errorCode: error?.code || error?.message || "AURA_INCOME_READ_FAILED" }));
    if (!mounted || request !== generation || controller.signal.aborted || selectedPeriod !== periodKey) return;
    readModel = result;
    globalState("");
    draw();
  }

  root.addEventListener("click", event => {
    const periodButton = event.target.closest("[data-income-period]");
    if (periodButton) {
      const offset = Number(periodButton.dataset.incomePeriod);
      const next = shiftPeriod(periodKey, offset);
      if (next > monthKey(clock())) return;
      periodKey = next;
      void refresh();
      return;
    }
    const filterButton = event.target.closest("[data-income-filter]");
    if (filterButton && FILTERS.includes(filterButton.dataset.incomeFilter)) {
      filter = filterButton.dataset.incomeFilter;
      draw();
    }
  }, { signal: lifetime.signal });

  return Object.freeze({
    id: "comisiones",
    async mount() {
      if (mounted) return;
      mounted = true;
      root.dataset.moduleActive = "true";
      await refresh();
    },
    async unmount() {
      mounted = false;
      generation += 1;
      controller?.abort("income-unmount");
      root.removeAttribute("data-module-active");
    },
    async scrub() {
      readModel = null;
      filter = "ALL";
      root.replaceChildren();
    },
    async destroy() {
      mounted = false;
      generation += 1;
      controller?.abort("income-destroy");
      lifetime.abort();
      root.replaceChildren();
    },
  });
}
