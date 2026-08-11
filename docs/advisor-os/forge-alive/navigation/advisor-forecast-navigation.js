export const ADVISOR_FORECAST_DESTINATIONS = Object.freeze({
  ADVISOR_FORECAST_DETAIL: "ADVISOR_FORECAST_DETAIL",
  ACTIVITY_FORECAST_PLAN: "ACTIVITY_FORECAST_PLAN",
  PIPELINE_FORECAST_CONTEXT: "PIPELINE_FORECAST_CONTEXT",
  PIPELINE_AT_RISK: "PIPELINE_AT_RISK",
  FORECAST_SOURCE_REVIEW: "FORECAST_SOURCE_REVIEW"
});

const ROUTES = Object.freeze({
  [ADVISOR_FORECAST_DESTINATIONS.ADVISOR_FORECAST_DETAIL]: {
    deepLink: "?nav=actividad&view=advisor-forecast",
    module: "ACTIVIDAD",
    view: "advisor-forecast",
    filter: null
  },
  [ADVISOR_FORECAST_DESTINATIONS.ACTIVITY_FORECAST_PLAN]: {
    deepLink: "?nav=actividad&view=forecast-plan",
    module: "ACTIVIDAD",
    view: "forecast-plan",
    filter: null
  },
  [ADVISOR_FORECAST_DESTINATIONS.PIPELINE_FORECAST_CONTEXT]: {
    deepLink: "?nav=pipeline&view=forecast-context&filter=weighted-contributors",
    module: "PIPELINE",
    view: "forecast-context",
    filter: "weighted-contributors"
  },
  [ADVISOR_FORECAST_DESTINATIONS.PIPELINE_AT_RISK]: {
    deepLink: "?nav=pipeline&view=forecast-context&filter=at-risk",
    module: "PIPELINE",
    view: "forecast-context",
    filter: "at-risk"
  },
  [ADVISOR_FORECAST_DESTINATIONS.FORECAST_SOURCE_REVIEW]: {
    deepLink: "?nav=actividad&view=forecast-sources",
    module: "ACTIVIDAD",
    view: "forecast-sources",
    filter: null
  }
});

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

export function resolveAdvisorForecastNavigationAction(action = {}, { advisorId = null } = {}) {
  const destination = action.destination;
  const route = ROUTES[destination];
  if (!route) throw new TypeError(`Unknown Advisor Forecast destination ${String(destination)}`);
  return Object.freeze({
    type: "NAVIGATE",
    label: action.label || "Abrir",
    destination,
    deepLink: route.deepLink,
    module: route.module,
    view: route.view,
    filter: route.filter,
    advisorId,
    readOnly: true,
    humanInitiated: true,
    createsPipelineMutation: false,
    createsActivityMutation: false,
    createsDatabaseWrite: false
  });
}

export function buildAdvisorForecastNavigationActions(readModel = {}) {
  const raw = Array.isArray(readModel.actions) ? readModel.actions : [];
  return Object.freeze(raw.map((action) => resolveAdvisorForecastNavigationAction(action, { advisorId: readModel.advisorId })));
}

export function navigateAdvisorForecastAction({ action, navigate } = {}) {
  if (typeof navigate !== "function") throw new TypeError("navigate callback is required");
  const resolved = action?.deepLink ? clone(action) : resolveAdvisorForecastNavigationAction(action);
  return navigate(resolved.deepLink, resolved);
}

export const ADVISOR_FORECAST_NAVIGATION_BOUNDARY = Object.freeze({
  automaticNavigationAllowed: false,
  routeMutationAllowed: false,
  pipelineMutationAllowed: false,
  activityMutationAllowed: false,
  databaseWriteAllowed: false,
  finalAuthority: "HUMAN"
});
