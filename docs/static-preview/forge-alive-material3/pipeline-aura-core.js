export const DESIGN_AUTHORITY = "FORGE_AURA_LIGHT_2026_V1";
export const VIEW_STORAGE_KEY = "forge.pipeline.view";

export const SOURCES = Object.freeze([
  "Referido",
  "Mercado cálido",
  "Mercado frío",
  "Redes sociales",
  "Centro de influencia",
]);

export const STAGES = Object.freeze([
  Object.freeze({ value: "referred_new", label: "Nuevo" }),
  Object.freeze({ value: "contacted", label: "Contactado" }),
  Object.freeze({ value: "appointment_scheduled", label: "Cita agendada" }),
  Object.freeze({ value: "proposal", label: "Propuesta" }),
  Object.freeze({ value: "decision", label: "En decisión" }),
  Object.freeze({ value: "client", label: "Cliente" }),
]);

const PATHS = Object.freeze({
  cards: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  list: "M4 5h3v3H4V5Zm5 0h11v2H9V5ZM4 11h3v3H4v-3Zm5 0h11v2H9v-2ZM4 17h3v3H4v-3Zm5 0h11v2H9v-2Z",
  search: "m20.7 19.3-4.1-4.1a7.5 7.5 0 1 0-1.4 1.4l4.1 4.1 1.4-1.4ZM5 10.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z",
  whatsapp: "M12 2a9.75 9.75 0 0 0-8.44 14.64L2.25 21.5l4.97-1.3A9.75 9.75 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.93-1.07l-.38-.22-2.95.77.79-2.87-.25-.4A7.75 7.75 0 1 1 12 19.5Zm4.25-5.8c-.23-.12-1.37-.68-1.58-.75-.21-.08-.37-.12-.52.12-.16.23-.6.75-.74.9-.14.16-.27.18-.5.06-.24-.12-1-.36-1.9-1.15a7.1 7.1 0 0 1-1.32-1.64c-.14-.23-.02-.36.1-.48.1-.1.23-.27.35-.4.12-.14.15-.24.23-.4.08-.15.04-.29-.02-.4-.06-.12-.52-1.26-.72-1.73-.19-.45-.38-.39-.52-.4h-.44c-.16 0-.41.06-.62.3-.21.23-.81.79-.81 1.93s.83 2.24.95 2.4c.12.15 1.63 2.48 3.94 3.48.55.24.98.38 1.32.49.55.17 1.05.15 1.45.09.44-.07 1.37-.56 1.56-1.1.2-.54.2-1 .14-1.1-.06-.1-.21-.16-.45-.28Z",
  phone: "M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z",
  timeline: "M12 2a10 10 0 1 1-8.66 5H1l3.2-3.2L7.4 7H5.45A8 8 0 1 0 12 4v3l4-4-4-4v3Zm-1 5h2v5.17l3.24 1.87-1 1.73L11 13.31V7Z",
  more: "M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  calendar: "M7 2h2v2h6V2h2v2h2a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h2V2Zm13 9H4v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8ZM5 6a1 1 0 0 0-1 1v2h16V7a1 1 0 0 0-1-1H5Z",
  edit: "M4 16.5V20h3.5L18.35 9.15l-3.5-3.5L4 16.5Zm16.7-9.7a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0l-1.65 1.65 3.5 3.5L20.7 6.8Z",
  archive: "M3 4h18v4H3V4Zm2 6h14v11H5V10Zm4 3v2h6v-2H9Z",
  spark: "M12 2 9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2Z",
  add: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
});

export function icon(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${PATHS[name] || PATHS.spark}"/></svg>`;
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

export function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-MX")
    .trim();
}

export function formatDate(value, emptyLabel = "Sin fecha") {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) return emptyLabel;
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(time));
}

export function stageOptions(selected) {
  return STAGES.map(stage => (
    `<option value="${stage.value}" ${stage.value === selected ? "selected" : ""}>${stage.label}</option>`
  )).join("");
}

export function sourceOptions(selected = "") {
  return [...new Set([...SOURCES, selected].filter(Boolean))]
    .map(source => (
      `<option value="${escapeHtml(source)}" ${source === selected ? "selected" : ""}>${escapeHtml(source)}</option>`
    )).join("");
}

export function phoneOf(card) {
  return String(card?.phone || card?.prospect?.phone || card?.prospect?.whatsapp || "")
    .replace(/[^+\d]/g, "");
}

function actionButton(action, card, iconName, label, disabled = false) {
  return `<button class="aura-pipeline__quick aura-pipeline__quick--${action}" type="button"
    data-aura-action="${action}" data-id="${escapeHtml(card.id)}"
    aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}" ${disabled ? "disabled" : ""}>${icon(iconName)}</button>`;
}

export function actionsMarkup(card) {
  const phone = phoneOf(card);
  return `<div class="aura-pipeline__actions" data-aura-actions>
    ${actionButton("whatsapp", card, "whatsapp", `Preparar WhatsApp para ${card.fullName}`, !phone)}
    ${phone
      ? `<a class="aura-pipeline__quick aura-pipeline__quick--call" href="tel:${phone}"
          aria-label="Llamar a ${escapeHtml(card.fullName)}" title="Llamar">${icon("phone")}</a>`
      : actionButton("call", card, "phone", "Teléfono no disponible", true)}
    ${actionButton("timeline", card, "timeline", `Abrir Timeline de ${card.fullName}`)}
    <button class="aura-pipeline__quick aura-pipeline__quick--more" type="button"
      data-aura-action="more" data-id="${escapeHtml(card.id)}" aria-haspopup="menu"
      aria-expanded="false" aria-label="Más acciones para ${escapeHtml(card.fullName)}"
      title="Más acciones">${icon("more")}</button>
    <div class="aura-pipeline__menu" data-aura-menu="${escapeHtml(card.id)}" role="menu" hidden>
      <button type="button" role="menuitem" data-aura-action="calendar" data-id="${escapeHtml(card.id)}">${icon("calendar")}<span>Agendar cita</span></button>
      <button type="button" role="menuitem" data-aura-action="edit" data-id="${escapeHtml(card.id)}">${icon("edit")}<span>Editar prospecto</span></button>
      <button type="button" role="menuitem" data-aura-action="combat" data-id="${escapeHtml(card.id)}">${icon("spark")}<span>NASH Combat</span></button>
      <button type="button" role="menuitem" data-aura-action="nba" data-id="${escapeHtml(card.id)}">${icon("spark")}<span>Siguiente mejor acción</span></button>
      <div role="separator"></div>
      <button class="aura-pipeline__menu-danger" type="button" role="menuitem"
        data-aura-action="archive" data-id="${escapeHtml(card.id)}">${icon("archive")}<span>Retirar del Pipeline</span></button>
    </div>
  </div>`;
}

export function searchableText(card) {
  return normalize([
    card.fullName,
    card.sourceSummary,
    card.stageLabel,
    card.latestActivity?.label,
    card.nextCommitment?.type,
  ].filter(Boolean).join(" "));
}

export function matchesFilters(card, filters = {}) {
  const query = normalize(filters.query);
  return (!filters.source || card.sourceValue === filters.source)
    && (!filters.status || card.status === filters.status)
    && (!query || searchableText(card).includes(query));
}

export function cardMarkup(card) {
  return `<article class="aura-pipeline__card" data-aura-record="${escapeHtml(card.id)}"
    data-aura-stage="${escapeHtml(card.status)}" data-aura-source="${escapeHtml(card.sourceValue)}">
    <header class="aura-pipeline__identity">
      <span class="aura-pipeline__avatar" aria-hidden="true">${escapeHtml(card.fullName.slice(0, 1).toUpperCase())}</span>
      <div><strong>${escapeHtml(card.fullName)}</strong><span>${escapeHtml(card.sourceSummary)}</span></div>
      <span class="aura-pipeline__badge" data-aura-stage-label>${escapeHtml(card.stageLabel)}</span>
    </header>
    <label class="aura-pipeline__stage"><span>Etapa</span>
      <select data-aura-stage-select="${escapeHtml(card.id)}" data-confirmed-stage="${escapeHtml(card.status)}"
        aria-label="Cambiar etapa de ${escapeHtml(card.fullName)}">${stageOptions(card.status)}</select>
    </label>
    <div class="aura-pipeline__signals">
      <div><span>Última actividad</span><strong>${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</strong><small>${formatDate(card.latestActivity?.occurredAt, "Sin registro")}</small></div>
      <div><span>Próximo compromiso</span><strong>${escapeHtml(card.nextCommitment?.type || "Sin compromiso")}</strong><small>${formatDate(card.nextCommitment?.dueAt, "Sin fecha")}</small></div>
    </div>
    ${actionsMarkup(card)}
  </article>`;
}

export function rowMarkup(card) {
  return `<article class="aura-pipeline__row" role="row" data-aura-record="${escapeHtml(card.id)}"
    data-aura-stage="${escapeHtml(card.status)}" data-aura-source="${escapeHtml(card.sourceValue)}">
    <div class="aura-pipeline__person" role="cell"><span class="aura-pipeline__avatar" aria-hidden="true">${escapeHtml(card.fullName.slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(card.fullName)}</strong><span>${escapeHtml(card.sourceSummary)}</span></div></div>
    <div role="cell"><select data-aura-stage-select="${escapeHtml(card.id)}" data-confirmed-stage="${escapeHtml(card.status)}"
      aria-label="Cambiar etapa de ${escapeHtml(card.fullName)}">${stageOptions(card.status)}</select><span class="aura-pipeline__badge" data-aura-stage-label>${escapeHtml(card.stageLabel)}</span></div>
    <div role="cell"><strong>${escapeHtml(card.latestActivity?.label || "Sin actividad verificada")}</strong><span>${formatDate(card.latestActivity?.occurredAt, "Sin registro")}</span></div>
    <div role="cell"><strong>${escapeHtml(card.nextCommitment?.type || "Sin compromiso")}</strong><span>${formatDate(card.nextCommitment?.dueAt, "Sin fecha")}</span></div>
    <div role="cell">${actionsMarkup(card)}</div>
  </article>`;
}

export function humanError(error, fallback) {
  const code = String(error?.code || error?.message || "");
  if (/AUTH|JWT|SESSION/i.test(code)) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (/NETWORK|FETCH|LOAD/i.test(code)) return "No pudimos conectar con Forge. Revisa tu conexión.";
  if (/DUPLICATE/i.test(code)) return "Este prospecto ya existe en tu Pipeline.";
  if (/NOT_FOUND|PGRST116/i.test(code)) return "No encontramos este prospecto.";
  if (/NOT_DEPLOYED/i.test(code)) return "Esta función todavía no está desplegada en este entorno.";
  if (/VALIDATION/i.test(code) && error?.message) return error.message;
  return fallback;
}
