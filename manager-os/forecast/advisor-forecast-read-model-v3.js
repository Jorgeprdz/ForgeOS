const { composeAdvisorForecastV3 } = require("./advisor-forecast-composer-v3");
const { buildAdvisorForecastReadModelV2 } = require("./advisor-forecast-read-model-v2");

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function actionsFor(composed) {
  const actions = [
    { type: "NAVIGATE", label: "Abrir Forecast", destination: "ADVISOR_FORECAST_DETAIL" }
  ];
  if (composed.activityHandoffAvailability?.available) {
    actions.push({ type: "NAVIGATE", label: "Planificar actividad", destination: "ACTIVITY_FORECAST_PLAN" });
  }
  if ((composed.baseForecastV2?.opportunityWeighting?.atRiskCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Revisar casos en riesgo", destination: "PIPELINE_AT_RISK" });
  } else if ((composed.baseForecastV2?.opportunityWeighting?.activeOpportunityCount || 0) > 0) {
    actions.push({ type: "NAVIGATE", label: "Ver oportunidades", destination: "PIPELINE_FORECAST_CONTEXT" });
  } else if (composed.baseForecastV2?.baseForecast?.explanation?.missingInformation?.length
      || composed.baseForecastV2?.baseForecast?.explanation?.staleInformation?.length) {
    actions.push({ type: "REVIEW_SOURCE_CONTEXT", label: "Actualizar datos", destination: "FORECAST_SOURCE_REVIEW" });
  }
  return actions.slice(0, 3);
}

function buildAdvisorForecastReadModelV3(input = {}) {
  const composed = input.composerV3Status ? clone(input) : composeAdvisorForecastV3(input);
  const baseReadModel = buildAdvisorForecastReadModelV2(composed.baseForecastV2);
  const requirement = composed.activityRequirement || {};
  const requirementNeeded = baseReadModel.goalGap?.needsActivityRequirementModel === true;
  const requirementInsufficient = requirementNeeded
    && ["INSUFFICIENT_DATA", "BLOCKED"].includes(requirement.requirementStatus);

  return Object.freeze({
    ...baseReadModel,
    schema: "ADVISOR_FORECAST_READ_MODEL_V3",
    state: composed.composerV3Status === "BLOCKED"
      ? "BLOCKED"
      : requirementInsufficient
        ? "PARTIAL"
        : baseReadModel.state,
    confidence: composed.confidence,
    activityRequirement: {
      status: requirement.requirementStatus || null,
      residualPolicyGap: requirement.residualPolicyGap ?? null,
      policiesRequired: requirement.policiesRequired ?? null,
      applicationsRequired: requirement.applicationsRequired ?? null,
      presentationsRequired: requirement.presentationsRequired ?? null,
      appointmentsRequired: requirement.appointmentsRequired ?? null,
      contactsRequired: requirement.contactsRequired ?? null,
      confidence: requirement.confidence || "INSUFFICIENT_DATA",
      cadence: clone(requirement.cadence || null),
      selectedRates: clone(requirement.selectedRates || {}),
      missingRates: clone(requirement.missingRates || []),
      recommendedActions: clone(requirement.recommendedActions || []),
      precisionPolicy: requirement.precisionPolicy || null,
      humanConfirmationRequired: true
    },
    activityHandoff: {
      available: composed.activityHandoffAvailability?.available === true,
      destination: "ACTIVITY_FORECAST_PLAN",
      requiresHumanConfirmation: true,
      automaticSubmissionAllowed: false,
      createsTask: false,
      createsCalendarEvent: false
    },
    decisionSummary: clone(composed.decisionSummary || null),
    actions: actionsFor(composed),
    warnings: clone(composed.warnings || []),
    calculationPerformedByReadModel: false,
    automaticDecisionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    createsActivityTruth: false,
    createsRevenueTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false,
    uiMutationPerformed: false
  });
}

module.exports = { buildAdvisorForecastReadModelV3 };
