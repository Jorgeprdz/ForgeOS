import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { captureAdvisorResponse } = require("../advisor-os/sales-pipeline/explained-sales-nba.js");
const canonical = require("../platform/event-evidence/canonical-activity-event-contract.js");
const { createAdvisorDecisionEvidence, persistAdvisorDecision } = require("../platform/event-evidence/sales-nba-advisor-response-evidence.js");
const { reconcileDecisionToAction } = require("../platform/business-intelligence/commercial-leverage-pilot-read-model.js");

const recommendation = Object.freeze({ recommendationId: "NBA_017c", recommendationAvailable: true, advisorId: "advisor-017c", domain: "ADVISOR_OS_SALES", sourceAuthority: "NBA_REASON_WHY", recommendationVersion: "017c.1", subjectType: "PROSPECT", subjectId: "prospect-017c", opportunityId: "opportunity-017c" });
const response = value => captureAdvisorResponse({ recommendationId: recommendation.recommendationId, advisorId: recommendation.advisorId, response: value, respondedAt: "2026-08-11T12:00:00.000Z" });

test("canonical durable decision preserves recommendation ownership and human authority", () => {
  const event = createAdvisorDecisionEvidence({ recommendation, response: response("ACCEPTED"), decisionReference: "decision-017c-1" });
  assert.equal(event.event_type, "SALES_NBA_ADVISOR_RESPONSE");
  assert.equal(event.subject.type, "RECOMMENDATION");
  assert.equal(event.payload.decision, "ACCEPTED");
  assert.equal(event.payload.recommendation_source, "NBA_REASON_WHY");
  assert.equal(event.payload.recommendation_action_addressable, undefined);
  assert.equal(event.safety_flags.executes_business_action, false);
  assert.equal(event.learning_eligibility, false);
  assert.equal(canonical.validateCanonicalActivityEvent(event).valid, true);
});

test("legacy responses normalize without treating execution as a decision", () => {
  assert.equal(createAdvisorDecisionEvidence({ recommendation, response: response("REJECTED"), decisionReference: "decision-017c-2" }).payload.decision, "DISMISSED");
  assert.equal(createAdvisorDecisionEvidence({ recommendation, response: response("SNOOZED"), decisionReference: "decision-017c-3" }).payload.decision, "DEFERRED");
  assert.throws(() => createAdvisorDecisionEvidence({ recommendation, response: response("EXECUTED"), decisionReference: "decision-017c-4" }), /EXECUTION_IS_NOT_DECISION/);
});

test("advisor and recommendation identity are isolated", () => {
  assert.throws(() => createAdvisorDecisionEvidence({ recommendation, response: { ...response("ACCEPTED"), advisorId: "advisor-b" }, decisionReference: "decision-017c-5" }), /RECOMMENDATION_RESPONSE_ADVISOR_MISMATCH/);
  assert.throws(() => createAdvisorDecisionEvidence({ recommendation, response: { ...response("ACCEPTED"), recommendationId: "NBA_other" }, decisionReference: "decision-017c-6" }), /RECOMMENDATION_RESPONSE_ID_MISMATCH/);
  assert.throws(() => createAdvisorDecisionEvidence({ recommendation: { ...recommendation, advisorId: null }, response: response("ACCEPTED"), decisionReference: "decision-017c-no-owner" }), /RECOMMENDATION_ADVISOR_REQUIRED/);
});

test("retry is idempotent and correction remains append-only", async () => {
  const entries = new Map();
  const runtime = { async appendCanonicalEvent({ canonical_event }) { const prior = entries.get(canonical_event.event_id); entries.set(canonical_event.event_id, canonical_event); return { status: prior ? "IDEMPOTENT_REPLAY" : "APPENDED" }; } };
  const input = { runtime, recommendation, response: response("ACCEPTED"), decisionReference: "decision-017c-7" };
  const first = await persistAdvisorDecision(input);
  const retry = await persistAdvisorDecision(input);
  assert.equal(first.event.event_id, retry.event.event_id);
  assert.equal(retry.result.status, "IDEMPOTENT_REPLAY");
  const correction = createAdvisorDecisionEvidence({ recommendation, response: response("REJECTED"), decisionReference: "decision-017c-8", correctionOf: first.event.event_id, correctionReasonCode: "ADVISOR_CHANGED_DECISION" });
  assert.equal(correction.correction_of, first.event.event_id);
  assert.notEqual(correction.event_id, first.event.event_id);
  assert.equal(entries.size, 1);
});

test("only explicit recommendation_decision_reference links a compatible later action", () => {
  const decision = createAdvisorDecisionEvidence({ recommendation, response: response("ACCEPTED"), decisionReference: "decision-017c-9" });
  const action = { event_type: "CALL_COMPLETED", tenant_id: recommendation.advisorId, occurred_at: "2026-08-11T13:00:00.000Z", causation_id: null, payload: { recommendation_decision_reference: decision.event_id } };
  assert.equal(reconcileDecisionToAction({ decisionEvent: decision, actionEvent: action }).state, "EXPLICITLY_LINKED_LATER_ACTION");
  assert.equal(reconcileDecisionToAction({ decisionEvent: decision, actionEvent: { ...action, causation_id: decision.event_id, payload: {} } }).state, "TEMPORAL_ASSOCIATION_ONLY");
  assert.throws(() => reconcileDecisionToAction({ decisionEvent: decision, actionEvent: { ...action, occurred_at: "2026-08-11T11:00:00.000Z" } }), /ACTION_PRECEDES_DECISION/);
});