import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
} from './advisor-economic-output.js';

import {
  QUALIFIED_ADVISOR_ECONOMIC_STATUSES,
} from './qualified-advisor-economic-status.js';

import {
  PARTNER_RULE_PACK_READINESS,
  createPartnerRulePackAssessment,
} from './rule-pack-readiness.js';

export const PARTNER_PRODUCTIVITY_BASE_CONCEPT_KEY = 'productivity-base';
export const PARTNER_PRODUCTIVITY_BASE_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_6_PRODUCTIVITY_BASE';

export const PARTNER_ADVISOR_CLASSES = Object.freeze({
  CC: 'CC',
  ONE_C: '1C',
  TWO_C: '2C',
  THREE_C: '3C',
  CONSOLIDATED: 'CONSOLIDADOS',
});

export const PRODUCTIVITY_BASE_ROWS = Object.freeze([
  Object.freeze({ rangeKey: '9000_18000', min: 9000, max: 18000, percentages: Object.freeze({ CC: 0.25, '1C': 0.30, '2C': 0.135, '3C': 0.135, CONSOLIDADOS: 0.135 }) }),
  Object.freeze({ rangeKey: '18001_30000', min: 18001, max: 30000, percentages: Object.freeze({ CC: 0.30, '1C': 0.35, '2C': 0.16, '3C': 0.16, CONSOLIDADOS: 0.16 }) }),
  Object.freeze({ rangeKey: '30001_plus', min: 30001, max: null, percentages: Object.freeze({ CC: 0.35, '1C': 0.40, '2C': 0.185, '3C': 0.185, CONSOLIDADOS: 0.185 }) }),
]);

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function normalizeAdvisorClass(advisorClass = null) {
  const value = String(advisorClass || '').trim().toUpperCase();
  if (value === 'CC') return PARTNER_ADVISOR_CLASSES.CC;
  if (value === '1C') return PARTNER_ADVISOR_CLASSES.ONE_C;
  if (value === '2C') return PARTNER_ADVISOR_CLASSES.TWO_C;
  if (value === '3C') return PARTNER_ADVISOR_CLASSES.THREE_C;
  if (value === 'CONSOLIDADO' || value === 'CONSOLIDADOS') return PARTNER_ADVISOR_CLASSES.CONSOLIDATED;
  return null;
}

function findRange(averageMonthlyInitialCommissions) {
  if (!hasNumber(averageMonthlyInitialCommissions)) return null;
  const value = Number(averageMonthlyInitialCommissions);
  return PRODUCTIVITY_BASE_ROWS.find((row) => value >= row.min && (row.max === null || value <= row.max)) || null;
}

function lifecycleAllowed(lifecycleGate) {
  if (lifecycleGate === true) return true;
  return lifecycleGate?.allowed === true || lifecycleGate?.lifecycleOfficial === true;
}

function hasConfirmedOutput(output = {}) {
  return [
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAID_APPLIED_CONFIRMED,
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.CARRIER_CALCULATED,
    ADVISOR_ECONOMIC_OUTPUT_STATUSES.PAYOUT_CONFIRMED,
  ].includes(output.economicStatus);
}

export function assessPartnerProductivityBase({
  advisorEconomicOutputs = [],
  qualifiedAdvisorEconomicStatuses = [],
  averageMonthlyInitialCommissions = null,
  advisorClass = null,
  advisorCareerMonth = null,
  advisorLIMRA = null,
  advisorIGC = null,
  lifecycleGate = null,
  period = null,
} = {}) {
  const requiredInputs = [
    'advisorEconomicOutputs',
    'qualifiedAdvisorEconomicStatuses',
    'averageMonthlyInitialCommissions',
    'advisorClass',
    'lifecycleGate',
  ];
  const missingInputs = [];
  const blockedReasons = [];
  const warnings = [];

  const confirmedOutput = advisorEconomicOutputs.find(hasConfirmedOutput);
  const activityOnly = advisorEconomicOutputs.some((output) => output.sourceType === 'activity' || output.rawActivityOnly === true);
  const candidateOutput = advisorEconomicOutputs.some((output) => output.economicStatus === ADVISOR_ECONOMIC_OUTPUT_STATUSES.CANDIDATE);
  const qualifiedStatus = qualifiedAdvisorEconomicStatuses.find((status) => (
    status.status === QUALIFIED_ADVISOR_ECONOMIC_STATUSES.QUALIFIED_CONFIRMED
  ));
  const normalizedClass = normalizeAdvisorClass(advisorClass);
  const row = findRange(averageMonthlyInitialCommissions);

  if (!confirmedOutput) blockedReasons.push('missing_confirmed_advisor_economic_output');
  if (!qualifiedStatus) blockedReasons.push('missing_qualified_advisor_economic_status');
  if (activityOnly) blockedReasons.push('raw_activity_cannot_feed_productivity_base');
  if (candidateOutput) blockedReasons.push('candidate_output_not_allowed');
  if (!lifecycleAllowed(lifecycleGate)) blockedReasons.push('blocked_by_missing_lifecycle');
  if (!normalizedClass) blockedReasons.push('unknown_advisor_class');
  if (!row) blockedReasons.push('unknown_commission_range');
  if (!hasNumber(averageMonthlyInitialCommissions)) missingInputs.push('averageMonthlyInitialCommissions');

  const percentageCandidate = row && normalizedClass ? row.percentages[normalizedClass] : null;

  return createPartnerRulePackAssessment({
    conceptKey: PARTNER_PRODUCTIVITY_BASE_CONCEPT_KEY,
    readiness: blockedReasons.length > 0 || missingInputs.length > 0
      ? PARTNER_RULE_PACK_READINESS.BLOCKED_BY_MISSING_ECONOMIC_INPUT
      : PARTNER_RULE_PACK_READINESS.READY_FOR_CONTRACT,
    calculationAllowed: true,
    requiredInputs,
    missingInputs,
    blockedReasons,
    warnings,
    sourceNotes: ['SMNYL Partner Compensation 2026 page 6.', 'Uses average monthly initial commissions; renewal commissions are not averaged as initial.'],
    confidence: blockedReasons.length > 0 ? 'blocked' : 'high',
    tableVersion: PARTNER_PRODUCTIVITY_BASE_TABLE_VERSION,
    eligibleRows: row ? [row.rangeKey] : [],
    percentageCandidate,
    metadata: {
      advisorClass: normalizedClass,
      advisorCareerMonth,
      advisorLIMRA,
      advisorIGC,
      period,
    },
  });
}
