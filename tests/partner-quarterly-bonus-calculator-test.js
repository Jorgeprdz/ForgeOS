import assert from 'node:assert/strict';

import {
  calculatePartnerActivityBonusCandidate,
} from '../compensation/partner-manager/partner-activity-bonus-calculator.js';

import {
  calculatePartnerFixedSupportCandidate,
} from '../compensation/partner-manager/partner-fixed-support-calculator.js';

import {
  gatePartnerConnectionBonusCalculation,
  gatePartnerDevelopmentBonusCalculation,
} from '../compensation/partner-manager/partner-partial-bonus-calculation-gate.js';

import {
  calculatePartnerProductionBonusCandidate,
} from '../compensation/partner-manager/partner-production-bonus-calculator.js';

import {
  calculatePartnerProductivityMultiplierCandidate,
} from '../compensation/partner-manager/partner-productivity-multiplier-calculator.js';

import {
  calculatePartnerQuarterlyBonusCandidate,
} from '../compensation/partner-manager/partner-quarterly-bonus-calculator.js';

import {
  loadPartner2026RulePack,
} from '../compensation/partner-manager/partner-2026-rule-pack-loader.js';

const rulePack = loadPartner2026RulePack();

const month25Multiplier = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 5,
  partnerCareerMonth: 25,
  trainingWinnerInQuarter: true,
});
assert.equal(month25Multiplier.metadata.minimumQualifiedAdvisorRequirement, 5);
assert.equal(month25Multiplier.candidatePercentage, 0.5);
assert.equal(month25Multiplier.candidateAmount, 150000);

const insufficientMultiplier = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 2,
  partnerCareerMonth: 25,
  trainingWinnerInQuarter: true,
});
assert.ok(insufficientMultiplier.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_career_month'));
assert.equal(insufficientMultiplier.candidateAmount, null);

const tenWithTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 10,
  partnerCareerMonth: 25,
  trainingWinnerInQuarter: true,
});
assert.equal(tenWithTraining.candidatePercentage, 1);
assert.equal(tenWithTraining.candidateAmount, 200000);

const tenWithoutTraining = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 10,
  partnerCareerMonth: 25,
  trainingWinnerInQuarter: false,
});
assert.equal(tenWithoutTraining.metadata.calculatedProductivityBonusCandidate, 200000);
assert.equal(tenWithoutTraining.metadata.payFactor, 0.8);
assert.equal(tenWithoutTraining.candidateAmount, 160000);

const connected2026Exception = calculatePartnerProductivityMultiplierCandidate({
  rulePack,
  productivityBaseCandidate: 100000,
  qualifiedAdvisorCount: 10,
  partnerCareerMonth: 25,
  partnerConnectedYear: 2026,
});
assert.equal(connected2026Exception.metadata.payFactor, 1);
assert.equal(connected2026Exception.candidateAmount, 200000);

const activity = calculatePartnerActivityBonusCandidate({
  rulePack,
  qualifiedAdvisorStatus: { status: 'qualified_confirmed' },
  advisorCareerMonth: 4,
  monthlyAveragePolicies: 5,
  paidAppliedPolicyEvidence: true,
  economicBasisAmount: 100000,
});
assert.equal(activity.candidateAmount, 25000);
assert.equal(rulePack.concepts['activity-bonus'].paymentCadence.calculationFrequency, 'quarterly');

const activityBlockedByQuarterPolicies = calculatePartnerActivityBonusCandidate({
  rulePack,
  qualifiedAdvisorStatus: { status: 'qualified_confirmed' },
  advisorCareerMonth: 4,
  quarterPolicyTotal: 9,
  paidAppliedPolicyEvidence: true,
  economicBasisAmount: 100000,
});
assert.ok(activityBlockedByQuarterPolicies.blockedReasons.includes('blocked_by_missing_monthly_policy_breakdown'));

const activityBlockedByMissingCommissions = calculatePartnerActivityBonusCandidate({
  rulePack,
  qualifiedAdvisorStatus: { status: 'qualified_confirmed' },
  advisorCareerMonth: 4,
  monthlyAveragePolicies: 5,
  paidAppliedPolicyEvidence: true,
});
assert.equal(activityBlockedByMissingCommissions.candidateAmount, null);

const youngActivity = calculatePartnerActivityBonusCandidate({
  rulePack,
  qualifiedAdvisorStatus: { status: 'qualified_confirmed' },
  advisorCareerMonth: 2,
  monthlyAveragePolicies: 5,
  paidAppliedPolicyEvidence: true,
  economicBasisAmount: 100000,
});
assert.ok(youngActivity.blockedReasons.includes('minimum_three_month_seniority_required'));

const productionNew = calculatePartnerProductionBonusCandidate({
  rulePack,
  nonQualifiedAdvisorEconomicOutput: { economicStatus: 'paid_applied_confirmed' },
  organizationType: 'nueva_organizacion',
  unitLIMRA: 78,
  unitIGC: 86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.equal(productionNew.candidateAmount, 13500);

const productionConsolidated = calculatePartnerProductionBonusCandidate({
  rulePack,
  nonQualifiedAdvisorEconomicOutput: { economicStatus: 'paid_applied_confirmed' },
  organizationType: 'consolidados',
  unitLIMRA: 78,
  unitIGC: 86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.ok(Math.abs(productionConsolidated.candidateAmount - 7000) < 0.0001);

const productionBlockedIndexes = calculatePartnerProductionBonusCandidate({
  rulePack,
  nonQualifiedAdvisorEconomicOutput: { economicStatus: 'paid_applied_confirmed' },
  organizationType: 'nueva_organizacion',
  unitLIMRA: 77,
  unitIGC: 86,
  paidAppliedEconomicEvidence: true,
  validEconomicBaseAmount: 100000,
});
assert.equal(productionBlockedIndexes.candidateAmount, null);

const connectionOnboarding = gatePartnerConnectionBonusCalculation({
  rulePack,
  advisorMonth: 1,
  onboardingEvidence: true,
  connectorActiveAtMonthClose: true,
  connectedAdvisorActiveAtMonthClose: true,
});
assert.equal(connectionOnboarding.candidateAmount, 7500);

const connectionMonth2 = gatePartnerConnectionBonusCalculation({
  rulePack,
  advisorMonth: 2,
  monthlyPolicies: 5,
  paidAppliedPolicyEvidence: true,
  connectorActiveAtMonthClose: true,
  connectedAdvisorActiveAtMonthClose: true,
});
assert.equal(connectionMonth2.candidateAmount, 15000);

const connectionQuarterTotalBlocked = gatePartnerConnectionBonusCalculation({
  rulePack,
  advisorMonth: 2,
  quarterPolicyTotal: 5,
  paidAppliedPolicyEvidence: true,
  connectorActiveAtMonthClose: true,
  connectedAdvisorActiveAtMonthClose: true,
});
assert.ok(connectionQuarterTotalBlocked.blockedReasons.includes('blocked_by_missing_monthly_policy_breakdown'));

const connectionInactive = gatePartnerConnectionBonusCalculation({
  rulePack,
  advisorMonth: 2,
  monthlyPolicies: 5,
  paidAppliedPolicyEvidence: true,
  connectorActiveAtMonthClose: false,
  connectedAdvisorActiveAtMonthClose: true,
});
assert.equal(connectionInactive.candidateAmount, null);

const development = gatePartnerDevelopmentBonusCalculation({
  rulePack,
  advisorMonth: 7,
  monthlyPolicies: 4,
  paidAppliedPolicyEvidence: true,
  developerEligibilityEvidence: true,
});
assert.equal(development.candidateAmount, 15000);

const sharedDevelopment = gatePartnerDevelopmentBonusCalculation({
  rulePack,
  advisorMonth: 7,
  monthlyPolicies: 4,
  paidAppliedPolicyEvidence: true,
  developerEligibilityEvidence: true,
  developerCount: 2,
});
assert.equal(sharedDevelopment.candidateAmount, 7500);

const month12Development = gatePartnerDevelopmentBonusCalculation({
  rulePack,
  advisorMonth: 12,
  monthlyPolicies: 4,
  paidAppliedPolicyEvidence: true,
  developerEligibilityEvidence: true,
});
assert.equal(month12Development.metadata.additionalMonth12BonusStatus, 'blocked_without_month_12_evidence');

const supportMonth25 = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 76500,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  partnerLifecycleStatus: 'partner_active',
  supportTableEvidenceRequired: false,
});
assert.equal(supportMonth25.metadata.assessment.metadata.semesterIndex, 5);
assert.equal(supportMonth25.metadata.assessment.metadata.accumulatedCommissionGoal, 76500);
assert.equal(supportMonth25.candidateAmount, 21500);

const supportBelow80 = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 60000,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  partnerLifecycleStatus: 'partner_active',
  supportTableEvidenceRequired: false,
});
assert.ok(supportBelow80.blockedReasons.includes('blocked_by_accumulated_commissions_below_80_percent'));

const support80 = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 61200,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  partnerLifecycleStatus: 'partner_active',
  supportTableEvidenceRequired: false,
});
assert.equal(support80.candidateAmount, 17200);

const support85 = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 65025,
  accumulatedCommissionGoalsEvidence: true,
  trainingWinnerActualCountLastSixMonths: 3,
  partnerLifecycleStatus: 'partner_active',
  supportTableEvidenceRequired: false,
});
assert.equal(support85.candidateAmount, 18275);

const supportMissingWinners = calculatePartnerFixedSupportCandidate({
  rulePack,
  partnerCareerMonth: 25,
  accumulatedCommissionActualLifeIndividualAndGmmi: 76500,
  accumulatedCommissionGoalsEvidence: true,
  partnerLifecycleStatus: 'partner_active',
  supportTableEvidenceRequired: false,
});
assert.ok(supportMissingWinners.blockedReasons.includes('blocked_by_missing_training_winner_count'));

const scenario = calculatePartnerQuarterlyBonusCandidate({
  partner: {
    partnerId: 'PARTNER_004G',
    partnerCareerMonth: 25,
    partnerConnectedYear: 2026,
    organizationType: 'nueva_organizacion',
    unitLIMRA: 80,
    unitIGC: 90,
    active: true,
  },
  period: { type: 'quarter', quarter: 'Q1', year: 2026 },
  evidence: {
    paidAppliedEconomicEvidence: true,
    accumulatedCommissionActualLifeIndividualAndGmmi: 76500,
  },
  advisors: [
    {
      name: 'Juan',
      quarterInitialCommissions: 25000,
      quarterPolicyTotal: 7,
      advisorMonth: 4,
      activeAtQuarterClose: true,
      lifeIndividualShare: 0.5,
      qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi: 20000,
      paidAppliedPolicyEvidence: true,
    },
    {
      name: 'Roberto',
      quarterInitialCommissions: 54001,
      quarterPolicyTotal: 5,
      advisorMonth: 6,
      activeAtQuarterClose: true,
      lifeIndividualShare: 0.5,
      qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi: 40000,
      paidAppliedPolicyEvidence: true,
    },
    {
      name: 'Teresa',
      quarterInitialCommissions: 27000,
      quarterPolicyTotal: 9,
      advisorMonth: 8,
      activeAtQuarterClose: true,
      lifeIndividualShare: 0.5,
      qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi: 22000,
      paidAppliedPolicyEvidence: true,
    },
    {
      name: 'Pamela',
      quarterInitialCommissions: 80000,
      quarterPolicyTotal: 8,
      advisorMonth: 2,
      activeAtQuarterClose: true,
      lifeIndividualShare: 0.5,
      onboardingEvidence: true,
      qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi: 60000,
      paidAppliedPolicyEvidence: true,
      wonTrainingAllowanceFirstTimeInQuarter: false,
    },
  ],
});

assert.equal(scenario.payoutTruth, false);
assert.equal(scenario.rulePackId, 'smnyl_partner_compensation_2026');
assert.equal(scenario.sourceRulePackFile, 'smnyl_partner_compensation_2026_rules_official_v1.json');
assert.equal(scenario.qualificationSummary.qualifiedAdvisorCount, 3);
assert.equal(scenario.trainingWinnerInference.trainingWinnerInQuarter, null);
assert.ok(scenario.concepts.productivityBase.candidateAmount > 0);
assert.ok(scenario.concepts.productivityMultiplier.blockedReasons.includes('blocked_by_insufficient_qualified_advisors_for_partner_career_month'));
assert.equal(scenario.concepts.productivityMultiplier.candidateAmount, null);
assert.ok(scenario.concepts.production.candidateAmount > 0);
assert.ok(scenario.concepts.activity.blockedReasons.includes('blocked_by_missing_monthly_policy_breakdown'));
assert.ok(scenario.concepts.connection.blockedReasons.includes('blocked_by_missing_monthly_policy_breakdown'));
assert.ok(scenario.concepts.development.blockedReasons.includes('blocked_by_missing_monthly_policy_breakdown'));
assert.equal(scenario.concepts.fixedSupport.candidateAmount, null);
assert.ok(scenario.concepts.fixedSupport.blockedReasons.includes('blocked_by_missing_training_winner_count'));
assert.equal(scenario.concepts.fixedSupport.blockedReasons.includes('blocked_by_missing_table'), false);
assert.notEqual(scenario.totals.totalQuarterCandidateExcludingBlocked, 0);
assert.notEqual(scenario.totals.monthlyAverageCandidateExcludingBlocked, 0);

function partnerXQualifiedAdvisor(name, quarterInitialCommissions, advisorMonth) {
  return {
    name,
    quarterInitialCommissions,
    averageMonthlyInitialCommissions: quarterInitialCommissions / 3,
    quarterPolicyTotal: 12,
    monthlyAveragePolicies: 4,
    monthlyPolicies: 4,
    advisorMonth,
    activeAtQuarterClose: true,
    lifeIndividualShare: 0.5,
    lifeIndividualInitialCommissions: quarterInitialCommissions * 0.5,
    qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi: quarterInitialCommissions,
    paidAppliedPolicyEvidence: true,
    developerEligibilityEvidence: true,
    LIMRA: 80,
    IGC: 90,
  };
}

function calculatePartnerXQuarterlyCandidate(overrides = {}) {
  return calculatePartnerQuarterlyBonusCandidate({
    partner: {
      partnerId: 'PARTNER_X_005P_1_B1',
      partnerCareerMonth: 24,
      partnerConnectedYear: 2026,
      organizationType: 'nueva_organizacion',
      unitLIMRA: 80,
      unitIGC: 90,
      active: true,
    },
    period: { type: 'quarter', quarter: 'Q1', year: 2026 },
    evidence: {
      paidAppliedEconomicEvidence: true,
      trainingWinnerInQuarter: true,
    },
    advisors: [
      partnerXQualifiedAdvisor('Partner X A', 80000, 7),
      partnerXQualifiedAdvisor('Partner X B', 80000, 8),
      partnerXQualifiedAdvisor('Partner X C', 79000, 9),
      partnerXQualifiedAdvisor('Partner X D', 79000, 10),
      {
        name: 'Partner X Non Qualified',
        quarterInitialCommissions: 21000,
        averageMonthlyInitialCommissions: 7000,
        quarterPolicyTotal: 3,
        advisorMonth: 4,
        activeAtQuarterClose: true,
        lifeIndividualShare: 0.5,
        lifeIndividualInitialCommissions: 10500,
        paidAppliedPolicyEvidence: true,
        developerEligibilityEvidence: true,
        LIMRA: 80,
        IGC: 90,
      },
      {
        name: 'Partner X Connection',
        quarterInitialCommissions: 0,
        averageMonthlyInitialCommissions: 0,
        quarterPolicyTotal: 0,
        monthlyPolicies: 0,
        advisorMonth: 1,
        activeAtQuarterClose: true,
        activeAtMonthClose: true,
        onboardingEvidence: true,
        lifeIndividualShare: 0.5,
        lifeIndividualInitialCommissions: 0,
        paidAppliedPolicyEvidence: true,
        LIMRA: 80,
        IGC: 90,
      },
    ],
    ...overrides,
  });
}

const partnerXLegacy = calculatePartnerXQuarterlyCandidate();
assert.deepEqual(Object.keys(partnerXLegacy.concepts), [
  'productivityBase',
  'productivityMultiplier',
  'production',
  'activity',
  'development',
  'connection',
  'fixedSupport',
]);
assert.equal(partnerXLegacy.concepts.productivityBase.candidateAmount, 95400);
assert.equal(partnerXLegacy.concepts.productivityMultiplier.candidateAmount, 133560);
assert.equal(partnerXLegacy.concepts.production.candidateAmount, 2835);
assert.equal(partnerXLegacy.payoutTruth, false);
assert.equal(partnerXLegacy.requestedConcepts, null);
assert.deepEqual(partnerXLegacy.requestedConceptsApplied, []);
assert.deepEqual(partnerXLegacy.requestedConceptsMissing, []);
assert.equal(partnerXLegacy.subtotalRequestedConceptsCandidate, null);
assert.equal(partnerXLegacy.requestedPaymentSchedule, null);

const partnerXRequestedSubtotal = calculatePartnerXQuarterlyCandidate({
  requestedConcepts: ['production', 'productivityMultiplier'],
});
assert.equal(partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate, 136395);
assert.equal(partnerXRequestedSubtotal.totals.subtotalRequestedConceptsCandidate, 136395);
assert.deepEqual(partnerXRequestedSubtotal.requestedConceptsApplied, ['production', 'productivityMultiplier']);
assert.deepEqual(partnerXRequestedSubtotal.requestedConceptsMissing, []);
assert.equal(partnerXRequestedSubtotal.payoutTruth, false);
assert.equal(
  partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate,
  partnerXRequestedSubtotal.concepts.production.candidateAmount +
    partnerXRequestedSubtotal.concepts.productivityMultiplier.candidateAmount
);
assert.notEqual(
  partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate,
  partnerXRequestedSubtotal.concepts.production.candidateAmount +
    partnerXRequestedSubtotal.concepts.productivityMultiplier.candidateAmount +
    partnerXRequestedSubtotal.concepts.activity.candidateAmount
);
assert.notEqual(
  partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate,
  partnerXRequestedSubtotal.concepts.production.candidateAmount +
    partnerXRequestedSubtotal.concepts.productivityMultiplier.candidateAmount +
    partnerXRequestedSubtotal.concepts.connection.candidateAmount
);
assert.ok(partnerXRequestedSubtotal.concepts.development.candidateAmount !== null);
assert.notEqual(
  partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate,
  partnerXRequestedSubtotal.concepts.production.candidateAmount +
    partnerXRequestedSubtotal.concepts.productivityMultiplier.candidateAmount +
    partnerXRequestedSubtotal.concepts.development.candidateAmount
);
assert.equal(partnerXRequestedSubtotal.concepts.fixedSupport.candidateAmount, null);
assert.equal(
  partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate,
  136395
);
assert.equal(
  partnerXRequestedSubtotal.concepts.productivityBase.candidateAmount +
    partnerXRequestedSubtotal.concepts.production.candidateAmount +
    partnerXRequestedSubtotal.concepts.productivityMultiplier.candidateAmount,
  231795
);
assert.notEqual(partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate, 231795);
assert.equal(
  partnerXRequestedSubtotal.totals.totalQuarterCandidateExcludingBlocked,
  partnerXLegacy.totals.totalQuarterCandidateExcludingBlocked
);
assert.equal(
  partnerXRequestedSubtotal.totals.monthlyAverageCandidateExcludingBlocked,
  partnerXLegacy.totals.monthlyAverageCandidateExcludingBlocked
);
assert.ok(partnerXRequestedSubtotal.paymentSchedule);
assert.ok(partnerXLegacy.paymentSchedule);

const requestedPaymentSchedule = partnerXRequestedSubtotal.requestedPaymentSchedule;
assert.ok(requestedPaymentSchedule);
assert.equal(requestedPaymentSchedule.payoutTruth, false);
assert.equal(Array.isArray(requestedPaymentSchedule.projectedPayments), true);
assert.equal(requestedPaymentSchedule.projectedPayments.length, 6);
assert.equal(requestedPaymentSchedule.totals.projectedAmount, 136395);
assert.equal(
  requestedPaymentSchedule.projectedPayments.reduce((total, payment) => total + payment.amount, 0),
  136395
);

const requestedPaymentConceptKeys = new Set(
  requestedPaymentSchedule.projectedPayments.flatMap((payment) => [
    payment.conceptKey,
    payment.canonicalConceptKey,
  ])
);
assert.equal(requestedPaymentConceptKeys.has('production'), true);
assert.equal(requestedPaymentConceptKeys.has('productivity'), true);
assert.equal(requestedPaymentConceptKeys.has('activity'), false);
assert.equal(requestedPaymentConceptKeys.has('development'), false);
assert.equal(requestedPaymentConceptKeys.has('connection'), false);
assert.equal(requestedPaymentConceptKeys.has('fixedSupport'), false);
assert.equal(
  requestedPaymentSchedule.projectedPayments.every((payment) => payment.payoutTruth === false),
  true
);
assert.equal(
  requestedPaymentSchedule.warnings.some((warning) => String(warning).includes('unknown_payment_cadence')),
  false
);

const requestedProductionPayments = requestedPaymentSchedule.projectedPayments
  .filter((payment) => payment.canonicalConceptKey === 'production');
assert.deepEqual(requestedProductionPayments.map((payment) => payment.month), ['2026-04', '2026-05', '2026-06']);
assert.deepEqual(requestedProductionPayments.map((payment) => payment.amount), [945, 945, 945]);

const requestedProductivityPayments = requestedPaymentSchedule.projectedPayments
  .filter((payment) => payment.canonicalConceptKey === 'productivity');
assert.deepEqual(requestedProductivityPayments.map((payment) => payment.month), ['2026-04', '2026-05', '2026-06']);
assert.deepEqual(requestedProductivityPayments.map((payment) => payment.amount), [44520, 44520, 44520]);
assert.equal(partnerXRequestedSubtotal.subtotalRequestedConceptsCandidate, 136395);

const partnerXRequestedProductivityBaseFallback = calculatePartnerXQuarterlyCandidate({
  partner: {
    partnerId: 'PARTNER_X_005P_1_B1',
    partnerCareerMonth: 25,
    partnerConnectedYear: 2026,
    organizationType: 'nueva_organizacion',
    unitLIMRA: 80,
    unitIGC: 90,
    active: true,
  },
  requestedConcepts: ['production', 'productivityMultiplier'],
});
const fallbackExpectedAmount =
  partnerXRequestedProductivityBaseFallback.concepts.production.candidateAmount +
  partnerXRequestedProductivityBaseFallback.concepts.productivityBase.candidateAmount;
assert.ok(partnerXRequestedProductivityBaseFallback.concepts.productivityBase.candidateAmount > 0);
assert.equal(partnerXRequestedProductivityBaseFallback.concepts.productivityMultiplier.candidateAmount, null);
assert.equal(partnerXRequestedProductivityBaseFallback.subtotalRequestedConceptsCandidate, fallbackExpectedAmount);
assert.equal(partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.totals.projectedAmount, fallbackExpectedAmount);
assert.ok(partnerXRequestedProductivityBaseFallback.warnings.includes('productivity_multiplier_blocked_using_productivity_base'));
assert.equal(Array.isArray(partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments), true);
assert.equal(partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments.length, 6);
assert.equal(
  partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments.reduce((total, payment) => total + payment.amount, 0),
  fallbackExpectedAmount
);
const fallbackConceptKeys = new Set(
  partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments.flatMap((payment) => [
    payment.conceptKey,
    payment.canonicalConceptKey,
  ])
);
assert.equal(fallbackConceptKeys.has('production'), true);
assert.equal(fallbackConceptKeys.has('productivity'), true);
assert.equal(fallbackConceptKeys.has('activity'), false);
assert.equal(fallbackConceptKeys.has('development'), false);
assert.equal(fallbackConceptKeys.has('connection'), false);
assert.equal(fallbackConceptKeys.has('fixedSupport'), false);
assert.equal(
  partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments.every((payment) => payment.payoutTruth === false),
  true
);
const fallbackProductionPayments = partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments
  .filter((payment) => payment.canonicalConceptKey === 'production');
assert.deepEqual(fallbackProductionPayments.map((payment) => payment.amount), [945, 945, 945]);
const fallbackProductivityPayments = partnerXRequestedProductivityBaseFallback.requestedPaymentSchedule.projectedPayments
  .filter((payment) => payment.canonicalConceptKey === 'productivity');
assert.deepEqual(fallbackProductivityPayments.map((payment) => payment.amount), [31800, 31800, 31800]);

const partnerXRequestedAliases = calculatePartnerXQuarterlyCandidate({
  requestedConcepts: ['production-bonus', 'productivity-multiplier'],
});
assert.equal(partnerXRequestedAliases.subtotalRequestedConceptsCandidate, 136395);
assert.deepEqual(partnerXRequestedAliases.requestedConceptsApplied, ['production', 'productivityMultiplier']);

const partnerXRequestedMissing = calculatePartnerXQuarterlyCandidate({
  requestedConcepts: ['production', 'not-a-partner-concept'],
});
assert.equal(partnerXRequestedMissing.subtotalRequestedConceptsCandidate, 2835);
assert.deepEqual(partnerXRequestedMissing.requestedConceptsApplied, ['production']);
assert.deepEqual(partnerXRequestedMissing.requestedConceptsMissing, ['not-a-partner-concept']);
assert.equal(partnerXRequestedMissing.concepts.productivityMultiplier.candidateAmount, 133560);

function rawFact(month, vidaIndividual, gmmiIndividual, otherRamos, vidaPolicies, gmmiPolicies = 0) {
  return {
    month,
    initialCommissions: { vidaIndividual, gmmiIndividual, otherRamos },
    paidPolicies: { vidaIndividual: vidaPolicies, gmmiIndividual: gmmiPolicies },
  };
}

function qualifiedRawAdvisor(name, connectionDate) {
  return {
    name,
    connectionDate,
    active: true,
    monthlyFacts: [
      rawFact('2026-04', 4000, 3000, 3000, 4),
      rawFact('2026-05', 4000, 3000, 3000, 4),
      rawFact('2026-06', 4000, 3000, 3000, 4),
    ],
  };
}

const rawMonthlyFactsScenario = calculatePartnerQuarterlyBonusCandidate({
  partner: {
    partnerId: 'PARTNER_RAW_004G_B',
    connectionDate: '2024-04-01',
    organizationType: 'nueva_organizacion',
    unitLIMRA: 80,
    unitIGC: 90,
    active: true,
  },
  period: {
    type: 'quarter',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  },
  evidence: {
    paidAppliedEconomicEvidence: true,
    trainingAllowanceEvents: [
      { advisorId: 'TA1', date: '2026-01-15', inQuarter: false, activeGroup2: true, unitOnboardingSequence: 3 },
      { advisorId: 'TA2', date: '2026-03-15', inQuarter: false, activeGroup2: true, unitOnboardingSequence: 4 },
      { advisorId: 'TA3', date: '2026-05-15', inQuarter: true, activeGroup2: true, unitOnboardingSequence: 5 },
    ],
    supportAccumulatedCommissionActualByMonth: {
      '2026-04': 65025,
      '2026-05': 154500,
      '2026-06': 234500,
    },
  },
  advisors: [
    {
      name: 'Roberto',
      connectionDate: '2025-11-01',
      active: true,
      quarterPolicyTotal: 999,
      monthlyFacts: [
        rawFact('2026-04', 7000, 5000, 6000, 3, 2),
        rawFact('2026-05', 7000, 5000, 6000, 3, 2),
        rawFact('2026-06', 7000, 5000, 6001, 3, 2),
      ],
    },
    qualifiedRawAdvisor('Ana', '2026-01-01'),
    qualifiedRawAdvisor('Luis', '2026-01-01'),
    qualifiedRawAdvisor('Sofia', '2026-02-01'),
    qualifiedRawAdvisor('Mateo', '2026-03-01'),
    qualifiedRawAdvisor('Elena', '2025-12-01'),
    {
      name: 'Pamela',
      connectionDate: '2026-04-01',
      onboardingEvidence: true,
      active: true,
      monthlyFacts: [
        rawFact('2026-04', 2000, 2000, 2000, 1),
        rawFact('2026-05', 2000, 2000, 2000, 5),
        rawFact('2026-06', 2000, 2000, 2000, 5),
      ],
    },
  ],
});

const rawRoberto = rawMonthlyFactsScenario.qualificationSummary.normalizedAdvisors.find((advisor) => advisor.name === 'Roberto');
const rawRobertoQualification = rawMonthlyFactsScenario.qualificationSummary.advisors.find((advisor) => advisor.advisorId === 'Roberto');
assert.equal(rawMonthlyFactsScenario.qualificationSummary.qualifiedAdvisorCount, 6);
assert.equal(rawRoberto.advisorMonth, 8);
assert.equal(rawRoberto.quarterInitialCommissions, 54001);
assert.ok(Math.abs(rawRobertoQualification.averageMonthlyInitialCommissions - 18000.333333333332) < 0.0001);
assert.ok(Math.abs(rawRoberto.lifeIndividualShare - (21000 / 54001)) < 0.000001);
assert.equal(rawRoberto.qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi, 36000);
assert.equal(rawRoberto.monthlyAveragePolicies, 5);

const robertoProductivityPart = rawMonthlyFactsScenario.concepts.productivityBase.metadata.parts.find((part) => part.inputBasis === 54001);
assert.equal(robertoProductivityPart.candidatePercentage, 0.3);

const robertoActivityPart = rawMonthlyFactsScenario.concepts.activity.metadata.parts.find((part) => part.inputBasis === 36000);
assert.equal(robertoActivityPart.candidatePercentage, 0.25);
assert.equal(robertoActivityPart.candidateAmount, 9000);

const pamelaConnectionMonth3 = rawMonthlyFactsScenario.concepts.connection.metadata.parts.find((part) => (
  part.metadata.advisorId === 'Pamela' && Number(part.metadata.advisorMonth) === 3
));
assert.equal(pamelaConnectionMonth3.candidateAmount, 15000);
assert.equal(pamelaConnectionMonth3.metadata.ownershipSourceTruth.status, 'not_required_legacy_mode');
assert.equal(pamelaConnectionMonth3.metadata.ownershipSourceTruth.reason, 'partner_ownership_source_truth_not_required');
assert.equal(pamelaConnectionMonth3.metadata.ownershipSourceTruth.payoutTruth, false);

const developmentMonths = rawMonthlyFactsScenario.concepts.development.metadata.parts
  .filter((part) => part.metadata.advisorId === 'Ana')
  .map((part) => Number(part.metadata.advisorMonth));
assert.deepEqual(developmentMonths, [4, 5, 6]);
const anaDevelopmentOwnershipMarkers = rawMonthlyFactsScenario.concepts.development.metadata.parts
  .filter((part) => part.metadata.advisorId === 'Ana')
  .map((part) => part.metadata.ownershipSourceTruth?.status);
assert.deepEqual(anaDevelopmentOwnershipMarkers, [
  'not_required_legacy_mode',
  'not_required_legacy_mode',
  'not_required_legacy_mode',
]);

const supportCareerMonths = rawMonthlyFactsScenario.concepts.fixedSupport.metadata.parts.map((part) => part.partnerCareerMonth);
assert.deepEqual(supportCareerMonths, [25, 26, 27]);
assert.equal(rawMonthlyFactsScenario.concepts.fixedSupport.candidateAmount, 61275);
assert.equal(rawMonthlyFactsScenario.partner.partnerCareerMonthAtPeriodStart, 25);
assert.equal(rawMonthlyFactsScenario.partner.partnerCareerMonthAtPeriodEnd, 27);
assert.equal(rawMonthlyFactsScenario.concepts.productivityMultiplier.metadata.qualifiedAdvisorCount, 6);

console.log('PASS partner-quarterly-bonus-calculator-test');


{
  const requiredOwnershipBlocksAdvisorRdaConnection = calculatePartnerQuarterlyBonusCandidate({
    partner: {
      partnerId: 'Juan',
      partnerCareerMonth: 12,
      partnerConnectedYear: 2026,
      organizationType: 'nueva_organizacion',
      unitLIMRA: 80,
      unitIGC: 90,
      active: true,
    },
    period: { type: 'quarter', quarter: 'Q1', year: 2026 },
    evidence: {
      paidAppliedEconomicEvidence: true,
      partnerOwnershipSourceTruthRequired: true,
    },
    advisors: [
      {
        name: 'Fer',
        advisorId: 'Fer',
        advisorMonth: 1,
        monthlyPolicies: 0,
        quarterPolicyTotal: 0,
        activeAtQuarterClose: true,
        activeAtMonthClose: true,
        onboardingEvidence: true,
        paidAppliedPolicyEvidence: true,
        LIMRA: 80,
        IGC: 90,
        relationshipAttributions: {
          connection: {
            status: 'confirmed',
            relationshipType: 'connection',
            advisorId: 'Fer',
            connectionOwnerType: 'advisor',
            connectionOwnerId: 'Pamela',
            rdaStatus: 'confirmed',
            rdaOwnerId: 'Pamela',
            payoutTruth: false,
          },
        },
      },
    ],
  });

  assert.equal(requiredOwnershipBlocksAdvisorRdaConnection.concepts.connection.candidateAmount, null);
  assert.ok(requiredOwnershipBlocksAdvisorRdaConnection.concepts.connection.blockedReasons.includes(
    'blocked_partner_cannot_claim_advisor_rda_connection',
  ));
  assert.equal(requiredOwnershipBlocksAdvisorRdaConnection.payoutTruth, false);
  console.log('PASS quarterly partner connection blocks advisor RDA ownership claim');
}

{
  const requiredOwnershipAllowsDirectPartnerConnection = calculatePartnerQuarterlyBonusCandidate({
    partner: {
      partnerId: 'Juan',
      partnerCareerMonth: 12,
      partnerConnectedYear: 2026,
      organizationType: 'nueva_organizacion',
      unitLIMRA: 80,
      unitIGC: 90,
      active: true,
    },
    period: { type: 'quarter', quarter: 'Q1', year: 2026 },
    evidence: {
      paidAppliedEconomicEvidence: true,
      partnerOwnershipSourceTruthRequired: true,
    },
    advisors: [
      {
        name: 'Roberto',
        advisorId: 'Roberto',
        advisorMonth: 1,
        monthlyPolicies: 0,
        quarterPolicyTotal: 0,
        activeAtQuarterClose: true,
        activeAtMonthClose: true,
        onboardingEvidence: true,
        paidAppliedPolicyEvidence: true,
        LIMRA: 80,
        IGC: 90,
        relationshipAttributions: {
          connection: {
            status: 'confirmed',
            relationshipType: 'connection',
            advisorId: 'Roberto',
            connectionOwnerType: 'partner',
            connectionOwnerId: 'Juan',
            rdaStatus: 'not_applicable',
            rdaOwnerId: null,
            payoutTruth: false,
          },
        },
      },
    ],
  });

  assert.equal(requiredOwnershipAllowsDirectPartnerConnection.concepts.connection.candidateAmount, 7500);
  const directConnectionPart = requiredOwnershipAllowsDirectPartnerConnection.concepts.connection.metadata.parts[0];
  assert.equal(directConnectionPart.metadata.ownershipSourceTruth.status, 'confirmed');
  assert.equal(directConnectionPart.metadata.ownershipSourceTruth.metadata.rdaStatus, 'not_applicable');
  assert.equal(requiredOwnershipAllowsDirectPartnerConnection.payoutTruth, false);
  console.log('PASS quarterly partner connection allows direct partner ownership');
}

{
  const requiredOwnershipAppliesSharedDevelopment = calculatePartnerQuarterlyBonusCandidate({
    partner: {
      partnerId: 'Juan',
      partnerCareerMonth: 12,
      partnerConnectedYear: 2026,
      organizationType: 'nueva_organizacion',
      unitLIMRA: 80,
      unitIGC: 90,
      active: true,
    },
    period: { type: 'quarter', quarter: 'Q1', year: 2026 },
    evidence: {
      paidAppliedEconomicEvidence: true,
      partnerOwnershipSourceTruthRequired: true,
    },
    advisors: [
      {
        name: 'Fer',
        advisorId: 'Fer',
        advisorMonth: 4,
        monthlyPolicies: 3,
        quarterPolicyTotal: 3,
        activeAtQuarterClose: true,
        paidAppliedPolicyEvidence: true,
        developerEligibilityEvidence: true,
        LIMRA: 80,
        IGC: 90,
        relationshipAttributions: {
          development: {
            status: 'confirmed',
            relationshipType: 'development',
            advisorId: 'Fer',
            developmentOwnerType: 'partner',
            developmentOwnerId: 'Juan',
            developerShare: 0.5,
            payoutTruth: false,
          },
        },
      },
    ],
  });

  assert.equal(requiredOwnershipAppliesSharedDevelopment.concepts.development.candidateAmount, 4500);
  const sharedDevelopmentPart = requiredOwnershipAppliesSharedDevelopment.concepts.development.metadata.parts[0];
  assert.equal(sharedDevelopmentPart.metadata.shareFactor, 0.5);
  assert.equal(sharedDevelopmentPart.metadata.ownershipSourceTruth.status, 'confirmed');
  assert.equal(requiredOwnershipAppliesSharedDevelopment.payoutTruth, false);
  console.log('PASS quarterly partner development applies Manager OS shared developerShare');
}

{
  const requiredOwnershipBlocksMissingAttribution = calculatePartnerQuarterlyBonusCandidate({
    partner: {
      partnerId: 'Juan',
      partnerCareerMonth: 12,
      partnerConnectedYear: 2026,
      organizationType: 'nueva_organizacion',
      unitLIMRA: 80,
      unitIGC: 90,
      active: true,
    },
    period: { type: 'quarter', quarter: 'Q1', year: 2026 },
    evidence: {
      paidAppliedEconomicEvidence: true,
      partnerOwnershipSourceTruthRequired: true,
    },
    advisors: [
      {
        name: 'Roberto',
        advisorId: 'Roberto',
        advisorMonth: 1,
        monthlyPolicies: 0,
        quarterPolicyTotal: 0,
        activeAtQuarterClose: true,
        activeAtMonthClose: true,
        onboardingEvidence: true,
        paidAppliedPolicyEvidence: true,
        LIMRA: 80,
        IGC: 90,
      },
    ],
  });

  assert.equal(requiredOwnershipBlocksMissingAttribution.concepts.connection.candidateAmount, null);
  assert.ok(requiredOwnershipBlocksMissingAttribution.concepts.connection.blockedReasons.includes(
    'blocked_by_missing_manager_precontract_attribution',
  ));
  assert.equal(requiredOwnershipBlocksMissingAttribution.payoutTruth, false);
  console.log('PASS quarterly partner ownership required blocks missing Manager OS attribution');
}
