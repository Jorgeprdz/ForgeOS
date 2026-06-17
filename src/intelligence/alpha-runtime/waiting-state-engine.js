// src/intelligence/alpha-runtime/waiting-state-engine.js
class WaitingStateEngine {
  determineState(ownership) {
    return {
      waitingState: ownership.owner === 'prospect' ? 'waiting' : 'active',
      owner: ownership.owner
    };
  }
}
module.exports = WaitingStateEngine;
