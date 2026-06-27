'use strict';

const {
  orchestrateAltaPartnerPromotionEvents,
  orchestrateAltaPartnerMonthlyCandidates,
  orchestrateAltaPartnerBonusCandidates
} = require('../compensation/partner-manager/partner-alta-partner-bonus-orchestrator');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function confirmedEvidence(overrides = {}) {
  return {
    status: 'confirmed',
    ...overrides
  };
}

function paymentInput(paymentNumber, overrides = {}) {
  return {
    partnerId: 'partner-001',
    promotedAdvisorId: 'advisor-promoted-001',
    promotionEventId: 'promotion-event-001',
    altaDate: '2026-03-15',
    paymentNumber,
    paymentGenerationMonth: `2026-${String(paymentNumber + 3).padStart(2, '0')}`,
    partnerActiveEvidence: confirmedEvidence(),
    promotedAdvisorActiveEvidence: confirmedEvidence(),
    promotedAdvisorSupportEvidence: confirmedEvidence({ received: true }),
    payoutTruth: false,
    ...overrides
  };
}

function fullScheduleInputs(overridesByPayment = {}) {
  return Array.from({ length: 13 }, (_, index) => {
    const paymentNumber = index + 1;
    return paymentInput(paymentNumber, overridesByPayment[paymentNumber] || {});
  });
}

function testOrchestratesSingleMonthlyPayment() {
  const result = orchestrateAltaPartnerMonthlyCandidates({
    monthlyPaymentInput: paymentInput(1)
  });

  assert(result.status === 'ALL_CANDIDATES_CALCULATED', 'Monthly payment should calculate.');
  assert(result.totalCandidateAmount === 60000, 'Payment 1 monthly total should be 60000.');
  assert(result.calculatedPaymentCount === 1, 'One payment should calculate.');
  assert(result.blockedPaymentCount === 0, 'No payment should block.');
  assert(result.payoutTruth === false, 'Monthly orchestrator must keep payoutTruth false.');
  assert(result.supportCalculatorTouched === false, 'Support calculator must not be touched.');
  assert(result.productionPayoutOperationsTouched === false, 'Production payout ops must not be touched.');
}

function testOrchestratesMonthlyPaymentBatch() {
  const result = orchestrateAltaPartnerMonthlyCandidates({
    monthlyPaymentInputs: [
      paymentInput(1),
      paymentInput(2),
      paymentInput(3)
    ]
  });

  assert(result.status === 'ALL_CANDIDATES_CALCULATED', 'Monthly batch should calculate.');
  assert(result.totalCandidateAmount === 100000, 'Monthly batch should sum 60000 + 20000 + 20000.');
  assert(result.calculatedPaymentCount === 3, 'Three payments should calculate.');
  assert(result.blockedPaymentCount === 0, 'No monthly payment should block.');
}

function testOrchestratesSinglePromotionEventFullSchedule() {
  const result = orchestrateAltaPartnerPromotionEvents({
    promotionEvent: {
      promotionEventId: 'promotion-event-001',
      partnerId: 'partner-001',
      promotedAdvisorId: 'advisor-promoted-001',
      paymentInputs: fullScheduleInputs()
    }
  });

  assert(result.status === 'ALL_CANDIDATES_CALCULATED', 'Full promotion event schedule should calculate.');
  assert(result.totalCandidateAmount === 300000, 'Full promotion event should total 300000.');
  assert(result.calculatedPromotionEventCount === 1, 'One promotion event should calculate.');
  assert(result.blockedPromotionEventCount === 0, 'No promotion event should block.');
  assert(result.promotionEventResults.length === 1, 'One promotion event result expected.');
  assert(result.payoutTruth === false, 'Promotion event orchestrator must keep payoutTruth false.');
}

function testOrchestratesMultiplePromotionEvents() {
  const secondSchedule = fullScheduleInputs().map((input) => ({
    ...input,
    partnerId: 'partner-002',
    promotedAdvisorId: 'advisor-promoted-002',
    promotionEventId: 'promotion-event-002'
  }));

  const result = orchestrateAltaPartnerPromotionEvents({
    promotionEvents: [
      {
        promotionEventId: 'promotion-event-001',
        partnerId: 'partner-001',
        promotedAdvisorId: 'advisor-promoted-001',
        paymentInputs: fullScheduleInputs()
      },
      {
        promotionEventId: 'promotion-event-002',
        partnerId: 'partner-002',
        promotedAdvisorId: 'advisor-promoted-002',
        paymentInputs: secondSchedule
      }
    ]
  });

  assert(result.status === 'ALL_CANDIDATES_CALCULATED', 'Both promotion events should calculate.');
  assert(result.totalCandidateAmount === 600000, 'Two full promotion events should total 600000.');
  assert(result.calculatedPromotionEventCount === 2, 'Two promotion events should calculate.');
}

function testMissingMonthlyInputsBlocksWithoutZero() {
  const result = orchestrateAltaPartnerMonthlyCandidates({});

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing monthly inputs should block.');
  assert(result.totalCandidateAmount === null, 'Missing monthly inputs must not become zero.');
  assert(
    result.blockingReasons.includes('NO_ALTA_PARTNER_MONTHLY_PAYMENT_INPUTS'),
    'Missing monthly inputs reason required.'
  );
}

function testMissingPromotionEventsBlocksWithoutZero() {
  const result = orchestrateAltaPartnerPromotionEvents({});

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing promotion events should block.');
  assert(result.totalCandidateAmount === null, 'Missing promotion events must not become zero.');
  assert(
    result.blockingReasons.includes('NO_ALTA_PARTNER_PROMOTION_EVENTS'),
    'Missing promotion events reason required.'
  );
}

function testPartialMonthlyBatchWithBlockedPayment() {
  const result = orchestrateAltaPartnerMonthlyCandidates({
    monthlyPaymentInputs: [
      paymentInput(1),
      paymentInput(2, {
        promotedAdvisorSupportEvidence: false
      })
    ]
  });

  assert(result.status === 'PARTIAL_WITH_BLOCKS', 'One calculated and one blocked monthly payment should be partial.');
  assert(result.totalCandidateAmount === 60000, 'Blocked payment must not be summed.');
  assert(result.calculatedPaymentCount === 1, 'One payment should calculate.');
  assert(result.blockedPaymentCount === 1, 'One payment should block.');
  assert(
    result.blockingReasons.includes('PROMOTED_ADVISOR_APOYO_EVIDENCE_NOT_CONFIRMED'),
    'Missing Apoyo reason required.'
  );
}

function testBlockedPromotionEventSchedulePropagates() {
  const result = orchestrateAltaPartnerPromotionEvents({
    promotionEvent: {
      promotionEventId: 'promotion-event-001',
      partnerId: 'partner-001',
      promotedAdvisorId: 'advisor-promoted-001',
      paymentInputs: fullScheduleInputs().filter((input) => input.paymentNumber !== 13)
    }
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing schedule payment should block promotion event.');
  assert(result.totalCandidateAmount === null, 'Blocked promotion event must not become zero.');
  assert(
    result.blockingReasons.includes('SCHEDULE_MISSING_PAYMENT_13'),
    'Missing payment 13 reason required.'
  );
}

function testRecoveredApoyoMonthlyPaymentCalculates() {
  const result = orchestrateAltaPartnerMonthlyCandidates({
    monthlyPaymentInput: paymentInput(4, {
      promotedAdvisorSupportEvidence: false,
      recoveryRequested: true,
      recoveryMonthsRequested: 3,
      recoveredSupportEvidence: confirmedEvidence(),
      recoveryRequestEvidence: confirmedEvidence(),
      sameCalendarYearEvidence: confirmedEvidence()
    })
  });

  assert(result.status === 'ALL_CANDIDATES_CALCULATED', 'Recovered Apoyo payment should calculate.');
  assert(result.totalCandidateAmount === 20000, 'Recovered recurring payment should calculate 20000.');
  assert(result.payoutTruth === false, 'Recovered monthly payment must keep payoutTruth false.');
}

function testRecoveryOverThreeMonthsBlocksMonthlyPayment() {
  const result = orchestrateAltaPartnerMonthlyCandidates({
    monthlyPaymentInput: paymentInput(5, {
      promotedAdvisorSupportEvidence: false,
      recoveryRequested: true,
      recoveryMonthsRequested: 4,
      recoveredSupportEvidence: confirmedEvidence(),
      recoveryRequestEvidence: confirmedEvidence(),
      sameCalendarYearEvidence: confirmedEvidence()
    })
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Recovery over 3 months should block monthly payment.');
  assert(result.totalCandidateAmount === null, 'Recovery over 3 months must not become zero.');
  assert(
    result.blockingReasons.includes('RECOVERY_MONTH_LIMIT_EXCEEDED'),
    'Recovery limit reason required.'
  );
}

function testGenericOrchestratorChoosesPromotionEventMode() {
  const result = orchestrateAltaPartnerBonusCandidates({
    promotionEvent: {
      promotionEventId: 'promotion-event-001',
      partnerId: 'partner-001',
      promotedAdvisorId: 'advisor-promoted-001',
      paymentInputs: fullScheduleInputs()
    }
  });

  assert(result.orchestrationMode === 'PROMOTION_EVENT_SCHEDULE', 'Generic orchestrator should choose promotion event mode.');
  assert(result.totalCandidateAmount === 300000, 'Promotion event mode should calculate 300000.');
}

function testGenericOrchestratorChoosesMonthlyMode() {
  const result = orchestrateAltaPartnerBonusCandidates({
    monthlyPaymentInput: paymentInput(1)
  });

  assert(result.orchestrationMode === 'MONTHLY_PAYMENT', 'Generic orchestrator should choose monthly payment mode.');
  assert(result.totalCandidateAmount === 60000, 'Monthly mode should calculate 60000.');
}

testOrchestratesSingleMonthlyPayment();
testOrchestratesMonthlyPaymentBatch();
testOrchestratesSinglePromotionEventFullSchedule();
testOrchestratesMultiplePromotionEvents();
testMissingMonthlyInputsBlocksWithoutZero();
testMissingPromotionEventsBlocksWithoutZero();
testPartialMonthlyBatchWithBlockedPayment();
testBlockedPromotionEventSchedulePropagates();
testRecoveredApoyoMonthlyPaymentCalculates();
testRecoveryOverThreeMonthsBlocksMonthlyPayment();
testGenericOrchestratorChoosesPromotionEventMode();
testGenericOrchestratorChoosesMonthlyMode();

console.log('PASS partner-alta-partner-bonus-orchestrator-test');
