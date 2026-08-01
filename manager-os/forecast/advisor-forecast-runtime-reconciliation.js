const ADVISOR_FORECAST_SOURCE_AUTHORITIES = Object.freeze({
  ADVISOR_IDENTITY: Object.freeze({
    primaryAuthority: "AUTH_SESSION",
    allowedAdapters: Object.freeze(["ADVISOR_MANAGER_SNAPSHOT"]),
    truthClass: "IDENTITY_CONTEXT",
    requiredForV1: true
  }),
  PERIOD: Object.freeze({
    primaryAuthority: "ADVISOR_FORECAST_REQUEST",
    allowedAdapters: Object.freeze(["REP_PERIOD", "ADVISOR_MONTHLY_POLICY_GOAL"]),
    truthClass: "TIME_CONTEXT",
    requiredForV1: true
  }),
  TARGET: Object.freeze({
    primaryAuthority: "ADVISOR_MONTHLY_POLICY_GOAL",
    allowedAdapters: Object.freeze(["MONTHLY_POLICY_GOAL_SOURCE_ADAPTER"]),
    truthClass: "HUMAN_DECLARED_GOAL",
    requiredForV1: false
  }),
  PRODUCTION: Object.freeze({
    primaryAuthority: "PRODUCTION_EVENTS",
    allowedAdapters: Object.freeze(["MONTHLY_POLICY_GOAL_SOURCE_ADAPTER"]),
    truthClass: "CONFIRMED_POLICY_EVENT_CONTEXT",
    requiredForV1: false
  }),
  PIPELINE: Object.freeze({
    primaryAuthority: "PIPELINE",
    allowedAdapters: Object.freeze(["BITACORA", "OPPORTUNITY_BITACORA_SOURCE_ADAPTER"]),
    truthClass: "OPPORTUNITY_CONTEXT",
    requiredForV1: false
  }),
  ACTIVITY: Object.freeze({
    primaryAuthority: "FES",
    allowedAdapters: Object.freeze(["REP", "ACTIVITY_REP_SOURCE_ADAPTER"]),
    truthClass: "CONFIRMED_ACTIVITY_CONTEXT",
    requiredForV1: false
  }),
  APPOINTMENTS: Object.freeze({
    primaryAuthority: "ADVISOR_MANAGER_SNAPSHOT",
    allowedAdapters: Object.freeze(["MANAGER_ADVISOR_METRICS"]),
    truthClass: "PROTECTED_METRIC_CONTEXT",
    requiredForV1: false
  }),
  FOLLOWUPS: Object.freeze({
    primaryAuthority: "ADVISOR_MANAGER_SNAPSHOT",
    allowedAdapters: Object.freeze(["MANAGER_ADVISOR_METRICS"]),
    truthClass: "PROTECTED_METRIC_CONTEXT",
    requiredForV1: false
  }),
  PROSPECTING: Object.freeze({
    primaryAuthority: "ADVISOR_MANAGER_SNAPSHOT",
    allowedAdapters: Object.freeze(["MANAGER_ADVISOR_METRICS"]),
    truthClass: "PROTECTED_METRIC_CONTEXT",
    requiredForV1: false
  }),
  REFERRALS: Object.freeze({
    primaryAuthority: "ADVISOR_MANAGER_SNAPSHOT",
    allowedAdapters: Object.freeze(["MANAGER_ADVISOR_METRICS"]),
    truthClass: "PROTECTED_METRIC_CONTEXT",
    requiredForV1: false
  }),
  HISTORICAL_CONTEXT: Object.freeze({
    primaryAuthority: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
    allowedAdapters: Object.freeze(["HISTORICAL_STORAGE_BOUNDARY", "HISTORICAL_ROLLUPS"]),
    truthClass: "PROTECTED_HISTORICAL_CONTEXT",
    requiredForV1: false
  }),
  EVIDENCE_AND_FRESHNESS: Object.freeze({
    primaryAuthority: "SOURCE_OWNER",
    allowedAdapters: Object.freeze(["MANAGER_FORECAST_BOUNDARY"]),
    truthClass: "EVIDENCE_CONTEXT",
    requiredForV1: true
  })
});

const ADVISOR_FORECAST_RUNTIME_COMPONENTS = Object.freeze([
  Object.freeze({
    componentId: "MANAGER_ADVISOR_FORECAST_ENGINE",
    path: "manager-os/forecast/manager-advisor-forecast-engine.js",
    disposition: "REUSE",
    role: "SCENARIO_CONTEXT_ENGINE"
  }),
  Object.freeze({
    componentId: "SMNYL_PACE_FORECAST_ENGINE",
    path: "rule-packs/smnyl/smnyl-forecast-engine.js",
    disposition: "REUSE_WITH_ADAPTER",
    role: "MONTHLY_PACE_PROJECTION"
  }),
  Object.freeze({
    componentId: "MANAGER_ADVISOR_METRICS_ENGINE",
    path: "manager-os/metrics/manager-advisor-metrics-engine.js",
    disposition: "REUSE",
    role: "PROTECTED_ADVISOR_SIGNAL_AGGREGATION"
  }),
  Object.freeze({
    componentId: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
    path: "manager-os/historical-analytics/manager-advisor-historical-analytics-engine.js",
    disposition: "REUSE",
    role: "PROTECTED_HISTORICAL_CONTEXT"
  }),
  Object.freeze({
    componentId: "MANAGER_FORECAST_BOUNDARY",
    path: "manager-os/forecast/manager-forecast-boundary-contract.js",
    disposition: "REUSE",
    role: "FORECAST_EVIDENCE_AND_USE_BOUNDARY"
  }),
  Object.freeze({
    componentId: "PRODUCTIVE_SMART_WIDGET_SOURCE_ADAPTERS",
    path: "advisor-os/forge-alive/smart-widgets/productive-smart-widget-source-adapters.mjs",
    disposition: "REUSE_AS_SOURCE_EDGE_ONLY",
    role: "ADVISOR_RUNTIME_SOURCE_HANDOFF"
  }),
  Object.freeze({
    componentId: "PRODUCTIVE_SMART_WIDGET_PROVIDERS",
    path: "advisor-os/forge-alive/smart-widgets/productive-smart-widget-providers.mjs",
    disposition: "PRESENTATION_ONLY",
    role: "UI_READ_MODEL_CONSUMER"
  }),
  Object.freeze({
    componentId: "LEGACY_REVENUE_FORECAST_ENGINE",
    path: "revenue-forecast-engine.js",
    disposition: "REJECT_FOR_ADVISOR_FORECAST_V1",
    role: "UNSUPPORTED_SCALAR_REVENUE_MULTIPLIER"
  })
]);

const FORBIDDEN_DIRECT_DEPENDENCIES = Object.freeze([
  "DOM",
  "MATERIAL3_HOME",
  "SMART_WIDGET_RENDERER",
  "SUPABASE_CLIENT",
  "DATABASE_WRITE",
  "PIPELINE_MUTATION",
  "ACTIVITY_MUTATION",
  "CALENDAR_MUTATION",
  "MESSAGE_SEND"
]);

const DUPLICATE_CALCULATION_POLICY = Object.freeze({
  paceProjectionOwner: "SMNYL_PACE_FORECAST_ENGINE",
  scenarioContextOwner: "MANAGER_ADVISOR_FORECAST_ENGINE",
  advisorSignalOwner: "MANAGER_ADVISOR_METRICS_ENGINE",
  historicalContextOwner: "MANAGER_ADVISOR_HISTORICAL_ANALYTICS",
  targetOwner: "ADVISOR_MONTHLY_POLICY_GOAL",
  confirmedProductionOwner: "PRODUCTION_EVENTS",
  pipelineOwner: "PIPELINE",
  uiCalculationAllowed: false,
  duplicateCalculationAllowed: false
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getAdvisorForecastSourceAuthority(field) {
  const key = String(field || "").trim().toUpperCase();
  return ADVISOR_FORECAST_SOURCE_AUTHORITIES[key]
    ? clone(ADVISOR_FORECAST_SOURCE_AUTHORITIES[key])
    : null;
}

function buildAdvisorForecastRuntimeReconciliation() {
  return {
    reconciliationId: "ADVISOR_FORECAST_001_STAGES_0_1_2",
    runtimeOwner: "MANAGER_OS_FORECAST",
    advisorRuntimeEdge: "ADVISOR_OS_SMART_WIDGET_SOURCE_ADAPTERS",
    sourceMap: clone(ADVISOR_FORECAST_SOURCE_AUTHORITIES),
    runtimeMap: clone(ADVISOR_FORECAST_RUNTIME_COMPONENTS),
    forbiddenDirectDependencies: [...FORBIDDEN_DIRECT_DEPENDENCIES],
    duplicateCalculationPolicy: clone(DUPLICATE_CALCULATION_POLICY),
    gates: {
      sourceTruthReconciled: true,
      currentRuntimeIdentified: true,
      legacyRuntimeRejectedOrMapped: true,
      duplicateCalculations: "NONE_AUTHORIZED"
    },
    truthFlags: {
      createsRevenueTruth: false,
      createsCompensationTruth: false,
      createsPipelineTruth: false,
      createsActivityTruth: false,
      automaticDecisionAllowed: false,
      createsDatabaseWrite: false
    }
  };
}

module.exports = {
  ADVISOR_FORECAST_SOURCE_AUTHORITIES,
  ADVISOR_FORECAST_RUNTIME_COMPONENTS,
  FORBIDDEN_DIRECT_DEPENDENCIES,
  DUPLICATE_CALCULATION_POLICY,
  getAdvisorForecastSourceAuthority,
  buildAdvisorForecastRuntimeReconciliation
};
