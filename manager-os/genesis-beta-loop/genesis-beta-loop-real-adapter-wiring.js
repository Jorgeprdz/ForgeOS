"use strict";

/**
 * Genesis Beta Loop Real Adapter Wiring + Table Read Model.
 *
 * Uses real closed Forge modules as adapters for the Genesis Beta Loop
 * orchestrator. This file is read-model / wiring only.
 *
 * It does not send, execute provider runtime, execute LLM runtime, write CRM,
 * create tasks/calendar, or create downstream truth.
 */

const {
  buildGenesisBetaLoopOrchestrator,
} = require("./genesis-beta-loop-orchestrator-boundary-contract");

const MODULE_SPECS = Object.freeze({
  nashMickNba: {
    path: "../nba/nash-mick-nba-reconnection-engine",
    names: [
      "buildNashMickNbaReconnection",
      "buildNashMickNbaReconnectionEngine",
      "buildNashMickNbaReconnectionBoundary",
      "reconnectNashMickNba",
    ],
  },
  promptBuilder: {
    path: "../message-generation/manager-message-prompt-builder",
    names: [
      "buildManagerMessagePromptBuilder",
      "buildManagerMessagePrompt",
      "buildManagerMessagePromptInstructions",
    ],
  },
  draftIntake: {
    path: "../message-generation/llm-draft-intake-boundary-contract",
    names: [
      "intakeLlmDraftForSafetyReview",
      "buildLlmDraftIntakeBoundary",
      "buildLlmDraftIntake",
      "buildDraftIntakeBoundary",
    ],
  },
  safetyValidator: {
    path: "../message-generation/message-safety-validator",
    names: [
      "validateMessageDraftSafety",
      "validateMessageSafety",
      "buildMessageSafetyValidator",
      "buildMessageSafetyValidation",
    ],
  },
  humanApprovalGate: {
    path: "../human-approval/human-approval-gate-boundary-contract",
    names: [
      "buildHumanApprovalGateBoundary",
      "buildHumanApprovalGate",
      "reviewHumanApprovalGate",
    ],
  },
  deliveryAdapter: {
    path: "../delivery/delivery-adapter-boundary-contract",
    names: [
      "buildDeliveryAdapterBoundary",
      "buildDeliveryAdapter",
      "prepareDeliveryCandidate",
    ],
  },
});

const FALSE_FLAGS = Object.freeze({
  automaticExecutionAllowed: false,
  sendsMessage: false,
  executesSend: false,
  executesProviderRuntime: false,
  executesLlmRuntime: false,
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
  createsPersonalityTruth: false,
});

const REQUESTED_USES = Object.freeze({
  nashMickNba: "FOLLOWUP_REASON_WHY",
  promptBuilder: "FOLLOW_UP_PROMPT_PREP",
  draftIntake: "LLM_DRAFT_INTAKE",
  safetyValidator: "SAFETY_REVIEW_PREP",
  humanApprovalGate: "MESSAGE_DELIVERY_PREP_REVIEW",
  deliveryAdapter: "WHATSAPP_LINK_PREP",
});

function safeRequire(modulePath) {
  try {
    return { ok: true, exports: require(modulePath) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function pickFunction(moduleExports, names) {
  if (!moduleExports) return { fn: null, exportName: null };

  for (const name of names) {
    if (typeof moduleExports[name] === "function") return { fn: moduleExports[name], exportName: name };
  }

  const functionEntries = Object.entries(moduleExports).filter(([, value]) => typeof value === "function");
  if (functionEntries.length === 1) {
    return { fn: functionEntries[0][1], exportName: functionEntries[0][0] };
  }

  return { fn: null, exportName: null };
}

function inspectGenesisBetaLoopRealAdapters() {
  const diagnostics = {};

  for (const [stage, spec] of Object.entries(MODULE_SPECS)) {
    const loaded = safeRequire(spec.path);
    if (!loaded.ok) {
      diagnostics[stage] = {
        stage,
        modulePath: spec.path,
        moduleLoaded: false,
        functionFound: false,
        error: loaded.error,
      };
      continue;
    }

    const picked = pickFunction(loaded.exports, spec.names);
    diagnostics[stage] = {
      stage,
      modulePath: spec.path,
      requestedUse: REQUESTED_USES[stage],
      moduleLoaded: true,
      functionFound: typeof picked.fn === "function",
      exportName: picked.exportName,
      exportedKeys: Object.keys(loaded.exports || {}),
    };
  }

  return diagnostics;
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

function evidenceFields(input) {
  return {
    evidenceRefs: unique(input.evidenceRefs),
    sourceEvidenceIds: unique(input.sourceEvidenceIds),
    sourceOwners: unique(input.sourceOwners),
    freshness: input.freshness || "UNKNOWN",
    period: input.period || null,
  };
}

function sourceEvidence(input) {
  const evidence = evidenceFields(input);
  return {
    evidenceRefs: evidence.evidenceRefs,
    sourceEvidenceIds: evidence.sourceEvidenceIds,
    sourceOwners: evidence.sourceOwners,
    freshness: evidence.freshness,
  };
}

function requestedUseFor(input, stage) {
  return (input.requestedUses && input.requestedUses[stage]) || REQUESTED_USES[stage];
}

function normalizePersonType(value) {
  if (!value) return "prospect";
  return String(value).toLowerCase();
}

function targetPerson(input) {
  return input.targetPerson || (input.protectedContext && input.protectedContext.targetPerson) || {};
}

function actorIds(input) {
  const actor = input.actor || {};
  const person = targetPerson(input);
  return {
    advisorId: input.advisorId || actor.advisorId || null,
    managerId: input.managerId || actor.managerId || null,
    personId: input.personId || person.personId || person.id || null,
    personType: normalizePersonType(input.personType || person.personType || person.type),
  };
}

function channelCandidate(input) {
  const delivery = input.delivery || {};
  return delivery.channelCandidate || {
    channel: delivery.channel || input.channel || "whatsapp",
    recipientDestination: delivery.recipientDestination || null,
    deliveryCapability: "DELIVERY_PREPARATION_ONLY",
  };
}

function approvalInput(input) {
  const approval = input.humanApproval || {};
  return {
    approvalRequestId: approval.approvalRequestId || input.approvalRequestId || null,
    reviewerId: approval.reviewerId || approval.reviewer || null,
    reviewerRole: approval.reviewerRole || null,
    reviewerType: approval.reviewerType || null,
    approvalAction: approval.approvalAction || approval.action || "REQUEST_REVIEW",
    artifactHash: approval.artifactHash || null,
    currentArtifactHash: approval.currentArtifactHash || approval.artifactHash || null,
    approvedArtifactHash: approval.approvedArtifactHash || null,
    warningsVisible: approval.warningsVisible,
    warningsAcknowledged: approval.warningsAcknowledged,
    limitationsVisible: approval.limitationsVisible,
    limitationsAcknowledged: approval.limitationsAcknowledged,
    createdAt: approval.createdAt || input.createdAt || null,
    reviewedAt: approval.reviewedAt || null,
    expiresAt: approval.expiresAt || null,
    now: approval.now || input.now || null,
  };
}

function buildPayloads(input, priorStages = {}) {
  const evidence = evidenceFields(input);
  const source = sourceEvidence(input);
  const ids = actorIds(input);
  const person = targetPerson(input);
  const approval = approvalInput(input);

  return {
    nashMickNba: {
      ...ids,
      period: evidence.period,
      protectedContext: input.protectedContext,
      relationshipContext: input.relationshipContext || input.protectedContext || {},
      activityContext: input.activityContext || input.mickContext || {},
      followupContext: {
        ...(input.followupContext || {}),
        ...(input.nbaContext || {}),
        targetPerson: person,
      },
      nashConversationContext: input.nashConversationContext || input.nashContext || {},
      nashCombatContext: input.nashCombatContext || {},
      mickBehaviorContext: input.mickBehaviorContext || input.mickContext || {},
      goalContext: input.goalContext || null,
      compensationCandidateContext: input.compensationCandidateContext || null,
      forecastContext: input.forecastContext || null,
      sourceEvidence: source,
      requestedUse: requestedUseFor(input, "nashMickNba"),
    },
    promptBuilder: {
      managerContext: input.protectedContext || {},
      nashConversationContext: input.nashConversationContext || input.nashContext || {},
      nbaReasonWhy: priorStages.nashMickNba || input.nbaContext || {},
      messagePurpose: input.messagePurpose || "FOLLOW_UP",
      audienceType: input.audienceType || ids.personType || "prospect",
      evidenceRefs: evidence.evidenceRefs,
      sourceEvidenceIds: evidence.sourceEvidenceIds,
      sourceOwners: evidence.sourceOwners,
      freshness: evidence.freshness,
      period: evidence.period,
      requestedUse: requestedUseFor(input, "promptBuilder"),
    },
    draftIntake: {
      draftText: input.draftText,
      draftPurpose: input.draftPurpose || "FOLLOW_UP",
      audienceType: input.audienceType || ids.personType || "prospect",
      promptContext: priorStages.promptBuilder || {},
      evidenceRefs: evidence.evidenceRefs,
      sourceEvidenceIds: evidence.sourceEvidenceIds,
      sourceOwners: evidence.sourceOwners,
      freshness: evidence.freshness,
      period: evidence.period,
      requestedUse: requestedUseFor(input, "draftIntake"),
    },
    safetyValidator: {
      draftIntake: priorStages.draftIntake || {},
      draftText: input.draftText,
      draftPurpose: input.draftPurpose || "FOLLOW_UP",
      audienceType: input.audienceType || ids.personType || "prospect",
      promptContext: priorStages.promptBuilder || {},
      evidenceRefs: evidence.evidenceRefs,
      sourceEvidenceIds: evidence.sourceEvidenceIds,
      sourceOwners: evidence.sourceOwners,
      freshness: evidence.freshness,
      period: evidence.period,
      requestedUse: requestedUseFor(input, "safetyValidator"),
    },
    humanApprovalGate: {
      ...ids,
      ...approval,
      channelCandidate: channelCandidate(input),
      approvalSurface: input.approvalSurface || "GENESIS_BETA_LOOP",
      nbaReasonWhySnapshot: priorStages.nashMickNba || null,
      promptInstructionSnapshot: priorStages.promptBuilder || null,
      draftCandidateSnapshot: {
        draftText: input.draftText || null,
        draftPurpose: input.draftPurpose || "FOLLOW_UP",
      },
      safetyValidationSnapshot: priorStages.safetyValidator || null,
      sourceEvidence: source,
      warnings: (priorStages.safetyValidator && priorStages.safetyValidator.warnings) || [],
      limitations: (priorStages.safetyValidator && priorStages.safetyValidator.confidenceLimitations) || [],
      requestedUse: requestedUseFor(input, "humanApprovalGate"),
    },
    deliveryAdapter: {
      ...(input.delivery || {}),
      humanApprovalSnapshot: priorStages.humanApprovalGate || {},
      approvedText: priorStages.humanApprovalGate && priorStages.humanApprovalGate.approvedText,
      approvedArtifactHash: priorStages.humanApprovalGate && priorStages.humanApprovalGate.approvedArtifactHash,
      currentArtifactHash: approval.currentArtifactHash,
      channelCandidate: channelCandidate(input),
      safetyValidationSnapshot: priorStages.safetyValidator || null,
      sourceEvidence: [source],
      requestedUse: requestedUseFor(input, "deliveryAdapter"),
    },
  };
}

function callRealStage(stage, fn, payload) {
  if (typeof fn !== "function") {
    return { status: "REVIEW_REQUIRED", missingRealAdapter: stage };
  }

  try {
    const result = fn(payload);
    return result && typeof result === "object" ? result : { value: result };
  } catch (error) {
    return {
      status: "REVIEW_REQUIRED",
      realAdapterError: error.message,
      adapterStage: stage,
    };
  }
}

function buildGenesisBetaLoopRealAdapters(input) {
  const diagnostics = inspectGenesisBetaLoopRealAdapters();

  function real(stage, priorStages) {
    const spec = MODULE_SPECS[stage];
    const loaded = safeRequire(spec.path);
    const picked = loaded.ok ? pickFunction(loaded.exports, spec.names) : { fn: null };
    const payloads = buildPayloads(input, priorStages);
    return callRealStage(stage, picked.fn, payloads[stage]);
  }

  const stageCache = {};

  return {
    diagnostics,
    adapters: {
      nashMickNba: () => {
        stageCache.nashMickNba = real("nashMickNba", stageCache);
        return stageCache.nashMickNba;
      },
      promptBuilder: () => {
        stageCache.promptBuilder = real("promptBuilder", stageCache);
        return stageCache.promptBuilder;
      },
      draftIntake: () => {
        stageCache.draftIntake = real("draftIntake", stageCache);
        return stageCache.draftIntake;
      },
      safetyValidator: () => {
        stageCache.safetyValidator = real("safetyValidator", stageCache);
        return stageCache.safetyValidator;
      },
      humanApprovalGate: () => {
        stageCache.humanApprovalGate = real("humanApprovalGate", stageCache);
        return stageCache.humanApprovalGate;
      },
      deliveryAdapter: () => {
        stageCache.deliveryAdapter = real("deliveryAdapter", stageCache);
        return stageCache.deliveryAdapter;
      },
    },
  };
}

function buildGenesisBetaLoopRealResponse(input) {
  const wiring = buildGenesisBetaLoopRealAdapters(input);
  const output = buildGenesisBetaLoopOrchestrator(input, wiring.adapters);

  return {
    scenarioId: input.scenarioId || "UNKNOWN_SCENARIO",
    adapterDiagnostics: wiring.diagnostics,
    output: {
      ...output,
      ...FALSE_FLAGS,
    },
  };
}

function stringifyCell(value) {
  if (value === undefined) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return String(text).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function row(left, right) {
  return "| " + stringifyCell(left) + " | " + stringifyCell(right) + " |";
}

function buildGenesisBetaLoopRealResponseTables(input) {
  const response = buildGenesisBetaLoopRealResponse(input);
  const out = response.output;
  const lines = [];

  lines.push("## " + response.scenarioId);
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  lines.push(row("status", out.status));
  lines.push(row("decision", out.decision));
  lines.push(row("blockedStages", out.blockedStages));
  lines.push(row("warnings", out.warnings));
  lines.push(row("humanApprovalRequired", out.humanApprovalRequired));
  lines.push(row("deliveryCandidateOnly", out.deliveryCandidateOnly));
  lines.push(row("sendExecutionRequiredSeparately", out.sendExecutionRequiredSeparately));
  lines.push(row("article0Status", out.article0Status));
  lines.push(row("article0Principle", out.article0Principle));
  lines.push(row("article0Gate", out.article0Gate));
  lines.push(row("finalAuthority", out.finalAuthority));
  lines.push(row("forgeRole", out.forgeRole));
  lines.push(row("humanDecisionCheckpointRequired", out.humanDecisionCheckpointRequired));
  lines.push(row("reasoningVisible", out.reasoningVisible));
  lines.push(row("uncertaintyVisible", out.uncertaintyVisible));
  lines.push(row("evidenceVisible", out.evidenceVisible));
  lines.push(row("missingContextVisible", out.missingContextVisible));
  lines.push(row("learningPrompt", out.learningPrompt));
  lines.push(row("judgmentDevelopmentPrompt", out.judgmentDevelopmentPrompt));
  lines.push(row("actionBoundary", out.actionBoundary));
  lines.push("");
  lines.push("| Adapter | Real module status |");
  lines.push("|---|---|");
  for (const [stage, diagnostic] of Object.entries(response.adapterDiagnostics)) {
    lines.push(row(stage, diagnostic));
  }
  lines.push("");
  lines.push("| Stage | Real output |");
  lines.push("|---|---|");
  for (const [stage, value] of Object.entries(out.stages || {})) {
    lines.push(row(stage, value));
  }
  lines.push("");
  lines.push("| Boundary flag | Value |");
  lines.push("|---|---|");
  for (const flag of Object.keys(FALSE_FLAGS)) {
    lines.push(row(flag, out[flag]));
  }

  return lines.join("\n");
}

module.exports = {
  buildGenesisBetaLoopRealResponse,
  buildGenesisBetaLoopRealResponseTables,
  inspectGenesisBetaLoopRealAdapters,
};
