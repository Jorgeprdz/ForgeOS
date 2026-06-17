/**
 * TruthCandidateResolver
 *
 * Adjudicates semantic candidates based on the Truth Resolution Candidate Contract.
 * Deterministic, rule-based, no side effects.
 */

class TruthCandidateResolver {
  constructor() {
    this.ALLOWED_SOURCES = [
      'deterministic_extractor',
      'semantic_extractor',
      'human_input',
      'external_verified_source'
    ];
  }

  /**
   * Resolve a candidate event against the canonical ledger state.
   *
   * @param {Object} candidate - The proposed semantic candidate
   * @param {Object} ledgerState - Current canonical state from Ledger
   * @param {Object} context - Additional context (e.g., human acceptance status)
   * @returns {Object} Resolution result
   */
  resolve(candidate, ledgerState, context = {}) {
    const {
      isHumanAccepted = false,
      isAdvisorExplicitPromotion = false,
      isRejected = false
    } = context;

    // Rule 7: Rejected evidence remains auditable (and is rejected)
    if (isRejected) {
      return this._result('rejected', false, ['Evidence explicitly rejected']);
    }

    // Conflict Check (Rule 4)
    if (this._hasConflict(candidate, ledgerState)) {
      return this._result('disputed', false, ['Conflict detected with canonical ledger']);
    }

    // Promotion logic (Rule 3)
    const hasCorroboration = this._hasCorroboration(candidate, ledgerState, isAdvisorExplicitPromotion);

    if (isHumanAccepted && hasCorroboration) {
      return this._result('canonical', true, ['Human accepted and corroborated']);
    }

    // Default: Return as candidate if not canonical/disputed/rejected
    return this._result('candidate', false, ['Awaiting human acceptance or corroboration']);
  }

  _hasConflict(candidate, ledgerState) {
    if (!ledgerState || !ledgerState.data) return false;
    
    // Simple conflict detection logic based on example:
    // If key exists in both and values differ
    for (const key in candidate.data) {
      if (ledgerState.data.hasOwnProperty(key) && ledgerState.data[key] !== candidate.data[key]) {
        return true;
      }
    }
    return false;
  }

  _hasCorroboration(candidate, ledgerState, isAdvisorExplicitPromotion) {
    // Rule 3: Deterministic OR Ledger OR Advisor Promotion
    const deterministicCorroboration = candidate.corroboratedBy === 'deterministic_extractor';
    const ledgerCorroboration = !!ledgerState && candidate.corroboratedBy === 'ledger';

    return deterministicCorroboration || ledgerCorroboration || isAdvisorExplicitPromotion;
  }

  _result(status, canPromote, reasons) {
    return {
      status,
      canPromote,
      reasons,
      evidenceUsed: [] // Future: populate with evidence trace
    };
  }
}

module.exports = TruthCandidateResolver;
