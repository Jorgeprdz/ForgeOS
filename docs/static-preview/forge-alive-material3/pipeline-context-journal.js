import { createProductiveIntelligenceAdapter } from "./pipeline-productive-intelligence-adapter.js?v=pipeline-context-journal-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const TRIGGER_SELECTOR = "[data-view-productive-context]";
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.context-journal");
const sourceLayout = import.meta.url.includes("/docs/static-preview/");
const journalServiceUrl = new URL(
  sourceLayout
    ? "../../../advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js"
    : "../../advisor-os/sales-pipeline/prospect-journal/prospect-journal-service.js",
  import.meta.url,
);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function dateValue(value) {
  const time = Date.parse(value || "");
  return Number.isFinite(time) ? time : 0;
}

function formatDate(value) {
  if (!dateValue(value)) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function eventLabel(eventType) {
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
    STAGE_CHANGED: "Estado actualizado",
    PROSPECT_ARCHIVED: "Prospecto archivado",
  })[eventType] || "Actividad registrada";
}

export function buildJournalHistory({ entries = [], timeline = [] }) {
  const notes = entries.map(entry => Object.freeze({
    kind: "note",
    id: entry.id,
    occurredAt: entry.createdAt,
    title: entry.captureMethod === "voice" ? "Nota dictada" : "Nota escrita",
    content: entry.content,
    captureMethod: entry.captureMethod,
  }));
  const events = timeline
    .filter(event => !String(event.sourceRecordReference || "").startsWith("JOURNAL:"))
    .map(event => Object.freeze({
      kind: "event",
      id: event.id,
      occurredAt: event.occurredAt || event.recordedAt,
      title: eventLabel(event.eventType),
      content: event.payload?.outcome || event.payload?.decisionCode || event.payload?.objectionCode || "Evento productivo confirmado",
    }));
  return Object.freeze([...notes, ...events].sort((a, b) => dateValue(b.occurredAt) - dateValue(a.occurredAt)));
}

export function assertJournalTimelineLinked({ entry, timeline }) {
  const reference = `JOURNAL:${entry?.id || ""}`;
  const linked = Boolean(entry?.id) && (timeline || []).some(event =>
    event.sourceRecordReference === reference
    && event.eventType === "CONVERSATION_RECORDED"
  );
  if (linked) return entry;
  const error = new Error("PROSPECT_JOURNAL_TIMELINE_LINK_MISSING");
  error.code = "PROSPECT_JOURNAL_TIMELINE_LINK_MISSING";
  error.details = Object.freeze({ entryId: entry?.id || null, reference });
  throw error;
}

function ensureStyles(documentRef) {
  if (documentRef.querySelector("[data-pipeline-context-journal-styles]")) return;
  const style = documentRef.createElement("style");
  style.dataset.pipelineContextJournalStyles = "true";
  style.textContent = `
    .pipeline-context-journal__summary,
    .pipeline-context-journal__composer,
    .pipeline-context-journal__history-item {
      border: 1px solid rgba(184, 211, 255, .18);
      border-radius: 18px;
      background: rgba(9, 27, 51, .62);
    }
    .pipeline-context-journal__summary,
    .pipeline-context-journal__composer { padding: 16px; }
    .pipeline-context-journal__summary h3,
    .pipeline-context-journal__history h3 { margin: 0 0 8px; }
    .pipeline-context-journal__summary p { margin: 0; white-space: pre-wrap; line-height: 1.55; }
    .pipeline-context-journal__composer { display: grid; gap: 12px; }
    .pipeline-context-journal__composer textarea { min-height: 112px; resize: vertical; }
    .pipeline-context-journal__composer-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .pipeline-context-journal__composer-actions button { min-height: 44px; }
    .pipeline-context-journal__dictate[aria-pressed="true"] { color: #07111f; background: #9be8ff; }
    .pipeline-context-journal__history { display: grid; gap: 10px; }
    .pipeline-context-journal__history-list { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
    .pipeline-context-journal__history-item { padding: 14px; }
    .pipeline-context-journal__history-item header { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
    .pipeline-context-journal__history-item strong { color: #f4f7ff; }
    .pipeline-context-journal__history-item time { color: #aebfd8; font-size: .78rem; }
    .pipeline-context-journal__history-item p { margin: 8px 0 0; white-space: pre-wrap; line-height: 1.5; }
    .pipeline-context-journal__empty { margin: 0; color: #aebfd8; }
    .pipeline-context-journal__error { margin: 0; color: #ffb4ab; }
    [data-view-productive-context] { min-height: 40px; }
    @media (max-width: 600px) {
      .pipeline-context-journal__history-item header { display: grid; gap: 4px; }
      .pipeline-context-journal__composer-actions > * { flex: 1 1 140px; }
    }
  `;
  documentRef.head.append(style);
}

function ensureWorkspaceStyles(documentRef) {
  const existing = documentRef.querySelector("[data-material3-referral-styles]");
  if (existing?.sheet) return Promise.resolve();
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const link = documentRef.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL("pipeline-referral-modal.css?v=pipeline-context-journal-001", import.meta.url);
    link.dataset.material3ReferralStyles = "true";
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", reject, { once: true });
    documentRef.head.append(link);
  });
}

function historyMarkup(history) {
  if (!history.length) return '<p class="pipeline-context-journal__empty">Aún no hay actividad adicional.</p>';
  return `<ol class="pipeline-context-journal__history-list">${history.map(item => `
    <li class="pipeline-context-journal__history-item" data-journal-history-kind="${item.kind}">
      <header><strong>${escapeHtml(item.title)}</strong><time datetime="${escapeHtml(item.occurredAt || "")}">${escapeHtml(formatDate(item.occurredAt))}</time></header>
      <p>${escapeHtml(item.content)}</p>
    </li>`).join("")}</ol>`;
}

function workspaceTemplate({ prospect, history, speechSupported, journalAvailable }) {
  return `
    <button class="referral-sheet__scrim" type="button" data-close-context-journal aria-label="Cerrar bitácora"></button>
    <section class="referral-sheet" role="dialog" aria-modal="true" aria-labelledby="context-journal-title">
      <header class="referral-sheet__header">
        <div><p>PIPELINE · CONTEXTO</p><h2 id="context-journal-title">Bitácora de ${escapeHtml(prospect.fullName)}</h2></div>
        <button class="referral-sheet__close" type="button" data-close-context-journal aria-label="Cerrar">×</button>
      </header>
      <div class="referral-sheet__body">
        <section class="pipeline-context-journal__summary" aria-labelledby="context-initial-title">
          <h3 id="context-initial-title">Contexto inicial</h3>
          <p>${escapeHtml(prospect.initialContext || "Sin contexto inicial registrado.")}</p>
        </section>
        <form class="pipeline-context-journal__composer" data-context-journal-form>
          <label><span>Nueva nota</span><textarea name="content" maxlength="4000" required autofocus placeholder="Escribe qué ocurrió, qué preocupa al prospecto y cuál es el siguiente paso."></textarea></label>
          <div class="pipeline-context-journal__composer-actions">
            <button class="pipeline-context-journal__dictate" type="button" data-dictate-journal-note aria-pressed="false" ${speechSupported && journalAvailable ? "" : "disabled"} title="${speechSupported ? "Dictar nota" : "El dictado no está disponible en este navegador"}">🎙 Dictar</button>
            <button type="submit" data-save-journal-note ${journalAvailable ? "" : "disabled"}>Guardar nota</button>
          </div>
          ${journalAvailable ? "" : '<p class="pipeline-context-journal__error" role="alert">La captura de notas aún no está desplegada en este entorno.</p>'}
          <p class="pipeline-context-journal__error" data-context-journal-error role="alert" hidden></p>
          <p role="status" aria-live="polite" data-context-journal-status></p>
        </form>
        <section class="pipeline-context-journal__history" aria-labelledby="context-history-title">
          <h3 id="context-history-title">Historial</h3>
          <div data-context-journal-history>${historyMarkup(history)}</div>
        </section>
      </div>
    </section>`;
}

function errorMessage(error) {
  if (error?.code === "VALIDATION_ERROR") return error.message;
  if (error?.code === "AUTH_REQUIRED") return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (error?.code === "PROSPECT_JOURNAL_NOT_DEPLOYED") return "La bitácora todavía no está desplegada en este entorno.";
  if (error?.code === "PROSPECT_JOURNAL_TIMELINE_LINK_MISSING") return "La nota se guardó, pero la última actividad no pudo confirmarse.";
  return "No pudimos guardar la nota. Revisa tu conexión e intenta nuevamente.";
}

export function installPipelineContextJournal(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  const windowRef = options.windowRef || documentRef?.defaultView || globalThis.window;
  if (!documentRef || !windowRef) return Object.freeze({ installed: false });
  if (documentRef[INSTALL_KEY]) return documentRef[INSTALL_KEY];

  ensureStyles(documentRef);
  let adapterPromise;
  let journalPromise;
  let activeLayer;
  let activeRecognition;
  let previousOverflow = "";
  let restoreSelector = null;

  const adapter = async () => {
    if (!adapterPromise) {
      adapterPromise = Promise.resolve(options.createAdapter
        ? options.createAdapter()
        : createProductiveIntelligenceAdapter());
    }
    return adapterPromise;
  };

  const journalService = async () => {
    if (!journalPromise) {
      journalPromise = (async () => {
        const value = await adapter();
        if (options.createJournalService) return options.createJournalService(value);
        if (!globalThis.ForgeProspectJournalServiceP7) {
          await import(`${journalServiceUrl.href}?v=pipeline-context-journal-001`);
        }
        const client = await globalThis.ForgeProductiveProspectBootstrap067G17B?.getClient?.();
        if (!client || !globalThis.ForgeProspectJournalServiceP7?.create) {
          const error = new Error("PROSPECT_JOURNAL_NOT_DEPLOYED");
          error.code = "PROSPECT_JOURNAL_NOT_DEPLOYED";
          throw error;
        }
        return globalThis.ForgeProspectJournalServiceP7.create(client);
      })();
    }
    return journalPromise;
  };

  const close = () => {
    activeRecognition?.abort?.();
    activeRecognition = undefined;
    if (!activeLayer) return false;
    activeLayer.remove();
    activeLayer = undefined;
    documentRef.documentElement.removeAttribute("data-forge-context-journal-open");
    documentRef.body.style.overflow = previousOverflow;
    if (restoreSelector) documentRef.querySelector(restoreSelector)?.focus();
    return true;
  };

  const synchronize = () => {
    documentRef.querySelectorAll(`${ROOT_SELECTOR} ${TRIGGER_SELECTOR}`).forEach(trigger => {
      const card = trigger.closest(CARD_SELECTOR);
      const name = card?.querySelector("[data-productive-card-identity] strong")?.textContent?.trim() || "prospecto";
      trigger.textContent = "Bitácora";
      trigger.setAttribute("aria-label", `Abrir bitácora de ${name}`);
      trigger.setAttribute("title", "Consultar contexto y registrar una nota");
    });
  };

  const refreshPipeline = async detail => {
    if (options.refresh) return options.refresh(detail);
    windowRef.dispatchEvent(new windowRef.CustomEvent("forge:auth-state-changed", {
      detail: { status: "authenticated", reason: "pipeline-context-journal-entry" },
    }));
  };

  const open = async (prospectId, trigger) => {
    await ensureWorkspaceStyles(documentRef);
    const productiveAdapter = await adapter();
    await productiveAdapter.reload();
    const card = productiveAdapter.cards.find(item => item.id === prospectId);
    const prospect = card?.prospect || await productiveAdapter.service.getProspect(prospectId);
    const timeline = card?.timeline || await productiveAdapter.timelineService.listProspectTimeline(prospectId);
    let entries = [];
    let journalAvailable = true;
    try {
      entries = await (await journalService()).listEntries(prospectId);
    } catch (error) {
      if (error?.code !== "PROSPECT_JOURNAL_NOT_DEPLOYED") throw error;
      journalAvailable = false;
    }
    const SpeechRecognition = options.SpeechRecognition
      || windowRef.SpeechRecognition
      || windowRef.webkitSpeechRecognition;
    const layer = documentRef.createElement("div");
    layer.className = "referral-sheet-layer";
    layer.dataset.pipelineContextJournal = prospectId;
    layer.innerHTML = workspaceTemplate({
      prospect,
      history: buildJournalHistory({ entries, timeline }),
      speechSupported: Boolean(SpeechRecognition),
      journalAvailable,
    });

    close();
    previousOverflow = documentRef.body.style.overflow;
    restoreSelector = `${TRIGGER_SELECTOR}[data-view-productive-context="${CSS.escape(prospectId)}"]`;
    activeLayer = layer;
    documentRef.body.append(layer);
    documentRef.body.style.overflow = "hidden";
    documentRef.documentElement.setAttribute("data-forge-context-journal-open", prospectId);

    const form = layer.querySelector("[data-context-journal-form]");
    const textarea = form.querySelector("textarea[name=content]");
    const dictate = form.querySelector("[data-dictate-journal-note]");
    const save = form.querySelector("[data-save-journal-note]");
    const errorNode = form.querySelector("[data-context-journal-error]");
    const statusNode = form.querySelector("[data-context-journal-status]");
    let captureMethod = "text";
    let dictationBase = "";

    layer.addEventListener("click", event => {
      if (event.target.closest("[data-close-context-journal]")) close();
    });

    if (SpeechRecognition && journalAvailable) {
      dictate.addEventListener("click", () => {
        if (activeRecognition) {
          activeRecognition.stop?.();
          return;
        }
        const recognition = new SpeechRecognition();
        activeRecognition = recognition;
        recognition.lang = "es-MX";
        recognition.interimResults = true;
        recognition.continuous = false;
        dictationBase = textarea.value.trim();
        recognition.onstart = () => {
          dictate.setAttribute("aria-pressed", "true");
          dictate.textContent = "Escuchando…";
          statusNode.textContent = "Dictado activo.";
        };
        recognition.onresult = event => {
          const transcript = Array.from(event.results || [])
            .map(result => result?.[0]?.transcript || "")
            .join(" ")
            .trim();
          textarea.value = [dictationBase, transcript].filter(Boolean).join(dictationBase ? " " : "");
          captureMethod = "voice";
          textarea.dispatchEvent(new windowRef.Event("input", { bubbles: true }));
        };
        recognition.onerror = () => {
          errorNode.hidden = false;
          errorNode.textContent = "No pudimos completar el dictado. Puedes escribir la nota.";
        };
        recognition.onend = () => {
          if (activeRecognition === recognition) activeRecognition = undefined;
          dictate.setAttribute("aria-pressed", "false");
          dictate.textContent = "🎙 Dictar";
          statusNode.textContent = captureMethod === "voice" ? "Dictado agregado a la nota." : "";
        };
        recognition.start();
      });
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const content = textarea.value.trim();
      if (!content) {
        errorNode.hidden = false;
        errorNode.textContent = "Escribe o dicta una nota antes de guardarla.";
        textarea.focus();
        return;
      }
      errorNode.hidden = true;
      save.disabled = true;
      dictate.disabled = true;
      statusNode.textContent = "Guardando nota…";
      try {
        const entry = await (await journalService()).appendEntry(prospectId, { content, captureMethod });
        await productiveAdapter.reload();
        const refreshedCard = productiveAdapter.cards.find(item => item.id === prospectId);
        const refreshedTimeline = refreshedCard?.timeline
          || await productiveAdapter.timelineService.listProspectTimeline(prospectId);
        assertJournalTimelineLinked({ entry, timeline: refreshedTimeline });
        entries = await (await journalService()).listEntries(prospectId);
        layer.querySelector("[data-context-journal-history]").innerHTML = historyMarkup(
          buildJournalHistory({ entries, timeline: refreshedTimeline }),
        );
        textarea.value = "";
        captureMethod = "text";
        statusNode.textContent = "Nota guardada y última actividad actualizada.";
        await refreshPipeline({ prospectId, entry, latestActivity: "Conversación registrada" });
        synchronize();
      } catch (error) {
        errorNode.hidden = false;
        errorNode.textContent = errorMessage(error);
        statusNode.textContent = "";
      } finally {
        save.disabled = false;
        dictate.disabled = !SpeechRecognition;
      }
    });

    requestAnimationFrame(() => textarea.focus());
  };

  const clickListener = event => {
    const trigger = event.target.closest?.(`${ROOT_SELECTOR} ${TRIGGER_SELECTOR}`);
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    void open(trigger.dataset.viewProductiveContext, trigger).catch(error => {
      const message = errorMessage(error);
      windowRef.dispatchEvent(new windowRef.CustomEvent("forge:pipeline-context-journal-error", {
        detail: { message, code: error?.code || "UNKNOWN" },
      }));
    });
  };

  documentRef.addEventListener("click", clickListener, true);
  const observer = new windowRef.MutationObserver(synchronize);
  observer.observe(documentRef.documentElement, { childList: true, subtree: true });
  synchronize();

  const api = Object.freeze({
    installed: true,
    synchronize,
    open,
    close,
    destroy() {
      observer.disconnect();
      documentRef.removeEventListener("click", clickListener, true);
      close();
      delete documentRef[INSTALL_KEY];
    },
  });
  documentRef[INSTALL_KEY] = api;
  documentRef.documentElement.dataset.pipelineContextJournal = "ready";
  return api;
}

if (typeof document !== "undefined") {
  installPipelineContextJournal(globalThis.__FORGE_PIPELINE_CONTEXT_JOURNAL_OPTIONS__ || {});
}
