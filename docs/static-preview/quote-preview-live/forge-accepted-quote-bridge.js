import {
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C
} from "./forge-accepted-quote-adapter.js";
import { renderAcceptedQuote } from "./forge-benefit-summary-renderer.js";

function initAcceptedQuoteBridge(deps = globalThis.ForgeNuevaCotizacionAcceptedQuoteRuntime) {
  if (!deps || deps.__initialized) return false;

  const {
    contractId = "QUOTE_PREVIEW_EXISTING_NUEVA_COTIZACION_REAL_PACKET_INTEGRATION_V1",
    input,
    submit,
    status,
    label,
    uploadSection,
    applyPacketToExistingPage,
    setReadiness,
    writeRuntimeGrid
  } = deps;

  if (!input || !submit || !status || !label) {
    console.error(`[${contractId}] Existing upload controls were not found.`);
    return false;
  }

  const api = globalThis.ForgeQuotePreviewLive;

  if (
    !api ||
    typeof api.createQuotePreviewPdfFlowPopupInvocation !== "function" ||
    typeof api.createMemoryBackend !== "function" ||
    typeof api.createStore !== "function"
  ) {
    status.textContent = "No se pudo cargar el módulo real de Quote Preview.";
    status.setAttribute("data-forge-state", "error");
    return false;
  }

  deps.__initialized = true;

  let packet = null;
  let sequence = 0;

  const backend = api.createMemoryBackend();
  const store = api.createStore({
    backend,
    now: () => Date.now()
  });

  const invocation = api.createQuotePreviewPdfFlowPopupInvocation({
    documentLike: document,
    mountTarget: document.body,
    store,
    createPreviewResultId(preview) {
      sequence += 1;

      const hash =
        preview.source &&
        typeof preview.source.pdfSha256 === "string"
          ? preview.source.pdfSha256.slice(0, 12)
          : "local";

      return `nueva-cotizacion-${hash}-${Date.now()}-${sequence}`;
    },
    now: () => Date.now(),
    ttlMs: 24 * 60 * 60 * 1000,
    onPersisted() {
      status.textContent = "Calculando cotización confirmada…";
      status.setAttribute("data-forge-state", "calculating");
      void calculateAcceptedQuote(packet)
        .then(calculation => {
          renderAcceptedQuote(calculation, { writeRuntimeGrid });
          status.textContent = "Cotización calculada y guardada durante esta sesión.";
          status.setAttribute("data-forge-state", "accepted");
          setReadiness?.("Cotización calculada · lista para revisión comercial", "accepted");
        })
        .catch(error => {
          status.textContent = error?.message || String(error);
          status.setAttribute("data-forge-state", "error");
          setReadiness?.("La cotización fue confirmada, pero el cálculo requiere revisión.", "error");
          console.error("[107Z15F0_ACCEPT_CALCULATOR]", error);
        });
    },
    onEditRequested() {
      status.textContent = "Edición solicitada. No se guardó la cotización.";
      status.setAttribute("data-forge-state", "edit");
      setReadiness?.("Resultado extraído · requiere edición", "edit");
    },
    onError(error) {
      status.textContent = "No se pudo guardar. El pop-up permanece abierto.";
      status.setAttribute("data-forge-state", "error");
      console.error(`[${contractId}]`, error);
    }
  });

  input.accept = ".json,application/json,.pdf,application/pdf";
  input.setAttribute("data-forge-local-packet-input", "true");
  input.removeAttribute("data-forge-pdf-read-allowed");

  label.textContent = "Seleccionar resultado extraído o PDF";
  submit.textContent = "Revisar resultado";
  submit.disabled = true;
  submit.setAttribute("aria-disabled", "true");
  status.textContent = "Selecciona JSON extraído o PDF de Solucionline.";

  if (uploadSection) {
    const heading = uploadSection.querySelector("h2");
    const description = uploadSection.querySelector("p");

    if (heading) {
      heading.textContent = "Carga el resultado real de la cotización";
    }

    if (description) {
      description.textContent =
        "En GitHub Pages, Forge procesa el PDF localmente y esta pantalla recibe el resultado extraído. El PDF y sus datos no se publican en el repositorio.";
    }
  }

  input.addEventListener("change", async event => {
    event.stopImmediatePropagation();

    packet = null;
    submit.disabled = true;
    submit.setAttribute("aria-disabled", "true");

    const file = input.files && input.files[0];

    if (!file) {
      status.textContent = "Selecciona JSON extraído o PDF de Solucionline.";
      return;
    }

    if (isPdfSelection107z15p2R9C(file)) {
      status.textContent =
        "PDF seleccionado. La extracción directa queda pendiente; usa JSON extraído mientras se conecta el parser PDF.";
      setReadiness?.(
        "PDF seleccionado · parser PDF pendiente de conexión en preview",
        "pending"
      );
      return;
    }

    try {
      const raw = await file.text();
      packet = validatePacket(JSON.parse(raw));

      submit.disabled = false;
      submit.setAttribute("aria-disabled", "false");

      status.textContent = `${file.name} cargado. Listo para revisar.`;
      status.setAttribute("data-forge-state", "ready");
    } catch (error) {
      status.textContent = error && error.message ? error.message : String(error);
      status.setAttribute("data-forge-state", "error");
    }
  }, true);

  submit.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!packet) return;

    applyPacketToExistingPage?.(packet);

    invocation.present({
      nativeResult: packet.nativeResult,
      context: packet.context,
      ambiguity:
        packet.ambiguity &&
        typeof packet.ambiguity === "object"
          ? packet.ambiguity
          : {},
      source:
        packet.source &&
        typeof packet.source === "object"
          ? packet.source
          : {}
    });

    status.textContent = "Datos cargados. Confirma o solicita edición en el pop-up.";
    status.setAttribute("data-forge-state", "pending");
  }, true);

  globalThis.ForgeNuevaCotizacionRealPacket = Object.freeze({
    contractId,
    applyPacketToExistingPage,
    fieldModel: deps.fieldModel,
    validatePacket
  });

  return true;
}

const api = Object.freeze({ initAcceptedQuoteBridge });

globalThis.ForgeAcceptedQuoteBridge = api;

initAcceptedQuoteBridge();

export { initAcceptedQuoteBridge };
