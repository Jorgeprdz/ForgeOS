import {
  ADVISOR_ECONOMIC_OUTPUT_STATUSES,
} from './advisor-economic-output.js';

import {
  loadPartner2026RulePack,
} from './partner-2026-rule-pack-loader.js';

const DEFAULT_PARTNER_2026_RULE_PACK = loadPartner2026RulePack();

export const DEFAULT_PARTNER_2026_QUALIFIED_COMMISSION_THRESHOLD = DEFAULT_PARTNER_2026_RULE_PACK
  .globalRules
  .advisorQualifiedDefinition
  .requires
  .averageMonthlyInitialCommissionsGreaterThan;

export const QUALIFIED_ADVISOR_ECONOMIC_STATUSES = Object.freeze({
  QUALIFIED_CONFIRMED: 'qualified_confirmed',
  NOT_QUALIFIED_CONFIRMED: 'not_qualified_confirmed',
  UNKNOWN: 'unknown',
  BLOCKED_BY_MISSING_COMMISSION_EVIDENCE: 'blocked_by_missing_commission_evidence',
  BLOCKED_BY_MISSING_LIMRA: 'blocked_by_missing_LIMRA',
  BLOCKED_BY_MISSING_IGC: 'blocked_by_missing_IGC',
  BLOCKED_BY_MISSING_LIFECYCLE: 'blocked_by_missing_lifecycle',
  BLOCKED_BY_PRECONTRACT_STATUS: 'blocked_by_precontract_status',
  BLOCKED_BY_MISSING_THRESHOLD: 'blocked_by_missing_threshold',
});

const PRECONTRACT_STATUSES = new Set([
  'precontract',
  'precontract_signed',
  'pending_activation',
]);

function hasNumber(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

function blocked(status, reasons, warnings = []) {
  return {
    status,
    qualified: false,
    averageMonthlyInitialCommissions: null,
    threshold: null,
    reasons,
    warnings,
    unknownIsZero: false,
  };
}

export function evaluateQualifiedAdvisorEconomicStatus({
  advisorId = null,
  averageMonthlyInitialCommissions = null,
  threshold = null,
  LIMRA = null,
  IGC = null,
  requireLIMRA = true,
  requireIGC = true,
  lifecycleStatus = 'unknown',
  lifecycleGateAllowed = false,
  advisorStage = null,
  careerMonth = null,
  economicOutputStatus = ADVISOR_ECONOMIC_OUTPUT_STATUSES.UNKNOWN,
} = {}) {
  if (!hasNumber(threshold)) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_THRESHOLD,
        ['threshold_required_no_silent_default']
      ),
      advisorId,
    };
  }

  if (!lifecycleStatus || lifecycleStatus === 'unknown' || lifecycleGateAllowed !== true) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_LIFECYCLE,
        ['official_lifecycle_gate_required']
      ),
      advisorId,
      threshold,
    };
  }

  if (PRECONTRACT_STATUSES.has(lifecycleStatus)) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_PRECONTRACT_STATUS,
        ['precontract_cannot_be_qualified_for_official_partner_compensation']
      ),
      advisorId,
      threshold,
    };
  }

  if (economicOutputStatus === ADVISOR_ECONOMIC_OUTPUT_STATUSES.CANDIDATE) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_COMMISSION_EVIDENCE,
        ['candidate_economic_output_not_eligible']
      ),
      advisorId,
      threshold,
    };
  }

  if (!hasNumber(averageMonthlyInitialCommissions)) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_COMMISSION_EVIDENCE,
        ['average_monthly_initial_commissions_required']
      ),
      advisorId,
      threshold,
    };
  }

  if (requireLIMRA && !hasNumber(LIMRA)) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_LIMRA,
        ['LIMRA_required']
      ),
      advisorId,
      threshold,
    };
  }

  if (requireIGC && !hasNumber(IGC)) {
    return {
      ...blocked(
        QUALIFIED_ADVISOR_ECONOMIC_STATUSES.BLOCKED_BY_MISSING_IGC,
        ['IGC_required']
      ),
      advisorId,
      threshold,
    };
  }

  const qualified = Number(averageMonthlyInitialCommissions) > Number(threshold);

  return {
    advisorId,
    status: qualified
      ? QUALIFIED_ADVISOR_ECONOMIC_STATUSES.QUALIFIED_CONFIRMED
      : QUALIFIED_ADVISOR_ECONOMIC_STATUSES.NOT_QUALIFIED_CONFIRMED,
    qualified,
    averageMonthlyInitialCommissions: Number(averageMonthlyInitialCommissions),
    threshold: Number(threshold),
    LIMRA: hasNumber(LIMRA) ? Number(LIMRA) : null,
    IGC: hasNumber(IGC) ? Number(IGC) : null,
    lifecycleStatus,
    advisorStage,
    careerMonth,
    economicOutputStatus,
    reasons: [],
    warnings: [],
    unknownIsZero: false,
  };
}
