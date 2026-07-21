"use strict";

const NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION = "NFAST-04.1";

const NASH_CONVERSATION_BRIEF_STATUSES = Object.freeze({
  SUCCESS: "SUCCESS",
  NO_BRIEF: "NO_BRIEF",
  BLOCKED_CONTEXT: "BLOCKED_CONTEXT",
  INVALID_INPUT: "INVALID_INPUT"
});

const NASH_CONVERSATION_BRIEF_STRATEGY_CATEGORIES = Object.freeze([
  "INTRODUCTION",
  "FOLLOW_UP",
  "REACTIVATION",
  "APPOINTMENT_CONFIRMATION",
  "APPOINTMENT_RESCHEDULE",
  "INFORMATION_RESPONSE",
  "OBJECTION_ACKNOWLEDGEMENT",
  "OFFICIAL_NBA_EXPLANATION",
  "RELATIONSHIP_CHECK_IN",
  "QUOTE_FOLLOW_UP_REFERENCE_ONLY"
]);

const ALLOWED_ROOT_KEYS = Object.freeze([
  "projection",
  "conversationContext",
  "prospectContextIntake",
  "intake",
  "officialNbaReference",
  "objectionContext",
  "candidateInterpretations",
  "conversationRequest",
  "requestMetadata",
  "builderMetadata",
  "allowedSourceOwners"
]);

const PROHIBITED_ROOT_KEYS = Object.freeze([
  "pipeline",
  "pipelineObject",
  "rawPipeline",
  "fullUniversalContext",
  "universalContext",
  "rawUniversalContext",
  "rawNotes",
  "notes",
  "freeText",
  "messages",
  "transcript",
  "productivePipeline"
]);

const PROHIBITED_REQUESTED_USES = Object.freeze([
  "PROVIDER_INVOCATION",
  "GEMINI_INVOCATION",
  "DRAFT_GENERATION",
  "MESSAGE_DRAFT",
  "FINAL_MESSAGE",
  "MESSAGE_SEND",
  "WHATSAPP_OPEN",
  "WHATSAPP_SEND",
  "TASK_CREATE",
  "TIMELINE_CREATE",
  "DATABASE_WRITE",
  "FILESYSTEM_WRITE",
  "QUOTE_CALCULATION",
  "PRODUCT_RECOMMENDATION",
  "PRESENTATION_BUILD"
]);

const PROMPT_INJECTION_PATTERNS = Object.freeze([
  /ignore (all )?(previous|prior) instructions/i,
  /system prompt/i,
  /developer message/i,
  /hidden instruction/i,
  /tool[_ -]?use/i,
  /call (the )?(provider|gemini|api|tool)/i,
  /execute (this|command|action)/i,
  /send (this|message|whatsapp)/i,
  /persist (this|data|record)/i
]);

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const key of Object.keys(value)) deepFreeze(value[key]);
  return value;
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.filter((item) => item !== undefined && item !== null && item !== "");
  return [value].filter((item) => item !== "");
}

function unique(values) {
  return [...new Set(asArray(values).flatMap((value) => asArray(value)))];
}

function stableSortById(items, idKey) {
  return asArray(items)
    .map((item) => clone(item))
    .sort((a, b) => String(a[idKey] || "").localeCompare(String(b[idKey] || "")));
}

function hasPromptInjection(value, path = "input", findings = []) {
  if (value === undefined || value === null) return findings;
  if (typeof value === "string") {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(value)) findings.push({ path, indicator: pattern.source });
    }
    return findings;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => hasPromptInjection(item, `${path}[${index}]`, findings));
    return findings;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => hasPromptInjection(item, `${path}.${key}`, findings));
  }
  return findings;
}

function falseSafetyFlags() {
  return {
    humanApprovalRequired: true,
    contextOnly: true,
    draftGenerated: false,
    providerInvoked: false,
    actionExecuted: false,
    writesToDatabase: false,
    writesToFilesystem: false,
    persistsData: false,
    createsTimelineEvents: false,
    opensWhatsapp: false,
    sendsMessages: false,
    calculatesQuotes: false,
    recommendsProducts: false,
    buildsPresentations: false
  };
}

function noBriefEnvelope(status, reasonCodes, details = {}) {
  return deepFreeze({
    engine: "NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER",
    version: NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION,
    status,
    decision: "NO_PROVIDER_BRIEF",
    providerAllowed: false,
    humanApprovalRequired: true,
    contextOnly: true,
    draftGenerated: false,
    providerInvoked: false,
    actionExecuted: false,
    reasonCodes: unique(reasonCodes),
    missingRequirements: unique(details.missingRequirements),
    blockedFields: unique(details.blockedFields),
    staleEvidence: unique(details.staleEvidence),
    invalidAuthorities: unique(details.invalidAuthorities),
    promptInjectionIndicators: clone(details.promptInjectionIndicators || []),
    unsupportedFields: unique(details.unsupportedFields),
    remediationHints: unique(details.remediationHints),
    lineage: {
      deterministicBuilderVersion: NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION,
      sourceEvidenceIds: unique(details.sourceEvidenceIds),
      sourceOwners: unique(details.sourceOwners),
      sourceContextVersion: details.sourceContextVersion || null,
      projectionType: details.projectionType || null,
      intakeStatus: details.intakeStatus || null
    },
    safety: falseSafetyFlags()
  });
}

function extractProjection(input) {
  return input.projection || input.conversationContext || {};
}

function extractIntake(input) {
  return input.prospectContextIntake || input.intake || {};
}

function normalizeFact(fact) {
  return {
    factId: fact.factId || fact.id || fact.reference || null,
    claim: fact.claim || fact.statement || null,
    sourceOwner: fact.sourceOwner || null,
    evidenceIds: unique([fact.evidenceIds, fact.evidenceId]),
    freshness: fact.freshness || fact.freshnessStatus || "UNKNOWN",
    requiredForObjective: fact.requiredForObjective === true,
    cautiousLanguageRequired: fact.cautiousLanguageRequired === true || fact.freshness === "LIMITED",
    allowedClaim: fact.allowedClaim || fact.claim || fact.statement || null
  };
}

function buildDeterministicBrief(input = {}) {
  const source = input && typeof input === "object" ? clone(input) : {};
  const projection = extractProjection(source);
  const intake = extractIntake(source);
  const conversationRequest = source.conversationRequest || {};
  const requestMetadata = source.requestMetadata || {};
  const allowedSourceOwners = unique([source.allowedSourceOwners, projection.sourceOwners, intake.sourceOwners]);
  const missingRequirements = [];
  const blockedFields = [];
  const invalidAuthorities = [];
  const staleEvidence = [];
  const unsupportedFields = Object.keys(source).filter((key) => !ALLOWED_ROOT_KEYS.includes(key));
  const prohibitedFields = Object.keys(source).filter((key) => PROHIBITED_ROOT_KEYS.includes(key));
  const promptInjectionIndicators = hasPromptInjection({
    conversationRequest,
    requestMetadata,
    officialNbaReference: source.officialNbaReference,
    objectionContext: source.objectionContext,
    candidateInterpretations: source.candidateInterpretations
  });

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.INVALID_INPUT, ["INPUT_NOT_OBJECT"], {
      remediationHints: ["Provide a governed NFAST-04 conversation input object."]
    });
  }

  if (unsupportedFields.length > 0 || prohibitedFields.length > 0) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.INVALID_INPUT, ["UNSUPPORTED_FIELD", "PROHIBITED_RAW_CONTEXT"], {
      unsupportedFields,
      blockedFields: prohibitedFields,
      remediationHints: ["Use only CONVERSATION_CONTEXT projection, governed intake, optional official NBA and governed context fields."]
    });
  }

  if (promptInjectionIndicators.length > 0) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.BLOCKED_CONTEXT, ["PROMPT_INJECTION_INDICATOR"], {
      promptInjectionIndicators,
      remediationHints: ["Remove execution, tool-use or instruction override text before building a brief."]
    });
  }

  const requestedUses = unique([requestMetadata.requestedUse, conversationRequest.requestedUse, "DETERMINISTIC_CONVERSATION_BRIEF"]);
  const prohibitedRequestedUse = requestedUses.find((use) => PROHIBITED_REQUESTED_USES.includes(use));
  if (prohibitedRequestedUse) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.BLOCKED_CONTEXT, ["PROHIBITED_REQUESTED_USE"], {
      blockedFields: ["requestMetadata.requestedUse"],
      remediationHints: ["Request deterministic brief context only; execution and draft generation belong to later stages."]
    });
  }

  if (projection.projectionType !== "CONVERSATION_CONTEXT" && projection.type !== "CONVERSATION_CONTEXT") {
    missingRequirements.push("CONVERSATION_CONTEXT projection");
  }
  if (!projection.prospectReference && !conversationRequest.prospectReference) missingRequirements.push("prospectReference");
  if (!conversationRequest.objective || !conversationRequest.objective.type || !conversationRequest.objective.statement) {
    missingRequirements.push("conversationObjective");
  }
  if (!conversationRequest.successCondition) missingRequirements.push("successCondition");
  if (!conversationRequest.requestedChannel) missingRequirements.push("requestedChannel");
  if (!projection.contextVersion) missingRequirements.push("contextVersion");
  if (!intake.status) missingRequirements.push("NFAST-02 intake status");

  if (intake.status === "INVALID_CONTEXT") {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.INVALID_INPUT, ["NFAST_02_INVALID_CONTEXT"], {
      missingRequirements,
      sourceContextVersion: projection.contextVersion,
      projectionType: projection.projectionType || projection.type,
      intakeStatus: intake.status,
      remediationHints: ["Repair governed Prospect Context Intake before building a conversation brief."]
    });
  }

  if (intake.status === "BLOCKED_CONTEXT" || projection.status === "BLOCKED_CONTEXT" || projection.blocked === true) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.BLOCKED_CONTEXT, ["BLOCKED_CONTEXT"], {
      blockedFields: unique([projection.blockedContext, intake.blockedContext]),
      sourceContextVersion: projection.contextVersion,
      projectionType: projection.projectionType || projection.type,
      intakeStatus: intake.status,
      remediationHints: ["Resolve blocked governed context in its owning authority."]
    });
  }

  const objectiveType = conversationRequest.objective && conversationRequest.objective.type;
  if (objectiveType && !NASH_CONVERSATION_BRIEF_STRATEGY_CATEGORIES.includes(objectiveType)) {
    missingRequirements.push("supportedStrategyCategory");
  }

  const verifiedFacts = stableSortById(projection.verifiedFacts || projection.facts, "factId").map(normalizeFact);
  const sourceEvidenceIds = unique([projection.sourceEvidenceIds, intake.sourceEvidenceIds, verifiedFacts.map((fact) => fact.evidenceIds)]);
  if (verifiedFacts.some((fact) => !fact.factId || !fact.claim || fact.evidenceIds.length === 0 || !fact.sourceOwner)) {
    missingRequirements.push("evidenceLineage");
  }

  for (const fact of verifiedFacts) {
    if (allowedSourceOwners.length > 0 && fact.sourceOwner && !allowedSourceOwners.includes(fact.sourceOwner)) {
      invalidAuthorities.push(fact.sourceOwner);
    }
    if (fact.requiredForObjective && fact.freshness === "STALE") staleEvidence.push(fact.factId);
  }

  if (sourceEvidenceIds.length === 0) missingRequirements.push("sourceEvidenceIds");

  if (missingRequirements.length > 0 || invalidAuthorities.length > 0 || staleEvidence.length > 0) {
    return noBriefEnvelope(NASH_CONVERSATION_BRIEF_STATUSES.NO_BRIEF, [
      missingRequirements.length > 0 ? "MISSING_REQUIREMENT" : [],
      invalidAuthorities.length > 0 ? "INVALID_SOURCE_OWNER" : [],
      staleEvidence.length > 0 ? "STALE_REQUIRED_EVIDENCE" : []
    ], {
      missingRequirements,
      invalidAuthorities,
      staleEvidence,
      sourceEvidenceIds,
      sourceOwners: allowedSourceOwners,
      sourceContextVersion: projection.contextVersion,
      projectionType: projection.projectionType || projection.type,
      intakeStatus: intake.status,
      remediationHints: ["Supply governed evidence lineage and current facts from the owning source before provider use."]
    });
  }

  const optionalStaleFacts = verifiedFacts.filter((fact) => !fact.requiredForObjective && fact.freshness === "STALE");
  const currentFacts = verifiedFacts.filter((fact) => fact.freshness !== "STALE");
  const candidateInterpretations = asArray(source.candidateInterpretations).map((item, index) => ({
    interpretationId: item.interpretationId || item.id || `candidate-interpretation-${index + 1}`,
    interpretation: item.interpretation || item.statement || String(item),
    factualStatus: "NON_FACTUAL_CANDIDATE_INTERPRETATION",
    mayBeUsedAsFact: false
  }));

  const brief = {
    engine: "NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER",
    version: NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION,
    status: NASH_CONVERSATION_BRIEF_STATUSES.SUCCESS,
    identity: {
      briefId: requestMetadata.briefId || `NFAST-04:${projection.contextVersion}:${projection.prospectReference || conversationRequest.prospectReference}:${objectiveType}`,
      prospectReference: projection.prospectReference || conversationRequest.prospectReference,
      approvedDisplayNameReference: projection.approvedDisplayNameReference || null,
      contextVersion: projection.contextVersion,
      generatedAt: requestMetadata.generatedAt || requestMetadata.deterministicTimestamp || null,
      briefStatus: "IMMUTABLE_PROVIDER_SAFE_CONTEXT"
    },
    conversationObjective: {
      objectiveType,
      objectiveStatement: conversationRequest.objective.statement,
      successCondition: conversationRequest.successCondition,
      requestedChannel: conversationRequest.requestedChannel,
      requestedToneStyle: conversationRequest.allowedToneStyle || null,
      relationshipAwareFraming: projection.relationshipFraming || "Use only verified relationship context; do not invent intimacy."
    },
    sourceContext: {
      verifiedFacts: currentFacts,
      evidenceReferences: unique([projection.evidenceReferences, sourceEvidenceIds]),
      sourceOwners: allowedSourceOwners,
      freshness: unique([currentFacts.map((fact) => fact.freshness), projection.freshness, intake.freshness]),
      unknowns: unique([projection.unknowns, intake.unknowns]),
      missingContext: unique([projection.missingContext, intake.missingContext]),
      staleContext: optionalStaleFacts.map((fact) => fact.factId),
      excludedContext: optionalStaleFacts.map((fact) => ({ factId: fact.factId, reason: "OPTIONAL_STALE_EVIDENCE_EXCLUDED" })),
      blockedContext: unique([projection.blockedContext, intake.blockedContext])
    },
    strategy: {
      strategyCategory: objectiveType,
      strategyVersion: "NFAST-04-STRATEGY-CATEGORIES-v1",
      strategyExplanation: `Selected from explicit objective type ${objectiveType}.`,
      priorityTalkingPoints: currentFacts.map((fact) => ({ factId: fact.factId, talkingPoint: fact.allowedClaim })),
      evidenceBoundPersonalizationPoints: asArray(projection.personalizationPoints),
      questionsToAsk: unique([projection.questionsToAsk, source.objectionContext && source.objectionContext.questionsToAsk]),
      objectionsToAcknowledge: unique([source.objectionContext && source.objectionContext.objectionsToAcknowledge]),
      conversationConstraints: unique([projection.conversationConstraints, "Do not generate final copy.", "Do not invent intent, motivation or product affinity."]),
      sequencingGuidance: unique([conversationRequest.sequencingGuidance, "Start from verified objective, then ask evidence-bound questions, then offer allowed CTA."])
    },
    officialNba: {
      officialNbaReference: source.officialNbaReference ? source.officialNbaReference.referenceId || source.officialNbaReference.id || null : null,
      nbaSummary: source.officialNbaReference ? source.officialNbaReference.summary || null : null,
      explanationGuidance: source.officialNbaReference ? source.officialNbaReference.explanationGuidance || null : null,
      createsNba: false,
      replacesNba: false,
      executesNba: false
    },
    claims: {
      allowedClaims: currentFacts.map((fact) => ({ factId: fact.factId, claim: fact.allowedClaim, evidenceIds: fact.evidenceIds, sourceOwner: fact.sourceOwner })),
      forbiddenClaims: unique([projection.forbiddenClaims, "Unsupported premiums, coverage, product benefits, intent, consent, pressure, fear, guilt or false urgency."]),
      unsupportedClaimCategories: unique([projection.unsupportedClaimCategories, "PRODUCT_RECOMMENDATION", "QUOTE_CALCULATION", "FINANCIAL_CAPACITY", "HEALTH_CONDITION", "FAMILY_FEAR"]),
      factsRequiringCautiousLanguage: currentFacts.filter((fact) => fact.cautiousLanguageRequired).map((fact) => fact.factId),
      candidateInterpretations
    },
    cta: {
      allowedCtaType: conversationRequest.allowedCtaType || "HUMAN_REVIEWED_NEXT_STEP",
      ctaWordingConstraints: unique([conversationRequest.ctaWordingConstraints, "Must be optional, reviewable and non-pressuring."]),
      urgencyClassification: conversationRequest.urgencyClassification || "NORMAL",
      pressureGuiltFearFalseUrgencyProhibited: true,
      humanReviewRequired: true
    },
    providerSafeInstructions: {
      languageRenderingTaskOnly: true,
      noStrategyCreation: true,
      noNewFacts: true,
      noRecalculation: true,
      noProductRecommendation: true,
      noQuoteModification: true,
      noActionExecution: true,
      noApprovalAssumption: true,
      noSending: true,
      noHiddenToolUse: true
    },
    safety: {
      ...falseSafetyFlags(),
      safeLanguageGuardrails: unique(["No pressure.", "No guilt.", "No fear.", "No false urgency.", "No invented intimacy."]),
      privacyRestrictions: unique([projection.privacyRestrictions, "Exclude raw notes and unrestricted free text."]),
      sensitiveDataExclusions: unique([projection.sensitiveDataExclusions, "Health condition, financial capacity and family fear unless explicitly verified by owning authority."]),
      promptInjectionIndicators: [],
      prohibitedUseFlags: []
    },
    quoteProductPresenterBoundary: {
      quoteReference: projection.quoteReference || null,
      quoteStatusReference: projection.quoteStatusReference || null,
      productReference: projection.productReference || null,
      productInterestReference: projection.productInterestReference || null,
      recalculatesQuote: false,
      recommendsProduct: false,
      buildsPresenterNarrative: false,
      presenterInstructionsIncluded: false
    },
    lineage: {
      sourceEvidenceIds,
      sourceOwners: allowedSourceOwners,
      sourceContextVersion: projection.contextVersion,
      projectionType: projection.projectionType || projection.type,
      intakeStatus: intake.status,
      deterministicBuilderVersion: NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION
    }
  };

  return deepFreeze(brief);
}

module.exports = {
  NASH_DETERMINISTIC_CONVERSATION_BRIEF_BUILDER_VERSION,
  NASH_CONVERSATION_BRIEF_STATUSES,
  NASH_CONVERSATION_BRIEF_STRATEGY_CATEGORIES,
  buildDeterministicBrief,
  _private: {
    clone,
    deepFreeze,
    unique,
    hasPromptInjection,
    falseSafetyFlags,
    noBriefEnvelope
  }
};
