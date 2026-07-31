export const CARTERA_020C_REVIEW_STATES = Object.freeze({
  PENDING_REVIEW: 'PENDING_REVIEW',
  BLOCKED: 'BLOCKED',
  READY_TO_CONFIRM: 'READY_TO_CONFIRM',
  REJECTED: 'REJECTED',
  CONFIRMED: 'CONFIRMED',
});

export const CARTERA_020C_IDENTITY_OUTCOMES = Object.freeze({
  LINK_CONFIRMED: 'LINK_CONFIRMED',
  CREATE_CONFIRMED: 'CREATE_CONFIRMED',
  UNRESOLVED: 'UNRESOLVED',
  REJECTED_MATCH: 'REJECTED_MATCH',
  CONFLICT: 'CONFLICT',
  CORRECTED: 'CORRECTED',
});

export const CARTERA_020C_POLICY_DECISIONS = Object.freeze({
  CREATE_NEW: 'CREATE_NEW',
  UPDATE_EXISTING: 'UPDATE_EXISTING',
  BLOCK_AS_DUPLICATE: 'BLOCK_AS_DUPLICATE',
  UNRESOLVED: 'UNRESOLVED',
});

const PENDING_PACKET_STATES = new Set(['pending_confirmation', 'PENDING_CONFIRMATION']);
const RESTRICTED_ROLE_TYPES = new Set(['BENEFICIARY']);
const RESOLVED_IDENTITY_OUTCOMES = new Set([
  CARTERA_020C_IDENTITY_OUTCOMES.LINK_CONFIRMED,
  CARTERA_020C_IDENTITY_OUTCOMES.CREATE_CONFIRMED,
  CARTERA_020C_IDENTITY_OUTCOMES.CORRECTED,
]);
const ALLOWED_IDENTITY_OUTCOMES = new Set(Object.values(CARTERA_020C_IDENTITY_OUTCOMES));
const ALLOWED_POLICY_DECISIONS = new Set(Object.values(CARTERA_020C_POLICY_DECISIONS));

function requireReference(value, fieldName) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/.test(value)) {
    throw new TypeError(`invalid_${fieldName}`);
  }
  return value;
}

function requireArray(value, fieldName) {
  if (!Array.isArray(value)) throw new TypeError(`${fieldName}_must_be_array`);
  return value;
}

function ensureCandidateBoundary(candidate, fieldName) {
  if (!candidate || typeof candidate !== 'object' || candidate.createsTruth !== false) {
    throw new TypeError(`invalid_${fieldName}_candidate`);
  }
  return candidate;
}

function uniqueReferences(items, referenceField, fieldName) {
  const seen = new Set();
  for (const item of items) {
    const reference = requireReference(item[referenceField], `${fieldName}_reference`);
    if (seen.has(reference)) throw new TypeError(`duplicate_${fieldName}_reference`);
    seen.add(reference);
  }
}

function freezeReview(review) {
  for (const value of Object.values(review)) {
    if (Array.isArray(value)) Object.freeze(value);
  }
  return Object.freeze(review);
}

function packetReference(packet = {}) {
  return packet.packetReference || packet.evidenceId || null;
}

function sourceReference(packet = {}) {
  return packet.documentReference || packet.documentRef || packet.sourceReference || null;
}

export function createIdentityPolicyConfirmationReview({
  reviewReference,
  advisorId,
  actorReference,
  packet,
  identityCandidates = [],
  accountCandidates = [],
  policyRoleCandidates = [],
  duplicatePolicyCandidates = [],
  missingEvidence = [],
  lowConfidenceFields = [],
  sensitiveFields = [],
  createdAt = new Date().toISOString(),
} = {}) {
  requireReference(reviewReference, 'review_reference');
  requireReference(advisorId, 'advisor_id');
  requireReference(actorReference, 'actor_reference');
  if (advisorId !== actorReference) throw new TypeError('review_owner_mismatch');
  if (!packet || typeof packet !== 'object') throw new TypeError('packet_required');
  if (!PENDING_PACKET_STATES.has(packet.confirmationState)) {
    throw new TypeError('packet_not_pending_confirmation');
  }
  if (packet.createsTruth !== false || packet.canInvokeConfirmedPolicyCommand !== false) {
    throw new TypeError('packet_truth_boundary_invalid');
  }

  const normalizedIdentityCandidates = requireArray(identityCandidates, 'identity_candidates')
    .map((candidate) => Object.freeze({ ...ensureCandidateBoundary(candidate, 'identity') }));
  const normalizedAccountCandidates = requireArray(accountCandidates, 'account_candidates')
    .map((candidate) => Object.freeze({ ...ensureCandidateBoundary(candidate, 'account') }));
  const normalizedRoleCandidates = requireArray(policyRoleCandidates, 'policy_role_candidates')
    .map((candidate) => {
      ensureCandidateBoundary(candidate, 'policy_role');
      requireReference(candidate.candidateReference, 'policy_role_candidate_reference');
      requireReference(candidate.roleType, 'policy_role_type');
      const restricted = RESTRICTED_ROLE_TYPES.has(candidate.roleType);
      if (restricted && candidate.visibilityScope !== 'RESTRICTED') {
        throw new TypeError('restricted_role_visibility_required');
      }
      return Object.freeze({ ...candidate, restricted });
    });
  const normalizedDuplicateCandidates = requireArray(duplicatePolicyCandidates, 'duplicate_policy_candidates')
    .map((candidate) => Object.freeze({ ...ensureCandidateBoundary(candidate, 'duplicate_policy') }));

  uniqueReferences(normalizedIdentityCandidates, 'candidateReference', 'identity_candidate');
  uniqueReferences(normalizedRoleCandidates, 'candidateReference', 'policy_role_candidate');

  const blockers = [];
  if (missingEvidence.length > 0) blockers.push('MISSING_EVIDENCE');
  if (lowConfidenceFields.length > 0) blockers.push('LOW_CONFIDENCE_FIELDS');
  if (sensitiveFields.length > 0) blockers.push('SENSITIVE_FIELDS_REQUIRE_REVIEW');
  if (normalizedIdentityCandidates.length === 0) blockers.push('IDENTITY_REVIEW_REQUIRED');
  if (normalizedRoleCandidates.length === 0) blockers.push('POLICY_ROLE_REVIEW_REQUIRED');

  return freezeReview({
    contractType: 'FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW',
    contractVersion: 'CARTERA-020C.1',
    reviewReference,
    advisorId,
    actorReference,
    packetReference: requireReference(packetReference(packet), 'packet_reference'),
    sourceReference: requireReference(sourceReference(packet), 'source_reference'),
    packetConfirmationState: packet.confirmationState,
    identityCandidates: normalizedIdentityCandidates,
    accountCandidates: normalizedAccountCandidates,
    policyRoleCandidates: normalizedRoleCandidates,
    duplicatePolicyCandidates: normalizedDuplicateCandidates,
    missingEvidence: Object.freeze([...missingEvidence]),
    lowConfidenceFields: Object.freeze([...lowConfidenceFields]),
    sensitiveFields: Object.freeze([...sensitiveFields]),
    blockers: Object.freeze(blockers),
    state: blockers.length > 0
      ? CARTERA_020C_REVIEW_STATES.BLOCKED
      : CARTERA_020C_REVIEW_STATES.PENDING_REVIEW,
    createdAt,
    createsTruth: false,
    invokesRemoteCommand: false,
    canInvokeConfirmedPolicyCommand: false,
  });
}

export function prepareIdentityPolicyConfirmationPlan({
  review,
  identityDecisions = [],
  policyRoleDecisions = [],
  duplicatePolicyDecision,
  confirmedPolicyCommand,
  confirmedAt = new Date().toISOString(),
} = {}) {
  if (!review || review.contractType !== 'FORGE_IDENTITY_POLICY_CONFIRMATION_REVIEW') {
    throw new TypeError('review_contract_required');
  }
  if (review.state === CARTERA_020C_REVIEW_STATES.BLOCKED || review.blockers.length > 0) {
    throw new TypeError('review_blocked');
  }
  if (!Array.isArray(identityDecisions) || identityDecisions.length !== review.identityCandidates.length) {
    throw new TypeError('identity_decisions_incomplete');
  }
  if (!Array.isArray(policyRoleDecisions) || policyRoleDecisions.length !== review.policyRoleCandidates.length) {
    throw new TypeError('policy_role_decisions_incomplete');
  }
  if (!duplicatePolicyDecision || !ALLOWED_POLICY_DECISIONS.has(duplicatePolicyDecision.outcome)) {
    throw new TypeError('duplicate_policy_decision_required');
  }
  if (duplicatePolicyDecision.outcome === CARTERA_020C_POLICY_DECISIONS.UNRESOLVED) {
    throw new TypeError('duplicate_policy_unresolved');
  }

  const candidateReferences = new Set(review.identityCandidates.map((item) => item.candidateReference));
  const identityCommands = identityDecisions.map((decision) => {
    if (!candidateReferences.has(decision.candidateReference)) {
      throw new TypeError('identity_decision_candidate_mismatch');
    }
    if (!ALLOWED_IDENTITY_OUTCOMES.has(decision.outcome)) {
      throw new TypeError('identity_decision_outcome_invalid');
    }
    if (!RESOLVED_IDENTITY_OUTCOMES.has(decision.outcome)) {
      throw new TypeError('identity_decision_not_resolved');
    }
    if (!decision.command || decision.command.contractType !== 'FORGE_IDENTITY_RESOLUTION_COMMAND') {
      throw new TypeError('identity_resolution_command_required');
    }
    return Object.freeze({ ...decision.command });
  });

  const roleCandidateReferences = new Set(review.policyRoleCandidates.map((item) => item.candidateReference));
  for (const decision of policyRoleDecisions) {
    if (!roleCandidateReferences.has(decision.candidateReference)) {
      throw new TypeError('policy_role_decision_candidate_mismatch');
    }
    if (decision.confirmationState !== 'CONFIRMED') {
      throw new TypeError('policy_role_not_confirmed');
    }
    const candidate = review.policyRoleCandidates.find((item) => item.candidateReference === decision.candidateReference);
    if (candidate.restricted && decision.visibilityScope !== 'RESTRICTED') {
      throw new TypeError('restricted_role_confirmation_invalid');
    }
  }

  if (!confirmedPolicyCommand || confirmedPolicyCommand.contractType !== 'FORGE_CONFIRMED_POLICY_COMMAND') {
    throw new TypeError('confirmed_policy_command_required');
  }
  if (confirmedPolicyCommand.advisorId !== review.advisorId
      || confirmedPolicyCommand.actorReference !== review.actorReference) {
    throw new TypeError('confirmed_policy_command_owner_mismatch');
  }

  return Object.freeze({
    contractType: 'FORGE_IDENTITY_POLICY_CONFIRMATION_PLAN',
    contractVersion: 'CARTERA-020C.1',
    reviewReference: review.reviewReference,
    advisorId: review.advisorId,
    actorReference: review.actorReference,
    packetReference: review.packetReference,
    state: CARTERA_020C_REVIEW_STATES.READY_TO_CONFIRM,
    identityCommands: Object.freeze(identityCommands),
    policyRoleDecisions: Object.freeze(policyRoleDecisions.map((decision) => Object.freeze({ ...decision }))),
    duplicatePolicyDecision: Object.freeze({ ...duplicatePolicyDecision }),
    confirmedPolicyCommand: Object.freeze({ ...confirmedPolicyCommand }),
    invocationOrder: Object.freeze(['IDENTITY_RESOLUTION', 'CONFIRMED_POLICY']),
    confirmedAt,
    createsTruth: false,
    invokesRemoteCommand: false,
    requiresExplicitExecution: true,
  });
}

export function generalPolicyRoleReviewProjection(review = {}) {
  if (!Array.isArray(review.policyRoleCandidates)) return [];
  return Object.freeze(
    review.policyRoleCandidates
      .filter((candidate) => !candidate.restricted)
      .map((candidate) => Object.freeze({
        candidateReference: candidate.candidateReference,
        roleType: candidate.roleType,
        participantState: candidate.participantState || 'UNRESOLVED',
      }))
  );
}
