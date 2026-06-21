export const CAREER_MONTH_STATES = Object.freeze({
  RESOLVED: 'resolved',
  UNKNOWN: 'unknown',
  BLOCKED: 'blocked',
});

export const CAREER_STAGE_FAMILIES = Object.freeze({
  PRECONTRACT: 'precontract',
  DEVELOPMENT: 'development',
  NEW_PROFESSIONAL_OR_PROFESSIONAL: 'new_professional_or_professional',
  UNKNOWN: 'unknown',
  BLOCKED: 'blocked',
});

function isBlank(value) {
  return value === null || value === undefined || value === '';
}

function parseDate(value) {
  if (isBlank(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function stageFamilyForMonth(careerMonth) {
  if (careerMonth >= 1 && careerMonth <= 12) return CAREER_STAGE_FAMILIES.DEVELOPMENT;
  if (careerMonth >= 13) return CAREER_STAGE_FAMILIES.NEW_PROFESSIONAL_OR_PROFESSIONAL;
  return CAREER_STAGE_FAMILIES.UNKNOWN;
}

export function resolveCareerMonth({
  status = null,
  careerStartDate = null,
  asOfDate = new Date().toISOString().slice(0, 10),
} = {}) {
  if (status === 'precontract') {
    return {
      state: CAREER_MONTH_STATES.RESOLVED,
      careerMonth: 1,
      stageFamily: CAREER_STAGE_FAMILIES.PRECONTRACT,
      reason: 'precontract_is_month_1',
      unknownIsZero: false,
    };
  }

  if (isBlank(careerStartDate)) {
    return {
      state: CAREER_MONTH_STATES.UNKNOWN,
      careerMonth: null,
      stageFamily: CAREER_STAGE_FAMILIES.UNKNOWN,
      reason: 'missing_career_start_date',
      unknownIsZero: false,
    };
  }

  const start = parseDate(careerStartDate);
  const asOf = parseDate(asOfDate);

  if (!start || !asOf || asOf < start) {
    return {
      state: CAREER_MONTH_STATES.BLOCKED,
      careerMonth: null,
      stageFamily: CAREER_STAGE_FAMILIES.BLOCKED,
      reason: 'invalid_career_date',
      blockedIsZero: false,
    };
  }

  const careerMonth =
    ((asOf.getFullYear() - start.getFullYear()) * 12)
    + (asOf.getMonth() - start.getMonth())
    + 1;

  return {
    state: CAREER_MONTH_STATES.RESOLVED,
    careerMonth,
    stageFamily: stageFamilyForMonth(careerMonth),
    reason: 'career_month_resolved',
    unknownIsZero: false,
  };
}
