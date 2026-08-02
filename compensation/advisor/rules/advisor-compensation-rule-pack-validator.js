"use strict";

const {
  ADVISOR_COMPENSATION_RULE_PACK_SCHEMA_VERSION,
  ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE,
  ADVISOR_COMPENSATION_RULE_SOURCE_STATES,
  ADVISOR_COMPENSATION_LINES_OF_BUSINESS,
  REQUIRED_GLOBAL_RULES,
  LIFE_POLICY_YEAR_BANDS,
  GMM_AGE_BANDS
} = require("./advisor-compensation-rule-pack-contract");
const {
  validateProductIdentityRegistry
} = require("./advisor-compensation-product-identity-registry");

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validDate(value) {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function validRate(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;
}

function issue(code, path, message) {
  return Object.freeze({ code, path, message });
}

function sameBand(actual, expected) {
  return actual?.from === expected.from && actual?.to === expected.to && actual?.key === expected.key;
}

function validateRateBandArray(bands, expectedBands, path, errors) {
  if (!Array.isArray(bands) || bands.length !== expectedBands.length) {
    errors.push(issue("invalid_rate_band_count", path, `Expected ${expectedBands.length} rate bands.`));
    return;
  }

  bands.forEach((band, index) => {
    if (!sameBand(band, expectedBands[index])) {
      errors.push(issue("invalid_rate_band_shape", `${path}[${index}]`, "Rate band does not match canonical boundaries."));
    }
    if (!validRate(band?.rate)) {
      errors.push(issue("invalid_commission_rate", `${path}[${index}].rate`, "Commission rate must be between 0 and 1."));
    }
  });
}

function validateMetadata(rulePack, errors, warnings) {
  const metadata = rulePack.metadata;
  if (!isObject(metadata)) {
    errors.push(issue("missing_metadata", "metadata", "metadata is required."));
    return;
  }

  const requiredText = [
    "rulePackId",
    "rulePackVersion",
    "rulePackHash",
    "carrierId",
    "distributionChannel",
    "governanceStatus",
    "sourceState"
  ];

  requiredText.forEach((field) => {
    if (typeof metadata[field] !== "string" || metadata[field].trim() === "") {
      errors.push(issue("missing_metadata_field", `metadata.${field}`, `${field} is required.`));
    }
  });

  if (!validDate(metadata.effectiveFrom)) {
    errors.push(issue("invalid_effective_from", "metadata.effectiveFrom", "effectiveFrom must be a valid date."));
  }
  if (metadata.effectiveTo !== null && metadata.effectiveTo !== undefined && !validDate(metadata.effectiveTo)) {
    errors.push(issue("invalid_effective_to", "metadata.effectiveTo", "effectiveTo must be null or a valid date."));
  }
  if (validDate(metadata.effectiveFrom) && validDate(metadata.effectiveTo) &&
      Date.parse(metadata.effectiveFrom) > Date.parse(metadata.effectiveTo)) {
    errors.push(issue("invalid_effective_window", "metadata", "effectiveFrom cannot be after effectiveTo."));
  }

  const governance = Object.values(ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE);
  if (!governance.includes(metadata.governanceStatus)) {
    errors.push(issue("invalid_governance_status", "metadata.governanceStatus", "governanceStatus must be candidate, official or retired."));
  }

  if (!Array.isArray(metadata.sourceEvidenceRefs) || metadata.sourceEvidenceRefs.length === 0) {
    errors.push(issue("missing_source_evidence_refs", "metadata.sourceEvidenceRefs", "At least one source evidence reference is required."));
  }

  if (metadata.governanceStatus === ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE.CANDIDATE) {
    if (metadata.sourceState !== ADVISOR_COMPENSATION_RULE_SOURCE_STATES.LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH) {
      errors.push(issue("candidate_source_state_invalid", "metadata.sourceState", "Candidate pack must disclose legacy runtime as non-official source truth."));
    }
    if (metadata.rulePackHash !== "candidate:not-sealed") {
      errors.push(issue("candidate_hash_invalid", "metadata.rulePackHash", "Candidate pack must use candidate:not-sealed."));
    }
    warnings.push(issue("candidate_rule_pack_not_official", "metadata.governanceStatus", "Candidate rules are not official carrier source truth."));
  }

  if (metadata.governanceStatus === ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE.OFFICIAL) {
    if (metadata.sourceState !== ADVISOR_COMPENSATION_RULE_SOURCE_STATES.OFFICIAL_CARRIER_SOURCE_TRUTH) {
      errors.push(issue("official_source_state_required", "metadata.sourceState", "Official pack requires OFFICIAL_CARRIER_SOURCE_TRUTH."));
    }
    if (!/^sha256:[a-f0-9]{64}$/i.test(metadata.rulePackHash || "")) {
      errors.push(issue("official_hash_required", "metadata.rulePackHash", "Official pack requires a sealed sha256 digest."));
    }
    const refs = metadata.sourceEvidenceRefs || [];
    if (!refs.some((ref) => /pdf|manual|circular|carrier|commission|comision/i.test(String(ref)))) {
      errors.push(issue("official_source_evidence_required", "metadata.sourceEvidenceRefs", "Official pack requires carrier rule evidence."));
    }
  }
}

function validateGlobalRules(rulePack, errors) {
  if (!isObject(rulePack.globalRules)) {
    errors.push(issue("missing_global_rules", "globalRules", "globalRules is required."));
    return;
  }

  Object.entries(REQUIRED_GLOBAL_RULES).forEach(([key, expected]) => {
    if (rulePack.globalRules[key] !== expected) {
      errors.push(issue("invalid_global_rule", `globalRules.${key}`, `${key} must be ${JSON.stringify(expected)}.`));
    }
  });

  if (rulePack.globalRules.currency !== "MXN") {
    errors.push(issue("invalid_currency", "globalRules.currency", "Stage 020 candidate pack currency must be MXN."));
  }
}

function validateProductIdentities(rulePack, errors) {
  const result = validateProductIdentityRegistry(rulePack.productIdentities);
  result.errors.forEach((code) => errors.push(issue(code, "productIdentities", code)));

  (rulePack.productIdentities || []).forEach((identity, index) => {
    if (identity.carrierId !== "SMNYL") {
      errors.push(issue("invalid_product_carrier", `productIdentities[${index}].carrierId`, "Product carrier must be SMNYL."));
    }
    if (![ADVISOR_COMPENSATION_LINES_OF_BUSINESS.LIFE, ADVISOR_COMPENSATION_LINES_OF_BUSINESS.GMM].includes(identity.lineOfBusiness)) {
      errors.push(issue("invalid_line_of_business", `productIdentities[${index}].lineOfBusiness`, "Unsupported line of business."));
    }
    if (!Array.isArray(identity.aliases) || identity.aliases.length === 0) {
      errors.push(issue("missing_product_aliases", `productIdentities[${index}].aliases`, "At least one product alias is required."));
    }
  });
}

function validateCommissionRules(rulePack, errors) {
  const identities = new Map((rulePack.productIdentities || []).map((item) => [item.productId, item]));
  if (!Array.isArray(rulePack.commissionRules) || rulePack.commissionRules.length === 0) {
    errors.push(issue("missing_commission_rules", "commissionRules", "commissionRules is required."));
    return;
  }

  const ruleIds = new Set();
  const productRuleIds = new Set();

  rulePack.commissionRules.forEach((rule, index) => {
    const path = `commissionRules[${index}]`;
    if (!isObject(rule)) {
      errors.push(issue("invalid_commission_rule", path, "Commission rule must be an object."));
      return;
    }

    if (!rule.ruleId || ruleIds.has(rule.ruleId)) {
      errors.push(issue("duplicate_or_missing_rule_id", `${path}.ruleId`, "ruleId must be unique."));
    }
    ruleIds.add(rule.ruleId);

    const identity = identities.get(rule.productId);
    if (!identity) {
      errors.push(issue("unknown_rule_product", `${path}.productId`, "Commission rule references an unknown product."));
    } else if (identity.lineOfBusiness !== rule.lineOfBusiness) {
      errors.push(issue("rule_line_of_business_mismatch", `${path}.lineOfBusiness`, "Rule line of business must match product identity."));
    }

    if (productRuleIds.has(rule.productId)) {
      errors.push(issue("overlapping_product_rule", `${path}.productId`, "Stage 020 allows one candidate rule per product and effective window."));
    }
    productRuleIds.add(rule.productId);

    if (!validDate(rule.effectiveFrom) || !validDate(rule.effectiveTo)) {
      errors.push(issue("invalid_rule_effective_window", path, "Rule effectiveFrom/effectiveTo must be valid dates."));
    } else if (Date.parse(rule.effectiveFrom) > Date.parse(rule.effectiveTo)) {
      errors.push(issue("invalid_rule_effective_window", path, "Rule effectiveFrom cannot be after effectiveTo."));
    }

    if (rule.governanceStatus !== "candidate") {
      errors.push(issue("stage_020_rule_must_be_candidate", `${path}.governanceStatus`, "Stage 020 migrated rules must remain candidate."));
    }
    if (rule.sourceState !== ADVISOR_COMPENSATION_RULE_SOURCE_STATES.LEGACY_RUNTIME_NOT_OFFICIAL_SOURCE_TRUTH) {
      errors.push(issue("invalid_rule_source_state", `${path}.sourceState`, "Migrated rule must disclose non-official source state."));
    }

    if (rule.lineOfBusiness === ADVISOR_COMPENSATION_LINES_OF_BUSINESS.LIFE) {
      if (!Array.isArray(rule.variants) || rule.variants.length === 0) {
        errors.push(issue("missing_life_variants", `${path}.variants`, "Life rule requires variants."));
      } else {
        const variantIds = new Set();
        rule.variants.forEach((variant, variantIndex) => {
          const variantPath = `${path}.variants[${variantIndex}]`;
          if (!variant.variantId || variantIds.has(variant.variantId)) {
            errors.push(issue("duplicate_or_missing_variant_id", `${variantPath}.variantId`, "variantId must be unique."));
          }
          variantIds.add(variant.variantId);
          validateRateBandArray(variant.rates, LIFE_POLICY_YEAR_BANDS, `${variantPath}.rates`, errors);
        });
        if (!variantIds.has("DEFAULT")) {
          errors.push(issue("explicit_default_variant_required", `${path}.variants`, "Life rule requires an explicit DEFAULT variant."));
        }
      }
    } else if (rule.lineOfBusiness === ADVISOR_COMPENSATION_LINES_OF_BUSINESS.GMM) {
      validateRateBandArray(rule.initialAgeBands, GMM_AGE_BANDS, `${path}.initialAgeBands`, errors);
      validateRateBandArray(rule.renewalAgeBands, GMM_AGE_BANDS, `${path}.renewalAgeBands`, errors);
    }
  });

  identities.forEach((_, productId) => {
    if (!productRuleIds.has(productId)) {
      errors.push(issue("product_without_commission_rule", "commissionRules", `Missing commission rule for ${productId}.`));
    }
  });
}

function validateAuxiliaryRules(rulePack, errors) {
  const auxiliary = rulePack.auxiliaryRules;
  if (!isObject(auxiliary)) {
    errors.push(issue("missing_auxiliary_rules", "auxiliaryRules", "auxiliaryRules is required."));
    return;
  }

  const frequencies = auxiliary.paymentFrequencyFactors;
  if (!isObject(frequencies)) {
    errors.push(issue("missing_payment_frequency_factors", "auxiliaryRules.paymentFrequencyFactors", "Payment-frequency factors are required."));
  } else {
    const expected = { MENSUAL: 1 / 12, TRIMESTRAL: 0.25, SEMESTRAL: 0.5, ANUAL: 1 };
    Object.entries(expected).forEach(([key, value]) => {
      if (frequencies[key] !== value) {
        errors.push(issue("invalid_payment_frequency_factor", `auxiliaryRules.paymentFrequencyFactors.${key}`, `Expected ${value}.`));
      }
    });
  }

  if (!Array.isArray(auxiliary.premiumWeights) || auxiliary.premiumWeights.length !== 16) {
    errors.push(issue("invalid_premium_weight_count", "auxiliaryRules.premiumWeights", "Expected 16 Vida premium weights."));
  }
  (auxiliary.premiumWeights || []).forEach((item, index) => {
    if (typeof item.factor !== "number" || !Number.isFinite(item.factor) || item.factor <= 0) {
      errors.push(issue("invalid_premium_weight", `auxiliaryRules.premiumWeights[${index}].factor`, "Premium weight must be positive."));
    }
  });

  if (auxiliary?.developmentFactor?.factor !== 0.9 ||
      auxiliary?.developmentFactor?.advisorMonthFrom !== 1 ||
      auxiliary?.developmentFactor?.advisorMonthTo !== 12) {
    errors.push(issue("invalid_development_factor", "auxiliaryRules.developmentFactor", "Candidate development factor must preserve legacy months 1-12 at 0.90."));
  }
}

function validateBonusRules(rulePack, errors, warnings) {
  const bonusRules = rulePack.advisorBonusRules;
  if (!isObject(bonusRules)) {
    errors.push(issue("missing_advisor_bonus_rules", "advisorBonusRules", "advisorBonusRules is required."));
    return;
  }

  const training = bonusRules.trainingAllowance;
  if (!isObject(training) ||
      training.ruleMode !== "REFERENCE_EXISTING_RULE_PACK" ||
      training.conceptRef !== "training-allowance" ||
      training.reconciliationStatus !== "REQUIRED" ||
      training.payoutTruth !== false ||
      !Array.isArray(training.legacyTargets) ||
      training.legacyTargets.length !== 12) {
    errors.push(issue("invalid_training_allowance_reference", "advisorBonusRules.trainingAllowance", "Training Allowance must reference the existing rule pack and remain reconciliation-required."));
  } else {
    warnings.push(issue("training_allowance_reconciliation_required", "advisorBonusRules.trainingAllowance", "Stage 040 must reconcile the legacy candidate against the existing Advisor Development authority."));
  }

  const np = bonusRules.newProfessional;
  if (!isObject(np) || np.payoutTruth !== false || np.missingEligibilityBehavior !== "BLOCKED" ||
      !Array.isArray(np.groups) || np.groups.length !== 16) {
    errors.push(issue("invalid_new_professional_rule", "advisorBonusRules.newProfessional", "Nuevo Profesional requires 16 groups, blocked missing eligibility and payoutTruth=false."));
  } else {
    let previous = Infinity;
    np.groups.forEach((group, index) => {
      if (group.group !== index + 1) {
        errors.push(issue("invalid_new_professional_group_sequence", `advisorBonusRules.newProfessional.groups[${index}]`, "Groups must be sequential 1-16."));
      }
      if (!(typeof group.minimumWeightedPremium === "number" && group.minimumWeightedPremium < previous)) {
        errors.push(issue("invalid_new_professional_threshold_order", `advisorBonusRules.newProfessional.groups[${index}].minimumWeightedPremium`, "Thresholds must be strictly descending."));
      }
      previous = group.minimumWeightedPremium;
      const percentages = group.percentages || {};
      ["minimum", "limra87_5", "limra89_5", "limra91_5", "limra95_5"].forEach((field) => {
        if (typeof percentages[field] !== "number" || percentages[field] < 0 || percentages[field] > 100) {
          errors.push(issue("invalid_new_professional_percentage", `advisorBonusRules.newProfessional.groups[${index}].percentages.${field}`, "Percentage must be between 0 and 100."));
        }
      });
    });
  }

  const gmm = bonusRules.gmmQuarterly;
  if (!isObject(gmm) || gmm.payoutTruth !== false || gmm.policyUnitPerInitialGmmPolicy !== 0.5 ||
      !Array.isArray(gmm.groups) || gmm.groups.length !== 7) {
    errors.push(issue("invalid_gmm_bonus_rule", "advisorBonusRules.gmmQuarterly", "GMM bonus requires 7 groups, 0.5 policy units and payoutTruth=false."));
  } else {
    gmm.groups.forEach((group, index) => {
      if (group.group !== index + 1 || !validRate(group.percentage)) {
        errors.push(issue("invalid_gmm_bonus_group", `advisorBonusRules.gmmQuarterly.groups[${index}]`, "Invalid GMM bonus group."));
      }
    });
  }

  if (bonusRules.connectionBonus || bonusRules.developmentBonus) {
    errors.push(issue("excluded_bonus_scope_present", "advisorBonusRules", "Connection and development bonuses are outside direct Advisor Compensation scope."));
  }
}

function validateAdvisorCompensationRulePack(rulePack) {
  const errors = [];
  const warnings = [];

  if (!isObject(rulePack)) {
    return Object.freeze({
      isValid: false,
      canonicalReady: false,
      validationErrors: Object.freeze([issue("invalid_rule_pack", null, "Rule pack must be an object.")]),
      validationWarnings: Object.freeze([])
    });
  }

  if (rulePack.schemaVersion !== ADVISOR_COMPENSATION_RULE_PACK_SCHEMA_VERSION) {
    errors.push(issue("invalid_schema_version", "schemaVersion", `schemaVersion must be ${ADVISOR_COMPENSATION_RULE_PACK_SCHEMA_VERSION}.`));
  }

  validateMetadata(rulePack, errors, warnings);
  validateGlobalRules(rulePack, errors);
  validateProductIdentities(rulePack, errors);
  validateCommissionRules(rulePack, errors);
  validateAuxiliaryRules(rulePack, errors);
  validateBonusRules(rulePack, errors, warnings);

  const isValid = errors.length === 0;
  const canonicalReady =
    isValid &&
    rulePack.metadata?.governanceStatus === ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE.OFFICIAL &&
    rulePack.metadata?.sourceState === ADVISOR_COMPENSATION_RULE_SOURCE_STATES.OFFICIAL_CARRIER_SOURCE_TRUTH;

  return Object.freeze({
    validatorVersion: "ADVISOR_COMPENSATION_RULE_PACK_VALIDATOR_001",
    isValid,
    canonicalReady,
    candidateUsableForSimulation:
      isValid && rulePack.metadata?.governanceStatus === ADVISOR_COMPENSATION_RULE_PACK_GOVERNANCE.CANDIDATE,
    validationErrors: Object.freeze(errors),
    validationWarnings: Object.freeze(warnings),
    productCount: Array.isArray(rulePack.productIdentities) ? rulePack.productIdentities.length : 0,
    commissionRuleCount: Array.isArray(rulePack.commissionRules) ? rulePack.commissionRules.length : 0,
    payoutTruth: false,
    mutationAuthorized: false
  });
}

module.exports = {
  validateAdvisorCompensationRulePack
};
