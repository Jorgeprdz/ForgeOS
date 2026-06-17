// src/intelligence/alpha-runtime/forge-alpha-runtime.js
const EventLedger = require('./event-ledger');
const EventExtractionEngine = require('./event-extraction-engine');
const ActionOwnershipEngine = require('./action-ownership-engine');
const WaitingStateEngine = require('./waiting-state-engine');
const ProcessAdvancementEngine = require('./process-advancement-engine');

class ForgeAlphaRuntime {
  constructor() {
    this.ledger = new EventLedger();
    this.extractor = new EventExtractionEngine();
    this.ownership = new ActionOwnershipEngine();
    this.waiting = new WaitingStateEngine();
    this.advancement = new ProcessAdvancementEngine();
  }

  process(rawNote) {
    const extracted = this.extractor.extract(rawNote);
    extracted.forEach(e => this.ledger.recordEvent(e));

    const ownership = this.ownership.determineOwnership(extracted);
    const waiting = this.waiting.determineState(ownership);
    const advancement = this.advancement.determineAdvancement(extracted);

    return {
      extracted_events: extracted,
      owner: ownership.owner,
      ownership_confidence: ownership.confidence,
      waiting_state: waiting.waitingState,
      advancement_state: advancement.advancementState,
      recommendation: advancement.recommendation,
      unknowns: [],
      evidence_used: ownership.evidenceUsed
    };
  }
}
module.exports = ForgeAlphaRuntime;
