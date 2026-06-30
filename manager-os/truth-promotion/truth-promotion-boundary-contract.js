/**
 * Truth Promotion Boundary Contract
 *
 * Truth promotion candidate is not canonical truth.
 * Canonical Truth Registry remains separate.
 * Pure boundary: prepares truth promotion review candidates only.
 * Never writes canonical truth, never creates metric/business truth, never mutates CRM, never executes actions.
 */

const TRUTH_PROMOTION_STATUSES = Object.freeze({
  READY_FOR_TRUTH_PROMOTION_REVIEW: 'READY_FOR_TRUTH_PROMOTION_REVIEW',
  APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE: 'APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE',
  NEEDS_AUDIT_PERSISTENCE: 'NEEDS_AUDIT_PERSISTENCE',
  NEEDS_AUDIT_PERSISTENCE_RECORD_CANDIDATE: 'NEEDS_AUDIT_PERSISTENCE_RECORD_CANDIDATE',
  NEEDS_CANDIDATE_FACT_TYPE: 'NEEDS_CANDIDATE_FACT_TYPE',
  NEEDS_CANDIDATE_FACT_VALUE: 'NEEDS_CANDIDATE_FACT_VALUE',
  NEEDS_CANDIDATE_FACT_OWNER: 'NEEDS_CANDIDATE_FACT_OWNER',
  NEEDS_PROMOTION_POLICY: 'NEEDS_PROMOTION_POLICY',
  NEEDS_METRIC_OWNERSHIP_REVIEW: 'NEEDS_METRIC_OWNERSHIP_REVIEW',
  NEEDS_TRUTH_OWNERSHIP_REVIEW: 'NEEDS_TRUTH_OWNERSHIP_REVIEW',
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
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  EXPIRED_TRUTH_PROMOTION_WINDOW: 'EXPIRED_TRUTH_PROMOTION_WINDOW',
  BLOCKED: 'BLOCKED',
  UNKNOWN: 'UNKNOWN',
  NOT_MODELED: 'NOT_MODELED',
});

const TRUTH_PROMOTION_DECISIONS = Object.freeze({
  REQUEST_TRUTH_PROMOTION_REVIEW: 'REQUEST_TRUTH_PROMOTION_REVIEW',
  APPROVE_TRUTH_PROMOTION_REVIEW_CANDIDATE: 'APPROVE_TRUTH_PROMOTION_REVIEW_CANDIDATE',
  BLOCK_TRUTH_PROMOTION: 'BLOCK_TRUTH_PROMOTION',
  NEEDS_MORE_CONTEXT: 'NEEDS_MORE_CONTEXT',
  EXPIRED: 'EXPIRED',
  NOT_MODELED: 'NOT_MODELED',
});

const TRUTH_PROMOTION_ALLOWED_USES = Object.freeze([
  'TRUTH_PROMOTION_REVIEW',
  'TRUTH_PROMOTION_CANDIDATE_PREP',
  'DELIVERY_TRUTH_REVIEW_PREP',
  'MESSAGE_TRUTH_REVIEW_PREP',
  'ACTIVITY_TRUTH_REVIEW_PREP',
  'EVIDENCE_TO_TRUTH_REVIEW_PREP',
]);

const TRUTH_PROMOTION_FORBIDDEN_USES = Object.freeze([
  'CANONICAL_TRUTH_WRITE',
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
  'PERSISTENCE_WRITE',
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

function hasAuditPersistenceSnapshot(snapshot) {
  return Boolean(snapshot && typeof snapshot === 'object' && snapshot.approvedForPersistenceCandidatePreparation === true);
}

function hasPolicy(snapshot, forbiddenTrueFlags) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.policyReviewed !== true) return false;
  if (snapshot.allowed === false) return false;
  return !forbiddenTrueFlags.some((flag) => snapshot[flag] === true);
}

function hasOwnershipReview(snapshot, owner) {
  if (!snapshot || typeof snapshot !== 'object') return false;
  if (snapshot.reviewed !== true && snapshot.ownershipReviewed !== true) return false;
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
    truthPromotionStatus: TRUTH_PROMOTION_STATUSES.UNKNOWN,
    decision: TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT,

    truthPromotionRequestId: input.truthPromotionRequestId || null,
    auditPersistenceRequestId: input.auditPersistenceRequestId || input.auditPersistenceSnapshot?.auditPersistenceRequestId || null,
    uiReadModelRequestId: input.uiReadModelRequestId || input.auditPersistenceSnapshot?.uiReadModelRequestId || null,
    advisorId: input.advisorId || null,
    managerId: input.managerId || null,
    personId: input.personId || null,
    personType: input.personType || null,
    candidateFactType: input.candidateFactType || null,
    candidateFactValue: hasExplicitValue(input.candidateFactValue) ? input.candidateFactValue : null,

    truthPromotionReviewCandidate: null,
    eligibleForTruthPromotionReview: false,
    approvedForCanonicalTruthWrite: false,
    writesCanonicalTruth: false,
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
    persistsRecord: false,
    providerApiCallAllowed: false,
    externalApiCallAllowed: false,
    executesAction: false,
    sendsMessage: false,

    canonicalTruthRegistryWriteAllowed: false,
    canonicalTruthRegistryRemainsSeparate: true,

    blockedUses: [],
    allowedUses: [],
    missingSignals: [],
    unknownSignals: [],
    warnings: unique([...(asArray(input.warnings)), ...(asArray(input.auditPersistenceSnapshot?.warnings))]),
    limitations: unique([...(asArray(input.limitations)), ...(asArray(input.auditPersistenceSnapshot?.limitations))]),

    evidenceRefs: evidenceBundle.evidenceRefs,
    sourceEvidenceIds: evidenceBundle.sourceEvidenceIds,
    sourceOwners: evidenceBundle.sourceOwners,
  };
}

function markBlocked(output, status, decision, signal, blockedUse) {
  output.truthPromotionStatus = status;
  output.decision = decision;
  if (signal) output.missingSignals = unique([...output.missingSignals, signal]);
  if (blockedUse) output.blockedUses = unique([...output.blockedUses, blockedUse]);
  return output;
}

function buildTruthPromotionBoundary(input = {}) {
  const original = clone(input) || {};
  const evidenceBundle = collectEvidence(original.sourceEvidence);
  const output = baseOutput(original, evidenceBundle);

  const requestedUse = normalizeUse(original.requestedUse);
  if (requestedUse && TRUTH_PROMOTION_FORBIDDEN_USES.includes(requestedUse)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.BLOCKED, TRUTH_PROMOTION_DECISIONS.BLOCK_TRUTH_PROMOTION, null, requestedUse);
  }

  if (requestedUse && !TRUTH_PROMOTION_ALLOWED_USES.includes(requestedUse)) {
    output.blockedUses = unique([requestedUse]);
    output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.NOT_MODELED;
    output.decision = TRUTH_PROMOTION_DECISIONS.NOT_MODELED;
    return output;
  }

  if (requestedUse) output.allowedUses = unique([requestedUse]);

  const auditSnapshot = original.auditPersistenceSnapshot;
  if (!hasAuditPersistenceSnapshot(auditSnapshot)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_PERSISTENCE, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'auditPersistenceSnapshot');
  }

  const auditRecordCandidate = original.auditPersistenceRecordCandidate || auditSnapshot.auditPersistenceRecordCandidate;
  if (!auditRecordCandidate || typeof auditRecordCandidate !== 'object') {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_PERSISTENCE_RECORD_CANDIDATE, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'auditPersistenceRecordCandidate');
  }

  const candidateFactType = normalizeString(original.candidateFactType || auditRecordCandidate.candidateFactType);
  if (!candidateFactType) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_TYPE, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactType');
  }

  const candidateFactValue = hasExplicitValue(original.candidateFactValue)
    ? original.candidateFactValue
    : auditRecordCandidate.candidateFactValue;

  if (!hasExplicitValue(candidateFactValue)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_VALUE, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactValue');
  }

  const candidateFactOwner = normalizeString(original.candidateFactOwner || auditRecordCandidate.candidateFactOwner);
  if (!candidateFactOwner) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_CANDIDATE_FACT_OWNER, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'candidateFactOwner');
  }

  if (!hasPolicy(original.promotionPolicySnapshot, ['approvedForCanonicalTruthWrite', 'writesCanonicalTruth', 'createsBusinessTruth', 'createsMetricTruth'])) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_PROMOTION_POLICY, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'promotionPolicySnapshot');
  }

  if (!hasOwnershipReview(original.metricOwnershipSnapshot, candidateFactOwner)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_METRIC_OWNERSHIP_REVIEW, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'metricOwnershipSnapshot');
  }

  if (!hasOwnershipReview(original.truthOwnershipSnapshot, candidateFactOwner)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_TRUTH_OWNERSHIP_REVIEW, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'truthOwnershipSnapshot');
  }

  if (!hasConflictReview(original.conflictReviewSnapshot)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_CONFLICT_REVIEW, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'conflictReviewSnapshot');
  }

  if (!hasHumanTruthReview(original.humanTruthReviewSnapshot)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_HUMAN_TRUTH_REVIEW, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'humanTruthReviewSnapshot');
  }

  if (asArray(original.sourceEvidence).length === 0) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_EVIDENCE, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceEvidence');
  }

  if (evidenceBundle.sourceOwners.length === 0) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_OWNER, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceOwner');
  }

  if (isStale(original.sourceFreshness)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.STALE_SOURCE_FRESHNESS, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');
  }

  if (!hasFreshness(original.sourceFreshness)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_SOURCE_FRESHNESS, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'sourceFreshness');
  }

  const idempotencyKey = original.idempotencyKey || auditRecordCandidate.idempotencyKey;
  if (!idempotencyKey) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_IDEMPOTENCY_KEY, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'idempotencyKey');
  }

  if (!hasAuditTrail(original.auditTrail)) {
    return markBlocked(output, TRUTH_PROMOTION_STATUSES.NEEDS_AUDIT_TRAIL, TRUTH_PROMOTION_DECISIONS.NEEDS_MORE_CONTEXT, 'auditTrail');
  }

  if (!SUPPORTED_FACT_TYPES.includes(candidateFactType)) {
    output.candidateFactType = candidateFactType;
    output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.UNSUPPORTED_FACT_TYPE;
    output.decision = TRUTH_PROMOTION_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_FACT_TYPE']);
    return output;
  }

  if (!SUPPORTED_OWNERS.includes(candidateFactOwner)) {
    output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.UNSUPPORTED_OWNER;
    output.decision = TRUTH_PROMOTION_DECISIONS.NOT_MODELED;
    output.blockedUses = unique([...output.blockedUses, 'UNSUPPORTED_OWNER']);
    return output;
  }

  if (hasConflict(original.conflictReviewSnapshot)) {
    output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.CONFLICT_DETECTED;
    output.decision = TRUTH_PROMOTION_DECISIONS.BLOCK_TRUTH_PROMOTION;
    output.blockedUses = unique([...output.blockedUses, 'CONFLICT_DETECTED']);
    return output;
  }

  if (isExpired(original.expiresAt || original.truthPromotionWindowExpiresAt, original.now)) {
    output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.EXPIRED_TRUTH_PROMOTION_WINDOW;
    output.decision = TRUTH_PROMOTION_DECISIONS.EXPIRED;
    output.blockedUses = unique([...output.blockedUses, 'EXPIRED_TRUTH_PROMOTION_WINDOW']);
    return output;
  }

  output.candidateFactType = candidateFactType;
  output.candidateFactValue = candidateFactValue;
  output.truthPromotionReviewCandidate = {
    candidateFactType,
    candidateFactValue,
    candidateFactOwner,
    candidateFactSource: original.candidateFactSource || auditRecordCandidate.candidateFactSource || null,
    candidateConfidence: hasExplicitValue(original.candidateConfidence) ? original.candidateConfidence : null,
    candidateLimitations: unique([...(asArray(original.candidateLimitations)), ...(asArray(output.limitations))]),
    candidateWarnings: unique([...(asArray(original.candidateWarnings)), ...(asArray(output.warnings))]),
    auditPersistenceRecordCandidate: auditRecordCandidate,
    idempotencyKey,
    evidenceRefs: output.evidenceRefs,
    sourceEvidenceIds: output.sourceEvidenceIds,
    sourceOwners: output.sourceOwners,
    canonicalTruthRegistryRemainsSeparate: true,
    approvedForCanonicalTruthWrite: false,
    writesCanonicalTruth: false,
    createsBusinessTruth: false,
    createsMetricTruth: false,
    createsDeliveryTruth: false,
    createsMessageTruth: false,
  };

  output.eligibleForTruthPromotionReview = true;
  output.approvedForCanonicalTruthWrite = false;
  output.writesCanonicalTruth = false;
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
  output.persistsRecord = false;
  output.providerApiCallAllowed = false;
  output.externalApiCallAllowed = false;
  output.executesAction = false;
  output.sendsMessage = false;

  output.truthPromotionStatus = TRUTH_PROMOTION_STATUSES.APPROVED_FOR_TRUTH_PROMOTION_REVIEW_CANDIDATE;
  output.decision = TRUTH_PROMOTION_DECISIONS.APPROVE_TRUTH_PROMOTION_REVIEW_CANDIDATE;

  return output;
}

module.exports = {
  buildTruthPromotionBoundary,
  TRUTH_PROMOTION_STATUSES,
  TRUTH_PROMOTION_DECISIONS,
  TRUTH_PROMOTION_ALLOWED_USES,
  TRUTH_PROMOTION_FORBIDDEN_USES,
};
