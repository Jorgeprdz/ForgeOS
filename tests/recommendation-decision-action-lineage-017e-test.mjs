import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  resolveDecisionActionLineage,
  payloadWithDecisionLineage,
} = require("../platform/event-evidence/recommendation-decision-action-lineage.js");

const context = Object.freeze({
  advisorId: "advisor-017e",
  recommendationReference: "nash:person-017e:call",
  decisionEventId: "evt_0123456789abcdef0123456789abcdef",
  decisionOccurredAt: "2026-08-11T18:00:00Z",
  decision: "ACCEPTED",
  subjectType: "PERSON",
  subjectReference: "person-017e",
  actionTarget: "person-017e",
});

function resolve(overrides = {}) {
  return resolveDecisionActionLineage({
    context,
    advisorId: "advisor-017e",
    eventType: "CALL_COMPLETED",
    payload: { activity_reference: "activity-1", contact_reference: "person-017e" },
    occurredAt: "2026-08-11T18:05:00Z",
    ...overrides,
  });
}

test("accepted real call with exact advisor, identity and chronology carries explicit lineage", () => {
  const result = resolve();
  assert.equal(result.state, "EXPLICIT_LINEAGE");
  assert.equal(result.recommendationDecisionReference, context.decisionEventId);
  assert.equal(result.causalAttribution, false);
  const payload = payloadWithDecisionLineage({ activity_reference: "activity-1", contact_reference: "person-017e" }, result);
  assert.equal(payload.recommendation_decision_reference, context.decisionEventId);
});

test("modified decision is eligible but deferred and dismissed are not", () => {
  assert.equal(resolve({ context: { ...context, decision: "MODIFIED" } }).state, "EXPLICIT_LINEAGE");
  assert.equal(resolve({ context: { ...context, decision: "DEFERRED" } }).state, "NO_ELIGIBLE_DECISION");
  assert.equal(resolve({ context: { ...context, decision: "DISMISSED" } }).state, "NO_ELIGIBLE_DECISION");
});

test("navigation without a transported decision is not an action", () => {
  const result = resolve({ context: null });
  assert.equal(result.state, "NO_ELIGIBLE_DECISION");
  assert.equal(payloadWithDecisionLineage({ contact_reference: "person-017e" }, result).recommendation_decision_reference, undefined);
});

test("cross-advisor lineage is unresolved", () => {
  assert.equal(resolve({ advisorId: "advisor-b" }).state, "UNRESOLVED");
  assert.equal(resolve({ advisorId: "advisor-b" }).reason, "ADVISOR_MISMATCH");
});

test("wrong commercial identity and wrong action target are unresolved", () => {
  assert.equal(resolve({ payload: { contact_reference: "person-other" } }).reason, "COMMERCIAL_IDENTITY_MISMATCH");
  assert.equal(resolve({ context: { ...context, actionTarget: "person-other" } }).reason, "ACTION_TARGET_MISMATCH");
});

test("action before decision never links", () => {
  const result = resolve({ occurredAt: "2026-08-11T17:59:59Z" });
  assert.equal(result.state, "UNRESOLVED");
  assert.equal(result.reason, "ACTION_PRECEDES_DECISION");
});

test("an action whose identity cannot be canonically compared remains real but unlinked", () => {
  const result = resolve({ eventType: "APPOINTMENT_SCHEDULED", payload: { appointment_reference: "appt-1" } });
  assert.equal(result.state, "UNRESOLVED");
  assert.equal(result.reason, "ACTION_IDENTITY_NOT_CANONICALLY_COMPARABLE");
  assert.equal(payloadWithDecisionLineage({ appointment_reference: "appt-1" }, result).recommendation_decision_reference, undefined);
});