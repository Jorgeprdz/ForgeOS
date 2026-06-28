import {
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

import {
  orchestratePcv2026FixedSupportMonthlyCandidate,
} from './partner-fixed-support-orchestrator.js';

import {
  gatePartnerConnectionBonusCalculation,
  gatePartnerDevelopmentBonusCalculation,
} from './partner-partial-bonus-calculation-gate.js';

import {
  calculatePartnerQuarterlyBonusCandidate,
} from './partner-quarterly-bonus-calculator.js';

const FORGE_MODULE = 'compensation/partner-manager/partner-monthly-income-candidate-orchestrator.js';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function parseMonthStart(month) {
  if (!/^\d{4}-\d{2}$/.test(String(month || ''))) return null;
  const date = new Date(`${month}-01T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function careerMonthAt(connectionDate, paymentMonth) {
  const start = connectionDate ? new Date(`${String(connectionDate).slice(0, 10)}T00:00:00Z`) : null;
  const target = parseMonthStart(paymentMonth);
  if (!start || Number.isNaN(start.getTime()) || !target) return null;
  const diff = (target.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    target.getUTCMonth() - start.getUTCMonth();
  return diff >= 0 ? diff + 1 : null;
}

function amountFrom(result) {
  const value = result?.totalCandidateAmount ?? result?.candidateAmount ?? result?.amount;
  return hasNumber(value) ? Number(value) : null;
}

function conceptResult({
  conceptKey,
  label,
  amount = null,
  status = 'BLOCKED_OR_UNKNOWN',
  forgeModule = FORGE_MODULE,
  forgeExport = null,
  rawForgeResult = null,
  blockingReasons = [],
  multiplierRate = null,
  multiplierAmount = null,
  notApplicableReason = null,
} = {}) {
  const normalizedAmount = hasNumber(amount) ? roundMoney(amount) : null;
  const normalizedMultiplierRate = hasNumber(multiplierRate) ? Number(multiplierRate) : null;
  const normalizedMultiplierAmount = hasNumber(multiplierAmount) ? roundMoney(multiplierAmount) : null;
  return {
    conceptKey,
    label,
    status,
    amount: normalizedAmount,
    candidateAmount: normalizedAmount,
    totalCandidateAmount: normalizedAmount,
    payoutTruth: false,
    source: forgeExport ? `${forgeModule} :: ${forgeExport}` : forgeModule,
    forgeModule,
    forgeExport,
    rawForgeResult,
    blockingReasons,
    notApplicableReason,
    multiplierRate: normalizedMultiplierRate,
    multiplierPercent: normalizedMultiplierRate,
    multiplierAmount: normalizedMultiplierAmount,
  };
}

function monthFactFor(advisor = {}, paymentMonth) {
  return (advisor.monthlyFacts || []).find((fact) => fact?.month === paymentMonth) || null;
}

const MONTH_ALIASES = Object.freeze({
  jan: '2026-01',
  january: '2026-01',
  ene: '2026-01',
  enero: '2026-01',
  feb: '2026-02',
  february: '2026-02',
  febrero: '2026-02',
  mar: '2026-03',
  march: '2026-03',
  marzo: '2026-03',
  apr: '2026-04',
  april: '2026-04',
  abr: '2026-04',
  abril: '2026-04',
  may: '2026-05',
  mayo: '2026-05',
  jun: '2026-06',
  june: '2026-06',
  junio: '2026-06',
  jul: '2026-07',
  july: '2026-07',
  julio: '2026-07',
  aug: '2026-08',
  august: '2026-08',
  ago: '2026-08',
  agosto: '2026-08',
  sep: '2026-09',
  sept: '2026-09',
  september: '2026-09',
  septiembre: '2026-09',
  oct: '2026-10',
  october: '2026-10',
  octubre: '2026-10',
  nov: '2026-11',
  november: '2026-11',
  noviembre: '2026-11',
  dec: '2026-12',
  december: '2026-12',
  dic: '2026-12',
  diciembre: '2026-12',
});

function monthKeyFrom(value) {
  if (!value) return null;
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
  return MONTH_ALIASES[raw.toLowerCase()] || null;
}

function monthlyFactFromScenarioMonth(month, monthData = {}) {
  const commissions = monthData.commissions ?? monthData.initialCommissions ?? monthData.amount;
  const policies = monthData.policies ?? monthData.monthlyPolicies ?? monthData.validPolicyCount;
  return {
    month,
    initialCommissions: {
      vidaIndividual: hasNumber(commissions) ? Number(commissions) : undefined,
      gmmiIndividual: hasNumber(monthData.gmmiIndividualCommissions) ? Number(monthData.gmmiIndividualCommissions) : 0,
      otherRamos: hasNumber(monthData.otherRamosCommissions) ? Number(monthData.otherRamosCommissions) : 0,
    },
    paidPolicies: {
      vidaIndividual: hasNumber(policies) ? Number(policies) : undefined,
      gmmiIndividual: hasNumber(monthData.gmmiIndividualPolicies) ? Number(monthData.gmmiIndividualPolicies) : 0,
    },
  };
}

function monthlyFactsFromScenarioMonths(months = {}) {
  if (!months || typeof months !== 'object' || Array.isArray(months)) return [];
  return Object.entries(months)
    .map(([alias, value]) => {
      const month = monthKeyFrom(alias);
      return month ? monthlyFactFromScenarioMonth(month, value || {}) : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.month.localeCompare(b.month));
}

function normalizeMonthlyCandidateAdvisors(advisors = [], partner = {}) {
  return advisors.map((advisor) => {
    const monthlyFacts = Array.isArray(advisor.monthlyFacts) && advisor.monthlyFacts.length > 0
      ? advisor.monthlyFacts
      : monthlyFactsFromScenarioMonths(advisor.months);

    return {
      ...advisor,
      monthlyFacts,
      LIMRA: advisor.LIMRA ?? advisor.limra ?? partner.unitLIMRA ?? partner.limra,
      IGC: advisor.IGC ?? advisor.igc ?? partner.unitIGC ?? partner.igc,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence ?? true,
      developerEligibilityEvidence: advisor.developerEligibilityEvidence ?? advisor.taWinnerEvidence ?? true,
    };
  });
}

function monthlyPoliciesFromFact(fact = {}) {
  const paidPolicies = fact?.paidPolicies || {};
  const value = fact?.monthlyPolicies ??
    fact?.validPolicyCount ??
    fact?.policies ??
    paidPolicies.vidaIndividual ??
    paidPolicies.lifeIndividual;
  return hasNumber(value) ? Number(value) : null;
}

function monthlyCommissionsFromFact(fact = {}) {
  const initial = fact?.initialCommissions || {};
  const value = fact?.amount ??
    fact?.initialCommissionsLifeAndIndividualGmm ??
    fact?.initialCommissionAmount ??
    fact?.lifeAndGmmiInitialCommissions ??
    (
      Number(initial.vidaIndividual || 0) +
      Number(initial.gmmiIndividual || 0)
    );
  return hasNumber(value) ? Number(value) : null;
}

function normalizedIndex(value) {
  if (!hasNumber(value)) return null;
  const numeric = Number(value);
  return numeric <= 1 ? numeric * 100 : numeric;
}

function productionIndexNotApplicable({ production = {}, partner = {}, rulePack = null } = {}) {
  const blockedReasons = production?.blockedReasons || [];
  const minimumIndexes = rulePack?.concepts?.['production-bonus']?.minimumIndexes || {};
  const unitLIMRA = partner.unitLIMRA ?? partner.limra;
  const unitIGC = partner.unitIGC ?? partner.igc;
  const limra = normalizedIndex(unitLIMRA);
  const igc = normalizedIndex(unitIGC);
  const belowLIMRA = blockedReasons.includes('missing_or_below_unit_LIMRA') &&
    hasNumber(limra) &&
    limra < Number(minimumIndexes.LIMRA);
  const belowIGC = blockedReasons.includes('missing_or_below_unit_IGC') &&
    hasNumber(igc) &&
    igc < Number(minimumIndexes.IGC);
  const missingIndex = (
    (blockedReasons.includes('missing_or_below_unit_LIMRA') && !hasNumber(limra)) ||
    (blockedReasons.includes('missing_or_below_unit_IGC') && !hasNumber(igc))
  );
  const nonIndexBlocks = blockedReasons.filter((reason) => ![
    'missing_or_below_unit_LIMRA',
    'missing_or_below_unit_IGC',
    'missing_non_qualified_advisor_economic_output',
    'missing_valid_economic_base_amount',
  ].includes(reason));

  const noNonQualifiedProductionBase = (
    blockedReasons.includes('missing_non_qualified_advisor_economic_output') ||
    blockedReasons.includes('missing_valid_economic_base_amount')
  ) && nonIndexBlocks.length === 0;

  if (noNonQualifiedProductionBase) {
    return 'no_non_qualified_advisor_production_base_for_evaluation_quarter';
  }
  if (missingIndex || nonIndexBlocks.length > 0) return null;
  if (belowLIMRA || belowIGC) {
    return blockedReasons.filter((reason) => [
      'missing_or_below_unit_LIMRA',
      'missing_or_below_unit_IGC',
    ].includes(reason)).join(',');
  }
  return null;
}

function accumulatedCommissionsThroughMonth(advisors = [], paymentMonth) {
  const values = advisors.flatMap((advisor) => (
    (advisor.monthlyFacts || [])
      .filter((fact) => fact?.month <= paymentMonth)
      .map(monthlyCommissionsFromFact)
  ));
  const numeric = values.filter(hasNumber);
  return numeric.length > 0
    ? numeric.reduce((total, value) => total + Number(value), 0)
    : null;
}

function inferTrainingAdvisorWinnerEvidenceCount({
  advisors = [],
  partner = {},
  evidence = {},
} = {}) {
  const explicit = evidence.trainingAdvisorWinnerEvidenceCount ??
    evidence.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion ??
    evidence.trainingAdvisorWinnersLastSixMonths;
  if (hasNumber(explicit)) return Number(explicit);

  const excluded = new Set([
    ...(partner.firstTwoHiresAdvisorIds || []),
    ...(evidence.excludedAdvisorIds || []),
  ]);
  const shouldExcludeFirstTwo = partner.firstTwoHiresExcludedFromTaGoal === true ||
    evidence.firstTwoHiresExclusionApplied === true ||
    evidence.firstTwoHiresExclusionEvidence === true;

  const eligible = advisors.filter((advisor) => {
    if (advisor.taWinnerEvidence === false || advisor.trainingAdvisorWinnerEvidence === false) return false;
    if (shouldExcludeFirstTwo && excluded.has(advisor.advisorId)) return false;
    return advisor.active !== false;
  });

  return eligible.length > 0 ? eligible.length : null;
}

function normalizeMonthlyCandidateEvidence({ partner = {}, advisors = [], evidence = {} } = {}) {
  const inferredTrainingWinnerCount = inferTrainingAdvisorWinnerEvidenceCount({ partner, advisors, evidence });
  return {
    ...evidence,
    paidAppliedEconomicEvidence: evidence.paidAppliedEconomicEvidence ?? true,
    partnerOwnershipSourceTruthRequired: evidence.partnerOwnershipSourceTruthRequired ?? false,
    trainingWinnerInQuarter: evidence.trainingWinnerInQuarter ?? true,
    signedPrecontractsLastSixMonths: evidence.signedPrecontractsLastSixMonths ?? advisors.length,
    newAdvisorsLastSixMonths: evidence.newAdvisorsLastSixMonths ?? advisors.length,
    trainingAdvisorWinnersLastSixMonths: evidence.trainingAdvisorWinnersLastSixMonths ?? inferredTrainingWinnerCount,
    trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion:
      evidence.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion ?? inferredTrainingWinnerCount,
    trainingAdvisorWinnerEvidenceCount: evidence.trainingAdvisorWinnerEvidenceCount ?? inferredTrainingWinnerCount,
    firstTwoHiresExclusionApplied: evidence.firstTwoHiresExclusionApplied ??
      partner.firstTwoHiresExcludedFromTaGoal === true,
    firstTwoHiresExclusionEvidence: evidence.firstTwoHiresExclusionEvidence ??
      partner.firstTwoHiresExcludedFromTaGoal === true,
    excludedAdvisorIds: evidence.excludedAdvisorIds ?? partner.firstTwoHiresAdvisorIds,
  };
}

function relationshipAttribution(advisor = {}, relationshipType) {
  const container = advisor.relationshipAttributions || advisor.relationshipAttribution || {};
  if (container?.relationshipType === relationshipType) return container;
  return container?.[relationshipType] || null;
}

function isOwnedConnection(advisor = {}, partnerId = null) {
  const attribution = relationshipAttribution(advisor, 'connection');
  if (attribution) {
    return attribution.status === 'confirmed' &&
      attribution.connectionOwnerType === 'partner' &&
      attribution.connectionOwnerId === partnerId;
  }
  return advisor.isDirectConnection === true;
}

function isOwnedDevelopment(advisor = {}, partnerId = null) {
  const attribution = relationshipAttribution(advisor, 'development');
  if (attribution) {
    return attribution.status === 'confirmed' &&
      attribution.developmentOwnerType === 'partner' &&
      attribution.developmentOwnerId === partnerId;
  }
  return hasNumber(advisor.developmentShare) && Number(advisor.developmentShare) > 0;
}

function developerCountFor(advisor = {}) {
  const attribution = relationshipAttribution(advisor, 'development');
  const share = attribution?.developerShare ?? advisor.developmentShare;
  return Number(share) === 0.5 ? 2 : 1;
}

function sumCalculatedParts(parts = []) {
  const numeric = parts.map(amountFrom).filter(hasNumber);
  return numeric.length > 0
    ? roundMoney(numeric.reduce((total, value) => total + Number(value), 0))
    : null;
}

const SCALE_NOT_REACHED_BLOCKING_REASONS = new Set([
  'missing_policy_scale_match',
  'blocked_by_missing_scale_match',
]);

function onlyScaleMissesWithEvidence(parts = []) {
  return parts.length > 0 && parts.every((part) => {
    const blockedReasons = part.result?.blockedReasons || [];
    return part.hasMonthlyPolicyEvidence === true &&
      blockedReasons.length > 0 &&
      blockedReasons.every((reason) => SCALE_NOT_REACHED_BLOCKING_REASONS.has(reason));
  });
}

function buildFixedSupportInput({
  partner = {},
  advisors = [],
  paymentMonth,
  partnerCareerMonth = null,
  evidence = {},
} = {}) {
  return {
    month: paymentMonth,
    careerMonth: partnerCareerMonth,
    accumulatedCommissionActual: evidence.accumulatedCommissionActual ??
      evidence.accumulatedTeamInitialCommissionsLifeAndIndividualGmm ??
      accumulatedCommissionsThroughMonth(advisors, paymentMonth),
    accumulatedCommissionGoal: evidence.accumulatedCommissionGoal,
    signedPrecontractsLastSixMonths: evidence.signedPrecontractsLastSixMonths,
    newAdvisorsLastSixMonths: evidence.newAdvisorsLastSixMonths,
    trainingAdvisorWinnersLastSixMonths: evidence.trainingAdvisorWinnersLastSixMonths,
    trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion:
      evidence.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion,
    trainingAdvisorWinnerEvidenceCount: evidence.trainingAdvisorWinnerEvidenceCount,
    firstTwoHiresExclusionApplied: evidence.firstTwoHiresExclusionApplied,
    firstTwoHiresExclusionEvidence: evidence.firstTwoHiresExclusionEvidence,
    payoutTruth: false,
    partnerActiveEvidence: partner.active === true,
  };
}

function orchestrateConnection({ partner = {}, advisors = [], paymentMonth, rulePack } = {}) {
  const parts = advisors.flatMap((advisor) => {
    if (!isOwnedConnection(advisor, partner.partnerId)) return [];
    const advisorMonth = careerMonthAt(advisor.connectionDate || advisor.contestDate, paymentMonth);
    if (![1, 2, 3].includes(Number(advisorMonth))) return [];
    const fact = monthFactFor(advisor, paymentMonth);
    const monthlyPolicies = monthlyPoliciesFromFact(fact);
    return [{
      hasMonthlyPolicyEvidence: hasNumber(monthlyPolicies),
      result: gatePartnerConnectionBonusCalculation({
      rulePack,
      advisorMonth,
      onboardingEvidence: advisor.onboardingEvidence === true || Number(advisorMonth) === 1,
      monthlyPolicies,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence !== false,
      connectorActiveAtMonthClose: partner.active === true,
      connectedAdvisorActiveAtMonthClose: advisor.active !== false,
      }),
    }];
  });
  const results = parts.map((part) => part.result);
  const blockedReasons = results.flatMap((part) => part.blockedReasons || []);
  const scaleNotApplicable = onlyScaleMissesWithEvidence(parts);
  const amount = parts.length === 0 || scaleNotApplicable ? 0 : sumCalculatedParts(results);
  const status = parts.length === 0
    ? 'NOT_APPLICABLE_NO_CURRENT_MONTH_CANDIDATE'
    : (scaleNotApplicable
      ? 'NOT_APPLICABLE_POLICY_SCALE_EXPLICIT_ZERO'
      : (hasNumber(amount) && blockedReasons.length === 0 ? 'CALCULATED_CANDIDATE' : 'BLOCKED_OR_UNKNOWN'));

  return conceptResult({
    conceptKey: 'connection',
    label: 'Conexión',
    amount,
    status,
    forgeModule: 'compensation/partner-manager/partner-partial-bonus-calculation-gate.js',
    forgeExport: 'gatePartnerConnectionBonusCalculation',
    rawForgeResult: { parts: results },
    blockingReasons: parts.length === 0 || scaleNotApplicable ? [] : blockedReasons,
    notApplicableReason: parts.length === 0
      ? 'no_owned_connection_bonus_candidate_for_payment_month'
      : (scaleNotApplicable ? 'connection_policy_scale_not_reached_for_payment_month' : null),
  });
}

function orchestrateDevelopment({ partner = {}, advisors = [], paymentMonth, rulePack } = {}) {
  const parts = advisors.flatMap((advisor) => {
    if (!isOwnedDevelopment(advisor, partner.partnerId)) return [];
    const advisorMonth = careerMonthAt(advisor.connectionDate || advisor.contestDate, paymentMonth);
    if (Number(advisorMonth) < 4 || Number(advisorMonth) > 15) return [];
    const fact = monthFactFor(advisor, paymentMonth);
    const monthlyPolicies = monthlyPoliciesFromFact(fact);
    return [{
      hasMonthlyPolicyEvidence: hasNumber(monthlyPolicies),
      result: gatePartnerDevelopmentBonusCalculation({
      rulePack,
      advisorMonth,
      monthlyPolicies,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence !== false,
      developerEligibilityEvidence: advisor.developerEligibilityEvidence !== false,
      developerCount: developerCountFor(advisor),
      }),
    }];
  });
  const results = parts.map((part) => part.result);
  const blockedReasons = results.flatMap((part) => part.blockedReasons || []);
  const scaleNotApplicable = onlyScaleMissesWithEvidence(parts);
  const amount = parts.length === 0 || scaleNotApplicable ? 0 : sumCalculatedParts(results);
  const status = parts.length === 0
    ? 'NOT_APPLICABLE_NO_CURRENT_MONTH_CANDIDATE'
    : (scaleNotApplicable
      ? 'NOT_APPLICABLE_POLICY_SCALE_EXPLICIT_ZERO'
      : (hasNumber(amount) && blockedReasons.length === 0 ? 'CALCULATED_CANDIDATE' : 'BLOCKED_OR_UNKNOWN'));

  return conceptResult({
    conceptKey: 'development',
    label: 'Desarrollo',
    amount,
    status,
    forgeModule: 'compensation/partner-manager/partner-partial-bonus-calculation-gate.js',
    forgeExport: 'gatePartnerDevelopmentBonusCalculation',
    rawForgeResult: { parts: results },
    blockingReasons: parts.length === 0 || scaleNotApplicable ? [] : blockedReasons,
    notApplicableReason: parts.length === 0
      ? 'no_owned_development_bonus_candidate_for_payment_month'
      : (scaleNotApplicable ? 'development_policy_scale_not_reached_for_payment_month' : null),
  });
}

function padMonth(value) {
  return String(value).padStart(2, '0');
}

function paymentQuarterContextFor(paymentMonth) {
  const paymentDate = parseMonthStart(paymentMonth);
  if (!paymentDate) {
    return {
      evaluationQuarter: null,
      sourceQuarterMonths: [],
      paymentMonth,
      paymentInstallmentIndex: null,
      paymentInstallmentCount: 3,
      period: {
        type: 'closed-quarter',
        year: null,
        quarter: null,
        months: [],
        paymentMonth,
      },
    };
  }

  const paymentYear = paymentDate.getUTCFullYear();
  const paymentMonthNumber = paymentDate.getUTCMonth() + 1;
  const paymentQuarterNumber = Math.floor((paymentMonthNumber - 1) / 3) + 1;

  let evaluationQuarterNumber = paymentQuarterNumber - 1;
  let evaluationYear = paymentYear;
  if (evaluationQuarterNumber === 0) {
    evaluationQuarterNumber = 4;
    evaluationYear -= 1;
  }

  const sourceStartMonth = ((evaluationQuarterNumber - 1) * 3) + 1;
  const sourceQuarterMonths = [0, 1, 2].map((offset) => (
    `${evaluationYear}-${padMonth(sourceStartMonth + offset)}`
  ));

  const paymentInstallmentIndex = ((paymentMonthNumber - 1) % 3) + 1;
  const evaluationQuarter = `${evaluationYear}-Q${evaluationQuarterNumber}`;

  return {
    evaluationQuarter,
    sourceQuarterMonths,
    paymentMonth,
    paymentInstallmentIndex,
    paymentInstallmentCount: 3,
    period: {
      type: 'closed-quarter',
      year: evaluationYear,
      quarter: `Q${evaluationQuarterNumber}`,
      startDate: `${sourceQuarterMonths[0]}-01`,
      endDate: `${sourceQuarterMonths[2]}-01`,
      months: sourceQuarterMonths,
      evaluationQuarter,
      paymentMonth,
      paymentInstallmentIndex,
      paymentInstallmentCount: 3,
    },
  };
}

function quarterlyPeriodFor(paymentMonth) {
  return paymentQuarterContextFor(paymentMonth).period;
}

function quarterlyInstallmentAmount(quarterlyAmount, installmentCount = 3) {
  if (!hasNumber(quarterlyAmount)) return null;
  return roundMoney(Number(quarterlyAmount) / Number(installmentCount || 3));
}

function quarterlyConceptFields({
  quarterlyAmount = null,
  monthlyInstallmentAmount = null,
  quarterlyContext = {},
  paymentInstallmentCount = 3,
} = {}) {
  return {
    quarterlyCandidateAmount: hasNumber(quarterlyAmount) ? roundMoney(quarterlyAmount) : null,
    monthlyInstallmentAmount: hasNumber(monthlyInstallmentAmount) ? roundMoney(monthlyInstallmentAmount) : null,
    evaluationQuarter: quarterlyContext.evaluationQuarter ?? null,
    sourceQuarterMonths: quarterlyContext.sourceQuarterMonths ?? [],
    paymentMonth: quarterlyContext.paymentMonth ?? null,
    paymentInstallmentIndex: quarterlyContext.paymentInstallmentIndex ?? null,
    paymentInstallmentCount,
  };
}

const ACTIVITY_EXPLICIT_ZERO_BLOCKING_REASONS = new Set([
  'blocked_by_missing_scale_match',
  'minimum_three_month_seniority_required',
]);

function activityBlockedReasonsAreExplicitZeroOnly(activity = {}) {
  const blockedReasons = activity?.blockedReasons || activity?.blockingReasons || [];
  const missingInputs = activity?.missingInputs || [];

  return blockedReasons.length > 0 &&
    missingInputs.length === 0 &&
    blockedReasons.every((reason) => ACTIVITY_EXPLICIT_ZERO_BLOCKING_REASONS.has(reason));
}

function assertNumericOrBlocked(concept) {
  if (hasNumber(concept?.candidateAmount)) return concept;
  return {
    ...concept,
    candidateAmount: null,
    totalCandidateAmount: null,
  };
}

export function calculatePartnerMonthlyIncomeCandidate({
  partner = {},
  advisors = [],
  paymentMonth = null,
  partnerCareerMonth = null,
  evidence = {},
  rulePack = null,
} = {}) {
  const activeRulePack = rulePack || loadPartner2026RulePack();
  const normalizedAdvisors = normalizeMonthlyCandidateAdvisors(advisors, partner);
  const normalizedEvidence = normalizeMonthlyCandidateEvidence({
    partner,
    advisors: normalizedAdvisors,
    evidence,
  });
  const resolvedPartnerCareerMonth = partnerCareerMonth ??
    partner.partnerCareerMonthByPaymentMonth?.[paymentMonth] ??
    careerMonthAt(partner.connectionDate || partner.partnerContractDate, paymentMonth) ??
    partner.partnerCareerMonth;

  const quarterlyContext = paymentQuarterContextFor(paymentMonth);

  const supportResult = orchestratePcv2026FixedSupportMonthlyCandidate(buildFixedSupportInput({
    partner,
    advisors: normalizedAdvisors,
    paymentMonth,
    partnerCareerMonth: resolvedPartnerCareerMonth,
    evidence: normalizedEvidence,
  }));

  const quarterlyResult = calculatePartnerQuarterlyBonusCandidate({
    partner: {
      ...partner,
      partnerCareerMonth: resolvedPartnerCareerMonth,
      connectionDate: partner.connectionDate || partner.partnerContractDate,
      unitLIMRA: partner.unitLIMRA ?? partner.limra,
      unitIGC: partner.unitIGC ?? partner.igc,
      organizationType: partner.organizationType || 'nueva_organizacion',
    },
    advisors: normalizedAdvisors,
    period: quarterlyContext.period,
    evidence: {
      ...normalizedEvidence,
      paidAppliedEconomicEvidence: normalizedEvidence.paidAppliedEconomicEvidence !== false,
      trainingWinnerInQuarter: normalizedEvidence.trainingWinnerInQuarter ?? true,
      trainingWinnerActualCountLastSixMonths: normalizedEvidence.trainingAdvisorWinnerEvidenceCount ??
        normalizedEvidence.trainingWinnerActualCountLastSixMonths ??
        normalizedEvidence.trainingAdvisorWinnersLastSixMonthsAfterFirstTwoHiresExclusion,
    },
    rulePack: activeRulePack,
    requestedConcepts: ['production', 'productivityBase', 'productivityMultiplier', 'activity'],
  });

  const production = quarterlyResult.concepts.production;
  const productivityBase = quarterlyResult.concepts.productivityBase;
  const productivityMultiplier = quarterlyResult.concepts.productivityMultiplier;
  const activity = quarterlyResult.concepts.activity;
  const productivityMultiplierRate = hasNumber(productivityMultiplier?.candidatePercentage)
    ? Number(productivityMultiplier.candidatePercentage)
    : 0;
  const productivityMultiplierAmount = hasNumber(productivityMultiplier?.metadata?.multiplierAmountCandidate)
    ? Number(productivityMultiplier.metadata.multiplierAmountCandidate)
    : (hasNumber(productivityMultiplier?.candidateAmount) ? Number(productivityMultiplier.candidateAmount) : 0);
  const productionNotApplicableReason = productionIndexNotApplicable({
    production,
    partner,
    rulePack: activeRulePack,
  });
  const productionQuarterlyAmount = productionNotApplicableReason ? 0 : amountFrom(production);
  const productionMonthlyInstallmentAmount = productionNotApplicableReason
    ? 0
    : quarterlyInstallmentAmount(productionQuarterlyAmount, 3);
  const productionPaymentNotApplicableReason = productionNotApplicableReason ??
    (hasNumber(productionQuarterlyAmount) && Number(productionQuarterlyAmount) === 0
      ? 'no_non_qualified_advisor_production_base_for_source_quarter'
      : null);
  const productivityBaseQuarterlyAmount = amountFrom(productivityBase);
  const productivityQuarterlyAmount = hasNumber(productivityBaseQuarterlyAmount)
    ? roundMoney(Number(productivityBaseQuarterlyAmount) + Number(productivityMultiplierAmount || 0))
    : null;
  const productivityMonthlyInstallmentAmount = quarterlyInstallmentAmount(productivityQuarterlyAmount, 3);
  const activityRawQuarterlyAmount = amountFrom(activity);
  const activityExplicitZeroOnly = activityBlockedReasonsAreExplicitZeroOnly(activity);
  const activityQuarterlyAmount = hasNumber(activityRawQuarterlyAmount)
    ? roundMoney(activityRawQuarterlyAmount)
    : (activityExplicitZeroOnly ? 0 : null);
  const activityPaysThisMonth = Number(quarterlyContext.paymentInstallmentIndex) === 1;
  const activityPaymentAmount = hasNumber(activityQuarterlyAmount)
    ? (activityPaysThisMonth ? roundMoney(activityQuarterlyAmount) : 0)
    : null;
  const activityPaymentNotApplicableReason = hasNumber(activityPaymentAmount) && Number(activityPaymentAmount) === 0
    ? (activityPaysThisMonth
      ? 'activity_bonus_not_earned_for_evaluation_quarter'
      : 'activity_paid_only_in_first_month_after_evaluation_quarter')
    : null;

  const fixedSupportConcept = conceptResult({
      conceptKey: 'fixed-support',
      label: 'Apoyo',
      amount: amountFrom(supportResult),
      status: supportResult.status,
      forgeModule: 'compensation/partner-manager/partner-fixed-support-orchestrator.js',
      forgeExport: 'orchestratePcv2026FixedSupportMonthlyCandidate',
      rawForgeResult: supportResult,
      blockingReasons: supportResult.blockingReasons || [],
    });
  const normalizedConnectionConcept = orchestrateConnection({
    partner,
    advisors: normalizedAdvisors,
    paymentMonth,
    rulePack: activeRulePack,
  });
  const developmentConcept = orchestrateDevelopment({
    partner,
    advisors: normalizedAdvisors,
    paymentMonth,
    rulePack: activeRulePack,
  });
  const productionConcept = {
    ...conceptResult({
      conceptKey: 'production',
      label: 'Producción',
      amount: productionMonthlyInstallmentAmount,
      status: productionPaymentNotApplicableReason
        ? 'NOT_APPLICABLE_EVALUATION_QUARTER_EXPLICIT_ZERO'
        : production?.status,
      forgeModule: 'compensation/partner-manager/partner-quarterly-bonus-calculator.js',
      forgeExport: 'calculatePartnerQuarterlyBonusCandidate.concepts.production',
      rawForgeResult: production,
      blockingReasons: productionPaymentNotApplicableReason ? [] : (production?.blockedReasons || []),
      notApplicableReason: productionPaymentNotApplicableReason,
    }),
    ...quarterlyConceptFields({
      quarterlyAmount: productionQuarterlyAmount,
      monthlyInstallmentAmount: productionMonthlyInstallmentAmount,
      quarterlyContext,
      paymentInstallmentCount: 3,
    }),
  };
  const productivityConcept = {
    ...conceptResult({
      conceptKey: 'productivity',
      label: 'Productividad',
      amount: productivityMonthlyInstallmentAmount,
      status: hasNumber(productivityMonthlyInstallmentAmount)
        ? 'CALCULATED_CANDIDATE'
        : productivityBase?.status,
      forgeModule: 'compensation/partner-manager/partner-quarterly-bonus-calculator.js',
      forgeExport: 'calculatePartnerQuarterlyBonusCandidate.concepts.productivityBase+productivityMultiplier',
      rawForgeResult: {
        productivityBase,
        productivityMultiplier,
      },
      blockingReasons: [
        ...(productivityBase?.blockedReasons || []),
        ...(hasNumber(productivityBaseQuarterlyAmount) ? [] : (productivityMultiplier?.blockedReasons || [])),
      ],
      multiplierRate: productivityMultiplierRate,
      multiplierAmount: productivityMultiplierAmount,
      notApplicableReason: hasNumber(productivityQuarterlyAmount) && Number(productivityQuarterlyAmount) === 0
        ? 'no_qualified_advisor_productivity_base_for_evaluation_quarter'
        : null,
    }),
    productivityBaseQuarterlyCandidateAmount: hasNumber(productivityBaseQuarterlyAmount)
      ? roundMoney(productivityBaseQuarterlyAmount)
      : null,
    productivityMultiplierAmount: hasNumber(productivityMultiplierAmount)
      ? roundMoney(productivityMultiplierAmount)
      : 0,
    productivityMultiplierRate,
    productivityMultiplierPercent: productivityMultiplierRate,
    ...quarterlyConceptFields({
      quarterlyAmount: productivityQuarterlyAmount,
      monthlyInstallmentAmount: productivityMonthlyInstallmentAmount,
      quarterlyContext,
      paymentInstallmentCount: 3,
    }),
  };
  const activityConcept = {
    ...conceptResult({
      conceptKey: 'activity',
      label: 'Actividad',
      amount: activityPaymentAmount,
      status: hasNumber(activityPaymentAmount)
        ? (activityPaymentNotApplicableReason
          ? (activityPaysThisMonth
            ? 'NOT_APPLICABLE_EVALUATION_QUARTER_EXPLICIT_ZERO'
            : 'NOT_APPLICABLE_PAID_ONLY_FIRST_MONTH_EXPLICIT_ZERO')
          : activity?.status)
        : activity?.status,
      forgeModule: 'compensation/partner-manager/partner-quarterly-bonus-calculator.js',
      forgeExport: 'calculatePartnerQuarterlyBonusCandidate.concepts.activity',
      rawForgeResult: activity,
      blockingReasons: hasNumber(activityPaymentAmount) ? [] : (activity?.blockedReasons || []),
      notApplicableReason: activityPaymentNotApplicableReason,
    }),
    ...quarterlyConceptFields({
      quarterlyAmount: activityQuarterlyAmount,
      monthlyInstallmentAmount: activityPaymentAmount,
      quarterlyContext,
      paymentInstallmentCount: 1,
    }),
  };
  const productivityMultiplierConcept = conceptResult({
      conceptKey: 'productivity-multiplier',
      label: 'Productivity multiplier',
      amount: productivityMultiplierAmount,
      status: hasNumber(productivityMultiplier?.candidateAmount)
        ? productivityMultiplier.status
        : 'NOT_APPLICABLE_OR_NOT_EARNED_EXPLICIT_ZERO',
      forgeModule: 'compensation/partner-manager/partner-quarterly-bonus-calculator.js',
      forgeExport: 'calculatePartnerQuarterlyBonusCandidate.concepts.productivityMultiplier',
      rawForgeResult: productivityMultiplier,
      blockingReasons: hasNumber(productivityMultiplier?.candidateAmount)
        ? (productivityMultiplier?.blockedReasons || [])
        : [],
      multiplierRate: productivityMultiplierRate,
      multiplierAmount: productivityMultiplierAmount,
      notApplicableReason: hasNumber(productivityMultiplier?.candidateAmount)
        ? null
        : 'productivity_multiplier_not_applicable_or_not_earned_for_payment_month',
    });
  const concepts = {
    'fixed-support': fixedSupportConcept,
    connection: normalizedConnectionConcept,
    development: developmentConcept,
    production: productionConcept,
    productivity: productivityConcept,
    activity: activityConcept,
    fixedSupport: fixedSupportConcept,
    productivityMultiplier: productivityMultiplierConcept,
  };

  const payableConcepts = [
    concepts['fixed-support'],
    concepts.connection,
    concepts.development,
    concepts.production,
    concepts.productivity,
    concepts.activity,
  ].map(assertNumericOrBlocked);
  const numericAmounts = payableConcepts.map((concept) => concept.candidateAmount).filter(hasNumber);
  const blockedConcepts = payableConcepts.filter((concept) => !hasNumber(concept.candidateAmount));
  const totalCandidateAmount = blockedConcepts.length === 0
    ? roundMoney(numericAmounts.reduce((total, value) => total + Number(value), 0))
    : null;

  return {
    concept: 'partner-monthly-income-candidate',
    status: blockedConcepts.length === 0 ? 'CALCULATED_CANDIDATE' : 'BLOCKED_OR_UNKNOWN',
    paymentMonth,
    partnerCareerMonth: resolvedPartnerCareerMonth,
    payoutTruth: false,
    amount: totalCandidateAmount,
    candidateAmount: totalCandidateAmount,
    totalCandidateAmount,
    totalIncomeCandidate: totalCandidateAmount,
    concepts,
    sourceCalculations: {
      quarterlyContext,
      quarterlyResult,
    },
    blockingReasons: blockedConcepts.flatMap((concept) => concept.blockingReasons || []),
  };
}

export function calculatePartnerMonthlyIncomeCandidates({
  partner = {},
  advisors = [],
  paymentMonths = [],
  evidence = {},
  rulePack = null,
} = {}) {
  const monthlyResults = paymentMonths.map((paymentMonth) => calculatePartnerMonthlyIncomeCandidate({
    partner,
    advisors,
    paymentMonth,
    evidence,
    rulePack,
  }));

  return {
    concept: 'partner-monthly-income-candidate-period',
    status: monthlyResults.every((result) => result.status === 'CALCULATED_CANDIDATE')
      ? 'CALCULATED_CANDIDATE'
      : 'BLOCKED_OR_UNKNOWN',
    payoutTruth: false,
    monthlyResults,
    blockingReasons: monthlyResults.flatMap((result) => result.blockingReasons || []),
  };
}
