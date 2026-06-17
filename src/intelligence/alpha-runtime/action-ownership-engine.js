// src/intelligence/alpha-runtime/action-ownership-engine.js
class ActionOwnershipEngine {
  determineOwnership(events) {
    const commitmentEvent = events.find(e => e.type === 'commitment_established');
    
    if (commitmentEvent && commitmentEvent.data.owner) {
        return {
            owner: commitmentEvent.data.owner,
            confidence: 0.95,
            evidenceUsed: events.map(e => e.type)
        };
    }

    // Fallback logic
    const hasCommitment = events.some(e => e.type === 'commitment_established');
    return {
      owner: hasCommitment ? 'prospect' : 'advisor',
      confidence: 0.8,
      evidenceUsed: events.map(e => e.type)
    };
  }
}
module.exports = ActionOwnershipEngine;
