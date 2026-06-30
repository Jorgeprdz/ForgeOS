"use strict";

const STATUS = Object.freeze({
  READY: "READY",
  REVIEW_REQUIRED: "REVIEW_REQUIRED",
  UNKNOWN: "UNKNOWN",
  BLOCKED: "BLOCKED",
});

const DECISION = Object.freeze({
  ALLOW: "ALLOW",
  REVIEW: "REVIEW",
  BLOCK: "BLOCK",
});

const ALLOWED_USES = Object.freeze([
  "MICK_BEHAVIOR_REVIEW_INTAKE",
  "MANAGER_CONTEXT_INTAKE",
  "HABIT_REVIEW_CONTEXT",
  "SUPPORT_CONTEXT",
  "COACHING_CONTEXT",
  "EVIDENCE_REVIEW_CONTEXT",
  "HUMAN_REVIEW_CONTEXT",
]);

const FORBIDDEN_USES = Object.freeze([
  "MICK_RUNTIME_EXECUTION",
  "BEHAVIOR_TRUTH_CREATION",
  "PERSONALITY_JUDGMENT",
  "SURVEILLANCE_TRUTH",
  "HR_DECISION",
  "DISCIPLINARY_ACTION",
  "HUMAN_RANKING",
  "PERFORMANCE_LEADERBOARD",
  "PROMOTION_DECISION",
  "PUNISHMENT",
  "TERMINATION",
  "MESSAGE_SEND",
  "EMAIL_SEND",
  "DRAFT_CREATE",
  "TASK_CREATE",
  "CALENDAR_WRITE",
  "PRESSURE_MECHANICS",
  "AUTOMATIC_DECISION",
  "COMPENSATION",
  "PAYOUT",
  "REVENUE_TRUTH",
  "ADVISOR_LIFECYCLE_TRUTH",
  "PRECONTRACT_TRUTH",
  "HIRING_TRUTH",
  "DATABASE_WRITE",
  "FILESYSTEM_WRITE",
  "CACHE_WRITE",
  "MIGRATION_WRITE",
  "SCHEMA_WRITE",
  "UI_RENDERING",
]);

const FALSE_FLAG_KEYS = Object.freeze([
  "executesMickRuntime",
  "createsBehaviorTruth",
  "createsPersonalityJudgment",
  "createsSurveillanceTruth",
  "createsHrTruth",
  "createsDisciplinaryTruth",
  "createsRankingTruth",
  "createsPromotionTruth",
  "createsPunishmentTruth",
  "createsTerminationTruth",
  "createsRevenueTruth",
  "createsCompensationTruth",
  "createsPayoutTruth",
  "createsAdvisorLifecycleTruth",
  "createsPrecontractTruth",
  "createsHiringTruth",
  "automaticDecisionAllowed",
  "sendsMessages",
  "createsDrafts",
  "createsTasks",
  "writesCalendar",
  "writesDatabase",
  "writesFilesystem",
  "writesCache",
  "rendersUi",
]);

function buildFalseFlags() {
  return FALSE_FLAG_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});
}

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
    return value.id || value.source || value.owner || value.name || value.type || JSON.stringify(value);
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

function firstDefined(values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function extractEvidenceSources(packet) {
  return dedupe([
    ...asArray(packet.evidenceSources),
    ...asArray(packet.evidenceSource),
    ...asArray(packet.evidence && packet.evidence.sources),
    ...asArray(packet.provenance && packet.provenance.sources),
  ]);
}

function extractSourceOwners(packet) {
  return dedupe([
    ...asArray(packet.sourceOwners),
    ...asArray(packet.sourceOwner),
    ...asArray(packet.evidence && packet.evidence.sourceOwners),
    ...asArray(packet.provenance && packet.provenance.sourceOwners),
  ]);
}

function extractFreshness(packet) {
  return firstDefined([
    packet.freshness,
    packet.freshnessState,
    packet.evidenceFreshness,
    packet.metadata && packet.metadata.freshness,
    packet.provenance && packet.provenance.freshness,
  ]);
}

function findZeroPaths(value, prefix = "packet", depth = 0, out = []) {
  if (depth > 8) return out;

  if (value === 0) {
    out.push(prefix);
    return out;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => findZeroPaths(item, `${prefix}[${index}]`, depth + 1, out));
    return out;
  }

  if (isPlainObject(value)) {
    for (const [key, inner] of Object.entries(value)) {
      findZeroPaths(inner, `${prefix}.${key}`, depth + 1, out);
    }
  }

  return out;
}

function buildMickManagerContextIntakeBoundary(packet = {}, options = {}) {
  const inputIsObject = isPlainObject(packet);
  const raw = inputIsObject ? clone(packet) : {};
  const requestedUse = options.requestedUse || raw.requestedUse || "MICK_BEHAVIOR_REVIEW_INTAKE";

  const warnings = dedupe(raw.warnings || []);
  const limitations = dedupe(raw.limitations || []);
  const missing = [];
  const evidenceSources = extractEvidenceSources(raw);
  const sourceOwners = extractSourceOwners(raw);
  const freshness = extractFreshness(raw);

  const packetMissing = !inputIsObject || Object.keys(raw).length === 0;
  if (packetMissing) {
    missing.push("MICK_MANAGER_CONTEXT_PACKET");
    warnings.push("MISSING_PACKET_REMAINS_UNKNOWN_NOT_ZERO");
  }

  if (evidenceSources.length === 0) {
    missing.push("EVIDENCE_SOURCE");
    warnings.push("MISSING_EVIDENCE_REQUIRES_REVIEW");
  }

  if (sourceOwners.length === 0) {
    missing.push("SOURCE_OWNER");
    warnings.push("MISSING_SOURCE_OWNER_REQUIRES_REVIEW");
  }

  if (!freshness) {
    missing.push("FRESHNESS");
    warnings.push("MISSING_FRESHNESS_REQUIRES_REVIEW");
  }

  const freshnessText = String(freshness || "").toUpperCase();
  const stale =
    raw.stale === true ||
    raw.isStale === true ||
    freshnessText.includes("STALE") ||
    freshnessText.includes("EXPIRED");

  if (stale) {
    warnings.push("STALE_PACKET_REQUIRES_REVIEW");
  }

  const blockedPeriod =
    raw.blockedPeriod === true ||
    String(raw.periodStatus || "").toUpperCase().includes("BLOCKED") ||
    (raw.period && raw.period.blocked === true);

  if (blockedPeriod) {
    warnings.push("BLOCKED_PERIOD_REQUIRES_REVIEW_NOT_ZERO");
  }

  const defaultZeroWarnings = findZeroPaths(raw)
    .filter((path) => !path.endsWith(".length"))
    .map((path) => `EXPLICIT_ZERO_CONTEXT_WARNING:${path}`);

  warnings.push(...defaultZeroWarnings);

  const forbiddenUse = FORBIDDEN_USES.includes(requestedUse);
  const allowedUse = ALLOWED_USES.includes(requestedUse);
  const unsupportedUse = Boolean(requestedUse) && !allowedUse && !forbiddenUse;

  if (forbiddenUse) {
    warnings.push(`FORBIDDEN_USE_BLOCKED:${requestedUse}`);
  }

  if (unsupportedUse) {
    warnings.push(`UNSUPPORTED_USE_REQUIRES_REVIEW:${requestedUse}`);
  }

  const reviewRequired =
    packetMissing ||
    missing.length > 0 ||
    stale ||
    blockedPeriod ||
    defaultZeroWarnings.length > 0 ||
    unsupportedUse;

  let status = STATUS.READY;
  let decision = DECISION.ALLOW;

  if (forbiddenUse) {
    status = STATUS.BLOCKED;
    decision = DECISION.BLOCK;
  } else if (packetMissing) {
    status = STATUS.UNKNOWN;
    decision = DECISION.REVIEW;
  } else if (reviewRequired) {
    status = STATUS.REVIEW_REQUIRED;
    decision = DECISION.REVIEW;
  }

  const flags = buildFalseFlags();

  return {
    type: "MICK_MANAGER_CONTEXT_INTAKE_BOUNDARY",
    contextOnly: true,
    intakeOnly: true,
    validatesSanitizedPacketOnly: true,
    requestedUse,
    status,
    decision,
    allowed: decision === DECISION.ALLOW,
    blocked: decision === DECISION.BLOCK,
    requiresHumanReview: decision === DECISION.REVIEW,
    reviewRequired,
    unknown: status === STATUS.UNKNOWN,
    stale,
    blockedPeriod,
    missing: dedupe(missing),
    warnings: dedupe(warnings),
    limitations,
    defaultZeroWarnings: dedupe(defaultZeroWarnings),
    evidenceSources,
    sourceOwners,
    freshness: freshness || "UNKNOWN",
    allowedUses: [...ALLOWED_USES],
    forbiddenUses: [...FORBIDDEN_USES],
    flags,
    ...flags,
  };
}

module.exports = {
  STATUS,
  DECISION,
  ALLOWED_USES,
  FORBIDDEN_USES,
  buildMickManagerContextIntakeBoundary,
};
