import { createProductiveIntelligenceAdapter } from "./pipeline-productive-intelligence-adapter.js?v=aura-cleanroom-pipeline-001";
import {
  DESIGN_AUTHORITY, VIEW_STORAGE_KEY, SOURCES, STAGES, icon, escapeHtml, normalize,
  formatDate, sourceOptions, cardMarkup, rowMarkup, humanError,
} from "./pipeline-aura-core.js?v=aura-cleanroom-pipeline-001";

const STATE_KEY = Symbol.for("forge.aura.pipeline.clean-renderer.state");
let stageAuthorityPromise;

function ensureStyles(documentRef) {
  if (documentRef.querySelector("[data-aura-pipeline-styles]")) return;
  const link = documentRef.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("./pipeline-aura-light-2026.css?v=aura-cleanroom-pipeline-001", import.meta.url).href;
  link.dataset.auraPipelineStyles = "true";
  documentRef.head.append(link);
}

function readView(windowRef) {
  try { return windowRef.localStorage?.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "cards"; }
  catch { return "cards"; }
}

function writeView(windowRef, view) {
  try { windowRef.localStorage?.setItem(VIEW_STORAGE_KEY, view); } catch { /* optional */ }
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
    stageAuthorityPromise = import("./pipeline-stage-rpc-authority.js?v=aura-cleanroom-pipeline-001");
  }
  return stageAuthorityPromise;
}

function eventLabel(type) {
  return ({
    PROSPECT_CREATED: "Prospecto creado", CONTACT_ATTEMPTED: "Contacto intentado",
    CONVERSATION_RECORDED: "Conversación registrada", APPOINTMENT_SCHEDULED: "Cita agendada",
    APPOINTMENT_RESCHEDULED: "Cita reprogramada", APPOINTMENT_COMPLETED: "Cita completada",
    OBJECTION_RECORDED: "Objeción registrada", FOLLOW_UP_PLANNED: "Seguimiento planeado",
    PROPOSAL_PRESENTED: "Propuesta presentada", DECISION_RECORDED: "Decisión registrada",
    STAGE_CHANGED: "Etapa actualizada", PROSPECT_ARCHIVED: "Prospecto archivado",
  })[type] || "Actividad registrada";
}

export function createPipelineModule({ root, shell, adapterFactory = createProductiveIntelligenceAdapter } = {}) {
  if (!root) throw new Error("AURA_PIPELINE_ROOT_REQUIRED");
  if (root[STATE_KEY]) return root[STATE_KEY];

  const documentRef = root.ownerDocument;
  const windowRef = documentRef.defaultView || globalThis;
  ensureStyles(documentRef);
  root.className = "pipeline-module aura-pipeline";
  root.dataset.designAuthority = DESIGN_AUTHORITY;
  root.dataset.pipelineRenderer = "cleanroom";

  const state = {
    mounted: false, status: "loading", cards: [], adapter: null,
    filters: { query: "", source: "", status: "" },
    view: readView(windowRef), error: "", dialog: null, restoreFocus: null, revision: 0,
  };

  const cardById = id => state.cards.find(card => card.id === id) || null;

  function visibleCards() {
    const query = normalize(state.filters.query);
    return state.cards.filter(card => {
      const text = normalize([card.fullName, card.sourceSummary, card.stageLabel,
        card.latestActivity?.label, card.nextCommitment?.type].filter(Boolean).join(" "));
      return (!state.filters.source || card.sourceValue === state.filters.source)
        && (!state.filters.status || card.status === state.filters.status)
        && (!query || text.includes(query));
    });
  }

  function announce(message, error = false) {
    const node = root.querySelector("[data-aura-live]");
    if (!node) return;
    node.dataset.state = error ? "error" : "status";
    node.textContent = "";
    queueMicrotask(() => { node.textContent = message; });
  }

  function closeMenus({ restore = false } = {}) {
    root.querySelectorAll("[data-aura-menu]:not([hidden])").forEach(menu => {
      menu.hidden = true;
      const trigger = root.querySelector(`[data-aura-action="more"][data-id="${CSS.escape(menu.dataset.auraMenu)}"]`);
      trigger?.setAttribute("aria-expanded", "false");
      if (restore) trigger?.focus();
    });
  }

  function closeDialog({ restore = true } = {}) {
    state.dialog?.remove();
    state.dialog = null;
    documentRef.body.classList.remove("aura-pipeline-dialog-open");
    if (restore) state.restoreFocus?.focus?.();
    state.restoreFocus = null;
  }

  function openDialog({ title, body, footer = "", eyebrow = "PIPELINE", trigger, ready }) {
    closeDialog({ restore: false });
    state.restoreFocus = trigger || documentRef.activeElement;
    const layer = documentRef.createElement("div");
    layer.className = "aura-pipeline__dialog-layer";
    layer.innerHTML = `<button class="aura-pipeline__scrim" type="button" data-dialog-close aria-label="Cerrar"></button>
      <section class="aura-pipeline__dialog" role="dialog" aria-modal="true" aria-labelledby="aura-dialog-title" tabindex="-1">
        <header><div><p>${escapeHtml(eyebrow)}</p><h2 id="aura-dialog-title">${escapeHtml(title)}</h2></div><button type="button" data-dialog-close aria-label="Cerrar">×</button></header>
        <div class="aura-pipeline__dialog-body">${body}</div>${footer ? `<footer>${footer}</footer>` : ""}
      </section>`;
    layer.addEventListener("click", event => { if (event.target.closest("[data-dialog-close]")) closeDialog(); });
    layer.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); closeDialog(); }
    });
    documentRef.body.append(layer);
    documentRef.body.classList.add("aura-pipeline-dialog-open");
    state.dialog = layer;
    ready?.(layer);
    windowRef.requestAnimationFrame(() => layer.querySelector("[autofocus], input, textarea, select, button")?.focus());
    return layer;
  }

  function renderAuth() {
    const loading = state.status === "loading";
    root.innerHTML = `<section class="aura-pipeline__auth">
      <span class="aura-pipeline__auth-mark">F</span><p>PIPELINE</p>
      <h1>${loading ? "Recuperando tu operación" : state.status === "error" ? "No pudimos abrir tu Pipeline" : "Inicia sesión para ver tus prospectos"}</h1>
      <span>${loading ? "Comprobando sesión y datos productivos." : escapeHtml(state.error || "Tus prospectos permanecen protegidos.")}</span>
      ${loading ? '<div class="aura-pipeline__loader"></div>' : '<button class="aura-pipeline__primary" type="button" data-forge-auth-open>Iniciar sesión</button>'}
    </section>`;
    root.querySelector("[data-forge-auth-open]")?.addEventListener("click", () => {
      globalThis.ForgeAliveAuthEntry067G17B1?.openAuthPanel?.({ nav: "pipeline" });
    });
  }

  function render() {
    if (state.status !== "ready") return renderAuth();
    const visible = visibleCards();
    const filtered = state.filters.query || state.filters.source || state.filters.status;
    root.innerHTML = `<div class="aura-pipeline__page">
      <header class="aura-pipeline__topbar"><div><p>PIPELINE</p><h1>Prospectos</h1><span>${state.cards.length} en seguimiento</span></div>
        <button class="aura-pipeline__primary" type="button" data-aura-action="create">${icon("add")}<span>Nuevo prospecto</span></button></header>
      <section class="aura-pipeline__toolbar">
        <label class="aura-pipeline__search"><span>${icon("search")}</span><input data-filter-query type="search" value="${escapeHtml(state.filters.query)}" placeholder="Buscar prospecto"></label>
        <label><span>Fuente</span><select data-filter-source><option value="">Todas</option>${sourceOptions(state.filters.source)}</select></label>
        <label><span>Etapa</span><select data-filter-stage><option value="">Todas</option>${STAGES.map(stage => `<option value="${stage.value}" ${stage.value === state.filters.status ? "selected" : ""}>${stage.label}</option>`).join("")}</select></label>
        <div class="aura-pipeline__views"><button type="button" data-view="cards" aria-pressed="${state.view === "cards"}">${icon("cards")}<span>Tarjetas</span></button><button type="button" data-view="list" aria-pressed="${state.view === "list"}">${icon("list")}<span>Lista</span></button></div>
        <button class="aura-pipeline__clear" type="button" data-clear-filters ${filtered ? "" : "disabled"}>Limpiar</button><p>${visible.length} de ${state.cards.length}</p>
      </section>
      <p class="aura-pipeline__live" data-aura-live aria-live="polite"></p>
      ${state.cards.length === 0 ? `<section class="aura-pipeline__empty"><h2>Tu Pipeline está listo</h2><p>Agrega el primer prospecto para comenzar.</p><button class="aura-pipeline__primary" type="button" data-aura-action="create">${icon("add")}<span>Agregar prospecto</span></button></section>`
        : visible.length === 0 ? `<section class="aura-pipeline__empty"><h2>No encontramos coincidencias</h2><p>Ajusta la búsqueda o limpia los filtros.</p><button class="aura-pipeline__secondary" type="button" data-clear-filters>Limpiar filtros</button></section>`
        : state.view === "cards" ? `<section class="aura-pipeline__cards">${visible.map(cardMarkup).join("")}</section>`
        : `<section class="aura-pipeline__list" role="table"><div class="aura-pipeline__list-head" role="row"><span>Prospecto</span><span>Etapa</span><span>Última actividad</span><span>Próximo compromiso</span><span>Acciones</span></div><div role="rowgroup">${visible.map(rowMarkup).join("")}</div></section>`}
    </div>`;
  }

  async function changeStage(select) {
    const card = cardById(select.dataset.auraStageSelect);
    if (!card || select.value === card.status) return;
    const previous = card.status;
    select.disabled = true;
    select.setAttribute("aria-busy", "true");
    try {
      const bootstrap = await waitForBootstrap(windowRef);
      const client = await bootstrap.getClient();
      const authority = await stageAuthority();
      const confirmed = await authority.requestStageTransition({ client, prospectId: card.id, status: select.value });
      state.cards = await state.adapter.reload();
      const next = cardById(card.id);
      if (!next || next.status !== confirmed.status) throw new Error("AURA_STAGE_CONFIRMATION_MISMATCH");
      const node = root.querySelector(`[data-aura-record="${CSS.escape(card.id)}"]`);
      if (node) {
        node.dataset.auraStage = next.status;
        node.querySelector("[data-aura-stage-label]").textContent = next.stageLabel;
        const activeSelect = node.querySelector("[data-aura-stage-select]");
        activeSelect.value = next.status;
        activeSelect.disabled = false;
        activeSelect.removeAttribute("aria-busy");
      }
      announce(`Etapa actualizada a ${next.stageLabel}.`);
    } catch (error) {
      select.value = previous;
      select.disabled = false;
      select.removeAttribute("aria-busy");
      select.setAttribute("aria-invalid", "true");
      announce(humanError(error, "Supabase no confirmó el cambio de etapa."), true);
    }
  }

  function createDialog(trigger) {
    openDialog({ title: "Nuevo prospecto", trigger,
      body: `<form class="aura-pipeline__form" data-create-form><label><span>Nombre *</span><input name="fullName" required autofocus></label><label><span>Teléfono *</span><input name="phone" type="tel" required></label><label><span>Fuente *</span><select name="source" required><option value="">Selecciona</option>${sourceOptions()}</select></label><label class="wide"><span>Contexto inicial *</span><textarea name="initialContext" rows="4" required></textarea></label><p data-form-error role="alert" hidden></p></form>`,
      footer: '<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button><button class="aura-pipeline__primary" type="button" data-create-save>Guardar</button>',
      ready(dialog) {
        const form = dialog.querySelector("[data-create-form]");
        dialog.querySelector("[data-create-save]").addEventListener("click", async () => {
          const values = new FormData(form); const errorNode = dialog.querySelector("[data-form-error]");
          try {
            await state.adapter.createProspect({ fullName: String(values.get("fullName") || "").trim(), phone: String(values.get("phone") || "").trim(), source: String(values.get("source") || "").trim(), status: "referred_new", initialContext: String(values.get("initialContext") || "").trim() });
            state.cards = await state.adapter.reload(); closeDialog({ restore: false }); render(); announce("Prospecto guardado.");
          } catch (error) { errorNode.textContent = humanError(error, "No pudimos guardar el prospecto."); errorNode.hidden = false; }
        });
      },
    });
  }

  function editDialog(card, trigger) {
    const prospect = card.prospect || {};
    openDialog({ title: `Editar ${card.fullName}`, trigger,
      body: `<form class="aura-pipeline__form" data-edit-form><label><span>Nombre *</span><input name="fullName" required autofocus value="${escapeHtml(prospect.fullName || card.fullName)}"></label><label><span>Teléfono *</span><input name="phone" type="tel" required value="${escapeHtml(prospect.phone || prospect.whatsapp || card.phone || "")}"></label><label><span>Fuente *</span><select name="source">${sourceOptions(prospect.source || card.sourceValue)}</select></label><label class="wide"><span>Contexto inicial *</span><textarea name="initialContext" rows="4">${escapeHtml(prospect.initialContext || "")}</textarea></label><p data-form-error role="alert" hidden></p></form>`,
      footer: '<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button><button class="aura-pipeline__primary" type="button" data-edit-save>Guardar cambios</button>',
      ready(dialog) {
        dialog.querySelector("[data-edit-save]").addEventListener("click", async () => {
          const values = new FormData(dialog.querySelector("[data-edit-form]")); const errorNode = dialog.querySelector("[data-form-error]");
          try {
            const changes = { fullName: String(values.get("fullName") || "").trim(), phone: String(values.get("phone") || "").trim(), source: String(values.get("source") || "").trim(), initialContext: String(values.get("initialContext") || "").trim(), status: card.status };
            await state.adapter.service.updateProspect(card.id, changes); const confirmed = await state.adapter.service.getProspect(card.id);
            if (confirmed?.fullName !== changes.fullName) throw new Error("AURA_EDIT_CONFIRMATION_MISMATCH");
            state.cards = await state.adapter.reload(); closeDialog({ restore: false }); render(); announce("Prospecto actualizado.");
          } catch (error) { errorNode.textContent = humanError(error, "No pudimos actualizar el prospecto."); errorNode.hidden = false; }
        });
      },
    });
  }

  function archiveDialog(card, trigger) {
    openDialog({ title: `Retirar a ${card.fullName}`, eyebrow: "PIPELINE · ARCHIVO", trigger,
      body: '<p>El prospecto saldrá del Pipeline, pero su historial se conservará.</p><label class="aura-pipeline__field"><span>Motivo</span><input data-archive-reason value="Retirado desde Pipeline"></label><p data-form-error role="alert" hidden></p>',
      footer: '<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button><button class="aura-pipeline__danger" type="button" data-archive-confirm>Retirar</button>',
      ready(dialog) {
        dialog.querySelector("[data-archive-confirm]").addEventListener("click", async () => {
          const errorNode = dialog.querySelector("[data-form-error]");
          try {
            await state.adapter.service.archiveProspect(card.id, dialog.querySelector("[data-archive-reason]").value.trim());
            state.cards = await state.adapter.reload(); if (state.cards.some(item => item.id === card.id)) throw new Error("AURA_ARCHIVE_CONFIRMATION_MISMATCH");
            closeDialog({ restore: false }); render(); announce("Prospecto retirado del Pipeline.");
          } catch (error) { errorNode.textContent = humanError(error, "No pudimos retirar el prospecto."); errorNode.hidden = false; }
        });
      },
    });
  }

  async function timelineDialog(card, trigger) {
    const timeline = await state.adapter.timelineService.listProspectTimeline(card.id);
    const items = timeline.length ? `<ol class="aura-pipeline__timeline">${timeline.map(item => `<li><span></span><div><strong>${escapeHtml(eventLabel(item.eventType))}</strong><time>${escapeHtml(formatDate(item.occurredAt || item.recordedAt))}</time><p>${escapeHtml(item.payload?.outcome || item.payload?.decisionCode || item.payload?.objectionCode || "Evento productivo confirmado")}</p></div></li>`).join("")}</ol>` : "<p>No hay actividad registrada.</p>";
    openDialog({ title: card.fullName, eyebrow: "PIPELINE · TIMELINE", trigger, body: `<section class="aura-pipeline__context"><h3>Contexto inicial</h3><p>${escapeHtml(card.prospect?.initialContext || "Sin contexto inicial registrado.")}</p></section>${items}` });
  }

  function calendarDialog(card, trigger) {
    openDialog({ title: `Cita con ${card.fullName}`, eyebrow: "PIPELINE · AGENDA", trigger,
      body: '<div class="aura-pipeline__form"><label><span>Fecha</span><input type="date" data-calendar-date required></label><label><span>Hora</span><input type="time" data-calendar-time value="10:00" required></label><label><span>Duración</span><select data-calendar-duration><option value="30">30 min</option><option value="45" selected>45 min</option><option value="60">60 min</option></select></label><p class="wide">Forge prepara el borrador; tú lo guardas en Google Calendar.</p></div>',
      footer: '<button class="aura-pipeline__secondary" type="button" data-dialog-close>Cancelar</button><a class="aura-pipeline__primary" data-calendar-open target="_blank" rel="noopener noreferrer">Abrir Google Calendar</a>',
      ready(dialog) {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10); dialog.querySelector("[data-calendar-date]").value = tomorrow;
        const update = () => {
          const date = dialog.querySelector("[data-calendar-date]").value; const time = dialog.querySelector("[data-calendar-time]").value; const duration = Number(dialog.querySelector("[data-calendar-duration]").value);
          const start = new Date(`${date}T${time}:00`); if (!Number.isFinite(start.getTime())) return; const end = new Date(start.getTime() + duration * 60000);
          const compact = value => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
          const params = new URLSearchParams({ action: "TEMPLATE", text: `Cita con ${card.fullName}`, dates: `${compact(start)}/${compact(end)}`, ctz: "America/Mexico_City", details: `Prospecto: ${card.fullName}\nEtapa: ${card.stageLabel}\nFuente: ${card.sourceSummary}\n\nRevisa antes de guardar.` });
          dialog.querySelector("[data-calendar-open]").href = `https://calendar.google.com/calendar/render?${params}`;
        };
        dialog.querySelectorAll("input,select").forEach(control => control.addEventListener("change", update)); update();
      },
    });
  }

  async function whatsappDialog(card, trigger) {
    const dialog = openDialog({ title: `WhatsApp para ${card.fullName}`, eyebrow: "PIPELINE · WHATSAPP", trigger, body: '<div class="aura-pipeline__loading"><div class="aura-pipeline__loader"></div><p>Preparando borrador gobernado.</p></div>' });
    try {
      const prepared = await state.adapter.prepareMessage(card.prospect); if (state.dialog !== dialog) return;
      const text = prepared.candidate?.rawText || prepared.candidate?.text || "";
      dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `<p class="aura-pipeline__notice">${escapeHtml(prepared.sourceMode)} · Sin envío automático.</p><label class="aura-pipeline__field"><span>Mensaje editable</span><textarea data-wa-text rows="7">${escapeHtml(text)}</textarea></label><p data-form-error role="alert" hidden></p><button class="aura-pipeline__primary" type="button" data-wa-approve>Revisar y habilitar WhatsApp</button><a class="aura-pipeline__primary" data-wa-open hidden target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>`;
      dialog.querySelector("[data-wa-approve]").addEventListener("click", () => {
        const value = dialog.querySelector("[data-wa-text]").value.trim(); const safety = globalThis.ForgeDraftSafetyBoundaryNFAST06; const nav = globalThis.ForgeProductiveContactNavigationBoundary067G17B;
        const validation = safety?.draftSafetyValidator?.({ draftText: value, draftCandidateSnapshot: { rawText: value, sendsMessage: false, sourceMutable: true }, humanApproval: { required: true, finalAuthority: "HUMAN" } });
        const approval = safety?.approveExactDraft?.({ draftText: value, validationResult: validation, humanDecision: safety.EXPLICIT_DRAFT_APPROVAL });
        const gate = safety?.exactDraftHumanApprovalGate?.({ draftText: value, validationResult: validation, approvalSnapshot: approval });
        const url = gate?.exactDraftApproved ? nav?.whatsappUrl?.(card.prospect, "professional", value) : null; const link = dialog.querySelector("[data-wa-open]"); const errorNode = dialog.querySelector("[data-form-error]");
        if (!url) { errorNode.textContent = "El mensaje no pasó la validación."; errorNode.hidden = false; return; } link.href = url; link.hidden = false; errorNode.hidden = true;
      });
    } catch (error) { dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `<p role="alert">${escapeHtml(humanError(error, "No pudimos preparar el mensaje."))}</p>`; }
  }

  function combatDialog(card, trigger) {
    openDialog({ title: card.fullName, eyebrow: "NASH COMBAT", trigger, body: '<label class="aura-pipeline__field"><span>Objeción escuchada</span><textarea data-combat-text rows="4"></textarea></label><button class="aura-pipeline__primary" type="button" data-combat-run>Analizar</button><div data-combat-result></div>', ready(dialog) {
      dialog.querySelector("[data-combat-run]").addEventListener("click", async () => {
        const result = dialog.querySelector("[data-combat-result]");
        try { const combat = await state.adapter.analyzeCombat(card.prospect, dialog.querySelector("[data-combat-text]").value); result.innerHTML = `<section class="aura-pipeline__context"><h3>Lectura candidata</h3><p><strong>Tipo:</strong> ${escapeHtml(combat.classification?.type || "No disponible")}</p><p><strong>Intención:</strong> ${escapeHtml(combat.classification?.intent || "No disponible")}</p><p><strong>Estrategia:</strong> ${escapeHtml(combat.psychology?.recommendedStrategy || "No disponible")}</p></section>`; }
        catch (error) { result.innerHTML = `<p role="alert">${escapeHtml(humanError(error, "No pudimos analizar la objeción."))}</p>`; }
      });
    } });
  }

  async function nbaDialog(card, trigger) {
    const dialog = openDialog({ title: card.fullName, eyebrow: "SIGUIENTE MEJOR ACCIÓN", trigger, body: '<div class="aura-pipeline__loading"><div class="aura-pipeline__loader"></div></div>' });
    try { const nba = await state.adapter.buildNba(card); if (state.dialog !== dialog) return; const text = value => Array.isArray(value) ? value.join(", ") : value && typeof value === "object" ? Object.values(value).filter(Boolean).join(" · ") : String(value || "No disponible"); dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `<section class="aura-pipeline__context"><h3>Acción candidata</h3><p>${escapeHtml(text(nba.recommendedAction))}</p><h3>Reason Why</h3><p>${escapeHtml(text(nba.reasonWhy))}</p><h3>Por qué ahora</h3><p>${escapeHtml(text(nba.whyNow))}</p></section><p class="aura-pipeline__notice">Revisión humana requerida. No se ejecutó ninguna acción.</p>`; }
    catch (error) { dialog.querySelector(".aura-pipeline__dialog-body").innerHTML = `<p role="alert">${escapeHtml(humanError(error, "No pudimos construir la recomendación."))}</p>`; }
  }

  async function act(action, trigger) {
    const card = cardById(trigger.dataset.id); closeMenus();
    if (action === "create") return createDialog(trigger); if (!card) return;
    if (action === "edit") return editDialog(card, trigger); if (action === "archive") return archiveDialog(card, trigger);
    if (action === "timeline") return timelineDialog(card, trigger); if (action === "calendar") return calendarDialog(card, trigger);
    if (action === "whatsapp") return whatsappDialog(card, trigger); if (action === "combat") return combatDialog(card, trigger);
    if (action === "nba") return nbaDialog(card, trigger);
  }

  root.addEventListener("click", event => {
    const view = event.target.closest("[data-view]"); if (view) { state.view = view.dataset.view; writeView(windowRef, state.view); render(); return; }
    if (event.target.closest("[data-clear-filters]")) { state.filters = { query: "", source: "", status: "" }; render(); return; }
    const trigger = event.target.closest("[data-aura-action]"); if (!trigger) return; const action = trigger.dataset.auraAction;
    if (action === "more") { const menu = root.querySelector(`[data-aura-menu="${CSS.escape(trigger.dataset.id)}"]`); const open = menu?.hidden !== false; closeMenus(); if (open && menu) { menu.hidden = false; trigger.setAttribute("aria-expanded", "true"); menu.querySelector("[role=menuitem]")?.focus(); } return; }
    void act(action, trigger);
  });
  root.addEventListener("input", event => { if (event.target.matches("[data-filter-query]")) { state.filters.query = event.target.value; render(); } });
  root.addEventListener("change", event => {
    if (event.target.matches("[data-filter-source]")) { state.filters.source = event.target.value; render(); }
    else if (event.target.matches("[data-filter-stage]")) { state.filters.status = event.target.value; render(); }
    else if (event.target.matches("[data-aura-stage-select]")) void changeStage(event.target);
  });
  documentRef.addEventListener("click", event => { if (!event.target.closest("[data-aura-actions]")) closeMenus(); });
  documentRef.addEventListener("keydown", event => { if (event.key === "Escape" && !state.dialog) closeMenus({ restore: true }); });

  async function load() {
    const revision = ++state.revision; state.status = "loading"; state.error = ""; render();
    try {
      const bootstrap = await waitForBootstrap(windowRef); const session = await bootstrap?.getSession?.();
      if (!session?.data?.session?.user?.id) { state.status = "anonymous"; state.cards = []; state.adapter = null; render(); return; }
      const adapter = await adapterFactory(); const cards = await adapter.reload(); if (revision !== state.revision) return;
      state.adapter = adapter; state.cards = cards; state.status = "ready"; render();
    } catch (error) { if (revision !== state.revision) return; state.status = "error"; state.error = humanError(error, "No pudimos cargar el Pipeline productivo."); render(); }
  }

  windowRef.addEventListener("forge:auth-state-changed", event => {
    const status = String(event.detail?.status || "").toLowerCase();
    if (status === "authenticated") void load();
    else if (["anonymous", "auth_error"].includes(status)) { state.revision += 1; state.cards = []; state.adapter = null; state.status = status === "auth_error" ? "error" : "anonymous"; state.error = status === "auth_error" ? "No pudimos recuperar tu sesión." : ""; closeDialog({ restore: false }); render(); }
  });

  const api = Object.freeze({
    id: "pipeline", root, designAuthority: DESIGN_AUTHORITY,
    mount() { root.hidden = false; root.dataset.moduleActive = "true"; if (!state.mounted) { state.mounted = true; void load(); } shell?.syncVisualViewport?.(); },
    reconcile() { root.hidden = false; root.dataset.moduleActive = "true"; },
    unmount() { root.hidden = true; root.dataset.moduleActive = "false"; closeMenus(); closeDialog({ restore: false }); },
    refresh: load,
    diagnostics: () => Object.freeze({ renderer: "cleanroom", designAuthority: DESIGN_AUTHORITY, material3DesignUsed: false, view: state.view, records: state.cards.length, status: state.status }),
  });
  root[STATE_KEY] = api;
  return api;
}
