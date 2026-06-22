import { readFileSync } from 'node:fs';

import {
  validatePartnerRulePack,
} from './partner-rule-pack-validator.js';

export const DEFAULT_SMNYL_PARTNER_2026_RULE_PACK_PATH = new URL(
  '../rule-data/smnyl_partner_compensation_2026_rules_canonical_draft.json',
  import.meta.url
);

export function loadPartnerRulePack({ filePath } = {}) {
  if (!filePath) throw new Error('partner_rule_pack_filePath_required');

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`partner_rule_pack_load_failed:${error.message}`);
  }

  const validation = validatePartnerRulePack(parsed);
  if (!validation.valid) {
    throw new Error(`partner_rule_pack_invalid:${validation.errors.join(',')}`);
  }

  return {
    ...parsed,
    validationWarnings: validation.warnings,
  };
}

export function loadDefaultSMNYLPartner2026RulePack() {
  return loadPartnerRulePack({ filePath: DEFAULT_SMNYL_PARTNER_2026_RULE_PACK_PATH });
}
