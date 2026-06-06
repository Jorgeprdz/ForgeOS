const CALCULATION_MODE =
  "PROJECTED_UDI_FUTURE_MXN_ESTIMATE_NOT_GUARANTEED";

const SUPPORTED_VALUE_TYPES = new Set([
  "CURRENT_VALUE",
  "RETIREMENT_LUMP_SUM",
  "RETIREMENT_MONTHLY_INCOME",
  "ACCUMULATED_VALUE"
]);

function requireFiniteNumber(value, fieldName) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Missing or invalid ${fieldName}`);
  }

  return numberValue;
}

function normalizeValueType(valueType) {
  if (!SUPPORTED_VALUE_TYPES.has(valueType)) {
    throw new Error(`Unsupported valueType: ${valueType}`);
  }

  return valueType;
}

function projectFutureUdiValue({
  currentAge,
  targetAge,
  currentUdiValue,
  projectionRate
}) {
  const normalizedCurrentAge = requireFiniteNumber(currentAge, "currentAge");
  const normalizedTargetAge = requireFiniteNumber(targetAge, "targetAge");
  const normalizedCurrentUdiValue = requireFiniteNumber(
    currentUdiValue,
    "currentUdiValue"
  );
  const normalizedProjectionRate = requireFiniteNumber(
    projectionRate,
    "projectionRate"
  );
  const yearsProjected = Math.max(
    normalizedTargetAge - normalizedCurrentAge,
    0
  );

  return {
    currentAge: normalizedCurrentAge,
    targetAge: normalizedTargetAge,
    yearsProjected,
    currentUdiValue: normalizedCurrentUdiValue,
    projectionRate: normalizedProjectionRate,
    projectedUdiValue:
      normalizedCurrentUdiValue *
      Math.pow(1 + normalizedProjectionRate, yearsProjected)
  };
}

function projectRetirementFutureUdi({
  currentAge,
  targetAge,
  currentUdiValue,
  amountUDI,
  projectionRate,
  valueType
}) {
  const normalizedAmountUDI = requireFiniteNumber(amountUDI, "amountUDI");
  const normalizedValueType = normalizeValueType(valueType);
  const projection = projectFutureUdiValue({
    currentAge,
    targetAge,
    currentUdiValue,
    projectionRate
  });

  return {
    amountUDI: normalizedAmountUDI,
    currentAge: projection.currentAge,
    targetAge: projection.targetAge,
    yearsProjected: projection.yearsProjected,
    currentUdiValue: projection.currentUdiValue,
    projectedUdiValue: projection.projectedUdiValue,
    projectionRate: projection.projectionRate,
    valueType: normalizedValueType,
    projectedMXN: normalizedAmountUDI * projection.projectedUdiValue,
    calculationMode: CALCULATION_MODE
  };
}

module.exports = {
  CALCULATION_MODE,
  SUPPORTED_VALUE_TYPES,
  projectFutureUdiValue,
  projectRetirementFutureUdi
};
