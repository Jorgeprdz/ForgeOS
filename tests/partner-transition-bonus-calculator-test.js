'use strict';

const {
  calculatePartnerTransitionBonusCandidate
} = require('../compensation/partner-manager/partner-transition-bonus-calculator');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function lineage(overrides = {}) {
  return {
    partnerId: 'partner-001',
    formerAdvisorId: 'advisor-001',
    formerAdvisorCode: 'ADV001',
    formerAdvisorCompensationKey: 'KEY-ADV-001',
    partnerContractDate: '2026-01-01',
    partnerCareerMonth: 1,
    directKey: 'DIRECT-ADV-001',
    assignedPortfolioId: 'PORT-ADV-001',
    lineageEvidence: { status: 'confirmed' },
    ...overrides
  };
}

function evidence(overrides = {}) {
  return {
    nonAdministrationEvidence: { status: 'confirmed' },
    nonClientInterventionEvidence: { status: 'confirmed' },
    directKeyAttributionEvidence: { status: 'confirmed' },
    assignedPortfolioEvidence: { status: 'confirmed' },
    ...overrides
  };
}

function ledger(overrides = {}) {
  return {
    ledgerLineId: 'ledger-001',
    partnerId: 'partner-001',
    formerAdvisorId: 'advisor-001',
    formerAdvisorCompensationKey: 'KEY-ADV-001',
    directKey: 'DIRECT-ADV-001',
    assignedPortfolioId: 'PORT-ADV-001',
    commissionType: 'initial',
    commissionAmount: 1000,
    premiumPaymentDate: '2026-01-15',
    commissionPaidDate: '2026-01-31',
    paidPremiumEvidence: { status: 'confirmed' },
    paidAppliedCommissionEvidence: { status: 'confirmed' },
    ...overrides
  };
}

function testCalculatesInitialPlusRenewalCandidate() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage(),
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        ledgerLineId: 'initial-1',
        commissionType: 'initial',
        commissionAmount: 1200
      }),
      ledger({
        ledgerLineId: 'renewal-1',
        commissionType: 'renewal',
        commissionAmount: 800
      })
    ]
  });

  assert(result.status === 'CANDIDATE_CALCULATED', 'Valid evidence should calculate candidate.');
  assert(result.calculationPerformed === true, 'Calculator should perform calculation.');
  assert(result.eligibleInitialCommissions === 1200, 'Initial commissions should be summed.');
  assert(result.eligibleRenewalCommissions === 800, 'Renewal commissions should be summed.');
  assert(result.candidateAmount === 2000, 'Candidate must equal initial + renewal.');
  assert(result.payoutTruth === false, 'Candidate calculator must keep payoutTruth false.');
  assert(result.includedLedgerLines.length === 2, 'Both ledger lines should be included.');
}

function testBlocksMissingLineageWithoutZeroing() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: null,
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        commissionType: 'initial',
        commissionAmount: 1000
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing lineage must block.');
  assert(result.calculationPerformed === false, 'Blocked state must not calculate.');
  assert(result.candidateAmount === null, 'Missing lineage must not become zero.');
  assert(result.payoutTruth === false, 'Blocked state must keep payoutTruth false.');
  assert(
    result.blockingReasons.includes('MISSING_TRANSITION_LINEAGE'),
    'Missing lineage reason required.'
  );
}

function testBlocksMonthSeven() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage({ partnerCareerMonth: 7 }),
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        commissionType: 'initial',
        commissionAmount: 1000
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Month 7 must block.');
  assert(result.candidateAmount === null, 'Month 7 must not calculate zero.');
  assert(
    result.blockingReasons.includes('TRANSITION_WINDOW_OUTSIDE_MONTHS_1_6'),
    'Transition window reason required.'
  );
}

function testBlocksInvalidCommissionType() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage(),
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        commissionType: 'production',
        commissionAmount: 1000
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Invalid commissionType must block.');
  assert(result.candidateAmount === null, 'Invalid commissionType must not become zero.');
  assert(
    result.blockingReasons.includes('LEDGER_0_INVALID_COMMISSION_TYPE'),
    'Invalid commission type reason required.'
  );
}

function testBlocksMissingPaidEvidence() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage(),
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        paidPremiumEvidence: false,
        paidAppliedCommissionEvidence: false
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Missing paid evidence must block.');
  assert(result.candidateAmount === null, 'Missing paid evidence must not become zero.');
  assert(
    result.blockingReasons.includes('LEDGER_0_PAID_PREMIUM_EVIDENCE_NOT_CONFIRMED'),
    'Paid premium evidence reason required.'
  );
  assert(
    result.blockingReasons.includes('LEDGER_0_PAID_APPLIED_COMMISSION_EVIDENCE_NOT_CONFIRMED'),
    'Paid-applied evidence reason required.'
  );
}

function testBlocksAdministrationOrInterventionEvidence() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage(),
    eligibilityEvidence: evidence({
      nonAdministrationEvidence: false,
      nonClientInterventionEvidence: false
    }),
    ledgerLines: [
      ledger({
        commissionType: 'renewal',
        commissionAmount: 900
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Administration/intervention gates must block.');
  assert(result.candidateAmount === null, 'Blocked gates must not become zero.');
  assert(
    result.blockingReasons.includes('NON_ADMINISTRATION_EVIDENCE_NOT_CONFIRMED'),
    'Non-administration reason required.'
  );
  assert(
    result.blockingReasons.includes('NON_CLIENT_INTERVENTION_EVIDENCE_NOT_CONFIRMED'),
    'Non-client-intervention reason required.'
  );
}

function testBlocksMismatchedFormerAdvisorKeyOrPortfolio() {
  const result = calculatePartnerTransitionBonusCandidate({
    lineage: lineage(),
    eligibilityEvidence: evidence(),
    ledgerLines: [
      ledger({
        formerAdvisorCompensationKey: 'OTHER-KEY',
        directKey: 'OTHER-DIRECT',
        assignedPortfolioId: 'OTHER-PORT',
        commissionType: 'renewal',
        commissionAmount: 700
      })
    ]
  });

  assert(result.status === 'BLOCKED_OR_UNKNOWN', 'Mismatched ledger must block.');
  assert(result.candidateAmount === null, 'Mismatched ledger must not become zero.');
  assert(
    result.blockingReasons.includes('LEDGER_0_FORMER_ADVISOR_KEY_DOES_NOT_MATCH_LINEAGE'),
    'Former advisor key mismatch reason required.'
  );
  assert(
    result.blockingReasons.includes('LEDGER_0_DIRECT_KEY_OR_PORTFOLIO_DOES_NOT_MATCH_LINEAGE'),
    'Direct key or portfolio mismatch reason required.'
  );
}

testCalculatesInitialPlusRenewalCandidate();
testBlocksMissingLineageWithoutZeroing();
testBlocksMonthSeven();
testBlocksInvalidCommissionType();
testBlocksMissingPaidEvidence();
testBlocksAdministrationOrInterventionEvidence();
testBlocksMismatchedFormerAdvisorKeyOrPortfolio();

console.log('PASS partner-transition-bonus-calculator-test');
