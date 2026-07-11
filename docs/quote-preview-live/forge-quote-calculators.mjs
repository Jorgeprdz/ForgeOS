// Browser-safe subset from retirement-presentation-scenario-engine.js.
const BLOCKED_NO_VERIFIED_UDI_RATE = "BLOCKED_NO_VERIFIED_UDI_RATE";
const SCENARIO_LABEL = "SCENARIO_BASED_ESTIMATE_NOT_GUARANTEED";
const UDI_PROJECTION_SCENARIO = "PROJECTED_UDI_TIMELINE_SCENARIO_NOT_GUARANTEED";
const DEFAULT_SAVINGS_UDI_GROWTH_RATE = 0.04;
const DEFAULT_RETIREMENT_UDI_GROWTH_RATE = 0.045;

async function browserUnavailableRateProvider() {
  return null;
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function requireNumber(value, fieldName) {
  const number = numberOrNull(value);
  if (number === null) throw new TypeError(`${fieldName} must be a finite number`);
  return number;
}

export function buildUdiProjectionTimeline({
  baseUdiValue,
  baseAge,
  maxAge,
  annualGrowthRate
} = {}) {
  const base = requireNumber(baseUdiValue, "baseUdiValue");
  const startAge = requireNumber(baseAge, "baseAge");
  const endAge = requireNumber(maxAge, "maxAge");
  const growthRate = requireNumber(annualGrowthRate, "annualGrowthRate");
  const timeline = [];

  for (let age = startAge; age <= endAge; age += 1) {
    timeline.push({
      age,
      policyYear: age - startAge + 1,
      yearsFromBase: age - startAge,
      projectedUdiValue: base * Math.pow(1 + growthRate, age - startAge),
      growthRate
    });
  }

  return timeline;
}

function timelineEntry(targetAge, timeline) {
  const age = requireNumber(targetAge, "targetAge");
  const entry = timeline.find(item => item.age === age);
  if (!entry) throw new RangeError(`Missing projected UDI value for age ${age}`);
  return entry;
}

export function convertUdiAmountAtAge({
  amountUdi,
  targetAge,
  timeline
} = {}) {
  const udi = requireNumber(amountUdi, "amountUdi");
  const entry = timelineEntry(targetAge, timeline);
  return {
    udi,
    mxn: udi * entry.projectedUdiValue,
    targetAge: entry.age,
    projectedUdiValue: entry.projectedUdiValue,
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

export function sumAnnualUdiPaymentsToMxn({
  annualAmountUdi,
  startAge,
  paymentYears,
  timeline
} = {}) {
  const annualUdi = requireNumber(annualAmountUdi, "annualAmountUdi");
  const firstAge = requireNumber(startAge, "startAge");
  const years = requireNumber(paymentYears, "paymentYears");
  const annualPayments = [];
  let mxn = 0;

  for (let index = 0; index < years; index += 1) {
    const age = firstAge + index;
    const payment = convertUdiAmountAtAge({
      amountUdi: annualUdi,
      targetAge: age,
      timeline
    });
    annualPayments.push({
      policyYear: index + 1,
      age,
      amountUdi: annualUdi,
      projectedUdiValue: payment.projectedUdiValue,
      mxn: payment.mxn
    });
    mxn += payment.mxn;
  }

  return {
    udi: annualUdi * years,
    mxn,
    annualPayments,
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

export function buildUniversalUdiQuoteProjection({
  baseUdiValue,
  baseUdiSource = null,
  baseUdiDate = null,
  currentAge,
  retirementAge,
  maxAge,
  annualPremiumUdi,
  premiumPayingYears,
  sumAssuredUdi,
  singlePaymentUdiAtRetirement,
  monthlyIncomeUdiAtRetirement,
  annualIncomeUdiAtRetirement,
  savingsUdiGrowthRate,
  retirementUdiGrowthRate,
  projectedUdiAtRetirement = null,
  incomeMilestoneAges = []
} = {}) {
  const base = numberOrNull(baseUdiValue);
  if (!base) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      reason: "UDI projection requires a verified base UDI value.",
      currency: "UDI",
      baseUdi: { value: null, source: null, date: null },
      calculationMode: UDI_PROJECTION_SCENARIO
    };
  }

  const startAge = requireNumber(currentAge, "currentAge");
  const retireAge = requireNumber(retirementAge, "retirementAge");
  const payYears = requireNumber(premiumPayingYears, "premiumPayingYears");
  const savingsRate = requireNumber(savingsUdiGrowthRate, "savingsUdiGrowthRate");
  const retirementRate = requireNumber(retirementUdiGrowthRate, "retirementUdiGrowthRate");
  const projectedAtRetirement =
    numberOrNull(projectedUdiAtRetirement) ??
    base * Math.pow(1 + savingsRate, retireAge - startAge);
  const endAge = requireNumber(
    maxAge ?? Math.max(retireAge, ...incomeMilestoneAges),
    "maxAge"
  );
  const annualPremium = requireNumber(annualPremiumUdi, "annualPremiumUdi");
  const sumAssured = numberOrNull(sumAssuredUdi);
  const singlePayment = requireNumber(
    singlePaymentUdiAtRetirement,
    "singlePaymentUdiAtRetirement"
  );
  const monthlyIncome = requireNumber(
    monthlyIncomeUdiAtRetirement,
    "monthlyIncomeUdiAtRetirement"
  );
  const annualIncome =
    numberOrNull(annualIncomeUdiAtRetirement) ?? monthlyIncome * 12;
  const savingsTimeline = buildUdiProjectionTimeline({
    baseUdiValue: base,
    baseAge: startAge,
    maxAge: Math.max(startAge + payYears - 1, retireAge),
    annualGrowthRate: savingsRate
  });
  const retirementTimeline = buildUdiProjectionTimeline({
    baseUdiValue: projectedAtRetirement,
    baseAge: retireAge,
    maxAge: endAge,
    annualGrowthRate: retirementRate
  });
  const totalContributed = sumAnnualUdiPaymentsToMxn({
    annualAmountUdi: annualPremium,
    startAge,
    paymentYears: payYears,
    timeline: savingsTimeline
  });
  const singlePaymentProjection = convertUdiAmountAtAge({
    amountUdi: singlePayment,
    targetAge: retireAge,
    timeline: retirementTimeline
  });
  const monthlyIncomeProjection = convertUdiAmountAtAge({
    amountUdi: monthlyIncome,
    targetAge: retireAge,
    timeline: retirementTimeline
  });
  const annualIncomeProjection = convertUdiAmountAtAge({
    amountUdi: annualIncome,
    targetAge: retireAge,
    timeline: retirementTimeline
  });
  const accumulatedIncome = incomeMilestoneAges.map(targetAge => {
    const yearsReceiving = targetAge - retireAge + 1;
    const accumulated = sumAnnualUdiPaymentsToMxn({
      annualAmountUdi: annualIncome,
      startAge: retireAge,
      paymentYears: yearsReceiving,
      timeline: retirementTimeline
    });
    return {
      fromAge: retireAge,
      toAge: targetAge,
      yearsReceiving,
      udi: accumulated.udi,
      mxn: accumulated.mxn,
      annualPayments: accumulated.annualPayments,
      calculationMode: UDI_PROJECTION_SCENARIO
    };
  });

  return {
    status: "READY",
    currency: "UDI",
    baseUdi: { value: base, source: baseUdiSource, date: baseUdiDate },
    projectionRates: {
      savingsUdiGrowthRate: savingsRate,
      retirementUdiGrowthRate: retirementRate
    },
    timeline: { savings: savingsTimeline, retirement: retirementTimeline },
    totalContributed,
    protection: {
      death: {
        udi: sumAssured,
        mxnCurrent: sumAssured === null ? null : sumAssured * base,
        mxnProjectedAtRetirement:
          sumAssured === null ? null : sumAssured * projectedAtRetirement
      },
      disability: {
        udi: sumAssured,
        mxnCurrent: sumAssured === null ? null : sumAssured * base,
        mxnProjectedAtRetirement:
          sumAssured === null ? null : sumAssured * projectedAtRetirement
      }
    },
    retirement: {
      singlePayment: {
        udi: singlePayment,
        mxnAtRetirement: singlePaymentProjection.mxn,
        targetAge: retireAge,
        projectedUdiValue: singlePaymentProjection.projectedUdiValue
      },
      monthlyIncome: {
        udi: monthlyIncome,
        mxnAtRetirement: monthlyIncomeProjection.mxn,
        targetAge: retireAge,
        projectedUdiValue: monthlyIncomeProjection.projectedUdiValue
      },
      annualIncome: {
        udi: annualIncome,
        mxnAtRetirement: annualIncomeProjection.mxn,
        targetAge: retireAge,
        projectedUdiValue: annualIncomeProjection.projectedUdiValue
      },
      accumulatedIncome
    },
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

export async function getVerifiedUdiRateMetadata({
  rateProvider = browserUnavailableRateProvider
} = {}) {
  try {
    const cache = await rateProvider();
    const udi = cache?.rates?.UDI_MXN;
    const currentUdiValue = Number(udi?.value || 0);

    if (!currentUdiValue) {
      return {
        status: BLOCKED_NO_VERIFIED_UDI_RATE,
        currentUdiValue: null,
        source: null,
        sourceDate: null,
        sourceMode: null,
        cacheStatus: cache?.cacheStatus || null
      };
    }

    return {
      status: "VERIFIED_UDI_RATE_AVAILABLE",
      currentUdiValue,
      source: udi.source,
      sourceDate: udi.date,
      sourceMode: cache.cacheStatus === "CACHE_HIT" ? "CACHE" : "LIVE",
      cacheStatus: cache.cacheStatus,
      seriesId: udi.seriesId,
      title: udi.title
    };
  } catch (error) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      currentUdiValue: null,
      source: null,
      sourceDate: null,
      sourceMode: null,
      cacheStatus: null,
      error: error.message
    };
  }
}

export function calculateTotalContributed({
  totalAnnualPremium = 0,
  premiumPayingYears = 0,
} = {}) {
  const annualPremium = Number(totalAnnualPremium);
  const payingYears = Number(premiumPayingYears);
  if (!Number.isFinite(annualPremium) || annualPremium < 0) {
    throw new TypeError("totalAnnualPremium must be a finite non-negative number");
  }
  if (!Number.isFinite(payingYears) || payingYears < 0) {
    throw new TypeError("premiumPayingYears must be a finite non-negative number");
  }
  return annualPremium * payingYears;
}

export function buildRetirementPresentationScenario({
  parsedQuote = {},
  udiRateMetadata = {}
}) {
  const currentUdiValue = Number(udiRateMetadata.currentUdiValue || 0);

  if (!currentUdiValue) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      reason: "Retirement MXN scenario requires verified UDI rate metadata.",
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue: null,
      source: null,
      sourceDate: null,
      sourceMode: null,
      calculationMode: SCENARIO_LABEL
    };
  }

  const base = parsedQuote.scenarios?.base;

  if (!base?.monthlyIncome || !base?.lumpSum) {
    return {
      status: "BLOCKED_NO_RETIREMENT_SCENARIO_EVIDENCE",
      reason: "Retirement scenario values must come from extracted/source evidence.",
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue,
      source: udiRateMetadata.source,
      sourceDate: udiRateMetadata.sourceDate,
      sourceMode: udiRateMetadata.sourceMode,
      calculationMode: SCENARIO_LABEL
    };
  }

  const premium = parsedQuote.premiumStructure || {};
  const totalContributed = calculateTotalContributed(premium);
  let projection;

  try {
    projection = buildUniversalUdiQuoteProjection({
      baseUdiValue: currentUdiValue,
      baseUdiSource: udiRateMetadata.source,
      baseUdiDate: udiRateMetadata.sourceDate,
      currentAge: parsedQuote.currentAge,
      retirementAge: parsedQuote.retirementAge,
      maxAge: 99,
      annualPremiumUdi: premium.totalAnnualPremium,
      premiumPayingYears: premium.premiumPayingYears,
      sumAssuredUdi:
        parsedQuote.sumAssuredUdi ??
        parsedQuote.sumAssured ??
        parsedQuote.sumInsured ??
        0,
      singlePaymentUdiAtRetirement: base.lumpSum,
      monthlyIncomeUdiAtRetirement: base.monthlyIncome,
      annualIncomeUdiAtRetirement:
        parsedQuote.annualIncomeUdiAtRetirement ??
        base.annualIncome ??
        base.annualIncomeUdi ??
        base.monthlyIncome * 12,
      savingsUdiGrowthRate:
        parsedQuote.savingsUdiGrowthRate ??
        parsedQuote.annualUdiGrowthRate ??
        DEFAULT_SAVINGS_UDI_GROWTH_RATE,
      retirementUdiGrowthRate:
        parsedQuote.retirementUdiGrowthRate ??
        DEFAULT_RETIREMENT_UDI_GROWTH_RATE,
      projectedUdiAtRetirement:
        parsedQuote.projectedUdiAtRetirement ??
        parsedQuote.projectedUdiValueAtRetirement ??
        null,
      incomeMilestoneAges: [75, 80, 85, 90]
    });
  } catch (error) {
    return {
      status: "BLOCKED_NO_RETIREMENT_SCENARIO_EVIDENCE",
      reason: error.message,
      productName: parsedQuote.productName,
      currency: parsedQuote.currency,
      currentUdiValue,
      source: udiRateMetadata.source,
      sourceDate: udiRateMetadata.sourceDate,
      sourceMode: udiRateMetadata.sourceMode,
      calculationMode: SCENARIO_LABEL
    };
  }

  return {
    status: "READY",
    productName: parsedQuote.productName,
    currency: parsedQuote.currency,
    currentUdiValue,
    source: udiRateMetadata.source,
    sourceDate: udiRateMetadata.sourceDate,
    sourceMode: udiRateMetadata.sourceMode,
    cacheStatus: udiRateMetadata.cacheStatus,
    calculationMode: SCENARIO_LABEL,
    summary: {
      currentAge: parsedQuote.currentAge,
      retirementAge: parsedQuote.retirementAge,
      coverageYears: parsedQuote.coverageYears,
      premiumPayingYears: premium.premiumPayingYears,
      paidUntilAge: premium.paidUntilAge,
      basicAnnualPremiumUDI: premium.basicAnnualPremium,
      basicAnnualPremiumMXN: numberOrNull(premium.basicAnnualPremium) === null ? null : Number(premium.basicAnnualPremium) * currentUdiValue,
      plannedAnnualContributionUDI: premium.plannedAnnualContribution,
      plannedAnnualContributionMXN: numberOrNull(premium.plannedAnnualContribution) === null ? null : Number(premium.plannedAnnualContribution) * currentUdiValue,
      totalAnnualPremiumUDI: premium.totalAnnualPremium,
      totalAnnualPremiumMXN: projection.totalContributed.annualPayments[0]?.mxn ?? null,
      totalContributedUDI: totalContributed,
      totalContributedMXN: projection.totalContributed.mxn,
      lumpSumUDI: base.lumpSum,
      lumpSumMXN: projection.retirement.singlePayment.mxnAtRetirement,
      monthlyIncomeUDI: base.monthlyIncome,
      monthlyIncomeMXN: projection.retirement.monthlyIncome.mxnAtRetirement,
      annualIncomeUDI: projection.retirement.annualIncome.udi,
      annualIncomeMXN: projection.retirement.annualIncome.mxnAtRetirement,
      projectedUdiAtRetirement:
        projection.retirement.singlePayment.projectedUdiValue,
      udiProjection: projection,
      calculationMode: SCENARIO_LABEL,
      currencySource: {
        currentUdiValue,
        source: udiRateMetadata.source,
        sourceDate: udiRateMetadata.sourceDate,
        sourceMode: udiRateMetadata.sourceMode
      }
    }
  };
}

const api=Object.freeze({calculateTotalContributed,getVerifiedUdiRateMetadata,buildUdiProjectionTimeline,convertUdiAmountAtAge,sumAnnualUdiPaymentsToMxn,buildUniversalUdiQuoteProjection,buildRetirementPresentationScenario});
globalThis.ForgeQuoteCalculators=api;
if(typeof globalThis.dispatchEvent==="function"&&typeof globalThis.CustomEvent==="function"){globalThis.dispatchEvent(new CustomEvent("forge:quote-calculators-ready",{detail:api}));}
