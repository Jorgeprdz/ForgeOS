const ESCAPE = Object.freeze({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });

export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPE[char]);
export const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

export function datetimeLocal(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export const reportRows = (reporting) => Array.isArray(reporting?.report?.rows) ? reporting.report.rows : [];
export const reportTotal = (reporting) => Number.isSafeInteger(reporting?.report?.totals?.activityCount) ? reporting.report.totals.activityCount : null;

export function typeTotals(reporting) {
  const totals = new Map();
  for (const row of reportRows(reporting)) {
    const type = row?.dimensions?.activityType;
    const count = row?.measures?.activityCount;
    if (typeof type === "string" && Number.isSafeInteger(count)) totals.set(type, (totals.get(type) || 0) + count);
  }
  return totals;
}

export function reportState(calendar, reporting) {
  if (!calendar) return "ACTIVITY_LOADING";
  if (calendar.state === "SESSION_REQUIRED") return "ACTIVITY_SESSION_REQUIRED";
  if (["CONFIGURATION_REQUIRED", "UNKNOWN_TIMEZONE", "UNKNOWN_SCHEDULE"].includes(calendar.state)) return "ACTIVITY_CONFIGURATION_REQUIRED";
  if (calendar.state === "CONFLICTING") return "ACTIVITY_PARTIAL";
  if (calendar.state === "ERROR") return "ACTIVITY_ERROR";
  if (!reporting || reporting.state === "UNAVAILABLE") return "ACTIVITY_CONFIGURATION_REQUIRED";
  if (reporting.state === "DISCONNECTED") return "ACTIVITY_SOURCE_UNAVAILABLE";
  if (reporting.report?.state === "EMPTY") return "ACTIVITY_EMPTY";
  if (reporting.chartReady?.partialPeriodState === "PARTIAL_CURRENT_PERIOD" || calendar.state === "STALE") return "ACTIVITY_PARTIAL";
  return "ACTIVITY_READY";
}

const TYPE_LABELS = Object.freeze({
  REFERRAL_RECEIVED: "Referidos recibidos",
  CALL_COMPLETED: "Llamadas y seguimientos",
  APPOINTMENT_SCHEDULED: "Citas agendadas",
  APPOINTMENT_HELD: "Citas realizadas",
  ADVISOR_REFERRAL_RECEIVED: "Referidos de asesor",
  DUE_ACTION_COMPLETED: "Seguimientos completados",
});

function humanState(state, period) {
  const copy = {
    ACTIVITY_LOADING: ["Preparando tu actividad", "Estamos consultando las autoridades productivas del periodo."],
    ACTIVITY_READY: ["Datos confirmados", `Actividad respaldada por evidencia para ${period.exactLabel}.`],
    ACTIVITY_EMPTY: ["Cero confirmado en el periodo", `La fuente productiva no encontró actividad entre ${period.exactLabel}.`],
    ACTIVITY_PARTIAL: ["Periodo parcial", "Conservamos la información válida, pero algunas comparaciones están bloqueadas."],
    ACTIVITY_CONFIGURATION_REQUIRED: ["Configuración requerida", "Falta habilitar el calendario operativo; no inventaremos días, metas ni conversiones."],
    ACTIVITY_SOURCE_UNAVAILABLE: ["Fuente temporalmente desconectada", "No presentamos datos locales como si fueran el reporte completo."],
    ACTIVITY_SESSION_REQUIRED: ["Sesión requerida", "Vuelve a iniciar sesión para consultar actividad protegida."],
    ACTIVITY_ERROR: ["No pudimos completar la consulta", "Tus datos no se reemplazaron por ceros. Intenta actualizar."],
  };
  return copy[state] || copy.ACTIVITY_ERROR;
}

function metricCard(label, value, context, state = "CONFIRMED") {
  const display = value === null || value === undefined ? "—" : value;
  return `<article class="activity-kpi" data-evidence-state="${escapeHtml(state)}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(display)}</strong><p>${escapeHtml(context)}</p></article>`;
}

function chartMarkup(reporting) {
  const series = reporting?.chartReady?.series || [];
  const points = series.flatMap((entry) => entry.points.map((point) => ({ type: entry.seriesId.replace("activity-series:", ""), ...point })));
  if (!points.length) return `<div class="activity-empty-chart" role="img" aria-label="No hay segmentos confirmados para graficar">Sin actividad confirmada para graficar.</div>`;
  const max = Math.max(1, ...points.map((point) => point.value));
  const bars = points.map((point) => `<li><span>${escapeHtml(point.x)}</span><div><i style="--activity-bar:${Math.max(4, Math.round((point.value / max) * 100))}%"></i></div><strong>${point.value}</strong><small>${escapeHtml(TYPE_LABELS[point.type] || point.type)}</small></li>`).join("");
  const rows = reportRows(reporting).map((row) => `<tr><td>${escapeHtml(row.dimensions.evaluationDate)}</td><td>${escapeHtml(TYPE_LABELS[row.dimensions.activityType] || row.dimensions.activityType)}</td><td>${escapeHtml(row.measures.activityCount)}</td><td><code>${escapeHtml(row.rowKey)}</code></td></tr>`).join("");
  return `<div class="activity-chart" role="img" aria-label="Distribución diaria de actividad confirmada"><ol>${bars}</ol></div><details class="activity-data-table"><summary>Ver tabla accesible y evidencia</summary><div class="activity-table-scroll"><table><caption>Actividad confirmada por fecha y tipo</caption><thead><tr><th>Fecha</th><th>Tipo</th><th>Total</th><th>Evidencia</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
}

function conversionMarkup(model) {
  const conversions = model?.conversions || [];
  if (!conversions.length) return `<p class="activity-muted">Las conversiones se habilitan cuando calendario y fuentes tienen evidencia suficiente.</p>`;
  return `<div class="activity-conversions">${conversions.map((entry) => {
    const title = entry.conversionId.replaceAll("_", " ").toLowerCase();
    const ready = entry.metricState === "CONFIRMED";
    const result = ready ? `${entry.numerator} de ${entry.denominator} · ${entry.percentage.toFixed(entry.displayPrecision)}%` : entry.metricState === "NO_BASE" ? "Sin base confirmada" : "Evidencia insuficiente";
    return `<article data-evidence-state="${escapeHtml(entry.metricState)}"><h3>${escapeHtml(title)}</h3><strong>${escapeHtml(result)}</strong><p>${escapeHtml((entry.warnings || []).join(" · ") || "Periodo y fuentes compatibles")}</p></article>`;
  }).join("")}</div>`;
}

function coachingMarkup(tips) {
  if (!tips.length) return `<p class="activity-muted">No hay observaciones elegibles con la evidencia disponible.</p>`;
  return `<div class="activity-coaching">${tips.map((tip) => `<article><h3>${escapeHtml(tip.title)}</h3><p>${escapeHtml(tip.body)}</p>${tip.combination ? `<p>${escapeHtml(tip.combination)}</p>` : ""}<details><summary>Por qué se muestra</summary><p>${escapeHtml((tip.uncertainty?.limitations || []).join(" · ") || "La observación cumple la política vigente.")}</p><code>${escapeHtml((tip.evidenceRefs || []).join(", ") || "Sin referencias adicionales")}</code></details></article>`).join("")}</div>`;
}

function headerMarkup(state, period, periods) {
  const [title, description] = humanState(state.phase, period);
  return `<header class="activity-header"><div><p class="aura-eyebrow">OPERACIÓN COMERCIAL</p><h1 id="activity-title">Actividad</h1><p>Registra, entiende y continúa con evidencia comercial real.</p></div><div class="activity-header__actions"><button type="button" class="aura-primary" data-add-activity>Registrar actividad</button><button type="button" data-refresh>Actualizar</button></div></header><section class="activity-status" data-state="${escapeHtml(state.phase)}"><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(description)}</p></div><label>Periodo oficial<select data-period>${periods.map((item) => `<option value="${item.id}" ${item.id === state.periodId ? "selected" : ""}>${escapeHtml(item.label)} · ${escapeHtml(item.exactLabel)}</option>`).join("")}</select></label></section>`;
}

function activityPanel(state, period) {
  const totals = typeTotals(state.reporting);
  const total = reportTotal(state.reporting);
  const eligible = Number.isSafeInteger(state.calendar?.eligibleDayCount) ? state.calendar.eligibleDayCount : null;
  const activeDays = new Set(reportRows(state.reporting).map((row) => row.dimensions.evaluationDate)).size || (state.phase === "ACTIVITY_EMPTY" ? 0 : null);
  const points = state.points?.state === "READY" ? state.points.total : null;
  return `<section id="activity-panel" role="tabpanel" aria-labelledby="activity-tab" tabindex="0"><div class="activity-summary" aria-label="Resumen del periodo">${metricCard("Actividad confirmada", total, total === null ? "Sin evidencia suficiente" : period.exactLabel, total === null ? "UNKNOWN" : "CONFIRMED")}${metricCard("Puntos", points, points === null ? "La autoridad de puntos aún no tiene todas las métricas" : "Calculados por el adapter autorizado", points === null ? "PARTIAL" : "CONFIRMED")}${metricCard("Días con actividad", activeDays, eligible === null ? "Calendario no disponible" : `${eligible} días elegibles`, activeDays === null ? "UNKNOWN" : "CONFIRMED")}${metricCard("Citas", totals.get("APPOINTMENT_HELD") ?? (state.phase === "ACTIVITY_EMPTY" ? 0 : null), "Citas realizadas confirmadas", totals.has("APPOINTMENT_HELD") || state.phase === "ACTIVITY_EMPTY" ? "CONFIRMED" : "UNKNOWN")}</div>${state.lastCapture ? `<article class="activity-confirmation" role="status"><strong>${escapeHtml(state.lastCapture.activityLabel)} registrada para ${escapeHtml(state.lastCapture.personName)}.</strong><p>Sincronización pendiente de confirmación. Siguiente paso recomendado: ${escapeHtml(state.lastCapture.nextAction)}.</p></article>` : ""}<div class="activity-layout"><article class="activity-card activity-card--wide"><header><div><p class="aura-eyebrow">DISTRIBUCIÓN</p><h2>Actividad por día y tipo</h2></div><span>${escapeHtml(period.exactLabel)}</span></header>${chartMarkup(state.reporting)}</article><article class="activity-card"><header><div><p class="aura-eyebrow">SIGUIENTE PASO</p><h2>Qué conviene revisar</h2></div></header>${state.phase === "ACTIVITY_CONFIGURATION_REQUIRED" ? `<p>Configura el calendario operativo para habilitar metas, puntos y comparaciones honestas.</p>` : state.phase === "ACTIVITY_EMPTY" ? `<p>Registra la primera actividad confirmada del periodo o cambia de periodo.</p>` : `<p>Revisa los prospectos con seguimiento pendiente y registra únicamente hechos confirmados.</p>`}<button type="button" data-add-activity class="activity-secondary">Registrar actividad</button></article></div><article class="activity-card"><header><div><p class="aura-eyebrow">CONVERSIONES</p><h2>Conversiones con base visible</h2></div></header>${conversionMarkup(state.conversions)}</article><article class="activity-card activity-card--wide"><header><div><p class="aura-eyebrow">OBSERVACIONES EXPLICABLES</p><h2>Lo que conviene revisar</h2></div></header>${coachingMarkup(state.tips)}</article></section>`;
}

function reportsPanel(state, period) {
  const total = reportTotal(state.reporting);
  const totals = typeTotals(state.reporting);
  const partial = state.reporting?.chartReady?.partialPeriodState === "PARTIAL_CURRENT_PERIOD";
  return `<section id="reports-panel" role="tabpanel" aria-labelledby="reports-tab" tabindex="0"><div class="reports-executive"><div><p class="aura-eyebrow">RESUMEN EJECUTIVO</p><h2>${escapeHtml(period.label)}</h2><p>${escapeHtml(period.exactLabel)}${partial ? " · periodo todavía en curso" : ""}</p></div><div class="reports-kpis">${metricCard("Total confirmado", total, total === null ? "Ausencia de evidencia; no es cero" : "Eventos canónicos", total === null ? "UNKNOWN" : "CONFIRMED")}${metricCard("Llamadas", totals.get("CALL_COMPLETED") ?? (state.phase === "ACTIVITY_EMPTY" ? 0 : null), "Fuente FES", totals.has("CALL_COMPLETED") || state.phase === "ACTIVITY_EMPTY" ? "CONFIRMED" : "UNKNOWN")}${metricCard("Citas agendadas", totals.get("APPOINTMENT_SCHEDULED") ?? (state.phase === "ACTIVITY_EMPTY" ? 0 : null), "Fuente FES", totals.has("APPOINTMENT_SCHEDULED") || state.phase === "ACTIVITY_EMPTY" ? "CONFIRMED" : "UNKNOWN")}</div></div>${partial ? `<div class="activity-warning" role="note">La comparación con periodos completos está bloqueada porque el periodo actual es parcial.</div>` : ""}<article class="activity-card activity-card--wide"><header><div><p class="aura-eyebrow">DISTRIBUCIÓN PRODUCTIVA</p><h2>Actividad confirmada</h2></div><button type="button" data-refresh>Reintentar</button></header>${chartMarkup(state.reporting)}</article><article class="activity-card"><header><div><p class="aura-eyebrow">LIMITACIONES</p><h2>Qué sabemos y qué falta</h2></div></header><ul class="activity-limitations"><li>Las solicitudes y pólizas pagadas permanecen en sus autoridades de solo lectura.</li><li>Una fuente desconocida nunca se presenta como 0%.</li><li>Las comparaciones solo se muestran cuando periodos y evidencia son compatibles.</li><li>Última consulta: ${escapeHtml(new Date().toLocaleString("es-MX"))}.</li></ul></article></section>`;
}

export function surfaceMarkup(state, period, periods) {
  return `<section class="aura-activity" aria-labelledby="activity-title">${headerMarkup(state, period, periods)}<div class="activity-tabs" role="tablist" aria-label="Actividad y reportes"><button id="activity-tab" role="tab" aria-selected="${state.view === "activity"}" aria-controls="activity-panel" tabindex="${state.view === "activity" ? 0 : -1}" data-view="activity">Actividad</button><button id="reports-tab" role="tab" aria-selected="${state.view === "reports"}" aria-controls="reports-panel" tabindex="${state.view === "reports" ? 0 : -1}" data-view="reports">Reportes</button></div>${state.view === "activity" ? activityPanel(state, period) : reportsPanel(state, period)}<div data-activity-live class="aura-live" aria-live="polite" aria-atomic="true"></div></section>`;
}

export function captureDialogMarkup(state, definitions, requestedPersonId) {
  const people = state.people.map((person) => `<option value="${escapeHtml(person.id)}" ${person.id === requestedPersonId ? "selected" : ""}>${escapeHtml(person.name)} · ${escapeHtml(person.stage)}</option>`).join("");
  const types = definitions.map((entry) => `<option value="${escapeHtml(entry.id)}">${escapeHtml(entry.label)}</option>`).join("");
  return `<button type="button" class="activity-scrim" data-close aria-label="Cerrar captura"></button><section class="activity-dialog" role="dialog" aria-modal="true" aria-labelledby="activity-dialog-title"><header><div><p class="aura-eyebrow">CAPTURA RÁPIDA</p><h2 id="activity-dialog-title">Registrar actividad</h2><p>Forge resolverá referencias, asesor e idempotencia internamente.</p></div><button type="button" data-close aria-label="Cerrar">×</button></header><form data-capture-form><div class="activity-form-grid"><label>Prospecto o cliente<select name="personId" required><option value="">Selecciona una persona</option>${people}</select></label><label>Tipo de actividad<select name="activityType" required>${types}</select></label><label>Resultado<select name="result" required><option>Confirmado</option><option>Realizado; requiere seguimiento</option></select></label><label>Próxima acción<select name="nextAction" required><option>Programar seguimiento</option><option>Confirmar cita</option><option>Preparar propuesta</option><option>Actualizar etapa</option><option>Sin acción inmediata</option></select></label></div>${state.people.length ? "" : `<p class="activity-warning" role="note">No hay prospectos o clientes disponibles. Crea o recupera una persona en Pipeline antes de registrar actividad.</p>`}<details><summary>Información adicional</summary><div class="activity-form-grid"><label>Fecha y hora de la actividad o cita<input type="datetime-local" name="occurredAt" value="${datetimeLocal()}" required></label><label>Canal<select name="channel"><option>Llamada</option><option>WhatsApp</option><option>Videollamada</option><option>Presencial</option><option>Correo</option><option>Otro</option></select></label><label>Propósito<select name="purpose"><option>Seguimiento</option><option>Primera cita</option><option>Cierre</option><option>Servicio</option><option>Referido</option></select></label><label>Fecha probable del siguiente contacto<input type="datetime-local" name="followUpAt"></label><label class="activity-form-wide">Nota breve<textarea name="note" maxlength="500" rows="3" placeholder="Contexto útil, sin datos sensibles"></textarea></label></div><p class="activity-boundary">La evidencia canónica se escribe una sola vez. Nota, canal y siguiente acción se muestran en la confirmación; no disparan tareas, mensajes ni cambios automáticos.</p></details><p data-capture-error role="alert" hidden></p><footer><button type="button" data-close>Cancelar</button><button type="submit" class="aura-primary" ${state.people.length ? "" : "disabled"}>Registrar actividad</button></footer></form></section>`;
}
