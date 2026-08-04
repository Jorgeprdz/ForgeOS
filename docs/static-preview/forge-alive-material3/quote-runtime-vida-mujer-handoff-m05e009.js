import {
  buildQuoteBenefitSummary,
} from "../quote-runtime/quote-benefit-summary-engine.js";

const VERSION = "M05E-009";
const PRODUCT_FAMILY = "vida_mujer";
const PRODUCT_NAME = "Vida Mujer";
const PRODUCT_INTELLIGENCE_SCHEMA =
  "forge.product_intelligence.vida_mujer";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return null;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function finite(value) {
  if (isRecord(value) && Object.hasOwn(value, "value")) {
    return finite(value.value);
  }
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function positive(value) {
  const parsed = finite(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function firstPositive(...values) {
  for (const value of values) {
    const parsed = positive(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function arrays(...values) {
  return values.flatMap((value) => Array.isArray(value) ? value : []);
}

function isVidaMujer(candidate = {}, calculation = {}) {
  const native = calculation.nativeResult || candidate.nativeResult || {};
  const model = calculation.productIntelligence || candidate.productIntelligence || {};
  const values = [
    candidate.product,
    candidate.productFamily,
    candidate.product_family,
    candidate.family,
    candidate.context?.product,
    candidate.context?.productFamily,
    candidate.context?.product_family,
    calculation.product,
    calculation.productFamily,
    calculation.product_family,
    native.product,
    native.productFamily,
    native.product_family,
    model.schema?.id,
    model.identity?.detected_product_name,
  ].map(normalize);
  return values.some((value) =>
    value.includes("vida_mujer") || value.includes("vidamujer"));
}

function sourceMoney(value, currency = "UDI") {
  const parsed = positive(value);
  return parsed === null
    ? null
    : Object.freeze({
        value: parsed,
        currency,
        truth_status: "source_provided",
      });
}

function rateMetadata(candidate = {}, calculation = {}, native = {}) {
  return calculation.udiRateMetadata ||
    calculation.currencyMetadata ||
    candidate.udiRateMetadata ||
    candidate.currencyMetadata ||
    native.udiRateMetadata ||
    native.currencyMetadata ||
    {};
}

function coverageName(coverage) {
  return String(
    coverage?.name ??
    coverage?.label ??
    coverage?.coverage ??
    coverage?.description ??
    coverage?.benefit ??
    coverage?.code ??
    "",
  ).trim();
}

function coverageAmount(coverage) {
  return firstPositive(
    coverage?.sumAssured,
    coverage?.sumInsured,
    coverage?.sumaAsegurada,
    coverage?.insuredAmount,
    coverage?.amount,
    coverage?.value,
  );
}

function sourceCoverages(native = {}) {
  return arrays(
    native.coverages,
    native.basicCoverages,
    native.includedCoverages,
    native.additionalCoverages,
    native.contractedCoverages,
  ).map((coverage) => ({
    code: String(coverage?.code || "").trim() || null,
    name: coverageName(coverage) || null,
    sum_assured: sourceMoney(coverageAmount(coverage)),
    annual_premium: sourceMoney(
      firstPositive(
        coverage?.annualPremium,
        coverage?.premium,
        coverage?.primaAnual,
      ),
    ),
    status: "contracted_from_source",
  }));
}

function buildVidaMujerProductIntelligence(candidate = {}, calculation = {}) {
  if (!isVidaMujer(candidate, calculation)) return null;

  const existing = calculation.productIntelligence ||
    candidate.productIntelligence ||
    candidate.product_intelligence ||
    calculation.nativeResult?.productIntelligence ||
    candidate.nativeResult?.productIntelligence;
  if (
    isRecord(existing) &&
    normalize(existing.schema?.id).includes("vida_mujer")
  ) {
    return existing;
  }

  const native = calculation.nativeResult || candidate.nativeResult || {};
  const rate = rateMetadata(candidate, calculation, native);
  const sumAssured = firstPositive(
    calculation.sumAssured,
    calculation.sumInsured,
    native.sumAssured,
    native.sumInsured,
    native.basicSumAssured,
    candidate.sumAssured,
    candidate.sumInsured,
  );
  const annualBase = firstPositive(
    calculation.annualPremium,
    native.totalAnnualPremium,
    native.annualPremium,
    native.premiumTable?.annual,
    candidate.annualPremium,
  );
  const annualWithAve = firstPositive(
    calculation.annualPremiumWithAve,
    calculation.annualPremiumTotalWithAve,
    native.annualPremiumWithAve,
    native.annualPremiumTotalWithAve,
    native.primaAnualTotalConAve,
    native.premiumTable?.plannedAnnual,
    candidate.annualPremiumTotalWithAve,
    candidate.plannedOrAvePremium,
  );
  const paymentYears = firstPositive(
    calculation.paymentYears,
    native.paymentYears,
    native.premiumPayingYears,
    native.paymentTerm,
    candidate.paymentYears,
    20,
  );
  const totalAnnual = annualWithAve || annualBase;

  return deepFreeze({
    schema: {
      id: PRODUCT_INTELLIGENCE_SCHEMA,
      version: "M05I_REAL_PACKET_HANDOFF_V1",
    },
    ownership: {
      canonical_owner: "product-intelligence",
      source_authority: "SOLUCIONLINE_PDF_EXTRACTED_FACTS",
    },
    identity: {
      detected_product_name: PRODUCT_NAME,
      product_family: PRODUCT_FAMILY,
      currency: "UDI",
    },
    protection_summary: {
      basic_sum_assured: sourceMoney(sumAssured),
      contracted_coverages: sourceCoverages(native),
    },
    premium_structure: {
      payment_term_years: paymentYears,
      basic_annual_premium: sourceMoney(annualBase),
      total_annual_premium: sourceMoney(totalAnnual),
      annual_premium_with_ave: sourceMoney(annualWithAve),
    },
    provenance: {
      source: String(native.source || candidate.source || "browser_pdf_parser"),
      extraction_version: String(
        native.extractionVersion || candidate.extractionVersion || "unknown",
      ),
      source_date: String(
        rate.source_date || rate.sourceDate || rate.date || "",
      ).trim() || null,
    },
    rate_metadata: isRecord(rate) ? clone(rate) : {},
    validation: {
      source_facts_only: true,
      inferred_monetary_values_allowed: false,
      human_review_required: true,
    },
  });
}

function enrichNativeResult(nativeInput = {}, productIntelligence) {
  const native = clone(nativeInput || {});
  native.product = native.product || PRODUCT_NAME;
  native.productFamily = PRODUCT_FAMILY;
  native.product_family = PRODUCT_FAMILY;
  native.productIntelligence = productIntelligence;
  return native;
}

function enrichVidaMujerCalculation(candidate = {}, calculation = {}) {
  if (!isRecord(calculation) || !isVidaMujer(candidate, calculation)) {
    return calculation;
  }

  const productIntelligence = buildVidaMujerProductIntelligence(
    candidate,
    calculation,
  );
  if (!productIntelligence) return calculation;

  const output = clone(calculation);
  output.product = PRODUCT_NAME;
  output.productFamily = PRODUCT_FAMILY;
  output.product_family = PRODUCT_FAMILY;
  output.context = {
    ...(isRecord(output.context) ? output.context : {}),
    product: PRODUCT_NAME,
    productFamily: PRODUCT_FAMILY,
    product_family: PRODUCT_FAMILY,
  };
  output.nativeResult = enrichNativeResult(
    output.nativeResult || candidate.nativeResult || {},
    productIntelligence,
  );
  output.productIntelligence = productIntelligence;
  output.product_intelligence = productIntelligence;

  const rate = rateMetadata(candidate, output, output.nativeResult);
  output.udiRateMetadata = isRecord(output.udiRateMetadata)
    ? output.udiRateMetadata
    : clone(rate);
  output.currencyMetadata = isRecord(output.currencyMetadata)
    ? output.currencyMetadata
    : clone(rate);

  output.sumAssured = firstPositive(
    output.sumAssured,
    output.sumInsured,
    output.nativeResult.sumAssured,
    output.nativeResult.sumInsured,
    productIntelligence.protection_summary?.basic_sum_assured,
  );
  output.sumInsured = output.sumAssured;
  output.totalAnnualPremium = firstPositive(
    productIntelligence.premium_structure?.total_annual_premium,
    output.annualPremiumWithAve,
    output.annualPremium,
  );

  output.benefitSummary = buildQuoteBenefitSummary({
    productFamily: PRODUCT_FAMILY,
    product: PRODUCT_NAME,
    nativeResult: output.nativeResult,
    context: output.context,
    udiProjection: output.udiProjection ||
      candidate.udiProjection ||
      output.nativeResult.udiProjection ||
      {},
    currencyMetadata: output.currencyMetadata || {},
    productIntelligence,
  });

  return deepFreeze(output);
}

function enrichAcceptedQuote(candidate = {}) {
  if (!isRecord(candidate)) return candidate;
  const output = clone(candidate);
  output.product = PRODUCT_NAME;
  output.family = PRODUCT_FAMILY;
  output.productFamily = PRODUCT_FAMILY;
  output.product_family = PRODUCT_FAMILY;
  output.context = {
    ...(isRecord(output.context) ? output.context : {}),
    product: PRODUCT_NAME,
    family: PRODUCT_FAMILY,
    productFamily: PRODUCT_FAMILY,
    product_family: PRODUCT_FAMILY,
  };
  if (isRecord(output.nativeResult)) {
    output.nativeResult.product = PRODUCT_NAME;
    output.nativeResult.productFamily = PRODUCT_FAMILY;
    output.nativeResult.product_family = PRODUCT_FAMILY;
  }
  return output;
}

function enrichVidaMujerSnapshot(snapshot, candidate = null) {
  if (!isRecord(snapshot)) return snapshot;
  const acceptedQuote = candidate || snapshot.acceptedQuote || {};
  const calculation = snapshot.calculation || {};
  if (!isVidaMujer(acceptedQuote, calculation)) return snapshot;

  const enrichedCalculation = enrichVidaMujerCalculation(
    acceptedQuote,
    calculation,
  );
  const productIntelligence = enrichedCalculation.productIntelligence ||
    buildVidaMujerProductIntelligence(acceptedQuote, calculation);

  return deepFreeze({
    ...clone(snapshot),
    acceptedQuote: enrichAcceptedQuote(snapshot.acceptedQuote || acceptedQuote),
    calculation: enrichedCalculation,
    productIntelligence,
  });
}

function installVidaMujerHandoff() {
  const current = globalThis.ForgeAcceptedQuoteBridge;
  if (!current) return false;
  if (current.__m05e009VidaMujerHandoff === true) return true;

  const wrapper = Object.freeze({
    ...current,
    __m05e009VidaMujerHandoff: true,
    __m05e009UnderlyingBridge: current,
    getCurrentQuotePreviewCalculation() {
      const candidate = current.getCurrentQuoteCandidate?.();
      const calculation = current.getCurrentQuotePreviewCalculation?.();
      return enrichVidaMujerCalculation(candidate || {}, calculation || {});
    },
    getCurrentQuotePreviewCalculationState() {
      const candidate = current.getCurrentQuoteCandidate?.();
      const state = current.getCurrentQuotePreviewCalculationState?.() || {};
      const calculation = state.calculation ||
        current.getCurrentQuotePreviewCalculation?.();
      return Object.freeze({
        ...state,
        calculation: enrichVidaMujerCalculation(
          candidate || {},
          calculation || {},
        ),
      });
    },
    async calculateCurrentQuoteCandidatePreview(...args) {
      const calculation = await current
        .calculateCurrentQuoteCandidatePreview?.(...args);
      const candidate = current.getCurrentQuoteCandidate?.();
      return enrichVidaMujerCalculation(candidate || {}, calculation || {});
    },
    getAcceptedQuoteReviewSnapshot() {
      const candidate = current.getCurrentQuoteCandidate?.();
      return enrichVidaMujerSnapshot(
        current.getAcceptedQuoteReviewSnapshot?.(),
        candidate,
      );
    },
    async confirmCurrentQuoteCandidate(...args) {
      const accepted = await current.confirmCurrentQuoteCandidate?.(...args);
      const candidate = current.getCurrentQuoteCandidate?.();
      return enrichVidaMujerSnapshot(accepted, candidate);
    },
  });

  globalThis.ForgeAcceptedQuoteBridge = wrapper;
  globalThis.dispatchEvent?.(
    new CustomEvent("forge:vida-mujer-handoff-ready", {
      detail: Object.freeze({ version: VERSION }),
    }),
  );
  return true;
}

function boot() {
  if (typeof document === "undefined") return;
  if (installVidaMujerHandoff()) return;

  let attempts = 0;
  const timer = globalThis.setInterval(() => {
    attempts += 1;
    if (installVidaMujerHandoff() || attempts >= 240) {
      globalThis.clearInterval(timer);
    }
  }, 50);

  for (const eventName of [
    "forge:quote-human-review-bridge-ready",
    "forge:accepted-quote-bridge-ready",
    "forge:quote-preview-calculated",
  ]) {
    globalThis.addEventListener?.(
      eventName,
      () => installVidaMujerHandoff(),
    );
  }
}

boot();

export {
  PRODUCT_FAMILY,
  PRODUCT_INTELLIGENCE_SCHEMA,
  VERSION,
  buildVidaMujerProductIntelligence,
  enrichVidaMujerCalculation,
  enrichVidaMujerSnapshot,
  installVidaMujerHandoff,
  isVidaMujer,
};
