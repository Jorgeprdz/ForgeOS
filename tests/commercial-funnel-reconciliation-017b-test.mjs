import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  createCommercialFunnelReconciliationReadModel,
  compareCommercialFunnelPeriods,
} = require("../platform/business-intelligence/commercial-funnel-reconciliation-read-model.js");

const advisorId = "advisor-017b";
const identityAuthority = "COMMERCIAL_PERSON_IDENTITY";
const complete = Object.freeze({
  CONTACT: "COMPLETE",
  CONVERSATION: "COMPLETE",
  APPOINTMENT: "COMPLETE",
  PRESENTATION: "COMPLETE",
  APPLICATION: "COMPLETE",
  CONFIRMED_POLICY: "COMPLETE",
});

function fact(eventType, person, sourceAuthority, day, extra = {}) {
  return {
    factReference: `${eventType}:${person}:${day}`,
    eventType,
    advisorId,
    commercialPersonReference: person,
    identityAuthority,
    sourceAuthority,
    occurredAt: `2026-08-${String(day).padStart(2, "0")}T12:00:00.000Z`,
    confirmationState: "CONFIRMED",
    evidenceRefs: [`evidence:${eventType}:${person}:${day}`],
    ...extra,
  };
}

function model({ facts, coverageByStage = complete, from = "2026-08-01T00:00:00.000Z", to = "2026-09-01T00:00:00.000Z" }) {
  return createCommercialFunnelReconciliationReadModel({
    advisorId,
    period: { from, to },
    coverageByStage,
    facts,
    generatedAt: "2026-09-01T01:00:00.000Z",
  });
}

const current = model({ facts: [
  fact("CALL_COMPLETED", "person-1", "EVENT_EVIDENCE_FES", 2),
  fact("CALL_COMPLETED", "person-2", "EVENT_EVIDENCE_FES", 3),
  fact("APPOINTMENT_HELD", "person-1", "EVENT_EVIDENCE_FES", 5),
  fact("PRESENTATION_HELD_CONFIRMED", "person-1", "EVENT_EVIDENCE_FES", 6),
  fact("APPLICATION_SUBMITTED", "person-1", "POLICY_SALES_OPERATIONS", 7),
  fact("POLICY_SOLD_CONFIRMED", "person-1", "POLICY_SALES_OPERATIONS", 10),
] });

assert.equal(current.stages.CONTACT.value, 2);
assert.equal(current.stages.CONVERSATION.value, 2);
assert.equal(current.stages.CONFIRMED_POLICY.value, 1);
assert.equal(current.transitions.find(item => item.transition === "CONTACT_TO_CONVERSATION").value, 1);
assert.equal(current.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").value, 0.5);
assert.equal(current.outputPerHour.state, "NOT_MEASURABLE");
assert.equal(current.globalProductivityScoreCreated, false);
assert.equal(current.causalAttributionCreated, false);

const cohortSafe = model({ facts: [
  fact("CALL_COMPLETED", "person-upstream", "EVENT_EVIDENCE_FES", 2),
  fact("APPOINTMENT_COMPLETED", "person-downstream-only", "PROSPECT_TIMELINE", 5),
] });
assert.equal(cohortSafe.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").numerator, 0);
assert.equal(cohortSafe.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").value, 0);

const temporalOrderSafe = model({ facts: [
  fact("APPOINTMENT_COMPLETED", "person-1", "PROSPECT_TIMELINE", 2),
  fact("CALL_COMPLETED", "person-1", "EVENT_EVIDENCE_FES", 5),
] });
assert.equal(temporalOrderSafe.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").numerator, 0);
assert.equal(temporalOrderSafe.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").value, 0);

const partialApplication = model({
  facts: [fact("PROPOSAL_PRESENTED", "person-1", "PROSPECT_TIMELINE", 6)],
  coverageByStage: { ...complete, APPLICATION: "NOT_CONNECTED" },
});
assert.equal(partialApplication.baselineState, "PARTIAL");
assert.equal(partialApplication.stages.APPLICATION.value, null);
assert.equal(
  partialApplication.transitions.find(item => item.transition === "PRESENTATION_TO_APPLICATION").state,
  "INCOMPLETE",
);

const mixedIdentity = model({
  facts: [
    fact("CALL_COMPLETED", "person-1", "EVENT_EVIDENCE_FES", 2),
    fact("APPOINTMENT_COMPLETED", "person-1", "PROSPECT_TIMELINE", 5, { identityAuthority: "PIPELINE_PROSPECT_IDENTITY" }),
  ],
});
assert.equal(
  mixedIdentity.transitions.find(item => item.transition === "CONVERSATION_TO_APPOINTMENT").state,
  "NOT_COMPARABLE",
);

assert.throws(() => model({ facts: [
  fact("APPLICATION_SUBMITTED", "person-1", "EVENT_EVIDENCE_FES", 7),
] }), /COMMERCIAL_FUNNEL_SOURCE_AUTHORITY_MISMATCH/);

assert.throws(() => model({ facts: [
  fact("CALL_COMPLETED", "person-1", "EVENT_EVIDENCE_FES", 2, { confirmationState: "REPORTED" }),
] }), /COMMERCIAL_FUNNEL_UNCONFIRMED_FACT_REJECTED/);

const baseline = createCommercialFunnelReconciliationReadModel({
  advisorId,
  period: { from: "2026-07-01T00:00:00.000Z", to: "2026-08-01T00:00:00.000Z" },
  coverageByStage: complete,
  facts: [
    { ...fact("CALL_COMPLETED", "person-1", "EVENT_EVIDENCE_FES", 2), occurredAt: "2026-07-02T12:00:00.000Z" },
    { ...fact("CALL_COMPLETED", "person-2", "EVENT_EVIDENCE_FES", 3), occurredAt: "2026-07-03T12:00:00.000Z" },
  ],
  generatedAt: "2026-08-01T01:00:00.000Z",
});
const comparison = compareCommercialFunnelPeriods({ baseline, current });
assert.equal(comparison.causalAttributionCreated, false);
assert.equal(comparison.forgeUpliftClaimCreated, false);
assert.equal(comparison.transitions.CONVERSATION_TO_APPOINTMENT.state, "KNOWN");
assert.equal(comparison.transitions.CONVERSATION_TO_APPOINTMENT.change, 0.5);

console.log("COMMERCIAL_FUNNEL_RECONCILIATION_017B=PASS cases=8");
