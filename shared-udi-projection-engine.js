const BLOCKED_NO_VERIFIED_UDI_RATE = "BLOCKED_NO_VERIFIED_UDI_RATE";
const UDI_PROJECTION_SCENARIO =
  "PROJECTED_UDI_TIMELINE_SCENARIO_NOT_GUARANTEED";

function finiteNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function requireFiniteNumber(value, fieldName) {
  const number = finiteNumberOrNull(value);
  if (number === null) {
    throw new TypeError(`${fieldName} must be a finite number`);
  }
  return number;
}

function rounded(value, roundingMode) {
  if (roundingMode === "cents") return Math.round(value * 100) / 100;
  if (roundingMode === "sixDecimals") return Math.round(value * 1e6) / 1e6;
  return value;
}

function buildUdiProjectionTimeline({
  baseUdiValue,
  baseAge,
  maxAge,
  annualGrowthRate,
  startYear = 0,
  roundingMode = "none",
  baseUdiSource = null,
  baseUdiDate = null
} = {}) {
  const normalizedBaseUdiValue = requireFiniteNumber(baseUdiValue, "baseUdiValue");
  const normalizedBaseAge = requireFiniteNumber(baseAge, "baseAge");
  const normalizedMaxAge = requireFiniteNumber(maxAge, "maxAge");
  const normalizedGrowthRate = requireFiniteNumber(
    annualGrowthRate,
    "annualGrowthRate"
  );
  const normalizedStartYear = requireFiniteNumber(startYear, "startYear");

  if (normalizedMaxAge < normalizedBaseAge) {
    throw new RangeError("maxAge must be greater than or equal to baseAge");
  }

  const timeline = [];

  for (let age = normalizedBaseAge; age <= normalizedMaxAge; age += 1) {
    const yearsFromBase = age - normalizedBaseAge + normalizedStartYear;
    const projectedUdiValue = rounded(
      normalizedBaseUdiValue * Math.pow(1 + normalizedGrowthRate, yearsFromBase),
      roundingMode
    );

    timeline.push({
      age,
      policyYear: age - normalizedBaseAge + 1,
      yearsFromBase,
      projectedUdiValue,
      growthRate: normalizedGrowthRate,
      baseUdi: {
        value: normalizedBaseUdiValue,
        source: baseUdiSource,
        date: baseUdiDate
      }
    });
  }

  return timeline;
}

function findTimelineEntry({ targetAge, timeline }) {
  if (!Array.isArray(timeline)) {
    throw new TypeError("timeline must be an array");
  }
  const normalizedTargetAge = requireFiniteNumber(targetAge, "targetAge");
  const entry = timeline.find((item) => item.age === normalizedTargetAge);
  if (!entry) {
    throw new RangeError(`Missing projected UDI value for age ${normalizedTargetAge}`);
  }
  return entry;
}

function convertUdiAmountAtAge({
  amountUdi,
  targetAge,
  timeline
} = {}) {
  const normalizedAmountUdi = requireFiniteNumber(amountUdi, "amountUdi");
  const entry = findTimelineEntry({ targetAge, timeline });

  return {
    udi: normalizedAmountUdi,
    mxn: normalizedAmountUdi * entry.projectedUdiValue,
    targetAge: entry.age,
    projectedUdiValue: entry.projectedUdiValue,
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

function sumAnnualUdiPaymentsToMxn({
  annualAmountUdi,
  startAge,
  paymentYears,
  timeline
} = {}) {
  const normalizedAnnualAmountUdi = requireFiniteNumber(
    annualAmountUdi,
    "annualAmountUdi"
  );
  const normalizedStartAge = requireFiniteNumber(startAge, "startAge");
  const normalizedPaymentYears = requireFiniteNumber(paymentYears, "paymentYears");

  if (normalizedPaymentYears < 0) {
    throw new RangeError("paymentYears must be greater than or equal to zero");
  }

  const annualPayments = [];
  let totalMxn = 0;

  for (let index = 0; index < normalizedPaymentYears; index += 1) {
    const targetAge = normalizedStartAge + index;
    const payment = convertUdiAmountAtAge({
      amountUdi: normalizedAnnualAmountUdi,
      targetAge,
      timeline
    });

    annualPayments.push({
      policyYear: index + 1,
      age: targetAge,
      amountUdi: normalizedAnnualAmountUdi,
      projectedUdiValue: payment.projectedUdiValue,
      mxn: payment.mxn
    });
    totalMxn += payment.mxn;
  }

  return {
    udi: normalizedAnnualAmountUdi * normalizedPaymentYears,
    mxn: totalMxn,
    annualPayments,
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

function buildAccumulatedRetirementIncome({
  annualIncomeUdi,
  retirementAge,
  targetAge,
  retirementTimeline
} = {}) {
  const normalizedAnnualIncomeUdi = requireFiniteNumber(
    annualIncomeUdi,
    "annualIncomeUdi"
  );
  const normalizedRetirementAge = requireFiniteNumber(retirementAge, "retirementAge");
  const normalizedTargetAge = requireFiniteNumber(targetAge, "targetAge");

  if (normalizedTargetAge < normalizedRetirementAge) {
    throw new RangeError("targetAge must be greater than or equal to retirementAge");
  }

  const yearsReceiving = normalizedTargetAge - normalizedRetirementAge + 1;
  const accumulated = sumAnnualUdiPaymentsToMxn({
    annualAmountUdi: normalizedAnnualIncomeUdi,
    startAge: normalizedRetirementAge,
    paymentYears: yearsReceiving,
    timeline: retirementTimeline
  });

  return {
    fromAge: normalizedRetirementAge,
    toAge: normalizedTargetAge,
    yearsReceiving,
    udi: accumulated.udi,
    mxn: accumulated.mxn,
    annualPayments: accumulated.annualPayments,
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

function buildUniversalUdiQuoteProjection({
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
  const normalizedBaseUdiValue = finiteNumberOrNull(baseUdiValue);

  if (!normalizedBaseUdiValue) {
    return {
      status: BLOCKED_NO_VERIFIED_UDI_RATE,
      reason: "UDI projection requires a verified base UDI value.",
      currency: "UDI",
      baseUdi: {
        value: null,
        source: null,
        date: null
      },
      calculationMode: UDI_PROJECTION_SCENARIO
    };
  }

  const normalizedCurrentAge = requireFiniteNumber(currentAge, "currentAge");
  const normalizedRetirementAge = requireFiniteNumber(retirementAge, "retirementAge");
  const normalizedMaxAge = requireFiniteNumber(
    maxAge ?? Math.max(normalizedRetirementAge, ...incomeMilestoneAges),
    "maxAge"
  );
  const normalizedAnnualPremiumUdi = requireFiniteNumber(
    annualPremiumUdi,
    "annualPremiumUdi"
  );
  const normalizedPremiumPayingYears = requireFiniteNumber(
    premiumPayingYears,
    "premiumPayingYears"
  );
  const normalizedSumAssuredUdi = finiteNumberOrNull(sumAssuredUdi);
  const normalizedSinglePaymentUdi = requireFiniteNumber(
    singlePaymentUdiAtRetirement,
    "singlePaymentUdiAtRetirement"
  );
  const normalizedMonthlyIncomeUdi = requireFiniteNumber(
    monthlyIncomeUdiAtRetirement,
    "monthlyIncomeUdiAtRetirement"
  );
  const normalizedAnnualIncomeUdi =
    finiteNumberOrNull(annualIncomeUdiAtRetirement) ??
    normalizedMonthlyIncomeUdi * 12;
  const normalizedSavingsRate = requireFiniteNumber(
    savingsUdiGrowthRate,
    "savingsUdiGrowthRate"
  );
  const normalizedRetirementRate = requireFiniteNumber(
    retirementUdiGrowthRate,
    "retirementUdiGrowthRate"
  );
  const normalizedProjectedUdiAtRetirement =
    finiteNumberOrNull(projectedUdiAtRetirement) ??
    normalizedBaseUdiValue *
      Math.pow(1 + normalizedSavingsRate, normalizedRetirementAge - normalizedCurrentAge);

  const savingsTimeline = buildUdiProjectionTimeline({
    baseUdiValue: normalizedBaseUdiValue,
    baseAge: normalizedCurrentAge,
    maxAge: Math.max(
      normalizedCurrentAge + normalizedPremiumPayingYears - 1,
      normalizedRetirementAge
    ),
    annualGrowthRate: normalizedSavingsRate,
    baseUdiSource,
    baseUdiDate
  });

  const retirementTimeline = buildUdiProjectionTimeline({
    baseUdiValue: normalizedProjectedUdiAtRetirement,
    baseAge: normalizedRetirementAge,
    maxAge: normalizedMaxAge,
    annualGrowthRate: normalizedRetirementRate,
    baseUdiSource,
    baseUdiDate
  });

  const totalContributed = sumAnnualUdiPaymentsToMxn({
    annualAmountUdi: normalizedAnnualPremiumUdi,
    startAge: normalizedCurrentAge,
    paymentYears: normalizedPremiumPayingYears,
    timeline: savingsTimeline
  });

  const currentProtectionMxn =
    normalizedSumAssuredUdi === null
      ? null
      : normalizedSumAssuredUdi * normalizedBaseUdiValue;
  const projectedProtection =
    normalizedSumAssuredUdi === null
      ? null
      : convertUdiAmountAtAge({
          amountUdi: normalizedSumAssuredUdi,
          targetAge: normalizedRetirementAge,
          timeline: retirementTimeline
        });
  const singlePayment = convertUdiAmountAtAge({
    amountUdi: normalizedSinglePaymentUdi,
    targetAge: normalizedRetirementAge,
    timeline: retirementTimeline
  });
  const monthlyIncome = convertUdiAmountAtAge({
    amountUdi: normalizedMonthlyIncomeUdi,
    targetAge: normalizedRetirementAge,
    timeline: retirementTimeline
  });
  const annualIncome = convertUdiAmountAtAge({
    amountUdi: normalizedAnnualIncomeUdi,
    targetAge: normalizedRetirementAge,
    timeline: retirementTimeline
  });

  const accumulatedIncome = incomeMilestoneAges.map((targetAge) =>
    buildAccumulatedRetirementIncome({
      annualIncomeUdi: normalizedAnnualIncomeUdi,
      retirementAge: normalizedRetirementAge,
      targetAge,
      retirementTimeline
    })
  );

  return {
    status: "READY",
    currency: "UDI",
    baseUdi: {
      value: normalizedBaseUdiValue,
      source: baseUdiSource,
      date: baseUdiDate
    },
    projectionRates: {
      savingsUdiGrowthRate: normalizedSavingsRate,
      retirementUdiGrowthRate: normalizedRetirementRate
    },
    timeline: {
      savings: savingsTimeline,
      retirement: retirementTimeline
    },
    totalContributed,
    protection: {
      death: {
        udi: normalizedSumAssuredUdi,
        mxnCurrent: currentProtectionMxn,
        mxnProjectedAtRetirement: projectedProtection?.mxn ?? null
      },
      disability: {
        udi: normalizedSumAssuredUdi,
        mxnCurrent: currentProtectionMxn,
        mxnProjectedAtRetirement: projectedProtection?.mxn ?? null
      }
    },
    retirement: {
      singlePayment: {
        udi: normalizedSinglePaymentUdi,
        mxnAtRetirement: singlePayment.mxn,
        targetAge: normalizedRetirementAge,
        projectedUdiValue: singlePayment.projectedUdiValue
      },
      monthlyIncome: {
        udi: normalizedMonthlyIncomeUdi,
        mxnAtRetirement: monthlyIncome.mxn,
        targetAge: normalizedRetirementAge,
        projectedUdiValue: monthlyIncome.projectedUdiValue
      },
      annualIncome: {
        udi: normalizedAnnualIncomeUdi,
        mxnAtRetirement: annualIncome.mxn,
        targetAge: normalizedRetirementAge,
        projectedUdiValue: annualIncome.projectedUdiValue
      },
      accumulatedIncome
    },
    calculationMode: UDI_PROJECTION_SCENARIO
  };
}

module.exports = {
  BLOCKED_NO_VERIFIED_UDI_RATE,
  UDI_PROJECTION_SCENARIO,
  buildUdiProjectionTimeline,
  convertUdiAmountAtAge,
  sumAnnualUdiPaymentsToMxn,
  buildUniversalUdiQuoteProjection
};
