'use strict';

const {
  calculateAltaPartnerPaymentCandidate,
  calculateAltaPartnerScheduleCandidate
} = require('./partner-alta-partner-bonus-calculator');

function normalizePromotionEvents(input = {}) {
  if (Array.isArray(input.promotionEvents)) return input.promotionEvents;

  if (input.promotionEvent && typeof input.promotionEvent === 'object') {
    return [input.promotionEvent];
  }

  return [];
}

function normalizeMonthlyPaymentInputs(input = {}) {
  if (Array.isArray(input.monthlyPaymentInputs)) return input.monthlyPaymentInputs;
  if (Array.isArray(input.paymentInputs)) return input.paymentInputs;

  if (input.monthlyPaymentInput && typeof input.monthlyPaymentInput === 'object') {
    return [input.monthlyPaymentInput];
  }

  if (input.paymentInput && typeof input.paymentInput === 'object') {
    return [input.paymentInput];
  }

  if (input.partnerId || input.promotedAdvisorId || input.paymentNumber) {
    return [input];
  }

  return [];
}

function summarizeResults(results, amountField = 'candidateAmount') {
  const calculated = results.filter((result) => result.status === 'CANDIDATE_CALCULATED');
  const blocked = results.filter((result) => result.status !== 'CANDIDATE_CALCULATED');

  let status = 'BLOCKED_OR_UNKNOWN';

  if (results.length > 0 && blocked.length === 0) {
    status = 'ALL_CANDIDATES_CALCULATED';
  } else if (calculated.length > 0 && blocked.length > 0) {
    status = 'PARTIAL_WITH_BLOCKS';
  }

  const totalCandidateAmount = calculated.reduce(
    (total, result) => total + (result[amountField] || 0),
    0
  );

  return {
    status,
    calculatedCount: calculated.length,
    blockedCount: blocked.length,
    totalCandidateAmount: calculated.length > 0 ? totalCandidateAmount : null
  };
}

function orchestrateAltaPartnerPromotionEvents(input = {}) {
  const promotionEvents = normalizePromotionEvents(input);

  if (promotionEvents.length === 0) {
    return {
      concept: 'partner-promotion-bonus',
      status: 'BLOCKED_OR_UNKNOWN',
      payoutTruth: false,
      totalCandidateAmount: null,
      calculatedPromotionEventCount: 0,
      blockedPromotionEventCount: 0,
      promotionEventResults: [],
      blockingReasons: ['NO_ALTA_PARTNER_PROMOTION_EVENTS'],
      supportCalculatorTouched: false,
      productionPayoutOperationsTouched: false
    };
  }

  const promotionEventResults = promotionEvents.map((event, index) => {
    const scheduleResult = calculateAltaPartnerScheduleCandidate({
      paymentInputs: event.paymentInputs || event.monthlyPaymentInputs || []
    });

    return {
      promotionEventIndex: index,
      promotionEventId: event.promotionEventId || null,
      partnerId: event.partnerId || null,
      promotedAdvisorId: event.promotedAdvisorId || null,
      ...scheduleResult
    };
  });

  const summary = summarizeResults(promotionEventResults, 'candidateAmount');

  return {
    concept: 'partner-promotion-bonus',
    status: summary.status,
    payoutTruth: false,
    totalCandidateAmount: summary.totalCandidateAmount,
    calculatedPromotionEventCount: summary.calculatedCount,
    blockedPromotionEventCount: summary.blockedCount,
    promotionEventResults,
    blockingReasons: promotionEventResults.flatMap((result) => result.blockingReasons || []),
    supportCalculatorTouched: false,
    productionPayoutOperationsTouched: false
  };
}

function orchestrateAltaPartnerMonthlyCandidates(input = {}) {
  const monthlyPaymentInputs = normalizeMonthlyPaymentInputs(input);

  if (monthlyPaymentInputs.length === 0) {
    return {
      concept: 'partner-promotion-bonus',
      status: 'BLOCKED_OR_UNKNOWN',
      payoutTruth: false,
      totalCandidateAmount: null,
      calculatedPaymentCount: 0,
      blockedPaymentCount: 0,
      paymentResults: [],
      blockingReasons: ['NO_ALTA_PARTNER_MONTHLY_PAYMENT_INPUTS'],
      supportCalculatorTouched: false,
      productionPayoutOperationsTouched: false
    };
  }

  const paymentResults = monthlyPaymentInputs.map((paymentInput, index) => {
    const paymentResult = calculateAltaPartnerPaymentCandidate(paymentInput);

    return {
      paymentIndex: index,
      partnerId: paymentInput.partnerId || null,
      promotedAdvisorId: paymentInput.promotedAdvisorId || null,
      promotionEventId: paymentInput.promotionEventId || null,
      paymentGenerationMonth: paymentInput.paymentGenerationMonth || null,
      ...paymentResult
    };
  });

  const summary = summarizeResults(paymentResults, 'candidateAmount');

  return {
    concept: 'partner-promotion-bonus',
    status: summary.status,
    payoutTruth: false,
    totalCandidateAmount: summary.totalCandidateAmount,
    calculatedPaymentCount: summary.calculatedCount,
    blockedPaymentCount: summary.blockedCount,
    paymentResults,
    blockingReasons: paymentResults.flatMap((result) => result.blockingReasons || []),
    supportCalculatorTouched: false,
    productionPayoutOperationsTouched: false
  };
}

function orchestrateAltaPartnerBonusCandidates(input = {}) {
  const promotionEvents = normalizePromotionEvents(input);

  if (promotionEvents.length > 0) {
    return {
      orchestrationMode: 'PROMOTION_EVENT_SCHEDULE',
      ...orchestrateAltaPartnerPromotionEvents(input)
    };
  }

  return {
    orchestrationMode: 'MONTHLY_PAYMENT',
    ...orchestrateAltaPartnerMonthlyCandidates(input)
  };
}

module.exports = {
  orchestrateAltaPartnerPromotionEvents,
  orchestrateAltaPartnerMonthlyCandidates,
  orchestrateAltaPartnerBonusCandidates
};
