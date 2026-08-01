import {
  createProductiveActivityReportingBridge,
} from "./activity-ledger-reporting-bridge.js";

const ACTIVITY_PERIODS = Object.freeze([
  Object.freeze({ kind: "TODAY", label: "Hoy" }),
  Object.freeze({ kind: "WEEK_TO_DATE", label: "Semana" }),
  Object.freeze({ kind: "MONTH_TO_DATE", label: "Mes" }),
  Object.freeze({ kind: "ROLLING_30_DAYS", label: "30 días" }),
]);

const ACTIVITY_LABELS = Object.freeze({
  CONTACT_ATTEMPTED: "Contactos",
  CONVERSATION_COMPLETED: "Conversaciones",
  INITIAL_APPOINTMENT_SCHEDULED: "Citas iniciales agendadas",
  INITIAL_APPOINTMENT_COMPLETED: "Citas iniciales realizadas",
  CLOSING_APPOINTMENT_SCHEDULED: "Cierres agendados",
  CLOSING_APPOINTMENT_COMPLETED: "Cierres realizados",
  FOLLOW_UP_COMPLETED: "Seguimientos",
});

const moduleStateKey = Symbol.for("forge.rep-16d.activity-module.state");

function ensureStylesheet() {
  if (document.querySelector("[data-activity-module-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("activity-module.css?v=rep-16d-001", import.meta.url);
  link.dataset.activityModuleStyles = "true";
  document.head.append(link);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function activityTypeFromSeries(series) {
  const prefix = "activity-series:";
  return series.seriesId.startsWith(prefix)
    ? series.seriesId.slice(prefix.length)
    : series.seriesId;
}

function activityLabel(activityType) {
  return ACTIVITY_LABELS[activityType] ?? activityType;
}

function activityClass(activityType) {
  return `activity-type--${activityType.toLowerCase().replaceAll("_", "-")}`;
}

function formatPeriod(period) {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  const from = formatter.format(new Date(`${period.from}T12:00:00.000Z`));
  const to = formatter.format(new Date(`${period.to}T12:00:00.000Z`));
  return period.from === period.to ? from : `${from} – ${to}`;
}

function formatDateLabel(value) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00.000Z`));
}

function renderModuleChrome(root, selectedPeriod) {
  root.innerHTML = `
    <div class="activity-surface" data-activity-surface data-activity-surface-state="idle">
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
        ${ACTIVITY_PERIODS.map((period) => `
          <button
            type="button"
            class="activity-period${period.kind === selectedPeriod ? " active" : ""}"
            data-activity-period="${period.kind}"
            aria-pressed="${period.kind === selectedPeriod}"
          >${period.label}</button>
        `).join("")}
      </div>

      <section class="activity-status-card organic-card" data-activity-status-card aria-live="polite">
        <div class="activity-loading" data-activity-loading>
          <span class="activity-spinner" aria-hidden="true"></span>
          <div>
            <strong>Consultando el ledger FES</strong>
            <span>Sincronizando la autoridad antes de calcular.</span>
          </div>
        </div>
      </section>

      <section class="activity-summary organic-card" data-activity-summary hidden></section>
      <section class="activity-chart-card organic-card" data-activity-chart-card hidden>
        <div class="activity-card-heading">
          <div>
            <p class="section-kicker accent">DISTRIBUCIÓN</p>
            <h2 data-activity-chart-title>Actividad por día</h2>
          </div>
          <span class="activity-chart-policy" data-activity-chart-policy></span>
        </div>
        <div class="activity-chart" data-activity-chart role="img"></div>
        <div class="activity-legend" data-activity-legend aria-label="Tipos de actividad"></div>
      </section>

      <p class="activity-authority-note" data-activity-authority-note>
        Forge calcula desde eventos canónicos. Esta pantalla sólo representa la proyección chart-ready.
      </p>
    </div>
  `;
}

function renderLoading(root) {
  const surface = root.querySelector("[data-activity-surface]");
  const status = root.querySelector("[data-activity-status-card]");
  const summary = root.querySelector("[data-activity-summary]");
  const chartCard = root.querySelector("[data-activity-chart-card]");
  surface.dataset.activitySurfaceState = "loading";
  delete surface.dataset.chartReadySurfaceId;
  status.hidden = false;
  summary.hidden = true;
  chartCard.hidden = true;
  status.innerHTML = `
    <div class="activity-loading" data-activity-loading>
      <span class="activity-spinner" aria-hidden="true"></span>
      <div>
        <strong>Consultando el ledger FES</strong>
        <span>Sincronizando la autoridad antes de calcular.</span>
      </div>
    </div>
  `;
}

function renderError(root, error) {
  const surface = root.querySelector("[data-activity-surface]");
  const status = root.querySelector("[data-activity-status-card]");
  const summary = root.querySelector("[data-activity-summary]");
  const chartCard = root.querySelector("[data-activity-chart-card]");
  const sessionFailure = error?.code === "FES_LEDGER_SESSION_BINDING_FAILED";
  const syncFailure = error?.code === "FES_LEDGER_SYNC_UNAVAILABLE";

  surface.dataset.activitySurfaceState = sessionFailure
    ? "session-required"
    : syncFailure
      ? "source-unavailable"
      : "error";
  summary.hidden = true;
  chartCard.hidden = true;
  status.hidden = false;
  status.innerHTML = `
    <div class="activity-state activity-state--error">
      <span class="activity-state-icon" aria-hidden="true">!</span>
      <div>
        <strong>${sessionFailure ? "Necesitamos una sesión activa" : "No pudimos validar la actividad"}</strong>
        <span>${syncFailure
          ? "El ledger FES no respondió. No mostraremos datos locales como si fueran completos."
          : sessionFailure
            ? "Inicia sesión nuevamente para consultar tu ledger productivo."
            : "La lectura gobernada no pudo completarse."}</span>
      </div>
      <button type="button" data-activity-retry>Reintentar</button>
    </div>
  `;
}

function renderEmpty(root, report, surfaceModel) {
  const surface = root.querySelector("[data-activity-surface]");
  const status = root.querySelector("[data-activity-status-card]");
  const summary = root.querySelector("[data-activity-summary]");
  const chartCard = root.querySelector("[data-activity-chart-card]");
  surface.dataset.activitySurfaceState = "empty";
  surface.dataset.chartReadySurfaceId = surfaceModel.surfaceId;
  summary.hidden = true;
  chartCard.hidden = true;
  status.hidden = false;
  status.innerHTML = `
    <div class="activity-state activity-state--empty">
      <span class="activity-state-icon" aria-hidden="true">✓</span>
      <div>
        <strong>No hay actividad confirmada en este periodo</strong>
        <span>${escapeHtml(formatPeriod(report.period))} · no se inventaron ceros.</span>
      </div>
    </div>
  `;
}

function renderReady(root, result) {
  const { report, chartReady } = result;
  const surface = root.querySelector("[data-activity-surface]");
  const status = root.querySelector("[data-activity-status-card]");
  const summary = root.querySelector("[data-activity-summary]");
  const chartCard = root.querySelector("[data-activity-chart-card]");
  const chart = root.querySelector("[data-activity-chart]");
  const legend = root.querySelector("[data-activity-legend]");
  const policy = root.querySelector("[data-activity-chart-policy]");

  surface.dataset.activitySurfaceState = "ready";
  surface.dataset.chartReadySurfaceId = chartReady.surfaceId;
  status.hidden = true;
  summary.hidden = false;
  chartCard.hidden = false;

  const total = report.totals.activityCount;
  const partial = chartReady.partialPeriodState === "PARTIAL_CURRENT_PERIOD";
  summary.innerHTML = `
    <div class="activity-summary-copy">
      <p class="section-kicker accent">TOTAL DEL PERIODO</p>
      <strong>${escapeHtml(total)}</strong>
      <span>${escapeHtml(formatPeriod(report.period))}</span>
    </div>
    <div class="activity-truth-badge">
      <span aria-hidden="true">◆</span>
      <div>
        <strong>FES confirmado</strong>
        <small>${partial ? "Periodo actual parcial" : "Periodo completo"}</small>
      </div>
    </div>
  `;

  const dates = [...new Set(
    chartReady.series.flatMap((series) => series.points.map((point) => point.x)),
  )].sort();

  chart.setAttribute(
    "aria-label",
    `Actividad por día. Total confirmado: ${total}.`,
  );
  chart.innerHTML = dates.map((date) => {
    const segments = chartReady.series.flatMap((series) => {
      const activityType = activityTypeFromSeries(series);
      return series.points
        .filter((point) => point.x === date)
        .map((point) => `
          <span
            class="activity-chart-segment ${activityClass(activityType)}"
            style="--activity-flex:${Math.max(point.value, 0.0001)}"
            data-point-id="${escapeHtml(point.pointId)}"
            data-row-keys="${escapeHtml(point.rowKeys.join(","))}"
            title="${escapeHtml(activityLabel(activityType))}: ${escapeHtml(point.value)}"
          ><b>${escapeHtml(point.value)}</b></span>
        `);
    }).join("");

    return `
      <div class="activity-chart-row">
        <span class="activity-chart-date">${escapeHtml(formatDateLabel(date))}</span>
        <div class="activity-chart-stack">${segments}</div>
      </div>
    `;
  }).join("");

  legend.innerHTML = chartReady.series.map((series) => {
    const activityType = activityTypeFromSeries(series);
    return `
      <span class="activity-legend-item">
        <i class="${activityClass(activityType)}" aria-hidden="true"></i>
        ${escapeHtml(activityLabel(activityType))}
      </span>
    `;
  }).join("");

  policy.textContent = chartReady.recommendedVisualization === "STACKED_BAR"
    ? "Barras apiladas"
    : chartReady.recommendedVisualization;
}

export function createActivityModule({
  root,
  shell,
  runtimeFactory = createProductiveActivityReportingBridge,
  timeZone = "America/Mexico_City",
  clock = () => new Date(),
} = {}) {
  if (!root) throw new Error("REP-16D Activity root is required");
  if (root[moduleStateKey]) return root[moduleStateKey].api;

  ensureStylesheet();
  let selectedPeriod = "WEEK_TO_DATE";
  let runtime = null;
  let mounted = false;
  let requestSequence = 0;
  let eventController = null;

  renderModuleChrome(root, selectedPeriod);

  async function getRuntime() {
    if (!runtime) {
      runtime = await runtimeFactory({ timeZone, clock });
    }
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
    const sequence = ++requestSequence;
    renderLoading(root);
    try {
      const selectedRuntime = await getRuntime();
      const result = await selectedRuntime.runChartReady({
        period: {
          kind: selectedPeriod,
          parameters: {},
        },
        timeZone,
        asOf: clock().toISOString(),
      });
      if (!mounted || sequence !== requestSequence) return;

      if (
        result.chartReady.missingDataState === "NO_MATCHING_FACTS" ||
        result.report.state === "EMPTY"
      ) {
        renderEmpty(root, result.report, result.chartReady);
      } else {
        renderReady(root, result);
      }
    } catch (error) {
      if (!mounted || sequence !== requestSequence) return;
      renderError(root, error);
    }
  }

  function bindEvents() {
    eventController?.abort();
    eventController = new AbortController();
    const { signal } = eventController;

    root.addEventListener("click", (event) => {
      const periodButton = event.target.closest("[data-activity-period]");
      const refreshButton = event.target.closest(
        "[data-activity-refresh], [data-activity-retry]",
      );

      if (periodButton) {
        selectedPeriod = periodButton.dataset.activityPeriod;
        syncPeriodButtons();
        load();
      }
      if (refreshButton) load();
    }, { signal });
  }

  const api = Object.freeze({
    mount() {
      mounted = true;
      root.hidden = false;
      bindEvents();
      shell?.setAlfredState?.("idle", "thinking");
      load();
    },
    unmount() {
      mounted = false;
      requestSequence += 1;
      eventController?.abort();
      root.hidden = true;
    },
    reconcile() {
      if (mounted) syncPeriodButtons();
    },
    refresh: load,
    async destroy() {
      mounted = false;
      requestSequence += 1;
      eventController?.abort();
      await runtime?.close?.();
      runtime = null;
      delete root[moduleStateKey];
    },
  });

  root[moduleStateKey] = { api };
  return api;
}
