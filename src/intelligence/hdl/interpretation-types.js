/**
 * Forge Interpretation Scopes and Intent Taxonomy
 */
const SCOPES = {
  COMMITMENT: 'commitment',
  TEMPORAL: 'temporal',
  INTENT: 'intent',
  GREETING: 'greeting',
  RELATIONSHIP: 'relationship',
  UNKNOWN: 'unknown'
};

const INTENTS = {
  ADVISOR_REQUEST: 'advisor_request',
  PROSPECT_COMMITMENT: 'prospect_commitment',
  DECISION_DELAY: 'decision_delay',
  GREETING_ONLY: 'greeting_only',
  PRODUCT_INTEREST: 'product_interest',
  PRODUCT_COMPARISON: 'product_comparison',
  NETWORK_SIGNAL: 'network_signal',
  UNKNOWN: 'unknown'
};

module.exports = {
  SCOPES,
  INTENTS
};
