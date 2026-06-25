
import assert from 'node:assert/strict';

import {
  calculatePartnerQuarterlyBonusCandidate,
} from '../compensation/partner-manager/partner-quarterly-bonus-calculator.js';

const partnerJuan = {
  partnerId: 'Juan',
  partnerCareerMonth: 12,
  partnerConnectedYear: 2026,
  organizationType: 'nueva_organizacion',
  unitLIMRA: 80,
  unitIGC: 90,
  active: true,
};

const result = calculatePartnerQuarterlyBonusCandidate({
  partner: partnerJuan,
  period: { type: 'quarter', quarter: 'Q1', year: 2026 },
  evidence: {
    paidAppliedEconomicEvidence: true,
    partnerOwnershipSourceTruthRequired: true,
  },
  advisors: [
    {
      name: 'Fer RDA Pamela',
      advisorId: 'FerRdaPamela',
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
          advisorId: 'FerRdaPamela',
          connectionOwnerType: 'advisor',
          connectionOwnerId: 'Pamela',
          rdaStatus: 'confirmed',
          rdaOwnerId: 'Pamela',
          payoutTruth: false,
        },
      },
    },
    {
      name: 'Roberto Direct Juan',
      advisorId: 'RobertoDirectJuan',
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
          advisorId: 'RobertoDirectJuan',
          connectionOwnerType: 'partner',
          connectionOwnerId: 'Juan',
          rdaStatus: 'not_applicable',
          rdaOwnerId: null,
          payoutTruth: false,
        },
      },
    },
    {
      name: 'Yesi Shared Development',
      advisorId: 'YesiSharedDevelopment',
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
          advisorId: 'YesiSharedDevelopment',
          developmentOwnerType: 'partner',
          developmentOwnerId: 'Juan',
          developerShare: 0.5,
          payoutTruth: false,
        },
      },
    },
    {
      name: 'Missing Manager OS Attribution',
      advisorId: 'MissingManagerOsAttribution',
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

assert.equal(result.payoutTruth, false);

assert.equal(result.concepts.connection.candidateAmount, 7500);
assert.equal(result.concepts.development.candidateAmount, 4500);

assert.ok(result.concepts.connection.blockedReasons.includes(
  'blocked_partner_cannot_claim_advisor_rda_connection',
));
assert.ok(result.concepts.connection.blockedReasons.includes(
  'blocked_by_missing_manager_precontract_attribution',
));

assert.equal(result.concepts.connection.warnings.includes(
  'partner_ownership_source_truth_not_required',
), false);
assert.equal(result.concepts.development.warnings.includes(
  'partner_ownership_source_truth_not_required',
), false);
assert.equal(result.warnings.includes(
  'partner_ownership_source_truth_not_required',
), false);

assert.deepEqual(result.concepts.connection.metadata.ownershipSourceTruth, {
  required: true,
  status: 'mixed_confirmed_and_blocked',
  evaluatedParts: 3,
  confirmedParts: 1,
  blockedParts: 2,
  legacyParts: 0,
  totalParts: 3,
  payoutTruth: false,
});

assert.deepEqual(result.concepts.development.metadata.ownershipSourceTruth, {
  required: true,
  status: 'confirmed',
  evaluatedParts: 1,
  confirmedParts: 1,
  blockedParts: 0,
  legacyParts: 0,
  totalParts: 1,
  payoutTruth: false,
});

const connectionParts = result.concepts.connection.metadata.parts;
const developmentParts = result.concepts.development.metadata.parts;

const robertoConnection = connectionParts.find((part) => (
  part.metadata.advisorId === 'RobertoDirectJuan'
));
assert.equal(robertoConnection.candidateAmount, 7500);
assert.equal(robertoConnection.metadata.ownershipSourceTruth.status, 'confirmed');
assert.equal(robertoConnection.metadata.ownershipSourceTruth.payoutTruth, false);

const ferConnection = connectionParts.find((part) => (
  part.metadata.advisorId === 'FerRdaPamela'
));
assert.equal(ferConnection.candidateAmount, null);
assert.equal(
  ferConnection.metadata.ownershipSourceTruth.blockedReasons.includes(
    'blocked_partner_cannot_claim_advisor_rda_connection',
  ),
  true,
);

const missingConnection = connectionParts.find((part) => (
  part.metadata.advisorId === 'MissingManagerOsAttribution'
));
assert.equal(missingConnection.candidateAmount, null);
assert.equal(
  missingConnection.metadata.ownershipSourceTruth.blockedReasons.includes(
    'blocked_by_missing_manager_precontract_attribution',
  ),
  true,
);

const yesiDevelopment = developmentParts.find((part) => (
  part.metadata.advisorId === 'YesiSharedDevelopment'
));
assert.equal(yesiDevelopment.candidateAmount, 4500);
assert.equal(yesiDevelopment.metadata.ownershipSourceTruth.status, 'confirmed');
assert.equal(yesiDevelopment.metadata.ownershipSourceTruth.payoutTruth, false);

console.log('PASS mixed required ownership quarter regression');
