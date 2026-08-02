"use strict";

const assert = require("assert");
const C = require("../events/advisor-compensation-event-contract");
const E = require("../payout/advisor-compensation-payout-evidence-contract");
const M = require("../payout/advisor-compensation-payout-matcher");
const H = require("../payout/advisor-compensation-payout-confirmation");
const R = require("../payout/advisor-compensation-payout-reconciliation");
const A = require("../payout/advisor-compensation-payout-authority");

let total = 0;
let passed = 0;
function test(name, fn) {
  total += 1;
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FAIL ${name}:`, error.stack || error);
  }
}
function code(fn, expected) {
  assert.throws(fn, (error) => error?.code === expected);
}

function timeline({
  aggregate = "agg-a",
  amount = 100,
  advisor = "advisor-1",
  policy = "policy-a",
  concept = "LIFE_INITIAL",
  period = "2026-08",
  adjustment = 0,
  reversal = 0
} = {}) {
  const estimated = C.createAdvisorCompensationEvent({
    eventId: `${aggregate}:1:ESTIMATED`, aggregateKey: aggregate, sequence: 1,
    previousEventId: null, state: "ESTIMATED", kind: "COMMISSION", concept,
    advisorReference: advisor, policyReference: policy, paymentEventId: `payment:${aggregate}`,
    periodKey: period, amount, currency: "MXN",
    calculation: { calculationDigest: "c".repeat(64) },
    ruleSnapshot: { rulePackDigest: "r".repeat(64), governanceStatus: "OFFICIAL" },
    evidenceReferences: [`calculation:${aggregate}`], sourceCalculationId: `calc:${aggregate}`,
    sourceCalculationDigest: "c".repeat(64), idempotencyKey: `idem:${aggregate}:1`,
    correlationId: `corr:${aggregate}`, createdAt: "2026-08-01T12:00:00.000Z"
  });
  const earned = C.createAdvisorCompensationEvent({
    eventId: `${aggregate}:2:EARNED`, aggregateKey: aggregate, sequence: 2,
    previousEventId: estimated.eventId, state: "EARNED", kind: "COMMISSION", concept,
    advisorReference: advisor, policyReference: policy, paymentEventId: `payment:${aggregate}`,
    periodKey: period, amount, currency: "MXN",
    calculation: estimated.calculation, ruleSnapshot: estimated.ruleSnapshot,
    evidenceReferences: [`payment:${aggregate}`], paymentEvidenceReference: `payment:${aggregate}`,
    evidenceHash: "e".repeat(64), humanDecisionId: `earned-decision:${aggregate}`,
    sourceCalculationId: `calc:${aggregate}`, sourceCalculationDigest: "c".repeat(64),
    idempotencyKey: `idem:${aggregate}:2`, correlationId: `corr:${aggregate}`,
    createdAt: "2026-08-02T12:00:00.000Z"
  });
  const events = [estimated, earned];
  let previous = earned;
  if (adjustment !== 0) {
    const adjusted = C.createAdvisorCompensationEvent({
      eventId: `${aggregate}:3:ADJUSTED`, aggregateKey: aggregate, sequence: 3,
      previousEventId: previous.eventId, state: "ADJUSTED", kind: "ADJUSTMENT",
      concept: "RATE_CORRECTION", advisorReference: advisor, policyReference: policy,
      paymentEventId: `payment:${aggregate}`, periodKey: period, amount: adjustment,
      currency: "MXN", calculation: estimated.calculation, ruleSnapshot: estimated.ruleSnapshot,
      evidenceReferences: [`adjustment:${aggregate}`], adjustedEventId: earned.eventId,
      sourceCalculationId: `calc:${aggregate}`, sourceCalculationDigest: "c".repeat(64),
      reason: "official correction", actorId: "actor-1",
      idempotencyKey: `idem:${aggregate}:3`, correlationId: `corr:${aggregate}`,
      createdAt: "2026-08-03T12:00:00.000Z"
    });
    events.push(adjusted);
    previous = adjusted;
  }
  if (reversal !== 0) {
    const sequence = events.length + 1;
    events.push(C.createAdvisorCompensationEvent({
      eventId: `${aggregate}:${sequence}:REVERSED`, aggregateKey: aggregate, sequence,
      previousEventId: previous.eventId, state: "REVERSED", kind: "REVERSAL",
      concept: "FULL_REVERSAL", advisorReference: advisor, policyReference: policy,
      paymentEventId: `payment:${aggregate}`, periodKey: period, amount: reversal,
      currency: "MXN", calculation: estimated.calculation, ruleSnapshot: estimated.ruleSnapshot,
      evidenceReferences: [`reversal:${aggregate}`], reversedEventId: previous.eventId,
      sourceCalculationId: `calc:${aggregate}`, sourceCalculationDigest: "c".repeat(64),
      reason: "official reversal", actorId: "actor-1",
      idempotencyKey: `idem:${aggregate}:${sequence}`, correlationId: `corr:${aggregate}`,
      createdAt: "2026-08-04T12:00:00.000Z"
    }));
  }
  return events;
}

function evidence({
  id = "statement-1",
  advisor = "advisor-1",
  sourceType = "OFFICIAL_STATEMENT",
  hash = "a".repeat(64),
  lines = [{ lineId: "line-1", paymentDate: "2026-08-31", amount: 100, currency: "MXN", policyReference: "policy-a", concept: "LIFE_INITIAL", carrierReference: "carrier-1" }],
  manualActorId,
  manualReason
} = {}) {
  return E.createAdvisorCompensationPayoutEvidence({
    evidenceId: id, advisorReference: advisor, sourceType,
    sourceAuthority: sourceType === "CONTROLLED_MANUAL" ? "HUMAN_CONTROLLED_ENTRY" : "CARRIER_STATEMENT",
    sourceReference: `source:${id}`, receivedAt: "2026-09-01T12:00:00.000Z",
    evidenceHash: hash, fileName: `${id}.pdf`, mimeType: "application/pdf",
    lines, manualActorId, manualReason
  });
}
function exactContext() {
  const events = timeline();
  const ev = evidence();
  const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
  const confirmation = H.createAdvisorCompensationPayoutConfirmation({
    proposal, decision: "CONFIRMED", humanDecisionId: "decision-1",
    actorId: "actor-1", reason: "statement reviewed", decidedAt: "2026-09-01T13:00:00.000Z"
  });
  return { events, evidence: ev, proposal, confirmation };
}

[
  ["evidence contract version", () => assert.equal(evidence().contractVersion, "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_001")],
  ["official statement accepted", () => assert.equal(evidence().sourceType, "OFFICIAL_STATEMENT")],
  ["carrier report accepted", () => assert.equal(evidence({ sourceType: "CARRIER_REPORT" }).sourceType, "CARRIER_REPORT")],
  ["receipt accepted", () => assert.equal(evidence({ sourceType: "RECEIPT" }).sourceType, "RECEIPT")],
  ["controlled manual accepted", () => assert.equal(evidence({ sourceType: "CONTROLLED_MANUAL", manualActorId: "a", manualReason: "recovery" }).sourceType, "CONTROLLED_MANUAL")],
  ["manual actor required", () => code(() => evidence({ sourceType: "CONTROLLED_MANUAL", manualReason: "x" }), "ADVISOR_COMPENSATION_CONTROLLED_MANUAL_AUTHORITY_REQUIRED")],
  ["manual reason required", () => code(() => evidence({ sourceType: "CONTROLLED_MANUAL", manualActorId: "a" }), "ADVISOR_COMPENSATION_CONTROLLED_MANUAL_AUTHORITY_REQUIRED")],
  ["evidence digest", () => assert.match(evidence().evidenceDigest, /^[a-f0-9]{64}$/)],
  ["evidence hash validated", () => code(() => evidence({ hash: "bad" }), "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_HASH_INVALID")],
  ["evidence frozen", () => assert(Object.isFrozen(evidence().lines))],
  ["line date normalized", () => assert.equal(evidence().lines[0].paymentDate, "2026-08-31")],
  ["line period derived", () => assert.equal(evidence().lines[0].periodKey, "2026-08")],
  ["line concept normalized", () => assert.equal(evidence({ lines: [{ lineId: "l", paymentDate: "2026-08-01", amount: 1, concept: "life_initial" }] }).lines[0].concept, "LIFE_INITIAL")],
  ["line currency normalized", () => assert.equal(evidence({ lines: [{ lineId: "l", paymentDate: "2026-08-01", amount: 1, currency: "mxn" }] }).lines[0].amount.currency, "MXN")],
  ["payment positive required", () => code(() => evidence({ lines: [{ lineId: "l", paymentDate: "2026-08-01", amount: -1 }] }), "ADVISOR_COMPENSATION_PAYOUT_PAYMENT_MUST_BE_POSITIVE")],
  ["reversal negative required", () => code(() => evidence({ lines: [{ lineId: "l", kind: "REVERSAL", paymentDate: "2026-08-01", amount: 1 }] }), "ADVISOR_COMPENSATION_PAYOUT_REVERSAL_MUST_BE_NEGATIVE")],
  ["adjustment signed accepted", () => assert.equal(evidence({ lines: [{ lineId: "l", kind: "ADJUSTMENT", paymentDate: "2026-08-01", amount: -5 }] }).lines[0].amount.value, -5)],
  ["duplicate line blocked", () => code(() => evidence({ lines: [{ lineId: "l", paymentDate: "2026-08-01", amount: 1 }, { lineId: "l", paymentDate: "2026-08-02", amount: 2 }] }), "ADVISOR_COMPENSATION_PAYOUT_LINE_ID_DUPLICATE")],
  ["intake does not create paid truth", () => assert.equal(evidence().safeguards.paidTruthCreated, false)],
  ["automatic confirmation false", () => assert.equal(evidence().safeguards.automaticConfirmation, false)],
  ["evidence validation passes", () => assert(E.validateAdvisorCompensationPayoutEvidence(evidence()).valid)]
].forEach(([name, fn]) => test(name, fn));

[
  ["exact match", () => assert.equal(exactContext().proposal.status, "EXACT")],
  ["exact earned event linked", () => assert.deepEqual(exactContext().proposal.matchedCompensationEventIds, ["agg-a:2:EARNED"])],
  ["exact expected amount", () => assert.equal(exactContext().proposal.expectedEarnedAmount, 100)],
  ["exact difference zero", () => assert.equal(exactContext().proposal.differenceAmount, 0)],
  ["human confirmation always required", () => assert.equal(exactContext().proposal.confirmationRequired, true)],
  ["grouped match", () => {
    const events = [...timeline({ aggregate: "agg-b", amount: 60, policy: "policy-b", concept: "GMM_INITIAL" }), ...timeline({ aggregate: "agg-c", amount: 40, policy: "policy-c", concept: "GMM_INITIAL" })];
    const ev = evidence({ lines: [{ lineId: "g", paymentDate: "2026-08-31", amount: 100, concept: "GMM_INITIAL" }] });
    const p = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    assert.equal(p.status, "GROUPED");
    assert.equal(p.matchedCompensationEventIds.length, 2);
  }],
  ["ambiguous match", () => {
    const events = [...timeline(), ...timeline({ aggregate: "agg-d", policy: "policy-d" })];
    const ev = evidence({ lines: [{ lineId: "a", paymentDate: "2026-08-31", amount: 100, concept: "LIFE_INITIAL" }] });
    const p = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    assert.equal(p.status, "AMBIGUOUS");
    assert.equal(p.candidateCompensationEventIds.length, 2);
  }],
  ["underpayment difference", () => {
    const ev = evidence({ lines: [{ lineId: "u", paymentDate: "2026-08-31", amount: 80, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    const p = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline() }).proposals[0];
    assert.equal(p.status, "DIFFERENCE");
    assert.equal(p.differenceType, "UNDERPAYMENT");
    assert.equal(p.differenceAmount, -20);
  }],
  ["overpayment difference", () => {
    const ev = evidence({ lines: [{ lineId: "o", paymentDate: "2026-08-31", amount: 120, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    const p = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline() }).proposals[0];
    assert.equal(p.differenceType, "OVERPAYMENT");
    assert.equal(p.differenceAmount, 20);
  }],
  ["unmatched payment", () => {
    const ev = evidence({ lines: [{ lineId: "x", paymentDate: "2026-08-31", amount: 100, policyReference: "missing" }] });
    assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline() }).proposals[0].status, "UNMATCHED");
  }],
  ["other advisor excluded", () => assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: evidence(), events: timeline({ advisor: "advisor-2" }) }).proposals[0].status, "UNMATCHED")],
  ["other period excluded", () => assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: evidence(), events: timeline({ period: "2026-09" }) }).proposals[0].status, "UNMATCHED")],
  ["adjustment net matched", () => {
    const ev = evidence({ lines: [{ lineId: "adj", paymentDate: "2026-08-31", amount: 120, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline({ adjustment: 20 }) }).proposals[0].status, "EXACT");
  }],
  ["fully reversed aggregate excluded", () => assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: evidence(), events: timeline({ reversal: -100 }) }).proposals[0].status, "UNMATCHED")],
  ["proposal digest", () => assert.match(exactContext().proposal.proposalDigest, /^[a-f0-9]{64}$/)],
  ["proposal cannot create paid truth", () => assert.equal(M.proposeAdvisorCompensationPayoutMatches({ evidence: evidence(), events: timeline() }).safeguards.paidTruthCreated, false)]
].forEach(([name, fn]) => test(name, fn));

[
  ["confirmation contract", () => assert.equal(exactContext().confirmation.contractVersion, "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_001")],
  ["confirmation human decision", () => assert.equal(exactContext().confirmation.safeguards.humanDecision, true)],
  ["confirmation automatic false", () => assert.equal(exactContext().confirmation.safeguards.automaticConfirmation, false)],
  ["confirmation digest", () => assert.match(exactContext().confirmation.confirmationDigest, /^[a-f0-9]{64}$/)],
  ["confirmation validation", () => {
    const c = exactContext();
    assert(H.validateAdvisorCompensationPayoutConfirmation(c.confirmation, c.proposal).valid);
  }],
  ["confirmation actor required", () => {
    const c = exactContext();
    code(() => H.createAdvisorCompensationPayoutConfirmation({ proposal: c.proposal, decision: "CONFIRMED", humanDecisionId: "d", reason: "x", decidedAt: "2026-09-01T00:00:00Z" }), "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_ACTOR_REQUIRED");
  }],
  ["confirmation reason required", () => {
    const c = exactContext();
    code(() => H.createAdvisorCompensationPayoutConfirmation({ proposal: c.proposal, decision: "CONFIRMED", humanDecisionId: "d", actorId: "a", decidedAt: "2026-09-01T00:00:00Z" }), "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_REASON_REQUIRED");
  }],
  ["rejected decision preserved", () => {
    const c = exactContext();
    assert.equal(H.createAdvisorCompensationPayoutConfirmation({ proposal: c.proposal, decision: "REJECTED", humanDecisionId: "reject", actorId: "a", reason: "wrong", decidedAt: "2026-09-01T00:00:00Z", selectedCompensationEventIds: [] }).decision, "REJECTED");
  }]
].forEach(([name, fn]) => test(name, fn));

[
  ["paid promotion creates payout record", () => assert.equal(R.promoteAdvisorCompensationEarnedToPaid(exactContext()).truthClass, "CONFIRMED_COMPENSATION_PAYOUT")],
  ["paid promotion amount", () => assert.equal(R.promoteAdvisorCompensationEarnedToPaid(exactContext()).amount.value, 100)],
  ["paid promotion evidence hash", () => assert.equal(R.promoteAdvisorCompensationEarnedToPaid(exactContext()).payoutEvidenceHash, "a".repeat(64))],
  ["paid promotion human decision", () => assert.equal(R.promoteAdvisorCompensationEarnedToPaid(exactContext()).humanDecisionId, "decision-1")],
  ["paid promotion metadata", () => assert.equal(R.promoteAdvisorCompensationEarnedToPaid(exactContext()).metadata.paidPromotion, true)],
  ["rejected promotion blocked", () => {
    const c = exactContext();
    const rejected = H.createAdvisorCompensationPayoutConfirmation({ proposal: c.proposal, decision: "REJECTED", humanDecisionId: "reject", actorId: "a", reason: "wrong", decidedAt: "2026-09-01T00:00:00Z", selectedCompensationEventIds: [] });
    code(() => R.promoteAdvisorCompensationEarnedToPaid({ ...c, confirmation: rejected }), "ADVISOR_COMPENSATION_PAYOUT_PROMOTION_REQUIRES_CONFIRMATION");
  }],
  ["unmatched promotion blocked", () => {
    const events = timeline();
    const ev = evidence({ lines: [{ lineId: "x", paymentDate: "2026-08-31", amount: 100, policyReference: "missing" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    code(() => H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "d", actorId: "a", reason: "x", decidedAt: "2026-09-01T00:00:00Z" }), "ADVISOR_COMPENSATION_PAYOUT_CONFIRMATION_MATCH_REQUIRED");
  }],
  ["negative promotion blocked", () => {
    const events = timeline();
    const ev = evidence({ lines: [{ lineId: "rev", kind: "REVERSAL", paymentDate: "2026-08-31", amount: -100, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    const confirmation = H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "rev-d", actorId: "a", reason: "reversal review", decidedAt: "2026-09-01T00:00:00Z" });
    code(() => R.promoteAdvisorCompensationEarnedToPaid({ evidence: ev, proposal, confirmation, events }), "ADVISOR_COMPENSATION_PAYOUT_PROMOTION_AMOUNT_MUST_BE_POSITIVE");
  }],
  ["ambiguous human selection promotes", () => {
    const events = [...timeline(), ...timeline({ aggregate: "agg-d", policy: "policy-d" })];
    const ev = evidence({ lines: [{ lineId: "a", paymentDate: "2026-08-31", amount: 100, concept: "LIFE_INITIAL" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    const confirmation = H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "amb-d", actorId: "a", reason: "selected policy-a after statement review", decidedAt: "2026-09-01T00:00:00Z", selectedCompensationEventIds: ["agg-a:2:EARNED"] });
    assert.equal(R.promoteAdvisorCompensationEarnedToPaid({ evidence: ev, proposal, confirmation, events }).matchedCompensationEventIds[0], "agg-a:2:EARNED");
  }]
].forEach(([name, fn]) => test(name, fn));

[
  ["matched reconciliation ready", () => {
    const c = exactContext();
    const record = R.promoteAdvisorCompensationEarnedToPaid(c);
    const report = R.reconcileAdvisorCompensationPayout({ evidence: c.evidence, proposals: [c.proposal], payoutRecords: [record], events: c.events, asOf: "2026-09-01T14:00:00Z" });
    assert.equal(report.status, "READY");
    assert.equal(report.items[0].type, "MATCHED");
  }],
  ["reconciliation totals", () => {
    const c = exactContext();
    const record = R.promoteAdvisorCompensationEarnedToPaid(c);
    assert.deepEqual(R.reconcileAdvisorCompensationPayout({ evidence: c.evidence, proposals: [c.proposal], payoutRecords: [record], events: c.events }).totals, { expectedEarned: 100, confirmedPaid: 100, difference: 0 });
  }],
  ["underpayment represented", () => {
    const events = timeline();
    const ev = evidence({ lines: [{ lineId: "u", paymentDate: "2026-08-31", amount: 80, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    const confirmation = H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "u-d", actorId: "a", reason: "confirmed partial payment", decidedAt: "2026-09-01T00:00:00Z" });
    const record = R.promoteAdvisorCompensationEarnedToPaid({ evidence: ev, proposal, confirmation, events });
    const report = R.reconcileAdvisorCompensationPayout({ evidence: ev, proposals: [proposal], payoutRecords: [record], events });
    assert.equal(report.items[0].type, "UNDERPAYMENT");
    assert.equal(report.totals.difference, -20);
  }],
  ["overpayment represented", () => {
    const events = timeline();
    const ev = evidence({ lines: [{ lineId: "o", paymentDate: "2026-08-31", amount: 120, policyReference: "policy-a", concept: "LIFE_INITIAL" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    const confirmation = H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "o-d", actorId: "a", reason: "confirmed excess payment", decidedAt: "2026-09-01T00:00:00Z" });
    const record = R.promoteAdvisorCompensationEarnedToPaid({ evidence: ev, proposal, confirmation, events });
    assert.equal(R.reconcileAdvisorCompensationPayout({ evidence: ev, proposals: [proposal], payoutRecords: [record], events }).items[0].type, "OVERPAYMENT");
  }],
  ["grouped payment represented", () => {
    const events = [...timeline({ aggregate: "agg-b", amount: 60, policy: "policy-b", concept: "GMM_INITIAL" }), ...timeline({ aggregate: "agg-c", amount: 40, policy: "policy-c", concept: "GMM_INITIAL" })];
    const ev = evidence({ lines: [{ lineId: "g", paymentDate: "2026-08-31", amount: 100, concept: "GMM_INITIAL" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events }).proposals[0];
    const confirmation = H.createAdvisorCompensationPayoutConfirmation({ proposal, decision: "CONFIRMED", humanDecisionId: "g-d", actorId: "a", reason: "grouped statement line", decidedAt: "2026-09-01T00:00:00Z" });
    const record = R.promoteAdvisorCompensationEarnedToPaid({ evidence: ev, proposal, confirmation, events });
    assert.equal(R.reconcileAdvisorCompensationPayout({ evidence: ev, proposals: [proposal], payoutRecords: [record], events }).items[0].type, "GROUPED_PAYMENT");
  }],
  ["missing commission represented", () => {
    const report = R.reconcileAdvisorCompensationPayout({ evidence: evidence(), proposals: [], payoutRecords: [], events: timeline() });
    assert(report.items.some((item) => item.type === "MISSING_COMMISSION"));
    assert.equal(report.status, "PARTIAL");
  }],
  ["retroactive difference represented", () => {
    const ev = evidence({ lines: [{ lineId: "retro", kind: "RETROACTIVE_DIFFERENCE", paymentDate: "2026-08-31", amount: 10, policyReference: "policy-a", concept: "RETROACTIVE_DIFFERENCE" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline() }).proposals[0];
    assert.equal(R.reconcileAdvisorCompensationPayout({ evidence: ev, proposals: [proposal], payoutRecords: [], events: timeline() }).items[0].type, "RETROACTIVE_DIFFERENCE");
  }],
  ["adjustment represented", () => {
    const events = timeline({ adjustment: 20 });
    assert(R.reconcileAdvisorCompensationPayout({ evidence: evidence(), proposals: [], payoutRecords: [], events }).items.some((item) => item.type === "ADJUSTMENT"));
  }],
  ["reversal evidence represented", () => {
    const ev = evidence({ lines: [{ lineId: "r", kind: "REVERSAL", paymentDate: "2026-08-31", amount: -10, policyReference: "policy-a" }] });
    const proposal = M.proposeAdvisorCompensationPayoutMatches({ evidence: ev, events: timeline() }).proposals[0];
    assert.equal(R.reconcileAdvisorCompensationPayout({ evidence: ev, proposals: [proposal], payoutRecords: [], events: timeline() }).items[0].type, "REVERSAL");
  }],
  ["disconnected paid is null", () => {
    const report = R.reconcileAdvisorCompensationPayout({ evidence: evidence(), proposals: [], payoutRecords: null, events: timeline(), sourceState: "DISCONNECTED" });
    assert.equal(report.totals.confirmedPaid, null);
    assert.equal(report.safeguards.unknownIsNotZero, true);
  }],
  ["report digest", () => assert.match(R.reconcileAdvisorCompensationPayout({ evidence: evidence(), proposals: [], payoutRecords: [], events: [] }).reportDigest, /^[a-f0-9]{64}$/)]
].forEach(([name, fn]) => test(name, fn));

[
  ["authority capabilities", () => assert.equal(A.createAdvisorCompensationPayoutAuthority().capabilities.paidPromotion, true)],
  ["authority automatic confirmation false", () => assert.equal(A.createAdvisorCompensationPayoutAuthority().capabilities.automaticConfirmation, false)],
  ["authority intake append", () => assert.equal(A.createAdvisorCompensationPayoutAuthority().intakeEvidence(evidence()).status, "APPENDED")],
  ["authority intake replay", () => {
    const authority = A.createAdvisorCompensationPayoutAuthority();
    const ev = evidence();
    authority.intakeEvidence(ev);
    assert.equal(authority.intakeEvidence(ev).status, "REPLAYED");
  }],
  ["authority intake conflict", () => {
    const authority = A.createAdvisorCompensationPayoutAuthority();
    authority.intakeEvidence(evidence());
    code(() => authority.intakeEvidence(evidence({ hash: "b".repeat(64) })), "ADVISOR_COMPENSATION_PAYOUT_EVIDENCE_ID_CONFLICT");
  }],
  ["authority full flow", () => {
    const authority = A.createAdvisorCompensationPayoutAuthority();
    const events = timeline();
    authority.intakeEvidence(evidence());
    const proposal = authority.proposeMatches({ evidenceId: "statement-1", events }).proposals[0];
    const confirmation = authority.confirmMatch({ proposalId: proposal.proposalId, decision: "CONFIRMED", humanDecisionId: "auth-d", actorId: "a", reason: "reviewed", decidedAt: "2026-09-01T00:00:00Z" }).confirmation;
    assert.equal(authority.promotePaid({ evidenceId: "statement-1", proposalId: proposal.proposalId, humanDecisionId: confirmation.humanDecisionId, events }).status, "PROMOTED_PAID");
    assert.equal(authority.listPayoutRecords("advisor-1").length, 1);
    assert.equal(authority.reconcile({ evidenceId: "statement-1", events }).totals.confirmedPaid, 100);
  }],
  ["authority promotion replay", () => {
    const authority = A.createAdvisorCompensationPayoutAuthority();
    const events = timeline();
    authority.intakeEvidence(evidence());
    const proposal = authority.proposeMatches({ evidenceId: "statement-1", events }).proposals[0];
    authority.confirmMatch({ proposalId: proposal.proposalId, decision: "CONFIRMED", humanDecisionId: "d", actorId: "a", reason: "reviewed", decidedAt: "2026-09-01T00:00:00Z" });
    authority.promotePaid({ evidenceId: "statement-1", proposalId: proposal.proposalId, humanDecisionId: "d", events });
    assert.equal(authority.promotePaid({ evidenceId: "statement-1", proposalId: proposal.proposalId, humanDecisionId: "d", events }).status, "REPLAYED");
  }],
  ["authority owner scoped list", () => assert.deepEqual(A.createAdvisorCompensationPayoutAuthority().listPayoutRecords("advisor-2"), [])],
  ["authority remote persistence false", () => assert.equal(A.createAdvisorCompensationPayoutAuthority().capabilities.remotePersistence, false)],
  ["authority external mutation false", () => assert.equal(A.createAdvisorCompensationPayoutAuthority().capabilities.externalMutation, false)]
].forEach(([name, fn]) => test(name, fn));

console.log(`MASTER_TEST_TOTAL=${total}`);
console.log(`MASTER_TEST_PASS=${passed}`);
console.log(`MASTER_TEST_FAIL=${total - passed}`);
console.log(`STAGE_090_COMPLETE=${passed === total ? "YES" : "NO"}`);
if (passed !== total) process.exitCode = 1;
