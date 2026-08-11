"use strict";

const pipelineAdapter = typeof module !== "undefined" && module.exports
  ? require("../advisor-os/sales-pipeline/prospect-context/pipeline-universal-prospect-context-adapter")
  : globalThis.ForgePipelineUniversalProspectContextAdapter;
const nashConsumer = typeof module !== "undefined" && module.exports
  ? require("./context-intake/nash-universal-prospect-context-consumer")
  : globalThis.ForgeNashUniversalProspectContextConsumer;
const briefContract = typeof module !== "undefined" && module.exports
  ? require("./conversation-brief/nash-deterministic-conversation-brief-boundary-contract")
  : globalThis.ForgeNashDeterministicConversationBriefContract;
const providerContract = typeof module !== "undefined" && module.exports
  ? require("./conversation-brief/nash-provider-request-contract")
  : globalThis.ForgeNashProviderRequestContract;
const remoteProviderBoundary = typeof module !== "undefined" && module.exports
  ? require("./remote-draft-provider-client-boundary")
  : globalThis.ForgeNashRemoteDraftProviderClientBoundary;

if (
  !pipelineAdapter ||
  !nashConsumer ||
  !briefContract ||
  !providerContract ||
  !remoteProviderBoundary
) {
  throw new Error("PIPELINE_NASH_DRAFT_ORCHESTRATOR_DEPENDENCY_MISSING");
}

const ORCHESTRATOR_VERSION = "NFAST-07.1";
const DEFAULT_PROVIDER = "gemini";
const DEFAULT_LOCALE = "es-MX";

const GOAL_CONFIG = Object.freeze({
  first_contact: Object.freeze({
    strategyCategory: "INTRODUCTION",
    statement: "Introduce the advisor and invite the prospect to continue the conversation.",
    successCondition: "The prospect can freely choose whether to reply.",
    allowedCtaType: "OPTIONAL_REPLY",
  }),
  follow_up: Object.freeze({
    strategyCategory: "FOLLOW_UP",
    statement: "Continue a prior conversation with a respectful follow-up.",
    successCondition: "The prospect can freely choose the next step.",
    allowedCtaType: "OPTIONAL_NEXT_STEP",
  }),
  reactivation: Object.freeze({
    strategyCategory: "REACTIVATION",
    statement: "Reopen the conversation without pressure or assumed interest.",
    successCondition: "The prospect can freely choose whether to reconnect.",
    allowedCtaType: "OPTIONAL_RECONNECT",
  }),
  collection: Object.freeze({
    strategyCategory: "FOLLOW_UP",
    statement: "Prepare a respectful collection follow-up using only governed payment facts; do not assert nonpayment, debt, lapse or cancellation without governed evidence.",
    successCondition: "The prospect can review the information or provide evidence without pressure.",
    allowedCtaType: "OPTIONAL_NEXT_STEP",
  }),
  application_signature: Object.freeze({
    strategyCategory: "FOLLOW_UP",
    statement: "Follow up on an advisor-declared application-signature step without claiming that a signature is pending unless governed context supports it.",
    successCondition: "The prospect can review the next step and freely choose how to continue.",
    allowedCtaType: "OPTIONAL_NEXT_STEP",
  }),
  custom: Object.freeze({
    strategyCategory: "INFORMATION_RESPONSE",
    statement: "Prepare a message around the advisor-declared objective while treating that objective as an instruction, not as verified prospect, product, payment or policy truth.",
    successCondition: "The prospect receives a clear, non-pressuring message grounded only in allowed claims.",
    allowedCtaType: "OPTIONAL_REPLY",
  }),
  appointment_confirmation: Object.freeze({
    strategyCategory: "APPOINTMENT_CONFIRMATION",
    statement: "Confirm a governed appointment reference without inventing details.",
    successCondition: "The prospect can confirm or request a change.",
    allowedCtaType: "OPTIONAL_CONFIRMATION",
    requiredGovernedField: "appointment.verified_reference",
  }),
  reschedule: Object.freeze({
    strategyCategory: "APPOINTMENT_RESCHEDULE",
    statement: "Offer a respectful appointment reschedule using governed appointment context.",
    successCondition: "The prospect can choose whether to coordinate another time.",
    allowedCtaType: "OPTIONAL_RESCHEDULE",
    requiredGovernedField: "appointment.verified_reference",
  }),
  after_call: Object.freeze({
    strategyCategory: "FOLLOW_UP",
    statement: "Continue after a verified interaction without inventing commitments.",
    successCondition: "The prospect can freely choose how to continue.",
    allowedCtaType: "OPTIONAL_NEXT_STEP",
    requiredGovernedField: "interaction.verified_reference",
  }),
});

const STYLE_CONFIG = Object.freeze({
  friendly: "warm, respectful and concise",
  professional: "professional, clear and respectful",
  executive: "direct, professional and concise",
  brief: "brief, clear and respectful",
  social: "natural, respectful and conversational",
});

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(
    asArray(values)
      .flatMap(item => asArray(item))
      .filter(item => item !== undefined && item !== null && item !== ""),
  )];
}

function normalizeAdvisorComponents(values) {
  return unique(asArray(values).map(value => String(value ?? "").trim()))
    .filter(Boolean)
    .map(value => value.slice(0, 240))
    .slice(0, 6);
}

function nowIso(now) {
  const value = typeof now === "function" ? now() : new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("NFAST_07_CLOCK_INVALID");
  return date.toISOString();
}

function safeOpaque(value, fallback) {
  const normalized = String(value || fallback || "")
    .trim()
    .replace(/[^A-Za-z0-9._:-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || String(fallback || "NFAST-07");
}

function providerMetadata(providerId, generationMode, generatedAt) {
  return {
    providerId,
    modelId: "pipeline-nash-draft-orchestrator",
    generationMode,
    generatedAt,
    durationMs: 0,
    deterministicFallbackRequired: true,
    externalProviderEnabled: false,
  };
}

function errorEnvelope(providerId, code, message, generatedAt, retryable = false) {
  return deepFreeze({
    resultState: "ERROR",
    draftCandidate: null,
    metadata: providerMetadata(providerId, "nfast_07_orchestration_block", generatedAt),
    error: { code, message, retryable },
    deterministicFallbackRequired: true,
    deterministicFallbackSelected: true,
    persistencePerformed: false,
    pipelineMutationPerformed: false,
    timelineEventCreated: false,
    nbaExecuted: false,
    taskCreated: false,
    calendarEventCreated: false,
    whatsappOpened: false,
    messageSent: false,
    externalActionPerformed: false,
    humanApprovalRequired: true,
    approved: false,
    sent: false,
  });
}

function findProjectedField(projection, fieldId) {
  return asArray(projection?.projectedFields).find(field => field?.fieldId === fieldId) || null;
}

function hasGovernedField(references, fieldId) {
  return asArray(references).some(reference => reference?.fieldId === fieldId);
}

function buildObjectiveReference({
  pipelineRecord,
  goal,
  strategyCategory,
  observedAt,
}) {
  const prospectReference = safeOpaque(pipelineRecord?.id, "unknown-prospect");
  const sourceRecordReference = safeOpaque(
    `ADVISOR_UI:${prospectReference}:${goal}`,
    `ADVISOR_UI:${prospectReference}`,
  );
  const evidenceId = safeOpaque(
    `NFAST-07:${prospectReference}:${goal}:${observedAt}`,
    `NFAST-07:${prospectReference}:${goal}`,
  );

  return {
    fieldId: "needs.conversation_objective",
    value: strategyCategory,
    sourceOwner: "ADVISOR_DECLARATION",
    sourceRecordReference,
    evidence: {
      evidenceId,
      sourceOwner: "ADVISOR_DECLARATION",
      sourceRecordReference,
      observedAt,
    },
    verificationStatus: "VERIFIED",
    freshness: {
      status: "CURRENT",
      observedAt,
    },
    sensitivityClassification: "DECLARED_BUSINESS_CONTEXT",
  };
}

function buildBriefProjection({
  consumerProjection,
  intake,
  pipelineRecord,
  observedAt,
}) {
  const prospectField = findProjectedField(
    consumerProjection,
    "identity.prospect_reference",
  );
  const displayNameField = findProjectedField(
    consumerProjection,
    "identity.display_name_reference",
  );
  const prospectReference = String(
    prospectField?.value || pipelineRecord?.id || "",
  ).trim();

  const sourceEvidenceIds = unique(
    asArray(consumerProjection?.evidenceReferences).map(
      reference => reference?.evidenceId,
    ),
  );
  const sourceOwners = unique([
    consumerProjection?.sourceOwners,
    intake?.sourceOwners,
  ]);

  const verifiedFacts = [];
  if (displayNameField) {
    const approvedDisplayName = String(displayNameField.value || "").trim();
    if (approvedDisplayName) {
      verifiedFacts.push({
        factId: safeOpaque(
          `DISPLAY_NAME:${displayNameField.evidenceReference}`,
          "DISPLAY_NAME",
        ),
        claim: `The prospect's approved display name is ${approvedDisplayName}.`,
        allowedClaim: `The prospect's approved display name is ${approvedDisplayName}.`,
        sourceOwner: displayNameField.sourceOwner,
        evidenceIds: [displayNameField.evidenceReference],
        freshness: displayNameField.freshness?.status || "UNKNOWN",
        requiredForObjective: false,
        cautiousLanguageRequired: false,
      });
    }
  }

  return deepFreeze({
    projectionType: "CONVERSATION_CONTEXT",
    type: "CONVERSATION_CONTEXT",
    status: consumerProjection?.status || "INVALID_CONTEXT",
    contextVersion: safeOpaque(
      `NFAST-07.1:${prospectReference}:${observedAt}`,
      `NFAST-07.1:${prospectReference}`,
    ),
    prospectReference,
    approvedDisplayNameReference: displayNameField
      ? String(displayNameField.value)
      : null,
    sourceOwners,
    sourceEvidenceIds,
    verifiedFacts,
    unknowns: unique(consumerProjection?.unknownFields),
    missingContext: unique(consumerProjection?.missingFields),
    blockedContext: unique([
      consumerProjection?.blockedFields,
      intake?.blockedContext,
    ]),
    forbiddenClaims: unique([
      intake?.forbiddenClaims,
      "Do not invent consent, commitments, urgency, product facts, quote facts or relationship claims.",
    ]),
    freshness: ["CURRENT"],
    relationshipFraming: "Use only verified relationship context; do not invent intimacy.",
    personalizationPoints: displayNameField
      ? [`Use only the approved display name ${String(displayNameField.value)}.`]
      : [],
    questionsToAsk: [],
    conversationConstraints: [
      "No automatic sending.",
      "No approval assumption.",
      "No pressure, guilt, fear or false urgency.",
    ],
    privacyRestrictions: [
      "Exclude raw Pipeline notes and unrestricted free text.",
      "Exclude routing and sensitive fields from provider input.",
    ],
    sensitiveDataExclusions: [
      "Phone, WhatsApp, email, date of birth, income, health and family context.",
    ],
  });
}

function normalizeBriefIntake(intake) {
  return deepFreeze({
    status: intake?.status || "INVALID_CONTEXT",
    sourceOwners: unique(intake?.sourceOwners),
    sourceEvidenceIds: unique(
      asArray(intake?.evidenceReferences).map(
        reference => reference?.evidenceId,
      ),
    ),
    freshness: intake?.freshness?.status || "UNKNOWN",
    unknowns: unique(intake?.unknownFacts),
    missingContext: unique(intake?.missingContext),
    blockedContext: unique(intake?.blockedContext),
  });
}

function createPipelineNashDraftOrchestrator({
  invokeFunction,
  timeoutMs = 5000,
  now = () => new Date(),
} = {}) {
  if (typeof invokeFunction !== "function") {
    throw new Error("NFAST_07_PROVIDER_INVOKE_REQUIRED");
  }

  const remoteClient = remoteProviderBoundary.createRemoteDraftProviderClient({
    invokeFunction,
    timeoutMs,
  });

  async function requestDraft({
    pipelineRecord,
    goal = "first_contact",
    style = "professional",
    variation = 0,
    providerId = DEFAULT_PROVIDER,
    locale = DEFAULT_LOCALE,
    approvedDisplayName = false,
    governedReferences = [],
    advisorComponents = [],
    requestId = null,
    correlationId = null,
  } = {}) {
    const generatedAt = nowIso(now);
    const selectedProvider = String(providerId || DEFAULT_PROVIDER)
      .trim()
      .toLowerCase();
    const goalConfig = GOAL_CONFIG[goal];
    const toneStyle = STYLE_CONFIG[style] || STYLE_CONFIG.professional;
    const declaredComponents = normalizeAdvisorComponents(advisorComponents);

    if (!pipelineRecord || typeof pipelineRecord !== "object" || Array.isArray(pipelineRecord)) {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        "PIPELINE_RECORD_REQUIRED",
        "A productive Pipeline record is required.",
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    if (!goalConfig) {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        "UNSUPPORTED_MESSAGE_GOAL",
        "The selected message goal is not governed by NFAST-07.",
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    if (
      goalConfig.requiredGovernedField &&
      !hasGovernedField(governedReferences, goalConfig.requiredGovernedField)
    ) {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        "GOVERNED_REFERENCE_REQUIRED",
        `The selected goal requires ${goalConfig.requiredGovernedField}.`,
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    const objectiveReference = buildObjectiveReference({
      pipelineRecord,
      goal,
      strategyCategory: goalConfig.strategyCategory,
      observedAt: generatedAt,
    });

    const adapterResult = pipelineAdapter.buildPipelineUniversalProspectContext({
      pipelineRecord: clone(pipelineRecord),
      approvedDisplayName: approvedDisplayName === true,
      governedReferences: [
        objectiveReference,
        ...clone(asArray(governedReferences)),
      ],
    });

    const consumed = nashConsumer.consumeUniversalProspectContextForNash(
      adapterResult.context,
    );

    if (
      adapterResult.context?.status !== "SUCCESS" ||
      consumed.intake?.status !== "SUCCESS"
    ) {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        "GOVERNED_CONTEXT_UNAVAILABLE",
        "Governed Pipeline context could not produce a valid NASH intake.",
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        contextStatus: adapterResult.context?.status || "INVALID_CONTEXT",
        intakeStatus: consumed.intake?.status || "INVALID_CONTEXT",
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    const projection = buildBriefProjection({
      consumerProjection: consumed.projection,
      intake: consumed.intake,
      pipelineRecord,
      observedAt: generatedAt,
    });
    const briefIntake = normalizeBriefIntake(consumed.intake);
    const prospectReference = projection.prospectReference;
    const stableRequestId = safeOpaque(
      requestId || `NFAST-07:${prospectReference}:${goal}:${variation}`,
      "NFAST-07-request",
    );
    const stableCorrelationId = safeOpaque(
      correlationId || `PIPELINE:${prospectReference}`,
      "PIPELINE",
    );

    const conversationBrief = briefContract.buildDeterministicBrief({
      projection,
      prospectContextIntake: briefIntake,
      conversationRequest: {
        prospectReference,
        objective: {
          type: goalConfig.strategyCategory,
          statement: goalConfig.statement,
        },
        successCondition: goalConfig.successCondition,
        requestedChannel: "WHATSAPP_REVIEW_ONLY",
        allowedToneStyle: toneStyle,
        allowedCtaType: goalConfig.allowedCtaType,
        ctaWordingConstraints: [
          "The CTA must remain optional.",
          "Do not imply consent, commitment or urgency.",
        ],
        urgencyClassification: "NORMAL",
        sequencingGuidance: [
          "Use the objective, then an optional non-pressuring next step.",
          ...declaredComponents.map(component =>
            `Advisor-declared message component (instruction only; not source truth): ${component}`
          ),
        ].join(" "),
      },
      requestMetadata: {
        briefId: safeOpaque(
          `NFAST-07-BRIEF:${prospectReference}:${goal}:${variation}`,
          "NFAST-07-BRIEF",
        ),
        generatedAt,
        requestedUse: "DETERMINISTIC_CONVERSATION_BRIEF",
      },
      allowedSourceOwners: unique([
        projection.sourceOwners,
        briefIntake.sourceOwners,
      ]),
    });

    if (conversationBrief.status !== "SUCCESS") {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        "DETERMINISTIC_CONVERSATION_BRIEF_UNAVAILABLE",
        "A provider-safe deterministic Conversation Brief could not be produced.",
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        conversationBrief,
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    const providerRequest = {
      requestVersion: providerContract.PROVIDER_REQUEST_VERSION,
      providerId: selectedProvider,
      conversationBrief,
      requestMetadata: {
        requestId: stableRequestId,
        correlationId: stableCorrelationId,
        locale,
        renderingVariation: `variation-${Number(variation) || 0}`,
        timeoutMs,
        clientVersion: ORCHESTRATOR_VERSION,
        requestVersion: providerContract.PROVIDER_REQUEST_VERSION,
      },
    };

    const providerValidation = providerContract.validateProviderDraftRequest(
      providerRequest,
    );

    if (!providerValidation.valid) {
      const providerEnvelope = errorEnvelope(
        selectedProvider,
        providerValidation.code,
        providerValidation.message,
        generatedAt,
      );
      return deepFreeze({
        status: "FALLBACK_REQUIRED",
        conversationBrief,
        providerValidation,
        providerEnvelope,
        providerInvoked: false,
        deterministicFallbackRequired: true,
        rawPipelineForwardedToProvider: false,
        persistencePerformed: false,
        pipelineMutationPerformed: false,
      });
    }

    const providerEnvelope = await remoteClient.requestDraft(providerRequest);

    return deepFreeze({
      status: providerEnvelope.resultState === "SUCCESS"
        ? "SUCCESS"
        : providerEnvelope.resultState === "NO_DRAFT"
          ? "NO_DRAFT"
          : "FALLBACK_REQUIRED",
      orchestratorVersion: ORCHESTRATOR_VERSION,
      contextStatus: adapterResult.context.status,
      intakeStatus: consumed.intake.status,
      conversationBrief,
      providerRequest,
      providerEnvelope,
      providerInvoked: selectedProvider !== "deterministic",
      deterministicFallbackRequired: providerEnvelope.resultState !== "SUCCESS",
      rawPipelineForwardedToProvider: false,
      rawUniversalContextForwardedToProvider: false,
      persistencePerformed: false,
      pipelineMutationPerformed: false,
      externalActionPerformed: false,
      humanApprovalRequired: true,
      approved: false,
      sent: false,
    });
  }

  return Object.freeze({
    orchestratorVersion: ORCHESTRATOR_VERSION,
    requestDraft,
    diagnostics: () => Object.freeze({
      orchestratorVersion: ORCHESTRATOR_VERSION,
      providerFunction: remoteClient.functionName,
      rawPipelineForwardedToProvider: false,
      persistencePerformed: false,
      pipelineMutationPerformed: false,
      humanApprovalRequired: true,
    }),
  });
}

const api = Object.freeze({
  ORCHESTRATOR_VERSION,
  GOAL_CONFIG,
  STYLE_CONFIG,
  createPipelineNashDraftOrchestrator,
  _private: {
    clone,
    deepFreeze,
    unique,
    safeOpaque,
    buildObjectiveReference,
    buildBriefProjection,
    normalizeBriefIntake,
    errorEnvelope,
  },
});

if (typeof globalThis !== "undefined") {
  globalThis.ForgePipelineNashDraftOrchestrator = api;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}
