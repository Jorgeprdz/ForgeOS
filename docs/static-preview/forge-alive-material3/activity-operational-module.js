import { createProductiveActivityReportingBridge } from "./activity-ledger-reporting-bridge.js";

const PERIODS = Object.freeze([
  { kind: "TODAY", label: "Hoy" },
  { kind: "WEEK_TO_DATE", label: "Semana" },
  { kind: "MONTH_TO_DATE", label: "Mes" },
  { kind: "ROLLING_30_DAYS", label: "30 días" },
]);
const LABELS = Object.freeze({
  CONTACT_ATTEMPTED: "Contactos",
  CONVERSATION_COMPLETED: "Conversaciones",
  INITIAL_APPOINTMENT_SCHEDULED: "Citas iniciales agendadas",
  INITIAL_APPOINTMENT_COMPLETED: "Citas iniciales realizadas",
  CLOSING_APPOINTMENT_SCHEDULED: "Cierres agendados",
  CLOSING_APPOINTMENT_COMPLETED: "Cierres realizados",
  FOLLOW_UP_COMPLETED: "Seguimientos",
});
const STATE = Symbol.for("forge.rep-18.activity-operational.state");

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

function typeOf(series) {
  return String(series?.seriesId || "").replace(/^activity-series:/, "");
}
function classOf(type) {
  return `activity-type--${String(type).toLowerCase().replaceAll("_", "-")}`;
}
function labelOf(type) {
  return LABELS[type] || type;
}
function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T12:00:00.000Z`));
}
function formatPeriod(period) {
  if (!period?.from || !period?.to) return "Periodo sin resolver";
  const from = formatDate(period.from, { day: "numeric", month: "short" });
  const to = formatDate(period.to, { day: "numeric", month: "short" });
  return period.from === period.to ? from : `${from} – ${to}`;
}

function surfaceOf(root) {
  return root.querySelector("[data-activity-surface]");
}

function setSurfaceState(root, state) {
  const surface = surfaceOf(root);
  surface.dataset.activityState = state;
  surface.dataset.activitySurfaceState = state;
  return surface;
}

function renderChrome(root, selectedPeriod) {
  root.innerHTML = `
    <section class="activity-operational" data-activity-operational data-activity-surface data-activity-state="idle" data-activity-surface-state="idle">
      <header class="activity-hero">
        <div>
          <p class="section-kicker accent">ACTIVIDAD</p>
          <h1>Tu trabajo comercial, respaldado por hechos</h1>
          <p class="activity-subtitle">Lectura directa del ledger FES · sin captura paralela</p>
        </div>
        <button class="activity-refresh" type="button" data-activity-refresh aria-label="Actualizar actividad">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h8V3l-3.3 3.3Z"/></svg>
        </button>
      </header>
      <div class="activity-periods" role="group" aria-label="Periodo de actividad">
        ${PERIODS.map((period) => `<button type="button" class="activity-period${period.kind === selectedPeriod ? " active" : ""}" data-activity-period="${period.kind}" aria-pressed="${period.kind === selectedPeriod}">${period.label}</button>`).join("")}
      </div>
      <section class="activity-status-card organic-card" data-activity-status-card aria-live="polite"></section>
      <section class="activity-summary organic-card" data-activity-summary hidden></section>
      <section class="activity-chart-card organic-card" data-activity-chart-card hidden>
        <div class="activity-card-heading">
          <div><p class="section-kicker accent">DISTRIBUCIÓN</p><h2>Actividad por día</h2></div>
          <span class="activity-chart-policy" data-activity-chart-policy></span>
        </div>
        <div class="activity-chart" data-activity-chart role="img"></div>
        <div class="activity-legend" data-activity-legend aria-label="Tipos de actividad"></div>
      </section>
      <p class="activity-authority-note" data-activity-authority-note>Forge representa eventos canónicos de FES mediante REP. Esta vista no crea ni corrige actividad.</p>
    </section>
  `;
}

function renderLoading(root) {
  const surface = setSurfaceState(root, "loading");
  surface.setAttribute("aria-busy", "true");
  root.querySelector("[data-activity-summary]").hidden = true;
  root.querySelector("[data-activity-chart-card]").hidden = true;
  const status = root.querySelector("[data-activity-status-card]");
  status.hidden = false;
  status.innerHTML = `<div class="activity-loading"><span class="activity-spinner" aria-hidden="true"></span><div><strong>Consultando el ledger FES</strong><span>Sincronizando la autoridad antes de calcular.</span></div></div>`;
}

function renderError(root, error) {
  const session = error?.code === "FES_LEDGER_SESSION_BINDING_FAILED" || error?.code === "SESSION_REQUIRED";
  const status = root.querySelector("[data-activity-status-card]");
  setSurfaceState(root, session ? "session-required" : "source-unavailable");
  root.querySelector("[data-activity-summary]").hidden = true;
  root.querySelector("[data-activity-chart-card]").hidden = true;
  status.hidden = false;
  status.innerHTML = `<div class="activity-state activity-state--error"><span class="activity-state-icon" aria-hidden="true">!</span><div><strong>${session ? "Necesitamos una sesión activa" : "No pudimos validar la actividad"}</strong><span>${session ? "Inicia sesión nuevamente para consultar tu ledger productivo." : "No mostraremos datos locales como si fueran completos."}</span></div><button type="button" data-activity-retry>Reintentar</button></div>`;
}

function renderEmpty(root, result) {
  const status = root.querySelector("[data-activity-status-card]");
  setSurfaceState(root, "empty");
  root.querySelector("[data-activity-summary]").hidden = true;
  root.querySelector("[data-activity-chart-card]").hidden = true;
  status.hidden = false;
  status.innerHTML = `<div class="activity-state activity-state--empty"><span class="activity-state-icon" aria-hidden="true">✓</span><div><strong>No hay actividad confirmada en este periodo</strong><span>${escapeHtml(formatPeriod(result.report.period))} · ausencia de hechos, no cero inventado.</span></div></div>`;
}

function renderReady(root, result) {
  const { report, chartReady } = result;
  const total = report.totals.activityCount;
  const surface = setSurfaceState(root, "ready");
  surface.dataset.chartReadySurfaceId = chartReady.surfaceId;
  surface.removeAttribute("aria-busy");
  root.querySelector("[data-activity-status-card]").hidden = true;
  const summary = root.querySelector("[data-activity-summary]");
  summary.hidden = false;
  summary.innerHTML = `<div class="activity-summary-copy"><p class="section-kicker accent">TOTAL DEL PERIODO</p><strong>${escapeHtml(total)}</strong><span>${escapeHtml(formatPeriod(report.period))}</span></div><div class="activity-truth-badge"><span aria-hidden="true">◆</span><div><strong>FES confirmado</strong><small>${chartReady.partialPeriodState === "PARTIAL_CURRENT_PERIOD" ? "Periodo actual parcial" : "Periodo completo"}</small></div></div>`;

  const chartCard = root.querySelector("[data-activity-chart-card]");
  chartCard.hidden = false;
  const dates = [...new Set(chartReady.series.flatMap((series) => series.points.map((point) => point.x)))].sort();
  const chart = root.querySelector("[data-activity-chart]");
  chart.setAttribute("aria-label", `Actividad por día. Total confirmado: ${total}.`);
  chart.innerHTML = dates.map((date) => {
    const segments = chartReady.series.flatMap((series) => {
      const type = typeOf(series);
      return series.points.filter((point) => point.x === date).map((point) => {
        const rowKeys = Array.isArray(point.rowKeys) ? point.rowKeys.join(",") : "";
        return `<span class="activity-chart-segment ${classOf(type)}" data-point-id="${escapeHtml(point.pointId || `${series.seriesId}:${date}`)}" data-row-keys="${escapeHtml(rowKeys)}" style="--activity-flex:${Math.max(Number(point.value) || 0, 0.0001)}" title="${escapeHtml(labelOf(type))}: ${escapeHtml(point.value)}"><b>${escapeHtml(point.value)}</b></span>`;
      });
    }).join("");
    return `<div class="activity-chart-row"><span class="activity-chart-date">${escapeHtml(formatDate(date, { weekday: "short", day: "numeric", month: "short" }))}</span><div class="activity-chart-stack">${segments}</div></div>`;
  }).join("");
  root.querySelector("[data-activity-legend]").innerHTML = chartReady.series.map((series) => {
    const type = typeOf(series);
    return `<span class="activity-legend-item"><i class="${classOf(type)}" aria-hidden="true"></i>${escapeHtml(labelOf(type))}</span>`;
  }).join("");
  root.querySelector("[data-activity-chart-policy]").textContent = chartReady.recommendedVisualization === "STACKED_BAR" ? "Barras apiladas" : chartReady.recommendedVisualization;
}

export function createActivityOperationalModule({
  root,
  shell,
  runtimeFactory = createProductiveActivityReportingBridge,
  timeZone = "America/Mexico_City",
  clock = () => new Date(),
} = {}) {
  if (!root) throw new Error("Activity operational root is required");
  if (root[STATE]) return root[STATE];
  ensureStylesheet();
  let selectedPeriod = "WEEK_TO_DATE";
  let runtime = null;
  let mounted = false;
  let sequence = 0;
  let events = null;
  renderChrome(root, selectedPeriod);

  async function getRuntime() {
    if (!runtime) runtime = await runtimeFactory({ timeZone, clock });
    return runtime;
  }
  function syncPeriodButtons() {
    root.querySelectorAll("[data-activity-period]").forEach((button) => {
      const active = button.dataset.activityPeriod === selectedPeriod;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }
  async function load() {
    const selected = ++sequence;
    renderLoading(root);
    try {
      const result = await (await getRuntime()).runChartReady({
        period: { kind: selectedPeriod, parameters: {} },
        timeZone,
        asOf: clock().toISOString(),
      });
      if (!mounted || selected !== sequence) return;
      if (result.report.state === "EMPTY" || result.chartReady.missingDataState === "NO_MATCHING_FACTS") renderEmpty(root, result);
      else renderReady(root, result);
    } catch (error) {
      if (mounted && selected === sequence) renderError(root, error);
    }
  }
  function bind() {
    events?.abort();
    events = new AbortController();
    root.addEventListener("click", (event) => {
      const period = event.target.closest("[data-activity-period]");
      if (period) {
        selectedPeriod = period.dataset.activityPeriod;
        syncPeriodButtons();
        void load();
      }
      if (event.target.closest("[data-activity-refresh], [data-activity-retry]")) void load();
    }, { signal: events.signal });
  }
  const api = Object.freeze({
    mount() {
      mounted = true;
      root.hidden = false;
      bind();
      shell?.setAlfredState?.("idle", "thinking");
      void load();
    },
    unmount() {
      mounted = false;
      sequence += 1;
      events?.abort();
      root.hidden = true;
    },
    reconcile: syncPeriodButtons,
    refresh: load,
    async scrub() {
      mounted = false;
      sequence += 1;
      events?.abort();
      await runtime?.close?.();
      runtime = null;
      renderChrome(root, selectedPeriod);
    },
    async destroy() {
      await api.scrub();
      delete root[STATE];
    },
  });
  root[STATE] = api;
  return api;
}
