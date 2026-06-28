import assert from 'node:assert/strict';

import {
  calculatePartnerMonthlyIncomeCandidates,
} from '../compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js';

const requiredConceptKeys = Object.freeze([
  'fixed-support',
  'connection',
  'development',
  'production',
  'productivity',
  'activity',
]);

const MONTH_KEY_BY_ALIAS = Object.freeze({
  jan: '2026-01',
  feb: '2026-02',
  mar: '2026-03',
  apr: '2026-04',
  may: '2026-05',
  jun: '2026-06',
});

const fact = (month, commissions, policies) => ({
  month,
  initialCommissions: {
    vidaIndividual: commissions,
    gmmiIndividual: 0,
    otherRamos: 0,
  },
  paidPolicies: {
    vidaIndividual: policies,
    gmmiIndividual: 0,
  },
});

function advisor({
  partnerId,
  advisorId,
  name,
  connectionDate,
  hireOrder,
  isRda = false,
  isDirectConnection = false,
  developmentShare = 1,
  limra,
  igc,
  months,
}) {
  return {
    advisorId,
    name,
    connectionDate,
    hireOrder,
    isRda,
    isDirectConnection,
    developmentShare,
    active: true,
    LIMRA: limra,
    IGC: igc,
    paidAppliedPolicyEvidence: true,
    developerEligibilityEvidence: true,
    relationshipAttributions: {
      ...(isDirectConnection
        ? {
          connection: {
            status: 'confirmed',
            relationshipType: 'connection',
            advisorId,
            connectionOwnerType: 'partner',
            connectionOwnerId: partnerId,
            payoutTruth: false,
          },
        }
        : {}),
      development: {
        status: 'confirmed',
        relationshipType: 'development',
        advisorId,
        developmentOwnerType: 'partner',
        developmentOwnerId: partnerId,
        developerShare: developmentShare,
        payoutTruth: false,
      },
    },
    monthlyFacts: Object.entries(MONTH_KEY_BY_ALIAS).map(([alias, month]) => {
      const row = months[alias] || { policies: 0, commissions: 0 };
      return fact(month, row.commissions, row.policies);
    }),
  };
}

function buildScenario({
  scenarioId,
  partnerId,
  limra,
  igc,
  firstTwoHiresAdvisorIds,
  advisors,
}) {
  return {
    scenarioId,
    partner: {
      partnerId,
      partnerName: `Partner ${scenarioId}`,
      partnerContractDate: '2025-10-01',
      connectionDate: '2025-10-01',
      active: true,
      partnerCareerMonthByPaymentMonth: {
        '2026-04': 7,
        '2026-05': 8,
        '2026-06': 9,
      },
      limra,
      igc,
      organizationType: 'nueva_organizacion',
      firstTwoHiresExcludedFromTaGoal: true,
      firstTwoHiresAdvisorIds,
    },
    advisors: advisors.map((entry) => advisor({
      ...entry,
      partnerId,
      limra,
      igc,
    })),
    paymentMonths: ['2026-04', '2026-05', '2026-06'],
    evidence: {
      paidAppliedEconomicEvidence: true,
      partnerOwnershipSourceTruthRequired: true,
      trainingWinnerInQuarter: true,
      signedPrecontractsLastSixMonths: 5,
      newAdvisorsLastSixMonths: 5,
      trainingAdvisorWinnersLastSixMonths: 5,
      trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion: 3,
      trainingAdvisorWinnerEvidenceCount: 3,
      firstTwoHiresExclusionApplied: true,
      firstTwoHiresExclusionEvidence: true,
      excludedAdvisorIds: firstTwoHiresAdvisorIds,
    },
  };
}

const pruebaA = buildScenario({
  scenarioId: 'PRUEBA_A_FIXED_MONTH7',
  partnerId: 'P-M7-001',
  limra: 0.78,
  igc: 0.86,
  firstTwoHiresAdvisorIds: ['A1', 'A2'],
  advisors: [
    {
      advisorId: 'A1',
      name: 'Ana Torres',
      connectionDate: '2026-01-02',
      hireOrder: 1,
      months: {
        jan: { policies: 3, commissions: 35000 },
        feb: { policies: 4, commissions: 35000 },
        mar: { policies: 4, commissions: 35000 },
        apr: { policies: 5, commissions: 35000 },
        may: { policies: 4, commissions: 34000 },
      },
    },
    {
      advisorId: 'A2',
      name: 'Bruno RDA',
      connectionDate: '2026-01-08',
      hireOrder: 2,
      isRda: true,
      months: {
        jan: { policies: 2, commissions: 25000 },
        feb: { policies: 3, commissions: 25000 },
        mar: { policies: 3, commissions: 25000 },
        apr: { policies: 4, commissions: 25000 },
        may: { policies: 3, commissions: 28000 },
      },
    },
    {
      advisorId: 'A3',
      name: 'Carla Nueva Org',
      connectionDate: '2026-01-15',
      hireOrder: 3,
      months: {
        jan: { policies: 2, commissions: 14000 },
        feb: { policies: 2, commissions: 14000 },
        mar: { policies: 3, commissions: 14000 },
        apr: { policies: 3, commissions: 15000 },
        may: { policies: 2, commissions: 12000 },
      },
    },
    {
      advisorId: 'A4',
      name: 'Diego Conexión Directa Febrero',
      connectionDate: '2026-02-05',
      hireOrder: 4,
      isDirectConnection: true,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 3, commissions: 20000 },
        mar: { policies: 4, commissions: 20000 },
        apr: { policies: 5, commissions: 22000 },
        may: { policies: 5, commissions: 24000 },
      },
    },
    {
      advisorId: 'A5',
      name: 'Elena Alta Marzo',
      connectionDate: '2026-03-05',
      hireOrder: 5,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 1, commissions: 6000 },
        apr: { policies: 4, commissions: 18000 },
        may: { policies: 4, commissions: 22000 },
      },
    },
  ],
});

const pruebaB = buildScenario({
  scenarioId: 'PRUEBA_B_RANDOM_MONTH7_SEED_1782616597',
  partnerId: 'P-M7-B',
  limra: 0.85,
  igc: 0.83,
  firstTwoHiresAdvisorIds: ['B1', 'B2'],
  advisors: [
    {
      advisorId: 'B1',
      name: 'Sofía Romero',
      connectionDate: '2026-01-08',
      hireOrder: 1,
      months: {
        jan: { policies: 1, commissions: 38000 },
        feb: { policies: 1, commissions: 25000 },
        mar: { policies: 4, commissions: 14000 },
        apr: { policies: 4, commissions: 25000 },
        may: { policies: 4, commissions: 50000 },
      },
    },
    {
      advisorId: 'B2',
      name: 'Gael Romero',
      connectionDate: '2026-01-21',
      hireOrder: 2,
      months: {
        jan: { policies: 1, commissions: 20000 },
        feb: { policies: 1, commissions: 36000 },
        mar: { policies: 3, commissions: 28000 },
        apr: { policies: 2, commissions: 39000 },
        may: { policies: 4, commissions: 27000 },
      },
    },
    {
      advisorId: 'B3',
      name: 'Emiliano Méndez',
      connectionDate: '2026-02-04',
      hireOrder: 3,
      isRda: true,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 2, commissions: 18000 },
        mar: { policies: 3, commissions: 24000 },
        apr: { policies: 3, commissions: 19000 },
        may: { policies: 3, commissions: 13000 },
      },
    },
    {
      advisorId: 'B4',
      name: 'Rodrigo Salas',
      connectionDate: '2026-03-06',
      hireOrder: 4,
      isDirectConnection: true,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 4, commissions: 21000 },
        apr: { policies: 6, commissions: 31000 },
        may: { policies: 3, commissions: 27000 },
      },
    },
    {
      advisorId: 'B5',
      name: 'Héctor Núñez',
      connectionDate: '2026-03-20',
      hireOrder: 5,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 2, commissions: 29000 },
        apr: { policies: 3, commissions: 21000 },
        may: { policies: 4, commissions: 20000 },
      },
    },
  ],
});

const monthKeys = Object.freeze(['jan', 'feb', 'mar', 'apr', 'may', 'jun']);

function rawAdvisor({
  advisorId,
  name,
  connectionDate,
  hireOrder,
  isRda = false,
  isDirectConnection = false,
  developmentShare = 1,
  values,
}) {
  return {
    advisorId,
    name,
    connectionDate,
    hireOrder,
    isRda,
    isDirectConnection,
    developmentShare,
    active: true,
    taWinnerEvidence: true,
    months: Object.fromEntries(monthKeys.map((monthKey, index) => {
      const pair = values[index] || [0, 0];
      return [monthKey, { policies: pair[0], commissions: pair[1] }];
    })),
  };
}

function buildRawSeedScenario({
  label,
  seed,
  partnerId,
  limra,
  igc,
  advisors,
}) {
  return {
    scenarioId: `PRUEBA_${label}_${seed}`,
    seed,
    partner: {
      partnerId,
      partnerName: `Partner Prueba ${label} Mes 7`,
      partnerContractDate: '2025-10-01',
      active: true,
      partnerCareerMonthByPaymentMonth: {
        '2026-04': 7,
        '2026-05': 8,
        '2026-06': 9,
      },
      limra,
      igc,
      noSharedDevelopment: true,
      firstTwoHiresExcludedFromTaGoal: true,
      firstTwoHiresAdvisorIds: [`${label}1`, `${label}2`],
    },
    advisors,
    paymentMonths: ['2026-04', '2026-05', '2026-06'],
  };
}

const pruebaC = buildRawSeedScenario({
  label: 'C',
  seed: 'FORGE-C-MONTH7-2026-001',
  partnerId: 'P-M7-C',
  limra: 0.83,
  igc: 0.93,
  advisors: [
    rawAdvisor({ advisorId: 'C1', name: 'Nicolas Santos', connectionDate: '2026-01-08', hireOrder: 1, isRda: true, values: [[3, 44000], [1, 20000], [4, 39000], [2, 24000], [3, 26000]] }),
    rawAdvisor({ advisorId: 'C2', name: 'Paola Campos', connectionDate: '2026-01-25', hireOrder: 2, values: [[3, 21000], [4, 43000], [2, 22000], [3, 43000], [2, 48000]] }),
    rawAdvisor({ advisorId: 'C3', name: 'Tomas Castillo', connectionDate: '2026-02-04', hireOrder: 3, values: [[0, 0], [2, 17000], [1, 15000], [6, 40000], [6, 28000]] }),
    rawAdvisor({ advisorId: 'C4', name: 'Tomas Castillo', connectionDate: '2026-03-16', hireOrder: 4, isDirectConnection: true, values: [[0, 0], [0, 0], [4, 23000], [2, 31000], [6, 33000]] }),
    rawAdvisor({ advisorId: 'C5', name: 'Nicolas Santos', connectionDate: '2026-03-22', hireOrder: 5, values: [[0, 0], [0, 0], [4, 11000], [5, 38000], [4, 20000]] }),
  ],
});

const pruebaD = buildRawSeedScenario({
  label: 'D',
  seed: 'FORGE-D-MONTH7-2026-002',
  partnerId: 'P-M7-D',
  limra: 0.82,
  igc: 0.89,
  advisors: [
    rawAdvisor({ advisorId: 'D1', name: 'Luis Ortega', connectionDate: '2026-01-09', hireOrder: 1, isRda: true, values: [[3, 42000], [2, 16000], [1, 37000], [5, 38000], [6, 44000]] }),
    rawAdvisor({ advisorId: 'D2', name: 'Mauricio Vega', connectionDate: '2026-01-25', hireOrder: 2, values: [[2, 25000], [1, 42000], [1, 16000], [5, 54000], [6, 36000]] }),
    rawAdvisor({ advisorId: 'D3', name: 'Nicolas Santos', connectionDate: '2026-02-07', hireOrder: 3, values: [[0, 0], [2, 13000], [2, 17000], [4, 20000], [4, 36000]] }),
    rawAdvisor({ advisorId: 'D4', name: 'Diego Rivas', connectionDate: '2026-03-11', hireOrder: 4, isDirectConnection: true, values: [[0, 0], [0, 0], [3, 19000], [6, 37000], [6, 40000]] }),
    rawAdvisor({ advisorId: 'D5', name: 'Luis Ortega', connectionDate: '2026-03-22', hireOrder: 5, values: [[0, 0], [0, 0], [1, 23000], [3, 25000], [2, 40000]] }),
  ],
});

const pruebaE = buildRawSeedScenario({
  label: 'E',
  seed: 'FORGE-E-MONTH7-2026-003',
  partnerId: 'P-M7-E',
  limra: 0.91,
  igc: 0.97,
  advisors: [
    rawAdvisor({ advisorId: 'E1', name: 'Luis Ortega', connectionDate: '2026-01-07', hireOrder: 1, values: [[2, 30000], [2, 33000], [3, 24000], [4, 54000], [6, 41000]] }),
    rawAdvisor({ advisorId: 'E2', name: 'Nicolas Santos', connectionDate: '2026-01-13', hireOrder: 2, values: [[1, 34000], [4, 21000], [4, 24000], [5, 19000], [3, 32000]] }),
    rawAdvisor({ advisorId: 'E3', name: 'Nicolas Santos', connectionDate: '2026-02-12', hireOrder: 3, values: [[0, 0], [3, 19000], [3, 25000], [2, 30000], [4, 36000]] }),
    rawAdvisor({ advisorId: 'E4', name: 'Mauricio Vega', connectionDate: '2026-03-05', hireOrder: 4, isRda: true, values: [[0, 0], [0, 0], [3, 16000], [5, 25000], [5, 17000]] }),
    rawAdvisor({ advisorId: 'E5', name: 'Tomas Castillo', connectionDate: '2026-03-18', hireOrder: 5, isDirectConnection: true, values: [[0, 0], [0, 0], [2, 27000], [5, 17000], [4, 27000]] }),
  ],
});

const pruebaF = buildRawSeedScenario({
  label: 'F',
  seed: 'FORGE-F-MONTH7-2026-004',
  partnerId: 'P-M7-F',
  limra: 0.82,
  igc: 0.87,
  advisors: [
    rawAdvisor({ advisorId: 'F1', name: 'Fernanda Nunez', connectionDate: '2026-01-06', hireOrder: 1, isRda: true, values: [[1, 21000], [3, 40000], [3, 38000], [5, 33000], [2, 45000]] }),
    rawAdvisor({ advisorId: 'F2', name: 'Paola Campos', connectionDate: '2026-01-14', hireOrder: 2, values: [[1, 33000], [3, 35000], [1, 28000], [5, 51000], [4, 54000]] }),
    rawAdvisor({ advisorId: 'F3', name: 'Fernanda Nunez', connectionDate: '2026-02-08', hireOrder: 3, values: [[0, 0], [2, 25000], [2, 20000], [6, 28000], [3, 38000]] }),
    rawAdvisor({ advisorId: 'F4', name: 'Ximena Aguilar', connectionDate: '2026-03-15', hireOrder: 4, isDirectConnection: true, values: [[0, 0], [0, 0], [1, 30000], [3, 17000], [3, 27000]] }),
    rawAdvisor({ advisorId: 'F5', name: 'Nicolas Santos', connectionDate: '2026-03-25', hireOrder: 5, values: [[0, 0], [0, 0], [2, 19000], [5, 35000], [5, 23000]] }),
  ],
});


const pruebaG = {
  scenarioId: 'PRUEBA_G_SHARED_DEVELOPMENT_DEFAULT_INDEXES_Q1',
  partner: {
    partnerId: 'P-M7-G',
    partnerName: 'Partner Prueba G Shared Development',
    partnerContractDate: '2025-10-01',
    connectionDate: '2025-10-01',
    active: true,
    partnerCareerMonthByPaymentMonth: {
      '2026-04': 7,
      '2026-05': 8,
      '2026-06': 9,
    },
    limra: 0.92,
    igc: 0.96,
    organizationType: 'nueva_organizacion',
    sharedDevelopment: true,
    noSharedDevelopment: false,
    firstTwoHiresExcludedFromTaGoal: true,
    firstTwoHiresAdvisorIds: ['G1', 'G2'],
  },
  advisors: [
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G1',
      name: 'Mariana Pineda',
      connectionDate: '2026-01-04',
      hireOrder: 1,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 3, commissions: 42000 },
        feb: { policies: 3, commissions: 39000 },
        mar: { policies: 4, commissions: 45000 },
        apr: { policies: 5, commissions: 48000 },
        may: { policies: 5, commissions: 52000 },
        jun: { policies: 5, commissions: 51000 },
      },
    }),
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G2',
      name: 'Luis Campos',
      connectionDate: '2026-01-18',
      hireOrder: 2,
      isRda: true,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 2, commissions: 28000 },
        feb: { policies: 3, commissions: 31000 },
        mar: { policies: 4, commissions: 37000 },
        apr: { policies: 4, commissions: 42000 },
        may: { policies: 5, commissions: 46000 },
        jun: { policies: 5, commissions: 47000 },
      },
    }),
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G3',
      name: 'Renata Luna',
      connectionDate: '2026-02-06',
      hireOrder: 3,
      isDirectConnection: true,
      developmentShare: 0.5,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 3, commissions: 26000 },
        mar: { policies: 4, commissions: 34000 },
        apr: { policies: 5, commissions: 41000 },
        may: { policies: 5, commissions: 44000 },
        jun: { policies: 5, commissions: 43000 },
      },
    }),
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G4',
      name: 'Diego Navarro',
      connectionDate: '2026-02-20',
      hireOrder: 4,
      developmentShare: 0.75,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 2, commissions: 18000 },
        mar: { policies: 3, commissions: 29000 },
        apr: { policies: 4, commissions: 35000 },
        may: { policies: 5, commissions: 43000 },
        jun: { policies: 5, commissions: 42000 },
      },
    }),
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G5',
      name: 'Ximena Aguilar',
      connectionDate: '2026-03-10',
      hireOrder: 5,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 3, commissions: 27000 },
        apr: { policies: 4, commissions: 39000 },
        may: { policies: 4, commissions: 41000 },
        jun: { policies: 4, commissions: 40000 },
      },
    }),
    advisor({
      partnerId: 'P-M7-G',
      advisorId: 'G6',
      name: 'Tomas Vega',
      connectionDate: '2026-04-03',
      hireOrder: 6,
      developmentShare: 0.25,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 0, commissions: 0 },
        apr: { policies: 3, commissions: 22000 },
        may: { policies: 4, commissions: 36000 },
        jun: { policies: 4, commissions: 37000 },
      },
    }),
  ],
  paymentMonths: ['2026-04', '2026-05', '2026-06'],
  evidence: {
    paidAppliedEconomicEvidence: true,
    partnerOwnershipSourceTruthRequired: true,
    trainingWinnerInQuarter: true,
    taCountingEventEvidence: true,
    trainingAllowanceEvents: [
      {
        advisorId: 'G3',
        date: '2026-03-15',
        wonTrainingAllowanceFirstTimeInQuarter: true,
        inQuarter: true,
        activeAtPeriodClose: true,
        activeGroup2: true,
        unitOnboardingSequence: 3,
        countsForSupport: true,
      },
    ],
    signedPrecontractsLastSixMonths: 6,
    newAdvisorsLastSixMonths: 6,
    trainingAdvisorWinnersLastSixMonths: 6,
    trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion: 4,
    trainingAdvisorWinnerEvidenceCount: 4,
    firstTwoHiresExclusionApplied: true,
    firstTwoHiresExclusionEvidence: true,
    excludedAdvisorIds: ['G1', 'G2'],
  },
};


function assertConceptContract(monthResult, conceptKey) {
  const concept = monthResult.concepts[conceptKey];
  assert.ok(concept, `${monthResult.paymentMonth} ${conceptKey} result must exist`);
  assert.equal(concept.conceptKey, conceptKey, `${conceptKey} stable conceptKey required`);
  assert.equal(concept.payoutTruth, false, `${conceptKey} must keep payoutTruth false`);
  assert.equal(Number.isFinite(concept.amount), true, `${conceptKey} must return numeric amount`);
  assert.equal(Number.isFinite(concept.candidateAmount), true, `${conceptKey} must return numeric candidateAmount`);
  assert.equal(concept.amount, concept.candidateAmount, `${conceptKey} amount and candidateAmount must match`);
  assert.equal(typeof concept.source, 'string', `${conceptKey} must expose source`);
  assert.ok(Array.isArray(concept.blockingReasons), `${conceptKey} must expose blockingReasons array`);
  assert.ok(Object.hasOwn(concept, 'notApplicableReason'), `${conceptKey} must expose notApplicableReason`);
  if (concept.amount === 0) {
    assert.equal(
      concept.blockingReasons.length > 0 || typeof concept.notApplicableReason === 'string',
      true,
      `${conceptKey} zero must have blockingReasons or explicit notApplicableReason`
    );
  }
  return concept;
}

function assertScenario(scenario) {
  const scenarioResult = calculatePartnerMonthlyIncomeCandidates(scenario);

  assert.equal(scenarioResult.status, 'CALCULATED_CANDIDATE', `${scenario.scenarioId} must calculate`);
  assert.equal(scenarioResult.payoutTruth, false, `${scenario.scenarioId} must keep payoutTruth false`);
  assert.equal(scenarioResult.monthlyResults.length, scenario.paymentMonths.length);

  const summaries = scenarioResult.monthlyResults.map((monthResult) => {
    assert.equal(monthResult.payoutTruth, false);
    assert.equal(Number.isFinite(monthResult.totalIncomeCandidate), true, `${monthResult.paymentMonth} totalIncomeCandidate must be numeric`);
    assert.equal(Number.isFinite(monthResult.totalCandidateAmount), true, `${monthResult.paymentMonth} totalCandidateAmount must be numeric`);

    const concepts = Object.fromEntries(
      requiredConceptKeys.map((conceptKey) => [conceptKey, assertConceptContract(monthResult, conceptKey)])
    );
    const conceptSum = Math.round((
      requiredConceptKeys.reduce(
        (total, conceptKey) => total + concepts[conceptKey].amount,
        0
      ) + Number.EPSILON
    ) * 100) / 100;

    assert.equal(monthResult.totalIncomeCandidate, conceptSum, `${monthResult.paymentMonth} totalIncomeCandidate must equal Forge concept sum`);
    assert.equal(monthResult.totalCandidateAmount, conceptSum, `${monthResult.paymentMonth} totalCandidateAmount must equal Forge concept sum`);

    const productivity = concepts.productivity;
    assert.equal(Number.isFinite(productivity.multiplierRate), true, 'Productivity multiplierRate must be numeric');
    assert.equal(Number.isFinite(productivity.multiplierPercent), true, 'Productivity multiplierPercent must be numeric');
    assert.equal(Number.isFinite(productivity.multiplierAmount), true, 'Productivity multiplierAmount must be numeric');
    assert.equal(Number.isFinite(productivity.quarterlyCandidateAmount), true, 'Productivity quarterlyCandidateAmount must be numeric');
    assert.equal(Number.isFinite(productivity.monthlyInstallmentAmount), true, 'Productivity monthlyInstallmentAmount must be numeric');
    assert.equal(Number.isFinite(productivity.productivityBaseQuarterlyCandidateAmount), true, 'Productivity base quarterly candidate must be numeric');
    const productivityExpectedQuarterlyAmount = Math.round((
      Number(productivity.productivityBaseQuarterlyCandidateAmount) +
      Number(productivity.productivityMultiplierAmount) +
      Number.EPSILON
    ) * 100) / 100;
    assert.equal(
      productivity.quarterlyCandidateAmount,
      productivityExpectedQuarterlyAmount,
      'Productivity payable quarterly candidate must equal base plus multiplier'
    );
    assert.equal(
      productivity.amount,
      Math.round(((productivityExpectedQuarterlyAmount / 3) + Number.EPSILON) * 100) / 100,
      'Productivity monthly amount must be base plus multiplier divided into three installments'
    );

    return {
      paymentMonth: monthResult.paymentMonth,
      apoyo: concepts['fixed-support'].amount,
      conexion: concepts.connection.amount,
      desarrollo: concepts.development.amount,
      produccion: concepts.production.amount,
      productividad: concepts.productivity.amount,
      actividad: concepts.activity.amount,
      productivityMultiplierRate: productivity.multiplierRate,
      productivityMultiplierAmount: productivity.multiplierAmount,
      total: monthResult.totalIncomeCandidate,
      sourceModules: Object.fromEntries(requiredConceptKeys.map((conceptKey) => [
        conceptKey,
        concepts[conceptKey].source,
      ])),
    };
  });

  const byMonth = Object.fromEntries(scenarioResult.monthlyResults.map((result) => [result.paymentMonth, result]));
  const april = byMonth['2026-04'];
  const may = byMonth['2026-05'];
  const june = byMonth['2026-06'];

  if (april && may && june) {
    for (const conceptKey of ['production', 'productivity']) {
      assert.equal(
        april.concepts[conceptKey].amount,
        may.concepts[conceptKey].amount,
        `${scenario.scenarioId} ${conceptKey} April and May must pay same closed-quarter installment`
      );
      assert.equal(
        may.concepts[conceptKey].amount,
        june.concepts[conceptKey].amount,
        `${scenario.scenarioId} ${conceptKey} May and June must pay same closed-quarter installment`
      );

      for (const [month, expectedIndex] of [['2026-04', 1], ['2026-05', 2], ['2026-06', 3]]) {
        const concept = byMonth[month].concepts[conceptKey];
        assert.deepEqual(
          concept.sourceQuarterMonths,
          ['2026-01', '2026-02', '2026-03'],
          `${scenario.scenarioId} ${conceptKey} ${month} must use Q1 source months`
        );
        assert.equal(
          concept.paymentInstallmentIndex,
          expectedIndex,
          `${scenario.scenarioId} ${conceptKey} ${month} installment index`
        );
      }
    }

    assert.equal(
      may.concepts.activity.amount,
      0,
      `${scenario.scenarioId} activity May must be explicit zero`
    );
    assert.equal(
      june.concepts.activity.amount,
      0,
      `${scenario.scenarioId} activity June must be explicit zero`
    );
    assert.equal(
      typeof may.concepts.activity.notApplicableReason,
      'string',
      `${scenario.scenarioId} activity May zero requires notApplicableReason`
    );
    assert.equal(
      typeof june.concepts.activity.notApplicableReason,
      'string',
      `${scenario.scenarioId} activity June zero requires notApplicableReason`
    );
    assert.deepEqual(
      april.concepts.activity.sourceQuarterMonths,
      ['2026-01', '2026-02', '2026-03'],
      `${scenario.scenarioId} activity April must use Q1 source months`
    );

    if (scenario.scenarioId.includes('PRUEBA_G')) {
      assert.equal(
        april.concepts.production.amount,
        0,
        'Test G production must be 0 because Q1 has no non-qualified advisor production base'
      );
      assert.equal(
        typeof april.concepts.production.notApplicableReason,
        'string',
        'Test G production zero requires notApplicableReason'
      );
      assert.equal(
        april.concepts.activity.amount,
        33300,
        'Test G activity April must include G1 18,900 + G2 14,400'
      );
      assert.equal(
        april.totalIncomeCandidate,
        189400,
        'Test G April total must match official corrected monthly income'
      );
      assert.equal(
        april.concepts.activity.paymentInstallmentCount,
        1,
        'Test G activity must be one-time payment'
      );
    }
  }

  return summaries;
}

function assertStableScenario(scenario, rounds = 3) {
  const results = Array.from({ length: rounds }, () => assertScenario(scenario));
  for (const result of results.slice(1)) {
    assert.deepEqual(result, results[0], `${scenario.scenarioId} must be stable across ${rounds} rounds`);
  }
  return results[0];
}



// ╔════════════════════════════════════════════════════════════╗
// ║ TEST H — Random month 14 mixed team official              ║
// ║ Development rule: months 4-15 apply even for 2025 joins   ║
// ╚════════════════════════════════════════════════════════════╝

const pruebaH = {
  scenarioId: 'PRUEBA_H_RANDOM_MONTH14_MIXED_TEAM_OFFICIAL',
  partner: {
    partnerId: 'P-H-RANDOM',
    partnerName: 'Valeria Soto',
    partnerContractDate: '2025-04-18',
    connectionDate: '2025-04-18',
    active: true,
    partnerCareerMonthByPaymentMonth: {
      '2026-04': 13,
      '2026-05': 14,
    },
    limra: 0.91,
    igc: 0.94,
    organizationType: 'nueva_organizacion',
    sharedDevelopment: true,
    noSharedDevelopment: false,
    firstTwoHiresExcludedFromTaGoal: true,
    firstTwoHiresAdvisorIds: ['H1', 'H2'],
  },
  advisors: [
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H1',
      name: 'Ana Torres',
      connectionDate: '2025-11-10',
      hireOrder: 1,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 5, commissions: 45000 },
        feb: { policies: 5, commissions: 50000 },
        mar: { policies: 6, commissions: 55000 },
        apr: { policies: 6, commissions: 60000 },
        may: { policies: 6, commissions: 62000 },
        jun: { policies: 6, commissions: 62000 },
      },
    }),
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H2',
      name: 'Bruno Vega',
      connectionDate: '2025-12-05',
      hireOrder: 2,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 3, commissions: 30000 },
        feb: { policies: 3, commissions: 28000 },
        mar: { policies: 4, commissions: 32000 },
        apr: { policies: 4, commissions: 34000 },
        may: { policies: 4, commissions: 35000 },
        jun: { policies: 4, commissions: 35000 },
      },
    }),
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H3',
      name: 'Carla Neri',
      connectionDate: '2026-01-20',
      hireOrder: 3,
      isDirectConnection: true,
      developmentShare: 1,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 2, commissions: 15000 },
        feb: { policies: 3, commissions: 15000 },
        mar: { policies: 4, commissions: 18000 },
        apr: { policies: 4, commissions: 41000 },
        may: { policies: 5, commissions: 44000 },
        jun: { policies: 5, commissions: 44000 },
      },
    }),
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H4',
      name: 'Diego Lira',
      connectionDate: '2026-02-06',
      hireOrder: 4,
      isDirectConnection: true,
      developmentShare: 0.5,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 2, commissions: 10000 },
        mar: { policies: 3, commissions: 20000 },
        apr: { policies: 4, commissions: 31000 },
        may: { policies: 4, commissions: 36000 },
        jun: { policies: 4, commissions: 36000 },
      },
    }),
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H5',
      name: 'Elena Paz',
      connectionDate: '2026-03-11',
      hireOrder: 5,
      isDirectConnection: true,
      developmentShare: 0,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 2, commissions: 24000 },
        apr: { policies: 3, commissions: 28000 },
        may: { policies: 5, commissions: 40000 },
        jun: { policies: 5, commissions: 40000 },
      },
    }),
    advisor({
      partnerId: 'P-H-RANDOM',
      advisorId: 'H6',
      name: 'Mateo Sol',
      connectionDate: '2026-04-02',
      hireOrder: 6,
      isDirectConnection: true,
      developmentShare: 0,
      limra: 1,
      igc: 1,
      months: {
        jan: { policies: 0, commissions: 0 },
        feb: { policies: 0, commissions: 0 },
        mar: { policies: 0, commissions: 0 },
        apr: { policies: 3, commissions: 22000 },
        may: { policies: 4, commissions: 33000 },
        jun: { policies: 4, commissions: 33000 },
      },
    }),
  ],
  paymentMonths: ['2026-04', '2026-05'],
  evidence: {
    paidAppliedEconomicEvidence: true,
    partnerOwnershipSourceTruthRequired: true,
    trainingWinnerInQuarter: true,
    taCountingEventEvidence: true,
    trainingAllowanceEvents: [
      {
        advisorId: 'H3',
        date: '2026-03-15',
        wonTrainingAllowanceFirstTimeInQuarter: true,
        inQuarter: true,
        activeAtPeriodClose: true,
        activeGroup2: true,
        unitOnboardingSequence: 3,
        countsForSupport: true,
      },
      {
        advisorId: 'H4',
        date: '2026-03-20',
        wonTrainingAllowanceFirstTimeInQuarter: true,
        inQuarter: true,
        activeAtPeriodClose: true,
        activeGroup2: true,
        unitOnboardingSequence: 4,
        countsForSupport: true,
      },
      {
        advisorId: 'H5',
        date: '2026-03-25',
        wonTrainingAllowanceFirstTimeInQuarter: true,
        inQuarter: true,
        activeAtPeriodClose: true,
        activeGroup2: true,
        unitOnboardingSequence: 5,
        countsForSupport: true,
      },
      {
        advisorId: 'H6',
        date: '2026-04-20',
        wonTrainingAllowanceFirstTimeInQuarter: true,
        inQuarter: false,
        activeAtPeriodClose: true,
        activeGroup2: true,
        unitOnboardingSequence: 6,
        countsForSupport: true,
      },
    ],
    signedPrecontractsLastSixMonths: 6,
    newAdvisorsLastSixMonths: 6,
    trainingAdvisorWinnersLastSixMonths: 6,
    trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion: 4,
    trainingAdvisorWinnerEvidenceCount: 4,
    firstTwoHiresExclusionApplied: true,
    firstTwoHiresExclusionEvidence: true,
    excludedAdvisorIds: ['H1', 'H2'],
  },
};

const pruebaHResult = calculatePartnerMonthlyIncomeCandidates(pruebaH);
assert.equal(pruebaHResult.status, 'CALCULATED_CANDIDATE', 'Test H must calculate');
assert.equal(pruebaHResult.payoutTruth, false, 'Test H must keep payoutTruth false');

const pruebaHByMonth = Object.fromEntries(
  pruebaHResult.monthlyResults.map((month) => [month.paymentMonth, month])
);

const pruebaHApril = pruebaHByMonth['2026-04'];
const pruebaHMay = pruebaHByMonth['2026-05'];

assert.ok(pruebaHApril, 'Test H April result required');
assert.ok(pruebaHMay, 'Test H May result required');

assert.equal(pruebaHApril.concepts['fixed-support'].amount, 43500, 'Test H April support');
assert.equal(pruebaHApril.concepts.connection.amount, 21500, 'Test H April connection includes H6 alta bonus');
assert.equal(pruebaHApril.concepts.development.amount, 45000, 'Test H April development');
assert.equal(pruebaHApril.concepts.production.amount, 1080, 'Test H April production');
assert.equal(pruebaHApril.concepts.productivity.amount, 46200, 'Test H April productivity');
assert.equal(pruebaHApril.concepts.productivity.productivityBaseQuarterlyCandidateAmount, 99000, 'Test H productivity base Q1');
assert.equal(pruebaHApril.concepts.productivity.productivityMultiplierAmount, 39600, 'Test H productivity multiplier Q1');
assert.equal(pruebaHApril.concepts.productivity.quarterlyCandidateAmount, 138600, 'Test H productivity total Q1');
assert.equal(pruebaHApril.concepts.activity.amount, 58200, 'Test H April activity');
assert.equal(pruebaHApril.totalIncomeCandidate, 215480, 'Test H April total');

assert.equal(pruebaHMay.concepts['fixed-support'].amount, 43500, 'Test H May support');
assert.equal(pruebaHMay.concepts.connection.amount, 24000, 'Test H May connection');
assert.equal(pruebaHMay.concepts.development.amount, 52500, 'Test H May development');
assert.equal(pruebaHMay.concepts.production.amount, 1080, 'Test H May production');
assert.equal(pruebaHMay.concepts.productivity.amount, 46200, 'Test H May productivity');
assert.equal(pruebaHMay.concepts.productivity.productivityBaseQuarterlyCandidateAmount, 99000, 'Test H May productivity base Q1');
assert.equal(pruebaHMay.concepts.productivity.productivityMultiplierAmount, 39600, 'Test H May productivity multiplier Q1');
assert.equal(pruebaHMay.concepts.productivity.quarterlyCandidateAmount, 138600, 'Test H May productivity total Q1');
assert.equal(pruebaHMay.concepts.activity.amount, 0, 'Test H May activity paid only first month');
assert.equal(pruebaHMay.totalIncomeCandidate, 167280, 'Test H May total');

const pruebaHPrintable = pruebaHResult.monthlyResults.map((monthResult) => ({
  paymentMonth: monthResult.paymentMonth,
  apoyo: monthResult.concepts['fixed-support'].amount,
  conexion: monthResult.concepts.connection.amount,
  desarrollo: monthResult.concepts.development.amount,
  produccion: monthResult.concepts.production.amount,
  productividad: monthResult.concepts.productivity.amount,
  actividad: monthResult.concepts.activity.amount,
  productivityBaseQuarterlyCandidateAmount: monthResult.concepts.productivity.productivityBaseQuarterlyCandidateAmount,
  productivityMultiplierAmount: monthResult.concepts.productivity.productivityMultiplierAmount,
  productivityQuarterlyCandidateAmount: monthResult.concepts.productivity.quarterlyCandidateAmount,
  total: monthResult.totalIncomeCandidate,
}));

console.log('PASS TEST_H_RANDOM_MONTH14_MIXED_TEAM_OFFICIAL');


const printable = {
  pruebaH: pruebaHPrintable,
  pruebaA: assertScenario(pruebaA),
  pruebaB: assertScenario(pruebaB),
  pruebaC: assertStableScenario(pruebaC),
  pruebaD: assertStableScenario(pruebaD),
  pruebaE: assertStableScenario(pruebaE),
  pruebaF: assertStableScenario(pruebaF),
  pruebaG: assertStableScenario(pruebaG),
};

console.log(JSON.stringify(printable, null, 2));
console.log('PASS partner-month7-real-income-scenario-test');
