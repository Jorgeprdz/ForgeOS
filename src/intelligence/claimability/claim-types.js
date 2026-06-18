/**
 * Forge Claimability Taxonomy v1.0
 */

const CLAIM_TYPES = {
  COMMITMENT_CLAIM: 'COMMITMENT_CLAIM',   // Promises of action (e.g., "I will call")
  PRODUCT_CLAIM: 'PRODUCT_CLAIM',         // Product ownership or intent (e.g., "Owns GMM")
  RELATIONSHIP_CLAIM: 'RELATIONSHIP_CLAIM', // Lifecycle/status changes (e.g., "Qualified")
  ENTITY_CLAIM: 'ENTITY_CLAIM'            // Static profile data (e.g., "Birthday")
};

const CLAIMABILITY_PILLARS = {
  VERIFIABILITY: 'VERIFIABILITY',
  STABILITY: 'STABILITY',
  ACTIONABILITY: 'ACTIONABILITY',
  OWNERSHIP: 'OWNERSHIP'
};

module.exports = {
  CLAIM_TYPES,
  CLAIMABILITY_PILLARS
};
