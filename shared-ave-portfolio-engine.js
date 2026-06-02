const {
  calculateAveGrowth
} = require("./shared-ave-growth-engine");

const {
  calculateAveRescueValue
} = require("./shared-ave-rescue-engine");

const {
  inferAveType
} = require("./shared-ave-type-inference-engine");

function resolveAveType(position) {
  if (position.aveType && position.aveType !== "UNKNOWN") {
    return {
      aveType: position.aveType,
      inference: null
    };
  }

  if (
    position.observedValues &&
    position.annualPremium &&
    position.currency
  ) {
    const inference = inferAveType({
      currency: position.currency,
      annualPremium: position.annualPremium,
      observedValues: position.observedValues
    });

    return {
      aveType: inference.inferredAveType,
      inference
    };
  }

  return {
    aveType: "UNKNOWN",
    inference: null
  };
}

function calculateAvePortfolio({
  evaluationYear,
  positions = []
}) {
  if (evaluationYear === undefined || evaluationYear === null) {
    throw new Error("Missing evaluationYear");
  }

  if (!Array.isArray(positions)) {
    throw new Error("positions must be an array");
  }

  const positionDetails = positions.map((position, index) => {
    const positionId =
      position.positionId || `AVE-${index + 1}`;

    if (position.purchaseYear === undefined || position.purchaseYear === null) {
      throw new Error(`Missing purchaseYear for ${positionId}`);
    }

    const yearsInvested =
      evaluationYear - position.purchaseYear;

    if (yearsInvested < 0) {
      throw new Error(
        `evaluationYear cannot be before purchaseYear for ${positionId}`
      );
    }

    const resolved =
      resolveAveType(position);

    if (resolved.aveType === "UNKNOWN") {
      return {
        positionId,
        aveType: "UNKNOWN",
        currency: position.currency,
        principal: position.principal || position.annualPremium || 0,
        purchaseYear: position.purchaseYear,
        evaluationYear,
        yearsInvested,
        status: "BLOCKED_UNKNOWN_AVE_TYPE",
        reason:
          "Cotización no distingue AVE CP/LP y no hay valores observados suficientes para inferir."
      };
    }

    const principal =
      position.principal || position.annualPremium;

    const growth = calculateAveGrowth({
      aveType: resolved.aveType,
      currency: position.currency,
      principal,
      years: yearsInvested
    });

    const rescue = calculateAveRescueValue({
      aveType: resolved.aveType,
      accumulatedValue: growth.projectedValue,
      year: yearsInvested + 1
    });

    return {
      positionId,
      aveType: resolved.aveType,
      inferred: position.aveType === "UNKNOWN" || !position.aveType,
      inferenceConfidence: resolved.inference
        ? resolved.inference.confidence
        : null,
      currency: position.currency,
      principal,
      purchaseYear: position.purchaseYear,
      evaluationYear,
      yearsInvested,
      guaranteedRate: growth.guaranteedRate,
      projectedValue: growth.projectedValue,
      guaranteedInterest: growth.guaranteedInterest,
      rescueChargeRate: rescue.chargeRate,
      rescueCharge: rescue.rescueCharge,
      rescueValue: rescue.rescueValue,
      status: "ACTIVE"
    };
  });

  const activePositions =
    positionDetails.filter((item) => item.status === "ACTIVE");

  const blockedPositions =
    positionDetails.filter((item) => item.status !== "ACTIVE");

  const totalPrincipal =
    activePositions.reduce(
      (sum, item) => sum + item.principal,
      0
    );

  const totalProjectedValue =
    activePositions.reduce(
      (sum, item) => sum + item.projectedValue,
      0
    );

  const totalGuaranteedInterest =
    activePositions.reduce(
      (sum, item) => sum + item.guaranteedInterest,
      0
    );

  const totalRescueCharge =
    activePositions.reduce(
      (sum, item) => sum + item.rescueCharge,
      0
    );

  const totalRescueValue =
    activePositions.reduce(
      (sum, item) => sum + item.rescueValue,
      0
    );

  return {
    evaluationYear,
    totalPositions: positionDetails.length,
    activeAveCount: activePositions.length,
    blockedAveCount: blockedPositions.length,
    positions: positionDetails,
    totalPrincipal,
    totalProjectedValue,
    totalGuaranteedInterest,
    totalRescueCharge,
    totalRescueValue,
    calculationMode: "AVE_PORTFOLIO_WITH_TYPE_INFERENCE"
  };
}

module.exports = {
  calculateAvePortfolio,
  resolveAveType
};
