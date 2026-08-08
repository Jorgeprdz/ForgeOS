import { createManualActivityEntry } from "../../forge-alive-material3/activity-manual-entry.js";
import { createActivityDailyConfirmation } from "./activity-daily-confirmation.js";
import { createActivityMailConnection } from "./activity-mail-connection.js";
import {
  pointImpactForMetric,
  pointRuleRows,
  projectOfficialActivityPoints,
  recommendOfficialActivityActions,
} from "./activity-points-projection.js";

const PERIODS = Object.freeze([
  ["TODAY", "Hoy"],
  ["WEEK_TO_DATE", "Semana actual"],
  ["MONTH_TO_DATE", "Mes actual"],
  ["ROLLING_30_DAYS", "Últimos 30 días"],
]);
const STATE = Symbol.for("forge.aura.activity-productivity-cockpit.001");
const CAPTURE_METRIC = Object.freeze({
  REFERRAL_RECEIVED: "referidos",
  CALL_COMPLETED: "llamadas",
  INITIAL_APPOINTMENT_SCHEDULED: "citas_agendadas",
  CLOSING_APPOINTMENT_SCHEDULED: "citas_agendadas",
  INITIAL_APPOINTMENT_HELD: "citas_iniciales",
  CLOSING_APPOINTMENT_HELD: "citas_cierre",
});
const CAPTURE_LABEL = Object.freeze({
  REFERRAL_RECEIVED: "referido",
  CALL_COMPLETED: "llamada",
  INITIAL_APPOINTMENT_SCHEDULED: "cita",
  CLOSING_APPOINTMENT_SCHEDULED: "cita",
  INITIAL_APPOINTMENT_HELD: "cita inicial",
  CLOSING_APPOINTMENT_HELD: "cita de cierre",
});
const FACT_METRIC = Object.freeze({
  REFERRAL_RECEIVED: "referidos",
  CALL_COMPLETED: "llamadas",
  ADVISOR_REFERRAL_RECEIVED: "referido_asesor",
});
const FACT_LABEL = Object.freeze({
  REFERRAL_RECEIVED: "Referido recibido",
  CALL_COMPLETED: "Llamada completada",
  ADVISOR_REFERRAL_RECEIVED: "Referido de asesor",
});
const SERIES_METRIC = Object.freeze({
  INITIAL_APPOINTMENT_SCHEDULED: "citas_agendadas",
  CLOSING_APPOINTMENT_SCHEDULED: "citas_agendadas",
  INITIAL_APPOINTMENT_COMPLETED: "citas_iniciales",
  CLOSING_APPOINTMENT_COMPLETED: "citas_cierre",
});
const SERIES_LABEL = Object.freeze({
  INITIAL_APPOINTMENT_SCHEDULED: "Cita inicial agendada",
  CLOSING_APPOINTMENT_SCHEDULED: "Cita de cierre agendada",
  INITIAL_APPOINTMENT_COMPLETED: "Cita inicial realizada",
  CLOSING_APPOINTMENT_COMPLETED: "Cita de cierre realizada",
});

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

const fmtTime = value => new Intl.DateTimeFormat("es-MX", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Mexico_City",
}).format(new Date(value));

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
      <header class="activity-topbar">
        <div>
          <p class="aura-eyebrow">ACTIVIDAD</p>
          <h1>Tu día comercial, en una sola vista</h1>
        </div>
        <button class="aura-primary activity-primary-cta" type="button" data-open-capture>+ Registrar actividad</button>
      </header>

      <div class="activity-tabs" role="tablist" aria-label="Actividad y reportes">
        <button role="tab" id="activity-tab" aria-controls="activity-panel" aria-selected="true" tabindex="0" data-tab="activity">Actividad</button>
        <button role="tab" id="reports-tab" aria-controls="reports-panel" aria-selected="false" tabindex="-1" data-tab="reports">Reportes</button>
      </div>

      <section role="tabpanel" id="activity-panel" aria-labelledby="activity-tab" data-panel="activity">
        <div class="activity-status" data-status role="status" aria-live="polite"></div>

        <section class="activity-cockpit" aria-labelledby="today-points-heading">
          <div class="activity-cockpit__progress">
            <div class="activity-cockpit__heading">
              <div><p class="aura-eyebrow">HOY</p><h2 id="today-points-heading">Puntos de actividad</h2></div>
              <span class="activity-cockpit__state" data-points-state-label></span>
            </div>
            <div class="activity-cockpit__metric" data-today-points>—</div>
            <p class="activity-cockpit__gap" data-today-gap>Calculando con actividad confirmada…</p>
            <div class="activity-progress" data-progress-track hidden>
              <span data-progress-bar></span>
            </div>
            <p class="activity-cockpit__context" data-points-context></p>
          </div>
          <aside class="activity-next" data-next-action aria-labelledby="next-action-heading">
            <p class="aura-eyebrow">SIGUIENTE PASO</p>
            <h2 id="next-action-heading">Opciones para avanzar</h2>
            <div data-next-content></div>
          </aside>
        </section>

        <section class="activity-today" aria-labelledby="activity-today-heading">
          <div class="activity-section-heading">
            <div><p class="aura-eyebrow">ACTIVIDAD DE HOY</p><h2 id="activity-today-heading">Lo que ya hiciste</h2></div>
            <span data-today-count></span>
          </div>
          <div class="activity-today__feed" data-today-feed></div>
        </section>

        <section data-daily-confirmation-host></section>
        <details class="activity-source-tools">
          <summary>Fuentes opcionales para revisión</summary>
          <section data-mail-connection-host></section>
        </details>
        <section class="activity-capture-host" data-capture-host></section>
      </section>

      <section role="tabpanel" id="reports-panel" aria-labelledby="reports-tab" data-panel="reports" hidden>
        <div class="reports-toolbar">
          <label>Periodo<select data-period>${PERIODS.map(([value, label]) => `<option value="${value}"${value === "WEEK_TO_DATE" ? " selected" : ""}>${label}</option>`).join("")}</select></label>
          <button type="button" class="aura-secondary" data-refresh>Actualizar</button>
        </div>
        <div class="activity-status" data-report-status role="status" aria-live="polite"></div>
        <div class="activity-report-summary" data-report-summary hidden></div>
        <section class="activity-chart-card" data-chart-card hidden>
          <div class="activity-card-heading">
            <div><p class="aura-eyebrow">DISTRIBUCIÓN</p><h2>Actividad confirmada</h2></div>
            <span data-period-label></span>
          </div>
          <div data-chart-text class="activity-chart-text"></div>
          <div data-chart aria-label="Distribución de actividad" role="img"></div>
          <details><summary>Ver tabla accesible</summary><div data-chart-table></div></details>
        </section>
        <details class="activity-rules">
          <summary>Ver baremo oficial</summary>
          <div class="activity-points-rules" data-points-rules></div>
        </details>
      </section>
    </section>`;
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

function renderRules(root, points) {
  const rows = pointRuleRows(points);
  root.querySelector('[data-points-rules]').innerHTML = rows.length
    ? rows.map(rule => `<div class="activity-points-rule"><span>${esc(rule.label)}</span><b>${esc(rule.points)} pts</b></div>`).join("")
    : `<p>El baremo no está disponible de forma verificable.</p>`;
}

function renderNextAction(root, points) {
  const target = root.querySelector('[data-next-content]');
  if (points?.state !== "READY") {
    const missing = Array.isArray(points?.missingOrIncompleteMetrics) ? points.missingOrIncompleteMetrics.length : null;
    target.innerHTML = `<p class="activity-next__empty">${missing
      ? `Hay ${missing} métrica${missing === 1 ? "" : "s"} sin confirmar. Revisa sólo esas pendientes para conocer el gap real.`
      : "Todavía no hay evidencia suficiente para calcular un siguiente paso sin inventar datos."}</p>`;
    return;
  }
  if (points.remaining <= 0) {
    target.innerHTML = `<div class="activity-next__complete"><strong>Objetivo diario completado</strong><span>Tu actividad confirmada ya alcanzó el objetivo. Elige el siguiente paso por contexto comercial, no por perseguir más puntos.</span></div>`;
    return;
  }

  const recommendation = recommendOfficialActivityActions(points);
  if (!recommendation) {
    target.innerHTML = `<p class="activity-next__empty">Te faltan ${esc(points.remaining)} puntos. No encontramos una combinación de acciones manuales segura dentro del límite actual; conserva tu criterio y revisa tu actividad pendiente.</p>`;
    return;
  }

  target.innerHTML = `
    <p class="activity-next__lead">Una forma de completar tu objetivo</p>
    <div class="activity-next__actions">
      ${recommendation.actions.map(action => `<div><span>${action.count > 1 ? `${action.count} × ` : ""}${esc(action.label)}</span><b>+${esc(action.points)} pts</b></div>`).join("")}
    </div>
    <p class="activity-next__reason"><strong>Por qué:</strong> ${esc(recommendation.reason)}</p>
    <p class="activity-next__boundary">${esc(recommendation.decisionBoundary)}</p>`;
}

function renderCockpit(root, result, points) {
  const value = root.querySelector('[data-today-points]');
  const gap = root.querySelector('[data-today-gap]');
  const state = root.querySelector('[data-points-state-label]');
  const context = root.querySelector('[data-points-context]');
  const track = root.querySelector('[data-progress-track]');
  const bar = root.querySelector('[data-progress-bar]');

  if (points?.state === "READY") {
    value.textContent = `${points.total} / ${points.objective}`;
    value.dataset.ready = "true";
    state.textContent = points.remaining <= 0 ? "Objetivo completado" : "En curso";
    gap.textContent = points.remaining <= 0
      ? "Objetivo diario completado"
      : `Te faltan ${points.remaining} puntos`;
    const percent = points.objective > 0 ? Math.min(100, (points.total / points.objective) * 100) : 0;
    track.hidden = false;
    bar.style.width = `${percent}%`;
    context.textContent = points.total > points.objective
      ? `Llevas ${points.total - points.objective} puntos por encima del objetivo; el total real se conserva sin truncarlo.`
      : "Calculado únicamente con métricas completas y evidencia válida.";
  } else {
    value.textContent = "Progreso pendiente";
    value.dataset.ready = "false";
    state.textContent = "Falta revisar";
    const missing = Array.isArray(points?.missingOrIncompleteMetrics) ? points.missingOrIncompleteMetrics.length : null;
    gap.textContent = missing
      ? `${missing} métrica${missing === 1 ? "" : "s"} todavía sin confirmar`
      : "Todavía no podemos calcular el total de hoy";
    track.hidden = true;
    bar.style.width = "0%";
    context.textContent = "Lo desconocido no se convierte en cero. Tu actividad registrada sigue visible mientras completas sólo lo necesario.";
  }

  renderNextAction(root, points);
  renderRules(root, points);
}

function todayFeedItems(result, points) {
  const period = result?.period?.current;
  const today = period?.to || null;
  const facts = result?.activity?.pointFacts?.state === "READY" ? result.activity.pointFacts.facts || [] : [];
  const items = facts.flatMap(fact => {
    const metricKey = FACT_METRIC[fact.eventType];
    const unitPoints = pointImpactForMetric(points, metricKey);
    if (!metricKey || !unitPoints) return [];
    return [{
      key: `fact:${fact.eventReference}`,
      label: FACT_LABEL[fact.eventType] || "Actividad",
      when: fact.occurredAt ? fmtTime(fact.occurredAt) : "Hoy",
      points: unitPoints,
      count: 1,
    }];
  });

  const chartRows = seriesRows(result?.activity?.current?.chartReady)
    .filter(row => (!today || row.date === today) && SERIES_METRIC[row.type] && row.value > 0);
  for (const row of chartRows) {
    const metricKey = SERIES_METRIC[row.type];
    const unitPoints = pointImpactForMetric(points, metricKey);
    if (!unitPoints) continue;
    items.push({
      key: `series:${row.date}:${row.type}`,
      label: row.value > 1 ? `${row.value} × ${SERIES_LABEL[row.type]}` : SERIES_LABEL[row.type],
      when: "Hoy",
      points: unitPoints * row.value,
      count: row.value,
    });
  }
  return items;
}

function renderTodayFeed(root, result, points) {
  const feed = root.querySelector('[data-today-feed]');
  const counter = root.querySelector('[data-today-count]');
  const items = todayFeedItems(result, points);
  const totalActivities = items.reduce((sum, item) => sum + item.count, 0);
  counter.textContent = totalActivities ? `${totalActivities} registrada${totalActivities === 1 ? "" : "s"}` : "";

  if (!items.length) {
    const report = result?.activity?.current?.report;
    feed.innerHTML = report?.state === "EMPTY"
      ? `<div class="activity-feed-empty"><strong>Aún no hay actividad confirmada hoy</strong><span>Registra lo que ocurra y aparecerá aquí sin volver a capturarlo.</span></div>`
      : `<div class="activity-feed-empty"><strong>Actividad pendiente de lectura</strong><span>No mostraremos ceros ni actividades inventadas mientras la fuente no pueda confirmar el estado.</span></div>`;
    return;
  }

  feed.innerHTML = items.map(item => `<article class="activity-feed-item">
    <div><strong>${esc(item.label)}</strong><span>${esc(item.when)}</span></div>
    <b>+${esc(item.points)} pts</b>
  </article>`).join("");
}

function renderReports(root, result) {
  const reportStatus = root.querySelector('[data-report-status]');
  const current = result?.activity?.current;
  const report = current?.report;
  const chartReady = current?.chartReady;
  if (!report) {
    root.querySelector('[data-report-summary]').hidden = true;
    root.querySelector('[data-chart-card]').hidden = true;
    renderState(reportStatus, "Reporte no disponible", "No mostraremos cifras mientras la lectura productiva no pueda verificarse.", "Reintentar");
    return;
  }

  if (result.state === "PARTIAL") {
    renderState(reportStatus, "Reporte parcial", "La actividad confirmada sigue disponible; una fuente secundaria tiene una limitación temporal.");
  } else {
    reportStatus.replaceChildren();
  }

  const total = report.totals?.activityCount;
  const comparison = result.activity?.comparison;
  const production = result.production;
  const summary = root.querySelector('[data-report-summary]');
  summary.hidden = false;
  summary.innerHTML = `
    <article><span>Actividad confirmada</span><strong>${Number.isFinite(total) ? esc(total) : "Sin dato"}</strong><small>${esc(periodText(report.period))}</small></article>
    <article><span>Vs. periodo anterior</span><strong>${Number.isFinite(comparison?.delta) ? `${comparison.delta > 0 ? "+" : ""}${esc(comparison.delta)}` : "Sin comparación"}</strong><small>${comparison?.zeroComparisonBlocked ? "El periodo anterior fue cero; no se fuerza un porcentaje" : Number.isFinite(comparison?.deltaPercent) ? `${comparison.deltaPercent > 0 ? "+" : ""}${esc(comparison.deltaPercent)}%` : "Comparación no disponible"}</small></article>
    <article><span>Pólizas confirmadas del mes</span><strong>${Number.isFinite(production?.sold) ? esc(production.sold) : "Sin dato"}</strong><small>Lectura de la autoridad de pólizas</small></article>
    <article><span>Meta mensual</span><strong>${Number.isFinite(production?.target) ? esc(production.target) : "No configurada"}</strong><small>${Number.isFinite(production?.target) && Number.isFinite(production?.sold) ? `${Math.max(production.target - production.sold, 0)} por completar` : "No se inventa una meta ausente"}</small></article>`;

  const rows = seriesRows(chartReady);
  const chartCard = root.querySelector('[data-chart-card]');
  if (report.state === "EMPTY" || chartReady?.missingDataState === "NO_MATCHING_FACTS") {
    chartCard.hidden = true;
    renderState(reportStatus, "No hay actividad confirmada en este periodo", `${periodText(report.period)} · ausencia confirmada de registros.`);
    return;
  }

  chartCard.hidden = false;
  root.querySelector('[data-period-label]').textContent = periodText(report.period);
  root.querySelector('[data-chart-text]').textContent = rows.length
    ? `${rows.reduce((sum, row) => sum + row.value, 0)} actividades distribuidas en ${new Set(rows.map(row => row.date)).size} días.`
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

export function createActivityModule({ root, globalState, reportingFactory = null } = {}) {
  if (!root) throw new Error("AURA_ACTIVITY_ROOT_REQUIRED");
  if (root[STATE]) return root[STATE];
  chrome(root);

  let reporting = null;
  let manual = null;
  let daily = null;
  let mail = null;
  let mounted = false;
  let revision = 0;
  let reportLoaded = false;
  let lastPoints = null;
  const events = new AbortController();

  async function runtime() {
    if (!reporting) {
      const factory = reportingFactory || productiveReportingFactory;
      reporting = await factory({ timeZone: "America/Mexico_City" });
    }
    return reporting;
  }

  function refreshCapturePresentation() {
    const form = root.querySelector('[data-manual-activity-form]');
    if (!form) return;
    const type = form.elements?.captureType?.value;
    const explanation = form.querySelector('[data-capture-explanation]');
    const button = form.querySelector('[data-save-manual-activity]');
    if (!explanation || !button) return;
    const metricKey = CAPTURE_METRIC[type];
    if (!metricKey) {
      explanation.textContent = "Esta nota queda como contexto de seguimiento y no suma puntos por sí sola.";
      button.textContent = "Guardar nota";
      return;
    }
    const impact = pointImpactForMetric(lastPoints, metricKey);
    if (!impact) {
      explanation.textContent = "El impacto en puntos se mostrará cuando el baremo oficial esté disponible.";
      button.textContent = "Registrar actividad";
      return;
    }
    if (lastPoints?.state === "READY") {
      const after = lastPoints.total + impact;
      const remaining = Math.max(lastPoints.objective - after, 0);
      explanation.textContent = `+${impact} pts · ahora ${lastPoints.total}/${lastPoints.objective} · después ${after}/${lastPoints.objective} · quedarían ${remaining} pts.`;
    } else {
      explanation.textContent = `Esta actividad aporta +${impact} pts. El total del día seguirá pendiente hasta revisar las métricas que faltan.`;
    }
    button.textContent = `Registrar ${CAPTURE_LABEL[type] || "actividad"} · +${impact} pts`;
  }

  async function loadToday() {
    const selected = ++revision;
    renderState(root.querySelector('[data-status]'), "Actualizando tu día", "Reuniendo actividad confirmada y revisiones pendientes.");
    try {
      const result = await (await runtime()).load({ periodKind: "TODAY" });
      if (!mounted || selected !== revision) return;
      if (result.state === "SESSION_REQUIRED") {
        renderState(root.querySelector('[data-status]'), "Sesión requerida", "Vuelve a iniciar sesión para consultar y registrar tu actividad.");
        return;
      }
      if (result.state === "SOURCE_UNAVAILABLE") {
        renderState(root.querySelector('[data-status]'), "Actividad temporalmente no disponible", "La captura sigue disponible, pero no presentaremos datos incompletos como confirmados.", "Reintentar");
        return;
      }

      let effective = result;
      try {
        const pointInput = await daily?.load({ result });
        if (!result.activityPointsInput && pointInput) effective = Object.freeze({ ...result, activityPointsInput: pointInput });
      } catch (error) {
        console.warn?.("Activity review unavailable", error);
      }
      if (!mounted || selected !== revision) return;
      lastPoints = projectOfficialActivityPoints(effective);
      root.querySelector('[data-status]').replaceChildren();
      renderCockpit(root, effective, lastPoints);
      renderTodayFeed(root, effective, lastPoints);
      refreshCapturePresentation();
    } catch (error) {
      if (!mounted || selected !== revision) return;
      renderState(root.querySelector('[data-status]'), "No pudimos actualizar tu día", "La captura permanece disponible; no mostraremos un total hasta poder validarlo.", "Reintentar");
    }
  }

  async function loadReports() {
    const periodKind = root.querySelector('[data-period]')?.value || "WEEK_TO_DATE";
    renderState(root.querySelector('[data-report-status]'), "Preparando reporte", "Consultando el periodo seleccionado.");
    try {
      const result = await (await runtime()).load({ periodKind });
      if (!mounted) return;
      if (result.state === "SESSION_REQUIRED") {
        renderState(root.querySelector('[data-report-status]'), "Sesión requerida", "Vuelve a iniciar sesión para consultar reportes.");
        return;
      }
      renderReports(root, result);
      reportLoaded = true;
    } catch (error) {
      if (!mounted) return;
      renderState(root.querySelector('[data-report-status]'), "Reporte no disponible", "No mostraremos cifras mientras la fuente no pueda responder de forma verificable.", "Reintentar");
    }
  }

  function bind() {
    root.addEventListener("click", event => {
      const tab = event.target.closest('[role="tab"]');
      if (tab) {
        setTabs(root, tab.dataset.tab);
        if (tab.dataset.tab === "reports" && !reportLoaded) void loadReports();
      }
      if (event.target.closest('[data-refresh]')) void loadReports();
      if (event.target.closest('[data-state-action]')) {
        if (root.querySelector('[data-panel="reports"]:not([hidden])')) void loadReports();
        else void loadToday();
      }
      if (event.target.closest('[data-open-capture]')) {
        root.querySelector('[data-capture-host] [data-open-manual-activity]')?.click();
        queueMicrotask(refreshCapturePresentation);
      }
    }, { signal: events.signal });

    root.querySelector('[data-period]').addEventListener("change", () => void loadReports(), { signal: events.signal });
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
    }, { signal: events.signal });

    root.querySelector('[data-capture-host]').addEventListener("change", event => {
      if (event.target.matches('[data-capture-type]')) queueMicrotask(refreshCapturePresentation);
    }, { signal: events.signal });

    globalThis.addEventListener("forge:manual-activity-created", () => {
      if (mounted) void loadToday();
    }, { signal: events.signal });
  }

  const api = Object.freeze({
    async mount() {
      mounted = true;
      root.hidden = false;
      bind();
      manual = createManualActivityEntry({ root: root.querySelector('[data-capture-host]') });
      manual.mount();
      daily = createActivityDailyConfirmation({
        root: root.querySelector('[data-daily-confirmation-host]'),
        onConfirmed: async () => { if (mounted) await loadToday(); },
      });
      await daily.mount();
      mail = createActivityMailConnection({
        root: root.querySelector('[data-mail-connection-host]'),
        onSuggestionsChanged: async () => { if (mounted) await loadToday(); },
      });
      await mail.mount();
      globalState?.("Actividad lista");
      await loadToday();
    },
    async unmount() {
      mounted = false;
      revision += 1;
      await manual?.unmount?.();
      root.hidden = true;
    },
    async scrub() {
      revision += 1;
      reportLoaded = false;
      lastPoints = null;
      await manual?.scrub?.();
      await daily?.scrub?.();
      await mail?.scrub?.();
      await reporting?.scrub?.("aura-activity-scrub");
      reporting = null;
    },
    async destroy() {
      await api.scrub();
      await manual?.destroy?.();
      await daily?.destroy?.();
      await mail?.destroy?.();
      events.abort();
      root.replaceChildren();
      delete root[STATE];
    },
  });
  root[STATE] = api;
  return api;
}
