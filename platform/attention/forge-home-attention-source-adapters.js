import {
  createCrossDomainDecisionProjection,
} from "../decision-projection/forge-cross-domain-decision-projection.js";

export const HOME_ATTENTION_SOURCE_ADAPTER = "FORGE_HOME_ATTENTION_SMART_WIDGET_ADAPTER_007";

const FAMILY_MAP = Object.freeze({
  ACTIVITY_PROGRESS_WIDGET: Object.freeze({ domain: "PRODUCTIVITY", family: "PRODUCTIVITY" }),
  MONTHLY_POLICY_GOAL_WIDGET: Object.freeze({ domain: "PRODUCTIVITY", family: "PLANNING" }),
  INCOME_PROGRESS_WIDGET: Object.freeze({ domain: "REVENUE", family: "ECONOMIC" }),
  POLICY_SERVICE_RISK_WIDGET: Object.freeze({ domain: "SERVICING", family: "SERVICING" }),
  OPPORTUNITY_CLOSE_LIKELIHOOD_WIDGET: Object.freeze({ domain: "OPPORTUNITY", family: "COMMERCIAL_ATTENTION" }),
  MORNING_AGENDA_WIDGET: Object.freeze({ domain: "PIPELINE", family: "FOLLOW_UP" }),
  TWENTY_FIVE_POINT_REVIEW_WIDGET: Object.freeze({ domain: "ADVISOR_INTELLIGENCE", family: "COACHING" }),
  FOLLOW_UP_PRIORITY_WIDGET: Object.freeze({ domain: "PIPELINE", family: "FOLLOW_UP" }),
  JUDGMENT_PROMPT_WIDGET: Object.freeze({ domain: "ADVISOR_INTELLIGENCE", family: "PLANNING" }),
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function strings(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === "string" && value.trim()).map(value => value.trim()))];
}

function lifecycleState(widgetState) {
  const state = String(widgetState || "UNKNOWN").toUpperCase();
  if (state === "STALE") return "STALE";
  if (state === "EMPTY") return "RESOLVED";
  if (state === "READY" || state === "PARTIAL") return "ACTIVE";
  return "DERIVED";
}

function sourceInstant(widget, stackGeneratedAt) {
  return widget?.freshness?.asOf
    || widget?.freshness?.observedAt
    || widget?.freshness?.generatedAt
    || stackGeneratedAt
    || null;
}

function actionFromWidget(widget, advisorReference) {
  const action = widget?.reviewAction;
  if (!action?.type || !action?.label) return null;
  return {
    type: String(action.type),
    label: String(action.label),
    owner: "ADVISOR",
    target: advisorReference,
    deepLink: widget.deepLink || action.deepLink || null,
    humanApprovalRequired: true,
  };
}

export function projectProductiveSmartWidgetDecision({
  advisorReference,
  widget,
  stackGeneratedAt = null,
} = {}) {
  if (!advisorReference) throw new TypeError("HOME_007_ADVISOR_REFERENCE_REQUIRED");
  if (!widget?.widgetId || !widget?.widgetFamily) throw new TypeError("HOME_007_WIDGET_CONTRACT_REQUIRED");

  const mapping = FAMILY_MAP[widget.widgetFamily];
  if (!mapping) throw new TypeError(`HOME_007_WIDGET_FAMILY_UNSUPPORTED:${widget.widgetFamily}`);

  const sourceAuthorities = strings(widget.sourceAuthorities);
  if (!sourceAuthorities.length) throw new TypeError(`HOME_007_WIDGET_SOURCE_AUTHORITY_REQUIRED:${widget.widgetId}`);

  const observedAt = sourceInstant(widget, stackGeneratedAt);
  const evidence = strings(widget.evidence).map(reference => ({
    reference,
    authority: sourceAuthorities[0],
    observedAt,
  }));
  const limitations = strings([
    ...(Array.isArray(widget.uncertainty) ? widget.uncertainty : []),
    ...(Array.isArray(widget.missingContext) ? widget.missingContext : []),
    ...(widget.blockedReason ? [widget.blockedReason] : []),
  ]);
  const reason = String(widget.subtitle || widget.whyNow || widget.title || "").trim();
  if (!String(widget.title || "").trim() || !reason) {
    throw new TypeError(`HOME_007_WIDGET_EXPLANATION_REQUIRED:${widget.widgetId}`);
  }

  return createCrossDomainDecisionProjection({
    decisionReference: `home-widget:${widget.widgetId}`,
    advisorReference,
    subject: { type: "ADVISOR", reference: advisorReference },
    domain: mapping.domain,
    family: mapping.family,
    decisionType: widget.widgetFamily,
    truthState: String(widget.state || "UNKNOWN").toUpperCase(),
    title: String(widget.title),
    reason,
    whyNow: widget.whyNow || null,
    confidence: widget.confidence
      ? {
          value: String(widget.confidence),
          authority: sourceAuthorities[0],
          sourceReference: widget.widgetId,
        }
      : null,
    evidence,
    limitations,
    recommendedAction: actionFromWidget(widget, advisorReference),
    impact: null,
    provenance: {
      sourceAuthorities,
      sourceReferences: [widget.widgetId, ...strings(widget.evidence)],
      adapters: [HOME_ATTENTION_SOURCE_ADAPTER],
      evaluatedAt: stackGeneratedAt || observedAt || null,
    },
    lifecycle: {
      state: lifecycleState(widget.state),
      evaluatedAt: stackGeneratedAt || observedAt || null,
      sourceUpdatedAt: observedAt,
    },
    feedback: {
      owner: null,
      expectedEvents: [],
    },
    composition: {
      key: `advisor:${advisorReference}:home-attention:${widget.widgetFamily}`,
      actionKey: null,
      mergeCompatible: false,
    },
    humanDecisionRequired: true,
  });
}

export function projectProductiveSmartWidgetStack({
  advisorReference,
  stack,
} = {}) {
  if (!advisorReference) throw new TypeError("HOME_007_ADVISOR_REFERENCE_REQUIRED");
  if (!stack || typeof stack !== "object") throw new TypeError("HOME_007_WIDGET_STACK_REQUIRED");

  const visible = Array.isArray(stack.visible) ? stack.visible : [];
  const projections = [];
  const omitted = [];

  for (const widget of visible) {
    try {
      projections.push(projectProductiveSmartWidgetDecision({
        advisorReference,
        widget,
        stackGeneratedAt: stack.generatedAt || null,
      }));
    } catch (error) {
      omitted.push(Object.freeze({
        sourceReference: widget?.widgetId || null,
        reason: error?.message || "HOME_007_WIDGET_PROJECTION_FAILED",
      }));
    }
  }

  return deepFreeze({
    adapter: HOME_ATTENTION_SOURCE_ADAPTER,
    advisorReference,
    sourceState: stack.stackStatus || "UNKNOWN",
    sourceOrder: visible.map(widget => widget?.widgetId || null),
    projections,
    omitted,
    diagnostics: {
      sourceContract: stack.schemaVersion || "forge.productive-smart-widget-stack.v1",
      sourceSelectionOwner: "PRODUCTIVE_SMART_WIDGET_ORCHESTRATOR",
      rankingPerformed: false,
      rankScoreRead: false,
      scoreCalculated: false,
      winnerSelected: false,
      identityInferencePerformed: false,
      domainWrites: 0,
    },
  });
}

export { FAMILY_MAP };
