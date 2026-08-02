"use strict";

const {
  deepFreeze
} = require("./advisor-commission-calculation-contract");
const {
  roundMoney
} = require("./advisor-commission-basis-resolver");
const {
  calculateAdvisorCompensationCalculationDigest
} = require("./advisor-compensation-calculation-digest");

function finite(value) {
  return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
}

function blocked(reason, missingInputs = []) {
  return deepFreeze({
    status: "BLOCKED",
    reason,
    truthState: "BLOCKED",
    missingInputs: [...new Set(missingInputs)],
    amount: null,
    payoutTruth: false,
    compensationEventWritten: false
  });
}

function reconcileTrainingAllowanceAuthority({
  advisorCompensationRulePack,
  advisorDevelopmentRulePack,
  advisorDevelopmentRulePackRef = null
} = {}) {
  const reference =
    advisorCompensationRulePack?.advisorBonusRules?.trainingAllowance;
  if (!reference ||
      reference.ruleMode !== "REFERENCE_EXISTING_RULE_PACK") {
    return blocked("training_allowance_reference_invalid");
  }
  if (!advisorDevelopmentRulePack ||
      typeof advisorDevelopmentRulePack !== "object") {
    return blocked("advisor_development_rule_pack_required", [
      "advisor_development_rule_pack"
    ]);
  }
  const concept =
    advisorDevelopmentRulePack?.concepts?.[reference.conceptRef];
  if (!concept) {
    return blocked("training_allowance_concept_not_found");
  }
  if (advisorDevelopmentRulePackRef &&
      advisorDevelopmentRulePackRef !== reference.rulePackRef) {
    return blocked("training_allowance_rule_pack_reference_mismatch");
  }

  return deepFreeze({
    status: "READY",
    selectedAuthority: "ADVISOR_DEVELOPMENT_RULE_PACK",
    rulePackRef: reference.rulePackRef,
    conceptRef: reference.conceptRef,
    governanceStatus:
      advisorDevelopmentRulePack?.metadata?.governanceStatus ||
      advisorDevelopmentRulePack?.governanceStatus ||
      "UNKNOWN",
    duplicateLegacyInterpretationRetired: true,
    advisorCompensationLegacyTargetsUsedForCalculation: false,
    payoutTruth: false,
    concept
  });
}

function calculateTrainingAllowanceCandidate({
  authority,
  advisorMonth,
  accumulatedCommission,
  accumulatedPolicyCount,
  accumulatedLifePolicyCount,
  priorPaidAdvances = 0,
  calculatedAt = null
} = {}) {
  if (authority?.status !== "READY") {
    return blocked("training_allowance_authority_not_ready");
  }
  if (!Number.isInteger(advisorMonth) || advisorMonth < 1) {
    return blocked("advisor_month_required", ["advisor_month"]);
  }
  const row = (authority.concept.table || [])
    .find((candidate) => candidate.advisorMonth === advisorMonth);
  if (!row) return blocked("training_allowance_row_not_found");

  const inputs = [
    ["accumulated_commission", accumulatedCommission],
    ["accumulated_policy_count", accumulatedPolicyCount],
    ["accumulated_life_policy_count", accumulatedLifePolicyCount],
    ["prior_paid_advances", priorPaidAdvances]
  ];
  const missing = inputs.filter(([, value]) => !finite(value)).map(([name]) => name);
  if (missing.length) return blocked("training_allowance_inputs_required", missing);

  const commission = Number(accumulatedCommission);
  const policyCount = Number(accumulatedPolicyCount);
  const lifeCount = Number(accumulatedLifePolicyCount);
  const priorPaid = Number(priorPaidAdvances);
  if ([commission, policyCount, lifeCount, priorPaid].some((value) => value < 0)) {
    return blocked("training_allowance_inputs_invalid");
  }

  const qualifies =
    commission >= row.accumulatedCommissionGoal &&
    policyCount >= row.accumulatedPolicyGoal &&
    lifeCount >= row.minimumLifePolicyGoal;

  const raw = qualifies ? commission * Number(row.bonusPercentage) : 0;
  const base = qualifies
    ? Math.max(
        Number(row.minimumAward),
        Math.min(raw, Number(row.maximumAward))
      )
    : 0;
  const excessRate = Number(
    authority.concept?.calculationRules?.excessMultiplierRate || 0
  );
  const excess = qualifies && raw > Number(row.maximumAward)
    ? (raw - Number(row.maximumAward)) * excessRate
    : 0;
  const gross = roundMoney(base + excess);
  const net = roundMoney(Math.max(0, gross - priorPaid));

  const digestPayload = {
    concept: "training-allowance",
    advisorMonth,
    accumulatedCommission: commission,
    accumulatedPolicyCount: policyCount,
    accumulatedLifePolicyCount: lifeCount,
    priorPaidAdvances: priorPaid,
    row,
    gross,
    net,
    authority: authority.selectedAuthority
  };

  return deepFreeze({
    status: "CALCULATED",
    concept: "TRAINING_ALLOWANCE",
    truthState: "ESTIMATED",
    qualifies,
    advisorMonth,
    goals: {
      accumulatedCommissionGoal: row.accumulatedCommissionGoal,
      accumulatedPolicyGoal: row.accumulatedPolicyGoal,
      minimumLifePolicyGoal: row.minimumLifePolicyGoal
    },
    actual: {
      accumulatedCommission: commission,
      accumulatedPolicyCount: policyCount,
      accumulatedLifePolicyCount: lifeCount
    },
    amounts: {
      baseAward: roundMoney(base),
      excessAward: roundMoney(excess),
      grossAward: gross,
      priorPaidAdvances: roundMoney(priorPaid),
      candidateAmount: net
    },
    authority: {
      selectedAuthority: authority.selectedAuthority,
      rulePackRef: authority.rulePackRef,
      governanceStatus: authority.governanceStatus,
      duplicateLegacyInterpretationRetired:
        authority.duplicateLegacyInterpretationRetired
    },
    calculationDigest:
      calculateAdvisorCompensationCalculationDigest(digestPayload),
    calculatedAt,
    eligibleForEarnedPromotion:
      authority.governanceStatus === "official",
    payoutTruth: false,
    compensationEventWritten: false
  });
}

function chooseNewProfessionalPercentage(percentages, limra) {
  if (limra >= 95.5) return percentages.limra95_5;
  if (limra >= 91.5) return percentages.limra91_5;
  if (limra >= 89.5) return percentages.limra89_5;
  if (limra >= 87.5) return percentages.limra87_5;
  return percentages.minimum;
}

function calculateNewProfessionalBonusCandidate({
  rulePack,
  weightedPremiumSemester,
  limra,
  igc,
  calculatedAt = null
} = {}) {
  const rule = rulePack?.advisorBonusRules?.newProfessional;
  if (!rule) return blocked("new_professional_rule_required");
  const missing = [];
  if (!finite(weightedPremiumSemester)) missing.push("weighted_premium_semester");
  if (!finite(limra)) missing.push("limra");
  if (!finite(igc)) missing.push("igc");
  if (missing.length) return blocked("new_professional_inputs_required", missing);

  const premium = Number(weightedPremiumSemester);
  const limraValue = Number(limra);
  const igcValue = Number(igc);
  if (premium < 0 || limraValue < 0 || igcValue < 0) {
    return blocked("new_professional_inputs_invalid");
  }

  const group = (rule.groups || []).find(
    (candidate) => premium >= candidate.minimumWeightedPremium
  ) || null;
  const percentagePoints = group
    ? Number(chooseNewProfessionalPercentage(group.percentages, limraValue))
    : 0;
  const rate = percentagePoints / 100;
  const amount = roundMoney(premium * rate);
  const digestPayload = {
    concept: "new-professional",
    weightedPremiumSemester: premium,
    limra: limraValue,
    igc: igcValue,
    group,
    rate,
    amount
  };

  return deepFreeze({
    status: "CALCULATED",
    concept: "NEW_PROFESSIONAL_BONUS",
    truthState: "ESTIMATED",
    qualifies: Boolean(group),
    group: group ? group.group : null,
    inputs: {
      weightedPremiumSemester: premium,
      limra: limraValue,
      igc: igcValue
    },
    percentagePoints,
    rate,
    candidateAmount: amount,
    warnings: [
      "IGC is required evidence but the candidate legacy rule does not define how it changes the percentage."
    ],
    ruleSourceState: rule.sourceState,
    calculationDigest:
      calculateAdvisorCompensationCalculationDigest(digestPayload),
    calculatedAt,
    eligibleForEarnedPromotion: false,
    payoutTruth: false,
    compensationEventWritten: false
  });
}

function calculateGmmQuarterlyBonusCandidate({
  rulePack,
  confirmedInitialGmmPremiumQuarter,
  confirmedInitialGmmPolicyUnits,
  calculatedAt = null
} = {}) {
  const rule = rulePack?.advisorBonusRules?.gmmQuarterly;
  if (!rule) return blocked("gmm_quarterly_rule_required");
  const missing = [];
  if (!finite(confirmedInitialGmmPremiumQuarter)) {
    missing.push("confirmed_initial_gmm_premium_quarter");
  }
  if (!finite(confirmedInitialGmmPolicyUnits)) {
    missing.push("confirmed_initial_gmm_policy_units");
  }
  if (missing.length) return blocked("gmm_quarterly_inputs_required", missing);

  const premium = Number(confirmedInitialGmmPremiumQuarter);
  const units = Number(confirmedInitialGmmPolicyUnits);
  if (premium < 0 || units < 0) return blocked("gmm_quarterly_inputs_invalid");

  const group = (rule.groups || []).find((candidate) =>
    premium >= candidate.minimumQuarterPremium &&
    units >= candidate.minimumPolicyUnits
  ) || null;
  const rate = group ? Number(group.percentage) : 0;
  const amount = roundMoney(premium * rate);
  const digestPayload = {
    concept: "gmm-quarterly",
    premium,
    units,
    group,
    rate,
    amount
  };

  return deepFreeze({
    status: "CALCULATED",
    concept: "GMM_QUARTERLY_BONUS",
    truthState: "ESTIMATED",
    qualifies: Boolean(group),
    group: group ? group.group : null,
    inputs: {
      confirmedInitialGmmPremiumQuarter: premium,
      confirmedInitialGmmPolicyUnits: units
    },
    rate,
    candidateAmount: amount,
    policyUnitPerInitialGmmPolicy: rule.policyUnitPerInitialGmmPolicy,
    ruleSourceState: rule.sourceState,
    calculationDigest:
      calculateAdvisorCompensationCalculationDigest(digestPayload),
    calculatedAt,
    eligibleForEarnedPromotion: false,
    payoutTruth: false,
    compensationEventWritten: false
  });
}

module.exports = {
  reconcileTrainingAllowanceAuthority,
  calculateTrainingAllowanceCandidate,
  chooseNewProfessionalPercentage,
  calculateNewProfessionalBonusCandidate,
  calculateGmmQuarterlyBonusCandidate
};
