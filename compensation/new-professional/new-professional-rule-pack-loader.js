import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  validateNewProfessionalRulePack,
} from './new-professional-rule-pack-validator.js';

const NEW_PROFESSIONAL_2026_RULE_PACK_URL = new URL(
  './rule-data/smnyl-new-professional-2026.rule-pack.json',
  import.meta.url,
);

const NEW_PROFESSIONAL_2026_RULE_PACK_PATH = fileURLToPath(NEW_PROFESSIONAL_2026_RULE_PACK_URL);

class NewProfessionalRulePackLoadError extends Error {
  constructor(message, code, cause = null) {
    super(message);
    this.name = 'NewProfessionalRulePackLoadError';
    this.code = code;

    if (cause) {
      this.cause = cause;
    }
  }
}

function parseRulePackJson(filePath) {
  if (!existsSync(filePath)) {
    throw new NewProfessionalRulePackLoadError(
      `New Professional rule pack file not found: ${filePath}`,
      'NEW_PROFESSIONAL_RULE_PACK_NOT_FOUND',
    );
  }

  const raw = readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new NewProfessionalRulePackLoadError(
      `New Professional rule pack JSON is invalid: ${filePath}`,
      'NEW_PROFESSIONAL_RULE_PACK_INVALID_JSON',
      error,
    );
  }
}

function loadNewProfessional2026RulePack(options = {}) {
  const filePath = options.filePath || NEW_PROFESSIONAL_2026_RULE_PACK_PATH;
  const rulePack = parseRulePackJson(filePath);
  const validation = validateNewProfessionalRulePack(rulePack);

  return {
    rulePack,
    validation,
    filePath,
  };
}

export {
  NEW_PROFESSIONAL_2026_RULE_PACK_PATH,
  NewProfessionalRulePackLoadError,
  loadNewProfessional2026RulePack,
};
