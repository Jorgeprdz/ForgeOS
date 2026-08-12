"use strict";

(function advisorResponseEvidenceModule(root, factory) {
  const canonical = typeof module !== "undefined" && module.exports
    ? require("./canonical-activity-event-contract")
    : root.ForgeCanonicalActivityEventContractFES01;
  const api = factory(canonical);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ForgeSalesNbaAdvisorResponseEvidence017C = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function advisorResponseEvidenceFactory(canonical) {
if (!canonical) throw new Error("FES01_CANONICAL_EVENT_CONTRACT_REQUIRED");

const RESPONSE_TO_DECISION = Object.freeze({
  ACCEPTED: "ACCEPTED",
  MODIFIED: "MODIFIED",
  REJECTED: "DISMISSED",
  NOT_RELEVANT: "DISMISSED",
  SNOOZED: "DEFERRED",
});

function fail(code) { const error = new TypeError(code); error.code = code; throw error; }
function token(value, code) { const result = String(value || "").trim(); if (!result || result.length > 240) fail(code); return result; }

function cartera030cLineageMetadata(recommendation) {
  if (recommendation?.actionAddressable !== true || recommendation?.actionOwner !== "CARTERA_030C") return Object.freeze({});
  return Object.freeze({
    policy_reference: token(recommendation.policyReference, "RECOMMENDATION_POLICY_REFERENCE_REQUIRED"),
    signal_reference: token(recommendation.signalReference, "RECOMMENDATION_SIGNAL_REFERENCE_REQUIRED"),
    payment_obligation_reference: token(recommendation.paymentObligationReference, "RECOMMENDATION_PAYMENT_OBLIGATION_REFERENCE_REQUIRED"),
    recommendation_action_addressable: true,
    action_owner: "CARTERA_030C",
    action_target_type: token(recommendation.actionTargetType, "RECOMMENDATION_ACTION_TARGET_TYPE_REQUIRED"),
    action_target_reference: token(recommendation.actionTargetReference, "RECOMMENDATION_ACTION_TARGET_REFERENCE_REQUIRED"),
    expected_action: token(recommendation.expectedAction, "RECOMMENDATION_EXPECTED_ACTION_REQUIRED"),
    smallest_useful_action: token(recommendation.smallestUsefulAction, "RECOMMENDATION_SMALLEST_USEFUL_ACTION_REQUIRED"),
  });
}

function createAdvisorDecisionEvidence({ recommendation, response, decisionReference, recordedAt, correctionOf = null, correctionReasonCode = null } = {}) {
  if (!recommendation || recommendation.recommendationAvailable === false) fail("RECOMMENDATION_REQUIRED");
  const recommendationId = token(recommendation.recommendationId, "RECOMMENDATION_ID_REQUIRED");
  const advisorId = token(recommendation.advisorId, "RECOMMENDATION_ADVISOR_REQUIRED");
  if (!response || response.recommendationId !== recommendationId) fail("RECOMMENDATION_RESPONSE_ID_MISMATCH");
  if (response.advisorId !== advisorId) fail("RECOMMENDATION_RESPONSE_ADVISOR_MISMATCH");
  const decision = RESPONSE_TO_DECISION[response.response];
  if (!decision) fail(response.response === "EXECUTED" ? "EXECUTION_IS_NOT_DECISION" : "ADVISOR_RESPONSE_UNSUPPORTED");
  const decidedAt = new Date(response.respondedAt).toISOString();
  const payload = {
    recommendation_reference: recommendationId,
    recommendation_source: token(recommendation.sourceAuthority || "NBA_REASON_WHY", "RECOMMENDATION_SOURCE_REQUIRED"),
    recommendation_domain: token(recommendation.domain, "RECOMMENDATION_DOMAIN_REQUIRED"),
    advisor_reference: advisorId,
    decision,
    original_response: response.response,
    recommendation_version: recommendation.recommendationVersion || null,
    commercial_person_reference: recommendation.commercialPersonReference || null,
    prospect_reference: recommendation.subjectType === "PROSPECT" ? recommendation.subjectId : null,
    opportunity_reference: recommendation.opportunityId || null,
    deferred_until: response.deferredUntil || null,
    ...cartera030cLineageMetadata(recommendation),
  };
  const input = {
    event_type: "SALES_NBA_ADVISOR_RESPONSE", tenant_id: advisorId,
    actor: { type: "ADVISOR", id: advisorId }, subject: { type: "RECOMMENDATION", id: recommendationId },
    source: { type: "ADVISOR_CONFIRMED", reference: token(decisionReference, "DECISION_REFERENCE_REQUIRED"), channel: "FORGE_UI" },
    evidence_strength: "HUMAN_CONFIRMED", occurred_at: decidedAt, recorded_at: recordedAt || decidedAt,
    effective_period: null, causation_id: recommendationId, correlation_id: decisionReference,
    idempotency_key: token(decisionReference, "DECISION_REFERENCE_REQUIRED"), privacy_class: "PRIVATE",
    payload, provenance: { source_system: "forge-advisor-os", source_record_id: decisionReference, captured_via: "FORGE_UI", evidence_references: [decisionReference], ...(correctionReasonCode ? { correction_reason_code: correctionReasonCode } : {}) },
    confirmation_state: "CONFIRMED", correction_of: correctionOf, safety_flags: { ...canonical.DEFAULT_SAFETY_FLAGS },
  };
  return canonical.createCanonicalActivityEvent(input);
}

async function persistAdvisorDecision({ runtime, ...input } = {}) {
  if (!runtime || typeof runtime.appendCanonicalEvent !== "function") fail("FES_LEDGER_RUNTIME_REQUIRED");
  const event = createAdvisorDecisionEvidence(input);
  const result = await runtime.appendCanonicalEvent({ canonical_event: event, evidence_references: [{ reference_id: event.source.reference, reference_type: "USER_CONFIRMATION", source_system: "forge-advisor-os", captured_at: event.recorded_at, privacy_class: "PRIVATE", checksum: `confirmation:${event.event_id}`, metadata: { confirmation_actor_type: "ADVISOR" } }], appended_at: event.recorded_at });
  return Object.freeze({ event, result, activityExecuted: false, outcomeCreated: false });
}

return Object.freeze({ RESPONSE_TO_DECISION, createAdvisorDecisionEvidence, persistAdvisorDecision });
});