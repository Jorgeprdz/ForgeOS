export const ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION =
  "activity-event-authority-mapping.v1";

export const FES_ACTIVITY_EVENT_SCHEMA_VERSION =
  "forge.activity_event.v1";

export const REPORTABLE_ACTIVITY_TYPES = Object.freeze([
  "INITIAL_APPOINTMENT_SCHEDULED",
  "INITIAL_APPOINTMENT_COMPLETED",
  "CLOSING_APPOINTMENT_SCHEDULED",
  "CLOSING_APPOINTMENT_COMPLETED",
  "FOLLOW_UP_COMPLETED",
]);

export const FES_FIRST_VERTICAL_EVENT_TYPES = Object.freeze([
  "PROSPECT_PROFILE_CREATED",
  "PROSPECT_CREATED",
  "INITIAL_CONTEXT_CAPTURED",
  "TIMELINE_INITIALIZED",
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_HELD",
  "APPOINTMENT_NOT_HELD",
  "APPOINTMENT_RESCHEDULED",
  "APPOINTMENT_NO_SHOW",
  "ACTIVITY_CONTEXT_ADDED",
  "DUE_ACTION_CREATED",
  "DUE_ACTION_RESCHEDULED",
  "DUE_ACTION_COMPLETED",
]);

const APPOINTMENT_EVENTS = new Set([
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_HELD",
]);

const NON_COUNTABLE_EVENTS = new Set([
  "PROSPECT_PROFILE_CREATED",
  "PROSPECT_CREATED",
  "INITIAL_CONTEXT_CAPTURED",
  "TIMELINE_INITIALIZED",
  "APPOINTMENT_NOT_HELD",
  "APPOINTMENT_RESCHEDULED",
  "APPOINTMENT_NO_SHOW",
  "ACTIVITY_CONTEXT_ADDED",
  "DUE_ACTION_CREATED",
  "DUE_ACTION_RESCHEDULED",
]);

export class ActivityEventAuthorityMappingError extends TypeError {
  constructor(message) {
    super(`ActivityEventAuthorityMapping: ${message}`);
    this.name = "ActivityEventAuthorityMappingError";
  }
}

function fail(message) {
  throw new ActivityEventAuthorityMappingError(message);
}

function plain(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function string(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${label} must be a non-empty string`);
  }
  return value.trim();
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

export function assertCanonicalFesActivityEvent(value) {
  plain(value, "event");

  if (value.schema_version !== FES_ACTIVITY_EVENT_SCHEMA_VERSION) {
    fail("event schema_version is unsupported");
  }

  string(value.event_id, "event.event_id");
  string(value.event_type, "event.event_type");
  string(value.tenant_id, "event.tenant_id");
  string(value.idempotency_key, "event.idempotency_key");
  string(value.occurred_at, "event.occurred_at");
  string(value.recorded_at, "event.recorded_at");

  if (!FES_FIRST_VERTICAL_EVENT_TYPES.includes(value.event_type)) {
    fail(`event type ${value.event_type} is unsupported`);
  }

  if (!["UNCONFIRMED", "REPORTED", "CONFIRMED", "DISPUTED"].includes(value.confirmation_state)) {
    fail("event confirmation_state is unsupported");
  }

  plain(value.payload, "event.payload");

  if (value.correction_of !== null && value.correction_of !== undefined) {
    string(value.correction_of, "event.correction_of");
    if (value.correction_of === value.event_id) {
      fail("event cannot correct itself");
    }
  }

  return value;
}

function appointmentActivityType(event, classifyAppointment) {
  if (typeof classifyAppointment !== "function") {
    return {
      status: "REQUIRES_DOMAIN_CONTEXT",
      reason: "APPOINTMENT_STAGE_NOT_IN_CANONICAL_ENVELOPE",
      activityType: null,
    };
  }

  const stage = classifyAppointment(event);
  if (stage !== "INITIAL" && stage !== "CLOSING") {
    fail("classifyAppointment must return INITIAL or CLOSING");
  }

  const completed = event.event_type === "APPOINTMENT_HELD";
  return {
    status: "COUNTABLE",
    reason: "CANONICAL_CONFIRMED_APPOINTMENT",
    activityType:
      stage === "INITIAL"
        ? completed
          ? "INITIAL_APPOINTMENT_COMPLETED"
          : "INITIAL_APPOINTMENT_SCHEDULED"
        : completed
          ? "CLOSING_APPOINTMENT_COMPLETED"
          : "CLOSING_APPOINTMENT_SCHEDULED",
  };
}

export function mapCanonicalEventToActivity(eventInput, { classifyAppointment } = {}) {
  const event = assertCanonicalFesActivityEvent(eventInput);

  if (event.confirmation_state === "DISPUTED") {
    return freeze({
      schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
      eventId: event.event_id,
      status: "EXCLUDED",
      reason: "DISPUTED_EVENT",
      activityType: null,
    });
  }

  if (event.event_type === "DUE_ACTION_COMPLETED") {
    if (event.confirmation_state !== "CONFIRMED") {
      return freeze({
        schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
        eventId: event.event_id,
        status: "EXCLUDED",
        reason: "FOLLOW_UP_NOT_CONFIRMED",
        activityType: null,
      });
    }

    return freeze({
      schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
      eventId: event.event_id,
      status: "COUNTABLE",
      reason: "CONFIRMED_DUE_ACTION_COMPLETION",
      activityType: "FOLLOW_UP_COMPLETED",
    });
  }

  if (APPOINTMENT_EVENTS.has(event.event_type)) {
    if (event.confirmation_state !== "CONFIRMED") {
      return freeze({
        schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
        eventId: event.event_id,
        status: "EXCLUDED",
        reason: "APPOINTMENT_NOT_CONFIRMED",
        activityType: null,
      });
    }

    return freeze({
      schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
      eventId: event.event_id,
      ...appointmentActivityType(event, classifyAppointment),
    });
  }

  if (NON_COUNTABLE_EVENTS.has(event.event_type)) {
    return freeze({
      schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
      eventId: event.event_id,
      status: "NOT_A_REPORTABLE_ACTIVITY",
      reason: "EVENT_IS_TIMELINE_EVIDENCE_ONLY",
      activityType: null,
    });
  }

  fail(`event type ${event.event_type} lacks an explicit mapping policy`);
}

export function resolveCountableActivityFacts(eventsInput, options = {}) {
  if (!Array.isArray(eventsInput)) {
    fail("events must be an array");
  }

  const events = eventsInput.map(assertCanonicalFesActivityEvent);
  const eventIds = new Set();
  const idempotencyKeys = new Set();
  const byId = new Map();

  for (const event of events) {
    if (eventIds.has(event.event_id)) fail(`duplicate event_id ${event.event_id}`);
    eventIds.add(event.event_id);
    byId.set(event.event_id, event);
  }

  const corrected = new Set();
  for (const event of events) {
    if (event.correction_of) {
      if (!byId.has(event.correction_of)) {
        fail(`correction target ${event.correction_of} is absent`);
      }
      corrected.add(event.correction_of);
    }
  }

  const facts = [];
  const exclusions = [];

  for (const event of events) {
    if (corrected.has(event.event_id)) {
      exclusions.push(freeze({ eventId: event.event_id, reason: "SUPERSEDED_BY_CORRECTION" }));
      continue;
    }

    if (idempotencyKeys.has(event.idempotency_key)) {
      exclusions.push(freeze({ eventId: event.event_id, reason: "IDEMPOTENT_REPLAY" }));
      continue;
    }
    idempotencyKeys.add(event.idempotency_key);

    const decision = mapCanonicalEventToActivity(event, options);
    if (decision.status === "COUNTABLE") {
      facts.push(freeze({
        eventId: event.event_id,
        tenantId: event.tenant_id,
        occurredAt: event.occurred_at,
        activityType: decision.activityType,
        correctionOf: event.correction_of ?? null,
      }));
    } else {
      exclusions.push(freeze({ eventId: event.event_id, reason: decision.reason }));
    }
  }

  return freeze({
    schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
    facts,
    exclusions,
    boundary: {
      eventTruthAuthority: false,
      activityMappingAuthority: true,
      scoringAuthority: false,
      reportingAggregationAuthority: false,
      aiInterpretationAuthority: false,
      persistenceMutationAuthority: false,
    },
  });
}
