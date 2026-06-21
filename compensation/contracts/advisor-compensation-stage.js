export const ADVISOR_COMPENSATION_STAGES = Object.freeze({
  PRECONTRACT_MONTH_1: 'precontract_month_1',
  DEVELOPMENT_MONTH_1_12: 'development_month_1_12',
  NEW_PROFESSIONAL_MONTH_13_PLUS: 'new_professional_month_13_plus',
  PARTNER_MANAGER: 'partner_manager',
  UNKNOWN: 'unknown',
  BLOCKED: 'blocked',
});

export function resolveAdvisorCompensationStage({
  role = null,
  careerMonth = null,
  careerMonthState = null,
} = {}) {
  if (role === 'partner' || role === 'manager') {
    return {
      stage: ADVISOR_COMPENSATION_STAGES.PARTNER_MANAGER,
      reason: 'partner_equals_manager_current_operation',
      stageCalculatesBonus: false,
      ruleFamilyOnly: true,
    };
  }

  if (careerMonthState === 'blocked') {
    return {
      stage: ADVISOR_COMPENSATION_STAGES.BLOCKED,
      reason: 'career_month_blocked',
      stageCalculatesBonus: false,
      ruleFamilyOnly: true,
    };
  }

  if (role === 'precontract') {
    return {
      stage: ADVISOR_COMPENSATION_STAGES.PRECONTRACT_MONTH_1,
      reason: 'precontract_is_month_1',
      stageCalculatesBonus: false,
      ruleFamilyOnly: true,
    };
  }

  if (careerMonth >= 1 && careerMonth <= 12) {
    return {
      stage: ADVISOR_COMPENSATION_STAGES.DEVELOPMENT_MONTH_1_12,
      reason: 'development_month_1_12',
      stageCalculatesBonus: false,
      ruleFamilyOnly: true,
    };
  }

  if (careerMonth >= 13) {
    return {
      stage: ADVISOR_COMPENSATION_STAGES.NEW_PROFESSIONAL_MONTH_13_PLUS,
      reason: 'new_professional_month_13_plus',
      stageCalculatesBonus: false,
      ruleFamilyOnly: true,
    };
  }

  return {
    stage: ADVISOR_COMPENSATION_STAGES.UNKNOWN,
    reason: 'unknown_stage_no_default_to_advisor',
    stageCalculatesBonus: false,
    ruleFamilyOnly: true,
    unknownDefaultsToAdvisor: false,
  };
}
