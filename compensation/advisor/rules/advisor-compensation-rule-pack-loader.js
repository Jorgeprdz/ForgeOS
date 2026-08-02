"use strict";

const fs = require("fs");
const path = require("path");
const {
  validateAdvisorCompensationRulePack
} = require("./advisor-compensation-rule-pack-validator");
const {
  createAdvisorCompensationRuleSnapshot
} = require("./advisor-compensation-rule-snapshot");

const DEFAULT_RULE_PACK_PATH = path.join(
  __dirname,
  "rule-data",
  "smnyl-advisor-compensation-2026.candidate.rule-pack.json"
);

class AdvisorCompensationRulePackLoadError extends Error {
  constructor(message, code, cause = null) {
    super(message);
    this.name = "AdvisorCompensationRulePackLoadError";
    this.code = code;
    if (cause) this.cause = cause;
  }
}

function loadAdvisorCompensationRulePack(options = {}) {
  const filePath = options.filePath || DEFAULT_RULE_PACK_PATH;
  if (!fs.existsSync(filePath)) {
    throw new AdvisorCompensationRulePackLoadError(
      `Advisor Compensation rule pack not found: ${filePath}`,
      "ADVISOR_COMPENSATION_RULE_PACK_NOT_FOUND"
    );
  }

  let rulePack;
  try {
    rulePack = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new AdvisorCompensationRulePackLoadError(
      `Advisor Compensation rule pack JSON is invalid: ${filePath}`,
      "ADVISOR_COMPENSATION_RULE_PACK_INVALID_JSON",
      error
    );
  }

  const validation = validateAdvisorCompensationRulePack(rulePack);
  const snapshot = createAdvisorCompensationRuleSnapshot(rulePack, {
    capturedAt: options.capturedAt
  });

  return Object.freeze({
    filePath,
    rulePack,
    validation,
    snapshot,
    isValid: validation.isValid,
    canonicalReady: validation.canonicalReady,
    candidateUsableForSimulation: validation.candidateUsableForSimulation,
    validationErrors: validation.validationErrors,
    validationWarnings: validation.validationWarnings,
    payoutTruth: false,
    mutationAuthorized: false
  });
}

module.exports = {
  DEFAULT_RULE_PACK_PATH,
  AdvisorCompensationRulePackLoadError,
  loadAdvisorCompensationRulePack
};
