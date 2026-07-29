"use strict";

const {
  buildNbaReasonWhyBoundary,
  NBA_REASON_WHY_STATUSES,
  NBA_REASON_WHY_ALLOWED_USES,
  NBA_REASON_WHY_FORBIDDEN_USES
} = typeof module !== "undefined" && module.exports
  ? require("./nba-reason-why-boundary-contract")
  : globalThis.ForgeNbaReasonWhyBoundary006B;

const NASH_MICK_NBA_RECONNECTION_STATUSES = Object.freeze({
  READY_FOR_HUMAN_REVIEW: "READY_FOR_HUMAN_REVIEW",
  NEEDS_NASH_CONTEXT: "NEEDS_NASH_CONTEXT",
  NEEDS_MICK_CONTEXT: "NEEDS_MICK_CONTEXT",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_REASON_WHY: "NEEDS_REASON_WHY",
  NEEDS_TARGET_PERSON: "NEEDS_TARGET_PERSON",
  NEEDS_RECOMMENDED_ACTION: "NEEDS_RECOMMENDED_ACTION",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const NASH_MICK_NBA_RECONNECTION_DECISIONS = Object.freeze({
  RECONNECT_FOR_HUMAN_REVIEW: "RECONNECT_FOR_HUMAN_REVIEW",
  COLLECT_NASH_CONTEXT: "COLLECT_NASH_CONTEXT",
  COLLECT_MICK_CONTEXT: "COLLECT_MICK_CONTEXT",
  COLLECT_PROTECTED_CONTEXT: "COLLECT_PROTECTED_CONTEXT",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE",
  NOT_MODELED: "NOT_MODELED"
});

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(asArray(values).flat().filter(present))];
}

function collectNested(value, field) {
  if (!present(value)) return [];
  if (Array.isArray(value)) return value.flatMap((entry) => collectNested(entry, field));
  if (!isObject(value)) return [];
  return [
    ...asArray(value[field]),
    ...Object.values(value).flatMap((entry) => collectNested(entry, field))
  ];
}

function firstPresent(...values) {
  return values.find(present) ?? null;
}

function collectField(values, fields) {
  for (const field of fields) {
    for (const value of values) {
      const found = collectNested(value, field).find(present);
      if (present(found)) return found;
    }
  }
  return null;
}

function mergeSourceEvidence(contextValues, sourceEvidence = {}) {
  return {
    evidenceRefs: unique([
      ...asArray(sourceEvidence.evidenceRefs),
      ...asArray(sourceEvidence.evidenceRef),
      ...contextValues.flatMap((value) => collectNested(value, "evidenceRefs")),
      ...contextValues.flatMap((value) => collectNested(value, "evidenceRef"))
    ]),
    sourceEvidenceIds: unique([
      ...asArray(sourceEvidence.sourceEvidenceIds),
      ...asArray(sourceEvidence.sourceEvidenceId),
      ...contextValues.flatMap((value) => collectNested(value, "sourceEvidenceIds")),
      ...contextValues.flatMap((value) => collectNested(value, "sourceEvidenceId"))
    ]),
    sourceOwners: unique([
      ...asArray(sourceEvidence.sourceOwners),
      ...asArray(sourceEvidence.sourceOwner),
      ...contextValues.flatMap((value) => collectNested(value, "sourceOwners")),
      ...contextValues.flatMap((value) => collectNested(value, "sourceOwner"))
    ]),
    freshness: sourceEvidence.freshness || collectField(contextValues, ["freshness", "freshnessStatus", "generatedAt", "capturedAt", "updatedAt"])
  };
}

function falseFlags() {
  return {
    suggestedMessageDraftAllowed: false,
    humanApprovalRequired: true,
    automaticExecutionAllowed: false,
    createsMessageDraft: false,
    sendsMessage: false,
    createsTask: false,
    createsCalendarEvent: false,
    executesNashRuntime: false,
    executesMickRuntime: false,
    callsLlmRuntime: false,
    createsCompensationTruth: false,
    createsPayoutTruth: false,
    createsRevenueTruth: false,
    createsRankingTruth: false,
    createsPunishmentTruth: false,
    createsHrTruth: false,
    createsPromotionTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsPersonalityTruth: false
  };
}

function resolveReconnectionStatus(boundaryResult, nashConversationContext, mickBehaviorContext) {
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.BLOCKED) return NASH_MICK_NBA_RECONNECTION_STATUSES.BLOCKED;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NOT_MODELED) return NASH_MICK_NBA_RECONNECTION_STATUSES.NOT_MODELED;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.UNKNOWN) return NASH_MICK_NBA_RECONNECTION_STATUSES.UNKNOWN;
  if (!present(nashConversationContext)) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_NASH_CONTEXT;
  if (!present(mickBehaviorContext)) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_MICK_CONTEXT;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_EVIDENCE) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_EVIDENCE;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_SOURCE_OWNER) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_SOURCE_OWNER;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_FRESHNESS) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_FRESHNESS;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_REASON_WHY) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_REASON_WHY;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_TARGET_PERSON) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_TARGET_PERSON;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_RECOMMENDED_ACTION) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_RECOMMENDED_ACTION;
  if (boundaryResult.contractStatus === NBA_REASON_WHY_STATUSES.NEEDS_HUMAN_REVIEW) return NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_HUMAN_REVIEW;
  return NASH_MICK_NBA_RECONNECTION_STATUSES.READY_FOR_HUMAN_REVIEW;
}

function resolveReconnectionDecision(status) {
  if (status === NASH_MICK_NBA_RECONNECTION_STATUSES.BLOCKED) return NASH_MICK_NBA_RECONNECTION_DECISIONS.BLOCK_FORBIDDEN_USE;
  if (status === NASH_MICK_NBA_RECONNECTION_STATUSES.NOT_MODELED) return NASH_MICK_NBA_RECONNECTION_DECISIONS.NOT_MODELED;
  if (status === NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_NASH_CONTEXT) return NASH_MICK_NBA_RECONNECTION_DECISIONS.COLLECT_NASH_CONTEXT;
  if (status === NASH_MICK_NBA_RECONNECTION_STATUSES.NEEDS_MICK_CONTEXT) return NASH_MICK_NBA_RECONNECTION_DECISIONS.COLLECT_MICK_CONTEXT;
  if (status === NASH_MICK_NBA_RECONNECTION_STATUSES.READY_FOR_HUMAN_REVIEW) {
    return NASH_MICK_NBA_RECONNECTION_DECISIONS.RECONNECT_FOR_HUMAN_REVIEW;
  }
  return NASH_MICK_NBA_RECONNECTION_DECISIONS.COLLECT_PROTECTED_CONTEXT;
}

function buildBoundaryInput(input, mergedSourceEvidence) {
  const {
    advisorId = null,
    managerId = null,
    personId = null,
    personType = null,
    period = null,
    relationshipContext = null,
    activityContext = null,
    followupContext = null,
    nashConversationContext = null,
    nashCombatContext = null,
    mickBehaviorContext = null,
    goalContext = null,
    compensationCandidateContext = null,
    forecastContext = null,
    requestedUse = null
  } = input;

  const recommendedAction = firstPresent(
    input.recommendedAction,
    collectField([followupContext, nashConversationContext, mickBehaviorContext], ["recommendedAction", "candidateAction", "nextBestAction", "suggestedAction"])
  );
  const relationship = present(relationshipContext) ? relationshipContext : null;
  const resolvedWhyNow = firstPresent(input.whyNow, collectField([mickBehaviorContext, activityContext], ["whyNow", "timingReason", "urgencyContext"]));
  const activity = {
    ...(isObject(activityContext) ? clone(activityContext) : {}),
    ...(present(resolvedWhyNow) ? { whyNow: resolvedWhyNow } : {})
  };
  const resolvedWhyThisAction = firstPresent(input.whyThisAction, collectField([mickBehaviorContext, followupContext], ["whyThisAction", "actionReason", "behaviorReason"]));
  const followup = {
    ...(isObject(followupContext) ? clone(followupContext) : {}),
    ...(present(recommendedAction) ? { recommendedAction } : {}),
    ...(present(resolvedWhyThisAction) ? { whyThisAction: resolvedWhyThisAction } : {})
  };
  const resolvedConversationAngle = firstPresent(
    input.conversationAngle,
    collectField([nashConversationContext], ["conversationAngle", "messageAngle", "style", "toneGuidance"])
  );
  const resolvedWhyThisMessage = firstPresent(
    input.whyThisMessage,
    collectField([nashConversationContext], ["whyThisMessage", "messageReason", "conversationReason"])
  );
  const nashConversation = {
    ...(isObject(nashConversationContext) ? clone(nashConversationContext) : {}),
    ...(present(resolvedConversationAngle) ? { conversationAngle: resolvedConversationAngle } : {}),
    ...(present(resolvedWhyThisMessage) ? { whyThisMessage: resolvedWhyThisMessage } : {})
  };
  const resolvedObjectionSupport = firstPresent(
    input.objectionSupport,
    collectField([nashCombatContext], ["objectionSupport", "objectionContext", "combatSupport"])
  );
  const nashCombat = {
    ...(isObject(nashCombatContext) ? clone(nashCombatContext) : {}),
    ...(present(resolvedObjectionSupport) ? { objectionSupport: resolvedObjectionSupport } : {})
  };
  const resolvedReasonWhy = firstPresent(
    input.reasonWhy,
    collectField([mickBehaviorContext, activityContext, followupContext], ["reasonWhy", "reason", "explanation"])
  );
  const mickBehavior = {
    ...(isObject(mickBehaviorContext) ? clone(mickBehaviorContext) : {}),
    ...(present(resolvedReasonWhy) ? { reasonWhy: resolvedReasonWhy } : {}),
    ...(present(resolvedWhyNow) ? { whyNow: resolvedWhyNow } : {}),
    ...(present(resolvedWhyThisAction) ? { whyThisAction: resolvedWhyThisAction } : {})
  };
  const optionalObject = (value) => (Object.keys(value).length > 0 ? value : null);

  return {
    advisorId,
    managerId,
    personId,
    personType,
    period,
    relationshipContext: relationship,
    activityContext: optionalObject(activity),
    followupContext: optionalObject(followup),
    nashConversationContext: optionalObject(nashConversation),
    nashCombatContext: optionalObject(nashCombat),
    mickBehaviorContext: optionalObject(mickBehavior),
    goalContext,
    compensationCandidateContext,
    forecastContext,
    sourceEvidence: mergedSourceEvidence,
    requestedUse
  };
}

function buildNashMickNbaReconnection(input = {}) {
  const safeInput = clone(input || {});
  const {
    relationshipContext = null,
    activityContext = null,
    followupContext = null,
    nashConversationContext = null,
    nashCombatContext = null,
    mickBehaviorContext = null,
    goalContext = null,
    compensationCandidateContext = null,
    forecastContext = null,
    sourceEvidence = {}
  } = safeInput;

  const contextValues = [
    relationshipContext,
    activityContext,
    followupContext,
    nashConversationContext,
    nashCombatContext,
    mickBehaviorContext,
    goalContext,
    compensationCandidateContext,
    forecastContext
  ];
  const mergedSourceEvidence = mergeSourceEvidence(contextValues, sourceEvidence);
  const boundaryInput = buildBoundaryInput(safeInput, mergedSourceEvidence);
  const boundaryContext = buildNbaReasonWhyBoundary(boundaryInput);
  const reconnectionStatus = resolveReconnectionStatus(boundaryContext, nashConversationContext, mickBehaviorContext);
  const reconnectionDecision = resolveReconnectionDecision(reconnectionStatus);
  const missingContext = unique([
    ...(!present(nashConversationContext) ? ["nash_conversation_context_missing"] : []),
    ...(!present(mickBehaviorContext) ? ["mick_behavior_context_missing"] : []),
    ...boundaryContext.missingSignals
  ]);

  return {
    reconnectionStatus,
    decision: reconnectionDecision,
    advisorId: boundaryContext.advisorId,
    managerId: boundaryContext.managerId,
    personId: boundaryContext.personId,
    personType: boundaryContext.personType,
    period: boundaryContext.period,
    recommendedAction: boundaryContext.recommendedAction,
    targetPerson: clone(boundaryContext.targetPerson),
    reasonWhy: boundaryContext.reasonWhy,
    whyNow: boundaryContext.whyNow,
    whyThisPerson: boundaryContext.whyThisPerson,
    whyThisAction: boundaryContext.whyThisAction,
    whyThisMessage: boundaryContext.whyThisMessage,
    conversationAngle: boundaryContext.conversationAngle,
    objectionSupport: boundaryContext.objectionSupport,
    suggestedMessageInstruction: boundaryContext.suggestedMessageInstruction,
    nashContext: clone(nashConversationContext),
    nashCombatContext: clone(nashCombatContext),
    mickContext: clone(mickBehaviorContext),
    boundaryContext,
    confidence: boundaryContext.confidence,
    confidenceLimitations: boundaryContext.confidenceLimitations,
    evidenceRefs: boundaryContext.evidenceRefs,
    sourceEvidenceIds: boundaryContext.sourceEvidenceIds,
    sourceOwners: boundaryContext.sourceOwners,
    freshness: boundaryContext.freshness,
    missingContext,
    missingSignals: boundaryContext.missingSignals,
    unknownSignals: boundaryContext.unknownSignals,
    staleSignals: boundaryContext.staleSignals,
    warnings: unique([
      "nash_mick_nba_reconnection_is_context_only",
      "nash_support_is_not_nash_runtime_execution",
      "mick_support_is_not_mick_runtime_execution",
      "nba_reason_why_is_not_automatic_action",
      ...boundaryContext.warnings
    ]),
    allowedUses: boundaryContext.allowedUses,
    blockedUses: boundaryContext.blockedUses,
    ...falseFlags()
  };
}

const ForgeNashMickNbaReconnection006C = {
  buildNashMickNbaReconnection,
  NASH_MICK_NBA_RECONNECTION_STATUSES,
  NASH_MICK_NBA_RECONNECTION_DECISIONS,
  NBA_REASON_WHY_ALLOWED_USES,
  NBA_REASON_WHY_FORBIDDEN_USES
};
if (typeof globalThis !== "undefined") globalThis.ForgeNashMickNbaReconnection006C = ForgeNashMickNbaReconnection006C;
if (typeof module !== "undefined" && module.exports) module.exports = ForgeNashMickNbaReconnection006C;
