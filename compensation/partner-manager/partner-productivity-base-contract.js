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

import {
  getProductivityBaseRate,
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

export const PARTNER_PRODUCTIVITY_BASE_CONCEPT_KEY = 'productivity-base';
export const PARTNER_PRODUCTIVITY_BASE_TABLE_VERSION = 'SMNYL_PARTNER_2026_PAGE_6_PRODUCTIVITY_BASE';

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
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
  rulePack = null,
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
  const activeRulePack = rulePack || loadPartner2026RulePack();
  const jsonRateResult = getProductivityBaseRate(activeRulePack, {
    averageMonthlyInitialCommissions,
    partnerClass: advisorClass,
  });
  const row = jsonRateResult.band;

  if (!confirmedOutput) blockedReasons.push('missing_confirmed_advisor_economic_output');
  if (!qualifiedStatus) blockedReasons.push('missing_qualified_advisor_economic_status');
  if (activityOnly) blockedReasons.push('raw_activity_cannot_feed_productivity_base');
  if (candidateOutput) blockedReasons.push('candidate_output_not_allowed');
  if (!lifecycleAllowed(lifecycleGate)) blockedReasons.push('blocked_by_missing_lifecycle');
  blockedReasons.push(...jsonRateResult.blockedReasons);
  missingInputs.push(...jsonRateResult.missingInputs);
  if (!hasNumber(averageMonthlyInitialCommissions)) missingInputs.push('averageMonthlyInitialCommissions');

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
    percentageCandidate: jsonRateResult.rate,
    metadata: {
      rulePackId: activeRulePack?.rulePackId || null,
      advisorClass: jsonRateResult.partnerClass,
      advisorCareerMonth,
      advisorLIMRA,
      advisorIGC,
      period,
    },
  });
}
