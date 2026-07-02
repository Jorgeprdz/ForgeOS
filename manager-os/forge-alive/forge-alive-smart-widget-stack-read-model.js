"use strict";

/**
 * Forge Alive Smart Widget Stack Read Model.
 *
 * Builds a contextual, read-only widget stack for Forge Alive.
 * It does not render UI, approve, send, unlock delivery, execute runtime,
 * write CRM/task/calendar records, or create downstream truth.
 */

const STACK_STATUS = "READY_FOR_SMART_WIDGET_STACK_REVIEW";
const STACK_DECISION = "PRESENT_CONTEXTUAL_READ_ONLY_WIDGETS";

const WIDGET_FAMILIES = Object.freeze({
  MORNING_AGENDA_WIDGET: "MORNING_AGENDA_WIDGET",
  FOLLOW_UP_PRIORITY_WIDGET: "FOLLOW_UP_PRIORITY_WIDGET",
  COMMISSION_UPDATE_WIDGET: "COMMISSION_UPDATE_WIDGET",
  TWENTY_FIVE_POINT_REVIEW_WIDGET: "TWENTY_FIVE_POINT_REVIEW_WIDGET",
  MONTHLY_GOAL_GAP_WIDGET: "MONTHLY_GOAL_GAP_WIDGET",
  GENESIS_REVIEW_PACKET_WIDGET_FAMILY: "GENESIS_REVIEW_PACKET_WIDGET_FAMILY",
  FORGOTTEN_CLIENT_WIDGET: "FORGOTTEN_CLIENT_WIDGET",
  OPPORTUNITY_RESCUE_WIDGET: "OPPORTUNITY_RESCUE_WIDGET",
  JUDGMENT_PROMPT_WIDGET: "JUDGMENT_PROMPT_WIDGET",
});

const FALSE_FLAGS = Object.freeze({
  actionExecutionAllowed: false,
  approvalMutationAllowed: false,
  sendAllowed: false,
  runtimeExecutionAllowed: false,
  truthMutationAllowed: false,
  sendsMessage: false,
  createsTask: false,
  createsCalendarEvent: false,
  createsCrmWrite: false,
  createsRevenueTruth: false,
  createsCompensationTruth: false,
  createsPayoutTruth: false,
  createsLifecycleTruth: false,
  createsHrTruth: false,
  createsRankingTruth: false,
  createsPunishmentTruth: false,
});

const BLOCKED_ACTIONS = Object.freeze([
  "approval_mutation",
  "send",
  "delivery_unlock",
  "provider_or_llm_runtime",
  "crm_task_calendar_write",
  "truth_mutation",
]);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(asArray(values).flat().filter(present))];
}

function numberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function currentHour(input) {
  if (typeof input.hour === "number" && Number.isFinite(input.hour)) return input.hour;
  if (input.currentTime) {
    const date = new Date(input.currentTime);
    if (!Number.isNaN(date.getTime())) return date.getHours();
  }
  return null;
}

function riskLevel(value) {
  if (typeof value === "number") {
    if (value >= 7) return "high";
    if (value >= 4) return "medium";
    return "low";
  }
  return String(value || "").toLowerCase();
}

function isHigh(value) {
  return value === true || riskLevel(value) === "high";
}

function evidence(input, extra = []) {
  return unique([
    ...asArray(input.evidenceRefs),
    ...asArray(input.sourceEvidenceIds),
    ...asArray(extra),
  ]);
}

function uncertainty(input, extra = []) {
  return unique([
    ...asArray(input.uncertainty),
    ...asArray(input.warnings),
    ...(input.uncertaintyHigh ? ["uncertainty_high"] : []),
    ...asArray(extra),
  ]);
}

function missingContext(input, extra = []) {
  return unique([
    ...asArray(input.missingContext),
    ...asArray(input.unknownContext),
    ...(input.missingContextHigh ? ["missing_context_high"] : []),
    ...asArray(extra),
  ]);
}

function reviewQuestions(extra = []) {
  return unique([
    "Why is this widget appearing now?",
    "What evidence supports this signal?",
    "What context is missing?",
    "What should the human decide before acting?",
    "What should the advisor or manager learn from this case?",
    ...asArray(extra),
  ]);
}

function createWidget({
  widgetFamily,
  title,
  subtitle,
  priority,
  whyThisAppearsNow,
  input,
  evidenceExtra,
  uncertaintyExtra,
  missingContextExtra,
  article0LearningValue,
  questions,
}) {
  return {
    widgetId: `forge-alive-${widgetFamily.toLowerCase()}`,
    widgetFamily,
    title,
    subtitle,
    priority,
    reasonWhyVisible: true,
    whyThisAppearsNow,
    evidenceRefs: evidence(input, evidenceExtra),
    uncertainty: uncertainty(input, uncertaintyExtra),
    missingContext: missingContext(input, missingContextExtra),
    humanDecisionCheckpointRequired: true,
    article0LearningValue,
    reviewQuestions: reviewQuestions(questions),
    boundaryBadges: [
      "READ_ONLY",
      "FINAL_AUTHORITY_HUMAN",
      "ARTICLE_0_ACTIVE",
      "NO_APPROVAL_SEND_RUNTIME_TRUTH",
    ],
    blockedActions: [...BLOCKED_ACTIONS],
    readOnly: true,
    finalAuthority: "HUMAN",
    ...FALSE_FLAGS,
  };
}

function candidateWidgets(input) {
  const widgets = [];
  const hour = currentHour(input);

  if (hour === 8 && input.agendaAvailable) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.MORNING_AGENDA_WIDGET,
      title: "Morning agenda",
      subtitle: "day plan / agenda context",
      priority: 90,
      whyThisAppearsNow: "It is 8 AM and agenda context is available for day planning.",
      input,
      evidenceExtra: ["time.8am", "agenda.available"],
      article0LearningValue: "Start the day by deciding the highest-leverage plan, not by scanning a dashboard.",
    }));
  }

  if (hour === 16 && input.twentyFivePointReviewDue) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.TWENTY_FIVE_POINT_REVIEW_WIDGET,
      title: "25-point review",
      subtitle: "afternoon closing check",
      priority: 88,
      whyThisAppearsNow: "It is 4 PM and the 25-point review is due for an afternoon control check.",
      input,
      evidenceExtra: ["time.4pm", "twenty_five_point_review.due"],
      article0LearningValue: "Review what remains before the day ends and choose the next responsible action.",
    }));
  }

  if (input.commissionUpdateAvailable) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.COMMISSION_UPDATE_WIDGET,
      title: "Commission update",
      subtitle: "commission glance / not payout truth",
      priority: 82,
      whyThisAppearsNow: "A new commission update is available and may change what the human should inspect next.",
      input,
      evidenceExtra: ["commission.update_available"],
      uncertaintyExtra: ["commission_update_is_not_payout_truth"],
      article0LearningValue: "Separate commission context from payout truth before making a decision.",
    }));
  }

  if (isHigh(input.followUpRisk)) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.FOLLOW_UP_PRIORITY_WIDGET,
      title: "Follow-up priority",
      subtitle: "high follow-up risk",
      priority: 86,
      whyThisAppearsNow: "Follow-up risk is high and may require human review before the opportunity cools.",
      input,
      evidenceExtra: ["followup.risk_high"],
      article0LearningValue: "Evaluate why the follow-up matters and whether the message respects the person's agency.",
    }));
  }

  if (numberOrZero(input.forgottenClientCount) > 0) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.FORGOTTEN_CLIENT_WIDGET,
      title: "Forgotten client",
      subtitle: "neglected relationship context",
      priority: 78,
      whyThisAppearsNow: "There are forgotten clients that may need human review and relationship repair.",
      input,
      evidenceExtra: ["forgotten_client.count_present"],
      article0LearningValue: "Inspect relationship context before deciding whether and how to reconnect.",
    }));
  }

  if (isHigh(input.goalGap)) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.MONTHLY_GOAL_GAP_WIDGET,
      title: "Monthly goal gap",
      subtitle: "goal / gap context, not revenue truth",
      priority: 74,
      whyThisAppearsNow: "Monthly goal gap risk is high and may affect prioritization.",
      input,
      evidenceExtra: ["goal_gap.high"],
      uncertaintyExtra: ["goal_gap_context_is_not_revenue_truth"],
      article0LearningValue: "Use the gap as decision context without treating it as guaranteed revenue.",
    }));
  }

  if (input.opportunityAvailable || isHigh(input.opportunityRisk)) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.OPPORTUNITY_RESCUE_WIDGET,
      title: "Opportunity rescue",
      subtitle: "opportunity risk context",
      priority: 72,
      whyThisAppearsNow: "An opportunity signal suggests a rescue review may be useful now.",
      input,
      evidenceExtra: ["opportunity.rescue_signal"],
      article0LearningValue: "Review whether the opportunity is real, fresh, and appropriate before acting.",
    }));
  }

  if (input.genesisReviewPacketsAvailable) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.GENESIS_REVIEW_PACKET_WIDGET_FAMILY,
      title: "Genesis review packet",
      subtitle: "review packet widget family / not permanent home card",
      priority: 80,
      whyThisAppearsNow: "A safe Genesis review packet is available and human review may be useful.",
      input,
      evidenceExtra: ["genesis.review_packet_available"],
      uncertaintyExtra: ["genesis_widget_is_contextual_not_permanent"],
      article0LearningValue: "Inspect evidence, uncertainty, and review questions before approving anything downstream.",
    }));
  }

  if (input.uncertaintyHigh || input.missingContextHigh) {
    widgets.push(createWidget({
      widgetFamily: WIDGET_FAMILIES.JUDGMENT_PROMPT_WIDGET,
      title: "Judgment prompt",
      subtitle: "uncertainty / missing context review",
      priority: 92,
      whyThisAppearsNow: "Uncertainty or missing context is high and should be visible before any decision.",
      input,
      uncertaintyExtra: ["uncertainty_or_missing_context_high"],
      missingContextExtra: ["review_missing_context_before_acting"],
      article0LearningValue: "Slow down the decision and identify what would make the recommendation wrong.",
    }));
  }

  for (const widget of asArray(input.widgets || input.candidateWidgets)) {
    if (!widget || !widget.widgetFamily) continue;
    widgets.push({
      ...clone(widget),
      reasonWhyVisible: widget.reasonWhyVisible !== false,
      whyThisAppearsNow: widget.whyThisAppearsNow || "Candidate widget was supplied for contextual review.",
      evidenceRefs: unique(widget.evidenceRefs),
      uncertainty: unique(widget.uncertainty),
      missingContext: unique(widget.missingContext),
      humanDecisionCheckpointRequired: true,
      article0LearningValue: widget.article0LearningValue || "Human review remains required before action.",
      reviewQuestions: reviewQuestions(widget.reviewQuestions),
      boundaryBadges: unique([
        ...asArray(widget.boundaryBadges),
        "READ_ONLY",
        "FINAL_AUTHORITY_HUMAN",
        "ARTICLE_0_ACTIVE",
        "NO_APPROVAL_SEND_RUNTIME_TRUTH",
      ]),
      blockedActions: unique([...asArray(widget.blockedActions), ...BLOCKED_ACTIONS]),
      readOnly: true,
      finalAuthority: "HUMAN",
      ...FALSE_FLAGS,
    });
  }

  return widgets;
}

function buildForgeAliveSmartWidgetStack(input = {}) {
  const before = JSON.stringify(input);
  const normalizedInput = clone(input) || {};
  const widgets = candidateWidgets(normalizedInput)
    .sort((left, right) => right.priority - left.priority);

  const stack = {
    stackStatus: STACK_STATUS,
    stackDecision: STACK_DECISION,
    article0Status: "ARTICLE_0_ACTIVE",
    article0Principle: "Forge exists to strengthen human judgment, not replace it.",
    article0Gate: "Does this strengthen human judgment, or does it create dependency?",
    finalAuthority: "HUMAN",
    reviewOnly: true,
    contextual: true,
    timeAware: true,
    signalAware: true,
    genesisWidgetsAreContextualNotPermanent: true,
    widgets,
    ...FALSE_FLAGS,
  };

  if (JSON.stringify(input) !== before) {
    throw new Error("Forge Alive Smart Widget Stack mutated input");
  }

  return stack;
}

module.exports = {
  buildForgeAliveSmartWidgetStack,
  FORGE_ALIVE_SMART_WIDGET_STACK_STATUS: STACK_STATUS,
  FORGE_ALIVE_SMART_WIDGET_STACK_DECISION: STACK_DECISION,
  FORGE_ALIVE_SMART_WIDGET_FAMILIES: WIDGET_FAMILIES,
};
