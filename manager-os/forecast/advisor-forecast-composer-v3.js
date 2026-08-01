const { composeAdvisorForecastV2 } = require("./advisor-forecast-composer-v2");
const { calculateAdvisorActivityRequirement } = require("./advisor-activity-requirement-engine");

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function composeAdvisorForecastV3(sourceInput = {}) {
  const before = JSON.stringify(sourceInput);
  const baseForecast = sourceInput.baseForecastV2?.composerV2Status
    ? clone(sourceInput.baseForecastV2)
    : composeAdvisorForecastV2(sourceInput);

  const activityRequirement = calculateAdvisorActivityRequirement({
    goalGap: baseForecast.goalGap,
    period: baseForecast.period,
    generatedAt: baseForecast.generatedAt,
    advisorHistoricalConversions: sourceInput.advisorHistoricalConversions,
    advisorRecentConversions: sourceInput.advisorRecentConversions,
    governedBenchmarkConversions: sourceInput.governedBenchmarkConversions,
    maximumRequiredContacts: sourceInput.maximumRequiredContacts
  });

  const requirementNeeded = baseForecast.goalGap?.needsActivityRequirementModel === true;
  const requirementReady = ["READY", "PARTIAL", "GOAL_COVERED"].includes(activityRequirement.requirementStatus);
  const composerV3Status = baseForecast.composerV2Status === "BLOCKED"
    ? "BLOCKED"
    : requirementNeeded && !requirementReady
      ? "PARTIAL"
      : baseForecast.composerV2Status;

  const output = Object.freeze({
    schema: "ADVISOR_FORECAST_COMPOSER_V3",
    composerV3Status,
    advisorId: baseForecast.advisorId,
    period: clone(baseForecast.period),
    generatedAt: baseForecast.generatedAt,
    baseForecastV2: baseForecast,
    activityRequirement,
    activityHandoffAvailability: {
      available: ["READY", "PARTIAL"].includes(activityRequirement.requirementStatus),
      requiresHumanConfirmation: true,
      automaticSubmissionAllowed: false,
      destination: "ACTIVITY_FORECAST_PLAN"
    },
    decisionSummary: {
      ...clone(baseForecast.decisionSummary || {}),
      activityRequirementStatus: activityRequirement.requirementStatus,
      contactsRequired: activityRequirement.contactsRequired ?? null,
      appointmentsRequired: activityRequirement.appointmentsRequired ?? null,
      applicationsRequired: activityRequirement.applicationsRequired ?? null,
      humanReviewRequired: true
    },
    confidence: activityRequirement.confidence === "INSUFFICIENT_DATA"
      ? baseForecast.confidence
      : activityRequirement.confidence === "LOW" && baseForecast.confidence === "HIGH"
        ? "MEDIUM"
        : baseForecast.confidence,
    healthStatus: baseForecast.healthStatus,
    warnings: unique([
      ...asArray(baseForecast.warnings),
      ...asArray(activityRequirement.warnings),
      "Activity requirements are planning context and require advisor confirmation before handoff."
    ]),
    assumptions: unique([
      ...asArray(baseForecast.assumptions),
      ...asArray(activityRequirement.assumptions)
    ]),
    confidenceLimitations: unique([
      ...asArray(baseForecast.confidenceLimitations),
      ...asArray(activityRequirement.confidenceLimitations)
    ]),
    automaticDecisionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    createsActivityTruth: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  });

  if (JSON.stringify(sourceInput) !== before) throw new Error("Advisor Forecast V3 composer mutated source input");
  return output;
}

module.exports = { composeAdvisorForecastV3 };
