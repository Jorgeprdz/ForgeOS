const REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/-]{0,239}$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const STATES = Object.freeze({
  RECEIVED: 'received',
  NORMALIZED: 'normalized',
  MATCH_PENDING: 'match_pending',
  MATCHED: 'matched',
  REVIEW_REQUIRED: 'review_required',
  INFORMATION_REQUESTED: 'information_requested',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  SUPERSEDED: 'superseded',
});

const DECISIONS = new Set([
  'confirm',
  'reject',
  'request_information',
  'correct_match',
  'duplicate',
]);

const PAYMENT_SOURCE_TYPES = new Set([
  'policy_receipt',
  'payment_proof',
  'bank_proof',
  'carrier_statement',
  'manual_capture',
  'integration',
]);

function fail(code) {
  const error = new Error(code);
  error.code = code;
  throw error;
}

function requiredString(value, code) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized) fail(code);
  return normalized;
}

function requiredReference(value, code) {
  const normalized = requiredString(value, code);
  if (!REFERENCE_PATTERN.test(normalized)) fail(code);
  return normalized;
}

function optionalReference(value, code) {
  if (value === null || value === undefined || value === '') return null;
  return requiredReference(value, code);
}

function optionalMoney(value) {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) fail('CARTERA080_CLAIMED_AMOUNT_INVALID');
  return amount;
}

function optionalConfidence(value) {
  if (value === null || value === undefined || value === '') return null;
  const confidence = Number(value);
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    fail('CARTERA080_CONFIDENCE_INVALID');
  }
  return confidence;
}

function optionalCurrency(value) {
  if (value === null || value === undefined || value === '') return null;
  const currency = String(value).trim().toUpperCase();
  if (!CURRENCY_PATTERN.test(currency)) fail('CARTERA080_CURRENCY_INVALID');
  return currency;
}

function optionalDate(value, code) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) fail(code);
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(code);
  return value;
}

function requiredInstant(value, code) {
  const normalized = requiredString(value, code);
  const parsed = new Date(normalized);
  if (!Number.isFinite(parsed.getTime()) || !normalized.includes('T')) fail(code);
  return normalized;
}

function stringList(value, code) {
  if (value === null || value === undefined) return Object.freeze([]);
  if (!Array.isArray(value)) fail(code);
  return Object.freeze(value.map(item => requiredString(item, code)));
}

function referenceList(value, code) {
  if (value === null || value === undefined) return Object.freeze([]);
  if (!Array.isArray(value)) fail(code);
  return Object.freeze(value.map(item => requiredReference(item, code)));
}

function normalizeCandidate(candidate, kind) {
  if (typeof candidate === 'string') {
    return Object.freeze({
      reference: requiredReference(candidate, `CARTERA080_${kind}_REFERENCE_INVALID`),
      confidence: null,
      reasons: Object.freeze([]),
    });
  }
  if (!candidate || typeof candidate !== 'object') fail(`CARTERA080_${kind}_CANDIDATE_INVALID`);
  return Object.freeze({
    reference: requiredReference(candidate.reference, `CARTERA080_${kind}_REFERENCE_INVALID`),
    confidence: optionalConfidence(candidate.confidence),
    reasons: stringList(candidate.reasons, `CARTERA080_${kind}_REASONS_INVALID`),
  });
}

function candidateList(value, kind) {
  if (value === null || value === undefined) return Object.freeze([]);
  if (!Array.isArray(value)) fail(`CARTERA080_${kind}_CANDIDATES_INVALID`);
  return Object.freeze(value.map(candidate => normalizeCandidate(candidate, kind)));
}

function containsCandidate(candidates, reference) {
  return candidates.some(candidate => candidate.reference === reference);
}

function normalizeSelectedMatch(value, requiredForDecision = false) {
  if (!value) {
    if (requiredForDecision) fail('CARTERA080_SELECTED_MATCH_REQUIRED');
    return null;
  }
  return Object.freeze({
    personReference: requiredReference(value.personReference, 'CARTERA080_PERSON_REFERENCE_REQUIRED'),
    policyReference: requiredReference(value.policyReference, 'CARTERA080_POLICY_REFERENCE_REQUIRED'),
    obligationReference: requiredReference(value.obligationReference, 'CARTERA080_OBLIGATION_REFERENCE_REQUIRED'),
  });
}

function resultingStatus(decision) {
  if (decision === 'confirm') return STATES.CONFIRMED;
  if (decision === 'duplicate') return STATES.SUPERSEDED;
  if (decision === 'request_information') return STATES.INFORMATION_REQUESTED;
  if (decision === 'correct_match') return STATES.REVIEW_REQUIRED;
  return STATES.REJECTED;
}

export function createEconomicEvidenceCandidate(input = {}) {
  const claimedAmount = optionalMoney(input.claimedAmount);
  const claimedCurrency = optionalCurrency(input.claimedCurrency);
  if (claimedAmount !== null && claimedCurrency === null) fail('CARTERA080_CURRENCY_REQUIRED_FOR_AMOUNT');

  const periodStart = optionalDate(input.periodStart, 'CARTERA080_PERIOD_START_INVALID');
  const periodEnd = optionalDate(input.periodEnd, 'CARTERA080_PERIOD_END_INVALID');
  if (periodStart && periodEnd && periodStart > periodEnd) fail('CARTERA080_PERIOD_INVALID');

  return Object.freeze({
    evidenceId: requiredReference(input.evidenceId, 'CARTERA080_EVIDENCE_ID_REQUIRED'),
    sourceType: requiredReference(input.sourceType, 'CARTERA080_SOURCE_TYPE_REQUIRED'),
    sourceProvider: optionalReference(input.sourceProvider, 'CARTERA080_SOURCE_PROVIDER_INVALID'),
    externalReference: optionalReference(input.externalReference, 'CARTERA080_EXTERNAL_REFERENCE_INVALID'),
    receivedAt: requiredInstant(input.receivedAt, 'CARTERA080_RECEIVED_AT_REQUIRED'),
    observedAt: input.observedAt ? requiredInstant(input.observedAt, 'CARTERA080_OBSERVED_AT_INVALID') : null,
    senderIdentity: input.senderIdentity ? String(input.senderIdentity).trim() : null,
    subjectOrLabel: input.subjectOrLabel ? String(input.subjectOrLabel).trim() : null,
    textualExcerpt: input.textualExcerpt ? String(input.textualExcerpt).trim() : null,
    attachmentReferences: referenceList(
      input.attachmentReferences,
      'CARTERA080_ATTACHMENT_REFERENCE_INVALID'
    ),
    claimedAmount,
    claimedCurrency,
    claimedPaymentDate: optionalDate(input.claimedPaymentDate, 'CARTERA080_PAYMENT_DATE_INVALID'),
    claimedPolicyReference: optionalReference(
      input.claimedPolicyReference,
      'CARTERA080_CLAIMED_POLICY_REFERENCE_INVALID'
    ),
    claimedPersonReference: optionalReference(
      input.claimedPersonReference,
      'CARTERA080_CLAIMED_PERSON_REFERENCE_INVALID'
    ),
    evidenceHash: requiredReference(input.evidenceHash, 'CARTERA080_EVIDENCE_HASH_REQUIRED'),
    ingestionMethod: requiredReference(input.ingestionMethod, 'CARTERA080_INGESTION_METHOD_REQUIRED'),
    confidence: optionalConfidence(input.confidence),
    snapshotReference: optionalReference(input.snapshotReference, 'CARTERA080_SNAPSHOT_REFERENCE_INVALID'),
    ruleReference: optionalReference(input.ruleReference, 'CARTERA080_RULE_REFERENCE_INVALID'),
    periodStart,
    periodEnd,
    assumptions: stringList(input.assumptions, 'CARTERA080_ASSUMPTIONS_INVALID'),
    uncertainty: input.uncertainty ? String(input.uncertainty).trim() : null,
    limits: stringList(input.limits, 'CARTERA080_LIMITS_INVALID'),
    status: STATES.RECEIVED,
    truthClass: 'claim',
    economicState: 'provisional',
  });
}

export function proposeEconomicMatch({
  evidence,
  personCandidates = [],
  policyCandidates = [],
  obligationCandidates = [],
  signals = [],
  contradictions = [],
  confidence = null,
} = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');

  const people = candidateList(personCandidates, 'PERSON');
  const policies = candidateList(policyCandidates, 'POLICY');
  const obligations = candidateList(obligationCandidates, 'OBLIGATION');
  const normalizedSignals = stringList(signals, 'CARTERA080_SIGNALS_INVALID');
  const normalizedContradictions = stringList(contradictions, 'CARTERA080_CONTRADICTIONS_INVALID');

  const missingFields = [];
  if (evidence.claimedAmount === null) missingFields.push('claimed_amount');
  if (evidence.claimedCurrency === null) missingFields.push('claimed_currency');
  if (evidence.claimedPaymentDate === null) missingFields.push('claimed_payment_date');
  if (people.length === 0) missingFields.push('person_match');
  if (policies.length === 0) missingFields.push('policy_match');
  if (obligations.length === 0) missingFields.push('obligation_match');

  const ambiguous = people.length !== 1 || policies.length !== 1 || obligations.length !== 1;
  const requiresReview = ambiguous || normalizedContradictions.length > 0 || missingFields.length > 0;

  return Object.freeze({
    evidenceId: evidence.evidenceId,
    evidenceHash: evidence.evidenceHash,
    personCandidates: people,
    policyCandidates: policies,
    obligationCandidates: obligations,
    signals: normalizedSignals,
    contradictions: normalizedContradictions,
    missingFields: Object.freeze(missingFields),
    confidence: optionalConfidence(confidence),
    status: requiresReview ? STATES.REVIEW_REQUIRED : STATES.MATCHED,
    requiresHumanDecision: true,
    automaticConfirmationAllowed: false,
  });
}

export function recordEconomicDecision({
  evidence,
  proposal,
  actorId,
  decision,
  reason,
  selectedMatch = null,
  decidedAt,
  idempotencyKey,
  correlationId,
} = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  if (!proposal || proposal.evidenceId !== evidence.evidenceId || proposal.evidenceHash !== evidence.evidenceHash) {
    fail('CARTERA080_MATCH_PROPOSAL_REQUIRED');
  }
  if (!DECISIONS.has(decision)) fail('CARTERA080_DECISION_INVALID');

  const needsMatch = decision === 'confirm' || decision === 'correct_match';
  const normalizedMatch = normalizeSelectedMatch(selectedMatch, needsMatch);

  if (decision === 'confirm') {
    if (!containsCandidate(proposal.personCandidates, normalizedMatch.personReference)) {
      fail('CARTERA080_SELECTED_PERSON_NOT_PROPOSED');
    }
    if (!containsCandidate(proposal.policyCandidates, normalizedMatch.policyReference)) {
      fail('CARTERA080_SELECTED_POLICY_NOT_PROPOSED');
    }
    if (!containsCandidate(proposal.obligationCandidates, normalizedMatch.obligationReference)) {
      fail('CARTERA080_SELECTED_OBLIGATION_NOT_PROPOSED');
    }
  }

  const normalizedActorId = requiredReference(actorId, 'CARTERA080_ACTOR_REQUIRED');
  const normalizedReason = requiredString(reason, 'CARTERA080_REASON_REQUIRED');
  const normalizedDecidedAt = requiredInstant(decidedAt, 'CARTERA080_DECIDED_AT_REQUIRED');
  const normalizedIdempotencyKey = requiredReference(
    idempotencyKey,
    'CARTERA080_IDEMPOTENCY_KEY_REQUIRED'
  );
  const normalizedCorrelationId = requiredReference(
    correlationId,
    'CARTERA080_CORRELATION_ID_REQUIRED'
  );

  return Object.freeze({
    decisionId: `${normalizedCorrelationId}:${normalizedIdempotencyKey}`,
    receiptType: 'economic_human_decision',
    receiptState: 'recorded',
    evidenceId: evidence.evidenceId,
    evidenceHash: evidence.evidenceHash,
    actorId: normalizedActorId,
    decision,
    reason: normalizedReason,
    selectedMatch: normalizedMatch,
    decidedAt: normalizedDecidedAt,
    idempotencyKey: normalizedIdempotencyKey,
    correlationId: normalizedCorrelationId,
    authority: 'human_decision',
    authorizationBasis: 'human_decision_receipt',
    resultingStatus: resultingStatus(decision),
  });
}

export function composeConfirmedPaymentCommand({ evidence, decision } = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');
  if (
    !decision ||
    decision.decision !== 'confirm' ||
    decision.authority !== 'human_decision' ||
    decision.receiptType !== 'economic_human_decision' ||
    decision.receiptState !== 'recorded'
  ) {
    fail('CARTERA080_HUMAN_CONFIRMATION_REQUIRED');
  }
  if (decision.evidenceId !== evidence.evidenceId || decision.evidenceHash !== evidence.evidenceHash) {
    fail('CARTERA080_DECISION_EVIDENCE_MISMATCH');
  }
  if (!PAYMENT_SOURCE_TYPES.has(evidence.sourceType)) fail('CARTERA080_PAYMENT_SOURCE_NOT_SUPPORTED');
  if (evidence.claimedAmount === null) fail('CARTERA080_PAYMENT_AMOUNT_REQUIRED');
  if (evidence.claimedCurrency === null) fail('CARTERA080_PAYMENT_CURRENCY_REQUIRED');
  if (evidence.claimedPaymentDate === null) fail('CARTERA080_PAYMENT_DATE_REQUIRED');

  return Object.freeze({
    paymentEvidenceReference: evidence.evidenceId,
    policyReference: requiredReference(
      decision.selectedMatch?.policyReference,
      'CARTERA080_POLICY_REFERENCE_REQUIRED'
    ),
    obligationReference: requiredReference(
      decision.selectedMatch?.obligationReference,
      'CARTERA080_OBLIGATION_REFERENCE_REQUIRED'
    ),
    personReference: requiredReference(
      decision.selectedMatch?.personReference,
      'CARTERA080_PERSON_REFERENCE_REQUIRED'
    ),
    paymentAmount: evidence.claimedAmount,
    currency: evidence.claimedCurrency,
    paymentDate: evidence.claimedPaymentDate,
    periodCoveredStart: evidence.periodStart,
    periodCoveredEnd: evidence.periodEnd,
    paymentSource: evidence.sourceType,
    evidenceReferences: Object.freeze([
      evidence.evidenceId,
      ...evidence.attachmentReferences,
    ]),
    confirmationState: 'confirmed',
    humanDecisionReceipt: Object.freeze({
      decisionId: decision.decisionId,
      actorId: decision.actorId,
      decidedAt: decision.decidedAt,
      reason: decision.reason,
      evidenceHash: decision.evidenceHash,
      authorizationBasis: decision.authorizationBasis,
    }),
    idempotencyKey: decision.idempotencyKey,
    correlationId: decision.correlationId,
    canonicalAuthority: 'policy_payment_reconciliation_030c',
    commissionCalculationRequested: false,
  });
}

export function projectEconomicConnectionInbox({
  evidence,
  proposal = null,
  decision = null,
  handoff = null,
} = {}) {
  if (!evidence || evidence.truthClass !== 'claim') fail('CARTERA080_EVIDENCE_CANDIDATE_REQUIRED');

  const status = handoff?.status || decision?.resultingStatus || proposal?.status || evidence.status;
  const allowedActions = [];
  if (!decision && proposal) {
    allowedActions.push('review', 'request_information', 'correct_match', 'reject');
    if (proposal.personCandidates.length && proposal.policyCandidates.length && proposal.obligationCandidates.length) {
      allowedActions.push('confirm');
    }
  }

  return Object.freeze({
    evidenceId: evidence.evidenceId,
    status,
    evidenceClaim: Object.freeze({
      amount: evidence.claimedAmount,
      currency: evidence.claimedCurrency,
      paymentDate: evidence.claimedPaymentDate,
      policyReference: evidence.claimedPolicyReference,
      sourceType: evidence.sourceType,
      sourceProvider: evidence.sourceProvider,
      truthClass: evidence.truthClass,
    }),
    systemKnowledge: proposal
      ? Object.freeze({
          status: proposal.status,
          confidence: proposal.confidence,
          contradictions: proposal.contradictions,
          missingFields: proposal.missingFields,
        })
      : null,
    humanDecision: decision || null,
    canonicalHandoff: handoff || null,
    truthOwner: handoff
      ? handoff.truthOwner
      : decision?.decision === 'confirm'
        ? 'pending_policy_payment_reconciliation'
        : 'none',
    allowedActions: Object.freeze(allowedActions),
    projectionOnly: true,
    ledgerMutationAllowed: false,
    commissionCalculationAllowed: false,
    automaticContactAllowed: false,
  });
}

export const CARTERA_080_STATES = STATES;
export const CARTERA_080_PAYMENT_SOURCE_TYPES = Object.freeze([...PAYMENT_SOURCE_TYPES]);
