import { createProductiveIntelligenceAdapter } from "./pipeline-productive-intelligence-adapter.js?v=aura-native-pipeline-002";
import {
  DESIGN_AUTHORITY,
  VIEW_STORAGE_KEY,
  STAGES,
  icon,
  escapeHtml,
  formatDate,
  sourceOptions,
  cardMarkup,
  rowMarkup,
  matchesFilters,
  humanError,
} from "./pipeline-aura-core.js?v=aura-native-pipeline-002";

const STATE_KEY = Symbol.for("forge.aura.pipeline.native-renderer.state");
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const journalServiceUrl = new URL(
  sourceLayout
    ? "../../../advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js"
    : "../../advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js",
  import.meta.url,
);

let stageAuthorityPromise;
let calendarAuthorityPromise;

function ensureStyles(documentRef) {
  if (documentRef.querySelector("[data-aura-pipeline-styles]")) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./pipeline-aura-light-2026.css?v=aura-native-pipeline-002",
    import.meta.url,
  ).href;
  link.dataset.auraPipelineStyles = "true";
  documentRef.head.append(link);
}

function readView(windowRef) {
  try {
    return windowRef.localStorage?.getItem(VIEW_STORAGE_KEY) === "list"
      ? "list"
      : "cards";
  } catch {
    return "cards";
  }
}

function writeView(windowRef, view) {
  try {
    windowRef.localStorage?.setItem(VIEW_STORAGE_KEY, view);
  } catch {
    // The view preference is optional and stores no prospect information.
  }
}

async function waitForBootstrap(globalRef) {
  for (let index = 0; index < 100; index += 1) {
    const value = globalRef.ForgeProductiveProspectBootstrap067G17B;
    if (value?.getSession && value?.getClient) return value;
    await new Promise(resolve => globalRef.setTimeout(resolve, 50));
  }
  return globalRef.ForgeProductiveProspectBootstrap067G17B || null;
}

async function stageAuthority() {
  if (!stageAuthorityPromise) {
    globalThis.__FORGE_DISABLE_PIPELINE_STAGE_RPC_AUTHORITY_AUTO_INSTALL__ = true;
    stageAuthorityPromise = import(
      "./pipeline-stage-rpc-authority.js?v=aura-native-pipeline-002"
    );
  }
  return stageAuthorityPromise;
}

async function calendarAuthority() {
  if (!calendarAuthorityPromise) {
    calendarAuthorityPromise = import(
      "./pipeline-google-calendar.js?v=pipeline-google-calendar-001"
    );
  }
  return calendarAuthorityPromise;
}

function eventLabel(type) {
  return ({
    PROSPECT_CREATED: "Prospecto creado",
    CONTACT_ATTEMPTED: "Contacto intentado",
    CONVERSATION_RECORDED: "Conversación registrada",
    APPOINTMENT_SCHEDULED: "Cita agendada",
    APPOINTMENT_RESCHEDULED: "Cita reprogramada",
    APPOINTMENT_COMPLETED: "Cita completada",
    OBJECTION_RECORDED: "Objeción registrada",
    FOLLOW_UP_PLANNED: "Seguimiento planeado",
    PROPOSAL_PRESENTED: "Propuesta presentada",
    DECISION_RECORDED: "Decisión registrada",
    STAGE_CHANGED: "Etapa actualizada",
    PROSPECT_ARCHIVED: "Prospecto archivado",
  })[type] || "Actividad registrada";
}

function eventContent(event) {
  return event?.payload?.outcome
    || event?.payload?.decisionCode
    || event?.payload?.objectionCode
    || event?.payload?.note
    || "Evento productivo confirmado";
}

function timeValue(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function setBusy(control, busy, text = null) {
  if (!control) return;
  if (busy) {
    control.dataset.previousText = control.textContent;
    control.disabled = true;
    control.setAttribute("aria-busy", "true");
    if (text) control.textContent = text;
  } else {
    control.disabled = false;
    control.removeAttribute("aria-busy");
    if (control.dataset.previousText) {
      control.textContent = control.dataset.previousText;
      delete control.dataset.previousText;
    }
  }
}

export function createPipelineModule({
  root,
  shell,
  adapterFactory = createProductiveIntelligenceAdapter,
} = {}) {
  if (!root) throw new Error("AURA_PIPELINE_ROOT_REQUIRED");
  if (root[STATE_KEY]) return root[STATE_KEY];

  const documentRef = root.ownerDocument;
  const windowRef = documentRef.defaultView || globalThis;
  ensureStyles(documentRef);
  root.classList.add("pipeline-module", "aura-pipeline");
  root.dataset.designAuthority = DESIGN_AUTHORITY;
  root.dataset.pipelineRenderer = "aura-native";

  const state = {
    mounted: false,
    status: "loading",
    cards: [],
    adapter: null,
    journalService: null,
    filters: { query: "", source: "", status: "" },
    view: readView(windowRef),
    error: "",
    dialog: null,
    restoreFocus: null,
    revision: 0,
  };

  const cardById = id => state.cards.find(card => card.id === id) || null;
  const visibleCards = () => state.cards.filter(card => matchesFilters(card, state.filters));

  function announce(message, error = false) {
    const node = root.querySelector("[data-aura-live]");
    if (!node) return;
    node.dataset.state = error ? "error" : "status";
    node.textContent = "";
    queueMicrotask(() => {
      if (node.isConnected) node.textContent = message;
    });
  }

  function menuItems(menu) {
    return [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];
  }

  function closeMenus({ restore = false } = {}) {
    root.querySelectorAll("[data-aura-menu]:not([hidden])").forEach(menu => {
      menu.hidden = true;
      const trigger = root.querySelector(
        `[data-aura-action="more"][data-id="${CSS.escape(menu.dataset.auraMenu)}"]`,
      );
      trigger?.setAttribute("aria-expanded", "false");
      if (restore) trigger?.focus();
    });
  }

  function focusable(dialog) {
    return [...dialog.querySelectorAll(
      'a[href]:not([hidden]), button:not([disabled]):not([hidden]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )];
  }

  function closeDialog({ restore = true } = {}) {
    state.dialog?.remove();
    state.dialog = null;
    documentRef.body.classList.remove("aura-pipeline-dialog-open");
    if (restore) state.restoreFocus?.focus?.();
    state.restoreFocus = null;
  }

  function openDialog({
    title,
    body,
    footer = "",
    eyebrow = "PIPELINE",
    trigger,
    ready,
  }) {
    closeDialog({ restore: false });
    closeMenus();
    state.restoreFocus = trigger || documentRef.activeElement;

    const layer = documentRef.createElement("div");
    layer.className = "aura-pipeline__dialog-layer";
    layer.innerHTML = `
      <button class="aura-pipeline__scrim" type="button" data-dialog-close aria-label="Cerrar"></button>
      <section class="aura-pipeline__dialog" role="dialog" aria-modal="true"
        aria-labelledby="aura-dialog-title" tabindex="-1">
        <header>
          <div><p>${escapeHtml(eyebrow)}</p><h2 id="aura-dialog-title">${escapeHtml(title)}</h2></div>
          <button type="button" data-dialog-close aria-label="Cerrar">×</button>
        </header>
        <div class="aura-pipeline__dialog-body">${body}</div>
        ${footer ? `<footer>${footer}</footer>` : ""}
      </section>`;

    layer.addEventListener("click", event => {
      if (event.target.closest("[data-dialog-close]")) closeDialog();
    });
    layer.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable(layer);
      if (!items.length) {
        event.preventDefault();
        layer.querySelector(".aura-pipeline__dialog")?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    documentRef.body.append(layer);
    documentRef.body.classList.add("aura-pipeline-dialog-open");
    state.dialog = layer;
    ready?.(layer);
    windowRef.requestAnimationFrame(() => {
      layer.querySelector("[autofocus], input, textarea, select, button")?.focus();
    });
    return layer;
  }

  function renderAuth() {
    const loading = state.status === "loading";
    root.innerHTML = `
      <section class="aura-pipeline__auth" data-aura-auth-state="${escapeHtml(state.status)}">
        <span class="aura-pipeline__auth-mark">F</span>
        <p>PIPELINE</p>
        <h1>${loading
          ? "Recuperando tu operación"
          : state.status === "error"
            ? "No pudimos abrir tu Pipeline"
            : "Inicia sesión para ver tus prospectos"}</h1>
        <span>${loading
          ? "Comprobando sesión y datos productivos."
          : escapeHtml(state.error || "Tus prospectos permanecen protegidos.")}</span>
        ${loading
          ? '<div class="aura-pipeline__loader" aria-label="Cargando"></div>'
          : '<button class="aura-pipeline__primary" type="button" data-forge-auth-open>Iniciar sesión</button>'}
      </section>`;
    root.querySelector("[data-forge-auth-open]")?.addEventListener("click", () => {
      globalThis.ForgeAliveAuthEntry067G17B1?.openAuthPanel?.({ nav: "pipeline" });
    });
  }

  function collectionMarkup(cards) {
    if (state.view === "cards") {
      return `<section class="aura-pipeline__cards" data-aura-collection="cards">
        ${cards.map(cardMarkup).join("")}
      </section>`;
    }
    return `<section class="aura-pipeline__list" role="table" aria-label="Prospectos"
      data-aura-collection="list">
      <div class="aura-pipeline__list-head" role="row">
        <span>Prospecto</span><span>Etapa</span><span>Última actividad</span>
        <span>Próximo compromiso</span><span>Acciones</span>
      </div>
      <div role="rowgroup">${cards.map(rowMarkup).join("")}</div>
    </section>`;
  }

  function render() {
    if (state.status !== "ready") {
      renderAuth();
      return;
    }

    const filtered = Boolean(
      state.filters.query || state.filters.source || state.filters.status,
    );
    root.innerHTML = `
      <div class="aura-pipeline__page">
        <header class="aura-pipeline__topbar">
          <div><p>PIPELINE</p><h1>Prospectos</h1><span>${state.cards.length} en seguimiento</span></div>
          <button class="aura-pipeline__primary" type="button" data-aura-action="create">
            ${icon("add")}<span>Nuevo prospecto</span>
          </button>
        </header>
        <section class="aura-pipeline__toolbar" aria-label="Herramientas del Pipeline">
          <label class="aura-pipeline__search"><span>${icon("search")}</span>
            <input data-filter-query type="search" value="${escapeHtml(state.filters.query)}"
              autocomplete="off" placeholder="Buscar prospecto" aria-label="Buscar prospecto">
          </label>
          <label><span>Fuente</span><select data-filter-source>
            <option value="">Todas</option>${sourceOptions(state.filters.source)}
          </select></label>
          <label><span>Etapa</span><select data-filter-stage>
            <option value="">Todas</option>
            ${STAGES.map(stage => `<option value="${stage.value}" ${stage.value === state.filters.status ? "selected" : ""}>${stage.label}</option>`).join("")}
          </select></label>
          <div class="aura-pipeline__views" aria-label="Vista de prospectos">
            <button type="button" data-view="cards" aria-pressed="${state.view === "cards"}">${icon("cards")}<span>Tarjetas</span></button>
            <button type="button" data-view="list" aria-pressed="${state.view === "list"}">${icon("list")}<span>Lista</span></button>
          </div>
          <button class="aura-pipeline__clear" type="button" data-clear-filters ${filtered ? "" : "disabled"}>Limpiar</button>
          <p data-filter-count aria-live="polite">${visibleCards().length} de ${state.cards.length}</p>
        </section>
        <p class="aura-pipeline__live" data-aura-live aria-live="polite"></p>
        ${state.cards.length === 0
          ? `<section class="aura-pipeline__empty" data-aura-empty="records">
              <h2>Tu Pipeline está listo</h2><p>Agrega el primer prospecto para comenzar.</p>
              <button class="aura-pipeline__primary" type="button" data-aura-action="create">${icon("add")}<span>Agregar prospecto</span></button>
            </section>`
          : `${collectionMarkup(state.cards)}
            <section class="aura-pipeline__empty aura-pipeline__filter-empty" data-aura-filter-empty hidden>
              <h2>No encontramos coincidencias</h2><p>Ajusta la búsqueda o limpia los filtros.</p>
              <button class="aura-pipeline__secondary" type="button" data-clear-filters>Limpiar filtros</button>
            </section>`}
      </div>`;
    applyFilters();
  }

  function syncFilterControls() {
    const query = root.querySelector("[data-filter-query]");
    const source = root.querySelector("[data-filter-source]");
    const stage = root.querySelector("[data-filter-stage]");
    if (query && query.value !== state.filters.query) query.value = state.filters.query;
    if (source) source.value = state.filters.source;
    if (stage) stage.value = state.filters.status;
    const clear = root.querySelector("[data-clear-filters]");
    if (clear) clear.disabled = !(
      state.filters.query || state.filters.source || state.filters.status
    );
  }

  function applyFilters() {
    if (state.status !== "ready") return;
    let visible = 0;
    root.querySelectorAll("[data-aura-record]").forEach(node => {
      const card = cardById(node.dataset.auraRecord);
      const match = Boolean(card && matchesFilters(card, state.filters));
      node.hidden = !match;
      if (match) visible += 1;
    });
    const count = root.querySelector("[data-filter-count]");
    if (count) count.textContent = `${visible} de ${state.cards.length}`;
    const empty = root.querySelector("[data-aura-filter-empty]");
    if (empty) empty.hidden = state.cards.length === 0 || visible > 0;
    syncFilterControls();
  }

  async function changeStage(select) {
    const prospectId = select.dataset.auraStageSelect;
    const card = cardById(prospectId);
    if (!card || select.value === card.status) return;

    const recordNode = select.closest("[data-aura-record]");
    const previous = select.dataset.confirmedStage || card.status;
    const requested = select.value;
    select.disabled = true;
    select.setAttribute("aria-busy", "true");
    select.removeAttribute("aria-invalid");
    recordNode?.setAttribute("data-stage-save", "saving");

    try {
      const bootstrap = await waitForBootstrap(windowRef);
      const client = await bootstrap?.getClient?.();
      const authority = await stageAuthority();
      const confirmed = await authority.requestStageTransition({
        client,
        prospectId,
        status: requested,
      });

      const cards = await state.adapter.reload();
      const next = cards.find(item => item.id === prospectId);
      if (!next || next.status !== confirmed.status) {
        throw Object.assign(new Error("AURA_STAGE_CONFIRMATION_MISMATCH"), {
          code: "AURA_STAGE_CONFIRMATION_MISMATCH",
        });
      }
      state.cards = cards;

      if (recordNode?.isConnected) {
        recordNode.dataset.auraStage = next.status;
        recordNode.dataset.stageSave = "saved";
        recordNode.querySelector("[data-aura-stage-label]")?.replaceChildren(
          documentRef.createTextNode(next.stageLabel),
        );
        const activeSelect = recordNode.querySelector("[data-aura-stage-select]");
        activeSelect.value = next.status;
        activeSelect.dataset.confirmedStage = next.status;
        activeSelect.disabled = false;
        activeSelect.removeAttribute("aria-busy");
        activeSelect.removeAttribute("aria-invalid");
      }

      if (
        recordNode?.isConnected
        && root.querySelector(`[data-aura-record="${CSS.escape(prospectId)}"]`) !== recordNode
      ) {
        throw Object.assign(new Error("AURA_STAGE_RECORD_IDENTITY_CHANGED"), {
          code: "AURA_STAGE_RECORD_IDENTITY_CHANGED",
        });
      }
      applyFilters();
      announce(`Etapa actualizada a ${next.stageLabel}.`);
    } catch (error) {
      if (recordNode?.isConnected) recordNode.dataset.stageSave = "error";
      select.value = previous;
      select.dataset.confirmedStage = previous;
      select.disabled = false;
      select.removeAttribute("aria-busy");
      select.setAttribute("aria-invalid", "true");
      announce(
        humanError(error, "Supabase no confirmó el cambio de etapa."),
        true,
      );
    }
  }

  function referralFieldsMarkup(prefix, prospect = {}) {
    const referred = (prospect.source || "") === "Referido";
    return `<div class="aura-pipeline__referral-fields wide" data-${prefix}-referral-fields ${referred ? "" : "hidden"}>
      <label><span>Referido por</span><input name="referrerName" value="${escapeHtml(prospect.referrerName || "")}"></label>
      <label><span>Relación con el referente</span><input name="referrerRelationship" value="${escapeHtml(prospect.referrerRelationship || "")}"></label>
    </div>`;
  }

  function bindReferralVisibility(form, prefix) {
    const source = form.querySelector('select[name="source"]');
    const fields = form.querySelector(`[data-${prefix}-referral-fields]`);
    const sync = () => {
      const referred = source.value === "Referido";
      fields.hidden = !referred;
      if (!referred) fields.querySelectorAll("input").forEach(input => { input.value = ""; });
    };
    source.addEventListener("change", sync);
    sync();
  }

  function createDialog(trigger) {
    const formId = `aura-create-${Date.now()}`;
    openDialog({
      title: "Nuevo prospecto",
      trigger,
      body: `<form id="${formId}" class="aura-pipeline__form" data-create-form>
        <label><span>Nombre *</span><input name="fullName" required autofocus autocomplete="name"></label>
        <label><span>Teléfono *</span><input name="phone" type="tel" required autocomplete="tel"></label>
        <label><span>Fuente *</span><select name="source" required><option value="">Selecciona</option>${sourceOptions()}</select></label>
        ${referralFieldsMarkup("create")}
        <label class="wide"><span>Contexto inicial *</span><textarea name="initialContext" rows="4" maxlength="4000" required></textarea></label>
        <details class="wide aura-pipeline__optional"><summary>Agregar más datos</summary><div>
          <label><span>Correo</span><input name="email" type="email" autocomplete="email"></label>
          <label><span>Ocupación</span><input name="occupation"></label>
        </div></details>
        <p class="wide" data-form-error role="alert" hidden></p>
      </form>`,
      footer: `<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button>
        <button class="aura-pipeline__primary" type="submit" form="${formId}" data-create-save>Guardar</button>`,
      ready(dialog) {
        const form = dialog.querySelector("[data-create-form]");
        const save = dialog.querySelector("[data-create-save]");
        bindReferralVisibility(form, "create");
        form.addEventListener("submit", async event => {
          event.preventDefault();
          const values = new FormData(form);
          const errorNode = dialog.querySelector("[data-form-error]");
          const optional = name => String(values.get(name) || "").trim() || undefined;
          setBusy(save, true, "Guardando…");
          errorNode.hidden = true;
          try {
            const source = String(values.get("source") || "").trim();
            await state.adapter.createProspect({
              fullName: String(values.get("fullName") || "").trim(),
              phone: String(values.get("phone") || "").trim(),
              source,
              status: "referred_new",
              referrerName: source === "Referido" ? optional("referrerName") : undefined,
              referrerRelationship: source === "Referido" ? optional("referrerRelationship") : undefined,
              initialContext: String(values.get("initialContext") || "").trim(),
              email: optional("email"),
              occupation: optional("occupation"),
            });
            state.cards = await state.adapter.reload();
            closeDialog({ restore: false });
            render();
            announce("Prospecto guardado.");
          } catch (error) {
            errorNode.textContent = humanError(error, "No pudimos guardar el prospecto.");
            errorNode.hidden = false;
            setBusy(save, false);
          }
        });
      },
    });
  }

  function editDialog(card, trigger) {
    const prospect = card.prospect || {};
    const contactKey = prospect.phone ? "phone" : prospect.whatsapp ? "whatsapp" : "phone";
    const formId = `aura-edit-${Date.now()}`;
    openDialog({
      title: `Editar ${card.fullName}`,
      trigger,
      body: `<form id="${formId}" class="aura-pipeline__form" data-edit-form>
        <label><span>Nombre *</span><input name="fullName" required autofocus autocomplete="name" value="${escapeHtml(prospect.fullName || card.fullName)}"></label>
        <label><span>Teléfono *</span><input name="contact" type="tel" required autocomplete="tel" value="${escapeHtml(prospect[contactKey] || card.phone || "")}"></label>
        <label><span>Fuente *</span><select name="source" required>${sourceOptions(prospect.source || card.sourceValue)}</select></label>
        ${referralFieldsMarkup("edit", prospect)}
        <label class="wide"><span>Contexto inicial *</span><textarea name="initialContext" rows="4" maxlength="4000" required>${escapeHtml(prospect.initialContext || "")}</textarea></label>
        <details class="wide aura-pipeline__optional" ${prospect.email || prospect.occupation ? "open" : ""}><summary>Datos adicionales</summary><div>
          <label><span>Correo</span><input name="email" type="email" value="${escapeHtml(prospect.email || "")}"></label>
          <label><span>Ocupación</span><input name="occupation" value="${escapeHtml(prospect.occupation || "")}"></label>
        </div></details>
        <p class="wide" data-form-error role="alert" hidden></p>
      </form>`,
      footer: `<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button>
        <button class="aura-pipeline__primary" type="submit" form="${formId}" data-edit-save>Guardar cambios</button>`,
      ready(dialog) {
        const form = dialog.querySelector("[data-edit-form]");
        const save = dialog.querySelector("[data-edit-save]");
        bindReferralVisibility(form, "edit");
        form.addEventListener("submit", async event => {
          event.preventDefault();
          const values = new FormData(form);
          const errorNode = dialog.querySelector("[data-form-error]");
          const text = name => String(values.get(name) || "").trim();
          const nullable = name => text(name) || null;
          const source = text("source");
          const changes = {
            fullName: text("fullName"),
            [contactKey]: text("contact"),
            source,
            referrerName: source === "Referido" ? nullable("referrerName") : null,
            referrerRelationship: source === "Referido" ? nullable("referrerRelationship") : null,
            initialContext: text("initialContext"),
            email: nullable("email"),
            occupation: nullable("occupation"),
            status: card.status,
          };
          setBusy(save, true, "Guardando…");
          errorNode.hidden = true;
          try {
            const updated = await state.adapter.service.updateProspect(card.id, changes);
            const confirmed = await state.adapter.service.getProspect(card.id);
            const valid = updated?.id === card.id
              && confirmed?.id === card.id
              && confirmed.fullName === changes.fullName
              && confirmed[contactKey] === changes[contactKey]
              && confirmed.source === changes.source
              && confirmed.initialContext === changes.initialContext;
            if (!valid) {
              throw Object.assign(new Error("AURA_EDIT_CONFIRMATION_MISMATCH"), {
                code: "AURA_EDIT_CONFIRMATION_MISMATCH",
              });
            }
            state.cards = await state.adapter.reload();
            closeDialog({ restore: false });
            render();
            announce("Prospecto actualizado.");
          } catch (error) {
            errorNode.textContent = humanError(error, "No pudimos actualizar el prospecto.");
            errorNode.hidden = false;
            setBusy(save, false);
          }
        });
      },
    });
  }

  function archiveDialog(card, trigger) {
    openDialog({
      title: `Retirar a ${card.fullName}`,
      eyebrow: "PIPELINE · ARCHIVO",
      trigger,
      body: `<p>El prospecto saldrá del Pipeline, pero su historial se conservará.</p>
        <label class="aura-pipeline__field"><span>Motivo</span>
          <input data-archive-reason value="Retirado desde Pipeline" maxlength="160" autofocus>
        </label><p data-form-error role="alert" hidden></p>`,
      footer: `<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button>
        <button class="aura-pipeline__danger" type="button" data-archive-confirm>Retirar</button>`,
      ready(dialog) {
        const confirm = dialog.querySelector("[data-archive-confirm]");
        confirm.addEventListener("click", async () => {
          const errorNode = dialog.querySelector("[data-form-error]");
          const reason = dialog.querySelector("[data-archive-reason]").value.trim();
          setBusy(confirm, true, "Retirando…");
          errorNode.hidden = true;
          try {
            const archived = await state.adapter.service.archiveProspect(card.id, reason);
            const visible = await state.adapter.service.listProspects();
            if (!archived?.archivedAt || visible.some(item => item.id === card.id)) {
              throw Object.assign(new Error("AURA_ARCHIVE_CONFIRMATION_MISMATCH"), {
                code: "AURA_ARCHIVE_CONFIRMATION_MISMATCH",
              });
            }
            state.cards = await state.adapter.reload();
            closeDialog({ restore: false });
            render();
            announce("Prospecto retirado del Pipeline.");
          } catch (error) {
            errorNode.textContent = humanError(error, "No pudimos retirar el prospecto.");
            errorNode.hidden = false;
            setBusy(confirm, false);
          }
        });
      },
    });
  }

  async function journalService() {
    if (state.journalService) return state.journalService;
    if (!globalThis.ForgeProspectJournalServiceP7) {
      await import(`${journalServiceUrl.href}?v=aura-native-pipeline-002`);
    }
    const bootstrap = await waitForBootstrap(windowRef);
    const client = await bootstrap?.getClient?.();
    if (!client || !globalThis.ForgeProspectJournalServiceP7?.create) {
      throw Object.assign(new Error("PROSPECT_JOURNAL_NOT_DEPLOYED"), {
        code: "PROSPECT_JOURNAL_NOT_DEPLOYED",
      });
    }
    state.journalService = globalThis.ForgeProspectJournalServiceP7.create(client);
    return state.journalService;
  }

  function historyMarkup({ entries = [], timeline = [] }) {
    const notes = entries.map(entry => ({
      id: entry.id,
      kind: "note",
      occurredAt: entry.createdAt,
      title: entry.captureMethod === "voice" ? "Nota dictada" : "Nota escrita",
      content: entry.content,
    }));
    const events = timeline
      .filter(event => !String(event.sourceRecordReference || "").startsWith("JOURNAL:"))
      .map(event => ({
        id: event.id,
        kind: "event",
        occurredAt: event.occurredAt || event.recordedAt,
        title: eventLabel(event.eventType),
        content: eventContent(event),
      }));
    const history = [...notes, ...events]
      .sort((a, b) => timeValue(b.occurredAt) - timeValue(a.occurredAt));
    if (!history.length) return '<p class="aura-pipeline__muted">No hay actividad registrada.</p>';
    return `<ol class="aura-pipeline__timeline">${history.map(item => `
      <li data-history-kind="${item.kind}"><span></span><div>
        <strong>${escapeHtml(item.title)}</strong>
        <time datetime="${escapeHtml(item.occurredAt || "")}">${escapeHtml(formatDate(item.occurredAt, "Fecha no disponible"))}</time>
        <p>${escapeHtml(item.content)}</p>
      </div></li>`).join("")}</ol>`;
  }

  async function timelineData(card) {
    const timeline = await state.adapter.timelineService.listProspectTimeline(card.id);
    let entries = [];
    let journalAvailable = true;
    try {
      entries = await (await journalService()).listEntries(card.id);
    } catch (error) {
      if (!/NOT_DEPLOYED/i.test(String(error?.code || error?.message || ""))) throw error;
      journalAvailable = false;
    }
    return { timeline, entries, journalAvailable };
  }

  async function timelineDialog(card, trigger) {
    const dialog = openDialog({
      title: card.fullName,
      eyebrow: "PIPELINE · TIMELINE",
      trigger,
      body: '<div class="aura-pipeline__loading"><div class="aura-pipeline__loader"></div><p>Cargando historial.</p></div>',
    });
    try {
      let data = await timelineData(card);
      if (state.dialog !== dialog) return;
      const renderBody = () => {
        dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `
          <section class="aura-pipeline__context"><h3>Contexto inicial</h3>
            <p>${escapeHtml(card.prospect?.initialContext || "Sin contexto inicial registrado.")}</p>
          </section>
          <form class="aura-pipeline__journal" data-journal-form>
            <label><span>Nueva nota</span><textarea name="content" rows="4" maxlength="4000"
              placeholder="Qué ocurrió, qué preocupa al prospecto y cuál es el siguiente paso."
              ${data.journalAvailable ? "" : "disabled"}></textarea></label>
            <div><button class="aura-pipeline__primary" type="submit" data-journal-save
              ${data.journalAvailable ? "" : "disabled"}>Guardar nota</button></div>
            ${data.journalAvailable
              ? ""
              : '<p class="aura-pipeline__notice">La captura de notas todavía no está desplegada en este entorno.</p>'}
            <p data-journal-status role="status" aria-live="polite"></p>
            <p data-form-error role="alert" hidden></p>
          </form>
          <section class="aura-pipeline__history"><h3>Historial</h3>
            <div data-history>${historyMarkup(data)}</div>
          </section>`;

        const form = dialog.querySelector("[data-journal-form]");
        form.addEventListener("submit", async event => {
          event.preventDefault();
          const textarea = form.querySelector("textarea[name=content]");
          const content = textarea.value.trim();
          const save = form.querySelector("[data-journal-save]");
          const status = form.querySelector("[data-journal-status]");
          const errorNode = form.querySelector("[data-form-error]");
          if (!content) {
            errorNode.textContent = "Escribe una nota antes de guardarla.";
            errorNode.hidden = false;
            textarea.focus();
            return;
          }
          setBusy(save, true, "Guardando…");
          errorNode.hidden = true;
          status.textContent = "Guardando nota…";
          try {
            const entry = await (await journalService()).appendEntry(card.id, {
              content,
              captureMethod: "text",
            });
            const cards = await state.adapter.reload();
            state.cards = cards;
            const refreshed = cardById(card.id);
            const timeline = refreshed?.timeline
              || await state.adapter.timelineService.listProspectTimeline(card.id);
            const linked = timeline.some(event => (
              event.eventType === "CONVERSATION_RECORDED"
              && event.sourceRecordReference === `JOURNAL:${entry.id}`
            ));
            if (!linked) {
              throw Object.assign(new Error("PROSPECT_JOURNAL_TIMELINE_LINK_MISSING"), {
                code: "PROSPECT_JOURNAL_TIMELINE_LINK_MISSING",
              });
            }
            data = {
              timeline,
              entries: await (await journalService()).listEntries(card.id),
              journalAvailable: true,
            };
            dialog.querySelector("[data-history]").innerHTML = historyMarkup(data);
            textarea.value = "";
            status.textContent = "Nota guardada y Timeline actualizado.";
            setBusy(save, false);
            announce("Nota registrada en Timeline.");
          } catch (error) {
            errorNode.textContent = humanError(error, "No pudimos guardar la nota.");
            errorNode.hidden = false;
            status.textContent = "";
            setBusy(save, false);
          }
        });
      };
      renderBody();
    } catch (error) {
      if (state.dialog === dialog) {
        dialog.querySelector(".aura-pipeline__dialog-body").innerHTML =
          `<p role="alert">${escapeHtml(humanError(error, "No pudimos cargar el Timeline."))}</p>`;
      }
    }
  }

  function calendarDialog(card, trigger) {
    openDialog({
      title: `Cita con ${card.fullName}`,
      eyebrow: "PIPELINE · AGENDA",
      trigger,
      body: `<div class="aura-pipeline__form">
        <label><span>Fecha</span><input type="date" data-calendar-date required></label>
        <label><span>Hora</span><input type="time" data-calendar-time value="10:00" required></label>
        <label><span>Duración</span><select data-calendar-duration>
          <option value="30">30 min</option><option value="45" selected>45 min</option>
          <option value="60">60 min</option><option value="90">90 min</option>
        </select></label>
        <p class="wide aura-pipeline__notice">Forge prepara el borrador; tú revisas y guardas en Google Calendar.</p>
      </div>`,
      footer: `<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button>
        <a class="aura-pipeline__primary" data-calendar-open aria-disabled="true" tabindex="-1"
          target="_blank" rel="noopener noreferrer">Abrir Google Calendar</a>`,
      ready(dialog) {
        const dateInput = dialog.querySelector("[data-calendar-date]");
        const timeInput = dialog.querySelector("[data-calendar-time]");
        const durationInput = dialog.querySelector("[data-calendar-duration]");
        const link = dialog.querySelector("[data-calendar-open]");
        const tomorrow = new Date(Date.now() + 86_400_000);
        dateInput.value = [
          tomorrow.getFullYear(),
          String(tomorrow.getMonth() + 1).padStart(2, "0"),
          String(tomorrow.getDate()).padStart(2, "0"),
        ].join("-");

        const update = async () => {
          const authority = await calendarAuthority();
          const url = authority.buildPipelineGoogleCalendarUrl({
            prospect: {
              fullName: card.fullName,
              stageLabel: card.stageLabel,
              sourceSummary: card.sourceSummary,
              latestActivity: card.latestActivity?.label || "",
            },
            date: dateInput.value,
            time: timeInput.value,
            durationMinutes: Number(durationInput.value),
          });
          if (!url) {
            link.removeAttribute("href");
            link.setAttribute("aria-disabled", "true");
            link.tabIndex = -1;
            return;
          }
          link.href = url;
          link.setAttribute("aria-disabled", "false");
          link.tabIndex = 0;
        };
        dialog.querySelectorAll("input,select").forEach(control => {
          control.addEventListener("change", () => { void update(); });
        });
        void update();
      },
    });
  }

  async function whatsappDialog(card, trigger) {
    const dialog = openDialog({
      title: `WhatsApp para ${card.fullName}`,
      eyebrow: "PIPELINE · WHATSAPP",
      trigger,
      body: '<div class="aura-pipeline__loading"><div class="aura-pipeline__loader"></div><p>Preparando borrador gobernado.</p></div>',
    });
    try {
      const prepared = await state.adapter.prepareMessage(card.prospect);
      if (state.dialog !== dialog) return;
      const text = prepared.candidate?.rawText || prepared.candidate?.text || "";
      dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `
        <p class="aura-pipeline__notice">${escapeHtml(prepared.sourceMode)} · Sin envío automático.</p>
        <label class="aura-pipeline__field"><span>Mensaje editable</span>
          <textarea data-wa-text rows="7">${escapeHtml(text)}</textarea></label>
        <p data-form-error role="alert" hidden></p>
        <div class="aura-pipeline__inline-actions">
          <button class="aura-pipeline__primary" type="button" data-wa-approve>Revisar y habilitar WhatsApp</button>
          <a class="aura-pipeline__primary" data-wa-open hidden target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>
        </div>`;
      const textarea = dialog.querySelector("[data-wa-text]");
      const link = dialog.querySelector("[data-wa-open]");
      textarea.addEventListener("input", () => {
        link.hidden = true;
        link.removeAttribute("href");
      });
      dialog.querySelector("[data-wa-approve]").addEventListener("click", () => {
        const value = textarea.value.trim();
        const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06;
        const navigation = globalThis.ForgeProductiveContactNavigationBoundary067G17B;
        const validation = safety?.draftSafetyValidator?.({
          draftText: value,
          draftCandidateSnapshot: {
            rawText: value,
            sendsMessage: false,
            sourceMutable: true,
          },
          humanApproval: { required: true, finalAuthority: "HUMAN" },
        });
        const approval = safety?.approveExactDraft?.({
          draftText: value,
          validationResult: validation,
          humanDecision: safety.EXPLICIT_DRAFT_APPROVAL,
        });
        const gate = safety?.exactDraftHumanApprovalGate?.({
          draftText: value,
          validationResult: validation,
          approvalSnapshot: approval,
        });
        const url = gate?.exactDraftApproved
          ? navigation?.whatsappUrl?.(card.prospect, "professional", value)
          : null;
        const errorNode = dialog.querySelector("[data-form-error]");
        if (!url) {
          errorNode.textContent = "El mensaje no pasó la validación.";
          errorNode.hidden = false;
          return;
        }
        link.href = url;
        link.hidden = false;
        errorNode.hidden = true;
      });
    } catch (error) {
      if (state.dialog === dialog) {
        dialog.querySelector(".aura-pipeline__dialog-body").innerHTML =
          `<p role="alert">${escapeHtml(humanError(error, "No pudimos preparar el mensaje."))}</p>`;
      }
    }
  }

  function combatDialog(card, trigger) {
    openDialog({
      title: card.fullName,
      eyebrow: "NASH COMBAT",
      trigger,
      body: `<label class="aura-pipeline__field"><span>Objeción escuchada</span>
          <textarea data-combat-text rows="4" autofocus></textarea></label>
        <button class="aura-pipeline__primary" type="button" data-combat-run>Analizar</button>
        <div data-combat-result></div>`,
      ready(dialog) {
        dialog.querySelector("[data-combat-run]").addEventListener("click", async event => {
          const run = event.currentTarget;
          const result = dialog.querySelector("[data-combat-result]");
          setBusy(run, true, "Analizando…");
          try {
            const combat = await state.adapter.analyzeCombat(
              card.prospect,
              dialog.querySelector("[data-combat-text]").value,
            );
            result.innerHTML = `<section class="aura-pipeline__context">
              <h3>Lectura candidata</h3>
              <p><strong>Tipo:</strong> ${escapeHtml(combat.classification?.type || "No disponible")}</p>
              <p><strong>Intención:</strong> ${escapeHtml(combat.classification?.intent || "No disponible")}</p>
              <p><strong>Estrategia:</strong> ${escapeHtml(combat.psychology?.recommendedStrategy || "No disponible")}</p>
              <p><strong>Siguiente movimiento:</strong> ${escapeHtml(String(combat.nextBestAction?.action || combat.nextBestAction || "No disponible"))}</p>
              <button class="aura-pipeline__secondary" type="button" data-combat-register>Registrar clasificación en Timeline</button>
            </section>`;
            result.querySelector("[data-combat-register]").addEventListener("click", async registerEvent => {
              const register = registerEvent.currentTarget;
              setBusy(register, true, "Registrando…");
              try {
                state.cards = await state.adapter.registerObjectionClassification(card, combat);
                register.textContent = "Clasificación registrada";
                register.disabled = true;
                announce("Objeción registrada en Timeline.");
              } catch (error) {
                setBusy(register, false);
                announce(humanError(error, "No pudimos registrar la clasificación."), true);
              }
            });
          } catch (error) {
            result.innerHTML = `<p role="alert">${escapeHtml(humanError(error, "No pudimos analizar la objeción."))}</p>`;
          } finally {
            setBusy(run, false);
          }
        });
      },
    });
  }

  async function nbaDialog(card, trigger) {
    const dialog = openDialog({
      title: card.fullName,
      eyebrow: "SIGUIENTE MEJOR ACCIÓN",
      trigger,
      body: '<div class="aura-pipeline__loading"><div class="aura-pipeline__loader"></div><p>Construyendo recomendación.</p></div>',
    });
    try {
      const nba = await state.adapter.buildNba(card);
      if (state.dialog !== dialog) return;
      const text = value => (
        Array.isArray(value)
          ? value.join(", ")
          : value && typeof value === "object"
            ? Object.values(value).filter(Boolean).join(" · ")
            : String(value || "No disponible")
      );
      dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `
        <section class="aura-pipeline__context">
          <h3>Acción candidata</h3><p>${escapeHtml(text(nba.recommendedAction))}</p>
          <h3>Reason Why</h3><p>${escapeHtml(text(nba.reasonWhy))}</p>
          <h3>Por qué ahora</h3><p>${escapeHtml(text(nba.whyNow))}</p>
          <h3>Limitaciones</h3><p>${escapeHtml(text(nba.confidenceLimitations))}</p>
        </section>
        <p class="aura-pipeline__notice">Revisión humana requerida. No se ejecutó ninguna acción.</p>`;
    } catch (error) {
      if (state.dialog === dialog) {
        dialog.querySelector(".aura-pipeline__dialog-body").innerHTML =
          `<p role="alert">${escapeHtml(humanError(error, "No pudimos construir la recomendación."))}</p>`;
      }
    }
  }

  async function act(action, trigger) {
    const card = cardById(trigger.dataset.id);
    closeMenus();
    if (action === "create") return createDialog(trigger);
    if (!card) return undefined;
    if (action === "edit") return editDialog(card, trigger);
    if (action === "archive") return archiveDialog(card, trigger);
    if (action === "timeline") return timelineDialog(card, trigger);
    if (action === "calendar") return calendarDialog(card, trigger);
    if (action === "whatsapp") return whatsappDialog(card, trigger);
    if (action === "combat") return combatDialog(card, trigger);
    if (action === "nba") return nbaDialog(card, trigger);
    return undefined;
  }

  function openMenu(trigger, focus = "first") {
    const menu = root.querySelector(
      `[data-aura-menu="${CSS.escape(trigger.dataset.id)}"]`,
    );
    if (!menu) return;
    closeMenus();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    const items = menuItems(menu);
    (focus === "last" ? items.at(-1) : items[0])?.focus();
  }

  root.addEventListener("click", event => {
    const view = event.target.closest("[data-view]");
    if (view) {
      state.view = view.dataset.view === "list" ? "list" : "cards";
      writeView(windowRef, state.view);
      render();
      return;
    }
    if (event.target.closest("[data-clear-filters]")) {
      state.filters = { query: "", source: "", status: "" };
      syncFilterControls();
      applyFilters();
      root.querySelector("[data-filter-query]")?.focus();
      return;
    }
    const trigger = event.target.closest("[data-aura-action]");
    if (!trigger) return;
    const action = trigger.dataset.auraAction;
    if (action === "more") {
      const menu = root.querySelector(
        `[data-aura-menu="${CSS.escape(trigger.dataset.id)}"]`,
      );
      const shouldOpen = menu?.hidden !== false;
      closeMenus();
      if (shouldOpen) openMenu(trigger);
      return;
    }
    void act(action, trigger);
  });

  root.addEventListener("input", event => {
    if (!event.target.matches("[data-filter-query]")) return;
    state.filters.query = event.target.value;
    applyFilters();
  });

  root.addEventListener("change", event => {
    if (event.target.matches("[data-filter-source]")) {
      state.filters.source = event.target.value;
      applyFilters();
    } else if (event.target.matches("[data-filter-stage]")) {
      state.filters.status = event.target.value;
      applyFilters();
    } else if (event.target.matches("[data-aura-stage-select]")) {
      void changeStage(event.target);
    }
  });

  root.addEventListener("keydown", event => {
    const more = event.target.closest('[data-aura-action="more"]');
    if (more && ["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      openMenu(more, event.key === "ArrowUp" ? "last" : "first");
      return;
    }
    const menu = event.target.closest("[data-aura-menu]");
    if (!menu) return;
    const items = menuItems(menu);
    const index = items.indexOf(documentRef.activeElement);
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenus({ restore: true });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(index + 1 + items.length) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(index - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items.at(-1)?.focus();
    } else if (event.key === "Tab") {
      closeMenus();
    }
  });

  const onDocumentClick = event => {
    if (!event.target.closest("[data-aura-actions]")) closeMenus();
  };
  documentRef.addEventListener("click", onDocumentClick);

  async function load() {
    const revision = ++state.revision;
    state.status = "loading";
    state.error = "";
    render();
    try {
      const bootstrap = await waitForBootstrap(windowRef);
      const session = await bootstrap?.getSession?.();
      if (!session?.data?.session?.user?.id) {
        state.status = "anonymous";
        state.cards = [];
        state.adapter = null;
        state.journalService = null;
        render();
        return;
      }
      const adapter = await adapterFactory();
      const cards = await adapter.reload();
      if (revision !== state.revision) return;
      state.adapter = adapter;
      state.cards = cards;
      state.status = "ready";
      render();
    } catch (error) {
      if (revision !== state.revision) return;
      state.status = "error";
      state.error = humanError(error, "No pudimos cargar el Pipeline productivo.");
      render();
    }
  }

  const onAuthStateChanged = event => {
    const status = String(event.detail?.status || "").toLowerCase();
    if (status === "authenticated") {
      void load();
      return;
    }
    if (!["anonymous", "auth_error"].includes(status)) return;
    state.revision += 1;
    state.cards = [];
    state.adapter = null;
    state.journalService = null;
    state.status = status === "auth_error" ? "error" : "anonymous";
    state.error = status === "auth_error" ? "No pudimos recuperar tu sesión." : "";
    closeDialog({ restore: false });
    closeMenus();
    render();
  };
  windowRef.addEventListener("forge:auth-state-changed", onAuthStateChanged);

  const api = Object.freeze({
    id: "pipeline",
    root,
    designAuthority: DESIGN_AUTHORITY,
    mount() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
      if (!state.mounted) {
        state.mounted = true;
        void load();
      }
      shell?.syncVisualViewport?.();
    },
    reconcile() {
      root.hidden = false;
      root.dataset.moduleActive = "true";
    },
    unmount() {
      root.hidden = true;
      root.dataset.moduleActive = "false";
      closeMenus();
      closeDialog({ restore: false });
    },
    refresh: load,
    diagnostics: () => Object.freeze({
      renderer: "aura-native",
      designAuthority: DESIGN_AUTHORITY,
      material3DesignUsed: false,
      view: state.view,
      records: state.cards.length,
      status: state.status,
      legacyDomEnhancerUsed: false,
      storedPrivateData: false,
    }),
  });
  root[STATE_KEY] = api;
  return api;
}
