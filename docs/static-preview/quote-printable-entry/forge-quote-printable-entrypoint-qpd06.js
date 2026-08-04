import {
  createQuotePrintableRouteController,
} from "../quote-printable-runtime/forge-quote-printable-route-controller.js?v=qpd06_productive_route_20260730_1";

const VERSION = "QPD06_PRODUCTIVE_ROUTE_BINDING_V1";
const ACTIONS_MARKER = "data-forge-qpd06-actions";
const MODAL_MARKER = "data-forge-qpd06-modal";
const STATUS_MARKER = "data-forge-qpd06-status";
const FORMAT_MARKER = "data-forge-qpd06-format";

let controller = null;
let modalMode = "preview";
let mounted = false;
let scheduled = false;
let lifecycleIdentity = null;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function snapshotProvider() {
  return globalThis.ForgeAcceptedQuoteBridge
    ?.getAcceptedQuoteReviewSnapshot?.() || null;
}

async function identityProvider() {
  if (lifecycleIdentity) return lifecycleIdentity;
  const bridge =
    globalThis.ForgeQuoteLifecycleBrowserBridgeCartera001B;
  if (!bridge?.captureCurrentAcceptedQuote) return null;
  const result = await bridge.captureCurrentAcceptedQuote();
  if (
    result?.durable === true &&
    result.quoteReference &&
    result.quoteVersionReference
  ) {
    lifecycleIdentity = Object.freeze({
      quoteReference: result.quoteReference,
      quoteVersionReference: result.quoteVersionReference,
      prospectReference: result.prospectReference,
      productReference: result.productReference,
      quoteSnapshotDigest:
        result.snapshotDigest || result.quoteSnapshotDigest,
    });
  }
  return lifecycleIdentity || result;
}

function getController() {
  if (controller) return controller;
  controller = createQuotePrintableRouteController({
    snapshotProvider,
    identityProvider,
    storage: (() => {
      try {
        return globalThis.localStorage || null;
      } catch {
        return null;
      }
    })(),
  });
  return controller;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uploadSurface() {
  const heading = [...document.querySelectorAll("h2, h3")].find(
    (element) =>
      normalize(element.textContent) ===
      normalize("Carga tu cotización"),
  );
  return (
    heading?.closest("section, article") ||
    heading?.parentElement ||
    document.querySelector(
      '[data-forge-saas-module-host-r16c5l="cotizaciones"]',
    )
  );
}

function styleReference(surface) {
  return (
    surface?.querySelector(
      'button[data-forge-quote-action-proxy-r16j1b="presentation"]',
    ) ||
    surface?.querySelector(
      'button[data-forge-quote-action-proxy-r16j1b="confirm"]',
    ) ||
    [...(surface?.querySelectorAll("button") || [])].find((button) =>
      normalize(button.textContent).includes("revisar resultado"),
    ) ||
    null
  );
}

function applyButtonClass(button, surface) {
  const reference = styleReference(surface);
  const className = String(reference?.className || "").trim();
  if (className) button.className = className;
}

function ensureActions() {
  const surface = uploadSurface();
  if (!surface) return null;

  let actions = surface.querySelector(`[${ACTIONS_MARKER}="true"]`);
  if (!actions) {
    actions = document.createElement("section");
    actions.setAttribute(ACTIONS_MARKER, "true");
    actions.setAttribute("aria-label", "Documento imprimible de la cotización");
    actions.innerHTML = `
      <div class="forge-qpd06__header">
        <div>
          <strong>Documento imprimible</strong>
          <span>Vista técnica-comercial separada de la presentación.</span>
        </div>
        <label>
          Formato
          <select ${FORMAT_MARKER}="true" aria-label="Formato de página">
            <option value="A4">A4</option>
            <option value="LETTER">Carta</option>
          </select>
        </label>
      </div>
      <div class="forge-qpd06__actions">
        <button type="button" data-forge-qpd06-action="preview">
          Ver versión imprimible
        </button>
        <button type="button" data-forge-qpd06-action="download">
          Descargar PDF
        </button>
        <button type="button" data-forge-qpd06-action="history">
          Historial
        </button>
      </div>
      <p ${STATUS_MARKER}="true" role="status" aria-live="polite"></p>
    `;
    const stage =
      surface.querySelector(".forge-accepted-quote-stage-r16j2b") ||
      surface;
    stage.appendChild(actions);
  }

  for (const button of actions.querySelectorAll("button")) {
    applyButtonClass(button, surface);
  }

  return actions;
}

function ensureModal() {
  let modal = document.querySelector(`[${MODAL_MARKER}="true"]`);
  if (modal) return modal;

  modal = document.createElement("div");
  modal.setAttribute(MODAL_MARKER, "true");
  modal.hidden = true;
  modal.innerHTML = `
    <div class="forge-qpd06-modal__backdrop" data-forge-qpd06-close="true"></div>
    <section class="forge-qpd06-modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forge-qpd06-modal-title">
      <header>
        <div>
          <span class="forge-qpd06-modal__eyebrow">Cotización imprimible</span>
          <h2 id="forge-qpd06-modal-title">Vista previa</h2>
        </div>
        <button type="button"
          class="forge-qpd06-modal__close"
          data-forge-qpd06-close="true"
          aria-label="Cerrar">×</button>
      </header>
      <div class="forge-qpd06-modal__body">
        <iframe
          title="Vista previa de la cotización imprimible"
          data-forge-qpd06-preview-frame
          sandbox=""></iframe>
        <div data-forge-qpd06-history-list hidden></div>
      </div>
      <footer>
        <p data-forge-qpd06-modal-status role="status" aria-live="polite"></p>
        <button type="button" data-forge-qpd06-modal-download>
          Descargar esta versión
        </button>
      </footer>
    </section>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-forge-qpd06-close='true']")) {
      closeModal();
    }
  });
  modal.querySelector("[data-forge-qpd06-modal-download]")
    ?.addEventListener("click", () => {
      void downloadCurrent();
    });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });

  return modal;
}

function statusNode() {
  return document.querySelector(`[${STATUS_MARKER}="true"]`);
}

function setStatus(message, tone = "neutral") {
  const node = statusNode();
  if (!node) return;
  node.textContent = message || "";
  node.dataset.tone = tone;
}

function modalStatus(message, tone = "neutral") {
  const node = ensureModal().querySelector(
    "[data-forge-qpd06-modal-status]",
  );
  if (!node) return;
  node.textContent = message || "";
  node.dataset.tone = tone;
}

function openModal(mode) {
  const modal = ensureModal();
  modalMode = mode;
  modal.hidden = false;
  document.body.classList.add("forge-qpd06-modal-open");
  modal.querySelector(".forge-qpd06-modal__close")?.focus();
}

function closeModal() {
  const modal = ensureModal();
  modal.hidden = true;
  document.body.classList.remove("forge-qpd06-modal-open");
}

function renderPreview(bundle, { reopened = false } = {}) {
  const modal = ensureModal();
  const frame = modal.querySelector("[data-forge-qpd06-preview-frame]");
  const history = modal.querySelector("[data-forge-qpd06-history-list]");
  const title = modal.querySelector("#forge-qpd06-modal-title");
  frame.hidden = false;
  history.hidden = true;
  frame.srcdoc = bundle.printableDocument.html;
  title.textContent = reopened
    ? "Versión reabierta"
    : "Vista previa imprimible";
  modal.querySelector("[data-forge-qpd06-modal-download]").hidden = false;
  modalStatus(
    `${bundle.pdfPacket.pageCount} página(s) · ${bundle.pageFormat} · ` +
      `${bundle.pdfPacket.byteLength.toLocaleString("es-MX")} bytes`,
    "success",
  );
  openModal("preview");
}

function formatPersistence(result) {
  if (result?.durable === true) {
    return result.status === "IDEMPOTENT_REPLAY"
      ? "Versión ya guardada en el historial."
      : "Nueva versión guardada en el historial.";
  }
  return (
    "Vista disponible. Para guardar historial, abre Cotizaciones " +
    "desde un Prospect y confirma la vinculación."
  );
}

async function previewCurrent() {
  try {
    setStatus("Preparando versión imprimible…", "loading");
    const format =
      document.querySelector(`[${FORMAT_MARKER}="true"]`)?.value ||
      "A4";
    getController().setPageFormat(format);
    const result = await getController().preview({
      requestedPageFormat: format,
    });
    renderPreview(result.bundle);
    setStatus(formatPersistence(result.persistence), result.persistence.durable ? "success" : "warning");
    refresh();
    return result;
  } catch (error) {
    setStatus(error?.message || String(error), "error");
    throw error;
  }
}

async function downloadCurrent() {
  try {
    setStatus("Generando descarga segura…", "loading");
    const result = await getController().download({
      userInitiated: true,
      documentRef: document,
      urlRef: URL,
    });
    modalStatus(
      `Descarga enviada: ${result.receipt.fileName}`,
      "success",
    );
    setStatus(
      `${result.receipt.fileName} descargado. ${formatPersistence(result.persistence)}`,
      result.persistence.durable ? "success" : "warning",
    );
    refresh();
    return result;
  } catch (error) {
    setStatus(error?.message || String(error), "error");
    modalStatus(error?.message || String(error), "error");
    throw error;
  }
}

function renderHistory(records) {
  const modal = ensureModal();
  const frame = modal.querySelector("[data-forge-qpd06-preview-frame]");
  const list = modal.querySelector("[data-forge-qpd06-history-list]");
  const title = modal.querySelector("#forge-qpd06-modal-title");
  frame.hidden = true;
  list.hidden = false;
  title.textContent = "Historial imprimible";
  modal.querySelector("[data-forge-qpd06-modal-download]").hidden = true;

  if (!records.length) {
    list.innerHTML = `
      <div class="forge-qpd06-history__empty">
        <strong>Aún no hay versiones guardadas.</strong>
        <span>Abre o descarga una cotización vinculada a un Prospect.</span>
      </div>
    `;
    modalStatus("Sin versiones locales para esta cotización.");
    return;
  }

  list.innerHTML = records.map((record) => `
    <article class="forge-qpd06-history__item">
      <div>
        <strong>${record.productProfileLabel || "Cotización"}</strong>
        <span>${new Date(record.persistedAt).toLocaleString("es-MX")}</span>
        <small>
          ${record.pageFormat} · ${record.renderManifest.pageCount} página(s)
        </small>
      </div>
      <button type="button"
        data-forge-qpd06-reopen="${record.printableVersionReference}">
        Reabrir
      </button>
    </article>
  `).join("");

  for (const button of list.querySelectorAll("[data-forge-qpd06-reopen]")) {
    applyButtonClass(button, uploadSurface());
    button.addEventListener("click", () => {
      const result = getController().reopen(
        button.getAttribute("data-forge-qpd06-reopen"),
      );
      renderPreview(result.bundle, { reopened: true });
      setStatus("Versión histórica verificada y reabierta.", "success");
    });
  }

  modalStatus(`${records.length} versión(es) guardada(s).`, "success");
}

async function showHistory() {
  try {
    setStatus("Consultando historial local…", "loading");
    const records = await getController().history();
    renderHistory(records);
    openModal("history");
    if (!getController().state().durableIdentityReady) {
      setStatus(
        "El historial requiere una cotización vinculada a un Prospect.",
        "warning",
      );
    } else {
      setStatus(
        records.length
          ? `${records.length} versión(es) disponibles.`
          : "Aún no hay versiones guardadas.",
        records.length ? "success" : "neutral",
      );
    }
    refresh();
    return records;
  } catch (error) {
    setStatus(error?.message || String(error), "error");
    throw error;
  }
}

function button(action) {
  return document.querySelector(
    `[data-forge-qpd06-action="${action}"]`,
  );
}

function bindActions() {
  const actions = ensureActions();
  if (!actions || actions.dataset.forgeQpd06Bound === "true") return;
  actions.dataset.forgeQpd06Bound = "true";

  button("preview")?.addEventListener("click", () => {
    void previewCurrent();
  });
  button("download")?.addEventListener("click", () => {
    void downloadCurrent();
  });
  button("history")?.addEventListener("click", () => {
    void showHistory();
  });
  actions.querySelector(`[${FORMAT_MARKER}="true"]`)
    ?.addEventListener("change", (event) => {
      getController().setPageFormat(event.target.value);
      setStatus("Formato actualizado. La siguiente versión usará ese tamaño.");
      refresh();
    });
}

function refresh() {
  const actions = ensureActions();
  if (!actions) return false;
  bindActions();

  const state = getController().state();
  actions.hidden = !state.acceptedQuoteReady;
  actions.setAttribute("aria-hidden", String(!state.acceptedQuoteReady));

  for (const action of ["preview", "download"]) {
    const node = button(action);
    if (!node) continue;
    node.disabled = !state.acceptedQuoteReady;
    node.setAttribute(
      "aria-disabled",
      String(!state.acceptedQuoteReady),
    );
  }

  const history = button("history");
  if (history) {
    history.disabled = !state.acceptedQuoteReady;
    history.setAttribute(
      "aria-disabled",
      String(!state.acceptedQuoteReady),
    );
  }

  actions.dataset.forgeQpd06State =
    state.acceptedQuoteReady ? "READY" : "NO_QUOTE";
  actions.dataset.forgeQpd06Durable =
    String(state.durableIdentityReady);

  globalThis.dispatchEvent?.(
    new CustomEvent("forge:qpd06-state", {
      detail: state,
    }),
  );

  return true;
}

function scheduleRefresh() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(() => {
    scheduled = false;
    refresh();
  });
}

function acceptLifecycleIdentity(value) {
  if (!isRecord(value) || value.durable !== true) return null;
  lifecycleIdentity = Object.freeze({
    quoteReference: value.quoteReference,
    quoteVersionReference: value.quoteVersionReference,
    prospectReference: value.prospectReference,
    productReference: value.productReference,
    quoteSnapshotDigest:
      value.snapshotDigest || value.quoteSnapshotDigest,
  });
  getController().setDurableIdentity(lifecycleIdentity);
  scheduleRefresh();
  return lifecycleIdentity;
}

function clearCurrentQuote() {
  lifecycleIdentity = null;
  getController().clearCurrentQuote();
  closeModal();
  scheduleRefresh();
}

function boot() {
  if (mounted) {
    scheduleRefresh();
    return;
  }
  mounted = true;
  ensureModal();
  ensureActions();
  bindActions();
  refresh();

  globalThis.addEventListener(
    "forge:accepted-quote-confirmed",
    scheduleRefresh,
  );
  globalThis.addEventListener(
    "forge:quote-lifecycle-persisted",
    (event) => acceptLifecycleIdentity(event.detail),
  );
  globalThis.addEventListener(
    "forge:quote-candidate-cleared",
    clearCurrentQuote,
  );
  globalThis.addEventListener(
    "forge:quote-runtime-ready",
    scheduleRefresh,
  );

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

const api = Object.freeze({
  version: VERSION,
  activatePreview: previewCurrent,
  downloadCurrent,
  getState: () => getController().state(),
  refresh,
  reopen: (reference) => getController().reopen(reference),
  setDurableIdentity: acceptLifecycleIdentity,
  showHistory,
});

globalThis.ForgeQuotePrintableEntrypointQPD06 = api;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export {
  VERSION,
  acceptLifecycleIdentity,
  boot,
  downloadCurrent,
  previewCurrent,
  refresh,
  showHistory,
};
