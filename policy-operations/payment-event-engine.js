import {
  ECONOMIC_EVENT_STATUSES,
  ECONOMIC_EVENT_TRUST_LEVELS,
  createEconomicEventStatus,
} from '../revenue/economic-events/economic-event-status.js';

import { PAYMENT_EVIDENCE_STATES } from './evidence/payment-evidence-packet.js';
import { COMMISSION_STATEMENT_EVIDENCE_STATES } from './evidence/commission-statement-evidence-packet.js';

function hasAmount(value) {
  return value !== null && value !== undefined && Number(value) > 0;
}

function blockedStatus(status, explanation, evidenceRefs = []) {
  return createEconomicEventStatus({
    status,
    trustLevel: ECONOMIC_EVENT_TRUST_LEVELS.BLOCKED,
    sourceState: 'blocked',
    evidenceRefs,
    explanation,
  });
}

export function createPaymentEvent(confirmedPayment = {}) {
  const evidenceRefs = confirmedPayment.evidenceRefs || [];
  const warnings = [];

  if (confirmedPayment.confirmationState !== PAYMENT_EVIDENCE_STATES.CONFIRMED) {
    return {
      error: true,
      reason: 'PAYMENT_NOT_CONFIRMED',
      economicEventStatus: blockedStatus(
        ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT,
        'Payment evidence must be confirmed before creating a PaymentEvent.',
        evidenceRefs
      ),
      warnings: ['PaymentEvent requires confirmed payment operational data.'],
    };
  }

  if (!hasAmount(confirmedPayment.paymentAmount)) {
    return {
      error: true,
      reason: 'MISSING_PAYMENT_AMOUNT',
      economicEventStatus: blockedStatus(
        ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT,
        'Missing paymentAmount blocks commission calculation.',
        evidenceRefs
      ),
      warnings: ['Missing paymentAmount blocks PaymentEvent.'],
    };
  }

  if (!confirmedPayment.carrierId) {
    return {
      error: true,
      reason: 'MISSING_CARRIER_ID',
      economicEventStatus: blockedStatus(
        ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_POLICY,
        'Missing carrierId blocks carrier rule routing.',
        evidenceRefs
      ),
      warnings: ['Missing carrierId blocks routing.'],
    };
  }

  return {
    paymentEventId: crypto.randomUUID(),
    advisorId: confirmedPayment.advisorId,
    carrierId: confirmedPayment.carrierId,
    policyId: confirmedPayment.policyId,
    policyNumber: confirmedPayment.policyNumber,
    paymentAmount: Number(confirmedPayment.paymentAmount),
    currency: confirmedPayment.currency,
    paymentDate: confirmedPayment.paymentDate,
    paymentFrequency: confirmedPayment.paymentFrequency,
    periodCoveredStart: confirmedPayment.periodCoveredStart,
    periodCoveredEnd: confirmedPayment.periodCoveredEnd,
    receiptNumber: confirmedPayment.receiptNumber,
    paymentSource: confirmedPayment.paymentSource,
    confirmationState: confirmedPayment.confirmationState,
    confirmedBy: confirmedPayment.confirmedBy || null,
    confirmedAt: confirmedPayment.confirmedAt || null,
    evidenceRefs,
    economicEventStatus: createEconomicEventStatus({
      status: ECONOMIC_EVENT_STATUSES.PAYMENT_CONFIRMED,
      trustLevel: ECONOMIC_EVENT_TRUST_LEVELS.PAYMENT_CONFIRMED,
      sourceState: confirmedPayment.paymentSource || 'payment_confirmed',
      evidenceRefs,
      explanation: 'Payment confirmed. This is not payout truth.',
    }),
    warnings,
  };
}

export function canCreateEarnedEstimatedFromPayment(paymentEvent = {}) {
  return (
    !paymentEvent.error &&
    paymentEvent.confirmationState === PAYMENT_EVIDENCE_STATES.CONFIRMED &&
    paymentEvent.economicEventStatus?.status === ECONOMIC_EVENT_STATUSES.PAYMENT_CONFIRMED &&
    hasAmount(paymentEvent.paymentAmount) &&
    Boolean(paymentEvent.carrierId)
  );
}

export function createEarnedEstimatedCommissionEvent({
  paymentEvent,
  estimatedCommissionAmount = null,
  currency = null,
  calculationRefs = [],
  warnings = [],
} = {}) {
  if (!canCreateEarnedEstimatedFromPayment(paymentEvent)) {
    return {
      error: true,
      reason: 'PAYMENT_EVENT_NOT_ELIGIBLE',
      economicEventStatus: blockedStatus(
        ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_PAYMENT,
        'Confirmed payment is required before earned estimated commission.',
        paymentEvent?.evidenceRefs || []
      ),
      warnings: ['Earned estimated commission requires a confirmed PaymentEvent.'],
    };
  }

  return {
    commissionEventId: crypto.randomUUID(),
    paymentEventId: paymentEvent.paymentEventId,
    advisorId: paymentEvent.advisorId,
    carrierId: paymentEvent.carrierId,
    policyId: paymentEvent.policyId,
    policyNumber: paymentEvent.policyNumber,
    estimatedCommissionAmount,
    currency: currency || paymentEvent.currency,
    evidenceRefs: paymentEvent.evidenceRefs,
    calculationRefs,
    economicEventStatus: createEconomicEventStatus({
      status: ECONOMIC_EVENT_STATUSES.EARNED_ESTIMATED,
      trustLevel: ECONOMIC_EVENT_TRUST_LEVELS.PAYMENT_CONFIRMED,
      sourceState: 'carrier_rule_estimate',
      evidenceRefs: paymentEvent.evidenceRefs,
      explanation: 'Estimated earned commission from confirmed payment. Not payout truth.',
      warnings,
    }),
    warnings,
  };
}

export function canCreatePaidConfirmedFromStatement(payoutData = {}) {
  return (
    Boolean(payoutData) &&
    payoutData.confirmationState === COMMISSION_STATEMENT_EVIDENCE_STATES.CONFIRMED &&
    hasAmount(Math.abs(Number(payoutData.commissionAmount))) &&
    Boolean(payoutData.carrierId) &&
    Boolean(payoutData.payoutEvidenceId)
  );
}

export function createPaidConfirmedCommissionEvent({
  payoutData,
  earnedEstimate = null,
} = {}) {
  if (!canCreatePaidConfirmedFromStatement(payoutData)) {
    return {
      error: true,
      reason: 'COMMISSION_STATEMENT_NOT_ELIGIBLE',
      economicEventStatus: blockedStatus(
        ECONOMIC_EVENT_STATUSES.BLOCKED_BY_MISSING_STATEMENT,
        'Commission statement evidence is required for paid confirmed payout truth.',
        payoutData?.evidenceRefs || []
      ),
      warnings: ['Paid confirmed commission requires confirmed commission statement evidence.'],
    };
  }

  const warnings = [...(payoutData.warnings || [])];

  if (
    earnedEstimate &&
    Number(earnedEstimate.estimatedCommissionAmount) !== Number(payoutData.commissionAmount)
  ) {
    warnings.push('Carrier statement differs from earned estimate. Statement confirms payout truth; estimate remains historical.');
  }

  const status = payoutData.commissionType === 'reversal'
    ? ECONOMIC_EVENT_STATUSES.REVERSED
    : ECONOMIC_EVENT_STATUSES.PAID_CONFIRMED;

  return {
    commissionEventId: crypto.randomUUID(),
    payoutEvidenceId: payoutData.payoutEvidenceId,
    paymentEventId: payoutData.paymentEventId,
    advisorId: payoutData.advisorId,
    carrierId: payoutData.carrierId,
    policyNumber: payoutData.policyNumber,
    commissionAmount: Number(payoutData.commissionAmount),
    currency: payoutData.currency,
    payoutDate: payoutData.payoutDate,
    payoutPeriodStart: payoutData.payoutPeriodStart,
    payoutPeriodEnd: payoutData.payoutPeriodEnd,
    commissionType: payoutData.commissionType,
    evidenceRefs: payoutData.evidenceRefs,
    economicEventStatus: createEconomicEventStatus({
      status,
      trustLevel: ECONOMIC_EVENT_TRUST_LEVELS.CARRIER_CONFIRMED,
      sourceState: 'commission_statement',
      evidenceRefs: payoutData.evidenceRefs,
      explanation: status === ECONOMIC_EVENT_STATUSES.REVERSED
        ? 'Carrier statement records reversal or chargeback. History is preserved.'
        : 'Carrier statement confirms payout truth.',
      warnings,
    }),
    warnings,
  };
}
