import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  PILOT_METRIC_DEFINITIONS,
  summarizeCommercialPilotEvidence,
} = require("../platform/business-intelligence/commercial-leverage-pilot-read-model.js");

const advisor = "advisor-017e";
const window = Object.freeze({ from: "2026-08-01T00:00:00.000Z", to: "2026-09-01T00:00:00.000Z" });

function presentation(ref, person, at, key = `presentation:${ref}`) {
  return {
    event_id: `evt_${String(ref).replace(/[^a-f0-9]/gi, "a").padEnd(32, "a").slice(0, 32).toLowerCase()}`,
    event_type: "RECOMMENDATION_PRESENTED",
    tenant_id: advisor,
    subject: { type: "RECOMMENDATION", id: ref },
    source: { type: "SYSTEM_OBSERVED" },
    evidence_strength: "SYSTEM_OBSERVED",
    confirmation_state: "CONFIRMED",
    occurred_at: at,
    recorded_at: at,
    idempotency_key: key,
    payload: { advisor_reference: advisor, recommendation_reference: ref, subject_reference: person, recommendation_version: null },
  };
}

function decision(id, ref, decisionValue, at, extra = {}) {
  return {
    event_id: id,
    event_type: "SALES_NBA_ADVISOR_RESPONSE",
    tenant_id: advisor,
    occurred_at: at,
    recorded_at: at,
    payload: { advisor_reference: advisor, recommendation_reference: ref, recommendation_version: null, decision: decisionValue, ...extra },
  };
}

function action(id, person, at, decisionRef = null, tenant = advisor) {
  return {
    event_id: id,
    event_type: "CALL_COMPLETED",
    tenant_id: tenant,
    occurred_at: at,
    recorded_at: at,
    causation_id: null,
    correlation_id: person,
    payload: { contact_reference: person, ...(decisionRef ? { recommendation_decision_reference: decisionRef } : {}) },
  };
}

function funnel(facts = [], coverage = "COMPLETE") {
  return {
    schema: "COMMERCIAL_FUNNEL_RECONCILIATION_READ_MODEL_017B",
    advisorId: advisor,
    period: window,
    stages: { CONFIRMED_POLICY: { coverage, value: facts.length } },
    facts,
  };
}

const p1 = presentation("rec-a", "person-a", "2026-08-02T10:00:00Z", "presentation:key-a");
const p2 = presentation("rec-b", "person-b", "2026-08-02T11:00:00Z", "presentation:key-b");
const actionable = Object.freeze({ recommendation_action_addressable: true, policy_reference: "POLICY-A", payment_obligation_reference: "OBL-A", action_owner: "CARTERA_030C", action_target_reference: "OBL-A", expected_action: "CONFIRM_PAYMENT" });
const d1 = decision("evt_11111111111111111111111111111111", "rec-a", "ACCEPTED", "2026-08-03T10:00:00Z", actionable);
const d2 = decision("evt_22222222222222222222222222222222", "rec-b", "MODIFIED", "2026-08-03T11:00:00Z", { ...actionable, policy_reference: "POLICY-B", payment_obligation_reference: "OBL-B", action_target_reference: "OBL-B" });
const a1 = action("evt_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "person-a", "2026-08-04T10:00:00Z", d1.event_id);
const sold = {
  factReference: "policy-sale-a", eventType: "POLICY_SOLD_CONFIRMED", stage: "CONFIRMED_POLICY", advisorId: advisor,
  commercialPersonReference: "person-a", identityAuthority: "COMMERCIAL_PERSON", sourceAuthority: "POLICY_SALES_OPERATIONS",
  occurredAt: "2026-08-10T10:00:00Z", evidenceRefs: ["policy-sale-a"],
};

test("action linkage denominator is accepted-only while MODIFIED remains decision evidence", () => {
  const summary = summarizeCommercialPilotEvidence({
    advisorId: advisor,
    observationWindow: window,
    presentationEvents: [p1, { ...p1 }, p2],
    decisionEvents: [d1, d2],
    actionEvents: [a1],
    funnelModel: funnel([sold]),
  });
  assert.equal(summary.recommendationsPresented.value, 2);
  assert.equal(summary.decisionsRecorded.value, 2);
  assert.equal(summary.acceptedCount.value, 1);
  assert.equal(summary.modifiedCount.value, 1);
  assert.equal(summary.acceptanceRate.value, 1);
  assert.equal(summary.actionLinkageEligibleAcceptedCount.value, 1);
  assert.equal(summary.explicitlyLinkedActionCount.value, 1);
  assert.equal(summary.actionAfterAcceptRate.value, 1);
  assert.equal(summary.actionAfterAcceptRate.denominator, 1);
  assert.equal(summary.correlations.decisionToAction.some(item => item.reason === "MODIFIED_NOT_ACTION_LINEAGE_ELIGIBLE"), true);
  assert.equal(summary.actionsWithSubsequentOutcome.value, 1);
  assert.equal(summary.outcomeAfterActionRate.value, 1);
  assert.equal(summary.causalAttribution, false);
  assert.equal(summary.forgeCausedSaleClaim, false);
});

test("temporal or generic correlation is excluded without explicit recommendation_decision_reference", () => {
  const temporal = { ...action("evt_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", "person-a", "2026-08-04T12:00:00Z"), correlation_id: d1.event_id };
  const summary = summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: [p1], decisionEvents: [d1], actionEvents: [temporal], funnelModel: funnel([]) });
  assert.equal(summary.actionAfterAcceptRate.value, 0);
  assert.equal(summary.correlations.decisionToAction[0].state, "TEMPORAL_ASSOCIATION_ONLY");
  assert.equal(summary.temporalOnlyCountsAsAction, false);
});

test("latest eligible human decision owns acceptance state for a presented recommendation", () => {
  const dismissedLater = decision("evt_33333333333333333333333333333333", "rec-a", "DISMISSED", "2026-08-05T10:00:00Z");
  const summary = summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: [p1], decisionEvents: [d1, dismissedLater], actionEvents: [], funnelModel: funnel([]) });
  assert.equal(summary.decisionsRecorded.value, 1);
  assert.equal(summary.acceptedCount.value, 0);
  assert.equal(summary.dismissedCount.value, 1);
  assert.equal(summary.acceptanceRate.value, 0);
  assert.equal(summary.actionAfterAcceptRate.state, "INSUFFICIENT_SAMPLE");
});

test("connected empty presentation source is zero, not unknown, while rates expose insufficient sample", () => {
  const summary = summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: [], decisionEvents: [], actionEvents: [], funnelModel: funnel([]) });
  assert.equal(summary.recommendationsPresented.state, "ZERO");
  assert.equal(summary.recommendationsPresented.value, 0);
  assert.equal(summary.acceptanceRate.state, "INSUFFICIENT_SAMPLE");
  assert.equal(summary.uncertainty.state, "INSUFFICIENT_SAMPLE");
});

test("unavailable presentation source never becomes zero", () => {
  const summary = summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: null, decisionEvents: [], actionEvents: [], funnelModel: funnel([]) });
  assert.equal(summary.recommendationsPresented.state, "SOURCE_UNAVAILABLE");
  assert.equal(summary.acceptanceRate.state, "SOURCE_UNAVAILABLE");
});

test("incomplete existing outcome authority makes outcome rate unavailable rather than zero", () => {
  const summary = summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: [p1], decisionEvents: [d1], actionEvents: [a1], funnelModel: funnel([], "PARTIAL") });
  assert.equal(summary.actionAfterAcceptRate.value, 1);
  assert.equal(summary.outcomeAfterActionRate.state, "SOURCE_UNAVAILABLE");
});

test("cross-advisor action input is blocked", () => {
  assert.throws(() => summarizeCommercialPilotEvidence({ advisorId: advisor, observationWindow: window, presentationEvents: [p1], decisionEvents: [d1], actionEvents: [action("evt_cccccccccccccccccccccccccccccccc", "person-a", "2026-08-04T10:00:00Z", d1.event_id, "advisor-b")], funnelModel: funnel([]) }), /ACTION_CROSS_ADVISOR_BLOCKED/);
});

test("metric contract locks canonical presentations, accepted-only action denominator and noncausal outcome scope", () => {
  assert.match(PILOT_METRIC_DEFINITIONS.ACCEPTANCE_RATE.DENOMINATOR, /canonically presented/i);
  assert.match(PILOT_METRIC_DEFINITIONS.ACTION_AFTER_ACCEPT_RATE.DENOMINATOR, /ACCEPTED/i);
  assert.match(PILOT_METRIC_DEFINITIONS.ACTION_AFTER_ACCEPT_RATE.ELIGIBILITY, /temporal-only excluded/i);
  assert.match(PILOT_METRIC_DEFINITIONS.OUTCOME_AFTER_ACTION_RATE.ELIGIBILITY, /CONFIRMED_POLICY/);
});
