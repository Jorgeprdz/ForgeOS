"use strict";

const NBA_REASON_WHY_STATUSES = Object.freeze({
  READY_FOR_HUMAN_REVIEW: "READY_FOR_HUMAN_REVIEW",
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

const NBA_REASON_WHY_DECISIONS = Object.freeze({
  PREPARE_FOR_HUMAN_REVIEW: "PREPARE_FOR_HUMAN_REVIEW",
  NEEDS_MORE_CONTEXT: "NEEDS_MORE_CONTEXT",
  BLOCKED_FOR_FORBIDDEN_USE: "BLOCKED_FOR_FORBIDDEN_USE",
  NOT_MODELED: "NOT_MODELED"
});

const NBA_REASON_WHY_ALLOWED_USES = Object.freeze([
  "ADVISOR_NEXT_BEST_ACTION_CONTEXT",
  "MANAGER_COACHING_CONTEXT",
  "FOLLOWUP_REASON_WHY",
  "CANDIDATE_OUTREACH_REASON_WHY",
  "PROSPECT_OUTREACH_REASON_WHY",
  "MESSAGE_PREP_CONTEXT",
  "ONE_ON_ONE_PREP",
  "COACHING_PREP"
]);

const NBA_REASON_WHY_FORBIDDEN_USES = Object.freeze([
  "AUTOMATIC_SEND",
  "AUTOMATIC_TASK_CREATION",
  "AUTOMATIC_CALENDAR_CREATION",
  "PUNISHMENT",
  "HUMAN_RANKING",
  "HR_DECISION",
  "PROMOTION_DECISION",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "MANIPULATION",
  "SURVEILLANCE",
  "PERSONALITY_TRUTH"
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function asArray(value) {
  if (!present(value)) return [];
  return Array.isArray(value) ? value.filter(present) : [value].filter(present);
}

function unique(values) {
  return [...new Set(asArray(values).flat().filter(present))];
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
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

function collectEvidenceRefs(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...values.flatMap((value) => collectNested(value, "evidenceRefs")),
    ...values.flatMap((value) => collectNested(value, "evidenceRef"))
  ]);
}

function collectSourceEvidenceIds(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...values.flatMap((value) => collectNested(value, "sourceEvidenceIds")),
    ...values.flatMap((value) => collectNested(value, "sourceEvidenceId"))
  ]);
}

function collectSourceOwners(values, sourceEvidence = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...values.flatMap((value) => collectNested(value, "sourceOwners")),
    ...values.flatMap((value) => collectNested(value, "sourceOwner"))
  ]);
}

function resolveFreshness(values, sourceEvidence = {}) {
  const candidates = unique([
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    ...values.flatMap((value) => collectNested(value, "freshness")),
    ...values.flatMap((value) => collectNested(value, "freshnessStatus")),
    ...values.flatMap((value) => collectNested(value, "generatedAt")),
    ...values.flatMap((value) => collectNested(value, "capturedAt")),
    ...values.flatMap((value) => collectNested(value, "updatedAt"))
  ]);
  const first = sourceEvidence.freshness || candidates[0] || null;
  const status = normalizeText(isObject(first) ? first.status : first);
  const stale =
    status === "STALE" ||
    status === "EXPIRED" ||
    values.some((value) => isObject(value) && (value.stale === true || normalizeText(value.status) === "STALE"));

  return {
    value: clone(first),
    available: candidates.length > 0,
    stale
  };
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

function collectSignals(values, fields) {
  return unique(fields.flatMap((field) => values.flatMap((value) => collectNested(value, field))));
}

function detectExplicitZero(value, path = "context") {
  if (value === 0) return [`${path}_explicit_zero_context_requires_review`];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => detectExplicitZero(entry, `${path}_${index}`));
  }
  if (!isObject(value)) return [];
  return Object.entries(value).flatMap(([key, entry]) => detectExplicitZero(entry, `${path}_${key}`));
}

function resolveUse(requestedUse) {
  const normalized = normalizeText(requestedUse);
  if (!normalized) return { allowedUses: ["ADVISOR_NEXT_BEST_ACTION_CONTEXT"], blockedUses: [], unknownUses: [] };
  if (NBA_REASON_WHY_FORBIDDEN_USES.includes(normalized)) {
    return { allowedUses: [], blockedUses: [normalized], unknownUses: [] };
  }
  if (NBA_REASON_WHY_ALLOWED_USES.includes(normalized)) {
    return { allowedUses: [normalized], blockedUses: [], unknownUses: [] };
  }
  return { allowedUses: [], blockedUses: [normalized], unknownUses: [normalized] };
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

function resolveStatus({
  blockedUses,
  unknownUses,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  freshnessContext,
  staleSignals,
  recommendedAction,
  targetPerson,
  reasonWhy,
  contextValues,
  unknownSignals
}) {
  if (blockedUses.length > 0) {
    return unknownUses.length > 0
      ? NBA_REASON_WHY_STATUSES.NOT_MODELED
      : NBA_REASON_WHY_STATUSES.BLOCKED;
  }
  if (contextValues.every((value) => !present(value))) return NBA_REASON_WHY_STATUSES.UNKNOWN;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return NBA_REASON_WHY_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return NBA_REASON_WHY_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshnessContext.available || freshnessContext.stale || staleSignals.length > 0) return NBA_REASON_WHY_STATUSES.NEEDS_FRESHNESS;
  if (!present(targetPerson)) return NBA_REASON_WHY_STATUSES.NEEDS_TARGET_PERSON;
  if (!present(recommendedAction)) return NBA_REASON_WHY_STATUSES.NEEDS_RECOMMENDED_ACTION;
  if (!present(reasonWhy)) return NBA_REASON_WHY_STATUSES.NEEDS_REASON_WHY;
  if (unknownSignals.length > 0) return NBA_REASON_WHY_STATUSES.NEEDS_HUMAN_REVIEW;
  return NBA_REASON_WHY_STATUSES.READY_FOR_HUMAN_REVIEW;
}

function resolveDecision(status) {
  if (status === NBA_REASON_WHY_STATUSES.BLOCKED) return NBA_REASON_WHY_DECISIONS.BLOCKED_FOR_FORBIDDEN_USE;
  if (status === NBA_REASON_WHY_STATUSES.NOT_MODELED) return NBA_REASON_WHY_DECISIONS.NOT_MODELED;
  if (status === NBA_REASON_WHY_STATUSES.READY_FOR_HUMAN_REVIEW) return NBA_REASON_WHY_DECISIONS.PREPARE_FOR_HUMAN_REVIEW;
  return NBA_REASON_WHY_DECISIONS.NEEDS_MORE_CONTEXT;
}

function buildNbaReasonWhyBoundary(input = {}) {
  const safeInput = clone(input || {});
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
    sourceEvidence = {},
    requestedUse = null
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

  const { allowedUses, blockedUses, unknownUses } = resolveUse(requestedUse);
  const evidenceRefs = collectEvidenceRefs(contextValues, sourceEvidence);
  const sourceEvidenceIds = collectSourceEvidenceIds(contextValues, sourceEvidence);
  const sourceOwners = collectSourceOwners(contextValues, sourceEvidence);
  const freshnessContext = resolveFreshness(contextValues, sourceEvidence);

  const targetPerson = firstPresent(
    collectField(contextValues, ["targetPerson", "personContext", "prospectContext", "candidateContext", "advisorContext", "clientContext"]),
    personId ? { personId, personType } : null
  );
  const recommendedAction = firstPresent(
    collectField(contextValues, ["recommendedAction", "candidateAction", "nextBestAction", "suggestedAction"])
  );
  const whyNow = firstPresent(collectField(contextValues, ["whyNow", "timingReason", "urgencyContext"]), null);
  const whyThisPerson = firstPresent(collectField(contextValues, ["whyThisPerson", "personReason", "relationshipReason"]), null);
  const whyThisAction = firstPresent(collectField(contextValues, ["whyThisAction", "actionReason", "behaviorReason"]), null);
  const whyThisMessage = firstPresent(collectField(contextValues, ["whyThisMessage", "messageReason", "conversationReason"]), null);
  const reasonWhy = firstPresent(
    collectField(contextValues, ["reasonWhy", "reason", "explanation"]),
    [whyNow, whyThisPerson, whyThisAction, whyThisMessage].filter(present).join(" ")
  );
  const conversationAngle = firstPresent(collectField([nashConversationContext, nashCombatContext], ["conversationAngle", "messageAngle", "style", "toneGuidance"]), null);
  const objectionSupport = firstPresent(collectField([nashCombatContext, nashConversationContext], ["objectionSupport", "objectionContext", "combatSupport"]), null);
  const suggestedMessageInstruction = firstPresent(
    collectField([nashConversationContext, nashCombatContext], ["suggestedMessageInstruction", "messageInstruction", "promptInstruction"]),
    conversationAngle ? `Prepare a human-reviewed message instruction using ${conversationAngle}` : null
  );

  const missingSignals = unique([
    ...collectSignals(contextValues, ["missingSignals", "missingContext", "missing"]),
    ...(contextValues.every((value) => !present(value)) ? ["protected_context_missing"] : []),
    ...(evidenceRefs.length === 0 && sourceEvidenceIds.length === 0 ? ["evidence_missing"] : []),
    ...(sourceOwners.length === 0 ? ["source_owner_missing"] : []),
    ...(!freshnessContext.available ? ["freshness_missing"] : []),
    ...(!present(targetPerson) ? ["target_person_missing"] : []),
    ...(!present(recommendedAction) ? ["recommended_action_missing"] : []),
    ...(!present(reasonWhy) ? ["reason_why_missing"] : [])
  ]);
  const unknownSignals = unique([
    ...unknownUses.map((use) => `requested_use_not_modeled_${use}`),
    ...collectSignals(contextValues, ["unknownSignals", "unknownContext", "unknown"]),
    ...detectExplicitZero(contextValues)
  ]);
  const staleSignals = unique([
    ...collectSignals(contextValues, ["staleSignals", "staleContext"]),
    ...(freshnessContext.stale ? ["freshness_stale"] : [])
  ]);
  const warnings = unique([
    "nba_is_next_best_action_plus_reason_why",
    "recommendation_is_not_execution",
    "reason_why_is_not_coercion",
    "human_approval_required_before_action",
    "suggested_message_instruction_is_not_draft",
    "compensation_candidate_context_is_not_payout_truth",
    "forecast_context_is_not_payout_truth",
    ...unknownSignals,
    ...staleSignals
  ]);
  const confidenceLimitations = unique([
    "human_review_required",
    ...(evidenceRefs.length === 0 && sourceEvidenceIds.length === 0 ? ["missing_evidence_requires_review"] : []),
    ...(sourceOwners.length === 0 ? ["missing_source_owner_requires_review"] : []),
    ...(!freshnessContext.available ? ["missing_freshness_requires_review"] : []),
    ...(freshnessContext.stale ? ["stale_freshness_requires_review"] : []),
    ...unknownSignals
  ]);
  const confidence =
    confidenceLimitations.length > 1 || missingSignals.length > 0
      ? "LIMITED_REVIEW_REQUIRED"
      : "CONTEXT_READY_FOR_HUMAN_REVIEW";

  const contractStatus = resolveStatus({
    blockedUses,
    unknownUses,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshnessContext,
    staleSignals,
    recommendedAction,
    targetPerson,
    reasonWhy,
    contextValues,
    unknownSignals
  });

  return {
    contractStatus,
    decision: resolveDecision(contractStatus),
    advisorId,
    managerId,
    personId,
    personType,
    period,
    recommendedAction,
    targetPerson: clone(targetPerson),
    reasonWhy: present(reasonWhy) ? reasonWhy : null,
    whyNow: present(whyNow) ? whyNow : null,
    whyThisPerson: present(whyThisPerson) ? whyThisPerson : null,
    whyThisAction: present(whyThisAction) ? whyThisAction : null,
    whyThisMessage: present(whyThisMessage) ? whyThisMessage : null,
    conversationAngle,
    objectionSupport,
    suggestedMessageInstruction,
    confidence,
    confidenceLimitations,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness: freshnessContext.value,
    missingSignals,
    unknownSignals,
    staleSignals,
    warnings,
    allowedUses,
    blockedUses,
    ...falseFlags()
  };
}

module.exports = {
  buildNbaReasonWhyBoundary,
  NBA_REASON_WHY_STATUSES,
  NBA_REASON_WHY_DECISIONS,
  NBA_REASON_WHY_ALLOWED_USES,
  NBA_REASON_WHY_FORBIDDEN_USES
};
