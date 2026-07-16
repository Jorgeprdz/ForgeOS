import {
  calculateAcceptedQuote,
  validatePacket,
  isPdfSelection107z15p2R9C
} from "./forge-accepted-quote-adapter.js?v=r16j1b_segubeca_acceptance_20260714_9";
import { renderAcceptedQuote } from "./forge-benefit-summary-renderer.js?v=r16b_unified_dashboard_20260713_1";
import { createAcceptedQuoteReviewSnapshotBoundary } from "./forge-accepted-quote-review-snapshot.js?v=r16g2b1_review_snapshot_20260713_1";
import { buildClientRecommendationRationaleBoundary } from "./forge-client-recommendation-rationale-boundary.js?v=r16h3_client_rationale_20260714_1";
import { buildSalesPresentationBrowserContext } from "../../../advisor-os/presentation/browser/forge-sales-presentation-browser-context-adapter.js";
import { buildSalesPresentationPromptReviewPacket } from "../../../advisor-os/presentation/browser/forge-sales-presentation-prompt-builder.js";
import { buildSalesPresentationSlidePlanReviewPacket } from "../../../advisor-os/presentation/browser/forge-sales-presentation-slide-plan-generator.js";
import { buildSalesPresentationReviewPacket } from "../../../advisor-os/presentation/browser/forge-sales-presentation-review-packet-builder.js";
import { initializeSalesPresentationReviewState, getSalesPresentationReviewState, updateSalesPresentationSlide, applySalesPresentationApprovalDecision, revokeSalesPresentationApproval, applySalesPresentationExportAuthorization } from "../../../advisor-os/presentation/browser/forge-sales-presentation-review-state-store.js";
import { bindSalesPresentationReviewUi } from "../../../advisor-os/presentation/browser/forge-sales-presentation-editable-preview.js";
import { approveSalesPresentationReview } from "../../../advisor-os/presentation/browser/forge-sales-presentation-human-approval-gate.js";
import { authorizeSalesPresentationExport, printSalesPresentationToPdf } from "../../../advisor-os/presentation/browser/forge-sales-presentation-export-adapter.js";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function perfEnabledR16J1C1() {
  try {
    return globalThis.__FORGE_PERF_DIAGNOSTICS__ === true ||
      new URL(globalThis.location?.href || "http://localhost/")
        .searchParams.get("forgePerf") === "1";
  } catch {
    return false;
  }
}

function perfMarkR16J1C1(name) {
  if (!perfEnabledR16J1C1()) return;
  globalThis.performance?.mark?.(name);
}

function perfMeasureR16J1C1(name, start, end) {
  if (!perfEnabledR16J1C1()) return;
  try {
    globalThis.performance?.measure?.(name, start, end);
  } catch {}
}

function pdfTimestampR16J1C1(name, value = performance.now()) {
  if (!perfEnabledR16J1C1()) return value;
  const timeline = globalThis.__FORGE_PDF_TIMELINE__;
  if (timeline) timeline.timestamps[name] = value;
  return value;
}

function pdfIntervalR16J1C1(name, start, end) {
  const timeline = globalThis.__FORGE_PDF_TIMELINE__;
  if (!timeline) return;
  const startValue = timeline.timestamps[start];
  const endValue = timeline.timestamps[end];
  if (Number.isFinite(startValue) && Number.isFinite(endValue)) {
    timeline.intervals.push({ name, start: startValue, end: endValue });
  }
}

function finalizePdfTimelineR16J1C1() {
  const timeline = globalThis.__FORGE_PDF_TIMELINE__;
  if (!timeline) return;
  const selected = timeline.timestamps.PDF_SELECTED_TS;
  const popup = timeline.timestamps.POPUP_HOST_OPEN_TS;
  const stages = timeline.intervals
    .filter(({ start, end }) => end >= start)
    .sort((a, b) => a.start - b.start)
    .map((interval, index, all) => ({
      name: interval.name,
      startRelativeMs:
        Number.isFinite(selected) ? interval.start - selected : null,
      endRelativeMs:
        Number.isFinite(selected) ? interval.end - selected : null,
      durationMs: interval.end - interval.start,
      overlaps: all.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          interval.start < other.end &&
          interval.end > other.start,
      ),
    }));
  const intervals = timeline.intervals
    .filter(({ start, end }) =>
      end >= start &&
      Number.isFinite(selected) &&
      Number.isFinite(popup) &&
      end > selected &&
      start < popup
    )
    .map(({ start, end }) => ({
      start: Math.max(start, selected),
      end: Math.min(end, popup),
    }))
    .sort((a, b) => a.start - b.start);
  const merged = [];
  intervals.forEach(({ start, end }) => {
    const tail = merged.at(-1);
    if (tail && start <= tail.end) tail.end = Math.max(tail.end, end);
    else merged.push({ start, end });
  });
  const union = merged.reduce((sum, item) => sum + item.end - item.start, 0);
  const importInterval = timeline.intervals.find(
    (interval) => interval.name === "PDFJS_IMPORT",
  );
  const importDuration = importInterval
    ? importInterval.end - importInterval.start
    : null;
  const fetchDuration = timeline.resource?.PDFJS_RESOURCE_FETCH_MS;
  timeline.stages = stages;
  timeline.summary = {
    PDF_SELECTED_TO_POPUP_MS:
      Number.isFinite(selected) && Number.isFinite(popup) ? popup - selected : null,
    PDF_ACCOUNTED_UNION_MS: union,
    PDF_UNACCOUNTED_MS:
      Number.isFinite(selected) && Number.isFinite(popup)
        ? popup - selected - union
        : null,
    PDFJS_MODULE_EVALUATION_MS:
      Number.isFinite(importDuration) && Number.isFinite(fetchDuration)
        ? Math.max(0, importDuration - fetchDuration)
        : null,
    PDFJS_IMPORT_EVENT_LOOP_WAIT_MS: null,
  };
}

function perfSummaryR16J1C1() {
  if (!perfEnabledR16J1C1()) return null;
  const duration = name =>
    globalThis.performance
      ?.getEntriesByName?.(name)
      ?.at?.(-1)
      ?.duration ?? null;
  const summary = Object.freeze({
    BOOT_MS: duration("BOOT_MS"),
    QUOTE_ROUTE_MS: duration("QUOTE_ROUTE_MS"),
    PDFJS_IMPORT_MS: duration("PDFJS_IMPORT_MS"),
    ARRAYBUFFER_MS: duration("ARRAYBUFFER_MS"),
    PDF_OPEN_MS: duration("PDF_OPEN_MS"),
    TEXT_EXTRACTION_MS: duration("TEXT_EXTRACTION_MS"),
    PACKET_BUILD_MS: duration("PACKET_BUILD_MS"),
    CALCULATION_MS: duration("CALCULATION_MS"),
    POPUP_OPEN_MS: duration("POPUP_OPEN_MS"),
    APPROVAL_ACTIONS_READY_MS:
      duration("APPROVAL_ACTIONS_READY_MS"),
    TOTAL_PDF_FLOW_MS: duration("TOTAL_PDF_FLOW_MS"),
  });
  console.info("[Forge performance]", summary);
  return summary;
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
let previewCalculationCandidateR16J1C1 = null;
let previewCalculationR16J1C1 = null;
let previewCalculationPromiseR16J1C1 = null;
let previewCalculationErrorR16J1C1 = null;
let previewCalculationStateR16J1C1 = "IDLE";

function getCurrentQuoteCandidate() {
  return currentQuoteCandidateR16J0A;
}
function clearCurrentQuotePreviewCalculation() {
  previewCalculationCandidateR16J1C1 = null;
  previewCalculationR16J1C1 = null;
  previewCalculationPromiseR16J1C1 = null;
  previewCalculationErrorR16J1C1 = null;
  previewCalculationStateR16J1C1 = "IDLE";
}

function getCurrentQuotePreviewCalculation() {
  if (
    previewCalculationCandidateR16J1C1 !==
    currentQuoteCandidateR16J0A
  ) {
    return null;
  }

  return previewCalculationR16J1C1;
}

function getCurrentQuotePreviewCalculationState() {
  return Object.freeze({
    state: previewCalculationStateR16J1C1,
    candidateReady: Boolean(currentQuoteCandidateR16J0A),
    calculation: getCurrentQuotePreviewCalculation(),
    error:
      previewCalculationCandidateR16J1C1 ===
      currentQuoteCandidateR16J0A
        ? previewCalculationErrorR16J1C1
        : null,
    automaticCalculation: true,
    accepted: false,
    humanConfirmationRequired: true,
  });
}

async function calculateCurrentQuoteCandidatePreview(
  options = {},
) {
  const candidate = currentQuoteCandidateR16J0A;
  const runtime = quoteAcceptanceRuntimeR16J0A;
  const force = options.force === true;

  if (!candidate) {
    return null;
  }

  if (!runtime?.status) {
    throw new Error(
      "El runtime de cálculo preliminar no está disponible.",
    );
  }

  if (
    !force &&
    previewCalculationCandidateR16J1C1 === candidate &&
    previewCalculationR16J1C1
  ) {
    return previewCalculationR16J1C1;
  }

  if (
    !force &&
    previewCalculationCandidateR16J1C1 === candidate &&
    previewCalculationPromiseR16J1C1
  ) {
    return previewCalculationPromiseR16J1C1;
  }

  previewCalculationCandidateR16J1C1 = candidate;
  previewCalculationR16J1C1 = null;
  previewCalculationErrorR16J1C1 = null;
  previewCalculationStateR16J1C1 =
    "CALCULATING_PREVIEW";
  perfMarkR16J1C1("CALCULATION_START");

  runtime.submit.disabled = true;
  runtime.submit.setAttribute("aria-disabled", "true");
  runtime.status.textContent =
    "Calculando resultado automáticamente…";
  runtime.status.setAttribute(
    "data-forge-state",
    "calculating-preview",
  );
  runtime.setReadiness?.(
    "Extracción completa · calculando resultado automático",
    "calculating",
  );

  globalThis.dispatchEvent(
    new CustomEvent("forge:quote-preview-calculating", {
      detail: Object.freeze({
        version: "R16J1C1_03B",
        automatic: true,
        accepted: false,
        humanConfirmationRequired: true,
      }),
    }),
  );

  const operation = (async () => {
    try {
      const calculation =
        await calculateAcceptedQuote(candidate);

      if (currentQuoteCandidateR16J0A !== candidate) {
        return null;
      }

      previewCalculationR16J1C1 = calculation;
      previewCalculationErrorR16J1C1 = null;
      previewCalculationStateR16J1C1 = "READY";
      perfMarkR16J1C1("CALCULATION_END");
      perfMarkR16J1C1("QUOTE_CALCULATION_READY");
      perfMeasureR16J1C1(
        "CALCULATION_MS",
        "CALCULATION_START",
        "CALCULATION_END",
      );

      renderAcceptedQuote(calculation, {
        writeRuntimeGrid: runtime.writeRuntimeGrid,
      });

      runtime.submit.disabled = false;
      runtime.submit.setAttribute(
        "aria-disabled",
        "false",
      );
      runtime.status.textContent =
        "Resultado calculado automáticamente. " +
        "Revisa el PDF antes de confirmar.";
      runtime.status.setAttribute(
        "data-forge-state",
        "preview-calculated",
      );
      runtime.setIntakeState?.("READY", {
        message: runtime.status.textContent,
        resetResults: false,
      });
      runtime.setReadiness?.(
        "Resultado calculado automáticamente · " +
          "pendiente de revisión humana",
        "ready",
      );

      globalThis.dispatchEvent(
        new CustomEvent(
          "forge:quote-preview-calculated",
          {
            detail: Object.freeze({
              version: "R16J1C1_03B",
              automatic: true,
              accepted: false,
              humanConfirmationRequired: true,
            }),
          },
        ),
      );

      return calculation;
    } catch (error) {
      if (currentQuoteCandidateR16J0A === candidate) {
        previewCalculationR16J1C1 = null;
        previewCalculationErrorR16J1C1 =
          error instanceof Error
            ? error
            : new Error(String(error));
        previewCalculationStateR16J1C1 = "ERROR";

        runtime.submit.disabled = true;
        runtime.submit.setAttribute(
          "aria-disabled",
          "true",
        );
        runtime.status.textContent =
          previewCalculationErrorR16J1C1.message;
        runtime.status.setAttribute(
          "data-forge-state",
          "preview-calculation-error",
        );
        runtime.setIntakeState?.("ERROR", {
          message:
            "No se pudo calcular el resultado. " +
            "Reintenta la revisión.",
          resetResults: false,
        });
        runtime.setReadiness?.(
          "El cálculo preliminar requiere revisión",
          "error",
        );

        globalThis.dispatchEvent(
          new CustomEvent(
            "forge:quote-preview-calculation-error",
            {
              detail: Object.freeze({
                version: "R16J1C1_03B",
                automatic: true,
                accepted: false,
                message:
                  previewCalculationErrorR16J1C1.message,
              }),
            },
          ),
        );
      }

      throw error;
    } finally {
      if (
        previewCalculationPromiseR16J1C1 ===
        operation
      ) {
        previewCalculationPromiseR16J1C1 = null;
      }
    }
  })();

  previewCalculationPromiseR16J1C1 = operation;
  return operation;
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
    "Confirmando resultado revisado…";
  runtime.status.setAttribute(
    "data-forge-state",
    "confirming",
  );
  runtime.setReadiness?.(
    "Resultado revisado · confirmando cotización",
    "confirming",
  );

  try {
    const cachedCalculation =
      previewCalculationCandidateR16J1C1 === candidate
        ? previewCalculationR16J1C1
        : null;

    const calculation =
      cachedCalculation ||
      (await calculateCurrentQuoteCandidatePreview({
        force: true,
      }));

    if (!calculation) {
      throw new Error(
        "El motor no devolvió un cálculo preliminar válido.",
      );
    }

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
          version: "R16J1C1_03B",
          accepted: true,
          automatic: false,
          previewCalculationAutomatic: true,
          humanConfirmationRequired: true,
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
        "No se pudo confirmar la cotización. " +
        "Revisa los datos.",
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
            version: "R16J1C1_03B",
            message: error?.message || String(error),
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
    submit,
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
      void confirmCurrentQuoteCandidate().then(() => {
        perfMarkR16J1C1("APPROVAL_ACTIONS_READY");
        perfMeasureR16J1C1(
          "APPROVAL_ACTIONS_READY_MS",
          "PDF_SELECTED",
          "APPROVAL_ACTIONS_READY",
        );
        perfMeasureR16J1C1(
          "TOTAL_PDF_FLOW_MS",
          "PDF_SELECTED",
          "APPROVAL_ACTIONS_READY",
        );
        globalThis.ForgeQuoteAcceptanceEntrypointR16J0A
          ?.refresh?.();
        globalThis.ForgeSalesPresentationEntrypointR16J0
          ?.refresh?.();
        globalThis.ForgeQuoteActionDockR16J1B?.sync?.();
        perfSummaryR16J1C1();
      }).catch((error) => {
        console.error(`[${contractId}]`, error);
      });
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

  globalThis.addEventListener(
    "forge:accepted-quote-packet-ready",
    async event => {
      try {
        pdfTimestampR16J1C1("PACKET_EVENT_RECEIVED_TS");
        pdfIntervalR16J1C1(
          "EVENT_HANDOFF",
          "PACKET_EVENT_DISPATCH_TS",
          "PACKET_EVENT_RECEIVED_TS",
        );
        packet = validatePacket(event?.detail?.packet);
        currentQuoteCandidateR16J0A = packet;
        clearCurrentQuotePreviewCalculation();

        globalThis.dispatchEvent(
          new CustomEvent("forge:quote-candidate-ready", {
            detail: Object.freeze({
              version: "R16J1C1_03C2",
              ready: true,
              automatic: true,
              source: event?.detail?.source || null,
            }),
          }),
        );

        pdfTimestampR16J1C1("RESULT_RENDER_START_TS");
        applyPacketToExistingPage?.(packet);
        pdfTimestampR16J1C1("RESULT_RENDER_END_TS");
        pdfIntervalR16J1C1(
          "RESULT_RENDER",
          "RESULT_RENDER_START_TS",
          "RESULT_RENDER_END_TS",
        );
        pdfTimestampR16J1C1("CALCULATION_START_TS");
        await calculateCurrentQuoteCandidatePreview();
        pdfTimestampR16J1C1("CALCULATION_END_TS");
        pdfIntervalR16J1C1(
          "CALCULATION",
          "CALCULATION_START_TS",
          "CALCULATION_END_TS",
        );

        const confirmationPreview =
          buildOrviConfirmationPreview(packet);
        pdfTimestampR16J1C1("INVOCATION_PRESENT_START_TS");
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
        pdfTimestampR16J1C1("INVOCATION_PRESENT_END_TS");
        pdfTimestampR16J1C1("POPUP_HOST_OPEN_TS");
        pdfIntervalR16J1C1(
          "INVOCATION_PRESENT",
          "INVOCATION_PRESENT_START_TS",
          "INVOCATION_PRESENT_END_TS",
        );
        finalizePdfTimelineR16J1C1();
        if (
          globalThis.__FORGE_PERF_REPORT__?.scenario ===
          "PDF_TO_POPUP"
        ) {
          globalThis.__FORGE_STOP_PERF_CAPTURE__?.();
        }
        perfMarkR16J1C1("POPUP_OPEN");
        perfMeasureR16J1C1(
          "PDF_SELECTED_TO_POPUP_MS",
          "PDF_SELECTED",
          "POPUP_OPEN",
        );
        perfMeasureR16J1C1(
          "PACKET_TO_POPUP_MS",
          "PDF_PACKET_READY",
          "POPUP_OPEN",
        );
        globalThis.__FORGE_PERF_REPORT__ = Object.freeze({
          ...(globalThis.__FORGE_PERF_REPORT__ || {}),
          PDF_SELECTED_TO_POPUP_MS:
            globalThis.performance
              ?.getEntriesByName?.("PDF_SELECTED_TO_POPUP_MS")
              ?.at?.(-1)?.duration ?? null,
          PDFJS_IMPORT_MS:
            globalThis.performance
              ?.getEntriesByName?.("PDFJS_IMPORT_MS")
              ?.at?.(-1)?.duration ?? null,
          PDF_OPEN_MS:
            globalThis.performance
              ?.getEntriesByName?.("PDF_OPEN_MS")
              ?.at?.(-1)?.duration ?? null,
          TEXT_EXTRACTION_MS:
            globalThis.performance
              ?.getEntriesByName?.("TEXT_EXTRACTION_MS")
              ?.at?.(-1)?.duration ?? null,
          PACKET_TO_POPUP_MS:
            globalThis.performance
              ?.getEntriesByName?.("PACKET_TO_POPUP_MS")
              ?.at?.(-1)?.duration ?? null,
        });
        perfMeasureR16J1C1(
          "POPUP_OPEN_MS",
          "PACKET_READY",
          "POPUP_OPEN",
        );

        status.textContent =
          "Datos cargados. Confirma o solicita edición en el pop-up.";
        status.setAttribute("data-forge-state", "pending");
        setIntakeState("READY", {
          message: status.textContent,
          resetResults: false,
        });
      } catch (error) {
        status.textContent =
          error?.message || String(error);
        status.setAttribute("data-forge-state", "error");
        setIntakeState("ERROR", {
          message: status.textContent,
          resetResults: false,
        });
        console.error(`[${contractId}]`, error);
      }
    },
  );

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
    clearCurrentQuotePreviewCalculation();
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


      submit.disabled = true;
      submit.setAttribute("aria-disabled", "true");
      applyPacketToExistingPage?.(packet);

      const directPdfProcessed = isDirectPdfSyntheticPacketChange(
        input,
        file,
        event,
      );
      status.textContent = directPdfProcessed
        ? "PDF procesado localmente.\n"
          + "Calculando resultado automáticamente…"
        : `${file.name} cargado.\n`
          + "Calculando resultado automáticamente…";
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
  getCurrentQuoteCandidate,
  getCurrentQuotePreviewCalculation,
  getCurrentQuotePreviewCalculationState,
  calculateCurrentQuoteCandidatePreview,
  confirmCurrentQuoteCandidate, buildClientRecommendationRationaleReviewBoundary,
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

globalThis.addEventListener(
  "forge:quote-candidate-ready",
  () => {
    void calculateCurrentQuoteCandidatePreview()
      .catch(() => {});
  },
);

globalThis.addEventListener(
  "forge:quote-candidate-cleared",
  clearCurrentQuotePreviewCalculation,
);
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
  getCurrentQuoteCandidate,
  getCurrentQuotePreviewCalculation,
  getCurrentQuotePreviewCalculationState,
  calculateCurrentQuoteCandidatePreview,
  confirmCurrentQuoteCandidate, buildClientRecommendationRationaleReviewBoundary,
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
