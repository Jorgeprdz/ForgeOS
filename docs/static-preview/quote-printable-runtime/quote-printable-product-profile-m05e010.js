import {
  VIDA_MUJER_LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel as buildM05e008ProfiledReadModel,
} from "./quote-printable-product-profile-m05e008.js";

const CONTRACT_VERSION = "M05E010_VIDA_MUJER_VISUAL_PROFILE_V1";
const VIDA_MUJER_LANDSCAPE_LAYOUT_ID =
  "VIDA_MUJER_LANDSCAPE_EDITORIAL_TWO_PAGE_V1";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  Object.values(value).forEach((item) => deepFreeze(item, seen));
  return Object.freeze(value);
}

function numeric(value) {
  if (isRecord(value) && Object.hasOwn(value, "value")) return numeric(value.value);
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const parsed = numeric(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function buildTotalContribution(reviewSnapshot, summary) {
  const calculation = reviewSnapshot?.calculation || {};
  const acceptedQuote = reviewSnapshot?.acceptedQuote || {};
  const native = calculation.nativeResult || acceptedQuote.nativeResult || {};
  const model = reviewSnapshot?.productIntelligence ||
    calculation.productIntelligence || {};
  const annual = firstNumber(
    summary?.annualContribution?.udi,
    calculation.totalAnnualPremium,
    calculation.annualPremiumWithAve,
    calculation.annualPremium,
    native.totalAnnualPremium,
    native.annualPremiumWithAve,
    native.annualPremium,
    model.premium_structure?.total_annual_premium,
    model.premium_structure?.basic_annual_premium,
  );
  const years = firstNumber(
    summary?.paymentYears,
    calculation.paymentYears,
    native.paymentYears,
    native.premiumPayingYears,
    native.paymentTerm,
    model.premium_structure?.payment_term_years,
    20,
  );
  const totalUdi = firstNumber(
    calculation.totalContributed,
    calculation.totalContributedUdi,
    calculation.totalContributedUDI,
    native.totalContributed,
    native.totalContributedUdi,
    native.totalContributedUDI,
    annual !== null && years !== null ? annual * years : null,
  );
  const currentUdi = firstNumber(summary?.evidence?.udiValue);
  const totalMxn = firstNumber(
    calculation.totalContributedMXN,
    calculation.totalContributedMxn,
    native.totalContributedMXN,
    native.totalContributedMxn,
    totalUdi !== null && currentUdi !== null ? totalUdi * currentUdi : null,
  );

  return Object.freeze({
    udi: totalUdi,
    mxn: totalMxn,
    basis: "CURRENT_UDI_EQUIVALENCE",
    annualUdi: annual,
    paymentYears: years,
  });
}

function buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot,
} = {}) {
  const profiled = buildM05e008ProfiledReadModel({
    readModel,
    reviewSnapshot,
  });
  if (
    profiled?.productProfile?.id !== "VIDA_MUJER" ||
    profiled?.commercialSummary?.layoutId !== VIDA_MUJER_LAYOUT_ID
  ) {
    return profiled;
  }

  const summary = clone(profiled.commercialSummary);
  summary.layoutId = VIDA_MUJER_LANDSCAPE_LAYOUT_ID;
  summary.totalContribution = buildTotalContribution(
    reviewSnapshot,
    profiled.commercialSummary,
  );

  const warnings = [...(profiled.productProfile?.warnings || [])];
  if (summary.totalContribution.udi === null) {
    warnings.push("El total aportado de Vida Mujer no está disponible.");
  }

  return deepFreeze({
    ...clone(profiled),
    contractVersion: CONTRACT_VERSION,
    productProfile: {
      ...clone(profiled.productProfile),
      warnings,
    },
    commercialSummary: summary,
  });
}

export {
  CONTRACT_VERSION,
  VIDA_MUJER_LANDSCAPE_LAYOUT_ID,
  VIDA_MUJER_LAYOUT_ID,
  buildProductSpecificQuotePrintableReadModel,
  buildTotalContribution,
};