import {
  parseSegubecaPdfTextToAcceptedQuotePacket,
} from "../../../../docs/static-preview/quote-runtime/forge-pdf-browser-parser.js";
import {
  buildAcceptedNativeResult107z15p2R9C,
  calculateSegubecaAcceptedR14E,
  isSegubecaAcceptedR14E,
} from "../../../../docs/static-preview/quote-runtime/forge-accepted-quote-adapter.js";
import {
  SEGUBECA_UDI_GROWTH_RATE,
  SEGUBECA_MXN_INTEGRATION_VERSION,
  createForgeUdiMxnRuntime,
} from "../../../../docs/static-preview/quote-runtime/forge-udi-mxn-runtime.js";

const AUTHORITY_VERSION = "SEGUBECA-CALCULATION-AUTHORITY-001.1";
const AUTHORITY = "SEGUBECA_ACCEPTED_PRODUCT_CALCULATION";
const CONTRACTUAL_VALUE_AUTHORITY = "SOLUCIONLINE_SOURCE_DOCUMENT";
const CURRENCY_PROJECTION_AUTHORITY = "FORGE_UDI_MXN_RUNTIME";
const BLOCKED_NO_VERIFIED_UDI_RATE = "BLOCKED_NO_VERIFIED_UDI_RATE";

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const item of Object.values(value)) freeze(item);
  return value;
}

function finite(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requireSourcePacket(packet) {
  if (!packet || typeof packet !== "object") {
    throw new TypeError("SEGUBECA_SOURCE_PACKET_REQUIRED");
  }
  const nativeResult = packet.nativeResult && typeof packet.nativeResult === "object"
    ? packet.nativeResult
    : {};
  if (!isSegubecaAcceptedR14E(packet, nativeResult)) {
    throw new TypeError("SEGUBECA_PRODUCT_IDENTITY_REQUIRED");
  }
  if (packet.source !== "browser_pdf_parser" || nativeResult.source !== "browser_pdf_parser") {
    throw new TypeError("SEGUBECA_SOLUCIONLINE_SOURCE_AUTHORITY_REQUIRED");
  }
  return nativeResult;
}

function canonicalProjection(enrichedPacket, calculation) {
  const nativeResult = enrichedPacket.nativeResult || {};
  const totalContributed = nativeResult.totalContributedAmount || null;
  const target = nativeResult.sumAssuredAmount || nativeResult.baseCoverage?.sumAssuredAmount || null;
  const monthlyDelivery = nativeResult.monthlyDeliveryAmount || null;
  const accumulatedDelivery = nativeResult.accumulatedDeliveryAmount || null;
  const totalRecovery = nativeResult.totalRecoveryAmount || null;

  return freeze({
    status: enrichedPacket.mxnProjectionStatus || BLOCKED_NO_VERIFIED_UDI_RATE,
    integrationVersion:
      enrichedPacket.mxnProjectionVersion || SEGUBECA_MXN_INTEGRATION_VERSION,
    annualUdiGrowthRate:
      enrichedPacket.udiProjection?.annualGrowthRate ?? SEGUBECA_UDI_GROWTH_RATE,
    guaranteed: false,
    currentUdiMetadata:
      enrichedPacket.udiRateMetadata || enrichedPacket.currencyMetadata || null,
    timeline: enrichedPacket.udiProjection || null,
    totalContributed,
    educationTarget: target,
    monthlyDelivery,
    accumulatedDelivery,
    totalRecovery,
    legacyCurrentRateFields: freeze({
      totalContributedMXN: calculation.totalContributedMXN ?? null,
      totalRecoveryMXN: calculation.totalRecoveryMXN ?? null,
      authoritative: false,
      reason: "Compatibility-only fields; projected commercial reading must use the year-aware amount pairs.",
    }),
  });
}

function sourceFacts(packet, calculation) {
  const nativeResult = calculation.nativeResult || packet.nativeResult || {};
  return freeze({
    product: calculation.product || packet.product || null,
    productFamily: "segubeca",
    client: calculation.client || packet.insured || packet.name || null,
    childOrEducationBeneficiary:
      nativeResult.childOrEducationBeneficiary || packet.childOrEducationBeneficiary || null,
    currency: calculation.currency || packet.currency || "UDI",
    paymentYears: finite(calculation.paymentYears),
    coveragePeriod: calculation.coveragePeriod || packet.coveragePeriod || null,
    annualPremiumUdi: finite(calculation.annualPremium),
    annualPremiumWithRecommendedUdi: finite(calculation.annualPremiumWithAve),
    totalContributedUdi: finite(calculation.totalContributed),
    totalRecoveryUdi: finite(calculation.totalRecovery),
    sumAssuredUdi: finite(nativeResult.sumAssured ?? nativeResult.sumInsured ?? packet.sumAssured),
    administrationInterestRate: finite(calculation.interestRate),
    guaranteedRows: freeze(Array.isArray(nativeResult.guaranteedRows)
      ? nativeResult.guaranteedRows.map((row) => ({ ...row }))
      : []),
    administrationRows: freeze(Array.isArray(nativeResult.administrationRows)
      ? nativeResult.administrationRows.map((row) => ({ ...row }))
      : []),
    coverages: freeze(Array.isArray(nativeResult.coverages)
      ? nativeResult.coverages.map((row) => ({ ...row }))
      : []),
    recommendedCoverages: freeze(Array.isArray(nativeResult.recommendedCoverages)
      ? nativeResult.recommendedCoverages.map((row) => ({ ...row }))
      : []),
  });
}

async function calculateFromAcceptedPacket(packet, { rateProvider } = {}) {
  const nativeResult = requireSourcePacket(packet);
  const runtime = createForgeUdiMxnRuntime({ rateProvider });
  const enrichedPacket = await runtime.enrichAcceptedQuotePacket(packet);
  const normalized = buildAcceptedNativeResult107z15p2R9C(enrichedPacket);
  const calculation = calculateSegubecaAcceptedR14E(enrichedPacket, normalized);
  const projection = canonicalProjection(enrichedPacket, calculation);

  return freeze({
    authorityVersion: AUTHORITY_VERSION,
    authority: AUTHORITY,
    contractualValueAuthority: CONTRACTUAL_VALUE_AUTHORITY,
    currencyProjectionAuthority: CURRENCY_PROJECTION_AUTHORITY,
    productCalculationReimplemented: false,
    sourcePacketAccepted: true,
    sourceFacts: sourceFacts(enrichedPacket, calculation),
    projection,
    acceptedCalculation: calculation,
    acceptedPacket: enrichedPacket,
    boundaries: freeze({
      premiumRecalculated: false,
      sumAssuredRecalculated: false,
      guaranteedTableRecalculated: false,
      administrationTableRecalculated: false,
      flatTotalContributionConversionAuthorized: false,
      projectionGuaranteed: false,
      humanConfirmationRequired: true,
    }),
    sourceNativeResult: nativeResult,
  });
}

async function calculateFromPdfText(text, { fileName = null, rateProvider } = {}) {
  const packet = parseSegubecaPdfTextToAcceptedQuotePacket(text, { fileName });
  return calculateFromAcceptedPacket(packet, { rateProvider });
}

export {
  AUTHORITY,
  AUTHORITY_VERSION,
  BLOCKED_NO_VERIFIED_UDI_RATE,
  CONTRACTUAL_VALUE_AUTHORITY,
  CURRENCY_PROJECTION_AUTHORITY,
  SEGUBECA_UDI_GROWTH_RATE,
  calculateFromAcceptedPacket,
  calculateFromPdfText,
};
