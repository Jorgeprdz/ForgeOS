"use strict";

const {
  validateAdvisorCompensationEvent,
  clone,
  deepFreeze
} = require("./advisor-compensation-event-contract");

function fail(code, details = null) {
  const error = new Error(code);
  error.code = code;
  if (details) error.details = details;
  throw error;
}

function createInMemoryAdvisorCompensationEventRepository() {
  const byId = new Map();
  const byIdempotency = new Map();
  const aggregateEvents = new Map();

  function append(event) {
    const validation = validateAdvisorCompensationEvent(event);
    if (!validation.valid) fail("ADVISOR_COMPENSATION_EVENT_INVALID", validation.errors);

    const existingById = byId.get(event.eventId);
    if (existingById) {
      if (existingById.eventDigest === event.eventDigest) {
        return deepFreeze({ status: "REPLAYED", event: clone(existingById), replayed: true });
      }
      fail("ADVISOR_COMPENSATION_EVENT_ID_CONFLICT");
    }

    const existingIdempotency = byIdempotency.get(event.idempotencyKey);
    if (existingIdempotency) {
      if (existingIdempotency.eventDigest === event.eventDigest) {
        return deepFreeze({ status: "REPLAYED", event: clone(existingIdempotency), replayed: true });
      }
      fail("ADVISOR_COMPENSATION_IDEMPOTENCY_CONFLICT");
    }

    const events = aggregateEvents.get(event.aggregateKey) || [];
    const expectedSequence = events.length + 1;
    if (event.sequence !== expectedSequence) fail("ADVISOR_COMPENSATION_EVENT_SEQUENCE_CONFLICT");
    if (expectedSequence === 1 && event.previousEventId !== null) {
      fail("ADVISOR_COMPENSATION_FIRST_EVENT_PREVIOUS_REFERENCE_FORBIDDEN");
    }
    if (expectedSequence > 1) {
      const previous = events[events.length - 1];
      if (event.previousEventId !== previous.eventId) {
        fail("ADVISOR_COMPENSATION_PREVIOUS_EVENT_MISMATCH");
      }
      if (event.advisorReference !== previous.advisorReference) {
        fail("ADVISOR_COMPENSATION_ADVISOR_SCOPE_MISMATCH");
      }
      if (event.amount.currency !== previous.amount.currency) {
        fail("ADVISOR_COMPENSATION_CURRENCY_LINEAGE_MISMATCH");
      }
    }

    const stored = deepFreeze(clone(event));
    byId.set(stored.eventId, stored);
    byIdempotency.set(stored.idempotencyKey, stored);
    aggregateEvents.set(stored.aggregateKey, Object.freeze([...events, stored]));
    return deepFreeze({ status: "APPENDED", event: clone(stored), replayed: false });
  }

  function getById(eventId, advisorReference) {
    const event = byId.get(eventId) || null;
    if (!event) return null;
    if (event.advisorReference !== advisorReference) {
      fail("ADVISOR_COMPENSATION_OWNER_SCOPE_VIOLATION");
    }
    return deepFreeze(clone(event));
  }

  function listByAggregate(aggregateKey, advisorReference) {
    const events = aggregateEvents.get(aggregateKey) || [];
    if (events.some((event) => event.advisorReference !== advisorReference)) {
      fail("ADVISOR_COMPENSATION_OWNER_SCOPE_VIOLATION");
    }
    return deepFreeze(events.map(clone));
  }

  function getLatest(aggregateKey, advisorReference) {
    const events = listByAggregate(aggregateKey, advisorReference);
    return events.length ? events[events.length - 1] : null;
  }

  function count() {
    return byId.size;
  }

  return Object.freeze({
    append,
    getById,
    listByAggregate,
    getLatest,
    count,
    capabilities: Object.freeze({
      append: true,
      read: true,
      update: false,
      overwrite: false,
      delete: false,
      remotePersistence: false
    })
  });
}

module.exports = {
  createInMemoryAdvisorCompensationEventRepository
};
