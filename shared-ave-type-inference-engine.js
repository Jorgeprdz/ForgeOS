const { calculateAveGrowth } = require("./shared-ave-growth-engine");
const { calculateAveRescueValue } = require("./shared-ave-rescue-engine");

function simulateAveValues({
  aveType,
  currency,
  annualPremium,
  years
}) {
  const rows = [];

  for (let year = 1; year <= years; year++) {
    let accumulatedValue = 0;

    for (let purchaseYear = 1; purchaseYear <= year; purchaseYear++) {
      const yearsInvested = year - purchaseYear;

      const growth = calculateAveGrowth({
        aveType,
        currency,
        principal: annualPremium,
        years: yearsInvested
      });

      accumulatedValue += growth.projectedValue;
    }

    const rescue = calculateAveRescueValue({
      aveType,
      accumulatedValue,
      year
    });

    rows.push({
      year,
      accumulatedValue,
      rescueValue: rescue.rescueValue
    });
  }

  return rows;
}

function scoreModel({
  observedValues,
  simulatedValues
}) {
  let totalDifference = 0;

  observedValues.forEach((observed) => {
    const simulated = simulatedValues.find(
      (row) => row.year === observed.year
    );

    if (!simulated) {
      throw new Error(`Missing simulated year ${observed.year}`);
    }

    totalDifference += Math.abs(
      Number(observed.rescueValue) - simulated.rescueValue
    );
  });

  return totalDifference;
}

function inferAveType({
  currency,
  annualPremium,
  observedValues
}) {
  if (!currency) throw new Error("Missing currency");
  if (!annualPremium) throw new Error("Missing annualPremium");
  if (!Array.isArray(observedValues)) throw new Error("Missing observedValues");

  const maxYear = Math.max(...observedValues.map((row) => row.year));

  const shortTermSimulation = simulateAveValues({
    aveType: "AVE_SHORT_TERM",
    currency,
    annualPremium,
    years: maxYear
  });

  const longTermSimulation = simulateAveValues({
    aveType: "AVE_LONG_TERM",
    currency,
    annualPremium,
    years: maxYear
  });

  const shortTermScore = scoreModel({
    observedValues,
    simulatedValues: shortTermSimulation
  });

  const longTermScore = scoreModel({
    observedValues,
    simulatedValues: longTermSimulation
  });

  const winner =
    shortTermScore < longTermScore
      ? "AVE_SHORT_TERM"
      : "AVE_LONG_TERM";

  const bestScore = Math.min(shortTermScore, longTermScore);
  const worstScore = Math.max(shortTermScore, longTermScore);

  const confidence =
    worstScore === 0
      ? 1
      : 1 - bestScore / worstScore;

  return {
    inferredAveType: winner,
    confidence,
    shortTermScore,
    longTermScore,
    shortTermSimulation,
    longTermSimulation,
    calculationMode: "AVE_TYPE_INFERENCE_BY_OBSERVED_RESCUE_VALUES"
  };
}

module.exports = {
  inferAveType,
  simulateAveValues,
  scoreModel
};
