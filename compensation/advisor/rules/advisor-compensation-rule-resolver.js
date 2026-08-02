"use strict";

const {
  ADVISOR_COMPENSATION_LINES_OF_BUSINESS,
  ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES
} = require("./advisor-compensation-rule-pack-contract");
const {
  normalizeProductAlias,
  resolveProductIdentity
} = require("./advisor-compensation-product-identity-registry");
const {
  validateAdvisorCompensationRulePack
} = require("./advisor-compensation-rule-pack-validator");
const {
  calculateAdvisorCompensationRulePackDigest
} = require("./advisor-compensation-rule-snapshot");

function normalizeVariant(value) {
  const normalized = normalizeProductAlias(value);
  return normalized ? normalized.replace(/\s+/g, "_") : null;
}

function inWindow(asOf, from, to) {
  const instant = Date.parse(asOf);
  return Number.isFinite(instant) &&
    instant >= Date.parse(from) &&
    instant <= Date.parse(to);
}

function pickBand(bands, value) {
  return (bands || []).find((band) =>
    value >= band.from && (band.to === null || value <= band.to)
  ) || null;
}

function blocked(reason, extra = {}) {
  return Object.freeze({
    status: ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES.BLOCKED,
    reason,
    rate: null,
    payoutTruth: false,
    earnedTruth: false,
    mutationAuthorized: false,
    ...extra
  });
}

function resolveAdvisorCompensationCommissionRule({
  rulePack,
  productInput,
  variantInput = null,
  policyYear = null,
  contractAge = null,
  isRenewal = false,
  asOf
} = {}) {
  const validation = validateAdvisorCompensationRulePack(rulePack);
  if (!validation.isValid) {
    return blocked("rule_pack_invalid", {
      validationErrors: validation.validationErrors
    });
  }

  const identityResolution = resolveProductIdentity(rulePack.productIdentities, productInput);
  if (identityResolution.status === "UNKNOWN") {
    return blocked("unknown_product");
  }
  if (identityResolution.status === "CONFLICTING") {
    return Object.freeze({
      status: ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES.CONFLICTING,
      reason: "conflicting_product_identity",
      rate: null,
      candidateProductIds: identityResolution.candidateProductIds,
      payoutTruth: false,
      earnedTruth: false,
      mutationAuthorized: false
    });
  }

  const rule = rulePack.commissionRules.find((candidate) => candidate.productId === identityResolution.productId);
  if (!rule) return blocked("commission_rule_not_found", { productId: identityResolution.productId });

  if (!inWindow(asOf, rule.effectiveFrom, rule.effectiveTo)) {
    return Object.freeze({
      status: ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES.OUT_OF_EFFECTIVE_PERIOD,
      reason: "as_of_outside_rule_window",
      productId: identityResolution.productId,
      ruleId: rule.ruleId,
      rate: null,
      payoutTruth: false,
      earnedTruth: false,
      mutationAuthorized: false
    });
  }

  let selectedBand;
  let variantId = null;

  if (rule.lineOfBusiness === ADVISOR_COMPENSATION_LINES_OF_BUSINESS.LIFE) {
    if (!Number.isInteger(policyYear) || policyYear < 1) {
      return blocked("policy_year_required", { productId: identityResolution.productId, ruleId: rule.ruleId });
    }

    variantId = variantInput ? normalizeVariant(variantInput) : "DEFAULT";
    const variant = rule.variants.find((candidate) => {
      if (candidate.variantId === variantId) return true;
      return (candidate.aliases || []).some((alias) => normalizeVariant(alias) === variantId);
    });
    if (!variant) {
      return blocked("unknown_variant", {
        productId: identityResolution.productId,
        ruleId: rule.ruleId,
        variantId
      });
    }
    variantId = variant.variantId;
    selectedBand = pickBand(variant.rates, policyYear);
  } else {
    if (contractAge === null || contractAge === undefined || contractAge === "" ||
        !Number.isFinite(Number(contractAge)) || Number(contractAge) < 0) {
      return blocked("contract_age_required", { productId: identityResolution.productId, ruleId: rule.ruleId });
    }
    selectedBand = pickBand(isRenewal ? rule.renewalAgeBands : rule.initialAgeBands, Number(contractAge));
  }

  if (!selectedBand) {
    return blocked("rate_band_not_found", {
      productId: identityResolution.productId,
      ruleId: rule.ruleId
    });
  }

  const official = rulePack.metadata.governanceStatus === "official";
  return Object.freeze({
    status: official
      ? ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES.READY_OFFICIAL
      : ADVISOR_COMPENSATION_RULE_RESOLUTION_STATUSES.READY_CANDIDATE,
    reason: null,
    productId: identityResolution.productId,
    displayName: identityResolution.identity.displayName,
    lineOfBusiness: rule.lineOfBusiness,
    ruleId: rule.ruleId,
    variantId,
    bandKey: selectedBand.key,
    rate: selectedBand.rate,
    commissionBasis: rule.commissionBasis,
    governanceStatus: rulePack.metadata.governanceStatus,
    sourceState: rule.sourceState,
    rulePackId: rulePack.metadata.rulePackId,
    rulePackVersion: rulePack.metadata.rulePackVersion,
    rulePackDigest: calculateAdvisorCompensationRulePackDigest(rulePack),
    truthState: official ? "RULE_READY" : "ESTIMATED_RULE_CANDIDATE",
    earnedTruth: false,
    payoutTruth: false,
    mutationAuthorized: false
  });
}

module.exports = {
  normalizeVariant,
  resolveAdvisorCompensationCommissionRule
};
