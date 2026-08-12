"use strict";

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function token(value, code) {
  const normalized = String(value || "").trim();
  if (!normalized) fail(code);
  return normalized;
}

function optionalToken(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function instant(value, code) {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) fail(code);
  return new Date(value).toISOString();
}

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function projectCartera030cPaymentAction({ advisorId, response } = {}) {
  const advisor = token(advisorId, "CARTERA030C_ACTION_ADVISOR_REQUIRED");
  if (!response || typeof response !== "object" || Array.isArray(response)) fail("CARTERA030C_ACTION_RESPONSE_REQUIRED");
  if (response.paymentEventReadAfterWriteVerified !== true) fail("CARTERA030C_ACTION_PERSISTENCE_NOT_VERIFIED");

  const paymentEventReference = token(response.paymentEventReference, "CARTERA030C_ACTION_EVENT_REFERENCE_REQUIRED");
  const policyReference = token(response.policyReference, "CARTERA030C_ACTION_POLICY_REFERENCE_REQUIRED");
  const paymentEvidenceReference = token(response.paymentEvidenceReference, "CARTERA030C_ACTION_PAYMENT_EVIDENCE_REFERENCE_REQUIRED");
  const occurredAt = instant(response.paymentEventConfirmedAt, "CARTERA030C_ACTION_OCCURRED_AT_REQUIRED");
  const recommendationDecisionReference = optionalToken(response.recommendationDecisionReference);
  const lineageState = optionalToken(response.recommendationLineageState) || "UNLINKED";
  const actionTargetReference = optionalToken(response.recommendationActionTargetReference);

  if (recommendationDecisionReference && !/^evt_[a-f0-9]{32}$/.test(recommendationDecisionReference)) {
    fail("CARTERA030C_ACTION_DECISION_REFERENCE_INVALID");
  }
  if (recommendationDecisionReference && lineageState !== "EXPLICIT_LINEAGE") {
    fail("CARTERA030C_ACTION_LINEAGE_STATE_INCONSISTENT");
  }
  if (!recommendationDecisionReference && lineageState === "EXPLICIT_LINEAGE") {
    fail("CARTERA030C_ACTION_LINEAGE_REFERENCE_REQUIRED");
  }
  if (recommendationDecisionReference && !actionTargetReference) {
    fail("CARTERA030C_ACTION_TARGET_REQUIRED_FOR_LINEAGE");
  }

  return freeze({
    event_id: paymentEventReference,
    event_type: "CARTERA_030C_PAYMENT_CONFIRMED",
    tenant_id: advisor,
    occurred_at: occurredAt,
    recorded_at: occurredAt,
    action_owner: "CARTERA_030C",
    canonical_activity_event: false,
    source_authority: "CARTERA030C_CONFIRMED_PAYMENT_EVENTS",
    payload: {
      policy_reference: policyReference,
      payment_evidence_reference: paymentEvidenceReference,
      payment_obligation_reference: actionTargetReference,
      ...(recommendationDecisionReference
        ? { recommendation_decision_reference: recommendationDecisionReference }
        : {}),
    },
    recommendation_lineage_state: lineageState,
    causalAttribution: false,
  });
}

module.exports = Object.freeze({ projectCartera030cPaymentAction });
