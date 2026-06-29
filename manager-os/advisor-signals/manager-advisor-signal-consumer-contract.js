const MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES = Object.freeze({
  READY_FOR_MANAGER_REVIEW: "READY_FOR_MANAGER_REVIEW",
  NEEDS_EVIDENCE: "NEEDS_EVIDENCE",
  NEEDS_SOURCE_OWNER: "NEEDS_SOURCE_OWNER",
  NEEDS_FRESHNESS: "NEEDS_FRESHNESS",
  NEEDS_HUMAN_REVIEW: "NEEDS_HUMAN_REVIEW",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  NOT_MODELED: "NOT_MODELED"
});

const MANAGER_ADVISOR_SIGNAL_CONTRACT_DECISIONS = Object.freeze({
  CONSUME_AS_MANAGER_REVIEW_CONTEXT: "CONSUME_AS_MANAGER_REVIEW_CONTEXT",
  COLLECT_SIGNAL_EVIDENCE: "COLLECT_SIGNAL_EVIDENCE",
  COLLECT_SOURCE_OWNER: "COLLECT_SOURCE_OWNER",
  REFRESH_SIGNAL_CONTEXT: "REFRESH_SIGNAL_CONTEXT",
  REQUIRE_HUMAN_REVIEW: "REQUIRE_HUMAN_REVIEW",
  BLOCK_FORBIDDEN_USE: "BLOCK_FORBIDDEN_USE"
});

const ALLOWED_USES = Object.freeze([
  "MANAGER_REVIEW",
  "COACHING_CONTEXT",
  "TEAM_PATTERN_CONTEXT",
  "ONE_ON_ONE_PREP",
  "SUPPORT_SIGNAL_REVIEW"
]);

const FORBIDDEN_USES = new Set([
  "PUNISHMENT",
  "HUMAN_RANKING",
  "PROMOTION_DECISION",
  "TERMINATION",
  "COMPENSATION",
  "PAYOUT",
  "ADVISOR_LIFECYCLE_TRUTH",
  "REVENUE_TRUTH"
]);

const SIGNAL_INPUTS = Object.freeze([
  ["performance", "advisorPerformance"],
  ["monitor", "advisorMonitor"],
  ["score", "advisorScore"],
  ["alerts", "advisorAlerts"],
  ["activity", "activityTimeline"],
  ["prospecting", "prospectingSignals"],
  ["followup", "followupSignals"],
  ["referral", "referralSignals"],
  ["salesDna", "salesDnaSignals"]
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
  return [...new Set(values.filter(present))];
}

function normalizeText(value) {
  return present(value) ? String(value).trim().toUpperCase() : null;
}

function collectFromSignal(signal, field) {
  if (!present(signal)) return [];
  if (Array.isArray(signal)) {
    return signal.flatMap((item) => collectFromSignal(item, field));
  }
  if (!isObject(signal)) return [];
  return asArray(signal[field]);
}

function collectEvidenceRefs({ sourceEvidence = {}, signals = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.evidenceRefs),
    ...asArray(sourceEvidence.evidenceRef),
    ...signals.flatMap((signal) => collectFromSignal(signal, "evidenceRefs")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "evidenceRef"))
  ]);
}

function collectSourceEvidenceIds({ sourceEvidence = {}, signals = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceEvidenceIds),
    ...asArray(sourceEvidence.sourceEvidenceId),
    ...signals.flatMap((signal) => collectFromSignal(signal, "sourceEvidenceIds")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "sourceEvidenceId"))
  ]);
}

function collectSourceOwners({ sourceEvidence = {}, signals = [] } = {}) {
  return unique([
    ...asArray(sourceEvidence.sourceOwners),
    ...asArray(sourceEvidence.sourceOwner),
    ...signals.flatMap((signal) => collectFromSignal(signal, "sourceOwners")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "sourceOwner"))
  ]);
}

function firstPresent(...values) {
  return values.find(present) || null;
}

function resolveAdvisorId({ advisor = {}, advisorMonitor = {}, activityTimeline = [] } = {}) {
  const firstActivity = asArray(activityTimeline).find((activity) => isObject(activity) && present(activity.advisorId)) || {};

  return firstPresent(
    advisor.advisorId,
    advisor.id,
    advisorMonitor.advisorId,
    firstActivity.advisorId
  );
}

function hasSignalValue(value) {
  if (!present(value)) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isObject(value)) return Object.keys(value).length > 0;
  return true;
}

function buildManagerVisibleSignals(input = {}) {
  return SIGNAL_INPUTS
    .filter(([, inputKey]) => hasSignalValue(input[inputKey]))
    .map(([signalKey, inputKey]) => ({
      signalKey,
      contextType: `${signalKey}_context`,
      value: input[inputKey],
      referenceOnly: true,
      createsTruth: false
    }));
}

function signalHasLegacyZero(value) {
  if (!present(value)) return false;
  if (typeof value === "number") return value === 0;
  if (Array.isArray(value)) return value.some(signalHasLegacyZero);
  if (!isObject(value)) return false;

  return Object.entries(value).some(([key, entryValue]) => {
    const normalizedKey = normalizeText(key);
    const looksLikeLegacyMetric =
      normalizedKey &&
      (
        normalizedKey.includes("SCORE") ||
        normalizedKey.includes("PUNTOS") ||
        normalizedKey.includes("PIPELINE") ||
        normalizedKey.includes("PROBABILITY") ||
        normalizedKey.includes("RATE") ||
        normalizedKey.includes("COUNT") ||
        normalizedKey.includes("TASKS") ||
        normalizedKey.includes("POLICIES") ||
        normalizedKey.includes("RENEWALS") ||
        normalizedKey.includes("FOLLOWUP")
      );

    if (looksLikeLegacyMetric && entryValue === 0) return true;
    return signalHasLegacyZero(entryValue);
  });
}

function detectDefaultZeroRisks(input = {}) {
  return SIGNAL_INPUTS
    .filter(([, inputKey]) => signalHasLegacyZero(input[inputKey]))
    .map(([signalKey]) => `${signalKey}_legacy_zero_requires_evidence_review`);
}

function collectFreshnessCandidates({ sourceEvidence = {}, signals = [] } = {}) {
  return unique([
    sourceEvidence.freshness,
    sourceEvidence.freshnessStatus,
    sourceEvidence.generatedAt,
    sourceEvidence.capturedAt,
    sourceEvidence.updatedAt,
    ...signals.flatMap((signal) => collectFromSignal(signal, "freshness")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "freshnessStatus")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "generatedAt")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "capturedAt")),
    ...signals.flatMap((signal) => collectFromSignal(signal, "updatedAt"))
  ]);
}

function resolveFreshness({ sourceEvidence = {}, signals = [] } = {}) {
  const candidates = collectFreshnessCandidates({ sourceEvidence, signals });
  const explicitFreshness = sourceEvidence.freshness;
  const status = normalizeText(
    isObject(explicitFreshness) ? explicitFreshness.status : explicitFreshness || sourceEvidence.freshnessStatus
  );
  const stale = status === "STALE" ||
    status === "EXPIRED" ||
    sourceEvidence.isFresh === false ||
    signals.some((signal) => isObject(signal) && signal.stale === true);

  return {
    value: explicitFreshness || sourceEvidence.freshnessStatus || candidates[0] || null,
    available: candidates.length > 0,
    stale
  };
}

function boundaryFlags() {
  return {
    automaticDecisionAllowed: false,
    createsManagerJudgmentTruth: false,
    createsHumanRankingTruth: false,
    createsPromotionDecisionTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsCompensationTruth: false,
    createsRevenue: false,
    createsCompensation: false,
    createsPayoutTruth: false
  };
}

function resolveContractStatus({
  blockedUses,
  managerVisibleSignals,
  evidenceRefs,
  sourceEvidenceIds,
  sourceOwners,
  freshness,
  missingSignals,
  humanReviewRequired
}) {
  if (blockedUses.length > 0) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.BLOCKED;
  if (managerVisibleSignals.length === 0) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.UNKNOWN;
  if (missingSignals.length > 0) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_HUMAN_REVIEW;
  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_EVIDENCE;
  if (sourceOwners.length === 0) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_SOURCE_OWNER;
  if (!freshness.available || freshness.stale) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_FRESHNESS;
  if (humanReviewRequired) return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.NEEDS_HUMAN_REVIEW;
  return MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES.READY_FOR_MANAGER_REVIEW;
}

function mapAdvisorOsSignalsForManager({
  advisorPerformance = null,
  advisorMonitor = null,
  advisorScore = null,
  advisorAlerts = null,
  activityTimeline = null,
  prospectingSignals = null,
  followupSignals = null,
  referralSignals = null,
  salesDnaSignals = null,
  advisor = {},
  period = null,
  sourceEvidence = {},
  requestedUse = null
} = {}) {
  const input = {
    advisorPerformance,
    advisorMonitor,
    advisorScore,
    advisorAlerts,
    activityTimeline,
    prospectingSignals,
    followupSignals,
    referralSignals,
    salesDnaSignals,
    advisor,
    period,
    sourceEvidence
  };
  const signals = SIGNAL_INPUTS.map(([, inputKey]) => input[inputKey]).filter(present);
  const managerVisibleSignals = buildManagerVisibleSignals(input);
  const evidenceRefs = collectEvidenceRefs({ sourceEvidence, signals });
  const sourceEvidenceIds = collectSourceEvidenceIds({ sourceEvidence, signals });
  const sourceOwners = collectSourceOwners({ sourceEvidence, signals });
  const freshness = resolveFreshness({ sourceEvidence, signals });
  const warnings = [];
  const confidenceLimitations = [];
  const missingSignals = [];
  const unknownSignals = [];
  const staleSignals = [];
  const allowedUses = [];
  const blockedUses = [];
  const normalizedRequestedUse = normalizeText(requestedUse);
  const defaultZeroRisks = detectDefaultZeroRisks(input);

  if (normalizedRequestedUse) {
    if (FORBIDDEN_USES.has(normalizedRequestedUse)) {
      blockedUses.push(normalizedRequestedUse);
      warnings.push(`${normalizedRequestedUse} use is forbidden for Manager OS advisor signal consumer contract.`);
    } else if (ALLOWED_USES.includes(normalizedRequestedUse)) {
      allowedUses.push(normalizedRequestedUse);
    } else {
      blockedUses.push(normalizedRequestedUse);
      warnings.push(`${normalizedRequestedUse} use is not modeled for Manager OS advisor signal consumer contract.`);
    }
  } else {
    allowedUses.push("MANAGER_REVIEW");
  }

  SIGNAL_INPUTS.forEach(([signalKey, inputKey]) => {
    if (!hasSignalValue(input[inputKey])) missingSignals.push(`${signalKey}_signal_missing`);
  });

  if (managerVisibleSignals.length === 0) {
    unknownSignals.push("advisor_os_signals_missing");
    warnings.push("No Advisor OS signals were provided for Manager OS review context.");
  }

  if (evidenceRefs.length === 0 && sourceEvidenceIds.length === 0) {
    warnings.push("Advisor OS signal evidence is missing; signal can be reviewed only as unsupported context.");
    confidenceLimitations.push("missing_signal_evidence");
  }

  if (sourceOwners.length === 0) {
    warnings.push("Advisor OS signal source owner is missing.");
    confidenceLimitations.push("missing_signal_source_owner");
  }

  if (!freshness.available) {
    staleSignals.push("signal_freshness_missing");
    warnings.push("Advisor OS signal freshness is missing.");
    confidenceLimitations.push("missing_signal_freshness");
  }

  if (freshness.stale) {
    staleSignals.push("signal_freshness_stale");
    warnings.push("Advisor OS signal freshness is stale.");
    confidenceLimitations.push("stale_signal_freshness");
  }

  defaultZeroRisks.forEach((risk) => {
    warnings.push(`${risk}: possible legacy default-zero signal; do not treat as manager judgment truth.`);
    confidenceLimitations.push(risk);
  });

  const managerReviewRequired = blockedUses.length > 0 ||
    defaultZeroRisks.length > 0 ||
    evidenceRefs.length === 0 ||
    sourceEvidenceIds.length === 0 ||
    sourceOwners.length === 0 ||
    !freshness.available ||
    freshness.stale ||
    missingSignals.length > 0;
  const humanReviewRequired = managerReviewRequired;
  const contractStatus = resolveContractStatus({
    blockedUses,
    managerVisibleSignals,
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    freshness,
    missingSignals,
    humanReviewRequired
  });

  return {
    contractStatus,
    advisorId: resolveAdvisorId({ advisor, advisorMonitor: advisorMonitor || {}, activityTimeline: activityTimeline || [] }),
    managerVisibleSignals,
    missingSignals: unique(missingSignals),
    unknownSignals: unique(unknownSignals),
    staleSignals: unique(staleSignals),
    evidenceRefs,
    sourceEvidenceIds,
    sourceOwners,
    period: period || sourceEvidence.period || null,
    freshness: freshness.value,
    confidenceLimitations: unique(confidenceLimitations),
    warnings: unique([
      ...warnings,
      "Advisor OS signals are reference context only and do not create Manager OS judgment truth."
    ]),
    managerReviewRequired,
    humanReviewRequired,
    allowedUses: unique(allowedUses),
    blockedUses: unique(blockedUses),
    ...boundaryFlags()
  };
}

module.exports = {
  ALLOWED_MANAGER_ADVISOR_SIGNAL_USES: ALLOWED_USES,
  FORBIDDEN_MANAGER_ADVISOR_SIGNAL_USES: [...FORBIDDEN_USES],
  MANAGER_ADVISOR_SIGNAL_CONTRACT_DECISIONS,
  MANAGER_ADVISOR_SIGNAL_CONTRACT_STATUSES,
  mapAdvisorOsSignalsForManager
};
