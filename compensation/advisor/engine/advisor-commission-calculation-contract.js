"use strict";

const COMMISSION_CALCULATION_CONTRACT_VERSION = "ADVISOR_COMMISSION_CALCULATION_001";

const COMMISSION_CALCULATION_STATUSES = Object.freeze({
  CALCULATED: "CALCULATED",
  BLOCKED: "BLOCKED",
  CONFLICTING: "CONFLICTING"
});

const COMMISSION_CALCULATION_TYPES = Object.freeze({
  LIFE_INITIAL: "LIFE_INITIAL",
  LIFE_RENEWAL: "LIFE_RENEWAL",
  GMM_INITIAL: "GMM_INITIAL",
  GMM_RENEWAL: "GMM_RENEWAL"
});

const COMMISSION_BASIS_STATES = Object.freeze({
  MATCHED_SCHEDULED_RECEIPT: "MATCHED_SCHEDULED_RECEIPT",
  PARTIAL_PAYMENT: "PARTIAL_PAYMENT",
  EXCESS_PAYMENT: "EXCESS_PAYMENT"
});

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function validateAdvisorCommissionCalculation(result) {
  const errors = [];
  if (!result || typeof result !== "object") {
    return Object.freeze({ valid: false, errors: Object.freeze(["calculation_missing"]) });
  }
  if (result.contractVersion !== COMMISSION_CALCULATION_CONTRACT_VERSION) {
    errors.push("calculation_contract_version_invalid");
  }
  if (!Object.values(COMMISSION_CALCULATION_STATUSES).includes(result.status)) {
    errors.push("calculation_status_invalid");
  }
  if (result.status === COMMISSION_CALCULATION_STATUSES.CALCULATED) {
    if (!Number.isFinite(result.amounts?.commissionAmount) || result.amounts.commissionAmount < 0) {
      errors.push("commission_amount_invalid");
    }
    if (!/^[a-f0-9]{64}$/.test(result.calculationDigest || "")) {
      errors.push("calculation_digest_invalid");
    }
  }
  if (result.safeguards?.payoutTruth !== false) errors.push("payout_truth_must_be_false");
  if (result.safeguards?.compensationEventWritten !== false) {
    errors.push("compensation_event_written_must_be_false");
  }
  if (result.safeguards?.externalMutationAuthorized !== false) {
    errors.push("external_mutation_must_be_false");
  }
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

module.exports = {
  COMMISSION_CALCULATION_CONTRACT_VERSION,
  COMMISSION_CALCULATION_STATUSES,
  COMMISSION_CALCULATION_TYPES,
  COMMISSION_BASIS_STATES,
  deepFreeze,
  validateAdvisorCommissionCalculation
};
