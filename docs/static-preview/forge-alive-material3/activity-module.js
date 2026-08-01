import { createActivityOperationalModule } from "./activity-operational-module.js?v=rep-18-001";
import { createActivityReportsProductivityRuntime } from "./activity-reports-productivity-runtime.js?v=rep-18-001";

const STATE = Symbol.for("forge.activity-reports.productive-ui.v1");
const REPORT_PERIODS = Object.freeze([
  { kind: "TODAY", label: "Hoy" },
  { kind: "WEEK_TO_DATE", label: "Semana" },
  { kind: "MONTH_TO_DATE", label: "Mes" },
  { kind: "ROLLING_30_DAYS", label: "30 días" },
]);
const ACTIVITY_LABELS = Object.freeze({
  CONTACT_ATTEMPTED: "Contactos",
  CONVERSATION_COMPLETED: "Conversaciones",
  INITIAL_APPOINTMENT_SCHEDULED: "Citas agendadas",
  INITIAL_APPOINTMENT_COMPLETED: "Citas realizadas",
  CLOSING_APPOINTMENT_SCHEDULED: "Cierres agendados",
  CLOSING_APPOINTMENT_COMPLETED: "Cierres realizados",
  FOLLOW_UP_COMPLETED: "Seguimientos",
});

function ensureStylesheet() {
  if (document.querySelector("[data-activity-module-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("activity-module.css?v=rep-18-001", import.meta.url);
  link.dataset.activityModuleStyles = "true";
  document.head.append(link);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function selectedView() {
  const value = new URL(window.location.href).searchParams.get("view");
  return value === "reportes" ? "reportes" : "actividad";
}

function updateViewUrl(view) {
  const url = new URL(window.location.href);
  if (view === "reportes") url.searchParams.set("view", "reportes");
  else url.searchParams.delete("view");
  window.history.pushState({ forgeRoute: "actividad", activityView: view }, "", url);
}

function formatNumber(value) {
  return Number.isFinite(value) ? new Intl.NumberFormat("es-MX").format(value) : "—";
}
function formatPercent(value) {
  return Number.isFinite(value) ? `${value > 0 ? "+" : ""}${value}%` : "Sin comparación";
}
function formatPeriod(range) {
  if (!range?.from || !range?.to) return "Periodo no disponible";
  const formatter = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "short", timeZone: "UTC" });
  const from = formatter.format(new Date(`${range.from}T12:00:00.000Z`));
  const to = formatter.format(new Date(`${range.to}T12:00:00.000Z`));
  return range.from === range.to ? from : `${from} – ${to}`;
}

function renderWorkspace(root) {
  root.innerHTML = `
    <div class="activity-workspace" data-activity-workspace data-activity-view="actividad">
      <div class="activity-view-tabs" role="tablist" aria-label="Actividad y reportes">
        <button type="button" role="tab" data-activity-view-tab="actividad" aria-selected="true">Actividad</button>
        <button type="button" role="tab" data-activity-view-tab="reportes" aria-selected="false">Reportes</button>
      </div>
      <section data-activity-operational-root></section>
      <section class="activity-reports" data-activity-reports-root hidden aria-live="polite"></section>
    </div>
  `;
}

function reportsChrome(periodKind) {
  return `
    <header class="activity-reports-hero">
      <div>
        <p class="section-kicker accent">REPORTES</p>
        <h1>Lo que ocurrió, sin convertir proyección en verdad</h1>
        <p>Actividad REP/FES, producción confirmada y contexto Forecast en una sola lectura.</p>
      </div>
      <button type="button" class="activity-refresh" data-reports-refresh aria-label="Actualizar reportes">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h8V3l-3.3 3.3Z"/></svg>
      </button>
    </header>
    <div class="activity-periods" role="group" aria-label="Periodo del reporte">
      ${REPORT_PERIODS.map((period) => `<button type="button" class="activity-period${period.kind === periodKind ? " active" : ""}" data-reports-period="${period.kind}" aria-pressed="${period.kind === periodKind}">${period.label}</button>`).join("")}
    </div>
    <section class="activity-report-status organic-card" data-reports-status></section>
    <div data-reports-content hidden></div>
  `;
}

function renderReportsLoading(root, periodKind) {
  root.innerHTML = reportsChrome(periodKind);
  root.dataset.reportsState = "loading";
  root.querySelector("[data-reports-status]").innerHTML = `<div class="activity-loading"><span class="activity-spinner" aria-hidden="true"></span><div><strong>Componiendo el reporte productivo</strong><span>Validando sesión y fuentes antes de mostrar resultados.</span></div></div>`;
}

function renderReportsFailure(root, model, periodKind) {
  root.innerHTML = reportsChrome(periodKind);
  root.dataset.reportsState = model?.state || "source-unavailable";
  const session = model?.state === "SESSION_REQUIRED";
  root.querySelector("[data-reports-status]").innerHTML = `<div class="activity-state activity-state--error"><span class="activity-state-icon" aria-hidden="true">!</span><div><strong>${session ? "Necesitamos una sesión activa" : "El reporte no pudo validar su fuente principal"}</strong><span>${session ? "Inicia sesión nuevamente. Los datos privados anteriores ya fueron retirados." : "No mostraremos datos parciales como si fueran un reporte completo."}</span></div><button type="button" data-reports-retry>Reintentar</button></div>`;
}

function sourceLabel(sourceId) {
  return ({
    FES_REP_ACTIVITY: "Actividad FES + REP",
    MONTHLY_GOAL_AND_CONFIRMED_POLICIES: "Meta y pólizas confirmadas",
    ADVISOR_FORECAST_ISSUED_SNAPSHOT: "Forecast emitido",
  })[sourceId] || sourceId;
}
function sourceStateLabel(state) {
  return ({ READY: "Conectada", UNAVAILABLE: "No disponible", SESSION_REQUIRED: "Requiere sesión" })[state] || state;
}

function mixRows(model) {
  const current = model?.activity?.comparison?.currentMix || {};
  const previous = model?.activity?.comparison?.previousMix || {};
  const types = [...new Set([...Object.keys(current), ...Object.keys(previous)])];
  if (!types.length) return `<p class="activity-report-empty">No hay hechos de actividad para desglosar.</p>`;
  const max = Math.max(1, ...types.flatMap((type) => [current[type] || 0, previous[type] || 0]));
  return types.map((type) => `
    <div class="activity-report-mix-row">
      <span>${escapeHtml(ACTIVITY_LABELS[type] || type)}</span>
      <div class="activity-report-bars">
        <i class="current" style="--report-bar:${((current[type] || 0) / max) * 100}%" title="Actual: ${current[type] || 0}"></i>
        <i class="previous" style="--report-bar:${((previous[type] || 0) / max) * 100}%" title="Anterior: ${previous[type] || 0}"></i>
      </div>
      <strong>${formatNumber(current[type] ?? 0)}</strong>
    </div>
  `).join("");
}

function renderReportsReady(root, model, periodKind) {
  root.innerHTML = reportsChrome(periodKind);
  root.dataset.reportsState = model.state.toLowerCase();
  const status = root.querySelector("[data-reports-status]");
  status.hidden = true;
  const content = root.querySelector("[data-reports-content]");
  content.hidden = false;

  const comparison = model.activity?.comparison || {};
  const production = model.production;
  const readModel = model.forecast?.readModel;
  const snapshot = model.forecast?.snapshot;
  const forecastPace = readModel?.paceProjection ?? snapshot?.paceProjection ?? null;
  const forecastState = readModel?.healthStatus || readModel?.state || (snapshot ? "ISSUED" : null);
  const activityUnavailable = !model.activity;

  content.innerHTML = `
    <section class="activity-report-kpis" aria-label="Indicadores del reporte">
      <article class="organic-card">
        <p>Actividad actual</p>
        <strong>${formatNumber(comparison.current)}</strong>
        <span>${escapeHtml(formatPeriod(model.period.current))}</span>
      </article>
      <article class="organic-card">
        <p>Contra periodo anterior</p>
        <strong>${comparison.delta === null ? "—" : `${comparison.delta > 0 ? "+" : ""}${comparison.delta}`}</strong>
        <span>${formatPercent(comparison.deltaPercent)} · ${escapeHtml(formatPeriod(model.period.previous))}</span>
      </article>
      <article class="organic-card">
        <p>Pólizas confirmadas</p>
        <strong>${production ? `${formatNumber(production.sold)} / ${formatNumber(production.target)}` : "—"}</strong>
        <span>${production ? "POLICY_SOLD_CONFIRMED únicamente" : "Fuente no disponible"}</span>
      </article>
      <article class="organic-card">
        <p>Ritmo Forecast</p>
        <strong>${formatNumber(forecastPace)}</strong>
        <span>${escapeHtml(forecastState || "Forecast no emitido")}</span>
      </article>
    </section>

    <section class="activity-report-grid">
      <article class="activity-report-card organic-card">
        <div class="activity-card-heading">
          <div><p class="section-kicker accent">MEZCLA DE ACTIVIDAD</p><h2>Actual frente al periodo anterior</h2></div>
          <span class="activity-chart-policy">REP chart-ready</span>
        </div>
        ${activityUnavailable ? `<p class="activity-report-empty">Actividad no disponible.</p>` : mixRows(model)}
        <div class="activity-report-bar-legend"><span><i class="current"></i>Actual</span><span><i class="previous"></i>Anterior</span></div>
      </article>

      <article class="activity-report-card organic-card">
        <p class="section-kicker accent">CONTEXTO FORECAST</p>
        <h2>${escapeHtml(readModel?.primaryExplanation || (snapshot ? "Snapshot mensual emitido" : "Sin Forecast emitido"))}</h2>
        <dl class="activity-report-facts">
          <div><dt>Meta</dt><dd>${formatNumber(readModel?.target ?? snapshot?.target)}</dd></div>
          <div><dt>Producción actual</dt><dd>${formatNumber(readModel?.currentProduction ?? snapshot?.currentProduction)}</dd></div>
          <div><dt>Pipeline ponderado</dt><dd>${formatNumber(readModel?.goalGap?.weightedPipelineContribution ?? snapshot?.weightedPipelineContribution)}</dd></div>
          <div><dt>Confianza</dt><dd>${escapeHtml(readModel?.confidence || "No disponible")}</dd></div>
        </dl>
        <p class="activity-authority-note">El ritmo y el Pipeline ponderado son contexto. No son producción, ingreso ni garantía de cierre.</p>
      </article>
    </section>

    <section class="activity-report-sources organic-card">
      <div><p class="section-kicker accent">FUENTES</p><h2>Inventario honesto</h2></div>
      <div class="activity-report-source-list">
        ${model.sources.map((source) => `<div data-report-source-state="${escapeHtml(source.state)}"><span>${escapeHtml(sourceLabel(source.sourceId))}</span><strong>${escapeHtml(sourceStateLabel(source.state))}</strong>${source.error ? `<small>${escapeHtml(source.error.code)}</small>` : ""}</div>`).join("")}
      </div>
    </section>

    <p class="activity-authority-note">Reporte de sólo lectura. No crea actividad, tareas, calendario, pólizas, oportunidades ni mutaciones CRM.</p>
  `;
}

export function createActivityModule({
  root,
  shell,
  operationalFactory = createActivityOperationalModule,
  reportsRuntimeFactory = createActivityReportsProductivityRuntime,
} = {}) {
  if (!root) throw new Error("Activity and Reports root is required");
  if (root[STATE]) return root[STATE];
  ensureStylesheet();
  renderWorkspace(root);

  const operationalRoot = root.querySelector("[data-activity-operational-root]");
  const reportsRoot = root.querySelector("[data-activity-reports-root]");
  const operational = operationalFactory({ root: operationalRoot, shell });
  const reportsRuntime = reportsRuntimeFactory();
  let view = selectedView();
  let reportPeriod = "MONTH_TO_DATE";
  let mounted = false;
  let generation = 0;
  let controller = null;
  let events = null;

  function syncTabs() {
    root.querySelectorAll("[data-activity-view-tab]").forEach((button) => {
      const active = button.dataset.activityViewTab === view;
      button.setAttribute("aria-selected", String(active));
      button.classList.toggle("active", active);
    });
    root.querySelector("[data-activity-workspace]").dataset.activityView = view;
  }

  async function loadReports() {
    const selectedGeneration = ++generation;
    controller?.abort();
    controller = new AbortController();
    renderReportsLoading(reportsRoot, reportPeriod);
    try {
      const model = await reportsRuntime.load({ periodKind: reportPeriod, signal: controller.signal });
      if (!mounted || view !== "reportes" || selectedGeneration !== generation) return;
      if (["SESSION_REQUIRED", "SOURCE_UNAVAILABLE"].includes(model.state)) renderReportsFailure(reportsRoot, model, reportPeriod);
      else renderReportsReady(reportsRoot, model, reportPeriod);
    } catch (error) {
      if (error?.name === "AbortError" || !mounted || selectedGeneration !== generation) return;
      renderReportsFailure(reportsRoot, { state: "SOURCE_UNAVAILABLE", error }, reportPeriod);
    }
  }

  async function activate(nextView, { updateUrl = false } = {}) {
    view = nextView === "reportes" ? "reportes" : "actividad";
    if (updateUrl) updateViewUrl(view);
    syncTabs();
    if (view === "reportes") {
      operational.unmount();
      operationalRoot.hidden = true;
      reportsRoot.hidden = false;
      await loadReports();
    } else {
      generation += 1;
      controller?.abort();
      reportsRoot.hidden = true;
      operationalRoot.hidden = false;
      operational.mount();
    }
  }

  async function scrub(reason = "session-scrub") {
    generation += 1;
    controller?.abort();
    await Promise.allSettled([
      operational.scrub?.(),
      reportsRuntime.scrub?.(reason),
    ]);
    reportsRoot.replaceChildren();
    reportsRoot.dataset.reportsState = "scrubbed";
  }

  function bind() {
    events?.abort();
    events = new AbortController();
    root.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-activity-view-tab]");
      const period = event.target.closest("[data-reports-period]");
      if (tab) void activate(tab.dataset.activityViewTab, { updateUrl: true });
      if (period) {
        reportPeriod = period.dataset.reportsPeriod;
        void loadReports();
      }
      if (event.target.closest("[data-reports-refresh], [data-reports-retry]")) void loadReports();
    }, { signal: events.signal });
    globalThis.addEventListener("forge:auth-state-changed", () => {
      void scrub("auth-state-changed").then(() => mounted && activate(selectedView()));
    }, { signal: events.signal });
    globalThis.addEventListener("forge:advisor-forecast-read-model-ready", () => {
      if (mounted && view === "reportes") void loadReports();
    }, { signal: events.signal });
  }

  const api = Object.freeze({
    mount() {
      mounted = true;
      root.hidden = false;
      bind();
      shell?.setAlfredState?.("idle", "thinking");
      void activate(selectedView());
    },
    unmount() {
      mounted = false;
      generation += 1;
      controller?.abort();
      events?.abort();
      operational.unmount();
      root.hidden = true;
      void reportsRuntime.scrub?.("route-unmount");
    },
    reconcile() {
      const requested = selectedView();
      if (mounted && requested !== view) void activate(requested);
      else syncTabs();
    },
    refresh() {
      return view === "reportes" ? loadReports() : operational.refresh();
    },
    scrub,
    async destroy() {
      mounted = false;
      events?.abort();
      controller?.abort();
      await Promise.allSettled([operational.destroy?.(), reportsRuntime.scrub?.("destroy")]);
      delete root[STATE];
    },
  });
  root[STATE] = api;
  return api;
}
