import {
  ADVISOR_LIFECYCLE_STATUSES,
  isPrecontractStatus,
  normalizeLifecycleStatus,
} from './advisor-lifecycle-status.js';

import {
  ADVISOR_CAREER_CLOCK_STATES,
} from './advisor-career-clock.js';

export function mapLifecycleToCompensationGate({
  lifecycleStatus = ADVISOR_LIFECYCLE_STATUSES.UNKNOWN,
  careerClockResult = null,
  explicitPrecontractBonusRule = false,
  managerConfirmed = false,
} = {}) {
  const status = normalizeLifecycleStatus(lifecycleStatus);

  if (status === ADVISOR_LIFECYCLE_STATUSES.UNKNOWN) {
    return {
      allowed: false,
      compensationStage: null,
      reason: 'unknown_lifecycle_status_blocks_compensation',
      blockedReasons: ['unknown_lifecycle_status'],
      canTrackProductionCandidate: false,
      canCalculateOfficialBonus: false,
      canReleaseHeldCommission: false,
      warnings: ['Unknown lifecycle does not default to active.'],
    };
  }

  if (isPrecontractStatus(status)) {
    return {
      allowed: explicitPrecontractBonusRule,
      compensationStage: explicitPrecontractBonusRule ? 'precontract_explicit_rule' : null,
      reason: explicitPrecontractBonusRule
        ? 'explicit_precontract_bonus_rule_required'
        : 'precontract_can_track_candidate_but_not_official_bonus',
      blockedReasons: explicitPrecontractBonusRule ? [] : ['not_connected_active'],
      canTrackProductionCandidate: true,
      canCalculateOfficialBonus: false,
      canReleaseHeldCommission: false,
      warnings: [
        'Precontract activity and production are real but not payable by default.',
        managerConfirmed ? 'Manager confirmation alone is not payout truth.' : null,
      ].filter(Boolean),
    };
  }

  if (!careerClockResult || careerClockResult.state !== ADVISOR_CAREER_CLOCK_STATES.RESOLVED) {
    return {
      allowed: false,
      compensationStage: null,
      reason: 'missing_connection_date_blocks_official_bonus',
      blockedReasons: [careerClockResult?.reason || 'missing_career_clock'],
      canTrackProductionCandidate: true,
      canCalculateOfficialBonus: false,
      canReleaseHeldCommission: false,
      warnings: ['Official bonus eligibility requires connected_active plus resolved career clock.'],
    };
  }

  return {
    allowed: true,
    compensationStage: careerClockResult.stage,
    reason: 'connected_active_can_enter_official_compensation',
    blockedReasons: [],
    canTrackProductionCandidate: true,
    canCalculateOfficialBonus: true,
    canReleaseHeldCommission: true,
    warnings: [],
  };
}
