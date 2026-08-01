export const PRODUCTIVE_SMART_WIDGET_SCHEMA_VERSION = "forge.productive-smart-widget.v1";
export const PRODUCTIVE_SMART_WIDGET_STACK_SCHEMA_VERSION = "forge.productive-smart-widget-stack.v1";

export const SMART_WIDGET_STATES = Object.freeze({
  LOADING: "LOADING",
  READY: "READY",
  EMPTY: "EMPTY",
  PARTIAL: "PARTIAL",
  STALE: "STALE",
  SOURCE_UNAVAILABLE: "SOURCE_UNAVAILABLE",
  NOT_CONNECTED: "NOT_CONNECTED",
  SESSION_REQUIRED: "SESSION_REQUIRED",
  BLOCKED_BY_MISSING_EVIDENCE: "BLOCKED_BY_MISSING_EVIDENCE",
  HIDDEN_BY_SCOPE: "HIDDEN_BY_SCOPE",
});

export const PRODUCTIVE_SMART_WIDGET_FAMILIES = Object.freeze({
  ACTIVITY_PROGRESS_WIDGET: "ACTIVITY_PROGRESS_WIDGET",
  MONTHLY_POLICY_GOAL_WIDGET: "MONTHLY_POLICY_GOAL_WIDGET",
  INCOME_PROGRESS_WIDGET: "INCOME_PROGRESS_WIDGET",
  POLICY_SERVICE_RISK_WIDGET: "POLICY_SERVICE_RISK_WIDGET",
  OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET: "OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET",
  MORNING_AGENDA_WIDGET: "MORNING_AGENDA_WIDGET",
  TWENTY_FIVE_POINT_REVIEW_WIDGET: "TWENTY_FIVE_POINT_REVIEW_WIDGET",
  FOLLOW_UP_PRIORITY_WIDGET: "FOLLOW_UP_PRIORITY_WIDGET",
  JUDGMENT_PROMPT_WIDGET: "JUDGMENT_PROMPT_WIDGET",
});

export const SMART_WIDGET_RENDER_VARIANTS = Object.freeze({
  METRIC: "METRIC",
  TREND: "TREND",
  PROGRESS: "PROGRESS",
  ALERT: "ALERT",
  PERSON: "PERSON",
  POLICY: "POLICY",
  AGENDA: "AGENDA",
  JUDGMENT: "JUDGMENT",
});

export const NON_VISIBLE_WIDGET_STATES = Object.freeze(new Set([
  SMART_WIDGET_STATES.LOADING,
  SMART_WIDGET_STATES.EMPTY,
  SMART_WIDGET_STATES.SOURCE_UNAVAILABLE,
  SMART_WIDGET_STATES.NOT_CONNECTED,
  SMART_WIDGET_STATES.SESSION_REQUIRED,
  SMART_WIDGET_STATES.HIDDEN_BY_SCOPE,
]));

const DATA_REDACTED_WIDGET_STATES = Object.freeze(new Set([
  SMART_WIDGET_STATES.LOADING,
  SMART_WIDGET_STATES.SOURCE_UNAVAILABLE,
  SMART_WIDGET_STATES.NOT_CONNECTED,
  SMART_WIDGET_STATES.SESSION_REQUIRED,
  SMART_WIDGET_STATES.HIDDEN_BY_SCOPE,
]));

const FALSE_BOUNDARY_FLAGS = Object.freeze({
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

export class ProductiveSmartWidgetContractError extends TypeError {
  constructor(message) {
    super(`ProductiveSmartWidgetContract: ${message}`);
    this.name = "ProductiveSmartWidgetContractError";
  }
}

export function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

export function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

export function asFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function uniqueStrings(values = []) {
  return [...new Set(values.flat(Infinity).filter((value) => typeof value === "string" && value.trim()))];
}

export function isVisibleWidgetState(state) {
  return !NON_VISIBLE_WIDGET_STATES.has(state);
}

export function createMetric({ value, unit = null, label = null, display } = {}) {
  const normalizedValue = asFiniteNumber(value);
  return deepFreeze({
    value: normalizedValue,
    unit,
    label,
    display: display === undefined ? (normalizedValue === null ? null : String(normalizedValue)) : display,
  });
}

export function createProductiveSmartWidget(input = {}) {
  const familyValues = new Set(Object.values(PRODUCTIVE_SMART_WIDGET_FAMILIES));
  const stateValues = new Set(Object.values(SMART_WIDGET_STATES));
  const variantValues = new Set(Object.values(SMART_WIDGET_RENDER_VARIANTS));

  if (!familyValues.has(input.widgetFamily)) {
    throw new ProductiveSmartWidgetContractError(`unknown widgetFamily ${String(input.widgetFamily)}`);
  }
  if (!stateValues.has(input.state)) {
    throw new ProductiveSmartWidgetContractError(`unknown state ${String(input.state)}`);
  }
  if (!variantValues.has(input.renderVariant)) {
    throw new ProductiveSmartWidgetContractError(`unknown renderVariant ${String(input.renderVariant)}`);
  }

  const widgetId = input.widgetId || `forge-${input.widgetFamily.toLowerCase()}`;
  const score = asFiniteNumber(input.rankScore) ?? 0;
  const confidence = input.confidence || "UNKNOWN";
  const redactUnavailableData = DATA_REDACTED_WIDGET_STATES.has(input.state);

  return deepFreeze({
    schemaVersion: PRODUCTIVE_SMART_WIDGET_SCHEMA_VERSION,
    widgetId,
    widgetFamily: input.widgetFamily,
    state: input.state,
    rankScore: score,
    hardPriority: input.hardPriority || null,
    title: input.title || "",
    subtitle: input.subtitle || "",
    primaryMetric: redactUnavailableData ? createMetric() : (input.primaryMetric || createMetric()),
    secondaryMetric: redactUnavailableData ? createMetric() : (input.secondaryMetric || createMetric()),
    comparison: redactUnavailableData ? null : cloneJson(input.comparison ?? null),
    trend: redactUnavailableData ? null : cloneJson(input.trend ?? null),
    chartReady: redactUnavailableData ? null : cloneJson(input.chartReady ?? null),
    whyNow: input.whyNow || "",
    evidence: uniqueStrings(input.evidence || []),
    uncertainty: uniqueStrings(input.uncertainty || []),
    missingContext: uniqueStrings(input.missingContext || []),
    confidence,
    freshness: cloneJson(input.freshness ?? null),
    sourceAuthorities: uniqueStrings(input.sourceAuthorities || []),
    deepLink: input.deepLink || null,
    reviewAction: cloneJson(input.reviewAction ?? null),
    blockedReason: input.blockedReason || null,
    renderVariant: input.renderVariant,
    payload: redactUnavailableData ? {} : cloneJson(input.payload ?? {}),
    unavailableDataRedacted: redactUnavailableData,
    readOnly: true,
    finalAuthority: "HUMAN",
    reasonWhyVisible: Boolean(input.whyNow),
    humanDecisionCheckpointRequired: true,
    boundaryBadges: [
      "READ_ONLY",
      "FINAL_AUTHORITY_HUMAN",
      "ARTICLE_0_ACTIVE",
      "NO_AUTONOMOUS_EXECUTION",
      ...(redactUnavailableData ? ["UNKNOWN_IS_NOT_ZERO"] : []),
    ],
    ...FALSE_BOUNDARY_FLAGS,
  });
}

export function createProductiveSmartWidgetStack(input = {}) {
  return deepFreeze({
    schemaVersion: PRODUCTIVE_SMART_WIDGET_STACK_SCHEMA_VERSION,
    stackStatus: input.stackStatus || SMART_WIDGET_STATES.READY,
    advisorId: input.advisorId || null,
    generatedAt: input.generatedAt || null,
    primary: input.primary || null,
    supporting: cloneJson(input.supporting || []),
    visible: cloneJson(input.visible || []),
    inventory: cloneJson(input.inventory || []),
    pendingDependencies: cloneJson(input.pendingDependencies || []),
    selectionTrace: cloneJson(input.selectionTrace || []),
    limits: cloneJson(input.limits || { primary: 1, supporting: 2, visible: 3 }),
    contextual: true,
    timeAware: true,
    signalAware: true,
    stableSelection: true,
    finalAuthority: "HUMAN",
    article0Status: "ARTICLE_0_ACTIVE",
    article0Principle: "Forge exists to strengthen human judgment, not replace it.",
    ...FALSE_BOUNDARY_FLAGS,
  });
}
