import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  validateAdvisorDevelopmentRulePack,
} from './advisor-development-rule-pack-validator.js';

const DEFAULT_RULE_PACK_URL = new URL(
  './rule-data/smnyl-advisor-development-2026.rule-pack.json',
  import.meta.url,
);

class AdvisorDevelopmentRulePackLoadError extends Error {
  constructor(message, code, cause = null) {
    super(message);
    this.name = 'AdvisorDevelopmentRulePackLoadError';
    this.code = code;

    if (cause) {
      this.cause = cause;
    }
  }
}

function getDefaultAdvisorDevelopmentRulePackPath() {
  return fileURLToPath(DEFAULT_RULE_PACK_URL);
}

function parseJsonFile(filePath) {
  if (!existsSync(filePath)) {
    throw new AdvisorDevelopmentRulePackLoadError(
      `Advisor Development rule pack file not found: ${filePath}`,
      'ADVISOR_DEVELOPMENT_RULE_PACK_NOT_FOUND',
    );
  }

  const raw = readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new AdvisorDevelopmentRulePackLoadError(
      `Advisor Development rule pack JSON is invalid: ${filePath}`,
      'ADVISOR_DEVELOPMENT_RULE_PACK_INVALID_JSON',
      error,
    );
  }
}

export function loadAdvisorDevelopmentRulePack(options = {}) {
  const filePath = options.filePath || getDefaultAdvisorDevelopmentRulePackPath();
  const rulePack = parseJsonFile(filePath);
  const validation = validateAdvisorDevelopmentRulePack(rulePack);

  return {
    rulePack,
    validation,
    validationErrors: validation.validationErrors,
    validationWarnings: validation.validationWarnings,
    isValid: validation.isValid,
    filePath,
  };
}

export {
  AdvisorDevelopmentRulePackLoadError,
  getDefaultAdvisorDevelopmentRulePackPath,
};
