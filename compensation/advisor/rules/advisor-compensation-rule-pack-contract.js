"use strict";

const ADVISOR_COMPENSATION_RULE_PACK_SCHEMA_VERSION = "1.0.0";

const ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE = Object.freeze({
  CANDIDATE: "candidate",
  OFFICIAL: "official",
  RETIRED: "retired"
});

const ADVISOR_COMPENSATION_RULE_SOURCE_STATES = Object.freeze({
  LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH: "LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH",
  OFFICIAL_CARRIER_SOURCE_TRUTH: "OFFICIAL_CARRIER_SOURCE_TRUTH"
});

const ADVISOR_COMPENSATION_LINES_OF_BUSINESS = Object.freeze({
  LIFE: "VIDA_INDIVIDUAL",
  GMM: "GMM"
});

const ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES = Object.freeze({
  READY_CANDIDATE: "READY_CANDIDATE",
  READY_OFFICIAL: "READY_OFFICIAL",
  BLOCKED: "BLOCKED",
  UNKNOWN: "UNKNOWN",
  CONFLICTING: "CONFLICTING",
  OUT_OF_EFFECTIVE_PERIOD: "OUT_OF_EFFECTIVE_PERIOD"
});

const REQUIRED_GLOBAL_RULES = Object.freeze({
  payoutTruth: false,
  calculatedCandidateIsPayoutTruth: false,
  earnedTruthRequiresConfirmedPaymentEvent: true,
  paidTruthRequiresCompensationStatement: true,
  unknownProductBehavior: "BLOCKED",
  unknownVariantBehavior: "BLOCKED",
  missingMaterialInputBehavior: "BLOCKED",
  defaultCommissionRateAllowed: false,
  automaticPayoutConfirmationAllowed: false,
  productRecommendationByCommissionAllowed: false
});

const LIFE_POLICY_YEAR_BANDS = Object.freeze([
  Object.freeze({ from: 1, to: 1, key: "YEAR_1" }),
  Object.freeze({ from: 2, to: 2, key: "YEAR_2" }),
  Object.freeze({ from: 3, to: 3, key: "YEAR_3" }),
  Object.freeze({ from: 4, to: 5, key: "YEARS_4_5" }),
  Object.freeze({ from: 6, to: 10, key: "YEARS_6_10" }),
  Object.freeze({ from: 11, to: null, key: "YEARS_11_PLUS" })
]);

const GMM_AGE_BANDS = Object.freeze([
  Object.freeze({ from: 0, to: 4, key: "AGE_0_4" }),
  Object.freeze({ from: 5, to: 54, key: "AGE_5_54" }),
  Object.freeze({ from: 55, to: 59, key: "AGE_55_59" }),
  Object.freeze({ from: 60, to: null, key: "AGE_60_PLUS" })
]);

module.exports = {
  ADVISOR_COMPENSATION_RULE_PACK_SCHEMA_VERSION,
  ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE,
  ADVISOR_COMPENSATION_RULE_SOURCE_STATES,
  ADVISOR_COMPENSATION_LINES_OF_BUSINESS,
  ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES,
  REQUIRED_GLOBAL_RULES,
  LIFE_POLICY_YEAR_BANDS,
  GMM_AGE_BANDS
};
