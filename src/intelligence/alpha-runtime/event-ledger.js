// src/intelligence/alpha-runtime/event-ledger.js
class EventLedger {
  constructor() {
    this.events = [];
  }

  recordEvent(event) {
    const canonicalEvent = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      ...event
    };
    this.events.push(canonicalEvent);
    return canonicalEvent;
  }
}
module.exports = EventLedger;
