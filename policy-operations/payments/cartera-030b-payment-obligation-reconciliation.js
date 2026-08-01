import { PAYMENT_EVIDENCE_STATES } from '../evidence/payment-evidence-packet.js';
import {
  CARTERA_030B_CONFIRMATION_STATES,
  CARTERA_030B_OBLIGATION_STATES,
} from '../calendar/cartera-030b-recurrence-engine.js';

export const CARTERA_030B_PAYMENT_MATCH_OUTCOMES = Object.freeze({
  MATCHED: 'MATCHED',
  PARTIAL_MATCH: 'PARTIAL_MATCH',
  AMBIGUOUS: 'AMBIGUOUS',
  NO_MATCH: 'NO_MATCH',
  CONFLICT: 'CONFLICT',
  IDEMPOTENT_REPLAY: 'IDEMPOTENT_REPLAY',
});

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function requireReference(value, label) {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (!normalized || normalized.length > 240) {
    throw new TypeError(`${label}_INVALID`);
  }
  return normalized;
}

function optionalDate(value, label) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new TypeError(`${label}_INVALID`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${label}_INVALID`);
  }
  return value;
}

function normalizeAmount(value, label) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new TypeError(`${label}_INVALID`);
  }
  return amount;
}

function normalizePaymentEvent(paymentEvent = {}) {
  if (!paymentEvent || typeof paymentEvent !== 'object' || Array.isArray(paymentEvent)) {
    throw new TypeError('PAYMENT_EVENT_MUST_BE_OBJECT');
  }
  if (paymentEvent.error) {
    throw new TypeError('PAYMENT_EVENT_ERROR_ENVELOPE_FORBIDDEN');
  }
  if (paymentEvent.confirmationState !== PAYMENT_EVIDENCE_STATES.CONFIRMED) {
    return null;
  }
  return Object.freeze({
    paymentEventReference: requireReference(
      paymentEvent.paymentEventReference || paymentEvent.paymentEventId,
      'PAYMENT_EVENT_REFERENCE'
    ),
    advisorId: requireReference(paymentEvent.advisorId, 'PAYMENT_EVENT_ADVISOR_ID'),
    policyReference: requireReference(
      paymentEvent.policyReference || paymentEvent.policyId || paymentEvent.policyNumber,
      'PAYMENT_EVENT_POLICY_REFERENCE'
    ),
    paymentAmount: normalizeAmount(paymentEvent.paymentAmount, 'PAYMENT_AMOUNT'),
    currency: paymentEvent.currency || null,
    paymentDate: optionalDate(paymentEvent.paymentDate, 'PAYMENT_DATE'),
    periodCoveredStart: optionalDate(paymentEvent.periodCoveredStart, 'PERIOD_COVERED_START'),
    periodCoveredEnd: optionalDate(paymentEvent.periodCoveredEnd, 'PERIOD_COVERED_END'),
    confirmationState: paymentEvent.confirmationState,
    evidenceReferences: Object.freeze([...(paymentEvent.evidenceRefs || [])]),
  });
}

function normalizeObligation(obligation = {}) {
  if (!obligation || typeof obligation !== 'object' || Array.isArray(obligation)) {
    throw new TypeError('OBLIGATION_MUST_BE_OBJECT');
  }
  return Object.freeze({
    ...obligation,
    obligationReference: requireReference(obligation.obligationReference, 'OBLIGATION_REFERENCE'),
    advisorId: requireReference(obligation.advisorId, 'OBLIGATION_ADVISOR_ID'),
    policyReference: requireReference(obligation.policyReference, 'OBLIGATION_POLICY_REFERENCE'),
    expectedDate: optionalDate(obligation.expectedDate, 'EXPECTED_DATE'),
    expectedAmount: normalizeAmount(obligation.expectedAmount, 'EXPECTED_AMOUNT'),
    actualAmount: normalizeAmount(obligation.actualAmount, 'ACTUAL_AMOUNT'),
    matchedPaymentEventReferences: Object.freeze([
      ...(obligation.matchedPaymentEventReferences || []),
    ]),
  });
}

function dateEvidenceMatches(obligation, paymentEvent) {
  if (!obligation.expectedDate) {
    return false;
  }
  if (
    paymentEvent.periodCoveredStart
    && paymentEvent.periodCoveredEnd
    && obligation.expectedDate >= paymentEvent.periodCoveredStart
    && obligation.expectedDate <= paymentEvent.periodCoveredEnd
  ) {
    return true;
  }
  return Boolean(paymentEvent.paymentDate && obligation.expectedDate === paymentEvent.paymentDate);
}

function explicitTargets(allocationAuthorization) {
  if (!allocationAuthorization) {
    return null;
  }
  if (
    typeof allocationAuthorization !== 'object'
    || Array.isArray(allocationAuthorization)
    || !Array.isArray(allocationAuthorization.obligationReferences)
  ) {
    throw new TypeError('ALLOCATION_AUTHORIZATION_INVALID');
  }
  return new Set(
    allocationAuthorization.obligationReferences.map(reference =>
      requireReference(reference, 'ALLOCATION_OBLIGATION_REFERENCE')
    )
  );
}

function result(outcome, extra = {}) {
  return Object.freeze({ outcome, ...extra });
}

export function reconcileConfirmedPaymentEvent({
  obligations = [],
  paymentEvent,
  allocationAuthorization = null,
} = {}) {
  if (!Array.isArray(obligations)) {
    throw new TypeError('OBLIGATIONS_MUST_BE_ARRAY');
  }
  const event = normalizePaymentEvent(paymentEvent);
  if (!event) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.NO_MATCH, {
      reason: 'PAYMENT_EVENT_NOT_CONFIRMED',
      transition: null,
    });
  }

  const normalized = obligations.map(normalizeObligation);
  const targets = explicitTargets(allocationAuthorization);
  const ownerPolicyCandidates = normalized.filter(obligation =>
    obligation.advisorId === event.advisorId
    && obligation.policyReference === event.policyReference
    && ![CARTERA_030B_OBLIGATION_STATES.CORRECTED, CARTERA_030B_OBLIGATION_STATES.CANCELLED]
      .includes(obligation.status)
  );

  const existing = ownerPolicyCandidates.find(obligation =>
    obligation.matchedPaymentEventReferences.includes(event.paymentEventReference)
  );
  if (existing) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.IDEMPOTENT_REPLAY, {
      reason: null,
      obligationReference: existing.obligationReference,
      transition: null,
    });
  }

  const candidates = ownerPolicyCandidates.filter(obligation => {
    if (targets) {
      return targets.has(obligation.obligationReference);
    }
    return dateEvidenceMatches(obligation, event);
  });

  if (candidates.length === 0) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.NO_MATCH, {
      reason: 'NO_EXACT_POLICY_DATE_OR_PERIOD_MATCH',
      transition: null,
    });
  }

  if (candidates.length > 1 && !targets) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.AMBIGUOUS, {
      reason: 'MULTIPLE_EXACT_OBLIGATION_CANDIDATES',
      candidateObligationReferences: Object.freeze(
        candidates.map(candidate => candidate.obligationReference).sort()
      ),
      transition: null,
    });
  }

  if (targets && targets.size !== candidates.length) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.CONFLICT, {
      reason: 'ALLOCATION_TARGET_SCOPE_MISMATCH',
      transition: null,
    });
  }

  if (candidates.length !== 1) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.AMBIGUOUS, {
      reason: 'MULTI_OBLIGATION_ALLOCATION_REQUIRES_SEPARATE_COMMAND',
      candidateObligationReferences: Object.freeze(
        candidates.map(candidate => candidate.obligationReference).sort()
      ),
      transition: null,
    });
  }

  const obligation = candidates[0];
  if (
    obligation.currency
    && event.currency
    && obligation.currency !== event.currency
  ) {
    return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.CONFLICT, {
      reason: 'CURRENCY_MISMATCH',
      obligationReference: obligation.obligationReference,
      transition: null,
    });
  }

  const priorActualAmount = obligation.actualAmount || 0;
  const incomingAmount = event.paymentAmount;
  const totalActualAmount = incomingAmount === null
    ? (obligation.actualAmount ?? null)
    : priorActualAmount + incomingAmount;

  let outcome = CARTERA_030B_PAYMENT_MATCH_OUTCOMES.MATCHED;
  let nextStatus = CARTERA_030B_OBLIGATION_STATES.CONFIRMED;

  if (obligation.expectedAmount !== null && totalActualAmount !== null) {
    if (totalActualAmount < obligation.expectedAmount) {
      outcome = CARTERA_030B_PAYMENT_MATCH_OUTCOMES.PARTIAL_MATCH;
      nextStatus = CARTERA_030B_OBLIGATION_STATES.PARTIAL;
    } else if (totalActualAmount > obligation.expectedAmount) {
      return result(CARTERA_030B_PAYMENT_MATCH_OUTCOMES.CONFLICT, {
        reason: 'PAYMENT_AMOUNT_EXCEEDS_SINGLE_OBLIGATION',
        obligationReference: obligation.obligationReference,
        transition: null,
      });
    }
  }

  const transition = Object.freeze({
    obligationReference: obligation.obligationReference,
    expectedStateVersion: obligation.stateVersion,
    fromStatus: obligation.status,
    toStatus: nextStatus,
    paymentEventReference: event.paymentEventReference,
    actualDate: event.paymentDate,
    actualAmount: totalActualAmount,
    currency: event.currency || obligation.currency || null,
    confirmationState: CARTERA_030B_CONFIRMATION_STATES.PAYMENT_CONFIRMED,
    evidenceReferences: event.evidenceReferences,
    reasonCode: outcome,
  });

  return result(outcome, {
    reason: null,
    obligationReference: obligation.obligationReference,
    transition,
  });
}
