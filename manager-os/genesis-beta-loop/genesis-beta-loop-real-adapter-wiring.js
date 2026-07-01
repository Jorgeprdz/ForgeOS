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
      "buildNashMickNbaReconnectionEngine",
      "buildNashMickNbaReconnection",
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
      "buildLlmDraftIntakeBoundary",
      "buildLlmDraftIntake",
      "buildDraftIntakeBoundary",
    ],
  },
  safetyValidator: {
    path: "../message-generation/message-safety-validator",
    names: [
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
      moduleLoaded: true,
      functionFound: typeof picked.fn === "function",
      exportName: picked.exportName,
      exportedKeys: Object.keys(loaded.exports || {}),
    };
  }

  return diagnostics;
}

function buildPayloads(input, priorStages = {}) {
  const evidenceRefs = input.evidenceRefs || [];
  const sourceOwners = input.sourceOwners || [];
  const freshness = input.freshness || "UNKNOWN";

  return {
    nashMickNba: {
      protectedContext: input.protectedContext,
      nashContext: input.nashContext,
      mickContext: input.mickContext,
      nbaContext: input.nbaContext,
      recommendedAction: input.nbaContext && input.nbaContext.recommendedAction,
      targetPerson: input.targetPerson || (input.protectedContext && input.protectedContext.targetPersonName),
      reasonWhy: input.nbaContext && input.nbaContext.reasonWhy,
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "genesis_beta_loop_real_adapter_wiring",
    },
    promptBuilder: {
      managerContext: input.protectedContext || {},
      nashContext: input.nashContext || {},
      nbaReasonWhy: priorStages.nashMickNba || input.nbaContext || {},
      purpose: "genesis_beta_loop_message_instruction",
      audienceType: "prospect_or_candidate",
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "message_prompt_instruction",
    },
    draftIntake: {
      draftText: input.draftText,
      promptContext: priorStages.promptBuilder || {},
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "draft_intake_for_human_review",
    },
    safetyValidator: {
      draftText: input.draftText,
      draftContext: priorStages.draftIntake || {},
      promptContext: priorStages.promptBuilder || {},
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "message_safety_validation",
    },
    humanApprovalGate: {
      ...(input.humanApproval || {}),
      artifact: input.draftText,
      safetyValidation: priorStages.safetyValidator || {},
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "human_approval_for_delivery_preparation",
    },
    deliveryAdapter: {
      ...(input.delivery || {}),
      approvedArtifact: input.draftText,
      humanApproval: priorStages.humanApprovalGate || {},
      channel: (input.delivery && input.delivery.channel) || input.channel || "whatsapp",
      recipientDestination: input.delivery && input.delivery.recipientDestination,
      evidenceRefs,
      sourceOwners,
      freshness,
      requestedUse: "delivery_candidate_preparation",
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
