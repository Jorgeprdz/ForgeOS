import {
  PRODUCTIVE_SMART_WIDGET_SCHEMA_VERSION,
  SMART_WIDGET_STATES,
  SMART_WIDGET_RENDER_VARIANTS,
  createMetric,
  deepFreeze,
  cloneJson,
  uniqueStrings,
} from "./productive-smart-widget-contract.js";
import {
  ADVISOR_FORECAST_DESTINATIONS,
  resolveAdvisorForecastNavigationAction,
} from "../navigation/advisor-forecast-navigation.js";

export const ADVISOR_FORECAST_WIDGET_FAMILY = "ADVISOR_FORECAST_WIDGET";

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function widgetState(readModel) {
  switch (readModel?.state) {
    case "READY": return SMART_WIDGET_STATES.READY;
    case "PARTIAL": return SMART_WIDGET_STATES.PARTIAL;
    case "STALE": return SMART_WIDGET_STATES.STALE;
    case "BLOCKED": return SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE;
    case "MISSING_DATA": return SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE;
    default: return SMART_WIDGET_STATES.SOURCE_UNAVAILABLE;
  }
}

function hardPriority(readModel, monthEndWindow) {
  const state = readModel?.goalGap?.state;
  if (monthEndWindow && ["PIPELINE_INSUFFICIENT", "ACTIVITY_INSUFFICIENT"].includes(state)) {
    return "MONTH_END_GOAL_RISK";
  }
  return null;
}

function subtitle(readModel) {
  const current = finite(readModel?.currentProduction);
  const target = finite(readModel?.target);
  const pace = finite(readModel?.paceProjection);
  if (current === null || target === null) return "Faltan datos para proyectar el cierre mensual.";
  const paceText = pace === null ? "ritmo no disponible" : `ritmo ${pace}`;
  return `${current} de ${target} pólizas confirmadas · ${paceText}.`;
}

function uncertainty(readModel) {
  return uniqueStrings([
    ...(readModel?.warnings || []),
    ...(readModel?.missingInformation || []).map((entry) => entry.signal || entry),
    ...(readModel?.staleInformation || []).map((entry) => entry.signal || entry),
    ...(readModel?.opportunityForecast?.unknownCount > 0 ? ["opportunity_evidence_incomplete"] : []),
    ...(readModel?.activityRequirement?.status === "INSUFFICIENT_DATA" ? ["activity_conversion_context_incomplete"] : []),
    "weighted_pipeline_is_decision_context_not_guaranteed_production",
  ]);
}

export function createAdvisorForecastSmartWidget({ readModel, monthEndWindow = false, rankScore = 70 } = {}) {
  const acceptedSchemas = ["ADVISOR_FORECAST_READ_MODEL_V2", "ADVISOR_FORECAST_READ_MODEL_V3"];
  if (!readModel || !acceptedSchemas.includes(readModel.schema)) {
    throw new TypeError("ADVISOR_FORECAST_READ_MODEL_V2 or V3 is required");
  }
  const state = widgetState(readModel);
  const detailRoute = resolveAdvisorForecastNavigationAction({
    destination: ADVISOR_FORECAST_DESTINATIONS.ADVISOR_FORECAST_DETAIL,
    label: "Abrir Forecast",
  }, { advisorId: readModel.advisorId });
  const pace = finite(readModel.paceProjection);
  const current = finite(readModel.currentProduction);
  const target = finite(readModel.target);
  const gap = finite(readModel.goalGap?.remainingAfterWeightedPipeline);

  return deepFreeze({
    schemaVersion: PRODUCTIVE_SMART_WIDGET_SCHEMA_VERSION,
    widgetId: `forge-advisor-forecast-${readModel.period?.yearMonth || "unknown"}`,
    widgetFamily: ADVISOR_FORECAST_WIDGET_FAMILY,
    state,
    rankScore,
    hardPriority: hardPriority(readModel, monthEndWindow),
    title: "Forecast mensual",
    subtitle: subtitle(readModel),
    primaryMetric: createMetric({
      value: pace,
      unit: readModel.productionUnit || "policies",
      label: "pace_projection",
      display: pace === null ? null : `${pace} proyectadas`,
    }),
    secondaryMetric: createMetric({
      value: current,
      unit: readModel.productionUnit || "policies",
      label: "confirmed_production",
      display: current === null || target === null ? null : `${current} / ${target}`,
    }),
    comparison: cloneJson({
      target,
      currentProduction: current,
      paceProjection: pace,
      currentCoverage: readModel.goalGap?.currentCoverage ?? null,
      paceCoverage: readModel.goalGap?.paceCoverage ?? null,
      weightedPipelineCoverage: readModel.goalGap?.weightedPipelineCoverage ?? null,
      remainingAfterWeightedPipeline: gap,
    }),
    trend: null,
    chartReady: cloneJson({
      kind: "ADVISOR_FORECAST_COVERAGE",
      series: [
        { x: "Confirmado", y: current },
        { x: "Ritmo", y: pace },
        { x: "Meta", y: target },
      ].filter((point) => point.y !== null),
      target,
    }),
    whyNow: readModel.primaryExplanation || "El cierre mensual requiere contexto actualizado.",
    evidence: uniqueStrings(readModel.evidenceRefs || []),
    uncertainty: uncertainty(readModel),
    missingContext: uniqueStrings([
      ...(readModel.missingInformation || []).map((entry) => entry.signal || entry),
      ...(readModel.goalGap?.state === "DATA_INSUFFICIENT" ? ["goal_gap_context"] : []),
      ...(readModel.activityRequirement?.missingRates || []),
    ]),
    confidence: readModel.confidence || "LOW",
    freshness: cloneJson({ generatedAt: readModel.generatedAt, staleSignalCount: readModel.staleSignalCount || 0 }),
    sourceAuthorities: [
      readModel.schema,
      "PRODUCTION_EVENTS",
      "ADVISOR_MONTHLY_POLICY_GOAL",
      "PIPELINE",
      "BITACORA",
      "FES",
      "REP",
    ],
    deepLink: detailRoute.deepLink,
    reviewAction: { type: "NAVIGATE", label: "Abrir Forecast", destination: detailRoute.destination },
    blockedReason: state === SMART_WIDGET_STATES.BLOCKED_BY_MISSING_EVIDENCE ? "FORECAST_CONTEXT_INCOMPLETE" : null,
    renderVariant: SMART_WIDGET_RENDER_VARIANTS.TREND,
    payload: cloneJson({
      readModelSchema: readModel.schema,
      period: readModel.period,
      healthStatus: readModel.healthStatus,
      goalGap: readModel.goalGap,
      opportunityForecast: readModel.opportunityForecast,
      activityRequirement: readModel.activityRequirement || null,
      activityHandoff: readModel.activityHandoff || null,
      actions: readModel.actions,
    }),
    unavailableDataRedacted: state === SMART_WIDGET_STATES.SOURCE_UNAVAILABLE,
    readOnly: true,
    finalAuthority: "HUMAN",
    reasonWhyVisible: Boolean(readModel.primaryExplanation),
    humanDecisionCheckpointRequired: true,
    boundaryBadges: ["READ_ONLY", "FINAL_AUTHORITY_HUMAN", "NO_AUTONOMOUS_EXECUTION", "FORECAST_IS_NOT_TRUTH"],
    actionExecutionAllowed: false,
    approvalMutationAllowed: false,
    sendAllowed: false,
    runtimeExecutionAllowed: false,
    truthMutationAllowed: false,
    createsTask: false,
    createsCalendarEvent: false,
    createsCrmWrite: false,
    createsRevenueTruth: false,
    createsCompensationTruth: false,
    createsPayoutTruth: false,
  });
}

export function createAdvisorForecastHomeAdditionalWidgets(options = {}) {
  return Object.freeze([createAdvisorForecastSmartWidget(options)]);
}

export async function reconcileAdvisorForecastHome({
  homeAdapter,
  session,
  sources,
  readModel,
  monthEndWindow = false,
} = {}) {
  if (!homeAdapter || typeof homeAdapter.reconcile !== "function") {
    throw new TypeError("Productive Smart Widget Home adapter is required");
  }
  return homeAdapter.reconcile({
    session,
    sources,
    additionalWidgets: createAdvisorForecastHomeAdditionalWidgets({ readModel, monthEndWindow }),
  });
}
