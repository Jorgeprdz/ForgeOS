import {
  STAGES,
  PIPELINE_STATES,
  escapeHtml as e,
  formatDate,
  matches,
  phoneOf,
  viewPreference,
  saveViewPreference,
} from "./pipeline-core.js";
import { createPipelineAdapter } from "./pipeline-adapter.js";
import { buildCalendarDraftUrl } from "./pipeline-calendar.js";
import {
  attentionForRecord,
  deriveAttentionItems,
  followupDefaults,
  matchesQuickFilter,
  nextBestAction,
  sortRecords,
  validateContactPhone,
} from "./pipeline-priority.js";

const paths = Object.freeze({
  plus: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z",
  cards: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  list: "M4 5h3v3H4V5Zm5 0h11v2H9V5ZM4 11h3v3H4v-3Zm5 0h11v2H9v-2ZM4 17h3v3H4v-3Zm5 0h11v2H9v-2Z",
  search: "m20.7 19.3-4.1-4.1a7.5 7.5 0 1 0-1.4 1.4l4.1 4.1 1.4-1.4ZM5 10.5a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z",
  whatsapp: "M12 2a9.75 9.75 0 0 0-8.44 14.64L2.25 21.5l4.97-1.3A9.75 9.75 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.93-1.07l-.38-.22-2.95.77.79-2.87-.25-.4A7.75 7.75 0 1 1 12 19.5Z",
  phone: "M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1l-2.2 2.2Z",
  timeline: "M12 2a10 10 0 1 1-8.7 5H1l3.2-3.2L7.4 7H5.5A8 8 0 1 0 12 4v3l4-4-4-4v3Zm-1 5h2v5.2l3.2 1.8-1 1.8-4.2-2.5V7Z",
  more: "M5 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm7 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  refresh: "M17.65 6.35A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.76-4.24L13 11h8V3l-3.35 3.35Z",
  chevron: "m7 10 5 5 5-5H7Z",
});

const icon = name =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;

const stageOptions = value => STAGES.map(stage =>
  `<option value="${stage.value}" ${stage.value === value ? "selected" : ""}>${stage.label}</option>`,
).join("");

function humanError(error, fallback) {
  const code = String(error?.code || error?.message || "");
  if (/DUPLICATE_PROSPECT/i.test(code)) return "Este prospecto ya existe en tu Pipeline.";
  if (/VALIDATION/i.test(code)) return error?.message || "Revisa los datos marcados.";
  if (/AUTH|JWT|SESSION/i.test(code)) return "Tu sesión ya no es válida. Inicia sesión nuevamente.";
  return fallback;
}

function semanticKey(record, recommendation) {
  return [
    record.fullName,
    record.stageLabel,
    record.sourceSummary,
    record.latestActivity?.occurredAt || "no-activity",
    record.nextCommitment?.dueAt || "no-commitment",
    recommendation?.type || "no-recommendation",
  ].join("|");
}

export function createPipelineModule({
  root,
  client,
  windowRef = window,
  globalState,
  adapterFactory = createPipelineAdapter,
  nowProvider = () => new Date(),
} = {}) {
  if (!root || !client) throw new Error("AURA_PIPELINE_ROOT_AND_CLIENT_REQUIRED");

  const doc = root.ownerDocument;
  const state = {
    status: "PIPELINE_LOADING",
    records: [],
    adapter: null,
    filters: {
      query: "",
      stage: "",
      source: "",
      quick: "",
      sort: "priority",
    },
    view: viewPreference(windowRef.localStorage),
    layer: null,
    restore: null,
    feedback: null,
    lastUpdatedAt: null,
  };

  let revision = 0;
  let outsideHandler = null;

  const now = () => new Date(nowProvider());
  const findRecord = id => state.records.find(record => record.id === id);

  function setStatus(next, message = "") {
    state.status = next;
    root.dataset.pipelineState = next;
    root.setAttribute("aria-busy", String(/LOADING|SAVING/.test(next)));
    globalState?.(message, /ERROR|FAILED|FAILURE/.test(next) ? "error" : "status");
  }

  function setFeedback(kind, title, detail, nextStep = "") {
    state.feedback = Object.freeze({ kind, title, detail, nextStep });
  }

  function visibleRecords() {
    const filtered = state.records
      .filter(record => matches(record, state.filters))
      .filter(record => matchesQuickFilter(record, state.filters.quick, now()));
    return sortRecords(filtered, state.filters.sort, now());
  }

  function attentionItems() {
    return deriveAttentionItems(state.records, now(), 3);
  }

  function activeFilters() {
    const labels = [];
    if (state.filters.query) labels.push(`búsqueda “${state.filters.query}”`);
    if (state.filters.source) labels.push(`fuente ${state.filters.source}`);
    if (state.filters.stage) {
      labels.push(`etapa ${STAGES.find(stage => stage.value === state.filters.stage)?.label || state.filters.stage}`);
    }
    if (state.filters.quick) {
      const quickLabels = {
        attention: "requieren atención",
        today: "seguimiento hoy",
        overdue: "compromiso vencido",
        no_commitment: "sin próximo compromiso",
        stale: "sin actividad reciente",
        incomplete: "información incompleta",
      };
      labels.push(quickLabels[state.filters.quick] || state.filters.quick);
    }
    return labels;
  }

  function closeLayer(restoreFocus = true) {
    if (outsideHandler) doc.removeEventListener("pointerdown", outsideHandler, true);
    outsideHandler = null;
    state.layer?.remove();
    state.layer = null;
    root.querySelectorAll('[aria-expanded="true"]').forEach(node =>
      node.setAttribute("aria-expanded", "false"),
    );
    if (restoreFocus) state.restore?.focus?.();
    state.restore = null;
  }

  function openDialog({ title, body, footer = "", onReady }) {
    closeLayer(false);
    state.restore = doc.activeElement;

    const layer = doc.createElement("div");
    layer.className = "aura-dialog-layer";
    layer.innerHTML = `
      <button class="aura-scrim" data-close aria-label="Cerrar diálogo"></button>
      <section class="aura-dialog" role="dialog" aria-modal="true" aria-labelledby="pipeline-dialog-title">
        <header>
          <h2 id="pipeline-dialog-title">${e(title)}</h2>
          <button type="button" data-close aria-label="Cerrar">×</button>
        </header>
        <div class="aura-dialog__body">${body}</div>
        ${footer ? `<footer>${footer}</footer>` : ""}
      </section>
    `;

    doc.body.append(layer);
    state.layer = layer;

    layer.addEventListener("click", event => {
      if (event.target.closest("[data-close]")) closeLayer();
    });

    layer.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLayer();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = [...layer.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
      )];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    onReady?.(layer);
    queueMicrotask(() =>
      layer.querySelector("input, textarea, select, button:not([data-close])")?.focus(),
    );
  }

  function openMenu(trigger, record) {
    closeLayer(false);
    state.restore = trigger;
    trigger.setAttribute("aria-expanded", "true");

    const menu = doc.createElement("div");
    menu.className = "aura-context-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", `Acciones para ${record.fullName}`);
    menu.innerHTML = `
      <button role="menuitem" data-menu-action="open">Abrir ficha</button>
      <button role="menuitem" data-menu-action="edit">Editar</button>
      <button role="menuitem" data-menu-action="calendar">Programar seguimiento</button>
      <div role="separator"></div>
      <button role="menuitem" data-menu-action="archive" class="danger">Archivar</button>
    `;

    doc.body.append(menu);
    state.layer = menu;

    const anchor = trigger.getBoundingClientRect();
    menu.style.left = `${Math.max(
      8,
      Math.min(windowRef.innerWidth - menu.offsetWidth - 8, anchor.right - menu.offsetWidth),
    )}px`;
    menu.style.top = `${Math.min(
      windowRef.innerHeight - menu.offsetHeight - 12,
      anchor.bottom + 6,
    )}px`;

    menu.querySelector("button")?.focus();

    menu.addEventListener("click", event => {
      const button = event.target.closest("[data-menu-action]");
      if (button) void perform(button.dataset.menuAction, record);
    });

    menu.addEventListener("keydown", event => {
      const buttons = [...menu.querySelectorAll("button")];
      const current = buttons.indexOf(doc.activeElement);
      if (event.key === "Escape") {
        event.preventDefault();
        closeLayer();
      } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }
    });

    outsideHandler = event => {
      if (!menu.contains(event.target) && event.target !== trigger) closeLayer(false);
    };
    queueMicrotask(() => doc.addEventListener("pointerdown", outsideHandler, true));
  }

  function feedbackHtml() {
    if (!state.feedback) return '<div class="aura-live" aria-live="polite" data-live></div>';
    return `
      <section class="aura-feedback aura-feedback--${e(state.feedback.kind)}" role="status" aria-live="polite" data-feedback>
        <div>
          <strong>${e(state.feedback.title)}</strong>
          <p>${e(state.feedback.detail)}</p>
          ${state.feedback.nextStep ? `<small>Siguiente paso: ${e(state.feedback.nextStep)}</small>` : ""}
        </div>
        <button type="button" data-dismiss-feedback aria-label="Cerrar mensaje">×</button>
      </section>
      <div class="aura-live" aria-live="polite" data-live>${e(state.feedback.title)} ${e(state.feedback.detail)}</div>
    `;
  }

  function attentionHtml(items) {
    if (!state.records.length) return "";

    if (!items.length) {
      return `
        <section class="aura-attention aura-attention--clear" aria-labelledby="pipeline-attention-title" data-attention-layer>
          <header>
            <div>
              <p class="aura-eyebrow">REQUIERE ATENCIÓN</p>
              <h2 id="pipeline-attention-title">Sin señales prioritarias verificadas</h2>
              <p>Forge no detectó compromisos vencidos, seguimientos para hoy ni faltantes explicables con los datos disponibles.</p>
            </div>
          </header>
        </section>
      `;
    }

    return `
      <section class="aura-attention" aria-labelledby="pipeline-attention-title" data-attention-layer>
        <header>
          <div>
            <p class="aura-eyebrow">REQUIERE ATENCIÓN</p>
            <h2 id="pipeline-attention-title">Prioridades verificadas</h2>
            <p>Máximo tres señales, ordenadas por consecuencia observable. Ninguna acción se ejecuta automáticamente.</p>
          </div>
          <span>${items.length} mostradas</span>
        </header>
        <div class="aura-attention__grid">
          ${items.map(item => `
            <article class="aura-attention-card" data-priority-kind="${e(item.kind)}">
              <div>
                <span class="aura-attention-card__kind">${e(item.title)}</span>
                <h3>${e(item.recordName)}</h3>
                <p>${e(item.reason)}</p>
                <small>${e(item.consequence)}</small>
              </div>
              <details>
                <summary>Ver evidencia ${icon("chevron")}</summary>
                <dl>
                  <div><dt>Fuente</dt><dd>${e(item.evidence.source)}</dd></div>
                  <div><dt>${e(item.evidence.label)}</dt><dd>${e(item.evidence.value)}</dd></div>
                </dl>
              </details>
              <button type="button" class="aura-secondary-action" data-priority-action="${e(item.action.type)}" data-id="${e(item.recordId)}">
                ${e(item.action.label)}
              </button>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function recommendationHtml(record) {
    const recommendation = nextBestAction(record, now());
    if (!recommendation) {
      return '<div class="aura-recommendation aura-recommendation--quiet"><span>Sin recomendación</span><p>No hay evidencia suficiente para sugerir una acción.</p></div>';
    }
    return `
      <div class="aura-recommendation" data-recommendation="${e(recommendation.type)}">
        <div>
          <span>Siguiente mejor acción</span>
          <p>${e(recommendation.reason)}</p>
        </div>
        <button type="button" data-recommendation-action="${e(recommendation.type)}" data-id="${e(record.id)}">
          ${e(recommendation.label)}
        </button>
      </div>
    `;
  }

  function actionsHtml(record) {
    const phone = phoneOf(record);
    return `
      <div class="aura-actions" aria-label="Acciones rápidas">
        <button type="button" data-action="whatsapp" data-id="${e(record.id)}" ${phone ? "" : "disabled"} aria-label="${phone ? `Abrir borrador de WhatsApp para ${e(record.fullName)}` : "WhatsApp no disponible"}">
          ${icon("whatsapp")}
        </button>
        ${phone
          ? `<a href="tel:${e(phone)}" aria-label="Llamar a ${e(record.fullName)}">${icon("phone")}</a>`
          : `<button type="button" disabled aria-label="Teléfono no disponible">${icon("phone")}</button>`}
        <button type="button" data-action="timeline" data-id="${e(record.id)}" aria-label="Abrir Timeline de ${e(record.fullName)}">
          ${icon("timeline")}
        </button>
        <button type="button" data-action="more" data-id="${e(record.id)}" aria-haspopup="menu" aria-expanded="false" aria-label="Más acciones para ${e(record.fullName)}">
          ${icon("more")}
        </button>
      </div>
    `;
  }

  function factsHtml(record) {
    const timelineCopy = record.timelineState === "UNAVAILABLE"
      ? "Fuente temporalmente no disponible"
      : record.latestActivity?.label || "Sin actividad verificada";
    const timelineDate = record.timelineState === "UNAVAILABLE"
      ? "No se convirtió en cero"
      : formatDate(record.latestActivity?.occurredAt);
    return `
      <dl class="aura-record-facts">
        <div>
          <dt>Última actividad</dt>
          <dd>${e(timelineCopy)}<small>${e(timelineDate)}</small></dd>
        </div>
        <div>
          <dt>Próximo compromiso</dt>
          <dd>${e(record.nextCommitment?.type || "Sin compromiso")}<small>${e(formatDate(record.nextCommitment?.dueAt, "Sin fecha"))}</small></dd>
        </div>
      </dl>
    `;
  }

  function cardHtml(record) {
    const recommendation = nextBestAction(record, now());
    return `
      <article class="aura-prospect-card" data-record-id="${e(record.id)}" data-record-semantics="${e(semanticKey(record, recommendation))}">
        <header>
          <span class="aura-avatar" aria-hidden="true">${e(record.fullName[0] || "F")}</span>
          <div>
            <h3>${e(record.fullName)}</h3>
            <p>${e(record.sourceSummary)}</p>
          </div>
          <span class="aura-stage-badge">${e(record.stageLabel)}</span>
        </header>
        ${record.productInterest ? `<p class="aura-interest"><span>Interés</span>${e(record.productInterest)}</p>` : ""}
        <label class="aura-stage-control">
          <span>Etapa</span>
          <select data-stage="${e(record.id)}" data-confirmed="${e(record.status)}" aria-label="Cambiar etapa de ${e(record.fullName)}">
            ${stageOptions(record.status)}
          </select>
        </label>
        ${factsHtml(record)}
        ${recommendationHtml(record)}
        ${actionsHtml(record)}
      </article>
    `;
  }

  function rowHtml(record) {
    const recommendation = nextBestAction(record, now());
    return `
      <article class="aura-prospect-row" role="row" data-record-id="${e(record.id)}" data-record-semantics="${e(semanticKey(record, recommendation))}">
        <div role="cell" data-label="Prospecto">
          <span class="aura-avatar" aria-hidden="true">${e(record.fullName[0] || "F")}</span>
          <div><strong>${e(record.fullName)}</strong><small>${e(record.sourceSummary)}</small></div>
        </div>
        <div role="cell" data-label="Etapa">
          <select data-stage="${e(record.id)}" data-confirmed="${e(record.status)}" aria-label="Cambiar etapa de ${e(record.fullName)}">
            ${stageOptions(record.status)}
          </select>
        </div>
        <div role="cell" data-label="Última actividad">
          <strong>${e(record.timelineState === "UNAVAILABLE" ? "Fuente no disponible" : record.latestActivity?.label || "Sin actividad verificada")}</strong>
          <small>${e(record.timelineState === "UNAVAILABLE" ? "No se convirtió en cero" : formatDate(record.latestActivity?.occurredAt))}</small>
        </div>
        <div role="cell" data-label="Próximo compromiso">
          <strong>${e(record.nextCommitment?.type || "Sin compromiso")}</strong>
          <small>${e(formatDate(record.nextCommitment?.dueAt, "Sin fecha"))}</small>
        </div>
        <div role="cell" data-label="Siguiente acción">
          ${recommendationHtml(record)}
        </div>
        <div role="cell" data-label="Acciones">
          ${actionsHtml(record)}
        </div>
      </article>
    `;
  }

  function directoryHtml(records) {
    if (!state.records.length) {
      const canCreate = Boolean(state.adapter?.capabilities?.createProspect);
      return `
        <section class="aura-empty" data-state="PIPELINE_EMPTY">
          <div class="aura-empty__icon" aria-hidden="true">${icon("plus")}</div>
          <h2>Tu Pipeline comienza con una conversación</h2>
          <p>Aquí podrás organizar prospectos, ver su etapa y mantener visible el siguiente compromiso.</p>
          ${canCreate
            ? '<button type="button" class="aura-secondary-action" data-action="create">Agregar primer prospecto</button>'
            : '<button type="button" disabled aria-disabled="true">Alta productiva no disponible</button>'}
          <small>${canCreate
            ? "El alta utiliza la autoridad productiva existente y exige confirmación."
            : "Forge no fingirá una creación mientras falte la autoridad productiva."}</small>
        </section>
      `;
    }

    if (!records.length) {
      const filters = activeFilters();
      return `
        <section class="aura-empty" data-state="PIPELINE_FILTERED_EMPTY">
          <h2>No encontramos coincidencias</h2>
          <p>Los prospectos siguen intactos. Ajusta o limpia los filtros para volver a verlos.</p>
          <p class="aura-filter-summary"><strong>Filtros activos:</strong> ${e(filters.join(", ") || "ninguno")}</p>
          <button type="button" class="aura-secondary-action" data-clear>Limpiar filtros</button>
        </section>
      `;
    }

    if (state.view === "cards") {
      return `<section class="aura-cards" data-directory-view="cards">${records.map(cardHtml).join("")}</section>`;
    }

    return `
      <section class="aura-list" role="table" aria-label="Directorio productivo de prospectos" data-directory-view="list">
        <div class="aura-list__head" role="row">
          <div role="columnheader">Prospecto</div>
          <div role="columnheader">Etapa</div>
          <div role="columnheader">Última actividad</div>
          <div role="columnheader">Próximo compromiso</div>
          <div role="columnheader">Siguiente acción</div>
          <div role="columnheader">Acciones</div>
        </div>
        <div role="rowgroup">${records.map(rowHtml).join("")}</div>
      </section>
    `;
  }

  function toolbarHtml(sources, rows) {
    return `
      <section class="aura-toolbar" aria-label="Controles del Pipeline">
        <label class="aura-search">
          <span class="aura-sr-only">Buscar prospecto</span>
          ${icon("search")}
          <input type="search" data-filter="query" value="${e(state.filters.query)}" placeholder="Buscar prospecto" aria-label="Buscar prospecto">
        </label>
        <label>
          <span>Atención</span>
          <select data-filter="quick">
            <option value="">Todos</option>
            <option value="attention" ${state.filters.quick === "attention" ? "selected" : ""}>Requieren atención</option>
            <option value="today" ${state.filters.quick === "today" ? "selected" : ""}>Seguimiento hoy</option>
            <option value="overdue" ${state.filters.quick === "overdue" ? "selected" : ""}>Compromiso vencido</option>
            <option value="no_commitment" ${state.filters.quick === "no_commitment" ? "selected" : ""}>Sin próximo compromiso</option>
            <option value="stale" ${state.filters.quick === "stale" ? "selected" : ""}>Sin actividad reciente</option>
            <option value="incomplete" ${state.filters.quick === "incomplete" ? "selected" : ""}>Información incompleta</option>
          </select>
        </label>
        <label>
          <span>Fuente</span>
          <select data-filter="source">
            <option value="">Todas</option>
            ${sources.map(source => `<option value="${e(source)}" ${source === state.filters.source ? "selected" : ""}>${e(source)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Etapa</span>
          <select data-filter="stage">
            <option value="">Todas</option>
            ${stageOptions(state.filters.stage)}
          </select>
        </label>
        <label>
          <span>Orden</span>
          <select data-filter="sort">
            <option value="priority" ${state.filters.sort === "priority" ? "selected" : ""}>Prioridad</option>
            <option value="next_commitment" ${state.filters.sort === "next_commitment" ? "selected" : ""}>Próximo compromiso</option>
            <option value="recent_activity" ${state.filters.sort === "recent_activity" ? "selected" : ""}>Actividad más reciente</option>
            <option value="name" ${state.filters.sort === "name" ? "selected" : ""}>Nombre</option>
            <option value="stage" ${state.filters.sort === "stage" ? "selected" : ""}>Etapa</option>
          </select>
        </label>
        <div class="aura-view-toggle" aria-label="Vista del directorio">
          <button type="button" data-view="cards" aria-pressed="${state.view === "cards"}">${icon("cards")}<span>Tarjetas</span></button>
          <button type="button" data-view="list" aria-pressed="${state.view === "list"}">${icon("list")}<span>Lista</span></button>
        </div>
        <p class="aura-count" aria-live="polite">${rows.length} de ${state.records.length}</p>
      </section>
    `;
  }

  function render({ focusSelector = "" } = {}) {
    const sources = [...new Set(
      state.records.map(record => record.sourceValue).filter(Boolean),
    )].sort((left, right) => left.localeCompare(right, "es"));
    const rows = visibleRecords();
    const priorities = attentionItems();
    const attentionCount = state.records.filter(record =>
      Boolean(attentionForRecord(record, now())),
    ).length;
    const updated = state.lastUpdatedAt
      ? new Intl.DateTimeFormat("es-MX", { timeStyle: "short" }).format(state.lastUpdatedAt)
      : "Pendiente";

    root.innerHTML = `
      <section class="aura-pipeline" aria-labelledby="pipeline-title">
        <header class="aura-pipeline__header">
          <div>
            <p class="aura-eyebrow">PIPELINE PRODUCTIVO</p>
            <h1 id="pipeline-title">Pipeline</h1>
            <p>${state.records.length} prospectos · ${attentionCount ? `${attentionCount} requieren atención` : "sin señales prioritarias verificadas"}</p>
            <small>Actualizado: <time>${e(updated)}</time></small>
          </div>
          <div class="aura-pipeline__header-actions">
            <button type="button" class="aura-icon-button" data-refresh aria-label="Actualizar Pipeline">${icon("refresh")}</button>
            <button type="button" class="aura-primary-action" data-primary-action data-action="create" ${state.adapter?.capabilities?.createProspect ? "" : "disabled"} aria-describedby="primary-action-help">
              ${icon("plus")}<span>Agregar prospecto</span>
            </button>
            <span id="primary-action-help" class="aura-sr-only">${state.adapter?.capabilities?.createProspect ? "Alta productiva confirmada" : "Alta productiva no disponible"}</span>
          </div>
        </header>
        ${feedbackHtml()}
        ${attentionHtml(priorities)}
        ${toolbarHtml(sources, rows)}
        <section class="aura-directory" aria-labelledby="pipeline-directory-title" data-directory>
          <header class="aura-directory__header">
            <div>
              <p class="aura-eyebrow">DIRECTORIO PRODUCTIVO</p>
              <h2 id="pipeline-directory-title">Prospectos</h2>
            </div>
          </header>
          ${directoryHtml(rows)}
        </section>
      </section>
    `;

    bind();
    if (focusSelector) queueMicrotask(() => root.querySelector(focusSelector)?.focus());
  }

  function announce(message, bad = false) {
    const live = root.querySelector("[data-live]");
    if (!live) return;
    live.textContent = "";
    queueMicrotask(() => {
      live.textContent = message;
      live.dataset.error = String(bad);
    });
  }

  function fieldError(form, name, message) {
    const node = form.querySelector(`[data-field-error="${name}"]`);
    const input = form.elements.namedItem(name);
    if (node) {
      node.hidden = !message;
      node.textContent = message || "";
    }
    if (input) input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function validateProspectForm(form, { requireContext = false } = {}) {
    let valid = true;
    const fullName = String(form.elements.namedItem("fullName")?.value || "").trim();
    const source = String(form.elements.namedItem("source")?.value || "").trim();
    const phone = String(form.elements.namedItem("phone")?.value || "").trim();
    const initialContext = String(form.elements.namedItem("initialContext")?.value || "").trim();

    const errors = {
      fullName: fullName ? "" : "Escribe el nombre completo.",
      source: source ? "" : "Indica la fuente del prospecto.",
      phone: validateContactPhone(phone),
      initialContext: requireContext && !initialContext ? "Describe brevemente cómo llegó o qué necesita." : "",
    };

    if (requireContext && !phone) errors.phone = "Agrega teléfono o WhatsApp para crear el prospecto.";

    for (const [name, message] of Object.entries(errors)) {
      fieldError(form, name, message);
      if (message) valid = false;
    }
    return valid;
  }

  function openCreateDialog() {
    if (!state.adapter?.capabilities?.createProspect) {
      setFeedback(
        "warning",
        "Alta productiva no disponible",
        "Forge no abrió un formulario simulado porque la autoridad de creación no está conectada.",
        "Utiliza una fuente productiva autorizada.",
      );
      render();
      return;
    }

    openDialog({
      title: "Agregar prospecto",
      body: `
        <form data-create novalidate>
          <p class="aura-form-intro">Captura rápida: solo los datos indispensables para crear el registro productivo.</p>
          <label>Nombre completo
            <input required name="fullName" autocomplete="name" aria-describedby="create-fullName-error">
            <small id="create-fullName-error" data-field-error="fullName" hidden></small>
          </label>
          <label>Teléfono o WhatsApp
            <input required name="phone" inputmode="tel" autocomplete="tel" placeholder="55 1234 5678" aria-describedby="create-phone-error">
            <small id="create-phone-error" data-field-error="phone" hidden></small>
          </label>
          <label>Fuente
            <input required name="source" placeholder="Referido, evento, red personal…" aria-describedby="create-source-error">
            <small id="create-source-error" data-field-error="source" hidden></small>
          </label>
          <label>Contexto inicial
            <textarea required name="initialContext" rows="3" placeholder="Qué necesita o cómo inició la conversación" aria-describedby="create-initialContext-error"></textarea>
            <small id="create-initialContext-error" data-field-error="initialContext" hidden></small>
          </label>
          <details>
            <summary>Agregar más información</summary>
            <label>Producto de interés
              <input name="productInterest" placeholder="Opcional">
            </label>
          </details>
          <p class="aura-form-error" data-form-error role="alert" hidden></p>
          <button type="submit" class="aura-primary">Guardar y continuar</button>
        </form>
      `,
      onReady: layer => {
        const form = layer.querySelector("[data-create]");
        form.addEventListener("submit", async event => {
          event.preventDefault();
          if (!validateProspectForm(form, { requireContext: true })) return;

          const button = event.submitter;
          const data = new FormData(form);
          button.disabled = true;
          setStatus("CREATE_SAVING", "Creando prospecto…");

          try {
            const created = await state.adapter.create({
              fullName: data.get("fullName"),
              phone: data.get("phone"),
              source: data.get("source"),
              initialContext: data.get("initialContext"),
              productsOfInterest: data.get("productInterest")
                ? [data.get("productInterest")]
                : undefined,
            });
            state.records = state.adapter.getCards();
            state.lastUpdatedAt = now();
            setStatus("CREATE_SUCCESS");
            setFeedback(
              "success",
              `${created.fullName || data.get("fullName")} fue agregado al Pipeline`,
              "El registro productivo quedó en etapa Nuevo. No se creó ningún mensaje, tarea ni cita.",
              "Programa el primer seguimiento.",
            );
            closeLayer(false);
            render({ focusSelector: `[data-record-id="${CSS.escape(created.id)}"] [data-recommendation-action]` });
          } catch (error) {
            setStatus("CREATE_FAILURE", "No pudimos crear el prospecto.");
            const errorNode = form.querySelector("[data-form-error]");
            errorNode.hidden = false;
            errorNode.textContent = `${humanError(error, "No pudimos crear el prospecto.")} Tus datos siguen en el formulario y no se creó ningún registro parcial.`;
          } finally {
            button.disabled = false;
          }
        });
      },
    });
  }

  function openEditDialog(record) {
    openDialog({
      title: `Editar · ${record.fullName}`,
      body: `
        <form data-edit novalidate>
          <label>Nombre
            <input required name="fullName" value="${e(record.fullName)}" aria-describedby="edit-fullName-error">
            <small id="edit-fullName-error" data-field-error="fullName" hidden></small>
          </label>
          <label>Fuente
            <input required name="source" value="${e(record.sourceValue)}" aria-describedby="edit-source-error">
            <small id="edit-source-error" data-field-error="source" hidden></small>
          </label>
          <label>Teléfono
            <input name="phone" inputmode="tel" value="${e(phoneOf(record))}" aria-describedby="edit-phone-error">
            <small id="edit-phone-error" data-field-error="phone" hidden></small>
          </label>
          <p class="aura-form-error" data-form-error role="alert" hidden></p>
          <button type="submit" class="aura-primary">Guardar cambios</button>
        </form>
      `,
      onReady: layer => {
        const form = layer.querySelector("[data-edit]");
        form.addEventListener("submit", async event => {
          event.preventDefault();
          if (!validateProspectForm(form)) return;

          const button = event.submitter;
          const data = new FormData(form);
          button.disabled = true;
          setStatus("EDIT_SAVING", "Guardando cambios…");

          try {
            await state.adapter.update(record.id, {
              fullName: data.get("fullName"),
              source: data.get("source"),
              phone: data.get("phone"),
              initialContext: record.prospect.initialContext,
              status: record.status,
            });
            state.records = state.adapter.getCards();
            state.lastUpdatedAt = now();
            setStatus("EDIT_SUCCESS");
            setFeedback(
              "success",
              "Prospecto actualizado",
              `Se guardaron los cambios de ${data.get("fullName")}. El Timeline y la etapa permanecieron intactos.`,
              "Revisa la recomendación actualizada.",
            );
            closeLayer(false);
            render({ focusSelector: `[data-record-id="${CSS.escape(record.id)}"] [data-action="more"]` });
          } catch (error) {
            setStatus("EDIT_FAILURE", "No pudimos guardar los cambios.");
            const errorNode = form.querySelector("[data-form-error]");
            errorNode.hidden = false;
            errorNode.textContent = `${humanError(error, "No pudimos guardar los cambios.")} Tus entradas siguen aquí; la versión confirmada del prospecto permanece intacta.`;
          } finally {
            button.disabled = false;
          }
        });
      },
    });
  }

  function openCalendarDialog(record) {
    const defaults = followupDefaults(record, now());
    openDialog({
      title: `Programar seguimiento · ${record.fullName}`,
      body: `
        <form data-calendar>
          <label>Prospecto
            <input value="${e(record.fullName)}" readonly>
          </label>
          <label>Fecha sugerida
            <input required type="date" name="date" value="${e(defaults.date)}">
          </label>
          <label>Hora
            <input type="time" name="time" value="${e(defaults.time)}">
          </label>
          <label>Duración
            <select name="duration">
              <option value="30">30 minutos</option>
              <option value="45" selected>45 minutos</option>
              <option value="60">60 minutos</option>
            </select>
          </label>
          <p class="aura-default-explanation">${e(defaults.reason)}</p>
          <p class="aura-notice">Forge abrirá un borrador externo. La cita no existirá hasta que la revises y la guardes en Google Calendar.</p>
          <p class="aura-form-error" data-form-error role="alert" hidden></p>
          <button type="submit" class="aura-primary">Abrir borrador</button>
        </form>
      `,
      onReady: layer => {
        const form = layer.querySelector("[data-calendar]");
        form.addEventListener("submit", event => {
          event.preventDefault();
          const data = new FormData(form);
          const time = String(data.get("time") || "");
          const errorNode = form.querySelector("[data-form-error]");
          if (!time) {
            errorNode.hidden = false;
            errorNode.textContent = "Selecciona una hora antes de abrir el borrador. Forge no inventó una porque no había contexto suficiente.";
            form.elements.namedItem("time")?.focus();
            return;
          }

          const url = buildCalendarDraftUrl({
            record,
            date: data.get("date"),
            time,
            durationMinutes: data.get("duration"),
          });
          if (!url) {
            errorNode.hidden = false;
            errorNode.textContent = "Revisa la fecha, hora y duración. No se abrió ningún borrador.";
            return;
          }

          windowRef.open(url, "_blank", "noopener,noreferrer");
          setStatus("FOLLOWUP_DRAFT_OPENED");
          setFeedback(
            "info",
            "Borrador de seguimiento abierto",
            `Se preparó un borrador para ${record.fullName}. Forge no creó ni confirmó una cita.`,
            "Revisa los datos y guarda el evento en Google Calendar.",
          );
          closeLayer(false);
          render({ focusSelector: `[data-record-id="${CSS.escape(record.id)}"] [data-recommendation-action]` });
        });
      },
    });
  }

  async function perform(action, record) {
    closeLayer(false);
    if (action === "create") {
      openCreateDialog();
      return;
    }
    if (!record) return;

    if (action === "whatsapp") {
      const url = state.adapter.whatsappUrl(record);
      if (!url) {
        setStatus("ACTION_DISABLED_NO_PHONE");
        setFeedback(
          "warning",
          "WhatsApp no disponible",
          "El prospecto no tiene un número productivo utilizable.",
          "Completa su información de contacto.",
        );
        render();
        return;
      }
      windowRef.open(url, "_blank", "noopener,noreferrer");
      setFeedback(
        "info",
        "WhatsApp abierto",
        `Se abrió la conversación de ${record.fullName}. Forge no escribió ni envió ningún mensaje.`,
        "Redacta, revisa y envía personalmente.",
      );
      render({ focusSelector: `[data-record-id="${CSS.escape(record.id)}"] [data-action="whatsapp"]` });
      return;
    }

    if (action === "open") {
      openDialog({
        title: `Ficha · ${record.fullName}`,
        body: `
          <dl class="aura-detail">
            <div><dt>Etapa</dt><dd>${e(record.stageLabel)}</dd></div>
            <div><dt>Fuente</dt><dd>${e(record.sourceSummary)}</dd></div>
            <div><dt>Última actividad</dt><dd>${e(record.latestActivity?.label || "No registrado")}</dd></div>
            <div><dt>Próximo compromiso</dt><dd>${e(record.nextCommitment?.type || "No registrado")}</dd></div>
          </dl>
        `,
      });
      return;
    }

    if (action === "timeline") {
      setStatus("TIMELINE_LOADING");
      openDialog({
        title: `Timeline · ${record.fullName}`,
        body: '<div class="aura-loading aura-loading--inline"><div aria-hidden="true"></div><p>Cargando actividad verificada…</p></div>',
      });

      const currentRevision = revision;
      try {
        const timeline = await state.adapter.timeline(record.id);
        if (currentRevision !== revision || !state.layer) return;

        state.layer.querySelector(".aura-dialog__body").innerHTML = timeline.length
          ? `<ol class="aura-timeline">${timeline.map(item => `
              <li>
                <strong>${e(String(item.eventType || "evento").replaceAll("_", " "))}</strong>
                <span>${e(formatDate(item.occurredAt || item.recordedAt))}</span>
                <details>
                  <summary>Fuente</summary>
                  <p>${e(item.eventSource || "Fuente productiva no etiquetada")}</p>
                </details>
              </li>
            `).join("")}</ol>`
          : `
            <section class="aura-inline-empty" data-state="TIMELINE_EMPTY">
              <h3>Sin actividad verificada</h3>
              <p>El Timeline no contiene eventos para este prospecto. Puedes programar un seguimiento o cerrar sin crear datos ficticios.</p>
              <button type="button" class="aura-secondary-action" data-timeline-calendar>Programar seguimiento</button>
            </section>
          `;

        state.layer.querySelector("[data-timeline-calendar]")?.addEventListener("click", () =>
          openCalendarDialog(record),
        );
        setStatus(timeline.length ? "TIMELINE_READY" : "TIMELINE_EMPTY");
      } catch {
        if (currentRevision !== revision || !state.layer) return;
        setStatus("TIMELINE_ERROR");
        state.layer.querySelector(".aura-dialog__body").innerHTML = `
          <section class="aura-inline-empty">
            <h3>No pudimos recuperar el Timeline</h3>
            <p>El resto del Pipeline permanece disponible y no se convirtió la fuente desconocida en cero.</p>
            <button type="button" class="aura-secondary-action" data-timeline-retry>Reintentar</button>
          </section>
        `;
        state.layer.querySelector("[data-timeline-retry]")?.addEventListener("click", () =>
          perform("timeline", record),
        );
      }
      return;
    }

    if (action === "calendar") {
      openCalendarDialog(record);
      return;
    }

    if (action === "edit") {
      openEditDialog(record);
      return;
    }

    if (action === "archive") {
      setStatus("ARCHIVE_CONFIRMATION");
      openDialog({
        title: `Archivar · ${record.fullName}`,
        body: `
          <p>El prospecto saldrá del Pipeline, pero conservará su historial productivo.</p>
          <label>Motivo
            <textarea data-reason rows="3">Retirado del Pipeline</textarea>
          </label>
          <p class="aura-form-error" data-form-error role="alert" hidden></p>
        `,
        footer: `
          <button type="button" data-close>Cancelar</button>
          <button type="button" class="aura-danger-button" data-confirm>Archivar</button>
        `,
        onReady: layer => {
          layer.querySelector("[data-confirm]").addEventListener("click", async event => {
            const button = event.currentTarget;
            button.disabled = true;
            setStatus("ARCHIVE_SAVING", "Archivando prospecto…");
            try {
              await state.adapter.archive(
                record.id,
                layer.querySelector("[data-reason]").value,
              );
              state.records = state.adapter.getCards();
              state.lastUpdatedAt = now();
              setStatus("ARCHIVE_SUCCESS");
              setFeedback(
                "success",
                "Prospecto archivado",
                `${record.fullName} salió del Pipeline y su historial quedó preservado.`,
                "Continúa con la siguiente prioridad visible.",
              );
              closeLayer(false);
              render();
            } catch (error) {
              setStatus("ARCHIVE_FAILURE", "No pudimos archivar el prospecto.");
              const node = layer.querySelector("[data-form-error]");
              node.hidden = false;
              node.textContent = `${humanError(error, "No pudimos archivar el prospecto.")} El registro permanece intacto.`;
              button.disabled = false;
            }
          });
        },
      });
    }
  }

  async function changeStage(select) {
    const record = findRecord(select.dataset.stage);
    const previous = select.dataset.confirmed;
    const next = select.value;
    if (!record || previous === next) return;

    select.disabled = true;
    setStatus("STAGE_SAVING", "Guardando etapa…");
    try {
      const confirmed = await state.adapter.changeStage(record.id, next);
      record.status = confirmed.status;
      record.stageLabel = confirmed.stageLabel;
      record.prospect = confirmed.prospect;
      select.dataset.confirmed = confirmed.status;
      state.lastUpdatedAt = now();
      setStatus("STAGE_CONFIRMED");
      const recommendation = nextBestAction(record, now());
      setFeedback(
        "success",
        `Etapa actualizada a ${confirmed.stageLabel}`,
        `${record.fullName} conserva su información y Timeline. Solo cambió la etapa confirmada.`,
        recommendation?.label || "Revisa el contexto del prospecto.",
      );
      render({ focusSelector: `[data-stage="${CSS.escape(record.id)}"]` });
    } catch (error) {
      select.value = previous;
      select.setAttribute("aria-invalid", "true");
      setStatus("STAGE_FAILED", "Supabase no confirmó el cambio de etapa.");
      setFeedback(
        "error",
        "No pudimos guardar la etapa",
        `${record.fullName} permanece en ${STAGES.find(stage => stage.value === previous)?.label || previous}.`,
        "Reintenta cuando la conexión esté disponible.",
      );
      render({ focusSelector: `[data-stage="${CSS.escape(record.id)}"]` });
      announce(humanError(error, "No pudimos guardar la etapa."), true);
    }
  }

  function bind() {
    root.querySelectorAll("[data-filter]").forEach(control => {
      const eventName = control.dataset.filter === "query" ? "input" : "change";
      control.addEventListener(eventName, () => {
        state.filters[control.dataset.filter] = control.value;
        render({ focusSelector: `[data-filter="${control.dataset.filter}"]` });
      });
    });

    root.querySelectorAll("[data-view]").forEach(button => {
      button.addEventListener("click", () => {
        state.view = button.dataset.view;
        saveViewPreference(windowRef.localStorage, state.view);
        render({ focusSelector: `[data-view="${state.view}"]` });
      });
    });

    root.querySelector("[data-clear]")?.addEventListener("click", () => {
      state.filters = {
        query: "",
        stage: "",
        source: "",
        quick: "",
        sort: "priority",
      };
      render({ focusSelector: '[data-filter="query"]' });
    });

    root.querySelector("[data-dismiss-feedback]")?.addEventListener("click", () => {
      state.feedback = null;
      render({ focusSelector: "[data-primary-action]" });
    });

    root.querySelector("[data-refresh]")?.addEventListener("click", () => void reload());

    root.querySelectorAll("[data-stage]").forEach(select => {
      select.addEventListener("change", () => void changeStage(select));
    });

    root.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", () => {
        const record = findRecord(button.dataset.id);
        if (button.dataset.action === "more") openMenu(button, record);
        else void perform(button.dataset.action, record);
      });
    });

    root.querySelectorAll("[data-priority-action]").forEach(button => {
      button.addEventListener("click", () =>
        void perform(button.dataset.priorityAction, findRecord(button.dataset.id)),
      );
    });

    root.querySelectorAll("[data-recommendation-action]").forEach(button => {
      button.addEventListener("click", () =>
        void perform(button.dataset.recommendationAction, findRecord(button.dataset.id)),
      );
    });
  }

  async function reload() {
    const currentRevision = ++revision;
    setStatus("PIPELINE_LOADING", "Actualizando Pipeline…");
    try {
      const records = await state.adapter.reload();
      if (currentRevision !== revision) return;
      state.records = records;
      state.lastUpdatedAt = now();
      setStatus(records.length ? "PIPELINE_READY" : "PIPELINE_EMPTY");
      render({ focusSelector: "[data-refresh]" });
    } catch (error) {
      if (currentRevision !== revision) return;
      const code = String(error?.code || error?.message || "");
      const nextStatus = /AUTH|JWT|SESSION/i.test(code)
        ? "PIPELINE_UNAUTHORIZED"
        : /NETWORK|FETCH/i.test(code)
          ? "PIPELINE_DISCONNECTED"
          : "PIPELINE_ERROR";
      setStatus(nextStatus);
      root.innerHTML = `
        <section class="aura-error-state" data-state="${nextStatus}">
          <h1>No pudimos actualizar tu Pipeline</h1>
          <p>Los datos previos no fueron sustituidos por información ficticia.</p>
          <button type="button" data-retry>Reintentar</button>
        </section>
      `;
      root.querySelector("[data-retry]")?.addEventListener("click", () => void reload());
    }
  }

  async function mount() {
    const currentRevision = ++revision;
    setStatus("PIPELINE_LOADING");
    root.innerHTML = `
      <section class="aura-loading" data-state="PIPELINE_LOADING">
        <div aria-hidden="true"></div>
        <h1>Recuperando tu Pipeline</h1>
        <p>Consultando prospectos y Timeline productivos.</p>
      </section>
    `;

    try {
      const adapter = await adapterFactory({ client });
      if (currentRevision !== revision) return;
      state.adapter = adapter;

      const records = await adapter.reload();
      if (currentRevision !== revision) return;

      state.records = records;
      state.lastUpdatedAt = now();
      setStatus(records.length ? "PIPELINE_READY" : "PIPELINE_EMPTY");
      render();
    } catch (error) {
      if (currentRevision !== revision) return;
      const code = String(error?.code || error?.message || "");
      const nextStatus = /AUTH|JWT|SESSION/i.test(code)
        ? "PIPELINE_UNAUTHORIZED"
        : /NETWORK|FETCH/i.test(code)
          ? "PIPELINE_DISCONNECTED"
          : "PIPELINE_ERROR";
      setStatus(nextStatus);
      root.innerHTML = `
        <section class="aura-error-state" data-state="${nextStatus}">
          <h1>No pudimos abrir tu Pipeline</h1>
          <p>Forge no cargó datos demo ni convirtió una fuente desconocida en cero.</p>
          <button type="button" data-retry>Reintentar</button>
        </section>
      `;
      root.querySelector("[data-retry]")?.addEventListener("click", () => void mount());
    }
  }

  function destroy() {
    revision += 1;
    closeLayer(false);
    state.records = [];
    state.adapter = null;
    state.feedback = null;
    state.lastUpdatedAt = null;
    state.filters = {
      query: "",
      stage: "",
      source: "",
      quick: "",
      sort: "priority",
    };
    setStatus("PIPELINE_UNAUTHORIZED");
    root.removeAttribute("aria-busy");
    root.replaceChildren();
  }

  function snapshot() {
    return Object.freeze({
      status: state.status,
      records: state.records.length,
      filters: Object.freeze({ ...state.filters }),
      view: state.view,
      hasAdapter: Boolean(state.adapter),
      feedback: state.feedback,
    });
  }

  return Object.freeze({
    mount,
    reload,
    destroy,
    state: snapshot,
    states: PIPELINE_STATES,
  });
}
