import {
  createProductiveIntelligenceAdapter,
} from "./pipeline-productive-intelligence-adapter.js?v=pipeline-prospect-admin-001";

const ROOT_SELECTOR = "[data-forge-pipeline-module]";
const CARD_SELECTOR = "[data-productive-prospect-card]";
const IDENTITY_SELECTOR = "[data-productive-card-identity]";
const INSTALL_KEY = Symbol.for("forge.material3.pipeline.prospect-admin");
const STYLE_ID = "pipeline-prospect-admin-styles";
const SOURCES = Object.freeze([
  "Referido",
  "Mercado cálido",
  "Mercado frío",
  "Redes sociales",
  "Centro de influencia",
]);

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function comparable(value) {
  if (value === undefined || value === "") return null;
  return value;
}

export function assertProspectEditConfirmed({
  prospectId,
  updated,
  confirmed,
  changes,
}) {
  const keys = Object.keys(changes || {});
  const mismatch = !updated?.id
    || updated.id !== prospectId
    || !confirmed?.id
    || confirmed.id !== prospectId
    || keys.some(key => JSON.stringify(comparable(confirmed[key])) !== JSON.stringify(comparable(updated[key])));

  if (!mismatch) return confirmed;
  const error = new Error("PRODUCTIVE_PROSPECT_EDIT_PERSISTENCE_MISMATCH");
  error.code = "PRODUCTIVE_PROSPECT_EDIT_PERSISTENCE_MISMATCH";
  error.details = Object.freeze({ prospectId, keys });
  throw error;
}

export function assertProspectArchived({ prospectId, archived, visibleProspects }) {
  const stillVisible = (visibleProspects || []).some(prospect => prospect.id === prospectId);
  if (archived?.id === prospectId && archived.archivedAt && !stillVisible) return archived;
  const error = new Error("PRODUCTIVE_PROSPECT_ARCHIVE_PERSISTENCE_MISMATCH");
  error.code = "PRODUCTIVE_PROSPECT_ARCHIVE_PERSISTENCE_MISMATCH";
  error.details = Object.freeze({
    prospectId,
    archivedId: archived?.id || null,
    archivedAt: archived?.archivedAt || null,
    stillVisible,
  });
  throw error;
}

function ensureStyles(documentRef) {
  if (documentRef.getElementById(STYLE_ID)) return;
  const style = documentRef.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .pipeline-module__productive-name {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      min-width: 0;
    }

    .pipeline-module__productive-name > strong {
      flex: 1;
      min-width: 0;
    }

    .pipeline-module__identity-actions {
      display: flex;
      flex: 0 0 auto;
      gap: 6px;
    }

    .pipeline-module__identity-actions button {
      display: inline-grid;
      place-items: center;
      width: 44px;
      min-width: 44px;
      height: 44px;
      min-height: 44px;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--pipeline-stage-accent) 38%, transparent);
      border-radius: 14px;
      color: var(--forge-text-primary, #f4f7ff);
      background: color-mix(in srgb, var(--pipeline-stage-accent) 12%, transparent);
      cursor: pointer;
      touch-action: manipulation;
    }

    .pipeline-module__identity-actions button:hover,
    .pipeline-module__identity-actions button:focus-visible {
      background: color-mix(in srgb, var(--pipeline-stage-accent) 24%, transparent);
      outline: 2px solid color-mix(in srgb, var(--pipeline-stage-accent) 78%, white);
      outline-offset: 2px;
    }

    .pipeline-module__identity-actions [data-delete-productive-prospect] {
      color: #ffb4ab;
      border-color: color-mix(in srgb, #ffb4ab 42%, transparent);
      background: color-mix(in srgb, #ffb4ab 10%, transparent);
    }

    .pipeline-module__identity-actions svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      pointer-events: none;
    }

    .pipeline-module__archive-sheet .referral-sheet__body > p {
      margin: 0;
      line-height: 1.55;
    }

    .pipeline-module__archive-actions [data-confirm-archive-prospect] {
      color: #3a0907;
      background: #ffb4ab;
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
    link.href = new URL(
      "./pipeline-referral-modal.css?v=pipeline-prospect-admin-001",
      import.meta.url,
    );
    link.dataset.material3ReferralStyles = "true";
    link.addEventListener("load", resolve, { once: true });
    link.addEventListener("error", reject, { once: true });
    documentRef.head.append(link);
  });
}

function editPayload(form, prospect) {
  const values = new FormData(form);
  const text = name => String(values.get(name) || "").trim();
  const nullable = name => text(name) || null;
  const source = text("source");
  const contactKey = form.querySelector("[data-edit-contact]")?.dataset.editContact === "whatsapp"
    ? "whatsapp"
    : "phone";
  return {
    fullName: text("fullName"),
    [contactKey]: text("contact"),
    source,
    referrerName: source === "Referido" ? nullable("referrerName") : null,
    referrerRelationship: source === "Referido" ? nullable("referrerRelationship") : null,
    initialContext: text("initialContext"),
    email: nullable("email"),
    dateOfBirth: nullable("dateOfBirth"),
    occupation: nullable("occupation"),
    status: prospect.status,
  };
}

function editTemplate(prospect) {
  const value = name => escapeHtml(prospect[name] || "");
  const contactKey = prospect.phone ? "phone" : prospect.whatsapp ? "whatsapp" : "phone";
  const contact = prospect[contactKey] || "";
  const sources = [...new Set([...SOURCES, prospect.source].filter(Boolean))];
  return `
    <button class="referral-sheet__scrim" type="button" data-close-admin-workspace aria-label="Cerrar edición"></button>
    <section class="referral-sheet" role="dialog" aria-modal="true" aria-labelledby="edit-prospect-title">
      <form data-edit-prospect-form>
        <header class="referral-sheet__header">
          <div><p>PIPELINE</p><h2 id="edit-prospect-title">Editar prospecto</h2></div>
          <button class="referral-sheet__close" type="button" data-close-admin-workspace aria-label="Cerrar">×</button>
        </header>
        <div class="referral-sheet__body">
          <label><span>Nombre completo *</span><input name="fullName" value="${value("fullName")}" required autofocus autocomplete="name"></label>
          <label><span>Teléfono o WhatsApp *</span><input name="contact" type="tel" value="${escapeHtml(contact)}" required autocomplete="tel" data-edit-contact="${contactKey}"></label>
          <label><span>Fuente *</span><select name="source" required data-edit-prospect-source>
            <option value="">Selecciona una fuente</option>
            ${sources.map(source => `<option value="${escapeHtml(source)}" ${prospect.source === source ? "selected" : ""}>${escapeHtml(source)}</option>`).join("")}
          </select></label>
          <div class="referral-sheet__source-fields" data-edit-referral-fields ${prospect.source === "Referido" ? "" : "hidden"}>
            <label><span>Referido por</span><input name="referrerName" value="${value("referrerName")}"></label>
            <label><span>Relación con el referente</span><input name="referrerRelationship" value="${value("referrerRelationship")}"></label>
          </div>
          <label><span>Contexto inicial *</span><textarea name="initialContext" rows="4" required>${value("initialContext")}</textarea></label>
          <details class="referral-sheet__optional" ${prospect.email || prospect.dateOfBirth || prospect.occupation ? "open" : ""}>
            <summary>Datos adicionales</summary>
            <div>
              <label><span>Correo</span><input name="email" type="email" value="${value("email")}" autocomplete="email"></label>
              <label><span>Fecha de nacimiento</span><input name="dateOfBirth" type="date" value="${value("dateOfBirth")}"></label>
              <label><span>Ocupación</span><input name="occupation" value="${value("occupation")}" autocomplete="organization-title"></label>
            </div>
          </details>
          <p class="referral-sheet__error" data-prospect-admin-error role="alert" hidden></p>
        </div>
        <footer class="referral-sheet__footer"><button type="submit" data-save-prospect-edit>Guardar cambios</button></footer>
      </form>
    </section>`;
}

function archiveTemplate(prospect) {
  return `
    <button class="referral-sheet__scrim" type="button" data-close-admin-workspace aria-label="Cancelar eliminación"></button>
    <section class="referral-sheet pipeline-module__archive-sheet" role="alertdialog" aria-modal="true" aria-labelledby="archive-prospect-title" aria-describedby="archive-prospect-description">
      <header class="referral-sheet__header">
        <div><p>PIPELINE</p><h2 id="archive-prospect-title">Eliminar prospecto</h2></div>
        <button class="referral-sheet__close" type="button" data-close-admin-workspace aria-label="Cancelar">×</button>
      </header>
      <div class="referral-sheet__body">
        <p id="archive-prospect-description"><strong>${escapeHtml(prospect.fullName)}</strong> se retirará del Pipeline y quedará archivado. No se borrará su historial.</p>
        <label><span>Motivo</span><input data-archive-prospect-reason value="Retirado desde Pipeline" maxlength="160" autofocus></label>
        <p class="referral-sheet__error" data-prospect-admin-error role="alert" hidden></p>
      </div>
      <footer class="referral-sheet__footer pipeline-module__archive-actions">
        <button type="button" data-close-admin-workspace>Cancelar</button>
        <button type="button" data-confirm-archive-prospect>Eliminar del Pipeline</button>
      </footer>
    </section>`;
}

function announce(documentRef, message) {
  let node = documentRef.querySelector("[data-pipeline-admin-status]");
  if (!node) {
    node = documentRef.createElement("p");
    node.dataset.pipelineAdminStatus = "true";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)";
    documentRef.body.append(node);
  }
  node.textContent = "";
  queueMicrotask(() => { node.textContent = message; });
}

function waitFor(documentRef, predicate, timeout = 3000) {
  if (predicate()) return Promise.resolve(true);
  return new Promise(resolve => {
    const Observer = documentRef.defaultView?.MutationObserver;
    if (!Observer) {
      resolve(false);
      return;
    }
    const observer = new Observer(() => {
      if (!predicate()) return;
      observer.disconnect();
      clearTimeout(timer);
      resolve(true);
    });
    observer.observe(documentRef.documentElement, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
}

export function installPipelineProspectAdmin(options = {}) {
  const documentRef = options.documentRef || globalThis.document;
  const windowRef = options.windowRef || documentRef?.defaultView || globalThis.window;
  if (!documentRef || !windowRef) return Object.freeze({ installed: false });

  const existingRoot = documentRef.querySelector(ROOT_SELECTOR);
  if (existingRoot?.[INSTALL_KEY]) return existingRoot[INSTALL_KEY];

  ensureStyles(documentRef);
  let root = existingRoot;
  let adapterPromise;
  let activeLayer;
  let previousOverflow = "";
  let escapeListener;
  let rootObserver;
  let documentObserver;

  const adapter = async () => {
    if (!adapterPromise) adapterPromise = Promise.resolve(
      options.createAdapter ? options.createAdapter() : createProductiveIntelligenceAdapter(),
    );
    return adapterPromise;
  };

  const service = async () => {
    const value = await adapter();
    if (!value?.service) throw new Error("PRODUCTIVE_PROSPECT_SERVICE_UNAVAILABLE");
    return value.service;
  };

  const close = ({ restore = true, selector = null } = {}) => {
    if (!activeLayer) return false;
    activeLayer.remove();
    activeLayer = undefined;
    documentRef.documentElement.removeAttribute("data-forge-prospect-admin-open");
    documentRef.body.style.overflow = previousOverflow;
    if (escapeListener) {
      documentRef.removeEventListener("keydown", escapeListener);
      escapeListener = undefined;
    }
    if (restore && selector) documentRef.querySelector(selector)?.focus();
    return true;
  };

  const open = async ({ layer, kind, trigger }) => {
    await ensureWorkspaceStyles(documentRef);
    close({ restore: false });
    previousOverflow = documentRef.body.style.overflow;
    activeLayer = layer;
    layer.dataset.pipelineProspectAdminWorkspace = kind;
    layer.addEventListener("click", event => {
      if (event.target.closest("[data-close-admin-workspace]")) {
        close({ selector: trigger.dataset.adminFocusSelector });
      }
    });
    escapeListener = event => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close({ selector: trigger.dataset.adminFocusSelector });
    };
    documentRef.addEventListener("keydown", escapeListener);
    documentRef.body.append(layer);
    documentRef.body.style.overflow = "hidden";
    documentRef.documentElement.setAttribute("data-forge-prospect-admin-open", kind);
    requestAnimationFrame(() => layer.querySelector("[autofocus], input, textarea, select, button")?.focus());
  };

  const refresh = async ({ type, prospectId, expectedName }) => {
    if (options.refresh) {
      await options.refresh({ type, prospectId, expectedName });
      synchronize();
      return;
    }
    windowRef.dispatchEvent(new windowRef.CustomEvent("forge:auth-state-changed", {
      detail: { status: "authenticated", reason: `pipeline-prospect-${type}` },
    }));
    await waitFor(documentRef, () => {
      const card = documentRef.querySelector(`[data-productive-prospect-card="${CSS.escape(prospectId)}"]`);
      return type === "archive"
        ? !card
        : card?.querySelector(IDENTITY_SELECTOR)?.textContent.includes(expectedName);
    });
    synchronize();
  };

  const openEdit = async trigger => {
    const prospectId = trigger.dataset.editProductiveProspect;
    const productiveService = await service();
    const prospect = await productiveService.getProspect(prospectId);
    const layer = documentRef.createElement("div");
    layer.className = "referral-sheet-layer";
    layer.innerHTML = editTemplate(prospect);
    const form = layer.querySelector("[data-edit-prospect-form]");
    const source = form.querySelector("[data-edit-prospect-source]");
    const referralFields = form.querySelector("[data-edit-referral-fields]");
    const syncReferralFields = () => {
      const referred = source.value === "Referido";
      referralFields.hidden = !referred;
      if (!referred) referralFields.querySelectorAll("input").forEach(input => { input.value = ""; });
    };
    source.addEventListener("change", syncReferralFields);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const submit = form.querySelector("[data-save-prospect-edit]");
      const errorNode = form.querySelector("[data-prospect-admin-error]");
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");
      errorNode.hidden = true;
      try {
        const changes = editPayload(form, prospect);
        const updated = await productiveService.updateProspect(prospectId, changes);
        const confirmed = await productiveService.getProspect(prospectId);
        assertProspectEditConfirmed({ prospectId, updated, confirmed, changes });
        close({ restore: false });
        await refresh({ type: "edit", prospectId, expectedName: confirmed.fullName });
        documentRef.querySelector(`[data-edit-productive-prospect="${CSS.escape(prospectId)}"]`)?.focus();
        announce(documentRef, "Prospecto actualizado.");
      } catch (error) {
        errorNode.textContent = error?.message || "No pudimos actualizar el prospecto.";
        errorNode.hidden = false;
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
      }
    });
    await open({ layer, kind: "edit", trigger });
  };

  const openArchive = async trigger => {
    const prospectId = trigger.dataset.deleteProductiveProspect;
    const productiveService = await service();
    const prospect = await productiveService.getProspect(prospectId);
    const layer = documentRef.createElement("div");
    layer.className = "referral-sheet-layer";
    layer.innerHTML = archiveTemplate(prospect);
    const confirm = layer.querySelector("[data-confirm-archive-prospect]");
    confirm.addEventListener("click", async () => {
      const errorNode = layer.querySelector("[data-prospect-admin-error]");
      const reason = layer.querySelector("[data-archive-prospect-reason]").value.trim()
        || "Retirado desde Pipeline";
      confirm.disabled = true;
      confirm.setAttribute("aria-busy", "true");
      errorNode.hidden = true;
      try {
        const archived = await productiveService.archiveProspect(prospectId, reason);
        const visibleProspects = await productiveService.listProspects();
        assertProspectArchived({ prospectId, archived, visibleProspects });
        close({ restore: false });
        await refresh({ type: "archive", prospectId });
        documentRef.querySelector("[data-pipeline-create-referral], [data-edit-productive-prospect]")?.focus();
        announce(documentRef, "Prospecto retirado del Pipeline.");
      } catch (error) {
        errorNode.textContent = error?.message || "No pudimos retirar el prospecto.";
        errorNode.hidden = false;
        confirm.disabled = false;
        confirm.removeAttribute("aria-busy");
      }
    });
    await open({ layer, kind: "archive", trigger });
  };

  const enhanceCard = card => {
    const prospectId = card.dataset.productiveProspectCard;
    const identity = card.querySelector(IDENTITY_SELECTOR);
    const name = identity?.querySelector(":scope > strong, .pipeline-module__productive-name > strong");
    if (!prospectId || !identity || !name) return;

    let wrapper = identity.querySelector(":scope > .pipeline-module__productive-name");
    if (!wrapper) {
      wrapper = documentRef.createElement("div");
      wrapper.className = "pipeline-module__productive-name";
      identity.insertBefore(wrapper, identity.firstChild);
      wrapper.append(name);
    }

    let actions = wrapper.querySelector(".pipeline-module__identity-actions");
    if (!actions) {
      actions = documentRef.createElement("div");
      actions.className = "pipeline-module__identity-actions";
      actions.setAttribute("role", "group");
      wrapper.append(actions);
    }

    const fullName = name.textContent.trim();
    actions.setAttribute("aria-label", `Administrar ${fullName}`);
    if (!actions.querySelector("[data-edit-productive-prospect]")) {
      const edit = documentRef.createElement("button");
      edit.type = "button";
      edit.dataset.editProductiveProspect = prospectId;
      edit.dataset.adminFocusSelector = `[data-edit-productive-prospect="${prospectId}"]`;
      edit.title = "Editar prospecto";
      edit.setAttribute("aria-label", `Editar prospecto ${fullName}`);
      edit.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V20h3.5L18.35 9.15l-3.5-3.5L4 16.5Zm16.7-9.7a1 1 0 0 0 0-1.4l-2.1-2.1a1 1 0 0 0-1.4 0l-1.65 1.65 3.5 3.5L20.7 6.8Z"/></svg>';
      edit.addEventListener("click", () => void openEdit(edit));
      actions.append(edit);
    }
    if (!actions.querySelector("[data-delete-productive-prospect]")) {
      const remove = documentRef.createElement("button");
      remove.type = "button";
      remove.dataset.deleteProductiveProspect = prospectId;
      remove.dataset.adminFocusSelector = `[data-delete-productive-prospect="${prospectId}"]`;
      remove.title = "Eliminar prospecto";
      remove.setAttribute("aria-label", `Eliminar prospecto ${fullName}`);
      remove.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 21a2 2 0 0 1-2-2V7h14v12a2 2 0 0 1-2 2H7Zm10-17h-3.5l-1-1h-3l-1 1H5v2h12V4Z"/></svg>';
      remove.addEventListener("click", () => void openArchive(remove));
      actions.append(remove);
    }
  };

  function synchronize() {
    if (!root?.isConnected) root = documentRef.querySelector(ROOT_SELECTOR);
    if (!root) return;
    root.querySelectorAll(CARD_SELECTOR).forEach(enhanceCard);
    documentRef.documentElement.dataset.pipelineProspectAdmin = "ready";
  }

  const observeRoot = () => {
    if (!root || rootObserver) return;
    const Observer = windowRef.MutationObserver;
    rootObserver = new Observer(() => queueMicrotask(synchronize));
    rootObserver.observe(root, { childList: true, subtree: true });
    synchronize();
  };

  if (root) observeRoot();
  else {
    const Observer = windowRef.MutationObserver;
    documentObserver = new Observer(() => {
      root = documentRef.querySelector(ROOT_SELECTOR);
      if (!root) return;
      documentObserver.disconnect();
      documentObserver = undefined;
      observeRoot();
    });
    documentObserver.observe(documentRef.documentElement, { childList: true, subtree: true });
  }

  const api = Object.freeze({
    installed: true,
    synchronize,
    close,
    disconnect() {
      close({ restore: false });
      rootObserver?.disconnect();
      documentObserver?.disconnect();
      delete documentRef.documentElement.dataset.pipelineProspectAdmin;
      if (root) delete root[INSTALL_KEY];
    },
  });
  if (root) root[INSTALL_KEY] = api;
  return api;
}

if (
  typeof document !== "undefined"
  && typeof window !== "undefined"
  && !globalThis.__FORGE_DISABLE_PIPELINE_PROSPECT_ADMIN_AUTO_INSTALL__
) {
  installPipelineProspectAdmin();
}
