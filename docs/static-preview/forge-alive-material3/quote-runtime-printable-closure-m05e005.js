import {
  createQuotePrintableRouteController,
} from "../quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js";

const VERSION = "M05E-005";
const MISSING_CLIENT_LABEL = "Sin dato confirmado";
const CARD_MARKER = "data-m05e005-printable-card";
const MODAL_MARKER = "data-m05e005-printable-modal";

let controller = null;
let lifecycleIdentity = null;
let scheduled = false;
let activeBundle = null;

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isMissingLabel(value) {
  return String(value || "").trim().toLowerCase() ===
    MISSING_CLIENT_LABEL.toLowerCase();
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function clientNameFrom(value) {
  const quote = value?.acceptedQuote || value || {};
  const candidates = [
    quote?.client?.fullName,
    quote?.client?.name,
    quote?.insured?.fullName,
    quote?.insured?.name,
    quote?.prospect?.fullName,
    quote?.prospect?.name,
    quote?.context?.clientName,
    quote?.context?.insuredName,
    quote?.nativeResult?.clientName,
    quote?.nativeResult?.insuredName,
    quote?.nativeResult?.prospectName,
  ];
  return candidates.find((item) => hasText(item) && !isMissingLabel(item))
    ?.trim() || "";
}

function patchCandidate(candidate, clientName = MISSING_CLIENT_LABEL) {
  if (!isRecord(candidate)) return candidate;
  try {
    if (!isRecord(candidate.context)) candidate.context = {};
    if (!hasText(candidate.context.clientName)) {
      candidate.context.clientName = clientName;
    }
    if (!isRecord(candidate.client)) candidate.client = {};
    if (!hasText(candidate.client.name)) candidate.client.name = clientName;
  } catch {
    // The immutable snapshot patch below is the bounded fallback.
  }
  return candidate;
}

function patchSnapshot(snapshot) {
  if (!isRecord(snapshot)) return snapshot;
  if (clientNameFrom(snapshot)) return snapshot;
  const output = clone(snapshot);
  if (!isRecord(output.acceptedQuote)) output.acceptedQuote = {};
  if (!isRecord(output.acceptedQuote.context)) output.acceptedQuote.context = {};
  if (!isRecord(output.acceptedQuote.client)) output.acceptedQuote.client = {};
  output.acceptedQuote.context.clientName = MISSING_CLIENT_LABEL;
  output.acceptedQuote.client.name = MISSING_CLIENT_LABEL;
  return output;
}

function ensureOptionalClientBridge() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!current) return null;
  if (current.__m05e005OptionalClient === true) return current;

  const wrapper = Object.freeze({
    ...current,
    __m05e005OptionalClient: true,
    setCurrentQuoteHumanReview(patch = {}) {
      return current.setCurrentQuoteHumanReview?.(patch) || patch;
    },
    getAcceptedQuoteReviewSnapshot() {
      return patchSnapshot(current.getAcceptedQuoteReviewSnapshot?.());
    },
    async confirmCurrentQuoteCandidate() {
      const candidate = current.getCurrentQuoteCandidate?.();
      const reviewed = current.getCurrentQuoteHumanReview?.();
      const known = clientNameFrom(candidate) || clientNameFrom({
        acceptedQuote: { context: { clientName: reviewed?.clientName } },
      });
      if (!known) {
        patchCandidate(candidate);
        current.setCurrentQuoteHumanReview?.({
          clientName: MISSING_CLIENT_LABEL,
        });
      }
      const accepted = await current.confirmCurrentQuoteCandidate();
      return patchSnapshot(accepted);
    },
  });

  globalThis.ForgeAcceptedQuoteBridge = wrapper;
  return wrapper;
}

function prepareOptionalClient() {
  const bridge = ensureOptionalClientBridge();
  if (!bridge) return;
  const candidate = bridge.getCurrentQuoteCandidate?.();
  const snapshot = bridge.getAcceptedQuoteReviewSnapshot?.();
  const known = clientNameFrom(candidate) || clientNameFrom(snapshot);
  if (!known) {
    patchCandidate(candidate);
    bridge.setCurrentQuoteHumanReview?.({ clientName: MISSING_CLIENT_LABEL });
  }
}

function snapshotProvider() {
  prepareOptionalClient();
  return patchSnapshot(
    globalThis.ForgeAcceptedQuoteBridge
      ?.getAcceptedQuoteReviewSnapshot?.(),
  );
}

async function identityProvider() {
  if (lifecycleIdentity) return lifecycleIdentity;
  const result = await globalThis
    .ForgeQuoteLifecycleBrowserBridgeCartera001B
    ?.captureCurrentAcceptedQuote?.();
  if (result?.durable === true) acceptLifecycleIdentity(result);
  return lifecycleIdentity || result || null;
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
  controller.setPageFormat("A4");
  return controller;
}

function ensureStyles() {
  if (document.querySelector("[data-m05e005-printable-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./quote-runtime-printable-closure-m05e005.css?v=m05e-005",
    import.meta.url,
  ).href;
  link.dataset.m05e005PrintableStyles = "true";
  document.head.append(link);
}

function icon(name) {
  const icons = {
    printer: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8V3h10v5h1a3 3 0 0 1 3 3v6h-4v4H7v-4H3v-6a3 3 0 0 1 3-3h1Zm2-3v3h6V5H9Zm6 14v-5H9v5h6Zm3-4h1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4h2v-3h10v3h1Z"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6V2Zm2 2v16h9V9h-5V4H8Zm6 1.4V7h1.6L14 5.4ZM9 12h2.2c1.6 0 2.6.9 2.6 2.3 0 1.5-1 2.4-2.7 2.4h-.6V19H9v-7Zm1.5 1.4v1.9h.6c.8 0 1.2-.3 1.2-1s-.4-.9-1.2-.9h-.6Zm4.2-1.4h1.8c1.9 0 3 1.3 3 3.5S18.4 19 16.5 19h-1.8v-7Zm1.5 1.4v4.2h.3c1 0 1.5-.7 1.5-2.1s-.5-2.1-1.5-2.1h-.3Z"/></svg>',
    history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 1-8.5 6H1l3.5-4L8 9H5.6A7 7 0 1 0 12 5V3Zm-1 4h2v5.2l3.3 2-1 1.7-4.3-2.6V7Z"/></svg>',
    document: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6V2Zm2 2v16h9V9h-5V4H8Zm6 1.4V7h1.6L14 5.4ZM10 12h5v2h-5v-2Zm0 4h5v2h-5v-2Z"/></svg>',
  };
  return icons[name] || "";
}

function setAttributeIfChanged(element, name, value) {
  if (!element || element.getAttribute(name) === value) return false;
  element.setAttribute(name, value);
  return true;
}

function hideLegacySurfaces() {
  const humanReview = document.querySelector(
    '[data-quote-human-review-m05e003]',
  );
  if (humanReview && !humanReview.hidden) humanReview.hidden = true;

  setAttributeIfChanged(
    document.querySelector('[data-forge-qpd06-actions="true"]'),
    "data-m05e005-legacy-hidden",
    "true",
  );
  setAttributeIfChanged(
    document.querySelector('[data-forge-qpd06-modal="true"]'),
    "data-m05e005-legacy-hidden",
    "true",
  );
  document.querySelector("[data-client-review-pending]")?.remove();
}

function detectedClientName() {
  const bridge = ensureOptionalClientBridge();
  return clientNameFrom(bridge?.getCurrentQuoteCandidate?.()) ||
    clientNameFrom(bridge?.getAcceptedQuoteReviewSnapshot?.()) || "";
}

function ensureCard() {
  const projection = document.querySelector(
    "[data-material3-quotes-projection]",
  );
  if (!projection || projection.hidden) return null;

  let card = projection.querySelector(`[${CARD_MARKER}]`);
  if (!card) {
    card = document.createElement("section");
    card.setAttribute(CARD_MARKER, "true");
    card.className = "forge-printable-card-m05e005";
    card.innerHTML = `
      <header class="forge-printable-card__header">
        <span class="forge-printable-card__mark">${icon("document")}</span>
        <div class="forge-printable-card__title">
          <span>GESTIÓN DE LA COTIZACIÓN</span>
          <h3>Documento y seguimiento</h3>
          <p>Propuesta comercial en A4 vertical, lista para revisar o compartir.</p>
        </div>
        <span class="forge-printable-card__format">A4 · vertical</span>
      </header>
      <div class="forge-printable-card__body">
        <label class="forge-printable-client">
          <span>Cliente / asegurado <small>Opcional</small></span>
          <input type="text" autocomplete="off"
            data-m05e005-client-input
            placeholder="Sin dato confirmado">
        </label>
        <div class="forge-printable-toolbar" role="group"
          aria-label="Acciones del documento">
          <button type="button" data-m05e005-action="preview"
            aria-label="Ver e imprimir la cotización"
            title="Ver e imprimir">${icon("printer")}</button>
          <button type="button" data-m05e005-action="download"
            aria-label="Descargar cotización en PDF"
            title="Descargar PDF">${icon("pdf")}</button>
          <button type="button" data-m05e005-action="history"
            aria-label="Abrir historial de versiones"
            title="Historial">${icon("history")}</button>
        </div>
      </div>
      <p class="forge-printable-card__status" data-m05e005-status
        role="status" aria-live="polite"></p>
    `;
    const actions = projection.querySelector("[data-quote-last-actions]");
    if (actions) actions.before(card);
    else projection.append(card);
  }

  bindCard(card);
  const input = card.querySelector("[data-m05e005-client-input]");
  const detected = detectedClientName();
  if (input && !input.matches(":focus") && !input.value && detected) {
    input.value = detected;
  }
  return card;
}

function status(message, tone = "neutral") {
  const node = document.querySelector("[data-m05e005-status]");
  if (!node) return;
  node.textContent = message || "";
  node.dataset.tone = tone;
}

function bindCard(card) {
  if (card.dataset.bound === "true") return;
  card.dataset.bound = "true";

  const input = card.querySelector("[data-m05e005-client-input]");
  input?.addEventListener("input", () => {
    const value = input.value.trim();
    if (value) {
      ensureOptionalClientBridge()?.setCurrentQuoteHumanReview?.({
        clientName: value,
      });
    }
    status(
      value
        ? "Nombre actualizado para la siguiente versión."
        : "El nombre es opcional; el documento mostrará “Sin dato confirmado”.",
    );
  });

  card.querySelector('[data-m05e005-action="preview"]')
    ?.addEventListener("click", () => void previewCurrent());
  card.querySelector('[data-m05e005-action="download"]')
    ?.addEventListener("click", () => void downloadCurrent());
  card.querySelector('[data-m05e005-action="history"]')
    ?.addEventListener("click", () => void showHistory());
}

function ensureModal() {
  let modal = document.querySelector(`[${MODAL_MARKER}]`);
  if (modal) return modal;
  modal = document.createElement("div");
  modal.setAttribute(MODAL_MARKER, "true");
  modal.hidden = true;
  modal.innerHTML = `
    <button type="button" class="forge-printable-modal__scrim"
      data-m05e005-close aria-label="Cerrar"></button>
    <section class="forge-printable-modal__dialog" role="dialog"
      aria-modal="true" aria-labelledby="m05e005-modal-title">
      <header>
        <div>
          <span>DOCUMENTO DE COTIZACIÓN</span>
          <h2 id="m05e005-modal-title">Vista previa</h2>
        </div>
        <button type="button" class="forge-printable-modal__close"
          data-m05e005-close aria-label="Cerrar">×</button>
      </header>
      <div class="forge-printable-modal__body">
        <iframe title="Vista previa A4 vertical"
          data-m05e005-preview-frame sandbox=""></iframe>
        <div data-m05e005-history-list hidden></div>
      </div>
      <footer>
        <p data-m05e005-modal-status role="status"></p>
        <button type="button" data-m05e005-modal-download>
          Descargar PDF
        </button>
      </footer>
    </section>`;
  document.body.append(modal);
  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-m05e005-close]")) closeModal();
  });
  modal.querySelector("[data-m05e005-modal-download]")
    ?.addEventListener("click", () => void downloadCurrent());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
  return modal;
}

function openModal() {
  const modal = ensureModal();
  modal.hidden = false;
  document.body.classList.add("forge-printable-modal-open-m05e005");
  modal.querySelector(".forge-printable-modal__close")?.focus();
}

function closeModal() {
  const modal = ensureModal();
  modal.hidden = true;
  document.body.classList.remove("forge-printable-modal-open-m05e005");
}

function modalStatus(message, tone = "neutral") {
  const node = ensureModal().querySelector("[data-m05e005-modal-status]");
  node.textContent = message || "";
  node.dataset.tone = tone;
}

function persistenceText(persistence) {
  if (persistence?.durable === true) {
    return persistence.status === "IDEMPOTENT_REPLAY"
      ? "Versión ya disponible en Historial."
      : "Versión guardada en Historial.";
  }
  return "Vista local lista. Historial durable estará disponible al vincular la cotización a un prospecto.";
}

function renderPreview(bundle, { reopened = false } = {}) {
  activeBundle = bundle;
  const modal = ensureModal();
  const frame = modal.querySelector("[data-m05e005-preview-frame]");
  const history = modal.querySelector("[data-m05e005-history-list]");
  frame.hidden = false;
  history.hidden = true;
  frame.srcdoc = bundle.printableDocument.html;
  modal.querySelector("#m05e005-modal-title").textContent = reopened
    ? "Versión histórica"
    : "Vista previa A4 vertical";
  modal.querySelector("[data-m05e005-modal-download]").hidden = false;
  modalStatus(
    `${bundle.pdfPacket.pageCount} página(s) · A4 vertical · ${bundle.pdfPacket.byteLength.toLocaleString("es-MX")} bytes`,
    "success",
  );
  openModal();
}

async function previewCurrent() {
  try {
    prepareOptionalClient();
    status("Preparando vista A4 vertical…", "loading");
    const result = await getController().preview({
      requestedPageFormat: "A4",
    });
    renderPreview(result.bundle);
    status(persistenceText(result.persistence),
      result.persistence?.durable ? "success" : "neutral");
    refresh();
    return result;
  } catch (error) {
    status(error?.message || String(error), "error");
    throw error;
  }
}

async function downloadCurrent() {
  try {
    prepareOptionalClient();
    status("Generando PDF vertical…", "loading");
    const result = await getController().download({
      userInitiated: true,
      documentRef: document,
      urlRef: URL,
    });
    activeBundle = result.bundle;
    const message = `${result.receipt.fileName} descargado. ${persistenceText(result.persistence)}`;
    status(message, "success");
    modalStatus(message, "success");
    refresh();
    return result;
  } catch (error) {
    status(error?.message || String(error), "error");
    modalStatus(error?.message || String(error), "error");
    throw error;
  }
}

function renderHistory(records) {
  const modal = ensureModal();
  const frame = modal.querySelector("[data-m05e005-preview-frame]");
  const list = modal.querySelector("[data-m05e005-history-list]");
  frame.hidden = true;
  list.hidden = false;
  modal.querySelector("#m05e005-modal-title").textContent = "Historial de versiones";
  modal.querySelector("[data-m05e005-modal-download]").hidden = true;

  if (!records.length) {
    list.innerHTML = `
      <div class="forge-printable-history__empty">
        <span class="forge-printable-history__clock">${icon("history")}</span>
        <strong>Aún no hay versiones guardadas</strong>
        <p>La vista y el PDF funcionan ahora. Las versiones durables aparecerán aquí cuando la cotización esté vinculada a un prospecto.</p>
      </div>`;
    modalStatus("Historial vacío por ahora.");
    return;
  }

  list.innerHTML = records.map((record) => `
    <article class="forge-printable-history__item">
      <div>
        <strong>${record.productProfileLabel || "Cotización"}</strong>
        <span>${new Date(record.persistedAt).toLocaleString("es-MX")}</span>
        <small>${record.pageFormat} vertical · ${record.renderManifest.pageCount} página(s)</small>
      </div>
      <button type="button" data-m05e005-reopen="${record.printableVersionReference}">
        Reabrir
      </button>
    </article>`).join("");

  list.querySelectorAll("[data-m05e005-reopen]").forEach((button) => {
    button.addEventListener("click", () => {
      const result = getController().reopen(
        button.getAttribute("data-m05e005-reopen"),
      );
      renderPreview(result.bundle, { reopened: true });
      status("Versión histórica reabierta.", "success");
    });
  });
  modalStatus(`${records.length} versión(es) disponibles.`, "success");
}

async function showHistory() {
  try {
    status("Consultando historial…", "loading");
    const records = await getController().history();
    renderHistory(records);
    openModal();
    status(
      records.length
        ? `${records.length} versión(es) disponibles.`
        : "Historial listo; todavía no hay versiones guardadas.",
      records.length ? "success" : "neutral",
    );
    refresh();
    return records;
  } catch (error) {
    status(error?.message || String(error), "error");
    throw error;
  }
}

function acceptLifecycleIdentity(value) {
  if (!isRecord(value) || value.durable !== true) return null;
  lifecycleIdentity = Object.freeze({
    quoteReference: value.quoteReference,
    quoteVersionReference: value.quoteVersionReference,
    prospectReference: value.prospectReference,
    productReference: value.productReference,
    quoteSnapshotDigest: value.snapshotDigest || value.quoteSnapshotDigest,
  });
  getController().setDurableIdentity(lifecycleIdentity);
  scheduleRefresh();
  return lifecycleIdentity;
}

function refresh() {
  ensureStyles();
  prepareOptionalClient();
  hideLegacySurfaces();
  const card = ensureCard();
  const state = getController().state();
  if (card) {
    const shouldHide = !state.acceptedQuoteReady;
    if (card.hidden !== shouldHide) card.hidden = shouldHide;
    card.querySelectorAll("[data-m05e005-action]").forEach((button) => {
      const action = button.dataset.m05e005Action;
      button.disabled = action !== "history" && !state.acceptedQuoteReady;
      const ariaDisabled = String(button.disabled);
      if (button.getAttribute("aria-disabled") !== ariaDisabled) {
        button.setAttribute("aria-disabled", ariaDisabled);
      }
    });
    if (!card.querySelector("[data-m05e005-status]")?.textContent) {
      status("Documento A4 vertical listo para generar.");
    }
  }
  document.documentElement.dataset.quoteCalculatorRuntime = VERSION;
  globalThis.dispatchEvent?.(new CustomEvent("forge:m05e005-state", {
    detail: Object.freeze({ ...state, runtime: VERSION }),
  }));
  return Boolean(card);
}

function scheduleRefresh() {
  if (scheduled) return;
  scheduled = true;
  const enqueue = globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : (callback) => globalThis.setTimeout(callback, 0);
  enqueue(() => {
    scheduled = false;
    refresh();
  });
}

function boot() {
  ensureStyles();
  ensureModal();
  scheduleRefresh();
  for (const eventName of [
    "forge:quotes-module-ready",
    "forge:quote-candidate-ready",
    "forge:quote-preview-calculated",
    "forge:accepted-quote-confirmed",
    "forge:qpd06-state",
    "forge:quote-human-review-updated",
  ]) {
    globalThis.addEventListener(eventName, scheduleRefresh);
  }
  globalThis.addEventListener("forge:quote-lifecycle-persisted", (event) => {
    acceptLifecycleIdentity(event.detail);
  });
  globalThis.addEventListener("forge:quote-candidate-cleared", () => {
    lifecycleIdentity = null;
    controller?.clearCurrentQuote?.();
    activeBundle = null;
    closeModal();
    scheduleRefresh();
  });
  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["hidden", "data-forge-state", "data-quote-accepted"],
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

function installApi() {
  globalThis.ForgeQuotePrintableEntrypointQPD06 = api;
}

const apiObserver = new MutationObserver(() => {
  if (globalThis.ForgeQuotePrintableEntrypointQPD06 !== api) installApi();
});
apiObserver.observe(document.documentElement, { childList: true, subtree: true });

installApi();
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
