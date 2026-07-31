import {
  createQuotePrintableRouteController,
} from "../quote-printable-runtime/forge-quote-printable-route-controller-m05e005.js";

const VERSION = "M05E-006";
const MISSING_CLIENT_LABEL = "Sin dato confirmado";
const CARD_MARKER = "data-m05e005-printable-card";
const MODAL_MARKER = "data-m05e005-printable-modal";
const API_KEY = "ForgeQuotePrintableEntrypointQPD06";

let controller = null;
let lifecycleIdentity = null;
let activeBundle = null;
let scheduledTimer = null;
let booted = false;
let legacyEntrypoint = null;
const preparedCandidates = new WeakSet();

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

function clientNameFrom(value, { includeMissing = false } = {}) {
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
  return candidates.find((item) =>
    hasText(item) && (includeMissing || !isMissingLabel(item)),
  )?.trim() || "";
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
    // Immutable candidates are normalized only in the printable snapshot.
  }
  return candidate;
}

function patchSnapshot(snapshot) {
  if (!isRecord(snapshot)) return snapshot;
  if (clientNameFrom(snapshot, { includeMissing: true })) return snapshot;
  const output = clone(snapshot);
  if (!isRecord(output.acceptedQuote)) output.acceptedQuote = {};
  if (!isRecord(output.acceptedQuote.context)) output.acceptedQuote.context = {};
  if (!isRecord(output.acceptedQuote.client)) output.acceptedQuote.client = {};
  output.acceptedQuote.context.clientName = MISSING_CLIENT_LABEL;
  output.acceptedQuote.client.name = MISSING_CLIENT_LABEL;
  return output;
}

function underlyingBridge() {
  const bridge = globalThis.ForgeAcceptedQuoteBridge;
  return bridge?.__m05e006UnderlyingBridge || bridge || null;
}

function prepareOptionalClient(bridge = globalThis.ForgeAcceptedQuoteBridge) {
  if (!bridge) return;
  const candidate = bridge.getCurrentQuoteCandidate?.();
  const reviewed = bridge.getCurrentQuoteHumanReview?.();
  const alreadyPrepared = hasText(reviewed?.clientName) ||
    clientNameFrom(candidate, { includeMissing: true });
  if (alreadyPrepared) return;
  if (isRecord(candidate) && preparedCandidates.has(candidate)) return;

  patchCandidate(candidate);
  if (isRecord(candidate)) preparedCandidates.add(candidate);
  bridge.setCurrentQuoteHumanReview?.({
    clientName: MISSING_CLIENT_LABEL,
  });
}

function ensureOptionalClientBridge() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!current) return null;
  if (current.__m05e006OptionalClient === true) return current;

  const source = current.__m05e006UnderlyingBridge || current;
  const wrapper = Object.freeze({
    ...source,
    __m05e006OptionalClient: true,
    __m05e006UnderlyingBridge: source,
    setCurrentQuoteHumanReview(patch = {}) {
      return source.setCurrentQuoteHumanReview?.(patch) || patch;
    },
    getAcceptedQuoteReviewSnapshot() {
      return patchSnapshot(source.getAcceptedQuoteReviewSnapshot?.());
    },
    async confirmCurrentQuoteCandidate() {
      prepareOptionalClient(source);
      const accepted = await source.confirmCurrentQuoteCandidate();
      return patchSnapshot(accepted);
    },
  });

  globalThis.ForgeAcceptedQuoteBridge = wrapper;
  return wrapper;
}

function snapshotProvider() {
  const bridge = ensureOptionalClientBridge();
  prepareOptionalClient(bridge);
  return patchSnapshot(bridge?.getAcceptedQuoteReviewSnapshot?.());
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

function setAttributeOnce(node, name, value = "") {
  if (!node || node.getAttribute(name) === value) return false;
  node.setAttribute(name, value);
  return true;
}

function setHiddenOnce(node, hidden) {
  if (!node || node.hidden === hidden) return false;
  node.hidden = hidden;
  return true;
}

function setTextOnce(node, value) {
  const next = String(value || "");
  if (!node || node.textContent === next) return false;
  node.textContent = next;
  return true;
}

function ensureStyles() {
  if (document.querySelector("[data-m05e006-printable-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL(
    "./quote-runtime-printable-closure-m05e005.css?v=m05e-006",
    import.meta.url,
  ).href;
  link.dataset.m05e006PrintableStyles = "true";
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

function hideLegacySurfaces() {
  setAttributeOnce(
    document.querySelector('[data-quote-human-review-m05e003]'),
    "hidden",
    "",
  );
  setAttributeOnce(
    document.querySelector('[data-forge-qpd06-actions="true"]'),
    "data-m05e005-legacy-hidden",
    "true",
  );
  setAttributeOnce(
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
  setTextOnce(node, message);
  if (node.dataset.tone !== tone) node.dataset.tone = tone;
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
  setHiddenOnce(modal, false);
  document.body.classList.add("forge-printable-modal-open-m05e005");
  modal.querySelector(".forge-printable-modal__close")?.focus();
}

function closeModal() {
  const modal = ensureModal();
  setHiddenOnce(modal, true);
  document.body.classList.remove("forge-printable-modal-open-m05e005");
}

function modalStatus(message, tone = "neutral") {
  const node = ensureModal().querySelector("[data-m05e005-modal-status]");
  setTextOnce(node, message);
  if (node.dataset.tone !== tone) node.dataset.tone = tone;
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
  setHiddenOnce(frame, false);
  setHiddenOnce(history, true);
  frame.srcdoc = bundle.printableDocument.html;
  setTextOnce(
    modal.querySelector("#m05e005-modal-title"),
    reopened ? "Versión histórica" : "Vista previa A4 vertical",
  );
  setHiddenOnce(modal.querySelector("[data-m05e005-modal-download]"), false);
  modalStatus(
    `${bundle.pdfPacket.pageCount} página(s) · A4 vertical · ${bundle.pdfPacket.byteLength.toLocaleString("es-MX")} bytes`,
    "success",
  );
  openModal();
}

async function previewCurrent() {
  try {
    prepareOptionalClient(ensureOptionalClientBridge());
    status("Preparando vista A4 vertical…", "loading");
    const result = await getController().preview({
      requestedPageFormat: "A4",
    });
    renderPreview(result.bundle);
    status(
      persistenceText(result.persistence),
      result.persistence?.durable ? "success" : "neutral",
    );
    refresh();
    return result;
  } catch (error) {
    status(error?.message || String(error), "error");
    throw error;
  }
}

async function downloadCurrent() {
  try {
    prepareOptionalClient(ensureOptionalClientBridge());
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
  setHiddenOnce(frame, true);
  setHiddenOnce(list, false);
  setTextOnce(
    modal.querySelector("#m05e005-modal-title"),
    "Historial de versiones",
  );
  setHiddenOnce(modal.querySelector("[data-m05e005-modal-download]"), true);

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
  installApiAuthority();
  const bridge = ensureOptionalClientBridge();
  prepareOptionalClient(bridge);
  hideLegacySurfaces();

  const state = getController().state();
  const card = ensureCard();
  if (card) {
    setHiddenOnce(card, !state.acceptedQuoteReady);
    card.querySelectorAll("[data-m05e005-action]").forEach((button) => {
      const action = button.dataset.m05e005Action;
      const disabled = action !== "history" && !state.acceptedQuoteReady;
      if (button.disabled !== disabled) button.disabled = disabled;
      setAttributeOnce(button, "aria-disabled", String(disabled));
    });
    if (!card.querySelector("[data-m05e005-status]")?.textContent) {
      status("Documento A4 vertical listo para generar.");
    }
  }
  if (document.documentElement.dataset.quoteCalculatorRuntime !== VERSION) {
    document.documentElement.dataset.quoteCalculatorRuntime = VERSION;
  }
  return Boolean(card);
}

function scheduleRefresh() {
  if (scheduledTimer !== null) return;
  scheduledTimer = globalThis.setTimeout(() => {
    scheduledTimer = null;
    refresh();
  }, 0);
}

function retryMount(attempt = 0) {
  scheduleRefresh();
  if (attempt >= 12 || document.querySelector(`[${CARD_MARKER}]`)) return;
  globalThis.setTimeout(() => retryMount(attempt + 1), 200);
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

function installApiAuthority() {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, API_KEY);
  if (descriptor?.get?.__m05e006Authority === true) return;

  try {
    const getter = () => api;
    getter.__m05e006Authority = true;
    Object.defineProperty(globalThis, API_KEY, {
      configurable: true,
      enumerable: true,
      get: getter,
      set(value) {
        if (value !== api) legacyEntrypoint = value;
      },
    });
  } catch {
    globalThis[API_KEY] = api;
  }
}

function boot() {
  if (booted) {
    retryMount();
    return;
  }
  booted = true;
  ensureStyles();
  ensureModal();
  installApiAuthority();
  retryMount();

  for (const eventName of [
    "forge:quotes-module-ready",
    "forge:quote-candidate-ready",
    "forge:quote-preview-calculated",
    "forge:accepted-quote-confirmed",
    "forge:qpd06-state",
    "forge:quote-runtime-ready",
  ]) {
    globalThis.addEventListener(eventName, () => {
      installApiAuthority();
      retryMount();
    });
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
}

installApiAuthority();
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
