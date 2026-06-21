export const PRECONTRACT_ECONOMIC_STATUSES = Object.freeze({
  NO_ACTIVITY: 'no_activity',
  ACTIVITY_LOGGED: 'activity_logged',
  SALE_ORIGINATED: 'sale_originated',
  POLICY_SUBMITTED: 'policy_submitted',
  POLICY_ISSUED: 'policy_issued',
  PAYMENT_APPLIED: 'payment_applied',
  COMMISSION_ESTIMATED: 'commission_estimated',
  COMMISSION_ON_HOLD: 'commission_on_hold',
  COMMISSION_RELEASED: 'commission_released',
  COMMISSION_FORFEITED: 'commission_forfeited',
  UNKNOWN: 'unknown',
});

const KNOWN_STATUSES = Object.freeze(Object.values(PRECONTRACT_ECONOMIC_STATUSES));

const PAYABLE_STATUSES = new Set([
  PRECONTRACT_ECONOMIC_STATUSES.COMMISSION_RELEASED,
]);

const REQUIRES_ACTIVATION = new Set([
  PRECONTRACT_ECONOMIC_STATUSES.ACTIVITY_LOGGED,
  PRECONTRACT_ECONOMIC_STATUSES.SALE_ORIGINATED,
  PRECONTRACT_ECONOMIC_STATUSES.POLICY_SUBMITTED,
  PRECONTRACT_ECONOMIC_STATUSES.POLICY_ISSUED,
  PRECONTRACT_ECONOMIC_STATUSES.PAYMENT_APPLIED,
  PRECONTRACT_ECONOMIC_STATUSES.COMMISSION_ESTIMATED,
  PRECONTRACT_ECONOMIC_STATUSES.COMMISSION_ON_HOLD,
]);

export function normalizePrecontractEconomicStatus(status = PRECONTRACT_ECONOMIC_STATUSES.UNKNOWN) {
  return KNOWN_STATUSES.includes(status)
    ? status
    : PRECONTRACT_ECONOMIC_STATUSES.UNKNOWN;
}

export function isPrecontractEconomicStatus(status) {
  return KNOWN_STATUSES.includes(status);
}

export function isPayablePrecontractStatus(status) {
  return PAYABLE_STATUSES.has(normalizePrecontractEconomicStatus(status));
}

export function requiresActivationBeforePayout(status) {
  return REQUIRES_ACTIVATION.has(normalizePrecontractEconomicStatus(status));
}
