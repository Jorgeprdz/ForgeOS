import {
  PRODUCT_PROFILE_TYPE,
  buildProductSpecificQuotePrintableReadModel as buildBaseProfiledReadModel,
} from "./quote-printable-product-profile.js";

const CONTRACT_VERSION = "M05E007_ORVI_COMMERCIAL_PROFILE_V1";
const LAYOUT_ID = "ORVI_COMMERCIAL_THREE_BLOCKS_V1";

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function positive(value) {
  const number = finite(value);
  return number !== null && number > 0 ? number : null;
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

function firstObject(...values) {
  return values.find(isRecord) || null;
}

function firstArray(...values) {
  return values.find(Array.isArray) || [];
}

function moneyValue(value) {
  if (isRecord(value) && Object.hasOwn(value, "value")) {
    return positive(value.value);
  }
  return positive(value);
}

function buildOrviCommercialSummary(reviewSnapshot) {
  const acceptedQuote = reviewSnapshot.acceptedQuote || {};
  const calculation = reviewSnapshot.calculation || {};
  const productIntelligence = reviewSnapshot.productIntelligence || {};

  const rateMetadata = firstObject(
    calculation.orviRateMetadata,
    calculation.rate_metadata,
    calculation.rateMetadata,
    acceptedQuote.orviRateMetadata,
    acceptedQuote.rate_metadata,
    acceptedQuote.nativeResult?.orviRateMetadata,
  ) || {};

  const viewModel = firstObject(
    calculation.orviDashboardViewModel,
    calculation.orvi_dashboard_view_model,
    acceptedQuote.orviDashboardViewModel,
    acceptedQuote.orvi_dashboard_view_model,
    acceptedQuote.nativeResult?.orviDashboardViewModel,
    acceptedQuote.nativeResult?.orvi_dashboard_view_model,
  ) || {};

  const sumAssuredUdi = moneyValue(
    productIntelligence?.protection_summary?.basic_sum_assured,
  );
  const sumAssuredMxn = positive(calculation.currentProtectionMXN);
  const annualContributionUdi =
    moneyValue(productIntelligence?.premium_structure?.total_annual_premium) ||
    positive(calculation.annualPremium);
  const currentUdi = positive(rateMetadata.value);
  const annualContributionMxn =
    annualContributionUdi !== null && currentUdi !== null
      ? annualContributionUdi * currentUdi
      : null;

  const recoveryCheckpoints = firstArray(
    viewModel?.views?.guaranteed_recovery?.checkpoints,
  );
  const protectionScenarios = firstArray(
    viewModel?.views?.protection?.future_checkpoint_scenarios,
  );
  const protectionByYear = new Map(
    protectionScenarios
      .filter((item) => positive(item?.policy_year) !== null)
      .map((item) => [Number(item.policy_year), item]),
  );

  const checkpoints = recoveryCheckpoints
    .map((checkpoint) => {
      const year = positive(checkpoint?.policy_year);
      if (year === null) return null;
      const protection = protectionByYear.get(year) || {};
      const projectedRecoveryMxn =
        moneyValue(checkpoint?.future_mxn?.total_recovery) ||
        moneyValue(checkpoint?.current_mxn?.total_recovery);
      return {
        policyYear: year,
        recoveryUdi: moneyValue(
          checkpoint?.source_currency?.total_recovery,
        ),
        recoveryMxn: projectedRecoveryMxn,
        sumAssuredUdi,
        sumAssuredMxn:
          moneyValue(protection?.projected_sum_assured_mxn) ||
          (year === positive(calculation.paymentYears)
            ? sumAssuredMxn
            : null),
        annualGrowthRate: finite(protection?.annual_growth_rate),
        projectionStatus:
          checkpoint?.future_mxn?.status ||
          protection?.status ||
          "PROJECTED_NOT_GUARANTEED",
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.policyYear - right.policyYear);

  const paymentYears =
    positive(calculation.paymentYears) ||
    positive(productIntelligence?.premium_structure?.payment_term_years);

  return deepFreeze({
    layoutId: LAYOUT_ID,
    product: String(
      acceptedQuote.product ||
      calculation.product ||
      productIntelligence?.identity?.detected_product_name ||
      "ORVI",
    ),
    paymentYears,
    sumAssured: {
      udi: sumAssuredUdi,
      mxn: sumAssuredMxn,
    },
    annualContribution: {
      udi: annualContributionUdi,
      mxn: annualContributionMxn,
    },
    checkpoints,
    evidence: {
      udiValue: currentUdi,
      udiDate:
        String(
          rateMetadata.source_date ||
          rateMetadata.sourceDate ||
          rateMetadata.date ||
          "",
        ).trim() || null,
      udiSource: String(rateMetadata.source || "").trim() || null,
      seriesId:
        String(rateMetadata.series_id || rateMetadata.seriesId || "").trim() ||
        null,
      annualGrowthRate:
        checkpoints.find((item) => item.annualGrowthRate !== null)
          ?.annualGrowthRate ?? null,
    },
  });
}

function buildProductSpecificQuotePrintableReadModel({
  readModel,
  reviewSnapshot,
} = {}) {
  const profiled = buildBaseProfiledReadModel({
    readModel,
    reviewSnapshot,
  });
  if (profiled.productProfile?.id !== "ORVI") return profiled;

  const commercialSummary = buildOrviCommercialSummary(reviewSnapshot);
  const warnings = [];
  if (commercialSummary.annualContribution.mxn === null) {
    warnings.push(
      "La equivalencia actual de la aportación anual en MXN no está disponible.",
    );
  }
  if (!commercialSummary.checkpoints.length) {
    warnings.push(
      "No hay checkpoints de recuperación confirmados para presentar.",
    );
  }

  return deepFreeze({
    ...clone(profiled),
    contractVersion: CONTRACT_VERSION,
    commercialSummary,
    review: {
      ...clone(profiled.review || {}),
      warnings,
    },
    disclaimers: [
      "Las cifras en UDI son las referencias del plan; las equivalencias en MXN dependen del valor de la UDI.",
      "Los valores futuros en MXN son proyecciones y no constituyen valores garantizados.",
      "La póliza emitida y la documentación oficial prevalecen sobre este resumen.",
    ],
    productProfile: {
      ...clone(profiled.productProfile),
      packetType: PRODUCT_PROFILE_TYPE,
      commercialLayoutId: LAYOUT_ID,
    },
  });
}

export {
  CONTRACT_VERSION,
  LAYOUT_ID,
  buildOrviCommercialSummary,
  buildProductSpecificQuotePrintableReadModel,
};
