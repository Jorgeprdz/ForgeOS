const ADVISOR_GOAL_GAP_STATES = Object.freeze({
  GOAL_COVERED: "GOAL_COVERED",
  PACE_SUFFICIENT: "PACE_SUFFICIENT",
  PIPELINE_SUFFICIENT: "PIPELINE_SUFFICIENT",
  PIPELINE_INSUFFICIENT: "PIPELINE_INSUFFICIENT",
  ACTIVITY_INSUFFICIENT: "ACTIVITY_INSUFFICIENT",
  DATA_INSUFFICIENT: "DATA_INSUFFICIENT"
});

function present(value) { return value !== undefined && value !== null && value !== ""; }
function finite(value) { const number = Number(value); return Number.isFinite(number) ? number : null; }
function round(value, digits = 1) { const factor = 10 ** digits; return Math.round(value * factor) / factor; }
function knownSignalValue(signal) {
  return signal && ["KNOWN", "ZERO", "STALE"].includes(signal.state) ? finite(signal.value) : null;
}

function coverage(value, target) {
  return target > 0 && value !== null ? round((value / target) * 100, 1) : null;
}

function explanationFor(state, context) {
  switch (state) {
    case ADVISOR_GOAL_GAP_STATES.GOAL_COVERED:
      return `La meta está cubierta con ${context.currentProduction} pólizas confirmadas.`;
    case ADVISOR_GOAL_GAP_STATES.PACE_SUFFICIENT:
      return `El ritmo confirmado apunta a ${context.paceProjection} pólizas, suficiente para la meta vigente.`;
    case ADVISOR_GOAL_GAP_STATES.PIPELINE_SUFFICIENT:
      return `La contribución ponderada del Pipeline puede cubrir la brecha actual de ${context.confirmedGap} pólizas, pero sigue siendo contexto probabilístico.`;
    case ADVISOR_GOAL_GAP_STATES.ACTIVITY_INSUFFICIENT:
      return `El ritmo actual y la cobertura ponderada no sostienen la meta; la brecha residual es de ${context.remainingAfterWeightedPipeline} pólizas.`;
    case ADVISOR_GOAL_GAP_STATES.PIPELINE_INSUFFICIENT:
      return `El Pipeline ponderado no cubre la brecha actual; faltan ${context.remainingAfterWeightedPipeline} pólizas por sostener con nueva conversión o actividad.`;
    default:
      return "No hay datos suficientes para calcular una brecha confiable.";
  }
}

function calculateAdvisorGoalGap({
  targetSignal = null,
  productionSignal = null,
  paceProjection = null,
  opportunityWeighting = null,
  activitySignal = null,
  generatedAt = null
} = {}) {
  const target = knownSignalValue(targetSignal);
  const currentProduction = knownSignalValue(productionSignal);
  const activity = knownSignalValue(activitySignal);
  const pace = finite(paceProjection?.projectedPeriodClose);
  const weightedContribution = finite(opportunityWeighting?.weightedPolicyContribution);

  if (target === null || currentProduction === null || target <= 0) {
    return Object.freeze({
      gapStatus: ADVISOR_GOAL_GAP_STATES.DATA_INSUFFICIENT,
      generatedAt,
      target,
      currentProduction,
      confirmedGap: null,
      paceProjection: pace,
      paceGap: null,
      weightedPipelineContribution: weightedContribution,
      remainingAfterWeightedPipeline: null,
      currentCoverage: coverage(currentProduction, target),
      paceCoverage: coverage(pace, target),
      weightedPipelineCoverage: null,
      primaryExplanation: explanationFor(ADVISOR_GOAL_GAP_STATES.DATA_INSUFFICIENT, {}),
      missingContext: [
        ...(target === null ? ["target"] : []),
        ...(currentProduction === null ? ["confirmedProduction"] : [])
      ],
      needsActivityRequirementModel: false,
      automaticDecisionAllowed: false,
      createsRevenueTruth: false,
      createsDatabaseWrite: false
    });
  }

  const confirmedGap = round(Math.max(0, target - currentProduction), 2);
  const paceGap = pace === null ? null : round(Math.max(0, target - pace), 2);
  const weighted = weightedContribution === null ? null : round(weightedContribution, 2);
  const remainingAfterWeightedPipeline = weighted === null
    ? confirmedGap
    : round(Math.max(0, confirmedGap - weighted), 2);
  const pipelineExpectedClose = weighted === null ? null : round(currentProduction + weighted, 2);

  let gapStatus;
  if (confirmedGap === 0) {
    gapStatus = ADVISOR_GOAL_GAP_STATES.GOAL_COVERED;
  } else if (pace !== null && pace >= target) {
    gapStatus = ADVISOR_GOAL_GAP_STATES.PACE_SUFFICIENT;
  } else if (weighted !== null && weighted >= confirmedGap) {
    gapStatus = ADVISOR_GOAL_GAP_STATES.PIPELINE_SUFFICIENT;
  } else if (activity === 0 || (pace !== null && pace < target * 0.5 && remainingAfterWeightedPipeline > 0)) {
    gapStatus = ADVISOR_GOAL_GAP_STATES.ACTIVITY_INSUFFICIENT;
  } else {
    gapStatus = ADVISOR_GOAL_GAP_STATES.PIPELINE_INSUFFICIENT;
  }

  const context = {
    target,
    currentProduction,
    confirmedGap,
    paceProjection: pace,
    weightedPipelineContribution: weighted,
    remainingAfterWeightedPipeline
  };

  return Object.freeze({
    gapStatus,
    generatedAt,
    target,
    currentProduction,
    confirmedGap,
    paceProjection: pace,
    paceGap,
    weightedPipelineContribution: weighted,
    pipelineExpectedClose,
    remainingAfterWeightedPipeline,
    currentCoverage: coverage(currentProduction, target),
    paceCoverage: coverage(pace, target),
    weightedPipelineCoverage: coverage(pipelineExpectedClose, target),
    pipelineSufficiencyRatio: confirmedGap > 0 && weighted !== null ? round(weighted / confirmedGap, 2) : null,
    primaryExplanation: explanationFor(gapStatus, context),
    missingContext: [
      ...(pace === null ? ["paceProjection"] : []),
      ...(weighted === null ? ["opportunityWeighting"] : [])
    ],
    assumptions: [
      "One active opportunity represents at most one expected policy contribution.",
      "Weighted Pipeline is decision context and may overlap with future pace; the two are not added into one guaranteed close figure."
    ],
    confidenceLimitations: [
      "Opportunity amounts are not weighted.",
      "Required activity is deferred to Stage 11."
    ],
    needsActivityRequirementModel: remainingAfterWeightedPipeline > 0,
    automaticDecisionAllowed: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsDatabaseWrite: false,
    sourceMutationPerformed: false
  });
}

module.exports = {
  ADVISOR_GOAL_GAP_STATES,
  calculateAdvisorGoalGap
};
