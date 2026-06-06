const {
  CALCULATION_MODE,
  projectFutureUdiValue,
  projectRetirementFutureUdi
} = require("./retirement-future-udi-projection-engine");

const GLOBAL_UDI_PROJECTION_RATE = 0.045;

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sumProjectedSeries({
  amountUDI,
  currentAge,
  startAge,
  numberOfPayments,
  currentUdiValue,
  projectionRate
}) {
  let totalUDI = 0;
  let projectedMXN = 0;
  const rows = [];

  for (let index = 0; index < numberOfPayments; index += 1) {
    const targetAge = startAge + index;
    const projected = projectRetirementFutureUdi({
      amountUDI,
      currentAge,
      targetAge,
      currentUdiValue,
      projectionRate,
      valueType: "ACCUMULATED_VALUE"
    });

    totalUDI += amountUDI;
    projectedMXN += projected.projectedMXN;
    rows.push(projected);
  }

  return {
    totalUDI,
    projectedMXN,
    rows,
    calculationMode: CALCULATION_MODE
  };
}

function buildAccumulatedIncome({
  monthlyIncomeUDI,
  currentAge,
  retirementAge,
  targetAge,
  currentUdiValue,
  preRetirementProjectionRate,
  annuityProjectionRate
}) {
  const annualIncomeUDI = monthlyIncomeUDI * 12;
  const projectedAtRetirement = projectFutureUdiValue({
    currentAge,
    targetAge: retirementAge,
    currentUdiValue,
    projectionRate: preRetirementProjectionRate
  });
  const numberOfPayments = targetAge - retirementAge + 1;
  const accumulated = sumProjectedSeries({
    amountUDI: annualIncomeUDI,
    currentAge: retirementAge,
    startAge: retirementAge,
    numberOfPayments,
    currentUdiValue: projectedAtRetirement.projectedUdiValue,
    projectionRate: annuityProjectionRate
  });

  return {
    targetAge,
    annualIncomeUDI,
    accumulatedUDI: accumulated.totalUDI,
    accumulatedMXN: accumulated.projectedMXN,
    projectedUdiValueAtRetirement: projectedAtRetirement.projectedUdiValue,
    annuityProjectionRate,
    rows: accumulated.rows,
    calculationMode: CALCULATION_MODE
  };
}

function projectScenario({
  amountUDI,
  quoteFacts,
  currentUdiValue,
  projectionRate,
  valueType
}) {
  return projectRetirementFutureUdi({
    amountUDI,
    currentAge: quoteFacts.insuredAge || quoteFacts.currentAge,
    targetAge: quoteFacts.retirementAge,
    currentUdiValue,
    projectionRate,
    valueType
  });
}

function buildImaginaSerFutureMxnBridge({
  quoteFacts,
  currentUdiValue,
  projectionConfig = {}
}) {
  if (!quoteFacts) {
    throw new Error("Missing quoteFacts");
  }

  const currentAge = number(quoteFacts.insuredAge || quoteFacts.currentAge);
  const retirementAge = number(quoteFacts.retirementAge);
  const annualPremiumUDI = number(
    quoteFacts.annualTotalPremium || quoteFacts.annualBasicPremium
  );
  const sumInsuredUDI = number(quoteFacts.sumInsuredUDI);
  const paymentYears = number(quoteFacts.paymentYears);
  const udiValue = number(currentUdiValue);
  const preRetirementProjectionRate = GLOBAL_UDI_PROJECTION_RATE;
  const premiumProjectionRate = GLOBAL_UDI_PROJECTION_RATE;
  const annuityProjectionRate = GLOBAL_UDI_PROJECTION_RATE;
  const favorableMonthlyIncomeUDI = number(
    quoteFacts.scenarios?.FAVORABLE?.monthlyIncomeUDI
  );
  const premiumProjection = sumProjectedSeries({
    amountUDI: annualPremiumUDI,
    currentAge,
    startAge: currentAge,
    numberOfPayments: paymentYears,
    currentUdiValue: udiValue,
    projectionRate: premiumProjectionRate
  });

  return {
    product: quoteFacts.product || "IMAGINA_SER",
    clientName: quoteFacts.clientName,
    currentAge,
    retirementAge,
    currentUdiValue: udiValue,
    annualPremiumUDI,
    annualPremiumTodayMXN: annualPremiumUDI * udiValue,
    sumInsuredUDI,
    sumInsuredTodayMXN: sumInsuredUDI * udiValue,
    paymentYears,
    totalContributionUDI: annualPremiumUDI * paymentYears,
    totalContributionProjectedMXN: premiumProjection.projectedMXN,
    premiumProjectionRows: premiumProjection.rows,
    scenarios: {
      BASE: projectScenario({
        amountUDI: quoteFacts.scenarios?.BASE?.singlePaymentUDI,
        quoteFacts,
        currentUdiValue: udiValue,
        projectionRate: preRetirementProjectionRate,
        valueType: "RETIREMENT_LUMP_SUM"
      }),
      FAVORABLE: projectScenario({
        amountUDI: quoteFacts.scenarios?.FAVORABLE?.singlePaymentUDI,
        quoteFacts,
        currentUdiValue: udiValue,
        projectionRate: preRetirementProjectionRate,
        valueType: "RETIREMENT_LUMP_SUM"
      }),
      DESFAVORABLE: projectScenario({
        amountUDI: quoteFacts.scenarios?.DESFAVORABLE?.singlePaymentUDI,
        quoteFacts,
        currentUdiValue: udiValue,
        projectionRate: preRetirementProjectionRate,
        valueType: "RETIREMENT_LUMP_SUM"
      })
    },
    favorableMonthlyIncome: projectScenario({
      amountUDI: favorableMonthlyIncomeUDI,
      quoteFacts,
      currentUdiValue: udiValue,
      projectionRate: preRetirementProjectionRate,
      valueType: "RETIREMENT_MONTHLY_INCOME"
    }),
    accumulatedAt75: buildAccumulatedIncome({
      monthlyIncomeUDI: favorableMonthlyIncomeUDI,
      currentAge,
      retirementAge,
      targetAge: 75,
      currentUdiValue: udiValue,
      preRetirementProjectionRate,
      annuityProjectionRate
    }),
    accumulatedAt80: buildAccumulatedIncome({
      monthlyIncomeUDI: favorableMonthlyIncomeUDI,
      currentAge,
      retirementAge,
      targetAge: 80,
      currentUdiValue: udiValue,
      preRetirementProjectionRate,
      annuityProjectionRate
    }),
    projectionConfig: {
      preRetirementProjectionRate,
      premiumProjectionRate,
      annuityProjectionRate
    },
    calculationMode: CALCULATION_MODE
  };
}

module.exports = {
  GLOBAL_UDI_PROJECTION_RATE,
  buildImaginaSerFutureMxnBridge,
  buildAccumulatedIncome,
  sumProjectedSeries
};
