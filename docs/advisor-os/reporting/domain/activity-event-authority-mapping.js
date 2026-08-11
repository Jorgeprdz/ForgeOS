export const ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION =
  "activity-event-authority-mapping.v2";

export const FES_ACTIVITY_EVENT_SCHEMA_VERSION =
  "forge.activity_event.v1";

export const FES_ACTIVITY_EVENT_EXTENSION_VERSION =
  "FES-05B.1";

export const REPORTABLE_ACTIVITY_TYPES = Object.freeze([
  "CONTACT_ATTEMPTED",
  "CONVERSATION_COMPLETED",
  "INITIAL_APPOINTMENT_SCHEDULED",
  "INITIAL_APPOINTMENT_COMPLETED",
  "CLOSING_APPOINTMENT_SCHEDULED",
  "CLOSING_APPOINTMENT_COMPLETED",
  "FOLLOW_UP_COMPLETED",
]);

export const FES_ACTIVITY_EVENT_TYPES = Object.freeze([
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
  "REFERRAL_RECEIVED",
  "CALL_COMPLETED",
  "ADVISOR_REFERRAL_RECEIVED",
  "DUE_ACTION_CREATED",
  "DUE_ACTION_RESCHEDULED",
  "DUE_ACTION_COMPLETED",
  "MESSAGE_DRAFT_GENERATED",
  "MESSAGE_DRAFT_EDITED",
  "MESSAGE_DRAFT_APPROVED",
  "MESSAGE_SENT_CONFIRMED",
  "PROSPECT_REPLIED_CONFIRMED",
  "OBJECTION_CAPTURED",
  "OBJECTION_ANALYSIS_GENERATED",
  "OBJECTION_RESPONSE_GENERATED",
  "OBJECTION_RESPONSE_EDITED",
  "OBJECTION_RESPONSE_APPROVED",
  "OBJECTION_RESPONSE_USED",
  "OBJECTION_OUTCOME_CONFIRMED",
  "CALL_CONNECTED_CONFIRMED",
  "CALL_NOT_ANSWERED_CONFIRMED",
  "CALL_CONTEXT_ADDED",
  "QUOTE_STARTED",
  "QUOTE_PREPARED",
  "QUOTE_REVIEWED",
  "PRESENTATION_HELD_CONFIRMED",
  "PRODUCT_QUESTION_CAPTURED",
  "PROPOSAL_REQUESTED_CONFIRMED",
]);

const APPOINTMENT_EVENTS = new Set([
  "APPOINTMENT_SCHEDULED",
  "APPOINTMENT_HELD",
]);

const PRODUCTIVITY_ONLY_EVENTS = new Set([
  "REFERRAL_RECEIVED",
  "ADVISOR_REFERRAL_RECEIVED",
]);

const DIRECT_ACTIVITY_MAP = Object.freeze({
  DUE_ACTION_COMPLETED: Object.freeze([
    "FOLLOW_UP_COMPLETED",
  ]),
  MESSAGE_SENT_CONFIRMED: Object.freeze([
    "CONTACT_ATTEMPTED",
  ]),
  CALL_NOT_ANSWERED_CONFIRMED: Object.freeze([
    "CONTACT_ATTEMPTED",
  ]),
  CALL_CONNECTED_CONFIRMED: Object.freeze([
    "CONTACT_ATTEMPTED",
    "CONVERSATION_COMPLETED",
  ]),
  CALL_COMPLETED: Object.freeze([
    "CONTACT_ATTEMPTED",
    "CONVERSATION_COMPLETED",
  ]),
});

const NON_COUNTABLE_EVENTS = new Set(
  FES_ACTIVITY_EVENT_TYPES.filter(
    (eventType) =>
      !APPOINTMENT_EVENTS.has(eventType) &&
      !PRODUCTIVITY_ONLY_EVENTS.has(eventType) &&
      !Object.prototype.hasOwnProperty.call(
        DIRECT_ACTIVITY_MAP,
        eventType,
      ),
  ),
);

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

function instant(value, label) {
  const normalized = string(value, label);
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    fail(`${label} must be an ISO instant`);
  }
  return parsed.toISOString();
}

function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function decision({
  eventId,
  status,
  reason,
  activityTypes = [],
}) {
  const normalizedTypes = [...activityTypes];
  return freeze({
    schemaVersion: ACTIVITY_EVENT_AUTHORITY_MAPPING_SCHEMA_VERSION,
    eventId,
    status,
    reason,
    activityType:
      normalizedTypes.length === 1
        ? normalizedTypes[0]
        : null,
    activityTypes: normalizedTypes,
  });
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
  instant(value.occurred_at, "event.occurred_at");
  instant(value.recorded_at, "event.recorded_at");

  if (!FES_ACTIVITY_EVENT_TYPES.includes(value.event_type)) {
    fail(`event type ${value.event_type} is unsupported`);
  }

  if (
    ![
      "UNCONFIRMED",
      "REPORTED",
      "CONFIRMED",
      "DISPUTED",
    ].includes(value.confirmation_state)
  ) {
    fail("event confirmation_state is unsupported");
  }

  plain(value.actor, "event.actor");
  string(value.actor.type, "event.actor.type");
  string(value.actor.id, "event.actor.id");
  plain(value.payload, "event.payload");

  if (value.correction_of !== null && value.correction_of !== undefined) {
    string(value.correction_of, "event.correction_of");
    if (value.correction_of === value.event_id) {
      fail("event cannot correct itself");
    }
  }

  return value;
}

function appointmentStageFromEnvelope(event) {
  const purpose = event?.payload?.appointment_purpose;
  if (purpose === "INITIAL" || purpose === "CLOSING") return purpose;
  if (purpose === "OTHER") return "OTHER";
  return null;
}

function appointmentActivityTypes(event, classifyAppointment) {
  let stage = appointmentStageFromEnvelope(event);

  if (stage === "OTHER") {
    return decision({
      eventId: event.event_id,
      status: "NOT_A_REPORTABLE_ACTIVITY",
      reason: "APPOINTMENT_PURPOSE_NOT_IN_ACTIVITY_FUNNEL",
    });
  }

  if (!stage && typeof classifyAppointment === "function") {
    stage = classifyAppointment(event);
    if (stage !== "INITIAL" && stage !== "CLOSING") {
      fail("classifyAppointment must return INITIAL or CLOSING");
    }
  }

  if (!stage) {
    return decision({
      eventId: event.event_id,
      status: "REQUIRES_DOMAIN_CONTEXT",
      reason: "APPOINTMENT_STAGE_NOT_IN_CANONICAL_ENVELOPE",
    });
  }

  const completed = event.event_type === "APPOINTMENT_HELD";
  return decision({
    eventId: event.event_id,
    status: "COUNTABLE",
    reason: "CANONICAL_CONFIRMED_APPOINTMENT",
    activityTypes: [
      stage === "INITIAL"
        ? completed
          ? "INITIAL_APPOINTMENT_COMPLETED"
          : "INITIAL_APPOINTMENT_SCHEDULED"
        : completed
          ? "CLOSING_APPOINTMENT_COMPLETED"
          : "CLOSING_APPOINTMENT_SCHEDULED",
    ],
  });
}

export function mapCanonicalEventToActivity(
  eventInput,
  { classifyAppointment } = {},
) {
  const event = assertCanonicalFesActivityEvent(eventInput);

  if (event.confirmation_state === "DISPUTED") {
    return decision({
      eventId: event.event_id,
      status: "EXCLUDED",
      reason: "DISPUTED_EVENT",
    });
  }

  if (PRODUCTIVITY_ONLY_EVENTS.has(event.event_type)) {
    return decision({
      eventId: event.event_id,
      status: "NOT_A_REPORTABLE_ACTIVITY",
      reason: "PRODUCTIVITY_FACT_NOT_REP_ACTIVITY",
    });
  }

  const directTypes = DIRECT_ACTIVITY_MAP[event.event_type];
  if (directTypes) {
    if (event.confirmation_state !== "CONFIRMED") {
      return decision({
        eventId: event.event_id,
        status: "EXCLUDED",
        reason: "DIRECT_ACTIVITY_NOT_CONFIRMED",
      });
    }

    return decision({
      eventId: event.event_id,
      status: "COUNTABLE",
      reason: "CANONICAL_CONFIRMED_ACTIVITY_RESULT",
      activityTypes: directTypes,
    });
  }

  if (APPOINTMENT_EVENTS.has(event.event_type)) {
    if (event.confirmation_state !== "CONFIRMED") {
      return decision({
        eventId: event.event_id,
        status: "EXCLUDED",
        reason: "APPOINTMENT_NOT_CONFIRMED",
      });
    }

    return appointmentActivityTypes(event, classifyAppointment);
  }

  if (NON_COUNTABLE_EVENTS.has(event.event_type)) {
    return decision({
      eventId: event.event_id,
      status: "NOT_A_REPORTABLE_ACTIVITY",
      reason: "EVENT_IS_TIMELINE_EVIDENCE_ONLY",
    });
  }

  fail(`event type ${event.event_type} lacks an explicit mapping policy`);
}

function eventOrder(left, right) {
  const recorded =
    new Date(left.recorded_at).getTime() -
    new Date(right.recorded_at).getTime();
  if (recorded !== 0) return recorded;
  return left.event_id.localeCompare(right.event_id);
}

export function resolveCountableActivityFacts(eventsInput, options = {}) {
  if (!Array.isArray(eventsInput)) {
    fail("events must be an array");
  }

  const events = eventsInput
    .map(assertCanonicalFesActivityEvent)
    .sort(eventOrder);
  const eventIds = new Set();
  const byId = new Map();

  for (const event of events) {
    if (eventIds.has(event.event_id)) {
      fail(`duplicate event_id ${event.event_id}`);
    }
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

  const replayKeys = new Set();
  const facts = [];
  const exclusions = [];

  for (const event of events) {
    if (corrected.has(event.event_id)) {
      exclusions.push(freeze({
        eventId: event.event_id,
        eventType: event.event_type,
        reason: "SUPERSEDED_BY_CORRECTION",
      }));
      continue;
    }

    const replayKey = [
      event.event_type,
      event.idempotency_key,
    ].join("\u001f");

    if (replayKeys.has(replayKey)) {
      exclusions.push(freeze({
        eventId: event.event_id,
        eventType: event.event_type,
        reason: "IDEMPOTENT_REPLAY",
      }));
      continue;
    }
    replayKeys.add(replayKey);

    const mapped = mapCanonicalEventToActivity(event, options);
    if (mapped.status === "COUNTABLE") {
      for (const activityType of mapped.activityTypes) {
        facts.push(freeze({
          factId: `${event.event_id}:${activityType}`,
          eventId: event.event_id,
          eventType: event.event_type,
          tenantId: event.tenant_id,
          occurredAt: new Date(event.occurred_at).toISOString(),
          recordedAt: new Date(event.recorded_at).toISOString(),
          activityType,
          correctionOf: event.correction_of ?? null,
        }));
      }
    } else {
      exclusions.push(freeze({
        eventId: event.event_id,
        eventType: event.event_type,
        reason: mapped.reason,
      }));
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
