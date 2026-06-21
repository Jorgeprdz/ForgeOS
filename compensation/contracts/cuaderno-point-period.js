export const CUADERNO_POINT_STATES = Object.freeze({
  POINT_PERIOD_RESOLVED: 'point_period_resolved',
  PENDING_APPLIED_DATE: 'pending_applied_date',
  UNKNOWN: 'unknown',
  BLOCKED: 'blocked',
});

function isValidDate(value) {
  if (!value) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime());
}

function monthPeriod(value) {
  return String(value).slice(0, 7);
}

export function resolveCuadernoPointPeriod({
  issueDate = null,
  paidDate = null,
  appliedDate = null,
  paidAppliedDate = null,
  forecast = false,
} = {}) {
  if (forecast) {
    return {
      state: CUADERNO_POINT_STATES.BLOCKED,
      pointCreated: false,
      pointPeriod: null,
      reason: 'forecast_cannot_create_point',
      forecastCreatesPayoutTruth: false,
    };
  }

  if (paidAppliedDate) {
    if (!isValidDate(paidAppliedDate)) {
      return {
        state: CUADERNO_POINT_STATES.BLOCKED,
        pointCreated: false,
        pointPeriod: null,
        reason: 'invalid_paid_applied_date',
      };
    }

    return {
      state: CUADERNO_POINT_STATES.POINT_PERIOD_RESOLVED,
      pointCreated: true,
      pointPeriod: monthPeriod(paidAppliedDate),
      issueDateDeterminesPointMonth: false,
      reason: 'paid_applied_date_creates_point_period',
    };
  }

  if (paidDate && !appliedDate) {
    return {
      state: CUADERNO_POINT_STATES.PENDING_APPLIED_DATE,
      pointCreated: false,
      pointPeriod: null,
      issueDateDeterminesPointMonth: false,
      reason: 'paid_but_not_applied',
      blockedIsZero: false,
    };
  }

  if (issueDate) {
    return {
      state: CUADERNO_POINT_STATES.UNKNOWN,
      pointCreated: false,
      pointPeriod: null,
      issueDateDeterminesPointMonth: false,
      reason: 'issue_date_alone_creates_no_point',
      unknownIsZero: false,
    };
  }

  return {
    state: CUADERNO_POINT_STATES.UNKNOWN,
    pointCreated: false,
    pointPeriod: null,
    reason: 'unknown_paid_applied_date',
    unknownIsZero: false,
  };
}
