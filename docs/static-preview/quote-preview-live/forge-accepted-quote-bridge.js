import {
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C
} from "./forge-accepted-quote-adapter.js?v=r16j1b_segubeca_acceptance_20260714_9";
import { renderAcceptedQuote } from "./forge-benefit-summary-renderer.js?v=r16b_unified_dashboard_20260713_1";
import { createAcceptedQuoteReviewSnapshotBoundary } from "./forge-accepted-quote-review-snapshot.js?v=r16g2b1_review_snapshot_20260713_1";
import { buildClientRecommendationRationaleBoundary } from "./forge-client-recommendation-rationale-boundary.js?v=r16h3_client_rationale_20260714_1";
import { buildSalesPresentationBrowserContext } from "./forge-sales-presentation-browser-context-adapter.js?v=r16h3_context_20260714_1";
import { buildSalesPresentationPromptReviewPacket } from "./forge-sales-presentation-prompt-builder.js?v=r16h3_prompt_20260714_1";
import { buildSalesPresentationSlidePlanReviewPacket } from "./forge-sales-presentation-slide-plan-generator.js?v=r16h3_slides_20260714_1";
import { buildSalesPresentationReviewPacket } from "./forge-sales-presentation-review-packet-builder.js?v=r16g2b3f_review_20260714_1";
import { initializeSalesPresentationReviewState, getSalesPresentationReviewState, updateSalesPresentationSlide, applySalesPresentationApprovalDecision, revokeSalesPresentationApproval, applySalesPresentationExportAuthorization } from "./forge-sales-presentation-review-state-store.js?v=r16g5b_state_20260714_1";
import { bindSalesPresentationReviewUi } from "./forge-sales-presentation-editable-preview.js?v=r16j1_workspace_20260714_1";
import { approveSalesPresentationReview } from "./forge-sales-presentation-human-approval-gate.js?v=r16g5b_approval_20260714_1";
import { authorizeSalesPresentationExport, printSalesPresentationToPdf } from "./forge-sales-presentation-export-adapter.js?v=r16g5b_export_20260714_1";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function explicitCanonicalMoney(money) {
  if (!isRecord(money) || money.truth_status !== "source_provided") return null;
  if (money.value === null || money.value === undefined || money.value === "") {
    return null;
  }
  const numeric = Number(money.value);
  if (!Number.isFinite(numeric)) return null;
  const currency = String(money.currency || "").trim().toUpperCase();
  const formatted = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 2,
  }).format(numeric);
  return [formatted, currency].filter(Boolean).join(" ");
}

function buildOrviConfirmationPreview(packet = {}) {
  const nativeResult = isRecord(packet.nativeResult) ? packet.nativeResult : {};
  const context = isRecord(packet.context) ? packet.context : {};
  const model = packet.productIntelligence || packet.product_intelligence;
  if (
    model?.schema?.id !== "forge.product_intelligence.orvi" ||
    model?.ownership?.canonical_owner !== "product-intelligence"
  ) {
    return { nativeResult, context };
  }

  const paymentYears = Number(model?.premium_structure?.payment_term_years);
  const product = model?.identity?.detected_product_name || nativeResult.product || null;
  const annualPremium = explicitCanonicalMoney(
    model?.premium_structure?.basic_annual_premium,
  );
  const totalAnnualPremium = explicitCanonicalMoney(
    model?.premium_structure?.total_annual_premium,
  );

  return {
    nativeResult: {
      ...nativeResult,
      product,
      sumInsured: explicitCanonicalMoney(
        model?.protection_summary?.basic_sum_assured,
      ),
      premiumTable: {
        ...(isRecord(nativeResult.premiumTable) ? nativeResult.premiumTable : {}),
        annual: annualPremium,
        plannedAnnual: totalAnnualPremium,
      },
      paymentTerm:
        Number.isInteger(paymentYears) && paymentYears > 0
          ? `${paymentYears} años`
          : null,
    },
    context: {
      ...context,
      productFamily: "ORVI",
      product_family: "ORVI",
    },
  };
}

function isDirectPdfSyntheticPacketChange(input, file, event) {
  if (event?.isTrusted !== false) return false;
  if (!/\.accepted-quote\.json$/i.test(file?.name || "")) return false;

  const uploadContainer = input?.closest?.("section, div, label");
  const pdfStatus = uploadContainer?.querySelector?.(
    "[data-forge-pdf-status='true']",
  );

  return (
    pdfStatus?.dataset?.tone === "success" &&
    /^PDF convertido\b/i.test(pdfStatus.textContent || "")
  );
}

const acceptedQuoteReviewSnapshotBoundary =
  createAcceptedQuoteReviewSnapshotBoundary();
let currentQuoteCandidateR16J0A = null;
let quoteAcceptanceRuntimeR16J0A = null;

function getCurrentQuoteCandidate() {
  return currentQuoteCandidateR16J0A;
}

async function confirmCurrentQuoteCandidate() {
  const candidate = currentQuoteCandidateR16J0A;
  const runtime = quoteAcceptanceRuntimeR16J0A;

  if (!candidate) {
    throw new Error(
      "No hay una cotización extraída pendiente de confirmación.",
    );
  }

  if (!runtime?.status) {
    throw new Error(
      "El runtime de confirmación de cotización no está disponible.",
    );
  }

  runtime.status.textContent =
    "Calculando cotización confirmada…";
  runtime.status.setAttribute(
    "data-forge-state",
    "calculating",
  );
  runtime.setReadiness?.(
    "Cotización confirmada · calculando resultado",
    "calculating",
  );

  try {
    const calculation =
      await calculateAcceptedQuote(candidate);

    acceptedQuoteReviewSnapshotBoundary.setSnapshot({
      acceptedQuote: candidate,
      calculation,
    });

    renderAcceptedQuote(calculation, {
      writeRuntimeGrid: runtime.writeRuntimeGrid,
    });

    runtime.status.textContent =
      "Cotización confirmada y guardada durante esta sesión.";
    runtime.status.setAttribute(
      "data-forge-state",
      "accepted",
    );

    runtime.setIntakeState?.("READY", {
      message: runtime.status.textContent,
    });

    runtime.setReadiness?.(
      "Cotización confirmada · lista para revisión comercial",
      "accepted",
    );

    globalThis.dispatchEvent(
      new CustomEvent("forge:accepted-quote-confirmed", {
        detail: Object.freeze({
          version: "R16J0A",
          accepted: true,
          automatic: false,
        }),
      }),
    );

    return getAcceptedQuoteReviewSnapshot();
  } catch (error) {
    acceptedQuoteReviewSnapshotBoundary.clear();

    runtime.status.textContent =
      error?.message || String(error);
    runtime.status.setAttribute(
      "data-forge-state",
      "error",
    );

    runtime.setIntakeState?.("ERROR", {
      message:
        "No se pudo confirmar la cotización. Revisa los datos.",
      resetResults: false,
    });

    runtime.setReadiness?.(
      "La cotización requiere revisión antes de presentar",
      "error",
    );

    globalThis.dispatchEvent(
      new CustomEvent(
        "forge:accepted-quote-confirmation-error",
        {
          detail: Object.freeze({
            version: "R16J0A",
            message:
              error?.message || String(error),
          }),
        },
      ),
    );

    throw error;
  }
}


function getAcceptedQuoteReviewSnapshot() {
  return acceptedQuoteReviewSnapshotBoundary.getSnapshot();
}

function buildClientRecommendationRationaleReviewBoundary(
  input = {},
) {
  return buildClientRecommendationRationaleBoundary(input);
}

function getSalesPresentationContextReviewPacket(overrides = {}) {
  const snapshot = getAcceptedQuoteReviewSnapshot();
  if (!snapshot) return null;

  for (const key of [
    "reasonWhy",
    "advisorReasonWhy",
    "advisorMotivation",
    "managerCoachingSignal",
  ]) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      throw new TypeError(
        `${key} belongs to manager-os and cannot enter a client presentation`,
      );
    }
  }

  const clientRecommendationRationale =
    overrides.clientRecommendationRationale == null
      ? null
      : buildClientRecommendationRationaleReviewBoundary(
          overrides.clientRecommendationRationale,
        );

  return buildSalesPresentationBrowserContext({
    snapshot,
    prospectContext: overrides.prospectContext ?? null,
    advisorNotes: overrides.advisorNotes ?? null,
    clientObjective: overrides.clientObjective ?? null,
    clientRecommendationRationale,
  });
}
function buildSalesPresentationCoreReviewBundle(overrides = {}) {
  const contextPacket = getSalesPresentationContextReviewPacket(overrides);
  if (!contextPacket) return null;

  const promptPacket =
    buildSalesPresentationPromptReviewPacket({ contextPacket });

  const slidePlanPacket =
    buildSalesPresentationSlidePlanReviewPacket({
      contextPacket,
      promptPacket,
    });

  const reviewPacket =
    buildSalesPresentationReviewPacket({
      contextPacket,
      promptPacket,
      slidePlanPacket,
    });

  return Object.freeze({
    contextPacket,
    promptPacket,
    slidePlanPacket,
    reviewPacket,
  });
}

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
  acceptedQuoteReviewSnapshotBoundary.clear();

  const intakeState = globalThis.ForgeQuoteIntakeState;
  const setIntakeState = (state, options) =>
    intakeState?.setState?.(state, options);


quoteAcceptanceRuntimeR16J0A = Object.freeze({
  status,
  setReadiness,
  writeRuntimeGrid,
  setIntakeState,
});

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
      acceptedQuoteReviewSnapshotBoundary.clear();

      if (packet) {
        currentQuoteCandidateR16J0A = packet;

        globalThis.dispatchEvent(
          new CustomEvent("forge:quote-candidate-ready", {
            detail: Object.freeze({
              version: "R16J1B",
              ready: true,
              automatic: false,
              source: "LEGACY_MODAL_PERSISTED",
            }),
          }),
        );
      }

      status.textContent =
        "Resultado extraído. Confirma la cotización para calcularla.";
      status.setAttribute("data-forge-state", "ready");

      setIntakeState("READY", {
        message: status.textContent,
        resetResults: false,
      });

      setReadiness?.(
        "Resultado extraído · pendiente de confirmación humana",
        "ready",
      );
    },
    onEditRequested() {
      acceptedQuoteReviewSnapshotBoundary.clear();
      status.textContent = "Edición solicitada. No se guardó la cotización.";
      status.setAttribute("data-forge-state", "edit");
      setReadiness?.("Resultado extraído · requiere edición", "edit");
    },
    onError(error) {
      acceptedQuoteReviewSnapshotBoundary.clear();
      status.textContent = "No se pudo guardar. El pop-up permanece abierto.";
      status.setAttribute("data-forge-state", "error");
      setIntakeState("ERROR", {
        message: status.textContent,
        resetResults: true,
      });
      console.error(`[${contractId}]`, error);
    }
  });

  input.accept = ".json,application/json,.pdf,application/pdf";
  input.setAttribute("data-forge-local-packet-input", "true");
  input.removeAttribute("data-forge-pdf-read-allowed");

  label.textContent = "Seleccionar PDF";
  label.setAttribute("aria-label", "Seleccionar PDF de cotización");
  submit.textContent = "Revisar resultado";
  submit.disabled = true;
  submit.setAttribute("aria-disabled", "true");
  status.textContent = "Selecciona un archivo para comenzar.";

  if (uploadSection) {
    const heading = uploadSection.querySelector("h2");
    const description = uploadSection.querySelector("p");

    if (heading) {
      heading.textContent = "Carga tu cotización";
    }

    if (description) {
      description.textContent =
        "Selecciona el PDF de Solución Online. Se procesa localmente en tu navegador.";
    }
  }

  input.addEventListener("change", async event => {
    event.stopImmediatePropagation();

    acceptedQuoteReviewSnapshotBoundary.clear();
  currentQuoteCandidateR16J0A = null;

  globalThis.dispatchEvent(
    new CustomEvent("forge:quote-candidate-cleared", {
      detail: Object.freeze({
        version: "R16J0A",
      }),
    }),
  );

    packet = null;
    submit.disabled = true;
    submit.setAttribute("aria-disabled", "true");

    const file = input.files && input.files[0];

    if (!file) {
      setIntakeState("EMPTY", { resetResults: true });
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
    currentQuoteCandidateR16J0A = packet;

    globalThis.dispatchEvent(
      new CustomEvent("forge:quote-candidate-ready", {
        detail: Object.freeze({
          version: "R16J0A",
          ready: true,
          automatic: false,
        }),
      }),
    );


      submit.disabled = false;
      submit.setAttribute("aria-disabled", "false");

      applyPacketToExistingPage?.(packet);

      const directPdfProcessed = isDirectPdfSyntheticPacketChange(
        input,
        file,
        event,
      );
      status.textContent = directPdfProcessed
        ? "PDF procesado localmente. Listo para revisar."
        : `${file.name} cargado. Listo para revisar.`;
      status.setAttribute("data-forge-state", "ready");
      setIntakeState("READY", { message: status.textContent });
      if (directPdfProcessed) {
        setReadiness?.(
          "PDF procesado localmente · listo para revisar",
          "ready",
        );
      }
    } catch (error) {
      status.textContent = error && error.message ? error.message : String(error);
      status.setAttribute("data-forge-state", "error");
      setIntakeState("ERROR", {
        message: status.textContent,
        resetResults: true,
      });
    }
  }, true);

  submit.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!packet) return;

    applyPacketToExistingPage?.(packet);

    const confirmationPreview = buildOrviConfirmationPreview(packet);
    invocation.present({
      nativeResult: confirmationPreview.nativeResult,
      context: confirmationPreview.context,
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
    setIntakeState("READY", { message: status.textContent });
  }, true);

  globalThis.ForgeNuevaCotizacionRealPacket = Object.freeze({
    contractId,
    applyPacketToExistingPage,
    fieldModel: deps.fieldModel,
    validatePacket
  });

  return true;
}

function startSalesPresentationReviewSession(overrides = {}) {
  const bundle = buildSalesPresentationCoreReviewBundle(overrides);
  if (!bundle?.reviewPacket?.artifactsReadyForReview) return null;
  return initializeSalesPresentationReviewState(bundle.reviewPacket);
}

function getCurrentSalesPresentationReviewState() {
  return getSalesPresentationReviewState();
}

function updateSalesPresentationReviewSlide(slideId, patch) {
  return updateSalesPresentationSlide(slideId, patch);
}

function approveCurrentSalesPresentationReview({ approvedBy, reviewerType = "HUMAN" } = {}) {
  return applySalesPresentationApprovalDecision(
    approveSalesPresentationReview({
      reviewState: getSalesPresentationReviewState(),
      approvedBy,
      reviewerType,
    }),
  );
}

function revokeCurrentSalesPresentationApproval(reason = "HUMAN_REVOKED") {
  return revokeSalesPresentationApproval(reason);
}

function authorizeCurrentSalesPresentationExport() {
  return applySalesPresentationExportAuthorization(
    authorizeSalesPresentationExport({
      reviewState: getSalesPresentationReviewState(),
    }),
  );
}

function exportCurrentSalesPresentationToPrintPdf() {
  return printSalesPresentationToPdf({
    reviewState: getSalesPresentationReviewState(),
  });
}

const api = Object.freeze({
  getCurrentQuoteCandidate, confirmCurrentQuoteCandidate, buildClientRecommendationRationaleReviewBoundary,
  initAcceptedQuoteBridge,
  buildOrviConfirmationPreview,
  buildSalesPresentationCoreReviewBundle,
  startSalesPresentationReviewSession,
  getAcceptedQuoteReviewSnapshot,
  getSalesPresentationContextReviewPacket,
  getCurrentSalesPresentationReviewState,
  updateSalesPresentationReviewSlide,
  approveCurrentSalesPresentationReview,
  revokeCurrentSalesPresentationApproval,
  authorizeCurrentSalesPresentationExport,
  exportCurrentSalesPresentationToPrintPdf,
  isDirectPdfSyntheticPacketChange,
});

globalThis.ForgeAcceptedQuoteBridge = api;

bindSalesPresentationReviewUi({
  buildReviewBundle: buildSalesPresentationCoreReviewBundle,
  startReviewSession: startSalesPresentationReviewSession,
  approveReview: approveCurrentSalesPresentationReview,
  revokeApproval: revokeCurrentSalesPresentationApproval,
  authorizeExport: authorizeCurrentSalesPresentationExport,
  exportToPrintPdf: exportCurrentSalesPresentationToPrintPdf,
});

initAcceptedQuoteBridge();

export {
  getCurrentQuoteCandidate, confirmCurrentQuoteCandidate, buildClientRecommendationRationaleReviewBoundary,
  approveCurrentSalesPresentationReview,
  authorizeCurrentSalesPresentationExport,
  buildOrviConfirmationPreview,
  buildSalesPresentationCoreReviewBundle,
  exportCurrentSalesPresentationToPrintPdf,
  getAcceptedQuoteReviewSnapshot,
  getCurrentSalesPresentationReviewState,
  getSalesPresentationContextReviewPacket,
  initAcceptedQuoteBridge,
  isDirectPdfSyntheticPacketChange,
  revokeCurrentSalesPresentationApproval,
  startSalesPresentationReviewSession,
  updateSalesPresentationReviewSlide,
};
