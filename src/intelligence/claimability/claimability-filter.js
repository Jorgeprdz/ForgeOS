const { CLAIM_TYPES } = require('./claim-types');
const ClaimabilityResult = require('./claimability-result');

/**
 * Forge Claimability Filter
 * 
 * Evaluates a Semantic Frame against the Four Pillars of Claimability:
 * Verifiability, Stability, Actionability, and Ownership.
 */

/**
 * Evaluates whether a Semantic Frame contains claimable interpretations.
 * 
 * @param {Object} frame - The Semantic Frame from HDL.
 * @returns {ClaimabilityResult}
 */
function evaluateClaimability(frame) {
  if (!frame || !frame.interpretations || frame.interpretations.length === 0) {
    return new ClaimabilityResult({
      claimable: false,
      reason: 'No interpretations found in semantic frame.'
    });
  }

  // Find the best interpretation (v1.0 skeleton logic)
  // In a real implementation, this would iterate and find the best match.
  const primary = frame.interpretations[0];

  if (primary.claimable === true) {
    return new ClaimabilityResult({
      claimable: true,
      claim_type: CLAIM_TYPES.COMMITMENT_CLAIM,
      score: primary.confidence ? primary.confidence.claim_score : 0.0,
      reason: 'Interpretation flagged as claimable by HDL normalizer.'
    });
  }

  return new ClaimabilityResult({
    claimable: false,
    reason: 'Primary interpretation is not claimable.'
  });
}

module.exports = {
  evaluateClaimability
};
