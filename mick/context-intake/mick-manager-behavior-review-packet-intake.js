"use strict";

const {
  STATUS,
  DECISION,
  buildMickManagerContextIntakeBoundary,
} = require("./mick-manager-context-intake-boundary-contract");

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
  if (isPlainObject(value)) {
    return value.id || value.name || value.label || value.type || value.area || JSON.stringify(value);
  }
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

function normalizeArea(area, index) {
  if (typeof area === "string") {
    return {
      id: `behavior-review-area-${index + 1}`,
      label: area,
      type: "HABIT_REVIEW_CONTEXT",
      contextOnly: true,
    };
  }

  if (isPlainObject(area)) {
    return {
      id: area.id || `behavior-review-area-${index + 1}`,
      label: area.label || area.name || area.area || area.type || `Behavior review area ${index + 1}`,
      type: area.type || "HABIT_REVIEW_CONTEXT",
      evidence: clone(area.evidence || area.evidenceToReview || []),
      supportContext: clone(area.supportContext || area.support || []),
      contextOnly: true,
    };
  }

  return {
    id: `behavior-review-area-${index + 1}`,
    label: String(area),
    type: "HABIT_REVIEW_CONTEXT",
    contextOnly: true,
  };
}

function buildMickManagerBehaviorReviewPacketIntake(packet = {}, options = {}) {
  const raw = isPlainObject(packet) ? clone(packet) : {};
  const boundary = buildMickManagerContextIntakeBoundary(raw, options);

  const areas = asArray(
    raw.behaviorReviewAreas ||
      raw.behaviorAreas ||
      raw.habitReviewAreas ||
      raw.reviewAreas ||
      raw.habitContext
  ).map(normalizeArea);

  const supportContext = asArray(raw.supportContext || raw.supportAreas || raw.coachingSupport).map((item, index) => ({
    id: isPlainObject(item) && item.id ? item.id : `support-context-${index + 1}`,
    label: isPlainObject(item) ? item.label || item.name || item.type || `Support context ${index + 1}` : String(item),
    contextOnly: true,
  }));

  const evidenceToReview = dedupe([
    ...asArray(raw.evidenceToReview),
    ...asArray(raw.evidenceReviewContext),
    ...asArray(raw.managerEvidenceToReview),
  ]);

  const coachingGuardrails = dedupe([
    ...asArray(raw.coachingGuardrails),
    ...asArray(raw.guardrails),
    ...asArray(raw.supportGuardrails),
  ]);

  const warnings = dedupe([
    ...boundary.warnings,
    ...asArray(raw.warnings),
  ]);

  const flags = boundary.flags;

  return {
    type: "MICK_MANAGER_BEHAVIOR_REVIEW_PACKET_INTAKE",
    contextOnly: true,
    intakeOnly: true,
    validatesSanitizedPacketOnly: true,
    status: boundary.status,
    decision: boundary.decision,
    allowed: boundary.allowed,
    blocked: boundary.blocked,
    requiresHumanReview: boundary.requiresHumanReview,
    unknown: boundary.status === STATUS.UNKNOWN,
    boundary,
    behaviorReviewAreas: areas,
    habitReviewContext: areas.filter((area) => String(area.type).includes("HABIT")),
    supportContext,
    evidenceToReview,
    coachingGuardrails,
    warnings,
    missing: boundary.missing,
    stale: boundary.stale,
    evidenceSources: boundary.evidenceSources,
    sourceOwners: boundary.sourceOwners,
    freshness: boundary.freshness,
    finalBehaviorScoreCreated: false,
    humanRankingCreated: false,
    flags,
    ...flags,
  };
}

module.exports = {
  STATUS,
  DECISION,
  buildMickManagerBehaviorReviewPacketIntake,
};
