"use strict";

const { summarizeCommercialPilotEvidence } = require("./commercial-leverage-pilot-read-model.js");

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function requiredString(value, code) {
  if (typeof value !== "string" || !value.trim()) fail(code);
  return value.trim();
}

function normalizedInstant(value, code) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code);
  return new Date(value).toISOString();
}

function validateLinkedDecision({ row, advisorId, decisionById, confirmedAt }) {
  const decisionReference = typeof row.recommendation_decision_reference === "string"
    ? row.recommendation_decision_reference.trim()
    : "";
  if (!decisionReference) return null;

  const decision = decisionById.get(decisionReference);
  if (!decision) fail("CARTERA030C_PILOT_DECISION_REFERENCE_UNRESOLVED");
  if (decision.tenant_id !== advisorId) fail("CARTERA030C_PILOT_DECISION_CROSS_ADVISOR_BLOCKED");
  if (decision.event_type !== "SALES_NBA_ADVISOR_RESPONSE") fail("CARTERA030C_PILOT_DECISION_EVENT_TYPE_INVALID");
  if (decision.payload?.advisor_reference !== advisorId) fail("CARTERA030C_PILOT_DECISION_ADVISOR_INVALID");
  if (decision.payload?.decision !== "ACCEPTED") fail("CARTERA030C_PILOT_DECISION_NOT_ACCEPTED");
  if (decision.payload?.recommendation_action_addressable !== true) fail("CARTERA030C_PILOT_DECISION_NOT_ACTION_ADDRESSABLE");
  if (decision.payload?.action_owner !== "CARTERA_030C") fail("CARTERA030C_PILOT_ACTION_OWNER_INVALID");
  if (decision.payload?.action_target_type !== "PAYMENT_OBLIGATION") fail("CARTERA030C_PILOT_ACTION_TARGET_TYPE_INVALID");
  if (decision.payload?.expected_action !== "CONFIRM_PAYMENT") fail("CARTERA030C_PILOT_EXPECTED_ACTION_INVALID");
  if (decision.payload?.policy_reference !== row.policy_reference) fail("CARTERA030C_PILOT_POLICY_IDENTITY_MISMATCH");
  if (Date.parse(decision.occurred_at) > Date.parse(confirmedAt)) fail("CARTERA030C_PILOT_ACTION_PRECEDES_DECISION");
  return decisionReference;
}

function normalizeCartera030cPaymentEvents({ advisorId, paymentEvents, decisionEvents = [] } = {}) {
  const advisor = requiredString(advisorId, "CARTERA030C_PILOT_ADVISOR_REQUIRED");
  if (!Array.isArray(paymentEvents)) fail("CARTERA030C_PILOT_PAYMENT_EVENTS_ARRAY_REQUIRED");
  if (!Array.isArray(decisionEvents)) fail("CARTERA030C_PILOT_DECISION_EVENTS_ARRAY_REQUIRED");

  const decisionById = new Map();
  for (const decision of decisionEvents) {
    if (!decision || typeof decision !== "object" || Array.isArray(decision)) fail("CARTERA030C_PILOT_DECISION_EVENT_INVALID");
    const eventId = requiredString(decision.event_id, "CARTERA030C_PILOT_DECISION_EVENT_ID_REQUIRED");
    decisionById.set(eventId, decision);
  }

  const seen = new Set();
  return paymentEvents.map(row => {
    if (!row || typeof row !== "object" || Array.isArray(row)) fail("CARTERA030C_PILOT_PAYMENT_EVENT_INVALID");
    if (row.advisor_id !== advisor) fail("CARTERA030C_PILOT_PAYMENT_CROSS_ADVISOR_BLOCKED");
    if (row.confirmation_state !== "CONFIRMED") fail("CARTERA030C_PILOT_PAYMENT_NOT_CONFIRMED");

    const eventId = requiredString(row.payment_event_reference, "CARTERA030C_PILOT_PAYMENT_EVENT_REFERENCE_REQUIRED");
    const policyReference = requiredString(row.policy_reference, "CARTERA030C_PILOT_POLICY_REFERENCE_REQUIRED");
    const confirmedAt = normalizedInstant(row.confirmed_at, "CARTERA030C_PILOT_CONFIRMED_AT_INVALID");
    const recordedAt = normalizedInstant(row.created_at || row.confirmed_at, "CARTERA030C_PILOT_RECORDED_AT_INVALID");
    if (seen.has(eventId)) fail("CARTERA030C_PILOT_DUPLICATE_PAYMENT_EVENT_REFERENCE");
    seen.add(eventId);

    const decisionReference = validateLinkedDecision({ row, advisorId: advisor, decisionById, confirmedAt });
    return Object.freeze({
      event_id: eventId,
      event_type: "CARTERA_030C_CONFIRMED_PAYMENT",
      tenant_id: advisor,
      occurred_at: confirmedAt,
      recorded_at: recordedAt,
      source: Object.freeze({ type: "PRODUCTIVE_ACTION_AUTHORITY", authority: "CARTERA_030C" }),
      payload: Object.freeze({
        action_owner: "CARTERA_030C",
        expected_action: "CONFIRM_PAYMENT",
        policy_reference: policyReference,
        payment_evidence_reference: typeof row.payment_evidence_reference === "string" && row.payment_evidence_reference.trim()
          ? row.payment_evidence_reference.trim()
          : null,
        recommendation_decision_reference: decisionReference,
      }),
    });
  });
}

function mergeActions(actionEvents, paymentActions) {
  const byId = new Map();
  for (const action of [...actionEvents, ...paymentActions]) {
    const eventId = requiredString(action?.event_id, "CARTERA030C_PILOT_ACTION_EVENT_ID_REQUIRED");
    const prior = byId.get(eventId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(action)) fail("CARTERA030C_PILOT_ACTION_IDENTITY_COLLISION");
    byId.set(eventId, action);
  }
  return [...byId.values()];
}

function summarizeCommercialPilotEvidenceWithCartera030c(input = {}) {
  const {
    advisorId,
    decisionEvents = null,
    actionEvents = null,
    paymentEvents = null,
    ...rest
  } = input;

  const genericSourceAvailable = Array.isArray(actionEvents);
  const paymentSourceAvailable = Array.isArray(paymentEvents);
  const actionSourceAvailable = genericSourceAvailable || paymentSourceAvailable;
  const normalizedPaymentActions = paymentSourceAvailable
    ? normalizeCartera030cPaymentEvents({
        advisorId,
        paymentEvents,
        decisionEvents: Array.isArray(decisionEvents) ? decisionEvents : [],
      })
    : [];
  const normalizedActions = actionSourceAvailable
    ? mergeActions(genericSourceAvailable ? actionEvents : [], normalizedPaymentActions)
    : null;

  return summarizeCommercialPilotEvidence({
    advisorId,
    decisionEvents,
    actionEvents: normalizedActions,
    ...rest,
  });
}

module.exports = {
  normalizeCartera030cPaymentEvents,
  summarizeCommercialPilotEvidenceWithCartera030c,
};
