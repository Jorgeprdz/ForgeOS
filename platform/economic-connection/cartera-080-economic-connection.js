const STATES = Object.freeze({
  RECEIVED: 'received',
  NORMALIZED: 'normalized',
  MATCH_PENDING: 'match_pending',
  MATCHED: 'matched',
  REVIEW_REQUIRED: 'review_required',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  SUPERSEDED: 'superseded',
});

const DECISIONS = new Set(['confirm', 'reject', 'request_information', 'correct_match', 'duplicate']);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function required(value, code) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(code);
  return normalized;
}

function optionalMoney(value) {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) fail('CARTERA080_CLAIMED_AMOUNT_INVALID');
  return amount;
}

export function createEconomicEvidenceCandidate(input = {}) {
  return Object.freeze({
    evidenceId: required(input.evidenceId, 'CARTERA080_EVIDENCE_ID_REQUIRED'),
    sourceType: required(input.sourceType, 'CARTERA080_SOURCE_TYPE_REQUIRED'),
    sourceProvider: input.sourceProvider ? String(input.sourceProvider).trim() : null,
    externalReference: input.externalReference ? String(input.externalReference).trim() : null,
    receivedAt: required(input.receivedAt, 'CARTERA080_RECEIVED_AT_REQUIRED'),
    observedAt: input.observedAt || null,
    senderIdentity: input.senderIdentity || null,
    subjectOrLabel: input.subjectOrLabel || null,
    textualExcerpt: input.textualExcerpt || null,
    attachmentReferences: Object.freeze([...(input.attachmentReferences || [])]),
    claimedAmount: optionalMoney(input.claimedAmount),
    claimedCurrency: input.claimedCurrency ? String(input.claimedCurrency).trim().toUpperCase() : null,
    claimedPaymentDate: input.claimedPaymentDate || null,
    claimedPolicyReference: input.claimedPolicyReference || null,
    claimedPersonReference: input.claimedPersonReference || null,
    evidenceHash: required(input.evidenceHash, 'CARTERA080_EVIDENCE_HASH_REQUIRED'),
    ingestionMethod: required(input.ingestionMethod, 'CARTERA080_INGESTION_METHOD_REQUIRED'),
    confidence: input.confidence == null ? null : Number(input.confidence),
    status: STATES.RECEIVED,
    truthClass: 'claim',
  });
}

export function proposeEconomicMatch({ evidence, personCandidates = [], policyCandidates = [], obligationCandidates = [], signals = [], contradictions = [] } = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  const ambiguous = personCandidates.length !== 1 || policyCandidates.length !== 1 || obligationCandidates.length !== 1;
  const requiresReview = ambiguous || contradictions.length > 0;
  return Object.freeze({
    evidenceId: evidence.evidenceId,
    personCandidates: Object.freeze([...personCandidates]),
    policyCandidates: Object.freeze([...policyCandidates]),
    obligationCandidates: Object.freeze([...obligationCandidates]),
    signals: Object.freeze([...signals]),
    contradictions: Object.freeze([...contradictions]),
    status: requiresReview ? STATES.REVIEW_REQUIRED : STATES.MATCHED,
    requiresHumanDecision: true,
  });
}

export function recordEconomicDecision({ evidence, proposal, actorId, decision, reason, selectedMatch = null, decidedAt, idempotencyKey, correlationId } = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  if (!proposal || proposal.evidenceId !== evidence.evidenceId) fail('CARTERA080_MATCH_PROPOSAL_REQUIRED');
  if (!DECISIONS.has(decision)) fail('CARTERA080_DECISION_INVALID');
  if (decision === 'confirm' && !selectedMatch) fail('CARTERA080_SELECTED_MATCH_REQUIRED');

  return Object.freeze({
    evidenceId: evidence.evidenceId,
    actorId: required(actorId, 'CARTERA080_ACTOR_REQUIRED'),
    decision,
    reason: required(reason, 'CARTERA080_REASON_REQUIRED'),
    selectedMatch,
    decidedAt: required(decidedAt, 'CARTERA080_DECIDED_AT_REQUIRED'),
    idempotencyKey: required(idempotencyKey, 'CARTERA080_IDEMPOTENCY_KEY_REQUIRED'),
    correlationId: required(correlationId, 'CARTERA080_CORRELATION_ID_REQUIRED'),
    authority: 'human_decision',
    resultingStatus: decision === 'confirm' ? STATES.CONFIRMED : decision === 'duplicate' ? STATES.SUPERSEDED : STATES.REJECTED,
  });
}

export function composeConfirmedPaymentCommand({ evidence, decision } = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  if (!decision || decision.decision !== 'confirm' || decision.authority !== 'human_decision') {
    fail('CARTERA080_HUMAN_CONFIRMATION_REQUIRED');
  }
  return Object.freeze({
    paymentEvidenceReference: evidence.evidenceId,
    policyReference: required(decision.selectedMatch?.policyReference, 'CARTERA080_POLICY_REFERENCE_REQUIRED'),
    obligationReference: required(decision.selectedMatch?.obligationReference, 'CARTERA080_OBLIGATION_REFERENCE_REQUIRED'),
    paymentAmount: evidence.claimedAmount,
    currency: evidence.claimedCurrency,
    paymentDate: evidence.claimedPaymentDate,
    paymentSource: evidence.sourceType,
    evidenceReferences: Object.freeze([evidence.evidenceId, ...(evidence.attachmentReferences || [])]),
    confirmationState: 'confirmed',
    humanDecision: Object.freeze({
      actorId: decision.actorId,
      decidedAt: decision.decidedAt,
      reason: decision.reason,
    }),
    idempotencyKey: decision.idempotencyKey,
    correlationId: decision.correlationId,
  });
}

export function projectEconomicConnectionInbox({ evidence, proposal = null, decision = null, handoff = null } = {}) {
  if (!evidence) fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  return Object.freeze({
    evidenceId: evidence.evidenceId,
    evidenceClaim: Object.freeze({
      amount: evidence.claimedAmount,
      currency: evidence.claimedCurrency,
      paymentDate: evidence.claimedPaymentDate,
      policyReference: evidence.claimedPolicyReference,
    }),
    systemKnowledge: proposal ? Object.freeze({ status: proposal.status, contradictions: proposal.contradictions }) : null,
    humanDecision: decision || null,
    canonicalHandoff: handoff || null,
    truthOwner: handoff ? 'FES' : decision?.decision === 'confirm' ? 'pending_fes_handoff' : 'none',
    projectionOnly: true,
    commissionCalculationAllowed: false,
  });
}

export const CARTERA_080_STATES = STATES;
