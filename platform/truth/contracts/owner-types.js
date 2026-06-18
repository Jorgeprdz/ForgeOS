export const OWNER_TYPES = Object.freeze({
  OFFICIAL_DOCUMENT: 'official_document',
  CARRIER_DOCUMENT: 'carrier_document',
  POLICY_DOCUMENT: 'policy_document',
  QUOTE_DOCUMENT: 'quote_document',
  RULE_PACK: 'rule_pack',
  RULE_SNAPSHOT: 'rule_snapshot',
  USER_INPUT: 'user_input',
  ADVISOR_CONFIRMED: 'advisor_confirmed',
  MANAGER_CONFIRMED: 'manager_confirmed',
  SYSTEM_CALCULATED: 'system_calculated',
  EXTERNAL_API: 'external_api',
  OCR_OUTPUT: 'OCR_output',
  PARSER_OUTPUT: 'parser_output',
  AI_INTERPRETATION: 'AI_interpretation',
  MANUAL_OVERRIDE: 'manual_override',
  GOVERNANCE_DECISION: 'governance_decision',
  HUMAN_DECISION: 'human_decision',
  UNKNOWN_OWNER: 'unknown_owner',
});

export const KNOWN_OWNER_TYPES = Object.freeze(Object.values(OWNER_TYPES));

export function isKnownOwnerType(ownerType) {
  return KNOWN_OWNER_TYPES.includes(ownerType);
}
