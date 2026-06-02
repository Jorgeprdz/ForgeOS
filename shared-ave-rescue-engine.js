function getAveRescueChargeRate({
  aveType,
  year
}) {
  if (!aveType) throw new Error("Missing aveType");
  if (year === undefined || year === null) throw new Error("Missing year");

  if (aveType === "AVE_SHORT_TERM") {
    return 0;
  }

  if (aveType === "AVE_LONG_TERM") {
    if (year <= 1) return 0.045;
    if (year === 2) return 0.025;
    if (year === 3) return 0.005;
    return 0;
  }

  throw new Error(`Unsupported AVE type: ${aveType}`);
}

function calculateAveRescueValue({
  aveType,
  accumulatedValue,
  year
}) {
  if (!aveType) throw new Error("Missing aveType");

  if (accumulatedValue === undefined || accumulatedValue === null) {
    throw new Error("Missing accumulatedValue");
  }

  if (year === undefined || year === null) {
    throw new Error("Missing year");
  }

  const chargeRate = getAveRescueChargeRate({
    aveType,
    year
  });

  const rescueCharge =
    accumulatedValue * chargeRate;

  const rescueValue =
    accumulatedValue - rescueCharge;

  return {
    aveType,
    year,
    accumulatedValue,
    chargeRate,
    rescueCharge,
    rescueValue,
    calculationMode: "AVE_RESCUE_CHARGE_RULE"
  };
}

module.exports = {
  getAveRescueChargeRate,
  calculateAveRescueValue
};
