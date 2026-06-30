"use strict";

const {
  STATUS,
  DECISION,
  buildMickManagerContextIntakeBoundary,
} = require("./mick-manager-context-intake-boundary-contract");

const {
  buildMickManagerBehaviorReviewPacketIntake,
} = require("./mick-manager-behavior-review-packet-intake");

const {
  buildMickManagerNoSurveillanceGuardrailIntake,
} = require("./mick-manager-no-surveillance-guardrail-intake");

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeToken(value) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (isPlainObject(value)) return value.id || value.name || value.type || JSON.stringify(value);
  return String(value);
}

function dedupe(values) {
  const seen = new Set();
  const result = [];

  for (const value of asArray(values).flat()) {
    const token = normalizeToken(value);
    if (!token || seen.has(token)) continue;
    seen.add(token);
    result.push(token);
  }

  return result;
}

function pickSanitizedMickPacket(input) {
  if (!isPlainObject(input)) return {};

  if (isPlainObject(input.mickBehaviorReviewPacket)) return input.mickBehaviorReviewPacket;
  if (isPlainObject(input.managerMickBehaviorContextPacket)) return input.managerMickBehaviorContextPacket;
  if (isPlainObject(input.mickPacket)) return input.mickPacket;
  if (isPlainObject(input.packet)) return input.packet;
  if (isPlainObject(input.externalContextBridgePacket) && isPlainObject(input.externalContextBridgePacket.mick)) {
    return input.externalContextBridgePacket.mick;
  }

  return input;
}

function buildMickManagerContextIntake(input = {}, options = {}) {
  const original = isPlainObject(input) ? clone(input) : {};
  const packet = pickSanitizedMickPacket(original);

  const boundary = buildMickManagerContextIntakeBoundary(packet, options);
  const behaviorReviewPacketIntake = buildMickManagerBehaviorReviewPacketIntake(packet, options);
  const noSurveillanceGuardrailIntake = buildMickManagerNoSurveillanceGuardrailIntake(packet, options);

  const warnings = dedupe([
    ...boundary.warnings,
    ...behaviorReviewPacketIntake.warnings,
    ...noSurveillanceGuardrailIntake.warnings,
  ]);

  const missing = dedupe([
    ...boundary.missing,
    ...behaviorReviewPacketIntake.missing,
    ...noSurveillanceGuardrailIntake.missing,
  ]);

  const evidenceSources = dedupe([
    ...boundary.evidenceSources,
    ...behaviorReviewPacketIntake.evidenceSources,
    ...noSurveillanceGuardrailIntake.evidenceSources,
  ]);

  const sourceOwners = dedupe([
    ...boundary.sourceOwners,
    ...behaviorReviewPacketIntake.sourceOwners,
    ...noSurveillanceGuardrailIntake.sourceOwners,
  ]);

  let status = boundary.status;
  let decision = boundary.decision;

  if (boundary.decision === DECISION.BLOCK) {
    status = STATUS.BLOCKED;
    decision = DECISION.BLOCK;
  } else if (
    boundary.decision === DECISION.REVIEW ||
    behaviorReviewPacketIntake.decision === DECISION.REVIEW ||
    noSurveillanceGuardrailIntake.decision === DECISION.REVIEW
  ) {
    status = boundary.status === STATUS.UNKNOWN ? STATUS.UNKNOWN : STATUS.REVIEW_REQUIRED;
    decision = DECISION.REVIEW;
  }

  const flags = boundary.flags;

  return {
    type: "MICK_MANAGER_CONTEXT_INTAKE_ORCHESTRATOR",
    contextOnly: true,
    intakeOnly: true,
    acceptedPacketSource: "MANAGER_OS_EXTERNAL_CONTEXT_BRIDGE_SANITIZED_PACKET",
    usesSanitizedPacketOnly: true,
    status,
    decision,
    allowed: decision === DECISION.ALLOW,
    blocked: decision === DECISION.BLOCK,
    requiresHumanReview: decision === DECISION.REVIEW,
    boundary,
    behaviorReviewPacketIntake,
    noSurveillanceGuardrailIntake,
    mickReadyContext: {
      contextOnly: true,
      behaviorReviewAreas: behaviorReviewPacketIntake.behaviorReviewAreas,
      habitReviewContext: behaviorReviewPacketIntake.habitReviewContext,
      supportContext: behaviorReviewPacketIntake.supportContext,
      evidenceToReview: behaviorReviewPacketIntake.evidenceToReview,
      unsafeLanguageFindings: noSurveillanceGuardrailIntake.unsafeLanguageFindings,
    },
    executiveSummary: {
      contextOnly: true,
      status,
      decision,
      behaviorReviewAreaCount: behaviorReviewPacketIntake.behaviorReviewAreas.length,
      supportContextCount: behaviorReviewPacketIntake.supportContext.length,
      unsafeLanguageFindingCount: noSurveillanceGuardrailIntake.unsafeLanguageFindings.length,
      evidenceSourceCount: evidenceSources.length,
      sourceOwnerCount: sourceOwners.length,
    },
    warnings,
    missing,
    evidenceSources,
    sourceOwners,
    freshness: boundary.freshness,
    flags,
    ...flags,
  };
}

module.exports = {
  STATUS,
  DECISION,
  buildMickManagerContextIntake,
};
