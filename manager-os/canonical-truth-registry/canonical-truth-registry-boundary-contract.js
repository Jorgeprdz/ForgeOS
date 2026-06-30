/**
 * Canonical Truth Registry Boundary Contract
 *
 * Canonical truth entry candidate is not canonical truth write.
 * Metric / Economic Truth remains separate.
 * Pure boundary: prepares canonical truth entry candidates only.
 * Never writes canonical truth, never persists, never creates metrics/economic truth, never executes actions.
 */

const CANONICAL_TRUTH_REGISTRY_STATUSES = Object.freeze({
  READY_FOR_CANONICAL_TRUTH_REGISTRY_REVIEW: 'READY_FOR_CANONICAL_TRUTH_REGISTRY_REVIEW',
  APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE: 'APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE',
  NEEDS_TRUTH_PROMOTION: 'NEEDS_TRUTH_PROMOTION',
  NEEDS_TRUTH_PROMOTION_REVIEW_CANDIDATE: 'NEEDS_TRUTH_PROMOTION_REVIEW_CANDIDATE',
  NEEDS_CANDIDATE_FACT_TYPE: 'NEEDS_CANDIDATE_FACT_TYPE',
  NEEDS_CANDIDATE_FACT_VALUE: 'NEEDS_CANDIDATE_FACT_VALUE',
  NEEDS_CANDIDATE_FACT_OWNER: 'NEEDS_CANDIDATE_FACT_OWNER',
  NEEDS_CANONICAL_TRUTH_POLICY: 'NEEDS_CANONICAL_TRUTH_POLICY',
  NEEDS_CANONICAL_KEY_POLICY: 'NEEDS_CANONICAL_KEY_POLICY',
  NEEDS_CANONICAL_OWNER_POLICY: 'NEEDS_CANONICAL_OWNER_POLICY',
  NEEDS_IMMUTABILITY_POLICY: 'NEEDS_IMMUTABILITY_POLICY',
  NEEDS_CONFLICT_REVIEW: 'NEEDS_CONFLICT_REVIEW',
  NEEDS_HUMAN_TRUTH_REVIEW: 'NEEDS_HUMAN_TRUTH_REVIEW',
  NEEDS_SOURCE_EVIDENCE: 'NEEDS_SOURCE_EVIDENCE',
  NEEDS_SOURCE_OWNER: 'NEEDS_SOURCE_OWNER',
  NEEDS_SOURCE_FRESHNESS: 'NEEDS_SOURCE_FRESHNESS',
  STALE_SOURCE_FRESHNESS: 'STALE_SOURCE_FRESHNESS',
  NEEDS_IDEMPOTENCY_KEY: 'NEEDS_IDEMPOTENCY_KEY',
  NEEDS_AUDIT_TRAIL: 'NEEDS_AUDIT_TRAIL',
  UNSUPPORTED_FACT_TYPE: 'UNSUPPORTED_FACT_TYPE',
  UNSUPPORTED_OWNER: 'UNSUPPORTED_OWNER',
  DUPLICATE_CANONICAL_KEY: 'DUPLICATE_CANONICAL_KEY',
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  EXPIRED_CANONICAL_TRUTH_WINDOW: 'EXPIRED_CANONICAL_TRUTH_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const CANONICAL_TRUTH_REGISTRY_DECISIONS = Object.freeze({
  REQUEST_CANONICAL_TRUTH_REGISTRY_REVIEW: 'REQUEST_CANONICAL_TRUTH_REGISTRY_REVIEW',
  APPROVE_CANONICAL_TRUTH_ENTRY_CANDIDATE: 'APPROVE_CANONICAL_TRUTH_ENTRY_CANDIDATE',
  BLOCK_CANONICAL_TRUTH_REGISTRY: 'BLOCK_CANONICAL_TRUTH_REGISTRY',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const CANONICAL_TRUTH_REGISTRY_ALLOWED_USES = Object.freeze([
  'CANONICAL_TRUTH_REGISTRY_REVIEW',
  'CANONICAL_TRUTH_ENTRY_CANDIDATE_PREP',
  'DELIVERY_CANONICAL_TRUTH_ENTRY_PREP',
  'MESSAGE_CANONICAL_TRUTH_ENTRY_PREP',
  'ACTIVITY_CANONICAL_TRUTH_ENTRY_PREP',
  'EVIDENCE_CANONICAL_ENTRY_PREP',
]);

const CANONICAL_TRUTH_REGISTRY_FORBIDDEN_USES = Object.freeze([
  'CANONICAL_TRUTH_WRITE',
  'PERSISTENCE_WRITE',
  'FILE_WRITE',
  'DATABASE_WRITE',
  'BUSINESS_TRUTH_CREATION',
  'METRIC_TRUTH_CREATION',
  'DELIVERY_TRUTH_CREATION',
  'MESSAGE_TRUTH_CREATION',
  'COMPENSATION_TRUTH',
  'PAYOUT_TRUTH',
  'REVENUE_TRUTH',
  'HUMAN_RANKING',
  'HR_DECISION',
  'PROMOTION_DECISION',
  'TERMINATION',
  'ADVISOR_LIFECYCLE_TRUTH',
  'PERSONALITY_TRUTH',
  'TASK_CREATION',
  'CALENDAR_CREATION',
  'CRM_MUTATION',
  'UI_RENDERING',
  'DASHBOARD_CREATION',
  'PROVIDER_API_CALL',
  'EXTERNAL_API_CALL',
  'SEND_MESSAGE',
  'ACTION_EXECUTION',
  'MANIPULATION',
  'SURVEILLANCE',
]);

const SUPPORTED_FACT_TYPES = Object.freeze([
  'DELIVERY_STATUS',
  'MESSAGE_STATUS',
  'ACTIVITY_EVENT',
  'AUDIT_EVENT',
  'FOLLOW_UP_STATE',
  'UI_READ_MODEL_STATUS',
]);

const SUPPORTED_OWNERS = Object.freeze([
  'DELIVERY_SYSTEM',
  'MESSAGE_SYSTEM',
  'ACTIVITY_SYSTEM',
  'AUDIT_SYSTEM',
  'MANAGER_OS',
  'ADVISOR_OS',
]);

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function unique(values) {
  return [...new Set(asArray(values).filter((value) => value !== undefined && value !== null && value !== ''))];
}

function normalizeUse(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : undefined;
}

function hasExplicitValue(value) {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

function collectEvidence(sourceEvidence) {
  const evidence = asArray(sourceEvidence);
  const evidenceRefs = [];
  const sourceEvidenceIds = [];
  const sourceOwners = [];

  for (const item of evidence) {
    if (!item || typeof item !== 'object') continue;
    evidenceRefs.push(item.evidenceRef, item.ref, item.id, item.sourceEvidenceId, item.evidenceId);
    sourceEvidenceIds.push(item.sourceEvidenceId, item.evidenceId, item.id);
    sourceOwners.push(item.sourceOwner, item.owner);
  }

  return {
    evidenceRefs: unique(evidenceRefs),
    sourceEvidenceIds: unique(sourceEvidenceIds),
    sourceOwners: unique(sourceOwners),
  };
}

function isExpired(expiresAt, nowValue) {
  if (!expiresAt) return false;
  const now = nowValue ? new Date(nowValue) : new Date();
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return false;
  return expiry.getTime() <= now.getTime();
}

function hasTruthPromotionSnapshot(snapshot) {
  return Boolean(snapshot && typeof snapshot === 'object' && snapshot.eligibleForTruthPromotionReview === true);
}

function hasPolicy(snapshot, forbiddenTrueFlags) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  return !forbiddenTrueFlags.some((flag) => snapshot[flag] === true);
}

function hasCanonicalKeyPolicy(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  if (snapshot.approvedForCanonicalTruthWrite === true) return false;
  if (snapshot.writesCanonicalTruth === true) return false;
  return true;
}

function hasOwnerPolicy(snapshot, owner) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.ownershipReviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  const owners = asArray(snapshot.allowedOwners || snapshot.owners).map(normalizeString).filter(Boolean);
  return owners.length === 0 || owners.includes(owner);
}

function hasConflictReview(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.conflictReviewed !== true) return false;
  return true;
}

function hasConflict(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  return snapshot.conflictDetected === true || snapshot.hasConflict === true || snapshot.conflict === true;
}

function hasHumanTruthReview(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.humanReviewed !== true) return false;
  if (snapshot.rejected === true) return false;
  return true;
}

function hasFreshness(sourceFreshness) {
  if (!sourceFreshness || typeof sourceFreshness !== 'object') return false;
  if (sourceFreshness.stale === true) return false;
  if (sourceFreshness.fresh === false) return false;
  if (sourceFreshness.status && normalizeString(sourceFreshness.status) !== 'FRESH') return false;
  return sourceFreshness.fresh === true || normalizeString(sourceFreshness.status) === 'FRESH' || Boolean(sourceFreshness.asOf);
}

function isStale(sourceFreshness) {
  if (!sourceFreshness || typeof sourceFreshness !== 'object') return false;
  return sourceFreshness.stale === true || sourceFreshness.fresh === false || normalizeString(sourceFreshness.status) === 'STALE';
}

function hasAuditTrail(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.auditTrailId || snapshot.auditId) return true;
  return asArray(snapshot.entries || snapshot.events).length > 0;
}

function baseOutput(input, evidenceBundle) {
  return {
    canonicalTruthRegistryStatus: CANONICAL_TRUTH_REGISTRY_STATUSES.UNKNOWN,
    decision: CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT,

    canonicalTruthRegistryRequestId: input.canonicalTruthRegistryRequestId || null,
    truthPromotionRequestId: input.truthPromotionRequestId || input.truthPromotionSnapshot?.truthPromotionRequestId || null,
    auditPersistenceRequestId: input.auditPersistenceRequestId || input.truthPromotionSnapshot?.auditPersistenceRequestId || null,
    uiReadModelRequestId: input.uiReadModelRequestId || input.truthPromotionSnapshot?.uiReadModelRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    personId: input.personId || null,
    personType: input.personType || null,
    candidateFactType: input.candidateFactType || null,
    candidateFactValue: hasExplicitValue(input.candidateFactValue) ? input.candidateFactValue : null,
    candidateFactOwner: input.candidateFactOwner || null,

    canonicalTruthEntryCandidate: null,
    eligibleForCanonicalTruthEntryPreparation: false,
    approvedForCanonicalTruthWrite: false,
    writesCanonicalTruth: false,
    persistsRecord: false,
    writesFile: false,
    writesDatabase: false,
    createsBusinessTruth: false,
    createsMetricTruth: false,
    createsDeliveryTruth: false,
    createsMessageTruth: false,
    createsCompensationTruth: false,
    createsPayoutTruth: false,
    createsRevenueTruth: false,
    createsRankingTruth: false,
    createsPunishmentTruth: false,
    createsHrTruth: false,
    createsPromotionTruth: false,
    createsAdvisorLifecycleTruth: false,
    createsPersonalityTruth: false,
    createsTask: false,
    createsCalendarEvent: false,
    mutatesCrm: false,
    rendersUi: false,
    providerApiCallAllowed: false,
    externalApiCallAllowed: false,
    executesAction: false,
    sendsMessage: false,
    metricEconomicTruthRemainsSeparate: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.truthPromotionSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.truthPromotionSnapshot?.limitations))]),

    evidenceRefs: evidenceBundle.evidenceRefs,
    sourceEvidenceIds: evidenceBundle.sourceEvidenceIds,
    sourceOwners: evidenceBundle.sourceOwners,
  };
}

function markBlocked(output, status, decision, signal, blockedUse) {
  output.canonicalTruthRegistryStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildCanonicalTruthRegistryBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && CANONICAL_TRUTH_REGISTRY_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.BLOCKED, CANONICAL_TRUTH_REGISTRY_DECISIONS.BLOCK_CANONICAL_TRUTH_REGISTRY, null, requestedUse);
  }

  if (requestedUse && !CANONICAL_TRUTH_REGISTRY_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.NOT_MODELED;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const truthPromotionSnapshot = original.truthPromotionSnapshot;
  if (!hasTruthPromotionSnapshot(truthPromotionSnapshot)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_TRUTH_PROMOTION, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'truthPromotionSnapshot');
  }

  const truthPromotionReviewCandidate = original.truthPromotionReviewCandidate || truthPromotionSnapshot.truthPromotionReviewCandidate;
  if (!truthPromotionReviewCandidate || typeof truthPromotionReviewCandidate !== 'object') {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_TRUTH_PROMOTION_REVIEW_CANDIDATE, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'truthPromotionReviewCandidate');
  }

  const candidateFactType = normalizeString(original.candidateFactType || truthPromotionReviewCandidate.candidateFactType);
  if (!candidateFactType) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_TYPE, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactType');
  }

  const candidateFactValue = hasExplicitValue(original.candidateFactValue)
    ? original.candidateFactValue
    : truthPromotionReviewCandidate.candidateFactValue;

  if (!hasExplicitValue(candidateFactValue)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_VALUE, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactValue');
  }

  const candidateFactOwner = normalizeString(original.candidateFactOwner || truthPromotionReviewCandidate.candidateFactOwner);
  if (!candidateFactOwner) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANDIDATE_FACT_OWNER, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactOwner');
  }

  if (!hasPolicy(original.canonicalTruthPolicySnapshot, ['approvedForCanonicalTruthWrite', 'writesCanonicalTruth', 'createsBusinessTruth', 'createsMetricTruth'])) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_TRUTH_POLICY, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'canonicalTruthPolicySnapshot');
  }

  if (!hasCanonicalKeyPolicy(original.canonicalKeyPolicySnapshot)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_KEY_POLICY, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'canonicalKeyPolicySnapshot');
  }

  if (!hasOwnerPolicy(original.canonicalOwnerPolicySnapshot, candidateFactOwner)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CANONICAL_OWNER_POLICY, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'canonicalOwnerPolicySnapshot');
  }

  if (!hasPolicy(original.immutabilityPolicySnapshot, ['mutableTruthAllowed', 'mutatesCanonicalTruth', 'mutatesCrm'])) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_IMMUTABILITY_POLICY, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'immutabilityPolicySnapshot');
  }

  if (!hasConflictReview(original.conflictReviewSnapshot)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_CONFLICT_REVIEW, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'conflictReviewSnapshot');
  }

  if (!hasHumanTruthReview(original.humanTruthReviewSnapshot)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_HUMAN_TRUTH_REVIEW, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'humanTruthReviewSnapshot');
  }

  if (asArray(original.sourceEvidence).length === 0) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_EVIDENCE, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceEvidence');
  }

  if (evidenceBundle.sourceOwners.length === 0) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_OWNER, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwner');
  }

  if (isStale(original.sourceFreshness)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.STALE_SOURCE_FRESHNESS, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');
  }

  if (!hasFreshness(original.sourceFreshness)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_SOURCE_FRESHNESS, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');
  }

  const idempotencyKey = original.idempotencyKey || truthPromotionReviewCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_IDEMPOTENCY_KEY, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return markBlocked(output, CANONICAL_TRUTH_REGISTRY_STATUSES.NEEDS_AUDIT_TRAIL, CANONICAL_TRUTH_REGISTRY_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (!SUPPORTED_FACT_TYPES.includes(candidateFactType)) {
    output.candidateFactType = candidateFactType;
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.UNSUPPORTED_FACT_TYPE;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_FACT_TYPE']);
    return output;
  }

  if (!SUPPORTED_OWNERS.includes(candidateFactOwner)) {
    output.candidateFactOwner = candidateFactOwner;
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.UNSUPPORTED_OWNER;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_OWNER']);
    return output;
  }

  if (original.canonicalKeyPolicySnapshot.duplicateCanonicalKey === true || original.canonicalKeyPolicySnapshot.duplicateKey === true) {
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.DUPLICATE_CANONICAL_KEY;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.BLOCK_CANONICAL_TRUTH_REGISTRY;
    output.blockedUses = unique([...output.blockedUses, 'DUPLICATE_CANONICAL_KEY']);
    return output;
  }

  if (hasConflict(original.conflictReviewSnapshot)) {
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.CONFLICT_DETECTED;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.BLOCK_CANONICAL_TRUTH_REGISTRY;
    output.blockedUses = unique([...output.blockedUses, 'CONFLICT_DETECTED']);
    return output;
  }

  if (isExpired(original.expiresAt || original.canonicalTruthWindowExpiresAt, original.now)) {
    output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.EXPIRED_CANONICAL_TRUTH_WINDOW;
    output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_CANONICAL_TRUTH_WINDOW']);
    return output;
  }

  output.candidateFactType = candidateFactType;
  output.candidateFactValue = candidateFactValue;
  output.candidateFactOwner = candidateFactOwner;

  output.canonicalTruthEntryCandidate = {
    canonicalKey: original.canonicalKey || `${candidateFactOwner}:${candidateFactType}:${idempotencyKey}`,
    candidateFactType,
    candidateFactValue,
    candidateFactOwner,
    candidateFactSource: original.candidateFactSource || truthPromotionReviewCandidate.candidateFactSource || null,
    candidateConfidence: hasExplicitValue(original.candidateConfidence) ? original.candidateConfidence : truthPromotionReviewCandidate.candidateConfidence || null,
    idempotencyKey,
    truthPromotionReviewCandidate,
    immutableSourceTrace: {
      evidenceRefs: output.evidenceRefs,
      sourceEvidenceIds: output.sourceEvidenceIds,
      sourceOwners: output.sourceOwners,
      sourceFreshness: clone(original.sourceFreshness),
      auditTrail: clone(original.auditTrail),
      warnings: output.warnings,
      limitations: output.limitations,
    },
    metricEconomicTruthRemainsSeparate: true,
    approvedForCanonicalTruthWrite: false,
    writesCanonicalTruth: false,
    persistsRecord: false,
    writesFile: false,
    writesDatabase: false,
    createsBusinessTruth: false,
    createsMetricTruth: false,
  };

  output.eligibleForCanonicalTruthEntryPreparation = true;
  output.approvedForCanonicalTruthWrite = false;
  output.writesCanonicalTruth = false;
  output.persistsRecord = false;
  output.writesFile = false;
  output.writesDatabase = false;
  output.createsBusinessTruth = false;
  output.createsMetricTruth = false;
  output.createsDeliveryTruth = false;
  output.createsMessageTruth = false;
  output.createsCompensationTruth = false;
  output.createsPayoutTruth = false;
  output.createsRevenueTruth = false;
  output.createsRankingTruth = false;
  output.createsPunishmentTruth = false;
  output.createsHrTruth = false;
  output.createsPromotionTruth = false;
  output.createsAdvisorLifecycleTruth = false;
  output.createsPersonalityTruth = false;
  output.createsTask = false;
  output.createsCalendarEvent = false;
  output.mutatesCrm = false;
  output.rendersUi = false;
  output.providerApiCallAllowed = false;
  output.externalApiCallAllowed = false;
  output.executesAction = false;
  output.sendsMessage = false;
  output.metricEconomicTruthRemainsSeparate = true;

  output.canonicalTruthRegistryStatus = CANONICAL_TRUTH_REGISTRY_STATUSES.APPROVED_FOR_CANONICAL_TRUTH_ENTRY_CANDIDATE;
  output.decision = CANONICAL_TRUTH_REGISTRY_DECISIONS.APPROVE_CANONICAL_TRUTH_ENTRY_CANDIDATE;

  return output;
}

module.exports = {
  buildCanonicalTruthRegistryBoundary,
  CANONICAL_TRUTH_REGISTRY_STATUSES,
  CANONICAL_TRUTH_REGISTRY_DECISIONS,
  CANONICAL_TRUTH_REGISTRY_ALLOWED_USES,
  CANONICAL_TRUTH_REGISTRY_FORBIDDEN_USES,
};
