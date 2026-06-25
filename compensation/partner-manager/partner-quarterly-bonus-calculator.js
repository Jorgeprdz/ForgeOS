import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
  createAdvisorEconomicOutput,
} from './advisor-economic-output.js';

import {
  QUALIFIED_ADVISOR_ECONOMIC_STATUSES,
  evaluateQualifiedAdvisorEconomicStatus,
} from './qualified-advisor-economic-status.js';

import {
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

import {
  calculatePartnerActivityBonusCandidate,
} from './partner-activity-bonus-calculator.js';

import {
  calculatePartnerFixedSupportCandidate,
} from './partner-fixed-support-calculator.js';

import {
  gatePartnerConnectionBonusCalculation,
  gatePartnerDevelopmentBonusCalculation,
} from './partner-partial-bonus-calculation-gate.js';

import {
  evaluatePartnerOwnershipSourceTruth,
} from './partner-ownership-source-truth-gate.js';

import {
  calculatePartnerProductionBonusCandidate,
} from './partner-production-bonus-calculator.js';

import {
  calculatePartnerProductivityBaseCandidate,
} from './partner-productivity-base-calculator.js';

import {
  calculatePartnerProductivityMultiplierCandidate,
} from './partner-productivity-multiplier-calculator.js';

import {
  createPartnerPaymentCadenceSchedule,
} from './partner-payment-cadence-engine.js';

const PAYMENT_DISTRIBUTION_RULE_PACK_URL = new URL(
  './rule-packs/smnyl-partner-compensation-2026-payment-distribution.rule-pack.json',
  import.meta.url
);

const PAYMENT_DISTRIBUTION_RULE_PACK_RAW = readFileSync(PAYMENT_DISTRIBUTION_RULE_PACK_URL, 'utf8');
const PAYMENT_DISTRIBUTION_RULE_PACK = JSON.parse(PAYMENT_DISTRIBUTION_RULE_PACK_RAW);
const PAYMENT_DISTRIBUTION_RULE_PACK_HASH = `sha256:${createHash('sha256')
  .update(PAYMENT_DISTRIBUTION_RULE_PACK_RAW)
  .digest('hex')}`;

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function sumNumbers(values) {
  const numeric = values.filter(hasNumber).map(Number);
  return numeric.length > 0 ? numeric.reduce((total, value) => total + value, 0) : null;
}

function resolvePartnerOwnershipPartnerId(partner = {}) {
  return partner.partnerId || partner.id || partner.name || null;
}

function resolvePartnerOwnershipAdvisorId(advisor = {}) {
  return advisor.advisorId || advisor.name || null;
}

function resolvePartnerQuarterlyRelationshipType(requestedConcept) {
  const normalized = String(requestedConcept || '').trim().toLowerCase();

  if (['connection', 'connection-bonus', 'connection_bonus'].includes(normalized)) {
    return 'connection';
  }

  if (['development', 'development-bonus', 'development_bonus'].includes(normalized)) {
    return 'development';
  }

  return null;
}

function findRelationshipAttributionInContainer(container, relationshipType) {
  if (!container) return null;

  if (Array.isArray(container)) {
    return container.find((entry) => entry?.relationshipType === relationshipType) || null;
  }

  if (container.relationshipType === relationshipType) return container;
  if (container[relationshipType]) return container[relationshipType];
  if (container[relationshipType + 'Attribution']) return container[relationshipType + 'Attribution'];

  return null;
}

function resolvePartnerQuarterlyRelationshipAttribution({
  advisor = {},
  evidence = {},
  requestedConcept,
} = {}) {
  const relationshipType = resolvePartnerQuarterlyRelationshipType(requestedConcept);
  if (!relationshipType) return null;

  const advisorId = resolvePartnerOwnershipAdvisorId(advisor);
  const sourceAdvisor = advisor.metadata?.sourceAdvisor || {};

  const containers = [
    advisor.relationshipAttribution,
    advisor.relationshipAttributions,
    advisor.managerPrecontractRelationshipAttribution,
    advisor.managerPrecontractRelationshipAttributions,
    advisor.precontractRelationshipAttribution,
    advisor.precontractRelationshipAttributions,
    advisor.ownershipAttribution,
    advisor.ownershipAttributions,
    sourceAdvisor.relationshipAttribution,
    sourceAdvisor.relationshipAttributions,
    sourceAdvisor.managerPrecontractRelationshipAttribution,
    sourceAdvisor.managerPrecontractRelationshipAttributions,
    sourceAdvisor.precontractRelationshipAttribution,
    sourceAdvisor.precontractRelationshipAttributions,
    sourceAdvisor.ownershipAttribution,
    sourceAdvisor.ownershipAttributions,
    advisorId ? evidence.relationshipAttributionsByAdvisor?.[advisorId] : null,
    advisorId ? evidence.managerPrecontractRelationshipAttributionsByAdvisor?.[advisorId] : null,
    advisorId ? evidence.precontractRelationshipAttributionsByAdvisor?.[advisorId] : null,
    advisorId ? evidence.partnerOwnershipAttributionsByAdvisor?.[advisorId] : null,
  ];

  for (const container of containers) {
    const attribution = findRelationshipAttributionInContainer(container, relationshipType);
    if (attribution) return attribution;
  }

  return null;
}

function shouldEvaluatePartnerQuarterlyOwnership({ evidence = {}, relationshipAttribution = null } = {}) {
  return Boolean(relationshipAttribution) || evidence.partnerOwnershipSourceTruthRequired === true;
}

function applyPartnerOwnershipSourceTruthToQuarterlyPart({
  part,
  partner = {},
  evidence = {},
  advisor = {},
  requestedConcept,
  relationshipAttribution = null,
} = {}) {
  if (!shouldEvaluatePartnerQuarterlyOwnership({ evidence, relationshipAttribution })) {
    return {
      ...part,
      metadata: {
        ...part.metadata,
        ownershipSourceTruth: {
          status: 'not_required_legacy_mode',
          reason: 'partner_ownership_source_truth_not_required',
          requestedConcept,
          partnerId: resolvePartnerOwnershipPartnerId(partner),
          advisorId: resolvePartnerOwnershipAdvisorId(advisor),
          payoutTruth: false,
        },
      },
    };
  }

  const ownershipSourceTruth = evaluatePartnerOwnershipSourceTruth({
    partnerId: resolvePartnerOwnershipPartnerId(partner),
    requestedConcept,
    relationshipAttribution,
  });

  if (
    ownershipSourceTruth.status === 'confirmed' &&
    ownershipSourceTruth.ownershipAllowed === true &&
    ownershipSourceTruth.calculationAllowed === true
  ) {
    return {
      ...part,
      metadata: {
        ...part.metadata,
        ownershipSourceTruth,
      },
    };
  }

  return {
    ...part,
    status: ownershipSourceTruth.status,
    calculationAllowed: false,
    calculatedCandidate: false,
    candidateAmount: null,
    blockedReasons: [
      ...(part.blockedReasons || []),
      ...(ownershipSourceTruth.blockedReasons || []),
    ].filter(Boolean),
    missingInputs: [
      ...(part.missingInputs || []),
      ...(ownershipSourceTruth.missingInputs || []),
    ].filter(Boolean),
    metadata: {
      ...part.metadata,
      ownershipSourceTruth,
    },
  };
}

function resolvePartnerQuarterlyDeveloperCount({
  advisor = {},
  relationshipAttribution = null,
} = {}) {
  if (relationshipAttribution?.relationshipType === 'development') {
    if (relationshipAttribution.developerShare === 0.5) return 2;
    if (relationshipAttribution.developerShare === 1.0) return 1;
  }

  return advisor.developerCount || 1;
}

function quarterAverage(value) {
  return hasNumber(value) ? Number(value) / 3 : null;
}

function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value);
  const normalized = raw.length === 7 ? `${raw}-01` : raw.slice(0, 10);
  const date = new Date(`${normalized}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function addMonths(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function monthsBetweenInclusive(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) return [];
  const months = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor <= last) {
    months.push({ key: monthKey(cursor), date: new Date(cursor) });
    cursor = addMonths(cursor, 1);
  }
  return months;
}

function resolvePeriodMonths(period = {}) {
  if (Array.isArray(period.months) && period.months.length > 0) {
    return period.months.map((month) => {
      const date = parseDate(`${month}-01`);
      return date ? { key: month, date } : null;
    }).filter(Boolean);
  }
  if (period.startDate && period.endDate) return monthsBetweenInclusive(period.startDate, period.endDate);
  if (period.year && period.quarter) {
    const quarterNumber = Number(String(period.quarter).replace('Q', ''));
    if (quarterNumber >= 1 && quarterNumber <= 4) {
      const startMonth = (quarterNumber - 1) * 3;
      const start = new Date(Date.UTC(Number(period.year), startMonth, 1));
      const end = new Date(Date.UTC(Number(period.year), startMonth + 2, 1));
      return monthsBetweenInclusive(monthKey(start), monthKey(end));
    }
  }
  return [];
}

function careerMonthAt(connectionDate, targetDate) {
  const start = parseDate(connectionDate);
  const target = parseDate(targetDate);
  if (!start || !target) return null;
  const diff = (target.getUTCFullYear() - start.getUTCFullYear()) * 12 + target.getUTCMonth() - start.getUTCMonth();
  return diff >= 0 ? diff + 1 : null;
}

function sumCommissionBucket(initialCommissions = {}) {
  return sumNumbers([
    initialCommissions.vidaIndividual,
    initialCommissions.gmmiIndividual,
    initialCommissions.otherRamos,
  ]) ?? 0;
}

function policyCountingFactor(rulePack, conceptKey) {
  const factor = rulePack?.concepts?.[conceptKey]?.policyCounting?.lifePlusIndividualGMMICountsAs;
  return hasNumber(factor) ? Number(factor) : 1;
}

function monthlyPolicyCount(fact = {}, gmmiFactor = 1) {
  const paidPolicies = fact.paidPolicies || {};
  return Number(paidPolicies.vidaIndividual || 0) + (Number(paidPolicies.gmmiIndividual || 0) * Number(gmmiFactor));
}


function normalizeMonthlyFacts(advisor = {}, periodMonths = [], rulePack) {
  const numberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const monthKeyFrom = (value) => {
    if (!value) return null;

    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}$/.test(value)) return value;
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 7);
      return null;
    }

    const raw = value.month || value.monthId || value.key || value.id || value.date || value.startDate || value.endDate;

    if (typeof raw === 'string') {
      if (/^\d{4}-\d{2}$/.test(raw)) return raw;
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
    }

    return null;
  };

  const gmmiPolicyFactor = (() => {
    const candidates = [
      rulePack?.concepts?.['connection-bonus']?.policyCounting?.lifePlusIndividualGMMICountsAs,
      rulePack?.concepts?.['development-bonus']?.policyCounting?.lifePlusIndividualGMMICountsAs,
      rulePack?.concepts?.['activity-bonus']?.policyCounting?.lifePlusIndividualGMMICountsAs,
      rulePack?.policyCounting?.lifePlusIndividualGMMICountsAs,
      rulePack?.countingRules?.gmmiIndividualPolicyFactor
    ];

    for (const candidate of candidates) {
      const numeric = numberOrNull(candidate);
      if (numeric !== null) return numeric;
    }

    return 0.5;
  })();

  const rawFacts = Array.isArray(advisor.monthlyFacts) ? advisor.monthlyFacts : [];
  const factsByMonth = new Map();

  for (const fact of rawFacts) {
    const key = monthKeyFrom(fact);
    if (key) factsByMonth.set(key, fact);
  }

  const periodKeys = (Array.isArray(periodMonths) ? periodMonths : [])
    .map((month) => monthKeyFrom(month))
    .filter(Boolean);

  let selectedFacts = [];

  if (periodKeys.length > 0) {
    selectedFacts = periodKeys
      .map((key) => factsByMonth.get(key))
      .filter(Boolean);
  }

  if (selectedFacts.length === 0) {
    selectedFacts = rawFacts.slice();
  }

  const normalizedFacts = selectedFacts.map((fact) => {
    const initial = fact.initialCommissions || {};
    const policies = fact.paidPolicies || fact.policies || {};

    const vidaIndividual =
      numberOrNull(fact.vidaIndividualInitialCommissions) ??
      numberOrNull(fact.lifeIndividualInitialCommissions) ??
      numberOrNull(initial.vidaIndividual) ??
      numberOrNull(initial.lifeIndividual) ??
      0;

    const gmmiIndividual =
      numberOrNull(fact.gmmiIndividualInitialCommissions) ??
      numberOrNull(fact.individualGmmInitialCommissions) ??
      numberOrNull(initial.gmmiIndividual) ??
      numberOrNull(initial.individualGmm) ??
      numberOrNull(initial.gmmIndividual) ??
      0;

    const otherRamos =
      numberOrNull(fact.otherRamosInitialCommissions) ??
      numberOrNull(fact.otherInitialCommissions) ??
      numberOrNull(initial.otherRamos) ??
      numberOrNull(initial.other) ??
      0;

    const initialCommissionsAllRamos =
      numberOrNull(fact.initialCommissionsAllRamos) ??
      numberOrNull(fact.quarterInitialCommissions) ??
      (vidaIndividual + gmmiIndividual + otherRamos);

    const lifeAndGmmiInitialCommissions =
      numberOrNull(fact.lifeAndGmmiInitialCommissions) ??
      numberOrNull(fact.qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi) ??
      (vidaIndividual + gmmiIndividual);

    const vidaPolicies =
      numberOrNull(fact.monthlyPolicies) ??
      numberOrNull(fact.validPolicyCount) ??
      numberOrNull(policies.vidaIndividual) ??
      numberOrNull(policies.lifeIndividual) ??
      0;

    const gmmiPolicies =
      numberOrNull(policies.gmmiIndividual) ??
      numberOrNull(policies.individualGmm) ??
      numberOrNull(policies.gmmIndividual) ??
      0;

    const monthlyPolicies =
      numberOrNull(fact.monthlyPolicies) ??
      (vidaPolicies + gmmiPolicies);

    return {
      ...fact,
      month: monthKeyFrom(fact),
      initialCommissionsAllRamos,
      lifeIndividualInitialCommissions: vidaIndividual,
      lifeAndGmmiInitialCommissions,
      monthlyPolicies,
      monthlyPolicyCount: monthlyPolicies,
      monthlyPaidPolicyCount: monthlyPolicies,
      paidPoliciesCount: monthlyPolicies,
      paidPoliciesAmount: monthlyPolicies,
      appliedPolicies: monthlyPolicies,
      appliedPoliciesCount: monthlyPolicies,
      appliedPolicyAmount: monthlyPolicies,
      policyAmount: monthlyPolicies,
      policiesAmount: monthlyPolicies,
      validPolicyCount: monthlyPolicies,
      appliedPolicyCount: monthlyPolicies,
      policyCount: monthlyPolicies,
      paidPolicyCount: monthlyPolicies,
      paidAppliedPolicyCount: monthlyPolicies,
      policies: monthlyPolicies
    };
  });

  const sum = (items, selector) => items.reduce((total, item) => {
    const numeric = numberOrNull(selector(item));
    return total + (numeric ?? 0);
  }, 0);

  const quarterInitialCommissionsAllRamos = sum(normalizedFacts, (fact) => fact.initialCommissionsAllRamos);
  const lifeIndividualInitialCommissions = sum(normalizedFacts, (fact) => fact.lifeIndividualInitialCommissions);
  const qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi = sum(normalizedFacts, (fact) => fact.lifeAndGmmiInitialCommissions);
  const quarterPolicyTotal = sum(normalizedFacts, (fact) => fact.monthlyPolicies);

  const denominator = periodKeys.length > 0 ? periodKeys.length : normalizedFacts.length;
  const monthlyAveragePolicies = denominator > 0 ? quarterPolicyTotal / denominator : null;

  return {
    facts: normalizedFacts,
    quarterInitialCommissionsAllRamos,
    lifeIndividualInitialCommissions,
    qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi,
    quarterPolicyTotal,
    monthlyAveragePolicies
  };
}




function normalizePartnerQuarterlyInput({ partner = {}, advisors = [], period = {}, evidence = {} } = {}, rulePack) {
  const monthKeyFrom = (value) => {
    if (!value) return null;

    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}$/.test(value)) return value;
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 7);
      return null;
    }

    const raw = value.month || value.monthId || value.key || value.id || value.date || value.startDate || value.endDate;

    if (typeof raw === 'string') {
      if (/^\d{4}-\d{2}$/.test(raw)) return raw;
      if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 7);
    }

    return null;
  };

  const buildPeriodMonths = () => {
    if (Array.isArray(period.months) && period.months.length > 0) {
      return period.months.map((month) => {
        const key = monthKeyFrom(month);
        const date = parseDate(month.startDate || month.date || (key ? `${key}-01` : null));

        return {
          ...month,
          key,
          date
        };
      }).filter((month) => month.key);
    }

    const start = parseDate(period.startDate);
    const end = parseDate(period.endDate);

    if (!start || !end) return [];

    const months = [];
    let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));

    while (cursor <= end) {
      const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`;
      months.push({
        id: key,
        key,
        date: new Date(cursor)
      });
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    return months;
  };

  const periodMonths = buildPeriodMonths();

  const periodStartDate = parseDate(period.startDate) || periodMonths[0]?.date || null;
  const periodEndDate = parseDate(period.endDate) || periodMonths[periodMonths.length - 1]?.date || null;

  const partnerCareerMonthAtPeriodStart =
    partner.partnerCareerMonthAtPeriodStart ??
    careerMonthAt(partner.connectionDate || partner.connectedDate, periodStartDate);

  const partnerCareerMonthAtPeriodEnd =
    partner.partnerCareerMonthAtPeriodEnd ??
    careerMonthAt(partner.connectionDate || partner.connectedDate, periodEndDate);

  const normalizedPartner = {
    ...partner,
    partnerCareerMonthAtPeriodStart,
    partnerCareerMonthAtPeriodEnd,
    partnerCareerMonth: partner.partnerCareerMonth ?? partnerCareerMonthAtPeriodEnd,
    partnerConnectedYear: partner.partnerConnectedYear ?? parseDate(partner.connectionDate || partner.connectedDate)?.getUTCFullYear(),
    unitLIMRA: partner.unitLIMRA ?? partner.unitIndexes?.LIMRA ?? partner.indexes?.LIMRA ?? null,
    unitIGC: partner.unitIGC ?? partner.unitIndexes?.IGC ?? partner.indexes?.IGC ?? null
  };

  const normalizedAdvisors = advisors.map((advisor) => {
    if (!Array.isArray(advisor.monthlyFacts) || advisor.monthlyFacts.length === 0) {
      return advisor;
    }

    const advisorConnectionDate = advisor.connectionDate || advisor.contestDate;

    const advisorCareerMonthAtPeriodStart =
      advisor.advisorCareerMonthAtPeriodStart ??
      careerMonthAt(advisorConnectionDate, periodStartDate);

    const advisorCareerMonthAtPeriodEnd =
      advisor.advisorCareerMonthAtPeriodEnd ??
      careerMonthAt(advisorConnectionDate, periodEndDate);

    const monthly = normalizeMonthlyFacts(advisor, periodMonths, rulePack);

    const quarterInitialCommissions =
      advisor.quarterInitialCommissions ??
      monthly.quarterInitialCommissionsAllRamos;

    const lifeIndividualInitialCommissions =
      advisor.lifeIndividualInitialCommissions ??
      monthly.lifeIndividualInitialCommissions;

    const lifeIndividualShare =
      advisor.lifeIndividualShare ??
      (
        hasNumber(lifeIndividualInitialCommissions) &&
        hasNumber(quarterInitialCommissions) &&
        Number(quarterInitialCommissions) > 0
          ? Number(lifeIndividualInitialCommissions) / Number(quarterInitialCommissions)
          : null
      );

    return {
      ...advisor,
      advisorCareerMonthAtPeriodStart,
      advisorCareerMonthAtPeriodEnd,
      advisorMonth: advisor.advisorMonth ?? advisorCareerMonthAtPeriodEnd,
      quarterInitialCommissions,
      quarterInitialCommissionsAllRamos: advisor.quarterInitialCommissionsAllRamos ?? quarterInitialCommissions,
      lifeIndividualInitialCommissions,
      lifeIndividualShare,
      qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi:
        advisor.qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi ??
        monthly.qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi,
      quarterPolicyTotal: advisor.quarterPolicyTotal ?? monthly.quarterPolicyTotal,
      monthlyAveragePolicies: advisor.monthlyAveragePolicies ?? monthly.monthlyAveragePolicies,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence ?? true,
      activeAtQuarterClose: advisor.activeAtQuarterClose ?? (advisor.active === true || advisor.status === 'active'),
      advisorActiveStatus: advisor.advisorActiveStatus ?? advisor.status,
      LIMRA: advisor.LIMRA ?? advisor.indexes?.LIMRA ?? null,
      IGC: advisor.IGC ?? advisor.indexes?.IGC ?? null,
      metadata: {
        ...(advisor.metadata || {}),
        normalizedMonthlyFacts: monthly.facts
      }
    };
  });

  return {
    partner: normalizedPartner,
    advisors: normalizedAdvisors,
    period,
    evidence,
    metadata: {
      periodMonths
    }
  };
}



function validOutput(advisor) {
  return createAdvisorEconomicOutput({
    advisorId: advisor.advisorId || advisor.name || 'advisor',
    initialCommissions: advisor.quarterInitialCommissions,
    economicStatus: advisor.economicStatus || ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
  });
}

function collectBlockedConcepts(concepts) {
  return Object.entries(concepts)
    .filter(([, result]) => (result?.blockedReasons || []).length > 0 || (result?.missingInputs || []).length > 0)
    .map(([conceptKey, result]) => ({
      conceptKey,
      blockedReasons: result.blockedReasons || [],
      missingInputs: result.missingInputs || [],
    }));
}

function calculatedAmount(result) {
  return hasNumber(result?.candidateAmount) ? Number(result.candidateAmount) : null;
}

function sourceRulePackFileName(rulePack) {
  const sourceRulePackFile = rulePack?.sourceRulePackFile;
  if (sourceRulePackFile) {
    return String(sourceRulePackFile).split('/').pop();
  }
  return 'smnyl_partner_compensation_2026_rules_official_v1.json';
}

function inferTrainingWinnerInQuarter({ advisors = [], evidence = {} } = {}) {
  if (evidence.trainingWinnerInQuarter === true || evidence.taCountingEventEvidence === true) {
    return {
      trainingWinnerInQuarter: true,
      source: 'explicit_evidence',
      warnings: [],
    };
  }
  if (evidence.trainingWinnerInQuarter === false) {
    return {
      trainingWinnerInQuarter: false,
      source: 'explicit_evidence',
      warnings: [],
    };
  }

  const trainingEvent = (evidence.trainingAllowanceEvents || []).find((event) => (
    (event.wonTrainingAllowanceFirstTimeInQuarter === true || event.inQuarter === true) &&
    event.activeAtPeriodClose !== false &&
    event.activeGroup2 !== false
  ));

  if (trainingEvent) {
    return {
      trainingWinnerInQuarter: true,
      source: 'training_allowance_event_evidence',
      advisorId: trainingEvent.advisorId || null,
      warnings: [],
    };
  }

  const inferredAdvisor = advisors.find((advisor) => (
    Number(advisor.advisorMonth) >= 1 &&
    Number(advisor.advisorMonth) <= 12 &&
    advisor.wonTrainingAllowanceFirstTimeInQuarter === true &&
    advisor.activeAtQuarterClose === true
  ));

  if (inferredAdvisor) {
    return {
      trainingWinnerInQuarter: true,
      source: 'advisor_training_winner_evidence',
      advisorId: inferredAdvisor.advisorId || inferredAdvisor.name || null,
      warnings: [],
    };
  }

  return {
    trainingWinnerInQuarter: null,
    source: 'unknown',
    warnings: ['training_winner_not_inferred_from_advisor_month_only'],
  };
}

function inferTrainingWinnerCountLastSixMonths({ advisors = [], evidence = {}, periodEndDate = null } = {}) {
  if (hasNumber(evidence.trainingWinnerActualCountLastSixMonths)) {
    return Number(evidence.trainingWinnerActualCountLastSixMonths);
  }
  if (Array.isArray(evidence.trainingAllowanceEvents) && evidence.trainingAllowanceEvents.length > 0) {
    const end = parseDate(periodEndDate);
    const windowStart = end ? addMonths(end, -5) : null;
    return evidence.trainingAllowanceEvents.filter((event) => {
      const eventDate = parseDate(event.date || event.firstWonDate || event.trainingAllowanceDate);
      if (end && eventDate && (eventDate < windowStart || eventDate > end)) return false;
      if (event.activeGroup2 === false || event.activeAtPeriodClose === false) return false;
      if (hasNumber(event.unitOnboardingSequence) && Number(event.unitOnboardingSequence) <= 2) return false;
      return event.countsForSupport !== false;
    }).length;
  }
  const winnerEvidenceAdvisors = advisors.filter((advisor) => (
    advisor.wonTrainingAllowanceFirstTimeInLastSixMonths === true ||
    advisor.wonTrainingAllowanceFirstTimeInQuarter === true
  ));
  if (winnerEvidenceAdvisors.length === 0) return null;
  const winners = winnerEvidenceAdvisors.filter((advisor) => (
    advisor.activeGroup2 === true &&
    Number(advisor.advisorMonth) <= 12 &&
    Number(advisor.unitOnboardingSequence || 999) > 2
  ));
  return winners.length;
}

function isPayablePartnerConceptKey(conceptKey) {
  return ![
    'productivityBase',
    'productivity-base',
    'productivity_base',
  ].includes(conceptKey);
}

function normalizeRequestedPartnerConceptKey(conceptKey) {
  const aliases = {
    production: 'production',
    'production-bonus': 'production',
    productivityMultiplier: 'productivityMultiplier',
    'productivity-multiplier': 'productivityMultiplier',
    productivityBase: 'productivityBase',
    'productivity-base': 'productivityBase',
    activity: 'activity',
    'activity-bonus': 'activity',
    development: 'development',
    'development-bonus': 'development',
    connection: 'connection',
    'connection-bonus': 'connection',
    fixedSupport: 'fixedSupport',
    'fixed-support': 'fixedSupport',
  };
  return aliases[conceptKey] || null;
}

function resolveRequestedConceptForSubtotal({ conceptKey, concepts = {} } = {}) {
  const concept = concepts[conceptKey];
  const amount = calculatedAmount(concept);

  if (hasNumber(amount)) {
    return {
      conceptKey,
      concept,
      amount,
      warnings: [],
    };
  }

  if (conceptKey === 'productivityMultiplier') {
    const productivityBaseAmount = calculatedAmount(concepts.productivityBase);
    if (hasNumber(productivityBaseAmount)) {
      return {
        conceptKey,
        concept: {
          ...(concepts.productivityBase || {}),
          sourceConceptKey: 'productivityMultiplier',
          conceptKey: 'productivityMultiplier',
          candidateAmount: productivityBaseAmount,
          amount: productivityBaseAmount,
          payoutTruth: false,
          warnings: [
            ...((concepts.productivityBase || {}).warnings || []),
            'productivity_multiplier_blocked_using_productivity_base',
          ],
          metadata: {
            ...((concepts.productivityBase || {}).metadata || {}),
            requestedConceptFallback: {
              requestedConceptKey: 'productivityMultiplier',
              effectiveConceptKey: 'productivityBase',
              reason: 'productivity_multiplier_blocked_using_productivity_base',
            },
          },
        },
        amount: productivityBaseAmount,
        warnings: ['productivity_multiplier_blocked_using_productivity_base'],
      };
    }
  }

  return {
    conceptKey,
    concept,
    amount: null,
    warnings: [],
  };
}

function calculateRequestedConceptsSubtotal({ requestedConcepts = null, concepts = {} } = {}) {
  if (!Array.isArray(requestedConcepts)) {
    return {
      requestedConcepts: null,
      requestedConceptsApplied: [],
      requestedConceptsMissing: [],
      requestedConceptsWarnings: [],
      requestedConceptsForPaymentCadence: {},
      subtotalRequestedConceptsCandidate: null,
    };
  }

  const applied = [];
  const missing = [];
  const amounts = [];
  const requestedConceptsWarnings = [];
  const requestedConceptsForPaymentCadence = {};

  for (const requestedConcept of requestedConcepts) {
    const normalizedConceptKey = normalizeRequestedPartnerConceptKey(requestedConcept);
    if (!normalizedConceptKey || !Object.prototype.hasOwnProperty.call(concepts, normalizedConceptKey)) {
      missing.push(requestedConcept);
      continue;
    }

    if (!applied.includes(normalizedConceptKey)) {
      applied.push(normalizedConceptKey);
    }

    const resolved = resolveRequestedConceptForSubtotal({ conceptKey: normalizedConceptKey, concepts });
    requestedConceptsWarnings.push(...resolved.warnings);
    if (resolved.concept) {
      requestedConceptsForPaymentCadence[normalizedConceptKey] = resolved.concept;
    }
    if (hasNumber(resolved.amount)) {
      amounts.push(resolved.amount);
    }
  }

  return {
    requestedConcepts: [...requestedConcepts],
    requestedConceptsApplied: applied,
    requestedConceptsMissing: missing,
    requestedConceptsWarnings: [...new Set(requestedConceptsWarnings)],
    requestedConceptsForPaymentCadence,
    subtotalRequestedConceptsCandidate: sumNumbers(amounts),
  };
}

function buildPaymentCadencePeriod(period = {}, periodMonths = []) {
  const lastPeriodMonth = periodMonths[periodMonths.length - 1]?.key || null;
  const quarterNumber = Number(String(period.quarter || '').replace('Q', ''));
  const quarterEndMonth = hasNumber(period.year) && quarterNumber >= 1 && quarterNumber <= 4
    ? `${period.year}-${String(quarterNumber * 3).padStart(2, '0')}`
    : null;
  return {
    ...period,
    quarterEndMonth: period.quarterEndMonth || period.endMonth || lastPeriodMonth || quarterEndMonth,
  };
}

function buildRequestedConceptsForPaymentCadence({ concepts = {}, requestedConceptsApplied = [] } = {}) {
  return requestedConceptsApplied.reduce((requestedConceptsForSchedule, conceptKey) => {
    const concept = concepts[conceptKey];
    if (!concept) return requestedConceptsForSchedule;

    const amount = calculatedAmount(concept);
    requestedConceptsForSchedule[conceptKey] = {
      ...concept,
      sourceConceptKey: conceptKey,
      conceptKey,
      candidateAmount: amount,
      amount,
      payoutTruth: false,
    };

    return requestedConceptsForSchedule;
  }, {});
}

function buildRequestedPaymentSchedule({
  concepts = {},
  requestedConceptsResult,
  period = {},
  periodMonths = [],
} = {}) {
  if (!Array.isArray(requestedConceptsResult?.requestedConcepts)) return null;

  const requestedConceptsForSchedule = buildRequestedConceptsForPaymentCadence({
    concepts: requestedConceptsResult.requestedConceptsForPaymentCadence || concepts,
    requestedConceptsApplied: requestedConceptsResult.requestedConceptsApplied,
  });

  return createPartnerPaymentCadenceSchedule({
    period: buildPaymentCadencePeriod(period, periodMonths),
    concepts: requestedConceptsForSchedule,
    paymentDistributionRulePack: PAYMENT_DISTRIBUTION_RULE_PACK,
    rulePackIdentity: {
      rulePackId: PAYMENT_DISTRIBUTION_RULE_PACK.metadata.rulePackId,
      rulePackVersion: PAYMENT_DISTRIBUTION_RULE_PACK.metadata.rulePackVersion,
      rulePackHash: PAYMENT_DISTRIBUTION_RULE_PACK_HASH,
      rulePackEffectiveDate: PAYMENT_DISTRIBUTION_RULE_PACK.metadata.rulePackEffectiveDate,
      sourceEvidenceRefs: PAYMENT_DISTRIBUTION_RULE_PACK.metadata.sourceEvidenceRefs,
      governanceStatus: PAYMENT_DISTRIBUTION_RULE_PACK.metadata.governanceStatus,
      calculatedAt: null,
    },
  });
}

function buildQuarterlyPaymentSchedule({ concepts, rulePack }) {
  const monthlyAdvances = [];
  const monthlyPayments = [];
  const eventBasedPayments = [];
  const quarterEndPayments = [];
  const blockedPayments = [];
  const warnings = [];

  for (const [conceptKey, result] of Object.entries(concepts)) {
    const amount = calculatedAmount(result);
    const cadence = rulePack.concepts?.[conceptKey]?.paymentCadence || {};
    if (!hasNumber(amount)) {
      blockedPayments.push({
        conceptKey,
        blockedReasons: result?.blockedReasons || [],
        missingInputs: result?.missingInputs || [],
      });
      continue;
    }

    if (cadence.paymentFrequency === 'monthly' && Number(cadence.paymentDurationMonths) === 3) {
      monthlyPayments.push({
        conceptKey,
        months: 3,
        monthlyAmount: amount / 3,
        totalAmount: amount,
        settlementTiming: cadence.settlementTiming,
      });
    } else if (cadence.paymentFrequency === 'monthly') {
      monthlyAdvances.push({
        conceptKey,
        amount,
        settlementTiming: cadence.settlementTiming,
      });
    } else if (String(cadence.paymentFrequency || '').includes('one_time')) {
      eventBasedPayments.push({
        conceptKey,
        amount,
        settlementTiming: cadence.settlementTiming,
      });
    } else {
      quarterEndPayments.push({
        conceptKey,
        amount,
        settlementTiming: cadence.settlementTiming || null,
      });
      warnings.push(`unknown_payment_cadence:${conceptKey}`);
    }
  }

  const payableMonthlyAdvances = monthlyAdvances.filter((payment) => isPayablePartnerConceptKey(payment.conceptKey));
  const payableMonthlyPayments = monthlyPayments.filter((payment) => isPayablePartnerConceptKey(payment.conceptKey));
  const payableEventBasedPayments = eventBasedPayments.filter((payment) => isPayablePartnerConceptKey(payment.conceptKey));
  const payableQuarterEndPayments = quarterEndPayments.filter((payment) => isPayablePartnerConceptKey(payment.conceptKey));

  const totalQuarterPayableCandidate = sumNumbers(Object.entries(concepts)
    .filter(([conceptKey]) => isPayablePartnerConceptKey(conceptKey))
    .map(([, concept]) => calculatedAmount(concept)));
  return {
    monthlyAdvances: payableMonthlyAdvances,
    monthlyPayments: payableMonthlyPayments,
    eventBasedPayments: payableEventBasedPayments,
    quarterEndPayments: payableQuarterEndPayments,
    blockedPayments,
    totalQuarterPayableCandidate,
    averageMonthlyCashflowCandidate: hasNumber(totalQuarterPayableCandidate) ? totalQuarterPayableCandidate / 3 : null,
    warnings,
  };
}

export function calculatePartnerQuarterlyBonusCandidate({
  partner = {},
  advisors = [],
  period = {},
  evidence = {},
  rulePack = null,
  requestedConcepts = null,
} = {}) {
  const activeRulePack = rulePack || loadPartner2026RulePack();
  const normalizedInput = normalizePartnerQuarterlyInput({ partner, advisors, period, evidence }, activeRulePack);
  partner = normalizedInput.partner;
  advisors = normalizedInput.advisors;
  period = normalizedInput.period;
  evidence = normalizedInput.evidence;
  const warnings = [];
  const missingInputs = [];
  const periodMonths = normalizedInput.metadata.periodMonths;

  const qualifiedAdvisorResults = advisors.map((advisor) => {
    const averageMonthlyInitialCommissions = hasNumber(advisor.averageMonthlyInitialCommissions)
      ? Number(advisor.averageMonthlyInitialCommissions)
      : quarterAverage(advisor.quarterInitialCommissions);
    return evaluateQualifiedAdvisorEconomicStatus({
      rulePack: activeRulePack,
      advisorId: advisor.advisorId || advisor.name,
      averageMonthlyInitialCommissions,
      lifeIndividualShare: advisor.lifeIndividualShare,
      lifeIndividualInitialCommissions: advisor.lifeIndividualInitialCommissions,
      quarterInitialCommissions: advisor.quarterInitialCommissions,
      LIMRA: advisor.LIMRA,
      IGC: advisor.IGC,
      lifecycleStatus: advisor.lifecycleStatus || (advisor.activeAtQuarterClose ? 'connected_active' : 'unknown'),
      lifecycleGateAllowed: advisor.lifecycleGateAllowed ?? advisor.activeAtQuarterClose === true,
      advisorActiveStatus: advisor.advisorActiveStatus || (advisor.activeAtQuarterClose ? 'active' : null),
      careerMonth: advisor.advisorMonth,
      economicOutputStatus: advisor.economicStatus || ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
    });
  });
  const qualifiedAdvisors = advisors.filter((_, index) => qualifiedAdvisorResults[index].qualified === true);
  const nonQualifiedActiveAdvisors = advisors.filter((advisor, index) => (
    qualifiedAdvisorResults[index].qualified !== true &&
    (advisor.activeAtQuarterClose === true || advisor.advisorActiveStatus === 'active')
  ));

  const productivityBaseParts = qualifiedAdvisors.map((advisor, index) => {
    const originalIndex = advisors.indexOf(advisor);
    const averageMonthlyInitialCommissions = qualifiedAdvisorResults[originalIndex].averageMonthlyInitialCommissions;
    return calculatePartnerProductivityBaseCandidate({
      rulePack: activeRulePack,
      advisorEconomicOutputs: [validOutput(advisor)],
      qualifiedAdvisorEconomicStatuses: [qualifiedAdvisorResults[originalIndex]],
      averageMonthlyInitialCommissions,
      advisorCareerMonth: advisor.advisorMonth,
      lifecycleGate: { allowed: true },
      baseAmount: advisor.quarterInitialCommissions,
    });
  });
  const productivityBaseAmount = sumNumbers(productivityBaseParts.map((part) => part.candidateAmount));
  const productivityBase = {
    conceptKey: 'productivity-base',
    status: hasNumber(productivityBaseAmount) ? 'calculated_candidate' : 'blocked_by_missing_economic_input',
    candidateAmount: productivityBaseAmount,
    payoutTruth: false,
    blockedReasons: productivityBaseParts.flatMap((part) => part.blockedReasons || []),
    missingInputs: productivityBaseParts.flatMap((part) => part.missingInputs || []),
    warnings: productivityBaseParts.flatMap((part) => part.warnings || []),
    metadata: { parts: productivityBaseParts },
  };

  const trainingWinnerInference = inferTrainingWinnerInQuarter({ advisors, evidence });
  warnings.push(...trainingWinnerInference.warnings);
  const productivityMultiplier = calculatePartnerProductivityMultiplierCandidate({
    rulePack: activeRulePack,
    productivityBaseCandidate: productivityBaseAmount,
    qualifiedAdvisorCount: qualifiedAdvisors.length,
    partnerCareerMonth: partner.partnerCareerMonth,
    partnerConnectedYear: partner.partnerConnectedYear,
    trainingWinnerInQuarter: trainingWinnerInference.trainingWinnerInQuarter,
  });

  const productionBaseAmount = sumNumbers(nonQualifiedActiveAdvisors.map((advisor) => advisor.quarterInitialCommissions));
  const production = calculatePartnerProductionBonusCandidate({
    rulePack: activeRulePack,
    nonQualifiedAdvisorEconomicOutput: nonQualifiedActiveAdvisors.length > 0 ? validOutput(nonQualifiedActiveAdvisors[0]) : null,
    organizationType: partner.organizationType,
    unitLIMRA: partner.unitLIMRA,
    unitIGC: partner.unitIGC,
    paidAppliedEconomicEvidence: evidence.paidAppliedEconomicEvidence !== false,
    validEconomicBaseAmount: productionBaseAmount,
  });

  const activityParts = qualifiedAdvisors.map((advisor) => {
    const originalIndex = advisors.indexOf(advisor);
    const sourceAdvisor = originalIndex >= 0 ? advisors[originalIndex] : advisor;
    const activityNumberOrNull = (value) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) ? numericValue : null;
    };
    const activityPolicyOverrideValue =
      activityNumberOrNull(advisor.activityMonthlyAveragePolicies) ??
      activityNumberOrNull(sourceAdvisor.activityMonthlyAveragePolicies) ??
      activityNumberOrNull(advisor.activityEligiblePolicyAverage) ??
      activityNumberOrNull(sourceAdvisor.activityEligiblePolicyAverage) ??
      activityNumberOrNull(advisor.activityPaidPolicyAverage) ??
      activityNumberOrNull(sourceAdvisor.activityPaidPolicyAverage);
    const activityMonthlyAveragePolicies = activityPolicyOverrideValue ?? advisor.monthlyAveragePolicies;
    const activityQuarterPolicyTotal = activityPolicyOverrideValue === null ? advisor.quarterPolicyTotal : activityPolicyOverrideValue * periodMonths.length;
    const activityEconomicBasisAmount =
      activityNumberOrNull(advisor.activityInitialCommissionsLifeIndividualAndGmmi) ??
      activityNumberOrNull(sourceAdvisor.activityInitialCommissionsLifeIndividualAndGmmi) ??
      activityNumberOrNull(advisor.activityBasisLifeIndividualAndGmmi) ??
      activityNumberOrNull(sourceAdvisor.activityBasisLifeIndividualAndGmmi) ??
      activityNumberOrNull(advisor.activityBasis) ??
      activityNumberOrNull(sourceAdvisor.activityBasis) ??
      advisor.qualifiedAdvisorInitialCommissionsLifeIndividualAndGmmi;
    return calculatePartnerActivityBonusCandidate({
      rulePack: activeRulePack,
      qualifiedAdvisorStatus: qualifiedAdvisorResults[originalIndex],
      advisorCareerMonth: advisor.advisorMonth,
      monthlyAveragePolicies: activityMonthlyAveragePolicies,
      quarterPolicyTotal: activityQuarterPolicyTotal,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence === true,
      economicBasisAmount: activityEconomicBasisAmount,
      period,
    });
  });
  const activityAmount = sumNumbers(activityParts.map((part) => part.candidateAmount));
  const activity = {
    conceptKey: 'activity-bonus',
    status: hasNumber(activityAmount) ? 'calculated_candidate' : 'blocked_by_missing_economic_input',
    candidateAmount: activityAmount,
    payoutTruth: false,
    blockedReasons: activityParts.flatMap((part) => part.blockedReasons || []),
    missingInputs: activityParts.flatMap((part) => part.missingInputs || []),
    warnings: activityParts.flatMap((part) => part.warnings || []),
    metadata: { parts: activityParts },
  };

  const connectionParts = advisors.flatMap((advisor) => {
    if ((advisor.connectionDate || advisor.contestDate) && advisor.metadata?.normalizedMonthlyFacts && periodMonths.length > 0) {
      return periodMonths
        .map((month) => {
          const advisorMonth = careerMonthAt(advisor.connectionDate || advisor.contestDate, month.date);
          const monthFact = advisor.metadata.normalizedMonthlyFacts.find((fact) => fact.month === month.key);
          if (![1, 2, 3].includes(Number(advisorMonth))) return null;

          const relationshipAttribution = resolvePartnerQuarterlyRelationshipAttribution({
            advisor,
            evidence,
            requestedConcept: 'connection-bonus',
          });

          const result = gatePartnerConnectionBonusCalculation({
            rulePack: activeRulePack,
            onboardingEvidence: advisor.onboardingEvidence === true || advisor.connectedAdvisorEvidence === true || advisor.connectionEvidence === true || Number(advisorMonth) === 1,
            advisorMonth,
            monthlyPolicies: monthFact?.partialMonthlyPolicies ?? monthFact?.monthlyPolicies ?? monthFact?.validPolicyCount ?? monthFact?.policyCount ?? monthFact?.paidPolicyCount,
            paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence === true,
            connectorActiveAtMonthClose: partner.active === true,
            connectedAdvisorActiveAtMonthClose: advisor.activeAtQuarterClose === true,
          });

          return applyPartnerOwnershipSourceTruthToQuarterlyPart({
            part: {
              ...result,
              metadata: {
                ...result.metadata,
                advisorId: advisor.advisorId || advisor.name || null,
                month: month.key,
                advisorMonth,
              },
            },
            partner,
            evidence,
            advisor,
            requestedConcept: 'connection-bonus',
            relationshipAttribution,
          });
        })
        .filter(Boolean);
    }

    if (![1, 2, 3].includes(Number(advisor.advisorMonth))) return [];

    const relationshipAttribution = resolvePartnerQuarterlyRelationshipAttribution({
      advisor,
      evidence,
      requestedConcept: 'connection-bonus',
    });

    const result = gatePartnerConnectionBonusCalculation({
      rulePack: activeRulePack,
      onboardingEvidence: advisor.onboardingEvidence === true,
      advisorMonth: advisor.advisorMonth,
      monthlyPolicies: advisor.monthlyPolicies,
      quarterPolicyTotal: advisor.quarterPolicyTotal,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence === true,
      connectorActiveAtMonthClose: partner.active === true,
      connectedAdvisorActiveAtMonthClose: advisor.activeAtMonthClose === true,
    });

    return [applyPartnerOwnershipSourceTruthToQuarterlyPart({
      part: {
        ...result,
        metadata: {
          ...result.metadata,
          advisorId: advisor.advisorId || advisor.name || null,
          advisorMonth: advisor.advisorMonth,
        },
      },
      partner,
      evidence,
      advisor,
      requestedConcept: 'connection-bonus',
      relationshipAttribution,
    })];
  });
  const connectionAmount = sumNumbers(connectionParts.map((part) => part.candidateAmount));
  const connection = {
    conceptKey: 'connection-bonus',
    status: hasNumber(connectionAmount) ? 'calculated_candidate' : 'blocked_by_missing_evidence',
    candidateAmount: connectionAmount,
    payoutTruth: false,
    blockedReasons: connectionParts.flatMap((part) => part.blockedReasons || []),
    missingInputs: connectionParts.flatMap((part) => part.missingInputs || []),
    warnings: connectionParts.flatMap((part) => part.warnings || []),
    metadata: { parts: connectionParts },
  };

  const developmentParts = advisors.flatMap((advisor) => {
    if ((advisor.connectionDate || advisor.contestDate) && advisor.metadata?.normalizedMonthlyFacts && periodMonths.length > 0) {
      return periodMonths
        .map((month) => {
          const advisorMonth = careerMonthAt(advisor.connectionDate || advisor.contestDate, month.date);
          const monthFact = advisor.metadata.normalizedMonthlyFacts.find((fact) => fact.month === month.key);
          if (Number(advisorMonth) < 4 || Number(advisorMonth) > 15) return null;

          const relationshipAttribution = resolvePartnerQuarterlyRelationshipAttribution({
            advisor,
            evidence,
            requestedConcept: 'development-bonus',
          });

          const result = gatePartnerDevelopmentBonusCalculation({
            rulePack: activeRulePack,
            advisorMonth,
            monthlyPolicies: monthFact?.partialMonthlyPolicies ?? monthFact?.monthlyPolicies ?? monthFact?.validPolicyCount ?? monthFact?.policyCount ?? monthFact?.paidPolicyCount,
            paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence === true,
            developerCount: resolvePartnerQuarterlyDeveloperCount({ advisor, relationshipAttribution }),
            developerEligibilityEvidence: advisor.developerEligibilityEvidence !== false,
          });

          return applyPartnerOwnershipSourceTruthToQuarterlyPart({
            part: {
              ...result,
              metadata: {
                ...result.metadata,
                advisorId: advisor.advisorId || advisor.name || null,
                month: month.key,
                advisorMonth,
              },
            },
            partner,
            evidence,
            advisor,
            requestedConcept: 'development-bonus',
            relationshipAttribution,
          });
        })
        .filter(Boolean);
    }

    if (Number(advisor.advisorMonth) < 4 || Number(advisor.advisorMonth) > 15) return [];

    const relationshipAttribution = resolvePartnerQuarterlyRelationshipAttribution({
      advisor,
      evidence,
      requestedConcept: 'development-bonus',
    });

    const result = gatePartnerDevelopmentBonusCalculation({
      rulePack: activeRulePack,
      advisorMonth: advisor.advisorMonth,
      monthlyPolicies: advisor.monthlyPolicies,
      quarterPolicyTotal: advisor.quarterPolicyTotal,
      paidAppliedPolicyEvidence: advisor.paidAppliedPolicyEvidence === true,
      developerCount: resolvePartnerQuarterlyDeveloperCount({ advisor, relationshipAttribution }),
      developerEligibilityEvidence: advisor.developerEligibilityEvidence === true,
    });

    return [applyPartnerOwnershipSourceTruthToQuarterlyPart({
      part: {
        ...result,
        metadata: {
          ...result.metadata,
          advisorId: advisor.advisorId || advisor.name || null,
          advisorMonth: advisor.advisorMonth,
        },
      },
      partner,
      evidence,
      advisor,
      requestedConcept: 'development-bonus',
      relationshipAttribution,
    })];
  });
  const developmentAmount = sumNumbers(developmentParts.map((part) => part.candidateAmount));
  const development = {
    conceptKey: 'development-bonus',
    status: hasNumber(developmentAmount) ? 'calculated_candidate' : 'blocked_by_missing_evidence',
    candidateAmount: developmentAmount,
    payoutTruth: false,
    blockedReasons: developmentParts.flatMap((part) => part.blockedReasons || []),
    missingInputs: developmentParts.flatMap((part) => part.missingInputs || []),
    warnings: developmentParts.flatMap((part) => part.warnings || []),
    metadata: { parts: developmentParts },
  };

  const inferredTrainingWinnerCount = inferTrainingWinnerCountLastSixMonths({
    advisors,
    evidence,
    periodEndDate: periodMonths[periodMonths.length - 1]?.date,
  });
  const supportActualByMonth = evidence.supportAccumulatedCommissionActualByMonth || {};
    const supportNumberOrNull = (value) => {
      if (value === null || value === undefined || value === '') return null;
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : null;
    };

    const resolveSupportActualForMonth = (monthKey) => {
      if (Array.isArray(supportActualByMonth)) {
        const row = supportActualByMonth.find((item) => (
          item?.month === monthKey ||
          item?.id === monthKey ||
          item?.key === monthKey
        ));

        if (!row) return evidence.accumulatedCommissionActualLifeIndividualAndGmmi;

        return supportNumberOrNull(row.actualAmount) ??
          supportNumberOrNull(row.accumulatedCommissionActualLifeIndividualAndGmmi) ??
          supportNumberOrNull(row.amount) ??
          supportNumberOrNull(row.value) ??
          evidence.accumulatedCommissionActualLifeIndividualAndGmmi;
      }

      const value = supportActualByMonth?.[monthKey];

      if (value && typeof value === 'object') {
        return supportNumberOrNull(value.actualAmount) ??
          supportNumberOrNull(value.accumulatedCommissionActualLifeIndividualAndGmmi) ??
          supportNumberOrNull(value.amount) ??
          supportNumberOrNull(value.value) ??
          evidence.accumulatedCommissionActualLifeIndividualAndGmmi;
      }

      return supportNumberOrNull(value) ?? evidence.accumulatedCommissionActualLifeIndividualAndGmmi;
    };
  const supportParts = periodMonths.length > 0 && partner.connectionDate
    ? periodMonths.map((month) => {
      const partnerCareerMonth = careerMonthAt(partner.connectionDate, month.date);
      const actual = resolveSupportActualForMonth(month.key);
      return {
        month: month.key,
        partnerCareerMonth,
        result: calculatePartnerFixedSupportCandidate({
          rulePack: activeRulePack,
          partnerCareerMonth,
          accumulatedCommissionActualLifeIndividualAndGmmi: actual,
          accumulatedCommissionGoalsEvidence: hasNumber(actual),
          trainingWinnerActualCountLastSixMonths: inferredTrainingWinnerCount,
          partnerLifecycleStatus: partner.active === true ? 'partner_active' : 'inactive',
          supportTableEvidenceRequired: false,
        }),
      };
    })
    : null;
  const fixedSupportSingle = calculatePartnerFixedSupportCandidate({
    rulePack: activeRulePack,
    partnerCareerMonth: partner.partnerCareerMonth,
    accumulatedCommissionActualLifeIndividualAndGmmi: evidence.accumulatedCommissionActualLifeIndividualAndGmmi,
    accumulatedCommissionGoalsEvidence: hasNumber(evidence.accumulatedCommissionActualLifeIndividualAndGmmi),
    trainingWinnerActualCountLastSixMonths: inferredTrainingWinnerCount,
    partnerLifecycleStatus: partner.active === true ? 'partner_active' : 'inactive',
    supportTableEvidenceRequired: false,
  });
  const fixedSupport = supportParts
    ? {
      conceptKey: 'fixed-support',
      status: supportParts.some((part) => (part.result.blockedReasons || []).length > 0 || (part.result.missingInputs || []).length > 0)
        ? 'partial_candidate_with_blocked_months'
        : 'calculated_candidate',
      candidateAmount: sumNumbers(supportParts.map((part) => calculatedAmount(part.result))),
      payoutTruth: false,
      blockedReasons: supportParts.flatMap((part) => part.result.blockedReasons || []),
      missingInputs: supportParts.flatMap((part) => part.result.missingInputs || []),
      warnings: supportParts.flatMap((part) => part.result.warnings || []),
      metadata: {
        parts: supportParts,
      },
    }
    : fixedSupportSingle;

  const concepts = {
    productivityBase,
    productivityMultiplier,
    production,
    activity,
    development,
    connection,
    fixedSupport,
  };
  const requestedConceptsResult = calculateRequestedConceptsSubtotal({ requestedConcepts, concepts });
  const requestedPaymentSchedule = buildRequestedPaymentSchedule({
    concepts,
    requestedConceptsResult,
    period,
    periodMonths,
  });
  const blockedConcepts = collectBlockedConcepts(concepts);
  const totalQuarterCandidateExcludingBlocked = sumNumbers(Object.entries(concepts)
    .filter(([conceptKey]) => isPayablePartnerConceptKey(conceptKey))
    .map(([, concept]) => calculatedAmount(concept)));
  const paymentSchedule = buildQuarterlyPaymentSchedule({ concepts, rulePack: activeRulePack });
  const allMissingInputs = [
    ...missingInputs,
    ...Object.values(concepts).flatMap((concept) => concept.missingInputs || []),
  ];
  const allWarnings = [
    ...warnings,
    ...(requestedConceptsResult.requestedConceptsWarnings || []),
    ...Object.values(concepts).flatMap((concept) => concept.warnings || []),
    ...paymentSchedule.warnings,
  ];

  return {
    status: blockedConcepts.length > 0 ? 'partial_candidate_with_blocked_concepts' : 'calculated_candidate',
    payoutTruth: false,
    rulePackId: activeRulePack.rulePackId,
    sourceRulePackFile: sourceRulePackFileName(activeRulePack),
    partner,
    period,
    qualificationSummary: {
      qualifiedAdvisorCount: qualifiedAdvisors.length,
      nonQualifiedActiveAdvisorCount: nonQualifiedActiveAdvisors.length,
      advisors: qualifiedAdvisorResults,
      normalizedAdvisors: advisors,
    },
    trainingWinnerInference,
    concepts,
    paymentSchedule,
    requestedConcepts: requestedConceptsResult.requestedConcepts,
    requestedConceptsApplied: requestedConceptsResult.requestedConceptsApplied,
    requestedConceptsMissing: requestedConceptsResult.requestedConceptsMissing,
    requestedConceptsWarnings: requestedConceptsResult.requestedConceptsWarnings,
    subtotalRequestedConceptsCandidate: requestedConceptsResult.subtotalRequestedConceptsCandidate,
    requestedPaymentSchedule,
    totals: {
      totalQuarterCandidateExcludingBlocked,
      monthlyAverageCandidateExcludingBlocked: hasNumber(totalQuarterCandidateExcludingBlocked) ? totalQuarterCandidateExcludingBlocked / 3 : null,
      totalQuarterBlockedReasons: blockedConcepts.flatMap((concept) => concept.blockedReasons),
      excludedConcepts: blockedConcepts.map((concept) => concept.conceptKey),
      requestedConcepts: requestedConceptsResult.requestedConcepts,
      requestedConceptsApplied: requestedConceptsResult.requestedConceptsApplied,
      requestedConceptsMissing: requestedConceptsResult.requestedConceptsMissing,
      requestedConceptsWarnings: requestedConceptsResult.requestedConceptsWarnings,
      subtotalRequestedConceptsCandidate: requestedConceptsResult.subtotalRequestedConceptsCandidate,
    },
    warnings: [...new Set(allWarnings)],
    missingInputs: [...new Set(allMissingInputs)],
  };
}
