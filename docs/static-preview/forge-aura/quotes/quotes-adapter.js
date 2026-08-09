import { parsePdfFileToAcceptedQuotePacket } from "../../quote-runtime/forge-pdf-browser-parser.js";
import {
  calculateAcceptedQuote,
  validatePacket,
} from "../../quote-runtime/forge-accepted-quote-adapter.js";
import "../../quote-runtime/forge-udi-mxn-runtime.js";
import { createAcceptedQuoteReviewSnapshotBoundary } from "../../quote-runtime/forge-accepted-quote-review-snapshot.js";
import {
  captureReviewedQuoteLifecycle,
  configureClientProvider,
} from "../../quote-runtime/forge-quote-lifecycle-browser-bridge-cartera001b.js";
import { buildQuoteBenefitSummary } from "../../quote-runtime/quote-benefit-summary-engine.js";
import { buildProductSpecificDecisionReadModel } from "../../quote-runtime/forge-product-specific-decision-read-model.js";
import { createQuotePrintableRouteController } from "../../quote-printable-runtime/forge-quote-printable-route-controller.js";
import { buildSalesPresentationBrowserContext } from "../../advisor-presentation-runtime/forge-sales-presentation-browser-context-adapter.js";
import { buildSalesPresentationPromptReviewPacket } from "../../advisor-presentation-runtime/forge-sales-presentation-prompt-builder.js";
import { buildSalesPresentationSlidePlanReviewPacket } from "../../advisor-presentation-runtime/forge-sales-presentation-slide-plan-generator.js";
import { buildSalesPresentationReviewPacket } from "../../advisor-presentation-runtime/forge-sales-presentation-review-packet-builder.js";
import {
  initializeSalesPresentationReviewState,
  getSalesPresentationReviewState,
  applySalesPresentationApprovalDecision,
  revokeSalesPresentationApproval,
  applySalesPresentationExportAuthorization,
} from "../../advisor-presentation-runtime/forge-sales-presentation-review-state-store.js";
import {
  bindSalesPresentationReviewUi,
  openSalesPresentationReviewUi,
} from "../../advisor-presentation-runtime/forge-sales-presentation-editable-preview.js";
import { approveSalesPresentationReview } from "../../advisor-presentation-runtime/forge-sales-presentation-human-approval-gate.js";
import {
  authorizeSalesPresentationExport,
  printSalesPresentationToPdf,
} from "../../advisor-presentation-runtime/forge-sales-presentation-export-adapter.js";

const PRODUCT_LABELS = Object.freeze({
  imagina_ser: "Imagina Ser",
  vida_mujer: "Vida Mujer",
  segubeca: "SeguBeca",
  orvi: "ORVI",
  alfa_medical_flex: "Alfa Medical Flex",
});

const QUOTE_PARSE_TIMEOUT_MS = 62000;
const QUOTE_CALCULATION_TIMEOUT_MS = 15000;

async function withQuoteTimeout(promise, timeoutMs, message) {
  let timer = null;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise((_, reject) => {
        timer = globalThis.setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== null) globalThis.clearTimeout(timer);
  }
}

function actionableQuoteLoadError(error) {
  const message = error?.message || String(error);
  if (/prima anual no está disponible|plazo de pagos no está disponible|paquete no contiene nativeResult|paquete no contiene context/i.test(message)) {
    return new Error("Este PDF no contiene una cotización calculable. Si es una póliza emitida o un documento de Cartera, cárgalo en Cartera.");
  }
  return error instanceof Error ? error : new Error(message);
}

function text(value) {
  return value == null ? "" : String(value).trim();
}

function normalize(value) {
  return text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function firstValue(...values) {
  return values.find((value) => value !== null && value !== undefined && value !== "") ?? null;
}

function finite(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function productFamily(packet, calculation) {
  const intelligence = calculation?.productIntelligence || packet?.productIntelligence || packet?.product_intelligence;
  const candidates = [
    calculation?.productFamily,
    packet?.productFamily,
    packet?.product_family,
    packet?.family,
    packet?.context?.productFamily,
    packet?.context?.product_family,
    intelligence?.identity?.product_family,
    intelligence?.identity?.detected_product_name,
  ].map(normalize).filter(Boolean);

  const joined = candidates.join(" ");
  if (joined.includes("imagina_ser")) return "imagina_ser";
  if (joined.includes("vida_mujer")) return "vida_mujer";
  if (joined.includes("segu_beca") || joined.includes("segubeca")) return "segubeca";
  if (joined.includes("orvi")) return "orvi";
  if (joined.includes("alfa_medical_flex") || joined.includes("alfa_medical")) return "alfa_medical_flex";
  return candidates[0] || "unknown";
}

function commercialProduct(packet, calculation) {
  const family = productFamily(packet, calculation);
  const raw = firstValue(
    calculation?.product,
    packet?.product,
    packet?.productName,
    packet?.context?.product,
    calculation?.nativeResult?.product,
    calculation?.productIntelligence?.identity?.detected_product_name,
  );
  const rawKey = normalize(raw);

  // AVE is a contribution/benefit construct in productive truth, not a surviving
  // commercial product identity. Prefer the actual family/product authority.
  if (!rawKey || rawKey === "ave" || rawKey === "aportacion_voluntaria_extra") {
    return PRODUCT_LABELS[family] || "Producto identificado por cotización";
  }

  return text(raw);
}

function money(value, currency = "MXN") {
  const number = finite(value);
  if (number === null) return null;
  const unit = text(currency).toUpperCase() || "MXN";
  if (["MXN", "USD"].includes(unit)) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: unit,
      maximumFractionDigits: 2,
    }).format(number);
  }
  return `${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(number)} ${unit}`;
}

function dateLabel(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? text(value) : new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(date);
}

function economicEvidence(calculation) {
  const metadata = calculation?.orviDashboardViewModel?.rate_context
    || calculation?.udiRateMetadata
    || calculation?.currencyMetadata
    || calculation?.nativeResult?.udiRateMetadata
    || calculation?.nativeResult?.currencyMetadata
    || {};
  const value = firstValue(
    metadata.currentUdiValue,
    metadata.current_value,
    metadata.udiValue,
    metadata.value,
    metadata.rate,
  );
  const asOf = firstValue(
    metadata.asOf,
    metadata.date,
    metadata.source_date,
    metadata.rateDate,
    metadata.updatedAt,
    metadata.timestamp,
  );
  const source = firstValue(metadata.source, metadata.provider, metadata.authority, metadata.sourceName);
  const status = firstValue(metadata.status, metadata.mode, calculation?.retirementScenarioStatus);
  return {
    available: value !== null || source !== null || asOf !== null,
    value,
    asOf: dateLabel(asOf),
    source: source || (value !== null ? "Motor económico existente" : null),
    status,
  };
}

function projectionFacts(calculation) {
  const output = [];
  const add = (id, label, value, unit = "MXN") => {
    const number = finite(value);
    if (number !== null) output.push({ id, label, value: number, display: money(number, unit), truth: "projected" });
  };
  add("total_recovery_mxn", "Recuperación proyectada", calculation?.totalRecoveryMXN);
  add("monthly_income_mxn", "Ingreso mensual proyectado", calculation?.monthlyIncomeMXN);
  add("annual_income_mxn", "Ingreso anual proyectado", calculation?.annualIncomeMXN);
  const projectedUdi = finite(calculation?.projectedUdiAtRetirement);
  if (projectedUdi !== null) {
    output.push({
      id: "projected_udi",
      label: "UDI proyectada al horizonte",
      value: projectedUdi,
      display: new Intl.NumberFormat("es-MX", { maximumFractionDigits: 6 }).format(projectedUdi),
      truth: "projected",
    });
  }
  return output;
}

function contractualFacts(packet, calculation) {
  const native = calculation?.nativeResult || packet?.nativeResult || {};
  const intelligence = calculation?.productIntelligence
    || calculation?.product_intelligence
    || packet?.productIntelligence
    || packet?.product_intelligence
    || {};
  const premium = intelligence?.premium_structure || {};
  const protection = intelligence?.protection_summary || {};
  const currency = firstValue(
    premium.currency,
    calculation?.currency,
    native.currency,
    packet?.currency,
    "UDI",
  );
  const facts = [];
  const add = (id, label, value, formatter = (candidate) => text(candidate)) => {
    if (value !== null && value !== undefined && value !== "") {
      facts.push({ id, label, value, display: formatter(value), truth: "contractual" });
    }
  };
  add("client", "Persona asegurada", firstValue(calculation?.client, native.insured, native.prospect, packet?.insured, packet?.name));
  add(
    "annual_premium",
    "Prima anual",
    firstValue(
      premium.total_annual_premium,
      native.totalAnnualPremium,
      native.annualPremium,
      packet?.annualPremium,
      calculation?.annualPremium,
    ),
    (value) => money(value, currency),
  );
  add("payment_years", "Plazo de pago", firstValue(calculation?.paymentYears, native.paymentYears, native.paymentTerm, packet?.paymentYears, packet?.paymentTerm), (value) => /año/i.test(text(value)) ? text(value) : `${text(value)} años`);
  add(
    "sum_assured",
    "Suma asegurada",
    firstValue(
      protection.basic_sum_assured,
      native.sumAssured,
      native.sumInsured,
      packet?.sumAssured,
      packet?.sumInsured,
    ),
    (value) => money(value, currency),
  );
  add("coverage_period", "Vigencia / cobertura", firstValue(calculation?.coveragePeriod, native.policyTerm, native.coveragePeriod, packet?.coveragePeriod));
  add("quote_date", "Fecha de cotización", firstValue(calculation?.quoteDate, native.quoteDate, packet?.quoteDate), dateLabel);
  return facts;
}

function currentFacts(calculation) {
  const output = [];
  const add = (id, label, value) => {
    const number = finite(value);
    if (number !== null) output.push({ id, label, value: number, display: money(number, "MXN"), truth: "current" });
  };
  add("contributed_mxn", "Aportación equivalente hoy", calculation?.totalContributedMXN);
  add("protection_mxn", "Protección equivalente hoy", calculation?.currentProtectionMXN);
  return output;
}

function intelligenceModel(packet, calculation) {
  const intelligence = calculation?.productIntelligence || calculation?.product_intelligence || packet?.productIntelligence || packet?.product_intelligence || null;
  if (!intelligence) return null;
  const missing = intelligence.missing_information || intelligence.missingInformation || [];
  const identity = intelligence.identity || {};
  const notes = intelligence.observations || intelligence.notes || intelligence.warnings || [];
  return {
    schema: intelligence?.schema?.id || intelligence?.schemaVersion || null,
    objective: firstValue(intelligence.objective, intelligence.purpose, intelligence.client_objective, identity.objective),
    structure: firstValue(intelligence.structure, intelligence.product_structure, intelligence.premium_structure),
    restrictions: intelligence.restrictions || intelligence.constraints || [],
    components: intelligence.components || intelligence.coverages || intelligence.protection_summary || null,
    missing: Array.isArray(missing) ? missing : [missing].filter(Boolean),
    notes: Array.isArray(notes) ? notes : [notes].filter(Boolean),
  };
}

function buildViewModel(packet, calculation) {
  const detectedFamily = productFamily(packet, calculation);
  const blocks = buildQuoteBenefitSummary({
    productFamily: detectedFamily,
    product: commercialProduct(packet, calculation),
    nativeResult: calculation?.nativeResult || packet?.nativeResult || {},
    context: calculation?.context || packet?.context || {},
    udiProjection: calculation?.udiProjection || packet?.udiProjection || {},
    currencyMetadata: calculation?.udiRateMetadata || calculation?.currencyMetadata || packet?.udiRateMetadata || packet?.currencyMetadata || {},
    productIntelligence: calculation?.productIntelligence || packet?.productIntelligence || null,
  });
  const productDecision = buildProductSpecificDecisionReadModel({
    packet,
    calculation,
    benefitSummary: blocks,
  });
  const family = productDecision?.productType || detectedFamily;

  return Object.freeze({
    product: commercialProduct(packet, calculation),
    family,
    sourceFile: packet?.fileName || packet?.source?.fileName || null,
    source: packet?.source || "accepted_quote_packet",
    contractual: contractualFacts(packet, calculation),
    current: currentFacts(calculation),
    projected: projectionFacts(calculation),
    economicEvidence: economicEvidence(calculation),
    intelligence: intelligenceModel(packet, calculation),
    benefitBlocks: Array.isArray(blocks) ? blocks : [],
    productDecision,
    hasProductIntelligence: Boolean(calculation?.productIntelligence || packet?.productIntelligence || packet?.product_intelligence),
    humanConfirmationRequired: productDecision?.humanDecisionRequired !== false,
  });
}

export function createQuotesProductiveAdapter({ client = null } = {}) {
  configureClientProvider(client ? () => client : null);
  const snapshotBoundary = createAcceptedQuoteReviewSnapshotBoundary();
  let packet = null;
  let calculation = null;
  let viewModel = null;
  let printableController = null;
  let presentationBound = false;
  let lifecycleReceipt = null;

  const snapshot = () => snapshotBoundary.getSnapshot();

  function clear() {
    packet = null;
    calculation = null;
    viewModel = null;
    printableController = null;
    snapshotBoundary.clear();
    lifecycleReceipt = null;
  }

  async function loadFile(file) {
    clear();
    if (!file) throw new Error("Selecciona una cotización para continuar.");
    try {
      let candidate;
      if (file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")) {
        candidate = await withQuoteTimeout(
          parsePdfFileToAcceptedQuotePacket(file),
          QUOTE_PARSE_TIMEOUT_MS,
          "El PDF tardó demasiado en procesarse. Intenta nuevamente con el archivo original.",
        );
      } else {
        const raw = await file.text();
        candidate = JSON.parse(raw);
      }
      packet = validatePacket(candidate);
      calculation = await withQuoteTimeout(
        calculateAcceptedQuote(packet),
        QUOTE_CALCULATION_TIMEOUT_MS,
        "El cálculo de la cotización tardó demasiado. Forge detuvo la espera para no dejar la pantalla cargando indefinidamente.",
      );
      viewModel = buildViewModel(packet, calculation);
      return Object.freeze({ packet, calculation, viewModel });
    } catch (error) {
      throw actionableQuoteLoadError(error);
    }
  }

  async function accept() {
    if (!packet || !calculation) throw new Error("Primero procesa una cotización válida.");
    const accepted = snapshotBoundary.setSnapshot({ acceptedQuote: packet, calculation });
    lifecycleReceipt = await captureReviewedQuoteLifecycle({ reviewSnapshot: accepted });
    return Object.freeze({ accepted, lifecycleReceipt });
  }

  function getPrintableController() {
    if (printableController) return printableController;
    printableController = createQuotePrintableRouteController({
      snapshotProvider: snapshot,
      identityProvider: async () => lifecycleReceipt,
      storage: (() => {
        try { return globalThis.localStorage || null; } catch { return null; }
      })(),
    });
    return printableController;
  }

  async function previewPrintable(pageFormat = "A4") {
    if (!snapshot()) throw new Error("Confirma la cotización antes de generar el documento.");
    return getPrintableController().preview({ requestedPageFormat: pageFormat });
  }

  async function downloadPrintable(pageFormat = "A4") {
    if (!snapshot()) throw new Error("Confirma la cotización antes de descargar el PDF.");
    getPrintableController().setPageFormat(pageFormat);
    return getPrintableController().download({
      userInitiated: true,
      documentRef: document,
      urlRef: URL,
    });
  }

  function buildPresentationBundle(overrides = {}) {
    const accepted = snapshot();
    if (!accepted) return null;
    const contextPacket = buildSalesPresentationBrowserContext({
      snapshot: accepted,
      prospectContext: overrides.prospectContext || null,
      advisorNotes: overrides.advisorNotes || null,
      clientObjective: overrides.clientObjective || null,
      clientRecommendationRationale: overrides.clientRecommendationRationale || null,
    });
    const promptPacket = buildSalesPresentationPromptReviewPacket({ contextPacket });
    const slidePlanPacket = buildSalesPresentationSlidePlanReviewPacket({ contextPacket, promptPacket });
    const reviewPacket = buildSalesPresentationReviewPacket({ contextPacket, promptPacket, slidePlanPacket });
    return Object.freeze({ contextPacket, promptPacket, slidePlanPacket, reviewPacket });
  }

  function approveReview({ approvedBy, reviewerType = "HUMAN" } = {}) {
    return applySalesPresentationApprovalDecision(
      approveSalesPresentationReview({
        reviewState: getSalesPresentationReviewState(),
        approvedBy,
        reviewerType,
      }),
    );
  }

  function revokeApproval(reason = "HUMAN_REVOKED_FROM_AURA_QUOTES") {
    return revokeSalesPresentationApproval(reason);
  }

  function authorizeExport() {
    return applySalesPresentationExportAuthorization(
      authorizeSalesPresentationExport({ reviewState: getSalesPresentationReviewState() }),
    );
  }

  function exportPresentation() {
    return printSalesPresentationToPdf({ reviewState: getSalesPresentationReviewState() });
  }

  function ensurePresentationBinding() {
    if (presentationBound) return;
    bindSalesPresentationReviewUi({
      buildReviewBundle: buildPresentationBundle,
      startReviewSession: (overrides = {}) => {
        const bundle = buildPresentationBundle(overrides);
        return bundle?.reviewPacket?.artifactsReadyForReview
          ? initializeSalesPresentationReviewState(bundle.reviewPacket)
          : null;
      },
      approveReview,
      revokeApproval,
      authorizeExport,
      exportToPrintPdf: exportPresentation,
    });
    presentationBound = true;
  }

  function openPresentation(overrides = {}) {
    if (!snapshot()) throw new Error("Confirma la cotización antes de abrir Presentation Maker.");
    ensurePresentationBinding();
    let state = getSalesPresentationReviewState();
    if (!state) {
      const bundle = buildPresentationBundle(overrides);
      if (!bundle?.reviewPacket?.artifactsReadyForReview) {
        throw new Error("La cotización todavía no contiene todos los artefactos requeridos por Presentation Maker.");
      }
      state = initializeSalesPresentationReviewState(bundle.reviewPacket);
    }
    if (!openSalesPresentationReviewUi()) throw new Error("Presentation Maker no pudo abrir su revisión editable.");
    return state;
  }

  return Object.freeze({
    loadFile,
    accept,
    clear,
    snapshot,
    previewPrintable,
    downloadPrintable,
    openPresentation,
    state() {
      return Object.freeze({ packet, calculation, viewModel, accepted: Boolean(snapshot()), lifecycleReceipt });
    },
  });
}

export const __quotesAuraTest = Object.freeze({
  normalizeCommercialProductLabel: commercialProduct,
  productFamily,
  buildViewModel,
  withQuoteTimeout,
  timeoutMs: Object.freeze({ parse: QUOTE_PARSE_TIMEOUT_MS, calculation: QUOTE_CALCULATION_TIMEOUT_MS }),
});