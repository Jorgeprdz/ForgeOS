
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

const baseEvidence = {
  paidAppliedEconomicEvidence: true,
  partnerOwnershipSourceTruthRequired: true,
};

const period = { type: 'quarter', quarter: 'Q1', year: 2026 };

function runCase({ label, advisors, expected }) {
  const result = calculatePartnerQuarterlyBonusCandidate({
    partner: partnerJuan,
    period,
    evidence: baseEvidence,
    advisors,
  });

  const connectionAmount = result.concepts.connection.candidateAmount;
  const developmentAmount = result.concepts.development.candidateAmount;
  const connectionReasons = result.concepts.connection.blockedReasons || [];
  const developmentReasons = result.concepts.development.blockedReasons || [];

  assert.equal(result.payoutTruth, false);

  if ('connectionAmount' in expected) {
    assert.equal(connectionAmount, expected.connectionAmount);
  }

  if ('developmentAmount' in expected) {
    assert.equal(developmentAmount, expected.developmentAmount);
  }

  if (expected.connectionBlockedReason) {
    assert.ok(
      connectionReasons.includes(expected.connectionBlockedReason),
      `${label}: missing connection reason ${expected.connectionBlockedReason}`,
    );
  }

  if (expected.developmentBlockedReason) {
    assert.ok(
      developmentReasons.includes(expected.developmentBlockedReason),
      `${label}: missing development reason ${expected.developmentBlockedReason}`,
    );
  }

  return {
    label,
    connectionAmount,
    developmentAmount,
    payoutTruth: result.payoutTruth,
    reasons: [...connectionReasons, ...developmentReasons],
  };
}

const rows = [];

rows.push(runCase({
  label: 'Fer RDA de Pamela: Juan NO puede reclamar conexión',
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
  expected: {
    connectionAmount: null,
    connectionBlockedReason: 'blocked_partner_cannot_claim_advisor_rda_connection',
  },
}));

rows.push(runCase({
  label: 'Fer desarrollado por Juan 50%: Juan SÍ recibe desarrollo parcial',
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
  expected: {
    developmentAmount: 4500,
  },
}));

rows.push(runCase({
  label: 'Roberto conexión directa de Juan: Juan SÍ recibe conexión',
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
  expected: {
    connectionAmount: 7500,
  },
}));

rows.push(runCase({
  label: 'Roberto desarrollado por Juan 100%: Juan SÍ recibe desarrollo completo',
  advisors: [
    {
      name: 'Roberto',
      advisorId: 'Roberto',
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
          advisorId: 'Roberto',
          developmentOwnerType: 'partner',
          developmentOwnerId: 'Juan',
          developerShare: 1.0,
          payoutTruth: false,
        },
      },
    },
  ],
  expected: {
    developmentAmount: 9000,
  },
}));

rows.push(runCase({
  label: 'Ownership requerido sin Manager OS attribution: bloquea conexión',
  advisors: [
    {
      name: 'SinEvidence',
      advisorId: 'SinEvidence',
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
  expected: {
    connectionAmount: null,
    connectionBlockedReason: 'blocked_by_missing_manager_precontract_attribution',
  },
}));

for (const row of rows) {
  console.log(
    `PASS ${row.label} | connection=${row.connectionAmount ?? 'null'} | development=${row.developmentAmount ?? 'null'} | payoutTruth=${row.payoutTruth}`,
  );
}

console.log('PASS partner-ownership-real-scenario-blackbox-test');
