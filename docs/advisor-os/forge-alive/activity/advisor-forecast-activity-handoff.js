export const ADVISOR_FORECAST_ACTIVITY_HANDOFF_SCHEMA = "forge.advisor-forecast-activity-handoff.v1";
export const ADVISOR_FORECAST_ACTIVITY_DRAFT_SCHEMA = "forge.advisor-forecast-activity-draft.v1";

export const ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES = Object.freeze({
  READY_FOR_HUMAN_REVIEW: "READY_FOR_HUMAN_REVIEW",
  GOAL_COVERED: "GOAL_COVERED",
  BLOCKED_BY_MISSING_CONTEXT: "BLOCKED_BY_MISSING_CONTEXT",
  SUBMITTED_AFTER_HUMAN_CONFIRMATION: "SUBMITTED_AFTER_HUMAN_CONFIRMATION"
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cloneJson(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}

function safeToken(value) {
  return String(value || "unknown").replace(/[^A-Za-z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 120);
}

function actionLabel(actionType) {
  switch (actionType) {
    case "PROSPECTING_CONTACTS": return "Contactos de prospección";
    case "APPOINTMENTS": return "Citas";
    case "PRESENTATIONS": return "Presentaciones";
    case "APPLICATIONS": return "Solicitudes";
    default: return String(actionType || "Actividad");
  }
}

function boundaryFlags() {
  return {
    automaticSubmissionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    automaticNavigationAllowed: false,
    createsActivityTruth: false,
    createsCrmWrite: false,
    createsDatabaseWrite: false,
    createsCalendarEvent: false,
    finalAuthority: "HUMAN"
  };
}

function statusFor(requirement) {
  if (!requirement) return ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.BLOCKED_BY_MISSING_CONTEXT;
  if (requirement.requirementStatus === "GOAL_COVERED") return ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.GOAL_COVERED;
  if (["READY", "PARTIAL"].includes(requirement.requirementStatus)) {
    return ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.READY_FOR_HUMAN_REVIEW;
  }
  return ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.BLOCKED_BY_MISSING_CONTEXT;
}

export function createAdvisorForecastActivityHandoff({
  advisorId,
  period,
  activityRequirement,
  generatedAt = new Date().toISOString(),
  sourceForecastId = null
} = {}) {
  if (!present(advisorId)) throw new TypeError("advisorId is required");
  const requirement = cloneJson(activityRequirement || null);
  const status = statusFor(requirement);
  const yearMonth = period?.yearMonth || requirement?.period?.yearMonth || "unknown";
  const handoffId = `forecast-activity-${safeToken(advisorId)}-${safeToken(yearMonth)}-${safeToken(generatedAt)}`;
  const recommendations = Array.isArray(requirement?.recommendedActions)
    ? requirement.recommendedActions.map((action, index) => ({
      recommendationId: `${handoffId}-${index + 1}`,
      actionType: action.actionType,
      label: actionLabel(action.actionType),
      requiredCount: finite(action.requiredCount),
      unit: action.unit || null,
      selected: true,
      dueAt: null,
      schedulingStatus: "REQUIRES_HUMAN_SCHEDULING",
      createsTask: false,
      createsCalendarEvent: false
    }))
    : [];

  return deepFreeze({
    schema: ADVISOR_FORECAST_ACTIVITY_HANDOFF_SCHEMA,
    handoffId,
    status,
    advisorId,
    period: cloneJson(period || requirement?.period || null),
    generatedAt,
    sourceForecastId,
    requirementStatus: requirement?.requirementStatus || null,
    confidence: requirement?.confidence || "INSUFFICIENT_DATA",
    residualPolicyGap: finite(requirement?.residualPolicyGap),
    recommendations,
    cadence: cloneJson(requirement?.cadence || null),
    evidenceRefs: cloneJson(requirement?.evidenceRefs || []),
    warnings: cloneJson(requirement?.warnings || []),
    humanReviewRequired: true,
    humanConfirmationRequired: true,
    confirmationState: "UNCONFIRMED",
    activityDraft: {
      schema: ADVISOR_FORECAST_ACTIVITY_DRAFT_SCHEMA,
      draftId: `${handoffId}-draft`,
      advisorId,
      period: cloneJson(period || requirement?.period || null),
      source: "ADVISOR_FORECAST",
      sourceForecastId,
      status: status === ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.READY_FOR_HUMAN_REVIEW
        ? "REQUIRES_HUMAN_REVIEW"
        : "BLOCKED",
      items: cloneJson(recommendations),
      submissionAuthority: "ADVISOR_CONFIRMED_ONLY"
    },
    ...boundaryFlags()
  });
}

function normalizeSelectedItems(handoff, selectedItems) {
  const available = new Map((handoff.recommendations || []).map((item) => [item.recommendationId, item]));
  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    throw new TypeError("At least one activity recommendation must be selected");
  }

  return selectedItems.map((selection) => {
    const source = available.get(selection.recommendationId);
    if (!source) throw new TypeError(`Unknown recommendation ${String(selection.recommendationId)}`);
    const dueAt = new Date(selection.dueAt || "");
    if (Number.isNaN(dueAt.getTime())) throw new TypeError("Each selected activity requires a valid dueAt");
    const requestedCount = finite(selection.requiredCount ?? source.requiredCount);
    if (requestedCount === null || requestedCount <= 0) throw new TypeError("Selected activity count must be positive");

    return {
      recommendationId: source.recommendationId,
      actionType: source.actionType,
      label: source.label,
      requiredCount: Math.ceil(requestedCount),
      unit: source.unit,
      dueAt: dueAt.toISOString(),
      source: "ADVISOR_FORECAST",
      confirmationState: "CONFIRMED",
      evidenceRefs: cloneJson(handoff.evidenceRefs || [])
    };
  });
}

export async function submitAdvisorForecastActivityHandoff({
  handoff,
  confirmation,
  selectedItems,
  submitDraft
} = {}) {
  if (!handoff || handoff.schema !== ADVISOR_FORECAST_ACTIVITY_HANDOFF_SCHEMA) {
    throw new TypeError("A valid Advisor Forecast activity handoff is required");
  }
  if (handoff.status !== ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.READY_FOR_HUMAN_REVIEW) {
    throw new Error("Activity handoff is not ready for submission");
  }
  if (!confirmation || confirmation.confirmedByAdvisor !== true) {
    throw new Error("Explicit advisor confirmation is required");
  }
  if (!present(confirmation.advisorId) || confirmation.advisorId !== handoff.advisorId) {
    throw new Error("Advisor confirmation identity does not match the handoff");
  }
  const confirmedAt = new Date(confirmation.confirmedAt || "");
  if (Number.isNaN(confirmedAt.getTime())) throw new TypeError("confirmedAt is required");
  if (typeof submitDraft !== "function") throw new TypeError("submitDraft callback is required");

  const items = normalizeSelectedItems(handoff, selectedItems);
  const confirmedDraft = deepFreeze({
    schema: ADVISOR_FORECAST_ACTIVITY_DRAFT_SCHEMA,
    draftId: handoff.activityDraft.draftId,
    handoffId: handoff.handoffId,
    advisorId: handoff.advisorId,
    period: cloneJson(handoff.period),
    source: "ADVISOR_FORECAST",
    sourceForecastId: handoff.sourceForecastId,
    status: "ADVISOR_CONFIRMED_READY_FOR_ACTIVITY_RUNTIME",
    confirmedAt: confirmedAt.toISOString(),
    confirmationAuthority: "ADVISOR",
    items,
    evidenceRefs: cloneJson(handoff.evidenceRefs || []),
    canonicalEventRequirement: "FES_DUE_ACTION_CREATED_AFTER_ACTIVITY_RUNTIME_ACCEPTANCE",
    directDatabaseWriteAllowed: false,
    directCalendarWriteAllowed: false
  });

  const submissionResult = await submitDraft(confirmedDraft);
  return deepFreeze({
    schema: ADVISOR_FORECAST_ACTIVITY_HANDOFF_SCHEMA,
    handoffId: handoff.handoffId,
    status: ADVISOR_FORECAST_ACTIVITY_HANDOFF_STATUSES.SUBMITTED_AFTER_HUMAN_CONFIRMATION,
    advisorId: handoff.advisorId,
    confirmedAt: confirmedAt.toISOString(),
    confirmedDraft,
    submissionResult: cloneJson(submissionResult ?? null),
    humanConfirmedSubmission: true,
    automaticSubmissionAllowed: false,
    automaticTaskCreationAllowed: false,
    automaticCalendarCreationAllowed: false,
    createsActivityTruth: false,
    finalAuthority: "HUMAN"
  });
}
