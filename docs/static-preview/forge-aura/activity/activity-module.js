import { createManualActivityEntry } from "../../forge-alive-material3/activity-manual-entry.js";
import {
  pointRuleRows,
  projectOfficialActivityPoints,
} from "./activity-points-projection.js";

const PERIODS = Object.freeze([
  ["TODAY", "Hoy"],
  ["WEEK_TO_DATE", "Semana actual"],
  ["MONTH_TO_DATE", "Mes actual"],
  ["ROLLING_30_DAYS", "Últimos 30 días"],
]);
const STATE = Symbol.for("forge.aura.activity-reports.001");
const esc = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");
const fmtDate = value => new Intl.DateTimeFormat("es-MX", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${value}T12:00:00Z`));
const periodText = period => period?.from && period?.to
  ? `${fmtDate(period.from)} – ${fmtDate(period.to)}`
  : "Periodo sin resolver";

async function productiveReportingFactory(options) {
  const { createActivityReportsProductivityRuntime } = await import(
    "../../forge-alive-material3/activity-reports-productivity-runtime.js"
  );
  return createActivityReportsProductivityRuntime(options);
}

function chrome(root) {
  root.innerHTML = `
    <section class="activity-aura" data-activity-aura>
      <header class="activity-aura__hero">
        <div>
          <p class="aura-eyebrow">ACTIVIDAD</p>
          <h1>Tu operación comercial, en contexto</h1>
          <p>Registra lo que hiciste, entiende el avance y revisa la evidencia sin lidiar con identificadores técnicos.</p>
        </div>
        <button class="aura-primary" type="button" data-open-capture>Registrar actividad</button>
      </header>
      <div class="activity-tabs" role="tablist" aria-label="Actividad y reportes">
        <button role="tab" id="activity-tab" aria-controls="activity-panel" aria-selected="true" tabindex="0" data-tab="activity">Actividad</button>
        <button role="tab" id="reports-tab" aria-controls="reports-panel" aria-selected="false" tabindex="-1" data-tab="reports">Reportes</button>
      </div>
      <section role="tabpanel" id="activity-panel" aria-labelledby="activity-tab" data-panel="activity">
        <div class="activity-status" data-status role="status" aria-live="polite"></div>
        <div class="activity-summary-grid" data-summary hidden></div>
        <section class="activity-capture-host" data-capture-host></section>
      </section>
      <section role="tabpanel" id="reports-panel" aria-labelledby="reports-tab" data-panel="reports" hidden>
        <div class="reports-toolbar">
          <label>Periodo<select data-period>${PERIODS.map(([value, label]) => `<option value="${value}"${value === "WEEK_TO_DATE" ? " selected" : ""}>${label}</option>`).join("")}</select></label>
          <button type="button" class="aura-secondary" data-refresh>Actualizar</button>
        </div>
        <div class="activity-status" data-report-status role="status" aria-live="polite"></div>
        <div class="activity-summary-grid" data-report-summary hidden></div>
        <section class="activity-chart-card activity-points-card" data-points-card hidden>
          <div class="activity-card-heading">
            <div><p class="aura-eyebrow">PUNTUACIÓN</p><h2>Sistema oficial de productividad</h2></div>
            <strong data-points-total></strong>
          </div>
          <p class="activity-chart-text" data-points-state></p>
          <details>
            <summary>Ver baremo oficial</summary>
            <div class="activity-points-rules" data-points-rules></div>
          </details>
        </section>
        <section class="activity-chart-card" data-chart-card hidden>
          <div class="activity-card-heading">
            <div><p class="aura-eyebrow">DISTRIBUCIÓN</p><h2>Actividad confirmada</h2></div>
            <span data-period-label></span>
          </div>
          <div data-chart-text class="activity-chart-text"></div>
          <div data-chart aria-label="Distribución de actividad" role="img"></div>
          <details><summary>Ver tabla accesible</summary><div data-chart-table></div></details>
        </section>
      </section>
    </section>`;
}

function setTabs(root, selected) {
  root.querySelectorAll('[role="tab"]').forEach(tab => {
    const active = tab.dataset.tab === selected;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  root.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    panel.hidden = panel.dataset.panel !== selected;
  });
}

function renderState(node, title, detail, action = "") {
  node.innerHTML = `<div class="aura-state"><strong>${esc(title)}</strong><span>${esc(detail)}</span>${action ? `<button type="button" class="aura-secondary" data-state-action>${esc(action)}</button>` : ""}</div>`;
}

function seriesRows(chartReady) {
  return (chartReady?.series || []).flatMap(series => (series.points || []).map(point => ({
    type: String(series.seriesId || "").replace(/^activity-series:/, ""),
    date: point.x,
    value: Number(point.value) || 0,
  })));
}

function pointsSummary(points) {
  if (points?.state === "READY") {
    return {
      value: `${points.total} / ${points.objective}`,
      detail: points.remaining === 0
        ? "Meta diaria completada con evidencia confirmada"
        : `${points.remaining} puntos por completar`,
    };
  }
  return {
    value: "Pendiente",
    detail: "Baremo oficial conectado; faltan evidencias completas para calcular sin inventar ceros",
  };
}

function renderPoints(root, points) {
  const card = root.querySelector('[data-points-card]');
  if (!card) return;
  const summary = pointsSummary(points);
  const rules = pointRuleRows(points);
  card.hidden = false;
  root.querySelector('[data-points-total]').textContent = summary.value;
  root.querySelector('[data-points-state]').textContent = points?.state === "READY"
    ? summary.detail
    : "Forge ya lee el baremo oficial. La puntuación se mantiene pendiente hasta que todas las métricas requeridas tengan evidencia completa.";
  root.querySelector('[data-points-rules]').innerHTML = rules.length
    ? rules.map(rule => `<div class="activity-points-rule"><span>${esc(rule.label)}</span><b>${esc(rule.points)} pts</b></div>`).join("")
    : `<p>El baremo no está disponible de forma verificable.</p>`;
}

function renderReady(root, result) {
  const current = result.activity?.current;
  const report = current?.report;
  const chartReady = current?.chartReady;
  const comparison = result.activity?.comparison;
  const production = result.production;
  const points = projectOfficialActivityPoints(result);
  const pointSummary = pointsSummary(points);
  const status = root.querySelector('[data-status]');
  const reportStatus = root.querySelector('[data-report-status]');

  if (!report) {
    renderState(status, "Actividad no disponible", "La autoridad FES/REP no devolvió una lectura válida.", "Reintentar");
    renderState(reportStatus, "Reporte no disponible", "No mostraremos cifras sin una fuente productiva confirmada.", "Reintentar");
    return;
  }

  status.replaceChildren();
  const total = report.totals?.activityCount;
  const summary = root.querySelector('[data-summary]');
  summary.hidden = false;
  summary.innerHTML = `
    <article><span>Actividad del periodo</span><strong>${Number.isFinite(total) ? esc(total) : "Sin dato"}</strong><small>${esc(periodText(report.period))}</small></article>
    <article><span>Puntos oficiales</span><strong>${esc(pointSummary.value)}</strong><small>${esc(pointSummary.detail)}</small></article>
    <article><span>Evidencia</span><strong>FES</strong><small>Ledger canónico sincronizado</small></article>`;

  renderPoints(root, points);

  if (report.state === "EMPTY" || chartReady?.missingDataState === "NO_MATCHING_FACTS") {
    root.querySelector('[data-report-summary]').hidden = true;
    root.querySelector('[data-chart-card]').hidden = true;
    renderState(reportStatus, "No hay actividad confirmada en este periodo", `${periodText(report.period)} · ausencia confirmada de hechos, no un cero inventado.`);
    return;
  }

  if (result.state === "PARTIAL") {
    const unavailable = (result.sources || [])
      .filter(source => source.state !== "READY")
      .map(source => source.sourceId)
      .join(", ");
    renderState(reportStatus, "Reporte parcial", `La actividad confirmada sigue disponible. Fuentes con limitación: ${unavailable || "fuente secundaria"}.`);
  } else {
    reportStatus.replaceChildren();
  }

  const reportSummary = root.querySelector('[data-report-summary]');
  reportSummary.hidden = false;
  const delta = comparison?.delta;
  const target = production?.target;
  const sold = production?.sold;
  reportSummary.innerHTML = `
    <article><span>Actividad confirmada</span><strong>${Number.isFinite(total) ? esc(total) : "Sin dato"}</strong><small>${esc(periodText(report.period))}</small></article>
    <article><span>Puntos oficiales</span><strong>${esc(pointSummary.value)}</strong><small>${esc(pointSummary.detail)}</small></article>
    <article><span>Vs. periodo anterior</span><strong>${Number.isFinite(delta) ? `${delta > 0 ? "+" : ""}${esc(delta)}` : "Sin comparación"}</strong><small>${comparison?.zeroComparisonBlocked ? "Base anterior igual a cero; porcentaje bloqueado" : Number.isFinite(comparison?.deltaPercent) ? `${comparison.deltaPercent > 0 ? "+" : ""}${esc(comparison.deltaPercent)}%` : "Comparación no disponible"}</small></article>
    <article><span>Pólizas confirmadas del mes</span><strong>${Number.isFinite(sold) ? esc(sold) : "Sin dato"}</strong><small>Autoridad de pólizas confirmadas</small></article>
    <article><span>Meta mensual</span><strong>${Number.isFinite(target) ? esc(target) : "No configurada"}</strong><small>${Number.isFinite(target) && Number.isFinite(sold) ? `${Math.max(target - sold, 0)} por completar` : "No se inventa una meta ausente"}</small></article>`;

  const rows = seriesRows(chartReady);
  const chartCard = root.querySelector('[data-chart-card]');
  chartCard.hidden = false;
  root.querySelector('[data-period-label]').textContent = periodText(report.period);
  root.querySelector('[data-chart-text]').textContent = rows.length
    ? `${rows.reduce((sum, row) => sum + row.value, 0)} actividades distribuidas en ${new Set(rows.map(row => row.date)).size} días con evidencia.`
    : "Sin distribución disponible.";
  const max = Math.max(1, ...rows.map(row => row.value));
  root.querySelector('[data-chart]').innerHTML = rows.map(row => `
    <div class="activity-bar-row">
      <span>${esc(row.date)}</span>
      <div><i style="--bar:${Math.max(4, (row.value / max) * 100)}%"></i></div>
      <b>${esc(row.value)}</b><small>${esc(row.type)}</small>
    </div>`).join("");
  root.querySelector('[data-chart-table]').innerHTML = `
    <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Actividades</th></tr></thead><tbody>
      ${rows.map(row => `<tr><td>${esc(row.date)}</td><td>${esc(row.type)}</td><td>${esc(row.value)}</td></tr>`).join("")}
    </tbody></table>`;
}

export function createActivityModule({
  root,
  globalState,
  reportingFactory = null,
} = {}) {
  if (!root) throw new Error("AURA_ACTIVITY_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  chrome(root);

  let reporting = null;
  let manual = null;
  let mounted = false;
  let revision = 0;

  async function runtime() {
    if (!reporting) {
      const factory = reportingFactory || productiveReportingFactory;
      reporting = await factory({ timeZone: "America/Mexico_City" });
    }
    return reporting;
  }

  async function load() {
    const selected = ++revision;
    const periodKind = root.querySelector('[data-period]')?.value || "WEEK_TO_DATE";
    renderState(root.querySelector('[data-status]'), "Validando actividad", "Sincronizando la autoridad FES antes de mostrar cifras.");
    renderState(root.querySelector('[data-report-status]'), "Preparando reporte", "Consultando actividad, metas, puntuación y pólizas confirmadas.");
    try {
      const result = await (await runtime()).load({ periodKind });
      if (!mounted || selected !== revision) return;
      if (result.state === "SESSION_REQUIRED") {
        renderState(root.querySelector('[data-status]'), "Sesión requerida", "Vuelve a iniciar sesión para consultar tu actividad.");
        renderState(root.querySelector('[data-report-status]'), "Sesión requerida", "La identidad productiva debe validarse de nuevo.");
        return;
      }
      if (result.state === "SOURCE_UNAVAILABLE") {
        renderState(root.querySelector('[data-status]'), "Fuente temporalmente no disponible", "Conservamos la captura disponible, pero no presentaremos datos incompletos como confirmados.", "Reintentar");
        renderState(root.querySelector('[data-report-status]'), "Reporte no disponible", "No mostraremos ceros mientras la autoridad principal no pueda sincronizarse.", "Reintentar");
        return;
      }
      renderReady(root, result);
    } catch (error) {
      if (!mounted || selected !== revision) return;
      renderState(root.querySelector('[data-status]'), "No pudimos validar la actividad", "La captura permanece disponible; los datos de lectura no se presentarán como confirmados.", "Reintentar");
      renderState(root.querySelector('[data-report-status]'), "Reporte no disponible", "La fuente productiva no respondió de forma verificable.", "Reintentar");
    }
  }

  function bind() {
    root.addEventListener("click", event => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) setTabs(root, tab.dataset.tab);
      if (event.target.closest('[data-refresh], [data-state-action]')) void load();
      if (event.target.closest('[data-open-capture]')) {
        root.querySelector('[data-capture-host] [data-open-manual-activity]')?.click();
      }
    });
    root.querySelector('[data-period]').addEventListener("change", () => void load());
    root.querySelector('.activity-tabs').addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      const tabs = [...root.querySelectorAll('[role="tab"]')];
      let index = tabs.indexOf(document.activeElement);
      if (event.key === "ArrowRight") index = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") index = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") index = 0;
      if (event.key === "End") index = tabs.length - 1;
      event.preventDefault();
      tabs[index].focus();
      tabs[index].click();
    });
  }

  const api = Object.freeze({
    async mount() {
      mounted = true;
      root.hidden = false;
      bind();
      manual = createManualActivityEntry({ root: root.querySelector('[data-capture-host]') });
      manual.mount();
      globalState?.("Actividad conectada a autoridades productivas existentes");
      await load();
    },
    async unmount() {
      mounted = false;
      revision += 1;
      await manual?.unmount?.();
      root.hidden = true;
    },
    async scrub() {
      revision += 1;
      await manual?.scrub?.();
      await reporting?.scrub?.("aura-activity-scrub");
      reporting = null;
    },
    async destroy() {
      await api.scrub();
      await manual?.destroy?.();
      root.replaceChildren();
      delete root[STATE];
    },
  });
  root[STATE] = api;
  return api;
}
