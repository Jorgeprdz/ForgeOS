import {
  ADVISOR_LIFECYCLE_STATUSES,
  isPrecontractStatus,
  normalizeLifecycleStatus,
} from './advisor-lifecycle-status.js';

import {
  ADVISOR_CAREER_CLOCK_STATES,
} from './advisor-career-clock.js';

function blocked(reason, blockedReasons = [reason], warnings = []) {
  return {
    allowed: false,
    stage: null,
    reason,
    blockedReasons,
    warnings,
  };
}

export function evaluateAdvisorStageGate({
  lifecycleStatus = ADVISOR_LIFECYCLE_STATUSES.UNKNOWN,
  careerClockResult = null,
  advisorGroup = null,
  definitiveKeyStatus = null,
  legalEntityFlag = false,
  activeStatus = null,
} = {}) {
  const status = normalizeLifecycleStatus(lifecycleStatus);

  if (status === ADVISOR_LIFECYCLE_STATUSES.UNKNOWN) {
    return blocked('unknown_lifecycle_status_blocks_official_stage');
  }

  if (isPrecontractStatus(status)) {
    return blocked('precontract_cannot_enter_official_bonus_eligibility');
  }

  if (legalEntityFlag === true) {
    return blocked('legal_entity_blocks_bonus_eligibility');
  }

  if (definitiveKeyStatus && definitiveKeyStatus !== 'active' && definitiveKeyStatus !== 'definitive') {
    return blocked('missing_definitive_key_blocks_bonus_eligibility');
  }

  if (activeStatus && activeStatus !== 'active') {
    return blocked('inactive_advisor_blocks_bonus_eligibility');
  }

  if (!careerClockResult || careerClockResult.state !== ADVISOR_CAREER_CLOCK_STATES.RESOLVED) {
    return blocked('missing_career_date_blocks_bonus_eligibility', [
      careerClockResult?.reason || 'missing_career_clock',
    ]);
  }

  return {
    allowed: true,
    stage: careerClockResult.stage,
    reason: 'connected_active_with_resolved_career_clock',
    blockedReasons: [],
    warnings: advisorGroup ? [] : ['advisor_group_missing_for_some_bonus_rule_families'],
  };
}
