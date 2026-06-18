/**
 * Forge Claimability Result Contract
 * 
 * Represents the outcome of the Claimability Filter.
 */
class ClaimabilityResult {
  constructor(data = {}) {
    this.claimable = !!data.claimable;
    this.claim_type = data.claim_type || null;
    this.score = typeof data.score === 'number' ? data.score : 0.0;
    this.passed_pillars = Array.isArray(data.passed_pillars) ? data.passed_pillars : [];
    this.failed_pillars = Array.isArray(data.failed_pillars) ? data.failed_pillars : [];
    this.reason = data.reason || '';
    this.requires_human_review = data.requires_human_review !== undefined ? data.requires_human_review : true;
  }

  toJSON() {
    return {
      claimable: this.claimable,
      claim_type: this.claim_type,
      score: this.score,
      passed_pillars: this.passed_pillars,
      failed_pillars: this.failed_pillars,
      reason: this.reason,
      requires_human_review: this.requires_human_review
    };
  }
}

module.exports = ClaimabilityResult;
